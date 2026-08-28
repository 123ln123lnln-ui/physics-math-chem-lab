/* linear-function.js — 一次函数 y = kx + b（初中） */
(function () {
  App.register({
    id: 'linear-function',
    title: '一次函数 y = kx + b',
    subject: 'math',
    stage: '初中',
    desc: '斜率决定倾斜程度，截距决定位置。观察它们如何影响直线。',
    intro: '欢迎来到一次函数。斜率 k 决定直线的倾斜程度，截距 b 决定它穿过 y 轴的位置。',
    render: function (root) {
      const page = document.createElement('div'); page.className = 'module-page';
      const left = document.createElement('div');
      const right = document.createElement('div');
      page.appendChild(left); page.appendChild(right);
      root.appendChild(page);

      const viz = document.createElement('div'); viz.className = 'viz-card';
      viz.innerHTML = '<h3>函数图像</h3>';
      const boardDiv = document.createElement('div');
      boardDiv.id = 'linear-board';
      boardDiv.style.height = '380px';
      viz.appendChild(boardDiv);
      left.appendChild(viz);

      const panel = document.createElement('div'); panel.className = 'panel';
      panel.innerHTML = '<h3>参数调节</h3>';
      const readoutDiv = document.createElement('div');
      panel.appendChild(readoutDiv);
      right.appendChild(panel);

      const board = JXG.JSXGraph.initBoard('linear-board', {
        boundingbox: [-8, 8, 8, -8],
        axis: true, showNavigation: false, showCopyright: false
      });

      let k = 2, b = -4;
      board.create('functiongraph', [function (x) { return k * x + b; }],
        { strokeColor: '#2563eb', strokeWidth: 2 });
      const yIntPt = board.create('point', [0, b], { name: '', size: 3, color: '#059669', fixed: true });
      const xIntPt = board.create('point', [0, 0], { name: '', size: 3, color: '#dc2626', fixed: true });

      function update() {
        try {
          const info = SCI.mathx.linearInfo(k, b);
          yIntPt.moveTo([0, info.yIntercept], 80);
          if (info.xIntercept !== null) {
            xIntPt.moveTo([info.xIntercept, 0], 80);
            xIntPt.setAttribute({ visible: true });
          } else {
            xIntPt.setAttribute({ visible: false });
          }
          board.update();
          readoutDiv.innerHTML = '';
          UI.texInline(readoutDiv, 'y = ' + k + 'x ' + (b >= 0 ? '+ ' + b : '- ' + Math.abs(b)));
          UI.readout(readoutDiv, [
            ['斜率 k', UI.fmt(k)],
            ['y 轴截距 (0, b)', '(0, ' + UI.fmt(b) + ')'],
            ['x 轴截距', info.xIntercept === null ? '无（k=0 时与 x 轴平行）' : '(' + UI.fmt(info.xIntercept) + ', 0)'],
            ['倾斜角', UI.fmt(info.angleDeg, 1) + '°'],
            ['增减性', k > 0 ? 'y 随 x 增大而增大' : k < 0 ? 'y 随 x 增大而减小' : '常函数']
          ]);
        } catch (e) { readoutDiv.innerHTML = ''; UI.showError(readoutDiv, e); }
      }

      UI.slider(panel, '斜率 k', -5, 5, 0.1, k, function (v) { k = v; update(); });
      UI.slider(panel, '截距 b', -6, 6, 0.5, b, function (v) { b = v; update(); });
      const hint = document.createElement('div'); hint.className = 'note';
      hint.textContent = '生活案例：出租车计费（起步价 + 每公里单价）就是一次函数：费用 = 单价×里程 + 起步价。';
      panel.appendChild(hint);
      update();
    }
  });
})();
