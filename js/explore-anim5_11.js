/* explore-anim5_11.js — 第三批动画引擎（地球树 · 批次11，11 个专属原理动画） */
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

  /* 候风地动仪：外壳随地震动，都柱凭惯性不动，相对位移拨动机关 */
  AN.seismoscope = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, uPrev = 0, cool = 0, flash = 0, ball = null;
    const cx = 190, cy = 130, R = 40;
    (function loop() {
      const D = (tp && tp.data) || {};
      const mag = Math.max(4, Math.min(9, D.mag !== undefined ? D.mag : 6.5));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const A = (mag - 3.5) * 5;                       // 地面振幅（px）
      const xf = (t * 2.2) % 540 - 90;                 // 波包中心位置
      const uAt = function (x) {
        const d = (x - xf) / 55;
        return A * Math.sin((x - xf) * 0.13) * Math.exp(-d * d);
      };
      // 震源
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(20, 202, 4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(239,68,68,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(20, 202, 7 + 3 * Math.sin(t * 0.15), 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#fca5a5'; ctx.font = '9px sans-serif';
      ctx.fillText('震源', 9, 218);
      // 起伏的地面
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= 360; x += 4) {
        const y = 202 - uAt(x);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // 仪器倾斜量 = 仪器处地面坡度
      const tilt = (uAt(cx + 10) - uAt(cx - 10)) / 20;
      const uNow = uAt(cx);
      const accel = Math.abs(uNow - uPrev); uPrev = uNow;
      if (cool > 0) cool--;
      if (accel > 1.1 && cool === 0 && !ball && xf > cx - 50 && xf < cx + 60) {
        cool = 260;
        ball = { x: cx - R - 6, y: cy + 6, vx: -0.9, vy: 0 }; // 正对震源一侧的龙吐丸
      }
      // 仪器外壳（随地面倾斜）
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt);
      ctx.fillStyle = '#92400e'; ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(251,191,36,.4)'; ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        ctx.beginPath(); ctx.moveTo(Math.cos(a) * (R - 12), Math.sin(a) * (R - 12));
        ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R); ctx.stroke();
      }
      ctx.restore();
      // 八龙衔丸 + 地面八蟾蜍
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        const dx = cx + Math.cos(a) * (R + 6), dy = cy + Math.sin(a) * (R + 6);
        ctx.fillStyle = '#b45309';
        ctx.beginPath(); ctx.arc(dx, dy, 5, 0, Math.PI * 2); ctx.fill();
        if (!(i === 4 && cool > 0)) {
          ctx.fillStyle = '#fde047';
          ctx.beginPath(); ctx.arc(dx, dy + 7, 2.4, 0, Math.PI * 2); ctx.fill();
        }
        const tx = cx + Math.cos(a) * (R + 34), ty = 196;
        ctx.fillStyle = (i === 4 && cool > 0) ? '#4ade80' : '#166534';
        ctx.beginPath(); ctx.arc(tx, ty, 5, 0, Math.PI * 2); ctx.fill();
      }
      // 都柱（惯性摆）：世界系中保持竖直
      const topX = cx - Math.sin(tilt) * 6, topY = cy - R + 6;
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(topX, topY); ctx.lineTo(topX, topY + 34); ctx.stroke();
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath(); ctx.arc(topX, topY + 36, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('都柱不动', topX + 8, topY + 36);
      // 铜丸坠落入蟾蜍口
      if (ball) {
        ball.vy += 0.25; ball.y += ball.vy; ball.x += ball.vx;
        ctx.fillStyle = '#fde047';
        ctx.beginPath(); ctx.arc(ball.x, ball.y, 3, 0, Math.PI * 2); ctx.fill();
        if (ball.y > 190) { ball = null; flash = 30; }
      }
      if (flash > 0) {
        ctx.strokeStyle = 'rgba(253,224,71,' + flash / 30 + ')'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx - R - 34, 196, 22 - flash * 0.5, 0, Math.PI * 2); ctx.stroke();
        flash--;
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('震级 M' + mag.toFixed(1) + ' → 地面振幅约 ' + A.toFixed(1) + ' px', 16, 20);
      ctx.fillStyle = cool > 0 ? '#4ade80' : '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText(cool > 0 ? '机关触发：正对震源的龙吐丸报警！' : (A > 8 ? '波至：外壳倾斜，都柱仍竖直' : '晃动太弱：机关未到触发阈值'), 16, 36);
      cap(ctx, V, '惯性原理：大地动了，都柱没动——相对位移指出震源方向');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 地磁场：液态外核发电机撑起磁层，挡住太阳风 */
  AN.earthMagnet = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const ps = [], flashes = [];
    for (let i = 0; i < 34; i++) ps.push({ x: Math.random() * 360, y: 15 + Math.random() * 210 });
    const cx = 105, cy = 125, RE = 40, TILT = 11.5 * Math.PI / 180;
    (function loop() {
      const D = (tp && tp.data) || {};
      const b = Math.max(0, Math.min(60, D.b !== undefined ? D.b : 50));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const Rm = 18 + b * 1.6;                          // 磁层顶半径（px）
      // 磁力线（绕倾斜磁轴的嵌套椭圆，密度与强度 ∝ b）
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-TILT);
      const nLines = Math.round(b / 12);
      for (let i = 0; i < nLines; i++) {
        const rr = RE + 14 + i * 15;
        ctx.strokeStyle = 'rgba(96,165,250,' + (0.2 + 0.55 * b / 60) + ')'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(0, 0, rr * 0.62, rr, 0, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(251,191,36,.6)'; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(0, -RE - 32); ctx.lineTo(0, RE + 32); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      // 地球与液态外核（发电机）
      const grd = ctx.createRadialGradient(cx - 10, cy - 10, 6, cx, cy, RE);
      grd.addColorStop(0, '#3b82f6'); grd.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(cx, cy, RE, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(74,222,128,.7)';
      ctx.beginPath(); ctx.arc(cx - 12, cy - 9, 9, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 11, cy + 12, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(249,115,22,.85)';
      ctx.beginPath(); ctx.arc(cx, cy, 13, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fde047'; ctx.lineWidth = 1;
      const sw = t * 0.05;
      ctx.beginPath(); ctx.arc(cx, cy, 8, sw, sw + 3.6); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 8, sw + Math.PI, sw + Math.PI + 3.6); ctx.stroke();
      ctx.fillStyle = '#fdba74'; ctx.font = '8.5px sans-serif';
      ctx.fillText('液态外核', cx - 20, cy + 30);
      // 太阳风粒子：被磁层偏转，或直入大气（极光/大气流失）
      ctx.fillStyle = '#fbbf24'; ctx.font = '10px sans-serif';
      ctx.fillText('太阳风 →', 300, 26);
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        p.x -= 1.7;
        const dx = p.x - cx, dy = p.y - cy;
        const d = Math.hypot(dx, dy);
        if (d < Rm && d > RE + 1 && Math.abs(dy / (d || 1)) < 0.94) {
          // 磁层偏转：沿边界切向绕行，并被微微推出去
          const dir = dy !== 0 ? (dy > 0 ? 1 : -1) : (i % 2 ? 1 : -1);
          const ang = Math.atan2(dy, dx) + dir * 0.055;
          const rr = Math.min(Rm, d + 1.6);
          p.x = cx + Math.cos(ang) * rr; p.y = cy + Math.sin(ang) * rr;
        } else if (d <= RE + 1) {
          flashes.push({ x: p.x, y: p.y, life: 22, polar: Math.abs(dy / (d || 1)) >= 0.94 && b > 0 });
          p.x = 375; p.y = 15 + Math.random() * 210;
        }
        if (p.x < -8) { p.x = 375; p.y = 15 + Math.random() * 210; }
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2); ctx.fill();
      }
      // 极光闪光：有磁场→只在两极；无磁场→全球 + 大气逃逸
      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        ctx.strokeStyle = f.polar ? 'rgba(74,222,128,' + f.life / 22 + ')' : 'rgba(248,113,113,' + f.life / 22 + ')';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(f.x, f.y, 3 + (22 - f.life) * 0.5, 0, Math.PI * 2); ctx.stroke();
        f.life--; if (f.life <= 0) flashes.splice(i, 1);
      }
      if (b < 8) {
        for (let i = 0; i < 6; i++) {
          const wx = cx + Math.cos(i * 1.05 + t * 0.02) * (RE + 10 + (t * 0.3 + i * 9) % 26);
          const wy = cy + Math.sin(i * 1.05 + t * 0.02) * (RE + 10 + (t * 0.3 + i * 9) % 26);
          ctx.fillStyle = 'rgba(147,197,253,.5)';
          ctx.beginPath(); ctx.arc(wx, wy, 1.5, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('地表磁场 B ≈ ' + b + ' μT → 磁层顶约 ' + (Rm / RE).toFixed(1) + ' 个地球半径（示意）', 14, 20);
      ctx.fillStyle = b < 8 ? '#f87171' : '#4ade80'; ctx.font = '10px sans-serif';
      ctx.fillText(b < 8 ? '磁场消失：太阳风直轰大气（火星的命运）' : '太阳风被磁层挡开，只从两极漏入成极光', 14, 38);
      cap(ctx, V, '液态铁核的自激发电机撑起磁层，替生命挡住太阳风');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 季风：海陆比热差异驱动的季节反转环流 */
  AN.monsoon = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const drops = [];
    const PA = [70, 138], PB = [305, 138], PC = [305, 58], PD = [70, 58];
    function posOnCell(s) {
      let d = ((s % 1) + 1) % 1 * 630;
      if (d < 235) return [PA[0] + d, PA[1], 0];
      d -= 235;
      if (d < 80) return [PB[0], PB[1] - d, 1];
      d -= 80;
      if (d < 235) return [PC[0] - d, PC[1], 2];
      d -= 235;
      return [PD[0], PD[1] + d, 3];
    }
    (function loop() {
      const D = (tp && tp.data) || {};
      const dt = Math.max(-15, Math.min(15, D.dt !== undefined ? D.dt : 8));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 海洋与陆地（按温差染色：红暖蓝冷）
      ctx.fillStyle = '#1d4ed8'; ctx.fillRect(0, 150, 165, 75);
      ctx.fillStyle = '#78350f'; ctx.fillRect(195, 150, 165, 75);
      ctx.fillStyle = 'rgba(239,68,68,' + Math.max(0, dt) / 15 * 0.35 + ')'; ctx.fillRect(195, 150, 165, 75);
      ctx.fillStyle = 'rgba(59,130,246,' + Math.max(0, -dt) / 15 * 0.35 + ')'; ctx.fillRect(195, 150, 165, 75);
      ctx.fillStyle = 'rgba(239,68,68,' + Math.max(0, -dt) / 15 * 0.22 + ')'; ctx.fillRect(0, 150, 165, 75);
      ctx.fillStyle = 'rgba(59,130,246,' + Math.max(0, dt) / 15 * 0.22 + ')'; ctx.fillRect(0, 150, 165, 75);
      // 山脉（抬升致雨）
      ctx.fillStyle = '#57534e';
      ctx.beginPath(); ctx.moveTo(228, 150); ctx.lineTo(268, 82); ctx.lineTo(308, 150); ctx.closePath(); ctx.fill();
      // 海面波纹
      ctx.strokeStyle = 'rgba(147,197,253,.55)'; ctx.lineWidth = 1.5;
      for (let wr = 0; wr < 3; wr++) {
        ctx.beginPath();
        for (let x = 0; x <= 165; x += 6) {
          const y = 162 + wr * 18 + Math.sin(x * 0.12 + t * 0.06 + wr * 2) * 2;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // 环流粒子（方向由温差符号决定）
      const dir = dt >= 0 ? 1 : -1;
      const spd = 0.0006 + Math.abs(dt) / 15 * 0.0022;
      for (let i = 0; i < 14; i++) {
        const s = i / 14 + t * spd * dir;
        const pp = posOnCell(s);
        const overSea = pp[0] < 180;
        ctx.fillStyle = pp[2] === 0 && overSea ? '#7dd3fc' : pp[2] === 1 ? '#fef3c7' : pp[2] === 2 ? '#e2e8f0' : '#93c5fd';
        ctx.beginPath(); ctx.arc(pp[0], pp[1], 2.4, 0, Math.PI * 2); ctx.fill();
      }
      // 环流箭头（低空段）
      ctx.strokeStyle = 'rgba(226,232,240,.8)'; ctx.lineWidth = 1.5;
      const ax = dt >= 0 ? 190 : 150;
      ctx.beginPath(); ctx.moveTo(ax, 138); ctx.lineTo(ax + dir * 26, 138); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ax + dir * 26, 138); ctx.lineTo(ax + dir * 20, 134); ctx.moveTo(ax + dir * 26, 138); ctx.lineTo(ax + dir * 20, 142); ctx.stroke();
      // 云与雨：暖低压上升处成云致雨
      if (Math.abs(dt) > 2) {
        const clx = dt > 0 ? 268 : 92;
        ctx.fillStyle = 'rgba(226,232,240,.9)';
        ctx.beginPath(); ctx.arc(clx - 14, 64, 10, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(clx, 58, 13, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(clx + 15, 64, 10, 0, Math.PI * 2); ctx.fill();
        if (t % 4 === 0 && drops.length < 40) drops.push({ x: clx - 16 + Math.random() * 32, y: 74 });
      }
      for (let i = drops.length - 1; i >= 0; i--) {
        const dr = drops[i];
        dr.y += 2.4;
        ctx.strokeStyle = 'rgba(125,211,252,.8)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(dr.x, dr.y); ctx.lineTo(dr.x, dr.y + 5); ctx.stroke();
        if (dr.y > 146) drops.splice(i, 1);
      }
      const landT = 25 + dt, seaT = 25 - dt * 0.25;
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('陆地 ≈ ' + landT.toFixed(0) + '°C　海洋 ≈ ' + seaT.toFixed(0) + '°C（海洋变得慢）', 14, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText(dt > 1 ? '夏季风：海洋 → 陆地，陆上升雨' : dt < -1 ? '冬季风：陆地 → 海洋，干冷少雨' : '过渡季：环流微弱', 14, 38);
      ctx.fillText('海', 76, 216); ctx.fillText('陆', 268, 216);
      cap(ctx, V, '水的比热容 ≈ 砂石的 4 倍：陆地热得快、冷得也快，风向一年一反转');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 洋流传送带：温度+盐度→密度，驱动全球温盐环流 */
  AN.oceanConveyor = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const parts = [];
    for (let i = 0; i < 26; i++) parts.push({ seg: i % 4, p: (i * 0.17) % 1, dir: 1 });
    (function loop() {
      const D = (tp && tp.data) || {};
      const sal = Math.max(30, Math.min(36, D.sal !== undefined ? D.sal : 35));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const s = Math.max(0, Math.min(1, (sal - 31) / 4)); // 下沉强度
      // 海盆
      ctx.fillStyle = '#0c2d4d'; ctx.fillRect(30, 60, 300, 130);
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.strokeRect(30, 60, 300, 130);
      // 赤道太阳与极地浮冰
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.arc(44, 30, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('赤道·加热', 30, 52);
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(290, 56, 26, 5); ctx.fillRect(308, 62, 18, 4);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('极地·冷却', 286, 52);
      // 深层回流通道（透明度 ∝ 下沉强度）
      ctx.strokeStyle = 'rgba(59,130,246,' + (0.15 + s * 0.5) + ')'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(318, 168); ctx.lineTo(44, 168); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(44, 168); ctx.lineTo(52, 164); ctx.moveTo(44, 168); ctx.lineTo(52, 172); ctx.stroke();
      ctx.fillStyle = 'rgba(147,197,253,' + (0.3 + s * 0.7) + ')'; ctx.font = '9px sans-serif';
      ctx.fillText('深层冷水回流', 140, 181);
      // 粒子：表层（红→蓝失热）→ 下沉 → 深流 → 上升
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (p.seg === 0) {
          p.p += (0.003 + s * 0.006) * p.dir;
          if (p.p >= 1) {
            if (s > 0.12) { p.seg = 1; p.p = 0; }
            else { p.p = 1; p.dir = -1; }      // 表层变淡：下沉失败，掉头回流
          }
          if (p.p <= 0) { p.p = 0; p.dir = 1; }
        } else if (p.seg === 1) {
          p.p += 0.004 + s * 0.012;
          if (p.p >= 1) { p.seg = 2; p.p = 0; }
        } else if (p.seg === 2) {
          p.p += 0.001 + s * 0.007;
          if (p.p >= 1) { p.seg = 3; p.p = 0; }
        } else {
          p.p += 0.006 + s * 0.006;
          if (p.p >= 1) { p.seg = 0; p.p = 0; p.dir = 1; }
        }
        let x, y, temp;
        if (p.seg === 0) { x = 44 + p.p * 274; y = 76; temp = 1 - p.p * 0.8; }
        else if (p.seg === 1) { x = 318; y = 76 + p.p * 92; temp = 0.2 - p.p * 0.15; }
        else if (p.seg === 2) { x = 318 - p.p * 274; y = 168; temp = 0.05; }
        else { x = 44; y = 168 - p.p * 92; temp = 0.05 + p.p * 0.95; }
        const rC = Math.round(255 * Math.max(0, temp)), bC = Math.round(255 * (1 - Math.max(0, temp)));
        ctx.fillStyle = 'rgb(' + rC + ',' + 100 + ',' + bC + ')';
        ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill();
      }
      // 下沉流箭头
      if (s > 0.12) {
        ctx.strokeStyle = 'rgba(96,165,250,' + (0.3 + s * 0.7) + ')'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(318, 84); ctx.lineTo(318, 84 + 70 * s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(318, 84 + 70 * s); ctx.lineTo(314, 78 + 70 * s); ctx.moveTo(318, 84 + 70 * s); ctx.lineTo(322, 78 + 70 * s); ctx.stroke();
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('盐度 ' + sal.toFixed(1) + '‰ → 表层密度约 ' + (1020 + (sal - 30) * 1.2).toFixed(0) + ' kg/m³（示意）', 14, 20);
      ctx.fillStyle = s > 0.5 ? '#4ade80' : s > 0.12 ? '#fbbf24' : '#f87171'; ctx.font = '10px sans-serif';
      ctx.fillText(s > 0.5 ? '又冷又咸：下沉强劲，传送带全速运转' : s > 0.12 ? '盐度下降：下沉减弱，传送带减速' : '表层被融水冲淡：下沉停止，传送带停滞！', 14, 38);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('红→蓝：表层流一路失热', 130, 68);
      cap(ctx, V, '温度 + 盐度决定密度：又冷又咸的水才会沉入深海，驱动千年环流');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 岩石循环：岩浆→岩浆岩→沉积岩→变质岩→熔融，俯冲速率定节奏 */
  AN.rockCycle = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, wpi = 0, hx = 60, hy = 85;
    const trail = [], lavas = [];
    const W = [[60, 85], [95, 118], [170, 148], [246, 152], [252, 188], [302, 208], [238, 224], [108, 224], [66, 140]];
    const NAMES = ['冷却凝固 · 岩浆岩', '风化剥蚀', '河流搬运', '沉积压实 · 沉积岩', '深埋变质 · 变质岩', '俯冲下插', '熔融再生', '岩浆汇聚', '上升喷发'];
    for (let i = 0; i < 24; i++) trail.push([hx, hy]);
    (function loop() {
      const D = (tp && tp.data) || {};
      const sub = Math.max(0, Math.min(10, D.sub !== undefined ? D.sub : 5));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const deep = 0.3 + sub / 10 * 1.6; // 深部过程速率因子
      // 岩浆房（底部辉光 + 闪烁）
      const fl = 0.75 + 0.25 * Math.sin(t * 0.2);
      const grd = ctx.createLinearGradient(0, 208, 0, 240);
      grd.addColorStop(0, 'rgba(249,115,22,' + 0.35 * fl + ')');
      grd.addColorStop(1, 'rgba(220,38,38,' + 0.8 * fl + ')');
      ctx.fillStyle = grd; ctx.fillRect(0, 208, 360, 32);
      ctx.fillStyle = '#fdba74'; ctx.font = '9px sans-serif';
      ctx.fillText('岩浆房', 160, 236);
      // 地层线
      ctx.strokeStyle = 'rgba(148,163,184,.35)'; ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(100, 165 + i * 14); ctx.lineTo(300, 170 + i * 13); ctx.stroke();
      }
      // 火山
      ctx.fillStyle = '#44403c';
      ctx.beginPath(); ctx.moveTo(28, 150); ctx.lineTo(60, 84); ctx.lineTo(92, 150); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.moveTo(55, 92); ctx.lineTo(60, 84); ctx.lineTo(65, 92); ctx.closePath(); ctx.fill();
      // 喷发熔岩（强度 ∝ 俯冲速率）
      if (sub > 0 && t % Math.max(4, Math.round(26 - sub * 2.2)) === 0) {
        lavas.push({ x: 60, y: 86, vx: (Math.random() - 0.5) * 2.4, vy: -(1 + Math.random() * (1 + sub * 0.3)), life: 40 });
      }
      for (let i = lavas.length - 1; i >= 0; i--) {
        const lv = lavas[i];
        lv.x += lv.vx; lv.y += lv.vy; lv.vy += 0.06; lv.life--;
        ctx.fillStyle = 'rgba(249,115,22,' + Math.min(1, lv.life / 20) + ')';
        ctx.beginPath(); ctx.arc(lv.x, lv.y, 2.2, 0, Math.PI * 2); ctx.fill();
        if (lv.life <= 0 || lv.y > 152) lavas.splice(i, 1);
      }
      // 雨与河流（风化搬运）
      ctx.strokeStyle = 'rgba(125,211,252,.6)'; ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const rx = 105 + i * 18, ry = 96 + (t * 1.5 + i * 13) % 22;
        ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 2, ry + 5); ctx.stroke();
      }
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 96; x <= 246; x += 6) {
        const y = 146 + Math.sin(x * 0.1 + t * 0.08) * 2.5;
        if (x === 96) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // 海与沉积层
      ctx.fillStyle = 'rgba(29,78,216,.5)'; ctx.fillRect(246, 150, 90, 16);
      ctx.fillStyle = 'rgba(202,138,4,.5)'; ctx.fillRect(250, 168, 82, 5);
      ctx.fillRect(252, 176, 78, 5);
      // 俯冲带（箭头粗细 ∝ 速率）
      if (sub > 0) {
        ctx.strokeStyle = 'rgba(248,113,113,.85)'; ctx.lineWidth = 1 + sub * 0.5;
        ctx.beginPath(); ctx.moveTo(310, 158); ctx.lineTo(326, 204); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(326, 204); ctx.lineTo(318, 198); ctx.moveTo(326, 204); ctx.lineTo(320, 208); ctx.stroke();
      }
      // 主角岩石颗粒（发光 + 拖尾）沿循环路径旅行
      const spd = [1.2, 0.9, 1.0, 0.55, 0.5 * deep, 0.5 * deep, 0.7 * deep, 0.9, 1.0];
      const tgt = W[(wpi + 1) % W.length];
      const dx = tgt[0] - hx, dy = tgt[1] - hy;
      const dd = Math.hypot(dx, dy);
      const v = spd[wpi % spd.length];
      if (dd < v + 0.5) { wpi = (wpi + 1) % W.length; }
      else { hx += dx / dd * v; hy += dy / dd * v; }
      trail.push([hx, hy]); if (trail.length > 26) trail.shift();
      for (let i = 1; i < trail.length; i++) {
        ctx.strokeStyle = 'rgba(253,224,71,' + (i / trail.length) * 0.5 + ')'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(trail[i - 1][0], trail[i - 1][1]); ctx.lineTo(trail[i][0], trail[i][1]); ctx.stroke();
      }
      ctx.shadowColor = '#fde047'; ctx.shadowBlur = 10;
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.arc(hx, hy, 4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // 标注
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('俯冲速率 ' + sub + ' cm/yr：' + (sub === 0 ? '俯冲停摆，循环在表层徘徊' : sub <= 4 ? '缓慢俯冲，循环悠哉进行' : '快速俯冲，火山猛烈、循环加速'), 14, 20);
      ctx.fillStyle = '#fbbf24'; ctx.font = '10px sans-serif';
      ctx.fillText('当前过程：' + NAMES[wpi % NAMES.length], 14, 38);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('岩浆岩', 36, 70); ctx.fillText('沉积岩', 258, 190); ctx.fillText('俯冲带', 322, 158);
      cap(ctx, V, '赫顿 1788：岩石圈是座循环炉，一块石头的一生以百万年计');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 冰川：重力驱动的粘性流，收支平衡决定进退 */
  AN.glacierFlow = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, xf = 230;
    const flow = [];
    for (let i = 0; i < 30; i++) flow.push({ x: 15 + Math.random() * 150, f: Math.random() });
    const crev = [128, 143, 160, 176];
    const bed = function (x) { return 100 + x * 0.32; };
    const surf = function (x) { return 60 + x * 0.32; };
    (function loop() {
      const D = (tp && tp.data) || {};
      const snow = Math.max(0, Math.min(100, D.snow !== undefined ? D.snow : 50));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 物质平衡 → 冰舌位置
      xf = Math.max(95, Math.min(335, xf + (snow - 50) * 0.0022));
      // 基岩
      ctx.fillStyle = '#292524';
      ctx.beginPath(); ctx.moveTo(0, 240); ctx.lineTo(0, bed(0));
      for (let x = 0; x <= 360; x += 10) ctx.lineTo(x, bed(x));
      ctx.lineTo(360, 240); ctx.closePath(); ctx.fill();
      // 冰体
      const grd = ctx.createLinearGradient(0, 60, 0, 200);
      grd.addColorStop(0, '#e0f2fe'); grd.addColorStop(1, '#7dd3fc');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.moveTo(15, surf(15));
      for (let x = 15; x <= xf; x += 8) ctx.lineTo(x, surf(x));
      ctx.lineTo(xf, bed(xf) - 4);
      for (let x = xf; x >= 15; x -= 8) ctx.lineTo(x, bed(x) - 2);
      ctx.closePath(); ctx.fill();
      // 冰裂隙（表层脆性）
      ctx.strokeStyle = 'rgba(12,74,110,.7)'; ctx.lineWidth = 1.5;
      crev.forEach(function (cx0, i) {
        if (cx0 < xf - 12) {
          ctx.beginPath(); ctx.moveTo(cx0 + Math.sin(i * 3) * 3, surf(cx0));
          ctx.lineTo(cx0 + 2 + Math.sin(i * 3) * 3, surf(cx0) + 13); ctx.stroke();
        }
      });
      // 标志柱：随深度剪切成剖面（顶快底慢）
      ctx.strokeStyle = 'rgba(190,24,24,.8)'; ctx.lineWidth = 1.5;
      [50, 90, 130, 170].forEach(function (mx) {
        if (mx < xf - 10) {
          ctx.beginPath();
          for (let f = 0; f <= 1.001; f += 0.2) {
            const off = (mx - 15) * 0.4 * (1 - f * 0.72);
            const y = surf(mx) + f * (bed(mx) - surf(mx));
            if (f === 0) ctx.moveTo(mx + off, y); else ctx.lineTo(mx + off, y);
          }
          ctx.stroke();
        }
      });
      // 冰内颗粒流动
      for (let i = 0; i < flow.length; i++) {
        const p = flow[i];
        p.x += (0.2 + snow / 100 * 0.6) * (1 - p.f * 0.7);
        if (p.x > xf - 8) { p.x = 16; p.f = Math.random(); }
        const y = surf(p.x) + p.f * (bed(p.x) - 2 - surf(p.x));
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        ctx.beginPath(); ctx.arc(p.x, y, 1.6, 0, Math.PI * 2); ctx.fill();
      }
      // 降雪与消融
      for (let i = 0; i < Math.round(snow / 18); i++) {
        const sx = 15 + ((t * 0.7 + i * 53) % Math.max(20, xf * 0.5 - 15));
        const sy = 20 + ((t * 1.3 + i * 37) % Math.max(10, surf(sx) - 24));
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI * 2); ctx.fill();
      }
      for (let i = 0; i < 4; i++) {
        const mx2 = xf * 0.6 + ((t * 0.9 + i * 31) % Math.max(10, xf * 0.35));
        const my = surf(mx2) + 2 + ((t * 1.1 + i * 17) % 12);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath(); ctx.arc(mx2, my, 1.4, 0, Math.PI * 2); ctx.fill();
      }
      // 雪线
      const ela = 15 + (xf - 15) * 0.55;
      ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(251,191,36,.7)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(ela, surf(ela) - 24); ctx.lineTo(ela, bed(ela)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#fbbf24'; ctx.font = '9px sans-serif';
      ctx.fillText('雪线', ela - 10, surf(ela) - 28);
      // 标注与状态
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('标志柱倾斜 = 剪切剖面：表面快、底部慢', 100, 224);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('降雪补给 ' + snow + '%（消融基准 50%）', 14, 20);
      ctx.fillStyle = snow > 52 ? '#4ade80' : snow < 48 ? '#f87171' : '#fbbf24'; ctx.font = '10px sans-serif';
      ctx.fillText(snow > 52 ? '补给 > 消融：冰舌前进 →' : snow < 48 ? '消融 > 补给：冰舌退缩 ←' : '收支平衡：冰舌稳定', 14, 38);
      cap(ctx, V, '固体冰在重力下粘性流动；雪线两侧的收支决定冰舌进退');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 地下水与达西定律：Q = K·A·Δh/L */
  AN.darcyFlow = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const grains = [], parts = [];
    for (let i = 0; i < 80; i++) grains.push({ x: 40 + Math.random() * 290, y: 116 + Math.random() * 74 });
    for (let i = 0; i < 36; i++) parts.push({ x: 58 + Math.random() * 24, y: 118 + Math.random() * 70, ph: Math.random() * 6.28 });
    (function loop() {
      const D = (tp && tp.data) || {};
      const k = Math.max(1, Math.min(100, D.k !== undefined ? D.k : 50));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 隔水层（上下黏土）
      ctx.fillStyle = '#3f3f46'; ctx.fillRect(20, 96, 320, 16); ctx.fillRect(20, 194, 320, 16);
      ctx.fillStyle = '#a1a1aa'; ctx.font = '9px sans-serif';
      ctx.fillText('黏土隔水层', 250, 107); ctx.fillText('黏土隔水层', 250, 205);
      // 含水层与砂粒
      ctx.fillStyle = '#29241f'; ctx.fillRect(20, 112, 320, 82);
      ctx.fillStyle = 'rgba(202,138,4,.5)';
      grains.forEach(function (g) { ctx.fillRect(g.x, g.y, 2, 2); });
      // 地下水位线（左侧补给高、右侧抽水井降深）
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(24, 76); ctx.lineTo(150, 88); ctx.lineTo(268, 96); ctx.lineTo(296, 128); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#7dd3fc'; ctx.font = '9px sans-serif';
      ctx.fillText('地下水位 Δh', 110, 80);
      // 两口井
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(52, 60); ctx.lineTo(52, 192); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(300, 44); ctx.lineTo(300, 192); ctx.stroke();
      ctx.fillStyle = 'rgba(56,189,248,.7)';
      ctx.fillRect(49, 78, 6, 112);
      ctx.fillRect(297, 128, 6, 62);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('观测井', 30, 56); ctx.fillText('抽水井', 282, 40);
      // 示踪粒子：速度 ∝ K
      const v = 0.03 + k * 0.004;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.x += v;
        p.y += Math.sin(t * 0.05 + p.ph) * 0.25;
        if (p.y < 117) p.y = 117; if (p.y > 189) p.y = 189;
        if (p.x > 294) { p.x = 58; p.y = 118 + Math.random() * 70; }
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
      }
      // 抽水井涌水（高度 ∝ 流量）
      const fh = k * 0.32;
      for (let i = 0; i < 5; i++) {
        const q = ((t * 0.03 + i * 0.2) % 1);
        const fx = 300 + (i - 2) * q * 9;
        const fy = 44 - q * fh + q * q * 26;
        ctx.fillStyle = 'rgba(125,211,252,' + (1 - q * 0.7) + ')';
        ctx.beginPath(); ctx.arc(fx, fy, 1.8, 0, Math.PI * 2); ctx.fill();
      }
      const rock = k < 10 ? '黏土（几乎隔水！）' : k < 35 ? '粉砂' : k < 65 ? '砂层（良好含水层）' : '砾石层（畅流）';
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('地层：' + rock, 14, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('Q = K·A·Δh/L → 相对流量 ≈ ' + (k * 0.3).toFixed(0), 14, 38);
      cap(ctx, V, '砾石与黏土的 K 相差上亿倍：含水层与隔水层之别');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 火山喷发：SiO₂ 含量定粘度，气泡逃得出则溢流、逃不出则爆炸 */
  AN.volcanoPlume = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, P = 0.4;
    const bubbles = [], ashes = [];
    (function loop() {
      const D = (tp && tp.data) || {};
      const si = Math.max(48, Math.min(72, D.si !== undefined ? D.si : 52));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const inten = (si - 48) / 24;                       // 0=玄武岩 1=流纹岩
      // 火山锥与岩浆房
      ctx.fillStyle = '#44403c';
      ctx.beginPath(); ctx.moveTo(100, 214); ctx.lineTo(180, 112); ctx.lineTo(260, 214); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#292524'; ctx.fillRect(0, 214, 360, 26);
      const fl = 0.7 + 0.3 * Math.sin(t * 0.25);
      ctx.fillStyle = 'rgba(249,115,22,' + 0.8 * fl + ')';
      ctx.beginPath(); ctx.ellipse(180, 222, 46, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1c1917'; ctx.fillRect(174, 118, 12, 100);
      // 气泡上升（粘度越大越慢、越逃不掉）
      if (t % 5 === 0) bubbles.push({ x: 177 + Math.random() * 6, y: 218 });
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const bb = bubbles[i];
        bb.y -= 2.1 - inten * 1.7;
        ctx.strokeStyle = 'rgba(253,224,71,.8)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(bb.x, bb.y, 2, 0, Math.PI * 2); ctx.stroke();
        if (bb.y < 126) {
          bubbles.splice(i, 1);
          if (si < 58) { // 低粘：气泡自由逸出，顺带熔岩喷泉
            for (let q = 0; q < 3; q++) ashes.push({ x: 180, y: 116, vx: (Math.random() - 0.5) * 1.6, vy: -(1.2 + Math.random() * 1.6), g: 0.055, life: 60, col: '#f97316', r: 2.2 });
          } else { P += 0.05; } // 高粘：气泡被困，压力积聚
        }
      }
      // 低粘：熔岩顺坡流淌（虚线流动）
      if (si < 63) {
        ctx.strokeStyle = 'rgba(249,115,22,.9)'; ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]); ctx.lineDashOffset = -t * 1.5;
        ctx.beginPath(); ctx.moveTo(180, 116); ctx.lineTo(146, 168); ctx.lineTo(116, 214); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(180, 116); ctx.lineTo(214, 168); ctx.lineTo(244, 214); ctx.stroke();
        ctx.setLineDash([]);
      }
      // 高压爆炸：普林尼式喷发柱
      if (P >= 1) {
        P = 0;
        const n = 16 + Math.round(inten * 40);
        for (let q = 0; q < n; q++) {
          ashes.push({ x: 180, y: 112, vx: (Math.random() - 0.5) * (1.5 + inten * 5), vy: -(2 + Math.random() * 2.5 + inten * 3.5), g: 0.02, life: 110, col: '#a8a29e', r: 2.5 });
        }
        if (inten > 0.7) { // 火山碎屑流顺坡下扫
          for (let q = 0; q < 12; q++) ashes.push({ x: 180, y: 118, vx: (q < 6 ? -1 : 1) * (0.8 + Math.random()), vy: 0.5, g: 0, life: 46, col: '#78716c', r: 3, pyro: true });
        }
      }
      for (let i = ashes.length - 1; i >= 0; i--) {
        const a = ashes[i];
        if (a.pyro) { // 贴坡加速下滑
          const dirS = a.vx > 0 ? 1 : -1;
          a.x += a.vx * 1.6; a.y += 1.55;
          a.vx += dirS * 0.03;
          if (a.y > 214) a.life = 0;
        } else {
          if (a.y < 44) { a.vx *= 1.04; a.vy *= 0.94; } // 柱顶蘑菇云摊开
          a.vy += a.g; a.x += a.vx; a.y += a.vy;
        }
        a.life--;
        ctx.fillStyle = a.col;
        ctx.globalAlpha = Math.max(0, Math.min(1, a.life / 40));
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        if (a.life <= 0 || a.y > 236) ashes.splice(i, 1);
      }
      // 气体压力表
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5; ctx.strokeRect(320, 120, 16, 90);
      ctx.fillStyle = P > 0.7 ? '#ef4444' : '#fbbf24';
      ctx.fillRect(322, 208 - P * 84, 12, P * 84);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('气体', 318, 118); ctx.fillText('压力', 318, 222);
      const mode = si < 58 ? '溢流式（夏威夷型）：熔岩静静流淌' : si < 64 ? '斯特隆博利型：断续喷溅' : '普林尼式：喷发柱冲天而起';
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('SiO₂ ' + si + '% → 粘度' + (si < 58 ? '低' : si < 64 ? '中' : '高'), 14, 20);
      ctx.fillStyle = si < 58 ? '#4ade80' : '#f87171'; ctx.font = '10px sans-serif';
      ctx.fillText(mode, 14, 38);
      cap(ctx, V, '硅越多越粘稠：气泡逃得出是喷泉，逃不出是炸弹');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 地震波：P 穿液核、S 止步，阴影区量出地核大小 */
  AN.seismicWaves = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const cx = 112, cy = 130, R = 92;
    const stations = [];
    for (let i = 0; i < 12; i++) stations.push(15 + i * 14.5);
    (function loop() {
      const D = (tp && tp.data) || {};
      const core = Math.max(0.3, Math.min(0.7, D.core !== undefined ? D.core : 0.55));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const rCore = core * R, rInner = 0.19 * R;
      const srcX = cx, srcY = cy - R;
      // 圈层
      ctx.fillStyle = '#92400e';
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      // S 波阵面（先画，随后被液态外核覆盖 → 直观"消失"）
      const rP = (t * 1.35) % (R * 2.6);
      const rS = rP * 0.55;
      ctx.strokeStyle = 'rgba(59,130,246,.85)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(srcX, srcY, rS, 0, Math.PI * 2); ctx.stroke();
      // 液态外核与内核（覆盖 S 波）
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(cx, cy, rCore, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(cx, cy, rInner, 0, Math.PI * 2); ctx.fill();
      // P 波阵面（穿透一切）
      ctx.strokeStyle = 'rgba(249,115,22,.9)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(srcX, srcY, rP, 0, Math.PI * 2); ctx.stroke();
      // 震源
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(srcX, srcY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '9px sans-serif';
      ctx.fillText('震源', srcX + 7, srcY + 3);
      // 阴影区（地表弧带）
      const dC = 2 * Math.acos(core) * 180 / Math.PI;
      ctx.strokeStyle = 'rgba(239,68,68,.55)'; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.arc(cx, cy, R - 2, (-90 + dC) * Math.PI / 180, (-90 + Math.min(180, dC + 40)) * Math.PI / 180); ctx.stroke();
      // 台站：P/S 到达点亮，阴影区保持沉默
      let nP = 0, nS = 0;
      for (let i = 0; i < stations.length; i++) {
        const dl = stations[i];
        const a = (-90 + dl) * Math.PI / 180;
        const sx = cx + R * Math.cos(a), sy = cy + R * Math.sin(a);
        const chord = 2 * R * Math.sin(dl * Math.PI / 360);
        const pOk = rP >= chord * 0.85 && !(dl >= dC && dl <= dC + 40);
        const sOk = rS >= chord * 0.85 && dl < dC;
        if (pOk) nP++; if (sOk) nS++;
        ctx.fillStyle = pOk ? '#fb923c' : dl >= dC && dl <= dC + 40 ? '#7f1d1d' : '#64748b';
        ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI * 2); ctx.fill();
        if (sOk) {
          ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(sx, sy, 6.5, 0, Math.PI * 2); ctx.stroke();
        }
      }
      // 右侧图例
      ctx.fillStyle = '#92400e'; ctx.fillRect(228, 60, 12, 10);
      ctx.fillStyle = '#dc2626'; ctx.fillRect(228, 78, 12, 10);
      ctx.fillStyle = '#fbbf24'; ctx.fillRect(228, 96, 12, 10);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
      ctx.fillText('地幔（固体）', 246, 69);
      ctx.fillText('液态外核', 246, 87);
      ctx.fillText('固态内核', 246, 105);
      ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(228, 126); ctx.lineTo(240, 126); ctx.stroke();
      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath(); ctx.moveTo(228, 140); ctx.lineTo(240, 140); ctx.stroke();
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('P 波：固液皆通', 246, 129);
      ctx.fillText('S 波：遇液即止', 246, 143);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('红色地表 = 阴影区', 228, 164);
      ctx.fillText('台站收到 P:' + nP + ' S:' + nS, 228, 180);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('外核半径占比 ' + core.toFixed(2) + ' → 阴影区从 Δ=' + dC.toFixed(0) + '° 开始', 14, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('1906 奥尔德姆：S 消失 + P 阴影 → 液态外核现形', 14, 38);
      cap(ctx, V, '阴影区的宽窄直接量出地核半径：地震波是给地球做 CT 的探针');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 板块构造：海岭扩张，洋壳把地磁极性录成对称条带 */
  AN.plateTectonics = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, km = 0, curW = 0, curPol = true, flipIdx = 0;
    const stripes = [];               // 从新到老
    const FLIPS = [130, 90, 170, 110, 150, 80, 140, 100];
    (function loop() {
      const D = (tp && tp.data) || {};
      const sp = Math.max(0, Math.min(10, D.sp !== undefined ? D.sp : 3));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 预跑：首帧即有完整条带
      if (t === 0) {
        for (let i = 0; i < 6; i++) { stripes.push({ w: 14 + (i * 37 % 22), pol: i % 2 === 0 }); }
        curPol = stripes.length % 2 === 0; curW = 8;
      }
      // 扩张生长
      const dw = sp * 0.05;
      curW += dw; km += dw * 2;
      if (t % FLIPS[flipIdx % FLIPS.length] === 0 && t > 0) {
        stripes.unshift({ w: Math.max(2, curW), pol: curPol });
        curPol = !curPol; curW = 0; flipIdx++;
      }
      let total = curW;
      for (let i = 0; i < stripes.length; i++) total += stripes[i].w;
      while (total > 172 && stripes.length) { total -= stripes[stripes.length - 1].w; stripes.pop(); }
      // 画条带：海岭两侧镜像对称
      const all = [{ w: curW, pol: curPol }].concat(stripes);
      let xl = 180, xr = 180;
      for (let i = 0; i < all.length; i++) {
        const s2 = all[i];
        xl -= s2.w;
        ctx.fillStyle = s2.pol ? '#f59e0b' : '#1d4ed8';
        ctx.fillRect(xl, 62, s2.w, 116);
        ctx.fillRect(xr, 62, s2.w, 116);
        xr += s2.w;
        if (xl < 6) break;
      }
      // 海岭轴
      ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 8;
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3;
      ctx.beginPath();
      for (let y = 62; y <= 178; y += 8) {
        const x = 180 + Math.sin(y * 0.3 + t * 0.1) * 2;
        if (y === 62) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#fca5a5'; ctx.font = '9px sans-serif';
      ctx.fillText('大洋中脊', 158, 56);
      // 两端大陆被驮走
      ctx.fillStyle = '#166534';
      ctx.fillRect(0, 62, 26, 116); ctx.fillRect(334, 62, 26, 116);
      ctx.fillStyle = '#bbf7d0'; ctx.font = '9px sans-serif';
      ctx.fillText('大陆', 3, 122); ctx.fillText('大陆', 337, 122);
      // 年代标注
      ctx.fillStyle = '#e2e8f0'; ctx.font = '9px sans-serif';
      ctx.fillText('新', 176, 192); ctx.fillText('← 老', 20, 192); ctx.fillText('老 →', 322, 192);
      // 图例
      ctx.fillStyle = '#f59e0b'; ctx.fillRect(70, 204, 10, 8);
      ctx.fillStyle = '#1d4ed8'; ctx.fillRect(170, 204, 10, 8);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('正极性（如今）', 84, 212); ctx.fillText('反极性', 184, 212);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('扩张速率 ' + sp + ' cm/yr → 累计新生洋壳约 ' + km.toFixed(0) + ' km（示意）', 14, 20);
      ctx.fillStyle = sp === 0 ? '#f87171' : '#4ade80'; ctx.font = '10px sans-serif';
      ctx.fillText(sp === 0 ? '扩张停止：磁带停录，没有新洋壳' : '条带镜像对称生长：地磁倒转被逐一记录', 14, 38);
      cap(ctx, V, '海底是盘边长边录的磁带：两侧条带对称，就是大陆漂移的铁证');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 海啸预警：v=√(gh)，深海快而低、浅海慢而高，浮标抢出逃命时间 */
  AN.tsunamiWarning = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, xw = 70, warned = false, ping = 0, flood = 0;
    const bedY = function (x) {
      if (x < 245) return 206;
      if (x < 335) return 206 - (x - 245) * 0.85;
      return 130;
    };
    (function loop() {
      const D = (tp && tp.data) || {};
      const u = Math.max(0, Math.min(10, D.u !== undefined ? D.u : 5));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const tc = t % 800;
      if (tc === 0) { xw = 70; warned = false; ping = 0; flood = 0; }
      // 海床与海岸
      ctx.fillStyle = '#3f3f46';
      ctx.beginPath(); ctx.moveTo(0, 240); ctx.lineTo(0, 206);
      for (let x = 0; x <= 360; x += 6) ctx.lineTo(x, bedY(x));
      ctx.lineTo(360, 240); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#a16207';
      ctx.beginPath(); ctx.moveTo(320, 240); ctx.lineTo(335, 130); ctx.lineTo(360, 130); ctx.lineTo(360, 240); ctx.closePath(); ctx.fill();
      // 断层错动（震后 20 帧内抬升）
      const lift = u * 1.1 * Math.min(1, tc / 20);
      ctx.fillStyle = '#57534e';
      ctx.fillRect(30, 206 - lift, 34, 34);
      ctx.fillStyle = '#44403c';
      ctx.fillRect(66, 206, 34, 34);
      if (u > 0 && tc < 60) {
        ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(47, 200 - lift - 6); ctx.lineTo(47, 186 - lift - 6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(47, 186 - lift - 6); ctx.lineTo(43, 192 - lift - 6); ctx.moveTo(47, 186 - lift - 6); ctx.lineTo(51, 192 - lift - 6); ctx.stroke();
      }
      ctx.fillStyle = '#fca5a5'; ctx.font = '9px sans-serif';
      ctx.fillText('海底断层', 28, 226);
      // 波传播：v ∝ √h，A ∝ h^(-1/4)
      let A = 0, spd = 0;
      if (u > 0 && tc > 10 && xw < 352) {
        const dep = Math.max(22, bedY(xw) - 84);
        spd = 0.55 + 1.9 * Math.sqrt(dep / 122);
        A = u * 0.55 * Math.pow(122 / dep, 0.25);
        xw += spd;
      }
      // 水面
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= 360; x += 3) {
        let y = 84 + Math.sin(x * 0.2 + t * 0.08) * 0.7;
        if (A > 0) {
          const g1 = Math.exp(-Math.pow((x - xw) / 20, 2));
          const g2 = 0.4 * Math.exp(-Math.pow((x - xw + 34) / 14, 2));
          y -= A * g1 - A * 0.35 * g2;
        }
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // DART 浮标
      const bx = 238, byy = 84 - (A > 0 ? A * Math.exp(-Math.pow((bx - xw) / 20, 2)) : 0);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.moveTo(bx - 6, byy); ctx.lineTo(bx + 6, byy); ctx.lineTo(bx, byy - 9); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(bx - 4, bedY(bx) - 6, 8, 6);
      ctx.setLineDash([2, 3]); ctx.strokeStyle = 'rgba(148,163,184,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(bx, byy); ctx.lineTo(bx, bedY(bx) - 6); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#fbbf24'; ctx.font = '9px sans-serif';
      ctx.fillText('DART 浮标', bx - 22, byy - 14);
      // 触发预警
      if (!warned && u > 0.5 && Math.abs(xw - bx) < 12) { warned = true; ping = 46; }
      if (ping > 0) {
        ctx.strokeStyle = 'rgba(253,224,71,' + ping / 46 + ')'; ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(bx, byy - 10); ctx.lineTo(bx, 22); ctx.stroke();
        ctx.setLineDash([]);
        ping--;
      }
      // 卫星与预警文字
      ctx.fillStyle = warned ? '#4ade80' : '#64748b';
      ctx.fillRect(bx - 8, 12, 16, 8);
      ctx.fillRect(bx - 14, 14, 5, 4); ctx.fillRect(bx + 9, 14, 5, 4);
      if (warned) {
        ctx.fillStyle = t % 30 < 15 ? '#ef4444' : '#fca5a5'; ctx.font = 'bold 11px sans-serif';
        const eta = Math.max(1, Math.round((335 - xw) / Math.max(0.3, spd) / 60));
        ctx.fillText('⚠ 海啸预警！约 ' + eta + ' 分钟后抵达海岸（示意）', 110, 34);
      }
      // 沿岸城市
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(340, 108, 8, 22); ctx.fillRect(350, 116, 7, 14);
      // 越岸淹没
      if (xw >= 330 && A > 0) flood = Math.min(1, flood + 0.02);
      if (flood > 0) {
        ctx.fillStyle = 'rgba(56,189,248,' + 0.45 * flood + ')';
        ctx.fillRect(322, 130 - flood * Math.min(50, u * 6), 38, 110);
      }
      // 水深标尺
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('深海 4000 m', 120, 200);
      ctx.fillText('浅海', 268, 170);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('断层垂直抬升 ' + u + ' m', 14, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText(u === 0 ? '无垂直位移（走滑型）：不激发海啸' : '深海波高不足 1 m、近岸骤增为 ' + A.toFixed(1) + ' 倍（格林定律）', 14, 38);
      cap(ctx, V, 'v = √(gh)：深海快而低、浅海慢而高——预警抢的就是这段时差');
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
