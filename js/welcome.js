// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* ============================================================================
   welcome.js  —  first-day walkthrough for the arena.

   Day one is the worst moment in the whole platform: 25 students, one teacher,
   and everyone needs the same four things explained at once. This runs itself.

   It appears ONCE per course per device, after sign-in, and covers only what a
   student can't figure out by looking: where XP comes from, that hints cost
   real points, that locked flags are readable if you can break the cipher, and
   that the daily streak is Mon-Fri. Then it gets out of the way.

   Deliberately NOT in character: the guide's arrival is its own moment, and
   stacking a tutorial on top of it would bury both. If the guide is awake the
   walkthrough waits for the arrival to finish first.

   Re-openable any time from the "How to play" link on the stats card.
   ========================================================================== */
(function () {
  var course = window.CTF_COURSE || "cyber1";
  var KEY = "ctf-welcome-" + course;

  function seen() { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; } }
  function markSeen() { try { localStorage.setItem(KEY, "1"); } catch (e) {} }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function cfg() {
    var all = window.COURSE_CONFIG || {};
    return ((all[course] || {}).ctf) || {};
  }
  function nameFor() {
    var N = window.CTF_NAME;
    return N && N.terms ? N.terms(course).term : "Handle";
  }

  /* ---- the steps --------------------------------------------------------- */
  function steps() {
    var c = cfg();
    var guide = c.adversary || "your course guide";
    var mentor = !!c.mentor;
    var term = nameFor();
    return [
      {
        icon: "\u25c8",
        title: "Welcome to the arena",
        body: "Every challenge here is a <b>flag</b> \u2014 a question with an answer you submit. " +
              "Capture flags to earn <b>XP</b>, climb the ranks, and unlock badges. " +
              "Work through it at your own pace; nothing here expires.",
        tip: "Flags are grouped by module. Click a module to open it."
      },
      {
        icon: "\u25c9",
        title: "Three difficulties, three payouts",
        body: "Most flags have <b>Easy (50 XP)</b>, <b>Medium (100 XP)</b>, and <b>Hard (150 XP)</b> versions of the same idea. " +
              "Start wherever you're comfortable \u2014 you can capture all three, and each one pays separately.",
        tip: "Stuck on Hard? Take the Easy one first. It often gives away the concept."
      },
      {
        icon: "\u25b3",
        title: "Hints cost XP \u2014 looking things up doesn't",
        body: "Every flag has a hint, but revealing it costs <b>25% of that flag's XP</b>. You'll always see the price before you commit. " +
              "<b>Searching the web, your notes, or the vocab page is completely free</b> and always allowed \u2014 that's real security work.",
        tip: "Try the vocab games first. They pay XP too, and they cover the same terms."
      },
      {
        icon: "\u26bf",
        title: "Locked flags are a head start",
        body: "Flags your teacher hasn't opened yet still show their <b>title</b>, but the question is <b>encrypted</b> \u2014 " +
              "a different cipher each time. Cracking one early is completely legitimate. " +
              "You just can't submit it until the flag unlocks.",
        tip: "No two locked flags use the same method. Figuring out which cipher it is <i>is</i> the puzzle."
      },
      {
        icon: "\u25f7",
        title: "Show up and get paid",
        body: "Log in on a <b>school day</b> and you earn a streak bonus: +5 XP the first day, growing to <b>+50 by day 10</b>. " +
              "Weekends and no-class days are skipped \u2014 they never break your streak.",
        tip: "Miss a school day and the streak restarts at day 1."
      },
      {
        icon: mentor ? "\u25c6" : "\u25c9",
        title: mentor ? "You're not alone" : "You're being watched",
        body: mentor
          ? "<b>" + esc(guide) + "</b> is your guide for this course. Expect nudges, encouragement, and a final challenge in every module."
          : "<b>" + esc(guide) + "</b> runs this system, and it is not on your side. Expect interference, taunts, and a boss fight in every module. " +
            "Beating it is the whole point.",
        tip: "Your " + esc(term.toLowerCase()) + " is what appears on the leaderboard \u2014 never your real name."
      }
    ];
  }

  /* ---- ui ---------------------------------------------------------------- */
  var idx = 0, node = null;

  function css() {
    if (document.getElementById("wlcCss")) return;
    var st = document.createElement("style"); st.id = "wlcCss";
    st.textContent = [
      "@keyframes wlcIn{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}",
      "@keyframes wlcFade{from{opacity:0}to{opacity:1}}",
      "#wlcOverlay{animation:wlcFade .25s ease}",
      "#wlcCard{animation:wlcIn .32s cubic-bezier(.2,.9,.3,1.2)}",
      "#wlcBody{animation:wlcFade .22s ease}",
      "@media(prefers-reduced-motion:reduce){#wlcOverlay *,#wlcOverlay{animation:none!important}}",
      "@media(max-width:600px){#wlcCard{padding:22px 18px!important}#wlcIcon{font-size:34px!important}}"
    ].join("");
    document.head.appendChild(st);
  }

  function paint() {
    var all = steps(), s = all[idx];
    var dots = all.map(function (_, i) {
      return '<span style="width:' + (i === idx ? "18px" : "6px") + ';height:6px;border-radius:99px;background:' +
        (i === idx ? "var(--accent)" : i < idx ? "var(--border3)" : "var(--border2)") + ';transition:.2s;"></span>';
    }).join("");
    var body = document.getElementById("wlcBody");
    if (!body) return;
    body.innerHTML =
      '<div id="wlcIcon" style="font-size:40px;line-height:1;color:var(--accent);margin-bottom:14px;">' + s.icon + '</div>' +
      '<div style="font-size:21px;font-weight:800;color:var(--bright);margin-bottom:10px;letter-spacing:-.2px;">' + esc(s.title) + '</div>' +
      '<div style="font-size:14.5px;line-height:1.7;color:var(--text);">' + s.body + '</div>' +
      (s.tip ? '<div class="mono" style="margin-top:16px;padding:11px 13px;border-radius:10px;background:var(--bg);' +
        'border:1px solid var(--border2);border-left:2px solid var(--accent);font-size:12px;line-height:1.6;color:var(--dim);">' +
        s.tip + '</div>' : "");
    document.getElementById("wlcDots").innerHTML = dots;
    document.getElementById("wlcBack").style.visibility = idx === 0 ? "hidden" : "visible";
    document.getElementById("wlcNext").textContent = idx === all.length - 1 ? "START PLAYING" : "NEXT";
    document.getElementById("wlcStep").textContent = (idx + 1) + " / " + all.length;
  }

  function close() {
    markSeen();
    if (!node) return;
    node.style.transition = "opacity .25s ease";
    node.style.opacity = "0";
    setTimeout(function () { if (node) { node.remove(); node = null; } }, 260);
  }

  function open(startAt) {
    if (document.getElementById("wlcOverlay")) return;
    css();
    idx = startAt || 0;
    node = document.createElement("div");
    node.id = "wlcOverlay";
    node.style.cssText = "position:fixed;inset:0;z-index:11000;background:rgba(4,7,12,.86);backdrop-filter:blur(6px);" +
      "display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto;";
    node.innerHTML =
      '<div id="wlcCard" style="width:min(520px,96vw);background:var(--panel);border:1px solid var(--border);' +
        'border-radius:16px;padding:28px;box-shadow:0 30px 80px -30px #000;">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;">' +
          '<span class="mono" style="font-size:10px;letter-spacing:2px;color:var(--faint);">HOW TO PLAY</span>' +
          '<span id="wlcStep" class="mono" style="margin-left:auto;font-size:10px;color:var(--faint);"></span>' +
          '<button id="wlcSkip" class="mono" style="font-size:10px;letter-spacing:1px;background:none;border:1px solid var(--border2);' +
            'color:var(--faint);padding:5px 10px;border-radius:7px;cursor:pointer;">SKIP</button>' +
        '</div>' +
        '<div id="wlcBody" style="min-height:210px;"></div>' +
        '<div style="display:flex;align-items:center;gap:12px;margin-top:22px;">' +
          '<div id="wlcDots" style="display:flex;gap:5px;align-items:center;"></div>' +
          '<div style="margin-left:auto;display:flex;gap:8px;">' +
            '<button id="wlcBack" class="mono" style="font-size:12px;padding:11px 16px;border-radius:9px;border:1px solid var(--border3);' +
              'background:none;color:var(--dim);cursor:pointer;min-height:44px;">BACK</button>' +
            '<button id="wlcNext" class="mono" style="font-size:12px;font-weight:800;letter-spacing:.5px;padding:11px 20px;border-radius:9px;' +
              'border:none;background:var(--accent);color:#04121e;cursor:pointer;min-height:44px;">NEXT</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(node);

    document.getElementById("wlcSkip").onclick = close;
    document.getElementById("wlcBack").onclick = function () { if (idx > 0) { idx--; paint(); } };
    document.getElementById("wlcNext").onclick = function () {
      if (idx < steps().length - 1) { idx++; paint(); } else close();
    };
    node.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") document.getElementById("wlcNext").click();
      if (e.key === "ArrowLeft") document.getElementById("wlcBack").click();
    });
    paint();
    setTimeout(function () { var n = document.getElementById("wlcNext"); if (n) n.focus(); }, 60);
  }

  /* ---- entry points ------------------------------------------------------ */
  window.CTF_WELCOME = { open: function () { open(0); }, seen: seen };

  function maybeAutoOpen() {
    if (seen()) return;
    // never collide with the guide's arrival — that scene owns the screen
    if (document.getElementById("nemArrive")) { setTimeout(maybeAutoOpen, 900); return; }
    // never collide with the sign-in gate either
    if (document.getElementById("ctfGate")) { setTimeout(maybeAutoOpen, 900); return; }
    open(0);
  }

  function boot() { setTimeout(maybeAutoOpen, 700); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
