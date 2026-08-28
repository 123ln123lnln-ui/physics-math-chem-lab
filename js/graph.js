/* graph.js — 数理化知识图谱树数据与渲染
 * 树结构：学科 → 章节 → 知识点节点。
 * 节点带 module 字段的表示已建成互动件（可跳转、可点亮）。
 * 交叉连线体现学科间联系。
 */
(function () {
  const T = {};

  T.trees = [
    {
      subject: 'math', title: '数学之树', color: '#2563eb',
      branches: [
        { name: '数与式（初中）', nodes: [
          { name: '实数' }, { name: '整式与因式分解' }, { name: '分式' }, { name: '二次根式' } ] },
        { name: '方程与不等式（初中）', nodes: [
          { name: '一元一次方程' }, { name: '二元一次方程组' }, { name: '一元二次方程', sub: '与二次函数联动' }, { name: '不等式与不等式组' } ] },
        { name: '函数（初高中）', nodes: [
          { name: '一次函数', module: 'linear-function' }, { name: '反比例函数' },
          { name: '二次函数', module: 'quadratic-function' }, { name: '幂/指/对函数（高中）' },
          { name: '三角函数', module: 'trig-unit-circle' }, { name: '导数与切线', module: 'derivative-tangent' } ] },
        { name: '几何（初中）', nodes: [
          { name: '勾股定理', module: 'pythagoras' }, { name: '全等三角形' }, { name: '相似三角形' },
          { name: '四边形' }, { name: '圆' }, { name: '图形变换（平移/旋转/对称）' } ] },
        { name: '代数与几何（高中）', nodes: [
          { name: '集合与常用逻辑用语' }, { name: '数列（等差/等比）' }, { name: '平面向量' },
          { name: '直线与圆' }, { name: '圆锥曲线（椭圆）', module: 'ellipse' },
          { name: '立体几何初步' }, { name: '概率与统计' }, { name: '复数' } ] }
      ]
    },
    {
      subject: 'physics', title: '物理之树', color: '#dc2626',
      branches: [
        { name: '声光热（初中）', nodes: [
          { name: '声现象' }, { name: '光的直线传播与反射' }, { name: '光的折射' },
          { name: '凸透镜成像', module: 'lens-imaging' }, { name: '物态变化' } ] },
        { name: '力学（初中）', nodes: [
          { name: '机械运动与速度' }, { name: '力与二力平衡' }, { name: '压强' },
          { name: '浮力', module: 'buoyancy' }, { name: '功、功率与机械能' },
          { name: '杠杆与滑轮', module: 'lever-balance' } ] },
        { name: '电与磁（初中）', nodes: [
          { name: '电流、电压、电阻' }, { name: '欧姆定律', module: 'ohms-law' },
          { name: '电功与电功率' }, { name: '电与磁（电磁现象）' } ] },
        { name: '力学（高中）', nodes: [
          { name: '运动学（自由落体/上抛）', module: 'free-fall' },
          { name: '抛体运动', module: 'projectile' }, { name: '牛顿运动定律' },
          { name: '万有引力与航天' }, { name: '机械能守恒' }, { name: '动量守恒' } ] },
        { name: '振动波动与电磁学（高中）', nodes: [
          { name: '简谐运动（弹簧振子）', module: 'shm-spring' }, { name: '机械波' },
          { name: '静电场与恒定电流' }, { name: '磁场' }, { name: '电磁感应与交变电流' },
          { name: '几何光学与波动光学' }, { name: '原子物理初步' } ] }
      ]
    },
    {
      subject: 'chemistry', title: '化学之树', color: '#059669',
      branches: [
        { name: '物质与变化（初中）', nodes: [
          { name: '物质的变化与性质' }, { name: '空气与氧气' }, { name: '水与溶液' },
          { name: '分子、原子、离子' }, { name: '化学方程式与配平', module: 'equation-balance' },
          { name: '碳和碳的氧化物' }, { name: '燃烧与灭火' } ] },
        { name: '金属与酸碱盐（初中）', nodes: [
          { name: '金属与置换反应', module: 'metal-displacement' },
          { name: '酸、碱、盐与中和反应' }, { name: '溶液与溶解度' } ] },
        { name: '基本概念与理论（高中）', nodes: [
          { name: '物质的量（摩尔）' }, { name: '离子反应' }, { name: '氧化还原反应' },
          { name: '元素周期表与周期律', module: 'periodic-table' },
          { name: '化学键与分子结构', module: 'water-molecule' } ] },
        { name: '反应原理与溶液（高中）', nodes: [
          { name: '化学反应与能量' }, { name: '反应速率与化学平衡' },
          { name: '水溶液中的离子平衡' }, { name: '酸碱中和滴定', module: 'titration' },
          { name: '电化学（原电池/电解池）' } ] },
        { name: '元素与有机（高中）', nodes: [
          { name: '金属及其化合物' }, { name: '非金属及其化合物' },
          { name: '有机化学基础' }, { name: '物质结构与性质' } ] }
      ]
    }
  ];

  // 学科交叉连线（学习建议与知识迁移）
  T.crossLinks = [
    { from: '一次函数（数学）', to: '匀速直线运动（物理）', text: '函数的图像语言就是运动学的位移-时间图' },
    { from: '导数与切线（数学）', to: '瞬时速度（物理）', text: '导数正是"瞬时变化率"——速度的数学本质' },
    { from: '平面向量（数学）', to: '力的合成与分解（物理）', text: '向量加法就是平行四边形定则' },
    { from: '二次函数（数学）', to: '抛体运动轨迹（物理）', text: '抛体运动的轨迹正是抛物线' },
    { from: '一元二次方程（数学）', to: '化学方程式配平（化学）', text: '配平本质是解线性方程组' },
    { from: '机械能守恒（物理）', to: '化学反应与能量（化学）', text: '能量守恒贯穿理化：机械能与反应热' },
    { from: '恒定电流（物理）', to: '电化学（化学）', text: '原电池与电解池是电路在化学中的应用' },
    { from: '概率统计（数学）', to: '物质的量与阿伏加德罗常数（化学）', text: '微观粒子的统计思想通向宏观摩尔' }
  ];

  T.countLit = function () {
    // 优先用注册表统计（200+ 知识点）；退回旧树
    if (window.Reg && Reg.count() > 0) {
      let lit = 0;
      const total = Reg.count();
      for (const id in Reg.items) if (window.Progress && Progress.isLit('kb-' + id)) lit++;
      return { lit: lit, total: total, built: total };
    }
    let lit = 0, total = 0, built = 0;
    T.trees.forEach(tree => tree.branches.forEach(b => b.nodes.forEach(n => {
      total++;
      if (n.module) { built++; if (Progress.isLit(n.module)) lit++; }
    })));
    return { lit: lit, total: total, built: built };
  };

  /* ===== Obsidian 风格力导向图谱（canvas 物理模拟） ===== */
  T.render = function (root) {
    root.className = 'graph-page';
    const h1 = document.createElement('h1');
    h1.textContent = '知识图谱 · 动态星图';
    root.appendChild(h1);

    const stat = T.countLit();
    const legend = document.createElement('div');
    legend.className = 'graph-legend';
    legend.textContent = '五级图谱：学科主干 → 学段 → 章节 → 小节 → 知识点。拖拽节点 · 滚轮缩放 · 空白处拖动平移 · 悬停高亮相邻 · 点击节点弹出知识小卡片。★金色=已点亮，进度：' +
      stat.lit + ' / ' + stat.built + ' 个知识点（共 ' + stat.total + ' 个）。';
    root.appendChild(legend);

    const holder = document.createElement('div');
    holder.style.cssText = 'position:relative;background:#0f172a;border-radius:12px;overflow:hidden;height:620px';
    root.appendChild(holder);
    const canvas = document.createElement('canvas');
    holder.appendChild(canvas);
    const tip = document.createElement('div');
    tip.style.cssText = 'position:absolute;pointer-events:none;background:#1e293b;color:#e2e8f0;border:1px solid #475569;border-radius:8px;padding:6px 10px;font-size:12px;display:none;z-index:5;max-width:260px';
    holder.appendChild(tip);

    // 知识小卡片弹层
    const card = document.createElement('div');
    card.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.95);width:min(420px,90%);background:#fff;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.45);padding:20px;z-index:10;display:none;max-height:80%;overflow-y:auto';
    holder.appendChild(card);
    const shade = document.createElement('div');
    shade.style.cssText = 'position:absolute;inset:0;background:rgba(2,6,23,.4);z-index:9;display:none';
    holder.appendChild(shade);
    function openCard(nd) {
      const it = nd.kind === 'kb' ? Reg.byId[nd.kid] : null;
      card.innerHTML = '';
      const meta = document.createElement('div');
      meta.style.cssText = 'font-size:11px;color:#64748b;margin-bottom:4px';
      meta.textContent = it ? it.stage + ' · ' + it.branch : (nd.level === 2 ? '学段层' : nd.level === 3 ? '章节层' : nd.level === 4 ? '小节层' : '分支');
      card.appendChild(meta);
      const h = document.createElement('h3');
      h.style.cssText = 'margin:0 0 10px;font-size:18px';
      h.innerHTML = nd.name + (nd.lit ? ' <span style="color:#f59e0b">★ 已点亮</span>' : '');
      card.appendChild(h);

      if (it) {
        if (it.def.formula) {
          const fe = document.createElement('div');
          fe.style.cssText = 'text-align:center;margin:8px 0';
          card.appendChild(fe);
          if (window.katex) { try { katex.render(it.def.formula, fe, { displayMode: true, throwOnError: false }); } catch (e) { fe.textContent = it.def.formula; } }
          else fe.textContent = it.def.formula;
        }
        if (it.def.text) {
          const p = document.createElement('p');
          p.style.cssText = 'font-size:13px;line-height:1.7;color:#334155';
          p.textContent = it.def.text.slice(0, 150) + (it.def.text.length > 150 ? '…' : '');
          card.appendChild(p);
        }
        if (it.def.quiz) {
          const q = document.createElement('p');
          q.style.cssText = 'font-size:12.5px;color:#475569;background:#f8fafc;border-radius:8px;padding:8px 10px';
          q.textContent = '检测题：' + it.def.quiz.q;
          card.appendChild(q);
        }
        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;gap:8px;margin-top:12px';
        const go = document.createElement('a');
        go.href = '#/kb/' + it.id;
        go.className = 'btn';
        go.style.textDecoration = 'none';
        go.textContent = '进入学习 →';
        const close = document.createElement('button');
        close.className = 'btn secondary';
        close.textContent = '关闭';
        close.addEventListener('click', closeCard);
        btnRow.appendChild(go); btnRow.appendChild(close);
        card.appendChild(btnRow);
      } else {
        const cnt = nodes.filter(function (x) { return x.subject === nd.subject && x.type === 'topic'; }).length;
        const p = document.createElement('p');
        p.style.cssText = 'font-size:13px;color:#475569';
        p.textContent = '该分支共 ' + cnt + ' 个知识点。点击外层知识点节点查看知识小卡片，"进入学习"开始交互实验。';
        card.appendChild(p);
        const close = document.createElement('button');
        close.className = 'btn secondary';
        close.textContent = '关闭';
        close.addEventListener('click', closeCard);
        card.appendChild(close);
      }
      card.style.display = 'block';
      shade.style.display = 'block';
    }
    function closeCard() { card.style.display = 'none'; shade.style.display = 'none'; }
    shade.addEventListener('click', closeCard);
    card.setAttribute('data-card', '1');
    shade.id = 'gcard-shade';

    const W = holder.clientWidth || 900, H = 620;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = '100%'; canvas.style.height = '100%';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // ---- 构建节点与边 ----
    const nodes = [], edges = [];
    const clusterX = { math: W * 0.2, physics: W * 0.5, chemistry: W * 0.8 };
    function addNode(n) {
      n.x = clusterX[n.subject] + (Math.random() - 0.5) * 260;
      n.y = H * 0.3 + Math.random() * H * 0.4;
      n.vx = 0; n.vy = 0;
      nodes.push(n);
      return n;
    }
    const litKey = function (n) { return n.kind === 'kb' ? 'kb-' + n.kid : (n.module || null); };
    const isLitNode = function (n) { const k = litKey(n); return !!(k && window.Progress && Progress.isLit(k)); };

    if (window.Reg && Reg.count() > 0) {
      // 数据驱动五级图谱：学科主干 → 学段 → 章节 → 小节 → 知识点
      const subjects = [['math', '数学之树', '#2563eb'], ['physics', '物理之树', '#dc2626'], ['chemistry', '化学之树', '#059669']];
      // 小节划分：按章节关键词把知识点分成 2 个小节（保证至少 2 节才分）
      const SEC_RULES = {
        '数与式': function (t) { return /式|因式|分式|根式/.test(t) ? '式与运算' : '数与运算'; },
        '方程与不等式': function (t) { return /不等式/.test(t) ? '不等式' : '方程'; },
        '函数': function (t) { return /函数/.test(t) ? '函数主线' : '坐标与概念'; },
        '图形与几何': function (t) { return /圆|角|三角形|四边形|多边形/.test(t) ? '图形性质' : '变换与度量'; },
        '统计与概率': function (t) { return /概率/.test(t) ? '概率' : '统计'; },
        '三角与向量': function (t) { return /向量/.test(t) ? '平面向量' : '三角函数'; },
        '解析几何': function (t) { return /直线|圆|距离/.test(t) ? '直线与圆' : '圆锥曲线'; },
        '概率与统计': function (t) { return /排列|二项|期望|方差/.test(t) ? '计数与分布' : '概率模型'; },
        '声学': function (t) { return /声源|音调|响度/.test(t) ? '声音特性' : '传播与应用'; },
        '光学': function (t) { return /反射|折射|透镜|色散/.test(t) ? '光的传播规律' : '成像与应用'; },
        '热学': function (t) { return /热|内能|温度|比热/.test(t) ? '热与内能' : '物态变化'; },
        '力学': function (t) { return /压强|浮力|密度/.test(t) ? '压强与浮力' : '运动与力'; },
        '电学': function (t) { return /功率|电功|焦耳|电阻|欧姆/.test(t) ? '电功与电热' : '电路基础'; },
        '电磁学': function (t) { return /磁|电磁/.test(t) ? '磁与电磁' : '信息与波'; },
        '运动学': function (t) { return /图像|合成/.test(t) ? '图像与方法' : '基本公式'; },
        '牛顿定律': function (t) { return /合成|斜面/.test(t) ? '力的处理' : '定律应用'; },
        '曲线运动': function (t) { return /卫星|万有引力|引力/.test(t) ? '万有引力' : '曲线运动'; },
        '能量与动量': function (t) { return /动量/.test(t) ? '动量' : '能量'; },
        '振动与波': function (t) { return /波|干涉|衍射|多普勒|声/.test(t) ? '波动' : '振动'; },
        '近代物理': function (t) { return /光电|原子|能级/.test(t) ? '量子与原子' : '核物理'; },
        '物质构成与变化': function (t) { return /变化|守恒|实验操作/.test(t) ? '变化与守恒' : '构成与表示'; },
        '碳与燃烧': function (t) { return /燃烧|燃料/.test(t) ? '燃烧与能源' : '碳的氧化物'; },
        '水与溶液': function (t) { return /溶液|溶解/.test(t) ? '溶液' : '水'; },
        '金属': function (t) { return /酸|置换/.test(t) ? '金属的化学性质' : '金属材料'; },
        '酸碱盐': function (t) { return /酸$|碱$|中和|指示剂|pH/.test(t) ? '酸碱与中和' : '盐与化肥'; },
        '基本概念': function (t) { return /离子|氧化还原|分散系|共存|NA/.test(t) ? '离子与氧化还原' : '化学计量'; },
        '元素周期律': function (t) { return /原子结构|核素/.test(t) ? '原子结构' : '周期律'; },
        '结构': function (t) { return /晶体/.test(t) ? '晶体' : '化学键与构型'; },
        '反应原理': function (t) { return /平衡|速率|水解|常数/.test(t) ? '速率与平衡' : '电化学与热'; },
        '元素化合物': function (t) { return /钠|铝|铁/.test(t) ? '金属元素' : '非金属元素'; },
        '有机化学': function (t) { return /烃|苯/.test(t) ? '烃与芳香烃' : '烃的衍生物与高分子'; },
        '实验与计算': function (t) { return /分离|制备|设计|滴定/.test(t) ? '实验方案' : '定量计算'; }
      };
      subjects.forEach(function (s) {
        const rootHub = addNode({ name: s[1], type: 'root', subject: s[0], r: 15, color: s[2], kind: 'none', level: 1 });
        ['初中', '高中'].forEach(function (stage) {
          const list = Reg.list(s[0], stage);
          if (!list.length) return;
          const stageHub = addNode({ name: stage + ' ' + s[1].replace('之树', ''), type: 'hub', subject: s[0], r: 9, color: s[2], kind: 'none', level: 2 });
          edges.push({ a: rootHub, b: stageHub, len: 110, k: 0.02, cross: false });
          const branches = {};
          list.forEach(function (it) { branches[it.branch] = true; });
          Object.keys(branches).forEach(function (br) {
            const brHub = addNode({ name: br, type: 'hub', subject: s[0], r: 6.5, color: s[2], kind: 'none', level: 3 });
            edges.push({ a: stageHub, b: brHub, len: 80, k: 0.025, cross: false });
            // 小节层（第4级）
            const rule = SEC_RULES[br];
            const items = list.filter(function (it) { return it.branch === br; });
            const secs = {};
            items.forEach(function (it) {
              const secName = rule ? rule(it.title) : '全部';
              secs[secName] = secs[secName] || [];
              secs[secName].push(it);
            });
            const secNames = Object.keys(secs);
            secNames.forEach(function (sn) {
              let secHub = brHub;
              if (secNames.length >= 2) {
                secHub = addNode({ name: sn, type: 'hub', subject: s[0], r: 5, color: s[2], kind: 'none', level: 4 });
                edges.push({ a: brHub, b: secHub, len: 55, k: 0.03, cross: false });
              }
              secs[sn].forEach(function (it) {
                const nd = addNode({ name: it.title, type: 'topic', subject: s[0], r: 4, color: s[2], kind: 'kb', kid: it.id, lit: false, level: 5 });
                edges.push({ a: secHub, b: nd, len: 30, k: 0.055, cross: false });
              });
            });
          });
        });
      });
      nodes.forEach(function (n) { n.lit = isLitNode(n); if (n.lit && n.type === 'topic') n.r = 6; });
      // 语义跨学科连线：分支名相似就近连接（示例性的学科交叉）
      const crossPairs = [
        ['导数与单调性应用', '匀变速直线运动公式', '导数正是瞬时速度——变化的数学'],
        ['平面向量运算', '力的合成（平行四边形定则）', '向量加法就是平行四边形定则'],
        ['二次函数最值问题', '抛体运动', '抛体轨迹是抛物线'],
        ['锐角三角函数', '力学', '斜面受力分解用三角函数'],
        ['物质的量与摩尔', '概率统计', '微观统计通向宏观摩尔'],
        ['反应热与热化学方程式', '动能与势能转化', '能量守恒贯穿理化'],
        ['原电池与电解池', '欧姆定律', '电化学是电路在化学中的应用']
      ];
      const byTitle = {};
      nodes.forEach(function (n) { if (n.type === 'topic') byTitle[n.name] = n; });
      crossPairs.forEach(function (cp) {
        const a = byTitle[cp[0]], b = byTitle[cp[1]];
        if (a && b) edges.push({ a: a, b: b, len: 190, k: 0.004, cross: true, text: cp[2] });
      });
    } else {
      T.trees.forEach(function (tree) {
        const rootHub = addNode({ name: tree.title, type: 'root', subject: tree.subject, r: 15, color: tree.color, kind: 'none' });
        tree.branches.forEach(function (branch) {
          const hub = addNode({ name: branch.name, type: 'hub', subject: tree.subject, r: 9, color: tree.color, kind: 'none' });
          edges.push({ a: rootHub, b: hub, len: 120, k: 0.03, cross: false });
          branch.nodes.forEach(function (kn) {
            const nd = addNode({ name: kn.name, type: 'topic', subject: tree.subject, r: 5, color: tree.color, kind: 'module', module: kn.module || null, lit: false });
            edges.push({ a: hub, b: nd, len: 55, k: 0.05, cross: false });
          });
        });
      });
      nodes.forEach(function (n) { n.lit = isLitNode(n); });
    }

    // ---- 物理模拟 ----
    let alpha = 1;
    function tick() {
      // 斥力
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const A = nodes[i], B = nodes[j];
          let dx = B.x - A.x, dy = B.y - A.y;
          let d2 = dx * dx + dy * dy;
          if (d2 < 1) { d2 = 1; dx = Math.random() - 0.5; dy = Math.random() - 0.5; }
          const d = Math.sqrt(d2);
          const f = 2600 / d2;
          const fx = dx / d * f, fy = dy / d * f;
          if (!A.fixed) { A.vx -= fx; A.vy -= fy; }
          if (!B.fixed) { B.vx += fx; B.vy += fy; }
        }
      }
      // 弹簧
      edges.forEach(function (e) {
        const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = (d - e.len) * e.k;
        const fx = dx / d * f, fy = dy / d * f;
        if (!e.a.fixed) { e.a.vx += fx; e.a.vy += fy; }
        if (!e.b.fixed) { e.b.vx -= fx; e.b.vy -= fy; }
      });
      // 向各自学科中心轻微聚拢 + 积分
      nodes.forEach(function (n) {
        if (n.fixed) return;
        n.vx += (clusterX[n.subject] - n.x) * 0.0015;
        n.vy += (H / 2 - n.y) * 0.001;
        n.vx *= 0.86; n.vy *= 0.86;
        n.x += n.vx * alpha; n.y += n.vy * alpha;
        n.x = Math.max(20, Math.min(W - 20, n.x));
        n.y = Math.max(20, Math.min(H - 20, n.y));
      });
      if (alpha > 0.3) alpha *= 0.995;
    }

    // ---- 视图变换（缩放/平移） ----
    let scale = 1, panX = 0, panY = 0;
    let hover = null, dragging = null, panning = false, moved = false, movedDist = 0;
    let lastMouse = null;

    function toWorld(mx, my) { return [(mx - panX) / scale, (my - panY) / scale]; }

    function findNode(mx, my) {
      const [wx, wy] = toWorld(mx, my);
      let best = null, bd = 1e9;
      nodes.forEach(function (n) {
        const d = (n.x - wx) * (n.x - wx) + (n.y - wy) * (n.y - wy);
        const rr = (n.r + 6) * (n.r + 6);
        if (d < rr && d < bd) { bd = d; best = n; }
      });
      return best;
    }

    function neighbors(n) {
      const set = new Set([n]);
      edges.forEach(function (e) {
        if (e.a === n) set.add(e.b);
        if (e.b === n) set.add(e.a);
      });
      return set;
    }

    canvas.addEventListener('mousedown', function (ev) {
      const rect = canvas.getBoundingClientRect();
      const mx = (ev.clientX - rect.left) * W / rect.width;
      const my = (ev.clientY - rect.top) * H / rect.height;
      moved = false; movedDist = 0;
      const n = findNode(mx, my);
      if (n) { dragging = n; n.fixed = true; } else { panning = true; }
      lastMouse = [mx, my];
    });
    window.addEventListener('mousemove', function (ev) {
      const rect = canvas.getBoundingClientRect();
      const mx = (ev.clientX - rect.left) * W / rect.width;
      const my = (ev.clientY - rect.top) * H / rect.height;
      if (dragging) {
        const [wx, wy] = toWorld(mx, my);
        movedDist += Math.abs(wx - dragging.x) + Math.abs(wy - dragging.y);
        if (movedDist > 4) moved = true; // 容忍点击时的微小抖动
        dragging.x = wx; dragging.y = wy;
        dragging.vx = 0; dragging.vy = 0;
        alpha = Math.max(alpha, 0.6);
      } else if (panning && lastMouse) {
        panX += mx - lastMouse[0];
        panY += my - lastMouse[1];
        movedDist += Math.abs(mx - lastMouse[0]) + Math.abs(my - lastMouse[1]);
        if (movedDist > 4) moved = true;
      } else {
        hover = findNode(mx, my);
        if (hover) {
          tip.style.display = 'block';
          tip.style.left = Math.min(mx + 14, W - 240) + 'px';
          tip.style.top = (my + 14) + 'px';
          const clickable = hover.kind === 'kb' || hover.module;
          const st = hover.type === 'root' ? '学科主干' : hover.type === 'hub' ? '知识分支' :
            clickable ? (hover.lit ? '★ 已点亮 · 点击复习' : '点击进入知识实验室') : '建设中';
          tip.innerHTML = '<b>' + hover.name + '</b><br><span style="color:#94a3b8">' + st + '</span>';
        } else {
          tip.style.display = 'none';
        }
      }
      lastMouse = [mx, my];
    });
    window.addEventListener('mouseup', function (ev) {
      const rect = canvas.getBoundingClientRect();
      const mx = (ev.clientX - rect.left) * W / rect.width;
      const my = (ev.clientY - rect.top) * H / rect.height;
      if (dragging) {
        dragging.fixed = false;
        if (!moved) {
          // 点击节点 → 弹出知识小卡片（卡片内含"进入学习"入口）
          openCard(dragging);
        }
        dragging = null;
      }
      panning = false;
    });
    canvas.addEventListener('wheel', function (ev) {
      ev.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = (ev.clientX - rect.left) * W / rect.width;
      const my = (ev.clientY - rect.top) * H / rect.height;
      const [wx, wy] = toWorld(mx, my);
      const f = ev.deltaY < 0 ? 1.12 : 1 / 1.12;
      scale = Math.max(0.4, Math.min(3, scale * f));
      panX = mx - wx * scale;
      panY = my - wy * scale;
    }, { passive: false });

    // ---- 绘制 ----
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(panX, panY);
      ctx.scale(scale, scale);

      const hi = hover ? neighbors(hover) : null;

      // 边
      edges.forEach(function (e) {
        const dim = hi && !(hi.has(e.a) && hi.has(e.b));
        ctx.strokeStyle = e.cross ? 'rgba(245,158,11,' + (dim ? 0.08 : 0.55) + ')' :
          'rgba(148,163,184,' + (dim ? 0.05 : (e.a.type === 'root' || e.b.type === 'root' ? 0.25 : 0.16)) + ')';
        ctx.lineWidth = e.cross ? 1.6 : 1;
        if (e.cross) ctx.setLineDash([6, 5]); else ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(e.a.x, e.a.y);
        ctx.lineTo(e.b.x, e.b.y);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // 节点
      nodes.forEach(function (n) {
        const dim = hi && !hi.has(n);
        const glow = n.lit || n === hover;
        if (glow) {
          ctx.shadowColor = n.lit ? '#f59e0b' : n.color;
          ctx.shadowBlur = 16;
        }
        ctx.globalAlpha = dim ? 0.15 : 1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.lit ? '#f59e0b' : (n.type === 'root' ? n.color : n.type === 'hub' ? n.color : 'rgba(226,232,240,.92)');
        if (n.type === 'topic' && !n.lit) {
          ctx.fillStyle = 'rgba(226,232,240,.9)';
        }
        ctx.fill();
        ctx.shadowBlur = 0;
        if (n.module && !n.lit) {
          ctx.strokeStyle = n.color; ctx.lineWidth = 1.4;
          ctx.stroke();
        }
        // 标签：主干/分支/点亮/悬停邻域 显示
        const showLabel = n.type !== 'topic' || n.lit || (hi && hi.has(n)) || scale > 1.5;
        if (showLabel) {
          ctx.fillStyle = n.type === 'topic' ? '#cbd5e1' : '#fff';
          ctx.font = (n.type === 'root' ? 'bold 14px' : n.type === 'hub' ? 'bold 11px' : '10px') + ' sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(n.name, n.x, n.y - n.r - 5);
        }
        ctx.globalAlpha = 1;
      });
      ctx.restore();
    }

    (function loop() {
      tick();
      draw();
      window.requestAnimationFrame(loop);
    })();

    // 交叉连线说明
    const cross = document.createElement('div');
    cross.className = 'g-cross';
    cross.innerHTML = '<b>虚线 = 学科交叉连线</b>（悬停节点可看它的邻居）：';
    const ul = document.createElement('ul');
    ul.style.cssText = 'margin:8px 0 0;padding-left:18px';
    T.crossLinks.forEach(function (l) {
      const li = document.createElement('li');
      li.innerHTML = '<b>' + l.from + '</b> ⇄ <b>' + l.to + '</b> — ' + l.text;
      li.style.cssText = 'margin:5px 0';
      ul.appendChild(li);
    });
    cross.appendChild(ul);
    root.appendChild(cross);
  };

  window.Graph = T;
})();
