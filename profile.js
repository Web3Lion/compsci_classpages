/* ============================================================================
   profile.js  —  student profile page: XP record, full badge case (locked
   badges greyed, earned badges in color), name change (filtered), and the
   course top-5 leaderboard (names only, no XP shown).

   Loads AFTER config.js + ctf.js + name-filter.js + supabase-config.js.
   ctf.js supplies the badge/stat math so the profile can never disagree with
   the arena. Works in local-only mode; the leaderboard needs Supabase.
   ========================================================================== */
(function () {
  var API = window.CTF || {};
  var course = window.CTF_COURSE || API.course || "cyber1";
  var CFG = window.SUPABASE_CONFIG || {};
  var ONLINE = !!(CFG.url && CFG.anonKey);  // narrowed below once auth.js is seen
  var T = (window.CTF_NAME || {}).terms ? window.CTF_NAME.terms(course) : { term: "Handle", eg: "NightOwl", blurb: "" };
  var SESS_KEY = "ctf-sess-" + course;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function el(id) { return document.getElementById(id); }
  function sess() { try { return JSON.parse(localStorage.getItem(SESS_KEY)) || null; } catch (e) { return null; } }
  function localName() { try { return localStorage.getItem(API.handleKey) || ""; } catch (e) { return ""; } }

  /* ---- backend (shared google-auth helper) ------------------------------- */
  var AUTH = window.CTF_AUTH || null;
  ONLINE = ONLINE && !!AUTH;

  /* ---- pieces ------------------------------------------------------------ */
  function header() {
    var s = sess();
    // padding-right reserves room for the shell's fixed .themebtn (top-right)
    return '<div style="display:flex;align-items:flex-end;gap:14px;flex-wrap:wrap;margin:0 0 22px;padding-right:112px;">' +
      '<div>' +
        '<div class="mono" style="font-size:11px;letter-spacing:2px;color:var(--faint);">OPERATOR RECORD</div>' +
        '<div style="font-size:28px;font-weight:800;color:var(--bright);letter-spacing:-.4px;line-height:1.1;margin-top:4px;">My Profile</div>' +
      '</div>' +
      '<div style="margin-left:auto;display:flex;gap:8px;align-items:center;">' +
        (s ? '<span class="mono" style="font-size:11px;color:var(--dim);">' + esc(s.className || "") + '</span>' : "") +
        '<a class="qlink mono" href="ctf.html" style="font-size:12px;padding:9px 14px;border:1px solid var(--border3);border-radius:9px;color:var(--accent);">&larr; BACK TO ARENA</a>' +
      '</div>' +
    '</div>';
  }

  function identityCard() {
    var s = sess();
    var name = (s && s.handle) || localName();
    return '<div class="card" style="padding:22px;">' +
      '<div class="mono" style="font-size:11px;letter-spacing:1.5px;color:var(--faint);margin-bottom:12px;">' + esc(T.term.toUpperCase()) + '</div>' +
      '<div id="pfIdView" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">' +
        '<div style="font-size:26px;font-weight:800;color:var(--bright);letter-spacing:-.3px;">' +
          (name ? esc(name) : '<span style="color:var(--faint);font-weight:600;font-size:18px;">not set yet</span>') +
        '</div>' +
        '<button id="pfEdit" class="mono" style="font-size:11px;letter-spacing:.5px;background:none;border:1px solid var(--border3);color:var(--dim);padding:6px 12px;border-radius:8px;cursor:pointer;">CHANGE</button>' +
      '</div>' +
      '<div id="pfIdEdit" style="display:none;max-width:420px;">' +
        '<div style="display:flex;gap:8px;">' +
          '<input id="pfName" class="mono" maxlength="18" spellcheck="false" autocomplete="off" placeholder="e.g. ' + esc(T.eg) + '" ' +
            'style="flex:1;padding:11px 13px;border-radius:9px;border:1px solid var(--border3);background:var(--bg);color:var(--bright);font-size:15px;outline:none;">' +
          '<button id="pfDice" title="Suggest a name" style="padding:0 13px;border-radius:9px;border:1px solid var(--border3);background:var(--panel2);color:var(--dim);cursor:pointer;font-size:15px;">&#9860;</button>' +
        '</div>' +
        '<div id="pfNameMsg" class="mono" style="font-size:11px;min-height:16px;margin:7px 0 4px;color:var(--faint);"></div>' +
        '<div style="display:flex;gap:8px;">' +
          '<button id="pfSave" class="mono" style="font-size:12px;font-weight:700;padding:9px 16px;border:none;border-radius:9px;background:var(--accent);color:#04121e;cursor:pointer;">SAVE</button>' +
          '<button id="pfCancel" class="mono" style="font-size:12px;padding:9px 14px;border:1px solid var(--border2);border-radius:9px;background:none;color:var(--dim);cursor:pointer;">CANCEL</button>' +
        '</div>' +
      '</div>' +
      '<div class="mono" style="font-size:11px;color:var(--faint);line-height:1.6;margin-top:12px;">' + esc(T.blurb) +
        (ONLINE && !s ? " Sign in on the arena page to save it to your class." : "") + '</div>' +
    '</div>';
  }

  function xpCard() {
    var st = API.getState ? API.getState() : {};
    var s = (API.stats && API.stats()) || { pts: 0, total: 0, solvedCount: 0, count: 0, rank: "", next: null };
    var flagXp = st.points || 0, bonusXp = st.bonus || 0;
    var vocabXp = (API.vocabXp && API.vocabXp()) || 0;
    var streak = st.streak || {};
    var pct = s.total ? Math.round(s.pts / s.total * 100) : 0;
    var line = function (k, v, col) {
      return '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px solid var(--border2);">' +
        '<span style="font-size:13px;color:var(--dim);">' + k + '</span>' +
        '<span class="mono" style="font-size:14px;font-weight:700;color:' + (col || "var(--text)") + ';">' + v + '</span></div>';
    };
    return '<div class="card" style="padding:22px;">' +
      '<div class="mono" style="font-size:11px;letter-spacing:1.5px;color:var(--faint);margin-bottom:14px;">XP RECORD</div>' +
      '<div style="display:flex;align-items:baseline;gap:10px;">' +
        '<div class="mono" style="font-size:40px;font-weight:800;color:var(--accent);line-height:1;">' + s.pts.toLocaleString() + '</div>' +
        '<div class="mono" style="font-size:12px;color:var(--dim);">/ ' + s.total.toLocaleString() + ' XP</div>' +
      '</div>' +
      '<div style="height:7px;border-radius:99px;background:var(--bg);border:1px solid var(--border2);margin:12px 0 4px;overflow:hidden;">' +
        '<div style="height:100%;width:' + pct + '%;background:var(--accent);"></div></div>' +
      '<div class="mono" style="font-size:11px;color:var(--faint);margin-bottom:14px;">' + pct + '% of all XP in this course</div>' +
      line("Rank", esc(s.rank || "\u2014"), "var(--bright)") +
      line("Flag XP", flagXp.toLocaleString()) +
      line("Daily bonus XP", "+" + bonusXp.toLocaleString(), bonusXp ? "var(--amber)" : "var(--faint)") +
      line("Vocab practice XP", "+" + vocabXp.toLocaleString(), vocabXp ? "var(--amber)" : "var(--faint)") +
      line("Flags captured", (s.solvedCount || 0) + " / " + (s.count || 0)) +
      line("Current streak", (streak.count || 0) + " day" + ((streak.count || 0) === 1 ? "" : "s"), streak.count ? "var(--amber)" : "var(--faint)") +
      line("Best streak", (streak.best || 0) + " day" + ((streak.best || 0) === 1 ? "" : "s")) +
    '</div>';
  }

  function badgeCase() {
    var defs = (API.badges && API.badges()) || [];
    var tierColor = API.tierColor || function () { return "var(--amber)"; };
    var totalTiers = defs.length * 3;
    var earned = defs.reduce(function (a, d) { return a + (d.tier || 0); }, 0);

    var tile = function (d) {
      var t = d.tier || 0;
      var on = t > 0;
      var col = on ? tierColor(t) : "var(--faint)";
      var cur = on ? d.tiers[t - 1].label : "LOCKED";
      var next = d.tiers[t];
      var prevNeed = on ? d.tiers[t - 1].need : 0;
      var goal = next ? next.need : d.tiers[d.tiers.length - 1].need;
      var pct = next ? Math.max(0, Math.min(100, Math.round((d.value - prevNeed) / Math.max(1, goal - prevNeed) * 100))) : 100;
      var pips = d.tiers.map(function (tr, i) {
        var got = t > i;
        return '<div title="' + esc(tr.label) + ' \u00b7 needs ' + tr.need + '" style="flex:1;height:4px;border-radius:99px;background:' +
          (got ? tierColor(i + 1) : "var(--border2)") + ';"></div>';
      }).join("");
      return '<div style="padding:16px;border-radius:12px;border:1px solid ' + (on ? col + "55" : "var(--border2)") + ';' +
        'background:' + (on ? "linear-gradient(160deg," + col + "14,var(--bg) 65%)" : "var(--bg)") + ';' +
        (on ? "" : "opacity:.62;filter:saturate(.15);") + '">' +
        '<div style="display:flex;align-items:center;gap:9px;">' +
          '<div style="font-size:22px;line-height:1;color:' + col + ';' + (on ? "" : "filter:grayscale(1);") + '">' + d.glyph + '</div>' +
          '<div style="min-width:0;">' +
            '<div style="font-size:14px;font-weight:700;color:' + (on ? "var(--bright)" : "var(--dim)") + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(d.name) + '</div>' +
            '<div class="mono" style="font-size:10px;letter-spacing:.8px;color:' + col + ';text-transform:uppercase;">' + esc(cur) + '</div>' +
          '</div>' +
          (on ? '<div class="mono" style="margin-left:auto;font-size:10px;font-weight:700;color:' + col + ';">' + t + '/3</div>' : '') +
        '</div>' +
        '<div style="display:flex;gap:3px;margin:12px 0 8px;">' + pips + '</div>' +
        '<div style="height:5px;border-radius:99px;background:var(--panel2);overflow:hidden;">' +
          '<div style="height:100%;width:' + pct + '%;background:' + col + ';"></div></div>' +
        '<div class="mono" style="font-size:10px;color:var(--faint);margin-top:7px;">' +
          (next ? d.value + " / " + next.need + " \u2192 " + esc(next.label) : "MAX \u00b7 " + d.value) + '</div>' +
      '</div>';
    };

    return '<div class="card" style="padding:22px;margin-top:20px;">' +
      '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:6px;">' +
        '<div class="mono" style="font-size:11px;letter-spacing:1.5px;color:var(--faint);">BADGE CASE</div>' +
        '<div class="mono" style="font-size:11px;color:var(--dim);">' + earned + ' / ' + totalTiers + ' tiers earned</div>' +
      '</div>' +
      '<div class="mono" style="font-size:11px;color:var(--faint);margin-bottom:16px;">Every badge in the course. Greyed out until you earn its first tier.</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(215px,1fr));gap:12px;">' + defs.map(tile).join("") + '</div>' +
    '</div>';
  }

  function leaderboardCard() {
    return '<div class="card" style="padding:22px;margin-top:20px;">' +
      '<div class="mono" style="font-size:11px;letter-spacing:1.5px;color:var(--faint);margin-bottom:6px;">TOP 5 \u00b7 XP LEADERBOARD</div>' +
      '<div class="mono" style="font-size:11px;color:var(--faint);margin-bottom:14px;">Highest XP in your class. Scores stay private \u2014 only ' + esc(T.term.toLowerCase()) + 's are shown.</div>' +
      '<div id="pfLb"></div>' +
    '</div>';
  }

  function renderLb(rows, mine) {
    var box = el("pfLb"); if (!box) return;
    if (!rows || !rows.length) { box.innerHTML = '<div class="mono" style="font-size:12px;color:var(--faint);">No scores in your class yet. Be first.</div>'; return; }
    var medal = ["\u2460", "\u2461", "\u2462", "\u2463", "\u2464"];
    box.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px;">' + rows.map(function (r, i) {
      var you = mine && String(r.handle).toLowerCase() === String(mine).toLowerCase();
      var col = i === 0 ? "var(--amber)" : i === 1 ? "#c3d0de" : i === 2 ? "#cd8a3c" : "var(--dim)";
      return '<div style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:10px;background:var(--bg);' +
        'border:1px solid ' + (you ? "var(--accent)" : "var(--border2)") + ';">' +
        '<span class="mono" style="font-size:17px;font-weight:800;color:' + col + ';width:20px;">' + medal[i] + '</span>' +
        '<span style="font-weight:700;color:var(--bright);font-size:14px;">' + esc(r.handle) + '</span>' +
        (you ? '<span class="mono" style="margin-left:auto;font-size:10px;letter-spacing:1px;color:var(--accent);">YOU</span>' : "") +
      '</div>';
    }).join("") + '</div>';
  }

  async function loadLb() {
    var box = el("pfLb"); if (!box) return;
    var s = sess();
    if (!ONLINE || !s) {
      box.innerHTML = '<div class="mono" style="font-size:12px;color:var(--faint);line-height:1.6;">' +
        (ONLINE ? "Sign in on the arena page to see your class leaderboard." : "Leaderboard turns on once your teacher connects the class backend.") + '</div>';
      return;
    }
    box.innerHTML = '<span class="spin"></span>';
    try {
      renderLb(await AUTH.rpc("ctf_leaderboard_google", { p_class: s.classId }) || [], s.handle);
    } catch (e) {
      box.innerHTML = '<div class="mono" style="font-size:12px;color:var(--faint);">Couldn\'t load the leaderboard right now.</div>';
    }
  }

  /* ---- name editing ------------------------------------------------------ */
  function wireIdentity() {
    var view = el("pfIdView"), edit = el("pfIdEdit"), input = el("pfName"), msg = el("pfNameMsg");
    if (!view || !edit) return;
    var s = sess();
    var problem = (window.CTF_NAME || {}).problem || function () { return null; };

    function show(on) { view.style.display = on ? "none" : "flex"; edit.style.display = on ? "block" : "none"; if (on) { input.value = (s && s.handle) || localName(); input.focus(); check(); } }
    function check() {
      var v = input.value.trim();
      if (!v) { msg.textContent = ""; return false; }
      var p = problem(v);
      msg.textContent = p || "\u2713 looks good";
      msg.style.color = p ? "var(--adv2,#ff6b6b)" : "var(--ok,#57d38c)";
      return !p;
    }
    el("pfEdit").onclick = function () { show(true); };
    el("pfCancel").onclick = function () { show(false); };
    el("pfDice").onclick = function () { input.value = (window.CTF_NAME || {}).suggest ? window.CTF_NAME.suggest(course) : ""; check(); };
    input.addEventListener("input", check);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") el("pfSave").click(); });

    el("pfSave").onclick = async function () {
      if (!check()) { if (!input.value.trim()) { msg.textContent = "Enter a name."; msg.style.color = "var(--adv2,#ff6b6b)"; } return; }
      var v = input.value.trim();
      var btn = this; btn.disabled = true; btn.textContent = "SAVING\u2026";
      try {
        if (ONLINE && s) {
          var d = await AUTH.rpc("ctf_rename_google", { p_student: s.studentId, p_handle: v });
          s.handle = (d && d.handle) || v;
          localStorage.setItem(SESS_KEY, JSON.stringify(s));
        }
        try { localStorage.setItem(API.handleKey, v); } catch (e) {}
        location.reload();
      } catch (e) {
        var m = (e && (e.message || "")) + "";
        msg.style.color = "var(--adv2,#ff6b6b)";
        msg.textContent = /not_yours|not_signed_in/.test(m) ? "Sign in on the arena page first."
          : /handle_taken/.test(m) ? "Someone in your class already uses that name."
          : /not_allowed/.test(m) ? "Please choose a school-appropriate name."
          : "Couldn't save. Check your connection.";
        btn.disabled = false; btn.textContent = "SAVE";
      }
    };
  }

  /* ---- boot -------------------------------------------------------------- */
  function boot() {
    var root = el("profileRoot"); if (!root) return;
    root.innerHTML = header() +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;">' +
        identityCard() + xpCard() +
      '</div>' +
      badgeCase() + leaderboardCard();
    wireIdentity();
    loadLb();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
