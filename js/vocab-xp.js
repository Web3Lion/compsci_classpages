// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* ============================================================================
   vocab-xp.js  —  real XP for the vocabulary practice games.

   Practice should pay, but it must never out-earn the CTF flags. So:

     * Only the four SCORED games earn XP (flashcards are free review):
         DECRYPT · HANDSHAKE (match) · QUIZ · CASCADE
     * A finished session pays up to SESSION_MAX XP, scaled by how well the
       student did (accuracy), with a small floor for finishing at all.
     * Each (module, game) pair has a hard ceiling of MODULE_GAME_CAP XP. Once
       a student has drilled a module's quiz to the cap, replaying it earns
       nothing — so grinding one easy game can't inflate a score.

   Ceiling math: 4 games x 30 XP = 120 XP per module. A module's flags are
   worth roughly 800-1200 XP, so vocab practice tops out near 10-15% of a
   module — a real nudge, never a substitute for capturing flags.

   XP is written into the SAME localStorage blob the CTF engine owns
   (`ctf-<course>`), under state.vocabXp. ctf.js folds that into stats().pts,
   and sync.js pushes it to Supabase on the student's next arena visit.
   ========================================================================== */
(function () {
  var SESSION_MAX = 12;        // most XP a single good session can pay
  var SESSION_FLOOR = 2;       // finishing a session always pays something
  var MODULE_GAME_CAP = 30;    // ceiling per module, per game

  var GAMES = {
    decrypt: { label: "DECRYPT" },
    match:   { label: "HANDSHAKE" },
    quiz:    { label: "QUIZ" },
    cascade: { label: "CASCADE" }
  };

  var course = window.CTF_COURSE || "cyber1";
  var KEY = "ctf-" + course;

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function cell(game, mod) { return game + ":" + mod; }

  function earnedFor(game, mod) {
    var v = load().vocabXp || {};
    return v[cell(game, mod)] || 0;
  }
  function totalEarned() {
    var v = load().vocabXp || {}, t = 0;
    Object.keys(v).forEach(function (k) { t += v[k] || 0; });
    return t;
  }

  /* ---- award -------------------------------------------------------------
     `mods` is the set of module numbers the session drew its terms from.
     The pot is spread one XP at a time across those modules so a multi-module
     session fills them evenly instead of dumping everything into the first. */
  function award(game, mods, accuracy) {
    if (!GAMES[game]) return null;
    mods = (mods || []).slice().sort(function (a, b) { return a - b; });
    if (!mods.length) return null;

    var acc = Math.max(0, Math.min(1, accuracy || 0));
    var pot = Math.max(SESSION_FLOOR, Math.round(SESSION_MAX * acc));

    var state = load();
    state.vocabXp = state.vocabXp || {};

    var room = {}, roomTotal = 0;
    mods.forEach(function (m) {
      var left = Math.max(0, MODULE_GAME_CAP - (state.vocabXp[cell(game, m)] || 0));
      room[m] = left; roomTotal += left;
    });
    if (roomTotal <= 0) return { gained: 0, pot: pot, capped: true, game: game, acc: acc };

    var gained = 0, give = Math.min(pot, roomTotal), i = 0;
    while (give > 0) {
      var m = mods[i % mods.length];
      i++;
      if (room[m] > 0) {
        room[m]--; give--; gained++;
        var k = cell(game, m);
        state.vocabXp[k] = (state.vocabXp[k] || 0) + 1;
      }
      if (i > mods.length * (MODULE_GAME_CAP + SESSION_MAX + 2)) break;  // safety
    }
    save(state);
    return { gained: gained, pot: pot, capped: gained < pot, game: game, acc: acc };
  }

  /* ---- session summary line, dropped into a game's end card -------------- */
  function summaryHtml(res, mods) {
    if (!res) return "";
    var head, sub, col;
    if (res.gained > 0) {
      head = "+" + res.gained + " XP EARNED";
      col = "var(--accent)";
      sub = res.capped
        ? "Practice cap reached for these units \u2014 try a different game or unit for more XP."
        : "Counts toward your rank on the arena page.";
    } else {
      head = "PRACTICE CAP REACHED";
      col = "var(--faint)";
      sub = "You've earned the full " + MODULE_GAME_CAP + " XP from this game for these units. Keep drilling for mastery \u2014 or go capture flags.";
    }
    var bars = (mods || []).slice().sort(function (a, b) { return a - b; }).map(function (m) {
      var e = earnedFor(res.game, m), p = Math.round(e / MODULE_GAME_CAP * 100);
      return '<div style="display:flex;align-items:center;gap:8px;">' +
        '<span class="mono" style="font-size:10px;color:var(--faint);width:52px;text-align:right;">UNIT ' + m + '</span>' +
        '<span style="flex:1;height:5px;border-radius:99px;background:var(--bg);overflow:hidden;display:block;">' +
          '<span style="display:block;height:100%;width:' + p + '%;background:' + (p >= 100 ? "var(--amber)" : "var(--accent)") + ';"></span></span>' +
        '<span class="mono" style="font-size:10px;color:var(--dim);width:52px;">' + e + '/' + MODULE_GAME_CAP + '</span>' +
      '</div>';
    }).join("");

    return '<div style="margin:0 0 20px;padding:14px 16px;border-radius:12px;border:1px solid var(--border);background:var(--bg);text-align:left;">' +
      '<div class="mono" style="font-size:12px;font-weight:800;letter-spacing:1.5px;color:' + col + ';">' + head + '</div>' +
      '<div style="font-size:12px;color:var(--dim);margin:5px 0 12px;line-height:1.5;">' + sub + '</div>' +
      '<div style="display:flex;flex-direction:column;gap:6px;">' + bars + '</div>' +
    '</div>';
  }

  /* one-shot: award, then hand back the HTML block for the end card */
  function finishSession(game, mods, accuracy) {
    return summaryHtml(award(game, mods, accuracy), mods);
  }

  /* ---- practice-XP panel for the vocab page header ----------------------- */
  function progressHtml(allModules) {
    var mods = (allModules || []).slice().sort(function (a, b) { return a - b; });
    var games = Object.keys(GAMES);
    var max = mods.length * games.length * MODULE_GAME_CAP;
    var got = totalEarned();
    return '<div class="card" style="margin-bottom:18px;">' +
      '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap;">' +
        '<div class="mono" style="font-size:11px;letter-spacing:1.5px;color:var(--faint);">PRACTICE XP</div>' +
        '<div class="mono" style="font-size:11px;color:var(--dim);">' + got + ' / ' + max + ' XP earned \u00b7 ' +
          MODULE_GAME_CAP + ' cap per game per unit</div>' +
      '</div>' +
      '<div style="font-size:12px;color:var(--dim);margin-top:6px;line-height:1.5;">' +
        'Scored games pay real XP toward your rank. Flashcards are free review \u2014 no cap, no XP.</div>' +
    '</div>';
  }

  window.VOCAB_XP = {
    award: award, finishSession: finishSession, summaryHtml: summaryHtml,
    earnedFor: earnedFor, totalEarned: totalEarned, progressHtml: progressHtml,
    cap: MODULE_GAME_CAP, sessionMax: SESSION_MAX, games: GAMES
  };
})();
