"""학습 가이드 페이지 만들기 (실행: python3 tools/guide/build.py)
: /guide/… (한국어), /en/guide/… (영어), sitemap.xml, robots.txt"""
import os, json, html, importlib.util, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.abspath(os.path.join(HERE, '..', '..'))
SITE = 'https://sumsum.studiojhl.com'
DATE = '2026-11-11'
V = '20261111a'
ADS = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6048734887508367" crossorigin="anonymous"></script>'


def load(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, name + '.py'))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m

KO, EN = load('content_ko'), load('content_en')

L = {
    'ko': dict(mod=KO, base='/guide/', home='/', name='셈셈 놀이터', back='← 게임으로 돌아가기', other='English', other_lang='en',
               crumb_home='셈셈 놀이터', mins='읽는 시간 {n}분', date='2026년 11월 11일',
               cta='읽은 내용을 바로 게임으로 연습해 보세요.', go='게임하러 가기 ▶', related='함께 읽으면 좋은 글',
               foot=[('/about.html', '소개'), ('/guide/', '학습 가이드'), ('/privacy.html', '개인정보처리방침'), ('mailto:jhl.studio.00@gmail.com', '문의')],
               foot_label='사이트 정보', og='/og.png?v=4', locale='ko_KR', hub_count='글 {n}편'),
    'en': dict(mod=EN, base='/en/guide/', home='/?lang=en', name='SumSum Playground', back='← Back to the games', other='한국어', other_lang='ko',
               crumb_home='SumSum Playground', mins='{n} min read', date='November 11, 2026',
               cta='Put what you just read into practice.', go='Play now ▶', related='Keep reading',
               foot=[('/about.html', 'About'), ('/en/guide/', 'Learning Guide'), ('/privacy.html', 'Privacy'), ('mailto:jhl.studio.00@gmail.com', 'Contact')],
               foot_label='Site', og='/og-en.png?v=4', locale='en_US', hub_count='{n} articles'),
}
OTHER = {'ko': 'en', 'en': 'ko'}


def url(lang, slug=None):
    return SITE + L[lang]['base'] + (f'{slug}/' if slug else '')


def head(lang, title, desc, slug, ld):
    c = L[lang]
    alt = ''.join(f'<link rel="alternate" hreflang="{l}" href="{url(l, slug)}">\n  ' for l in ('ko', 'en'))
    alt += f'<link rel="alternate" hreflang="x-default" href="{url("ko", slug)}">'
    e = html.escape
    return f'''<!doctype html>
<html lang="{lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#0d0a1c">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
  <link rel="alternate icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2">
  <link rel="manifest" href="/site.webmanifest">
  <title>{e(title)} · {c['name']}</title>
  <meta name="description" content="{e(desc)}">
  <link rel="canonical" href="{url(lang, slug)}">
  {alt}
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="{c['name']}">
  <meta property="og:title" content="{e(title)}">
  <meta property="og:description" content="{e(desc)}">
  <meta property="og:url" content="{url(lang, slug)}">
  <meta property="og:image" content="{SITE}{c['og']}">
  <meta property="og:locale" content="{c['locale']}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Jua&family=Do+Hyeon&family=Press+Start+2P&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/galmuri.css">
  <link rel="stylesheet" href="/css/theme.css?v={V}">
  <link rel="stylesheet" href="/css/style.css?v={V}">
  <link rel="stylesheet" href="/css/arcade.css?v={V}">
  <link rel="stylesheet" href="/css/page.css?v={V}">
  <link rel="stylesheet" href="/css/guide.css?v={V}">
  <script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
  {ADS}
</head>
<body>
<div id="app">
<main class="doc">
  <div class="doc-top">
    <a class="doc-back" href="{c['home']}">{c['back']}</a>
    <a class="chip lang-link" href="{L[OTHER[lang]]['base']}{slug + '/' if slug else ''}" hreflang="{c['other_lang']}" lang="{c['other_lang']}">{c['other']}</a>
  </div>
'''


def foot(lang):
    c = L[lang]
    links = '<span class="dot">·</span>\n    '.join(f'<a href="{h}">{t}</a>' for h, t in c['foot'])
    return f'''  <nav class="site-foot" aria-label="{c['foot_label']}">
    {links}
  </nav>
</main>
</div>
</body>
</html>
'''


def item(lang, p):
    return (f'<li><a href="{L[lang]["base"]}{p["slug"]}/"><span class="t">{html.escape(p["title"])}</span>'
            f'<span class="d">{html.escape(p["desc"])}</span></a></li>')


def related(lang, p, pages):
    same = [q for q in pages if q['cat'] == p['cat'] and q['slug'] != p['slug']]
    i = [q['slug'] for q in pages if q['cat'] == p['cat']].index(p['slug'])
    same = same[i:] + same[:i]
    other = [q for q in pages if q['cat'] != p['cat'] and q['cat'] != 'help'] or [q for q in pages if q['cat'] != p['cat']]
    pick = same[:2] + [other[i % len(other)]]
    return '\n      '.join(item(lang, q) for q in pick)


def write(path, text):
    full = os.path.join(ROOT, path.lstrip('/'))
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(text)


urls = []
for lang in ('ko', 'en'):
    c = L[lang]; m = c['mod']; pages = m.PAGES
    for p in pages:
        ld = {'@context': 'https://schema.org', '@type': 'Article', 'headline': p['title'], 'description': p['desc'],
              'inLanguage': lang, 'datePublished': DATE, 'dateModified': DATE,
              'author': {'@type': 'Organization', 'name': 'JHL STUDIO'},
              'publisher': {'@type': 'Organization', 'name': 'JHL STUDIO'},
              'mainEntityOfPage': url(lang, p['slug'])}
        page = head(lang, p['title'], p['desc'], p['slug'], ld)
        page += f'''  <nav class="crumbs" aria-label="breadcrumb">
    <a href="{c['home']}">{c['crumb_home']}</a><span class="sep">›</span>
    <a href="{c['base']}">{m.HUB['title']}</a><span class="sep">›</span>
    <span>{m.CATS[p['cat']]}</span>
  </nav>

  <article class="card">
    <h1>{html.escape(p['title'])}</h1>
    <p class="meta">{m.CATS[p['cat']]} · {c['mins'].format(n=p['mins'])} · {c['date']}</p>
{p['body'].strip()}
  </article>

  <section class="card cta">
    <p>{c['cta']}</p>
    <a class="btn-go" href="{c['home']}">{c['go']}</a>
  </section>

  <section class="card">
    <h2 class="rel-h">{c['related']}</h2>
    <ul class="post-list">
      {related(lang, p, pages)}
    </ul>
  </section>
'''
        page += foot(lang)
        write(f"{c['base']}{p['slug']}/index.html", page)
        urls.append((url(lang, p['slug']), p['slug']))

    # 모음 페이지
    ld = {'@context': 'https://schema.org', '@type': 'CollectionPage', 'name': m.HUB['title'], 'description': m.HUB['desc'],
          'inLanguage': lang, 'url': url(lang)}
    hub = head(lang, m.HUB['title'], m.HUB['desc'], None, ld)
    hub += f'''  <article class="card">
    <h1>{m.HUB['title']}</h1>
    <p class="lead">{m.HUB['lead']}</p>
    <p class="meta">{c['hub_count'].format(n=len(pages))} · {c['date']}</p>
  </article>
'''
    for cat, name in m.CATS.items():
        lis = '\n      '.join(item(lang, q) for q in pages if q['cat'] == cat)
        hub += f'''
  <section class="card">
    <h2 class="rel-h">{name}</h2>
    <ul class="post-list two">
      {lis}
    </ul>
  </section>
'''
    hub += f'''
  <section class="card cta">
    <p>{c['cta']}</p>
    <a class="btn-go" href="{c['home']}">{c['go']}</a>
  </section>
'''
    hub += foot(lang)
    write(f"{c['base']}index.html", hub)
    urls.append((url(lang), None))

# sitemap / robots
core = [SITE + '/', SITE + '/about.html', SITE + '/privacy.html']
sm = ['<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
for u in core:
    sm.append(f'  <url><loc>{u}</loc><lastmod>{DATE}</lastmod></url>')
seen = set()
for u, slug in urls:
    if u in seen: continue
    seen.add(u)
    sm.append(f'  <url><loc>{u}</loc><lastmod>{DATE}</lastmod>'
              f'<xhtml:link rel="alternate" hreflang="ko" href="{url("ko", slug)}"/>'
              f'<xhtml:link rel="alternate" hreflang="en" href="{url("en", slug)}"/></url>')
sm.append('</urlset>')
write('/sitemap.xml', '\n'.join(sm) + '\n')
write('/robots.txt', f'User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n')
print('pages', len(urls), 'sitemap urls', len(seen) + len(core))
