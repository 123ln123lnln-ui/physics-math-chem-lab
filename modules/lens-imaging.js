/* lens-imaging.js — 景深之谜：为什么光圈越小，前后景越清楚？（初中）
 * 焦平面 = 发光薄片扫过 树(3.5m)/屋(7m)/山(30m) 三层景深；焦外物体按弥散圆直径渲染虚化盘；
 * 光圈 f/2→f/16 驱动景深由薄到厚（清晰主体数 1→3 的质变）。
 *
 * 科学约束卡（详卡见 docs/lens-imaging-constraint-card.md，格式依 docs/ANIM-QC.md 第三节）：
 * 原理：1/u+1/v=1/f 定像点；弥散圆 c = D·|v−v_s|/v（入瞳 D=f/N）；c ≤ c0(0.030mm 全画幅) 的物距区间 = 景深。只此一个机理。
 * 不变量：①任意参数下 1/u+1/v=1/f 恒成立；②c0 恒定；③超焦距 H=f²/(N·c0)+f 对给定 N 恒定；④对焦距离处 c≡0（焦平面永远锐利）；⑤虚化盘与离焦量单调。
 * 禁忌：禁光圈只改明暗；禁焦平面物体虚化；禁 f/16 入瞳大于 f/2；禁薄片随光圈变厚（变厚的只有景深带）；禁焦前/焦后不区分。
 * 参数质变点：光圈 f/2→f/16 清晰主体数 1→3；对焦环扫过 3.5/7/30m 清晰主体 前景⇄中景⇄远景 切换。
 */
(function () {
  App.register({
    id: 'lens-imaging',
    title: '景深之谜：为什么光圈越小，前后景越清楚？',
    subject: 'physics',
    stage: '初中',
    desc: '对焦环拖动焦平面薄片扫过树、屋、山，光圈 f/2→f/16 看弥散圆缩小、景深由薄到厚，理解"光圈越小越清楚"的光学本质。',
    render: function (root) {
      const page = document.createElement('div'); page.className = 'module-page';
      const left = document.createElement('div');
      const right = document.createElement('div');
      page.appendChild(left); page.appendChild(right);
      root.appendChild(page);

      const viz = document.createElement('div'); viz.className = 'viz-card';
      viz.innerHTML = '<h3>对焦演示：发光薄片 = 焦平面</h3>';
      const wrap = document.createElement('div'); wrap.className = 'canvas-wrap';
      const canvas = document.createElement('canvas');
      wrap.appendChild(canvas);
      viz.appendChild(wrap);
      left.appendChild(viz);

      const readCard = document.createElement('div'); readCard.className = 'viz-card';
      const formulaDiv = document.createElement('div');
      readCard.appendChild(formulaDiv);
      const readoutDiv = document.createElement('div');
      readCard.appendChild(readoutDiv);
      left.appendChild(readCard);

      const foot = document.createElement('div'); foot.className = 'note';
      foot.textContent = '真实锚定：50 mm 定焦镜头 · 全画幅（36×24 mm，容许弥散圆 c₀=0.030 mm）。入瞳直径 D=f/N：f/2→25.0 mm，f/16→3.1 mm；超焦距 H=f²/(N·c₀)+f：f/2≈41.7 m，f/16≈5.3 m。画面中的虚化盘与景深带全部由 1/u+1/v=1/f 与 c=D·|v−v_s|/v 实时计算。';
      left.appendChild(foot);

      const panel = document.createElement('div'); panel.className = 'panel';
      panel.innerHTML = '<h3>对焦环与光圈</h3>';
      right.appendChild(panel);

      const W = 560, H = 400;
      const ctx = UI.setupCanvas(canvas, W, H);

      // ---------- 真实光学常量（50mm 全画幅） ----------
      const FL = 50;        // 焦距 mm
      const C0 = 0.030;     // 容许弥散圆 mm（全画幅）
      const STOPS = [2, 2.8, 4, 5.6, 8, 11, 16];
      let stopIdx = 2;      // 默认 f/4
      let sFocus = 7000;    // 对焦距离 mm（默认对准 7m 的屋）
      let t = 0, lastTs = null;
      const st = { playing: true, loop: true };
      const trail = [];     // 焦平面薄片渐隐拖尾 [{x, a}]

      // 三层景物（距离经 CoC 公式核算，保证 f/2.8 仅一层清晰、f/16 全清晰）
      const layers = [
        { name: '树', u: 3500, hPx: 105 },
        { name: '屋', u: 7000, hPx: 78 },
        { name: '山', u: 30000, hPx: 120 }
      ];

      // ---------- 光学核心（渲染与景深带共用同一函数，数值自洽） ----------
      function vOf(u) { return u * FL / (u - FL); }               // 薄透镜 1/u+1/v=1/f
      function N() { return STOPS[Math.max(0, Math.min(STOPS.length - 1, stopIdx))]; }
      function coc(u) {                                            // 弥散圆直径 mm
        const D = FL / N();
        return D * Math.abs(vOf(u) - vOf(sFocus)) / vOf(u);
      }
      function dofScan() {                                         // c(u)≤c0 的物距区间（m）
        let near = Infinity, far = 0;
        for (let i = 0; i <= 600; i++) {
          const u = 400 * Math.pow(1e7 / 400, i / 600);            // 0.4m → 10km 对数扫描
          if (coc(u) <= C0) { if (u < near) near = u; if (u > far) far = u; }
        }
        return { near: near / 1000, far: far / 1000, infinite: far >= 9.9e6 };
      }

      // ---------- 视角映射：对数深度轴 ----------
      const UMIN = 2000, UMAX = 30000, MARG = 46;
      function depthX(u) {
        const k = Math.log(Math.max(UMIN, Math.min(UMAX, u)) / UMIN) / Math.log(UMAX / UMIN);
        return MARG + k * (W - 2 * MARG);
      }
      const groundY = 296;

      // ---------- 颜色编码光学量（军规4） ----------
      const COL = { sharp: '#fbbf24', front: '#22d3ee', rear: '#a78bfa' };
      function statusOf(u) {
        const c = coc(u);
        if (c <= C0) return { key: 'sharp', color: COL.sharp, label: '合焦', c: c };
        return u < sFocus
          ? { key: 'front', color: COL.front, label: '焦前模糊', c: c }
          : { key: 'rear', color: COL.rear, label: '焦后模糊', c: c };
      }

      // ---------- 形状绘制（alpha 可控，供虚化多拷贝散射复用） ----------
      function drawTree(x, baseY, h, a) {
        ctx.globalAlpha = a;
        ctx.fillStyle = '#a16207';
        ctx.fillRect(x - h * 0.04, baseY - h * 0.35, h * 0.08, h * 0.35);
        ctx.fillStyle = '#22c55e';
        [[0, -0.62, 0.30], [-0.16, -0.48, 0.22], [0.16, -0.48, 0.22]].forEach(function (c) {
          ctx.beginPath(); ctx.arc(x + c[0] * h, baseY + c[1] * h, c[2] * h, 0, 6.2832); ctx.fill();
        });
        ctx.globalAlpha = 1;
      }
      function drawHouse(x, baseY, h, a) {
        ctx.globalAlpha = a;
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(x - h * 0.42, baseY - h * 0.55, h * 0.84, h * 0.55);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(x - h * 0.5, baseY - h * 0.55);
        ctx.lineTo(x, baseY - h);
        ctx.lineTo(x + h * 0.5, baseY - h * 0.55);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(x - h * 0.1, baseY - h * 0.38, h * 0.2, h * 0.2);
        ctx.globalAlpha = 1;
      }
      function drawMountain(x, baseY, h, a) {
        ctx.globalAlpha = a;
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(x - h * 0.95, baseY);
        ctx.lineTo(x, baseY - h);
        ctx.lineTo(x + h * 0.95, baseY);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(x - h * 0.22, baseY - h * 0.78);
        ctx.lineTo(x, baseY - h);
        ctx.lineTo(x + h * 0.22, baseY - h * 0.78);
        ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 1;
      }
      const shapeFns = [drawTree, drawHouse, drawMountain];

      // 弥散圆虚化盘：离焦物体按其弥散圆直径散成多拷贝软盘，再叠清晰核（核随离焦变淡）
      function drawBlurred(fn, x, y, h, blurPx) {
        if (blurPx > 0.5) {
          const K = 12;
          for (let i = 0; i < K; i++) {
            const ang = i * 2.39996;                               // 黄金角螺旋铺满圆盘
            const r = blurPx * Math.sqrt(i / K);
            ctx.save(); ctx.translate(Math.cos(ang) * r, Math.sin(ang) * r * 0.7);
            fn(x, y, h, 0.11); ctx.restore();
          }
        }
        fn(x, y, h, 1 / (1 + blurPx / 3));
      }

      // ---------- 星空（预生成，首帧即有内容） ----------
      const stars = [];
      for (let i = 0; i < 40; i++) {
        stars.push({ x: (i * 97.3) % W, y: 20 + ((i * 61.7) % 120), r: 0.5 + (i % 3) * 0.4 });
      }

      function draw() {
        // 深色天幕
        const sky = ctx.createLinearGradient(0, 0, 0, groundY);
        sky.addColorStop(0, '#0b1220'); sky.addColorStop(1, '#1e293b');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY);
        ctx.fillStyle = '#f8fafc';
        stars.forEach(function (s) { ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.2832); ctx.fill(); });
        // 地面
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, groundY, W, H - groundY);

        // 三层景物（远→近绘制）
        for (let li = layers.length - 1; li >= 0; li--) {
          const L = layers[li];
          const c = coc(L.u);
          const blurPx = c <= C0 ? 0 : Math.min(24, (c / C0 - 1) * 5);
          drawBlurred(shapeFns[li], depthX(L.u), groundY, L.hPx, blurPx);
        }

        // 焦平面发光薄片 + 渐隐拖尾（军规6）：薄片是对焦面，厚度恒定，不随光圈变
        const fx = depthX(sFocus);
        trail.push({ x: fx, a: 0.5 });
        while (trail.length > 22) trail.shift();
        trail.forEach(function (p) {
          p.a *= 0.90;
          ctx.fillStyle = 'rgba(253,224,71,' + (p.a * 0.35).toFixed(3) + ')';
          ctx.fillRect(p.x - 12, 40, 24, groundY - 30);
        });
        const sheet = ctx.createLinearGradient(fx - 16, 0, fx + 16, 0);
        sheet.addColorStop(0, 'rgba(253,224,71,0)');
        sheet.addColorStop(0.5, 'rgba(253,224,71,0.30)');
        sheet.addColorStop(1, 'rgba(253,224,71,0)');
        ctx.fillStyle = sheet; ctx.fillRect(fx - 16, 40, 32, groundY - 30);
        ctx.save();
        ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2;
        ctx.shadowColor = '#fde047'; ctx.shadowBlur = 16;
        ctx.beginPath(); ctx.moveTo(fx, 40); ctx.lineTo(fx, groundY + 8); ctx.stroke();
        ctx.restore();

        // 景物标签 + 弥散圆样盘（颜色编码合焦/焦前/焦后）
        ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
        layers.forEach(function (L, li) {
          const stt = statusOf(L.u);
          const x = depthX(L.u), yTop = groundY - L.hPx - 16;
          ctx.fillStyle = stt.color;
          ctx.fillText(L.name + ' ' + stt.label, x, yTop);
          const rDisc = 3 + Math.min(8, stt.c / C0) * 1.8;
          ctx.save();
          ctx.strokeStyle = stt.color; ctx.shadowColor = stt.color;
          ctx.shadowBlur = stt.key === 'sharp' ? 10 : 4; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(x, yTop - 24, rDisc, 0, 6.2832); ctx.stroke();
          ctx.restore();
        });

        // 顶部图例（军规7：图例说明各元素）
        ctx.textAlign = 'left';
        const legend = [
          [COL.sharp, '合焦清晰'], [COL.front, '焦前模糊'], [COL.rear, '焦后模糊'],
          ['#fde047', '焦平面薄片'], ['#34d399', '景深带']
        ];
        let lx = 10;
        legend.forEach(function (it) {
          ctx.fillStyle = it[0];
          ctx.beginPath(); ctx.arc(lx + 5, 14, 4, 0, 6.2832); ctx.fill();
          ctx.fillStyle = '#e2e8f0';
          ctx.fillText(it[1], lx + 13, 18);
          lx += 13 + it[1].length * 12 + 14;
        });

        // 底部深度标尺 + 景深带（军规8 质变可视化：f/2→f/16 带宽从一线到满幅）
        const dof = dofScan();
        const ry = H - 58;
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(MARG, ry); ctx.lineTo(W - MARG, ry); ctx.stroke();
        ctx.fillStyle = '#94a3b8';
        [2000, 3000, 5000, 7000, 10000, 15000, 30000].forEach(function (u) {
          const x = depthX(u);
          ctx.beginPath(); ctx.moveTo(x, ry - 4); ctx.lineTo(x, ry + 4); ctx.stroke();
          ctx.fillText((u / 1000) + 'm', x - 10, ry + 16);
        });
        const bnX = depthX(Math.max(UMIN, dof.near * 1000));
        const bfX = depthX(Math.min(UMAX, dof.far * 1000));
        ctx.fillStyle = 'rgba(52,211,153,0.22)';
        ctx.fillRect(bnX, ry - 9, Math.max(2, bfX - bnX), 18);
        ctx.fillStyle = '#34d399';
        ctx.fillRect(bnX, ry - 9, 2, 18);
        if (!dof.infinite) ctx.fillRect(bfX, ry - 9, 2, 18);
        ctx.fillStyle = COL.sharp;
        ctx.beginPath();
        ctx.moveTo(fx, ry - 14); ctx.lineTo(fx - 5, ry - 22); ctx.lineTo(fx + 5, ry - 22);
        ctx.closePath(); ctx.fill();

        // 底部 caption 一句话点题（军规7，实底防拖影糊字）
        ctx.fillStyle = '#020617'; ctx.fillRect(0, H - 30, W, 30);
        const names = layers.filter(function (L) { return coc(L.u) <= C0; })
          .map(function (L) { return L.name; }).join('、') || '（无）';
        ctx.fillStyle = '#fbbf24'; ctx.textAlign = 'center';
        ctx.fillText('f/' + N() + ' 对焦 ' + (sFocus / 1000).toFixed(1) + ' m：清晰的是 ' + names +
          ' —— 光圈越小，清晰的前后范围越宽', W / 2, H - 11);
        ctx.textAlign = 'left';
      }

      function updateReadout() {
        try {
          const dof = dofScan();
          const Hm = (FL * FL / (N() * C0) + FL) / 1000;
          const rows = [
            ['对焦距离 s', (sFocus / 1000).toFixed(1) + ' m'],
            ['光圈', 'f/' + N()],
            ['入瞳直径 D=f/N', (FL / N()).toFixed(1) + ' mm'],
            ['超焦距 H', Hm >= 100 ? '≥100 m' : Hm.toFixed(1) + ' m'],
            ['景深范围', dof.near.toFixed(1) + ' m ~ ' + (dof.infinite ? '∞' : dof.far.toFixed(1) + ' m')]
          ];
          layers.forEach(function (L) {
            const stt = statusOf(L.u);
            rows.push([L.name + '（' + L.u / 1000 + ' m）弥散圆', stt.c.toFixed(3) + ' mm（' + stt.label + '）']);
          });
          readoutDiv.innerHTML = '';
          UI.readout(readoutDiv, rows);
        } catch (e) { UI.showError(readoutDiv, e); }
      }

      function frame(ts) {
        if (st.playing) {
          if (lastTs === null) lastTs = ts;
          t += (ts - lastTs) / 1000 * Anim.speed;
          lastTs = ts;
          // 对焦环自动往返扫描：薄片扫过三层景物，清晰主体 前景⇄中景⇄远景 切换
          sFocus = (2.5 + 27 * (0.5 - 0.5 * Math.cos(2 * Math.PI * t / 12))) * 1000;
          focusCtl.setValue(Math.round(sFocus / 100) / 10);
          draw();
          updateReadout();
        } else {
          lastTs = null;
        }
        window.requestAnimationFrame(frame);
      }

      const ctrl = UI.animControls(panel, st);
      const focusCtl = UI.slider(panel, '对焦环（对焦距离 m）', 2, 30, 0.1, 7, function (v) {
        sFocus = v * 1000;
        ctrl.setPlaying(false);          // 手动对焦即停自动扫描
        trail.length = 0;
        draw(); updateReadout();
      }, { unit: 'm' });
      const apCtl = UI.slider(panel, '光圈 f 值（f/2 → f/16）', 0, STOPS.length - 1, 1, stopIdx, function (v) {
        stopIdx = Math.max(0, Math.min(STOPS.length - 1, Math.round(v)));
        apCtl.valueEl.textContent = 'f/' + N();
        draw(); updateReadout();
      });
      apCtl.valueEl.textContent = 'f/' + N();

      formulaDiv.innerHTML = '';
      UI.texBlock(formulaDiv, '\\frac{1}{u}+\\frac{1}{v}=\\frac{1}{f},\\qquad c=\\frac{f}{N}\\cdot\\frac{\\left|v-v_s\\right|}{v}\\ (\\text{弥散圆})');
      const hint = document.createElement('div'); hint.className = 'note';
      hint.textContent = '质变实验：对准屋（7 m），光圈从 f/2 拉到 f/16——看绿色景深带从一条线撑满整把尺，树和山依次变清晰。';
      panel.appendChild(hint);

      draw();
      updateReadout();
      window.requestAnimationFrame(frame);
    }
  });
})();
