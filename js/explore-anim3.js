/* explore-anim3.js — 探索篇生成主题的动画引擎（25 个，真实模拟） */
(function () {
  const AN = window.ExploreAnim || (window.ExploreAnim = {});
  function mk(holder, w, h, dark) {
    const c = document.createElement('canvas');
    c.style.cssText = 'width:100%;max-width:' + w + 'px;border-radius:8px;display:block;background:' + (dark ? '#0f172a' : '#ffffff');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = w * dpr; c.height = h * dpr;
    holder.appendChild(c);
    const ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }
  function cap(ctx, V, text) { ctx.fillStyle = '#94a3b8'; ctx.font = '10.5px sans-serif'; ctx.fillText(text, 10, V.h - 7); }

  /* 元素壳层：核 + 电子绕层转 */
  AN.element = function (holder, o) {
    const d = o.data || { Z: 11, shells: [2, 8, 1] };
    const V = mk(holder, 300, 230, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = V.h / 2;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(d.sym || '', cx, cy + 3); ctx.textAlign = 'left';
      d.shells.forEach(function (n, i) {
        const r = 30 + i * 22;
        ctx.strokeStyle = 'rgba(148,163,184,.3)';
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        for (let e = 0; e < n; e++) {
          const a = t * 0.02 / (i + 1) + e * Math.PI * 2 / n;
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath(); ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 3, 0, Math.PI * 2); ctx.fill();
        }
      });
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText((d.cn || '') + ' Z=' + d.Z + '  壳层 ' + d.shells.join('-'), 12, 16);
      cap(ctx, V, '最外层电子数决定化学性质');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 乘法表 cardioid */
  AN.cardioid = function (holder, o) {
    const k = (o.data && o.data.k) || 2, n = (o.data && o.data.n) || 60;
    const V = mk(holder, 280, 280, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = 'rgba(15,23,42,.25)'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = V.h / 2, R = 120;
      const upto = Math.min(n, Math.floor(t / 2));
      ctx.strokeStyle = 'rgba(56,189,248,.5)';
      for (let i = 0; i <= upto; i++) {
        const a1 = i * Math.PI * 2 / n - Math.PI / 2;
        const a2 = (i * k) % n * Math.PI * 2 / n - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx + R * Math.cos(a1), cy + R * Math.sin(a1));
        ctx.lineTo(cx + R * Math.cos(a2), cy + R * Math.sin(a2));
        ctx.stroke();
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('i → (i×' + k + ') mod ' + n, 12, 16);
      cap(ctx, V, '弦的包络是心形线：乘法表的几何面孔');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 曲线族 */
  AN.curve = function (holder, o) {
    const d = o.data || { type: 'sin', A: 1, w: 1 };
    const V = mk(holder, 340, 200, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const cy = V.h / 2;
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath(); ctx.moveTo(10, cy); ctx.lineTo(V.w - 10, cy); ctx.stroke();
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= V.w - 20; x++) {
        const u = (x - (V.w - 20) / 2) / 30;
        let y;
        if (d.type === 'sin') y = d.A * Math.sin(d.w * u + t * 0.02);
        else if (d.type === 'quad') y = (d.a * u * u + d.c) / 6;
        else if (d.type === 'exp') y = Math.exp(u / 2) / 3 - 1;
        else if (d.type === 'log') y = u > 0.1 ? Math.log(u) / 2 : -2;
        else if (d.type === 'refract') { const th = u * 0.01 + 0.8; y = Math.sin(th) > 0 ? Math.sin(Math.asin(Math.min(1, Math.sin(th))) ) - Math.sin(Math.asin(Math.min(1, Math.sin(th) / 1.33))) : 0; }
        else y = Math.sin(u);
        const py = cy - y * 40;
        if (x === 0) ctx.moveTo(x + 10, py); else ctx.lineTo(x + 10, py);
      }
      ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText(o.title || d.type, 12, 16);
      cap(ctx, V, '参数不同，曲线形状不同');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* Collatz 轨迹 */
  AN.collatz = function (holder, o) {
    const n0 = (o.data && o.data.n) || 27;
    const V = mk(holder, 340, 180, false);
    const seq = [n0]; let x = n0;
    while (x !== 1 && seq.length < 400) { x = x % 2 ? 3 * x + 1 : x / 2; seq.push(x); }
    const maxV = Math.max.apply(null, seq);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const upto = Math.min(seq.length, Math.floor(t / 2));
      ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i <= upto; i++) {
        const px = 10 + i * (V.w - 20) / seq.length;
        const py = V.h - 20 - Math.log(seq[i] + 1) / Math.log(maxV + 1) * (V.h - 40);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('从 ' + n0 + ' 出发，当前值 ' + seq[Math.min(upto, seq.length - 1)], 12, 16);
      cap(ctx, V, '纵轴对数刻度：冰雹序列的疯狂起伏');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 排序可视化 */
  AN.sort = function (holder, o) {
    const alg = (o.data && o.data.alg) || 'bubble';
    const V = mk(holder, 340, 180, true);
    let arr = [], n = 40, steps = [], si = 0;
    function reset() {
      arr = []; for (let i = 0; i < n; i++) arr.push(i + 1);
      for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp; }
      steps = [];
      const a = arr.slice();
      if (alg === 'bubble') for (let i = 0; i < n; i++) for (let j = 0; j < n - 1 - i; j++) if (a[j] > a[j + 1]) { const t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; steps.push([j, j + 1]); }
      else if (alg === 'insertion') for (let i = 1; i < n; i++) { let j = i; while (j > 0 && a[j - 1] > a[j]) { const t = a[j]; a[j] = a[j - 1]; a[j - 1] = t; steps.push([j - 1, j]); j--; } }
      else if (alg === 'selection') for (let i = 0; i < n; i++) { let m = i; for (let j = i + 1; j < n; j++) if (a[j] < a[m]) m = j; if (m !== i) { const t = a[i]; a[i] = a[m]; a[m] = t; steps.push([i, m]); } }
      else { // quick
        function qs(lo, hi) { if (lo >= hi) return; const p = a[hi]; let i = lo; for (let j = lo; j < hi; j++) if (a[j] < p) { const t = a[i]; a[i] = a[j]; a[j] = t; steps.push([i, j]); i++; } const t = a[i]; a[i] = a[hi]; a[hi] = t; steps.push([i, hi]); qs(lo, i - 1); qs(i + 1, hi); }
        qs(0, n - 1);
      }
      si = 0;
    }
    reset();
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      if (t % 2 === 0 && si < steps.length) {
        const s = steps[si]; const tmp = arr[s[0]]; arr[s[0]] = arr[s[1]]; arr[s[1]] = tmp; si++;
      }
      if (si >= steps.length && t % 300 === 299) reset();
      for (let i = 0; i < n; i++) {
        const h = arr[i] / n * (V.h - 30);
        ctx.fillStyle = (steps[si] && (i === steps[si][0] || i === steps[si][1])) ? '#f59e0b' : '#38bdf8';
        ctx.fillRect(6 + i * ((V.w - 12) / n), V.h - 10 - h, (V.w - 12) / n - 1, h);
      }
      cap(ctx, V, alg + ' 排序：橙色是正在交换的一对');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 元胞自动机 */
  AN.ca = function (holder, o) {
    const rule = (o.data && o.data.rule) || 30;
    const V = mk(holder, 300, 220, true);
    let row = [], y = 0;
    function reset() { row = new Array(120).fill(0); row[60] = 1; y = 0; }
    reset();
    (function loop() {
      const ctx = V.ctx;
      if (y === 0) { ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h); }
      for (let i = 0; i < 120; i++) if (row[i]) { ctx.fillStyle = '#e2e8f0'; ctx.fillRect(i * 2.5, y * 2, 2.5, 2); }
      const next = new Array(120).fill(0);
      for (let i = 1; i < 119; i++) {
        const bits = (row[i - 1] << 2) | (row[i] << 1) | row[i + 1];
        next[i] = (rule >> bits) & 1;
      }
      row = next; y++;
      if (y > 105) reset();
      cap(ctx, V, '规则 ' + rule + '：简单规则 → 复杂图案');
      window.requestAnimationFrame(loop);
    })();
  };

  /* 常数卡片：数量级阶梯 */
  AN.constCard = function (holder, o) {
    const d = o.data || { name: '', value: 1e-34 };
    const V = mk(holder, 340, 170, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const exp = Math.floor(Math.log10(Math.abs(d.value) || 1));
      for (let e = -40; e <= 20; e += 5) {
        const x = 20 + (e + 40) / 60 * (V.w - 40);
        ctx.strokeStyle = '#334155';
        ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x, 120); ctx.stroke();
        ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('1e' + e, x, 135);
      }
      ctx.textAlign = 'left';
      const x = 20 + (Math.max(-40, Math.min(20, exp)) + 40) / 60 * (V.w - 40);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(x, 90, 7 + Math.sin(t * 0.1) * 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText(d.name + ' ≈ ' + d.value.toExponential(3) + ' ' + (o.unit || ''), 12, 24);
      cap(ctx, V, '在数量级阶梯上找到它的位置');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 弹簧振子 */
  AN.spring = function (holder, o) {
    const m = (o.data && o.data.m) || 1;
    const V = mk(holder, 340, 180, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const k = 20;
      const w = Math.sqrt(k / m);
      const x = Math.cos(w * t * 0.05) * 60;
      const cx = V.w / 2;
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(20, 90); ctx.lineTo(cx + x - 20, 90); ctx.stroke();
      for (let i = 0; i < 8; i++) {
        ctx.beginPath(); ctx.moveTo(20 + i * (cx + x - 40) / 8, 90 + (i % 2 ? 8 : -8)); ctx.lineTo(20 + (i + 1) * (cx + x - 40) / 8, 90 + ((i + 1) % 2 ? 8 : -8)); ctx.stroke();
      }
      ctx.fillStyle = '#2563eb'; ctx.fillRect(cx + x - 20, 70, 40, 40);
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('m=' + m + 'kg  T=2π√(m/k)≈' + (2 * Math.PI * Math.sqrt(m / k)).toFixed(2) + 's', 12, 20);
      cap(ctx, V, '质量越大，振动越慢');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 多边形 */
  AN.polygon = function (holder, o) {
    const n = (o.data && o.data.n) || 5;
    const V = mk(holder, 280, 220, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = V.h / 2, R = 80;
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const a = i * Math.PI * 2 / n - Math.PI / 2 + t * 0.002;
        const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // 对角线三角剖分
      ctx.strokeStyle = 'rgba(220,38,38,.5)';
      const a0 = -Math.PI / 2 + t * 0.002;
      for (let i = 2; i < n - 1; i++) {
        const a = i * Math.PI * 2 / n - Math.PI / 2 + t * 0.002;
        ctx.beginPath(); ctx.moveTo(cx + R * Math.cos(a0), cy + R * Math.sin(a0)); ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a)); ctx.stroke();
      }
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText(n + ' 边形 = ' + (n - 2) + ' 个三角形，内角和 ' + (n - 2) * 180 + '°', 40, 16);
      cap(ctx, V, '红线是剖分对角线');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 杨辉三角 */
  AN.pascal = function (holder, o) {
    const n = (o.data && o.data.n) || 10;
    const V = mk(holder, 340, 200, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const row = Math.min(n, Math.floor(t / 12));
      for (let r = 0; r <= row; r++) {
        for (let k = 0; k <= r; k++) {
          let v = 1; for (let i = 1; i <= k; i++) v = v * (r - i + 1) / i;
          const x = V.w / 2 + (k - r / 2) * 22;
          const y = 14 + r * 12;
          ctx.fillStyle = v % 2 ? '#f59e0b' : 'rgba(148,163,184,.25)';
          ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
        }
      }
      cap(ctx, V, '奇数染色 → 谢尔宾斯基三角形浮现');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 勾股面积 */
  AN.pythag = function (holder, o) {
    const d = o.data || { a: 3, b: 4, c: 5 };
    const V = mk(holder, 320, 200, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const s = 12;
      const x0 = 130, y0 = 130;
      ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + d.b * s, y0); ctx.lineTo(x0, y0 - d.a * s); ctx.closePath(); ctx.stroke();
      ctx.fillStyle = 'rgba(37,99,235,.3)'; ctx.fillRect(x0 - d.a * s, y0 - d.a * s, d.a * s, d.a * s);
      ctx.fillStyle = 'rgba(220,38,38,.3)'; ctx.fillRect(x0, y0, d.b * s, d.b * s > 60 ? 60 : d.b * s);
      ctx.fillStyle = 'rgba(5,150,105,.3)'; ctx.fillRect(x0 + d.b * s + 6, y0 - d.c * s, d.c * s > 90 ? 90 : d.c * s, d.c * s > 90 ? 90 : d.c * s);
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText(d.a + '²+' + d.b + '²=' + d.c + '²  (' + d.a * d.a + '+' + d.b * d.b + '=' + d.c * d.c + ')', 60, 16);
      cap(ctx, V, '三个正方形面积关系');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 素数螺旋 */
  AN.prime = function (holder, o) {
    const V = mk(holder, 280, 280, true);
    function isP(n) { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const upto = Math.min(2000, t * 8);
      let x = 0, y = 0, dx = 1, dy = 0, steps = 1, cnt = 0;
      for (let i = 1; i <= upto; i++) {
        if (isP(i)) {
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(V.w / 2 + x * 3, V.h / 2 + y * 3, 2.5, 2.5);
        }
        x += dx; y += dy; cnt++;
        if (cnt === steps) { cnt = 0; const tmp = dx; dx = -dy; dy = tmp; if (dy === 0) steps++; else if (dx === 0) steps++; }
      }
      cap(ctx, V, '乌拉姆螺旋：素数偏爱对角线');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 焰色 */
  AN.flame = function (holder, o) {
    const d = o.data || { color: '#fbbf24', name: '钠' };
    const V = mk(holder, 260, 200, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = V.w / 2;
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = d.color;
        ctx.globalAlpha = 0.7 - i * 0.1;
        ctx.beginPath();
        ctx.ellipse(cx + Math.sin(t * 0.15 + i) * 4, 140 - i * 16, 14 - i * 2, 22 - i * 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#475569'; ctx.fillRect(cx - 18, 150, 36, 22);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(d.name + ' 的特征焰色', cx, 24); ctx.textAlign = 'left';
      cap(ctx, V, '电子跃迁放出特定波长的光');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 置换反应 */
  AN.displace = function (holder, o) {
    const d = o.data || { metal: '铁', salt: '硫酸铜' };
    const V = mk(holder, 300, 200, true);
    const parts = [];
    let t = 0;
    for (let i = 0; i < 10; i++) parts.push({ x: 60 + Math.random() * 180, y: 90 + Math.random() * 80, blue: true });
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      ctx.fillStyle = 'rgba(59,130,246,' + (0.15 + 0.1 * Math.sin(t * 0.01)) + ')';
      ctx.fillRect(40, 80, 220, 100);
      ctx.strokeStyle = '#64748b'; ctx.strokeRect(40, 80, 220, 100);
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(130, 60, 40, 110); // 金属条
      parts.forEach(function (p) {
        p.x += Math.sin(t * 0.05 + p.y) * 0.5;
        p.y += Math.cos(t * 0.04 + p.x) * 0.5;
        if (t % 90 === 0 && p.blue) { p.blue = false; }
        ctx.fillStyle = p.blue ? '#38bdf8' : '#f97316';
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText(d.metal + ' + ' + d.salt + '：蓝=盐离子 橙=被置换金属', 30, 24);
      cap(ctx, V, '活泼金属把不活泼金属从盐里"换"出来');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 有机链 */
  AN.chain = function (holder, o) {
    const d = o.data || { n: 4, kind: 'alkane' };
    const V = mk(holder, 340, 160, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const n = d.n;
      for (let i = 0; i < n; i++) {
        const x = 30 + i * Math.min(30, 300 / n);
        const y = 80 + Math.sin(i + t * 0.03) * 8;
        ctx.fillStyle = '#334155';
        ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
        if (i < n - 1) { ctx.strokeStyle = '#64748b'; ctx.beginPath(); ctx.moveTo(x + 10, y); ctx.lineTo(x + Math.min(30, 300 / n) - 10, 80 + Math.sin(i + 1 + t * 0.03) * 8); ctx.stroke(); }
      }
      if (d.kind === 'alcohol') {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath(); ctx.arc(30 + (n - 1) * Math.min(30, 300 / n) + 20, 80, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('OH', 30 + (n - 1) * Math.min(30, 300 / n) + 20, 83); ctx.textAlign = 'left';
      }
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText((d.kind === 'alkane' ? '烷烃 C' + n : '醇 C' + n) + '：碳链' + (n > 6 ? '较长（更像油）' : '较短'), 12, 20);
      cap(ctx, V, '链越长，分子间力越大');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 抛体角度 */
  AN.projAngle = function (holder, o) {
    const th = ((o.data && o.data.th) || 45) * Math.PI / 180;
    const V = mk(holder, 340, 180, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const v0 = 20, g = 9.8;
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath(); ctx.moveTo(10, V.h - 20); ctx.lineTo(V.w - 10, V.h - 20); ctx.stroke();
      ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2;
      ctx.beginPath();
      const T = 2 * v0 * Math.sin(th) / g;
      for (let i = 0; i <= 60; i++) {
        const tt = T * i / 60;
        const x = v0 * Math.cos(th) * tt, y = v0 * Math.sin(th) * tt - 0.5 * g * tt * tt;
        const px = 15 + x * 3.2, py = V.h - 20 - y * 3.2;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      const tt = (t % 100) / 100 * T;
      const x = v0 * Math.cos(th) * tt, y = Math.max(0, v0 * Math.sin(th) * tt - 0.5 * g * tt * tt);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(15 + x * 3.2, V.h - 20 - y * 3.2, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('θ=' + Math.round(th * 180 / Math.PI) + '°  射程=' + (v0 * v0 * Math.sin(2 * th) / g).toFixed(1) + 'm', 12, 16);
      cap(ctx, V, '45° 射程最大');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 自由落体高度 */
  AN.fallH = function (holder, o) {
    const h = (o.data && o.data.h) || 20;
    const V = mk(holder, 260, 200, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const T = Math.sqrt(2 * h / 9.8);
      const tt = (t % 140) / 140 * T;
      const y = 0.5 * 9.8 * tt * tt;
      const py = 20 + y / h * 150;
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath(); ctx.moveTo(40, 20); ctx.lineTo(40, 170); ctx.stroke();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(130, py, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('h=' + h + 'm  t=' + tt.toFixed(2) + 's  v=' + (9.8 * tt).toFixed(1) + 'm/s', 60, 16);
      cap(ctx, V, '高度按平方律换时间');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 电阻串并联 */
  AN.resistor = function (holder, o) {
    const d = o.data || { a: 3, b: 6 };
    const V = mk(holder, 320, 170, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const ser = d.a + d.b, par = d.a * d.b / (d.a + d.b);
      // 串联：一条窄路变长
      ctx.fillStyle = 'rgba(37,99,235,.3)';
      ctx.fillRect(30, 50, d.a * 18, 14); ctx.fillRect(30 + d.a * 18, 50, d.b * 18, 14);
      ctx.strokeStyle = '#475569'; ctx.strokeRect(30, 50, ser * 18, 14);
      ctx.fillStyle = '#475569'; ctx.font = '10px sans-serif';
      ctx.fillText('串联 = 路变长 = ' + ser + 'Ω', 30, 40);
      // 并联：路变宽
      ctx.fillStyle = 'rgba(220,38,38,.3)';
      ctx.fillRect(30, 100, 60, d.a * 3); ctx.fillRect(30, 104 + d.a * 3, 60, d.b * 3);
      ctx.strokeStyle = '#475569'; ctx.strokeRect(30, 100, 60, (d.a + d.b) * 3 + 4);
      ctx.fillText('并联 = 路变宽 = ' + par.toFixed(2) + 'Ω', 30, 96);
      cap(ctx, V, '并联总电阻比最小的还小');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 完美数因子 */
  AN.divisors = function (holder, o) {
    const n = (o.data && o.data.n) || 28;
    const V = mk(holder, 320, 170, false);
    let t = 0;
    const divs = [];
    for (let i = 1; i < n; i++) if (n % i === 0) divs.push(i);
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      ctx.fillStyle = '#2563eb';
      ctx.beginPath(); ctx.arc(60, 85, 24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(n, 60, 90); ctx.textAlign = 'left';
      let sum = 0;
      divs.forEach(function (d, i) {
        sum += d;
        const a = i * Math.PI * 2 / divs.length - Math.PI / 2;
        const x = 200 + 60 * Math.cos(a), y = 85 + 55 * Math.sin(a);
        ctx.strokeStyle = '#94a3b8';
        ctx.beginPath(); ctx.moveTo(84, 85); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(d, x, y + 3); ctx.textAlign = 'left';
      });
      ctx.fillStyle = sum === n ? '#16a34a' : '#dc2626'; ctx.font = '12px sans-serif';
      ctx.fillText('真因子和 = ' + sum + (sum === n ? ' = ' + n + ' ✓ 完美数' : ''), 90, 160);
      cap(ctx, V, '完美数：等于自身真因子之和');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 尺度阶梯 */
  AN.scale = function (holder, o) {
    const d = o.data || { value: 1e-9 };
    const V = mk(holder, 340, 160, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const exp = Math.floor(Math.log10(d.value));
      for (let e = -18; e <= 9; e += 3) {
        const x = 15 + (e + 18) / 27 * (V.w - 30);
        ctx.strokeStyle = '#334155';
        ctx.beginPath(); ctx.moveTo(x, 50); ctx.lineTo(x, 110); ctx.stroke();
        ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('1e' + e, x, 125);
      }
      ctx.textAlign = 'left';
      const x = 15 + (Math.max(-18, Math.min(9, exp)) + 18) / 27 * (V.w - 30);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(x, 80, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText(o.title || '', 12, 24);
      cap(ctx, V, d.note || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 半衰期衰变 */
  AN.decay = function (holder, o) {
    const d = o.data || { half: 5730, name: 'C-14' };
    const V = mk(holder, 340, 180, true);
    const atoms = [];
    for (let i = 0; i < 120; i++) atoms.push({ alive: true, x: 20 + (i % 20) * 15, y: 20 + Math.floor(i / 20) * 15 });
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const halves = (t % 600) / 150;
      const frac = Math.pow(0.5, halves);
      const aliveN = Math.round(120 * frac);
      atoms.forEach(function (a, i) {
        ctx.fillStyle = i < aliveN ? '#4ade80' : '#475569';
        ctx.beginPath(); ctx.arc(a.x, a.y, 4, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText(d.name + '  经过 ' + halves.toFixed(1) + ' 个半衰期，剩 ' + Math.round(frac * 100) + '%', 12, V.h - 24);
      cap(ctx, V, '半衰期 T½=' + d.half + '（年/天等单位见标题）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 天体 g/逃逸/轨道 */
  AN.gbody = function (holder, o) {
    const d = o.data || { name: '地球', g: 9.8 };
    const V = mk(holder, 300, 180, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      ctx.fillStyle = '#2563eb';
      ctx.beginPath(); ctx.arc(V.w / 2, V.h + 60, 110, 0, Math.PI * 2); ctx.fill();
      const T = Math.sqrt(2 * 2 / d.g);
      const tt = (t % 120) / 120 * T;
      const y = 0.5 * d.g * tt * tt;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(V.w / 2, 30 + Math.min(110, y * 20), 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText(d.name + '  g=' + d.g + ' m/s²', 12, 20);
      cap(ctx, V, '同一物体在不同天体上下落快慢不同');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 巴尔末谱线 */
  AN.balmer = function (holder, o) {
    const V = mk(holder, 340, 160, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const R = 1.097e7;
      const lines = [[3, 656, '#ff5555'], [4, 486, '#55ccff'], [5, 434, '#7777ff'], [6, 410, '#aa55ff']];
      lines.forEach(function (L, i) {
        const x = 40 + (L[1] - 400) / 300 * 260;
        const on = Math.floor(t / 60) % 4 === i;
        ctx.strokeStyle = L[2];
        ctx.globalAlpha = on ? 1 : 0.35;
        ctx.lineWidth = on ? 5 : 2;
        ctx.beginPath(); ctx.moveTo(x, 30); ctx.lineTo(x, 110); ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(L[1] + 'nm', x, 125);
      });
      ctx.textAlign = 'left';
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('氢原子巴尔末系：电子落回 n=2 放出的四条可见光', 30, 145);
      cap(ctx, V, '1/λ = R(1/4 - 1/n²)');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 多普勒 */
  AN.doppler = function (holder, o) {
    const V = mk(holder, 340, 170, true);
    let t = 0;
    const waves = [];
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = 'rgba(15,23,42,.3)'; ctx.fillRect(0, 0, V.w, V.h);
      const sx = 60 + ((t * 1.2) % 220);
      if (t % 12 === 0) waves.push({ x: sx, r: 0 });
      for (let i = waves.length - 1; i >= 0; i--) {
        waves[i].r += 1.6;
        if (waves[i].r > 200) { waves.splice(i, 1); continue; }
        ctx.strokeStyle = 'rgba(56,189,248,.6)';
        ctx.beginPath(); ctx.arc(waves[i].x, 85, waves[i].r, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(sx, 85, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('波源向右运动：前方波被压缩（频率高），后方稀疏', 30, 20);
      cap(ctx, V, '救护车驶来时音调变高的原因');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 科赫雪花 */
  AN.koch = function (holder, o) {
    const V = mk(holder, 300, 240, true);
    let depth = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1;
      function koch(x1, y1, x2, y2, d) {
        if (d === 0) { ctx.lineTo(x2, y2); return; }
        const dx = (x2 - x1) / 3, dy = (y2 - y1) / 3;
        const ax = x1 + dx, ay = y1 + dy;
        const bx = x1 + 2 * dx, by = y1 + 2 * dy;
        const mx = (ax + bx) / 2 - dy * Math.sqrt(3) / 2;
        const my = (ay + by) / 2 + dx * Math.sqrt(3) / 2;
        koch(x1, y1, ax, ay, d - 1); koch(ax, ay, mx, my, d - 1);
        koch(mx, my, bx, by, d - 1); koch(bx, by, x2, y2, d - 1);
      }
      const cx = V.w / 2, cy = V.h / 2 + 14, r = 85;
      const pts = [];
      for (let i = 0; i < 3; i++) {
        const th = -Math.PI / 2 + i * 2 * Math.PI / 3;
        pts.push([cx + r * Math.cos(th), cy + r * Math.sin(th)]);
      }
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 0; i < 3; i++) koch(pts[i][0], pts[i][1], pts[(i + 1) % 3][0], pts[(i + 1) % 3][1], depth);
      ctx.closePath(); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif';
      ctx.fillText('迭代 ' + depth + ' 次：周长→∞，面积有限', 12, 16);
      depth = (depth + 1) % 5;
      window.setTimeout(function () { window.requestAnimationFrame(loop); }, 900);
    })();
  };

  /* 时间膨胀 */
  AN.time = function (holder, o) {
    const V = mk(holder, 300, 170, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const g = t * 0.05, s = t * 0.03;
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(80, 90, 40, -Math.PI / 2, -Math.PI / 2 + g % (Math.PI * 2)); ctx.stroke();
      ctx.strokeStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(220, 90, 40, -Math.PI / 2, -Math.PI / 2 + s % (Math.PI * 2)); ctx.stroke();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('地面时钟（快）', 80, 150);
      ctx.fillText('飞船时钟 v=0.8c（慢）', 220, 150);
      ctx.textAlign = 'left';
      cap(ctx, V, '运动使时间变慢：γ=1/√(1-v²/c²)');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 黄金螺线 */
  AN.golden = function (holder, o) {
    const V = mk(holder, 300, 220, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
      ctx.beginPath();
      const upto = Math.min(600, t * 4);
      for (let i = 0; i <= upto; i++) {
        const a = i * 0.05;
        const r = 2 * Math.pow(1.02, i * 0.5);
        const x = V.w / 2 + r * Math.cos(a), y = V.h / 2 + r * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        if (r > 110) break;
      }
      ctx.stroke();
      cap(ctx, V, '对数螺线：每转固定角度，半径按黄金比放大');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 波形三参 */
  AN.wave3 = function (holder, o) {
    const d = o.data || { f: 2, A: 1 };
    const V = mk(holder, 340, 160, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const cy = V.h / 2;
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < V.w - 20; x++) {
        const y = cy - Math.sin(x / 30 * d.f + t * 0.05) * d.A * 30;
        if (x === 0) ctx.moveTo(x + 10, y); else ctx.lineTo(x + 10, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('频率 f=' + d.f + '  振幅 A=' + d.A + '：v=λf', 12, 16);
      cap(ctx, V, '波速=波长×频率');
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
