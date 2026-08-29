/* graph.js — 知识图谱 · 星图 3.0：真理网状球
 * 布局：一个可拖拽旋转的球体。外壳(R=430)承载四学科+探索的全部知识点与分支层；
 *       内核(R=160)悬浮 15 个"科学真理"节点（能量守恒、熵、对称、涌现……）。
 *       每个知识点/探索主题双向挂接 1~3 条真理（金色虚线）；前置依赖(蓝色虚线)与跨学科关联(金色实线)叠在同一球面。
 * 交互：拖拽 = 轨道旋转 · 滚轮 = 缩放 · 悬停高亮关联子网 · 点击弹知识卡片（真理卡片可跳回全部关联知识点）。
 * 力学：3D 力导向（同学科斥力 + 边弹簧），每帧把节点投影回所属球壳，布局稳定后静止。
 */
(function () {
  const T = {};

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
      const total = Reg.count() + (window.ExploreData ? ExploreData.length : 0) +
        (window.ExploreData2 ? ExploreData2.length : 0) + (window.ExploreData3 ? ExploreData3.length : 0);
      for (const id in Reg.items) if (window.Progress && Progress.isLit('kb-' + id)) lit++;
      return { lit: lit, total: total, built: Reg.count() };
    }
    return { lit: 0, total: 0, built: 0 };
  };

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

  T.render = function (root) {
    root.className = 'graph-page';
    const h1 = document.createElement('h1');
    h1.textContent = '知识图谱 · 真理网状球';
    root.appendChild(h1);

    const stat = T.countLit();
    const legend = document.createElement('div');
    legend.className = 'graph-legend';
    legend.textContent = '拖拽旋转 · 滚轮缩放 · 悬停高亮关联子网 · 点击弹卡片。外壳 = 四学科+探索全部知识，内核 15 颗大节点 = 贯穿一切知识的科学真理（金色虚线双向挂接）；蓝色虚线 = 前置依赖，金色实线 = 跨学科关联。★金=已点亮，进度 ' +
      stat.lit + ' / ' + stat.total + '。';
    root.appendChild(legend);

    const holder = document.createElement('div');
    holder.style.cssText = 'position:relative;background:#0b1120;border-radius:12px;overflow:hidden;height:720px;cursor:grab';
    root.appendChild(holder);
    const canvas = document.createElement('canvas');
    holder.appendChild(canvas);
    const tip = document.createElement('div');
    tip.style.cssText = 'position:fixed;pointer-events:none;background:#1e293b;color:#e2e8f0;border:1px solid #475569;border-radius:8px;padding:6px 10px;font-size:12px;display:none;z-index:99;max-width:280px';
    document.body.appendChild(tip);
    const card = document.createElement('div');
    card.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(430px,92%);background:#fff;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.5);padding:20px;z-index:100;display:none;max-height:80%;overflow-y:auto';
    document.body.appendChild(card);
    const shade = document.createElement('div');
    shade.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,.45);z-index:99;display:none';
    document.body.appendChild(shade);
    function closeCard() { card.style.display = 'none'; shade.style.display = 'none'; }
    shade.addEventListener('click', closeCard);

    const W = holder.clientWidth || 1000, H = 720;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = '100%'; canvas.style.height = '100%';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /* ---- 球面布局参数 ---- */
    const R_OUT = 430, R_TRUTH = 165;
    // 学科经度带中心（弧度）与半宽
    const SECTORS = {
      math: { phi: -Math.PI * 0.75, color: '#2563eb', label: '数学' },
      physics: { phi: -Math.PI * 0.25, color: '#dc2626', label: '物理' },
      chemistry: { phi: Math.PI * 0.25, color: '#059669', label: '化学' },
      explore: { phi: Math.PI * 0.75, color: '#f59e0b', label: '探索' }
    };
    const nodes = [], edges = [];

    function sph(phi, theta, r) {
      return [r * Math.cos(theta) * Math.cos(phi), r * Math.sin(theta), r * Math.cos(theta) * Math.sin(phi)];
    }
    function addNode(n) {
      const sec = SECTORS[n.subject] || SECTORS.math;
      const lvl = n.level || 5;
      // 层级决定纬度带：主干靠近两极区外圈秩序，知识点铺满热带
      const latBand = { 1: 0, 2: 0.6, 3: 0.45, 4: 0.3, 5: 0 }[lvl] || 0;
      const phi = sec.phi + (Math.random() - 0.5) * 1.15;
      const theta = lvl === 1 ? 0.95 * (n.subject === 'explore' ? -1 : 1) * 0 :
        (Math.random() - 0.5) * 2 * (0.28 + latBand) + (lvl <= 2 ? 0 : (Math.random() - 0.5) * 0.3);
      const r = n.kind === 'truth' ? R_TRUTH : R_OUT;
      const p = sph(phi, theta, r);
      n.x = p[0]; n.y = p[1]; n.z = p[2];
      n.shell = r;
      n.vx = 0; n.vy = 0; n.vz = 0;
      n.deg = 0;
      nodes.push(n);
      return n;
    }
    const litKey = function (n) { return n.kind === 'kb' ? 'kb-' + n.kid : (n.module || null); };
    const isLitNode = function (n) { const k = litKey(n); return !!(k && window.Progress && Progress.isLit(k)); };

    if (window.Reg && Reg.count() > 0) {
      [['math', '数学', '#2563eb'], ['physics', '物理', '#dc2626'], ['chemistry', '化学', '#059669']].forEach(function (s) {
        const rootHub = addNode({ name: s[1], type: 'root', subject: s[0], r: 14, color: s[2], kind: 'none', level: 1 });
        ['初中', '高中'].forEach(function (stage, si) {
          const list = Reg.list(s[0], stage);
          if (!list.length) return;
          const stageHub = addNode({ name: stage, type: 'hub', subject: s[0], r: 8, color: s[2], kind: 'none', level: 2 });
          stageHub.y = (si === 0 ? -1 : 1) * R_OUT * 0.55; // 初中偏北半球、高中偏南半球
          edges.push({ a: rootHub, b: stageHub, len: 130, k: 0.03, cross: false });
          const branches = {};
          list.forEach(function (it) { branches[it.branch] = true; });
          Object.keys(branches).forEach(function (br) {
            const brHub = addNode({ name: br, type: 'hub', subject: s[0], r: 6, color: s[2], kind: 'none', level: 3 });
            edges.push({ a: stageHub, b: brHub, len: 95, k: 0.03, cross: false });
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
                secHub = addNode({ name: sn, type: 'hub', subject: s[0], r: 4.5, color: s[2], kind: 'none', level: 4 });
                edges.push({ a: brHub, b: secHub, len: 60, k: 0.035, cross: false });
              }
              secs[sn].forEach(function (it) {
                const nd = addNode({ name: it.title, type: 'topic', subject: s[0], r: 4, color: s[2], kind: 'kb', kid: it.id, lit: false, level: 5 });
                edges.push({ a: secHub, b: nd, len: 34, k: 0.06, cross: false });
              });
            });
          });
        });
      });
      // 探索：按分类挂在探索经度带
      const expAll = (window.ExploreData || []).concat(window.ExploreData2 || []).concat(window.ExploreData3 || []);
      if (expAll.length) {
        const eRoot = addNode({ name: '探索', type: 'root', subject: 'explore', r: 14, color: '#f59e0b', kind: 'none', level: 1 });
        const cats = {};
        expAll.forEach(function (d) { const c = d.cat || '交叉'; cats[c] = cats[c] || []; cats[c].push(d); });
        Object.keys(cats).forEach(function (c) {
          const cHub = addNode({ name: c, type: 'hub', subject: 'explore', r: 5.5, color: '#f59e0b', kind: 'none', level: 2 });
          edges.push({ a: eRoot, b: cHub, len: 110, k: 0.03, cross: false });
          cats[c].forEach(function (d) {
            const nd = addNode({ name: d.title, type: 'topic', subject: 'explore', r: 3.5, color: '#f59e0b', kind: 'exp', lit: false, level: 3 });
            edges.push({ a: cHub, b: nd, len: 46, k: 0.045, cross: false });
          });
        });
      }
      // 真理内核
      const truthNodes = {};
      if (window.Truths) {
        Truths.defs.forEach(function (td, i) {
          const golden = Math.PI * (3 - Math.sqrt(5));
          const y = 1 - (i / Math.max(1, Truths.defs.length - 1)) * 2;
          const rad = Math.sqrt(Math.max(0, 1 - y * y));
          const th = golden * i;
          const nd = addNode({ name: td.name, type: 'truth', subject: 'truth', r: 9, color: '#eab308', kind: 'truth', truthId: td.id, icon: td.icon, level: 1 });
          nd.x = Math.cos(th) * rad * R_TRUTH; nd.y = y * R_TRUTH; nd.z = Math.sin(th) * rad * R_TRUTH;
          truthNodes[td.id] = nd;
        });
        // 双向挂接：知识/探索 → 真理
        nodes.forEach(function (n) {
          if (n.kind === 'kb' && window.Reg) {
            const it = Reg.byId[n.kid];
            if (!it) return;
            Truths.forKb(it).forEach(function (tid) {
              if (truthNodes[tid]) edges.push({ a: truthNodes[tid], b: n, len: 300, k: 0.0012, truth: true });
            });
          } else if (n.kind === 'exp') {
            const d = expAll.find(function (x) { return x.title === n.name; });
            if (!d) return;
            Truths.forExplore(d).forEach(function (tid) {
              if (truthNodes[tid]) edges.push({ a: truthNodes[tid], b: n, len: 300, k: 0.0012, truth: true });
            });
          }
        });
      }
      // 跨学科连线
      const byTitle = {};
      nodes.forEach(function (n) { if (n.type === 'topic') byTitle[n.name] = n; });
      function baseName(s) { return s.replace(/[（(].*?[)）]/g, '').trim(); }
      T.crossLinks.forEach(function (l) {
        const a = byTitle[baseName(l.from)], b = byTitle[baseName(l.to)];
        if (a && b) edges.push({ a: a, b: b, len: 320, k: 0.002, cross: true, text: l.text });
      });
      // 前置依赖边：被依赖者 → 依赖者
      const byKid = {};
      nodes.forEach(function (n) { if (n.kind === 'kb') byKid[n.kid] = n; });
      if (window.Deps) {
        Object.keys(Deps).forEach(function (id) {
          const b = byKid[id];
          if (!b) return;
          (Deps[id] || []).forEach(function (p) {
            const a = byKid[p];
            if (a) edges.push({ a: a, b: b, len: 130, k: 0.008, dep: true });
          });
        });
      }
      edges.forEach(function (e) { e.a.deg++; e.b.deg++; });
      nodes.forEach(function (n) {
        n.lit = isLitNode(n);
        if (n.kind === 'kb' && window.Progress) {
          const g = Progress.checkGate(n.kid);
          n.gate = n.lit ? 'lit' : (g.ok ? 'avail' : 'locked');
          n.miss = g.missing;
          n.mastery = Progress.mastery(litKey(n));
        }
        if (n.lit && n.type === 'topic') n.r = 6;
        n.truthIds = [];
      });
      // 记录每个节点挂的真理 id（卡片用）
      edges.forEach(function (e) {
        if (e.truth) {
          if (e.b.truthIds && e.a.truthId) e.b.truthIds.push(e.a.truthId);
        }
      });
    }

    // ---- 3D 相机：真正的绕 Y / 绕 X 旋转 ----
    let yaw = 0.6, pitch = 0.35, zoom = 0.62;
    const CAMD = 2400;
    function project(n) {
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      const x1 = n.x * cy + n.z * sy;
      const z1 = -n.x * sy + n.z * cy;
      const y2 = n.y * cp - z1 * sp;
      const z2 = n.y * sp + z1 * cp;
      const s = CAMD / (CAMD + z2) * zoom;
      return [W / 2 + x1 * s, H / 2 + y2 * s, z2, s];
    }

    // ---- 3D 力导向：同学科斥力 + 弹簧，投影回球壳 ----
    let alpha = 1;
    function tick() {
      if (alpha < 0.005) return;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const A = nodes[i], B = nodes[j];
          if (A.subject !== B.subject) continue;
          let dx = B.x - A.x, dy = B.y - A.y, dz = B.z - A.z;
          let d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < 1) { d2 = 1; dx = Math.random() - 0.5; dy = Math.random() - 0.5; dz = Math.random() - 0.5; }
          const d = Math.sqrt(d2);
          const f = 2600 / d2;
          A.vx -= dx / d * f; A.vy -= dy / d * f; A.vz -= dz / d * f;
          B.vx += dx / d * f; B.vy += dy / d * f; B.vz += dz / d * f;
        }
      }
      edges.forEach(function (e) {
        if (e.truth) return; // 真理虚线不参与力学，避免内核被拉变形
        const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y, dz = e.b.z - e.a.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        const f = (d - e.len) * e.k;
        e.a.vx += dx / d * f; e.a.vy += dy / d * f; e.a.vz += dz / d * f;
        e.b.vx -= dx / d * f; e.b.vy -= dy / d * f; e.b.vz -= dz / d * f;
      });
      nodes.forEach(function (n) {
        n.vx *= 0.85; n.vy *= 0.85; n.vz *= 0.85;
        n.x += n.vx * alpha; n.y += n.vy * alpha; n.z += n.vz * alpha;
        // 投影回所属球壳
        const d = Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z) || 1;
        const r = n.shell || R_OUT;
        n.x = n.x / d * r; n.y = n.y / d * r; n.z = n.z / d * r;
      });
      alpha *= 0.985;
    }

    // ---- 交互：旋转/缩放/拾取 ----
    let hover = null, dragging = false, lastM = null, movedDist = 0;
    function toCanvas(ev) {
      const r = canvas.getBoundingClientRect();
      return [ev.clientX - r.left, ev.clientY - r.top];
    }
    function findNode(mx, my) {
      let best = null, bd = 1e9;
      nodes.forEach(function (n) {
        const p = project(n);
        const rr = Math.max(6, n.r * p[3] + 4);
        const d = (p[0] - mx) * (p[0] - mx) + (p[1] - my) * (p[1] - my);
        if (d < rr * rr && d < bd) { bd = d; best = n; }
      });
      return best;
    }
    function neighbors(n) {
      const set = new Set([n]);
      edges.forEach(function (e) { if (e.a === n) set.add(e.b); if (e.b === n) set.add(e.a); });
      return set;
    }
    canvas.addEventListener('mousedown', function (ev) {
      dragging = true; movedDist = 0; lastM = toCanvas(ev);
      holder.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', function (ev) {
      const m = toCanvas(ev);
      if (dragging && lastM) {
        const dx = m[0] - lastM[0], dy = m[1] - lastM[1];
        movedDist += Math.abs(dx) + Math.abs(dy);
        yaw += dx * 0.005;
        pitch += dy * 0.005;
        tip.style.display = 'none';
      } else {
        hover = findNode(m[0], m[1]);
        if (hover) {
          tip.style.display = 'block';
          tip.style.left = (ev.clientX + 14) + 'px';
          tip.style.top = (ev.clientY + 14) + 'px';
          const st = hover.type === 'root' ? '学科主干' : hover.type === 'hub' ? '分支层' :
            hover.kind === 'truth' ? '🌐 科学真理 · 点击查看关联知识' :
            (hover.kind === 'kb' ? (hover.lit ? '★已点亮 · 点击进入' : '连接度 ' + hover.deg + ' · 点击进入') :
              hover.kind === 'exp' ? '探索主题 · 点击查看' : '');
          tip.innerHTML = '<b>' + (hover.icon ? hover.icon + ' ' : '') + hover.name + '</b><br><span style="color:#94a3b8">' + st + '</span>';
        } else tip.style.display = 'none';
      }
      lastM = m;
    });
    window.addEventListener('mouseup', function () {
      if (dragging && movedDist < 5 && lastM) {
        const n = findNode(lastM[0], lastM[1]);
        if (n) openCard(n);
      }
      dragging = false;
      holder.style.cursor = 'grab';
    });
    holder.addEventListener('wheel', function (ev) {
      ev.preventDefault();
      zoom = Math.max(0.25, Math.min(2.2, zoom * (ev.deltaY > 0 ? 0.9 : 1.1)));
    }, { passive: false });
    // 触屏：单指旋转，双指捏合缩放
    let lastTouch = null, lastPinch = 0;
    holder.addEventListener('touchstart', function (ev) {
      if (ev.touches.length === 1) { lastTouch = [ev.touches[0].clientX, ev.touches[0].clientY]; movedDist = 0; }
      if (ev.touches.length === 2) {
        lastPinch = Math.hypot(ev.touches[0].clientX - ev.touches[1].clientX, ev.touches[0].clientY - ev.touches[1].clientY);
      }
    }, { passive: true });
    holder.addEventListener('touchmove', function (ev) {
      if (ev.touches.length === 1 && lastTouch) {
        const dx = ev.touches[0].clientX - lastTouch[0], dy = ev.touches[0].clientY - lastTouch[1];
        movedDist += Math.abs(dx) + Math.abs(dy);
        yaw += dx * 0.006; pitch += dy * 0.006;
        lastTouch = [ev.touches[0].clientX, ev.touches[0].clientY];
      } else if (ev.touches.length === 2) {
        const p = Math.hypot(ev.touches[0].clientX - ev.touches[1].clientX, ev.touches[0].clientY - ev.touches[1].clientY);
        if (lastPinch > 0) zoom = Math.max(0.25, Math.min(2.2, zoom * (p / lastPinch)));
        lastPinch = p;
        ev.preventDefault();
      }
    }, { passive: false });
    holder.addEventListener('touchend', function (ev) {
      if (movedDist < 8 && lastTouch) {
        const r = canvas.getBoundingClientRect();
        const n = findNode(lastTouch[0] - r.left, lastTouch[1] - r.top);
        if (n) openCard(n);
      }
      lastTouch = null; lastPinch = 0;
    });

    function chipEl(text, fg, bd, onClick) {
      const chip = document.createElement('a');
      chip.style.cssText = 'display:inline-block;margin:2px 4px 2px 0;padding:1px 8px;background:#fff;border:1px solid ' + bd + ';border-radius:10px;cursor:pointer;color:' + fg + ';font-size:12px';
      chip.textContent = text;
      chip.addEventListener('click', onClick);
      return chip;
    }

    function openCard(nd) {
      card.innerHTML = '';
      const it = nd.kind === 'kb' ? Reg.byId[nd.kid] : null;
      const meta = document.createElement('div');
      meta.style.cssText = 'font-size:11px;color:#64748b;margin-bottom:4px';
      meta.textContent = it ? it.stage + ' · ' + it.branch + ' · 连接度 ' + nd.deg :
        (nd.kind === 'exp' ? '探索篇 · 自由探索' : nd.kind === 'truth' ? '🌐 科学真理 · 科技树主干' : '分支');
      card.appendChild(meta);
      const h = document.createElement('h3');
      h.style.cssText = 'margin:0 0 10px;font-size:18px';
      h.innerHTML = (nd.icon ? nd.icon + ' ' : '') + nd.name + (nd.lit ? ' <span style="color:#f59e0b">★ 已点亮</span>' : '');
      card.appendChild(h);

      if (nd.kind === 'truth' && window.Truths) {
        const td = Truths.byId[nd.truthId];
        const p = document.createElement('p');
        p.style.cssText = 'font-size:13px;line-height:1.8;color:#334155';
        p.textContent = td ? td.desc : '';
        card.appendChild(p);
        const rev = Truths.reverse()[nd.truthId];
        if (rev) {
          const kbList = rev.kb.slice(0, 10);
          const kdiv = document.createElement('div');
          kdiv.style.cssText = 'margin-top:8px';
          kdiv.innerHTML = '<span style="font-size:12px;color:#64748b">📚 关联课内知识（共 ' + rev.kb.length + ' 个' + (rev.kb.length > 10 ? '，示前 10' : '') + '）：</span><br>';
          kbList.forEach(function (id) {
            const kn = nodes.find(function (x) { return x.kind === 'kb' && x.kid === id; });
            const item = Reg.byId[id];
            if (kn && item) kdiv.appendChild(chipEl(item.title, '#1e40af', '#93c5fd', function () { openCard(kn); }));
          });
          card.appendChild(kdiv);
          if (rev.exp.length) {
            const ediv = document.createElement('div');
            ediv.style.cssText = 'margin-top:8px';
            ediv.innerHTML = '<span style="font-size:12px;color:#64748b">🔭 关联探索主题（' + rev.exp.length + ' 个）：</span><br>';
            rev.exp.slice(0, 6).forEach(function (t) {
              ediv.appendChild(chipEl(t, '#92400e', '#f59e0b', function () {
                window._exploreQuery = t.split('：')[0];
                location.hash = '#/explore';
                closeCard();
              }));
            });
            card.appendChild(ediv);
          }
        }
        const close = document.createElement('button');
        close.className = 'btn secondary'; close.textContent = '关闭';
        close.style.marginTop = '12px';
        close.addEventListener('click', closeCard);
        card.appendChild(close);
      } else if (it) {
        // 真理 chips（双向挂接的反向）
        if (nd.truthIds && nd.truthIds.length && window.Truths) {
          const tdiv = document.createElement('div');
          tdiv.style.cssText = 'margin-bottom:8px';
          tdiv.innerHTML = '<span style="font-size:12px;color:#64748b">🌐 这条知识站在哪些真理上：</span><br>';
          nd.truthIds.forEach(function (tid) {
            const tn = nodes.find(function (x) { return x.kind === 'truth' && x.truthId === tid; });
            const td = Truths.byId[tid];
            if (tn && td) tdiv.appendChild(chipEl(td.icon + ' ' + td.name, '#a16207', '#eab308', function () { openCard(tn); }));
          });
          card.appendChild(tdiv);
        }
        if (window.Deps) {
          const deps = Deps[it.id] || [];
          if (!nd.lit && nd.gate === 'locked' && deps.length) {
            const gdiv = document.createElement('div');
            gdiv.style.cssText = 'background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:8px 10px;font-size:12.5px;margin-bottom:8px;color:#92400e';
            gdiv.innerHTML = '🔒 建议先点亮：';
            deps.forEach(function (pid) {
              const pn = byKidSafe(pid);
              if (pn) gdiv.appendChild(chipEl(pn.name, '#92400e', '#f59e0b', function () { openCard(pn); }));
            });
            card.appendChild(gdiv);
          }
          const unlocks = (window.DepsUnlocks && DepsUnlocks[it.id]) || [];
          if (nd.lit && unlocks.length) {
            const udiv = document.createElement('div');
            udiv.style.cssText = 'background:#ecfdf5;border:1px solid #6ee7b7;border-radius:8px;padding:8px 10px;font-size:12.5px;margin-bottom:8px;color:#065f46';
            udiv.innerHTML = '🗝️ 已为你解锁：';
            unlocks.slice(0, 4).forEach(function (pid) {
              const pn = byKidSafe(pid);
              if (pn) udiv.appendChild(chipEl(pn.name, '#065f46', '#6ee7b7', function () { openCard(pn); }));
            });
            card.appendChild(udiv);
          }
          if (nd.lit && typeof nd.mastery === 'number' && nd.mastery < 1) {
            const rdiv = document.createElement('div');
            rdiv.style.cssText = 'background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:8px 10px;font-size:12.5px;margin-bottom:8px;color:#1e40af';
            rdiv.innerHTML = '🕐 记忆在变暗（掌握度 ' + Math.round(nd.mastery * 100) + '%）——去复习答对一题即可回满';
            card.appendChild(rdiv);
          }
        }
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
        const expAll = (window.ExploreData || []).concat(window.ExploreData2 || []).concat(window.ExploreData3 || []);
        const d = expAll.find(function (x) { return x.title === nd.name; });
        if (nd.truthIds && nd.truthIds.length && window.Truths) {
          const tdiv = document.createElement('div');
          tdiv.style.cssText = 'margin-bottom:8px';
          tdiv.innerHTML = '<span style="font-size:12px;color:#64748b">🌐 关联真理：</span><br>';
          nd.truthIds.forEach(function (tid) {
            const tn = nodes.find(function (x) { return x.kind === 'truth' && x.truthId === tid; });
            const td = Truths.byId[tid];
            if (tn && td) tdiv.appendChild(chipEl(td.icon + ' ' + td.name, '#a16207', '#eab308', function () { openCard(tn); }));
          });
          card.appendChild(tdiv);
        }
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
        go.addEventListener('click', function () { if (d) window._exploreQuery = d.title.split('：')[0]; });
        const close = document.createElement('button');
        close.className = 'btn secondary'; close.textContent = '关闭';
        close.addEventListener('click', closeCard);
        btnRow.appendChild(go); btnRow.appendChild(close);
        card.appendChild(btnRow);
      } else {
        const p = document.createElement('p');
        p.style.cssText = 'font-size:13px;color:#475569';
        p.textContent = '分支节点「' + nd.name + '」，连接度 ' + nd.deg + '。拖拽旋转球体可查看其下的知识点。';
        card.appendChild(p);
        const close = document.createElement('button');
        close.className = 'btn secondary'; close.textContent = '关闭';
        close.addEventListener('click', closeCard);
        card.appendChild(close);
      }
      card.style.display = 'block';
      shade.style.display = 'block';
    }
    function byKidSafe(id) {
      for (let i = 0; i < nodes.length; i++) if (nodes[i].kind === 'kb' && nodes[i].kid === id) return nodes[i];
      return null;
    }
    // 测试钩子（自检脚本用，不影响交互）
    T._last = { nodes: nodes, edges: edges, project: project, openCard: openCard };

    // ---- 绘制（深度排序） ----
    function drawSphereFrame() {
      // 球体轮廓 + 纬线环，给"球"的深度感
      const rings = [[0, '#334155', 1.2], [Math.PI / 6, '#1e293b', 0.8], [-Math.PI / 6, '#1e293b', 0.8], [Math.PI / 3, '#172033', 0.6], [-Math.PI / 3, '#172033', 0.6]];
      rings.forEach(function (rg) {
        const lat = rg[0], rr = R_OUT * Math.cos(lat), yy = R_OUT * Math.sin(lat);
        ctx.strokeStyle = 'rgba(51,65,85,' + (0.35 * rg[2]) + ')';
        ctx.lineWidth = rg[2];
        ctx.beginPath();
        let started = false;
        for (let i = 0; i <= 72; i++) {
          const ph = i / 72 * Math.PI * 2;
          const p = project({ x: rr * Math.cos(ph), y: yy, z: rr * Math.sin(ph) });
          if (!started) { ctx.moveTo(p[0], p[1]); started = true; } else ctx.lineTo(p[0], p[1]);
        }
        ctx.stroke();
      });
      // 内核球轮廓
      ctx.strokeStyle = 'rgba(234,179,8,.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      let st2 = false;
      for (let i = 0; i <= 72; i++) {
        const ph = i / 72 * Math.PI * 2;
        const p = project({ x: R_TRUTH * Math.cos(ph), y: 0, z: R_TRUTH * Math.sin(ph) });
        if (!st2) { ctx.moveTo(p[0], p[1]); st2 = true; } else ctx.lineTo(p[0], p[1]);
      }
      ctx.stroke();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const hi = hover ? neighbors(hover) : null;
      drawSphereFrame();
      // 边
      edges.forEach(function (e) {
        const pa = project(e.a), pb = project(e.b);
        const dim = hi && !(hi.has(e.a) && hi.has(e.b));
        if (e.truth) {
          const on = hover && (e.a === hover || e.b === hover);
          ctx.strokeStyle = on ? 'rgba(234,179,8,.85)' : 'rgba(234,179,8,' + (dim ? 0.02 : 0.06) + ')';
          ctx.lineWidth = on ? 1.4 : 0.7;
          ctx.setLineDash([3, 6]);
        } else if (e.dep) {
          const litEdge = e.a.lit && e.b.lit;
          ctx.strokeStyle = litEdge ? 'rgba(96,165,250,' + (dim ? 0.08 : 0.55) + ')' :
            'rgba(96,165,250,' + (dim ? 0.04 : 0.22) + ')';
          ctx.lineWidth = litEdge ? 1.6 : 1;
          ctx.setLineDash([2, 4]);
        } else {
          ctx.strokeStyle = e.cross ? 'rgba(245,158,11,' + (dim ? 0.06 : 0.45) + ')' :
            'rgba(148,163,184,' + (dim ? 0.03 : 0.14) + ')';
          ctx.lineWidth = e.cross ? 1.4 : 0.8;
          ctx.setLineDash(e.cross ? [5, 5] : []);
        }
        ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
      });
      ctx.setLineDash([]);
      // 节点按深度排序（远→近）
      const sorted = nodes.map(function (n) { return [project(n), n]; })
        .sort(function (a, b) { return b[0][2] - a[0][2]; });
      sorted.forEach(function (pair) {
        const p = pair[0], n = pair[1];
        const dim = hi && !hi.has(n);
        const depthFade = Math.max(0.3, Math.min(1, 1.25 - p[2] / 1700));
        ctx.globalAlpha = (dim ? 0.12 : 1) * depthFade;
        const rr = Math.max(1.5, n.r * p[3]);
        const glow = n.lit || n === hover || n.gate === 'avail' || n.kind === 'truth';
        if (glow) { ctx.shadowColor = n.lit ? '#f59e0b' : n.color; ctx.shadowBlur = n.kind === 'truth' ? 18 : 12; }
        ctx.beginPath(); ctx.arc(p[0], p[1], rr, 0, Math.PI * 2);
        let fill;
        if (n.kind === 'truth') {
          fill = '#eab308';
        } else if (n.lit) {
          const ma = (typeof n.mastery === 'number') ? n.mastery : 1;
          const al = 0.3 + 0.7 * ma;
          fill = 'rgba(245,158,11,' + al.toFixed(2) + ')';
        } else if (n.gate === 'locked') {
          fill = 'rgba(71,85,105,.55)';
        } else {
          fill = n.type === 'root' || n.type === 'hub' ? n.color :
            (n.subject === 'explore' ? 'rgba(251,191,36,.85)' : 'rgba(226,232,240,.92)');
        }
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.shadowBlur = 0;
        if (n.kind === 'truth') {
          ctx.strokeStyle = '#fef3c7'; ctx.lineWidth = 1.5; ctx.stroke();
        } else if (n.type === 'topic' && !n.lit && n.kind === 'kb') {
          ctx.strokeStyle = n.gate === 'locked' ? 'rgba(100,116,139,.6)' : n.color;
          ctx.lineWidth = n.gate === 'avail' ? 1.8 : 1;
          ctx.stroke();
        }
        const showLabel = n.kind === 'truth' || n.type !== 'topic' || n.lit || n.gate === 'avail' || (hi && hi.has(n)) || n.deg >= 9 || zoom > 1.1;
        if (showLabel) {
          ctx.fillStyle = n.kind === 'truth' ? '#fde68a' : n.type === 'topic' ? '#cbd5e1' : '#fff';
          ctx.font = (n.kind === 'truth' ? 'bold 12px' : n.type === 'root' ? 'bold 14px' : '11px') + ' sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText((n.icon ? n.icon + ' ' : '') + n.name, p[0], p[1] - rr - 5);
          ctx.textAlign = 'left';
        }
        ctx.globalAlpha = 1;
      });
      // 图例
      ctx.fillStyle = '#64748b'; ctx.font = '11px sans-serif';
      ctx.fillText('外壳：四学科知识 + 探索主题', 16, H - 40);
      ctx.fillStyle = '#eab308';
      ctx.fillText('内核：15 条科学真理（金色虚线双向挂接）', 16, H - 24);
    }

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
    resetBtn.style.cssText = 'position:absolute;top:12px;right:12px;z-index:6;background:#1e293b;color:#e2e8f0;border:1px solid #475569';
    resetBtn.textContent = '⟲ 重置视角';
    resetBtn.addEventListener('click', function () { yaw = 0.6; pitch = 0.35; zoom = 0.62; alpha = 0.6; });
    holder.appendChild(resetBtn);
  };

  window.Graph = T;
})();
