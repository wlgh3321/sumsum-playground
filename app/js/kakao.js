/*
 * 카카오톡으로 바로 공유하기 (한국어 화면에서만)
 * - KEY에 카카오 개발자 사이트의 "JavaScript 키"를 넣으면 켜져요. 비어 있으면 예전처럼 휴대폰 공유 창이 떠요.
 * - 결과 공유: 점수 문구 + 사이트 링크 카드를 카톡으로 보내요.
 * - 이미지 자랑: 결과 화면이 뜨면 자랑 이미지를 카카오에 미리 올려 두고, 버튼을 누르면 그 이미지로 카톡 카드를 보내요.
 */
const KakaoShare = (() => {
  const KEY = '13ca3b1f9c7700a82d68e2f3d7c156aa'; // 카카오 JavaScript 키 (sumsum.studiojhl.com 에서만 작동)
  const SDK = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
  const SITE = 'https://sumsum.studiojhl.com/';
  const OG = 'https://sumsum.studiojhl.com/og.png?v=4';

  let loading = null;
  let imgUrl = null;   // 미리 올려 둔 자랑 이미지 주소
  let imgFor = null;   // 어떤 파일을 올렸는지

  // 앱(아이폰·안드로이드 설치본)에서는 카카오 웹 공유가 안 돼요 → 휴대폰 공유 창을 써요
  const isNative = () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  const on = () => !!KEY && !isNative() && typeof LANG !== 'undefined' && LANG === 'ko';

  function load() {
    if (!KEY) return Promise.reject(new Error('no key'));
    if (loading) return loading;
    loading = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = SDK;
      s.crossOrigin = 'anonymous';
      s.onload = () => {
        try {
          if (!window.Kakao.isInitialized()) window.Kakao.init(KEY);
          res(window.Kakao);
        } catch (e) { rej(e); }
      };
      s.onerror = rej;
      document.head.appendChild(s);
    });
    loading.catch(() => { loading = null; });
    return loading;
  }

  // 결과 화면이 뜨면 불러요: SDK를 미리 받고, 자랑 이미지도 미리 올려 둬요
  async function prepare(file) {
    if (!on()) return;
    try {
      const K = await load();
      if (!file || file === imgFor) return;
      imgFor = file;
      imgUrl = null;
      const r = await K.Share.uploadImage({ file: [file] });
      if (imgFor === file) imgUrl = r.infos.original.url;
    } catch (e) { /* 실패하면 예전 공유 방식으로 */ }
  }

  function ready() { return on() && !!window.Kakao && window.Kakao.isInitialized && window.Kakao.isInitialized(); }

  // 점수 문구 카드
  function sendText({ title, desc }) {
    if (!ready()) return false;
    try {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title, description: desc, imageUrl: OG, imageWidth: 1200, imageHeight: 630,
          link: { mobileWebUrl: SITE, webUrl: SITE },
        },
        buttons: [{ title: '나도 도전하기', link: { mobileWebUrl: SITE, webUrl: SITE } }],
      });
      return true;
    } catch (e) { return false; }
  }

  // 자랑 이미지 카드 (이미지를 아직 못 올렸으면 false → 예전 방식)
  function sendImage({ title, desc }) {
    if (!ready() || !imgUrl) return false;
    try {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title, description: desc, imageUrl: imgUrl, imageWidth: 1080, imageHeight: 1350,
          link: { mobileWebUrl: SITE, webUrl: SITE },
        },
        buttons: [{ title: '나도 도전하기', link: { mobileWebUrl: SITE, webUrl: SITE } }],
      });
      return true;
    } catch (e) { return false; }
  }

  return { prepare, sendText, sendImage, on };
})();
