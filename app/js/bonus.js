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
  async function reward() {
    if (noAds()) return true;
    if (!adReady()) return false;
    try { return !!(await N().showReward()); } catch (e) { return false; }
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

  return { parts, units, kindOf, label, SEC_PER_UNIT, noAds, adReady, canReward, reward, goldUnlocked, goldOn, setGold, applyGold };
})();
