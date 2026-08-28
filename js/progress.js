/* progress.js — 进度 / 积分 / 解锁系统（localStorage 持久化） */
(function () {
  const KEY = 'slts_v1';
  const UNLOCKS = [
    { id: 'skin-fire', name: '火焰皮肤', pts: 50, type: 'skin' },
    { id: 'fx-trail', name: '粒子拖尾特效', pts: 80, type: 'fx' },
    { id: 'life-pendulum', name: '生活案例·伽利略的摆钟', pts: 120, type: 'life' },
    { id: 'skin-mint', name: '薄荷皮肤', pts: 200, type: 'skin' }
  ];

  const P = {
    state: { points: 0, lit: {}, unlocked: [], voice: true, skin: 'default', visited: {} },
    load: function () {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) Object.assign(P.state, JSON.parse(raw));
      } catch (e) { }
    },
    save: function () {
      try { localStorage.setItem(KEY, JSON.stringify(P.state)); } catch (e) { }
    },
    addPoints: function (n, reason) {
      P.state.points += n;
      P.save();
      UI.toast('+' + n + ' 积分' + (reason ? ' · ' + reason : ''));
      if (window.FX) FX.burstAtBadge();
      const news = P.checkUnlocks();
      news.forEach(u => { UI.toast('解锁奖励：' + u.name + '！'); if (window.FX) FX.burstAtBadge(); });
      P.refreshUI();
    },
    light: function (moduleId) {
      if (P.state.lit[moduleId]) return false;
      P.state.lit[moduleId] = true;
      P.save();
      UI.toast('点亮知识点！');
      P.addPoints(10, '点亮');
      return true;
    },
    isLit: function (id) { return !!P.state.lit[id]; },
    litCount: function () { return Object.keys(P.state.lit).length; },
    markVisit: function (id) {
      if (P.state.visited[id]) return;
      P.state.visited[id] = true;
      P.save();
      P.addPoints(2, '首次探索');
    },
    isUnlocked: function (id) { return P.state.unlocked.indexOf(id) >= 0; },
    checkUnlocks: function () {
      const news = [];
      UNLOCKS.forEach(u => {
        if (P.state.points >= u.pts && !P.isUnlocked(u.id)) {
          P.state.unlocked.push(u.id);
          news.push(u);
        }
      });
      if (news.length) P.save();
      return news;
    },
    applySkin: function () {
      document.documentElement.setAttribute('data-skin', P.state.skin || 'default');
    },
    setSkin: function (id) {
      P.state.skin = id;
      P.save();
      P.applySkin();
      UI.toast('已切换皮肤');
    },
    refreshUI: function () {
      const badge = document.getElementById('pts-badge');
      if (badge) badge.textContent = '积分 ' + P.state.points + ' · 点亮 ' + P.litCount();
    },
    UNLOCKS: UNLOCKS
  };

  P.load();
  P.checkUnlocks();
  window.Progress = P;
})();
