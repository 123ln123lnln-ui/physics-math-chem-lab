/* trig-unit-circle.js — 单位圆与三角函数（高中）
 * 拖动单位圆上的点，实时读取 sin、cos、tan（引擎计算，90°/270° 自动判定不存在）。
 */
(function () {
  App.register({
    id: 'trig-unit-circle',
    title: '单位圆与三角函数线',
    subject: 'math',
    stage: '高中',
    desc: '拖动角 α 的终边，观察正弦线、余弦线与正切线的几何意义。',
    render: function (root) {
      const page = document.createElement('div'); page.className = 'module-page';
      const left = document.createElement('div');
      const right = document.createElement('div');
      page.appendChild(left); page.appendChild(right);
      root.appendChild(page);

      const viz = document.createElement('div'); viz.className = 'viz-card';
      viz.innerHTML = '<h3>单位圆（拖动红色点）</h3>';
      const boardDiv = document.createElement('div');
      boardDiv.id = 'trig-board';
      boardDiv.style.height = '400px';
      viz.appendChild(boardDiv);
      left.appendChild(viz);

      const panel = document.createElement('div'); panel.className = 'panel';
      panel.innerHTML = '<h3>角度调节</h3>';
      right.appendChild(panel);
      const readoutDiv = document.createElement('div');
      panel.appendChild(readoutDiv);

      const board = JXG.JSXGraph.initBoard('trig-board', {
        boundingbox: [-2.2, 2.2, 2.2, -2.2],
        axis: true, showNavigation: false, showCopyright: false
      });
      board.create('circle', [[0, 0], 1], { strokeColor: '#94a3b8', fixed: true });

      let deg = 40;
      function toRad() { return deg * Math.PI / 180; }

      const P = board.create('point', [Math.cos(toRad()), Math.sin(toRad())], {
        name: 'P', color: '#dc2626', size: 3
      });
      P.on('drag', function () {
        const x = P.X(), y = P.Y();
        deg = Math.atan2(y, x) * 180 / Math.PI;
        if (deg < 0) deg += 360;
        deg = Math.round(deg * 10) / 10;
        slider.setValue(deg);
        update();
      });

      // 三角函数线：用隐藏锚点驱动线段（JSXGraph 的 segment 无 moveTo）
      const sinA = board.create('point', [0, 0], { visible: false, fixed: true });
      const sinB = board.create('point', [0, 0], { visible: false, fixed: true });
      const sinSeg = board.create('segment', [sinA, sinB], { strokeColor: '#2563eb', strokeWidth: 3, name: 'sin' });
      const cosB = board.create('point', [0, 0], { visible: false, fixed: true });
      const cosSeg = board.create('segment', [[0, 0], cosB], { strokeColor: '#059669', strokeWidth: 3 });
      const radiusSeg = board.create('segment', [[0, 0], P], { strokeColor: '#dc2626', strokeWidth: 1.5 });
      const arc = board.create('angle', [[1, 0], [0, 0], P], { radius: 0.35, orthoType: 'square', strokeColor: '#f59e0b' });

      const slider = UI.slider(panel, 'α（角度制）', 0, 360, 1, deg, function (v) {
        deg = v;
        P.moveTo([Math.cos(toRad()), Math.sin(toRad())], 50);
        update();
      });

      function update() {
        try {
          const t = SCI.mathx.trigFromDeg(deg);
          const x = t.cos, y = t.sin;
          sinA.moveTo([x, 0], 50); sinB.moveTo([x, y], 50);  // 正弦线（竖直线段）
          cosB.moveTo([x, 0], 50);                            // 余弦线
          readoutDiv.innerHTML = '';
          const rows = [
            ['α', UI.fmt(deg, 1) + '° = ' + UI.fmt(t.rad, 4) + ' rad'],
            ['sin α', UI.fmt(t.sin, 4)],
            ['cos α', UI.fmt(t.cos, 4)],
            ['tan α', t.tan === null ? '不存在（α=90°或270°）' : UI.fmt(t.tan, 4)]
          ];
          UI.readout(readoutDiv, rows);
        } catch (e) {
          readoutDiv.innerHTML = '';
          UI.showError(readoutDiv, e);
        }
      }

      const hint = document.createElement('div'); hint.className = 'note';
      hint.textContent = '蓝色竖直线段 = sinα，绿色水平线段 = cosα。当终边落在 y 轴上时，tanα 不存在。';
      panel.appendChild(hint);

      update();
    }
  });
})();
