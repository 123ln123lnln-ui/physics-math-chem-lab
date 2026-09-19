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

    // 今日回顾：掌握度衰减的知识点（遗忘曲线回路）
    if (window.Progress && window.Reg && Reg.count() > 0) {
      const review = Progress.reviewList();
      if (review.length) {
        const box = document.createElement('div');
        box.className = 'viz-card';
        box.style.cssText = 'margin-top:12px;padding:12px 16px;background:#eff6ff;border:1px solid #93c5fd';
        let html = '<div style="font-size:14px;color:#1e40af"><b>🕐 今日回顾</b>：有 ' + review.length + ' 个知识点在变暗，答对一题即可点亮：</div><div style="margin-top:6px">';
        review.slice(0, 6).forEach(function (id) {
          const it = id.indexOf('kb-') === 0 && Reg.byId ? Reg.byId[id.slice(3)] : null;
          if (it) html += '<a href="#/kb/' + it.id + '" style="display:inline-block;margin:2px 6px 2px 0;padding:2px 10px;background:#fff;border:1px solid #93c5fd;border-radius:12px;font-size:12px;color:#1e40af;text-decoration:none">' + it.title + '</a>';
        });
        html += '</div>';
        box.innerHTML = html;
        root.appendChild(box);
      }
    }

    // 机制五：五步快测（诊断入口——会的不重学，错的指路）
    if (window.Quiz && window.Reg && Reg.count() > 0) {
      const dq = document.createElement('div');
      dq.className = 'viz-card';
      dq.style.cssText = 'margin-top:12px;border-left:4px solid #2563eb';
      dq.innerHTML = '<h3 style="margin-top:0">🎯 五步快测</h3><p style="font-size:13px;color:#475569;margin:4px 0 10px">随机 5 道题摸摸底：答对直接点亮对应知识点，答错会告诉你该补哪一课。</p>';
      const startBtn = document.createElement('button');
      startBtn.className = 'btn';
      startBtn.textContent = '开始快测';
      const holder = document.createElement('div');
      dq.appendChild(startBtn);
      dq.appendChild(holder);
      root.appendChild(dq);
      startBtn.addEventListener('click', function () {
        startBtn.style.display = 'none';
        const pool = [];
        for (const id in Reg.items) {
          const it = Reg.items[id];
          if (it.def && it.def.quiz) pool.push(it);
        }
        // 抽 5 个（优先未点亮的）
        const unlit = pool.filter(it => !(window.Progress && Progress.isLit('kb-' + it.id)));
        const src = unlit.length >= 5 ? unlit : pool;
        const picked = src.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 5);
        Quiz.add('__diag__', picked.map(function (it) {
          return { q: '【' + it.title + '】' + it.def.quiz.q, options: it.def.quiz.opts, answer: it.def.quiz.a, explain: it.def.quiz.e };
        }));
        Quiz.render(holder, '__diag__');
      });
    }

    // 错题本入口（有存货才显示）
    if (window.Mistakes && Mistakes.count() > 0) {
      const mc = document.createElement('div');
      mc.className = 'viz-card';
      mc.style.cssText = 'margin-top:12px;padding:12px 16px;background:#fff7ed;border:1px solid #fdba74;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px';
      mc.innerHTML = '<div style="font-size:14px;color:#9a3412">📒 <b>错题本</b>：还有 ' + Mistakes.count() + ' 条失分线索待回收。</div>' +
        '<a href="#/mistakes" style="color:#c2410c;text-decoration:none;font-weight:600;font-size:14px">去清零 →</a>';
      root.appendChild(mc);
    }

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

    // 学习路径入口卡（已设目标则升级为目标面板）
    if (window.Paths) {
      const gid = Paths.getGoal ? Paths.getGoal() : '';
      const gp = gid && Paths.byId[gid];
      const pc = document.createElement('div');
      pc.className = 'viz-card';
      pc.style.cssText = 'margin-top:12px;padding:14px 18px';
      if (gp) {
        const pr = Paths.progress(gp);
        const pct = Math.round(pr.lit / pr.total * 100);
        let inner = '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">' +
          '<div style="font-size:14px">🎯 <b>当前目标</b>：' + gp.title + '（' + pr.lit + '/' + pr.total + '）</div>' +
          '<a href="#" class="goal-clear" style="font-size:12px;color:#94a3b8;text-decoration:none">取消目标</a></div>' +
          '<div class="path-bar" style="margin-top:8px"><div class="path-bar-fill" style="width:' + pct + '%"></div></div>';
        if (pr.next && window.Reg && Reg.byId[pr.next]) {
          inner += '<a class="btn spot-pulse" style="display:inline-block;margin-top:10px;text-decoration:none" href="#/kb/' + pr.next + '">▶ 继续：' + Reg.byId[pr.next].title + '</a>';
        } else if (!pr.next) {
          inner += '<div style="margin-top:10px;font-size:14px;color:#166534">🎓 目标达成！去路径页挑下一条。</div>';
        }
        pc.innerHTML = inner;
        root.appendChild(pc);
        const clr = pc.querySelector('.goal-clear');
        if (clr) clr.addEventListener('click', function (ev) { ev.preventDefault(); Paths.clearGoal(); App.route(); });
      } else {
        pc.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">' +
          '<div style="font-size:14px">🧭 <b>学习路径</b>：' + Paths.list.length + ' 条编排好的复习主线（中考一轮 / 初高衔接），按顺序走完一条就是一轮复习。</div>' +
          '<a href="#/paths" style="color:#2563eb;text-decoration:none;font-weight:600;font-size:14px">选一条开始 →</a></div>';
        root.appendChild(pc);
      }
    }

    // 兴趣直达：今天想探索什么（跳到资料篇对应科技树）
    if (window.Explore) {
      const chips = document.createElement('div');
      chips.style.cssText = 'margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center';
      let ch = '<span style="font-size:13px;color:#64748b">✨ 今天想探索：</span>';
      [['天文树', '仰望星空'], ['生命树', '生命奥秘'], ['机器人树', '机器与智能'], ['量子奇观树', '量子奇观'], ['感知与错觉树', '感官错觉'], ['医学树', '人体医学']].forEach(function (pair) {
        ch += '<a class="chip" href="#/explore?cat=' + encodeURIComponent(pair[0]) + '">' + pair[1] + '</a>';
      });
      chips.innerHTML = ch;
      root.appendChild(chips);
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

  // 自检台：浏览器内跑全部四道质量关口（与 node tests/run-all.js 同标准）
  App.renderLab = function () {
    const root = clearApp();
    const h1 = document.createElement('h1'); h1.textContent = '自检台 · 四道质量关口'; root.appendChild(h1);
    const sub = document.createElement('p');
    sub.style.cssText = 'color:#64748b;font-size:13.5px;margin:4px 0 12px';
    sub.textContent = '与发版流水线同一标准：引擎黄金测试 + 注册表校验 + 路径校验秒出结果；动画全检约十秒，点按钮开始。';
    root.appendChild(sub);

    if (!window.SelfTest) {
      const c = document.createElement('div'); c.className = 'viz-card';
      c.textContent = 'selftest.js 未加载。'; root.appendChild(c); return;
    }

    function renderRes(card, res) {
      const ok = res.fails.length === 0;
      const line = document.createElement('div');
      line.className = 'lab-status ' + (ok ? 'ok' : 'bad');
      line.textContent = ok ? ('全部通过 (' + res.pass + '/' + res.total + ')') : ('通过 ' + res.pass + '/' + res.total + '，失败 ' + res.fails.length + ' 项');
      card.appendChild(line);
      if (!ok) {
        const ul = document.createElement('ul'); ul.className = 'lab-list';
        res.fails.slice(0, 8).forEach(function (f) {
          const li = document.createElement('li');
          const nm = document.createElement('span'); nm.textContent = f;
          const st = document.createElement('span'); st.className = 'fail'; st.textContent = 'FAIL';
          li.appendChild(nm); li.appendChild(st); ul.appendChild(li);
        });
        card.appendChild(ul);
      }
    }

    // 前三关：立即执行
    [SelfTest.engine(), SelfTest.registry(), SelfTest.paths()].forEach(function (res, i) {
      const card = document.createElement('div'); card.className = 'viz-card';
      const h = document.createElement('h3'); h.textContent = (i + 1) + '. ' + res.name; card.appendChild(h);
      renderRes(card, res);
      root.appendChild(card);
    });

    // 第四关：动画全检（手动触发 + 进度条，避免进页面就卡）
    const ac = document.createElement('div'); ac.className = 'viz-card';
    ac.innerHTML = '<h3>4. 全动画冒烟</h3><p style="font-size:13px;color:#64748b;margin-top:0">每个动画用 默认/下限/上限 三组参数各泵 30 帧，断言不抛异常且确有画面输出。</p>';
    const btn = document.createElement('button'); btn.className = 'btn'; btn.textContent = '开始动画全检';
    const prog = document.createElement('div'); prog.className = 'path-bar'; prog.style.cssText = 'margin-top:10px;display:none';
    const fill = document.createElement('div'); fill.className = 'path-bar-fill'; fill.style.width = '0%';
    prog.appendChild(fill);
    ac.appendChild(btn); ac.appendChild(prog);
    root.appendChild(ac);
    btn.addEventListener('click', function () {
      btn.style.display = 'none'; prog.style.display = 'block';
      SelfTest.anims(function (d, t) { fill.style.width = Math.round(d / t * 100) + '%'; }).then(function (res) {
        fill.style.width = '100%';
        renderRes(ac, res);
      });
    });
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
    } else if (sec === 'paths') {
      const nav = document.querySelector('[data-nav="paths"]');
      if (nav) nav.classList.add('active');
      const root = clearApp();
      if (window.Paths) {
        if (parts[1]) Paths.renderPath(root, parts[1]);
        else Paths.renderIndex(root);
      }
    } else if (sec === 'boss') {
      const root = clearApp();
      if (window.Boss) Boss.render(root, parts[1]);
    } else if (sec === 'mistakes') {
      const root = clearApp();
      if (window.Mistakes) Mistakes.render(root);
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
