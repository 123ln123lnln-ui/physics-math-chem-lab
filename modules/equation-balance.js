/* equation-balance.js — 化学方程式配平挑战（初中）
 * 拖系数让天平（原子数）平衡；引擎实时校验原子守恒。
 */
(function () {
  App.register({
    id: 'equation-balance',
    title: '配平挑战：化学方程式天平',
    subject: 'chemistry',
    stage: '初中',
    desc: '质量守恒就是原子守恒：反应前后每种原子数目不变。调系数让天平平衡！',
    intro: '欢迎来到配平挑战。化学反应前后，每种原子的总数保持不变。调节方程式两边的系数，让左右两边每种原子数量相等。',
    render: function (root) {
      const page = document.createElement('div'); page.className = 'module-page';
      const left = document.createElement('div');
      const right = document.createElement('div');
      page.appendChild(left); page.appendChild(right);
      root.appendChild(page);

      const viz = document.createElement('div'); viz.className = 'viz-card';
      viz.innerHTML = '<h3>原子数天平</h3>';
      const eqDiv = document.createElement('div');
      eqDiv.style.cssText = 'font-size:17px;font-weight:600;text-align:center;margin:6px 0 14px';
      viz.appendChild(eqDiv);
      const barDiv = document.createElement('div');
      viz.appendChild(barDiv);
      left.appendChild(viz);

      const panel = document.createElement('div'); panel.className = 'panel';
      panel.innerHTML = '<h3>选择题目</h3>';
      right.appendChild(panel);

      // 题目：反应物/生成物 + 正确系数（答案）
      const puzzles = [
        { label: 'H₂ + O₂ → H₂O（氢气燃烧）',
          left: [{ f: { H: 2 }, s: 'H₂' }, { f: { O: 2 }, s: 'O₂' }],
          right: [{ f: { H: 2, O: 1 }, s: 'H₂O' }], ans: [2, 1, 2] },
        { label: 'Fe + O₂ → Fe₃O₄（铁丝燃烧）',
          left: [{ f: { Fe: 1 }, s: 'Fe' }, { f: { O: 2 }, s: 'O₂' }],
          right: [{ f: { Fe: 3, O: 4 }, s: 'Fe₃O₄' }], ans: [3, 2, 1] },
        { label: 'Fe₂O₃ + CO → Fe + CO₂（炼铁）',
          left: [{ f: { Fe: 2, O: 3 }, s: 'Fe₂O₃' }, { f: { C: 1, O: 1 }, s: 'CO' }],
          right: [{ f: { Fe: 1 }, s: 'Fe' }, { f: { C: 1, O: 2 }, s: 'CO₂' }], ans: [1, 3, 2, 3] },
        { label: 'CH₄ + O₂ → CO₂ + H₂O（甲烷燃烧）',
          left: [{ f: { C: 1, H: 4 }, s: 'CH₄' }, { f: { O: 2 }, s: 'O₂' }],
          right: [{ f: { C: 1, O: 2 }, s: 'CO₂' }, { f: { H: 2, O: 1 }, s: 'H₂O' }], ans: [1, 2, 1, 2] }
      ];

      let pz = puzzles[0];
      let coefs = puzzles[0].ans.map(() => 1);
      const sliders = [];

      const selRow = document.createElement('div'); selRow.className = 'control-row';
      const sel = document.createElement('select');
      puzzles.forEach(function (p, i) {
        const o = document.createElement('option');
        o.value = i; o.textContent = p.label;
        sel.appendChild(o);
      });
      sel.addEventListener('change', function () {
        pz = puzzles[Number(sel.value)];
        coefs = pz.ans.map(() => 1);
        buildControls();
        update();
      });
      selRow.appendChild(sel);
      panel.appendChild(selRow);

      const ctrlWrap = document.createElement('div');
      panel.appendChild(ctrlWrap);
      const statusDiv = document.createElement('div');
      panel.appendChild(statusDiv);

      function buildControls() {
        ctrlWrap.innerHTML = '';
        sliders.length = 0;
        const all = pz.left.concat(pz.right);
        all.forEach(function (sp, i) {
          const s = UI.slider(ctrlWrap, '系数 × ' + sp.s, 1, 6, 1, coefs[i], function (v) {
            coefs[i] = v; update();
          });
          sliders.push(s);
        });
      }

      function update() {
        try {
          const rl = pz.left.map(function (sp, i) { return { formula: sp.f, coef: coefs[i] }; });
          const rp = pz.right.map(function (sp, i) { return { formula: sp.f, coef: coefs[pz.left.length + i] }; });
          const res = SCI.chemx.checkBalance(rl, rp);
          // 方程式显示
          eqDiv.textContent =
            coefs.slice(0, pz.left.length).join('  ') && '';
          let html = '';
          pz.left.forEach(function (sp, i) { html += '<span style="color:#dc2626">' + coefs[i] + '</span>' + sp.s + (i < pz.left.length - 1 ? ' + ' : ''); });
          html += ' &nbsp;=&nbsp; ';
          pz.right.forEach(function (sp, i) { html += '<span style="color:#2563eb">' + coefs[pz.left.length + i] + '</span>' + sp.s + (i < pz.right.length - 1 ? ' + ' : ''); });
          eqDiv.innerHTML = html;
          // 天平条形图
          barDiv.innerHTML = '';
          Object.keys(res.atomBalance).forEach(function (el) {
            const ab = res.atomBalance[el];
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;gap:8px;margin:7px 0;font-size:13px';
            const name = document.createElement('span');
            name.style.cssText = 'width:34px;font-weight:700';
            name.textContent = el;
            const lbar = document.createElement('div');
            lbar.style.cssText = 'flex:1;height:16px;background:#fee2e2;border-radius:4px;position:relative;overflow:hidden';
            const lfill = document.createElement('div');
            lfill.style.cssText = 'height:100%;width:' + Math.min(100, ab.left / 12 * 100) + '%;background:#dc2626';
            lbar.appendChild(lfill);
            const num = document.createElement('span');
            num.style.cssText = 'width:70px;text-align:center;font-variant-numeric:tabular-nums';
            num.textContent = ab.left + ' : ' + ab.right;
            num.style.color = ab.left === ab.right ? '#15803d' : '#b91c1c';
            num.style.fontWeight = '700';
            const rbar = document.createElement('div');
            rbar.style.cssText = 'flex:1;height:16px;background:#dbeafe;border-radius:4px;position:relative;overflow:hidden';
            const rfill = document.createElement('div');
            rfill.style.cssText = 'height:100%;width:' + Math.min(100, ab.right / 12 * 100) + '%;background:#2563eb';
            rbar.appendChild(rfill);
            row.appendChild(name); row.appendChild(lbar); row.appendChild(num); row.appendChild(rbar);
            barDiv.appendChild(row);
          });
          // 状态
          statusDiv.innerHTML = '';
          if (res.balanced) {
            const ok = document.createElement('div');
            ok.className = 'readout';
            ok.style.cssText = 'background:#f0fdf4;border-color:#bbf7d0;color:#15803d;font-weight:700';
            ok.textContent = '🎉 配平成功！两边每种原子数相等，符合质量守恒定律。';
            statusDiv.appendChild(ok);
            Progress.addPoints(8, '配平挑战');
            Voice.girl('配平成功，你好棒！');
          } else {
            const no = document.createElement('div');
            no.className = 'readout';
            no.style.cssText = 'color:#b45309';
            no.textContent = '还不平衡：' + res.unbalancedElements.join('、') + ' 原子两边数量不等，再调调系数。';
            statusDiv.appendChild(no);
          }
        } catch (e) { statusDiv.innerHTML = ''; UI.showError(statusDiv, e); }
      }

      buildControls();
      update();
    }
  });
})();
