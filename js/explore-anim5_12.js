/* explore-anim5_12.js — 第三批动画引擎（量子奇观树 · 批次12，11 个专属原理动画） */
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

  /* 黑体辐射：普朗克曲线 vs 经典"紫外灾难"，温度定颜色 */
  AN.planckQuanta = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    function bbColor(T) { // 近似黑体色
      let r, g, b;
      if (T < 3500) { r = 255; g = 60 + (T - 2000) / 1500 * 110; b = 15 + (T - 2000) / 1500 * 65; }
      else if (T < 6000) { r = 255; g = 170 + (T - 3500) / 2500 * 70; b = 80 + (T - 3500) / 2500 * 150; }
      else { r = 255 - (T - 6000) / 2000 * 55; g = 240; b = 255; }
      return 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')';
    }
    function colorName(T) {
      if (T < 2600) return '暗红';
      if (T < 3400) return '红橙';
      if (T < 4800) return '黄白';
      if (T < 6600) return '白（近似日光）';
      return '蓝白';
    }
    (function loop() {
      const D = (tp && tp.data) || {};
      const T = Math.max(2000, Math.min(8000, D.T !== undefined ? D.T : 4000));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 左侧黑体球 + 辉光
      const col = bbColor(T);
      ctx.save();
      ctx.shadowColor = col; ctx.shadowBlur = 26;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(72, 112, 33, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      for (let i = 0; i < 8; i++) { // 热辐射微粒
        const a = i * 0.785 + 0.3, rr = 40 + ((t * 0.7 + i * 11) % 26);
        ctx.fillStyle = 'rgba(255,210,130,' + (0.4 * (1 - (rr - 40) / 26)) + ')';
        ctx.beginPath(); ctx.arc(72 + rr * Math.cos(a), 112 + rr * Math.sin(a) * 0.65, 1.6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('黑体 T = ' + T + ' K（' + colorName(T) + '）', 22, 172);
      // 右侧辐射曲线：普朗克 vs 瑞利-金斯
      const X0 = 150, Y0 = 34, W = 196, H = 156;
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(X0, Y0, W, H);
      const hok = 4.8e-11, N = 60;
      const P = []; let pmax = 1e-30;
      for (let i = 1; i <= N; i++) {
        const nu = i / N * 3e15;
        const x = Math.min(60, hok * nu / T);
        const B = nu * nu * nu / (Math.exp(x) - 1);
        P.push(B); if (B > pmax) pmax = B;
      }
      // 瑞利-金斯：低频与普朗克重合，高频发散（虚线冲出图框）
      ctx.setLineDash([4, 3]); ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      let rjOut = false;
      for (let i = 1; i <= N; i++) {
        const nu = i / N * 3e15;
        const R = nu * nu * T / hok / pmax; // 归一到普朗克峰值
        const px = X0 + i / N * W, py = Y0 + H - R * H * 0.9;
        if (py < Y0) { rjOut = true; break; }
        if (i === 1) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke(); ctx.setLineDash([]);
      // 普朗克曲线
      ctx.save();
      ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 6;
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
      ctx.beginPath();
      let mi = 0;
      for (let i = 1; i <= N; i++) {
        const px = X0 + i / N * W, py = Y0 + H - P[i - 1] / pmax * H * 0.9;
        if (P[i - 1] === pmax) mi = i;
        if (i === 1) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke(); ctx.restore();
      // 峰值标记
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(X0 + mi / N * W, Y0 + H - H * 0.9, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('— 普朗克（量子）', X0 + 8, Y0 + 12);
      ctx.fillStyle = '#ef4444';
      ctx.fillText('- - 经典：紫外灾难' + (rjOut ? ' → ∞' : ''), X0 + 8, Y0 + 24);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('峰值 λ ≈ 2.898×10⁶/T = ' + Math.round(2.898e6 / T) + ' nm', 20, 20);
      cap(ctx, V, '1900 普朗克：能量只能整份交换 E = hν，紫外灾难消失');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 斯特恩-盖拉赫：银原子在非均匀磁场中裂成两束 */
  AN.sternGerlach = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, lastG = -1;
    const bins = new Array(44).fill(0); // 屏上沉积
    const cy = 120;
    let atom = { p: -1, s: 1 };
    function seedHits(g, n) {
      const Dd = 3 + g * 0.5;
      for (let i = 0; i < n; i++) {
        const s = Math.random() < 0.5 ? -1 : 1;
        const y = cy + s * Dd + (Math.random() - 0.5) * 6;
        const bi = Math.max(0, Math.min(43, Math.floor((y - 40) / 160 * 44)));
        bins[bi]++;
      }
    }
    seedHits(60, 220); // 预跑：首帧即有两个斑点
    (function loop() {
      const D = (tp && tp.data) || {};
      const g = Math.max(0, Math.min(100, D.g !== undefined ? D.g : 60));
      if (g !== lastG) { for (let i = 0; i < 44; i++) bins[i] = 0; seedHits(g, 220); lastG = g; }
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const Dd = 3 + g * 0.5;
      // 炉子与准直缝
      ctx.fillStyle = '#334155'; ctx.fillRect(14, cy - 12, 26, 24);
      ctx.fillStyle = '#f97316';
      ctx.beginPath(); ctx.arc(27, cy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('银原子炉', 8, cy - 18);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(58, cy - 16, 5, 12); ctx.fillRect(58, cy + 4, 5, 12);
      // 磁铁：楔形 N 极在上、S 极在下 → 梯度场
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.moveTo(100, 46); ctx.lineTo(210, 46); ctx.lineTo(210, 78); ctx.lineTo(155, 92); ctx.lineTo(100, 78); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#3b82f6'; ctx.fillRect(100, 148, 110, 32);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif';
      ctx.fillText('N', 150, 62); ctx.fillText('S', 150, 170);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('非均匀磁场 dB/dz = ' + g + '%', 108, 36);
      // 磁力线（上密下疏表梯度）
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const lx = 110 + i * 18;
        ctx.beginPath(); ctx.moveTo(lx, 94 - (i % 2) * 2); ctx.lineTo(lx, 146); ctx.stroke();
      }
      // 两条量子轨迹（金=↑，青=↓）与经典对照（灰带）
      function trajY(x, s) {
        const p = Math.max(0, Math.min(1, (x - 100) / 110));
        return cy + s * Dd * p * p * (3 - 2 * p);
      }
      ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(148,163,184,.5)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(66, cy); ctx.lineTo(300, cy); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(148,163,184,.8)'; ctx.font = '9px sans-serif';
      ctx.fillText('经典预言：一条连续带', 218, cy - 6);
      [['#fbbf24', 1], ['#22d3ee', -1]].forEach(function (cs) {
        ctx.strokeStyle = cs[0]; ctx.lineWidth = 2;
        ctx.save(); ctx.shadowColor = cs[0]; ctx.shadowBlur = 4;
        ctx.beginPath();
        for (let x = 66; x <= 300; x += 4) {
          const y = trajY(x, cs[1]);
          if (x === 66) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke(); ctx.restore();
      });
      // 飞行中的银原子
      if (atom.p < 0 && t % 10 === 0) atom = { p: 0, s: Math.random() < 0.5 ? 1 : -1 };
      if (atom.p >= 0) {
        atom.p += 0.018;
        const ax = 66 + atom.p * 234;
        const ay = trajY(ax, atom.s);
        ctx.save(); ctx.shadowColor = '#fff'; ctx.shadowBlur = 8;
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath(); ctx.arc(ax, ay, 3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        if (atom.p >= 1) {
          const bi = Math.max(0, Math.min(43, Math.floor((ay - 40) / 160 * 44)));
          bins[bi]++; atom.p = -1;
        }
      }
      // 探测屏
      ctx.fillStyle = 'rgba(203,213,225,.9)'; ctx.fillRect(300, 40, 5, 160);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('玻璃板', 294, 32);
      // 沉积斑点：两个分离峰
      let bmax = 1; bins.forEach(function (b) { if (b > bmax) bmax = b; });
      bins.forEach(function (b, i) {
        if (!b) return;
        const y = 40 + i / 44 * 160;
        const col = y < cy ? '251,191,36' : '34,211,238';
        ctx.fillStyle = 'rgba(' + col + ',' + Math.min(1, 0.25 + b / bmax) + ')';
        ctx.fillRect(306, y, Math.min(34, b / bmax * 34), 3.2);
      });
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('分裂间距 ±' + Dd.toFixed(0) + ' px：' + (g < 8 ? '梯度为零，两束合一' : '只有两束，没有连续带'), 16, 20);
      cap(ctx, V, '1922 斯特恩-盖拉赫：角动量取向量子化——银原子一分为二');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 德布罗意波：电子衍射，λ = h/mv = 12.27/√U Å */
  AN.matterWave = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const hits = []; // 屏上落点
    const DSP = 3.0; // 晶面间距 d ≈ 3 Å
    function seedHits(u, n) {
      const lam = 12.27 / Math.sqrt(u); // Å
      const st = Math.min(0.999, lam / DSP);
      const th = Math.asin(st);
      for (let i = 0; i < n; i++) {
        const r = Math.random();
        let y;
        if (r < 0.4) y = (Math.random() - 0.5) * 14; // 中心峰
        else { // ±1 级衍射峰
          const s = Math.random() < 0.5 ? -1 : 1;
          y = s * Math.tan(th) * 52 + (Math.random() - 0.5) * 10;
        }
        hits.push(Math.max(-64, Math.min(64, y)));
      }
    }
    seedHits(54, 260); // 预跑：首帧即有条纹
    let lastU = 54;
    (function loop() {
      const D = (tp && tp.data) || {};
      const u = Math.max(20, Math.min(200, D.u !== undefined ? D.u : 54));
      if (u !== lastU) { hits.length = 0; seedHits(u, 260); lastU = u; }
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const lam = 12.27 / Math.sqrt(u); // Å
      const st = Math.min(0.999, lam / DSP);
      const th = Math.asin(st);
      // 电子枪
      ctx.fillStyle = '#334155'; ctx.fillRect(14, 100, 34, 26);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('电子枪', 16, 96);
      ctx.fillText(u + ' V', 20, 115);
      // 物质波：波长 ∝ λ
      const lamPx = 6 + lam * 9;
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 50; x <= 148; x++) {
        const y = 113 + 10 * Math.sin((x - 50) / lamPx * Math.PI * 2 - t * 0.35);
        if (x === 50) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#22d3ee'; ctx.font = '9px sans-serif';
      ctx.fillText('λ = ' + lam.toFixed(2) + ' Å', 70, 140);
      // 镍晶体
      ctx.fillStyle = 'rgba(148,163,184,.25)'; ctx.fillRect(150, 84, 26, 60);
      ctx.fillStyle = '#cbd5e1';
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
        ctx.beginPath(); ctx.arc(156 + c * 8, 92 + r * 14, 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('镍晶体 d≈3 Å', 140, 158);
      // 衍射束：中心 + ±1 级
      const sy = 114;
      ctx.strokeStyle = 'rgba(34,211,238,.55)'; ctx.lineWidth = 1.5;
      [[0], [th], [-th]].forEach(function (a) {
        ctx.beginPath(); ctx.moveTo(176, sy);
        ctx.lineTo(258, sy + Math.tan(a[0]) * 82); ctx.stroke();
      });
      // 荧光屏与落点累积
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(258, 40); ctx.lineTo(258, 190); ctx.stroke();
      if (t % 3 === 0) seedHits(u, 3);
      if (hits.length > 900) hits.splice(0, hits.length - 900);
      ctx.fillStyle = 'rgba(96,165,250,.85)';
      hits.forEach(function (y) {
        ctx.fillRect(258, sy + y, 3, 1.6);
      });
      // 右侧强度分布直方
      const bins = new Array(28).fill(0);
      hits.forEach(function (y) {
        const bi = Math.max(0, Math.min(27, Math.floor((y + 64) / 128 * 28)));
        bins[bi]++;
      });
      let bmax = 1; bins.forEach(function (b) { if (b > bmax) bmax = b; });
      ctx.fillStyle = 'rgba(251,191,36,.8)';
      bins.forEach(function (b, i) {
        const bh = b / bmax * 62;
        ctx.fillRect(268, 50 + i * 4.6, bh, 3.4);
      });
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('衍射强度', 282, 44);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('U = ' + u + ' V → λ = 12.27/√U ≈ ' + lam.toFixed(2) + ' Å，1 级峰 θ ≈ ' + (th * 180 / Math.PI).toFixed(0) + '°', 16, 20);
      cap(ctx, V, 'λ = h/mv：电压越高波长越短，衍射峰越靠近中心（1927 戴维森-革末）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 不确定性原理：Δx·Δp ≥ ℏ/2 的此消彼长 */
  AN.uncertaintyTrade = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const w = Math.max(8, Math.min(60, D.w !== undefined ? D.w : 30));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const pw = 900 / w; // 动量宽度 ∝ 1/Δx
      // 上：位置空间波包 ψ(x)
      ctx.fillStyle = 'rgba(34,211,238,.08)'; ctx.fillRect(20, 30, 240, 80);
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(20, 30, 240, 80);
      ctx.save();
      ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 5;
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = -110; x <= 110; x += 2) {
        const env = Math.exp(-x * x / (2 * w * w));
        const y = 70 - env * Math.cos(x * 0.55 - t * 0.12) * 30;
        if (x === -110) ctx.moveTo(140 + x, y); else ctx.lineTo(140 + x, y);
      }
      ctx.stroke(); ctx.restore();
      ctx.fillStyle = '#22d3ee'; ctx.font = '10px sans-serif';
      ctx.fillText('位置波包 ψ(x)：Δx = ' + w + ' px', 26, 26);
      // 下：动量分布 |φ(p)|²
      ctx.fillStyle = 'rgba(251,191,36,.07)'; ctx.fillRect(20, 130, 240, 70);
      ctx.strokeStyle = 'rgba(148,163,184,.4)';
      ctx.strokeRect(20, 130, 240, 70);
      ctx.save();
      ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 5;
      ctx.fillStyle = 'rgba(251,191,36,.55)';
      ctx.beginPath(); ctx.moveTo(30, 200);
      for (let p = -110; p <= 110; p += 2) {
        const v = Math.exp(-p * p / (2 * pw * pw));
        ctx.lineTo(140 + p, 200 - v * 62);
      }
      ctx.lineTo(250, 200); ctx.closePath(); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#fbbf24'; ctx.font = '10px sans-serif';
      ctx.fillText('动量分布 |φ(p)|²：Δp ∝ 1/Δx = ' + (30 / w).toFixed(2), 26, 126);
      // 右侧乘积条：Δx 与 Δp 此消彼长，乘积恒定
      const BX = 292;
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('Δx', BX - 6, 60);
      ctx.fillText('Δp', BX - 6, 130);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(BX, 66, 16, w * 1.1);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(BX, 136 - pw * 0.36, 16, pw * 0.36);
      ctx.strokeStyle = 'rgba(148,163,184,.5)';
      ctx.strokeRect(BX, 66, 16, 66);
      ctx.strokeRect(BX, 70, 16, 66);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('Δx·Δp ≈ ℏ/2（恒定）', 240, 208);
      cap(ctx, V, '1927 海森堡：压窄位置波包，动量谱必然摊开——不是仪器差，是本性');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 超流氦：跨过 2.17 K λ 点，零黏度爬膜翻杯 */
  AN.superfluidHe = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const atoms = [];
    for (let i = 0; i < 36; i++) atoms.push({ a: Math.random(), b: Math.random() });
    const bubbles = [];
    (function loop() {
      const D = (tp && tp.data) || {};
      const temp = Math.max(1.0, Math.min(3.0, D.temp !== undefined ? D.temp : 1.5));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const sup = temp < 2.17;
      // 烧杯
      const BX = 120, BY = 70, BW = 120, BH = 120;
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(BX, BY); ctx.lineTo(BX, BY + BH); ctx.lineTo(BX + BW, BY + BH); ctx.lineTo(BX + BW, BY); ctx.stroke();
      // 液面
      const lvl = 60;
      ctx.fillStyle = sup ? 'rgba(34,211,238,.4)' : 'rgba(96,165,250,.4)';
      ctx.fillRect(BX + 2, BY + BH - lvl, BW - 4, lvl);
      ctx.strokeStyle = sup ? '#22d3ee' : '#60a5fa'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x <= BW - 4; x += 4) {
        const y = BY + BH - lvl + (sup ? 0 : Math.sin(x * 0.3 + t * 0.2) * 1.6);
        if (x === 0) ctx.moveTo(BX + 2 + x, y); else ctx.lineTo(BX + 2 + x, y);
      }
      ctx.stroke();
      // 液氦原子：超流态整齐层流，正常态杂乱
      atoms.forEach(function (a, i) {
        let x, y;
        if (sup) {
          x = BX + 8 + ((a.a * 97 + t * 0.9) % (BW - 16));
          y = BY + BH - 8 - a.b * (lvl - 14) + Math.sin(t * 0.1 + i) * 1;
        } else {
          x = BX + 8 + a.a * (BW - 16) + Math.sin(t * 0.23 + i * 2.1) * 3;
          y = BY + BH - 8 - a.b * (lvl - 14) + Math.cos(t * 0.19 + i * 1.3) * 3;
        }
        ctx.fillStyle = sup ? 'rgba(165,243,252,.9)' : 'rgba(147,197,253,.85)';
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
      });
      if (sup) {
        // 爬行膜：沿内壁 → 越过杯口 → 外壁下滑 → 滴落
        ctx.save();
        ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 6;
        ctx.strokeStyle = '#67e8f9'; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(BX + 3, BY + BH - lvl);
        ctx.lineTo(BX + 3, BY - 2); ctx.lineTo(BX - 4, BY - 2); ctx.lineTo(BX - 4, BY + 60);
        ctx.stroke();
        ctx.restore();
        for (let i = 0; i < 6; i++) { // 膜上流动的液珠
          const q = ((t * 0.008 + i / 6) % 1);
          let x, y;
          if (q < 0.45) { x = BX + 3; y = BY + BH - lvl - q / 0.45 * (BH - lvl + 2); }
          else if (q < 0.55) { x = BX + 3 - (q - 0.45) / 0.1 * 7; y = BY - 2; }
          else { x = BX - 4; y = BY - 2 + (q - 0.55) / 0.45 * 62; }
          ctx.fillStyle = '#a5f3fc';
          ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
        }
        const dq = (t % 70) / 70; // 外壁液滴
        ctx.fillStyle = '#67e8f9';
        ctx.beginPath(); ctx.arc(BX - 4, BY + 60 + dq * 46, 2.6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#22c55e'; ctx.font = '10px sans-serif';
        ctx.fillText('爬行膜翻越杯口 →', 6, 96);
      } else {
        // 正常液氦：沸腾气泡
        if (t % 9 === 0) bubbles.push({ x: BX + 14 + Math.random() * (BW - 28), y: BY + BH - 8, r: 1 + Math.random() * 2 });
        for (let i = bubbles.length - 1; i >= 0; i--) {
          const b = bubbles[i];
          b.y -= 0.9; b.r += 0.015;
          ctx.strokeStyle = 'rgba(191,219,254,.8)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke();
          if (b.y < BY + BH - lvl + 4) bubbles.splice(i, 1);
        }
        ctx.fillStyle = '#f87171'; ctx.font = '10px sans-serif';
        ctx.fillText('普通液氦：有黏度、沸腾', 20, 96);
      }
      // 温度计
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.strokeRect(300, 50, 14, 150);
      const ty = 200 - (temp - 1) / 2 * 145;
      ctx.fillStyle = sup ? '#22d3ee' : '#f87171';
      ctx.fillRect(302, ty, 10, 200 - ty);
      const ly = 200 - (2.17 - 1) / 2 * 145;
      ctx.setLineDash([3, 3]); ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(296, ly); ctx.lineTo(318, ly); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#fbbf24'; ctx.font = '9px sans-serif';
      ctx.fillText('λ点 2.17 K', 250, ly - 4);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText(temp.toFixed(2) + ' K', 288, 216);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText(sup ? 'T < λ 点：超流相，黏度≈0' : 'T > λ 点：正常流体，黏度>0', 20, 20);
      cap(ctx, V, '1937 卡皮查：2.17 K 以下氦-4 变超流体，沿壁"爬"出杯子');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 单电子双缝：逐个发射也累积出干涉条纹 */
  AN.doubleSlit = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, count = 0, lastD = -1;
    const bins = new Array(56).fill(0);
    function sample(d, n) {
      for (let i = 0; i < n; i++) {
        for (let k = 0; k < 20; k++) { // 拒绝采样 cos² 图样
          const y = Math.random() * 2 - 1;
          const inten = Math.pow(Math.cos(y * d * 0.36), 2) * Math.exp(-y * y * 2.2);
          if (Math.random() < inten) {
            const bi = Math.max(0, Math.min(55, Math.floor((y + 1) / 2 * 56)));
            bins[bi]++; count++;
            break;
          }
        }
      }
    }
    sample(30, 320); // 预跑：首帧即有条纹
    count = 320;
    const flyer = { x: -1, y: 0, ty: 0 };
    (function loop() {
      const D = (tp && tp.data) || {};
      const d = Math.max(10, Math.min(60, D.d !== undefined ? D.d : 30));
      if (d !== lastD) { for (let i = 0; i < 56; i++) bins[i] = 0; count = 0; sample(d, 320); count = 320; lastD = d; }
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cy = 110, gap = 6 + d * 0.35;
      // 电子源
      ctx.fillStyle = '#334155'; ctx.fillRect(14, cy - 9, 18, 18);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('电子源', 12, cy - 14);
      // 双缝挡板
      ctx.fillStyle = '#64748b';
      ctx.fillRect(96, 40, 8, cy - gap - 40);
      ctx.fillRect(96, cy - gap + 8, 8, gap * 2 - 16);
      ctx.fillRect(96, cy + gap, 8, 180 - cy - gap);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('双缝间距 d = ' + d + ' μm', 62, 32);
      // 每个缝发出环形波前
      const per = 14;
      for (let k = 0; k < 6; k++) {
        const r = ((t * 1.1) % per) + k * per;
        if (r < 4) continue;
        const fade = Math.max(0, 1 - r / 95);
        ctx.strokeStyle = 'rgba(34,211,238,' + fade * 0.5 + ')'; ctx.lineWidth = 1;
        [cy - gap + 4, cy + gap - 4].forEach(function (sy) {
          ctx.beginPath(); ctx.arc(104, sy, r, -Math.PI / 2.3, Math.PI / 2.3); ctx.stroke();
        });
      }
      // 飞行中的单电子
      if (flyer.x < 0 && t % 26 === 0) {
        flyer.x = 34; flyer.y = cy;
        flyer.ty = cy + (Math.random() * 2 - 1) * 60;
      }
      if (flyer.x >= 0) {
        flyer.x += 2.4;
        if (flyer.x < 96) flyer.y = cy;
        else flyer.y += (flyer.ty - flyer.y) * 0.06;
        ctx.save(); ctx.shadowColor = '#a5f3fc'; ctx.shadowBlur = 8;
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath(); ctx.arc(flyer.x, flyer.y, 3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        if (flyer.x >= 262) {
          const bi = Math.max(0, Math.min(55, Math.floor((flyer.ty - 40) / 140 * 56)));
          bins[bi]++; count++;
          flyer.x = -1;
        }
      }
      // 探测屏与累积亮点
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(262, 40); ctx.lineTo(262, 180); ctx.stroke();
      ctx.fillStyle = 'rgba(125,211,252,.9)';
      bins.forEach(function (b, i) {
        for (let j = 0; j < Math.min(b, 3); j++) {
          ctx.fillRect(259, 41 + i * 2.5 + j * 0.9, 2.6, 1.1);
        }
      });
      // 强度直方 + 理论 cos² 曲线（金色）
      let bmax = 1; bins.forEach(function (b) { if (b > bmax) bmax = b; });
      ctx.fillStyle = 'rgba(59,130,246,.55)';
      bins.forEach(function (b, i) {
        const bw = b / bmax * 62;
        ctx.fillRect(268, 41 + i * 2.5, bw, 2.1);
      });
      ctx.save();
      ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 4;
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i <= 56; i++) {
        const y = i / 56 * 2 - 1;
        const inten = Math.pow(Math.cos(y * d * 0.36), 2) * Math.exp(-y * y * 2.2);
        const px = 268 + inten * 62, py = 41 + i * 2.5;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke(); ctx.restore();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('已发射电子 ' + count + ' 颗：一颗一颗来，条纹照样出现', 20, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('— 理论 I ∝ cos²(πd·sinθ/λ)：d 越大条纹越密', 150, 196);
      cap(ctx, V, '1961 约恩松 / 1989 外村彰：电子"同时过两条缝"，与自己干涉');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 量子芝诺效应：频繁测量冻结演化 */
  AN.quantumZeno = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const TW = 420; // 一轮帧数
    function survFree(x) { const c = Math.cos(x * Math.PI / 2); return c * c; }
    function survZeno(x, m) {
      if (m <= 0) return survFree(x);
      const step = 1 / m;
      const local = x % step;
      const c = Math.cos(local * Math.PI / 2); return c * c;
    }
    (function loop() {
      const D = (tp && tp.data) || {};
      const m = Math.max(0, Math.min(20, D.m !== undefined ? D.m : 8));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const prog = (t % (TW + 90)) / TW; // 结尾停留 90 帧
      const pc = Math.min(1, prog);
      // 坐标框
      const X0 = 46, Y0 = 42, W = 296, H = 140;
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(X0, Y0, W, H);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('存活概率', X0 - 8, Y0 - 6);
      ctx.fillText('时间 →', X0 + W - 34, Y0 + H + 14);
      // 测量时刻刻度
      if (m > 0) {
        ctx.strokeStyle = 'rgba(251,191,36,.35)';
        for (let i = 1; i < m; i++) {
          const mx = X0 + i / m * W;
          ctx.beginPath(); ctx.moveTo(mx, Y0); ctx.lineTo(mx, Y0 + 6); ctx.stroke();
        }
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('↓ 每次测量把系统"重置"回初态', X0 + 88, Y0 - 6);
      }
      // 两条曲线（画到当前进度）
      ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= pc * 100; i++) {
        const x = i / 100;
        const px = X0 + x * W, py = Y0 + (1 - survFree(x)) * H;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.save();
      ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 5;
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= pc * 100; i++) {
        const x = i / 100;
        const px = X0 + x * W, py = Y0 + (1 - survZeno(x, m)) * H;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke(); ctx.restore();
      // 终点读数
      const sf = survFree(pc), sz = survZeno(pc, m);
      if (pc >= 1) {
        ctx.fillStyle = '#60a5fa'; ctx.font = '10px sans-serif';
        ctx.fillText('不测量：存活 ' + (sf * 100).toFixed(0) + '%', X0 + W - 108, Y0 + H - 8);
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('测 ' + m + ' 次：存活 ' + (sz * 100).toFixed(0) + '%', X0 + W - 108, Y0 + 26);
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('演化窗口内测量 ' + m + ' 次' + (m === 0 ? '（对照：自由衰变）' : ''), 20, 20);
      ctx.fillStyle = '#60a5fa'; ctx.font = '9px sans-serif';
      ctx.fillText('— 不测量：cos² 衰变', X0 + 6, Y0 + 14);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('— 频繁测量：近乎冻结', X0 + 6, Y0 + 26);
      cap(ctx, V, '1977 预言、1989 铍离子证实：盯着看，量子系统"不敢"变');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 量子隧穿与 STM：T ≈ e^(−2κd)，0.1 nm 差约 7 倍 */
  AN.quantumTunnel = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const b = Math.max(0.1, Math.min(1.5, D.b !== undefined ? D.b : 0.5));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const KAP = 10; // κ ≈ 1 Å⁻¹ = 10 nm⁻¹（功函数 ~4 eV）
      const amp = Math.exp(-KAP * b); // 透射振幅
      const Tprob = amp * amp;
      // 上：波函数 vs 势垒
      const base = 86, bw = 6 + b * 56, bx = 150;
      ctx.fillStyle = 'rgba(239,68,68,.28)';
      ctx.fillRect(bx, base - 44, bw, 44);
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, base - 44, bw, 44);
      ctx.fillStyle = '#f87171'; ctx.font = '9px sans-serif';
      ctx.fillText('势垒 ' + b.toFixed(1) + ' nm', bx - 6, base - 50);
      // Ψ(x)：左侧入射+反射，垒内指数衰减，右侧微弱透射
      ctx.save();
      ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 5;
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let x = 16; x <= 344; x += 2) {
        let env;
        if (x < bx) env = 18;
        else if (x < bx + bw) env = 18 * Math.exp(-KAP * (x - bx) / 56);
        else env = 18 * amp;
        const y = base - env * Math.sin(x * 0.5 - t * 0.25);
        if (x === 16) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.restore();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('入射波', 22, base - 26);
      ctx.fillStyle = '#22c55e';
      ctx.fillText('透射波（指数衰减后幸存）', 240, base - 26);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('隧穿概率 T ≈ e^(−2κd) = ' + (Tprob < 0.001 ? Tprob.toExponential(1) : (Tprob * 100).toFixed(1) + '%'), 16, 20);
      // 下：STM 针尖扫描原子列
      const sy = 216;
      const atomX = [60, 130, 200, 270, 330];
      ctx.fillStyle = 'rgba(148,163,184,.5)';
      ctx.fillRect(30, sy, 316, 8);
      atomX.forEach(function (ax) {
        ctx.fillStyle = 'rgba(165,180,252,.85)';
        ctx.beginPath(); ctx.arc(ax, sy - 4, 11, Math.PI, 0); ctx.fill();
      });
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('样品表面原子', 30, sy + 22);
      // 针尖往返扫描
      const tipX = 40 + (0.5 + 0.5 * Math.sin(t * 0.014)) * 296;
      let bump = 0;
      atomX.forEach(function (ax) { bump = Math.max(bump, Math.exp(-Math.pow((tipX - ax) / 14, 2))); });
      const gapPx = 26 * (b / 1.5) + 8 - bump * 10;
      const cur = Math.exp(-2 * KAP * (b + (1 - bump) * 0.15));
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.moveTo(tipX - 9, sy - gapPx - 22); ctx.lineTo(tipX + 9, sy - gapPx - 22); ctx.lineTo(tipX, sy - gapPx); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('STM 针尖', tipX - 20, sy - gapPx - 28);
      // 隧穿电流火花（亮度 ∝ 电流）
      const bright = Math.min(1, cur * 3 + bump * Math.exp(-2 * KAP * b) * 8);
      if (bright > 0.02) {
        ctx.save();
        ctx.shadowColor = '#fde047'; ctx.shadowBlur = 10 * bright;
        ctx.strokeStyle = 'rgba(253,224,71,' + Math.min(1, bright) + ')'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(tipX, sy - gapPx);
        ctx.lineTo(tipX - 3, sy - gapPx / 2); ctx.lineTo(tipX + 2, sy - gapPx / 3); ctx.lineTo(tipX, sy - 12);
        ctx.stroke(); ctx.restore();
      }
      // 电流-位置图像（原子分辨）
      ctx.strokeStyle = 'rgba(148,163,184,.35)'; ctx.lineWidth = 1;
      ctx.strokeRect(30, 122, 316, 34);
      ctx.save();
      ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 4;
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let x = 0; x <= 316; x += 2) {
        let bb = 0;
        atomX.forEach(function (ax) { bb = Math.max(bb, Math.exp(-Math.pow((30 + x - ax) / 14, 2))); });
        const y = 152 - bb * Math.exp(-2 * KAP * b) * 3e3;
        if (x === 0) ctx.moveTo(30 + x, Math.max(124, y)); else ctx.lineTo(30 + x, Math.max(124, y));
      }
      ctx.stroke(); ctx.restore();
      ctx.fillStyle = '#fbbf24'; ctx.font = '9px sans-serif';
      ctx.fillText('隧穿电流图像 I(x)：峰 = 一个个原子', 34, 118);
      cap(ctx, V, '1981 STM：距离每近 0.1 nm 电流约 ×7——原子被"摸"出来');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* BB84 量子密钥分发：窃听必引入约 25% 误码 */
  AN.bb84Qkd = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const N = 12;
    function rnd(i, salt) { const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453; return x - Math.floor(x); }
    (function loop() {
      const D = (tp && tp.data) || {};
      const e = Math.max(0, Math.min(100, D.e !== undefined ? D.e : 0));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const ef = e / 100;
      // 三方位置
      ctx.fillStyle = '#60a5fa'; ctx.font = 'bold 11px sans-serif';
      ctx.fillText('爱丽丝', 18, 32);
      ctx.fillStyle = '#22c55e';
      ctx.fillText('鲍勃', 310, 32);
      ctx.fillStyle = e > 0 ? '#ef4444' : '#475569';
      ctx.fillText('伊芙' + (e > 0 ? '（窃听 ' + e + '%）' : '（未窃听）'), 158, 32);
      ctx.strokeStyle = 'rgba(148,163,184,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(30, 76); ctx.lineTo(330, 76); ctx.stroke();
      // 光子传送带
      for (let i = 0; i < N; i++) {
        const pos = ((t * 0.9 + i * 30) % 360);
        if (pos < 30 || pos > 330) continue;
        const bit = rnd(i, 1) < 0.5 ? 0 : 1;
        const bas = rnd(i, 2) < 0.5 ? '+' : '×';
        const eveHit = pos > 150 && pos < 190 && rnd(i, 3) < ef;
        ctx.fillStyle = bit ? '#fbbf24' : '#22d3ee';
        ctx.beginPath(); ctx.arc(pos, 76, 3, 0, Math.PI * 2); ctx.fill();
        // 偏振方向箭头
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1.2;
        const ang = bas === '+' ? (bit ? 0 : Math.PI / 2) : (bit ? Math.PI / 4 : -Math.PI / 4);
        ctx.beginPath();
        ctx.moveTo(pos - 6 * Math.cos(ang), 76 - 6 * Math.sin(ang));
        ctx.lineTo(pos + 6 * Math.cos(ang), 76 + 6 * Math.sin(ang));
        ctx.stroke();
        if (eveHit) {
          ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5;
          ctx.strokeRect(pos - 7, 66, 14, 20);
        }
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('每颗光子：随机偏振（基 + 或 ×）', 116, 60);
      // 筛后密钥表
      ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
      ctx.fillText('筛后密钥（双方选基一致才保留）：', 18, 116);
      let kept = 0, errs = 0;
      const cells = [];
      for (let i = 0; i < N && kept < 16; i++) {
        const aBas = rnd(i, 2) < 0.5, bBas = rnd(i, 4) < 0.5;
        if (aBas !== bBas) continue; // 选基不一致：丢弃
        const bit = rnd(i, 1) < 0.5 ? 1 : 0;
        let err = false;
        if (rnd(i, 3) < ef && rnd(i, 5) < 0.5 && rnd(i, 6) < 0.5) err = true; // 伊芙拦截 → 25% 出错
        cells.push({ bit: err ? 1 - bit : bit, err: err });
        kept++; if (err) errs++;
      }
      cells.forEach(function (c, i) {
        const x = 20 + (i % 8) * 40, y = 128 + Math.floor(i / 8) * 34;
        ctx.fillStyle = c.err ? 'rgba(239,68,68,.3)' : 'rgba(34,197,94,.22)';
        ctx.fillRect(x, y, 30, 26);
        ctx.strokeStyle = c.err ? '#ef4444' : '#22c55e'; ctx.lineWidth = 1.2;
        ctx.strokeRect(x, y, 30, 26);
        ctx.fillStyle = c.err ? '#f87171' : '#4ade80';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(String(c.bit), x + 11, y + 18);
        if (c.err) {
          ctx.fillStyle = '#ef4444'; ctx.font = '9px sans-serif';
          ctx.fillText('错', x + 22, y + 9);
        }
      });
      const rate = kept ? errs / kept * 100 : 0;
      ctx.fillStyle = rate > 11 ? '#f87171' : '#4ade80'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText('误码率 ≈ ' + rate.toFixed(0) + '%（理论 ' + (ef * 25).toFixed(0) + '%）→ ' + (rate > 11 ? '暴露！中止换钥' : '安全：可成钥'), 18, 216);
      cap(ctx, V, '1984 BB84：测不准原理让窃听必留指纹（2016 墨子号星地分发）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 玻色-爱因斯坦凝聚：跨过 Tc，速度分布收成尖峰 */
  AN.boseCondensate = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const seeds = [];
    for (let i = 0; i < 40; i++) seeds.push({ a: Math.random() * 2 - 1, b: Math.random() * 2 - 1, p: Math.random() * Math.PI * 2 });
    const TC = 170;
    (function loop() {
      const D = (tp && tp.data) || {};
      const temp = Math.max(10, Math.min(500, D.temp !== undefined ? D.temp : 100));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const frac = temp < TC ? Math.max(0, 1 - Math.pow(temp / TC, 3)) : 0;
      const cx = 105, cyb = 168;
      // 磁阱抛物线
      ctx.strokeStyle = 'rgba(148,163,184,.6)'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = -90; x <= 90; x += 4) {
        const y = cyb - Math.pow(x / 90, 2) * 110;
        if (x === -90) ctx.moveTo(cx + x, y); else ctx.lineTo(cx + x, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('磁阱', cx + 70, cyb - 96);
      // 原子云：凝聚体沉底发光，热原子弥散
      const sig = 12 + Math.sqrt(temp / TC) * 52;
      const nCon = Math.round(seeds.length * frac);
      seeds.forEach(function (s, i) {
        let x, y, col, r;
        if (i < nCon) { // 凝聚体：同相、挤在阱底
          x = cx + Math.sin(t * 0.02 + s.p) * 7 * (0.4 + Math.abs(s.a));
          y = cyb - 6 - Math.abs(s.b) * 7;
          col = 'rgba(251,191,36,.9)'; r = 2.6;
        } else { // 热原子：各自乱跳
          const jit = Math.sqrt(temp / TC);
          x = cx + s.a * sig + Math.sin(t * 0.11 * jit + s.p) * 6 * jit;
          y = cyb - 30 - s.b * sig * 0.6 + Math.cos(t * 0.13 * jit + s.p) * 5 * jit;
          col = 'rgba(96,165,250,.75)'; r = 2;
        }
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(x, Math.max(50, y), r, 0, Math.PI * 2); ctx.fill();
      });
      if (frac > 0.05) { // 凝聚体辉光
        ctx.save();
        ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 22;
        ctx.fillStyle = 'rgba(251,191,36,.35)';
        ctx.beginPath(); ctx.arc(cx, cyb - 9, 14, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      // 右侧速度分布
      const X0 = 226, Y0 = 46, W = 118, H = 130;
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(X0, Y0, W, H);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('速度分布', X0 + 38, Y0 - 5);
      const sv = 8 + Math.sqrt(temp / TC) * 34;
      ctx.fillStyle = 'rgba(96,165,250,.5)';
      ctx.beginPath(); ctx.moveTo(X0, Y0 + H);
      for (let x = 0; x <= W; x += 2) {
        const v = (x - W / 2);
        const g = (1 - frac) * Math.exp(-v * v / (2 * sv * sv));
        ctx.lineTo(X0 + x, Y0 + H - g * H * 0.8);
      }
      ctx.lineTo(X0 + W, Y0 + H); ctx.closePath(); ctx.fill();
      if (frac > 0.02) { // 凝聚尖峰
        ctx.save();
        ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 6;
        ctx.fillStyle = 'rgba(251,191,36,.9)';
        const spw = 5;
        ctx.fillRect(X0 + W / 2 - spw / 2, Y0 + H - frac * H * 0.92 - 6, spw, frac * H * 0.92 + 6);
        ctx.restore();
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('T = ' + temp + ' nK（Tc = ' + TC + ' nK）→ ' + (frac > 0 ? '凝聚体 ' + Math.round(frac * 100) + '%' : '尚未凝聚'), 16, 20);
      ctx.fillStyle = frac > 0 ? '#fbbf24' : '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText(frac > 0 ? '数千原子共用一个波函数——"超级原子"' : '原子各自为政：普通热气体', 80, 210);
      cap(ctx, V, '1995 铷原子 170 nK：高斯分布骤然收成尖峰（2001 诺奖）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 量子悬浮：磁通钉扎——推得动，回得来；普通磁体一推就翻 */
  AN.quantumLevitate = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const b = Math.max(10, Math.min(100, D.b !== undefined ? D.b : 70));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const push = Math.max(0, Math.sin(t * 0.012)); // 周期性推一下
      const stiff = b / 100;
      // 左侧：磁轨 + 悬浮超导体
      ctx.fillStyle = '#334155'; ctx.fillRect(20, 190, 200, 16);
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 ? '#ef4444' : '#3b82f6';
        ctx.fillRect(22 + i * 24.5, 192, 20, 12);
        ctx.fillStyle = '#0f172a'; ctx.font = '8px sans-serif';
        ctx.fillText(i % 2 ? 'N' : 'S', 28 + i * 24.5, 201);
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('永磁轨道', 24, 222);
      // 磁通量子线（数量 ∝ 场强），钉扎穿过圆片
      const dx0 = 120 + push * 46 * (1.1 - stiff);
      const dy0 = 128 + push * 6 * (1.1 - stiff);
      const nfl = Math.max(1, Math.round(b / 12));
      ctx.setLineDash([4, 3]);
      for (let i = 0; i < nfl; i++) {
        const fx = dx0 - 36 + i * (72 / Math.max(1, nfl - 1));
        ctx.strokeStyle = 'rgba(251,191,36,.7)'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(fx, 190); ctx.lineTo(fx, dy0 - 16); ctx.stroke();
      }
      ctx.setLineDash([]);
      // 超导体圆片
      ctx.save();
      ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 12;
      ctx.fillStyle = '#155e75';
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(dx0, dy0, 44, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#a5f3fc'; ctx.font = '9px sans-serif';
      ctx.fillText('II 型超导体', dx0 - 28, dy0 + 3);
      // 推动箭头
      if (push > 0.25) {
        ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(dx0 - 66, dy0); ctx.lineTo(dx0 - 50, dy0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(dx0 - 50, dy0); ctx.lineTo(dx0 - 56, dy0 - 4); ctx.moveTo(dx0 - 50, dy0); ctx.lineTo(dx0 - 56, dy0 + 4); ctx.stroke();
      }
      ctx.fillStyle = stiff > 0.4 ? '#4ade80' : '#f87171'; ctx.font = '10px sans-serif';
      ctx.fillText(stiff > 0.4 ? '钉扎力强：推偏也能自动回位' : '钉扎力弱：漂移失稳', 26, 40);
      // 右上：倒挂演示
      ctx.fillStyle = '#334155'; ctx.fillRect(240, 40, 104, 12);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('倒挂也稳', 268, 34);
      if (stiff > 0.4) {
        ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(251,191,36,.7)';
        for (let i = 0; i < 4; i++) {
          ctx.beginPath(); ctx.moveTo(256 + i * 24, 52); ctx.lineTo(256 + i * 24, 88); ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.fillStyle = '#155e75'; ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(292, 92, 34, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      } else {
        ctx.fillStyle = '#64748b';
        ctx.beginPath(); ctx.ellipse(292, 128, 30, 8, 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f87171';
        ctx.fillText('滑落', 306, 132);
      }
      // 右下：普通磁体对照（恩肖失稳，翻倒）
      ctx.fillStyle = 'rgba(148,163,184,.15)'; ctx.fillRect(240, 148, 104, 74);
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.strokeRect(240, 148, 104, 74);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('普通磁体对照', 254, 160);
      const flip = Math.min(1, push * 1.6) * 0.9;
      ctx.save();
      ctx.translate(292, 196); ctx.rotate(flip);
      ctx.fillStyle = '#64748b'; ctx.fillRect(-16, -7, 32, 14);
      ctx.fillStyle = '#ef4444'; ctx.fillRect(-16, -7, 16, 14);
      ctx.restore();
      ctx.fillStyle = '#f87171'; ctx.font = '9px sans-serif';
      ctx.fillText(flip > 0.4 ? '一推就翻！' : '（恩肖定理：无法稳定悬浮）', 246, 218);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('场强 ' + b + '% → 钉扎磁通线 ' + nfl + ' 束', 20, 20);
      cap(ctx, V, 'Φ₀ = h/2e 被缺陷钉扎：可悬可挂、自动回位——恩肖定理管不着');
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
