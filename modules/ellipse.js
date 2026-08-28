/* ellipse.js — 椭圆及其几何性质（高中）
 * 滑块调 a、b，实时显示焦点、离心率；引擎保证 a>b>0。
 */
(function () {
  App.register({
    id: 'ellipse',
    title: '椭圆：焦点与离心率',
    subject: 'math',
    stage: '高中',
    desc: '调整 a、b，观察焦点位置与离心率如何变化，理解"越扁离心率越大"。',
    render: function (root) {
      const page = document.createElement('div'); page.className = 'module-page';
      const left = document.createElement('div');
      const right = document.createElement('div');
      page.appendChild(left); page.appendChild(right);
      root.appendChild(page);

      const viz = document.createElement('div'); viz.className = 'viz-card';
      viz.innerHTML = '<h3>椭圆图像（焦点在 x 轴）</h3>';
      const boardDiv = document.createElement('div');
      boardDiv.id = 'ellipse-board';
      boardDiv.style.height = '360px';
      viz.appendChild(boardDiv);
      left.appendChild(viz);

      const panel = document.createElement('div'); panel.className = 'panel';
      panel.innerHTML = '<h3>半轴调节</h3>';
      right.appendChild(panel);
      const readoutDiv = document.createElement('div');
      panel.appendChild(readoutDiv);

      const board = JXG.JSXGraph.initBoard('ellipse-board', {
        boundingbox: [-7, 5, 7, -5],
        axis: true, showNavigation: false, showCopyright: false
      });

      let a = 5, b = 3;

      // 持久化曲线对象：通过更新 dataX/dataY 重绘，避免销毁重建画板
      const dataX = [], dataY = [];
      for (let i = 0; i <= 120; i++) {
        const th = i / 120 * 2 * Math.PI;
        dataX.push(Math.cos(th)); dataY.push(Math.sin(th));
      }
      const ellipseCurve = board.create('curve', [dataX, dataY],
        { strokeColor: '#2563eb', strokeWidth: 2 });
      const f1 = board.create('point', [0, 0], { name: 'F₁', color: '#dc2626', size: 2, fixed: true });
      const f2 = board.create('point', [0, 0], { name: 'F₂', color: '#dc2626', size: 2, fixed: true });

      function update() {
        try {
          const info = SCI.mathx.ellipseInfo(a, b);
          // 用引擎的椭圆点公式重算曲线数据
          for (let i = 0; i <= 120; i++) {
            const p = SCI.mathx.ellipsePoint(a, b, i / 120 * 2 * Math.PI);
            dataX[i] = p[0]; dataY[i] = p[1];
          }
          board.update();
          f1.moveTo([-info.c, 0], 50);
          f2.moveTo([info.c, 0], 50);

          readoutDiv.innerHTML = '';
          UI.texInline(readoutDiv, '\\frac{x^2}{' + a + '^2}+\\frac{y^2}{' + b + '^2}=1');
          UI.readout(readoutDiv, [
            ['长半轴 a', UI.fmt(a)],
            ['短半轴 b', UI.fmt(b)],
            ['半焦距 c = √(a²-b²)', UI.fmt(info.c, 4)],
            ['焦点', '(±' + UI.fmt(info.c, 3) + ', 0)'],
            ['离心率 e = c/a', UI.fmt(info.e, 4)],
            ['形状', info.e < 0.3 ? '接近圆' : info.e < 0.7 ? '适中' : '较扁']
          ]);
        } catch (e) {
          readoutDiv.innerHTML = '';
          UI.showError(readoutDiv, e);
        }
      }

      UI.slider(panel, '长半轴 a', 1, 6, 0.1, a, function (v) { a = v; if (a <= b) b = Math.max(0.5, a - 0.1); bSlider.setValue(b); update(); });
      var bSlider = UI.slider(panel, '短半轴 b', 0.5, 6, 0.1, b, function (v) { b = v; if (b >= a) b = a - 0.1; update(); });

      const hint = document.createElement('div'); hint.className = 'note';
      hint.textContent = 'e 越接近 1 椭圆越扁，越接近 0 越接近圆。引擎强制 a>b>0，违反时自动拦截并提示。';
      panel.appendChild(hint);

      update();
    }
  });
})();
