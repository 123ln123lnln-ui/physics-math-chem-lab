/* explore-anim5_14.js — 第三批动画引擎（时间与测量树 · 批次14，11 个专属原理动画） */
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

  /* 日晷与水钟：日晷影子 15°/h 只在白昼走，水钟浮箭 24h 匀速上升（看天 vs 看水） */
  AN.sundialClepsydra = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const drops = [];
    (function loop() {
      const D = (tp && tp.data) || {};
      const dayPct = Math.max(25, Math.min(75, D.day !== undefined ? D.day : 50));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const dayH = 24 * dayPct / 100;                // 白昼小时数
      const tau = (t * 0.0012) % 1;                  // 模拟一天
      const hour = tau * 24;
      const rise = 12 - dayH / 2;
      const isDay = hour >= rise && hour < 12 + dayH / 2;
      // 顶部 24h 昼夜条
      const bx = 24, bw = 312;
      ctx.fillStyle = '#16213b'; ctx.fillRect(bx, 26, bw, 10);
      ctx.fillStyle = '#8a6d1a'; ctx.fillRect(bx + rise / 24 * bw, 26, dayH / 24 * bw, 10);
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 1; ctx.strokeRect(bx, 26, bw, 10);
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(bx + tau * bw, 23); ctx.lineTo(bx + tau * bw, 39); ctx.stroke();
      ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
      ctx.fillText('0', bx + 1, 49); ctx.fillText('6', bx + bw / 4, 49);
      ctx.fillText('12 时', bx + bw / 2 - 8, 49); ctx.fillText('18', bx + bw * 3 / 4, 49);
      // 左：赤道式日晷（24 刻度，每格 15°）
      const gx = 92, gy = 152, gr = 54;
      ctx.strokeStyle = isDay ? '#94a3b8' : '#475569'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 24; i++) {
        const a = i * Math.PI / 12, r1 = i % 6 === 0 ? gr - 8 : gr - 4;
        ctx.strokeStyle = isDay ? '#64748b' : '#3f4c63'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gx + r1 * Math.cos(a), gy + r1 * Math.sin(a));
        ctx.lineTo(gx + gr * Math.cos(a), gy + gr * Math.sin(a)); ctx.stroke();
      }
      // 今日影扫范围（虚线弧 = dayH × 15°）
      const half = dayH / 2 * Math.PI / 12;
      ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(251,191,36,.55)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(gx, gy, gr - 13, -Math.PI / 2 - half, -Math.PI / 2 + half); ctx.stroke();
      ctx.setLineDash([]);
      // 值班点 + 日/月
      ctx.fillStyle = isDay ? '#fbbf24' : '#475569';
      ctx.beginPath(); ctx.arc(14, 60, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('日晷（看天）', 22, 64);
      if (isDay) {
        const sa = -Math.PI / 2 + (hour - 12) * Math.PI / 12;   // 影子角（正午朝上）
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3;
        ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.moveTo(gx, gy);
        ctx.lineTo(gx + (gr - 11) * Math.cos(sa), gy + (gr - 11) * Math.sin(sa)); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fde047';
        ctx.beginPath(); ctx.arc(36, 78, 7, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath(); ctx.arc(36, 78, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath(); ctx.arc(39, 76, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 10px sans-serif';
        ctx.fillText('影子下班', gx - 21, gy + 22);
      }
      ctx.fillStyle = '#94a3b8';                       // 晷针
      ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx - 3, gy + 7); ctx.lineTo(gx + 3, gy + 7); ctx.fill();
      // 右：水钟（漏刻）——定水位恒压 → 浮箭匀速上升
      const wx0 = 236;
      ctx.fillStyle = isDay ? '#475569' : '#4ade80';
      ctx.beginPath(); ctx.arc(wx0 + 66, 74, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('水钟（看水）', wx0 + 74, 78);
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
      ctx.strokeRect(wx0, 66, 56, 22);                 // 定水位供水壶
      ctx.fillStyle = 'rgba(59,130,246,.5)'; ctx.fillRect(wx0 + 1, 72, 54, 15);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('定水位壶（恒压）', wx0 - 4, 60);
      ctx.strokeRect(wx0, 100, 56, 96);                // 受水壶
      const wl = tau, surf = 100 + 96 * (1 - wl);      // 水面随时间匀速上升
      ctx.fillStyle = 'rgba(59,130,246,.55)';
      ctx.fillRect(wx0 + 1, surf, 54, 96 * wl);
      ctx.fillStyle = '#cbd5e1';                       // 浮子 + 箭尺
      ctx.fillRect(wx0 + 24, surf - 3, 8, 3);
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(wx0 + 28, surf - 3); ctx.lineTo(wx0 + 28, surf - 40); ctx.stroke();
      ctx.lineWidth = 1.5;
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath(); ctx.moveTo(wx0 + 28, surf - 3 - i * 8); ctx.lineTo(wx0 + 33, surf - 3 - i * 8); ctx.stroke();
      }
      ctx.strokeStyle = '#4ade80';                     // 壶口读数指针
      ctx.beginPath(); ctx.moveTo(wx0 + 56, 104); ctx.lineTo(wx0 + 48, 104); ctx.stroke();
      if (t % 9 === 0) drops.push({ y: 90 });          // 恒定节奏滴水
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.y += 1.8;
        ctx.fillStyle = '#7dd3fc';
        ctx.beginPath(); ctx.arc(wx0 + 28, d.y, 1.8, 0, Math.PI * 2); ctx.fill();
        if (d.y > surf) drops.splice(i, 1);
      }
      // 读数
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('白昼占比 ' + dayPct + '% → 今日白昼 ' + dayH.toFixed(1) + ' h', 16, 14);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('日晷影扫 ' + Math.round(dayH * 15) + '°（15°/h）；水钟已走 ' + hour.toFixed(1) + ' h（24h 不断）', 16, 219);
      cap(ctx, V, '一个看天、一个看水：昼夜阴晴互补报时');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 摆钟：T=2π√(L/g) 与摆幅无关（虚影大摆幅对照），擒纵每半周期放一齿 */
  AN.pendulumClock = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, amp = 0.5, tooth = 0, flash = 0, lastHalf = -1;
    (function loop() {
      const D = (tp && tp.data) || {};
      const L = Math.max(0.25, Math.min(1, D.L !== undefined ? D.L : 1));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const T = 2 * Math.PI * Math.sqrt(L / 9.8);      // 周期 s（L=1 → 2.01 s）
      const ph = t / (T * 60) * 2 * Math.PI;           // 相位（60 帧 = 1 s）
      amp *= 0.999;                                    // 摆幅缓慢衰减
      const half = Math.floor(ph / Math.PI);
      if (half !== lastHalf) {                         // 每半周期：放一齿 + 补能量
        lastHalf = half; tooth++; flash = 8;
        amp = Math.min(0.52, amp + 0.05);
      }
      const th = amp * Math.cos(ph);
      const thG = 0.52 * Math.cos(ph);                 // 虚影：大摆幅，同周期
      // 摆（左）
      const px = 96, py = 46, len = 92 + 58 * L;
      ctx.fillStyle = '#334155'; ctx.fillRect(66, 36, 60, 8);
      ctx.strokeStyle = 'rgba(71,85,105,.8)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(px, py, len, Math.PI / 2 - 0.6, Math.PI / 2 + 0.6); ctx.stroke();
      // 虚影摆
      ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(148,163,184,.55)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px, py);
      ctx.lineTo(px + len * Math.sin(thG), py + len * Math.cos(thG)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(148,163,184,.35)';
      ctx.beginPath(); ctx.arc(px + len * Math.sin(thG), py + len * Math.cos(thG), 8, 0, Math.PI * 2); ctx.fill();
      // 实摆
      const bxp = px + len * Math.sin(th), byp = py + len * Math.cos(th);
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bxp, byp); ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(bxp, byp, 9, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#64748b';
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
      // 擒纵叉（随摆角摇摆）
      const ex = 268, ey = 100, er = 36, Z = 30;
      const aa = th * 0.5, apx = ex, apy = ey - er - 22;
      ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 3;
      [-1, 1].forEach(function (s) {
        const rx = s * 14 * Math.cos(aa) - 20 * Math.sin(aa);
        const ry = s * 14 * Math.sin(aa) + 20 * Math.cos(aa);
        ctx.beginPath(); ctx.moveTo(apx, apy); ctx.lineTo(apx + rx, apy + ry); ctx.stroke();
      });
      // 擒纵轮：每半周期转一齿
      const wa = -tooth * 2 * Math.PI / Z;
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < Z; i++) {
        const a = wa + i * 2 * Math.PI / Z;
        ctx.strokeStyle = '#64748b';
        ctx.beginPath();
        ctx.moveTo(ex + er * Math.cos(a), ey + er * Math.sin(a));
        ctx.lineTo(ex + (er + 7) * Math.cos(a), ey + (er + 7) * Math.sin(a)); ctx.stroke();
      }
      if (flash > 0) {
        ctx.fillStyle = 'rgba(251,191,36,' + flash / 8 + ')';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('咔', ex - 4, ey - er - 26);
        flash--;
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('擒纵轮（半周期放一齿）', ex - 46, ey + er + 16);
      // 读数
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('摆长 L = ' + L.toFixed(2) + ' m → T = 2π√(L/g) = ' + T.toFixed(2) + ' s', 16, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('虚影摆幅加倍，与实摆同时过中线 → 等时性', 16, 34);
      ctx.fillText('已放 ' + tooth + ' 齿 = 擒纵计时 ' + (tooth * T / 2).toFixed(1) + ' s', 16, 222);
      cap(ctx, V, '1656 惠更斯：等时性锁周期，擒纵补能又数拍');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 航海钟：当地时间（看太阳）vs 出发港时间（H4），时差 ×15° = 经度 */
  AN.longitudeClock = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    function clock(ctx, x, y, r, hours, label, col) {
      ctx.strokeStyle = col; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6;
        ctx.beginPath();
        ctx.moveTo(x + (r - 4) * Math.cos(a), y + (r - 4) * Math.sin(a));
        ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); ctx.stroke();
      }
      const ha = (hours % 12) / 12 * 2 * Math.PI - Math.PI / 2;
      const ma = (hours % 1) * 2 * Math.PI - Math.PI / 2;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + r * 0.5 * Math.cos(ha), y + r * 0.5 * Math.sin(ha)); ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + r * 0.8 * Math.cos(ma), y + r * 0.8 * Math.sin(ma)); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText(label, x - r, y + r + 12);
    }
    (function loop() {
      const D = (tp && tp.data) || {};
      const days = Math.max(0, Math.min(90, D.days !== undefined ? D.days : 40));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const lon = days * 1.5;                          // 西行经度（1.5°/天）
      const dth = lon / 15;                            // 时差 h
      const homeH = (t * 0.02) % 24;                   // 伦敦时间
      const localH = ((homeH - dth) % 24 + 24) % 24;   // 当地时间
      // 航线图：经度 0~135°W 展开
      const mx0 = 24, mx1 = 336, my0 = 34, my1 = 100;
      const xOf = function (l) { return mx0 + l / 135 * (mx1 - mx0); };
      ctx.fillStyle = '#16213b'; ctx.fillRect(mx0, my0, mx1 - mx0, my1 - my0);
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 1; ctx.strokeRect(mx0, my0, mx1 - mx0, my1 - my0);
      ctx.strokeStyle = 'rgba(100,116,139,.4)';
      for (let l = 15; l < 135; l += 15) {
        ctx.beginPath(); ctx.moveTo(xOf(l), my0); ctx.lineTo(xOf(l), my1); ctx.stroke();
      }
      ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
      ctx.fillText('0°', xOf(0) - 4, my1 + 11); ctx.fillText('45°W', xOf(45) - 12, my1 + 11);
      ctx.fillText('90°W', xOf(90) - 12, my1 + 11); ctx.fillText('135°W', xOf(135) - 26, my1 + 11);
      // 出发港与航线
      ctx.fillStyle = '#4ade80';
      ctx.beginPath(); ctx.arc(xOf(0), my0 + 16, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4ade80'; ctx.font = '9px sans-serif';
      ctx.fillText('伦敦 0°', xOf(0) + 7, my0 + 19);
      const sx = xOf(lon);
      ctx.setLineDash([2, 3]); ctx.strokeStyle = 'rgba(251,191,36,.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(xOf(0), my0 + 16); ctx.lineTo(sx, my0 + 40); ctx.stroke();
      ctx.setLineDash([]);
      // 太阳悬在船的经度（当地正午）
      ctx.fillStyle = '#fde047';
      ctx.shadowColor = '#fde047'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(sx, my0 + 14, 6, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // 真实船位（金）vs 无钟推算船位（灰影，误差随天数累积）
      const bob = Math.sin(t * 0.1) * 1.5;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.moveTo(sx - 8, my0 + 36 + bob); ctx.lineTo(sx + 8, my0 + 36 + bob);
      ctx.lineTo(sx + 4, my0 + 44 + bob); ctx.lineTo(sx - 4, my0 + 44 + bob); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(sx, my0 + 36 + bob); ctx.lineTo(sx, my0 + 26 + bob); ctx.stroke();
      const gx2 = xOf(Math.max(0, lon - days * 0.5));
      ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(148,163,184,.8)';
      ctx.beginPath(); ctx.arc(gx2, my0 + 54, 8, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(148,163,184,.8)'; ctx.font = '9px sans-serif';
      ctx.fillText('无钟推算', gx2 - 20, my0 + 70);
      // 两只钟对照
      clock(ctx, 92, 162, 30, localH, '当地（看太阳对时）', '#38bdf8');
      clock(ctx, 268, 162, 30, homeH, '航海钟 H4·伦敦', '#fbbf24');
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(140, 162); ctx.lineTo(220, 162); ctx.stroke();
      ctx.fillStyle = '#4ade80'; ctx.font = '9px sans-serif';
      ctx.fillText('时差 ' + dth.toFixed(1) + ' h', 152, 154);
      // 读数
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('第 ' + days + ' 天：时差 ' + dth.toFixed(1) + ' h × 15°/h = 西经 ' + lon.toFixed(0) + '°', 16, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('H4 累计误差 ≈ ' + (days * 5 / 81).toFixed(1) + ' s；无钟推算已漂 ' + (days * 0.5).toFixed(0) + '°', 16, 222);
      cap(ctx, V, '1707 舰队之殇 → 哈里森 H4：经度 = 时差 × 15°');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 米的三级跳：光在 τ 纳秒内走 c·τ 米；1983 年光速钉死，米由光程定义 */
  AN.meterByLight = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const tau = Math.max(1, Math.min(10, D.tau !== undefined ? D.tau : 3.34));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const dist = 0.299792458 * tau;                  // 光行距离 m
      // 0~3 m 光行标尺
      const x0 = 30, x1 = 330, y = 92;
      const xOf = function (m) { return x0 + m / 3 * (x1 - x0); };
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      for (let m = 0; m <= 3.001; m += 0.5) {
        const big = Math.abs(m - Math.round(m)) < 0.01;
        ctx.strokeStyle = big ? '#94a3b8' : '#475569'; ctx.lineWidth = big ? 2 : 1;
        ctx.beginPath(); ctx.moveTo(xOf(m), y); ctx.lineTo(xOf(m), y + (big ? 10 : 6)); ctx.stroke();
        if (big) {
          ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
          ctx.fillText(m + ' m', xOf(m) - 8, y + 22);
        }
      }
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;  // 1 m 刻度强调
      ctx.beginPath(); ctx.moveTo(xOf(1), y - 4); ctx.lineTo(xOf(1), y + 12); ctx.stroke();
      // 光脉冲 + 拖尾
      const prog = (t * 0.012) % 1;
      const hx = x0 + prog * (xOf(dist) - x0);
      for (let k = 0; k < 16; k++) {
        const tx = hx - k * 6;
        if (tx < x0) break;
        ctx.fillStyle = 'rgba(253,224,71,' + (0.5 * (1 - k / 16)) + ')';
        ctx.fillRect(tx, y - 3, 4, 6);
      }
      ctx.fillStyle = '#fde047';
      ctx.shadowColor = '#fde047'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(hx, y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // 终点标记：τ=3.34 ns 时恰为 1 米
      const exact = Math.abs(dist - 1) < 0.01;
      ctx.strokeStyle = exact ? '#4ade80' : '#38bdf8'; ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(xOf(dist), y - 30); ctx.lineTo(xOf(dist), y + 12); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = exact ? '#4ade80' : '#38bdf8'; ctx.font = 'bold 11px sans-serif';
      ctx.fillText('c·τ = ' + dist.toFixed(3) + ' m' + (exact ? ' —— 恰为 1 米！' : ''), Math.max(16, Math.min(xOf(dist) - 40, 196)), y - 38);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('光行时间窗 τ = ' + tau.toFixed(2) + ' ns（1 ns ≈ 30 cm）', 16, 20);
      // 定义三级跳时间轴
      const stages = [
        { yr: '1791', txt: '子午线/4千万', ic: 'earth' },
        { yr: '1889', txt: '铂铱米原器', ic: 'bar' },
        { yr: '1960', txt: '氪-86 波长', ic: 'wave' },
        { yr: '1983', txt: '光速 c 钉死', ic: 'c' }
      ];
      const ty = 182;
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(36, ty); ctx.lineTo(330, ty); ctx.stroke();
      stages.forEach(function (s, i) {
        const x = 56 + i * 86, hot = i === 3;
        ctx.fillStyle = hot ? '#fbbf24' : '#64748b';
        if (hot) { ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 10; }
        ctx.beginPath(); ctx.arc(x, ty, hot ? 6 : 4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = hot ? '#fbbf24' : '#94a3b8'; ctx.lineWidth = 1.5;
        if (s.ic === 'earth') {
          ctx.beginPath(); ctx.arc(x, ty - 22, 8, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x - 8, ty - 22); ctx.lineTo(x + 8, ty - 22); ctx.stroke();
        } else if (s.ic === 'bar') {
          ctx.strokeRect(x - 12, ty - 26, 24, 7);
        } else if (s.ic === 'wave') {
          ctx.beginPath();
          for (let q = -12; q <= 12; q += 2) {
            const yy = ty - 22 + 4 * Math.sin(q * 0.5);
            if (q === -12) ctx.moveTo(x + q, yy); else ctx.lineTo(x + q, yy);
          }
          ctx.stroke();
        } else {
          ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 12px sans-serif';
          ctx.fillText('c', x - 4, ty - 16);
        }
        ctx.fillStyle = hot ? '#fbbf24' : '#94a3b8'; ctx.font = '9px sans-serif';
        ctx.fillText(s.yr, x - 10, ty + 16);
        ctx.fillText(s.txt, x - 24, ty + 28);
      });
      cap(ctx, V, '1 米 = 光在 1/299792458 秒内走的距离');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 斐索齿轮：光往返 8.6 km 期间齿转过整数个半齿距则通、半数则消光 */
  AN.fizeauWheel = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const NTEETH = 720, LKM = 8.6, CTRUE = 3.15e8;     // 斐索 1849 装置参数
    (function loop() {
      const D = (tp && tp.data) || {};
      const rpm = Math.max(0, Math.min(2400, D.rpm !== undefined ? D.rpm : 760));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const tF = 2 * LKM * 1000 / CTRUE;               // 往返飞行时间 54.6 µs
      const dh = rpm / 60 * tF * 2 * NTEETH;           // 往返内转过的半齿距数
      const trans = Math.pow(Math.cos(Math.PI * dh / 2), 2);   // 透过率
      const dark = trans < 0.08;
      // 左：齿轮（齿数示意）
      const wx = 64, wy = 122, wr = 40;
      const wa = t * (0.01 + rpm / 2400 * 0.06);
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(wx, wy, wr, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 18; i++) {
        const a = wa + i * Math.PI / 9;
        ctx.beginPath();
        ctx.moveTo(wx + wr * Math.cos(a), wy + wr * Math.sin(a));
        ctx.lineTo(wx + (wr + 8) * Math.cos(a), wy + (wr + 8) * Math.sin(a)); ctx.stroke();
      }
      ctx.fillStyle = '#64748b';
      ctx.beginPath(); ctx.arc(wx, wy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('齿轮 N=' + NTEETH, wx - 32, wy + 62);
      // 光路：轮缘 → 8.6 km（折叠虚线）→ 镜 → 返回轮缘
      const gpx = wx + wr + 8, gpy = wy;
      ctx.strokeStyle = 'rgba(253,224,71,.5)'; ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.moveTo(gpx, gpy - 6); ctx.lineTo(330, 56); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(330, 72); ctx.lineTo(gpx, gpy + 6); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
      ctx.fillText('←——— 8.6 km ———→', 200, 46);
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 3;  // 反射镜
      ctx.beginPath(); ctx.moveTo(334, 50); ctx.lineTo(334, 78); ctx.stroke();
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.moveTo(334, 52 + i * 8); ctx.lineTo(340, 48 + i * 8); ctx.stroke();
      }
      // 齿隙放大（去程对准 vs 回程错开 dh 个半齿距）
      const frac = ((dh % 2) + 2) % 2;
      ctx.fillStyle = '#16213b'; ctx.fillRect(176, 108, 176, 64);
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 1; ctx.strokeRect(176, 108, 176, 64);
      ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
      ctx.fillText('齿隙放大：去程 → 回程', 184, 120);
      for (let row = 0; row < 2; row++) {
        const ry = 128 + row * 22, cw = 15;
        const shift = row === 0 ? 0 : frac;
        for (let k = -6; k <= 6; k++) {
          const cc = 264 + (k - shift) * cw;
          ctx.fillStyle = k % 2 === 0 ? '#1e293b' : '#475569';
          ctx.fillRect(cc - cw / 2, ry, cw, 14);
        }
        const e2 = 2 * Math.round(frac / 2);
        const passNow = row === 0 || Math.abs(frac - e2) < 0.5;
        ctx.strokeStyle = passNow ? '#4ade80' : '#ef4444'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(264, ry - 3); ctx.lineTo(264, ry + 17); ctx.stroke();
        ctx.fillStyle = '#94a3b8'; ctx.font = '8px sans-serif';
        ctx.fillText(row === 0 ? '去程' : '回程', 184, ry + 10);
      }
      // 飞行光包
      const flight = (t % 90) / 90;
      let bx, by;
      if (flight < 0.5) { const q = flight / 0.5; bx = gpx + (330 - gpx) * q; by = gpy - 6 + (56 - gpy + 6) * q; }
      else { const q = (flight - 0.5) / 0.5; bx = 330 + (gpx - 330) * q; by = 72 + (gpy + 6 - 72) * q; }
      ctx.fillStyle = '#fde047';
      ctx.shadowColor = '#fde047'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(bx, by, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // 回程到达轮缘：通过 → 目镜亮；被挡 → 消光
      if (flight > 0.92) {
        if (dark) {
          ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.moveTo(gpx - 5, gpy - 5); ctx.lineTo(gpx + 5, gpy + 5);
          ctx.moveTo(gpx + 5, gpy - 5); ctx.lineTo(gpx - 5, gpy + 5); ctx.stroke();
        } else {
          ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(gpx, gpy + 4); ctx.lineTo(64, 194); ctx.stroke();
        }
      }
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;  // 目镜
      ctx.beginPath(); ctx.arc(58, 204, 12, 0, Math.PI * 2); ctx.stroke();
      const glowA = dark ? 0.05 : trans * (flight > 0.92 ? 1 : 0.2);
      ctx.fillStyle = 'rgba(253,224,71,' + glowA + ')';
      if (!dark && flight > 0.92) { ctx.shadowColor = '#fde047'; ctx.shadowBlur = 14; }
      ctx.beginPath(); ctx.arc(58, 204, 10, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('目镜', 74, 208);
      // 判定与读数
      ctx.fillStyle = dark ? '#ef4444' : trans > 0.9 ? '#4ade80' : '#fbbf24';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(dark ? '目镜全黑：消光！' : trans > 0.9 ? '目镜明亮：光通得过' : '半明半暗', 184, 192);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText(dark ? '由消光转速：c = 4LNf ≈ ' + (4 * LKM * 1000 * NTEETH * rpm / 60 / 1e8).toFixed(2) + '×10⁸ m/s' : '继续加速，直到回程光被齿挡住', 184, 210);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('转速 ' + rpm + ' rpm：往返 ' + (tF * 1e6).toFixed(1) + ' µs 内转过 ' + dh.toFixed(2) + ' 个半齿距', 16, 20);
      cap(ctx, V, '1849 斐索：约 756 rpm 首消光 → c ≈ 3.15×10⁸ m/s');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 时区：每 15° 经度差 1 小时；带宽 w 决定区数、邻区时差与正午偏差 */
  AN.timeZoneGrid = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const w = Math.max(7.5, Math.min(30, D.w !== undefined ? D.w : 15));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const N = Math.round(360 / w);                   // 时区数
      const step = w / 15;                             // 邻区时差 h
      const utcH = (t * 0.04) % 24;                    // 世界时
      const sunLon = (12 - utcH) * 15;                 // 太阳直射（正午）经度
      // 展开地图条（−180°..180°）
      const x0 = 20, x1 = 340, y0 = 46, y1 = 104;
      const xOf = function (lon) { return x0 + (lon + 180) / 360 * (x1 - x0); };
      ctx.fillStyle = '#16213b'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      for (let pxx = x0; pxx < x1; pxx += 4) {         // 昼夜
        const lon = -180 + (pxx - x0) / (x1 - x0) * 360;
        let d = Math.abs(lon - sunLon); if (d > 180) d = 360 - d;
        if (d > 90) { ctx.fillStyle = 'rgba(2,6,23,.55)'; ctx.fillRect(pxx, y0, 4, y1 - y0); }
        else if (d < 60) { ctx.fillStyle = 'rgba(253,224,71,.07)'; ctx.fillRect(pxx, y0, 4, y1 - y0); }
      }
      for (let i = -N / 2; i < N / 2; i++) {           // 时区分带
        const ca = Math.max(-180, i * w - w / 2), cb = Math.min(180, i * w + w / 2);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(59,130,246,.10)' : 'rgba(148,163,184,.06)';
        ctx.fillRect(xOf(ca), y0, xOf(cb) - xOf(ca), y1 - y0);
        ctx.strokeStyle = 'rgba(100,116,139,.5)'; ctx.lineWidth = 0.5;
        ctx.strokeRect(xOf(ca), y0, xOf(cb) - xOf(ca), y1 - y0);
        if (w >= 15 || i % 2 === 0) {
          const off = i * step;
          ctx.fillStyle = '#64748b'; ctx.font = '8px sans-serif';
          ctx.fillText((off >= 0 ? '+' : '') + off, xOf(i * w) - 8, y1 - 4);
        }
      }
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 1; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 1.5;  // 本初子午线
      ctx.beginPath(); ctx.moveTo(xOf(0), y0); ctx.lineTo(xOf(0), y1); ctx.stroke();
      ctx.fillStyle = '#4ade80'; ctx.font = '8px sans-serif';
      ctx.fillText('格林尼治 0°', xOf(0) + 3, y0 + 10);
      // 太阳直射点
      const sx = xOf(Math.max(-180, Math.min(180, sunLon)));
      ctx.fillStyle = '#fde047';
      ctx.shadowColor = '#fde047'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(sx, y0 - 12, 6, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(253,224,71,.6)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx, y0 - 6); ctx.lineTo(sx, y1); ctx.stroke();
      ctx.setLineDash([]);
      // 五个代表经度的区钟
      [-120, -60, 0, 60, 120].forEach(function (lon, k) {
        const off = Math.round(lon / w) * step;
        const hh = ((utcH + off) % 24 + 24) % 24;
        const cx2 = 52 + k * 64, cy2 = 152;
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(cx2, cy2, 16, 0, Math.PI * 2); ctx.stroke();
        const ha = (hh % 12) / 12 * 2 * Math.PI - Math.PI / 2;
        const ma = (hh % 1) * 2 * Math.PI - Math.PI / 2;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx2, cy2); ctx.lineTo(cx2 + 8 * Math.cos(ha), cy2 + 8 * Math.sin(ha)); ctx.stroke();
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx2, cy2); ctx.lineTo(cx2 + 13 * Math.cos(ma), cy2 + 13 * Math.sin(ma)); ctx.stroke();
        const hStr = Math.floor(hh), mStr = Math.floor((hh % 1) * 60);
        ctx.fillStyle = '#e2e8f0'; ctx.font = '9px sans-serif';
        ctx.fillText((hStr < 10 ? '0' : '') + hStr + ':' + (mStr < 10 ? '0' : '') + mStr, cx2 - 12, cy2 + 28);
        ctx.fillStyle = '#64748b';
        ctx.fillText('UTC' + (off >= 0 ? '+' : '') + off, cx2 - 16, cy2 + 39);
      });
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('带宽 ' + w + '° → 全球 ' + N + ' 个时区，邻区相差 ' + step + ' 小时', 16, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('代价：区内正午最多偏差 ±' + (w / 30).toFixed(2) + ' h——太宽对不上太阳，太窄换表烦', 16, 216);
      cap(ctx, V, '1884 华盛顿子午线会议：15° = 1 小时，零线定在格林尼治');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 石英钟：32768 Hz = 2¹⁵，逐级 ÷2 分频，只有 n=15 输出才恰好 1 秒 */
  AN.quartzDivider = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const n = Math.round(Math.max(12, Math.min(17, D.n !== undefined ? D.n : 15)));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const f0 = 32768;
      const fOut = f0 / Math.pow(2, n);                // 输出频率 Hz
      const perS = 1 / fOut;                           // 输出周期 s
      const exact = n === 15;
      // 晶振波形
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.5;
      ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 6;
      ctx.beginPath();
      for (let x = 0; x <= 140; x++) {
        const yy = 42 - 11 * Math.sin(x * 1.1 + t * 0.6);
        if (x === 0) ctx.moveTo(20 + x, yy); else ctx.lineTo(20 + x, yy);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('石英晶振 ' + f0 + ' Hz = 2¹⁵', 20, 64);
      // 分频链
      const cw = Math.min(16, 268 / n);
      for (let i = 0; i < n; i++) {
        const x = 52 + i * cw;
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1;
        ctx.strokeRect(x, 76, cw - 4, 14);
        ctx.fillStyle = '#94a3b8'; ctx.font = '8px sans-serif';
        if (cw > 9) ctx.fillText('÷2', x + 1, 86);
        if (i < n - 1) {
          ctx.beginPath(); ctx.moveTo(x + cw - 4, 83); ctx.lineTo(x + cw, 83); ctx.stroke();
        }
      }
      ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
      ctx.fillText('每级 ÷2：' + f0 + ' Hz → ' + fOut + ' Hz', 52, 104);
      // 末四级方波（同一时基，周期逐级 ×2）
      [n - 3, n - 2, n - 1, n].forEach(function (k, r) {
        const y = 122 + r * 21, cyc = Math.pow(2, 4 - r);   // 16, 8, 4, 2 个周期
        const halfW = 190 / (2 * cyc);
        ctx.strokeStyle = r === 3 ? '#fbbf24' : '#38bdf8'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x <= 190; x++) {
          const lv = Math.floor(x / halfW) % 2;
          const yy = y - lv * 10;
          if (x === 0) ctx.moveTo(40 + x, yy); else ctx.lineTo(40 + x, yy);
        }
        ctx.stroke();
        ctx.fillStyle = '#64748b'; ctx.font = '8px sans-serif';
        ctx.fillText('÷2^' + k, 10, y - 2);
      });
      ctx.fillStyle = '#64748b'; ctx.font = '8px sans-serif';
      ctx.fillText('四条同一时基：周期逐级 ×2', 40, 200);
      // 秒针钟：按输出周期步进（n≠15 就走不对）
      const cxc = 300, cyc2 = 130, cr = 34;
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cxc, cyc2, cr, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cxc + (cr - 4) * Math.cos(a), cyc2 + (cr - 4) * Math.sin(a));
        ctx.lineTo(cxc + cr * Math.cos(a), cyc2 + cr * Math.sin(a)); ctx.stroke();
      }
      const tick = Math.floor(t / (perS * 60));
      const sa = tick * Math.PI / 30 - Math.PI / 2;
      ctx.strokeStyle = exact ? '#4ade80' : '#fbbf24'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cxc, cyc2);
      ctx.lineTo(cxc + (cr - 8) * Math.cos(sa), cyc2 + (cr - 8) * Math.sin(sa)); ctx.stroke();
      const on = (t % (perS * 60)) < Math.min(20, perS * 30);
      ctx.fillStyle = on ? '#4ade80' : '#1e293b';
      if (on) { ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 8; }
      ctx.beginPath(); ctx.arc(cxc + 46, 100, 5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#64748b'; ctx.font = '8px sans-serif';
      ctx.fillText('输出脉冲', cxc + 34, 116);
      // 判定
      ctx.fillStyle = exact ? '#4ade80' : '#fbbf24'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText(exact ? '输出 = 2¹⁵/32768 = 1.000 s ✓' : '输出 = 2^' + n + '/32768 = ' + perS + ' s ≠ 1 s', 80, 216);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('分频级数 n = ' + n + '：2^' + n + ' = ' + Math.pow(2, n), 16, 20);
      cap(ctx, V, '32768 = 2¹⁵：连分 15 级，不多不少正好一秒');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 水三相点：P-T 相图上 611.66 Pa 处冰、水、汽三相共存，偏离即单相 */
  AN.triplePoint = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const TP = { T: 273.16, p: 0.006037 };             // 三相点（atm）
    function xOf(T) { return 34 + (T - 250) / 145 * 190; }
    function yOf(p) { return 186 - (Math.log10(p) + 3) / 3.15 * 146; }
    function pSub(T) { return TP.p * Math.exp(-(TP.T - T) * 0.095); }      // 升华线
    function pVap(T) {                                                     // 汽化线
      const q = (T - TP.T) / (373.15 - TP.T);
      return Math.pow(10, Math.log10(TP.p) * (1 - q) - 0.55 * q * (1 - q));
    }
    function tFus(p) { return TP.T - 1.7 * Math.log10(p / TP.p); }         // 熔化线（微左倾）
    (function loop() {
      const D = (tp && tp.data) || {};
      const p = Math.max(0.001, Math.min(1, D.p !== undefined ? D.p : 0.006));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const pPa = p * 101325;
      // 区域填充：固 / 液 / 气
      ctx.fillStyle = 'rgba(148,163,184,.10)';
      ctx.beginPath(); ctx.moveTo(xOf(250), 40);
      for (let lp = 1.41; lp >= TP.p; lp /= 1.12) ctx.lineTo(xOf(tFus(lp)), yOf(lp));
      for (let T = TP.T; T >= 250; T -= 2) ctx.lineTo(xOf(T), yOf(Math.max(pSub(T), 1e-3)));
      ctx.lineTo(xOf(250), 186); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(59,130,246,.12)';
      ctx.beginPath();
      for (let lp2 = 1.41; lp2 >= TP.p; lp2 /= 1.12) ctx.lineTo(xOf(tFus(lp2)), yOf(lp2));
      for (let T2 = TP.T; T2 <= 373.15; T2 += 4) ctx.lineTo(xOf(T2), yOf(pVap(T2)));
      ctx.lineTo(xOf(373.15), 40); ctx.lineTo(xOf(tFus(1.41)), 40); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(56,189,248,.07)';
      ctx.beginPath(); ctx.moveTo(xOf(250), 186);
      for (let T3 = 250; T3 <= TP.T; T3 += 2) ctx.lineTo(xOf(T3), yOf(Math.max(pSub(T3), 1e-3)));
      for (let T4 = TP.T; T4 <= 373.15; T4 += 4) ctx.lineTo(xOf(T4), yOf(pVap(T4)));
      ctx.lineTo(xOf(395), yOf(1)); ctx.lineTo(xOf(395), 186); ctx.closePath(); ctx.fill();
      // 相界线
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let T5 = 250; T5 <= TP.T; T5 += 2) {
        const yy = yOf(Math.max(pSub(T5), 1e-3));
        if (T5 === 250) ctx.moveTo(xOf(T5), yy); else ctx.lineTo(xOf(T5), yy);
      }
      ctx.stroke();
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2;
      ctx.beginPath();
      let first = true;
      for (let lp3 = 1.41; lp3 >= TP.p; lp3 /= 1.12) {
        if (first) { ctx.moveTo(xOf(tFus(lp3)), yOf(lp3)); first = false; }
        else ctx.lineTo(xOf(tFus(lp3)), yOf(lp3));
      }
      ctx.stroke();
      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath();
      for (let T6 = TP.T; T6 <= 373.15; T6 += 4) {
        if (T6 === TP.T) ctx.moveTo(xOf(T6), yOf(pVap(T6))); else ctx.lineTo(xOf(T6), yOf(pVap(T6)));
      }
      ctx.stroke();
      // 坐标与区域标注
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(34, 186); ctx.lineTo(230, 186); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(34, 186); ctx.lineTo(34, 40); ctx.stroke();
      ctx.fillStyle = '#64748b'; ctx.font = '8px sans-serif';
      ctx.fillText('273 K', xOf(273) - 12, 196); ctx.fillText('373 K', xOf(373) - 12, 196);
      ctx.fillText('1 atm', 6, 50); ctx.fillText('0.001', 6, 184);
      ctx.fillText('固（冰）', 40, 66);
      ctx.fillText('液（水）', 118, 96);
      ctx.fillText('气（水汽）', 150, 168);
      // 三相点与工作点
      const tpx = xOf(TP.T), tpy = yOf(TP.p);
      ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(251,191,36,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(tpx, 40); ctx.lineTo(tpx, 186); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(tpx, tpy, 4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fbbf24'; ctx.font = '8px sans-serif';
      ctx.fillText('三相点 273.16 K · 611.66 Pa', tpx + 8, tpy - 6);
      const atTP = Math.abs(Math.log10(p / TP.p)) < 0.06;
      const state = atTP ? 0 : p < TP.p ? -1 : 1;      // 0 三相 / -1 气 / 1 液
      const wpx = xOf(273.16), wpy = yOf(p);
      ctx.fillStyle = state === 0 ? '#4ade80' : '#f87171';
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(wpx, wpy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // 右侧烧瓶：三相含量随工作点质变
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
      ctx.strokeRect(262, 96, 62, 76);
      ctx.strokeRect(282, 78, 22, 18);
      ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
      ctx.fillText('三相点烧瓶', 264, 72);
      if (state >= 0) {                                // 液态水
        const wt = state === 0 ? 132 : 110;
        ctx.fillStyle = 'rgba(59,130,246,.55)';
        ctx.fillRect(263, wt, 60, 170 - wt + 2);
      }
      if (state === 0) {                               // 冰块漂浮（三相共存）
        const wb = Math.sin(t * 0.08) * 1.5;
        ctx.fillStyle = 'rgba(226,232,240,.9)';
        ctx.fillRect(278, 122 + wb, 22, 10);
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1;
        ctx.strokeRect(278, 122 + wb, 22, 10);
      }
      const nVap = state === 1 ? 0 : state === 0 ? 5 : 9;   // 水汽分子
      for (let i = 0; i < nVap; i++) {
        const vx = 268 + (i * 37 % 50) + Math.sin(t * 0.15 + i) * 2;
        const vy = 102 + (i * 17 % 20) + Math.cos(t * 0.12 + i * 2) * 2;
        ctx.fillStyle = '#7dd3fc';
        ctx.beginPath(); ctx.arc(vx, vy, 1.8, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = state === 0 ? '#4ade80' : '#f87171'; ctx.font = 'bold 10px sans-serif';
      ctx.fillText(state === 0 ? '三相共存！' : state < 0 ? '只剩水汽' : '只剩液态水', 262, 190);
      // 读数
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('环境压强 p = ' + p + ' atm ≈ ' + Math.round(pPa) + ' Pa', 16, 20);
      ctx.fillStyle = state === 0 ? '#4ade80' : '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText(state === 0 ? 'p ≈ 611.66 Pa：三相共存，温度被锁死在 273.16 K' : '偏离 611.66 Pa：三相平衡被打破', 16, 208);
      cap(ctx, V, '1954：开尔文 = 水三相点温度的 1/273.16（2019 改锚 k）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 铯原子钟：微波旋钮在洛伦兹线上调谐，峰顶跃迁最强、电路咬住 ν₀ */
  AN.cesiumClock = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const det = Math.max(-5, Math.min(5, D.det !== undefined ? D.det : 0));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const P = 1 / (1 + det * det);                   // 洛伦兹线形
      const locked = Math.abs(det) < 0.25;
      // 洛伦兹曲线（左）
      const x0 = 24, x1 = 218, y0 = 152, y1 = 46;
      const xOf = function (d) { return x0 + (d + 6) / 12 * (x1 - x0); };
      const yOf = function (q) { return y0 - q * (y0 - y1); };
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
      ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 6;
      ctx.beginPath();
      for (let d = -6; d <= 6.001; d += 0.1) {
        const q = 1 / (1 + d * d);
        if (d <= -5.95) ctx.moveTo(xOf(d), yOf(q)); else ctx.lineTo(xOf(d), yOf(q));
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(148,163,184,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(xOf(-1), yOf(0.5)); ctx.lineTo(xOf(1), yOf(0.5)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#64748b'; ctx.font = '8px sans-serif';
      ctx.fillText('半高全宽 = 2 线宽', xOf(1) + 4, yOf(0.5) + 3);
      ctx.fillText('ν₀ = 9192631770 Hz', xOf(0) - 38, y1 - 6);
      // 当前失谐点 + 微波旋钮
      const mx = xOf(det), my = yOf(P);
      ctx.setLineDash([3, 3]); ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx, y0); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = locked ? '#4ade80' : '#fbbf24';
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x0, 168); ctx.lineTo(x1, 168); ctx.stroke();
      ctx.fillStyle = locked ? '#4ade80' : '#fbbf24';
      ctx.beginPath(); ctx.arc(mx, 168, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#64748b'; ctx.font = '8px sans-serif';
      ctx.fillText('微波旋钮（失谐 δ）', x0, 182);
      if (!locked) {                                   // 伺服拉回箭头
        const dir = det > 0 ? -1 : 1;
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(mx + dir * 8, 168); ctx.lineTo(mx + dir * 24, 168); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(mx + dir * 24, 168); ctx.lineTo(mx + dir * 17, 164);
        ctx.moveTo(mx + dir * 24, 168); ctx.lineTo(mx + dir * 17, 172); ctx.stroke();
      }
      // 铯原子束过微波腔（右上）
      ctx.fillStyle = '#16213b'; ctx.fillRect(238, 40, 112, 88);
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 1; ctx.strokeRect(238, 40, 112, 88);
      ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 2;
      ctx.strokeRect(282, 58, 24, 48);
      ctx.fillStyle = '#64748b'; ctx.font = '8px sans-serif';
      ctx.fillText('铯束→', 242, 52);
      ctx.fillText('微波腔', 280, 52);
      for (let i = 0; i < 10; i++) {
        const q = ((t * 0.9 + i * 13) % 100) / 100;
        const ax2 = 244 + q * 100, ay2 = 66 + (i % 5) * 11;
        const excited = ax2 > 282 && ax2 < 306 && ((i * 7 + Math.floor(t / 6)) % 10) < P * 10;
        ctx.fillStyle = excited ? '#fbbf24' : '#60a5fa';
        if (excited) { ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 6; }
        ctx.beginPath(); ctx.arc(ax2, ay2, 2, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.fillStyle = '#64748b'; ctx.font = '8px sans-serif';
      ctx.fillText('金=已跃迁', 292, 122);
      // 探测电流条
      ctx.fillStyle = '#334155'; ctx.fillRect(244, 136, 90, 8);
      ctx.fillStyle = locked ? '#4ade80' : '#fbbf24';
      ctx.fillRect(244, 136, 90 * P, 8);
      ctx.fillStyle = '#64748b'; ctx.font = '8px sans-serif';
      ctx.fillText('探测电流 ∝ 跃迁率', 244, 156);
      // 锁定状态 + 振荡计数
      ctx.fillStyle = locked ? '#4ade80' : '#fbbf24'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText(locked ? '峰顶锁定：电路死死咬住 ν₀ ✓' : '失谐：伺服沿斜率拉回峰顶', 24, 200);
      const cnt = (t * 15485863) % 9192631770;
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('振荡计数：' + cnt + ' / 9192631770', 24, 216);
      if (locked && t % 60 < 12) {
        ctx.fillStyle = '#4ade80'; ctx.font = 'bold 11px sans-serif';
        ctx.fillText('数满 → 输出 1 秒 ✓', 238, 216);
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('失谐 δ = ' + det + ' 线宽 → 跃迁概率 ' + Math.round(P * 100) + '%', 16, 20);
      cap(ctx, V, '1967：铯-133 的 9192631770 次振荡定义 1 秒');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 基布尔天平：mg=BLI（称量）与 U=BLv（测速）联立消去 B、L → m=UI/(gv) */
  AN.kibbleBalance = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const m = Math.max(0.2, Math.min(2, D.m !== undefined ? D.m : 1));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const g = 9.8, BL = 1.0, v = 0.02;
      const I = m * g / BL;                            // 平衡电流
      const U = BL * v;                                // 感应电压
      const ramp = 1 - Math.exp(-t * 0.03);            // 电流爬升中
      const tilt = 0.16 * (1 - ramp);                  // 横梁从倾斜到平衡
      // 称量模式（左）：天平
      const px = 96, py = 64, bl = 62;
      const lX = px - bl * Math.cos(tilt), lY = py + bl * Math.sin(tilt);
      const rX = px + bl * Math.cos(tilt), rY = py - bl * Math.sin(tilt);
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + 46); ctx.stroke();
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(lX, lY); ctx.lineTo(rX, rY); ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;   // 左盘 + 砝码
      ctx.beginPath(); ctx.moveTo(lX, lY); ctx.lineTo(lX, lY + 14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(lX - 12, lY + 14); ctx.lineTo(lX + 12, lY + 14); ctx.stroke();
      const mw = 12 + 9 * m;
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 8;
      ctx.fillRect(lX - mw / 2, lY + 2, mw, 12);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#0f172a'; ctx.font = 'bold 8px sans-serif';
      ctx.fillText(m.toFixed(1) + 'kg', lX - mw / 2 + 2, lY + 11);
      ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2;     // 重力箭头 mg
      const fLen = 8 + 5 * m;
      ctx.beginPath(); ctx.moveTo(lX, lY - 16); ctx.lineTo(lX, lY - 16 + fLen); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(lX, lY - 16 + fLen); ctx.lineTo(lX - 3, lY - 20 + fLen);
      ctx.moveTo(lX, lY - 16 + fLen); ctx.lineTo(lX + 3, lY - 20 + fLen); ctx.stroke();
      ctx.fillStyle = '#f87171'; ctx.font = '9px sans-serif';
      ctx.fillText('mg', lX + 6, lY - 12);
      ctx.beginPath(); ctx.moveTo(rX, rY); ctx.lineTo(rX, rY + 12); ctx.stroke();  // 右端线圈
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
      ctx.strokeRect(rX - 10, rY + 12, 20, 14);
      ctx.fillStyle = '#ef4444'; ctx.fillRect(rX - 17, rY + 8, 5, 22);
      ctx.fillStyle = '#3b82f6'; ctx.fillRect(rX + 12, rY + 8, 5, 22);
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2;     // 电磁力箭头 BLI（随电流爬升）
      const eLen = fLen * ramp;
      ctx.beginPath(); ctx.moveTo(rX, rY + 40); ctx.lineTo(rX, rY + 40 - eLen); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rX, rY + 40 - eLen); ctx.lineTo(rX - 3, rY + 46 - eLen);
      ctx.moveTo(rX, rY + 40 - eLen); ctx.lineTo(rX + 3, rY + 46 - eLen); ctx.stroke();
      ctx.fillStyle = '#4ade80'; ctx.font = '9px sans-serif';
      ctx.fillText('BLI', rX + 6, rY + 34);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('称量模式：mg = BLI', 16, 40);
      // 测速模式（右）：线圈匀速扫过磁场
      const bx0 = 216;
      ctx.fillStyle = '#ef4444'; ctx.fillRect(bx0, 92, 90, 10);
      ctx.fillStyle = '#3b82f6'; ctx.fillRect(bx0, 156, 90, 10);
      ctx.fillStyle = '#94a3b8'; ctx.font = '8px sans-serif';
      ctx.fillText('N', bx0 + 42, 88); ctx.fillText('S', bx0 + 42, 176);
      const cy2 = 106 + (t * 0.5 % 40);                // 匀速下移
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
      ctx.strokeRect(bx0 + 30, cy2, 30, 12);
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx0 + 72, cy2 - 2); ctx.lineTo(bx0 + 72, cy2 + 12); ctx.stroke();
      ctx.fillStyle = '#4ade80'; ctx.font = '8px sans-serif';
      ctx.fillText('v=2 cm/s', bx0 + 66, cy2 - 6);
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;   // 电压表
      ctx.beginPath(); ctx.arc(332, 128, 12, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#fbbf24'; ctx.font = '8px sans-serif';
      ctx.fillText('U', 329, 131);
      ctx.fillText('20 mV', 318, 150);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('测速模式：U = BLv', bx0 - 2, 84);
      // 联立消去 B、L
      ctx.fillStyle = 'rgba(251,191,36,.08)'; ctx.fillRect(16, 182, 328, 32);
      ctx.strokeStyle = 'rgba(251,191,36,.5)'; ctx.lineWidth = 1; ctx.strokeRect(16, 182, 328, 32);
      const mCalc = U * I / (g * v);
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 11px sans-serif';
      ctx.fillText('消去 B·L：mg = UI/v → m = UI/(gv) = ' + mCalc.toFixed(2) + ' kg ✓', 26, 196);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('U、I 经约瑟夫森/量子霍尔效应溯源到普朗克常数 h', 26, 208);
      // 读数
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('被测质量 m = ' + m.toFixed(1) + ' kg → 平衡电流 I = ' + (I * ramp).toFixed(1) + ' / ' + I.toFixed(1) + ' A', 16, 20);
      cap(ctx, V, '2019：千克由 h 定义，基布尔天平是换算桥');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* SI 七单位量子化：随年份滑动，锚点从实物原器逐个切换到自然常数 */
  AN.siQuantum = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const UNITS = [
      { name: '秒', sym: 's', yr: 1967, old: '地球自转', neo: 'Cs 跃迁' },
      { name: '米', sym: 'm', yr: 1983, old: '米原器', neo: '光速 c' },
      { name: '千克', sym: 'kg', yr: 2019, old: '铂铱砝码', neo: 'h' },
      { name: '安培', sym: 'A', yr: 2019, old: '载流导线', neo: 'e' },
      { name: '开尔文', sym: 'K', yr: 2019, old: '水三相点', neo: 'k' },
      { name: '摩尔', sym: 'mol', yr: 2019, old: '12 g 碳', neo: 'Nᴀ' },
      { name: '坎德拉', sym: 'cd', yr: 1979, old: '黑体炉', neo: '683 lm/W' }
    ];
    (function loop() {
      const D = (tp && tp.data) || {};
      const year = Math.round(Math.max(1960, Math.min(2019, D.year !== undefined ? D.year : 2019)));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const x0 = 128, x1 = 236;                        // 时间轴 1960..2019
      const xOf = function (y) { return x0 + (y - 1960) / 59 * (x1 - x0); };
      ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
      ctx.fillText('实物原器', 76, 34);
      ctx.fillText('自然常数', 246, 34);
      let done = 0;
      UNITS.forEach(function (u, i) {
        const y = 50 + i * 23;
        const sw = year >= u.yr;
        if (sw) done++;
        ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
        ctx.fillText(u.name + ' ' + u.sym, 12, y + 4);
        ctx.fillStyle = sw ? '#475569' : '#94a3b8'; ctx.font = '9px sans-serif';
        const ow = u.old.length * 9;
        ctx.fillText(u.old, 118 - ow, y + 4);
        if (sw) {                                      // 旧锚划线删除
          ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(118 - ow, y + 1); ctx.lineTo(118, y + 1); ctx.stroke();
        }
        ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
        ctx.fillStyle = sw ? '#fbbf24' : '#1e293b';    // 切换点
        if (sw) { ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 6; }
        ctx.beginPath(); ctx.arc(xOf(u.yr), y, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = sw ? '#fbbf24' : '#475569'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(xOf(u.yr), y, 3.5, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = sw ? '#fbbf24' : '#334155';
        ctx.font = sw ? 'bold 9px sans-serif' : '9px sans-serif';
        if (sw) { ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 6; }
        ctx.fillText(u.neo, 244, y + 4);
        ctx.shadowBlur = 0;
      });
      // 年份光标
      const cx2 = xOf(year);
      ctx.setLineDash([4, 3]); ctx.strokeStyle = 'rgba(74,222,128,.7)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx2, 42); ctx.lineTo(cx2, 196); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#4ade80'; ctx.font = 'bold 10px sans-serif';
      ctx.fillText(year + ' 年', Math.min(cx2 - 14, 304), 208);
      ctx.fillStyle = '#64748b'; ctx.font = '8px sans-serif';
      [1960, 1970, 1980, 1990, 2000, 2010, 2019].forEach(function (y) {
        ctx.fillText(String(y), xOf(y) - 10, 220);
      });
      // 读数
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('定义年份 ' + year + '：已量子化 ' + done + ' / 7 个基本单位', 16, 18);
      ctx.fillStyle = done === 7 ? '#4ade80' : '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText(done === 7 ? '全部锚定自然常数：原器时代落幕 ✓' : '仍有 ' + (7 - done) + ' 个单位依赖实物原器', 160, 220);
      cap(ctx, V, '2019-05-20：七个基本单位全部由自然常数定义');
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
