// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* Anonymous card-click counter (supabase/tool-clicks.sql).
   Any element with data-track="Card name" counts a click on itself or on a
   link/button inside it. The button's text is stored as the action.
   Needs supabase-config.js loaded first. Fails silently if the SQL isn't run. */
(function () {
  var C = window.SUPABASE_CONFIG;
  if (!C || !C.url || !C.anonKey) return;
  var page = (document.body && document.body.getAttribute("data-track-page")) ||
             location.pathname.replace(/^.*compsci_classpages\//, "").replace(/index\.html$/, "") || "/";
  function send(card, action) {
    try {
      fetch(C.url.replace(/\/$/, "") + "/rest/v1/rpc/ctf_log_tool_click", {
        method: "POST", keepalive: true,
        headers: { "Content-Type": "application/json", apikey: C.anonKey, Authorization: "Bearer " + C.anonKey },
        body: JSON.stringify({ p_page: page, p_card: card, p_action: action || null })
      }).catch(function () {});
    } catch (e) {}
  }
  document.addEventListener("click", function (e) {
    var box = e.target.closest && e.target.closest("[data-track]");
    if (!box) return;
    var hit = e.target.closest("a, button");
    if (!hit || !box.contains(hit)) return;
    var action = hit === box ? "Open" : (hit.getAttribute("data-track-action") || hit.textContent || "").replace(/[→\s]+$/g, "").replace(/\s+/g, " ").trim();
    send(box.getAttribute("data-track"), action);
  }, true);
})();
