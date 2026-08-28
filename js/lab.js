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
    head.innerHTML = '<h1>' + item.title + '</h1><div class="meta">' + item.stage + ' · ' +
      { math: '数学', physics: '物理', chemistry: '化学' }[item.subject] + ' · ' + item.branch +
      (item.type === 'concept' ? ' · 概念讲解' : ' · 公式实验') + '</div>';
    root.appendChild(head);

    // 星图 2.0：前置门槛软提示（不阻止学习，只指路）
    if (window.Progress && window.Deps) {
      const g = Progress.checkGate(item.id);
      if (!g.ok && !Progress.isLit('kb-' + item.id)) {
        const gate = document.createElement('div');
        gate.className = 'viz-card';
        gate.style.cssText = 'background:#fef3c7;border:1px solid #f59e0b;margin-bottom:10px;font-size:13.5px;color:#92400e';
        let gh = '🔒 这个知识建议先有基础：';
        g.missing.forEach(function (pid) {
          const pit = Reg.byId[pid];
          if (pit) gh += ' <a href="#/kb/' + pit.id + '" style="color:#b45309">' + pit.title + '</a>';
        });
        gh += '（可直接学，但卡住了就回头补它们）';
        gate.innerHTML = gh;
        root.appendChild(gate);
      }
    }

    // 四幕剧：第一幕·历史现场 + 第二幕·先猜后验
    const story = window.Stories && Stories[item.id];
    if (story && story.story) {
      const sc = document.createElement('div');
      sc.className = 'viz-card';
      sc.style.cssText = 'border-left:4px solid #f59e0b';
      sc.innerHTML = '<h3>📖 历史现场</h3><p style="font-size:14px;line-height:1.8;margin:0">' + story.story + '</p>';
      root.appendChild(sc);
    }
    if (story && story.predict) {
      const pc = document.createElement('div');
      pc.className = 'viz-card';
      pc.style.cssText = 'border-left:4px solid #2563eb';
      pc.innerHTML = '<h3>🤔 先猜后验（猜错比看答案记得更牢）</h3>';
      const pq = document.createElement('p');
      pq.style.cssText = 'font-size:14.5px';
      pq.textContent = story.predict.q;
      pc.appendChild(pq);
      const row = document.createElement('div');
      story.predict.opts.forEach(function (opt, i) {
        const b = document.createElement('button');
        b.className = 'btn secondary';
        b.style.cssText = 'margin:4px 8px 4px 0';
        b.textContent = opt;
        b.addEventListener('click', function () {
          const done = pc.getAttribute('data-done');
          if (done) return;
          pc.setAttribute('data-done', '1');
          const right = (i === story.predict.a);
          row.style.opacity = '0.6';
          const fb = document.createElement('div');
          fb.style.cssText = 'margin-top:8px;font-size:13.5px;padding:8px 10px;border-radius:8px;background:' + (right ? '#ecfdf5' : '#fef2f2') + ';color:' + (right ? '#065f46' : '#991b1b');
          fb.textContent = (right ? '✓ 猜对了！' : '✗ 猜错了——这种错误印象最深。') + ' ' + story.predict.e;
          pc.appendChild(fb);
          if (window.Progress) Progress.addPoints(2, '先猜后验');
        });
        row.appendChild(b);
      });
      pc.appendChild(row);
      root.appendChild(pc);
    }

    // 学科动画理念（讲清原理优先，不强加实验）
    const idea = document.createElement('div');
    idea.className = 'note';
    idea.style.marginBottom = '10px';
    idea.textContent = {
      math: '数学：有真实世界含义的公式/定理，用几何或生活场景演示出来（如面积模型、数轴、单位圆）；纯符号的则以计算与检测为主。',
      physics: '物理：动画即实验——运动、力、光、电都有直观场景，调参数看现象，理解规律。',
      chemistry: '化学：以反应演示为主——粒子重组、颜色变化、实验装置，看清"原子如何重新排队"。'
    }[item.subject];
    root.appendChild(idea);

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
      root.appendChild(card);

      // 演示动画（每个概念知识点都有）
      const animCard = document.createElement('div');
      animCard.className = 'viz-card';
      animCard.innerHTML = '<h3>演示动画 · 直观理解</h3>';
      root.appendChild(animCard);
      const animWrap = document.createElement('div');
      animCard.appendChild(animWrap);
      if (window.ConceptMap && window.ConceptAnim) {
        const tpl = ConceptMap.get(item);
        try { ConceptAnim.render(animWrap, tpl); } catch (e) { UI.showError(animWrap, e); }
        const tag = document.createElement('div');
        tag.className = 'note';
        tag.textContent = '演示动画呈现该概念的核心机制；需要数值计算的知识点见同章节"公式实验"类条目。';
        animCard.appendChild(tag);
      }
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

      const sliderRefs = {};
      (def.params || []).forEach(function (pm) {
        sliderRefs[pm.k] = UI.slider(panel, pm.label, pm.min, pm.max, pm.step, pm.v, function (v) {
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

      /* ===== 实验级升级 v2 =====
       * 1) 专属"实时实验视图"：按学科/知识点类型匹配针对性动画（每个实验画面都不同）
       * 2) 实验曲线：结果随参数变化的完整扫描
       * 3) 自动播放：所有参与参数同时来回扫（可勾选某个参数保持不变） */
      const allPms = def.params || [];

      const computeRows = function () {
        try { return def.fn(params); } catch (e) { return null; }
      };

      /* --- 1) 专属实验视图 --- */
      let vizMounted = false;
      if (window.LabViz) {
        const vizCard = document.createElement('div');
        vizCard.className = 'viz-card';
        vizCard.innerHTML = '<h3>实时实验视图</h3>';
        left.appendChild(vizCard);
        const vizWrap = document.createElement('div');
        vizCard.appendChild(vizWrap);
        vizMounted = LabViz.mount(vizWrap, item, params, computeRows);
        if (!vizMounted) vizCard.remove();
      }

      /* --- 2) 自动播放（参数面板内）：所有参数同时来回扫，可勾选排除 --- */
      const st = { playing: false, loop: true };
      const ctrl = UI.animControls(panel, st);
      const enabled = {};
      const phases = {};
      allPms.forEach(function (pm) { enabled[pm.k] = true; phases[pm.k] = Math.random() * Math.PI * 2; });
      if (allPms.length > 1) {
        const pWrap = document.createElement('div');
        pWrap.className = 'anim-params';
        const labTitle = document.createElement('span');
        labTitle.style.cssText = 'color:#94a3b8;align-self:center';
        labTitle.textContent = '参与自动变化的参数：';
        pWrap.appendChild(labTitle);
        allPms.forEach(function (pm) {
          const lab = document.createElement('label');
          const chk = document.createElement('input');
          chk.type = 'checkbox'; chk.checked = true;
          chk.addEventListener('change', function () {
            enabled[pm.k] = chk.checked;
            lab.classList.toggle('off', !chk.checked);
          });
          lab.appendChild(chk);
          lab.appendChild(document.createTextNode(pm.label.replace(/[（(].*$/, '')));
          pWrap.appendChild(lab);
        });
        panel.appendChild(pWrap);
      }
      let autoT = 0;
      (function frame() {
        if (st.playing) {
          autoT += 0.012 * (window.Anim ? Anim.speed : 1);
          let anyActive = false;
          allPms.forEach(function (pm) {
            if (!enabled[pm.k]) return;
            anyActive = true;
            const ph = (Math.sin(autoT * (0.7 + phases[pm.k] * 0.15) + phases[pm.k]) + 1) / 2;
            let val = pm.min + (pm.max - pm.min) * ph;
            val = Math.round(val / pm.step) * pm.step;
            val = Number(val.toFixed(4));
            params[pm.k] = val;
            if (sliderRefs[pm.k]) sliderRefs[pm.k].setValue(val);
          });
          if (!anyActive) { st.playing = false; ctrl.setPlaying(false); }
          update();
        }
        window.requestAnimationFrame(frame);
      })();

      /* calc 型也挂针对性场景动画（如有显式映射），与概念件统一 */
      if (window.ConceptMap && window.ConceptAnim && ConceptMap.has(item.id)) {
        const animCard = document.createElement('div');
        animCard.className = 'viz-card';
        animCard.innerHTML = '<h3>演示动画 · 直观理解</h3>';
        left.appendChild(animCard);
        const animWrap = document.createElement('div');
        animCard.appendChild(animWrap);
        try { ConceptAnim.render(animWrap, ConceptMap.get(item)); } catch (e) { UI.showError(animWrap, e); }
      }
      update();
    }

    // 四幕剧：第四幕·位置回望（它在宇宙里的位置）
    if (story && story.after) {
      const ac = document.createElement('div');
      ac.className = 'viz-card';
      ac.style.cssText = 'border-left:4px solid #059669';
      ac.innerHTML = '<h3>🌌 它在体系中的位置</h3><p style="font-size:14px;line-height:1.8;margin:0">' + story.after + '</p>';
      root.appendChild(ac);
    }

    // 机制四：相关探索（这个知识能解释的神奇现象）
    const xlinks = window.KbExploreLinks && KbExploreLinks[item.id];
    if (xlinks && xlinks.length) {
      const xc = document.createElement('div');
      xc.className = 'viz-card';
      xc.style.cssText = 'border-left:4px solid #8b5cf6';
      let xh = '<h3>🔭 它能解释的真实现象</h3><div>';
      xlinks.forEach(function (t) {
        xh += '<a href="#/explore" data-xq="' + t + '" style="display:inline-block;margin:3px 8px 3px 0;padding:3px 12px;background:#f5f3ff;border:1px solid #c4b5fd;border-radius:12px;font-size:12.5px;color:#5b21b6;text-decoration:none">' + t + '</a>';
      });
      xh += '</div>';
      xc.innerHTML = xh;
      xc.querySelectorAll('[data-xq]').forEach(function (a) {
        a.addEventListener('click', function () { window._exploreQuery = a.getAttribute('data-xq'); });
      });
      root.appendChild(xc);
    }

    // 检测题（答对点亮 + 积分；直接用 'kb-<id>' 作为点亮键，图谱联动）
    if (def.quiz && window.Quiz) {
      const qid = 'kb-' + item.id;
      Quiz.add(qid, [{ q: def.quiz.q, options: def.quiz.opts, answer: def.quiz.a, explain: def.quiz.e }]);
      Quiz.render(root, qid);
    }
    // 知识点专属讲解语音（不再使用知识实验室的通用欢迎词）
    if (window.Voice) {
      let say;
      if (item.type === 'concept') {
        // 概念件：朗读核心讲解（截取前两句）
        const text = (def.text || '').replace(/[（(].*?[)）]/g, '');
        say = item.title + '。' + text.slice(0, 76);
      } else {
        // 公式实验：讲清楚可以调什么、看什么
        const names = (def.params || []).map(function (p) { return p.label.replace(/[（(].*$/, ''); }).slice(0, 4).join('、');
        say = item.title + '。这是一个公式实验：拖动滑块调节' + names + '，观察结果如何变化。';
      }
      Voice.intro(say);
    }
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
