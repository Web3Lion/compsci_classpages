// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* ============================================================================
   site.js  —  site-wide boot, loaded in <head> on every page.

   1. SITE_VERSION — the release number (see CHANGELOG.md). Bump it, plus the
      ?v= cache tag on script links, with every release.
   2. Accessibility preferences, shared site-wide like the theme toggle:
        localStorage['course-motion']   'reduce' | 'full'   (default: follow the OS)
        localStorage['course-contrast'] 'high'   | 'normal'
      Applied as data-motion / data-contrast on <html> before first paint.
   3. An "A11Y" button beside the theme toggle to change them, a skip link,
      visible keyboard focus, and names for icon-only controls.
   ========================================================================== */
(function () {
  var VERSION = "4.1.0";
  window.SITE_VERSION = VERSION;
  var r = document.documentElement;
  function osReduce() { try { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } }
  function pref(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function apply() {
    var m = pref("course-motion"), c = pref("course-contrast");
    r.setAttribute("data-motion", m === "reduce" || (m !== "full" && osReduce()) ? "reduce" : "full");
    r.setAttribute("data-contrast", c === "high" ? "high" : "normal");
  }
  apply();
  window.SITE_REDUCED_MOTION = function () { return r.getAttribute("data-motion") === "reduce"; };

  var css =
    ":focus-visible{outline:3px solid var(--amber,#ffcf5c) !important;outline-offset:2px !important;}" +
    ".siteSkip{position:fixed;left:12px;top:-60px;z-index:100001;padding:10px 16px;border-radius:10px;background:var(--accent,#00b3ff);color:var(--bg,#0a0e14) !important;font:700 13px 'JetBrains Mono',monospace;text-decoration:none;transition:top .15s;}" +
    ".siteSkip:focus{top:12px;}" +
    ".srOnly{position:absolute !important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}" +
    "html[data-motion='reduce'] *,html[data-motion='reduce'] *::before,html[data-motion='reduce'] *::after{animation-duration:.001ms !important;animation-iteration-count:1 !important;transition-duration:.001ms !important;scroll-behavior:auto !important;}" +
    "html[data-motion='reduce'] .confetti,html[data-motion='reduce'] #confettiWrap,html[data-motion='reduce'] #bgfx,html[data-motion='reduce'] #spotlight{display:none !important;}" +
    "html[data-contrast='high']{--faint:#a9bfd6 !important;--dim:#c3d3e4 !important;--muted:#dbe7f3 !important;--border:#4d6f94 !important;--border2:#3f5f82 !important;--border3:#6f93ba !important;}" +
    "html[data-contrast='high'][data-theme='light']{--faint:#3c4b5e !important;--dim:#2e3b4b !important;--muted:#1f2935 !important;--border:#8196ad !important;--border2:#93a6bb !important;--border3:#6d839c !important;}" +
    "html[data-contrast='high'] a{text-decoration:underline;}" +
    "#siteA11yBtn{position:fixed;top:14px;z-index:10000;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:1px;padding:8px 12px;border-radius:999px;border:1px solid var(--border3,#244a6d);background:var(--panel,#0b1220);color:var(--accent,#00b3ff);cursor:pointer;}" +
    "#siteA11yPop{position:fixed;top:54px;z-index:10001;width:260px;padding:14px;border-radius:12px;border:1px solid var(--border3,#244a6d);background:var(--panel,#0b1220);box-shadow:0 18px 40px -16px rgba(0,0,0,.6);display:none;font-family:'Inter',sans-serif;}" +
    "#siteA11yPop.open{display:block;}" +
    "#siteA11yPop label{display:flex;align-items:center;gap:10px;min-height:44px;font-size:14px;color:var(--bright,#eaf4ff);cursor:pointer;}" +
    "#siteA11yPop input{width:20px;height:20px;accent-color:var(--accent,#00b3ff);}" +
    "#siteA11yPop .v{font:11px 'JetBrains Mono',monospace;color:var(--faint,#6a84a0);margin-top:8px;}" +
    "@media print{#siteA11yBtn,#siteA11yPop,.siteSkip{display:none !important;}}";
  var st = document.createElement("style"); st.id = "siteCss"; st.textContent = css;
  (document.head || r).appendChild(st);

  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} apply(); }
  function mainTarget() {
    return document.querySelector("main,#main,[role=main],#ctfRoot,#profileRoot,#app,.wrap,#board") || document.body.firstElementChild;
  }
  function nameIconButtons(root) {
    (root || document).querySelectorAll("button:not([aria-label]),a:not([aria-label])").forEach(function (b) {
      var t = (b.textContent || "").trim();
      if (t && /[A-Za-z0-9]{2,}/.test(t)) return;
      var name = b.getAttribute("title"); if (name) b.setAttribute("aria-label", name);
    });
    (root || document).querySelectorAll("img:not([alt])").forEach(function (i) { i.setAttribute("alt", ""); });
    (root || document).querySelectorAll("[onclick]:not(button):not(a):not(input):not(select):not(label):not(textarea):not([tabindex])").forEach(function (e) {
      if (e === document.body) return;
      e.setAttribute("tabindex", "0"); if (!e.getAttribute("role")) e.setAttribute("role", "button");
      e.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); e.click(); } });
    });
    var reset = document.getElementById("ctfReset");
    if (reset && !reset.hasAttribute("tabindex")) {
      reset.setAttribute("tabindex", "0"); reset.setAttribute("role", "button");
      reset.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); reset.click(); } });
    }
    ["itemToasts", "nemToasts", "toastHost", "ticker"].forEach(function (id) {
      var h = document.getElementById(id); if (h && !h.hasAttribute("aria-live")) { h.setAttribute("role", "status"); h.setAttribute("aria-live", "polite"); }
    });
  }
  function ui() {
    var tgt = mainTarget();
    if (tgt && !document.querySelector(".siteSkip")) {
      if (!tgt.id) tgt.id = "siteMain";
      if (!tgt.hasAttribute("tabindex")) tgt.setAttribute("tabindex", "-1");
      var sk = document.createElement("a"); sk.className = "siteSkip"; sk.href = "#" + tgt.id; sk.textContent = "Skip to content";
      document.body.insertBefore(sk, document.body.firstChild);
    }
    var theme = document.getElementById("themeToggle");
    if (theme) {
      var upd = function () { theme.setAttribute("aria-label", r.getAttribute("data-theme") === "light" ? "Switch to dark theme" : "Switch to light theme"); };
      upd(); theme.addEventListener("click", function () { setTimeout(upd, 0); });
    }
    if (!document.getElementById("siteA11yBtn") && !r.hasAttribute("data-no-a11y-btn")) {
      var b = document.createElement("button");
      b.id = "siteA11yBtn"; b.type = "button"; b.textContent = "A11Y";
      b.setAttribute("aria-label", "Accessibility settings"); b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-controls", "siteA11yPop");
      var pop = document.createElement("div"); pop.id = "siteA11yPop"; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", "Accessibility settings");
      pop.innerHTML =
        '<label><input type="checkbox" id="siteMotion"> Reduce motion</label>' +
        '<label><input type="checkbox" id="siteContrast"> High contrast text</label>' +
        '<div class="v">Saved on this device for every course page \u00b7 v' + VERSION + '</div>';
      document.body.appendChild(b); document.body.appendChild(pop);
      /* Lay every fixed top-right control out right-to-left with a gap:
         theme toggle first, then any other .themebtn (e.g. BOARD), then A11Y.
         offsetParent is always null for position:fixed, so test rects instead. */
      var place = function () {
        var shown = function (e) { return e && e.getClientRects().length && getComputedStyle(e).display !== "none" && getComputedStyle(e).visibility !== "hidden"; };
        var row = [].slice.call(document.querySelectorAll("#themeToggle, .themebtn")).filter(function (e, i, a) {
          if (e === b || a.indexOf(e) !== i || !shown(e)) return false;
          var cs = getComputedStyle(e);
          return cs.position === "fixed" && e.getBoundingClientRect().top < 60 && cs.right !== "auto";
        });
        row.sort(function (x, y) { return (x === theme ? -1 : 0) - (y === theme ? -1 : 0) || (y.getBoundingClientRect().right - x.getBoundingClientRect().right); });
        var right = 14, GAP = 8;
        row.forEach(function (e) { e.style.right = right + "px"; right += Math.ceil(e.getBoundingClientRect().width) + GAP; });
        b.style.right = right + "px"; pop.style.right = "14px";
      };
      place(); window.addEventListener("resize", place); window.addEventListener("load", place); setTimeout(place, 400); setTimeout(place, 1500);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
      if (window.ResizeObserver) { var ro = new ResizeObserver(function () { place(); }); [].slice.call(document.querySelectorAll("#themeToggle, .themebtn")).forEach(function (e) { if (e !== b) ro.observe(e); }); }
      if (theme) theme.addEventListener("click", function () { setTimeout(place, 0); });
      var mo = pop.querySelector("#siteMotion"), co = pop.querySelector("#siteContrast");
      var sync = function () { mo.checked = r.getAttribute("data-motion") === "reduce"; co.checked = r.getAttribute("data-contrast") === "high"; };
      sync();
      mo.onchange = function () { set("course-motion", mo.checked ? "reduce" : "full"); };
      co.onchange = function () { set("course-contrast", co.checked ? "high" : "normal"); };
      b.onclick = function () { var open = !pop.classList.contains("open"); pop.classList.toggle("open", open); b.setAttribute("aria-expanded", String(open)); if (open) { sync(); mo.focus(); } };
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && pop.classList.contains("open")) { pop.classList.remove("open"); b.setAttribute("aria-expanded", "false"); b.focus(); } });
      document.addEventListener("click", function (e) { if (pop.classList.contains("open") && !pop.contains(e.target) && e.target !== b) { pop.classList.remove("open"); b.setAttribute("aria-expanded", "false"); } });
    }
    // version on the licence footer
    var cc = document.querySelector('a[href*="creativecommons.org/licenses/by-nc"]');
    if (cc && cc.parentNode && !document.getElementById("siteVer")) {
      var v = document.createElement("span"); v.id = "siteVer"; v.className = "mono";
      v.style.cssText = "font-size:11px;opacity:.7;"; v.textContent = "v" + VERSION;
      cc.parentNode.appendChild(v);
    }
    nameIconButtons();
    var t = null;
    new MutationObserver(function () { clearTimeout(t); t = setTimeout(function () { nameIconButtons(); }, 150); })
      .observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ui); else ui();
  try { matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", apply); } catch (e) {}
})();
