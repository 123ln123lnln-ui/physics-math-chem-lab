/* explore-anim5_1.js — 第三批动画引擎（能源树 · 批次1，12 个专属原理动画） */
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

  /* 蒸汽机：锅炉→汽缸→活塞→飞轮，冷凝器独立 */
  AN.steamEngine = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const steam = [];
    (function loop() {
      const D = (tp && tp.data) || {};
      const p = Math.max(1, Math.min(8, D.p !== undefined ? D.p : 3));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const sp = 0.02 + p * 0.012;
      const th = t * sp;
      // 锅炉
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.strokeRect(20, 150, 80, 60);
      ctx.fillStyle = 'rgba(59,130,246,.55)';
      ctx.fillRect(22, 178 + Math.sin(t * 0.1) * 1.5, 76, 30);
      for (let i = 0; i < 4; i++) {
        const fx = 32 + i * 18, fh = 10 + 6 * Math.sin(t * 0.4 + i * 1.7);
        ctx.fillStyle = i % 2 ? '#f97316' : '#ef4444';
        ctx.beginPath(); ctx.moveTo(fx, 226); ctx.lineTo(fx + 6, 226 - fh); ctx.lineTo(fx + 12, 226); ctx.fill();
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('锅炉', 45, 145);
      // 蒸汽管路：锅炉顶 → 汽缸
      const cylX = 150, cylY = 60, cylW = 120, cylH = 40;
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(60, 150); ctx.lineTo(60, cylY - 10); ctx.lineTo(cylX + 10, cylY - 10); ctx.lineTo(cylX + 10, cylY); ctx.stroke();
      // 汽缸
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.strokeRect(cylX, cylY, cylW, cylH);
      const px = cylX + 45 + 30 * Math.cos(th);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(px - 6, cylY + 3, 12, cylH - 6);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('汽缸', cylX + 48, cylY - 16);
      // 连杆 → 飞轮
      const fx2 = 320, fy2 = 170, fr = 30;
      const cx2 = fx2 + fr * Math.cos(th), cy2 = fy2 + fr * Math.sin(th);
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px + 6, cylY + cylH / 2); ctx.lineTo(cx2, cy2); ctx.stroke();
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(fx2, fy2, fr, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(cx2, cy2, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('飞轮', fx2 - 12, fy2 + fr + 16);
      // 冷凝器（瓦特的关键改进）
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5;
      ctx.strokeRect(170, 150, 70, 36);
      ctx.fillStyle = 'rgba(56,189,248,.22)'; ctx.fillRect(171, 151, 68, 34);
      ctx.fillStyle = '#38bdf8'; ctx.font = '10px sans-serif';
      ctx.fillText('冷凝器', 186, 200);
      // 排汽管：汽缸底 → 冷凝器
      ctx.strokeStyle = '#475569';
      ctx.beginPath(); ctx.moveTo(cylX + 20, cylY + cylH); ctx.lineTo(cylX + 20, 168); ctx.lineTo(170, 168); ctx.stroke();
      // 蒸汽粒子：前半程进汽，后半程排汽冷凝
      const intake = Math.cos(th) > 0;
      if (t % Math.max(2, Math.round(14 - p)) === 0) steam.push({ s: 0 });
      for (let i = steam.length - 1; i >= 0; i--) {
        const s = steam[i];
        s.s += 0.012 + p * 0.004;
        let x, y;
        if (s.s < 0.5) { x = 60; y = 150 - s.s / 0.5 * (150 - cylY + 10); }
        else if (s.s < 1) { x = 60 + (s.s - 0.5) / 0.5 * (cylX + 10 - 60); y = cylY - 10; }
        else if (s.s < 1.3) { x = cylX + 10; y = cylY - 10 + (s.s - 1) / 0.3 * 10; }
        else if (intake) { x = cylX + 14; y = cylY + 8 + ((i * 13 + Math.floor(s.s * 40)) % (cylH - 14)); }
        else { x = 176 + ((i * 29 + Math.floor(s.s * 60)) % 56); y = 156 + ((i * 7) % 24); }
        ctx.fillStyle = intake ? 'rgba(248,250,252,.85)' : 'rgba(148,163,184,.5)';
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
        if (s.s > 2.2) steam.splice(i, 1);
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('蒸汽压强 ' + p + ' atm → 转速、功率随之提高', 20, 20);
      cap(ctx, V, '瓦特改进：冷凝器与汽缸分离，汽缸保持高温');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 内燃机四冲程：进气-压缩-做功-排气 */
  AN.fourStroke = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const gases = [];
    for (let i = 0; i < 22; i++) gases.push({ x: Math.random(), y: Math.random() });
    (function loop() {
      const D = (tp && tp.data) || {};
      const rpm = Math.max(600, Math.min(6000, D.rpm !== undefined ? D.rpm : 3000));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const th = t * (rpm / 3000 * 0.05);
      const cyc = ((th % (4 * Math.PI)) + 4 * Math.PI) % (4 * Math.PI);
      const stroke = Math.floor(cyc / Math.PI); // 0进气 1压缩 2做功 3排气
      const names = ['① 进气：混合气吸入', '② 压缩：升温升压', '③ 做功：点火推活塞', '④ 排气：废气排出'];
      const cols = ['#38bdf8', '#fbbf24', '#ef4444', '#94a3b8'];
      // 汽缸
      const cx0 = 150, cy0 = 40, cw = 60;
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.strokeRect(cx0, cy0, cw, 110);
      // 活塞（上止点→下止点）
      const py = cy0 + 30 + 25 * (1 - Math.cos(th));
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(cx0 + 3, py, cw - 6, 16);
      // 气门
      ctx.fillStyle = stroke === 0 ? '#22c55e' : '#475569';
      ctx.fillRect(cx0 + 6, cy0 - 6, 14, 6);
      ctx.fillStyle = stroke === 3 ? '#22c55e' : '#475569';
      ctx.fillRect(cx0 + cw - 20, cy0 - 6, 14, 6);
      // 火花塞（做功冲程开始点火）
      if (stroke === 2 && cyc - 2 * Math.PI < 0.5) {
        ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2;
        const sx = cx0 + cw / 2, sy = cy0 + 6;
        for (let i = 0; i < 4; i++) {
          const a = i * Math.PI / 2 + 0.4;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 10 * Math.cos(a), sy + 10 * Math.sin(a)); ctx.stroke();
        }
      }
      // 缸内气体
      gases.forEach(function (g, i) {
        const jit = stroke === 2 ? 2.5 : 0.8;
        const gx = cx0 + 6 + g.x * (cw - 12) + Math.sin(t * 0.3 + i) * jit;
        const gy = cy0 + 4 + g.y * Math.max(6, py - cy0 - 6) + Math.cos(t * 0.25 + i * 2) * jit;
        ctx.fillStyle = cols[stroke];
        ctx.beginPath(); ctx.arc(gx, gy, 2, 0, Math.PI * 2); ctx.fill();
      });
      // 曲轴与连杆
      const kx = cx0 + 30, ky = 205;
      const pinX = kx + 14 * Math.cos(th), pinY = ky + 14 * Math.sin(th);
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx0 + 30, py + 16); ctx.lineTo(pinX, pinY); ctx.stroke();
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(kx, ky, 14, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(pinX, pinY, 3.5, 0, Math.PI * 2); ctx.fill();
      // 文字
      ctx.fillStyle = cols[stroke]; ctx.font = 'bold 12px sans-serif';
      ctx.fillText(names[stroke], 20, 24);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('转速 ' + rpm + ' rpm（曲轴转两圈完成一轮）', 20, 42);
      ctx.fillText('进气门', cx0 + 2, 28);
      ctx.fillText('排气门', cx0 + cw - 26, 28);
      cap(ctx, V, '四个冲程只有"做功"出力，其余靠飞轮惯性带过去');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 法拉第发电机：线圈转磁场，输出正弦电 */
  AN.faradayGen = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const w = Math.max(1, Math.min(10, D.w !== undefined ? D.w : 4));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const th = t * 0.02 * w;
      const mag = 20 + w * 4; // 感应电动势幅度 ∝ 转速
      // N、S 磁极与磁力线
      ctx.fillStyle = '#ef4444'; ctx.fillRect(40, 30, 140, 22);
      ctx.fillStyle = '#3b82f6'; ctx.fillRect(40, 168, 140, 22);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText('N', 105, 46); ctx.fillText('S', 105, 184);
      ctx.strokeStyle = 'rgba(148,163,184,.35)'; ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const lx = 55 + i * 28;
        ctx.beginPath(); ctx.moveTo(lx, 54); ctx.lineTo(lx, 166); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lx, 166); ctx.lineTo(lx - 3, 158); ctx.moveTo(lx, 166); ctx.lineTo(lx + 3, 158); ctx.stroke();
      }
      // 旋转线圈（透视：宽度随 cosθ 变化）
      const cx = 110, cy = 110, half = 45 * Math.abs(Math.cos(th));
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3;
      ctx.strokeRect(cx - half, cy - 45, half * 2, 90);
      ctx.fillStyle = '#fbbf24'; ctx.font = '10px sans-serif';
      ctx.fillText('旋转线圈', cx - 24, cy + 62);
      // 灯泡亮度 ∝ e²
      const e = Math.sin(th);
      const glow = e * e;
      ctx.fillStyle = 'rgba(253,224,71,' + (0.15 + glow * 0.85) + ')';
      ctx.beginPath(); ctx.arc(315, 60, 12, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(315, 60, 12, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('灯泡', 305, 84);
      // 输出波形（滚动正弦）
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= 120; x++) {
        const y = 150 - Math.sin(th - x * 0.05) * mag * 0.55;
        if (x === 0) ctx.moveTo(220 + x, y); else ctx.lineTo(220 + x, y);
      }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(148,163,184,.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(220, 150); ctx.lineTo(340, 150); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('输出 e(t) 正弦交流', 240, 210);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('转速 ' + w + '：e = N·B·A·ω·sin(ωt)，ω 越大电动势越大', 20, 20);
      cap(ctx, V, '电磁感应：变化的磁通量 → 电动势（1831 法拉第）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 交流 vs 直流：变压器升压降损耗 */
  AN.acVsDc = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    function bulb(ctx, x, y, bright) {
      ctx.fillStyle = 'rgba(253,224,71,' + (0.1 + bright * 0.9) + ')';
      ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.stroke();
    }
    function transformer(ctx, x, y) {
      ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x - 6, y, 8, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + 6, y, 8, Math.PI / 2, Math.PI * 1.5); ctx.stroke();
    }
    (function loop() {
      const D = (tp && tp.data) || {};
      const u = Math.max(1, Math.min(50, D.u !== undefined ? D.u : 10));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const lossAC = Math.min(0.9, 30 / (u * u));
      const lossDC = 0.9;
      // 交流线路
      ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText('交流（可变压）', 20, 30);
      ctx.fillStyle = '#64748b'; ctx.beginPath(); ctx.arc(35, 60, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a'; ctx.font = '10px sans-serif'; ctx.fillText('G', 32, 64);
      transformer(ctx, 95, 60);
      transformer(ctx, 265, 60);
      ctx.strokeStyle = 'rgba(239,68,68,' + (0.2 + lossAC * 0.8) + ')'; ctx.lineWidth = 2 + lossAC * 3;
      ctx.beginPath(); ctx.moveTo(110, 60); ctx.lineTo(250, 60); ctx.stroke();
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 110; x <= 250; x += 4) {
        const y = 60 + 9 * Math.sin(x * 0.12 - t * 0.2);
        if (x === 110) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      bulb(ctx, 300, 60, 1 - lossAC);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('升压', 84, 42); ctx.fillText('降压', 254, 42);
      ctx.fillText('U=' + u + ' kV，线损 ' + (lossAC * 100).toFixed(1) + '%', 115, 88);
      // 直流线路
      ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText('直流（当年无法变压）', 20, 120);
      ctx.fillStyle = '#64748b'; ctx.fillRect(24, 140, 22, 14);
      ctx.fillStyle = '#0f172a'; ctx.font = '10px sans-serif'; ctx.fillText('±', 32, 150);
      ctx.strokeStyle = 'rgba(239,68,68,' + (0.2 + lossDC * 0.8) + ')'; ctx.lineWidth = 2 + lossDC * 3;
      ctx.beginPath(); ctx.moveTo(50, 147); ctx.lineTo(285, 147); ctx.stroke();
      // 直流电流：匀速粒子
      for (let i = 0; i < 8; i++) {
        const x = 50 + ((t * 1.5 + i * 30) % 235);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(x, 147, 2.5, 0, Math.PI * 2); ctx.fill();
      }
      bulb(ctx, 300, 147, 1 - lossDC);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('低压大电流，线损约 90%，只能短途', 115, 176);
      // 结论
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('功率一定：U↑ → I↓ → 线损 I²R 骤降', 70, 208);
      cap(ctx, V, '1895 尼亚加拉水电站用交流输电；今天特高压直流又回来');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 卡诺效率：η = 1 − Tc/Th */
  AN.carnot = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const th = Math.max(400, Math.min(2000, D.th !== undefined ? D.th : 800));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const eta = 1 - 300 / th;
      // 热源 / 热机 / 冷源
      ctx.fillStyle = 'rgba(239,68,68,.75)'; ctx.fillRect(20, 30, 110, 24);
      ctx.fillStyle = '#fff'; ctx.font = '10px sans-serif';
      ctx.fillText('热源 Th = ' + th + ' K', 28, 46);
      ctx.fillStyle = '#334155'; ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(75, 110, 26, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e2e8f0'; ctx.fillText('热机', 65, 114);
      ctx.fillStyle = 'rgba(59,130,246,.7)'; ctx.fillRect(20, 170, 110, 24);
      ctx.fillStyle = '#fff'; ctx.fillText('冷源 Tc = 300 K', 28, 186);
      // 热流箭头：Qh 进、W 出、Qc 排
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(75, 56); ctx.lineTo(75, 80); ctx.stroke();
      ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2 + eta * 12;
      ctx.beginPath(); ctx.moveTo(102, 110); ctx.lineTo(148, 110); ctx.stroke();
      ctx.fillStyle = '#22c55e'; ctx.font = 'bold 11px sans-serif';
      ctx.fillText('W', 120, 102);
      ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2 + (1 - eta) * 10;
      ctx.beginPath(); ctx.moveTo(75, 140); ctx.lineTo(75, 166); ctx.stroke();
      // η-Th 曲线
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(175, 40, 165, 150);
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let T = 300; T <= 2000; T += 20) {
        const x = 175 + (T - 300) / 1700 * 165;
        const y = 190 - (1 - 300 / T) * 150;
        if (T === 300) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // 真实发动机（都在卡诺线之下）
      const real = [[523, 0.12, '蒸汽机'], [823, 0.40, '汽轮机组'], [1773, 0.60, '燃气联合']];
      ctx.fillStyle = '#fbbf24'; ctx.font = '9px sans-serif';
      real.forEach(function (r) {
        const x = 175 + (r[0] - 300) / 1700 * 165;
        const y = 190 - r[1] * 150;
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillText(r[2], x - 12, y + 12);
      });
      // 当前点
      const mx = 175 + (th - 300) / 1700 * 165, my = 190 - eta * 150;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('η = 1 − 300/' + th + ' = ' + (eta * 100).toFixed(1) + '%', 20, 216);
      cap(ctx, V, '卡诺线是天花板：真实热机全都躺在它下面');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 光伏效应：光子→电子空穴对→外电路电流 */
  AN.photovoltaic = function (holder, tp) {
    const V = mk(holder, 360, 230, true);
    let t = 0;
    const photons = [], electrons = [], holes = [];
    (function loop() {
      const D = (tp && tp.data) || {};
      const g = Math.max(0, Math.min(100, D.g !== undefined ? D.g : 60));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 太阳
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.arc(45, 32, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('光子 hν', 66, 36);
      // 电池板：N 层 / 耗尽层 / P 层
      ctx.fillStyle = 'rgba(59,130,246,.35)'; ctx.fillRect(60, 100, 240, 20);
      ctx.fillStyle = 'rgba(148,163,184,.35)'; ctx.fillRect(60, 120, 240, 6);
      ctx.fillStyle = 'rgba(249,115,22,.35)'; ctx.fillRect(60, 126, 240, 20);
      ctx.strokeStyle = '#64748b'; ctx.strokeRect(60, 100, 240, 46);
      ctx.fillStyle = '#93c5fd'; ctx.font = '10px sans-serif';
      ctx.fillText('N 型硅', 66, 114);
      ctx.fillStyle = '#fdba74'; ctx.fillText('P 型硅', 66, 140);
      // 外电路：顶 → 左 → 灯泡 → 右侧 → P 底
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(60, 100); ctx.lineTo(60, 64); ctx.lineTo(330, 64); ctx.lineTo(330, 146); ctx.lineTo(300, 146); ctx.stroke();
      const bright = g / 100;
      ctx.fillStyle = 'rgba(253,224,71,' + (0.1 + bright * 0.9) + ')';
      ctx.beginPath(); ctx.arc(195, 64, 10, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(195, 64, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('外电路·灯', 175, 52);
      // 光子入射
      if (Math.random() < g / 100 * 0.5) photons.push({ x: 45, y: 40, tx: 80 + Math.random() * 200 });
      for (let i = photons.length - 1; i >= 0; i--) {
        const ph = photons[i];
        ph.x += (ph.tx - ph.x) * 0.06; ph.y += (112 - ph.y) * 0.06;
        ctx.fillStyle = '#fde047';
        ctx.beginPath(); ctx.arc(ph.x, ph.y, 2.5, 0, Math.PI * 2); ctx.fill();
        if (ph.y > 100) {
          photons.splice(i, 1);
          electrons.push({ gx: ph.tx, prog: 0 });
          holes.push({ x: ph.tx, y: 128, life: 40 });
        }
      }
      // 空穴漂移到 P 层底部后消失
      for (let i = holes.length - 1; i >= 0; i--) {
        const h = holes[i];
        h.y += 0.4; h.life--;
        ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(h.x, Math.min(h.y, 142), 3, 0, Math.PI * 2); ctx.stroke();
        if (h.life <= 0) holes.splice(i, 1);
      }
      // 电子沿外电路跑
      const pathPts = function (gx) { return [[gx, 100], [60, 100], [60, 64], [330, 64], [330, 146], [300, 146]]; };
      for (let i = electrons.length - 1; i >= 0; i--) {
        const el = electrons[i];
        el.prog += 0.9 + bright * 0.9;
        const pts = pathPts(el.gx);
        let total = 0;
        for (let s = 0; s < pts.length - 1; s++) total += Math.hypot(pts[s + 1][0] - pts[s][0], pts[s + 1][1] - pts[s][1]);
        let dleft = el.prog, ex = pts[0][0], ey = pts[0][1], done = true;
        for (let s = 0; s < pts.length - 1; s++) {
          const seg = Math.hypot(pts[s + 1][0] - pts[s][0], pts[s + 1][1] - pts[s][1]);
          if (dleft <= seg) {
            ex = pts[s][0] + (pts[s + 1][0] - pts[s][0]) * (dleft / seg);
            ey = pts[s][1] + (pts[s + 1][1] - pts[s][1]) * (dleft / seg);
            done = false; break;
          }
          dleft -= seg;
        }
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath(); ctx.arc(ex, ey, 2.5, 0, Math.PI * 2); ctx.fill();
        if (done || el.prog > total) electrons.splice(i, 1);
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('光照 ' + g + '% → 光生电流与灯泡亮度随之变化', 20, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('耗尽层内建电场把电子↑、空穴↓分开', 92, 168);
      cap(ctx, V, '光子敲出电子-空穴对，PN 结负责"分拣"——光直接变电');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 核裂变链式反应：中子增殖 */
  AN.fissionChain = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, nuclei = [], neutrons = [], frags = [], fcount = 0, idle = 0;
    function reset() {
      nuclei = []; neutrons = []; frags = []; fcount = 0; idle = 0;
      for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) {
        nuclei.push({ x: 40 + c * 36, y: 55 + r * 34, alive: true });
      }
      neutrons.push({ x: 8, y: 120, vx: 1.8, vy: 0 });
    }
    reset();
    (function loop() {
      const D = (tp && tp.data) || {};
      const k = Math.max(0.5, Math.min(2, D.k !== undefined ? D.k : 1.2));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 铀核
      nuclei.forEach(function (n) {
        if (n.alive) {
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath(); ctx.arc(n.x, n.y, 8, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#dbeafe'; ctx.font = '7px sans-serif';
          ctx.fillText('U', n.x - 3, n.y + 2.5);
        } else {
          ctx.fillStyle = 'rgba(100,116,139,.4)';
          ctx.beginPath(); ctx.arc(n.x, n.y, 4, 0, Math.PI * 2); ctx.fill();
        }
      });
      // 中子
      for (let i = neutrons.length - 1; i >= 0; i--) {
        const n = neutrons[i];
        n.x += n.vx; n.y += n.vy;
        let hit = false;
        for (let j = 0; j < nuclei.length; j++) {
          const u = nuclei[j];
          if (u.alive && Math.abs(n.x - u.x) < 10 && Math.abs(n.y - u.y) < 10) {
            u.alive = false; fcount++; hit = true;
            // 碎片
            const fa = Math.random() * Math.PI * 2;
            frags.push({ x: u.x, y: u.y, vx: Math.cos(fa) * 1.6, vy: Math.sin(fa) * 1.6, life: 25 });
            frags.push({ x: u.x, y: u.y, vx: -Math.cos(fa) * 1.6, vy: -Math.sin(fa) * 1.6, life: 25 });
            // 新中子，期望 k 个
            const m = Math.floor(k + Math.random());
            for (let q = 0; q < m; q++) {
              const a = Math.random() * Math.PI * 2;
              neutrons.push({ x: u.x, y: u.y, vx: Math.cos(a) * 1.8, vy: Math.sin(a) * 1.8 });
            }
            break;
          }
        }
        if (hit || n.x < -4 || n.x > 364 || n.y < -4 || n.y > 244) {
          if (hit) neutrons.splice(i, 1);
          else if (n.x < -4 || n.x > 364 || n.y < -4 || n.y > 244) neutrons.splice(i, 1);
          continue;
        }
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(n.x, n.y, 3, 0, Math.PI * 2); ctx.fill();
      }
      // 碎片闪光
      for (let i = frags.length - 1; i >= 0; i--) {
        const f = frags[i];
        f.x += f.vx; f.y += f.vy; f.life--;
        ctx.fillStyle = 'rgba(239,68,68,' + f.life / 25 + ')';
        ctx.beginPath(); ctx.arc(f.x, f.y, 3.5, 0, Math.PI * 2); ctx.fill();
        if (f.life <= 0) frags.splice(i, 1);
      }
      // 结束判定与重置
      const aliveLeft = nuclei.some(function (n) { return n.alive; });
      if (neutrons.length === 0) idle++; else idle = 0;
      if (!aliveLeft || idle > 90) reset();
      // 状态文字
      const status = Math.abs(k - 1) < 0.01 ? '临界：自持（核电站）' : k > 1 ? '超临界：雪崩增长' : '次临界：逐渐熄灭';
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('k = ' + k.toFixed(1) + ' → ' + status, 20, 20);
      ctx.fillText('已裂变 ' + fcount + ' 个铀核，释放约 ' + fcount * 200 + ' MeV', 20, 38);
      cap(ctx, V, '每次裂变放出 2~3 个中子：k 决定雪球滚不滚得起来');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 风电与贝茨极限：Cp ≤ 16/27 */
  AN.betzLimit = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const wind = [];
    for (let i = 0; i < 26; i++) wind.push({ x: Math.random() * 360, y: 40 + Math.random() * 140 });
    (function loop() {
      const D = (tp && tp.data) || {};
      const v = Math.max(3, Math.min(25, D.v !== undefined ? D.v : 10));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = 110, cy = 110;
      // 风粒子：过叶轮后减速并散开
      wind.forEach(function (p, i) {
        const slow = p.x > cx ? 0.45 : 1;
        p.x += (0.3 + v * 0.12) * slow;
        if (p.x > cx) {
          const dy = p.y - cy;
          p.y += dy * 0.006; // 流管扩张
        }
        if (p.x > 200) { p.x = -4; p.y = cy - 55 + Math.random() * 110; }
        ctx.fillStyle = 'rgba(125,211,252,.7)';
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2); ctx.fill();
      });
      // 流管边界（虚线扩张）
      ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(148,163,184,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, cy - 55); ctx.lineTo(cx, cy - 55); ctx.lineTo(195, cy - 78); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, cy + 55); ctx.lineTo(cx, cy + 55); ctx.lineTo(195, cy + 78); ctx.stroke();
      ctx.setLineDash([]);
      // 塔筒与叶片
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, 220); ctx.stroke();
      const rot = t * v * 0.012;
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 5;
      for (let b = 0; b < 3; b++) {
        const a = rot + b * Math.PI * 2 / 3;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + 48 * Math.cos(a), cy + 48 * Math.sin(a)); ctx.stroke();
      }
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
      // 右侧能量条
      ctx.fillStyle = 'rgba(148,163,184,.35)'; ctx.fillRect(230, 60, 26, 120);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('风能', 228, 56);
      ctx.fillText('100%', 228, 194);
      const hBetz = 120 * 16 / 27;
      ctx.setLineDash([3, 3]); ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(266, 180 - hBetz); ctx.lineTo(316, 180 - hBetz); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('贝茨上限 59.3%', 240, 180 - hBetz - 6);
      ctx.fillStyle = '#22c55e'; ctx.fillRect(290, 180 - 120 * 0.45, 26, 120 * 0.45);
      ctx.fillStyle = '#22c55e';
      ctx.fillText('实取≈45%', 282, 194);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('风速 ' + v + ' m/s：P ∝ v³ → 约 ' + (1.75 * v * v * v / 1000).toFixed(1) + ' MW（45m 叶片）', 16, 20);
      cap(ctx, V, '把风全拦住风就停了：Cp = 16/27 是物理上限');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* LED：PN 结复合发光，带隙定颜色 */
  AN.ledLight = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const holes = [], eles = [], photons = [];
    function egInfo(eg) {
      const lam = Math.round(1240 / eg);
      let name, col;
      if (lam >= 610) { name = '红光'; col = '#ef4444'; }
      else if (lam >= 585) { name = '橙光'; col = '#f97316'; }
      else if (lam >= 565) { name = '黄光'; col = '#facc15'; }
      else if (lam >= 495) { name = '绿光'; col = '#22c55e'; }
      else if (lam >= 450) { name = '蓝光'; col = '#3b82f6'; }
      else { name = '紫光'; col = '#8b5cf6'; }
      return { lam: lam, name: name, col: col };
    }
    (function loop() {
      const D = (tp && tp.data) || {};
      const eg = Math.max(1.8, Math.min(3.4, D.eg !== undefined ? D.eg : 2.0));
      const info = egInfo(eg);
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // P 区 / 结区 / N 区
      ctx.fillStyle = 'rgba(249,115,22,.18)'; ctx.fillRect(30, 90, 120, 70);
      ctx.fillStyle = 'rgba(148,163,184,.25)'; ctx.fillRect(150, 90, 60, 70);
      ctx.fillStyle = 'rgba(59,130,246,.18)'; ctx.fillRect(210, 90, 120, 70);
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
      ctx.strokeRect(30, 90, 300, 70);
      ctx.fillStyle = '#fdba74'; ctx.font = '10px sans-serif';
      ctx.fillText('P 型（空穴→）', 40, 84);
      ctx.fillStyle = '#93c5fd';
      ctx.fillText('（←电子）N 型', 250, 84);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('结区', 168, 84);
      // 电源：+ 接 P，− 接 N
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath(); ctx.moveTo(90, 160); ctx.lineTo(90, 200); ctx.lineTo(160, 200); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(270, 160); ctx.lineTo(270, 200); ctx.lineTo(200, 200); ctx.stroke();
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(160, 194); ctx.lineTo(160, 206); ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(200, 192); ctx.lineTo(200, 208); ctx.stroke();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
      ctx.fillText('+', 152, 216); ctx.fillText('−', 200, 216);
      // 空穴与电子生成
      if (t % 12 === 0) {
        holes.push({ x: 40, y: 100 + Math.random() * 50 });
        eles.push({ x: 320, y: 100 + Math.random() * 50 });
      }
      for (let i = holes.length - 1; i >= 0; i--) {
        const h = holes[i];
        h.x += 0.8;
        ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(h.x, h.y, 3, 0, Math.PI * 2); ctx.stroke();
        if (h.x > 182) { holes.splice(i, 1); photons.push({ x: h.x, y: h.y, life: 26 }); }
      }
      for (let i = eles.length - 1; i >= 0; i--) {
        const e = eles[i];
        e.x -= 0.8;
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath(); ctx.arc(e.x, e.y, 2.5, 0, Math.PI * 2); ctx.fill();
        if (e.x < 178) eles.splice(i, 1);
      }
      // 复合发光：光子向上飞出
      for (let i = photons.length - 1; i >= 0; i--) {
        const ph = photons[i];
        ph.y -= 1.4; ph.life--;
        ctx.strokeStyle = info.col; ctx.lineWidth = 1.5;
        for (let r = 0; r < 6; r++) {
          const a = r * Math.PI / 3 + t * 0.1;
          ctx.beginPath(); ctx.moveTo(ph.x, ph.y);
          ctx.lineTo(ph.x + 7 * Math.cos(a), ph.y + 7 * Math.sin(a)); ctx.stroke();
        }
        if (ph.life <= 0) photons.splice(i, 1);
      }
      ctx.fillStyle = info.col; ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Eg = ' + eg.toFixed(1) + ' eV → λ ≈ ' + info.lam + ' nm（' + info.name + '）', 20, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('电子-空穴在结区复合，能量以光子放出', 80, 232 - 14);
      cap(ctx, V, 'E = hν：带隙定颜色——蓝光卡了三十年（2014 诺奖）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 抽水蓄能：低谷抽水、高峰发电 */
  AN.pumpedStorage = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, ulev = 0.5;
    (function loop() {
      const D = (tp && tp.data) || {};
      const d = Math.max(10, Math.min(60, D.d !== undefined ? D.d : 35));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const tau = (t * 0.002) % 1; // 一天
      // 山体
      ctx.fillStyle = '#1e293b';
      ctx.beginPath(); ctx.moveTo(0, 240); ctx.lineTo(0, 130); ctx.lineTo(70, 44); ctx.lineTo(150, 130); ctx.lineTo(180, 240); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#334155'; ctx.stroke();
      // 上库 / 下库
      const llev = 1 - ulev;
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
      ctx.strokeRect(16, 50, 92, 26);
      ctx.fillStyle = 'rgba(59,130,246,.6)';
      ctx.fillRect(17, 50 + 26 * (1 - ulev), 90, 26 * ulev);
      ctx.strokeRect(16, 190, 92, 26);
      ctx.fillStyle = 'rgba(59,130,246,.6)';
      ctx.fillRect(17, 190 + 26 * (1 - llev), 90, 26 * llev);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('上库', 115, 66); ctx.fillText('下库', 115, 206);
      // 模式与水位变化
      let mode, flow = 0;
      if (tau < 0.3) { mode = '夜间低谷：抽水蓄能 ↑'; flow = 1; }
      else if (tau > 0.55 && tau < 0.9) { mode = '晚高峰：放水发电 ↓'; flow = -1; }
      else { mode = '平段：待机'; }
      ulev = Math.max(0.15, Math.min(0.95, ulev + flow * 0.0012));
      // 水管与水轮机
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(108, 62); ctx.lineTo(150, 140); ctx.lineTo(108, 202); ctx.stroke();
      ctx.fillStyle = '#334155';
      ctx.beginPath(); ctx.arc(150, 140, 11, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = flow !== 0 ? '#22d3ee' : '#64748b'; ctx.lineWidth = 2;
      const tr = t * 0.15 * flow;
      ctx.beginPath(); ctx.moveTo(150, 140);
      ctx.lineTo(150 + 9 * Math.cos(tr), 140 + 9 * Math.sin(tr)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(150, 140);
      ctx.lineTo(150 - 9 * Math.cos(tr), 140 - 9 * Math.sin(tr)); ctx.stroke();
      if (flow !== 0) {
        for (let i = 0; i < 5; i++) {
          const q = ((t * 0.02 + i * 0.2) % 1);
          const x = flow > 0 ? 108 + (1 - q) * 42 : 108 + q * 42;
          const y = flow > 0 ? 202 - (1 - q) * 140 : 62 + q * 140;
          ctx.fillStyle = '#7dd3fc';
          ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
        }
      }
      // 右侧 24h 负荷曲线
      ctx.fillStyle = 'rgba(30,41,59,.8)'; ctx.fillRect(200, 40, 145, 150);
      ctx.fillStyle = 'rgba(56,189,248,.12)'; ctx.fillRect(200, 40, 145 * 0.3, 150);
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(200, 40, 145, 150);
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 145; i++) {
        const tt = i / 145;
        const L = 50 + d * Math.sin(2 * Math.PI * (tt - 0.3));
        const y = 115 - (L - 50) * 1.3;
        if (i === 0) ctx.moveTo(200 + i, y); else ctx.lineTo(200 + i, y);
      }
      ctx.stroke();
      const Lnow = 50 + d * Math.sin(2 * Math.PI * (tau - 0.3));
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(200 + tau * 145, 115 - (Lnow - 50) * 1.3, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('0时', 200, 200); ctx.fillText('12时', 258, 200); ctx.fillText('24时', 322, 200);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText(mode, 16, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('负荷曲线（峰谷差 ' + d + '%）', 218, 32);
      cap(ctx, V, '电网的充电宝：往返效率约 75%，响应只要几分钟');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 氢燃料电池：H₂ 拆成 H⁺ 与 e⁻，只排水 */
  AN.fuelCell = function (holder, tp) {
    const V = mk(holder, 360, 230, true);
    let t = 0;
    const hs = [], protons = [], eles = [], o2s = [], drops = [];
    const epath = [[112, 80], [112, 40], [250, 40], [250, 120], [226, 120]];
    (function loop() {
      const D = (tp && tp.data) || {};
      const h2 = Math.max(0, Math.min(100, D.h2 !== undefined ? D.h2 : 50));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 阳极 / 质子交换膜 / 阴极
      ctx.fillStyle = 'rgba(51,65,85,.8)'; ctx.fillRect(40, 80, 72, 100);
      ctx.fillStyle = 'rgba(250,204,21,.25)'; ctx.fillRect(112, 80, 34, 100);
      ctx.fillStyle = 'rgba(51,65,85,.8)'; ctx.fillRect(146, 80, 80, 100);
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
      ctx.strokeRect(40, 80, 186, 100);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('阳极', 62, 74);
      ctx.fillText('质子交换膜', 102, 196);
      ctx.fillText('阴极', 172, 74);
      ctx.fillText('H₂→2H⁺+2e⁻', 46, 206);
      ctx.fillText('+½O₂→H₂O', 152, 216);
      // 外电路与灯泡
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(epath[0][0], epath[0][1]);
      for (let i = 1; i < epath.length; i++) ctx.lineTo(epath[i][0], epath[i][1]);
      ctx.stroke();
      const bright = h2 / 100;
      ctx.fillStyle = 'rgba(253,224,71,' + (0.1 + bright * 0.9) + ')';
      ctx.beginPath(); ctx.arc(181, 40, 10, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(181, 40, 10, 0, Math.PI * 2); ctx.stroke();
      // H₂ 进入 → 催化拆分
      if (Math.random() < h2 / 100 * 0.5) hs.push({ x: 8, y: 100 + Math.random() * 60 });
      for (let i = hs.length - 1; i >= 0; i--) {
        const m = hs[i];
        m.x += 1;
        ctx.fillStyle = '#67e8f9';
        ctx.beginPath(); ctx.arc(m.x - 3, m.y, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(m.x + 3, m.y, 2.5, 0, Math.PI * 2); ctx.fill();
        if (m.x >= 108) {
          hs.splice(i, 1);
          protons.push({ x: 112, y: m.y });
          eles.push({ prog: 0 });
        }
      }
      // 质子穿膜
      for (let i = protons.length - 1; i >= 0; i--) {
        const pr = protons[i];
        pr.x += 0.7;
        ctx.fillStyle = '#f87171';
        ctx.beginPath(); ctx.arc(pr.x, pr.y, 2.5, 0, Math.PI * 2); ctx.fill();
        if (pr.x > 222) { protons.splice(i, 1); if (Math.random() < 0.6) drops.push({ x: 190, y: pr.y, life: 30 }); }
      }
      // 电子走外电路
      let etotal = 0;
      for (let s = 0; s < epath.length - 1; s++) etotal += Math.hypot(epath[s + 1][0] - epath[s][0], epath[s + 1][1] - epath[s][1]);
      for (let i = eles.length - 1; i >= 0; i--) {
        const el = eles[i];
        el.prog += 1 + bright;
        let dleft = el.prog, ex = epath[0][0], ey = epath[0][1], done = true;
        for (let s = 0; s < epath.length - 1; s++) {
          const seg = Math.hypot(epath[s + 1][0] - epath[s][0], epath[s + 1][1] - epath[s][1]);
          if (dleft <= seg) {
            ex = epath[s][0] + (epath[s + 1][0] - epath[s][0]) * (dleft / seg);
            ey = epath[s][1] + (epath[s + 1][1] - epath[s][1]) * (dleft / seg);
            done = false; break;
          }
          dleft -= seg;
        }
        ctx.fillStyle = '#fde047';
        ctx.beginPath(); ctx.arc(ex, ey, 2.2, 0, Math.PI * 2); ctx.fill();
        if (done || el.prog > etotal) eles.splice(i, 1);
      }
      // O₂ 从右侧进入阴极
      if (Math.random() < 0.25) o2s.push({ x: 352, y: 100 + Math.random() * 60 });
      for (let i = o2s.length - 1; i >= 0; i--) {
        const o = o2s[i];
        o.x -= 0.8;
        ctx.fillStyle = '#4ade80';
        ctx.beginPath(); ctx.arc(o.x - 3, o.y, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(o.x + 3, o.y, 2.5, 0, Math.PI * 2); ctx.fill();
        if (o.x < 230) o2s.splice(i, 1);
      }
      // 水滴
      for (let i = drops.length - 1; i >= 0; i--) {
        const dr = drops[i];
        dr.y += 0.6; dr.life--;
        ctx.fillStyle = 'rgba(96,165,250,' + Math.min(1, dr.life / 15) + ')';
        ctx.beginPath(); ctx.arc(dr.x, dr.y, 3, 0, Math.PI * 2); ctx.fill();
        if (dr.life <= 0) drops.splice(i, 1);
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('氢气流量 ' + h2 + '% → 电流与亮度随之变化', 20, 20);
      cap(ctx, V, '不燃烧：质子穿膜、电子绕路做功，阴极只生成水');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 斯特林外燃机：气体在冷热端往返 */
  AN.stirling = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const seeds = [];
    for (let i = 0; i < 26; i++) seeds.push({ a: Math.random(), b: Math.random() });
    (function loop() {
      const D = (tp && tp.data) || {};
      const th = Math.max(100, Math.min(800, D.th !== undefined ? D.th : 500));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const w = 0.02 + th / 800 * 0.05;
      const ang = t * w;
      // 加热端火焰与冷却端散热片
      for (let i = 0; i < 3; i++) {
        const fx = 70 + i * 16, fh = 8 + 5 * Math.sin(t * 0.4 + i * 2);
        ctx.fillStyle = i % 2 ? '#f97316' : '#ef4444';
        ctx.beginPath(); ctx.moveTo(fx, 138); ctx.lineTo(fx + 5, 138 - fh); ctx.lineTo(fx + 10, 138); ctx.fill();
      }
      ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const fx = 256 + i * 7;
        ctx.beginPath(); ctx.moveTo(fx, 58); ctx.lineTo(fx, 76); ctx.stroke();
      }
      ctx.fillStyle = '#f87171'; ctx.font = '10px sans-serif';
      ctx.fillText('加热端 ' + th + '°C', 58, 158);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText('冷却端', 256, 52);
      // 主汽缸
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.strokeRect(60, 78, 240, 40);
      // 配气活塞（ displacer ）
      const dpx = 130 + 55 * Math.cos(ang);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(dpx, 82, 56, 32);
      ctx.fillStyle = '#0f172a'; ctx.font = '9px sans-serif';
      ctx.fillText('配气活塞', dpx + 8, 100);
      // 气体：配气活塞右侧时气体被赶到左（热）端
      const hotFrac = (dpx - 60) / 240;
      seeds.forEach(function (s, i) {
        let gx, col;
        if (s.a < hotFrac) { // 热端
          const x0 = 64, x1 = dpx - 2;
          gx = x0 + s.b * Math.max(2, x1 - x0);
          col = '#f87171';
        } else { // 冷端
          const x0 = dpx + 58, x1 = 296;
          gx = x0 + s.b * Math.max(2, x1 - x0);
          col = '#60a5fa';
        }
        const gy = 84 + ((s.a * 7 + s.b * 13) % 1) * 28 + Math.sin(t * 0.3 + i) * 1.5;
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(gx, gy, 2, 0, Math.PI * 2); ctx.fill();
      });
      // 动力活塞（下方竖缸，相位错开 90°）
      const ppy = 132 + 12 * Math.cos(ang - Math.PI / 2);
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.strokeRect(250, 122, 40, 62);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(253, ppy, 34, 14);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('动力活塞', 248, 198);
      // 飞轮与连杆
      const fx2 = 180, fy2 = 196, fr = 24;
      const pinX = fx2 + fr * Math.cos(ang), pinY = fy2 + fr * Math.sin(ang);
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(270, ppy + 14); ctx.lineTo(pinX, pinY); ctx.stroke();
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(fx2, fy2, fr, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(pinX, pinY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('飞轮', 128, 200);
      // 相位说明
      const hot = Math.cos(ang) > 0;
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText(hot ? '气体在热端膨胀 → 推活塞做功' : '气体在冷端收缩 → 活塞回行', 20, 20);
      cap(ctx, V, '外燃机：任何温差都能驱动——潜艇静音、碟式太阳能');
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
