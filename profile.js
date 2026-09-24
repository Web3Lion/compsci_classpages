// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* ============================================================================
   profile.js  —  student profile page: XP record, full badge case (locked
   badges greyed, earned badges in color), name change (filtered), and the
   course top-5 leaderboard (names only, no XP shown).

   Loads AFTER config.js + ctf.js + name-filter.js + supabase-config.js.
   ctf.js supplies the badge/stat math so the profile can never disagree with
   the arena. Works in local-only mode; the leaderboard needs Supabase.
   ========================================================================== */
(function () {
  var API = window.CTF || {};
  var course = window.CTF_COURSE || API.course || "cyber1";
  var CFG = window.SUPABASE_CONFIG || {};
  var ONLINE = !!(CFG.url && CFG.anonKey);  // narrowed below once auth.js is seen
  var T = (window.CTF_NAME || {}).terms ? window.CTF_NAME.terms(course) : { term: "Handle", eg: "NightOwl", blurb: "" };
  var SESS_KEY = "ctf-sess-" + course;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function el(id) { return document.getElementById(id); }
  function sess() { try { return JSON.parse(localStorage.getItem(SESS_KEY)) || null; } catch (e) { return null; } }
  function localName() { try { return localStorage.getItem(API.handleKey) || ""; } catch (e) { return ""; } }

  /* ---- backend (shared google-auth helper) ------------------------------- */
  var AUTH = window.CTF_AUTH || null;
  ONLINE = ONLINE && !!AUTH;

  /* ---- pieces ------------------------------------------------------------ */
  function header() {
    var s = sess();
    return '<div class="pfHead" style="display:flex;align-items:flex-end;gap:14px;flex-wrap:wrap;margin:0 0 22px;">' +
      '<div>' +
        '<div class="mono" style="font-size:11px;letter-spacing:2px;color:var(--faint);">OPERATOR RECORD</div>' +
        '<div style="font-size:28px;font-weight:800;color:var(--bright);letter-spacing:-.4px;line-height:1.1;margin-top:4px;">My Profile</div>' +
      '</div>' +
      '<div style="margin-left:auto;display:flex;gap:8px;align-items:center;">' +
        (s ? '<span class="mono" style="font-size:11px;color:var(--dim);">' + esc(s.className || "") + '</span>' : "") +
        '<a class="qlink mono taplink" href="ctf.html" style="font-size:12px;padding:9px 14px;border:1px solid var(--border3);border-radius:9px;color:var(--accent);">&larr; BACK TO ARENA</a>' +
      '</div>' +
    '</div>';
  }

  function identityCard() {
    var s = sess();
    var name = (s && s.handle) || localName();
    return '<div class="card" style="padding:22px;">' +
      '<div class="mono" style="font-size:11px;letter-spacing:1.5px;color:var(--faint);margin-bottom:12px;">' + esc(T.term.toUpperCase()) + '</div>' +
      '<div id="pfIdView" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">' +
        '<div style="font-size:26px;font-weight:800;color:var(--bright);letter-spacing:-.3px;">' +
          (name ? esc(name) : '<span style="color:var(--faint);font-weight:600;font-size:18px;">not set yet</span>') +
        '</div>' +
        '<button id="pfEdit" class="mono" style="font-size:11px;letter-spacing:.5px;background:none;border:1px solid var(--border3);color:var(--dim);padding:6px 14px;min-height:44px;border-radius:8px;cursor:pointer;">CHANGE</button>' +
      '</div>' +
      '<div id="pfIdEdit" style="display:none;max-width:420px;">' +
        '<div style="display:flex;gap:8px;">' +
          '<input id="pfName" class="mono" maxlength="18" spellcheck="false" autocomplete="off" placeholder="e.g. ' + esc(T.eg) + '" ' +
            'style="flex:1;padding:11px 13px;border-radius:9px;border:1px solid var(--border3);background:var(--bg);color:var(--bright);font-size:15px;outline:none;">' +
          '<button id="pfDice" title="Suggest a name" style="padding:0 13px;border-radius:9px;border:1px solid var(--border3);background:var(--panel2);color:var(--dim);cursor:pointer;font-size:15px;">&#9860;</button>' +
        '</div>' +
        '<div id="pfNameMsg" class="mono" style="font-size:11px;min-height:16px;margin:7px 0 4px;color:var(--faint);"></div>' +
        '<div style="display:flex;gap:8px;">' +
          '<button id="pfSave" class="mono" style="font-size:12px;font-weight:700;padding:9px 16px;border:none;border-radius:9px;background:var(--accent);color:#04121e;cursor:pointer;">SAVE</button>' +
          '<button id="pfCancel" class="mono" style="font-size:12px;padding:9px 14px;border:1px solid var(--border2);border-radius:9px;background:none;color:var(--dim);cursor:pointer;">CANCEL</button>' +
        '</div>' +
      '</div>' +
      '<div class="mono" style="font-size:11px;color:var(--faint);line-height:1.6;margin-top:12px;">' + esc(T.blurb) +
        (ONLINE && !s ? " Sign in on the arena page to save it to your class." : "") + '</div>' +
    '</div>';
  }

  function xpCard() {
    var st = API.getState ? API.getState() : {};
    var s = (API.stats && API.stats()) || { pts: 0, total: 0, solvedCount: 0, count: 0, rank: "", next: null };
    var flagXp = st.points || 0, bonusXp = st.bonus || 0;
    var vocabXp = (API.vocabXp && API.vocabXp()) || 0;
    var streak = st.streak || {};
    var pct = s.total ? Math.round(s.pts / s.total * 100) : 0;
    var line = function (k, v, col) {
      return '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px solid var(--border2);">' +
        '<span style="font-size:13px;color:var(--dim);">' + k + '</span>' +
        '<span class="mono" style="font-size:14px;font-weight:700;color:' + (col || "var(--text)") + ';">' + v + '</span></div>';
    };
    return '<div class="card" style="padding:22px;">' +
      '<div class="mono" style="font-size:11px;letter-spacing:1.5px;color:var(--faint);margin-bottom:14px;">XP RECORD</div>' +
      '<div style="display:flex;align-items:baseline;gap:10px;">' +
        '<div class="mono" style="font-size:40px;font-weight:800;color:var(--accent);line-height:1;">' + s.pts.toLocaleString() + '</div>' +
        '<div class="mono" style="font-size:12px;color:var(--dim);">/ ' + s.total.toLocaleString() + ' XP</div>' +
      '</div>' +
      '<div style="height:7px;border-radius:99px;background:var(--bg);border:1px solid var(--border2);margin:12px 0 4px;overflow:hidden;">' +
        '<div style="height:100%;width:' + pct + '%;background:var(--accent);"></div></div>' +
      '<div class="mono" style="font-size:11px;color:var(--faint);margin-bottom:14px;">' + pct + '% of all XP in this course</div>' +
      line("Rank", esc(s.rank || "\u2014"), "var(--bright)") +
      line("Flag XP", flagXp.toLocaleString()) +
      line("Daily bonus XP", (bonusXp >= 0 ? "+" : "") + bonusXp.toLocaleString(), bonusXp > 0 ? "var(--amber)" : (bonusXp < 0 ? "var(--bad, #ff6b6b)" : "var(--faint)")) +
      line("Vocab practice XP", "+" + vocabXp.toLocaleString(), vocabXp ? "var(--amber)" : "var(--faint)") +
      line("Flags captured", (s.solvedCount || 0) + " / " + (s.count || 0)) +
      line("Current streak", (streak.count || 0) + " day" + ((streak.count || 0) === 1 ? "" : "s"), streak.count ? "var(--amber)" : "var(--faint)") +
      line("Best streak", (streak.best || 0) + " day" + ((streak.best || 0) === 1 ? "" : "s")) +
    '</div>';
  }

  function xpLogCard() {
    var st = API.getState ? API.getState() : {};
    var log = (st.xpLog || []).slice().sort(function (a, b) { return b.ts - a.ts; }).slice(0, 50);
    var row = function (e) {
      var pos = e.delta >= 0;
      var d = new Date(e.ts);
      return '<div style="display:flex;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px solid var(--border2);">' +
        '<span class="mono" style="font-size:11px;color:var(--faint);white-space:nowrap;">' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '</span>' +
        '<span style="font-size:13px;color:var(--dim);flex:1;">' + esc(e.reason || "\u2014") + '</span>' +
        '<span class="mono" style="font-size:13px;font-weight:700;color:' + (pos ? "var(--ok, #3ecf8e)" : "var(--bad, #ff6b6b)") + ';white-space:nowrap;">' + (pos ? "+" : "") + e.delta + '</span></div>';
    };
    return '<div class="card" style="padding:22px;">' +
      '<div class="mono" style="font-size:11px;letter-spacing:1.5px;color:var(--faint);margin-bottom:14px;">XP LOG</div>' +
      (log.length
        ? log.map(row).join("")
        : '<div class="mono" style="font-size:12px;color:var(--faint);">No XP events logged yet \u2014 this fills in as you earn (or lose) XP going forward.</div>') +
    '</div>';
  }

  function badgeCase() {
    var defs = (API.badges && API.badges()) || [];
    var tierColor = API.tierColor || function () { return "var(--amber)"; };
    var totalTiers = defs.length * 3;
    var earned = defs.reduce(function (a, d) { return a + (d.tier || 0); }, 0);

    var tile = function (d) {
      var t = d.tier || 0;
      var on = t > 0;
      var col = on ? tierColor(t) : "var(--faint)";
      var cur = on ? d.tiers[t - 1].label : "LOCKED";
      var next = d.tiers[t];
      var prevNeed = on ? d.tiers[t - 1].need : 0;
      var goal = next ? next.need : d.tiers[d.tiers.length - 1].need;
      var pct = next ? Math.max(0, Math.min(100, Math.round((d.value - prevNeed) / Math.max(1, goal - prevNeed) * 100))) : 100;
      var pips = d.tiers.map(function (tr, i) {
        var got = t > i;
        return '<div title="' + esc(tr.label) + ' \u00b7 needs ' + tr.need + '" style="flex:1;height:4px;border-radius:99px;background:' +
          (got ? tierColor(i + 1) : "var(--border2)") + ';"></div>';
      }).join("");
      return '<div style="padding:16px;border-radius:12px;border:1px solid ' + (on ? col + "55" : "var(--border2)") + ';' +
        'background:' + (on ? "linear-gradient(160deg," + col + "14,var(--bg) 65%)" : "var(--bg)") + ';' +
        (on ? "" : "opacity:.62;filter:saturate(.15);") + '">' +
        '<div style="display:flex;align-items:center;gap:9px;">' +
          '<div style="font-size:22px;line-height:1;color:' + col + ';' + (on ? "" : "filter:grayscale(1);") + '">' + d.glyph + '</div>' +
          '<div style="min-width:0;">' +
            '<div style="font-size:14px;font-weight:700;color:' + (on ? "var(--bright)" : "var(--dim)") + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(d.name) + '</div>' +
            '<div class="mono" style="font-size:10px;letter-spacing:.8px;color:' + col + ';text-transform:uppercase;">' + esc(cur) + '</div>' +
          '</div>' +
          (on ? '<div class="mono" style="margin-left:auto;font-size:10px;font-weight:700;color:' + col + ';">' + t + '/3</div>' : '') +
        '</div>' +
        '<div style="display:flex;gap:3px;margin:12px 0 8px;">' + pips + '</div>' +
        '<div style="height:5px;border-radius:99px;background:var(--panel2);overflow:hidden;">' +
          '<div style="height:100%;width:' + pct + '%;background:' + col + ';"></div></div>' +
        '<div class="mono" style="font-size:10px;color:var(--faint);margin-top:7px;">' +
          (next ? d.value + " / " + next.need + " \u2192 " + esc(next.label) : "MAX \u00b7 " + d.value) + '</div>' +
      '</div>';
    };

    return '<div class="card" style="padding:22px;margin-top:20px;">' +
      '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:6px;">' +
        '<div class="mono" style="font-size:11px;letter-spacing:1.5px;color:var(--faint);">BADGE CASE</div>' +
        '<div class="mono" style="font-size:11px;color:var(--dim);">' + earned + ' / ' + totalTiers + ' tiers earned</div>' +
      '</div>' +
      '<div class="mono" style="font-size:11px;color:var(--faint);margin-bottom:16px;">Every badge in the course. Greyed out until you earn its first tier.</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(215px,100%),1fr));gap:12px;">' + defs.map(tile).join("") + '</div>' +
    '</div>';
  }

  /* ---- objective map ------------------------------------------------------
     Hidden unless the teacher turned it on for this class, and strictly the
     signed-in student's own data — the RPC is scoped to the caller and returns
     { on:false } while the switch is off. Mastery here is the same rule the
     teacher sees, so the two views can never disagree. */
  function objectiveCard() {
    return '<div id="pfObjWrap"></div>';
  }
  function objState(st) {
    return st === "mastered" ? "var(--ok)" : st === "shaky" ? "var(--warn)" : "var(--border3)";
  }
  async function loadObjectives() {
    var box = el("pfObjWrap"); if (!box) return;
    var s = sess();
    if (!ONLINE || !s || !window.OBJECTIVES) return;
    var d;
    try { d = await AUTH.rpc("ctf_my_captures", { p_student: s.studentId }); }
    catch (e) { return; }
    if (!d || d.error || !d.on) return;

    var idx = OBJECTIVES.index(course);
    if (!idx || !idx.objectives.length) return;

    var got = {};
    (d.captures || []).forEach(function (c) {
      got[c.flag_key] = { tainted: !!c.tainted, wrong_tries: Number(c.wrong_tries) || 0 };
    });
    var rep = OBJECTIVES.report(idx, got);
    var done = rep.filter(function (r) { return r.state === "mastered"; });
    var part = rep.filter(function (r) { return r.state === "shaky"; });
    var open = rep.filter(function (r) { return r.state === "untouched"; });

    var chips = function (list) {
      return '<div style="display:flex;flex-wrap:wrap;gap:6px;">' + list.map(function (r) {
        return '<span style="display:flex;align-items:center;gap:7px;padding:5px 11px;border:1px solid var(--border2);' +
          'border-radius:99px;font-size:12px;color:var(--text);">' +
          '<span style="width:8px;height:8px;border-radius:99px;background:' + objState(r.state) + ';flex:none;"></span>' +
          esc(r.name) + '<span class="mono" style="font-size:10px;color:var(--faint);">' + r.cleared + '/' + r.total + '</span></span>';
      }).join("") + '</div>';
    };
    var group = function (label, list, col) {
      if (!list.length) return "";
      return '<div style="margin-top:16px;">' +
        '<div class="mono" style="font-size:11px;letter-spacing:1.5px;color:' + col + ';margin-bottom:8px;">' +
          label + ' (' + list.length + ')</div>' + chips(list) + '</div>';
    };

    var pct = rep.length ? Math.round(done.length / rep.length * 100) : 0;
    box.innerHTML = '<div class="card" style="padding:22px;margin-top:20px;">' +
      '<div class="mono" style="font-size:11px;letter-spacing:1.5px;color:var(--faint);margin-bottom:6px;">OBJECTIVE MAP</div>' +
      '<div class="mono" style="font-size:11px;color:var(--faint);margin-bottom:14px;line-height:1.6;">' +
        'What you\u2019ve shown you know, not what you\u2019ve scored. An objective counts as mastered once you\u2019ve ' +
        'cleared every flag under it \u2014 including the hard one \u2014 without a long guessing streak.</div>' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:4px;">' +
        '<span style="flex:1;height:9px;border-radius:99px;background:var(--bg2);overflow:hidden;display:block;">' +
          '<span style="display:block;height:100%;width:' + pct + '%;background:var(--ok);"></span></span>' +
        '<b class="mono" style="font-size:13px;color:var(--bright);white-space:nowrap;">' + done.length + ' / ' + rep.length + '</b></div>' +
      group("MASTERED", done, "var(--ok)") +
      group("KEEP GOING", part, "var(--warn)") +
      group("NOT STARTED", open, "var(--faint)") +
    '</div>';
  }

  function leaderboardCard() {
    return '<div class="card" style="padding:22px;margin-top:20px;">' +
      '<div class="mono" style="font-size:11px;letter-spacing:1.5px;color:var(--faint);margin-bottom:6px;">TOP 5 \u00b7 XP LEADERBOARD</div>' +
      '<div class="mono" style="font-size:11px;color:var(--faint);margin-bottom:14px;">Highest XP in your class. Scores stay private \u2014 only ' + esc(T.term.toLowerCase()) + 's are shown.</div>' +
      '<div id="pfLb"></div>' +
    '</div>';
  }

  function renderLb(rows, mine) {
    var box = el("pfLb"); if (!box) return;
    if (!rows || !rows.length) { box.innerHTML = '<div class="mono" style="font-size:12px;color:var(--faint);">No scores in your class yet. Be first.</div>'; return; }
    var medal = ["\u2460", "\u2461", "\u2462", "\u2463", "\u2464"];
    box.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px;">' + rows.map(function (r, i) {
      var you = mine && String(r.handle).toLowerCase() === String(mine).toLowerCase();
      var col = i === 0 ? "var(--amber)" : i === 1 ? "#c3d0de" : i === 2 ? "#cd8a3c" : "var(--dim)";
      return '<div style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:10px;background:var(--bg);' +
        'border:1px solid ' + (you ? "var(--accent)" : "var(--border2)") + ';">' +
        '<span class="mono" style="font-size:17px;font-weight:800;color:' + col + ';width:20px;">' + medal[i] + '</span>' +
        '<span style="font-weight:700;color:var(--bright);font-size:14px;">' + esc(r.handle) + '</span>' +
        (you ? '<span class="mono" style="margin-left:auto;font-size:10px;letter-spacing:1px;color:var(--accent);">YOU</span>' : "") +
      '</div>';
    }).join("") + '</div>';
  }

  async function loadLb() {
    var box = el("pfLb"); if (!box) return;
    var s = sess();
    if (!ONLINE || !s) {
      box.innerHTML = '<div class="mono" style="font-size:12px;color:var(--faint);line-height:1.6;">' +
        (ONLINE ? "Sign in on the arena page to see your class leaderboard." : "Leaderboard turns on once your teacher connects the class backend.") + '</div>';
      return;
    }
    box.innerHTML = '<span class="spin"></span>';
    try {
      renderLb(await AUTH.rpc("ctf_leaderboard_google", { p_class: s.classId }) || [], s.handle);
    } catch (e) {
      box.innerHTML = '<div class="mono" style="font-size:12px;color:var(--faint);">Couldn\'t load the leaderboard right now.</div>';
    }
  }

  /* ---- name editing ------------------------------------------------------ */
  function wireIdentity() {
    var view = el("pfIdView"), edit = el("pfIdEdit"), input = el("pfName"), msg = el("pfNameMsg");
    if (!view || !edit) return;
    var s = sess();
    var problem = (window.CTF_NAME || {}).problem || function () { return null; };

    function show(on) { view.style.display = on ? "none" : "flex"; edit.style.display = on ? "block" : "none"; if (on) { input.value = (s && s.handle) || localName(); input.focus(); check(); } }
    function check() {
      var v = input.value.trim();
      if (!v) { msg.textContent = ""; return false; }
      var p = problem(v);
      msg.textContent = p || "\u2713 looks good";
      msg.style.color = p ? "var(--adv2,#ff6b6b)" : "var(--ok,#57d38c)";
      return !p;
    }
    el("pfEdit").onclick = function () { show(true); };
    el("pfCancel").onclick = function () { show(false); };
    el("pfDice").onclick = function () { input.value = (window.CTF_NAME || {}).suggest ? window.CTF_NAME.suggest(course) : ""; check(); };
    input.addEventListener("input", check);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") el("pfSave").click(); });

    el("pfSave").onclick = async function () {
      if (!check()) { if (!input.value.trim()) { msg.textContent = "Enter a name."; msg.style.color = "var(--adv2,#ff6b6b)"; } return; }
      var v = input.value.trim();
      var btn = this; btn.disabled = true; btn.textContent = "SAVING\u2026";
      try {
        if (ONLINE && s) {
          var d = await AUTH.rpc("ctf_rename_google", { p_student: s.studentId, p_handle: v });
          s.handle = (d && d.handle) || v;
          localStorage.setItem(SESS_KEY, JSON.stringify(s));
        }
        try { localStorage.setItem(API.handleKey, v); } catch (e) {}
        location.reload();
      } catch (e) {
        var m = (e && (e.message || "")) + "";
        msg.style.color = "var(--adv2,#ff6b6b)";
        msg.textContent = /not_yours|not_signed_in/.test(m) ? "Sign in on the arena page first."
          : /handle_taken/.test(m) ? "Someone in your class already uses that name."
          : /not_allowed/.test(m) ? "Please choose a school-appropriate name."
          : "Couldn't save. Check your connection.";
        btn.disabled = false; btn.textContent = "SAVE";
      }
    };
  }

  /* ---- reward items (reward-items.sql) ------------------------------------ */
  var G = { timed: "var(--amber)", help: "var(--accent)", boss: "var(--adv2,#ff6b6b)", mult: "var(--amber)", surprise: "var(--accent2)" };
  var ITEM_META = {
    xp2x:       { tag: "2\u00d7",   col: G.timed,    type: "timed",  done: "ACTIVATED", desc: "Every flag you capture pays double XP for 24 hours." },
    freeze:     { tag: "\u2744",    col: "var(--accent2)", type: "timed", done: "ACTIVATED", desc: "For 7 days, missed school days won't break your login streak." },
    timefreeze: { tag: "\u275a\u275a", col: G.help,  type: "timed",  done: "ACTIVATED", desc: "For 10 minutes, every flag pays full XP with no time decay." },
    squad:      { tag: "1.5\u00d7", col: G.mult,     type: "timed",  done: "ACTIVATED", desc: "Everyone in your squad earns 1.5\u00d7 XP for 1 hour. No squad? It boosts just you." },
    hint:       { tag: "?",         col: G.help,     type: "charge", done: "ARMED", desc: "Your next hint reveal on the CTF page costs no XP." },
    retry:      { tag: "\u21ba",    col: G.help,     type: "charge", done: "ARMED", desc: "Your next capture on a flag you missed pays full XP, ignoring the retry cap." },
    cooldown:   { tag: "\u00bb",    col: G.help,     type: "charge", done: "ARMED", desc: "Your next wrong-answer lockout is skipped so you can try again right away." },
    shield:     { tag: "\u25c8",    col: G.boss,     type: "charge", done: "ARMED", desc: "In your next boss fight, the first wrong answer does no damage." },
    overclock:  { tag: "OC",        col: G.boss,     type: "charge", done: "ARMED", desc: "In your next boss fight, your first 5 answers deal double damage." },
    extralife:  { tag: "+HP",       col: G.boss,     type: "charge", done: "ARMED", desc: "Start your next boss fight with 125 integrity instead of 100." },
    lucky:      { tag: "3\u00d7",   col: G.mult,     type: "charge", done: "ARMED", desc: "Your next flag capture pays 3\u00d7 XP." },
    pioneer:    { tag: "P\u00d72",  col: G.mult,     type: "charge", done: "ARMED", desc: "Your next first-to-solve Pioneer bonus is doubled." },
    xp500:      { tag: "+500",      col: "var(--accent)", type: "instant", done: "CLAIMED", desc: "Adds 500 XP to your score the moment you claim it." },
    mystery:    { tag: "???",       col: G.surprise, type: "instant", done: "OPENED", desc: "Opens into a random in-game item. Never a classroom prize." },
    voucher:    { tag: "\u2605",    col: "var(--bright)", type: "instant", done: "REDEEMED", desc: "A classroom prize. Show it to your teacher, then mark it redeemed." }
  };
  function meta(k) { return ITEM_META[k] || ITEM_META.voucher; }
  function verb(k) { var t = meta(k).type; return k === "voucher" ? "Redeem" : k === "mystery" ? "Open" : k === "xp500" ? "Claim" : t === "charge" ? "Arm" : "Activate"; }
  var ITEMS = [], itemTick = null;
  function itemsCard() { return '<div id="pfItems"></div>'; }
  function fmtLeft(ms) {
    var s = Math.max(0, Math.floor(ms / 1000)), d = Math.floor(s / 86400); s -= d * 86400;
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    return (d ? d + "d " : "") + pad(h) + ":" + pad(m) + ":" + pad(x);
  }
  function fmtEnd(t) { return new Date(t).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" }); }
  function activeRun(kind) {
    var now = Date.now(), end = 0, start = Infinity, from = null;
    ITEMS.forEach(function (it) {
      if (it.kind !== kind || !it.expires_at) return;
      var e = Date.parse(it.expires_at); if (e <= now) return;
      end = Math.max(end, e); start = Math.min(start, Date.parse(it.starts_at));
      if (it.shared) from = it.from_handle;
    });
    return end && start <= now ? { end: end, from: from } : null;
  }
  function spent() { var st = API.getState ? API.getState() : {}; return (st && st.itemSpent) || {}; }
  function itemCss() {
    if (document.getElementById("pfItemCss")) return;
    var st = document.createElement("style"); st.id = "pfItemCss";
    st.textContent = "@keyframes pfPop{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}" +
      "@keyframes pfShake{0%,100%{transform:rotate(0)}20%{transform:rotate(-9deg)}40%{transform:rotate(8deg)}60%{transform:rotate(-6deg)}80%{transform:rotate(5deg)}}" +
      "@keyframes pfGlow{0%,100%{box-shadow:0 0 0 0 transparent}50%{box-shadow:0 0 34px 4px currentColor}}";
    document.head.appendChild(st);
  }
  function tagBox(k, size) {
    var mt = meta(k); size = size || 40;
    return '<span class="mono" style="flex:none;min-width:' + size + 'px;height:' + size + 'px;padding:0 6px;border-radius:' + Math.round(size / 4) + 'px;display:flex;align-items:center;justify-content:center;' +
      'font-weight:800;font-size:' + Math.round(size * 0.34) + 'px;color:' + mt.col + ';border:1px solid ' + mt.col + ';">' + mt.tag + '</span>';
  }
  function renderItems() {
    var box = el("pfItems"); if (!box) return;
    itemCss();
    var sp = spent();
    var mine = ITEMS.filter(function (it) { return !it.shared; });
    var unused = mine.filter(function (it) { return !it.used_at; });
    var armed = {};
    mine.forEach(function (it) { if (it.used_at && !it.consumed_at && !it.expires_at && meta(it.kind).type === "charge" && !sp[it.id]) armed[it.kind] = (armed[it.kind] || 0) + 1; });
    var used = mine.filter(function (it) { return it.used_at; }).slice(0, 8);
    var act = [["xp2x", "2\u00d7 XP ACTIVE"], ["squad", "SQUAD SURGE ACTIVE"], ["timefreeze", "TIME FREEZE ACTIVE"], ["freeze", "STREAK FROZEN"]]
      .map(function (a) { var r = activeRun(a[0]); return r ? { kind: a[0], title: a[1], end: r.end, from: r.from } : null; })
      .filter(Boolean);

    var h = '<div class="card" style="padding:22px;margin-top:20px;">' +
      '<div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:14px;">' +
        '<span class="mono" style="font-size:11px;letter-spacing:1.5px;color:var(--faint);">ITEMS</span>' +
        '<span class="mono" style="font-size:11px;color:var(--dim);">' + unused.length + ' ready to use</span>' +
      '</div>';

    if (act.length) {
      h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;margin-bottom:16px;">' +
        act.map(function (a) {
          var mt = meta(a.kind);
          return '<div style="padding:16px 18px;border:1px solid ' + mt.col + ';border-radius:12px;background:var(--panel2);">' +
            '<div class="mono" style="font-size:11px;letter-spacing:1.5px;color:' + mt.col + ';font-weight:700;">' + a.title + '</div>' +
            '<div class="mono" data-until="' + a.end + '" style="font-size:30px;font-weight:800;color:var(--bright);margin:6px 0 4px;letter-spacing:-.5px;">' + fmtLeft(a.end - Date.now()) + '</div>' +
            '<div style="font-size:12px;color:var(--dim);line-height:1.5;">' + esc(mt.desc) + (a.from ? ' Started by ' + esc(a.from) + '.' : '') + ' Ends ' + esc(fmtEnd(a.end)) + '.</div>' +
          '</div>';
        }).join("") + '</div>';
    }

    var ak = Object.keys(armed);
    if (ak.length) {
      h += '<div class="mono" style="font-size:10px;letter-spacing:1.5px;color:var(--faint);margin:4px 0 8px;">ARMED \u00b7 TRIGGERS AUTOMATICALLY ON THE CTF PAGE</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">' + ak.map(function (k) {
          var mt = meta(k);
          return '<span title="' + esc(mt.desc) + '" style="display:flex;align-items:center;gap:8px;padding:6px 12px 6px 6px;border:1px solid ' + mt.col + ';border-radius:99px;font-size:12px;color:var(--text);">' +
            tagBox(k, 26) + esc(_reward(k)) + (armed[k] > 1 ? ' <b class="mono" style="color:' + mt.col + ';">\u00d7' + armed[k] + '</b>' : '') + '</span>';
        }).join("") + '</div>';
    }

    if (!unused.length && !act.length && !ak.length) {
      h += '<div class="mono" style="font-size:12px;color:var(--faint);line-height:1.6;">No items yet. Rewards from your teacher, the class spinner, and loot drops show up here.</div>';
    } else if (unused.length) {
      h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;">' +
        unused.map(function (it) {
          var mt = meta(it.kind);
          var src = it.source === "spinner" ? "Spinner prize" : it.source === "loot" ? "Loot drop" : it.source === "mystery" ? "Mystery Box" : "From your teacher";
          return '<div style="display:flex;flex-direction:column;gap:10px;padding:14px;border:1px solid var(--border2);border-radius:12px;background:var(--panel2);">' +
            '<div style="display:flex;align-items:center;gap:10px;">' + tagBox(it.kind) +
              '<div style="min-width:0;"><div style="font-size:13px;font-weight:700;color:var(--bright);">' + esc(it.label) + '</div>' +
                '<div class="mono" style="font-size:10px;color:var(--faint);margin-top:2px;">' + src + ' \u00b7 ' +
                  esc(new Date(it.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })) + '</div></div>' +
            '</div>' +
            '<div style="font-size:12px;color:var(--dim);line-height:1.5;">' + esc(mt.desc) + '</div>' +
            (it.note && it.source === "teacher" ? '<div style="font-size:12px;color:var(--text);line-height:1.5;">\u201c' + esc(it.note) + '\u201d</div>' : '') +
            '<button class="mono pfUse" data-id="' + esc(it.id) + '" style="margin-top:auto;padding:8px 0;border-radius:8px;border:1px solid ' + mt.col + ';' +
              'background:transparent;color:' + mt.col + ';font-weight:700;font-size:12px;letter-spacing:1px;cursor:pointer;">' + verb(it.kind).toUpperCase() + '</button>' +
          '</div>';
        }).join("") + '</div>';
    }

    if (used.length) {
      h += '<div class="mono" style="font-size:10px;letter-spacing:1.5px;color:var(--faint);margin:18px 0 6px;">HISTORY</div>' +
        used.map(function (it) {
          var st = meta(it.kind).type === "charge" ? ((it.consumed_at || sp[it.id]) ? "spent" : "armed") : meta(it.kind).done.toLowerCase();
          return '<div style="display:flex;justify-content:space-between;gap:12px;padding:7px 0;border-bottom:1px solid var(--border2);font-size:12px;">' +
            '<span style="color:var(--dim);">' + esc(it.label) + ' <span class="mono" style="color:var(--faint);">\u00b7 ' + st + '</span></span>' +
            '<span class="mono" style="color:var(--faint);">' + esc(new Date(it.used_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })) + '</span></div>';
        }).join("");
    }
    h += '<div class="mono" style="font-size:11px;color:var(--faint);margin-top:14px;line-height:1.6;">\u2726 Loot drops: every flag you capture has a 3% chance to drop a random in-game item here.</div>';
    box.innerHTML = h + '</div>';

    box.querySelectorAll(".pfUse").forEach(function (b) { b.onclick = function () { openUse(b.getAttribute("data-id")); }; });
    clearInterval(itemTick);
    if (act.length) itemTick = setInterval(function () {
      var expired = false;
      box.querySelectorAll("[data-until]").forEach(function (n) {
        var left = +n.getAttribute("data-until") - Date.now();
        if (left <= 0) expired = true; else n.textContent = fmtLeft(left);
      });
      if (expired) renderItems();
    }, 1000);
    markNew(box);
  }
  /* Glow the Items card while it holds teacher/spinner items the student hasn't
     looked at; clicking the card marks them seen (clears the main-page notice too). */
  var SEEN_KEY = "ctf-items-seen-" + course, _jumped = false;
  function markNew(box) {
    var seen = +localStorage.getItem(SEEN_KEY) || 0;
    var fresh = ITEMS.filter(function (it) {
      return !it.shared && !it.used_at && (it.source === "teacher" || it.source === "spinner") && new Date(it.created_at).getTime() > seen;
    });
    var card = box.firstElementChild || box;
    if (!fresh.length) { card.style.animation = ""; return; }
    if (!document.getElementById("pfNewCss")) {
      var st = document.createElement("style"); st.id = "pfNewCss";
      st.textContent = "@keyframes pfNewGlow{0%,100%{box-shadow:0 0 0 0 color-mix(in oklch,var(--rw) 0%,transparent)}50%{box-shadow:0 0 30px 5px color-mix(in oklch,var(--rw) 80%,transparent)}}";
      document.head.appendChild(st);
      var setInv = function () {
        var p = document.createElement("span"); p.style.color = "var(--accent)"; p.style.display = "none"; document.body.appendChild(p);
        var m = getComputedStyle(p).color.match(/\d+(\.\d+)?/g); p.remove(); if (!m) return;
        document.documentElement.style.setProperty("--rw", "rgb(" + (255 - +m[0]) + "," + (255 - +m[1]) + "," + (255 - +m[2]) + ")");
      };
      setInv();
      new MutationObserver(setInv).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    }
    card.style.animation = "pfNewGlow 1.8s ease-in-out infinite";
    card.style.borderColor = "var(--rw)";
    if (!box.querySelector("#pfNewTag")) {
      var tag = document.createElement("div"); tag.id = "pfNewTag"; tag.className = "mono";
      tag.style.cssText = "font-size:12px;font-weight:700;letter-spacing:1px;color:var(--bright);margin-bottom:10px;";
      tag.textContent = "\u2726 NEW FROM YOUR TEACHER: " + fresh.length + " ITEM" + (fresh.length > 1 ? "S" : "") + " (click to dismiss)";
      card.insertBefore(tag, card.firstChild);
    }
    box.onclick = function () {
      var max = Math.max.apply(null, ITEMS.map(function (it) { return new Date(it.created_at).getTime() || 0; }));
      try { localStorage.setItem(SEEN_KEY, String(Math.max(max, Date.now()))); } catch (e) {}
      card.style.animation = ""; card.style.borderColor = "";
      var t = box.querySelector("#pfNewTag"); if (t) t.remove();
      box.onclick = null;
    };
    if (!_jumped && location.hash === "#pfItems") {
      _jumped = true;
      window.scrollTo({ top: box.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
    }
  }
  function _reward(k) { var it = ITEMS.filter(function (x) { return x.kind === k; })[0]; return it ? it.label : k; }
  function cacheItems() { try { localStorage.setItem("ctf-items-" + course, JSON.stringify(ITEMS)); } catch (e) {} }
  async function loadItems() {
    var s = sess();
    if (!ONLINE || !s) return;
    try {
      var d = await AUTH.rpc("ctf_my_items", { p_student: s.studentId });
      ITEMS = (d && d.items) || []; cacheItems(); renderItems();
    } catch (e) { /* reward-items.sql not run yet: keep the card hidden */ }
  }

  /* Use flow: open -> hold the button to commit -> confirmation (or reveal). */
  function openUse(id) {
    var it = ITEMS.filter(function (x) { return x.id === id; })[0]; if (!it) return;
    itemCss();
    var mt = meta(it.kind);
    var run = mt.type === "timed" && activeRun(it.kind);
    var ov = document.createElement("div"); ov.id = "pfUseOv";
    ov.style.cssText = "position:fixed;inset:0;z-index:20000;background:rgba(0,0,0,.66);display:flex;align-items:center;justify-content:center;padding:20px;";
    var close = function () { ov.remove(); };
    ov.onclick = function (e) { if (e.target === ov) close(); };
    ov.innerHTML = '<div class="card" style="max-width:420px;width:100%;padding:26px;text-align:center;animation:pfPop .25s ease;">' +
      '<div id="pfUseBody">' +
        '<div style="display:flex;justify-content:center;margin-bottom:14px;">' + tagBox(it.kind, 72) + '</div>' +
        '<div style="font-size:20px;font-weight:800;color:var(--bright);">' + esc(it.label) + '</div>' +
        '<div style="font-size:13px;color:var(--dim);line-height:1.6;margin:8px 0 6px;">' + esc(mt.desc) + '</div>' +
        (run ? '<div class="mono" style="font-size:11px;color:' + mt.col + ';margin-bottom:6px;">One is already running. This adds its time after it ends.</div>' : '') +
        (mt.type === "charge" ? '<div class="mono" style="font-size:11px;color:var(--faint);margin-bottom:6px;">Once armed, it triggers by itself on the CTF page.</div>' : '') +
        '<button id="pfHold" class="mono" style="position:relative;overflow:hidden;width:100%;margin-top:14px;padding:16px 0;border-radius:12px;border:1px solid ' + mt.col + ';' +
          'background:transparent;color:var(--bright);font-weight:800;font-size:14px;letter-spacing:1.5px;cursor:pointer;user-select:none;touch-action:none;">' +
          '<span id="pfFill" style="position:absolute;left:0;top:0;bottom:0;width:0;background:' + mt.col + ';opacity:.28;"></span>' +
          '<span style="position:relative;">HOLD TO ' + verb(it.kind).toUpperCase() + '</span></button>' +
        '<div id="pfUseErr" class="mono" style="font-size:12px;color:var(--adv2,#ff6b6b);min-height:16px;margin-top:10px;"></div>' +
        '<button id="pfCancelUse" class="mono" style="margin-top:4px;background:none;border:none;color:var(--faint);font-size:12px;cursor:pointer;">cancel</button>' +
      '</div></div>';
    document.body.appendChild(ov);
    el("pfCancelUse").onclick = close;

    var btn = el("pfHold"), fill = el("pfFill"), t0 = 0, raf = null, fired = false, HOLD = 900;
    function step() {
      var p = Math.min(1, (Date.now() - t0) / HOLD);
      fill.style.width = (p * 100) + "%";
      if (p >= 1) { fired = true; commit(); return; }
      raf = requestAnimationFrame(step);
    }
    function start(e) { if (fired) return; e.preventDefault(); t0 = Date.now(); raf = requestAnimationFrame(step); }
    function stop() { if (fired) return; cancelAnimationFrame(raf); fill.style.transition = "width .2s"; fill.style.width = "0"; setTimeout(function () { fill.style.transition = ""; }, 200); }
    btn.addEventListener("pointerdown", start);
    ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) { btn.addEventListener(ev, stop); });
    btn.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && !t0) start(e); });
    btn.addEventListener("keyup", function (e) { if (e.key === "Enter" || e.key === " ") { stop(); t0 = 0; } });

    async function commit() {
      btn.disabled = true; btn.lastChild.textContent = "WORKING\u2026";
      var s = sess();
      try {
        var r = await AUTH.rpc("ctf_use_item", { p_student: s.studentId, p_item: id });
        ITEMS = ITEMS.map(function (x) { return x.id === id ? Object.assign({}, x, r.item) : x; });
        if (r.reveal) ITEMS.unshift(r.reveal);
        cacheItems();
        if (it.kind === "xp500") {
          var st = API.getState ? API.getState() : null;
          if (st) {
            st.bonus = Math.max((st.bonus || 0) + 500, r.bonus || 0);
            st.xpLog = st.xpLog || []; st.xpLog.push({ ts: Date.now(), delta: 500, reason: "Reward item: +500 Bonus XP" });
            try { localStorage.setItem(API.stateKey, JSON.stringify(st)); } catch (e) {}
          }
        }
        if (it.kind === "mystery" && r.reveal) reveal(r.reveal); else confirmDone(r.item);
      } catch (e) {
        fired = false; btn.disabled = false; btn.lastChild.textContent = "HOLD TO " + verb(it.kind).toUpperCase(); fill.style.width = "0";
        el("pfUseErr").textContent = "Couldn't use that item: " + ((e && e.message) || "try again");
      }
    }
    function doneBtn() {
      return '<button id="pfDone" class="mono" style="width:100%;margin-top:18px;padding:12px 0;border-radius:10px;border:none;background:var(--accent);color:#04121e;font-weight:800;font-size:13px;letter-spacing:1px;cursor:pointer;">DONE</button>';
    }
    function confirmDone(item) {
      var line = mt.type === "timed" ? "Running until " + fmtEnd(Date.parse(item.expires_at)) + "."
        : mt.type === "charge" ? "Ready. It triggers by itself on the CTF page."
        : it.kind === "xp500" ? "+500 XP added to your score."
        : "Marked redeemed. Show your teacher.";
      el("pfUseBody").innerHTML =
        '<div style="width:72px;height:72px;margin:0 auto 14px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid ' + mt.col + ';color:' + mt.col + ';font-size:34px;font-weight:800;animation:pfPop .35s ease,pfGlow 1.4s ease 1;">\u2713</div>' +
        '<div class="mono" style="font-size:12px;letter-spacing:2px;color:' + mt.col + ';font-weight:700;">' + mt.done + '</div>' +
        '<div style="font-size:20px;font-weight:800;color:var(--bright);margin-top:6px;">' + esc(it.label) + '</div>' +
        '<div style="font-size:13px;color:var(--dim);line-height:1.6;margin-top:8px;">' + esc(line) + '</div>' + doneBtn();
      el("pfDone").onclick = function () { close(); boot(); };
    }
    function reveal(nu) {
      var nm = meta(nu.kind);
      el("pfUseBody").innerHTML = '<div id="pfBox" style="display:flex;justify-content:center;margin:10px 0 16px;animation:pfShake .5s ease 2;">' + tagBox("mystery", 84) + '</div>' +
        '<div class="mono" style="font-size:12px;letter-spacing:2px;color:var(--faint);">OPENING\u2026</div>';
      setTimeout(function () {
        el("pfUseBody").innerHTML =
          '<div class="mono" style="font-size:12px;letter-spacing:2px;color:var(--accent2);font-weight:700;">YOU GOT</div>' +
          '<div style="display:flex;justify-content:center;margin:14px 0;animation:pfPop .4s ease;color:' + nm.col + ';"><span style="border-radius:20px;animation:pfGlow 1.4s ease 1;">' + tagBox(nu.kind, 84) + '</span></div>' +
          '<div style="font-size:20px;font-weight:800;color:var(--bright);">' + esc(nu.label) + '</div>' +
          '<div style="font-size:13px;color:var(--dim);line-height:1.6;margin-top:8px;">' + esc(nm.desc) + '</div>' +
          '<div class="mono" style="font-size:11px;color:var(--faint);margin-top:8px;">It\u2019s in your items, ready to use.</div>' + doneBtn();
        el("pfDone").onclick = function () { close(); boot(); };
      }, 1100);
    }
  }

  /* ---- boot -------------------------------------------------------------- */
  function css() {
    if (document.getElementById("pfCss")) return;
    var st = document.createElement("style"); st.id = "pfCss";
    /* .pfHead reserves room for the shell's fixed theme button; on a phone the
       button sits over empty space instead, so the gutter is dropped. */
    st.textContent =
      ".pfHead{padding-right:112px;}" +
      "@media(max-width:640px){" +
        ".pfHead{padding-right:0;}" +
        ".pfHead > div:last-child{width:100%;}" +
      "}";
    document.head.appendChild(st);
  }
  function boot() {
    var root = el("profileRoot"); if (!root) return;
    css();
    root.innerHTML = header() +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;align-items:start;">' +
        identityCard() + xpCard() +
      '</div>' +
      itemsCard() + badgeCase() + objectiveCard() + xpLogCard() + leaderboardCard();
    wireIdentity();
    if (ITEMS.length) renderItems();
    loadItems();
    loadObjectives();
    loadLb();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
