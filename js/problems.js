/*
 * 문제 만들기 규칙. 화면과 무관한 순수 로직이라 Node에서도 테스트할 수 있어요.
 *
 * 문제 모양: { op, a, b, ans }
 *  - '+' : a + b = ans
 *  - '-' : a − b = ans  (a >= b 이라서 답이 음수가 되지 않아요)
 *  - '*' : a × b = ans  (1~최대 단 × 1~최대 단)
 *  - '/' : a ÷ b = ans  (나누어떨어지는 문제만. b × ans = a 로 거꾸로 만들어요)
 */
const Problems = (() => {
  const OPS = ['+', '-', '*', '/'];
  const SYM = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  const rand = n => Math.floor(Math.random() * n);
  const pick = arr => arr[rand(arr.length)];
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = rand(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // 레벨이 오르면 숫자 범위가 12%씩 넓어져요. 곱셈·나눗셈 단은 15단까지만.
  function rangeFor(s, level) {
    const k = 1 + 0.12 * (level - 1);
    return {
      add: Math.min(300, Math.round(s.addMax * k)),
      mul: Math.min(15, Math.round(s.mulMax * k)),
    };
  }

  function fresh(op, r) {
    if (op === '+') {
      const a = 1 + rand(r.add);
      const b = 1 + rand(r.add);
      return { op, a, b, ans: a + b };
    }
    if (op === '-') {
      let a = 1 + rand(r.add);
      let b = 1 + rand(r.add);
      if (a < b) [a, b] = [b, a];
      return { op, a, b, ans: a - b };
    }
    if (op === '*') {
      const a = 1 + rand(r.mul);
      const b = 1 + rand(r.mul);
      return { op, a, b, ans: a * b };
    }
    // 나눗셈: 나누는 수 × 몫 = 나뉘는 수 로 거꾸로 만들어요.
    const b = 1 + rand(r.mul);
    const ans = 1 + rand(r.mul);
    return { op, a: b * ans, b, ans };
  }

  // 새 문제 만들기. 틀린 문제 목록(weak)이 있으면 25% 확률로 그중에서 다시 꺼내요.
  function makeProblem(s, level, weak = []) {
    const ops = s.ops && s.ops.length ? s.ops : OPS;
    const pool = weak.filter(w => ops.includes(w.op));
    if (pool.length && Math.random() < 0.25) {
      const w = pick(pool);
      return { op: w.op, a: w.a, b: w.b, ans: w.ans };
    }
    return fresh(pick(ops), rangeFor(s, level));
  }

  // 정답 근처의 오답 숫자. 곱셈은 앞뒤 단의 답(예: 7×8 → 6×8, 7×9)을 먼저 섞어요.
  function wrongNumbers(p, count) {
    const seen = new Set([p.ans]);
    const out = [];
    const take = v => {
      if (out.length < count && v >= 0 && !seen.has(v)) {
        seen.add(v);
        out.push(v);
      }
    };

    const table = [];
    if (p.op === '*') {
      table.push((p.a - 1) * p.b, (p.a + 1) * p.b, p.a * (p.b - 1), p.a * (p.b + 1));
    }
    if (p.op === '+' || p.op === '-') {
      table.push(p.ans + 10, p.ans - 10); // 십의 자리를 헷갈리게
    }
    shuffle(table).forEach(take);

    const near = [];
    for (let d = 1; d <= 20; d++) near.push(p.ans + d, p.ans - d);
    shuffle(near).forEach(take);

    return out;
  }

  // 보기 만들기: 정답 하나 + 오답들을 섞어서 돌려줘요.
  function makeChoices(p, count) {
    return shuffle([p.ans, ...wrongNumbers(p, count - 1)]);
  }

  // 참 거짓 문제: 절반은 맞는 식, 절반은 틀린 식(shown이 틀린 답)
  function makeTF(s, level, weak = []) {
    const p = makeProblem(s, level, weak);
    if (Math.random() < 0.5) return { ...p, shown: p.ans, isTrue: true };
    return { ...p, shown: wrongNumbers(p, 1)[0], isTrue: false };
  }

  const text = p => `${p.a} ${SYM[p.op]} ${p.b} = ?`;
  const equation = (p, shown) => `${p.a} ${SYM[p.op]} ${p.b} = ${shown}`;
  const levelOf = (n, perLevel) => Math.floor(n / perLevel) + 1;

  const api = { OPS, SYM, rangeFor, makeProblem, makeChoices, makeTF, text, equation, levelOf };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  return api;
})();
