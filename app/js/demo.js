/*
 * 홈 미리보기 (데모 화면)
 * 실제 녹화 영상 대신, 미리보기 칸의 크기(가로·세로)에 맞춰 게임 장면을 바로 그려요.
 * 그래서 아이폰·갤럭시·아이패드·갤럭시탭 어디서든 잘리거나 찌그러지지 않아요.
 * 각 게임마다 몇 초짜리 장면이 계속 반복돼요.
 */
const Demo = (() => {
  const PIX = '"Press Start 2P", "Galmuri11", monospace';
  const TITLE = '"Do Hyeon", "Galmuri11", sans-serif';
  const C = {
    bg: '#0d0a1c', paper: '#1a1438', field: '#120d2b', line: '#6a4dff', ink: '#3d2f86',
    text: '#f2eeff', dim: '#9d93c9', sun: '#ffe14d', mint: '#4de1ff', pink: '#ff4da6', lilac: '#b08cff', peach: '#ff9a4d', ok: '#5dff9d',
  };
  const OPC = { '+': C.mint, '−': C.pink, '×': C.sun, '÷': C.lilac };

  let canvas = null, ctx = null, mode = 'fall', raf = 0, running = false, t0 = 0;
  let W = 0, H = 0, S = 10; // S: 기준 크기(작은 쪽 길이에 맞춰 계산)
  const balloonImg = [];

  /* ---------- 준비 ---------- */
  function mount(box) {
    canvas = document.createElement('canvas');
    canvas.className = 'pv-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    box.prepend(canvas);
    ctx = canvas.getContext('2d');
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    resize();
    loadBalloons();
  }

  function resize() {
    if (!canvas) return;
    const r = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    S = Math.max(8, Math.min(W / 18, H / 11));
    if (!running) frame(performance.now());
  }

  // 게임에서 쓰는 도트 풍선 그림(CSS)을 그대로 가져와요
  function loadBalloons() {
    for (let i = 0; i < 4; i++) {
      const el = document.createElement('div');
      el.className = `balloon c${i}`;
      el.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden';
      document.body.appendChild(el);
      const bg = getComputedStyle(el, '::before').backgroundImage;
      el.remove();
      const m = /url\("?(.*?)"?\)$/.exec(bg || '');
      if (!m) continue;
      const img = new Image();
      img.src = m[1].replace(/\\"/g, '"');
      balloonImg[i] = img;
    }
  }

  /* ---------- 그리기 도구 ---------- */
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  function mix(a, b, k) {
    const x = hex(a), y = hex(b);
    return `rgb(${x.map((v, i) => Math.round(v * (1 - k) + y[i] * k)).join(',')})`;
  }
  const R = v => Math.round(v);

  // 키캡 블록: 위·왼쪽 밝게, 아래·오른쪽 어둡게, 모서리는 대각선
  function key(x, y, w, h, base, opt = {}) {
    x = R(x); y = R(y); w = R(w); h = R(h);
    const dark = opt.dark;
    const b = Math.max(3, R(Math.min(w, h) * 0.08));
    const press = opt.pressed ? 2 : 0;
    x += press; y += press;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(x + 3 - press, y + 3 - press, w, h);
    ctx.fillStyle = base;
    ctx.fillRect(x, y, w, h);
    const hi = dark ? mix(base, C.line, 0.35) : mix(base, '#ffffff', 0.42);
    const lo = mix(base, '#000000', 0.5);
    const top = opt.pressed ? lo : hi, bot = opt.pressed ? hi : lo;
    poly(top, [[x, y], [x + w, y], [x + w - b, y + b], [x + b, y + b]]);
    poly(top, [[x, y], [x + b, y + b], [x + b, y + h - b], [x, y + h]]);
    poly(bot, [[x, y + h], [x + b, y + h - b], [x + w - b, y + h - b], [x + w, y + h]]);
    poly(bot, [[x + w, y], [x + w, y + h], [x + w - b, y + h - b], [x + w - b, y + b]]);
    if (opt.label != null) {
      txt(opt.label, x + w / 2, y + h / 2 + (opt.sub ? -h * 0.12 : 0), opt.size || h * 0.36, opt.color || (dark ? C.text : C.bg), opt.font || PIX);
      if (opt.sub) txt(opt.sub, x + w / 2, y + h * 0.74, opt.subSize || h * 0.16, opt.color || C.bg, TITLE);
    }
  }
  function poly(color, pts) {
    ctx.fillStyle = color;
    ctx.beginPath();
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.closePath();
    ctx.fill();
  }
  function txt(s, x, y, size, color, font = PIX, align = 'center') {
    ctx.font = `${R(size)}px ${font}`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.fillText(s, R(x), R(y));
  }
  // 글자가 칸보다 넓으면 줄여요
  function fitSize(s, maxW, size, font = PIX) {
    ctx.font = `${R(size)}px ${font}`;
    const w = ctx.measureText(s).width;
    return w > maxW ? size * (maxW / w) : size;
  }
  function frameBox(x, y, w, h, stroke = C.line) {
    x = R(x); y = R(y); w = R(w); h = R(h);
    ctx.fillStyle = C.ink;
    ctx.fillRect(x + 3, y + 3, w, h);
    ctx.fillStyle = C.field;
    ctx.fillRect(x, y, w, h);
    // 모눈
    ctx.strokeStyle = 'rgba(106,77,255,0.16)';
    ctx.lineWidth = 1;
    const g = Math.max(14, R(S * 1.3));
    ctx.beginPath();
    for (let gx = x + g; gx < x + w; gx += g) { ctx.moveTo(gx + 0.5, y); ctx.lineTo(gx + 0.5, y + h); }
    for (let gy = y + g; gy < y + h; gy += g) { ctx.moveTo(x, gy + 0.5); ctx.lineTo(x + w, gy + 0.5); }
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = stroke;
    ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  }
  // 손가락으로 누른 자리: 퍼지는 링
  function tap(x, y, age) {
    if (age < 0 || age > 0.4) return;
    const k = age / 0.4;
    ctx.save();
    ctx.globalAlpha = 1 - k;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(2, S * 0.18);
    ctx.beginPath();
    ctx.arc(x, y, S * (0.5 + k * 1.1), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  // 위로 떠오르는 +10
  function pop(s, x, y, age, color = C.ok) {
    if (age < 0 || age > 0.7) return;
    ctx.save();
    ctx.globalAlpha = 1 - age / 0.7;
    ctx.shadowColor = color; ctx.shadowBlur = 10;
    txt(s, x, y - age * S * 2.2, S * 0.85, color);
    ctx.restore();
  }
  function hud(items, y, h) {
    const n = items.length, gap = S * 0.4;
    const w = (W - pad() * 2 - gap * (n - 1)) / n;
    items.forEach(([label, v, col], i) => {
      const x = pad() + i * (w + gap);
      ctx.fillStyle = C.ink; ctx.fillRect(R(x + 2), R(y + 2), R(w), R(h));
      ctx.fillStyle = C.paper; ctx.fillRect(R(x), R(y), R(w), R(h));
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(R(x) + 1, R(y) + 1, R(w) - 2, R(h) - 2);
      txt(label, x + w / 2, y + h * 0.3, Math.min(h * 0.24, S * 0.5), C.dim, TITLE);
      txt(v, x + w / 2, y + h * 0.68, fitSize(v, w - 8, Math.min(h * 0.32, S * 0.6)), col || C.sun);
    });
  }
  const pad = () => Math.max(10, R(S * 0.9));
  const L = k => t(k);

  /* ---------- 게임별 장면 ---------- */
  const SCENES = {
    // 문제 비: 카드가 떨어지고, 아래 칸에 답이 쳐지면 터져요
    fall: {
      len: 7.2,
      draw(tm) {
        const P = pad();
        const inH = Math.max(34, S * 2);
        const fx = P, fy = P, fw = W - P * 2, fh = H - P * 3 - inH;
        frameBox(fx, fy, fw, fh);
        ctx.fillStyle = C.pink; ctx.fillRect(R(fx + 3), R(fy + fh - 9), R(fw - 6), 6);
        const cards = [
          { s: 0.0, e: 2.4, x: 0.04, q: '4 × 8', a: '32', op: '×' },
          { s: 1.0, e: 3.7, x: 0.96, q: '19 − 6', a: '13', op: '−' },
          { s: 2.3, e: 5.0, x: 0.10, q: '18 ÷ 3', a: '6', op: '÷' },
          { s: 3.5, e: 6.3, x: 0.86, q: '7 + 9', a: '16', op: '+' },
        ];
        const cs = Math.min(S * 0.62, fw / 15);
        let typed = '', score = 0;
        for (const c of cards) {
          const cw = fitSize(c.q, fw, cs) && ctx.measureText(c.q).width + cs * 1.6;
          const ch = cs * 2.2;
          const x = fx + 6 + c.x * (fw - cw - 12);
          if (tm >= c.e) {
            score += 10;
            pop('+10', x + cw / 2, fy + (fh - ch - 12) * 0.8, tm - c.e);
            continue;
          }
          if (tm < c.s) continue;
          const k = (tm - c.s) / (c.e - c.s);
          const y = fy + 6 + k * (fh - ch - 12) * 0.82;
          ctx.save();
          ctx.shadowColor = OPC[c.op]; ctx.shadowBlur = 10;
          ctx.fillStyle = 'rgba(13,10,28,0.9)'; ctx.fillRect(R(x), R(y), R(cw), R(ch));
          ctx.restore();
          ctx.strokeStyle = OPC[c.op]; ctx.lineWidth = 2;
          ctx.strokeRect(R(x) + 1, R(y) + 1, R(cw) - 2, R(ch) - 2);
          txt(c.q, x + cw / 2, y + ch / 2 + 1, cs, OPC[c.op]);
          const left = c.e - tm;
          if (left < 0.75) typed = c.a.slice(0, Math.min(c.a.length, Math.floor((0.75 - left) / 0.22) + 1));
        }
        txt(`${score}`, fx + fw - 10, fy + 16 + S * 0.3, S * 0.55, C.sun, PIX, 'right');
        // 답 칸
        const iy = fy + fh + P;
        ctx.fillStyle = C.paper; ctx.fillRect(R(fx), R(iy), R(fw), R(inH));
        ctx.strokeStyle = C.mint; ctx.lineWidth = 3; ctx.strokeRect(R(fx) + 1.5, R(iy) + 1.5, R(fw) - 3, R(inH) - 3);
        const blink = Math.floor(tm * 2) % 2 === 0;
        txt(typed || (blink ? '_' : ''), fx + fw / 2, iy + inH / 2, Math.min(inH * 0.45, S * 0.9), typed ? C.text : C.mint);
      },
    },

    // 1분 도전: 보기 중에서 정답을 콕
    minute: {
      len: 6.0,
      draw(tm) {
        const P = pad();
        const Q = [['5 + 8', 13, [7, 13, 15, 11, 9, 18]], ['24 ÷ 6', 4, [6, 3, 4, 8, 5, 2]], ['7 × 6', 42, [36, 48, 42, 49, 35, 40]], ['16 − 9', 7, [5, 9, 6, 8, 7, 4]], ['9 + 9', 18, [17, 19, 16, 18, 27, 81]]];
        const per = this.len / Q.length;
        const i = Math.floor(tm / per) % Q.length, a = tm - i * per;
        const [q, ans, ch] = Q[i];
        const hudH = Math.max(30, S * 1.7);
        hud([[L('sbScore'), String(40 + i * 10)], [L('sbTime'), `${57 - i}${t('secUnit')}`]], P, hudH);
        const eqY = P + hudH + S * 1.6;
        const eq = `${q} = ?`;
        txt(eq, W / 2, eqY, fitSize(eq, W - P * 2, S * 1.1), C.text);
        const top = eqY + S * 1.4, bottom = H - P;
        const cols = W >= (bottom - top) * 1.2 ? 3 : 2, rows = 6 / cols;
        const gap = S * 0.45;
        const cw = (W - P * 2 - gap * (cols - 1)) / cols;
        const chh = Math.min(S * 2.6, (bottom - top - gap * (rows - 1)) / rows);
        const gy = top + ((bottom - top) - (chh * rows + gap * (rows - 1))) / 2;
        const tapAt = per * 0.62;
        ch.forEach((v, k) => {
          const x = P + (k % cols) * (cw + gap), y = gy + Math.floor(k / cols) * (chh + gap);
          const hit = v === ans && a >= tapAt;
          key(x, y, cw, chh, hit ? C.mint : C.paper, { dark: !hit, pressed: hit && a < tapAt + 0.15, label: String(v), size: Math.min(chh * 0.36, S * 0.8), color: hit ? C.bg : C.text });
          if (v === ans) { tap(x + cw / 2, y + chh / 2, a - tapAt); pop('+10', x + cw / 2, y, a - tapAt); }
        });
      },
    },

    // 60문제 타임어택: 답을 쳐서 60문제를 빨리
    race: {
      len: 6.6,
      draw(tm) {
        const P = pad();
        const Q = [['8 + 6', '14'], ['9 × 3', '27'], ['20 − 7', '13'], ['36 ÷ 4', '9'], ['15 + 8', '23'], ['6 × 7', '42']];
        const per = this.len / Q.length;
        const i = Math.floor(tm / per) % Q.length, a = tm - i * per;
        const [q, ans] = Q[i];
        const done = 7 + i + (a > per * 0.8 ? 1 : 0);
        const hudH = Math.max(30, S * 1.7);
        hud([[L('sbProgress'), `${done}/60`], [L('sbTime'), `${(4.2 + tm * 1.0).toFixed(1)}${t('secUnit')}`]], P, hudH);
        // 진행 막대
        const by = P + hudH + S * 0.6, bw = W - P * 2, bh = Math.max(6, S * 0.4);
        ctx.fillStyle = C.paper; ctx.fillRect(R(P), R(by), R(bw), R(bh));
        ctx.fillStyle = C.peach; ctx.fillRect(R(P), R(by), R(bw * done / 60), R(bh));
        const roomTall = H - (by + bh) > S * 9.5;
        const eqY = by + bh + S * 1.6;
        const eq = `${q} = ?`;
        txt(eq, W / 2, eqY, fitSize(eq, W - P * 2, S * 1.05), C.text);
        const typedN = Math.min(ans.length, Math.max(0, Math.floor((a - per * 0.25) / 0.18) + 1));
        const typed = a > per * 0.25 ? ans.slice(0, typedN) : '';
        const inH = Math.max(32, S * 1.9), iy = eqY + S * 1.2;
        ctx.fillStyle = C.paper; ctx.fillRect(R(P), R(iy), R(bw), R(inH));
        ctx.strokeStyle = a > per * 0.8 ? C.ok : C.mint; ctx.lineWidth = 3; ctx.strokeRect(R(P) + 1.5, R(iy) + 1.5, R(bw) - 3, R(inH) - 3);
        txt(typed || '_', W / 2, iy + inH / 2, Math.min(inH * 0.45, S * 0.9), typed ? C.text : C.mint);
        if (a > per * 0.8) txt('✓', P + bw - S, iy + inH / 2, S * 0.9, C.ok, TITLE);
        // 공간이 넉넉하면 숫자패드도 보여 줘요
        const kTop = iy + inH + S * 0.7, kBottom = H - P;
        if (kBottom - kTop > S * 4.5) {
          const rows = 4, cols = 3, gap = S * 0.35;
          const kh = Math.min(S * 2.2, (kBottom - kTop - gap * (rows - 1)) / rows);
          const kw = (bw - gap * 2) / cols;
          const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'];
          const ky0 = kTop + (kBottom - kTop - (kh * rows + gap * (rows - 1))) / 2;
          // 지금 누르는 키
          let cur = null, curAge = 9;
          for (let d = 0; d < typedN && a > per * 0.25; d++) {
            const at = per * 0.25 + d * 0.18;
            if (a - at < 0.18) { cur = ans[d]; curAge = a - at; }
          }
          if (a > per * 0.7 && a < per * 0.85) { cur = 'OK'; curAge = a - per * 0.7; }
          keys.forEach((k, n) => {
            const x = P + (n % cols) * (kw + gap), y = ky0 + Math.floor(n / cols) * (kh + gap);
            const isOk = k === 'OK', isC = k === 'C';
            const on = k === cur;
            key(x, y, kw, kh, isOk ? C.sun : isC ? '#2a0f2e' : C.paper, { dark: !isOk, pressed: on && curAge < 0.12, label: k, size: Math.min(kh * 0.36, S * 0.7), color: isOk ? C.bg : isC ? C.pink : C.text });
            if (on) tap(x + kw / 2, y + kh / 2, curAge);
          });
        } else if (!roomTall) {
          pop('+1', W / 2, iy, a - per * 0.8, C.peach);
        }
      },
    },

    // 풍선 팡팡: 정답 풍선을 터뜨려요
    balloon: {
      len: 7.5,
      draw(tm) {
        const P = pad();
        const Q = [['13 + 17', 30, [40, 22, 30, 20]], ['8 × 8', 64, [64, 66, 72, 56]], ['45 ÷ 9', 5, [9, 5, 6, 4]]];
        const per = this.len / Q.length;
        const i = Math.floor(tm / per) % Q.length, a = tm - i * per;
        const [q, ans, vals] = Q[i];
        const eqY = P + S * 1.0;
        const eq = `${q} = ?`;
        txt(eq, W / 2, eqY, fitSize(eq, W - P * 2, S * 0.95), C.text);
        const fy = eqY + S * 1.0, fh = H - P - fy, fx = P, fw = W - P * 2;
        frameBox(fx, fy, fw, fh);
        const bw = Math.min(fw / 5, fh * 0.5 * 0.75);
        const bh = bw * 16 / 12;
        const popAt = per * 0.55;
        ctx.save();
        ctx.beginPath(); ctx.rect(fx + 3, fy + 3, fw - 6, fh - 6); ctx.clip();
        vals.forEach((v, k) => {
          const slot = (fw - bw * 4) / 5;
          const x = fx + slot + k * (bw + slot);
          const delay = [0, 0.25, 0.1, 0.35][k];
          const rise = Math.max(0, a - delay) / per;
          const y = fy + fh - Math.min(1, rise) * (fh - 8) + (k % 2) * bh * 0.08;
          if (v === ans && a >= popAt) {
            const age = a - popAt;
            if (age < 0.25) {
              ctx.fillStyle = C.sun;
              for (let p = 0; p < 8; p++) {
                const ang = p * Math.PI / 4, d = bw * (0.3 + age * 3);
                ctx.fillRect(R(x + bw / 2 + Math.cos(ang) * d - 3), R(y + bh * 0.4 + Math.sin(ang) * d - 3), 6, 6);
              }
            }
            tap(x + bw / 2, y + bh * 0.4, age);
            pop('+10', x + bw / 2, y + bh * 0.2, age);
            return;
          }
          const img = balloonImg[k];
          if (img && img.complete && img.naturalWidth) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, R(x), R(y), R(bw), R(bh));
          } else {
            ctx.fillStyle = [C.mint, C.sun, C.pink, C.lilac][k];
            ctx.fillRect(R(x), R(y), R(bw), R(bh * 0.75));
          }
          txt(String(v), x + bw / 2, y + bh * 0.38, Math.min(bw * 0.3, S * 0.75), C.bg);
        });
        ctx.restore();
      },
    },

    // 시간 버티기: 맞히면 시간이 늘어요
    beat: {
      len: 6.0,
      draw(tm) {
        const P = pad();
        const Q = [['20 + 4', 24, [24, 7, 14, 34]], ['6 × 4', 24, [30, 24, 20, 18]], ['17 − 9', 8, [9, 7, 8, 6]], ['63 ÷ 7', 9, [7, 9, 8, 6]]];
        const per = this.len / Q.length;
        const i = Math.floor(tm / per) % Q.length, a = tm - i * per;
        const [q, ans, ch] = Q[i];
        const tapAt = per * 0.6;
        // 시간 막대: 줄어들다가 맞히면 늘어나요
        const base = 0.62 - (a / per) * 0.12 + (a >= tapAt ? 0.14 : 0);
        const hudH = Math.max(30, S * 1.7);
        hud([[L('sbTime'), `${Math.round(base * 30)}${t('secUnit')}`], [L('sbScore'), String(50 + i * 10)], [L('sbCombo'), String(5 + i)]], P, hudH);
        const by = P + hudH + S * 0.7, bw = W - P * 2, bh = Math.max(10, S * 0.7);
        ctx.fillStyle = C.paper; ctx.fillRect(R(P), R(by), R(bw), R(bh));
        ctx.fillStyle = C.mint; ctx.fillRect(R(P + 3), R(by + 3), R((bw - 6) * Math.min(1, base)), R(bh - 6));
        ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.strokeRect(R(P) + 1.5, R(by) + 1.5, R(bw) - 3, R(bh) - 3);
        pop(`+2${t('secUnit')}`, P + bw * base, by, a - tapAt, C.mint);
        const eqY = by + bh + S * 1.5;
        const eq = `${q} = ?`;
        txt(eq, W / 2, eqY, fitSize(eq, W - P * 2, S * 1.05), C.text);
        const top = eqY + S * 1.3, bottom = H - P, gap = S * 0.45;
        const cols = 2, rows = 2;
        const cw = (bw - gap) / cols;
        const chh = Math.min(S * 2.8, (bottom - top - gap) / rows);
        const gy = top + ((bottom - top) - (chh * 2 + gap)) / 2;
        ch.forEach((v, k) => {
          const x = P + (k % 2) * (cw + gap), y = gy + Math.floor(k / 2) * (chh + gap);
          const hit = v === ans && a >= tapAt;
          key(x, y, cw, chh, hit ? C.lilac : C.paper, { dark: !hit, pressed: hit && a < tapAt + 0.15, label: String(v), size: Math.min(chh * 0.34, S * 0.85), color: hit ? C.bg : C.text });
          if (v === ans) tap(x + cw / 2, y + chh / 2, a - tapAt);
        });
      },
    },

    // 참 거짓 스피드: 식이 맞으면 O, 틀리면 X
    tf: {
      len: 6.0,
      draw(tm) {
        const P = pad();
        const Q = [['7 × 2 = 14', true], ['8 ÷ 2 = 5', false], ['13 + 6 = 19', true], ['9 − 4 = 6', false]];
        const per = this.len / Q.length;
        const i = Math.floor(tm / per) % Q.length, a = tm - i * per;
        const [eq, yes] = Q[i];
        const tapAt = per * 0.55;
        const qY = P + S * 0.8;
        txt(t('tfQuestion'), W / 2, qY, S * 0.6, C.dim, TITLE);
        const eqY = qY + S * 1.5;
        txt(eq, W / 2, eqY, fitSize(eq, W - P * 2, S * 1.15), C.text);
        const top = eqY + S * 1.3, bottom = H - P, gap = S * 0.6;
        const bw = Math.min((W - P * 2 - gap) / 2, (bottom - top) * 1.1);
        const bh = Math.min(bottom - top, bw * 1.0);
        const x0 = (W - (bw * 2 + gap)) / 2, y0 = top + ((bottom - top) - bh) / 2;
        [[true, C.mint, 'O', t('tfTrue')], [false, C.pink, 'X', t('tfFalse')]].forEach(([v, col, mark, word], k) => {
          const x = x0 + k * (bw + gap);
          const on = v === yes && a >= tapAt && a < tapAt + 0.15;
          key(x, y0, bw, bh, col, { pressed: on, label: mark, size: Math.min(bh * 0.4, S * 2), sub: word, subSize: Math.min(bh * 0.13, S * 0.6) });
          if (v === yes) { tap(x + bw * 0.72, y0 + bh * 0.72, a - tapAt); pop('+10', x + bw / 2, y0, a - tapAt); }
        });
      },
    },
  };

  /* ---------- 움직이기 ---------- */
  function frame(now) {
    if (!ctx || !W) return;
    const sc = SCENES[mode] || SCENES.fall;
    const tm = ((now - t0) / 1000) % sc.len;
    ctx.clearRect(0, 0, W, H);
    try { sc.draw(tm); } catch (e) { /* 그리다 실패해도 앱은 계속 */ }
  }
  function loop(now) {
    if (!running) return;
    frame(now);
    raf = requestAnimationFrame(loop);
  }
  function play() {
    if (running || !canvas) return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { frame(t0 + 2500); return; }
    running = true;
    raf = requestAnimationFrame(loop);
  }
  function pause() {
    running = false;
    cancelAnimationFrame(raf);
  }
  function set(m) {
    if (m === mode && t0) return;
    mode = m;
    t0 = performance.now();
    if (!running) frame(t0 + 1500);
  }
  // 글꼴이 늦게 오면 한 번 더 그려요
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!running) frame(performance.now()); });

  return { mount, set, play, pause, resize };
})();
