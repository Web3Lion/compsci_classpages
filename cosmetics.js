// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* ============================================================================
   cosmetics.js  —  Coins + titles / name colors / frames (v2.0).

   Coins come from XP milestones (1 per 250 XP) and teacher grants, and are
   spent in the profile Coin Shop. Prices here MUST match _cosmetic_price() in
   supabase/coins-cosmetics.sql — the server is the one that charges.

   Exposes window.CTF_COSMETICS:
     .catalog                  every item
     .item(id)                 one item
     .nameStyle(eq)            inline CSS for a handle (color slot)
     .titleHtml(eq)            small title line under a handle
     .frameClass(eq)           class for a leaderboard row / card
     .css()                    injects the frame keyframes once
     .forClass(classId)        Promise<{handle(lowercase): equipped}>
     .mountShop(el)            profile Coin Shop card
   ========================================================================== */
(function () {
  var CATALOG = [
    { id: "t_script_kiddie",  slot: "title", name: "Script Kiddie",      price: 1 },
    { id: "t_packet_sniffer", slot: "title", name: "Packet Sniffer",     price: 2 },
    { id: "t_bit_flipper",    slot: "title", name: "Bit Flipper",        price: 2 },
    { id: "t_null_pointer",   slot: "title", name: "Null Pointer",       price: 3 },
    { id: "t_kernel_panic",   slot: "title", name: "Kernel Panic",       price: 3 },
    { id: "t_honeypot",       slot: "title", name: "Honeypot",           price: 3 },
    { id: "t_the_patch",      slot: "title", name: "The Patch",          price: 3 },
    { id: "t_cryptkeeper",    slot: "title", name: "Cryptkeeper",        price: 4 },
    { id: "t_root_access",    slot: "title", name: "Root Access",        price: 4 },
    { id: "t_zero_day",       slot: "title", name: "Zero Day",           price: 5 },
    { id: "t_ghost_shell",    slot: "title", name: "Ghost in the Shell", price: 6 },
    { id: "t_legend",         slot: "title", name: "Legend",             price: 10 },
    { id: "c_mint",   slot: "color", name: "Neon Mint",    price: 2, dark: "#3ddc84", light: "#137a3c" },
    { id: "c_ice",    slot: "color", name: "Ice Blue",     price: 2, dark: "#6fd6ff", light: "#0b6a95" },
    { id: "c_pink",   slot: "color", name: "Cyber Pink",   price: 2, dark: "#ff5fd2", light: "#b0187f" },
    { id: "c_gold",   slot: "color", name: "Laser Gold",   price: 3, dark: "#ffcf3f", light: "#8a6100" },
    { id: "c_plasma", slot: "color", name: "Plasma",       price: 3, dark: "#b98bff", light: "#6a2fd0" },
    { id: "c_aurora", slot: "color", name: "Aurora",       price: 6, grad: ["#3ddc84", "#6fd6ff", "#ff5fd2"], gradLight: ["#137a3c", "#0b6a95", "#b0187f"] },
    { id: "f_pulse",   slot: "frame", name: "Pulse",   price: 4 },
    { id: "f_glitch",  slot: "frame", name: "Glitch",  price: 4 },
    { id: "f_circuit", slot: "frame", name: "Circuit", price: 5 },
    { id: "f_gold",    slot: "frame", name: "Gold",    price: 8 }
  ];
  var BY = {}; CATALOG.forEach(function (c) { BY[c.id] = c; });
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function light() { return document.documentElement.getAttribute("data-theme") === "light"; }

  function nameStyle(eq) {
    var c = eq && BY[eq.color]; if (!c) return "";
    if (c.grad) {
      var g = light() ? c.gradLight : c.grad;
      return "background:linear-gradient(90deg," + g.join(",") + ");-webkit-background-clip:text;background-clip:text;color:transparent;";
    }
    return "color:" + (light() ? c.light : c.dark) + ";";
  }
  function titleHtml(eq, size) {
    var t = eq && BY[eq.title]; if (!t) return "";
    return '<span class="cosTitle" style="display:block;font-family:\'JetBrains Mono\',monospace;font-size:' + (size || 11) + 'px;letter-spacing:1.5px;text-transform:uppercase;color:var(--faint);font-weight:700;margin-top:2px;">' + esc(t.name) + '</span>';
  }
  function frameClass(eq) { var f = eq && BY[eq.frame]; return f ? "cosF-" + f.id.slice(2) : ""; }
  function css() {
    if (document.getElementById("cosCss")) return;
    var st = document.createElement("style"); st.id = "cosCss";
    st.textContent =
      "@keyframes cosPulse{0%,100%{box-shadow:0 0 0 1px var(--accent),0 0 0 0 color-mix(in oklab,var(--accent) 50%,transparent)}50%{box-shadow:0 0 0 1px var(--accent),0 0 18px 2px color-mix(in oklab,var(--accent) 50%,transparent)}}" +
      "@keyframes cosGlitch{0%,92%,100%{box-shadow:0 0 0 1px #ff5fd2,0 0 0 0 transparent}94%{box-shadow:-3px 0 0 1px #ff5fd2,3px 0 0 1px #6fd6ff}97%{box-shadow:3px 0 0 1px #ff5fd2,-3px 0 0 1px #6fd6ff}}" +
      ".cosF-pulse{animation:cosPulse 2.4s ease-in-out infinite;}" +
      ".cosF-glitch{animation:cosGlitch 3.2s steps(1) infinite;}" +
      ".cosF-circuit{border-style:dashed !important;border-color:var(--accent2,var(--accent)) !important;}" +
      ".cosF-gold{border-color:#ffcf3f !important;box-shadow:0 0 0 1px #ffcf3f,inset 0 0 22px -12px #ffcf3f;}" +
      ":root[data-theme='light'] .cosF-gold{border-color:#8a6100 !important;box-shadow:0 0 0 1px #8a6100;}" +
      "@media (prefers-reduced-motion:reduce){.cosF-pulse,.cosF-glitch{animation:none;box-shadow:0 0 0 1px var(--accent);}}" +
      ":root[data-motion='reduce'] .cosF-pulse,:root[data-motion='reduce'] .cosF-glitch{animation:none;box-shadow:0 0 0 1px var(--accent);}";
    document.head.appendChild(st);
  }
  function forClass(classId) {
    var AUTH = window.CTF_AUTH;
    if (!AUTH || !AUTH.online || !classId) return Promise.resolve({});
    return AUTH.rpc("ctf_class_cosmetics", { p_class: classId }).then(function (rows) {
      var map = {}; (Array.isArray(rows) ? rows : []).forEach(function (r) { map[String(r.handle).toLowerCase()] = r.equipped || {}; });
      return map;
    }).catch(function () { return {}; });
  }

  /* ---- profile Coin Shop ---------------------------------------------------- */
  function mountShop(box) {
    if (!box) return;
    var AUTH = window.CTF_AUTH, API = window.CTF || {};
    var course = window.CTF_COURSE || API.course || "cyber1";
    var sess = null; try { sess = JSON.parse(localStorage.getItem("ctf-sess-" + course)); } catch (e) {}
    if (!AUTH || !AUTH.online || !sess) return;
    css();
    var ST = null, TAB = "title", busy = false, msg = "";
    function load() {
      AUTH.rpc("ctf_my_coins", { p_student: sess.studentId }).then(function (d) {
        if (!d || d.error) return; ST = d; paint();
      }).catch(function () { /* coins-cosmetics.sql not run yet: stay hidden */ });
    }
    function owned(id) { return ST && (ST.owned || []).indexOf(id) !== -1; }
    function equipped(slot) { return ST && ST.equipped ? ST.equipped[slot] : null; }
    function preview(it) {
      var eq = {}; eq[it.slot] = it.id;
      var handle = esc(sess.handle || "you");
      if (it.slot === "title") return '<span style="font-weight:700;color:var(--bright);">' + handle + '</span>' + titleHtml(eq, 10);
      if (it.slot === "color") return '<span style="font-weight:800;' + nameStyle(eq) + '">' + handle + '</span>';
      return '<span class="' + frameClass(eq) + '" style="display:inline-block;padding:6px 12px;border-radius:8px;border:1px solid var(--border2);font-weight:700;color:var(--bright);">' + handle + '</span>';
    }
    function paint() {
      if (!ST) return;
      var per = ST.per || 250, into = ST.xp % per, pct = Math.round(into / per * 100);
      var tabs = [["title", "Titles"], ["color", "Name colors"], ["frame", "Frames"]].map(function (t) {
        var on = TAB === t[0];
        return '<button type="button" class="cosTab mono" data-t="' + t[0] + '" aria-pressed="' + on + '" style="font-size:12px;font-weight:700;padding:9px 14px;min-height:40px;border-radius:999px;cursor:pointer;border:1px solid ' + (on ? "var(--accent)" : "var(--border2)") + ';background:' + (on ? "var(--accent)" : "transparent") + ';color:' + (on ? "var(--bg)" : "var(--dim)") + ';">' + t[1] + '</button>';
      }).join("");
      var items = CATALOG.filter(function (c) { return c.slot === TAB; }).map(function (it) {
        var own = owned(it.id), on = equipped(it.slot) === it.id, afford = ST.balance >= it.price;
        var btn = on
          ? '<button type="button" class="cosAct mono" data-a="unequip" data-id="' + it.id + '" style="' + btnCss("var(--accent)", true) + '">EQUIPPED \u2713</button>'
          : own
            ? '<button type="button" class="cosAct mono" data-a="equip" data-id="' + it.id + '" style="' + btnCss("var(--accent)") + '">EQUIP</button>'
            : '<button type="button" class="cosAct mono" data-a="buy" data-id="' + it.id + '"' + (afford ? "" : " disabled") + ' aria-label="Buy ' + esc(it.name) + ' for ' + it.price + ' coins" style="' + btnCss("var(--amber)") + (afford ? "" : "opacity:.45;cursor:not-allowed;") + '">\u25C9 ' + it.price + '</button>';
        return '<div style="display:flex;flex-direction:column;gap:10px;padding:14px;border-radius:12px;border:1px solid ' + (on ? "var(--accent)" : "var(--border2)") + ';background:var(--bg);">' +
          '<div style="min-height:40px;display:flex;flex-direction:column;justify-content:center;">' + preview(it) + '</div>' +
          '<div style="display:flex;align-items:center;gap:8px;"><span style="flex:1;min-width:0;font-size:13px;font-weight:600;color:var(--text);">' + esc(it.name) + '</span>' + btn + '</div></div>';
      }).join("");
      box.innerHTML = '<div class="card" style="padding:22px;margin-top:20px;">' +
        '<div style="display:flex;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:14px;">' +
          '<div style="flex:1;min-width:200px;"><div class="mono" style="font-size:11px;letter-spacing:1.5px;color:var(--faint);margin-bottom:6px;">COIN SHOP</div>' +
          '<div style="font-size:13px;color:var(--dim);line-height:1.55;max-width:520px;">Every ' + per + ' XP earns a coin. Spend coins on titles, name colors and frames that show on the leaderboard and in duels. Buying never costs XP.</div></div>' +
          '<div style="text-align:right;"><div class="mono" style="font-size:28px;font-weight:800;color:var(--amber);line-height:1;" aria-label="' + ST.balance + ' coins">\u25C9 ' + ST.balance + '</div>' +
          '<div class="mono" style="font-size:11px;color:var(--dim);margin-top:6px;">next coin at ' + ST.next_at + ' XP</div>' +
          '<div role="progressbar" aria-label="Progress to next coin" aria-valuemin="0" aria-valuemax="' + per + '" aria-valuenow="' + into + '" style="margin-top:6px;width:160px;height:6px;border-radius:99px;background:var(--bg);border:1px solid var(--border2);overflow:hidden;margin-left:auto;"><div style="height:100%;width:' + pct + '%;background:var(--amber);"></div></div></div>' +
        '</div>' +
        '<div role="group" aria-label="Shop categories" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">' + tabs + '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px;">' + items + '</div>' +
        '<div class="mono" id="cosMsg" role="status" aria-live="polite" style="font-size:11px;color:var(--faint);margin-top:12px;min-height:14px;">' + esc(msg) + '</div>' +
      '</div>';
      box.querySelectorAll(".cosTab").forEach(function (b) { b.onclick = function () { TAB = b.getAttribute("data-t"); msg = ""; paint(); }; });
      box.querySelectorAll(".cosAct").forEach(function (b) { b.onclick = function () { act(b.getAttribute("data-a"), b.getAttribute("data-id")); }; });
    }
    function btnCss(col, solid) {
      return "flex:none;font-size:11px;font-weight:800;letter-spacing:.5px;padding:8px 12px;min-height:36px;border-radius:8px;cursor:pointer;border:1px solid " + col + ";background:" + (solid ? col : "transparent") + ";color:" + (solid ? "var(--bg)" : col) + ";";
    }
    function act(a, id) {
      if (busy) return; var it = BY[id]; if (!it) return;
      if (a === "buy" && !confirm("Buy \u201c" + it.name + "\u201d for " + it.price + " coin" + (it.price === 1 ? "" : "s") + "?")) return;
      busy = true;
      var p = a === "buy" ? AUTH.rpc("ctf_buy_cosmetic", { p_student: sess.studentId, p_item: id })
        : AUTH.rpc("ctf_equip_cosmetic", { p_student: sess.studentId, p_slot: it.slot, p_item: a === "equip" ? id : null });
      p.then(function (d) {
        busy = false;
        if (!d || d.error) { msg = d && d.error === "not_enough_coins" ? "Not enough coins yet." : "Couldn\u2019t do that (" + ((d && d.error) || "error") + ")."; paint(); return; }
        ST = d; msg = a === "buy" ? "Bought " + it.name + "." : a === "equip" ? it.name + " equipped." : it.name + " removed."; paint();
      }).catch(function (e) { busy = false; msg = "Couldn\u2019t reach the server."; paint(); });
    }
    load();
  }

  window.CTF_COSMETICS = { catalog: CATALOG, item: function (id) { return BY[id] || null; }, nameStyle: nameStyle, titleHtml: titleHtml, frameClass: frameClass, css: css, forClass: forClass, mountShop: mountShop };
})();
