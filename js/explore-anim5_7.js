/* explore-anim5_7.js — 第三批动画引擎（交通树 · 批次7，11 个专属原理动画） */
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

  /* 轮子与滚动摩擦：拖箱子 vs 滚车轮，同样的货、百倍的差距 */
  AN.wheelFriction = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const mu = Math.max(0.001, Math.min(0.02, D.mu !== undefined ? D.mu : 0.004));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const muS = 0.3, mass = 1000; // 滑动系数固定，货重 1 吨
      const fS = muS * mass, fR = mu * mass; // 单位：kg 力
      // 场景一：拖箱子（滑动）
      const g1 = 96;
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(8, g1); ctx.lineTo(240, g1); ctx.stroke();
      const shake = Math.sin(t * 0.9) * 0.8;
      ctx.fillStyle = '#a16207'; ctx.fillRect(88 + shake, g1 - 34, 44, 34);
      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.5; ctx.strokeRect(88 + shake, g1 - 34, 44, 34);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('1 吨货（滑动）', 84, g1 - 42);
      // 拉力绳与阻力箭头
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath(); ctx.moveTo(88 + shake, g1 - 17); ctx.lineTo(58, g1 - 17); ctx.stroke();
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(132, g1 - 17); ctx.lineTo(182, g1 - 17); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(182, g1 - 17); ctx.lineTo(174, g1 - 21); ctx.moveTo(182, g1 - 17); ctx.lineTo(174, g1 - 13); ctx.stroke();
      ctx.fillStyle = '#ef4444'; ctx.font = '10px sans-serif';
      ctx.fillText('滑动阻力 ≈ ' + Math.round(fS) + ' kg', 128, g1 - 28);
      // 场景二：车轮（滚动）
      const g2 = 192;
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(8, g2); ctx.lineTo(240, g2); ctx.stroke();
      const wx = 40 + ((t * 1.4) % 190);
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(wx, g2 - 14, 14, 0, Math.PI * 2); ctx.stroke();
      const thw = wx / 14;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const a = thw + i * Math.PI / 3;
        ctx.beginPath(); ctx.moveTo(wx, g2 - 14);
        ctx.lineTo(wx + 13 * Math.cos(a), g2 - 14 + 13 * Math.sin(a)); ctx.stroke();
      }
      ctx.fillStyle = '#a16207'; ctx.fillRect(wx - 16, g2 - 46, 32, 26);
      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1; ctx.strokeRect(wx - 16, g2 - 46, 32, 26);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('同样的货（装轮）', 34, g2 - 54);
      ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(wx + 17, g2 - 30); ctx.lineTo(wx + 27, g2 - 30); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(wx + 27, g2 - 30); ctx.lineTo(wx + 22, g2 - 33); ctx.moveTo(wx + 27, g2 - 30); ctx.lineTo(wx + 22, g2 - 27); ctx.stroke();
      ctx.fillStyle = '#22c55e';
      ctx.fillText('滚动阻力 ≈ ' + fR.toFixed(1) + ' kg', wx + 10, g2 - 38);
      // 右侧同比例力柱
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('同比例对比', 268, 40);
      const sc = 0.42, base = 200;
      ctx.fillStyle = '#ef4444'; ctx.fillRect(262, base - fS * sc, 26, fS * sc);
      ctx.fillStyle = '#22c55e'; ctx.fillRect(310, base - Math.max(1.5, fR * sc), 26, Math.max(1.5, fR * sc));
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(252, base); ctx.lineTo(346, base); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('滑动', 264, base + 12); ctx.fillText('滚动', 312, base + 12);
      ctx.fillText(Math.round(fS) + ' kg', 258, base - fS * sc - 4);
      ctx.fillStyle = '#4ade80';
      ctx.fillText(fR.toFixed(1) + ' kg', 304, base - Math.max(1.5, fR * sc) - 4);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('μ = ' + mu.toFixed(3) + '：滚动比滑动省力约 ' + Math.round(fS / fR) + ' 倍', 14, 20);
      cap(ctx, V, '轮子把"剪断微观焊点"变成"压过微小变形"（约前3500年）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 热气球：浮力 = 排开冷空气的重量 */
  AN.hotAirBalloon = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, cy = 118;
    const seeds = [];
    for (let i = 0; i < 18; i++) seeds.push({ a: Math.random(), b: Math.random(), p: Math.random() * 6 });
    (function loop() {
      const D = (tp && tp.data) || {};
      const temp = Math.max(20, Math.min(120, D.temp !== undefined ? D.temp : 100));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const rho0 = 1.225, T0 = 288;
      const rhoIn = rho0 * T0 / (temp + 273);
      const lift = (rho0 - rhoIn) * 2000; // 2000 m³ 球囊
      const payload = 420;
      const net = lift - payload;
      const target = net > 15 ? 66 : net < -15 ? 168 : 118;
      cy += (target - cy) * 0.02;
      const y = cy + Math.sin(t * 0.05) * 2;
      const cx = 118;
      // 地面
      ctx.fillStyle = '#14532d'; ctx.fillRect(0, 216, V.w, 24);
      // 球外冷空气粒子（慢，蓝）
      for (let i = 0; i < 12; i++) {
        const ox = (i * 53 + t * 0.15) % 250 + 8;
        const oy = 30 + ((i * 37) % 170);
        if (Math.abs(ox - cx) < 62 && Math.abs(oy - y) < 72) continue;
        ctx.fillStyle = 'rgba(125,211,252,.5)';
        ctx.beginPath(); ctx.arc(ox, oy, 2, 0, Math.PI * 2); ctx.fill();
      }
      // 球囊
      const heat = (temp - 20) / 100;
      ctx.fillStyle = 'rgba(249,115,22,' + (0.25 + heat * 0.45) + ')';
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(cx, y, 52, 60, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // 球内热空气粒子（快，橙红）
      seeds.forEach(function (s, i) {
        const jit = 1 + heat * 3;
        const px = cx + Math.sin(t * 0.06 * jit + s.p * 7) * 42 * s.a;
        const py = y + Math.cos(t * 0.05 * jit + s.p * 9) * 50 * s.b;
        ctx.fillStyle = i % 2 ? '#f87171' : '#fdba74';
        ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
      });
      // 燃烧器火焰
      const fh = 6 + heat * 10 + Math.sin(t * 0.5) * 2;
      ctx.fillStyle = '#f97316';
      ctx.beginPath(); ctx.moveTo(cx - 5, y + 66); ctx.lineTo(cx, y + 66 - fh); ctx.lineTo(cx + 5, y + 66); ctx.fill();
      // 吊篮与绳索
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx - 24, y + 44); ctx.lineTo(cx - 10, y + 74); ctx.moveTo(cx + 24, y + 44); ctx.lineTo(cx + 10, y + 74); ctx.stroke();
      ctx.fillStyle = '#78350f'; ctx.fillRect(cx - 12, y + 74, 24, 16);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('吊篮', cx - 10, y + 102);
      // 右侧力箭头：浮力 vs 重力
      const ax = 250;
      ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 3;
      const hUp = Math.max(4, lift / 7);
      ctx.beginPath(); ctx.moveTo(ax, 190); ctx.lineTo(ax, 190 - hUp); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ax, 190 - hUp); ctx.lineTo(ax - 4, 198 - hUp); ctx.moveTo(ax, 190 - hUp); ctx.lineTo(ax + 4, 198 - hUp); ctx.stroke();
      ctx.fillStyle = '#22c55e'; ctx.font = '10px sans-serif';
      ctx.fillText('浮力 ' + Math.round(lift) + ' kg', ax - 34, 204);
      ctx.strokeStyle = '#ef4444';
      ctx.beginPath(); ctx.moveTo(ax + 70, 70); ctx.lineTo(ax + 70, 70 + payload / 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ax + 70, 70 + payload / 7); ctx.lineTo(ax + 66, 62 + payload / 7); ctx.moveTo(ax + 70, 70 + payload / 7); ctx.lineTo(ax + 74, 62 + payload / 7); ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.fillText('重力 ' + payload + ' kg', ax + 36, 158);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('球内 ' + temp + '°C：ρ = ' + rhoIn.toFixed(2) + ' kg/m³（球外 1.23）', 14, 20);
      ctx.fillText('2000 m³ 球囊 → 净升力 ' + (net >= 0 ? '+' : '') + Math.round(net) + ' kg ' + (net > 15 ? '↑升空' : net < -15 ? '↓下降' : '→悬停'), 14, 38);
      cap(ctx, V, '浮力 = 排开冷空气的重量（阿基米德原理对空气同样成立）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 蒸汽机车与钢轨：粘着上限 = μ × 轴重，超限就空转 */
  AN.railAdhesion = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, vTrain = 0.3, thW = 0, off = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const adh = Math.max(0.1, Math.min(0.35, D.adh !== undefined ? D.adh : 0.2));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const axleT = 100; // 驱动轴总重（吨）
      const fMax = adh * axleT, demand = 24; // 吨力
      const grip = fMax >= demand;
      // 速度与车轮状态
      vTrain += ((grip ? 2.2 : 0.35) - vTrain) * 0.01;
      thW += grip ? vTrain / 14 : 0.35; // 空转时车轮疯转
      off -= vTrain;
      // 钢轨与枕木（滚动）
      const ry = 172;
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
      for (let x = off % 24; x < 260; x += 24) {
        ctx.beginPath(); ctx.moveTo(x, ry + 4); ctx.lineTo(x, ry + 12); ctx.stroke();
      }
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, ry); ctx.lineTo(260, ry); ctx.stroke();
      // 车厢
      ctx.fillStyle = '#334155'; ctx.fillRect(30, 116, 70, 40);
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5; ctx.strokeRect(30, 116, 70, 40);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('车厢', 52, 138);
      // 机车
      ctx.fillStyle = '#7f1d1d'; ctx.fillRect(112, 108, 88, 48);
      ctx.strokeStyle = '#b91c1c'; ctx.strokeRect(112, 108, 88, 48);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('机车（驱动轴重 100 t）', 108, 102);
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(100, 140); ctx.lineTo(112, 140); ctx.stroke();
      // 驱动轮
      [128, 172].forEach(function (wx) {
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(wx, ry - 14, 14, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(wx, ry - 14);
        ctx.lineTo(wx + 13 * Math.cos(thW), ry - 14 + 13 * Math.sin(thW)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(wx, ry - 14);
        ctx.lineTo(wx - 13 * Math.cos(thW), ry - 14 - 13 * Math.sin(thW)); ctx.stroke();
        if (!grip) { // 空转火花
          for (let i = 0; i < 3; i++) {
            const sa = Math.random() * Math.PI;
            ctx.strokeStyle = '#fde047';
            ctx.beginPath(); ctx.moveTo(wx, ry);
            ctx.lineTo(wx - 6 * Math.cos(sa), ry - 6 * Math.sin(sa)); ctx.stroke();
          }
        }
      });
      // 右侧对比柱
      ctx.fillStyle = '#22c55e'; ctx.fillRect(292, 200 - fMax * 3, 24, fMax * 3);
      ctx.setLineDash([4, 3]); ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(282, 200 - demand * 3); ctx.lineTo(330, 200 - demand * 3); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('粘着上限', 284, 212);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('需求 24 t', 268, 200 - demand * 3 - 5);
      // 状态
      ctx.fillStyle = grip ? '#4ade80' : '#f87171'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText(grip ? '✓ 粘着良好，列车加速前进' : '✗ 超出粘着：车轮空转打滑！', 16, 24);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('μ = ' + adh.toFixed(2) + ' × 100 t → 牵引上限 ' + fMax.toFixed(0) + ' t 力', 16, 42);
      cap(ctx, V, '牵引力 ≤ 粘着系数 × 轴重：不够就撒砂（1825 斯蒂芬森）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 差速器：行星锥齿轮吸收左右轮转速差 */
  AN.differential = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, thC = 0, thL = 0, thR = 0, thP = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const r = Math.max(6, Math.min(50, D.r !== undefined ? D.r : 12));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const w0 = 0.03; // 输入（齿圈/行星架）角速度
      const wL = w0 * (1 - 1 / r), wR = w0 * (1 + 1 / r); // ω左+ω右=2ω输入
      thC += w0; thL += wL; thR += wR; thP += (wR - wL) * 3;
      const cyA = 96, xL = 60, xR = 300, xC = 180;
      // 传动轴输入
      ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(xC, 30); ctx.lineTo(xC, cyA - 22); ctx.stroke();
      ctx.fillStyle = '#a78bfa'; ctx.font = '10px sans-serif';
      ctx.fillText('来自发动机', xC + 8, 40);
      // 车轴
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(xL, cyA); ctx.lineTo(xR, cyA); ctx.stroke();
      // 行星架（随输入转）
      const cx1 = xC + 18 * Math.cos(thC), cy1 = cyA + 18 * Math.sin(thC);
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(2 * xC - cx1, 2 * cyA - cy1); ctx.lineTo(cx1, cy1); ctx.stroke();
      // 行星锥齿轮（两个，自转吸收差速）
      [[cx1, cy1], [2 * xC - cx1, 2 * cyA - cy1]].forEach(function (p) {
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p[0], p[1], 7, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(p[0], p[1]);
        ctx.lineTo(p[0] + 6 * Math.cos(thP), p[1] + 6 * Math.sin(thP)); ctx.stroke();
      });
      ctx.fillStyle = '#fbbf24'; ctx.font = '9px sans-serif';
      ctx.fillText('行星齿轮', xC + 22, cyA - 26);
      // 半轴齿轮
      [[xC - 26, thL], [xC + 26, thR]].forEach(function (g) {
        ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(g[0], cyA, 9, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(g[0], cyA);
        ctx.lineTo(g[0] + 8 * Math.cos(g[1]), cyA + 8 * Math.sin(g[1])); ctx.stroke();
      });
      // 左右车轮
      [[xL, thL, '左轮（内侧）', wL], [xR, thR, '右轮（外侧）', wR]].forEach(function (wh) {
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(wh[0], cyA, 24, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(wh[0], cyA);
        ctx.lineTo(wh[0] + 22 * Math.cos(wh[1]), cyA + 22 * Math.sin(wh[1])); ctx.stroke();
        ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
        ctx.fillText(wh[2], wh[0] - 24, cyA + 40);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(Math.round(wh[3] / w0 * 40) + ' rpm', wh[0] - 16, cyA + 52);
      });
      // 弯道示意：内外路径
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.arc(90, 320, 130, -Math.PI / 2, -Math.PI / 6); ctx.stroke();
      ctx.strokeStyle = '#64748b';
      ctx.beginPath(); ctx.arc(90, 320, 160, -Math.PI / 2, -Math.PI / 6); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('内轮路径短', 26, 168); ctx.fillText('外轮路径长', 120, 196);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('转弯半径 ' + r + ' m：内外轮速差 ' + Math.round(200 / r) + '%，行星齿轮自转吸收', 14, 16);
      cap(ctx, V, 'ω左 + ω右 = 2ω输入：允许差速，但扭矩永远平分（1827 佩克尔）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 拉瓦尔喷管：收缩段亚音速加速，喉部 M=1，扩张段超音速加速 */
  AN.deLavalNozzle = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const parts = [];
    for (let i = 0; i < 30; i++) parts.push({ x: 40 + Math.random() * 280, f: Math.random() * 1.6 - 0.8 });
    function areaRatio(M) { return (1 / M) * Math.pow((1 + 0.2 * M * M) / 1.2, 3); }
    function mFromA(A, sup) {
      let lo = sup ? 1.0001 : 0.02, hi = sup ? 8 : 1;
      for (let i = 0; i < 50; i++) {
        const mid = (lo + hi) / 2;
        if (sup) { if (areaRatio(mid) < A) lo = mid; else hi = mid; }
        else { if (areaRatio(mid) > A) lo = mid; else hi = mid; }
      }
      return (lo + hi) / 2;
    }
    (function loop() {
      const D = (tp && tp.data) || {};
      const ar = Math.max(1, Math.min(9, D.ar !== undefined ? D.ar : 4));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cy = 92, ht = 12, x0 = 40, xt = 150, x1 = 320;
      const he = Math.min(46, ht * Math.sqrt(ar));
      function halfH(x) {
        if (x <= xt) return ht + (42 - ht) * Math.pow((xt - x) / (xt - x0), 1.4);
        return ht + (he - ht) * Math.pow((x - xt) / (x1 - xt), 0.8);
      }
      function machAt(x) {
        const A = Math.pow(halfH(x) / ht, 2);
        return mFromA(A, x > xt);
      }
      const Me = mFromA(ar, true);
      // 喷管壁
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = x0; x <= x1; x += 4) { const y = cy - halfH(x); if (x === x0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.stroke();
      ctx.beginPath();
      for (let x = x0; x <= x1; x += 4) { const y = cy + halfH(x); if (x === x0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.stroke();
      // 喉部标记
      ctx.setLineDash([3, 3]); ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(xt, cy - ht - 10); ctx.lineTo(xt, cy + ht + 10); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#fbbf24'; ctx.font = '9px sans-serif';
      ctx.fillText('喉部 M=1', xt - 20, cy + ht + 22);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('燃烧室高压燃气 →', 4, cy - 50);
      ctx.fillText('喷流 →', x1 + 4, cy);
      // 气流粒子：速度 ∝ 当地马赫数，颜色由蓝到红
      parts.forEach(function (p) {
        const m = machAt(p.x);
        p.x += 0.35 + m * 0.55;
        if (p.x > x1 + 30) { p.x = x0; p.f = Math.random() * 1.6 - 0.8; }
        const h = p.x <= x1 ? halfH(p.x) - 3 : he + 6 + Math.sin(t * 0.1 + p.f * 9) * 3;
        const y = cy + p.f * h;
        const heat = Math.min(1, m / 6);
        ctx.fillStyle = heat < 0.5 ? '#38bdf8' : heat < 0.8 ? '#fbbf24' : '#ef4444';
        ctx.beginPath(); ctx.arc(p.x, y, 2, 0, Math.PI * 2); ctx.fill();
      });
      // M(x) 曲线
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(40, 176, 280, 48);
      ctx.setLineDash([3, 3]); ctx.strokeStyle = '#475569';
      const yM1 = 224 - (1 / 8) * 48;
      ctx.beginPath(); ctx.moveTo(40, yM1); ctx.lineTo(320, yM1); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('M=1', 324, yM1 + 3);
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = x0; x <= x1; x += 4) {
        const y = 224 - (machAt(x) / 8) * 48;
        if (x === x0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('气流马赫数沿程变化', 46, 172);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('面积比 ' + ar.toFixed(1) + ' → 出口 M ≈ ' + Me.toFixed(2) + '：扩张越多喷流越快', 14, 18);
      cap(ctx, V, '亚音速收缩加速、超音速扩张加速（1888 拉瓦尔 → 1926 戈达德火箭）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 潜艇沉浮：刚性壳体浮力不变，压载水舱改变重量 */
  AN.subBallast = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, y = 130, prevB = 55;
    const bubbles = [];
    (function loop() {
      const D = (tp && tp.data) || {};
      const ballast = Math.max(0, Math.min(100, D.ballast !== undefined ? D.ballast : 55));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const dens = 0.85 + ballast / 100 * 0.35; // 平均密度
      // 海水
      ctx.fillStyle = 'rgba(30,64,175,.28)'; ctx.fillRect(0, 52, V.w, 168);
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x <= 360; x += 6) {
        const wy = 52 + Math.sin(x * 0.08 + t * 0.08) * 2.5;
        if (x === 0) ctx.moveTo(x, wy); else ctx.lineTo(x, wy);
      }
      ctx.stroke();
      ctx.fillStyle = '#7dd3fc'; ctx.font = '9px sans-serif';
      ctx.fillText('海面', 6, 46);
      ctx.fillStyle = '#0b3b6b'; ctx.fillRect(0, 220, V.w, 20);
      ctx.fillStyle = '#7dd3fc'; ctx.fillText('海底', 6, 234);
      // 目标深度
      const target = dens < 1.01 ? 62 : dens > 1.05 ? 200 : 130;
      y += (target - y) * 0.02;
      const sy = y + Math.sin(t * 0.04) * 1.5;
      // 吹除气泡 / 注水水花
      if (ballast < prevB - 0.5) for (let i = 0; i < 3; i++) bubbles.push({ x: 140 + Math.random() * 80, y: sy + 14, r: 1 + Math.random() * 2 });
      prevB = ballast;
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.y -= 1.2; b.r += 0.02;
        ctx.strokeStyle = 'rgba(125,211,252,.7)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke();
        if (b.y < 54) bubbles.splice(i, 1);
      }
      // 潜艇
      const sx = 180;
      ctx.fillStyle = '#334155'; ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(sx, sy, 74, 16, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillRect(sx - 12, sy - 28, 24, 13); ctx.strokeRect(sx - 12, sy - 28, 24, 13);
      // 压载水舱（内部两个）
      [sx - 52, sx + 14].forEach(function (tx) {
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1;
        ctx.strokeRect(tx, sy - 9, 38, 18);
        ctx.fillStyle = 'rgba(56,189,248,.65)';
        const fh2 = 18 * ballast / 100;
        ctx.fillRect(tx + 1, sy - 9 + 18 - fh2, 36, fh2);
      });
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('压载水舱', sx - 20, sy + 34);
      // 力箭头：浮力恒定，重力随注水
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(292, sy + 20); ctx.lineTo(292, sy - 22); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(292, sy - 22); ctx.lineTo(288, sy - 14); ctx.moveTo(292, sy - 22); ctx.lineTo(296, sy - 14); ctx.stroke();
      ctx.fillStyle = '#38bdf8'; ctx.font = '9px sans-serif';
      ctx.fillText('浮力恒定', 300, sy - 10);
      const gLen = 18 + ballast * 0.3;
      ctx.strokeStyle = '#ef4444';
      ctx.beginPath(); ctx.moveTo(330, sy - 20); ctx.lineTo(330, sy - 20 + gLen); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(330, sy - 20 + gLen); ctx.lineTo(326, sy - 28 + gLen); ctx.moveTo(330, sy - 20 + gLen); ctx.lineTo(334, sy - 28 + gLen); ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.fillText('重力', 336, sy + 6);
      // 状态
      const st = dens < 1.01 ? '↑ 上浮（密度 < 海水）' : dens > 1.05 ? '↓ 下沉（密度 > 海水）' : '→ 悬浮（密度 ≈ 海水）';
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('注水 ' + ballast + '% → 平均密度 ' + dens.toFixed(2) + '（海水 1.03）', 14, 20);
      ctx.fillStyle = dens < 1.01 ? '#4ade80' : dens > 1.05 ? '#f87171' : '#fbbf24';
      ctx.fillText(st, 14, 38);
      cap(ctx, V, '刚性壳体浮力 F=ρgV 不变：调重量实现沉浮（1620 德莱贝尔）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 惯性导航：陀螺定轴 + 加速度二次积分，误差随时间平方累积 */
  AN.inertialNav = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, estX = 0, estY = 0, estVx = 0, estVy = 0, started = false;
    const trailT = [], trailE = [];
    (function loop() {
      const D = (tp && tp.data) || {};
      const drift = Math.max(0.01, Math.min(1, D.drift !== undefined ? D.drift : 0.1));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const th = t * 0.008; // 游戏内飞行小时
      const errA = drift * th * Math.PI / 180; // 航向误差（弧度）
      // 真实位置：利萨茹航线
      const cxM = 262, cyM = 118, om = 0.011;
      const tx = cxM + 66 * Math.cos(t * om), ty = cyM + 42 * Math.sin(2 * t * om);
      // 惯导推算：对真实速度以错误航向积分
      const vx = -66 * om * Math.sin(t * om), vy = 84 * om * Math.cos(2 * t * om);
      const ca = Math.cos(-errA), sa = Math.sin(-errA);
      const evx = vx * ca - vy * sa, evy = vx * sa + vy * ca;
      if (!started) { estX = tx; estY = ty; started = true; }
      estVx = evx; estVy = evy;
      estX += estVx; estY += estVy;
      // 跑偏太远就重新对准起点重新积累（演示用）
      const errPx = Math.hypot(estX - tx, estY - ty);
      if (errPx > 130 || t % 2400 === 0 && t > 0) { estX = tx; estY = ty; trailT.length = 0; trailE.length = 0; }
      trailT.push([tx, ty]); trailE.push([estX, estY]);
      if (trailT.length > 300) { trailT.shift(); trailE.shift(); }
      // 地图区
      ctx.strokeStyle = 'rgba(148,163,184,.35)'; ctx.lineWidth = 1;
      ctx.strokeRect(170, 40, 178, 168);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('航线图（无外界信号）', 180, 34);
      ctx.strokeStyle = 'rgba(226,232,240,.8)'; ctx.lineWidth = 1;
      ctx.beginPath();
      trailT.forEach(function (p, i) { if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
      ctx.stroke();
      ctx.strokeStyle = 'rgba(34,211,238,.9)';
      ctx.beginPath();
      trailE.forEach(function (p, i) { if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(tx, ty, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath(); ctx.arc(estX, estY, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(239,68,68,.8)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(estX, estY); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('●真实', 296, 200); ctx.fillStyle = '#22d3ee'; ctx.fillText('●惯导推算', 236, 200);
      // 左侧陀螺仪：外框随机体转，转子轴保持不动
      const gx = 78, gy = 100;
      const bodyA = Math.sin(t * 0.02) * 0.7;
      ctx.save(); ctx.translate(gx, gy); ctx.rotate(bodyA);
      ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 2;
      ctx.strokeRect(-34, -34, 68, 68);
      ctx.restore();
      ctx.fillStyle = '#a78bfa'; ctx.font = '9px sans-serif';
      ctx.fillText('机体框架', gx - 22, gy + 52);
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(gx, gy, 24, 10, 0, 0, Math.PI * 2); ctx.stroke();
      // 转子：高速旋转，轴向固定（竖直）
      const spin = t * 0.6;
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(gx, gy, 14, 5, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(gx - 13 * Math.cos(spin), gy - 4 * Math.cos(spin));
      ctx.lineTo(gx + 13 * Math.cos(spin), gy + 4 * Math.cos(spin)); ctx.stroke();
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy - 34); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gx, gy - 34); ctx.lineTo(gx - 4, gy - 26); ctx.moveTo(gx, gy - 34); ctx.lineTo(gx + 4, gy - 26); ctx.stroke();
      ctx.fillStyle = '#fbbf24'; ctx.font = '9px sans-serif';
      ctx.fillText('陀螺轴（角动量守恒）', gx - 44, gy - 44);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('加速度 a →∫ 速度 v →∫ 位置 x', 24, 176);
      const errKm = errPx * 15;
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('已飞 ' + th.toFixed(1) + ' h｜漂移 ' + drift.toFixed(2) + '°/h → 误差 ≈ ' + Math.round(errKm) + ' km', 14, 16);
      cap(ctx, V, '陀螺给基准、加速度计二次积分：误差 ∝ t²（1944 V-2 火箭）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 声障与激波：M<1 声波前传，M=1 叠加成墙，M>1 马赫锥 */
  AN.soundBarrier = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const emits = [];
    let planeX = 60, lastEmit = -99;
    (function loop() {
      const D = (tp && tp.data) || {};
      const m = Math.max(0.5, Math.min(2, D.m !== undefined ? D.m : 1.1));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const a = 1.5; // 声速 px/帧
      const py = 86;
      planeX += m * a;
      if (planeX - 240 > 260) { planeX = 60; emits.length = 0; }
      if (t - lastEmit >= 14) { emits.push({ x: planeX, r: 0 }); lastEmit = t; }
      const off = planeX - 240; // 镜头跟随飞机
      // 声波圈
      for (let i = emits.length - 1; i >= 0; i--) {
        const e = emits[i];
        e.r += a;
        if (e.r > 340) { emits.splice(i, 1); continue; }
        ctx.strokeStyle = 'rgba(125,211,252,.5)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(e.x - off, py, e.r, 0, Math.PI * 2); ctx.stroke();
      }
      // 激波
      if (m > 1.02) {
        const muA = Math.asin(1 / m);
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(240, py);
        ctx.lineTo(240 - 220, py - 220 * Math.tan(muA)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(240, py);
        ctx.lineTo(240 - 220, py + 220 * Math.tan(muA)); ctx.stroke();
        ctx.fillStyle = '#ef4444'; ctx.font = '9px sans-serif';
        ctx.fillText('马赫锥 sin μ = 1/M', 30, py - 84);
      } else if (m >= 0.95) {
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(240, py - 44); ctx.lineTo(240, py + 44); ctx.stroke();
        ctx.fillStyle = '#ef4444'; ctx.font = '9px sans-serif';
        ctx.fillText('激波墙（声波堆积）', 150, py - 52);
      }
      // 飞机（机头朝左，迎着空气）
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath(); ctx.moveTo(240, py); ctx.lineTo(266, py - 6); ctx.lineTo(266, py + 6); ctx.closePath(); ctx.fill();
      ctx.fillRect(266, py - 3, 26, 6);
      ctx.beginPath(); ctx.moveTo(276, py); ctx.lineTo(288, py - 14); ctx.lineTo(288, py - 8); ctx.lineTo(280, py); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('X-1', 268, py + 18);
      // 阻力系数曲线
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(30, 160, 300, 56);
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 300; i++) {
        const mm = 0.5 + i / 300 * 1.5;
        const cd = 0.4 + 1.8 * Math.exp(-Math.pow((mm - 1) / 0.18, 2)) + (mm > 1 ? (mm - 1) * 0.35 : 0);
        const y = 216 - cd / 2.6 * 56;
        if (i === 0) ctx.moveTo(30 + i, y); else ctx.lineTo(30 + i, y);
      }
      ctx.stroke();
      const cdNow = 0.4 + 1.8 * Math.exp(-Math.pow((m - 1) / 0.18, 2)) + (m > 1 ? (m - 1) * 0.35 : 0);
      const mx = 30 + (m - 0.5) / 1.5 * 300, my = 216 - cdNow / 2.6 * 56;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(mx, my, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('阻力系数 vs 马赫数（M=1 处猛增）', 40, 156);
      const regime = m < 0.95 ? '亚音速：声波跑在前面' : m <= 1.05 ? '跨音速：声波堆积成激波墙' : '超音速：声波被甩成马赫锥';
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('M = v/a = ' + m.toFixed(2) + ' → ' + regime, 14, 20);
      cap(ctx, V, '1947 年耶格尔 X-1 突破声障：锥角 sin μ = 1/M，越快越尖');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 高铁流线型：阻力 ∝ v²，功率 ∝ v³ */
  AN.hsrDrag = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const air = [];
    for (let i = 0; i < 34; i++) air.push({ x: Math.random() * 360, y: 40 + Math.random() * 90 });
    (function loop() {
      const D = (tp && tp.data) || {};
      const v = Math.max(100, Math.min(400, D.v !== undefined ? D.v : 300));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 空气粒子：从右向左流过车身，头部偏转、尾部紊流
      const flow = 0.8 + v * 0.012;
      air.forEach(function (p) {
        p.x -= flow;
        if (p.x < -4) { p.x = 364; p.y = 40 + Math.random() * 90; }
        let py = p.y;
        if (p.x > 230 && p.x < 330 && p.y > 78) py = p.y - (330 - p.x) * 0.25; // 绕流抬升
        if (p.x < 70 && p.x > 10) py = p.y + Math.sin(t * 0.3 + p.x) * 3; // 尾流抖动
        ctx.fillStyle = 'rgba(125,211,252,.6)';
        ctx.beginPath(); ctx.arc(p.x, py, 1.8, 0, Math.PI * 2); ctx.fill();
      });
      // 车体（流线型车头朝右）
      ctx.fillStyle = '#cbd5e1'; ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(60, 128);
      ctx.lineTo(60, 96); ctx.lineTo(230, 96);
      ctx.quadraticCurveTo(310, 96, 330, 122);
      ctx.quadraticCurveTo(334, 128, 324, 128);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#334155';
      for (let i = 0; i < 6; i++) ctx.fillRect(76 + i * 24, 102, 16, 8);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('长细比车头（压差阻力↓、隧道微压波↓）', 120, 90);
      // 受电弓（已整流）
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(150, 96); ctx.lineTo(160, 80); ctx.lineTo(170, 96); ctx.stroke();
      // 转向架
      [100, 260].forEach(function (bx) {
        ctx.fillStyle = '#1e293b'; ctx.fillRect(bx - 18, 128, 36, 10);
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1; ctx.strokeRect(bx - 18, 128, 36, 10);
      });
      // 轨道
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 142); ctx.lineTo(360, 142); ctx.stroke();
      // 阻力分解：空气 vs 机械
      const fa = 0.004 * v * v, fr = 5.9; // kN
      const pct = fa / (fa + fr) * 100;
      const bw = 220;
      ctx.fillStyle = '#f97316'; ctx.fillRect(30, 178, bw * pct / 100, 16);
      ctx.fillStyle = '#475569'; ctx.fillRect(30 + bw * pct / 100, 178, bw * (1 - pct / 100), 16);
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1;
      ctx.strokeRect(30, 178, bw, 16);
      ctx.fillStyle = '#fdba74'; ctx.font = '9px sans-serif';
      ctx.fillText('空气阻力 ' + Math.round(pct) + '%', 34, 190);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('机械阻力', 30 + bw - 44, 190);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('阻力功率构成', 30, 170);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('v = ' + v + ' km/h：空气阻力 ≈ ' + Math.round(fa) + ' kN，推风功率 ≈ ' + (fa * v / 3600).toFixed(1) + ' MW', 14, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('时速 200→350：功率需求约 ×' + (Math.pow(v / 200, 3)).toFixed(1), 14, 36);
      cap(ctx, V, 'F = ½ρv²CdA：阻力 ∝ v²、功率 ∝ v³（1964 东海道新干线）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 磁悬浮：EMS 吸力式——主动控制把列车钉在 10 mm */
  AN.maglev = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const gap = Math.max(4, Math.min(20, D.gap !== undefined ? D.gap : 10));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 速度线（430 km/h 的奔驰感）
      ctx.strokeStyle = 'rgba(100,116,139,.4)'; ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const lx = 360 - ((t * 6 + i * 50) % 420);
        ctx.beginPath(); ctx.moveTo(lx, 150 + i * 7); ctx.lineTo(lx + 26, 150 + i * 7); ctx.stroke();
      }
      // 地面与导轨梁（T 型）
      ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 214, 360, 26);
      ctx.fillStyle = '#334155'; ctx.fillRect(150, 100, 30, 114); // 桥墩
      ctx.fillStyle = '#475569'; ctx.fillRect(40, 60, 280, 22); // 导轨梁
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('导轨（铁磁轨）', 40, 54);
      // 扰动 + 控制后的实际间隙
      const disturb = Math.sin(t * 0.09) * 1.1;
      const gapPx = 3 + gap * 1.1 + disturb;
      const magTop = 82 + gapPx; // 磁铁顶面
      // 车体
      const bodyY = magTop + 46;
      ctx.fillStyle = '#cbd5e1'; ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(70, bodyY + 26); ctx.lineTo(70, bodyY); ctx.lineTo(262, bodyY);
      ctx.quadraticCurveTo(292, bodyY + 2, 296, bodyY + 26);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#334155';
      for (let i = 0; i < 6; i++) ctx.fillRect(84 + i * 26, bodyY + 6, 18, 9);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('车体', 64, bodyY - 6);
      // 环抱臂 + 电磁铁（吸力面在导轨底）
      ctx.fillStyle = '#64748b';
      ctx.fillRect(84, magTop + 10, 12, bodyY - magTop + 16);
      ctx.fillRect(268, magTop + 10, 12, bodyY - magTop + 16);
      // 电磁铁亮度 ∝ 所需电流（间隙越大电流越大）
      const cur = 30 + gap * 3.5 + disturb * 6;
      const glow = Math.min(1, cur / 110);
      ctx.fillStyle = 'rgba(167,139,250,' + (0.4 + glow * 0.6) + ')';
      ctx.fillRect(96, magTop, 172, 10);
      ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 1;
      ctx.strokeRect(96, magTop, 172, 10);
      ctx.fillStyle = '#c4b5fd'; ctx.font = '9px sans-serif';
      ctx.fillText('电磁铁（向上吸）', 150, magTop + 24);
      // 间隙标注（双箭头）
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(60, 82); ctx.lineTo(60, magTop); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(60, 82); ctx.lineTo(56, 88); ctx.moveTo(60, 82); ctx.lineTo(64, 88); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(60, magTop); ctx.lineTo(56, magTop - 6); ctx.moveTo(60, magTop); ctx.lineTo(64, magTop - 6); ctx.stroke();
      ctx.fillStyle = '#fbbf24'; ctx.font = '10px sans-serif';
      ctx.fillText('间隙 ' + gap + ' mm', 66, (82 + magTop) / 2 + 4);
      // 传感-控制回路示意
      ctx.setLineDash([3, 3]); ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(268, magTop + 5); ctx.lineTo(330, magTop + 5); ctx.lineTo(330, 44); ctx.lineTo(180, 44); ctx.lineTo(180, 58); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#22d3ee'; ctx.font = '9px sans-serif';
      ctx.fillText('传感器每秒数千次测间隙 → 调电流', 110, 40);
      // 电流条
      ctx.fillStyle = '#334155'; ctx.fillRect(336, 60, 14, 120);
      ctx.fillStyle = glow > 0.75 ? '#ef4444' : '#22c55e';
      ctx.fillRect(336, 180 - cur * 1.09, 14, cur * 1.09);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('电流', 334, 192);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('目标间隙 ' + gap + ' mm：间隙越大，维持吸力所需电流越大', 14, 20);
      cap(ctx, V, '恩肖定理：静磁悬浮不稳定——必须主动控制（2004 上海磁浮 430 km/h）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 再生制动：电机被反拖时发电回充电池 */
  AN.regenBraking = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, soc = 0.6, recovered = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const brake = Math.max(0, Math.min(100, D.brake !== undefined ? D.brake : 60));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 相位机：驱动 120f → 巡航 80f → 制动 160f
      const ph = t % 360;
      let speed, phase, demand = 0;
      if (ph < 120) { speed = ph / 120; phase = '驱动：电池 → 电机 → 车轮'; }
      else if (ph < 200) { speed = 1; phase = '巡航'; }
      else { speed = Math.max(0, 1 - (ph - 200) / 140); phase = '制动：车轮 → 电机 → 电池'; demand = brake; }
      const braking = ph >= 200 && speed > 0.02;
      const regen = braking ? Math.min(demand, 70) : 0;
      const fric = braking ? demand - regen : 0;
      if (braking) { soc = Math.min(0.95, soc + regen * 0.000012); recovered += regen * 0.02; }
      if (ph < 120) soc = Math.max(0.3, soc - 0.00035);
      // 顶部速度曲线
      ctx.fillStyle = 'rgba(30,41,59,.9)'; ctx.fillRect(20, 26, 320, 40);
      ctx.fillStyle = 'rgba(34,211,238,.14)'; ctx.fillRect(20 + 320 * 200 / 360, 26, 320 * 160 / 360, 40);
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(20, 26, 320, 40);
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 320; i++) {
        const pp = i / 320 * 360;
        let s;
        if (pp < 120) s = pp / 120;
        else if (pp < 200) s = 1;
        else s = Math.max(0, 1 - (pp - 200) / 140);
        const y = 64 - s * 36;
        if (i === 0) ctx.moveTo(20 + i, y); else ctx.lineTo(20 + i, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(20 + ph / 360 * 320, 64 - speed * 36, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('车速', 24, 22); ctx.fillText('制动段', 236, 22);
      // 部件：电池 / 逆变器 / 电机 / 车轮
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.strokeRect(24, 100, 60, 56);
      ctx.fillStyle = 'rgba(34,197,94,.7)';
      ctx.fillRect(26, 154 - 52 * soc, 56, 52 * soc);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('电池 ' + Math.round(soc * 100) + '%', 28, 170);
      ctx.fillStyle = '#334155'; ctx.fillRect(128, 108, 44, 34);
      ctx.strokeRect(128, 108, 44, 34);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('逆变器', 130, 156);
      ctx.beginPath(); ctx.arc(224, 125, 19, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#334155'; ctx.beginPath(); ctx.arc(224, 125, 19, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      const spinD = t * (0.02 + speed * 0.12);
      ctx.beginPath(); ctx.moveTo(224, 125);
      ctx.lineTo(224 + 16 * Math.cos(spinD), 125 + 16 * Math.sin(spinD)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(224, 125);
      ctx.lineTo(224 - 16 * Math.cos(spinD), 125 - 16 * Math.sin(spinD)); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('电机', 214, 158);
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(300, 125, 22, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 1.5;
      const spinW = t * (0.02 + speed * 0.12);
      for (let i = 0; i < 3; i++) {
        const aa = spinW + i * Math.PI / 3;
        ctx.beginPath(); ctx.moveTo(300, 125);
        ctx.lineTo(300 + 20 * Math.cos(aa), 125 + 20 * Math.sin(aa)); ctx.stroke();
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('车轮', 290, 162);
      // 机械刹车盘（摩擦份额发红）
      if (fric > 0) {
        ctx.fillStyle = 'rgba(249,115,22,' + Math.min(1, fric / 30) + ')';
        ctx.beginPath(); ctx.arc(300, 125, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fdba74'; ctx.font = '9px sans-serif';
        ctx.fillText('摩擦补位', 316, 108);
      }
      // 能量流箭头
      const fwd = ph < 200;
      const flowCol = fwd ? '#4ade80' : '#22d3ee';
      const pth = [[54, 100], [54, 84], [150, 84], [150, 108], [224, 106], [300, 103]];
      ctx.strokeStyle = 'rgba(100,116,139,.5)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(pth[0][0], pth[0][1]);
      for (let i = 1; i < pth.length; i++) ctx.lineTo(pth[i][0], pth[i][1]);
      ctx.stroke();
      const power = fwd ? 40 + speed * 30 : regen * 0.9;
      const nDots = Math.round(power / 18);
      for (let i = 0; i < nDots; i++) {
        let q = ((t * (0.8 + power * 0.01) + i * 40) % 260) / 260;
        if (!fwd) q = 1 - q;
        // 沿折线取点
        let dleft = q * 260, ex = pth[0][0], ey = pth[0][1];
        for (let s = 0; s < pth.length - 1; s++) {
          const seg = Math.hypot(pth[s + 1][0] - pth[s][0], pth[s + 1][1] - pth[s][1]);
          if (dleft <= seg) {
            ex = pth[s][0] + (pth[s + 1][0] - pth[s][0]) * (dleft / seg);
            ey = pth[s][1] + (pth[s + 1][1] - pth[s][1]) * (dleft / seg);
            break;
          }
          dleft -= seg;
        }
        ctx.fillStyle = flowCol;
        ctx.beginPath(); ctx.arc(ex, ey, 2.4, 0, Math.PI * 2); ctx.fill();
      }
      // 状态文字
      ctx.fillStyle = fwd ? '#4ade80' : '#22d3ee'; ctx.font = 'bold 11px sans-serif';
      ctx.fillText(phase, 16, 196);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      if (braking) {
        ctx.fillText('制动强度 ' + brake + '%：再生回收 ' + Math.round(regen * 0.8) + ' kW ｜ 摩擦损耗 ' + Math.round(fric * 0.8) + ' kW', 16, 214);
      } else {
        ctx.fillText('本次循环已回收 ≈ ' + Math.round(recovered) + ' kJ（制动强度决定回收份额）', 16, 214);
      }
      cap(ctx, V, '同一台电机：通电推车、反拖发电——城市工况可回收两三成能耗');
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
