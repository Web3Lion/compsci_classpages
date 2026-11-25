// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* clue-img.js (v38.1) — shows an image link inside a sheet question as a picture.
   CLUE(text, maxH) → escaped text (link removed) + <img>. First link only.
   Works with image URLs (.png .jpg .gif .webp .svg), googleusercontent links and
   Google Drive file links (shown through drive.google.com/thumbnail; the file must
   be shared "Anyone with the link"). Used by Ping Rush, Mane Event and King of the Pride. */
(function () {
  var RE = /(https?:\/\/(?:[^\s"<>\/]+\.)?(?:drive\.google\.com|[^\s"<>\/]*googleusercontent\.com)\/[^\s"<>]+|https?:\/\/[^\s"<>]+?\.(?:png|jpe?g|gif|webp|svg)(?:\?[^\s"<>]*)?)/i;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function src(u) {
    var id = (u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/) || [])[1];
    return id ? "https://drive.google.com/thumbnail?id=" + id + "&sz=w1600" : u;
  }
  window.CLUE = function (text, maxH) {
    var t = String(text == null ? "" : text), m = t.match(RE);
    if (!m) return esc(t);
    var rest = t.replace(m[1], "").replace(/[ \t]+\n/g, "\n").trim();
    return esc(rest) + '<img src="' + esc(src(m[1])) + '" alt="Question image" loading="eager" style="display:block;margin:' + (rest ? '12px' : '0') + ' auto 0;max-width:100%;max-height:' + (maxH || "40vh") + ';border-radius:12px;background:#fff;object-fit:contain;">';
  };
  window.CLUE.has = function (text) { return RE.test(String(text || "")); };
  window.CLUE.strip = function (text) { var t = String(text || ""), m = t.match(RE); return m ? t.replace(m[1], "").trim() : t; };
})();
