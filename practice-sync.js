/* ============================================================================
   practice-sync.js  —  upload vocabulary practice from the vocab page itself.

   Practice XP and per-run records used to reach the server only on the student's
   NEXT arena visit: vocab.html loads no auth at all, so a student could drill for
   twenty minutes, close the tab, and leave no trace and no XP. Teachers reported
   it as "the lab isn't logging."

   This uploads from the vocab page directly, if and only if the student has
   already joined a class on this device (the session cache sync.js writes) and
   is still signed in. It never shows a sign-in gate: the vocab pages stay open to
   anyone, exactly as before. Failures are silent and simply retry next time — the
   arena flush still exists as the fallback path.

   Load AFTER supabase-config.js, auth.js, vocab-xp.js and vocab-log.js:
     <script src="../supabase-config.js"></script>
     <script src="../auth.js"></script>
     <script src="../practice-sync.js"></script>
   ========================================================================== */
(function () {
  var CFG = window.SUPABASE_CONFIG || {};
  if (!CFG.url || !CFG.anonKey) return;                  // local-only mode
  var AUTH = window.CTF_AUTH; if (!AUTH) return;

  var course = window.CTF_COURSE || "cyber1";
  var SESS_KEY = "ctf-sess-" + course;                   // written by sync.js
  var STATE_KEY = "ctf-" + course;                       // the engine's blob

  function sess() { try { return JSON.parse(localStorage.getItem(SESS_KEY)) || null; } catch (e) { return null; } }
  function state() { try { return JSON.parse(localStorage.getItem(STATE_KEY)) || {}; } catch (e) { return {}; } }
  function writeState(s) { try { localStorage.setItem(STATE_KEY, JSON.stringify(s)); } catch (e) {} }

  /* Practice XP lives in state.vocabXp; the arena folds it into its point total.
     We report points the same way the arena does so the two agree. */
  function pointsOf(st) {
    var base = Number(st.points) || 0;
    var v = st.vocabXp || {}, extra = 0;
    Object.keys(v).forEach(function (k) { extra += Number(v[k]) || 0; });
    return base + extra;
  }
  function solvedOf(st) {
    var s = st.solved || {};
    return Object.keys(s).filter(function (k) { return s[k]; }).length;
  }

  var busy = false;
  async function push(reason) {
    if (busy) return;
    var se = sess(); if (!se || !se.studentId) return;    // not enrolled here
    busy = true;
    try {
      var u = await AUTH.user();
      if (!u || !AUTH.isSchool(u)) return;                // signed out: nothing to do

      var st = state();

      /* 1. progress, so practice XP counts */
      await AUTH.rpc("ctf_sync_google", {
        p_student: se.studentId,
        p_points: pointsOf(st),
        p_bonus: Number(st.bonus) || 0,
        p_solved: solvedOf(st),
        p_total: Number(st.totalCount) || 0,
        p_state: st,
        p_streak: st.streak || {},
        p_badges: st.badges || {}
      }).catch(function () {});

      /* 2. the per-run practice log, in batches, clearing only what was accepted */
      var LOG = window.VOCAB_LOG;
      if (LOG && LOG.pending) {
        var q = LOG.pending();
        if (q.length) {
          var r = await AUTH.rpc("ctf_vocab_sessions_google",
            { p_student: se.studentId, p_rows: q.slice(0, 60) }).catch(function () { return null; });
          if (r && r.ok && LOG.clearPending) LOG.clearPending(Number(r.through) || 0);
        }
      }

      /* 3. one login-day mark, so practice counts as attendance */
      try {
        var dk = "ctf-day-" + course, today = new Date().toISOString().slice(0, 10);
        if (localStorage.getItem(dk) !== today) {
          await AUTH.rpc("ctf_touch_day", { p_student: se.studentId }).catch(function () {});
          localStorage.setItem(dk, today);
        }
      } catch (e) {}
    } catch (e) {
    } finally { busy = false; }
  }

  /* A finished game is the moment worth uploading; also catch the tab closing,
     and sweep on load for anything an earlier visit left queued. */
  var LOGF = window.VOCAB_LOG && window.VOCAB_LOG.finish;
  if (LOGF) {
    window.VOCAB_LOG.finish = function (game, meta) {
      try { LOGF.apply(window.VOCAB_LOG, arguments); } finally { setTimeout(function () { push("finish"); }, 300); }
    };
  }
  document.addEventListener("visibilitychange", function () { if (document.hidden) push("hide"); });
  window.addEventListener("pagehide", function () { push("pagehide"); });
  if (document.readyState === "complete") push("load");
  else window.addEventListener("load", function () { push("load"); });

  window.CTF_PRACTICE_SYNC = { push: push, enrolled: function () { return !!sess(); } };
})();
