/* explore-anim5_2.js — 第三批动画引擎（材料树 12 个专属原理动画） */
(function () {
  window.ExploreAnim = window.ExploreAnim || {};
  const AN = window.ExploreAnim;
  function mkCanvas(holder, w, h, dark) {
    const c = document.createElement('canvas');
    c.style.cssText = 'width:100%;max-width:' + w + 'px;border-radius:8px;display:block;background:' + (dark ? '#0f172a' : '#fff');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = w * dpr; c.height = h * dpr;
    const ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    holder.appendChild(c);
    return { c: c, ctx: ctx, w: w, h: h };
  }
  function cap(ctx, V, text) { ctx.fillStyle = '#94a3b8'; ctx.font = '10.5px sans-serif'; ctx.fillText(text, 10, V.h - 7); }
  function s01(i, s) { const v = Math.sin(i * 127.1 + (s || 0) * 311.7) * 43758.5453; return v - Math.floor(v); }

  /* 青铜冶炼：锡置换进铜晶格，硬度与熔点随锡含量变化 */
  AN.bronze = function (holder, tp) {
    const V = mkCanvas(holder, 360, 240, true);
    const D = (tp && tp.data) || {};
    let t = 0;
    (function loop() {
      const sn = Math.max(0, Math.min(30, D.sn !== undefined ? D.sn : 10));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('锡 ' + sn + '%：浅色原子 = 锡，置换进铜的晶格', 14, 18);
      let snCount = 0;
      for (let i = 0; i < 54; i++) {
        const gx = 26 + (i % 9) * 17, gy = 44 + Math.floor(i / 9) * 17;
        const isSn = s01(i, 7) < sn / 100;
        if (isSn) snCount++;
        const jx = Math.sin(t * 0.15 + i) * 0.8, jy = Math.cos(t * 0.13 + i * 2) * 0.8;
        ctx.fillStyle = isSn ? '#e2e8f0' : '#d97706';
        ctx.beginPath(); ctx.arc(gx + jx, gy + jy, isSn ? 6 : 5, 0, Math.PI * 2); ctx.fill();
      }
      const hard = 40 + 5 * sn;               // 近似布氏硬度 HB
      const melt = Math.round(1083 - 7 * sn); // 液相线近似 °C
      ctx.fillStyle = '#475569'; ctx.font = '10px sans-serif';
      ctx.fillText('硬度（HB）', 200, 44);
      ctx.fillStyle = '#1e293b'; ctx.fillRect(200, 50, 90, 14);
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(200, 50, Math.min(90, hard / 200 * 90), 14);
      ctx.fillStyle = '#e2e8f0'; ctx.fillText('≈ ' + hard, 296, 61);
      ctx.fillStyle = '#475569';
      ctx.fillText('熔炼温度 ≈ ' + melt + '°C', 200, 92);
      ctx.fillText('（纯铜 1083°C）', 200, 106);
      ctx.fillStyle = sn >= 20 ? '#f87171' : sn === 0 ? '#fbbf24' : '#4ade80';
      ctx.font = '10.5px sans-serif';
      ctx.fillText(sn >= 20 ? '锡太多：太脆，只能铸钟' : sn === 0 ? '纯铜：太软，做不了利器' : '强韧均衡：工具与兵器的时代', 200, 140);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9.5px sans-serif';
      ctx.fillText('晶格中锡原子 ' + snCount + ' / 54', 200, 162);
      cap(ctx, V, '青铜时代：材料第一次成为文明分期的名字');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 高炉炼铁：炉料下降、CO 上升还原、铁水与炉渣分层 */
  AN.blastFurnace = function (holder, tp) {
    const V = mkCanvas(holder, 360, 260, true);
    const lumps = [], gas = [];
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(150, 30); ctx.lineTo(210, 30);
      ctx.lineTo(255, 160); ctx.lineTo(235, 210); ctx.lineTo(235, 240);
      ctx.lineTo(125, 240); ctx.lineTo(125, 210); ctx.lineTo(105, 160);
      ctx.closePath(); ctx.stroke();
      ctx.lineWidth = 1;
      if (t % 12 === 0 && lumps.length < 40) lumps.push({ x: 152 + s01(t, 1) * 56, y: 34, ore: lumps.length % 2 === 0 });
      lumps.forEach(function (L) {
        L.y += 0.35;
        const spread = (L.y - 30) / 130;
        const cx = 180 + (L.x - 180) * (1 + spread * 0.7);
        ctx.fillStyle = L.ore ? '#b91c1c' : '#1c1917';
        ctx.strokeStyle = '#44403c';
        ctx.beginPath(); ctx.arc(cx, L.y, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });
      for (let i = lumps.length - 1; i >= 0; i--) if (lumps[i].y > 195) lumps.splice(i, 1);
      if (t % 7 === 0) gas.push({ x: 130 + s01(t, 2) * 100, y: 208 });
      gas.forEach(function (g) {
        g.y -= 1.1; g.x += Math.sin(g.y * 0.1) * 0.6;
        ctx.fillStyle = 'rgba(251,191,36,.55)';
        ctx.beginPath(); ctx.arc(g.x, g.y, 2.2, 0, Math.PI * 2); ctx.fill();
      });
      for (let i = gas.length - 1; i >= 0; i--) if (gas[i].y < 36) gas.splice(i, 1);
      for (let s = -1; s <= 1; s += 2) {
        const fx = s < 0 ? 96 : 264, tx2 = s < 0 ? 128 : 232;
        const fl = 6 + Math.sin(t * 0.6 + s) * 4;
        ctx.strokeStyle = '#f97316'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(fx, 218); ctx.lineTo(tx2 + s * fl, 218); ctx.stroke();
        ctx.lineWidth = 1;
      }
      ctx.fillStyle = '#f59e0b'; ctx.fillRect(128, 226, 104, 14);
      ctx.fillStyle = '#fde68a'; ctx.fillRect(128, 220, 104, 6);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
      ctx.fillText('炉顶：矿石 + 焦炭', 10, 30);
      ctx.fillText('CO 上升，逐级还原 Fe₂O₃→Fe', 10, 110);
      ctx.fillText('热风 ≈1200°C', 10, 218);
      ctx.fillText('炉渣', 245, 224);
      ctx.fillText('铁水（含碳≈4%）', 245, 238);
      cap(ctx, V, '焦炭 + 热风 → CO，把氧从铁矿石里夺回来');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 玻璃：慢冷结晶 vs 快冷冻结成无序网络 */
  AN.glassCool = function (holder, tp) {
    const V = mkCanvas(holder, 360, 240, true);
    const D = (tp && tp.data) || {};
    const N = 48, start = [], grid = [];
    for (let i = 0; i < N; i++) {
      start.push({ x: 30 + s01(i, 3) * 300, y: 40 + s01(i, 4) * 150 });
      grid.push({ x: 42 + (i % 8) * 40, y: 55 + Math.floor(i / 8) * 26 });
    }
    let t = 0;
    (function loop() {
      const rate = Math.max(1, Math.min(10, D.rate !== undefined ? D.rate : 8));
      const slow = rate <= 5;
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const k = Math.min(1, (t % 300) / 240);
      const pts = [];
      for (let i = 0; i < N; i++) {
        const ease = slow ? k : Math.min(0.08, k);
        const jig = (1 - k) * 3 * (slow ? 1 : 1.6);
        pts.push({
          x: start[i].x + (grid[i].x - start[i].x) * ease + Math.sin(t * 0.2 + i) * jig,
          y: start[i].y + (grid[i].y - start[i].y) * ease + Math.cos(t * 0.17 + i * 3) * jig
        });
      }
      ctx.strokeStyle = 'rgba(148,163,184,.35)';
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        if (dx * dx + dy * dy < 1150) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        }
      }
      for (let i = 0; i < N; i++) {
        ctx.fillStyle = slow ? '#38bdf8' : '#fbbf24';
        ctx.beginPath(); ctx.arc(pts[i].x, pts[i].y, 3.4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('冷却速率 ' + rate + '：' + (slow ? '慢冷 → 原子来得及排队 → 石英晶体' : '快冷 → 来不及排队被冻住 → 玻璃'), 14, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText(slow ? '长程有序（周期性排列）' : '长程无序、短程有序（过冷液体）', 14, 214);
      cap(ctx, V, '玻璃化转变是动力学过程，不是相变');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 水泥水化：C-S-H 凝胶藤蔓生长，水灰比决定孔隙与强度 */
  AN.cementHydrate = function (holder, tp) {
    const V = mkCanvas(holder, 360, 240, true);
    const D = (tp && tp.data) || {};
    const grains = [];
    for (let i = 0; i < 6; i++) grains.push({ x: 40 + s01(i, 5) * 190, y: 45 + s01(i, 6) * 140, r: 12 + s01(i, 7) * 7 });
    let t = 0;
    (function loop() {
      const wc = Math.max(0.3, Math.min(0.7, D.wc !== undefined ? D.wc : 0.45));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      ctx.fillStyle = 'rgba(37,99,235,' + (0.06 + (wc - 0.3) * 0.25) + ')';
      ctx.fillRect(8, 30, 250, 190);
      const h = (t % 480) / 480;
      grains.forEach(function (g, gi) {
        for (let k = 0; k < 8; k++) {
          const a = k * Math.PI / 4 + s01(gi * 9 + k, 8) * 0.5;
          const len = h * (22 + s01(gi * 9 + k, 9) * 16);
          ctx.strokeStyle = 'rgba(134,239,172,.75)'; ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(g.x + g.r * Math.cos(a), g.y + g.r * Math.sin(a));
          ctx.quadraticCurveTo(
            g.x + (g.r + len * 0.6) * Math.cos(a + 0.3), g.y + (g.r + len * 0.6) * Math.sin(a + 0.3),
            g.x + (g.r + len) * Math.cos(a), g.y + (g.r + len) * Math.sin(a));
          ctx.stroke();
        }
      });
      ctx.lineWidth = 1;
      grains.forEach(function (g) {
        ctx.fillStyle = '#57534e';
        ctx.beginPath(); ctx.arc(g.x, g.y, g.r * (1 - h * 0.35), 0, Math.PI * 2); ctx.fill();
      });
      const pores = Math.round((wc - 0.3) / 0.4 * 26);
      for (let i = 0; i < pores; i++) {
        ctx.fillStyle = '#0f172a'; ctx.strokeStyle = '#334155';
        ctx.beginPath(); ctx.arc(20 + s01(i, 10) * 220, 42 + s01(i, 11) * 168, 2.5 + s01(i, 12) * 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      const S = (1 - 1.6 * (wc - 0.3)) * Math.pow(h, 0.6);
      ctx.fillStyle = '#475569'; ctx.font = '10px sans-serif';
      ctx.fillText('强度发展', 285, 44);
      ctx.fillStyle = '#1e293b'; ctx.fillRect(285, 52, 55, 130);
      ctx.fillStyle = '#4ade80';
      const bh = Math.min(130, S * 130);
      ctx.fillRect(285, 182 - bh, 55, bh);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('水灰比 ' + wc.toFixed(2) + ' → 孔隙 ' + pores + ' 个', 14, 20);
      cap(ctx, V, 'C-S-H 凝胶把颗粒缠成整体：水少则密、水多则孔多');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 淬火：快冷得马氏体（硬而脆），慢冷得珠光体（软而韧） */
  AN.quench = function (holder, tp) {
    const V = mkCanvas(holder, 360, 250, true);
    const D = (tp && tp.data) || {};
    let t = 0;
    (function loop() {
      const cool = Math.max(1, Math.min(10, D.cool !== undefined ? D.cool : 9));
      const fast = cool >= 6;
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const ph = t % 560;
      ctx.fillStyle = 'rgba(37,99,235,.35)'; ctx.fillRect(20, 150, 150, 84);
      ctx.strokeStyle = '#475569'; ctx.strokeRect(20, 150, 150, 84);
      const inWater = ph > 110;
      const barY = inWater ? Math.min(90, 20 + (ph - 110) * 1.2) : 20;
      const heat = inWater ? Math.max(0, 1 - (ph - 110) * 0.004 * cool) : 1;
      ctx.fillStyle = 'rgb(' + Math.round(100 + heat * 149) + ',' + Math.round(80 + heat * 50) + ',' + Math.round(90 - heat * 40) + ')';
      ctx.fillRect(80, barY, 26, 110);
      ctx.strokeStyle = '#64748b'; ctx.strokeRect(80, barY, 26, 110);
      if (inWater && heat > 0.15) {
        for (let i = 0; i < 6; i++) {
          const bx = 84 + s01(i + Math.floor(t / 5), 13) * 20, by = 200 - ((t * 2 + i * 31) % 60);
          ctx.fillStyle = 'rgba(226,232,240,' + heat * 0.7 + ')';
          ctx.beginPath(); ctx.arc(bx, by, 2, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
      ctx.fillText(ph <= 110 ? '奥氏体化 ≈800°C' : heat > 0.4 ? '水淬！蒸汽膜翻腾' : '冷却完成', 30, 16);
      ctx.strokeStyle = '#334155'; ctx.strokeRect(195, 30, 150, 120);
      if (fast) {
        for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) {
          const gx = 210 + c * 20 + r * 4, gy = 42 + r * 18;
          ctx.fillStyle = '#93c5fd';
          ctx.beginPath(); ctx.arc(gx, gy, 3, 0, Math.PI * 2); ctx.fill();
          if (s01(r * 7 + c, 14) < 0.3) {
            ctx.fillStyle = '#f87171';
            ctx.beginPath(); ctx.arc(gx + 8, gy + 7, 2, 0, Math.PI * 2); ctx.fill();
          }
        }
        ctx.fillStyle = '#f87171'; ctx.font = '10px sans-serif';
        ctx.fillText('马氏体：碳被冻在畸变晶格里', 200, 166);
        ctx.fillText('极硬，但脆', 245, 180);
      } else {
        for (let r = 0; r < 10; r++) {
          ctx.fillStyle = r % 2 ? '#475569' : '#94a3b8';
          ctx.fillRect(200, 36 + r * 11, 140, 7);
        }
        ctx.fillStyle = '#4ade80'; ctx.font = '10px sans-serif';
        ctx.fillText('珠光体层片：铁素体+渗碳体', 200, 166);
        ctx.fillText('软而韧', 255, 180);
      }
      const H = 20 + cool * 4.5;
      ctx.fillStyle = '#475569'; ctx.fillText('硬度', 195, 206);
      ctx.fillStyle = '#1e293b'; ctx.fillRect(230, 197, 110, 10);
      ctx.fillStyle = fast ? '#f87171' : '#4ade80';
      ctx.fillRect(230, 197, H / 70 * 110, 10);
      ctx.fillStyle = '#e2e8f0'; ctx.fillText('冷却速度 ' + cool, 195, 228);
      cap(ctx, V, '快冷：扩散被冻结 → 马氏体；慢冷：碳析出 → 珠光体');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 聚合反应：乙烯单体逐个接入，链长决定强度 */
  AN.polymer = function (holder, tp) {
    const V = mkCanvas(holder, 360, 240, true);
    const D = (tp && tp.data) || {};
    let t = 0, chain = [], ang = 0, fade = 0;
    (function loop() {
      const nT = Math.max(5, Math.min(60, Math.round(D.n !== undefined ? D.n : 25)));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      if (t % 9 === 0 && chain.length < nT && fade === 0) {
        ang += (s01(chain.length, 15) - 0.5) * 1.2;
        const last = chain.length ? chain[chain.length - 1] : { x: 24, y: 130 };
        let nx = last.x + 9 * Math.cos(ang), ny = last.y + 9 * Math.sin(ang);
        if (nx > 345) { ang = Math.PI - ang; nx = 345; }
        if (nx < 15) { ang = Math.PI - ang; nx = 15; }
        if (ny > 195) { ang = -ang; ny = 195; }
        if (ny < 40) { ang = -ang; ny = 40; }
        chain.push({ x: nx, y: ny });
      }
      const alpha = fade > 0 ? Math.max(0, 1 - fade / 40) : 1;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
      ctx.beginPath();
      chain.forEach(function (p, i) { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
      ctx.stroke();
      ctx.lineWidth = 1;
      chain.forEach(function (p, i) {
        ctx.fillStyle = i % 2 ? '#7dd3fc' : '#38bdf8';
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      for (let i = 0; i < 3; i++) {
        const mx = 300 + s01(i, 16) * 40 + Math.sin(t * 0.05 + i * 2) * 6;
        const my = 60 + i * 30 + Math.cos(t * 0.04 + i) * 5;
        ctx.strokeStyle = '#64748b';
        ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + 10, my); ctx.stroke();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(mx, my, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(mx + 10, my, 3, 0, Math.PI * 2); ctx.fill();
      }
      if (chain.length >= nT) fade++;
      if (fade > 120) { chain = []; fade = 0; ang = 0; }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('乙烯单体 → 聚乙烯链：聚合度 ' + chain.length + ' / ' + nT, 14, 18);
      if (chain.length >= nT) {
        const S = Math.sqrt(nT / 60);
        ctx.fillStyle = '#475569'; ctx.font = '10px sans-serif';
        ctx.fillText('相对强度', 14, 210);
        ctx.fillStyle = '#1e293b'; ctx.fillRect(70, 202, 120, 9);
        ctx.fillStyle = '#4ade80'; ctx.fillRect(70, 202, S * 120, 9);
      }
      cap(ctx, V, '双键打开、首尾相接：链越长越难滑动，强度越高');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 硅提纯与直拉单晶：提纯阶梯 + 籽晶提拉，拉速过快出位错 */
  AN.siliconPull = function (holder, tp) {
    const V = mkCanvas(holder, 360, 250, true);
    const D = (tp && tp.data) || {};
    const steps = ['石英砂 SiO₂', '碳还原 → 冶金硅 98%', 'HCl → SiHCl₃ 精馏', 'H₂ 还原 → 多晶硅 11N', '直拉单晶 → 晶圆'];
    let t = 0;
    (function loop() {
      const pull = Math.max(1, Math.min(10, D.pull !== undefined ? D.pull : 4));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      steps.forEach(function (s, i) {
        const y = 34 + i * 34;
        const active = Math.floor(t / 50) % steps.length === i;
        ctx.fillStyle = active ? '#1e3a8a' : '#1e293b';
        ctx.fillRect(10, y - 12, 150, 22);
        ctx.strokeStyle = '#334155'; ctx.strokeRect(10, y - 12, 150, 22);
        ctx.fillStyle = active ? '#bfdbfe' : '#94a3b8'; ctx.font = '9.5px sans-serif';
        ctx.fillText(s, 16, y + 2);
        if (i < steps.length - 1) {
          ctx.strokeStyle = '#475569';
          ctx.beginPath(); ctx.moveTo(85, y + 10); ctx.lineTo(85, y + 22); ctx.stroke();
        }
      });
      const meltY = 205;
      ctx.fillStyle = '#78350f'; ctx.fillRect(215, meltY, 110, 30);
      ctx.strokeStyle = '#a8a29e'; ctx.strokeRect(215, meltY, 110, 30);
      ctx.fillStyle = '#fb923c';
      ctx.beginPath(); ctx.ellipse(270, meltY + 3, 52, 7 + Math.sin(t * 0.1) * 1.5, 0, 0, Math.PI * 2); ctx.fill();
      const cyc = (t * pull * 0.06) % 150;
      const rodH = Math.min(120, cyc);
      const hold = cyc > 135;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(258, meltY - rodH, 24, rodH);
      ctx.fillStyle = 'rgba(56,189,248,' + (0.3 + 0.3 * Math.sin(t * 0.4)) + ')';
      ctx.fillRect(258 + (t % 20), meltY - rodH, 3, rodH);
      if (pull >= 7 && rodH > 30) {
        ctx.strokeStyle = '#f87171'; ctx.lineWidth = 1.5;
        for (let i = 0; i < Math.floor(rodH / 25); i++) {
          const dx = 262 + s01(i, 17) * 16, dy = meltY - 15 - i * 24;
          ctx.beginPath(); ctx.moveTo(dx - 3, dy - 3); ctx.lineTo(dx + 3, dy + 3);
          ctx.moveTo(dx + 3, dy - 3); ctx.lineTo(dx - 3, dy + 3); ctx.stroke();
        }
        ctx.lineWidth = 1;
      }
      ctx.fillStyle = '#64748b'; ctx.fillRect(262, meltY - rodH - 14, 16, 12);
      ctx.fillStyle = pull >= 7 ? '#f87171' : '#e2e8f0'; ctx.font = '10px sans-serif';
      ctx.fillText(pull >= 7 ? '拉速过快 → 位错缺陷！' : hold ? '单晶硅棒完成' : '籽晶边旋转边上提', 175, 20);
      ctx.fillStyle = pull >= 7 ? '#f87171' : '#4ade80';
      ctx.fillText('纯度 99.999999999%', 175, 36);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('熔硅 1414°C', 232, 246);
      cap(ctx, V, '直拉法（CZ）：十一个 9 的纯度，还要零缺陷');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 碳纤维：PAN 链稳定化 → 碳化赶走 N/H/O → 石墨微晶带 */
  AN.carbonFiber = function (holder, tp) {
    const V = mkCanvas(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const ph = (t % 480) / 480;
      const chainY = 60;
      ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i <= 14; i++) {
        const x = 20 + i * 16, y = chainY + (i % 2 ? -7 : 7);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.lineWidth = 1;
      for (let i = 0; i <= 14; i += 2) {
        const x = 20 + i * 16, y = chainY + (i % 2 ? -7 : 7);
        const leaving = ph > 0.45;
        const fly = leaving ? (ph - 0.45) * 60 : 0;
        ctx.fillStyle = 'rgba(96,165,250,' + (leaving ? Math.max(0, 1 - fly / 40) : 1) + ')';
        ctx.beginPath(); ctx.arc(x, y - 14 - fly, 3, 0, Math.PI * 2); ctx.fill();
        if (!leaving) { ctx.fillStyle = '#94a3b8'; ctx.font = '8px sans-serif'; ctx.fillText('N', x - 2, y - 20); }
      }
      const ribY = 150, grow = Math.max(0, ph - 0.55) / 0.45;
      ctx.strokeStyle = '#4ade80';
      const cols = Math.floor(grow * 11);
      for (let cx = 0; cx < cols; cx++) {
        for (let cy = 0; cy < 3; cy++) {
          const hx = 26 + cx * 22, hy = ribY + cy * 19 + (cx % 2) * 9;
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = k * Math.PI / 3;
            const px = hx + 11 * Math.cos(a), py = hy + 11 * Math.sin(a);
            if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.closePath(); ctx.stroke();
        }
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
      ctx.fillText(ph < 0.45 ? '① 稳定化 200-300°C：分子链环化' : '② 碳化 1000-1500°C：赶走 N、H、O', 20, 26);
      ctx.fillText('石墨微晶沿纤维轴排列（含碳 >90%）', 20, 205);
      ctx.fillStyle = '#475569'; ctx.font = '9px sans-serif';
      ctx.fillText('比强度', 285, 40);
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(285, 46, 60, 8);
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(285, 58, 14, 8);
      ctx.fillStyle = '#475569';
      ctx.fillText('密度', 285, 84);
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(285, 90, 11, 8);
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(285, 102, 48, 8);
      ctx.fillStyle = '#94a3b8'; ctx.font = '8.5px sans-serif';
      ctx.fillText('碳纤维 1.8 vs 钢 7.8 g/cm³', 252, 126);
      cap(ctx, V, '一束黑丝：强度≈钢×5，重量只有 1/4');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 形状记忆合金：低温孪晶马氏体可弯折，加热恢复奥氏体形状 */
  AN.shapeMemory = function (holder, tp) {
    const V = mkCanvas(holder, 360, 240, true);
    const D = (tp && tp.data) || {};
    let t = 0, m = 0;
    (function loop() {
      const temp = Math.max(-20, Math.min(100, D.temp !== undefined ? D.temp : 25));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      if (temp < 40) m = Math.max(0, m - 0.02);
      else if (temp > 60) m = Math.min(1, m + 0.02);
      const seg = 26, x0 = 40, x1 = 320, cy = 155;
      ctx.strokeStyle = temp > 60 ? '#fb923c' : temp < 40 ? '#60a5fa' : '#a78bfa';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i <= seg; i++) {
        const x = x0 + (x1 - x0) * i / seg;
        const bent = (i % 2 ? -1 : 1) * 26 * (1 - m) * Math.sin(Math.PI * i / seg);
        const spring = Math.sin(t * 0.5 + i * 0.6) * 8 * m * (1 - m);
        const y = cy + bent + spring;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.lineWidth = 1;
      ctx.strokeStyle = '#334155'; ctx.strokeRect(20, 24, 130, 70);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
        const gx = 32 + c * 20, gy = 34 + r * 20;
        const slant = (r % 2 ? -1 : 1) * 7 * (1 - m);
        ctx.strokeStyle = '#64748b';
        ctx.beginPath();
        ctx.moveTo(gx + slant, gy); ctx.lineTo(gx + 14 + slant, gy);
        ctx.lineTo(gx + 14, gy + 14); ctx.lineTo(gx, gy + 14);
        ctx.closePath(); ctx.stroke();
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText(m < 0.5 ? '孪晶马氏体（变体可翻倒）' : '奥氏体（立方，记忆形状）', 26, 106);
      ctx.fillStyle = '#1e293b'; ctx.fillRect(336, 30, 12, 130);
      const th = (temp + 20) / 120 * 130;
      ctx.fillStyle = temp > 60 ? '#f97316' : '#38bdf8';
      ctx.fillRect(338, 160 - th, 8, th);
      ctx.strokeStyle = '#475569'; ctx.strokeRect(336, 30, 12, 130);
      ctx.strokeStyle = '#f87171';
      ctx.beginPath(); ctx.moveTo(334, 73); ctx.lineTo(350, 73); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(334, 95); ctx.lineTo(350, 95); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '8.5px sans-serif';
      ctx.fillText('Af 60', 306, 76);
      ctx.fillText('Ms 40', 306, 98);
      ctx.fillText(temp + '°C', 322, 176);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
      ctx.fillText(temp < 40 ? '低温：马氏体，可随意弯折' : temp > 60 ? '加热越过相变点：恢复记忆形状！' : '滞后区间：保持当前状态', 20, 196);
      cap(ctx, V, '镍钛合金：相变温度可调，支架与矫正丝的秘密');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 气凝胶：纳米骨架 + 99.8% 空气，火焰上护花 */
  AN.aerogel = function (holder, tp) {
    const V = mkCanvas(holder, 360, 240, true);
    const dots = [];
    for (let i = 0; i < 30; i++) dots.push({ x: 40 + s01(i, 18) * 120, y: 100 + s01(i, 19) * 70, vx: (s01(i, 20) - 0.5) * 0.4, vy: (s01(i, 21) - 0.5) * 0.4 });
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      for (let i = 0; i < 5; i++) {
        const fx = 75 + i * 12, fh = 14 + Math.sin(t * 0.5 + i * 1.7) * 6;
        ctx.fillStyle = i % 2 ? '#f97316' : '#fbbf24';
        ctx.beginPath(); ctx.moveTo(fx - 5, 218); ctx.lineTo(fx + 5, 218); ctx.lineTo(fx, 218 - fh); ctx.fill();
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('火焰', 88, 232);
      ctx.fillStyle = 'rgba(125,211,252,.28)';
      ctx.fillRect(40, 100, 120, 80);
      ctx.strokeStyle = '#7dd3fc'; ctx.strokeRect(40, 100, 120, 80);
      ctx.strokeStyle = 'rgba(186,230,253,.5)';
      for (let i = 0; i < 12; i++) {
        const ax = 44 + s01(i, 22) * 112, ay = 104 + s01(i, 23) * 72;
        ctx.beginPath(); ctx.moveTo(ax, ay);
        ctx.lineTo(ax + (s01(i, 24) - 0.5) * 36, ay + (s01(i, 25) - 0.5) * 30); ctx.stroke();
      }
      dots.forEach(function (d) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 42 || d.x > 158) d.vx = -d.vx;
        if (d.y < 102 || d.y > 178) d.vy = -d.vy;
        ctx.fillStyle = 'rgba(226,232,240,.6)';
        ctx.beginPath(); ctx.arc(d.x, d.y, 1.6, 0, Math.PI * 2); ctx.fill();
      });
      const sway = Math.sin(t * 0.03) * 3;
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(100 + sway * 0.3, 98); ctx.lineTo(100 + sway, 70); ctx.stroke();
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3 + t * 0.01;
        ctx.fillStyle = '#f9a8d4';
        ctx.beginPath(); ctx.ellipse(100 + sway + 8 * Math.cos(a), 66 + 8 * Math.sin(a), 5, 3, a, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(100 + sway, 66, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('花安然无恙', 126, 70);
      ctx.fillStyle = '#475569'; ctx.font = '10px sans-serif';
      ctx.fillText('密度 kg/m³', 220, 40);
      const bars = [['空气 1.2', 1.2, '#94a3b8'], ['气凝胶 3', 3, '#38bdf8'], ['水 1000', 1000, '#2563eb']];
      bars.forEach(function (b, i) {
        const y = 48 + i * 30;
        ctx.fillStyle = b[2];
        ctx.fillRect(220, y, Math.sqrt(b[1]) * 3.2, 10);
        ctx.fillStyle = '#e2e8f0'; ctx.font = '9px sans-serif';
        ctx.fillText(b[0], 220, y + 21);
      });
      ctx.fillStyle = '#94a3b8'; ctx.font = '9.5px sans-serif';
      ctx.fillText('孔隙率 99.8%', 220, 152);
      ctx.fillText('热导率 0.015 < 静止空气 0.025', 220, 166);
      ctx.fillText('淡蓝色 = 瑞利散射', 220, 180);
      cap(ctx, V, '超临界干燥抽走液体、骨架不塌 → "凝固的烟"');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 钛合金：882°C 同素异构转变（α↔β）+ 比强度对比 */
  AN.titaniumAlloy = function (holder, tp) {
    const V = mkCanvas(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const T = 850 + 150 * Math.sin(t * 0.012);      // 700~1000°C 往返
      const mixv = Math.max(0, Math.min(1, (T - 852) / 60));
      const beta = mixv > 0.5;
      ctx.strokeStyle = '#334155'; ctx.strokeRect(16, 40, 150, 120);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) {
        const axp = 30 + c * 28 + (r % 2) * 14, ayp = 55 + r * 24;
        const bxp = 30 + c * 28, byp = 55 + r * 24;
        const x = axp + (bxp - axp) * mixv, y = ayp + (byp - ayp) * mixv;
        ctx.fillStyle = beta ? '#fbbf24' : '#38bdf8';
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
      }
      if (beta) {
        for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
          ctx.fillStyle = '#fde68a';
          ctx.beginPath(); ctx.arc(44 + c * 28, 67 + r * 24, 3, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.fillStyle = beta ? '#fbbf24' : '#38bdf8'; ctx.font = '10px sans-serif';
      ctx.fillText(beta ? 'β 相：体心立方（>882°C）' : 'α 相：密排六方（<882°C）', 20, 176);
      ctx.fillStyle = '#1e293b'; ctx.fillRect(16, 192, 150, 10);
      const frac = (T - 700) / 300;
      ctx.fillStyle = beta ? '#f97316' : '#38bdf8';
      ctx.fillRect(16, 192, frac * 150, 10);
      ctx.strokeStyle = '#f87171';
      ctx.beginPath(); ctx.moveTo(107, 188); ctx.lineTo(107, 206); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '8.5px sans-serif';
      ctx.fillText('882°C', 96, 214);
      ctx.fillText(Math.round(T) + '°C', 138, 214);
      ctx.fillStyle = '#475569'; ctx.font = '10px sans-serif';
      ctx.fillText('比强度（强度/密度）', 200, 44);
      const bars = [['Ti-6Al-4V', 100, '#38bdf8'], ['合金钢', 62, '#94a3b8'], ['铝合金', 48, '#fbbf24']];
      bars.forEach(function (b, i) {
        const y = 56 + i * 26;
        ctx.fillStyle = b[2]; ctx.fillRect(200, y, b[1] * 1.2, 12);
        ctx.fillStyle = '#e2e8f0'; ctx.font = '9px sans-serif';
        ctx.fillText(b[0], 200, y + 23);
      });
      ctx.fillStyle = '#94a3b8'; ctx.font = '9.5px sans-serif';
      ctx.fillText('密度 4.5 g/cm³ ≈ 钢的 57%', 200, 150);
      ctx.fillText('熔点 1668°C，耐海水腐蚀', 200, 166);
      ctx.fillText('铝稳 α 相，钒稳 β 相', 200, 182);
      cap(ctx, V, '同素异构转变 + 比强度第一 → 航天与人工关节');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 陶瓷 vs 金属：同样的压力，位错滑移（延展）与解理脆断 */
  AN.ceramicBonds = function (holder, tp) {
    const V = mkCanvas(holder, 380, 240, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const press = (t % 360) / 360;
      const py = 18 + press * 18;
      ctx.fillStyle = '#64748b'; ctx.fillRect(140, py, 100, 12);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('施加同样的压力', 150, py - 4);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
      ctx.fillText('金属', 30, 48);
      const slip = press * 16;
      for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) {
        const off = r < 2 ? slip : 0;
        ctx.fillStyle = '#d97706';
        ctx.beginPath(); ctx.arc(35 + c * 20 + off, 60 + r * 18, 5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = '#f87171';
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(28, 87); ctx.lineTo(160 + slip, 87); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#4ade80'; ctx.font = '9.5px sans-serif';
      ctx.fillText('位错滑移 → 塑性变形，弯而不断', 20, 172);
      ctx.fillText('金属键无方向性 + 自由电子 → 延展、导电', 20, 186);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
      ctx.fillText('陶瓷', 230, 48);
      const crack = Math.max(0, press - 0.45) / 0.55;
      const gap = crack * 10;
      for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) {
        const side = c < 3 ? -gap : gap;
        ctx.fillStyle = (r + c) % 2 ? '#f87171' : '#60a5fa';
        ctx.beginPath(); ctx.arc(235 + c * 20 + side, 60 + r * 18, 5, 0, Math.PI * 2); ctx.fill();
      }
      if (crack > 0) {
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(295, 55);
        for (let i = 1; i <= 8; i++) ctx.lineTo(295 + (i % 2 ? -4 : 4), 55 + crack * 8 * i);
        ctx.stroke(); ctx.lineWidth = 1;
      }
      ctx.fillStyle = crack > 0.3 ? '#f87171' : '#94a3b8'; ctx.font = '9.5px sans-serif';
      ctx.fillText(crack > 0.3 ? '裂纹瞬间扩展 → 脆断！' : '离子/共价键：没有滑移余地', 210, 172);
      ctx.fillText('键强而方向固定 → 高熔点、高硬度、绝缘', 210, 186);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('+/− 交替 = 离子键（氧化物），网络 = 共价键（SiC、Si₃N₄）', 60, 208);
      cap(ctx, V, '键的性格决定材料的性格');
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
