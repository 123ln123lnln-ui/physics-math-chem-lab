/* app.js — 站点框架：模块注册、路由、首页与学科列表页
 * 模块以“交互件”为单位注册；每科按学段分组。
 */
(function (global) {
  const App = {};

  // ---------- 模块注册表 ----------
  // 每个模块: { id, title, stage('初中'|'高中'), subject, desc, render(root) }
  App.modules = [];
  App.register = function (mod) { App.modules.push(mod); };
  App.bySubject = function (subject) { return App.modules.filter(m => m.subject === subject); };
  App.get = function (id) { return App.modules.find(m => m.id === id); };

  // ---------- 视图 ----------
  const $app = function () { return document.getElementById('app'); };

  function clearApp() { const el = $app(); el.innerHTML = ''; return el; }

  // 首页
  App.renderHome = function () {
    const root = clearApp();
    const hero = document.createElement('div');
    hero.className = 'hero';
    hero.innerHTML =
      '<h1>数理通 · 初高中数理化交互实验室</h1>' +
      '<p>拖动、调整、观察 —— 每个知识点都是一个可以动手的实验。</p>';
    const badges = document.createElement('div');
    badges.className = 'badges';
    ['黄金测试校验', '量纲运行时校验', '常数单一事实源', '渲染与公式分离'].forEach(t => {
      const b = document.createElement('span'); b.className = 'badge'; b.textContent = t; badges.appendChild(b);
    });
    hero.appendChild(badges);
    root.appendChild(hero);

    const grid = document.createElement('div');
    grid.className = 'subject-grid';
    const defs = [
      { subject: 'math', title: '数学', cls: '', desc: '函数、几何、三角、解析几何与微积分入门', formula: 'y=ax^2+bx+c' },
      { subject: 'physics', title: '物理', cls: 'physics', desc: '运动、力、光、电与振动波动', formula: 's=v_0t+\\tfrac{1}{2}at^2' },
      { subject: 'chemistry', title: '化学', cls: 'chem', desc: '分子结构、方程式、溶液与周期律', formula: '2H_2+O_2\\rightarrow 2H_2O' }
    ];
    defs.forEach(d => {
      const card = document.createElement('div');
      card.className = 'subject-card ' + d.cls;
      const h2 = document.createElement('h2'); h2.textContent = d.title; card.appendChild(h2);
      const p = document.createElement('p'); p.className = 'desc'; p.textContent = d.desc; card.appendChild(p);
      const f = document.createElement('div'); card.appendChild(f);
      UI.tex(f, d.formula, true);
      const ul = document.createElement('ul');
      App.bySubject(d.subject).forEach(m => {
        const li = document.createElement('li');
        li.innerHTML = '<a href="#/m/' + m.id + '">' + m.title + '<span class="stage">' + m.stage + '</span></a>';
        ul.appendChild(li);
      });
      card.appendChild(ul);
      grid.appendChild(card);
    });
    root.appendChild(grid);

    // 首页内嵌交互演示：打开即玩
    const tryCard = document.createElement('div');
    tryCard.className = 'viz-card';
    tryCard.style.marginTop = '28px';
    tryCard.innerHTML = '<h3>打开即玩：抛体运动实验（拖动滑块试试）</h3>';
    root.appendChild(tryCard);
    const demoWrap = document.createElement('div');
    tryCard.appendChild(demoWrap);
    if (window.HomeDemo) {
      try { window.HomeDemo.render(demoWrap); } catch (e) { UI.showError(demoWrap, e); }
    }
  };

  // 学科列表页
  App.renderSubject = function (subject) {
    const root = clearApp();
    const names = { math: '数学', physics: '物理', chemistry: '化学' };
    const h1 = document.createElement('h1'); h1.textContent = names[subject] + ' · 交互知识点'; root.appendChild(h1);
    const stages = ['初中', '高中'];
    stages.forEach(stage => {
      const mods = App.bySubject(subject).filter(m => m.stage === stage);
      const h2 = document.createElement('h2'); h2.textContent = stage; root.appendChild(h2);
      const grid = document.createElement('div'); grid.className = 'subject-grid';
      mods.forEach(m => {
        const card = document.createElement('div');
        card.className = 'subject-card';
        card.innerHTML = '<h2 style="font-size:17px"><a style="text-decoration:none;color:inherit" href="#/m/' + m.id + '">' +
          m.title + '</a></h2><p class="desc">' + (m.desc || '') + '</p>';
        grid.appendChild(card);
      });
      root.appendChild(grid);
    });
  };

  // 模块页
  App.renderModule = function (id) {
    const m = App.get(id);
    const root = clearApp();
    if (!m) {
      root.innerHTML = '<div class="viz-card"><h3>未找到该知识点</h3><a class="back-link" href="#/">返回首页</a></div>';
      return;
    }
    const back = document.createElement('a');
    back.className = 'back-link'; back.href = '#/' + m.subject; back.textContent = '← 返回' + { math: '数学', physics: '物理', chemistry: '化学' }[m.subject];
    root.appendChild(back);

    const head = document.createElement('div'); head.className = 'module-head';
    head.innerHTML = '<h1>' + m.title + '</h1><div class="meta">' + m.stage + ' · ' +
      { math: '数学', physics: '物理', chemistry: '化学' }[m.subject] + '</div>';
    root.appendChild(head);

    try {
      m.render(root);
    } catch (e) {
      UI.showError(root, e);
    }
  };

  // 自检台：浏览器内跑黄金测试
  App.renderLab = function () {
    const root = clearApp();
    const h1 = document.createElement('h1'); h1.textContent = '自检台 · 黄金测试'; root.appendChild(h1);
    const card = document.createElement('div'); card.className = 'viz-card';
    if (!window.SCI || !window.SCI.tests) {
      card.innerHTML = '<p>测试脚本未加载（tests.js 仅在构建/部署流水线中运行，浏览器版按需引入）。</p>';
      root.appendChild(card);
      return;
    }
    root.appendChild(card);
    // setTimeout 保证后台标签页也能渲染（rAF 在后台会被节流）
    window.setTimeout(function () {
      let pass = 0, fail = 0;
      const list = document.createElement('ul'); list.className = 'lab-list';
      SCI.tests.forEach(t => {
        const li = document.createElement('li');
        let ok = true, msg = '';
        try { t.fn(); } catch (e) { ok = false; msg = e.message; }
        if (ok) pass++; else fail++;
        const name = document.createElement('span'); name.textContent = t.name;
        const st = document.createElement('span'); st.className = ok ? 'ok' : 'fail';
        st.textContent = ok ? 'PASS' : 'FAIL ' + msg;
        li.appendChild(name); li.appendChild(st);
        list.appendChild(li);
      });
      const status = document.createElement('div');
      status.className = 'lab-status ' + (fail === 0 ? 'ok' : 'bad');
      status.textContent = fail === 0 ? '全部通过 (' + pass + '/' + (pass + fail) + ')' : '失败 ' + fail + ' 项';
      card.appendChild(status);
      card.appendChild(list);
    }, 0);
  };

  // ---------- 路由 ----------
  App.route = function () {
    const hash = window.location.hash || '#/';
    document.querySelectorAll('.site-header nav a').forEach(a => a.classList.remove('active'));
    const parts = hash.replace(/^#\//, '').split('/').filter(Boolean);
    if (parts.length === 0) { App.renderHome(); return; }
    const sec = parts[0];
    if (sec === 'math' || sec === 'physics' || sec === 'chemistry') {
      const nav = document.querySelector('[data-nav="' + (sec === 'chemistry' ? 'chemistry' : sec) + '"]');
      if (nav) nav.classList.add('active');
      App.renderSubject(sec);
    } else if (sec === 'm' && parts[1]) {
      App.renderModule(parts[1]);
    } else if (sec === 'lab') {
      const nav = document.querySelector('[data-nav="lab"]');
      if (nav) nav.classList.add('active');
      App.renderLab();
    } else {
      App.renderHome();
    }
    window.scrollTo(0, 0);
  };

  global.App = App;
})(window);
