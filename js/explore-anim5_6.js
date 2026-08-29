/* explore-anim5_6.js — 第三批动画引擎（医学树 · 批次6，11 个专属原理动画） */
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

  /* 随机对照试验：安慰剂组 vs 试验药组，各 20 人 */
  AN.rctTrial = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, P = null, cyc = -1, lastE = -1;
    function newTrial(e) {
      const g = [];
      for (let s = 0; s < 2; s++) {
        const arr = [];
        for (let i = 0; i < 20; i++) {
          const p = 0.45 + (s === 1 ? e / 100 : 0);
          arr.push({ at: 50 + i * 12 + Math.floor(Math.random() * 8), ok: Math.random() < p, done: false });
        }
        g.push(arr);
      }
      return g;
    }
    (function loop() {
      const D = (tp && tp.data) || {};
      const e = Math.max(0, Math.min(40, D.e !== undefined ? D.e : 15));
      const ctx = V.ctx;
      const cycle = Math.floor(t / 560);
      if (cycle !== cyc || e !== lastE || !P) { cyc = cycle; lastE = e; P = newTrial(e); }
      const tt = t % 560;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const cnt = [0, 0];
      const gx = [42, 212];
      const names = ['安慰剂组', '试验药组'];
      for (let s = 0; s < 2; s++) {
        ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
        ctx.fillText(names[s] + '（各 20 人）', gx[s], 32);
        P[s].forEach(function (pt, i) {
          if (!pt.done && tt >= pt.at) pt.done = true;
          const x = gx[s] + (i % 5) * 24, y = 52 + Math.floor(i / 5) * 24;
          if (!pt.done) ctx.fillStyle = '#fbbf24';
          else if (pt.ok) { cnt[s]++; ctx.fillStyle = '#22c55e'; }
          else ctx.fillStyle = '#ef4444';
          ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
        });
      }
      // 治愈率柱
      const frac = [cnt[0] / 20, cnt[1] / 20];
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(30, 202); ctx.lineTo(330, 202); ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(gx[0] + 20, 202 - frac[0] * 52, 44, frac[0] * 52);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(gx[1] + 20, 202 - frac[1] * 52, 44, frac[1] * 52);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText(Math.round(frac[0] * 100) + '%', gx[0] + 32, 196 - frac[0] * 52);
      ctx.fillText(Math.round(frac[1] * 100) + '%', gx[1] + 32, 196 - frac[1] * 52);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('真实疗效 +' + e + '% → 本轮差值 ' + Math.round((frac[1] - frac[0]) * 100) + '%', 20, 16);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText(e === 0 ? '疗效为 0 时两组仍有波动——没有对照就会误判' : '安慰剂组也有约 45% 自愈——对照组把这份"假疗效"扣除', 20, 220);
      cap(ctx, V, '随机分组 + 安慰剂对照：把自愈和偏倚排除在疗效之外');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 麻醉：全麻药堵住突触，痛觉信号传不进大脑 */
  AN.anesthesiaGate = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, flash = 0;
    const pulses = [], decisions = [];
    (function loop() {
      const D = (tp && tp.data) || {};
      const c = Math.max(0, Math.min(100, D.c !== undefined ? D.c : 50));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 神经元通路：感受器 → 突触 → 大脑
      ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(48, 110); ctx.lineTo(158, 110); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(198, 110); ctx.lineTo(290, 110); ctx.stroke();
      // 突触球端
      ctx.strokeStyle = '#c4b5fd'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(166, 110, 9, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(190, 110, 9, Math.PI / 2, Math.PI * 1.5); ctx.stroke();
      // 疼痛刺激源
      ctx.fillStyle = '#f87171';
      ctx.beginPath(); ctx.arc(36, 110, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#f87171'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {
        const a = i * Math.PI * 2 / 5 + t * 0.06;
        ctx.beginPath(); ctx.moveTo(36 + 8 * Math.cos(a), 110 + 8 * Math.sin(a));
        ctx.lineTo(36 + 13 * Math.cos(a), 110 + 13 * Math.sin(a)); ctx.stroke();
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('疼痛刺激', 14, 136);
      ctx.fillText('脊髓突触', 152, 136);
      // 麻醉药分子（浓度越高越多）
      const nm = Math.round(c / 9);
      for (let i = 0; i < nm; i++) {
        const mx = 166 + ((i * 13) % 30) + Math.sin(t * 0.05 + i) * 2;
        const my = 96 + ((i * 17) % 28) + Math.cos(t * 0.04 + i * 2) * 2;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath(); ctx.arc(mx, my, 2.6, 0, Math.PI * 2); ctx.fill();
      }
      if (nm > 0) {
        ctx.fillStyle = '#38bdf8'; ctx.font = '10px sans-serif';
        ctx.fillText('麻醉药分子', 150, 90);
      }
      // 大脑
      const bx = 318, by = 110;
      ctx.fillStyle = flash > 0 ? 'rgba(239,68,68,' + (0.25 + flash / 14 * 0.6) + ')' : '#334155';
      ctx.beginPath(); ctx.ellipse(bx, by, 26, 20, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(bx, by, 26, 20, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
      ctx.fillText('大脑', bx - 10, by + 3);
      if (flash > 8) {
        ctx.fillStyle = '#ef4444'; ctx.font = 'bold 12px sans-serif';
        ctx.fillText('疼！', bx - 10, by - 26);
      }
      // 痛觉脉冲
      if (t % 40 === 0) pulses.push({ x: 48, decided: false, block: false, fade: 0 });
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        if (p.fade > 0) {
          p.fade--;
          ctx.strokeStyle = 'rgba(56,189,248,' + p.fade / 12 + ')'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(160, 104); ctx.lineTo(170, 116); ctx.moveTo(170, 104); ctx.lineTo(160, 116); ctx.stroke();
          if (p.fade <= 0) pulses.splice(i, 1);
          continue;
        }
        p.x += 2.2;
        if (!p.decided && p.x >= 160) {
          p.decided = true;
          p.block = Math.random() < c / 100;
          decisions.push(p.block ? 0 : 1);
          if (decisions.length > 40) decisions.shift();
          if (p.block) { p.fade = 12; continue; }
        }
        if (p.x >= 292) { flash = 14; pulses.splice(i, 1); continue; }
        ctx.fillStyle = '#f87171';
        ctx.beginPath(); ctx.arc(p.x, 110, 4, 0, Math.PI * 2); ctx.fill();
      }
      if (flash > 0) flash--;
      let sum = 0;
      decisions.forEach(function (d) { sum += d; });
      const rate = decisions.length ? Math.round(sum / decisions.length * 100) : 100;
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('麻醉药浓度 ' + c + '% → 痛觉信号通过率约 ' + rate + '%', 20, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('GABA 抑制性受体被增强，突触"闸门"关闭', 100, 156);
      cap(ctx, V, '不是不痛，是信号传不进大脑皮层（1846 乙醚）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 消毒：喷雾杀灭细菌，残菌会指数繁殖 */
  AN.antisepsis = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, bugs = [], cyc = -1, lastS = -1;
    const CX = 150, CY = 122, R = 82;
    function reset() {
      bugs = [];
      for (let i = 0; i < 60; i++) {
        const r = R * 0.92 * Math.sqrt(Math.random()), a = Math.random() * Math.PI * 2;
        bugs.push({ x: CX + r * Math.cos(a), y: CY + r * Math.sin(a), alive: true, tested: false });
      }
    }
    reset();
    (function loop() {
      const D = (tp && tp.data) || {};
      const s = Math.max(0, Math.min(99, D.s !== undefined ? D.s : 70));
      const ctx = V.ctx;
      const cycle = Math.floor(t / 720);
      if (cycle !== cyc || s !== lastS) { cyc = cycle; lastS = s; reset(); }
      const tt = t % 720;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 培养皿
      ctx.fillStyle = 'rgba(51,65,85,.55)';
      ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('术野（培养皿）', CX - 34, CY + R + 16);
      // 消毒喷雾带
      let phase = '消毒喷雾扫过…';
      if (tt >= 60 && tt < 150) {
        const bandX = CX - R + (tt - 60) / 90 * R * 2;
        ctx.fillStyle = 'rgba(56,189,248,.18)';
        ctx.fillRect(bandX - 14, CY - R, 28, R * 2);
        ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(bandX, CY - R); ctx.lineTo(bandX, CY + R); ctx.stroke();
        ctx.fillStyle = '#38bdf8'; ctx.font = '10px sans-serif';
        ctx.fillText('石炭酸喷雾', Math.max(8, bandX - 30), CY - R - 6);
        bugs.forEach(function (b) {
          if (b.alive && !b.tested && bandX >= b.x) {
            b.tested = true;
            if (Math.random() < s / 100) b.alive = false;
          }
        });
      } else if (tt >= 150) {
        phase = '残菌繁殖：每过一阵数量翻倍';
        if (tt % 40 === 0 && bugs.length < 300) {
          const adds = [];
          bugs.forEach(function (b) {
            if (b.alive && bugs.length + adds.length < 300) {
              adds.push({ x: b.x + Math.random() * 12 - 6, y: b.y + Math.random() * 12 - 6, alive: true, tested: true });
            }
          });
          adds.forEach(function (b) { bugs.push(b); });
        }
      } else {
        phase = '消毒前：细菌遍布';
      }
      // 细菌
      let aliveN = 0;
      bugs.forEach(function (b, i) {
        if (b.alive) {
          aliveN++;
          ctx.fillStyle = '#4ade80';
          ctx.beginPath(); ctx.arc(b.x, b.y, 2.6, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = 'rgba(74,222,128,.6)'; ctx.lineWidth = 1;
          const a = t * 0.1 + i;
          ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + 4 * Math.cos(a), b.y + 4 * Math.sin(a)); ctx.stroke();
        } else {
          ctx.fillStyle = 'rgba(100,116,139,.55)';
          ctx.beginPath(); ctx.arc(b.x, b.y, 2, 0, Math.PI * 2); ctx.fill();
        }
      });
      // 状态
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('消毒强度 ' + s + '% · 活菌 ' + aliveN, 20, 20);
      ctx.fillStyle = aliveN > 100 ? '#ef4444' : '#22c55e'; ctx.font = '10px sans-serif';
      ctx.fillText(phase + (aliveN > 100 ? '（感染风险高！）' : ''), 248, 60);
      cap(ctx, V, '漏网的残菌会指数繁殖——消毒必须彻底（1867 李斯特）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* X 射线：电子轰击钨靶，骨骼吸收强留下影像 */
  AN.xrayTube = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const eles = [], photons = [];
    const cols = new Array(110);
    for (let i = 0; i < 110; i++) cols[i] = 0;
    // 手部几何
    const fingers = [[230, 100, 8, 30], [241, 94, 8, 36], [252, 96, 8, 34], [263, 102, 8, 28]];
    const bones = [[232, 102, 4, 26], [243, 96, 4, 32], [254, 98, 4, 30], [265, 104, 4, 24]];
    const palmBones = [[236, 142, 5, 20], [247, 144, 5, 20], [258, 142, 5, 20]];
    const ring = { x: 254, y: 116, r: 6 };
    function inSoft(x, y) {
      const dx = (x - 247) / 24, dy = (y - 162) / 28;
      if (dx * dx + dy * dy <= 1) return true;
      for (let i = 0; i < fingers.length; i++) {
        const f = fingers[i];
        if (x >= f[0] && x <= f[0] + f[2] && y >= f[1] && y <= f[1] + f[3]) return true;
      }
      return false;
    }
    function inBone(x, y) {
      const dr = Math.hypot(x - ring.x, y - ring.y);
      if (dr > ring.r - 2 && dr < ring.r) return 2; // 金戒指，全吸收
      const all = bones.concat(palmBones);
      for (let i = 0; i < all.length; i++) {
        const b = all[i];
        if (x >= b[0] && x <= b[0] + b[2] && y >= b[1] && y <= b[1] + b[3]) return 1;
      }
      return 0;
    }
    (function loop() {
      const D = (tp && tp.data) || {};
      const kv = Math.max(40, Math.min(120, D.kv !== undefined ? D.kv : 70));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const kf = (130 - kv) / 90; // 电压越高衰减系数越小
      // X 射线管
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.strokeRect(20, 40, 160, 40);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('X 射线管（真空）', 55, 32);
      ctx.fillStyle = '#64748b';
      ctx.beginPath(); ctx.arc(32, 60, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '9px sans-serif';
      ctx.fillText('阴极', 22, 92);
      ctx.fillStyle = '#a8a29e';
      ctx.beginPath(); ctx.moveTo(158, 46); ctx.lineTo(172, 52); ctx.lineTo(172, 74); ctx.lineTo(158, 66); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('钨靶', 158, 92);
      // 电子
      if (Math.random() < 0.6) eles.push({ x: 40, y: 52 + Math.random() * 16 });
      const evx = 1.2 + (kv - 40) / 80 * 2.4;
      for (let i = eles.length - 1; i >= 0; i--) {
        const e = eles[i];
        e.x += evx;
        if (e.x >= 156) {
          eles.splice(i, 1);
          for (let q = 0; q < 2; q++) {
            const a = Math.atan2(90, 85) + (Math.random() - 0.5) * 0.36;
            photons.push({ x: 168, y: 66, vx: Math.cos(a) * 3.2, vy: Math.sin(a) * 3.2 });
          }
          ctx.fillStyle = 'rgba(253,224,71,.8)';
          ctx.beginPath(); ctx.arc(160, 60, 5, 0, Math.PI * 2); ctx.fill();
          continue;
        }
        ctx.fillStyle = '#fde047';
        ctx.beginPath(); ctx.arc(e.x, e.y, 2, 0, Math.PI * 2); ctx.fill();
      }
      // 手（软组织轮廓 + 骨骼 + 戒指）
      ctx.fillStyle = 'rgba(148,163,184,.25)';
      ctx.beginPath(); ctx.ellipse(247, 162, 24, 28, 0, 0, Math.PI * 2); ctx.fill();
      fingers.forEach(function (f) {
        ctx.fillRect(f[0], f[1], f[2], f[3]);
      });
      ctx.fillStyle = 'rgba(226,232,240,.8)';
      bones.concat(palmBones).forEach(function (b) {
        ctx.fillRect(b[0], b[1], b[2], b[3]);
      });
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('手（骨骼+戒指）', 220, 88);
      // 光子
      for (let i = photons.length - 1; i >= 0; i--) {
        const p = photons[i];
        p.x += p.vx; p.y += p.vy;
        const bone = inBone(p.x, p.y);
        let pa = 0;
        if (bone === 2) pa = 0.5;
        else if (bone === 1) pa = 0.16 * kf;
        else if (inSoft(p.x, p.y)) pa = 0.05 * kf;
        if (pa > 0 && Math.random() < pa) { photons.splice(i, 1); continue; }
        if (p.y >= 205) {
          const col = Math.round(p.x - 195);
          if (col >= 0 && col < 110) cols[col] += 1;
          photons.splice(i, 1); continue;
        }
        if (p.x > 360 || p.y > 240) { photons.splice(i, 1); continue; }
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2); ctx.fill();
      }
      if (photons.length > 500) photons.splice(0, photons.length - 500);
      // 底片（实时显影，随电压慢慢重新显影）
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
      ctx.strokeRect(195, 205, 110, 10);
      for (let i = 0; i < 110; i++) {
        cols[i] *= 0.995;
        const v = Math.min(0.95, cols[i] * 0.12);
        if (v > 0.03) {
          ctx.fillStyle = 'rgba(248,250,252,' + v + ')';
          ctx.fillRect(195 + i, 205, 1, 10);
        }
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('底片（实时显影）', 210, 228);
      // 对比度
      const tSoft = Math.exp(-0.05 * kf * 22), tBone = Math.exp(-0.16 * kf * 22);
      const contrast = Math.max(0, Math.round((tSoft - tBone) / tSoft * 100));
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('管电压 ' + kv + ' kV → 穿透强、骨肉对比度 ≈ ' + contrast + '%', 20, 20);
      cap(ctx, V, '骨骼吸收强、软组织弱：密度差变成底片上的明暗差');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* ABO 血型：受血者 A 型，输错血型发生凝集 */
  AN.bloodType = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, lastD = -1;
    const recipients = [], donors = [];
    const flags = [['', ''], ['#fde047', ''], ['', '#38bdf8'], ['#fde047', '#38bdf8']];
    const tnames = ['O 型', 'A 型', 'B 型', 'AB 型'];
    for (let i = 0; i < 9; i++) recipients.push({ x: i * 42, y: 84 + (i % 3) * 20 });
    function drawCell(ctx, x, y, f1, f2, dark) {
      ctx.fillStyle = dark ? '#7f1d1d' : '#dc2626';
      ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.25)';
      ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
      if (f1) {
        ctx.fillStyle = f1;
        ctx.beginPath(); ctx.moveTo(x - 4, y - 8); ctx.lineTo(x - 4, y - 15); ctx.lineTo(x + 1, y - 11); ctx.closePath(); ctx.fill();
      }
      if (f2) {
        ctx.fillStyle = f2;
        ctx.beginPath(); ctx.moveTo(x + 4, y - 8); ctx.lineTo(x + 4, y - 15); ctx.lineTo(x + 9, y - 11); ctx.closePath(); ctx.fill();
      }
    }
    (function loop() {
      const D = (tp && tp.data) || {};
      const d = Math.max(0, Math.min(3, Math.round(D.d !== undefined ? D.d : 2)));
      const ctx = V.ctx;
      if (d !== lastD) { lastD = d; donors.length = 0; }
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const comp = (d === 0 || d === 1); // 受血者 A 型：O、A 相容
      // 血管
      ctx.fillStyle = 'rgba(127,29,29,.35)';
      ctx.fillRect(0, 66, 360, 84);
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 66); ctx.lineTo(360, 66); ctx.moveTo(0, 150); ctx.lineTo(360, 150); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('血管 →', 6, 60);
      let stuck = 0;
      donors.forEach(function (dn) { if (dn.stuck) stuck++; });
      const flow = comp ? 1 : Math.max(0.15, 1 - stuck * 0.09);
      // 抗 B 抗体（Y 形）
      for (let i = 0; i < 7; i++) {
        const ax = (t * 0.5 * flow + i * 55) % 380 - 10;
        const ay = 76 + (i * 29) % 66;
        ctx.strokeStyle = 'rgba(147,197,253,.8)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(ax, ay + 5); ctx.lineTo(ax, ay);
        ctx.lineTo(ax - 4, ay - 5); ctx.moveTo(ax, ay); ctx.lineTo(ax + 4, ay - 5); ctx.stroke();
      }
      ctx.fillStyle = '#93c5fd'; ctx.font = '10px sans-serif';
      ctx.fillText('抗 B 抗体', 300, 60);
      // 受血者 A 型红细胞
      recipients.forEach(function (r) {
        r.x += 0.5 * flow;
        if (r.x > 370) r.x = -10;
        drawCell(ctx, r.x, r.y, '#fde047', null, false);
      });
      // 供血者红细胞
      if (t % 38 === 0 && donors.length < 30) {
        donors.push({ x: -10, y: 76 + Math.random() * 66, stuck: false, anchor: null, life: 1000 });
      }
      for (let i = donors.length - 1; i >= 0; i--) {
        const dn = donors[i];
        dn.life--;
        if (dn.life <= 0) { donors.splice(i, 1); continue; }
        if (comp) {
          dn.x += 0.5;
          if (dn.x > 370) { donors.splice(i, 1); continue; }
        } else {
          if (!dn.stuck) {
            dn.x += 0.5 * flow;
            if (dn.x > 150) {
              dn.stuck = true;
              dn.anchor = [185 + (i % 3) * 46, 92 + (i % 2) * 26];
            }
          } else {
            dn.x += (dn.anchor[0] - dn.x) * 0.04;
            dn.y += (dn.anchor[1] - dn.y) * 0.04;
          }
        }
        const f = flags[d];
        drawCell(ctx, dn.x, dn.y, f[0] || null, f[1] || null, dn.stuck);
      }
      // 凝集提示连线
      if (!comp && stuck > 1) {
        ctx.strokeStyle = 'rgba(147,197,253,.4)'; ctx.lineWidth = 1;
        const st = donors.filter(function (dn) { return dn.stuck; });
        for (let i = 1; i < st.length; i++) {
          if (Math.abs(st[i].x - st[i - 1].x) < 60) {
            ctx.beginPath(); ctx.moveTo(st[i - 1].x, st[i - 1].y); ctx.lineTo(st[i].x, st[i].y); ctx.stroke();
          }
        }
      }
      // 文字
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('受血者：A 型（黄旗抗原，血清含抗 B 抗体）', 12, 20);
      ctx.fillText('供血者：' + tnames[d], 12, 38);
      ctx.fillStyle = comp ? '#22c55e' : '#ef4444';
      ctx.font = 'bold 12px sans-serif';
      if (comp) ctx.fillText('相容：顺利输注 ✓', 240, 38);
      else if (stuck > 2 && Math.floor(t / 20) % 2 === 0) ctx.fillText('凝集反应！血管堵塞', 220, 38);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('旗子 = 红细胞表面抗原（黄 A / 蓝 B）', 12, 172);
      cap(ctx, V, '抗 B 抗体抓住带 B 抗原的红细胞 → 凝集、溶血');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 胰岛素：钥匙打开 GLUT4 通道，葡萄糖进入细胞 */
  AN.insulinKey = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const gluc = [];
    const cellX = [55, 155, 255], cellW = 70, cellTop = 132, cellBot = 208;
    const gateG = [0, 0, 0], cellE = [0, 0, 0];
    (function loop() {
      const D = (tp && tp.data) || {};
      const ins = Math.max(0, Math.min(100, D.ins !== undefined ? D.ins : 60));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 血管
      ctx.fillStyle = 'rgba(127,29,29,.4)';
      ctx.fillRect(0, 45, 360, 55);
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 45); ctx.lineTo(360, 45); ctx.moveTo(0, 100); ctx.lineTo(360, 100); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('血管（血糖）', 6, 40);
      // 细胞与膜上 GLUT4 通道
      for (let i = 0; i < 3; i++) {
        gateG[i] += (ins / 100 - gateG[i]) * 0.04;
        cellE[i] *= 0.97;
        const x = cellX[i];
        ctx.fillStyle = 'rgba(251,191,36,' + (0.08 + cellE[i] / 30 * 0.25) + ')';
        ctx.fillRect(x, cellTop, cellW, cellBot - cellTop);
        ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 2;
        ctx.strokeRect(x, cellTop, cellW, cellBot - cellTop);
        ctx.fillStyle = '#a78bfa';
        ctx.beginPath(); ctx.arc(x + cellW / 2, cellTop + 46, 7, 0, Math.PI * 2); ctx.fill();
        const gx = x + cellW / 2 - 8;
        const open = gateG[i];
        ctx.strokeStyle = open > 0.5 ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(gx, cellTop); ctx.lineTo(gx, cellTop - 9 * open); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(gx + 16, cellTop); ctx.lineTo(gx + 16, cellTop - 9 * open); ctx.stroke();
        if (open < 0.3) {
          ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(gx, cellTop - 2); ctx.lineTo(gx + 16, cellTop - 8); ctx.stroke();
        }
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('GLUT4 通道', 55, 120);
      ctx.fillText('肌肉/脂肪细胞', 150, 224);
      // 胰岛素钥匙
      const nIns = Math.round(ins / 13);
      for (let i = 0; i < nIns; i++) {
        const kx = (t * 0.4 + i * 360 / Math.max(1, nIns)) % 360;
        const ky = 56 + (i * 17) % 36;
        ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(kx, ky, 3, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(kx + 3, ky); ctx.lineTo(kx + 8, ky); ctx.stroke();
      }
      if (nIns > 0) {
        ctx.fillStyle = '#38bdf8'; ctx.font = '10px sans-serif';
        ctx.fillText('胰岛素', 302, 40);
      }
      // 葡萄糖
      if (t % 14 === 0 && gluc.length < 70) gluc.push({ x: Math.random() * 350 + 5, y: 55 + Math.random() * 36, in: false, ci: 0 });
      let bloodN = 0;
      for (let i = gluc.length - 1; i >= 0; i--) {
        const g = gluc[i];
        if (!g.in) {
          g.x += 0.35;
          if (g.x > 356) g.x = 4;
          for (let c = 0; c < 3; c++) {
            const gx = cellX[c] + cellW / 2;
            if (gateG[c] > 0.55 && Math.abs(g.x - gx) < 9 && Math.random() < 0.08) { g.in = true; g.ci = c; break; }
          }
          bloodN++;
        } else {
          g.y += 1.1;
          if (g.y > cellTop + 34) {
            cellE[g.ci] = Math.min(30, cellE[g.ci] + 6);
            gluc.splice(i, 1); continue;
          }
        }
        ctx.fillStyle = '#fde047';
        ctx.beginPath(); ctx.arc(g.x, g.y, 3, 0, Math.PI * 2); ctx.fill();
      }
      // 血糖仪
      const bg = 70 + bloodN * 6;
      const bgC = bg < 140 ? '#22c55e' : bg < 220 ? '#fbbf24' : '#ef4444';
      ctx.fillStyle = 'rgba(148,163,184,.3)'; ctx.fillRect(334, 108, 14, 100);
      const lvl = Math.min(1, (bg - 70) / 250);
      ctx.fillStyle = bgC; ctx.fillRect(334, 208 - lvl * 100, 14, lvl * 100);
      ctx.fillStyle = bgC; ctx.font = 'bold 10px sans-serif';
      ctx.fillText(Math.round(bg), 326, 222);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('mg/dL', 324, 233);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      const openPct = Math.round((gateG[0] + gateG[1] + gateG[2]) / 3 * 100);
      ctx.fillText('胰岛素 ' + ins + '% → GLUT4 通道开放 ' + openPct + '%', 20, 20);
      if (ins === 0) {
        ctx.fillStyle = '#ef4444'; ctx.font = '10px sans-serif';
        ctx.fillText('1 型糖尿病：钥匙没了，糖堵在血里、细胞挨饿', 110, 126);
      }
      cap(ctx, V, '胰岛素是钥匙：打开 GLUT4 通道，葡萄糖才能进细胞');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 血液透析：半透膜两侧逆流，尿素顺浓度差渗出 */
  AN.dialysis = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const ureaB = [], ureaD = [], proteins = [];
    let S = 0, Rem = 0;
    (function loop() {
      const D = (tp && tp.data) || {};
      const f = Math.max(10, Math.min(100, D.f !== undefined ? D.f : 60));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const vd = 0.4 + f / 100 * 2.2;
      // 血液通道（上）与透析液通道（下），半透膜隔开
      ctx.fillStyle = 'rgba(127,29,29,.4)'; ctx.fillRect(30, 50, 300, 62);
      ctx.fillStyle = 'rgba(30,58,138,.4)'; ctx.fillRect(30, 128, 300, 62);
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
      ctx.strokeRect(30, 50, 300, 62); ctx.strokeRect(30, 128, 300, 62);
      ctx.setLineDash([3, 4]); ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(30, 120); ctx.lineTo(330, 120); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#fbbf24'; ctx.font = '10px sans-serif';
      ctx.fillText('半透膜（只放行小分子）', 116, 44);
      ctx.fillStyle = '#fca5a5';
      ctx.fillText('含毒血液 →', 36, 66);
      ctx.fillText('→ 洁净血液', 264, 66);
      ctx.fillStyle = '#93c5fd';
      ctx.fillText('← 含毒废液', 4, 208);
      ctx.fillText('新鲜透析液 ←', 258, 208);
      // 透析液各段的尿素浓度（12 个 bin）
      const bins = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      ureaD.forEach(function (u) {
        const b = Math.floor((u.x - 30) / 25);
        if (b >= 0 && b < 12) bins[b]++;
      });
      // 新血（含尿素）从左侧进入
      if (t % 9 === 0 && ureaB.length < 90) { ureaB.push({ x: 32, y: 56 + Math.random() * 50 }); S += 1; }
      if (t % 26 === 0 && proteins.length < 20) proteins.push({ x: 32, y: 58 + Math.random() * 46 });
      S *= 0.998; Rem *= 0.998;
      // 血液中的尿素：顺局部浓度差跨膜
      for (let i = ureaB.length - 1; i >= 0; i--) {
        const u = ureaB[i];
        u.x += 1.1;
        const b = Math.floor((u.x - 30) / 25);
        const grad = b >= 0 && b < 12 ? Math.max(0, 1 - bins[b] / 5) : 0;
        if (Math.random() < 0.035 * grad) {
          ureaB.splice(i, 1);
          ureaD.push({ x: u.x, y: 132 + Math.random() * 52 });
          continue;
        }
        if (u.x > 328) { ureaB.splice(i, 1); Rem += 1; continue; }
        ctx.fillStyle = '#fde047';
        ctx.beginPath(); ctx.arc(u.x, u.y, 2.2, 0, Math.PI * 2); ctx.fill();
      }
      // 透析液中的尿素被逆流冲走
      for (let i = ureaD.length - 1; i >= 0; i--) {
        const u = ureaD[i];
        u.x -= vd;
        if (u.x < 34) { ureaD.splice(i, 1); continue; }
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(u.x, u.y, 2.2, 0, Math.PI * 2); ctx.fill();
      }
      // 蛋白质被截留
      for (let i = proteins.length - 1; i >= 0; i--) {
        const p = proteins[i];
        p.x += 1.1;
        if (p.x > 326) { proteins.splice(i, 1); continue; }
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2); ctx.fill();
      }
      // 膜上扩散箭头：浓度差大的地方通量大
      [90, 180, 270].forEach(function (ax) {
        const b = Math.floor((ax - 30) / 25);
        const grad = Math.max(0, 1 - bins[b] / 5);
        ctx.fillStyle = 'rgba(251,191,36,' + (0.15 + grad * 0.75) + ')';
        ctx.beginPath(); ctx.moveTo(ax - 5, 108); ctx.lineTo(ax + 5, 108); ctx.lineTo(ax, 117); ctx.closePath(); ctx.fill();
      });
      const clr = S > 8 ? Math.max(0, Math.min(1, 1 - Rem / S)) : -1;
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('透析液流速 ' + f + '% → 出口血液尿素清除率 ≈ ' + (clr < 0 ? '…' : Math.round(clr * 100) + '%'), 20, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('黄点=尿素（小分子）  红点=蛋白质（截留）', 20, 222);
      cap(ctx, V, '菲克定律：通量 ∝ 浓度差——逆流让梯度全程拉满');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 超声成像：回波时间换深度，频率换分辨率与穿透 */
  AN.ultrasoundScan = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    let img = [];
    const cyst = { x: 190, y: 140, r: 20 };
    (function loop() {
      const D = (tp && tp.data) || {};
      const f = Math.max(2, Math.min(15, D.f !== undefined ? D.f : 5));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const att = f * 0.0011;
      // 探头与皮肤
      ctx.fillStyle = '#334155'; ctx.fillRect(56, 28, 248, 16);
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5; ctx.strokeRect(56, 28, 248, 16);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('探头（压电阵元）', 132, 22);
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(40, 45); ctx.lineTo(320, 45); ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('皮肤', 326, 49);
      // 逐线扫描：每帧一条声束，回波立即落成一行像素
      const sweep = t % 260;
      if (sweep === 0) img = [];
      const bx = 50 + sweep;
      function echo(y, amp) { img.push({ x: bx, y: y, b: amp }); }
      const dx = bx - cyst.x;
      if (Math.abs(dx) < cyst.r) {
        const dy = Math.sqrt(cyst.r * cyst.r - dx * dx);
        echo(cyst.y - dy, 0.95 * Math.exp(-att * (cyst.y - dy - 45)));
        echo(cyst.y + dy, 0.85 * Math.exp(-att * (cyst.y + dy - 45)));
      }
      echo(195, 1.2 * Math.exp(-att * 150));
      for (let k = 0; k < 3; k++) {
        const sy = 50 + Math.random() * 155;
        echo(sy, Math.random() * 0.25 * Math.exp(-att * (sy - 45)));
      }
      if (img.length > 4500) img.splice(0, img.length - 4500);
      // 已重建的图像
      const ps = 3.4 - f / 15 * 2.4;
      img.forEach(function (p) {
        ctx.fillStyle = 'rgba(186,230,253,' + Math.min(1, p.b) + ')';
        ctx.fillRect(p.x - ps / 2, p.y - ps / 2, ps, ps);
      });
      // 当前声束与下行脉冲
      ctx.strokeStyle = 'rgba(34,211,238,.25)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(bx, 45); ctx.lineTo(bx, 210); ctx.stroke();
      const pd = 45 + (t * 5) % 165;
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath(); ctx.arc(bx, pd, 3, 0, Math.PI * 2); ctx.fill();
      // 标注
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('囊肿', 216, 124);
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(214, 126); ctx.lineTo(206, 134); ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('骨骼界面', 252, 192);
      const deepAmp = Math.round(Math.exp(-att * 150) * 100);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('频率 ' + f + ' MHz → 深部回波剩 ' + deepAmp + '%' + (f >= 11 ? '（清晰但穿不深）' : f <= 4 ? '（穿深但图像粗糙）' : '（折中）'), 14, 20);
      cap(ctx, V, 'd = ct/2：回波时间换成深度；频率越高越清晰、越穿不深');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 心脏起搏器：传导阻滞时按需补发电脉冲 */
  AN.pacemaker = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    let nextNat = 60, lastBeat = -100, pendBeat = -1, squeeze = 0;
    let saFlash = 0, avBlock = 0, led = 0, spark = -1;
    let beatT = -1, beatPaced = false, nNat = 0, nPaced = 0;
    const ecg = [];
    for (let i = 0; i < 320; i++) ecg.push(0);
    const shapeN = [0, -2, 3, 12, 22, -9, -4, 0, 1, 3, 4, 3, 1, 0, 0, 0, 0, 0, 0, 0];
    const shapeP = [18, 4, -5, 8, 15, 18, 12, 4, -2, -5, -3, -1, 0, 0, 0, 0, 0, 0, 0, 0];
    const P0 = [86, 74], P1 = [150, 44], P2 = [200, 148];
    function bez(p) {
      const u = 1 - p;
      return [u * u * P0[0] + 2 * u * p * P1[0] + p * p * P2[0],
              u * u * P0[1] + 2 * u * p * P1[1] + p * p * P2[1]];
    }
    (function loop() {
      const D = (tp && tp.data) || {};
      const blk = Math.max(0, Math.min(100, D.blk !== undefined ? D.blk : 70));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 窦房结每 62 帧发起一次冲动
      if (t >= nextNat) {
        nextNat += 62;
        saFlash = 8;
        if (Math.random() * 100 >= blk) pendBeat = t + 8;
        else avBlock = 10;
      }
      if (pendBeat >= 0 && t >= pendBeat) {
        pendBeat = -1;
        lastBeat = t; beatT = 0; beatPaced = false; squeeze = 1; nNat++;
      }
      // 起搏器看门狗：漏搏超时 → 补发脉冲
      if (t - lastBeat > 95) {
        lastBeat = t; beatT = 0; beatPaced = true; squeeze = 1; nPaced++;
        led = 8; spark = 0;
      }
      // 心电采样
      let sample = 0;
      if (beatT >= 0) {
        sample = (beatPaced ? shapeP : shapeN)[beatT] || 0;
        beatT++;
        if (beatT >= 20) beatT = -1;
      }
      ecg.push(sample); ecg.shift();
      squeeze *= 0.92;
      if (saFlash > 0) saFlash--;
      if (avBlock > 0) avBlock--;
      if (led > 0) led--;
      // 心脏
      const vsq = 1 - 0.16 * squeeze;
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath(); ctx.ellipse(200, 122, 42 * vsq, 36 * vsq, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(200, 122, 42 * vsq, 36 * vsq, 0, 0, Math.PI * 2); ctx.stroke();
      const asq = 1 - 0.2 * (saFlash / 8);
      ctx.fillStyle = '#991b1b';
      ctx.beginPath(); ctx.ellipse(200, 66, 28 * asq, 14 * asq, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#f87171'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(200, 66, 28 * asq, 14 * asq, 0, 0, Math.PI * 2); ctx.stroke();
      // 窦房结 / 房室结
      ctx.fillStyle = saFlash > 0 ? '#fde047' : '#a16207';
      ctx.beginPath(); ctx.arc(222, 56, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('窦房结', 230, 52);
      ctx.fillStyle = avBlock > 0 ? '#ef4444' : '#22c55e';
      ctx.beginPath(); ctx.arc(200, 92, 4, 0, Math.PI * 2); ctx.fill();
      if (avBlock > 0) {
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(193, 85); ctx.lineTo(207, 99); ctx.moveTo(207, 85); ctx.lineTo(193, 99); ctx.stroke();
      }
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('房室结', 210, 96);
      ctx.fillText('心房', 242, 70);
      ctx.fillText('心室', 246, 124);
      // 起搏器与电极导线
      ctx.fillStyle = '#1e293b'; ctx.fillRect(30, 58, 56, 32);
      ctx.strokeStyle = led > 0 ? '#fde047' : '#94a3b8'; ctx.lineWidth = 2;
      ctx.strokeRect(30, 58, 56, 32);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
      ctx.fillText('起搏器', 40, 72);
      ctx.fillStyle = led > 0 ? '#fde047' : '#475569';
      ctx.beginPath(); ctx.arc(76, 82, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(P0[0], P0[1]); ctx.quadraticCurveTo(P1[0], P1[1], P2[0], P2[1]); ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('电极导线', 116, 42);
      if (spark >= 0) {
        const bp = bez(spark / 6);
        ctx.fillStyle = '#fde047';
        ctx.beginPath(); ctx.arc(bp[0], bp[1], 3.5, 0, Math.PI * 2); ctx.fill();
        spark++;
        if (spark > 6) spark = -1;
      }
      // 心电监护
      ctx.strokeStyle = 'rgba(148,163,184,.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(20, 216); ctx.lineTo(340, 216); ctx.stroke();
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 320; i++) {
        const y = 216 - ecg[i] * 1.1;
        if (i === 0) ctx.moveTo(20 + i, y); else ctx.lineTo(20 + i, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('心电监护（尖刺=起搏脉冲）', 236, 208);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('传导阻滞 ' + blk + '% → 自身搏动 ' + nNat + ' 次 · 起搏补发 ' + nPaced + ' 次', 14, 16);
      cap(ctx, V, '漏搏超过时限就补一枪——按需起搏，心率不再掉线');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* CT 扫描：多角度投影 + 反投影重建断层 */
  AN.ctScan = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const C = [92, 128], R = 58;
    const blobs = [[70, 108, 12], [118, 148, 9]];
    const NB = 21, G = 26, RX = 208, RY = 52, CS = 4.6;
    let acc = null, projCount = 0, hold = 0, lastN = -1, curTheta = 0;
    function density(x, y) {
      for (let i = 0; i < 2; i++) {
        const dx = x - blobs[i][0], dy = y - blobs[i][1];
        if (dx * dx + dy * dy < blobs[i][2] * blobs[i][2]) return 1;
      }
      const ddx = x - C[0], ddy = y - C[1];
      if (ddx * ddx + ddy * ddy < R * R) return 0.25;
      return 0;
    }
    (function loop() {
      const D = (tp && tp.data) || {};
      const n = Math.max(4, Math.min(120, D.n !== undefined ? D.n : 60));
      const ctx = V.ctx;
      if (n !== lastN) { lastN = n; acc = null; projCount = 0; hold = 0; }
      if (!acc) {
        acc = [];
        for (let i = 0; i < G; i++) acc.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      }
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 每 4 帧增加一个投影角度
      if (hold > 0) {
        hold--;
        if (hold === 0) { acc = null; projCount = 0; }
      } else if (t % 4 === 0 && projCount < n) {
        const th = projCount / n * Math.PI;
        curTheta = th;
        const dir = [Math.cos(th), Math.sin(th)], perp = [-Math.sin(th), Math.cos(th)];
        // 该角度的投影（21 个探测器 bin）
        const p = [];
        for (let b = 0; b < NB; b++) {
          const s = (-1 + 2 * b / (NB - 1)) * R;
          let sum = 0;
          for (let q = -R; q <= R; q += 3) {
            sum += density(C[0] + s * perp[0] + q * dir[0], C[1] + s * perp[1] + q * dir[1]);
          }
          p.push(sum);
        }
        // 反投影：把投影沿该角度涂回 26×26 网格
        for (let i = 0; i < G; i++) {
          for (let j = 0; j < G; j++) {
            const cx = (i - (G - 1) / 2) / ((G - 1) / 2);
            const cy = (j - (G - 1) / 2) / ((G - 1) / 2);
            if (cx * cx + cy * cy > 1) continue;
            const s = cx * perp[0] + cy * perp[1];
            let b = Math.round((s + 1) / 2 * (NB - 1));
            if (b < 0) b = 0; if (b > NB - 1) b = NB - 1;
            acc[i][j] += p[b];
          }
        }
        projCount++;
        if (projCount >= n) hold = 150;
      }
      // 扫描架与体模
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(C[0], C[1], R + 16, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(148,163,184,.2)';
      ctx.beginPath(); ctx.arc(C[0], C[1], R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(C[0], C[1], R, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(226,232,240,.75)';
      blobs.forEach(function (b) {
        ctx.beginPath(); ctx.arc(b[0], b[1], b[2], 0, Math.PI * 2); ctx.fill();
      });
      // 旋转的 X 光管与探测器阵列
      const sx = C[0] + (R + 16) * Math.cos(curTheta), sy = C[1] + (R + 16) * Math.sin(curTheta);
      const dx2 = C[0] - (R + 16) * Math.cos(curTheta), dy2 = C[1] - (R + 16) * Math.sin(curTheta);
      ctx.strokeStyle = 'rgba(251,191,36,.35)'; ctx.lineWidth = 1;
      for (let k = -2; k <= 2; k++) {
        ctx.beginPath(); ctx.moveTo(sx, sy);
        ctx.lineTo(dx2 + k * 10 * -Math.sin(curTheta), dy2 + k * 10 * Math.cos(curTheta)); ctx.stroke();
      }
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(sx, sy, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#38bdf8';
      for (let k = -2; k <= 2; k++) {
        ctx.beginPath(); ctx.arc(dx2 + k * 10 * -Math.sin(curTheta), dy2 + k * 10 * Math.cos(curTheta), 2.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('X 光管', sx - 14, sy - 10);
      ctx.fillText('探测器', dx2 - 14, dy2 + 18);
      ctx.fillText('体模', C[0] - 11, C[1] + R + 30);
      ctx.fillText('高密度灶', 8, 94);
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(54, 96); ctx.lineTo(62, 102); ctx.stroke();
      // 重建图像
      let mx = 0.0001, i, j;
      for (i = 0; i < G; i++) for (j = 0; j < G; j++) if (acc[i][j] > mx) mx = acc[i][j];
      for (i = 0; i < G; i++) {
        for (j = 0; j < G; j++) {
          const cx = (i - (G - 1) / 2) / ((G - 1) / 2);
          const cy = (j - (G - 1) / 2) / ((G - 1) / 2);
          if (cx * cx + cy * cy > 1) continue;
          const g = Math.round(acc[i][j] / mx * 225);
          ctx.fillStyle = 'rgb(' + g + ',' + g + ',' + Math.min(255, g + 20) + ')';
          ctx.fillRect(RX + i * CS, RY + j * CS, CS, CS);
        }
      }
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(RX + G * CS / 2, RY + G * CS / 2, G * CS / 2, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('重建图像', RX, 44);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('投影 ' + projCount + ' / ' + n + ' 个角度', 14, 20);
      if (projCount > 0 && projCount < 16) {
        ctx.fillStyle = '#fbbf24'; ctx.font = '10px sans-serif';
        ctx.fillText('角度太少 → 星状伪影', RX - 10, RY + G * CS + 16);
      }
      cap(ctx, V, '每个角度反投一条"影子"，叠加出断层（拉东变换的逆）');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 桑格测序：ddNTP 随机终止，毛细管电泳按长度分拣 */
  AN.sangerSeq = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const SEQ = 'ATGCGTACCGTA';
    const COL = { A: '#22c55e', T: '#ef4444', G: '#fbbf24', C: '#38bdf8' };
    const CMP = { A: 'T', T: 'A', G: 'C', C: 'G' };
    let frags = [], peaks = [], cyc = -1, lastDD = -1, meanLen = 12;
    function newCycle(dd) {
      frags = []; peaks = [];
      meanLen = 110 / dd;
      for (let L = 1; L <= 12; L++) {
        if (Math.random() < Math.exp(-(L - 1) / meanLen)) {
          frags.push({ L: L, y: 46 - L * 3, sp: 5.2 / L, done: false });
        }
      }
    }
    (function loop() {
      const D = (tp && tp.data) || {};
      const dd = Math.max(2, Math.min(30, D.dd !== undefined ? D.dd : 8));
      const ctx = V.ctx;
      const cycle = Math.floor(t / 560);
      if (cycle !== cyc || dd !== lastDD) { cyc = cycle; lastDD = dd; newCycle(dd); }
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 左侧：模板链与新生的荧光片段
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('模板链', 14, 30);
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(14, 40); ctx.lineTo(130, 40); ctx.stroke();
      for (let i = 0; i < 12; i++) {
        ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
        ctx.fillText(CMP[SEQ[i]], 16 + i * 9.6, 37);
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('荧光片段（长度=终止位点）', 14, 58);
      frags.forEach(function (fr, i) {
        const fy = 68 + i * 9;
        ctx.fillStyle = COL[SEQ[fr.L - 1]];
        ctx.fillRect(14, fy, 5 + fr.L * 3.2, 5);
      });
      // 毛细管电泳
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.strokeRect(156, 40, 30, 160);
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('毛细管电泳', 136, 30);
      // 激光检测线
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(146, 182); ctx.lineTo(196, 182); ctx.stroke();
      ctx.fillStyle = '#ef4444'; ctx.font = '9px sans-serif';
      ctx.fillText('激光检测器', 136, 214);
      // 片段迁移：短的跑得快
      frags.forEach(function (fr) {
        if (fr.done) return;
        fr.y += fr.sp;
        if (fr.y >= 182) {
          fr.done = true;
          peaks.push(fr.L);
          return;
        }
        ctx.fillStyle = COL[SEQ[fr.L - 1]];
        const w = 5 + fr.L * 1.2;
        ctx.fillRect(171 - w / 2, fr.y, w, 4);
      });
      // 右侧色谱：按长度排位
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(200, 190); ctx.lineTo(350, 190); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('色谱（按长度排队）', 200, 30);
      for (let L = 1; L <= 12; L++) {
        const px = 206 + (L - 1) * 12;
        if (peaks.indexOf(L) >= 0) {
          ctx.fillStyle = COL[SEQ[L - 1]];
          ctx.beginPath();
          ctx.moveTo(px, 190); ctx.lineTo(px + 4, 158); ctx.lineTo(px + 8, 190);
          ctx.closePath(); ctx.fill();
          ctx.font = '10px sans-serif';
          ctx.fillText(SEQ[L - 1], px + 1, 152);
        } else {
          ctx.fillStyle = '#475569'; ctx.font = '10px sans-serif';
          ctx.fillText('·', px + 3, 186);
        }
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('ddNTP ' + dd + '% → 片段平均 ~' + Math.round(meanLen) + ' 碱基', 14, 228);
      ctx.fillStyle = peaks.length >= 12 ? '#22c55e' : '#fbbf24';
      ctx.fillText('已读出 ' + peaks.length + '/12 碱基', 262, 228);
      cap(ctx, V, '短的跑得快：片段按长度过检测器，末端荧光即碱基');
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
