/*
 * 효과음: Web Audio API로 8비트 오락실 소리를 바로 만들어요. 파일을 받지 않아요.
 * 브라우저 정책 때문에 AudioContext는 첫 터치/클릭 뒤에 만들어요.
 * 아이폰 무음(진동) 모드에서도 들리도록 오디오 세션을 '재생'으로 맞춰요.
 */
const Sound = (() => {
  let ctx = null;
  let enabled = true;
  let lastTick = 0;

  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}

  function getContext() {
    try {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    } catch (e) {
      return null;
    }
  }

  // 첫 터치 때 소리 장치를 깨워 둬요 (아이폰은 이걸 안 하면 첫 소리가 안 나요)
  const unlock = () => {
    const c = getContext();
    if (c) {
      try {
        const b = c.createBuffer(1, 1, 22050);
        const s = c.createBufferSource();
        s.buffer = b; s.connect(c.destination); s.start(0);
      } catch (e) {}
    }
  };
  ['pointerdown', 'touchend', 'keydown'].forEach(ev => window.addEventListener(ev, unlock, { capture: true, passive: true }));

  function tone(freq, start, dur, type = 'square', vol = 0.12, slide = 0) {
    if (!enabled) return;
    try {
      const c = getContext();
      if (!c) return;
      const t0 = c.currentTime + start;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch (e) {
      // 소리가 안 나와도 게임은 계속돼요.
    }
  }

  function noise(start, dur, vol = 0.08, hp = 1200) {
    if (!enabled) return;
    try {
      const c = getContext();
      if (!c) return;
      const t0 = c.currentTime + start;
      const len = Math.max(1, Math.floor(c.sampleRate * dur));
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = c.createBufferSource();
      src.buffer = buf;
      const f = c.createBiquadFilter();
      f.type = 'highpass'; f.frequency.value = hp;
      const g = c.createGain();
      g.gain.value = vol;
      src.connect(f); f.connect(g); g.connect(c.destination);
      src.start(t0);
    } catch (e) {}
  }

  return {
    setEnabled(on) { enabled = !!on; },
    // 버튼 딸깍
    tap() { tone(1250, 0, 0.035, 'square', 0.05); },
    // 고르기(게임 버튼·탭)
    select() { tone(660, 0, 0.05, 'square', 0.06); tone(990, 0.045, 0.06, 'square', 0.05); },
    // 숫자 키
    key() { tone(880, 0, 0.04, 'square', 0.05); },
    // 조절 바 한 칸 (높을수록 높은 소리)
    tick(level = 0.5) {
      const now = performance.now();
      if (now - lastTick < 40) return;
      lastTick = now;
      tone(500 + level * 700, 0, 0.03, 'square', 0.05);
    },
    // 켜기/끄기
    toggle(on) { on ? (tone(523, 0, 0.06), tone(784, 0.05, 0.08)) : (tone(784, 0, 0.06), tone(523, 0.05, 0.08)); },
    // 창 열기/닫기
    open() { tone(440, 0, 0.05, 'triangle', 0.1, 300); },
    close() { tone(740, 0, 0.05, 'triangle', 0.1, -300); },
    // 게임
    correct() { tone(880, 0, 0.08); tone(1320, 0.07, 0.12); },
    wrong() { tone(220, 0, 0.22, 'sawtooth', 0.1, -80); },
    pop() { noise(0, 0.12, 0.12, 1800); tone(1400, 0, 0.06, 'square', 0.06, 600); },
    levelUp() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.08, 0.16, 'triangle', 0.15)); },
    combo(n) { tone(660 + Math.min(n, 20) * 30, 0, 0.07, 'square', 0.07); tone(990 + Math.min(n, 20) * 30, 0.06, 0.09, 'square', 0.07); },
    count() { tone(440, 0, 0.12, 'square', 0.1); },
    go() { tone(880, 0, 0.25, 'square', 0.12); },
    pause() { tone(660, 0, 0.06); tone(440, 0.07, 0.1); },
    resume() { tone(440, 0, 0.06); tone(660, 0.07, 0.1); },
    over() { [523, 392, 330, 262].forEach((f, i) => tone(f, i * 0.12, 0.2, 'triangle', 0.14)); },
    record() { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.14, 'square', 0.09)); },
    badge() { [988, 1319].forEach((f, i) => tone(f, i * 0.09, 0.18, 'square', 0.08)); },
  };
})();
