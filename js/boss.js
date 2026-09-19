/* boss.js — 路径 BOSS 战：一条主线的通关验收
 * 从路径节点题库抽 5 题连战，≥80% 正确即通关（🏆 记录在本地）。
 * 答错的题照常进错题本、节点掉「摇晃」——BOSS 战同时是错题发生器。
 * 路由：#/boss/<pathId>
 */
(function () {
  const Boss = {};

  function clearedAt(pid) {
    try { return Number(localStorage.getItem('pmc-boss-' + pid)) || 0; } catch (e) { return 0; }
  }
  Boss.cleared = function (pid) { return clearedAt(pid) > 0; };

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  Boss.render = function (root, pid) {
    const p = window.Paths && Paths.byId[pid];
    if (!p) {
      root.innerHTML = '<div class="viz-card"><h3>未找到该路径</h3><a class="back-link" href="#/paths">返回路径列表</a></div>';
      return;
    }
    const back = document.createElement('a');
    back.className = 'back-link'; back.href = '#/paths/' + pid; back.textContent = '← 返回 ' + p.title;
    root.appendChild(back);

    // 组卷：路径节点里带检测题的，随机抽至多 5 题
    const pool = [];
    p.nodes.forEach(function (id) {
      const it = window.Reg && Reg.byId[id];
      if (it && it.def && it.def.quiz) pool.push({ id: id, title: it.title, quiz: it.def.quiz });
    });
    if (pool.length < 3) {
      const c = document.createElement('div');
      c.className = 'viz-card';
      c.textContent = '这条路径的题量还不够组 BOSS 战（至少需要 3 题）。';
      root.appendChild(c);
      return;
    }
    const picked = shuffle(pool).slice(0, 5);
    const total = picked.length;
    const passLine = Math.ceil(total * 0.8);

    const head = document.createElement('div');
    head.className = 'module-head';
    head.innerHTML = '<h1>⚔️ BOSS 战 · ' + p.title + '</h1><div class="meta">连战 ' + total +
      ' 题，答对 ' + passLine + ' 题通关 · 答错的题会进错题本</div>';
    root.appendChild(head);

    const card = document.createElement('div');
    card.className = 'viz-card quiz-card';
    root.appendChild(card);
    const box = document.createElement('div');
    card.appendChild(box);

    let pos = 0, right = 0;
    const wrongNodes = [];

    function finish() {
      const pass = right >= passLine;
      if (pass) {
        try { localStorage.setItem('pmc-boss-' + pid, String(Date.now())); } catch (e) {}
        if (window.Progress) Progress.addPoints(30, 'BOSS 通关');
        if (window.FX) { FX.burstAtBadge(); setTimeout(function () { FX.burstAtBadge(); }, 400); setTimeout(function () { FX.burstAtBadge(); }, 800); }
      }
      let html = '<div style="text-align:center;padding:8px 0">' +
        '<div class="boss-trophy">' + (pass ? '🏆' : '💪') + '</div>' +
        '<h3 style="margin:6px 0">' + (pass ? '通关！' + p.title + ' 拿下' : '差一点点：' + right + '/' + total) + '</h3></div>';
      if (!pass && wrongNodes.length) {
        html += '<p style="font-size:14px;color:#9a3412">这几课回头补一下，再来：</p><ul style="font-size:14px;line-height:2">';
        wrongNodes.forEach(function (n) { html += '<li><a href="#/kb/' + n.id + '">' + n.title + '</a></li>'; });
        html += '</ul>';
      } else if (pass) {
        html += '<p style="font-size:14px;color:#166534;text-align:center">这条主线你站稳了。去路径页看看🏆，或者挑战下一条。</p>';
      }
      html += '<div style="text-align:center;margin-top:10px">' +
        '<a class="btn" style="text-decoration:none" href="#/paths/' + pid + '">回路径</a> ' +
        '<a class="btn secondary" style="text-decoration:none" href="#/boss/' + pid + '">再挑战一轮</a></div>';
      box.innerHTML = html;
    }

    function showQ() {
      box.innerHTML = '';
      if (pos >= total) { finish(); return; }
      const cur = picked[pos];
      const qz = cur.quiz;
      const bar = document.createElement('div');
      bar.className = 'path-bar';
      bar.style.marginBottom = '10px';
      bar.innerHTML = '<div class="path-bar-fill" style="width:' + Math.round(pos / total * 100) + '%"></div>';
      box.appendChild(bar);
      const q = document.createElement('p');
      q.className = 'quiz-q';
      q.textContent = '第 ' + (pos + 1) + '/' + total + ' 题 ·【' + cur.title + '】' + qz.q;
      box.appendChild(q);
      const idxs = shuffle(qz.opts.map(function (_, i) { return i; }));
      const answerAt = idxs.indexOf(qz.a);
      const ol = document.createElement('div');
      ol.className = 'quiz-options';
      idxs.forEach(function (srcIdx, idx) {
        const b = document.createElement('button');
        b.className = 'quiz-opt';
        b.textContent = String.fromCharCode(65 + idx) + '. ' + qz.opts[srcIdx];
        b.addEventListener('click', function () {
          ol.style.pointerEvents = 'none';
          const mid = 'kb-' + cur.id;
          if (idx === answerAt) {
            b.classList.add('right');
            right++;
            if (window.Progress) { Progress.addPoints(12, 'BOSS 答对'); Progress.markCorrect(mid); }
            if (window.Mistakes) Mistakes.remove(mid, qz.q);
          } else {
            b.classList.add('wrong');
            ol.children[answerAt].classList.add('right');
            wrongNodes.push(cur);
            if (window.Progress) Progress.markWrong(mid);
            if (window.Mistakes) Mistakes.add(mid, { q: qz.q, options: qz.opts, answer: qz.a, explain: qz.e });
          }
          const ex = document.createElement('div');
          ex.className = 'quiz-explain ' + (idx === answerAt ? 'ok' : 'no');
          ex.textContent = qz.e || '';
          box.appendChild(ex);
          const next = document.createElement('button');
          next.className = 'btn';
          next.style.marginTop = '10px';
          next.textContent = pos + 1 >= total ? '查看战果' : '下一题';
          next.addEventListener('click', function () { pos++; showQ(); });
          box.appendChild(next);
        });
        ol.appendChild(b);
      });
      box.appendChild(ol);
    }
    showQ();
  };

  window.Boss = Boss;
})();
