/* home-demo.js — 首页内嵌交互演示（抛体运动）
 * 目的：打开首页即可动手操作，无需先进入模块页。
 * 纯 Canvas 实现，不依赖 JSXGraph，避免与模块页画板冲突。
 */
(function () {
  const HD = {};

  HD.render = function (container) {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const W = 620, H = 300, pad = 30;
    const ctx = UI.setupCanvas(canvas, W, H);

    const controls = document.createElement('div');
    controls.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:0 24px;margin-top:12px';
    container.appendChild(controls);

    let v0 = 14, theta = 45, t = 0, playing = false, lastTs = null;

    function info() { return SCI.physx.projectile(v0, theta); }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const inf = info();
      const range = Math.max(inf.range, 0.001), hMax = Math.max(inf.hMax, 0.001);
      const scale = Math.min((W - 2 * pad) / range, (H - 2 * pad) / (hMax * 1.15));
      const ox = pad, oy = H - pad;
      function toPx(x, y) { return [ox + x * scale, oy - y * scale]; }

      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(W, oy); ctx.stroke();

      // 轨迹
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) {
        const tt = inf.tFlight * i / 80;
        const p = SCI.physx.projectilePoint(v0, theta, tt);
        const [px, py] = toPx(p.x, p.y);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // 小球
      const cp = SCI.physx.projectilePoint(v0, theta, t);
      const [bx, by] = toPx(cp.x, Math.max(0, cp.y));
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI * 2); ctx.fill();
    }

    function frame(ts) {
      if (st.playing) {
        if (lastTs === null) lastTs = ts;
        t += (ts - lastTs) / 1000 * Anim.speed;
        lastTs = ts;
        if (t >= info().tFlight) {
          if (st.loop) { t = 0; } else { t = info().tFlight; st.playing = false; ctrl.setPlaying(false); }
        }
        draw(); updateReadout();
      } else {
        lastTs = null;
      }
      window.requestAnimationFrame(frame);
    }

    const readoutDiv = document.createElement('div');
    function updateReadout() {
      try {
        const inf = info();
        readoutDiv.innerHTML = '';
        UI.readout(readoutDiv, [
          ['水平射程', UI.fmt(inf.range, 2) + ' m'],
          ['最大高度', UI.fmt(inf.hMax, 2) + ' m'],
          ['飞行时间', UI.fmt(inf.tFlight, 2) + ' s']
        ]);
      } catch (e) { readoutDiv.innerHTML = ''; UI.showError(readoutDiv, e); }
    }

    // 播放控制（先声明，reset 依赖）
    const st = { playing: false, loop: false };
    const ctrl = UI.animControls(container, st);

    function reset() { t = 0; st.playing = false; ctrl.setPlaying(false); lastTs = null; draw(); updateReadout(); }

    UI.slider(controls, '初速度 v₀ (m/s)', 5, 30, 0.5, v0, function (v) {
      if (window.Voice) Voice.param('初速度', v > v0 ? 'up' : 'down');
      v0 = v; reset();
    });
    UI.slider(controls, '发射角 θ (°)', 10, 80, 1, theta, function (v) {
      if (window.Voice) Voice.param('角度', v > theta ? 'up' : 'down');
      theta = v; reset();
    });
    const tip = document.createElement('span');
    tip.style.cssText = 'font-size:12.5px;color:#64748b';
    tip.textContent = '试试：固定初速度，角度调到 45° 射程最大';
    ctrl.el.appendChild(tip);
    container.appendChild(readoutDiv);

    reset();
    window.requestAnimationFrame(frame);
  };

  window.HomeDemo = HD;
})(window);
