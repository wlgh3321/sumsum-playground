/*
 * 배경음악: 직접 만든 레트로 칩튠 곡 두 개를 Web Audio API로 연주해요.
 *   - 홈 곡: 차분한 8마디 곡 / 게임 곡: 소개 영상에 쓴 신나는 곡
 * 음악 파일을 받지 않아요. (멜로디는 이 게임을 위해 새로 쓴 곡이에요)
 * - 멜로디: 사각파, 베이스: 삼각파, 하이햇: 짧은 잡음
 * - 브라우저 정책상 첫 터치/클릭 뒤에 소리가 나요.
 * - 다른 탭으로 가면 잠시 멈추고, 돌아오면 이어서 나와요.
 */
const Music = (() => {
  const BPM = 150;
  const STEP = 60 / BPM / 2; // 8분음표 한 칸 길이(초)
  const BAR = 8;             // 한 마디 = 8칸

  // 멜로디: [음, 길이(칸)] — 0은 쉼표
  const LEAD = [
    ['A4', 1], ['C5', 1], ['E5', 2], ['D5', 1], ['C5', 1], ['E5', 1], ['G5', 1],
    ['F5', 2], ['E5', 1], ['D5', 1], ['C5', 2], ['A4', 2],
    ['G4', 1], ['B4', 1], ['D5', 2], ['C5', 1], ['B4', 1], ['D5', 1], ['F5', 1],
    ['E5', 3], ['D5', 1], ['E5', 2], [0, 2],
    ['A5', 1], ['G5', 1], ['E5', 1], ['C5', 1], ['D5', 1], ['E5', 1], ['G5', 2],
    ['F5', 1], ['E5', 1], ['D5', 1], ['C5', 1], ['B4', 2], ['G4', 2],
    ['A4', 1], ['C5', 1], ['E5', 1], ['A5', 1], ['G5', 1], ['E5', 1], ['F5', 1], ['D5', 1],
    ['E5', 2], ['C5', 1], ['B4', 1], ['A4', 4],
  ];
  // 마디별 베이스 뿌리음 (반 마디씩)
  const BASS = [
    ['A2', 'A2'], ['F2', 'F2'], ['G2', 'G2'], ['E2', 'E2'],
    ['A2', 'A2'], ['F2', 'G2'], ['A2', 'A2'], ['E2', 'A2'],
  ];
  const TOTAL = BASS.length * BAR;

  function freq(name) {
    const m = /^([A-G])(#?)(\d)$/.exec(name);
    const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] ? 1 : 0);
    const midi = (Number(m[3]) + 1) * 12 + base;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // 칸 번호 → 그 칸에서 시작하는 멜로디 음
  const leadAt = new Map();
  (() => {
    let pos = 0;
    for (const [n, len] of LEAD) {
      if (n) leadAt.set(pos, { f: freq(n), len });
      pos += len;
    }
  })();

  let ctx = null, master = null, noise = null, timer = null;
  let playing = false, wanted = false, nextTime = 0, step = 0;

  function context() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      // 하이햇용 잡음
      noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) {
      ctx = null;
    }
    return ctx;
  }

  function note(f, t, dur, type, vol) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.setValueAtTime(vol, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function hat(t, vol) {
    const s = ctx.createBufferSource();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    s.buffer = noise;
    f.type = 'highpass';
    f.frequency.value = 7000;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t);
  }

  /* ---------- 두 번째 곡: 게임할 때 나오는 신나는 곡 (소개 영상과 같은 곡) ---------- */
  const mf = m => 440 * Math.pow(2, (m - 69) / 12);
  const G_MEL = [72, 76, 79, 76, 74, 72, 74, 76, 72, 69, 72, 76, 79, 77, 76, 74,
                 77, 76, 74, 72, 69, 72, 74, 72, 71, 74, 79, 77, 76, 74, 72, 71];
  const G_PROG = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]];
  const G_BASS = [36, 33, 29, 31];

  function drum(t, vol, freq, decay) {
    const s = ctx.createBufferSource();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    s.buffer = noise;
    s.loop = true;
    f.type = 'lowpass';
    f.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t);
    s.stop(t + decay + 0.02);
  }

  function playGameStep(i, t) {
    const bar = Math.floor(i / BAR) % 4;
    note(mf(G_MEL[i % G_MEL.length]), t, STEP * 0.9, 'square', 0.04);
    if (i % 2 === 0) note(mf(G_BASS[bar] + (i % 4 === 2 ? 12 : 0)), t, STEP * 1.8, 'triangle', 0.09);
    else note(mf(G_PROG[bar][(i >> 1) % 3] + 12), t, STEP * 0.5, 'square', 0.018);
    if (i % 4 === 0) drum(t, 0.18, 300, 0.12);
    if (i % 4 === 2) drum(t, 0.1, 2500, 0.08);
    hat(t, 0.015);
  }

  const SONGS = { home: { total: TOTAL, play: (i, t) => playHomeStep(i, t) }, game: { total: 32, play: playGameStep } };
  let song = 'home';

  function playHomeStep(i, t) {
    const lead = leadAt.get(i);
    if (lead) note(lead.f, t, lead.len * STEP * 0.92, 'square', 0.045);
    const bar = Math.floor(i / BAR), inBar = i % BAR;
    const root = freq(BASS[bar][inBar < 4 ? 0 : 1]);
    note(inBar % 2 ? root * 2 : root, t, STEP * 0.85, 'triangle', 0.09);
    if (inBar % 2) hat(t, 0.025);
  }

  function tick() {
    const sg = SONGS[song];
    while (nextTime < ctx.currentTime + 0.15) {
      sg.play(step, nextTime);
      nextTime += STEP;
      step = (step + 1) % sg.total;
    }
  }

  // 홈 곡 ↔ 게임 곡 바꾸기. 소리가 켜져 있으면 바로 새 곡으로 넘어가요.
  function setSong(name) {
    if (!SONGS[name] || name === song) return;
    song = name;
    if (playing) {
      halt();
      start();
    }
  }

  function start() {
    wanted = true;
    if (playing || document.hidden) return;
    const c = context();
    if (!c) return;
    if (c.state !== 'running') c.resume().catch(() => {});
    master = c.createGain();
    master.gain.value = 0.8;
    master.connect(c.destination);
    playing = true;
    step = 0;
    nextTime = c.currentTime + 0.08;
    timer = setInterval(tick, 40);
  }

  function halt() {
    if (!playing) return;
    playing = false;
    clearInterval(timer);
    const m = master;
    try {
      m.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
      setTimeout(() => m.disconnect(), 300);
    } catch (e) {}
  }

  function stop() {
    wanted = false;
    halt();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) halt();
    else if (wanted) start();
  });
  // 전화·알림 등으로 끊겼다가 돌아오면 다시 깨워요
  window.addEventListener('pointerdown', () => { if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {}); }, true);

  return { start, stop, setSong, isWanted: () => wanted };
})();
