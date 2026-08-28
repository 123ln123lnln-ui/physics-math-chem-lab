/* explore-anim3.js — 探索篇引擎（动态参数版：每帧读 o.data，滑块实时生效）
 * 约定：主题带 params 定义时，页面渲染滑块并写入 tp.data；引擎每帧读取。 */
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

  /* 元素壳层：Z 滑块实时换元素 */
  AN.element = function (holder, o) {
    const V = mk(holder, 300, 230, true);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = V.h / 2;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(d.sym || '', cx, cy + 3); ctx.textAlign = 'left';
      (d.shells || [1]).forEach(function (n, i) {
        const r = 30 + i * 20;
        ctx.strokeStyle = 'rgba(148,163,184,.3)';
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        for (let e = 0; e < n; e++) {
          const a = t * 0.02 / (i + 1) + e * Math.PI * 2 / n;
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath(); ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 3, 0, Math.PI * 2); ctx.fill();
        }
      });
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText((d.cn || '') + ' Z=' + (d.Z || 1) + '  壳层 ' + (d.shells || []).join('-'), 12, 16);
      cap(ctx, V, '拖动 Z 滑块换元素：最外层电子数决定化学性质');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 乘法表 cardioid：n、k 滑块 */
  AN.cardioid = function (holder, o) {
    const V = mk(holder, 280, 280, true);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const k = d.k || 2, n = d.n || 60;
      const ctx = V.ctx;
      ctx.fillStyle = 'rgba(15,23,42,.25)'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = V.h / 2, R = 120;
      ctx.strokeStyle = 'rgba(56,189,248,.5)';
      for (let i = 0; i < n; i++) {
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

  /* 曲线族：type + p1 + p2 通用参数 */
  AN.curve = function (holder, o) {
    const V = mk(holder, 340, 200, false);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const type = d.type || 0, p1 = d.p1 !== undefined ? d.p1 : 1, p2 = d.p2 !== undefined ? d.p2 : 1;
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
        if (type === 0) y = p1 * Math.sin(p2 * u);
        else if (type === 1) y = (p1 * u * u + p2) / 6;
        else if (type === 2) y = (Math.exp(u / p1) - 2) / 3;
        else y = u > 0.1 ? Math.log(u) / p1 : -2;
        const py = cy - y * 40;
        if (x === 0) ctx.moveTo(x + 10, py); else ctx.lineTo(x + 10, py);
      }
      ctx.stroke();
      const names = ['正弦 y=A·sin(ωx)', '抛物线 y=ax²+c', '指数 y=e^(x/k)', '对数 y=ln(x)/k'];
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText(names[type] + '  参数 ' + p1 + ', ' + p2, 12, 16);
      cap(ctx, V, '拖动参数看曲线形状如何变');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* Collatz：起点 n 滑块 */
  AN.collatz = function (holder, o) {
    const V = mk(holder, 340, 180, false);
    let lastN = null, seq = [], maxV = 1;
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const n0 = d.n || 27;
      if (n0 !== lastN) {
        lastN = n0; seq = [n0]; let x = n0;
        while (x !== 1 && seq.length < 600) { x = x % 2 ? 3 * x + 1 : x / 2; seq.push(x); }
        maxV = Math.max.apply(null, seq);
      }
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
      ctx.fillText('从 ' + n0 + ' 出发，共 ' + seq.length + ' 步到 1', 12, 16);
      cap(ctx, V, '纵轴对数刻度：冰雹序列的疯狂起伏');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 排序：算法选择 + 规模 */
  AN.sort = function (holder, o) {
    const V = mk(holder, 340, 180, true);
    const algs = ['bubble', 'insertion', 'selection', 'quick', 'merge', 'heap'];
    let curKey = '', arr = [], steps = [], si = 0, n = 40;
    function reset(alg, nn) {
      n = nn; arr = []; for (let i = 0; i < n; i++) arr.push(i + 1);
      for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp; }
      steps = [];
      const a = arr.slice();
      if (alg === 'bubble') for (let i = 0; i < n; i++) for (let j = 0; j < n - 1 - i; j++) if (a[j] > a[j + 1]) { const t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; steps.push([j, j + 1]); }
      else if (alg === 'insertion') for (let i = 1; i < n; i++) { let j = i; while (j > 0 && a[j - 1] > a[j]) { const t = a[j]; a[j] = a[j - 1]; a[j - 1] = t; steps.push([j - 1, j]); j--; } }
      else if (alg === 'selection') for (let i = 0; i < n; i++) { let m = i; for (let j = i + 1; j < n; j++) if (a[j] < a[m]) m = j; if (m !== i) { const t = a[i]; a[i] = a[m]; a[m] = t; steps.push([i, m]); } }
      else { function qs(lo, hi) { if (lo >= hi) return; const p = a[hi]; let i = lo; for (let j = lo; j < hi; j++) if (a[j] < p) { const t = a[i]; a[i] = a[j]; a[j] = t; steps.push([i, j]); i++; } const t = a[i]; a[i] = a[hi]; a[hi] = t; steps.push([i, hi]); qs(lo, i - 1); qs(i + 1, hi); } qs(0, n - 1); }
      si = 0;
    }
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const alg = algs[Math.min(5, Math.max(0, Math.round(d.alg || 0)))];
      const nn = Math.min(80, Math.max(10, Math.round(d.n || 40)));
      const key = alg + '-' + nn;
      if (key !== curKey) { curKey = key; reset(alg, nn); }
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      if (t % 2 === 0 && si < steps.length) {
        const s = steps[si]; const tmp = arr[s[0]]; arr[s[0]] = arr[s[1]]; arr[s[1]] = tmp; si++;
      }
      if (si >= steps.length && t % 240 === 239) reset(alg, nn);
      for (let i = 0; i < n; i++) {
        const h = arr[i] / n * (V.h - 30);
        ctx.fillStyle = (steps[si] && (i === steps[si][0] || i === steps[si][1])) ? '#f59e0b' : '#38bdf8';
        ctx.fillRect(6 + i * ((V.w - 12) / n), V.h - 10 - h, (V.w - 12) / n - 1, h);
      }
      const names = ['冒泡', '插入', '选择', '快速', '归并', '堆'];
      cap(ctx, V, names[Math.round(d.alg || 0)] + '排序：橙色是正在交换的一对');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 元胞自动机：rule 滑块 */
  AN.ca = function (holder, o) {
    const V = mk(holder, 300, 220, true);
    let curRule = null, row = [], y = 0;
    function reset(rule) { row = new Array(120).fill(0); row[60] = 1; y = 0; curRule = rule; }
    (function loop() {
      const d = o.data || {};
      const rule = Math.min(255, Math.max(0, Math.round(d.rule || 30)));
      if (rule !== curRule) reset(rule);
      const ctx = V.ctx;
      if (y === 0) { ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h); }
      for (let i = 0; i < 120; i++) if (row[i]) { ctx.fillStyle = '#e2e8f0'; ctx.fillRect(i * 2.5, y * 2, 2.5, 2); }
      const next = new Array(120).fill(0);
      for (let i = 1; i < 119; i++) {
        const bits = (row[i - 1] << 2) | (row[i] << 1) | row[i + 1];
        next[i] = (rule >> bits) & 1;
      }
      row = next; y++;
      if (y > 105) reset(rule);
      cap(ctx, V, '规则 ' + rule + '：简单规则 → 复杂图案');
      window.requestAnimationFrame(loop);
    })();
  };

  /* 常数卡片：idx 选择 */
  AN.constCard = function (holder, o) {
    const LIST = [
      ['光速 c', 299792458, 'm/s'], ['引力常数 G', 6.674e-11, 'N·m²/kg²'], ['普朗克 h', 6.626e-34, 'J·s'],
      ['元电荷 e', 1.602e-19, 'C'], ['阿伏加德罗', 6.022e23, '/mol'], ['玻尔兹曼 k', 1.381e-23, 'J/K'],
      ['精细结构 α', 0.007297, ''], ['里德伯', 1.097e7, '/m'], ['电子质量', 9.109e-31, 'kg'], ['太阳质量', 1.989e30, 'kg']
    ];
    const V = mk(holder, 340, 170, true);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const c = LIST[Math.min(LIST.length - 1, Math.max(0, Math.round(d.idx || 0)))];
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const exp = Math.floor(Math.log10(Math.abs(c[1]) || 1));
      for (let e = -40; e <= 30; e += 5) {
        const x = 20 + (e + 40) / 70 * (V.w - 40);
        ctx.strokeStyle = '#334155';
        ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x, 120); ctx.stroke();
        ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('1e' + e, x, 135);
      }
      ctx.textAlign = 'left';
      const x = 20 + (Math.max(-40, Math.min(30, exp)) + 40) / 70 * (V.w - 40);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(x, 90, 7 + Math.sin(t * 0.1) * 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText(c[0] + ' ≈ ' + c[1].toExponential(3) + ' ' + c[2], 12, 24);
      cap(ctx, V, '在数量级阶梯上找到它的位置');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 单摆：L 滑块 */
  AN.pendulum = function (holder, o) {
    const V = mk(holder, 300, 220, false);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const L = d.L || 1;
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const w = Math.sqrt(9.8 / L);
      const a = Math.sin(w * t * 0.03) * 0.7;
      const px = V.w / 2 + Math.sin(a) * 130, py = 20 + Math.cos(a) * 130;
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(V.w / 2, 20); ctx.lineTo(px, py); ctx.stroke();
      ctx.fillStyle = '#2563eb';
      ctx.beginPath(); ctx.arc(px, py, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('L=' + L + 'm  T=2π√(L/g)≈' + (2 * Math.PI * Math.sqrt(L / 9.8)).toFixed(2) + 's', 12, 16);
      cap(ctx, V, '摆长越长周期越大（与质量无关）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 弹簧：m、k 滑块 */
  AN.spring = function (holder, o) {
    const V = mk(holder, 340, 180, false);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const m = d.m || 1, k = d.k || 20;
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const w = Math.sqrt(k / m);
      const x = Math.cos(w * t * 0.05) * 60;
      const cx = V.w / 2;
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath(); ctx.moveTo(20 + i * (cx + x - 40) / 8, 90 + (i % 2 ? 8 : -8)); ctx.lineTo(20 + (i + 1) * (cx + x - 40) / 8, 90 + ((i + 1) % 2 ? 8 : -8)); ctx.stroke();
      }
      ctx.fillStyle = '#2563eb'; ctx.fillRect(cx + x - 20, 70, 40, 40);
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('m=' + m + 'kg k=' + k + 'N/m  T≈' + (2 * Math.PI * Math.sqrt(m / k)).toFixed(2) + 's', 12, 20);
      cap(ctx, V, '质量越大越慢，弹簧越硬越快');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 利萨茹：a、b 滑块 */
  AN.lissajous = function (holder, o) {
    const V = mk(holder, 280, 280, true);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const a = Math.round(d.a || 3), b = Math.round(d.b || 2);
      const ctx = V.ctx;
      ctx.fillStyle = 'rgba(15,23,42,.2)'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = V.h / 2;
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i <= 600; i++) {
        const tt = i / 600 * Math.PI * 2;
        const x = cx + 110 * Math.sin(a * tt + t * 0.005);
        const y = cy + 110 * Math.sin(b * tt);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('频率比 ' + a + ':' + b, 12, 16);
      cap(ctx, V, '整数比 → 闭合图案');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 傅里叶：n 滑块 */
  AN.fourier = function (holder, o) {
    const V = mk(holder, 340, 180, true);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const n = Math.min(101, Math.max(1, Math.round(d.n || 5)));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < V.w; x++) {
        const u = (x - V.w / 2) / 40;
        let y = 0;
        for (let k = 1; k <= n; k += 2) y += Math.sin(k * u) / k;
        y *= 4 / Math.PI;
        const py = V.h / 2 - y * 35;
        if (x === 0) ctx.moveTo(x, py); else ctx.lineTo(x, py);
      }
      ctx.stroke();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('前 ' + n + ' 个奇次谐波叠加 → 逼近方波', 12, 16);
      cap(ctx, V, '跳变处的过冲 = 吉布斯现象');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 多边形：n 滑块 */
  AN.polygon = function (holder, o) {
    const V = mk(holder, 280, 220, false);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const n = Math.min(60, Math.max(3, Math.round(d.n || 5)));
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = V.h / 2, R = 80;
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const a = i * Math.PI * 2 / n - Math.PI / 2;
        const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(220,38,38,.5)';
      for (let i = 2; i < n - 1; i++) {
        const a = i * Math.PI * 2 / n - Math.PI / 2;
        ctx.beginPath(); ctx.moveTo(cx + R * Math.cos(-Math.PI / 2), cy + R * Math.sin(-Math.PI / 2)); ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a)); ctx.stroke();
      }
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText(n + ' 边形 = ' + (n - 2) + ' 个三角形，内角和 ' + (n - 2) * 180 + '°', 30, 16);
      cap(ctx, V, '边数越多越接近圆');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 杨辉：n 滑块 */
  AN.pascal = function (holder, o) {
    const V = mk(holder, 340, 220, true);
    (function loop() {
      const d = o.data || {};
      const n = Math.min(70, Math.max(2, Math.round(d.n || 12)));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      for (let r = 0; r <= n; r++) {
        for (let k = 0; k <= r; k++) {
          let v = 1; for (let i = 1; i <= k; i++) v = v * (r - i + 1) / i;
          const x = V.w / 2 + (k - r / 2) * Math.min(22, 320 / n);
          const y = 10 + r * Math.min(12, 200 / n);
          ctx.fillStyle = v % 2 ? '#f59e0b' : 'rgba(148,163,184,.25)';
          ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
        }
      }
      cap(ctx, V, '第 ' + n + ' 行：奇数染色 → 谢尔宾斯基三角形');
      window.requestAnimationFrame(loop);
    })();
  };

  /* 勾股数组：idx 选择 */
  AN.pythag = function (holder, o) {
    const TR = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [12, 35, 37], [9, 40, 41], [28, 45, 53], [11, 60, 61], [16, 63, 65], [33, 56, 65], [48, 55, 73], [13, 84, 85], [36, 77, 85], [39, 80, 89], [65, 72, 97], [20, 99, 101], [60, 91, 109], [15, 112, 113], [44, 117, 125]];
    const V = mk(holder, 320, 200, false);
    (function loop() {
      const d = o.data || {};
      const tr = TR[Math.min(TR.length - 1, Math.max(0, Math.round(d.idx || 0)))];
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const s = Math.min(12, 90 / tr[1]);
      const x0 = 130, y0 = 140;
      ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + tr[1] * s, y0); ctx.lineTo(x0, y0 - tr[0] * s); ctx.closePath(); ctx.stroke();
      ctx.fillStyle = 'rgba(37,99,235,.3)'; ctx.fillRect(x0 - tr[0] * s, y0 - tr[0] * s, tr[0] * s, tr[0] * s);
      ctx.fillStyle = 'rgba(220,38,38,.3)'; ctx.fillRect(x0, y0, tr[1] * s, Math.min(60, tr[1] * s));
      ctx.fillStyle = 'rgba(5,150,105,.3)'; ctx.fillRect(x0 + tr[1] * s + 6, y0 - Math.min(90, tr[2] * s), Math.min(90, tr[2] * s), Math.min(90, tr[2] * s));
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText(tr[0] + '²+' + tr[1] + '²=' + tr[2] + '²  (' + tr[0] * tr[0] + '+' + tr[1] * tr[1] + '=' + tr[2] * tr[2] + ')', 50, 16);
      cap(ctx, V, '三个正方形面积关系');
      window.requestAnimationFrame(loop);
    })();
  };

  /* 素数螺旋 */
  AN.prime = function (holder, o) {
    const V = mk(holder, 280, 280, true);
    function isP(n) { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
    (function loop() {
      const d = o.data || {};
      const upto = Math.min(4000, Math.max(100, Math.round(d.upto || 2000)));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      let x = 0, y = 0, dx = 1, dy = 0, steps = 1, cnt = 0;
      for (let i = 1; i <= upto; i++) {
        if (isP(i)) { ctx.fillStyle = '#f59e0b'; ctx.fillRect(V.w / 2 + x * 3, V.h / 2 + y * 3, 2.5, 2.5); }
        x += dx; y += dy; cnt++;
        if (cnt === steps) { cnt = 0; const tmp = dx; dx = -dy; dy = tmp; if (dy === 0) steps++; else if (dx === 0) steps++; }
      }
      cap(ctx, V, '乌拉姆螺旋：素数偏爱对角线（ upto=' + upto + '）');
      window.requestAnimationFrame(loop);
    })();
  };

  /* 焰色：idx 选择 */
  AN.flame = function (holder, o) {
    const FL = [['钠', '#fbbf24', '黄'], ['钾', '#c084fc', '紫'], ['铜', '#4ade80', '绿'], ['锂', '#f87171', '洋红'], ['钡', '#bef264', '黄绿'], ['锶', '#fb7185', '洋红'], ['钙', '#f97316', '砖红'], ['铯', '#38bdf8', '蓝'], ['铷', '#a78bfa', '紫']];
    const V = mk(holder, 260, 200, true);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const f = FL[Math.min(FL.length - 1, Math.max(0, Math.round(d.idx || 0)))];
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = V.w / 2;
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = f[1];
        ctx.globalAlpha = 0.7 - i * 0.1;
        ctx.beginPath();
        ctx.ellipse(cx + Math.sin(t * 0.15 + i) * 4, 140 - i * 16, 14 - i * 2, 22 - i * 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#475569'; ctx.fillRect(cx - 18, 150, 36, 22);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(f[0] + ' 的焰色：' + f[2], cx, 24); ctx.textAlign = 'left';
      cap(ctx, V, '电子跃迁放出特定波长的光');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 置换：idx 选择组合 */
  AN.displace = function (holder, o) {
    const CB = [['铁', '硫酸铜'], ['镁', '硫酸铜'], ['锌', '硫酸铜'], ['铁', '硝酸银'], ['铜', '硝酸银'], ['锌', '硫酸亚铁'], ['镁', '硝酸银'], ['铝', '硫酸铜']];
    const V = mk(holder, 300, 200, true);
    const parts = [];
    for (let i = 0; i < 10; i++) parts.push({ x: 60 + Math.random() * 180, y: 90 + Math.random() * 80, blue: true });
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const cb = CB[Math.min(CB.length - 1, Math.max(0, Math.round(d.idx || 0)))];
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      ctx.fillStyle = 'rgba(59,130,246,.2)';
      ctx.fillRect(40, 80, 220, 100);
      ctx.strokeStyle = '#64748b'; ctx.strokeRect(40, 80, 220, 100);
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(130, 60, 40, 110);
      parts.forEach(function (p) {
        p.x += Math.sin(t * 0.05 + p.y) * 0.5;
        p.y += Math.cos(t * 0.04 + p.x) * 0.5;
        if (t % 90 === 0 && p.blue) p.blue = false;
        ctx.fillStyle = p.blue ? '#38bdf8' : '#f97316';
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText(cb[0] + ' + ' + cb[1] + '：蓝=盐离子 橙=被置换金属', 30, 24);
      cap(ctx, V, '活泼金属把不活泼金属从盐里"换"出来');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 有机链：n + kind */
  AN.chain = function (holder, o) {
    const V = mk(holder, 340, 160, false);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const n = Math.min(10, Math.max(1, Math.round(d.n || 4)));
      const kind = Math.min(3, Math.max(0, Math.round(d.kind || 0)));
      const names = ['烷烃', '炔烃', '一元醇', '羧酸'];
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      for (let i = 0; i < n; i++) {
        const x = 30 + i * Math.min(30, 300 / n);
        const y = 80 + Math.sin(i + t * 0.03) * 8;
        ctx.fillStyle = '#334155';
        ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
        if (i < n - 1) { ctx.strokeStyle = '#64748b'; ctx.beginPath(); ctx.moveTo(x + 10, y); ctx.lineTo(x + Math.min(30, 300 / n) - 10, 80 + Math.sin(i + 1 + t * 0.03) * 8); ctx.stroke(); }
      }
      if (kind >= 2) {
        ctx.fillStyle = kind === 2 ? '#dc2626' : '#f59e0b';
        ctx.beginPath(); ctx.arc(30 + (n - 1) * Math.min(30, 300 / n) + 20, 80, 10, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText(names[kind] + ' C' + n + '：碳链' + (n > 6 ? '较长（更像油）' : '较短'), 12, 20);
      cap(ctx, V, '链越长分子间力越大；官能团决定性质');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 抛体：角度滑块 */
  AN.projAngle = function (holder, o) {
    const V = mk(holder, 340, 180, false);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const th = (d.th || 45) * Math.PI / 180;
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
      ctx.fillText('θ=' + (d.th || 45) + '°  射程=' + (v0 * v0 * Math.sin(2 * th) / g).toFixed(1) + 'm', 12, 16);
      cap(ctx, V, '45° 射程最大；互补角射程相同');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 落体：高度滑块 */
  AN.fallH = function (holder, o) {
    const V = mk(holder, 260, 200, false);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const h = Math.max(1, d.h || 20);
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const T = Math.sqrt(2 * h / 9.8);
      const tt = (t % 140) / 140 * T;
      const y = 0.5 * 9.8 * tt * tt;
      const py = 20 + Math.min(1, y / h) * 150;
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath(); ctx.moveTo(40, 20); ctx.lineTo(40, 170); ctx.stroke();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(130, py, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('h=' + h + 'm  t=' + tt.toFixed(2) + 's  v=' + (9.8 * tt).toFixed(1) + 'm/s', 50, 16);
      cap(ctx, V, '高度按平方律换时间');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 电阻：R1、R2 滑块 */
  AN.resistor = function (holder, o) {
    const V = mk(holder, 320, 170, false);
    (function loop() {
      const d = o.data || {};
      const a = d.a || 3, b = d.b || 6;
      const ser = a + b, par = a * b / (a + b);
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      ctx.fillStyle = 'rgba(37,99,235,.3)';
      ctx.fillRect(30, 50, a * 14, 14); ctx.fillRect(30 + a * 14, 50, b * 14, 14);
      ctx.strokeStyle = '#475569'; ctx.strokeRect(30, 50, ser * 14, 14);
      ctx.fillStyle = '#475569'; ctx.font = '10px sans-serif';
      ctx.fillText('串联 = 路变长 = ' + ser + 'Ω', 30, 40);
      ctx.fillStyle = 'rgba(220,38,38,.3)';
      ctx.fillRect(30, 100, 60, a * 3); ctx.fillRect(30, 104 + a * 3, 60, b * 3);
      ctx.strokeStyle = '#475569'; ctx.strokeRect(30, 100, 60, (a + b) * 3 + 4);
      ctx.fillText('并联 = 路变宽 = ' + par.toFixed(2) + 'Ω', 30, 96);
      cap(ctx, V, '并联总电阻比最小的还小');
      window.requestAnimationFrame(loop);
    })();
  };

  /* 因子和：n 滑块 */
  AN.divisors = function (holder, o) {
    const V = mk(holder, 320, 170, false);
    (function loop() {
      const d = o.data || {};
      const n = Math.max(2, Math.round(d.n || 28));
      const divs = [];
      for (let i = 1; i < n; i++) if (n % i === 0) divs.push(i);
      const sum = divs.reduce(function (s, x) { return s + x; }, 0);
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      ctx.fillStyle = '#2563eb';
      ctx.beginPath(); ctx.arc(60, 85, 24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(n, 60, 90); ctx.textAlign = 'left';
      divs.forEach(function (dv, i) {
        const a = i * Math.PI * 2 / divs.length - Math.PI / 2;
        const x = 200 + 60 * Math.cos(a), y = 85 + 55 * Math.sin(a);
        ctx.strokeStyle = '#94a3b8';
        ctx.beginPath(); ctx.moveTo(84, 85); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(dv, x, y + 3); ctx.textAlign = 'left';
      });
      ctx.fillStyle = sum === n ? '#16a34a' : '#64748b'; ctx.font = '12px sans-serif';
      ctx.fillText('真因子和 = ' + sum + (sum === n ? ' = ' + n + ' ✓ 完美数' : sum > n ? ' > ' + n + '（盈数）' : ' < ' + n + '（亏数）'), 60, 160);
      cap(ctx, V, '完美/盈/亏三分天下');
      window.requestAnimationFrame(loop);
    })();
  };

  /* 尺度：指数滑块 */
  AN.scale = function (holder, o) {
    const V = mk(holder, 340, 160, true);
    (function loop() {
      const d = o.data || {};
      const exp = Math.max(-18, Math.min(26, Math.round(d.exp || -9)));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      for (let e = -18; e <= 26; e += 4) {
        const x = 15 + (e + 18) / 44 * (V.w - 30);
        ctx.strokeStyle = '#334155';
        ctx.beginPath(); ctx.moveTo(x, 50); ctx.lineTo(x, 110); ctx.stroke();
        ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('1e' + e, x, 125);
      }
      ctx.textAlign = 'left';
      const x = 15 + (exp + 18) / 44 * (V.w - 30);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(x, 80, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText('当前尺度 10^' + exp + ' m', 12, 24);
      cap(ctx, V, '从质子到宇宙共 40+ 个数量级');
      window.requestAnimationFrame(loop);
    })();
  };

  /* 半衰期：idx 选择 */
  AN.decay = function (holder, o) {
    const ISO = [['C-14', 5730], ['U-238', 4.5e9], ['I-131', 8], ['Co-60', 5.27], ['H-3', 12.3], ['Ra-226', 1600], ['K-40', 1.25e9], ['Cs-137', 30], ['Sr-90', 29], ['Rn-222', 3.8], ['P-32', 14.3], ['Na-24', 0.62]];
    const V = mk(holder, 340, 180, true);
    const atoms = [];
    for (let i = 0; i < 120; i++) atoms.push({ x: 20 + (i % 20) * 15, y: 20 + Math.floor(i / 20) * 15 });
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const iso = ISO[Math.min(ISO.length - 1, Math.max(0, Math.round(d.idx || 0)))];
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
      ctx.fillText(iso[0] + '（T½=' + iso[1] + '）经过 ' + halves.toFixed(1) + ' 个半衰期，剩 ' + Math.round(frac * 100) + '%', 12, V.h - 24);
      cap(ctx, V, '统计规律：单个不可预测，整体精确减半');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 天体：idx 选择 */
  AN.gbody = function (holder, o) {
    const BOD = [['月球', 1.62], ['火星', 3.71], ['地球', 9.8], ['金星', 8.87], ['木星', 24.79], ['土星', 10.44], ['水星', 3.7], ['天王星', 8.87], ['海王星', 11.15], ['太阳', 274], ['谷神星', 0.28], ['冥王星', 0.62]];
    const V = mk(holder, 300, 180, true);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const b = BOD[Math.min(BOD.length - 1, Math.max(0, Math.round(d.idx || 2)))];
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      ctx.fillStyle = '#2563eb';
      ctx.beginPath(); ctx.arc(V.w / 2, V.h + 60, 110, 0, Math.PI * 2); ctx.fill();
      const T = Math.sqrt(2 * 2 / b[1]);
      const tt = (t % 120) / 120 * T;
      const y = 0.5 * b[1] * tt * tt;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(V.w / 2, 30 + Math.min(110, y * 20), 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText(b[0] + '  g=' + b[1] + ' m/s²（体重×' + (b[1] / 9.8).toFixed(2) + '）', 12, 20);
      cap(ctx, V, 'g=GM/R²：质量大半径小则重力强');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 巴尔末：n 滑块 */
  AN.balmer = function (holder, o) {
    const V = mk(holder, 340, 160, true);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const n = Math.min(12, Math.max(3, Math.round(d.n || 3)));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      for (let k = 3; k <= 6; k++) {
        const lam = Math.round(1 / (1.097e7 * (0.25 - 1 / (k * k))) / 1e-9);
        const x = 40 + (lam - 400) / 300 * 260;
        const on = k === n;
        ctx.strokeStyle = ['#ff5555', '#55ccff', '#7777ff', '#aa55ff'][k - 3];
        ctx.globalAlpha = on ? 1 : 0.3;
        ctx.lineWidth = on ? 5 : 2;
        ctx.beginPath(); ctx.moveTo(x, 30); ctx.lineTo(x, 110); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      const lam = Math.round(1 / (1.097e7 * (0.25 - 1 / (n * n))) / 1e-9);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('n=' + n + '→2：波长 ' + lam + ' nm', 12, 145);
      cap(ctx, V, '1/λ = R(1/4 - 1/n²)：氢原子指纹');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 多普勒：速度滑块 */
  AN.doppler = function (holder, o) {
    const V = mk(holder, 340, 170, true);
    let t = 0;
    const waves = [];
    (function loop() {
      const d = o.data || {};
      const v = Math.max(0, d.v || 6);
      const ctx = V.ctx;
      ctx.fillStyle = 'rgba(15,23,42,.3)'; ctx.fillRect(0, 0, V.w, V.h);
      const sx = 60 + ((t * v * 0.2) % 220);
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
      ctx.fillText('波源速度 ' + v + '：前方压缩（频率高）后方稀疏', 30, 20);
      cap(ctx, V, '救护车驶来音调变高的原因');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 波形：f、A 滑块 */
  AN.wave3 = function (holder, o) {
    const V = mk(holder, 340, 160, false);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const f = d.f || 2, A = d.A || 1;
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const cy = V.h / 2;
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < V.w - 20; x++) {
        const y = cy - Math.sin(x / 30 * f + t * 0.05) * A * 30;
        if (x === 0) ctx.moveTo(x + 10, y); else ctx.lineTo(x + 10, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('f=' + f + '  A=' + A + '：v=λf', 12, 16);
      cap(ctx, V, '频率定音调/颜色，振幅定响度/亮度');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 科赫：深度滑块 */
  AN.koch = function (holder, o) {
    const V = mk(holder, 300, 240, true);
    (function loop() {
      const d = o.data || {};
      const depth = Math.min(5, Math.max(0, Math.round(d.depth || 3)));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1;
      function koch(x1, y1, x2, y2, dd) {
        if (dd === 0) { ctx.lineTo(x2, y2); return; }
        const dx = (x2 - x1) / 3, dy = (y2 - y1) / 3;
        const ax = x1 + dx, ay = y1 + dy;
        const bx = x1 + 2 * dx, by = y1 + 2 * dy;
        const mx = (ax + bx) / 2 - dy * Math.sqrt(3) / 2;
        const my = (ay + by) / 2 + dx * Math.sqrt(3) / 2;
        koch(x1, y1, ax, ay, dd - 1); koch(ax, ay, mx, my, dd - 1);
        koch(mx, my, bx, by, dd - 1); koch(bx, by, x2, y2, dd - 1);
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
      window.requestAnimationFrame(loop);
    })();
  };

  /* 时间膨胀：v 滑块 */
  AN.time = function (holder, o) {
    const V = mk(holder, 300, 170, true);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const v = Math.min(0.99, Math.max(0, d.v || 0.8));
      const gamma = 1 / Math.sqrt(1 - v * v);
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.h ? 0 : 0, 0); ctx.fillRect(0, 0, V.w, V.h);
      const g = t * 0.05, s = t * 0.05 / gamma;
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(80, 90, 40, -Math.PI / 2, -Math.PI / 2 + g % (Math.PI * 2)); ctx.stroke();
      ctx.strokeStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(220, 90, 40, -Math.PI / 2, -Math.PI / 2 + s % (Math.PI * 2)); ctx.stroke();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('地面时钟（快）', 80, 150);
      ctx.fillText('飞船 v=' + v + 'c γ=' + gamma.toFixed(2), 220, 150);
      ctx.textAlign = 'left';
      cap(ctx, V, '运动使时间变慢');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 黄金螺线：增长率滑块 */
  AN.golden = function (holder, o) {
    const V = mk(holder, 300, 220, true);
    (function loop() {
      const d = o.data || {};
      const g = Math.max(1.005, Math.min(1.06, d.g || 1.02));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 600; i++) {
        const a = i * 0.05;
        const r = 2 * Math.pow(g, i * 0.5);
        const x = V.w / 2 + r * Math.cos(a), y = V.h / 2 + r * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        if (r > 110) break;
      }
      ctx.stroke();
      cap(ctx, V, '对数螺线：每转固定角度半径按固定比放大');
      window.requestAnimationFrame(loop);
    })();
  };
})();
