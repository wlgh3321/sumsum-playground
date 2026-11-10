/*
 * 그룹 경쟁전 (앱)
 * - 방을 만들면 링크(…/?room=방번호)가 생겨요. 단톡방 등에 올리면 그 링크로 들어온 사람끼리만 순위를 겨뤄요.
 * - 방 하나에서 게임 6개를 모두 겨뤄요 (게임마다 따로 순위).
 * - 모두 🏆 랭킹전 조건 + 완전히 같은 문제(방의 씨앗)로 해요.
 * - 방은 3일 동안 열려 있어요. 여러 번 해도 게임마다 최고 기록 한 줄만 남아요.
 * - 같은 방 안에서는 닉네임이 겹칠 수 없어요 (먼저 쓴 사람 것).
 */
const Room = (() => {
  const $ = id => document.getElementById(id);
  const MODES = ['fall', 'minute', 'race', 'balloon', 'beat', 'tf'];
  const MINE_KEY = 'sumsum:rooms'; // 이 기기가 들어가 본 방 { 방번호: { exp, host, name } }
  const SITE = 'https://sumsum.studiojhl.com/';

  let room = null;     // 지금 보고 있는 방 { id, seed, host, at, exp }
  let tab = 'fall';    // 방 화면에서 보고 있는 게임
  let rows = [];       // 그 게임의 순위 (좋은 기록 순)
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
    for (const k of Object.keys(all)) if (!all[k].exp || all[k].exp < Date.now() - 86400000) delete all[k];
    try { localStorage.setItem(MINE_KEY, JSON.stringify(all)); } catch (e) {}
  }
  const pid = () => Ranking.pid(); // 앱: 명예의 전당과 같은 기기 번호

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
  const roomUrl = id => `${SITE}?room=${id}`; // 앱이 없는 친구는 웹에서 참가해요
  const ended = () => room && room.exp <= Date.now();
  const roomName = host => (host ? t('roomBy', { name: host }) : t('roomKicker'));

  /* ---------- 순위 그리기 ---------- */
  // idx: 보여 줄 줄 번호들 (없으면 전부)
  function renderList(list, mode, highlight, idx) {
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
      const b = document.createElement('span'); b.className = 'rank-name'; Ranking.setName(b, r); Glyph.fit(b, r.name);
      if (i === 0) b.insertAdjacentHTML('afterbegin', Ranking.CROWN);
      const c = document.createElement('span'); c.className = 'rank-score'; c.textContent = Ranking.fmt(mode, r.score);
      li.append(a, b, c);
      list.appendChild(li);
    });
  }

  function renderTabs() {
    const box = $('roomTabs');
    box.textContent = '';
    for (const m of MODES) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip rank-tab';
      b.textContent = gameName(m);
      b.setAttribute('aria-pressed', String(m === tab));
      b.addEventListener('click', () => loadTab(m));
      box.appendChild(b);
    }
  }

  function render() {
    if (!room) return;
    $('roomTitle').textContent = t('roomKicker');
    $('roomMeta').textContent = `${roomName(room.host)}\n${leftText(room.exp)}`;
    $('roomTabs').hidden = false;
    renderTabs();
    const over = ended();
    $('roomCount').hidden = false;
    $('roomCount').textContent = over && rows.length
      ? t('roomWinner', { name: rows[0].name, v: Ranking.fmt(tab, rows[0].score) })
      : t('roomCount', { game: gameName(tab), n: rows.length });
    $('roomPlay').hidden = over;
    $('roomRule').hidden = over;
    renderList($('roomList'), tab, pid());
  }

  function message(key) {
    $('roomTitle').textContent = t('roomKicker');
    $('roomMeta').textContent = '';
    $('roomTabs').hidden = true;
    $('roomCount').hidden = true;
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

  async function loadTab(m) {
    tab = m;
    renderTabs();
    const want = m;
    try {
      const R = await api();
      const got = await R.players(room.id, m);
      if (want !== tab) return;
      rows = got;
      render();
    } catch (e) {
      if (want === tab) { rows = []; render(); }
    }
  }

  /* ---------- 방 열기 ---------- */
  async function open(id, mode) {
    App.show('room');
    message('roomLoading');
    try {
      const R = await api();
      const r = await R.get(id);
      if (!r) { message('roomNotFound'); return; }
      room = r;
      tab = MODES.includes(mode) ? mode : (mine()[id] || {}).tab || 'fall';
      rows = await R.players(id, tab);
      remember(id, { exp: r.exp, host: r.host });
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
      if (window.track) window.track('room-open', '그룹 경쟁전 열기');
      open(id);
      return true;
    } catch (e) { return false; }
  }

  /* ---------- 방 만들기 (누르면 바로 만들어져요) ---------- */
  async function create() {
    if (busy) return;
    busy = true;
    const btn = $('roomNew') || {};
    btn.disabled = true;
    try {
      const R = await api();
      const seed = 1 + Math.floor(Math.random() * 2147483646);
      const host = Ranking.getSavedName();
      const id = await R.create(seed, host);
      remember(id, { exp: Date.now() + R.LIFE, host, own: true });
      if (window.track) window.track('room-new', '그룹 경쟁전 만들기');
      await open(id);
      App.toast(t('roomCreated'));
    } catch (e) {
      App.toast(t('roomCreateFail'));
    } finally {
      busy = false;
      btn.disabled = false;
    }
  }

  /* ---------- 공유 ---------- */
  // 카톡 카드 그림 (1200×630): 아이폰 앱은 카톡에 그림을 꼭 올려야 해서 직접 그려요
  async function cardImage(title) {
    try { await document.fonts.ready; } catch (e) {}
    const c = document.createElement('canvas');
    c.width = 1200; c.height = 630;
    const x = c.getContext('2d');
    x.fillStyle = '#0d0a1c'; x.fillRect(0, 0, 1200, 630);
    x.strokeStyle = 'rgba(106, 77, 255, 0.16)'; x.lineWidth = 2;
    for (let i = 0; i <= 1200; i += 40) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 630); x.stroke(); }
    for (let i = 0; i <= 630; i += 40) { x.beginPath(); x.moveTo(0, i); x.lineTo(1200, i); x.stroke(); }
    x.strokeStyle = '#6a4dff'; x.lineWidth = 10; x.strokeRect(40, 40, 1120, 550);
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#4de1ff'; x.font = '34px "Press Start 2P", monospace';
    x.fillText('SUMSUM', 600, 150);
    x.fillStyle = '#ffe14d'; x.font = '150px "Do Hyeon", sans-serif';
    x.fillText(t('roomKicker'), 600, 300);
    x.fillStyle = '#f2eeff'; x.font = '52px "Do Hyeon", sans-serif';
    x.fillText(title, 600, 430);
    x.fillStyle = '#9d93c9'; x.font = '40px "Do Hyeon", sans-serif';
    x.fillText(t('roomCardSub'), 600, 505);
    const blob = await new Promise(res => c.toBlob(res, 'image/png'));
    return new File([blob], 'sumsum-room.png', { type: 'image/png' });
  }

  async function share() {
    if (!room) return;
    const url = roomUrl(room.id);
    const exec = `room=${room.id}`;
    const title = room.host ? t('roomCardTitle', { name: room.host }) : t('roomCardTitleAnon');
    const desc = t('roomCardDesc');
    if (window.track) window.track('room-share', '그룹 경쟁전 공유');
    const N = window.SumsumNative;
    // 아이폰 앱(한국어): 카톡으로 그림 카드 + [앱으로 참가][웹으로 참가]
    if (N && N.kakao && LANG === 'ko') {
      try {
        const f = await cardImage(room.host ? t('roomBy', { name: room.host }) : t('roomCardSubAnon'));
        await N.kakaoImage(f, {
          title, desc, url,
          buttons: [
            { title: t('roomJoinApp'), url: SITE + 'get/?' + exec, exec },
            { title: t('roomJoinWeb'), url },
          ],
        });
        return;
      } catch (e) { /* 카톡이 없거나 실패하면 아래로 */ }
    }
    // 안드로이드 앱·웹(한국어): 카카오 SDK 카드
    if (KakaoShare.sendText({ title, desc, url, exec, labels: [t('roomJoinApp'), t('roomJoinWeb')] })) return;
    // 그 밖: 글과 링크를 한 덩어리로 (url을 따로 넘기면 카톡에서 사이에 빈 줄이 생겨요)
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
    const live = Object.entries(mine()).filter(([, v]) => v.exp > Date.now())
      .sort((a, b) => b[1].exp - a[1].exp).slice(0, 3);
    box.hidden = !live.length;
    box.innerHTML = '';
    for (const [id, v] of live) {
      const li = document.createElement('li');
      li.className = 'room-mine-row';
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'room-mine-btn';
      b.dataset.roomId = id;
      const n = document.createElement('span'); n.className = 'room-mine-game'; n.textContent = v.own ? t('roomMineOwn') : roomName(v.host);
      const l = document.createElement('span'); l.className = 'room-mine-left'; l.textContent = leftText(v.exp);
      b.append(n, l);
      li.appendChild(b);
      box.appendChild(li);
    }
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
  function showPlaced(box, mode, myId, head) {
    box.textContent = '';
    const n = rows.findIndex(x => x.id === myId) + 1;
    if (head) note(box, head, 'rank-hi');
    else if (n > 0) note(box, t('roomPlace', { n, total: rows.length }), 'rank-hi');
    const list = document.createElement('ol');
    list.className = 'rank-list';
    const idx = rows.slice(0, 5).map((_, i) => i);
    if (n > 5) idx.push(n - 1);
    renderList(list, mode, myId, idx);
    box.appendChild(list);
    const view = document.createElement('button');
    view.type = 'button';
    view.className = 'btn btn-small';
    view.textContent = t('roomView');
    view.addEventListener('click', () => { tab = mode; render(); App.show('room'); });
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

    const mode = r.mode;
    const me = pid();
    const known = (mine()[room.id] || {}).name;
    const R = await api().catch(() => null);
    if (!R) { note(box, t('roomOffline')); return; }

    async function submit(name, first) {
      await R.save(room.id, mode, me, name, r.value, Ranking.myCountry(), first);
      remember(room.id, { name, tab: mode });
      Ranking.setSavedName(name);
      rows = await R.players(room.id, mode);
      tab = mode;
      showPlaced(box, mode, me);
    }

    try { rows = await R.players(room.id, mode); } catch (e) { note(box, t('roomOffline')); return; }
    tab = mode;
    const old = rows.find(x => x.id === me);
    // 이 방에 이미 이름을 남겼으면: 같은 이름으로 자동 기록 (더 좋은 기록일 때만 바뀌어요)
    if (known || old) {
      const name = old ? old.name : known;
      if (old && !better(mode, r.value, old.score)) {
        const n = rows.indexOf(old) + 1;
        showPlaced(box, mode, me, t('roomKept', { n, v: Ranking.fmt(mode, old.score) }));
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
        if (window.track) window.track(`room-save-${mode}`, '그룹 경쟁전 기록');
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
    // 방 만들기는 앱에서만 (웹 홈에는 버튼이 없어요). 웹은 받은 링크로 참가만 해요.
    if ($('roomNew')) $('roomNew').addEventListener('click', create);
    $('roomPlay').addEventListener('click', () => {
      if (!room || ended()) return;
      remember(room.id, { tab });
      App.playRoom({ id: room.id, mode: tab, seed: room.seed });
    });
    $('roomShare').addEventListener('click', share);
    $('roomHome').addEventListener('click', () => App.showHome());
    if ($('roomMine')) $('roomMine').addEventListener('click', e => {
      const b = e.target.closest('[data-room-id]');
      if (b) open(b.dataset.roomId);
    });
  }

  // 카톡 '앱으로 참가'로 앱이 열렸을 때 (App.openChallenge 가 불러요)
  function openQuery(query) {
    try {
      const id = new URLSearchParams(query).get('room');
      if (!id || !/^[A-Za-z0-9]{6,32}$/.test(id)) return false;
      if (window.track) window.track('room-open-app', '그룹 경쟁전 앱으로 열기');
      open(id);
      return true;
    } catch (e) { return false; }
  }

  return { bind, readLink, openQuery, open, onResult, renderMine, cardImage, current: () => room };
})();
