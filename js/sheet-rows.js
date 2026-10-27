// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* sheet-rows.js (v31.4) — reads a course's schedule tab from Google Sheets with its links intact.
   SHEET_ROWS.load(id, gid) → Promise<rows[][]>. Source is the sheet's htmlview table (keeps Ctrl+K links,
   HYPERLINK() formulas and hard returns); falls back to the gviz CSV if that can't be read.
   Links are carried inside cell strings as \u0001url\u0002text\u0003 so the pages' existing column logic works.
   SHEET_ROWS.rich(s) → safe HTML (links + bare URLs clickable, hard returns → <br>). SHEET_ROWS.plain(s) → text only. */
(function () {
  var A = "\u0001", B = "\u0002", C = "\u0003", TOK = /\u0001([^\u0002]*)\u0002([^\u0003]*)\u0003/g;
  function esc(s) { return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function unwrap(h) {
    try { var u = new URL(h, "https://docs.google.com/"); if (/(^|\.)google\.com$/.test(u.hostname) && u.pathname === "/url" && u.searchParams.get("q")) return u.searchParams.get("q"); return u.href; }
    catch (e) { return ""; }
  }
  function safe(h) { return /^(https?:|mailto:)/i.test(h) ? h : ""; }
  function cellText(n) {
    var out = "";
    n.childNodes.forEach(function (c) {
      if (c.nodeType === 3) out += c.nodeValue;
      else if (c.nodeType === 1) {
        var t = c.tagName;
        if (t === "BR") out += "\n";
        else if (t === "A") {
          var h = safe(unwrap(c.getAttribute("href") || "")), txt = cellText(c).replace(TOK, "$2");
          if (!h) { out += txt; return; }
          out += txt.split("\n").map(function (p) { return p.trim() ? A + h + B + p + C : p; }).join("\n");
        }
        else if (t !== "STYLE" && t !== "SCRIPT") { var inner = cellText(c); out += (t === "DIV" && out && !/\n$/.test(out) ? "\n" : "") + inner; }
      }
    });
    return out;
  }
  function fromHtml(html) {
    var d = new DOMParser().parseFromString(html, "text/html"), t = d.querySelector("table.waffle") || d.querySelector("table");
    if (!t) return null;
    var grid = [], ri = 0;
    Array.prototype.forEach.call(t.querySelectorAll("tbody > tr"), function (tr) {
      if (/freezebar/.test(tr.className)) return;
      var row = grid[ri] = grid[ri] || [], ci = 0;
      Array.prototype.forEach.call(tr.children, function (td) {
        if (td.tagName !== "TD" || /freezebar/.test(td.className)) return;
        while (row[ci] !== undefined) ci++;
        var cs = +td.getAttribute("colspan") || 1, rs = +td.getAttribute("rowspan") || 1, v = cellText(td).replace(/\u00a0/g, " ");
        for (var r = 0; r < rs; r++) { var R = grid[ri + r] = grid[ri + r] || []; for (var k = 0; k < cs; k++) R[ci + k] = (r === 0 && k === 0) ? v : ""; }
        ci += cs;
      });
      ri++;
    });
    return grid.map(function (r) { var o = []; for (var i = 0; i < r.length; i++) o.push(r[i] || ""); return o; });
  }
  function parseCSV(text) {
    var rows = [], row = [], cur = "", q = false;
    for (var i = 0; i < text.length; i++) { var c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else { if (c === '"') q = true; else if (c === ",") { row.push(cur); cur = ""; } else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; } else if (c !== "\r") cur += c; } }
    if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
    return rows;
  }
  async function load(id, gid) {
    var base = "https://docs.google.com/spreadsheets/d/" + id;
    try {
      var r = await fetch(base + "/htmlview/sheet?headers=false&gid=" + encodeURIComponent(gid || "0"), { cache: "no-store" });
      if (r.ok) { var g = fromHtml(await r.text()); if (g && g.some(function (x) { return x.some(function (c) { return /weekday/i.test(c); }); })) return g; }
    } catch (e) {}
    var res = await fetch(base + "/gviz/tq?tqx=out:csv&gid=" + encodeURIComponent(gid || "0"), { cache: "no-store" });
    if (!res.ok) throw new Error("sheet");
    return parseCSV(await res.text());
  }
  var STY = "color:inherit;text-decoration:underline;text-underline-offset:2px;font-weight:700;";
  function a(h, t) { return '<a href="' + esc(h) + '" target="_blank" rel="noopener" style="' + STY + '">' + t + "</a>"; }
  function bare(s) { return esc(s).replace(/\b(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])/g, function (u) { return a(u.replace(/&amp;/g, "&"), u); }); }
  function rich(s) {
    s = String(s || ""); var out = "", last = 0, m; TOK.lastIndex = 0;
    while ((m = TOK.exec(s))) { out += bare(s.slice(last, m.index)) + a(m[1], esc(m[2])); last = TOK.lastIndex; }
    return (out + bare(s.slice(last))).replace(/\n/g, "<br>");
  }
  function plain(s) { return String(s || "").replace(TOK, "$2"); }
  window.SHEET_ROWS = { load: load, rich: rich, plain: plain };
})();
