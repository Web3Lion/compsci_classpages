/* <hub-game kind="stack|bell|maze|word|pop"> — sign-in page mini games. Best score per game is kept in localStorage (sfhub_game_<kind>). */
(function () {
  if (customElements.get('hub-game')) return;
  const G = '#008539', GOLD = '#d4a21f', INK = '#1a1a1a', DIM = '#5c5c5d', LINE = '#e0e2e2', BG = '#f7f8f8', RED = '#c8372d', NAVY = '#2a4d8f', GRAY = '#8a8f8f';
  const rr = (c, x, y, w, h, r) => { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); };
  const txt = (c, s, x, y, font, col, al) => { c.font = font; c.fillStyle = col; c.textAlign = al || 'center'; c.textBaseline = 'middle'; c.fillText(s, x, y); };
  const rng = seed => { let s = (seed >>> 0) || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  const dayKey = () => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
  const hit = (r, x, y) => r && x >= r[0] && x <= r[0] + r[2] && y >= r[1] && y <= r[1] + r[3];
  const GAMES = {};

  GAMES.stack = api => {
    const TH = 16; let T, cur, spd, falls, cam, msgT;
    const tray = (c, x, y, w, i) => { rr(c, x, y + 1, w, TH - 2, 3); c.fillStyle = i === 0 ? DIM : [G, GOLD, '#a7adad'][i % 3]; c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x + 3, y + 3, Math.max(0, w - 6), 2); };
    return {
      title: 'Lunch Line Stack', hint: 'Tap or press Space to drop each tray.', height: () => 300,
      reset(W) { const w = Math.min(200, W * 0.4); T = [{ x: (W - w) / 2, w }]; cur = { x: 10, w, dir: 1 }; spd = 140; falls = []; cam = 0; msgT = 0; },
      update(dt, W, H) {
        falls.forEach(f => { f.vy += 900 * dt; f.dy += f.vy * dt; }); falls = falls.filter(f => f.dy < H + 200); msgT -= dt;
        const floor = H - 26, target = Math.max(0, 70 - floor + (T.length + 1) * TH); cam += (target - cam) * Math.min(1, dt * 6);
        if (api.mode !== 'play') return;
        cur.x += cur.dir * spd * dt; if (cur.x + cur.w > W - 10) { cur.x = W - 10 - cur.w; cur.dir = -1; } if (cur.x < 10) { cur.x = 10; cur.dir = 1; }
      },
      drop(W) {
        const top = T[T.length - 1], l = Math.max(top.x, cur.x), r = Math.min(top.x + top.w, cur.x + cur.w), lvl = T.length;
        if (r - l <= 0) { falls.push({ x: cur.x, w: cur.w, lvl, dy: 0, vy: 0 }); api.finish(T.length - 1); return; }
        let nx = l, nw = r - l;
        if (Math.abs(cur.x - top.x) < 4) { nx = top.x; nw = top.w; msgT = 0.8; }
        else { if (cur.x < l) falls.push({ x: cur.x, w: l - cur.x, lvl, dy: 0, vy: 0 }); if (cur.x + cur.w > r) falls.push({ x: r, w: cur.x + cur.w - r, lvl, dy: 0, vy: 0 }); }
        T.push({ x: nx, w: nw }); const d = -cur.dir; cur = { x: d > 0 ? 10 : W - 10 - nw, w: nw, dir: d }; spd = Math.min(420, spd + 9); api.score = T.length - 1;
      },
      tap(x, y, W) { this.drop(W); }, key(k, W) { if (k === ' ' || k === 'Enter' || k === 'ArrowDown') this.drop(W); },
      draw(c, W, H) {
        c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); const floor = H - 26, sy = i => floor - (i + 1) * TH + cam;
        c.fillStyle = '#e9ebeb'; c.fillRect(0, floor, W, H - floor); c.fillStyle = '#c9cdcd'; c.fillRect(0, floor, W, 3);
        T.forEach((t, i) => { const y = sy(i); if (y < H) tray(c, t.x, y, t.w, i); });
        if (api.mode === 'play') tray(c, cur.x, sy(T.length), cur.w, T.length);
        c.globalAlpha = 0.6; falls.forEach(f => tray(c, f.x, sy(f.lvl) + f.dy, f.w, f.lvl)); c.globalAlpha = 1;
        txt(c, (T.length - 1) + (T.length === 2 ? ' tray' : ' trays'), 16, 18, "700 15px 'Lato',sans-serif", INK, 'left');
        txt(c, 'Best ' + api.best(), W - 16, 18, "700 13px 'Lato',sans-serif", DIM, 'right');
        if (msgT > 0) txt(c, 'Perfect!', W / 2, 18, "700 15px 'Lato',sans-serif", G);
      }
    };
  };

  GAMES.bell = api => {
    const B = [['Period 1', '7:20'], ['Period 2', '8:10'], ['Period 3', '9:03'], ['Period 4', '9:51'], ['Period 5', '10:39'], ['Period 6', '11:27'], ['Period 7', '12:15'], ['Period 8', '1:03']];
    let order, done, sel, t, flash, L, R;
    const geo = (W, H) => { const top = 48, rh = (H - top - 10) / 8, cw = Math.min(230, (W - 60) / 2), lx = W / 2 - cw - 15, rx = W / 2 + 15; L = B.map((_, i) => [lx, top + i * rh, cw, rh - 6]); R = B.map((_, j) => [rx, top + j * rh, cw, rh - 6]); };
    const chip = (c, r, s, fill, fg, bd) => { rr(c, r[0], r[1], r[2], r[3], 7); c.fillStyle = fill; c.fill(); if (bd) { c.lineWidth = 2.5; c.strokeStyle = bd; c.stroke(); } txt(c, s, r[0] + r[2] / 2, r[1] + r[3] / 2 + 1, "700 13px 'Lato',sans-serif", fg); };
    return {
      title: 'Bell Dash', hint: 'Tap a period, then its start time.', height: () => 330,
      reset(W, H) { const r = rng(Date.now()); order = B.map((_, i) => i).sort(() => r() - 0.5); done = new Set(); sel = null; t = 30; flash = null; geo(W, H); },
      update(dt, W, H) { geo(W, H); if (flash) { flash.t -= dt; if (flash.t <= 0) flash = null; } if (api.mode !== 'play') return; t -= dt; if (t <= 0) { t = 0; api.finish(done.size * 10); } },
      tap(x, y) {
        L.forEach((r, i) => { if (hit(r, x, y) && !done.has(i)) sel = i; });
        R.forEach((r, j) => { const i = order[j]; if (!hit(r, x, y) || done.has(i) || sel === null) return;
          if (i === sel) { done.add(i); sel = null; api.score = done.size * 10; if (done.size === 8) api.finish(80 + Math.round(t * 10)); }
          else { flash = { j, t: 0.4 }; t = Math.max(0, t - 2); } });
      },
      key(k) { if (/^[1-8]$/.test(k) && !done.has(+k - 1)) sel = +k - 1; },
      draw(c, W, H) {
        c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);
        txt(c, 'Match each period to its start time', 16, 20, "700 14px 'Lato',sans-serif", INK, 'left');
        txt(c, Math.ceil(t) + 's', W - 16, 20, "800 18px 'Lato',sans-serif", t < 8 ? RED : INK, 'right');
        c.fillStyle = LINE; c.fillRect(16, 36, W - 32, 3); c.fillStyle = t < 8 ? RED : G; c.fillRect(16, 36, (W - 32) * t / 30, 3);
        L.forEach((r, i) => done.has(i) ? chip(c, r, B[i][0], G, '#fff') : chip(c, r, B[i][0], BG, INK, sel === i ? GOLD : LINE));
        R.forEach((r, j) => { const i = order[j]; flash && flash.j === j ? chip(c, r, B[i][1], RED, '#fff') : done.has(i) ? chip(c, r, B[i][1], G, '#fff') : chip(c, r, B[i][1], '#fff', INK, LINE); });
      }
    };
  };

  GAMES.maze = api => {
    const cs = 26, D = { n: [0, -1, 1, 4], e: [1, 0, 2, 8], s: [0, 1, 4, 1], w: [-1, 0, 8, 2] };
    let cols, rows, ox, oy, grid, items, pos, px, py, t, started, got;
    const ix = (x, y) => y * cols + x;
    const open = (x, y) => Object.values(D).filter(d => !(grid[ix(x, y)] & d[2])).length;
    return {
      title: 'Hallway Maze', autostart: true, height: () => 330,
      reset(W, H) {
        cols = Math.max(8, Math.floor((W - 24) / cs)); rows = Math.max(6, Math.floor((H - 56) / cs)); ox = (W - cols * cs) / 2; oy = 44;
        const r = rng(dayKey()); grid = new Array(cols * rows).fill(15); const seen = new Set([0]), st = [0];
        while (st.length) { const c = st[st.length - 1], x = c % cols, y = (c / cols) | 0;
          const nb = Object.values(D).filter(d => { const nx = x + d[0], ny = y + d[1]; return nx >= 0 && ny >= 0 && nx < cols && ny < rows && !seen.has(ix(nx, ny)); });
          if (!nb.length) { st.pop(); continue; } const d = nb[(r() * nb.length) | 0], n = ix(x + d[0], y + d[1]); grid[c] &= ~d[2]; grid[n] &= ~d[3]; seen.add(n); st.push(n); }
        for (let k = 0; k < cols * rows * 0.08; k++) { const x = 1 + ((r() * (cols - 2)) | 0), y = 1 + ((r() * (rows - 2)) | 0), d = Object.values(D)[(r() * 4) | 0]; grid[ix(x, y)] &= ~d[2]; grid[ix(x + d[0], y + d[1])] &= ~d[3]; }
        items = []; while (items.length < 5) { const c = 1 + ((r() * (cols * rows - 2)) | 0); if (!items.some(i => i.c === c)) items.push({ c, k: items.length % 3 }); }
        pos = { x: 0, y: 0 }; px = 0; py = 0; t = 0; started = false; got = 0;
      },
      step(d) {
        if (grid[ix(pos.x, pos.y)] & d[2]) return false; pos.x += d[0]; pos.y += d[1]; started = true;
        const c = ix(pos.x, pos.y), it = items.findIndex(i => i.c === c); if (it >= 0) { items.splice(it, 1); got++; }
        if (pos.x === cols - 1 && pos.y === rows - 1) { api.finish(Math.max(50, Math.round(800 - t * 10)) + got * 50); return false; } return true;
      },
      key(k) { const d = { arrowup: D.n, w: D.n, arrowright: D.e, d: D.e, arrowdown: D.s, s: D.s, arrowleft: D.w, a: D.w }[k.toLowerCase()]; if (d) this.step(d); },
      tap(x, y) {
        const dx = x - (ox + (pos.x + 0.5) * cs), dy = y - (oy + (pos.y + 0.5) * cs); if (Math.max(Math.abs(dx), Math.abs(dy)) < cs * 0.4) return;
        const d = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? D.e : D.w) : (dy > 0 ? D.s : D.n);
        let n = 0; while (this.step(d) && api.mode === 'play' && open(pos.x, pos.y) === 2 && !(grid[ix(pos.x, pos.y)] & d[2]) && n++ < 40);
      },
      update(dt) { if (api.mode === 'play' && started) t += dt; px += (pos.x - px) * Math.min(1, dt * 18); py += (pos.y - py) * Math.min(1, dt * 18); },
      draw(c, W, H) {
        c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);
        txt(c, 'Office  →  Room 214', 16, 20, "700 14px 'Lato',sans-serif", INK, 'left');
        txt(c, 'Items ' + got + '/5   ' + t.toFixed(1) + 's', W - 16, 20, "700 13px 'Lato',sans-serif", DIM, 'right');
        c.fillStyle = BG; c.fillRect(ox, oy, cols * cs, rows * cs);
        rr(c, ox + (cols - 1) * cs + 3, oy + (rows - 1) * cs + 3, cs - 6, cs - 6, 4); c.fillStyle = G; c.fill(); txt(c, '214', ox + (cols - 0.5) * cs, oy + (rows - 0.5) * cs + 1, "700 9px 'Lato',sans-serif", '#fff');
        items.forEach(i => { const x = ox + (i.c % cols + 0.5) * cs, y = oy + (((i.c / cols) | 0) + 0.5) * cs; c.beginPath();
          if (i.k === 0) { c.ellipse(x, y, 7, 4.5, -0.5, 0, 7); c.fillStyle = '#8a4b22'; c.fill(); }
          else if (i.k === 1) { c.arc(x - 2, y + 4, 3.5, 0, 7); c.fillStyle = INK; c.fill(); c.fillRect(x + 0.5, y - 7, 2, 11); }
          else { c.fillStyle = G; c.fillRect(x - 6, y - 5, 12, 10); c.fillStyle = '#fff'; c.fillRect(x - 1, y - 5, 2, 10); } });
        c.strokeStyle = DIM; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath();
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const g = grid[ix(x, y)], X = ox + x * cs, Y = oy + y * cs;
          if (g & 1) { c.moveTo(X, Y); c.lineTo(X + cs, Y); } if (g & 8) { c.moveTo(X, Y); c.lineTo(X, Y + cs); }
          if (x === cols - 1 && g & 2) { c.moveTo(X + cs, Y); c.lineTo(X + cs, Y + cs); } if (y === rows - 1 && g & 4) { c.moveTo(X, Y + cs); c.lineTo(X + cs, Y + cs); } }
        c.stroke();
        const lx = ox + (px + 0.5) * cs, ly = oy + (py + 0.5) * cs;
        c.beginPath(); c.arc(lx, ly, cs * 0.38, 0, 7); c.fillStyle = '#b9781a'; c.fill(); c.beginPath(); c.arc(lx, ly, cs * 0.25, 0, 7); c.fillStyle = GOLD; c.fill();
        c.fillStyle = INK; c.beginPath(); c.arc(lx - 2.5, ly - 1.5, 1.4, 0, 7); c.arc(lx + 2.5, ly - 1.5, 1.4, 0, 7); c.fill();
        if (!started && api.mode === 'play') txt(c, 'Arrow keys, or tap the way you want to go', W / 2, H - 6, "12px 'Lato',sans-serif", DIM);
      }
    };
  };

  GAMES.word = api => {
    const WORDS = ['GRADE', 'LUNCH', 'CLASS', 'CHALK', 'NOTES', 'ESSAY', 'BOOKS', 'PAPER', 'PRIDE', 'LIONS', 'GREEN', 'COACH', 'BUSES', 'FIELD', 'TEACH', 'LEARN', 'STUDY', 'TESTS', 'SCORE', 'TRACK', 'RALLY', 'BOARD', 'HONOR', 'MUSIC', 'DRAMA', 'CHEER', 'TEAMS', 'DESKS', 'RULER', 'EXAMS', 'FOCUS', 'SKILL', 'WRITE', 'SPELL', 'LOGIC', 'CLOCK', 'QUIET', 'PRINT', 'SHELF', 'MEDAL'];
    const KR = ['QWERTYUIOP', 'ASDFGHJKL', '>ZXCVBNM<'], COL = { g: G, y: GOLD, x: GRAY };
    let ans, rows, cur, msg, msgT, ks, keys, lay;
    const layout = (W, H) => {
      const wide = W >= 620, s = wide ? Math.min(42, (H - 30) / 6 - 6) : 42, gw = 5 * (s + 6) - 6;
      const g = wide ? { x: W * 0.27 - gw / 2, y: (H - (6 * (s + 6) - 6)) / 2 } : { x: (W - gw) / 2, y: 14 };
      const kx = wide ? W * 0.52 : 10, kw = wide ? W * 0.48 - 20 : W - 20, kh = 42, u = (kw - 54) / 10, ky = wide ? H / 2 - kh * 1.5 - 6 : g.y + 6 * (s + 6) + 12;
      keys = []; KR.forEach((row, ri) => { let x = kx + (ri === 1 ? u / 2 + 3 : 0); [...row].forEach(k => { const w = k === '>' || k === '<' ? u * 1.5 + 3 : u; keys.push({ k, r: [x, ky + ri * (kh + 6), w, kh] }); x += w + 6; }); });
      lay = { s, g };
    };
    const score = w => { const res = Array(5).fill('x'), left = {}; [...ans].forEach((ch, i) => { if (w[i] === ch) res[i] = 'g'; else left[ch] = (left[ch] || 0) + 1; }); [...w].forEach((ch, i) => { if (res[i] !== 'g' && left[ch]) { res[i] = 'y'; left[ch]--; } }); return res; };
    const press = k => {
      if (api.mode !== 'play') return;
      if (k === '<') cur = cur.slice(0, -1);
      else if (k === '>') { if (cur.length < 5) { msg = 'Five letters'; msgT = 1.4; return; } const res = score(cur); rows.push({ w: cur, res });
        [...cur].forEach((ch, i) => { const p = { g: 3, y: 2, x: 1 }; if (!ks[ch] || p[res[i]] > p[ks[ch]]) ks[ch] = res[i]; });
        const won = cur === ans; cur = '';
        if (won) { api.overText = 'Solved in ' + rows.length + (rows.length === 1 ? ' guess' : ' guesses'); api.finish((7 - rows.length) * 100); }
        else if (rows.length === 6) { api.overText = 'The word was ' + ans; api.finish(0); } }
      else if (cur.length < 5) cur += k;
    };
    return {
      title: 'Lion Word', autostart: true, height: W => (W >= 620 ? 300 : 470),
      reset(W, H) { ans = WORDS[(dayKey() + api.plays) % WORDS.length]; rows = []; cur = ''; msg = ''; msgT = 0; ks = {}; layout(W, H); },
      update(dt, W, H) { layout(W, H); msgT -= dt; },
      tap(x, y) { const k = keys.find(k => hit(k.r, x, y)); if (k) press(k.k); },
      key(k) { if (k === 'Enter') press('>'); else if (k === 'Backspace') press('<'); else if (/^[a-z]$/i.test(k)) press(k.toUpperCase()); },
      draw(c, W, H) {
        c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); const { s, g } = lay;
        for (let r = 0; r < 6; r++) { const row = rows[r], w = row ? row.w : r === rows.length ? cur : '';
          for (let i = 0; i < 5; i++) { const x = g.x + i * (s + 6), y = g.y + r * (s + 6); rr(c, x, y, s, s, 6);
            if (row) { c.fillStyle = COL[row.res[i]]; c.fill(); } else { c.fillStyle = '#fff'; c.fill(); c.lineWidth = 2; c.strokeStyle = w[i] ? DIM : LINE; c.stroke(); }
            if (w[i]) txt(c, w[i], x + s / 2, y + s / 2 + 1, "800 " + Math.round(s * 0.5) + "px 'Lato',sans-serif", row ? '#fff' : INK); } }
        keys.forEach(({ k, r }) => { const st = ks[k]; rr(c, r[0], r[1], r[2], r[3], 6); c.fillStyle = st ? COL[st] : '#e9ebeb'; c.fill();
          txt(c, k === '>' ? 'ENTER' : k === '<' ? 'DEL' : k, r[0] + r[2] / 2, r[1] + r[3] / 2 + 1, k === '>' || k === '<' ? "700 11px 'Lato',sans-serif" : "700 15px 'Lato',sans-serif", st ? '#fff' : INK); });
        if (msgT > 0) { rr(c, W / 2 - 60, 8, 120, 26, 13); c.fillStyle = INK; c.fill(); txt(c, msg, W / 2, 21, "700 12px 'Lato',sans-serif", '#fff'); }
      }
    };
  };

  GAMES.pop = api => {
    let B, t, sp, flash, P, clock;
    return {
      title: 'Pep Rally Pop', hint: 'Tap green and gold. Red and blue cost 3.', height: () => 320,
      reset() { B = []; t = 30; sp = 0; flash = 0; P = []; clock = 0; api.score = 0; },
      update(dt, W, H) {
        clock += dt; flash = Math.max(0, flash - dt);
        P.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 400 * dt; p.l -= dt; }); P = P.filter(p => p.l > 0);
        if (api.mode !== 'play') return;
        t -= dt; if (t <= 0) { t = 0; api.finish(api.score); return; }
        sp -= dt; if (sp <= 0) { sp = Math.max(0.28, 0.7 - (30 - t) * 0.014); const good = Math.random() < 0.72, r = 18 + Math.random() * 8;
          B.push({ x: r + Math.random() * (W - 2 * r), y: H + r, r, vy: -(70 + (30 - t) * 4 + Math.random() * 40), ph: Math.random() * 6, good, col: good ? (Math.random() < 0.5 ? G : GOLD) : (Math.random() < 0.5 ? RED : NAVY) }); }
        B.forEach(b => { b.y += b.vy * dt; b.x += Math.sin(clock * 2 + b.ph) * 12 * dt; }); B = B.filter(b => b.y > -b.r - 40);
      },
      tap(x, y) {
        for (let i = B.length - 1; i >= 0; i--) { const b = B[i]; if (Math.hypot((x - b.x) / 0.85, y - b.y) < b.r + 6) { B.splice(i, 1);
          for (let k = 0; k < 8; k++) { const a = k / 8 * 6.28; P.push({ x: b.x, y: b.y, vx: Math.cos(a) * 120, vy: Math.sin(a) * 120, l: 0.4, col: b.col }); }
          if (b.good) api.score++; else { api.score = Math.max(0, api.score - 3); flash = 0.3; } return; } }
      },
      draw(c, W, H) {
        c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);
        B.forEach(b => { c.strokeStyle = '#b8bcbc'; c.lineWidth = 1; c.beginPath(); c.moveTo(b.x, b.y + b.r); c.quadraticCurveTo(b.x + 6, b.y + b.r + 12, b.x, b.y + b.r + 24); c.stroke();
          c.beginPath(); c.ellipse(b.x, b.y, b.r * 0.85, b.r, 0, 0, 7); c.fillStyle = b.col; c.fill();
          c.beginPath(); c.moveTo(b.x - 3, b.y + b.r + 4); c.lineTo(b.x + 3, b.y + b.r + 4); c.lineTo(b.x, b.y + b.r - 1); c.fill();
          c.beginPath(); c.ellipse(b.x - b.r * 0.3, b.y - b.r * 0.35, b.r * 0.18, b.r * 0.28, -0.5, 0, 7); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill(); });
        P.forEach(p => { c.globalAlpha = Math.max(0, p.l / 0.4); c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, 3, 0, 7); c.fill(); }); c.globalAlpha = 1;
        txt(c, 'Score ' + api.score, 16, 20, "800 16px 'Lato',sans-serif", INK, 'left');
        txt(c, '0:' + String(Math.ceil(t)).padStart(2, '0'), W - 16, 20, "800 16px 'Lato',sans-serif", t < 8 ? RED : INK, 'right');
        if (flash > 0) { c.strokeStyle = RED; c.globalAlpha = flash / 0.3; c.lineWidth = 8; c.strokeRect(0, 0, W, H); c.globalAlpha = 1; }
      }
    };
  };

  GAMES.hall = api => {
    const LN = 6, cs = 34; let cols, ox, top, lh, P, L, t, doors, hitT, doorX;
    const ly = i => top + (LN - i) * lh;
    const lanes = (lvl) => { const r = rng(Date.now() + lvl); L = []; for (let i = 1; i < LN; i++) { const dir = i % 2 ? 1 : -1, sp = (40 + r() * 45 + lvl * 14) * dir, n = 2 + ((r() * 2) | 0), gap = (cols * cs) / n, s = [];
      for (let k = 0; k < n; k++) s.push({ x: ox + k * gap + r() * gap * 0.5, c: [NAVY, RED, GOLD, '#7a5ca8', GRAY][(r() * 5) | 0], w: r() < 0.3 ? 2 : 1 }); L.push({ sp, s }); } doorX = 1 + ((r() * (cols - 2)) | 0); };
    const move = (dx, dy) => { if (api.mode !== 'play' || hitT > 0) return; P.x = Math.max(0, Math.min(cols - 1, P.x + dx)); P.y = Math.max(0, Math.min(LN, P.y + dy));
      if (P.y === LN) { if (P.x === doorX) { doors++; api.score = doors * 100; t = Math.min(40, t + 4); P = { x: (cols / 2) | 0, y: 0 }; lanes(doors); } else P.y = LN - 1; } };
    return {
      title: 'Hall Pass Dash', hint: 'Weave through the hallway to the open door.', height: () => 330,
      reset(W, H) { cols = Math.max(8, Math.floor((W - 24) / cs)); ox = (W - cols * cs) / 2; top = 40; lh = (H - top - 12) / (LN + 1); P = { x: (cols / 2) | 0, y: 0 }; t = 40; doors = 0; hitT = 0; lanes(0); },
      key(k) { const d = { arrowup: [0, 1], w: [0, 1], arrowdown: [0, -1], s: [0, -1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] }[k.toLowerCase()]; if (d) move(d[0], d[1]); },
      tap(x, y) { const px = ox + (P.x + 0.5) * cs, py = ly(P.y) + lh / 2, dx = x - px, dy = y - py; if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : -1, 0); else move(0, dy < 0 ? 1 : -1); },
      update(dt, W) {
        hitT = Math.max(0, hitT - dt); const span = cols * cs;
        L.forEach(l => l.s.forEach(s => { s.x += l.sp * dt; if (s.x > ox + span + 30) s.x -= span + 60; if (s.x < ox - 30) s.x += span + 60; }));
        if (api.mode !== 'play') return; t -= dt; if (t <= 0) { t = 0; api.overText = doors + (doors === 1 ? ' class reached' : ' classes reached'); api.finish(doors * 100); return; }
        if (P.y > 0 && P.y < LN && hitT <= 0) { const px = ox + (P.x + 0.5) * cs; if (L[P.y - 1].s.some(s => Math.abs(s.x - px) < 13 + s.w * 9)) { hitT = 0.6; t = Math.max(0, t - 3); P.y = 0; } }
      },
      draw(c, W, H) {
        c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); const span = cols * cs;
        txt(c, 'Classes ' + doors, 16, 20, "700 14px 'Lato',sans-serif", INK, 'left'); txt(c, '0:' + String(Math.ceil(t)).padStart(2, '0'), W - 16, 20, "800 16px 'Lato',sans-serif", t < 8 ? RED : INK, 'right');
        c.fillStyle = BG; c.fillRect(ox, ly(LN - 1), span, lh * (LN - 1));
        for (let i = 1; i < LN; i++) { c.fillStyle = i % 2 ? '#f0f1f1' : BG; c.fillRect(ox, ly(i), span, lh); }
        for (let k = 0; k < cols; k++) { const X = ox + k * cs; c.fillStyle = k === doorX ? G : '#c9cdcd'; rr(c, X + 3, ly(LN) + 4, cs - 6, lh - 6, 3); c.fill(); if (k === doorX) txt(c, '214', X + cs / 2, ly(LN) + lh / 2 + 1, "700 10px 'Lato',sans-serif", '#fff'); else { c.fillStyle = '#b1b6b6'; c.fillRect(X + cs / 2 - 1, ly(LN) + 10, 2, 5); } }
        c.fillStyle = '#e9ebeb'; c.fillRect(ox, ly(0), span, lh);
        L.forEach((l, i) => { const y = ly(i + 1) + lh / 2; l.s.forEach(s => { for (let k = 0; k < s.w; k++) { c.beginPath(); c.arc(s.x + k * 18 * (l.sp > 0 ? -1 : 1), y, 9, 0, 7); c.fillStyle = s.c; c.fill(); c.beginPath(); c.arc(s.x + k * 18 * (l.sp > 0 ? -1 : 1), y, 4.5, 0, 7); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill(); } }); });
        const px = ox + (P.x + 0.5) * cs, py = ly(P.y) + lh / 2; if (!(hitT > 0 && ((hitT * 10) | 0) % 2)) { c.beginPath(); c.arc(px, py, 11, 0, 7); c.fillStyle = '#b9781a'; c.fill(); c.beginPath(); c.arc(px, py, 7, 0, 7); c.fillStyle = GOLD; c.fill(); c.fillStyle = INK; c.beginPath(); c.arc(px - 2.5, py - 1.5, 1.4, 0, 7); c.arc(px + 2.5, py - 1.5, 1.4, 0, 7); c.fill(); }
      }
    };
  };

  GAMES.copier = api => {
    let S, sp, strikes, spd, clock, P, flash;
    const belt = H => H * 0.55;
    return {
      title: 'Copier Jam', hint: 'Tap jammed (red) sheets before they reach the tray. Gold = 2 points.', height: () => 300,
      reset() { S = []; sp = 0.6; strikes = 0; spd = 90; clock = 0; P = []; flash = 0; api.score = 0; },
      update(dt, W, H) {
        flash = Math.max(0, flash - dt); P.forEach(p => { p.y -= 40 * dt; p.l -= dt; }); P = P.filter(p => p.l > 0);
        if (api.mode !== 'play') return; clock += dt; spd = 90 + clock * 6;
        sp -= dt; if (sp <= 0) { sp = Math.max(0.35, 1.0 - clock * 0.02); const r = Math.random(); S.push({ x: 92, k: r < 0.4 ? 'jam' : r < 0.52 ? 'gold' : 'ok', rot: (Math.random() - 0.5) * 0.5, lane: (Math.random() * 2) | 0 }); }
        const end = W - 90; S.forEach(s => s.x += spd * dt);
        S = S.filter(s => { if (s.x < end) return true; if (s.k === 'jam') { strikes++; flash = 0.35; if (strikes >= 3) { api.overText = 'Tray jammed'; api.finish(api.score); } } return false; });
      },
      tap(x, y, W, H) {
        const by = belt(H); for (let i = S.length - 1; i >= 0; i--) { const s = S[i], sy = by - 20 + s.lane * 44; if (Math.abs(x - s.x) < 22 && Math.abs(y - sy) < 26) { S.splice(i, 1);
          if (s.k === 'ok') { api.score = Math.max(0, api.score - 1); flash = 0.25; P.push({ x: s.x, y: sy, l: 0.6, s: '−1', c: RED }); }
          else { const v = s.k === 'gold' ? 2 : 1; api.score += v; P.push({ x: s.x, y: sy, l: 0.6, s: '+' + v, c: s.k === 'gold' ? GOLD : G }); } return; } }
      },
      key(k) { if (k === ' ' || k === 'Enter') { const s = S.filter(s => s.k !== 'ok').sort((a, b) => b.x - a.x)[0]; if (s) { S.splice(S.indexOf(s), 1); api.score += s.k === 'gold' ? 2 : 1; } } },
      draw(c, W, H) {
        c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); const by = belt(H), end = W - 90;
        txt(c, 'Score ' + api.score, 16, 20, "800 16px 'Lato',sans-serif", INK, 'left');
        for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(W - 60 + i * 20, 20, 6, 0, 7); c.fillStyle = i < strikes ? RED : LINE; c.fill(); }
        rr(c, 84, by - 52, end - 84, 104, 8); c.fillStyle = '#eef0f0'; c.fill();
        c.strokeStyle = '#d7dada'; c.lineWidth = 1; for (let x = 84 + ((clock * spd) % 24); x < end; x += 24) { c.beginPath(); c.moveTo(x, by - 50); c.lineTo(x, by + 50); c.stroke(); }
        rr(c, 14, by - 70, 80, 140, 10); c.fillStyle = DIM; c.fill(); rr(c, 22, by - 60, 64, 16, 4); c.fillStyle = '#9aa0a0'; c.fill(); c.beginPath(); c.arc(70, by + 40, 6, 0, 7); c.fillStyle = api.mode === 'play' ? G : '#9aa0a0'; c.fill();
        txt(c, 'COPY', 54, by + 4, "800 13px 'Lato',sans-serif", '#fff');
        rr(c, end, by - 56, 76, 112, 8); c.fillStyle = '#e0e2e2'; c.fill(); txt(c, 'TRAY', end + 38, by + 70, "700 10px 'Lato',sans-serif", DIM);
        for (let i = 0; i < Math.min(10, (api.score / 2) | 0); i++) { c.fillStyle = i % 2 ? '#fff' : '#f5f5f5'; c.fillRect(end + 10, by + 40 - i * 4, 56, 3); }
        S.forEach(s => { const sy = by - 20 + s.lane * 44; c.save(); c.translate(s.x, sy); c.rotate(s.k === 'jam' ? s.rot : 0);
          c.fillStyle = s.k === 'jam' ? '#f6d3cf' : s.k === 'gold' ? GOLD : '#ffffff'; c.strokeStyle = s.k === 'jam' ? RED : s.k === 'gold' ? '#a67c10' : '#c9cdcd'; c.lineWidth = 1.5;
          c.beginPath(); if (s.k === 'jam') { c.moveTo(-15, -18); c.lineTo(4, -21); c.lineTo(16, -14); c.lineTo(12, 3); c.lineTo(17, 19); c.lineTo(-2, 16); c.lineTo(-16, 20); c.lineTo(-12, 0); c.closePath(); } else c.rect(-14, -19, 28, 38); c.fill(); c.stroke();
          if (s.k !== 'jam') { c.fillStyle = s.k === 'gold' ? 'rgba(255,255,255,.6)' : '#dfe2e2'; for (let j = 0; j < 4; j++) c.fillRect(-9, -12 + j * 7, 18 - (j === 3 ? 8 : 0), 2); } else txt(c, '!', 0, 1, "800 16px 'Lato',sans-serif", RED);
          c.restore(); });
        P.forEach(p => { c.globalAlpha = Math.max(0, p.l / 0.6); txt(c, p.s, p.x, p.y - 30, "800 15px 'Lato',sans-serif", p.c); }); c.globalAlpha = 1;
        if (flash > 0) { c.strokeStyle = RED; c.globalAlpha = flash / 0.35; c.lineWidth = 8; c.strokeRect(0, 0, W, H); c.globalAlpha = 1; }
      }
    };
  };

  GAMES.bus = api => {
    const COLS = [G, GOLD, NAVY, RED]; let J, stops, B, sp, misses, clock, x0, yc, P;
    const geo = (W, H) => { const top = 52, bot = H - 22, h = bot - top; yc = top + h / 2; x0 = 16;
      const ys = [top + h * 0.12, top + h * 0.38, top + h * 0.62, top + h * 0.88];
      const old = J ? J.map(j => j.up) : [true, true, true];
      J = [{ x: W * 0.28, y: yc, a: [W * 0.55, (ys[0] + ys[1]) / 2], b: [W * 0.55, (ys[2] + ys[3]) / 2], up: old[0] },
           { x: W * 0.55, y: (ys[0] + ys[1]) / 2, a: [W - 70, ys[0]], b: [W - 70, ys[1]], up: old[1] },
           { x: W * 0.55, y: (ys[2] + ys[3]) / 2, a: [W - 70, ys[2]], b: [W - 70, ys[3]], up: old[2] }];
      stops = ys.map((y, i) => ({ x: W - 70, y, c: COLS[i] })); };
    const path = (b) => { const pts = [[x0, yc], [J[0].x, J[0].y]], j1 = J[0].up ? 1 : 2, j = J[j1]; pts.push([j.x, j.y]); pts.push(j.up ? j.a : j.b); return pts; };
    return {
      title: 'Bus Loop', hint: 'Tap the switches so each bus reaches its matching stop.', height: () => 320,
      reset(W, H) { J = null; geo(W, H); B = []; sp = 0.5; misses = 0; clock = 0; P = []; api.score = 0; },
      update(dt, W, H) {
        geo(W, H); P.forEach(p => { p.l -= dt; p.y -= 30 * dt; }); P = P.filter(p => p.l > 0);
        if (api.mode !== 'play') return; clock += dt; const v = 70 + clock * 2.2;
        sp -= dt; if (sp <= 0 && !B.some(b => b.seg === 0 && b.d < 70)) { sp = Math.max(1.3, 3.2 - clock * 0.05); B.push({ c: (Math.random() * 4) | 0, seg: 0, d: 0, pts: null }); }
        B.forEach(b => { b.d += v * dt;
          for (;;) { const pts = b.seg === 0 ? [[x0, yc], [J[0].x, J[0].y]] : b.pts, a = pts[b.seg === 0 ? 0 : b.seg], c2 = pts[b.seg === 0 ? 1 : b.seg + 1]; if (!c2) break;
            const len = Math.hypot(c2[0] - a[0], c2[1] - a[1]); if (b.d < len) break; b.d -= len;
            if (b.seg === 0) { b.pts = path(b); b.seg = 1; } else if (b.seg === 1) { const j = J[J[0].up ? 1 : 2]; b.pts = [b.pts[0], b.pts[1], b.pts[2], j.up ? j.a : j.b]; b.seg = 2; } else { b.done = true; break; } } });
        B = B.filter(b => { if (!b.done) return true; const end = b.pts[3], s = stops.find(s => Math.abs(s.y - end[1]) < 2);
          if (s && s.c === COLORS(b)) { api.score++; P.push({ x: end[0], y: end[1], s: '+1', c: G, l: 0.7 }); } else { misses++; P.push({ x: end[0], y: end[1], s: 'Wrong stop', c: RED, l: 0.9 }); if (misses >= 3) { api.overText = api.score + (api.score === 1 ? ' bus delivered' : ' buses delivered'); api.finish(api.score); } } return false; });
        function COLORS(b) { return COLS[b.c]; }
      },
      tap(x, y) { J.forEach(j => { if (Math.hypot(x - j.x, y - j.y) < 28) j.up = !j.up; }); },
      key(k) { const i = { '1': 0, '2': 1, '3': 2 }[k]; if (i != null) J[i].up = !J[i].up; },
      draw(c, W, H) {
        c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);
        txt(c, 'Delivered ' + api.score, 16, 20, "800 16px 'Lato',sans-serif", INK, 'left');
        for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(W - 60 + i * 20, 20, 6, 0, 7); c.fillStyle = i < misses ? RED : LINE; c.fill(); }
        c.lineCap = 'round'; c.lineJoin = 'round';
        const road = (pts, on) => { c.strokeStyle = on ? '#b7bcbc' : '#e4e6e6'; c.lineWidth = 18; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach(p => c.lineTo(p[0], p[1])); c.stroke(); };
        road([[x0, yc], [J[0].x, J[0].y]], true);
        J.forEach((j, i) => { const live = i === 0 || (J[0].up ? i === 1 : i === 2); road([[j.x, j.y], j.a], live && j.up); road([[j.x, j.y], j.b], live && !j.up); });
        c.setLineDash([6, 8]); c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, yc); c.lineTo(J[0].x, J[0].y); J.forEach(j => { c.moveTo(j.x, j.y); c.lineTo(...(j.up ? j.a : j.b)); }); c.stroke(); c.setLineDash([]);
        stops.forEach(s => { rr(c, s.x + 4, s.y - 14, 46, 28, 6); c.fillStyle = s.c; c.fill(); txt(c, 'STOP', s.x + 27, s.y + 1, "800 10px 'Lato',sans-serif", '#fff'); });
        J.forEach((j, i) => { c.beginPath(); c.arc(j.x, j.y, 17, 0, 7); c.fillStyle = INK; c.fill(); const tgt = j.up ? j.a : j.b, ang = Math.atan2(tgt[1] - j.y, tgt[0] - j.x);
          c.save(); c.translate(j.x, j.y); c.rotate(ang); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(9, 0); c.lineTo(-3, -7); c.lineTo(-3, 7); c.closePath(); c.fill(); c.fillRect(-9, -2, 8, 4); c.restore();
          txt(c, String(i + 1), j.x, j.y + 27, "700 10px 'Lato',sans-serif", DIM); });
        B.forEach(b => { const pts = b.seg === 0 ? [[x0, yc], [J[0].x, J[0].y]] : b.pts, a = pts[b.seg === 0 ? 0 : b.seg], e = pts[b.seg === 0 ? 1 : b.seg + 1]; if (!e) return;
          const len = Math.hypot(e[0] - a[0], e[1] - a[1]) || 1, f = Math.min(1, b.d / len), x = a[0] + (e[0] - a[0]) * f, y = a[1] + (e[1] - a[1]) * f, ang = Math.atan2(e[1] - a[1], e[0] - a[0]);
          c.save(); c.translate(x, y); c.rotate(ang); rr(c, -16, -8, 32, 16, 4); c.fillStyle = '#f2b705'; c.fill(); c.fillStyle = COLS[b.c]; c.fillRect(-12, -8, 18, 16); c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(8, -6, 5, 12); c.restore(); });
        P.forEach(p => { c.globalAlpha = Math.max(0, p.l / 0.7); txt(c, p.s, p.x, p.y - 22, "800 13px 'Lato',sans-serif", p.c); }); c.globalAlpha = 1;
      }
    };
  };

  class HubGame extends HTMLElement {
    static get observedAttributes() { return ['kind']; }
    connectedCallback() {
      if (this._c) return; this.style.display = 'block';
      const c = this._c = document.createElement('canvas'); c.tabIndex = 0; c.style.cssText = 'display:block;width:100%;outline:none;cursor:pointer;touch-action:none;-webkit-tap-highlight-color:transparent';
      this.appendChild(c); this.ctx = c.getContext('2d');
      c.addEventListener('pointerdown', e => { e.preventDefault(); c.focus({ preventScroll: true }); const r = c.getBoundingClientRect(); this.input('tap', e.clientX - r.left, e.clientY - r.top); });
      c.addEventListener('keydown', e => { const k = e.key; if ([' ', 'Enter', 'Backspace', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(k) || /^[a-z1-8]$/i.test(k)) { e.preventDefault(); this.input('key', k); } });
      this._ro = new ResizeObserver(() => this.size()); this._ro.observe(this);
      this.load(); let last = performance.now();
      const loop = t => { const dt = Math.min(0.05, (t - last) / 1000); last = t; this.frame(dt); this._raf = requestAnimationFrame(loop); }; this._raf = requestAnimationFrame(loop);
    }
    disconnectedCallback() { cancelAnimationFrame(this._raf); if (this._ro) this._ro.disconnect(); if (this._c) this._c.remove(); this._c = null; }
    attributeChangedCallback() { if (this._c) this.load(); }
    load() { this.kind = GAMES[this.getAttribute('kind')] ? this.getAttribute('kind') : 'stack'; this.plays = 0; this.score = 0; this.overText = ''; this.g = GAMES[this.kind](this); this.mode = 'ready'; this.size(true); if (this.g.autostart) this.start(); }
    size(force) {
      const W = Math.max(280, Math.round(this.clientWidth || 600)), H = this.g.height(W); if (!force && W === this.W && H === this.H) return;
      this.W = W; this.H = H; const d = window.devicePixelRatio || 1; this._c.width = W * d; this._c.height = H * d; this._c.style.height = H + 'px'; this.ctx.setTransform(d, 0, 0, d, 0, 0);
      if (force || this.mode !== 'play' || this.kind === 'maze') this.g.reset(W, H);
    }
    best() { return +localStorage.getItem('sfhub_game_' + this.kind) || 0; }
    start() { this.plays++; this.score = 0; this.overText = ''; this.g.reset(this.W, this.H); this.mode = 'play'; }
    finish(s) {
      this.score = s; this.mode = 'over'; this._overAt = performance.now(); this.newBest = s > 0 && s > this.best();
      if (this.newBest) try { localStorage.setItem('sfhub_game_' + this.kind, String(s)); } catch (e) {}
      this.dispatchEvent(new CustomEvent('gameover', { detail: { kind: this.kind, score: s }, bubbles: true }));
    }
    input(type, x, y) {
      if (this.mode === 'over') { if (performance.now() - this._overAt > 500 && (type === 'tap' || x === ' ' || x === 'Enter')) this.start(); return; }
      if (this.mode === 'ready') { this.start(); return; }
      if (type === 'tap') this.g.tap && this.g.tap(x, y, this.W, this.H); else this.g.key && this.g.key(x, this.W, this.H);
    }
    frame(dt) {
      const c = this.ctx, W = this.W, H = this.H; if (!W) return;
      this.g.update && this.g.update(dt, W, H); c.clearRect(0, 0, W, H); this.g.draw(c, W, H);
      if (this.mode === 'play') return;
      c.fillStyle = 'rgba(255,255,255,.86)'; c.fillRect(0, 0, W, H); const y = H / 2;
      if (this.mode === 'ready') { txt(c, this.g.title, W / 2, y - 34, "700 26px 'Neuton','Times New Roman',serif", INK); txt(c, this.g.hint || '', W / 2, y, "14px 'Lato',sans-serif", DIM); txt(c, 'Tap or press Space to start', W / 2, y + 34, "700 13px 'Lato',sans-serif", G); return; }
      txt(c, this.newBest ? 'New best!' : 'Game over', W / 2, y - 52, "700 13px 'Lato',sans-serif", this.newBest ? G : DIM);
      txt(c, String(this.score), W / 2, y - 16, "800 40px 'Lato',sans-serif", INK);
      txt(c, (this.overText ? this.overText + '  ·  ' : '') + 'Best ' + this.best(), W / 2, y + 22, "14px 'Lato',sans-serif", DIM);
      txt(c, 'Tap or press Space to play again', W / 2, y + 52, "700 13px 'Lato',sans-serif", G);
    }
  }
  customElements.define('hub-game', HubGame);
})();
