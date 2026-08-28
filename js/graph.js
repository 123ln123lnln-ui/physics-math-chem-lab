/* graph.js — 数理化知识图谱：横排同心圆盘 + 考点频率 Z 轴（等距 3D 投影）
 * 数据：注册表(243) + 探索篇(60) = 300+ 节点。
 * 层级：学科主干 → 学段/类别 → 章节 → 小节 → 知识点（同心环）。
 * Z 轴：考点频率 1-5，频率越高节点抬升越高（立体柱）。
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
    if (window.Reg && Reg.count() > 0) {
      let lit = 0;
      const total = Reg.count() + (window.ExploreData ? ExploreData.length : 0);
      for (const id in Reg.items) if (window.Progress && Progress.isLit('kb-' + id)) lit++;
      return { lit: lit, total: total, built: Reg.count() };
    }
    let lit = 0, total = 0, built = 0;
    T.trees.forEach(tree => tree.branches.forEach(b => b.nodes.forEach(n => {
      total++;
      if (n.module) { built++; if (Progress.isLit(n.module)) lit++; }
    })));
    return { lit: lit, total: total, built: built };
  };

  /* ===== 横排 3D 图谱渲染 ===== */
  T.render = function (root) {
    root.className = 'graph-page';
    const h1 = document.createElement('h1');
    h1.textContent = '知识图谱 · 3D 考点星图';
    root.appendChild(h1);

    const stat = T.countLit();
    const legend = document.createElement('div');
    legend.className = 'graph-legend';
    legend.textContent = '横向四个圆盘（数学/物理/化学/探索）· 同心环 = 层级 · 立体高度 = 考点频率（Z 轴，越高越常考）。左右滚动查看 · 拖拽节点 · 悬停高亮 · 点击弹知识小卡片。★金=已点亮，进度 ' +
      stat.lit + ' / ' + stat.total + '。';
    root.appendChild(legend);

    const holder = document.createElement('div');
    holder.style.cssText = 'position:relative;background:#0f172a;border-radius:12px;overflow-x:auto;overflow-y:hidden;height:780px';
    root.appendChild(holder);
    const canvas = document.createElement('canvas');
    holder.appendChild(canvas);
    const tip = document.createElement('div');
    tip.style.cssText = 'position:fixed;pointer-events:none;background:#1e293b;color:#e2e8f0;border:1px solid #475569;border-radius:8px;padding:6px 10px;font-size:12px;display:none;z-index:99;max-width:280px';
    document.body.appendChild(tip);

    // 知识小卡片弹层
    const card = document.createElement('div');
    card.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(430px,92%);background:#fff;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.5);padding:20px;z-index:100;display:none;max-height:80%;overflow-y:auto';
    document.body.appendChild(card);
    const shade = document.createElement('div');
    shade.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,.45);z-index:99;display:none';
    document.body.appendChild(shade);
    function closeCard() { card.style.display = 'none'; shade.style.display = 'none'; }
    shade.addEventListener('click', closeCard);

    const DISC = 760;
    const W = DISC * 4 + 60, H = 780;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const SQUASH = 0.42;               // 等距投影压扁系数
    const centers = {
      math: [DISC * 0.5 + 30, 470],
      physics: [DISC * 1.5 + 30, 470],
      chemistry: [DISC * 2.5 + 30, 470],
      explore: [DISC * 3.5 + 30, 470]
    };
    const ringR = { 1: 0, 2: 105, 3: 195, 4: 275, 5: 345 };
    const liftOf = function (n) { return ((n.freq || 1) - 1) * 16; };

    const nodes = [], edges = [];
    function addNode(n) {
      const c = centers[n.subject] || [W / 2, H / 2];
      const rr = ringR[n.level || 3] || 180;
      const a = Math.random() * Math.PI * 2;
      n.fx = c[0] + Math.cos(a) * rr * (0.7 + Math.random() * 0.4);
      n.fy = c[1] + Math.sin(a) * rr * (0.7 + Math.random() * 0.4);
      n.vx = 0; n.vy = 0;
      nodes.push(n);
      return n;
    }
    const litKey = function (n) { return n.kind === 'kb' ? 'kb-' + n.kid : (n.module || null); };
    const isLitNode = function (n) { const k = litKey(n); return !!(k && window.Progress && Progress.isLit(k)); };

    // ---- 构建节点（注册表三科 + 探索盘） ----
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

    if (window.Reg && Reg.count() > 0) {
      [['math', '数学之树', '#2563eb'], ['physics', '物理之树', '#dc2626'], ['chemistry', '化学之树', '#059669']].forEach(function (s) {
        const rootHub = addNode({ name: s[1], type: 'root', subject: s[0], r: 15, color: s[2], kind: 'none', level: 1, freq: 1 });
        rootHub.fixed = true;
        ['初中', '高中'].forEach(function (stage) {
          const list = Reg.list(s[0], stage);
          if (!list.length) return;
          const stageHub = addNode({ name: stage, type: 'hub', subject: s[0], r: 9, color: s[2], kind: 'none', level: 2, freq: 1 });
          edges.push({ a: rootHub, b: stageHub, len: 110, k: 0.02, cross: false });
          const branches = {};
          list.forEach(function (it) { branches[it.branch] = true; });
          Object.keys(branches).forEach(function (br) {
            const brHub = addNode({ name: br, type: 'hub', subject: s[0], r: 6.5, color: s[2], kind: 'none', level: 3, freq: 1 });
            edges.push({ a: stageHub, b: brHub, len: 80, k: 0.025, cross: false });
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
                secHub = addNode({ name: sn, type: 'hub', subject: s[0], r: 5, color: s[2], kind: 'none', level: 4, freq: 1 });
                edges.push({ a: brHub, b: secHub, len: 55, k: 0.03, cross: false });
              }
              secs[sn].forEach(function (it) {
                const nd = addNode({ name: it.title, type: 'topic', subject: s[0], r: 4, color: s[2], kind: 'kb', kid: it.id, lit: false, level: 5, freq: it.def && it.def.freq ? it.def.freq : 2 });
                edges.push({ a: secHub, b: nd, len: 30, k: 0.055, cross: false });
              });
            });
          });
        });
      });
      // 探索盘（第四盘）
      if (window.ExploreData) {
        const eRoot = addNode({ name: '探索之树', type: 'root', subject: 'explore', r: 15, color: '#f59e0b', kind: 'none', level: 1, freq: 1 });
        eRoot.fixed = true;
        const cats = {};
        ExploreData.forEach(function (d) { const c = d.cat || '交叉'; cats[c] = cats[c] || []; cats[c].push(d); });
        Object.keys(cats).forEach(function (c) {
          const cHub = addNode({ name: c, type: 'hub', subject: 'explore', r: 6, color: '#f59e0b', kind: 'none', level: 2, freq: 1 });
          edges.push({ a: eRoot, b: cHub, len: 100, k: 0.025, cross: false });
          cats[c].forEach(function (d) {
            const nd = addNode({ name: d.title, type: 'topic', subject: 'explore', r: 3.5, color: '#f59e0b', kind: 'exp', lit: false, level: 3, freq: 1 });
            edges.push({ a: cHub, b: nd, len: 42, k: 0.04, cross: false });
          });
        });
      }
      nodes.forEach(function (n) { n.lit = isLitNode(n); if (n.lit && n.type === 'topic') n.r = 6; });
      // 跨学科连线
      const byTitle = {};
      nodes.forEach(function (n) { if (n.type === 'topic') byTitle[n.name] = n; });
      function baseName(s) { return s.replace(/[（(].*?[)）]/g, '').trim(); }
      T.crossLinks.forEach(function (l) {
        const a = byTitle[baseName(l.from)], b = byTitle[baseName(l.to)];
        if (a && b) edges.push({ a: a, b: b, len: 200, k: 0.004, cross: true, text: l.text });
      });
    }

    // ---- 投影：平面(fx,fy) → 屏幕 ----
    function proj(n) {
      const c = centers[n.subject];
      return [n.fx, c[1] + (n.fy - c[1]) * SQUASH - liftOf(n)];
    }

    // ---- 物理模拟（平面坐标） ----
    let alpha = 1, dragging = null, panning = false, movedDist = 0;
    function tick() {
      if (!dragging && alpha < 0.005) return;
      const act = dragging ? Math.max(alpha, 0.12) : alpha;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const A = nodes[i], B = nodes[j];
          if (A.subject !== B.subject) continue; // 斥力只在本盘内（性能+不串盘）
          let dx = B.fx - A.fx, dy = B.fy - A.fy;
          let d2 = dx * dx + dy * dy;
          if (d2 < 1) { d2 = 1; dx = Math.random() - 0.5; dy = Math.random() - 0.5; }
          const d = Math.sqrt(d2);
          const f = 1800 / d2;
          if (!A.fixed) { A.vx -= dx / d * f; A.vy -= dy / d * f; }
          if (!B.fixed) { B.vx += dx / d * f; B.vy += dy / d * f; }
        }
      }
      edges.forEach(function (e) {
        const dx = e.b.fx - e.a.fx, dy = e.b.fy - e.a.fy;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = (d - e.len) * e.k;
        if (!e.a.fixed) { e.a.vx += dx / d * f; e.a.vy += dy / d * f; }
        if (!e.b.fixed) { e.b.vx -= dx / d * f; e.b.vy -= dy / d * f; }
      });
      nodes.forEach(function (n) {
        if (n.fixed) return;
        const c = centers[n.subject];
        const dx = n.fx - c[0], dy = n.fy - c[1];
        const d = Math.hypot(dx, dy) || 1;
        const target = ringR[n.level || 3] || 180;
        const f = (target - d) * 0.025;
        n.vx += dx / d * f; n.vy += dy / d * f;
        n.vx *= 0.86; n.vy *= 0.86;
        n.fx += n.vx * act; n.fy += n.vy * act;
        n.fx = Math.max(20, Math.min(W - 20, n.fx));
        n.fy = Math.max(120, Math.min(H - 60, n.fy));
      });
      if (!dragging) alpha *= 0.99;
    }

    // ---- 交互 ----
    let hover = null;
    function toCanvas(ev) {
      const r = canvas.getBoundingClientRect();
      return [ev.clientX - r.left, ev.clientY - r.top];
    }
    function findNode(mx, my) {
      let best = null, bd = 1e9;
      nodes.forEach(function (n) {
        const p = proj(n);
        const d = (p[0] - mx) * (p[0] - mx) + (p[1] - my) * (p[1] - my);
        const rr = (n.r + 7) * (n.r + 7);
        if (d < rr && d < bd) { bd = d; best = n; }
      });
      return best;
    }
    function neighbors(n) {
      const set = new Set([n]);
      edges.forEach(function (e) { if (e.a === n) set.add(e.b); if (e.b === n) set.add(e.a); });
      return set;
    }
    let lastMouse = null;
    canvas.addEventListener('mousedown', function (ev) {
      const m = toCanvas(ev);
      movedDist = 0;
      const n = findNode(m[0], m[1]);
      if (n) { dragging = n; n.fixed = true; alpha = Math.max(alpha, 0.2); } else { panning = true; }
      lastMouse = m;
    });
    window.addEventListener('mousemove', function (ev) {
      const m = toCanvas(ev);
      if (dragging) {
        const c = centers[dragging.subject];
        const nfx = m[0], nfy = c[1] + (m[1] + liftOf(dragging) - c[1]) / SQUASH;
        movedDist += Math.abs(nfx - dragging.fx) + Math.abs(nfy - dragging.fy);
        dragging.fx = nfx; dragging.fy = nfy;
        dragging.vx = 0; dragging.vy = 0;
        alpha = Math.max(alpha, 0.4);
        tip.style.display = 'none';
      } else if (panning && lastMouse) {
        holder.scrollLeft -= (m[0] - lastMouse[0]);
        movedDist += Math.abs(m[0] - lastMouse[0]);
      } else {
        hover = findNode(m[0], m[1]);
        if (hover) {
          tip.style.display = 'block';
          tip.style.left = (ev.clientX + 14) + 'px';
          tip.style.top = (ev.clientY + 14) + 'px';
          const freq = hover.freq || 1;
          const st = hover.type === 'root' ? '学科主干' : hover.type === 'hub' ? '分支层' :
            (hover.kind === 'kb' ? (hover.lit ? '★已点亮 · 点击进入' : '考点频率 ' + freq + ' · 点击进入') :
              hover.kind === 'exp' ? '探索主题 · 点击查看' : '');
          tip.innerHTML = '<b>' + hover.name + '</b><br><span style="color:#94a3b8">' + st + '</span>';
        } else tip.style.display = 'none';
      }
      lastMouse = m;
    });
    window.addEventListener('mouseup', function () {
      if (dragging) {
        dragging.fixed = false;
        if (movedDist < 5) openCard(dragging);
        dragging = null;
      }
      panning = false;
    });

    function openCard(nd) {
      card.innerHTML = '';
      const it = nd.kind === 'kb' ? Reg.byId[nd.kid] : null;
      const meta = document.createElement('div');
      meta.style.cssText = 'font-size:11px;color:#64748b;margin-bottom:4px';
      meta.textContent = it ? it.stage + ' · ' + it.branch + ' · 考点频率 ' + (it.def.freq || 2) + '/5' :
        (nd.kind === 'exp' ? '探索篇 · ' + (nd.name ? '' : '') + '自由探索' : '分支');
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
        go.className = 'btn'; go.style.textDecoration = 'none';
        go.textContent = '进入学习 →';
        const close = document.createElement('button');
        close.className = 'btn secondary'; close.textContent = '关闭';
        close.addEventListener('click', closeCard);
        btnRow.appendChild(go); btnRow.appendChild(close);
        card.appendChild(btnRow);
      } else if (nd.kind === 'exp') {
        const d = window.ExploreData ? ExploreData.find(function (x) { return x.title === nd.name; }) : null;
        const p = document.createElement('p');
        p.style.cssText = 'font-size:13px;line-height:1.7;color:#334155';
        p.textContent = d ? d.teaser + ' ' + (d.body || '').slice(0, 100) : '探索主题。';
        card.appendChild(p);
        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;gap:8px;margin-top:12px';
        const go = document.createElement('a');
        go.href = '#/explore';
        go.className = 'btn'; go.style.textDecoration = 'none';
        go.textContent = '去资料篇 →';
        const close = document.createElement('button');
        close.className = 'btn secondary'; close.textContent = '关闭';
        close.addEventListener('click', closeCard);
        btnRow.appendChild(go); btnRow.appendChild(close);
        card.appendChild(btnRow);
      } else {
        const cnt = nodes.filter(function (x) { return x.subject === nd.subject && x.type === 'topic'; }).length;
        const p = document.createElement('p');
        p.style.cssText = 'font-size:13px;color:#475569';
        p.textContent = '该分支共 ' + cnt + ' 个知识点节点。';
        card.appendChild(p);
        const close = document.createElement('button');
        close.className = 'btn secondary'; close.textContent = '关闭';
        close.addEventListener('click', closeCard);
        card.appendChild(close);
      }
      card.style.display = 'block';
      shade.style.display = 'block';
    }

    // ---- 绘制 ----
    function draw() {
      ctx.clearRect(0, 0, W, H);
      // Z 轴图例（左侧固定）
      ctx.strokeStyle = '#475569';
      ctx.beginPath(); ctx.moveTo(30, 120); ctx.lineTo(30, 320); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
      ctx.fillText('Z 轴', 22, 110);
      ctx.fillText('考点频率', 12, 340);
      for (let f = 1; f <= 5; f++) {
        const y = 320 - (f - 1) * 40;
        ctx.strokeStyle = '#475569';
        ctx.beginPath(); ctx.moveTo(26, y); ctx.lineTo(34, y); ctx.stroke();
        ctx.fillStyle = f >= 4 ? '#f59e0b' : '#64748b';
        ctx.fillText('频率' + f, 38, y + 3);
      }
      const hi = hover ? neighbors(hover) : null;

      // 圆盘参考环 + 标题
      [['math', '数学之树', '#2563eb'], ['physics', '物理之树', '#dc2626'], ['chemistry', '化学之树', '#059669'], ['explore', '探索之树', '#f59e0b']].forEach(function (s) {
        const c = centers[s[0]];
        ctx.strokeStyle = 'rgba(148,163,184,.1)';
        ctx.setLineDash([4, 6]);
        [105, 195, 275, 345].forEach(function (r) {
          ctx.beginPath(); ctx.ellipse(c[0], c[1], r, r * SQUASH, 0, 0, Math.PI * 2); ctx.stroke();
        });
        ctx.setLineDash([]);
        ctx.fillStyle = s[2];
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(s[1], c[0], c[1] - 345 * SQUASH - 60);
        ctx.textAlign = 'left';
      });

      // 边
      edges.forEach(function (e) {
        const pa = proj(e.a), pb = proj(e.b);
        const dim = hi && !(hi.has(e.a) && hi.has(e.b));
        ctx.strokeStyle = e.cross ? 'rgba(245,158,11,' + (dim ? 0.08 : 0.5) + ')' :
          'rgba(148,163,184,' + (dim ? 0.04 : 0.14) + ')';
        ctx.lineWidth = e.cross ? 1.5 : 1;
        if (e.cross) ctx.setLineDash([6, 5]); else ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
      });
      ctx.setLineDash([]);

      // 节点（先画立体柱，再画球）
      nodes.forEach(function (n) {
        const p = proj(n);
        const lift = liftOf(n);
        const dim = hi && !hi.has(n);
        ctx.globalAlpha = dim ? 0.15 : 1;
        // 立体柱（频率抬升）
        if (lift > 0 && n.type === 'topic') {
          const c = centers[n.subject];
          const baseY = c[1] + (n.fy - c[1]) * SQUASH;
          ctx.strokeStyle = 'rgba(245,158,11,.4)';
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(p[0], baseY); ctx.lineTo(p[0], p[1]); ctx.stroke();
        }
        const glow = n.lit || n === hover;
        if (glow) { ctx.shadowColor = n.lit ? '#f59e0b' : n.color; ctx.shadowBlur = 14; }
        ctx.beginPath(); ctx.arc(p[0], p[1], n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.lit ? '#f59e0b' : (n.type === 'root' ? n.color : n.type === 'hub' ? n.color : (n.subject === 'explore' ? 'rgba(251,191,36,.85)' : 'rgba(226,232,240,.9)'));
        ctx.fill();
        ctx.shadowBlur = 0;
        if (n.type === 'topic' && !n.lit && n.kind === 'kb') { ctx.strokeStyle = n.color; ctx.lineWidth = 1.2; ctx.stroke(); }
        const showLabel = n.type !== 'topic' || n.lit || (hi && hi.has(n)) || n.freq >= 4;
        if (showLabel) {
          ctx.fillStyle = n.type === 'topic' ? '#cbd5e1' : '#fff';
          ctx.font = (n.type === 'root' ? 'bold 13px' : '10px') + ' sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(n.name, p[0], p[1] - n.r - 4);
          ctx.textAlign = 'left';
        }
        ctx.globalAlpha = 1;
      });
    }

    // 视口感知
    let inView = true;
    const io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { inView = en.isIntersecting; });
    }, { rootMargin: '400px' });
    io.observe(holder);

    (function loop() {
      if (inView) { tick(); draw(); }
      window.requestAnimationFrame(loop);
    })();

    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn secondary';
    resetBtn.style.cssText = 'position:sticky;top:12px;left:12px;z-index:6;background:#1e293b;color:#e2e8f0;border:1px solid #475569';
    resetBtn.textContent = '⟲ 重新布局';
    resetBtn.addEventListener('click', function () { alpha = 1; });
    holder.appendChild(resetBtn);
  };

  window.Graph = T;
})();
