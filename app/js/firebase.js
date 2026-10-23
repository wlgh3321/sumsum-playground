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
    async players(mode, n = 500) {
      const snap = await playersOf(mode).orderBy('score', dir(mode)).limit(n).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async save(mode, pid, name, score) {
      await playersOf(mode).doc(pid).set({
        name, score, at: firebase.firestore.FieldValue.serverTimestamp(), v: 2,
      });
      return pid;
    },
    async top(mode, n = 10) {
      const snap = await scoresOf(mode).orderBy('score', dir(mode)).limit(n).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async submit(mode, name, score) {
      const ref = await scoresOf(mode).add({
        name, score, at: firebase.firestore.FieldValue.serverTimestamp(), v: 1,
      });
      return ref.id;
    },
  };
  window.dispatchEvent(new Event('board-ready'));
})();
