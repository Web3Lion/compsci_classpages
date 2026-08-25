// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* BYTE BOUNTY page intros (AP CSP) — packet / networking themed transitions,
   the friendly counterpart to the cyber hacker-glitch. Self-contained, no deps.
   A random variant plays once per page load on the CTF arena AND the formal
   course pages (index / vocab / syllabus / news). Guide: ADA. */
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
    return awake ? "ADA" : "SYSTEM";
  }
  function run() {
    var WHO = guideLabel();
    if (window.__packetIntroDone) return;
    window.__packetIntroDone = true;

    var cs = getComputedStyle(document.documentElement);
    var accent = (cs.getPropertyValue('--accent') || '#a855f7').trim();
    var accent2 = (cs.getPropertyValue('--accent2') || '#c98bff').trim();
    var isLight = document.documentElement.getAttribute('data-theme') === 'light';
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var mono = "'JetBrains Mono',ui-monospace,monospace";
    var dimc = isLight ? '#6f668c' : '#867ba0';

    function build() {
      var host = document.createElement('div');
      host.id = 'packetIntro';
      host.style.cssText = 'position:fixed;inset:0;z-index:12500;pointer-events:none;overflow:hidden;opacity:0;transition:opacity .28s ease;'
        + 'background:radial-gradient(circle at 50% 46%,' + (isLight ? 'rgba(168,85,247,.10)' : 'rgba(168,85,247,.16)') + ',' + (isLight ? 'rgba(241,238,247,.86)' : 'rgba(12,10,20,.90)') + ' 72%);';
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
      d.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;font-family:' + mono + ';width:90%;';
      d.innerHTML = '<div id="pkTop" style="font-size:min(4.4vw,20px);font-weight:800;letter-spacing:3px;color:' + accent2 + ';text-shadow:0 0 18px ' + accent + ';">' + topHTML + '</div>'
        + '<div style="margin-top:120px;"></div>'
        + '<div id="pkSub" style="font-size:min(2.6vw,11px);letter-spacing:1px;color:' + dimc + ';">' + sub + '</div>';
      host.appendChild(d); return d;
    }
    function finish(host) { host.style.opacity = '0'; setTimeout(function () { host.remove(); }, 320); }
    function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
    var ease = function (t) { return 1 - Math.pow(1 - t, 3); };

    /* ---- Variant A: RECEIVING PACKETS ---- */
    function receivePackets() {
      var b = build(), ctx = b.ctx, W = b.W, H = b.H;
      var h = hud(b.host, '\u25c6 RECEIVING PACKETS', WHO + ' // BUFFERING STREAM <span id="pk">0%</span>');
      var top = h.querySelector('#pkTop'), pk = h.querySelector('#pk');
      var COLS = 16, ROWS = 3, cell = 18 * dpr, gap = 5 * dpr;
      var gw = COLS * cell + (COLS - 1) * gap, gx = W / 2 - gw / 2, gy = H / 2 - (ROWS * cell + (ROWS - 1) * gap) / 2 - 6 * dpr;
      var N = COLS * ROWS, ps = [];
      for (var i = 0; i < N; i++) {
        var c = i % COLS, r = Math.floor(i / COLS), e = Math.floor(Math.random() * 4), sx, sy;
        if (e === 0) { sx = Math.random() * W; sy = -40 * dpr; } else if (e === 1) { sx = W + 40 * dpr; sy = Math.random() * H; }
        else if (e === 2) { sx = Math.random() * W; sy = H + 40 * dpr; } else { sx = -40 * dpr; sy = Math.random() * H; }
        ps.push({ sx: sx, sy: sy, tx: gx + c * (cell + gap) + cell / 2, ty: gy + r * (cell + gap) + cell / 2, delay: Math.random() * 620 });
      }
      var start = performance.now(), TRAVEL = 560, END = 1750;
      (function frame(now) {
        var el = now - start; ctx.clearRect(0, 0, W, H); var arr = 0;
        for (var i = 0; i < ps.length; i++) {
          var p = ps[i], lt = (el - p.delay) / TRAVEL; if (lt < 0) continue; if (lt >= 1) { lt = 1; arr++; }
          var e = ease(lt), x = p.sx + (p.tx - p.sx) * e, y = p.sy + (p.ty - p.sy) * e;
          if (lt < 1) { ctx.strokeStyle = accent; ctx.globalAlpha = .18; ctx.lineWidth = 2 * dpr; ctx.beginPath(); var be = ease(Math.max(0, lt - .14)); ctx.moveTo(p.sx + (p.tx - p.sx) * be, p.sy + (p.ty - p.sy) * be); ctx.lineTo(x, y); ctx.stroke(); }
          var s = cell * (lt < 1 ? .62 : 1); ctx.globalAlpha = lt < 1 ? .9 : 1; ctx.fillStyle = lt < 1 ? accent2 : accent;
          if (lt >= 1) { ctx.shadowColor = accent; ctx.shadowBlur = 8 * dpr; } else ctx.shadowBlur = 0;
          rr(ctx, x - s / 2, y - s / 2, s, s, 3 * dpr); ctx.fill(); ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1; var prog = Math.round(arr / N * 100); if (pk) pk.textContent = prog + '%';
        if (prog >= 100 && top.dataset.d !== '1') { top.dataset.d = '1'; top.textContent = '\u25c6 STREAM ESTABLISHED'; }
        if (el < END) requestAnimationFrame(frame); else finish(b.host);
      })(start);
    }

    /* ---- Variant B: ESTABLISHING CONNECTION (handshake) ---- */
    function handshake() {
      var b = build(), ctx = b.ctx, W = b.W, H = b.H;
      var h = hud(b.host, '\u25c6 ESTABLISHING CONNECTION', WHO + ' // <span id="pk">SYN \u2192</span>');
      var top = h.querySelector('#pkTop'), pk = h.querySelector('#pk');
      var ax = W * 0.28, bx = W * 0.72, cy = H / 2, nr = 13 * dpr;
      var pulses = [ { t: 200, dir: 1, label: 'SYN \u2192' }, { t: 800, dir: -1, label: '\u2190 SYN-ACK' }, { t: 1400, dir: 1, label: 'ACK \u2192' } ];
      var start = performance.now(), END = 2350, TR = 520;
      (function frame(now) {
        var el = now - start; ctx.clearRect(0, 0, W, H);
        ctx.strokeStyle = accent; ctx.globalAlpha = .16; ctx.lineWidth = 2 * dpr; ctx.beginPath(); ctx.moveTo(ax, cy); ctx.lineTo(bx, cy); ctx.stroke(); ctx.globalAlpha = 1;
        for (var i = 0; i < pulses.length; i++) {
          var p = pulses[i], lt = (el - p.t) / TR; if (lt < 0 || lt > 1) continue;
          var e = ease(lt), x = p.dir > 0 ? ax + (bx - ax) * e : bx + (ax - bx) * e;
          ctx.shadowColor = accent; ctx.shadowBlur = 10 * dpr; ctx.fillStyle = accent2; ctx.beginPath(); ctx.arc(x, cy, 6 * dpr, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
          if (pk && el >= p.t && el < p.t + TR) pk.textContent = p.label;
        }
        [ax, bx].forEach(function (nx, idx) {
          var done = el > pulses[pulses.length - 1].t + TR; var lit = done || (idx === 0 ? el > 0 : el > 800);
          ctx.shadowColor = accent; ctx.shadowBlur = lit ? 14 * dpr : 0; ctx.fillStyle = lit ? accent : (isLight ? '#b9addb' : '#4a3d63');
          ctx.beginPath(); ctx.arc(nx, cy, nr, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
          ctx.fillStyle = isLight ? '#f1eef7' : '#0c0a14'; ctx.font = 'bold ' + (11 * dpr) + 'px ' + mono; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(idx === 0 ? 'A' : 'B', nx, cy);
        });
        if (el > END - 700 && top.dataset.d !== '1') { top.dataset.d = '1'; top.textContent = '\u25c6 CONNECTION ESTABLISHED \u2713'; if (pk) pk.textContent = 'LINK OPEN'; }
        if (el < END) requestAnimationFrame(frame); else finish(b.host);
      })(start);
    }

    /* ---- Variant C: COMPILING PROGRAM ---- */
    function compile() {
      var b = build(), ctx = b.ctx, W = b.W, H = b.H;
      var lines = ['def solve(data):', '  result = []', '  for x in data:', '    result.append(x * 2)', '  return result', '', 'print(solve(inputs))'];
      var h = hud(b.host, '\u25c6 COMPILING PROGRAM', WHO + ' // BUILDING <span id="pk">0%</span>');
      var top = h.querySelector('#pkTop'), pk = h.querySelector('#pk');
      var start = performance.now(), END = 2100, PER = 210;
      var x0 = W / 2 - 150 * dpr, y0 = H / 2 - 46 * dpr, lh = 20 * dpr;
      (function frame(now) {
        var el = now - start; ctx.clearRect(0, 0, W, H);
        ctx.font = (13 * dpr) + 'px ' + mono; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        var shown = Math.min(lines.length, Math.floor(el / PER));
        for (var i = 0; i < shown; i++) {
          ctx.globalAlpha = 1; ctx.fillStyle = accent2;
          if (i === shown - 1) { var cut = Math.floor(lines[i].length * Math.min(1, (el - i * PER) / PER)); ctx.fillText(lines[i].slice(0, cut) + '\u2588', x0, y0 + i * lh); }
          else ctx.fillText(lines[i], x0, y0 + i * lh);
        }
        var prog = Math.min(100, Math.round(el / (lines.length * PER) * 100)); if (pk) pk.textContent = prog + '%';
        // progress bar
        var bw = 300 * dpr, bx = W / 2 - bw / 2, by = y0 + lines.length * lh + 16 * dpr;
        ctx.globalAlpha = 1; ctx.strokeStyle = accent; ctx.lineWidth = 1.5 * dpr; rr(ctx, bx, by, bw, 8 * dpr, 4 * dpr); ctx.stroke();
        ctx.fillStyle = accent; rr(ctx, bx, by, bw * prog / 100, 8 * dpr, 4 * dpr); ctx.fill();
        if (prog >= 100 && top.dataset.d !== '1') { top.dataset.d = '1'; top.textContent = '\u25c6 BUILD SUCCESSFUL \u2713'; }
        if (el < END) requestAnimationFrame(frame); else finish(b.host);
      })(start);
    }

    var variants = [receivePackets, handshake, compile];
    variants[Math.floor(Math.random() * variants.length)]();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();

