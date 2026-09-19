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
      const first = !P.state.lit[moduleId];
      P.state.lit[moduleId] = Date.now();
      if (!first) return false;
      P.save();
      UI.toast('点亮知识点！');
      P.addPoints(10, '点亮');
      return true;
    },
    isLit: function (id) { return !!P.state.lit[id]; },
    /* 点亮时间戳（旧数据是 true，视为早已点亮 → 走衰减下限） */
    litAt: function (id) { const v = P.state.lit[id]; return typeof v === 'number' ? v : (v ? 1 : 0); },
    /* 掌握度 0~1：1 天内满分，3 天内 0.6，7 天内  0.3，再久视为遗忘（节点变暗待复习） */
    mastery: function (id) {
      const t = P.litAt(id);
      if (!t) return 0;
      const days = (Date.now() - t) / 86400000;
      if (days < 1) return 1;
      if (days <  3) return 0.6;
      if (days <  7) return 0.3;
      return 0;
    },
    /* 复习答对 → 掌握度回满 */
    relight: function (id) { P.state.lit[id] = Date.now(); P.save(); },
    /* 掌握度三态（连击驱动，叠在时间衰减之上）：
     * solid 稳固🥇 = 该节点连续答对≥2 题且未遗忘；shaky 摇晃⚠️ = 刚答错立即掉级；
     * lit ★ = 已点亮且新鲜；dim = 已点亮但随时间变暗；dark = 未点亮 */
    markCorrect: function (id) {
      if (id === '__diag__') return;
      const m = P.state.mastery2 || (P.state.mastery2 = {});
      const r = m[id] || { s: 0, state: '' };
      r.s++; if (r.s >= 2) r.state = 'solid';
      m[id] = r; P.save();
    },
    markWrong: function (id) {
      if (id === '__diag__') return;
      const m = P.state.mastery2 || (P.state.mastery2 = {});
      m[id] = { s: 0, state: 'shaky' }; P.save();
    },
    masteryState: function (id) {
      const m = P.state.mastery2 && P.state.mastery2[id];
      if (m && m.state === 'shaky') return 'shaky';
      if (m && m.state === 'solid' && P.mastery(id) > 0) return 'solid';
      if (P.isLit(id)) return P.mastery(id) >= 1 ? 'lit' : 'dim';
      return 'dark';
    },
    /* 前置依赖：全部已点亮才可学（软门槛）。返回 {ok, missing:[id...]} */
    checkGate: function (id) {
      const deps = (window.Deps && Deps[id]) || [];
      const missing = deps.filter(d => !P.isLit(d));
      return { ok: missing.length === 0, missing: missing };
    },
    /* 今日回顾：已点亮但掌握度衰减 + 答错摇晃的条目 */
    reviewList: function () {
      const out = [];
      for (const id in P.state.lit) { if (P.mastery(id) < 1) out.push(id); }
      const m = P.state.mastery2 || {};
      for (const id in m) { if (m[id].state === 'shaky' && out.indexOf(id) < 0) out.push(id); }
      return out;
    },
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
