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

  // 아이폰 앱은 카카오 공식 SDK(native.js)로 보내요. 안드로이드 앱은 이 웹 공유가 그대로 돼요
  // (https://localhost 를 카카오 JavaScript 키 사이트 도메인에 등록해야 해요).
  const isNative = () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  const isIOSApp = () => isNative() && window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'ios';
  const on = () => !!KEY && !isIOSApp() && typeof LANG !== 'undefined' && LANG === 'ko';
  // 버튼 두 개: '앱으로 도전'(앱이 있으면 앱이 바로 열리고, 없으면 스토어로) + '웹으로 도전'(브라우저에서 바로)
  // exec = 도전장 정보(cn=&cs=&cg=&cz=). 카톡이 앱을 열면서 이걸 그대로 넘겨줘요.
  // 웹사이트에서 보낸 카드는 '도전 받기'(웹)가 먼저예요.
  // ★ 웹(PWA)에서 보낼 때 '앱으로 도전' 버튼: 앱 업데이트가 스토어에 나온 뒤 true 로 (js/kakao.js 와 같이)
  const APP_VS = false;
  // labels = [앱 버튼, 웹 버튼] 글자를 바꿀 때 (그룹 경쟁전: '앱으로 참가', '웹으로 참가')
  const btns = (url, exec, labels) => {
    const link = url || SITE;
    const web = { mobileWebUrl: link, webUrl: link };
    const L = labels || ['앱으로 도전', '웹으로 도전'];
    if (!exec || (!isNative() && !APP_VS)) return [{ title: isNative() ? '웹에서 하기' : (labels ? L[1] : '도전 받기'), link: web }];
    const app = { ...web, androidExecutionParams: exec, iosExecutionParams: exec };
    return isNative()
      ? [{ title: L[0], link: app }, { title: L[1], link: web }]
      : [{ title: labels ? L[1] : '도전 받기', link: web }, { title: L[0], link: app }];
  };

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
  // url을 넘기면 "나도 도전하기"·"웹에서 하기"가 그 주소로 가요 (도전장 링크: 내 점수를 담은 주소)
  function sendText({ title, desc, url, exec, labels }) {
    if (!ready()) return false;
    const link = url || SITE;
    try {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title, description: desc, imageUrl: OG, imageWidth: 1200, imageHeight: 630,
          link: { mobileWebUrl: link, webUrl: link },
        },
        buttons: btns(url, exec, labels),
      });
      return true;
    } catch (e) { return false; }
  }

  // 자랑 이미지 카드 (이미지를 아직 못 올렸으면 false → 예전 방식)
  // url을 넘기면 "나도 도전하기"·"웹에서 하기"가 그 주소로 가요 (도전장 링크: 내 점수를 담은 주소)
  function sendImage({ title, desc, url, exec }) {
    if (!ready() || !imgUrl) return false;
    const link = url || SITE;
    try {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title, description: desc, imageUrl: imgUrl, imageWidth: 1080, imageHeight: 1350,
          link: { mobileWebUrl: link, webUrl: link },
        },
        buttons: btns(url, exec),
      });
      return true;
    } catch (e) { return false; }
  }

  return { prepare, sendText, sendImage, on };
})();
