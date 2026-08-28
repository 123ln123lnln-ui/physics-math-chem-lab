/* ohms-law.js — 欧姆定律：电路实验（初中）
 * 调电压与电阻，看电流变化与灯泡亮度；可反转电流方向。
 */
(function () {
  App.register({
    id: 'ohms-law',
    title: '欧姆定律：I = U / R',
    subject: 'physics',
    stage: '初中',
    desc: '像真的做实验一样：调节电源电压与电阻，观察电流表和灯泡亮度。',
    intro: '欢迎来到欧姆定律实验室。电流等于电压除以电阻。调高电压，或者减小电阻，电流都会变大，灯泡也更亮。',
    render: function (root) {
      const page = document.createElement('div'); page.className = 'module-page';
      const left = document.createElement('div');
      const right = document.createElement('div');
      page.appendChild(left); page.appendChild(right);
      root.appendChild(page);

      const viz = document.createElement('div'); viz.className = 'viz-card';
      viz.innerHTML = '<h3>电路实验板</h3>';
      const wrap = document.createElement('div'); wrap.className = 'canvas-wrap';
      const canvas = document.createElement('canvas');
      wrap.appendChild(canvas); viz.appendChild(wrap);
      left.appendChild(viz);

      const panel = document.createElement('div'); panel.className = 'panel';
      panel.innerHTML = '<h3>实验参数</h3>';
      const readoutDiv = document.createElement('div');
      panel.appendChild(readoutDiv);
      right.appendChild(panel);

      const W = 480, H = 320;
      const ctx = UI.setupCanvas(canvas, W, H);
      let U = 6, R = 3, dir = 1; // dir: 电流方向 1/-1

      function draw() {
        try {
          const I = SCI.physx.ohmCurrent(U, R) * dir;
          ctx.clearRect(0, 0, W, H);
          const x0 = 70, x1 = W - 70, y0 = 70, y1 = H - 70;
          // 导线
          ctx.strokeStyle = '#475569'; ctx.lineWidth = 2.5;
          ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
          // 电池（左）
          ctx.fillStyle = '#fff'; ctx.fillRect(x0 - 14, y0 + 40, 28, 60);
          ctx.strokeRect(x0 - 14, y0 + 40, 28, 60);
          ctx.fillStyle = '#1e293b'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(U + 'V', x0, y0 + 75);
          ctx.fillText('电源', x0, y0 + 115);
          // 电阻（右）
          ctx.fillStyle = '#fff'; ctx.fillRect(x1 - 30, y0 + 45, 60, 50);
          ctx.strokeRect(x1 - 30, y0 + 45, 60, 50);
          ctx.fillText(R + 'Ω', x1, y0 + 75);
          // 电流表（下）
          ctx.beginPath(); ctx.arc((x0 + x1) / 2, y1, 26, 0, Math.PI * 2);
          ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
          ctx.fillText('A', (x0 + x1) / 2, y1 - 2);
          ctx.font = 'bold 13px sans-serif'; ctx.fillStyle = '#dc2626';
          ctx.fillText(Math.abs(I).toFixed(2) + 'A', (x0 + x1) / 2, y1 + 16);
          // 灯泡（上，亮度随功率）
          const P = U * Math.abs(I);
          const glow = Math.min(1, P / 30);
          const bx = (x0 + x1) / 2, by = y0;
          if (glow > 0.02) {
            const grad = ctx.createRadialGradient(bx, by, 2, bx, by, 44);
            grad.addColorStop(0, 'rgba(250,204,21,' + (0.35 + glow * 0.6) + ')');
            grad.addColorStop(1, 'rgba(250,204,21,0)');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(bx, by, 44, 0, Math.PI * 2); ctx.fill();
          }
          ctx.beginPath(); ctx.arc(bx, by, 14, 0, Math.PI * 2);
          ctx.fillStyle = glow > 0.02 ? '#facc15' : '#e2e8f0';
          ctx.fill(); ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.fillStyle = '#1e293b'; ctx.font = '12px sans-serif';
          ctx.fillText('灯泡', bx, by - 24);
          // 电流方向箭头（沿电路）
          ctx.fillStyle = dir > 0 ? '#2563eb' : '#f59e0b';
          const ax = dir > 0 ? x1 - 60 : x0 + 60;
          ctx.beginPath();
          if (dir > 0) { ctx.moveTo(ax, y0 - 10); ctx.lineTo(ax - 12, y0 - 16); ctx.lineTo(ax - 12, y0 - 4); }
          else { ctx.moveTo(ax, y0 - 10); ctx.lineTo(ax + 12, y0 - 16); ctx.lineTo(ax + 12, y0 - 4); }
          ctx.closePath(); ctx.fill();
          ctx.font = '12px sans-serif';
          ctx.fillText(dir > 0 ? '电流方向 →' : '← 电流方向', (x0 + x1) / 2, y0 - 24);

          readoutDiv.innerHTML = '';
          UI.texInline(readoutDiv, 'I = \\frac{U}{R}');
          UI.readout(readoutDiv, [
            ['电压 U', U + ' V'],
            ['电阻 R', R + ' Ω'],
            ['电流 I', UI.fmt(Math.abs(I), 2) + ' A'],
            ['电功率 P = UI', UI.fmt(P, 1) + ' W'],
            ['灯泡亮度', glow > 0.6 ? '很亮 ✨' : glow > 0.2 ? '正常发光' : glow > 0.02 ? '微亮' : '不亮']
          ]);
        } catch (e) { readoutDiv.innerHTML = ''; UI.showError(readoutDiv, e); }
      }

      UI.slider(panel, '电压 U (V)', 0, 12, 0.5, U, function (v) { U = v; draw(); }, { unit: 'V' });
      UI.slider(panel, '电阻 R (Ω)', 1, 20, 0.5, R, function (v) { R = v; draw(); }, { unit: 'Ω' });
      const dirBtn = document.createElement('button');
      dirBtn.className = 'btn secondary';
      dirBtn.textContent = '反转电流方向';
      dirBtn.addEventListener('click', function () { dir = -dir; draw(); });
      panel.appendChild(dirBtn);
      const hint = document.createElement('div'); hint.className = 'note';
      hint.textContent = '安全提示：真实实验中电流不能无限大——电压不变时电阻太小会烧坏元件（短路危险）。';
      hint.style.marginTop = '10px';
      panel.appendChild(hint);
      draw();
    }
  });
})();
