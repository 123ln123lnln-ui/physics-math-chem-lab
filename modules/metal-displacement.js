/* metal-displacement.js — 金属置换反应动画（初中）
 * 铁钉入硫酸铜：粒子级动画演示 Fe + CuSO₄ → FeSO₄ + Cu 析出。
 */
(function () {
  App.register({
    id: 'metal-displacement',
    title: '金属置换反应：铁钉遇硫酸铜',
    subject: 'chemistry',
    stage: '初中',
    desc: '把铁钉放进蓝色硫酸铜溶液，铁慢慢溶解，红色的铜析出在铁钉表面。',
    intro: '欢迎来到化学实验室。铁比铜活泼，所以铁能把铜从它的盐溶液里置换出来。点击开始实验，观察这场"换座位"的舞蹈。',
    render: function (root) {
      const page = document.createElement('div'); page.className = 'module-page';
      const left = document.createElement('div');
      const right = document.createElement('div');
      page.appendChild(left); page.appendChild(right);
      root.appendChild(page);

      const viz = document.createElement('div'); viz.className = 'viz-card';
      viz.innerHTML = '<h3>实验演示（点击"开始实验"）</h3>';
      const wrap = document.createElement('div'); wrap.className = 'canvas-wrap';
      const canvas = document.createElement('canvas');
      wrap.appendChild(canvas); viz.appendChild(wrap);
      left.appendChild(viz);

      const panel = document.createElement('div'); panel.className = 'panel';
      panel.innerHTML = '<h3>反应原理</h3>';
      const readoutDiv = document.createElement('div');
      panel.appendChild(readoutDiv);
      right.appendChild(panel);

      const W = 460, H = 360;
      const ctx = UI.setupCanvas(canvas, W, H);
      const st = { playing: false, loop: false };
      let t = 0;

      // 溶液中的铜离子（蓝色点），会被铁钉"抓走"变成铜（红色附着）
      const cuIons = [];
      for (let i = 0; i < 26; i++) {
        cuIons.push({ x: 70 + Math.random() * (W - 140), y: 130 + Math.random() * 160, caught: false, cx: 0, cy: 0 });
      }

      function draw() {
        ctx.clearRect(0, 0, W, H);
        // 烧杯
        ctx.fillStyle = 'rgba(59,130,246,.16)';
        ctx.fillRect(60, 120, W - 120, 210);
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3;
        ctx.strokeRect(60, 110, W - 120, 224);
        // 溶液颜色随反应变浅（Cu²⁺ 减少）
        const caughtN = cuIons.filter(c => c.caught).length;
        const blueAlpha = 0.30 * (1 - caughtN / cuIons.length * 0.85);
        ctx.fillStyle = 'rgba(37,99,235,' + blueAlpha.toFixed(3) + ')';
        ctx.fillRect(62, 122, W - 124, 206);
        // 铁钉（中间竖放），表面随反应覆盖铜（渐变棕色）
        const nailX = W / 2 - 12;
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(nailX, 90, 24, 220);
        ctx.beginPath(); ctx.arc(nailX + 12, 88, 13, 0, Math.PI * 2);
        ctx.fillStyle = '#94a3b8'; ctx.fill();
        // 铜析出覆盖（从下往上）
        const cover = Math.min(1, caughtN / cuIons.length) * 200;
        if (cover > 2) {
          ctx.fillStyle = 'rgba(180,83,9,.85)';
          ctx.fillRect(nailX - 1, 310 - cover, 26, cover);
        }
        // 铜离子动画
        cuIons.forEach(function (c) {
          if (!c.caught) {
            c.x += (Math.random() - 0.5) * 1.6;
            c.y += (Math.random() - 0.5) * 1.6;
            c.x = Math.max(72, Math.min(W - 72, c.x));
            c.y = Math.max(132, Math.min(322, c.y));
            ctx.fillStyle = 'rgba(37,99,235,.9)';
            ctx.beginPath(); ctx.arc(c.x, c.y, 5, 0, Math.PI * 2); ctx.fill();
          } else {
            // 飞向铁钉表面
            c.cx += (nailX + 12 - c.cx) * 0.08;
            c.cy += (300 - Math.random() * cover - c.cy) * 0.08;
            ctx.fillStyle = 'rgba(180,83,9,.95)';
            ctx.beginPath(); ctx.arc(c.cx, c.cy, 5, 0, Math.PI * 2); ctx.fill();
          }
        });
        // 反应进行中：随机抓一个铜离子
        if (st.playing && t > 0.4) {
          t = 0;
          const free = cuIons.filter(c => !c.caught);
          if (free.length) {
            const pick = free[Math.floor(Math.random() * free.length)];
            pick.caught = true; pick.cx = pick.x; pick.cy = pick.y;
            Voice.girl('铁把铜挤出来啦！');
          } else {
            st.playing = false;
            Voice.girl('反应完成！铁钉穿上了红色的铜外套。');
          }
        }
        ctx.fillStyle = '#1e293b'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('蓝色 = Cu²⁺ 离子，棕色 = 析出的铜', W / 2, 350);
      }

      let lastTs = null;
      function frame(ts) {
        if (st.playing) {
          if (lastTs === null) lastTs = ts;
          t += (ts - lastTs) / 1000 * Anim.speed;
          lastTs = ts;
          draw();
        }
        window.requestAnimationFrame(frame);
      }

      const ctrl = UI.animControls(panel, st);
      const startBtn = document.createElement('button');
      startBtn.className = 'btn';
      startBtn.textContent = '开始实验';
      startBtn.addEventListener('click', function () {
        cuIons.forEach(c => { c.caught = false; });
        st.playing = true; ctrl.setPlaying(true);
        Voice.girl('实验开始咯！');
      });
      panel.appendChild(startBtn);

      readoutDiv.innerHTML = '';
      UI.texBlock(readoutDiv, 'Fe + CuSO_4 = FeSO_4 + Cu');
      UI.readout(readoutDiv, [
        ['反应类型', '置换反应'],
        ['判断依据', 'Fe 在活动性顺序中位于 Cu 之前'],
        ['现象', '铁钉表面覆盖红色固体，溶液蓝色变浅'],
        ['生活应用', '湿法炼铜（从含铜溶液中回收铜）']
      ]);
      const hint = document.createElement('div'); hint.className = 'note';
      hint.textContent = '反过来试试：铜片放进硫酸亚铁溶液会怎样？（答案：不反应——铜不如铁活泼。）';
      panel.appendChild(hint);

      draw();
      window.requestAnimationFrame(frame);
    }
  });
})();
