// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* ============================================================================
   duel-client.js  —  the student side of Head-to-Head Duels (v2.0).

   Loaded on each course's ctf.html and profile.html. When the teacher starts a
   duel on the projector (duel.html) that includes this student, a full-screen
   answer pad opens here. The question is on the projector AND on the pad;
   answers are graded server-side by text (supabase/duels.sql).
   Keys 1–4 pick an answer.
   ========================================================================== */
(function () {
  var AUTH = window.CTF_AUTH;
  var course = window.CTF_COURSE || (window.CTF && window.CTF.course);
  if (!AUTH || !AUTH.online || !course) return;
  var SESS_KEY = "ctf-sess-" + course;
  function sess() { try { return JSON.parse(localStorage.getItem(SESS_KEY)) || null; } catch (e) { return null; } }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var ov = null, last = null, sending = false, timer = null, pickedText = null, broken = false;

  function ensure() {
    if (ov) return ov;
    ov = document.createElement("div");
    ov.id = "duelPad";
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-modal", "true");
    ov.setAttribute("aria-label", "Head-to-head duel");
    ov.style.cssText = "position:fixed;inset:0;z-index:15000;background:color-mix(in oklab,var(--bg,#0a0e14) 94%,transparent);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto;";
    document.body.appendChild(ov);
    document.addEventListener("keydown", onKey);
    return ov;
  }
  function close() {
    if (!ov) return;
    ov.remove(); ov = null; last = null; pickedText = null;
    document.removeEventListener("keydown", onKey);
  }
  function onKey(e) {
    if (!last || !last.round || last.round.closed || last.round.answered) return;
    var n = parseInt(e.key, 10);
    if (n >= 1 && n <= (last.round.options || []).length) { e.preventDefault(); answer(last.round.options[n - 1]); }
  }
  function pips(score, need, col) {
    var h = "";
    for (var i = 0; i < need; i++) h += '<span style="width:14px;height:14px;border-radius:50%;border:2px solid ' + col + ';background:' + (i < score ? col : "transparent") + ';"></span>';
    return '<span style="display:inline-flex;gap:6px;" aria-hidden="true">' + h + '</span>';
  }
  function paint(d) {
    ensure();
    var r = d.round, you = esc((sess() || {}).handle || "You"), opp = esc(d.opp_handle || "Opponent");
    var head = '<div class="mono" style="font-size:11px;letter-spacing:2.5px;color:var(--amber,#ffcf5c);text-transform:uppercase;margin-bottom:14px;">\u2694 Head-to-head duel' + (d.label ? " \u00b7 " + esc(d.label) : "") + '</div>' +
      '<div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:14px;margin-bottom:22px;">' +
        '<div style="text-align:left;"><div style="font-weight:800;font-size:20px;color:var(--accent,#2ee6a6);">' + you + ' <span class="mono" style="font-size:11px;color:var(--faint,#6f8aa6);">YOU</span></div><div style="margin-top:8px;">' + pips(d.my_score, d.need, "var(--accent,#2ee6a6)") + '</div></div>' +
        '<div class="mono" style="font-size:13px;color:var(--faint,#6f8aa6);">VS</div>' +
        '<div style="text-align:right;"><div style="font-weight:800;font-size:20px;color:var(--bright,#fff);">' + opp + '</div><div style="margin-top:8px;">' + pips(d.opp_score, d.need, "var(--bright,#fff)") + '</div></div>' +
      '</div>';
    var body;
    if (d.won_match != null) {
      body = '<div role="status" aria-live="assertive" style="text-align:center;padding:26px 0 8px;">' +
        '<div style="font-size:40px;font-weight:800;color:' + (d.won_match ? "var(--accent,#2ee6a6)" : "var(--bright,#fff)") + ';">' + (d.won_match ? "You win!" : opp + " wins") + '</div>' +
        '<div style="font-size:15px;color:var(--muted,#9fb4cc);margin-top:10px;">' + (d.won_match ? (d.pot ? "+" + d.pot + " XP is on its way from your teacher." : "Nice work.") : "Good duel. Run it back next time.") + '</div>' +
        '<button type="button" id="duelClose" class="mono" style="margin-top:22px;font-size:13px;font-weight:700;padding:12px 22px;min-height:44px;border-radius:10px;border:1px solid var(--border3,#244a6d);background:transparent;color:var(--bright,#fff);cursor:pointer;">Close</button></div>';
    } else if (!r) {
      body = '<div role="status" aria-live="polite" style="text-align:center;padding:30px 0;font-size:16px;color:var(--muted,#9fb4cc);">Get ready \u2014 watch the front screen. The first question is coming.</div>';
    } else {
      var opts = (r.options || []).map(function (o, i) {
        var state = "", mine = r.answered && r.my_choice === o, isAns = r.closed && r.answer === o;
        var bd = "var(--border3,#244a6d)", bg = "var(--panel,#0b1220)", col = "var(--bright,#fff)";
        if (isAns) { bd = "var(--accent,#2ee6a6)"; bg = "color-mix(in oklab,var(--accent,#2ee6a6) 18%,var(--panel,#0b1220))"; state = " \u2713"; }
        else if (mine && r.my_correct === false) { bd = "var(--adv2,#ff6b7a)"; bg = "color-mix(in oklab,var(--adv2,#ff6b7a) 16%,var(--panel,#0b1220))"; state = " \u2717"; }
        else if (mine) { bd = "var(--amber,#ffcf5c)"; }
        var dis = r.answered || r.closed || sending;
        return '<button type="button" class="duelOpt" data-i="' + i + '"' + (dis ? " disabled" : "") +
          ' style="display:flex;align-items:center;gap:14px;width:100%;text-align:left;padding:16px 18px;min-height:60px;border-radius:12px;border:2px solid ' + bd + ';background:' + bg + ';color:' + col + ';font-size:16px;font-weight:600;cursor:' + (dis ? "default" : "pointer") + ';">' +
          '<span class="mono" style="flex:none;width:30px;height:30px;border-radius:8px;border:1px solid ' + bd + ';display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;">' + (i + 1) + '</span>' +
          '<span style="flex:1;min-width:0;">' + esc(o) + state + '</span></button>';
      }).join("");
      var status = "";
      if (r.closed) status = r.won === true ? "You took round " + r.n + "!" : r.won === false ? opp + " took round " + r.n + "." : "Nobody got round " + r.n + ".";
      else if (r.answered) status = r.my_correct ? "Correct \u2014 locking it in\u2026" : "Wrong answer \u2014 you're locked out of this round.";
      else status = "Round " + r.n + " \u00b7 first correct answer wins it \u00b7 a wrong answer locks you out";
      body = '<div style="font-size:clamp(18px,3.2vw,24px);font-weight:700;color:var(--bright,#fff);line-height:1.4;margin-bottom:18px;">' + esc(r.question) + '</div>' +
        '<div style="display:flex;flex-direction:column;gap:10px;">' + opts + '</div>' +
        '<div class="mono" role="status" aria-live="polite" style="margin-top:16px;font-size:12px;color:' + (r.answered && !r.my_correct && !r.closed ? "var(--adv2,#ff6b7a)" : "var(--dim,#8aa0b8)") + ';">' + esc(status) + '</div>';
    }
    ov.innerHTML = '<div class="card" style="width:100%;max-width:640px;padding:26px;border:1px solid var(--amber,#ffcf5c);border-radius:16px;background:var(--panel,#0b1220);">' + head + body + '</div>';
    ov.querySelectorAll(".duelOpt").forEach(function (b) { b.onclick = function () { answer(r.options[+b.getAttribute("data-i")]); }; });
    var c = ov.querySelector("#duelClose"); if (c) { c.onclick = function () { dismissed = d.duel_id; close(); }; c.focus(); }
    var first = ov.querySelector(".duelOpt:not([disabled])"); if (first && document.activeElement && !ov.contains(document.activeElement)) first.focus();
  }
  var dismissed = null;
  function answer(text) {
    var s = sess(); if (!s || !last || !last.round || sending) return;
    sending = true; pickedText = text;
    last.round.answered = true; last.round.my_choice = text; paint(last);
    AUTH.rpc("ctf_duel_answer", { p_student: s.studentId, p_round: last.round.id, p_choice: text })
      .then(function () { sending = false; poll(); })
      .catch(function () { sending = false; poll(); });
  }
  function poll() {
    clearTimeout(timer);
    var s = sess();
    if (!s || broken) { timer = setTimeout(poll, 15000); return; }
    AUTH.rpc("ctf_duel_poll", { p_student: s.studentId }).then(function (d) {
      if (!d || d.error) { if (d && /function/.test(String(d.error))) broken = true; timer = setTimeout(poll, 15000); return; }
      if (!d.active || d.duel_id === dismissed) { close(); timer = setTimeout(poll, document.hidden ? 15000 : 6000); return; }
      var sig = JSON.stringify(d);
      if (sig !== JSON.stringify(last)) { last = d; paint(d); }
      timer = setTimeout(poll, 1200);
    }).catch(function (e) {
      if (/duel_poll|function/i.test(String(e && e.message))) broken = true;   // duels.sql not installed
      timer = setTimeout(poll, 15000);
    });
  }
  document.addEventListener("visibilitychange", function () { if (!document.hidden) poll(); });
  setTimeout(poll, 2500);
})();
