/* derivative-tangent.js — 导数的几何意义：切线斜率（高中）
 * 内置多项式示例（升幂系数），切点可滑动；斜率来自 SCI.mathx.polyDerivAt。
 */
(function () {
  App.register({
    id: 'derivative-tangent',
    title: '导数的几何意义：切线',
    subject: 'math',
    stage: '高中',
    desc: '在曲线上移动切点，观察切线斜率即导数值，理解单调性与极值。',
    render: function (root) {
      const page = document.createElement('div'); page.className = 'module-page';
      const left = document.createElement('div');
      const right = document.createElement('div');
      page.appendChild(left); page.appendChild(right);
      root.appendChild(page);

      const viz = document.createElement('div'); viz.className = 'viz-card';
      viz.innerHTML = '<h3>曲线与切线</h3>';
      const boardDiv = document.createElement('div');
      boardDiv.id = 'deriv-board';
      boardDiv.style.height = '400px';
      viz.appendChild(boardDiv);
      left.appendChild(viz);

      const infoCard = document.createElement('div'); infoCard.className = 'viz-card';
      const formulaDiv = document.createElement('div');
      infoCard.appendChild(formulaDiv);
      const readoutDiv = document.createElement('div');
      infoCard.appendChild(readoutDiv);
      left.appendChild(infoCard);

      const panel = document.createElement('div'); panel.className = 'panel';
      panel.innerHTML = '<h3>选择函数与切点</h3>';
      right.appendChild(panel);

      // 示例函数（升幂系数），均经过黄金测试覆盖的导数逻辑
      const examples = [
        { label: 'f(x) = x²', coef: [0, 0, 1] },
        { label: 'f(x) = x³', coef: [0, 0, 0, 1] },
        { label: 'f(x) = x³ - 3x', coef: [0, -3, 0, 1] },
        { label: 'f(x) = 2x² + 3x + 1', coef: [1, 3, 2] }
      ];
      let coef = examples[2].coef;

      const selRow = document.createElement('div'); selRow.className = 'control-row';
      const sel = document.createElement('select');
      examples.forEach((ex, i) => {
        const opt = document.createElement('option');
        opt.value = i; opt.textContent = ex.label;
        if (i === 2) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', function () { coef = examples[Number(sel.value)].coef; redraw(); });
      selRow.appendChild(sel);
      panel.appendChild(selRow);

      const board = JXG.JSXGraph.initBoard('deriv-board', {
        boundingbox: [-5, 8, 5, -8],
        axis: true, showNavigation: false, showCopyright: false
      });

      let tangent = null, pointX = 1, graphFn = null;

      // 用动态函数对象实现切换示例（避免反复销毁/重建整个画板）
      graphFn = board.create('functiongraph', [function (x) { return SCI.mathx.polyEval(coef, x); }],
        { strokeColor: '#2563eb', strokeWidth: 2 });
      const tanA = board.create('point', [0, 0], { visible: false, fixed: true });
      const tanB = board.create('point', [1, 1], { visible: false, fixed: true });
      tangent = board.create('segment', [tanA, tanB], { strokeColor: '#dc2626', strokeWidth: 2 });

      function redraw() {
        board.update(); // functiongraph 闭包引用 coef，刷新即可
        update();
      }

      const slider = UI.slider(panel, '切点 x₀', -4, 4, 0.05, pointX, function (v) { pointX = v; update(); });

      function update() {
        try {
          const M = SCI.mathx;
          const y0 = M.polyEval(coef, pointX);
          const k = M.polyDerivAt(coef, pointX);
          // 切线：y - y0 = k(x - x0)，用锚点定位线段
          tanA.moveTo([pointX, y0], 50);
          tanB.moveTo([pointX + 1, y0 + k], 50);
          formulaDiv.innerHTML = '';
          UI.texBlock(formulaDiv, "f'(x_0) = \\lim_{\\Delta x\\to 0}\\frac{f(x_0+\\Delta x)-f(x_0)}{\\Delta x} = k_{\\text{切线}}");
          readoutDiv.innerHTML = '';
          UI.readout(readoutDiv, [
            ['切点', '(' + UI.fmt(pointX, 2) + ', ' + UI.fmt(y0) + ')'],
            ["导数值 f'(x₀)", UI.fmt(k, 4)],
            ['切线方程', 'y = ' + UI.fmt(k, 2) + '(x - ' + UI.fmt(pointX, 2) + ') + ' + UI.fmt(y0)],
            ['函数趋势', k > 0.001 ? '上升（f\' > 0）' : k < -0.001 ? '下降（f\' < 0）' : '可能是极值点（f\' ≈ 0）']
          ]);
        } catch (e) {
          readoutDiv.innerHTML = '';
          UI.showError(readoutDiv, e);
        }
      }

      const hint = document.createElement('div'); hint.className = 'note';
      hint.textContent = '试试 f(x)=x³-3x：把切点滑到斜率接近 0 的位置，那里就是极值点。';
      panel.appendChild(hint);

      redraw();
    }
  });
})();
