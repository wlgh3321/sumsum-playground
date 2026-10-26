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
  const SPEED_KEYS = ['vslow', 'slow', 'normal', 'fast', 'vfast'];
  const SPEED_LABEL = { vslow: 'speedVslow', slow: 'speedSlow', normal: 'speedNormal', fast: 'speedFast', vfast: 'speedVfast' };
  const PRESETS = {
    easy: { addMax: 10, mulMax: 5 },
    normal: { addMax: 20, mulMax: 9 },
    hard: { addMax: 50, mulMax: 12 },
  };
  const MODE_DEFAULT = { ops: OPS, preset: 'normal', addMax: 20, mulMax: 9, speed: 'normal', time: 60, ranked: false };
  // 랭킹전: 모두 같은 조건으로 겨뤄요. 이 설정으로 한 판만 명예의 전당에 올라가요.
  const RANKED = { ops: OPS, preset: 'normal', addMax: 20, mulMax: 9, speed: 'normal', time: 60 };
  // 모드 카드 정보. glyph는 카드 왼쪽 위 그림 글자예요.
  const MODE_CARDS = [
    { id: 'fall', glyph: '⇣', accent: 'var(--mint)', desc: 'modeFallDesc' },
    { id: 'minute', glyph: '', accent: 'var(--sun)', desc: 'modeMinuteDesc' },
    { id: 'race', glyph: '60', accent: 'var(--peach)', desc: 'modeRaceDesc' },
    { id: 'balloon', glyph: '팡', accent: 'var(--pink)', desc: 'modeBalloonDesc' },
    { id: 'beat', glyph: '+2', accent: 'var(--lilac)', desc: 'modeBeatDesc' },
    { id: 'tf', glyph: 'OX', accent: 'var(--ok)', desc: 'modeTfDesc' },
  ];

  let cfg = { sound: true, music: true, modes: {} }; // 전체 설정: 소리 + 게임별 설정
  let lang = 'ko';
  let lastMode = 'fall';
  let lastResult = null; // 공유하기에 쓰는 마지막 결과
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
      ranked: r.ranked === true,
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

  // 실제로 게임에 쓰는 설정. 랭킹전이면 내 설정 대신 랭킹전 조건을 써요.
  function snapshot(id) {
    const s = cfg.modes[id];
    if (s.ranked) return { ...RANKED, ops: [...RANKED.ops], ranked: true };
    return { ...s, ops: [...s.ops], ranked: false };
  }

  // 방문자 통계(GoatCounter)에 사건 하나를 남겨요. 통계가 꺼져 있어도 게임은 그대로예요.
  function track(path, title) {
    try {
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path, title, event: true });
      }
    } catch (e) {}
  }
  window.track = track;

  // 결과 공유: 휴대폰은 공유 창(카톡·인스타 등)을 띄우고, 안 되면 문구와 링크를 복사해요.
  async function shareResult() {
    const r = lastResult;
    if (!r) return;
    // 영어로 하고 있으면 영어 미리보기가 뜨는 …/en/ 주소로 보내요.
    const base = location.protocol.startsWith('http')
      ? location.origin + '/'
      : 'https://sumsum.studiojhl.com/';
    const url = lang === 'en' ? `${base}en/` : base;
    const game = modeName(r.mode, r.settings);
    const v = fmtValue(r.mode, r.value);
    const n = Ranking.placeFor(r);
    const line = n ? t('shareRanked', { game, n, v }) : t('shareScore', { game, v });
    const text = `${line}\n${t('shareInvite')}\n${url}`;
    track(`share-${r.mode}`, '결과 공유');
    // 한국어: 카카오톡으로 바로
    if (KakaoShare.sendText({ title: line.replace(/^\S+\s/, ''), desc: t('shareInvite') })) return;

    if (navigator.share) {
      try {
        await navigator.share({ title: t('appName'), text });
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return; // 공유 창을 닫은 경우
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast(t('shareCopied'));
    } catch (e) {
      toast(t('shareFail'));
    }
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

  // 모든 버튼은 손가락을 뗄 때(click) 적용돼요. 누르는 순간에는 딸깍 모션만 보여요.
  function press(node, fn) {
    node.addEventListener('click', e => {
      fn(e);
    });
  }

  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
    document.body.classList.toggle('on-home', id === 'home');
    if (id === 'home' && homeTab === 'games') playPreview(); else pausePreview();
    Music.setSong(id === 'game' ? 'game' : 'home'); // 게임 중에는 신나는 곡, 나머지는 홈 곡
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
    $('soundTxt').textContent = cfg.sound ? t('soundOn') : t('soundOff');
    setPressed($('soundBtn'), cfg.sound);
    $('musicTxt').textContent = cfg.music ? t('musicOn') : t('musicOff');
    setPressed($('musicBtn'), cfg.music);
    // 위쪽 작은 아이콘 버튼과 설정 버튼의 도트 아이콘
    $('qSound').dataset.ico = $('soundBtn').dataset.ico = cfg.sound ? 'sound' : 'soundOff';
    $('qMusic').dataset.ico = $('musicBtn').dataset.ico = cfg.music ? 'music' : 'musicOff';
    setPressed($('qSound'), cfg.sound);
    setPressed($('qMusic'), cfg.music);
    // 황금 블록 (배지 12개를 다 모으면 나타나요)
    $('goldRow').hidden = !Bonus.goldUnlocked();
    $('goldTxt').textContent = Bonus.goldOn() ? t('soundOn') : t('soundOff');
    setPressed($('goldBtn'), Bonus.goldOn());
    Bonus.applyGold();
    Icons.decorate();
  }

  /* ---------- 보너스 (설정 팝업 아래) ---------- */
  let adBonus = false; // 이번 판에 광고 보고 받은 하트 +1
  function renderBonus() {
    const id = pendingMode;
    const kind = Bonus.kindOf(id);
    $('bonusRow').hidden = !kind;
    if (!kind) return;
    const parts = Bonus.parts();
    if (adBonus) parts.push({ key: 'bonAd', u: 2 });
    $('bonusList').innerHTML = parts.length
      ? parts.map(p => `<span class="bonus-tag">${t(p.key)} <b>${Bonus.label(id, p.u)}</b></span>`).join('')
      : `<span class="bonus-hint">${t('bonHint', { v: Bonus.label(id, 1) })}</span>`;
    $('adBtn').hidden = adBonus || !Bonus.canReward();
    $('adTxt').textContent = t(Bonus.noAds() ? 'bonAdFree' : 'bonAdBtn', { v: Bonus.label(id, 2) });
  }
  async function claimAd() {
    if (adBonus || !pendingMode) return;
    $('adBtn').disabled = true;
    const ok = await Bonus.reward();
    $('adBtn').disabled = false;
    if (ok) { adBonus = true; Sound.levelUp(); }
    renderBonus();
  }

  // 아래 탭 바: 게임 / 랭킹 / 오답노트 / 설정
  let homeTab = 'games';
  function setTab(name) {
    homeTab = name;
    document.querySelectorAll('.home-view').forEach(v => { v.hidden = v.dataset.view !== name; });
    document.querySelectorAll('#tabbar [data-tab]').forEach(b => setPressed(b, b.dataset.tab === name));
    if (name === 'ranks') Ranking.renderHome();
    if (name === 'records') renderRecords();
    if (name === 'games') playPreview();
    else pausePreview();
    $('homeScroll').scrollTop = 0;
    window.scrollTo(0, 0);
  }

  // 조절 바: 손잡이까지 색이 차오르게 (0~1 비율)
  function fillRange(r) {
    const min = Number(r.min) || 0, max = Number(r.max) || 1;
    r.style.setProperty('--f', String((Number(r.value) - min) / (max - min || 1)));
  }

  // 팝업: 지금 고른 게임의 설정만 보여 줘요.
  function renderSetup() {
    if (!pendingMode) return;
    const ranked = current().ranked;
    const s = snapshot(pendingMode); // 랭킹전이면 랭킹전 조건을 보여 줘요
    document.querySelectorAll('#playGrid [data-play]').forEach(b =>
      setPressed(b, (b.dataset.play === 'ranked') === ranked));
    $('playNote').textContent = ranked ? t('playRankedNote') : t('playPracticeNote');
    $('setupOptions').classList.toggle('locked', ranked);
    $('setupOptions').inert = ranked;
    document.querySelectorAll('#opGrid .op-btn').forEach(b =>
      setPressed(b, s.ops.includes(b.dataset.op)));
    document.querySelectorAll('#presetGrid [data-preset]').forEach(b =>
      setPressed(b, b.dataset.preset === s.preset));
    const si = SPEED_KEYS.indexOf(s.speed);
    $('speedRange').value = si;
    $('speedOut').textContent = t(SPEED_LABEL[s.speed]);
    $('timeRange').value = Math.max(0, TIMES.indexOf(s.time));
    $('timeOut').textContent = duration(s.time);

    $('speedField').hidden = !HAS_SPEED.includes(pendingMode);
    $('timeField').hidden = !HAS_TIME.includes(pendingMode);

    $('presetNote').textContent = s.preset === 'custom' ? `· ${t('presetCustom')}` : '';
    $('addMax').value = s.addMax;
    $('mulMax').value = s.mulMax;
    document.querySelectorAll('#setup input[type="range"]').forEach(fillRange);
    $('addMaxOut').textContent = t('rangeAdd', { n: s.addMax });
    $('mulMaxOut').textContent = t('rangeMul', { n: s.mulMax });
    $('setupTitle').textContent = modeName(pendingMode, s);
    renderBonus();
  }

  // 홈: 아래 작은 버튼으로 게임을 고르면, 위 큰 화면에 그 게임의 미리보기와 설명·기록이 나와요.
  let pick = 'fall';
  try { const p = localStorage.getItem('sumsum.pick'); if (MODE_IDS.includes(p)) pick = p; } catch (e) {}

  function renderModes() {
    $('modeGrid').innerHTML = MODE_CARDS.map(m => {
      const s = snapshot(m.id);
      const glyph = m.id === 'minute' ? shortTime(s.time) : m.glyph;
      return `
        <button type="button" class="pick-btn mode-card" data-mode="${m.id}" aria-pressed="${m.id === pick}" style="--accent:${m.accent}">
          <span class="glyph">${glyph}</span>
          <span class="pick-name">${modeName(m.id, { ...s, ranked: false })}</span>
        </button>`;
    }).join('');
    renderPreview();
  }

  function renderPreview() {
    const m = MODE_CARDS.find(x => x.id === pick);
    const s = snapshot(pick);
    const best = Store.getBest(bestKey(pick, s));
    $('pick').style.setProperty('--accent', m.accent);
    $('pvName').textContent = modeName(pick, s);
    $('pvDesc').textContent = t(m.desc);
    $('pvBest').textContent = best === null ? t('bestNone') : `${t('bestLabel')} ${fmtValue(pick, best)}`;
    Demo.set(pick);
    const want = pick;
    $('pvTop').textContent = '';
    Ranking.top1(pick).then(r => {
      if (want !== pick) return;
      $('pvTop').textContent = r ? t('pvTop', { name: r.name, v: fmtValue(pick, r.score) }) : t('pvTopNone');
    }).catch(() => {});
  }

  function playPreview() { Demo.play(); }
  function pausePreview() { Demo.pause(); }

  function choose(id) {
    if (id === pick) return;
    pick = id;
    try { localStorage.setItem('sumsum.pick', id); } catch (e) {}
    document.querySelectorAll('#modeGrid .pick-btn').forEach(b => setPressed(b, b.dataset.mode === id));
    renderPreview();
    Sound.select();
  }

  // 단위(판·일): 영어에서는 비워 두거나 영어 단위를 써요
  const UNITS = { ko: { recPlayUnit: '판', recDayUnit: '일' }, en: { recPlayUnit: '', recDayUnit: 'd' } };
  const unit = k => { const u = (UNITS[lang] || UNITS.ko)[k]; return u ? `<small>${u}</small>` : ''; };

  // 기록실: 숫자 요약 · 배지 · 게임별 최고 기록
  function renderRecords() {
    const S = Stats.data();
    const cell = (ico, v, label) =>
      `<div class="rec-cell">${Icons.svg(ico)}<b>${v}</b><span>${label}</span></div>`;
    $('recStats').innerHTML =
      cell('games', `${S.plays}${unit('recPlayUnit')}`, t('recPlays')) +
      cell('check', S.correct, t('recCorrect')) +
      cell('fire', S.maxStreak, t('recStreak')) +
      cell('calendar', `${S.days}${unit('recDayUnit')}`, t('recDays')) +
      cell('medal', `${Stats.BADGES.filter(b => S.got[b.id]).length}<small class="frac">/${Stats.BADGES.length}</small>`, t('recBadgeCell')) +
      `<div class="rec-cell" id="recRankCell">${Icons.svg('trophy')}<b id="recBestRank">—</b><span>${t('recBestRank')}</span></div>`;
    const got = Stats.BADGES.filter(b => S.got[b.id]).length;
    $('badgeGrid').innerHTML = Stats.BADGES.map(b => {
      const on = !!S.got[b.id];
      const cur = Math.min(b.goal, b.cur(S));
      const prog = on ? '' : `<span class="bdg-prog">${cur}/${b.goal}</span>`;
      return `<div class="bdg${on ? ' on' : ''}" title="${t(b.desc)}">
        <span class="bdg-ico">${Icons.svg(on ? b.ico : 'lock')}</span>
        <span class="bdg-name">${t(b.name)}</span>
        <span class="bdg-desc">${t(b.desc)}</span>${prog}</div>`;
    }).join('');
    $('recBonus').textContent = t('recBonusNote');
    $('recBadgeCount') && ($('recBadgeCount').textContent = t('recBadgeCount', { n: got, m: Stats.BADGES.length }));
    $('recBests').innerHTML = MODE_CARDS.map(m => {
      const s = snapshot(m.id);
      const best = Store.getBest(bestKey(m.id, s));
      const glyph = m.id === 'minute' ? shortTime(s.time) : m.glyph;
      return `<li class="mode-card" data-mode="${m.id}" style="--accent:${m.accent}"><span class="glyph">${glyph}</span>
        <span class="rb-name">${modeName(m.id, s)}</span>
        <span class="rb-val">${best === null ? '—' : fmtValue(m.id, best)}</span>
        <span class="rb-rank" data-rank="${m.id}"></span></li>`;
    }).join('');
    fillRanks();
  }

  // 게임별 명예의 전당 등수 (랭킹전 최고 기록 기준). 1등은 왕관.
  const rankText = (n, small) => (lang === 'en' ? `#${n}` : small ? `${n}<small>${t('rankUnit')}</small>` : `${n}${t('rankUnit')}`);
  async function fillRanks() {
    let bestN = null;
    await Promise.all(MODE_CARDS.map(async m => {
      let n = null;
      try { const r = await Ranking.myRank(m.id); n = r && r.n; } catch (e) {}
      const el = document.querySelector(`#recBests [data-rank="${m.id}"]`);
      if (!el) return;
      if (n) {
        el.innerHTML = (n === 1 ? Ranking.CROWN : '') + rankText(n);
        el.classList.toggle('first', n === 1);
        if (bestN === null || n < bestN) bestN = n;
      } else {
        el.textContent = '';
      }
    }));
    const b = $('recBestRank');
    if (b) b.innerHTML = bestN ? (bestN === 1 ? Ranking.CROWN : '') + rankText(bestN, true) : '—';
  }

  function celebrate(list) {
    list.forEach((b, i) => setTimeout(() => { Sound.badge(); toast(t('badgeGot', { name: t(b.name) })); }, 400 + i * 1800));
  }

  function renderAll() {
    renderHeader();
    renderSetup();
    renderModes();
    if (homeTab === 'records') renderRecords();
    Ranking.renderHome();
  }

  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(n => {
      n.textContent = t(n.dataset.i18n);
    });
    renderAll();
    Icons.decorate();
  }

  function showHome() {
    closeSetup();
    show('home');
    renderAll();
  }

  // 게임 카드를 누르면 설정 팝업이 열려요. 설정을 바꾼 뒤 "시작하기"를 눌러야 시작해요.
  function openSetup(id) {
    pendingMode = id;
    // 여는 순간 손가락 아래 버튼(닫기 X 등)이 눌린 모양으로 보이지 않게, 잠깐 누르기를 막아요
    const box = $('setup');
    box.classList.add('opening');
    clearTimeout(openSetup.t);
    openSetup.t = setTimeout(() => box.classList.remove('opening'), 350);
    document.querySelectorAll('#setup .clk').forEach(n => n.classList.remove('clk'));
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    $('setup').hidden = false;
    renderSetup();
    // 맨 위(게임 방식)부터 보이게. 시작 버튼에 포커스를 줘도 아래로 내려가지 않아요.
    $('setup').querySelector('.modal-card').scrollTop = 0;
  }

  function closeSetup() {
    pendingMode = null;
    $('setup').hidden = true;
  }

  function startPending() {
    if (!pendingMode) return;
    const id = pendingMode;
    closeSetup();
    const s = snapshot(id);
    track(`play-${id}${s.ranked ? '-ranked' : ''}`, `게임 시작: ${modeName(id, s)}`);
    const bonus = Bonus.kindOf(id) ? Bonus.units() + (adBonus ? 2 : 0) : 0;
    adBonus = false;
    Game.start(id, s, bonus);
  }

  // 결과 화면. Game이 한 판이 끝났을 때 호출해요.
  function showResult(r) {
    lastMode = r.mode;
    lastResult = r;
    const noShare = r.badge.kind === 'quit' || !(r.value > 0); // 그만한 판·0점은 공유 버튼을 숨겨요
    $('shareBtn').hidden = noShare;
    $('shareImgBtn').hidden = noShare;
    if (!noShare) {
      ShareCard.set({
        r,
        game: modeName(r.mode, r.settings),
        value: fmtValue(r.mode, r.value),
        best: r.badge.kind === 'new' || r.badge.kind === 'first',
        stats: r.stats,
      });
      ShareCard.ready().then(f => KakaoShare.prepare(f));
    }
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
    Ranking.onResult(r);
    celebrate(Stats.record(r));
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

    $('speedRange').addEventListener('input', e => {
      current().speed = SPEED_KEYS[Number(e.target.value)] || 'normal';
      changed();
    });

    $('timeRange').addEventListener('input', e => {
      current().time = TIMES[Number(e.target.value)] || 60;
      changed();
    });

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

    document.querySelectorAll('#playGrid [data-play]').forEach(b =>
      press(b, () => {
        const s = current();
        if (!s) return;
        s.ranked = b.dataset.play === 'ranked';
        changed();
      }));

    const toggleSound = () => {
      cfg.sound = !cfg.sound;
      Sound.setEnabled(cfg.sound);
      if (cfg.sound) Sound.toggle(true);
      changed();
    };
    // 배경음악 켜기/끄기
    const toggleMusic = () => {
      cfg.music = !cfg.music;
      if (cfg.music) Music.start(); else Music.stop();
      Sound.toggle(cfg.music);
      changed();
    };
    press($('soundBtn'), toggleSound);
    press($('goldBtn'), () => { const on = !Bonus.goldOn(); Bonus.setGold(on); Sound.toggle(on); renderHeader(); });
    press($('adBtn'), claimAd);
    press($('contGo'), () => Game.cont(true));
    press($('contEnd'), () => Game.cont(false));
    press($('musicBtn'), toggleMusic);
    press($('qSound'), toggleSound);
    press($('qMusic'), toggleMusic);
    document.querySelectorAll('#tabbar [data-tab]').forEach(b =>
      b.addEventListener('click', () => setTab(b.dataset.tab)));

    // 조절 바: 한 칸 움직일 때마다 '틱'
    document.querySelectorAll('input[type="range"]').forEach(r => r.addEventListener('input', () => {
      const min = Number(r.min) || 0, max = Number(r.max) || 1;
      Sound.tick((Number(r.value) - min) / (max - min || 1));
    }));
    // 딸깍: 모든 블록 버튼을 누르면 꾹 눌렸다 올라오는 모션
    const KEYS = '.btn, .chip, .key, .op-btn, .choice, .ox-btn, .icon-btn, .pick-btn, .tab';
    document.addEventListener('pointerdown', e => {
      const b = e.target.closest(KEYS);
      if (!b || b.disabled) return;
      // 딸깍 소리 (게임 안의 숫자키·보기·OX와 고르기 버튼, 소리 버튼은 따로 소리가 나요)
      if (!b.matches('.key, .choice, .ox-btn, .pick-btn, #qSound, #qMusic, #soundBtn, #musicBtn')) Sound.tap();
      b.classList.remove('clk');
      void b.offsetWidth; // 연속으로 눌러도 매번 다시 움직이게
      b.classList.add('clk');
    }, true);
    document.addEventListener('animationend', e => {
      if (e.animationName === 'clk') e.target.classList.remove('clk');
    }, true);

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

    // 아래 작은 버튼: 고르기만 해요. 고른 걸 한 번 더 누르거나 "플레이"를 누르면 설정 창이 열려요.
    $('modeGrid').addEventListener('click', e => {
      const b = e.target.closest('.pick-btn');
      if (!b) return;
      if (b.dataset.mode === pick) openSetup(pick);
      else choose(b.dataset.mode);
    });
    $('playBtn').addEventListener('click', () => openSetup(pick));
    $('pvScreen').addEventListener('click', () => openSetup(pick));
    // 기록실의 게임 줄을 누르면 그 게임으로 가요
    $('recBests').addEventListener('click', e => {
      const li = e.target.closest('[data-mode]');
      if (!li) return;
      choose(li.dataset.mode);
      setTab('games');
    });
    // 다른 앱으로 갔다 오면 미리보기를 다시 틀어요
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && homeTab === 'games' && $('home').classList.contains('active')) playPreview();
    });

    // 설정 팝업
    press($('startBtn'), startPending);
    // 닫기는 손을 뗄 때(click) 처리해요. 누르는 순간(pointerdown) 닫으면 손을 떼는 순간의 클릭이
    // 뒤에 있던 게임 카드에 떨어져서 팝업이 다시 열렸어요(휴대폰에서 X가 안 눌리는 것처럼 보이던 문제).
    $('setupClose').addEventListener('click', closeSetup);
    $('setup').addEventListener('click', e => {
      if (e.target === $('setup')) closeSetup();
    });

    document.querySelectorAll('#numpad [data-key]').forEach(b =>
      press(b, () => Game.key(b.dataset.key)));

    // 일시정지 창의 버튼들은 click으로 연결해요(누르는 순간 창이 열리고 닫히며 뒤에 있는 버튼이 잘못 눌리는 것을 막아요).
    $('pauseBtn').addEventListener('click', () => Game.pause());
    $('resumeBtn').addEventListener('click', () => Game.resume());
    $('restartBtn').addEventListener('click', () => Game.restart());
    $('quitBtn').addEventListener('click', () => Game.quit());
    // 공유 창은 브라우저 정책상 터치를 뗄 때(click) 열어야 아이폰에서도 떠요.
    // 결과 공유하기: 한국어는 카톡으로 점수 이미지 카드, 아니면 휴대폰 공유 창으로 점수 이미지
    $('shareImgBtn').addEventListener('click', () => {
      track(`share-img-${lastMode}`, '결과 공유');
      const r = lastResult;
      if (r && KakaoShare.sendImage({ title: `${modeName(r.mode, r.settings)} ${fmtValue(r.mode, r.value)}!`, desc: t('shareInvite') })) return;
      ShareCard.share(() => toast(t('shareImgSaved')));
    });
    // 결과 이미지 저장: 이미지를 크게 보여 주고 저장 버튼
    $('shareBtn').addEventListener('click', async () => {
      track(`save-img-${lastMode}`, '이미지 저장');
      const f = await ShareCard.ready();
      if (!f) return;
      const img = $('saveImg');
      if (img.dataset.url) URL.revokeObjectURL(img.dataset.url);
      img.dataset.url = URL.createObjectURL(f);
      img.src = img.dataset.url;
      $('saveBox').hidden = false;
    });
    $('saveDl').addEventListener('click', () => ShareCard.save(() => toast(t('shareImgSaved'))));
    $('saveClose').addEventListener('click', () => { $('saveBox').hidden = true; });
    $('saveBox').addEventListener('click', e => { if (e.target === $('saveBox')) $('saveBox').hidden = true; });
    press($('againBtn'), () => Game.start(lastMode, snapshot(lastMode), Bonus.kindOf(lastMode) ? Bonus.units() : 0)); // 다시 하기도 보너스 그대로
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
    // 공유 링크(…/en/ → ?lang=en)로 들어오면 그 언어로 시작하고, 주소에서는 지워요.
    const want = new URLSearchParams(location.search).get('lang');
    if (want === 'ko' || want === 'en') {
      Store.setLang(want);
      try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {}
    }
    const saved = Store.getLang();
    if (saved === 'ko' || saved === 'en') {
      lang = saved;
    } else {
      lang = (navigator.language || 'ko').toLowerCase().startsWith('ko') ? 'ko' : 'en';
    }
    setLang(lang);
    Sound.setEnabled(cfg.sound);
    Demo.mount($('pvScreen'));
    bind();
    applyLang();
    show('home');
    celebrate(Stats.visit());
  }

  return { show, showHome, showResult, init };
})();

App.init();
