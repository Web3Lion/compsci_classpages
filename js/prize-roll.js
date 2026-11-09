// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* prize-roll.js (v31.3) — victory-screen prize rolls.
   Opens carnival.html in award mode (?award=1) inside an overlay. A random chance game plays,
   the prize is drawn from a restricted pool and sent straight to the winners (ctf_t_send_items).
   Pools (carnival.html awardAllowed): all · nobonus (no test/quiz bonus) ·
     squad (no test bonus, graded-assignment bonus or homework pass) · game (in-game items only).
   PRIZE_ROLL.auto(key, list, finishedAt) — opens once per key, only for results under 15 min old.
   PRIZE_ROLL.open(list) — button: plays every roll in list not already done.
   list item: { key, cls, ids:[student ids], who, pool, title }
   PRIZE_ROLL.squadIds(rpc, classId, groupId) → Promise<ids> (current squad members). */
(function () {
  if (window.PRIZE_ROLL) return;
  var CHANCE = ["wheel", "duck", "plinko", "lockers", "claw", "gumball"];
  var POOL_TXT = { all: "Every prize", nobonus: "Every prize except test bonuses", squad: "Class prizes (no test bonus, graded-assignment bonus or homework pass)", game: "In-game items only" };
  var DK = "prize-roll-done", SK = "prize-roll-seen";
  var Q = [], idx = 0, ov = null, rosters = {};
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function get(k) { try { return JSON.parse(localStorage.getItem(k) || "{}") || {}; } catch (e) { return {}; } }
  function put(k, key, v) { var m = get(k); m[key] = v; var ks = Object.keys(m); if (ks.length > 200) ks.slice(0, ks.length - 200).forEach(function (x) { delete m[x]; }); try { localStorage.setItem(k, JSON.stringify(m)); } catch (e) {} }
  function isDone(key) { return Object.prototype.hasOwnProperty.call(get(DK), key); }
  function css() {
    if (document.getElementById("prCss")) return;
    var s = document.createElement("style"); s.id = "prCss";
    s.textContent = "#prOv{position:fixed;inset:0;z-index:9800;display:flex;flex-direction:column;background:rgba(5,8,14,.94);}" +
      "#prBar{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:12px 18px;border-bottom:2px solid #ffcf5c;background:#0b1220;color:#eaf4ff;font-family:'JetBrains Mono',monospace;}" +
      "#prBar .k{font-size:11px;letter-spacing:2px;color:#ffcf5c;font-weight:800;}#prBar .t{font-size:20px;font-weight:800;line-height:1.2;overflow-wrap:anywhere;}#prBar .p{font-size:12px;color:#a9bfd6;margin-top:2px;}" +
      "#prBar button{min-height:44px;padding:10px 16px;border-radius:10px;border:1px solid #2f5580;background:#0e2136;color:#eaf4ff;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;}" +
      "#prBar button.go{border-color:#ffcf5c;color:#ffcf5c;}#prMsg{font-size:14px;font-weight:800;color:#4fd68a;}" +
      "#prOv iframe{flex:1;width:100%;border:0;background:#0a0d14;}";
    document.head.appendChild(s);
  }
  function close() { if (ov) { ov.remove(); ov = null; } window.removeEventListener("message", onMsg); }
  function next() { idx++; while (idx < Q.length && isDone(Q[idx].key)) idx++; if (idx >= Q.length) { close(); return; } show(); }
  function show() {
    var it = Q[idx], left = Q.length - idx;
    if (!it.ids || !it.ids.length) { put(DK, it.key, null); next(); return; }
    var game = CHANCE[Math.floor(Math.random() * CHANCE.length)];
    var url = "carnival.html?award=1&cls=" + encodeURIComponent(it.cls || "") + "&ids=" + encodeURIComponent(it.ids.join(",")) +
      "&who=" + encodeURIComponent(it.who || "") + "&pool=" + encodeURIComponent(it.pool || "all") + "&title=" + encodeURIComponent(it.title || "") + "#" + game;
    ov.querySelector(".k").textContent = "PRIZE ROLL" + (Q.length > 1 ? " \u00b7 " + (idx + 1) + " OF " + Q.length : "");
    ov.querySelector(".t").textContent = (it.title ? it.title + " \u2014 " : "") + (it.who || "");
    ov.querySelector(".p").textContent = POOL_TXT[it.pool] || POOL_TXT.all;
    ov.querySelector("#prMsg").textContent = "";
    var nb = ov.querySelector("#prNext"); nb.style.display = "none"; nb.textContent = left > 1 ? "NEXT PRIZE \u2192" : "DONE";
    ov.querySelector("#prSkip").style.display = "";
    ov.querySelector("iframe").src = url;
  }
  function onMsg(e) {
    var d = e.data; if (!d || d.prizeRoll !== 1 || !ov || !Q[idx]) return;
    if (d.status === "sent") {
      put(DK, Q[idx].key, d.label || "");
      ov.querySelector("#prMsg").textContent = "\u2713 " + (d.label || "Prize") + " sent to " + (Q[idx].who || "the winner");
      ov.querySelector("#prSkip").style.display = "none";
      var nb = ov.querySelector("#prNext"); nb.style.display = ""; nb.focus();
    } else if (d.status === "error") {
      ov.querySelector("#prMsg").textContent = d.msg || "Couldn\u2019t send the prize.";
      ov.querySelector("#prMsg").style.color = "#ff5c7a";
    }
  }
  function open(list) {
    Q = (list || []).filter(function (it) { return it && it.key; }); idx = -1;
    if (!Q.some(function (it) { return !isDone(it.key); })) return false;
    css(); close();
    ov = document.createElement("div"); ov.id = "prOv"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Prize roll");
    ov.innerHTML = '<div id="prBar"><div style="flex:1;min-width:220px;"><div class="k"></div><div class="t"></div><div class="p"></div></div>' +
      '<span id="prMsg" role="status" aria-live="polite"></span>' +
      '<button type="button" class="go" id="prNext" style="display:none;"></button><button type="button" id="prSkip">SKIP THIS PRIZE</button><button type="button" id="prClose">CLOSE</button></div>' +
      '<iframe title="Prize game" allow="fullscreen"></iframe>';
    document.body.appendChild(ov);
    ov.querySelector("#prNext").onclick = next;
    ov.querySelector("#prSkip").onclick = function () { if (!confirm("Skip this prize? It won't be offered again.")) return; put(DK, Q[idx].key, null); next(); };
    ov.querySelector("#prClose").onclick = close;
    window.addEventListener("message", onMsg);
    next();
    return true;
  }
  function pending(list) { return (list || []).some(function (it) { return it && it.key && !isDone(it.key); }); }
  function auto(key, list, finishedAt) {
    if (!key || get(SK)[key]) return;
    var t = finishedAt ? new Date(finishedAt).getTime() : Date.now();
    put(SK, key, 1);
    if (Date.now() - t > 15 * 60000) return;
    setTimeout(function () { open(list); }, 2600);
  }
  function roster(rpc, cls) {
    if (!rosters[cls]) rosters[cls] = Promise.resolve(rpc("ctf_t_roster", { p_class: cls })).then(function (r) { return Array.isArray(r) ? r : []; }).catch(function () { delete rosters[cls]; return []; });
    return rosters[cls];
  }
  function squadIds(rpc, cls, gid) { return roster(rpc, cls).then(function (R) { return R.filter(function (s) { return s.group_id === gid; }).map(function (s) { return s.id; }); }); }
  window.PRIZE_ROLL = { open: open, auto: auto, pending: pending, squadIds: squadIds, isDone: isDone };
})();
