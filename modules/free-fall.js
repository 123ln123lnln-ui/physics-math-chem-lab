/* free-fall.js — 自由落体与竖直上抛（高中）
 * Canvas 动画 + 引擎公式；支持播放/暂停/重置，实时读数。
 */
(function () {
  App.register({
    id: 'free-fall',
    title: '自由落体与竖直上抛',
    subject: 'physics',
    stage: '高中',
    desc: '设定高度与初速度，观察下落/上升过程，验证 h = ½gt² 与 v = √(2gh)。',
    render: function (root) {
      const page = document.createElement('div'); page.className = 'module-page';
      const left = document.createElement('div');
      const right = document.createElement('div');
      page.appendChild(left); page.appendChild(right);
      root.appendChild(page);

      const viz = document.createElement('div'); viz.className = 'viz-card';
      viz.innerHTML = '<h3>运动动画</h3>';
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

      const W = 320, H = 400, margin = 40;
      const ctx = UI.setupCanvas(canvas, W, H);

      let h0 = 4.9, v0 = 0; // v0>0 为竖直上抛（从地面起）
      let t = 0, playing = false, raf = null, lastTs = null;

      const g = SCI.CONST.g;

      function currentY() {
        if (v0 === 0) return h0 - 0.5 * g * t * t;       // 自由落体（从 h0 下落）
        return v0 * t - 0.5 * g * t * t;                 // 竖直上抛（从地面起）
      }
      function currentV() {
        return (v0 === 0 ? -g * t : v0 - g * t);
      }
      function maxT() {
        if (v0 === 0) return SCI.physx.freeFallTime(h0);
        return 2 * v0 / g;
      }

      function draw() {
        ctx.clearRect(0, 0, W, H);
        // 地面
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(0, H - margin, W, margin);
        // 标尺
        const scale = (H - 2 * margin) / Math.max(h0, v0 > 0 ? SCI.physx.verticalThrowMaxHeight(v0) : h0, 1);
        ctx.strokeStyle = '#cbd5e1';
        ctx.beginPath(); ctx.moveTo(margin, margin); ctx.lineTo(margin, H - margin); ctx.stroke();
        // 小球
        const y = currentY();
        const px = W / 2;
        const py = H - margin - y * scale;
        ctx.fillStyle = '#dc2626';
        ctx.beginPath(); ctx.arc(px, Math.max(margin - 20, Math.min(py, H - margin)), 12, 0, Math.PI * 2); ctx.fill();
        // 高度标注
        ctx.fillStyle = '#475569';
        ctx.font = '12px sans-serif';
        ctx.fillText('h = ' + UI.fmt(Math.max(0, y), 2) + ' m', px + 20, py);
      }

      function frame(ts) {
        if (playing) {
          if (lastTs === null) lastTs = ts;
          t += (ts - lastTs) / 1000;
          lastTs = ts;
          if (t >= maxT()) { t = maxT(); playing = false; }
          draw();
          updateReadout();
        }
        raf = window.requestAnimationFrame(frame);
      }

      function updateReadout() {
        try {
          const y = currentY(), v = currentV();
          readoutDiv.innerHTML = '';
          UI.readout(readoutDiv, [
            ['时间 t', UI.fmt(t, 2) + ' s'],
            ['高度 h', UI.fmt(Math.max(0, y), 2) + ' m'],
            ['速度 |v|', UI.fmt(Math.abs(v), 2) + ' m/s'],
            ['落地/回落时间', UI.fmt(maxT(), 3) + ' s'],
            ['落地速度', v0 === 0 ? UI.fmt(SCI.physx.freeFallVelocity(h0), 2) + ' m/s' : UI.fmt(v0, 2) + ' m/s（对称）']
          ]);
        } catch (e) { UI.showError(readoutDiv, e); }
      }

      UI.slider(panel, '初始高度 h₀ (m)', 1, 20, 0.1, h0, function (v) { h0 = v; reset(); });
      UI.slider(panel, '初速度 v₀ (m/s，0=自由落体)', 0, 30, 1, v0, function (v) { v0 = v; reset(); });

      const btnRow = document.createElement('div'); btnRow.className = 'btn-row';
      const playBtn = document.createElement('button'); playBtn.className = 'btn'; playBtn.textContent = '播放';
      const resetBtn = document.createElement('button'); resetBtn.className = 'btn secondary'; resetBtn.textContent = '重置';
      playBtn.addEventListener('click', function () { playing = !playing; playBtn.textContent = playing ? '暂停' : '播放'; });
      resetBtn.addEventListener('click', reset);
      btnRow.appendChild(playBtn); btnRow.appendChild(resetBtn);
      panel.appendChild(btnRow);

      function reset() { t = 0; playing = false; playBtn.textContent = '播放'; lastTs = null; draw(); updateReadout(); }

      formulaDiv.innerHTML = '';
      UI.texBlock(formulaDiv, 'h = \\tfrac{1}{2}gt^2,\\quad v = \\sqrt{2gh},\\quad g = 9.8\\ \\text{N/kg}');
      const hint = document.createElement('div'); hint.className = 'note';
      hint.textContent = '黄金用例验证：h=4.9m 时 t=1.00s，落地速度 9.8 m/s。竖直上抛上升与下落时间对称。';
      panel.appendChild(hint);

      reset();
      raf = window.requestAnimationFrame(frame);
    }
  });
})();
