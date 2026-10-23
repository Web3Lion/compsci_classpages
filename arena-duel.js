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
    var L;
    if (window.CTF_LOCKS) L = { mods: (window.CTF_LOCKS.modules || []).map(Number), flags: window.CTF_LOCKS.flags || [] };
    else { try { var g = JSON.parse(localStorage.getItem("ctf-gates-" + c)) || {}; L = { mods: (g.locked_modules || []).map(Number), flags: g.locked_flags || [] }; } catch (e) { L = { mods: [], flags: [] }; } }
    // 32.0.1: same rule as ctf.js locks() — lockedByDefault modules stay closed until the teacher saves "open:N"
    ((((window.COURSE_CONFIG || {})[c] || {}).ctf || {}).lockedByDefault || []).forEach(function (m) { m = Number(m); if (L.flags.indexOf("open:" + m) === -1 && L.mods.indexOf(m) === -1) L.mods.push(m); });
    return L;
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
    full: "That duel is full (6 players).",
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
  // 24.0: hype layer (banners, lead changes, final-minute countdown) — no sound for students
  if (!window.BATTLE_FX) { var fxs = document.createElement("script"); fxs.src = (me.src || "").replace(/arena-duel\.js.*$/, "battle-fx.js") + "?v=" + (window.SITE_VERSION || ""); document.head.appendChild(fxs); }
  function FX() { return window.BATTLE_FX || null; }
  var PAL = ["#3a86ff", "#ff5d73", "#2ec27e", "#f4a300", "#b06cff", "#18c2c2"];
  function hype(key, snap, prefix, opts) {
    var fx = FX(); if (!fx) return;
    var ev = fx.track(key, snap, opts || {});
    ev.changed.forEach(function (id) { fx.shake(document.getElementById(prefix + id)); });
  }

  function openMod() {
    var m = (location.hash.match(/mod=(\d+)/) || [])[1]; if (!m) return;
    var tries = 0;
    (function go() {
      var head = document.querySelector('.modHead[data-m="' + m + '"]'), body = document.querySelector('.modBody[data-m="' + m + '"]');
      if (!head) { if (++tries < 40) setTimeout(go, 250); return; }
      if (body && body.style.display === "none") head.click();
      var fid = (location.hash.match(/flag=([^&]+)/) || [])[1];
      setTimeout(function () {
        var sel = fid ? '.chalName[data-id="' + decodeURIComponent(fid).replace(/"/g, "") + '"]' : null, row = sel && document.querySelector(sel);
        if (row && row.getAttribute("aria-expanded") !== "true") row.click();
        row = sel && document.querySelector(sel);
        var h = row || document.querySelector('.modHead[data-m="' + m + '"]'); if (h) window.scrollTo({ top: h.getBoundingClientRect().top + scrollY - 90, behavior: "smooth" });
      }, 160);
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    })();
  }
  window.addEventListener("hashchange", openMod);

  var VROOM = "../vocab-duel.html?c=" + encodeURIComponent(course), BROOM = "../bracket-play.html?c=" + encodeURIComponent(course);
  function card() {
    var root = document.getElementById("ctfRoot"); if (!root) return;
    var el = document.getElementById("fdCard"), vb = document.getElementById("vdLive");
    // 29.0: class duel waiting room open → glowing call to lobby.html
    if (ST && ST.lobby) {
      var LBN = { team: "Team Battle", vocab: "Vocab Battle", raid: "Boss Raid", bracket: "Duel Bracket" };
      if (el) el.remove();
      if (!vb) { vb = document.createElement("a"); vb.id = "vdLive"; vb.className = "card"; root.parentNode.insertBefore(vb, root); }
      vb.href = "../lobby.html?c=" + encodeURIComponent(course);
      vb.setAttribute("style", "display:flex;align-items:center;gap:16px;flex-wrap:wrap;text-decoration:none;color:inherit;margin-bottom:18px;padding:18px 22px;border:2px solid var(--amber);box-shadow:0 0 30px -8px var(--amber);");
      vb.innerHTML = '<span aria-hidden="true" style="flex:none;font-size:30px;line-height:1;color:var(--amber);">\u2694</span>' +
        '<span style="min-width:0;flex:1;"><span class="mono" style="display:block;font-size:12px;letter-spacing:1.5px;color:var(--amber);font-weight:700;">// CLASS DUEL \u00b7 WAITING ROOM ' + (ST.lobby.status === "counting" ? "\u00b7 STARTING NOW" : "OPEN") + '</span>' +
        '<span style="display:block;font-size:16px;font-weight:700;color:var(--bright);margin-top:4px;">' + (LBN[ST.lobby.kind] || "Class duel") + ' starting soon. Join the waiting room to see your team.</span></span>' +
        '<span class="mono" style="flex:none;font-size:12px;font-weight:700;color:var(--bright);border:1px solid var(--amber);padding:8px 12px;border-radius:999px;">JOIN \u2192</span>';
      return;
    }
    // 28.0: class boss raid live → glowing call to the raid page
    var rd = ST && ST.raid && ST.raid.status === "live";
    if (rd) {
      if (el) el.remove();
      if (!vb) { vb = document.createElement("a"); vb.id = "vdLive"; vb.className = "card"; root.parentNode.insertBefore(vb, root); }
      vb.href = "../raid-play.html?c=" + encodeURIComponent(course);
      vb.setAttribute("style", "display:flex;align-items:center;gap:16px;flex-wrap:wrap;text-decoration:none;color:inherit;margin-bottom:18px;padding:18px 22px;border:2px solid var(--adv,#ff3b3b);box-shadow:0 0 30px -8px var(--advglow,#ff3b3b);");
      vb.innerHTML = '<span aria-hidden="true" style="flex:none;font-size:30px;line-height:1;color:var(--adv,#ff3b3b);">\u2620</span>' +
        '<span style="min-width:0;flex:1;"><span class="mono" style="display:block;font-size:12px;letter-spacing:1.5px;color:var(--bright);font-weight:700;">// BOSS RAID LIVE \u00b7 ' + Math.round(ST.raid.hp / Math.max(1, ST.raid.hp_max) * 100) + '% HP LEFT</span>' +
        '<span style="display:block;font-size:16px;font-weight:700;color:var(--bright);margin-top:4px;">The whole class is fighting the boss. Every right answer is a hit.</span></span>' +
        '<span class="mono" style="flex:none;font-size:12px;font-weight:700;color:var(--bright);border:1px solid var(--bright);padding:8px 12px;border-radius:999px;">JOIN RAID \u2192</span>';
      return;
    }
    // 27.0: bracket match waiting / vocab game → glowing call to the bracket page
    var bm = ST && ST.br && ST.br.bracket && ST.br.bracket.status === "live" && ST.br.match;
    if (bm && (bm.status === "ready" || (bm.status === "live" && bm.game_kind !== "flag"))) {
      if (el) el.remove();
      if (!vb) { vb = document.createElement("a"); vb.id = "vdLive"; vb.className = "card"; root.parentNode.insertBefore(vb, root); }
      vb.href = BROOM;
      vb.setAttribute("style", "display:flex;align-items:center;gap:16px;flex-wrap:wrap;text-decoration:none;color:inherit;margin-bottom:18px;padding:18px 22px;border:2px solid var(--amber);box-shadow:0 0 26px -10px var(--amber);");
      vb.innerHTML = '<span aria-hidden="true" style="flex:none;font-size:26px;line-height:1;color:var(--amber);">\u2694</span>' +
        '<span style="min-width:0;flex:1;"><span class="mono" style="display:block;font-size:12px;letter-spacing:1.5px;color:var(--amber);font-weight:700;">// BRACKET MATCH ' + (bm.status === "ready" ? "READY" : "LIVE") + '</span>' +
        '<span style="display:block;font-size:16px;font-weight:700;color:var(--bright);margin-top:4px;">You vs ' + esc(bm.opp || "?") + (bm.status === "ready" ? ". Open the bracket page to start (60 s or you forfeit)." : ". Your game is on the bracket page.") + '</span></span>' +
        '<span class="mono" style="flex:none;font-size:12px;font-weight:700;color:var(--bright);border:1px solid var(--amber);padding:8px 12px;border-radius:999px;">GO \u2192</span>';
      return;
    }
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
      '<span style="display:block;font-size:13px;color:var(--muted);margin-top:3px;"><b>Flag Duel:</b> race up to 5 classmates on flags you haven\u2019t captured. <b>Vocab Duel:</b> 1v1 or a 3\u20134 player brawl, crack disguised terms to knock out your opponent\u2019s health. Winner +10 XP, everyone who finishes +5.</span></span>' +
      '<span style="display:flex;gap:8px;flex-wrap:wrap;">' + lk(ROOM, "FLAG DUEL \u2192") + lk(VROOM, "VOCAB DUEL \u2192") + (ST && ST.br && ST.br.bracket && ST.br.bracket.status === "live" ? lk(BROOM, "BRACKET \u2192") : "") + '</span>';
  }

  /* 25.1 battle arena: live team battle / flag duel → focused page (scoreboard + battle flags only) */
  function offKey(id) { return "ctf-arena-off-" + id; }
  function arenaOff(id) { try { return sessionStorage.getItem(offKey(id)) === "1"; } catch (e) { return false; } }
  function setOff(id, v) { try { v ? sessionStorage.setItem(offKey(id), "1") : sessionStorage.removeItem(offKey(id)); } catch (e) {} }
  if (/arena/.test(location.hash)) { try { Object.keys(sessionStorage).forEach(function (k) { if (k.indexOf("ctf-arena-off-") === 0) sessionStorage.removeItem(k); }); } catch (e) {} }
  function liveBattle() {
    if (!ST) return null;
    if (ST.tb && ST.tb.status === "live") return { kind: "tb", d: ST.tb };
    if (ST.duel && ST.duel.status === "live") return { kind: "ad", d: ST.duel };
    var bm = ST.br && ST.br.match, bb = ST.br && ST.br.bracket;   // 27.0 bracket flag game
    if (bb && bb.status === "live" && bm && bm.status === "live" && bm.game_kind === "flag") return { kind: "br", d: { id: bm.id, modules: bb.modules } };
    return null;
  }
  function focus() {
    var L = liveBattle(), on = L && !arenaOff(L.d.id) && (L.d.modules || []).length;
    var key = on ? L.kind + L.d.id : "", was = window.CTF_FOCUS ? window.CTF_FOCUS.key : "";
    window.CTF_FOCUS = on ? { key: key, mods: (L.d.modules || []).map(Number) } : null;
    if (key !== was) {
      if (window.CTF && window.CTF.render) window.CTF.render();
      if (on) window.scrollTo(0, 0);
    }
    if (!on) { var p = document.getElementById("arenaHead"); if (p) p.remove(); }
    bgArena(on);
    return on ? L : null;
  }
  function arenaBtn(id) { return arenaOff(id) ? '<button type="button" id="fdArena" class="mono" style="font-size:11px;font-weight:700;padding:6px 10px;min-height:32px;border-radius:8px;border:1px solid var(--amber);background:transparent;color:var(--bright);cursor:pointer;">Arena view</button>' : ""; }
  function wireArenaBtn(el, id) { var b = el.querySelector("#fdArena"); if (b) b.onclick = function () { setOff(id, false); bar(); }; }
  function arenaPanel(L) {
    var root = document.getElementById("ctfRoot"); if (!root) return;
    var p = document.getElementById("arenaHead");
    if (!p) { p = document.createElement("div"); p.id = "arenaHead"; root.parentNode.insertBefore(p, root); }
    var d = L.d, tb = L.kind === "tb", cols = ["#3a86ff", "#ff5d73", "#2ec27e", "#f4a300"], rows, mine;
    if (tb) {
      rows = (d.teams || []).map(function (t, i) { return { id: t.id, name: t.name, score: +t.avg, shown: (+t.avg).toFixed(1), color: t.color || cols[i % 4], me: t.id === d.my_team }; });
    } else {
      var ids = (d.players || []).map(function (q) { return String(q.id); }).sort();
      rows = (d.players || []).map(function (q) { return { id: q.id, name: q.handle, score: q.points, shown: String(q.points), color: PAL[ids.indexOf(String(q.id)) % 6], me: q.id === ST.me, left: q.forfeit }; });
    }
    var top = Math.max.apply(null, rows.map(function (r) { return r.score; }).concat([1]));
    var dbl = tb && FX() && FX().inDouble(d.dbl_at && new Date(d.dbl_at).getTime(), skew);
    var me = tb ? (d.me || {}) : ((d.players || []).filter(function (q) { return q.id === ST.me; })[0] || {});
    p.className = "card";
    p.setAttribute("style", "margin-bottom:18px;padding:22px 24px;border:2px solid var(--amber);box-shadow:0 0 34px -14px var(--amber);");
    p.innerHTML =
      '<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:18px;">' +
        '<div style="flex:1;min-width:200px;"><div class="mono" style="font-size:12px;letter-spacing:2px;color:var(--amber);font-weight:700;">' + (tb ? "\u2691 TEAM BATTLE ARENA" : "\u2694 FLAG DUEL ARENA") + '</div>' +
          '<div class="mono" style="font-size:12px;color:var(--dim);margin-top:4px;">' + (d.modules || []).map(function (m) { return "Module " + m; }).join(" \u00b7 ") + (tb ? " \u00b7 team score = average per player" : "") + '</div></div>' +
        (dbl ? '<span class="mono bfxPulse" style="font-size:12px;font-weight:800;padding:5px 11px;border-radius:999px;background:#ffcf5c;color:#1a1200;">\u2605 DOUBLE POINTS</span>' : '') +
        '<div style="text-align:right;"><div class="mono" style="font-size:10px;letter-spacing:1.5px;color:var(--faint);">TIME LEFT</div><div class="mono" id="fdClock" aria-live="off" style="font-size:40px;font-weight:800;line-height:1.05;color:var(--bright);"></div></div>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:10px;">' + rows.map(function (r) {
        var w = Math.max(3, Math.round(r.score / top * 100));
        return '<div id="' + (tb ? "tbc-" : "adc-") + esc(r.id) + '" style="display:grid;grid-template-columns:minmax(90px,170px) minmax(0,1fr) 64px;align-items:center;gap:12px;' + (r.left ? "opacity:.5;" : "") + '">' +
          '<span style="font-weight:700;color:var(--bright);font-size:14px;overflow-wrap:anywhere;">' + esc(r.name) + (r.me ? ' <span class="mono" style="font-size:10px;color:var(--accent);">' + (tb ? "YOUR TEAM" : "YOU") + '</span>' : '') + (r.left ? ' <span class="mono" style="font-size:10px;color:var(--dim);">LEFT</span>' : '') + '</span>' +
          '<span style="height:22px;border-radius:999px;background:var(--bg);border:1px solid ' + (r.me ? "var(--accent)" : "var(--border2)") + ';overflow:hidden;"><span style="display:block;height:100%;width:' + w + '%;background:' + esc(r.color) + ';border-radius:999px;transition:width .6s ease;"></span></span>' +
          '<span class="mono" style="font-size:20px;font-weight:800;color:var(--amber);text-align:right;">' + esc(r.shown) + '</span></div>';
      }).join("") + '</div>' +
      '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:18px;padding-top:14px;border-top:1px solid var(--border2);">' +
        '<span class="mono" style="font-size:13px;color:var(--muted);flex:1;min-width:180px;">You: <b style="color:var(--bright);font-size:16px;">' + (me.points || 0) + '</b> pts' + (tb && me.caps != null ? ' \u00b7 ' + me.caps + ' captures' : '') + ' \u00b7 Easy 1 \u00b7 Medium 2 \u00b7 Hard 3</span>' +
        '<button type="button" id="arFull" class="mono" style="font-size:11px;font-weight:700;padding:8px 12px;min-height:36px;border-radius:8px;border:1px solid var(--border3);background:transparent;color:var(--dim);cursor:pointer;">Full CTF page</button>' +
        (tb ? exitBtn("Exit battle") : exitBtn("Forfeit")) +
      '</div>';
    p.querySelector("#arFull").onclick = function () { setOff(d.id, true); bar(); };
    var x = p.querySelector("#fdExit"); if (x) x.onclick = function () { exitNow(tb ? "tb" : "ad"); };
    if (tb) hype("tb" + d.id, { status: d.status, teams: rows.map(function (r) { return { id: r.id, name: r.me ? r.name + " (you)" : r.name, color: r.color, score: r.score }; }), feed: [] }, "tbc-");
    else {
      var byH = {}; (d.players || []).forEach(function (q) { byH[q.handle] = q.id; });
      hype("ad" + d.id, { status: "live", teams: rows.filter(function (r) { return !r.left; }).map(function (r) { return { id: r.id, name: r.me ? "YOU" : r.name, color: r.color, score: r.score }; }),
        feed: (d.feed || []).map(function (f) { return { who: f.handle, team: byH[f.handle], at: f.at, pts: f.pts, bounty: f.bounty }; }) }, "adc-", { streakBy: "who" });
    }
    if (!tick) tick = setInterval(clock, 500);
    clock();
  }

  /* 27.0: animated background in arena view (battle-bg.js; teacher picks the style) */
  function bgArena(on) {
    if (!document.getElementById("ctfRoot")) return;   // duel room pages use their own "duel" background
    if (!on) { if (window.BATTLE_BG) window.BATTLE_BG.set("off"); return; }
    if (!window.BATTLE_BG) {
      if (!bgArena.loading) { bgArena.loading = 1; var s = document.createElement("script"); s.src = (me.src || "").replace(/arena-duel\.js.*$/, "battle-bg.js") + "?v=" + (window.SITE_VERSION || ""); s.onload = function () { bgArena(!!window.CTF_FOCUS); }; document.head.appendChild(s); }
      return;
    }
    window.BATTLE_BG.use("arena", ST && ST.bg);
  }
  function brPanel(L) {
    var root = document.getElementById("ctfRoot"); if (!root) return;
    var p = document.getElementById("arenaHead");
    if (!p) { p = document.createElement("div"); p.id = "arenaHead"; root.parentNode.insertBefore(p, root); }
    var m = ST.br.match, pv = brPanel.prev, fx = FX();
    p.className = "card";
    p.setAttribute("style", "margin-bottom:18px;padding:22px 24px;border:2px solid var(--amber);box-shadow:0 0 34px -14px var(--amber);");
    function side(lbl, pts, col) { return '<div style="flex:1;min-width:140px;"><div style="font-weight:700;color:var(--bright);font-size:15px;overflow-wrap:anywhere;">' + esc(lbl) + '</div>' +
      '<div class="mono" style="font-size:44px;font-weight:800;color:' + col + ';line-height:1.1;">' + pts + '<span style="font-size:18px;color:var(--faint);">/3</span></div>' +
      '<div style="height:12px;border-radius:999px;background:var(--bg);border:1px solid var(--border2);overflow:hidden;margin-top:6px;"><div style="height:100%;width:' + Math.min(100, Math.round(pts / 3 * 100)) + '%;background:' + col + ';transition:width .5s ease;"></div></div></div>'; }
    p.innerHTML =
      '<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:16px;"><div style="flex:1;min-width:200px;">' +
        '<div class="mono" style="font-size:12px;letter-spacing:2px;color:var(--amber);font-weight:700;">\u2694 BRACKET MATCH \u00b7 ' + (m.side === "cons" ? "CONSOLATION \u00b7 " : "") + 'ROUND ' + m.round + ' \u00b7 GAME ' + m.game_no + '</div>' +
        '<div class="mono" style="font-size:12px;color:var(--dim);margin-top:4px;">Race to 3 flag points \u00b7 Easy 1 \u00b7 Medium 2 \u00b7 Hard 3 \u00b7 ' + (m.open || 0) + ' open flags left</div></div>' +
        '<div class="mono" style="font-size:22px;font-weight:800;color:var(--bright);">Games ' + m.my_games + '\u2013' + m.opp_games + '</div></div>' +
      '<div style="display:flex;gap:22px;flex-wrap:wrap;">' + side("You", m.my_pts, "#00b3ff") + side(m.opp || "Opponent", m.opp_pts, "#ff5d73") + '</div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;padding-top:14px;border-top:1px solid var(--border2);">' +
        '<a href="' + BROOM + '" class="mono" style="font-size:11px;font-weight:700;padding:8px 12px;min-height:36px;display:inline-flex;align-items:center;border-radius:8px;border:1px solid var(--amber);color:var(--bright);">Bracket page</a>' +
        '<button type="button" id="arFull" class="mono" style="font-size:11px;font-weight:700;padding:8px 12px;min-height:36px;border-radius:8px;border:1px solid var(--border3);background:transparent;color:var(--dim);cursor:pointer;">Full CTF page</button></div>';
    p.querySelector("#arFull").onclick = function () { setOff(m.id, true); bar(); };
    if (fx && pv && pv.id === m.id) {
      if (m.my_pts > pv.my) fx.banner("+" + (m.my_pts - pv.my) + " FLAG POINTS", "#00b3ff", m.my_pts + "/3 \u00b7 first to 3 wins the game");
      if (m.opp_pts > pv.opp) fx.caster((m.opp || "Your opponent") + " captures! " + m.opp_pts + "/3", "#ff5d73");
    }
    brPanel.prev = { id: m.id, my: m.my_pts, opp: m.opp_pts };
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
      return '<span id="tbc-' + esc(t.id) + '" style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;border:' + (mine ? "2px solid var(--accent)" : "1px solid var(--border3)") + ';background:var(--bg);">' +
        '<span aria-hidden="true" style="width:10px;height:10px;border-radius:3px;background:' + esc(t.color || cols[i % 4]) + ';"></span>' +
        '<span style="font-weight:700;color:var(--bright);font-size:13px;">' + esc(t.name) + (mine ? ' <span class="mono" style="font-size:10px;color:var(--accent);">YOUR TEAM</span>' : '') + '</span>' +
        '<span class="mono" style="font-weight:800;font-size:15px;color:var(--amber);">' + (+t.avg).toFixed(1) + '</span>' +
        (b.status === "done" && t.won ? '<span class="mono" style="font-size:10px;color:var(--accent);">\u2605 WIN</span>' : '') + '</span>';
    }).join("");
    var me = b.me || {}, right;
    var dbl = b.status === "live" && FX() && FX().inDouble(b.dbl_at && new Date(b.dbl_at).getTime(), skew);
    if (b.status === "live") right = (dbl ? '<span class="mono bfxPulse" style="font-size:12px;font-weight:800;padding:4px 10px;border-radius:999px;background:#ffcf5c;color:#1a1200;">\u2605 DOUBLE POINTS</span>' : '') +
      '<span class="mono" style="font-size:12px;color:var(--muted);">You: <b style="color:var(--bright);">' + (me.points || 0) + '</b> pts</span>' +
      (b.ends_at ? '<span class="mono" id="fdClock" style="font-size:22px;font-weight:800;color:var(--bright);min-width:70px;text-align:right;"></span>' : '') + arenaBtn(b.id) + exitBtn("Exit battle");
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
    wireArenaBtn(el, b.id);
    hype("tb" + b.id, { status: b.status, teams: T.map(function (t, i) { return { id: t.id, name: t.id === b.my_team ? t.name + " (you)" : t.name, color: t.color || cols[i % 4], score: +t.avg }; }), feed: [] }, "tbc-");
    clearFixed();
    if (b.status === "live" && b.ends_at && !tick) tick = setInterval(clock, 500);
    if (b.status !== "live") { clearInterval(tick); tick = null; }
    clock();
  }
  function bar() {
    var d = ST && (ST.tb || ST.duel), el = document.getElementById("fdBar");
    var L = focus();
    if (L) { if (el) el.remove(); document.body.style.paddingTop = ""; return L.kind === "br" ? brPanel(L) : arenaPanel(L); }
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
      return '<span id="adc-' + esc(p.id) + '" style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;border:' + (mine ? "2px solid var(--accent)" : "1px solid var(--border3)") + ';background:var(--bg);' + (p.forfeit ? "opacity:.55;" : "") + '">' +
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
    if (d.status === "live") right += arenaBtn(d.id);
    if (d.status !== "done") right += exitBtn(d.status === "live" ? "Forfeit" : "Leave");
    el.innerHTML = '<div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">' +
      '<span class="mono" style="font-size:11px;letter-spacing:1.5px;color:var(--amber);font-weight:700;">\u2694 DUEL</span>' +
      '<span class="mono" style="font-size:11px;color:var(--dim);">' + esc(mods) + '</span>' +
      '<span style="display:flex;gap:8px;flex-wrap:wrap;flex:1;min-width:0;">' + chips + '</span>' + right +
      '<a href="' + ROOM + '" class="mono" style="font-size:11px;font-weight:700;padding:6px 10px;border-radius:8px;border:1px solid var(--amber);color:var(--bright);">Duel room</a></div>';
    var c = el.querySelector("#fdClose"); if (c) c.onclick = function () { hidDone = d.id; bar(); };
    var x = el.querySelector("#fdExit"); if (x) x.onclick = function () { exitNow("ad"); };
    wireArenaBtn(el, d.id);
    if (d.status !== "lobby") {
      var ids = (d.players || []).map(function (p) { return String(p.id); }).sort(), byH = {};
      (d.players || []).forEach(function (p) { byH[p.handle] = p.id; });
      hype("ad" + d.id, { status: d.status === "done" ? "done" : "live",
        teams: (d.players || []).filter(function (p) { return !p.forfeit; }).map(function (p) { return { id: p.id, name: p.id === ST.me ? "YOU" : p.handle, color: PAL[ids.indexOf(String(p.id)) % 6], score: p.points }; }),
        feed: (d.feed || []).map(function (f) { return { who: f.handle, team: byH[f.handle], at: f.at, pts: f.pts, bounty: f.bounty }; }) }, "adc-", { streakBy: "who" });
    }
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
    if (FX() && d.status === "live") FX().clock((ST.tb ? "tb" : "ad") + d.id, left, { el: el, dblAt: ST.tb && d.dbl_at && new Date(d.dbl_at).getTime(), skew: skew });
    if (left <= 0) { clearInterval(tick); tick = null; setTimeout(poll, 1200); }
  }
  function poll() {
    clearTimeout(timer);
    var s = sess(course); if (!s) { timer = setTimeout(poll, 15000); return; }
    var tbP = AUTH.rpc("ctf_tb_state", { p_student: s.studentId }).catch(function () { return null; });   // team-battles.sql optional
    var adP = AUTH.rpc("ctf_ad_state", { p_student: s.studentId }).catch(function () { return null; });   // arena-duels.sql optional
    var vdP = AUTH.rpc("ctf_vd_state", { p_student: s.studentId }).catch(function () { return null; });   // vocab-duels.sql optional
    var brP = AUTH.rpc("ctf_br_state", { p_student: s.studentId }).catch(function () { return null; });   // brackets.sql optional
    var rdP = AUTH.rpc("ctf_raid_state", { p_student: s.studentId, p_peek: true }).catch(function () { return null; });   // raids.sql optional
    var lbP = AUTH.rpc("ctf_lobby_state", { p_student: s.studentId }).catch(function () { return null; });   // waiting-room.sql optional
    Promise.all([adP, tbP, vdP, brP, rdP, lbP]).then(function (r) {
      var d = (r[0] && !r[0].error) ? r[0] : { duels_on: false, duel: null }, tb = r[1] && !r[1].error ? r[1].battle : null;
      if (!r[0] && !tb && !(r[2] && !r[2].error) && !(r[3] && !r[3].error) && !(r[4] && r[4].raid) && !(r[5] && r[5].lobby)) { ST = null; card(); bar(); timer = setTimeout(poll, 30000); return; }
      d.tb = tb && !(tb.status === "done" && hidDone === tb.id) ? tb : null;
      d.vd = r[2] && !r[2].error ? r[2] : null;
      d.br = r[3] && !r[3].error ? r[3] : null; d.bg = d.br && d.br.bg;
      d.raid = r[4] && !r[4].error ? r[4].raid : null;
      d.lobby = r[5] && !r[5].error && r[5].lobby && !r[5].live ? r[5].lobby : null;
      ST = d; var now = (r[0] && r[0].now) || (r[1] && r[1].now); if (now) skew = new Date(now).getTime() - Date.now();
      card(); bar();
      var hot = (d.tb && d.tb.status === "live") || (d.duel && d.duel.status !== "done") || (d.vd && d.vd.class_live) || (d.br && d.br.bracket && d.br.bracket.status === "live") || (d.raid && d.raid.status === "live") || !!d.lobby;
      timer = setTimeout(poll, hot ? 5000 : 20000);
    });
  }
  // ctf.js re-renders #ctfRoot often; the card lives outside it, so only re-add if removed
  function start() { openMod(); setTimeout(poll, 800); }
  document.addEventListener("visibilitychange", function () { if (!document.hidden) poll(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
