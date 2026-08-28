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
    let lit = 0, total = 0, built = 0;
    T.trees.forEach(tree => tree.branches.forEach(b => b.nodes.forEach(n => {
      total++;
      if (n.module) { built++; if (Progress.isLit(n.module)) lit++; }
    })));
    return { lit: lit, total: total, built: built };
  };

  T.render = function (root) {
    root.className = 'graph-page';
    const h1 = document.createElement('h1');
    h1.textContent = '知识图谱 · 三棵成长之树';
    root.appendChild(h1);

    const stat = T.countLit();
    const legend = document.createElement('div');
    legend.className = 'graph-legend';
    legend.textContent = '★ 金色 = 已点亮（学完）；灰色 = 待探索。当前进度：已点亮 ' + stat.lit + ' / 已建互动件 ' + stat.built + ' 个（图谱共 ' + stat.total + ' 个知识点）。点击带 ★ 或加粗的节点进入学习。';
    root.appendChild(legend);

    const treeWrap = document.createElement('div');
    treeWrap.className = 'graph-tree';

    T.trees.forEach(function (tree) {
      const col = document.createElement('div');
      col.className = 'g-col';
      const h3 = document.createElement('h3');
      h3.textContent = tree.title;
      h3.style.color = tree.color;
      col.appendChild(h3);
      tree.branches.forEach(function (branch) {
        const bh = document.createElement('div');
        bh.className = 'g-branch-title';
        bh.textContent = branch.name;
        bh.style.cssText = 'font-size:12px;color:#64748b;margin-top:10px;font-weight:600';
        col.appendChild(bh);
        const bw = document.createElement('div');
        bw.className = 'g-branch';
        branch.nodes.forEach(function (node) {
          const n = document.createElement('div');
          n.className = 'g-node';
          const lit = node.module && Progress.isLit(node.module);
          if (lit) n.classList.add('lit');
          n.textContent = node.name;
          if (node.sub) {
            const s = document.createElement('span');
            s.className = 'g-sub';
            s.textContent = node.sub;
            n.appendChild(s);
          }
          if (node.module) {
            n.classList.add('has-link');
            n.title = '点击进入互动学习' + (lit ? '（已点亮）' : '（学完答题可点亮）');
            n.addEventListener('click', function () {
              window.location.hash = '#/m/' + node.module;
            });
          } else {
            n.title = '该知识点互动件建设中';
          }
          bw.appendChild(n);
        });
        col.appendChild(bw);
      });
      treeWrap.appendChild(col);
    });
    root.appendChild(treeWrap);

    const cross = document.createElement('div');
    cross.className = 'g-cross';
    cross.innerHTML = '<b>学科交叉连线</b>（知识在这里互相点亮）：';
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
