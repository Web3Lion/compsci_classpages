// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* bracket-tree.js (v27.0; 31.6 rematch pool) — draws a duel bracket (supabase/brackets.sql _br_tree) as HTML. Shared by bracket.html + bracket-play.html. */
(function () {
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function rname(r, max) { var k = max - r; return k === 0 ? "FINAL" : k === 1 ? "SEMIFINALS" : k === 2 ? "QUARTERFINALS" : "ROUND " + r; }
  function side(tree, sideName, o) {
    var M = (tree.matches || []).filter(function (m) { return m.side === sideName; });
    if (!M.length) return "";
    var E = {}; (tree.entrants || []).forEach(function (e) { E[e.id] = e; });
    var max = Math.max.apply(null, M.map(function (m) { return m.round; }));
    var cols = [];
    for (var r = 1; r <= max; r++) {
      var ms = M.filter(function (m) { return m.round === r; }).sort(function (a, b) { return a.slot - b.slot; });
      cols.push('<div style="display:flex;flex-direction:column;justify-content:space-around;gap:14px;min-width:200px;flex:1;">' +
        '<div class="mono" style="font-size:11px;letter-spacing:1.5px;color:var(--faint);text-align:center;">' + rname(r, max) + '</div>' +
        ms.map(function (m) { return box(m, E, o, r === max); }).join("") + '</div>');
    }
    return '<div style="margin-bottom:26px;"><div class="mono" style="font-size:12px;letter-spacing:2px;font-weight:800;color:' + (sideName === "main" ? "var(--amber)" : "var(--dim)") + ';margin-bottom:10px;">' + (sideName === "main" ? "\u2694 MAIN BRACKET" : "\u21bb CONSOLATION BRACKET") + '</div>' +
      '<div style="display:flex;gap:18px;overflow-x:auto;padding-bottom:8px;">' + cols.join("") + '</div></div>';
  }
  function row(id, E, m, isA, o) {
    var e = id ? E[id] : null, won = m.status === "done" && m.winner && m.winner === id, lost = m.status === "done" && m.winner && id && m.winner !== id;
    var me = o.me && id === o.me, g = isA ? m.wa : m.wb;
    var live = m.status === "live" && m.game_kind ? (m.game_kind === "flag" ? (isA ? m.ga : m.gb) + "/3" : o.sudden && m.side !== "pool" ? (isA ? m.ga : m.gb) + " pts" : Math.round((isA ? m.hp_a : m.hp_b) / 3) + "%") : "";
    return '<div style="display:flex;align-items:center;gap:8px;padding:7px 10px;' + (isA ? "border-bottom:1px solid var(--border2);" : "") + (lost ? "opacity:.5;" : "") + (me ? "background:color-mix(in srgb, var(--accent) 14%, transparent);" : "") + '">' +
      '<span class="mono" style="width:22px;font-size:11px;color:var(--faint);">' + (e ? e.seed : "") + '</span>' +
      '<span style="flex:1;min-width:0;font-size:14px;font-weight:' + (won ? 800 : 600) + ';color:' + (e ? "var(--bright)" : "var(--faint)") + ';overflow-wrap:anywhere;">' + (e ? esc(e.handle) : m.bye && m.status === "done" ? "BYE" : "\u2014") + (e && o.showHere && m.status !== "done" ? (e.here ? ' <span title="On the page" style="color:var(--ok);">\u25cf</span>' : ' <span title="Not on the page" style="color:var(--faint);">\u25cb</span>') : '') + '</span>' +
      (live ? '<span class="mono" style="font-size:11px;color:var(--accent);">' + live + '</span>' : '') +
      '<span class="mono" style="min-width:16px;text-align:right;font-size:15px;font-weight:800;color:' + (won ? "var(--amber)" : "var(--bright)") + ';">' + (m.bye ? "" : g) + '</span></div>';
  }
  function box(m, E, o, final) {
    var st = m.status === "live" ? (m.game_kind ? "LIVE \u00b7 GAME " + m.game_no + (m.game_kind === "vocab" && o.kind === "flag" ? " \u00b7 VOCAB TIEBREAK" : "") : "NEXT GAME\u2026")
      : m.status === "ready" ? "WAITING FOR PLAYERS" : m.status === "done" ? (m.bye ? "BYE" : m.forfeit ? "FORFEIT" : "FINAL") : "";
    var hot = m.status === "live";
    return '<div id="bm-' + esc(m.id) + '" style="border:' + (hot ? "2px solid var(--amber)" : final ? "2px solid var(--border3)" : "1px solid var(--border)") + ';border-radius:12px;background:var(--panel);overflow:hidden;' + (hot ? "box-shadow:0 0 22px -8px var(--amber);" : "") + '">' +
      row(m.a, E, m, true, o) + row(m.b, E, m, false, o) +
      (st ? '<div class="mono" style="font-size:10px;letter-spacing:1px;padding:4px 10px;color:' + (hot ? "var(--amber)" : "var(--faint)") + ';background:var(--panel2);">' + st + '</div>' : '') + '</div>';
  }
  function pool(tree, o) {
    var P = (tree.matches || []).filter(function (m) { return m.side === "pool"; });
    if (!P.length) return "";
    var E = {}; (tree.entrants || []).forEach(function (e) { E[e.id] = e; });
    var act = P.filter(function (m) { return m.status !== "done"; }), done = P.length - act.length;
    return '<div style="margin-bottom:26px;"><div class="mono" style="font-size:12px;letter-spacing:2px;font-weight:800;color:var(--dim);margin-bottom:10px;">\u27f3 REMATCH POOL \u00b7 JUST FOR FUN \u00b7 ' + done + ' PLAYED</div>' +
      (act.length ? '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;">' + act.map(function (m) { return box(m, E, o, false); }).join("") + '</div>'
        : '<div style="font-size:13px;color:var(--faint);">No rematches running right now.</div>') + '</div>';
  }
  function html(tree, o) { o = o || {}; if (!tree) return ""; return side(tree, "main", o) + side(tree, "cons", o) + pool(tree, o); }
  function podium(tree) {
    var P = { champion: [], runner_up: [], semi: [], cons_champ: [] };
    (tree.entrants || []).forEach(function (e) { if (P[e.place]) P[e.place].push(e); });
    function line(lbl, a, col) { return a.length ? '<div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;"><span class="mono" style="font-size:12px;letter-spacing:1.5px;color:' + col + ';min-width:150px;">' + lbl + '</span><b style="font-size:20px;color:var(--bright);">' + a.map(function (e) { return esc(e.handle) + ' <span class="mono" style="font-size:12px;color:var(--dim);">+' + e.xp_paid + ' XP</span>'; }).join(" \u00b7 ") + '</b></div>' : ""; }
    return line("\u2655 CHAMPION", P.champion, "#ffcf5c") + line("RUNNER-UP", P.runner_up, "var(--muted)") + line("SEMIFINALS", P.semi, "var(--dim)") + line("CONSOLATION CHAMP", P.cons_champ, "var(--dim)");
  }
  window.BRACKET_TREE = { html: html, podium: podium, esc: esc };
})();
