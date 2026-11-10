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

  // 같은 닉네임이면 한 사람으로 봐요 (대소문자·띄어쓰기 무시)
  const nameKey = name => String(name || '').toLowerCase().replace(/\s+/g, '');

  window.Board = {
    nameKey,
    // 닉네임마다 가장 좋은 기록 한 줄만 (앱 명예의 전당처럼)
    // 위에서부터 30개씩 읽으면서, 서로 다른 닉네임 n명이 모일 때까지 더 읽어요.
    async top(mode, n = 10) {
      const PAGE = 30;
      const seen = new Set();
      const rows = [];
      let q = scoresOf(mode).orderBy('score', dir(mode)).limit(PAGE);
      for (let page = 0; page < 6 && rows.length < n; page++) {
        const snap = await q.get();
        for (const d of snap.docs) {
          const r = { id: d.id, ...d.data() };
          const k = nameKey(r.name);
          if (seen.has(k)) continue; // 같은 사람의 더 낮은 기록은 숨겨요
          seen.add(k);
          rows.push(r);
          if (rows.length >= n) break;
        }
        if (snap.docs.length < PAGE) break;
        q = scoresOf(mode).orderBy('score', dir(mode)).startAfter(snap.docs[snap.docs.length - 1]).limit(PAGE);
      }
      return rows;
    },
    async submit(mode, name, score, country) {
      const doc = { name, score, at: firebase.firestore.FieldValue.serverTimestamp(), v: 1 };
      if (country) doc.country = country;
      const ref = await scoresOf(mode).add(doc);
      return ref.id;
    },
  };

  // 단톡 경쟁전 방 (rooms/{방}): 7일 동안 링크 받은 사람끼리만 순위를 겨뤄요
  const rooms = db.collection('rooms');
  const roomKey = name => String(name || '').toLowerCase().replace(/ /g, ''); // 보안 규칙의 닉네임 열쇠와 똑같이
  const randId = n => {
    const A = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let s = '';
    const r = crypto.getRandomValues(new Uint32Array(n));
    for (let i = 0; i < n; i++) s += A[r[i] % A.length];
    return s;
  };
  window.Rooms = {
    WEEK: 7 * 24 * 3600 * 1000,
    newId: randId,
    async create(mode, seed, host) {
      const id = randId(10);
      await rooms.doc(id).set({ mode, seed, host: host || '', at: firebase.firestore.FieldValue.serverTimestamp(), v: 1 });
      return id;
    },
    async get(id) {
      const d = await rooms.doc(id).get();
      if (!d.exists) return null;
      const x = d.data();
      const at = x.at && x.at.toMillis ? x.at.toMillis() : Date.now();
      return { id, mode: x.mode, seed: x.seed, host: x.host || '', at, exp: at + this.WEEK };
    },
    async players(id, mode) {
      const snap = await rooms.doc(id).collection('players').orderBy('score', dir(mode)).limit(200).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    // 이 방에서 그 닉네임을 쓰는 기기 (없으면 null)
    async nameOwner(id, name) {
      const d = await rooms.doc(id).collection('names').doc(roomKey(name)).get();
      return d.exists ? d.data().pid : null;
    },
    // 기록 남기기: 처음이면 닉네임도 같이 찜해요 (한 번에 저장)
    async save(id, pid, name, score, country, first) {
      const doc = { name, score, at: firebase.firestore.FieldValue.serverTimestamp(), v: 1 };
      if (country) doc.country = country;
      const ref = rooms.doc(id);
      const b = db.batch();
      if (first) b.set(ref.collection('names').doc(roomKey(name)), { pid });
      b.set(ref.collection('players').doc(pid), doc);
      await b.commit();
    },
  };

  window.dispatchEvent(new Event('board-ready'));
})();
