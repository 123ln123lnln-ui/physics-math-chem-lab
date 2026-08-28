/* concept-anim3.js — 概念演示动画引擎库（第三批：化学机制/流程/物理专题） */
(function () {
  const GEN = window.ConceptAnim.GEN;

  function mk(holder, w, h, dark) {
    const c = document.createElement('canvas');
    c.style.cssText = 'width:100%;max-width:' + w + 'px;border-radius:8px;display:block;background:' + (dark ? '#0f172a' : '#ffffff');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = w * dpr; c.height = h * dpr;
    const ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    holder.appendChild(c);
    return { ctx: ctx, w: w, h: h };
  }
  function label(ctx, w, h, text) {
    ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
    ctx.fillText(text, 10, h - 8);
  }
  function arrow(ctx, x1, y1, x2, y2, color, lw) {
    ctx.strokeStyle = color; ctx.lineWidth = lw || 2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 9 * Math.cos(a - 0.35), y2 - 9 * Math.sin(a - 0.35));
    ctx.lineTo(x2 - 9 * Math.cos(a + 0.35), y2 - 9 * Math.sin(a + 0.35));
    ctx.fill();
  }

  /* ---------- C10 通用流程图（多知识点复用） ---------- */
  GEN.flow = function (holder, o) {
    const V = mk(holder, 340, 150, false);
    const steps = o.steps || ['步骤1', '步骤2', '步骤3', '步骤4'];
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const n = steps.length;
      const bw = Math.min(76, (V.w - 40) / n - 12);
      const cur = Math.floor(t / 90) % n;
      const sub = (t % 90) / 90;
      for (let i = 0; i < n; i++) {
        const x = 14 + i * (bw + 14), y = 48;
        const active = i === cur;
        const done = i < cur || (i === cur && sub > 0.5);
        ctx.fillStyle = active ? '#dbeafe' : done ? '#dcfce7' : '#f8fafc';
        ctx.strokeStyle = active ? '#2563eb' : done ? '#16a34a' : '#cbd5e1';
        ctx.lineWidth = active ? 2.5 : 1.5;
        const r = 8;
        ctx.beginPath();
        ctx.moveTo(x + r, y); ctx.lineTo(x + bw - r, y); ctx.quadraticCurveTo(x + bw, y, x + bw, y + r);
        ctx.lineTo(x + bw, y + 46 - r); ctx.quadraticCurveTo(x + bw, y + 46, x + bw - r, y + 46);
        ctx.lineTo(x + r, y + 46); ctx.quadraticCurveTo(x, y + 46, x, y + 46 - r);
        ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#1e293b'; ctx.font = '10.5px sans-serif'; ctx.textAlign = 'center';
        const words = steps[i];
        ctx.fillText(words.slice(0, 6), x + bw / 2, y + 20);
        if (words.length > 6) ctx.fillText(words.slice(6, 12), x + bw / 2, y + 34);
        ctx.textAlign = 'left';
        if (i < n - 1) arrow(ctx, x + bw + 2, y + 23, x + bw + 12, y + 23, active ? '#2563eb' : '#94a3b8');
      }
      // 进度点
      const px = 14 + cur * (bw + 14) + sub * bw;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(px + bw / 2, 110, 4, 0, Math.PI * 2); ctx.fill();
      label(ctx, V.w, V.h, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* ---------- C11 化学专题 ---------- */
  GEN.cell = function (holder, o) {
    const V = mk(holder, 340, 210, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      // 电解液
      ctx.fillStyle = 'rgba(59,130,246,.12)'; ctx.fillRect(70, 80, V.w - 140, 100);
      ctx.strokeStyle = '#94a3b8'; ctx.strokeRect(70, 80, V.w - 140, 100);
      // 电极
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(110, 60, 16, 90);
      ctx.fillStyle = '#b45309'; ctx.fillRect(V.w - 126, 60, 16, 90);
      ctx.fillStyle = '#1e293b'; ctx.font = '11px sans-serif';
      ctx.fillText(o.anode || '负极(Zn)', 96, 52);
      ctx.fillText(o.cathode || '正极(Cu)', V.w - 140, 52);
      // 外电路电子流
      ctx.strokeStyle = '#475569';
      ctx.beginPath(); ctx.moveTo(118, 60); ctx.lineTo(118, 30); ctx.lineTo(V.w - 118, 30); ctx.lineTo(V.w - 118, 60); ctx.stroke();
      const e = (t * 1.6) % (2 * (V.w - 236) + 60);
      let ex;
      if (e < V.w - 236) ex = 118 + e; else ex = V.w - 118 - Math.min(e - (V.w - 236), V.w - 236);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(Math.min(ex, V.w - 118), 30, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillText('e⁻ →', ex - 40, 22);
      // 溶液中离子
      for (let i = 0; i < 6; i++) {
        const ix = 90 + ((i * 47 + t * 0.5) % (V.w - 180));
        ctx.fillStyle = i % 2 ? 'rgba(220,38,38,.7)' : 'rgba(37,99,235,.7)';
        ctx.beginPath(); ctx.arc(ix, 100 + (i * 23) % 60, 3.5, 0, Math.PI * 2); ctx.fill();
      }
      label(ctx, V.w, V.h, o.label || '原电池：活泼金属作负极失电子，电子经外电路做功');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.tyndall = function (holder, o) {
    const V = mk(holder, 340, 180, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 左：溶液（光路不可见） 右：胶体（丁达尔光路）
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(20, 40, 130, 90); ctx.strokeRect(190, 40, 130, 90);
      // 光束
      ctx.strokeStyle = 'rgba(148,163,184,.25)'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(20, 85); ctx.lineTo(150, 85); ctx.stroke();
      ctx.strokeStyle = 'rgba(250,204,21,' + (0.5 + Math.sin(t * 0.1) * 0.15) + ')'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(190, 85); ctx.lineTo(320, 85); ctx.stroke();
      ctx.lineWidth = 1;
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('溶液：光路不可见', 35, 30);
      ctx.fillText('胶体：丁达尔效应 ✓', 205, 30);
      label(ctx, V.w, V.h, o.label || '胶体粒子散射光线形成光亮通路——鉴别胶体与溶液');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.crystal = function (holder, o) {
    const V = mk(holder, 340, 190, false);
    let t = 0;
    function lattice(x0, name, kind) {
      const ctx = V.ctx;
      ctx.strokeStyle = '#cbd5e1'; ctx.strokeRect(x0, 30, 90, 100);
      ctx.fillStyle = '#475569'; ctx.font = '10.5px sans-serif';
      ctx.fillText(name, x0 + 18, 148);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
        const px = x0 + 20 + i * 26, py = 46 + j * 28;
        if (kind === 'ionic') {
          ctx.fillStyle = (i + j) % 2 ? '#dc2626' : '#3b82f6';
          ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill();
        } else if (kind === 'covalent') {
          ctx.fillStyle = '#334155';
          ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
          if (i < 2) { ctx.strokeStyle = '#64748b'; ctx.beginPath(); ctx.moveTo(px + 6, py); ctx.lineTo(px + 20, py); ctx.stroke(); }
          if (j < 2) { ctx.strokeStyle = '#64748b'; ctx.beginPath(); ctx.moveTo(px, py + 6); ctx.lineTo(px, py + 22); ctx.stroke(); }
        } else if (kind === 'molecular') {
          const wob = Math.sin(t * 0.05 + i + j) * 2;
          ctx.fillStyle = 'rgba(5,150,105,.8)';
          ctx.beginPath(); ctx.arc(px + wob, py, 6, 0, Math.PI * 2); ctx.fill();
        } else { // metal
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fbbf24';
          const ex = px + Math.sin(t * 0.08 + i * j) * 10, ey = py + Math.cos(t * 0.07 + i + j) * 10;
          ctx.beginPath(); ctx.arc(ex, ey, 2, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      lattice(8, '离子晶体', 'ionic');
      lattice(108, '共价晶体', 'covalent');
      lattice(208, '分子晶体', 'molecular');
      label(ctx, V.w, V.h, o.label || '金属晶体：阳离子+自由电子（金属晶体的电子气模型见小图点）');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.vsepr = function (holder, o) {
    const V = mk(holder, 320, 200, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const a = t * 0.015;
      const cx = V.w / 2, cy = V.h / 2 - 10;
      // 四面体旋转（CH₄ 示意）
      const verts = [[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(function (v) {
        const x = v[0] * Math.cos(a) - v[2] * Math.sin(a);
        const z = v[0] * Math.sin(a) + v[2] * Math.cos(a);
        const sc = 2.4 / (3.2 + z * 0.5);
        return [cx + x * 42 * sc, cy + v[1] * 42 * sc, z];
      });
      verts.forEach(function (v) {
        ctx.strokeStyle = 'rgba(148,163,184,.6)';
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(v[0], v[1]); ctx.stroke();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath(); ctx.arc(v[0], v[1], 8, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('CH₄ 正四面体 109°28′', 20, 20);
      ctx.fillText('NH₃ 三角锥 / H₂O V形（孤对排斥）', 20, 38);
      label(ctx, V.w, V.h, o.label || 'VSEPR：价层电子对互相排斥，决定分子空间构型');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.waterElec = function (holder, o) {
    const V = mk(holder, 320, 200, false);
    let t = 0;
    const bubL = [], bubR = [];
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      ctx.fillStyle = 'rgba(59,130,246,.12)'; ctx.fillRect(60, 60, 200, 110);
      ctx.strokeStyle = '#94a3b8'; ctx.strokeRect(60, 60, 200, 110);
      // 两支倒扣试管
      ctx.strokeStyle = '#64748b';
      ctx.strokeRect(110, 40, 30, 100); ctx.strokeRect(180, 40, 30, 100);
      // 电极
      ctx.fillStyle = '#475569'; ctx.fillRect(121, 140, 8, 25); ctx.fillRect(191, 140, 8, 25);
      // 气泡（负极=氢气，多）
      if (t % 8 === 0) bubL.push({ x: 125 + Math.random() * 4, y: 160, r: 2 + Math.random() * 2 });
      if (t % 16 === 0) bubR.push({ x: 195 + Math.random() * 4, y: 160, r: 2 + Math.random() * 2 });
      [bubL, bubR].forEach(function (arr, idx) {
        arr.forEach(function (b) { b.y -= 0.8; ctx.strokeStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke(); });
        while (arr.length && arr[0].y < 50) arr.shift();
      });
      ctx.fillStyle = '#dc2626'; ctx.font = '11px sans-serif';
      ctx.fillText('H₂（多）', 108, 32);
      ctx.fillText('O₂（少）', 178, 32);
      ctx.fillStyle = '#475569';
      ctx.fillText('−', 118, 178); ctx.fillText('+', 190, 178);
      label(ctx, V.w, V.h, o.label || '电解水：负极出氢气、正极出氧气，体积比 2:1');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.rust = function (holder, o) {
    const V = mk(holder, 320, 180, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const nails = [
        { x: 60, env: '干燥空气', rust: 0 },
        { x: 150, env: '水+空气', rust: Math.min(1, t / 400) },
        { x: 240, env: '植物油封水', rust: 0 }
      ];
      nails.forEach(function (n) {
        ctx.fillStyle = n.rust > 0.1 ? 'rgba(180,83,9,' + (0.4 + n.rust * 0.6) + ')' : '#94a3b8';
        ctx.fillRect(n.x, 50, 10, 60);
        ctx.beginPath(); ctx.arc(n.x + 5, 46, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#475569'; ctx.font = '10.5px sans-serif';
        ctx.fillText(n.env, n.x - 16, 140);
        if (n.rust > 0.3) { ctx.fillStyle = '#b45309'; ctx.fillText('生锈!', n.x - 2, 155); }
      });
      label(ctx, V.w, V.h, o.label || '铁生锈需要氧气和水同时存在（对比实验：控制变量）');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.periodicTrend = function (holder, o) {
    const V = mk(holder, 340, 170, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const n = 8;
      ctx.fillStyle = '#475569'; ctx.font = '10px sans-serif';
      ctx.fillText('第三周期（Na → Cl），原子半径递减：', 20, 24);
      for (let i = 0; i < n; i++) {
        const r = 26 - i * 2.6 + Math.sin(t * 0.05 + i) * 0.6;
        const x = 40 + i * 38;
        ctx.fillStyle = 'hsl(' + (210 - i * 18) + ',70%,60%)';
        ctx.beginPath(); ctx.arc(x, 90, Math.max(6, r), 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1e293b'; ctx.textAlign = 'center';
        ctx.fillText(['Na','Mg','Al','Si','P','S','Cl','Ar'][i], x, 135);
        ctx.textAlign = 'left';
      }
      arrow(ctx, 40, 150, 300, 150, '#94a3b8');
      ctx.fillStyle = '#64748b'; ctx.fillText('核电荷增加 → 半径减小、非金属性增强', 60, 164);
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.polymerize = function (holder, o) {
    const V = mk(holder, 340, 160, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const n = Math.min(7, 1 + Math.floor(t / 70));
      for (let i = 0; i < n; i++) {
        const x = 30 + i * 42;
        ctx.fillStyle = i % 2 ? 'rgba(220,38,38,.8)' : 'rgba(37,99,235,.8)';
        ctx.beginPath(); ctx.arc(x, 80, 13, 0, Math.PI * 2); ctx.fill();
        if (i < n - 1) { ctx.strokeStyle = '#475569'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 13, 80); ctx.lineTo(x + 29, 80); ctx.stroke(); }
      }
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('n CH₂=CH₂  →  [—CH₂—CH₂—]ₙ', 30, 30);
      label(ctx, V.w, V.h, o.label || '加聚反应：双键打开，单体手拉手连成长链（聚乙烯）');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.organicChain = function (holder, o) {
    const V = mk(holder, 340, 150, false);
    const steps = ['醇 —OH', '醛 —CHO', '羧酸 —COOH', '酯 —COO—'];
    GEN.flow(holder, { steps: steps, label: o.label || '有机物转化主线：醇氧化为醛，醛氧化为酸，酸与醇酯化' });
  };

  /* ---------- C12 物理专题 ---------- */
  GEN.engine4 = function (holder, o) {
    const V = mk(holder, 320, 210, false);
    let t = 0;
    const names = ['吸气', '压缩', '做功', '排气'];
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const ph = Math.floor(t / 60) % 4;
      const sub = (t % 60) / 60;
      // 气缸
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 3;
      ctx.strokeRect(110, 40, 100, 120);
      const piston = ph === 0 ? 60 + sub * 60 : ph === 1 ? 120 - sub * 60 : ph === 2 ? 60 + sub * 60 : 120 - sub * 60;
      ctx.fillStyle = '#475569'; ctx.fillRect(112, 40 + piston, 96, 14);
      if (ph === 2) { // 做功：火花
        ctx.fillStyle = 'rgba(250,204,21,' + (0.9 - sub * 0.5) + ')';
        ctx.beginPath(); ctx.arc(160, 48, 8 + sub * 6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = ph === 2 ? '#dc2626' : '#64748b';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('冲程：' + names[ph], 110, 185);
      ctx.font = '11px sans-serif'; ctx.fillStyle = '#475569';
      ctx.fillText('压缩：机械能→内能 | 做功：内能→机械能', 40, 200);
      label(ctx, V.w, V.h, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.friction = function (holder, o) {
    const V = mk(holder, 340, 170, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const x = 40 + (t % 300) * 0.8;
      // 粗糙面 vs 光滑面
      ctx.fillStyle = '#b45309';
      for (let i = 0; i < 20; i++) { ctx.beginPath(); ctx.arc(20 + i * 16, 120, 1.5, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath(); ctx.moveTo(0, 121); ctx.lineTo(V.w, 121); ctx.stroke();
      ctx.fillStyle = '#2563eb'; ctx.fillRect(x, 90, 50, 30);
      arrow(ctx, x + 60, 105, x + 100, 105, '#dc2626');
      arrow(ctx, x - 5, 105, x - 35, 105, '#f59e0b');
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('拉力', x + 70, 96); ctx.fillText('摩擦力', x - 62, 96);
      label(ctx, V.w, V.h, o.label || '滑动摩擦力阻碍相对运动：压力越大、表面越粗糙，摩擦力越大');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.vtGraph = function (holder, o) {
    const V = mk(holder, 340, 210, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const ox = 50, oy = 170, k = 0.35;
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath(); ctx.moveTo(ox, 30); ctx.lineTo(ox, oy); ctx.lineTo(V.w - 20, oy); ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('v', ox - 18, 36); ctx.fillText('t', V.w - 30, oy + 16);
      const tMax = Math.min((t % 360) * 0.8, 260);
      // 匀加速直线
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(ox, oy - 20); ctx.lineTo(ox + tMax, oy - 20 - tMax * k); ctx.stroke();
      // 面积 = 位移
      ctx.fillStyle = 'rgba(37,99,235,.15)';
      ctx.beginPath();
      ctx.moveTo(ox, oy); ctx.lineTo(ox, oy - 20); ctx.lineTo(ox + tMax, oy - 20 - tMax * k); ctx.lineTo(ox + tMax, oy);
      ctx.fill();
      ctx.fillStyle = '#dc2626'; ctx.font = '11px sans-serif';
      ctx.fillText('阴影面积 = 位移', ox + 60, oy - 30);
      ctx.fillText('斜率 = 加速度', ox + tMax + 6 > V.w - 110 ? ox + 60 : ox + tMax + 6, oy - 26 - tMax * k);
      label(ctx, V.w, V.h, o.label || 'v-t 图像：斜率是加速度，图线与 t 轴围成的面积是位移');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.interference = function (holder, o) {
    const V = mk(holder, 340, 220, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const s1 = { x: 120, y: 110 }, s2 = { x: 220, y: 110 };
      for (let r = 0; r < 130; r += 18) {
        const rr = r + (t * 0.6) % 18;
        ctx.strokeStyle = 'rgba(56,189,248,.35)';
        ctx.beginPath(); ctx.arc(s1.x, s1.y, rr, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(s2.x, s2.y, rr, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(s1.x, s1.y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(s2.x, s2.y, 4, 0, Math.PI * 2); ctx.fill();
      label(ctx, V.w, V.h, o.label || '两列同频波叠加：波峰遇波峰加强，波峰遇波谷减弱（稳定干涉图样）');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.lenz = function (holder, o) {
    const V = mk(holder, 320, 210, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const my = 30 + ((t * 1.2) % 150);
      // 磁铁下落
      ctx.fillStyle = '#dc2626'; ctx.fillRect(V.w / 2 - 12, my, 24, 14);
      ctx.fillStyle = '#3b82f6'; ctx.fillRect(V.w / 2 - 12, my + 14, 24, 14);
      // 线圈
      ctx.strokeStyle = '#b45309'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(V.w / 2, 160, 45, 12, 0, 0, Math.PI * 2); ctx.stroke();
      const near = Math.abs(my + 21 - 160) < 40;
      if (near) {
        ctx.fillStyle = 'rgba(245,158,11,.8)';
        ctx.beginPath(); ctx.arc(V.w / 2 + 70, 160, 5 + Math.sin(t * 0.3) * 2, 0, Math.PI * 2); ctx.fill();
        arrow(ctx, V.w / 2 + 48, 160, V.w / 2 + 62, 160, '#f59e0b');
        ctx.fillStyle = '#b45309'; ctx.font = '11px sans-serif';
        ctx.fillText('感应电流', V.w / 2 + 78, 164);
      }
      label(ctx, V.w, V.h, o.label || '楞次定律：磁铁靠近，线圈产生的感应电流阻碍磁通量变化');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.evap = function (holder, o) {
    const V = mk(holder, 320, 200, false);
    const ps = [];
    for (let i = 0; i < 30; i++) ps.push({ x: 60 + Math.random() * 200, y: 110 + Math.random() * 60, vy: 0, free: false });
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      ctx.fillStyle = 'rgba(59,130,246,.15)'; ctx.fillRect(50, 100, 220, 80);
      ctx.strokeStyle = '#94a3b8'; ctx.strokeRect(50, 100, 220, 80);
      ps.forEach(function (p) {
        if (!p.free) {
          p.x += (Math.random() - 0.5) * 2;
          if (Math.random() < 0.004) { p.free = true; p.vy = -1.6; } // 表面分子获得足够动能逃逸
        } else {
          p.y += p.vy;
        }
        ctx.fillStyle = p.free ? 'rgba(37,99,235,.9)' : 'rgba(37,99,235,.55)';
        ctx.beginPath(); ctx.arc(p.x, Math.max(8, p.y), 3.5, 0, Math.PI * 2); ctx.fill();
        if (p.y < 8) { p.free = false; p.y = 150; p.x = 60 + Math.random() * 200; }
      });
      label(ctx, V.w, V.h, o.label || '蒸发：表面动能大的分子逃逸成气体（任何温度都发生，吸热致冷）');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.atm = function (holder, o) {
    const V = mk(holder, 320, 200, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const ph = (t % 300) / 300;
      // 易拉罐
      const cx = V.w / 2;
      ctx.fillStyle = '#94a3b8';
      if (ph < 0.5) {
        ctx.fillRect(cx - 30, 60, 60, 90);
        // 蒸汽
        ctx.strokeStyle = 'rgba(148,163,184,.6)';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(cx - 8 + i * 8, 55);
          ctx.quadraticCurveTo(cx - 14 + i * 8, 35 - t % 20, cx - 8 + i * 8, 18);
          ctx.stroke();
        }
        ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
        ctx.fillText('加热：罐内充满水蒸气（排出空气）', 30, 180);
      } else {
        const sq = Math.min(1, (ph - 0.5) / 0.2);
        ctx.save();
        ctx.translate(cx, 105);
        ctx.scale(1 - sq * 0.55, 1 - sq * 0.25);
        ctx.fillRect(-30, -45, 60, 90);
        ctx.restore();
        // 压力箭头
        arrow(ctx, cx - 90, 105, cx - 48, 105, '#dc2626');
        arrow(ctx, cx + 90, 105, cx + 48, 105, '#dc2626');
        ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
        ctx.fillText('倒扣冷水：蒸汽凝结，大气压把罐压瘪！', 30, 180);
      }
      label(ctx, V.w, V.h, o.label || '大气压强真实存在且力量巨大（约 10⁵ Pa）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  window.ConceptAnim.GEN = GEN;
})();
