/*
 * 홈 화면(모드 카드·약점 목록), 게임별 설정 팝업, 결과 화면, 언어·소리 전환.
 *
 * 설정은 게임마다 따로 저장돼요. 예: 덧셈 게임에서 바꾼 숫자 범위가 곱셈 게임에 영향을 주지 않아요.
 */
const App = (() => {
  const $ = id => document.getElementById(id);
  const OPS = ['+', '-', '*', '/'];
  const TIMES = [30, 60, 90, 120];
  const MODE_IDS = ['fall', 'minute', 'race', 'balloon', 'beat', 'tf'];
  const HAS_SPEED = ['fall', 'balloon']; // 속도는 문제 비·풍선 팡팡에만 있어요.
  const HAS_TIME = ['minute', 'tf']; // 제한 시간은 1분 도전·참 거짓 스피드에만 있어요.
  const PRESETS = {
    easy: { addMax: 10, mulMax: 5 },
    normal: { addMax: 20, mulMax: 9 },
    hard: { addMax: 50, mulMax: 12 },
  };
  const MODE_DEFAULT = { ops: OPS, preset: 'normal', addMax: 20, mulMax: 9, speed: 'normal', time: 60 };
  // 모드 카드 정보. glyph는 카드 왼쪽 위 그림 글자예요.
  const MODE_CARDS = [
    { id: 'fall', glyph: '⇣', accent: 'var(--mint)', desc: 'modeFallDesc' },
    { id: 'minute', glyph: '', accent: 'var(--sun)', desc: 'modeMinuteDesc' },
    { id: 'race', glyph: '60', accent: 'var(--peach)', desc: 'modeRaceDesc' },
    { id: 'balloon', glyph: '팡', accent: 'var(--pink)', desc: 'modeBalloonDesc' },
    { id: 'beat', glyph: '+2', accent: 'var(--lilac)', desc: 'modeBeatDesc' },
    { id: 'tf', glyph: 'OX', accent: 'var(--sky-deep)', desc: 'modeTfDesc' },
  ];

  let cfg = { sound: true, music: true, modes: {} }; // 전체 설정: 소리 + 게임별 설정
  let lang = 'ko';
  let lastMode = 'fall';
  let pendingMode = null; // 설정 팝업에서 시작하려는 게임
  let toastTimer = 0;

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const setPressed = (node, on) => node.setAttribute('aria-pressed', String(!!on));
  const current = () => cfg.modes[pendingMode];

  // 한 게임의 설정을 안전한 값으로 맞춰요.
  function sanitizeMode(r) {
    const ops = Array.isArray(r.ops) ? r.ops.filter(o => OPS.includes(o)) : [];
    return {
      ops: ops.length ? ops : [...OPS],
      preset: ['easy', 'normal', 'hard', 'custom'].includes(r.preset) ? r.preset : MODE_DEFAULT.preset,
      addMax: Number.isFinite(r.addMax) ? clamp(Math.round(r.addMax / 5) * 5, 5, 100) : MODE_DEFAULT.addMax,
      mulMax: Number.isFinite(r.mulMax) ? clamp(Math.round(r.mulMax), 2, 15) : MODE_DEFAULT.mulMax,
      speed: Object.keys(SPEED).includes(r.speed) ? r.speed : MODE_DEFAULT.speed,
      time: TIMES.includes(r.time) ? r.time : MODE_DEFAULT.time,
    };
  }

  // 저장된 값을 읽어요. 예전 버전(모든 게임이 한 설정을 공유하던 형식)은 모든 게임의 기본값으로 써요.
  function sanitize(raw) {
    const r = raw && typeof raw === 'object' ? raw : {};
    const modes = {};
    for (const id of MODE_IDS) {
      const own = r.modes && typeof r.modes === 'object' ? r.modes[id] : null;
      modes[id] = sanitizeMode(own && typeof own === 'object' ? own : r);
    }
    return {
      sound: typeof r.sound === 'boolean' ? r.sound : true,
      music: typeof r.music === 'boolean' ? r.music : true,
      modes,
    };
  }

  function snapshot(id) {
    const s = cfg.modes[id];
    return { ...s, ops: [...s.ops] };
  }

  function save() {
    Store.setSettings(cfg);
  }

  function fmtValue(id, v) {
    return id === 'race' ? `${v.toFixed(1)}${t('secUnit')}` : `${v}${t('ptsUnit')}`;
  }

  function shortTime(sec) {
    return sec % 60 === 0 ? `${sec / 60}${t('minUnit')}` : `${sec}${t('secUnit')}`;
  }

  // 누르는 즉시 반응하도록 pointerdown으로 처리해요. 오른쪽 클릭 등은 무시.
  function press(node, fn) {
    node.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      e.preventDefault();
      fn(e);
    });
  }

  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
    window.scrollTo(0, 0);
  }

  function toast(msg) {
    const node = $('toast');
    node.textContent = msg;
    node.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { node.hidden = true; }, 1600);
  }

  /* ---------- 그리기 ---------- */

  // 상단: 소리 버튼과 언어 버튼
  function renderHeader() {
    document.querySelectorAll('[data-lang]').forEach(b =>
      setPressed(b, b.dataset.lang === lang));
    $('soundBtn').textContent = cfg.sound ? t('soundOn') : t('soundOff');
    setPressed($('soundBtn'), cfg.sound);
    $('musicBtn').textContent = cfg.music ? t('musicOn') : t('musicOff');
    setPressed($('musicBtn'), cfg.music);
  }

  // 팝업: 지금 고른 게임의 설정만 보여 줘요.
  function renderSetup() {
    if (!pendingMode) return;
    const s = current();
    document.querySelectorAll('#opGrid .op-btn').forEach(b =>
      setPressed(b, s.ops.includes(b.dataset.op)));
    document.querySelectorAll('#presetGrid [data-preset]').forEach(b =>
      setPressed(b, b.dataset.preset === s.preset));
    document.querySelectorAll('#speedGrid [data-speed]').forEach(b =>
      setPressed(b, b.dataset.speed === s.speed));
    document.querySelectorAll('#timeGrid [data-time]').forEach(b => {
      const sec = Number(b.dataset.time);
      b.textContent = duration(sec);
      setPressed(b, sec === s.time);
    });

    $('speedField').hidden = !HAS_SPEED.includes(pendingMode);
    $('timeField').hidden = !HAS_TIME.includes(pendingMode);

    $('presetNote').textContent = s.preset === 'custom' ? `· ${t('presetCustom')}` : '';
    $('addMax').value = s.addMax;
    $('mulMax').value = s.mulMax;
    $('addMaxOut').textContent = t('rangeAdd', { n: s.addMax });
    $('mulMaxOut').textContent = t('rangeMul', { n: s.mulMax });
    $('setupTitle').textContent = modeName(pendingMode, s);
  }

  // 홈: 게임 카드마다 그 게임의 설정으로 최고 기록을 보여 줘요.
  function renderModes() {
    $('modeGrid').innerHTML = MODE_CARDS.map(m => {
      const s = cfg.modes[m.id];
      const best = Store.getBest(bestKey(m.id, s));
      const glyph = m.id === 'minute' ? shortTime(s.time) : m.glyph;
      const bestText = best === null ? t('bestNone') : `${t('bestLabel')} ${fmtValue(m.id, best)}`;
      return `
        <div class="mode-card" role="button" tabindex="0" data-mode="${m.id}" style="--accent:${m.accent}">
          <div class="glyph">${glyph}</div>
          <div class="mode-info">
            <h3>${modeName(m.id, s)}</h3>
            <p>${t(m.desc)}</p>
            <div class="best">${bestText}</div>
          </div>
        </div>`;
    }).join('');
  }

  function renderWeak() {
    const n = Store.weakList().length;
    $('weakCount').textContent = n ? t('weakCount', { n }) : t('weakNone');
    $('weakClear').disabled = n === 0;
  }

  function renderAll() {
    renderHeader();
    renderSetup();
    renderModes();
    renderWeak();
  }

  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(n => {
      n.textContent = t(n.dataset.i18n);
    });
    renderAll();
  }

  function showHome() {
    closeSetup();
    show('home');
    renderAll();
  }

  // 게임 카드를 누르면 설정 팝업이 열려요. 설정을 바꾼 뒤 "시작하기"를 눌러야 시작해요.
  function openSetup(id) {
    pendingMode = id;
    $('setup').hidden = false;
    renderSetup();
    $('startBtn').focus();
  }

  function closeSetup() {
    pendingMode = null;
    $('setup').hidden = true;
  }

  function startPending() {
    if (!pendingMode) return;
    const id = pendingMode;
    closeSetup();
    Game.start(id, snapshot(id));
  }

  // 결과 화면. Game이 한 판이 끝났을 때 호출해요.
  function showResult(r) {
    lastMode = r.mode;
    const b = r.badge;
    const badge = $('resBadge');

    $('resMode').textContent = modeName(r.mode, r.settings);
    $('resLabel').textContent = t(r.labelKey);
    $('resBig').textContent = fmtValue(r.mode, r.value);

    badge.className = `badge badge-${b.kind}`;
    badge.hidden = b.kind === 'quit';
    if (b.kind === 'new') badge.textContent = t('badgeNew');
    else if (b.kind === 'first') badge.textContent = t('badgeFirst');
    else if (b.kind === 'best') badge.textContent = t('badgeBest', { v: fmtValue(r.mode, b.value) });

    $('resNote').textContent = b.kind === 'quit' ? t('quitNote') : '';
    $('resNote').hidden = b.kind !== 'quit';

    $('resStats').innerHTML = r.stats
      .map(([label, v]) => `<div class="stat"><span class="stat-value">${v}</span><span class="stat-label">${label}</span></div>`)
      .join('');

    $('wrongList').innerHTML = r.misses.length
      ? r.misses
          .map(m => `
            <li class="miss">
              <span class="miss-q">${m.q}</span>
              <span class="miss-a">${t('wrongAns')} <b>${m.answer}</b></span>
              ${m.missed
                ? `<span class="tag miss-tag">${t('missed')}</span>`
                : `<span class="miss-mine">${t('wrongMine')} ${m.mine}</span>`}
            </li>`)
          .join('')
      : `<li class="miss-none">${t('wrongNone')}</li>`;

    show('result');
  }

  /* ---------- 설정 변경 ---------- */

  function changed() {
    save();
    renderAll();
  }

  function toggleOp(op) {
    const s = current();
    const on = s.ops.includes(op);
    if (on && s.ops.length === 1) {
      toast(t('needOp'));
      return;
    }
    s.ops = OPS.filter(o => (o === op ? !on : s.ops.includes(o)));
    changed();
  }

  function setLanguage(l) {
    lang = l;
    setLang(l);
    Store.setLang(l);
    applyLang();
  }

  function bind() {
    document.querySelectorAll('#opGrid .op-btn').forEach(b =>
      press(b, () => toggleOp(b.dataset.op)));

    document.querySelectorAll('#presetGrid [data-preset]').forEach(b =>
      press(b, () => {
        const s = current();
        s.preset = b.dataset.preset;
        Object.assign(s, PRESETS[s.preset]);
        changed();
      }));

    document.querySelectorAll('#speedGrid [data-speed]').forEach(b =>
      press(b, () => {
        current().speed = b.dataset.speed;
        changed();
      }));

    document.querySelectorAll('#timeGrid [data-time]').forEach(b =>
      press(b, () => {
        current().time = Number(b.dataset.time);
        changed();
      }));

    // 슬라이더를 움직이면 난이도는 "직접 설정"이 돼요.
    $('addMax').addEventListener('input', e => {
      const s = current();
      s.addMax = Number(e.target.value);
      s.preset = 'custom';
      changed();
    });
    $('mulMax').addEventListener('input', e => {
      const s = current();
      s.mulMax = Number(e.target.value);
      s.preset = 'custom';
      changed();
    });

    press($('soundBtn'), () => {
      cfg.sound = !cfg.sound;
      Sound.setEnabled(cfg.sound);
      changed();
    });

    // 배경음악 켜기/끄기
    press($('musicBtn'), () => {
      cfg.music = !cfg.music;
      if (cfg.music) Music.start(); else Music.stop();
      changed();
    });

    // 브라우저 정책상 음악은 첫 터치/클릭 뒤에 시작할 수 있어요.
    const firstTouch = () => {
      if (cfg.music) Music.start();
      window.removeEventListener('pointerdown', firstTouch, true);
      window.removeEventListener('keydown', firstTouch, true);
    };
    window.addEventListener('pointerdown', firstTouch, true);
    window.addEventListener('keydown', firstTouch, true);

    document.querySelectorAll('[data-lang]').forEach(b =>
      press(b, () => setLanguage(b.dataset.lang)));

    press($('weakClear'), () => {
      Store.clearWeak();
      renderWeak();
      toast(t('weakCleared'));
    });

    // 모드 카드는 스크롤 중 실수로 열리지 않도록 click으로 처리해요.
    const grid = $('modeGrid');
    grid.addEventListener('click', e => {
      const card = e.target.closest('.mode-card');
      if (card) openSetup(card.dataset.mode);
    });
    grid.addEventListener('keydown', e => {
      const card = e.target.closest('.mode-card');
      if (card && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        openSetup(card.dataset.mode);
      }
    });

    // 설정 팝업
    press($('startBtn'), startPending);
    press($('setupClose'), closeSetup);
    $('setup').addEventListener('pointerdown', e => {
      if (e.target === $('setup')) closeSetup();
    });

    document.querySelectorAll('#numpad [data-key]').forEach(b =>
      press(b, () => Game.key(b.dataset.key)));

    press($('quitBtn'), () => Game.quit());
    press($('againBtn'), () => Game.start(lastMode, snapshot(lastMode)));
    press($('homeBtn'), () => showHome());

    document.addEventListener('keydown', e => {
      if (!$('setup').hidden) {
        if (e.key === 'Escape') closeSetup();
        return;
      }
      if ($('game').classList.contains('active')) Game.keydown(e);
    });
  }

  function init() {
    cfg = sanitize(Store.getSettings());
    const saved = Store.getLang();
    if (saved === 'ko' || saved === 'en') {
      lang = saved;
    } else {
      lang = (navigator.language || 'ko').toLowerCase().startsWith('ko') ? 'ko' : 'en';
    }
    setLang(lang);
    Sound.setEnabled(cfg.sound);
    bind();
    applyLang();
    show('home');
  }

  return { show, showHome, showResult, init };
})();

App.init();
