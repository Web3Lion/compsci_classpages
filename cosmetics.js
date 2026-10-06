// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* ============================================================================
   cosmetics.js  —  Coins + titles / name colors / frames (v2.0).

   Coins come from XP milestones (1 per 250 XP) and teacher grants, and are
   spent in the profile Coin Shop. Prices here MUST match _cosmetic_price() in
   supabase/coins-cosmetics.sql — the server is the one that charges.

   Exposes window.CTF_COSMETICS:
     .catalog                  every item
     .item(id)                 one item
     .nameStyle(eq)            inline CSS for a handle (color slot)
     .titleHtml(eq)            small title line under a handle
     .frameClass(eq)           class for a leaderboard row / card
     .css()                    injects the frame keyframes once
     .forClass(classId)        Promise<{handle(lowercase): equipped}>
     .mountShop(el)            profile Coin Shop card
   6.1 adds:
     .nameHtml(handle, eq)     pet + colored name + name effect, ready to drop in
     .rowClass(eq)             leaderboard row trail class
     .bannerStyle(eq)          profile banner background (inline CSS)
     .celebrate(eq)            capture celebration (particles + optional sound)
     .mine() / .refreshMine()  this student's own equipped set (cached per course)
   Slots: title, color, frame, fx (name effect), pet, celebrate, banner, row.
   A student's own pet also follows their cursor on the CTF + profile pages
   (toggle in the shop; off with reduced motion or no mouse).
   ========================================================================== */
(function () {
  var CATALOG = [
    { id: "t_script_kiddie",  slot: "title", name: "Script Kiddie",      price: 1 },
    { id: "t_packet_sniffer", slot: "title", name: "Packet Sniffer",     price: 2 },
    { id: "t_bit_flipper",    slot: "title", name: "Bit Flipper",        price: 2 },
    { id: "t_null_pointer",   slot: "title", name: "Null Pointer",       price: 3 },
    { id: "t_kernel_panic",   slot: "title", name: "Kernel Panic",       price: 3 },
    { id: "t_honeypot",       slot: "title", name: "Honeypot",           price: 3 },
    { id: "t_the_patch",      slot: "title", name: "The Patch",          price: 3 },
    { id: "t_cryptkeeper",    slot: "title", name: "Cryptkeeper",        price: 4 },
    { id: "t_root_access",    slot: "title", name: "Root Access",        price: 4 },
    { id: "t_zero_day",       slot: "title", name: "Zero Day",           price: 5 },
    { id: "t_ghost_shell",    slot: "title", name: "Ghost in the Shell", price: 6 },
    { id: "t_legend",         slot: "title", name: "Legend",             price: 10 },
    { id: "c_mint",   slot: "color", name: "Neon Mint",    price: 2, dark: "#3ddc84", light: "#137a3c" },
    { id: "c_ice",    slot: "color", name: "Ice Blue",     price: 2, dark: "#6fd6ff", light: "#0b6a95" },
    { id: "c_pink",   slot: "color", name: "Cyber Pink",   price: 2, dark: "#ff5fd2", light: "#b0187f" },
    { id: "c_gold",   slot: "color", name: "Laser Gold",   price: 3, dark: "#ffcf3f", light: "#8a6100" },
    { id: "c_plasma", slot: "color", name: "Plasma",       price: 3, dark: "#b98bff", light: "#6a2fd0" },
    { id: "c_aurora", slot: "color", name: "Aurora",       price: 6, grad: ["#3ddc84", "#6fd6ff", "#ff5fd2"], gradLight: ["#137a3c", "#0b6a95", "#b0187f"] },
    { id: "c_cyber",   slot: "color", name: "Cyber Green",  price: 5, dark: "#2ee6a6", light: "#0f7a55" },
    { id: "c_apcsp",   slot: "color", name: "Byte Purple",  price: 5, dark: "#c084fc", light: "#6d28d9" },
    { id: "c_web3",    slot: "color", name: "Block Orange", price: 5, dark: "#ff9838", light: "#b45309" },
    { id: "c_sflions", slot: "color", name: "SF Lions",     price: 12, grad: ["#00b85a", "#ffffff", "#00b85a"], gradLight: ["#008539", "#3f4a44", "#008539"] },
    { id: "c_fire",    slot: "color", name: "Fire",         price: 12, grad: ["#ff3b30", "#ff9500", "#ffd60a"], gradLight: ["#c0201a", "#b85c00", "#8a6100"] },
    { id: "c_ocean",   slot: "color", name: "Ocean",        price: 12, grad: ["#2de2c8", "#3fa7ff", "#5b7bff"], gradLight: ["#0b7a6c", "#0b6a95", "#1d3fc4"] },
    { id: "c_rainbow", slot: "color", name: "Rainbow",      price: 15, grad: ["#ff4d4d", "#ff9f1a", "#ffe14d", "#3ddc84", "#3fa7ff", "#a66bff"], gradLight: ["#c0201a", "#b85c00", "#8a6100", "#137a3c", "#0b5fa8", "#6a2fd0"] },
    { id: "c_matrix",  slot: "color", name: "Matrix Glitch", price: 25, dark: "#39ff88", light: "#137a3c", anim: "matrix" },
    { id: "c_rainbow_live", slot: "color", name: "Living Rainbow", price: 30, grad: ["#ff4d4d", "#ff9f1a", "#ffe14d", "#3ddc84", "#3fa7ff", "#a66bff", "#ff4d4d"], gradLight: ["#c0201a", "#b85c00", "#8a6100", "#137a3c", "#0b5fa8", "#6a2fd0", "#c0201a"], anim: "live" },
    { id: "c_holo",    slot: "color", name: "Holographic",  price: 35, grad: ["#ff9cf3", "#9cf3ff", "#fff59c", "#9cffb1", "#ff9cf3"], gradLight: ["#a3138a", "#0b6a95", "#7a6200", "#137a3c", "#a3138a"], anim: "holo" },
    { id: "x_glow",    slot: "fx", name: "Glow",       price: 15 },
    { id: "x_type",    slot: "fx", name: "Typewriter", price: 18 },
    { id: "x_sparkle", slot: "fx", name: "Sparkle",    price: 20 },
    { id: "p_mouse",   slot: "pet", name: "Computer Mouse", price: 10, glyph: "\ud83d\uddb1\ufe0f" },
    { id: "p_duck",    slot: "pet", name: "Rubber Duck",    price: 10, glyph: "\ud83e\udd86" },
    { id: "p_penguin", slot: "pet", name: "Penguin",        price: 15, glyph: "\ud83d\udc27" },
    { id: "p_robot",   slot: "pet", name: "Robot",          price: 15, glyph: "\ud83e\udd16" },
    { id: "p_cat",     slot: "pet", name: "Cat",            price: 15, glyph: "\ud83d\udc31" },
    { id: "p_owl",     slot: "pet", name: "Owl",            price: 15, glyph: "\ud83e\udd89" },
    { id: "p_ghost",   slot: "pet", name: "Ghost",          price: 15, glyph: "\ud83d\udc7b" },
    { id: "p_dino",    slot: "pet", name: "Dinosaur",       price: 20, glyph: "\ud83e\udd96" },
    { id: "p_lion",    slot: "pet", name: "SF Lion",        price: 20, glyph: "\ud83e\udd81" },
    { id: "p_dragon",  slot: "pet", name: "Dragon",         price: 40, glyph: "\ud83d\udc09" },
    { id: "k_confetti", slot: "celebrate", name: "Confetti",    price: 8 },
    { id: "k_pixels",   slot: "celebrate", name: "Pixel Burst", price: 12 },
    { id: "k_stars",    slot: "celebrate", name: "Starfall",    price: 15 },
    { id: "k_binary",   slot: "celebrate", name: "Binary Rain", price: 15 },
    { id: "k_parade",   slot: "celebrate", name: "Pet Parade",  price: 25 },
    { id: "b_circuit",  slot: "banner", name: "Circuit Board", price: 10 },
    { id: "b_grid",     slot: "banner", name: "Synth Grid",    price: 10 },
    { id: "b_sunset",   slot: "banner", name: "Sunset",        price: 12 },
    { id: "b_starfield",slot: "banner", name: "Starfield",     price: 15 },
    { id: "b_lions",    slot: "banner", name: "SF Lions Stripes", price: 15 },
    { id: "b_aurora",   slot: "banner", name: "Aurora Sky",    price: 20 },
    { id: "r_neon",     slot: "row", name: "Neon Underline", price: 10 },
    { id: "r_scan",     slot: "row", name: "Scanline",       price: 12 },
    { id: "r_comet",    slot: "row", name: "Comet Trail",    price: 15 },
    { id: "r_flame",    slot: "row", name: "Flame Trail",    price: 20 },
    { id: "f_pulse",   slot: "frame", name: "Pulse",   price: 4 },
    { id: "f_glitch",  slot: "frame", name: "Glitch",  price: 4 },
    { id: "f_circuit", slot: "frame", name: "Circuit", price: 5 },
    { id: "f_gold",    slot: "frame", name: "Gold",    price: 8 }
  ];
  var BY = {}; CATALOG.forEach(function (c) { BY[c.id] = c; });
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function light() { return document.documentElement.getAttribute("data-theme") === "light"; }

  function nameStyle(eq) {
    var c = eq && BY[eq.color]; if (!c) return "";
    if (c.grad) {
      var g = light() ? c.gradLight : c.grad;
      return "background:linear-gradient(90deg," + g.join(",") + ");-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;";
    }
    return "color:" + (light() ? c.light : c.dark) + ";";
  }
  function nameClass(eq) { var c = eq && BY[eq.color]; return c && c.anim ? " cosC-" + c.anim : ""; }
  function petHtml(eq, size) {
    var p = eq && BY[eq.pet]; if (!p) return "";
    return '<span class="cosPet" role="img" aria-label="' + esc(p.name) + '" title="' + esc(p.name) + '"' + (size ? ' style="font-size:' + size + '"' : '') + '>' + p.glyph + '</span>';
  }
  function nameHtml(handle, eq, o) {
    o = o || {};
    var h = String(handle == null ? "" : handle), fx = eq && eq.fx;
    var inner = '<span class="cosN' + nameClass(eq) + '" style="' + nameStyle(eq) + '">' + esc(h) + '</span>';
    if (fx === "x_type") inner = '<span class="cosType" style="--n:' + Math.max(1, h.length) + ';">' + inner + '</span><span class="cosCaret" aria-hidden="true">\u258c</span>';
    else if (fx === "x_glow") inner = '<span class="cosGlow">' + inner + '</span>';
    else if (fx === "x_sparkle") inner = '<span class="cosSpk">' + inner + '<i aria-hidden="true">\u2726</i><i aria-hidden="true">\u2726</i></span>';
    var pet = o.pet === false ? "" : petHtml(eq);
    return (pet || fx) ? '<span class="cosName" style="display:inline-flex;align-items:center;gap:.35em;max-width:100%;vertical-align:bottom;">' + pet + '<span style="min-width:0;overflow:hidden;text-overflow:ellipsis;">' + inner + '</span></span>' : inner;
  }
  function rowClass(eq) { var r = eq && BY[eq.row]; return r ? "cosR-" + r.id.slice(2) : ""; }
  var BANNERS = {
    b_circuit: "radial-gradient(circle,#00b3ff 0 2px,transparent 2.5px) 0 0/28px 28px,linear-gradient(90deg,transparent 49%,rgba(0,179,255,.35) 50%,transparent 51%) 0 0/28px 28px,linear-gradient(0deg,transparent 49%,rgba(0,179,255,.25) 50%,transparent 51%) 14px 0/56px 28px,linear-gradient(135deg,#06121f,#0c2a3f)",
    b_grid: "linear-gradient(transparent calc(100% - 1px),rgba(255,95,210,.75) 0) 0 0/100% 14px,linear-gradient(90deg,transparent calc(100% - 1px),rgba(255,95,210,.55) 0) 0 0/26px 100%,linear-gradient(180deg,#14052b,#3a0b4f 70%,#ff5fd2)",
    b_sunset: "linear-gradient(100deg,#2b1055 0%,#d53369 45%,#ff9f1a 75%,#ffd60a 100%)",
    b_starfield: "radial-gradient(#ffffff 1px,transparent 1.6px) 0 0/22px 22px,radial-gradient(#9cf3ff 1px,transparent 1.6px) 11px 7px/31px 31px,radial-gradient(#ffe14d .8px,transparent 1.4px) 5px 15px/43px 43px,linear-gradient(135deg,#050a1a,#121f45)",
    b_lions: "repeating-linear-gradient(135deg,#008539 0 18px,#ffffff 18px 26px,#008539 26px 30px,#e0e2e2 30px 34px)",
    b_aurora: "linear-gradient(115deg,#04111f 0%,#0f5c4a 30%,#3ddc84 45%,#6fd6ff 60%,#b98bff 78%,#ff5fd2 100%)"
  };
  function bannerStyle(eq) { var b = eq && BANNERS[eq.banner]; return b ? "background:" + b + ";" : ""; }
  function bannerHtml(eq, h) { var st = bannerStyle(eq); return st ? '<div aria-hidden="true" style="height:' + (h || 64) + 'px;border-radius:10px;margin-bottom:14px;border:1px solid var(--border2);' + st + '"></div>' : ""; }

  /* ---- own equipped set, cached per course so CTF pages paint instantly ---- */
  function course() { return window.CTF_COURSE || (window.CTF && window.CTF.course) || null; }
  function mine() { var c = course(); if (!c) return {}; try { return JSON.parse(localStorage.getItem("ctf-cos-" + c)) || {}; } catch (e) { return {}; } }
  function setMine(eq) { var c = course(); if (!c) return; try { localStorage.setItem("ctf-cos-" + c, JSON.stringify(eq || {})); } catch (e) {} companion(); }
  function refreshMine() {
    var AUTH = window.CTF_AUTH, c = course(), s = null;
    try { s = JSON.parse(localStorage.getItem("ctf-sess-" + c)); } catch (e) {}
    if (!AUTH || !AUTH.online || !s) return Promise.resolve(mine());
    return AUTH.rpc("ctf_my_coins", { p_student: s.studentId }).then(function (d) {
      if (d && !d.error) setMine(d.equipped || {}); return mine();
    }).catch(function () { return mine(); });
  }
  function reduced() { try { return (typeof window.SITE_REDUCED_MOTION === "function" && window.SITE_REDUCED_MOTION()) || matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } }
  function pref(k, def) { try { var v = localStorage.getItem(k); return v == null ? def : v === "1"; } catch (e) { return def; } }
  function setPref(k, on) { try { localStorage.setItem(k, on ? "1" : "0"); } catch (e) {} }

  /* ---- cursor buddy: your pet trails your pointer on CTF + profile pages ---- */
  var buddy = null, bx = 0, by = 0, tx = -100, ty = -100, braf = null, bound = false;
  function companion() {
    var p = BY[mine().pet];
    var ok = p && course() && pref("cos-follow", true) && !reduced() && window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!ok) { if (buddy) { buddy.remove(); buddy = null; cancelAnimationFrame(braf); } return; }
    if (!buddy) {
      buddy = document.createElement("span"); buddy.id = "cosBuddy"; buddy.setAttribute("aria-hidden", "true");
      buddy.style.cssText = "position:fixed;left:0;top:0;z-index:9000;pointer-events:none;font-size:22px;line-height:1;transition:opacity .3s;opacity:0;will-change:transform;";
      document.body.appendChild(buddy);
      if (!bound) { bound = true; document.addEventListener("pointermove", function (e) { tx = e.clientX + 16; ty = e.clientY + 14; if (buddy) buddy.style.opacity = "1"; }, { passive: true });
        document.addEventListener("pointerleave", function () { if (buddy) buddy.style.opacity = "0"; }); }
      (function step() { if (!buddy) return; bx += (tx - bx) * 0.12; by += (ty - by) * 0.12; buddy.style.transform = "translate(" + bx.toFixed(1) + "px," + by.toFixed(1) + "px) scaleX(" + (tx < bx - 2 ? -1 : 1) + ")"; braf = requestAnimationFrame(step); })();
    }
    buddy.textContent = p.glyph;
  }

  /* ---- capture celebrations ------------------------------------------------ */
  var actx = null;
  function tones(notes, type) {
    if (!pref("cos-sound", true)) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var t = actx.currentTime;
      notes.forEach(function (f, i) {
        var o = actx.createOscillator(), g = actx.createGain();
        o.type = type || "triangle"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t + i * 0.07); g.gain.exponentialRampToValueAtTime(0.07, t + i * 0.07 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.07 + 0.32);
        o.connect(g); g.connect(actx.destination); o.start(t + i * 0.07); o.stop(t + i * 0.07 + 0.35);
      });
    } catch (e) {}
  }
  var SOUNDS = { k_confetti: [[523, 659, 784, 1047], "triangle"], k_pixels: [[392, 523, 659, 784, 1047], "square"], k_stars: [[880, 1175, 1319, 1760], "sine"],
    k_binary: [[220, 330, 440, 660], "sawtooth"], k_parade: [[523, 523, 659, 784, 659, 1047], "triangle"] };
  function celebrate(eq) {
    eq = eq || mine(); var k = eq.celebrate; if (!BY[k]) return false;
    css(); var snd = SOUNDS[k]; if (snd) tones(snd[0], snd[1]);
    if (reduced()) return true;
    var ov = document.createElement("div"); ov.setAttribute("aria-hidden", "true");
    ov.style.cssText = "position:fixed;inset:0;z-index:14000;pointer-events:none;overflow:hidden;";
    var html = "", W = window.innerWidth, H = window.innerHeight, i, pet = (BY[eq.pet] || {}).glyph || "\u2726";
    var P = function (x, y, dx, dy, rot, dur, delay, inner, st) {
      return '<span style="position:absolute;left:' + x + 'px;top:' + y + 'px;--dx:' + dx + 'px;--dy:' + dy + 'px;--r:' + rot + 'deg;animation:cosFly ' + dur + 's cubic-bezier(.2,.6,.4,1) ' + delay + 's both;' + (st || "") + '">' + (inner || "") + '</span>';
    };
    var rnd = function (a, b) { return a + Math.random() * (b - a); };
    var cols = ["#ff4d4d", "#ff9f1a", "#ffe14d", "#3ddc84", "#3fa7ff", "#a66bff", "#ff5fd2"];
    if (k === "k_confetti") for (i = 0; i < 70; i++) html += P(W / 2, H * 0.32, rnd(-W / 2, W / 2), rnd(H * 0.2, H * 0.75), rnd(-720, 720), rnd(1.2, 2), rnd(0, .2), "", "width:" + rnd(6, 11) + "px;height:" + rnd(4, 7) + "px;background:" + cols[i % 7] + ";border-radius:1px;");
    else if (k === "k_pixels") for (i = 0; i < 48; i++) { var a = i / 48 * Math.PI * 2, d = rnd(120, 300); html += P(W / 2, H / 2, Math.cos(a) * d, Math.sin(a) * d, 0, rnd(.7, 1.1), 0, "", "width:10px;height:10px;background:" + cols[i % 7] + ";image-rendering:pixelated;"); }
    else if (k === "k_stars") for (i = 0; i < 28; i++) html += P(rnd(0, W), -30, rnd(-60, 60), H + 60, rnd(-180, 180), rnd(1.4, 2.4), rnd(0, .6), "\u2605", "font-size:" + rnd(14, 30) + "px;color:" + ["#ffe14d", "#fff59c", "#9cf3ff"][i % 3] + ";text-shadow:0 0 10px currentColor;");
    else if (k === "k_binary") for (i = 0; i < 46; i++) html += P(rnd(0, W), -24, 0, H * rnd(.6, 1.1), 0, rnd(1.1, 2), rnd(0, .7), Math.random() < .5 ? "0" : "1", "font:700 " + rnd(14, 24) + "px 'JetBrains Mono',monospace;color:#39ff88;text-shadow:0 0 8px #39ff88;");
    else if (k === "k_parade") for (i = 0; i < 22; i++) { var a2 = rnd(-Math.PI, 0), d2 = rnd(160, 360); html += P(W / 2, H * 0.62, Math.cos(a2) * d2, Math.sin(a2) * d2, rnd(-40, 40), rnd(1.1, 1.7), rnd(0, .25), pet, "font-size:" + rnd(22, 38) + "px;"); }
    ov.innerHTML = html; document.body.appendChild(ov);
    setTimeout(function () { ov.remove(); }, 3200);
    return true;
  }
  function titleHtml(eq, size) {
    var t = eq && BY[eq.title]; if (!t) return "";
    return '<span class="cosTitle" style="display:block;font-family:\'JetBrains Mono\',monospace;font-size:' + (size || 11) + 'px;letter-spacing:1.5px;text-transform:uppercase;color:var(--faint);font-weight:700;margin-top:2px;">' + esc(t.name) + '</span>';
  }
  function frameClass(eq) { var f = eq && BY[eq.frame]; return f ? "cosF-" + f.id.slice(2) : ""; }
  function css() {
    if (document.getElementById("cosCss")) return;
    var st = document.createElement("style"); st.id = "cosCss";
    st.textContent =
      "@keyframes cosPulse{0%,100%{box-shadow:0 0 0 1px var(--accent),0 0 0 0 color-mix(in oklab,var(--accent) 50%,transparent)}50%{box-shadow:0 0 0 1px var(--accent),0 0 18px 2px color-mix(in oklab,var(--accent) 50%,transparent)}}" +
      "@keyframes cosGlitch{0%,92%,100%{box-shadow:0 0 0 1px #ff5fd2,0 0 0 0 transparent}94%{box-shadow:-3px 0 0 1px #ff5fd2,3px 0 0 1px #6fd6ff}97%{box-shadow:3px 0 0 1px #ff5fd2,-3px 0 0 1px #6fd6ff}}" +
      ".cosF-pulse{animation:cosPulse 2.4s ease-in-out infinite;}" +
      ".cosF-glitch{animation:cosGlitch 3.2s steps(1) infinite;}" +
      ".cosF-circuit{border-style:dashed !important;border-color:var(--accent2,var(--accent)) !important;}" +
      ".cosF-gold{border-color:#ffcf3f !important;box-shadow:0 0 0 1px #ffcf3f,inset 0 0 22px -12px #ffcf3f;}" +
      ":root[data-theme='light'] .cosF-gold{border-color:#8a6100 !important;box-shadow:0 0 0 1px #8a6100;}" +
      "@media (prefers-reduced-motion:reduce){.cosF-pulse,.cosF-glitch{animation:none;box-shadow:0 0 0 1px var(--accent);}}" +
      ":root[data-motion='reduce'] .cosF-pulse,:root[data-motion='reduce'] .cosF-glitch{animation:none;box-shadow:0 0 0 1px var(--accent);}" +
      "@keyframes cosMove{to{background-position:300% 0}}" +
      ".cosC-live,.cosC-holo{background-size:300% 100% !important;animation:cosMove 7s linear infinite;}.cosC-holo{animation-duration:4s;}" +
      "@keyframes cosMatrix{0%,88%,100%{text-shadow:0 0 6px currentColor;opacity:1}90%{text-shadow:2px 0 #ff5fd2,-2px 0 #6fd6ff;opacity:.8}93%{text-shadow:-2px 0 #ff5fd2,2px 0 #6fd6ff;opacity:1}96%{opacity:.55}}" +
      ".cosC-matrix{animation:cosMatrix 2.8s steps(1) infinite;}" +
      "@keyframes cosType{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}" +
      ".cosType{display:inline-block;animation:cosType 1s steps(var(--n,8)) 1 both;}" +
      "@keyframes cosBlink{50%{opacity:0}}.cosCaret{animation:cosBlink 1s steps(1) infinite;color:var(--accent);font-weight:400;margin-left:1px;}" +
      "@keyframes cosGlowP{0%,100%{filter:drop-shadow(0 0 2px var(--accent))}50%{filter:drop-shadow(0 0 9px var(--accent))}}.cosGlow{display:inline-block;animation:cosGlowP 2.2s ease-in-out infinite;}" +
      ".cosSpk{position:relative;display:inline-block;padding:0 .3em;}.cosSpk i{position:absolute;font-style:normal;font-size:.55em;color:#ffcf3f;pointer-events:none;animation:cosTw 1.8s ease-in-out infinite;}" +
      ".cosSpk i:nth-of-type(1){top:-.2em;right:-.1em;}.cosSpk i:nth-of-type(2){bottom:-.1em;left:-.1em;animation-delay:.9s;}" +
      "@keyframes cosTw{0%,100%{opacity:0;transform:scale(.4) rotate(0)}50%{opacity:1;transform:scale(1) rotate(90deg)}}" +
      ".cosPet{display:inline-block;line-height:1;animation:cosBob 2.4s ease-in-out infinite;}@keyframes cosBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}" +
      ".cosR-comet{background:linear-gradient(90deg,color-mix(in oklab,var(--accent) 26%,transparent),transparent 55%),var(--panel) !important;}" +
      ".cosR-flame{background:linear-gradient(90deg,color-mix(in oklab,#ff6a00 32%,transparent),color-mix(in oklab,#ffd60a 12%,transparent) 30%,transparent 62%),var(--panel) !important;}" +
      ".cosR-neon{box-shadow:inset 0 -2px 0 #ff5fd2,0 8px 16px -12px #ff5fd2;}" +
      ".cosR-scan{position:relative;overflow:hidden;}.cosR-scan::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,color-mix(in oklab,var(--accent) 22%,transparent),transparent);transform:translateX(-100%);animation:cosScan 3.6s ease-in-out infinite;pointer-events:none;}" +
      "@keyframes cosScan{to{transform:translateX(100%)}}" +
      "@keyframes cosFly{0%{transform:translate(0,0) rotate(0);opacity:1}80%{opacity:1}100%{transform:translate(var(--dx),var(--dy)) rotate(var(--r));opacity:0}}" +
      "@media (prefers-reduced-motion:reduce){.cosC-live,.cosC-holo,.cosC-matrix,.cosType,.cosCaret,.cosGlow,.cosSpk i,.cosPet,.cosR-scan::after{animation:none !important;}.cosSpk i{opacity:1;}}" +
      ":root[data-motion='reduce'] :is(.cosC-live,.cosC-holo,.cosC-matrix,.cosType,.cosCaret,.cosGlow,.cosSpk i,.cosPet),:root[data-motion='reduce'] .cosR-scan::after{animation:none !important;}";
    document.head.appendChild(st);
  }
  function forClass(classId) {
    var AUTH = window.CTF_AUTH;
    if (!AUTH || !AUTH.online || !classId) return Promise.resolve({});
    return AUTH.rpc("ctf_class_cosmetics", { p_class: classId }).then(function (rows) {
      var map = {}; (Array.isArray(rows) ? rows : []).forEach(function (r) { map[String(r.handle).toLowerCase()] = r.equipped || {}; });
      return map;
    }).catch(function () { return {}; });
  }

  /* ---- profile Coin Shop ---------------------------------------------------- */
  function mountShop(box) {
    if (!box) return;
    var AUTH = window.CTF_AUTH, API = window.CTF || {};
    var course = window.CTF_COURSE || API.course || "cyber1";
    var sess = null; try { sess = JSON.parse(localStorage.getItem("ctf-sess-" + course)); } catch (e) {}
    if (!AUTH || !AUTH.online || !sess) return;
    css();
    var ST = null, TAB = "title", busy = false, msg = "";
    function load() {
      AUTH.rpc("ctf_my_coins", { p_student: sess.studentId }).then(function (d) {
        if (!d || d.error) return; ST = d; setMine(d.equipped || {}); paint();
      }).catch(function () { /* coins-cosmetics.sql not run yet: stay hidden */ });
    }
    function owned(id) { return ST && (ST.owned || []).indexOf(id) !== -1; }
    function equipped(slot) { return ST && ST.equipped ? ST.equipped[slot] : null; }
    function preview(it) {
      var eq = {}; eq[it.slot] = it.id;
      var raw = sess.handle || "you", handle = esc(raw);
      if (it.slot === "title") return '<span style="font-weight:700;color:var(--bright);">' + handle + '</span>' + titleHtml(eq, 10);
      if (it.slot === "color" || it.slot === "fx" || it.slot === "pet") {
        if (it.slot !== "color" && ST.equipped && ST.equipped.color) eq.color = ST.equipped.color;
        return '<span style="font-weight:800;font-size:16px;color:var(--bright);">' + nameHtml(raw, eq) + '</span>';
      }
      if (it.slot === "celebrate") return '<button type="button" class="cosPrev mono" data-id="' + it.id + '" style="align-self:flex-start;font-size:11px;font-weight:700;padding:7px 12px;border-radius:8px;border:1px dashed var(--border3);background:transparent;color:var(--dim);cursor:pointer;">\u25b6 PREVIEW</button>';
      if (it.slot === "banner") return '<div aria-hidden="true" style="height:40px;border-radius:8px;border:1px solid var(--border2);' + bannerStyle(eq) + '"></div>';
      if (it.slot === "row") return '<div class="' + rowClass(eq) + '" style="display:flex;justify-content:space-between;padding:8px 10px;border-radius:8px;border:1px solid var(--border2);background:var(--panel);font-size:12px;font-weight:700;color:var(--bright);"><span>#1 ' + handle + '</span><span class="mono" style="color:var(--dim);">999 XP</span></div>';
      return '<span class="' + frameClass(eq) + '" style="display:inline-block;padding:6px 12px;border-radius:8px;border:1px solid var(--border2);font-weight:700;color:var(--bright);">' + handle + '</span>';
    }
    function paint() {
      if (!ST) return;
      var per = ST.per || 250, into = ST.xp % per, pct = Math.round(into / per * 100);
      var tabs = [["title", "Titles"], ["color", "Name colors"], ["fx", "Name effects"], ["pet", "Pets"], ["celebrate", "Celebrations"], ["banner", "Banners"], ["row", "Row trails"], ["frame", "Frames"]].map(function (t) {
        var on = TAB === t[0];
        return '<button type="button" class="cosTab mono" data-t="' + t[0] + '" aria-pressed="' + on + '" style="font-size:12px;font-weight:700;padding:9px 14px;min-height:40px;border-radius:999px;cursor:pointer;border:1px solid ' + (on ? "var(--accent)" : "var(--border2)") + ';background:' + (on ? "var(--accent)" : "transparent") + ';color:' + (on ? "var(--bg)" : "var(--dim)") + ';">' + t[1] + '</button>';
      }).join("");
      var items = CATALOG.filter(function (c) { return c.slot === TAB; }).map(function (it) {
        var own = owned(it.id), on = equipped(it.slot) === it.id, afford = ST.balance >= it.price;
        var btn = on
          ? '<button type="button" class="cosAct mono" data-a="unequip" data-id="' + it.id + '" style="' + btnCss("var(--accent)", true) + '">EQUIPPED \u2713</button>'
          : own
            ? '<button type="button" class="cosAct mono" data-a="equip" data-id="' + it.id + '" style="' + btnCss("var(--accent)") + '">EQUIP</button>'
            : '<button type="button" class="cosAct mono" data-a="buy" data-id="' + it.id + '"' + (afford ? "" : " disabled") + ' aria-label="Buy ' + esc(it.name) + ' for ' + it.price + ' coins" style="' + btnCss("var(--amber)") + (afford ? "" : "opacity:.45;cursor:not-allowed;") + '">\u25C9 ' + it.price + '</button>';
        return '<div style="display:flex;flex-direction:column;gap:10px;padding:14px;border-radius:12px;border:1px solid ' + (on ? "var(--accent)" : "var(--border2)") + ';background:var(--bg);">' +
          '<div style="min-height:40px;display:flex;flex-direction:column;justify-content:center;">' + preview(it) + '</div>' +
          '<div style="display:flex;align-items:center;gap:8px;"><span style="flex:1;min-width:0;font-size:13px;font-weight:600;color:var(--text);">' + esc(it.name) + '</span>' + btn + '</div></div>';
      }).join("");
      box.innerHTML = '<div class="card" style="padding:22px;margin-top:20px;">' +
        '<div style="display:flex;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:14px;">' +
          '<div style="flex:1;min-width:200px;"><div class="mono" style="font-size:11px;letter-spacing:1.5px;color:var(--faint);margin-bottom:6px;">COIN SHOP</div>' +
          '<div style="font-size:13px;color:var(--dim);line-height:1.55;max-width:520px;">Every ' + per + ' XP earns a coin. Spend coins on looks that show on the class leaderboard, in duels, on Class Pulse and in the arena. Buying never costs XP.</div></div>' +
          '<div style="text-align:right;"><div class="mono" style="font-size:28px;font-weight:800;color:var(--amber);line-height:1;" aria-label="' + ST.balance + ' coins">\u25C9 ' + ST.balance + '</div>' +
          '<div class="mono" style="font-size:11px;color:var(--dim);margin-top:6px;">next coin at ' + ST.next_at + ' XP</div>' +
          '<div role="progressbar" aria-label="Progress to next coin" aria-valuemin="0" aria-valuemax="' + per + '" aria-valuenow="' + into + '" style="margin-top:6px;width:160px;height:6px;border-radius:99px;background:var(--bg);border:1px solid var(--border2);overflow:hidden;margin-left:auto;"><div style="height:100%;width:' + pct + '%;background:var(--amber);"></div></div></div>' +
        '</div>' +
        '<div role="group" aria-label="Shop categories" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">' + tabs + '</div>' +
        (TAB === "pet" ? toggleHtml("cos-follow", "Your equipped pet follows your mouse on the arena and profile pages") : "") +
        (TAB === "celebrate" ? '<div class="mono" style="font-size:11px;color:var(--dim);margin:-4px 0 10px;">Plays every time you capture a flag.</div>' + toggleHtml("cos-sound", "Play a short sound with the celebration") : "") +
        (TAB === "banner" ? '<div class="mono" style="font-size:11px;color:var(--dim);margin:-4px 0 10px;">Shows across the top of your profile card.</div>' : "") +
        (TAB === "row" ? '<div class="mono" style="font-size:11px;color:var(--dim);margin:-4px 0 10px;">Styles your row on the class leaderboard.</div>' : "") +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px;">' + items + '</div>' +
        '<div class="mono" id="cosMsg" role="status" aria-live="polite" style="font-size:11px;color:var(--faint);margin-top:12px;min-height:14px;">' + esc(msg) + '</div>' +
      '</div>';
      box.querySelectorAll(".cosTab").forEach(function (b) { b.onclick = function () { TAB = b.getAttribute("data-t"); msg = ""; paint(); }; });
      box.querySelectorAll(".cosAct").forEach(function (b) { b.onclick = function () { act(b.getAttribute("data-a"), b.getAttribute("data-id")); }; });
      box.querySelectorAll(".cosPrev").forEach(function (b) { b.onclick = function () { var e2 = Object.assign({}, ST.equipped || {}); e2.celebrate = b.getAttribute("data-id"); celebrate(e2); }; });
      box.querySelectorAll(".cosTog").forEach(function (b) { b.onchange = function () { setPref(b.getAttribute("data-k"), b.checked); if (b.getAttribute("data-k") === "cos-follow") companion(); }; });
    }
    function toggleHtml(k, label) {
      return '<label style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text);margin:-4px 0 12px;cursor:pointer;"><input type="checkbox" class="cosTog" data-k="' + k + '"' + (pref(k, true) ? " checked" : "") + '> ' + esc(label) + '</label>';
    }
    function btnCss(col, solid) {
      return "flex:none;font-size:11px;font-weight:800;letter-spacing:.5px;padding:8px 12px;min-height:36px;border-radius:8px;cursor:pointer;border:1px solid " + col + ";background:" + (solid ? col : "transparent") + ";color:" + (solid ? "var(--bg)" : col) + ";";
    }
    function act(a, id) {
      if (busy) return; var it = BY[id]; if (!it) return;
      if (a === "buy" && !confirm("Buy \u201c" + it.name + "\u201d for " + it.price + " coin" + (it.price === 1 ? "" : "s") + "?")) return;
      busy = true;
      var p = a === "buy" ? AUTH.rpc("ctf_buy_cosmetic", { p_student: sess.studentId, p_item: id })
        : AUTH.rpc("ctf_equip_cosmetic", { p_student: sess.studentId, p_slot: it.slot, p_item: a === "equip" ? id : null });
      p.then(function (d) {
        busy = false;
        if (!d || d.error) { msg = d && d.error === "not_enough_coins" ? "Not enough coins yet." : "Couldn\u2019t do that (" + ((d && d.error) || "error") + ")."; paint(); return; }
        ST = d; setMine(d.equipped || {}); if (window.CTF_COSMETICS_CHANGED) { try { window.CTF_COSMETICS_CHANGED(d.equipped || {}); } catch (e) {} }
        msg = a === "buy" ? "Bought " + it.name + "." : a === "equip" ? it.name + " equipped." : it.name + " removed."; paint();
      }).catch(function (e) { busy = false; msg = "Couldn\u2019t reach the server."; paint(); });
    }
    load();
  }

  window.CTF_COSMETICS = { catalog: CATALOG, item: function (id) { return BY[id] || null; }, nameStyle: nameStyle, nameClass: nameClass, nameHtml: nameHtml, petHtml: petHtml,
    titleHtml: titleHtml, frameClass: frameClass, rowClass: rowClass, bannerStyle: bannerStyle, bannerHtml: bannerHtml, css: css, forClass: forClass, mountShop: mountShop,
    celebrate: celebrate, mine: mine, refreshMine: refreshMine };
  function boot() { css(); companion(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
