/* bootstrap.js — 站点启动 */
(function () {
  window.addEventListener('hashchange', App.route);
  window.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();

  function init() {
    if (!window.SCI) {
      document.getElementById('app').innerHTML =
        '<div class="error-box">科学引擎未加载，请检查 engine/ 目录文件是否完整。</div>';
      return;
    }
    // 皮肤 / 积分徽章 / 语音开关
    if (window.Progress) {
      Progress.applySkin();
      Progress.refreshUI();
    }
    const vt = document.getElementById('voice-toggle');
    if (vt && window.Voice) {
      vt.style.cursor = 'pointer';
      vt.textContent = Voice.enabled ? '🔊 语音' : '🔇 静音';
      vt.addEventListener('click', function () {
        Voice.enabled = !Voice.enabled;
        vt.textContent = Voice.enabled ? '🔊 语音' : '🔇 静音';
        if (!Voice.enabled && window.speechSynthesis) speechSynthesis.cancel();
        if (Voice.enabled) Voice.girl('语音打开啦！');
      });
    }
    App.route();
  }
})();
