/* NEMESIS intruder-alert glitch — standalone, for every cybersecurity course
   page (not just Capture the Flag). Self-contained; no dependencies. On CTF
   pages ctf.js runs its own richer boot, so this bails if that has loaded. */
(function () {
  function run() {
    if (window.__NEMESIS_FULL) return;            // ctf.js owns the boot there
    if (window.__nemIntroDone) return;
    window.__nemIntroDone = true;
    if (!document.getElementById("nemGlitchStyle")) {
      var st = document.createElement("style"); st.id = "nemGlitchStyle";
      st.textContent = "@keyframes nemGlitchAnim{0%{opacity:0;transform:translateX(0)}12%{opacity:1;transform:translateX(-4px)}24%{opacity:.35;transform:translateX(4px)}40%{opacity:1;transform:translateX(-2px);filter:hue-rotate(80deg)}60%{opacity:.3;transform:translateX(3px)}80%{opacity:.7;transform:translateX(-1px)}100%{opacity:0;transform:translateX(0)}}@keyframes nemAlertBg{0%{opacity:0}10%{opacity:1}30%{opacity:.3}50%{opacity:.9}70%{opacity:.2}100%{opacity:0}}@keyframes nemAlertTxt{0%{opacity:0;transform:translateX(-6px)}12%{opacity:1;transform:translateX(4px)}30%{opacity:.4;transform:translateX(-3px)}50%{opacity:1;transform:translateX(2px);filter:hue-rotate(70deg)}70%{opacity:.6;transform:translateX(-2px)}100%{opacity:0;transform:translateX(0)}}";
      document.head.appendChild(st);
    }
    var g = document.createElement("div");
    g.style.cssText = "position:fixed;inset:0;z-index:11999;pointer-events:none;mix-blend-mode:screen;background:repeating-linear-gradient(0deg,rgba(255,0,80,.10) 0,rgba(255,0,80,.10) 1px,transparent 1px,transparent 3px);animation:nemGlitchAnim .55s steps(2,end) 1;";
    document.body.appendChild(g);
    setTimeout(function () { g.remove(); }, 560);

    var o = document.createElement("div");
    o.style.cssText = "position:fixed;inset:0;z-index:12500;pointer-events:none;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,rgba(255,0,60,.12),rgba(255,0,60,.30));animation:nemAlertBg .9s ease-out 1;";
    o.innerHTML = '<div style="font-family:\'JetBrains Mono\',ui-monospace,monospace;font-weight:800;letter-spacing:3px;color:#ff5c7a;text-align:center;text-shadow:0 0 18px #ff0033;animation:nemAlertTxt .9s steps(2,end) 1;"><div style="font-size:min(9vw,64px);">\u26a0 INTRUDER DETECTED</div><div style="font-size:min(3.4vw,18px);margin-top:10px;opacity:.85;">NEMESIS DEFENSE GRID // TRACE INITIATED</div></div>';
    document.body.appendChild(o);
    setTimeout(function () { o.remove(); }, 950);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
