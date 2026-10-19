/*
 * 게임 엔진과 6가지 모드.
 * 홈 설정, 모드 카드, 결과 화면 표시는 app.js가 맡아요.
 */

// 속도 배율: 문제 비 · 풍선 팡팡에만 적용돼요.
const SPEED = { vslow: 0.6, slow: 0.8, normal: 1, fast: 1.35, vfast: 2 };

// 문제 비(보통 이상): 처음에는 기준 속도의 80%로 시작해서 1초마다 0.01배씩 빨라지고, 최대 2배에서 멈춰요.
function fallRamp(sec) {
  return Math.min(2, 0.8 + 0.01 * sec);
}

// 최고 기록 키: 모드 + 숫자 범위 + (속도 또는 제한 시간, 해당 모드만)
function bestKey(id, s) {
  const range = `a${s.addMax}m${s.mulMax}`;
  if (id === 'fall' || id === 'balloon') return `${id}|${range}|${s.speed}`;
  if (id === 'minute' || id === 'tf') return `${id}|${range}|${s.time}`;
  return `${id}|${range}`; // race: 숫자 범위만
}

// 60문제 타임어택은 시간이 짧을수록 좋고, 나머지는 점수가 높을수록 좋아요.
const isBetter = (id, a, b) => (id === 'race' ? a < b : a > b);

const Game = (() => {
  const $ = id => document.getElementById(id);
  const POINTS = 10;
  const RACE_GOAL = 60;

  let G = null; // 지금 진행 중인 한 판
  let rafId = 0;
  let lastTs = 0;
  let lastBoard = '';
  let bannerTimer = 0;

  /* ---------- 화면 효과 ---------- */

  // 같은 애니메이션을 처음부터 다시 재생
  function restart(node, cls) {
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
  }

  function shake(node) {
    restart(node, 'shake');
  }

  function flash(kind) {
    restart($('stage'), kind === 'ok' ? 'flash-ok' : 'flash-bad');
  }

  function fx(text, kind) {
    const node = document.createElement('div');
    node.className = `float ${kind || ''}`;
    node.textContent = text;
    node.style.left = `${50 + (Math.random() * 30 - 15)}%`;
    $('fxLayer').appendChild(node);
    setTimeout(() => node.remove(), 900);
  }

  function banner(text) {
    const node = $('banner');
    node.textContent = text;
    node.hidden = false;
    restart(node, 'show');
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => { node.hidden = true; }, 1200);
  }

  function good(label) {
    Sound.correct();
    flash('ok');
    fx(label, 'good');
  }

  function bad() {
    Sound.wrong();
    flash('bad');
  }

  /* ---------- 점수판 ---------- */

  function renderBoard(cells) {
    const html = cells
      .map(([k, v]) => `<div class="score-cell"><span class="score-label">${t(k)}</span><span class="score-value">${v}</span></div>`)
      .join('');
    if (html !== lastBoard) {
      $('scoreboard').innerHTML = html;
      lastBoard = html;
    }
  }

  const secText = x => `${Math.max(0, Math.ceil(x))}${t('secUnit')}`;

  // 목숨은 "반 칸" 단위로 세요 (6 = 하트 3개). 홀수면 반 하트를 그려요.
  const hearts = units => {
    if (units <= 0) return '—';
    const full = '<span class="heart">♥</span>'.repeat(Math.floor(units / 2));
    const half = units % 2 ? '<span class="heart half">♥</span>' : '';
    return full + half;
  };

  function renderInput() {
    $('answerVal').textContent = G ? G.input : '';
  }

  /* ---------- 채점 도우미 ---------- */

  // 점수판을 바로 맞춰요 (프레임을 기다리지 않아요).
  function refresh() {
    if (G && G.running && !G.over) renderBoard(G.M.board());
  }

  // 맞힌 문제: 점수와 연속 기록을 올리고, 약점 목록에서 빼요.
  function hit(p, pts, label) {
    G.correct++;
    G.streak++;
    G.maxStreak = Math.max(G.maxStreak, G.streak);
    G.score += pts;
    Store.removeWeak(p);
    good(label ?? `+${pts}`);
    refresh();
  }

  // 틀린 횟수만 올려요 (보기를 여러 번 틀려도 횟수는 매번 올라가요).
  function countWrong() {
    G.wrong++;
    G.streak = 0;
    bad();
    refresh();
  }

  // 결과 목록에 한 줄 남기고, 약점 목록에 넣어요.
  function logMiss(p, o = {}) {
    G.misses.push({
      q: o.q || Problems.equation(p, p.ans),
      answer: o.answer ?? String(p.ans),
      mine: o.mine ?? null,
      missed: !!o.missed,
    });
    Store.addWeak(p);
  }

  function miss(p, o) {
    countWrong();
    logMiss(p, o);
  }

  // 목숨을 깎고, 0이 되면 판을 끝내요. units: 반 칸 단위 (1 = 반 하트, 2 = 한 칸)
  function loseLife(units) {
    G.lives = Math.max(0, G.lives - units);
    refresh();
    if (G.lives <= 0) finish(true);
  }

  // 레벨 올리기 (문제 비, 풍선 팡팡). 알림은 점수판의 레벨 칸에 잠깐 띄워요.
  function checkLevel(perLevel) {
    const n = Problems.levelOf(G.correct, perLevel);
    if (n > G.level) {
      G.level = n;
      G.lvFlashUntil = performance.now() + 1500;
      Sound.levelUp();
      refresh();
    }
  }

  // 레벨 칸: 레벨이 막 올랐을 때만 "레벨 n!"을 보여 줘요.
  function levelCell() {
    if (performance.now() < G.lvFlashUntil) {
      return `<span class="lv-flash">${t('levelUp', { n: G.level })}</span>`;
    }
    return G.level;
  }

  /* ---------- 공통 엔진 ---------- */

  function stop() {
    cancelAnimationFrame(rafId);
    rafId = 0;
    if (G) G.timers.forEach(clearTimeout);
  }

  function countdown() {
    const box = $('countdown');
    const num = $('countNum');
    const steps = ['3', '2', '1', t('countdownGo')];
    box.hidden = false;

    const step = i => {
      num.textContent = steps[i];
      restart(num, 'pop');
      const last = i === steps.length - 1;
      G.timers.push(setTimeout(() => {
        if (!last) {
          step(i + 1);
        } else {
          box.hidden = true;
          G.running = true;
          lastTs = performance.now();
          G.M.begin();
        }
      }, last ? 500 : 800));
    };
    step(0);
  }

  function start(id, settings) {
    stop();
    G = {
      id,
      M: MODES[id],
      s: settings,
      sp: SPEED[settings.speed] || 1,
      score: 0,
      correct: 0,
      wrong: 0,
      streak: 0,
      maxStreak: 0,
      level: 1,
      lives: 6, // 반 칸 단위 (6 = 하트 3개)
      timeLeft: settings.time,
      timeMax: settings.time,
      elapsed: 0,
      running: false,
      over: false,
      timers: [],
      lvFlashUntil: 0,
      input: '',
      cur: null,
      misses: [],
      wrongLogged: false,
      items: [],
      balls: [],
      spawnIn: 0,
    };
    lastBoard = '';
    $('gameTitle').textContent = modeName(id, settings);
    $('stage').className = 'stage';
    $('stage').onpointerdown = null;
    G.M.build();
    $('padWrap').hidden = !G.M.numpad;
    renderInput();
    App.show('game');
    rafId = requestAnimationFrame(loop);
    countdown();
  }

  function loop(ts) {
    // 시간은 실제 흐른 만큼 재고(탭이 잠시 가려져도 제한 시간은 그대로 흘러요),
    // 움직임 계산은 한 프레임이 너무 길면 0.1초로 잘라서 튀지 않게 해요.
    const real = Math.max(0, (ts - lastTs) / 1000);
    const dt = Math.min(0.1, real);
    lastTs = ts;
    if (!G || G.over) return;

    if (G.running) {
      G.elapsed += real;
      if (G.M.timed) G.timeLeft -= real * G.M.drain();
      if (G.M.update) G.M.update(dt);
      if (G.over) return;
      if (G.M.timed && G.timeLeft <= 0) {
        G.timeLeft = 0;
        finish(true);
        return;
      }
      renderBoard(G.M.board());
    }
    rafId = requestAnimationFrame(loop);
  }

  // completed: 끝까지 해서 기록을 저장할지 여부. 그만하기는 false.
  function finish(completed) {
    if (!G || G.over) return;
    G.over = true;
    stop();
    $('countdown').hidden = true;

    const id = G.id;
    const isRace = id === 'race';
    const value = isRace ? Math.round(G.elapsed * 10) / 10 : G.score;
    const key = bestKey(id, G.s);

    let badge = { kind: 'quit' };
    if (completed) {
      const prev = Store.getBest(key);
      if (prev === null) {
        badge = { kind: 'first' };
        Store.setBest(key, value);
      } else if (isBetter(id, value, prev)) {
        badge = { kind: 'new' };
        Store.setBest(key, value);
      } else {
        badge = { kind: 'best', value: prev };
      }
    }

    const tries = G.correct + G.wrong;
    const acc = tries ? Math.round((G.correct / tries) * 100) : 0;
    App.showResult({
      mode: id,
      settings: G.s,
      value,
      labelKey: isRace ? 'resLabelTime' : 'resLabelScore',
      badge,
      stats: [
        [t('statCorrect'), G.correct],
        [t('statAcc'), `${acc}%`],
        [t('statStreak'), G.maxStreak],
      ],
      misses: G.misses,
    });
  }

  function quit() {
    if (!G || G.over) return;
    if (!G.running) {
      // 카운트다운 중이면 바로 홈으로
      G.over = true;
      stop();
      $('countdown').hidden = true;
      App.showHome();
      return;
    }
    finish(false);
  }

  // 숫자패드 입력 (숫자패드를 쓰는 모드만)
  function key(k) {
    if (!G || !G.running || G.over || !G.M.numpad) return;
    if (k === 'clear') {
      G.input = G.input.slice(0, -1);
    } else if (k === 'ok') {
      if (G.input !== '') G.M.submit(G.input);
    } else if (G.input.length < 4) {
      G.input += k;
    }
    renderInput();
    refresh();
  }

  function keydown(e) {
    if (!G || G.over) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      quit();
      return;
    }
    if (!G.running) return;
    if (G.M.numpad) {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        key(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        key('clear');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        key('ok');
      }
    } else if (G.M.keyboard) {
      G.M.keyboard(e);
    }
  }

  /* ---------- 1. 문제 비 (Falling Problems) ---------- */

  function spawnFall() {
    const field = $('field');
    const p = Problems.makeProblem(G.s, G.level, Store.weakList());
    const node = document.createElement('div');
    node.className = 'fall-card';
    node.dataset.op = p.op;
    node.textContent = Problems.text(p);
    field.appendChild(node);
    const w = node.offsetWidth;
    const h = node.offsetHeight;
    const x = pickFallX(field.clientWidth, w, h);
    node.style.transform = `translate(${x}px, ${-h}px)`;
    G.items.push({ p, node, x, y: -h, h });
  }

  // 새 문제가 위쪽에 떠 있는 문제와 겹치지 않는 자리를 골라요.
  // 여러 자리를 뽑아 보고, 가장 덜 겹치는(가장 멀리 떨어진) 자리를 써요.
  function pickFallX(fieldW, w, h) {
    const maxX = Math.max(0, fieldW - w);
    const near = G.items.filter(it => it.y < h * 3);
    let best = Math.random() * maxX, bestScore = -Infinity;
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * maxX;
      let score = Infinity;
      for (const it of near) {
        const iw = it.node.offsetWidth;
        const gap = Math.max(it.x - (x + w), x - (it.x + iw)); // 음수면 겹침
        score = Math.min(score, gap);
      }
      if (score > bestScore) { bestScore = score; best = x; }
      if (score >= 12) break;
    }
    return best;
  }

  function removeFall(it) {
    G.items.splice(G.items.indexOf(it), 1);
    it.node.remove();
  }

  function popFall(it) {
    G.items.splice(G.items.indexOf(it), 1);
    it.node.classList.add('pop');
    setTimeout(() => it.node.remove(), 300);
  }

  /* ---------- 2. 1분 도전 (Minute Challenge) ---------- */

  function minuteNext() {
    G.level = Problems.levelOf(G.correct, 10);
    const p = Problems.makeProblem(G.s, G.level, Store.weakList());
    G.cur = p;
    G.wrongLogged = false;
    const choices = Problems.makeChoices(p, 12).sort((a, b) => a - b);
    $('prompt').textContent = Problems.text(p);
    $('choices').innerHTML = choices
      .map(v => `<button type="button" class="choice" data-v="${v}">${v}</button>`)
      .join('');
  }

  function minutePick(btn) {
    if (!G.running || G.over || btn.disabled) return;
    const v = Number(btn.dataset.v);
    const p = G.cur;
    if (v === p.ans) {
      hit(p, POINTS);
      minuteNext();
      return;
    }
    // 틀리면 그 보기만 꺼지고, 같은 문제가 남아요.
    btn.disabled = true;
    shake(btn);
    countWrong();
    if (!G.wrongLogged) {
      G.wrongLogged = true;
      logMiss(p, { mine: String(v) });
    }
  }

  /* ---------- 3. 60문제 타임어택 (60-Question Race) ---------- */

  function raceNext() {
    G.level = Problems.levelOf(G.correct, 10);
    G.cur = Problems.makeProblem(G.s, G.level, Store.weakList());
    $('prompt').textContent = Problems.text(G.cur);
  }

  function raceSubmit(text) {
    const p = G.cur;
    G.input = '';
    if (Number(text) === p.ans) {
      hit(p, 0, '✓');
      if (G.correct >= RACE_GOAL) {
        finish(true);
        return;
      }
      if (G.correct % 10 === 0) banner(t('race10', { n: G.correct }));
      raceNext();
    } else {
      miss(p, { mine: text });
      shake($('answerBox'));
    }
  }

  /* ---------- 4. 풍선 팡팡 (Balloon Pop) ---------- */

  function balloonNext() {
    // 아직 날아가는 풍선(이전 문제)은 지워요. 방금 터진 풍선은 애니메이션이 끝나면 스스로 사라져요.
    for (const b of G.balls) {
      if (!b.node.classList.contains('popped') && !b.node.classList.contains('wrong-pop')) b.node.remove();
    }
    G.balls = [];
    G.wrongLogged = false;
    G.cur = Problems.makeProblem(G.s, G.level, Store.weakList());
    $('prompt').textContent = Problems.text(G.cur);

    const field = $('bfield');
    const H = field.clientHeight;
    Problems.makeChoices(G.cur, 4).forEach((v, i) => {
      const node = document.createElement('div');
      node.className = `balloon c${i}`;
      node.textContent = v;
      node.style.left = `${12.5 + i * 25}%`;
      field.appendChild(node);
      const vel = H * (0.09 + 0.012 * (G.level - 1)) * G.sp * (0.85 + Math.random() * 0.3);
      G.balls.push({ v, node, y: 0, vel, gone: false });
    });
  }

  function balloonTap(node) {
    const b = G.balls.find(x => x.node === node);
    if (!b || b.gone || G.over) return;
    const p = G.cur;
    b.gone = true;
    if (b.v === p.ans) {
      node.classList.add('popped');
      setTimeout(() => node.remove(), 300);
      hit(p, POINTS * G.level);
      checkLevel(10);
      balloonNext();
      return;
    }
    node.classList.add('wrong-pop');
    setTimeout(() => node.remove(), 300);
    countWrong();
    if (!G.wrongLogged) {
      G.wrongLogged = true;
      logMiss(p, { mine: String(b.v) });
    }
    loseLife(2);
  }

  /* ---------- 5. 시간 버티기 (Beat the Clock) ---------- */

  function beatNext() {
    G.level = Problems.levelOf(G.correct, 10);
    G.cur = Problems.makeProblem(G.s, G.level, Store.weakList());
    $('prompt').textContent = Problems.text(G.cur);
    $('choices').innerHTML = Problems.makeChoices(G.cur, 4)
      .map(v => `<button type="button" class="choice" data-v="${v}">${v}</button>`)
      .join('');
  }

  function beatPick(btn) {
    if (!G.running || G.over) return;
    const v = Number(btn.dataset.v);
    const p = G.cur;
    if (v === p.ans) {
      G.timeLeft += 2;
      hit(p, POINTS, `+${POINTS} · +2${t('secUnit')}`);
      if (G.streak >= 3) banner(t('combo', { n: G.streak }));
    } else {
      G.timeLeft -= 3;
      miss(p, { mine: String(v) });
      fx(`−3${t('secUnit')}`, 'bad');
      shake($('prompt'));
    }
    beatNext();
  }

  /* ---------- 6. 참 거짓 스피드 (True or False) ---------- */

  function tfNext() {
    G.level = Problems.levelOf(G.correct, 10);
    G.cur = Problems.makeTF(G.s, G.level, Store.weakList());
    $('prompt').textContent = Problems.equation(G.cur, G.cur.shown);
  }

  function tfAnswer(yes) {
    if (!G.running || G.over) return;
    const c = G.cur;
    const p = { op: c.op, a: c.a, b: c.b, ans: c.ans };
    if (yes === c.isTrue) {
      hit(p, POINTS);
    } else {
      miss(p, {
        q: Problems.equation(c, c.shown),
        answer: c.isTrue ? t('tfTrue') : t('tfFalse'),
        mine: yes ? t('tfTrue') : t('tfFalse'),
      });
    }
    tfNext();
  }

  /* ---------- 모드 정의 ---------- */

  const MODES = {
    fall: {
      numpad: true,
      build() {
        $('stage').innerHTML = '<div class="play-field" id="field"></div>';
      },
      begin() {
        spawnFall();
        G.spawnIn = 2;
      },
      update(dt) {
        const field = $('field');
        const H = field.clientHeight;
        // 떨어지는 속도: 보통 이상은 시간이 갈수록 빨라지고, 아주 느리게·느리게는 예전처럼 레벨에 따라 조금씩 빨라져요.
        const rampUp = ['normal', 'fast', 'vfast'].includes(G.s.speed);
        const speed = rampUp
          ? H * 0.075 * G.sp * fallRamp(G.elapsed)
          : H * (0.075 + 0.012 * (G.level - 1)) * G.sp;

        G.spawnIn -= dt;
        if (G.spawnIn <= 0) {
          if (G.items.length < 8) spawnFall();
          G.spawnIn = Math.max(1.2, 3 - 0.35 * (G.level - 1)) / G.sp;
        }

        for (const it of G.items) {
          it.y += speed * dt;
          it.node.style.transform = `translate(${it.x}px, ${it.y}px)`;
        }

        const landed = G.items.filter(it => it.y + it.h >= H);
        for (const it of landed) {
          removeFall(it);
          miss(it.p, { missed: true });
          // 바닥에 닿으면 한 칸(하트 1개)
          loseLife(2);
          if (G.over) return;
        }
        if (landed.length) shake(field);
      },
      submit(text) {
        const v = Number(text);
        G.input = '';
        const hits = G.items.filter(it => it.p.ans === v);
        if (!hits.length) {
          // 틀린 답은 반 하트만 줄어요.
          countWrong();
          shake($('answerBox'));
          fx(`−½ ♥`, 'bad');
          loseLife(1);
          return;
        }
        // 답이 맞는 문제 중 가장 아래에 있는 것부터 터뜨려요.
        const target = hits.reduce((a, b) => (b.y > a.y ? b : a));
        popFall(target);
        hit(target.p, POINTS * G.level);
        checkLevel(20);
      },
      board: () => [
        ['sbScore', G.score],
        ['sbLevel', levelCell()],
        ['sbLives', hearts(G.lives)],
      ],
    },

    minute: {
      timed: true,
      drain: () => 1,
      build() {
        $('stage').innerHTML =
          '<div class="prompt" id="prompt"></div><div class="choices cols-3" id="choices"></div>';
        $('stage').onpointerdown = e => {
          const btn = e.target.closest('.choice');
          if (btn) minutePick(btn);
        };
      },
      begin: minuteNext,
      board: () => [
        ['sbScore', G.score],
        ['sbTime', secText(G.timeLeft)],
        ['sbLevel', levelCell()],
      ],
    },

    race: {
      numpad: true,
      build() {
        $('stage').innerHTML = '<div class="prompt" id="prompt"></div>';
      },
      begin: raceNext,
      submit: raceSubmit,
      board: () => [
        ['sbProgress', `${G.correct}/${RACE_GOAL}`],
        ['sbTime', `${G.elapsed.toFixed(1)}${t('secUnit')}`],
        ['sbWrong', G.wrong],
      ],
    },

    balloon: {
      build() {
        $('stage').innerHTML =
          '<div class="prompt" id="prompt"></div><div class="balloon-field" id="bfield"></div>';
        $('stage').onpointerdown = e => {
          const node = e.target.closest('.balloon');
          if (node) balloonTap(node);
        };
      },
      begin: balloonNext,
      update(dt) {
        const H = $('bfield').clientHeight;
        let escapedCorrect = false;
        for (const b of G.balls) {
          if (b.gone) continue;
          b.y += b.vel * dt;
          b.node.style.transform = `translateY(${-b.y}px)`;
          if (b.y >= H) {
            // 위로 날아가 버린 풍선
            b.gone = true;
            b.node.remove();
            if (b.v === G.cur.ans) escapedCorrect = true;
          }
        }
        if (escapedCorrect) {
          miss(G.cur, { missed: true });
          loseLife(2);
          if (G.over) return;
          balloonNext();
        }
      },
      board: () => [
        ['sbScore', G.score],
        ['sbLevel', levelCell()],
        ['sbLives', hearts(G.lives)],
      ],
    },

    beat: {
      timed: true,
      drain: () => 1,
      build() {
        $('stage').innerHTML =
          `<div class="clock"><div class="clock-fill" id="clockFill"></div></div>` +
          '<div class="prompt" id="prompt"></div>' +
          '<div class="choices cols-2" id="choices"></div>' +
          `<p class="hint">${t('beatHint')}</p>`;
        $('stage').onpointerdown = e => {
          const btn = e.target.closest('.choice');
          if (btn) beatPick(btn);
        };
        G.timeLeft = 30;
        G.timeMax = 30;
      },
      begin: beatNext,
      update() {
        const ratio = Math.min(1, Math.max(0, G.timeLeft / G.timeMax));
        $('clockFill').style.width = `${ratio * 100}%`;
      },
      keyboard(e) {
        const n = Number(e.key);
        if (n >= 1 && n <= 4) {
          e.preventDefault();
          const btn = $('choices').children[n - 1];
          if (btn) beatPick(btn);
        }
      },
      board: () => [
        ['sbTime', secText(G.timeLeft)],
        ['sbScore', G.score],
        ['sbCombo', G.streak],
      ],
    },

    tf: {
      timed: true,
      drain: () => 1,
      build() {
        $('stage').innerHTML =
          '<div class="prompt">' +
          `<div class="question-label">${t('tfQuestion')}</div>` +
          '<div class="equation" id="prompt"></div>' +
          '</div>' +
          '<div class="ox">' +
          `<button type="button" class="ox-btn ox-o" data-ox="1"><span class="ox-mark">O</span><span class="ox-text">${t('tfTrue')}</span></button>` +
          `<button type="button" class="ox-btn ox-x" data-ox="0"><span class="ox-mark">X</span><span class="ox-text">${t('tfFalse')}</span></button>` +
          '</div>' +
          `<p class="hint">${t('tfHint')}</p>`;
        $('stage').onpointerdown = e => {
          const btn = e.target.closest('[data-ox]');
          if (btn) tfAnswer(btn.dataset.ox === '1');
        };
      },
      begin: tfNext,
      keyboard(e) {
        if (e.key === 'ArrowLeft' || e.key === 'o' || e.key === 'O') {
          e.preventDefault();
          tfAnswer(true);
        } else if (e.key === 'ArrowRight' || e.key === 'x' || e.key === 'X') {
          e.preventDefault();
          tfAnswer(false);
        }
      },
      board: () => [
        ['sbScore', G.score],
        ['sbTime', secText(G.timeLeft)],
        ['sbCombo', G.streak],
      ],
    },
  };

  return { start, key, keydown, quit };
})();
