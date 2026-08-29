/* explore-anim5_3.js — 第三批动画引擎（信息树 12 个专属原理动画） */
(function () {
  window.ExploreAnim = window.ExploreAnim || {};
  const AN = window.ExploreAnim;
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
  function polyPoint(pts, u) {
    const lens = []; let total = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
      lens.push(l); total += l;
    }
    let d = u * total;
    for (let i = 0; i < lens.length; i++) {
      if (d <= lens[i]) { const r = lens[i] ? d / lens[i] : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * r, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * r]; }
      d -= lens[i];
    }
    return pts[pts.length - 1];
  }

  /* 电报与摩尔斯码：点划脉冲沿线飞驰，译出 SOS */
  AN.morseTelegraph = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mk(holder, 360, 230, true);
    const MC = { S: '...', O: '---' };
    const MSG = 'SOS';
    const segs = [], letterEnd = [];
    let acc = 0;
    for (let li = 0; li < MSG.length; li++) {
      const code = MC[MSG[li]];
      for (let si = 0; si < code.length; si++) {
        const d = code[si] === '.' ? 14 : 40;
        segs.push({ on: true, dur: d }); acc += d;
        if (si < code.length - 1) { segs.push({ on: false, dur: 12 }); acc += 12; }
      }
      segs.push({ on: false, dur: 26 }); acc += 26;
      letterEnd.push(acc);
    }
    segs.push({ on: false, dur: 70 }); acc += 70;
    const TOTAL = acc;
    let t = 0, pulses = [], hist = [], prevIdx = -1;
    for (let i = 0; i < 160; i++) hist.push(0);
    (function loop() {
      const ctx = V.ctx;
      const phase = t % TOTAL;
      if (phase === 0) pulses = [];
      let cur = null, sAcc = 0, idx = -1;
      for (let i = 0; i < segs.length; i++) {
        if (phase < sAcc + segs[i].dur) { cur = segs[i]; idx = i; break; }
        sAcc += segs[i].dur;
      }
      const isOn = !!(cur && cur.on);
      if (isOn && idx !== prevIdx) pulses.push({ x: 70, len: cur.dur * 1.5 });
      prevIdx = idx;
      hist.push(isOn ? 1 : 0); hist.shift();
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('·=短音  —=长音    S = ···   O = ———', 62, 22);
      // 电键
      ctx.fillStyle = '#475569'; ctx.fillRect(24, 86, 46, 8);
      ctx.strokeStyle = isOn ? '#fbbf24' : '#94a3b8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(28, 86); ctx.lineTo(66, isOn ? 86 : 70); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('电键', 30, 108);
      // 导线与发声器
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(66, 62); ctx.lineTo(318, 62); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(66, 62); ctx.lineTo(66, 84); ctx.stroke();
      ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#64748b';
      ctx.fillRect(318, 50, 26, 24); ctx.strokeRect(318, 50, 26, 24);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('发声器', 298, 108);
      ctx.fillText('导线', 180, 54);
      // 脉冲
      let flash = false;
      pulses.forEach(function (p) {
        p.x += 2.4;
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(p.x, 59, Math.max(5, p.len * 0.4), 5);
        if (p.x + Math.max(5, p.len * 0.4) >= 318) flash = true;
      });
      for (let i = pulses.length - 1; i >= 0; i--) if (pulses[i].x > 330) pulses.splice(i, 1);
      if (flash) { ctx.fillStyle = 'rgba(251,191,36,.4)'; ctx.fillRect(316, 48, 30, 28); }
      // 线路电流示波
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < hist.length; i++) {
        const x = 20 + i * 2, y = hist[i] ? 132 : 152;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif';
      ctx.fillText('线路电流（只有通/断两种状态）', 20, 170);
      // 译码
      let cnt = 0;
      for (let i = 0; i < letterEnd.length; i++) if (letterEnd[i] <= phase) cnt = i + 1;
      ctx.fillStyle = '#4ade80'; ctx.font = 'bold 15px sans-serif';
      ctx.fillText('译出：' + MSG.slice(0, cnt).split('').join(' '), 20, 204);
      cap(ctx, V, '两种状态编码一切文字——数字通信的始祖');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 电话：声波→膜片→变化电流→膜片→声波 */
  AN.telephone = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      const A = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.021));
      const p = t * 0.18;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 声源
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(24, 110, 8, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = 'rgba(251,191,36,' + (A * (0.7 - i * 0.18)) + ')';
        ctx.beginPath(); ctx.arc(24, 110, 14 + i * 10 + Math.sin(p) * 2, -0.9, 0.9); ctx.stroke();
      }
      // 话筒
      ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#64748b';
      ctx.fillRect(70, 68, 36, 84); ctx.strokeRect(70, 68, 36, 84);
      const dx1 = Math.sin(p) * 4 * A;
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(78 + dx1, 74); ctx.lineTo(78 + dx1, 146); ctx.stroke();
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath(); ctx.arc(88 + (i % 3) * 5, 84 + i * 7 + Math.sin(p + i) * 2.5 * A, 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('碳粒话筒', 62, 164);
      // 导线中的电流波形
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= 140; x += 2) {
        const y = 110 + Math.sin(p * 2 - x * 0.09) * 16 * A;
        if (x === 0) ctx.moveTo(108 + x, y); else ctx.lineTo(108 + x, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('变化电流（声波的镜像）', 120, 88);
      // 听筒
      ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#64748b';
      ctx.fillRect(252, 68, 36, 84); ctx.strokeRect(252, 68, 36, 84);
      ctx.strokeStyle = '#f87171';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.arc(262, 84 + i * 14, 5, Math.PI, 0); ctx.stroke();
      }
      const dx2 = Math.sin(p * 2 - 140 * 0.09) * 4 * A;
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath(); ctx.moveTo(280 + dx2, 74); ctx.lineTo(280 + dx2, 146); ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('听筒', 258, 164);
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = 'rgba(74,222,128,' + (A * (0.7 - i * 0.18)) + ')';
        ctx.beginPath(); ctx.arc(292 + dx2, 110, 12 + i * 9, -0.9, 0.9); ctx.stroke();
      }
      // 底部流程
      ctx.fillStyle = '#e2e8f0'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('声波 → 膜片 → 电流 → 膜片 → 声波', V.w / 2, 210);
      ctx.textAlign = 'left';
      cap(ctx, V, '话筒=传感器，听筒=执行器（模拟信号）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 无线电调谐：LC 共振选台 */
  AN.lcTuner = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mk(holder, 360, 250, true);
    const ST = [[0.72, '新闻'], [0.90, '音乐'], [1.17, '交通'], [1.53, '戏曲'], [2.25, '外语'], [3.00, '体育']];
    let t = 0;
    (function loop() {
      const d = (tp && tp.data) || D;
      const C = Math.max(10, Math.min(200, d.C !== undefined ? d.C : 80));
      const f0 = 10 / Math.sqrt(C); // MHz（L = 253μH）
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 左：LC 回路
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(85, 130, 55, 0, Math.PI * 2); ctx.stroke();
      // 电容（右侧开口双线）
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath(); ctx.moveTo(136, 112); ctx.lineTo(150, 112); ctx.moveTo(136, 148); ctx.lineTo(150, 148); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(150, 104); ctx.lineTo(150, 120); ctx.moveTo(150, 140); ctx.lineTo(150, 156); ctx.stroke();
      // 电感（左侧波浪）
      ctx.strokeStyle = '#fbbf24';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.arc(30, 96 + i * 18, 8, Math.PI, 0); ctx.stroke();
      }
      // 环行电荷
      let near = ST[0], best = 1e9;
      ST.forEach(function (s) { if (Math.abs(s[0] - f0) < best) { best = Math.abs(s[0] - f0); near = s; } });
      const res = best < 0.12 ? 1 : Math.max(0.15, 1 - best * 3);
      for (let i = 0; i < 8; i++) {
        const a = t * 0.04 * (1 + f0) + i * Math.PI / 4;
        ctx.fillStyle = 'rgba(56,189,248,' + (0.25 + 0.75 * res) + ')';
        ctx.beginPath(); ctx.arc(85 + 55 * Math.cos(a), 130 + 55 * Math.sin(a), 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('L', 22, 80); ctx.fillText('C=' + C + 'pF', 118, 175);
      // 右：选频曲线
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= 150; x += 2) {
        const f = 0.6 + x / 150 * 2.7;
        const Ar = 0.08 * f0 / Math.sqrt((f * f - f0 * f0) * (f * f - f0 * f0) + (0.08 * f) * (0.08 * f));
        const y = 190 - Math.min(120, Ar * 60);
        if (x === 0) ctx.moveTo(195 + x, y); else ctx.lineTo(195 + x, y);
      }
      ctx.stroke();
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(195, 190); ctx.lineTo(345, 190); ctx.stroke();
      ST.forEach(function (s) {
        const x = 195 + (s[0] - 0.6) / 2.7 * 150;
        const lock = s === near && best < 0.12;
        ctx.fillStyle = lock ? '#4ade80' : '#64748b';
        ctx.beginPath(); ctx.moveTo(x, 190); ctx.lineTo(x - 4, 198); ctx.lineTo(x + 4, 198); ctx.fill();
        ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(s[0].toFixed(2), x, 208);
        ctx.fillText(s[1], x, 218);
        ctx.textAlign = 'left';
      });
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('f₀ = 1/(2π√LC) = ' + f0.toFixed(2) + ' MHz', 30, 24);
      ctx.fillStyle = best < 0.12 ? '#4ade80' : '#94a3b8';
      ctx.fillText(best < 0.12 ? '✓ 锁定：' + near[1] + '台（共振放大）' : '未对准任何电台：只剩杂音', 30, 42);
      cap(ctx, V, '固有频率对准载波 → 共振把它放大上万倍');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 真空管与晶体管：小信号控制大电流 */
  AN.tubeTransistor = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const tubeE = [], trE = [];
    (function loop() {
      const ctx = V.ctx;
      const s = Math.sin(t * 0.06);
      const rate = 0.08 + 0.25 * (s + 1) / 2;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 顶部小信号
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 30; x <= 330; x += 3) {
        const y = 34 + 6 * Math.sin(x * 0.08 - t * 0.12);
        if (x === 30) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#4ade80'; ctx.font = '10px sans-serif';
      ctx.fillText('栅极/基极上的小信号', 120, 20);
      // 真空管
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.strokeRect(30, 55, 110, 130);
      ctx.fillStyle = 'rgba(251,146,60,' + (0.5 + 0.3 * Math.sin(t * 0.3)) + ')';
      ctx.fillRect(45, 160, 80, 8); // 灯丝
      ctx.setLineDash([4, 4]); ctx.strokeStyle = '#fbbf24';
      ctx.beginPath(); ctx.moveTo(40, 118); ctx.lineTo(130, 118); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#64748b'; ctx.fillRect(45, 70, 80, 8); // 阳极
      if (Math.random() < rate) tubeE.push({ x: 50 + Math.random() * 70, y: 158 });
      tubeE.forEach(function (e) {
        e.y -= 1.6;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath(); ctx.arc(e.x, e.y, 2, 0, Math.PI * 2); ctx.fill();
      });
      for (let i = tubeE.length - 1; i >= 0; i--) if (tubeE[i].y < 80) tubeE.splice(i, 1);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
      ctx.fillText('真空三极管', 50, 198);
      // 晶体管
      ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#94a3b8';
      ctx.fillRect(240, 95, 50, 70); ctx.strokeRect(240, 95, 50, 70);
      ctx.fillStyle = '#fbbf24'; ctx.fillRect(240, 122, 50, 6); // 基极
      if (Math.random() < rate) trE.push({ x: 246 + Math.random() * 38, y: 160 });
      trE.forEach(function (e) {
        e.y -= 1.6;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath(); ctx.arc(e.x, e.y, 2, 0, Math.PI * 2); ctx.fill();
      });
      for (let i = trE.length - 1; i >= 0; i--) if (trE[i].y < 100) trE.splice(i, 1);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('晶体管', 240, 198);
      // 底部被放大的大电流
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 30; x <= 330; x += 3) {
        const y = 216 + 14 * Math.sin(x * 0.08 - t * 0.12);
        if (x === 30) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      cap(ctx, V, '同一原理两代载体：小信号控制大电流');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 二进制与逻辑门：异或+与 = 半加器 */
  AN.logicAdder = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mk(holder, 360, 260, true);
    let t = 0;
    (function loop() {
      const d = (tp && tp.data) || D;
      const a = (d.a !== undefined ? d.a : 1) ? 1 : 0;
      const b = (d.b !== undefined ? d.b : 1) ? 1 : 0;
      const S = a ^ b, C = a & b;
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const wires = [
        { pts: [[46, 61], [100, 61], [100, 56], [150, 56]], v: a },
        { pts: [[46, 61], [70, 61], [70, 178], [150, 178]], v: a },
        { pts: [[46, 163], [120, 163], [120, 80], [150, 80]], v: b },
        { pts: [[46, 163], [88, 163], [88, 196], [150, 196]], v: b },
        { pts: [[202, 66], [284, 66]], v: S },
        { pts: [[192, 186], [284, 186]], v: C }
      ];
      wires.forEach(function (w) {
        ctx.strokeStyle = w.v ? '#4ade80' : '#334155'; ctx.lineWidth = 2;
        ctx.beginPath();
        w.pts.forEach(function (p, i) { if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
        ctx.stroke();
        if (w.v) {
          for (let k = 0; k < 2; k++) {
            const pt = polyPoint(w.pts, (t * 0.015 + k * 0.5) % 1);
            ctx.fillStyle = '#bbf7d0';
            ctx.beginPath(); ctx.arc(pt[0], pt[1], 2.5, 0, Math.PI * 2); ctx.fill();
          }
        }
      });
      // 输入框
      [[a, 48, 'a'], [b, 150, 'b']].forEach(function (it) {
        ctx.fillStyle = it[0] ? '#14532d' : '#1e293b';
        ctx.strokeStyle = it[0] ? '#4ade80' : '#475569';
        ctx.fillRect(20, it[1], 26, 26); ctx.strokeRect(20, it[1], 26, 26);
        ctx.fillStyle = it[0] ? '#4ade80' : '#64748b';
        ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(it[0], 33, it[1] + 18);
        ctx.fillText(it[2], 12, it[1] + 18);
        ctx.textAlign = 'left';
      });
      // XOR 门
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(150, 46); ctx.quadraticCurveTo(164, 66, 150, 86); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(142, 46); ctx.quadraticCurveTo(156, 66, 142, 86); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(150, 46); ctx.quadraticCurveTo(178, 48, 202, 66); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(150, 86); ctx.quadraticCurveTo(178, 84, 202, 66); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('异或 XOR', 158, 106);
      // AND 门
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath(); ctx.moveTo(150, 168); ctx.lineTo(172, 168);
      ctx.arc(172, 186, 18, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(150, 204); ctx.closePath(); ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('与 AND', 160, 222);
      // 输出灯
      [[S, 300, 66, '和 S'], [C, 300, 186, '进位 C']].forEach(function (it) {
        ctx.fillStyle = it[0] ? '#4ade80' : '#1e293b';
        ctx.strokeStyle = it[0] ? '#4ade80' : '#475569';
        ctx.beginPath(); ctx.arc(it[1], it[2], 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (it[0]) { ctx.fillStyle = '#052e16'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('1', it[1], it[2] + 4); ctx.textAlign = 'left'; }
        ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
        ctx.fillText(it[3], it[1] + 17, it[2] + 4);
      });
      // 等式
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(a + ' + ' + b + ' = ' + C + S + '（二进制）', V.w / 2, 246);
      ctx.textAlign = 'left';
      cap(ctx, V, '和=异或，进位=与：两个门就是半加器');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 光刻：曝光→显影→刻蚀，把图形印到硅上 */
  AN.photolitho = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mk(holder, 360, 250, true);
    const SLITS = [140, 180, 220];
    let t = 0;
    (function loop() {
      const d = (tp && tp.data) || D;
      const lam = Math.max(13.5, Math.min(365, d.lambda !== undefined ? d.lambda : 193));
      const lw = Math.max(4, Math.round(lam * 0.35));
      const gw = 4 + lam / 365 * 30; // 槽宽像素随波长
      const tt = t % 480;
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('λ = ' + lam + ' nm → 最小线宽 ≈ ' + lw + ' nm', 20, 20);
      // 光源与紫外光
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.arc(180, 34, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText(tt < 140 ? '紫外光（曝光中）' : '紫外光', 205, 38);
      // 掩膜版
      ctx.fillStyle = '#475569';
      ctx.fillRect(110, 52, 32, 14); ctx.fillRect(148, 52, 24, 14); ctx.fillRect(188, 52, 24, 14); ctx.fillRect(228, 52, 22, 14);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('掩膜版', 60, 63);
      // 光柱
      if (tt < 140) {
        SLITS.forEach(function (sx) {
          ctx.fillStyle = 'rgba(253,224,71,' + (0.25 + 0.15 * Math.sin(t * 0.4 + sx)) + ')';
          ctx.fillRect(sx - 5, 66, 10, 84);
        });
      }
      // 硅片
      ctx.fillStyle = '#334155'; ctx.fillRect(100, 176, 160, 44);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('硅片', 66, 200);
      // 光刻胶层：曝光区在显影阶段溶去
      const expo = Math.min(1, tt / 140);
      const dev = Math.max(0, Math.min(1, (tt - 140) / 120));
      ctx.fillStyle = '#7c3aed';
      ctx.fillRect(100, 150, 160, 26);
      SLITS.forEach(function (sx) {
        ctx.fillStyle = 'rgba(253,224,71,' + (0.5 * expo * (1 - dev)) + ')';
        ctx.fillRect(sx - gw / 2, 150, gw, 26);
        if (dev > 0) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(sx - gw / 2, 150, gw, 26 * dev);
        }
      });
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('光刻胶', 56, 165);
      // 刻蚀：往硅里刻槽
      const etch = Math.max(0, Math.min(1, (tt - 260) / 120));
      if (etch > 0) {
        SLITS.forEach(function (sx) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(sx - gw / 2, 176, gw, 30 * etch);
          ctx.strokeStyle = '#38bdf8';
          ctx.strokeRect(sx - gw / 2, 176, gw, 30 * etch);
        });
      }
      const stage = tt < 140 ? '① 曝光：光透过掩膜版' : tt < 260 ? '② 显影：被照的胶溶去' : tt < 380 ? '③ 刻蚀：图形转移进硅' : '✓ 电路图形已印上硅片';
      ctx.fillStyle = tt >= 380 ? '#4ade80' : '#e2e8f0'; ctx.font = '12px sans-serif';
      ctx.fillText(stage, 20, 240 - 4);
      cap(ctx, V, '波长越短线条越细：EUV 已做到 13.5nm');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 光纤全反射：大于临界角，光被锁在纤芯里 */
  AN.fiberTIR = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mk(holder, 360, 230, true);
    const n1 = 1.46, n2 = 1.45;
    const thc = Math.asin(n2 / n1) * 180 / Math.PI;
    let t = 0;
    (function loop() {
      const d = (tp && tp.data) || D;
      const theta = Math.max(75, Math.min(89, d.theta !== undefined ? d.theta : 85));
      const tir = theta >= thc;
      const alpha = (90 - theta) * Math.PI / 180; // 与光纤轴的夹角
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 光纤
      ctx.fillStyle = '#1e293b'; ctx.fillRect(30, 70, 300, 110);
      ctx.fillStyle = 'rgba(56,189,248,.14)'; ctx.fillRect(30, 95, 300, 60);
      ctx.strokeStyle = '#64748b';
      ctx.strokeRect(30, 95, 300, 60);
      ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif';
      ctx.fillText('包层 n₂=' + n2, 32, 84);
      ctx.fillText('纤芯 n₁=' + n1, 32, 135);
      // 计算光路
      const pts = [[34, 125]];
      const leaks = [];
      let dx = Math.cos(alpha), dy = Math.sin(alpha), x = 34, y = 125, amp = 1, guard = 0;
      const amps = [1];
      while (x < 326 && guard++ < 24) {
        const ywall = dy > 0 ? 155 : 95;
        const dt = (ywall - y) / dy;
        let nx = x + dx * dt, ny = ywall;
        if (nx > 326) { nx = 326; ny = y + dy * (326 - x) / dx; pts.push([nx, ny]); break; }
        pts.push([nx, ny]);
        if (!tir) {
          const th2 = Math.asin(Math.min(1, n1 / n2 * Math.cos(alpha)));
          const a2 = Math.PI / 2 - th2;
          leaks.push({ x: nx, y: ny, dx: Math.cos(a2) * 40, dy: (dy > 0 ? 1 : -1) * Math.sin(a2) * 40 });
          amp *= 0.45; amps.push(amp);
        }
        x = nx; y = ny; dy = -dy;
      }
      // 画光路
      for (let i = 0; i < pts.length - 1; i++) {
        ctx.strokeStyle = 'rgba(253,224,71,' + Math.min(1, amps[i] || 1) + ')';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i + 1][0], pts[i + 1][1]); ctx.stroke();
      }
      ctx.lineWidth = 1;
      // 泄漏光
      ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2;
      leaks.forEach(function (L) {
        ctx.beginPath(); ctx.moveTo(L.x, L.y); ctx.lineTo(L.x + L.dx, L.y + L.dy); ctx.stroke();
      });
      ctx.lineWidth = 1;
      // 光点
      let total = 0;
      for (let i = 0; i < pts.length - 1; i++) total += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
      const dot = polyPoint(pts, (t * 1.8 % total) / total);
      ctx.fillStyle = '#fff7ed';
      ctx.beginPath(); ctx.arc(dot[0], dot[1], 4, 0, Math.PI * 2); ctx.fill();
      // 状态
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('入射角 θ = ' + theta + '°（临界角 θc ≈ ' + thc.toFixed(1) + '°）', 20, 22);
      ctx.fillStyle = tir ? '#4ade80' : '#f87171';
      ctx.fillText(tir ? 'θ > θc：全反射，光被锁在纤芯里' : 'θ < θc：部分折射出包层，信号泄漏！', 20, 40);
      cap(ctx, V, 'sinθc = n₂/n₁：界面上没有折射光');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* GPS：−7μs（速度） + 45μs（引力） = +38μs/天 */
  AN.gpsClock = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mk(holder, 360, 260, true);
    let t = 0, off = 0;
    (function loop() {
      const d = (tp && tp.data) || D;
      const fix = (d.fix !== undefined ? d.fix : 1) ? 1 : 0;
      if (!fix) { off += 38 * (300 / 86400); if (off > 230) off = 0; }
      else off = Math.max(0, off - 1.5);
      const errKm = off * 0.3;
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 地球与轨道
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath(); ctx.arc(92, 110, 40, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#166534';
      ctx.beginPath(); ctx.arc(80, 100, 12, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(104, 122, 9, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(148,163,184,.4)';
      ctx.beginPath(); ctx.arc(92, 110, 86, 0, Math.PI * 2); ctx.stroke();
      const sa = t * 0.02;
      const sx = 92 + 86 * Math.cos(sa), sy = 110 + 86 * Math.sin(sa);
      ctx.fillStyle = '#e2e8f0'; ctx.fillRect(sx - 5, sy - 4, 10, 8);
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(sx - 14, sy - 2, 8, 4); ctx.fillRect(sx + 6, sy - 2, 8, 4);
      if (t % 30 < 15) {
        ctx.strokeStyle = 'rgba(251,191,36,.6)';
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(92, 110); ctx.stroke();
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('卫星 20200km', 40, 220);
      // 三根效应条
      const bars = [['速度（狭义）−7μs/天', -7, '#38bdf8'], ['引力（广义）+45μs/天', 45, '#fb923c'], ['净效应 +38μs/天', 38, '#fbbf24']];
      bars.forEach(function (b, i) {
        const y = 30 + i * 34;
        ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
        ctx.fillText(b[0], 196, y - 4);
        ctx.fillStyle = b[2];
        const wpx = b[1] * 2.6;
        ctx.fillRect(240, y, Math.abs(wpx), 12);
        ctx.strokeStyle = '#475569';
        ctx.beginPath(); ctx.moveTo(240, y - 2); ctx.lineTo(240, y + 14); ctx.stroke();
      });
      // 偏差累计
      ctx.fillStyle = '#e2e8f0'; ctx.font = '12px sans-serif';
      if (fix) {
        ctx.fillStyle = '#4ade80';
        ctx.fillText('✓ 已修正：卫星钟出厂预调慢，偏差 ≈ ' + off.toFixed(1) + ' μs', 20, 178);
        ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif';
        ctx.fillText('定位误差 ≈ ' + errKm.toFixed(1) + ' km', 20, 198);
      } else {
        ctx.fillStyle = '#f87171';
        ctx.fillText('✗ 未修正：钟偏差累计 +' + off.toFixed(1) + ' μs', 20, 178);
        ctx.fillStyle = '#fbbf24'; ctx.font = '11px sans-serif';
        ctx.fillText('定位漂移 ≈ ' + errKm.toFixed(1) + ' km（光 1μs 走 300m）', 20, 198);
      }
      cap(ctx, V, '−7μs（狭义） + 45μs（广义） = +38μs/天');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 汉明码：三组奇偶检查拼出出错位置 */
  AN.hamming = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mk(holder, 360, 260, true);
    const CODE = [0, 1, 1, 0, 0, 1, 1]; // 位1~7，数据 1011
    const GRP = [[0, 2, 4, 6], [1, 2, 5, 6], [3, 4, 5, 6]]; // 校验组（0基）
    const GC = ['#38bdf8', '#f59e0b', '#a78bfa'];
    let t = 0;
    (function loop() {
      const d = (tp && tp.data) || D;
      const err = Math.max(0, Math.min(7, Math.round(d.err !== undefined ? d.err : 3)));
      const recv = CODE.slice();
      if (err > 0) recv[err - 1] ^= 1;
      const syn = GRP.map(function (g) { return g.reduce(function (s, i) { return s ^ recv[i]; }, 0); });
      const synPos = syn[0] + syn[1] * 2 + syn[2] * 4;
      const tt = t % 320;
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('汉明码(7,4)：数据 1011 + 3 位校验，发出 [0 1 1 0 0 1 1]', 16, 20);
      // 位框
      for (let i = 0; i < 7; i++) {
        const x = 26 + i * 44, bad = err > 0 && i === err - 1;
        const fixed = tt > 170 && synPos === i + 1 && synPos > 0;
        ctx.fillStyle = fixed ? '#14532d' : bad ? '#450a0a' : '#1e293b';
        ctx.strokeStyle = fixed ? '#4ade80' : bad ? '#f87171' : '#475569';
        ctx.fillRect(x, 50, 34, 34); ctx.strokeRect(x, 50, 34, 34);
        ctx.fillStyle = fixed ? '#4ade80' : bad ? '#f87171' : '#e2e8f0';
        ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(fixed ? recv[i] ^ 1 : recv[i], x + 17, 72);
        ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
        ctx.fillText('位' + (i + 1), x + 17, 44);
        ctx.textAlign = 'left';
      }
      // 校验组连线
      if (tt > 60) {
        GRP.forEach(function (g, gi) {
          const y = 100 + gi * 16;
          const fail = syn[gi] === 1;
          ctx.strokeStyle = fail ? '#f87171' : GC[gi]; ctx.lineWidth = 2;
          ctx.beginPath();
          g.forEach(function (bi, k) {
            const x = 26 + bi * 44 + 17;
            if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            ctx.moveTo(x, y); ctx.lineTo(x, 86);
            ctx.moveTo(x, y);
          });
          ctx.stroke();
          ctx.lineWidth = 1;
          ctx.fillStyle = fail ? '#f87171' : GC[gi]; ctx.font = '10px sans-serif';
          ctx.fillText('校验' + (gi + 1) + ' ' + (fail ? '✗ 奇偶错' : '✓'), 320, y + 3);
        });
      }
      // 判定
      ctx.font = '12px sans-serif';
      if (tt > 170) {
        if (synPos > 0) {
          ctx.fillStyle = '#fbbf24';
          ctx.fillText('症候 ' + syn[2] + syn[1] + syn[0] + '（二进制）= 第 ' + synPos + ' 位出错 → 翻回即修复', 20, 172);
          const x = 26 + (synPos - 1) * 44 + 17;
          ctx.strokeStyle = '#4ade80';
          ctx.beginPath(); ctx.moveTo(x, 160); ctx.lineTo(x, 90); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x - 4, 96); ctx.lineTo(x, 88); ctx.lineTo(x + 4, 96); ctx.stroke();
          ctx.fillStyle = '#4ade80';
          ctx.fillText('✓ 已自动纠正', 20, 192);
        } else {
          ctx.fillStyle = '#4ade80';
          ctx.fillText('三组奇偶全部通过 ✓ 无错，数据可信', 20, 178);
        }
      } else if (err > 0) {
        ctx.fillStyle = '#f87171';
        ctx.fillText('第 ' + err + ' 位在传输中被干扰翻转（红框）…', 20, 178);
      }
      cap(ctx, V, '校验结果的 0/1 拼起来 = 出错位置编号（症候）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 分组交换：拆包、独立选路、乱序到达、按编号重组 */
  AN.packetSwitch = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mk(holder, 360, 250, true);
    const ND = { S: [30, 120], A: [140, 52], B: [140, 190], C: [240, 120], R: [330, 120] };
    const EDGES = [['S', 'A'], ['S', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'R']];
    const PATHS = { top: ['S', 'A', 'C', 'R'], bot: ['S', 'B', 'C', 'R'] };
    const COL = ['#f87171', '#fbbf24', '#38bdf8'];
    const CH = ['你', '好', '吗'];
    let t = 0, packets = [], spawned = 0, cycleStart = 0, doneT = -1, arrived = [false, false, false];
    (function loop() {
      const ctx = V.ctx;
      if (doneT < 0 && spawned < 3 && t - cycleStart > spawned * 32) {
        const key = spawned === 1 ? 'bot' : 'top';
        packets.push({ num: spawned, path: PATHS[key].map(function (k) { return ND[k]; }), u: 0, speed: key === 'top' ? 0.012 : 0.0065, done: false });
        spawned++;
      }
      if (doneT >= 0 && t - doneT > 110) {
        packets = []; spawned = 0; cycleStart = t; doneT = -1; arrived = [false, false, false];
      }
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 边
      EDGES.forEach(function (e) {
        ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(ND[e[0]][0], ND[e[0]][1]); ctx.lineTo(ND[e[1]][0], ND[e[1]][1]); ctx.stroke();
      });
      ctx.lineWidth = 1;
      ctx.fillStyle = '#7f1d1d'; ctx.font = '9px sans-serif';
      ctx.fillText('拥堵→慢', 168, 168);
      // 节点
      [['A', 140, 52], ['B', 140, 190], ['C', 240, 120]].forEach(function (n) {
        ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#64748b';
        ctx.beginPath(); ctx.arc(n[1], n[2], 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(n[0], n[1], n[2] + 3); ctx.textAlign = 'left';
      });
      ctx.fillStyle = '#14532d'; ctx.fillRect(18, 108, 24, 24);
      ctx.fillStyle = '#4ade80'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('发', 30, 124);
      ctx.fillStyle = '#1e3a8a'; ctx.fillRect(318, 108, 24, 24);
      ctx.fillStyle = '#93c5fd'; ctx.fillText('收', 330, 124);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
      ctx.fillText('路由器', 128, 36);
      // 包
      let allDone = packets.length === 3;
      packets.forEach(function (p) {
        if (!p.done) {
          p.u += p.speed;
          if (p.u >= 1) { p.done = true; arrived[p.num] = true; if (doneT < 0 && arrived[0] && arrived[1] && arrived[2]) doneT = t; }
        }
        if (!p.done) {
          const pt = polyPoint(p.path, p.u);
          ctx.fillStyle = COL[p.num];
          ctx.beginPath(); ctx.arc(pt[0], pt[1], 6, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#0f172a'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(p.num + 1, pt[0], pt[1] + 3); ctx.textAlign = 'left';
        } else if (packets.length < 3) allDone = false;
      });
      // 接收重组槽
      for (let i = 0; i < 3; i++) {
        const x = 296 + i * 22;
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(x, 152, 18, 18);
        if (arrived[i]) {
          ctx.fillStyle = COL[i]; ctx.fillRect(x, 152, 18, 18);
          ctx.fillStyle = '#0f172a'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(CH[i], x + 9, 165); ctx.textAlign = 'left';
        }
      }
      ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
      ctx.fillText('按编号重组', 298, 182);
      if (doneT >= 0) {
        ctx.fillStyle = '#4ade80'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('重组完成：「你好吗」', V.w / 2, 226);
        ctx.textAlign = 'left';
      } else {
        ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif';
        ctx.fillText('消息拆成 3 个包，各自选路（②走拥堵的下路）', 40, 226);
      }
      cap(ctx, V, '拆分 → 独立选路 → 乱序到达 → 按编号重组');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 梯度下降：沿 −∇L 走到谷底，学习率定生死 */
  AN.gradDescent = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mk(holder, 360, 240, true);
    let t = 0, w = 2.0, iter = 0, hold = 0, status = '';
    const trail = [];
    function X(ww) { return 180 + ww * 70; }
    function Y(ww) { return 195 - ww * ww * 34; }
    (function loop() {
      const d = (tp && tp.data) || D;
      const lr = Math.max(0.02, Math.min(1.05, d.lr !== undefined ? d.lr : 0.3));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 损失曲面
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let ww = -2.3; ww <= 2.3; ww += 0.05) {
        if (ww === -2.3) ctx.moveTo(X(ww), Y(ww)); else ctx.lineTo(X(ww), Y(ww));
      }
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
      ctx.fillText('损失 L(w)', 8, 20);
      ctx.fillText('w*（谷底）', 168, 210);
      // 轨迹
      trail.forEach(function (p, i) {
        ctx.fillStyle = 'rgba(248,113,113,' + (0.15 + 0.5 * i / Math.max(1, trail.length)) + ')';
        ctx.beginPath(); ctx.arc(X(p), Y(p) - 6, 3, 0, Math.PI * 2); ctx.fill();
      });
      // 小球
      ctx.fillStyle = '#f87171';
      ctx.beginPath(); ctx.arc(X(w), Y(w) - 6, 7, 0, Math.PI * 2); ctx.fill();
      // 梯度方向箭头
      if (hold === 0 && status === '') {
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
        const dir = w > 0 ? -1 : 1;
        ctx.beginPath(); ctx.moveTo(X(w), Y(w) - 6); ctx.lineTo(X(w) + dir * 26, Y(w) - 6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(X(w) + dir * 26, Y(w) - 6); ctx.lineTo(X(w) + dir * 18, Y(w) - 11); ctx.moveTo(X(w) + dir * 26, Y(w) - 6); ctx.lineTo(X(w) + dir * 18, Y(w) - 1); ctx.stroke();
        ctx.lineWidth = 1;
      }
      // 迭代
      if (hold > 0) {
        hold--;
        if (hold === 0) { w = 2.0; iter = 0; status = ''; trail.length = 0; }
      } else if (t % 14 === 0 && status === '') {
        w = w - lr * 2 * w;
        iter++;
        trail.push(w);
        if (Math.abs(w) < 0.03) { status = 'ok'; hold = 80; }
        else if (Math.abs(w) > 2.7) { status = 'div'; hold = 80; }
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '12px sans-serif';
      ctx.fillText('η = ' + lr.toFixed(2) + '   迭代 ' + iter + ' 次   L = ' + (w * w).toFixed(3), 14, 38);
      if (status === 'ok') { ctx.fillStyle = '#4ade80'; ctx.fillText('✓ 收敛到谷底（损失最小）', 14, 58); }
      if (status === 'div') { ctx.fillStyle = '#f87171'; ctx.fillText('✗ 学习率过大：跨谷发散！', 14, 58); }
      cap(ctx, V, 'w ← w − η·∇L：η 太小慢，太大发散');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 哈希与数字签名：改一个字，指纹全变 */
  AN.hashSign = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mk(holder, 360, 250, true);
    function h16(str) {
      let h1 = 5381, h2 = 52711;
      for (let i = 0; i < str.length; i++) {
        h1 = ((h1 * 33) ^ str.charCodeAt(i)) >>> 0;
        h2 = ((h2 * 31) + str.charCodeAt(i)) >>> 0;
      }
      return ('0000000' + h1.toString(16)).slice(-8) + ('0000000' + h2.toString(16)).slice(-8);
    }
    const MSG = ['转账 100 元', '转账 900 元'];
    const H = [h16(MSG[0]), h16(MSG[1])];
    const SIGN = [h16('私钥|' + H[0]).slice(0, 12)];
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      const ph = Math.floor(t / 200) % 2;
      const local = t % 200;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 消息
      ctx.fillStyle = '#1e293b'; ctx.strokeStyle = ph ? '#f87171' : '#475569';
      ctx.fillRect(16, 26, 150, 38); ctx.strokeRect(16, 26, 150, 38);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('消息' + (ph ? '（被篡改！）' : ''), 20, 22);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '13px sans-serif';
      ctx.fillText(MSG[ph], 24, 50);
      // 哈希
      ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#475569';
      ctx.fillRect(16, 92, 150, 52); ctx.strokeRect(16, 92, 150, 52);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('哈希指纹（SHA 风格）', 20, 88);
      const cur = H[ph], oth = H[1 - ph];
      ctx.font = '11px monospace';
      for (let i = 0; i < 16; i++) {
        const scramble = local < 40 && Math.random() < 0.5;
        const ch = scramble ? '0123456789abcdef'[Math.floor(Math.random() * 16)] : cur[i];
        ctx.fillStyle = cur[i] !== oth[i] ? '#f87171' : '#4ade80';
        ctx.fillText(ch, 24 + (i % 8) * 17, 112 + Math.floor(i / 8) * 18);
      }
      // 签名（始终由原始消息的私钥生成）
      ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#475569';
      ctx.fillRect(204, 26, 140, 38); ctx.strokeRect(204, 26, 140, 38);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('数字签名（私钥）', 208, 22);
      ctx.fillStyle = '#a78bfa'; ctx.font = '10px monospace';
      ctx.fillText(SIGN[0], 212, 48);
      // 验证
      const ok = h16(MSG[ph]) === H[0];
      ctx.fillStyle = ok ? '#052e16' : '#450a0a';
      ctx.strokeStyle = ok ? '#4ade80' : '#f87171';
      ctx.fillRect(204, 110, 140, 56); ctx.strokeRect(204, 110, 140, 56);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('公钥验证', 208, 106);
      ctx.fillStyle = ok ? '#4ade80' : '#f87171'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText(ok ? '✓ 摘要对得上：未被篡改' : '✗ 摘要不符：拒绝！', 212, 134);
      ctx.font = '10px sans-serif';
      ctx.fillText(ok ? '签名有效' : '改 1 个字 → 指纹全变', 212, 154);
      // 箭头
      ctx.strokeStyle = '#64748b';
      function arrow(x1, y1, x2, y2) {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        const ang = Math.atan2(y2 - y1, x2 - x1);
        ctx.beginPath(); ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 6 * Math.cos(ang - 0.4), y2 - 6 * Math.sin(ang - 0.4));
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 6 * Math.cos(ang + 0.4), y2 - 6 * Math.sin(ang + 0.4));
        ctx.stroke();
      }
      arrow(91, 64, 91, 90);       // 消息→哈希
      arrow(166, 118, 202, 46);    // 哈希→签名（签署时）
      arrow(166, 130, 202, 136);   // 哈希→验证（重算）
      arrow(274, 64, 274, 108);    // 签名→验证
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText(ph ? '场景：黑客把 100 改成 900' : '场景：正常转账消息', 16, 180);
      cap(ctx, V, '单向 + 雪崩：私钥签名，公钥人人都能验');
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
