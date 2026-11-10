/*
 * 그룹 경쟁전 (앱·웹이 같은 파일을 써요: app/js/room.js → js/room.js 로 복사)
 * - 방을 만들면 링크(…/?room=방번호)가 생겨요. 그 링크로 들어온 사람끼리만 순위를 겨뤄요.
 * - 방 하나에서 게임 6개를 겨뤄요 (게임마다 따로 순위).
 * - 모두 🏆 랭킹전 조건. 문제는 매일(한국 시간 자정) 바뀌고, 같은 날엔 모두 똑같은 문제예요.
 * - 3일마다 순위만 새로 시작해요(회차). 방은 방장이 지울 때까지 남아요.
 * - 같은 방 안에서는 닉네임이 겹칠 수 없어요 (먼저 쓴 사람 것). 회차·게임마다 최고 기록 한 줄만 남아요.
 * - 방 만들기·이름 바꾸기·지우기는 앱에서만 (웹은 받은 링크로 참가만 해요).
 */
const Room = (() => {
  const $ = id => document.getElementById(id);
  const MODES = ['fall', 'minute', 'race', 'balloon', 'beat', 'tf'];
  const MINE_KEY = 'sumsum:rooms'; // 이 기기가 들어가 본 방 { 방번호: { name, host, own, last, nick } }
  const SITE = 'https://sumsum.studiojhl.com/';
  const DAY = 86400000;
  const KST = 9 * 3600000;
  const SEASON_DAYS = 3;

  let room = null;     // 지금 보고 있는 방 { id, seed, host, name, owner, at }
  let tab = 'fall';    // 방 화면에서 보고 있는 게임
  let rows = [];       // 그 게임의 이번 회차 순위 (좋은 기록 순)
  let busy = false;
  let mineOpen = false; // 홈: '내 방 보기' 펼침
  let pending = null;   // 방 만들기 창: { result } (결과 화면에서 열었으면 그 판 기록을 첫 기록으로)
  let renaming = false;

  const better = (mode, a, b) => (mode === 'race' ? a < b : a > b);
  const gameName = mode => modeName(mode, { time: 60 });

  /* ---------- 날짜·회차·오늘의 문제 ---------- */
  const kday = ms => Math.floor((ms + KST) / DAY);
  const dayIdx = r => Math.max(0, kday(Date.now()) - kday(r.at));
  const season = r => Math.floor(dayIdx(r) / SEASON_DAYS);
  const seasonEnd = r => (kday(r.at) + SEASON_DAYS * (season(r) + 1)) * DAY - KST; // 이번 회차가 끝나는 시각
  // 오늘의 문제 씨앗: 첫날은 방 씨앗 그대로(결과 화면에서 만든 방은 방금 판 = 첫날 문제), 다음 날부터 섞어요
  function todaySeed(r) {
    const d = dayIdx(r);
    if (d === 0) return r.seed;
    let x = (r.seed ^ Math.imul(d + 1, 0x9E3779B1)) >>> 0;
    x = Math.imul(x ^ (x >>> 16), 0x85EBCA6B) >>> 0;
    x = (x ^ (x >>> 13)) >>> 0;
    return 1 + (x % 2147483646);
  }

  /* ---------- 이 기기에 저장 ---------- */
  function mine() {
    try { return JSON.parse(localStorage.getItem(MINE_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveMine(all) {
    try { localStorage.setItem(MINE_KEY, JSON.stringify(all)); } catch (e) {}
  }
  function remember(id, patch) {
    const all = mine();
    all[id] = { ...(all[id] || {}), ...patch };
    saveMine(all);
  }
  function forget(id) {
    const all = mine();
    delete all[id];
    saveMine(all);
  }
  const touch = (id, patch = {}) => remember(id, { ...patch, last: Date.now() }); // 최근에 한 방이 맨 위로

  function pid() {
    if (typeof Ranking !== 'undefined' && Ranking.pid) return Ranking.pid(); // 앱: 명예의 전당과 같은 기기 번호
    try {
      let p = localStorage.getItem('sumsum:pid');
      if (!p || !/^[A-Za-z0-9]{8,64}$/.test(p)) {
        p = Array.from(crypto.getRandomValues(new Uint8Array(12)), b => (b % 36).toString(36)).join('') + Date.now().toString(36);
        localStorage.setItem('sumsum:pid', p);
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
  function leftText(end) {
    const ms = end - Date.now();
    const h = Math.max(0, Math.floor(ms / 3600000));
    if (h >= 24) return t('roomResetD', { d: Math.floor(h / 24), h: h % 24 });
    return t('roomResetH', { h, m: Math.max(0, Math.floor((ms % 3600000) / 60000)) });
  }
  const roomUrl = id => `${SITE}?room=${id}`;
  const isOwner = () => !!(room && room.owner && window.Rooms && Rooms.myUid && Rooms.myUid() === room.owner);
  const canCreate = () => !!$('roomNewBox');
  const fit = (el, name) => { if (typeof Glyph !== 'undefined') Glyph.fit(el, name); };

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
      const b = document.createElement('span'); b.className = 'rank-name'; Ranking.setName(b, r); fit(b, r.name);
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
    $('roomTitle').textContent = room.name || t('roomKicker');
    const lines = [];
    if (room.host) lines.push(t('roomBy', { name: room.host }));
    lines.push(`${t('roomRound', { n: season(room) + 1 })} · ${leftText(seasonEnd(room))}`);
    $('roomMeta').textContent = lines.join('\n');
    $('roomTabs').hidden = false;
    renderTabs();
    $('roomCount').hidden = false;
    $('roomCount').textContent = t('roomCount', { game: gameName(tab), n: rows.length });
    $('roomPlay').hidden = false;
    $('roomRule').hidden = false;
    $('roomShare').hidden = false;
    if ($('roomOwner')) $('roomOwner').hidden = !isOwner();
    renderList($('roomList'), tab, pid());
    $('roomList').scrollTop = 0;
  }

  function message(key) {
    $('roomTitle').textContent = t('roomKicker');
    $('roomMeta').textContent = '';
    $('roomTabs').hidden = true;
    $('roomCount').hidden = true;
    $('roomPlay').hidden = true;
    $('roomShare').hidden = true;
    $('roomRule').hidden = true;
    if ($('roomOwner')) $('roomOwner').hidden = true;
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
      const got = await R.players(room.id, m, season(room));
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
      if (R.me) R.me().then(() => { if (room && room.id === id && $('roomOwner')) $('roomOwner').hidden = !isOwner(); }).catch(() => {});
      const r = await R.get(id);
      if (!r) { forget(id); renderMine(); message('roomNotFound'); return; }
      room = r;
      tab = MODES.includes(mode) ? mode : (mine()[id] || {}).tab || 'fall';
      rows = await R.players(id, tab, season(r));
      touch(id, { name: r.name, host: r.host });
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

  /* ---------- 방 만들기·이름 바꾸기 창 (앱) ---------- */
  const cleanRoomName = s => String(s || '').replace(/\s+/g, ' ').trim().slice(0, 20);
  function openNew(opts = {}) {
    if (!canCreate()) return;
    renaming = !!opts.rename;
    pending = opts.result ? { result: opts.result } : null;
    const nick = Ranking.getSavedName();
    $('roomNewTitle').textContent = t(renaming ? 'roomRenameTitle' : (pending ? 'roomFromResultTitle' : 'roomNewTitle'));
    $('roomNewNote').textContent = renaming ? '' : t(pending && pending.result.settings && pending.result.settings.ranked ? 'roomFromResultNote' : 'roomNewNote');
    $('roomNewNote').hidden = renaming;
    $('roomNameInput').value = renaming ? (room.name || '') : '';
    $('roomNameInput').placeholder = t('roomNamePh', { name: nick || t('roomNameMe') });
    $('roomNickField').hidden = renaming || !!nick;
    $('roomNickInput').value = '';
    $('roomNickInput').placeholder = t('rankPlaceholder');
    $('roomNewErr').hidden = true;
    $('roomCreate').textContent = t(renaming ? 'roomRenameSave' : 'roomCreate');
    $('roomNewBox').hidden = false;
  }
  function closeNew() { if ($('roomNewBox')) $('roomNewBox').hidden = true; pending = null; }
  function newErr(key) {
    $('roomNewErr').textContent = t(key);
    $('roomNewErr').hidden = false;
  }

  async function submitNew() {
    if (busy) return;
    const nick0 = Ranking.getSavedName();
    let name = cleanRoomName($('roomNameInput').value) || t('roomNameDefault', { name: nick0 || t('roomNameMe') });
    if (renaming) {
      if (!room) return;
      busy = true;
      try {
        const R = await api();
        await R.rename(room.id, name);
        room.name = name;
        touch(room.id, { name });
        closeNew();
        render();
        renderMine();
      } catch (e) { newErr('roomRenameFail'); }
      busy = false;
      return;
    }
    let nick = nick0;
    if (!nick) {
      const c = Ranking.cleanName($('roomNickInput').value);
      if (c.err) { newErr(c.err); return; }
      nick = c.name;
    }
    busy = true;
    $('roomCreate').disabled = true;
    const res = pending && pending.result;
    try {
      const R = await api();
      const ranked = !!(res && res.settings && res.settings.ranked && res.seed && res.value > 0);
      // 결과 화면에서 랭킹전 판으로 만들면: 방의 첫날 문제 = 방금 그 판 → 내 기록이 첫 기록으로 들어가요
      const seed = ranked ? res.seed : 1 + Math.floor(Math.random() * 2147483646);
      const id = await R.create(seed, nick, name);
      Ranking.setSavedName(nick);
      touch(id, { name, host: nick, own: true, nick, tab: ranked ? res.mode : 'fall' });
      if (ranked) {
        try {
          await R.save(id, res.mode, 0, pid(), nick, res.value, Ranking.myCountry(), true);
        } catch (e) { /* 기록은 못 올려도 방은 만들어졌어요 */ }
      }
      if (window.track) window.track(ranked ? 'room-new-result' : 'room-new', '그룹 경쟁전 만들기');
      closeNew();
      await open(id, ranked ? res.mode : undefined);
      App.toast(t('roomCreated'));
    } catch (e) {
      newErr('roomCreateFail');
    } finally {
      busy = false;
      $('roomCreate').disabled = false;
    }
  }

  async function removeRoom() {
    if (!room || !isOwner()) return;
    if (!window.confirm(t('roomDeleteAsk', { name: room.name || t('roomKicker') }))) return;
    try {
      const R = await api();
      await R.remove(room.id);
      forget(room.id);
      room = null;
      App.toast(t('roomDeleted'));
      App.showHome();
    } catch (e) { App.toast(t('roomDeleteFail')); }
  }

  /* ---------- 공유 ---------- */
  // 카톡 카드 그림 (1200×630): 아이폰 앱은 카톡에 그림을 꼭 올려야 해서 직접 그려요
  async function cardImage(title, sub) {
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
    x.fillStyle = '#4de1ff'; x.font = '40px "Do Hyeon", sans-serif';
    x.fillText(t('roomKicker'), 600, 150);
    x.fillStyle = '#ffe14d';
    let size = 130;
    x.font = `${size}px "Do Hyeon", sans-serif`;
    while (x.measureText(title).width > 1000 && size > 60) { size -= 6; x.font = `${size}px "Do Hyeon", sans-serif`; }
    x.fillText(title, 600, 290);
    x.fillStyle = '#f2eeff'; x.font = '48px "Do Hyeon", sans-serif';
    x.fillText(sub, 600, 420);
    x.fillStyle = '#9d93c9'; x.font = '38px "Do Hyeon", sans-serif';
    x.fillText(t('roomCardSub'), 600, 495);
    const blob = await new Promise(res => c.toBlob(res, 'image/png'));
    return new File([blob], 'sumsum-room.png', { type: 'image/png' });
  }

  async function share() {
    if (!room) return;
    const url = roomUrl(room.id);
    const exec = `room=${room.id}`;
    const nm = room.name || t('roomKicker');
    const title = room.host ? t('roomCardTitle', { name: room.host, room: nm }) : t('roomCardTitleAnon', { room: nm });
    const desc = t('roomCardDesc');
    if (window.track) window.track('room-share', '그룹 경쟁전 공유');
    const N = window.SumsumNative;
    // 아이폰 앱(한국어): 카톡으로 그림 카드 + [앱으로 참가][웹으로 참가]
    if (N && N.kakao && typeof LANG !== 'undefined' && LANG === 'ko') {
      try {
        const f = await cardImage(nm, room.host ? t('roomBy', { name: room.host }) : t('roomCardSubAnon'));
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
    if (KakaoShare.sendText({ title, desc, url, exec, labels: [t('roomJoinApp'), t('roomJoinWeb')], btn: t('roomJoin') })) return;
    // 그 밖: 글과 링크를 한 덩어리로 (url을 따로 넘기면 카톡에서 사이에 빈 줄이 생겨요)
    const text = `${title}\n${desc}\n${url}`;
    if (navigator.share) {
      try { await navigator.share({ text }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(text); App.toast(t('shareCopied')); } catch (e) { App.toast(t('shareFail')); }
  }

  /* ---------- 홈: 내 방 보기 (최근에 한 방이 맨 위) ---------- */
  function renderMine() {
    const box = $('roomMine');
    const tog = $('roomMineToggle');
    if (!box) return;
    const list = Object.entries(mine()).filter(([, v]) => v && v.last)
      .sort((a, b) => b[1].last - a[1].last);
    if (tog) {
      tog.hidden = !list.length;
      tog.textContent = t(mineOpen ? 'roomMineHide' : 'roomMineShow', { n: list.length });
      tog.setAttribute('aria-expanded', String(mineOpen));
    }
    box.hidden = !list.length || (tog ? !mineOpen : false);
    box.innerHTML = '';
    for (const [id, v] of list) {
      const li = document.createElement('li');
      li.className = 'room-mine-row';
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'room-mine-btn';
      b.dataset.roomId = id;
      const n = document.createElement('span'); n.className = 'room-mine-game'; n.textContent = v.name || t('roomKicker');
      const l = document.createElement('span'); l.className = 'room-mine-left';
      l.textContent = v.own ? t('roomMineOwn') : (v.host ? t('roomBy', { name: v.host }) : '');
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
    // 자정이 지나 문제가 바뀐 뒤에 끝난 판은 기록하지 않아요
    if (r.seed !== todaySeed(room)) { note(box, t('roomStaleNote')); return; }

    const mode = r.mode;
    const ssn = season(room);
    const me = pid();
    const known = (mine()[room.id] || {}).nick;
    const R = await api().catch(() => null);
    if (!R) { note(box, t('roomOffline')); return; }

    async function submit(name, first) {
      await R.save(room.id, mode, ssn, me, name, r.value, Ranking.myCountry(), first);
      touch(room.id, { nick: name, tab: mode });
      Ranking.setSavedName(name);
      rows = await R.players(room.id, mode, ssn);
      tab = mode;
      showPlaced(box, mode, me);
    }

    try { rows = await R.players(room.id, mode, ssn); } catch (e) { note(box, t('roomOffline')); return; }
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
    if ($('roomNew')) $('roomNew').addEventListener('click', () => openNew());
    if ($('roomNewBox')) {
      $('roomNewClose').addEventListener('click', closeNew);
      $('roomNewBox').addEventListener('click', e => { if (e.target === $('roomNewBox')) closeNew(); });
      $('roomCreate').addEventListener('click', submitNew);
      $('roomNameInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submitNew(); } });
    }
    if ($('roomRename')) $('roomRename').addEventListener('click', () => { if (isOwner()) openNew({ rename: true }); });
    if ($('roomDelete')) $('roomDelete').addEventListener('click', removeRoom);
    $('roomPlay').addEventListener('click', () => {
      if (!room) return;
      touch(room.id, { tab });
      App.playRoom({ id: room.id, mode: tab, seed: todaySeed(room) });
    });
    $('roomShare').addEventListener('click', share);
    $('roomHome').addEventListener('click', () => App.showHome());
    if ($('roomMineToggle')) $('roomMineToggle').addEventListener('click', () => { mineOpen = !mineOpen; renderMine(); });
    if ($('roomMine')) $('roomMine').addEventListener('click', e => {
      const b = e.target.closest('[data-room-id]');
      if (b) open(b.dataset.roomId);
    });
  }

  return { bind, readLink, openQuery, open, openNew, share, onResult, renderMine, cardImage, current: () => room };
})();
