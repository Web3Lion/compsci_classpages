/* ==========================================================================
   QUIZ SKINS (v19.0)  —  Coin Shop "skin" slot, one choice per course.

   The skin restyles quiz.html and that course's profile page. Every skin has a
   light and a dark palette and follows the site-wide course-theme toggle.
   "Default" (no skin equipped) = Chunky Pop on quizzes, the original look on
   the profile. s_cyber (free) = the original cyberpunk look everywhere, quizzes included. Prices live in cosmetics.js + _cosmetic_price() (coins-cosmetics.sql).

   Accessibility: no skin relies on color alone — quiz.html marks the selected
   answer with a check + the word "Selected", and results use words + icons.

   API  window.CTF_SKINS
     .list                      [{id,name,blurb}]   (id null = Default)
     .apply(id, mode)           mode "quiz" | "profile"; id null = Default
     .forCourse(course)         equipped skin id from the cosmetics cache
     .swatch(id)                small preview card HTML (shop)
   Auto-apply: <script src="skins.js" data-auto="profile|quiz">
   ========================================================================== */
(function () {
  var SH = { pop: { r: 16, bw: 2, card: "4px 4px 0 var(--q-shadow)", btn: "0 4px 0 var(--q-shadow)", sel: "0 4px 0 var(--q-shadow)", opt: 14, up: 0 } };
  var SKINS = {
    pop: { name: "Chunky Pop", blurb: "Bright, tactile buttons with bold outlines.", shape: SH.pop,
      light: { bg:"#fff8ec",panel:"#ffffff",panel2:"#fffdf7",ink:"#1d1a2e",ink2:"#2e2a44",muted:"#57536b",rule:"#1d1a2e",rule2:"#d9d2c3",accent:"#3a5bd9",accentBg:"#e6ecff",onAccent:"#ffffff",sel:"#3a5bd9",onSel:"#ffffff",btn:"#2ec27e",onBtn:"#1d1a2e",ok:"#1d7a46",okBg:"#e2f5e9",bad:"#b3261e",badBg:"#fde7e4",warn:"#8a5a00",warnBg:"#fff1cc",shadow:"#1d1a2e" },
      dark:  { bg:"#17142a",panel:"#221e3a",panel2:"#2a2547",ink:"#fff8ec",ink2:"#e6e0f5",muted:"#b8b0d4",rule:"#6d64a8",rule2:"#3a3460",accent:"#8fb0ff",accentBg:"#2b2f5e",onAccent:"#10102a",sel:"#8fb0ff",onSel:"#10102a",btn:"#3ddc84",onBtn:"#0d1f14",ok:"#7ee2a8",okBg:"#173a28",bad:"#ff9b8f",badBg:"#44201d",warn:"#ffd36b",warnBg:"#3d3014",shadow:"#0b0918" } },
    s_cyber: { name: "Cyberpunk", blurb: "The class's original neon look, on every page. Free.", native: 1, shape: { r: 8, bw: 1, card: "none", btn: "none", sel: "0 0 14px var(--q-glow)", opt: 8, up: 1 },
      light: { bg:"#eef3f8",panel:"#ffffff",panel2:"#f6f9fc",ink:"#0b1220",ink2:"#1c2a3d",muted:"#4a5a70",rule:"#9fb3c8",rule2:"#d5dfea",accent:"#00788a",accentBg:"#dcf3f6",onAccent:"#ffffff",sel:"#a3127f",onSel:"#ffffff",btn:"#0b1220",onBtn:"#7ff7ff",ok:"#13703a",okBg:"#e1f3e7",bad:"#b3261e",badBg:"#fde7e4",warn:"#7a5200",warnBg:"#fbefd3",shadow:"transparent",glow:"rgba(163,18,127,.22)" },
      dark:  { bg:"#0a0d14",panel:"#111724",panel2:"#151c2c",ink:"#f2f7ff",ink2:"#d6e2f2",muted:"#93a4bd",rule:"#2a3650",rule2:"#1d2638",accent:"#00f0ff",accentBg:"#0d2a33",onAccent:"#0a0d14",sel:"#ff2bd6",onSel:"#14040f",btn:"#00f0ff",onBtn:"#0a0d14",ok:"#6dffb0",okBg:"#0f3326",bad:"#ff8aa0",badBg:"#3d1228",warn:"#ffd23f",warnBg:"#3a3410",shadow:"transparent",glow:"rgba(255,43,214,.4)" } },
    s_arcade: { name: "Arcade Neon", blurb: "Retro arcade, neon glow on your pick.", shape: { r: 12, bw: 2, card: "none", btn: "none", sel: "0 0 18px var(--q-glow)", opt: 12, up: 1 },
      light: { bg:"#f4f1ff",panel:"#ffffff",panel2:"#f8f6ff",ink:"#160f3a",ink2:"#2c2360",muted:"#5a5088",rule:"#cfc6f5",rule2:"#e4def9",accent:"#0b7f8c",accentBg:"#e0f7fa",onAccent:"#ffffff",sel:"#b0168f",onSel:"#ffffff",btn:"#160f3a",onBtn:"#ffe14f",ok:"#137a3c",okBg:"#e3f5ea",bad:"#b3261e",badBg:"#fde7e4",warn:"#7a5a00",warnBg:"#fff3c4",shadow:"transparent",glow:"rgba(176,22,143,.25)",hero:"linear-gradient(90deg,#b0168f,#0b7f8c)" },
      dark:  { bg:"#0d0b1f",panel:"#17123a",panel2:"#1d1745",ink:"#ffffff",ink2:"#e6e1ff",muted:"#a89cf0",rule:"#3a2f80",rule2:"#2a2160",accent:"#3df5ff",accentBg:"#142a4a",onAccent:"#0d0b1f",sel:"#ff4fd8",onSel:"#1a0620",btn:"#ffe14f",onBtn:"#0d0b1f",ok:"#6dffb0",okBg:"#0f3326",bad:"#ff8aa0",badBg:"#3d1228",warn:"#ffe14f",warnBg:"#3a3410",shadow:"transparent",glow:"rgba(255,79,216,.4)",hero:"linear-gradient(90deg,#ff4fd8,#3df5ff)" } },
    s_quest: { name: "Quest / RPG", blurb: "Fantasy adventure in purple and gold.", shape: { r: 10, bw: 2, card: "none", btn: "none", sel: "none", opt: 10, up: 0, cardBw: 3 },
      light: { bg:"#f7f0e1",panel:"#fffaf0",panel2:"#fbf4e4",ink:"#2a1a40",ink2:"#3b2b55",muted:"#635478",rule:"#a8812e",rule2:"#e3d6bb",accent:"#6b3fb8",accentBg:"#efe6fa",onAccent:"#ffffff",sel:"#6b3fb8",onSel:"#ffffff",btn:"#2a1a40",onBtn:"#f7e3a8",ok:"#256536",okBg:"#e3f0e5",bad:"#983222",badBg:"#f7e6e1",warn:"#7a5a00",warnBg:"#f6edd6",shadow:"transparent" },
      dark:  { bg:"#1e1530",panel:"#2a1f40",panel2:"#31254b",ink:"#fbf3e0",ink2:"#e8dcc4",muted:"#c9b9a0",rule:"#c9a14a",rule2:"#4a3a68",accent:"#f0d38a",accentBg:"#3a2c52",onAccent:"#1e1530",sel:"#c9a14a",onSel:"#1e1530",btn:"#7a4fd0",onBtn:"#ffffff",ok:"#9be0a6",okBg:"#1f3a28",bad:"#ffab9a",badBg:"#4a2020",warn:"#f0d38a",warnBg:"#3d3218",shadow:"transparent" } },
    s_ops: { name: "Hacker Ops", blurb: "Terminal mission console.", shape: { r: 4, bw: 1, card: "none", btn: "none", sel: "inset 4px 0 0 var(--q-accent)", opt: 4, up: 1 },
      light: { bg:"#eef5ef",panel:"#ffffff",panel2:"#f5faf6",ink:"#0b2416",ink2:"#1d3a29",muted:"#46644f",rule:"#9cc3a8",rule2:"#d3e5d8",accent:"#0f6b3a",accentBg:"#dff0e4",onAccent:"#ffffff",sel:"#0f6b3a",onSel:"#ffffff",btn:"#0b2416",onBtn:"#8dffb9",ok:"#0f6b3a",okBg:"#dff0e4",bad:"#a3271b",badBg:"#fae5e1",warn:"#7a4d00",warnBg:"#fbefd6",shadow:"transparent" },
      dark:  { bg:"#07110c",panel:"#0c1c14",panel2:"#0f2318",ink:"#dfffe9",ink2:"#b5e6c6",muted:"#8fc4a3",rule:"#1f4a33",rule2:"#173323",accent:"#5cff9d",accentBg:"#123a24",onAccent:"#07110c",sel:"#5cff9d",onSel:"#07110c",btn:"#5cff9d",onBtn:"#07110c",ok:"#5cff9d",okBg:"#123a24",bad:"#ff8a7a",badBg:"#3a1712",warn:"#ffb547",warnBg:"#3a2a10",shadow:"transparent" } },
    s_sky: { name: "Sky Sticker", blurb: "Calm and airy, rounded stickers.", shape: { r: 22, bw: 2, card: "0 3px 0 var(--q-rule)", btn: "none", sel: "none", opt: 999, up: 0 },
      light: { bg:"#eef6ff",panel:"#ffffff",panel2:"#f6faff",ink:"#10264a",ink2:"#1f3a63",muted:"#4a6285",rule:"#b9d4f2",rule2:"#d6e6f8",accent:"#1f5fb8",accentBg:"#e1eefc",onAccent:"#ffffff",sel:"#c2410c",onSel:"#ffffff",btn:"#10264a",onBtn:"#ffffff",ok:"#1d6b3a",okBg:"#e2f3e8",bad:"#b3261e",badBg:"#fde7e4",warn:"#8a5200",warnBg:"#fff0d6",shadow:"transparent" },
      dark:  { bg:"#0e1a2e",panel:"#15243d",panel2:"#1a2c49",ink:"#eef6ff",ink2:"#cfe0f5",muted:"#9fb6d4",rule:"#2f4a72",rule2:"#223a5c",accent:"#8cc4ff",accentBg:"#1c3456",onAccent:"#0e1a2e",sel:"#ff9a5c",onSel:"#1a0c02",btn:"#eef6ff",onBtn:"#10264a",ok:"#8be0a8",okBg:"#173a2a",bad:"#ffa094",badBg:"#45201d",warn:"#ffcf7a",warnBg:"#3d2e14",shadow:"transparent" } },
    s_mastermind: { name: "Mastermind", blurb: "Purple-to-magenta with gold pills.", shape: { r: 14, bw: 2, card: "none", btn: "none", sel: "none", opt: 12, up: 0 },
      light: { bg:"#faf5ff",panel:"#ffffff",panel2:"#fcf9ff",ink:"#1e1b4b",ink2:"#334155",muted:"#5b5778",rule:"#c4b5fd",rule2:"#ddd6fe",accent:"#6d28d9",accentBg:"#f1e9ff",onAccent:"#ffffff",sel:"#7c3aed",onSel:"#ffffff",btn:"#facc15",onBtn:"#4c1d95",ok:"#15803d",okBg:"#e6f6ea",bad:"#b91c1c",badBg:"#fde8e8",warn:"#854d0e",warnBg:"#fef3c7",shadow:"transparent",hero:"linear-gradient(135deg,#4c1d95 0%,#7c3aed 50%,#c026d3 100%)" },
      dark:  { bg:"#160f2b",panel:"#221640",panel2:"#2a1c4f",ink:"#faf5ff",ink2:"#e4dcf5",muted:"#b9acd9",rule:"#5b3fa8",rule2:"#3b2a66",accent:"#c4a5ff",accentBg:"#33215c",onAccent:"#160f2b",sel:"#a78bfa",onSel:"#160f2b",btn:"#facc15",onBtn:"#3b0f78",ok:"#86efac",okBg:"#163a26",bad:"#fca5a5",badBg:"#4a1d24",warn:"#fde68a",warnBg:"#3d3112",shadow:"transparent",hero:"linear-gradient(135deg,#4c1d95 0%,#7c3aed 50%,#c026d3 100%)" } }
  };
  var ORDER = [null, "s_cyber", "s_arcade", "s_quest", "s_ops", "s_sky", "s_mastermind"];
  // 33.2: self-hosted (assets/fonts/fonts.css, same folder level as skins.js)
  var FONT = (function () { var c = document.currentScript && document.currentScript.src; return c ? c.replace(/skins\.js(\?.*)?$/, "assets/fonts/fonts.css?v=33.2.0") : "/assets/fonts/fonts.css"; })();

  function font() {
    if (document.getElementById("skinFont") || document.querySelector('link[href*="assets/fonts/fonts.css"]')) return;
    var l = document.createElement("link"); l.id = "skinFont"; l.rel = "stylesheet"; l.href = FONT; (document.head || document.documentElement).appendChild(l);
  }
  function quizVars(p, s) {
    var o = ""; Object.keys(p).forEach(function (k) { if (k !== "hero") o += "--q-" + k + ":" + p[k] + ";"; });
    return o + "--q-hero:" + (p.hero || "none") + ";--q-radius:" + s.r + "px;--q-optr:" + s.opt + "px;--q-bw:" + s.bw + "px;--q-cardbw:" + (s.cardBw || 1) + "px;" +
      "--q-cardsh:" + s.card + ";--q-btnsh:" + s.btn + ";--q-selsh:" + s.sel + ";--q-upper:" + (s.up ? "uppercase" : "none") + ";--q-track:" + (s.up ? ".06em" : "0") + ";";
  }
  function profVars(p, s) {
    return "--bg:" + p.bg + ";--panel:" + p.panel + ";--panel2:" + p.panel2 + ";--panel3:" + p.accentBg + ";--border:" + p.rule2 + ";--border2:" + p.rule2 + ";--border3:" + p.rule + ";--border-hi:" + p.accent + ";" +
      "--text:" + p.ink2 + ";--bright:" + p.ink + ";--muted:" + p.muted + ";--dim:" + p.muted + ";--faint:" + p.muted + ";--fainter:" + p.rule + ";--accent:" + p.accent + ";--accent2:" + p.sel + ";" +
      "--amber:" + p.warn + ";--amber-bg:" + p.warnBg + ";--amber-bd:" + p.warn + ";--ok:" + p.ok + ";--bad:" + p.bad + ";--warn:" + p.warn + ";";
  }
  function css(id, mode) {
    var k = id && SKINS[id] ? id : (mode === "quiz" ? "pop" : null);
    if (!k) return "";
    var S = SKINS[k], v = mode === "quiz" ? quizVars : profVars;
    if (S.native && mode !== "quiz") return "";   // Cyberpunk = the course pages' own look
    var out = ":root{" + v(S.dark, S.shape) + "}:root[data-theme='light']{" + v(S.light, S.shape) + "}";
    if (mode === "profile") out += "body{font-family:'Lexend',sans-serif !important;}.card{border-radius:" + Math.max(S.shape.r, 8) + "px !important;" + (k === "pop" ? "" : "") + "}";
    return out;
  }
  function apply(id, mode) {
    mode = mode || "profile"; font();
    var st = document.getElementById("skinStyle");
    if (!st) { st = document.createElement("style"); st.id = "skinStyle"; (document.head || document.documentElement).appendChild(st); }
    st.textContent = css(id, mode);
    document.documentElement.setAttribute("data-skin", id || "default");
    if (mode === "quiz") { try { localStorage.setItem("quiz-skin-last", id || ""); } catch (e) {} }
  }
  function forCourse(c) {
    if (!c) return null;
    try { var eq = JSON.parse(localStorage.getItem("ctf-cos-" + c)) || {}; return eq.skin && SKINS[eq.skin] ? eq.skin : null; } catch (e) { return null; }
  }
  function swatch(id) {
    var S = SKINS[id && SKINS[id] ? id : "pop"], lt = document.documentElement.getAttribute("data-theme") === "light", p = lt ? S.light : S.dark, s = S.shape;
    var opt = function (t, on) {
      return '<div style="padding:5px 9px;border-radius:' + Math.min(s.opt, 999) + 'px;border:' + s.bw + 'px solid ' + (on ? p.sel : p.rule2) + ';background:' + (on ? p.sel : p.panel2) + ';color:' + (on ? p.onSel : p.ink2) + ';font-size:11px;font-weight:' + (on ? 700 : 500) + ';display:flex;justify-content:space-between;gap:6px;">' +
        '<span>' + t + '</span>' + (on ? '<span aria-hidden="true">\u2713</span>' : '') + '</div>';
    };
    return '<div aria-hidden="true" style="font-family:\'Lexend\',sans-serif;border-radius:' + Math.min(s.r, 14) + 'px;overflow:hidden;border:' + (s.cardBw || s.bw) + 'px solid ' + p.rule + ';background:' + p.panel + ';">' +
      (p.hero ? '<div style="height:6px;background:' + p.hero + ';"></div>' : '') +
      '<div style="padding:9px;display:flex;flex-direction:column;gap:5px;background:' + p.bg + ';">' +
      '<div style="height:5px;border-radius:9px;background:' + p.rule2 + ';overflow:hidden;"><div style="width:40%;height:100%;background:' + p.accent + ';"></div></div>' +
      opt("Integrity", false) + opt("Confidentiality", true) +
      '<div style="align-self:flex-end;padding:4px 10px;border-radius:' + Math.min(s.opt, 999) + 'px;background:' + p.btn + ';color:' + p.onBtn + ';font-size:10px;font-weight:800;text-transform:' + (s.up ? "uppercase" : "none") + ';">Turn in</div>' +
      '</div></div>';
  }
  window.CTF_SKINS = {
    list: ORDER.map(function (id) { var S = SKINS[id || "pop"]; return { id: id, name: id ? S.name : "Default", blurb: id ? S.blurb : "Chunky Pop on quizzes, the original look on your profile." }; }),
    apply: apply, css: css, forCourse: forCourse, swatch: swatch, has: function (id) { return !!(id && SKINS[id] && id !== "pop"); }
  };

  var me = document.currentScript, auto = me && me.getAttribute("data-auto");
  if (auto === "profile") apply(forCourse(window.CTF_COURSE), "profile");
  else if (auto === "quiz") { var last = null; try { last = localStorage.getItem("quiz-skin-last") || null; } catch (e) {} apply(SKINS[last] ? last : null, "quiz"); }
})();
