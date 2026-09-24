// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* ============================================================================
   profile-link.js  —  drops a "My Profile" entry into the Quick Links list,
   but only for a student who is actually signed in to THAT course.

   The arena is the only page that requires a sign-in, so every other page has
   to discover the session on its own: it reads the per-course session cache
   that sync.js writes (ctf-sess-<course>). No network call, no flash of a link
   that shouldn't be there.

   Course is inferred from the folder, so the same file works everywhere with
   no per-page configuration. Include it on any page that has a Quick Links
   card; it is a no-op when there's no list or no session.
   ========================================================================== */
(function () {
  function courseId() {
    if (window.CTF_COURSE) return window.CTF_COURSE;
    var m = location.pathname.match(/\/(cyber1|cyber2|apcsp|web3)\//);
    return m ? m[1] : null;
  }
  function session(course) {
    try { return JSON.parse(localStorage.getItem("ctf-sess-" + course)) || null; }
    catch (e) { return null; }
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function mount() {
    var course = courseId(); if (!course) return;
    if (document.getElementById("qlProfile")) return;
    var sess = session(course); if (!sess || !sess.handle) return;

    // the quick-links list is the flex column holding the .qlink anchors
    var first = document.querySelector("a.qlink");
    if (!first || !first.parentNode) return;
    var list = first.parentNode;

    // match whatever the page's own links look like so this never reads bolted-on
    var a = document.createElement("a");
    a.className = "qlink";
    a.id = "qlProfile";
    a.href = "profile.html";
    a.setAttribute("style", first.getAttribute("style") || "");
    a.style.borderColor = "var(--accent)";
    a.innerHTML =
      '<span style="flex:none;font-size:18px;line-height:1;">\u25c8</span>' +
      '<span style="min-width:0;">' +
        '<span style="display:block;font-weight:700;color:var(--bright);">My Profile</span>' +
        '<span class="mono" style="display:block;font-size:11px;color:var(--dim);margin-top:2px;">' +
          esc(sess.handle) + ' \u00b7 XP, badges, leaderboard</span>' +
      '</span>';
    list.insertBefore(a, first);
    checkRewards(course, sess, a);
  }

  /* New-reward notice: teacher/spinner items the student hasn't looked at yet.
     "Seen" is set by profile.js when the Items card is clicked. */
  function unseen(items, course) {
    var seen = +localStorage.getItem("ctf-items-seen-" + course) || 0;
    return (items || []).filter(function (it) {
      return !it.shared && !it.used_at && (it.source === "teacher" || it.source === "spinner") &&
        new Date(it.created_at).getTime() > seen;
    });
  }
  function token() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (/^sb-.*-auth-token$/.test(k)) { var v = JSON.parse(localStorage.getItem(k)); return v && (v.access_token || (v.currentSession && v.currentSession.access_token)); }
      }
    } catch (e) {}
    return null;
  }
  function checkRewards(course, sess, link) {
    var cached; try { cached = JSON.parse(localStorage.getItem("ctf-items-" + course)); } catch (e) {}
    if (cached) show(unseen(cached, course), link);
    var C = window.SUPABASE_CONFIG || {}, t = token();
    if (!C.url || !C.anonKey || !t || !sess.studentId) return;
    fetch(C.url + "/rest/v1/rpc/ctf_my_items", {
      method: "POST",
      headers: { apikey: C.anonKey, Authorization: "Bearer " + t, "Content-Type": "application/json" },
      body: JSON.stringify({ p_student: sess.studentId })
    }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !Array.isArray(d.items)) return;
      try { localStorage.setItem("ctf-items-" + course, JSON.stringify(d.items)); } catch (e) {}
      show(unseen(d.items, course), link);
    }).catch(function () {});
  }
  function show(list, link) {
    var old = document.getElementById("rwNotice");
    if (!list.length) { if (old) old.remove(); link.style.animation = ""; return; }
    if (!document.getElementById("rwCss")) {
      var st = document.createElement("style"); st.id = "rwCss";
      st.textContent = "@keyframes rwGlow{0%,100%{box-shadow:0 0 0 0 color-mix(in oklch,var(--accent) 0%,transparent)}50%{box-shadow:0 0 28px 3px color-mix(in oklch,var(--accent) 70%,transparent)}}";
      document.head.appendChild(st);
    }
    link.style.animation = "rwGlow 1.8s ease-in-out infinite";
    var n = list.length, names = list.slice(0, 3).map(function (it) { return esc(it.label || it.kind); }).join(", ") + (n > 3 ? " +" + (n - 3) + " more" : "");
    var card = old || document.createElement("a");
    card.id = "rwNotice"; card.className = "card"; card.href = "profile.html#pfItems";
    card.setAttribute("style", "display:flex;align-items:center;gap:16px;text-decoration:none;color:inherit;border-color:var(--accent);animation:rwGlow 1.8s ease-in-out infinite;");
    card.innerHTML =
      '<span style="flex:none;font-size:26px;line-height:1;color:var(--accent);">\u2726</span>' +
      '<span style="min-width:0;flex:1;">' +
        '<span class="mono" style="display:block;font-size:12px;letter-spacing:1.5px;color:var(--accent);">// NEW REWARD' + (n > 1 ? "S" : "") + '</span>' +
        '<span style="display:block;font-size:16px;font-weight:700;color:var(--bright);margin-top:4px;">Your teacher sent you ' + (n > 1 ? n + " items" : "an item") + '</span>' +
        '<span style="display:block;font-size:13px;color:var(--muted);margin-top:3px;">' + names + '</span>' +
      '</span>' +
      '<span class="mono" style="flex:none;font-size:12px;font-weight:700;color:var(--accent);border:1px solid var(--accent);padding:8px 12px;border-radius:999px;">CHECK YOUR PROFILE \u2192</span>';
    if (!old) {
      var firstCard = document.querySelector(".card");
      if (firstCard && firstCard.parentNode) firstCard.parentNode.insertBefore(card, firstCard);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
