/* concept-anim6.js — 场景化演示引擎（第三批：替换剩余通用流程图） */
(function () {
  const GEN = window.ConceptAnim.GEN;
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

  /* 性质决定用途：氢气性质 → 用途连线（场景：气球/火箭/焊接） */
  GEN.propUse = function (holder, o) {
    const V = mk(holder, 340, 200, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const props = ['密度最小', '可燃放热', '还原性'];
      const uses = ['充气球/飞艇', '火箭燃料', '冶炼金属'];
      const act = Math.floor(t / 100) % 3;
      props.forEach(function (p, i) {
        ctx.fillStyle = i === act ? '#dbeafe' : '#f8fafc';
        ctx.strokeStyle = i === act ? '#2563eb' : '#cbd5e1';
        ctx.beginPath(); ctx.arc(70, 40 + i * 55, 26, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#1e293b'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(p, 70, 44 + i * 55); ctx.textAlign = 'left';
      });
      uses.forEach(function (u, i) {
        ctx.fillStyle = i === act ? '#fef3c7' : '#f8fafc';
        ctx.strokeStyle = i === act ? '#f59e0b' : '#cbd5e1';
        ctx.beginPath(); ctx.arc(270, 40 + i * 55, 26, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#1e293b'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(u, 270, 44 + i * 55); ctx.textAlign = 'left';
      });
      // 高亮连线
      ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(96, 40 + act * 55); ctx.lineTo(244, 40 + act * 55); ctx.stroke();
      ctx.fillStyle = '#dc2626'; ctx.font = '11px sans-serif';
      ctx.fillText('性质 → 用途', 140, 30 + act * 55);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 实验操作规范：酒精灯/试管/量筒 场景轮播 */
  GEN.labSafety = function (holder, o) {
    const V = mk(holder, 340, 200, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const step = Math.floor(t / 140) % 3;
      ctx.fillStyle = '#475569'; ctx.font = 'bold 12px sans-serif';
      const titles = ['① 取用：块状用镊子，粉末用药匙', '② 加热：先预热，管口不对人', '③ 读数：视线与凹液面最低处水平'];
      ctx.fillText(titles[step], 60, 24);
      if (step === 0) {
        // 镊子夹块状
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(120, 60); ctx.lineTo(150, 100); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(135, 55); ctx.lineTo(150, 100); ctx.stroke();
        ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.arc(152, 108, 8, 0, Math.PI * 2); ctx.fill();
        // 药匙+粉末
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.ellipse(230, 100, 16, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#64748b'; ctx.beginPath(); ctx.moveTo(244, 96); ctx.lineTo(280, 70); ctx.stroke();
      } else if (step === 1) {
        // 试管倾斜加热
        ctx.save(); ctx.translate(170, 100); ctx.rotate(-0.5);
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2; ctx.strokeRect(-10, -45, 20, 70);
        ctx.fillStyle = 'rgba(59,130,246,.4)'; ctx.fillRect(-8, 0, 16, 22);
        ctx.restore();
        ctx.fillStyle = 'rgba(245,158,11,.7)';
        ctx.beginPath(); ctx.ellipse(150, 145, 9, 14, 0, 0, Math.PI * 2); ctx.fill();
        // 箭头：管口朝向无人方向
        ctx.strokeStyle = '#dc2626';
        ctx.beginPath(); ctx.moveTo(200, 70); ctx.lineTo(240, 50); ctx.stroke();
        ctx.fillStyle = '#dc2626'; ctx.font = '10px sans-serif'; ctx.fillText('管口不对人', 245, 48);
      } else {
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
        ctx.strokeRect(150, 50, 40, 110);
        ctx.fillStyle = 'rgba(59,130,246,.5)'; ctx.fillRect(153, 100, 34, 57);
        // 眼睛+视线
        ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.arc(90, 100, 8, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#16a34a'; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(100, 100); ctx.lineTo(150, 100); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#16a34a'; ctx.font = '10px sans-serif'; ctx.fillText('平视 ✓', 105, 90);
      }
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* NA 四查：四个检查站场景 */
  GEN.naCheck = function (holder, o) {
    const V = mk(holder, 340, 190, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const items = [
        ['标况状态', '水/乙醇/己烷不是气体！', 60],
        ['水解', '弱离子会水解，数目减少', 140],
        ['特殊结构', 'Na₂O₂ 阴离子是 O₂²⁻', 220],
        ['可逆', '可逆反应不能进行完全', 300]
      ];
      const act = Math.floor(t / 110) % 4;
      items.forEach(function (it, i) {
        const x = it[2];
        // 检查站牌
        ctx.fillStyle = i === act ? '#fee2e2' : '#f8fafc';
        ctx.strokeStyle = i === act ? '#dc2626' : '#cbd5e1';
        ctx.lineWidth = i === act ? 2.5 : 1;
        ctx.beginPath(); ctx.arc(x, 70, 26, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = i === act ? '#dc2626' : '#94a3b8';
        ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(it[0], x, 74); ctx.textAlign = 'left';
        if (i === act) {
          ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
          ctx.fillText(it[1], 60, 130);
        }
      });
      ctx.fillStyle = '#64748b'; ctx.font = '11px sans-serif';
      ctx.fillText('NA 题逐站检查，任何一站不通过就选错', 70, 165);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };

  /* 数列求和：裂项相消的"多米诺抵消"场景 */
  GEN.telescope = function (holder, o) {
    const V = mk(holder, 340, 180, false);
    let t = 0;
    (function loop() {
      const ctx = V.ctx;
      ctx.clearRect(0, 0, V.w, V.h);
      const n = 5;
      const ph = (t % 260) / 260;
      for (let i = 0; i < n; i++) {
        const x = 30 + i * 62;
        // 每项 = 1/i - 1/(i+1) 两块
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x, 60, 26, 34);
        ctx.fillStyle = '#f87171';
        ctx.fillRect(x + 28, 60, 26, 34);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('1/' + (i + 1), x + 13, 80);
        ctx.fillText('-1/' + (i + 2), x + 41, 80);
        ctx.textAlign = 'left';
        // 抵消动画：相邻的 -1/(i+1) 与 +1/(i+1) 淡出
        if (i < n - 1 && ph > 0.3) {
          ctx.globalAlpha = Math.max(0, 1 - (ph - 0.3) * 3);
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(x + 28, 60, 26, 34);
          ctx.fillRect(x + 62, 60, 26, 34);
          ctx.globalAlpha = 1;
          ctx.strokeStyle = '#dc2626';
          ctx.beginPath(); ctx.moveTo(x + 30, 62); ctx.lineTo(x + 86, 92); ctx.stroke();
        }
      }
      ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif';
      ctx.fillText(ph > 0.7 ? '只剩首尾两项：1 - 1/(n+1)' : '1/n(n+1) = 1/n - 1/(n+1)，相邻项互相抵消', 40, 140);
      cap(ctx, V, o.label || '');
      t++; window.requestAnimationFrame(loop);
    })();
  };
})();
