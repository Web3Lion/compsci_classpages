// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* team-picker.js (v26.0) — shared by battle.html + vocab-battle.html.
   Pick which squads play (2–4) and save / load named team sets (supabase/squad-sets.sql). */
(function () {
  var S = { cls: null, sel: {}, sets: null, pickSet: "" };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function sync(id) { if (S.cls !== id) { S.cls = id; S.sel = {}; S.sets = null; S.pickSet = ""; } }
  function chosen(T) { return (T || []).filter(function (t) { return S.sel[t.id] !== false; }).map(function (t) { return t.id; }); }
  function fetchSets(rpc, id, repaint) {
    sync(id); if (S.sets !== null) return; S.sets = [];
    Promise.resolve(rpc("ctf_t_squadset_list", { p_class: id })).then(function (r) { S.sets = r === undefined ? [] : Array.isArray(r) ? r : "na"; repaint(); })
      .catch(function () { S.sets = "na"; repaint(); });
  }
  function teams(T, col, busy) {
    if (!T.length) return '<div style="color:var(--dim);font-size:14px;">No teams yet.</div>';
    return T.map(function (t, i) {
      var on = S.sel[t.id] !== false;
      return '<label style="display:flex;align-items:center;gap:10px;padding:10px 14px;min-height:44px;box-sizing:border-box;border-radius:10px;background:var(--bg);border:1px solid ' + (on ? "var(--border3)" : "var(--border2)") + ';cursor:pointer;' + (on ? "" : "opacity:.55;") + '">' +
        '<input type="checkbox" class="tpTeam" data-id="' + esc(t.id) + '"' + (on ? " checked" : "") + (busy ? " disabled" : "") + ' style="width:18px;height:18px;accent-color:var(--amber);">' +
        '<span style="width:14px;height:14px;border-radius:4px;background:' + esc(col(t, i)) + ';"></span>' +
        '<b style="flex:1;min-width:0;color:var(--bright);overflow-wrap:anywhere;">' + esc(t.name) + '</b>' +
        '<span class="mono" style="font-size:12px;color:var(--dim);">' + (on ? t.members + " students" : "sitting out") + '</span></label>';
    }).join("");
  }
  function note(T) {
    var n = chosen(T).length;
    if (T.length >= 2 && n < 2) return '<div role="alert" style="margin-top:10px;font-size:13px;color:var(--bad);font-weight:700;">Pick at least 2 teams.</div>';
    if (n > 4) return '<div role="alert" style="margin-top:10px;font-size:13px;color:var(--bad);font-weight:700;">Battles take 2\u20134 teams. Untick some.</div>';
    if (n < T.length) return '<div style="margin-top:10px;font-size:13px;color:var(--muted);">Only the ticked teams play. Everyone else sits out this battle.</div>';
    return "";
  }
  function setsBar(busy) {
    var L = S.sets, dis = busy ? " disabled" : "";
    var h = '<div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--border2);"><div style="font-size:14px;color:var(--bright);font-weight:700;margin-bottom:8px;">Saved team sets</div>';
    if (L === "na") return h + '<div style="font-size:12px;color:var(--dim);">Run supabase/squad-sets.sql to save and reload teams.</div></div>';
    if (L && L.length) {
      if (!L.some(function (s) { return s.id === S.pickSet; })) S.pickSet = L[0].id;
      h += '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px;"><select id="tpSet" aria-label="Saved team set" style="flex:1;min-width:160px;min-height:40px;"' + dis + '>' +
        L.map(function (s) { return '<option value="' + esc(s.id) + '"' + (s.id === S.pickSet ? " selected" : "") + '>' + esc(s.name) + ' (' + (s.teams || []).map(function (t) { return esc(t.name) + " " + t.n; }).join(", ") + ')</option>'; }).join("") +
        '</select><button type="button" class="btn ghost" id="tpLoad"' + dis + '>Load</button><button type="button" class="btn ghost" id="tpDel"' + dis + ' aria-label="Delete saved set">Delete</button></div>';
    } else h += '<div style="font-size:12px;color:var(--dim);margin-bottom:8px;">None yet.</div>';
    return h + '<button type="button" class="btn ghost" id="tpSave"' + dis + '>Save current teams\u2026</button></div>';
  }
  function bind(view, c) {
    view.querySelectorAll(".tpTeam").forEach(function (b) { b.onchange = function () { S.sel[b.getAttribute("data-id")] = b.checked; c.repaint(); }; });
    var sel = view.querySelector("#tpSet"); if (sel) sel.onchange = function () { S.pickSet = sel.value; };
    function cur() { return (S.sets || []).filter(function (s) { return s.id === S.pickSet; })[0]; }
    function done(r, okMsg) { if (r && r.error) { c.err(r.error === "battle_live" ? "A battle is live \u2014 end it first." : r.error === "no_teams" ? "This class has no squads to save." : "Couldn\u2019t do that (" + r.error + ")."); return false; } return true; }
    var ld = view.querySelector("#tpLoad"); if (ld) ld.onclick = function () {
      var s = cur(); if (!s || !confirm('Load "' + s.name + '"? Every student goes back to the squad they had when it was saved. Students who joined since then end up with no squad.')) return;
      Promise.resolve(c.rpc("ctf_t_squadset_load", { p_set: s.id })).then(function (r) { if (done(r)) { S.sel = {}; c.reload(); } }).catch(function () { c.err("Couldn\u2019t load that set."); });
    };
    var dl = view.querySelector("#tpDel"); if (dl) dl.onclick = function () {
      var s = cur(); if (!s || !confirm('Delete the saved set "' + s.name + '"? Your current squads don\u2019t change.')) return;
      Promise.resolve(c.rpc("ctf_t_squadset_delete", { p_set: s.id })).then(function () { S.sets = null; fetchSets(c.rpc, S.cls, c.repaint); });
    };
    var sv = view.querySelector("#tpSave"); if (sv) sv.onclick = function () {
      var n = prompt("Name this team set (saving with an existing name replaces it):", ""); if (!n || !n.trim()) return;
      Promise.resolve(c.rpc("ctf_t_squadset_save", { p_class: S.cls, p_name: n.trim() })).then(function (r) { if (done(r)) { S.sets = null; fetchSets(c.rpc, S.cls, c.repaint); } }).catch(function () { c.err("Couldn\u2019t save. Run supabase/squad-sets.sql first."); });
    };
  }
  window.TEAM_PICK = { sync: sync, chosen: chosen, fetchSets: fetchSets, teams: teams, note: note, setsBar: setsBar, bind: bind };
})();
