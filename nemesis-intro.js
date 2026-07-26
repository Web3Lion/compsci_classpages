/* PERSONA GATE — the course guide starts asleep. A class opens as a plain,
   quiet site; the character only appears once the teacher flips the switch on
   the Locks & Guide tab. Landing pages have no session and can't call
   ctf_gates, so the cached flag sync.js writes on the arena page is the only
   signal available — and unknown counts as OFF. */
(function () {
  function courseId() {
    if (window.CTF_COURSE) return window.CTF_COURSE;
    var m = location.pathname.match(/\/(cyber1|cyber2|apcsp|web3)\//);
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
    var g = document.createElement("div");
    g.style.cssText = "position:fixed;inset:0;z-index:11999;pointer-events:none;mix-blend-mode:screen;background:repeating-linear-gradient(0deg," + (AWAKE ? "rgba(255,0,80,.10)" : "rgba(255,255,255,.05)") + " 0," + (AWAKE ? "rgba(255,0,80,.10)" : "rgba(255,255,255,.05)") + " 1px,transparent 1px,transparent 3px);animation:nemGlitchAnim .55s steps(2,end) 1;";
    document.body.appendChild(g);
    setTimeout(function () { g.remove(); }, 560);

    var accent = "";
    try { accent = getComputedStyle(document.documentElement).getPropertyValue("--adv").trim(); } catch(e){}
    if (!accent) accent = "#ff4c00";
    var tint = AWAKE ? "rgba(255,0,60,.12),rgba(255,0,60,.30)" : "rgba(0,0,0,.10),rgba(0,0,0,.34)";
    var ink  = AWAKE ? "#ff5c7a" : accent;
    var glow = AWAKE ? "#ff0033" : accent;
    var head = AWAKE ? "\u26a0 INTRUDER DETECTED" : "\u25c6 ESTABLISHING SECURE CHANNEL";
    var subl = AWAKE ? "NEMESIS DEFENSE GRID // TRACE INITIATED" : "ENCRYPTED LINK // HANDSHAKE COMPLETE";
    var o = document.createElement("div");
    o.style.cssText = "position:fixed;inset:0;z-index:12500;pointer-events:none;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle," + tint + ");animation:nemAlertBg .9s ease-out 1;";
    o.innerHTML = '<div style="font-family:\'JetBrains Mono\',ui-monospace,monospace;font-weight:800;letter-spacing:3px;color:' + ink + ';text-align:center;text-shadow:0 0 18px ' + glow + ';animation:nemAlertTxt .9s steps(2,end) 1;"><div style="font-size:min(9vw,64px);">' + head + '</div><div style="font-size:min(3.4vw,18px);margin-top:10px;opacity:.85;">' + subl + '</div></div>';
    document.body.appendChild(o);
    setTimeout(function () { o.remove(); }, 950);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();

})();
