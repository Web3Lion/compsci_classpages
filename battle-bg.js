// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* battle-bg.js (v27.0) — animated canvas background for duel / battle / bracket pages.
   Styles: rain (code rain), grid (synthwave floor), hex (circuit particles), aurora, course (NEMESIS glitch /
   ADA packets / ORACLE blocks), off. The teacher picks one per page (teacher.html → Duels → Battle backgrounds;
   stored in classes.battle_bg by supabase/brackets.sql).
   BATTLE_BG.auto(page, { student: id } | { cls: id }) fetches the setting; BATTLE_BG.set(style) draws directly.
   Reduced motion = one still frame. Pauses in hidden tabs. */
(function () {
  if (window.BATTLE_BG) return;
  var DEF = { bracket: "grid", duel: "rain", projector: "aurora", spectator: "hex", arena: "course" };
  var cv = null, cx = null, raf = 0, cur = "off", t0 = 0, last = 0, W = 0, H = 0, S = {};
  function RM() { try { return !!(window.SITE_REDUCED_MOTION && window.SITE_REDUCED_MOTION()); } catch (e) { return false; } }
  function light() { return document.documentElement.getAttribute("data-theme") === "light"; }
  function course() { return window.CTF_COURSE || (new URLSearchParams(location.search).get("c")) || ""; }
  function css(n, d) { var v = getComputedStyle(document.documentElement).getPropertyValue(n).trim(); return v || d; }
  function mount() {
    if (cv) return;
    cv = document.createElement("canvas"); cv.id = "battleBg"; cv.setAttribute("aria-hidden", "true");
    cv.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;";
    var bg = getComputedStyle(document.body).backgroundColor;
    document.documentElement.style.background = bg && bg !== "rgba(0, 0, 0, 0)" ? bg : css("--bg", "#0a0e14");
    document.body.style.background = "transparent";
    document.body.prepend(cv); cx = cv.getContext("2d"); size();
    addEventListener("resize", size);
  }
  function size() { if (!cv) return; var r = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * r; cv.height = H * r; cx.setTransform(r, 0, 0, r, 0, 0); S = {}; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  var GLY = "01ABCDEF<>/{}[]#$%&*+=?";
  var DRAW = {
    rain: function (t, col) {
      var fs = 16, n = Math.ceil(W / fs);
      if (!S.drops || S.drops.length !== n) S.drops = Array.from({ length: n }, function () { return rnd(-H, 0) / fs; });
      cx.fillStyle = light() ? "rgba(233,238,245,.18)" : "rgba(10,14,20,.16)"; cx.fillRect(0, 0, W, H);
      cx.font = fs + "px JetBrains Mono, monospace"; cx.fillStyle = col;
      for (var i = 0; i < n; i++) {
        cx.fillText(GLY[(Math.random() * GLY.length) | 0], i * fs, S.drops[i] * fs);
        S.drops[i] += .45; if (S.drops[i] * fs > H && Math.random() > .975) S.drops[i] = 0;
      }
    },
    grid: function (t, col) {
      cx.clearRect(0, 0, W, H);
      var hz = H * .58, g = cx.createLinearGradient(0, hz - 140, 0, hz + 10);
      g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, col); cx.globalAlpha = .35; cx.fillStyle = g; cx.fillRect(0, hz - 140, W, 150); cx.globalAlpha = 1;
      cx.strokeStyle = col; cx.lineWidth = 1;
      for (var i = -20; i <= 20; i++) { cx.globalAlpha = .5; cx.beginPath(); cx.moveTo(W / 2 + i * 30, hz); cx.lineTo(W / 2 + i * W * .18, H); cx.stroke(); }
      var off = (t / 40) % 40;
      for (var y = 0; y < 18; y++) { var p = Math.pow((y * 40 + off) / 720, 2.2), yy = hz + p * (H - hz); cx.globalAlpha = Math.min(.7, p * 1.4); cx.beginPath(); cx.moveTo(0, yy); cx.lineTo(W, yy); cx.stroke(); }
      cx.globalAlpha = 1;
    },
    hex: function (t, col) {
      cx.clearRect(0, 0, W, H);
      if (!S.p) S.p = Array.from({ length: Math.round(W * H / 26000) }, function () { return { x: rnd(0, W), y: rnd(0, H), vx: rnd(-.25, .25), vy: rnd(-.25, .25), r: rnd(8, 22), a: rnd(0, 6) }; });
      cx.strokeStyle = col; cx.lineWidth = 1;
      S.p.forEach(function (q, i) {
        q.x = (q.x + q.vx + W) % W; q.y = (q.y + q.vy + H) % H; q.a += .003;
        cx.globalAlpha = .55; cx.beginPath();
        for (var k = 0; k < 6; k++) { var an = q.a + k * Math.PI / 3; cx[k ? "lineTo" : "moveTo"](q.x + q.r * Math.cos(an), q.y + q.r * Math.sin(an)); }
        cx.closePath(); cx.stroke();
        for (var j = i + 1; j < S.p.length; j++) { var o = S.p[j], dx = o.x - q.x, dy = o.y - q.y, d = dx * dx + dy * dy;
          if (d < 22000) { cx.globalAlpha = .25 * (1 - d / 22000); cx.beginPath(); cx.moveTo(q.x, q.y); cx.lineTo(q.x, o.y); cx.lineTo(o.x, o.y); cx.stroke(); } }
      });
      cx.globalAlpha = 1;
    },
    aurora: function (t, col) {
      cx.clearRect(0, 0, W, H);
      var C = [col, "#b06cff", "#2ec27e", "#ff5d73"];
      for (var i = 0; i < 4; i++) {
        var x = W * (.5 + .38 * Math.sin(t / (9000 + i * 2300) + i * 1.7)), y = H * (.45 + .3 * Math.cos(t / (11000 + i * 1900) + i)), r = Math.max(W, H) * .45;
        var g = cx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, C[i]); g.addColorStop(1, "rgba(0,0,0,0)");
        cx.globalAlpha = light() ? .18 : .28; cx.fillStyle = g; cx.fillRect(0, 0, W, H);
      }
      cx.globalAlpha = 1;
    },
    course: function (t, col) {
      var c = course();
      if (c === "apcsp") {   // ADA: packets travelling a network grid
        cx.clearRect(0, 0, W, H); var gs = 80; cx.strokeStyle = "#b06cff"; cx.globalAlpha = .18;
        for (var x = 0; x < W; x += gs) { cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, H); cx.stroke(); }
        for (var y = 0; y < H; y += gs) { cx.beginPath(); cx.moveTo(0, y); cx.lineTo(W, y); cx.stroke(); }
        if (!S.k) S.k = Array.from({ length: 26 }, function () { return { h: Math.random() < .5, l: ((Math.random() * (H / gs)) | 0) * gs, p: rnd(0, W), v: rnd(1, 3) }; });
        cx.globalAlpha = .8; cx.fillStyle = "#c79bff";
        S.k.forEach(function (q) { q.p += q.v; var lim = q.h ? W : H; if (q.p > lim) { q.p = 0; q.l = ((Math.random() * ((q.h ? H : W) / gs)) | 0) * gs; } cx.fillRect(q.h ? q.p : q.l - 3, q.h ? q.l - 3 : q.p, 8, 6); });
        cx.globalAlpha = 1; return;
      }
      if (c === "web3") {    // ORACLE: blocks sliding along a chain
        cx.clearRect(0, 0, W, H); var bw = 56, rows = Math.ceil(H / 110);
        for (var r = 0; r < rows; r++) {
          var sp = (r % 2 ? -1 : 1) * (18 + r * 3), off = ((t / 1000) * sp) % (bw * 2), yy = 40 + r * 110;
          cx.strokeStyle = "#ff9f1c"; cx.globalAlpha = .22; cx.beginPath(); cx.moveTo(0, yy + bw / 2); cx.lineTo(W, yy + bw / 2); cx.stroke();
          for (var xx = -bw * 2 + off; xx < W + bw; xx += bw * 2) { cx.globalAlpha = .38; cx.strokeRect(xx, yy, bw, bw); cx.globalAlpha = .12; cx.fillStyle = "#ff9f1c"; cx.fillRect(xx, yy, bw, bw); }
        }
        cx.globalAlpha = 1; return;
      }
      DRAW.rain(t, "#ff4d6d");   // NEMESIS / SPECTER: red rain with glitch bars
      if (Math.random() < .04) { cx.globalAlpha = .25; cx.fillStyle = Math.random() < .5 ? "#ff4d6d" : "#00e5ff"; cx.fillRect(0, rnd(0, H), W, rnd(2, 14)); cx.globalAlpha = 1; }
    }
  };
  function loop(ts) {
    raf = requestAnimationFrame(loop);
    if (document.hidden || ts - last < 33) return; last = ts;
    frame(ts - t0);
  }
  function frame(t) {
    if (!cx || !DRAW[cur]) return;
    cx.save(); cx.globalAlpha = 1;
    var col = css("--accent", "#00b3ff");
    cv.style.opacity = light() ? ".45" : ".6";
    DRAW[cur](t, col); cx.restore();
  }
  function set(style) {
    style = DRAW[style] ? style : "off";
    if (style === cur && cv) return;
    cur = style; cancelAnimationFrame(raf); S = {};
    if (style === "off") { if (cv) { cv.remove(); cv = null; document.body.style.background = ""; } return; }
    mount(); cx.clearRect(0, 0, W, H); t0 = performance.now();
    if (RM()) { for (var i = 0; i < 60; i++) frame(i * 33); return; }
    raf = requestAnimationFrame(loop);
  }
  function use(page, map) { var m = map && typeof map === "object" ? map : {}; set(m[page] || DEF[page] || "off"); }
  function auto(page, who) {
    use(page, null);
    var A = window.CTF_AUTH; if (!A || !A.online || !who) return;
    var p = who.cls ? A.rpc("ctf_t_bg", { p_class: who.cls }) : who.student ? A.rpc("ctf_bg", { p_student: who.student }) : null;
    if (p) p.then(function (m) { if (m && !m.error) use(page, m); }).catch(function () {});
  }
  window.BATTLE_BG = { set: set, use: use, auto: auto, DEF: DEF, styles: ["rain", "grid", "hex", "aurora", "course", "off"] };
})();
