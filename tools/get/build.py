"""스토어로 보내는 페이지 만들기 (실행: python3 tools/get/build.py)
- /get/      한국어 (앱 받기)
- /get/en/   영어 (점수 공유 링크)
- /join/     영어 (그룹 경쟁전 초대 링크)
아이폰은 App Store로, 안드로이드는 (출시 뒤) Google Play로, 그 밖은 웹 게임으로 보내요.
"""
import os
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
# 스토어에 정식으로 나오면 true 로 바꿔요. 그전에는 웹 게임으로 보내요.
LIVE = "{ ios: true, android: false }"

PAGES = {
    'get/index.html': dict(lang='ko', title='셈셈 놀이터 앱 받기', og_title='셈셈 놀이터 앱 받기',
                           og_desc='사칙연산을 오락실 게임처럼. 무료로 받아서 바로 한 판!', og_img='og.png?v=4',
                           msg='셈셈 놀이터로 이동하는 중…', ios='App Store에서 받기', android='Google Play에서 받기', web='웹에서 바로 하기'),
    'get/en/index.html': dict(lang='en', title='Get SumSum Playground', og_title='Can you beat my score? · SumSum Playground',
                              og_desc='A free arcade math game. Get the app and play the same challenge.', og_img='og.png?v=4',
                              msg='Opening SumSum Playground…', ios='Get it on the App Store', android='Get it on Google Play', web='Play on the web'),
    'join/index.html': dict(lang='en', title='SumSum Playground · Group challenge invite', og_title="You're invited to a group challenge!",
                            og_desc='Same problems for everyone. Who will be #1? · SumSum Playground', og_img='og-join.png?v=1',
                            msg='Opening SumSum Playground…', ios='Get it on the App Store', android='Get it on Google Play', web='Play on the web'),
}

TPL = '''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0d0a1c">
<title>{title}</title>
<meta name="robots" content="noindex">
<meta property="og:type" content="website">
<meta property="og:site_name" content="SumSum Playground">
<meta property="og:title" content="{og_title}">
<meta property="og:description" content="{og_desc}">
<meta property="og:image" content="https://sumsum.studiojhl.com/{og_img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/galmuri.css">
<style>
  * {{ box-sizing: border-box; }}
  [hidden] {{ display: none !important; }}
  html, body {{ margin: 0; height: 100%; }}
  body {{
    background: #0d0a1c;
    background-image: linear-gradient(rgba(106, 77, 255, 0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(106, 77, 255, 0.14) 1px, transparent 1px);
    background-size: 24px 24px;
    color: #f2eeff;
    font-family: "Galmuri11", -apple-system, "Apple SD Gothic Neo", sans-serif;
  }}
  main {{
    min-height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 16px; padding: 32px 24px calc(32px + env(safe-area-inset-bottom)); text-align: center;
  }}
  .logo {{ width: min(300px, 78vw); height: auto; image-rendering: pixelated; }}
  p {{ margin: 6px 0 10px; font-size: 16px; color: #b9b0e6; }}
  a {{
    display: flex; align-items: center; justify-content: center;
    width: 100%; max-width: 300px; min-height: 56px; padding: 12px 14px;
    font-family: inherit; font-weight: 700; font-size: 17px; text-decoration: none; word-break: keep-all;
    color: #0d0a1c; background: #ffe14d;
    border: 3px solid #0d0a1c; outline: 3px solid #ffe14d;
    box-shadow: 6px 6px 0 #ff4da6;
  }}
  a:active {{ transform: translate(3px, 3px); box-shadow: 3px 3px 0 #ff4da6; }}
  a.sub {{ color: #f2eeff; background: #1a1438; border-color: #1a1438; outline-color: #6a4dff; box-shadow: 6px 6px 0 #3d2f86; margin-top: 6px; }}
  a.sub:active {{ box-shadow: 3px 3px 0 #3d2f86; }}
</style>
</head>
<body>
<main>
  <img class="logo" src="/app/img/intro-logo.png" alt="SumSum Playground" width="1888" height="424">
  <p>{msg}</p>
  <a id="ios" href="https://apps.apple.com/app/id6826497198" hidden>{ios}</a>
  <a id="android" href="https://play.google.com/store/apps/details?id=com.studiojhl.sumsum" hidden>{android}</a>
  <a class="sub" id="web" href="/">{web}</a>
</main>
<script>
  var LIVE = {live};
  var ua = navigator.userAgent;
  var ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document);
  var android = /Android/.test(ua);
  var go = ios && LIVE.ios ? 'ios' : android && LIVE.android ? 'android' : null;
  // 내 기기에 맞는 스토어 버튼만 보여요 (컴퓨터는 나온 스토어 전부)
  if (LIVE.ios && (ios || !android)) document.getElementById('ios').hidden = false;
  if (LIVE.android && (android || !ios)) document.getElementById('android').hidden = false;
  // 아이폰은 스토어 버튼 하나만 (앱이 있으면 스토어의 '열기'로 들어가요)
  if (go === 'ios') document.getElementById('web').hidden = true;
  // 도전장·방 정보(?cn=… / ?room=…)가 있으면 "웹에서 하기" 링크도 그대로 들고 가요
  document.getElementById('web').href = '/' + location.search;
  // 앱이 없어서 웹으로 보낼 때도 그 정보를 그대로 들고 가요
  location.replace(go ? document.getElementById(go).href : '/' + location.search);
</script>
</body>
</html>
'''
for path, c in PAGES.items():
    out = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w', encoding='utf-8').write(TPL.format(live=LIVE, **c))
    print(path)
