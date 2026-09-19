/* paths.js — 学习路径包：把 243 个知识点按依赖链编成命名路线
 * 对标"课程级规划"：星图是自由探索，路径是编排好的课程。
 * 数据约定：nodes 按学习顺序排列，只引用已注册的知识点 id；
 * 校验：node tests/check-paths.js（查悬空、查重、查空路径）。
 */
(function () {
  const PATHS = [
    {
      id: 'zk-wuli-li',
      title: '中考一轮 · 力学主线',
      audience: '初三',
      desc: '从质量密度到简单机械，中考力学计算题的全部地基。约 15 课。',
      nodes: ['phy_j4_01', 'phy_j4_02', 'phy_j4_03', 'phy_j4_04', 'phy_j4_05', 'phy_j4_06', 'phy_m10', 'phy_m09', 'phy_j4_07', 'phy_j4_08', 'phy_j4_09', 'phy_j4_10', 'phy_j4_11', 'phy_j4_12', 'phy_j4_13']
    },
    {
      id: 'zk-wuli-dian',
      title: '中考一轮 · 电与磁主线',
      audience: '初三',
      desc: '电路 → 欧姆定律 → 电功率 → 家庭电路 → 电磁，电学综合题一口气串完。约 10 课。',
      nodes: ['phy_j5_01', 'phy_j5_02', 'phy_j5_03', 'phy_j5_04', 'phy_j5_05', 'phy_j5_06', 'phy_j5_07', 'phy_j6_01', 'phy_j6_02', 'phy_j6_03']
    },
    {
      id: 'zk-huaxue',
      title: '中考一轮 · 化学零基础到酸碱盐',
      audience: '初三',
      desc: '新学科不慌：物质变化 → 微观粒子 → 溶液 → 金属 → 酸碱盐，按课本顺序走。约 16 课。',
      nodes: ['che_j1_01', 'che_j1_06', 'che_j1_07', 'che_j1_08', 'che_j1_09', 'che_j3_01', 'che_j3_02', 'che_j3_03', 'che_j4_01', 'che_j4_02', 'che_j5_01', 'che_j5_02', 'che_j5_03', 'che_j5_04', 'che_j5_05', 'che_j5_06']
    },
    {
      id: 'zk-shuxue-hanshu',
      title: '中考一轮 · 数学函数主线',
      audience: '初三',
      desc: '方程打底，坐标系开路，一次 → 反比例 → 二次函数最值，函数大题的正步走法。约 6 课。',
      nodes: ['math_j4_01', 'math_j7_01', 'math_j7_02', 'math_j7_03', 'math_j7_04', 'math_j8_01']
    },
    {
      id: 'zk-shuxue-jihe',
      title: '中考一轮 · 数学几何主线',
      audience: '初三',
      desc: '角 → 三角形 → 全等 → 相似 → 四边形 → 圆 → 锐角三角函数，几何证明的逻辑链。约 8 课。',
      nodes: ['math_j9_01', 'math_j9_02', 'math_j9_04', 'math_j10_01', 'math_j11_01', 'math_j11_02', 'math_j11_03', 'math_j12_02']
    },
    {
      id: 'gk-wuli-jixian',
      title: '初高衔接 · 高中物理力学地基',
      audience: '高一',
      desc: '初中力学的高中版：匀变速 → 牛顿定律 → 曲线运动 → 能量动量。预习/衔接两用。约 12 课。',
      nodes: ['phy_g1_01', 'phy_g1_02', 'phy_m11', 'phy_g1_03', 'phy_g1_05', 'phy_g1_06', 'phy_g1_07', 'phy_g3_01', 'phy_g3_02', 'phy_g2_01', 'phy_g2_02', 'phy_g2_03']
    }
  ];

  const Paths = { list: PATHS };
  Paths.byId = {};
  PATHS.forEach(function (p) { Paths.byId[p.id] = p; });

  function litCount(p) {
    if (!window.Progress) return 0;
    return p.nodes.filter(function (id) { return Progress.isLit('kb-' + id); }).length;
  }
  function nextUnlit(p) {
    if (!window.Progress) return p.nodes[0];
    for (let i = 0; i < p.nodes.length; i++) {
      if (!Progress.isLit('kb-' + p.nodes[i])) return p.nodes[i];
    }
    return null; // 全部点亮
  }

  // 路径总览页
  Paths.renderIndex = function (root) {
    const h1 = document.createElement('h1');
    h1.textContent = '学习路径 · 编排好的复习课';
    root.appendChild(h1);
    const tip = document.createElement('p');
    tip.style.cssText = 'color:#64748b;font-size:14px;margin:4px 0 14px';
    tip.textContent = '星图负责自由探索，路径负责按顺序走完一条主线。点亮全部节点即毕业。';
    root.appendChild(tip);

    const grid = document.createElement('div');
    grid.className = 'subject-grid';
    PATHS.forEach(function (p) {
      const lit = litCount(p);
      const total = p.nodes.length;
      const pct = Math.round(lit / total * 100);
      const card = document.createElement('div');
      card.className = 'subject-card';
      let html = '<h2 style="font-size:16px"><a style="text-decoration:none;color:inherit" href="#/paths/' + p.id + '">' +
        (lit === total ? '🎓 ' : '') + p.title + '</a></h2>' +
        '<p class="desc">' + p.desc + '</p>' +
        '<div class="path-bar"><div class="path-bar-fill" style="width:' + pct + '%"></div></div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:12.5px;color:#64748b">' +
        '<span>' + p.audience + ' · 已点亮 ' + lit + '/' + total + '</span>' +
        '<a href="#/paths/' + p.id + '" style="color:#2563eb;text-decoration:none;font-weight:600">' +
        (lit === 0 ? '开始 →' : lit === total ? '复习 →' : '继续 →') + '</a></div>';
      card.innerHTML = html;
      grid.appendChild(card);
    });
    root.appendChild(grid);
  };

  // 单条路径详情页
  Paths.renderPath = function (root, pid) {
    const p = Paths.byId[pid];
    if (!p) {
      root.innerHTML = '<div class="viz-card"><h3>未找到该路径</h3><a class="back-link" href="#/paths">返回路径列表</a></div>';
      return;
    }
    const back = document.createElement('a');
    back.className = 'back-link'; back.href = '#/paths'; back.textContent = '← 返回路径列表';
    root.appendChild(back);

    const lit = litCount(p);
    const total = p.nodes.length;
    const head = document.createElement('div');
    head.className = 'module-head';
    head.innerHTML = '<h1>' + p.title + '</h1><div class="meta">' + p.audience + ' · ' + total + ' 课 · 已点亮 ' + lit + ' 课</div>' +
      '<p style="color:#64748b;font-size:14px;margin:6px 0 0">' + p.desc + '</p>';
    root.appendChild(head);

    // 继续学习按钮：直达第一个未点亮节点
    const nid = nextUnlit(p);
    if (nid && window.Reg && Reg.byId[nid]) {
      const go = document.createElement('a');
      go.className = 'btn';
      go.style.cssText = 'display:inline-block;margin:10px 0 16px;text-decoration:none';
      go.href = '#/kb/' + nid;
      go.textContent = '▶ 继续：' + Reg.byId[nid].title;
      root.appendChild(go);
    } else if (!nid) {
      const done = document.createElement('div');
      done.className = 'viz-card';
      done.style.cssText = 'background:#f0fdf4;border:1px solid #86efac;margin:10px 0 16px;font-size:14px;color:#166534';
      done.textContent = '🎓 这条路径全部点亮了！去「今日回顾」保持亮度，或挑下一条路径。';
      root.appendChild(done);
    }

    const ol = document.createElement('ol');
    ol.className = 'path-steps';
    p.nodes.forEach(function (id, i) {
      const it = window.Reg && Reg.byId[id];
      if (!it) return;
      const isLit = window.Progress && Progress.isLit('kb-' + id);
      const li = document.createElement('li');
      li.className = 'path-step' + (isLit ? ' lit' : '');
      let badge;
      if (isLit) badge = '★';
      else if (window.Progress && window.Deps && !Progress.checkGate(id).ok) badge = '🔒';
      else badge = '▶';
      li.innerHTML = '<a href="#/kb/' + id + '">' +
        '<span class="path-step-badge">' + badge + '</span>' +
        '<span class="path-step-title">' + it.title + '</span>' +
        '<span class="path-step-meta">' + it.branch + '</span></a>';
      ol.appendChild(li);
    });
    root.appendChild(ol);

    const legend = document.createElement('p');
    legend.style.cssText = 'font-size:12px;color:#94a3b8;margin-top:10px';
    legend.textContent = '▶ 可以学　🔒 建议先补前置（点进去会告诉你缺哪课）　★ 已点亮（会随时间变暗，答对一题重新点亮）';
    root.appendChild(legend);
  };

  window.Paths = Paths;
})();
