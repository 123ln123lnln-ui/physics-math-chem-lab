/* concept-anim.js — 概念演示动画引擎库（核心生成器，参数化复用）
 * CA.render(holder, {core, mode, label, ...}) 挂载真实模拟动画。
 */
(function () {
  const CA = {};

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
  function scene(holder, w, h, dark, frame, stop) {
    const V = mk(holder, w, h, dark);
    let t = 0, alive = true;
    (function loop() {
      if (!alive) return;
      frame(V.ctx, V.w, V.h, t++);
      window.requestAnimationFrame(loop);
    })();
    return { stop: function () { alive = false; }, V: V };
  }
  function label(ctx, V, text, color) {
    ctx.fillStyle = color || (V.dark ? '#94a3b8' : '#475569');
    ctx.font = '11px sans-serif';
    ctx.fillText(text, 10, V.h - 8);
  }

  const GEN = {};

  /* ---------- C1 波动 ---------- */
  GEN.wave = function (holder, o) {
    const V = mk(holder, o.w || 340, 200, false); V.dark = false;
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const mid = V.h / 2;
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(V.w, mid); ctx.stroke();
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < V.w; x++) {
        const y = mid + (o.amp || 36) * Math.sin(2 * Math.PI * (o.f || 1) * x / V.w - t * 0.08 * (o.speed || 1));
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // 介质粒子上下振动
      ctx.fillStyle = '#dc2626';
      for (let i = 0; i < 8; i++) {
        const x = 20 + i * (V.w - 40) / 7;
        const y = mid + (o.amp || 36) * Math.sin(2 * Math.PI * (o.f || 1) * x / V.w - t * 0.08 * (o.speed || 1));
        ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
      }
      label(ctx, V, o.label || '横波：粒子上下振动，波向前传播');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.sound = function (holder, o) {
    const V = mk(holder, 340, 200, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      function draw(f, amp, y0, color, name) {
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < V.w; x++) {
          const y = y0 + amp * Math.sin(2 * Math.PI * f * x / V.w - t * 0.1);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
        ctx.fillText(name, 8, y0 - amp - 6);
      }
      draw(4, 22, 55, '#dc2626', '高音调 = 频率高');
      draw(1.5, 22, 145, '#2563eb', '低音调 = 频率低');
      label(ctx, V, o.label || '响度看振幅（波形高低），音调看频率（波形疏密）');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.doppler = function (holder, o) {
    const V = mk(holder, 340, 220, false);
    let t = 0;
    const rings = [];
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(0, 0, V.w, V.h);
      const sx = (t * 1.2) % (V.w + 60) - 30, sy = V.h / 2;
      if (t % 14 === 0) rings.push({ x: sx, y: sy, r: 0 });
      ctx.strokeStyle = 'rgba(37,99,235,.55)';
      rings.forEach(function (r) {
        r.r += 1.4;
        ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
      });
      while (rings.length > 40) rings.shift();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(sx, sy, 7, 0, Math.PI * 2); ctx.fill();
      label(ctx, V, o.label || '波源前进：前方波面密集（频率变高），后方稀疏');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.emWave = function (holder, o) {
    const V = mk(holder, 340, 200, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const mid = V.h / 2;
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < V.w; x++) {
        const y = mid + 40 * Math.sin(x * 0.06 - t * 0.12);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.strokeStyle = '#fbbf24';
      ctx.beginPath();
      for (let x = 0; x < V.w; x++) {
        const y = mid + 24 * Math.sin(x * 0.06 - t * 0.12 + Math.PI / 2);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('E 场（蓝）与 B 场（黄）互相垂直、同相传播', 10, 16);
      label(ctx, V, o.label || '电磁波：变化的电场与磁场交替产生，真空中以光速传播');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* ---------- C2 光线 ---------- */
  GEN.ray = function (holder, o) {
    const V = mk(holder, 340, 220, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const mode = o.mode;
      function arrow(x1, y1, x2, y2, color) {
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        const a = Math.atan2(y2 - y1, x2 - x1);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 10 * Math.cos(a - 0.35), y2 - 10 * Math.sin(a - 0.35));
        ctx.lineTo(x2 - 10 * Math.cos(a + 0.35), y2 - 10 * Math.sin(a + 0.35));
        ctx.fill();
      }
      if (mode === 'reflect') {
        ctx.fillStyle = '#94a3b8'; ctx.fillRect(V.w / 2 - 60, 170, 120, 6);
        const ph = (Math.sin(t * 0.03) + 1) / 2 * 20;
        arrow(60, 40 + ph, V.w / 2, 170, '#f59e0b');
        arrow(V.w / 2, 170, V.w - 60, 40 + ph, '#dc2626');
        ctx.setLineDash([4, 4]); ctx.strokeStyle = '#cbd5e1';
        ctx.beginPath(); ctx.moveTo(V.w / 2, 170); ctx.lineTo(V.w / 2, 30); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
        ctx.fillText('入射角 = 反射角（对法线）', V.w / 2 - 70, 20);
        label(ctx, V, o.label || '光的反射：三线共面、两角相等');
      } else if (mode === 'refract') {
        ctx.fillStyle = 'rgba(59,130,246,.18)'; ctx.fillRect(0, 110, V.w, 110);
        ctx.strokeStyle = '#3b82f6';
        ctx.beginPath(); ctx.moveTo(0, 110); ctx.lineTo(V.w, 110); ctx.stroke();
        arrow(70, 20, V.w / 2, 110, '#f59e0b');
        arrow(V.w / 2, 110, V.w / 2 + 55, 200, '#dc2626');
        label(ctx, V, o.label || '光从空气射入水中：偏向法线（折射角小于入射角）');
      } else if (mode === 'prism') {
        ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(V.w / 2, 40); ctx.lineTo(V.w / 2 - 60, 160); ctx.lineTo(V.w / 2 + 60, 160); ctx.closePath();
        ctx.stroke();
        arrow(20, 100, V.w / 2 - 30, 100, '#475569');
        const colors = ['#dc2626', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6'];
        colors.forEach(function (c, i) {
          arrow(V.w / 2 + 28, 110, V.w - 20, 70 + i * 22, c);
        });
        label(ctx, V, o.label || '三棱镜色散：白光分解为七色（折射率随波长不同）');
      } else if (mode === 'lens') {
        ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(V.w / 2, 20); ctx.lineTo(V.w / 2, 200); ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(V.w / 2 - 70, 110, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(V.w / 2 + 70, 110, 3, 0, Math.PI * 2); ctx.fill();
        arrow(30, 60, V.w / 2, 60, '#dc2626');
        arrow(V.w / 2, 60, V.w - 30, 148, '#dc2626');
        arrow(30, 160, V.w / 2, 110, '#dc2626');
        arrow(V.w / 2, 110, V.w - 30, 130, '#dc2626');
        label(ctx, V, o.label || '凸透镜对光线有会聚作用（过光心方向不变，平行光过焦点）');
      } else if (mode === 'fiber') {
        ctx.fillStyle = 'rgba(148,163,184,.25)'; ctx.fillRect(0, 70, V.w, 80);
        ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2;
        ctx.beginPath();
        let x = 0, y = 110, dir = -1;
        ctx.moveTo(x, y);
        while (x < V.w) {
          x += 40;
          y += dir * 35; dir = -dir;
          ctx.lineTo(Math.min(x, V.w), Math.max(75, Math.min(145, y)));
        }
        ctx.stroke();
        const px = (t * 2.5) % V.w;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(px, 110 + Math.sin(px * 0.16) * 30, 4, 0, Math.PI * 2); ctx.fill();
        label(ctx, V, o.label || '光导纤维：光在内壁反复全反射前进（信号几乎不泄漏）');
      } else {
        // straight: 直线传播 + 影子
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(40, 60, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#475569'; ctx.fillRect(V.w / 2 - 8, 80, 16, 70);
        for (let i = 0; i < 5; i++) {
          arrow(52, 60, V.w - 20, 30 + i * 40, i === 2 ? '#cbd5e1' : '#f59e0b');
        }
        ctx.fillStyle = 'rgba(30,41,59,.25)';
        ctx.beginPath();
        ctx.moveTo(V.w / 2 + 8, 80); ctx.lineTo(V.w, 40); ctx.lineTo(V.w, 200); ctx.lineTo(V.w / 2 + 8, 150);
        ctx.fill();
        label(ctx, V, o.label || '光在同种均匀介质中沿直线传播（影子的成因）');
      }
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* ---------- C3 粒子（布朗/热运动/扩散/熵/气体） ---------- */
  GEN.particles = function (holder, o) {
    const V = mk(holder, 340, 220, true);
    const N = o.n || 60;
    const ps = [];
    for (let i = 0; i < N; i++) {
      ps.push({
        x: o.half && i >= N / 2 ? V.w / 2 + Math.random() * (V.w / 2 - 10) : 10 + Math.random() * (o.half ? V.w / 2 - 20 : V.w - 20),
        y: 10 + Math.random() * (V.h - 30),
        c: o.half ? (i < N / 2 ? '#38bdf8' : '#f87171') : '#38bdf8',
        vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2
      });
    }
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = 'rgba(15,23,42,.28)'; ctx.fillRect(0, 0, V.w, V.h);
      if (o.half && t < 20) {
        ctx.strokeStyle = '#475569';
        ctx.beginPath(); ctx.moveTo(V.w / 2, 0); ctx.lineTo(V.w / 2, V.h); ctx.stroke();
      }
      ps.forEach(function (p) {
        const sp = o.speed || 1.4;
        p.x += p.vx * sp + (o.jitter ? (Math.random() - 0.5) * 3 : 0);
        p.y += p.vy * sp + (o.jitter ? (Math.random() - 0.5) * 3 : 0);
        if (p.x < 4 || p.x > V.w - 4) p.vx = -p.vx;
        if (p.y < 4 || p.y > V.h - 20) p.vy = -p.vy;
        p.x = Math.max(4, Math.min(V.w - 4, p.x));
        p.y = Math.max(4, Math.min(V.h - 20, p.y));
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
      });
      if (o.big) {
        ctx.fillStyle = '#fbbf24';
        const bx = V.w / 2 + Math.sin(t * 0.05) * 8 + (Math.random() - 0.5) * 4;
        const by = V.h / 2 + Math.cos(t * 0.04) * 8 + (Math.random() - 0.5) * 4;
        ctx.beginPath(); ctx.arc(bx, by, 12, 0, Math.PI * 2); ctx.fill();
      }
      label(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.state = function (holder, o) {
    const V = mk(holder, 340, 180, false);
    let t = 0;
    function box(ctx, x, y, name, mode) {
      ctx.strokeStyle = '#94a3b8'; ctx.strokeRect(x, y, 90, 100);
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText(name, x + 24, y - 6);
      ctx.fillStyle = '#3b82f6';
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        let px = x + 16 + i * 20, py = y + 16 + j * 20;
        if (mode === 'liq') { px += Math.sin(t * 0.05 + i * j) * 5; py += Math.cos(t * 0.04 + i + j) * 5; }
        if (mode === 'gas') { px = x + 10 + ((i * 37 + t * (1 + i)) % 70); py = y + 10 + ((j * 53 + t * (1 + j)) % 80); }
        ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
      }
    }
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      box(ctx, 18, 50, '固态', 'sol');
      box(ctx, 125, 50, '液态', 'liq');
      box(ctx, 232, 50, '气态', 'gas');
      label(ctx, V, o.label || '粒子排列：固态有序振动 → 液态可滑动 → 气态自由高速');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* ---------- C4 电路 ---------- */
  GEN.circuit = function (holder, o) {
    const V = mk(holder, 340, 210, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const on = o.autoSwitch ? (t % 160 < 90) : true;
      const x0 = 70, x1 = V.w - 70, y0 = 50, y1 = 160;
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 2.5;
      ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
      // 电池
      ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x0 - 12, y0 + 45); ctx.lineTo(x0 - 12, y0 + 75); ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0 - 18, y0 + 52); ctx.lineTo(x0 - 18, y0 + 68); ctx.stroke();
      // 开关
      if (o.autoSwitch) {
        ctx.strokeStyle = on ? '#16a34a' : '#dc2626'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x1 - 40, y0);
        ctx.lineTo(on ? x1 + 10 : x1 - 20, on ? y0 : y0 - 22);
        ctx.stroke();
      }
      // 灯泡
      const bx = (x0 + x1) / 2, by = y1;
      ctx.beginPath(); ctx.arc(bx, by, 14, 0, Math.PI * 2);
      ctx.fillStyle = on ? '#facc15' : '#e2e8f0'; ctx.fill();
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5; ctx.stroke();
      if (on) {
        const grad = ctx.createRadialGradient(bx, by, 2, bx, by, 36);
        grad.addColorStop(0, 'rgba(250,204,21,.5)'); grad.addColorStop(1, 'rgba(250,204,21,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(bx, by, 36, 0, Math.PI * 2); ctx.fill();
      }
      // 电流点
      if (on) {
        ctx.fillStyle = '#2563eb';
        const per = 2 * (x1 - x0 + y1 - y0);
        for (let k = 0; k < 8; k++) {
          let d = ((t * 1.5 + k * per / 8) % per);
          let px, py;
          if (d < x1 - x0) { px = x0 + d; py = y0; }
          else if (d < x1 - x0 + y1 - y0) { px = x1; py = y0 + (d - (x1 - x0)); }
          else if (d < 2 * (x1 - x0) + y1 - y0) { px = x1 - (d - (x1 - x0) - (y1 - y0)); py = y1; }
          else { px = x0; py = y1 - (d - 2 * (x1 - x0) - (y1 - y0)); }
          ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
        }
      }
      label(ctx, V, o.label || '闭合回路才有电流：电源提供电压，电荷定向移动形成电流');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.coil = function (holder, o) {
    const V = mk(holder, 340, 200, false);
    let ang = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      // 磁铁
      ctx.fillStyle = '#dc2626'; ctx.fillRect(30, 80, 40, 40);
      ctx.fillStyle = '#3b82f6'; ctx.fillRect(V.w - 70, 80, 40, 40);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif';
      ctx.fillText('N', 44, 105); ctx.fillText('S', V.w - 56, 105);
      // 旋转线圈（椭圆宽度随角度变化）
      const cx = V.w / 2, cy = 100;
      const wCoil = 60 * Math.abs(Math.cos(ang)) + 4;
      ctx.strokeStyle = '#b45309'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(cx, cy, wCoil, 46, 0, 0, Math.PI * 2); ctx.stroke();
      ang += 0.03;
      // 感应电流指示（发电模式）
      if (o.gen) {
        const I = Math.abs(Math.sin(ang));
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(cx, 165, 4 + I * 8, 0, Math.PI * 2); ctx.fill();
      }
      label(ctx, V, o.gen ? '发电机：线圈切割磁感线 → 产生感应电流（机械能→电能）' : '电动机：通电线圈在磁场中受力转动（电能→机械能）');
      window.requestAnimationFrame(loop);
    })();
  };

  /* ---------- C5 场线 ---------- */
  GEN.field = function (holder, o) {
    const V = mk(holder, 340, 220, true);
    const ctx = V.ctx;
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
    const q1 = { x: 110, y: 110, s: o.mode === 'magnet' ? 1 : 1 };
    const q2 = { x: 230, y: 110, s: -1 };
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      let x = q1.x + Math.cos(a) * 10, y = q1.y + Math.sin(a) * 10;
      ctx.strokeStyle = 'rgba(56,189,248,.5)';
      ctx.beginPath(); ctx.moveTo(x, y);
      for (let s = 0; s < 90; s++) {
        let ex = 0, ey = 0;
        [q1, q2].forEach(function (q) {
          const dx = x - q.x, dy = y - q.y;
          const d = Math.max(12, Math.hypot(dx, dy));
          ex += q.s * dx / (d * d) * 900;
          ey += q.s * dy / (d * d) * 900;
        });
        const m = Math.hypot(ex, ey) || 1;
        x += ex / m * 3; y += ey / m * 3;
        ctx.lineTo(x, y);
        if (x < 0 || x > V.w || y < 0 || y > V.h) break;
        if (Math.hypot(x - q2.x, y - q2.y) < 10) break;
      }
      ctx.stroke();
    }
    ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(q1.x, q1.y, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(q2.x, q2.y, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(o.mode === 'magnet' ? 'N' : '+', q1.x, q1.y + 4);
    ctx.fillText(o.mode === 'magnet' ? 'S' : '−', q2.x, q2.y + 4);
    ctx.textAlign = 'left';
    label(ctx, V, o.label || (o.mode === 'magnet' ? '磁体外部：磁感线从 N 极出发回到 S 极' : '电场线从正电荷出发，终止于负电荷'));
  };

  window.ConceptAnim = CA;
  window.ConceptAnim.GEN = GEN;
  window.ConceptAnim.render = function (holder, tpl) {
    if (!tpl || !tpl.core) {
      holder.innerHTML = '<div class="note">该知识点的演示模板建设中。</div>';
      return;
    }
    const g = GEN[tpl.core];
    if (g) g(holder, tpl.o || {});
    else if (window.ExploreAnim && ExploreAnim[tpl.core]) ExploreAnim[tpl.core](holder);
    else holder.innerHTML = '<div class="note">模板未找到：' + tpl.core + '</div>';
  };
})();
