/* concept-anim8.js — 场景化演示引擎（第五批：补齐全部概念条目） */
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

  /* 化学式组装：H₂ + O₂ → H₂O 原子重新组合 */
  GEN.chemSymbol = function (holder, o) {
    const V = mk(holder, 340, 180, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const ph = (t % 260) / 260;
      function atom(x, y, r, color, label) {
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(label, x, y + 3); ctx.textAlign = 'left';
      }
      if (ph < 0.4) {
        atom(70, 80, 12, '#38bdf8', 'H'); atom(95, 80, 12, '#38bdf8', 'H');
        atom(180, 80, 14, '#dc2626', 'O');
        ctx.fillStyle = '#475569'; ctx.font = '12px sans-serif';
        ctx.fillText('2H + O（原子）', 60, 140);
      } else {
        const k = Math.min(1, (ph - 0.4) / 0.4);
        atom(120 + 30 * k, 80, 14, '#dc2626', 'O');
        atom(95 + 20 * k, 60 - 10 * k, 12, '#38bdf8', 'H');
        atom(95 + 20 * k, 100 + 10 * k, 12, '#38bdf8', 'H');
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(112 + 25 * k, 70); ctx.lineTo(128 + 28 * k, 78); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(112 + 25 * k, 90); ctx.lineTo(128 + 28 * k, 82); ctx.stroke();
        ctx.fillStyle = '#475569'; ctx.font = '12px sans-serif';
        ctx.fillText('H₂O：两个 H 一个 O，角形结构', 60, 140);
      }
      ctx.fillStyle = '#64748b'; ctx.font = '11px sans-serif';
      ctx.fillText('化学式 = 原子个数比的最简表示', 70, 24);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 平行线：三线八角高亮 */
  GEN.parallelLines = function (holder, o) {
    const V = mk(holder, 340, 180, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(30, 60); ctx.lineTo(310, 60); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(30, 120); ctx.lineTo(310, 120); ctx.stroke();
      ctx.strokeStyle = '#dc2626';
      ctx.beginPath(); ctx.moveTo(100, 20); ctx.lineTo(240, 160); ctx.stroke();
      const act = Math.floor(t / 100) % 3;
      const names = ['同位角相等', '内错角相等', '同旁内角互补'];
      const pairs = [[[163, 60], [233, 120]], [[163, 60], [157, 120]], [[163, 60], [177, 120]]];
      ctx.fillStyle = 'rgba(245,158,11,.5)';
      pairs[act].forEach(function (p) { ctx.beginPath(); ctx.arc(p[0], p[1], 10, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = '#475569'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText(names[act], 120, 30);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 声音产生：音叉振动 + 乒乓球放大 */
  GEN.vibrate = function (holder, o) {
    const V = mk(holder, 340, 180, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const vib = Math.sin(t * 0.6) * 4;
      // 音叉
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(120 + vib, 40); ctx.lineTo(120 + vib, 100); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(150 - vib, 40); ctx.lineTo(150 - vib, 100); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(120, 100); ctx.quadraticCurveTo(135, 120, 150, 100); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(135, 118); ctx.lineTo(135, 150); ctx.stroke();
      // 乒乓球被弹开
      const bx = 175 + Math.abs(vib) * 6;
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath(); ctx.moveTo(230, 30); ctx.lineTo(bx, 60); ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(bx, 60, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('音叉振动发声，乒乓球放大微小振动（转换法）', 40, 170);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 平面镜：物像对称 */
  GEN.mirror = function (holder, o) {
    const V = mk(holder, 340, 180, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const cx = V.w / 2;
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(cx, 30); ctx.lineTo(cx, 150); ctx.stroke();
      const d = 60 + Math.sin(t * 0.02) * 20;
      // 物
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(cx - d, 90, 12, 0, Math.PI * 2); ctx.fill();
      // 像（虚）
      ctx.fillStyle = 'rgba(220,38,38,.35)';
      ctx.beginPath(); ctx.arc(cx + d, 90, 12, 0, Math.PI * 2); ctx.fill();
      ctx.setLineDash([4, 4]); ctx.strokeStyle = '#94a3b8';
      ctx.beginPath(); ctx.moveTo(cx - d, 90); ctx.lineTo(cx + d, 90); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('物距 = 像距 = ' + Math.round(d / 2), 40, 24);
      ctx.fillText('等大、正立、虚像，连线垂直镜面', 60, 170);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 连通器：液面相平 */
  GEN.vessels = function (holder, o) {
    const V = mk(holder, 340, 180, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const level = 90 + Math.sin(t * 0.03) * 10;
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(80, 40); ctx.lineTo(80, 140); ctx.lineTo(260, 140); ctx.lineTo(260, 40);
      ctx.moveTo(170, 60); ctx.lineTo(170, 140);
      ctx.stroke();
      ctx.fillStyle = 'rgba(59,130,246,.5)';
      ctx.fillRect(83, level, 84, 137 - level);
      ctx.fillRect(173, level, 84, 137 - level);
      ctx.strokeStyle = '#dc2626'; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(60, level); ctx.lineTo(280, level); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('同种液体不流动时，各容器液面相平', 60, 24);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 牛顿第三定律：两小车互推分开 */
  GEN.newton3 = function (holder, o) {
    const V = mk(holder, 340, 170, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const ph = (t % 200) / 200;
      const cx = V.w / 2;
      const sep = ph < 0.2 ? 0 : (ph - 0.2) * 120;
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(0, 130, V.w, 6);
      // 车A（大）车B（小）
      ctx.fillStyle = '#2563eb'; ctx.fillRect(cx - 40 - sep * 0.6, 100, 40, 24);
      ctx.fillStyle = '#dc2626'; ctx.fillRect(cx + sep, 106, 30, 18);
      ctx.fillStyle = '#1e293b';
      ctx.beginPath(); ctx.arc(cx - 30 - sep * 0.6, 128, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx - 10 - sep * 0.6, 128, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 8 + sep, 128, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 22 + sep, 128, 5, 0, Math.PI * 2); ctx.fill();
      if (ph < 0.3) {
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx - 2, 90); ctx.lineTo(cx - 30, 90); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 2, 90); ctx.lineTo(cx + 30, 90); ctx.stroke();
      }
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('互推：作用力与反作用力等大反向，大车慢小车快', 40, 24);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 硬水软水：肥皂水泡沫对比 */
  GEN.soap = function (holder, o) {
    const V = mk(holder, 340, 180, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      function beaker(x, soft) {
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
        ctx.strokeRect(x, 60, 90, 90);
        ctx.fillStyle = 'rgba(59,130,246,.3)'; ctx.fillRect(x + 3, 90, 84, 57);
        const bubbles = soft ? 14 : 3;
        for (let i = 0; i < bubbles; i++) {
          const seed = i * 37 + Math.floor(t / 10);
          const bx = x + 10 + (seed * 13) % 70;
          const by = 88 - ((seed * 7) % 26);
          ctx.strokeStyle = 'rgba(147,197,253,.9)';
          ctx.beginPath(); ctx.arc(bx, by, 4, 0, Math.PI * 2); ctx.stroke();
        }
        if (!soft) {
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(x + 20, 140, 50, 6); // 浮渣
        }
        ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
        ctx.fillText(soft ? '软水：泡沫多' : '硬水：泡沫少+浮渣', x + 8, 170);
      }
      beaker(60, true); beaker(200, false);
      ctx.fillText('加等量肥皂水鉴别', 120, 24);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 等效平衡：两个天平达到相同平衡 */
  GEN.balance2 = function (holder, o) {
    const V = mk(holder, 340, 180, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      function scale(x, label, weights) {
        ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x, 130); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 50, 70); ctx.lineTo(x + 50, 70); ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        weights.forEach(function (w, i) {
          ctx.fillRect(x - 45 + i * 22, 52 - w, 18, 14 + w);
        });
        ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
        ctx.fillText(label, x - 40, 150);
      }
      scale(100, '起始A：2mol SO₃', [20]);
      scale(240, '起始B：2mol SO₂+1mol O₂', [12, 8]);
      ctx.fillStyle = '#16a34a'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText('⇌ 平衡时各组分百分含量相同 = 等效', 60, 24);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 沉淀转化：白色→黄色→黑色 */
  GEN.precip = function (holder, o) {
    const V = mk(holder, 340, 170, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const stage = Math.floor(t / 130) % 3;
      const colors = ['#e2e8f0', '#facc15', '#1e293b'];
      const names = ['AgCl 白色', 'AgI 黄色', 'Ag₂S 黑色'];
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(130, 40); ctx.lineTo(120, 130); ctx.lineTo(220, 130); ctx.lineTo(210, 40); ctx.stroke();
      ctx.fillStyle = colors[stage];
      ctx.fillRect(126, 100, 88, 27);
      ctx.fillStyle = '#475569'; ctx.font = '12px sans-serif';
      ctx.fillText(names[stage], 140, 90);
      ctx.fillText('溶解度：AgCl > AgI > Ag₂S（向更难溶转化）', 40, 155);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 同分异构体：同原子不同排列 */
  GEN.isomer = function (holder, o) {
    const V = mk(holder, 340, 180, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      function atom(x, y, r, color, label) {
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(label, x, y + 3); ctx.textAlign = 'left';
      }
      // 乙醇 C-C-O
      atom(60, 80, 12, '#334155', 'C'); atom(90, 80, 12, '#334155', 'C'); atom(120, 80, 13, '#dc2626', 'O');
      ctx.strokeStyle = '#64748b';
      ctx.beginPath(); ctx.moveTo(72, 80); ctx.lineTo(78, 80); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(102, 80); ctx.lineTo(107, 80); ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText('乙醇 CH₃CH₂OH', 50, 120);
      // 二甲醚 C-O-C
      atom(220, 80, 12, '#334155', 'C'); atom(250, 80, 13, '#dc2626', 'O'); atom(280, 80, 12, '#334155', 'C');
      ctx.strokeStyle = '#64748b';
      ctx.beginPath(); ctx.moveTo(232, 80); ctx.lineTo(237, 80); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(263, 80); ctx.lineTo(268, 80); ctx.stroke();
      ctx.fillStyle = '#475569';
      ctx.fillText('二甲醚 CH₃OCH₃', 210, 120);
      ctx.fillText('分子式都是 C₂H₆O，结构不同 → 性质不同', 60, 150);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
