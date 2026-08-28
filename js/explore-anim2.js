/* explore-anim2.js — 资料篇动画引擎（第二批：数学/物理/化学/交叉前沿） */
(function () {
  const AN = window.ExploreAnim || (window.ExploreAnim = {});

  function mk(holder, w, h, dark) {
    const c = document.createElement('canvas');
    c.style.cssText = 'width:100%;max-width:' + w + 'px;border-radius:8px;display:block;background:' + (dark ? '#0f172a' : '#ffffff');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = w * dpr; c.height = h * dpr;
    const ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    holder.appendChild(c);
    return { ctx: ctx, w: w, h: h, canvas: c };
  }
  function label(ctx, w, h, text, dark) {
    ctx.fillStyle = dark ? '#94a3b8' : '#475569';
    ctx.font = '11px sans-serif';
    ctx.fillText(text, 10, h - 8);
  }
  function arrow(ctx, x1, y1, x2, y2, color) {
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 9 * Math.cos(a - 0.35), y2 - 9 * Math.sin(a - 0.35));
    ctx.lineTo(x2 - 9 * Math.cos(a + 0.35), y2 - 9 * Math.sin(a + 0.35));
    ctx.fill();
  }
  function slider(holder, min, max, step, val, onInput) {
    const s = document.createElement('input');
    s.type = 'range'; s.min = min; s.max = max; s.step = step; s.value = val;
    s.style.cssText = 'width:100%;margin-top:6px;accent-color:#2563eb';
    s.addEventListener('input', function () { onInput(Number(s.value)); });
    holder.appendChild(s);
    return s;
  }

  /* === 蒙特卡洛估算 π === */
  AN.monteCarloPi = function (holder) {
    const V = mk(holder, 320, 260, false);
    let inside = 0, total = 0;
    const info = document.createElement('div');
    info.style.cssText = 'font-size:12px;color:#475569;margin-top:6px;font-variant-numeric:tabular-nums';
    holder.appendChild(info);
    (function loop() {
      const ctx = V.ctx;
      for (let i = 0; i < 8; i++) {
        const x = Math.random(), y = Math.random();
        const inC = x * x + y * y <= 1;
        if (inC) inside++;
        total++;
        ctx.fillStyle = inC ? 'rgba(37,99,235,.75)' : 'rgba(220,38,38,.6)';
        ctx.fillRect(20 + x * 220, 20 + y * 220, 2, 2);
      }
      ctx.strokeStyle = '#94a3b8';
      ctx.strokeRect(20, 20, 220, 220);
      ctx.beginPath(); ctx.arc(20, 20, 220, 0, Math.PI / 2); ctx.stroke();
      const est = total ? 4 * inside / total : 0;
      info.textContent = '点数 ' + total + ' | 估算 π ≈ ' + est.toFixed(4) + '（真值 3.1416）';
      label(ctx, V.w, V.h, '蒙特卡洛：随机撒点，圆内比例 × 4 = π', false);
      window.requestAnimationFrame(loop);
    })();
  };

  /* === 逻辑斯蒂（人口）迭代 === */
  AN.logisticTime = function (holder) {
    const V = mk(holder, 340, 220, false);
    let r = 2.8, x = 0.2;
    const hist = [];
    slider(holder, 1, 4, 0.01, r, function (v) { r = v; hist.length = 0; x = 0.2; });
    (function loop() {
      x = r * x * (1 - x);
      hist.push(x);
      while (hist.length > 300) hist.shift();
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath(); ctx.moveTo(0, V.h - 25); ctx.lineTo(V.w, V.h - 25); ctx.stroke();
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2;
      ctx.beginPath();
      hist.forEach(function (v, i) {
        const px = i / 300 * V.w, py = V.h - 25 - v * (V.h - 50);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('r = ' + r.toFixed(2) + '（拖动滑块：稳定→周期→混沌）', 10, 16);
      label(ctx, V.w, V.h, '种群模型 x_{n+1}=rx(1-x) 的时间序列', false);
      window.requestAnimationFrame(loop);
    })();
  };

  /* === 傅里叶：圆叠加画方波（旋转矢量） === */
  AN.fourierCircles = function (holder) {
    const V = mk(holder, 340, 240, true);
    let n = 3, t = 0;
    slider(holder, 1, 15, 1, n, function (v) { n = v; });
    const wave = [];
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      let px = 90, py = V.h / 2;
      for (let k = 1; k <= n; k++) {
        const kk = 2 * k - 1;
        const r = 46 / kk;
        ctx.strokeStyle = 'rgba(148,163,184,.5)';
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.stroke();
        const nx = px + r * Math.cos(kk * t), ny = py + r * Math.sin(kk * t);
        ctx.strokeStyle = '#38bdf8';
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(nx, ny); ctx.stroke();
        px = nx; py = ny;
      }
      wave.unshift(py);
      while (wave.length > 220) wave.pop();
      ctx.strokeStyle = 'rgba(251,191,36,.9)'; ctx.lineWidth = 2;
      ctx.beginPath();
      wave.forEach(function (y, i) {
        const wx = 150 + i;
        if (i === 0) ctx.moveTo(wx, y); else ctx.lineTo(wx, y);
      });
      ctx.stroke();
      ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(148,163,184,.4)';
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(150, wave[0]); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('谐波数 ' + n + '（越多越接近方波）', 10, 16);
      label(ctx, V.w, V.h, '傅里叶级数：旋转矢量叠加 → 右侧展开波形', true);
      t += 0.03;
      window.requestAnimationFrame(loop);
    })();
  };

  /* === 素数筛（埃拉托斯特尼） === */
  AN.primeSieve = function (holder) {
    const V = mk(holder, 340, 240, false);
    const N = 120, cols = 12;
    const mark = new Array(N + 1).fill(false);
    let p = 2, idx = 4, t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      if (p <= Math.sqrt(N)) {
        if (idx <= N) {
          if (idx % p === 0 && idx !== p) mark[idx] = true;
          idx += p;
        } else {
          p++;
          while (p <= Math.sqrt(N) && mark[p]) p++;
          idx = p * p;
        }
      }
      for (let i = 2; i <= N; i++) {
        const col = (i - 2) % cols, row = Math.floor((i - 2) / cols);
        const x = 22 + col * 27, y = 30 + row * 19;
        const isP = !mark[i];
        ctx.fillStyle = isP ? (i === p ? '#fbbf24' : '#3b82f6') : '#e2e8f0';
        ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = isP ? '#fff' : '#94a3b8';
        ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(i, x, y + 3);
        ctx.textAlign = 'left';
      }
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('正在筛除 ' + (p <= Math.sqrt(N) ? p : '完毕') + ' 的倍数', 10, 16);
      label(ctx, V.w, V.h, '埃拉托斯特尼筛法：划去合数，留下素数', false);
      t++;
      if (t % 3 === 0) window.requestAnimationFrame(loop); else window.requestAnimationFrame(loop);
    })();
  };

  /* === 囚徒困境模拟 === */
  AN.dilemma = function (holder) {
    const V = mk(holder, 340, 230, false);
    const payoff = { CC: [3, 3], CD: [0, 5], DC: [5, 0], DD: [1, 1] };
    let strat = 'tit'; // 玩家策略
    let rounds = 0, scoreA = 0, scoreB = 0, lastMsg = '点击选择：合作 或 背叛（对方用"一报还一报"）';
    let oppLast = 'C', myLast = 'C';
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;margin-top:6px';
    const btnC = document.createElement('button'); btnC.className = 'btn'; btnC.textContent = '合作';
    const btnD = document.createElement('button'); btnD.className = 'btn secondary'; btnD.textContent = '背叛';
    row.appendChild(btnC); row.appendChild(btnD);
    holder.appendChild(row);
    function play(mine) {
      const opp = oppLast === 'C' ? 'C' : 'D';
      const key = mine + opp;
      scoreA += payoff[key][0]; scoreB += payoff[key][1];
      rounds++;
      lastMsg = '你' + (mine === 'C' ? '合作' : '背叛') + '，对方' + (opp === 'C' ? '合作' : '背叛') + ' → 你+' + payoff[key][0] + ' 对方+' + payoff[key][1];
      myLast = mine; oppLast = mine; // 一报还一报
      draw();
    }
    btnC.addEventListener('click', function () { play('C'); });
    btnD.addEventListener('click', function () { play('D'); });
    function draw() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      ctx.fillStyle = '#1e293b'; ctx.font = 'bold 13px sans-serif';
      ctx.fillText('囚徒困境（重复博弈）', 100, 24);
      ctx.font = '12px sans-serif'; ctx.fillStyle = '#475569';
      ctx.fillText(lastMsg, 20, 60);
      ctx.fillText('第 ' + rounds + ' 轮 | 你的总分 ' + scoreA + ' | 对方 ' + scoreB, 20, 85);
      // 收益矩阵
      const mx = 60, my = 110;
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(mx, my, 220, 90);
      ctx.beginPath(); ctx.moveTo(mx + 110, my); ctx.lineTo(mx + 110, my + 90); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx, my + 45); ctx.lineTo(mx + 220, my + 45); ctx.stroke();
      ctx.font = '11px sans-serif'; ctx.fillStyle = '#334155';
      ctx.fillText('你合作·对方合作: 3,3', mx + 8, my + 20);
      ctx.fillText('你合作·对方背叛: 0,5', mx + 8, my + 65);
      ctx.fillText('你背叛·对方合作: 5,0', mx + 118, my + 20);
      ctx.fillText('你背叛·对方背叛: 1,1', mx + 118, my + 65);
      label(ctx, V.w, V.h, '试试一直背叛、一直合作、或以牙还牙，看谁总分高', false);
    }
    draw();
  };

  /* === 四色定理：地图着色 === */
  AN.fourColor = function (holder) {
    const V = mk(holder, 320, 200, false);
    const colors = ['#ef4444', '#3b82f6', '#22c55e', '#facc15'];
    // 区域邻接：中心 + 环绕 6 块
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = 95;
      // 中心区
      ctx.fillStyle = colors[0];
      ctx.beginPath(); ctx.arc(cx, cy, 34, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3 + Math.PI / 6;
        ctx.fillStyle = colors[1 + (i % 3)];
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, 88, a - 0.5, a + 0.5);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.stroke();
      }
      ctx.strokeStyle = '#fff';
      ctx.beginPath(); ctx.arc(cx, cy, 34, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('相邻区域永不同色 —— 4 种颜色足够任何地图', 20, 186);
      t++;
      window.requestAnimationFrame(loop);
    })();
  };

  /* === 对角线法（康托尔）可视化 === */
  AN.diagonal = function (holder) {
    const V = mk(holder, 320, 230, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const n = 7;
      ctx.font = '13px monospace';
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const bit = (i * 7 + j * 3 + 1) % 2;
          ctx.fillStyle = '#1e293b';
          ctx.fillText(bit, 60 + j * 26, 40 + i * 24);
        }
        ctx.fillStyle = '#64748b';
        ctx.fillText('r' + (i + 1), 28, 40 + i * 24);
      }
      // 对角线高亮
      const d = Math.min(n - 1, Math.floor(t / 40));
      ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(52, 28); ctx.lineTo(52 + (d + 1) * 26, 28 + (d + 1) * 24); ctx.stroke();
      ctx.fillStyle = '#dc2626';
      ctx.fillText('对角线构造：翻转每位 → 新数不在表中', 60, 210);
      label(ctx, V.w, V.h, '康托尔对角线：实数不可数（总造出表外的小数）', false);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 双曲/球面几何：三角形内角和 === */
  AN.geoSum = function (holder) {
    const V = mk(holder, 340, 200, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const curv = Math.sin(t * 0.01) * 1.2; // -1 双曲 ~ +1 球面
      // 三角形三个角随曲率变化
      const sum = 180 + curv * 40;
      const a1 = sum * 0.4, a2 = sum * 0.35, a3 = sum - a1 - a2;
      ctx.fillStyle = 'rgba(37,99,235,.2)';
      ctx.beginPath();
      ctx.moveTo(100, 150); ctx.lineTo(240, 150); ctx.lineTo(170, 60 + curv * 15); ctx.closePath();
      ctx.fill(); ctx.strokeStyle = '#2563eb'; ctx.stroke();
      ctx.fillStyle = '#1e293b'; ctx.font = '12px sans-serif';
      ctx.fillText('内角和 = ' + sum.toFixed(0) + '°', 130, 30);
      ctx.fillStyle = '#64748b'; ctx.font = '11px sans-serif';
      ctx.fillText(curv > 0.2 ? '球面几何：内角和 > 180°' : curv < -0.2 ? '双曲几何：内角和 < 180°' : '欧氏几何：内角和 = 180°', 90, 176);
      label(ctx, V.w, V.h, '第五公设决定几何：曲率改变三角形内角和', false);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 图论：一笔画（欧拉路径） === */
  AN.eulerPath = function (holder) {
    const V = mk(holder, 320, 220, false);
    // 柯尼斯堡七桥简化图
    const nodes = [[80, 60], [240, 60], [80, 160], [240, 160], [160, 110]];
    const edgesList = [[0, 1], [0, 2], [1, 3], [2, 3], [0, 4], [1, 4], [2, 4]];
    let step = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const done = Math.floor((step / 60)) % (edgesList.length + 1);
      edgesList.forEach(function (e, i) {
        ctx.strokeStyle = i < done ? '#dc2626' : '#94a3b8';
        ctx.lineWidth = i < done ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(nodes[e[0]][0], nodes[e[0]][1]);
        ctx.lineTo(nodes[e[1]][0], nodes[e[1]][1]);
        ctx.stroke();
      });
      nodes.forEach(function (nd) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(nd[0], nd[1], 8, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText(done > edgesList.length ? '存在奇度顶点 → 无法不重复走完' : '尝试一笔画…', 40, 195);
      label(ctx, V.w, V.h, '欧拉：奇度顶点数为 0 或 2 才能一笔画', false);
      step++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 随机游走分布（正态涌现） === */
  AN.cltBars = function (holder) {
    const V = mk(holder, 340, 220, true);
    const bins = new Array(41).fill(0);
    let t = 0;
    (function loop() {
      for (let i = 0; i < 20; i++) {
        let x = 0;
        for (let s = 0; s < 40; s++) x += Math.random() < 0.5 ? -1 : 1;
        bins[x + 20]++;
      }
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const max = Math.max.apply(null, bins) || 1;
      bins.forEach(function (b, i) {
        const hgt = b / max * 160;
        ctx.fillStyle = 'rgba(56,189,248,.8)';
        ctx.fillRect(20 + i * 7.4, V.h - 25 - hgt, 6, hgt);
      });
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('样本数 ' + (t * 20), 10, 16);
      label(ctx, V.w, V.h, '中心极限定理：大量随机游走的终点分布 → 正态钟形', true);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === boids 群智涌现 === */
  AN.boids = function (holder) {
    const V = mk(holder, 340, 240, true);
    const bs = [];
    for (let i = 0; i < 40; i++) {
      bs.push({ x: Math.random() * 340, y: Math.random() * 240, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2 });
    }
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = 'rgba(15,23,42,.35)'; ctx.fillRect(0, 0, V.w, V.h);
      bs.forEach(function (b) {
        let sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0, n = 0;
        bs.forEach(function (o) {
          if (o === b) return;
          const d = Math.hypot(o.x - b.x, o.y - b.y);
          if (d < 40) {
            n++;
            cx += o.x; cy += o.y;
            ax += o.vx; ay += o.vy;
            if (d < 14) { sx += b.x - o.x; sy += b.y - o.y; }
          }
        });
        if (n) {
          b.vx += ((cx / n - b.x) * 0.002) + (ax / n - b.vx) * 0.05 + sx * 0.04;
          b.vy += ((cy / n - b.y) * 0.002) + (ay / n - b.vy) * 0.05 + sy * 0.04;
        }
        const sp = Math.hypot(b.vx, b.vy) || 1;
        b.vx = b.vx / sp * Math.min(2, sp); b.vy = b.vy / sp * Math.min(2, sp);
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0) b.x += 340; if (b.x > 340) b.x -= 340;
        if (b.y < 0) b.y += 240; if (b.y > 240) b.y -= 240;
        const a = Math.atan2(b.vy, b.vx);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(b.x + 6 * Math.cos(a), b.y + 6 * Math.sin(a));
        ctx.lineTo(b.x + 5 * Math.cos(a + 2.5), b.y + 5 * Math.sin(a + 2.5));
        ctx.lineTo(b.x + 5 * Math.cos(a - 2.5), b.y + 5 * Math.sin(a - 2.5));
        ctx.fill();
      });
      label(ctx, V.w, V.h, '三条局部规则（聚集/对齐/分离）→ 涌现出群体行为', true);
      window.requestAnimationFrame(loop);
    })();
  };

  /* === 薛定谔波包（无限深势阱） === */
  AN.wavepacket = function (holder) {
    const V = mk(holder, 340, 200, true);
    let n = 1, t = 0;
    slider(holder, 1, 6, 1, n, function (v) { n = v; });
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const mid = V.h / 2;
      ctx.strokeStyle = '#475569';
      ctx.beginPath(); ctx.moveTo(40, 20); ctx.lineTo(40, V.h - 20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(V.w - 40, 20); ctx.lineTo(V.w - 40, V.h - 20); ctx.stroke();
      // ψ
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 40; x <= V.w - 40; x++) {
        const u = (x - 40) / (V.w - 80);
        const psi = Math.sin(n * Math.PI * u) * Math.cos(n * n * t * 0.05);
        const y = mid - psi * 60;
        if (x === 40) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // |ψ|² 概率密度
      ctx.strokeStyle = 'rgba(251,191,36,.8)';
      ctx.beginPath();
      for (let x = 40; x <= V.w - 40; x++) {
        const u = (x - 40) / (V.w - 80);
        const p2 = Math.sin(n * Math.PI * u) ** 2;
        const y = mid - p2 * 60;
        if (x === 40) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('能级 n=' + n + '（蓝=ψ，黄=|ψ|² 概率密度）', 10, 16);
      label(ctx, V.w, V.h, '势阱中的量子化能级：能量只能取分立值', true);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 时空弯曲（质量压弯网格） === */
  AN.spacetime = function (holder) {
    const V = mk(holder, 320, 240, true);
    let t = 0;
    let mx = 160, my = 120;
    V.canvas.addEventListener('mousemove', function (e) {
      const r = V.canvas.getBoundingClientRect();
      mx = (e.clientX - r.left) * V.w / r.width;
      my = (e.clientY - r.top) * V.h / r.height;
    });
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      ctx.strokeStyle = 'rgba(56,189,248,.35)';
      for (let i = 0; i <= 10; i++) {
        ctx.beginPath();
        for (let j = 0; j <= 32; j++) {
          const x = j * V.w / 32;
          let y = i * V.h / 10;
          const d = Math.hypot(x - mx, y - my);
          y += 26 * Math.exp(-d * d / 2600) * (y > my ? 1 : -0.4);
          if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(mx, my, 10, 0, Math.PI * 2); ctx.fill();
      label(ctx, V.w, V.h, '质量弯曲时空（移动鼠标移动"恒星"）', true);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 熵增：有序→无序 === */
  AN.entropy = function (holder) {
    const V = mk(holder, 320, 200, true);
    let ps = [];
    let t = 0;
    function reset() {
      ps = [];
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
        ps.push({ x: 40 + i * 20, y: 40 + j * 14, vx: 0, vy: 0, kicked: false });
      }
    }
    reset();
    const btn = document.createElement('button');
    btn.className = 'btn secondary'; btn.textContent = '重置为有序';
    btn.style.marginTop = '6px';
    btn.addEventListener('click', reset);
    holder.appendChild(btn);
    let kicked = false;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      if (!kicked && t > 90) {
        kicked = true;
        ps.forEach(function (p) { p.vx = (Math.random() - 0.5) * 2.4; p.vy = (Math.random() - 0.5) * 2.4; });
      }
      ps.forEach(function (p) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 20 || p.x > V.w - 20) p.vx = -p.vx;
        if (p.y < 20 || p.y > V.h - 25) p.vy = -p.vy;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
      });
      label(ctx, V.w, V.h, kicked ? '无序度（熵）增加——这就是时间箭头' : '初始：晶格有序排列…', true);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 黑洞：光线弯折 === */
  AN.blackhole = function (holder) {
    const V = mk(holder, 320, 240, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = 'rgba(15,23,42,.3)'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = V.h / 2;
      // 视界
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI * 2); ctx.stroke();
      // 光线偏折（简化：从左侧来的光子受引力弯曲）
      for (let k = 0; k < 7; k++) {
        let x = 0, y = 30 + k * 30, vx = 3, vy = 0;
        ctx.strokeStyle = 'rgba(56,189,248,.6)';
        ctx.beginPath(); ctx.moveTo(x, y);
        for (let s = 0; s < 120; s++) {
          const dx = cx - x, dy = cy - y;
          const d = Math.max(20, Math.hypot(dx, dy));
          const f = 300 / (d * d);
          vx += dx / d * f; vy += dy / d * f;
          x += vx; y += vy;
          ctx.lineTo(x, y);
          if (d <= 24 || x > V.w || y < 0 || y > V.h) break;
        }
        ctx.stroke();
      }
      label(ctx, V.w, V.h, '黑洞：引力使光线弯折，视界内无法逃逸', true);
      t += 60;
      window.requestAnimationFrame(loop);
    })();
  };

  /* === 引力波（双黑洞并合的时空涟漪） === */
  AN.gravWave = function (holder) {
    const V = mk(holder, 320, 220, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = V.h / 2;
      const phase = t * 0.05;
      const sep = Math.max(6, 30 * Math.exp(-t * 0.003));
      // 双星
      const a1 = phase * (1 + t * 0.001);
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath(); ctx.arc(cx + sep * Math.cos(a1), cy + sep * Math.sin(a1), 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx - sep * Math.cos(a1), cy - sep * Math.sin(a1), 6, 0, Math.PI * 2); ctx.fill();
      // 涟漪
      for (let r = 0; r < 4; r++) {
        const rr = ((t * 1.5 + r * 40) % 160) + 10;
        ctx.strokeStyle = 'rgba(56,189,248,' + (0.6 - rr / 300) + ')';
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.stroke();
      }
      label(ctx, V.w, V.h, '双黑洞旋近并合 → 时空涟漪（引力波）向外传播', true);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 量子纠缠：关联测量 === */
  AN.entangle = function (holder) {
    const V = mk(holder, 320, 200, false);
    let t = 0, msg = '点击测量，观察两个粒子的瞬时关联';
    let results = [];
    const btn = document.createElement('button');
    btn.className = 'btn'; btn.textContent = '测量一次';
    btn.style.marginTop = '6px';
    btn.addEventListener('click', function () {
      const s = Math.random() < 0.5 ? 1 : -1;
      results.push([s, -s]);
      if (results.length > 8) results.shift();
      msg = '自旋测量：A=' + (s > 0 ? '↑' : '↓') + '，B 瞬间为' + (s > 0 ? '↓' : '↑') + '（总为相反）';
      draw();
    });
    holder.appendChild(btn);
    function draw() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(90, 80, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath(); ctx.arc(230, 80, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('A', 90, 85); ctx.fillText('B', 230, 85);
      ctx.textAlign = 'left';
      ctx.strokeStyle = '#94a3b8'; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(112, 80); ctx.lineTo(208, 80); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText(msg, 16, 130);
      ctx.fillText('历史：' + results.map(function (r) { return (r[0] > 0 ? '↑↓' : '↓↑'); }).join(' '), 16, 150);
      label(ctx, V.w, V.h, '纠缠态：测量一方，另一方状态瞬时确定（与距离无关）', false);
    }
    draw();
  };

  /* === 恒星核合成（元素锻造） === */
  AN.nucleosynthesis = function (holder) {
    const V = mk(holder, 340, 200, true);
    const stages = ['H 氢燃烧', 'He 氦燃烧', 'C 碳燃烧', 'O 氧燃烧', 'Si 硅燃烧', 'Fe 铁（终点）'];
    const colors = ['#f87171', '#fbbf24', '#4ade80', '#38bdf8', '#c084fc', '#94a3b8'];
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const idx = Math.floor(t / 130) % stages.length;
      const cx = V.w / 2, cy = 90;
      // 洋葱结构恒星
      for (let i = stages.length - 1; i >= 0; i--) {
        const r = 18 + i * 12;
        ctx.fillStyle = colors[i] + (i === idx ? 'ff' : '44');
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(stages[idx], cx, cy + 4);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif';
      ctx.fillText('大质量恒星逐层核聚变：从氢烧到铁', 80, 176);
      label(ctx, V.w, V.h, '比铁更重的元素来自中子俘获（超新星/中子星并合）', true);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 网络科学：无标度网络 === */
  AN.scaleFree = function (holder) {
    const V = mk(holder, 320, 230, true);
    const nodes = [{ x: 160, y: 110, deg: 0 }];
    const links = [];
    for (let i = 0; i < 30; i++) {
      // 优先连接：按度数加权选目标
      const totalDeg = nodes.reduce(function (s, n) { return s + n.deg + 1; }, 0);
      let r = Math.random() * totalDeg, target = 0;
      for (let j = 0; j < nodes.length; j++) {
        r -= nodes[j].deg + 1;
        if (r <= 0) { target = j; break; }
      }
      const tNode = nodes[target];
      const a = Math.random() * Math.PI * 2;
      const nd = { x: tNode.x + Math.cos(a) * (30 + Math.random() * 30), y: tNode.y + Math.sin(a) * (30 + Math.random() * 30), deg: 0 };
      nd.x = Math.max(10, Math.min(310, nd.x)); nd.y = Math.max(10, Math.min(200, nd.y));
      nodes.push(nd);
      tNode.deg++;
      links.push([nodes.length - 1, target]);
    }
    const ctx = V.ctx;
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
    links.forEach(function (l) {
      ctx.strokeStyle = 'rgba(148,163,184,.4)';
      ctx.beginPath(); ctx.moveTo(nodes[l[0]].x, nodes[l[0]].y); ctx.lineTo(nodes[l[1]].x, nodes[l[1]].y); ctx.stroke();
    });
    nodes.forEach(function (n) {
      ctx.fillStyle = n.deg > 5 ? '#fbbf24' : '#38bdf8';
      ctx.beginPath(); ctx.arc(n.x, n.y, 2.5 + n.deg * 0.8, 0, Math.PI * 2); ctx.fill();
    });
    label(ctx, V.w, V.h, '优先连接 → 枢纽节点（幂律分布）：对随机故障鲁棒、对枢纽攻击脆弱', true);
  };

  /* === 手性分子（左右镜像） === */
  AN.chiral = function (holder) {
    const V = mk(holder, 340, 180, false);
    let t = 0;
    function molecule(cx, flip) {
      const ctx = V.ctx;
      ctx.fillStyle = '#334155';
      ctx.beginPath(); ctx.arc(cx, 90, 12, 0, Math.PI * 2); ctx.fill();
      const bonds = [[0, -34, '#dc2626'], [32 * flip, 18, '#3b82f6'], [-32 * flip, 18, '#22c55e'], [0, 36, '#94a3b8']];
      bonds.forEach(function (b) {
        ctx.strokeStyle = '#64748b';
        ctx.beginPath(); ctx.moveTo(cx, 90); ctx.lineTo(cx + b[0], 90 + b[1]); ctx.stroke();
        ctx.fillStyle = b[2];
        ctx.beginPath(); ctx.arc(cx + b[0], 90 + b[1], 8, 0, Math.PI * 2); ctx.fill();
      });
    }
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      molecule(100, 1);
      molecule(240, -1);
      ctx.setLineDash([4, 4]); ctx.strokeStyle = '#94a3b8';
      ctx.beginPath(); ctx.moveTo(170, 30); ctx.lineTo(170, 150); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('左手分子', 72, 30); ctx.fillText('右手分子', 212, 30);
      label(ctx, V.w, V.h, '手性：镜像不能重合——两种对映体药效可能天差地别', false);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 催化：活化能对比 === */
  AN.catalysis = function (holder) {
    const V = mk(holder, 340, 200, false);
    let t = 0;
    const balls = [];
    for (let i = 0; i < 24; i++) balls.push({ x: 20 + Math.random() * 60, v: 0.5 + Math.random() * 1.5, cat: i % 2 === 0 });
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      // 能量山（无催化）与隧道（有催化）
      ctx.fillStyle = 'rgba(148,163,184,.3)';
      ctx.beginPath();
      ctx.moveTo(100, 160); ctx.quadraticCurveTo(170, 20, 240, 160);
      ctx.fill();
      ctx.fillStyle = 'rgba(5,150,105,.25)';
      ctx.beginPath();
      ctx.moveTo(100, 160); ctx.quadraticCurveTo(170, 90, 240, 160);
      ctx.fill();
      balls.forEach(function (b) {
        const barrier = b.cat ? 115 : 45;
        b.x += b.v;
        const onHill = b.x > 100 && b.x < 240;
        const y = onHill ? (b.cat ? 160 - (115 - Math.abs(170 - b.x) * 1.3) * 0.6 : 160 - (140 - Math.abs(170 - b.x) * 1.9) * 0.9) : 160;
        if (onHill && b.x === 170) { /* peak */ }
        ctx.fillStyle = b.cat ? '#059669' : '#dc2626';
        ctx.beginPath(); ctx.arc(b.x, Math.min(160, y), 4, 0, Math.PI * 2); ctx.fill();
        if (b.x > V.w - 20) { b.x = 20; }
      });
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('红=无催化（翻越高山） 绿=有催化（走低谷）', 50, 30);
      label(ctx, V.w, V.h, '催化剂降低活化能：反应路径的能量门槛变低', false);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 电化学：锂离子电池摇椅 === */
  AN.battery = function (holder) {
    const V = mk(holder, 340, 190, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const charging = (t % 300) < 150;
      // 两极
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(50, 60, 24, 90);
      ctx.fillStyle = '#b45309'; ctx.fillRect(V.w - 74, 60, 24, 90);
      ctx.fillStyle = '#1e293b'; ctx.font = '11px sans-serif';
      ctx.fillText('负极(石墨)', 38, 48); ctx.fillText('正极(钴酸锂)', V.w - 92, 48);
      // 电解液
      ctx.fillStyle = 'rgba(59,130,246,.1)'; ctx.fillRect(74, 60, V.w - 148, 90);
      // Li+ 往返
      for (let i = 0; i < 5; i++) {
        const ph = ((t * 0.8 + i * 60) % 300) / 300;
        const dir = charging ? 1 - ph : ph;
        const x = 74 + dir * (V.w - 148);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(x, 80 + i * 12, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Li', x, 83 + i * 12);
        ctx.textAlign = 'left';
      }
      // 外电路电子
      ctx.strokeStyle = '#475569';
      ctx.beginPath(); ctx.moveTo(62, 60); ctx.lineTo(62, 26); ctx.lineTo(V.w - 62, 26); ctx.lineTo(V.w - 62, 60); ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText(charging ? '充电：Li⁺ 回到负极储存' : '放电：Li⁺ 游向正极做功', 105, 172);
      label(ctx, V.w, V.h, '摇椅式电池：锂离子在正负极间往返嵌入/脱出', false);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 自由能：ΔG=ΔH-TΔS 天平 === */
  AN.gibbs = function (holder) {
    const V = mk(holder, 340, 200, false);
    let T = 300, dH = -50, dS = 0.1;
    const info = document.createElement('div');
    info.style.cssText = 'font-size:12px;color:#475569;margin-top:6px';
    holder.appendChild(info);
    slider(holder, 100, 1000, 10, T, function (v) { T = v; draw(); });
    function draw() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const dG = dH - T * dS / 1000 * 1000;
      const tilt = Math.max(-0.4, Math.min(0.4, dG / 200));
      // 天平
      const cx = V.w / 2, cy = 90;
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + 60); ctx.stroke();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tilt);
      ctx.beginPath(); ctx.moveTo(-90, 0); ctx.lineTo(90, 0); ctx.stroke();
      ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(-90, -10, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2563eb'; ctx.beginPath(); ctx.arc(90, -10, 14, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('ΔH 焓', 40, 30); ctx.fillText('TΔS 熵×温度', V.w - 110, 30);
      info.textContent = 'T=' + T + 'K | ΔG = ΔH − TΔS = ' + dG.toFixed(0) + ' kJ/mol → ' + (dG < 0 ? '自发 ✓' : '非自发 ✗');
      label(ctx, V.w, V.h, '拖动温度：熵驱动的反应在高温下变自发', false);
    }
    draw();
  };

  /* === AlphaFold 风格：蛋白质折叠 === */
  AN.proteinFold = function (holder) {
    const V = mk(holder, 320, 220, true);
    const N = 40;
    let pts = [];
    for (let i = 0; i < N; i++) pts.push({ x: 30 + i * 6.5, y: 110 + (Math.random() - 0.5) * 120 });
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = 'rgba(15,23,42,.25)'; ctx.fillRect(0, 0, V.w, V.h);
      // 简化折叠：每个点向"能量低"的螺旋目标靠近
      const cx = V.w / 2, cy = 110;
      pts.forEach(function (p, i) {
        const a = i * 0.6 + t * 0.01;
        const tx = cx + Math.cos(a) * (40 + (i % 7) * 6);
        const ty = cy + Math.sin(a * 1.4) * 45;
        p.x += (tx - p.x) * 0.02;
        p.y += (ty - p.y) * 0.02;
      });
      ctx.strokeStyle = 'rgba(74,222,128,.9)'; ctx.lineWidth = 2;
      ctx.beginPath();
      pts.forEach(function (p, i) { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
      ctx.stroke();
      ctx.fillStyle = '#4ade80';
      pts.forEach(function (p) { ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill(); });
      label(ctx, V.w, V.h, '蛋白质折叠：氨基酸链自发盘曲成特定三维结构', true);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === P vs NP：搜索爆炸 === */
  AN.pnp = function (holder) {
    const V = mk(holder, 340, 200, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const n = 3 + Math.floor((t / 90) % 6);
      // 指数增长条
      const bars = [];
      for (let i = 1; i <= n; i++) bars.push(Math.pow(2, i));
      const max = bars[bars.length - 1];
      bars.forEach(function (b, i) {
        const w = b / max * 260;
        ctx.fillStyle = 'hsl(' + (210 - i * 25) + ',70%,55%)';
        ctx.fillRect(60, 30 + i * 20, w, 12);
        ctx.fillStyle = '#475569'; ctx.font = '10px sans-serif';
        ctx.fillText('n=' + i + ': ' + (b > 1e6 ? b.toExponential(1) : b), 64 + w, 40 + i * 20);
      });
      label(ctx, V.w, V.h, '组合爆炸：n 稍增，可能解数量 2ⁿ 级增长 → 有些问题本质上难', false);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 对称性与守恒（诺特） === */
  AN.nother = function (holder) {
    const V = mk(holder, 320, 190, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const y = 100 + Math.sin(t * 0.04) * 25;
      // 匀速运动（空间平移对称→动量守恒）
      ctx.fillStyle = '#2563eb';
      ctx.beginPath(); ctx.arc(60 + (t % 220), y, 9, 0, Math.PI * 2); ctx.fill();
      arrow(ctx, 60 + (t % 220) + 12, y, 60 + (t % 220) + 42, y, '#2563eb');
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('空间平移对称 ⇄ 动量守恒', 70, 30);
      ctx.fillText('时间平移对称 ⇄ 能量守恒', 70, 50);
      ctx.fillText('旋转对称 ⇄ 角动量守恒', 70, 70);
      label(ctx, V.w, V.h, '诺特定理：每一种对称性对应一个守恒量', false);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 相变/涌现：伊辛模型（磁化） === */
  AN.ising = function (holder) {
    const N = 32, size = 9;
    const V = mk(holder, N * size + 20, N * size + 30, true);
    let spins = [];
    for (let i = 0; i < N * N; i++) spins.push(Math.random() < 0.5 ? 1 : -1);
    let Tcur = 2.5;
    slider(holder, 0.5, 5, 0.1, Tcur, function (v) { Tcur = v; });
    (function loop() {
      for (let k = 0; k < 60; k++) {
        const i = Math.floor(Math.random() * N), j = Math.floor(Math.random() * N);
        const s = spins[i * N + j];
        let sum = 0;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          sum += spins[((i + d[0] + N) % N) * N + ((j + d[1] + N) % N)];
        });
        const dE = 2 * s * sum;
        if (dE <= 0 || Math.random() < Math.exp(-dE / Tcur)) spins[i * N + j] = -s;
      }
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        ctx.fillStyle = spins[i * N + j] > 0 ? '#f87171' : '#38bdf8';
        ctx.fillRect(10 + i * size, 10 + j * size, size - 1, size - 1);
      }
      label(ctx, V.w, V.h, '伊辛模型：低温有序（磁化）、高温无序 —— 相变与涌现（拖动温度）', true);
      window.requestAnimationFrame(loop);
    })();
  };

  /* === 麦克斯韦方程（电磁波辐射） === */
  AN.maxwell = function (holder) {
    const V = mk(holder, 340, 210, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = V.h / 2;
      // 振荡偶极子
      const osc = Math.sin(t * 0.08) * 14;
      ctx.fillStyle = osc > 0 ? '#dc2626' : '#3b82f6';
      ctx.beginPath(); ctx.arc(cx, cy - 20 + osc * 0.3, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = osc > 0 ? '#3b82f6' : '#dc2626';
      ctx.beginPath(); ctx.arc(cx, cy + 20 - osc * 0.3, 7, 0, Math.PI * 2); ctx.fill();
      // 辐射波前
      for (let r = 0; r < 4; r++) {
        const rr = ((t * 1.2 + r * 45) % 180) + 8;
        ctx.strokeStyle = 'rgba(251,191,36,' + (0.7 - rr / 260) + ')';
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.stroke();
      }
      label(ctx, V.w, V.h, '振荡电荷辐射电磁波 —— 麦克斯韦方程组的预言', true);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 半导体能带 === */
  AN.bandgap = function (holder) {
    const V = mk(holder, 340, 210, false);
    let t = 0;
    const electrons = [];
    for (let i = 0; i < 10; i++) electrons.push({ y: 150 + Math.random() * 30, excited: false, x: 30 + Math.random() * 280 });
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      // 能带
      ctx.fillStyle = 'rgba(59,130,246,.2)'; ctx.fillRect(20, 140, 300, 50);
      ctx.fillStyle = 'rgba(220,38,38,.2)'; ctx.fillRect(20, 40, 300, 50);
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('导带（导电）', 140, 34);
      ctx.fillText('价带（束缚）', 140, 206);
      ctx.fillText('禁带', 152, 118);
      electrons.forEach(function (e) {
        if (!e.excited && Math.random() < 0.006) e.excited = true;
        if (e.excited && e.y > 60) e.y -= 1.2;
        else e.y += (Math.random() - 0.5) * 2;
        e.x += (Math.random() - 0.5) * 3;
        e.x = Math.max(25, Math.min(315, e.x));
        ctx.fillStyle = e.excited ? '#dc2626' : '#2563eb';
        ctx.beginPath(); ctx.arc(e.x, e.y, 4, 0, Math.PI * 2); ctx.fill();
      });
      label(ctx, V.w, V.h, '电子获得能量跃过禁带 → 进入导带导电（半导体/光伏原理）', false);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 中微子穿透 === */
  AN.neutrino = function (holder) {
    const V = mk(holder, 340, 180, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = 'rgba(15,23,42,.2)'; ctx.fillRect(0, 0, V.w, V.h);
      // 地球
      ctx.fillStyle = 'rgba(37,99,235,.35)';
      ctx.beginPath(); ctx.arc(V.w / 2, V.h / 2, 55, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#93c5fd'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('地球', V.w / 2, V.h / 2 + 4);
      ctx.textAlign = 'left';
      // 中微子流直接穿过
      for (let i = 0; i < 6; i++) {
        const y = 30 + i * 22;
        const x = ((t * 3 + i * 60) % (V.w + 40)) - 20;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(251,191,36,.3)';
        ctx.beginPath(); ctx.moveTo(x - 14, y); ctx.lineTo(x, y); ctx.stroke();
      }
      label(ctx, V.w, V.h, '每秒万亿个中微子穿过你的身体——几乎不发生任何作用', true);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 超导体：迈斯纳效应（磁悬浮） === */
  AN.meissner = function (holder) {
    const V = mk(holder, 320, 200, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const float = 6 + Math.sin(t * 0.05) * 3;
      // 超导体
      ctx.fillStyle = '#64748b';
      ctx.fillRect(V.w / 2 - 60, 140, 120, 16);
      // 磁铁悬浮
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(V.w / 2 - 30, 140 - 40 - float, 60, 20);
      // 排斥磁场线
      ctx.strokeStyle = 'rgba(59,130,246,.5)';
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.arc(V.w / 2 + i * 22, 128, 16, Math.PI, 0);
        ctx.stroke();
      }
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('迈斯纳效应：超导体完全排斥磁场 → 磁悬浮', 40, 30);
      label(ctx, V.w, V.h, '零电阻 + 完全抗磁性 = 超导体的两大特征', false);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 激光：受激辐射链式 === */
  AN.laser = function (holder) {
    const V = mk(holder, 340, 180, true);
    let photons = [{ x: 40, y: 90 }];
    let atoms = [];
    for (let i = 0; i < 8; i++) atoms.push({ x: 80 + i * 30, y: 90, excited: true });
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = 'rgba(15,23,42,.25)'; ctx.fillRect(0, 0, V.w, V.h);
      atoms.forEach(function (a) {
        ctx.fillStyle = a.excited ? '#fbbf24' : '#475569';
        ctx.beginPath(); ctx.arc(a.x, a.y + Math.sin(t * 0.1 + a.x) * 15, 6, 0, Math.PI * 2); ctx.fill();
      });
      const news = [];
      photons.forEach(function (p) {
        p.x += 2.4;
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(p.x - 6, p.y, 12, 2);
        atoms.forEach(function (a) {
          const ay = a.y + Math.sin(t * 0.1 + a.x) * 15;
          if (a.excited && Math.abs(p.x - a.x) < 5 && Math.abs(p.y - ay) < 12) {
            a.excited = false;
            news.push({ x: a.x, y: p.y });
          }
        });
      });
      photons = photons.concat(news).filter(function (p) { return p.x < V.w - 10; });
      if (photons.length === 0) { photons = [{ x: 40, y: 90 }]; atoms.forEach(function (a) { a.excited = true; }); }
      label(ctx, V.w, V.h, '受激辐射：一个光子激发出一个同频同相的光子 → 光放大', true);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 核聚变：氘氚聚变 === */
  AN.fusion = function (holder) {
    const V = mk(holder, 320, 200, false);
    let t = 0, phase = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = 95;
      if (phase === 0) {
        // 接近
        const d = Math.max(8, 80 - t * 0.5);
        ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(cx - d, cy, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(cx + d, cy, 16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('D', cx - d, cy + 3); ctx.fillText('T', cx + d, cy + 3);
        ctx.textAlign = 'left';
        if (d <= 8) { phase = 1; t = 0; }
      } else {
        // 爆发
        const rr = t * 2;
        ctx.strokeStyle = 'rgba(245,158,11,' + Math.max(0, 1 - t / 60) + ')';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.arc(cx + 20, cy - 10, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(cx - 30 - t, cy + 15, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
        ctx.fillText('⁴He + n + 17.6 MeV', cx - 40, cy + 60);
        if (t > 90) { phase = 0; t = 0; }
      }
      label(ctx, V.w, V.h, '氘氚聚变：质量亏损释放巨大能量（太阳的能量之源）', false);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 宇宙膨胀（气球模型） === */
  AN.expanding = function (holder) {
    const V = mk(holder, 320, 220, true);
    let t = 0;
    const galaxies = [];
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2, r = 20 + Math.random() * 60;
      galaxies.push({ a: a, r0: r });
    }
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const scale = 1 + (t % 400) / 400 * 0.8;
      const cx = V.w / 2, cy = V.h / 2;
      galaxies.forEach(function (g) {
        const r = g.r0 * scale;
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath(); ctx.arc(cx + r * Math.cos(g.a), cy + r * Math.sin(g.a), 3, 0, Math.PI * 2); ctx.fill();
      });
      ctx.strokeStyle = 'rgba(148,163,184,.3)';
      ctx.beginPath(); ctx.arc(cx, cy, 90 * scale, 0, Math.PI * 2); ctx.stroke();
      label(ctx, V.w, V.h, '宇宙膨胀：每个星系看其它星系都在远离（无中心）', true);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 信息熵：麦克斯韦妖 === */
  AN.maxwellDemon = function (holder) {
    const V = mk(holder, 320, 190, true);
    const ps = [];
    for (let i = 0; i < 40; i++) {
      ps.push({ x: Math.random() * V.w, y: Math.random() * (V.h - 30), vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, fast: Math.random() < 0.5 });
    }
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = 'rgba(15,23,42,.3)'; ctx.fillRect(0, 0, V.w, V.h);
      ctx.strokeStyle = '#fbbf24';
      ctx.beginPath(); ctx.moveTo(V.w / 2, 0); ctx.lineTo(V.w / 2, V.h - 25); ctx.stroke();
      ps.forEach(function (p) {
        const speed = Math.hypot(p.vx, p.vy);
        // 妖的门：快粒子向右，慢粒子向左
        if (Math.abs(p.x - V.w / 2) < 6) {
          if (speed > 1.6 && p.x < V.w / 2) p.vx = Math.abs(p.vx);
          if (speed <= 1.6 && p.x > V.w / 2) p.vx = -Math.abs(p.vx);
        }
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > V.w) p.vx = -p.vx;
        if (p.y < 0 || p.y > V.h - 25) p.vy = -p.vy;
        ctx.fillStyle = speed > 1.6 ? '#f87171' : '#38bdf8';
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
      });
      label(ctx, V.w, V.h, '麦克斯韦妖按速度分拣粒子（信息=物理：擦除信息要耗能）', true);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 点击化学：分子模块咔哒连接 === */
  AN.click = function (holder) {
    const V = mk(holder, 340, 170, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const ph = (t % 240) / 240;
      const gap = Math.max(0, 40 - ph * 60);
      // 炔模块
      ctx.fillStyle = '#334155';
      ctx.beginPath(); ctx.arc(110 - gap, 85, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(140 - gap, 85, 8, 0, Math.PI * 2); ctx.fill();
      // 叠氮模块
      ctx.fillStyle = '#334155';
      ctx.beginPath(); ctx.arc(230 + gap, 85, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath(); ctx.arc(200 + gap, 85, 8, 0, Math.PI * 2); ctx.fill();
      if (gap <= 1) {
        // 三唑环
        ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(150, 85); ctx.lineTo(170, 65); ctx.lineTo(190, 85); ctx.lineTo(170, 100); ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = '#16a34a'; ctx.font = '11px sans-serif';
        ctx.fillText('咔哒！环加成完成', 130, 130);
      }
      label(ctx, V.w, V.h, '点击化学：两个模块高选择性"咔哒"连接（2022 诺奖）', false);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 分子马达旋转 === */
  AN.motor = function (holder) {
    const V = mk(holder, 300, 200, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = V.h / 2 - 10;
      // 棘轮式单向旋转（每 90 度一步）
      const step = Math.floor(t / 50);
      const prog = (t % 50) / 50;
      const ang = (step + prog * prog) * Math.PI / 2;
      ctx.strokeStyle = '#475569';
      ctx.beginPath(); ctx.arc(cx, cy, 55, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = '#334155';
        const a = i * Math.PI / 2;
        ctx.beginPath(); ctx.arc(cx + 55 * Math.cos(a), cy + 55 * Math.sin(a), 5, 0, Math.PI * 2); ctx.fill();
      }
      // 转子
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + 48 * Math.cos(ang), cy + 48 * Math.sin(ang)); ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
      label(ctx, V.w, V.h, '分子马达：光驱动单向旋转（2016 诺奖·分子机器）', true);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === DNA 双螺旋 === */
  AN.dna = function (holder) {
    const V = mk(holder, 300, 240, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = V.w / 2;
      for (let i = 0; i < 18; i++) {
        const y = 20 + i * 12;
        const ph = i * 0.55 + t * 0.03;
        const x1 = cx + Math.sin(ph) * 45;
        const x2 = cx - Math.sin(ph) * 45;
        ctx.strokeStyle = 'rgba(148,163,184,.5)';
        ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath(); ctx.arc(x1, y, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f87171';
        ctx.beginPath(); ctx.arc(x2, y, 4, 0, Math.PI * 2); ctx.fill();
      }
      label(ctx, V.w, V.h, 'DNA 双螺旋：碱基配对编码生命（AT/GC）', true);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 黎曼ζ零点示意 === */
  AN.riemann = function (holder) {
    const V = mk(holder, 320, 220, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = V.h / 2;
      // 临界线
      ctx.setLineDash([4, 4]); ctx.strokeStyle = '#dc2626';
      ctx.beginPath(); ctx.moveTo(cx, 20); ctx.lineTo(cx, V.h - 25); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('临界线 Re(s)=1/2', cx + 8, 30);
      // 零点沿临界线
      const zeros = [14.1, 21.0, 25.0, 30.4, 32.9, 37.6];
      zeros.forEach(function (z, i) {
        const y = V.h - 30 - z * 4.5;
        const pulse = 3 + Math.sin(t * 0.05 + i) * 1.5;
        ctx.fillStyle = '#2563eb';
        ctx.beginPath(); ctx.arc(cx, y, pulse, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#64748b';
      ctx.fillText('虚部 γ ≈ 14.1, 21.0, 25.0, 30.4…', 20, V.h - 40);
      label(ctx, V.w, V.h, '黎曼猜想：所有非平凡零点都在临界线上（未证明，悬赏$100万）', false);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === RSA：素数锁 === */
  AN.rsa = function (holder) {
    const V = mk(holder, 320, 190, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const ph = (t % 300) / 300;
      ctx.fillStyle = '#475569'; ctx.font = '12px monospace';
      ctx.fillText('61 × 53 = 3233（乘法容易）', 40, 50);
      ctx.fillText('3233 = ? × ?（分解困难）', 40, 80);
      // 锁
      const open = ph < 0.5;
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(V.w / 2, 130, 18, Math.PI, open ? Math.PI * 1.6 : 0, false); ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(V.w / 2 - 22, 130, 44, 34);
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText(open ? '公钥加密（任何人可锁）' : '私钥解密（只有你能开）', 80, 180);
      label(ctx, V.w, V.h, 'RSA：大数分解之难 = 互联网安全的基石', false);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 黄金比例矩形 === */
  AN.goldenRect = function (holder) {
    const V = mk(holder, 320, 200, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      let w = 200, x = 30, y = 30, h = w / 1.618;
      ctx.strokeStyle = '#94a3b8';
      ctx.strokeRect(x, y, w, h);
      const n = Math.min(9, 1 + Math.floor(t / 60));
      let dir = 0;
      for (let i = 0; i < n; i++) {
        const sq = i % 2 === 0 ? h : w / 1.618;
        ctx.strokeStyle = '#f59e0b';
        if (dir === 0) { ctx.strokeRect(x, y, sq, sq); ctx.beginPath(); ctx.arc(x + sq, y + sq, sq, Math.PI, Math.PI * 1.5); ctx.stroke(); x += sq; w -= sq; }
        else if (dir === 1) { ctx.strokeRect(x, y, w, w); ctx.beginPath(); ctx.arc(x, y + w, w, Math.PI * 1.5, 0); ctx.stroke(); y += w; h -= w; }
        else if (dir === 2) { const s = h; ctx.strokeRect(x + w - s, y, s, s); ctx.beginPath(); ctx.arc(x + w - s, y, s, 0, Math.PI * 0.5); ctx.stroke(); w -= s; }
        else { const s = w; ctx.strokeRect(x, y + h - s, s, s); ctx.beginPath(); ctx.arc(x + s, y + h - s, s, Math.PI * 0.5, Math.PI); ctx.stroke(); h -= s; }
        dir = (dir + 1) % 4;
      }
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('φ = (1+√5)/2 ≈ 1.618', 30, 186);
      label(ctx, V.w, V.h, '黄金矩形逐层分割出对数螺线', false);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 范畴论：箭头组合 === */
  AN.category = function (holder) {
    const V = mk(holder, 320, 170, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const A = [60, 90], B = [160, 50], C = [260, 90];
      [A, B, C].forEach(function (p, i) {
        ctx.fillStyle = ['#3b82f6', '#22c55e', '#dc2626'][i];
        ctx.beginPath(); ctx.arc(p[0], p[1], 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('ABC'[i], p[0], p[1] + 4);
        ctx.textAlign = 'left';
      });
      const pulse = (t % 120) / 120;
      ctx.globalAlpha = pulse < 0.33 ? 1 : 0.35; arrow(ctx, A[0] + 14, A[1] - 6, B[0] - 14, B[1] + 6, '#475569');
      ctx.globalAlpha = pulse > 0.33 && pulse < 0.66 ? 1 : 0.35; arrow(ctx, B[0] + 14, B[1] + 6, C[0] - 14, C[1] - 6, '#475569');
      ctx.globalAlpha = pulse > 0.66 ? 1 : 0.35; arrow(ctx, A[0] + 14, A[1] + 10, C[0] - 14, C[1] + 6, '#f59e0b');
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#64748b'; ctx.font = '11px sans-serif';
      ctx.fillText('f: A→B, g: B→C, 必有复合 g∘f: A→C', 50, 140);
      label(ctx, V.w, V.h, '范畴论：研究对象间的箭头（映射）及其组合规则', false);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 测度/积分：值域分层 === */
  AN.lebesgue = function (holder) {
    const V = mk(holder, 340, 200, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      // 函数曲线
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= 300; x++) {
        const u = x / 300;
        const y = 160 - (Math.sin(u * 6) * 0.5 + 0.5) * 110;
        if (x === 0) ctx.moveTo(20 + x, y); else ctx.lineTo(20 + x, y);
      }
      ctx.stroke();
      // 水平切片（勒贝格：按值域分层）
      const n = Math.min(6, 1 + Math.floor(t / 80));
      for (let i = 1; i <= n; i++) {
        const y = 160 - i * 18;
        ctx.strokeStyle = 'rgba(220,38,38,.6)'; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(320, y); ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('勒贝格积分：按"值域"水平分层再累加', 40, 26);
      label(ctx, V.w, V.h, '对比黎曼积分（竖直切片）——能积更多"奇怪"函数', false);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 拓扑：咖啡杯↔甜甜圈（亏格示意） === */
  AN.topology = function (holder) {
    const V = mk(holder, 320, 200, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const ph = (Math.sin(t * 0.015) + 1) / 2; // 0杯→1圈
      const cx = V.w / 2, cy = 100;
      // 主体渐变变形（简化：杯身→圆环）
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 5;
      if (ph < 0.5) {
        const k = ph * 2;
        ctx.beginPath();
        ctx.moveTo(cx - 40, cy - 40 * (1 - k) - 30 * k);
        ctx.lineTo(cx - 40, cy + 40);
        ctx.lineTo(cx + 40, cy + 40);
        ctx.lineTo(cx + 40, cy - 40 * (1 - k) - 30 * k);
        ctx.stroke();
        // 把手
        ctx.beginPath(); ctx.arc(cx + 55, cy, 20, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(cx, cy, 50, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#fff';
        ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText(ph < 0.5 ? '咖啡杯（亏格=1）' : '甜甜圈（亏格=1）', cx - 55, 170);
      label(ctx, V.w, V.h, '拓扑等价：不撕不粘的连续变形下，孔的个数不变', false);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 哥德尔：自指语句 === */
  AN.godel = function (holder) {
    const V = mk(holder, 320, 190, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      ctx.fillStyle = '#1e293b'; ctx.font = 'bold 13px sans-serif';
      ctx.fillText('“本命题不可被证明。”', 70, 60);
      const ph = Math.floor(t / 100) % 2;
      ctx.font = '11px sans-serif'; ctx.fillStyle = '#475569';
      if (ph === 0) {
        ctx.fillText('若它为真 → 真的不可证（真而不可证存在）', 30, 100);
        ctx.fillText('若它为假 → 假命题"可被证明"→ 系统不一致', 30, 120);
      } else {
        ctx.fillText('结论：足够强的一致系统中，', 30, 100);
        ctx.fillText('必存在真但不可证的命题（不完备）', 30, 120);
      }
      label(ctx, V.w, V.h, '哥德尔不完备定理：自指构造揭示数学的内在边界', false);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 博弈演化：策略竞赛条形图 === */
  AN.evoGame = function (holder) {
    const V = mk(holder, 340, 200, false);
    const strats = [
      { name: '一报还一报', score: 0, color: '#22c55e' },
      { name: '永远合作', score: 0, color: '#3b82f6' },
      { name: '永远背叛', score: 0, color: '#dc2626' },
      { name: '随机', score: 0, color: '#f59e0b' }
    ];
    let t = 0;
    (function loop() {
      if (t % 30 === 0) {
        strats[0].score += 3 + Math.random() * 1.5;
        strats[1].score += 2 + Math.random() * 2;
        strats[2].score += 1.5 + Math.random() * 2;
        strats[3].score += 1.8 + Math.random() * 2;
      }
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const max = Math.max.apply(null, strats.map(function (s) { return s.score; })) || 1;
      strats.forEach(function (s, i) {
        const w = s.score / max * 220;
        ctx.fillStyle = s.color;
        ctx.fillRect(105, 30 + i * 34, w, 18);
        ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
        ctx.fillText(s.name, 10, 44 + i * 34);
        ctx.fillText(Math.round(s.score), 110 + w, 44 + i * 34);
      });
      label(ctx, V.w, V.h, '重复囚徒困境锦标赛：善良+可激怒+宽容的策略长期胜出', false);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 自组织：贝纳德对流花纹 === */
  AN.convection = function (holder) {
    const V = mk(holder, 320, 200, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 六边形对流胞
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
        const cx = 50 + i * 75 + (j % 2) * 38, cy = 50 + j * 55;
        const spin = t * 0.02 + i + j;
        ctx.strokeStyle = 'rgba(56,189,248,.5)';
        ctx.beginPath(); ctx.arc(cx, cy, 24, spin, spin + Math.PI * 1.5); ctx.stroke();
        ctx.strokeStyle = 'rgba(248,113,113,.4)';
        ctx.beginPath(); ctx.arc(cx, cy, 14, -spin, -spin + Math.PI * 1.5); ctx.stroke();
      }
      ctx.fillStyle = '#f87171'; ctx.fillRect(0, V.h - 12, V.w, 4);
      label(ctx, V.w, V.h, '远离平衡 + 能量流 → 自发形成有序对流花纹（耗散结构）', true);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 量子计算：布洛赫球简化 === */
  AN.qubit = function (holder) {
    const V = mk(holder, 300, 230, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = V.h / 2;
      ctx.strokeStyle = 'rgba(148,163,184,.4)';
      ctx.beginPath(); ctx.arc(cx, cy, 70, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, cy, 70, 22, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('|0⟩', cx, cy - 78); ctx.fillText('|1⟩', cx, cy + 90);
      ctx.textAlign = 'left';
      // 态矢量进动
      const th = t * 0.03;
      const vx = cx + 70 * Math.sin(th) * Math.cos(t * 0.02);
      const vy = cy - 70 * Math.cos(th);
      arrow(ctx, cx, cy, vx, vy, '#38bdf8');
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(vx, vy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('叠加态：测量前同时是 0 和 1', 55, 20);
      label(ctx, V.w, V.h, '量子比特在球面上连续取值（布洛赫球），测量才坍缩', true);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 计算化学：能量面下降 === */
  AN.energySurface = function (holder) {
    const V = mk(holder, 340, 200, false);
    let bx = 40, t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      function E(x) { const u = x / 300; return 150 - Math.sin(u * 4) * 55 - u * 40; }
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      for (let x = 0; x <= 300; x++) {
        if (x === 0) ctx.moveTo(20 + x, E(x)); else ctx.lineTo(20 + x, E(x));
      }
      ctx.stroke();
      // 优化小球沿梯度下降
      bx += 1.1;
      if (bx > 295) bx = 40;
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(20 + bx, E(bx) - 7, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('分子构型优化：沿能量面寻找最低点（稳定结构）', 30, 24);
      label(ctx, V.w, V.h, '计算化学：在势能面上"滚"到能量最低的几何构型', false);
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* === 绿色化学：原子经济性 === */
  AN.greenChem = function (holder) {
    const V = mk(holder, 340, 170, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const ph = (t % 240) / 240;
      // 反应物原子
      for (let i = 0; i < 8; i++) {
        const x = 40 + i * 24;
        const intoProduct = i < 6; // 6/8 进入产物 = 75%
        ctx.fillStyle = intoProduct ? '#22c55e' : '#dc2626';
        ctx.beginPath(); ctx.arc(x, 50, 8, 0, Math.PI * 2); ctx.fill();
        if (ph > 0.4) {
          const ty = intoProduct ? 120 : 150;
          const y = 50 + Math.min(1, (ph - 0.4) / 0.4) * (ty - 50);
          ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('原子经济性：绿色=进入目标产物，红色=副产物废物', 20, 24);
      label(ctx, V.w, V.h, '绿色化学：最好的废物处理方式是不产生废物', false);
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
