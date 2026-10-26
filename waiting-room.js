// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* waiting-room.js (v29.0; 32.1 brackets + 5 s countdown) — teacher side of the class duel waiting room (supabase/waiting-room.sql).
   Used by battle.html (kind "team"), vocab-battle.html ("vocab"), raid.html ("raid") and bracket.html ("bracket").
   WROOM.attach({ kind, rpc, classId(), demo, teams(), people() }) → { html(), bind(root), go(startFn) }
     teams()  — optional: ids of the ticked teams (31.2). Unticked teams are left out of the room card and the count.
     people() — optional: ids of the ticked students (32.1, brackets). Squads show only those students, plus a "No squad" group.
     html()  — the waiting-room card for the setup screen
     go(fn)  — if the room is open: 5 s countdown on every student's screen, then fn(); else fn() now.
               Call this from the page's Start button; when fn's battle is live the room flips to "started". */
(function () {
  if (window.WROOM) return;
  var SECS = 5;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var LBL = { team: "Team Battle", vocab: "Vocab Battle", raid: "Boss Raid", bracket: "Duel Bracket" };
  function css() {
    if (document.getElementById("wrCss")) return;
    var s = document.createElement("style"); s.id = "wrCss";
    s.textContent = "#wrOver{position:fixed;inset:0;z-index:99990;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:rgba(5,8,14,.86);color:#fff;font-family:'JetBrains Mono',monospace;text-align:center;}" +
      "#wrOver b{font-size:min(38vw,320px);line-height:1;font-weight:800;}#wrOver span{font-size:22px;letter-spacing:3px;}" +
      "@keyframes wrPop{0%{transform:scale(1.35);opacity:.2}100%{transform:scale(1);opacity:1}}#wrOver b.p{animation:wrPop .45s ease-out;}";
    document.head.appendChild(s);
  }
  function attach(o) {
    var ST = null, timer = null, counting = false, skew = 0, err = "";
    function rpc(fn, a) { return o.demo ? Promise.resolve(demo(fn, a)) : o.rpc(fn, a); }
    var D = { lobby: null, here: {} };
    function demo(fn, a) {
      if (fn === "ctf_t_lobby_open") { D.lobby = { kind: o.kind, status: "open", opened_at: new Date().toISOString() }; D.t0 = Date.now(); return { ok: true }; }
      if (fn === "ctf_t_lobby_set") { if (a.p_status === "closed") D.lobby = null; else if (D.lobby) { D.lobby.status = a.p_status; if (a.p_status === "counting") D.lobby.start_at = new Date(Date.now() + SECS * 1000).toISOString(); } return { ok: true, now: new Date().toISOString(), start_at: D.lobby && D.lobby.start_at }; }
      var names = [["Red Rockets", "#ff5d73", ["byte_knight", "zero_day", "packet_pal", "nullptr"]], ["Blue Byte", "#3a86ff", ["cipher_sam", "root_ruth", "hex_hero", "bitwise"]], ["Green Ghosts", "#2ec27e", ["sudo_sue", "pingu", "lambda_lu"]]];
      var n = D.lobby ? Math.min(11, Math.floor((Date.now() - D.t0) / 900)) : 0, k = 0;
      return { now: new Date().toISOString(), lobby: D.lobby, live: null, room: { ungrouped: 0, here: n, teams: names.map(function (t, i) { return { id: "g" + i, name: t[0], color: t[1], members: t[2].map(function (h) { return { id: h, handle: h, here: k++ < n }; }) }; }) } };
    }
    function load() {
      clearTimeout(timer);
      var cid = o.classId(); if (!cid) return;
      rpc("ctf_t_lobby_state", { p_class: cid }).then(function (d) {
        if (!d || d.error) { ST = "na"; } else { ST = d; if (d.now) skew = new Date(d.now).getTime() - Date.now(); }
        paint(); timer = setTimeout(load, ST && ST.lobby ? 2000 : 8000);
      }).catch(function () { ST = "na"; paint(); timer = setTimeout(load, 15000); });
    }
    function open() { return ST && ST !== "na" && ST.lobby && ST.lobby.status !== "started" && ST.lobby.kind === o.kind; }
    function html() {
      if (ST === "na") return '<div class="card" id="wrCard" style="margin-bottom:18px;font-size:13px;color:var(--dim);">Waiting room: run <b>supabase/waiting-room.sql</b> to gather students before you start.</div>';
      if (!ST) return '<div class="card" id="wrCard" style="margin-bottom:18px;"><span class="mono" style="font-size:12px;color:var(--dim);">Waiting room\u2026</span></div>';
      var L = ST.lobby, R = ST.room || { teams: [], here: 0 }, other = L && L.kind !== o.kind && L.status !== "started";
      if (!L || L.status === "started" || other) {
        return '<div class="card" id="wrCard" style="margin-bottom:18px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;">' +
          '<div style="flex:1;min-width:240px;"><div style="font-weight:800;color:var(--bright);font-size:16px;">Waiting room</div>' +
          '<div style="font-size:13px;color:var(--muted);margin-top:4px;line-height:1.5;">Every class duel starts here. Open it, then students tap <b>Duel Waiting Room</b> on their course home, see their team, and get a ' + SECS + '-second countdown when you press Start.' +
          (other ? ' <b style="color:var(--amber);">The room is open for a ' + esc(LBL[L.kind]) + ' right now. Opening it here switches it.</b>' : '') + '</div></div>' +
          '<button type="button" class="btn" id="wrOpen">Open waiting room</button></div>';
      }
      var pickIds = o.teams ? o.teams() : null, RT = R.teams || [], out = [], ppl = o.people ? o.people() : null;
      if (pickIds) { RT = RT.filter(function (t) { if (pickIds.indexOf(t.id) >= 0) return true; out.push(t.name); return false; }); }
      if (ppl) {
        RT = RT.concat((R.loose || []).length ? [{ id: "_none", name: "No squad", color: "", members: R.loose }] : [])
          .map(function (t) { return { id: t.id, name: t.name, color: t.color, members: (t.members || []).filter(function (m) { return ppl.indexOf(m.id) >= 0; }) }; })
          .filter(function (t) { return t.members.length; });
        pickIds = ppl;
      }
      var tot = 0, here = 0; RT.forEach(function (t) { tot += (t.members || []).length; here += (t.members || []).filter(function (m) { return m.here; }).length; });
      if (!pickIds) here = R.here;
      return '<div class="card" id="wrCard" style="margin-bottom:18px;border:2px solid var(--amber);box-shadow:0 0 26px -12px var(--amber);">' +
        '<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:14px;">' +
          '<div style="flex:1;min-width:220px;"><div class="mono" style="font-size:12px;letter-spacing:2px;color:var(--amber);font-weight:800;">WAITING ROOM OPEN \u00b7 ' + esc(LBL[o.kind]).toUpperCase() + '</div>' +
          '<div style="font-size:13px;color:var(--muted);margin-top:4px;">Students join from <b>Duel Waiting Room</b> on their course home. Start runs a ' + SECS + '-second countdown on every screen.' + (ppl && !ppl.length ? ' <b style="color:var(--amber);">Tick players below to see who\u2019s here.</b>' : '') + '</div></div>' +
          '<div class="mono" style="font-size:40px;font-weight:800;color:var(--bright);line-height:1;">' + here + '<span style="font-size:18px;color:var(--dim);"> / ' + tot + ' here</span></div>' +
          '<button type="button" class="btn ghost" id="wrClose">Close room</button></div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;">' + RT.map(function (t) {
          var h = (t.members || []).filter(function (m) { return m.here; }).length;
          return '<div style="border:1px solid var(--border2);border-left:4px solid ' + esc(t.color || "var(--border3)") + ';border-radius:10px;padding:10px 12px;background:var(--bg);">' +
            '<div style="display:flex;align-items:baseline;gap:8px;margin-bottom:6px;"><b style="flex:1;color:var(--bright);">' + esc(t.name) + '</b><span class="mono" style="font-size:12px;color:var(--dim);">' + h + '/' + (t.members || []).length + '</span></div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:4px 10px;">' + (t.members || []).map(function (m) { return '<span style="font-size:12px;color:' + (m.here ? "var(--bright)" : "var(--faint)") + ';">' + (m.here ? '<span style="color:var(--ok);">\u25cf</span> ' : '\u25cb ') + esc(m.handle) + '</span>'; }).join("") + '</div></div>';
        }).join("") + '</div>' +
        (out.length ? '<div style="margin-top:10px;font-size:12px;color:var(--dim);">Sitting out (not ticked): ' + out.map(esc).join(', ') + '. They are not in this battle or its results.</div>' : '') +
        (R.ungrouped && !ppl ? '<div style="margin-top:10px;font-size:12px;color:var(--amber);">' + R.ungrouped + ' student' + (R.ungrouped > 1 ? "s have" : " has") + ' no squad. They can still open the room but sit out a team battle.</div>' : '') +
        (err ? '<div role="alert" style="margin-top:10px;font-size:13px;color:var(--bad);font-weight:700;">' + esc(err) + '</div>' : '') + '</div>';
    }
    function paint() {
      var c = document.getElementById("wrCard"); if (!c) return;
      var f = document.activeElement && document.activeElement.id;
      var tmp = document.createElement("div"); tmp.innerHTML = html(); var n = tmp.firstChild;
      c.replaceWith(n); bind(n.parentNode);
      if (f && document.getElementById(f)) document.getElementById(f).focus();
      var st = document.querySelector("[data-wr-start]");
      if (st) st.textContent = label() || st.getAttribute("data-wr-start");
    }
    // 29.2: every class duel goes through the room. Without waiting-room.sql ("na") the page starts directly.
    function needsRoom() { return !!ST && ST !== "na" && !open(); }
    function label() { return open() ? "Start \u00b7 " + SECS + " s countdown" : needsRoom() ? "Open waiting room" : null; }
    function openRoom() { err = ""; return rpc("ctf_t_lobby_open", { p_class: o.classId(), p_kind: o.kind }).then(load).catch(function () { err = "Couldn\u2019t open. Run supabase/waiting-room.sql."; ST = "na"; paint(); }); }
    function bind(root) {
      var op = (root || document).querySelector("#wrOpen"); if (op) op.onclick = openRoom;
      var cl = (root || document).querySelector("#wrClose"); if (cl) cl.onclick = function () { rpc("ctf_t_lobby_set", { p_class: o.classId(), p_status: "closed" }).then(load); };
    }
    function overlay(endAt, done) {
      css(); var FX = window.BATTLE_FX, ov = document.createElement("div"); ov.id = "wrOver"; ov.setAttribute("role", "status"); ov.setAttribute("aria-live", "assertive");
      ov.innerHTML = '<span>' + esc(LBL[o.kind]).toUpperCase() + ' STARTS IN</span><b>' + SECS + '</b><span style="font-size:14px;opacity:.75;">Every student in the waiting room sees this countdown</span>';
      document.body.appendChild(ov);
      var b = ov.querySelector("b"), last = -1;
      (function tick() {
        var left = Math.ceil((endAt - Date.now()) / 1000);
        if (left !== last) { last = left; b.textContent = left > 0 ? left : "GO!"; b.classList.remove("p"); void b.offsetWidth; b.classList.add("p"); if (FX) FX.sfx(left > 0 ? (left <= 3 ? "blood" : "tick") : "horn"); }
        if (left <= 0) { setTimeout(function () { ov.remove(); }, 700); return done(); }
        setTimeout(tick, 100);
      })();
    }
    function go(startFn) {
      if (!open() || counting) return startFn(function () {});
      counting = true; err = "";
      rpc("ctf_t_lobby_set", { p_class: o.classId(), p_status: "counting", p_secs: SECS }).then(function (r) {
        var end = r && r.start_at ? new Date(r.start_at).getTime() - (r.now ? new Date(r.now).getTime() - Date.now() : skew) : Date.now() + SECS * 1000;
        overlay(end, function () {
          startFn(function (ok) {
            counting = false;
            rpc("ctf_t_lobby_set", { p_class: o.classId(), p_status: ok ? "started" : "open" }).then(load);
          });
        });
      }).catch(function () { counting = false; startFn(function () {}); });
    }
    load();
    return { html: html, bind: bind, go: go, reload: load, isOpen: open, needsRoom: needsRoom, openRoom: openRoom, label: label };
  }
  window.WROOM = { attach: attach };
})();
