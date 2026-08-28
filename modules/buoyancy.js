/* buoyancy.js — 浮力实验（初中）
 * 改变物体密度/体积、液体密度，看漂浮、悬浮或下沉；浮力由引擎计算。
 */
(function () {
  App.register({
    id: 'buoyancy',
    title: '浮力：物体的沉与浮',
    subject: 'physics',
    stage: '初中',
    desc: '物体密度小于液体就上漂，大于就下沉。阿基米德原理：F浮 = ρ液gV排。',
    intro: '欢迎来到浮力实验室。物体的密度比液体小就上漂，比液体大就下沉。拖动滑块改变物体和液体的密度，看看会发生什么。',
    render: function (root) {
      const page = document.createElement('div'); page.className = 'module-page';
      const left = document.createElement('div');
      const right = document.createElement('div');
      page.appendChild(left); page.appendChild(right);
      root.appendChild(page);

      const viz = document.createElement('div'); viz.className = 'viz-card';
      viz.innerHTML = '<h3>水槽实验</h3>';
      const wrap = document.createElement('div'); wrap.className = 'canvas-wrap';
      const canvas = document.createElement('canvas');
      wrap.appendChild(canvas); viz.appendChild(wrap);
      left.appendChild(viz);

      const panel = document.createElement('div'); panel.className = 'panel';
      panel.innerHTML = '<h3>实验参数</h3>';
      const readoutDiv = document.createElement('div');
      panel.appendChild(readoutDiv);
      right.appendChild(panel);

      const W = 480, H = 340;
      const ctx = UI.setupCanvas(canvas, W, H);
      let rhoObj = 500, rhoLiq = 1000, size = 60; // kg/m³, 边长 px

      function draw() {
        ctx.clearRect(0, 0, W, H);
        const waterTop = 110, waterBot = H - 30;
        // 水槽
        ctx.fillStyle = 'rgba(59,130,246,.18)';
        ctx.fillRect(60, waterTop, W - 120, waterBot - waterTop);
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
        ctx.strokeRect(60, waterTop - 4, W - 120, waterBot - waterTop + 4);
        // 水面线
        ctx.strokeStyle = '#3b82f6';
        ctx.beginPath(); ctx.moveTo(60, waterTop); ctx.lineTo(W - 60, waterTop); ctx.stroke();

        const V = Math.pow(size / 100, 3); // m³（100px = 1m 约定）
        const g = SCI.CONST.g;
        const G = rhoObj * g * V;           // 物体重力
        let state, Fb, Vdisp;
        if (rhoObj < rhoLiq) {
          // 漂浮：V排/V = ρ物/ρ液
          state = '漂浮';
          Vdisp = V * rhoObj / rhoLiq;
          Fb = G;
        } else if (Math.abs(rhoObj - rhoLiq) < 1) {
          state = '悬浮';
          Vdisp = V;
          Fb = G;
        } else {
          state = '下沉';
          Vdisp = V;
          Fb = SCI.physx.buoyancy(rhoLiq, V);
        }
        // 物体位置
        const frac = Math.min(1, Vdisp / V); // 浸入比例
        const bx = W / 2, bh = size;
        let by;
        if (state === '下沉') by = waterBot - bh - 6;
        else if (state === '悬浮') by = waterTop + (waterBot - waterTop - bh) / 2;
        else by = waterTop - bh * (1 - frac);
        ctx.fillStyle = 'rgba(245,158,11,.9)';
        ctx.fillRect(bx - size / 2, by, size, bh);
        ctx.strokeStyle = '#b45309'; ctx.strokeRect(bx - size / 2, by, size, bh);
        // 力箭头
        function arrow(x, y1, y2, color, label) {
          ctx.strokeStyle = color; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();
          const dir = y2 > y1 ? 1 : -1;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(x - 6, y2 - dir * 9); ctx.lineTo(x + 6, y2 - dir * 9); ctx.lineTo(x, y2);
          ctx.closePath(); ctx.fill();
          ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(label, x, dir > 0 ? y2 + 14 : y2 - 8);
        }
        arrow(bx, by + bh / 2, by + bh / 2 + 40 + G * 1.5, '#dc2626', 'G=' + UI.fmt(G, 1) + 'N');
        arrow(bx + size / 2 + 26, by + bh / 2, by + bh / 2 - 40 - Fb * 1.5, '#059669', 'F浮=' + UI.fmt(Fb, 1) + 'N');
        ctx.fillStyle = '#1e293b'; ctx.font = '13px sans-serif';
        ctx.fillText('状态：' + state, W / 2, 40);

        readoutDiv.innerHTML = '';
        UI.texInline(readoutDiv, 'F_{\\text{浮}} = \\rho_{\\text{液}} g V_{\\text{排}}');
        UI.readout(readoutDiv, [
          ['物体密度', rhoObj + ' kg/m³'],
          ['液体密度', rhoLiq + ' kg/m³'],
          ['物体体积', UI.fmt(V, 4) + ' m³'],
          ['重力 G', UI.fmt(G, 2) + ' N'],
          ['浮力 F浮', UI.fmt(Fb, 2) + ' N'],
          ['浸入比例', state === '下沉' ? '完全浸没' : state === '悬浮' ? '完全浸没' : UI.fmt(frac * 100, 1) + '%'],
          ['生活例子', rhoObj < 400 ? '像木头浮在水面' : rhoObj < rhoLiq ? '像轮船（钢铁做成空心）' : '像石头沉底']
        ]);
      }

      UI.slider(panel, '物体密度 (kg/m³)', 100, 3000, 10, rhoObj, function (v) {
        Voice.param('密度', v > rhoObj ? 'up' : 'down'); rhoObj = v; draw();
      });
      UI.slider(panel, '液体密度 (kg/m³)', 800, 1600, 10, rhoLiq, function (v) { rhoLiq = v; draw(); });
      UI.slider(panel, '物体大小', 40, 90, 2, size, function (v) {
        Voice.param('大小', v > size ? 'up' : 'down'); size = v; draw();
      });
      const hint = document.createElement('div'); hint.className = 'note';
      hint.textContent = '挑战：把液体密度调到 1030（海水），再让物体刚好悬浮——潜水艇就是这样控制沉浮的。';
      panel.appendChild(hint);
      draw();
    }
  });
})();
