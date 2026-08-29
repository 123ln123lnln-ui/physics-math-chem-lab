/* explore-anim5_5.js — 第三批动画引擎（农业树 · 批次5，11 个专属原理动画） */
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

  /* 耧车：耧斗下种、耧腿开沟，条播成行；行进速度决定株距 */
  AN.seedDrill = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, scroll = 0, lastDrop = -999;
    const sown = []; // {wx, t0} 世界坐标
    (function loop() {
      const D = (tp && tp.data) || {};
      const v = Math.max(0.5, Math.min(3, D.v !== undefined ? D.v : 1.2));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const rate = 2; // 下种 2 粒/秒
      const spacing = v / rate; // 株距 m
      const pxPerM = 40;
      scroll += v * pxPerM * 0.016;
      // 地面与已播行（世界坐标随滚动左移）
      const gy = 190;
      ctx.fillStyle = '#292018'; ctx.fillRect(0, gy, V.w, V.h - gy);
      ctx.fillStyle = '#3b2d1e'; ctx.fillRect(0, gy, V.w, 6);
      for (let i = sown.length - 1; i >= 0; i--) {
        const x = sown[i].wx - scroll;
        if (x < -20) { sown.splice(i, 1); continue; }
        const age = t - sown[i].t0;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(x, gy + 5, 2, 0, Math.PI * 2); ctx.fill(); // 种子
        if (age > 100) { // 发芽成苗
          const hgt = Math.min(16, (age - 100) * 0.05);
          ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(x, gy);
          ctx.quadraticCurveTo(x - 3, gy - hgt * 0.6, x, gy - hgt); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x, gy - hgt * 0.5); ctx.lineTo(x - 4, gy - hgt * 0.7); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x, gy - hgt * 0.7); ctx.lineTo(x + 4, gy - hgt * 0.9); ctx.stroke();
        }
      }
      // 耧车（屏幕固定）
      const cx = 220, legY = 168;
      ctx.strokeStyle = '#a1887f'; ctx.lineWidth = 4; // 三条耧腿（侧视重叠为一条粗腿）
      ctx.beginPath(); ctx.moveTo(cx - 8, 120); ctx.lineTo(cx - 4, gy - 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, 120); ctx.lineTo(cx + 2, gy - 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 8, 120); ctx.lineTo(cx + 8, gy - 4); ctx.stroke();
      // 耧斗
      ctx.fillStyle = '#8d6e63';
      ctx.beginPath(); ctx.moveTo(cx - 26, 78); ctx.lineTo(cx + 26, 78); ctx.lineTo(cx + 10, 118); ctx.lineTo(cx - 10, 118); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#d7ccc8'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      for (let i = 0; i < 10; i++) { // 斗内种子
        ctx.beginPath(); ctx.arc(cx - 14 + (i * 29) % 28, 86 + (i * 13) % 18, 1.8, 0, Math.PI * 2); ctx.fill();
      }
      // 轮子与牵引
      ctx.strokeStyle = '#a1887f'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx + 44, gy - 12, 12, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 44, gy - 12); ctx.lineTo(cx, 116); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 10, 100); ctx.lineTo(cx + 70, 88); ctx.stroke(); // 辕
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('耧斗', cx - 12, 72);
      ctx.fillText('耧腿', cx + 16, 150);
      ctx.fillText('牵引方向 →', 268, 84);
      // 下种粒子
      if (t - lastDrop > 60 / rate / (v / 1.2)) {
        lastDrop = t;
        sown.push({ wx: scroll + cx + 2, t0: t });
      }
      const fall = ((t - lastDrop) / 20) % 1;
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.arc(cx + 1, 120 + fall * 44, 2.5, 0, Math.PI * 2); ctx.fill();
      // 株距标注
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('行进速度 ' + v.toFixed(1) + ' m/s → 株距约 ' + Math.round(spacing * 100) + ' cm', 20, 24);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('走得太快株距变稀，太慢则过密——均匀是关键', 20, 42);
      cap(ctx, V, '耧车（西汉·赵过）：开沟、下种、覆土一趟完成的条播机');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 翻车龙骨水车：链轮驱动刮板，把水连续提上岸 */
  AN.chainPump = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, field = 0.25;
    (function loop() {
      const D = (tp && tp.data) || {};
      const w = Math.max(10, Math.min(80, D.w !== undefined ? D.w : 40));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 水槽：左下池塘 → 右上田埂
      const x1 = 60, y1 = 190, x2 = 250, y2 = 80;
      const ang = Math.atan2(y1 - y2, x2 - x1); // 上坡角
      const len = Math.hypot(x2 - x1, y1 - y2);
      // 池塘
      ctx.fillStyle = 'rgba(59,130,246,.5)'; ctx.fillRect(0, 196, 110, 44);
      ctx.fillStyle = '#7dd3fc'; ctx.font = '10px sans-serif'; ctx.fillText('池塘', 12, 232);
      // 水槽板
      ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(x1 - 10 * Math.sin(ang), y1 - 10 * Math.cos(ang)); ctx.lineTo(x2 - 10 * Math.sin(ang), y2 - 10 * Math.cos(ang)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1 + 10 * Math.sin(ang), y1 + 10 * Math.cos(ang)); ctx.lineTo(x2 + 10 * Math.sin(ang), y2 + 10 * Math.cos(ang)); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.save(); ctx.translate((x1 + x2) / 2 + 26, (y1 + y2) / 2 + 8); ctx.rotate(-ang); ctx.fillText('水槽', -10, 0); ctx.restore();
      // 链轮
      const r = 13;
      const rot = t * w * 0.004;
      [[x1, y1], [x2, y2]].forEach(function (p, idx) {
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2); ctx.stroke();
        for (let k = 0; k < 6; k++) {
          const a = rot * (idx === 0 ? 1 : 1) + k * Math.PI / 3;
          ctx.beginPath(); ctx.moveTo(p[0], p[1]);
          ctx.lineTo(p[0] + r * Math.cos(a), p[1] + r * Math.sin(a)); ctx.stroke();
        }
      });
      // 手摇柄（上轮）
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      const ha = rot;
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 + 20 * Math.cos(ha), y2 + 20 * Math.sin(ha)); ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(x2 + 20 * Math.cos(ha), y2 + 20 * Math.sin(ha), 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('手摇上链轮', x2 + 18, y2 - 22);
      ctx.fillText('下链轮', x1 - 52, y1 + 6);
      // 链条与刮板（沿槽循环）
      const per = len * 2 + Math.PI * r * 2;
      const spd = w * 0.35;
      for (let i = 0; i < 12; i++) {
        let s = ((t * spd * 0.016 + i * per / 12) % per);
        let px, py, up = false;
        if (s < len) { // 上行段（槽内提水）
          px = x1 + (x2 - x1) * (s / len); py = y1 + (y2 - y1) * (s / len); up = true;
        } else if (s < len + Math.PI * r) { // 绕上轮
          const a = Math.PI - ang - (s - len) / r;
          px = x2 + r * Math.cos(a); py = y2 - r * Math.sin(a);
        } else if (s < len * 2 + Math.PI * r) { // 下行段
          const s2 = s - len - Math.PI * r;
          px = x2 - (x2 - x1) * (s2 / len); py = y2 - (y2 - y1) * (s2 / len) + 20 * Math.cos(ang);
          py = y2 - (y2 - y1) * (s2 / len) + 22;
        } else { // 绕下轮
          const a = -ang - (s - len * 2 - Math.PI * r) / r;
          px = x1 + r * Math.cos(a); py = y1 - r * Math.sin(a) + 22;
        }
        if (up) { // 刮板
          ctx.strokeStyle = '#d7ccc8'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(px - 9 * Math.sin(ang), py - 9 * Math.cos(ang));
          ctx.lineTo(px + 9 * Math.sin(ang), py + 9 * Math.cos(ang)); ctx.stroke();
          // 刮板推着的水
          ctx.fillStyle = 'rgba(125,211,252,.8)';
          ctx.beginPath(); ctx.arc(px + 4 * Math.cos(-ang), py + 4 * Math.sin(-ang) - 3, 3.2, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = '#64748b';
          ctx.beginPath(); ctx.arc(px, py, 1.8, 0, Math.PI * 2); ctx.fill();
        }
      }
      // 顶部出水 → 稻田
      ctx.fillStyle = 'rgba(125,211,252,.85)';
      for (let i = 0; i < 4; i++) {
        const q = ((t * spd * 0.016 * 3 + i * 9) % 22);
        ctx.beginPath(); ctx.arc(x2 + 12 + q * 0.7, y2 - 6 + q * 0.9, 2, 0, Math.PI * 2); ctx.fill();
      }
      // 稻田水面缓慢升降
      field += (w / 40) * 0.0006 - 0.0004;
      if (field > 0.95) field = 0.2; if (field < 0.15) field = 0.15;
      ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 2;
      ctx.strokeRect(272, 100, 76, 46);
      ctx.fillStyle = 'rgba(59,130,246,.55)';
      ctx.fillRect(273, 100 + 46 * (1 - field), 74, 46 * field);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('稻田', 296, 162);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('转速 ' + w + ' rpm → 提水流量随之增减', 20, 22);
      cap(ctx, V, '翻车（三国·马钧改进）：链传动 + 刮板，连续提水近两千年');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 堆肥：好氧微生物分解放热，C/N 决定升温曲线 */
  AN.compostPile = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const microbes = [];
    for (let i = 0; i < 30; i++) microbes.push({ a: Math.random(), b: Math.random(), s: Math.random() * 6 });
    (function loop() {
      const D = (tp && tp.data) || {};
      const cn = Math.max(10, Math.min(50, D.cn !== undefined ? D.cn : 27));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 活性系数：C/N 越接近 27 越高
      const act = Math.exp(-Math.pow((cn - 27) / 11, 2));
      const peak = 30 + 36 * act; // 峰值温度
      const tau = (t * 0.0035) % 1;
      const T = 20 + (peak - 20) * Math.sin(Math.PI * Math.min(1, tau * 1.15));
      // 堆体
      ctx.fillStyle = '#3b2d1e';
      ctx.beginPath(); ctx.moveTo(20, 190); ctx.quadraticCurveTo(80, 80, 120, 82);
      ctx.quadraticCurveTo(160, 82, 200, 190); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#5d4633'; ctx.lineWidth = 2; ctx.stroke();
      // 微生物
      microbes.forEach(function (m, i) {
        const mx = 40 + m.a * 140, my = 110 + m.b * 70;
        const jit = 0.5 + act * 2;
        ctx.fillStyle = ['#4ade80', '#fbbf24', '#f87171'][i % 3];
        ctx.beginPath(); ctx.arc(mx + Math.sin(t * 0.1 * jit + m.s) * jit, my + Math.cos(t * 0.08 * jit + m.s * 2) * jit, 2, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('好氧微生物', 74, 206);
      // O2 箭头进入
      ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const ay = 130 + i * 22;
        ctx.beginPath(); ctx.moveTo(8, ay); ctx.lineTo(26, ay); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(26, ay); ctx.lineTo(20, ay - 4); ctx.moveTo(26, ay); ctx.lineTo(20, ay + 4); ctx.stroke();
      }
      ctx.fillStyle = '#7dd3fc'; ctx.fillText('O₂', 8, 124);
      // 热气上升
      ctx.strokeStyle = 'rgba(248,113,113,' + (0.25 + act * 0.6) + ')'; ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const hx = 80 + i * 30;
        ctx.beginPath();
        for (let yy = 0; yy <= 26; yy += 3) {
          const xx = hx + Math.sin(yy * 0.3 + t * 0.12 + i * 2) * 4;
          if (yy === 0) ctx.moveTo(xx, 84 - yy); else ctx.lineTo(xx, 84 - yy);
        }
        ctx.stroke();
      }
      // 温度计
      ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText('堆体 ' + Math.round(T) + '℃', 210, 60);
      // 右侧温度-时间曲线
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(210, 74, 140, 130);
      // 55-65℃ 杀菌带
      const yOf = function (temp) { return 204 - (temp - 20) / 55 * 130; };
      ctx.fillStyle = 'rgba(74,222,128,.14)';
      ctx.fillRect(211, yOf(65), 138, yOf(55) - yOf(65));
      ctx.strokeStyle = 'rgba(74,222,128,.5)'; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(210, yOf(55)); ctx.lineTo(350, yOf(55)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#4ade80'; ctx.font = '9px sans-serif';
      ctx.fillText('55–65℃ 杀菌带', 236, yOf(55) + 10);
      // 曲线
      ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 140; i++) {
        const tt = i / 140;
        const temp = 20 + (peak - 20) * Math.sin(Math.PI * Math.min(1, tt * 1.15));
        if (i === 0) ctx.moveTo(210 + i, yOf(temp)); else ctx.lineTo(210 + i, yOf(temp));
      }
      ctx.stroke();
      const mx = 210 + tau * 140;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(mx, yOf(T), 3.5, 0, Math.PI * 2); ctx.fill();
      // 状态
      let verdict, vc;
      if (cn < 20) { verdict = '氮偏多：升温快但跑氨气，有臭味'; vc = '#fbbf24'; }
      else if (cn <= 34) { verdict = '黄金区间：微生物吃得又饱又好'; vc = '#4ade80'; }
      else { verdict = '碳偏多：氮不够，分解又慢又冷'; vc = '#60a5fa'; }
      ctx.fillStyle = vc; ctx.font = '11px sans-serif';
      ctx.fillText('C/N = ' + cn + ':1　' + verdict, 20, 24);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('天数 →', 306, 216);
      cap(ctx, V, '好氧分解放热：C/N≈25–30 时堆体冲到 55–65℃ 杀菌');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 豆科轮作：根瘤固氮养地，土壤氮随轮作节奏起伏 */
  AN.legumeRotation = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, year = 0, soilN = 55;
    const hist = [];
    const n2s = [];
    (function loop() {
      const D = (tp && tp.data) || {};
      const f = Math.max(0, Math.min(50, D.f !== undefined ? D.f : 25));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 年轮替
      if (t % 90 === 0) {
        year++;
        const period = f > 0 ? Math.max(2, Math.round(100 / f)) : 999;
        const isLegume = year % period === 0;
        soilN = Math.max(15, Math.min(95, soilN + (isLegume ? 20 : -7)));
        hist.push({ y: year, n: soilN, leg: isLegume });
        if (hist.length > 11) hist.shift();
      }
      const period = f > 0 ? Math.max(2, Math.round(100 / f)) : 999;
      const curLegume = year % period === 0 && year > 0;
      // 左侧：植株与根
      const gnd = 120;
      ctx.fillStyle = '#3b2d1e'; ctx.fillRect(10, gnd, 170, 90);
      ctx.fillStyle = '#5d4633'; ctx.fillRect(10, gnd, 170, 4);
      const px = 95;
      // 茎叶（豆年绿茂，麦年金穗）
      ctx.strokeStyle = curLegume ? '#4ade80' : '#eab308'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(px, gnd); ctx.lineTo(px, gnd - 52); ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const ly = gnd - 14 - i * 11;
        ctx.beginPath(); ctx.moveTo(px, ly); ctx.lineTo(px - 12, ly - 7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px, ly); ctx.lineTo(px + 12, ly - 7); ctx.stroke();
      }
      // 根
      ctx.strokeStyle = '#d7ccc8'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px, gnd); ctx.lineTo(px - 6, gnd + 30); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, gnd); ctx.lineTo(px + 8, gnd + 34); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, gnd); ctx.lineTo(px, gnd + 42); ctx.stroke();
      // 根瘤
      if (curLegume) {
        ctx.fillStyle = '#f9a8d4';
        [[px - 5, gnd + 18], [px + 6, gnd + 24], [px - 2, gnd + 33], [px + 3, gnd + 40]].forEach(function (p) {
          ctx.beginPath(); ctx.arc(p[0], p[1], 3.5, 0, Math.PI * 2); ctx.fill();
        });
        ctx.fillStyle = '#f9a8d4'; ctx.font = '9px sans-serif';
        ctx.fillText('根瘤', px + 16, gnd + 26);
      }
      // N2 从空气入根瘤（豆年）
      if (curLegume && t % 20 === 0) n2s.push({ x: 30 + Math.random() * 130, y: 20, ph: 0 });
      for (let i = n2s.length - 1; i >= 0; i--) {
        const m = n2s[i];
        if (m.ph === 0) { m.y += 1.2; if (m.y >= gnd) m.ph = 1; }
        else { m.x += (px - m.x) * 0.06; m.y += (gnd + 26 - m.y) * 0.06; }
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath(); ctx.arc(m.x - 2.5, m.y, 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(m.x + 2.5, m.y, 2.2, 0, Math.PI * 2); ctx.fill();
        if (m.ph === 1 && Math.abs(m.x - px) < 8 && m.y > gnd + 16) {
          n2s.splice(i, 1);
          ctx.fillStyle = '#4ade80';
        }
      }
      ctx.fillStyle = '#60a5fa'; ctx.font = '9px sans-serif';
      ctx.fillText('N₂（空气）', 18, 16);
      ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 11px sans-serif';
      ctx.fillText('第 ' + year + ' 年：' + (curLegume ? '种豆（固氮养地 ↑）' : '种麦（耗氮 ↓）'), 14, 110 - 4);
      // 右侧：土壤氮历史曲线
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(200, 60, 150, 130);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('土壤氮含量（12 年）', 214, 52);
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2;
      ctx.beginPath();
      hist.forEach(function (h2, i) {
        const x = 206 + i * 13, y = 185 - (h2.n - 15) / 80 * 118;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      hist.forEach(function (h2, i) {
        const x = 206 + i * 13, y = 185 - (h2.n - 15) / 80 * 118;
        ctx.fillStyle = h2.leg ? '#f9a8d4' : '#eab308';
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
      });
      if (hist.length) {
        ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 11px sans-serif';
        ctx.fillText('当前 ' + Math.round(hist[hist.length - 1].n) + '%', 296, 76);
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('豆科占比 ' + f + '%（' + (f === 0 ? '从不种豆，地力下滑' : '约每 ' + period + ' 年一茬豆') + '）', 20, 24);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('粉点=豆年  黄点=麦年', 232, 204);
      cap(ctx, V, '根瘤菌把 N₂ 变成 NH₃：1888 年贝耶林克揭开谜底');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 杂交育种：亲本自交系 → F1 整齐强壮 → F2 性状分离 */
  AN.hybridVigor = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    function plant(ctx, x, base, hgt, sway, col) {
      ctx.strokeStyle = col; ctx.lineWidth = 2.5;
      const lean = Math.sin(t * 0.03 + x) * sway;
      ctx.beginPath(); ctx.moveTo(x, base);
      ctx.quadraticCurveTo(x + lean, base - hgt * 0.55, x + lean * 1.6, base - hgt); ctx.stroke();
      for (let i = 1; i <= 3; i++) {
        const ly = base - hgt * i / 4, lx = x + lean * i / 4;
        ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx - 8, ly - 5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 8, ly - 5); ctx.stroke();
      }
    }
    (function loop() {
      const D = (tp && tp.data) || {};
      const div = Math.max(0, Math.min(100, D.div !== undefined ? D.div : 60));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const hP1 = 26, hP2 = 30;
      const hF1 = hP1 + (div / 100) * 34; // 杂种优势
      // 亲本 A / B
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('亲本 A（自交系）', 16, 40);
      ctx.fillText('亲本 B（自交系）', 250, 40);
      for (let i = 0; i < 3; i++) plant(ctx, 30 + i * 26, 84, hP1, 1.2, '#94a3b8');
      for (let i = 0; i < 3; i++) plant(ctx, 264 + i * 26, 84, hP2, 1.2, '#94a3b8');
      // 杂交符号
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 16px sans-serif';
      ctx.fillText('×', 172, 78);
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(120, 74); ctx.lineTo(160, 74); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(240, 74); ctx.lineTo(200, 74); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(180, 84); ctx.lineTo(180, 104); ctx.stroke();
      // F1 代
      ctx.fillStyle = '#4ade80'; ctx.font = 'bold 11px sans-serif';
      ctx.fillText('F1 杂种一代：整齐、强壮（+' + Math.round((hF1 - hP1) / hP1 * 100) + '%）', 92, 108);
      for (let i = 0; i < 7; i++) plant(ctx, 66 + i * 34, 168, hF1, 2, '#4ade80');
      // 地面线
      ctx.strokeStyle = '#5d4633'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(10, 84); ctx.lineTo(130, 84); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(230, 84); ctx.lineTo(350, 84); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(40, 168); ctx.lineTo(320, 168); ctx.stroke();
      // F2 分离
      ctx.fillStyle = '#fbbf24'; ctx.font = '11px sans-serif';
      ctx.fillText('F2 代：性状分离，高矮不齐 → 须年年重新制种', 66, 186);
      const rng = [0.55, 1.15, 0.7, 1.3, 0.6, 1.05, 0.8, 1.25, 0.65];
      for (let i = 0; i < 9; i++) {
        const hVar = hF1 * (0.5 + (div / 100) * 0.7 * (rng[i] - 0.5));
        plant(ctx, 42 + i * 33, 224, Math.max(12, hVar), 1.6, '#eab308');
      }
      ctx.strokeStyle = '#5d4633';
      ctx.beginPath(); ctx.moveTo(20, 224); ctx.lineTo(340, 224); ctx.stroke();
      // 上方说明
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('亲本遗传差异 ' + div + '%：差异越大，F1 优势越猛、F2 分离越乱', 20, 20);
      cap(ctx, V, '杂种优势：坏隐性基因被对方的好显性基因"盖住"');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 哈伯-博施法：N₂+3H₂ 在铁催化表面合成 NH₃，压强拉高产率 */
  AN.haberBosch = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const mols = []; // {x,y,type:'N2'|'H2'|'NH3',st}
    (function loop() {
      const D = (tp && tp.data) || {};
      const p = Math.max(50, Math.min(1000, D.p !== undefined ? D.p : 200));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 单程转化率随压强上升（勒夏特列：4体积→2体积）
      const conv = 8 + 38 * Math.pow((p - 50) / 950, 0.6);
      // 合成塔
      ctx.fillStyle = 'rgba(51,65,85,.9)';
      ctx.beginPath(); ctx.moveTo(120, 60); ctx.lineTo(240, 60); ctx.lineTo(252, 200); ctx.lineTo(108, 200); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('合成塔 450℃ / ' + p + ' atm', 122, 52);
      // 铁催化剂床
      ctx.fillStyle = '#78350f';
      ctx.fillRect(122, 130, 116, 26);
      ctx.fillStyle = '#fbbf24';
      for (let i = 0; i < 18; i++) {
        ctx.beginPath(); ctx.arc(130 + (i * 37) % 104, 135 + (i * 17) % 16, 1.8, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#fbbf24'; ctx.font = '9px sans-serif';
      ctx.fillText('铁催化剂床（拆分子、拼原子）', 118, 172);
      // 进料：3 份 H₂ + 1 份 N₂
      if (t % 24 === 0) {
        const r = Math.random();
        mols.push({ x: 180, y: 64, type: r < 0.72 ? 'H2' : 'N2', st: 'in', vy: 0.7 + Math.random() * 0.4 });
      }
      for (let i = mols.length - 1; i >= 0; i--) {
        const m = mols[i];
        if (m.st === 'in') {
          m.y += m.vy; m.x += Math.sin(t * 0.1 + i) * 0.3;
          if (m.y > 150) { // 触碰催化床
            if (Math.random() * 100 < conv * 0.5) { m.st = 'out'; m.type = 'NH3'; }
            else { m.st = 'out'; } // 未反应也下行汇入循环
          }
        } else {
          m.y += 1.1; m.x += (180 - m.x) * 0.02;
          if (m.y > 206) mols.splice(i, 1);
        }
        // 绘制
        if (m.type === 'H2') {
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath(); ctx.arc(m.x - 2, m.y, 2, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(m.x + 2, m.y, 2, 0, Math.PI * 2); ctx.fill();
        } else if (m.type === 'N2') {
          ctx.fillStyle = '#60a5fa';
          ctx.beginPath(); ctx.arc(m.x - 2.6, m.y, 2.6, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(m.x + 2.6, m.y, 2.6, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = '#4ade80';
          ctx.beginPath(); ctx.arc(m.x, m.y, 2.8, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#bbf7d0';
          ctx.beginPath(); ctx.arc(m.x - 3, m.y - 2.4, 1.3, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(m.x + 3, m.y - 2.4, 1.3, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(m.x, m.y - 3.4, 1.3, 0, Math.PI * 2); ctx.fill();
        }
      }
      // 进气标注
      ctx.fillStyle = '#60a5fa'; ctx.font = '10px sans-serif';
      ctx.fillText('N₂', 140, 76);
      ctx.fillStyle = '#e2e8f0'; ctx.fillText('+ 3H₂', 158, 76);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('进气', 96, 76);
      // 出塔分流：NH₃ 取走，余气循环
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(180, 200); ctx.lineTo(180, 212); ctx.lineTo(290, 212); ctx.stroke();
      ctx.fillStyle = '#4ade80'; ctx.font = '10px sans-serif';
      ctx.fillText('NH₃ 冷凝取出（→ 尿素/硝铵）', 192, 224);
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(180, 200); ctx.lineTo(180, 208); ctx.lineTo(60, 208); ctx.lineTo(60, 90); ctx.lineTo(108, 90); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(108, 90); ctx.lineTo(100, 86); ctx.moveTo(108, 90); ctx.lineTo(100, 94); ctx.stroke();
      ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
      ctx.fillText('未反应气循环回塔', 20, 222);
      // 转化指示
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('压强 ' + p + ' atm → 单程转化率约 ' + Math.round(conv) + '%（勒夏特列：增压右移）', 20, 22);
      cap(ctx, V, 'N₂ + 3H₂ ⇌ 2NH₃：高温高压 + 铁催化，把空气变成氮肥');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* DDT 生物富集：沿食物链逐级浓缩，顶级捕食者遭殃 */
  AN.ddtFoodChain = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const tox = [];
    (function loop() {
      const D = (tp && tp.data) || {};
      const d = Math.max(0, Math.min(100, D.d !== undefined ? D.d : 40));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 水环境
      ctx.fillStyle = 'rgba(30,58,95,.75)'; ctx.fillRect(0, 118, 360, 122);
      // DDT 从农田流入
      ctx.fillStyle = '#3b2d1e'; ctx.fillRect(0, 96, 70, 22);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('农田喷洒', 12, 92);
      if (Math.random() < d / 100 * 0.45) tox.push({ x: 34, y: 124 + Math.random() * 88, lv: 0 });
      // 营养级：浮游 → 小鱼 → 大鱼 → 鹰
      const c0 = d / 100 * 2; // 水体浓度
      const conc = [c0, c0 * 100, c0 * 10000, c0 * 1000000];
      const labels = ['浮游生物', '小鱼', '大鱼', '食鱼鹰'];
      const xs = [78, 158, 238, 316];
      // 画生物
      // 浮游生物（小绿点群）
      ctx.fillStyle = '#4ade80';
      for (let i = 0; i < 8; i++) {
        ctx.beginPath(); ctx.arc(58 + (i * 17) % 44, 150 + (i * 23) % 50 + Math.sin(t * 0.05 + i) * 2, 2.5, 0, Math.PI * 2); ctx.fill();
      }
      // 小鱼
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath(); ctx.ellipse(158, 165, 14, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(171, 165); ctx.lineTo(180, 159); ctx.lineTo(180, 171); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(150, 163, 1.6, 0, Math.PI * 2); ctx.fill();
      // 大鱼
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath(); ctx.ellipse(238, 172, 24, 11, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(261, 172); ctx.lineTo(274, 163); ctx.lineTo(274, 181); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(226, 169, 2, 0, Math.PI * 2); ctx.fill();
      // 鹰（站在水面之上的岩石）
      ctx.fillStyle = '#475569'; ctx.fillRect(300, 108, 44, 12);
      const eagleToxic = conc[3] > 60;
      ctx.fillStyle = eagleToxic ? '#b45309' : '#a16207';
      ctx.beginPath(); ctx.ellipse(322, 94, 12, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(332, 86, 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.moveTo(336, 86); ctx.lineTo(342, 88); ctx.lineTo(336, 90); ctx.closePath(); ctx.fill();
      // 翅膀扇动
      const flap = Math.sin(t * 0.08) * 8;
      ctx.strokeStyle = eagleToxic ? '#b45309' : '#a16207'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(318, 90); ctx.quadraticCurveTo(306, 74 - flap, 296, 78 - flap); ctx.stroke();
      // 蛋壳：浓度高则薄且裂
      const shell = Math.max(1, 5 - conc[3] / 40);
      ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = shell;
      ctx.beginPath(); ctx.ellipse(310, 116, 6, 7.5, 0, 0, Math.PI * 2); ctx.stroke();
      if (conc[3] > 60) {
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(306, 111); ctx.lineTo(311, 117); ctx.lineTo(307, 123); ctx.stroke();
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText(conc[3] > 60 ? '蛋壳变薄破裂' : '鹰蛋', 292, 136);
      // DDT 红点迁移
      for (let i = tox.length - 1; i >= 0; i--) {
        const m = tox[i];
        const target = xs[Math.min(m.lv, 3)];
        m.x += 0.5 + m.lv * 0.15;
        if (m.x > target) { m.lv++; m.x = target - 60; if (m.lv > 3) { tox.splice(i, 1); continue; } }
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(m.x, m.y + Math.sin(t * 0.1 + i) * 2, 2, 0, Math.PI * 2); ctx.fill();
      }
      // 各营养级浓度条（对数）
      for (let i = 0; i < 4; i++) {
        const lg = conc[i] > 0 ? Math.min(6, Math.log10(Math.max(1e-6, conc[i]) / 2e-6)) / 2 : 0;
        const bh = Math.max(2, lg * 9);
        ctx.fillStyle = 'rgba(239,68,68,.75)';
        ctx.fillRect(xs[i] - 16, 206 - bh, 32, bh);
        ctx.strokeStyle = '#7f1d1d'; ctx.lineWidth = 1;
        ctx.strokeRect(xs[i] - 16, 206 - bh, 32, bh);
        ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
        ctx.fillText(labels[i], xs[i] - 16, 219);
        ctx.fillStyle = '#fca5a5';
        ctx.fillText(i === 0 ? '×1' : '×10' + '⁰¹²³⁴⁵⁶'[i * 2], xs[i] - 10, 206 - bh - 4);
      }
      // 食物链箭头
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const ax = xs[i] + 24, ax2 = xs[i + 1] - 24;
        ctx.beginPath(); ctx.moveTo(ax, 150); ctx.lineTo(ax2, 150); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ax2, 150); ctx.lineTo(ax2 - 5, 146); ctx.moveTo(ax2, 150); ctx.lineTo(ax2 - 5, 154); ctx.stroke();
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('施用量 ' + d + '%：每升一级营养级，浓度放大约百倍', 20, 22);
      cap(ctx, V, '脂溶难降解 → 沿食物链浓缩千万倍（《寂静的春天》1962）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 温室大棚：短波进、红外与对流被挡；通风口开度定棚温 */
  AN.greenhouseFilm = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const heat = []; // 棚内热量粒子
    (function loop() {
      const D = (tp && tp.data) || {};
      const v = Math.max(0, Math.min(100, D.v !== undefined ? D.v : 20));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 稳态棚温：太阳供热 vs 通风散热
      const Tout = 15;
      const Tin = Tout + 24 * (1 - v / 130);
      // 太阳
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.arc(36, 30, 13, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4 + t * 0.005;
        ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(36 + 16 * Math.cos(a), 30 + 16 * Math.sin(a));
        ctx.lineTo(36 + 22 * Math.cos(a), 30 + 22 * Math.sin(a)); ctx.stroke();
      }
      // 短波辐射进棚
      ctx.strokeStyle = 'rgba(253,224,71,.85)'; ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const q = ((t * 1.6 + i * 26) % 78);
        ctx.beginPath(); ctx.moveTo(60 + q, 44 + q * 1.5); ctx.lineTo(68 + q, 54 + q * 1.5); ctx.stroke();
      }
      ctx.fillStyle = '#fde047'; ctx.font = '9px sans-serif';
      ctx.fillText('短波辐射（易进）', 74, 40);
      // 棚体（拱形）
      const gx0 = 60, gx1 = 300, gtop = 78, gbase = 190;
      ctx.strokeStyle = 'rgba(165,243,252,.9)'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(gx0, gbase);
      ctx.quadraticCurveTo(180, gtop - 46, gx1, gbase); ctx.stroke();
      ctx.fillStyle = 'rgba(165,243,252,.07)';
      ctx.beginPath(); ctx.moveTo(gx0, gbase);
      ctx.quadraticCurveTo(180, gtop - 46, gx1, gbase); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#a5f3fc'; ctx.font = '10px sans-serif';
      ctx.fillText('棚膜：拦部分红外 + 挡对流', 196, 74);
      // 地面（被晒热）
      const warmth = Math.min(1, (Tin - Tout) / 24);
      ctx.fillStyle = 'rgba(239,68,68,' + (0.15 + warmth * 0.4) + ')';
      ctx.fillRect(gx0, gbase - 8, gx1 - gx0, 8);
      ctx.fillStyle = '#3b2d1e'; ctx.fillRect(0, gbase, 360, 50);
      // 作物
      for (let i = 0; i < 6; i++) {
        const px = 90 + i * 34;
        ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(px, gbase - 8); ctx.lineTo(px, gbase - 8 - 16 - warmth * 6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px, gbase - 16); ctx.lineTo(px - 6, gbase - 20); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px, gbase - 16); ctx.lineTo(px + 6, gbase - 20); ctx.stroke();
      }
      // 棚内对流环流（被膜挡住）
      ctx.strokeStyle = 'rgba(248,113,113,.7)'; ctx.lineWidth = 1.5;
      const ca = t * 0.04;
      for (let i = 0; i < 2; i++) {
        const ccx = 130 + i * 90, ccy = 140, cr = 22;
        ctx.beginPath(); ctx.arc(ccx, ccy, cr, ca + i * 2, ca + i * 2 + 4.2); ctx.stroke();
        const ea = ca + i * 2 + 4.2;
        const ex = ccx + cr * Math.cos(ea), ey = ccy + cr * Math.sin(ea);
        ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 5, ey - 3); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(248,113,113,.9)'; ctx.font = '9px sans-serif';
      ctx.fillText('热空气跑不掉（挡对流·主因）', 96, 112);
      // 长波红外：部分被膜拦回
      ctx.strokeStyle = 'rgba(249,115,22,.8)'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const ix = 100 + i * 60, iy = gbase - 16 - ((t * 1.2 + i * 18) % 34);
        ctx.beginPath(); ctx.moveTo(ix, iy); ctx.lineTo(ix + 4, iy - 6); ctx.lineTo(ix, iy - 12); ctx.stroke();
      }
      ctx.fillStyle = '#fdba74'; ctx.font = '9px sans-serif';
      ctx.fillText('长波红外（部分拦回）', 236, 116);
      // 通风口（顶部开口，开度 v）
      const openW = 8 + v * 0.3;
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(180 - openW, gtop - 24); ctx.lineTo(180 + openW, gtop - 24); ctx.stroke();
      ctx.fillStyle = '#22d3ee'; ctx.font = '9px sans-serif';
      ctx.fillText('通风口 ' + v + '%', 168, gtop - 32);
      // 热气从通风口逃逸
      if (v > 0) {
        ctx.strokeStyle = 'rgba(248,113,113,' + (v / 100 * 0.9) + ')'; ctx.lineWidth = 2;
        for (let i = 0; i < 2; i++) {
          const hy = gtop - 30 - ((t * (0.6 + v * 0.02) + i * 14) % 22);
          ctx.beginPath(); ctx.moveTo(180 - 6 + i * 12, hy); ctx.lineTo(180 - 6 + i * 12 + 4, hy - 6); ctx.stroke();
        }
      }
      // 棚外冷风
      ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const wx = (t * 1.5 + i * 40) % 90;
        ctx.beginPath(); ctx.moveTo(310 + wx * 0.4, 150 + i * 16); ctx.lineTo(330 + wx * 0.4, 150 + i * 16); ctx.stroke();
      }
      ctx.fillStyle = '#60a5fa'; ctx.font = '9px sans-serif';
      ctx.fillText('棚外冷风 ' + Tout + '℃', 300, 140);
      // 双温度计
      ctx.fillStyle = '#fca5a5'; ctx.font = 'bold 13px sans-serif';
      ctx.fillText('棚内 ' + Math.round(Tin) + '℃', 146, 206);
      ctx.fillStyle = '#93c5fd';
      ctx.fillText('棚外 ' + Tout + '℃', 240, 206);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('通风口开度 ' + v + '% → 棚温随之升降', 20, 22);
      cap(ctx, V, '温室保温的主因是隔绝对流，其次才是拦红外');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 滴灌：迷宫滴头消能，水滴直达根区，地表保持干燥 */
  AN.dripIrrigation = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const drops = [];
    (function loop() {
      const D = (tp && tp.data) || {};
      const q = Math.max(1, Math.min(8, D.q !== undefined ? D.q : 4));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const surf = 150;
      // 土壤剖面
      ctx.fillStyle = '#3b2d1e'; ctx.fillRect(0, surf, 240, 90);
      ctx.fillStyle = '#54402c'; ctx.fillRect(0, surf, 240, 5); // 干燥地表
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('地表干燥（少蒸发、少杂草）', 66, 146);
      // 湿润球（半径随流量）
      const R = 18 + 5 * Math.sqrt(q);
      ctx.fillStyle = 'rgba(59,91,70,.9)';
      ctx.beginPath(); ctx.ellipse(120, surf + 26, R, R * 0.8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#4d7c63'; ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.ellipse(120, surf + 26, R, R * 0.8, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#a7f3d0'; ctx.font = '9px sans-serif';
      ctx.fillText('湿润球', 120 + R + 4, surf + 30);
      // 植株与根
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(120, surf); ctx.lineTo(120, surf - 44); ctx.stroke();
      for (let i = 0; i < 3; i++) {
        const ly = surf - 14 - i * 11;
        ctx.beginPath(); ctx.moveTo(120, ly); ctx.lineTo(120 - 10, ly - 6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(120, ly); ctx.lineTo(120 + 10, ly - 6); ctx.stroke();
      }
      ctx.strokeStyle = '#d7ccc8'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(120, surf); ctx.lineTo(112, surf + 26); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(120, surf); ctx.lineTo(128, surf + 30); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(120, surf); ctx.lineTo(120, surf + 38); ctx.stroke();
      ctx.fillStyle = '#d7ccc8'; ctx.font = '9px sans-serif';
      ctx.fillText('根区', 136, surf + 44);
      // 主管与滴头
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(10, surf - 6); ctx.lineTo(240, surf - 6); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('低压主管', 12, surf - 12);
      ctx.fillStyle = '#22d3ee'; ctx.fillRect(115, surf - 10, 10, 8);
      // 滴水
      if (t % Math.max(6, Math.round(26 - q * 2.6)) === 0) drops.push({ x: 120, y: surf - 2, big: Math.random() < 0.2 });
      for (let i = drops.length - 1; i >= 0; i--) {
        const dr = drops[i];
        dr.y += 0.9;
        ctx.fillStyle = '#7dd3fc';
        ctx.beginPath(); ctx.arc(dr.x, dr.y, dr.big ? 2.8 : 2, 0, Math.PI * 2); ctx.fill();
        if (dr.y > surf + 14) drops.splice(i, 1);
      }
      // 滴头迷宫放大图
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(292, 52, 30, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(125, surf - 12); ctx.lineTo(268, 40); ctx.stroke();
      ctx.setLineDash([]);
      // 迷宫齿
      ctx.strokeStyle = '#0891b2'; ctx.lineWidth = 2;
      ctx.beginPath();
      let zx = 270, zy = 52, dir = 1;
      ctx.moveTo(zx, zy);
      for (let i = 0; i < 8; i++) {
        zy += (i % 2 === 0 ? 5 : -5); zx += 6;
        ctx.lineTo(zx, zy);
        ctx.lineTo(zx, zy + (i % 2 === 0 ? -8 : 8));
      }
      ctx.stroke();
      // 水在迷宫里减速
      const zp = ((t * 0.6) % 48);
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath(); ctx.arc(270 + zp, 52 + Math.sin(zp * 1.2) * 5, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#22d3ee'; ctx.font = '9px sans-serif';
      ctx.fillText('滴头放大：迷宫流道消能', 240, 96);
      // 右侧对比：漫灌 vs 滴灌用水
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('每亩用水对比', 258, 130);
      ctx.fillStyle = 'rgba(96,165,250,.5)'; ctx.fillRect(258, 138, 26, 86);
      ctx.fillStyle = 'rgba(96,165,250,.85)'; ctx.fillRect(292, 138 + 86 * (1 - 0.45), 26, 86 * 0.45);
      ctx.fillStyle = '#93c5fd'; ctx.font = '9px sans-serif';
      ctx.fillText('漫灌', 258, 234 - 8);
      ctx.fillText('滴灌', 292, 234 - 8);
      ctx.fillText('省水 30–70%', 258, 122);
      // 漫灌蒸发箭头
      ctx.strokeStyle = 'rgba(248,113,113,.6)'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const ey = 138 - ((t * 0.8 + i * 12) % 24);
        ctx.beginPath(); ctx.moveTo(262 + i * 8, ey); ctx.lineTo(262 + i * 8, ey - 5); ctx.stroke();
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('滴头流量 ' + q + ' L/h → 湿润球扩大，水刚好喂到根区', 20, 22);
      cap(ctx, V, '滴灌（1965 以色列·布拉斯）：低压慢滴，水肥直达根尖');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 太空育种：宇宙射线打断 DNA，地面万里挑一筛选 */
  AN.spaceBreeding = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, mutFlash = 0, mutAt = 5;
    const rays = [];
    (function loop() {
      const D = (tp && tp.data) || {};
      const d = Math.max(0, Math.min(100, D.d !== undefined ? D.d : 40));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const surv = Math.round(100 * Math.exp(-d / 60));   // 存活率
      const mut = Math.min(35, d * 0.55);                  // 突变率
      // 地球弧线（左下）
      ctx.fillStyle = '#1e3a5f';
      ctx.beginPath(); ctx.arc(60, 320, 130, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(74,222,128,.35)';
      ctx.beginPath(); ctx.arc(30, 250, 18, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(90, 236, 12, 0, Math.PI * 2); ctx.fill();
      // 返回式卫星（种子舱）
      const sa = t * 0.02;
      const sx = 130 + 62 * Math.cos(sa), sy = 96 + 34 * Math.sin(sa);
      ctx.setLineDash([2, 4]); ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(130, 96, 62, 34, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#cbd5e1'; ctx.fillRect(sx - 7, sy - 5, 14, 10);
      ctx.fillStyle = '#3b82f6'; ctx.fillRect(sx - 18, sy - 3, 9, 6); ctx.fillRect(sx + 9, sy - 3, 9, 6);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(sx, sy, 2.2, 0, Math.PI * 2); ctx.fill(); // 舱内种子
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('返回式卫星（搭载种子）', 96, 60);
      // 宇宙射线粒子
      if (Math.random() < d / 100 * 0.6) rays.push({ x: 200 + Math.random() * 150, y: -4, vx: -1.6, vy: 1.6 });
      for (let i = rays.length - 1; i >= 0; i--) {
        const r = rays[i];
        r.x += r.vx; r.y += r.vy;
        ctx.strokeStyle = '#f472b6'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x - 8, r.y + 8); ctx.stroke();
        if (Math.abs(r.x - sx) < 10 && Math.abs(r.y - sy) < 8) { mutFlash = 26; mutAt = Math.floor(Math.random() * 10); rays.splice(i, 1); continue; }
        if (r.y > 250) rays.splice(i, 1);
      }
      ctx.fillStyle = '#f472b6'; ctx.font = '9px sans-serif';
      ctx.fillText('高能宇宙粒子', 238, 20);
      // DNA 双螺旋（中部）
      const hx = 150, hy0 = 130;
      for (let i = 0; i < 10; i++) {
        const yy = hy0 + i * 9;
        const ph = i * 0.7 + t * 0.02;
        const x1 = hx + Math.sin(ph) * 16, x2 = hx - Math.sin(ph) * 16;
        const mutRung = (i === mutAt && mutFlash > 0);
        ctx.strokeStyle = mutRung ? '#f472b6' : 'rgba(148,163,184,.7)'; ctx.lineWidth = mutRung ? 3 : 1.5;
        ctx.beginPath(); ctx.moveTo(x1, yy); ctx.lineTo(x2, yy); ctx.stroke();
        ctx.fillStyle = i % 2 ? '#60a5fa' : '#4ade80';
        ctx.beginPath(); ctx.arc(x1, yy, 2.4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = i % 2 ? '#4ade80' : '#60a5fa';
        ctx.beginPath(); ctx.arc(x2, yy, 2.4, 0, Math.PI * 2); ctx.fill();
      }
      if (mutFlash > 0) {
        ctx.strokeStyle = 'rgba(244,114,182,' + mutFlash / 26 + ')'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(hx, hy0 + mutAt * 9, 14 - mutFlash * 0.3, 0, Math.PI * 2); ctx.stroke();
        mutFlash--;
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('DNA 被打断→修复出错→突变', 92, 236 - 10);
      // 右侧：地面筛选
      ctx.fillStyle = '#3b2d1e'; ctx.fillRect(238, 196, 112, 30);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('地面连种 4 代以上筛选', 232, 110);
      let shown = 0, good = 0;
      for (let i = 0; i < 20; i++) {
        const alive = ((i * 7919) % 100) < surv;
        const isMut = ((i * 104729) % 100) < mut;
        const px = 246 + (i % 5) * 22, py = 196 - 4 - Math.floor(i / 5) * 20;
        if (!alive) {
          ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(px - 3, py); ctx.lineTo(px + 3, py - 6); ctx.moveTo(px + 3, py); ctx.lineTo(px - 3, py - 6); ctx.stroke();
          continue;
        }
        shown++;
        const useful = isMut && (i % 9 === 0);
        if (useful) good++;
        ctx.strokeStyle = useful ? '#fbbf24' : '#4ade80'; ctx.lineWidth = useful ? 2.5 : 1.5;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py - (useful ? 14 : 9)); ctx.stroke();
        if (useful) {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath(); ctx.arc(px, py - 16, 3, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.fillStyle = '#fbbf24'; ctx.font = '9px sans-serif';
      ctx.fillText('金点=有用突变（万里挑一）', 236, 206);
      // 指标
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('剂量 ' + d + ' Gy：存活率约 ' + surv + '%，突变率约 ' + mut.toFixed(0) + '%', 20, 22);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText(d < 15 ? '剂量太低：突变太少，白跑一趟' : d > 75 ? '剂量太高：种子大批死亡' : '半致死剂量附近：突变与存活的平衡点', 40, 40);
      cap(ctx, V, '诱变育种（1987 中国首次搭载）：突变靠射线，良种靠筛选');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 无人机植保：下洗气流翻开冠层，雾滴直达叶背；高度决定漂移 */
  AN.droneSpray = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const mists = [], landed = [];
    (function loop() {
      const D = (tp && tp.data) || {};
      const h = Math.max(1, Math.min(5, D.h !== undefined ? D.h : 2.5));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 飞行高度映射：h 越高机位越高
      const dy = 150 - h * 16; // 机身高 90..134
      const dx = 120 + 60 * Math.sin(t * 0.012);
      // 作物冠层
      ctx.fillStyle = '#14532d'; ctx.fillRect(0, 196, 360, 44);
      for (let i = 0; i < 14; i++) {
        const px = 12 + i * 26;
        const blow = Math.max(0, 1 - Math.abs(px - dx) / 70) * (5 - h) * 1.6; // 下洗压弯
        ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(px, 200);
        ctx.quadraticCurveTo(px + blow, 188, px + blow * 1.8, 180 + Math.min(8, blow)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px + blow * 0.9, 190); ctx.lineTo(px + blow * 0.9 - 7, 185); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px + blow * 0.9, 190); ctx.lineTo(px + blow * 0.9 + 7, 185); ctx.stroke();
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('作物冠层（被下洗气流翻开）', 208, 192);
      // 已着药点（正面亮绿 / 背面黄点）
      for (let i = landed.length - 1; i >= 0; i--) {
        const L = landed[i];
        L.life--;
        ctx.fillStyle = L.under ? 'rgba(251,191,36,' + L.life / 240 + ')' : 'rgba(74,222,128,' + L.life / 240 + ')';
        ctx.beginPath(); ctx.arc(L.x, L.y, 1.8, 0, Math.PI * 2); ctx.fill();
        if (L.life <= 0) landed.splice(i, 1);
      }
      // 无人机（四旋翼）
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(dx - 22, dy - 10); ctx.lineTo(dx + 22, dy + 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(dx - 22, dy + 10); ctx.lineTo(dx + 22, dy - 10); ctx.stroke();
      ctx.fillStyle = '#64748b'; ctx.fillRect(dx - 8, dy - 5, 16, 10);
      ctx.fillStyle = '#22d3ee'; ctx.fillRect(dx - 4, dy + 5, 8, 5); // 药箱
      // 旋翼（旋转模糊）
      [[-22, -10], [22, 10], [-22, 10], [22, -10]].forEach(function (o, i) {
        const rx = dx + o[0], ry = dy + o[1];
        const ra = t * (0.6 + i * 0.02);
        ctx.strokeStyle = 'rgba(226,232,240,.8)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(rx - 11 * Math.cos(ra), ry - 11 * Math.sin(ra) * 0.25);
        ctx.lineTo(rx + 11 * Math.cos(ra), ry + 11 * Math.sin(ra) * 0.25); ctx.stroke();
        ctx.strokeStyle = 'rgba(148,163,184,.3)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(rx, ry, 12, 3.5, 0, 0, Math.PI * 2); ctx.stroke();
      });
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('旋翼下洗气流', dx + 30, dy - 14);
      // 下洗气流箭头
      ctx.strokeStyle = 'rgba(34,211,238,.55)'; ctx.lineWidth = 1.5;
      for (let i = -2; i <= 2; i++) {
        const ax = dx + i * 16;
        const spread = (196 - dy) / 60;
        ctx.beginPath(); ctx.moveTo(ax, dy + 10);
        ctx.quadraticCurveTo(ax + i * 8 * spread, (dy + 196) / 2, ax + i * 14 * spread, 192); ctx.stroke();
      }
      // 喷出雾滴
      if (t % 3 === 0) mists.push({ x: dx - 3 + Math.random() * 6, y: dy + 10, vx: (Math.random() - 0.5) * 0.4, vy: 1.1 });
      const drift = (h - 1) * 0.35; // 高度越高漂移越大
      let under = 0, total = 0;
      for (let i = mists.length - 1; i >= 0; i--) {
        const m = mists[i];
        m.vy += (1.6 - m.vy) * 0.04; // 被下洗加速
        m.x += m.vx + drift * (m.y < dy + 40 ? 0.4 : 1); m.y += m.vy;
        ctx.fillStyle = 'rgba(125,211,252,.8)';
        ctx.beginPath(); ctx.arc(m.x, m.y, 1.6, 0, Math.PI * 2); ctx.fill();
        if (m.y >= 196) {
          const inField = m.x > 8 && m.x < 352;
          const penet = Math.max(0.08, 0.85 - (h - 1) * 0.19); // 高度越低穿透越强
          const isUnder = Math.random() < penet * 0.5;
          if (inField && landed.length < 500) landed.push({ x: m.x, y: 198 + Math.random() * 10, under: isUnder, life: 240 });
          if (inField) { total++; if (isUnder) under++; }
          mists.splice(i, 1);
        } else if (m.x > 360 || m.y > 240) mists.splice(i, 1);
      }
      // RTK 航线虚线
      ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(251,191,36,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(20, dy); ctx.lineTo(340, dy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#fbbf24'; ctx.font = '9px sans-serif';
      ctx.fillText('RTK 厘米级航线', 262, dy - 6);
      // 统计
      const driftPct = Math.round((h - 1) * 9);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('飞行高度 ' + h.toFixed(1) + ' m：穿透' + (h < 2 ? '强' : h > 4 ? '弱' : '中') + '，漂移约 ' + driftPct + '%', 20, 22);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('黄点=叶背着药　绿点=叶面着药（飞得低，叶背着药多）', 20, 40);
      cap(ctx, V, '下洗气流把冠层吹开，雾滴被"押送"到叶背与深处');
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
