// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* ============================================================
   CYBER COMPETITIONS — single source of truth for competitions.html
   and the COMPETITIONS card on cyber1/index.html + cyber2/index.html.

   Each competition has events. Each event is either:
     a window   { name, start:"YYYY-MM-DDTHH:MM", end:"YYYY-MM-DDTHH:MM" }
                → counts down to start, then shows LIVE + countdown to end
     a deadline { name, end:"YYYY-MM-DDTHH:MM", deadline:true }
                → counts down to end ("CLOSES IN")
     TBA        { name, tba:"Usually March" }  → no timer
   Times are local (Eastern). Past events drop off the home cards
   automatically and move to "Completed" on the page.
   Set featured:false on an event to keep it off the home cards.
   ============================================================ */
window.COMPETITIONS = [
  {
    id: "ncl",
    name: "National Cyber League",
    short: "NCL",
    season: "Fall 2026",
    courses: ["cyber1", "cyber2"],
    format: "Jeopardy-style CTF · individual + team",
    blurb: "Solve real-world challenges across OSINT, cryptography, password cracking, log analysis, network traffic, forensics, scanning and web exploitation. Every player earns a Scouting Report that shows their skills to colleges and employers.",
    facts: [
      ["Who", "High school and college students"],
      ["Team size", "Up to 7 (or a team of 1)"],
      ["Cost", "$45 regular · $55 late (Oct 10–13)"],
      ["Where", "Online, Cyber Skyline"]
    ],
    links: [
      { name: "Register on Cyber Skyline", url: "https://cyberskyline.com/events/ncl" },
      { name: "NCL competition overview", url: "https://nationalcyberleague.org/competition" }
    ],
    events: [
      { name: "NCL Gymnasium (practice)", start: "2026-08-17T00:00", end: "2026-12-11T23:59", featured: false },
      { name: "NCL regular registration", end: "2026-10-09T23:59", deadline: true },
      { name: "NCL late registration", end: "2026-10-13T23:59", deadline: true, featured: false },
      { name: "NCL Practice Game", start: "2026-10-12T00:00", end: "2026-10-18T23:59" },
      { name: "NCL Individual Game", start: "2026-10-23T00:00", end: "2026-10-25T23:59" },
      { name: "NCL Team Game", start: "2026-11-06T00:00", end: "2026-11-08T23:59" }
    ]
  },
  {
    id: "pico",
    name: "picoCTF",
    short: "picoCTF",
    season: "2027",
    courses: ["cyber1", "cyber2"],
    format: "Jeopardy-style CTF · solo or team",
    blurb: "Carnegie Mellon's free capture-the-flag competition for middle school, high school and college students. Challenges cover general skills, cryptography, web exploitation, forensics, reverse engineering and binary exploitation. The picoGym practice library is open year-round.",
    facts: [
      ["Who", "Ages 13+, middle school through college"],
      ["Team size", "Up to 5"],
      ["Cost", "Free"],
      ["Where", "Online, picoctf.org"]
    ],
    links: [
      { name: "picoCTF / picoGym", url: "https://picoctf.org/" }
    ],
    events: [
      { name: "picoCTF 2027 competition", tba: "Dates not announced · usually March" }
    ]
  }
];

window.CompClock = (function () {
  function d(s) { return s ? new Date(s) : null; }
  function state(ev, now) {
    now = now || Date.now();
    if (ev.tba) return { kind: "tba" };
    var s = d(ev.start), e = d(ev.end);
    if (e && now > e.getTime()) return { kind: "ended" };
    if (ev.deadline) return { kind: "deadline", target: e.getTime() };
    if (s && now < s.getTime()) return { kind: "upcoming", target: s.getTime() };
    return { kind: "live", target: e.getTime() };
  }
  function fmt(ms) {
    var t = Math.max(0, Math.floor(ms / 1000)), dd = Math.floor(t / 86400), h = Math.floor(t % 86400 / 3600),
        m = Math.floor(t % 3600 / 60), s = t % 60, p = function (n) { return (n < 10 ? "0" : "") + n; };
    return dd > 0 ? dd + "d " + p(h) + "h " + p(m) + "m " + p(s) + "s" : p(h) + "h " + p(m) + "m " + p(s) + "s";
  }
  function range(ev) {
    var o = { month: "short", day: "numeric" };
    if (ev.tba) return ev.tba;
    if (ev.deadline) return "Closes " + d(ev.end).toLocaleDateString("en-US", o);
    var a = d(ev.start).toLocaleDateString("en-US", o), b = d(ev.end).toLocaleDateString("en-US", o);
    return a === b ? a : a + " – " + b;
  }
  function label(st) {
    return st.kind === "live" ? "LIVE · ENDS IN" : st.kind === "deadline" ? "CLOSES IN" : st.kind === "upcoming" ? "STARTS IN" : st.kind === "tba" ? "TBA" : "ENDED";
  }
  /* All dated, non-ended events for a course, live first then soonest. */
  function upcoming(course, opts) {
    opts = opts || {};
    var out = [], now = Date.now();
    (window.COMPETITIONS || []).forEach(function (c) {
      if (course && c.courses.indexOf(course) < 0) return;
      c.events.forEach(function (ev) {
        if (opts.featuredOnly && ev.featured === false) return;
        var st = state(ev, now);
        if (st.kind === "ended" || st.kind === "tba") return;
        out.push({ comp: c, ev: ev, st: st });
      });
    });
    out.sort(function (a, b) {
      var la = a.st.kind === "live" ? 0 : 1, lb = b.st.kind === "live" ? 0 : 1;
      return la - lb || a.st.target - b.st.target;
    });
    return out;
  }
  /* Ticks every [data-cc-ev] element: re-reads state so UPCOMING flips to LIVE on its own. */
  function bindTicker(root, onFlip) {
    function tick() {
      var now = Date.now(), flipped = false;
      root.querySelectorAll("[data-cc-ev]").forEach(function (el) {
        var ev = el.__ev; if (!ev) return;
        var st = state(ev, now);
        if (el.getAttribute("data-kind") !== st.kind) { flipped = true; }
        var t = el.querySelector("[data-cc-t]"), l = el.querySelector("[data-cc-l]");
        if (t) t.textContent = st.target ? fmt(st.target - now) : (st.kind === "ended" ? "Done" : "—");
        if (l) l.textContent = label(st);
      });
      if (flipped && onFlip) onFlip();
    }
    tick();
    return setInterval(tick, 1000);
  }
  return { state: state, fmt: fmt, range: range, label: label, upcoming: upcoming, bindTicker: bindTicker };
})();

/* Home-page card. Call renderCompCard(el, "cyber1"). Hides itself when nothing is upcoming. */
window.renderCompCard = function (el, course) {
  if (!el) return;
  var timer = null;
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function draw() {
    if (timer) clearInterval(timer);
    var list = CompClock.upcoming(course, { featuredOnly: true }).slice(0, 4);
    if (!list.length) { el.style.display = "none"; return; }
    el.style.display = "";
    var rows = list.map(function (x, i) {
      var live = x.st.kind === "live";
      return '<div data-cc-ev="' + i + '" data-kind="' + x.st.kind + '" style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 12px;align-items:center;padding:12px 14px;border-radius:10px;background:var(--bg);border:1px solid ' + (live ? "var(--accent)" : "var(--border2)") + ';">'
        + '<span style="font-size:14px;font-weight:600;color:var(--bright);min-width:0;">' + esc(x.ev.name) + '</span>'
        + '<span class="mono" data-cc-l style="font-size:10px;letter-spacing:1px;text-align:right;color:' + (live ? "var(--accent)" : "var(--faint)") + ';font-weight:' + (live ? 800 : 500) + ';"></span>'
        + '<span class="mono" style="font-size:11px;color:var(--dim);">' + esc(CompClock.range(x.ev)) + '</span>'
        + '<span class="mono" data-cc-t style="font-size:15px;font-weight:800;text-align:right;color:var(--bright);font-variant-numeric:tabular-nums;white-space:nowrap;"></span>'
        + '</div>';
    }).join("");
    el.innerHTML = '<div class="mono" style="font-size:12px;letter-spacing:1.5px;color:var(--accent);margin-bottom:14px;">// COMPETITIONS</div>'
      + '<div style="display:flex;flex-direction:column;gap:8px;">' + rows + '</div>'
      + '<a class="qlink mono" href="../competitions.html?from=' + course + '" style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:12px;padding:12px 14px;border:1px solid var(--border3);border-radius:9px;background:var(--panel2);color:var(--accent);font-size:13px;font-weight:700;">All competitions &amp; how to join &rarr;</a>';
    el.querySelectorAll("[data-cc-ev]").forEach(function (r) { r.__ev = list[+r.getAttribute("data-cc-ev")].ev; });
    timer = CompClock.bindTicker(el, draw);
  }
  draw();
};
