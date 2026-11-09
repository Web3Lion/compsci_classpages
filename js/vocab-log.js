// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* ============================================================================
   vocab-log.js  —  time-on-task recorder for the Vocabulary Lab.

   Every practice mode is logged: FLASHCARDS, DECRYPT, HANDSHAKE, QUIZ, and
   CASCADE. Flashcards earn no XP but are still real study time, so they are
   recorded exactly like the scored games.

   What counts as time:
     * The clock only runs while the tab is VISIBLE and the student has
       touched something in the last IDLE_SECS. Leaving a vocab tab open over
       lunch does not become an hour of studying.
     * Switching modes closes the open session and opens a new one, so per-game
       totals stay honest.

   Where it goes: the same localStorage blob the CTF engine owns
   (`ctf-<course>`), under state.vocabLog. sync.js already pushes that whole
   blob to Supabase on the student's next arena visit, so no sign-in is needed
   on the vocab page itself and nothing is lost offline.

   Shape:
     vocabLog = {
       totals:   { quiz: 420, cards: 130, ... }     seconds, per game
       sessions: { quiz: 6, ... }                   times opened
       done:     { quiz: 4, ... }                   times completed
       best:     { quiz: 0.92, ... }                best accuracy seen
       last:     { quiz: "2026-07-26", ... }        last day practiced
       recent:   [ {g,d,acc,n,xp,m,ts}, ... ]       last RECENT_MAX finishes
       pending:  [ ... ]                            finishes not yet uploaded
       updated:  epoch ms
     }
   ========================================================================== */
(function () {
  var IDLE_SECS = 90;          // no input for this long and the clock pauses
  var FLUSH_SECS = 5;          // how often the running total is written down
  var RECENT_MAX = 40;         // completed sessions kept for the teacher view
  var PENDING_MAX = 60;        // unsent sessions held for the next arena visit
  var LABELS = {
    cards: "FLASHCARDS", decrypt: "DECRYPT", match: "HANDSHAKE",
    quiz: "QUIZ", cascade: "CASCADE"
  };

  var course = window.CTF_COURSE || "cyber1";
  var KEY = "ctf-" + course;

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function blank() { return { totals: {}, sessions: {}, done: {}, best: {}, last: {}, recent: [], pending: [], updated: 0 }; }
  function log() {
    var s = load(), v = s.vocabLog || {};
    var b = blank();
    b.totals = v.totals || {}; b.sessions = v.sessions || {}; b.done = v.done || {};
    b.best = v.best || {}; b.last = v.last || {}; b.recent = v.recent || [];
    b.pending = v.pending || []; b.updated = v.updated || 0;
    return b;
  }
  function write(v) { var s = load(); v.updated = Date.now(); s.vocabLog = v; save(s); }
  function today() { return new Date().toISOString().slice(0, 10); }

  /* ---- the running clock ------------------------------------------------- */
  var cur = null;          // game currently open
  var carry = 0;           // whole seconds counted but not yet written down
  var sessSecs = 0;        // active seconds inside the CURRENT session only
  var lastTick = 0;        // ms at the previous tick
  var lastAct = Date.now();
  var ticker = null;

  function active() {
    return !document.hidden && (Date.now() - lastAct) / 1000 < IDLE_SECS;
  }
  function flush() {
    if (!cur || carry < 1) return;
    var v = log(), n = Math.floor(carry);
    v.totals[cur] = (v.totals[cur] || 0) + n;
    v.last[cur] = today();
    carry -= n;
    write(v);
  }
  function tick() {
    var now = Date.now();
    var dt = (now - lastTick) / 1000;
    lastTick = now;
    if (!cur) return;
    // a long gap means the tab was throttled or asleep — never bank it
    if (active() && dt > 0 && dt < 5) { carry += dt; sessSecs += dt; }
    if (carry >= FLUSH_SECS) flush();
  }
  function touch() { lastAct = Date.now(); }

  function start(game) {
    if (!LABELS[game]) return;
    if (cur === game) return;
    stop();
    cur = game;
    carry = 0;
    sessSecs = 0;
    lastTick = Date.now();
    touch();
    var v = log();
    v.sessions[game] = (v.sessions[game] || 0) + 1;
    v.last[game] = today();
    write(v);
    if (!ticker) ticker = setInterval(tick, 1000);
  }
  function stop() {
    if (!cur) return;
    tick();
    flush();
    cur = null;
    sessSecs = 0;
  }

  /* ---- a completed run ---------------------------------------------------
     Each finish becomes a durable record: how long THIS run actually took,
     how many terms it covered, the accuracy, and the XP it paid. The record
     is also queued in `pending` so the arena page can hand it to the server
     on the student's next visit — vocab practice used to award XP with no
     trail at all, which made it the cheapest thing on the site to farm. */
  function finish(game, meta) {
    if (!LABELS[game]) return;
    meta = meta || {};
    tick(); flush();
    var v = log();
    v.done[game] = (v.done[game] || 0) + 1;
    var acc = Math.max(0, Math.min(1, meta.acc || 0));
    if (acc > (v.best[game] || 0)) v.best[game] = Math.round(acc * 100) / 100;

    var rec = {
      g: game,
      d: Math.round(sessSecs),              // seconds of ACTIVE time in this run
      acc: Math.round(acc * 100),
      n: meta.terms || 0,
      xp: Math.max(0, Math.round(meta.xp || 0)),
      m: (meta.mods || []).slice(0, 12),
      ts: Date.now()
    };
    v.recent.push(rec);
    if (v.recent.length > RECENT_MAX) v.recent = v.recent.slice(-RECENT_MAX);

    v.pending = (v.pending || []).concat([rec]);
    if (v.pending.length > PENDING_MAX) v.pending = v.pending.slice(-PENDING_MAX);

    write(v);
    // a run ends the session; the next mode switch opens a fresh one
    sessSecs = 0;
  }

  /* Sessions the arena hasn't uploaded yet, and the ack that clears them. */
  function pending() { return (log().pending || []).slice(); }
  function clearPending(upTo) {
    var v = log();
    v.pending = (v.pending || []).filter(function (r) { return r.ts > upTo; });
    write(v);
  }

  function totalSecs() {
    var t = log().totals, n = 0;
    Object.keys(t).forEach(function (k) { n += t[k] || 0; });
    return n;
  }
  function fmt(secs) {
    secs = Math.round(secs || 0);
    if (secs < 60) return secs + "s";
    var m = Math.floor(secs / 60);
    if (m < 60) return m + "m " + (secs % 60) + "s";
    return Math.floor(m / 60) + "h " + (m % 60) + "m";
  }

  /* ---- a small "time on task" strip for the vocab page ------------------- */
  function panelHtml() {
    var v = log(), games = Object.keys(LABELS).filter(function (g) { return (v.totals[g] || 0) >= 30; });
    if (!games.length) return "";
    var chips = games.map(function (g) {
      return '<span class="mono" style="font-size:11px;color:var(--dim);">' +
        LABELS[g] + ' <b style="color:var(--accent);">' + fmt(v.totals[g]) + '</b></span>';
    }).join("");
    return '<div class="card" style="margin-bottom:18px;display:flex;flex-wrap:wrap;gap:8px 18px;align-items:baseline;">' +
      '<div class="mono" style="font-size:11px;letter-spacing:1.5px;color:var(--faint);">TIME ON TASK</div>' +
      chips +
      '<div class="mono" style="margin-left:auto;font-size:11px;color:var(--dim);">total <b style="color:var(--bright);">' +
        fmt(totalSecs()) + '</b></div>' +
    '</div>';
  }

  ["mousedown", "keydown", "touchstart", "pointerdown", "wheel"].forEach(function (e) {
    document.addEventListener(e, touch, { passive: true, capture: true });
  });
  document.addEventListener("visibilitychange", function () { if (document.hidden) { tick(); flush(); } else { lastTick = Date.now(); touch(); } });
  window.addEventListener("pagehide", stop);
  window.addEventListener("beforeunload", stop);

  window.VOCAB_LOG = {
    start: start, stop: stop, finish: finish,
    pending: pending, clearPending: clearPending,
    read: log, totalSecs: totalSecs, fmt: fmt, panelHtml: panelHtml, labels: LABELS
  };
})();
