/*
 * 소개·개인정보처리방침 같은 글 페이지용.
 * 게임에서 고른 언어(한국어/English)에 맞춰 해당 언어 부분만 보여 줘요.
 */
(() => {
  let lang = 'ko';
  try {
    const raw = localStorage.getItem('sumsum.lang.v1');
    const v = raw ? JSON.parse(raw) : null;
    if (v === 'en' || v === 'ko') lang = v;
    else if (!(navigator.language || 'ko').toLowerCase().startsWith('ko')) lang = 'en';
  } catch (e) {}

  function apply(l) {
    lang = l;
    document.documentElement.lang = l;
    document.querySelectorAll('[data-only]').forEach(n => { n.hidden = n.dataset.only !== l; });
    document.querySelectorAll('[data-set-lang]').forEach(b =>
      b.setAttribute('aria-pressed', String(b.dataset.setLang === l)));
  }

  document.querySelectorAll('[data-set-lang]').forEach(b =>
    b.addEventListener('click', () => {
      apply(b.dataset.setLang);
      try { localStorage.setItem('sumsum.lang.v1', JSON.stringify(lang)); } catch (e) {}
    }));
  apply(lang);
})();
