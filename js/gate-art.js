// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* ============================================================================
   gate-art.js  —  in-character theatre for the sign-in gate.

   The CTF page is the only gated page, so it's the one place the course's
   guide can meet a student who isn't signed in yet. Two of the guides are
   adversaries (NEMESIS, SPECTER) and two are mentors (ADA, ORACLE), so the
   same screen reads as a threat or a welcome depending on the course.

   Everything here is decoration: animated backdrop behind the card, a typed
   line from the guide, a short "granted" beat on success, and a lockdown
   sequence on sign-out. The sign-in button is never blocked or delayed, and
   every animation respects prefers-reduced-motion.

   Exposes window.CTF_GATE_ART. Loaded before sync.js.
   ========================================================================== */
(function () {
  var REDUCED = false;
  try { REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  /* ---- the cast -----------------------------------------------------------
     Keyed by CHARACTER, not by course, and the course→character mapping plus
     every colour comes from COURSE_CONFIG. That way a course can be handed a
     different guide (or recoloured) by editing config.js alone, and the gate
     can never greet a student as someone the arena then calls by another name. */
  var CAST = {
    NEMESIS: {
      kind: "adversary", art: "alert",
      status: "INTRUSION DETECTED",
      btn: "AUTHENTICATE",
      lines: [
        "Unidentified terminal. You are not on my list.",
        "Still here? The door does not care how long you stare at it.",
        "Credentials, or nothing. I have all the time in the world."
      ],
      wrongDomain: "That badge isn't from this school. Nice try.",
      grantedTitle: "ACCESS GRANTED",
      grantedSub: "Fine. You're on the list \u2014 for now.",
      lockTitle: "TERMINAL SEALED",
      lockSub: "Session closed. I'll be watching the door."
    },
    SPECTER: {
      kind: "adversary", art: "static",
      status: "GHOST IN THE WIRE",
      btn: "PROVE IDENTITY",
      lines: [
        "I've been watching this door. Nobody comes through unnamed.",
        "You're still unnamed. That's not going to change by waiting.",
        "Every second you hesitate, I learn a little more about you."
      ],
      wrongDomain: "Wrong credentials entirely. I notice these things.",
      grantedTitle: "IDENTITY CONFIRMED",
      grantedSub: "You exist now. Don't waste it.",
      lockTitle: "SIGNAL LOST",
      lockSub: "You've gone dark. Good."
    },
    ADA: {
      kind: "mentor", art: "trace",
      status: "COMPILE ERROR",
      btn: "RUN auth()",
      lines: [
        "You're missing a declaration. Sign in and I'll initialize you.",
        "Still undefined \u2014 one click and we'll have you compiling.",
        "No rush. The build waits for you, not the other way around."
      ],
      wrongDomain: "That's a personal account \u2014 use your school one and we're good.",
      grantedTitle: "BUILD SUCCEEDED",
      grantedSub: "You're defined. Let's go make something.",
      lockTitle: "PROCESS EXITED",
      lockSub: "Progress saved. See you at the next build."
    },
    VECTOR: {
      kind: "adversary", art: "alert",
      status: "UNKNOWN ENTRY POINT",
      btn: "AUTHENTICATE PATH",
      lines: [
        "Every unverified connection is a path in. You haven't been mapped yet.",
        "Still unmapped. I catalog every route eventually.",
        "An open door is just an attack surface waiting for a name."
      ],
      wrongDomain: "Wrong network entirely. That route doesn't lead here.",
      grantedTitle: "PATH VERIFIED",
      grantedSub: "You're a known route now. Move carefully.",
      lockTitle: "ROUTE CLOSED",
      lockSub: "Connection terminated. I'll remember this path."
    },
    ORACLE: {
      kind: "mentor", art: "block",
      status: "UNVERIFIED WALLET",
      btn: "SIGN & VERIFY",
      lines: [
        "No signature, no consensus. The chain doesn't know you yet.",
        "Your block is still pending. Sign it and the network will accept you.",
        "Verification is the whole point. Take your time, then sign."
      ],
      wrongDomain: "That key isn't from this network \u2014 use your school account.",
      grantedTitle: "BLOCK CONFIRMED",
      grantedSub: "Signed, verified, and on the ledger.",
      lockTitle: "VAULT SEALED",
      lockSub: "Your ledger is safe. Come back any time."
    }
  };
  /* mentor guides read "success green"; adversaries get a colder confirm */
  var OK_MENTOR = "#3ecf8e", OK_ADV = "#2ee6a6";

  function courseCfg(course) {
    var all = window.COURSE_CONFIG || {};
    return ((all[course] || {}).ctf) || {};
  }
  function theme(course) {
    var cfg = courseCfg(course);
    var name = cfg.adversary || "NEMESIS";
    var base = CAST[name.toUpperCase()] || CAST.NEMESIS;
    var hue = cfg.adversaryColor || (base.kind === "mentor" ? "#a855f7" : "#ff3b3b");
    var mentor = (typeof cfg.mentor === "boolean") ? cfg.mentor : (base.kind === "mentor");
    return Object.assign({}, base, {
      guide: name,
      kind: mentor ? "mentor" : "adversary",
      hue: hue,
      glow: "color-mix(in srgb, " + hue + " 16%, transparent)",
      ok: mentor ? OK_MENTOR : OK_ADV
    });
  }

  /* ---- one-time keyframes ------------------------------------------------ */
  var injected = false;
  function injectCss() {
    if (injected) return; injected = true;
    var s = document.createElement("style");
    s.textContent = [
      "@keyframes gaSweep{0%{transform:translateY(-120%)}100%{transform:translateY(820%)}}",
      "@keyframes gaPulse{0%,100%{opacity:.30}50%{opacity:.75}}",
      "@keyframes gaRing{0%{transform:scale(.55);opacity:.55}100%{transform:scale(1.9);opacity:0}}",
      "@keyframes gaDrift{0%{background-position:0 0}100%{background-position:0 240px}}",
      "@keyframes gaBar{0%{transform:translateX(-115%)}100%{transform:translateX(115%)}}",
      "@keyframes gaBlink{0%,48%{opacity:1}49%,100%{opacity:0}}",
      "@keyframes gaFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}",
      "@keyframes gaSpinSlow{to{transform:rotate(360deg)}}",
      "@keyframes gaFadeIn{from{opacity:0}to{opacity:1}}",
      "@keyframes gaPop{0%{transform:scale(.86);opacity:0}55%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}",
      "@keyframes gaDoorL{from{transform:translateX(-102%)}to{transform:translateX(0)}}",
      "@keyframes gaDoorR{from{transform:translateX(102%)}to{transform:translateX(0)}}",
      "@keyframes gaStamp{0%{transform:scale(2.6) rotate(-14deg);opacity:0}60%{transform:scale(.96) rotate(-4deg);opacity:1}100%{transform:scale(1) rotate(-4deg);opacity:1}}",
      "@keyframes gaBoltIn{from{transform:scale(.2);opacity:0}to{transform:scale(1);opacity:1}}",
      "@media(prefers-reduced-motion:reduce){#ctfGateArt *,#ctfCurtain *{animation:none!important}}"
    ].join("");
    document.head.appendChild(s);
  }

  /* ---- backdrops (pure markup; tickers wired in mount) ------------------- */
  function artAlert(t) {   // NEMESIS — alarm tripped
    var rings = [0, 1, 2].map(function (i) {
      return '<div style="position:absolute;left:50%;top:50%;width:340px;height:340px;margin:-170px 0 0 -170px;' +
        'border:1px solid ' + t.hue + '55;border-radius:50%;animation:gaRing 3.4s ' + (i * 1.13) + 's ease-out infinite;"></div>';
    }).join("");
    return rings +
      '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:190px;line-height:1;' +
        'color:' + t.hue + ';opacity:.13;animation:gaPulse 2.6s ease-in-out infinite;">&#128274;</div>' +
      '<div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,' + t.hue + '10 0 1px,transparent 1px 4px);"></div>' +
      '<div style="position:absolute;left:0;right:0;height:76px;background:linear-gradient(180deg,transparent,' + t.hue + '22,transparent);animation:gaSweep 4.2s linear infinite;"></div>';
  }
  function artStatic(t) {  // SPECTER — cold surveillance
    var bars = [0, 1, 2].map(function (i) {
      return '<div style="position:absolute;left:0;right:0;top:' + (22 + i * 26) + '%;height:' + (10 + i * 4) + 'px;' +
        'background:' + t.hue + '10;animation:gaBar ' + (7 + i * 3) + 's ' + (i * 1.7) + 's linear infinite;"></div>';
    }).join("");
    return '<div style="position:absolute;inset:-120px;opacity:.55;background-image:' +
        'repeating-linear-gradient(0deg,' + t.hue + '0d 0 2px,transparent 2px 5px),' +
        'repeating-linear-gradient(90deg,#ffffff08 0 1px,transparent 1px 7px);animation:gaDrift 9s linear infinite;"></div>' +
      bars +
      '<div class="mono" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:132px;' +
        'color:' + t.hue + ';opacity:.12;animation:gaFloat 6s ease-in-out infinite;">&#128065;</div>' +
      '<div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,transparent 32%,rgba(0,0,0,.55) 100%);"></div>';
  }
  function artTrace(t) {   // ADA — friendly compile error
    var code = [
      ['<span style="opacity:.5">1</span>', 'import <span style="color:' + t.hue + '">student</span> from <span style="opacity:.7">"./roster"</span>;'],
      ['<span style="opacity:.5">2</span>', ''],
      ['<span style="opacity:.5">3</span>', 'arena.<span style="color:' + t.hue + '">enter</span>(student);'],
      ['<span style="opacity:.5">4</span>', '        <span style="color:#ffb454">^^^^^^^</span>']
    ].map(function (r) {
      return '<div style="display:flex;gap:16px;"><span style="width:16px;text-align:right;">' + r[0] + '</span><span>' + r[1] + '</span></div>';
    }).join("");
    return '<div style="position:absolute;inset:0;background-image:linear-gradient(' + t.hue + '0c 1px,transparent 1px),' +
        'linear-gradient(90deg,' + t.hue + '0c 1px,transparent 1px);background-size:46px 46px;"></div>' +
      '<div class="mono" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);' +
        'font-size:15px;line-height:2;color:#cbd5e1;opacity:.34;white-space:nowrap;animation:gaFloat 7s ease-in-out infinite;">' +
        code +
        '<div style="margin-top:10px;color:#ffb454;">ReferenceError: student is not defined</div>' +
      '</div>';
  }
  function artBlock(t) {   // ORACLE — block pending confirmation
    return '<div style="position:absolute;inset:0;background-image:radial-gradient(' + t.hue + '18 1.4px,transparent 1.4px);background-size:34px 34px;opacity:.5;"></div>' +
      '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:250px;height:250px;' +
        'border:1px dashed ' + t.hue + '3a;border-radius:26px;animation:gaSpinSlow 26s linear infinite;"></div>' +
      '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;animation:gaFloat 6s ease-in-out infinite;">' +
        '<div style="font-size:86px;line-height:1;opacity:.5;">&#9930;</div>' +
        '<div id="gaHash" class="mono" style="margin-top:14px;font-size:13px;color:' + t.hue + ';opacity:.75;letter-spacing:1px;">0x000000000000</div>' +
        '<div class="mono" style="margin-top:8px;font-size:11px;color:#94a3b8;opacity:.7;letter-spacing:1.5px;">CONFIRMATIONS 0 / 6</div>' +
      '</div>';
  }
  var ART = { alert: artAlert, static: artStatic, trace: artTrace, block: artBlock };

  /* ---- public: backdrop --------------------------------------------------- */
  function backdrop(course) {
    injectCss();
    var t = theme(course);
    return '<div id="ctfGateArt" aria-hidden="true" style="position:absolute;inset:0;overflow:hidden;pointer-events:none;">' +
      '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 42%,' + t.glow + ',transparent 68%);"></div>' +
      (ART[t.art] || artAlert)(t) +
    '</div>';
  }

  /* hash scramble for the ORACLE backdrop */
  var hashTimer = null;
  function mount(course) {
    clearInterval(hashTimer);
    if (REDUCED) return;
    var node = document.getElementById("gaHash");
    if (!node) return;
    var hex = "0123456789abcdef";
    hashTimer = setInterval(function () {
      var n = document.getElementById("gaHash");
      if (!n) { clearInterval(hashTimer); return; }
      var s = "0x"; for (var i = 0; i < 12; i++) s += hex[Math.floor(Math.random() * 16)];
      n.textContent = s;
    }, 90);
  }
  function unmount() { clearInterval(hashTimer); hashTimer = null; }

  /* ---- public: status strip + typed guide line ---------------------------- */
  function statusStrip(course) {
    var t = theme(course);
    return '<div style="display:flex;align-items:center;gap:9px;margin-bottom:14px;">' +
      '<span style="width:8px;height:8px;border-radius:50%;background:' + t.hue + ';animation:gaPulse 1.4s ease-in-out infinite;"></span>' +
      '<span class="mono" style="font-size:11px;letter-spacing:2px;color:' + t.hue + ';font-weight:700;">' + t.status + '</span>' +
    '</div>';
  }
  function guideBox(course) {
    var t = theme(course);
    return '<div style="display:flex;gap:11px;padding:13px 14px;border-radius:11px;border:1px solid ' + t.hue + '33;' +
      'background:' + t.hue + '0d;margin-bottom:18px;">' +
      '<span style="font-size:17px;line-height:1.3;">' + (t.kind === "adversary" ? "\u25c9" : "\u25c6") + '</span>' +
      '<div style="min-width:0;">' +
        '<div class="mono" style="font-size:10px;letter-spacing:1.6px;color:' + t.hue + ';font-weight:700;margin-bottom:4px;">' + t.guide + '</div>' +
        '<div id="gaLine" style="font-size:13px;line-height:1.55;color:var(--text,#cfe0f3);min-height:40px;">' +
          '<span id="gaLineText"></span><span id="gaCaret" class="mono" style="animation:gaBlink 1s step-end infinite;">\u2588</span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }
  /* escalating line: adversaries get sharper, mentors get gentler */
  function typeLine(course, attempt, overrideText) {
    var t = theme(course);
    var txt = overrideText || t.lines[Math.min(attempt || 0, t.lines.length - 1)];
    var out = document.getElementById("gaLineText"), caret = document.getElementById("gaCaret");
    if (!out) return;
    if (REDUCED) { out.textContent = txt; if (caret) caret.style.display = "none"; return; }
    out.textContent = ""; var i = 0;
    (function step() {
      if (!document.getElementById("gaLineText")) return;
      out.textContent = txt.slice(0, ++i);
      if (i < txt.length) setTimeout(step, 18);
    })();
  }
  function buttonLabel(course) { return theme(course).btn; }
  function wrongDomainLine(course) { return theme(course).wrongDomain; }

  /* ---- full-screen curtain used by granted + lockdown --------------------- */
  function curtain(bg) {
    var c = document.createElement("div");
    c.id = "ctfCurtain";
    c.style.cssText = "position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;" +
      "background:" + (bg || "#05070b") + ";animation:gaFadeIn .18s ease;overflow:hidden;";
    document.body.appendChild(c);
    return c;
  }

  /* success beat: short, then hand control back */
  function granted(course, done) {
    injectCss();
    var t = theme(course);
    if (REDUCED) { if (done) done(); return; }
    var c = curtain("rgba(4,7,11,.94)");
    c.innerHTML =
      '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,' + t.ok + '1f,transparent 66%);"></div>' +
      '<div style="position:absolute;left:0;right:0;height:120px;background:linear-gradient(180deg,transparent,' + t.ok + '1c,transparent);animation:gaSweep 1.1s linear;"></div>' +
      '<div style="text-align:center;animation:gaPop .42s cubic-bezier(.2,.9,.3,1.4);">' +
        '<div style="font-size:64px;line-height:1;color:' + t.ok + ';">' + (t.kind === "adversary" ? "\u26bf" : "\u2713") + '</div>' +
        '<div class="mono" style="margin-top:14px;font-size:clamp(20px,4.4vw,34px);font-weight:800;letter-spacing:3px;color:' + t.ok + ';">' + t.grantedTitle + '</div>' +
        '<div style="margin-top:10px;font-size:13px;color:#9fb0c0;">' + t.grantedSub + '</div>' +
        '<div class="mono" style="margin-top:6px;font-size:10px;letter-spacing:2px;color:' + t.hue + ';opacity:.8;">\u2014 ' + t.guide + '</div>' +
      '</div>';
    setTimeout(function () { c.style.transition = "opacity .3s ease"; c.style.opacity = "0"; }, 1150);
    setTimeout(function () { c.remove(); if (done) done(); }, 1470);
  }

  /* sign-out beat: blast doors (cyber) / brackets (csp) / vault (web3) */
  function lockdown(course, done) {
    injectCss();
    var t = theme(course);
    if (REDUCED) { if (done) done(); return; }
    var c = curtain("transparent");
    var doorBg = "linear-gradient(90deg,#0d1119,#161d29 60%,#0d1119)";
    var seam = t.hue;

    var doors =
      '<div style="position:absolute;inset:0 50% 0 0;background:' + doorBg + ';border-right:2px solid ' + seam + '66;' +
        'box-shadow:inset -26px 0 46px -30px #000;animation:gaDoorL .62s cubic-bezier(.6,.05,.2,1) both;">' +
        '<div style="position:absolute;right:16px;top:50%;transform:translateY(-50%);width:5px;height:44%;border-radius:4px;background:' + seam + '2e;"></div></div>' +
      '<div style="position:absolute;inset:0 0 0 50%;background:' + doorBg + ';border-left:2px solid ' + seam + '66;' +
        'box-shadow:inset 26px 0 46px -30px #000;animation:gaDoorR .62s cubic-bezier(.6,.05,.2,1) both;">' +
        '<div style="position:absolute;left:16px;top:50%;transform:translateY(-50%);width:5px;height:44%;border-radius:4px;background:' + seam + '2e;"></div></div>';

    var sealGlyph = t.art === "trace" ? "{ }" : t.art === "block" ? "\u26bf" : "\u128274";
    var seal =
      '<div style="position:relative;text-align:center;opacity:0;animation:gaStamp .5s .5s cubic-bezier(.2,.9,.3,1.4) both;">' +
        '<div style="font-size:58px;line-height:1;color:' + seam + ';' + (t.art === "trace" ? "font-family:\u0027JetBrains Mono\u0027,monospace;font-weight:800;" : "") + '">' +
          (t.art === "trace" ? "{ }" : t.art === "block" ? "\u26bf" : "\uD83D\uDD12") + '</div>' +
        '<div class="mono" style="margin-top:16px;font-size:clamp(18px,4vw,30px);font-weight:800;letter-spacing:4px;color:#f0f5fb;">' + t.lockTitle + '</div>' +
        '<div style="margin-top:10px;font-size:13px;color:#8fa0b2;">' + t.lockSub + '</div>' +
        '<div class="mono" style="margin-top:6px;font-size:10px;letter-spacing:2px;color:' + seam + ';opacity:.85;">\u2014 ' + t.guide + '</div>' +
        '<div style="display:flex;gap:7px;justify-content:center;margin-top:20px;">' +
          [0, 1, 2, 3].map(function (i) {
            return '<span style="width:9px;height:9px;border-radius:2px;background:' + seam + ';opacity:0;animation:gaBoltIn .2s ' + (0.72 + i * 0.09) + 's ease both;"></span>';
          }).join("") +
        '</div>' +
      '</div>';

    c.innerHTML = doors + seal;
    setTimeout(function () { if (done) done(); }, 1850);
  }

  window.CTF_GATE_ART = {
    theme: theme, backdrop: backdrop, mount: mount, unmount: unmount,
    statusStrip: statusStrip, guideBox: guideBox, typeLine: typeLine,
    buttonLabel: buttonLabel, wrongDomainLine: wrongDomainLine,
    granted: granted, lockdown: lockdown
  };
})();
