/* explore-anim5_13.js — 第三批动画引擎（感知与错觉树 · 批次13，11 个专属原理动画） */
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

  /* 色觉与视锥细胞：S/M/L 三条敏感曲线加权求和 */
  AN.trichromacy = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    function cone(lam, peak, sig) { return Math.exp(-(lam - peak) * (lam - peak) / (2 * sig * sig)); }
    function wave2rgb(l) { // 近似波长→RGB
      let r = 0, g = 0, b = 0;
      if (l < 440) { r = (440 - l) / 60; b = 1; }
      else if (l < 490) { g = (l - 440) / 50; b = 1; }
      else if (l < 510) { g = 1; b = (510 - l) / 20; }
      else if (l < 580) { r = (l - 510) / 70; g = 1; }
      else if (l < 645) { r = 1; g = (645 - l) / 65; }
      else { r = 1; }
      const f = l < 420 ? 0.3 + 0.7 * (l - 380) / 40 : l > 660 ? 0.3 + 0.7 * (700 - l) / 40 : 1;
      return [Math.round(r * f * 255), Math.round(g * f * 255), Math.round(b * f * 255)];
    }
    const xOf = function (l) { return 30 + (l - 380) / 320 * 240; };
    (function loop() {
      const D = (tp && tp.data) || {};
      const lam = Math.max(380, Math.min(700, D.lam !== undefined ? D.lam : 580));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 坐标框
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(30, 185); ctx.lineTo(270, 185); ctx.stroke();
      ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
      ctx.fillText('400', 34, 195); ctx.fillText('550', 124, 195); ctx.fillText('700 nm', 238, 195);
      // 三条视锥曲线
      const cones = [
        { name: 'S（蓝）', peak: 445, sig: 28, col: '#60a5fa' },
        { name: 'M（绿）', peak: 535, sig: 38, col: '#4ade80' },
        { name: 'L（红）', peak: 570, sig: 50, col: '#f87171' }
      ];
      cones.forEach(function (cn) {
        ctx.strokeStyle = cn.col; ctx.lineWidth = 2;
        ctx.shadowColor = cn.col; ctx.shadowBlur = 6;
        ctx.beginPath();
        for (let l = 380; l <= 700; l += 4) {
          const y = 185 - cone(l, cn.peak, cn.sig) * 130;
          if (l === 380) ctx.moveTo(xOf(l), y); else ctx.lineTo(xOf(l), y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
      // 当前波长标线
      const x = xOf(lam);
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(x, 40); ctx.lineTo(x, 185); ctx.stroke();
      ctx.setLineDash([]);
      // 各锥兴奋度
      const es = cone(lam, 445, 28), em = cone(lam, 535, 38), el = cone(lam, 570, 50);
      const vals = [es, em, el];
      cones.forEach(function (cn, i) {
        const y = 185 - vals[i] * 130;
        ctx.fillStyle = cn.col;
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillText(cn.name + ' ' + Math.round(vals[i] * 100) + '%', 282, 60 + i * 16);
        ctx.fillRect(272, 66 + i * 16 - 10, Math.max(2, vals[i] * 70), 5);
      });
      // 感知的颜色
      const rgb = wave2rgb(lam);
      ctx.fillStyle = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(310, 170, 22, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('大脑读到的颜色', 272, 204);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('λ = ' + lam + ' nm → 三锥兴奋 (' + Math.round(es * 100) + ', ' + Math.round(em * 100) + ', ' + Math.round(el * 100) + ')%', 16, 20);
      cap(ctx, V, '杨-亥姆霍兹三色说：万色 = 三条曲线的加权求和（1802/1850s）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 前庭平衡：半规管淋巴液惯性 → 转停后的反转错觉 */
  AN.vestibularSpin = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, theta = 0, phi = 0, prevW = 0;
    const histW = [], histT = [];
    (function loop() {
      const D = (tp && tp.data) || {};
      const hold = Math.max(0, Math.min(30, D.hold !== undefined ? D.hold : 12));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 相位机：加速 40f → 匀速 20+hold*10f → 减速 40f → 停 160f
      const upF = 40, holdF = 20 + hold * 10, downF = 40, restF = 160;
      const total = upF + holdF + downF + restF;
      const ph = t % total;
      let w = 0, phase;
      if (ph < upF) { w = ph / upF; phase = '加速'; }
      else if (ph < upF + holdF) { w = 1; phase = 'hold'; }
      else if (ph < upF + holdF + downF) { w = 1 - (ph - upF - holdF) / downF; phase = '减速'; }
      else { w = 0; phase = 'rest'; }
      const accel = w - prevW; prevW = w;
      theta += accel * 0.9 - theta / 55; // 壶腹嵴：响应加速度，慢回弹（适应）
      phi += w * 0.12;
      // 头部俯视
      const hx = 92, hy = 118;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath(); ctx.arc(hx, hy, 48, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2; ctx.stroke();
      // 鼻（随真实转动）
      ctx.fillStyle = '#94a3b8';
      const na = -Math.PI / 2 + phi;
      ctx.beginPath();
      ctx.moveTo(hx + 52 * Math.cos(na), hy + 52 * Math.sin(na));
      ctx.lineTo(hx + 40 * Math.cos(na + 0.25), hy + 40 * Math.sin(na + 0.25));
      ctx.lineTo(hx + 40 * Math.cos(na - 0.25), hy + 40 * Math.sin(na - 0.25));
      ctx.fill();
      // 半规管环 + 淋巴液滴（液体因惯性滞后）
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(hx, hy, 30, 0, Math.PI * 2); ctx.stroke();
      const fluidA = phi - theta * 3;
      for (let i = 0; i < 8; i++) {
        const a = fluidA + i * Math.PI / 4;
        ctx.fillStyle = 'rgba(56,189,248,.8)';
        ctx.beginPath(); ctx.arc(hx + 30 * Math.cos(a), hy + 30 * Math.sin(a), 2, 0, Math.PI * 2); ctx.fill();
      }
      // 壶腹嵴顶（纤毛瓣，偏转角 theta）
      const ca = -Math.PI / 2 + phi;
      const bx = hx + 30 * Math.cos(ca), by = hy + 30 * Math.sin(ca);
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3;
      ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.moveTo(bx, by);
      ctx.lineTo(bx + 16 * Math.cos(ca - Math.PI / 2 + theta * 1.2), by + 16 * Math.sin(ca - Math.PI / 2 + theta * 1.2));
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('壶腹嵴顶', hx + 34, hy - 34);
      ctx.fillText('淋巴液', hx - 52, hy + 48);
      // 真实转向箭头
      if (w > 0.05) {
        ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(hx, hy, 58, -0.4 + phi % 6.28, 0.5 + phi % 6.28); ctx.stroke();
      }
      // 停转后反转错觉提示
      if (phase === 'rest' && theta < -0.08) {
        ctx.strokeStyle = '#fbbf24'; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.arc(hx, hy, 64, 2.2, 3.4); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 11px sans-serif';
        ctx.fillText('错觉：感觉在反转！', 30, 30);
      }
      // 右侧曲线：真实转速 vs 嵴顶偏转（主观感觉）
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(190, 42, 155, 120);
      histW.push(w); histT.push(theta);
      if (histW.length > 150) { histW.shift(); histT.shift(); }
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
      ctx.beginPath();
      histW.forEach(function (v, i) {
        const x = 192 + i, y = 100 - v * 45;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.strokeStyle = '#fbbf24';
      ctx.beginPath();
      histT.forEach(function (v, i) {
        const x = 192 + i, y = 100 - v * 60;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.fillStyle = '#22d3ee'; ctx.font = '9px sans-serif';
      ctx.fillText('— 真实转速', 196, 54);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('— 嵴顶偏转=你的感觉', 252, 54);
      // 状态文字
      let status;
      if (phase === 'rest' && theta < -0.08) status = '已停下，但液体还在转 → 感觉反转';
      else if (phase === 'hold' && Math.abs(theta) < 0.08) status = '匀速中：液体跟上，感觉消失（适应）';
      else if (phase === 'hold') status = '匀速中：嵴顶正在回弹…';
      else if (phase === 'rest') status = '错觉消退，感觉恢复正常';
      else status = '变速中：嵴顶被顶弯，感觉到旋转';
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText(status, 16, 208);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('持续旋转 ' + hold + ' s：转得越久适应越彻底，停下后反转感越强', 16, 224);
      cap(ctx, V, '半规管只报"加速度"：匀速与静止都会回零（1824 弗卢朗）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 视觉暂留与频闪：采样帧率决定风扇正转/停住/倒转 */
  AN.phiMotion = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, realA = 0, sampA = 0, clock = 0, flash = 0;
    const OMEGA = 0.35; // 真实角速度 rad/帧（叶片过频约 10 Hz）
    function fan(ctx, cx, cy, ang, blur) {
      if (blur) {
        for (let g = 3; g >= 1; g--) {
          ctx.strokeStyle = 'rgba(148,163,184,.15)'; ctx.lineWidth = 5;
          for (let b = 0; b < 3; b++) {
            const a = ang - g * 0.18 + b * Math.PI * 2 / 3;
            ctx.beginPath(); ctx.moveTo(cx, cy);
            ctx.lineTo(cx + 38 * Math.cos(a), cy + 38 * Math.sin(a)); ctx.stroke();
          }
        }
      }
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 5;
      for (let b = 0; b < 3; b++) {
        const a = ang + b * Math.PI * 2 / 3;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + 38 * Math.cos(a), cy + 38 * Math.sin(a)); ctx.stroke();
      }
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
    }
    (function loop() {
      const D = (tp && tp.data) || {};
      const fps = Math.max(2, Math.min(60, D.fps !== undefined ? D.fps : 24));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      realA += OMEGA;
      clock += 1;
      const period = 60 / fps; // 每隔多少帧拍一帧
      if (clock >= period) { clock -= period; sampA = realA; flash = 6; }
      // 上：真实风扇（连续转动，带残影）
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('现实：风扇连续转（叶片过频 10 Hz）', 20, 24);
      fan(ctx, 80, 75, realA, true);
      // 下：银幕（采样帧）
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('银幕：每秒拍 ' + fps + ' 帧', 20, 130);
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
      ctx.strokeRect(30, 140, 100, 88);
      fan(ctx, 80, 184, sampA, false);
      if (flash > 0) { // 快门闪光
        ctx.fillStyle = 'rgba(253,224,71,' + flash / 6 * 0.25 + ')';
        ctx.fillRect(30, 140, 100, 88);
        flash--;
      }
      // 表观运动分析：相邻采样帧的叶片角差（按 3 叶对称取模）
      const jump = OMEGA * period;
      const P = Math.PI * 2 / 3;
      let wdir = ((jump % P) + P) % P;
      if (wdir > P / 2) wdir -= P;
      let verdict, vcol;
      if (Math.abs(wdir) < 0.08 * P) { verdict = '几乎停住（采样与叶片同步）'; vcol = '#fbbf24'; }
      else if (Math.abs(P / 2 - Math.abs(wdir)) < 0.15) { verdict = '忽前忽后地抖动'; vcol = '#fbbf24'; }
      else if (wdir < 0) { verdict = '倒转！采样跟不上真实转动'; vcol = '#ef4444'; }
      else { verdict = '正转：与真实一致'; vcol = '#4ade80'; }
      ctx.fillStyle = vcol; ctx.font = 'bold 12px sans-serif';
      ctx.fillText('表观运动：' + verdict, 155, 170);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText(fps >= 12 ? '帧率够高：视觉暂留把静帧缝成连续运动' : '帧率太低：暂留缝不上，一格一格跳', 155, 192);
      // 帧时刻标尺：1 秒内的帧
      ctx.fillStyle = '#334155'; ctx.fillRect(155, 204, 190, 6);
      const marks = Math.max(2, Math.round(fps / 2));
      for (let i = 0; i <= marks; i++) {
        ctx.fillStyle = '#fde047';
        ctx.fillRect(155 + i * (190 / marks), 204, 2, 6);
      }
      ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
      ctx.fillText('1 秒内的帧', 155, 222);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('帧率 ' + fps + ' fps：24 流畅，≈10 停住，12~20 倒转', 16, 20);
      cap(ctx, V, '视觉暂留（约 1/16 s）+ 快速静帧 = 运动；1832 费纳奇镜');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 触觉两点阈：同一间距，指尖分辨两点、后背合并成一点 */
  AN.twoPointThreshold = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const gap = Math.max(0, Math.min(60, D.gap !== undefined ? D.gap : 12));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const SCALE = 2.2; // px/mm
      const cx = 135, gpx = gap * SCALE;
      const bob = Math.sin(t * 0.08) * 2;
      // 两行皮肤：指尖（密）与后背（疏）
      const rows = [
        { name: '指尖（阈值≈2 mm）', y: 70, thr: 2, spacing: 7, fr: 4 },
        { name: '后背（阈值≈40 mm）', y: 150, thr: 40, spacing: 46, fr: 22 }
      ];
      rows.forEach(function (row) {
        // 皮肤
        ctx.fillStyle = 'rgba(51,65,85,.8)';
        ctx.fillRect(30, row.y, 210, 26);
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1;
        ctx.strokeRect(30, row.y, 210, 26);
        ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
        ctx.fillText(row.name, 30, row.y - 22);
        // 感受器与其感受野
        for (let x = 34; x <= 238; x += row.spacing) {
          ctx.strokeStyle = 'rgba(148,163,184,.35)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(x, row.y + 13, row.fr, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = '#64748b';
          ctx.beginPath(); ctx.arc(x, row.y + 13, 1.6, 0, Math.PI * 2); ctx.fill();
        }
        // 圆规两脚
        const x1 = cx - gpx / 2, x2 = cx + gpx / 2;
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x1, row.y - 16 + bob); ctx.lineTo(x1, row.y + 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x2, row.y - 16 + bob); ctx.lineTo(x2, row.y + 2); ctx.stroke();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(x1, row.y + 2, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x2, row.y + 2, 2.5, 0, Math.PI * 2); ctx.fill();
        // 落在同一感受野 → 合并
        const merged = gap < row.thr;
        ctx.strokeStyle = merged ? 'rgba(148,163,184,.5)' : '#22c55e';
        ctx.setLineDash(merged ? [3, 3] : []);
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, row.y + 13, Math.max(8, gpx / 2 + 4), 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
      });
      // 右侧：大脑读数
      ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
      ctx.fillText('大脑读数', 268, 46);
      const brain = [
        { name: '指尖脑区', y: 60, two: gap >= 2 },
        { name: '后背脑区', y: 140, two: gap >= 40 }
      ];
      brain.forEach(function (b) {
        ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5;
        ctx.strokeRect(258, b.y, 90, 44);
        ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
        ctx.fillText(b.name, 264, b.y + 12);
        if (b.two) {
          ctx.fillStyle = '#4ade80'; ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.arc(288, b.y + 27, 5, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(318, b.y + 27, 5, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#4ade80'; ctx.font = 'bold 11px sans-serif';
          ctx.fillText('2 点！', 276, b.y + 41);
        } else {
          ctx.fillStyle = '#64748b';
          ctx.beginPath(); ctx.arc(303, b.y + 27, 5, 0, Math.PI * 2); ctx.fill();
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText('1 点…', 278, b.y + 41);
        }
      });
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('两点间距 ' + gap + ' mm', 16, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('阈值：舌尖≈1　指尖≈2　掌心≈10　后背≈40 mm', 16, 212);
      cap(ctx, V, '1834 韦伯：感受野密度决定触觉"分辨率"');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 立体视觉：双眼视差 → 大脑三角测量出深度 */
  AN.stereopsis = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const dots = [];
    for (let i = 0; i < 26; i++) dots.push({ x: Math.random(), y: Math.random() });
    (function loop() {
      const D = (tp && tp.data) || {};
      const disp = Math.max(-30, Math.min(30, D.disp !== undefined ? D.disp : 14));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 上：左右眼各自看到的图（随机点 + 方块）
      const panels = [{ x: 25, lbl: '左眼看到', off: -disp / 2 }, { x: 205, lbl: '右眼看到', off: disp / 2 }];
      panels.forEach(function (p) {
        ctx.fillStyle = '#16213b'; ctx.fillRect(p.x, 32, 130, 72);
        ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5;
        ctx.strokeRect(p.x, 32, 130, 72);
        dots.forEach(function (d) {
          ctx.fillStyle = 'rgba(148,163,184,.5)';
          ctx.fillRect(p.x + 6 + d.x * 118, 38 + d.y * 60, 1.6, 1.6);
        });
        // 方块：两眼图中位置错开 disp
        ctx.fillStyle = '#f87171';
        ctx.shadowColor = '#f87171'; ctx.shadowBlur = 6;
        ctx.fillRect(p.x + 65 - 8 + p.off, 60, 16, 16);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
        ctx.fillText(p.lbl, p.x + 34, 24);
      });
      // 下：俯视几何——双眼视线穿过各自图像，交点即感知深度
      const eyeL = { x: 110, y: 222 }, eyeR = { x: 250, y: 222 }, scrY = 150;
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(40, scrY); ctx.lineTo(320, scrY); ctx.stroke();
      ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
      ctx.fillText('屏幕', 324, scrY + 4);
      const xL = 180 - disp / 2, xR = 180 + disp / 2;
      const u = 140 / (140 - disp); // 交点参数：u=1 在屏上，>1 屏后，<1 屏前
      const ipx = 110 + u * (xL - 110), ipy = 222 + u * (scrY - 222);
      const cy = Math.max(20, ipy);
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = 'rgba(96,165,250,.8)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(eyeL.x, eyeL.y); ctx.lineTo(ipx, cy); ctx.stroke();
      ctx.strokeStyle = 'rgba(74,222,128,.8)';
      ctx.beginPath(); ctx.moveTo(eyeR.x, eyeR.y); ctx.lineTo(ipx, cy); ctx.stroke();
      ctx.setLineDash([]);
      // 双眼
      [[eyeL, '左'], [eyeR, '右']].forEach(function (e) {
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath(); ctx.arc(e[0].x, e[0].y, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath(); ctx.arc(e[0].x, e[0].y - 2, 2.5, 0, Math.PI * 2); ctx.fill();
      });
      // 感知到的方块（近大远小）
      const sz = Math.max(8, 16 / u);
      ctx.fillStyle = 'rgba(248,113,113,.85)';
      ctx.shadowColor = '#f87171'; ctx.shadowBlur = 10;
      ctx.fillRect(ipx - sz / 2, cy - sz / 2, sz, sz);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#f87171'; ctx.font = '9px sans-serif';
      ctx.fillText('感知位置', ipx + 12, cy);
      let where, wcol;
      if (u > 1.03) { where = '屏后（更远）'; wcol = '#60a5fa'; }
      else if (u < 0.97) { where = '浮出屏前！'; wcol = '#fbbf24'; }
      else { where = '就在屏上'; wcol = '#94a3b8'; }
      ctx.fillStyle = wcol; ctx.font = 'bold 12px sans-serif';
      ctx.fillText('视差 ' + disp + ' px → ' + where, 120, 126);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('两张平面图的错位，被大脑"三角测量"成深度', 16, 20);
      cap(ctx, V, '1838 惠斯通立体镜；1960 朱勒兹：纯随机点+视差也能浮出形状');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 马赫带：侧抑制 = 对画面做二阶差分，边缘被"描边" */
  AN.machBands = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const NB = 6, phys = [];
    for (let i = 0; i < NB; i++) phys.push(60 + i * 30); // 物理亮度阶梯
    (function loop() {
      const D = (tp && tp.data) || {};
      const k = Math.max(0, Math.min(1, D.k !== undefined ? D.k : 0.6));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 感知亮度：p' = p + k·(2p − 左邻 − 右邻)/2（边缘过冲）
      const perc = phys.map(function (p, i) {
        const l = i > 0 ? phys[i - 1] : p, r = i < NB - 1 ? phys[i + 1] : p;
        return Math.max(0, Math.min(255, p + k * 0.5 * (2 * p - l - r)));
      });
      // 两条色带：物理 vs 感知
      const panels = [{ x: 20, lbl: '物理亮度（仪器量的）', val: phys }, { x: 190, lbl: '大脑感知（侧抑制后）', val: perc }];
      panels.forEach(function (pn) {
        for (let i = 0; i < NB; i++) {
          const v = Math.round(pn.val[i]);
          ctx.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')';
          ctx.fillRect(pn.x + i * 25, 44, 25, 90);
        }
        ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
        ctx.strokeRect(pn.x, 44, NB * 25, 90);
        ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
        ctx.fillText(pn.lbl, pn.x, 36);
      });
      // 下方亮度剖面曲线：物理（虚线灰）vs 感知（实线青，边缘过冲）
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(20, 150, 320, 60);
      ctx.setLineDash([4, 3]); ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < NB; i++) {
        const x1 = 20 + i * (320 / NB), y = 205 - phys[i] / 255 * 50;
        if (i === 0) ctx.moveTo(x1, y); else { ctx.lineTo(x1, y); }
        ctx.lineTo(x1 + 320 / NB, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
      ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 5;
      ctx.beginPath();
      for (let i = 0; i < NB; i++) {
        const x1 = 20 + i * (320 / NB), y = 205 - perc[i] / 255 * 50;
        if (i === 0) ctx.moveTo(x1, y); else { ctx.lineTo(x1, y); }
        ctx.lineTo(x1 + 320 / NB, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('灰虚线=物理', 226, 160);
      ctx.fillStyle = '#22d3ee';
      ctx.fillText('青实线=感知', 286, 160);
      // 中心-周围感受野小图标
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.06);
      ctx.fillStyle = 'rgba(74,222,128,' + (0.15 + k * 0.4) + ')';
      ctx.beginPath(); ctx.arc(352, 30, 8 + k * 3 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4ade80'; ctx.font = 'bold 9px sans-serif';
      ctx.fillText('+', 349, 33);
      ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(352, 30, 14, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#f87171';
      ctx.fillText('−', 352, 18);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('侧抑制强度 k = ' + k.toFixed(2) + (k > 0.05 ? '：每个边缘被"描边"，条带左亮右暗' : '：感知=物理，无描边'), 16, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('感受野：中心兴奋(+) 周围抑制(−)', 180, 232 - 14);
      cap(ctx, V, '1865 马赫；1950s 哈特林在鲎眼实测到抑制网络（1967 诺奖）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 缪勒-莱尔错觉：箭尾方向改变感知长度 */
  AN.mullerLyer = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const L = 160; // 两根线段的物理长度（相等）
    function lineWithFins(ctx, y, angDeg, outward, col) {
      const rad = angDeg * Math.PI / 180, fl = 22;
      const x1 = 100, x2 = 100 + L;
      ctx.strokeStyle = col; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
      // 箭尾：outward 时朝外张，inward 时朝内收
      const dirs = outward ? [Math.PI - rad, Math.PI + rad] : [-rad, rad]; // 左端
      const dirs2 = outward ? [-rad, rad] : [Math.PI - rad, Math.PI + rad]; // 右端
      ctx.lineWidth = 2.5;
      dirs.forEach(function (a) {
        ctx.beginPath(); ctx.moveTo(x1, y);
        ctx.lineTo(x1 + fl * Math.cos(a), y + fl * Math.sin(a)); ctx.stroke();
      });
      dirs2.forEach(function (a) {
        ctx.beginPath(); ctx.moveTo(x2, y);
        ctx.lineTo(x2 + fl * Math.cos(a), y + fl * Math.sin(a)); ctx.stroke();
      });
    }
    (function loop() {
      const D = (tp && tp.data) || {};
      const ang = Math.max(15, Math.min(165, D.ang !== undefined ? D.ang : 60));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const m = Math.sin(ang * Math.PI / 180); // 错觉强度随张角变化
      const illuA = 1 + 0.28 * m, illuB = 1 - 0.12 * m;
      // 两条线段
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('A（箭尾外张）', 20, 56);
      lineWithFins(ctx, 66, ang, true, '#f87171');
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('B（箭尾内收）', 20, 112);
      lineWithFins(ctx, 122, ang, false, '#60a5fa');
      // 尺量证明：两根一样长
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(100, 142); ctx.lineTo(260, 142); ctx.stroke();
      for (let x = 100; x <= 260; x += 16) {
        ctx.beginPath(); ctx.moveTo(x, 138); ctx.lineTo(x, 146); ctx.stroke();
      }
      ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
      ctx.fillText('尺量：A 与 B 都是 160 px，严格相等', 100, 156);
      // 大脑感觉的长度（对照条）
      ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
      ctx.fillText('大脑"感觉"到的长度：', 20, 178);
      ctx.fillStyle = '#f87171';
      ctx.fillRect(20, 186, L * illuA * 0.8, 12);
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(20, 204, L * illuB * 0.8, 12);
      ctx.fillStyle = '#f87171'; ctx.font = '9px sans-serif';
      ctx.fillText('A  +' + Math.round((illuA - 1) * 100) + '%', 26 + L * illuA * 0.8, 196);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText('B  ' + Math.round((illuB - 1) * 100) + '%', 26 + L * illuB * 0.8, 214);
      // 木匠世界提示
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('外张像凸出的墙角（近）', 250, 60);
      ctx.fillText('内收像退远的屋脊（远）', 250, 116);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('箭尾张角 ' + ang + '°：错觉量 ±' + Math.round(m * 28) + '% 上下浮动', 16, 20);
      cap(ctx, V, '1889 缪勒-莱尔：大脑按透视深度"修正"长度——修错了');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 听觉掩蔽：强音的掩蔽裙淹没邻近弱音 */
  AN.auditoryMasking = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const xOf = function (f) { return 30 + (Math.log10(f) - 2) / (Math.log10(8000) - 2) * 300; };
    const yOf = function (db) { return 196 - db * 1.9; };
    function skirt(f) { // 掩蔽曲线（dB），低频侧陡、高频侧缓
      if (f <= 1000) return Math.max(0, 70 - 30 * Math.log2(1000 / Math.max(50, f)));
      return Math.max(0, 70 - 27 * Math.log2(f / 1000));
    }
    (function loop() {
      const D = (tp && tp.data) || {};
      const df = Math.max(30, Math.min(3000, D.df !== undefined ? D.df : 400));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const pf = 1000 + df;
      // 掩蔽裙（填充）
      ctx.fillStyle = 'rgba(239,68,68,.14)';
      ctx.beginPath(); ctx.moveTo(xOf(100), yOf(0));
      for (let f = 100; f <= 8000; f *= 1.05) ctx.lineTo(xOf(f), yOf(skirt(f)));
      ctx.lineTo(xOf(8000), yOf(0)); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let f = 100; f <= 8000; f *= 1.05) {
        const x = xOf(f), y = yOf(skirt(f));
        if (f === 100) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // 坐标轴
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(30, 196); ctx.lineTo(330, 196); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(30, 196); ctx.lineTo(30, 50); ctx.stroke();
      ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
      ctx.fillText('200', xOf(200) - 8, 206); ctx.fillText('1k', xOf(1000) - 4, 206);
      ctx.fillText('5k', xOf(5000) - 6, 206); ctx.fillText('频率', 306, 216);
      ctx.fillText('dB', 14, 60);
      // 强音
      const mx = xOf(1000);
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 8;
      ctx.fillRect(mx - 4, yOf(70), 8, 196 - yOf(70));
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fca5a5'; ctx.font = '9px sans-serif';
      ctx.fillText('强音 1000 Hz · 70 dB', mx - 40, yOf(70) - 8);
      // 弱音（探针）
      const px = xOf(pf), level = 30, masked = level < skirt(pf);
      ctx.fillStyle = masked ? '#64748b' : '#4ade80';
      if (!masked) { ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 10; }
      ctx.fillRect(px - 3, yOf(level), 6, 196 - yOf(level));
      ctx.shadowBlur = 0;
      ctx.fillStyle = masked ? '#94a3b8' : '#4ade80'; ctx.font = '9px sans-serif';
      ctx.fillText('弱音 ' + pf + ' Hz · 30 dB', Math.min(px - 30, 250), yOf(level) - 8);
      // 判定
      ctx.fillStyle = masked ? '#f87171' : '#4ade80'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText(masked ? '✗ 落在掩蔽裙下：听不见' : '✓ 高出裙边：听得见', 96, 44);
      // 耳蜗基底膜示意：行波包络
      ctx.fillStyle = 'rgba(51,65,85,.8)'; ctx.fillRect(30, 216, 300, 12);
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
      ctx.strokeRect(30, 216, 300, 12);
      const bump = function (xc, amp, col) {
        ctx.fillStyle = col;
        ctx.beginPath();
        for (let x = 30; x <= 330; x += 3) {
          const y = 216 - amp * Math.exp(-(x - xc) * (x - xc) / 800);
          if (x === 30) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.lineTo(330, 216); ctx.lineTo(30, 216); ctx.closePath(); ctx.fill();
      };
      bump(mx, 10, 'rgba(239,68,68,.5)');
      bump(px, masked ? 4 : 7, masked ? 'rgba(100,116,139,.5)' : 'rgba(74,222,128,.6)');
      ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
      ctx.fillText('耳蜗基底膜上的行波（强音把邻近位置一并掀起）', 60, 238);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('弱音频偏 ' + df + ' Hz → 掩蔽裙高 ' + Math.round(skirt(pf)) + ' dB vs 弱音 30 dB', 16, 20);
      cap(ctx, V, '1924 韦格尔&莱恩；MP3 直接删掉裙下成分，体积≈1/10');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 痛觉门控：粗纤维兴奋抑制性中间神经元，关上痛闸 */
  AN.painGate = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const reds = [], blues = [];
    (function loop() {
      const D = (tp && tp.data) || {};
      const rub = Math.max(0, Math.min(100, D.rub !== undefined ? D.rub : 35));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const open = 1 - rub / 100 * 0.92; // 闸门开放度
      // 皮肤与撞击点
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(14, 190); ctx.lineTo(150, 190); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('皮肤', 16, 202);
      const flash = (t % 40) < 8;
      ctx.strokeStyle = flash ? '#ef4444' : 'rgba(239,68,68,.4)'; ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3 + 0.2;
        ctx.beginPath(); ctx.moveTo(46, 184);
        ctx.lineTo(46 + 9 * Math.cos(a), 184 + 9 * Math.sin(a)); ctx.stroke();
      }
      ctx.fillStyle = '#f87171'; ctx.font = '9px sans-serif';
      ctx.fillText('撞击（痛）', 24, 168);
      // 揉搓的手（蓝色，幅度随 rub）
      const rubX = 112 + Math.sin(t * 0.25) * (rub / 100) * 14;
      ctx.fillStyle = rub > 3 ? 'rgba(96,165,250,.9)' : 'rgba(100,116,139,.6)';
      ctx.beginPath(); ctx.arc(rubX, 182, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#93c5fd'; ctx.font = '9px sans-serif';
      ctx.fillText('揉搓', 102, 206);
      // 脊髓背角
      ctx.fillStyle = 'rgba(30,41,59,.9)'; ctx.fillRect(160, 46, 176, 128);
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
      ctx.strokeRect(160, 46, 176, 128);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('脊髓背角', 168, 40);
      // 纤维：C 细纤维（红）、Aβ 粗纤维（蓝）
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(46, 184); ctx.quadraticCurveTo(100, 160, 168, 138); ctx.lineTo(238, 124); ctx.stroke();
      ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(rubX, 176); ctx.quadraticCurveTo(140, 120, 170, 92); ctx.lineTo(196, 84); ctx.stroke();
      ctx.fillStyle = '#f87171'; ctx.font = '9px sans-serif';
      ctx.fillText('C 细纤维（痛）', 96, 152);
      ctx.fillStyle = '#93c5fd';
      ctx.fillText('Aβ 粗纤维（触）', 84, 106);
      // 抑制性中间神经元 I
      ctx.fillStyle = rub > 3 ? '#4ade80' : '#475569';
      if (rub > 3) { ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 8; }
      ctx.beginPath(); ctx.arc(206, 80, 9, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#0f172a'; ctx.font = 'bold 10px sans-serif';
      ctx.fillText('I', 203, 84);
      ctx.fillStyle = '#4ade80'; ctx.font = '9px sans-serif';
      ctx.fillText('抑制神经元', 218, 74);
      // 传输细胞 T 与闸门
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath(); ctx.arc(248, 118, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a'; ctx.font = 'bold 10px sans-serif';
      ctx.fillText('T', 245, 122);
      // 闸门：开在 T 的输出轴突上
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(258, 116); ctx.lineTo(318, 66); ctx.stroke();
      const gx = 288, gy = 91, gAng = Math.atan2(66 - 116, 318 - 258) + Math.PI / 2 * (1 - open);
      ctx.strokeStyle = open > 0.4 ? '#fbbf24' : '#4ade80'; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(gx - 12 * Math.cos(gAng), gy - 12 * Math.sin(gAng));
      ctx.lineTo(gx + 12 * Math.cos(gAng), gy + 12 * Math.sin(gAng));
      ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('闸门', 296, 108);
      // I → 闸门的抑制连线
      ctx.strokeStyle = rub > 3 ? '#4ade80' : '#475569'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(206, 89); ctx.lineTo(282, 90); ctx.stroke();
      ctx.fillStyle = rub > 3 ? '#4ade80' : '#475569';
      ctx.fillRect(278, 86, 4, 8); // 抑制末梢"⊣"
      // 痛脉冲沿 C 纤维上行，过闸与否取决于 open
      if (t % 16 === 0) reds.push({ s: 0 });
      for (let i = reds.length - 1; i >= 0; i--) {
        const r = reds[i];
        r.s += 0.02;
        let x, y;
        if (r.s < 0.5) { const q = r.s / 0.5; x = 46 + q * (238 - 46); y = 184 - q * 60; }
        else { const q = (r.s - 0.5) / 0.5; x = 238 + q * 80; y = 124 - q * 58; }
        const passed = r.s > 0.62;
        if (passed && open <= 0.35) { reds.splice(i, 1); continue; } // 被闸拦下
        ctx.fillStyle = passed ? '#fca5a5' : '#ef4444';
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
        if (r.s > 1) reds.splice(i, 1);
      }
      // 触压脉冲
      if (rub > 3 && t % Math.max(4, Math.round(20 - rub / 6)) === 0) blues.push({ s: 0 });
      for (let i = blues.length - 1; i >= 0; i--) {
        const b = blues[i];
        b.s += 0.03;
        const x = rubX + b.s * (206 - rubX), y = 176 - b.s * 96;
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
        if (b.s > 1) blues.splice(i, 1);
      }
      // 大脑与痛感表
      ctx.fillStyle = 'rgba(248,113,113,' + (0.15 + open * 0.75) + ')';
      if (open > 0.4) { ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 12; }
      ctx.beginPath(); ctx.arc(326, 52, 14, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(326, 52, 14, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif';
      ctx.fillText('脑', 322, 55);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('揉搓强度 ' + rub + '% → 痛觉上传 ' + Math.round(open * 100) + '%', 16, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText(open > 0.4 ? '闸门大开：痛信号长驱直入' : '闸门被粗纤维关上：痛信号就地拦下', 16, 224);
      cap(ctx, V, '1965 梅尔扎克&沃尔门控理论；TENS 止痛仪同一原理');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 嗅觉化学：分子形状 → 受体组合指纹 */
  AN.smellCode = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const pockets = [4, 6, 8, 10, 12]; // 各受体的偏好链长
    const names = { 4: '果香', 5: '青果香', 6: '青草味', 7: '青草转脂肪味', 8: '柑橘', 9: '橙皮', 10: '橙花香', 11: '蜡质感', 12: '皂感' };
    (function loop() {
      const D = (tp && tp.data) || {};
      const n = Math.max(4, Math.min(12, D.n !== undefined ? D.n : 8));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const act = pockets.map(function (p) { return Math.exp(-(n - p) * (n - p) / 5); });
      // 受体排（上皮表面）
      ctx.fillStyle = 'rgba(51,65,85,.8)'; ctx.fillRect(30, 170, 300, 40);
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1;
      ctx.strokeRect(30, 170, 300, 40);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('嗅上皮：5 类受体（示意，真人约 400 种）', 30, 222);
      pockets.forEach(function (p, i) {
        const x = 62 + i * 60;
        const on = act[i] > 0.35;
        // 受体口袋
        ctx.strokeStyle = on ? '#4ade80' : '#64748b'; ctx.lineWidth = 2;
        if (on) { ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 8; }
        ctx.beginPath();
        ctx.moveTo(x - 12, 170); ctx.lineTo(x - 12, 186); ctx.lineTo(x + 12, 186); ctx.lineTo(x + 12, 170);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = on ? '#4ade80' : '#64748b'; ctx.font = '9px sans-serif';
        ctx.fillText('OR' + (i + 1), x - 8, 200);
        // 激活条
        ctx.fillStyle = on ? 'rgba(74,222,128,.85)' : 'rgba(100,116,139,.4)';
        ctx.fillRect(x - 10, 166 - act[i] * 30, 20, act[i] * 30);
      });
      // 气味分子：n 个碳的链条，飞向最匹配的受体
      const prog = (t % 160) / 160;
      const best = act.indexOf(Math.max.apply(null, act));
      const tx = 62 + best * 60;
      const mx = 40 + prog * (tx - 40), my = 60 + prog * 95;
      const wob = Math.sin(t * 0.2) * 2;
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const px = mx + (i - (n - 1) / 2) * 6, py = my + wob * Math.sin(i * 1.3);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      for (let i = 0; i < n; i++) {
        const px = mx + (i - (n - 1) / 2) * 6, py = my + wob * Math.sin(i * 1.3);
        ctx.fillStyle = i === 0 ? '#fbbf24' : '#94a3b8';
        ctx.beginPath(); ctx.arc(px, py, 3.2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#fbbf24'; ctx.font = '9px sans-serif';
      ctx.fillText('醛基', mx - (n - 1) * 3 - 18, my - 8);
      // 指纹条形码
      ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
      ctx.fillText('激活指纹：', 236, 60);
      act.forEach(function (a, i) {
        ctx.fillStyle = a > 0.35 ? '#4ade80' : '#334155';
        if (a > 0.35) { ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 6; }
        ctx.fillRect(240 + i * 20, 66, 12, 30);
        ctx.shadowBlur = 0;
      });
      ctx.fillStyle = '#4ade80'; ctx.font = 'bold 10px sans-serif';
      ctx.fillText(act.map(function (a) { return a > 0.35 ? '1' : '0'; }).join(' '), 246, 110);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('C' + n + ' 脂肪醛 → 大脑读到「' + names[n] + '」（示意）', 16, 20);
      cap(ctx, V, '1991 巴克&阿克塞尔：约 400 种受体的组合码 → 上万种气味（2004 诺奖）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 联觉：字形-颜色"串线"让目标从背景里弹出 */
  AN.synesthesia = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const twos = [[0, 3], [1, 6], [2, 1], [3, 7], [4, 4]]; // 藏在 5 海里的 2
    const isTwo = function (r, c) { return twos.some(function (p) { return p[0] === r && p[1] === c; }); };
    (function loop() {
      const D = (tp && tp.data) || {};
      const s = Math.max(0, Math.min(100, D.s !== undefined ? D.s : 80));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const f = s / 100;
      // 5×9 字符阵列
      ctx.font = 'bold 20px monospace';
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 9; c++) {
          const x = 36 + c * 30, y = 52 + r * 30;
          if (isTwo(r, c)) {
            const rr = Math.round(100 + f * 148), gg = Math.round(116 + f * (-70)), bb = Math.round(139 + f * (-90));
            ctx.fillStyle = 'rgb(' + rr + ',' + gg + ',' + bb + ')';
            if (f > 0.5) { ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 10; }
            ctx.fillText('2', x, y);
            ctx.shadowBlur = 0;
          } else {
            ctx.fillStyle = '#7c8aa0';
            ctx.fillText('5', x, y);
          }
        }
      }
      // 普通人：逐格扫描的眼睛
      const total = 45, scan = Math.floor(t / 14) % total;
      const sr = Math.floor(scan / 9), sc = scan % 9;
      ctx.strokeStyle = 'rgba(148,163,184,.7)'; ctx.lineWidth = 1.5;
      ctx.strokeRect(28 + sc * 30, 28 + sr * 30, 28, 28);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('逐个扫描', 28 + sc * 30, 24 + sr * 30);
      // 联觉者：颜色弹出，直接圈出所有 2
      if (f >= 0.5) {
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
        ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 8;
        twos.forEach(function (p, i) {
          const grow = Math.min(1, Math.max(0, (t % 90 - i * 6) / 12));
          ctx.beginPath();
          ctx.arc(42 + p[1] * 30, 45 + p[0] * 30, 6 + grow * 8, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
      }
      // 用时对照
      const tFind = (0.6 + (1 - f) * 7.4).toFixed(1);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('联觉强度 ' + s + '% → 找出所有"2"约 ' + tFind + ' s', 16, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText(f >= 0.5 ? '颜色弹出：不用搜，"2"自己跳到你眼前' : '没有颜色线索：只能像普通人一样逐格搜', 16, 210);
      cap(ctx, V, '1883 高尔顿首记；2001 拉马钱德兰：字形区与 V4 颜色区"串线"');
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
