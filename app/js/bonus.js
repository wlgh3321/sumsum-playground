/*
 * 보너스 (연습·랭킹전 모두)
 * - 배지 3개: 하트 +½ · 배지 6개: 하트 +1 · 7일 연속 출석한 날: 하트 +½
 * - 시간 게임(1분 도전·참 거짓·시간 버티기)은 하트 반 칸 = +3초로 바꿔 줘요. 60문제는 보너스 없음.
 * - 광고 보고 하트 +1 (판마다 한 번), 게임 오버 때 광고 보고 한 번 이어하기.
 * - "광고 없애기"를 산 사람은 광고 없이 바로 받아요.
 * - 배지 12개를 다 모으면 황금 블록 테마.
 * 광고·결제는 앱(네이티브)에서 window.SumsumNative 로 연결해요. 웹에서는 광고 버튼이 숨어요.
 */
const Bonus = (() => {
  const SEC_PER_UNIT = 3;
  const GOLD_KEY = 'sumsum.gold';
  const NOADS_KEY = 'sumsum.noads';
  const N = () => window.SumsumNative || null;

  const got = () => Object.keys(Stats.data().got).length;
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  const streakToday = () => { const s = Stats.data(); return s.days >= 7 && s.lastDay === today(); };

  // 지금 받는 보너스 목록 (반 칸 단위)
  function parts() {
    const list = [];
    const b = got();
    if (b >= 6) list.push({ key: 'bonB6', u: 2 });
    else if (b >= 3) list.push({ key: 'bonB3', u: 1 });
    if (streakToday()) list.push({ key: 'bonDays', u: 1 });
    return list;
  }
  const units = () => parts().reduce((a, p) => a + p.u, 0);

  // 이 게임에 보너스가 붙는지: 하트 게임 / 시간 게임 / 없음
  const kindOf = id => (id === 'fall' || id === 'balloon' ? 'heart' : id === 'race' ? null : 'time');

  // 반 칸 단위를 글자로: 1 → ♥+½, 2 → ♥+1, 3 → ♥+1½ / 시간 게임은 +3초
  function label(id, u) {
    if (kindOf(id) === 'time') return `+${u * SEC_PER_UNIT}${t('secUnit')}`;
    const whole = Math.floor(u / 2);
    return `♥+${whole || ''}${u % 2 ? '½' : ''}`;
  }

  // 광고 없애기 (앱에서 구매하면 SumsumNative.noAds() 가 true)
  function noAds() {
    try { if (N() && N().noAds && N().noAds()) return true; } catch (e) {}
    try { return localStorage.getItem(NOADS_KEY) === '1'; } catch (e) { return false; }
  }
  function adReady() {
    try { return !!(N() && N().rewardReady && N().rewardReady()); } catch (e) { return false; }
  }
  const canReward = () => noAds() || adReady();
  // 보상 받기: 광고 없애기를 샀으면 바로, 아니면 보상형 광고를 끝까지 보면 true
  // times: 광고를 몇 개 이어서 봐야 하는지 (두 번째 이어하기는 2개). 하나라도 끝까지 안 보면 false
  async function reward(times = 1) {
    if (noAds()) return true;
    markRewarded();
    for (let i = 0; i < times; i++) {
      if (!adReady()) return false;
      try { if (!(await N().showReward())) return false; } catch (e) { return false; }
    }
    return true;
  }

  // 황금 블록
  const goldUnlocked = () => got() >= Stats.BADGES.length;
  function goldOn() {
    if (!goldUnlocked()) return false;
    try { return localStorage.getItem(GOLD_KEY) !== '0'; } catch (e) { return true; }
  }
  function setGold(on) {
    try { localStorage.setItem(GOLD_KEY, on ? '1' : '0'); } catch (e) {}
    applyGold();
  }
  function applyGold() { document.documentElement.classList.toggle('gold', goldOn()); }

  /* ---------- 전면 광고 (게임 끝나고 가끔) ----------
     결과 화면에서 "다시 하기"·"게임 고르기"를 누를 때만. 숫자는 Firebase config/ads 문서로 앱 업데이트 없이 바꿀 수 있어요. */
  const AD_KEY = 'sumsum.ads.v1';
  const rules = { every: 3, gapSec: 180, grace: 3 }; // 3판에 1번, 3분 간격, 처음 3판은 안 띄움
  let adState = { since: 0, lastAt: 0 };
  try { adState = Object.assign(adState, JSON.parse(localStorage.getItem(AD_KEY) || '{}')); } catch (e) {}
  const saveAd = () => { try { localStorage.setItem(AD_KEY, JSON.stringify(adState)); } catch (e) {} };
  let rewardedThisGame = false;
  // 원격 설정 불러오기 (실패하면 기본값)
  function loadAdRules() {
    try {
      if (window.Board && Board.config) Board.config('ads').then(c => {
        if (!c) return;
        ['every', 'gapSec', 'grace'].forEach(k => { if (typeof c[k] === 'number' && c[k] >= 0) rules[k] = c[k]; });
      }).catch(() => {});
    } catch (e) {}
  }
  window.addEventListener('board-ready', loadAdRules);
  setTimeout(loadAdRules, 3000);

  // 한 판이 끝나면 (결과 화면) 불러요
  function gameDone() { adState.since++; saveAd(); }
  // 보상형 광고를 본 판에는 전면 광고를 쉬어요
  function markRewarded() { rewardedThisGame = true; }
  function newGame() { rewardedThisGame = false; }

  // 결과 화면에서 다음으로 넘어갈 때: 조건이 맞으면 전면 광고를 보여 주고, 끝나면 넘어가요
  async function maybeInterstitial() {
    const n = N();
    if (noAds() || !n || !n.interReady || !n.interReady()) return;
    const plays = Stats.data().plays;
    const now = Date.now();
    if (rewardedThisGame) return;
    if (plays <= rules.grace) return;
    if (adState.since < rules.every) return;
    if (now - adState.lastAt < rules.gapSec * 1000) return;
    try {
      if (typeof Music !== 'undefined' && Music.stop && Music.isWanted && Music.isWanted()) { /* 광고 중엔 음악이 멈춰요 (광고가 끝나면 다시) */ }
      const shown = await n.showInterstitial();
      if (shown) { adState.since = 0; adState.lastAt = Date.now(); saveAd(); }
    } catch (e) {}
  }

  return { parts, units, kindOf, label, SEC_PER_UNIT, noAds, adReady, canReward, reward, goldUnlocked, goldOn, setGold, applyGold,
    gameDone, markRewarded, newGame, maybeInterstitial };
})();
