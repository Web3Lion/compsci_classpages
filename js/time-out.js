// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* time-out.js (v41.0) — duel TIME OUT for vocab-duel.html and bracket-play.html.
   TIMEOUT.watch({ live: fn → true while a fight is live, hit: fn → sends the penalty }).
   While live: copy / cut / paste / drop / right-click are blocked. Leaving the page
   (switching tabs, opening a new tab, alt-tab, minimizing) costs one hit, sent the moment
   they leave, and a 3-second TIME OUT screen on return. Nothing is logged. */
(function () {
  var cfg = null, away = false, until = 0, box = null, tick = null, SECS = 3;
  function live() { try { return !!(cfg && cfg.live()); } catch (e) { return false; } }
  function block(e) { if (!live()) return; e.preventDefault(); e.stopPropagation(); flash("Copy and paste are off during a duel."); }
  ["copy", "cut", "paste", "drop", "contextmenu"].forEach(function (t) { document.addEventListener(t, block, true); });
  document.addEventListener("dragstart", function (e) { if (live()) e.preventDefault(); }, true);
  document.addEventListener("keydown", function (e) {
    if (Date.now() < until) { e.preventDefault(); e.stopPropagation(); return; }
    if (live() && (e.ctrlKey || e.metaKey) && /^[cvx]$/i.test(e.key)) { e.preventDefault(); flash("Copy and paste are off during a duel."); }
  }, true);

  function leave() {
    if (away || !live()) return;
    away = true;
    try { cfg.hit(); } catch (e) {}
  }
  function back() {
    if (!away) return;
    away = false;
    until = Date.now() + SECS * 1000;
    show();
  }
  document.addEventListener("visibilitychange", function () { document.hidden ? leave() : back(); });
  window.addEventListener("blur", function () { setTimeout(function () { if (!document.hasFocus()) leave(); }, 150); });
  window.addEventListener("focus", function () { if (!document.hidden) back(); });
  window.addEventListener("pagehide", leave);

  function show() {
    if (!box) {
      box = document.createElement("div");
      box.setAttribute("role", "alertdialog"); box.setAttribute("aria-live", "assertive"); box.setAttribute("aria-label", "Time out");
      box.style.cssText = "position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center;background:rgba(10,4,6,.94);color:#fff;font-family:inherit;";
      document.body.appendChild(box);
    }
    box.style.display = "flex";
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    clearInterval(tick); draw(); tick = setInterval(draw, 200);
  }
  function draw() {
    var s = Math.ceil((until - Date.now()) / 1000);
    if (s <= 0) {
      clearInterval(tick); box.style.display = "none";
      var a = document.getElementById("vdAns") || document.getElementById("brAns"); if (a && !a.disabled) a.focus();
      return;
    }
    box.innerHTML = '<div style="font-size:clamp(44px,10vw,96px);font-weight:900;letter-spacing:4px;color:#ff5a6e;line-height:1;">TIME OUT</div>' +
      '<div style="font-size:18px;max-width:520px;line-height:1.5;color:#f3d9dd;">You left the duel and took a hit. Stay on this page until the duel ends.</div>' +
      '<div style="font-family:var(--mono,monospace);font-size:64px;font-weight:800;color:#fff;">' + s + '</div>';
  }
  var ft = null;
  function flash(t) {
    var n = document.getElementById("toFlash");
    if (!n) { n = document.createElement("div"); n.id = "toFlash"; n.setAttribute("role", "status"); n.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:99998;padding:10px 16px;border-radius:10px;background:#2a0f14;border:1px solid #ff5a6e;color:#fff;font-size:14px;font-weight:700;"; document.body.appendChild(n); }
    n.textContent = t; n.style.display = "block"; clearTimeout(ft); ft = setTimeout(function () { n.style.display = "none"; }, 1800);
  }
  window.TIMEOUT = { watch: function (c) { cfg = c; }, active: function () { return Date.now() < until; } };
})();
