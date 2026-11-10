/*
 * 단톡 경쟁전
 * - 방을 만들면 링크(…/?room=방번호)가 생겨요. 단톡방에 올리면 그 링크로 들어온 사람끼리만 순위를 겨뤄요.
 * - 모두 🏆 랭킹전 조건 + 완전히 같은 문제(방의 씨앗)로 해요.
 * - 방은 3일 동안 열려 있어요. 여러 번 해도 사람마다 최고 기록 한 줄만 남아요.
 * - 같은 방 안에서는 닉네임이 겹칠 수 없어요 (먼저 쓴 사람 것).
 */
const Room = (() => {
  const $ = id => document.getElementById(id);
  const MODES = ['fall', 'minute', 'race', 'balloon', 'beat', 'tf'];
  const MINE_KEY = 'sumsum:rooms'; // 이 기기가 들어가 본 방 { 방번호: { mode, exp, name } }
  const PID_KEY = 'sumsum:pid';    // 이 기기의 번호 (방마다 내 줄을 찾을 때 써요)
  const SITE = 'https://sumsum.studiojhl.com/';

  let room = null;     // 지금 보고 있는 방 { id, mode, seed, host, at, exp }
  let rows = [];       // 그 방의 순위 (좋은 기록 순)
  let pickMode = 'race';
  let busy = false;

  const better = (mode, a, b) => (mode === 'race' ? a < b : a > b);
  const gameName = mode => modeName(mode, { time: 60 });

  /* ---------- 이 기기에 저장 ---------- */
  function mine() {
    try { return JSON.parse(localStorage.getItem(MINE_KEY)) || {}; } catch (e) { return {}; }
  }
  function remember(id, patch) {
    const all = mine();
    all[id] = { ...(all[id] || {}), ...patch };
    // 마감된 지 하루 넘은 방은 정리해요
    for (const k of Object.keys(all)) if (all[k].exp && all[k].exp < Date.now() - 86400000) delete all[k];
    try { localStorage.setItem(MINE_KEY, JSON.stringify(all)); } catch (e) {}
  }
  function pid() {
    try {
      let p = localStorage.getItem(PID_KEY);
      if (!p || !/^[A-Za-z0-9]{8,64}$/.test(p)) {
        p = Array.from(crypto.getRandomValues(new Uint8Array(12)), b => (b % 36).toString(36)).join('') + Date.now().toString(36);
        localStorage.setItem(PID_KEY, p);
      }
      return p;
    } catch (e) { return 'anon' + Date.now().toString(36); }
  }

  /* ---------- Firebase 준비 기다리기 ---------- */
  function api() {
    if (window.Rooms) return Promise.resolve(window.Rooms);
    return new Promise((resolve, reject) => {
      window.addEventListener('board-ready', () => resolve(window.Rooms), { once: true });
      setTimeout(() => reject(new Error('timeout')), 8000);
    });
  }

  /* ---------- 글자 ---------- */
  function leftText(exp) {
    const ms = exp - Date.now();
    if (ms <= 0) return t('roomEnded');
    const h = Math.floor(ms / 3600000);
    if (h >= 24) return t('roomLeftD', { d: Math.floor(h / 24), h: h % 24 });
    return t('roomLeftH', { h, m: Math.floor((ms % 3600000) / 60000) });
  }
  const roomUrl = id => `${location.protocol.startsWith('http') ? location.origin + '/' : SITE}?room=${id}`;
  const ended = () => room && room.exp <= Date.now();

  /* ---------- 순위 그리기 ---------- */
  // idx: 보여 줄 줄 번호들 (없으면 전부)
  function renderList(list, highlight, idx) {
    list.textContent = '';
    if (!rows.length) {
      const li = document.createElement('li');
      li.className = 'rank-empty';
      li.textContent = t('roomEmpty');
      list.appendChild(li);
      return;
    }
    (idx || rows.map((_, i) => i)).forEach(i => {
      const r = rows[i];
      const li = document.createElement('li');
      li.className = `rank-row r${i + 1}${r.id === highlight ? ' me' : ''}`;
      const a = document.createElement('span'); a.className = 'rank-no'; a.textContent = Ranking.ordinal(i);
      const b = document.createElement('span'); b.className = 'rank-name'; Ranking.setName(b, r);
      if (i === 0) b.insertAdjacentHTML('afterbegin', Ranking.CROWN);
      const c = document.createElement('span'); c.className = 'rank-score'; c.textContent = Ranking.fmt(room.mode, r.score);
      li.append(a, b, c);
      list.appendChild(li);
    });
  }

  function render() {
    if (!room) return;
    $('roomTitle').textContent = gameName(room.mode);
    const meta = [];
    if (room.host) meta.push(t('roomBy', { name: room.host }));
    meta.push(t('roomCount', { n: rows.length }));
    $('roomMeta').textContent = `${meta.join(' · ')}\n${leftText(room.exp)}`; // 마감 시간은 둘째 줄
    const over = ended();
    $('roomWinner').hidden = !(over && rows.length);
    if (over && rows.length) $('roomWinner').textContent = t('roomWinner', { name: rows[0].name, v: Ranking.fmt(room.mode, rows[0].score) });
    $('roomPlay').hidden = over;
    $('roomRule').hidden = over;
    renderList($('roomList'), pid());
  }

  function message(key) {
    $('roomTitle').textContent = t('roomKicker');
    $('roomMeta').textContent = '';
    $('roomWinner').hidden = true;
    $('roomPlay').hidden = true;
    $('roomShare').hidden = true;
    $('roomRule').hidden = true;
    const list = $('roomList');
    list.textContent = '';
    const li = document.createElement('li');
    li.className = 'rank-empty';
    li.textContent = t(key);
    list.appendChild(li);
  }

  /* ---------- 방 열기 ---------- */
  async function open(id) {
    App.show('room');
    message('roomLoading');
    try {
      const R = await api();
      const r = await R.get(id);
      if (!r || !MODES.includes(r.mode)) { message('roomNotFound'); return; }
      room = r;
      rows = await R.players(id, r.mode);
      remember(id, { mode: r.mode, exp: r.exp });
      $('roomShare').hidden = false;
      KakaoShare.prepare(); // 카톡 공유를 미리 불러 둬요 (안 하면 카톡 카드 대신 일반 공유로 나가요)
      render();
      renderMine();
    } catch (e) {
      message('roomOffline');
    }
  }

  // 주소에 ?room=방번호 가 있으면 그 방을 열어요 (주소는 깨끗하게)
  function readLink() {
    try {
      const id = new URLSearchParams(location.search).get('room');
      if (!id || !/^[A-Za-z0-9]{6,32}$/.test(id)) return false;
      history.replaceState(null, '', location.pathname + location.hash);
      if (window.track) window.track('room-open', '단톡 경쟁전 열기');
      open(id);
      return true;
    } catch (e) { return false; }
  }

  /* ---------- 방 만들기 ---------- */
  function openNew() {
    pickMode = 'race';
    $('roomNewErr').hidden = true;
    renderPick();
    $('roomNewBox').hidden = false;
  }
  function closeNew() { $('roomNewBox').hidden = true; }
  function renderPick() {
    $('roomPick').innerHTML = MODES.map(m =>
      `<button type="button" class="chip" data-room-mode="${m}" aria-pressed="${m === pickMode}">${gameName(m)}</button>`).join('');
  }
  async function create() {
    if (busy) return;
    busy = true;
    const btn = $('roomCreate');
    btn.disabled = true;
    $('roomNewErr').hidden = true;
    try {
      const R = await api();
      const seed = 1 + Math.floor(Math.random() * 2147483646);
      const host = Ranking.getSavedName();
      const id = await R.create(pickMode, seed, host);
      remember(id, { mode: pickMode, exp: Date.now() + R.WEEK, host: true });
      if (window.track) window.track(`room-new-${pickMode}`, '단톡 경쟁전 만들기');
      closeNew();
      await open(id);
      App.toast(t('roomCreated'));
    } catch (e) {
      $('roomNewErr').textContent = t('roomCreateFail');
      $('roomNewErr').hidden = false;
    } finally {
      busy = false;
      btn.disabled = false;
    }
  }

  /* ---------- 공유 ---------- */
  async function share() {
    if (!room) return;
    const url = roomUrl(room.id);
    const game = gameName(room.mode);
    const title = room.host ? t('roomCardTitle', { name: room.host }) : t('roomCardTitleAnon');
    const desc = rows.length
      ? t('roomCardLead', { game, name: rows[0].name, v: Ranking.fmt(room.mode, rows[0].score) })
      : t('roomCardDesc', { game });
    if (window.track) window.track(`room-share-${room.mode}`, '단톡 경쟁전 공유');
    if (KakaoShare.sendText({ title, desc, url, btn: t('roomJoin') })) return;
    // 글과 링크를 한 덩어리로 (url을 따로 넘기면 카톡에서 사이에 빈 줄이 생겨요)
    const text = `${title}\n${desc}\n${url}`;
    if (navigator.share) {
      try { await navigator.share({ text }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(text); App.toast(t('shareCopied')); } catch (e) { App.toast(t('shareFail')); }
  }

  /* ---------- 홈: 참여 중인 경쟁전 ---------- */
  function renderMine() {
    const box = $('roomMine');
    if (!box) return;
    const all = mine();
    const live = Object.entries(all).filter(([, v]) => v.exp > Date.now() && MODES.includes(v.mode))
      .sort((a, b) => b[1].exp - a[1].exp).slice(0, 3);
    box.hidden = !live.length;
    box.innerHTML = live.map(([id, v]) => `
      <li class="room-mine-row">
        <button type="button" class="room-mine-btn" data-room-id="${id}">
          <span class="room-mine-game">${gameName(v.mode)}</span>
          <span class="room-mine-left">${leftText(v.exp)}</span>
        </button>
      </li>`).join('');
  }

  /* ---------- 결과 화면: 경쟁전 기록 남기기 ---------- */
  function note(box, text, cls = 'rank-note') {
    const p = document.createElement('p');
    p.className = cls;
    p.textContent = text;
    box.appendChild(p);
    return p;
  }

  // 내 순위 문구 + 위쪽 5명(내가 밖이면 나까지) + "방 순위 보기"
  function showPlaced(box, myId, head) {
    box.textContent = '';
    const n = rows.findIndex(x => x.id === myId) + 1;
    if (head) note(box, head, 'rank-hi');
    else if (n > 0) note(box, t('roomPlace', { n, total: rows.length }), 'rank-hi');
    const list = document.createElement('ol');
    list.className = 'rank-list';
    const idx = rows.slice(0, 5).map((_, i) => i);
    if (n > 5) idx.push(n - 1);
    renderList(list, myId, idx);
    box.appendChild(list);
    const view = document.createElement('button');
    view.type = 'button';
    view.className = 'btn btn-small';
    view.textContent = t('roomView');
    view.addEventListener('click', () => { render(); App.show('room'); });
    box.appendChild(view);
  }

  async function onResult(r) {
    const box = $('roomBox');
    if (!box) return;
    box.textContent = '';
    box.hidden = true;
    if (!room || r.room !== room.id || r.badge.kind === 'quit' || !(r.value > 0)) return;
    box.hidden = false;
    if (ended()) { note(box, t('roomExpiredNote')); return; }

    const me = pid();
    const known = (mine()[room.id] || {}).name;
    const R = await api().catch(() => null);
    if (!R) { note(box, t('roomOffline')); return; }

    async function submit(name, first) {
      await R.save(room.id, me, name, r.value, Ranking.myCountry(), first);
      remember(room.id, { name });
      Ranking.setSavedName(name);
      rows = await R.players(room.id, room.mode);
      showPlaced(box, me);
    }

    // 이 방에 이미 이름을 남겼으면: 더 좋은 기록일 때만 자동으로 고쳐요
    try { rows = await R.players(room.id, room.mode); } catch (e) { note(box, t('roomOffline')); return; }
    const old = rows.find(x => x.id === me);
    if (known || old) {
      const name = old ? old.name : known;
      if (old && !better(room.mode, r.value, old.score)) {
        const n = rows.indexOf(old) + 1;
        showPlaced(box, me, t('roomKept', { n, v: Ranking.fmt(room.mode, old.score) }));
        return;
      }
      try {
        const owner = await R.nameOwner(room.id, name);
        await submit(name, owner !== me);
      } catch (e) { note(box, t('rankErrSave'), 'rank-err'); }
      return;
    }

    // 처음이면 닉네임을 받아요
    const title = document.createElement('div');
    title.className = 'rank-hi';
    title.textContent = t('roomEnter');
    const form = document.createElement('form');
    form.className = 'rank-form';
    form.noValidate = true;
    const input = document.createElement('input');
    input.maxLength = 8;
    input.autocomplete = 'nickname';
    input.placeholder = t('rankPlaceholder');
    input.value = Ranking.getSavedName();
    input.setAttribute('aria-label', t('rankPlaceholder'));
    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.className = 'btn btn-primary btn-small';
    btn.textContent = t('rankSave');
    const err = document.createElement('p');
    err.className = 'rank-err';
    err.hidden = true;
    form.append(input, btn);
    box.append(title, form, err);

    let sending = false;
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (sending) return;
      const c = Ranking.cleanName(input.value);
      if (c.err) { err.textContent = t(c.err); err.hidden = false; return; }
      sending = true;
      btn.disabled = true;
      err.hidden = true;
      try {
        const owner = await R.nameOwner(room.id, c.name);
        if (owner && owner !== me) {
          err.textContent = t('roomNameTaken');
          err.hidden = false;
          sending = false;
          btn.disabled = false;
          return;
        }
        await submit(c.name, owner !== me);
        if (window.track) window.track(`room-save-${room.mode}`, '단톡 경쟁전 기록');
      } catch (e2) {
        sending = false;
        btn.disabled = false;
        err.textContent = t('rankErrSave');
        err.hidden = false;
      }
    });
  }

  /* ---------- 연결 ---------- */
  function bind() {
    $('roomNew').addEventListener('click', openNew);
    $('roomNewClose').addEventListener('click', closeNew);
    $('roomNewBox').addEventListener('click', e => { if (e.target === $('roomNewBox')) closeNew(); });
    $('roomPick').addEventListener('click', e => {
      const b = e.target.closest('[data-room-mode]');
      if (!b) return;
      pickMode = b.dataset.roomMode;
      renderPick();
    });
    $('roomCreate').addEventListener('click', create);
    $('roomPlay').addEventListener('click', () => { if (room && !ended()) App.playRoom(room); });
    $('roomShare').addEventListener('click', share);
    $('roomHome').addEventListener('click', () => App.showHome());
    $('roomMine').addEventListener('click', e => {
      const b = e.target.closest('[data-room-id]');
      if (b) open(b.dataset.roomId);
    });
  }

  return { bind, readLink, open, onResult, renderMine, current: () => room };
})();
