/* fx.js — 奖励可视化特效
 * 积分粒子爆发、皮肤改变动画小球颜色、解锁拖尾特效、奖励面板。
 */
(function () {
  const FX = { particles: [], _inited: false };

  // 小球颜色随已启用皮肤变化（奖励看得见）
  FX.ballColor = function () {
    if (window.Progress && Progress.state.skin === 'fire' && Progress.isUnlocked('skin-fire')) return '#f97316';
    if (window.Progress && Progress.state.skin === 'mint' && Progress.isUnlocked('skin-mint')) return '#14b8a6';
    return '#dc2626';
  };
  FX.trailEnabled = function () {
    return !!(window.Progress && Progress.isUnlocked('fx-trail'));
  };

  // 粒子爆发（得分/解锁时）
  FX.burst = function (x, y, count) {
    FX.ensure();
    const colors = ['#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#a855f7'];
    for (let i = 0; i < (count || 26); i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * 5;
      FX.particles.push({
        x: x, y: y,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 2,
        life: 1, color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 4
      });
    }
  };

  FX.burstAtBadge = function () {
    const badge = document.getElementById('pts-badge');
    if (!badge) return;
    const r = badge.getBoundingClientRect();
    FX.burst(r.left + r.width / 2, r.top + r.height / 2, 30);
  };

  FX.ensure = function () {
    if (FX._inited) return;
    FX._inited = true;
    const c = document.createElement('canvas');
    c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:998';
    document.body.appendChild(c);
    function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    const ctx = c.getContext('2d');
    (function loop() {
      ctx.clearRect(0, 0, c.width, c.height);
      for (let i = FX.particles.length - 1; i >= 0; i--) {
        const p = FX.particles[i];
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.15;
        p.life -= 0.02;
        if (p.life <= 0) { FX.particles.splice(i, 1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      window.requestAnimationFrame(loop);
    })();
  };

  // 拖尾：模块在画小球前调用，传入轨迹数组与当前点
  FX.trail = function (ctx, history, color) {
    if (!FX.trailEnabled() || history.length < 2) return;
    for (let i = 1; i < history.length; i++) {
      ctx.globalAlpha = i / history.length * 0.5;
      ctx.fillStyle = color || FX.ballColor();
      ctx.beginPath();
      ctx.arc(history[i][0], history[i][1], 4 * i / history.length, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  // 奖励面板（首页展示已解锁/未解锁奖励）
  FX.rewardsPanel = function (container) {
    if (!window.Progress) return;
    const card = document.createElement('div');
    card.className = 'viz-card';
    card.style.marginTop = '18px';
    function build() {
      card.innerHTML = '<h3>奖励柜 · 积分解锁（奖励直接改变动画外观）</h3>';
      const box = document.createElement('div');
      box.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;margin-top:8px';
      Progress.UNLOCKS.forEach(function (u) {
        const owned = Progress.isUnlocked(u.id);
        const chip = document.createElement('div');
        chip.style.cssText = 'border:1px solid ' + (owned ? '#f59e0b' : '#e2e8f0') + ';background:' +
          (owned ? '#fffbeb' : '#f8fafc') + ';border-radius:10px;padding:8px 12px;font-size:12.5px;' +
          (owned ? 'color:#92400e;font-weight:700' : 'color:#94a3b8');
        chip.textContent = (owned ? '★ ' : '🔒 ') + u.name + '（' + u.pts + ' 分）';
        if (owned && u.type === 'skin') {
          const btn = document.createElement('button');
          btn.className = 'btn secondary';
          btn.style.cssText = 'margin-left:8px;padding:2px 8px;font-size:11px';
          btn.textContent = Progress.state.skin === u.id.replace('skin-', '') ? '使用中' : '启用';
          btn.addEventListener('click', function () { Progress.setSkin(u.id.replace('skin-', '')); build(); });
          chip.appendChild(btn);
        }
        box.appendChild(chip);
      });
      card.appendChild(box);
    }
    build();
    container.appendChild(card);
  };

  window.FX = FX;
})();
