/* projectile.js — 抛体运动（高中）
 * 调初速度与角度，绘制完整抛物线轨迹 + 动画小球；读数来自引擎。
 */
(function () {
  App.register({
    id: 'projectile',
    title: '抛体运动：射程与最大高度',
    subject: 'physics',
    stage: '高中',
    desc: '调整初速度与发射角，观察轨迹、射程与最大高度，验证 45° 射程最大。',
    render: function (root) {
      const page = document.createElement('div'); page.className = 'module-page';
      const left = document.createElement('div');
      const right = document.createElement('div');
      page.appendChild(left); page.appendChild(right);
      root.appendChild(page);

      const viz = document.createElement('div'); viz.className = 'viz-card';
      viz.innerHTML = '<h3>轨迹（点击播放）</h3>';
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
      panel.innerHTML = '<h3>参数与播放</h3>';
      right.appendChild(panel);

      const W = 520, H = 320, pad = 30;
      const ctx = UI.setupCanvas(canvas, W, H);
      let v0 = 10, theta = 45;
      let t = 0, playing = false, lastTs = null;

      function info() { return SCI.physx.projectile(v0, theta); }

      function draw() {
        ctx.clearRect(0, 0, W, H);
        const inf = info();
        const range = Math.max(inf.range, 0.001), hMax = Math.max(inf.hMax, 0.001);
        const scale = Math.min((W - 2 * pad) / range, (H - 2 * pad) / (hMax * 1.1));
        const ox = pad, oy = H - pad;
        function toPx(x, y) { return [ox + x * scale, oy - y * scale]; }

        // 地面
        ctx.strokeStyle = '#94a3b8';
        ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(W, oy); ctx.stroke();

        // 轨迹
        ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2;
        ctx.beginPath();
        const steps = 80;
        for (let i = 0; i <= steps; i++) {
          const tt = inf.tFlight * i / steps;
          const p = SCI.physx.projectilePoint(v0, theta, tt);
          const [px, py] = toPx(p.x, p.y);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // 当前小球
        const cp = SCI.physx.projectilePoint(v0, theta, t);
        const [bx, by] = toPx(cp.x, Math.max(0, cp.y));
        ctx.fillStyle = '#dc2626';
        ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI * 2); ctx.fill();

        // 最大高度虚线
        const [hx, hy] = toPx(inf.range / 2, inf.hMax);
        ctx.strokeStyle = '#f59e0b'; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(hx, oy); ctx.lineTo(hx, hy); ctx.stroke();
        ctx.setLineDash([]);
      }

      function frame(ts) {
        if (playing) {
          if (lastTs === null) lastTs = ts;
          t += (ts - lastTs) / 1000;
          lastTs = ts;
          const inf = info();
          if (t >= inf.tFlight) { t = inf.tFlight; playing = false; }
          draw();
          updateReadout();
        }
        window.requestAnimationFrame(frame);
      }

      function updateReadout() {
        try {
          const inf = info();
          readoutDiv.innerHTML = '';
          UI.readout(readoutDiv, [
            ['水平分速度 vx', UI.fmt(inf.vx, 2) + ' m/s'],
            ['竖直分速度 vy', UI.fmt(inf.vy, 2) + ' m/s'],
            ['飞行时间', UI.fmt(inf.tFlight, 3) + ' s'],
            ['水平射程', UI.fmt(inf.range, 2) + ' m'],
            ['最大高度', UI.fmt(inf.hMax, 2) + ' m']
          ]);
        } catch (e) { UI.showError(readoutDiv, e); }
      }

      UI.slider(panel, '初速度 v₀ (m/s)', 1, 30, 0.5, v0, function (v) { v0 = v; reset(); });
      UI.slider(panel, '发射角 θ (°)', 0, 90, 1, theta, function (v) { theta = v; reset(); });

      const btnRow = document.createElement('div'); btnRow.className = 'btn-row';
      const playBtn = document.createElement('button'); playBtn.className = 'btn'; playBtn.textContent = '播放';
      const resetBtn = document.createElement('button'); resetBtn.className = 'btn secondary'; resetBtn.textContent = '重置';
      playBtn.addEventListener('click', function () { playing = !playing; playBtn.textContent = playing ? '暂停' : '播放'; });
      resetBtn.addEventListener('click', reset);
      btnRow.appendChild(playBtn); btnRow.appendChild(resetBtn);
      panel.appendChild(btnRow);

      function reset() { t = 0; playing = false; playBtn.textContent = '播放'; lastTs = null; draw(); updateReadout(); }

      formulaDiv.innerHTML = '';
      UI.texBlock(formulaDiv, 'R = \\frac{v_0^2\\sin 2\\theta}{g},\\quad H = \\frac{v_0^2\\sin^2\\theta}{2g}');
      const hint = document.createElement('div'); hint.className = 'note';
      hint.textContent = '实验建议：固定初速度，把角度从 30° 滑到 60°，观察射程在 45° 时最大，且 30° 与 60° 射程相同。';
      panel.appendChild(hint);

      reset();
      window.requestAnimationFrame(frame);
    }
  });
})();
