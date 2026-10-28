/*
 * 앱(아이폰·안드로이드 설치본)에서만 켜지는 기능
 * - 진동(햅틱): 맞힘·틀림·풍선·레벨업·기록·버튼
 * - 공유: 휴대폰 공유 창(이미지·글)
 * - 상태 표시줄: 어두운 배경에 밝은 글자
 * 웹사이트에서는 아무것도 안 해요.
 */
(() => {
  const C = window.Capacitor;
  if (!C || !C.isNativePlatform || !C.isNativePlatform()) return;
  // 앱에 들어 있는 기능(플러그인)을 이름으로 불러와요 (설치 안 된 건 건너뛰어요)
  const P = {};
  for (const name of ['Haptics', 'Share', 'Filesystem', 'SplashScreen', 'StatusBar', 'AdMob', 'NativePurchases']) {
    try { if (C.isPluginAvailable(name)) P[name] = (C.Plugins && C.Plugins[name]) || C.registerPlugin(name); } catch (e) {}
  }
  document.documentElement.classList.add('native', 'native-' + C.getPlatform());

  /* ---------- 공유 (navigator.share 대신 앱 공유 창) ---------- */
  const toB64 = blob => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
  const abort = () => { const e = new Error('canceled'); e.name = 'AbortError'; return e; };
  if (P.Share) {
    navigator.canShare = () => true;
    navigator.share = async (data = {}) => {
      try {
        if (data.files && data.files.length && P.Filesystem) {
          const files = [];
          for (const f of data.files) {
            const w = await P.Filesystem.writeFile({ path: f.name || 'sumsum.png', data: await toB64(f), directory: 'CACHE' });
            files.push(w.uri);
          }
          await P.Share.share({ files });
        } else {
          await P.Share.share({ title: data.title, text: data.text, url: data.url, dialogTitle: data.title });
        }
      } catch (e) {
        if (/cancel/i.test(String(e && (e.message || e)))) throw abort();
        throw e;
      }
    };
  }

  /* ---------- 진동 ---------- */
  const H = P.Haptics;
  const buzz = fn => { try { fn(); } catch (e) {} };
  const hook = (name, fn) => {
    if (typeof Sound === 'undefined' || typeof Sound[name] !== 'function') return;
    const orig = Sound[name];
    Sound[name] = function (...a) { buzz(fn); return orig.apply(this, a); };
  };
  if (H) {
    const light = () => H.impact({ style: 'LIGHT' });
    const medium = () => H.impact({ style: 'MEDIUM' });
    hook('tap', light);
    hook('select', light);
    hook('correct', light);
    hook('pop', light);
    hook('wrong', () => H.notification({ type: 'ERROR' }));
    hook('levelUp', medium);
    hook('combo', light);
    hook('go', medium);
    hook('over', () => H.notification({ type: 'WARNING' }));
    hook('record', () => H.notification({ type: 'SUCCESS' }));
    hook('badge', () => H.notification({ type: 'SUCCESS' }));
  }

  /* ---------- 광고 (AdMob) · 광고 없애기 (앱 내 구입) ----------
     보상형: 하트 +1 / 이어하기.  전면: 게임 끝나고 가끔 (규칙은 app/js/bonus.js).
     개인 맞춤 광고 없이(npa) 보여 줘요 → 추적 허용 팝업이 필요 없어요. */
  const ADS_TEST = true; // ★ 앱스토어에 내기 전에 false 로 (지금은 테스트 광고만)
  const IOS = C.getPlatform() === 'ios';
  const AD = IOS
    ? { reward: 'ca-app-pub-6048734887508367/9403873330', inter: 'ca-app-pub-6048734887508367/6662159922' }
    : { reward: 'ca-app-pub-6048734887508367/9657530916', inter: 'ca-app-pub-6048734887508367/1298152605' };
  const NOADS_ID = 'com.studiojhl.sumsum.noads';
  const OWNED_KEY = 'sumsum.noads.owned';
  const A = P.AdMob;
  const IAP = P.NativePurchases;
  let rewardLoaded = false, interLoaded = false, adsReady = false;
  const owned = () => { try { return localStorage.getItem(OWNED_KEY) === '1'; } catch (e) { return false; } };
  const setOwned = on => { try { localStorage.setItem(OWNED_KEY, on ? '1' : '0'); } catch (e) {} };
  const opts = id => ({ adId: id, isTesting: ADS_TEST, npa: true });
  const loadReward = () => { if (!A || !adsReady || owned()) return; A.prepareRewardVideoAd(opts(AD.reward)).then(() => { rewardLoaded = true; }).catch(() => { rewardLoaded = false; setTimeout(loadReward, 30000); }); };
  const loadInter = () => { if (!A || !adsReady || owned()) return; A.prepareInterstitial(opts(AD.inter)).then(() => { interLoaded = true; }).catch(() => { interLoaded = false; setTimeout(loadInter, 30000); }); };

  async function startAds() {
    if (!A || owned()) return;
    try {
      await A.initialize({ initializeForTesting: ADS_TEST });
      // 유럽 등 동의가 필요한 지역이면 동의 창 (AdMob '개인정보 보호 및 메시지'에서 만든 문구)
      try {
        const info = await A.requestConsentInfo();
        if (info && info.isConsentFormAvailable && info.status === 'REQUIRED') await A.showConsentForm();
      } catch (e) {}
      adsReady = true;
      loadReward();
      loadInter();
    } catch (e) {}
  }

  // 보상형 광고 하나 보기 → 끝까지 봐서 보상을 받았으면 true
  function showReward() {
    return new Promise(resolve => {
      if (!A || !rewardLoaded) { resolve(false); return; }
      rewardLoaded = false;
      let got = false, done = false, subs = [];
      const finish = ok => {
        if (done) return; done = true;
        subs.forEach(h => { try { h.remove(); } catch (e) {} });
        if (typeof Music !== 'undefined' && Music.isWanted && Music.isWanted()) Music.start();
        setTimeout(loadReward, 500);
        resolve(ok);
      };
      Promise.all([
        A.addListener('onRewardedVideoAdReward', () => { got = true; }),
        A.addListener('onRewardedVideoAdDismissed', () => finish(got)),
        A.addListener('onRewardedVideoAdFailedToShow', () => finish(false)),
      ]).then(h => { subs = h; if (done) h.forEach(x => x.remove()); });
      A.showRewardVideoAd().catch(() => finish(false));
    });
  }

  // 전면 광고 (닫히면 끝나요)
  function showInterstitial() {
    return new Promise(resolve => {
      if (!A || !interLoaded || owned()) { resolve(false); return; }
      interLoaded = false;
      let done = false, subs = [];
      const finish = ok => {
        if (done) return; done = true;
        subs.forEach(h => { try { h.remove(); } catch (e) {} });
        if (typeof Music !== 'undefined' && Music.isWanted && Music.isWanted()) Music.start();
        setTimeout(loadInter, 500);
        resolve(ok);
      };
      Promise.all([
        A.addListener('interstitialAdDismissed', () => finish(true)),
        A.addListener('interstitialAdFailedToShow', () => finish(false)),
      ]).then(h => { subs = h; if (done) h.forEach(x => x.remove()); });
      A.showInterstitial().catch(() => finish(false));
      setTimeout(() => finish(false), 90000); // 혹시 닫힘 신호가 안 오면
    });
  }

  // 광고 없애기: 값 불러오기 / 사기 / 복원
  async function noAdsPrice() {
    if (!IAP) return null;
    try {
      const r = await IAP.getProducts({ productIdentifiers: [NOADS_ID], productType: 'inapp' });
      const p = r && r.products && r.products[0];
      return p ? p.priceString : null;
    } catch (e) { return null; }
  }
  async function checkOwned() {
    if (!IAP) return owned();
    try {
      const r = await IAP.getPurchases({ productType: 'inapp' });
      const has = ((r && r.purchases) || []).some(t => t.productIdentifier === NOADS_ID);
      if (has) setOwned(true);
      return has || owned();
    } catch (e) { return owned(); }
  }
  async function buyNoAds() {
    if (!IAP) return false;
    try {
      const t = await IAP.purchaseProduct({ productIdentifier: NOADS_ID, productType: 'inapp', quantity: 1 });
      if (t && (t.productIdentifier === NOADS_ID || t.transactionId)) { setOwned(true); return true; }
    } catch (e) {}
    return checkOwned();
  }
  async function restoreNoAds() {
    if (!IAP) return false;
    try { await IAP.restorePurchases(); } catch (e) {}
    return checkOwned();
  }

  window.SumsumNative = {
    noAds: owned,
    rewardReady: () => !!rewardLoaded,
    showReward,
    interReady: () => !!interLoaded,
    showInterstitial,
    iap: !!IAP,
    noAdsPrice, buyNoAds, restoreNoAds, checkOwned,
  };
  startAds();
  checkOwned().then(has => { if (has && typeof App !== 'undefined' && App.refreshStore) App.refreshStore(); });

  /* ---------- 배경음악: 앱에서는 터치 없이도 바로 시작 ---------- */
  window.addEventListener('load', () => {
    try {
      const st = (typeof Store !== 'undefined' && Store.getSettings && Store.getSettings()) || {};
      if (st.music !== false && typeof Music !== 'undefined') Music.start();
    } catch (e) {}
  });

  /* ---------- 상태 표시줄·시작 화면 ---------- */
  if (P.StatusBar) buzz(() => P.StatusBar.setStyle({ style: 'DARK' }));
  if (P.SplashScreen) window.addEventListener('load', () => setTimeout(() => buzz(() => P.SplashScreen.hide()), 150));
})();
