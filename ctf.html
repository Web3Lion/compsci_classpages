/* PROOF OF WORK page intros (Web 3.0) — blockchain-themed transitions,
   the counterpart to the cyber hacker-glitch. Self-contained, no deps.
   A random variant plays once per page load on the CTF arena AND the formal
   course pages (index / vocab / syllabus / news). Guide: ORACLE. */
(function () {
  /* The animation is course flavour and always plays. The guide's NAME is the
     only part that waits for the teacher's switch — until then the readout is
     labelled neutrally, so students meet the character for the first time in
     the arrival scene, not in a page transition. */
  function guideLabel() {
    var awake = false;
    try {
      if (window.CTF_PERSONA === true) awake = true;
      else {
        var m = location.pathname.match(/\/(cyber1|cyber2|apcsp|web3)\//);
        var cached = m ? localStorage.getItem("ctf-persona-" + m[1]) : null;
        var cfg = window.SUPABASE_CONFIG || {};
        awake = cached !== null ? cached === "1" : !(cfg.url && cfg.anonKey);
      }
    } catch (e) {}
    return awake ? "ORACLE" : "NETWORK";
  }
  function run() {
    var WHO = guideLabel();
    if (window.__consensusIntroDone) return;
    window.__consensusIntroDone = true;

    var cs = getComputedStyle(document.documentElement);
    var accent = (cs.getPropertyValue('--accent') || '#f7931a').trim();
    var accent2 = (cs.getPropertyValue('--accent2') || '#ffb454').trim();
    var isLight = document.documentElement.getAttribute('data-theme') === 'light';
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var mono = "'JetBrains Mono',ui-monospace,monospace";
    var dimc = isLight ? '#7a6e5b' : '#93846f';
    var dimNode = isLight ? 'rgba(122,110,91,.55)' : 'rgba(147,132,111,.5)';

    function build() {
      var host = document.createElement('div');
      host.id = 'consensusIntro';
      host.style.cssText = 'position:fixed;inset:0;z-index:12500;pointer-events:none;overflow:hidden;opacity:0;transition:opacity .28s ease;'
        + 'background:radial-gradient(circle at 50% 46%,' + (isLight ? 'rgba(247,147,26,.10)' : 'rgba(247,147,26,.15)') + ',' + (isLight ? 'rgba(245,241,234,.86)' : 'rgba(16,14,11,.90)') + ' 72%);';
      var canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
      host.appendChild(canvas);
      var W = canvas.width = innerWidth * dpr, H = canvas.height = innerHeight * dpr;
      canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px';
      document.body.appendChild(host);
      requestAnimationFrame(function () { host.style.opacity = '1'; });
      return { host: host, ctx: canvas.getContext('2d'), W: W, H: H };
    }
    function hud(host, topHTML, sub) {
      var d = document.createElement('div');
      d.style.cssText = 'position:absolute;left:50%;bottom:calc(50% - 150px);transform:translateX(-50%);text-align:center;font-family:' + mono + ';width:90%;';
      d.innerHTML = '<div id="csTop" style="font-size:min(4.4vw,20px);font-weight:800;letter-spacing:3px;color:' + accent2 + ';text-shadow:0 0 18px ' + accent + ';">' + topHTML + '</div>'
        + '<div id="csSub" style="margin-top:8px;font-size:min(2.6vw,11px);letter-spacing:1px;color:' + dimc + ';">' + sub + '</div>';
      host.appendChild(d); return d;
    }
    function finish(host) { host.style.opacity = '0'; setTimeout(function () { host.remove(); }, 320); }
    var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
    function hexPoly(ctx, cx, cy, r) { ctx.beginPath(); for (var k = 0; k < 6; k++) { var a = -Math.PI / 2 + k / 6 * Math.PI * 2, px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); }

    /* ---- Variant A: REACHING CONSENSUS (validating node ring) ---- */
    function consensus() {
      var b = build(), ctx = b.ctx, W = b.W, H = b.H;
      var h = hud(b.host, '\u25c6 REACHING CONSENSUS', WHO + ' // VALIDATING NODES <span id="cs">0%</span>');
      var top = h.querySelector('#csTop'), sub = h.querySelector('#csSub'), cs2 = h.querySelector('#cs');
      var cx = W / 2, cy = H / 2, R = Math.min(W, H) * .24, N = 9, nodes = [];
      for (var i = 0; i < N; i++) { var a = -Math.PI / 2 + i / N * Math.PI * 2; nodes.push({ x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, vt: 260 + i * 150 + Math.random() * 60 }); }
      var start = performance.now(), END = 2050;
      (function frame(now) {
        var el = now - start; ctx.clearRect(0, 0, W, H); var valid = [];
        for (var i = 0; i < N; i++) if (el >= nodes[i].vt) valid.push(i);
        ctx.lineWidth = 1.4 * dpr;
        for (var a = 0; a < valid.length; a++) for (var bb = a + 1; bb < valid.length; bb++) {
          var i1 = valid[a], i2 = valid[bb], d = Math.abs(i1 - i2);
          if (d === 1 || d === N - 1 || d === 3) { var n1 = nodes[i1], n2 = nodes[i2], lt = Math.min(1, (el - Math.max(nodes[i1].vt, nodes[i2].vt)) / 260); ctx.globalAlpha = .12 + .4 * lt; ctx.strokeStyle = accent; ctx.beginPath(); ctx.moveTo(n1.x, n1.y); ctx.lineTo(n1.x + (n2.x - n1.x) * ease(lt), n1.y + (n2.y - n1.y) * ease(lt)); ctx.stroke(); }
        }
        ctx.globalAlpha = 1; var prog = valid.length / N;
        ctx.save(); ctx.translate(cx, cy); hexPoly(ctx, 0, 0, 30 * dpr); ctx.strokeStyle = accent; ctx.lineWidth = 2 * dpr; ctx.globalAlpha = .9; ctx.stroke(); ctx.globalAlpha = .14 + .5 * prog; ctx.fillStyle = accent; ctx.fill(); ctx.restore();
        for (var i = 0; i < N; i++) { var n = nodes[i], on = el >= n.vt, pop = on ? Math.min(1, (el - n.vt) / 200) : 0, rad = (5 + 3 * (on ? 1 : 0)) * dpr; if (on) { ctx.shadowColor = accent; ctx.shadowBlur = 12 * dpr * pop; } ctx.beginPath(); ctx.arc(n.x, n.y, rad, 0, 7); ctx.fillStyle = on ? accent2 : dimNode; ctx.fill(); ctx.shadowBlur = 0; if (on && pop < 1) { ctx.beginPath(); ctx.arc(n.x, n.y, rad + 14 * dpr * pop, 0, 7); ctx.strokeStyle = accent; ctx.globalAlpha = 1 - pop; ctx.lineWidth = 2 * dpr; ctx.stroke(); ctx.globalAlpha = 1; } }
        if (cs2) cs2.textContent = Math.round(prog * 100) + '%';
        if (prog >= 1 && top.dataset.d !== '1') { top.dataset.d = '1'; top.textContent = '\u25c6 CONSENSUS REACHED \u2713'; sub.innerHTML = WHO + ' // BLOCK VALIDATED'; }
        if (el < END) requestAnimationFrame(frame); else finish(b.host);
      })(start);
    }

    /* ---- Variant B: MINING BLOCK (proof of work — hash finds leading zeros) ---- */
    function mineBlock() {
      var b = build(), ctx = b.ctx, W = b.W, H = b.H;
      var h = hud(b.host, '\u25c6 MINING BLOCK', WHO + ' // PROOF OF WORK \u00b7 nonce <span id="cs">0</span>');
      var top = h.querySelector('#csTop'), sub = h.querySelector('#csSub'), cs2 = h.querySelector('#cs');
      var HEX = '0123456789abcdef', LEN = 24, TARGET = 4;
      function rnd() { return HEX[Math.floor(Math.random() * 16)]; }
      var start = performance.now(), END = 2300, LOCK = 300;
      var cx = W / 2, cy = H / 2;
      (function frame(now) {
        var el = now - start; ctx.clearRect(0, 0, W, H);
        var locked = Math.min(TARGET, Math.floor(el / LOCK));
        var str = ''; for (var i = 0; i < LEN; i++) str += (i < locked ? '0' : rnd());
        // block hex outline
        ctx.save(); ctx.translate(cx, cy - 8 * dpr); hexPoly(ctx, 0, 0, 62 * dpr); ctx.strokeStyle = accent; ctx.globalAlpha = .8; ctx.lineWidth = 2 * dpr; ctx.stroke(); ctx.globalAlpha = .10; ctx.fillStyle = accent; ctx.fill(); ctx.restore();
        ctx.font = 'bold ' + (18 * dpr) + 'px ' + mono; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = accent2; ctx.fillText('\u26d3', cx, cy - 8 * dpr);
        // hash string
        ctx.font = (15 * dpr) + 'px ' + mono; ctx.textBaseline = 'middle';
        var cw = 15 * dpr, tot = str.length * cw, sx = cx - tot / 2 + cw / 2, hy = cy + 74 * dpr;
        ctx.textAlign = 'center';
        for (var i = 0; i < str.length; i++) { ctx.fillStyle = i < locked ? accent2 : (isLight ? '#9a8c77' : '#93846f'); if (i < locked) { ctx.shadowColor = accent; ctx.shadowBlur = 8 * dpr; } else ctx.shadowBlur = 0; ctx.fillText(str[i], sx + i * cw, hy); }
        ctx.shadowBlur = 0;
        if (cs2) cs2.textContent = (Math.floor(el / 8)).toLocaleString();
        if (locked >= TARGET && top.dataset.d !== '1') { top.dataset.d = '1'; top.textContent = '\u25c6 BLOCK MINED \u2713'; sub.innerHTML = WHO + ' // VALID HASH FOUND'; }
        if (el < END) requestAnimationFrame(frame); else finish(b.host);
      })(start);
    }

    /* ---- Variant C: BROADCASTING TRANSACTION (propagation across mesh) ---- */
    function broadcast() {
      var b = build(), ctx = b.ctx, W = b.W, H = b.H;
      var h = hud(b.host, '\u25c6 BROADCASTING TRANSACTION', WHO + ' // PROPAGATING TO PEERS <span id="cs">0%</span>');
      var top = h.querySelector('#csTop'), sub = h.querySelector('#csSub'), cs2 = h.querySelector('#cs');
      var cx = W / 2, cy = H / 2, N = 22, nodes = [{ x: cx, y: cy, r: 0 }];
      for (var i = 1; i < N; i++) { var a = Math.random() * 7, rad = (0.14 + Math.random() * 0.34) * Math.min(W, H); nodes.push({ x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad, r: rad }); }
      // reach time proportional to distance from origin
      var maxr = 0; nodes.forEach(function (n) { if (n.r > maxr) maxr = n.r; });
      nodes.forEach(function (n) { n.t = 200 + (n.r / maxr) * 1200 + Math.random() * 120; });
      // edges: connect each node to nearest 2
      var edges = [];
      for (var i = 0; i < N; i++) { var ds = []; for (var j = 0; j < N; j++) if (j !== i) ds.push([j, Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y)]); ds.sort(function (a, c) { return a[1] - c[1]; }); edges.push([i, ds[0][0]]); edges.push([i, ds[1][0]]); }
      var start = performance.now(), END = 2200;
      (function frame(now) {
        var el = now - start; ctx.clearRect(0, 0, W, H); var reached = 0;
        ctx.lineWidth = 1.2 * dpr;
        for (var e = 0; e < edges.length; e++) { var n1 = nodes[edges[e][0]], n2 = nodes[edges[e][1]], on = el >= n1.t && el >= n2.t; ctx.globalAlpha = on ? .32 : .08; ctx.strokeStyle = accent; ctx.beginPath(); ctx.moveTo(n1.x, n1.y); ctx.lineTo(n2.x, n2.y); ctx.stroke(); }
        ctx.globalAlpha = 1;
        for (var i = 0; i < N; i++) { var n = nodes[i], on = el >= n.t; if (on) reached++; var pop = on ? Math.min(1, (el - n.t) / 240) : 0; var rad = (i === 0 ? 8 : 5) * dpr; if (on) { ctx.shadowColor = accent; ctx.shadowBlur = 12 * dpr * pop; } ctx.beginPath(); ctx.arc(n.x, n.y, rad, 0, 7); ctx.fillStyle = on ? accent2 : dimNode; ctx.fill(); ctx.shadowBlur = 0; if (on && pop < 1) { ctx.beginPath(); ctx.arc(n.x, n.y, rad + 16 * dpr * pop, 0, 7); ctx.strokeStyle = accent; ctx.globalAlpha = 1 - pop; ctx.lineWidth = 2 * dpr; ctx.stroke(); ctx.globalAlpha = 1; } }
        var prog = Math.round(reached / N * 100); if (cs2) cs2.textContent = prog + '%';
        if (prog >= 100 && top.dataset.d !== '1') { top.dataset.d = '1'; top.textContent = '\u25c6 TRANSACTION CONFIRMED \u2713'; sub.innerHTML = WHO + ' // ALL PEERS SYNCED'; }
        if (el < END) requestAnimationFrame(frame); else finish(b.host);
      })(start);
    }

    var variants = [consensus, mineBlock, broadcast];
    variants[Math.floor(Math.random() * variants.length)]();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();

