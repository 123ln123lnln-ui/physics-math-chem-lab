/* explore.js — 资料篇：超越教材的自由探索（标注"探索级"）
 * 原则：内容为科普性拓展，明确标注超出课标范围，不与教材考点混同。
 */
(function () {
  const E = {};

  E.topics = [
    {
      title: '微积分直观：切线斜率就是导数',
      level: '探索级 · 高中衔接',
      teaser: '导数的本质是"瞬时变化率"——把割线无限逼近切线。',
      body: '我们已经有了"导数与切线"互动件（见数学之树）。在更高观点里，导数是函数在某一点的变化率：v = ds/dt（瞬时速度），a = dv/dt。积分则是它的逆运算——把无数微小的量累加。微积分基本定理把二者连起来：∫(dF/dx)dx = F。想深入，可从"极限"概念起步。',
      link: '#/m/derivative-tangent',
      linkText: '去玩"导数与切线"互动件 →'
    },
    {
      title: '分形：自相似的无穷细节',
      level: '探索级 · 混沌与分形',
      teaser: '放大一棵"树"，每个小枝都像整棵树——这就是自相似。',
      body: '曼德博集合、谢尔宾斯基三角形、科赫雪花，都是"局部像整体"的图形，用简单的迭代规则就能生成无穷复杂的结构。分形维数可以是小数（科赫雪花约 1.26 维），这打破了"维度必须是整数"的直觉。大自然里的海岸线、闪电、花椰菜都近似分形。',
      demo: 'koch'
    },
    {
      title: '相对论：时间与速度有关',
      level: '探索级 · 近代物理',
      teaser: '当速度接近光速，时间会变慢——时间膨胀效应。',
      body: '爱因斯坦狭义相对论：运动时钟变慢，因子 γ = 1/√(1−v²/c²)。v=0.8c 时 γ≈1.67，即飞船上 1 秒对应地面 1.67 秒。质能方程 E=mc² 说明质量本身就是能量。这些已被粒子加速器和 GPS 卫星反复验证，是真实物理，不是科幻。',
      demo: 'time'
    },
    {
      title: '量子世界：波粒二象性',
      level: '探索级 · 量子物理',
      teaser: '光既是波又是粒子；电子也能产生干涉条纹。',
      body: '双缝实验中，单个光子/电子一次次打在屏上，累积出干涉条纹——单个粒子表现出波动性。测不准原理说，位置和动量不能同时被精确确定。量子力学是现代化学、半导体、激光的物理基础。你化学课看到的元素周期表，根源就是量子化的电子能级。',
      link: '#/m/periodic-table',
      linkText: '回看元素周期表（量子力学的化学结果）→'
    },
    {
      title: '黄金比例与斐波那契',
      level: '探索级 · 数学之美',
      teaser: '1,1,2,3,5,8,13… 相邻之比趋向 1.618——黄金比例。',
      body: '斐波那契数列相邻项之比收敛到 φ=(1+√5)/2≈1.618。向日葵的种子螺旋、鹦鹉螺的壳、许多植物的叶序都遵循这个比例。它来自一个简单递推，却出现在几何、艺术与自然中，是"简单规则产生复杂秩序"的经典例子。',
      demo: 'golden'
    },
    {
      title: '拓扑学：咖啡杯 = 甜甜圈',
      level: '探索级 · 大学数学',
      teaser: '在不撕破、不粘合的前提下，有把手的杯子和甜甜圈"一样"。',
      body: '拓扑学研究"连续变形下不变的性质"。它可以把物体像橡皮泥一样任意拉伸弯曲，但不能撕开或粘上。于是杯子的把手孔和甜甜圈的孔是同一个拓扑特征（亏格=1）。这是现代数学的重要分支，连接到物理中的相变与材料科学。',
      link: null
    },
    {
      title: '群论：对称的数学',
      level: '探索级 · 抽象代数',
      teaser: '一个正方形旋转/翻转后还能和自己重合——这些操作构成"群"。',
      body: '群是带一种运算的集合，满足封闭、结合、单位元、逆元。正方形的 8 个对称操作构成二面体群。群论是理解晶体结构（化学！）、粒子物理标准模型、密码学的共同语言。对称性越高的物体，对称群越大。',
      link: '#/m/periodic-table',
      linkText: '晶体与对称 → 元素周期表'
    }
  ];

  E.render = function (root) {
    const h1 = document.createElement('h1');
    h1.textContent = '资料篇 · 自由探索';
    root.appendChild(h1);
    const sub = document.createElement('div');
    sub.className = 'graph-legend';
    sub.textContent = '这里的内容超出课标，是通往更高深世界的窗口。标注"探索级"，仅作兴趣拓展，不作为考点。每个主题都给出"再深入一步"的方向。';
    root.appendChild(sub);

    const grid = document.createElement('div');
    grid.className = 'subject-grid';

    E.topics.forEach(function (tp) {
      const card = document.createElement('div');
      card.className = 'subject-card';
      const h2 = document.createElement('h2');
      h2.style.fontSize = '17px';
      h2.textContent = tp.title;
      card.appendChild(h2);
      const lv = document.createElement('p');
      lv.className = 'desc';
      lv.style.color = '#b45309';
      lv.textContent = tp.level;
      card.appendChild(lv);
      const teaser = document.createElement('p');
      teaser.style.cssText = 'font-weight:600;margin:6px 0;font-size:14px';
      teaser.textContent = tp.teaser;
      card.appendChild(teaser);
      const body = document.createElement('p');
      body.style.cssText = 'font-size:13.5px;color:#334155;line-height:1.7';
      body.textContent = tp.body;
      card.appendChild(body);

      if (tp.demo) {
        const dv = document.createElement('div');
        dv.style.marginTop = '10px';
        E.renderDemo(dv, tp.demo);
        card.appendChild(dv);
      }
      if (tp.link) {
        const a = document.createElement('a');
        a.href = tp.link;
        a.style.cssText = 'display:inline-block;margin-top:8px;color:var(--c-primary);font-size:13px;text-decoration:none;font-weight:600';
        a.textContent = tp.linkText;
        card.appendChild(a);
      }
      grid.appendChild(card);
    });
    root.appendChild(grid);
  };

  // 小型现场演示
  E.renderDemo = function (holder, type) {
    const canvas = document.createElement('canvas');
    holder.appendChild(canvas);
    const W = 340, H = 140;
    const ctx = UI.setupCanvas(canvas, W, H);
    ctx.clearRect(0, 0, W, H);

    if (type === 'golden') {
      // 斐波那契螺旋（简化）
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
      let a = 1, b = 1, x = W / 2, y = H / 2, angle = 0, scale = 4;
      ctx.beginPath(); ctx.moveTo(x, y);
      for (let i = 0; i < 40; i++) {
        angle += 0.35;
        const r = a * scale * 0.12;
        x += Math.cos(angle) * r; y += Math.sin(angle) * r;
        ctx.lineTo(x, y);
        const t = a + b; a = b; b = t;
        if (b > 400) break;
      }
      ctx.stroke();
    } else if (type === 'time') {
      // 时间膨胀示意：两个时钟，快慢不同
      ctx.fillStyle = '#475569'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('地面时钟：1.67 s', W * 0.3, 30);
      ctx.fillText('飞船时钟：1.00 s', W * 0.72, 30);
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(W * 0.3, 80, 34, 0, Math.PI * 1.5); ctx.stroke();
      ctx.strokeStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(W * 0.72, 80, 34, 0, Math.PI * 0.9); ctx.stroke();
      ctx.fillStyle = '#64748b'; ctx.fillText('v = 0.8c 时', W / 2, 128);
    } else if (type === 'koch') {
      // 科赫雪花（3 次迭代示意）
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 1.5;
      function koch(x1, y1, x2, y2, depth) {
        if (depth === 0) { ctx.lineTo(x2, y2); return; }
        const dx = (x2 - x1) / 3, dy = (y2 - y1) / 3;
        const ax = x1 + dx, ay = y1 + dy;
        const bx = x1 + 2 * dx, by = y1 + 2 * dy;
        const mx = (ax + bx) / 2 - dy * Math.sqrt(3) / 2;
        const my = (ay + by) / 2 + dx * Math.sqrt(3) / 2;
        koch(x1, y1, ax, ay, depth - 1);
        koch(ax, ay, mx, my, depth - 1);
        koch(mx, my, bx, by, depth - 1);
        koch(bx, by, x2, y2, depth - 1);
      }
      const cx = W / 2, cy = H / 2 + 12, r = 52;
      const pts = [];
      for (let i = 0; i < 3; i++) {
        const th = -Math.PI / 2 + i * 2 * Math.PI / 3;
        pts.push([cx + r * Math.cos(th), cy + r * Math.sin(th)]);
      }
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 0; i < 3; i++) {
        const p1 = pts[i], p2 = pts[(i + 1) % 3];
        koch(p1[0], p1[1], p2[0], p2[1], 3);
      }
      ctx.closePath(); ctx.stroke();
    }
  };

  window.Explore = E;
})();
