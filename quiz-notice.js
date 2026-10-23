// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* ============================================================================
   quiz-notice.js  —  assigned vocab quizzes (supabase/vocab-quizzes.sql) for
   a signed-in student.

   Course home (index.html): adds an "Assigned Quizzes" Quick Link. While a
   quiz is open and not yet turned in, the link glows and a notice card sits
   above the page's first card (same glow as the new-reward notice).
   Profile (profile.html): fills <div id="pfQuizzes"> with every quiz and the
   student's scores + missed questions.

   Uses the per-course session cache (ctf-sess-<course>) and the stored
   Supabase token. No session or no SQL = silent no-op.
   ========================================================================== */
(function () {
  function courseId() {
    if (window.CTF_COURSE) return window.CTF_COURSE;
    var m = location.pathname.match(/\/(cyber1|cyber2|cyber3|apcsp|web3)\//);
    return m ? m[1] : null;
  }
  var course = courseId(); if (!course) return;
  var sess = null; try { sess = JSON.parse(localStorage.getItem("ctf-sess-" + course)); } catch (e) {}
  if (!sess || !sess.studentId) return;
  var CACHE = "ctf-quizzes-" + course;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function when(ts) { return ts ? new Date(ts).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : ""; }
  function quizUrl(id) { return "../quiz.html?q=" + encodeURIComponent(id); }
  function token() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (/^sb-.*-auth-token$/.test(k)) { var v = JSON.parse(localStorage.getItem(k)); return v && (v.access_token || (v.currentSession && v.currentSession.access_token)); }
      }
    } catch (e) {}
    return null;
  }
  function fetchQuizzes() {
    var C = window.SUPABASE_CONFIG || {}, t = token();
    if (!C.url || !C.anonKey || !t) return Promise.resolve(null);
    return fetch(C.url + "/rest/v1/rpc/vq_my_quizzes", {
      method: "POST",
      headers: { apikey: C.anonKey, Authorization: "Bearer " + t, "Content-Type": "application/json" },
      body: JSON.stringify(fn === "ctf_raid_state" ? { p_student: sess.studentId, p_peek: true } : { p_student: sess.studentId })
    }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (!Array.isArray(d)) return null; try { localStorage.setItem(CACHE, JSON.stringify(d)); } catch (e) {} return d; })
      .catch(function () { return null; });
  }
  function cached() { try { return JSON.parse(localStorage.getItem(CACHE)) || null; } catch (e) { return null; } }
  // to do = open, attempts left, nothing turned in yet (or one in progress)
  function todo(list) { return (list || []).filter(function (q) { return q.status === "open" && (q.in_progress || (q.done === 0 && q.used < q.max_attempts)); }); }

  /* glow color = inverse of the page accent, same as the reward notice */
  function glowCss() {
    if (document.getElementById("vqCss")) return;
    var st = document.createElement("style"); st.id = "vqCss";
    st.textContent = "@keyframes vqGlow{0%,100%{box-shadow:0 0 0 0 color-mix(in oklch,var(--vqw) 0%,transparent)}50%{box-shadow:0 0 30px 5px color-mix(in oklch,var(--vqw) 80%,transparent)}}" +
      "@media (prefers-reduced-motion: reduce){.vqGlow{animation:none !important;box-shadow:0 0 0 3px var(--vqw) !important;}}" +
      ":root[data-motion=reduce] .vqGlow{animation:none !important;box-shadow:0 0 0 3px var(--vqw) !important;}";
    document.head.appendChild(st);
    function inv() {
      var r = document.documentElement, p = document.createElement("span");
      p.style.color = "var(--accent)"; p.style.display = "none"; document.body.appendChild(p);
      var m = getComputedStyle(p).color.match(/\d+(\.\d+)?/g); p.remove(); if (!m) return;
      var c = "rgb(" + (255 - +m[0]) + "," + (255 - +m[1]) + "," + (255 - +m[2]) + ")";
      r.style.setProperty("--vqw", c);
      r.style.setProperty("--vqw-bg", "color-mix(in oklch, " + c + " 12%, var(--panel))");
    }
    inv();
    new MutationObserver(inv).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  /* ---------------- course home ---------------- */
  function homeMount() {
    var first = document.querySelector("a.qlink");
    if (!first || !first.parentNode || document.getElementById("qlQuizzes")) return null;
    var a = document.createElement("a");
    a.className = "qlink"; a.id = "qlQuizzes"; a.href = "profile.html#pfQuizzes";
    a.setAttribute("style", first.getAttribute("style") || "");
    a.innerHTML = '<span style="flex:none;font-size:18px;line-height:1;">\u270e</span>' +
      '<span style="min-width:0;"><span style="display:block;font-weight:700;color:var(--bright);">Assigned Quizzes</span>' +
      '<span class="mono" id="qlQuizzesSub" style="display:block;font-size:11px;color:var(--dim);margin-top:2px;">Vocab quizzes \u00b7 scores</span></span>';
    var prof = document.getElementById("qlProfile");
    first.parentNode.insertBefore(a, prof ? prof.nextSibling : first);
    return a;
  }
  function homeShow(list, link) {
    var due = todo(list), old = document.getElementById("vqNotice"), sub = document.getElementById("qlQuizzesSub");
    if (!due.length) {
      link.classList.remove("vqGlow"); link.style.animation = ""; link.style.borderColor = "";
      if (sub) sub.textContent = "Vocab quizzes \u00b7 scores";
      if (old) old.remove(); return;
    }
    glowCss();
    var n = due.length;
    link.classList.add("vqGlow");
    link.style.animation = "vqGlow 1.8s ease-in-out infinite"; link.style.borderColor = "var(--vqw)";
    link.href = n === 1 ? quizUrl(due[0].id) : "profile.html#pfQuizzes";
    if (sub) sub.textContent = n + " to do";
    var q = due[0];
    var card = old || document.createElement("a");
    card.id = "vqNotice"; card.className = "card vqGlow"; card.href = n === 1 ? quizUrl(q.id) : "profile.html#pfQuizzes";
    card.setAttribute("style", "display:flex;align-items:center;gap:16px;flex-wrap:wrap;text-decoration:none;color:inherit;border-color:var(--vqw);background:var(--vqw-bg);animation:vqGlow 1.8s ease-in-out infinite;margin-bottom:18px;");
    card.innerHTML =
      '<span aria-hidden="true" style="flex:none;font-size:26px;line-height:1;color:var(--vqw);">\u270e</span>' +
      '<span style="min-width:0;flex:1;">' +
        '<span class="mono" style="display:block;font-size:12px;letter-spacing:1.5px;color:var(--bright);">// ASSIGNED QUIZ' + (n > 1 ? "ZES" : "") + '</span>' +
        '<span style="display:block;font-size:16px;font-weight:700;color:var(--bright);margin-top:4px;">' +
          (n > 1 ? "You have " + n + " vocab quizzes to take" : esc(q.title)) + '</span>' +
        '<span style="display:block;font-size:13px;color:var(--muted);margin-top:3px;">' +
          (n > 1 ? due.slice(0, 3).map(function (x) { return esc(x.title); }).join(", ") :
            q.questions + " questions" + (q.time_limit_min ? " \u00b7 " + q.time_limit_min + " min" : "") + (q.due_at ? " \u00b7 due " + esc(when(q.due_at)) : "") + (q.in_progress ? " \u00b7 in progress" : "")) +
        '</span>' +
      '</span>' +
      '<span class="mono" style="flex:none;font-size:12px;font-weight:700;color:var(--bright);border:1px solid var(--vqw);padding:8px 12px;border-radius:999px;">' + (n > 1 ? "SEE QUIZZES" : q.in_progress ? "RESUME QUIZ" : "TAKE QUIZ") + ' \u2192</span>';
    if (!old) {
      var firstCard = document.querySelector(".card:not(#vqNotice)");
      if (firstCard && firstCard.parentNode) firstCard.parentNode.insertBefore(card, firstCard);
    }
  }

  /* ---------------- profile ---------------- */
  function pfRender(list) {
    var box = document.getElementById("pfQuizzes"); if (!box || !list) return;
    if (!list.length) { box.innerHTML = ""; return; }
    var due = todo(list);
    var h = '<div class="card' + (due.length ? " vqGlow" : "") + '" style="padding:22px;margin-top:20px;' + (due.length ? "border-color:var(--vqw);animation:vqGlow 1.8s ease-in-out infinite;" : "") + '">' +
      '<div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:14px;">' +
        '<span class="mono" style="font-size:11px;letter-spacing:1.5px;color:var(--faint);">ASSIGNED QUIZZES</span>' +
        '<span class="mono" style="font-size:11px;color:var(--dim);">' + (due.length ? due.length + " to do" : "all caught up") + '</span></div>' +
      '<div style="display:flex;flex-direction:column;gap:10px;">';
    list.forEach(function (q) {
      var pct = q.best != null && q.total ? Math.round(q.best / q.total * 100) : null;
      var left = Math.max(q.max_attempts - q.used, 0), isDue = due.indexOf(q) !== -1;
      var state = q.in_progress ? "IN PROGRESS" : q.status === "not_yet" ? "OPENS " + when(q.opens_at).toUpperCase() :
        isDue ? "TO DO" : q.done ? "DONE" : q.status === "open" ? "OPEN" : "CLOSED";
      var col = isDue ? "var(--vqw)" : q.done ? "var(--accent)" : "var(--faint)";
      h += '<details style="border:1px solid ' + (isDue ? "var(--vqw)" : "var(--border2)") + ';border-radius:12px;background:var(--panel2);padding:14px 16px;">' +
        '<summary style="cursor:pointer;display:flex;align-items:center;gap:12px;flex-wrap:wrap;list-style:none;">' +
          '<span style="min-width:0;flex:1;"><span style="display:block;font-weight:700;color:var(--bright);font-size:15px;">' + esc(q.title) + '</span>' +
          '<span class="mono" style="display:block;font-size:11px;color:var(--dim);margin-top:3px;">' + q.questions + ' questions' + (q.time_limit_min ? ' \u00b7 ' + q.time_limit_min + ' min' : '') + ' \u00b7 ' + q.used + '/' + q.max_attempts + ' attempts' + (q.due_at ? ' \u00b7 due ' + esc(when(q.due_at)) : '') + '</span></span>' +
          (pct != null ? '<span class="mono" style="font-size:18px;font-weight:800;color:var(--bright);">' + q.best + '/' + q.total + ' <span style="font-size:12px;color:var(--accent);">' + pct + '%</span></span>' : '') +
          '<span class="mono" style="font-size:10px;font-weight:700;letter-spacing:1px;padding:4px 8px;border-radius:6px;border:1px solid ' + col + ';color:' + col + ';">' + esc(state) + '</span>' +
        '</summary>';
      (q.attempts || []).slice().reverse().forEach(function (a) {
        h += '<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border2);">' +
          '<div class="mono" style="font-size:12px;color:var(--bright);font-weight:700;">ATTEMPT ' + a.no + ' \u00b7 ' + a.score + '/' + a.total + ' <span style="color:var(--dim);font-weight:400;">\u00b7 ' + esc(when(a.submitted_at)) + '</span></div>';
        if (a.violation) h += '<div style="font-size:13px;color:var(--warn, #b7791f);font-weight:700;margin-top:6px;">Ended early: the quiz screen lost focus. Graded on the answers you had.</div>';
        if (a.missed && a.missed.length) {
          h += '<div style="font-size:12px;color:var(--dim);margin-top:8px;">Missed:</div><ul style="margin:4px 0 0;padding-left:18px;display:flex;flex-direction:column;gap:6px;font-size:13px;color:var(--text);">' +
            a.missed.map(function (m) { return '<li>' + esc(m.q) + ' <span style="color:var(--dim);">\u2014 you said: ' + (m.given ? esc(m.given) : "<i>blank</i>") + '</span></li>'; }).join("") + '</ul>';
        } else h += '<div style="font-size:13px;color:var(--accent);margin-top:6px;">Every question right.</div>';
        h += '</div>';
      });
      if (q.status === "open" && (q.in_progress || left > 0))
        h += '<div style="margin-top:12px;"><a href="' + quizUrl(q.id) + '" class="mono" style="display:inline-block;font-size:12px;font-weight:700;padding:9px 14px;border-radius:999px;border:1px solid ' + (isDue ? "var(--vqw)" : "var(--accent)") + ';color:var(--bright);text-decoration:none;">' +
          (q.in_progress ? "RESUME" : q.used ? "TRY AGAIN \u00b7 " + left + " LEFT" : "TAKE QUIZ") + ' \u2192</a></div>';
      h += '</details>';
    });
    box.innerHTML = h + '</div></div>';
    if (location.hash === "#pfQuizzes" && !pfRender._j) { pfRender._j = 1; window.scrollTo({ top: box.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" }); }
  }

  /* ---------------- daily progress check-in reminder (progress-grids.sql) ---------------- */
  function pgFetch() {
    var C = window.SUPABASE_CONFIG || {}, t = token();
    if (!C.url || !C.anonKey || !t) return Promise.resolve(null);
    return fetch(C.url + "/rest/v1/rpc/pg_my_grids", {
      method: "POST", headers: { apikey: C.anonKey, Authorization: "Bearer " + t, "Content-Type": "application/json" },
      body: JSON.stringify(fn === "ctf_raid_state" ? { p_student: sess.studentId, p_peek: true } : { p_student: sess.studentId })
    }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) { return Array.isArray(d) ? d : null; }).catch(function () { return null; });
  }
  function pgShow(list) {
    var due = (list || []).filter(function (g) { return g.is_open && !g.checked_in_today; }), old = document.getElementById("pgNotice");
    if (!due.length) { if (old) old.remove(); return; }
    glowCss();
    var g = due[0], tasks = g.tasks || [], en = g.entries || {};
    var done = tasks.filter(function (t) { return en[t.code] && en[t.code].status === "done"; }).length;
    var card = old || document.createElement("a");
    card.id = "pgNotice"; card.className = "card vqGlow"; card.href = "profile.html#pfProgress";
    card.setAttribute("style", "display:flex;align-items:center;gap:16px;flex-wrap:wrap;text-decoration:none;color:inherit;border-color:var(--vqw);background:var(--vqw-bg);animation:vqGlow 1.8s ease-in-out infinite;margin-bottom:18px;");
    card.innerHTML =
      '<span aria-hidden="true" style="flex:none;font-size:26px;line-height:1;color:var(--vqw);">\u25a6</span>' +
      '<span style="min-width:0;flex:1;">' +
        '<span class="mono" style="display:block;font-size:12px;letter-spacing:1.5px;color:var(--bright);">// DAILY CHECK-IN</span>' +
        '<span style="display:block;font-size:16px;font-weight:700;color:var(--bright);margin-top:4px;">Update your progress for today</span>' +
        '<span style="display:block;font-size:13px;color:var(--muted);margin-top:3px;">' + esc(g.title) + ' \u00b7 ' + done + '/' + tasks.length + ' done' + (g.due_at ? ' \u00b7 due ' + esc(when(g.due_at)) : '') + (due.length > 1 ? ' \u00b7 +' + (due.length - 1) + ' more' : '') + '</span>' +
      '</span>' +
      '<span class="mono" style="flex:none;font-size:12px;font-weight:700;color:var(--bright);border:1px solid var(--vqw);padding:8px 12px;border-radius:999px;">CHECK IN \u2192</span>';
    if (!old) {
      var anchor = document.getElementById("vqNotice") || document.querySelector(".card:not(#pgNotice)");
      if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(card, anchor.id === "vqNotice" ? anchor.nextSibling : anchor);
    }
  }

  /* ---------------- 25.1: live battle announcement (course home) ---------------- */
  function rpcRaw(fn) {
    var C = window.SUPABASE_CONFIG || {}, t = token();
    if (!C.url || !C.anonKey || !t) return Promise.resolve(null);
    return fetch(C.url + "/rest/v1/rpc/" + fn, { method: "POST", headers: { apikey: C.anonKey, Authorization: "Bearer " + t, "Content-Type": "application/json" }, body: JSON.stringify(fn === "ctf_raid_state" ? { p_student: sess.studentId, p_peek: true } : { p_student: sess.studentId }) })
      .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  function battleCheck() {
    Promise.all([rpcRaw("ctf_tb_state"), rpcRaw("ctf_vd_state"), rpcRaw("ctf_ad_state"), rpcRaw("ctf_br_state"), rpcRaw("ctf_raid_state"), rpcRaw("ctf_lobby_state")]).then(function (r) {
      var lb = r[5] && !r[5].error && r[5].lobby && !r[5].live ? r[5].lobby : null, LBN = { team: "Team Battle", vocab: "Vocab Battle", raid: "Boss Raid", bracket: "Duel Bracket" };
      var tb = r[0] && r[0].battle, vd = r[1], ad = r[2] && r[2].duel, br = r[3], b = null;
      var bm = br && br.bracket && br.bracket.status === "live" && br.match;
      var rd = r[4] && r[4].raid && r[4].raid.status === "live" ? r[4].raid : null;
      if (lb) b = { t: "// CLASS DUEL \u00b7 WAITING ROOM " + (lb.status === "counting" ? "\u00b7 STARTING NOW" : "OPEN"), h: (LBN[lb.kind] || "Class duel") + " starting soon", s: "Join the waiting room to see your team. Everyone goes in together when your teacher starts.", go: "JOIN", href: "../lobby.html?c=" + encodeURIComponent(course) };
      else if (rd) b = { t: "// BOSS RAID LIVE \u00b7 " + Math.round(rd.hp / Math.max(1, rd.hp_max) * 100) + "% HP LEFT", h: "The whole class vs the boss", s: "Every right answer is a hit. Wrong answers crack the class shield.", go: "JOIN RAID", href: "../raid-play.html?c=" + encodeURIComponent(course) };
      else if (bm && (bm.status === "ready" || bm.status === "live")) b = { t: "// BRACKET MATCH " + (bm.status === "ready" ? "READY" : "LIVE"), h: "You vs " + (bm.opp || "?"), s: bm.status === "ready" ? "Open the bracket page now. Missing for 60 seconds is a forfeit." : "Your match is on.", go: "BRACKET", href: "../bracket-play.html?c=" + encodeURIComponent(course) };
      else if (br && br.bracket && br.bracket.status === "live") b = { t: "// DUEL BRACKET LIVE", h: "You\u2019re in the bracket", s: "Stay on the bracket page so your next match can start.", go: "BRACKET", href: "../bracket-play.html?c=" + encodeURIComponent(course) };
      else if (tb && tb.status === "live") b = { t: "// TEAM BATTLE LIVE", h: "Your team needs you", s: "Enter the battle arena and capture flags to raise your team\u2019s score.", go: "ENTER ARENA", href: "ctf.html#arena" };
      else if (vd && vd.class_live && vd.session && vd.session.kind === "class" && vd.session.status === "live") b = { t: "// VOCAB BATTLE LIVE", h: "Your team needs you", s: "Open the duel room to get an opponent.", go: "FIGHT", href: "../vocab-duel.html?c=" + encodeURIComponent(course) };
      else if (ad && ad.status === "live") b = { t: "// FLAG DUEL LIVE", h: "Your duel is on", s: "Jump back into the arena before the clock runs out.", go: "ENTER ARENA", href: "ctf.html#arena" };
      else if (ad && ad.status === "lobby") b = { t: "// FLAG DUEL LOBBY", h: "You\u2019re in a duel lobby", s: "Waiting for the host to start.", go: "DUEL ROOM", href: "../arena-duel.html?c=" + encodeURIComponent(course) };
      var old = document.getElementById("bnNotice");
      if (!b) { if (old) old.remove(); setTimeout(battleCheck, 30000); return; }
      glowCss();
      var card = old || document.createElement("a");
      card.id = "bnNotice"; card.className = "card vqGlow"; card.href = b.href;
      card.setAttribute("style", "display:flex;align-items:center;gap:16px;flex-wrap:wrap;text-decoration:none;color:inherit;border:2px solid var(--vqw);background:var(--vqw-bg);animation:vqGlow 1.4s ease-in-out infinite;margin-bottom:18px;padding:20px 22px;");
      card.innerHTML = '<span aria-hidden="true" style="flex:none;font-size:30px;line-height:1;color:var(--vqw);">\u2694</span>' +
        '<span style="min-width:0;flex:1;"><span class="mono" style="display:block;font-size:12px;letter-spacing:1.5px;color:var(--bright);font-weight:700;">' + b.t + '</span>' +
        '<span style="display:block;font-size:18px;font-weight:700;color:var(--bright);margin-top:4px;">' + b.h + '</span>' +
        '<span style="display:block;font-size:13px;color:var(--muted);margin-top:3px;">' + b.s + '</span></span>' +
        '<span class="mono" style="flex:none;font-size:13px;font-weight:800;color:var(--bright);border:2px solid var(--vqw);padding:10px 16px;border-radius:999px;">' + b.go + ' \u2192</span>';
      if (!old) { var first = document.querySelector(".card:not(#bnNotice)"); if (first && first.parentNode) first.parentNode.insertBefore(card, first); }
      setTimeout(battleCheck, lb ? 6000 : 15000);
    });
  }

  function start() {
    var link = homeMount(), DATA = cached(), lastBox = null;
    if (DATA) glowCss();
    if (link && DATA) homeShow(DATA, link);
    // profile.js renders (and re-renders) its cards later; paint each new #pfQuizzes once
    function tryPf() { var b = document.getElementById("pfQuizzes"); if (b && b !== lastBox && DATA) { lastBox = b; pfRender(DATA); } }
    if (!link) { tryPf(); new MutationObserver(tryPf).observe(document.body, { childList: true, subtree: true }); }
    fetchQuizzes().then(function (d) {
      if (!d) return;
      DATA = d; glowCss();
      if (link) homeShow(d, link);
      else { lastBox = null; tryPf(); }
    });
    if (link) pgFetch().then(function (g) { if (g) pgShow(g); });
    if (link || /\/profile\.html$/.test(location.pathname)) battleCheck();   // 29.0: profile gets the call-outs too
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
