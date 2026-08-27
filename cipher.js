// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* ============================================================================
   cipher.js  —  the "locked flag" encryption suite.

   A locked flag still shows its TITLE in the clear; its prompt and hint are
   enciphered. A student who wants a head start can crack it early — that's the
   intended reward, not an exploit. The method is chosen deterministically from
   the flag's key, so it never changes between loads, and the method is NOT
   named to the student: figuring out which cipher they're looking at is part
   of the work.

   The teacher answer key uses the same table in reverse, with the method named
   and step-by-step directions.

   Every cipher here is reversible and safe for classroom text.
   ========================================================================== */
(function () {
  /* ---- helpers ----------------------------------------------------------- */
  function isAl(c) { return /[a-z]/i.test(c); }
  function up(c) { return c === c.toUpperCase(); }
  function shiftChar(c, n) {
    if (!isAl(c)) return c;
    var base = up(c) ? 65 : 97;
    return String.fromCharCode((c.charCodeAt(0) - base + n + 26) % 26 + base);
  }

  /* ---- the ciphers ------------------------------------------------------- */
  var CIPHERS = {
    caesar: {
      name: "Caesar shift",
      param: function (seed) { return (seed % 20) + 3; },        // 3..22, never 0/13
      hint: function (n) { return "Every letter slid forward the same number of places."; },
      how: function (n) { return "Caesar cipher, shift +" + n + ". Shift each letter BACK " + n + " places (A\u2192Z wraps). Punctuation and numbers are untouched."; },
      enc: function (s, n) { return s.replace(/[a-z]/gi, function (c) { return shiftChar(c, n); }); },
      dec: function (s, n) { return s.replace(/[a-z]/gi, function (c) { return shiftChar(c, -n); }); }
    },
    rot13: {
      name: "ROT13",
      param: function () { return 13; },
      hint: function () { return "A letter shift that is its own reverse."; },
      how: function () { return "ROT13. Shift every letter 13 places (doing it twice returns the original)."; },
      enc: function (s) { return s.replace(/[a-z]/gi, function (c) { return shiftChar(c, 13); }); },
      dec: function (s) { return s.replace(/[a-z]/gi, function (c) { return shiftChar(c, 13); }); }
    },
    atbash: {
      name: "Atbash",
      param: function () { return 0; },
      hint: function () { return "The alphabet, mirrored end to end."; },
      how: function () { return "Atbash cipher. Mirror the alphabet: A\u2194Z, B\u2194Y, C\u2194X, and so on. Applying it twice restores the text."; },
      enc: function (s) {
        return s.replace(/[a-z]/gi, function (c) {
          var base = up(c) ? 65 : 97;
          return String.fromCharCode(base + (25 - (c.charCodeAt(0) - base)));
        });
      },
      dec: function (s) { return CIPHERS.atbash.enc(s); }
    },
    base64: {
      name: "Base64",
      param: function () { return 0; },
      hint: function () { return "Not a cipher at all \u2014 an encoding. Notice the padding."; },
      how: function () { return "Base64 encoding (not encryption). Decode it with any Base64 decoder, or run atob(\"\u2026\") in the browser console."; },
      enc: function (s) { try { return btoa(unescape(encodeURIComponent(s))); } catch (e) { return s; } },
      dec: function (s) { try { return decodeURIComponent(escape(atob(s))); } catch (e) { return s; } }
    },
    hex: {
      name: "Hexadecimal",
      param: function () { return 0; },
      hint: function () { return "Pairs of characters, base sixteen."; },
      how: function () { return "Hexadecimal bytes, space separated. Convert each pair from base 16 to a character code (48 \u2192 'H')."; },
      enc: function (s) {
        return s.split("").map(function (c) { return c.charCodeAt(0).toString(16).padStart(2, "0"); }).join(" ");
      },
      dec: function (s) {
        return s.trim().split(/\s+/).map(function (h) { return String.fromCharCode(parseInt(h, 16)); }).join("");
      }
    },
    binary: {
      name: "Binary",
      param: function () { return 0; },
      hint: function () { return "Ones and zeroes, eight at a time."; },
      how: function () { return "Binary, 8 bits per character, space separated. Convert each byte to decimal, then read it as an ASCII code (01001000 = 72 = 'H')."; },
      enc: function (s) {
        return s.split("").map(function (c) { return c.charCodeAt(0).toString(2).padStart(8, "0"); }).join(" ");
      },
      dec: function (s) {
        return s.trim().split(/\s+/).map(function (b) { return String.fromCharCode(parseInt(b, 2)); }).join("");
      }
    },
    a1z26: {
      name: "A1Z26",
      param: function () { return 0; },
      hint: function () { return "Letters became their position in the alphabet." },
      how: function () { return "A1Z26 cipher. Each number is a letter's position (1=A \u2026 26=Z). Dashes separate letters, slashes separate words."; },
      enc: function (s) {
        return s.split(/\s+/).map(function (w) {
          return w.split("").map(function (c) {
            if (!isAl(c)) return c;
            return String(c.toLowerCase().charCodeAt(0) - 96);
          }).join("-");
        }).join(" / ");
      },
      dec: function (s) {
        return s.split("/").map(function (w) {
          return w.trim().split("-").map(function (p) {
            p = p.trim();
            return /^\d+$/.test(p) ? String.fromCharCode(+p + 96) : p;
          }).join("");
        }).join(" ");
      }
    },
    reverse: {
      name: "Reversed text",
      param: function () { return 0; },
      hint: function () { return "Try reading it the other way." },
      how: function () { return "The whole message is simply reversed, character by character. Read it right to left."; },
      enc: function (s) { return s.split("").reverse().join(""); },
      dec: function (s) { return s.split("").reverse().join(""); }
    },
    vigenere: {
      name: "Vigen\u00e8re",
      param: function (seed) {
        var keys = ["cipher", "packet", "shadow", "ledger", "syntax", "vector", "kernel", "oracle"];
        return keys[seed % keys.length];
      },
      hint: function () { return "A letter shift \u2014 but the amount keeps changing." },
      how: function (k) { return "Vigen\u00e8re cipher with the keyword \"" + k + "\". Repeat the keyword under the message and subtract each key letter's position (a=0) from the ciphertext letter."; },
      enc: function (s, k) {
        var i = 0;
        return s.replace(/[a-z]/gi, function (c) {
          var n = k[i++ % k.length].toLowerCase().charCodeAt(0) - 97;
          return shiftChar(c, n);
        });
      },
      dec: function (s, k) {
        var i = 0;
        return s.replace(/[a-z]/gi, function (c) {
          var n = k[i++ % k.length].toLowerCase().charCodeAt(0) - 97;
          return shiftChar(c, -n);
        });
      }
    },
    morse: {
      name: "Morse code",
      param: function () { return 0; },
      hint: function () { return "Dots and dashes." },
      how: function () { return "Morse code. Letters are separated by spaces, words by \" / \". Decode with a Morse table."; },
      table: { a:".-",b:"-...",c:"-.-.",d:"-..",e:".",f:"..-.",g:"--.",h:"....",i:"..",j:".---",k:"-.-",l:".-..",m:"--",
               n:"-.",o:"---",p:".--.",q:"--.-",r:".-.",s:"...",t:"-",u:"..-",v:"...-",w:".--",x:"-..-",y:"-.--",z:"--..",
               "0":"-----","1":".----","2":"..---","3":"...--","4":"....-","5":".....","6":"-....","7":"--...","8":"---..","9":"----.",
               ".":".-.-.-",",":"--..--","?":"..--..","'":".----.","/":"-..-.","(":"-.--.",")":"-.--.-",":":"---...",
               "-":"-....-","\"":".-..-.","=":"-...-","+":".-.-.","@":".--.-." },
      enc: function (s) {
        var T = CIPHERS.morse.table;
        return s.toLowerCase().split(/\s+/).map(function (w) {
          return w.split("").map(function (c) { return T[c] || ""; }).filter(Boolean).join(" ");
        }).filter(Boolean).join(" / ");
      },
      dec: function (s) {
        var T = CIPHERS.morse.table, R = {};
        Object.keys(T).forEach(function (k) { R[T[k]] = k; });
        return s.split("/").map(function (w) {
          return w.trim().split(/\s+/).map(function (m) { return R[m] || ""; }).join("");
        }).join(" ");
      }
    }
  };

  /* Deterministic pick. Same flag always gets the same cipher, but the order
     across a module looks arbitrary, so students can't pattern-match by
     position. Order of this list is part of the puzzle — don't sort it. */
  var ORDER = ["caesar", "base64", "atbash", "binary", "vigenere", "reverse", "hex", "a1z26", "rot13", "morse"];

  function seedOf(key) {
    var h = 0, s = String(key || "");
    for (var i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
    return Math.abs(h);
  }
  function methodFor(key) {
    var seed = seedOf(key);
    var id = ORDER[seed % ORDER.length];
    var c = CIPHERS[id];
    return { id: id, name: c.name, param: c.param(seed), seed: seed };
  }
  function encrypt(key, text) {
    if (!text) return "";
    var m = methodFor(key);
    try { return CIPHERS[m.id].enc(String(text), m.param); } catch (e) { return String(text); }
  }
  function decrypt(key, text) {
    if (!text) return "";
    var m = methodFor(key);
    try { return CIPHERS[m.id].dec(String(text), m.param); } catch (e) { return String(text); }
  }
  /* vague, in-character nudge for the student — never names the cipher */
  function teaseFor(key) {
    var m = methodFor(key);
    try { return CIPHERS[m.id].hint(m.param); } catch (e) { return "Something scrambled this."; }
  }
  /* full directions for the teacher answer key */
  function directionsFor(key) {
    var m = methodFor(key);
    var how = "";
    try { how = CIPHERS[m.id].how(m.param); } catch (e) {}
    return { id: m.id, name: m.name, param: m.param, how: how };
  }

  window.CTF_CIPHER = {
    methodFor: methodFor, encrypt: encrypt, decrypt: decrypt,
    teaseFor: teaseFor, directionsFor: directionsFor,
    list: ORDER, ciphers: CIPHERS
  };

  /* ---- ALIEN MASK ---------------------------------------------------------
     A cosmetic "mission gate" shown on the CTF page before a student clicks
     Begin: module names render in an alien glyph alphabet until they do.
     Cracking it early costs nothing and unlocks nothing but bragging rights
     — it's a fun ritual, not a security layer. Each course gets its OWN
     alphabet (seeded from the course id) so periods can't just trade notes.
     The teacher answer key uses the exact same function, so a preview there
     always matches what students see. */
  var ALIEN_GLYPHS = ["ᛝ","ᛟ","ᛞ","ᛗ","ᛚ","ᛃ","ᛇ","ᚼ","ᚦ","ᚨ","ᚱ","ᚲ","ᚷ","ᚹ","ᚻ","ᚾ","ᛁ","ᛈ","ᛉ","ᛊ","ᛏ","ᛒ","ᛖ","⟁","⟐","◈","⬡","⬢","⌬","⏣"];
  function alienSeed(s) {
    var h = 0; s = String(s || "");
    for (var i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
    return Math.abs(h) || 1;
  }
  function alienKeyFor(course) {
    var seed = alienSeed("alien-" + course), a = "abcdefghijklmnopqrstuvwxyz".split(""), g = ALIEN_GLYPHS.slice();
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    for (var i = g.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = g[i]; g[i] = g[j]; g[j] = t; }
    var map = {}; a.forEach(function (ch, i) { map[ch] = g[i % g.length]; });
    return map;
  }
  function alienEncode(course, text) {
    var map = alienKeyFor(course);
    return String(text || "").split("").map(function (c) { var lc = c.toLowerCase(); return map[lc] || c; }).join("");
  }
  window.CTF_ALIEN = { glyphs: ALIEN_GLYPHS, keyFor: alienKeyFor, encode: alienEncode };
})();
