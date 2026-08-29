/* explore-anim.js — 资料篇动画引擎（真实数学/物理模拟） */
(function () {
  const AN = {};

  function mkCanvas(holder, w, h, dark) {
    const c = document.createElement('canvas');
    c.style.cssText = 'width:100%;max-width:' + w + 'px;border-radius:8px;display:block;background:' + (dark ? '#0f172a' : '#fff');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = w * dpr; c.height = h * dpr;
    const ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    holder.appendChild(c);
    return { c: c, ctx: ctx, w: w, h: h };
  }

  /* 双摆混沌：两个初始仅差 0.001 rad 的双摆并排演示蝴蝶效应 */
  AN.pendulum = function (holder) {
    const V = mkCanvas(holder, 360, 300, true);
    const ctx = V.ctx;
    const l1 = 78, l2 = 78, m1 = 10, m2 = 10, G = 0.4;
    function mkP(d) { return { th1: Math.PI / 2, th2: Math.PI / 2 + d, w1: 0, w2: 0, trail: [] }; }
    const A = mkP(0), B = mkP(0.001);
    function step(P) {
      for (let i = 0; i < 4; i++) {
        const dt = 0.1;
        const num = -G * (2 * m1 + m2) * Math.sin(P.th1) - m2 * G * Math.sin(P.th1 - 2 * P.th2) - 2 * Math.sin(P.th1 - P.th2) * m2 * (P.w2 * P.w2 * l2 + P.w1 * P.w1 * l1 * Math.cos(P.th1 - P.th2));
        const den = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * P.th1 - 2 * P.th2));
        const a1 = num / den;
        const num2 = 2 * Math.sin(P.th1 - P.th2) * (P.w1 * P.w1 * l1 * (m1 + m2) + G * (m1 + m2) * Math.cos(P.th1) + P.w2 * P.w2 * l2 * m2 * Math.cos(P.th1 - P.th2));
        const den2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * P.th1 - 2 * P.th2));
        const a2 = num2 / den2;
        P.w1 += a1 * dt; P.w2 += a2 * dt;
        P.th1 += P.w1 * dt; P.th2 += P.w2 * dt;
      }
    }
    function pos(P) {
      const cx = V.w / 2, cy = 105;
      const x1 = cx + l1 * Math.sin(P.th1), y1 = cy + l1 * Math.cos(P.th1);
      return [cx, cy, x1, y1, x1 + l2 * Math.sin(P.th2), y1 + l2 * Math.cos(P.th2)];
    }
    function drawP(P, col, colA) {
      const q = pos(P);
      P.trail.push([q[4], q[5]]);
      if (P.trail.length > 140) P.trail.shift();
      for (let i = 1; i < P.trail.length; i++) {
        ctx.strokeStyle = colA + (i / P.trail.length * 0.55).toFixed(2) + ')';
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(P.trail[i - 1][0], P.trail[i - 1][1]); ctx.lineTo(P.trail[i][0], P.trail[i][1]); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(226,232,240,.85)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[2], q[3]); ctx.lineTo(q[4], q[5]); ctx.stroke();
      ctx.shadowColor = col; ctx.shadowBlur = 14;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(q[2], q[3], 6.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(q[4], q[5], 7, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      return q;
    }
    (function loop() {
      step(A); step(B);
      ctx.fillStyle = 'rgba(15,23,42,.3)'; ctx.fillRect(0, 0, V.w, V.h);
      const qa = drawP(A, '#38bdf8', 'rgba(56,189,248,');
      const qb = drawP(B, '#fb923c', 'rgba(251,146,60,');
      const sep = Math.hypot(qa[4] - qb[4], qa[5] - qb[5]);
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, V.h - 22, V.w, 22);
      ctx.fillStyle = sep > 50 ? '#fbbf24' : '#94a3b8'; ctx.font = '11px sans-serif';
      ctx.fillText('两摆初始仅差 0.001 rad · 末端相距 ' + sep.toFixed(1) + ' px' + (sep > 50 ? ' —— 已彻底分道扬镳' : ''), 8, V.h - 8);
      ctx.fillStyle = '#38bdf8'; ctx.fillText('● 摆 A', 8, 16);
      ctx.fillStyle = '#fb923c'; ctx.fillText('● 摆 B（初始 +0.001）', 62, 16);
      window.requestAnimationFrame(loop);
    })();
  };

  /* 洛伦兹吸引子：缓慢旋转的 3D 投影，颜色编码瞬时速度 */
  AN.lorenz = function (holder) {
    const V = mkCanvas(holder, 360, 300, true);
    const ctx = V.ctx;
    let x = 0.1, y = 0, z = 0;
    const s = 10, r = 28, b = 8 / 3;
    const pts = [];
    function step() {
      const dt = 0.004;
      const dx = s * (y - x), dy = x * (r - z) - y, dz = x * y - b * z;
      x += dx * dt; y += dy * dt; z += dz * dt;
      pts.push([x, y, z, Math.sqrt(dx * dx + dy * dy + dz * dz)]);
    }
    for (let i = 0; i < 900; i++) step(); // 预跑：首帧即见蝴蝶形，不再从空线开始
    let rot = 0;
    (function loop() {
      for (let i = 0; i < 30; i++) step();
      while (pts.length > 2000) pts.shift();
      rot += 0.004;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const ca = Math.cos(rot), sa = Math.sin(rot);
      for (let i = 1; i < pts.length; i++) {
        const p0 = pts[i - 1], p1 = pts[i];
        const xr0 = p0[0] * ca - p0[1] * sa, xr1 = p1[0] * ca - p1[1] * sa;
        const sp = Math.min(1, p1[3] / 130);          // 瞬时速度 0→1
        const hue = 215 - sp * 175;                    // 慢=蓝，快=金红
        const age = i / pts.length;                    // 旧轨迹淡
        ctx.strokeStyle = 'hsla(' + hue.toFixed(0) + ',88%,' + (48 + sp * 18).toFixed(0) + '%,' + (0.12 + 0.55 * age).toFixed(2) + ')';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(V.w / 2 + xr0 * 6.5, V.h - 26 - p0[2] * 5.4);
        ctx.lineTo(V.w / 2 + xr1 * 6.5, V.h - 26 - p1[2] * 5.4);
        ctx.stroke();
      }
      const lp = pts[pts.length - 1];
      const hx = V.w / 2 + (lp[0] * ca - lp[1] * sa) * 6.5, hy = V.h - 26 - lp[2] * 5.4;
      ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 16;
      ctx.fillStyle = '#fde68a';
      ctx.beginPath(); ctx.arc(hx, hy, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, V.h - 22, V.w, 22);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10.5px sans-serif';
      ctx.fillText('颜色 = 瞬时速度（蓝慢 → 金快）· 绕 z 轴缓慢旋转的 3D 投影', 8, V.h - 8);
      window.requestAnimationFrame(loop);
    })();
  };

  /* 曼德博集合 */
  AN.mandelbrot = function (holder) {
    const V = mkCanvas(holder, 360, 280, true);
    const ctx = V.ctx;
    const img = ctx.createImageData(V.w, V.h);
    const cx0 = -2.2, cy0 = -1.2, span = 3.2;
    for (let py = 0; py < V.h; py++) {
      for (let px = 0; px < V.w; px++) {
        const c0 = cx0 + px / V.w * span, c1 = cy0 + py / V.h * (span * V.h / V.w);
        let zr = 0, zi = 0, n = 0;
        while (zr * zr + zi * zi <= 4 && n < 80) {
          const t = zr * zr - zi * zi + c0;
          zi = 2 * zr * zi + c1; zr = t; n++;
        }
        const idx = (py * V.w + px) * 4;
        if (n >= 80) { img.data[idx] = 15; img.data[idx + 1] = 23; img.data[idx + 2] = 42; }
        else {
          img.data[idx] = 30 + n * 2.2; img.data[idx + 1] = 80 + n * 1.6; img.data[idx + 2] = 180 + n;
        }
        img.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif';
    ctx.fillText('z → z² + c 不逃逸的 c 的集合（80 次迭代）', 10, V.h - 8);
  };

  /* 逻辑斯蒂分岔 */
  AN.bifurcation = function (holder) {
    const V = mkCanvas(holder, 360, 260, true);
    const ctx = V.ctx;
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
    for (let px = 0; px < V.w; px++) {
      const r = 2.5 + px / V.w * 1.5;
      let x = 0.5;
      for (let i = 0; i < 200; i++) x = r * x * (1 - x); // 预热
      for (let i = 0; i < 150; i++) {
        x = r * x * (1 - x);
        ctx.fillStyle = 'rgba(56,189,248,.35)';
        ctx.fillRect(px, V.h - 10 - x * (V.h - 25), 1, 1);
      }
    }
    ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif';
    ctx.fillText('r: 2.5 → 4.0 | 从周期到混沌', 10, V.h - 8);
  };

  /* 随机游走：粒子云扩散 + 理论 √t 虚线圆实时对照 */
  AN.walk = function (holder) {
    const V = mkCanvas(holder, 360, 280, true);
    const ctx = V.ctx;
    const cx = V.w / 2, cy = (V.h - 26) / 2;
    const N = 160, particles = [];
    const colors = ['#38bdf8', '#fbbf24', '#f87171', '#4ade80', '#c084fc'];
    for (let i = 0; i < N; i++) {
      particles.push({ x: cx, y: cy, c: colors[i % colors.length] });
    }
    let t = 0;
    (function loop() {
      ctx.fillStyle = 'rgba(15,23,42,.22)'; ctx.fillRect(0, 0, V.w, V.h);
      particles.forEach(function (p) {
        p.x += (Math.random() - 0.5) * 5;
        p.y += (Math.random() - 0.5) * 5;
        ctx.fillStyle = p.c; ctx.globalAlpha = 0.85;
        ctx.fillRect(p.x - 1, p.y - 1, 2.5, 2.5);
      });
      ctx.globalAlpha = 1;
      t++;
      // 理论包络：rms 半径 = 2.04·√t（每步 x/y 各 ±2.5px 均匀随机）
      const rT = 2.04 * Math.sqrt(t);
      let avg = 0;
      particles.forEach(function (p) { avg += Math.hypot(p.x - cx, p.y - cy); });
      avg /= N;
      // 出生点十字
      ctx.strokeStyle = 'rgba(226,232,240,.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - 5, cy); ctx.lineTo(cx + 5, cy); ctx.moveTo(cx, cy - 5); ctx.lineTo(cx, cy + 5); ctx.stroke();
      // 理论 √t 圆（金色虚线）
      ctx.strokeStyle = 'rgba(251,191,36,.75)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(cx, cy, rT, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, V.h - 22, V.w, 22);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('t=' + t + '  实测平均位移 ' + avg.toFixed(1) + ' px ≈ 理论 √t 半径 ' + rT.toFixed(1) + ' px（金色虚线圆）', 8, V.h - 8);
      window.requestAnimationFrame(loop);
    })();
  };

  /* 傅里叶合成方波 */
  AN.fourier = function (holder) {
    const V = mkCanvas(holder, 360, 240, false);
    const ctx = V.ctx;
    let harmonics = 1, phase = 0;
    function draw() {
      ctx.clearRect(0, 0, V.w, V.h);
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath(); ctx.moveTo(0, V.h / 2); ctx.lineTo(V.w, V.h / 2); ctx.stroke();
      // 目标方波
      ctx.strokeStyle = 'rgba(148,163,184,.6)'; ctx.setLineDash([4, 3]);
      ctx.beginPath();
      for (let px = 0; px < V.w; px++) {
        const t = px / V.w * 2 * Math.PI + phase;
        const sq = (Math.sin(t) >= 0 ? 1 : -1) * 55;
        if (px === 0) ctx.moveTo(px, V.h / 2 - sq); else ctx.lineTo(px, V.h / 2 - sq);
      }
      ctx.stroke(); ctx.setLineDash([]);
      // 合成
      ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let px = 0; px < V.w; px++) {
        const t = px / V.w * 2 * Math.PI + phase;
        let y = 0;
        for (let k = 1; k <= harmonics; k++) {
          const n = 2 * k - 1;
          y += Math.sin(n * t) / n;
        }
        y = y * 4 / Math.PI * 55;
        if (px === 0) ctx.moveTo(px, V.h / 2 - y); else ctx.lineTo(px, V.h / 2 - y);
      }
      ctx.stroke();
      ctx.fillStyle = '#1e293b'; ctx.font = '11px sans-serif';
      ctx.fillText('奇次谐波数: ' + harmonics + '（红=合成，灰虚线=目标方波）', 10, 16);
      phase += 0.01;
      window.requestAnimationFrame(draw);
    }
    draw();
    const sl = document.createElement('input');
    sl.type = 'range'; sl.min = 1; sl.max = 25; sl.step = 1; sl.value = 1;
    sl.style.cssText = 'width:100%;accent-color:#dc2626;margin-top:6px';
    sl.addEventListener('input', function () { harmonics = Number(sl.value); });
    holder.appendChild(sl);
  };

  /* 生命游戏 */
  AN.life = function (holder) {
    const cols = 60, rows = 40, size = 6;
    const V = mkCanvas(holder, cols * size, rows * size, true);
    const ctx = V.ctx;
    let grid = [];
    for (let i = 0; i < rows; i++) { grid.push([]); for (let j = 0; j < cols; j++) grid[i].push(Math.random() < 0.22 ? 1 : 0); }
    function step() {
      const next = [];
      for (let i = 0; i < rows; i++) {
        next.push([]);
        for (let j = 0; j < cols; j++) {
          let n = 0;
          for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
            if (di === 0 && dj === 0) continue;
            n += grid[(i + di + rows) % rows][(j + dj + cols) % cols];
          }
          next[i].push(grid[i][j] ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0));
        }
      }
      grid = next;
    }
    let tick = 0;
    (function loop() {
      step(); tick++;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      ctx.fillStyle = '#4ade80';
      for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
        if (grid[i][j]) ctx.fillRect(j * size + 1, i * size + 1, size - 2, size - 2);
      }
      window.requestAnimationFrame(loop);
    })();
  };

  /* 乌拉姆素数螺旋 */
  AN.ulam = function (holder) {
    const V = mkCanvas(holder, 320, 320, true);
    const ctx = V.ctx;
    const S = 44; // 螺旋半径
    function isPrime(n) {
      if (n < 2) return false;
      for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
      return true;
    }
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
    let x = V.w / 2, y = V.h / 2, dx = 1, dy = 0, seg = 1, count = 0, turn = 0;
    const scale = V.w / (S * 2 + 1);
    for (let n = 1; n <= (S * 2 + 1) * (S * 2 + 1); n++) {
      if (isPrime(n)) {
        ctx.fillStyle = n % 4 === 1 ? '#fbbf24' : '#38bdf8';
        ctx.fillRect(x, y, Math.max(1, scale), Math.max(1, scale));
      }
      x += dx * scale; y += dy * scale; count++;
      if (count === seg) {
        count = 0;
        const t = dx; dx = -dy; dy = t; turn++;
        if (turn % 2 === 0) seg++;
      }
    }
    ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif';
    ctx.fillText('素数沿对角线聚集（乌拉姆螺旋）', 10, V.h - 8);
  };

  /* 黄金螺线 */
  AN.goldenSpiral = function (holder) {
    const V = mkCanvas(holder, 340, 260, false);
    const ctx = V.ctx;
    let th = 0;
    (function loop() {
      ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(0, 0, V.w, V.h);
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let t = 0; t < th; t += 0.05) {
        const r = 3 * Math.pow(1.618, t / (Math.PI / 2));
        const px = V.w / 2 + r * Math.cos(t), py = V.h / 2 + r * Math.sin(t);
        if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        if (r > V.w) break;
      }
      ctx.stroke();
      if (th < 6 * Math.PI) th += 0.06;
      ctx.fillStyle = '#b45309'; ctx.font = '11px sans-serif';
      ctx.fillText('r = 3·φ^(θ/90°)，φ=(1+√5)/2', 10, V.h - 8);
      window.requestAnimationFrame(loop);
    })();
  };

  /* 利萨茹 */
  AN.lissajous = function (holder) {
    const V = mkCanvas(holder, 320, 320, true);
    const ctx = V.ctx;
    let a = 3, b = 4, delta = Math.PI / 2, t = 0;
    function draw() {
      ctx.fillStyle = 'rgba(15,23,42,.08)'; ctx.fillRect(0, 0, V.w, V.h);
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let s = 0; s <= Math.PI * 2 + 0.1; s += 0.01) {
        const px = V.w / 2 + 130 * Math.sin(a * s + delta);
        const py = V.h / 2 + 130 * Math.sin(b * s);
        if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      // 运动点
      const px = V.w / 2 + 130 * Math.sin(a * t + delta);
      const py = V.h / 2 + 130 * Math.sin(b * t);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
      t += 0.02;
      window.requestAnimationFrame(draw);
    }
    draw();
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:12px;margin-top:6px;font-size:12px;color:#334155';
    row.innerHTML = '<label>频率比 a <input type="range" min="1" max="9" value="3" id="lis-a" style="vertical-align:middle"></label>' +
      '<label>b <input type="range" min="1" max="9" value="4" id="lis-b" style="vertical-align:middle"></label>';
    holder.appendChild(row);
    setTimeout(function () {
      const ia = document.getElementById('lis-a'), ib = document.getElementById('lis-b');
      if (ia) ia.addEventListener('input', function () { a = Number(ia.value); });
      if (ib) ib.addEventListener('input', function () { b = Number(ib.value); });
    }, 0);
  };

  window.ExploreAnim = AN;
})();
