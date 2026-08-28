/* titration.js — 强酸强碱滴定曲线（高中）
 * 曲线逐点由引擎计算；等当点由化学计量确定（25°C 时 pH=7）。
 */
(function () {
  App.register({
    id: 'titration',
    title: '强酸强碱滴定曲线',
    subject: 'chemistry',
    stage: '高中',
    desc: '用 NaOH 滴定 HCl，拖动加入体积观察 pH 突变，理解等当点与指示剂选择。',
    render: function (root) {
      const page = document.createElement('div'); page.className = 'module-page';
      const left = document.createElement('div');
      const right = document.createElement('div');
      page.appendChild(left); page.appendChild(right);
      root.appendChild(page);

      const viz = document.createElement('div'); viz.className = 'viz-card';
      viz.innerHTML = '<h3>pH — V(NaOH) 曲线</h3>';
      const wrap = document.createElement('div'); wrap.className = 'canvas-wrap';
      const canvas = document.createElement('canvas');
      wrap.appendChild(canvas);
      viz.appendChild(wrap);
      left.appendChild(viz);

      const panel = document.createElement('div'); panel.className = 'panel';
      panel.innerHTML = '<h3>滴定操作</h3>';
      right.appendChild(panel);
      const readoutDiv = document.createElement('div');
      panel.appendChild(readoutDiv);

      const W = 520, H = 340, padL = 45, padB = 35, padT = 15, padR = 15;
      const ctx = UI.setupCanvas(canvas, W, H);

      const Ca = 0.1, Va = 20, Cb = 0.1; // 0.1 mol/L NaOH 滴定 20 mL 0.1 mol/L HCl
      const Vmax = 40;
      const Veq = Ca * Va / Cb; // 等当点体积 = 20 mL

      let Vb = 10;

      function toX(v) { return padL + (W - padL - padR) * v / Vmax; }
      function toY(pH) { return padT + (H - padT - padB) * (1 - pH / 14); }

      function draw() {
        ctx.clearRect(0, 0, W, H);
        // 坐标轴
        ctx.strokeStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(padL, padT); ctx.lineTo(padL, H - padB); ctx.lineTo(W - padR, H - padB);
        ctx.stroke();
        ctx.fillStyle = '#475569'; ctx.font = '12px sans-serif';
        ctx.fillText('pH', 8, padT + 10);
        ctx.fillText('V(NaOH)/mL', W - padR - 90, H - 8);
        for (let p = 0; p <= 14; p += 2) {
          ctx.fillText(String(p), padL - 20, toY(p) + 4);
          ctx.strokeStyle = '#f1f5f9';
          ctx.beginPath(); ctx.moveTo(padL, toY(p)); ctx.lineTo(W - padR, toY(p)); ctx.stroke();
        }
        for (let v = 0; v <= Vmax; v += 10) {
          ctx.fillText(String(v), toX(v) - 5, H - padB + 16);
        }
        // pH=7 参考线
        ctx.strokeStyle = '#f59e0b'; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(padL, toY(7)); ctx.lineTo(W - padR, toY(7)); ctx.stroke();
        ctx.setLineDash([]);

        // 曲线（逐点引擎计算）
        ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2;
        ctx.beginPath();
        for (let v = 0.05; v <= Vmax; v += 0.05) {
          const pH = SCI.chemx.strongAcidBaseTitration(Ca, Va, Cb, v);
          const x = toX(v), y = toY(pH);
          if (v <= 0.05) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 当前点
        const pH = SCI.chemx.strongAcidBaseTitration(Ca, Va, Cb, Vb);
        ctx.fillStyle = '#dc2626';
        ctx.beginPath(); ctx.arc(toX(Vb), toY(pH), 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.fillText('pH=' + pH.toFixed(2), toX(Vb) + 10, toY(pH) - 8);
      }

      function updateReadout() {
        try {
          const pH = SCI.chemx.strongAcidBaseTitration(Ca, Va, Cb, Vb);
          const stage = Vb < Veq ? '等当点前（酸过量）' : Math.abs(Vb - Veq) < 0.01 ? '恰好等当点' : '等当点后（碱过量）';
          readoutDiv.innerHTML = '';
          UI.texInline(readoutDiv, 'HCl + NaOH = NaCl + H_2O');
          UI.readout(readoutDiv, [
            ['加入 NaOH', UI.fmt(Vb, 1) + ' mL'],
            ['溶液 pH', UI.fmt(pH, 2)],
            ['滴定阶段', stage],
            ['等当点体积', UI.fmt(Veq, 1) + ' mL（pH=7, 25°C）'],
            ['指示剂建议', '酚酞（8.2–10.0）或甲基橙（3.1–4.4）']
          ]);
        } catch (e) { UI.showError(readoutDiv, e); }
      }

      UI.slider(panel, '加入 NaOH 体积 (mL)', 0, Vmax, 0.1, Vb, function (v) { Vb = v; draw(); updateReadout(); });
      const hint = document.createElement('div'); hint.className = 'note';
      hint.textContent = '注意等当点（20 mL）附近的 pH 突变：从约 19 mL 到 21 mL，pH 从约 2.9 跃升到约 11。这就是指示剂变色的依据。';
      panel.appendChild(hint);

      draw();
      updateReadout();
    }
  });
})();
