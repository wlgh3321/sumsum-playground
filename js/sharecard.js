/*
 * 점수 자랑 이미지 (1080 × 1350, 인스타·스레드에 올리기 좋은 세로 사진)
 * 결과 화면이 뜨면 미리 그려 두고, 버튼을 누르면 바로 공유 창을 띄워요.
 * (아이폰은 버튼을 누른 순간에 공유를 시작해야 해서, 누른 뒤에 그리면 공유 창이 안 떠요.)
 */
const ShareCard = (() => {
  const W = 1080;
  const H = 1350;
  const C = {
    bg: '#0d0a1c', grid: 'rgba(106, 77, 255, 0.16)', line: '#6a4dff', panel: '#161036',
    sun: '#ffe14d', pink: '#ff4da6', sky: '#4de1ff', lilac: '#b18cff', peach: '#ff9a4d', text: '#f2eeff', dim: '#a59ccf',
  };
  const PIX = '"Press Start 2P", "Galmuri11", monospace';
  const KO = '"Galmuri11", "Press Start 2P", sans-serif';

  let info = null;   // { r, game, value, best, stats }
  let file = null;   // 공유할 PNG 파일
  let busy = 0;      // 그리는 중 번호 (새로 그리면 이전 결과는 버려요)

  const fontsReady = (() => {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all([
      document.fonts.load('40px "Press Start 2P"', '0123456789'),
      document.fonts.load('700 40px "Galmuri11"', '가나다셈놀이터점초'),
      document.fonts.load('40px "Galmuri11"', '가나다셈놀이터점초'),
    ]).catch(() => {});
  })();

  // 새 로고(+−×÷ 블록 그림)를 미리 불러 둬요
  const logoImg = new Image();
  const logoReady = new Promise(res => { logoImg.onload = res; logoImg.onerror = res; });
  logoImg.src = '/logo-blocks.png?v=1';

  function rankLine(r) {
    const placed = typeof Ranking !== "undefined" && Ranking.placeFor(r);
    if (placed) return t('cardRank', { n: placed });
    const est = typeof Ranking !== "undefined" && Ranking.estimateFor && Ranking.estimateFor(r);
    if (est && est.ranked && est.n <= 10) return t('cardRankNow', { n: est.n });
    return '';
  }

  function text(ctx, s, x, y, font, color, align = 'center') {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(s, x, y);
  }
  // 글자가 칸보다 넓으면 줄여서 맞춰요.
  function fit(ctx, s, maxW, size, family, weight = '') {
    let px = size;
    do {
      ctx.font = `${weight} ${px}px ${family}`.trim();
      if (ctx.measureText(s).width <= maxW) break;
      px -= 2;
    } while (px > 16);
    return ctx.font;
  }
  function glow(ctx, color, blur) {
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
  }
  function noGlow(ctx) {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
  function box(ctx, x, y, w, h, stroke, fill, lw = 6) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    ctx.lineWidth = lw;
    ctx.strokeStyle = stroke;
    ctx.strokeRect(x + lw / 2, y + lw / 2, w - lw, h - lw);
  }

  function draw(canvas) {
    const r = info.r;
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'alphabetic';

    // 바탕 + 모눈
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 2;
    for (let x = 0; x <= W; x += 54) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += 54) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // 세로 배치: 위아래 여백이 똑같도록 전체 높이를 계산해서 가운데에 놓아요
    const LOGO_H = 150, BOX_H = 560, STAT_H = 130, CH_H = 50, URL_H = 28;
    const GAPS = [50, 36, 64, 30];
    const total = LOGO_H + BOX_H + STAT_H + CH_H + URL_H + GAPS.reduce((a, b) => a + b, 0);
    const top = Math.round((H - total) / 2);
    const yLogo = top;
    const yBox = yLogo + LOGO_H + GAPS[0];
    const yStat = yBox + BOX_H + GAPS[1];
    const yCh = yStat + STAT_H + GAPS[2];
    const yUrl = yCh + CH_H + GAPS[3];

    // 로고: [블록 그림] SUMSUM / 셈셈 놀이터 (사이트 위쪽 로고와 같은 모양)
    const title = 'SUMSUM';
    ctx.font = `84px ${PIX}`;
    const tw = ctx.measureText(title).width + 10;
    const gapL = 34;
    const rowW = LOGO_H + gapL + tw;
    const lx = Math.round((W - rowW) / 2);
    if (logoImg.complete && logoImg.naturalWidth) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(logoImg, lx, yLogo, LOGO_H, LOGO_H);
    }
    const tx = lx + LOGO_H + gapL;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = C.sky; ctx.fillText(title, tx + 10, yLogo + 2 + 10);
    ctx.fillStyle = C.pink; ctx.fillText(title, tx + 5, yLogo + 2 + 5);
    ctx.fillStyle = C.sun; ctx.fillText(title, tx, yLogo + 2);
    const sub = LANG === 'ko' ? '셈셈 놀이터' : 'PLAYGROUND';
    ctx.font = LANG === 'ko' ? `700 46px ${KO}` : `30px ${PIX}`;
    ctx.fillStyle = C.sky;
    ctx.fillText(sub, tx + 2, yLogo + (LANG === 'ko' ? 102 : 110));
    ctx.textBaseline = 'alphabetic';

    // 기록 상자
    const bx = 90, bw = W - 180, bh = 560;
    const rl = rankLine(r);
    const nBadge = (rl ? 1 : 0) + (info.best ? 1 : 0);
    const by0 = yBox;
    const by = by0 + (2 - nBadge) * 39; // 배지가 적으면 내용을 조금 내려서 가운데에 맞춰요
    glow(ctx, C.line, 30);
    box(ctx, bx, by0, bw, bh, C.line, C.panel, 8);
    noGlow(ctx);

    ctx.font = fit(ctx, info.game, bw - 80, 50, KO, '700');
    ctx.fillStyle = C.text; ctx.textAlign = 'center';
    ctx.fillText(info.game, W / 2, by + 100);
    text(ctx, t(r.labelKey), W / 2, by + 160, `34px ${KO}`, C.dim);

    // 큰 점수
    glow(ctx, 'rgba(255, 225, 77, 0.55)', 36);
    ctx.font = fit(ctx, info.value, bw - 100, 118, PIX);
    ctx.fillStyle = C.sun; ctx.textAlign = 'center';
    ctx.fillText(info.value, W / 2, by + 330);
    noGlow(ctx);

    // 배지 (순위 / 최고 기록)
    const badges = [];
    if (rl) badges.push([`🏆 ${rl}`, C.sun, C.bg]);
    if (info.best) badges.push([t('cardBest'), C.pink, '#fff']);
    let yb = by + 410;
    for (const [s, bg, fg] of badges.slice(0, 2)) {
      ctx.font = `700 34px ${KO}`;
      const w = ctx.measureText(s).width + 56;
      ctx.fillStyle = bg;
      ctx.fillRect(W / 2 - w / 2, yb, w, 62);
      text(ctx, s, W / 2, yb + 44, `700 34px ${KO}`, fg);
      yb += 78;
    }

    // 통계 세 칸
    const stats = (info.stats || []).slice(0, 3);
    const sw = (W - 180 - 2 * 24) / 3, sy = yStat, sh = STAT_H;
    stats.forEach(([label, v], i) => {
      const sx = 90 + i * (sw + 24);
      box(ctx, sx, sy, sw, sh, '#3d2f86', '#120d2b', 5);
      ctx.font = fit(ctx, String(v), sw - 30, 44, PIX);
      ctx.fillStyle = C.text; ctx.textAlign = 'center';
      ctx.fillText(String(v), sx + sw / 2, sy + 68);
      ctx.font = fit(ctx, label, sw - 30, 26, KO);
      ctx.fillStyle = C.dim;
      ctx.fillText(label, sx + sw / 2, sy + 110);
    });

    // 도전 문구 + 주소
    ctx.textBaseline = 'top';
    text(ctx, t('cardChallenge'), W / 2, yCh, `700 46px ${KO}`, C.text);
    text(ctx, 'sumsum.studiojhl.com', W / 2, yUrl, `26px ${PIX}`, C.sky);
    ctx.textBaseline = 'alphabetic';
  }

  async function render() {
    if (!info) return;
    const my = ++busy;
    file = null;
    await fontsReady;
    await logoReady;
    if (my !== busy || !info) return;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    try { draw(canvas); } catch (e) { return; }
    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    if (my !== busy || !blob) return;
    file = new File([blob], `sumsum-${info.r.mode}-${Date.now()}.png`, { type: 'image/png' });
  }

  let pending = Promise.resolve();
  function set(next) {
    info = next;
    pending = render();
  }

  function refresh() { render(); }

  function download(f) {
    const url = URL.createObjectURL(f);
    const a = document.createElement('a');
    a.href = url;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  // 버튼을 누르면 바로 불러요 (그림이 이미 준비돼 있어야 아이폰 공유 창이 떠요).
  async function share(onSaved) {
    if (!info) return;
    if (!file) await render();
    if (!file) return;
    const f = file;
    if (navigator.canShare && navigator.canShare({ files: [f] })) {
      try {
        await navigator.share({ files: [f] });
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return; // 사용자가 공유 창을 닫았어요
      }
    }
    download(f);
    if (onSaved) onSaved();
  }

  // 테스트용: 지금 그림을 data URL로
  function preview() {
    return file ? new Promise(res => { const rd = new FileReader(); rd.onload = () => res(rd.result); rd.readAsDataURL(file); }) : Promise.resolve(null);
  }

  // 그림이 다 그려지면 파일을 돌려줘요 (카톡에 미리 올릴 때 써요)
  const ready = () => pending.then(() => file);

  return { set, refresh, share, preview, ready };
})();
