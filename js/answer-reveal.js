// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* answer-reveal.js (v40.4) — shows the correct answer between questions in duels / brackets.
   REVEAL.show(answer, clue, headline, color): full-screen card for MS ms; typing is held until it closes.
   Same answer twice in a row (answer response + next poll) is ignored. */
(function () {
  var MS = 2500, box = null, until = 0, last = "", lastAt = 0, t = null;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  document.addEventListener("keydown", function (e) { if (Date.now() < until) { e.preventDefault(); e.stopPropagation(); } }, true);
  function show(ans, clue, head, col) {
    if (!ans) return;
    if (ans === last && Date.now() - lastAt < 6000) return;
    last = ans; lastAt = Date.now(); until = Date.now() + MS;
    col = col || "#3ddc97";
    if (!box) {
      box = document.createElement("div");
      box.setAttribute("role", "status"); box.setAttribute("aria-live", "assertive");
      box.style.cssText = "position:fixed;inset:0;z-index:99990;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(6,8,14,.9);";
      document.body.appendChild(box);
    }
    var c = clue && window.CLUE ? window.CLUE(clue, "22vh") : esc(clue || "");
    box.innerHTML = '<div style="max-width:760px;width:100%;text-align:center;padding:28px 24px;border-radius:16px;background:var(--card,#141a26);border:2px solid ' + col + ';">' +
      '<div style="font-family:var(--mono,monospace);font-size:13px;letter-spacing:2px;font-weight:800;color:' + col + ';margin-bottom:12px;">' + esc(head || "THE ANSWER") + '</div>' +
      '<div style="font-size:clamp(30px,6vw,54px);font-weight:900;color:var(--bright,#fff);line-height:1.15;overflow-wrap:break-word;">' + esc(ans) + '</div>' +
      (c ? '<div style="font-size:clamp(15px,2.2vw,19px);color:var(--muted,#c7cede);line-height:1.5;margin-top:14px;white-space:pre-line;text-wrap:pretty;">' + c + '</div>' : '') +
      '<div style="height:5px;border-radius:3px;background:rgba(255,255,255,.12);margin-top:20px;overflow:hidden;"><div id="rvBar" style="height:100%;width:100%;background:' + col + ';"></div></div></div>';
    box.style.display = "flex";
    var bar = document.getElementById("rvBar"), start = Date.now();
    clearInterval(t);
    t = setInterval(function () {
      var left = until - Date.now();
      if (bar) bar.style.width = Math.max(0, left / MS * 100) + "%";
      if (left <= 0) {
        clearInterval(t); box.style.display = "none";
        var a = document.getElementById("vdAns") || document.getElementById("brAns"); if (a && !a.disabled) a.focus();
      }
    }, 50);
  }
  window.REVEAL = { show: show, active: function () { return Date.now() < until; } };
})();
