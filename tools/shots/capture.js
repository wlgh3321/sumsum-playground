// 셈셈 앱 화면 캡처 (스토어 스크린샷용)
// 사용: node capture.js <lang ko|en> <outdir>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const REPO = '/home/claude/sumsum-playground';
const HERE = __dirname;
const LANG = process.argv[2] || 'ko';
const OUT = process.argv[3] || path.join(HERE, 'raw-' + LANG);
fs.mkdirSync(OUT, { recursive: true });

const FS = path.join(HERE, 'node_modules/@fontsource');
function fontCss() {
  let css = '';
  for (const pkg of ['do-hyeon', 'press-start-2p', 'jua', 'gowun-dodum']) {
    css += fs.readFileSync(path.join(FS, pkg, 'index.css'), 'utf8').replace(/url\(\.\/files\//g, `url(/__fs/${pkg}/files/`);
  }
  return css;
}
const MIME = { '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.json': 'application/json', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg' };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, locale: LANG === 'en' ? 'en-US' : 'ko-KR', hasTouch: true, isMobile: true });
  await ctx.route('**/*', async route => {
    const u = new URL(route.request().url());
    if (u.hostname === 'app.local') {
      let p = decodeURIComponent(u.pathname);
      let file;
      if (p.startsWith('/__fs/')) file = path.join(FS, p.slice(6));
      else if (p.startsWith('/__galmuri/')) file = path.join(HERE, 'node_modules/galmuri/dist', p.slice(11));
      else if (p.endsWith('/app/js/firebase.js')) file = path.join(HERE, 'stub-firebase.js');
      else { if (p.endsWith('/')) p += 'index.html'; file = path.join(REPO, p); }
      if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
      return route.fulfill({ status: 200, body: fs.readFileSync(file), contentType: MIME[path.extname(file)] || 'application/octet-stream' });
    }
    if (u.hostname === 'fonts.googleapis.com') return route.fulfill({ status: 200, body: fontCss(), contentType: 'text/css' });
    if (u.hostname === 'cdn.jsdelivr.net' && u.pathname.includes('galmuri')) {
      const css = fs.readFileSync(path.join(HERE, 'node_modules/galmuri/dist/galmuri.css'), 'utf8').replace(/url\((['"]?)(?:\.\/)?/g, 'url($1/__galmuri/');
      return route.fulfill({ status: 200, body: css, contentType: 'text/css' });
    }
    if (u.hostname.includes('gstatic.com') && u.pathname.includes('firebase')) return route.fulfill({ status: 200, body: '', contentType: 'application/javascript' });
    return route.abort();
  });

  const day = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const stats = {
    plays: 183, perMode: { fall: 52, minute: 41, race: 23, balloon: 31, beat: 20, tf: 16 }, correct: 6420, maxStreak: 74, perfect: 4, ranked: 37,
    lastDay: day(new Date()), days: 9, bestDays: 12, roomPlays: 14, roomWins: 3,
    got: Object.fromEntries(['first', 'all6', 'p10', 'p50', 'p100', 'c100', 'c1000', 'c5000', 's20', 's50', 'perfect', 'ranked', 'ranked10', 'd3', 'd7', 'room', 'roomWin'].map(k => [k, 1])),
  };
  await ctx.addInitScript(({ LANG, stats }) => {
    try {
      localStorage.setItem('sumsum.lang.v1', JSON.stringify(LANG));
      localStorage.setItem('sumsum.stats.v1', JSON.stringify(stats));
      localStorage.setItem('sumsum:rankName', LANG === 'en' ? 'Jiho' : '지홍이');
      localStorage.setItem('sumsum.pid', 'p4');
      localStorage.setItem('sumsum:rooms', JSON.stringify({ demoRoom01: { name: LANG === 'en' ? 'Family Math Night' : '우리 가족 수학왕', host: LANG === 'en' ? 'Mom' : '엄마', own: true, last: Date.now(), nick: LANG === 'en' ? 'Jiho' : '지홍이' } }));
    } catch (e) {}
    window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', Plugins: {} };
  }, { LANG, stats });

  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('PAGEERR', e.message));
  await page.goto('http://app.local/app/');
  await page.waitForTimeout(2500);
  const shot = async name => { await page.screenshot({ path: path.join(OUT, name + '.png') }); console.log('saved', name); };
  const clickTab = async tab => { await page.click(`.tab[data-tab="${tab}"]`); await page.waitForTimeout(1200); };

  // 인트로 넘기기
  for (let i = 0; i < 3; i++) { if (await page.isVisible('#intro')) { await page.mouse.click(195, 600); await page.waitForTimeout(1500); } }
  const only = (process.argv[4] || 'home,ranks,records,room,fall,balloon,minute').split(',');
  if (only.includes('home')) await shot('home');
  if (only.includes('ranks')) {
    await clickTab('ranks');
    await page.evaluate(() => { const el = document.getElementById('rankTitle'); if (el) el.scrollIntoView({ block: 'start' }); });
    await page.waitForTimeout(600); await shot('ranks2');
    await page.evaluate(() => { const sc = document.getElementById('homeScroll'); if (sc) sc.scrollTop = 0; });
    await page.waitForTimeout(600); await shot('ranks');
  }
  if (only.includes('records')) { await clickTab('records'); await shot('records'); }
  if (only.includes('room')) {
    await page.evaluate(() => Room.open('demoRoom01'));
    await page.waitForTimeout(2500); await shot('room');
    await page.evaluate(() => App.showHome());
    await page.waitForTimeout(800);
  }
  const play = async (mode, wait, name) => {
    await clickTab('games');
    await page.evaluate(m => { const b = [...document.querySelectorAll('#modeGrid [data-mode], #modeGrid [data-id]')].find(x => (x.dataset.mode || x.dataset.id) === m); if (b) b.click(); }, mode);
    await page.waitForTimeout(600);
    await page.evaluate(() => { if (document.getElementById('setup').hidden) document.getElementById('playBtn').click(); });
    await page.waitForTimeout(800);
    await page.evaluate(() => { const r = document.querySelector('#setup [data-play="ranked"]'); if (r) r.click(); });
    await page.waitForTimeout(300);
    await page.evaluate(() => document.getElementById('startBtn').click());
    // 자동으로 몇 문제 맞히기 (점수가 0이 아니게)
    await page.evaluate(({ mode, wait }) => new Promise(done => {
      const calc = s => { s = s.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/=.*$/, '').trim(); try { return Math.round(Function('return ' + s)()); } catch (e) { return null; } };
      const start = Date.now();
      let n = 0;
      const tick = () => {
        if (Date.now() - start > wait - (mode === 'fall' ? 8000 : 300)) return done();
        if (mode === 'balloon' && window.__taps >= 2) { window.__taps = -99; return setTimeout(done, 2600); }
        if (window.__taps < 0) return;
        n++;
        if (mode === 'fall') {
          const cards = [...document.querySelectorAll('#stage .fall-card:not(.pop)')];
          if (cards.length > 1 && n % 2) {
            const v = calc(cards[0].textContent);
            if (v !== null) { for (const d of String(v)) Game.key(d); Game.key('ok'); }
          }
        } else if (mode === 'balloon') {
          const v = calc(document.getElementById('prompt').textContent);
          const b = [...document.querySelectorAll('#bfield .balloon')].find(x => Number(x.textContent) === v && !x.classList.contains('popped'));
          if (b && n % 3 === 0) { b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); window.__taps = (window.__taps || 0) + 1; }
        } else if (mode === 'minute') {
          const v = calc(document.getElementById('prompt').textContent);
          const b = [...document.querySelectorAll('#choices .choice')].find(x => Number(x.dataset.v) === v);
          if (b && n % 2) b.click();
        }
        setTimeout(tick, 700);
      };
      setTimeout(tick, 1500);
    }), { mode, wait });
    if (mode === 'fall') { await page.waitForTimeout(7400); await page.evaluate(() => { const c = [...document.querySelectorAll('#stage .fall-card:not(.pop)')].sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top)[0]; if (!c) return; const s = c.textContent.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-'); const v = Math.round(Function('return ' + s)()); Game.key(String(v)[0]); }); await page.waitForTimeout(150); } else await page.waitForTimeout(100);
    await shot(name);
    await page.goto('http://app.local/app/'); await page.waitForTimeout(2500);
    for (let i = 0; i < 3; i++) { if (await page.isVisible('#intro')) { await page.mouse.click(195, 600); await page.waitForTimeout(1500); } }
  };
  if (only.includes('fall')) await play('fall', 15000, 'fall');
  if (only.includes('balloon')) await play('balloon', 12000, 'balloon');
  if (only.includes('minute')) await play('minute', 5000, 'minute');
  fs.writeFileSync(path.join(OUT, 'modegrid.txt'), await page.evaluate(() => document.getElementById('modeGrid').outerHTML.slice(0, 1500)));
  await browser.close();
})();
