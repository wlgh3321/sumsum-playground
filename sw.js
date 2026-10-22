/*
 * 셈셈 놀이터 오프라인 도우미 (서비스 워커)
 * - 페이지(HTML)는 인터넷이 되면 항상 새로 받아요. 안 될 때만 저장해 둔 걸 보여 줘요.
 * - css·js·그림은 주소에 버전(?v=…)이 붙어 있어서, 한 번 받은 건 저장해 두고 바로 써요.
 * - 글꼴과 Firebase 스크립트도 저장해 둬서 비행기 모드에서도 게임은 돼요. (순위표만 안 떠요)
 * 새 버전을 올릴 때는 아래 VERSION만 바꾸면 예전 저장본이 지워져요.
 */
const VERSION = 'sumsum-v8';
const CORE = [
  '/',
  '/en/',
  '/app/',
  '/about.html',
  '/privacy.html',
  '/site.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.svg',
];
const CDN = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net', 'www.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Firestore(순위표) 같은 실시간 통신은 건드리지 않아요.
  if (url.hostname.endsWith('googleapis.com') && url.hostname !== 'fonts.googleapis.com') return;

  // 페이지: 인터넷 먼저, 안 되면 저장본
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(url.pathname === '/' ? '/' : req, copy));
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('/')))
    );
    return;
  }

  const same = url.origin === self.location.origin;
  if (same || CDN.includes(url.hostname)) {
    // 저장본이 있으면 바로 쓰고, 없으면 받아서 저장해요.
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(req, copy));
        }
        return res;
      }))
    );
  }
});
