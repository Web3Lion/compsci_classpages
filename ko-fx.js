/* ==========================================================================
   ko-fx.js — knockout moment: "K.O.!" slam, announcer voice + synth crash,
   screen shake, and the loser's card exploding into shards. No files, no deps.
   Used by Mane Event (stand-alone) and the class duel pages.

   KO_FX.blast({ el, name, sub, color, big, small, sound })
     el     element to explode (cloned, so it can be re-rendered right after)
     name   if no el: a card with this name is built in the middle and exploded
     big    slam text (default "K.O.!")    small  quick version for busy projector screens
   KO_FX.sfx(name)   tick | horn | hit | miss | win | ko
   KO_FX.soundOn() / KO_FX.setSound(bool)   saved per device (localStorage "ko-sound")
   KO_FX.music(on, fast) / musicOn() / setMusic(bool)   synth background loop (localStorage "ko-music")
   Reduce motion: no shake or shards, the slam just fades.
   ========================================================================== */
(function () {
  if (window.KO_FX) return;
  function RM() { try { if (window.SITE_REDUCED_MOTION) return !!window.SITE_REDUCED_MOTION(); return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var CSS = "" +
    "#koLayer{position:fixed;inset:0;pointer-events:none;z-index:9600;overflow:hidden;}" +
    ".koShake{animation:koShake .55s cubic-bezier(.36,.07,.19,.97) both;}" +
    "@keyframes koShake{10%,90%{transform:translate(-2px,1px)}20%,80%{transform:translate(5px,-2px) rotate(.4deg)}30%,50%,70%{transform:translate(-8px,2px) rotate(-.6deg)}40%,60%{transform:translate(8px,-1px) rotate(.6deg)}}" +
    ".koShakeS{animation:koShakeS .35s ease both;}@keyframes koShakeS{25%{transform:translate(-4px,1px)}50%{transform:translate(4px,-1px)}75%{transform:translate(-2px,0)}}" +
    ".koFlash{position:absolute;inset:0;background:radial-gradient(circle at var(--x,50%) var(--y,50%),rgba(255,255,255,.85),rgba(255,255,255,0) 55%);animation:koFlash .45s ease-out forwards;}" +
    "@keyframes koFlash{from{opacity:1}to{opacity:0}}" +
    ".koSlam{position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);font-family:'Bricolage Grotesque','JetBrains Mono',sans-serif;font-weight:800;font-size:clamp(90px,20vw,260px);line-height:1;color:#fff;letter-spacing:-2px;white-space:nowrap;" +
      "-webkit-text-stroke:4px var(--koc,#00934a);text-shadow:0 0 50px var(--koc,#00934a),0 8px 0 rgba(0,0,0,.35);animation:koSlam 1.5s cubic-bezier(.2,1.5,.4,1) forwards;}" +
    ".koSlam small{display:block;font-size:.17em;letter-spacing:1px;-webkit-text-stroke:0;text-align:center;margin-top:.25em;text-shadow:0 2px 8px rgba(0,0,0,.6);}" +
    ".koSlam.s{font-size:clamp(54px,9vw,120px);top:30%;animation-duration:1.1s;}" +
    "@keyframes koSlam{0%{transform:translate(-50%,-50%) scale(3) rotate(-8deg);opacity:0}14%{transform:translate(-50%,-50%) scale(.92) rotate(-3deg);opacity:1}22%{transform:translate(-50%,-50%) scale(1.05) rotate(-3deg)}75%{opacity:1}100%{transform:translate(-50%,-50%) scale(1) rotate(-3deg);opacity:0}}" +
    ".koSlam.rm{animation:koFade 1.6s ease forwards;}@keyframes koFade{0%,70%{opacity:1}100%{opacity:0}}" +
    ".koShard{position:absolute;overflow:hidden;will-change:transform,opacity;animation:koFly .95s cubic-bezier(.15,.6,.35,1) forwards;}" +
    "@keyframes koFly{0%{transform:none;opacity:1}100%{transform:translate(var(--dx),var(--dy)) rotate(var(--r)) scale(.6);opacity:0}}" +
    ".koSpark{position:absolute;width:10px;height:10px;border-radius:50%;animation:koFly .8s ease-out forwards;}" +
    ".koGhost{position:absolute;left:50%;top:58%;transform:translate(-50%,-50%);min-width:min(420px,80vw);padding:22px 30px;border-radius:18px;background:#fff;color:#062014;border:4px solid var(--koc,#00934a);" +
      "box-shadow:0 0 50px -8px var(--koc,#00934a);text-align:center;font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:clamp(26px,4.5vw,44px);line-height:1.1;}" +
    ".koGhost span{display:block;font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:2px;color:#4a6b58;margin-bottom:6px;}";
  function css() { if (document.getElementById("koCss")) return; var s = document.createElement("style"); s.id = "koCss"; s.textContent = CSS; document.head.appendChild(s); }
  function layer() { css(); var l = document.getElementById("koLayer"); if (!l) { l = document.createElement("div"); l.id = "koLayer"; l.setAttribute("aria-hidden", "true"); document.body.appendChild(l); } return l; }
  function sr(t) { var r = document.getElementById("koSR"); if (!r) { r = document.createElement("div"); r.id = "koSR"; r.setAttribute("role", "status"); r.setAttribute("aria-live", "polite"); r.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"; document.body.appendChild(r); } r.textContent = t; }

  /* ---- sound ---- */
  var AC = null;
  function soundOn() { try { return localStorage.getItem("ko-sound") !== "0" && localStorage.getItem("bfx-sfx") !== "0"; } catch (e) { return true; } }
  function setSound(on) { try { localStorage.setItem("ko-sound", on ? "1" : "0"); } catch (e) {} if (on) ac(); }
  function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } } if (AC.state === "suspended") AC.resume(); return AC; }
  document.addEventListener("pointerdown", function () { if (soundOn()) ac(); }, { passive: true, once: true });
  function tone(f, d, type, vol, when, slide) {
    var a = ac(); if (!a) return; var t = a.currentTime + (when || 0), o = a.createOscillator(), g = a.createGain();
    o.type = type || "square"; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
    g.gain.setValueAtTime(vol || .1, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .02);
  }
  function noise(d, vol, when, freq, type) {
    var a = ac(); if (!a) return; var t = a.currentTime + (when || 0), n = Math.floor(a.sampleRate * d), b = a.createBuffer(1, n, a.sampleRate), ch = b.getChannelData(0);
    for (var i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
    var s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter(); f.type = type || "lowpass"; f.frequency.value = freq || 1200;
    s.buffer = b; g.gain.setValueAtTime(vol || .2, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); s.connect(f); f.connect(g); g.connect(a.destination); s.start(t);
  }
  var SFX = {
    tick: function () { tone(1100, .06, "square", .06); },
    horn: function () { [196, 247, 294].forEach(function (f) { tone(f, 1, "sawtooth", .07); }); },
    hit: function () { tone(660, .08, "square", .07); tone(990, .12, "square", .07, .07); },
    miss: function () { tone(180, .22, "sawtooth", .07, 0, 90); },
    win: function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, .22, "square", .06, i * .1); }); },
    ko: function () { noise(.9, .35, 0, 900); tone(150, .7, "sine", .5, 0, 38); tone(90, .5, "sawtooth", .12, .02, 30); noise(.25, .12, 0, 4000, "highpass"); }
  };
  function sfx(n) { if (soundOn() && SFX[n]) try { SFX[n](); } catch (e) {} }
  var lastVoice = 0;
  function voice(t) {
    if (!soundOn() || !window.speechSynthesis || Date.now() - lastVoice < 1500) return; lastVoice = Date.now();
    try { var u = new SpeechSynthesisUtterance(t); u.rate = .85; u.pitch = .55; u.volume = 1; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {}
  }

  /* ---- visuals ---- */
  function shake(small) { if (RM()) return; var b = document.body, c = small ? "koShakeS" : "koShake"; b.classList.remove("koShake", "koShakeS"); void b.offsetWidth; b.classList.add(c); setTimeout(function () { b.classList.remove(c); }, 600); }
  function shatter(src, rect, color) {
    var l = layer(), cols = 4, rows = 3, w = rect.width / cols, h = rect.height / rows, cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var sh = document.createElement("div"); sh.className = "koShard";
      sh.style.cssText = "left:" + (rect.left + c * w) + "px;top:" + (rect.top + r * h) + "px;width:" + w + "px;height:" + h + "px;";
      var inner = src.cloneNode(true); inner.removeAttribute("id"); inner.querySelectorAll("[id]").forEach(function (x) { x.removeAttribute("id"); });
      inner.style.cssText += ";position:absolute;margin:0;left:" + (-c * w) + "px;top:" + (-r * h) + "px;width:" + rect.width + "px;height:" + rect.height + "px;box-sizing:border-box;";
      sh.appendChild(inner);
      var mx = rect.left + (c + .5) * w - cx, my = rect.top + (r + .5) * h - cy, k = 2.2 + Math.random() * 2.4;
      sh.style.setProperty("--dx", (mx * k + (Math.random() * 120 - 60)) + "px"); sh.style.setProperty("--dy", (my * k + 80 + Math.random() * 160) + "px");
      sh.style.setProperty("--r", (Math.random() * 140 - 70) + "deg"); sh.style.animationDelay = (Math.random() * .06) + "s";
      l.appendChild(sh); (function (q) { setTimeout(function () { q.remove(); }, 1150); })(sh);
    }
    for (var i = 0; i < 26; i++) {
      var p = document.createElement("i"), a = Math.random() * Math.PI * 2, d = 120 + Math.random() * 260;
      p.className = "koSpark"; p.style.left = cx + "px"; p.style.top = cy + "px"; p.style.background = i % 3 ? (color || "#00934a") : (i % 2 ? "#fff" : "#ffd34d");
      p.style.setProperty("--dx", Math.cos(a) * d + "px"); p.style.setProperty("--dy", Math.sin(a) * d + "px"); p.style.setProperty("--r", "0deg");
      l.appendChild(p); (function (q) { setTimeout(function () { q.remove(); }, 900); })(p);
    }
    var fl = document.createElement("div"); fl.className = "koFlash"; fl.style.setProperty("--x", cx + "px"); fl.style.setProperty("--y", cy + "px"); l.appendChild(fl); setTimeout(function () { fl.remove(); }, 500);
  }
  var lastBig = 0;
  function blast(o) {
    o = o || {}; var color = o.color || "#00934a", l = layer(), t = Date.now();
    var small = !!o.small || t - lastBig < 1400; if (!small) lastBig = t;
    if (o.sound !== false) { sfx("ko"); if (!small) setTimeout(function () { voice(o.say || "K. O.!"); }, 120); }
    var slam = document.createElement("div"); slam.className = "koSlam" + (small ? " s" : "") + (RM() ? " rm" : ""); slam.style.setProperty("--koc", color);
    slam.innerHTML = esc(o.big || "K.O.!") + (o.sub && !small ? "<small>" + esc(o.sub) + "</small>" : ""); l.appendChild(slam); setTimeout(function () { slam.remove(); }, 1700);
    sr((o.big || "K.O.") + (o.sub ? " " + o.sub : ""));
    if (RM()) return;
    shake(small);
    var src = o.el && o.el.getBoundingClientRect ? o.el : null, rect = src && src.getBoundingClientRect();
    if (!src || !rect.width) {
      if (!o.name || small) return;
      var g = document.createElement("div"); g.className = "koGhost"; g.style.setProperty("--koc", color);
      g.innerHTML = (o.label ? "<span>" + esc(o.label) + "</span>" : "") + esc(o.name); l.appendChild(g);
      rect = g.getBoundingClientRect(); src = g;
      setTimeout(function () { var r2 = g.getBoundingClientRect(); g.remove(); shatter(src, r2, color); }, 380);
      return;
    }
    var clone = src.cloneNode(true), cs = getComputedStyle(src);
    clone.style.background = clone.style.background || (cs.backgroundColor === "rgba(0, 0, 0, 0)" ? getComputedStyle(document.body).backgroundColor : cs.backgroundColor);
    shatter(clone, rect, color);
  }
  /* ---- background music: 16-step loop (kick, hats, snare, bass, lead), faster for the final minute ---- */
  var M = { on: false, fast: false, step: 0, next: 0, iv: null, want: false, wantFast: false };
  var BASS = [55, 0, 55, 0, 65.4, 0, 55, 73.4, 55, 0, 55, 0, 82.4, 0, 73.4, 65.4];
  var LEAD = [440, 0, 523, 0, 659, 0, 523, 0, 587, 0, 494, 0, 440, 0, 392, 0];
  function musicOn() { try { return localStorage.getItem("ko-music") !== "0"; } catch (e) { return true; } }
  function setMusic(on) { try { localStorage.setItem("ko-music", on ? "1" : "0"); } catch (e) {} stop(); if (on) music(M.want, M.wantFast); }
  function sched() {
    var a = ac(); if (!a || !M.on) return;
    var spb = 60 / (M.fast ? 150 : 120) / 4;
    while (M.next < a.currentTime + .15) {
      var w = M.next - a.currentTime, s = M.step % 16, bar = Math.floor(M.step / 16) % 4;
      if (s % 4 === 0) tone(110, .14, "sine", .22, w, 40);
      if (s % 2 === 1) noise(.03, .03, w, 7000, "highpass");
      if (s === 4 || s === 12) noise(.12, .07, w, 1800);
      if (BASS[s]) tone(BASS[s] * 2, spb * .9, "sawtooth", .04, w);
      if (bar >= 2 && LEAD[s]) tone(LEAD[s] * (M.fast ? 2 : 1), spb * 1.6, "square", .018, w);
      M.next += spb; M.step++;
    }
  }
  function stop() { M.on = false; clearInterval(M.iv); M.iv = null; }
  function music(on, fast) {
    M.want = !!on; M.wantFast = !!fast; M.fast = !!fast;
    on = M.want && musicOn() && soundOn();
    if (on && !M.on) { var a = ac(); if (!a) return; M.on = true; M.next = a.currentTime + .05; M.step = 0; M.iv = setInterval(sched, 40); }
    else if (!on && M.on) stop();
  }
  document.addEventListener("pointerdown", function () { if (M.want) { ac(); music(M.want, M.wantFast); } }, { passive: true });

  window.KO_FX = { blast: blast, sfx: sfx, shake: shake, soundOn: soundOn, setSound: function (on) { setSound(on); if (!on) stop(); else music(M.want, M.wantFast); }, voice: voice,
    music: music, musicOn: musicOn, setMusic: setMusic };
})();
