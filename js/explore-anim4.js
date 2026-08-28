/* explore-anim4.js — 高质量原理演示引擎（30 个，每个对应一个科学机制） */
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

  /* 圆面积 = πr²：扇形重排成长方形 */
  AN.circleArea = function (holder, o) {
    const V = mk(holder, 340, 190, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const k = Math.min(1, (t % 300) / 150); // 0=圆 1=重排
      const n = 12, R = 55;
      const cx = 80, cy = 95;
      for (let i = 0; i < n; i++) {
        const a0 = i * 2 * Math.PI / n, a1 = (i + 1) * 2 * Math.PI / n;
        // 目标：排成一行的三角形
        const tx = 170 + i * (Math.PI * R / n), ty = 120;
        ctx.fillStyle = i % 2 ? 'rgba(37,99,235,.5)' : 'rgba(220,38,38,.5)';
        ctx.beginPath();
        if (k < 1) {
          const mx = cx + R / 2 * Math.cos((a0 + a1) / 2), my = cy + R / 2 * Math.sin((a0 + a1) / 2);
          const x0 = cx + (1 - k) * (R * Math.cos(a0) - 0) + k * (tx - cx + R * Math.cos(a0)) * 0; // 插值简化
          // 简化：直接在圆位置与行位置间线性插值三个顶点
          const p1 = [cx, cy], p2 = [cx + R * Math.cos(a0), cy + R * Math.sin(a0)], p3 = [cx + R * Math.cos(a1), cy + R * Math.sin(a1)];
          const q1 = [tx + Math.PI * R / n / 2, ty - R], q2 = [tx, ty], q3 = [tx + Math.PI * R / n, ty];
          ctx.moveTo(p1[0] + (q1[0] - p1[0]) * k, p1[1] + (q1[1] - p1[1]) * k);
          ctx.lineTo(p2[0] + (q2[0] - p2[0]) * k, p2[1] + (q2[1] - p2[1]) * k);
          ctx.lineTo(p3[0] + (q3[0] - p3[0]) * k, p3[1] + (q3[1] - p3[1]) * k);
        }
        ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText(k > 0.9 ? '长 = 半周长 πr，宽 = r → 面积 = πr²' : '把圆切成扇形，交错重排…', 60, 20);
      cap(ctx, V, '分的份数越多越接近长方形（极限思想）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 高尔顿板：随机→正态 */
  AN.galton = function (holder, o) {
    const V = mk(holder, 300, 240, true);
    const bins = new Array(13).fill(0);
    const balls = [];
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      if (t % 10 === 0 && balls.length < 60) balls.push({ r: 0, pos: 6, y: 10, wait: 0 });
      // 钉子
      for (let r = 0; r < 12; r++) for (let i = 0; i <= r; i++) {
        ctx.fillStyle = '#475569';
        ctx.beginPath(); ctx.arc(V.w / 2 + (i - r / 2) * 20, 20 + r * 12, 2, 0, Math.PI * 2); ctx.fill();
      }
      balls.forEach(function (b) {
        if (b.r < 12) {
          b.wait++;
          if (b.wait > 4) { b.wait = 0; b.pos += Math.random() < 0.5 ? 0 : 1; b.r++; }
          b.y = 20 + b.r * 12;
        } else {
          bins[b.pos]++;
          b.dead = true;
        }
        const x = V.w / 2 + (b.pos - b.r / 2) * 20;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(x, b.y, 3, 0, Math.PI * 2); ctx.fill();
      });
      for (let i = balls.length - 1; i >= 0; i--) if (balls[i].dead) balls.splice(i, 1);
      // 底部柱
      const maxB = Math.max(1, Math.max.apply(null, bins));
      bins.forEach(function (n, i) {
        const h = n / maxB * 50;
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(V.w / 2 + (i - 6) * 20 - 8, 230 - h, 16, h);
      });
      cap(ctx, V, '每层随机左右，底部却堆出钟形曲线（中心极限定理）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 布丰投针估 π */
  AN.buffon = function (holder, o) {
    const V = mk(holder, 340, 200, false);
    let hits = 0, total = 0;
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const gap = 40, L = 20;
      for (let y = 20; y < V.h; y += gap) {
        ctx.strokeStyle = '#cbd5e1';
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(V.w, y); ctx.stroke();
      }
      if (t % 6 === 0 && total < 800) {
        for (let i = 0; i < 3; i++) {
          const x = Math.random() * V.w, y = 20 + Math.random() * (V.h - 40);
          const a = Math.random() * Math.PI;
          const x2 = x + L * Math.cos(a), y2 = y + L * Math.sin(a);
          const cross = Math.floor(y / gap) !== Math.floor(y2 / gap) || (y % gap === 0);
          const hit = Math.floor((Math.min(y, y2)) / gap) !== Math.floor((Math.max(y, y2)) / gap);
          if (hit) hits++;
          total++;
          ctx.strokeStyle = hit ? '#dc2626' : '#2563eb';
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
        }
      }
      const est = total ? (2 * L * total / (gap * hits)).toFixed(3) : '—';
      ctx.fillStyle = '#475569'; ctx.font = '12px sans-serif';
      ctx.fillText('投 ' + total + ' 针，跨线 ' + hits + ' → π ≈ ' + est, 60, 14);
      cap(ctx, V, 'P(跨线)=2L/(πd)：几何实验测 π（蒙特卡洛始祖）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 蒙提霍尔：换门胜率 2/3 */
  AN.monty = function (holder, o) {
    const V = mk(holder, 340, 190, true);
    let sw = 0, st = 0, swN = 0, stN = 0;
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      if (t % 4 === 0) {
        // 自动模拟一轮
        const car = Math.floor(Math.random() * 3);
        const pick = Math.floor(Math.random() * 3);
        // 换门策略
        let other = 0;
        for (let i = 0; i < 3; i++) if (i !== pick && i !== car) { other = i; break; }
        // 主持人开一扇空门后，换到剩下的门；简化：换门赢当且仅当 pick!==car
        if (pick !== car) sw++; swN++;
        if (pick === car) st++; stN++;
      }
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#475569';
        ctx.fillRect(60 + i * 80, 40, 60, 90); ctx.strokeRect(60 + i * 80, 40, 60, 90);
        ctx.fillStyle = '#94a3b8'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('门' + (i + 1), 90 + i * 80, 90);
      }
      ctx.textAlign = 'left';
      ctx.fillStyle = '#4ade80'; ctx.font = '12px sans-serif';
      ctx.fillText('换门胜率 ' + (sw / Math.max(1, swN) * 100).toFixed(1) + '%', 60, 160);
      ctx.fillStyle = '#f87171';
      ctx.fillText('不换胜率 ' + (st / Math.max(1, stN) * 100).toFixed(1) + '%', 200, 160);
      cap(ctx, V, '主持人开门把 2/3 概率集中到另一扇门');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 生日悖论 */
  AN.birthday = function (holder, o) {
    const V = mk(holder, 340, 190, false);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const n = Math.min(80, Math.max(2, Math.round(d.n || 23)));
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      // 理论曲线
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let k = 2; k <= 80; k++) {
        let p = 1;
        for (let i = 0; i < k; i++) p *= (365 - i) / 365;
        const x = 20 + (k - 2) / 78 * (V.w - 40);
        const y = V.h - 30 - (1 - p) * (V.h - 60);
        if (k === 2) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // 当前 n 标记
      let pn = 1; for (let i = 0; i < n; i++) pn *= (365 - i) / 365;
      const x = 20 + (n - 2) / 78 * (V.w - 40);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(x, V.h - 30 - (1 - pn) * (V.h - 60), 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#475569'; ctx.font = '12px sans-serif';
      ctx.fillText(n + ' 人 → 同生日概率 ' + ((1 - pn) * 100).toFixed(1) + '%', 60, 20);
      cap(ctx, V, '配对数按平方增长：23 人就有 253 对');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 向日葵黄金角 */
  AN.phyllotaxis = function (holder, o) {
    const V = mk(holder, 300, 300, true);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const ang = (d.angle !== undefined ? d.angle : 137.5) * Math.PI / 180;
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = V.h / 2;
      const upto = Math.min(500, t * 4);
      for (let i = 0; i < upto; i++) {
        const a = i * ang, r = 6 * Math.sqrt(i);
        ctx.fillStyle = 'hsl(' + (45 + i * 0.1) + ',80%,55%)';
        ctx.beginPath(); ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('发散角 ' + (d.angle !== undefined ? d.angle : 137.5) + '°', 12, 16);
      cap(ctx, V, '黄金角最"无理"，籽粒永不排成辐条');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 蜂窝六边形 */
  AN.hexTiling = function (holder, o) {
    const V = mk(holder, 340, 190, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      function hex(cx, cy, r) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = i * Math.PI / 3;
          const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
      }
      ctx.strokeStyle = '#f59e0b'; ctx.fillStyle = 'rgba(245,158,11,.2)';
      for (let row = 0; row < 4; row++) for (let col = 0; col < 5; col++) {
        const x = 40 + col * 45 + (row % 2) * 22, y = 40 + row * 39;
        hex(x, y, 25); ctx.fill(); ctx.stroke();
      }
      // 五边形留缝
      ctx.strokeStyle = '#dc2626';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        for (let k = 0; k < 5; k++) {
          const a = k * Math.PI * 2 / 5 - Math.PI / 2;
          const x = 260 + i * 30 + 20 * Math.cos(a), y = 80 + 20 * Math.sin(a);
          if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.stroke();
      }
      ctx.fillStyle = '#dc2626'; ctx.font = '10px sans-serif';
      ctx.fillText('五边形铺不满', 250, 120);
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('六边形：同周长围最大面积（蜂窝猜想）', 40, 175);
      cap(ctx, V, '能密铺的正多边形只有 3、4、6 边形');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 调和级数悬垂 */
  AN.overhang = function (holder, o) {
    const V = mk(holder, 340, 190, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const n = Math.min(8, 1 + Math.floor(t / 60) % 8);
      let over = 0;
      ctx.fillStyle = '#64748b'; ctx.fillRect(30, 160, 120, 14); // 桌
      for (let i = 0; i < n; i++) {
        over += 1 / (2 * (i + 1));
        const x = 90 + over * 60 - (1 / (2 * (i + 1))) * 60;
        ctx.fillStyle = i % 2 ? '#38bdf8' : '#2563eb';
        ctx.fillRect(90 + (over - 1 / (2 * (i + 1))) * 60, 146 - i * 14, 80, 12);
      }
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText(n + ' 块，悬垂 = ½(1+½+…+1/' + n + ') = ' + over.toFixed(2) + ' 块长', 40, 20);
      cap(ctx, V, '调和级数发散：悬垂可以超过任意距离（但很慢）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 芝诺：几何级数填满正方形 */
  AN.geoSeries = function (holder, o) {
    const V = mk(holder, 300, 220, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const n = Math.min(7, 1 + Math.floor(t / 50) % 7);
      const S = 160, x0 = 70, y0 = 30;
      ctx.strokeStyle = '#475569'; ctx.strokeRect(x0, y0, S, S);
      // 交替填半
      let x = x0, y = y0, w = S, h = S;
      const colors = ['#2563eb', '#dc2626', '#059669', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16'];
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = colors[i % 7] + '88';
        if (i % 2 === 0) { ctx.fillRect(x + w / 2, y, w / 2, h); x += w / 2; w /= 2; }
        else { ctx.fillRect(x, y, w, h / 2); y += h / 2; h /= 2; }
      }
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('1/2+1/4+…+1/2^' + n + ' = ' + (1 - Math.pow(2, -n)).toFixed(4), 60, 210);
      cap(ctx, V, '无穷多步，有限总和——芝诺悖论的答案');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 欧拉素数多项式 */
  AN.primePoly = function (holder, o) {
    const V = mk(holder, 340, 170, true);
    function isP(n) { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const upto = Math.min(45, Math.floor(t / 8));
      for (let n = 0; n <= upto; n++) {
        const v = n * n + n + 41;
        const x = 20 + (n % 10) * 32, y = 25 + Math.floor(n / 10) * 30;
        ctx.fillStyle = isP(v) ? '#4ade80' : '#dc2626';
        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0f172a'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(n, x, y + 3); ctx.textAlign = 'left';
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('n²+n+41：n=0…39 全是素数，n=40 破功', 60, 160);
      cap(ctx, V, '与 Q(√-163) 类数为 1 有关的数论奇迹');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 的士数 1729 */
  AN.taxicab = function (holder, o) {
    const V = mk(holder, 340, 180, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      function cube(x, y, s, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, s, s);
        ctx.strokeStyle = '#0f172a'; ctx.strokeRect(x, y, s, s);
      }
      const ph = Math.floor(t / 120) % 2;
      if (ph === 0) {
        cube(50, 60, 12, '#2563eb'); cube(80, 40, 60, '#2563eb'); // 1³ + 12³
        ctx.fillStyle = '#475569'; ctx.font = '12px sans-serif';
        ctx.fillText('1³ + 12³ = 1 + 1728 = 1729', 60, 140);
      } else {
        cube(50, 55, 45, '#dc2626'); cube(110, 50, 50, '#dc2626'); // 9³ + 10³
        ctx.fillStyle = '#475569';
        ctx.fillText('9³ + 10³ = 729 + 1000 = 1729', 60, 140);
      }
      ctx.fillText('1729 = 的士数：两种立方和表示的最小数', 50, 20);
      cap(ctx, V, '拉马努金："每个数都是我的朋友"');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 梅森素数 */
  AN.mersenne = function (holder, o) {
    const V = mk(holder, 340, 170, true);
    function isP(n) { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const p = Math.min(31, Math.max(2, Math.round(d.p || 13)));
      const m = Math.pow(2, p) - 1;
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 14px monospace';
      ctx.fillText('2^' + p + ' - 1 = ' + m, 60, 50);
      ctx.fillStyle = isP(m) ? '#4ade80' : '#f87171';
      ctx.font = '13px sans-serif';
      ctx.fillText(isP(m) ? '✓ 是素数（梅森素数）' : '✗ 不是素数', 60, 80);
      ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif';
      ctx.fillText('梅森素数 p: 2,3,5,7,13,17,19,31…', 60, 110);
      cap(ctx, V, 'p 是素数只是必要非充分条件（2^11-1=23×89）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 瑞利散射：天蓝日落红 */
  AN.scattering = function (holder, o) {
    const V = mk(holder, 340, 190, true);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const elev = Math.max(0, Math.min(90, d.elev !== undefined ? d.elev : 60));
      const ctx = V.ctx;
      // 天空颜色随太阳高度
      const low = 1 - elev / 90;
      ctx.fillStyle = 'rgb(' + Math.round(30 + low * 180) + ',' + Math.round(80 + (1 - low) * 60) + ',' + Math.round(180 - low * 120) + ')';
      ctx.fillRect(0, 0, V.w, V.h - 40);
      ctx.fillStyle = '#1e293b'; ctx.fillRect(0, V.h - 40, V.w, 40);
      // 太阳
      const sx = 60 + (1 - elev / 90) * 220, sy = V.h - 60 - elev / 90 * 100;
      ctx.fillStyle = low > 0.5 ? '#f97316' : '#fde047';
      ctx.beginPath(); ctx.arc(sx, sy, 16, 0, Math.PI * 2); ctx.fill();
      // 散射蓝光点
      for (let i = 0; i < 30; i++) {
        const seed = i * 97 + Math.floor(t / 4);
        ctx.fillStyle = 'rgba(96,165,250,' + (0.5 - low * 0.4) + ')';
        ctx.beginPath(); ctx.arc((seed * 13) % V.w, (seed * 7) % (V.h - 50), 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('太阳高度 ' + elev + '°：' + (elev > 40 ? '散射蓝光布满天空→天蓝' : '光程长蓝光散尽→日落红'), 40, 20);
      cap(ctx, V, '散射 ∝ 1/λ⁴：蓝光是红光的约 5.5 倍');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 马格努斯效应：弧线球 */
  AN.magnus = function (holder, o) {
    const V = mk(holder, 340, 190, true);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const spin = (d.spin !== undefined ? d.spin : 5) / 10;
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const tt = (t % 160) / 160;
      const x = 30 + tt * 280;
      const y = 95 + spin * Math.sin(tt * Math.PI) * 60;
      ctx.strokeStyle = 'rgba(148,163,184,.3)';
      ctx.beginPath(); ctx.moveTo(30, 95); ctx.lineTo(310, 95); ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
      // 旋转标记
      ctx.strokeStyle = '#0f172a';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 8 * Math.cos(t * 0.3), y + 8 * Math.sin(t * 0.3)); ctx.stroke();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('旋转 ' + (d.spin !== undefined ? d.spin : 5) + '：一侧气流快压强小，球被推向快侧', 30, 20);
      cap(ctx, V, '香蕉球、乒乓球弧圈、机翼升力同源');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 共振：驱动频率 vs 振幅 */
  AN.resonance = function (holder, o) {
    const V = mk(holder, 340, 190, false);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const f = Math.max(0.1, d.f || 1);
      const f0 = 1;
      const amp = 1 / Math.sqrt(Math.pow(f * f - f0 * f0, 2) + 0.04 * f * f);
      const A = Math.min(60, amp * 8);
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      // 共振曲线
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath();
      for (let x = 0; x < V.w - 40; x++) {
        const ff = 0.1 + x / (V.w - 40) * 2;
        const a = Math.min(60, 8 / Math.sqrt(Math.pow(ff * ff - 1, 2) + 0.04 * ff * ff));
        const y = 150 - a;
        if (x === 0) ctx.moveTo(20 + x, y); else ctx.lineTo(20 + x, y);
      }
      ctx.stroke();
      const px = 20 + (f - 0.1) / 2 * (V.w - 40);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(px, 150 - A, 6, 0, Math.PI * 2); ctx.fill();
      // 振子
      const y = 60 + Math.sin(t * 0.1 * f) * A * 0.5;
      ctx.strokeStyle = '#475569';
      ctx.beginPath(); ctx.moveTo(300, 20); ctx.lineTo(300, y); ctx.stroke();
      ctx.fillStyle = '#2563eb'; ctx.fillRect(288, y, 24, 24);
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('驱动频率 ' + f.toFixed(1) + ' / 固有 1.0 → 振幅 ' + A.toFixed(0), 20, 16);
      cap(ctx, V, '驱动接近固有频率，振幅剧增');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 布朗运动 */
  AN.brownian = function (holder, o) {
    const V = mk(holder, 300, 200, true);
    const mol = [];
    for (let i = 0; i < 40; i++) mol.push({ x: Math.random() * 300, y: Math.random() * 200, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3 });
    let px = 150, py = 100, pvx = 0, pvy = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = 'rgba(15,23,42,.4)'; ctx.fillRect(0, 0, V.w, V.h);
      mol.forEach(function (m) {
        m.x += m.vx; m.y += m.vy;
        if (m.x < 0 || m.x > 300) m.vx = -m.vx;
        if (m.y < 0 || m.y > 200) m.vy = -m.vy;
        const dx = px - m.x, dy = py - m.y, d2 = dx * dx + dy * dy;
        if (d2 < 400) { pvx += dx * 0.01; pvy += dy * 0.01; }
        ctx.fillStyle = 'rgba(148,163,184,.5)';
        ctx.beginPath(); ctx.arc(m.x, m.y, 2, 0, Math.PI * 2); ctx.fill();
      });
      px += pvx; py += pvy; pvx *= 0.95; pvy *= 0.95;
      px = Math.max(20, Math.min(280, px)); py = Math.max(20, Math.min(180, py));
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill();
      cap(ctx, V, '花粉的无规则抖动 = 水分子撞击不平衡（爱因斯坦 1905）');
      window.requestAnimationFrame(loop);
    })();
  };

  /* 终端速度 */
  AN.terminal = function (holder, o) {
    const V = mk(holder, 340, 190, false);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const m = Math.max(0.001, d.m || 0.005); // 雨滴克级
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const vt = Math.sqrt(m * 9.8 / 0.0006); // 简化 drag
      // v-t 曲线
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < V.w - 40; x++) {
        const tt = x / 40;
        const v = vt * (1 - Math.exp(-tt));
        const y = 160 - Math.min(140, v * 12);
        if (x === 0) ctx.moveTo(20 + x, y); else ctx.lineTo(20 + x, y);
      }
      ctx.stroke();
      ctx.setLineDash([4, 4]); ctx.strokeStyle = '#dc2626';
      ctx.beginPath(); ctx.moveTo(20, 160 - Math.min(140, vt * 12)); ctx.lineTo(V.w - 20, 160 - Math.min(140, vt * 12)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('质量 ' + m + ' kg → 终端速度 ' + vt.toFixed(1) + ' m/s', 20, 16);
      cap(ctx, V, '阻力追上重力，速度不再增长——雨滴不伤人');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 科里奥利 */
  AN.coriolis = function (holder, o) {
    const V = mk(holder, 300, 300, true);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const w = (d.w !== undefined ? d.w : 3) / 100;
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = V.h / 2;
      ctx.strokeStyle = 'rgba(148,163,184,.3)';
      ctx.beginPath(); ctx.arc(cx, cy, 130, 0, Math.PI * 2); ctx.stroke();
      // 旋转盘标记
      const ra = t * w;
      ctx.strokeStyle = '#475569';
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 130 * Math.cos(ra), cy + 130 * Math.sin(ra)); ctx.stroke();
      // 球在惯性系直走，在盘上看弯曲
      const tt = (t % 200) / 200;
      const ix = -130 + tt * 260, iy = 0;
      const ang = -ra;
      const rx = ix * Math.cos(ang) - iy * Math.sin(ang);
      const ry = ix * Math.sin(ang) + iy * Math.cos(ang);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(cx + rx, cy + ry, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('盘上观察者看到球向右偏（北半球类比）', 30, 20);
      cap(ctx, V, '不是真力，是旋转参考系里的惯性表现');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 温室效应 */
  AN.greenhouse = function (holder, o) {
    const V = mk(holder, 340, 190, true);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const co2 = Math.max(0, Math.min(100, d.co2 !== undefined ? d.co2 : 40));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 150, V.w, 40);
      // 太阳短波进
      for (let i = 0; i < 4; i++) {
        const x = 60 + i * 70;
        ctx.strokeStyle = '#fde047';
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 20, 150); ctx.stroke();
      }
      // 地面长波出，部分被挡回
      for (let i = 0; i < 5; i++) {
        const x = 40 + i * 65;
        const trapped = ((i * 37) % 100) < co2;
        ctx.strokeStyle = '#f87171';
        ctx.beginPath(); ctx.moveTo(x, 150);
        if (trapped) { ctx.lineTo(x + 10, 80); ctx.lineTo(x + 25, 150); }
        else ctx.lineTo(x + 10, 0);
        ctx.stroke();
      }
      // 气体层
      ctx.fillStyle = 'rgba(148,163,184,' + (0.1 + co2 / 300) + ')';
      ctx.fillRect(0, 60, V.w, 40);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('CO₂ 浓度 ' + co2 + '：红=地面长波，被挡回的比例↑', 30, 20);
      cap(ctx, V, '没有温室效应地球平均 -18°C');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 虹吸 */
  AN.siphon = function (holder, o) {
    const V = mk(holder, 340, 190, false);
    const drops = [];
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      // 两杯
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.strokeRect(40, 90, 80, 80); ctx.strokeRect(220, 120, 80, 60);
      ctx.fillStyle = 'rgba(59,130,246,.5)';
      ctx.fillRect(43, 100, 74, 67); ctx.fillRect(223, 130, 74, 47);
      // 管
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(80, 110); ctx.lineTo(80, 50); ctx.lineTo(260, 50); ctx.lineTo(260, 140); ctx.stroke();
      if (t % 8 === 0) drops.push({ p: 0 });
      drops.forEach(function (dr) {
        dr.p += 0.02;
        let x, y;
        if (dr.p < 0.33) { x = 80; y = 110 - dr.p / 0.33 * 60; }
        else if (dr.p < 0.66) { x = 80 + (dr.p - 0.33) / 0.33 * 180; y = 50; }
        else { x = 260; y = 50 + (dr.p - 0.66) / 0.34 * 90; }
        ctx.fillStyle = '#2563eb';
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
      });
      for (let i = drops.length - 1; i >= 0; i--) if (drops[i].p >= 1) drops.splice(i, 1);
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('出水口低于液面，水先"爬坡"再流下', 60, 20);
      cap(ctx, V, '重力拉长臂水柱， cohesion+气压把水拽过顶端');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 冰浮在水面 */
  AN.iceFloat = function (holder, o) {
    const V = mk(holder, 300, 200, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      ctx.fillStyle = 'rgba(59,130,246,.4)'; ctx.fillRect(40, 100, 220, 80);
      ctx.strokeStyle = '#64748b'; ctx.strokeRect(40, 100, 220, 80);
      const bob = Math.sin(t * 0.05) * 2;
      ctx.fillStyle = 'rgba(226,232,240,.9)';
      ctx.fillRect(120, 91 + bob, 60, 66); // 90% 在水下
      ctx.strokeStyle = '#94a3b8'; ctx.strokeRect(120, 91 + bob, 60, 66);
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('冰密度 0.917 < 水 1.0 → 露出约 1/10', 50, 20);
      ctx.fillText('若冰会沉底，湖泊将从下冻实', 60, 40);
      cap(ctx, V, '氢键让冰的晶格"敞开"——水的反常膨胀');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 星星眨眼 */
  AN.skyTwinkle = function (holder, o) {
    const V = mk(holder, 340, 170, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 大气湍流格
      for (let i = 0; i < 12; i++) {
        const x = (i * 53 + t * 0.7) % V.w;
        ctx.fillStyle = 'rgba(148,163,184,' + (0.05 + 0.05 * Math.sin(i + t * 0.1)) + ')';
        ctx.fillRect(x, 40 + (i % 3) * 25, 40, 20);
      }
      // 恒星（点）抖动
      const jx = Math.sin(t * 0.7) * 3 + Math.sin(t * 1.3) * 2;
      const jy = Math.cos(t * 0.9) * 3;
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.arc(100 + jx, 90 + jy, 3, 0, Math.PI * 2); ctx.fill();
      // 行星（面）稳定
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(240, 90, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('恒星=点，抖动明显', 60, 130);
      ctx.fillText('行星=面，平均后稳定', 200, 130);
      cap(ctx, V, '大气折射率起伏使星光路径抖动');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 盐融雪 */
  AN.saltIce = function (holder, o) {
    const V = mk(holder, 340, 180, false);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const salt = Math.max(0, Math.min(30, d.salt !== undefined ? d.salt : 10));
      const fp = -salt * 0.6; // 凝固点降低
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      // 冰块融化程度随盐
      const melt = Math.min(1, salt / 20);
      ctx.fillStyle = 'rgba(226,232,240,.9)';
      ctx.fillRect(60, 80, 100, 60 * (1 - melt * 0.6));
      ctx.strokeStyle = '#94a3b8'; ctx.strokeRect(60, 80, 100, 60 * (1 - melt * 0.6));
      // 盐粒
      ctx.fillStyle = '#475569';
      for (let i = 0; i < salt; i++) {
        ctx.beginPath(); ctx.arc(70 + (i * 37) % 80, 76, 2, 0, Math.PI * 2); ctx.fill();
      }
      // 水
      ctx.fillStyle = 'rgba(59,130,246,.5)';
      ctx.fillRect(60, 140, 100, 60 * melt * 0.6);
      // 温度计
      ctx.strokeStyle = '#64748b'; ctx.strokeRect(220, 50, 16, 100);
      ctx.fillStyle = '#dc2626';
      const th = 100 - (0 - fp) * 3;
      ctx.fillRect(224, 50 + th, 8, 100 - th);
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('盐 ' + salt + ' g → 凝固点 ' + fp.toFixed(1) + '°C', 40, 20);
      cap(ctx, V, '离子阻碍水分子结冰晶格——凝固点降低');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 胶束去油 */
  AN.micelle = function (holder, o) {
    const V = mk(holder, 320, 200, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = 'rgba(15,23,42,.3)'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = 100;
      // 油滴核心
      ctx.fillStyle = 'rgba(250,204,21,.5)';
      ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.fill();
      // 肥皂分子：尾插油、头朝水
      for (let i = 0; i < 14; i++) {
        const a = i * Math.PI * 2 / 14 + t * 0.005;
        const hx = cx + 40 * Math.cos(a), hy = cy + 40 * Math.sin(a);
        ctx.strokeStyle = '#fbbf24';
        ctx.beginPath(); ctx.moveTo(cx + 26 * Math.cos(a), cy + 26 * Math.sin(a)); ctx.lineTo(hx, hy); ctx.stroke();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath(); ctx.arc(hx, hy, 4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('亲水头朝外、疏水尾插油 → 油被包成可冲走的胶束', 20, 20);
      cap(ctx, V, '肥皂分子是"两头派"');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 苹果褐变 */
  AN.appleBrown = function (holder, o) {
    const V = mk(holder, 340, 180, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const brown = Math.min(1, (t % 400) / 300);
      // 未处理半块
      ctx.fillStyle = 'rgb(' + Math.round(250 - brown * 100) + ',' + Math.round(240 - brown * 120) + ',' + Math.round(220 - brown * 140) + ')';
      ctx.beginPath(); ctx.arc(100, 90, 45, Math.PI / 2, Math.PI * 1.5); ctx.fill();
      ctx.strokeStyle = '#dc2626'; ctx.stroke();
      // 柠檬处理半块
      ctx.fillStyle = '#fdf6e3';
      ctx.beginPath(); ctx.arc(240, 90, 45, Math.PI / 2, Math.PI * 1.5, true); ctx.fill();
      ctx.strokeStyle = '#16a34a'; ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('暴露空气：酶促氧化变褐', 40, 160);
      ctx.fillText('柠檬（维C抗氧化）：保持白', 180, 160);
      cap(ctx, V, '多酚氧化酶 + O₂ → 褐色醌类');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* pH 标尺 */
  AN.phScale = function (holder, o) {
    const V = mk(holder, 340, 170, false);
    const items = [['胃酸', 1.5], ['柠檬', 2.2], ['醋', 3], ['咖啡', 5], ['纯水', 7], ['血液', 7.4], ['小苏打', 9], ['肥皂', 10], ['氨水', 11.5], ['烧碱', 14]];
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const ph = Math.max(0, Math.min(14, d.ph !== undefined ? d.ph : 7));
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      // 彩虹标尺
      for (let i = 0; i < 14; i++) {
        ctx.fillStyle = 'hsl(' + (i * 25) + ',70%,50%)';
        ctx.fillRect(20 + i * (V.w - 40) / 14, 60, (V.w - 40) / 14, 24);
      }
      const x = 20 + ph / 14 * (V.w - 40);
      ctx.fillStyle = '#1e293b';
      ctx.beginPath(); ctx.moveTo(x, 56); ctx.lineTo(x - 6, 46); ctx.lineTo(x + 6, 46); ctx.fill();
      ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('pH ' + ph.toFixed(1), x, 38); ctx.textAlign = 'left';
      // 最近的生活物品
      let near = items[0];
      items.forEach(function (it) { if (Math.abs(it[1] - ph) < Math.abs(near[1] - ph)) near = it; });
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('接近：' + near[0] + '（pH ' + near[1] + '）', 20, 110);
      cap(ctx, V, '每差 1 个单位，H⁺ 浓度差 10 倍');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 纸层析 */
  AN.chromatography = function (holder, o) {
    const V = mk(holder, 300, 220, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      // 纸条
      ctx.fillStyle = '#fefce8'; ctx.fillRect(120, 10, 60, 190);
      ctx.strokeStyle = '#cbd5e1'; ctx.strokeRect(120, 10, 60, 190);
      // 溶剂前沿上升
      const front = 200 - Math.min(170, t * 0.4);
      ctx.fillStyle = 'rgba(59,130,246,.25)';
      ctx.fillRect(121, front, 58, 200 - front);
      // 色素点按速度分离
      const dyes = [['#fbbf24', 0.8], ['#dc2626', 0.6], ['#2563eb', 0.45], ['#16a34a', 0.3]];
      dyes.forEach(function (dy) {
        const y = 190 - (200 - front) * dy[1];
        ctx.fillStyle = dy[0];
        ctx.beginPath(); ctx.ellipse(150, y, 14, 6, 0, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('黑墨水其实是几种色素的混合', 40, 215);
      cap(ctx, V, '溶解度/吸附性不同 → 跑得速度不同');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 热冰结晶 */
  AN.crystal = function (holder, o) {
    const V = mk(holder, 300, 200, true);
    let t = 0;
    const seeds = [];
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = 'rgba(15,23,42,.35)'; ctx.fillRect(0, 0, V.w, V.h);
      if (t % 120 === 1) seeds.push({ x: 150, y: 100, r: 2 });
      seeds.forEach(function (s) {
        s.r += 0.8;
        ctx.strokeStyle = 'rgba(226,232,240,.8)';
        for (let i = 0; i < 6; i++) {
          const a = i * Math.PI / 3;
          ctx.beginPath(); ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x + s.r * Math.cos(a), s.y + s.r * Math.sin(a)); ctx.stroke();
        }
      });
      if (seeds.length && seeds[0].r > 140) seeds.length = 0;
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('过饱和醋酸钠：晶种触发瞬间结晶放热', 30, 20);
      cap(ctx, V, '暖手宝的原理：亚稳态→结晶');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 氦气变声 */
  AN.heliumVoice = function (holder, o) {
    const V = mk(holder, 340, 170, true);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const gas = Math.round(d.gas || 0); // 0 空气 1 氦 2 六氟化硫
      const speeds = [343, 972, 134];
      const names = ['空气', '氦气', '六氟化硫'];
      const v = speeds[gas];
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 声波传播
      const x = (t * v / 60) % (V.w - 40);
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.arc(20 + x - i * 20, 85, 12, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText(names[gas] + ' 中声速 ' + v + ' m/s', 20, 20);
      ctx.fillText(gas === 1 ? '共振峰上移 → 声音尖细' : gas === 2 ? '共振峰下移 → 声音低沉' : '正常音色', 20, 40);
      cap(ctx, V, '声带频率没变，变的是声道共振（音色）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 机翼升力 */
  AN.airplane = function (holder, o) {
    const V = mk(holder, 340, 180, true);
    let t = 0;
    (function loop() {
      const d = o.data || {};
      const aoa = Math.max(-5, Math.min(15, d.aoa !== undefined ? d.aoa : 5));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = 100;
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(-aoa * Math.PI / 180);
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath(); ctx.ellipse(0, 0, 70, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      // 流线：上方密（快）
      for (let i = 0; i < 6; i++) {
        const y0 = 40 + i * 12;
        ctx.strokeStyle = i < 3 ? '#38bdf8' : '#64748b';
        ctx.beginPath();
        for (let x = 0; x < V.w; x += 4) {
          const bump = i < 3 ? -Math.sin((x / V.w) * Math.PI) * (14 + aoa) * (1 - i * 0.2) : Math.sin((x / V.w) * Math.PI) * 4;
          const y = y0 + bump + ((t * 2 + x) % 8) * 0;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('攻角 ' + aoa + '°：上方流线密=流速快=压强小', 30, 20);
      cap(ctx, V, '伯努利（压差）与牛顿（下洗反作用）是一枚硬币两面');
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
