/* shm-spring.js — 简谐运动：弹簧振子（高中）
 * 动画 + x-t 图像实时绘制；周期由引擎公式 T=2π√(m/k) 计算。
 */
(function () {
  App.register({
    id: 'shm-spring',
    title: '简谐运动：弹簧振子',
    subject: 'physics',
    stage: '高中',
    desc: '改变质量与劲度系数，观察振幅不变时周期的变化，理解 T = 2π√(m/k)。',
    render: function (root) {
      const page = document.createElement('div'); page.className = 'module-page';
      const left = document.createElement('div');
      const right = document.createElement('div');
      page.appendChild(left); page.appendChild(right);
      root.appendChild(page);

      const viz = document.createElement('div'); viz.className = 'viz-card';
      viz.innerHTML = '<h3>振子与 x-t 图像</h3>';
      const wrap = document.createElement('div'); wrap.className = 'canvas-wrap';
      const canvas = document.createElement('canvas');
      wrap.appendChild(canvas);
      viz.appendChild(wrap);
      left.appendChild(viz);

      const readCard = document.createElement('div'); readCard.className = 'viz-card';
      const formulaDiv = document.createElement('div');
      readCard.appendChild(formulaDiv);
      const readoutDiv = document.createElement('div');
      readCard.appendChild(readoutDiv);
      left.appendChild(readCard);

      const panel = document.createElement('div'); panel.className = 'panel';
      panel.innerHTML = '<h3>参数调节</h3>';
      right.appendChild(panel);

      const W = 520, H = 340;
      const ctx = UI.setupCanvas(canvas, W, H);
      let m = 1, k = 4 * Math.PI * Math.PI, A = 80; // 默认 T=1s
      let t = 0, playing = true, lastTs = null;
      const history = [];

      function draw() {
        ctx.clearRect(0, 0, W, H);
        const omega = SCI.physx.shmOmega(SCI.physx.springPeriod(m, k));
        const x = SCI.physx.shmX(A, omega, t, 0);

        // 上：振子
        const cy = 70, wallX = 40, eqX = W / 2;
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(wallX - 10, cy - 40, 10, 80);
        // 弹簧（折线）
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
        ctx.beginPath();
        const bx = eqX + x;
        const n = 12;
        ctx.moveTo(wallX, cy);
        for (let i = 1; i <= n; i++) {
          const px = wallX + (bx - 30 - wallX) * i / n;
          ctx.lineTo(px, cy + (i % 2 === 0 ? -12 : 12) * (i < n ? 1 : 0));
        }
        ctx.lineTo(bx - 30, cy);
        ctx.stroke();
        // 滑块
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(bx - 30, cy - 25, 60, 50);
        // 平衡位置
        ctx.strokeStyle = '#f59e0b'; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(eqX, 20); ctx.lineTo(eqX, 130); ctx.stroke();
        ctx.setLineDash([]);

        // 下：x-t 图
        const gy = 250, gh = 70;
        ctx.strokeStyle = '#cbd5e1';
        ctx.beginPath(); ctx.moveTo(40, gy); ctx.lineTo(W - 20, gy); ctx.stroke();
        history.push({ t: t, x: x });
        while (history.length > 600) history.shift();
        const T = SCI.physx.springPeriod(m, k);
        const windowT = 4 * T;
        ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        history.forEach(function (p, i) {
          const px = 40 + (W - 70) * (1 - (t - p.t) / windowT);
          const py = gy - p.x / A * gh * 0.8;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }

      function frame(ts) {
        if (st.playing) {
          if (lastTs === null) lastTs = ts;
          t += (ts - lastTs) / 1000 * Anim.speed;
          lastTs = ts;
          draw();
          updateReadout();
        } else {
          lastTs = null;
        }
        window.requestAnimationFrame(frame);
      }

      function updateReadout() {
        try {
          const T = SCI.physx.springPeriod(m, k);
          const omega = SCI.physx.shmOmega(T);
          const x = SCI.physx.shmX(A / 80, omega, t, 0); // 归一化振幅显示
          readoutDiv.innerHTML = '';
          UI.readout(readoutDiv, [
            ['质量 m', UI.fmt(m, 2) + ' kg'],
            ['劲度系数 k', UI.fmt(k, 1) + ' N/m'],
            ['周期 T = 2π√(m/k)', UI.fmt(T, 3) + ' s'],
            ['频率 f', UI.fmt(1 / T, 3) + ' Hz'],
            ['当前位移', UI.fmt(x, 3) + ' ×A']
          ]);
        } catch (e) { UI.showError(readoutDiv, e); }
      }

      UI.slider(panel, '质量 m (kg)', 0.2, 5, 0.1, m, function (v) {
        Voice.param('质量', v > m ? 'up' : 'down'); m = v;
      });
      UI.slider(panel, '劲度系数 k (N/m)', 5, 200, 1, Math.round(k), function (v) { k = v; });
      const st = { playing: true, loop: true };
      UI.animControls(panel, st);

      formulaDiv.innerHTML = '';
      UI.texBlock(formulaDiv, 'T = 2\\pi\\sqrt{\\frac{m}{k}},\\quad x = A\\cos(\\omega t)');
      const hint = document.createElement('div'); hint.className = 'note';
      hint.textContent = '黄金用例：m=1kg、k=4π² N/m 时 T=1.000s。增大质量周期变长，增大劲度系数周期变短。';
      panel.appendChild(hint);

      draw();
      window.requestAnimationFrame(frame);
    }
  });
})();
