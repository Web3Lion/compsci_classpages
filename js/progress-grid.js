// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* ============================================================================
   progress-grid.js  —  private self-monitoring grid on the student profile
   (supabase/progress-grids.sql). Fills <div id="pfProgress">.

   A student sees and edits ONLY their own row: every RPC checks the student
   row belongs to the signed-in Google account. The teacher sees the class in
   teacher.html → Progress Grids.
   ========================================================================== */
(function () {
  function courseId() {
    if (window.CTF_COURSE) return window.CTF_COURSE;
    var m = location.pathname.match(/\/(cyber1|cyber2|cyber3|apcsp|web3)\//);
    return m ? m[1] : null;
  }
  var course = courseId(); if (!course) return;
  var sess = null; try { sess = JSON.parse(localStorage.getItem("ctf-sess-" + course)); } catch (e) {}
  if (!sess || !sess.studentId) return;

  var ST = [
    ["working", "Working"], ["question", "Have Question"], ["stuck", "Stuck / Need Help"], ["check", "Need Check"], ["done", "Done"]
  ];
  var LABEL = {}; ST.forEach(function (s) { LABEL[s[0]] = s[1]; });
  var GRIDS = null, lastBox = null, busy = {};

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function when(ts) { return ts ? new Date(ts).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : ""; }
  function token() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (/^sb-.*-auth-token$/.test(k)) { var v = JSON.parse(localStorage.getItem(k)); return v && (v.access_token || (v.currentSession && v.currentSession.access_token)); }
      }
    } catch (e) {}
    return null;
  }
  function rpc(fn, args) {
    if (window.CTF_AUTH && window.CTF_AUTH.online) return window.CTF_AUTH.rpc(fn, args);
    var C = window.SUPABASE_CONFIG || {}, t = token();
    if (!C.url || !C.anonKey || !t) return Promise.reject(new Error("offline"));
    return fetch(C.url + "/rest/v1/rpc/" + fn, {
      method: "POST", headers: { apikey: C.anonKey, Authorization: "Bearer " + t, "Content-Type": "application/json" }, body: JSON.stringify(args || {})
    }).then(function (r) { return r.json(); }).then(function (d) { if (d && d.error) throw new Error(d.error); return d; });
  }

  function css() {
    if (document.getElementById("pgCss")) return;
    var st = document.createElement("style"); st.id = "pgCss";
    st.textContent =
      ":root{--pg-working:#5cb0ff;--pg-question:#ffd060;--pg-stuck:#ff7b7b;--pg-check:#c99bff;--pg-done:#4fd99b;}" +
      ":root[data-theme=light]{--pg-working:#0a5fa8;--pg-question:#7f5a00;--pg-stuck:#b3261e;--pg-check:#6a31b0;--pg-done:#11714a;}" +
      ".pgOpt{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:7px 12px;border-radius:999px;border:1px solid var(--border2);background:var(--panel);cursor:pointer;font-size:13px;font-weight:600;color:var(--text);}" +
      ".pgOpt input{position:absolute;opacity:0;pointer-events:none;}" +
      ".pgOpt .dot{width:10px;height:10px;border-radius:50%;flex:none;}" +
      ".pgOpt:has(input:focus-visible){outline:3px solid var(--accent);outline-offset:2px;}" +
      ".pgOpt:has(input:checked){color:var(--bright);font-weight:800;}";
    document.head.appendChild(st);
  }
  function chip(status) {
    if (!status) return '<span class="mono" style="font-size:11px;color:var(--faint);">NOT STARTED</span>';
    return '<span class="mono" style="font-size:11px;font-weight:800;letter-spacing:.5px;color:var(--pg-' + status + ');">' + esc(LABEL[status].toUpperCase()) + '</span>';
  }

  function render() {
    var box = document.getElementById("pfProgress"); if (!box || !GRIDS) return;
    if (!GRIDS.length) { box.innerHTML = ""; return; }
    css();
    var h = '';
    GRIDS.forEach(function (g) {
      var tasks = g.tasks || [], en = g.entries || {};
      var counts = {}; tasks.forEach(function (t) { var s = en[t.code] && en[t.code].status; counts[s || "none"] = (counts[s || "none"] || 0) + 1; });
      var done = counts.done || 0, overdue = g.due_at && new Date(g.due_at) < new Date() && done < tasks.length;
      h += '<div class="card" style="padding:22px;margin-top:20px;">' +
        '<div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:6px;">' +
          '<span class="mono" style="font-size:11px;letter-spacing:1.5px;color:var(--faint);">MY PROGRESS</span>' +
          '<span class="mono" style="font-size:11px;color:var(--dim);">private \u00b7 only you and your teacher can see this</span></div>' +
        '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">' +
          '<div style="font-size:18px;font-weight:800;color:var(--bright);">' + esc(g.title) + '</div>' +
          (g.due_at ? '<span class="mono" style="font-size:12px;color:' + (overdue ? "var(--pg-stuck)" : "var(--dim)") + ';">' + (overdue ? "PAST DUE \u00b7 " : "DUE ") + esc(when(g.due_at)) + '</span>' : '') +
          '<span class="mono" style="margin-left:auto;font-size:13px;font-weight:800;color:var(--pg-done);">' + done + '/' + tasks.length + ' done</span></div>' +
        '<div style="display:flex;height:8px;border-radius:99px;overflow:hidden;background:var(--panel2);margin:12px 0 16px;">' +
          ST.map(function (s) { var n = counts[s[0]] || 0; return n ? '<span title="' + esc(s[1]) + ': ' + n + '" style="flex:' + n + ';background:var(--pg-' + s[0] + ');"></span>' : ''; }).join("") +
          (counts.none ? '<span style="flex:' + counts.none + ';"></span>' : '') + '</div>';
      // daily check-in
      if (g.is_open) {
        h += g.checked_in_today
          ? '<div style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;border:1px solid var(--pg-done);margin-bottom:14px;"><span style="color:var(--pg-done);font-weight:800;">\u2713</span><span style="font-size:14px;color:var(--bright);">Checked in for today.</span><span style="font-size:12px;color:var(--dim);">Update any task below if something changes.</span></div>'
          : '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:14px 16px;border-radius:10px;border:2px solid var(--pg-question);margin-bottom:14px;">' +
              '<span style="flex:1;min-width:200px;"><b style="color:var(--bright);font-size:15px;">Daily check-in</b><span style="display:block;font-size:13px;color:var(--muted);margin-top:2px;">Update your tasks below, or check in if nothing changed today.</span></span>' +
              '<button type="button" data-pg-checkin="' + g.id + '" style="font:inherit;font-size:13px;font-weight:800;min-height:44px;padding:10px 16px;border-radius:10px;border:1px solid var(--pg-question);background:var(--panel2);color:var(--bright);cursor:pointer;">No changes today \u2014 check in</button></div>';
      } else h += '<div style="font-size:13px;color:var(--dim);margin-bottom:14px;">This grid is closed. You can still see your progress.</div>';
      // tasks
      h += '<div style="display:flex;flex-direction:column;gap:0;">';
      tasks.forEach(function (t) {
        var e = en[t.code] || {}, name = "pg_" + g.id + "_" + t.code;
        h += '<fieldset style="border:0;border-top:1px solid var(--border2);margin:0;padding:14px 0;min-width:0;"' + (g.is_open ? '' : ' disabled') + '>' +
          '<legend style="float:left;width:100%;padding:0;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:10px;">' +
            '<span class="mono" style="font-weight:800;color:var(--bright);font-size:14px;">' + esc(t.code) + '</span>' +
            (t.title ? '<span style="color:var(--text);font-size:14px;">' + esc(t.title) + '</span>' : '') +
            '<span style="margin-left:auto;">' + chip(e.status) + (e.by === "teacher" ? ' <span class="mono" style="font-size:10px;color:var(--dim);">\u00b7 set by teacher</span>' : '') + '</span></legend>' +
          '<div role="radiogroup" aria-label="Status for ' + esc(t.code) + '" style="clear:both;display:flex;flex-wrap:wrap;gap:6px;">' +
            ST.map(function (s) {
              var on = e.status === s[0];
              return '<label class="pgOpt" style="position:relative;' + (on ? 'border-color:var(--pg-' + s[0] + ');background:color-mix(in srgb,var(--pg-' + s[0] + ') 16%,var(--panel));' : '') + '">' +
                '<input type="radio" name="' + esc(name) + '" value="' + s[0] + '" data-pg-grid="' + g.id + '" data-pg-task="' + esc(t.code) + '"' + (on ? ' checked' : '') + '>' +
                '<span class="dot" style="background:var(--pg-' + s[0] + ');"></span>' + esc(s[1]) + '</label>';
            }).join("") + '</div>' +
          '<div style="display:flex;gap:8px;margin-top:8px;align-items:flex-start;">' +
            '<label style="flex:1;min-width:0;"><span class="sr-only" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);">Note for ' + esc(t.code) + '</span>' +
            '<input type="text" maxlength="500" value="' + esc(e.note || "") + '" data-pg-note="' + g.id + '|' + esc(t.code) + '" placeholder="Note (optional): your question, what you\u2019re stuck on\u2026" style="width:100%;font:inherit;font-size:13px;min-height:40px;padding:8px 12px;border-radius:9px;border:1px solid var(--border2);background:var(--panel2);color:var(--bright);"></label>' +
            '<span data-pg-saved="' + g.id + '|' + esc(t.code) + '" class="mono" aria-live="polite" style="font-size:11px;color:var(--pg-done);min-width:48px;padding-top:12px;"></span></div>' +
          (e.updated_at ? '<div class="mono" style="font-size:10px;color:var(--faint);margin-top:6px;">updated ' + esc(when(e.updated_at)) + '</div>' : '') +
        '</fieldset>';
      });
      h += '</div>';
      // history
      var log = g.log || [];
      if (log.length) {
        h += '<details style="margin-top:12px;border-top:1px solid var(--border2);padding-top:12px;"><summary style="cursor:pointer;font-size:13px;font-weight:700;color:var(--bright);">My history</summary>' +
          '<ul style="list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:6px;">' +
          log.map(function (l) {
            return '<li style="font-size:12px;color:var(--text);"><span class="mono" style="color:var(--dim);">' + esc(when(l.at)) + '</span> \u00b7 <b style="color:var(--bright);">' + esc(l.task_code) + '</b> ' + (l.status ? chip(l.status) : '<span class="mono" style="font-size:11px;color:var(--faint);">CLEARED</span>') +
              (l.by_who === "teacher" ? ' <span class="mono" style="font-size:10px;color:var(--dim);">(teacher)</span>' : '') + (l.note ? ' \u2014 ' + esc(l.note) : '') + '</li>';
          }).join("") + '</ul>' +
          ((g.checkins || []).length ? '<div class="mono" style="font-size:11px;color:var(--dim);margin-top:10px;">Checked in on ' + g.checkins.length + ' day' + (g.checkins.length === 1 ? '' : 's') + '</div>' : '') +
        '</details>';
      }
      h += '</div>';
    });
    box.innerHTML = h;
    if (location.hash === "#pfProgress" && !render._j) { render._j = 1; window.scrollTo({ top: box.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" }); }
  }

  function gridOf(id) { return (GRIDS || []).filter(function (g) { return g.id === id; })[0]; }
  function flash(key, txt, bad) { var s = document.querySelector('[data-pg-saved="' + key + '"]'); if (s) { s.textContent = txt; s.style.color = bad ? "var(--pg-stuck)" : "var(--pg-done)"; setTimeout(function () { if (s.textContent === txt) s.textContent = ""; }, 2500); } }
  function save(gid, code) {
    var g = gridOf(gid); if (!g) return;
    var key = gid + "|" + code;
    var r = document.querySelector('input[type=radio][data-pg-grid="' + gid + '"][data-pg-task="' + code + '"]:checked');
    var n = document.querySelector('[data-pg-note="' + key + '"]');
    var status = r ? r.value : "", note = n ? n.value : "";
    var cur = (g.entries || {})[code] || {};
    if ((cur.status || "") === status && (cur.note || "") === note) return;
    if (!status) { flash(key, "Pick a status", true); return; }
    if (busy[key]) return; busy[key] = 1;
    flash(key, "Saving\u2026");
    rpc("pg_set", { p_student: sess.studentId, p_grid: gid, p_task: code, p_status: status, p_note: note })
      .then(function () { busy[key] = 0; return load(); })
      .then(function () { flash(key, "Saved \u2713"); })
      .catch(function (e) { busy[key] = 0; flash(key, (e && /closed/.test(e.message)) ? "Grid closed" : "Not saved", true); });
  }
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t.matches && t.matches("input[type=radio][data-pg-grid]")) save(t.getAttribute("data-pg-grid"), t.getAttribute("data-pg-task"));
    else if (t.matches && t.matches("input[data-pg-note]")) { var p = t.getAttribute("data-pg-note").split("|"); save(p[0], p[1]); }
  });
  document.addEventListener("keydown", function (e) {
    var t = e.target;
    if (e.key === "Enter" && t.matches && t.matches("input[data-pg-note]")) { e.preventDefault(); t.blur(); }
  });
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-pg-checkin]"); if (!b) return;
    b.disabled = true; b.textContent = "Checking in\u2026";
    rpc("pg_checkin", { p_student: sess.studentId, p_grid: b.getAttribute("data-pg-checkin") }).then(load).catch(function () { b.disabled = false; b.textContent = "Try again"; });
  });

  function load() {
    return rpc("pg_my_grids", { p_student: sess.studentId }).then(function (d) {
      if (!Array.isArray(d)) return;
      // keep whatever the student is typing in another note box through the re-render
      var a = document.activeElement, key = a && a.getAttribute && a.getAttribute("data-pg-note"), val = key ? a.value : null, pos = key ? a.selectionStart : 0;
      GRIDS = d; lastBox = null; tryRender();
      if (key) { var n = document.querySelector('[data-pg-note="' + key + '"]'); if (n) { n.value = val; n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} } }
    }).catch(function () {});
  }
  function tryRender() { var b = document.getElementById("pfProgress"); if (b && b !== lastBox && GRIDS) { lastBox = b; render(); } }
  function start() {
    new MutationObserver(tryRender).observe(document.body, { childList: true, subtree: true });
    load();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
