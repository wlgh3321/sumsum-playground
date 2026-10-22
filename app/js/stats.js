/*
 * 기록실: 내 플레이 기록과 배지
 * 이 기기(localStorage)에만 저장해요. 순위표(명예의 전당)와는 따로예요.
 */
const Stats = (() => {
  const KEY = 'sumsum.stats.v1';
  const MODES = ['fall', 'minute', 'race', 'balloon', 'beat', 'tf'];
  // 배지: id, 이름 키, 설명 키, 지금 몇까지 했는지(cur), 목표(goal)
  const BADGES = [
    { id: 'first', name: 'bFirst', desc: 'bFirstD', ico: 'star', cur: s => s.plays, goal: 1 },
    { id: 'all6', name: 'bAll6', desc: 'bAll6D', ico: 'games', cur: s => MODES.filter(m => s.perMode[m]).length, goal: 6 },
    { id: 'p10', name: 'bP10', desc: 'bP10D', ico: 'games', cur: s => s.plays, goal: 10 },
    { id: 'p50', name: 'bP50', desc: 'bP50D', ico: 'trophy', cur: s => s.plays, goal: 50 },
    { id: 'c100', name: 'bC100', desc: 'bC100D', ico: 'check', cur: s => s.correct, goal: 100 },
    { id: 'c1000', name: 'bC1000', desc: 'bC1000D', ico: 'check', cur: s => s.correct, goal: 1000 },
    { id: 's20', name: 'bS20', desc: 'bS20D', ico: 'fire', cur: s => s.maxStreak, goal: 20 },
    { id: 's50', name: 'bS50', desc: 'bS50D', ico: 'fire', cur: s => s.maxStreak, goal: 50 },
    { id: 'perfect', name: 'bPerfect', desc: 'bPerfectD', ico: 'star', cur: s => s.perfect, goal: 1 },
    { id: 'ranked', name: 'bRanked', desc: 'bRankedD', ico: 'trophy', cur: s => s.ranked, goal: 1 },
    { id: 'd3', name: 'bD3', desc: 'bD3D', ico: 'calendar', cur: s => s.bestDays, goal: 3 },
    { id: 'd7', name: 'bD7', desc: 'bD7D', ico: 'calendar', cur: s => s.bestDays, goal: 7 },
  ];

  function blank() {
    return { plays: 0, perMode: {}, correct: 0, maxStreak: 0, perfect: 0, ranked: 0, lastDay: '', days: 0, bestDays: 0, got: {} };
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

  return { visit, record, data: () => S, BADGES, MODES };
})();
