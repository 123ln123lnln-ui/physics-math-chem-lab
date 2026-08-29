/* explore-anim5_4.js — 第三批动画引擎（批次4：生命树 6 + 航天树 6，共 12 个专属原理动画） */
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
  function cap(ctx, V, text) { ctx.fillStyle = '#94a3b8'; ctx.font = '10.5px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(text, 10, V.h - 7); }

  /* 疫苗与免疫记忆：初次应答慢而低，再次应答快而高 */
  AN.vaccineMemory = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mkCanvas(holder, 360, 230, true);
    let t = 0;
    function ab(x) { // 抗体水平（px，向下为正前的幅值）
      let y = 4;
      if (x > 70) y += 46 / (1 + Math.exp(-(x - 130) / 18)); // 初次：慢
      if (x > 210) y += 120 / (1 + Math.exp(-(x - 240) / 7)); // 再次：快而高
      return y;
    }
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const x0 = 30, y0 = 190, x1 = 345, span = x1 - x0;
      ctx.strokeStyle = '#475569';
      ctx.beginPath(); ctx.moveTo(x0, 20); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
      const prog = Math.min(1, (t % 480) / 400);
      // 抗原（红色三角峰）
      [[70, '接种疫苗（抗原）'], [210, '病原体入侵']].forEach(function (ev) {
        if (prog * span + x0 > ev[0] - 8) {
          ctx.fillStyle = '#f87171';
          ctx.beginPath(); ctx.moveTo(ev[0], y0); ctx.lineTo(ev[0] - 7, y0 + 12); ctx.lineTo(ev[0] + 7, y0 + 12); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#fca5a5'; ctx.font = '10px sans-serif'; ctx.fillText(ev[1], ev[0] - 18, y0 + 26);
        }
      });
      // 抗体曲线
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x <= prog * span; x += 2) {
        const y = y0 - ab(x);
        if (x === 0) ctx.moveTo(x0 + x, y); else ctx.lineTo(x0 + x, y);
      }
      ctx.stroke();
      // 记忆细胞条
      const mem = Math.min(1, Math.max(0, (prog * span - 130) / 120));
      ctx.fillStyle = 'rgba(56,189,248,.8)';
      ctx.fillRect(x0, 30, mem * 90, 8);
      ctx.strokeStyle = '#38bdf8'; ctx.strokeRect(x0, 30, 90, 8);
      ctx.fillStyle = '#7dd3fc'; ctx.font = '10px sans-serif';
      ctx.fillText('记忆细胞', x0 + 96, 38);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('再次应答：更快、更强——这就是疫苗的原理', 88, 18);
      cap(ctx, V, '绿=抗体水平：初次慢而低，二次快而高');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 抗生素与耐药性：敏感菌被杀灭，耐药菌留下并扩繁 */
  AN.antibioticResistance = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mkCanvas(holder, 340, 230, true);
    const bugs = [];
    for (let i = 0; i < 80; i++) bugs.push({ x: 20 + Math.random() * 300, y: 40 + Math.random() * 140, res: i < 3, alive: true });
    let phase = 0, t = 0; // 0 生长期 1 用药期
    (function loop() {
      const ctx = V.ctx;
      const dose = Math.max(0, Math.min(100, D.dose !== undefined ? D.dose : 70));
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      if (t % 300 === 0) { // 用药脉冲
        bugs.forEach(function (b) {
          if (!b.res && Math.random() < dose / 100) b.alive = false;
        });
        phase = 1;
      }
      if (t % 300 === 150) { // 幸存者扩繁回补
        let resAlive = 0; bugs.forEach(function (b) { if (b.alive && b.res) resAlive++; });
        const ratio = resAlive / Math.max(1, bugs.filter(function (b) { return b.alive; }).length);
        bugs.forEach(function (b) {
          if (!b.alive) { b.alive = true; b.res = Math.random() < Math.min(1, ratio + 0.04); b.x = 20 + Math.random() * 300; b.y = 40 + Math.random() * 140; }
        });
        phase = 0;
      }
      let resN = 0, senN = 0;
      bugs.forEach(function (b) {
        if (!b.alive) return;
        if (b.res) resN++; else senN++;
        ctx.fillStyle = b.res ? '#f87171' : '#4ade80';
        ctx.beginPath(); ctx.arc(b.x + Math.sin(t * 0.05 + b.y) * 2, b.y, b.res ? 4 : 3, 0, Math.PI * 2); ctx.fill();
      });
      if (phase === 1) {
        ctx.fillStyle = 'rgba(250,204,21,.12)'; ctx.fillRect(0, 30, V.w, 160);
        ctx.fillStyle = '#fde047'; ctx.font = '11px sans-serif';
        ctx.fillText('抗生素冲刷中…剂量 ' + dose, 120, 28);
      }
      ctx.fillStyle = '#4ade80'; ctx.font = '11px sans-serif';
      ctx.fillText('敏感菌 ' + senN, 20, 210);
      ctx.fillStyle = '#f87171';
      ctx.fillText('耐药菌 ' + resN + (resN > senN ? ' ← 已成优势' : ''), 120, 210);
      cap(ctx, V, '每用药一轮，红（耐药）占比上升——自然选择');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* PCR：温度循环驱动 2^n 指数扩增 */
  AN.pcrAmplify = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mkCanvas(holder, 340, 240, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      const total = Math.max(1, Math.min(30, Math.round(D.cycles || 20)));
      const cyc = Math.floor(t / 50) % (total + 6); // 末尾停一停再重来
      const n = Math.min(cyc, total);
      const tempPh = Math.floor(t / 16) % 3;
      const temps = [95, 55, 72], tnames = ['解旋', '引物结合', '延伸'];
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 试管
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(140, 30); ctx.lineTo(140, 190); ctx.quadraticCurveTo(140, 210, 160, 210);
      ctx.lineTo(180, 210); ctx.quadraticCurveTo(200, 210, 200, 190); ctx.lineTo(200, 30); ctx.stroke();
      // DNA 双链片段：数量 = 2^n（封顶显示 400 个）
      const shown = Math.min(400, Math.pow(2, n));
      for (let i = 0; i < shown; i++) {
        const gx = 144 + (i * 37) % 52, gy = 196 - Math.floor(i / 4) * 4 - ((i * 13) % 3);
        if (gy < 40) break;
        ctx.fillStyle = 'rgba(56,189,248,.8)';
        ctx.fillRect(gx, gy, 3, 2);
      }
      // 温度灯
      ctx.fillStyle = tempPh === 0 ? '#f87171' : tempPh === 1 ? '#4ade80' : '#38bdf8';
      ctx.beginPath(); ctx.arc(60, 60, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText(temps[tempPh] + '°C ' + tnames[tempPh], 80, 64);
      // 计数
      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = '#fbbf24';
      const cnt = Math.pow(2, n);
      ctx.fillText('循环 ' + n + '/' + total + '：拷贝数 2^' + n + ' = ' + cnt.toLocaleString(), 30, 230);
      cap(ctx, V, '每轮翻倍：30 轮 ≈ 10 亿份');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* CRISPR：向导 RNA 扫描配对 → Cas9 切断 → 修复 */
  AN.crisprEdit = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mkCanvas(holder, 360, 220, true);
    const seq = 'ATGCGTACGTTAGCCTAGGC';
    const target = 8; // 目标起始索引
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const x0 = 30, cw = 15, y1 = 80, y2 = 110;
      const ph = (t % 320);
      const scan = Math.min(seq.length - 5, Math.floor(ph / 12)); // 向导扫描位置
      const cutting = ph > 200 && ph < 250;
      const repaired = ph >= 250;
      // DNA 双链
      for (let i = 0; i < seq.length; i++) {
        const x = x0 + i * cw;
        const inTarget = i >= target && i < target + 5;
        const gap = cutting && inTarget ? 6 : 0;
        ctx.fillStyle = inTarget ? (repaired ? '#4ade80' : '#fbbf24') : '#7dd3fc';
        ctx.font = '11px monospace'; ctx.textAlign = 'center';
        ctx.fillText(seq[i], x, y1 - gap);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText({'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C'}[seq[i]], x, y2 + gap);
        ctx.strokeStyle = 'rgba(148,163,184,.4)';
        ctx.beginPath(); ctx.moveTo(x, y1 - gap + 4); ctx.lineTo(x, y2 + gap - 6); ctx.stroke();
      }
      ctx.textAlign = 'left';
      // 向导 RNA + Cas9
      if (!repaired) {
        const gx = x0 + scan * cw;
        ctx.fillStyle = 'rgba(217,70,239,.9)';
        ctx.fillRect(gx - 8, y1 - 26, 5 * cw, 10);
        ctx.fillStyle = '#f0abfc'; ctx.font = '10px sans-serif';
        ctx.fillText('向导RNA', gx - 8, y1 - 32);
        ctx.fillStyle = 'rgba(148,163,184,.9)';
        ctx.beginPath(); ctx.arc(gx + 2.5 * cw - 8, y1 - 48, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0f172a'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Cas9', gx + 2.5 * cw - 8, y1 - 45); ctx.textAlign = 'left';
        if (cutting) {
          ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(x0 + (target + 5) * cw - 7, y1 - 14); ctx.lineTo(x0 + (target + 5) * cw - 7, y2 + 8); ctx.stroke();
          ctx.fillStyle = '#f87171'; ctx.font = '10px sans-serif';
          ctx.fillText('切断！', x0 + (target + 5) * cw + 2, 70);
        }
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText(repaired ? '断口被修复：目标基因已改写（绿色）' : '向导 RNA 扫描配对序列，Cas9 随行', 40, 180);
      cap(ctx, V, '细菌抗病毒档案 → 通用基因编辑工具（2020 诺奖）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 显微镜：肉眼→光学→电镜，分辨率逐级深入 */
  AN.microscopeCell = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mkCanvas(holder, 340, 240, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      const mag = Math.round(D.mag !== undefined ? D.mag : 1); // 0肉眼 1光学 2电镜
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 视野圆
      ctx.save();
      ctx.beginPath(); ctx.arc(110, 110, 85, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = '#1e293b'; ctx.fillRect(20, 20, 180, 180);
      if (mag === 0) {
        // 肉眼：模糊的一小块软木
        ctx.fillStyle = '#a16207';
        ctx.beginPath(); ctx.ellipse(110, 110, 50, 30, 0.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#713f12'; ctx.font = '11px sans-serif';
        ctx.fillText('一小块软木（≈1 mm）', 55, 150);
      } else if (mag === 1) {
        // 光学：虎克看到的细胞小室
        ctx.strokeStyle = '#d97706'; ctx.lineWidth = 2;
        for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
          const jx = Math.sin(t * 0.02 + r * 3 + c) * 1.5;
          ctx.strokeRect(45 + c * 27 + jx, 45 + r * 27, 24, 24);
        }
        ctx.fillStyle = '#fbbf24'; ctx.font = '11px sans-serif';
        ctx.fillText('细胞小室（≈10 μm）"cell"', 40, 200);
      } else {
        // 电镜：细胞器/病毒级
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath(); ctx.ellipse(110, 105, 45, 30, 0.2, 0, Math.PI * 2); ctx.fill(); // 细胞
        ctx.fillStyle = '#0f172a';
        ctx.beginPath(); ctx.ellipse(110, 105, 16, 12, 0.2, 0, Math.PI * 2); ctx.fill(); // 核
        for (let i = 0; i < 8; i++) {
          const a = i * 0.8 + t * 0.01;
          ctx.fillStyle = '#f472b6';
          ctx.beginPath(); ctx.arc(60 + (i * 37) % 100, 60 + (i * 53) % 100, 3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#7dd3fc'; ctx.font = '11px sans-serif';
        ctx.fillText('细胞核与病毒颗粒（≈0.1 μm）', 30, 200);
      }
      ctx.restore();
      ctx.strokeStyle = '#475569'; ctx.beginPath(); ctx.arc(110, 110, 85, 0, Math.PI * 2); ctx.stroke();
      // 分辨率标尺
      const names = ['肉眼 ~0.1 mm', '光学显微镜 ~0.2 μm（衍射极限）', '电子显微镜 ~0.1 nm'];
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      names.forEach(function (s, i) {
        ctx.fillStyle = i === mag ? '#fbbf24' : '#64748b';
        ctx.fillText((i === mag ? '▶ ' : '　') + s, 210, 70 + i * 28);
      });
      cap(ctx, V, '虎克 1665：软木塞里的小格子被命名为 cell');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 心电图：PQRST 复合波滚动显示，心率可调 */
  AN.ecgWave = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mkCanvas(holder, 360, 230, true);
    let t = 0;
    function ecg(ph) { // ph ∈ [0,1) 一个心动周期
      if (ph < 0.12) return 8 * Math.sin(ph / 0.12 * Math.PI); // P
      if (ph < 0.16) return -6 * Math.sin((ph - 0.12) / 0.04 * Math.PI); // Q
      if (ph < 0.22) return 55 * Math.sin((ph - 0.16) / 0.06 * Math.PI); // R
      if (ph < 0.28) return -14 * Math.sin((ph - 0.22) / 0.06 * Math.PI); // S
      if (ph < 0.55) return 0;
      if (ph < 0.75) return 12 * Math.sin((ph - 0.55) / 0.2 * Math.PI); // T
      return 0;
    }
    (function loop() {
      const ctx = V.ctx;
      const hr = Math.max(40, Math.min(180, D.hr !== undefined ? D.hr : 75));
      const period = 60 / hr * 60; // 帧/周期（60fps）
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 网格
      ctx.strokeStyle = 'rgba(220,38,38,.15)';
      for (let x = 0; x < V.w; x += 20) { ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x, 190); ctx.stroke(); }
      for (let y = 20; y <= 190; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(V.w, y); ctx.stroke(); }
      const yb = 130, span = 340, x0 = 10;
      const head = (t % 600) / 600 * span;
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= span; x++) {
        const frames = (t - (span - x) * (600 / span));
        const ph = ((frames % period) + period) % period / period;
        const y = yb - ecg(ph);
        if (x === 0) ctx.moveTo(x0 + x, y); else ctx.lineTo(x0 + x, y);
      }
      ctx.stroke();
      // 心跳标记
      const beat = (((t % period) + period) % period) < period * 0.22;
      ctx.fillStyle = beat ? '#f87171' : '#7f1d1d';
      ctx.beginPath(); ctx.arc(335, 45, beat ? 9 : 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('心率 ' + hr + ' 次/分', 20, 30);
      // 波段标注
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('P', 60, 90); ctx.fillText('QRS', 100, 60); ctx.fillText('T', 165, 95);
      cap(ctx, V, 'P=心房收缩 QRS=心室收缩 T=心室复极化');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 火箭方程：Δv = ve·ln(m0/m1) 的对数曲线 */
  AN.rocketEquation = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mkCanvas(holder, 340, 230, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      const mr = Math.max(2, Math.min(20, Math.round(D.mr || 8)));
      const ve = 3; // 喷气速度 km/s（化学火箭典型量级）
      const dv = ve * Math.log(mr);
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const x0 = 40, y0 = 180, W = 240, H = 140;
      ctx.strokeStyle = '#475569';
      ctx.beginPath(); ctx.moveTo(x0, y0 - H - 10); ctx.lineTo(x0, y0); ctx.lineTo(x0 + W + 20, y0); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('质量比 m₀/m₁ →', x0 + W - 70, y0 + 16);
      ctx.fillText('Δv', x0 - 22, y0 - H);
      // 曲线 Δv(m)
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let m = 1; m <= 20; m += 0.2) {
        const x = x0 + (m - 1) / 19 * W;
        const y = y0 - (ve * Math.log(m)) / 9 * H;
        if (m === 1) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // 当前点
      const px = x0 + (mr - 1) / 19 * W, py = y0 - dv / 9 * H;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('质量比 ' + mr + ' → Δv ≈ ' + dv.toFixed(1) + ' km/s', 60, 24);
      // 火箭：火焰长度 ∝ Δv 增长难度
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath(); ctx.moveTo(310, 60); ctx.lineTo(302, 90); ctx.lineTo(318, 90); ctx.closePath(); ctx.fill();
      const fl = 10 + Math.sin(t * 0.3) * 3 + mr * 0.8;
      ctx.fillStyle = '#f97316';
      ctx.beginPath(); ctx.moveTo(310, 90 + fl); ctx.lineTo(304, 92); ctx.lineTo(316, 92); ctx.closePath(); ctx.fill();
      cap(ctx, V, 'ln 增长：想再快一点，燃料要多很多 → 多级火箭');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 霍曼转移：两次点火之间的半个椭圆 */
  AN.hohmannTransfer = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mkCanvas(holder, 340, 260, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      const ratio = Math.max(1.5, Math.min(4, D.ratio !== undefined ? D.ratio : 2.5));
      const cx = 170, cy = 130, R1 = 40, R2 = 40 * ratio;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 太阳
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(cx, cy, 10 + Math.sin(t * 0.1), 0, Math.PI * 2); ctx.fill();
      // 两条圆轨道
      ctx.strokeStyle = 'rgba(56,189,248,.6)';
      ctx.beginPath(); ctx.arc(cx, cy, R1, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(248,113,113,.6)';
      ctx.beginPath(); ctx.arc(cx, cy, R2, 0, Math.PI * 2); ctx.stroke();
      // 转移椭圆：近点 R1（右），远点 R2（左）
      const a = (R1 + R2) / 2, c = a - R1, b = Math.sqrt(a * a - c * c);
      const ex = cx - c;
      ctx.strokeStyle = '#4ade80'; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.ellipse(ex, cy, a, b, 0, Math.PI, Math.PI * 2, false); // 上半
      ctx.stroke(); ctx.setLineDash([]);
      // 飞船沿椭圆上半走（开普勒式：匀速角度近似）
      const th = Math.PI + ((t * 0.008) % 1) * Math.PI;
      const sx = ex + a * Math.cos(th), sy = cy + b * Math.sin(th);
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.fill();
      // 点火标记
      [[cx + R1, cy, '①点火加速'], [cx - R2, cy, '②点火圆化']].forEach(function (p, i) {
        const on = i === 0 ? ((t * 0.008) % 1) < 0.06 : ((t * 0.008) % 1) > 0.94;
        ctx.fillStyle = on ? '#f97316' : '#64748b';
        ctx.beginPath(); ctx.arc(p[0], p[1], on ? 7 : 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#cbd5e1'; ctx.font = '10px sans-serif';
        ctx.fillText(p[2], p[0] - 24, p[1] + (i === 0 ? 18 : -12));
      });
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('目标半径 ×' + ratio.toFixed(1) + '：转移耗时与燃料的权衡', 40, 20);
      cap(ctx, V, '两次脉冲 + 半程椭圆 = 最省燃料的轨道转移');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 第一宇宙速度：牛顿炮弹——坠落、环绕、逃逸 */
  AN.orbitVelocity = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mkCanvas(holder, 340, 250, true);
    let t = 0;
    const Re = 55, mu = 7.9 * 7.9 * Re; // px 单位制自洽
    (function loop() {
      const ctx = V.ctx;
      const v = Math.max(3, Math.min(12, D.v !== undefined ? D.v : 7.9));
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = 170, cy = 190; // 地心
      // 地球
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath(); ctx.arc(cx, cy, Re, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(74,222,128,.5)';
      ctx.beginPath(); ctx.arc(cx - 15, cy - 10, 14, 0, Math.PI * 2); ctx.fill();
      // 数值模拟炮弹（从山顶水平射出）
      let px = cx, py = cy - Re - 8, vx = v, vy = 0;
      const trail = [];
      const dt = 0.06;
      for (let i = 0; i < 900; i++) {
        const dx = px - cx, dy = py - cy, r = Math.sqrt(dx * dx + dy * dy);
        if (r < Re) break; // 撞地
        if (r > 500) { trail.push([px, py]); break; } // 逃逸
        const ax = -mu * dx / (r * r * r), ay = -mu * dy / (r * r * r);
        vx += ax * dt; vy += ay * dt;
        px += vx * dt; py += vy * dt;
        if (i % 2 === 0) trail.push([px, py]);
      }
      // 轨迹渐显
      const upto = Math.min(trail.length, (t % 200) * 3);
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < upto; i++) {
        if (i === 0) ctx.moveTo(trail[i][0], trail[i][1]); else ctx.lineTo(trail[i][0], trail[i][1]);
      }
      ctx.stroke();
      if (upto > 0) {
        ctx.fillStyle = '#fde047';
        ctx.beginPath(); ctx.arc(trail[upto - 1][0], trail[upto - 1][1], 4, 0, Math.PI * 2); ctx.fill();
      }
      // 山顶发射点
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(cx - 3, cy - Re - 12, 6, 8);
      const status = v < 7.0 ? '速度不足 → 坠落回地面' : v < 8.5 ? '≈7.9 km/s：环绕地球，永不落地' : v < 10.5 ? '椭圆轨道（越高越扁）' : '≥11.2 km/s：逃离地球！';
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('初速度 ' + v.toFixed(1) + ' km/s：' + status, 30, 24);
      cap(ctx, V, '卫星一直在掉，只是横着飞得够快，总错过地面');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 火箭回收：栅格舵修正 + 末段反推着陆 */
  AN.rocketLanding = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mkCanvas(holder, 340, 260, true);
    let t = 0;
    // 物理状态（逐帧积分）：y 箭底高度、vy 下落速度、td 触地速度
    let y = 20, vy = 0, td = -1, hold = 0, hover = 0;
    (function loop() {
      const ctx = V.ctx;
      const thrust = Math.max(0, Math.min(2, D.thrust !== undefined ? D.thrust : 1.3)); // 相对重力
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const ground = 235, padX = 170;
      // 海上驳船/着陆台
      ctx.fillStyle = '#334155'; ctx.fillRect(padX - 45, ground, 90, 10);
      ctx.strokeStyle = '#fbbf24'; ctx.strokeRect(padX - 45, ground, 90, 10);
      const g = 0.045;
      const yBurn = ground - 20 - 150; // 距地面 150px 处点火反推
      let burning = false;
      if (hold === 0) {
        if (y < yBurn) {
          vy += g; // 自由下落
        } else {
          vy += g * (1 - thrust); // 反推：推力>重力则减速
          burning = true;
          if (vy <= 0) { vy = 0; hover++; if (hover > 90) vy = 0.25; } // 悬停片刻后缓降
        }
        y += vy;
        if (y >= ground - 20) { td = vy; y = ground - 20; vy = 0; hold = 1; }
      } else {
        hold++;
        if (hold > 150) { y = 20; vy = 0; td = -1; hold = 0; hover = 0; }
      }
      const v = vy;
      // 栅格舵摆动修正（着陆前全程微调）
      const wob = Math.sin(t * 0.08) * (burning ? 2 : 6);
      const rx = padX + wob * (1 - (y - 20) / (ground - 40));
      // 火箭
      ctx.save();
      ctx.translate(rx, y);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-6, -38, 12, 38); // 箭体
      ctx.fillStyle = '#1e293b'; ctx.fillRect(-6, -38, 12, 10); // 顶部
      // 栅格舵
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      const fin = Math.sin(t * 0.15) * 8;
      ctx.beginPath(); ctx.moveTo(-6, -34); ctx.lineTo(-16, -34 + fin); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(6, -34); ctx.lineTo(16, -34 - fin); ctx.stroke();
      // 着陆腿
      ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(-14, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(6, -6); ctx.lineTo(14, 0); ctx.stroke();
      // 反推火焰
      if (burning) {
        const fl = 12 + thrust * 10 + Math.sin(t * 0.6) * 4;
        ctx.fillStyle = 'rgba(249,115,22,.9)';
        ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(0, fl); ctx.lineTo(5, 0); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      // 读数
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('速度 ' + (v * 100).toFixed(0) + ' m/s' + (burning ? '（反推中）' : ''), 20, 24);
      const ok = td >= 0 && (td * 100) < 60;
      if (td >= 0) {
        ctx.fillStyle = ok ? '#4ade80' : '#f87171';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(ok ? '✓ 着陆成功' : '✗ 坠毁（推力不足）', padX - 45, 60);
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('推力 ' + thrust.toFixed(1) + '×重力', 20, 42);
      cap(ctx, V, '栅格舵修姿态，末段反推把速度压到零');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 恒星光谱：连续彩虹上的元素吸收暗线 */
  AN.starSpectrum = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mkCanvas(holder, 360, 210, true);
    let t = 0;
    const elements = [
      { name: '氢 H', lines: [656, 486, 434, 410] },
      { name: '钠 Na', lines: [589, 589.6] },
      { name: '铁 Fe', lines: [527, 517, 495, 466, 438, 430] }
    ];
    (function loop() {
      const ctx = V.ctx;
      const el = Math.max(0, Math.min(2, Math.round(D.el || 0)));
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 恒星
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.arc(180, 35, 14 + Math.sin(t * 0.1) * 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('恒星光 → 棱镜 →', 130, 68);
      // 连续光谱（380~700nm 映射到 30~330px）
      const x0 = 30, x1 = 330, y0 = 100, hh = 40;
      function wl2x(wl) { return x0 + (wl - 380) / 320 * (x1 - x0); }
      for (let x = x0; x < x1; x++) {
        const wl = 380 + (x - x0) / (x1 - x0) * 320;
        const hue = wl < 440 ? 260 - (wl - 380) / 60 * 20 : wl < 490 ? 240 - (wl - 440) / 50 * 60 : wl < 580 ? 180 - (wl - 490) / 90 * 120 : 60 - (wl - 580) / 70 * 60;
        ctx.fillStyle = 'hsl(' + Math.max(0, hue) + ',90%,50%)';
        ctx.fillRect(x, y0, 1, hh);
      }
      // 吸收暗线
      elements[el].lines.forEach(function (wl) {
        const x = wl2x(wl);
        ctx.fillStyle = '#000';
        ctx.fillRect(x - 1.5, y0, 3, hh);
        ctx.fillStyle = 'rgba(255,255,255,' + (0.5 + 0.5 * Math.sin(t * 0.1)) + ')';
        ctx.fillRect(x - 0.5, y0 - 8, 1, 8);
      });
      ctx.strokeStyle = '#475569'; ctx.strokeRect(x0, y0, x1 - x0, hh);
      // 波长刻度
      ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
      [400, 500, 600, 700].forEach(function (wl) {
        ctx.fillText(wl + 'nm', wl2x(wl) - 12, y0 + hh + 14);
      });
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText(elements[el].name + ' 的指纹：' + elements[el].lines.length + ' 条特征暗线', 60, 185);
      cap(ctx, V, '暗线位置唯一 → 比对即知恒星成分（氦先在太阳发现）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 系外行星凌日：遮挡星光的光变曲线 */
  AN.exoplanetTransit = function (holder, tp) {
    const D = (tp && tp.data) || {};
    const V = mkCanvas(holder, 340, 250, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      const rp = Math.max(0.5, Math.min(3, D.rp !== undefined ? D.rp : 1.5));
      const Rs = 32; // 恒星半径 px
      const Rp = rp * 4; // 行星半径 px（示意放大）
      const depth = Math.pow(Rp / Rs, 2); // 凌日深度（面积比）
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = 90, cy = 70;
      // 恒星
      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, Rs);
      grad.addColorStop(0, '#fef9c3'); grad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx, cy, Rs, 0, Math.PI * 2); ctx.fill();
      // 行星横过
      const ph = (t % 240) / 240; // 一个周期
      const px = cx - 70 + ph * 140;
      const py = cy + 6;
      if (Math.abs(px - cx) < Rs + Rp) {
        ctx.fillStyle = '#020617';
        ctx.beginPath(); ctx.arc(px, py, Rp, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.beginPath(); ctx.arc(px, py, Rp, 0, Math.PI * 2); ctx.stroke();
      }
      // 光变曲线（右下）
      const gx = 20, gy = 170, gw = 300, gh = 50;
      ctx.strokeStyle = '#475569';
      ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
      // 亮度：凌日时下降 depth
      const upto = ph * gw;
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= upto; x++) {
        const pph = x / gw;
        const px2 = cx - 70 + pph * 140;
        const transit = Math.abs(px2 - cx) < Rs * 0.9 ? 1 : 0;
        const bright = 1 - transit * depth * 3; // 显示放大 3 倍便于观察
        const y = gy - 8 - bright * (gh - 16);
        if (x === 0) ctx.moveTo(gx + x, y); else ctx.lineTo(gx + x, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('行星半径 ' + rp.toFixed(1) + '×地球 → 变暗深度 ≈ ' + (depth * 100).toFixed(2) + '%（示意）', 30, 24);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('亮度', gx - 2, gy - gh - 4);
      ctx.fillText('时间 →', gx + gw - 40, gy + 14);
      cap(ctx, V, '凹坑深度 = (R行星/R恒星)²，周期 = 轨道周期');
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
