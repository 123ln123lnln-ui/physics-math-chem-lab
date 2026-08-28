/* lever-balance.js — 杠杆平衡（初中）
 * 拖动力、动力臂、阻力臂，实时看需要的阻力与杠杆倾斜。
 */
(function () {
  App.register({
    id: 'lever-balance',
    title: '杠杆平衡：F₁L₁ = F₂L₂',
    subject: 'physics',
    stage: '初中',
    desc: '调整力与力臂，让杠杆保持水平——阿基米德说：给我一个支点，我能撬起地球。',
    intro: '欢迎来到杠杆平衡。动力乘以动力臂，等于阻力乘以阻力臂，杠杆就平衡了。试着调节两边的力和力臂。',
    render: function (root) {
      const page = document.createElement('div'); page.className = 'module-page';
      const left = document.createElement('div');
      const right = document.createElement('div');
      page.appendChild(left); page.appendChild(right);
      root.appendChild(page);

      const viz = document.createElement('div'); viz.className = 'viz-card';
      viz.innerHTML = '<h3>杠杆（自动保持平衡需要的力）</h3>';
      const wrap = document.createElement('div'); wrap.className = 'canvas-wrap';
      const canvas = document.createElement('canvas');
      wrap.appendChild(canvas); viz.appendChild(wrap);
      left.appendChild(viz);

      const panel = document.createElement('div'); panel.className = 'panel';
      panel.innerHTML = '<h3>参数调节</h3>';
      const readoutDiv = document.createElement('div');
      panel.appendChild(readoutDiv);
      right.appendChild(panel);

      const W = 480, H = 300;
      const ctx = UI.setupCanvas(canvas, W, H);
      let F1 = 20, L1 = 1.5, L2 = 1.0; // 动力、动力臂、阻力臂

      function draw() {
        ctx.clearRect(0, 0, W, H);
        try {
          const F2 = SCI.physx.leverBalanceForce(F1, L1, L2);
          const cx = W / 2, cy = H * 0.62;
          const scale = (W / 2 - 60) / 3; // 力臂最大 3m
          // 支点三角
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.moveTo(cx, cy); ctx.lineTo(cx - 18, cy + 34); ctx.lineTo(cx + 18, cy + 34);
          ctx.closePath(); ctx.fill();
          // 横杆（平衡时水平）
          ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.moveTo(cx - 3 * scale, cy); ctx.lineTo(cx + 3 * scale, cy);
          ctx.stroke();
          // 力臂刻度
          ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1;
          for (let i = -3; i <= 3; i++) {
            ctx.beginPath(); ctx.moveTo(cx + i * scale, cy - 6); ctx.lineTo(cx + i * scale, cy + 6); ctx.stroke();
          }
          // 左侧动力（下压箭头，大小正比于力）
          function arrow(x, F, color, label) {
            const len = 30 + F * 1.2;
            ctx.strokeStyle = color; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(x, cy - 20 - len); ctx.lineTo(x, cy - 12); ctx.stroke();
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x - 8, cy - 24); ctx.lineTo(x + 8, cy - 24); ctx.lineTo(x, cy - 8);
            ctx.closePath(); ctx.fill();
            ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(label, x, cy - 26 - len);
          }
          arrow(cx - L1 * scale, F1, '#dc2626', 'F₁=' + F1 + 'N');
          arrow(cx + L2 * scale, F2, '#2563eb', 'F₂=' + UI.fmt(F2, 1) + 'N');
          // 力臂标注
          ctx.fillStyle = '#dc2626'; ctx.font = '12px sans-serif';
          ctx.fillText('L₁=' + L1 + 'm', cx - L1 * scale / 2, cy + 22);
          ctx.fillStyle = '#2563eb';
          ctx.fillText('L₂=' + L2 + 'm', cx + L2 * scale / 2, cy + 22);

          readoutDiv.innerHTML = '';
          UI.texInline(readoutDiv, 'F_1 L_1 = F_2 L_2');
          UI.readout(readoutDiv, [
            ['动力 F₁ × 动力臂 L₁', UI.fmt(F1 * L1, 1) + ' N·m'],
            ['需要的阻力 F₂', UI.fmt(F2, 2) + ' N'],
            ['杠杆类型', L1 > L2 ? '省力杠杆（L₁>L₂）' : L1 < L2 ? '费力杠杆（L₁<L₂，但省距离）' : '等臂杠杆'],
            ['生活例子', L1 > L2 ? '撬棍、开瓶器' : L1 < L2 ? '镊子、钓鱼竿' : '天平']
          ]);
        } catch (e) { readoutDiv.innerHTML = ''; UI.showError(readoutDiv, e); }
      }

      UI.slider(panel, '动力 F₁ (N)', 5, 100, 1, F1, function (v) { F1 = v; draw(); }, { unit: 'N' });
      UI.slider(panel, '动力臂 L₁ (m)', 0.2, 3, 0.1, L1, function (v) { L1 = v; draw(); }, { unit: 'm' });
      UI.slider(panel, '阻力臂 L₂ (m)', 0.2, 3, 0.1, L2, function (v) { L2 = v; draw(); }, { unit: 'm' });
      const hint = document.createElement('div'); hint.className = 'note';
      hint.textContent = '玩一玩：把动力臂拉到最大、阻力臂拉到最小，看看多大的重物都能被小力气撬动！';
      panel.appendChild(hint);
      draw();
    }
  });
})();
