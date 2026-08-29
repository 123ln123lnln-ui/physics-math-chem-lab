/* explore-anim5_8.js — 第三批动画引擎（计算树 · 批次8，11 个专属原理动画） */
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

  /* 算筹与算盘：位置记数法，上珠当五、下珠当一 */
  AN.abacus = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const rods = [80, 140, 200, 260];
    const names = ['千', '百', '十', '个'];
    const pos = [];
    (function loop() {
      const D = (tp && tp.data) || {};
      const n = Math.max(0, Math.min(9999, Math.round(D.n !== undefined ? D.n : 2025)));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const digs = [Math.floor(n / 1000) % 10, Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10];
      ctx.fillStyle = '#e2e8f0'; ctx.font = '12px sans-serif';
      ctx.fillText(n + ' = ' + digs[0] + '×1000 + ' + digs[1] + '×100 + ' + digs[2] + '×10 + ' + digs[3] + '×1', 20, 18);
      // 框与梁
      ctx.strokeStyle = '#b45309'; ctx.lineWidth = 3;
      ctx.strokeRect(46, 42, 268, 180);
      ctx.fillStyle = '#b45309'; ctx.fillRect(46, 100, 268, 12);
      for (let c = 0; c < 4; c++) {
        const x = rods[c], d = digs[c];
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, 44); ctx.lineTo(x, 220); ctx.stroke();
        const ua = d >= 5 ? 1 : 0, la = d % 5;
        const tgt = [58, ua ? 92 : 74, 0, 0, 0, 0, 0];
        for (let i = 0; i < 5; i++) tgt[2 + i] = i < la ? 122 + i * 15 : 214 - (4 - i) * 15;
        if (!pos[c]) pos[c] = tgt.slice();
        for (let b = 0; b < 7; b++) {
          pos[c][b] += (tgt[b] - pos[c][b]) * 0.22;
          const act = b < 2 ? (b === 1 && ua === 1) : (b - 2 < la);
          ctx.fillStyle = act ? '#fbbf24' : '#64748b';
          ctx.beginPath(); ctx.ellipse(x, pos[c][b], 17, 7.5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 1; ctx.stroke();
        }
        ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif';
        ctx.fillText(names[c], x - 5, 36);
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(String(d), x + 22, 60);
      }
      cap(ctx, V, '上珠当 5、下珠当 1：珠子的值 = 数码 × 档位的权');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 机械加法器：低位轮转满一圈，棘爪进位 */
  AN.gearCarry = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, S = 0, dS = 0, t10 = 0, t100 = 0, tick = 0, flash1 = 0, flash2 = 0;
    const wx = [90, 180, 270], wy = 126, wr = 32;
    const wname = ['百位轮', '十位轮', '个位轮'];
    (function loop() {
      const D = (tp && tp.data) || {};
      const a = Math.max(1, Math.min(20, Math.round(D.a !== undefined ? D.a : 7)));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      tick++;
      if (tick >= 45) {
        tick = 0;
        const prev = S;
        S = (S + a) % 1000;
        if (Math.floor(S / 10) !== Math.floor(prev / 10)) flash1 = 30;
        if (Math.floor(S / 100) !== Math.floor(prev / 100)) flash2 = 30;
      }
      dS += (S - dS) * 0.12;
      t10 += (Math.floor(S / 10) - t10) * 0.25;
      t100 += (Math.floor(S / 100) - t100) * 0.25;
      const vals = [t100, t10, dS];
      const digs = [Math.floor(S / 100) % 10, Math.floor(S / 10) % 10, S % 10];
      for (let i = 0; i < 3; i++) {
        const cx = wx[i], ang = -vals[i] * Math.PI / 5;
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, wy, wr, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 3;
        for (let k = 0; k < 10; k++) {
          const an = ang + k * Math.PI / 5;
          ctx.beginPath();
          ctx.moveTo(cx + (wr - 5) * Math.cos(an), wy + (wr - 5) * Math.sin(an));
          ctx.lineTo(cx + (wr + 5) * Math.cos(an), wy + (wr + 5) * Math.sin(an));
          ctx.stroke();
        }
        ctx.fillStyle = '#cbd5e1'; ctx.font = '8px sans-serif';
        for (let k = 0; k < 10; k++) {
          const an = -Math.PI / 2 + ang + k * Math.PI / 5;
          ctx.fillText(String(k), cx + (wr - 14) * Math.cos(an) - 2.5, wy + (wr - 14) * Math.sin(an) + 3);
        }
        // 读数窗
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - 12, wy - wr - 32, 24, 24);
        ctx.fillStyle = '#fde047'; ctx.font = 'bold 15px sans-serif';
        ctx.fillText(String(digs[i]), cx - 4.5, wy - wr - 14);
        ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
        ctx.fillText(wname[i], cx - 16, wy + wr + 16);
      }
      // 进位棘爪（个→十，十→百）
      const pawls = [[flash1, 225], [flash2, 135]];
      for (let i = 0; i < 2; i++) {
        const f = pawls[i][0], mx = pawls[i][1];
        const kick = f > 0 ? Math.sin(f / 30 * Math.PI) * 10 : 0;
        ctx.strokeStyle = f > 0 ? '#ef4444' : '#475569'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(mx, wy - wr + 4); ctx.lineTo(mx, wy - wr + 22 - kick); ctx.stroke();
        if (f > 0) {
          ctx.fillStyle = 'rgba(239,68,68,' + f / 30 + ')'; ctx.font = 'bold 11px sans-serif';
          ctx.fillText('进位!', mx - 14, wy - wr - 2);
        }
      }
      if (flash1 > 0) flash1--;
      if (flash2 > 0) flash2--;
      ctx.fillStyle = '#e2e8f0'; ctx.font = '12px sans-serif';
      ctx.fillText('每拍 +' + a + '，累计 ' + S + '（个位轮转满一圈 → 十位被棘爪推一格）', 20, 20);
      cap(ctx, V, '帕斯卡 1642：进位是一枚自动弹起的棘爪');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 穿孔卡片普查机：针过孔接通水银杯，计数加一 */
  AN.punchCard = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, phase = 0, px = -160, pinY = 0, cards = 0, dwell = 0, pressed = false;
    const pins = 6, pinX0 = 78, pinDx = 24;
    let pat = [];
    const counts = [0, 0, 0, 0, 0, 0];
    function newCard() { pat = []; for (let i = 0; i < pins; i++) pat.push(Math.random() < 0.5 ? 1 : 0); }
    newCard();
    (function loop() {
      const D = (tp && tp.data) || {};
      const n = Math.max(10, Math.min(100, D.n !== undefined ? D.n : 63));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 状态机：滑入 → 压针 → 停留 → 滑出
      if (phase === 0) { px += 5; if (px >= 46) { px = 46; phase = 1; } }
      else if (phase === 1) { pinY += 5; if (pinY >= 56) { pinY = 56; phase = 2; dwell = 0; pressed = true; } }
      else if (phase === 2) { dwell++; if (dwell > 26) { phase = 3; pressed = false; } }
      else { px += 6; pinY = Math.max(0, pinY - 8); if (px > 380) { px = -160; phase = 0; newCard(); } }
      // 卡片
      ctx.fillStyle = '#e7d8b7'; ctx.fillRect(px, 90, 150, 84);
      ctx.strokeStyle = '#a8936b'; ctx.lineWidth = 1; ctx.strokeRect(px, 90, 150, 84);
      for (let i = 0; i < pins; i++) {
        if (pat[i]) {
          ctx.fillStyle = '#0f172a';
          ctx.beginPath(); ctx.arc(px + 32 + i * pinDx, 128, 5, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.fillStyle = '#a8936b'; ctx.font = '9px sans-serif';
      ctx.fillText('穿孔卡片（1 张 = 1 人）', px + 26, 104);
      // 针排与水银杯
      ctx.fillStyle = '#475569'; ctx.fillRect(60, 66, 156, 8);
      for (let i = 0; i < pins; i++) {
        const x = pinX0 + i * pinDx; // 与卡片孔位对齐（px=46 时）
        const hole = pat[i] && px === 46;
        const tip = 74 + (hole ? pinY : Math.min(pinY, 16));
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(x, 74); ctx.lineTo(x, tip); ctx.stroke();
        // 水银杯
        ctx.fillStyle = '#38bdf8'; ctx.fillRect(x - 6, 178, 12, 6);
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1; ctx.strokeRect(x - 6, 176, 12, 8);
        if (phase === 2 && hole) {
          ctx.fillStyle = 'rgba(253,224,71,.9)';
          ctx.beginPath(); ctx.arc(x, 176, 5 + Math.sin(t * 0.6) * 1.5, 0, Math.PI * 2); ctx.fill();
        }
        // 计数条
        const h = (counts[i] % 26) * 1.5;
        ctx.fillStyle = '#22c55e'; ctx.fillRect(x - 7, 226 - h, 14, h);
        ctx.strokeStyle = '#475569'; ctx.strokeRect(x - 7, 188, 14, 38);
      }
      if (phase === 2 && pressed) {
        for (let i = 0; i < pins; i++) if (pat[i]) counts[i]++;
        cards++; pressed = false;
      }
      // 右侧对比
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('人口 ' + n + ' 百万', 236, 40);
      ctx.fillStyle = '#ef4444'; ctx.fillRect(236, 52, Math.min(112, n * 1.1), 12);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('手工 ≈ ' + (n / 6.3).toFixed(1) + ' 年', 236, 78);
      ctx.fillStyle = '#22c55e'; ctx.fillRect(236, 92, Math.min(112, n * 0.35), 12);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('卡片机 ≈ ' + (n * 0.1).toFixed(1) + ' 周', 236, 118);
      ctx.fillText('（1880 手工 8 年 → 1890 机器 6 周）', 226, 136);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('已读 ' + cards + ' 张卡', 20, 20);
      cap(ctx, V, '霍勒里斯 1884：针穿过孔接通电路，继电器自动计数');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 采样定理：采样率低于 2f 就混叠 */
  AN.sampling = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const fsig = 10; // kHz 原信号
    (function loop() {
      const D = (tp && tp.data) || {};
      const f = Math.max(4, Math.min(48, D.f !== undefined ? D.f : 44));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const tw = 0.2; // 窗口 0.2 ms = 2 个周期
      const x0 = 20, x1 = 340;
      function waveX(tt) { return x0 + tt / tw * (x1 - x0); }
      function sig(tt) { return Math.sin(2 * Math.PI * fsig * tt); }
      const scroll = (t * 0.0003) % (1 / fsig);
      // 上排：原信号 + 采样点
      ctx.strokeStyle = 'rgba(148,163,184,.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, 62); ctx.lineTo(x1, 62); ctx.stroke();
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = x0; x <= x1; x += 2) {
        const tt = (x - x0) / (x1 - x0) * tw + scroll;
        const y = 62 - 26 * sig(tt);
        if (x === x0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // 采样点
      const spts = [];
      for (let k = 0; k * 1 / f - scroll <= tw; k++) {
        const tt = k / f - scroll;
        if (tt < 0) continue;
        const sx = waveX(tt), sy = 62 - 26 * sig(tt);
        spts.push([sx, 62 - 26 * sig(tt), tt]);
        ctx.strokeStyle = 'rgba(251,191,36,.4)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(sx, 36); ctx.lineTo(sx, 90); ctx.stroke();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('原信号 10 kHz + 采样点（' + f + ' kHz）', 20, 30);
      // 下排：重建
      ctx.strokeStyle = 'rgba(148,163,184,.35)';
      ctx.beginPath(); ctx.moveTo(x0, 162); ctx.lineTo(x1, 162); ctx.stroke();
      const alias = f < 2 * fsig;
      if (!alias) {
        ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < spts.length; i++) {
          const sx = spts[i][0], sy = 100 + (spts[i][1] - 62);
          if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        ctx.fillStyle = '#22c55e'; ctx.font = '11px sans-serif';
        ctx.fillText('✓ ' + f + ' ≥ 2×10 kHz：信号完整重建', 20, 204);
      } else {
        const fa = Math.abs(fsig - f * Math.max(1, Math.round(fsig / f)));
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
        ctx.beginPath();
        for (let x = x0; x <= x1; x += 2) {
          const tt = (x - x0) / (x1 - x0) * tw + scroll;
          const y = 162 - 26 * Math.sin(2 * Math.PI * fa * tt + Math.PI);
          if (x === x0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#ef4444'; ctx.font = '11px sans-serif';
        ctx.fillText('✗ ' + f + ' < 2×10 kHz：混叠成 ' + fa.toFixed(1) + ' kHz 假信号', 20, 204);
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('重建波形', 20, 118);
      ctx.fillText('参考：电话 8 kHz · CD 44.1 kHz · 人耳上限 ≈ 20 kHz', 20, 222);
      cap(ctx, V, '奈奎斯特 1928 / 香农 1949：采样率 ≥ 2×最高频率');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 图灵机：二进制加一，演示读-写-移-换状态 */
  AN.turingMachine = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, tape = {}, head = 0, state = 'A', steps = 0, haltT = 0, lastN = -1, viewOff = 0, lastRule = -1, maxIdx = 0;
    function reset(n) {
      tape = {}; head = 0; state = 'A'; steps = 0; haltT = 0; lastRule = -1;
      const s = n.toString(2);
      for (let i = 0; i < s.length; i++) tape[i] = s[i];
      maxIdx = Math.max(0, s.length - 1);
    }
    (function loop() {
      const D = (tp && tp.data) || {};
      const n = Math.max(0, Math.min(31, Math.round(D.n !== undefined ? D.n : 13)));
      if (n !== lastN) { reset(n); lastN = n; }
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      if (state !== 'H') {
        if (t % 20 === 0) {
          const sym = tape[head] || '·';
          if (state === 'A') {
            if (sym === '·') { head--; state = 'B'; lastRule = 1; }
            else { head++; lastRule = 0; }
          } else {
            if (sym === '1') { tape[head] = '0'; head--; lastRule = 2; }
            else { tape[head] = '1'; state = 'H'; lastRule = 3; }
          }
          steps++;
          if (head > maxIdx) maxIdx = head;
        }
      } else { haltT++; if (haltT > 150) reset(n); }
      viewOff += (head - viewOff) * 0.2;
      // 纸带
      for (let s = -5; s <= 5; s++) {
        const idx = head + s;
        const x = 180 + (idx - viewOff) * 30;
        if (x < -20 || x > 370) continue;
        ctx.fillStyle = idx === head ? 'rgba(251,191,36,.18)' : 'rgba(51,65,85,.6)';
        ctx.fillRect(x - 14, 88, 28, 30);
        ctx.strokeStyle = idx === head ? '#fbbf24' : '#475569';
        ctx.lineWidth = idx === head ? 2 : 1;
        ctx.strokeRect(x - 14, 88, 28, 30);
        ctx.fillStyle = '#e2e8f0'; ctx.font = '13px monospace';
        ctx.fillText(tape[idx] || '·', x - 4, 108);
      }
      // 读写头
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.moveTo(180, 76); ctx.lineTo(172, 64); ctx.lineTo(188, 64); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('读写头', 158, 58);
      ctx.fillText('纸带', 12, 108);
      // 状态与规则表
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('状态 ' + state + (state === 'H' ? '（停机）' : '') + ' · 步数 ' + steps, 20, 20);
      const rules = ['A 读 0/1 → 右移', 'A 读 · → 左移，转 B', 'B 读 1 → 写 0，左移', 'B 读 0/· → 写 1，停机'];
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('状态表（任务：二进制 +1）', 222, 134);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i === lastRule ? '#22d3ee' : '#64748b';
        ctx.font = (i === lastRule ? 'bold ' : '') + '9.5px sans-serif';
        ctx.fillText(rules[i], 222, 150 + i * 15);
      }
      // 结果
      ctx.fillStyle = '#22c55e'; ctx.font = '12px sans-serif';
      ctx.fillText('输入 ' + n + '（' + n.toString(2) + '）→ +1 = ' + (state === 'H' ? (n + 1) + '（' + (n + 1).toString(2) + '）' : '…'), 20, 150);
      cap(ctx, V, '1936 图灵：读-写-移-换状态，四步模拟一切算法');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 冯·诺依曼结构：存储程序，取指-译码-执行循环 */
  AN.storedProgram = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, step = 0, sub = 0, subT = 0, acc = 0, yval = null, lastX = -1, doneT = 0;
    const dots = [];
    const cellY = function (i) { return 40 + i * 23; };
    (function loop() {
      const D = (tp && tp.data) || {};
      const x = Math.max(1, Math.min(9, Math.round(D.x !== undefined ? D.x : 5)));
      if (x !== lastX) { step = 0; sub = 0; subT = 0; acc = 0; yval = null; lastX = x; dots.length = 0; doneT = 0; }
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const memText = ['0  LOAD [4] 取数', '1  ADD [4]  加', '2  ADD [5]  加', '3  STORE [6] 存', 'x = ' + x, '常数 1', 'y = ' + (yval === null ? '?' : yval), 'HALT 停机'];
      // 存储器
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('存储器（指令 + 数据）', 24, 30);
      for (let i = 0; i < 8; i++) {
        const cy = cellY(i);
        const isInstr = step === i && sub === 0;
        const isData = (sub === 1 && ((step <= 1 && i === 4) || (step === 2 && i === 5) || (step === 3 && i === 6)));
        ctx.fillStyle = 'rgba(51,65,85,.7)';
        ctx.fillRect(24, cy, 118, 19);
        ctx.strokeStyle = isInstr ? '#fbbf24' : isData ? '#22d3ee' : '#475569';
        ctx.lineWidth = isInstr || isData ? 2 : 1;
        ctx.strokeRect(24, cy, 118, 19);
        ctx.fillStyle = i >= 4 && i <= 6 ? '#7dd3fc' : '#e2e8f0';
        ctx.font = '9.5px monospace';
        ctx.fillText(memText[i], 28, cy + 13);
      }
      // 控制器 / 运算器
      ctx.fillStyle = 'rgba(30,41,59,.9)'; ctx.fillRect(180, 44, 110, 40);
      ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 1.5; ctx.strokeRect(180, 44, 110, 40);
      ctx.fillStyle = '#c4b5fd'; ctx.font = '10px sans-serif';
      ctx.fillText('控制器', 184, 58);
      ctx.fillText('PC = ' + Math.min(step, 3), 184, 74);
      ctx.fillStyle = 'rgba(30,41,59,.9)'; ctx.fillRect(180, 120, 110, 40);
      ctx.strokeStyle = '#34d399'; ctx.strokeRect(180, 120, 110, 40);
      ctx.fillStyle = '#6ee7b7';
      ctx.fillText('运算器 ALU', 184, 134);
      ctx.fillText('ACC = ' + acc, 184, 150);
      // 总线
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(158, 50); ctx.lineTo(158, 176); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(142, 64); ctx.lineTo(180, 64); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(142, 140); ctx.lineTo(180, 140); ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.font = '9px sans-serif';
      ctx.fillText('总线', 150, 44);
      // 节拍
      const dur = [26, 34];
      subT++;
      if (doneT > 0) { doneT++; if (doneT > 140) { step = 0; sub = 0; subT = 0; acc = 0; yval = null; doneT = 0; } }
      else if (subT === 2) {
        if (sub === 0) dots.push({ x0: 142, y0: cellY(step) + 9, x1: 180, y1: 64, p: 0, col: '#fbbf24' });
        else {
          const src = step <= 1 ? 4 : step === 2 ? 5 : 6;
          if (step === 3) dots.push({ x0: 180, y0: 140, x1: 142, y1: cellY(6) + 9, p: 0, col: '#34d399' });
          else dots.push({ x0: 142, y0: cellY(src) + 9, x1: 180, y1: 140, p: 0, col: '#22d3ee' });
        }
      } else if (subT >= dur[sub]) {
        subT = 0;
        if (sub === 0) sub = 1;
        else {
          if (step === 0) acc = x;
          else if (step === 1) acc += x;
          else if (step === 2) acc += 1;
          else if (step === 3) { yval = acc; doneT = 1; }
          step = (step + 1) % 4; sub = 0;
        }
      }
      // 数据点
      for (let i = dots.length - 1; i >= 0; i--) {
        const d2 = dots[i];
        d2.p += 0.06;
        if (d2.p >= 1) { dots.splice(i, 1); continue; }
        const dx = d2.x0 + (d2.x1 - d2.x0) * d2.p, dy = d2.y0 + (d2.y1 - d2.y0) * d2.p;
        ctx.fillStyle = d2.col;
        ctx.beginPath(); ctx.arc(dx, dy, 4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('程序：y = 2x + 1（取 x → 加 x → 加 1 → 存 y）', 20, 20);
      if (doneT > 0) {
        ctx.fillStyle = '#22c55e'; ctx.font = 'bold 12px sans-serif';
        ctx.fillText('✓ 完成：y = 2×' + x + ' + 1 = ' + yval, 180, 190);
      }
      cap(ctx, V, '1945 EDVAC：指令与数据同存一处，取指-译码-执行');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 哈夫曼编码：频率定码长，平均码长逼近熵 */
  AN.huffmanCode = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const stream = [];
    const syms = ['A', 'B', 'C', 'D'];
    const cols = ['#22d3ee', '#34d399', '#fbbf24', '#f472b6'];
    const peaked = [0.94, 0.036, 0.018, 0.006];
    function huffCodes(ps) {
      const codes = ['', '', '', ''];
      const nodes = ps.map(function (p, i) { return { p: p, leaf: i, l: null, r: null }; });
      function add(nd, c) {
        if (nd.leaf >= 0) codes[nd.leaf] = c + codes[nd.leaf];
        else { add(nd.l, c); add(nd.r, c); }
      }
      while (nodes.length > 1) {
        nodes.sort(function (a, b) { return a.p - b.p; });
        const a = nodes.shift(), b = nodes.shift();
        add(a, '0'); add(b, '1');
        nodes.push({ p: a.p + b.p, leaf: -1, l: a, r: b });
      }
      return codes;
    }
    (function loop() {
      const D = (tp && tp.data) || {};
      const u = Math.max(0, Math.min(100, D.u !== undefined ? D.u : 30)) / 100;
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const ps = peaked.map(function (p) { return p + (0.25 - p) * u; });
      const codes = huffCodes(ps);
      let H = 0, L = 0;
      for (let i = 0; i < 4; i++) { H -= ps[i] * Math.log2(ps[i]); L += ps[i] * codes[i].length; }
      // 频率条形图 + 码字
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('符号频率与码字', 24, 24);
      for (let i = 0; i < 4; i++) {
        const bx = 26 + i * 46, bh = ps[i] * 128;
        ctx.fillStyle = cols[i];
        ctx.fillRect(bx, 160 - bh, 30, bh);
        ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
        ctx.fillText(syms[i], bx + 11, 174);
        ctx.fillText((ps[i] * 100).toFixed(1) + '%', bx - 2, 188);
        ctx.fillStyle = '#fbbf24'; ctx.font = '10px monospace';
        ctx.fillText(codes[i], bx + 8, 202);
      }
      // 符号流
      if (t % 26 === 0) {
        const r = Math.random();
        let acc2 = 0, pick = 3;
        for (let i = 0; i < 4; i++) { acc2 += ps[i]; if (r < acc2) { pick = i; break; } }
        stream.push(pick);
        if (stream.length > 7) stream.shift();
      }
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('发出的符号流 → 编码', 216, 60);
      for (let i = 0; i < stream.length; i++) {
        const s = stream[i], sx = 216 + i * 20;
        ctx.fillStyle = cols[s]; ctx.font = '10px sans-serif';
        ctx.fillText(syms[s], sx, 80);
        ctx.font = '9px monospace';
        ctx.fillText(codes[s], sx, 94);
      }
      // H / L
      ctx.fillStyle = '#e2e8f0'; ctx.font = '12px sans-serif';
      ctx.fillText('熵 H = ' + H.toFixed(2) + ' bit', 210, 130);
      ctx.fillText('平均码长 L = ' + L.toFixed(2) + ' bit', 210, 150);
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 1; ctx.strokeRect(210, 160, 130, 12);
      ctx.fillStyle = '#22d3ee'; ctx.fillRect(211, 161, H / 2 * 129, 10);
      ctx.fillStyle = 'rgba(251,191,36,.55)'; ctx.fillRect(211 + H / 2 * 129, 161, Math.max(0, (L - H) / 2 * 129), 10);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('蓝=熵(压缩极限) 黄=超出；等长码要 2.00', 210, 186);
      cap(ctx, V, '哈夫曼 1952：越常用越短码，L 紧贴 H = −Σp·log₂p');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 摩尔定律：对数坐标上的指数狂飙 + 芯片密度 */
  AN.mooresLaw = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const px = function (yr) { return 45 + (yr - 1965) / 60 * 190; };
    const py = function (lg) { return 195 - (lg - 2) / 10.5 * 155; };
    const law = function (yr) { return Math.log10(2300) + (yr - 1971) / 2 * Math.log10(2); };
    const pts = [[1971, 2300, '4004'], [1978, 29000, '8086'], [1985, 275000, '386'], [1993, 3100000, '奔腾'], [2006, 291000000, 'Core2'], [2011, 1160000000, '酷睿i7'], [2020, 16000000000, 'M1'], [2023, 134000000000, 'M2 Ultra']];
    function fmt(N) {
      if (N >= 1e8) return (N / 1e8).toFixed(N >= 1e10 ? 0 : 1) + ' 亿';
      if (N >= 1e4) return Math.round(N / 1e4) + ' 万';
      return String(Math.round(N));
    }
    (function loop() {
      const D = (tp && tp.data) || {};
      const yr = Math.max(1971, Math.min(2025, Math.round(D.yr !== undefined ? D.yr : 2003)));
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      // 坐标框与刻度
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(45, 40, 190, 155);
      ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
      const yticks = [[3, '10³ 千'], [6, '10⁶ 百万'], [9, '10⁹ 十亿']];
      for (let i = 0; i < yticks.length; i++) {
        const yy = py(yticks[i][0]);
        ctx.strokeStyle = 'rgba(148,163,184,.15)';
        ctx.beginPath(); ctx.moveTo(45, yy); ctx.lineTo(235, yy); ctx.stroke();
        ctx.fillStyle = '#64748b';
        ctx.fillText(yticks[i][1], 4, yy + 3);
      }
      ctx.fillText('1970', 44, 206); ctx.fillText('1995', 122, 206); ctx.fillText('2020', 200, 206);
      // 定律线（对数坐标下是直线；2005 后变橙：登纳德缩放失效）
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let y2 = 1965; y2 <= 2005; y2 += 2) {
        const X = px(y2), Y = py(law(y2));
        if (y2 === 1965) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
      }
      ctx.stroke();
      ctx.strokeStyle = '#f97316';
      ctx.beginPath();
      for (let y2 = 2005; y2 <= 2025; y2 += 2) {
        const X = px(y2), Y = py(law(y2));
        if (y2 === 2005) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      // 真实芯片点
      ctx.font = '8.5px sans-serif';
      for (let i = 0; i < pts.length; i++) {
        const X = px(pts[i][0]), Y = py(Math.log10(pts[i][1]));
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath(); ctx.arc(X, Y, 3, 0, Math.PI * 2); ctx.fill();
        if (i === 0 || i === 3 || i === 7) {
          ctx.fillStyle = '#7dd3fc';
          ctx.fillText(pts[i][2], X - 8, Y - 6);
        }
      }
      // 当前年份标记
      const N = Math.pow(10, law(yr));
      const mx = px(yr), my = py(law(yr));
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(mx, my, 5 + Math.sin(t * 0.15) * 1, 0, Math.PI * 2); ctx.fill();
      // 右侧芯片：点阵密度 ∝ N
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.strokeRect(262, 52, 76, 76);
      ctx.fillStyle = 'rgba(59,130,246,.15)'; ctx.fillRect(263, 53, 74, 74);
      const nd = Math.max(6, Math.min(529, Math.round(Math.pow(N, 0.27))));
      ctx.fillStyle = '#fbbf24';
      for (let i = 0; i < nd; i++) {
        const gx = 266 + (i % 23) * 3.1, gy = 56 + Math.floor(i / 23) * 3.1;
        if (gx < 336 && gy < 126) ctx.fillRect(gx, gy, 1.8, 1.8);
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
      ctx.fillText(yr + ' 年芯片', 274, 142);
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText('≈ ' + fmt(N) + ' 个晶体管', 252, 160);
      ctx.fillStyle = '#f97316'; ctx.font = '9px sans-serif';
      ctx.fillText('2005 后：主频≈4GHz 见顶，转多核', 218, 178);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('每 2 年 ×2（对数坐标下是一条直线）', 20, 20);
      cap(ctx, V, '摩尔 1965：不是物理定律，是自我实现的路线图');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* TCP：序号 + ACK + 超时重传，在丢包链路上可靠送达 */
  AN.tcpReliable = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, pkts = [], acks = [], timers = {}, next = 0, recv = [], recvPtr = 0, sent = 0, lost = 0, re = 0, doneT = 0, cool = 0, drops = [];
    const chars = ['你', '好', '数', '理', '通', '！'];
    function reset() { pkts = []; acks = []; timers = {}; next = 0; recv = []; recvPtr = 0; sent = 0; lost = 0; re = 0; doneT = 0; cool = 0; drops = []; }
    reset();
    (function loop() {
      const D = (tp && tp.data) || {};
      const loss = Math.max(0, Math.min(60, D.loss !== undefined ? D.loss : 25)) / 100;
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      if (recvPtr >= 6) { doneT++; if (doneT > 160) reset(); }
      else {
        cool--;
        if (Object.keys(timers).length < 2 && next < 6 && cool <= 0) {
          pkts.push({ seq: next, x: 60, re: false });
          timers[next] = 0; sent++; next++; cool = 34;
        }
        for (let i = pkts.length - 1; i >= 0; i--) {
          const p = pkts[i];
          p.x += 2.4;
          if (p.x >= 282) {
            pkts.splice(i, 1);
            if (recv[p.seq]) { acks.push({ seq: p.seq, x: 282 }); }
            else if (Math.random() < loss) { lost++; drops.push({ x: 292, y: 100, life: 24 }); }
            else { recv[p.seq] = true; acks.push({ seq: p.seq, x: 282 }); }
          }
        }
        for (let i = acks.length - 1; i >= 0; i--) {
          const a = acks[i];
          a.x -= 2.4;
          if (a.x <= 60) {
            acks.splice(i, 1);
            if (timers[a.seq] !== undefined) {
              if (Math.random() < loss * 0.5) drops.push({ x: 66, y: 138, life: 24 });
              else delete timers[a.seq];
            }
          }
        }
        for (const seq in timers) {
          timers[seq]++;
          if (timers[seq] > 110) {
            timers[seq] = 0;
            pkts.push({ seq: +seq, x: 60, re: true }); sent++; re++;
          }
        }
        while (recvPtr < 6 && recv[recvPtr]) recvPtr++;
      }
      // 端点与信道
      ctx.fillStyle = '#334155'; ctx.fillRect(14, 84, 48, 68);
      ctx.fillRect(292, 84, 48, 68);
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
      ctx.strokeRect(14, 84, 48, 68); ctx.strokeRect(292, 84, 48, 68);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '10px sans-serif';
      ctx.fillText('发送方', 20, 122);
      ctx.fillText('接收方', 298, 122);
      ctx.strokeStyle = 'rgba(148,163,184,.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(62, 100); ctx.lineTo(292, 100); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(62, 138); ctx.lineTo(292, 138); ctx.stroke();
      ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
      ctx.fillText('数据 →', 170, 94);
      ctx.fillText('← ACK 确认', 164, 132);
      // 最老未确认包的超时条
      const keys = Object.keys(timers);
      if (keys.length) {
        const oldest = +keys[0];
        ctx.strokeStyle = '#475569'; ctx.strokeRect(14, 70, 60, 6);
        ctx.fillStyle = timers[oldest] > 80 ? '#ef4444' : '#fbbf24';
        ctx.fillRect(15, 71, Math.min(1, timers[oldest] / 110) * 58, 4);
        ctx.fillStyle = '#64748b'; ctx.font = '8.5px sans-serif';
        ctx.fillText('超时计时', 78, 76);
      }
      // 包与 ACK
      for (let i = 0; i < pkts.length; i++) {
        const p = pkts[i];
        ctx.fillStyle = p.re ? '#f97316' : '#38bdf8';
        ctx.fillRect(p.x, 92, 24, 16);
        ctx.fillStyle = '#0f172a'; ctx.font = 'bold 10px sans-serif';
        ctx.fillText(String(p.seq + 1), p.x + 9, 104);
      }
      for (let i = 0; i < acks.length; i++) {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath(); ctx.arc(acks[i].x + 8, 138, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0f172a'; ctx.font = 'bold 8px sans-serif';
        ctx.fillText('A', acks[i].x + 5.5, 141);
      }
      // 丢包红叉
      for (let i = drops.length - 1; i >= 0; i--) {
        const dr = drops[i];
        dr.life--;
        ctx.strokeStyle = 'rgba(239,68,68,' + dr.life / 24 + ')'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(dr.x - 5, dr.y - 5); ctx.lineTo(dr.x + 5, dr.y + 5);
        ctx.moveTo(dr.x + 5, dr.y - 5); ctx.lineTo(dr.x - 5, dr.y + 5);
        ctx.stroke();
        if (dr.life <= 0) drops.splice(i, 1);
      }
      // 接收条（按序还原）
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('按序还原的消息：', 120, 176);
      for (let i = 0; i < 6; i++) {
        const sx = 120 + i * 24;
        ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
        ctx.strokeRect(sx, 184, 20, 22);
        if (i < recvPtr) {
          ctx.fillStyle = '#22c55e'; ctx.font = '12px sans-serif';
          ctx.fillText(chars[i], sx + 4, 200);
        } else if (recv[i]) {
          ctx.fillStyle = '#475569';
          ctx.beginPath(); ctx.arc(sx + 10, 195, 3, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('丢包率 ' + Math.round(loss * 100) + '% · 发送 ' + sent + ' 次 · 丢 ' + lost + ' · 重传 ' + re, 20, 20);
      if (doneT > 0) {
        ctx.fillStyle = '#22c55e'; ctx.font = 'bold 12px sans-serif';
        ctx.fillText('✓ 6/6 全部按序到达——丢包也拦不住', 96, 222);
      }
      cap(ctx, V, '1974 卡恩与瑟夫：序号 + ACK + 超时重传');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* PageRank：随机冲浪者，链接即投票 */
  AN.pageRank = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0, cur = 0, total = 0, hop = 0;
    const N = 6;
    const names = ['A', 'B', 'C', 'D', 'E', 'F'];
    const links = [[1, 3], [0, 2], [0, 3], [4], [3, 5], [2]];
    const counts = [0, 0, 0, 0, 0, 0];
    const pn = [];
    for (let i = 0; i < N; i++) pn.push([105 + 76 * Math.cos(-Math.PI / 2 + i * Math.PI * 2 / N), 118 + 76 * Math.sin(-Math.PI / 2 + i * Math.PI * 2 / N)]);
    (function loop() {
      const D = (tp && tp.data) || {};
      const d = Math.max(0, Math.min(95, D.d !== undefined ? D.d : 85)) / 100;
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      hop++;
      if (hop >= 9) {
        hop = 0; total++;
        let nxt;
        if (Math.random() < d && links[cur].length) nxt = links[cur][Math.floor(Math.random() * links[cur].length)];
        else nxt = Math.floor(Math.random() * N);
        counts[nxt]++; cur = nxt;
      }
      // 链接（带箭头）
      ctx.strokeStyle = 'rgba(148,163,184,.5)'; ctx.lineWidth = 1.2;
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < links[i].length; j++) {
          const a = pn[i], b = pn[links[i][j]];
          const dx = b[0] - a[0], dy = b[1] - a[1];
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len, uy = dy / len;
          ctx.beginPath();
          ctx.moveTo(a[0] + ux * 14, a[1] + uy * 14);
          ctx.lineTo(b[0] - ux * 16, b[1] - uy * 16);
          ctx.stroke();
          const ex = b[0] - ux * 16, ey = b[1] - uy * 16;
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - ux * 6 - uy * 3.5, ey - uy * 6 + ux * 3.5);
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - ux * 6 + uy * 3.5, ey - uy * 6 - ux * 3.5);
          ctx.stroke();
        }
      }
      // 节点
      for (let i = 0; i < N; i++) {
        const share = total ? counts[i] / total : 0;
        ctx.fillStyle = 'rgba(56,189,248,' + (0.25 + share * 2.2) + ')';
        ctx.beginPath(); ctx.arc(pn[i][0], pn[i][1], 13, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(pn[i][0], pn[i][1], 13, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 10px sans-serif';
        ctx.fillText(names[i], pn[i][0] - 3, pn[i][1] + 3.5);
      }
      // 冲浪者
      const pulse = 4 + Math.sin(t * 0.3) * 1.5;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(pn[cur][0], pn[cur][1] - 20, pulse, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fbbf24'; ctx.font = '9px sans-serif';
      ctx.fillText('冲浪者', pn[cur][0] - 14, pn[cur][1] - 28);
      // 排名条形图
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('长期停留比例 = PageRank', 218, 46);
      for (let i = 0; i < N; i++) {
        const share = total ? counts[i] / total : 0;
        const by = 60 + i * 26;
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(names[i], 218, by + 11);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(232, by, Math.min(118, share * 420), 13);
        ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
        ctx.fillText((share * 100).toFixed(1) + '%', 236 + Math.min(118, share * 420), by + 10);
      }
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif';
      ctx.fillText('d = ' + d.toFixed(2) + ' 顺链接走 · ' + (1 - d).toFixed(2) + ' 随机跳页', 20, 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9.5px sans-serif';
      ctx.fillText('d→0 人人平等；d→0.95 枢纽通吃', 218, 226);
      cap(ctx, V, '佩奇与布林 1998：被重要页面链接的页面更重要');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 人工神经网络：加权求和 + 非线性激活 */
  AN.neuralNet = function (holder, tp) {
    const V = mk(holder, 360, 240, true);
    let t = 0;
    const wih = [[2.0, 0.5, -0.3], [-0.8, 1.2, 0.6], [1.5, -0.4, 1.0]];
    const bh = [-1.0, -0.8, -1.2];
    const who = [2.2, -1.0, 1.8], bo = -1.2;
    const inY = [60, 120, 180], hidY = [55, 120, 185];
    const inX = 62, hidX = 178, outX = 282;
    const labels = ['有毛 x₁', '胡须 .8', '个小 .5'];
    function sig(z) { return 1 / (1 + Math.exp(-z)); }
    (function loop() {
      const D = (tp && tp.data) || {};
      const x = Math.max(0, Math.min(100, D.x !== undefined ? D.x : 60)) / 100;
      const ctx = V.ctx;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, V.w, V.h);
      const ins = [x, 0.8, 0.5];
      const hid = [];
      for (let h = 0; h < 3; h++) {
        let s = bh[h];
        for (let i = 0; i < 3; i++) s += wih[h][i] * ins[i];
        hid.push(sig(s));
      }
      let so = bo;
      for (let h = 0; h < 3; h++) so += who[h] * hid[h];
      const out = sig(so);
      // 连线（粗细=权重大小，绿正红负）
      for (let h = 0; h < 3; h++) {
        for (let i = 0; i < 3; i++) {
          const w = wih[h][i];
          ctx.strokeStyle = w > 0 ? 'rgba(34,197,94,.4)' : 'rgba(239,68,68,.4)';
          ctx.lineWidth = 0.8 + Math.abs(w) * 1.3;
          ctx.beginPath(); ctx.moveTo(inX, inY[i]); ctx.lineTo(hidX, hidY[h]); ctx.stroke();
        }
        const w2 = who[h];
        ctx.strokeStyle = w2 > 0 ? 'rgba(34,197,94,.4)' : 'rgba(239,68,68,.4)';
        ctx.lineWidth = 0.8 + Math.abs(w2) * 1.3;
        ctx.beginPath(); ctx.moveTo(hidX, hidY[h]); ctx.lineTo(outX, 120); ctx.stroke();
      }
      // 信号脉冲
      for (let h = 0; h < 3; h++) {
        for (let i = 0; i < 3; i++) {
          const fr = (t * 0.02 + (i * 3 + h) * 0.13) % 1;
          ctx.fillStyle = 'rgba(253,224,71,' + (0.25 + ins[i] * 0.75) + ')';
          ctx.beginPath();
          ctx.arc(inX + (hidX - inX) * fr, inY[i] + (hidY[h] - inY[i]) * fr, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        const fr2 = (t * 0.02 + h * 0.31) % 1;
        ctx.fillStyle = 'rgba(253,224,71,' + (0.25 + hid[h] * 0.75) + ')';
        ctx.beginPath();
        ctx.arc(hidX + (outX - hidX) * fr2, hidY[h] + (120 - hidY[h]) * fr2, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      // 节点
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = 'rgba(34,197,94,' + (0.15 + ins[i] * 0.85) + ')';
        ctx.beginPath(); ctx.arc(inX, inY[i], 13, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(inX, inY[i], 13, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
        ctx.fillText(labels[i], 6, inY[i] + 24);
      }
      for (let h = 0; h < 3; h++) {
        ctx.fillStyle = 'rgba(34,197,94,' + (0.15 + hid[h] * 0.85) + ')';
        ctx.beginPath(); ctx.arc(hidX, hidY[h], 13, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(hidX, hidY[h], 13, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#0f172a'; ctx.font = 'bold 8px sans-serif';
        ctx.fillText('h' + (h + 1), hidX - 5, hidY[h] + 3);
      }
      ctx.fillStyle = 'rgba(34,197,94,' + (0.15 + out * 0.85) + ')';
      ctx.beginPath(); ctx.arc(outX, 120, 15, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(outX, 120, 15, 0, Math.PI * 2); ctx.stroke();
      // 输出概率条
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
      ctx.strokeRect(322, 50, 18, 150);
      ctx.fillStyle = out > 0.5 ? '#22c55e' : '#64748b';
      ctx.fillRect(323, 200 - out * 148, 16, out * 148);
      ctx.setLineDash([3, 3]); ctx.strokeStyle = '#fbbf24';
      ctx.beginPath(); ctx.moveTo(318, 126); ctx.lineTo(344, 126); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText('P(是猫)', 312, 214);
      // 文字
      ctx.fillStyle = '#e2e8f0'; ctx.font = '12px sans-serif';
      ctx.fillText('y = σ(w₁x₁ + w₂x₂ + w₃x₃ + b)', 20, 20);
      ctx.fillText('x₁ = ' + x.toFixed(2) + ' → P = ' + out.toFixed(2), 20, 38);
      ctx.fillStyle = out > 0.5 ? '#22c55e' : '#94a3b8';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(out > 0.5 ? '判定：是猫 ✓' : '判定：不是猫', 230, 38);
      ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
      ctx.fillText('线粗 = 权重大，绿 = 正权重，红 = 负权重', 90, 226);
      cap(ctx, V, '1943 模型 → 1958 感知机 → 2012 AlexNet');
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
