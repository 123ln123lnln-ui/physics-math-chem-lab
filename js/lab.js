/* lab.js — 知识实验室引擎（注册表驱动的通用交互渲染）
 * 每个注册条目 = 一个真实交互件：公式（KaTeX）+ 参数滑块（带语音数值播报）
 * + 实时计算结果（只读引擎输出）+ 检测题（答对点亮/得分）。
 * 概念型条目（type:'concept'）提供讲解卡 + 检测题，并诚实标注"动画建设中"。
 */
(function () {
  const R = { items: {}, byId: {} };

  // R.add(id, subject, stage, title, branch, type, def)
  R.add = function (id, subject, stage, title, branch, type, def) {
    const item = { id: id, subject: subject, stage: stage, title: title, branch: branch, type: type, def: def || {} };
    R.items[id] = item;
    R.byId[id] = item;
  };

  R.count = function (subject) {
    let n = 0;
    for (const id in R.items) if (!subject || R.items[id].subject === subject) n++;
    return n;
  };

  R.branches = function (subject, stage) {
    const seen = [];
    for (const id in R.items) {
      const it = R.items[id];
      if (it.subject === subject && (!stage || it.stage === stage) && seen.indexOf(it.branch) === -1) seen.push(it.branch);
    }
    return seen;
  };

  R.list = function (subject, stage, branch) {
    const out = [];
    for (const id in R.items) {
      const it = R.items[id];
      if (it.subject !== subject) continue;
      if (stage && it.stage !== stage) continue;
      if (branch && it.branch !== branch) continue;
      out.push(it);
    }
    return out;
  };

  /* ===== 渲染单个知识点的交互页 ===== */
  R.renderItem = function (root, item) {
    const back = document.createElement('a');
    back.className = 'back-link';
    back.href = '#/lab';
    back.textContent = '← 返回知识实验室';
    root.appendChild(back);

    const head = document.createElement('div');
    head.className = 'module-head';
    const stageTag = item.stage;
    head.innerHTML = '<h1>' + item.title + '</h1><div class="meta">' + stageTag + ' · ' +
      { math: '数学', physics: '物理', chemistry: '化学' }[item.subject] + ' · ' + item.branch + '</div>';
    root.appendChild(head);

    const def = item.def;

    if (item.type === 'concept') {
      const card = document.createElement('div');
      card.className = 'viz-card';
      const h3 = document.createElement('h3');
      h3.textContent = '知识讲解';
      card.appendChild(h3);
      const p = document.createElement('p');
      p.style.cssText = 'font-size:14.5px;line-height:1.8';
      p.textContent = def.text || '';
      card.appendChild(p);
      if (def.formula) {
        const f = document.createElement('div');
        card.appendChild(f);
        UI.texBlock(f, def.formula);
      }
      const note = document.createElement('div');
      note.className = 'note';
      note.textContent = '本知识点为概念型内容，交互动画建设中；检测题已就绪，答对可点亮。';
      card.appendChild(note);
      root.appendChild(card);
    } else {
      // calc / graph 型：参数实验
      const page = document.createElement('div');
      page.className = 'module-page';
      const left = document.createElement('div');
      const right = document.createElement('div');
      page.appendChild(left); page.appendChild(right);
      root.appendChild(page);

      const viz = document.createElement('div');
      viz.className = 'viz-card';
      viz.innerHTML = '<h3>实验结果</h3>';
      const formulaDiv = document.createElement('div');
      viz.appendChild(formulaDiv);
      if (def.formula) UI.texBlock(formulaDiv, def.formula);
      const resultDiv = document.createElement('div');
      viz.appendChild(resultDiv);
      left.appendChild(viz);

      const panel = document.createElement('div');
      panel.className = 'panel';
      panel.innerHTML = '<h3>参数调节（拖动听播报）</h3>';
      right.appendChild(panel);

      const params = {};
      (def.params || []).forEach(function (pm) { params[pm.k] = pm.v; });

      function update() {
        resultDiv.innerHTML = '';
        try {
          const rows = def.fn(params);
          UI.readout(resultDiv, rows);
        } catch (e) {
          UI.showError(resultDiv, e);
        }
      }

      (def.params || []).forEach(function (pm) {
        UI.slider(panel, pm.label, pm.min, pm.max, pm.step, pm.v, function (v) {
          params[pm.k] = v;
          update();
        }, pm.unit !== undefined ? { unit: pm.unit } : undefined);
      });

      if (def.hint) {
        const hint = document.createElement('div');
        hint.className = 'note';
        hint.textContent = def.hint;
        panel.appendChild(hint);
      }
      update();
    }

    // 检测题（答对点亮 + 积分；直接用 'kb-<id>' 作为点亮键，图谱联动）
    if (def.quiz && window.Quiz) {
      const qid = 'kb-' + item.id;
      Quiz.add(qid, [{ q: def.quiz.q, options: def.quiz.opts, answer: def.quiz.a, explain: def.quiz.e }]);
      Quiz.render(root, qid);
    }
    // 语音介绍
    if (window.Voice) Voice.intro('欢迎来到知识实验室，' + item.title + '。拖动参数滑块做实验，答对检测题就能点亮知识图谱。');
    if (window.Progress) Progress.markVisit('kb-' + item.id);
  };

  /* ===== 实验室目录页 ===== */
  R.renderLabHome = function (root) {
    const h1 = document.createElement('h1');
    h1.textContent = '知识实验室 · 全部知识点';
    root.appendChild(h1);

    const stat = document.createElement('div');
    stat.className = 'graph-legend';
    const total = R.count();
    let lit = 0;
    for (const id in R.items) if (window.Progress && Progress.isLit('kb-' + id)) lit++;
    stat.textContent = '注册知识点 ' + total + ' 个（数学 ' + R.count('math') + ' / 物理 ' + R.count('physics') + ' / 化学 ' + R.count('chemistry') + '），已点亮 ' + lit + ' 个。点击任意条目进入交互实验，答对检测题点亮图谱。';
    root.appendChild(stat);

    const subjects = [['math', '数学'], ['physics', '物理'], ['chemistry', '化学']];
    const stages = ['初中', '高中'];

    subjects.forEach(function (s) {
      const h2 = document.createElement('h2');
      h2.textContent = s[1] + '（' + R.count(s[0]) + ' 个）';
      root.appendChild(h2);
      stages.forEach(function (stage) {
        const h3 = document.createElement('h3');
        h3.style.cssText = 'font-size:14px;color:#64748b;margin:10px 0 6px';
        h3.textContent = stage;
        root.appendChild(h3);
        const grid = document.createElement('div');
        grid.className = 'kb-grid';
        R.list(s[0], stage).forEach(function (it) {
          const isLit = window.Progress && Progress.isLit('kb-' + it.id);
          const chip = document.createElement('a');
          chip.href = '#/kb/' + it.id;
          chip.className = 'kb-chip' + (isLit ? ' lit' : '') + (it.type === 'concept' ? ' concept' : '');
          chip.innerHTML = (isLit ? '★ ' : '') + it.title +
            '<span class="kb-branch">' + it.branch + '</span>' +
            (it.type === 'concept' ? '<span class="kb-type">概念</span>' : '');
          grid.appendChild(chip);
        });
        root.appendChild(grid);
      });
    });
  };

  window.Reg = R;
})();
