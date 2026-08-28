/* concept-anim4.js — 概念针对性演示引擎（第一批：数学方法 + 初中化学实验）
 * 每个生成器只服务一个知识点，画面各不相同。 */
(function () {
  const GEN = window.ConceptAnim.GEN;
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

  /* 抽样调查：总体网格中随机抽样本 */
  GEN.sampling = function (holder, o) {
    const V = mk(holder, 340, 210, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      // 总体 10x6
      for (let i = 0; i < 10; i++) for (let j = 0; j < 6; j++) {
        ctx.fillStyle = 'rgba(148,163,184,.25)';
        ctx.fillRect(30 + i * 28, 30 + j * 24, 22, 18);
      }
      // 已抽样本（逐个点亮）
      const n = Math.min(12, Math.floor(t / 40));
      for (let k = 0; k < n; k++) {
        const seed = k * 73 % 60;
        const i = seed % 10, j = Math.floor(seed / 10);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(30 + i * 28, 30 + j * 24, 22, 18);
      }
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('从总体中随机抽取样本（橙色），用样本估计总体', 30, 200);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 充分必要条件：集合包含方向 */
  GEN.necessary = function (holder, o) {
    const V = mk(holder, 320, 190, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = 85;
      ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(cx, cy, 105, 60, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#dc2626';
      ctx.beginPath(); ctx.ellipse(cx, cy, 55, 32, 0, 0, Math.PI * 2); ctx.stroke();
      const blink = Math.floor(t / 60) % 2;
      ctx.fillStyle = blink ? '#3b82f6' : '#dc2626';
      ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(blink ? 'q（大范围·必要条件）' : 'p（小范围·充分条件）', cx, blink ? cy - 44 : cy + 4);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748b'; ctx.font = '11px sans-serif';
      ctx.fillText('小范围 ⇒ 大范围：p 能推出 q', 70, 172);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 量词否定：∀ 与 ∃ 互换 */
  GEN.quantifier = function (holder, o) {
    const V = mk(holder, 320, 170, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const neg = Math.floor(t / 120) % 2;
      ctx.font = 'bold 26px serif'; ctx.textAlign = 'center';
      ctx.fillStyle = neg ? '#dc2626' : '#2563eb';
      ctx.fillText(neg ? '∃x, ¬p(x)' : '∀x, p(x)', V.w / 2, 60);
      ctx.font = '13px sans-serif'; ctx.fillStyle = '#475569';
      ctx.fillText(neg ? '存在一个 x 使命题不成立' : '对所有 x 命题都成立', V.w / 2, 95);
      ctx.fillStyle = '#f59e0b'; ctx.font = '11px sans-serif';
      ctx.fillText('否定 = 换量词（∀↔∃）+ 否定结论', V.w / 2, 130);
      ctx.textAlign = 'left';
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 空气中氧气含量：钟罩水面上升 1/5 */
  GEN.oxygenMeasure = function (holder, o) {
    const V = mk(holder, 320, 230, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const phase = (t % 400) / 400;
      const cx = V.w / 2;
      // 水槽
      ctx.fillStyle = 'rgba(59,130,246,.2)'; ctx.fillRect(60, 170, 200, 40);
      ctx.strokeStyle = '#94a3b8'; ctx.strokeRect(60, 170, 200, 40);
      // 钟罩
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(120, 175); ctx.lineTo(120, 50); ctx.arc(cx, 50, 40, Math.PI, 0); ctx.lineTo(200, 175);
      ctx.stroke();
      // 燃烧的红磷
      if (phase < 0.35) {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath(); ctx.arc(cx, 120, 6 + Math.sin(t * 0.3) * 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(245,158,11,.7)';
        ctx.beginPath(); ctx.arc(cx, 108, 4 + Math.random() * 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
        ctx.fillText('红磷燃烧，消耗 O₂…', 90, 30);
      } else {
        // 水面上升
        const rise = Math.min(1, (phase - 0.35) / 0.4);
        const h = rise * 25; // 约 1/5 的钟罩高度
        ctx.fillStyle = 'rgba(59,130,246,.5)';
        ctx.fillRect(122, 175 - h, 76, h);
        ctx.setLineDash([3, 3]); ctx.strokeStyle = '#dc2626';
        ctx.beginPath(); ctx.moveTo(112, 150); ctx.lineTo(208, 150); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#dc2626'; ctx.font = '11px sans-serif';
        ctx.fillText('水面上升 ≈ 1/5 → O₂ 占空气 1/5', 60, 30);
      }
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 制取氧气：高锰酸钾加热 + 排水集气 */
  GEN.makeOxygen = function (holder, o) {
    const V = mk(holder, 340, 210, false);
    const bubbles = [];
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      // 试管（左，倾斜）
      ctx.save();
      ctx.translate(80, 90); ctx.rotate(-0.25);
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.strokeRect(-15, -40, 30, 80);
      ctx.fillStyle = '#7c3aed'; ctx.fillRect(-12, 10, 24, 26); // 高锰酸钾
      ctx.restore();
      // 火焰
      ctx.fillStyle = 'rgba(245,158,11,' + (0.6 + Math.random() * 0.3) + ')';
      ctx.beginPath(); ctx.ellipse(80, 150, 10, 16 + Math.random() * 4, 0, 0, Math.PI * 2); ctx.fill();
      // 导管
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(95, 55); ctx.quadraticCurveTo(160, 30, 200, 60); ctx.lineTo(215, 120); ctx.stroke();
      // 集气瓶（排水法）
      ctx.fillStyle = 'rgba(59,130,246,.2)'; ctx.fillRect(190, 120, 90, 70);
      ctx.strokeStyle = '#64748b'; ctx.strokeRect(190, 120, 90, 70);
      const fill = Math.min(60, t * 0.15 % 70);
      ctx.fillStyle = 'rgba(226,232,240,.9)';
      ctx.fillRect(193, 123, 84, fill);
      if (t % 6 === 0) bubbles.push({ x: 215, y: 185, r: 2 + Math.random() * 2 });
      for (let i = bubbles.length - 1; i >= 0; i--) {
        bubbles[i].y -= 1.4;
        if (bubbles[i].y < 125 + fill) { bubbles.splice(i, 1); continue; }
        ctx.strokeStyle = 'rgba(147,197,253,.9)';
        ctx.beginPath(); ctx.arc(bubbles[i].x + Math.sin(i) * 6, bubbles[i].y, bubbles[i].r, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('加热高锰酸钾 → O₂ 用排水法收集', 60, 200);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* CO 中毒：血红蛋白抢位 */
  GEN.coPoison = function (holder, o) {
    const V = mk(holder, 340, 190, false);
    let t = 0;
    const seats = [];
    for (let i = 0; i < 6; i++) seats.push({ occ: null });
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('血红蛋白的 6 个结合位点：', 20, 22);
      seats.forEach(function (s, i) {
        const x = 50 + i * 45, y = 80;
        ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.stroke();
        // CO 逐步抢占
        const step = Math.floor(t / 90);
        if (i < step % 7) {
          ctx.fillStyle = '#334155';
          ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('CO', x, y + 3); ctx.textAlign = 'left';
        } else {
          ctx.fillStyle = 'rgba(59,130,246,.5)';
          ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('O₂', x, y + 3); ctx.textAlign = 'left';
        }
      });
      ctx.fillStyle = '#dc2626'; ctx.font = '11px sans-serif';
      ctx.fillText('CO 结合力是 O₂ 的 200 倍 → 人体缺氧', 60, 140);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 燃料：完全燃烧 vs 不完全燃烧 */
  GEN.fuel = function (holder, o) {
    const V = mk(holder, 340, 190, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      function flame(x, good) {
        for (let i = 0; i < 5; i++) {
          const rr = 18 - i * 3;
          ctx.fillStyle = good ? 'rgba(59,130,246,' + (0.5 - i * 0.08) + ')' : 'rgba(245,158,11,' + (0.5 - i * 0.08) + ')';
          ctx.beginPath();
          ctx.ellipse(x + Math.sin(t * 0.12 + i) * 3, 120 - i * 9, rr * 0.6, rr, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#334155'; ctx.fillRect(x - 20, 128, 40, 12);
      }
      flame(100, true); flame(240, false);
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('完全燃烧（蓝焰）', 55, 160);
      ctx.fillText('不完全燃烧（黄焰+黑烟）', 185, 160);
      ctx.fillStyle = '#94a3b8';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.arc(245 + Math.sin(t * 0.05 + i * 2) * 8, 70 - i * 12 - (t % 40), 4, 0, Math.PI * 2); ctx.fill();
      }
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 配制溶液：称量-量取-溶解 动画 */
  GEN.makeSolution = function (holder, o) {
    const V = mk(holder, 340, 190, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const step = Math.floor(t / 130) % 3;
      ctx.fillStyle = '#475569'; ctx.font = 'bold 12px sans-serif';
      const names = ['① 计算 + 称量（天平称溶质）', '② 量取（量筒量水，平视读数）', '③ 溶解（烧杯 + 玻璃棒搅拌）'];
      ctx.fillText(names[step], 60, 24);
      if (step === 0) {
        // 天平
        ctx.strokeStyle = '#475569'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(170, 60); ctx.lineTo(170, 150); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(100, 70); ctx.lineTo(240, 70); ctx.stroke();
        ctx.fillStyle = '#f59e0b'; ctx.fillRect(90, 66, 30, 8); ctx.fillRect(220, 66, 30, 8);
        ctx.fillText('砝码', 222, 60);
      } else if (step === 1) {
        ctx.strokeStyle = '#64748b'; ctx.strokeRect(150, 50, 40, 100);
        ctx.fillStyle = 'rgba(59,130,246,.5)';
        ctx.fillRect(153, 100, 34, 47);
        ctx.strokeStyle = '#dc2626'; ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(130, 100); ctx.lineTo(210, 100); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#dc2626'; ctx.fillText('平视凹液面最低处', 215, 104);
      } else {
        ctx.strokeStyle = '#64748b';
        ctx.beginPath(); ctx.moveTo(130, 60); ctx.lineTo(120, 150); ctx.lineTo(220, 150); ctx.lineTo(210, 60); ctx.stroke();
        ctx.fillStyle = 'rgba(59,130,246,.4)'; ctx.fillRect(126, 90, 88, 58);
        const ang = t * 0.08;
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(170, 50); ctx.lineTo(170 + Math.cos(ang) * 30, 110 + Math.sin(ang) * 10); ctx.stroke();
      }
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 酸的通性：H⁺ 中心辐射 */
  GEN.acidHub = function (holder, o) {
    const V = mk(holder, 320, 220, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = 105;
      const items = ['石蕊变红', '与活泼金属 → H₂', '与金属氧化物', '与碱中和', '与某些盐'];
      const active = Math.floor(t / 90) % items.length;
      items.forEach(function (name, i) {
        const a = -Math.PI / 2 + i * Math.PI * 2 / items.length;
        const x = cx + 105 * Math.cos(a), y = cy + 78 * Math.sin(a);
        ctx.strokeStyle = i === active ? '#dc2626' : '#cbd5e1';
        ctx.lineWidth = i === active ? 2.5 : 1;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = i === active ? '#fee2e2' : '#f8fafc';
        ctx.strokeStyle = i === active ? '#dc2626' : '#cbd5e1';
        ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#1e293b'; ctx.font = '9.5px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(name, x, y + 3); ctx.textAlign = 'left';
      });
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('H⁺', cx, cy + 5); ctx.textAlign = 'left';
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 碱的通性：OH⁻ 中心辐射 */
  GEN.baseHub = function (holder, o) {
    const V = mk(holder, 320, 220, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = 105;
      const items = ['石蕊变蓝', '酚酞变红', '与非金属氧化物', '与酸中和', '与某些盐'];
      const active = Math.floor(t / 90) % items.length;
      items.forEach(function (name, i) {
        const a = -Math.PI / 2 + i * Math.PI * 2 / items.length;
        const x = cx + 105 * Math.cos(a), y = cy + 78 * Math.sin(a);
        ctx.strokeStyle = i === active ? '#2563eb' : '#cbd5e1';
        ctx.lineWidth = i === active ? 2.5 : 1;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = i === active ? '#dbeafe' : '#f8fafc';
        ctx.strokeStyle = i === active ? '#2563eb' : '#cbd5e1';
        ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#1e293b'; ctx.font = '9.5px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(name, x, y + 3); ctx.textAlign = 'left';
      });
      ctx.fillStyle = '#2563eb';
      ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('OH⁻', cx, cy + 5); ctx.textAlign = 'left';
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 复分解反应：离子交换 AB + CD → AD + CB */
  GEN.metathesis = function (holder, o) {
    const V = mk(holder, 340, 190, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const ph = Math.min(1, (t % 260) / 130);
      function ball(x, y, color, label) {
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(label, x, y + 3); ctx.textAlign = 'left';
      }
      // 交换动画：A(+A) 与 D 互换伙伴
      const lerp = function (a, b) { return a + (b - a) * ph; };
      ball(lerp(60, 60), 60, '#dc2626', 'A⁺');
      ball(lerp(110, 250), 60, '#3b82f6', 'B⁻');
      ball(lerp(230, 110), 130, '#22c55e', 'C⁺');
      ball(lerp(280, 280), 130, '#f59e0b', 'D⁻');
      ctx.fillStyle = '#475569'; ctx.font = '12px sans-serif';
      ctx.fillText('AB + CD', 40, 24);
      ctx.fillText(ph > 0.9 ? '→ AD↓ + CB（沉淀离开溶液，反应完成）' : '互相交换成分…', 130, 24);
      if (ph > 0.9) {
        ctx.fillStyle = 'rgba(148,163,184,.5)';
        ctx.beginPath(); ctx.arc(60, 60, 18, 0, Math.PI * 2); ctx.fill();
      }
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 化肥：N-P-K 作用部位 */
  GEN.fertilizer = function (holder, o) {
    const V = mk(holder, 320, 200, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const items = [
        ['N 氮', '#22c55e', '叶', 70],
        ['P 磷', '#f59e0b', '果', 160],
        ['K 钾', '#3b82f6', '茎', 250]
      ];
      items.forEach(function (it, i) {
        const x = it[3], active = Math.floor(t / 100) % 3 === i;
        // 植株
        ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x, 160); ctx.lineTo(x, 100); ctx.stroke();
        ctx.fillStyle = active ? it[1] : 'rgba(148,163,184,.5)';
        if (i === 0) { // 叶
          ctx.beginPath(); ctx.ellipse(x - 12, 110, 12, 7, -0.5, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(x + 12, 120, 12, 7, 0.5, 0, Math.PI * 2); ctx.fill();
        } else if (i === 1) { // 果
          ctx.beginPath(); ctx.arc(x, 95, 10, 0, Math.PI * 2); ctx.fill();
        } else { // 茎
          ctx.fillRect(x - 4, 100, 8, 60);
        }
        ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(it[0] + ' → ' + it[2], x, 180);
        ctx.textAlign = 'left';
      });
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 制取 CO₂：石灰石 + 盐酸，向上排空气法 */
  GEN.makeCO2 = function (holder, o) {
    const V = mk(holder, 340, 210, false);
    const bubbles = [];
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      // 锥形瓶
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 70); ctx.lineTo(70, 160); ctx.lineTo(150, 160); ctx.lineTo(140, 70);
      ctx.stroke();
      ctx.fillStyle = 'rgba(250,204,21,.25)';
      ctx.fillRect(74, 120, 72, 38); // 盐酸
      // 石灰石
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath(); ctx.arc(95, 150, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(120, 148, 5, 0, Math.PI * 2); ctx.fill();
      if (t % 5 === 0) bubbles.push({ x: 85 + Math.random() * 40, y: 145, r: 2 + Math.random() * 2 });
      for (let i = bubbles.length - 1; i >= 0; i--) {
        bubbles[i].y -= 1.2;
        if (bubbles[i].y < 122) { bubbles.splice(i, 1); continue; }
        ctx.strokeStyle = 'rgba(148,163,184,.8)';
        ctx.beginPath(); ctx.arc(bubbles[i].x, bubbles[i].y, bubbles[i].r, 0, Math.PI * 2); ctx.stroke();
      }
      // 导管到集气瓶（向上排空气）
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(110, 70); ctx.lineTo(110, 45); ctx.lineTo(230, 45); ctx.lineTo(230, 100); ctx.stroke();
      ctx.strokeStyle = '#64748b';
      ctx.strokeRect(200, 100, 60, 90);
      ctx.fillStyle = 'rgba(148,163,184,.35)';
      ctx.fillRect(203, 103 + Math.max(0, 84 - t * 0.2 % 90), 54, Math.min(84, t * 0.2 % 90));
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('CO₂ 密度比空气大 → 向上排空气法收集', 40, 200);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
