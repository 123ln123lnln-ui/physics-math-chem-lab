/* concept-anim5.js — 概念针对性演示引擎（第二批：方法与高中专题） */
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

  /* 因式分解：矩形面积拆分 a²+ab = a(a+b) */
  GEN.factorize = function (holder, o) {
    const V = mk(holder, 340, 180, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const ph = (Math.sin(t * 0.015) + 1) / 2;
      const a = 60, b = 90;
      ctx.fillStyle = 'rgba(37,99,235,.3)';
      ctx.fillRect(40, 50, a, a);
      ctx.fillStyle = 'rgba(220,38,38,.3)';
      ctx.fillRect(40 + a + ph * 8, 50, b, a);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(40, 50, a, a); ctx.strokeRect(40 + a + ph * 8, 50, b, a);
      ctx.fillStyle = '#475569'; ctx.font = '12px sans-serif';
      ctx.fillText('a²', 62, 85); ctx.fillText('ab', 130, 85);
      ctx.fillText(ph > 0.5 ? 'a(a+b)：提取公因式 a，合并为乘积' : 'a² + ab：先拆成面积块', 60, 160);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 电解质的电离：盐放入水中散成自由离子 */
  GEN.ionize = function (holder, o) {
    const V = mk(holder, 320, 200, true);
    const ions = [];
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      ctx.fillStyle = 'rgba(59,130,246,.15)'; ctx.fillRect(60, 60, 200, 120);
      ctx.strokeStyle = '#64748b'; ctx.strokeRect(60, 60, 200, 120);
      if (t % 25 === 0 && ions.length < 20) {
        const pos = Math.random() < 0.5;
        ions.push({ x: 160, y: 90, vx: (Math.random() - 0.5) * 2.4, vy: (Math.random() - 0.5) * 2.4, plus: pos });
      }
      ions.forEach(function (p) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 66 || p.x > 254) p.vx = -p.vx;
        if (p.y < 66 || p.y > 174) p.vy = -p.vy;
        ctx.fillStyle = p.plus ? '#f87171' : '#38bdf8';
        ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(150, 55, 20, 14); // 未溶解的盐块
      label(ctx, 'NaCl → Na⁺ + Cl⁻（完全电离 = 强电解质）');
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
      function label(ctx, txt) { ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif'; ctx.fillText(txt, 60, 30); }
    })();
  };

  /* 氧化还原配平：升降价桥线 */
  GEN.redoxBalance = function (holder, o) {
    const V = mk(holder, 340, 190, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      ctx.font = '13px monospace'; ctx.fillStyle = '#1e293b';
      ctx.fillText('0        +3          0', 120, 40);
      ctx.fillText('Fe  +  Cl₂  →  FeCl₃', 100, 70);
      const ph = Math.min(1, (t % 240) / 120);
      // 升价桥
      ctx.strokeStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(105, 80);
      ctx.quadraticCurveTo(160, 80 + 40 * ph, 210, 80);
      ctx.stroke();
      if (ph > 0.9) { ctx.fillStyle = '#dc2626'; ctx.font = '10px sans-serif'; ctx.fillText('升高3，失3e⁻ ×2', 130, 135); }
      // 降价桥
      ctx.strokeStyle = '#2563eb';
      ctx.beginPath();
      ctx.moveTo(175, 80);
      ctx.quadraticCurveTo(230, 80 - 30 * ph, 285, 80);
      ctx.stroke();
      if (ph > 0.9) { ctx.fillStyle = '#2563eb'; ctx.font = '10px sans-serif'; ctx.fillText('降低1，得1e⁻ ×6', 190, 30); }
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('配平核心：升价总数 = 降价总数（电子守恒）', 40, 170);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 离子方程式四步：拆删动画 */
  GEN.ionEquation = function (holder, o) {
    const V = mk(holder, 340, 200, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const step = Math.floor(t / 120) % 4;
      ctx.font = '12px monospace'; ctx.fillStyle = '#1e293b';
      const lines = [
        ['写：NaOH + HCl = NaCl + H₂O', '第一步：写出化学方程式'],
        ['拆：Na⁺+OH⁻ + H⁺+Cl⁻ = Na⁺+Cl⁻ + H₂O', '第二步：强电解质拆成离子'],
        ['删：OH⁻ + H⁺ = H₂O', '第三步：删去旁观离子 Na⁺、Cl⁻'],
        ['查：原子守恒 ✓ 电荷守恒 ✓', '第四步：检查两个守恒']
      ];
      ctx.fillText(lines[step][0], 20, 70);
      ctx.fillStyle = '#64748b'; ctx.font = '11px sans-serif';
      ctx.fillText(lines[step][1], 20, 100);
      // 被删离子划掉动画
      if (step === 2) {
        ctx.strokeStyle = '#dc2626';
        ctx.beginPath(); ctx.moveTo(60, 66); ctx.lineTo(140, 66); ctx.stroke();
      }
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i === step ? '#f59e0b' : '#e2e8f0';
        ctx.strokeStyle = i === step ? '#f59e0b' : '#cbd5e1';
        ctx.beginPath(); ctx.arc(40 + i * 30, 150, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = i === step ? '#fff' : '#94a3b8'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(i + 1, 40 + i * 30, 153); ctx.textAlign = 'left';
      }
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 牺牲阳极保护：锌替铁挨腐蚀 */
  GEN.sacrifice = function (holder, o) {
    const V = mk(holder, 320, 190, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      ctx.fillStyle = 'rgba(59,130,246,.2)'; ctx.fillRect(40, 100, 240, 70);
      // 铁（被保护）
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(190, 80, 50, 90);
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('Fe（被保护·阴极）', 185, 72);
      // 锌（牺牲）
      const eaten = Math.min(30, t * 0.05 % 35);
      ctx.fillStyle = '#b45309'; ctx.fillRect(70, 90 + eaten * 0.3, 40, 80 - eaten);
      ctx.fillText('Zn（牺牲阳极）', 62, 72);
      // 电子流向
      const e = (t * 2) % 120;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(110 + e, 88, 4, 0, Math.PI * 2); ctx.fill();
      arrow(ctx, 130, 60, 180, 60, '#f59e0b', 1.5);
      ctx.fillText('e⁻', 140, 52);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 苯的凯库勒结构 ↔ 真实离域结构 */
  GEN.benzene = function (holder, o) {
    const V = mk(holder, 300, 210, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = V.h / 2 - 5, R = 55;
      const kekule = Math.floor(t / 180) % 2 === 0;
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 3;
        pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
      }
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
      ctx.beginPath();
      pts.forEach(function (p, i) { if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
      ctx.closePath(); ctx.stroke();
      if (kekule) {
        for (let i = 0; i < 6; i += 2) {
          const p1 = pts[i], p2 = pts[(i + 1) % 6];
          ctx.beginPath();
          ctx.moveTo(p1[0] * 0.88 + cx * 0.12, p1[1] * 0.88 + cy * 0.12);
          ctx.lineTo(p2[0] * 0.88 + cx * 0.12, p2[1] * 0.88 + cy * 0.12);
          ctx.stroke();
        }
      } else {
        ctx.beginPath(); ctx.arc(cx, cy, R * 0.6, 0, Math.PI * 2); ctx.stroke();
      }
      pts.forEach(function (p) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(kekule ? '凯库勒式（单双键交替——不准确）' : '真实结构：离域大π键（介于单双键之间）', cx, 195);
      ctx.textAlign = 'left';
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 焰色反应：不同金属烧出不同颜色 */
  GEN.flameTest = function (holder, o) {
    const V = mk(holder, 320, 210, true);
    const flames = [
      ['Na 钠', '#fbbf24'], ['K 钾（钴玻璃）', '#c084fc'], ['Cu 铜', '#4ade80'],
      ['Li 锂', '#f87171'], ['Ba 钡', '#bef264'], ['Sr 锶', '#fb7185']
    ];
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cur = Math.floor(t / 110) % flames.length;
      const cx = V.w / 2;
      // 酒精灯
      ctx.fillStyle = '#475569'; ctx.fillRect(cx - 20, 160, 40, 25);
      // 火焰
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = flames[cur][1];
        ctx.globalAlpha = 0.7 - i * 0.1;
        ctx.beginPath();
        ctx.ellipse(cx + Math.sin(t * 0.15 + i) * 4, 130 - i * 14, 14 - i * 2, 20 - i * 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#e2e8f0'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(flames[cur][0], cx, 30);
      ctx.textAlign = 'left';
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 铝热反应：铝粉点燃氧化铁，铁水流出 */
  GEN.thermite = function (holder, o) {
    const V = mk(holder, 300, 220, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const phase = (t % 320) / 320;
      const cx = V.w / 2;
      // 坩埚
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(cx - 45, 60); ctx.lineTo(cx - 30, 130); ctx.lineTo(cx + 30, 130); ctx.lineTo(cx + 45, 60); ctx.stroke();
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(cx - 38, 75, 76, 50);
      if (phase > 0.15) {
        // 剧烈反应
        for (let i = 0; i < 8; i++) {
          ctx.fillStyle = 'rgba(251,191,36,' + (0.8 - i * 0.09) + ')';
          ctx.beginPath();
          ctx.arc(cx + Math.sin(t * 0.3 + i * 2) * (10 + i * 4), 60 - i * 8 - (t % 30), 4 + i, 0, Math.PI * 2);
          ctx.fill();
        }
        // 铁水滴落
        ctx.fillStyle = '#f97316';
        ctx.beginPath(); ctx.arc(cx, 130 + Math.min(60, (phase - 0.15) * 200), 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
        ctx.fillText('2Al + Fe₂O₃ → Al₂O₃ + 2Fe（放出大量热）', 30, 200);
      } else {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(cx, 65, 4 + Math.random() * 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif';
        ctx.fillText('镁条引燃…', cx - 28, 40);
      }
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 氮循环：N₂→NO→NO₂→HNO₃ 颜色变化 */
  GEN.nitrogenCycle = function (holder, o) {
    const V = mk(holder, 340, 180, false);
    let t = 0;
    const stages = [
      ['N₂', '#94a3b8', '无色'], ['NO', '#94a3b8', '无色'],
      ['NO₂', '#dc2626', '红棕色'], ['HNO₃', '#38bdf8', '硝酸']
    ];
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const cur = Math.floor(t / 110) % 4;
      stages.forEach(function (s, i) {
        const x = 60 + i * 75;
        ctx.fillStyle = i === cur ? s[1] : '#e2e8f0';
        ctx.strokeStyle = i === cur ? s[1] : '#cbd5e1';
        ctx.beginPath(); ctx.arc(x, 70, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = i === cur ? '#fff' : '#94a3b8';
        ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(s[0], x, 74); ctx.textAlign = 'left';
        if (i < 3) arrow(ctx, x + 28, 70, x + 46, 70, i === cur ? '#f59e0b' : '#cbd5e1', 1.5);
      });
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText(stages[cur][2], 60, 130);
      ctx.fillText('2NO + O₂ = 2NO₂（无色→红棕色的瞬间变化）', 60, 150);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 皂化反应：油脂 + 碱 → 肥皂（胶束） */
  GEN.saponify = function (holder, o) {
    const V = mk(holder, 320, 200, true);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const ph = Math.min(1, (t % 280) / 140);
      if (ph < 0.5) {
        // 油滴
        ctx.fillStyle = 'rgba(250,204,21,.6)';
        for (let i = 0; i < 4; i++) {
          ctx.beginPath(); ctx.arc(90 + i * 50, 90 + Math.sin(i + t * 0.02) * 8, 18, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif';
        ctx.fillText('油脂 + NaOH（加热）…', 80, 160);
      } else {
        // 胶束：亲水头朝外
        for (let k = 0; k < 3; k++) {
          const cx = 90 + k * 75, cy = 90;
          ctx.fillStyle = 'rgba(250,204,21,.4)';
          ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill();
          for (let i = 0; i < 10; i++) {
            const a = i * Math.PI * 2 / 10 + t * 0.01;
            ctx.strokeStyle = '#38bdf8';
            ctx.beginPath(); ctx.moveTo(cx + 14 * Math.cos(a), cy + 14 * Math.sin(a));
            ctx.lineTo(cx + 24 * Math.cos(a), cy + 24 * Math.sin(a)); ctx.stroke();
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath(); ctx.arc(cx + 24 * Math.cos(a), cy + 24 * Math.sin(a), 2.5, 0, Math.PI * 2); ctx.fill();
          }
        }
        ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif';
        ctx.fillText('生成肥皂（胶束：亲水头朝外，包住油污）', 40, 160);
      }
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 萃取分液：碘从水层跑到有机层 */
  GEN.extraction = function (holder, o) {
    const V = mk(holder, 300, 230, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const ph = Math.min(1, (t % 300) / 150);
      const cx = V.w / 2;
      // 分液漏斗
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 45, 40); ctx.lineTo(cx - 55, 130); ctx.lineTo(cx - 8, 170); ctx.lineTo(cx - 8, 200);
      ctx.moveTo(cx + 45, 40); ctx.lineTo(cx + 55, 130); ctx.lineTo(cx + 8, 170); ctx.lineTo(cx + 8, 200);
      ctx.stroke();
      // 下层：有机层（紫色变深）
      ctx.fillStyle = 'rgba(147,51,234,' + (0.2 + ph * 0.6) + ')';
      ctx.beginPath();
      ctx.moveTo(cx - 50, 110); ctx.lineTo(cx - 55 + (55 - 8) * (170 - 110) / 40 * 0, 110);
      ctx.moveTo(cx - 52, 120); ctx.lineTo(cx + 52, 120); ctx.lineTo(cx + 10, 165); ctx.lineTo(cx - 10, 165);
      ctx.fill();
      // 上层：水层（褪色）
      ctx.fillStyle = 'rgba(245,158,11,' + (0.5 - ph * 0.4) + ')';
      ctx.fillRect(cx - 50, 55, 100, 60);
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('碘从水层（黄）转移到 CCl₄ 层（紫）', 30, 25);
      ctx.fillText('分液：下层先从下口放出', 60, 215);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 蒸馏：蒸发-冷凝-收集 */
  GEN.distill = function (holder, o) {
    const V = mk(holder, 340, 200, false);
    const drops = [];
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      // 蒸馏烧瓶
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(80, 120, 35, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(59,130,246,.4)';
      ctx.beginPath(); ctx.arc(80, 120, 33, 0.3, Math.PI - 0.3); ctx.fill();
      ctx.fillStyle = 'rgba(245,158,11,' + (0.5 + Math.random() * 0.3) + ')';
      ctx.beginPath(); ctx.ellipse(80, 165, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
      // 冷凝管
      ctx.strokeStyle = '#64748b';
      ctx.beginPath(); ctx.moveTo(105, 95); ctx.lineTo(250, 60); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(108, 105); ctx.lineTo(253, 70); ctx.stroke();
      if (t % 14 === 0) drops.push({ p: 0 });
      drops.forEach(function (d) {
        d.p += 0.02;
        const x = 105 + d.p * 148, y = 100 - d.p * 40;
        ctx.fillStyle = 'rgba(59,130,246,.8)';
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
      });
      for (let i = drops.length - 1; i >= 0; i--) if (drops[i].p > 1) drops.splice(i, 1);
      // 接收瓶
      ctx.strokeRect(260, 80, 40, 60);
      const fill = Math.min(45, t * 0.08 % 50);
      ctx.fillStyle = 'rgba(59,130,246,.5)';
      ctx.fillRect(263, 137 - fill, 34, fill);
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('加热蒸发 → 冷凝 → 收集纯净组分', 60, 190);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 滴定管读数：视线与凹液面 */
  GEN.buretRead = function (holder, o) {
    const V = mk(holder, 320, 220, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const cx = V.w / 2;
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.strokeRect(cx - 12, 30, 24, 160);
      ctx.fillStyle = 'rgba(220,38,38,.25)';
      ctx.fillRect(cx - 10, 32, 20, 90);
      // 凹液面
      ctx.strokeStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(cx, 122, 10, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
      // 三种视线
      const kind = Math.floor(t / 120) % 3;
      const ys = [100, 122, 144];
      const names = ['俯视：读数偏大', '平视：读数正确 ✓', '仰视：读数偏小'];
      ctx.strokeStyle = kind === 1 ? '#16a34a' : '#dc2626';
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(60, ys[kind]); ctx.lineTo(cx - 12, ys[kind]); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(50, ys[kind], 8, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24'; ctx.fill();
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText(names[kind], 90, 210);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* KMnO₄ 滴定：紫红色褪去/终点变粉 */
  GEN.kmno4 = function (holder, o) {
    const V = mk(holder, 300, 220, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const cx = V.w / 2;
      const phase = (t % 300) / 300;
      // 酸式滴定管
      ctx.strokeStyle = '#64748b'; ctx.strokeRect(cx - 10, 15, 20, 60);
      ctx.fillStyle = 'rgba(124,58,237,.7)';
      ctx.fillRect(cx - 8, 17, 16, 40);
      // 锥形瓶
      ctx.strokeStyle = '#64748b';
      ctx.beginPath(); ctx.moveTo(cx - 45, 120); ctx.lineTo(cx - 20, 95); ctx.lineTo(cx + 20, 95); ctx.lineTo(cx + 45, 120);
      ctx.lineTo(cx + 45, 170); ctx.lineTo(cx - 45, 170); ctx.closePath(); ctx.stroke();
      const color = phase < 0.85 ? 'rgba(220,38,38,0)' : 'rgba(236,72,153,.35)';
      ctx.fillStyle = color;
      ctx.fillRect(cx - 42, 130, 84, 38);
      if (phase < 0.85) {
        // 滴入的紫色瞬间褪去
        if (t % 30 < 10) {
          ctx.fillStyle = 'rgba(124,58,237,.6)';
          ctx.beginPath(); ctx.arc(cx, 105 + (t % 30) * 2, 3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
        ctx.fillText('紫红色滴入即褪去（Fe²⁺ 被氧化）', 55, 195);
      } else {
        ctx.fillStyle = '#db2777'; ctx.font = 'bold 11px sans-serif';
        ctx.fillText('半滴过量 → 粉红色不褪 = 终点！', 60, 195);
      }
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 氯气与氢氧化钠：制 84 消毒液 */
  GEN.chlorineNaOH = function (holder, o) {
    const V = mk(holder, 320, 190, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      // Cl₂ 黄绿色气泡通入
      const cx = 100;
      ctx.fillStyle = 'rgba(190,242,100,.4)';
      ctx.fillRect(60, 80, 80, 90);
      ctx.strokeStyle = '#64748b'; ctx.strokeRect(60, 80, 80, 90);
      for (let i = 0; i < 4; i++) {
        const y = 160 - ((t * 1.2 + i * 25) % 80);
        ctx.fillStyle = 'rgba(163,230,53,.8)';
        ctx.beginPath(); ctx.arc(cx + Math.sin(i * 2 + t * 0.05) * 10, y, 4, 0, Math.PI * 2); ctx.fill();
      }
      arrow(ctx, 30, 60, 60, 90, '#a3e635', 1.5);
      ctx.fillStyle = '#65a30d'; ctx.font = '11px sans-serif';
      ctx.fillText('Cl₂', 20, 50);
      arrow(ctx, 140, 125, 180, 125, '#94a3b8', 2);
      ctx.fillStyle = '#475569'; ctx.font = '13px monospace';
      ctx.fillText('Cl₂+2NaOH=NaCl+NaClO+H₂O', 160, 90);
      ctx.fillText('（84消毒液有效成分:NaClO）', 170, 150);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 铁离子检验：KSCN 变血红色 */
  GEN.ironTest = function (holder, o) {
    const V = mk(holder, 320, 190, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const phase = (t % 260) / 260;
      const cx = 100;
      // 试管1：FeCl₃ 黄色
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx - 15, 40); ctx.lineTo(cx - 15, 140); ctx.arc(cx, 140, 15, Math.PI, 0, true); ctx.lineTo(cx + 15, 40); ctx.stroke();
      ctx.fillStyle = 'rgba(245,158,11,.4)';
      ctx.fillRect(cx - 13, 70, 26, 72);
      if (phase > 0.3) {
        ctx.fillStyle = 'rgba(220,38,38,' + Math.min(0.85, (phase - 0.3) * 2) + ')';
        ctx.fillRect(cx - 13, 70, 26, 72);
      }
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('Fe³⁺ + KSCN', cx - 38, 175);
      // 滴加
      if (phase < 0.3) {
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath(); ctx.arc(cx, 50 + phase * 60, 3, 0, Math.PI * 2); ctx.fill();
      }
      arrow(ctx, 140, 100, 180, 100, '#94a3b8', 2);
      ctx.fillStyle = phase > 0.3 ? '#dc2626' : '#94a3b8';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(phase > 0.3 ? '血红色！→ 有 Fe³⁺' : '待检验…', 190, 104);
      ctx.font = '11px sans-serif'; ctx.fillStyle = '#475569';
      ctx.fillText('Fe²⁺ 无此现象（先加 KSCN 不变红，', 165, 130);
      ctx.fillText('再加氯水变红 → 证明有 Fe²⁺）', 165, 148);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 甲烷取代 vs 乙烯加成：反应类型对比 */
  GEN.organicCompare = function (holder, o) {
    const V = mk(holder, 340, 190, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      function ball(x, y, r, color, label) {
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(label, x, y + 3); ctx.textAlign = 'left';
      }
      const ph = (Math.sin(t * 0.02) + 1) / 2;
      // 上：取代（CH₄ + Cl₂）
      ball(60, 50, 12, '#334155', 'C');
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2 + 0.6;
        ball(60 + 24 * Math.cos(a), 50 + 24 * Math.sin(a), 7, i === 0 && ph > 0.5 ? '#22c55e' : '#94a3b8', i === 0 && ph > 0.5 ? 'Cl' : 'H');
      }
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('取代：换掉一个 H', 130, 50);
      // 下：加成（C=C 打开接两个 Br）
      ball(50, 130, 12, '#334155', 'C');
      ball(86, 130, 12, '#334155', 'C');
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = ph > 0.5 ? 2 : 4;
      ctx.beginPath(); ctx.moveTo(60, 130); ctx.lineTo(76, 130); ctx.stroke();
      if (ph > 0.5) {
        ball(30, 105, 9, '#dc2626', 'Br');
        ball(106, 155, 9, '#dc2626', 'Br');
      }
      ctx.fillStyle = '#475569';
      ctx.fillText('加成：双键打开，两边各接一个', 130, 130);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 实验方案评价：四维度雷达 */
  GEN.evalRadar = function (holder, o) {
    const V = mk(holder, 300, 210, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const cx = V.w / 2, cy = 100;
      const dims = ['原理正确', '操作可行', '安全', '环保'];
      const vals = [0.9, 0.7 + Math.sin(t * 0.01) * 0.2, 0.85, 0.6 + Math.cos(t * 0.013) * 0.25];
      // 背景网格
      for (let r = 0.33; r <= 1; r += 0.33) {
        ctx.strokeStyle = '#e2e8f0';
        ctx.beginPath();
        for (let i = 0; i <= 4; i++) {
          const a = -Math.PI / 2 + i * Math.PI / 2;
          const x = cx + r * 75 * Math.cos(a), y = cy + r * 75 * Math.sin(a);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // 数值多边形
      ctx.fillStyle = 'rgba(37,99,235,.25)';
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2;
      ctx.beginPath();
      vals.forEach(function (v, i) {
        const a = -Math.PI / 2 + i * Math.PI / 2;
        const x = cx + v * 75 * Math.cos(a), y = cy + v * 75 * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.font = '10.5px sans-serif'; ctx.textAlign = 'center';
      dims.forEach(function (d, i) {
        const a = -Math.PI / 2 + i * Math.PI / 2;
        ctx.fillText(d, cx + 95 * Math.cos(a), cy + 95 * Math.sin(a) + 4);
      });
      ctx.textAlign = 'left';
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
