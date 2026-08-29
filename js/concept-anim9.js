/* concept-anim9.js — 演示引擎（第六批：修正错配动画——数学概念专属）
 * 修复质检发现的 4 处"动画与知识点错配"：
 *   funcTest    函数概念：竖直检验（每个 x 对应唯一 y）
 *   monoParity  单调性与奇偶性：升降看斜率符号，对称看镜像
 *   circleAngle 圆周角定理：同弧所对圆周角 = 圆心角的一半
 *   enumerate   列举法求概率：穷尽所有等可能结果，数目标占比
 */
(function () {
  const GEN = window.ConceptAnim.GEN;
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
  function axes(ctx, W, H, ox, oy) {
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(14, oy); ctx.lineTo(W - 14, oy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, 12); ctx.lineTo(ox, H - 26); ctx.stroke();
    ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
    ctx.fillText('x', W - 16, oy - 5); ctx.fillText('y', ox + 5, 16);
  }

  /* 函数概念：竖直检验。抛物线（是函数）与横躺抛物线（不是函数）交替演示 */
  GEN.funcTest = function (holder, o) {
    const V = mk(holder, 340, 210, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx, W = V.w, H = V.h;
      ctx.clearRect(0, 0, W, H);
      const ox = W / 2, oy = H - 46;
      axes(ctx, W, H, ox, oy);
      const phase = Math.floor(t / 360) % 2; // 0=函数 1=非函数
      const scale = 26;
      ctx.lineWidth = 2;
      if (phase === 0) {
        // y = x²/4 抛物线
        ctx.strokeStyle = '#2563eb';
        ctx.beginPath();
        for (let px = 0; px <= W; px++) {
          const x = (px - ox) / scale, y = oy - (x * x / 4) * scale;
          if (px === 0) ctx.moveTo(px, y); else ctx.lineTo(px, y);
        }
        ctx.stroke();
      } else {
        // x = y²/4 横躺抛物线（不是函数）
        ctx.strokeStyle = '#dc2626';
        ctx.beginPath();
        let first = true;
        for (let py = 12; py <= oy; py++) {
          const y = (oy - py) / scale, x = ox + (y * y / 4) * scale * 0.6 - 40;
          if (first) { ctx.moveTo(x, py); first = false; } else ctx.lineTo(x, py);
        }
        ctx.stroke();
      }
      // 竖线扫描
      const sx = 30 + ((t * 1.1) % (W - 60));
      ctx.strokeStyle = 'rgba(100,116,139,.5)'; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(sx, 12); ctx.lineTo(sx, H - 26); ctx.stroke();
      ctx.setLineDash([]);
      // 求交点
      const hits = [];
      if (phase === 0) {
        const x = (sx - ox) / scale, yy = oy - (x * x / 4) * scale;
        if (yy > 12 && yy < oy + 2) hits.push([sx, yy]);
      } else {
        const xr = (sx - ox + 40) / (scale * 0.6);
        if (xr > 0) {
          const y1 = Math.sqrt(xr) * 2, y2 = -y1;
          const p1 = oy - y1 * scale, p2 = oy - y2 * scale;
          if (p1 > 12 && p1 < oy) hits.push([sx, p1]);
          if (p2 > 12 && p2 < oy) hits.push([sx, p2]);
        }
      }
      hits.forEach(function (p) {
        ctx.fillStyle = phase === 0 ? '#16a34a' : '#dc2626';
        ctx.beginPath(); ctx.arc(p[0], p[1], 4.5, 0, Math.PI * 2); ctx.fill();
      });
      ctx.font = 'bold 12px sans-serif';
      if (phase === 0) {
        ctx.fillStyle = '#16a34a';
        ctx.fillText('任意竖线只交 1 次 → 每个 x 对应唯一 y ✓ 是函数', 24, H - 30);
      } else {
        ctx.fillStyle = '#dc2626';
        ctx.fillText('竖线交出 2 个点 → 一个 x 对应两个 y ✗ 不是函数', 24, H - 30);
      }
      cap(ctx, V, o.label || '竖直检验：图像上任意竖直线与函数图像至多一个交点');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 单调性与奇偶性：左图升降看斜率符号，右图镜像看对称 */
  GEN.monoParity = function (holder, o) {
    const V = mk(holder, 360, 200, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx, W = V.w, H = V.h;
      ctx.clearRect(0, 0, W, H);
      // ---- 左：单调性（三次曲线，斜率正负分段着色） ----
      const lx = 90, ly = 100, sc = 16;
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(14, ly); ctx.lineTo(166, ly); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(lx, 16); ctx.lineTo(lx, 172); ctx.stroke();
      function f(x) { return (x * x * x) / 6 - x * 1.2; }
      function df(x) { return (x * x) / 2 - 1.2; }
      ctx.lineWidth = 2;
      let prevSign = 0;
      ctx.beginPath();
      for (let px = 20; px <= 160; px++) {
        const x = (px - lx) / sc, y = ly - f(x) * sc;
        const sgn = df(x) >= 0 ? 1 : -1;
        if (prevSign !== 0 && sgn !== prevSign) { ctx.stroke(); ctx.beginPath(); ctx.moveTo(px - 1, ly - f((px - 1 - lx) / sc) * sc); }
        ctx.strokeStyle = sgn > 0 ? '#16a34a' : '#dc2626';
        if (px === 20) ctx.moveTo(px, y); else ctx.lineTo(px, y);
        prevSign = sgn;
      }
      ctx.stroke();
      // 动点沿曲线走
      const xt = Math.sin(t * 0.012) * 4.2;
      const pxp = lx + xt * sc, pyp = ly - f(xt) * sc;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(pxp, pyp, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#475569'; ctx.font = '10.5px sans-serif';
      ctx.fillText('绿=增 红=减', 20, 188);
      ctx.fillText('单调性', lx - 14, 12);
      // ---- 右：奇偶性镜像 ----
      const rx = 268, ry = 100;
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(196, ry); ctx.lineTo(348, ry); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rx, 16); ctx.lineTo(rx, 172); ctx.stroke();
      const mode = Math.floor(t / 300) % 2; // 0=偶 1=奇
      const g = mode === 0 ? function (x) { return x * x / 5; } : function (x) { return x * x * x / 12; };
      ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let px = 200; px <= 344; px++) {
        const x = (px - rx) / sc, y = ry - g(x) * sc;
        if (y < 8 || y > 190) continue;
        if (px === 200) ctx.moveTo(px, y); else ctx.lineTo(px, y);
      }
      ctx.stroke();
      // 一对镜像点
      const xm = 2.2 + Math.sin(t * 0.02) * 1.2;
      const y1 = ry - g(xm) * sc;
      const y2 = mode === 0 ? y1 : ry - g(-xm) * sc;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(rx + xm * sc, y1, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(rx - xm * sc, y2, 4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(245,158,11,.6)'; ctx.setLineDash([3, 3]);
      if (mode === 0) { ctx.beginPath(); ctx.moveTo(rx - xm * sc, y1); ctx.lineTo(rx + xm * sc, y1); ctx.stroke(); }
      else {
        ctx.beginPath(); ctx.moveTo(rx - xm * sc, y2); ctx.lineTo(rx, ry); ctx.lineTo(rx + xm * sc, y1); ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.fillStyle = '#475569'; ctx.font = '10.5px sans-serif';
      ctx.fillText(mode === 0 ? '偶函数：关于 y 轴对称 f(-x)=f(x)' : '奇函数：关于原点对称 f(-x)=-f(x)', 196, 188);
      ctx.fillText('对称性', rx - 14, 12);
      cap(ctx, V, o.label || '单调看升降，奇偶看对称');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 圆周角定理：动点 P 在优弧上滑动，∠APB 恒等于圆心角的一半 */
  GEN.circleAngle = function (holder, o) {
    const V = mk(holder, 320, 210, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx, W = V.w, H = V.h;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2 - 8, R = 72;
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      // 固定弧 AB（下半圆 120° 弧段）
      const aA = Math.PI * 0.72, aB = Math.PI * 0.28;
      const A = [cx + R * Math.cos(aA), cy + R * Math.sin(aA)];
      const B = [cx + R * Math.cos(aB), cy + R * Math.sin(aB)];
      // 圆心角
      const central = (aA - aB); // 弧度（劣弧 AB 对应）
      ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(A[0], A[1]); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(B[0], B[1]); ctx.stroke();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fill();
      // 动点 P 在优弧（上半）滑动
      const pa = -Math.PI * 0.15 - (Math.sin(t * 0.008) * 0.5 + 0.5) * Math.PI * 0.7;
      const P = [cx + R * Math.cos(pa), cy + R * Math.sin(pa)];
      ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(P[0], P[1]); ctx.lineTo(A[0], A[1]); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(P[0], P[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
      ctx.fillStyle = '#16a34a';
      ctx.beginPath(); ctx.arc(P[0], P[1], 4, 0, Math.PI * 2); ctx.fill();
      // 端点
      ctx.fillStyle = '#1e293b';
      [A, B].forEach(function (q) { ctx.beginPath(); ctx.arc(q[0], q[1], 3.5, 0, Math.PI * 2); ctx.fill(); });
      ctx.font = '11px sans-serif';
      ctx.fillText('A', A[0] - 14, A[1] + 12); ctx.fillText('B', B[0] + 8, B[1] + 12); ctx.fillText('P', P[0] - 3, P[1] - 8);
      ctx.fillText('O', cx + 6, cy + 12);
      // 读数
      const cdeg = Math.round(central * 180 / Math.PI);
      const ideg = Math.round(cdeg / 2);
      ctx.font = 'bold 12px sans-serif'; ctx.fillStyle = '#dc2626';
      ctx.fillText('圆心角 ∠AOB = ' + cdeg + '°', 16, 24);
      ctx.fillStyle = '#16a34a';
      ctx.fillText('圆周角 ∠APB = ' + ideg + '°（P 怎么动都不变）', 16, 42);
      cap(ctx, V, o.label || '同弧所对圆周角 = 圆心角的一半');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 列举法求概率：两枚骰子的 36 种结果逐个点亮，目标和=7 高亮 */
  GEN.enumerate = function (holder, o) {
    const V = mk(holder, 340, 210, false);
    let t = 0;
    const cell = 26, gap = 3, x0 = 24, y0 = 34;
    (function loop() {
      const ctx = V.ctx, W = V.w, H = V.h;
      ctx.clearRect(0, 0, W, H);
      const total = 36;
      const litN = Math.min(total, Math.floor(t / 5) % (total + 40)); // 点完后停一拍再循环
      let hit = 0;
      for (let a = 1; a <= 6; a++) {
        for (let b = 1; b <= 6; b++) {
          const idx = (a - 1) * 6 + (b - 1);
          const x = x0 + (b - 1) * (cell + gap), y = y0 + (a - 1) * (cell + gap);
          const isTarget = a + b === 7;
          if (idx < litN) {
            ctx.fillStyle = isTarget ? '#16a34a' : '#cbd5e1';
            if (isTarget && idx < litN) hit++;
          } else ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(x, y, cell, cell);
          ctx.fillStyle = idx < litN ? (isTarget ? '#fff' : '#475569') : '#cbd5e1';
          ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(a + '+' + b, x + cell / 2, y + cell / 2 + 3);
          ctx.textAlign = 'left';
        }
      }
      ctx.fillStyle = '#475569'; ctx.font = '12px sans-serif';
      ctx.fillText('已列出 ' + Math.min(litN, total) + ' / 36 种等可能结果', 24, 22);
      ctx.fillStyle = '#16a34a'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText('和为 7：' + hit + '/36' + (litN >= total ? ' = 1/6' : ''), 226, 22);
      cap(ctx, V, o.label || '列举法：一个不漏地数，概率 = 目标数 ÷ 总数');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 实数与数轴一一对应：整数、分数、无理数依次落位，每个点都有唯一坐标 */
  GEN.realLine = function (holder, o) {
    const V = mk(holder, 340, 170, false);
    let t = 0;
    const pts = [
      { x: -2, s: '-2', c: '#2563eb' }, { x: 0, s: '0', c: '#2563eb' },
      { x: 1 / 3, s: '1/3≈0.333…', c: '#059669' }, { x: Math.SQRT2, s: '√2≈1.414…', c: '#dc2626' },
      { x: 2, s: '2', c: '#2563eb' }, { x: Math.PI, s: 'π≈3.14…', c: '#dc2626' }
    ];
    (function loop() {
      const ctx = V.ctx, W = V.w, H = V.h;
      ctx.clearRect(0, 0, W, H);
      const x0 = 30, x1 = W - 20, y = H / 2 + 10, sc = (x1 - x0) / 6; // 数轴范围 [-2, 4]
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x0 - 8, y); ctx.lineTo(x1 + 4, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1 + 4, y); ctx.lineTo(x1 - 4, y - 4); ctx.lineTo(x1 - 4, y + 4); ctx.closePath();
      ctx.fillStyle = '#334155'; ctx.fill();
      for (let i = -2; i <= 4; i++) {
        const px = x0 + (i + 2) * sc;
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(px, y - 5); ctx.lineTo(px, y + 5); ctx.stroke();
        ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(String(i), px, y + 18);
        ctx.textAlign = 'left';
      }
      const shown = Math.min(pts.length, Math.floor(t / 45));
      pts.slice(0, shown).forEach(function (p, i) {
        const px = x0 + (p.x + 2) * sc;
        const pop = Math.min(1, (t - i * 45) / 20);
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(px, y, 4 * pop, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = p.c; ctx.setLineDash([2, 3]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(px, y - 6); ctx.lineTo(px, y - 26); ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = 'bold 10.5px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(p.s, px, y - 31);
        ctx.textAlign = 'left';
      });
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('有理数、无理数都能在数轴上找到自己唯一的位置', 30, 24);
      cap(ctx, V, o.label || '实数与数轴上的点一一对应');
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
