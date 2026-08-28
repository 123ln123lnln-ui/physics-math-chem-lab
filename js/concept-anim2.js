/* concept-anim2.js — 概念演示动画引擎库（第二批核心生成器） */
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
    ctx.lineTo(x2 - 10 * Math.cos(a - 0.35), y2 - 10 * Math.sin(a - 0.35));
    ctx.lineTo(x2 - 10 * Math.cos(a + 0.35), y2 - 10 * Math.sin(a + 0.35));
    ctx.fill();
  }

  /* ---------- C6 力学机制 ---------- */
  GEN.inertia = function (holder, o) {
    const V = mk(holder, 340, 190, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const phase = (t % 240) / 240;
      const carX = phase < 0.6 ? 40 + phase / 0.6 * 120 : 160;
      const stopped = phase >= 0.6;
      // 小车
      ctx.fillStyle = '#475569'; ctx.fillRect(carX, 130, 70, 18);
      ctx.fillStyle = '#1e293b';
      ctx.beginPath(); ctx.arc(carX + 15, 152, 7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(carX + 55, 152, 7, 0, Math.PI * 2); ctx.fill();
      // 球：车停时继续向前
      const ballX = stopped ? carX + 35 + (phase - 0.6) / 0.4 * 70 : carX + 35;
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(Math.min(ballX, V.w - 20), 120, 9, 0, Math.PI * 2); ctx.fill();
      if (stopped) arrow(ctx, ballX - 4, 100, ballX + 26, 100, '#dc2626');
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText(stopped ? '车撞停，球因惯性继续向前！' : '球随车一起运动…', 10, 30);
      label(ctx, V.w, V.h, o.label || '惯性：物体保持原来运动状态的性质（与速度无关）');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.energy = function (holder, o) {
    const V = mk(holder, 340, 210, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const ph = (t % 300) / 300;
      const ang = ph * Math.PI * 2;
      // 滚摆：摆锤沿圆弧运动
      const cx = V.w / 2, cy = 20, L = 120;
      const bx = cx + L * Math.sin(ang * 0.5 * (ph < 0.5 ? 1 : -1) * Math.PI);
      const by = cy + L * Math.cos(Math.abs(Math.sin(ph * Math.PI)) * 1.35);
      const h = (by - 30) / 150; // 归一化高度
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.stroke();
      ctx.fillStyle = '#2563eb';
      ctx.beginPath(); ctx.arc(bx, by, 12, 0, Math.PI * 2); ctx.fill();
      // 能量条
      const Ep = 1 - Math.abs(Math.sin(ph * Math.PI * 2));
      ctx.fillStyle = '#cbd5e1'; ctx.fillRect(30, 60, 12, 110); ctx.fillRect(V.w - 42, 60, 12, 110);
      ctx.fillStyle = '#059669'; ctx.fillRect(30, 60 + 110 * (1 - Ep), 12, 110 * Ep);
      ctx.fillStyle = '#dc2626'; ctx.fillRect(V.w - 42, 60 + 110 * Ep, 12, 110 * (1 - Ep));
      ctx.fillStyle = '#059669'; ctx.font = '11px sans-serif'; ctx.fillText('势能', 24, 52);
      ctx.fillStyle = '#dc2626'; ctx.fillText('动能', V.w - 48, 52);
      label(ctx, V.w, V.h, o.label || '动能与势能相互转化，机械能总量不变（无摩擦时）');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.force = function (holder, o) {
    const V = mk(holder, 340, 200, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = V.h / 2 - 10;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill();
      const a = Math.sin(t * 0.02) * 0.5;
      arrow(ctx, cx, cy, cx - 90 * Math.cos(a), cy - 90 * Math.sin(a) - 60, '#dc2626');
      arrow(ctx, cx, cy, cx + 90 * Math.cos(a), cy - 90 * Math.sin(a) - 60, '#2563eb');
      arrow(ctx, cx, cy, cx, cy + 90, '#059669');
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('F₁', cx - 100, cy - 70); ctx.fillText('F₂', cx + 88, cy - 70); ctx.fillText('F₃', cx + 8, cy + 105);
      label(ctx, V.w, V.h, o.label || '受力分析：画出物体受到的所有力（方向沿力的作用线）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* ---------- C7 原子与微观 ---------- */
  GEN.atom = function (holder, o) {
    const V = mk(holder, 300, 220, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = V.h / 2;
      // 核
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(cx, cy, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('核', cx, cy + 3);
      // 电子层
      const shells = o.shells || [[30, 2], [55, 6]];
      shells.forEach(function (sh, si) {
        ctx.strokeStyle = 'rgba(148,163,184,.4)';
        ctx.beginPath(); ctx.arc(cx, cy, sh[0], 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < sh[1]; i++) {
          const a = t * 0.02 * (si % 2 === 0 ? 1 : -1) + i * Math.PI * 2 / sh[1];
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath(); ctx.arc(cx + sh[0] * Math.cos(a), cy + sh[0] * Math.sin(a), 4, 0, Math.PI * 2); ctx.fill();
        }
      });
      ctx.textAlign = 'left';
      label(ctx, V.w, V.h, o.label || '原子：原子核（质子+中子）+ 分层运动的核外电子');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.electronJump = function (holder, o) {
    const V = mk(holder, 320, 220, true);
    let t = 0, level = 2;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cy0 = 30;
      const ys = [0, 0, 40, 90, 130, 160].map(function (v) { return cy0 + v; });
      for (let n = 1; n <= 5; n++) {
        ctx.strokeStyle = 'rgba(148,163,184,.35)';
        ctx.beginPath(); ctx.moveTo(30, ys[n]); ctx.lineTo(V.w - 30, ys[n]); ctx.stroke();
        ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif';
        ctx.fillText('n=' + n, 4, ys[n] + 3);
      }
      if (t % 180 === 0) level = 2 + Math.floor(Math.random() * 3);
      const ey = ys[level];
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath(); ctx.arc(V.w / 2 + Math.sin(t * 0.03) * 60, ey, 6, 0, Math.PI * 2); ctx.fill();
      if (t % 180 > 160) {
        // 跃迁：发射光子
        arrow(ctx, V.w / 2, ey, V.w / 2 + 40, ey - 50, '#fbbf24');
        ctx.fillStyle = '#fbbf24'; ctx.font = '11px sans-serif';
        ctx.fillText('光子 (hν)', V.w / 2 + 45, ey - 52);
      }
      label(ctx, V.w, V.h, o.label || '电子在不同能级间跃迁，释放/吸收特定频率的光子');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.brownian = function (holder, o) {
    GEN.particles(holder, { n: 70, big: true, jitter: true, speed: 1.2, dark: true, label: o.label || '布朗运动：花粉微粒被水分子从四面八方撞击而不停抖动' });
  };

  /* ---------- C8 化学机制 ---------- */
  GEN.displacement = function (holder, o) {
    const V = mk(holder, 320, 210, false);
    const ions = [];
    for (let i = 0; i < 14; i++) ions.push({ x: 60 + Math.random() * 200, y: 80 + Math.random() * 90, on: false, tx: 0, ty: 0 });
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      ctx.fillStyle = 'rgba(59,130,246,.12)'; ctx.fillRect(40, 60, V.w - 80, 120);
      ctx.strokeStyle = '#94a3b8'; ctx.strokeRect(40, 55, V.w - 80, 130);
      // 铁钉
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(V.w / 2 - 8, 40, 16, 130);
      const covered = ions.filter(function (i) { return i.on; }).length;
      if (covered > 0) {
        ctx.fillStyle = 'rgba(180,83,9,.85)';
        ctx.fillRect(V.w / 2 - 9, 170 - covered * 8, 18, covered * 8);
      }
      if (t % 90 === 0) {
        const free = ions.filter(function (i) { return !i.on; });
        if (free.length) { const p = free[0]; p.on = true; p.tx = V.w / 2; p.ty = 165 - covered * 8; }
      }
      ions.forEach(function (p) {
        if (!p.on) {
          p.x += (Math.random() - 0.5) * 2; p.y += (Math.random() - 0.5) * 2;
          p.x = Math.max(50, Math.min(V.w - 50, p.x)); p.y = Math.max(70, Math.min(170, p.y));
          ctx.fillStyle = 'rgba(37,99,235,.9)';
          ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill();
        } else {
          p.tx = V.w / 2; 
          ctx.fillStyle = 'rgba(180,83,9,.95)';
          ctx.beginPath(); ctx.arc(p.tx, p.ty, 4, 0, Math.PI * 2); ctx.fill();
        }
      });
      label(ctx, V.w, V.h, o.label || '置换反应：活泼金属（Fe）把不活泼金属（Cu）从溶液中换出来');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.combustion = function (holder, o) {
    const V = mk(holder, 320, 200, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      // 火焰（三要素齐全）
      const fx = V.w / 2;
      for (let i = 0; i < 7; i++) {
        const rr = 26 - i * 3;
        ctx.fillStyle = i < 3 ? 'rgba(239,68,68,' + (0.5 - i * 0.1) + ')' : 'rgba(250,204,21,' + (0.7 - i * 0.08) + ')';
        ctx.beginPath();
        ctx.ellipse(fx + Math.sin(t * 0.1 + i) * 4, 120 - i * 6, rr * 0.7, rr, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('可燃物 ✓', 30, 40);
      ctx.fillText('氧气 ✓', fx - 20, 40);
      ctx.fillText('温度≥着火点 ✓', V.w - 120, 40);
      label(ctx, V.w, V.h, o.label || '燃烧三条件缺一不可：可燃物、氧气、温度达到着火点');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.reaction = function (holder, o) {
    const V = mk(holder, 320, 200, false);
    let t = 0;
    const balls = [];
    for (let i = 0; i < 8; i++) {
      balls.push({ x: 40 + Math.random() * 240, y: 40 + Math.random() * 110, vx: (Math.random() - 0.5) * 2.4, vy: (Math.random() - 0.5) * 2.4, c: i % 2 ? '#dc2626' : '#3b82f6' });
    }
    let flashes = [];
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      balls.forEach(function (b) {
        b.x += b.vx * (o.speed || 1); b.y += b.vy * (o.speed || 1);
        if (b.x < 10 || b.x > V.w - 10) b.vx = -b.vx;
        if (b.y < 10 || b.y > V.h - 30) b.vy = -b.vy;
        ctx.fillStyle = b.c;
        ctx.beginPath(); ctx.arc(b.x, b.y, 6, 0, Math.PI * 2); ctx.fill();
      });
      // 碰撞检测→闪光（有效碰撞=反应）
      for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) {
        if (balls[i].c !== balls[j].c && Math.hypot(balls[i].x - balls[j].x, balls[i].y - balls[j].y) < 13) {
          if (Math.random() < 0.3) flashes.push({ x: (balls[i].x + balls[j].x) / 2, y: (balls[i].y + balls[j].y) / 2, r: 3 });
        }
      }
      flashes = flashes.filter(function (f) { return f.r < 20; });
      flashes.forEach(function (f) {
        f.r += 0.8;
        ctx.strokeStyle = 'rgba(245,158,11,' + (1 - f.r / 20) + ')';
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.stroke();
      });
      label(ctx, V.w, V.h, o.label || '碰撞理论：反应物粒子有效碰撞才发生反应（浓度↑温度↑→碰撞增多）');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.esterification = function (holder, o) {
    const V = mk(holder, 320, 190, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const ph = (t % 240) / 240;
      ctx.font = '13px sans-serif'; ctx.fillStyle = '#1e293b';
      ctx.fillText('CH₃COOH', 30, 90);
      ctx.fillText('＋ C₂H₅OH', 110, 90);
      arrow(ctx, 215, 86, 255, 86, '#94a3b8');
      ctx.fillText('CH₃COOC₂H₅ + H₂O', 232, 90);
      // 断键示意
      ctx.strokeStyle = '#dc2626'; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(86, 78); ctx.lineTo(86, 60); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(172, 78); ctx.lineTo(172, 60); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#b45309'; ctx.font = '11px sans-serif';
      ctx.fillText('酸脱 -OH', 60, 52); ctx.fillText('醇脱 -H', 150, 52);
      ctx.fillStyle = 'rgba(59,130,246,.2)';
      ctx.fillRect(60, 120, 200, 40);
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('浓硫酸：催化剂 + 吸水剂（促使平衡正向移动）', 65, 145);
      label(ctx, V.w, V.h, o.label || '酯化反应机理：酸脱羟基醇脱氢（同位素示踪实验证明）');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.orbitals = function (holder, o) {
    const V = mk(holder, 300, 210, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = 'rgba(15,23,42,.15)'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = V.h / 2;
      // 概率云：随机散点（|ψ|² 的蒙特卡洛示意）
      for (let i = 0; i < 60; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.abs(Math.random() * Math.random()) * 80;
        ctx.fillStyle = 'rgba(56,189,248,' + (0.7 - r / 120) + ')';
        ctx.fillRect(cx + r * Math.cos(a), cy + r * Math.sin(a) * 0.8, 2, 2);
      }
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
      label(ctx, V.w, V.h, o.label || '电子云：电子出现概率的分布（不是轨道！量子力学的图像）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* ---------- C9 几何与数学机制 ---------- */
  GEN.congruent = function (holder, o) {
    const V = mk(holder, 320, 190, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const ox = 60 + Math.min(60, t * 0.3);
      function tri(x, y, fill) {
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.moveTo(x, y + 90); ctx.lineTo(x + 120, y + 90); ctx.lineTo(x + 50, y); ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1.5; ctx.stroke();
      }
      tri(40, 40, 'rgba(37,99,235,.3)');
      tri(ox, 40, 'rgba(220,38,38,.3)');
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('平移重合 → 形状大小完全相同', 70, 30);
      label(ctx, V.w, V.h, o.label || '全等：能完全重合的两个图形（对应边相等、对应角相等）');
      t = (t + 1) % 400;
      window.requestAnimationFrame(loop);
    })();
  };
  GEN.symmetry = function (holder, o) {
    const V = mk(holder, 320, 190, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const cx = V.w / 2;
      ctx.setLineDash([4, 4]); ctx.strokeStyle = '#94a3b8';
      ctx.beginPath(); ctx.moveTo(cx, 20); ctx.lineTo(cx, V.h - 25); ctx.stroke();
      ctx.setLineDash([]);
      const a = Math.sin(t * 0.02) * 0.2;
      function butterfly(side) {
        const s = side === 'L' ? -1 : 1;
        ctx.save();
        ctx.translate(cx, V.h / 2 - 10);
        ctx.scale(s * Math.cos(a) + (s === 1 ? 0.4 : 0), 1);
        ctx.fillStyle = side === 'L' ? 'rgba(37,99,235,.5)' : 'rgba(220,38,38,.5)';
        ctx.beginPath();
        ctx.moveTo(0, -30); ctx.quadraticCurveTo(70, -60, 80, -10);
        ctx.quadraticCurveTo(60, 40, 0, 30); ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      butterfly('L'); butterfly('R');
      label(ctx, V.w, V.h, o.label || '轴对称：沿对称轴折叠后两边完全重合');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.similar = function (holder, o) {
    const V = mk(holder, 320, 190, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const k = 1 + Math.sin(t * 0.015) * 0.5;
      function tri(cx, cy, s, color) {
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 50 * s, cy + 40 * s); ctx.lineTo(cx + 50 * s, cy + 40 * s); ctx.lineTo(cx, cy - 45 * s);
        ctx.closePath(); ctx.stroke();
      }
      tri(100, 110, 1, '#2563eb');
      tri(230, 110, k, '#dc2626');
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('相似比 k = ' + k.toFixed(2), 180, 30);
      ctx.fillText('面积比 = k² = ' + (k * k).toFixed(2), 180, 48);
      label(ctx, V.w, V.h, o.label || '相似：形状相同大小不同；对应边成比例，面积比=相似比的平方');
      t++; window.requestAnimationFrame(loop);
    })();
  };
  GEN.polyhedron = function (holder, o) {
    const V = mk(holder, 300, 220, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = V.h / 2;
      const a = t * 0.01;
      const verts = [];
      [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].forEach(function (v) {
        const x = v[0] * Math.cos(a) - v[2] * Math.sin(a);
        const z = v[0] * Math.sin(a) + v[2] * Math.cos(a);
        const sc = 3.2 / (4.5 + z);
        verts.push([cx + x * 55 * sc, cy + v[1] * 55 * sc, z]);
      });
      const E = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
      E.forEach(function (e) {
        ctx.strokeStyle = 'rgba(56,189,248,.8)';
        ctx.beginPath(); ctx.moveTo(verts[e[0]][0], verts[e[0]][1]); ctx.lineTo(verts[e[1]][0], verts[e[1]][1]); ctx.stroke();
      });
      verts.forEach(function (v) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(v[0], v[1], 2.5, 0, Math.PI * 2); ctx.fill();
      });
      label(ctx, V.w, V.h, o.label || '立体图形投影：三视图由主视/左视/俯视三个方向观察得到');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  window.ConceptAnim.GEN = GEN;
})();
