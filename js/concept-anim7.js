/* concept-anim7.js — 初中数学概念针对性演示（第四批） */
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

  /* 有理数加减：数轴上小人走路（正向右、负向左） */
  GEN.numline = function (holder, o) {
    const V = mk(holder, 340, 170, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const a = 5, b = -3;
      const cy = 90, sc = 26, cx = V.w / 2;
      ctx.strokeStyle = '#64748b';
      ctx.beginPath(); ctx.moveTo(20, cy); ctx.lineTo(V.w - 20, cy); ctx.stroke();
      for (let i = -6; i <= 6; i++) {
        ctx.beginPath(); ctx.moveTo(cx + i * sc, cy - 4); ctx.lineTo(cx + i * sc, cy + 4); ctx.stroke();
        ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(i, cx + i * sc, cy + 16);
      }
      ctx.textAlign = 'left';
      const ph = Math.min(1, (t % 240) / 120);
      // 第一段：从0走a
      const p1 = Math.min(1, ph * 2) * a;
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx, cy - 12); ctx.lineTo(cx + p1 * sc, cy - 12); ctx.stroke();
      // 第二段：从a走b
      if (ph > 0.5) {
        const p2 = (ph - 0.5) * 2 * b;
        ctx.strokeStyle = '#dc2626';
        ctx.beginPath(); ctx.moveTo(cx + a * sc, cy - 24); ctx.lineTo(cx + a * sc + p2 * sc, cy - 24); ctx.stroke();
      }
      // 小人
      const pos = ph <= 0.5 ? p1 : a + (ph - 0.5) * 2 * b;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(cx + pos * sc, cy - 34, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#475569'; ctx.font = '12px sans-serif';
      ctx.fillText(ph > 0.99 ? '5 + (-3) = 2（终点在 2）' : '先向右走 5，再向左走 3…', 60, 30);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 乘方：细胞分裂式指数增长 */
  GEN.powerGrowth = function (holder, o) {
    const V = mk(holder, 340, 170, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const n = Math.floor(t / 90) % 6;
      const count = Math.pow(2, n);
      ctx.fillStyle = '#475569'; ctx.font = '12px sans-serif';
      ctx.fillText('2 的 ' + n + ' 次方 = ' + count + '（每次翻倍）', 60, 24);
      const cols = Math.min(16, count);
      const rows = Math.ceil(count / 16);
      for (let i = 0; i < count; i++) {
        const x = 30 + (i % 16) * 18;
        const y = 50 + Math.floor(i / 16) * 20;
        ctx.fillStyle = i % 2 ? '#38bdf8' : '#fbbf24';
        ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
      }
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 绝对值：数轴上到原点的距离（尺子量） */
  GEN.absDist = function (holder, o) {
    const V = mk(holder, 340, 160, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const a = -4;
      const cy = 80, sc = 30, cx = V.w / 2;
      ctx.strokeStyle = '#64748b';
      ctx.beginPath(); ctx.moveTo(20, cy); ctx.lineTo(V.w - 20, cy); ctx.stroke();
      for (let i = -5; i <= 5; i++) {
        ctx.beginPath(); ctx.moveTo(cx + i * sc, cy - 4); ctx.lineTo(cx + i * sc, cy + 4); ctx.stroke();
        ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(i, cx + i * sc, cy + 16);
      }
      ctx.textAlign = 'left';
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(cx + a * sc, cy, 7, 0, Math.PI * 2); ctx.fill();
      // 距离尺
      const ph = Math.min(1, (t % 200) / 100);
      ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(cx, cy - 20); ctx.lineTo(cx + a * sc * ph, cy - 20); ctx.stroke();
      ctx.fillStyle = '#16a34a'; ctx.font = '12px sans-serif';
      ctx.fillText('|' + a + '| = ' + Math.abs(a) + '（距离没有负数）', 90, 34);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 科学记数法：小数点搬家 */
  GEN.sciMove = function (holder, o) {
    const V = mk(holder, 340, 160, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const num = '384000';
      const ph = Math.floor(t / 110) % 6;
      ctx.font = 'bold 26px monospace'; ctx.fillStyle = '#1e293b';
      const x0 = 60;
      for (let i = 0; i < num.length; i++) {
        ctx.fillText(num[i], x0 + i * 26, 70);
      }
      // 小数点位置动画
      const dotX = x0 + num.length * 26 - 8 - ph * 26;
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(dotX, 74, 4, 0, Math.PI * 2); ctx.fill();
      ctx.font = '13px sans-serif';
      ctx.fillText('= ' + num.slice(0, 1) + '.' + num.slice(1) + ' × 10^' + ph, 60, 110);
      ctx.fillStyle = '#64748b'; ctx.font = '11px sans-serif';
      ctx.fillText('小数点左移 ' + ph + ' 位 → 指数就是 ' + ph, 60, 135);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 整式乘法：面积模型 (a+b)(c+d) 四块面积 */
  GEN.polyArea = function (holder, o) {
    const V = mk(holder, 340, 180, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const a = 70, b = 40, c = 60, d = 30;
      const x0 = 60, y0 = 40;
      ctx.fillStyle = 'rgba(37,99,235,.3)'; ctx.fillRect(x0, y0, a, c);
      ctx.fillStyle = 'rgba(220,38,38,.3)'; ctx.fillRect(x0 + a, y0, b, c);
      ctx.fillStyle = 'rgba(5,150,105,.3)'; ctx.fillRect(x0, y0 + c, a, d);
      ctx.fillStyle = 'rgba(245,158,11,.3)'; ctx.fillRect(x0 + a, y0 + c, b, d);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(x0, y0, a + b, c + d);
      ctx.beginPath(); ctx.moveTo(x0 + a, y0); ctx.lineTo(x0 + a, y0 + c + d); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x0, y0 + c); ctx.lineTo(x0 + a + b, y0 + c); ctx.stroke();
      ctx.fillStyle = '#1e293b'; ctx.font = '11px sans-serif';
      ctx.fillText('ac', x0 + a / 2 - 6, y0 + c / 2);
      ctx.fillText('bc', x0 + a + b / 2 - 6, y0 + c / 2);
      ctx.fillText('ad', x0 + a / 2 - 6, y0 + c + d / 2);
      ctx.fillText('bd', x0 + a + b / 2 - 6, y0 + c + d / 2);
      ctx.fillText('(a+b)(c+d) = ac+bc+ad+bd —— 每块面积都要算到', 40, 165);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 乘法公式：(a+b)² 正方形四块 */
  GEN.squareFormula = function (holder, o) {
    const V = mk(holder, 340, 180, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const a = 80, b = 35;
      const x0 = 70, y0 = 30;
      ctx.fillStyle = 'rgba(37,99,235,.35)'; ctx.fillRect(x0, y0, a, a);
      ctx.fillStyle = 'rgba(220,38,38,.3)'; ctx.fillRect(x0 + a, y0, b, a);
      ctx.fillStyle = 'rgba(5,150,105,.3)'; ctx.fillRect(x0, y0 + a, a, b);
      ctx.fillStyle = 'rgba(245,158,11,.4)'; ctx.fillRect(x0 + a, y0 + a, b, b);
      ctx.strokeStyle = '#475569'; ctx.strokeRect(x0, y0, a + b, a + b);
      ctx.beginPath(); ctx.moveTo(x0 + a, y0); ctx.lineTo(x0 + a, y0 + a + b); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x0, y0 + a); ctx.lineTo(x0 + a + b, y0 + a); ctx.stroke();
      ctx.fillStyle = '#1e293b'; ctx.font = '12px sans-serif';
      ctx.fillText('a²', x0 + a / 2 - 6, y0 + a / 2);
      ctx.fillText('ab', x0 + a + b / 2 - 6, y0 + a / 2);
      ctx.fillText('ab', x0 + a / 2 - 6, y0 + a + b / 2);
      ctx.fillText('b²', x0 + a + b / 2 - 6, y0 + a + b / 2);
      ctx.fillText('(a+b)² = a² + 2ab + b²', 90, 165);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
