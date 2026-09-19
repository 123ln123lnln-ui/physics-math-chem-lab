/* explore-anim5_15.js — 第三批动画引擎（机器人树 · 批次15，11 个专属原理动画） */
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

  /* 安提基特拉机械：齿轮比复刻天文周期，日月针重逢即日月食窗口
  // 原理：齿轮传动比 = 天文周期之比（223 朔望月 ≈ 18 回归年的沙罗周期）
  // 不变量：月针角速 / 日针角速 = 365.25/29.53，任何参数下不变
  // 禁忌：不得让日月针匀速同速转动（那就丢了周期之比的灵魂）；日月食只在朔望附近闪现
  // 参数质变点：模拟年数跑到 18 年，日月针回到初始相位——沙罗周期闭合，日月食重现 */
  AN.antikythera = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const yr = Math.max(1, Math.min(19, D.yr !== undefined ? D.yr : 18));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const totalDays = yr * 365.25;
      const days = 200 + t * 4; // 预跑 200 天，首帧指针已错开
      const shown = Math.min(days, totalDays);
      // 左：曲柄齿轮啮合主齿轮（齿数比示意 12:1）
      const ga = t * 0.05, gx = 60, gy = 120;
      ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(gx, gy, 16, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 8; i++) {
        const a = ga + i * Math.PI / 4;
        ctx.beginPath(); ctx.moveTo(gx + 13 * Math.cos(a), gy + 13 * Math.sin(a));
        ctx.lineTo(gx + 19 * Math.cos(a), gy + 19 * Math.sin(a)); ctx.stroke();
      }
      const bgx = 118, bgy = 120;
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(bgx, bgy, 42, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 18; i++) {
        const a = -ga / 3.5 + i * Math.PI / 9;
        ctx.beginPath(); ctx.moveTo(bgx + 38 * Math.cos(a), bgy + 38 * Math.sin(a));
        ctx.lineTo(bgx + 46 * Math.cos(a), bgy + 46 * Math.sin(a)); ctx.stroke();
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('曲柄', 50, 150);
      ctx.fillText('主齿轮·223 朔望月', 78, 176);
      // 右：日月表盘
      const dx = 268, dy = 118, dr = 62;
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(dx, dy, dr, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6 - Math.PI / 2;
        ctx.beginPath(); ctx.moveTo(dx + (dr - 6) * Math.cos(a), dy + (dr - 6) * Math.sin(a));
        ctx.lineTo(dx + dr * Math.cos(a), dy + dr * Math.sin(a)); ctx.stroke();
      }
      const sunA = 2 * Math.PI * shown / 365.25 - Math.PI / 2;
      const moonA = 2 * Math.PI * shown / 29.53 - Math.PI / 2;
      // 日月食窗口：朔（日月同向）或望（反向）
      let dd = Math.abs(sunA - moonA) % (2 * Math.PI);
      if (dd > Math.PI) dd = 2 * Math.PI - dd;
      const eclipse = dd < 0.10 || Math.abs(dd - Math.PI) < 0.10;
      if (eclipse) {
        ctx.shadowColor = '#fde047'; ctx.shadowBlur = 18;
        ctx.strokeStyle = '#fde047'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(dx, dy, dr + 6, 0, Math.PI * 2); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fde047'; ctx.font = 'bold 11px sans-serif';
        ctx.fillText('日月食窗口！', dx - 32, dy - dr - 12);
      }
      // 日针（金）与月针（蓝）
      ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 8;
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + (dr - 10) * Math.cos(sunA), dy + (dr - 10) * Math.sin(sunA)); ctx.stroke();
      ctx.shadowColor = '#60a5fa';
      ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + (dr - 22) * Math.cos(moonA), dy + (dr - 22) * Math.sin(moonA)); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fbbf24'; ctx.font = '9px sans-serif'; ctx.fillText('日', dx + dr * Math.cos(sunA) - 3, dy + dr * Math.sin(sunA) + 3);
      ctx.fillStyle = '#60a5fa'; ctx.fillText('月', dx + dr * Math.cos(moonA) - 3, dy + dr * Math.sin(moonA) + 3);
      // 年进度条与沙罗闭合提示
      ctx.fillStyle = 'rgba(148,163,184,.3)'; ctx.fillRect(30, 205, 300, 7);
      ctx.fillStyle = '#22d3ee'; ctx.fillRect(30, 205, 300 * Math.min(1, shown / totalDays), 7);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('已模拟 ' + (shown / 365.25).toFixed(1) + ' / ' + yr + ' 年', 30, 24);
      if (yr >= 18 && shown >= totalDays - 1) {
        ctx.fillStyle = '#fde047';
        ctx.fillText('沙罗周期闭合：日月食将按原序重现！', 30, 42);
      } else {
        ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
        ctx.fillText('月针角速 : 日针角速 = 365.25 : 29.53', 30, 42);
      }
      cap(ctx, V, '安提基特拉机械（约前150）：把周期之比铸进齿轮，指针重逢即天象重演');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 阿尔-贾扎里乐人：水轮转鼓上的销钉拨杆发音
  // 原理：销钉在转鼓圆周上的位置 = 触发时刻表——空间编码时间，即可更换的程序
  // 不变量：销钉数决定每圈触发次数；转速恒定，节奏疏密只由销钉分布决定
  // 禁忌：不得让发音随机发生（必须对应销钉经过触点）；销钉随鼓转动，不凭空出现
  // 参数质变点：销钉 2 枚时是稀疏鼓点，≥10 枚连成旋律——"存储密度"决定"程序"丰富度 */
  AN.autoMusician = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const notes = [];
    const hitAnim = [0, 0, 0];
    (function loop() {
      const D = (tp && tp.data) || {};
      const peg = Math.max(2, Math.min(16, D.peg !== undefined ? D.peg : 8));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const ang = t * 0.02;
      // 左侧水车
      const wx = 46, wy = 120;
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(wx, wy, 26, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 6; i++) {
        const a = ang + i * Math.PI / 3;
        ctx.beginPath(); ctx.moveTo(wx, wy);
        ctx.lineTo(wx + 26 * Math.cos(a), wy + 26 * Math.sin(a)); ctx.stroke();
      }
      ctx.fillStyle = '#38bdf8'; ctx.font = '9px sans-serif';
      ctx.fillText('水力驱动', 24, 162);
      // 传动带
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(wx + 24, wy - 12); ctx.lineTo(178, 108); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(wx + 24, wy + 12); ctx.lineTo(178, 132); ctx.stroke();
      // 中央销钉鼓
      const cx = 210, cy = 120, cr = 34;
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(251,191,36,.12)';
      ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('销钉鼓（可换程序）', cx - 40, cy + cr + 16);
      // 三个触点/拨杆/乐人
      const lanes = [-0.9, 0, 0.9];
      const instX = [286, 296, 306], instY = [72, 118, 164], instName = ['鼓', '铃', '号'];
      const instCol = ['#f87171', '#fde047', '#4ade80'];
      for (let l = 0; l < 3; l++) {
        const senseA = -Math.PI / 2 + lanes[l] * 0.8; // 鼓面上的触点角度（固定）
        const sxp = cx + cr * Math.cos(senseA), syp = cy + cr * Math.sin(senseA);
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
        const kick = Math.max(0, hitAnim[l]);
        ctx.beginPath(); ctx.moveTo(sxp, syp); ctx.lineTo(instX[l] - 10, instY[l] + 6 + kick * 6); ctx.stroke();
        // 乐人（圆头+梯形身）与乐器
        ctx.fillStyle = instCol[l];
        ctx.beginPath(); ctx.arc(instX[l], instY[l] - 10, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(instX[l] - 7, instY[l] - 4, 14, 16);
        ctx.strokeStyle = instCol[l]; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(instX[l], instY[l] + 22, 8 - kick * 3, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
        ctx.fillText(instName[l], instX[l] + 14, instY[l] + 25);
        hitAnim[l] *= 0.85;
      }
      // 销钉：随鼓转动，经过触点即触发
      for (let i = 0; i < peg; i++) {
        const pa = ang + i * 2 * Math.PI / peg;
        const pxp = cx + cr * Math.cos(pa), pyp = cy + cr * Math.sin(pa);
        ctx.fillStyle = '#fb923c';
        ctx.beginPath(); ctx.arc(pxp, pyp, 3, 0, Math.PI * 2); ctx.fill();
        for (let l = 0; l < 3; l++) {
          const senseA = -Math.PI / 2 + lanes[l] * 0.8;
          let d = Math.abs(pa - senseA) % (2 * Math.PI);
          if (d > Math.PI) d = 2 * Math.PI - d;
          if (d < 0.03 && i % 3 === l) {
            hitAnim[l] = 1;
            if (notes.length < 40) notes.push({ x: instX[l], y: instY[l] - 20, life: 40, col: instCol[l] });
          }
        }
      }
      // 音符粒子（发光上浮）
      for (let i = notes.length - 1; i >= 0; i--) {
        const n = notes[i];
        n.y -= 0.8; n.life--;
        ctx.shadowColor = n.col; ctx.shadowBlur = 8;
        ctx.fillStyle = n.col;
        ctx.beginPath(); ctx.arc(n.x + Math.sin(n.life * 0.3) * 4, n.y, 3, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        if (n.life <= 0) notes.splice(i, 1);
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('销钉 ' + peg + ' 枚/圈 → 每圈触发约 ' + peg + ' 次发音', 16, 22);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText(peg < 6 ? '稀疏鼓点——信息密度低' : peg < 12 ? '节奏成形' : '旋律连贯——程序"变丰富了"', 16, 40);
      cap(ctx, V, '销钉的位置就是程序：换一排钉子，换一首曲子（1206 阿尔-贾扎里）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 瓦特离心调速器：转速→飞球高度→阀门开度的负反馈回路
  // 原理：负反馈——输出（转速）经飞球-连杆反向调节输入（蒸汽阀）
  // 不变量：无论负载如何，有调速器时转速总被拉回设定值附近；n_ss = P·valve/load
  // 禁忌：飞球高度必须随转速平方变化，不得随手画；对照线（无调速）不得参与反馈
  // 参数质变点：负载拉满（100%）时，无调速转速腰斩至 0.5、拉空（10%）时飞车到 5 倍，有调速仍咬住设定值 */
  AN.flyballGovernor = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, n = 1;
    (function loop() {
      const D = (tp && tp.data) || {};
      const load = Math.max(10, Math.min(100, D.load !== undefined ? D.load : 50));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 闭环仿真：P·valve/load → 转速；valve 由转速反馈决定
      const P = 60;
      const valve = Math.max(0.1, Math.min(1, 0.833 - (n - 1) * 2.5));
      n += (P * valve / load - n) * 0.02;
      const nFree = P * 0.833 / load; // 无调速：阀门固定
      const rot = t * 0.03 * n;
      const cx = 130, topY = 46;
      // 主轴
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx, topY); ctx.lineTo(cx, 190); ctx.stroke();
      // 飞球臂：张角 ∝ n²
      const spread = Math.max(0.15, Math.min(1.5, n * n * 0.55));
      const armL = 52, ba = 0.25 + spread * 0.55;
      const bx1 = cx - armL * Math.sin(ba), by1 = topY + armL * Math.cos(ba);
      const bx2 = cx + armL * Math.sin(ba), by2 = topY + armL * Math.cos(ba);
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, topY); ctx.lineTo(bx1, by1); ctx.moveTo(cx, topY); ctx.lineTo(bx2, by2); ctx.stroke();
      // 飞球（旋转透视：横向投影 cos(rot)）
      [[bx1, by1, 1], [bx2, by2, -1]].forEach(function (b) {
        const squish = 0.4 + 0.6 * Math.abs(Math.cos(rot + (b[2] > 0 ? 0 : Math.PI)));
        ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 10;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(cx + (b[0] - cx) * squish, b[1], 8, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      });
      // 套筒与连杆到阀门
      const sleeveY = topY + armL * Math.cos(ba) + 10;
      ctx.fillStyle = '#a78bfa';
      ctx.fillRect(cx - 8, sleeveY, 16, 12);
      ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx + 8, sleeveY + 6); ctx.lineTo(220, sleeveY + 6); ctx.lineTo(220, 120); ctx.stroke();
      // 蒸汽阀（右侧）：开度可视化
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.strokeRect(212, 120, 16, 60);
      ctx.fillStyle = 'rgba(239,68,68,.7)';
      ctx.fillRect(214, 120 + 60 * (1 - valve), 12, 60 * valve);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('蒸汽阀开度 ' + Math.round(valve * 100) + '%', 196, 196);
      // 反馈回路箭头
      ctx.strokeStyle = 'rgba(34,211,238,.6)'; ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.arc(cx, 118, 78, -0.5, 1.6); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#22d3ee'; ctx.font = '9px sans-serif';
      ctx.fillText('转速↑ → 球升 → 阀关 → 转速↓', 48, 210);
      // 转速对照条：有调速 vs 无调速
      const barY = 70;
      ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
      ctx.fillText('有调速器', 258, barY - 8);
      ctx.fillStyle = '#334155'; ctx.fillRect(258, barY, 80, 12);
      ctx.fillStyle = '#22c55e'; ctx.fillRect(258, barY, 80 * Math.min(1.5, n) / 1.5, 12);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('无调速器', 258, barY + 34);
      ctx.fillStyle = '#334155'; ctx.fillRect(258, barY + 40, 80, 12);
      ctx.fillStyle = '#ef4444'; ctx.fillRect(258, barY + 40, 80 * Math.min(1.5, nFree) / 1.5, 12);
      // 设定值刻度线
      ctx.strokeStyle = '#fde047'; ctx.lineWidth = 1.5;
      const setX = 258 + 80 / 1.5;
      ctx.beginPath(); ctx.moveTo(setX, barY - 4); ctx.lineTo(setX, barY + 56); ctx.stroke();
      ctx.fillStyle = '#fde047'; ctx.font = '9px sans-serif';
      ctx.fillText('设定转速', setX - 18, barY + 70);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('负载 ' + load + '%：有调速 n=' + n.toFixed(2) + '，无调速 n=' + nFree.toFixed(2), 16, 22);
      cap(ctx, V, '1788 瓦特：输出回头调节输入——第一个工业负反馈回路');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 特斯拉遥控船：无线电信号随距离平方衰减，越过临界距离即失控
  // 原理：电磁波场强随距离平方衰减（s ∝ 1/d²），接收需超过信噪阈值
  // 不变量：s(d)·d² = 常数；阈值线固定，船的行为只由 s 与阈值的大小关系决定
  // 禁忌：波纹振幅必须随传播距离衰减；失控时不得继续执行指令（原地打转）
  // 参数质变点：距离 ≈ 51 m（本发射功率下 s=阈值 0.35）——越过即失联打转 */
  AN.teslaBoat = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, boatA = 0, driftA = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const dist = Math.max(5, Math.min(100, D.dist !== undefined ? D.dist : 40));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const s = 900 / (dist * dist); // 归一化：30m 处 s=1
      const linked = s >= 0.35;
      // 水面
      ctx.fillStyle = 'rgba(59,130,246,.15)'; ctx.fillRect(0, 150, 360, 90);
      ctx.strokeStyle = 'rgba(96,165,250,.5)'; ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        for (let x = 0; x <= 360; x += 8) {
          const y = 162 + i * 20 + Math.sin(x * 0.05 + t * 0.05 + i) * 2;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // 岸边发射台
      ctx.fillStyle = '#334155'; ctx.fillRect(16, 96, 34, 60);
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(33, 96); ctx.lineTo(33, 56); ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(33, 52, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('特斯拉的电键', 10, 172);
      // 无线电波（振幅随距离衰减）
      for (let r = 0; r < 4; r++) {
        const waveR = ((t * 1.6 + r * 28) % 112) + 8;
        const fade = Math.max(0, 1 - waveR / 120) * 900 / Math.max(900, waveR * waveR * 8);
        ctx.strokeStyle = 'rgba(239,68,68,' + Math.min(0.7, fade + 0.05) + ')';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(33, 52, waveR, -0.5, 0.9); ctx.stroke();
      }
      // 小船：位置 ∝ 距离参数
      const bx = 70 + (dist / 100) * 260, by = 168;
      if (linked) { boatA += 0.012; driftA = 0; } else { driftA += 0.06; }
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(linked ? Math.sin(boatA) * 0.08 : Math.sin(driftA) * 0.3);
      ctx.fillStyle = linked ? '#22d3ee' : '#64748b';
      ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(22, 0); ctx.lineTo(14, 10); ctx.lineTo(-14, 10); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -18); ctx.stroke();
      ctx.fillStyle = linked ? '#fde047' : '#475569';
      ctx.beginPath(); ctx.arc(0, -20, 3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      // 船尾轨迹
      if (linked) {
        ctx.strokeStyle = 'rgba(34,211,238,.5)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(bx - 26, by + 6);
        ctx.quadraticCurveTo(bx - 44, by + 12 + Math.sin(t * 0.1) * 4, bx - 62, by + 8);
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'rgba(239,68,68,.6)'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(bx, by + 2, 16 + Math.sin(t * 0.1) * 2, 0, Math.PI * 1.6); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ef4444'; ctx.font = 'bold 11px sans-serif';
        ctx.fillText('信号丢失：原地打转', bx - 48, by - 32);
      }
      // 指令序列指示灯（受控时依序点亮）
      const cmds = ['启', '转', '灯', '停'];
      for (let i = 0; i < 4; i++) {
        const on = linked && Math.floor(t / 40) % 4 === i;
        ctx.fillStyle = on ? '#fde047' : '#334155';
        ctx.beginPath(); ctx.arc(60 + i * 26, 30, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = on ? '#0f172a' : '#94a3b8'; ctx.font = '9px sans-serif';
        ctx.fillText(cmds[i], 57 + i * 26, 33);
      }
      // 信号强度表
      ctx.fillStyle = '#334155'; ctx.fillRect(230, 22, 110, 10);
      ctx.fillStyle = linked ? '#22c55e' : '#ef4444';
      ctx.fillRect(230, 22, 110 * Math.min(1, s), 10);
      ctx.strokeStyle = '#fde047'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(230 + 110 * 0.35, 18); ctx.lineTo(230 + 110 * 0.35, 36); ctx.stroke();
      ctx.fillStyle = '#fde047'; ctx.font = '8px sans-serif';
      ctx.fillText('接收阈值', 246, 42);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('距离 ' + dist + ' m → 信号 s = 900/d² = ' + s.toFixed(2), 150, 60);
      cap(ctx, V, '1898 麦迪逊广场花园：电波过阈值才听令——无线电遥控的首秀');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 斯佩里自动驾驶仪：陀螺定轴性提供不动参照，反馈舵面修正姿态
  // 原理：高速陀螺的定轴性——转轴在空间保持方向，机身倾角 = 陀螺轴与机体夹角
  // 不变量：无论扰动多强，陀螺金轴始终水平；有自动驾驶时姿态角有界（≈±5°）
  // 禁忌：陀螺轴不得随机身一起倾斜；对照组（无自驾）只做被动阻尼、不加修正
  // 参数质变点：扰动从 0 拉满，无自驾从微晃变成 ±40° 甩摆，有自驾仍贴在水平线 */
  AN.gyroPilot = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, phi = 0.12, w = 0, phiF = 0.12, wF = 0;
    const trace = [], traceF = [];
    (function loop() {
      const D = (tp && tp.data) || {};
      const gust = Math.max(0, Math.min(100, D.gust !== undefined ? D.gust : 40));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 仿真：阵风扰动 + 阻尼；有自驾加反馈修正项
      const noise = (Math.sin(t * 0.11) + 0.6 * Math.sin(t * 0.043 + 2)) * gust * 0.004;
      w += (noise - 0.3 * w - 2.2 * phi) * 0.06; phi += w * 0.06 * 10;
      wF += (noise - 0.08 * wF) * 0.06; phiF += wF * 0.06 * 10;
      phi = Math.max(-0.5, Math.min(0.5, phi));
      phiF = Math.max(-0.6, Math.min(0.6, phiF));
      trace.push(phi); traceF.push(phiF);
      if (trace.length > 130) { trace.shift(); traceF.shift(); }
      // 左：飞机正视图（随机身滚转）
      const ax = 92, ay = 105;
      ctx.save(); ctx.translate(ax, ay); ctx.rotate(phi);
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-52, 0); ctx.lineTo(52, 0); ctx.stroke(); // 机翼
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(0, 26); ctx.stroke(); // 机身
      ctx.restore();
      // 陀螺金轴：永远水平
      ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 12;
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ax - 34, ay); ctx.lineTo(ax + 34, ay); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(ax, ay, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fbbf24'; ctx.font = '9px sans-serif';
      ctx.fillText('陀螺轴（定轴不动）', ax - 38, ay - 36);
      // 修正舵面箭头（与倾角反向）
      if (Math.abs(phi) > 0.02) {
        ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2.5;
        const dir = phi > 0 ? 1 : -1;
        ctx.beginPath(); ctx.moveTo(ax + 58, ay + dir * 14); ctx.lineTo(ax + 58, ay - dir * 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ax + 54, ay - dir * 6); ctx.lineTo(ax + 58, ay - dir * 10); ctx.lineTo(ax + 62, ay - dir * 6); ctx.stroke();
        ctx.fillStyle = '#4ade80'; ctx.font = '9px sans-serif';
        ctx.fillText('副翼修正', ax + 66, ay - 4);
      }
      // 右：姿态轨迹对照
      ctx.fillStyle = 'rgba(30,41,59,.85)'; ctx.fillRect(196, 42, 150, 130);
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(196, 42, 150, 130);
      ctx.strokeStyle = 'rgba(148,163,184,.5)';
      ctx.beginPath(); ctx.moveTo(196, 107); ctx.lineTo(346, 107); ctx.stroke();
      ctx.strokeStyle = '#64748b'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.5;
      ctx.beginPath();
      traceF.forEach(function (v, i) {
        const x = 200 + i, y = 107 - v * 110;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
      ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 5;
      ctx.beginPath();
      trace.forEach(function (v, i) {
        const x = 200 + i, y = 107 - v * 110;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#22d3ee'; ctx.font = '9px sans-serif';
      ctx.fillText('— 有自动驾驶', 204, 56);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('- - 无自动驾驶', 204, 68);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('气流扰动 ' + gust + '%：机身滚转 ' + (phi * 57.3).toFixed(1) + '°（无自驾 ' + (phiF * 57.3).toFixed(1) + '°）', 14, 22);
      cap(ctx, V, '1912 斯佩里：陀螺给飞机一根"不动的参照轴"，姿态闭环由此开始');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 伺服闭环：误差×增益驱动修正，增益跨越临界阻尼后由迟缓转为振荡
  // 原理：二阶闭环 θ'' = K(θt−θ) − cθ'；阻尼比 ζ = c/(2√K)
  // 不变量：稳态误差 → 0（只要稳定）；超调量公式 e^(−πζ/√(1−ζ²)) 与显示数值一致
  // 禁忌：不得画成单调指数趋近（高 K 必有超调）；目标阶跃时刻两条曲线同步起跳
  // 参数质变点：K ≈ 0.4（ζ=1 临界阻尼）——以下迟缓爬行，以上出现超调，K=12 时超调约 50% */
  AN.servoLoop = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, th = 0, w = 0, thT = 1, peak = 0;
    const trace = [];
    (function loop() {
      const D = (tp && tp.data) || {};
      const K = Math.max(0.5, Math.min(12, D.K !== undefined ? D.K : 3));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 目标每 140 帧阶跃翻转
      if (t % 140 === 0) { thT = -thT; }
      // 二阶仿真（c=1.2）
      for (let s = 0; s < 4; s++) {
        w += (K * (thT - th) - 1.2 * w) * 0.05;
        th += w * 0.05;
      }
      const err = thT - th;
      if (Math.sign(thT) > 0) peak = Math.max(peak * 0.995, th);
      trace.push(th); if (trace.length > 200) trace.shift();
      // 左：指针表盘
      const dx = 82, dy = 130, dr = 58;
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(dx, dy, dr, Math.PI, 0); ctx.stroke();
      // 目标针（虚线灰）
      const aT = -Math.PI / 2 - thT * 0.9;
      ctx.strokeStyle = '#94a3b8'; ctx.setLineDash([4, 3]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + (dr - 6) * Math.cos(aT), dy + (dr - 6) * Math.sin(aT)); ctx.stroke();
      ctx.setLineDash([]);
      // 实际针（青色发光）
      const aA = -Math.PI / 2 - th * 0.9;
      ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 10;
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + (dr - 12) * Math.cos(aA), dy + (dr - 12) * Math.sin(aA)); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(dx, dy, 5, 0, Math.PI * 2); ctx.fill();
      // 误差条
      ctx.fillStyle = err >= 0 ? '#4ade80' : '#f87171';
      ctx.fillRect(dx - 1, 200, 2 + 76 * Math.max(-1, Math.min(1, err)), 5);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('误差 ' + err.toFixed(2), dx - 24, 218);
      // 右：滚动响应曲线
      ctx.fillStyle = 'rgba(30,41,59,.85)'; ctx.fillRect(168, 40, 178, 150);
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(168, 40, 178, 150);
      ctx.strokeStyle = 'rgba(148,163,184,.6)'; ctx.setLineDash([3, 3]);
      [1, -1].forEach(function (lv) {
        ctx.beginPath(); ctx.moveTo(168, 115 - lv * 55); ctx.lineTo(346, 115 - lv * 55); ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
      ctx.beginPath();
      trace.forEach(function (v, i) {
        const x = 170 + i * 0.87, y = 115 - v * 55;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      // 状态判读：ζ = 1.2/(2√K)
      const zeta = 1.2 / (2 * Math.sqrt(K));
      let state, col;
      if (zeta >= 1) { state = '过阻尼：迟缓爬行'; col = '#60a5fa'; }
      else if (zeta > 0.4) { state = '欠阻尼：快速带超调'; col = '#4ade80'; }
      else { state = '低阻尼：猛烈振荡'; col = '#ef4444'; }
      const overshoot = zeta < 1 ? Math.exp(-Math.PI * zeta / Math.sqrt(1 - zeta * zeta)) * 100 : 0;
      ctx.fillStyle = col; ctx.font = 'bold 12px sans-serif';
      ctx.fillText(state, 176, 60);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('阻尼比 ζ=' + zeta.toFixed(2) + '，超调 ≈' + overshoot.toFixed(0) + '%', 176, 78);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('环路增益 K = ' + K.toFixed(1) + '（修正力 = K × 误差）', 14, 22);
      cap(ctx, V, '负反馈的双刃剑：K 跨过临界阻尼，响应从爬行变成拉锯（1927 布莱克）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* Shakey 的 A*：f = g + h 引导搜索方向，障碍封死时诚实报"无解"
  // 原理：A* 搜索——优先扩展 f = g（已走代价）+ h（到终点的曼哈顿估计）最小的格子
  // 不变量：找到的路径必为最短（曼哈顿启发可采纳）；扩展顺序严格按 f 值
  // 禁忌：墙壁不得随机闪变（同一种子同一密度同一地图）；无解时不得硬画一条穿墙线
  // 参数质变点：障碍密度 ≈ 35% 以上，通道被封死——从"绕远路"质变为"无解" */
  AN.astarPath = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, cached = null, cachedDen = -1;
    const GW = 20, GH = 12, CS = 17, OX = 8, OY = 30;
    function rng(seed) { let s = seed; return function () { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; }
    function solve(den) {
      const r = rng(20260);
      const wall = [];
      for (let y = 0; y < GH; y++) { wall.push([]); for (let x = 0; x < GW; x++) wall[y].push(r() * 100 < den); }
      const sx = 1, sy = 5, gx = 18, gy = 6;
      wall[sy][sx] = false; wall[gy][gx] = false;
      const open = [{ x: sx, y: sy, g: 0, f: 0 }];
      const gScore = {}, closed = [], parent = {};
      gScore[sx + ',' + sy] = 0;
      let found = false;
      let guard = 0;
      while (open.length && guard++ < 3000) {
        let bi = 0;
        for (let i = 1; i < open.length; i++) if (open[i].f < open[bi].f) bi = i;
        const cur = open.splice(bi, 1)[0];
        const ck = cur.x + ',' + cur.y;
        if (closed.indexOf(ck) >= 0) continue;
        closed.push(ck);
        if (cur.x === gx && cur.y === gy) { found = true; break; }
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          const nx = cur.x + d[0], ny = cur.y + d[1];
          if (nx < 0 || ny < 0 || nx >= GW || ny >= GH || wall[ny][nx]) return;
          const nk = nx + ',' + ny, ng = cur.g + 1;
          if (gScore[nk] === undefined || ng < gScore[nk]) {
            gScore[nk] = ng;
            parent[nk] = ck;
            open.push({ x: nx, y: ny, g: ng, f: ng + Math.abs(gx - nx) + Math.abs(gy - ny) });
          }
        });
      }
      const path = [];
      if (found) {
        let ck = gx + ',' + gy;
        while (ck) { path.push(ck); ck = parent[ck]; }
      }
      return { wall: wall, closed: closed, path: path, found: found, sx: sx, sy: sy, gx: gx, gy: gy };
    }
    (function loop() {
      const D = (tp && tp.data) || {};
      const den = Math.max(5, Math.min(45, D.den !== undefined ? D.den : 25));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      if (cachedDen !== den) { cached = solve(den); cachedDen = den; t = 0; }
      const S = cached;
      const reveal = Math.min(S.closed.length, 20 + t * 2); // 预跑 20 格，首帧即有内容
      // 墙
      ctx.fillStyle = '#334155';
      for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
        if (S.wall[y][x]) ctx.fillRect(OX + x * CS + 1, OY + y * CS + 1, CS - 2, CS - 2);
      }
      // 已扩展（蓝）与当前前沿（亮青）
      for (let i = 0; i < reveal; i++) {
        const p = S.closed[i].split(',');
        const fresh = i >= reveal - 4;
        ctx.fillStyle = fresh ? 'rgba(34,211,238,.85)' : 'rgba(59,130,246,.35)';
        ctx.fillRect(OX + p[0] * CS + 2, OY + p[1] * CS + 2, CS - 4, CS - 4);
      }
      // 终点路径（金色发光，全部扩展完成后显现）
      const done = reveal >= S.closed.length;
      if (S.found && (done || S.closed.length === 0)) {
        ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 8;
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3;
        ctx.beginPath();
        S.path.forEach(function (ck, i) {
          const p = ck.split(',');
          const x = OX + p[0] * CS + CS / 2, y = OY + p[1] * CS + CS / 2;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke(); ctx.shadowBlur = 0;
      }
      // 起点终点
      ctx.fillStyle = '#4ade80';
      ctx.beginPath(); ctx.arc(OX + S.sx * CS + CS / 2, OY + S.sy * CS + CS / 2, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f87171';
      ctx.beginPath(); ctx.arc(OX + S.gx * CS + CS / 2, OY + S.gy * CS + CS / 2, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a'; ctx.font = 'bold 8px sans-serif';
      ctx.fillText('S', OX + S.sx * CS + 5, OY + S.sy * CS + 11);
      ctx.fillText('G', OX + S.gx * CS + 5, OY + S.gy * CS + 11);
      if (t % 200 > 190) t = 0; // 周期性重放搜索过程
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      if (S.found) {
        ctx.fillText('障碍 ' + den + '%：已扩展 ' + Math.min(reveal, S.closed.length) + ' 格，最短路径 ' + S.path.length + ' 步', 12, 20);
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.fillText('障碍 ' + den + '%：通道封死，A* 诚实报告"无解"', 12, 20);
      }
      cap(ctx, V, '1969 Shakey：f = g + h，机器第一次"先想后动"');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 双足行走与 ZMP：倒立摆的失衡速率 √（g/H)，质心越矮越救不回来
  // 原理：倒立摆 θ'' = (g/H)θ − c(θ + 0.35θ')，稳定条件 H > g/c
  // 不变量：ZMP 落在支撑脚掌内则绿、出界则红；失衡时间常数 τ = √(H/g) 与显示一致
  // 禁忌：摔倒必须是摆角发散的结果，不得随机播放动画；站稳时脚底不得离地滑步
  // 参数质变点：H ≈ 0.82 m——以下摆角发散摔倒（红闪重来），以上稳定行走 */
  AN.zmpWalk = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, th = 0.05, w = 0, fallen = 0, lastH = -1;
    (function loop() {
      const D = (tp && tp.data) || {};
      const H = Math.max(0.4, Math.min(1.6, D.H !== undefined ? D.H : 1.1));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      if (H !== lastH) { th = 0.05; w = 0; fallen = 0; lastH = H; }
      // 倒立摆仿真（控制力度 c=12 固定）
      if (!fallen) {
        for (let s = 0; s < 3; s++) {
          w += ((9.8 / H) * th - 12 * (th + 0.35 * w)) * 0.016;
          th += w * 0.016;
        }
        // 落步冲击：每 50 帧一个小扰动
        if (t % 50 === 0) th += (Math.sin(t * 0.7) * 0.5 + 0.5) * 0.012;
        if (Math.abs(th) > 0.42) fallen = 1;
      } else {
        th += (0.9 * Math.sign(th) - th) * 0.04; // 倒地
        if (t % 160 === 0) { th = 0.05; w = 0; fallen = 0; }
      }
      // 场景：地面与行走者
      const groundY = 190, hipX = 150 + Math.sin(t * 0.04) * 8, hipY = groundY - H * 62;
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(360, groundY); ctx.stroke();
      // 支撑脚（交替）
      const stepPh = Math.floor(t / 50) % 2;
      const footX = hipX + (stepPh ? 16 : -16);
      const swX = hipX + (stepPh ? -14 : 14) + Math.sin(t * 0.25) * 6;
      ctx.fillStyle = 'rgba(34,197,94,.25)';
      ctx.fillRect(footX - 16, groundY - 3, 32, 4);
      // 身体（沿摆角倾斜）
      const topX = hipX + Math.sin(th) * H * 62, topY = hipY - Math.cos(th) * 24;
      ctx.save();
      ctx.translate(hipX, hipY); ctx.rotate(th);
      ctx.strokeStyle = fallen ? '#ef4444' : '#e2e8f0'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -26); ctx.stroke();
      ctx.fillStyle = fallen ? '#ef4444' : '#22d3ee';
      ctx.beginPath(); ctx.arc(0, -34, 7, 0, Math.PI * 2); ctx.fill();
      // 双腿
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(footX - hipX, groundY - hipY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(swX - hipX, groundY - hipY - 6); ctx.stroke();
      ctx.restore();
      // ZMP 点：近似 = 质心投影 + 修正项
      const zmpX = topX + th * 30;
      const inFoot = Math.abs(zmpX - footX) < 15;
      ctx.shadowColor = inFoot ? '#4ade80' : '#ef4444'; ctx.shadowBlur = 10;
      ctx.fillStyle = inFoot ? '#4ade80' : '#ef4444';
      ctx.beginPath(); ctx.arc(Math.max(4, Math.min(356, zmpX)), groundY - 6, 5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('ZMP', Math.max(6, Math.min(340, zmpX - 8)), groundY - 16);
      // 质心标记
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(topX, topY + 14, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('质心', topX + 8, topY + 16);
      if (fallen) {
        ctx.fillStyle = '#ef4444'; ctx.font = 'bold 13px sans-serif';
        ctx.fillText('失衡摔倒！ZMP 冲出了支撑脚掌', 92, 60);
      }
      // 稳定判据条
      const tau = Math.sqrt(H / 9.8);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('质心高 H = ' + H.toFixed(1) + ' m → 失衡时间常数 τ=√(H/g) = ' + tau.toFixed(2) + ' s', 14, 22);
      ctx.fillStyle = H > 0.82 ? '#4ade80' : '#ef4444'; ctx.font = '10px sans-serif';
      ctx.fillText(H > 0.82 ? '稳定区：控制救得回来（扫帚好立）' : '危险区：失衡太快救不回（铅笔难立）', 14, 40);
      // 右侧迷你刻度：H 与临界线
      ctx.fillStyle = '#334155'; ctx.fillRect(322, 60, 10, 120);
      ctx.fillStyle = '#22d3ee'; ctx.fillRect(322, 180 - (H - 0.4) / 1.2 * 120, 10, (H - 0.4) / 1.2 * 120);
      ctx.strokeStyle = '#fde047'; ctx.lineWidth = 1.5;
      const critY = 180 - (0.82 - 0.4) / 1.2 * 120;
      ctx.beginPath(); ctx.moveTo(316, critY); ctx.lineTo(338, critY); ctx.stroke();
      ctx.fillStyle = '#fde047'; ctx.font = '8px sans-serif';
      ctx.fillText('临界 0.82m', 300, critY - 4);
      cap(ctx, V, '行走 = 被精确控制的摔倒：ZMP 不许踏出脚掌（1996 本田 P2）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 达芬奇手术机器人：运动缩放 + 颤抖滤波，主手到器械尖的"缩小镜"
  // 原理：主从缩放——器械位移 = 主手位移 ÷ s，高频颤抖分量被滤除
  // 不变量：器械轨迹形状与主手相似、振幅严格为 1/s；颤抖衰减倍数随 s 增大
  // 禁忌：s=1 时两侧必须同样抖（不许偷偷美化）；器械尖不得超出切口工作区
  // 参数质变点：s=1 时尖端正学着手抖；s≥5 时抖动降到亚毫米，绣花级操作成为可能 */
  AN.surgeryArm = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const handTrail = [], tipTrail = [];
    (function loop() {
      const D = (tp && tp.data) || {};
      const s = Math.max(1, Math.min(10, D.s !== undefined ? D.s : 5));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 主手轨迹：平滑曲线 + 高频颤抖
      const hx = 90 + 42 * Math.sin(t * 0.03) + 18 * Math.sin(t * 0.071);
      const hy = 120 + 30 * Math.sin(t * 0.043 + 1) + 5 * Math.sin(t * 0.9) + 3 * Math.sin(t * 1.7);
      handTrail.push([hx, hy]); if (handTrail.length > 90) handTrail.shift();
      // 左：主手区
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(24, 56, 140, 130);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('医生的手（±2 mm 生理颤抖）', 30, 50);
      ctx.strokeStyle = 'rgba(251,191,36,.7)'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      handTrail.forEach(function (p, i) { if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
      ctx.stroke();
      ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 10;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(hx, hy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // 中：缩放滤波器
      ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 2;
      ctx.strokeRect(178, 96, 42, 48);
      ctx.fillStyle = '#a78bfa'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText('÷' + s, 186, 116);
      ctx.fillStyle = '#94a3b8'; ctx.font = '8px sans-serif';
      ctx.fillText('缩放+滤颤', 180, 134);
      ctx.strokeStyle = '#64748b';
      ctx.beginPath(); ctx.moveTo(164, 120); ctx.lineTo(178, 120); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(220, 120); ctx.lineTo(234, 120); ctx.stroke();
      // 右：器械尖轨迹 = 主手 ÷ s（颤抖同步衰减）
      const cxR = 296, cyR = 120;
      const txp = cxR + (hx - 90) / s, typ = cyR + (hy - 120) / s;
      tipTrail.push([txp, typ]); if (tipTrail.length > 90) tipTrail.shift();
      ctx.strokeStyle = 'rgba(148,163,184,.4)';
      ctx.strokeRect(238, 56, 116, 130);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('器械尖（患者体内）', 248, 50);
      // 切口点
      ctx.strokeStyle = '#f87171'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cxR - 8, cyR); ctx.lineTo(cxR + 8, cyR); ctx.stroke();
      ctx.strokeStyle = 'rgba(34,211,238,.8)'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      tipTrail.forEach(function (p, i) { if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
      ctx.stroke();
      ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 10;
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath(); ctx.arc(txp, typ, 4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // 数值读数
      const tremorOut = 2 / s;
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('缩放比 ' + s + ':1 → 器械尖抖动 ±' + tremorOut.toFixed(1) + ' mm', 60, 210);
      ctx.fillStyle = s >= 5 ? '#4ade80' : '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText(s >= 5 ? '亚毫米级：葡萄皮上缝针成为可能' : s >= 3 ? '明显变稳' : '几乎没帮助——手抖原样传导', 60, 226);
      cap(ctx, V, '2000 达芬奇：位移÷s、颤抖滤掉，医生的手被"变细变稳"');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 群体机器人：只守局部规则的个体，数量过临界后涌现整体图案
  // 原理：涌现——大量个体执行简单局部规则（跟随目标槽位+邻居避让），整体自发成形
  // 不变量：目标槽位构成海星形（5 个顶点轮廓均匀取点）；单体重量可忽略，规则不变
  // 禁忌：不得整体平移摆出形状（每个体必须各自运动汇聚）；数量改变时形状几何不变
  // 参数质变点：个体数 ≈ 40 只——以下海星轮廓破碎无法辨认，以上瞬间"看图识字" */
  AN.swarmBots = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, bots = [], cachedN = -1;
    function starSlots(n) {
      const pts = [];
      const cx = 180, cy = 126, R = 86, r = 36;
      const verts = [];
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 5;
        const rad = i % 2 === 0 ? R : r;
        verts.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]);
      }
      const per = Math.max(1, Math.floor(n / 10));
      for (let e = 0; e < 10; e++) {
        const A = verts[e], B = verts[(e + 1) % 10];
        for (let i = 0; i < per; i++) {
          const f = i / per;
          pts.push([A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f]);
        }
      }
      while (pts.length < n) pts.push([cx, cy]);
      return pts.slice(0, n);
    }
    (function loop() {
      const D = (tp && tp.data) || {};
      const n = Math.max(10, Math.min(200, D.n !== undefined ? D.n : 80));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      if (cachedN !== n) {
        cachedN = n; bots = [];
        const slots = starSlots(n);
        for (let i = 0; i < n; i++) {
          const a = i * 2.39996; // 黄金角撒点
          const rr = 30 + (i % 50) * 3.2;
          bots.push({ x: 180 + rr * Math.cos(a), y: 126 + rr * Math.sin(a), tx: slots[i][0], ty: slots[i][1] });
        }
      }
      // 海星轮廓参考（极淡）
      const slots0 = starSlots(60);
      ctx.strokeStyle = 'rgba(251,191,36,.14)'; ctx.lineWidth = 1;
      ctx.beginPath();
      slots0.forEach(function (p, i) { if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
      ctx.closePath(); ctx.stroke();
      // 个体：朝槽位运动 + 邻居避让 + 小噪声
      bots.forEach(function (b, i) {
        const dx = b.tx - b.x, dy = b.ty - b.y;
        b.x += dx * 0.03 + Math.sin(t * 0.09 + i) * 0.25;
        b.y += dy * 0.03 + Math.cos(t * 0.08 + i * 1.3) * 0.25;
        const nb = bots[(i + 1) % bots.length];
        const ddx = b.x - nb.x, ddy = b.y - nb.y, dd = Math.hypot(ddx, ddy);
        if (dd < 7 && dd > 0.01) { b.x += ddx / dd * 0.5; b.y += ddy / dd * 0.5; }
        const settled = Math.hypot(dx, dy) < 6;
        ctx.shadowColor = settled ? '#fbbf24' : '#22d3ee'; ctx.shadowBlur = settled ? 7 : 4;
        ctx.fillStyle = settled ? '#fbbf24' : '#22d3ee';
        ctx.beginPath(); ctx.arc(b.x, b.y, n > 120 ? 2 : 2.8, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      });
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('个体数 ' + n + ' 只：规则只有"跟邻居、对齐、留空隙"', 14, 20);
      ctx.fillStyle = n < 40 ? '#ef4444' : '#4ade80'; ctx.font = '10px sans-serif';
      ctx.fillText(n < 40 ? '数量太少——海星轮廓拼不出来' : '无人指挥，海星自动浮现（涌现）', 14, 38);
      cap(ctx, V, '2014 哈佛 1024 只 Kilobot：设计规则，而不是设计整体');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 人形机器人与冗余自由度：同一目标，关节越多"够法"越多
  // 原理：平面机械臂逆运动学——n 连杆 n 自由度，任务只需 2 个（x,y），n≥3 出现冗余零空间
  // 不变量：臂展总长 = n × 30 严格守恒；指尖一旦够到目标就黏住（零空间运动不动指尖）
  // 禁忌：不得让 n=1 够到 55 px 外的目标；n=2 不得有肘部自由度（构形唯一）
  // 参数质变点：关节数 3——从"够不着/刚好够到"质变为"指尖不动、肘部仍能绕障" */
  AN.humanoidDof = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const dof = Math.max(1, Math.min(7, D.dof !== undefined ? D.dof : 4));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const seg = 30, baseX = 80, baseY = 150;
      const goalX = baseX + 55, goalY = 96;
      const L = dof * seg;
      const reach = Math.hypot(goalX - baseX, goalY - baseY);
      // 关节角：CCD 迭代 + 零空间摆动
      const angs = [];
      for (let i = 0; i < dof; i++) angs.push(-0.5 + i * 0.3);
      if (L >= reach - 0.5) {
        for (let it = 0; it < 30; it++) {
          for (let j = dof - 1; j >= 0; j--) {
            // 计算 j 关节与末端位置
            let jx = baseX, jy = baseY, a0 = 0;
            for (let q = 0; q < j; q++) { a0 += angs[q]; jx += seg * Math.cos(a0); jy += seg * Math.sin(a0); }
            let ex = jx, ey = jy, ae = a0;
            for (let q = j; q < dof; q++) { ae += angs[q]; ex += seg * Math.cos(ae); ey += seg * Math.sin(ae); }
            const cur = Math.atan2(ey - jy, ex - jx), want = Math.atan2(goalY - jy, goalX - jx);
            let diff = want - cur;
            while (diff > Math.PI) diff -= 2 * Math.PI;
            while (diff < -Math.PI) diff += 2 * Math.PI;
            angs[j] += diff * 0.5;
          }
        }
        // 冗余：n≥3 时叠加零空间摆动（肘部画弧，指尖近似不动，再补一次 CCD 收敛）
        if (dof >= 3) {
          for (let j = 0; j < dof - 1; j++) angs[j] += Math.sin(t * 0.05) * 0.02 * (j + 1);
          for (let it = 0; it < 8; it++) {
            for (let j = dof - 1; j >= 0; j--) {
              let jx = baseX, jy = baseY, a0 = 0;
              for (let q = 0; q < j; q++) { a0 += angs[q]; jx += seg * Math.cos(a0); jy += seg * Math.sin(a0); }
              let ex = jx, ey = jy, ae = a0;
              for (let q = j; q < dof; q++) { ae += angs[q]; ex += seg * Math.cos(ae); ey += seg * Math.sin(ae); }
              const cur = Math.atan2(ey - jy, ex - jx), want = Math.atan2(goalY - jy, goalX - jx);
              let diff = want - cur;
              while (diff > Math.PI) diff -= 2 * Math.PI;
              while (diff < -Math.PI) diff += 2 * Math.PI;
              angs[j] += diff * 0.4;
            }
          }
        }
      } else {
        // 够不着：直直伸向目标
        const dir = Math.atan2(goalY - baseY, goalX - baseX);
        for (let i = 0; i < dof; i++) angs[i] = 0;
        angs[0] = dir;
      }
      // 绘制机械臂
      let px = baseX, py = baseY, pa = 0;
      const joints = [[px, py]];
      for (let i = 0; i < dof; i++) {
        pa += angs[i];
        px += seg * Math.cos(pa); py += seg * Math.sin(pa);
        joints.push([px, py]);
      }
      ctx.strokeStyle = 'rgba(148,163,184,.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(baseX, baseY, L, 0, Math.PI * 2); ctx.stroke();
      // 障碍（冗余演示用）
      ctx.fillStyle = 'rgba(239,68,68,.25)';
      ctx.beginPath(); ctx.arc(baseX + 30, 120, 12, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(baseX + 30, 120, 12, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#ef4444'; ctx.font = '8px sans-serif';
      ctx.fillText('障碍', baseX + 18, 140);
      // 臂杆与关节（发光）
      ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 6;
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(joints[0][0], joints[0][1]);
      for (let i = 1; i < joints.length; i++) ctx.lineTo(joints[i][0], joints[i][1]);
      ctx.stroke();
      ctx.shadowBlur = 0;
      joints.forEach(function (j, i) {
        ctx.fillStyle = i === 0 ? '#94a3b8' : '#fbbf24';
        ctx.beginPath(); ctx.arc(j[0], j[1], i === 0 ? 5 : 3.5, 0, Math.PI * 2); ctx.fill();
      });
      // 目标
      ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 10;
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(goalX, goalY, 7, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(goalX - 10, goalY); ctx.lineTo(goalX + 10, goalY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(goalX, goalY - 10); ctx.lineTo(goalX, goalY + 10); ctx.stroke();
      ctx.shadowBlur = 0;
      // 状态判读
      const errNow = Math.hypot(px - goalX, py - goalY);
      let state, col, cfg;
      if (L < reach - 0.5) { state = '臂展 ' + L + ' < 距离 ' + reach.toFixed(0) + '：够不着'; col = '#ef4444'; cfg = '可行构形 0 种'; }
      else if (dof === 2) { state = '刚好够到：姿势唯一，无法绕障'; col = '#fbbf24'; cfg = '可行构形 ≈ 2 种'; }
      else { state = '冗余！指尖黏住目标，肘部仍可画弧绕障'; col = '#4ade80'; cfg = '可行构形 ∞（零空间）'; }
      ctx.fillStyle = col; ctx.font = 'bold 11px sans-serif';
      ctx.fillText(state, 14, 22);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText(cfg + '，末端误差 ' + errNow.toFixed(1) + ' px', 14, 40);
      // 右侧自由度阶梯
      ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
      ctx.fillText('自由度演进', 268, 70);
      const steps = [[6, '工业臂'], [7, '人手臂'], [27, '人手'], [28, 'Optimus']];
      steps.forEach(function (st, i) {
        const yy = 90 + i * 26;
        ctx.fillStyle = '#334155'; ctx.fillRect(268, yy, 72, 8);
        ctx.fillStyle = dof >= st[0] ? '#a78bfa' : '#475569';
        ctx.fillRect(268, yy, 72 * Math.min(1, st[0] / 28), 8);
        ctx.fillStyle = '#94a3b8'; ctx.font = '8px sans-serif';
        ctx.fillText(st[0] + ' ' + st[1], 268, yy + 18);
      });
      cap(ctx, V, '自由度爆发 = 冗余：同一目标无数种够法，绕障护关节全凭余量');
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
