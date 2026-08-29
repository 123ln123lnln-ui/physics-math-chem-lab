/* explore-anim5_9.js — 第三批动画引擎（天文树 · 批次9，11 个专属原理动画） */
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

  /* 地心说 vs 日心说：本轮打圈 vs 内圈超车 */
  AN.epicycleHelio = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const trail = [];
    const projTrail = [];
    (function loop() {
      const D = (tp && tp.data) || {};
      const e = Math.max(0, Math.min(40, D.e !== undefined ? D.e : 20));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 左：地心模型
      const gx = 88, gy = 132, R = 48, r = R * e / 100;
      const aD = t * 0.014, aE = t * 0.014 * 6.5;
      ctx.strokeStyle = 'rgba(148,163,184,.55)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(gx, gy, R, 0, Math.PI * 2); ctx.stroke();
      const ex = gx + R * Math.cos(aD), ey = gy + R * Math.sin(aD);
      if (r > 0.5) {
        ctx.strokeStyle = 'rgba(167,139,250,.65)';
        ctx.beginPath(); ctx.arc(ex, ey, r, 0, Math.PI * 2); ctx.stroke();
      }
      const px = ex + r * Math.cos(aE), py = ey + r * Math.sin(aE);
      trail.push({ x: px, y: py });
      if (trail.length > 620) trail.shift();
      ctx.strokeStyle = 'rgba(248,113,113,.5)';
      ctx.beginPath();
      trail.forEach(function (q, i) { if (i === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y); });
      ctx.stroke();
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath(); ctx.arc(gx, gy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f87171';
      ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('地心说', 66, 40);
      ctx.fillText('地球', gx + 9, gy + 4);
      ctx.fillText('均轮', gx + R - 6, gy - R + 12);
      if (r > 0.5) ctx.fillText('本轮', ex + r * 0.4, ey - r - 4);
      // 右：日心模型
      const sx = 266, sy = 132;
      const a1 = t * 0.05, a2 = t * 0.05 * 0.53; // 地球比火星快
      const e1x = sx + 26 * Math.cos(a1), e1y = sy + 26 * Math.sin(a1);
      const m2x = sx + 44 * Math.cos(a2), m2y = sy + 44 * Math.sin(a2);
      ctx.strokeStyle = 'rgba(59,130,246,.5)';
      ctx.beginPath(); ctx.arc(sx, sy, 26, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(248,113,113,.5)';
      ctx.beginPath(); ctx.arc(sx, sy, 44, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(sx, sy, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath(); ctx.arc(e1x, e1y, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f87171';
      ctx.beginPath(); ctx.arc(m2x, m2y, 3.5, 0, Math.PI * 2); ctx.fill();
      // 视线：地球→火星→背景恒星条
      ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(226,232,240,.4)';
      ctx.beginPath(); ctx.moveTo(e1x, e1y); ctx.lineTo(m2x, m2y); ctx.stroke();
      ctx.setLineDash([]);
      const dvx = m2x - e1x, dvy = m2y - e1y;
      if (Math.abs(dvy) > 1e-3) {
        const s = (62 - e1y) / dvy;
        if (s > 1) {
          const hx = e1x + dvx * s;
          ctx.setLineDash([2, 3]); ctx.strokeStyle = 'rgba(226,232,240,.3)';
          ctx.beginPath(); ctx.moveTo(m2x, m2y); ctx.lineTo(hx, 62); ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath(); ctx.arc(hx, 62, 3, 0, Math.PI * 2); ctx.fill();
          projTrail.push(hx);
          if (projTrail.length > 130) projTrail.shift();
        }
      }
      // 背景恒星条与投影轨迹
      ctx.fillStyle = 'rgba(148,163,184,.8)';
      for (let i = 0; i < 12; i++) {
        ctx.beginPath(); ctx.arc(186 + i * 14, 62, 1, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = 'rgba(251,191,36,.55)'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      projTrail.forEach(function (hx, i) { if (i === 0) ctx.moveTo(hx, 70); else ctx.lineTo(hx, 70); });
      ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('日心说', 244, 40);
      ctx.fillText('太阳', sx - 10, sy + 24);
      ctx.fillText('火星投影在背景上"倒退"', 186, 52);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('本轮半径 ' + e + '%：左边靠本轮打圈，右边零本轮', 20, 20);
      cap(ctx, V, '逆行只是地球在内圈"超车"的视觉效应');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 折射望远镜：物镜会聚 + 目镜放大 */
  AN.refractorScope = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const f = Math.max(80, Math.min(800, D.f !== undefined ? D.f : 400));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const axisY = 118, objX = 92;
      const fp = 44 + (f - 80) / 720 * 92; // 物镜焦距（像素示意）
      const focX = objX + fp, eyeX = focX + 26; // 目镜在焦点外侧一点
      // 星光（左上，微倾斜的平行光）
      const tilt = -0.06;
      ctx.strokeStyle = 'rgba(253,224,71,.75)'; ctx.lineWidth = 1.2;
      for (let i = -1; i <= 1; i++) {
        const y0 = axisY + i * 22;
        ctx.beginPath(); ctx.moveTo(14, y0 + tilt * (objX - 14) - 8); ctx.lineTo(objX, y0); ctx.stroke();
        // 过物镜后会聚到焦点
        ctx.beginPath(); ctx.moveTo(objX, y0); ctx.lineTo(focX, axisY); ctx.stroke();
        // 过焦点后到目镜
        const slope = (axisY - y0) / (focX - objX);
        const yAtEye = axisY + slope * (eyeX - focX);
        ctx.beginPath(); ctx.moveTo(focX, axisY); ctx.lineTo(eyeX, yAtEye); ctx.stroke();
        // 目镜后变平行，进入眼睛
        ctx.beginPath(); ctx.moveTo(eyeX, yAtEye); ctx.lineTo(336, axisY + (yAtEye - axisY) * 0.25); ctx.stroke();
      }
      // 物镜（长焦距，弯度小）
      ctx.strokeStyle = '#93c5fd'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(objX, axisY, 5, 40, 0, 0, Math.PI * 2); ctx.stroke();
      // 目镜（短焦距，弯度大）
      ctx.beginPath(); ctx.ellipse(eyeX, axisY, 4, 15, 0, 0, Math.PI * 2); ctx.stroke();
      // 眼睛
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(342, axisY, 8, 12, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath(); ctx.arc(340, axisY, 3, 0, Math.PI * 2); ctx.fill();
      // 焦点标记与焦距标注
      ctx.fillStyle = '#f87171';
      ctx.beginPath(); ctx.arc(focX, axisY, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(148,163,184,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(objX, axisY + 48); ctx.lineTo(focX, axisY + 48); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('f物 = ' + f + ' mm', (objX + focX) / 2 - 26, axisY + 60);
      ctx.fillText('物镜', objX - 12, axisY - 48);
      ctx.fillText('目镜(f目=25mm)', eyeX - 34, axisY - 24);
      ctx.fillText('焦点', focX - 10, axisY + 16);
      ctx.fillText('远方星光（近平行）', 16, 34);
      // 视野：放大后的月亮
      const M = f / 25;
      const mr = Math.min(44, 6 + M * 1.25);
      const mx = 70, my = 196;
      ctx.fillStyle = 'rgba(226,232,240,.92)';
      ctx.beginPath(); ctx.arc(mx, my - 8, mr * 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(100,116,139,.55)';
      ctx.beginPath(); ctx.arc(mx - mr * 0.18, my - 14, mr * 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(mx + mr * 0.12, my - 2, mr * 0.13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('目镜里看到的月亮', 22, 168);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('放大率 M = f物/f目 = ' + f + '/25 ≈ ' + M.toFixed(0) + '×', 170, 196);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('焦距越长，像越大、视场越小', 170, 212);
      cap(ctx, V, 'M = f物/f目：长物镜 + 短目镜（1608 利珀希/1609 伽利略）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 开普勒第二定律：等时扫等面积 */
  AN.keplerSecond = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let th = 0, frameNo = 0, lastE = -1;
    let sector = []; // 正在积累的小扇形
    const sectors = [];
    (function loop() {
      const D = (tp && tp.data) || {};
      const e = Math.max(0, Math.min(0.8, D.e !== undefined ? D.e : 0.5));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = 180, cy = 122, a = 96, b = a * Math.sqrt(1 - e * e);
      const fx = cx - a * e; // 太阳在左焦点，近日点在左顶点
      if (Math.abs(e - lastE) > 1e-9) { sectors.length = 0; sector = []; lastE = e; }
      // 轨道
      ctx.strokeStyle = 'rgba(148,163,184,.55)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(cx, cy, a, b, 0, 0, Math.PI * 2); ctx.stroke();
      // 真近点角 θ 从近日点起算：r = a(1-e²)/(1+e cosθ)，位置 = 焦点 + (-r cosθ, -r sinθ)
      const rad = function (tt) { return a * (1 - e * e) / (1 + e * Math.cos(tt)); };
      const pos = function (tt) { const r0 = rad(tt); return [fx - r0 * Math.cos(tt), cy - r0 * Math.sin(tt)]; };
      // 按"等面积"步进：每帧扫过固定面积
      const Aframe = 30;
      let acc = 0;
      while (acc < Aframe) {
        const dth = 0.006;
        const r0 = rad(th);
        acc += 0.5 * r0 * r0 * dth;
        th += dth;
        sector.push(pos(th));
      }
      frameNo++;
      if (frameNo % 20 === 0 && sector.length > 1) { sectors.push(sector); sector = []; }
      if (th >= Math.PI * 2) { th -= Math.PI * 2; sectors.length = 0; sector = []; }
      // 画扇形（每个扫过的时间相同 → 面积相等）
      const cols = ['rgba(34,197,94,.30)', 'rgba(56,189,248,.30)', 'rgba(251,191,36,.30)'];
      sectors.forEach(function (pts, i) {
        ctx.fillStyle = cols[i % 3];
        ctx.beginPath(); ctx.moveTo(fx, cy);
        pts.forEach(function (p) { ctx.lineTo(p[0], p[1]); });
        ctx.closePath(); ctx.fill();
      });
      // 太阳（焦点）与空焦点
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(fx, cy, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(148,163,184,.6)';
      ctx.beginPath(); ctx.arc(cx + a * e, cy, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('太阳(焦点)', fx - 24, cy + 24);
      ctx.fillText('空焦点', cx + a * e - 16, cy - 16);
      // 行星与速度箭头（v ∝ 1/r，切向 (sinθ, -cosθ)）
      const pp = pos(th);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath(); ctx.arc(pp[0], pp[1], 4.5, 0, Math.PI * 2); ctx.fill();
      const rNow = rad(th);
      const vl = Math.min(34, 6200 / (rNow + 1)); // 速度箭头长度
      const txv = Math.sin(th), tyv = -Math.cos(th); // 切向（近似）
      ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(pp[0], pp[1]); ctx.lineTo(pp[0] + txv * vl, pp[1] + tyv * vl); ctx.stroke();
      ctx.fillStyle = '#22c55e'; ctx.font = '10px sans-serif';
      ctx.fillText('v∝1/r', pp[0] + txv * vl - 12, pp[1] + tyv * vl - 6);
      // 数值
      const vp = Math.sqrt((1 + e) / (1 - e)), va = Math.sqrt((1 - e) / (1 + e));
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('偏心率 e = ' + e.toFixed(2) + '：v近日/v远日 = ' + (vp / va).toFixed(1), 16, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('每个扇形扫过时间相同 → 面积相等', 92, 216);
      cap(ctx, V, 'r·v⊥ 恒定（角动量守恒）：近快远慢');
      window.requestAnimationFrame(loop);
    })();
  };

  /* 卡文迪许扭秤：微小扭转 × 光杠杆放大 → 称出地球 */
  AN.cavendishWeigh = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, th = 0, thv = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const m = Math.max(50, Math.min(350, D.m !== undefined ? D.m : 160));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = 118, cy = 118, L = 42;
      // 平衡扭转角 ∝ 大球质量（引力矩 vs 悬丝恢复矩），阻尼趋近
      const teq = 0.04 + (m - 50) / 300 * 0.16; // 弧度（放大示意）
      thv += (teq - th) * 0.006; thv *= 0.982; th += thv;
      // 悬丝与横杆（俯视）
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, 16); ctx.lineTo(cx, cy); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('悬丝（极细）', cx + 6, 40);
      const ex1 = cx - L * Math.cos(th), ey1 = cy + L * Math.sin(th); // 左端被吸向下
      const ex2 = cx + L * Math.cos(th), ey2 = cy - L * Math.sin(th);
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ex1, ey1); ctx.lineTo(ex2, ey2); ctx.stroke();
      // 小铅球
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath(); ctx.arc(ex1, ey1, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(ex2, ey2, 6, 0, Math.PI * 2); ctx.fill();
      // 大铅球（位置固定，把小球往自己这边拽）
      const b1x = cx - L - 16, b1y = cy + 14, b2x = cx + L + 16, b2y = cy - 14;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(b1x, b1y, 12, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(b2x, b2y, 12, 0, Math.PI * 2); ctx.fill();
      // 引力箭头（∝ m）
      const fl = 10 + m / 350 * 14;
      [[ex1, ey1, b1x, b1y], [ex2, ey2, b2x, b2y]].forEach(function (q) {
        const dx = q[2] - q[0], dy = q[3] - q[1], dd = Math.hypot(dx, dy);
        ctx.strokeStyle = 'rgba(248,113,113,.85)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(q[0], q[1]);
        ctx.lineTo(q[0] + dx / dd * fl, q[1] + dy / dd * fl); ctx.stroke();
      });
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('大球 m', b1x - 16, b1y + 26);
      ctx.fillText('大球 m', b2x - 16, b2y - 18);
      ctx.fillText('小球', ex1 - 24, ey1 + 18);
      ctx.fillText('小球', ex2 + 10, ey2 - 10);
      // 反射镜（水平镜面，随杆转 θ）
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(th);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(-8, -2, 16, 4);
      ctx.restore();
      ctx.fillStyle = '#22d3ee'; ctx.font = '9px sans-serif';
      ctx.fillText('反射镜', cx + 10, cy + 22);
      // 光杠杆：入射光 → 镜面 → 标尺（镜面转 θ，反射光转 2θ，位移放大）
      const inA = Math.atan2(cy - 96, cx - 14); // 从左上射向镜面
      ctx.strokeStyle = 'rgba(253,224,71,.9)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(14, 96); ctx.lineTo(cx, cy); ctx.stroke();
      const outA = -inA + 2 * th;
      const wallX = 322;
      const spotY = cy + Math.tan(outA) * (wallX - cx);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(wallX, spotY); ctx.stroke();
      ctx.fillStyle = '#fde047'; ctx.font = '9px sans-serif';
      ctx.fillText('入射光', 16, 90);
      // 标尺与光斑
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(wallX, 30); ctx.lineTo(wallX, 160); ctx.stroke();
      ctx.lineWidth = 1;
      for (let i = 0; i <= 6; i++) {
        ctx.beginPath(); ctx.moveTo(wallX - 4, 40 + i * 18); ctx.lineTo(wallX + 4, 40 + i * 18); ctx.stroke();
      }
      if (spotY > 20 && spotY < 170) {
        ctx.fillStyle = '#fde047';
        ctx.beginPath(); ctx.arc(wallX, spotY, 4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('光斑标尺', wallX - 20, 176);
      // 读数
      const G = 6.674e-11, Me = 9.8 * Math.pow(6.37e6, 2) / G;
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('大球 ' + m + ' kg → 扭转 θ ≈ ' + (th * 57.3).toFixed(1) + '°（放大示意）', 16, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('G ≈ 6.674×10⁻¹¹ N·m²/kg² → M地球 = gR²/G ≈ ' + (Me / 1e24).toFixed(1) + '×10²⁴ kg', 16, 224);
      cap(ctx, V, '1798 卡文迪许：测出 G，就称出了地球的体重');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 奥伯斯佯谬：壳层叠加 vs 光行视界 */
  AN.olbersNight = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    // 固定随机星点（避免闪烁）
    let seed = 20240829;
    function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
    const shells = [30, 56, 82, 108, 134];
    const stars = [];
    shells.forEach(function (sr, si) {
      const n = 8 + si * 8; // 壳层星数 ∝ 面积
      for (let i = 0; i < n; i++) {
        const a = rnd() * Math.PI * 2;
        stars.push({ x: 108 + sr * Math.cos(a), y: 118 + sr * Math.sin(a) * 0.78, r: sr });
      }
    });
    (function loop() {
      const D = (tp && tp.data) || {};
      const age = Math.max(1, Math.min(100, D.age !== undefined ? D.age : 14));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const horizon = 14 + age * 1.2; // 光行视界（像素）
      // 壳层
      shells.forEach(function (sr) {
        const lit = sr <= horizon;
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = lit ? 'rgba(148,163,184,.4)' : 'rgba(71,85,105,.3)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(108, 118, sr, sr * 0.78, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
      });
      // 恒星：视界内亮，视界外暗（光还没到）
      stars.forEach(function (s) {
        const lit = s.r <= horizon;
        const size = Math.max(0.7, 2.6 * 30 / s.r); // 亮度 ∝ 1/r²（大小示意）
        ctx.fillStyle = lit ? 'rgba(254,240,180,.95)' : 'rgba(120,60,60,.45)';
        ctx.beginPath(); ctx.arc(s.x, s.y, size, 0, Math.PI * 2); ctx.fill();
      });
      // 视界圈
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.ellipse(108, 118, horizon, horizon * 0.78, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#22d3ee'; ctx.font = '10px sans-serif';
      ctx.fillText('光行视界 c·t', 108 + horizon * 0.5, 118 - horizon * 0.62);
      // 观测者
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath(); ctx.arc(108, 118, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('观测者', 116, 122);
      // 右下：夜空窗口，亮度随可见壳层数增加
      const frac = Math.min(1, horizon / 134);
      const bright = Math.round(frac * frac * 70);
      ctx.fillStyle = 'rgb(' + bright + ',' + (bright + 6) + ',' + (bright + 22) + ')';
      ctx.fillRect(238, 128, 106, 66);
      ctx.strokeStyle = '#64748b'; ctx.strokeRect(238, 128, 106, 66);
      stars.forEach(function (s) {
        if (s.r <= horizon) {
          const wx = 244 + ((s.x * 7.3) % 94 + 94) % 94, wy = 134 + ((s.y * 5.1) % 52 + 52) % 52;
          ctx.fillStyle = 'rgba(254,240,180,.9)';
          ctx.beginPath(); ctx.arc(wx, wy, 1.1, 0, Math.PI * 2); ctx.fill();
        }
      });
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('你看到的夜空', 252, 208);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('宇宙年龄 ' + age + ' 亿年 → 视界 ' + age + ' 亿光年', 16, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('每层壳：星数∝r²、单星亮度∝1/r²', 208, 42);
      ctx.fillText('层层叠加，本应亮如白昼', 208, 56);
      ctx.fillText('暗红星 = 光还没到（视界外）', 208, 70);
      cap(ctx, V, '夜是黑的：宇宙年龄有限 + 膨胀红移');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 恒星视差：半年基线上的左右摇摆 */
  AN.stellarParallax = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const bgStars = [];
    let seed = 7;
    function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
    for (let i = 0; i < 26; i++) bgStars.push([12 + rnd() * 336, 16 + rnd() * 22]);
    (function loop() {
      const D = (tp && tp.data) || {};
      const d = Math.max(1, Math.min(100, D.d !== undefined ? D.d : 10));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 背景恒星（远，不动）
      ctx.fillStyle = 'rgba(148,163,184,.8)';
      bgStars.forEach(function (s) {
        ctx.beginPath(); ctx.arc(s[0], s[1], 1, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('遥远背景恒星', 260, 12);
      // 目标星：越近画得越低（离背景越远）
      const starY = 105 - 55 * (1 - 1 / Math.sqrt(d));
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.arc(180, starY, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('目标星', 192, starY + 4);
      // 太阳与地球轨道
      const sunY = 198;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(180, sunY, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(148,163,184,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(180, sunY, 105, 16, 0, 0, Math.PI * 2); ctx.stroke();
      const ea = t * 0.02;
      const ex = 180 + 105 * Math.cos(ea), ey = sunY + 16 * Math.sin(ea);
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath(); ctx.arc(ex, ey, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('太阳', 172, sunY + 24);
      // 两个极端位置的视线（1月/7月）
      const exA = 285, exB = 75;
      function projX(exx) {
        return 180 + (180 - exx) / (starY - sunY) * (40 - starY);
      }
      const xA = projX(exA), xB = projX(exB);
      ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(96,165,250,.6)';
      ctx.beginPath(); ctx.moveTo(exA, sunY); ctx.lineTo(xA, 40); ctx.stroke();
      ctx.strokeStyle = 'rgba(244,114,182,.6)';
      ctx.beginPath(); ctx.moveTo(exB, sunY); ctx.lineTo(xB, 40); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#60a5fa'; ctx.font = '9px sans-serif';
      ctx.fillText('7月', exA - 6, sunY - 24);
      ctx.fillStyle = '#f472b6';
      ctx.fillText('1月', exB - 6, sunY - 24);
      // 背景上的投影点来回摆动
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(xA, 40, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(xB, 40, 3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(xA, 48); ctx.lineTo(xB, 48); ctx.stroke();
      ctx.fillStyle = '#fbbf24'; ctx.font = '9px sans-serif';
      ctx.fillText('星位摆动 2p', 16, 30);
      // 当前视线
      ctx.strokeStyle = 'rgba(226,232,240,.35)';
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(projX(ex), 40); ctx.stroke();
      const p = 1 / d;
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('距离 d = ' + d + ' pc → 视差 p = 1/d = ' + p.toFixed(3) + '″ ≈ ' + (d * 3.26).toFixed(1) + ' 光年', 16, 224);
      cap(ctx, V, '基线 3 亿 km：1838 年贝塞尔首测恒星距离');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 恒星颜色与黑体辐射：维恩位移 */
  AN.starBlackbody = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    function planckRel(lam, T) { // lam in nm
      const x = 1.4388e7 / (lam * T);
      if (x > 60) return 0;
      return 1 / (Math.pow(lam, 5) * (Math.exp(x) - 1));
    }
    function starColor(T) {
      if (T < 3500) return '#ff6a3d';
      if (T < 4700) return '#ffa04d';
      if (T < 5600) return '#ffd27f';
      if (T < 7200) return '#fff4e0';
      if (T < 11000) return '#dfe9ff';
      return '#9db8ff';
    }
    (function loop() {
      const D = (tp && tp.data) || {};
      const temp = Math.max(2500, Math.min(40000, D.t !== undefined ? D.t : 5800));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 恒星圆盘与辉光
      const col = starColor(temp);
      const cx = 66, cy = 84;
      const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 52);
      glow.addColorStop(0, col);
      glow.addColorStop(1, 'rgba(15,23,42,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(cx, cy, 52, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('恒星颜色', 40, 152);
      // 光谱图区
      const gx = 132, gy = 36, gw = 210, gh = 128; // x: 100..2500 nm
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(gx, gy, gw, gh);
      // 可见光带 380-700 nm（彩虹条）
      const lam2x = function (l) { return gx + (l - 100) / 2400 * gw; };
      const rainbow = ['#8b5cf6', '#3b82f6', '#22c55e', '#facc15', '#f97316', '#ef4444'];
      for (let l = 380; l < 700; l += 8) {
        ctx.fillStyle = rainbow[Math.min(5, Math.floor((l - 380) / 53.4))];
        ctx.fillRect(lam2x(l), gy + gh - 8, lam2x(l + 8) - lam2x(l) + 1, 8);
      }
      // 黑体曲线（归一化）
      let bmax = 0;
      for (let l = 100; l <= 2500; l += 20) bmax = Math.max(bmax, planckRel(l, temp));
      if (bmax <= 0) bmax = 1;
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let l = 100; l <= 2500; l += 12) {
        const y = gy + gh - 10 - planckRel(l, temp) / bmax * (gh - 24);
        if (l === 100) ctx.moveTo(lam2x(l), y); else ctx.lineTo(lam2x(l), y);
      }
      ctx.stroke();
      // 维恩峰
      const lmax = 2.9e6 / temp;
      const lx = lam2x(Math.max(100, Math.min(2500, lmax)));
      ctx.setLineDash([3, 3]); ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(lx, gy + 6); ctx.lineTo(lx, gy + gh - 8); ctx.stroke();
      ctx.setLineDash([]);
      // 轴标注
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('波长 λ (nm)', gx + 150, gy + gh + 22);
      ctx.fillText('紫外', gx - 2, gy + gh + 12);
      ctx.fillText('可见光', lam2x(500) - 12, gy + gh + 12);
      ctx.fillText('红外', lam2x(1800), gy + gh + 12);
      ctx.fillText('辐射强度', gx - 4, gy - 6);
      // 参考星
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('参宿四 3500K·红', 16, 178);
      ctx.fillText('太阳 5800K·黄白', 16, 192);
      ctx.fillText('参宿七 12000K·蓝', 16, 206);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      const band = lmax < 380 ? '（峰在紫外→显蓝）' : lmax > 700 ? '（峰在红外→显红）' : '（峰在可见光）';
      ctx.fillText('T = ' + temp + ' K → λmax = 2.9×10⁶/T ≈ ' + Math.round(lmax) + ' nm ' + band, 16, 20);
      cap(ctx, V, '维恩位移定律：颜色 = 温度（1900 普朗克公式）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 赫罗图与恒星演化：质量决定轨迹与结局 */
  AN.hrEvolution = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let prog = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const m = Math.max(0.5, Math.min(25, D.m !== undefined ? D.m : 1));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 图区：x=温度(log 40000→2500，左热右冷)，y=光度(log 1e-4→1e6)
      const gx = 56, gy = 30, gw = 288, gh = 158;
      const xT = function (T) { return gx + (Math.log10(40000) - Math.log10(T)) / (Math.log10(40000) - Math.log10(2500)) * gw; };
      const yL = function (L) { return gy + gh - (Math.log10(L) + 4) / 10 * gh; };
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(gx, gy, gw, gh);
      // 主序带
      ctx.strokeStyle = 'rgba(56,189,248,.5)'; ctx.lineWidth = 6;
      ctx.beginPath();
      for (let M = 0.2; M <= 40; M += 0.5) {
        const T = 5800 * Math.pow(M, 0.54), L = Math.pow(M, 3.5);
        const x = xT(T), y = yL(L);
        if (M === 0.2) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#7dd3fc'; ctx.font = '10px sans-serif';
      ctx.fillText('主序带（氢燃烧）', 64, 152);
      ctx.fillStyle = 'rgba(248,113,113,.75)';
      ctx.fillText('红巨星区', gx + gw - 66, gy + 16);
      ctx.fillStyle = 'rgba(226,232,240,.6)';
      ctx.fillText('白矮星区', gx + 60, gy + gh - 12);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('热 ← 表面温度 → 冷', gx + 92, gy + gh + 14);
      ctx.fillText('光度↑', gx - 8, gy - 6);
      // 太阳的参照点
      ctx.fillStyle = 'rgba(251,191,36,.9)';
      ctx.beginPath(); ctx.arc(xT(5800), yL(1), 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('太阳', xT(5800) + 6, yL(1) + 3);
      // 恒星轨迹：主序 → 红巨星 → 结局
      const T0 = 5800 * Math.pow(m, 0.54), L0 = Math.pow(m, 3.5);
      const msX = xT(T0), msY = yL(L0);
      const giantX = xT(Math.max(2500, T0 * 0.45)), giantY = yL(Math.min(1e6, L0 * 300));
      let endX, endY, endName, endCol;
      if (m < 8) { endX = xT(Math.min(40000, T0 * 3)); endY = yL(0.01); endName = '白矮星'; endCol = '#e2e8f0'; }
      else if (m < 20) { endX = msX; endY = yL(0.001); endName = '中子星'; endCol = '#22d3ee'; }
      else { endX = msX; endY = yL(0.001); endName = '黑洞'; endCol = '#a78bfa'; }
      // 演化进度（质量越大演化越快）
      prog += 0.0016 + 0.0004 * m;
      const p = prog % 1.6;
      let sx, sy, stage;
      if (p < 0.8) { sx = msX; sy = msY; stage = '主序：稳定烧氢'; }
      else if (p < 1.1) {
        const q = (p - 0.8) / 0.3;
        sx = msX + (giantX - msX) * q; sy = msY + (giantY - msY) * q;
        stage = '燃料将尽：膨胀成红巨星';
      } else if (p < 1.2) {
        sx = giantX; sy = giantY; stage = m < 8 ? '抛出行星状星云' : '超新星爆发！';
      } else {
        const q = Math.min(1, (p - 1.2) / 0.25);
        sx = giantX + (endX - giantX) * q; sy = giantY + (endY - giantY) * q;
        stage = '残骸：' + endName;
      }
      // 轨迹虚线
      ctx.setLineDash([2, 3]); ctx.strokeStyle = 'rgba(226,232,240,.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(msX, msY); ctx.lineTo(giantX, giantY); ctx.lineTo(endX, endY); ctx.stroke();
      ctx.setLineDash([]);
      // 爆发闪光
      if (p >= 1.1 && p < 1.2) {
        const fr = 8 + (p - 1.1) * 160;
        ctx.strokeStyle = 'rgba(253,224,71,' + (1.2 - p) * 6 + ')'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(giantX, giantY, fr, 0, Math.PI * 2); ctx.stroke();
      }
      // 恒星点
      ctx.fillStyle = p >= 1.2 ? endCol : '#fbbf24';
      ctx.beginPath(); ctx.arc(sx, sy, p >= 1.2 ? 3.5 : 5, 0, Math.PI * 2); ctx.fill();
      if (p >= 1.2 && endName === '黑洞') {
        ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(sx, sy, 6, 0, Math.PI * 2); ctx.stroke();
      }
      // 信息
      const life = 100 / Math.pow(m, 2.5); // 亿年
      const lifeTxt = life >= 1 ? life.toFixed(life >= 10 ? 0 : 1) + ' 亿年' : Math.round(life * 10000) + ' 万年';
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('M = ' + m.toFixed(1) + ' M☉ → 寿命约 ' + lifeTxt + '（t∝M⁻²·⁵）', 16, 20);
      ctx.fillStyle = '#22d3ee'; ctx.font = '10px sans-serif';
      ctx.fillText(stage, 16, 222);
      cap(ctx, V, '结局：M<8 白矮星 / 8~20 中子星 / >20 黑洞');
      window.requestAnimationFrame(loop);
    })();
  };

  /* 引力透镜：光线偏折与爱因斯坦环 */
  AN.gravLens = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const m = Math.max(0.1, Math.min(10, D.m !== undefined ? D.m : 3));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const obsX = 30, lensX = 180, srcX = 330, axisY = 96;
      const ringR = 6 + 13 * Math.sqrt(m / 3); // 爱因斯坦环半径 ∝ √M
      // 光线路径：源 → 透镜上下 → 观测者（折线表偏折）
      const bend = ringR;
      const paths = [
        [[srcX, axisY], [lensX, axisY - bend], [obsX, axisY]],
        [[srcX, axisY], [lensX, axisY + bend], [obsX, axisY]]
      ];
      paths.forEach(function (p) {
        ctx.strokeStyle = 'rgba(253,224,71,.8)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
        ctx.lineTo(p[1][0], p[1][1]); ctx.lineTo(p[2][0], p[2][1]);
        ctx.stroke();
      });
      // 光脉冲沿线移动
      for (let i = 0; i < 2; i++) {
        const p = paths[i];
        const q = ((t * 0.008 + i * 0.5) % 1);
        let x, y;
        if (q < 0.5) {
          const s = q / 0.5;
          x = p[0][0] + (p[1][0] - p[0][0]) * s; y = p[0][1] + (p[1][1] - p[0][1]) * s;
        } else {
          const s = (q - 0.5) / 0.5;
          x = p[1][0] + (p[2][0] - p[1][0]) * s; y = p[1][1] + (p[2][1] - p[1][1]) * s;
        }
        ctx.fillStyle = '#fef08a';
        ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
      }
      // 未偏折的直线（虚线对比）
      ctx.setLineDash([2, 4]); ctx.strokeStyle = 'rgba(148,163,184,.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(srcX, axisY); ctx.lineTo(obsX, axisY); ctx.stroke();
      ctx.setLineDash([]);
      // 观测者 / 透镜 / 源
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(obsX, axisY, 7, 10, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath(); ctx.arc(obsX - 2, axisY, 2.5, 0, Math.PI * 2); ctx.fill();
      const lg = ctx.createRadialGradient(lensX, axisY, 2, lensX, axisY, 20);
      lg.addColorStop(0, 'rgba(226,232,240,.95)');
      lg.addColorStop(1, 'rgba(148,163,184,.05)');
      ctx.fillStyle = lg;
      ctx.beginPath(); ctx.arc(lensX, axisY, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.arc(srcX, axisY, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('观测者', obsX - 16, axisY + 28);
      ctx.fillText('透镜星系', lensX - 22, axisY + 36);
      ctx.fillText('背景光源', srcX - 20, axisY - 16);
      ctx.fillText('偏折角 α = 4GM/(c²b)', lensX - 40, axisY - bend - 12);
      // 左上：观测者所见（爱因斯坦环）
      const vx = 66, vy = 196, vr = 30;
      ctx.fillStyle = 'rgba(30,41,59,.9)';
      ctx.beginPath(); ctx.arc(vx, vy, vr, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(vx, vy, vr, 0, Math.PI * 2); ctx.stroke();
      const rr = Math.min(vr - 4, ringR * 1.15);
      ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(vx, vy, rr, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(226,232,240,.9)';
      ctx.beginPath(); ctx.arc(vx, vy, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('观测者所见', 34, 166);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('透镜质量 ' + m.toFixed(1) + '×10¹¹ M☉ → 环半径 ∝ √M', 16, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('完美对齐 → 爱因斯坦环；稍偏 → 双像或光弧', 140, 208);
      cap(ctx, V, '1919 年日食：星光掠过太阳偏折 1.7″，证实广义相对论');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 脉冲星：倾斜磁轴的灯塔扫射 */
  AN.pulsarBeacon = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, phi = 0;
    const pulses = [];
    (function loop() {
      const D = (tp && tp.data) || {};
      const p = Math.max(0.1, Math.min(3, D.p !== undefined ? D.p : 1));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cx = 110, cy = 104, R = 24;
      phi += 0.055 / p; // 周期 P 越短转得越快
      // 自转轴（竖直虚线）
      ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(148,163,184,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, 20); ctx.lineTo(cx, 190); ctx.stroke();
      ctx.setLineDash([]);
      // 辐射束（沿磁轴双向，磁轴与自转轴夹角 ~35°）
      let flash = false;
      for (let s = 0; s < 2; s++) {
        const ang = phi + s * Math.PI;
        const bx = Math.sin(ang), by = -Math.cos(ang);
        // 束锥
        ctx.fillStyle = 'rgba(56,189,248,.16)';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + bx * 78 - by * 12, cy + by * 78 + bx * 12);
        ctx.lineTo(cx + bx * 78 + by * 12, cy + by * 78 - bx * 12);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(56,189,248,.5)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + bx * 78, cy + by * 78); ctx.stroke();
        // 束是否正对右侧的地球（方向 0°）
        const rel = Math.atan2(by, bx);
        let dd = Math.abs(rel) % (Math.PI * 2);
        if (dd > Math.PI) dd = Math.PI * 2 - dd;
        if (dd < 0.10) flash = true;
      }
      // 中子星
      const g = ctx.createRadialGradient(cx - 6, cy - 6, 2, cx, cy, R);
      g.addColorStop(0, '#e2e8f0'); g.addColorStop(1, '#475569');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      // 磁轴标记线
      ctx.strokeStyle = 'rgba(167,139,250,.8)'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - Math.sin(phi) * R, cy + Math.cos(phi) * R);
      ctx.lineTo(cx + Math.sin(phi) * R, cy - Math.cos(phi) * R);
      ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('自转轴', cx + 8, 30);
      ctx.fillText('磁轴(倾斜)', cx - 86, 190);
      ctx.fillText('中子星：直径约 20 km，质量 > 太阳', 18, 224);
      // 地球（观测者）
      ctx.fillStyle = flash ? '#4ade80' : '#3b82f6';
      ctx.beginPath(); ctx.arc(300, 104, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('地球', 290, 126);
      if (flash) {
        ctx.fillStyle = '#fef08a'; ctx.font = 'bold 10px sans-serif';
        ctx.fillText('嘀嗒！', 282, 88);
      }
      // 脉冲轮廓纸带
      const sy = 176;
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(210, sy - 26, 136, 40);
      if (flash && (pulses.length === 0 || pulses[pulses.length - 1] < 344 - 6)) pulses.push(344);
      for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i] -= 0.9 / p;
        if (pulses[i] < 212) { pulses.splice(i, 1); continue; }
        ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(pulses[i], sy + 10); ctx.lineTo(pulses[i], sy - 20); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(253,224,71,.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(212, sy + 10); ctx.lineTo(344, sy + 10); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('脉冲轮廓（间距 = 周期 P）', 218, sy + 24);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('自转周期 P = ' + p.toFixed(1) + ' 秒（1967 贝尔发现）', 16, 20);
      cap(ctx, V, '磁轴歪着：转一圈，"灯塔"扫过地球一次');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 径向速度法：恒星被行星拽得摇晃 */
  AN.radialVelocity = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, th = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const m = Math.max(0.3, Math.min(10, D.m !== undefined ? D.m : 1));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      th += 0.03;
      // 共同质心
      const bx = 100, by = 96;
      const rs = 56 * m / (m + 8); // 恒星轨道半径（示意放大）
      const rp = 56 - rs;
      // 轨道
      ctx.setLineDash([2, 3]); ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(251,191,36,.4)';
      ctx.beginPath(); ctx.arc(bx, by, rs, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(148,163,184,.35)';
      ctx.beginPath(); ctx.arc(bx, by, rp, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      const starX = bx + rs * Math.cos(th + Math.PI), starY = by + rs * Math.sin(th + Math.PI);
      const plX = bx + rp * Math.cos(th), plY = by + rp * Math.sin(th);
      // 恒星与行星
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(starX, starY, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath(); ctx.arc(plX, plY, 3.5, 0, Math.PI * 2); ctx.fill();
      // 质心十字
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(bx - 5, by); ctx.lineTo(bx + 5, by); ctx.moveTo(bx, by - 5); ctx.lineTo(bx, by + 5); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('恒星', starX - 10, starY - 14);
      ctx.fillText('行星', plX + 6, plY - 6);
      ctx.fillText('共同质心', bx + 8, by + 4);
      ctx.fillText('（摆动幅度已放大示意）', 30, 152);
      // 右上：恒星光谱线红蓝移
      const spx = 196, spy = 42, spw = 148, sph = 40;
      const grad = ctx.createLinearGradient(spx, 0, spx + spw, 0);
      ['#8b5cf6', '#3b82f6', '#22c55e', '#facc15', '#f97316', '#ef4444'].forEach(function (c, i) {
        grad.addColorStop(i / 5, c);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(spx, spy, spw, sph);
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1;
      ctx.strokeRect(spx, spy, spw, sph);
      const v = Math.cos(th); // 视向速度（朝地球为正）
      const shift = v * Math.min(20, m * 2.6);
      ctx.strokeStyle = 'rgba(15,23,42,.9)'; ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const lx = spx + 22 + i * 26 + shift;
        ctx.beginPath(); ctx.moveTo(lx, spy + 3); ctx.lineTo(lx, spy + sph - 3); ctx.stroke();
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('恒星光谱吸收线', spx + 30, spy - 6);
      ctx.fillStyle = shift > 0.5 ? '#3b82f6' : shift < -0.5 ? '#ef4444' : '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText(shift > 0.5 ? '← 蓝移（恒星靠近）' : shift < -0.5 ? '红移（恒星远离）→' : '过平衡点', spx + 22, spy + sph + 14);
      // 右下：视向速度曲线
      const cvx = 196, cvy = 128, cvw = 148, cvh = 52;
      ctx.strokeStyle = 'rgba(148,163,184,.4)';
      ctx.strokeRect(cvx, cvy, cvw, cvh);
      ctx.beginPath(); ctx.moveTo(cvx, cvy + cvh / 2); ctx.lineTo(cvx + cvw, cvy + cvh / 2); ctx.stroke();
      const K = 28.4 * m;
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= cvw; x++) {
        const y = cvy + cvh / 2 - Math.cos(th - x * 0.05) * Math.min(cvh / 2 - 3, m * 3.2);
        if (x === 0) ctx.moveTo(cvx + x, y); else ctx.lineTo(cvx + x, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('视向速度 v(t)', cvx + 4, cvy + 12);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('行星质量 ' + m.toFixed(1) + ' M_J → 恒星摆动 K ≈ ' + K.toFixed(0) + ' m/s', 16, 20);
      cap(ctx, V, '1995 年飞马座 51b：恒星 4.2 天晃一圈，摆幅约 55 m/s');
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
