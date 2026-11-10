/*
 * 기록실: 내 플레이 기록과 배지
 * 이 기기(localStorage)에만 저장해요. 순위표(명예의 전당)와는 따로예요.
 */
const Stats = (() => {
  const KEY = 'sumsum.stats.v1';
  const MODES = ['fall', 'minute', 'race', 'balloon', 'beat', 'tf'];
  // 배지: id, 이름 키, 설명 키, 지금 몇까지 했는지(cur), 목표(goal)
  // 24개: 쉬운 것부터 아주 어려운 것까지. 하트 보너스는 8개·16개부터 (bonus.js)
  const BADGES = [
    { id: 'first', name: 'bFirst', desc: 'bFirstD', ico: 'star', cur: s => s.plays, goal: 1 },
    { id: 'all6', name: 'bAll6', desc: 'bAll6D', ico: 'games', cur: s => MODES.filter(m => s.perMode[m]).length, goal: 6 },
    { id: 'p10', name: 'bP10', desc: 'bP10D', ico: 'games', cur: s => s.plays, goal: 10 },
    { id: 'p50', name: 'bP50', desc: 'bP50D', ico: 'trophy', cur: s => s.plays, goal: 50 },
    { id: 'p100', name: 'bP100', desc: 'bP100D', ico: 'trophy', cur: s => s.plays, goal: 100 },
    { id: 'p300', name: 'bP300', desc: 'bP300D', ico: 'trophy', cur: s => s.plays, goal: 300 },
    { id: 'c100', name: 'bC100', desc: 'bC100D', ico: 'check', cur: s => s.correct, goal: 100 },
    { id: 'c1000', name: 'bC1000', desc: 'bC1000D', ico: 'check', cur: s => s.correct, goal: 1000 },
    { id: 'c5000', name: 'bC5000', desc: 'bC5000D', ico: 'check', cur: s => s.correct, goal: 5000 },
    { id: 'c20000', name: 'bC20000', desc: 'bC20000D', ico: 'check', cur: s => s.correct, goal: 20000 },
    { id: 's20', name: 'bS20', desc: 'bS20D', ico: 'fire', cur: s => s.maxStreak, goal: 20 },
    { id: 's50', name: 'bS50', desc: 'bS50D', ico: 'fire', cur: s => s.maxStreak, goal: 50 },
    { id: 's100', name: 'bS100', desc: 'bS100D', ico: 'fire', cur: s => s.maxStreak, goal: 100 },
    { id: 'perfect', name: 'bPerfect', desc: 'bPerfectD', ico: 'star', cur: s => s.perfect, goal: 1 },
    { id: 'perfect10', name: 'bPerfect10', desc: 'bPerfect10D', ico: 'star', cur: s => s.perfect, goal: 10 },
    { id: 'ranked', name: 'bRanked', desc: 'bRankedD', ico: 'medal', cur: s => s.ranked, goal: 1 },
    { id: 'ranked10', name: 'bRanked10', desc: 'bRanked10D', ico: 'medal', cur: s => s.ranked, goal: 10 },
    { id: 'ranked50', name: 'bRanked50', desc: 'bRanked50D', ico: 'medal', cur: s => s.ranked, goal: 50 },
    { id: 'd3', name: 'bD3', desc: 'bD3D', ico: 'calendar', cur: s => s.bestDays, goal: 3 },
    { id: 'd7', name: 'bD7', desc: 'bD7D', ico: 'calendar', cur: s => s.bestDays, goal: 7 },
    { id: 'd14', name: 'bD14', desc: 'bD14D', ico: 'calendar', cur: s => s.bestDays, goal: 14 },
    { id: 'd30', name: 'bD30', desc: 'bD30D', ico: 'calendar', cur: s => s.bestDays, goal: 30 },
    { id: 'room', name: 'bRoom', desc: 'bRoomD', ico: 'send', cur: s => s.roomPlays, goal: 1 },
    { id: 'roomWin', name: 'bRoomWin', desc: 'bRoomWinD', ico: 'trophy', cur: s => s.roomWins, goal: 1 },
  ];

  function blank() {
    return { plays: 0, perMode: {}, correct: 0, maxStreak: 0, perfect: 0, ranked: 0, lastDay: '', days: 0, bestDays: 0, roomPlays: 0, roomWins: 0, got: {} };
  }

  function load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    const b = blank();
    if (!s || typeof s !== 'object') return b;
    for (const k of Object.keys(b)) if (typeof s[k] === typeof b[k]) b[k] = s[k];
    return b;
  }
  let S = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
  }

  const dayKey = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

  // 새로 딴 배지 목록을 돌려줘요.
  function unlock() {
    const fresh = [];
    for (const b of BADGES) {
      if (!S.got[b.id] && b.cur(S) >= b.goal) {
        S.got[b.id] = Date.now();
        fresh.push(b);
      }
    }
    return fresh;
  }

  // 들어올 때마다: 오늘 처음이면 연속 출석을 세요.
  function visit() {
    const now = new Date();
    const today = dayKey(now);
    if (S.lastDay !== today) {
      const y = new Date(now); y.setDate(now.getDate() - 1);
      S.days = S.lastDay === dayKey(y) ? S.days + 1 : 1;
      S.lastDay = today;
      S.bestDays = Math.max(S.bestDays, S.days);
    }
    const fresh = unlock();
    save();
    return fresh;
  }

  // 한 판이 끝났을 때 (그만한 판도 플레이 수와 정답 수는 세요)
  function record(r) {
    S.plays++;
    S.perMode[r.mode] = (S.perMode[r.mode] || 0) + 1;
    S.correct += r.correct || 0;
    S.maxStreak = Math.max(S.maxStreak, r.maxStreak || 0);
    const done = r.badge && r.badge.kind !== 'quit';
    if (done && (r.correct || 0) >= 20 && (r.wrong || 0) === 0) S.perfect++;
    if (done && r.settings && r.settings.ranked) S.ranked++;
    const fresh = unlock();
    save();
    return fresh;
  }

  // 그룹 경쟁전에 기록을 남겼을 때 (place: 그 방에서 몇 위)
  function room(place) {
    S.roomPlays++;
    if (place === 1) S.roomWins++;
    const fresh = unlock();
    save();
    return fresh;
  }

  return { visit, record, room, data: () => S, BADGES, MODES };
})();
