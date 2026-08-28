/* quiz.js — 趣味答题引擎
 * 每个模块注册题目；答对给积分 + 点亮知识点；支持连击。
 * 渲染入口由模块调用：Quiz.render(container, moduleId)。
 */
(function () {
  const Q = { bank: {}, combo: 0 };

  // 注册题目：Q.add(moduleId, [{q, options:[], answer:idx, explain}])
  Q.add = function (moduleId, questions) {
    Q.bank[moduleId] = questions;
  };

  Q.render = function (container, moduleId) {
    const qs = Q.bank[moduleId];
    if (!qs || !qs.length) return;

    const card = document.createElement('div');
    card.className = 'viz-card quiz-card';
    card.innerHTML = '<h3>趣味答题 · 答对得积分、点亮知识点</h3>';
    container.appendChild(card);

    const box = document.createElement('div');
    card.appendChild(box);

    function shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }

    let order = shuffle(qs.map((q, i) => i));
    let pos = 0;

    function showNext() {
      box.innerHTML = '';
      if (pos >= order.length) {
        const done = document.createElement('div');
        done.innerHTML = '<p>本知识点题目做完啦！换个知识点继续探索，或再挑战一轮。</p>';
        const again = document.createElement('button');
        again.className = 'btn secondary';
        again.textContent = '再来一轮';
        again.addEventListener('click', function () {
          order = shuffle(qs.map((q, i) => i)); pos = 0; showNext();
        });
        done.appendChild(again);
        box.appendChild(done);
        return;
      }
      const q0 = qs[order[pos]];
      // 选项乱序（正确答案位置不固定在 A）
      const idxs = q0.options.map(function (_, i) { return i; });
      const shuffled = shuffle(idxs);
      const q = { q: q0.q, options: shuffled.map(i => q0.options[i]), answer: shuffled.indexOf(q0.answer), explain: q0.explain };
      const p = document.createElement('p');
      p.className = 'quiz-q';
      p.textContent = (pos + 1) + '/' + order.length + ' ' + q.q;
      box.appendChild(p);
      const ol = document.createElement('div');
      ol.className = 'quiz-options';
      q.options.forEach(function (opt, idx) {
        const b = document.createElement('button');
        b.className = 'quiz-opt';
        b.textContent = String.fromCharCode(65 + idx) + '. ' + opt;
        b.addEventListener('click', function () {
          if (idx === q.answer) {
            b.classList.add('right');
            Q.combo++;
            Progress.addPoints(5 + Math.min(Q.combo, 5), '答对（连击 ' + Q.combo + '）');
            Progress.light(moduleId);
            Voice.girl(Q.combo >= 3 ? '连对 ' + Q.combo + ' 题，太厉害啦！' : '答对啦！');
            showExplain(q, true);
          } else {
            b.classList.add('wrong');
            Q.combo = 0;
            Voice.girl('哎呀，再想想？');
            showExplain(q, false);
          }
        });
        ol.appendChild(b);
      });
      box.appendChild(ol);
    }

    function showExplain(q, correct) {
      const ex = document.createElement('div');
      ex.className = 'quiz-explain ' + (correct ? 'ok' : 'no');
      ex.textContent = (correct ? '正确！' : '正确答案是 ' + String.fromCharCode(65 + q.answer) + '。') + ' ' + q.explain;
      box.appendChild(ex);
      const next = document.createElement('button');
      next.className = 'btn';
      next.style.marginTop = '10px';
      next.textContent = '下一题';
      next.addEventListener('click', function () { pos++; showNext(); });
      box.appendChild(next);
    }

    showNext();
  };

  window.Quiz = Q;
})();
