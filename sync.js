/* ============================================================================
   sync.js  —  Google-authenticated login gate + progress sync + cheat logging.

   The CTF page is the ONLY gated page on the platform. Everything else
   (landing, syllabus, vocab, news, profile) is open.

   Flow:
     1. Not signed in            -> "Sign in with Google" (school domain only).
     2. Signed in, no class yet  -> enter the class code the teacher gave you,
                                    then pick an anonymous handle (filtered).
     3. Already enrolled         -> straight in; progress merges from the server.

   Streaks are per course, so the session is stored per course. Cheat events
   are logged for teacher visibility and NEVER reduce a student's XP.
   ========================================================================== */
(function () {
  var CFG = window.SUPABASE_CONFIG || {};
  if (!CFG.url || !CFG.anonKey) return;                 // local-only mode
  var AUTH = window.CTF_AUTH; if (!AUTH) return;
  var API = window.CTF;
  if (!API || !API.course) return;
  var course = API.course;
  var SESS_KEY = "ctf-sess-" + course;

  var ART_ALL = window.CTF_GATE_ART || null;
  // Theatre is only available once we KNOW the class has the guide switched on.
  // Unknown (first visit, no cached gates) counts as off.
  function art() { return window.CTF_PERSONA === true ? ART_ALL : null; }
  var attempts = 0;                                     // drives the guide's escalation
  var NAMES = window.CTF_NAME || {};
  function handleProblem(v) { return NAMES.problem ? NAMES.problem(v) : null; }

  /* ---- local session cache (which student row am I, in this course) ------ */
  function loadSess() { try { return JSON.parse(localStorage.getItem(SESS_KEY)) || null; } catch (e) { return null; } }
  function saveSess(s) { try { localStorage.setItem(SESS_KEY, JSON.stringify(s)); } catch (e) {} }
  function clearSess() { try { localStorage.removeItem(SESS_KEY); } catch (e) {} }
  function localState() { try { return JSON.parse(localStorage.getItem(API.stateKey)) || {}; } catch (e) { return {}; } }
  function writeLocalState(s) { try { localStorage.setItem(API.stateKey, JSON.stringify(s)); } catch (e) {} }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---- merge server + local so a new device never loses progress -------- */
  function mergeObjMax(a, b) {
    var out = Object.assign({}, a || {});
    var src = b || {};
    Object.keys(src).forEach(function (k) {
      var av = out[k], bv = src[k];
      if (typeof av === "number" && typeof bv === "number") out[k] = Math.max(av, bv);
      else if (av === undefined || av === null || av === false) out[k] = bv;
    });
    return out;
  }
  function mergeStreak(a, b) {
    a = a || {}; b = b || {};
    var last = (String(a.last || "") >= String(b.last || "")) ? a.last : b.last;
    var newer = (String(a.last || "") >= String(b.last || "")) ? a : b;
    return { last: last || null, count: newer.count || 0, best: Math.max(a.best || 0, b.best || 0) };
  }
  function mergeState(local, server) {
    server = server || {};
    var m = Object.assign({}, server, local);
    m.solved  = mergeObjMax(local.solved,  server.solved);
    m.earned  = mergeObjMax(local.earned,  server.earned);
    m.retry   = mergeObjMax(local.retry,   server.retry);
    m.badges  = mergeObjMax(local.badges,  server.badges);
    m.streak  = mergeStreak(local.streak,  server.streak);
    m.points  = Math.max(local.points || 0, server.points || 0);
    m.bonus   = Math.max(local.bonus  || 0, server.bonus  || 0);
    return m;
  }

  /* ---- push ------------------------------------------------------------- */
  var syncing = false, pendingSync = false, syncTimer = null;
  async function pushProgress() {
    var sess = loadSess(); if (!sess) return;
    if (syncing) { pendingSync = true; return; }
    syncing = true;
    try {
      var st = localState();
      var stats = (API.stats && API.stats()) || {};
      var solved = Object.keys(st.solved || {}).filter(function (k) { return st.solved[k]; }).length;
      await AUTH.rpc("ctf_sync_google", {
        p_student: sess.studentId,
        p_points: st.points || 0, p_bonus: st.bonus || 0,
        p_solved: solved, p_total: stats.count || 0,
        p_state: st, p_streak: st.streak || {}, p_badges: st.badges || {}
      });
    } catch (e) { /* offline: keep playing, retry on the next solve */ }
    syncing = false;
    if (pendingSync) { pendingSync = false; scheduleSync(); }
  }
  function scheduleSync() { clearTimeout(syncTimer); syncTimer = setTimeout(pushProgress, 1200); }

  /* Gates: which modules/flags the teacher has opened, and whether the course
     guide is awake. Cached per course so a returning student sees the right
     arena instantly instead of a flash of everything-unlocked. */
  var GKEY = "ctf-gates-" + course;
  function applyGates(g) {
    if (!g || g.error) return;
    window.CTF_LOCKS = { modules: g.locked_modules || [], flags: g.locked_flags || [] };
    window.CTF_PERSONA = !!g.persona_on;
    try { localStorage.setItem("ctf-persona-" + course, g.persona_on ? "1" : "0"); } catch (e) {}
    try { localStorage.setItem(GKEY, JSON.stringify(g)); } catch (e) {}
  }
  function applyCachedGates() {
    try { applyGates(JSON.parse(localStorage.getItem(GKEY))); } catch (e) {}
  }
  function loadGates() {
    var sess = loadSess(); if (!sess) return;
    AUTH.rpc("ctf_gates", { p_class: sess.classId }).then(function (g) {
      var before = JSON.stringify(window.CTF_LOCKS || {}) + String(window.CTF_PERSONA);
      applyGates(g);
      var after = JSON.stringify(window.CTF_LOCKS || {}) + String(window.CTF_PERSONA);
      if (before !== after && API.rerender) API.rerender();
    }).catch(function () {});
  }

  /* Records "this student opened the arena today" so the teacher's login report
     shows real attendance even on a day where nothing was solved. Once a day is
     enough — the local guard keeps it to one call per device per day. */
  function touchDay() {
    var sess = loadSess(); if (!sess) return;
    var k = "ctf-day-" + course, today = new Date().toISOString().slice(0, 10);
    try { if (localStorage.getItem(k) === today) return; } catch (e) {}
    AUTH.rpc("ctf_touch_day", { p_student: sess.studentId })
      .then(function () { try { localStorage.setItem(k, today); } catch (e) {} })
      .catch(function () {});
  }

  /* ---- engine hooks ------------------------------------------------------ */
  window.CTF_CHEAT = function (kind, detail) {
    var sess = loadSess(); if (!sess) return;
    AUTH.rpc("ctf_cheat_google", { p_student: sess.studentId, p_kind: kind, p_detail: detail }).catch(function () {});
  };
  window.CTF_REPORT = function (p) {
    scheduleSync();
    if (!p || !p.challengeId) return;
    var sess = loadSess(); if (!sess) return;
    AUTH.rpc("ctf_flag_google", {
      p_student: sess.studentId,
      p_key: p.key || p.challengeId, p_challenge: p.challengeId,
      p_title: p.title || "", p_level: p.level || "",
      p_points: p.points || 0, p_secs: (p.secs == null ? -1 : p.secs),
      p_retries: p.retries || 0, p_tainted: !!p.tainted
    }).catch(function () {});
  };

  /* ---- identity chip on the stats card ----------------------------------- */
  function decorate() {
    var sess = loadSess(); if (!sess) return;
    try { localStorage.setItem(API.handleKey, sess.handle); } catch (e) {}
    var row = document.getElementById("ctfIdentity");
    if (!row || row.getAttribute("data-bound")) return;
    row.setAttribute("data-bound", "1");
    row.style.cssText = "display:flex;align-items:center;gap:10px;flex-wrap:wrap;";
    row.innerHTML =
      '<span class="mono" style="font-size:11px;letter-spacing:1px;color:var(--faint);">PLAYING AS</span>' +
      '<span style="font-weight:700;color:var(--bright);">' + esc(sess.handle) + '</span>' +
      '<span class="mono" style="font-size:11px;color:var(--dim);">' + esc(sess.className || "") + '</span>' +
      '<a class="mono" href="profile.html" style="font-size:11px;padding:4px 10px;border:1px solid var(--border2);border-radius:7px;">PROFILE</a>' +
      '<button id="ctfSignout" class="mono" style="margin-left:auto;font-size:11px;background:none;border:1px solid var(--border2);color:var(--dim);padding:4px 10px;border-radius:7px;cursor:pointer;">SIGN OUT</button>';
    var so = document.getElementById("ctfSignout");
    if (so) so.onclick = async function () {
      if (!confirm("Sign out? Your progress is saved to your school account — sign back in on any device to pick up where you left off.")) return;
      clearSess();
      try { await AUTH.signOut(); } catch (e) {}
      if (art()) art().lockdown(course, function () { location.reload(); });
      else location.reload();
    };
  }

  /* ---- gate overlay ------------------------------------------------------ */
  function shell(inner) {
    var wrap = document.getElementById("ctfGate");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "ctfGate";
      wrap.style.cssText = "position:fixed;inset:0;z-index:9998;background:rgba(4,7,12,.92);backdrop-filter:blur(7px);" +
        "display:flex;align-items:center;justify-content:center;padding:22px;overflow:auto;";
      document.body.appendChild(wrap);
    }
    var A = art();
    wrap.innerHTML = (A ? A.backdrop(course) : "") +
      '<div style="position:relative;width:min(430px,96vw);background:var(--panel,#0b1220);border:1px solid var(--border,#1e3350);' +
      'border-radius:16px;padding:28px;box-shadow:0 30px 80px -30px #000;">' + inner + '</div>';
    if (A) A.mount(course);
    return wrap;
  }
  function head(title, sub) {
    return '<div class="mono" style="font-size:11px;letter-spacing:2px;color:var(--faint,#5c6b7a);">SECURE TERMINAL // ACCESS</div>' +
      '<div style="font-size:22px;font-weight:800;color:var(--bright,#eaf2fb);margin:6px 0 4px;letter-spacing:-.3px;">' + title + '</div>' +
      '<div style="font-size:13px;color:var(--dim,#9fb0c0);line-height:1.55;margin-bottom:20px;">' + sub + '</div>';
  }
  function inputCss() {
    return "width:100%;padding:12px 14px;border-radius:10px;border:1px solid var(--border3,#244a6d);" +
      "background:var(--bg,#0a0e14);color:var(--bright,#eaf2fb);font-size:15px;outline:none;margin-bottom:4px;";
  }
  function field(label, html) {
    return '<div style="margin-bottom:14px;"><div class="mono" style="font-size:10px;letter-spacing:1.5px;color:var(--faint,#5c6b7a);margin-bottom:6px;text-transform:uppercase;">' +
      label + '</div>' + html + '</div>';
  }
  function primaryBtn(id, label) {
    return '<button id="' + id + '" style="width:100%;padding:13px;border:none;border-radius:10px;background:var(--accent,#3fb2ff);' +
      'color:#04121e;font-weight:800;font-size:14px;cursor:pointer;letter-spacing:.3px;">' + label + '</button>';
  }

  /* step 1 — google */
  function gateSignIn(msg) {
    var g = '<svg width="18" height="18" viewBox="0 0 48 48" style="vertical-align:-4px;margin-right:9px;">' +
      '<path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.1-3.8 6.6-9.4 6.6-16.3z"/>' +
      '<path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.2l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.3 15.5 46 24 46z"/>' +
      '<path fill="#FBBC05" d="M11.8 28.4c-.4-1.3-.7-2.7-.7-4.4s.3-3.1.7-4.4v-5.7H4.5C2.9 17.1 2 20.4 2 24s.9 6.9 2.5 10.1l7.3-5.7z"/>' +
      '<path fill="#EA4335" d="M24 10.7c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.1 29.9 2 24 2 15.5 2 8.1 6.7 4.5 13.9l7.3 5.7c1.7-5.2 6.5-9 12.2-9z"/></svg>';
    shell(
      (art() ? art().statusStrip(course) : "") +
      head("Sign in to play", "Use your <b style=\"color:var(--text,#cfe0f3)\">@" + AUTH.domain + "</b> school Google account. This is the only page that needs a sign-in.") +
      (art() ? art().guideBox(course) : "") +
      (msg ? '<div style="font-size:12px;color:var(--adv2,#ff6b6b);margin-bottom:12px;line-height:1.5;">' + msg + '</div>' : "") +
      '<button id="gGoogle" style="width:100%;padding:13px;border-radius:10px;border:1px solid var(--border3,#244a6d);' +
        'background:#fff;color:#1f2733;font-weight:700;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;">' +
        g + (art() ? art().buttonLabel(course) + ' with Google' : 'Sign in with Google') + '</button>' +
      '<div class="mono" style="font-size:10px;color:var(--faint,#5c6b7a);margin-top:14px;line-height:1.6;">' +
        'Your name stays private — you pick an anonymous handle after signing in. Signing in also carries your progress between devices.</div>'
    );
    // the guide speaks; escalates each time the student lands back here
    if (art()) art().typeLine(course, attempts++, msg ? art().wrongDomainLine(course) : null);
    document.getElementById("gGoogle").onclick = function () {
      this.disabled = true; this.textContent = "Opening Google\u2026";
      AUTH.signIn().catch(function () { gateSignIn("Couldn't reach Google. Check your connection."); });
    };
  }

  /* step 2 — class code + handle */
  function gateJoin(u) {
    var suggested = NAMES.suggest ? NAMES.suggest(course) : "";
    var T = NAMES.terms ? NAMES.terms(course) : { term: "Handle", eg: "NightOwl" };
    shell(
      head("Join your class", "Signed in as <b style=\"color:var(--text,#cfe0f3)\">" + esc(AUTH.emailOf(u)) + "</b>. Enter the class code your teacher gave you.") +
      (art() ? art().guideBox(course) : "") +
      field("Class code", '<input id="gCode" spellcheck="false" autocomplete="off" placeholder="e.g. CSP-P3-2K8R" style="' + inputCss() + 'text-transform:uppercase;letter-spacing:1px;">') +
      field(T.term, '<div style="display:flex;gap:8px;">' +
        '<input id="gHandle" spellcheck="false" autocomplete="off" maxlength="18" placeholder="e.g. ' + esc(T.eg) + '" style="' + inputCss() + 'margin-bottom:0;">' +
        '<button id="gDice" title="Suggest a name" style="padding:0 14px;border-radius:10px;border:1px solid var(--border3,#244a6d);background:var(--panel2,#0c1626);color:var(--dim,#9fb0c0);cursor:pointer;font-size:16px;">&#9860;</button></div>' +
        '<div id="gHandleMsg" class="mono" style="font-size:11px;min-height:15px;margin-top:6px;color:var(--faint,#5c6b7a);"></div>') +
      '<div id="gErr" style="min-height:18px;font-size:12px;color:var(--adv2,#ff6b6b);margin:2px 0 12px;"></div>' +
      primaryBtn("gGo", "JOIN CLASS") +
      '<button id="gOut" class="mono" style="width:100%;margin-top:10px;background:none;border:none;color:var(--faint,#5c6b7a);font-size:11px;cursor:pointer;">use a different account</button>'
    );
    var code = document.getElementById("gCode"), handle = document.getElementById("gHandle"),
        msg = document.getElementById("gHandleMsg"), err = document.getElementById("gErr"),
        go = document.getElementById("gGo");
    handle.value = suggested;
    if (art()) {
      var tt = art().theme(course);
      art().typeLine(course, 0, tt.kind === "adversary"
        ? "Signed in. Now pick a name I can put on the board."
        : "You're in. Pick a name for the leaderboard and let's start.");
    }
    function check() {
      var v = handle.value.trim();
      if (!v) { msg.textContent = ""; return false; }
      var p = handleProblem(v);
      msg.textContent = p || "\u2713 looks good";
      msg.style.color = p ? "var(--adv2,#ff6b6b)" : "var(--ok,#57d38c)";
      return !p;
    }
    check();
    handle.addEventListener("input", check);
    document.getElementById("gDice").onclick = function () { handle.value = NAMES.suggest ? NAMES.suggest(course) : ""; check(); };
    document.getElementById("gOut").onclick = async function () { await AUTH.signOut(); location.reload(); };
    [code, handle].forEach(function (elx) { elx.addEventListener("keydown", function (e) { if (e.key === "Enter") go.click(); }); });
    setTimeout(function () { code.focus(); }, 60);

    go.onclick = async function () {
      err.textContent = "";
      var c = code.value.trim();
      if (!c) return (err.textContent = "Enter your class code.");
      if (!check()) return (err.textContent = handleProblem(handle.value.trim()) || "Pick a name.");
      go.disabled = true; go.textContent = "JOINING\u2026";
      try {
        var d = await AUTH.rpc("ctf_join_google", { p_code: c, p_handle: handle.value.trim() });
        adopt(d, true);
      } catch (e) {
        var m = (e && (e.message || "")) + "";
        err.textContent =
          /class_not_found/.test(m) ? "No class with that code. Check with your teacher." :
          /handle_taken/.test(m)    ? "Someone in that class already uses that name." :
          /not_allowed/.test(m)     ? "Please choose a school-appropriate name." :
          /not_school_account/.test(m) ? "Use your @" + AUTH.domain + " account." :
          /not_signed_in/.test(m)   ? "Your sign-in expired — reload the page." :
                                      "Couldn't join. Check your connection.";
        go.disabled = false; go.textContent = "JOIN CLASS";
      }
    };
  }

  /* adopt a joined/resumed class: merge progress, cache session, drop the gate */
  function adopt(d, celebrate) {
    // the join response is the first moment persona state is knowable
    if (d && typeof d.persona_on === "boolean") {
      applyGates({ locked_modules: d.locked_modules || [], locked_flags: d.locked_flags || [],
                   persona_on: d.persona_on });
    }
    var server = (d.progress && d.progress.state) || null;
    var merged = mergeState(localState(), server || {});
    writeLocalState(merged);
    saveSess({ studentId: d.student_id, classId: d.class_id, course: d.course,
               className: d.class_name, handle: d.handle });
    function reveal() {
      if (ART_ALL) ART_ALL.unmount();
      var g = document.getElementById("ctfGate"); if (g) g.remove();
      if (API.rerender) API.rerender();
      decorate();
      scheduleSync();
      touchDay();
      loadGates();
    }
    // only celebrate an interactive sign-in, never a silent background resume
    if (celebrate && art()) art().granted(course, reveal); else reveal();
  }

  /* ---- boot -------------------------------------------------------------- */
  async function boot() {
    applyCachedGates();          // last known persona state, so a returning student keeps their guide
    // Already bound on this device? Show the arena immediately, verify quietly.
    var sess = loadSess();
    if (sess) { decorate(); scheduleSync(); touchDay(); loadGates(); }

    var u;
    try { u = await AUTH.requireSchool(); }
    catch (e) { return; }                       // network down: stay local, no gate

    if (u && u.wrongDomain) { clearSess(); return gateSignIn("That account isn't a @" + AUTH.domain + " address. Sign in with your school account."); }
    if (!u) { if (!sess) gateSignIn(); return; }

    // Signed in — reconcile with the classes this account actually belongs to.
    try {
      var mine = await AUTH.rpc("ctf_my_classes");
      var here = (mine || []).filter(function (m) { return m.course === course; })[0];
      if (!here) { clearSess(); return gateJoin(u); }
      if (!sess || sess.studentId !== here.student_id) {
        var full = await AUTH.rpc("ctf_join_google", { p_code: here.code, p_handle: here.handle });
        adopt(full, !sess);
      } else {
        saveSess(Object.assign(sess, { handle: here.handle, className: here.class_name }));
        decorate();
      }
    } catch (e) { /* offline: keep playing with the cached session */ }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  // the engine re-renders the stats card on every solve; re-apply the chip
  document.addEventListener("click", function () { setTimeout(decorate, 60); }, true);
})();
