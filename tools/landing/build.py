"""소개(랜딩) 페이지 만들기 (실행: python3 tools/landing/build.py) → /about.html"""
import os
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
V = '20261111d'
STORE = 'https://apps.apple.com/app/id6826497198'

T = {
'ko': dict(
  g='guide/', home='./',
  hero_k='ARCADE MATH GAME',
  h1='사칙연산을<em>오락실 게임처럼</em>',
  hero_p='덧셈, 뺄셈, 곱셈, 나눗셈으로 겨루는 아케이드 게임 6가지.<br>회원가입도 설치도 없이, 누르면 3초 뒤에 시작해요.',
  play='웹에서 바로 하기', get='앱 받기',
  hero_note='무료 · 휴대폰, 태블릿, 컴퓨터 · 한국어 / English',
  shot_alt='셈셈 놀이터 앱 화면',
  why_k='WHY SUMSUM', why_h='계산 연습이 아니라 <em>게임</em>이에요',
  why_p='문제집 대신 오락실. 점수와 기록, 순위로 말하는 계산 게임을 만들었어요.',
  why=[('바로 시작', '회원가입도 튜토리얼도 없어요. 게임을 고르고 누르면 3, 2, 1 뒤에 시작돼요.'),
       ('한 판 1분', '엘리베이터를 기다리는 동안에도 끝나요. 짧아서 "한 판만 더"가 돼요.'),
       ('누구나 같은 규칙', '어린이도, 직장인도, 어르신도 같은 화면에서 같은 조건으로 겨뤄요.')],
  games_k='6 GAMES', games_h='골라 하는 <em>게임 6가지</em>',
  games_p='같은 사칙연산인데 게임마다 쓰는 힘이 달라요. 눌러서 설명서를 볼 수 있어요.',
  games=[('falling-problems', '▼', 'mint', '문제 비', '바닥에 닿기 전에 답을 입력해요'),
         ('time-challenge', '1M', 'sun', '시간 도전', '시간 안에 정답을 많이 골라요'),
         ('sixty-question-race', '60', 'peach', '60문제 타임어택', '60문제를 가장 빨리 맞혀요'),
         ('balloon-pop', '●', 'pink', '풍선 팡팡', '정답 풍선을 터뜨려요'),
         ('beat-the-clock', '+2', 'lilac', '시간 버티기', '맞히면 시간이 늘어나요'),
         ('true-or-false', 'OX', 'ok', '참 거짓 스피드', '식이 맞으면 O, 틀리면 X')],
  shots_k='SCREENS', shots_h='이런 <em>화면</em>이에요',
  shots=[('홈', '게임 6가지 고르기'), ('문제 비', '키패드로 답 입력'),
         ('풍선 팡팡', '정답 풍선 터뜨리기'), ('시간 도전', '보기에서 정답 고르기'),
         ('명예의 전당', '랭킹전 순위표')],
  how_k='HOW TO PLAY', how_h='혼자서도, <em>같이</em>도',
  how=[('연습', '연산 종류, 숫자 범위, 속도를 내 마음대로 정해요. 틀린 문제는 기억해 뒀다가 다음 판에 다시 나와요.'),
       ('랭킹전', '모두 같은 조건으로 겨뤄요. 좋은 기록을 내면 명예의 전당에 닉네임이 올라가요.'),
       ('그룹 경쟁전', '링크를 받은 사람끼리만 겨루는 방이에요. 문제는 24시간마다 바뀌고 순위는 3일마다 새로 시작해요.')],
  app_k='APP', app_h='앱에서는 <em>더 많이</em>',
  app_p='2026년 11월, 아이폰·아이패드 앱으로 나왔어요. 게임은 그대로이고 앱에서만 되는 기능이 있어요.',
  app=[('그룹 경쟁전 방 만들기', '가족, 친구, 동료끼리만 보이는 순위표'),
       ('배지 24개와 기록실', '몇 판 했는지, 며칠 연속 들어왔는지'),
       ('보너스 하트', '배지를 모으면 하트를 더 가지고 시작'),
       ('내 순위 보기', '명예의 전당 10위 밖이어도 내 자리 확인')],
  app_more='앱이 더 좋은 점', app_note='안드로이드 앱은 준비하고 있어요.',
  story_k='MAKER', story_h='혼자 만드는 <em>게임</em>이에요',
  story=['셈셈 놀이터는 JHL STUDIO라는 이름으로 한 사람이 만들어요. "1분 구구단 테스트 같은 걸 게임으로 만들면 어떨까"에서 시작해 게임 6가지가 됐고, 2026년 11월 3일에 App Store에 나왔어요.',
         '버튼 두 개의 너비가 다르다, 일시정지를 풀면 타이밍을 놓친다. 이런 작은 불편을 하나씩 고치는 게 일의 대부분이에요. 의견을 보내 주시면 정말로 읽고 고쳐요.'],
  story_more='앱을 출시한 이야기 읽기 →',
  read_k='GUIDE', read_h='더 <em>읽을거리</em>',
  read=[('arithmetic-games', '사칙연산 게임 — 무료로 바로 하는 6가지'), ('times-table-game', '구구단 게임 — 외우지 말고 게임으로 익히기'),
        ('mental-math-game', '암산 게임 — 하루 3분 암산 연습 루틴'), ('mental-math-for-adults', '어른을 위한 암산 되살리기'),
        ('group-match', '그룹 경쟁전 — 친구·가족끼리만 겨루는 방 만들기'), ('faq', '자주 묻는 질문')],
  read_all='학습 가이드 전체 보기 →',
  fin_h='지금 <em>한 판</em> 해 볼까요?', fin_p='1분이면 충분해요. 마음에 들면 앱으로 이어서 해 보세요.',
  contact='버그 제보, 게임 아이디어, 기록 삭제 요청: ',
),
'en': dict(
  g='en/guide/', home='./?lang=en',
  hero_k='ARCADE MATH GAME',
  h1='Arithmetic,<em>arcade style</em>',
  hero_p='Six arcade games built on addition, subtraction, multiplication and division.<br>No sign-up, nothing to install. Tap and it starts in three seconds.',
  play='Play on the web', get='Get the app',
  hero_note='Free · phone, tablet, computer · 한국어 / English',
  shot_alt='SumSum Playground app screen',
  why_k='WHY SUMSUM', why_h='A <em>game</em>, not a worksheet',
  why_p='An arcade instead of a workbook. A calculation game that speaks in scores, records and ranks.',
  why=[('Starts at once', 'No sign-up, no tutorial. Pick a game, tap, and it starts after 3, 2, 1.'),
       ('A minute a game', 'Short enough for an elevator wait, which is why "one more" happens.'),
       ('Same rules for all', 'Kids, office workers and grandparents play on the same screen under the same conditions.')],
  games_k='6 GAMES', games_h='<em>Six games</em> to choose from',
  games_p='The same arithmetic, but each game asks for something different. Tap one to read its guide.',
  games=[('falling-problems', '▼', 'mint', 'Falling Problems', 'Type the answer before a problem lands'),
         ('time-challenge', '1M', 'sun', 'Time Challenge', 'Pick as many right answers as you can'),
         ('sixty-question-race', '60', 'peach', '60-Question Race', 'Race to get 60 right'),
         ('balloon-pop', '●', 'pink', 'Balloon Pop', 'Pop the balloon with the right answer'),
         ('beat-the-clock', '+2', 'lilac', 'Beat the Clock', 'Right adds 2 seconds, wrong takes 3'),
         ('true-or-false', 'OX', 'ok', 'True or False', 'O if the equation is right, X if not')],
  shots_k='SCREENS', shots_h='What it <em>looks like</em>',
  shots=[('Home', 'Pick from six games'), ('Falling Problems', 'Type on the number pad'),
         ('Balloon Pop', 'Tap the right balloon'), ('Time Challenge', 'Choose the answer'),
         ('Hall of Fame', 'The Ranked board')],
  how_k='HOW TO PLAY', how_h='Alone, or <em>together</em>',
  how=[('Practice', 'Set the operations, number range and speed yourself. Missed problems come back in later games.'),
       ('Ranked', 'Everyone plays under identical conditions. A good score puts your nickname in the Hall of Fame.'),
       ('Group challenge', 'A room for only the people with your link. Problems change every 24 hours and the ranking restarts every 3 days.')],
  app_k='APP', app_h='<em>More</em> in the app',
  app_p='Out on iPhone and iPad since November 2026. Same games, plus features only the app has.',
  app=[('Create group rooms', 'A leaderboard only your family, friends or coworkers see'),
       ('24 badges and records', 'Games played and days in a row'),
       ('Bonus hearts', 'Collect badges to start with extra hearts'),
       ('Your own rank', 'See where you stand outside the top 10')],
  app_more='Why the app?', app_note='An Android app is on the way.',
  story_k='MAKER', story_h='Made by <em>one person</em>',
  story=['SumSum Playground is made by one person under the name JHL STUDIO. It began with "what if a one-minute times table test were a game", grew to six games, and reached the App Store on November 3, 2026.',
         'Two buttons with different widths. A pause that resumes too abruptly. Fixing small annoyances like these is most of the work. Send feedback and it will be read and acted on.'],
  story_more='Read how it was shipped →',
  read_k='GUIDE', read_h='More to <em>read</em>',
  read=[('arithmetic-games', 'Arithmetic games — 6 free games you can play right now'), ('times-table-game', 'Times tables game — learn them by playing'),
        ('mental-math-game', 'Mental math game — a three-minute daily routine'), ('mental-math-for-adults', 'Mental math for adults'),
        ('group-match', 'Group challenge — a private leaderboard'), ('faq', 'FAQ')],
  read_all='See the whole Learning Guide →',
  fin_h='Ready for <em>one game</em>?', fin_p='A minute is enough. If you like it, keep going in the app.',
  contact='Bug reports, ideas or record removal: ',
),
}


def body(l):
    c = T[l]; g = c['g']
    btns = f'''<div class="lp-btns">
        <a class="lp-btn primary" href="{c['home']}">{c['play']}</a>
        <a class="lp-btn" href="{STORE}" target="_blank" rel="noopener">{c['get']}</a>
      </div>'''
    why = '\n'.join(f'      <div class="lp-box"><h3>{a}</h3><p>{b}</p></div>' for a, b in c['why'])
    games = '\n'.join(f'      <a class="lp-game" href="{g}{s}/" style="--c: var(--{col})"><i aria-hidden="true">{ic}</i><b>{n}</b><span>{d}</span></a>'
                      for s, ic, col, n, d in c['games'])
    shots = '\n'.join(f'      <figure><img class="lp-shot" src="img/shots/{l}-{i + 1}.jpg?v=1" alt="{a}" width="560" height="1151" loading="lazy"><figcaption><b>{a}</b>{b}</figcaption></figure>'
                      for i, (a, b) in enumerate(c['shots']))
    how = '\n'.join(f'      <div class="lp-box"><span class="lp-num">0{i + 1}</span><h3>{a}</h3><p>{b}</p></div>' for i, (a, b) in enumerate(c['how']))
    app = '\n'.join(f'          <li><b>{a}</b> · {b}</li>' for a, b in c['app'])
    story = '\n'.join(f'      <p>{p}</p>' for p in c['story'])
    read = '\n      '.join(f'<li><a href="{g}{s}/"><span class="t">{t}</span></a></li>' for s, t in c['read'])
    hid = '' if l == 'ko' else ' hidden'
    return f'''  <div data-only="{l}"{hid} class="lp-lang">
  <section class="lp-hero">
    <div>
      <p class="lp-kicker">{c['hero_k']}</p>
      <h1>{c['h1']}</h1>
      <p class="lp-lead">{c['hero_p']}</p>
      {btns}
      <p class="lp-note">{c['hero_note']}</p>
    </div>
    <img class="lp-shot lp-hero-shot" src="img/shots/{l}-1.jpg?v=1" alt="{c['shot_alt']}" width="560" height="1151">
  </section>

  <section class="card">
    <p class="lp-kicker">{c['why_k']}</p>
    <h2 class="lp-h2">{c['why_h']}</h2>
    <p class="lp-lead">{c['why_p']}</p>
    <div class="lp-grid3">
{why}
    </div>
  </section>

  <section class="card">
    <p class="lp-kicker">{c['games_k']}</p>
    <h2 class="lp-h2">{c['games_h']}</h2>
    <p class="lp-lead">{c['games_p']}</p>
    <div class="lp-games">
{games}
    </div>
  </section>

  <section class="card">
    <p class="lp-kicker">{c['shots_k']}</p>
    <h2 class="lp-h2">{c['shots_h']}</h2>
    <div class="lp-strip">
{shots}
    </div>
  </section>

  <section class="card">
    <p class="lp-kicker">{c['how_k']}</p>
    <h2 class="lp-h2">{c['how_h']}</h2>
    <div class="lp-grid3">
{how}
    </div>
  </section>

  <section class="card" id="app">
    <div class="lp-app">
      <div>
        <p class="lp-kicker">{c['app_k']}</p>
        <h2 class="lp-h2">{c['app_h']}</h2>
        <p class="lp-lead">{c['app_p']}</p>
        <ul class="lp-list">
{app}
        </ul>
        <div class="lp-btns">
          <a class="lp-btn primary" href="{STORE}" target="_blank" rel="noopener">{c['get']}</a>
          <a class="lp-btn" href="{g}app-vs-web/">{c['app_more']}</a>
        </div>
        <p class="lp-note">{c['app_note']}</p>
      </div>
      <img class="lp-shot lp-app-shot" src="img/shots/{l}-5.jpg?v=1" alt="{c['shots'][4][0]}" width="560" height="1151" loading="lazy">
    </div>
  </section>

  <section class="card">
    <p class="lp-kicker">{c['story_k']}</p>
    <h2 class="lp-h2">{c['story_h']}</h2>
    <div class="lp-story">
{story}
      <p><a class="lp-more" href="{g}app-launch-story/">{c['story_more']}</a></p>
    </div>
  </section>

  <section class="card">
    <p class="lp-kicker">{c['read_k']}</p>
    <h2 class="lp-h2">{c['read_h']}</h2>
    <ul class="post-list two">
      {read}
    </ul>
    <p><a class="lp-more" href="{g}">{c['read_all']}</a></p>
  </section>

  <section class="card lp-final">
    <h2 class="lp-h2">{c['fin_h']}</h2>
    <p class="lp-lead">{c['fin_p']}</p>
    {btns}
    <p class="lp-note">{c['contact']}<a href="mailto:jhl.studio.00@gmail.com">jhl.studio.00@gmail.com</a></p>
  </section>
  </div>
'''


page = f'''<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#0d0a1c">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
  <link rel="alternate icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="apple-mobile-web-app-title" content="셈셈 놀이터">
  <title>셈셈 놀이터 소개 - 사칙연산을 오락실 게임처럼 | SumSum Playground</title>
  <meta name="description" content="셈셈 놀이터는 덧셈·뺄셈·곱셈·나눗셈으로 겨루는 무료 사칙연산 아케이드 게임 6가지예요. 회원가입 없이 바로 하고, 랭킹전·명예의 전당·그룹 경쟁전으로 함께 겨뤄요. 아이폰 앱으로도 받을 수 있어요.">
  <link rel="canonical" href="https://sumsum.studiojhl.com/about.html">
  <meta name="apple-itunes-app" content="app-id=6826497198">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="셈셈 놀이터">
  <meta property="og:title" content="셈셈 놀이터 - 사칙연산을 오락실 게임처럼">
  <meta property="og:description" content="사칙연산 아케이드 게임 6가지. 회원가입 없이 바로, 한 판 1분.">
  <meta property="og:url" content="https://sumsum.studiojhl.com/about.html">
  <meta property="og:image" content="https://sumsum.studiojhl.com/og.png?v=4">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Jua&family=Do+Hyeon&family=Press+Start+2P&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/galmuri.css">
  <link rel="stylesheet" href="css/theme.css?v={V}">
  <link rel="stylesheet" href="css/style.css?v={V}">
  <link rel="stylesheet" href="css/arcade.css?v={V}">
  <link rel="stylesheet" href="css/page.css?v={V}">
  <link rel="stylesheet" href="css/guide.css?v={V}">
  <link rel="stylesheet" href="css/landing.css?v={V}">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6048734887508367" crossorigin="anonymous"></script>
</head>
<body>
<div id="app">
<main class="doc landing">
  <div class="doc-top">
    <a class="doc-back" href="./"><span data-only="ko">← 게임으로 돌아가기</span><span data-only="en" hidden>← Back to the games</span></a>
    <div class="lang-switch" role="group" aria-label="Language">
      <button type="button" class="chip" data-set-lang="ko">한국어</button>
      <button type="button" class="chip" data-set-lang="en">English</button>
    </div>
  </div>

{body('ko')}
{body('en')}
  <nav class="site-foot" aria-label="사이트 정보">
    <a href="about.html"><span data-only="ko">소개</span><span data-only="en" hidden>About</span></a><span class="dot">·</span>
    <a href="guide/" data-only="ko">학습 가이드</a><a href="en/guide/" data-only="en" hidden>Learning Guide</a><span class="dot">·</span>
    <a href="privacy.html"><span data-only="ko">개인정보처리방침</span><span data-only="en" hidden>Privacy</span></a><span class="dot">·</span>
    <a href="mailto:jhl.studio.00@gmail.com"><span data-only="ko">문의</span><span data-only="en" hidden>Contact</span></a>
  </nav>
</main>
</div>
<script src="js/page.js?v={V}"></script>
</body>
</html>
'''
open(os.path.join(ROOT, 'about.html'), 'w', encoding='utf-8').write(page)
print('about.html', len(page))
