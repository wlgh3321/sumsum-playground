// 스크린샷용 가짜 순위표 (실제 Firebase 대신)
(() => {
  const LANG = (localStorage.getItem('sumsum.lang.v1') || '"ko"').replace(/"/g, '');
  const KO = ['숫자왕', '번개손', '암산고수', '계산머신', '구구단왕', '민트초코', '수학요정', '별빛소년', '달토끼', '초코칩', '곱셈요정', '다람쥐', '콩순이', '햇살가득', '귤까먹자', '연산천재', '토끼발', '하늘고래', '바닐라', '꼬마마법사', '두부', '보리차', '감자칩', '솜사탕'];
  const EN = ['MathKing', 'Flash', 'Brainy', 'NumberNinja', 'Ace', 'Mint', 'Pixel', 'Comet', 'Bunny', 'Choco', 'Maple', 'Squirrel', 'Lucky', 'Sunny', 'Pepper', 'Genius', 'Bolt', 'Whale', 'Vanilla', 'Wizard', 'Tofu', 'Barley', 'Chip', 'Cotton'];
  const names = LANG === 'en' ? EN : KO;
  const base = { fall: 1180, minute: 64, race: 71.4, balloon: 960, beat: 1520, tf: 58 };
  const step = { fall: 47, minute: 2, race: -1.7, balloon: 38, beat: 61, tf: 2 };
  const rows = mode => names.map((n, i) => ({
    id: 'p' + i, name: n,
    score: mode === 'race' ? Math.round((base.race + i * 1.9 + (i % 3) * 0.4) * 10) / 10 : Math.round(base[mode] - i * step[mode] - (i % 4) * (step[mode] / 5)),
    country: i % 5 === 3 ? 'US' : 'KR',
  }));
  window.Board = {
    async config() { return null; },
    async players(mode) { return rows(mode); },
    async mine() { return null; },
    async save() { return 'me'; },
    async top(mode, n = 10) { return rows(mode).slice(0, n); },
    async submit() { return 'me'; },
  };
  const ROOM_NAMES = LANG === 'en'
    ? ['Mom', 'Dad', 'Grandpa', 'Mina', 'Junho', 'Aunt Sue']
    : ['엄마', '아빠', '할아버지', '민아', '준호', '이모'];
  const roomRows = mode => ROOM_NAMES.map((n, i) => ({
    id: 'r' + i, name: n, country: 'KR',
    score: mode === 'race' ? Math.round((68.2 + i * 4.3) * 10) / 10 : Math.round(base[mode] * 0.8 - i * step[mode] * 2.2),
  }));
  window.Rooms = {
    me: async () => 'uid-me',
    myUid: () => 'uid-me',
    async create() { return 'demoRoom01'; },
    async rename() {}, async remove() {},
    async get(id) {
      return { id, seed: 12345, host: ROOM_NAMES[0], name: LANG === 'en' ? 'Family Math Night' : '우리 가족 수학왕', owner: 'uid-me', at: Date.now() - 26 * 3600 * 1000 };
    },
    async players(id, mode) { return roomRows(mode); },
    async nameOwner() { return null; },
    async myDoc() { return null; },
    async renameMe() {}, async save() {},
  };
  window.dispatchEvent(new Event('board-ready'));
})();
