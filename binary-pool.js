/* © 2026 Robert Reasey, South Fayette School District. CC BY-NC 4.0.
   Binary question set (30.2; concept questions 31.1; bits ↔ bytes 31.2).
   - pool(): typed set for class Vocab Battles + Brackets. Module 0 marks a binary session;
     mode "plain" = no disguise. Terms are the answers; checked server-side by _vd_norm
     (lowercase alphanumerics, so "4,294,967,295" matches "4294967295"). _vd_pool keeps one
     question per answer, so pool() dedupes here first (concept questions win).
   - mc(): one multiple-choice question for the projector Duel Arena (duel.html).
   - boss(module): randomized MC questions appended to Byte Bounty's boss bank (ctf-data/apcsp.js). */
(function () {
  function b8(n) { return ("00000000" + n.toString(2)).slice(-8); }
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function big(n) { return n.toLocaleString("en-US"); }
  function p2(b) { return Math.pow(2, b); }
  function size(b) {
    if (b % 8 === 0 && Math.random() < 0.6) { var by = b / 8; return by + "-byte"; }
    return b + "-bit";
  }
  function plural(s) { var n = parseInt(s, 10), u = s.indexOf("byte") > 0 ? "byte" : "bit"; return n + " " + u + (n === 1 ? "" : "s"); }
  function bitsFor(level) { return level === "bytes" ? 8 * rnd(1, 4) : rnd(2, 16); }

  /* Each maker returns { kind, diff, q, a (typed answer), show (display answer), wrong:[display] } */
  var MAKERS = {
    max: function (b) {
      b = b || bitsFor(Math.random() < 0.5 ? "bytes" : "bits");
      var s = size(b), q = pick([
        "With a " + s + " number, what is the highest decimal number that can be represented?",
        "What is the largest decimal value a " + s + " unsigned binary number can hold?",
        "What is the largest number that can be represented with " + plural(s) + "?",
        "A counter uses " + (s.indexOf("byte") > 0 ? (b / 8) + " byte" + (b > 8 ? "s" : "") : b + " bits") + ". Starting at 0, what is the biggest number it can reach before it overflows?"
      ]);
      var a = p2(b) - 1;
      return { kind: "max", diff: b > 16 ? "Hard" : "Medium", q: q, a: String(a), show: big(a), wrong: [big(p2(b)), big(p2(b - 1) - 1), big(p2(b - 1)), big(b * b)] };
    },
    count: function (b) {
      b = b || bitsFor(Math.random() < 0.5 ? "bytes" : "bits");
      var s = size(b), q = pick([
        "With a " + s + " number, how many different decimal numbers can be represented?",
        "How many unique values can be stored in a " + s + " binary number?",
        "A " + s + " ID number counts up from 0. How many different IDs can it hand out?",
        "How many numbers can be represented with " + plural(s) + "?",
        "How many different numbers can you represent using " + plural(s) + "?"
      ]);
      var a = p2(b);
      return { kind: "count", diff: b > 16 ? "Hard" : "Medium", q: q, a: String(a), show: big(a), wrong: [big(a - 1), big(p2(b + 1)), big(b * 2), big(p2(b - 1))] };
    },
    parity: function () {
      var len = rnd(4, 8), last = Math.random() < 0.5 ? "0" : "1", bits = [];
      for (var i = 0; i < len - 1; i++) bits.push(Math.random() < 0.65 ? "?" : (Math.random() < 0.5 ? "0" : "1"));
      bits.push(last);
      var pat = bits.join(" "), a = last === "1" ? "odd" : "even";
      var q = pick([
        "Is a binary number in the format " + pat + " even or odd?",
        "Each ? is an unknown bit. Is the binary number " + pat + " even or odd?",
        "You can only see some of the bits: " + pat + ". Even or odd?"
      ]);
      return { kind: "parity", diff: "Easy", q: q, a: a, show: a === "odd" ? "Odd" : "Even", wrong: [a === "odd" ? "Even" : "Odd", "Can't tell without the ? bits", "Depends on the first bit"] };
    },
    step: function () {
      var after = Math.random() < 0.5, n = rnd(after ? 4 : 5, after ? 254 : 255);
      if (Math.random() < 0.45) { var k = rnd(3, 7); n = after ? p2(k) - 1 : p2(k); } /* rollover cases: 111 -> 1000, 1000 -> 111 */
      var bin = n.toString(2), ans = (after ? n + 1 : n - 1).toString(2);
      var q = pick([
        "What number comes " + (after ? "after" : "before") + " " + bin + " in binary?",
        "Counting in binary, what comes right " + (after ? "after" : "before") + " " + bin + "?",
        (after ? "Add 1 to " : "Subtract 1 from ") + "the binary number " + bin + ". What do you get (in binary)?"
      ]);
      var w = {}, wrong = [];
      [(after ? n - 1 : n + 1), n ^ 1, n + (after ? 2 : -2), n ^ 2, parseInt(ans.split("").reverse().join(""), 2), n ^ 4, n + (after ? 3 : -3), n ^ 8].forEach(function (x) {
        var s = x > 0 ? x.toString(2) : null;
        if (s && s !== ans && !w[s] && wrong.length < 3) { w[s] = 1; wrong.push(s); }
      });
      return { kind: "step", diff: bin.length > 6 ? "Medium" : "Easy", q: q + " Type it in binary, no leading zeros.", mcq: q, a: ans, show: ans, wrong: wrong };
    },
    units: function () {
      var toBytes = Math.random() < 0.5, by = pick([1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 32, 64]), bi = by * 8, q, a, wrong;
      if (toBytes) {
        q = pick(["How many bytes is " + bi + " bits?", bi + " bits is how many bytes?", "A file is " + bi + " bits. How many bytes is that?"]);
        a = by; wrong = [bi * 8, by * 2, bi / 4, by + 8, by * 4, bi, by + 1];
      } else {
        q = pick(["How many bits are in " + by + " byte" + (by > 1 ? "s" : "") + "?", by + " byte" + (by > 1 ? "s" : "") + " is how many bits?", "A value takes up " + by + " byte" + (by > 1 ? "s" : "") + ". How many bits is that?"]);
        a = bi; wrong = [by * 4, bi * 2, by * 10, bi + 8, by, bi * 4, bi - 8];
      }
      return { kind: "units", diff: by > 8 ? "Medium" : "Easy", q: q, a: String(a), show: big(a), wrong: wrong.map(big) };
    },
    bits: function () {
      var n = rnd(2, 1000), a = n.toString(2).length;
      var q = pick([
        "What is the fewest bits needed to represent the decimal number " + n + "?",
        "How many bits does it take to write " + n + " in binary?"
      ]);
      return { kind: "bits", diff: n > 255 ? "Hard" : "Medium", q: q, a: String(a), show: String(a), wrong: [String(a - 1), String(a + 1), String(a === 8 ? 10 : 8), String(a + 2)] };
    }
  };
  var KINDS = ["max", "count", "parity", "step", "units", "units", "bits"];
  function uniq(arr, show) { var seen = {}, out = []; arr.forEach(function (x) { if (x !== show && !seen[x]) { seen[x] = 1; out.push(x); } }); return out.slice(0, 3); }
  function asMC(c) {
    var wrong = uniq(c.wrong, c.show);
    return { question: c.mcq || c.q.replace(/ Type it in binary, no leading zeros\.$/, ""), options: shuffle([c.show].concat(wrong)), answer: c.show, diff: c.diff, kind: c.kind };
  }
  function conversion() {
    var n = rnd(1, 255), d2b = Math.random() < .5, set = {}, wrong = [];
    set[n] = 1;
    var cands = [n ^ 1, n ^ 2, n ^ 4, n ^ 8, n ^ 16, n ^ 32, n ^ 64, n ^ 128, n + 1, n - 1, parseInt(b8(n).split("").reverse().join(""), 2)];
    shuffle(cands).forEach(function (x) { if (wrong.length < 3 && x >= 0 && x <= 255 && !set[x]) { set[x] = 1; wrong.push(x); } });
    var fmt = d2b ? b8 : String;
    return { question: d2b ? "Convert " + n + " (decimal) to binary." : "Convert " + b8(n) + " (binary) to decimal.",
      options: shuffle([fmt(n)].concat(wrong.map(fmt))), answer: fmt(n) };
  }

  window.BINARY_SET = {
    module: 0,
    modes: ["plain"],
    label: "Binary",
    pool: function () {
      var p = [], b;
      for (b = 2; b <= 32; b++) { p.push(MAKERS.max(b)); p.push(MAKERS.count(b)); }
      for (var i = 0; i < 60; i++) p.push(MAKERS.step());
      for (i = 0; i < 6; i++) p.push(MAKERS.parity());
      for (i = 0; i < 20; i++) p.push(MAKERS.bits());
      for (i = 0; i < 30; i++) p.push(MAKERS.units());
      p = p.map(function (c) { return { t: c.a, d: c.q }; });
      var conv = [];
      for (var n = 1; n <= 255; n++) {
        conv.push({ t: b8(n), d: "Convert " + n + " (decimal) to 8-bit binary. Type all 8 bits, leading zeros included." });
        conv.push({ t: String(n), d: "Convert " + b8(n) + " (binary) to decimal." });
      }
      p = shuffle(p).concat(shuffle(conv).slice(0, 110));
      var seen = {}, out = [];
      p.forEach(function (e) { var k = e.t.toLowerCase().replace(/[^a-z0-9]/g, ""); if (!seen[k]) { seen[k] = 1; out.push(e); } });
      return shuffle(out);
    },
    mc: function () { return Math.random() < 0.4 ? conversion() : asMC(MAKERS[pick(KINDS)]()); },
    boss: function (module) {
      var list = [MAKERS.max(8 * rnd(2, 4)), MAKERS.max(rnd(3, 12)), MAKERS.count(8 * rnd(1, 4)), MAKERS.count(rnd(3, 12)),
        MAKERS.parity(), MAKERS.parity(), MAKERS.step(), MAKERS.step(), MAKERS.units(), MAKERS.units(), MAKERS.bits()];
      return list.map(function (c) { var m = asMC(c); return { module: module, topic: "M" + module, diff: m.diff, kind: "mc", prompt: m.question, choices: m.options, answer: m.answer }; });
    },
    is: function (mods) { return !!mods && mods.length === 1 && +mods[0] === 0; }
  };
})();
