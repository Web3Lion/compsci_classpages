/* ==========================================================================
   battle-fx.js (24.0) — shared hype layer for every battle page:
   battle.html, vocab-battle.html (projectors), arena-duel.html, vocab-duel.html,
   and the arena score bar (arena-duel.js).

   window.BATTLE_FX
     .banner(text, color, sub)      big slam banner (queued)
     .caster(text)                  sports-caster ticker line
     .edge(color|null)              screen-edge glow for whoever leads
     .shake(el) / .pop(el)          one-shot element effects
     .confetti(colors)              end-of-match burst
     .clock(key, leftMs, opts)      final-minute pulse + last-10s big countdown
                                    opts: {el, dblAt(ms), music:true}
     .track(key, snap, opts)        diff engine → first blood, lead change,
                                    comeback, streaks (3 in a row), captures
       snap = {status, teams:[{id,name,color,score}], feed:[{id,who,team,at,pts}]}
       opts = {streakBy:"team"|"who", noun:"capture"|"KO", self:id}
     .sfx(name)                     cap|lead|fire|blood|tick|horn|dbl|hit|miss|ko
     .music(on, fast)               synth beat (projector only)
     .soundUi(el)                   SFX / MUSIC toggle buttons (projector)
     .podium(o)                     results card HTML {title, rows, awards, mvp}
     .enableSound(bool)             pages opt in; students never get sound
   Honors window.SITE_REDUCED_MOTION(): no shake, no confetti, no slam motion.
   ========================================================================== */
(function () {
  if (window.BATTLE_FX) return;
  function RM() { try { return !!(window.SITE_REDUCED_MOTION && window.SITE_REDUCED_MOTION()); } catch (e) { return false; } }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function pickOne(a) { return a[Math.floor(Math.random() * a.length)]; }
  function fill(t, o) { return t.replace(/\{(\w+)\}/g, function (_, k) { return o[k] == null ? "" : o[k]; }); }

  var CSS = "" +
    "#bfxLayer{position:fixed;inset:0;pointer-events:none;z-index:9500;overflow:hidden;}" +
    "#bfxEdge{position:fixed;inset:0;pointer-events:none;z-index:9400;transition:box-shadow .8s ease;}" +
    "#bfxEdge.on{animation:bfxBreathe 2.4s ease-in-out infinite;}" +
    "@keyframes bfxBreathe{0%,100%{opacity:.75}50%{opacity:1}}" +
    ".bfxBan{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);text-align:center;padding:18px 36px;border-radius:18px;background:rgba(6,10,18,.92);border:3px solid var(--bfx,#ffcf5c);box-shadow:0 0 60px -10px var(--bfx,#ffcf5c);max-width:92vw;}" +
    ".bfxBan b{display:block;font-family:'JetBrains Mono',monospace;font-weight:800;font-size:clamp(28px,6vw,76px);line-height:1.05;color:#fff;letter-spacing:1px;text-shadow:0 0 24px var(--bfx,#ffcf5c);}" +
    ".bfxBan span{display:block;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:clamp(13px,1.8vw,20px);color:#e6eefb;margin-top:8px;letter-spacing:2px;}" +
    ".bfxBan.in{animation:bfxSlam .45s cubic-bezier(.2,1.6,.4,1) both;}.bfxBan.out{animation:bfxFade .35s ease both;}" +
    "@keyframes bfxSlam{0%{transform:translate(-50%,-50%) scale(2.4);opacity:0}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}" +
    "@keyframes bfxFade{to{opacity:0;transform:translate(-50%,-60%) scale(.96)}}" +
    "#bfxTick{position:fixed;left:16px;bottom:16px;z-index:9450;display:flex;flex-direction:column;gap:6px;pointer-events:none;max-width:min(560px,80vw);}" +
    ".bfxLine{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:15px;color:#fff;background:rgba(6,10,18,.9);border-left:4px solid #ffcf5c;padding:9px 14px;border-radius:8px;animation:bfxSlide .35s ease both;}" +
    ".bfxLine.out{animation:bfxFade2 .4s ease both;}" +
    "@keyframes bfxSlide{from{transform:translateX(-30px);opacity:0}to{transform:none;opacity:1}}@keyframes bfxFade2{to{opacity:0}}" +
    ".bfxShake{animation:bfxShake .5s ease;}@keyframes bfxShake{0%,100%{transform:none}20%{transform:translate(-6px,1px) rotate(-.6deg)}40%{transform:translate(6px,-1px) rotate(.6deg)}60%{transform:translate(-4px,0)}80%{transform:translate(3px,0)}}" +
    ".bfxPop{animation:bfxPop .5s cubic-bezier(.2,1.6,.4,1);}@keyframes bfxPop{0%{transform:scale(.6);opacity:0}100%{transform:none;opacity:1}}" +
    ".bfxPulse{animation:bfxPulse 1s ease-in-out infinite;}@keyframes bfxPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}" +
    ".bfxBig{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-family:'JetBrains Mono',monospace;font-weight:800;font-size:clamp(120px,26vw,340px);color:#fff;text-shadow:0 0 40px #ff3b3b,0 0 4px #000;line-height:1;opacity:.92;}" +
    ".bfxBig.in{animation:bfxBig .9s ease-out both;}@keyframes bfxBig{0%{transform:translate(-50%,-50%) scale(1.6);opacity:0}25%{opacity:.95}100%{transform:translate(-50%,-50%) scale(.9);opacity:0}}" +
    ".bfxConf{position:absolute;top:-20px;width:10px;height:16px;border-radius:2px;animation:bfxFall linear forwards;}" +
    "@keyframes bfxFall{to{transform:translate(var(--dx),110vh) rotate(var(--rot));}}" +
    ".bfxDmg{position:absolute;font-family:'JetBrains Mono',monospace;font-weight:800;font-size:28px;color:#fff;text-shadow:0 0 12px var(--bfx,#ff3b3b),0 2px 0 #000;animation:bfxRise 1s ease-out forwards;}" +
    "@keyframes bfxRise{from{transform:translate(-50%,0) scale(1.3);opacity:1}to{transform:translate(-50%,-60px) scale(1);opacity:0}}" +
    ".bfxBoss{position:relative;height:26px;border-radius:6px;background:#1a0d12;border:2px solid #000;box-shadow:inset 0 0 0 1px rgba(255,255,255,.12);overflow:hidden;}" +
    ".bfxBoss>.g{position:absolute;inset:0 auto 0 0;background:#fff;opacity:.55;transition:width .9s ease .35s;}" +
    ".bfxBoss>.f{position:absolute;inset:0 auto 0 0;transition:width .3s ease;background-image:linear-gradient(180deg,rgba(255,255,255,.35),rgba(255,255,255,0) 55%);}" +
    ".bfxBoss>.s{position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 calc(25% - 2px),rgba(0,0,0,.55) calc(25% - 2px) 25%);}" +
    ".bfxBoss.low>.f{animation:bfxLow .8s ease-in-out infinite;}@keyframes bfxLow{50%{filter:brightness(1.5)}}" +
    ".bfxFeedIn{animation:bfxFeed .6s cubic-bezier(.2,1.4,.4,1);}@keyframes bfxFeed{0%{transform:translateX(30px);opacity:0;background:rgba(255,207,92,.25)}100%{transform:none;opacity:1;background:transparent}}" +
    ".bfxAv{display:inline-flex;align-items:center;justify-content:center;flex:none;width:30px;height:30px;border-radius:50%;font-family:'JetBrains Mono',monospace;font-weight:800;font-size:12px;color:#fff;position:relative;}" +
    ".bfxAv .cosPet{position:absolute;right:-6px;bottom:-6px;font-size:16px;}" +
    ".bfxSnd{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;min-height:44px;padding:8px 12px;border-radius:999px;border:1px solid var(--border3,#244a6d);background:transparent;color:var(--dim,#7f9cb8);cursor:pointer;}" +
    ".bfxSnd[aria-pressed='true']{color:var(--bright,#fff);border-color:var(--amber,#ffcf5c);}" +
    "html.bfxRM .bfxBan.in,html.bfxRM .bfxBig.in,html.bfxRM .bfxPop,html.bfxRM .bfxFeedIn,html.bfxRM .bfxPulse,html.bfxRM #bfxEdge.on{animation:none!important;}" +
    "html.bfxRM .bfxBig{opacity:.85;}" +
    ".bfxGold{color:#ffcf5c;}:root[data-theme='light'] .bfxGold{color:#7a5a00;}" +
    ".bfxAct{flex-basis:100%;display:flex;gap:10px;flex-wrap:wrap;}.bfxAct>div{flex:1 1 100%;}.bfxAct button,.bfxAct a{white-space:nowrap;}";
  function css() {
    if (document.getElementById("bfxCss")) return;
    var s = document.createElement("style"); s.id = "bfxCss"; s.textContent = CSS; document.head.appendChild(s);
  }
  function layer() {
    css();
    document.documentElement.classList.toggle("bfxRM", RM());
    var l = document.getElementById("bfxLayer");
    if (!l) { l = document.createElement("div"); l.id = "bfxLayer"; l.setAttribute("aria-hidden", "true"); document.body.appendChild(l); }
    return l;
  }
  // screen-reader echo for banners + caster lines
  function sr(t) {
    var r = document.getElementById("bfxSR");
    if (!r) { r = document.createElement("div"); r.id = "bfxSR"; r.setAttribute("role", "status"); r.setAttribute("aria-live", "polite"); r.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"; document.body.appendChild(r); }
    r.textContent = t;
  }

  /* ---- banners (queued so they never overlap) ---- */
  var Q = [], showing = false;
  function banner(text, color, sub, ms) { Q.push([text, color, sub, ms || 2200]); if (Q.length > 4) Q.splice(1, 1); if (!showing) nextBan(); sr(text + (sub ? ". " + sub : "")); }
  function nextBan() {
    var b = Q.shift(); if (!b) { showing = false; return; }
    showing = true;
    var l = layer(), d = document.createElement("div");
    d.className = "bfxBan in"; d.style.setProperty("--bfx", b[1] || "#ffcf5c");
    d.innerHTML = "<b>" + esc(b[0]) + "</b>" + (b[2] ? "<span>" + esc(b[2]) + "</span>" : "");
    l.appendChild(d);
    setTimeout(function () { d.className = "bfxBan out"; setTimeout(function () { d.remove(); nextBan(); }, 350); }, b[3]);
  }
  /* ---- caster ticker ---- */
  var lastLine = 0;
  function caster(text, color) {
    css();
    var t = document.getElementById("bfxTick");
    if (!t) { t = document.createElement("div"); t.id = "bfxTick"; t.setAttribute("aria-hidden", "true"); document.body.appendChild(t); }
    var d = document.createElement("div"); d.className = "bfxLine"; if (color) d.style.borderLeftColor = color;
    d.textContent = "\u25B6 " + text; t.appendChild(d);
    while (t.children.length > 3) t.firstChild.remove();
    setTimeout(function () { d.classList.add("out"); setTimeout(function () { d.remove(); }, 400); }, 5200);
    lastLine = Date.now(); sr(text);
  }
  /* ---- edge glow ---- */
  function edge(color) {
    css();
    var e = document.getElementById("bfxEdge");
    if (!e) { e = document.createElement("div"); e.id = "bfxEdge"; e.setAttribute("aria-hidden", "true"); document.body.appendChild(e); }
    e.style.boxShadow = color ? "inset 0 0 0 4px " + color + ", inset 0 0 90px -10px " + color : "none";
    e.classList.toggle("on", !!color);
  }
  function retrigger(el, cls) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(function () { el.classList.remove(cls); }, 700); }
  function shake(el) { css(); if (!RM()) retrigger(el, "bfxShake"); }
  function pop(el) { css(); if (!RM()) retrigger(el, "bfxPop"); }
  function confetti(colors) {
    if (RM()) return;
    var l = layer(), C = (colors && colors.length ? colors : []).concat(["#ffcf5c", "#ffffff", "#00b3ff", "#ff5d73", "#2ec27e"]);
    for (var i = 0; i < 140; i++) {
      var p = document.createElement("i"); p.className = "bfxConf";
      p.style.left = Math.random() * 100 + "vw"; p.style.background = C[i % C.length];
      p.style.setProperty("--dx", (Math.random() * 240 - 120) + "px"); p.style.setProperty("--rot", (Math.random() * 1080 - 540) + "deg");
      p.style.animationDuration = (2.4 + Math.random() * 2.2) + "s"; p.style.animationDelay = (Math.random() * .8) + "s";
      if (i % 3 === 0) { p.style.width = "8px"; p.style.height = "8px"; p.style.borderRadius = "50%"; }
      l.appendChild(p); (function (q) { setTimeout(function () { q.remove(); }, 5600); })(p);
    }
  }
  function damage(el, text, color) {
    if (!el) return; css();
    var r = el.getBoundingClientRect(), l = layer(), d = document.createElement("div");
    d.className = "bfxDmg"; d.textContent = text; d.style.setProperty("--bfx", color || "#ff3b3b");
    d.style.left = (r.left + r.width / 2) + "px"; d.style.top = (r.top - 6) + "px"; if (RM()) d.style.animation = "bfxFade2 1s ease forwards";
    l.appendChild(d); setTimeout(function () { d.remove(); }, 1100);
  }
  /* boss-style HP bar: f = fill, g = ghost damage trail, s = 4 hit segments */
  function bossBar(id, pct, color, label) {
    return '<div class="bfxBoss' + (pct <= 25 ? " low" : "") + '" id="' + id + 'B" role="meter" aria-label="' + esc(label) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
      '<div class="g" style="width:' + pct + '%;"></div><div class="f" id="' + id + '" style="width:' + pct + '%;background-color:' + color + ';"></div><div class="s"></div></div>';
  }
  function setBoss(id, pct) {
    var b = document.getElementById(id + "B"); if (!b) return;
    var f = b.querySelector(".f"), g = b.querySelector(".g");
    var was = parseFloat(f.style.width) || 0;
    f.style.width = pct + "%"; g.style.width = pct + "%"; b.setAttribute("aria-valuenow", pct); b.classList.toggle("low", pct <= 25);
    if (pct < was) { shake(b); damage(b, "-" + Math.round(was - pct) + "%"); }
  }
  function avatar(name, color, eq) {
    var ini = String(name || "?").replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase() || "?";
    var pet = (eq && window.CTF_COSMETICS && window.CTF_COSMETICS.petHtml) ? window.CTF_COSMETICS.petHtml(eq) : "";
    return '<span class="bfxAv" aria-hidden="true" style="background:' + esc(color || "#5c7592") + ';">' + esc(ini) + pet + '</span>';
  }

  /* ---- sound (WebAudio, no files) ---- */
  var AC = null, SND = false, prefs = { sfx: true, music: true };
  try { prefs.sfx = localStorage.getItem("bfx-sfx") !== "0"; prefs.music = localStorage.getItem("bfx-music") !== "0"; } catch (e) {}
  function ac() {
    if (!SND) return null;
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (AC.state === "suspended") AC.resume();
    return AC;
  }
  function tone(f, d, type, vol, when, slide) {
    var a = ac(); if (!a) return;
    var t = a.currentTime + (when || 0), o = a.createOscillator(), g = a.createGain();
    o.type = type || "square"; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
    g.gain.setValueAtTime(vol || .12, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .02);
  }
  function noise(d, vol, when, hp) {
    var a = ac(); if (!a) return;
    var t = a.currentTime + (when || 0), n = Math.floor(a.sampleRate * d), buf = a.createBuffer(1, n, a.sampleRate), ch = buf.getChannelData(0);
    for (var i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
    var s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter(); f.type = "highpass"; f.frequency.value = hp || 6000;
    s.buffer = buf; g.gain.setValueAtTime(vol || .06, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    s.connect(f); f.connect(g); g.connect(a.destination); s.start(t);
  }
  var SFX = {
    cap: function () { tone(660, .09, "square", .08); tone(990, .14, "square", .08, .08); },
    lead: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, .16, "sawtooth", .07, i * .09); }); },
    fire: function () { tone(220, .5, "sawtooth", .08, 0, 880); noise(.4, .05, 0, 2000); },
    blood: function () { tone(880, .12, "square", .1); tone(440, .35, "square", .09, .1, 110); },
    tick: function () { tone(1200, .05, "square", .07); },
    horn: function () { [0, .02].forEach(function (w) { tone(196, 1.1, "sawtooth", .09, w); tone(247, 1.1, "sawtooth", .07, w); tone(294, 1.1, "sawtooth", .07, w); }); },
    dbl: function () { [784, 988, 1175, 1568].forEach(function (f, i) { tone(f, .12, "square", .08, i * .07); }); },
    hit: function () { noise(.12, .12, 0, 800); tone(180, .15, "square", .1, 0, 60); },
    miss: function () { tone(200, .25, "sawtooth", .07, 0, 90); },
    ko: function () { tone(330, .6, "sawtooth", .1, 0, 55); noise(.5, .1, 0, 400); }
  };
  function sfx(n) { if (SND && prefs.sfx && SFX[n]) try { SFX[n](); } catch (e) {} }
  // music: 16-step loop, lookahead scheduler
  var M = { on: false, fast: false, step: 0, next: 0, iv: null };
  var BASS = [55, 0, 55, 0, 65.4, 0, 55, 73.4, 55, 0, 55, 0, 82.4, 0, 73.4, 65.4];
  function schedule() {
    var a = ac(); if (!a || !M.on) return;
    var spb = 60 / (M.fast ? 150 : 118) / 4;
    while (M.next < a.currentTime + .15) {
      var w = M.next - a.currentTime, s = M.step % 16;
      if (s % 4 === 0) tone(110, .14, "sine", .16, w, 40);
      if (s % 2 === 1) noise(.03, .025, w, 7000);
      if (s === 4 || s === 12) noise(.12, .05, w, 1500);
      if (BASS[s]) tone(BASS[s] * 2, spb * .9, "sawtooth", .035, w);
      if (M.fast && s % 4 === 2) tone(BASS[(s + 8) % 16] * 8 || 440, .06, "square", .02, w);
      M.next += spb; M.step++;
    }
  }
  function music(on, fast) {
    on = !!on && SND && prefs.music;
    M.fast = !!fast;
    if (on && !M.on) { var a = ac(); if (!a) return; M.on = true; M.next = a.currentTime + .05; M.step = 0; M.iv = setInterval(schedule, 40); }
    else if (!on && M.on) { M.on = false; clearInterval(M.iv); M.iv = null; }
  }
  var musicWanted = { on: false, fast: false };
  function soundUi(el) {
    if (!el) return; css();
    el.innerHTML = '<button type="button" class="bfxSnd" data-k="sfx" aria-pressed="' + prefs.sfx + '">SFX ' + (prefs.sfx ? "ON" : "OFF") + '</button>' +
      '<button type="button" class="bfxSnd" data-k="music" aria-pressed="' + prefs.music + '">MUSIC ' + (prefs.music ? "ON" : "OFF") + '</button>';
    el.style.display = "flex"; el.style.gap = "8px";
    el.querySelectorAll(".bfxSnd").forEach(function (b) {
      b.onclick = function () {
        var k = b.getAttribute("data-k"); prefs[k] = !prefs[k];
        try { localStorage.setItem("bfx-" + k, prefs[k] ? "1" : "0"); } catch (e) {}
        ac(); if (k === "music") { music(false); if (prefs.music) music(musicWanted.on, musicWanted.fast); }
        soundUi(el);
      };
    });
  }
  // browsers need a click before audio can play
  document.addEventListener("pointerdown", function () { if (SND) { ac(); if (musicWanted.on) music(true, musicWanted.fast); } }, { passive: true });

  /* ---- clock: final minute, double points warnings, big last-10 countdown ---- */
  var CK = {};
  function clock(key, left, o) {
    o = o || {}; var k = CK[key] || (CK[key] = { min: false, sec: null, dbl: 0 }), s = Math.ceil(left / 1000);
    if (o.el) o.el.classList.toggle("bfxPulse", left > 0 && left <= 60000);
    if (left > 0 && left <= 60000 && !k.min && left > 50000) { k.min = true; banner("FINAL MINUTE!", "#ff3b3b", "Every capture counts"); sfx("horn"); }
    if (left > 60000) k.min = false;
    if (o.music) { musicWanted = { on: left > 0, fast: left <= 60000 }; music(musicWanted.on, musicWanted.fast); }
    if (left > 0 && s <= 10 && s !== k.sec) {
      k.sec = s; var l = layer(), d = document.createElement("div"); d.className = "bfxBig in"; d.textContent = s; l.appendChild(d);
      setTimeout(function () { d.remove(); }, 950); sfx("tick");
    }
    if (o.dblAt) {
      var until = o.dblAt - (Date.now() + (o.skew || 0));
      if (until <= 10000 && until > 0 && k.dbl < 1) { k.dbl = 1; banner("DOUBLE POINTS IN 10", "#ffcf5c", "Get ready to capture"); caster("Heads up! Double points is about to drop!", "#ffcf5c"); sfx("dbl"); }
      if (until <= 0 && until > -30000 && k.dbl < 2) { k.dbl = 2; banner("DOUBLE POINTS!", "#ffcf5c", "30 seconds \u00b7 every capture x2"); sfx("dbl"); }
      if (until <= -30000 && k.dbl === 2) { k.dbl = 3; caster("Double points is over. Back to normal scoring.", "#ffcf5c"); }
    }
    if (left <= 0 && !k.end) { k.end = true; music(false); }
    if (left > 0) k.end = false;
  }
  function inDouble(dblAt, skew) { if (!dblAt) return false; var u = dblAt - (Date.now() + (skew || 0)); return u <= 0 && u > -30000; }

  /* ---- tracker: diff two snapshots and fire the moments ---- */
  var LINES = {
    lead: ["{t} TAKES THE LEAD!", "And {t} pulls ahead!", "{t} grabs the top spot!", "New leader: {t}!"],
    tie: ["We are ALL TIED UP!", "Dead even at the top!", "Nobody blinks, it's a tie!"],
    blood: ["FIRST BLOOD to {w}!", "{w} opens the scoring!", "{w} draws first blood!"],
    fire: ["{t} IS ON FIRE!", "{t} can't miss right now!", "Three straight for {t}!"],
    back: ["COMEBACK ALERT: {t} is charging!", "{t} is clawing back into this!", "Don't count out {t}!"],
    cap: ["{w} cashes in +{p} for {t}.", "{w} with the capture, +{p}!", "+{p} from {w}. {t} keeps rolling.", "{w} strikes for {t}!"],
    hard: ["A HARD flag from {w}! +{p} for {t}!", "Big-time capture: {w} cracks a Hard one!"],
    end: ["That's the horn! It's over!", "Time! Let's see the final board!"]
  };
  var TR = {};
  function track(key, snap, o) {
    o = o || {};
    var T = (snap.teams || []).slice(), F = (snap.feed || []).slice().sort(function (a, b) { return new Date(a.at) - new Date(b.at); });
    var p = TR[key];
    var byId = {}; T.forEach(function (t) { byId[t.id] = t; });
    var top = T.slice().sort(function (a, b) { return b.score - a.score; }), lead = top[0] && top[0].score > 0 && (!top[1] || top[0].score > top[1].score) ? top[0] : null;
    var tied = top[0] && top[1] && top[0].score > 0 && top[0].score === top[1].score;
    var out = { lead: lead, changed: [] };
    if (!p) {
      TR[key] = { lead: lead ? lead.id : null, tied: tied, scores: scoreMap(T), seen: F.length ? new Date(F[F.length - 1].at).getTime() : 0, count: F.length, run: { k: null, n: 0 }, gap: {}, status: snap.status, endFx: snap.status !== "live" };
      edge(snap.status === "live" && lead ? lead.color : null);
      return out;
    }
    var noun = o.noun || "capture";
    // new feed items
    var fresh = F.filter(function (f) { return new Date(f.at).getTime() > p.seen; });
    fresh.forEach(function (f, i) {
      var t = byId[f.team] || {}, tn = t.name || f.who;
      if (p.count === 0 && i === 0) { banner(o.bloodText || "FIRST BLOOD!", t.color, f.who + (t.name && t.name !== f.who ? " \u00b7 " + t.name : "")); sfx("blood"); caster(fill(pickOne(LINES.blood), { w: f.who }), t.color); }
      else if (fresh.length <= 3) {
        sfx("cap");
        if (Date.now() - lastLine > 2500) caster(fill(pickOne(f.hard ? LINES.hard : (o.capLines || LINES.cap)), { w: f.who, t: tn, p: f.pts }), t.color);
      }
      var sk = o.streakBy === "who" ? f.who : f.team;
      if (p.run.k === sk) p.run.n++; else p.run = { k: sk, n: 1 };
      if (p.run.n === 3 || p.run.n === 6) { var nm = o.streakBy === "who" ? f.who : tn; banner((nm === "YOU" ? "YOU'RE" : nm + " IS") + " ON FIRE!", t.color || "#ff8a00", p.run.n + " " + noun + "s in a row"); sfx("fire"); caster(fill(pickOne(LINES.fire), { t: nm }), t.color); }
      out.changed.push(f.team);
    });
    if (fresh.length) { p.seen = new Date(F[F.length - 1].at).getTime(); }
    p.count = Math.max(p.count + fresh.length, F.length);
    // score changes → shake that team's bar
    T.forEach(function (t) { if ((p.scores[t.id] || 0) !== t.score && out.changed.indexOf(t.id) === -1) out.changed.push(t.id); });
    // lead change / tie
    if (snap.status === "live") {
      if (lead && lead.id !== p.lead) { banner(lead.name === "YOU" ? "YOU TAKE THE LEAD!" : lead.name + " TAKES THE LEAD!", lead.color); sfx("lead"); caster(fill(pickOne(LINES.lead), { t: lead.name }), lead.color); }
      else if (tied && !p.tied) caster(pickOne(LINES.tie));
      edge(lead ? lead.color : null);
      // comeback: was ≥40% behind the leader, now within 10%
      T.forEach(function (t) {
        if (!lead || t.id === lead.id) return;
        var gap = lead.score > 0 ? (lead.score - t.score) / lead.score : 0;
        p.gap[t.id] = Math.max(p.gap[t.id] || 0, gap);
        if (p.gap[t.id] >= .4 && gap <= .1) { p.gap[t.id] = 0; banner("COMEBACK ALERT!", t.color, t.name + " is right on their heels"); sfx("fire"); caster(fill(pickOne(LINES.back), { t: t.name }), t.color); }
      });
    } else edge(null);
    if (p.status === "live" && snap.status !== "live" && !p.endFx) {
      p.endFx = true; music(false); sfx("horn"); caster(pickOne(LINES.end));
      if (snap.status === "done") setTimeout(function () { confetti(T.map(function (t) { return t.color; })); }, 300);
    }
    if (snap.status === "live") p.endFx = false;
    p.lead = lead ? lead.id : null; p.tied = tied; p.scores = scoreMap(T); p.status = snap.status;
    return out;
  }
  function scoreMap(T) { var m = {}; T.forEach(function (t) { m[t.id] = t.score; }); return m; }
  function reset(key) { delete TR[key]; delete CK[key]; edge(null); music(false); }

  /* ---- results card ---- */
  function podium(o) {
    css();
    var rows = (o.rows || []).slice(0, 4), medal = ["#ffcf5c", "#cfd8e3", "#d08a4a", "#7f9cb8"], order = rows.length >= 3 ? [1, 0, 2].concat(rows.length > 3 ? [3] : []) : rows.map(function (_, i) { return i; });
    var hts = [170, 130, 100, 80];
    var cols = order.map(function (i) {
      var r = rows[i]; if (!r) return "";
      return '<div style="flex:1;min-width:120px;max-width:240px;display:flex;flex-direction:column;align-items:center;gap:8px;">' +
        (r.avatar || "") +
        '<div style="font-weight:800;font-size:clamp(16px,2vw,24px);color:var(--bright,#fff);text-align:center;">' + esc(r.name) + '</div>' +
        '<div class="mono" style="font-weight:800;font-size:clamp(20px,3vw,34px);color:' + esc(r.color || "var(--amber)") + ';">' + esc(r.score) + '</div>' +
        '<div style="width:100%;height:' + hts[i] + 'px;border-radius:12px 12px 0 0;background:' + esc(r.color || "#334") + ';display:flex;align-items:flex-start;justify-content:center;padding-top:10px;box-shadow:inset 0 0 0 3px ' + medal[i] + ';">' +
          '<span class="mono" style="font-size:34px;font-weight:800;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.4);">' + (i + 1) + '</span></div>' +
        (r.sub ? '<div class="mono" style="font-size:12px;color:var(--muted,#a9bfd6);text-align:center;">' + esc(r.sub) + '</div>' : '') + '</div>';
    }).join("");
    var mvp = o.mvp ? '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:18px 20px;border-radius:14px;border:2px solid #ffcf5c;background:rgba(255,207,92,.08);">' +
      '<span class="mono bfxGold" style="font-size:12px;letter-spacing:2px;font-weight:800;">\u2605 MVP</span>' + (o.mvp.avatar || "") +
      '<span style="font-size:clamp(20px,3vw,32px);font-weight:800;color:var(--bright,#fff);">' + esc(o.mvp.name) + '</span>' +
      '<span class="mono" style="font-size:15px;color:var(--muted,#a9bfd6);">' + esc(o.mvp.detail || "") + '</span></div>' : "";
    var aw = (o.awards || []).filter(function (a) { return a && a.who; }).map(function (a) {
      return '<div style="flex:1;min-width:180px;padding:14px 16px;border-radius:12px;border:1px solid var(--border3,#244a6d);background:var(--bg,#0a0e14);">' +
        '<div class="mono' + (a.color ? '' : ' bfxGold') + '" style="font-size:11px;letter-spacing:1.5px;' + (a.color ? 'color:var(--bright,#fff);border-left:4px solid ' + esc(a.color) + ';padding-left:8px;' : '') + 'font-weight:800;">' + esc(a.label) + '</div>' +
        '<div style="font-size:18px;font-weight:800;color:var(--bright,#fff);margin-top:4px;">' + esc(a.who) + '</div>' +
        (a.detail ? '<div class="mono" style="font-size:12px;color:var(--muted,#a9bfd6);margin-top:2px;">' + esc(a.detail) + '</div>' : '') + '</div>';
    }).join("");
    return '<div id="bfxResults" style="display:flex;flex-direction:column;gap:18px;padding:22px;border-radius:16px;background:var(--panel,#0b1220);border:2px solid #ffcf5c;">' +
      '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;"><div style="flex:1;min-width:200px;"><div class="mono bfxGold" style="font-size:12px;letter-spacing:2px;font-weight:700;">' + esc(o.kicker || "FINAL") + '</div>' +
        '<div style="font-size:clamp(28px,5vw,54px);font-weight:800;color:var(--bright,#fff);line-height:1.1;">' + esc(o.title || "") + '</div></div>' +
        (o.actions ? '<div class="bfxAct">' + o.actions + '</div>' : "") + '</div>' +
      '<div style="display:flex;align-items:flex-end;justify-content:center;gap:14px;flex-wrap:wrap;padding-top:6px;">' + cols + '</div>' +
      mvp + (aw ? '<div style="display:flex;gap:10px;flex-wrap:wrap;">' + aw + '</div>' : '') + '</div>';
  }
  function fullscreen(el) { try { if (document.fullscreenElement) document.exitFullscreen(); else (el || document.documentElement).requestFullscreen(); } catch (e) {} }

  window.BATTLE_FX = { banner: banner, caster: caster, edge: edge, shake: shake, pop: pop, confetti: confetti, damage: damage,
    bossBar: bossBar, setBoss: setBoss, avatar: avatar, clock: clock, inDouble: inDouble, track: track, reset: reset, sfx: sfx, music: music,
    soundUi: soundUi, podium: podium, fullscreen: fullscreen, esc: esc,
    enableSound: function (on) { SND = !!on; if (!on) music(false); }, reduced: RM };
})();
