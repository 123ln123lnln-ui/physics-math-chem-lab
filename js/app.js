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
    // 图谱进度横幅
    if (window.Graph) {
      const stat = Graph.countLit();
      const banner = document.createElement('div');
      banner.className = 'viz-card';
      banner.style.cssText = 'margin-top:20px;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px';
      banner.innerHTML = '<div style="font-size:14px">🌱 <b>知识图谱</b>：已点亮 <b>' + stat.lit + '</b> / ' + stat.built + ' 个互动件知识点。去 <a href="#/graph">看看你的成长之树 →</a></div>';
      root.appendChild(banner);
    }

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
    // 奖励柜（积分解锁皮肤/特效，直接改变动画外观）
    if (window.FX) FX.rewardsPanel(root);

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

  // 学科页：互动模块 + 知识实验室全部知识点（按学段/章节）
  App.renderSubject = function (subject) {
    const root = clearApp();
    const names = { math: '数学', physics: '物理', chemistry: '化学' };
    const h1 = document.createElement('h1');
    h1.textContent = names[subject] + ' · 完整知识体系';
    root.appendChild(h1);
    const stages = ['初中', '高中'];
    stages.forEach(stage => {
      const h2 = document.createElement('h2');
      h2.textContent = stage + '（' + (window.Reg ? Reg.list(subject, stage).length : 0) + ' 个知识点）';
      root.appendChild(h2);

      // 1) 精互动模块
      const mods = App.bySubject(subject).filter(m => m.stage === stage);
      if (mods.length) {
        const mh = document.createElement('div');
        mh.style.cssText = 'font-size:13px;color:#64748b;margin:6px 0';
        mh.textContent = '▍实验级互动模块';
        root.appendChild(mh);
        const grid = document.createElement('div'); grid.className = 'subject-grid';
        mods.forEach(m => {
          const card = document.createElement('div');
          card.className = 'subject-card';
          card.innerHTML = '<h2 style="font-size:16px"><a style="text-decoration:none;color:inherit" href="#/m/' + m.id + '">' +
            m.title + '</a></h2><p class="desc">' + (m.desc || '') + '</p>';
          grid.appendChild(card);
        });
        root.appendChild(grid);
      }

      // 2) 注册表知识点 —— 统一为实验级互动模块卡片样式
      if (window.Reg) {
        const branches = Reg.branches(subject, stage);
        branches.forEach(br => {
          const bh = document.createElement('div');
          bh.style.cssText = 'font-size:13px;color:#64748b;margin:14px 0 6px;font-weight:600';
          bh.textContent = '▍' + br;
          root.appendChild(bh);
          const grid = document.createElement('div');
          grid.className = 'subject-grid';
          Reg.list(subject, stage, br).forEach(it => {
            const isLit = window.Progress && Progress.isLit('kb-' + it.id);
            const card = document.createElement('div');
            card.className = 'subject-card';
            card.style.borderTopColor = isLit ? '#f59e0b' : '';
            const h2 = document.createElement('h2');
            h2.style.fontSize = '16px';
            const a = document.createElement('a');
            a.href = '#/kb/' + it.id;
            a.style.cssText = 'text-decoration:none;color:inherit';
            a.textContent = (isLit ? '★ ' : '') + it.title;
            h2.appendChild(a);
            card.appendChild(h2);
            const desc = document.createElement('p');
            desc.className = 'desc';
            desc.textContent = it.type === 'concept'
              ? (it.def.text || '').slice(0, 60) + '…（配演示动画+检测题）'
              : '拖动参数做实验，观察结果联动（配实验曲线+自动演示）。';
            card.appendChild(desc);
            // 公式行
            if (it.def.formula) {
              const f = document.createElement('div');
              f.style.cssText = 'font-size:13px;overflow-x:auto';
              card.appendChild(f);
              if (window.katex) { try { katex.render(it.def.formula, f, { displayMode: false, throwOnError: false }); } catch (e) { f.textContent = it.def.formula; } }
              else f.textContent = it.def.formula;
            }
            // 考点频率 + PhET 参考
            const foot = document.createElement('div');
            foot.style.cssText = 'display:flex;gap:10px;align-items:center;margin-top:8px;font-size:11.5px;color:#64748b';
            const freq = document.createElement('span');
            freq.textContent = '考点频率 ' + (it.def.freq || 2) + '/5';
            foot.appendChild(freq);
            const phet = App.PHET[it.id];
            if (phet) {
              const pl = document.createElement('a');
              pl.href = phet;
              pl.target = '_blank';
              pl.rel = 'noopener';
              pl.style.cssText = 'color:#2563eb;text-decoration:none;font-weight:600';
              pl.textContent = 'PhET 在线参考 ↗';
              foot.appendChild(pl);
            }
            card.appendChild(foot);
            grid.appendChild(card);
          });
          root.appendChild(grid);
        });
      }
    });
  };

  /* PhET 在线互动参考（已验证的中文 sim 链接，新窗口打开） */
  App.PHET = {
    phy_j4_02: 'https://phet.colorado.edu/zh_CN/simulations/forces-and-motion-basics',
    phy_m09: 'https://phet.colorado.edu/zh_CN/simulations/forces-and-motion-basics',
    phy_g1_01: 'https://phet.colorado.edu/zh_CN/simulations/forces-and-motion-basics',
    phy_g1_02: 'https://phet.colorado.edu/zh_CN/simulations/forces-and-motion-basics',
    'projectile': 'https://phet.colorado.edu/zh_CN/simulations/projectile-motion',
    phy_g2_01: 'https://phet.colorado.edu/zh_CN/simulations/projectile-motion',
    phy_g4_01: 'https://phet.colorado.edu/zh_CN/simulations/pendulum-lab',
    phy_j5_03: 'https://phet.colorado.edu/zh_CN/simulations/circuit-construction-kit-dc',
    phy_j5_01: 'https://phet.colorado.edu/zh_CN/simulations/circuit-construction-kit-dc',
    phy_g5_03: 'https://phet.colorado.edu/zh_CN/simulations/circuit-construction-kit-dc',
    phy_j2_04: 'https://phet.colorado.edu/zh_CN/simulations/geometric-optics',
    'lens-imaging': 'https://phet.colorado.edu/zh_CN/simulations/geometric-optics',
    phy_j2_01: 'https://phet.colorado.edu/zh_CN/simulations/geometric-optics',
    phy_j3_04: 'https://phet.colorado.edu/zh_CN/simulations/energy-forms-and-changes',
    phy_j3_05: 'https://phet.colorado.edu/zh_CN/simulations/energy-forms-and-changes',
    phy_g3_01: 'https://phet.colorado.edu/zh_CN/simulations/energy-skate-park-basics',
    phy_j4_07: 'https://phet.colorado.edu/zh_CN/simulations/under-pressure',
    phy_j4_08: 'https://phet.colorado.edu/zh_CN/simulations/under-pressure',
    phy_j4_10: 'https://phet.colorado.edu/zh_CN/simulations/buoyancy',
    phy_g2_02: 'https://phet.colorado.edu/zh_CN/simulations/gravity-and-orbits',
    phy_g2_03: 'https://phet.colorado.edu/zh_CN/simulations/gravity-and-orbits',
    phy_j1_01: 'https://phet.colorado.edu/zh_CN/simulations/wave-on-a-string',
    phy_g4_02: 'https://phet.colorado.edu/zh_CN/simulations/wave-on-a-string',
    phy_g5_01: 'https://phet.colorado.edu/zh_CN/simulations/charges-and-fields',
    phy_g5_02: 'https://phet.colorado.edu/zh_CN/simulations/charges-and-fields',
    phy_g7_01: 'https://phet.colorado.edu/zh_CN/simulations/models-of-the-hydrogen-atom',
    phy_g7_02: 'https://phet.colorado.edu/zh_CN/simulations/models-of-the-hydrogen-atom'
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

    // 磁性男播音：模块介绍（进入页面自动播报）
    if (m.intro && window.Voice) Voice.intro(m.intro);

    // 趣味答题区（答对得积分、点亮知识点）
    if (window.Quiz) Quiz.render(root, m.id);

    // 首次探索积分
    if (window.Progress) Progress.markVisit(m.id);
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
    // 页面切换：立即打断正在播放的语音
    if (window.Voice) Voice.stop();
    const hash = window.location.hash || '#/';
    document.querySelectorAll('.site-header nav a').forEach(a => a.classList.remove('active'));
    // 剥离 hash 内的查询参数（如 #/m/xxx?r=1），避免路由匹配失败
    const clean = hash.split('?')[0];
    const parts = clean.replace(/^#\//, '').split('/').filter(Boolean);
    if (parts.length === 0) { App.renderHome(); return; }
    const sec = parts[0];
    if (sec === 'math' || sec === 'physics' || sec === 'chemistry') {
      const nav = document.querySelector('[data-nav="' + (sec === 'chemistry' ? 'chemistry' : sec) + '"]');
      if (nav) nav.classList.add('active');
      App.renderSubject(sec);
    } else if (sec === 'm' && parts[1]) {
      App.renderModule(parts[1]);
    } else if (sec === 'kb') {
      const nav = document.querySelector('[data-nav="kb"]');
      if (nav) nav.classList.add('active');
      const root = clearApp();
      if (window.Reg) {
        if (parts[1]) {
          const it = Reg.byId[parts[1]];
          if (it) Reg.renderItem(root, it);
          else root.innerHTML = '<div class="viz-card"><h3>未找到该知识点</h3><a class="back-link" href="#/kb">返回知识实验室</a></div>';
        } else {
          Reg.renderLabHome(root);
        }
      }
    } else if (sec === 'graph') {
      const nav = document.querySelector('[data-nav="graph"]');
      if (nav) nav.classList.add('active');
      const root = clearApp();
      if (window.Graph) Graph.render(root);
    } else if (sec === 'explore') {
      const nav = document.querySelector('[data-nav="explore"]');
      if (nav) nav.classList.add('active');
      const root = clearApp();
      if (window.Explore) Explore.render(root);
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
