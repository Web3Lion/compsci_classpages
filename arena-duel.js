// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* ============================================================================
   arena-duel.js  —  student Flag Duels (supabase/arena-duels.sql, v21.0).

   window.FLAG_DUEL  shared helpers for arena-duel.html and the arena:
     .flags(course)        every scorable flag {key,id,title,module,level,pts}
                           (same key rules as ctf.js flagsOf; vault + locked skipped)
     .solved(course)       this device's solved map from the engine state
     .sess(course)         the ctf-sess-<course> cache
     .err(code)            student-facing text for an RPC error

   On ctf.html (data-mode="arena") it also adds:
     • a Flag Duel card above the arena (start or join → arena-duel.html)
     • a fixed scoreboard bar while the student is in a lobby / live duel /
       just-finished duel (all players' points + the timer)
     • #mod=N in the URL opens that module
   Polling the state is also the duel heartbeat (90s with no page open = forfeit).
   ========================================================================== */
(function () {
  var PTS = { easy: 1, medium: 2, hard: 3 };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function sess(c) { try { return JSON.parse(localStorage.getItem("ctf-sess-" + c)) || null; } catch (e) { return null; } }
  function solved(c) { try { return (JSON.parse(localStorage.getItem("ctf-" + c)) || {}).solved || {}; } catch (e) { return {}; } }
  function locks(c) {
    if (window.CTF_LOCKS) return { mods: window.CTF_LOCKS.modules || [], flags: window.CTF_LOCKS.flags || [] };
    try { var g = JSON.parse(localStorage.getItem("ctf-gates-" + c)) || {}; return { mods: g.locked_modules || [], flags: g.locked_flags || [] }; } catch (e) { return { mods: [], flags: [] }; }
  }
  function lvl(d) { d = String(d || "").toLowerCase(); return d.indexOf("hard") === 0 ? "Hard" : d.indexOf("med") === 0 ? "Medium" : d.indexOf("easy") === 0 ? "Easy" : ""; }
  function flags(c) {
    var cfg = ((window.COURSE_CONFIG || {})[c] || {}).ctf || {}, L = locks(c), out = [];
    (cfg.challenges || []).forEach(function (ch) {
      if (ch.vault) return;
      var m = Number(ch.module || 0);
      if (L.flags.indexOf(ch.id) !== -1 || L.mods.indexOf(m) !== -1) return;
      function add(key, level) { var lv = lvl(level); out.push({ key: key, id: ch.id, title: ch.title || ch.id, module: m, level: lv, pts: PTS[lv.toLowerCase()] || 1 }); }
      if (ch.type === "vocab") ["Easy", "Medium", "Hard"].forEach(function (d, i) { add(ch.id + "#" + i, d); });
      else if (ch.levels && ch.type !== "phish") ch.levels.forEach(function (lv, i) { add(ch.id + "#" + i, lv.difficulty || ["Easy", "Medium", "Hard"][i]); });
      else add(ch.id, ch.difficulty);
    });
    return out;
  }
  var ERR = {
    duels_off: "Your teacher has flag duels turned off for this class.",
    in_quiz: "Finish your open vocab quiz first.",
    already_in_duel: "You're already in a duel. Leave it first.",
    no_open_flags: "You've already captured every flag in those modules, so there's nothing left to score.",
    no_flags: "Pick at least one module that has flags.",
    no_modules: "Pick at least one module.",
    no_duel: "No open duel with that code in your class.",
    started: "That duel already started.",
    full: "That duel is full (4 players).",
    need_two: "You need at least one other player to start.",
    not_yours: "Sign in on your CTF page first."
  };
  function err(code) { return ERR[code] || ("Something went wrong (" + (code || "error") + ")."); }
  function mmss(ms) { ms = Math.max(0, ms); var s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }

  window.FLAG_DUEL = { flags: flags, solved: solved, sess: sess, err: err, esc: esc, mmss: mmss };

  /* ---------------- arena (ctf.html) ---------------- */
  var me = document.currentScript;
  if (!me || me.getAttribute("data-mode") !== "arena") return;
  var course = window.CTF_COURSE, AUTH = window.CTF_AUTH;
  if (!course || !AUTH || !AUTH.online) return;
  var ROOM = "../arena-duel.html?c=" + encodeURIComponent(course);
  var ST = null, skew = 0, timer = null, tick = null, hidDone = null;

  function openMod() {
    var m = (location.hash.match(/mod=(\d+)/) || [])[1]; if (!m) return;
    var tries = 0;
    (function go() {
      var head = document.querySelector('.modHead[data-m="' + m + '"]'), body = document.querySelector('.modBody[data-m="' + m + '"]');
      if (!head) { if (++tries < 40) setTimeout(go, 250); return; }
      if (body && body.style.display === "none") head.click();
      setTimeout(function () { var h = document.querySelector('.modHead[data-m="' + m + '"]'); if (h) window.scrollTo({ top: h.getBoundingClientRect().top + scrollY - 90, behavior: "smooth" }); }, 120);
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    })();
  }
  window.addEventListener("hashchange", openMod);

  var VROOM = "../vocab-duel.html?c=" + encodeURIComponent(course);
  function card() {
    var root = document.getElementById("ctfRoot"); if (!root) return;
    var el = document.getElementById("fdCard"), vb = document.getElementById("vdLive");
    // a class vocab battle is live: one glowing call to the duel room, nothing else
    if (ST && ST.vd && ST.vd.class_live && ST.vd.session && ST.vd.session.kind === "class" && ST.vd.session.status === "live") {
      if (el) el.remove();
      if (!vb) { vb = document.createElement("a"); vb.id = "vdLive"; vb.className = "card"; root.parentNode.insertBefore(vb, root); }
      vb.href = VROOM;
      vb.setAttribute("style", "display:flex;align-items:center;gap:16px;flex-wrap:wrap;text-decoration:none;color:inherit;margin-bottom:18px;padding:18px 22px;border:2px solid var(--adv,var(--amber));box-shadow:0 0 26px -10px var(--advglow,var(--amber));");
      vb.innerHTML = '<span aria-hidden="true" style="flex:none;font-size:26px;line-height:1;color:var(--bright);">\u2694</span>' +
        '<span style="min-width:0;flex:1;"><span class="mono" style="display:block;font-size:12px;letter-spacing:1.5px;color:var(--bright);font-weight:700;">// VOCAB BATTLE LIVE</span>' +
        '<span style="display:block;font-size:16px;font-weight:700;color:var(--bright);margin-top:4px;">Your team needs you. Open the duel room to get an opponent.</span></span>' +
        '<span class="mono" style="flex:none;font-size:12px;font-weight:700;color:var(--bright);border:1px solid var(--bright);padding:8px 12px;border-radius:999px;">FIGHT \u2192</span>';
      return;
    }
    if (vb) vb.remove();
    var show = ST && ST.duels_on && !ST.tb && !(ST.duel && ST.duel.status !== "done");
    if (!show) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement("div"); el.id = "fdCard"; el.className = "card"; root.parentNode.insertBefore(el, root); }
    el.setAttribute("style", "display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:18px;padding:18px 22px;border-color:var(--border3);");
    var lk = function (href, t) { return '<a href="' + href + '" class="mono" style="flex:none;font-size:12px;font-weight:700;color:var(--bright);border:1px solid var(--amber);padding:10px 14px;min-height:44px;display:inline-flex;align-items:center;border-radius:999px;">' + t + '</a>'; };
    el.innerHTML = '<span aria-hidden="true" style="flex:none;font-size:26px;line-height:1;color:var(--amber);">\u2694</span>' +
      '<span style="min-width:0;flex:1;"><span class="mono" style="display:block;font-size:12px;letter-spacing:1.5px;color:var(--amber);">// DUELS</span>' +
      '<span style="display:block;font-size:16px;font-weight:700;color:var(--bright);margin-top:4px;">Challenge your classmates</span>' +
      '<span style="display:block;font-size:13px;color:var(--muted);margin-top:3px;"><b>Flag Duel:</b> race up to 3 classmates on flags you haven\u2019t captured. <b>Vocab Duel:</b> 1v1, crack disguised terms to knock out your opponent\u2019s health. Winner +10 XP, everyone who finishes +5.</span></span>' +
      '<span style="display:flex;gap:8px;flex-wrap:wrap;">' + lk(ROOM, "FLAG DUEL \u2192") + lk(VROOM, "VOCAB DUEL \u2192") + '</span>';
  }

  function exitBtn(t) { return '<button type="button" id="fdExit" class="mono" style="font-size:11px;font-weight:700;padding:6px 10px;min-height:32px;border-radius:8px;border:1px solid var(--border3);background:transparent;color:var(--dim);cursor:pointer;">' + t + '</button>'; }
  function exitNow(kind) {
    var s = sess(course); if (!s) return;
    var txt = kind === "tb" ? "Exit the team battle? You stop scoring for your team and won\u2019t get battle XP."
      : ST.duel && ST.duel.status === "live" ? "Forfeit this duel? You won\u2019t get any duel XP." : "Leave this duel?";
    if (!confirm(txt)) return;
    AUTH.rpc(kind === "tb" ? "ctf_tb_leave" : "ctf_ad_leave", { p_student: s.studentId }).catch(function () {}).then(poll);
  }
  /* team battle bar (team-battles.sql): team averages, my points, timer */
  function tbBar(el) {
    var b = ST.tb, T = b.teams || [], cols = ["#3a86ff", "#ff5d73", "#2ec27e", "#f4a300"];
    var chips = T.map(function (t, i) {
      var mine = t.id === b.my_team;
      return '<span style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;border:' + (mine ? "2px solid var(--accent)" : "1px solid var(--border3)") + ';background:var(--bg);">' +
        '<span aria-hidden="true" style="width:10px;height:10px;border-radius:3px;background:' + esc(t.color || cols[i % 4]) + ';"></span>' +
        '<span style="font-weight:700;color:var(--bright);font-size:13px;">' + esc(t.name) + (mine ? ' <span class="mono" style="font-size:10px;color:var(--accent);">YOUR TEAM</span>' : '') + '</span>' +
        '<span class="mono" style="font-weight:800;font-size:15px;color:var(--amber);">' + (+t.avg).toFixed(1) + '</span>' +
        (b.status === "done" && t.won ? '<span class="mono" style="font-size:10px;color:var(--accent);">\u2605 WIN</span>' : '') + '</span>';
    }).join("");
    var me = b.me || {}, right;
    if (b.status === "live") right = '<span class="mono" style="font-size:12px;color:var(--muted);">You: <b style="color:var(--bright);">' + (me.points || 0) + '</b> pts</span>' +
      (b.ends_at ? '<span class="mono" id="fdClock" style="font-size:22px;font-weight:800;color:var(--bright);min-width:70px;text-align:right;"></span>' : '') + exitBtn("Exit battle");
    else {
      var mv = (b.mvps || []).filter(function (m) { return m.team === b.my_team; }).map(function (m) { return esc(m.handle); });
      right = '<span class="mono" style="font-size:12px;color:var(--bright);font-weight:700;">Battle over \u00b7 ' + (me.xp ? "+" + me.xp + " XP" : "no XP (no captures)") + (mv.length ? " \u00b7 Team MVP: " + mv.join(", ") : "") + '</span>' +
        '<button type="button" id="fdClose" class="mono" style="font-size:11px;padding:6px 10px;border-radius:8px;border:1px solid var(--border3);background:transparent;color:var(--dim);cursor:pointer;">Close</button>';
    }
    el.innerHTML = '<div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">' +
      '<span class="mono" style="font-size:11px;letter-spacing:1.5px;color:var(--amber);font-weight:700;">\u2691 TEAM BATTLE</span>' +
      '<span class="mono" style="font-size:11px;color:var(--dim);">' + (b.modules || []).map(function (m) { return "M" + String(m).padStart(2, "0"); }).join(" \u00b7 ") + ' \u00b7 team avg</span>' +
      '<span style="display:flex;gap:8px;flex-wrap:wrap;flex:1;min-width:0;">' + chips + '</span>' + right + '</div>';
    var c = el.querySelector("#fdClose"); if (c) c.onclick = function () { hidDone = b.id; bar(); };
    var x = el.querySelector("#fdExit"); if (x) x.onclick = function () { exitNow("tb"); };
    clearFixed();
    if (b.status === "live" && b.ends_at && !tick) tick = setInterval(clock, 500);
    if (b.status !== "live") { clearInterval(tick); tick = null; }
    clock();
  }
  function bar() {
    var d = ST && (ST.tb || ST.duel), el = document.getElementById("fdBar");
    if (!d || (d.status === "done" && hidDone === d.id)) { if (el) el.remove(); document.body.style.paddingTop = ""; clearInterval(tick); tick = null; return; }
    if (!el) {
      el = document.createElement("div"); el.id = "fdBar"; el.setAttribute("role", "region"); el.setAttribute("aria-label", "Flag duel scoreboard");
      el.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:9000;background:var(--panel);border-bottom:2px solid var(--amber);box-shadow:0 8px 24px -16px #000;padding:10px 16px;";
      document.body.appendChild(el);
      window.addEventListener("resize", clearFixed);
    }
    if (ST.tb) { el.setAttribute("aria-label", "Team battle scoreboard"); return tbBar(el); }
    el.setAttribute("aria-label", "Flag duel scoreboard");
    var mods = (d.modules || []).map(function (m) { return "M" + String(m).padStart(2, "0"); }).join(" \u00b7 ");
    var chips = (d.players || []).map(function (p) {
      var mine = p.id === ST.me;
      return '<span style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;border:' + (mine ? "2px solid var(--accent)" : "1px solid var(--border3)") + ';background:var(--bg);' + (p.forfeit ? "opacity:.55;" : "") + '">' +
        '<span style="font-weight:700;color:var(--bright);font-size:13px;">' + esc(p.handle) + (mine ? ' <span class="mono" style="font-size:10px;color:var(--accent);">YOU</span>' : '') + '</span>' +
        '<span class="mono" style="font-weight:800;font-size:15px;color:var(--amber);">' + p.points + '</span>' +
        (p.forfeit ? '<span class="mono" style="font-size:10px;color:var(--dim);">LEFT</span>' : '') +
        (d.status === "done" && p.won ? '<span class="mono" style="font-size:10px;color:var(--accent);">\u2605 WIN</span>' : '') + '</span>';
    }).join("");
    var right;
    if (d.status === "lobby") right = '<span class="mono" style="font-size:12px;color:var(--muted);">Lobby \u00b7 code <b style="color:var(--bright);letter-spacing:2px;">' + esc(d.code) + '</b> \u00b7 waiting for the host to start</span>';
    else if (d.status === "live") right = '<span class="mono" id="fdClock" aria-live="off" style="font-size:22px;font-weight:800;color:var(--bright);min-width:70px;text-align:right;"></span>';
    else {
      var mine = (d.players || []).filter(function (p) { return p.id === ST.me; })[0] || {};
      right = '<span class="mono" style="font-size:12px;color:var(--bright);font-weight:700;">Time! ' + (mine.won ? "\u2605 You won \u00b7 +" + mine.xp + " XP" : mine.xp ? "+" + mine.xp + " XP for playing" : "Duel over") + '</span>' +
        '<button type="button" id="fdClose" class="mono" style="font-size:11px;padding:6px 10px;border-radius:8px;border:1px solid var(--border3);background:transparent;color:var(--dim);cursor:pointer;">Close</button>';
    }
    if (d.status !== "done") right += exitBtn(d.status === "live" ? "Forfeit" : "Leave");
    el.innerHTML = '<div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">' +
      '<span class="mono" style="font-size:11px;letter-spacing:1.5px;color:var(--amber);font-weight:700;">\u2694 DUEL</span>' +
      '<span class="mono" style="font-size:11px;color:var(--dim);">' + esc(mods) + '</span>' +
      '<span style="display:flex;gap:8px;flex-wrap:wrap;flex:1;min-width:0;">' + chips + '</span>' + right +
      '<a href="' + ROOM + '" class="mono" style="font-size:11px;font-weight:700;padding:6px 10px;border-radius:8px;border:1px solid var(--amber);color:var(--bright);">Duel room</a></div>';
    var c = el.querySelector("#fdClose"); if (c) c.onclick = function () { hidDone = d.id; bar(); };
    var x = el.querySelector("#fdExit"); if (x) x.onclick = function () { exitNow("ad"); };
    clearFixed();
    document.body.style.paddingTop = el.offsetHeight + "px";
    if (d.status === "live" && !tick) tick = setInterval(clock, 500);
    if (d.status !== "live") { clearInterval(tick); tick = null; }
    clock();
  }
  // keep the bar's content clear of the fixed theme / A11Y / board buttons in the top-right
  function clearFixed() {
    var el = document.getElementById("fdBar"); if (!el) return;
    var minLeft = innerWidth;
    document.querySelectorAll("#themeToggle, #siteA11yBtn, a.themebtn").forEach(function (b) {
      var r = b.getBoundingClientRect(); if (r.width && r.top < 60 && r.left < minLeft) minLeft = r.left;
    });
    el.style.paddingRight = (minLeft < innerWidth ? Math.max(16, innerWidth - minLeft + 12) : 16) + "px";
    document.body.style.paddingTop = el.offsetHeight + "px";
  }
  function clock() {
    var el = document.getElementById("fdClock"), d = ST && (ST.tb || ST.duel); if (!el || !d || !d.ends_at) return;
    var left = new Date(d.ends_at).getTime() - (Date.now() + skew);
    el.textContent = mmss(left); el.style.color = left < 30000 ? "var(--amber)" : "var(--bright)";
    if (left <= 0) { clearInterval(tick); tick = null; setTimeout(poll, 1200); }
  }
  function poll() {
    clearTimeout(timer);
    var s = sess(course); if (!s) { timer = setTimeout(poll, 15000); return; }
    var tbP = AUTH.rpc("ctf_tb_state", { p_student: s.studentId }).catch(function () { return null; });   // team-battles.sql optional
    var adP = AUTH.rpc("ctf_ad_state", { p_student: s.studentId }).catch(function () { return null; });   // arena-duels.sql optional
    var vdP = AUTH.rpc("ctf_vd_state", { p_student: s.studentId }).catch(function () { return null; });   // vocab-duels.sql optional
    Promise.all([adP, tbP, vdP]).then(function (r) {
      var d = (r[0] && !r[0].error) ? r[0] : { duels_on: false, duel: null }, tb = r[1] && !r[1].error ? r[1].battle : null;
      if (!r[0] && !tb && !(r[2] && !r[2].error)) { ST = null; card(); bar(); timer = setTimeout(poll, 30000); return; }
      d.tb = tb && !(tb.status === "done" && hidDone === tb.id) ? tb : null;
      d.vd = r[2] && !r[2].error ? r[2] : null;
      ST = d; var now = (r[0] && r[0].now) || (r[1] && r[1].now); if (now) skew = new Date(now).getTime() - Date.now();
      card(); bar();
      var hot = (d.tb && d.tb.status === "live") || (d.duel && d.duel.status !== "done") || (d.vd && d.vd.class_live);
      timer = setTimeout(poll, hot ? 5000 : 20000);
    });
  }
  // ctf.js re-renders #ctfRoot often; the card lives outside it, so only re-add if removed
  function start() { openMod(); setTimeout(poll, 800); }
  document.addEventListener("visibilitychange", function () { if (!document.hidden) poll(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
