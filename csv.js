/* ============================================================================
   csv.js  —  turns any teacher table into a downloadable CSV.

   Everything on the dashboard is currently trapped behind a login. This makes
   each view exportable so a gradebook entry or a conference printout stops
   being a retyping job.

   Excel is the target, so: UTF-8 BOM (accented handles survive), CRLF line
   endings, and every field quoted. A value starting with = + - or @ is
   prefixed with an apostrophe — otherwise a handle like "-max" is executed as
   a formula when the file is opened.
   ========================================================================== */
(function () {

  function cell(v) {
    if (v === null || v === undefined) return '""';
    var s = String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;      // formula-injection guard
    return '"' + s.replace(/"/g, '""') + '"';
  }

  /* rows: array of arrays, first row is the header */
  function build(rows) {
    return "\ufeff" + (rows || []).map(function (r) {
      return (r || []).map(cell).join(",");
    }).join("\r\n");
  }

  function stamp() {
    var d = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }

  function slug(s) {
    return String(s || "export").toLowerCase().replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "").slice(0, 60) || "export";
  }

  /* download(rows, "objectives", "Period 3") -> period-3-objectives-2026-07-26.csv */
  function download(rows, what, className) {
    var name = [slug(className), slug(what), stamp()].filter(Boolean).join("-") + ".csv";
    var blob = new Blob([build(rows)], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    return name;
  }

  /* the button that appears on every exportable view */
  function button(fnCall, label) {
    return '<button class="btn sm" onclick="' + fnCall + '" title="Download this table as a CSV">' +
      '\u2193 ' + (label || "Export CSV") + '</button>';
  }

  window.CSV = { build: build, download: download, button: button, slug: slug, stamp: stamp };
})();
