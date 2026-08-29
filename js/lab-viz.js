/* lab-viz.js — 公式实验的"实时实验视图"（按学科分支针对性可视化）
 * 目标：每个公式实验都有与自己内容匹配的动态图示，避免千篇一律。
 * LabViz.mount(host, item, params, computeRows) → 返回 true 表示已挂载专属视图。
 */
(function () {
  const LV = {};

  function firstNum(rows) {
    if (!Array.isArray(rows)) return null;
    for (let i = 0; i < rows.length; i++) {
      const v = rows[i][1];
      if (typeof v === 'number' && isFinite(v)) return v;
      if (typeof v === 'string') {
        const m = parseFloat(v);
        if (isFinite(m) && /^[-+]?[\d.]/.test(v.trim())) return m;
      }
    }
    return null;
  }
  function mkCanvas(host, w, h) {
    const c = document.createElement('canvas');
    c.style.cssText = 'width:100%;max-width:' + w + 'px;border-radius:8px;display:block;background:#0f172a';
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = w * dpr; c.height = h * dpr;
    host.appendChild(c);
    const ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }
  function cap(ctx, V, text) {
    ctx.fillStyle = '#94a3b8'; ctx.font = '10.5px sans-serif';
    ctx.fillText(text, 10, V.h - 7);
  }
  function arrow(ctx, x1, y1, x2, y2, color, lw) {
    ctx.strokeStyle = color; ctx.lineWidth = lw || 3;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 10 * Math.cos(a - 0.35), y2 - 10 * Math.sin(a - 0.35));
    ctx.lineTo(x2 - 10 * Math.cos(a + 0.35), y2 - 10 * Math.sin(a + 0.35));
    ctx.fill();
  }

  /* ---------- 1. 运动学：小球沿直线变速运动 ---------- */
  function vizMotion(host, params, rows, P) {
    const V = mkCanvas(host, 470, 150);
    let t = 0;
    const g = window.SCI ? SCI.CONST.g : 9.8;
    (function loop() {
      const v0 = P('v0') !== undefined ? P('v0') : P('v') !== undefined ? P('v') : 10;
      const a = P('a') !== undefined ? P('a') : 0;
      const tEnd = P('t') !== undefined ? Math.max(1, P('t')) : 5;
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const ground = V.h - 45;
      ctx.strokeStyle = '#334155';
      ctx.beginPath(); ctx.moveTo(20, ground); ctx.lineTo(V.w - 20, ground); ctx.stroke();
      // 位置 = v0*tt + ½a tt²（循环播放）
      const tt = (t / 60 * (window.Anim ? Anim.speed : 1)) % tEnd;
      const s = v0 * tt + 0.5 * a * tt * tt;
      const sMax = Math.max(1, v0 * tEnd + 0.5 * Math.abs(a) * tEnd * tEnd);
      const x = 30 + Math.min(1, Math.max(0, s / sMax)) * (V.w - 80);
      // 历史位置点（频闪照片效果）
      ctx.fillStyle = 'rgba(56,189,248,.35)';
      for (let i = 1; i <= 8; i++) {
        const ti = tt * i / 9;
        const si = v0 * ti + 0.5 * a * ti * ti;
        const xi = 30 + Math.min(1, Math.max(0, si / sMax)) * (V.w - 80);
        ctx.beginPath(); ctx.arc(xi, ground - 10, 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(x, ground - 10, 8, 0, Math.PI * 2); ctx.fill();
      const vv = v0 + a * tt;
      if (Math.abs(vv) > 0.1) arrow(ctx, x, ground - 30, x + Math.max(-60, Math.min(60, vv * 3)), ground - 30, '#38bdf8', 2);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('t=' + tt.toFixed(1) + 's  s=' + s.toFixed(1) + 'm  v=' + vv.toFixed(1) + 'm/s', 20, 20);
      cap(ctx, V, '频闪照片：点距越来越密=减速，越来越疏=加速');
      t++; window.requestAnimationFrame(loop);
    })();
  }

  /* ---------- 2. 圆周运动：旋转指针 ---------- */
  function vizCircular(host, params, rows, P) {
    const V = mkCanvas(host, 300, 230);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = V.h / 2 - 8;
      const v = P('v') !== undefined ? P('v') : 4;
      const r = P('r') !== undefined ? P('r') : 2;
      const omega = v / Math.max(0.1, r);
      ctx.strokeStyle = 'rgba(148,163,184,.4)';
      ctx.beginPath(); ctx.arc(cx, cy, 70, 0, Math.PI * 2); ctx.stroke();
      const ang = t * 0.02 * omega * (window.Anim ? Anim.speed : 1);
      const px = cx + 70 * Math.cos(ang), py = cy + 70 * Math.sin(ang);
      ctx.strokeStyle = '#475569';
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill();
      // 速度方向（切线）
      arrow(ctx, px, py, px - 28 * Math.sin(ang), py + 28 * Math.cos(ang), '#38bdf8', 2);
      arrow(ctx, px, py, cx - (px - cx) * 0.45, cy - (py - cy) * 0.45, '#dc2626', 2);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('ω = v/r = ' + omega.toFixed(2) + ' rad/s', 16, 18);
      cap(ctx, V, '蓝=速度（切线方向） 红=向心加速度（指向圆心）');
      t++; window.requestAnimationFrame(loop);
    })();
  }

  /* ---------- 3. 三角函数：单位圆 ---------- */
  function vizTrig(host, params, rows, P) {
    const V = mkCanvas(host, 300, 230);
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const deg = P('A') !== undefined ? P('A') : P('a') !== undefined ? P('a') : 40;
      const rad = deg * Math.PI / 180;
      const cx = V.w / 2, cy = V.h / 2, R = 75;
      ctx.strokeStyle = 'rgba(148,163,184,.35)';
      ctx.beginPath(); ctx.moveTo(10, cy); ctx.lineTo(V.w - 10, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, 8); ctx.lineTo(cx, V.h - 20); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      const px = cx + R * Math.cos(rad), py = cy - R * Math.sin(rad);
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
      ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 3; // sin 线
      ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();
      ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 3; // cos 线
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, cy); ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#dc2626'; ctx.fillText('sin', px + 6, (cy + py) / 2);
      ctx.fillStyle = '#22c55e'; ctx.fillText('cos', (cx + px) / 2, cy + 14);
      ctx.fillStyle = '#e2e8f0'; ctx.fillText('θ = ' + deg + '°', 14, 16);
      cap(ctx, V, '单位圆：竖线长 = sinθ，横线长 = cosθ');
      window.requestAnimationFrame(loop);
    })();
  }

  /* ---------- 4. 电学：灯泡亮度 + 电流表 ---------- */
  function vizCircuit(host, params, rows, P) {
    const V = mkCanvas(host, 340, 190);
    let t = 0;
    (function loop() {
      const rowsNow = rows();
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 找电流/功率值
      let I = null, Pw = null;
      rowsNow.forEach(function (r) {
        const k = String(r[0]);
        const n = typeof r[1] === 'number' ? r[1] : parseFloat(r[1]);
        if (!isFinite(n)) return;
        if (/电流/.test(k) && I === null) I = n;
        if (/功率/.test(k) && Pw === null) Pw = n;
      });
      const intensity = Math.min(1, (Pw !== null ? Pw : (I !== null ? I * 6 : 0.3)) / 25);
      const cx = V.w / 2;
      // 灯泡
      if (intensity > 0.03) {
        const grad = ctx.createRadialGradient(cx, 85, 2, cx, 85, 20 + intensity * 55);
        grad.addColorStop(0, 'rgba(250,204,21,' + (0.25 + intensity * 0.65) + ')');
        grad.addColorStop(1, 'rgba(250,204,21,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(cx, 85, 20 + intensity * 55, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = intensity > 0.03 ? '#facc15' : '#334155';
      ctx.beginPath(); ctx.arc(cx, 85, 16, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#64748b'; ctx.stroke();
      // 电流表指针
      const ang = -Math.PI * 0.75 + intensity * Math.PI * 0.5;
      ctx.strokeStyle = '#475569';
      ctx.beginPath(); ctx.arc(cx, 155, 22, Math.PI, 0); ctx.stroke();
      ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, 155); ctx.lineTo(cx + 20 * Math.cos(ang), 155 + 20 * Math.sin(ang)); ctx.stroke();
      // 电路导线
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
      ctx.strokeRect(70, 55, V.w - 140, 110);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('电流 ' + (I !== null ? I.toFixed(2) + ' A' : '—') + '  功率 ' + (Pw !== null ? Pw.toFixed(1) + ' W' : '—'), 20, 20);
      cap(ctx, V, '功率越大灯越亮：电流是电荷的流量，功率是做功的快慢');
      t++; window.requestAnimationFrame(loop);
    })();
  }

  /* ---------- 5. 溶液：浓度色阶 ---------- */
  function vizSolution(host, params, rows, P) {
    const V = mkCanvas(host, 340, 190);
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const rowsNow = rows();
      let conc = null;
      rowsNow.forEach(function (r) {
        const n = typeof r[1] === 'number' ? r[1] : parseFloat(r[1]);
        if (isFinite(n) && /分数|浓度/.test(String(r[0])) && conc === null) conc = n;
      });
      if (conc === null) conc = firstNum(rowsNow);
      const c = Math.max(0, Math.min(100, conc === null ? 20 : conc));
      // 烧杯
      ctx.fillStyle = 'rgba(59,130,246,' + (0.08 + c / 100 * 0.7) + ')';
      ctx.fillRect(100, 60, 140, 100);
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.strokeRect(100, 60, 140, 100);
      // 溶质粒子（数量 ∝ 浓度）
      const nP = Math.round(c / 4);
      ctx.fillStyle = 'rgba(251,191,36,.9)';
      for (let i = 0; i < nP; i++) {
        const seed = i * 137.5;
        const px = 108 + (seed * 7) % 124;
        const py = 68 + (seed * 13) % 84;
        ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
      }
      // 标尺
      ctx.fillStyle = '#334155'; ctx.fillRect(270, 60, 16, 100);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(270, 60 + (100 - c), 16, c);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('浓度 ' + c.toFixed(1) + '%', 20, 20);
      cap(ctx, V, '粒子数与色深都随浓度变化——浓=单位体积里溶质更多');
      window.requestAnimationFrame(loop);
    })();
  }

  /* ---------- 6. 压强：液柱/活塞高度 ---------- */
  function vizPressure(host, params, rows, P) {
    const V = mkCanvas(host, 340, 200);
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const rowsNow = rows();
      let p = firstNum(rowsNow);
      const pShow = Math.max(0, Math.min(500, p === null ? 100 : Math.abs(p)));
      // U 形管示意
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(110, 50); ctx.lineTo(110, 160); ctx.lineTo(230, 160); ctx.lineTo(230, 50);
      ctx.stroke();
      const hLeft = 30 + Math.min(95, pShow * 0.35);
      const hRight = Math.max(10, 95 - Math.min(80, pShow * 0.2));
      ctx.fillStyle = 'rgba(56,189,248,.75)';
      ctx.fillRect(113, 160 - hLeft, 24, hLeft - 3);
      ctx.fillRect(203, 160 - hRight, 24, hRight - 3);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('压强 ' + pShow.toFixed(1) + (pShow > 100 ? ' kPa' : ''), 20, 20);
      cap(ctx, V, '压强越大，液柱被压得越高（液面差反映压强差）');
      window.requestAnimationFrame(loop);
    })();
  }

  /* ---------- 7. 力与能量：天平场景（砝码堆 = 数值大小） ---------- */
  function vizForce(host, params, rows, P) {
    const V = mkCanvas(host, 380, 200);
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const rowsNow = rows();
      const bars = [];
      rowsNow.forEach(function (r) {
        const n = typeof r[1] === 'number' ? r[1] : parseFloat(r[1]);
        if (isFinite(n) && n >= 0 && bars.length < 4) bars.push([String(r[0]), n]);
      });
      if (!bars.length) { window.requestAnimationFrame(loop); return; }
      const max = Math.max.apply(null, bars.map(function (b) { return b[1]; })) || 1;
      // 每个量 = 一个托盘 + 砝码堆（高度 ∝ 数值）
      const nB = bars.length;
      const slotW = (V.w - 40) / nB;
      bars.forEach(function (b, i) {
        const cx = 20 + slotW * i + slotW / 2;
        const hgt = 12 + (b[1] / max) * 90;
        // 托盘
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx - 30, 165); ctx.lineTo(cx + 30, 165); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, 165); ctx.lineTo(cx, 185); ctx.stroke();
        // 砝码堆
        const layers = Math.max(1, Math.round(hgt / 14));
        for (let L = 0; L < layers; L++) {
          const w = 44 - L * 6;
          ctx.fillStyle = ['#38bdf8', '#fbbf24', '#4ade80', '#f87171'][i % 4];
          ctx.fillRect(cx - w / 2, 160 - (L + 1) * 13, w, 11);
        }
        ctx.fillStyle = '#cbd5e1'; ctx.font = '10.5px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(b[0].slice(0, 8), cx, 197);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif';
        ctx.fillText(UI.fmt(b[1], 1), cx, 152 - layers * 13);
        ctx.textAlign = 'left';
      });
      cap(ctx, V, '砝码堆高度 = 数值大小：像天平一样直观比较各物理量');
      window.requestAnimationFrame(loop);
    })();
  }

  /* ---------- 8. 几何图形：按参数画图形 ---------- */
  function vizShape(host, params, rows, P) {
    const V = mkCanvas(host, 320, 210);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = V.h / 2 - 5;
      const a = P('a') !== undefined ? P('a') : 3;
      const b = P('b') !== undefined ? P('b') : a;
      const r = P('r') !== undefined ? P('r') : null;
      const sc = 11;
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5;
      ctx.fillStyle = 'rgba(56,189,248,.15)';
      if (r !== null) {
        ctx.beginPath(); ctx.arc(cx, cy, Math.max(4, r * sc), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      } else {
        const wpx = a * sc, hpx = b * sc;
        ctx.beginPath();
        ctx.rect(cx - wpx / 2, cy - hpx / 2, wpx, hpx);
        ctx.fill(); ctx.stroke();
        // 尺寸标注
        ctx.strokeStyle = '#f59e0b'; ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(cx - wpx / 2, cy + hpx / 2 + 12); ctx.lineTo(cx + wpx / 2, cy + hpx / 2 + 12); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#fbbf24'; ctx.font = '11px sans-serif';
        ctx.fillText('a=' + a, cx - 14, cy + hpx / 2 + 26);
      }
      const rowsNow = rows();
      let area = null, peri = null;
      rowsNow.forEach(function (rr) {
        const n = typeof rr[1] === 'number' ? rr[1] : parseFloat(rr[1]);
        if (!isFinite(n)) return;
        if (/面积/.test(String(rr[0])) && area === null) area = n;
        if (/周长/.test(String(rr[0])) && peri === null) peri = n;
      });
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('面积=' + (area !== null ? UI.fmt(area, 1) : '—') + '  周长=' + (peri !== null ? UI.fmt(peri, 1) : '—'), 14, 18);
      cap(ctx, V, '图形大小随参数实时缩放');
      t++; window.requestAnimationFrame(loop);
    })();
  }

  /* ---------- 9. 概率：转盘 ---------- */
  function vizProb(host, params, rows, P) {
    const V = mkCanvas(host, 280, 220);
    let rot = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const rowsNow = rows();
      let p = null;
      rowsNow.forEach(function (r) {
        const n = typeof r[1] === 'number' ? r[1] : parseFloat(r[1]);
        if (isFinite(n) && n >= 0 && n <= 1 && /概率|分数|比例/.test(String(r[0])) && p === null) p = n;
      });
      if (p === null) p = 0.5;
      const cx = V.w / 2, cy = 95, R = 68;
      // 有利扇区
      ctx.fillStyle = 'rgba(74,222,128,.55)';
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      // 指针
      rot += 0.03 * (window.Anim ? Anim.speed : 1);
      const ang = rot;
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + (R - 8) * Math.cos(ang), cy + (R - 8) * Math.sin(ang)); ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('P = ' + p.toFixed(3), 16, 20);
      cap(ctx, V, '绿色扇区 = 有利结果占比；指针落进去就"发生"');
      window.requestAnimationFrame(loop);
    })();
  }

  /* ---------- 10. 方程：数轴上的解 ---------- */
  function vizAxis(host, params, rows, P) {
    const V = mkCanvas(host, 420, 150);
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const rowsNow = rows();
      let sol = null;
      rowsNow.forEach(function (r) {
        const n = typeof r[1] === 'number' ? r[1] : parseFloat(r[1]);
        if (isFinite(n) && /解|根|x$|零点|临界/.test(String(r[0])) && sol === null) sol = n;
      });
      const cy = 80;
      ctx.strokeStyle = '#64748b';
      ctx.beginPath(); ctx.moveTo(20, cy); ctx.lineTo(V.w - 20, cy); ctx.stroke();
      for (let i = -6; i <= 6; i++) {
        const x = V.w / 2 + i * 30;
        ctx.strokeStyle = '#475569';
        ctx.beginPath(); ctx.moveTo(x, cy - 4); ctx.lineTo(x, cy + 4); ctx.stroke();
        ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(i, x, cy + 16);
      }
      ctx.textAlign = 'left';
      if (sol !== null && sol >= -6.5 && sol <= 6.5) {
        const x = V.w / 2 + sol * 30;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(x, cy, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 12px sans-serif';
        ctx.fillText('x = ' + UI.fmt(sol, 2), x - 22, cy - 16);
      } else {
        ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif';
        ctx.fillText(sol === null ? '无实数解（或解超出显示范围）' : '解超出数轴范围', 130, 40);
      }
      cap(ctx, V, '方程的解 = 数轴上的一个点');
      window.requestAnimationFrame(loop);
    })();
  }

  /* ---------- 11. 化学：气泡产生速率 ---------- */
  function vizBubbles(host, params, rows, P) {
    const V = mkCanvas(host, 300, 200);
    const bub = [];
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = 'rgba(15,23,42,.4)'; ctx.fillRect(0, 0, V.w, V.h);
      const rowsNow = rows();
      let rate = firstNum(rowsNow);
      if (rate === null || !isFinite(rate)) rate = 1;
      const intensity = Math.min(8, Math.abs(rate));
      ctx.fillStyle = 'rgba(59,130,246,.2)';
      ctx.fillRect(60, 70, V.w - 120, 110);
      ctx.strokeStyle = '#64748b';
      ctx.strokeRect(60, 70, V.w - 120, 110);
      if (t % Math.max(2, Math.round(16 - intensity * 1.5)) === 0) {
        bub.push({ x: 80 + Math.random() * (V.w - 160), y: 170, r: 2 + Math.random() * 3 });
      }
      for (let i = bub.length - 1; i >= 0; i--) {
        bub[i].y -= 1 + Math.random();
        bub[i].x += (Math.random() - 0.5);
        if (bub[i].y < 75) { bub.splice(i, 1); continue; }
        ctx.strokeStyle = 'rgba(147,197,253,.8)';
        ctx.beginPath(); ctx.arc(bub[i].x, bub[i].y, bub[i].r, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('反应量/速率指标 = ' + UI.fmt(rate, 2), 16, 20);
      cap(ctx, V, '数值越大，气泡产生越快——反应速率的直观表现');
      t++; window.requestAnimationFrame(loop);
    })();
  }

  /* ---------- 12. 向量：箭头合成 ---------- */
  function vizVector(host, params, rows, P) {
    const V = mkCanvas(host, 340, 210);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = 70, cy = V.h - 60, sc = 16;
      const x1 = P('x1') || 0, y1 = P('y1') || 0, x2 = P('x2') || 0, y2 = P('y2') || 0;
      ctx.strokeStyle = 'rgba(148,163,184,.2)';
      ctx.beginPath(); ctx.moveTo(20, cy); ctx.lineTo(V.w - 20, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, V.h - 20); ctx.lineTo(cx, 20); ctx.stroke();
      if (x1 || y1) arrow(ctx, cx, cy, cx + x1 * sc, cy - y1 * sc, '#38bdf8', 3);
      if (x2 || y2) arrow(ctx, cx, cy, cx + x2 * sc, cy - y2 * sc, '#4ade80', 3);
      arrow(ctx, cx, cy, cx + (x1 + x2) * sc, cy - (y1 + y2) * sc, '#fbbf24', 3.5);
      // 平行四边形虚线
      ctx.strokeStyle = 'rgba(251,191,36,.3)'; ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx + x1 * sc, cy - y1 * sc); ctx.lineTo(cx + (x1 + x2) * sc, cy - (y1 + y2) * sc);
      ctx.moveTo(cx + x2 * sc, cy - y2 * sc); ctx.lineTo(cx + (x1 + x2) * sc, cy - (y1 + y2) * sc);
      ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('蓝=a  绿=b  黄=a+b', 16, 18);
      cap(ctx, V, '向量加法：平行四边形定则');
      t++; window.requestAnimationFrame(loop);
    })();
  }

  /* ---------- 13. 数列：点阵规律 ---------- */
  function vizSequence(host, params, rows, P) {
    const V = mkCanvas(host, 420, 160);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const a1 = P('a1') !== undefined ? P('a1') : 2;
      const d = P('d') !== undefined ? P('d') : P('q') !== undefined ? 0 : 3;
      const q = P('q');
      const n = Math.min(8, Math.max(3, P('n') !== undefined ? P('n') : 6));
      const cy = V.h / 2;
      let val = a1;
      let maxV = 1;
      const vals = [];
      for (let i = 0; i < n; i++) {
        vals.push(val);
        if (Math.abs(val) > maxV) maxV = Math.abs(val);
        val = q !== undefined ? val * q : val + d;
        if (!isFinite(val)) break;
      }
      // 积木堆场景：每摞积木 = 一项，块数 ∝ 数值
      vals.forEach(function (v, i) {
        const x = 40 + i * ((V.w - 80) / Math.max(1, vals.length - 1));
        const blocks = Math.max(1, Math.round(Math.abs(v) / maxV * 6));
        for (let b = 0; b < blocks; b++) {
          ctx.fillStyle = (i % 2 ? '#fbbf24' : '#38bdf8');
          ctx.fillRect(x - 12, cy - 8 - b * 12, 24, 10);
          ctx.strokeStyle = '#0f172a'; ctx.strokeRect(x - 12, cy - 8 - b * 12, 24, 10);
        }
        ctx.fillStyle = '#cbd5e1'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('a' + (i + 1) + '=' + UI.fmt(v, 1), x, cy + 22);
      });
      ctx.textAlign = 'left';
      ctx.strokeStyle = '#475569';
      ctx.beginPath(); ctx.moveTo(20, cy); ctx.lineTo(V.w - 20, cy); ctx.stroke();
      cap(ctx, V, q !== undefined ? '积木摞：后一摞是前一摞的 q 倍（指数增长）' : '积木摞：每摞比前一摞多 d 块（线性增长）');
      t++; window.requestAnimationFrame(loop);
    })();
  }

  /* ---------- 14. 光学：透镜成像位置 ---------- */
  function vizLens(host, params, rows, P) {
    const V = mkCanvas(host, 420, 170);
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const rowsNow = rows();
      let v = null;
      rowsNow.forEach(function (r) {
        const n = typeof r[1] === 'number' ? r[1] : parseFloat(r[1]);
        if (isFinite(n) && /像距|v$|v =/.test(String(r[0])) && v === null) v = n;
      });
      const cy = V.h / 2, cx = V.w / 2;
      ctx.strokeStyle = '#334155';
      ctx.beginPath(); ctx.moveTo(20, cy); ctx.lineTo(V.w - 20, cy); ctx.stroke();
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(cx, 25); ctx.lineTo(cx, V.h - 25); ctx.stroke();
      const u = P('u') !== undefined ? P('u') : 30;
      const ux = cx - Math.min(180, u * 4);
      arrow(ctx, ux, cy, ux, cy - 26, '#dc2626', 2.5);
      if (v !== null && isFinite(v)) {
        const vx = cx + Math.max(-180, Math.min(180, v * 4));
        if (v > 0) arrow(ctx, vx, cy, vx, cy + 26, '#4ade80', 2.5);
        else arrow(ctx, vx, cy, vx, cy - 26, '#f59e0b', 2.5);
        ctx.fillStyle = v > 0 ? '#4ade80' : '#f59e0b'; ctx.font = '10.5px sans-serif';
        ctx.fillText(v > 0 ? '实像(异侧)' : '虚像(同侧)', vx - 24, cy + (v > 0 ? 42 : -34));
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('物距 u=' + u, 16, 18);
      cap(ctx, V, '红=物体 绿=实像（倒立、异侧） 橙=虚像（正立、同侧）');
      window.requestAnimationFrame(loop);
    })();
  }

  /* ---------- 14. 通用动态条图（兜底视图：任何数值结果都能动起来） ----------
   * 每行结果一根条，长度=相对最大值的占比；参数变化时条长按弹性缓动跟随，绝不生硬跳变。 */
  function vizBars(host, params, rows, P) {
    const V = mkCanvas(host, 420, 170);
    let t = 0;
    const smooth = {}; // 每行当前显示长度（缓动）
    function rowNum(v) {
      if (typeof v === 'number' && isFinite(v)) return v;
      if (typeof v === 'string') { const m = parseFloat(v); if (isFinite(m) && /^[-+]?[\d.]/.test(v.trim())) return m; }
      return null;
    }
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const rowsNow = (typeof rows === 'function' ? rows() : rows) || [];
      const data = rowsNow.map(function (r) { return { label: String(r[0]), val: rowNum(r[1]), raw: r[1] }; })
        .filter(function (r) { return r.val !== null; }).slice(0, 5);
      if (!data.length) {
        ctx.fillStyle = '#94a3b8'; ctx.font = '12px sans-serif';
        ctx.fillText('结果以文本形式给出，见上方读数。', 16, 30);
        t++; window.requestAnimationFrame(loop); return;
      }
      let maxAbs = 0;
      data.forEach(function (d) { maxAbs = Math.max(maxAbs, Math.abs(d.val)); });
      if (maxAbs < 1e-12) maxAbs = 1;
      const x0 = 108, xMax = V.w - 66, barH = 20, gap = 8;
      const y0 = 26;
      const pulse = 1 + Math.sin(t * 0.06) * 0.012; // 呼吸微动，提示"这是活的"
      data.forEach(function (d, i) {
        const y = y0 + i * (barH + gap);
        const target = Math.abs(d.val) / maxAbs * (xMax - x0);
        smooth[i] = smooth[i] === undefined ? 0 : smooth[i] + (target - smooth[i]) * 0.14;
        const len = smooth[i] * pulse;
        const hue = ['#38bdf8', '#4ade80', '#fbbf24', '#f472b6', '#a78bfa'][i % 5];
        // 负值向左画（相对零点在最左端即可，取绝对长度，颜色提示符号）
        ctx.fillStyle = d.val < 0 ? '#f87171' : hue;
        ctx.beginPath();
        const rr = Math.min(4, len / 2);
        const xR = x0 + len, yR = y + barH;
        ctx.moveTo(x0, y);
        ctx.lineTo(xR - rr, y); ctx.arcTo(xR, y, xR, y + rr, rr);
        ctx.lineTo(xR, yR - rr); ctx.arcTo(xR, yR, xR - rr, yR, rr);
        ctx.lineTo(x0, yR); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#cbd5e1'; ctx.font = '10.5px sans-serif'; ctx.textAlign = 'right';
        ctx.fillText(d.label.slice(0, 9), x0 - 8, y + barH / 2 + 4);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(typeof d.raw === 'number' ? UI.fmt(d.raw, 3) : String(d.raw), x0 + len + 6, y + barH / 2 + 4);
      });
      ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif';
      ctx.fillText('红色=负值；条长按最大结果归一，拖滑块看它们此消彼长', 14, V.h - 8);
      t++; window.requestAnimationFrame(loop);
    })();
  }

  /* ---------- 匹配规则：分支/标题 → 模板 ---------- */
  const RULES = [
    [/运动学|自由落体|竖直上抛|匀变速/, vizMotion],
    [/圆周|抛体/, vizCircular],
    [/三角/, vizTrig],
    [/电学|电路|欧姆|电功率|电功|电磁学/, vizCircuit],
    [/溶液|浓度|溶解/, vizSolution],
    [/压强|浮力/, vizPressure],
    [/力|功|能|动量|守恒/, vizForce],
    [/几何|图形|面积|周长|圆|四边形|三角形/, vizShape],
    [/概率/, vizProb],
    [/方程|不等式|零点|数轴/, vizAxis],
    [/化学|反应|酸碱|气体|摩尔|速率/, vizBubbles],
    [/向量/, vizVector],
    [/数列/, vizSequence],
    [/光学|透镜|折射|反射/, vizLens],
    [/[\s\S]/, vizBars] // 兜底：任何 calc 实验至少有会呼吸的动态条图
  ];

  LV.mount = function (host, item, params, computeRows) {
    const key = (item.branch || '') + '|' + item.title;
    for (let i = 0; i < RULES.length; i++) {
      if (RULES[i][0].test(key)) {
        const P = function (k) { return params[k]; };
        try {
          RULES[i][1](host, params, computeRows, P);
          return true;
        } catch (e) { return false; }
      }
    }
    return false;
  };

  window.LabViz = LV;
})();
