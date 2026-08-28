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
      let drawSweep = null; // 稍后由扫描卡片赋值
      (def.params || []).forEach(function (pm) {
        sliderRefs[pm.k] = UI.slider(panel, pm.label, pm.min, pm.max, pm.step, pm.v, function (v) {
          params[pm.k] = v;
          update();
          if (drawSweep) drawSweep();
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

      function numericOf(rows) {
        if (!Array.isArray(rows)) return null;
        for (let i = 0; i < rows.length; i++) {
          const v = rows[i][1];
          if (typeof v === 'number' && isFinite(v)) return v;
          if (typeof v === 'string') {
            const m = parseFloat(v);
            if (isFinite(m) && /^[-+]?[\d.]/.test(v.trim())) return m;
          }
        }
        return null;
      }
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

      /* --- 2) 实验曲线 --- */
      const sweepKey = def.sweep || ((allPms[0] || {}).k);
      const sweepPm = allPms.find(function (p) { return p.k === sweepKey; });
      const expCard = document.createElement('div');
      expCard.className = 'viz-card';
      expCard.innerHTML = '<h3>实验曲线 · "' + (sweepPm ? sweepPm.label.replace(/[（(].*$/, '') : '') + '" 全范围扫描</h3>';
      left.appendChild(expCard);

      const cw = document.createElement('canvas');
      cw.style.cssText = 'width:100%;max-width:470px;border-radius:8px;background:#fff;display:block';
      const CW = 470, CH = 210;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw.width = CW * dpr; cw.height = CH * dpr;
      expCard.appendChild(cw);
      const cctx = cw.getContext('2d');
      cctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      function sampleAt(val) {
        const snap = {};
        for (const k in params) snap[k] = params[k];
        snap[sweepKey] = val;
        try { return numericOf(def.fn(snap)); } catch (e) { return null; }
      }
      drawSweep = function () {
        cctx.clearRect(0, 0, CW, CH);
        if (!sweepPm) {
          cctx.fillStyle = '#94a3b8'; cctx.font = '12px sans-serif';
          cctx.fillText('本实验无可扫描参数，请直接拖动滑块操作。', 40, CH / 2);
          return;
        }
        const pts = [];
        for (let i = 0; i <= 90; i++) {
          const val = sweepPm.min + (sweepPm.max - sweepPm.min) * i / 90;
          const y = sampleAt(val);
          if (y !== null) pts.push([val, y]);
        }
        if (!pts.length) {
          cctx.fillStyle = '#94a3b8'; cctx.font = '12px sans-serif';
          cctx.fillText('本实验结果为文字型，请直接拖动滑块操作。', 40, CH / 2);
          return;
        }
        let ymin = Infinity, ymax = -Infinity;
        pts.forEach(function (p) { if (p[1] < ymin) ymin = p[1]; if (p[1] > ymax) ymax = p[1]; });
        if (ymax - ymin < 1e-9) { ymax = ymin + 1; }
        const padL = 46, padR = 14, padT = 14, padB = 30;
        function X(v) { return padL + (v - sweepPm.min) / (sweepPm.max - sweepPm.min) * (CW - padL - padR); }
        function Y(v) { return padT + (1 - (v - ymin) / (ymax - ymin)) * (CH - padT - padB); }
        cctx.strokeStyle = '#e2e8f0';
        for (let i = 0; i <= 4; i++) {
          const gy = padT + i * (CH - padT - padB) / 4;
          cctx.beginPath(); cctx.moveTo(padL, gy); cctx.lineTo(CW - padR, gy); cctx.stroke();
          cctx.fillStyle = '#94a3b8'; cctx.font = '10px sans-serif'; cctx.textAlign = 'right';
          cctx.fillText(UI.fmt(ymax - i * (ymax - ymin) / 4, 2), padL - 5, gy + 3);
        }
        cctx.textAlign = 'left';
        cctx.fillStyle = '#64748b'; cctx.font = '10.5px sans-serif';
        cctx.fillText(UI.fmt(sweepPm.min, 2), padL, CH - 10);
        cctx.fillText(UI.fmt(sweepPm.max, 2), CW - padR - 28, CH - 10);
        cctx.fillText('结果随 "' + sweepPm.label.replace(/[（(].*$/, '') + '" 变化', padL, 11);
        cctx.strokeStyle = '#2563eb'; cctx.lineWidth = 2;
        cctx.beginPath();
        pts.forEach(function (p, i) {
          if (i === 0) cctx.moveTo(X(p[0]), Y(p[1])); else cctx.lineTo(X(p[0]), Y(p[1]));
        });
        cctx.stroke();
        const cv = params[sweepKey], cy2 = sampleAt(cv);
        if (cy2 !== null) {
          cctx.setLineDash([3, 3]); cctx.strokeStyle = '#dc2626';
          cctx.beginPath(); cctx.moveTo(X(cv), CH - padB); cctx.lineTo(X(cv), Y(cy2)); cctx.stroke();
          cctx.setLineDash([]);
          cctx.fillStyle = '#dc2626';
          cctx.beginPath(); cctx.arc(X(cv), Y(cy2), 4.5, 0, Math.PI * 2); cctx.fill();
        }
      };

      /* --- 3) 自动播放：所有参数同时来回扫 --- */
      const st = { playing: false, loop: true };
      const ctrl = UI.animControls(expCard, st);
      // 参数参与开关（取消勾选 = 该参数保持不动）
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
        expCard.appendChild(pWrap);
      }
      let autoT = 0;
      (function frame() {
        if (st.playing) {
          autoT += 0.012 * (window.Anim ? Anim.speed : 1);
          let anyActive = false;
          allPms.forEach(function (pm) {
            if (!enabled[pm.k]) return;
            anyActive = true;
            // 每个参数按自己的相位做平滑往复（正弦），避免机械同步
            const ph = (Math.sin(autoT * (0.7 + phases[pm.k] * 0.15) + phases[pm.k]) + 1) / 2;
            let val = pm.min + (pm.max - pm.min) * ph;
            val = Math.round(val / pm.step) * pm.step;
            val = Number(val.toFixed(4));
            params[pm.k] = val;
            if (sliderRefs[pm.k]) sliderRefs[pm.k].setValue(val);
          });
          if (!anyActive) { st.playing = false; ctrl.setPlaying(false); }
          update();
          drawSweep();
        }
        window.requestAnimationFrame(frame);
      })();

      const tip = document.createElement('div');
      tip.className = 'note';
      tip.textContent = '点击播放：所有勾选的参数同时自动来回变化，观察结果如何联动。取消某个参数的勾选，它就会保持不动。';
      expCard.appendChild(tip);
      drawSweep();

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
