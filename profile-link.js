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
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
