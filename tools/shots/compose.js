// 스토어 스크린샷 합성: 1080x1920 (9:16), 제목 + 휴대폰 화면
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const HERE = __dirname;
const OUT = path.join(HERE, 'out');
fs.mkdirSync(OUT, { recursive: true });

const SHOTS = [
  { raw: 'home',    ko: ['사칙연산을', '오락실 게임처럼!', '게임 6가지 · 회원가입 없이 바로'],            en: ['Math, the', 'arcade way!', '6 games · No sign-up needed'] },
  { raw: 'room',    ko: ['가족·친구끼리', '그룹 경쟁전!', '링크 하나로 우리끼리 순위 겨루기'],           en: ['Group', 'Challenge!', 'Share a link, rank just your crew'] },
  { raw: 'fall',    ko: ['떨어지는 문제를', '막아라!', '바닥에 닿기 전에 정답을 입력해요'],             en: ['Stop the', 'falling problems!', 'Answer before they hit the floor'] },
  { raw: 'balloon', ko: ['정답 풍선을', '팡팡!', '보자마자 터뜨리는 순발력 게임'],                     en: ['Pop the', 'right balloon!', 'A quick-reflex math game'] },
  { raw: 'ranks2',  ko: ['명예의 전당', 'TOP 20에 도전!', '모두 같은 조건으로 겨루는 랭킹전'],          en: ['Make the', 'Hall of Fame!', 'Top 20 · Same rules for everyone'] },
  { raw: 'records', ko: ['배지 24개를', '모아 보세요!', '하트 보너스 · 황금 블록 테마'],   en: ['Collect', 'all 24 badges!', 'Bonus hearts and a golden theme'] },
];

const galmuri = path.join(HERE, 'node_modules/galmuri/dist');
const font = f => 'data:font/woff2;base64,' + fs.readFileSync(path.join(galmuri, f)).toString('base64');

const html = (lang, s, img) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: G; src: url(${font('Galmuri11-Bold.woff2')}); font-weight: 700; }
@font-face { font-family: G; src: url(${font('Galmuri11.woff2')}); font-weight: 400; }
* { margin: 0; box-sizing: border-box; }
body { width: 1080px; height: 1920px; overflow: hidden; background: #0f0b1f;
  background-image: linear-gradient(rgba(110,90,220,.16) 2px, transparent 2px), linear-gradient(90deg, rgba(110,90,220,.16) 2px, transparent 2px);
  background-size: 85px 85px; background-position: -18px -2px; font-family: G, sans-serif; position: relative; }
.head { position: absolute; top: 96px; left: 0; right: 0; text-align: center; }
h1 { font-weight: 700; font-size: ${lang === 'ko' ? 104 : 96}px; line-height: 1.12; letter-spacing: ${lang === 'ko' ? 2 : 0}px;
  text-shadow: -5px -5px 0 #4de8ff, 6px 6px 0 #ff4fa3; -webkit-font-smoothing: none; }
h1 .a { color: #fff; display: block; } h1 .b { color: #ffe14d; display: block; }
p { margin-top: 34px; color: #b9b0ff; font-size: 48px; font-weight: 400; }
.phone { position: absolute; left: 222px; top: 487px; width: 636px; height: 1350px; border: 12px solid #6a4dff;
  background: #0b0818; box-shadow: 0 0 60px rgba(106,77,255,.55), 0 0 140px rgba(106,77,255,.25); overflow: hidden; }
.phone img { display: block; width: 612px; height: auto; }
</style></head><body>
<div class="head"><h1><span class="a">${s[lang][0]}</span><span class="b">${s[lang][1]}</span></h1><p>${s[lang][2]}</p></div>
<div class="phone"><img src="${img}"></div>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  for (const lang of ['ko', 'en']) {
    for (let i = 0; i < SHOTS.length; i++) {
      const s = SHOTS[i];
      const img = 'data:image/png;base64,' + fs.readFileSync(path.join(HERE, `raw-${lang}`, s.raw + '.png')).toString('base64');
      await page.setContent(html(lang, s, img));
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(200);
      await page.screenshot({ path: path.join(OUT, `play-${lang}-${i + 1}.png`) });
      console.log('made', lang, i + 1);
    }
  }
  await browser.close();
})();
