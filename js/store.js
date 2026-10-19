/*
 * 저장소: localStorage를 try/catch로 감싸요.
 * localStorage가 막혀 있으면 메모리에만 저장하고, 게임은 멈추지 않아요.
 */
const Store = (() => {
  const KEY = {
    settings: 'sumsum.settings.v1',
    lang: 'sumsum.lang.v1',
    best: 'sumsum.best.v1',
    weak: 'sumsum.weak.v1',
  };
  const WEAK_MAX = 30;
  const memory = {}; // localStorage를 못 쓸 때 쓰는 임시 저장소

  function read(key) {
    if (key in memory) return memory[key];
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function write(key, value) {
    const raw = JSON.stringify(value);
    memory[key] = raw;
    try {
      window.localStorage.setItem(key, raw);
    } catch (e) {
      // 저장이 안 돼도 게임은 계속 돼요.
    }
  }

  function load(key, fallback) {
    const raw = read(key);
    if (raw === null || raw === undefined) return fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  // 같은 문제인지 (연산 기호와 두 수가 같으면 같은 문제)
  const same = (x, y) => x.op === y.op && x.a === y.a && x.b === y.b;

  function weakList() {
    const list = load(KEY.weak, []);
    return Array.isArray(list) ? list : [];
  }

  function addWeak(p) {
    const list = weakList().filter(w => !same(w, p));
    list.push({ op: p.op, a: p.a, b: p.b, ans: p.ans });
    while (list.length > WEAK_MAX) list.shift();
    write(KEY.weak, list);
  }

  function removeWeak(p) {
    const list = weakList();
    const next = list.filter(w => !same(w, p));
    if (next.length !== list.length) write(KEY.weak, next);
  }

  return {
    getSettings: () => load(KEY.settings, null),
    setSettings: v => write(KEY.settings, v),
    getLang: () => load(KEY.lang, null),
    setLang: v => write(KEY.lang, v),
    getBest(key) {
      const all = load(KEY.best, {});
      return typeof all[key] === 'number' ? all[key] : null;
    },
    setBest(key, value) {
      const all = load(KEY.best, {});
      all[key] = value;
      write(KEY.best, all);
    },
    weakList,
    addWeak,
    removeWeak,
    clearWeak: () => write(KEY.weak, []),
  };
})();
