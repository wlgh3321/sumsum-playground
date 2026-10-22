/*
 * 효과음: Web Audio API로 짧은 "삑" 소리를 만들어요. 파일을 받지 않아요.
 * 브라우저 정책 때문에 AudioContext는 첫 터치/클릭 뒤에 만들어요.
 */
const Sound = (() => {
  let ctx = null;
  let enabled = true;

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

  function tone(freq, start, dur, type = 'square', vol = 0.12) {
    try {
      const c = getContext();
      if (!c) return;
      const t0 = c.currentTime + start;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch (e) {
      // 소리가 안 나와도 게임은 계속돼요.
    }
  }

  return {
    setEnabled(on) {
      enabled = !!on;
    },
    correct() {
      if (!enabled) return;
      tone(880, 0, 0.12);
      tone(1320, 0.1, 0.18);
    },
    wrong() {
      if (!enabled) return;
      tone(220, 0, 0.25, 'sawtooth', 0.1);
    },
    tap() {
      if (!enabled) return;
      tone(660, 0, 0.06, 'square', 0.06);
    },
    levelUp() {
      if (!enabled) return;
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.2, 'triangle', 0.15));
    },
  };
})();
