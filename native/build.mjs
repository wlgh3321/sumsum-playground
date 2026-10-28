// 앱에 넣을 파일 만들기: ../app 을 www/ 로 복사하고, 인터넷에서 받던 글꼴·Firebase를 앱 안에 넣어요.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(import.meta.dirname, 'www');
const NM = path.join(import.meta.dirname, 'node_modules');

fs.rmSync(OUT, { recursive: true, force: true });
execFileSync('cp', ['-R', path.join(ROOT, 'app'), OUT]); // (fs.cpSync 는 일부 폴더에서 권한 오류가 나서 cp 를 써요)
for (const f of ['logo-blocks.png', 'favicon.svg', 'favicon-32.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png']) {
  fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));
}

// 글꼴: fontsource 의 css 와 woff2 를 fonts/ 로
const FONTS = path.join(OUT, 'fonts');
fs.mkdirSync(FONTS, { recursive: true });
let css = '';
// 앱에서 실제로 쓰는 글꼴만 (Jua·Gowun Dodum 은 arcade.css 가 Do Hyeon 으로 덮어써서 안 써요)
for (const name of ['do-hyeon', 'press-start-2p']) {
  const dir = path.join(NM, '@fontsource', name);
  let c = fs.readFileSync(path.join(dir, '400.css'), 'utf8');
  c = c.replace(/,\s*url\(\.\/files\/[^)]+\.woff\) format\('woff'\)/g, '');
  for (const m of c.matchAll(/url\(\.\/files\/([^)]+\.woff2)\)/g)) {
    fs.copyFileSync(path.join(dir, 'files', m[1]), path.join(FONTS, m[1]));
  }
  css += c.replace(/url\(\.\/files\//g, 'url(./') + '\n';
}
const GM = path.join(NM, 'galmuri', 'dist');
// 갈무리는 Galmuri11 (보통·굵게) 만 써요 — 나머지 7개는 앱 크기만 키워요
const GM_KEEP = ['Galmuri11.woff2', 'Galmuri11-Bold.woff2'];
for (const f of GM_KEEP) fs.copyFileSync(path.join(GM, f), path.join(FONTS, f));
css += (fs.readFileSync(path.join(GM, 'galmuri.css'), 'utf8').match(/@font-face\s*\{[^}]*\}/g) || [])
  .filter(b => GM_KEEP.some(f => b.includes("/" + f + "'") || b.includes("/" + f + ")") || b.includes('/' + f + '"')))
  .join('\n').replace(/url\((['"]?)\.?\/?([^)'"]+\.woff2)\1\)/g, 'url(./$2)').replace(/,\s*url\([^)]+\.(woff|ttf)['"]?\) format\(["'](woff|truetype)["']\)/g, '');
fs.writeFileSync(path.join(FONTS, 'fonts.css'), css);

// Firebase SDK
const LIB = path.join(OUT, 'lib');
fs.mkdirSync(LIB, { recursive: true });
for (const f of ['firebase-app-compat.js', 'firebase-firestore-compat.js']) {
  fs.copyFileSync(path.join(NM, 'firebase', f), path.join(LIB, f));
}
fs.copyFileSync(path.join(import.meta.dirname, 'src', 'native.js'), path.join(OUT, 'js', 'native.js'));

// index.html 고치기
const idx = path.join(OUT, 'index.html');
let h = fs.readFileSync(idx, 'utf8');
const rep = (a, b) => { const hit = a instanceof RegExp ? new RegExp(a.source).test(h) : h.includes(a); if (!hit) throw new Error('not found: ' + a); h = h.replace(a, b); };
rep(/<link rel="preconnect"[^>]*>\s*/g, '');
rep(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/, '<link rel="stylesheet" href="fonts/fonts.css">');
rep(/<link rel="stylesheet" href="https:\/\/cdn\.jsdelivr\.net\/npm\/galmuri[^>]*>\s*/, '');
rep('https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js', 'lib/firebase-app-compat.js');
rep('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore-compat.js', 'lib/firebase-firestore-compat.js');
rep(/<link rel="manifest"[^>]*>\s*/, '');
// 서비스 워커·방문자 수 스크립트는 앱에서 빼요
h = h.replace(/<!-- 오프라인에서도[\s\S]*?<\/script>\s*/, '');
h = h.replace(/<!-- 방문자 수[\s\S]*?<\/script>\s*/, '');
// 소개·개인정보 링크는 웹사이트로 (앱 밖 브라우저로 열려요)
h = h.replace(/href="\/(about|privacy)\.html"/g, 'href="https://sumsum.studiojhl.com/$1.html"');
// 앱 기능 스크립트는 app.js 바로 뒤에
h = h.replace(/(<script src="js\/app\.js[^"]*"><\/script>)/, '$1\n<script src="js/native.js"></script>');
fs.writeFileSync(idx, h);

const left = h.match(/https:\/\/(fonts|cdn|www\.gstatic)[^"']*/g);
console.log('www 준비 완료', left ? '(남은 외부 주소: ' + left.join(', ') + ')' : '(외부 글꼴·SDK 없음)');
