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
  const P = C.Plugins || {};
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

  /* ---------- 상태 표시줄·시작 화면 ---------- */
  if (P.StatusBar) buzz(() => P.StatusBar.setStyle({ style: 'DARK' }));
  if (P.SplashScreen) window.addEventListener('load', () => setTimeout(() => buzz(() => P.SplashScreen.hide()), 150));
})();
