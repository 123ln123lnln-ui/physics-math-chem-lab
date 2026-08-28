/* pythagoras.js — 勾股定理：面积拼图（初中）
 * 三个正方形面积 a²+b²=c² 实时可视化，勾股数彩蛋。
 */
(function () {
  App.register({
    id: 'pythagoras',
    title: '勾股定理：a² + b² = c²',
    subject: 'math',
    stage: '初中',
    desc: '直角边上的两个正方形面积之和，恰好等于斜边上的正方形面积。',
    intro: '欢迎来到勾股定理。直角三角形两条直角边的平方和，等于斜边的平方。拖动滑块，看三个正方形的面积关系。',
    render: function (root) {
      const page = document.createElement('div'); page.className = 'module-page';
      const left = document.createElement('div');
      const right = document.createElement('div');
      page.appendChild(left); page.appendChild(right);
      root.appendChild(page);

      const viz = document.createElement('div'); viz.className = 'viz-card';
      viz.innerHTML = '<h3>三个正方形（面积即平方）</h3>';
      const wrap = document.createElement('div'); wrap.className = 'canvas-wrap';
      const canvas = document.createElement('canvas');
      wrap.appendChild(canvas); viz.appendChild(wrap);
      left.appendChild(viz);

      const infoCard = document.createElement('div'); infoCard.className = 'viz-card';
      const formulaDiv = document.createElement('div'); infoCard.appendChild(formulaDiv);
      const readoutDiv = document.createElement('div'); infoCard.appendChild(readoutDiv);
      left.appendChild(infoCard);

      const panel = document.createElement('div'); panel.className = 'panel';
      panel.innerHTML = '<h3>直角边调节</h3>';
      right.appendChild(panel);

      const W = 480, H = 420;
      const ctx = UI.setupCanvas(canvas, W, H);
      let a = 3, b = 4;

      function draw() {
        ctx.clearRect(0, 0, W, H);
        try {
          const c = SCI.mathx.pythagorasHypotenuse(a, b);
          // 世界坐标：直角顶点在原点，x 向右，y 向上
          const scale = Math.min(W, H) / (a + b + c) * 0.62;
          const ox = W * 0.42, oy = H * 0.55;
          function T(x, y) { return [ox + x * scale, oy - y * scale]; }
          function poly(pts, fill, stroke) {
            ctx.beginPath();
            pts.forEach(function (p, i) {
              const q = T(p[0], p[1]);
              if (i === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
            });
            ctx.closePath();
            ctx.fillStyle = fill; ctx.fill();
            ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke();
          }
          function label(x, y, text, color) {
            const q = T(x, y);
            ctx.fillStyle = color || '#1e293b';
            ctx.font = 'bold 13px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(text, q[0], q[1]);
          }
          // 三角形
          poly([[0, 0], [a, 0], [0, b]], 'rgba(37,99,235,.25)', '#2563eb');
          // a 边上的正方形（下方）
          poly([[0, 0], [a, 0], [a, -a], [0, -a]], 'rgba(220,38,38,.18)', '#dc2626');
          label(a / 2, -a / 2, 'a²=' + a * a, '#dc2626');
          // b 边上的正方形（左方）
          poly([[0, 0], [0, b], [-b, b], [-b, 0]], 'rgba(5,150,105,.18)', '#059669');
          label(-b / 2, b / 2, 'b²=' + b * b, '#059669');
          // 斜边上的正方形（外侧）
          poly([[a, 0], [0, b], [b, b + a], [a + b, a]], 'rgba(245,158,11,.18)', '#f59e0b');
          label((a + b) / 2 + a / 2, b / 2 + a / 2 + 0.2, 'c²=' + Number((c * c).toFixed(2)), '#b45309');

          formulaDiv.innerHTML = '';
          UI.texBlock(formulaDiv, 'a^2 + b^2 = c^2 \\Rightarrow c = \\sqrt{a^2+b^2}');
          readoutDiv.innerHTML = '';
          const triples = [[3,4,5],[5,12,13],[6,8,10],[8,15,17],[9,12,15],[12,16,20]];
          const isTriple = triples.some(t => (t[0]===a&&t[1]===b)||(t[0]===b&&t[1]===a));
          UI.readout(readoutDiv, [
            ['直角边 a', a + '，面积 a² = ' + a * a],
            ['直角边 b', b + '，面积 b² = ' + b * b],
            ['斜边 c = √(a²+b²)', UI.fmt(c, 4)],
            ['勾股数彩蛋', isTriple ? '🎉 这是经典勾股数！' : '试试 3 和 4']
          ]);
        } catch (e) { UI.showError(readoutDiv, e); }
      }

      UI.slider(panel, '直角边 a', 1, 8, 1, a, function (v) { a = v; draw(); }, { unit: '' });
      UI.slider(panel, '直角边 b', 1, 8, 1, b, function (v) { b = v; draw(); }, { unit: '' });
      const hint = document.createElement('div'); hint.className = 'note';
      hint.textContent = '数一数：红色格子数 + 绿色格子数 = 黄色格子数。这就是勾股定理的面积证明。';
      panel.appendChild(hint);
      draw();
    }
  });
})();
