/* quadratic-function.js — 二次函数参数探究（初中）
 * 交互：滑块调 a, b, c；JSXGraph 实时绘图；读数来自 SCI.mathx（顶点/判别式/根）。
 */
(function () {
  App.register({
    id: 'quadratic-function',
    title: '二次函数 y = ax² + bx + c',
    subject: 'math',
    stage: '初中',
    desc: '拖动 a、b、c，观察开口、顶点、对称轴与实根的实时变化。',
    render: function (root) {
      const page = document.createElement('div'); page.className = 'module-page';
      const left = document.createElement('div');
      const right = document.createElement('div');
      page.appendChild(left); page.appendChild(right);
      root.appendChild(page);

      const viz = document.createElement('div'); viz.className = 'viz-card';
      viz.innerHTML = '<h3>函数图像</h3>';
      const boardDiv = document.createElement('div');
      boardDiv.id = 'quad-board';
      boardDiv.style.height = '380px';
      viz.appendChild(boardDiv);
      left.appendChild(viz);

      const formulaCard = document.createElement('div'); formulaCard.className = 'viz-card';
      formulaCard.innerHTML = '<h3>解析式与关键量</h3>';
      const formulaDiv = document.createElement('div');
      formulaCard.appendChild(formulaDiv);
      const readoutDiv = document.createElement('div');
      formulaCard.appendChild(readoutDiv);
      left.appendChild(formulaCard);

      const panel = document.createElement('div'); panel.className = 'panel';
      panel.innerHTML = '<h3>参数调节</h3>';
      right.appendChild(panel);

      const board = JXG.JSXGraph.initBoard('quad-board', {
        boundingbox: [-8, 10, 8, -10],
        axis: true, showNavigation: false, showCopyright: false,
        pan: { enabled: true, needTwoFingers: true }, zoom: { wheel: true }
      });

      let a = 1, b = -4, c = 3;

      const fnStr = function () { return a + '*x*x + ' + b + '*x + ' + c; };

      let curve = board.create('functiongraph', [function (x) { return a * x * x + b * x + c; }],
        { strokeColor: '#2563eb', strokeWidth: 2, name: 'y' });
      let vertexPt = board.create('point', [0, 0], { name: '顶点', size: 3, face: 'square', color: '#dc2626' });
      // 对称轴用两个隐藏点 + 线段实现（JSXGraph 的 line/segment 不支持 moveTo）
      let axP1 = board.create('point', [0, -10], { visible: false, fixed: true });
      let axP2 = board.create('point', [0, 10], { visible: false, fixed: true });
      board.create('segment', [axP1, axP2], { strokeColor: '#94a3b8', dash: 2, strokeWidth: 1, fixed: true });
      // 实根点（预创建两个，按需显隐）
      let rootPt1 = board.create('point', [0, 0], { name: '', size: 3, color: '#059669', visible: false });
      let rootPt2 = board.create('point', [0, 0], { name: '', size: 3, color: '#059669', visible: false });

      function update() {
        try {
          const M = SCI.mathx;
          const v = M.quadraticVertex(a, b, c);
          const d = M.quadraticDiscriminant(a, b, c);
          const roots = M.quadraticRoots(a, b, c);

          vertexPt.moveTo([v.x, v.y], 100);
          axP1.moveTo([v.x, -10], 100);
          axP2.moveTo([v.x, 10], 100);

          rootPt1.setAttribute({ visible: false });
          rootPt2.setAttribute({ visible: false });
          if (roots.type === 'two') {
            rootPt1.moveTo([roots.roots[0], 0], 100); rootPt1.setAttribute({ visible: true });
            rootPt2.moveTo([roots.roots[1], 0], 100); rootPt2.setAttribute({ visible: true });
          } else if (roots.type === 'one') {
            rootPt1.moveTo([roots.roots[0], 0], 100); rootPt1.setAttribute({ visible: true });
          }

          formulaDiv.innerHTML = '';
          UI.texBlock(formulaDiv, 'y = ' + a + 'x^2 ' + (b >= 0 ? '+ ' + b : '- ' + Math.abs(b)) + 'x ' + (c >= 0 ? '+ ' + c : '- ' + Math.abs(c)));
          UI.texBlock(formulaDiv, '\\text{顶点 }\\left(' + UI.fmt(v.x) + ',\\ ' + UI.fmt(v.y) + '\\right),\\quad \\Delta = ' + UI.fmt(d));

          const rows = [
            ['开口方向', a > 0 ? '向上 (a>0)' : '向下 (a<0)'],
            ['对称轴', 'x = ' + UI.fmt(v.x)],
            ['顶点', '(' + UI.fmt(v.x) + ', ' + UI.fmt(v.y) + ')'],
            ['判别式 Δ', UI.fmt(d)],
            ['与 x 轴交点', roots.type === 'two'
              ? 'x₁=' + UI.fmt(roots.roots[0]) + ', x₂=' + UI.fmt(roots.roots[1])
              : roots.type === 'one' ? 'x=' + UI.fmt(roots.roots[0]) + '（相切）' : '无交点']
          ];
          readoutDiv.innerHTML = '';
          UI.readout(readoutDiv, rows);
        } catch (e) {
          readoutDiv.innerHTML = '';
          UI.showError(readoutDiv, e);
        }
      }

      UI.slider(panel, 'a（开口大小与方向）', -5, 5, 0.1, a, function (v) {
        Voice.param('大小', Math.abs(v) > Math.abs(a) ? 'up' : 'down'); a = v; if (a === 0) a = 0.1; update();
      });
      UI.slider(panel, 'b', -10, 10, 0.5, b, function (v) { b = v; update(); });
      UI.slider(panel, 'c（与 y 轴交点）', -8, 8, 0.5, c, function (v) { c = v; update(); });

      const hint = document.createElement('div'); hint.className = 'note';
      hint.textContent = '规律：|a| 越大开口越小；a、b 同号对称轴在 y 轴左侧；Δ 决定与 x 轴交点个数。试试把 a 调到负数看看。';
      panel.appendChild(hint);

      update();
    }
  });
})();
