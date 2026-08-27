// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* PERSONA GATE — the course guide starts asleep. A class opens as a plain,
   quiet site; the character only appears once the teacher flips the switch on
   the Locks & Guide tab. Landing pages have no session and can't call
   ctf_gates, so the cached flag sync.js writes on the arena page is the only
   signal available — and unknown counts as OFF. */
(function () {
  function courseId() {
    if (window.CTF_COURSE) return window.CTF_COURSE;
    var m = location.pathname.match(/\/(cyber1|cyber2|cyber3|apcsp|web3)\//);
    return m ? m[1] : null;
  }
  function personaAwake() {
    if (window.CTF_PERSONA === true) return true;
    var c = courseId(); if (!c) return false;
    try {
      var cached = localStorage.getItem("ctf-persona-" + c);
      if (cached !== null) return cached === "1";          // teacher's setting, cached by the arena
      var cfg = window.SUPABASE_CONFIG || {};
      return !(cfg.url && cfg.anonKey);   // backend present but unknown => stay silent
    } catch (e) { return false; }
  }
  var AWAKE = personaAwake();   // asleep => same transition, neutral wording
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
    var isVector = courseId() === "cyber3";
    var g = document.createElement("div");
    if (isVector) {
      g.style.cssText = "position:fixed;inset:0;z-index:11999;pointer-events:none;mix-blend-mode:screen;background:repeating-linear-gradient(0deg,rgba(212,175,55,.10) 0,rgba(212,175,55,.10) 1px,transparent 1px,transparent 3px);animation:nemGlitchAnim .55s steps(2,end) 1;";
    } else {
      g.style.cssText = "position:fixed;inset:0;z-index:11999;pointer-events:none;mix-blend-mode:screen;background:repeating-linear-gradient(0deg," + (AWAKE ? "rgba(255,0,80,.10)" : "rgba(255,255,255,.05)") + " 0," + (AWAKE ? "rgba(255,0,80,.10)" : "rgba(255,255,255,.05)") + " 1px,transparent 1px,transparent 3px);animation:nemGlitchAnim .55s steps(2,end) 1;";
    }
    document.body.appendChild(g);
    setTimeout(function () { g.remove(); }, 560);

    var accent = "";
    try { accent = getComputedStyle(document.documentElement).getPropertyValue("--adv").trim(); } catch(e){}
    if (!accent) accent = isVector ? "#d4af37" : "#ff4c00";
    var tint, ink, glow, head, subl;
    if (isVector) {
      tint = AWAKE ? "rgba(212,175,55,.14),rgba(212,175,55,.32)" : "rgba(0,0,0,.10),rgba(0,0,0,.30)";
      ink  = accent;
      glow = accent;
      head = AWAKE ? "\u25ce VECTOR LOCKED ON" : "\u25c6 CALIBRATING TO GOLD STANDARD";
      subl = AWAKE ? "TRAJECTORY CONFIRMED // ON TARGET" : "VECTOR PRECISION CHECK // TOLERANCE VERIFIED";
    } else {
      tint = AWAKE ? "rgba(255,0,60,.12),rgba(255,0,60,.30)" : "rgba(0,0,0,.10),rgba(0,0,0,.34)";
      ink  = AWAKE ? "#ff5c7a" : accent;
      glow = AWAKE ? "#ff0033" : accent;
      head = AWAKE ? "\u26a0 INTRUDER DETECTED" : "\u25c6 ESTABLISHING SECURE CHANNEL";
      var guide = courseId() === "cyber2" ? "SPECTER" : "NEMESIS";
      subl = AWAKE ? (guide + " DEFENSE GRID // TRACE INITIATED") : "ENCRYPTED LINK // HANDSHAKE COMPLETE";
    }
    var o = document.createElement("div");
    if (!AWAKE) {
      o.style.cssText = "position:fixed;bottom:18px;right:18px;z-index:12500;pointer-events:none;max-width:min(88vw,320px);animation:nemAlertBg .9s ease-out 1;";
      o.innerHTML = '<div style="font-family:\'JetBrains Mono\',ui-monospace,monospace;font-weight:800;letter-spacing:1.5px;color:' + ink + ';text-align:left;text-shadow:0 2px 2px rgba(0,0,0,.8);background:rgba(0,0,0,.72);border:1px solid ' + glow + ';padding:12px 16px;border-radius:10px;animation:nemAlertTxt .9s steps(2,end) 1;"><div style="font-size:14px;">' + head + '</div><div style="font-size:11px;margin-top:6px;opacity:.85;">' + subl + '</div></div>';
      document.body.appendChild(o);
      setTimeout(function () { o.remove(); }, 2400);
      return;
    }
    o.style.cssText = "position:fixed;inset:0;z-index:12500;pointer-events:none;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle," + tint + ");animation:nemAlertBg .9s ease-out 1;";
    o.innerHTML = '<div style="font-family:\'JetBrains Mono\',ui-monospace,monospace;font-weight:800;letter-spacing:3px;color:' + ink + ';text-align:center;text-shadow:0 0 18px ' + glow + ',0 2px 2px rgba(0,0,0,.8),0 0 2px rgba(0,0,0,.9);background:rgba(0,0,0,.45);padding:22px 34px;border-radius:14px;animation:nemAlertTxt .9s steps(2,end) 1;"><div style="font-size:min(9vw,64px);">' + head + '</div><div style="font-size:min(3.4vw,18px);margin-top:10px;opacity:.9;">' + subl + '</div></div>';
    document.body.appendChild(o);
    setTimeout(function () { o.remove(); }, 950);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();

})();
