/*
 * 순위표 (명예의 전당)
 * - 홈 화면: 게임별 TOP 10
 * - 결과 화면: TOP 10에 들면 이름을 남겨요
 * 설정 팝업에서 "랭킹전"을 고르고 한 판만 기록해요. 랭킹전은 모두 같은 조건이라 공평해요.
 *   사칙연산 전부 · 덧셈/뺄셈 20까지 · 곱셈/나눗셈 9단까지 · 속도 보통(문제 비·풍선) · 제한 시간 1분(시간 도전·참 거짓)
 */
const Ranking = (() => {
  const $ = id => document.getElementById(id);
  const MODES = ['fall', 'minute', 'race', 'balloon', 'beat', 'tf'];
  const SIZE = 10;
  const NAME_KEY = 'sumsum:rankName';
  const BAD = ['시발', '씨발', 'ㅅㅂ', '병신', 'ㅂㅅ', '개새', '좆', '존나', '니미', '느금', '섹스', 'fuck', 'shit', 'bitch', 'sex', 'dick'];

  let tab = 'fall';
  let lastPlace = null; // 방금 등록한 순위 { mode, value, n } — 공유 문구에 써요
  const cache = {}; // mode -> { at, rows }

  /* ---------- Firebase 준비 기다리기 ---------- */
  function board() {
    if (window.Board) return Promise.resolve(window.Board);
    return new Promise((resolve, reject) => {
      const done = () => resolve(window.Board);
      window.addEventListener('board-ready', done, { once: true });
      setTimeout(() => reject(new Error('timeout')), 8000);
    });
  }

  async function top(mode, fresh) {
    const c = cache[mode];
    if (!fresh && c && Date.now() - c.at < 30000) return c.rows;
    const b = await board();
    const rows = await b.top(mode, SIZE);
    cache[mode] = { at: Date.now(), rows };
    return rows;
  }

  /* ---------- 규칙 ---------- */
  function isRanked(mode, s) {
    if (!s || s.ranked !== true) return false;
    if (s.ops.length !== 4 || s.addMax !== 20 || s.mulMax !== 9) return false;
    if ((mode === 'fall' || mode === 'balloon') && s.speed !== 'normal') return false;
    if ((mode === 'minute' || mode === 'tf') && s.time !== 60) return false;
    return true;
  }

  const better = (mode, a, b) => (mode === 'race' ? a < b : a > b);

  function qualifies(mode, value, rows) {
    if (rows.length < SIZE) return true;
    return better(mode, value, rows[rows.length - 1].score);
  }

  function cleanName(raw) {
    const n = String(raw || '').replace(/\s+/g, ' ').trim();
    if (!n) return { err: 'rankErrEmpty' };
    if ([...n].length > 8) return { err: 'rankErrLong' };
    if (!/^[가-힣A-Za-z0-9_ ]+$/.test(n)) return { err: 'rankErrChars' };
    const low = n.toLowerCase().replace(/\s/g, '');
    if (BAD.some(w => low.includes(w))) return { err: 'rankErrBad' };
    return { name: n };
  }

  function getSavedName() {
    try { return localStorage.getItem(NAME_KEY) || ''; } catch (e) { return ''; }
  }
  function setSavedName(n) {
    try { localStorage.setItem(NAME_KEY, n); } catch (e) {}
  }

  const ordinal = i => (['1ST', '2ND', '3RD'][i] || `${i + 1}TH`);
  const fmt = (mode, v) => (mode === 'race'
    ? `${Number(v).toFixed(1)}${t('secUnit')}`
    : `${v}${t('ptsUnit')}`);

  /* ---------- 목록 그리기 ---------- */
  function renderRows(list, mode, rows, highlightId) {
    list.textContent = '';
    if (!rows.length) {
      const li = document.createElement('li');
      li.className = 'rank-empty';
      li.textContent = t('rankEmpty');
      list.appendChild(li);
      return;
    }
    rows.forEach((r, i) => {
      const li = document.createElement('li');
      li.className = `rank-row r${i + 1}${r.id === highlightId ? ' me' : ''}`;
      const a = document.createElement('span'); a.className = 'rank-no'; a.textContent = ordinal(i);
      const b = document.createElement('span'); b.className = 'rank-name'; b.textContent = r.name;
      const c = document.createElement('span'); c.className = 'rank-score'; c.textContent = fmt(mode, r.score);
      li.append(a, b, c);
      list.appendChild(li);
    });
  }

  function renderMsg(list, key) {
    list.textContent = '';
    const li = document.createElement('li');
    li.className = 'rank-empty';
    li.textContent = t(key);
    list.appendChild(li);
  }

  /* ---------- 홈 화면 ---------- */
  function renderTabs() {
    const box = $('rankTabs');
    box.textContent = '';
    for (const m of MODES) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip rank-tab';
      b.textContent = modeName(m, { time: 60 });
      b.setAttribute('aria-pressed', String(m === tab));
      b.addEventListener('click', () => { tab = m; renderHome(); });
      box.appendChild(b);
    }
  }

  async function renderHome(fresh) {
    if (!$('rankList')) return;
    $('rankRule').textContent = t('rankRule');
    renderTabs();
    const list = $('rankList');
    const want = tab;
    if (!cache[want]) renderMsg(list, 'rankLoading');
    try {
      const rows = await top(want, fresh);
      if (want === tab) renderRows(list, want, rows);
    } catch (e) {
      if (want === tab) renderMsg(list, 'rankOffline');
    }
  }

  /* ---------- 결과 화면 ---------- */
  async function onResult(r) {
    const box = $('rankBox');
    if (!box) return;
    box.hidden = true;
    box.textContent = '';
    lastPlace = null;
    if (r.badge.kind === 'quit' || !(r.value > 0)) return;

    if (!isRanked(r.mode, r.settings)) {
      box.hidden = false;
      const p = document.createElement('p');
      p.className = 'rank-note';
      p.textContent = t('rankNotRanked');
      box.appendChild(p);
      return;
    }

    let rows;
    try {
      rows = await top(r.mode, true);
    } catch (e) {
      box.hidden = false;
      const p = document.createElement('p');
      p.className = 'rank-note';
      p.textContent = t('rankOffline');
      box.appendChild(p);
      return;
    }
    if (!$('result').classList.contains('active')) return;

    box.hidden = false;
    if (!qualifies(r.mode, r.value, rows)) {
      const p = document.createElement('p');
      p.className = 'rank-note';
      p.textContent = t('rankCut', { v: fmt(r.mode, rows[rows.length - 1].score) });
      box.appendChild(p);
      return;
    }

    // TOP 10 진입 → 이름 입력
    const title = document.createElement('div');
    title.className = 'rank-hi';
    title.textContent = t('rankEnter');
    const form = document.createElement('form');
    form.className = 'rank-form';
    form.noValidate = true;
    const input = document.createElement('input');
    input.id = 'rankName';
    input.maxLength = 8;
    input.autocomplete = 'nickname';
    input.placeholder = t('rankPlaceholder');
    input.value = getSavedName();
    input.setAttribute('aria-label', t('rankPlaceholder'));
    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.className = 'btn btn-primary btn-small';
    btn.textContent = t('rankSave');
    const err = document.createElement('p');
    err.className = 'rank-err';
    err.hidden = true;
    const hint = document.createElement('p');
    hint.className = 'rank-note';
    hint.textContent = t('rankHint');
    form.append(input, btn);
    box.append(title, form, err, hint);

    let busy = false;
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (busy) return;
      const c = cleanName(input.value);
      if (c.err) { err.textContent = t(c.err); err.hidden = false; return; }
      busy = true;
      btn.disabled = true;
      err.hidden = true;
      try {
        const b = await board();
        const id = await b.submit(r.mode, c.name, r.value);
        setSavedName(c.name);
        if (window.track) window.track(`rank-${r.mode}`, '명예의 전당 등록');
        const fresh = await top(r.mode, true);
        const place = fresh.findIndex(x => x.id === id);
        if (place >= 0) lastPlace = { mode: r.mode, value: r.value, n: place + 1 };
        box.textContent = '';
        const done = document.createElement('div');
        done.className = 'rank-hi';
        done.textContent = place >= 0 ? t('rankDone', { n: place + 1 }) : t('rankSaved');
        const list = document.createElement('ol');
        list.className = 'rank-list';
        renderRows(list, r.mode, fresh, id);
        box.append(done, list);
        tab = r.mode;
      } catch (e2) {
        busy = false;
        btn.disabled = false;
        err.textContent = t('rankErrSave');
        err.hidden = false;
      }
    });
  }

  // 공유 문구용: 이 결과로 명예의 전당에 등록했으면 몇 위인지
  function placeFor(r) {
    return lastPlace && lastPlace.mode === r.mode && lastPlace.value === r.value ? lastPlace.n : null;
  }

  return { renderHome, onResult, placeFor, setTab: m => { tab = m; } };
})();
