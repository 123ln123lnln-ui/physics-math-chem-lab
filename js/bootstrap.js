/* bootstrap.js — 站点启动 */
(function () {
  window.addEventListener('hashchange', App.route);
  window.addEventListener('DOMContentLoaded', function () {
    if (!window.SCI) {
      document.getElementById('app').innerHTML =
        '<div class="error-box">科学引擎未加载，请检查 engine/ 目录文件是否完整。</div>';
      return;
    }
    App.route();
  });
  // DOMContentLoaded 已过时直接启动
  if (document.readyState !== 'loading' && window.SCI) App.route();
})();
