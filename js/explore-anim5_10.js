/* explore-anim5_10.js — 第三批动画引擎（工程树 · 批次10，11 个专属原理动画） */
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

  /* 杠杆：F₁·L₁ = F₂·L₂，撬不撬得动看力矩 */
  AN.leverTorque = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, ang = -0.03;
    (function loop() {
      const D = (tp && tp.data) || {};
      const L = Math.max(1, Math.min(8, D.l !== undefined ? D.l : 4));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const Fe = 400, Wr = 2000, L2 = 1.5; // 人的推力(N)、巨石重(N)、阻力臂(m)
      const net = Fe * L - Wr * L2; // 净力矩
      const canLift = net > 0;
      const target = canLift ? 0.13 + Math.sin(t * 0.06) * 0.02 : -0.03 + Math.sin(t * 0.5) * 0.004;
      ang += (target - ang) * 0.08;
      const fx = 270, fy = 168; // 支点
      const leftLen = L * 24, rightLen = 54;
      const ca = Math.cos(ang), sa = Math.sin(ang);
      const lx = fx - leftLen * ca, ly = fy + leftLen * sa; // 左端（人）
      const rx = fx + rightLen * ca, ry = fy - rightLen * sa; // 右端（巨石）
      // 地面
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 212); ctx.lineTo(360, 212); ctx.stroke();
      // 支点（三角形）
      ctx.fillStyle = '#64748b';
      ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx - 14, 212); ctx.lineTo(fx + 14, 212); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('支点', fx - 11, 224);
      // 杠杆
      ctx.strokeStyle = canLift ? '#22c55e' : '#cbd5e1'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rx, ry); ctx.stroke();
      // 巨石
      const rockY = ry - 6;
      ctx.fillStyle = canLift ? '#fbbf24' : '#78716c';
      ctx.beginPath(); ctx.arc(rx + 10, rockY - 14, 17, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a'; ctx.font = 'bold 9px sans-serif';
      ctx.fillText('巨石', rx + 2, rockY - 16);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('2000 N', rx - 4, rockY + 10);
      // 人的推力箭头（向下）
      ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(lx, ly - 38); ctx.lineTo(lx, ly - 6); ctx.stroke();
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath(); ctx.moveTo(lx, ly - 2); ctx.lineTo(lx - 5, ly - 10); ctx.lineTo(lx + 5, ly - 10); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#93c5fd'; ctx.font = '10px sans-serif';
      ctx.fillText('推力 400 N', lx - 26, ly - 44);
      // 力臂标注
      ctx.fillStyle = '#22d3ee';
      ctx.fillText('L₁ = ' + L + ' m', (fx + lx) / 2 - 20, (fy + ly) / 2 + (canLift ? 18 : -8));
      ctx.fillStyle = '#f87171';
      ctx.fillText('L₂ = 1.5 m', (fx + rx) / 2 - 22, fy + 18);
      // 状态
      ctx.fillStyle = canLift ? '#22c55e' : '#ef4444'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText(canLift ? 'F·L₁ = ' + Fe * L + ' ≥ ' + Wr * L2 + ' N·m → 撬起来了！' : 'F·L₁ = ' + Fe * L + ' < ' + Wr * L2 + ' N·m → 撬不动', 20, 22);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('动力臂 / 阻力臂 = ' + (L / L2).toFixed(1) + ' 倍 → 省力 ' + (L / L2).toFixed(1) + ' 倍', 20, 40);
      cap(ctx, V, '力矩平衡：加长动力臂 = 放大力气（阿基米德，约前 250 年）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 滑轮组：n 段绳子分力，距离翻倍偿还，功守恒 */
  AN.pulleyBlock = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const n = Math.max(1, Math.min(6, Math.round(D.n !== undefined ? D.n : 3)));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const G = 600, F = G / n;
      const lift = (Math.sin(t * 0.02) + 1) / 2 * 26; // 重物提升高度(px)
      const topY = 52, botY = 148 - lift;
      // 顶部横梁
      ctx.fillStyle = '#475569'; ctx.fillRect(30, 30, 180, 10);
      // 定滑轮
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(120, topY, 15, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.beginPath(); ctx.arc(120, topY, 4, 0, Math.PI * 2); ctx.fill();
      // 动滑轮
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath(); ctx.arc(120, botY, 12, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.beginPath(); ctx.arc(120, botY, 3.5, 0, Math.PI * 2); ctx.fill();
      // n 段承重绳（均分拉力）
      ctx.lineWidth = 1.8;
      for (let i = 0; i < n; i++) {
        const x = 120 + (i - (n - 1) / 2) * (26 / Math.max(1, n - 1) || 0);
        const hue = i % 2 ? '#fbbf24' : '#fde047';
        ctx.strokeStyle = hue;
        ctx.beginPath(); ctx.moveTo(x, topY + 13); ctx.lineTo(x, botY - 10); ctx.stroke();
      }
      // 自由端：从定滑轮右侧拉出到"手"
      const handY = Math.min(205, 66 + lift * n * 0.9);
      ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(135, topY - 8); ctx.lineTo(300, topY - 8); ctx.lineTo(300, handY); ctx.stroke();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
      ctx.fillText('手拉端', 276, handY + 14);
      ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(316, handY - 26); ctx.lineTo(316, handY - 2); ctx.stroke();
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath(); ctx.moveTo(316, handY + 3); ctx.lineTo(311, handY - 6); ctx.lineTo(321, handY - 6); ctx.closePath(); ctx.fill();
      // 拉力箭头长度 ∝ F
      const fLen = 8 + F / 600 * 46;
      ctx.strokeStyle = F > 300 ? '#ef4444' : F > 150 ? '#fbbf24' : '#22c55e'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(340, handY - fLen - 14); ctx.lineTo(340, handY - 14); ctx.stroke();
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath(); ctx.moveTo(340, handY - 9); ctx.lineTo(335, handY - 17); ctx.lineTo(345, handY - 17); ctx.closePath(); ctx.fill();
      // 重物
      ctx.fillStyle = '#78716c'; ctx.fillRect(88, botY + 16, 64, 26);
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5; ctx.strokeRect(88, botY + 16, 64, 26);
      ctx.fillStyle = '#fff'; ctx.font = '10px sans-serif';
      ctx.fillText('G=600N', 96, botY + 33);
      // 提升高度标尺
      ctx.strokeStyle = 'rgba(148,163,184,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(60, 148); ctx.lineTo(60, botY); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('h', 54, (148 + botY) / 2);
      // 功对照条：F·s 与 G·h 恒等
      ctx.fillStyle = 'rgba(96,165,250,.75)'; ctx.fillRect(30, 192, 120, 10);
      ctx.fillStyle = 'rgba(251,191,36,.75)'; ctx.fillRect(30, 208, 120, 10);
      ctx.fillStyle = '#93c5fd'; ctx.font = '9px sans-serif';
      ctx.fillText('F·s = ' + F + 'N × ' + n + 'h', 156, 200);
      ctx.fillStyle = '#fde047';
      ctx.fillText('G·h = 600N × h（相等）', 156, 216);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('拉力 F = G/' + n + ' = ' + F.toFixed(0) + ' N，手拉距离 = ' + n + '×h', 20, 20);
      cap(ctx, V, '省力不省功：n 段绳分力，距离 n 倍偿还');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 拱桥：荷载沿拱圈变压力；矢跨比越小推力越大 */
  AN.archThrust = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const f = Math.max(0.1, Math.min(0.5, D.f !== undefined ? D.f : 0.25));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const x1 = 80, x2 = 280, ys = 158; // 起拱线
      const rise = f * 200; // 矢高(px)
      const H = 25 / f; // 相对水平推力 ∝ 1/f
      const danger = f < 0.17;
      const slide = danger ? 3 + Math.sin(t * 0.3) * 1.2 : 0;
      // 河床
      ctx.fillStyle = '#1e293b'; ctx.fillRect(0, ys + 40, 360, 240 - ys - 40);
      ctx.fillStyle = 'rgba(56,189,248,.3)'; ctx.fillRect(0, ys + 40, 360, 8);
      // 桥台（危险时外移）
      ctx.fillStyle = danger ? '#7f1d1d' : '#475569';
      ctx.fillRect(x1 - 26 - slide, ys - 6, 26, 46);
      ctx.fillRect(x2 + slide, ys - 6, 26, 46);
      if (danger) { // 裂缝
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x1 - 18 - slide, ys - 4); ctx.lineTo(x1 - 12 - slide, ys + 12); ctx.lineTo(x1 - 20 - slide, ys + 28); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x2 + 12 + slide, ys - 4); ctx.lineTo(x2 + 18 + slide, ys + 14); ctx.lineTo(x2 + 10 + slide, ys + 30); ctx.stroke();
      }
      // 拱圈：抛物线 + 拱肋分块
      const arcPt = function (u) { // u: -1..1
        return [180 + u * (x2 - x1) / 2, ys - rise * (1 - u * u)];
      };
      ctx.lineWidth = 8;
      ctx.strokeStyle = danger ? '#fca5a5' : '#cbd5e1';
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const p = arcPt(-1 + i / 20);
        if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
      }
      ctx.stroke();
      // 拱石接缝（放射状）
      ctx.strokeStyle = 'rgba(15,23,42,.9)'; ctx.lineWidth = 1.5;
      for (let i = -4; i <= 4; i++) {
        const p = arcPt(i / 5);
        const p2 = arcPt(i / 5 + 0.02);
        const dx = p2[0] - p[0], dy = p2[1] - p[1];
        const nx = -dy, ny = dx, nl = Math.hypot(nx, ny) || 1;
        ctx.beginPath(); ctx.moveTo(p[0] - nx / nl * 5, p[1] - ny / nl * 5);
        ctx.lineTo(p[0] + nx / nl * 5, p[1] + ny / nl * 5); ctx.stroke();
      }
      // 拱上桥面与小车
      const deckY = ys - rise - 16;
      ctx.fillStyle = 'rgba(100,116,139,.5)'; ctx.fillRect(x1, deckY, x2 - x1, 16);
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
      ctx.strokeRect(x1, deckY, x2 - x1, 16);
      const carX = 130 + (t * 0.6) % 100;
      ctx.fillStyle = '#60a5fa'; ctx.fillRect(carX, deckY - 9, 18, 9);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(carX + 4, deckY, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(carX + 14, deckY, 3, 0, Math.PI * 2); ctx.fill();
      // 荷载沿拱传力箭头（沿拱切线指向桥台）
      ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2;
      for (let i = 1; i <= 3; i++) {
        [-1, 1].forEach(function (s) {
          const p = arcPt(s * i / 4);
          const p2 = arcPt(s * (i / 4 + 0.06));
          ctx.beginPath(); ctx.moveTo(p[0], p[1] - 8);
          ctx.lineTo(p2[0], p2[1] - 8); ctx.stroke();
        });
      }
      // 桥台处水平推力箭头，长度 ∝ H
      const aLen = 10 + H * 0.5;
      ctx.strokeStyle = danger ? '#ef4444' : '#22c55e'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x1 - 30 - slide - aLen, ys + 8); ctx.lineTo(x1 - 30 - slide, ys + 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x2 + 30 + slide + aLen, ys + 8); ctx.lineTo(x2 + 30 + slide, ys + 8); ctx.stroke();
      ctx.fillStyle = ctx.strokeStyle; ctx.font = '10px sans-serif';
      ctx.fillText('水平推力 H ∝ 1/f', 108, ys + 34);
      // 状态
      ctx.fillStyle = danger ? '#ef4444' : '#22c55e'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText(danger ? '矢跨比 f/L = ' + f.toFixed(2) + '：推力过大，桥台被推垮！' : '矢跨比 f/L = ' + f.toFixed(2) + '：推力线躺在拱圈内，稳', 20, 22);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('相对推力 H = ' + H.toFixed(0) + '%（f 越小推力越大）', 20, 40);
      cap(ctx, V, '石拱只受压：把重力拐成推力传给两岸（赵州桥，605 年）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 盾构机：刀盘切削、管片衬砌；土仓压力平衡定沉降 */
  AN.shieldTBM = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const p = Math.max(0.2, Math.min(1.8, D.p !== undefined ? D.p : 1.0));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = 190, cy = 152, R = 44;
      const settle = (1 - p) * 16; // 地表沉降(px)：正=塌陷，负=隆起
      const ok = Math.abs(p - 1) < 0.25;
      // 土层
      ctx.fillStyle = 'rgba(120,113,108,.25)'; ctx.fillRect(0, 60, 360, 180);
      // 地表线（隧道上方凹陷或隆起）
      ctx.strokeStyle = ok ? '#22c55e' : '#ef4444'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x <= 360; x += 6) {
        const y = 60 + settle * Math.exp(-Math.pow((x - cx) / 80, 2));
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = ok ? '#22c55e' : '#ef4444'; ctx.font = '10px sans-serif';
      ctx.fillText(settle > 1 ? '地表塌陷 ' + settle.toFixed(0) + ' mm' : settle < -1 ? '地表隆起 ' + (-settle).toFixed(0) + ' mm' : '地表平整', 236, 52);
      // 已拼装的管片环（机身左侧）
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = 'rgba(148,163,184,.8)'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(cx - 58 - i * 16, cy, R - 4, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('管片环', cx - 96, cy + R + 16);
      // 盾体
      ctx.fillStyle = 'rgba(71,85,105,.9)'; ctx.fillRect(cx - 52, cy - R, 70, R * 2);
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.strokeRect(cx - 52, cy - R, 70, R * 2);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '9px sans-serif';
      ctx.fillText('盾体', cx - 36, cy - R + 12);
      // 千斤顶
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.moveTo(cx - 52, cy + i * 26); ctx.lineTo(cx - 64, cy + i * 26); ctx.stroke();
      }
      // 刀盘（旋转辐条）
      const dxx = cx + 26;
      ctx.fillStyle = 'rgba(251,113,133,.25)';
      ctx.beginPath(); ctx.arc(dxx, cy, R - 2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#f87171'; ctx.lineWidth = 3;
      const rot = t * 0.08;
      for (let i = 0; i < 4; i++) {
        const a = rot + i * Math.PI / 2;
        ctx.beginPath(); ctx.moveTo(dxx, cy);
        ctx.lineTo(dxx + (R - 4) * Math.cos(a), cy + (R - 4) * Math.sin(a)); ctx.stroke();
      }
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(dxx, cy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fca5a5'; ctx.font = '9px sans-serif';
      ctx.fillText('刀盘', dxx - 10, cy + R + 16);
      // 掌子面土压箭头（向左，蓝色）vs 土仓压力（向右，琥珀）
      ctx.lineWidth = 2.5;
      for (let i = -1; i <= 1; i++) {
        ctx.strokeStyle = '#38bdf8';
        ctx.beginPath(); ctx.moveTo(dxx + 42, cy + i * 26); ctx.lineTo(dxx + 42 - 20, cy + i * 26); ctx.stroke();
        ctx.strokeStyle = '#fbbf24';
        ctx.beginPath(); ctx.moveTo(dxx + 6, cy + i * 26); ctx.lineTo(dxx + 6 + 20 * p, cy + i * 26); ctx.stroke();
      }
      ctx.fillStyle = '#38bdf8'; ctx.font = '9px sans-serif';
      ctx.fillText('地层水土压力', dxx + 20, cy - R - 6);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('土仓压力 ×' + p.toFixed(1), cx - 50, cy + R + 16);
      // 出渣
      ctx.fillStyle = '#a8a29e';
      for (let i = 0; i < 5; i++) {
        const mx = dxx - 10 - ((t * 0.8 + i * 14) % 70);
        ctx.beginPath(); ctx.arc(mx, cy + 34, 2, 0, Math.PI * 2); ctx.fill();
      }
      // 状态
      ctx.fillStyle = ok ? '#22c55e' : '#ef4444'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText('土仓压力比 ' + p.toFixed(1) + (ok ? '：与地层平衡，安全掘进' : p < 1 ? '：支撑不足！' : '：顶得太狠！'), 20, 22);
      cap(ctx, V, '边挖边撑：土仓压力顶住水土压力（布鲁内尔专利，1818）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 桁架：三角形刚性；轴力 F≈M/h，太扁则压杆屈曲 */
  AN.trussBridge = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const h = Math.max(0.5, Math.min(3, D.h !== undefined ? D.h : 1.5));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const x1 = 50, x2 = 310, deckY = 168;
      const H = h * 20; // 桁架高(px)
      const stress = 1.2 / h; // 相对杆力 ∝ 1/h
      const fail = stress > 1;
      const sag = Math.max(0, 9 / h - 4) + (fail ? 6 + Math.sin(t * 0.4) * 2 : 0);
      const NP = 6, pw = (x2 - x1) / NP;
      const bot = [], top = [];
      for (let i = 0; i <= NP; i++) {
        const bx = x1 + i * pw;
        const dip = sag * Math.sin(Math.PI * i / NP);
        bot.push([bx, deckY + dip]);
        top.push([bx, deckY - H + dip]);
      }
      // 河谷
      ctx.fillStyle = 'rgba(56,189,248,.25)'; ctx.fillRect(0, 192, 360, 48);
      ctx.fillStyle = '#475569'; ctx.fillRect(x1 - 22, 168, 20, 30); ctx.fillRect(x2 + 2, 168, 20, 30);
      // 杆件：下弦受拉(蓝)，上弦受压(红)，斜腹杆交替
      const draw = function (a, b, col, w) {
        ctx.strokeStyle = col; ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      };
      const glow = fail && Math.sin(t * 0.4) > 0 ? '#ef4444' : null;
      for (let i = 0; i < NP; i++) {
        draw(bot[i], bot[i + 1], glow || 'rgba(96,165,250,' + (0.35 + Math.min(1, stress) * 0.65) + ')', 3);
        draw(top[i], top[i + 1], glow || 'rgba(248,113,113,' + (0.35 + Math.min(1, stress) * 0.65) + ')', 3);
        draw(bot[i], top[i], 'rgba(148,163,184,.8)', 2);
        draw(top[i], bot[i + 1], i % 2 ? 'rgba(96,165,250,.55)' : 'rgba(248,113,113,.55)', 2);
      }
      draw(bot[NP], top[NP], 'rgba(148,163,184,.8)', 2);
      // 荷载小车
      const carX = 120 + (t * 0.7) % 120;
      const u = (carX - x1) / (x2 - x1);
      const carY = deckY + sag * Math.sin(Math.PI * u) - 12;
      ctx.fillStyle = '#fbbf24'; ctx.fillRect(carX, carY, 22, 12);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(carX + 5, carY + 12, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(carX + 17, carY + 12, 3.5, 0, Math.PI * 2); ctx.fill();
      // 图例
      ctx.fillStyle = '#60a5fa'; ctx.font = '10px sans-serif';
      ctx.fillText('蓝 = 受拉', 236, 60);
      ctx.fillStyle = '#f87171';
      ctx.fillText('红 = 受压', 236, 76);
      // 状态
      ctx.fillStyle = fail ? '#ef4444' : '#22c55e'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText(fail ? '桁架高 ' + h.toFixed(2) + ' m：弦杆轴力超限，压杆屈曲！' : '桁架高 ' + h.toFixed(2) + ' m：杆件从容承载', 20, 22);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('弦杆轴力 F ≈ M/h = ' + stress.toFixed(2) + '（相对，h 越大越省料）', 20, 40);
      cap(ctx, V, '三角形不变形：荷载全变杆件轴力（普拉特桁架，1844）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 悬索桥：缆力 H≈wL²/(8f)，垂度越平缆力越大 */
  AN.suspensionCable = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const f = Math.max(0.05, Math.min(0.2, D.f !== undefined ? D.f : 0.12));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const tx1 = 105, tx2 = 255, topY = 52, deckY = 178;
      const sag = f * 160;
      const H = 0.12 / f; // 相对缆力 ∝ 1/f
      const over = H > 1.6;
      const sway = Math.sin(t * 0.05) * 1.2;
      // 水面
      ctx.fillStyle = 'rgba(56,189,248,.22)'; ctx.fillRect(0, 196, 360, 44);
      // 桥塔
      ctx.fillStyle = '#64748b';
      ctx.fillRect(tx1 - 4, topY, 8, deckY - topY + 20);
      ctx.fillRect(tx2 - 4, topY, 8, deckY - topY + 20);
      ctx.fillStyle = '#475569';
      ctx.fillRect(tx1 - 10, topY + 26, 20, 4); ctx.fillRect(tx2 - 10, topY + 26, 20, 4);
      // 主缆（抛物线 + 边跨）
      const cab = function (x) { // 主跨缆形
        const u = (x - tx1) / (tx2 - tx1);
        return topY + sag * 4 * u * (1 - u);
      };
      ctx.strokeStyle = over ? '#ef4444' : '#fbbf24';
      ctx.lineWidth = 1.5 + H * 1.1;
      ctx.beginPath(); ctx.moveTo(18, 118); ctx.lineTo(tx1, topY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tx2, topY); ctx.lineTo(342, 118); ctx.stroke();
      ctx.beginPath();
      for (let x = tx1; x <= tx2; x += 5) {
        const y = cab(x);
        if (x === tx1) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // 断丝闪烁（超限警报）
      if (over) {
        ctx.strokeStyle = 'rgba(239,68,68,' + (0.5 + 0.5 * Math.sin(t * 0.5)) + ')'; ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
          const x = 140 + i * 24, y = cab(x);
          ctx.beginPath(); ctx.moveTo(x - 4, y - 5); ctx.lineTo(x + 4, y + 5); ctx.stroke();
        }
      }
      // 锚碇
      ctx.fillStyle = '#475569';
      ctx.fillRect(8, 112, 22, 16); ctx.fillRect(330, 112, 22, 16);
      // 吊索与桥面
      ctx.strokeStyle = 'rgba(148,163,184,.8)'; ctx.lineWidth = 1;
      for (let x = tx1 + 10; x < tx2; x += 14) {
        ctx.beginPath(); ctx.moveTo(x, cab(x)); ctx.lineTo(x, deckY + sway); ctx.stroke();
      }
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(tx1 - 30, deckY + sway, tx2 - tx1 + 60, 6);
      ctx.fillStyle = '#60a5fa';
      const carX = tx1 - 10 + (t * 0.9) % (tx2 - tx1 + 20);
      ctx.fillRect(carX, deckY + sway - 8, 16, 8);
      // 塔顶缆力箭头
      ctx.strokeStyle = over ? '#ef4444' : '#22c55e'; ctx.lineWidth = 3;
      const aLen = 8 + H * 14;
      ctx.beginPath(); ctx.moveTo(tx1 + 4, topY - 10); ctx.lineTo(tx1 + 4 + aLen, topY - 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tx2 - 4, topY - 10); ctx.lineTo(tx2 - 4 - aLen, topY - 10); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('锚碇', 8, 108); ctx.fillText('锚碇', 330, 108);
      // 状态
      ctx.fillStyle = over ? '#ef4444' : '#22c55e'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText('垂跨比 f = ' + f.toFixed(2) + '：缆力 ' + (H * 100).toFixed(0) + '%' + (over ? '，超过极限！' : '，安全'), 20, 22);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('H ≈ wL²/(8f)：垂度减半，缆力翻倍', 20, 40);
      cap(ctx, V, '主缆只受拉：钢的长项撑起超大跨（布鲁克林大桥，1883）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 大坝：p=ρgh 线性增压，倾覆力矩 ∝ h³ */
  AN.damPressure = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const h = Math.max(20, Math.min(220, D.h !== undefined ? D.h : 120));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const baseY = 205, topY = 55;
      const hpx = h / 220 * (baseY - topY); // 水深(px)
      const wTop = 200 - hpx;
      const FS = Math.pow(170 / h, 3); // 抗倾覆安全系数 ∝ 1/h³
      const tip = FS < 1 ? Math.min(9, (1 - FS) * 30) : 0;
      // 地基
      ctx.fillStyle = '#1e293b'; ctx.fillRect(0, baseY, 360, 35);
      // 库水
      ctx.fillStyle = 'rgba(59,130,246,.45)';
      ctx.fillRect(0, wTop, 158 + tip, hpx);
      // 坝体（梯形，危险时顶部位移）
      ctx.fillStyle = FS < 1 ? 'rgba(153,27,27,.9)' : 'rgba(100,116,139,.9)';
      ctx.beginPath();
      ctx.moveTo(158 + tip, baseY); ctx.lineTo(158 + tip * 1.8, topY);
      ctx.lineTo(196 + tip * 1.8, topY); ctx.lineTo(238 + tip, baseY); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
      ctx.fillText('混凝土重力坝', 158 + tip, topY - 8);
      // 危险裂缝
      if (FS < 1) {
        ctx.strokeStyle = 'rgba(239,68,68,' + (0.5 + 0.5 * Math.sin(t * 0.5)) + ')'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(160 + tip, baseY); ctx.lineTo(150, baseY - 6); ctx.lineTo(140, baseY - 2); ctx.stroke();
      }
      // 压力箭头：长度随深度线性增长 p=ρgh
      for (let i = 1; i <= 6; i++) {
        const y = wTop + hpx * i / 7;
        const len = 6 + (i / 7) * 44;
        const a = 0.3 + 0.7 * i / 7;
        ctx.strokeStyle = 'rgba(125,211,252,' + a + ')'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(150 + tip * (baseY - y) / (baseY - topY) - len, y);
        ctx.lineTo(150 + tip * (baseY - y) / (baseY - topY) - 4, y); ctx.stroke();
      }
      ctx.fillStyle = '#7dd3fc'; ctx.font = '10px sans-serif';
      ctx.fillText('p = ρgh：越深越狠', 30, wTop - 8);
      // 合力作用点（水面下 2/3 处）
      const yF = wTop + hpx * 2 / 3;
      ctx.strokeStyle = '#f97316'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(52, yF); ctx.lineTo(150, yF); ctx.stroke();
      ctx.fillStyle = '#f97316';
      ctx.beginPath(); ctx.moveTo(156, yF); ctx.lineTo(146, yF - 5); ctx.lineTo(146, yF + 5); ctx.closePath(); ctx.fill();
      ctx.font = '9px sans-serif';
      ctx.fillText('合力作用于水下 2/3 处', 40, yF - 8);
      // 安全系数条
      ctx.fillStyle = 'rgba(148,163,184,.3)'; ctx.fillRect(268, 60, 70, 10);
      const fw = Math.min(1, FS / 3) * 70;
      ctx.fillStyle = FS < 1 ? '#ef4444' : '#22c55e'; ctx.fillRect(268, 60, fw, 10);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('抗倾覆 FS = ' + FS.toFixed(2), 258, 84);
      ctx.fillText('(红线 FS=1)', 262, 96);
      ctx.strokeStyle = '#fbbf24'; ctx.setLineDash([2, 2]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(268 + 70 / 3, 56); ctx.lineTo(268 + 70 / 3, 74); ctx.stroke();
      ctx.setLineDash([]);
      // 状态
      ctx.fillStyle = FS < 1 ? '#ef4444' : '#22c55e'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText('水深 ' + h + ' m：坝底压强 ' + Math.round(9.8 * h) + ' kPa' + (FS < 1 ? '，坝体倾覆！' : ''), 20, 22);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('倾覆力矩 ∝ h³：水深翻倍，力矩变 8 倍', 20, 40);
      cap(ctx, V, '下宽上窄不是风格，是和水压的较量（胡佛水坝，1935）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 数控机床：插补步长越小越光滑，代价是时间 */
  AN.cncMachine = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const s = Math.max(0.01, Math.min(2, D.s !== undefined ? D.s : 0.2));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = 128, cy = 158, R = 34; // 加工圆
      const stepPx = s * 22;
      const N = Math.max(6, Math.min(400, Math.ceil(2 * Math.PI * R / Math.max(0.3, stepPx))));
      const err = s * s / (8 * 20); // 轮廓误差 s²/8R (mm)
      // 龙门架
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(60, 40); ctx.lineTo(60, 196); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(196, 40); ctx.lineTo(196, 196); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(56, 40); ctx.lineTo(200, 40); ctx.stroke();
      // 工件
      ctx.fillStyle = 'rgba(100,116,139,.5)'; ctx.fillRect(72, 150, 112, 46);
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5; ctx.strokeRect(72, 150, 112, 46);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('铝合金工件', 96, 210);
      // 已切轮廓：多边形插补（步长大则棱面明显）
      const prog = ((t * 0.9) % (N + 50)) / N; // 切完停留一会再重来
      const segs = Math.min(N, Math.floor(prog * N));
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= segs; i++) {
        const a = i / N * Math.PI * 2;
        const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a) * 0.5;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // 主轴与刀具
      const aT = segs / N * Math.PI * 2;
      const tx = cx + R * Math.cos(aT), ty = cy + R * Math.sin(aT) * 0.5;
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(tx - 5, 44, 10, ty - 44 - 8);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.moveTo(tx - 4, ty - 8); ctx.lineTo(tx + 4, ty - 8); ctx.lineTo(tx, ty); ctx.closePath(); ctx.fill();
      // 切屑火花
      for (let i = 0; i < 3; i++) {
        const a = t * 0.3 + i * 2.1;
        ctx.fillStyle = 'rgba(253,224,71,' + (0.8 - i * 0.25) + ')';
        ctx.beginPath(); ctx.arc(tx + 8 * Math.cos(a), ty - 4 + 6 * Math.sin(a), 1.5, 0, Math.PI * 2); ctx.fill();
      }
      // 右侧放大视窗：台阶 vs 光滑
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(288, 100, 44, 0, Math.PI * 2); ctx.stroke();
      ctx.save();
      ctx.beginPath(); ctx.arc(288, 100, 43, 0, Math.PI * 2); ctx.clip();
      ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      const st = Math.max(1.5, s * 14); // 放大后步长
      for (let x = 245; x <= 332; x += st) {
        const y = 100 - 30 * Math.cos((x - 288) / 60);
        const y2 = 100 - 30 * Math.cos((x + st - 288) / 60);
        ctx.moveTo(x, y); ctx.lineTo(x + st, y); ctx.lineTo(x + st, y2);
      }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(148,163,184,.5)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.arc(288, 100 + 70, 100, -Math.PI * 0.65, -Math.PI * 0.35); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('表面放大 ×10', 252, 158);
      ctx.fillStyle = '#22d3ee'; ctx.font = '10px sans-serif';
      ctx.fillText('G02 X' + (20 * Math.cos(aT)).toFixed(2) + ' Y' + (20 * Math.sin(aT)).toFixed(2) + ' I-20 J0 F800', 20, 222);
      // 状态
      ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText('插补步长 ' + s.toFixed(2) + ' mm → ' + N + ' 段逼近整圆', 20, 20);
      ctx.fillStyle = s > 0.5 ? '#f97316' : '#22c55e'; ctx.font = '10px sans-serif';
      ctx.fillText('轮廓误差 ≈ s²/8R = ' + (err * 1000).toFixed(1) + ' μm' + (s > 0.5 ? '（棱面可见）' : '（光滑）'), 20, 36);
      cap(ctx, V, '数字步进逼近曲线：越细腻越耗时（MIT 首台数控铣床，1952）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 工业机器人：示教复现轨迹；负载越大急停越晃 */
  AN.robotArm = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const px0 = 150, py0 = 110; // 实际末端（二阶跟随）
    const cur = { x: px0, y: py0, vx: 0, vy: 0 };
    const trail = [];
    (function loop() {
      const D = (tp && tp.data) || {};
      const m = Math.max(0, Math.min(20, D.m !== undefined ? D.m : 5));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const bx = 50, by = 200, L1 = 85, L2 = 75;
      const ccx = 140, ccy = 120, R = 35;
      // 目标轨迹（虚线圆）+ 目标点
      ctx.strokeStyle = 'rgba(148,163,184,.5)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.arc(ccx, ccy, R, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      const th = t * 0.03;
      const des = { x: ccx + R * Math.cos(th), y: ccy + R * Math.sin(th) };
      // 二阶跟随：负载越大阻尼比越小，过冲越明显
      const wn = 0.25, zeta = 0.18 + 0.75 / (1 + m / 4);
      cur.vx += (wn * wn * (des.x - cur.x) - 2 * zeta * wn * cur.vx);
      cur.vy += (wn * wn * (des.y - cur.y) - 2 * zeta * wn * cur.vy);
      cur.x += cur.vx; cur.y += cur.vy;
      trail.push({ x: cur.x, y: cur.y });
      if (trail.length > 90) trail.shift();
      // 实际轨迹拖尾（颜色编码误差：绿小远大）
      for (let i = 1; i < trail.length; i++) {
        ctx.strokeStyle = 'rgba(34,211,238,' + (i / trail.length * 0.8) + ')'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(trail[i - 1].x, trail[i - 1].y); ctx.lineTo(trail[i].x, trail[i].y); ctx.stroke();
      }
      // 双关节臂（解析 IK）
      let dx = cur.x - bx, dy = cur.y - by;
      let d = Math.hypot(dx, dy);
      d = Math.max(Math.abs(L1 - L2) + 1, Math.min(L1 + L2 - 1, d));
      const c2 = Math.max(-1, Math.min(1, (d * d - L1 * L1 - L2 * L2) / (2 * L1 * L2)));
      const t2 = Math.acos(c2);
      const t1 = Math.atan2(dy, dx) - Math.atan2(L2 * Math.sin(t2), L1 + L2 * Math.cos(t2));
      const ex = bx + L1 * Math.cos(t1), ey = by + L1 * Math.sin(t1);
      // 基座与大臂小臂
      ctx.fillStyle = '#475569'; ctx.fillRect(bx - 16, by, 32, 12);
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(cur.x, cur.y); ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(ex, ey, 5, 0, Math.PI * 2); ctx.fill();
      // 末端负载块（大小 ∝ m）与焊枪光点
      const bs = 4 + m * 0.6;
      ctx.fillStyle = '#f97316'; ctx.fillRect(cur.x - bs / 2, cur.y - bs / 2, bs, bs);
      ctx.fillStyle = 'rgba(253,224,71,.9)';
      ctx.beginPath(); ctx.arc(cur.x, cur.y, 2, 0, Math.PI * 2); ctx.fill();
      // 工作台
      ctx.fillStyle = 'rgba(71,85,105,.7)'; ctx.fillRect(96, 186, 130, 10);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('焊接工作台', 130, 208);
      // 误差表
      const err = Math.hypot(cur.x - des.x, cur.y - des.y);
      ctx.fillStyle = 'rgba(148,163,184,.3)'; ctx.fillRect(262, 60, 80, 8);
      ctx.fillStyle = err > 6 ? '#ef4444' : '#22c55e';
      ctx.fillRect(262, 60, Math.min(80, err * 4), 8);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('轨迹跟踪误差', 262, 54);
      // 状态
      ctx.fillStyle = err > 6 ? '#ef4444' : '#22c55e'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText('负载 ' + m.toFixed(0) + ' kg：' + (err > 6 ? '惯性大，转弯过冲抖动！' : '轨迹复现平稳'), 20, 22);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('灰虚线 = 示教轨迹，青色 = 实际轨迹（阻尼比 ζ≈' + zeta.toFixed(2) + '）', 20, 40);
      cap(ctx, V, '示教+伺服：六轴之前，先看懂惯性（Unimate，1961）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 3D 打印：层高定质感，细腻与时间不可兼得 */
  AN.fdmPrint = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, prog = 0.4; // 预跑 40%，首帧即有半成品
    (function loop() {
      const D = (tp && tp.data) || {};
      const h = Math.max(0.05, Math.min(0.4, D.h !== undefined ? D.h : 0.15));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const baseY = 200, cx = 120, objH = 112;
      const layerPx = h * 20; // 层高(px)
      const total = Math.round(objH / layerPx);
      prog += h / 0.15 * 0.0028; // 层高越小打得越慢
      if (prog > 1.15) prog = 0;
      const shown = Math.min(1, prog);
      const curLayer = Math.floor(shown * total);
      // 花瓶轮廓
      const halfW = function (z) { return 30 - 14 * z + 9 * Math.sin(z * 3.2); };
      // 打印平台
      ctx.fillStyle = '#475569'; ctx.fillRect(50, baseY, 140, 8);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('打印平台', 52, 224);
      // 已完成层（逐层线，层高可见与否）
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = Math.min(2.5, Math.max(0.8, layerPx * 0.55));
      for (let i = 0; i < curLayer; i++) {
        const z = (i + 0.5) / total;
        const y = baseY - z * objH;
        const hw = halfW(z);
        ctx.beginPath(); ctx.moveTo(cx - hw, y); ctx.lineTo(cx + hw, y); ctx.stroke();
      }
      // 当前层：喷头来回铺料
      if (shown < 1) {
        const z = (curLayer + 0.5) / total;
        const y = baseY - z * objH;
        const hw = halfW(z);
        const dir = curLayer % 2 ? 1 : -1;
        const ph = ((t * 0.08) % 1);
        const nx = dir > 0 ? cx - hw + ph * 2 * hw : cx + hw - ph * 2 * hw;
        ctx.strokeStyle = '#fde047'; ctx.lineWidth = Math.min(3, Math.max(1, layerPx * 0.7));
        ctx.beginPath();
        if (dir > 0) { ctx.moveTo(cx - hw, y); ctx.lineTo(nx, y); } else { ctx.moveTo(cx + hw, y); ctx.lineTo(nx, y); }
        ctx.stroke();
        // 龙门架 + 喷头
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(58, y - 26); ctx.lineTo(182, y - 26); ctx.stroke();
        ctx.fillStyle = '#94a3b8'; ctx.fillRect(nx - 6, y - 26, 12, 16);
        ctx.fillStyle = '#f97316';
        ctx.beginPath(); ctx.moveTo(nx - 3, y - 10); ctx.lineTo(nx + 3, y - 10); ctx.lineTo(nx, y - 3); ctx.closePath(); ctx.fill();
      }
      // 右侧放大：侧壁台阶
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(288, 92, 42, 0, Math.PI * 2); ctx.stroke();
      ctx.save();
      ctx.beginPath(); ctx.arc(288, 92, 41, 0, Math.PI * 2); ctx.clip();
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      const stPx = Math.max(2, layerPx * 3.2);
      ctx.beginPath();
      for (let i = 0; i * stPx < 84; i++) {
        const y = 134 - i * stPx;
        const z = (134 - y) / 84;
        const x = 288 + 26 - z * 10;
        ctx.moveTo(x, y); ctx.lineTo(x - 60, y);
        ctx.moveTo(x, y); ctx.lineTo(x, y - stPx);
      }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(148,163,184,.45)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(314, 134); ctx.lineTo(304, 50); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('侧壁放大 ×8（虚线=理想曲面）', 216, 152);
      // 状态
      const layers40 = Math.round(40 / h);
      ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText('层高 ' + h.toFixed(2) + ' mm → 40 mm 高零件需 ' + layers40 + ' 层', 20, 20);
      ctx.fillStyle = h > 0.25 ? '#f97316' : h < 0.1 ? '#22c55e' : '#e2e8f0'; ctx.font = '10px sans-serif';
      ctx.fillText('进度 ' + Math.floor(shown * 100) + '% ｜ ' + (h > 0.25 ? '快但台阶明显' : h < 0.1 ? '光滑但极慢' : '折中'), 20, 38);
      cap(ctx, V, '增材制造：一层一层堆出任意形状（赫尔立体光刻，1984）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 调谐质量阻尼器：同频反相才减振，失谐形同虚设 */
  AN.tunedDamper = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const r = Math.max(0.5, Math.min(1.5, D.r !== undefined ? D.r : 1.0));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const w = 0.055, A0 = 26;
      const factor = 0.15 + 0.85 * Math.min(1, Math.abs(r - 1) * 2.2); // 调谐比=1 时摆幅最小
      const Xb = A0 * factor * Math.sin(w * t); // 楼顶位移(有阻尼器)
      const Xg = A0 * Math.sin(w * t); // 无阻尼器（对照）
      const baseX = 120, baseY = 214, topY0 = 46;
      // 风
      ctx.strokeStyle = 'rgba(125,211,252,.6)'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        const wy = 70 + i * 26, off = (t * 1.5 + i * 40) % 60;
        ctx.beginPath(); ctx.moveTo(8 + off, wy); ctx.lineTo(34 + off, wy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(34 + off, wy); ctx.lineTo(30 + off, wy - 3); ctx.stroke();
      }
      ctx.fillStyle = '#7dd3fc'; ctx.font = '10px sans-serif';
      ctx.fillText('风（共振激励）', 8, 52);
      // 对照楼影（无阻尼器，灰色虚线大摆）
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
      ctx.strokeRect(baseX - 26 + Xg, topY0, 52, baseY - topY0);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(148,163,184,.8)'; ctx.font = '9px sans-serif';
      ctx.fillText('灰虚线=无阻尼器', 196, 196);
      // 大楼（台北101式竹节）
      ctx.fillStyle = 'rgba(51,65,85,.95)';
      for (let i = 0; i < 8; i++) {
        const y0 = baseY - (i + 1) * (baseY - topY0) / 8;
        const shift = Xb * (i + 1) / 8; // 剪切形变
        ctx.fillRect(baseX - 26 + shift, y0 + 2, 52, (baseY - topY0) / 8 - 3);
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1;
        ctx.strokeRect(baseX - 26 + shift, y0 + 2, 52, (baseY - topY0) / 8 - 3);
      }
      // 楼顶与阻尼器球（反相摆动，拖尾发光）
      const topX = baseX + Xb;
      const ballAmp = (1 - factor) * 0.62 + 0.06;
      const phi = -ballAmp * Math.sin(w * t); // 与楼反相
      const pivY = topY0 + 16, len = 52;
      const ballX = topX + len * Math.sin(phi), ballY = pivY + len * Math.cos(phi);
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(topX, pivY); ctx.lineTo(ballX, ballY); ctx.stroke();
      // 球的拖尾
      for (let i = 1; i <= 8; i++) {
        const ph2 = -ballAmp * Math.sin(w * (t - i * 2));
        const bx2 = topX + len * Math.sin(ph2), by2 = pivY + len * Math.cos(ph2);
        ctx.fillStyle = 'rgba(251,191,36,' + (0.5 - i * 0.055) + ')';
        ctx.beginPath(); ctx.arc(bx2, by2, 11 - i, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(ballX, ballY, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#92400e'; ctx.font = 'bold 8px sans-serif';
      ctx.fillText('660t', ballX - 9, ballY + 3);
      // 摆幅对照条
      ctx.fillStyle = 'rgba(148,163,184,.3)'; ctx.fillRect(220, 60, 110, 9);
      ctx.fillStyle = '#64748b'; ctx.fillRect(220, 60, 110, 9);
      ctx.fillStyle = factor < 0.3 ? '#22c55e' : factor < 0.7 ? '#fbbf24' : '#ef4444';
      ctx.fillRect(220, 76, 110 * factor, 9);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('无阻尼器摆幅 100%', 220, 56);
      ctx.fillText('有阻尼器 ' + (factor * 100).toFixed(0) + '%', 220, 100);
      // 状态
      ctx.fillStyle = factor < 0.3 ? '#22c55e' : '#ef4444'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText('调谐比 r = ' + r.toFixed(2) + (Math.abs(r - 1) < 0.03 ? '：同频反相，大楼几乎不动' : '：失谐，阻尼器使不上劲'), 20, 22);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('摆幅削减 ' + ((1 - factor) * 100).toFixed(0) + '%', 20, 40);
      cap(ctx, V, '楼往东晃、球往西甩：把风的能量接过来耗掉（台北101，2004）');
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
