/*
 * Firebase 연결 (순위표 저장소).
 * index.html에서 Firebase SDK(compat 버전)를 먼저 불러온 뒤 이 파일이 실행돼요.
 * 다른 파일은 window.Board로 순위표를 읽고 써요.
 * 아래 설정값은 사이트에 공개돼도 괜찮은 값이에요. 실제 보호는 Firestore 보안 규칙(firestore.rules)이 해요.
 */
(() => {
  const firebaseConfig = {
    apiKey: 'AIzaSyCHoe0sEZjp-gDg1IOXLh5a7SLIkdSxSUA',
    authDomain: 'sumsum-adec0.firebaseapp.com',
    projectId: 'sumsum-adec0',
    storageBucket: 'sumsum-adec0.firebasestorage.app',
    messagingSenderId: '522580224299',
    appId: '1:522580224299:web:bccb40a0ccf40d07547d6e',
  };

  // SDK를 못 불러왔으면(인터넷 끊김 등) 순위표만 꺼지고 게임은 그대로 돼요.
  if (!window.firebase || !firebase.firestore) return;

  const db = firebase.initializeApp(firebaseConfig).firestore();

  // 60문제 타임어택은 시간이 짧을수록 위, 나머지는 점수가 높을수록 위
  const dir = mode => (mode === 'race' ? 'asc' : 'desc');
  const scoresOf = mode => db.collection('boards').doc(mode).collection('scores');

  // 앱: 사람마다 한 줄(최고 기록만). 문서 이름 = 이 기기의 플레이어 번호
  const playersOf = mode => db.collection('boards').doc(mode).collection('players');

  window.Board = {
    // 앱 설정 (예: config/ads 의 전면 광고 횟수). 없으면 null
    async config(name) {
      const d = await db.collection('config').doc(name).get();
      return d.exists ? d.data() : null;
    },
    async players(mode, n = 500) {
      const snap = await playersOf(mode).orderBy('score', dir(mode)).limit(n).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    // 이 기기의 명예의 전당 줄 (없으면 null)
    async mine(mode, pid) {
      const d = await playersOf(mode).doc(pid).get();
      return d.exists ? d.data() : null;
    },
    async save(mode, pid, name, score, country) {
      const doc = { name, score, at: firebase.firestore.FieldValue.serverTimestamp(), v: 2 };
      if (country) doc.country = country;
      await playersOf(mode).doc(pid).set(doc);
      return pid;
    },
    async top(mode, n = 10) {
      const snap = await scoresOf(mode).orderBy('score', dir(mode)).limit(n).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async submit(mode, name, score, country) {
      const doc = { name, score, at: firebase.firestore.FieldValue.serverTimestamp(), v: 1 };
      if (country) doc.country = country;
      const ref = await scoresOf(mode).add(doc);
      return ref.id;
    },
  };
  // 그룹 경쟁전 방 (rooms/{방}): 링크 받은 사람끼리만 겨뤄요. 방 하나에 게임 6개.
  // - 문제는 24시간마다 바뀌고, 72시간(3일)마다 순위만 새로 시작해요(회차). 방은 방장이 지울 때까지 남아요.
  // - 방 만들기·이름 바꾸기·지우기는 방장만 (익명 로그인 번호로 확인해요)
  const rooms = db.collection('rooms');
  const roomKey = name => String(name || '').toLowerCase().replace(/ /g, ''); // 보안 규칙의 닉네임 열쇠와 똑같이
  const randId = n => {
    const A = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let s = '';
    const r = crypto.getRandomValues(new Uint32Array(n));
    for (let i = 0; i < n; i++) s += A[r[i] % A.length];
    return s;
  };
  const boardOf = (id, mode, season) => rooms.doc(id).collection('boards').doc(`${mode}_${season}`).collection('players');
  // 방장 확인용 익명 로그인 (앱에서만 불러와요)
  let authP = null;
  function me() {
    if (!firebase.auth) return Promise.reject(new Error('no auth'));
    if (!authP) {
      authP = new Promise((res, rej) => {
        const a = firebase.auth();
        if (a.currentUser) return res(a.currentUser.uid);
        const off = a.onAuthStateChanged(u => {
          if (u) { off(); res(u.uid); }
        });
        a.signInAnonymously().catch(e => { off(); authP = null; rej(e); });
      });
    }
    return authP;
  }
  window.Rooms = {
    me,
    myUid: () => (firebase.auth && firebase.auth().currentUser ? firebase.auth().currentUser.uid : null),
    async create(seed, host, name) {
      const owner = await me();
      const id = randId(10);
      await rooms.doc(id).set({ seed, host: host || '', name, owner, at: firebase.firestore.FieldValue.serverTimestamp(), v: 3 });
      return id;
    },
    async rename(id, name) {
      await me();
      await rooms.doc(id).update({ name });
    },
    async remove(id) {
      await me();
      await rooms.doc(id).delete();
    },
    async get(id) {
      const d = await rooms.doc(id).get();
      if (!d.exists) return null;
      const x = d.data();
      if (x.v !== 3) return null; // 예전 시험용 방
      const at = x.at && x.at.toMillis ? x.at.toMillis() : Date.now();
      return { id, seed: x.seed, host: x.host || '', name: x.name || '', owner: x.owner || '', at };
    },
    async players(id, mode, season) {
      const snap = await boardOf(id, mode, season).orderBy('score', dir(mode)).limit(200).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    // 이 방에서 그 닉네임을 쓰는 기기 (없으면 null)
    async nameOwner(id, name) {
      const d = await rooms.doc(id).collection('names').doc(roomKey(name)).get();
      return d.exists ? d.data().pid : null;
    },
    // 이 방·회차·게임에서 내 줄 (없으면 null)
    async myDoc(id, mode, season, pid) {
      const d = await boardOf(id, mode, season).doc(pid).get();
      return d.exists ? d.data() : null;
    },
    // 닉네임 바꾸기: 새 닉네임을 찜하고(처음이면), 이번 회차 내 줄들의 이름만 바꿔요 (기록은 그대로)
    async renameMe(id, season, pid, name, first, docs) {
      const b = db.batch();
      if (first) b.set(rooms.doc(id).collection('names').doc(roomKey(name)), { pid });
      for (const { mode, old } of docs) {
        const doc = { name, score: old.score, at: firebase.firestore.FieldValue.serverTimestamp(), v: 3 };
        if (old.country) doc.country = old.country;
        b.set(boardOf(id, mode, season).doc(pid), doc);
      }
      await b.commit();
    },
    // 기록 남기기: 처음이면 닉네임도 같이 찜해요 (한 번에 저장)
    async save(id, mode, season, pid, name, score, country, first) {
      const doc = { name, score, at: firebase.firestore.FieldValue.serverTimestamp(), v: 3 };
      if (country) doc.country = country;
      const b = db.batch();
      if (first) b.set(rooms.doc(id).collection('names').doc(roomKey(name)), { pid });
      b.set(boardOf(id, mode, season).doc(pid), doc);
      await b.commit();
    },
  };

  window.dispatchEvent(new Event('board-ready'));
})();
