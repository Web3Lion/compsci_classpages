/* © 2026 Robert Reasey, South Fayette School District. CC BY-NC 4.0.
   Binary conversion question set for class Vocab Battles + Brackets (30.2).
   Module 0 marks a binary session; mode "plain" = no disguise, students type the answer.
   Terms are the answers ("00101101" or "45"); checked server-side by _vd_norm. */
(function () {
  function b8(n) { return ("00000000" + n.toString(2)).slice(-8); }
  window.BINARY_SET = {
    module: 0,
    modes: ["plain"],
    label: "Binary conversion",
    pool: function () {
      var p = [];
      for (var n = 1; n <= 255; n++) {
        p.push({ t: b8(n), d: "Convert " + n + " (decimal) to 8-bit binary. Type all 8 bits, leading zeros included." });
        p.push({ t: String(n), d: "Convert " + b8(n) + " (binary) to decimal." });
      }
      for (var i = p.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = p[i]; p[i] = p[j]; p[j] = x; }
      return p;
    },
    is: function (mods) { return !!mods && mods.length === 1 && +mods[0] === 0; }
  };
})();
