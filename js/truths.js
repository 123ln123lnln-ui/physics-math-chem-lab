/* truths.js — 科学真理层：把 243 个课内知识点 + 全部探索主题挂到"人类与宇宙科技树"的主干思想上
 * 每个真理节点 = 一条贯穿学科的底层规律/方法论；课内知识与探索主题通过规则双向挂接（各连 1~3 条真理）。
 * 数据接口：Truths.defs（真理定义）· Truths.forKb(item) · Truths.forExplore(d) → 真理 id 数组。
 */
(function () {
  const T = {};

  T.defs = [
    { id: 'quantify',    name: '量化与测量',   icon: '📏', desc: '给世界一把尺：科学从把"多少"变成数开始。从肘尺、天平到国际单位制，测量让争论变成计算。' },
    { id: 'experiment',  name: '实验与证据',   icon: '🔬', desc: '让自然开口说话：对错不由权威裁定，而由可重复的实验裁决。这是科学区别于一切玄学的分界线。' },
    { id: 'mathlang',    name: '数学语言',     icon: '∑', desc: '伽利略：自然之书用数学语言写成。方程、函数与向量是人类发明的最精确的叙事方式。' },
    { id: 'model',       name: '模型与近似',   icon: '🗺️', desc: '"所有模型都是错的，但有些有用。"科学不是复制世界，而是造出越来越好用的地图。' },
    { id: 'infinity',    name: '极限与无穷',   icon: '∞', desc: '无穷不是一个数，而是一个过程。学会"无限逼近"，人类才有了微积分，才有了精确描述变化的工具。' },
    { id: 'random',      name: '随机与概率',   icon: '🎲', desc: '单次偶然，大量必然。概率论让人类在不确定的世界里做出确定的决策——从保险到量子力学。' },
    { id: 'conservation', name: '守恒律',      icon: '⚖️', desc: '万变中的不变：能量、动量、电荷守恒是物理学的基石，也是一切工程计算的底气。' },
    { id: 'entropy',     name: '熵与时间之矢', icon: '🕯️', desc: '为什么时间有方向？熵增给出答案。它解释了热机极限、生命为何消耗能量、宇宙的最终命运。' },
    { id: 'symmetry',    name: '对称与不变',   icon: '❄️', desc: '每一种对称背后都藏着一条守恒律（诺特定理）。从雪花到标准模型，对称是宇宙的美学也是法则。' },
    { id: 'wave',        name: '波与振动',     icon: '〰️', desc: '从琴弦到电磁波再到物质波，振动与叠加是宇宙的通用节奏——声、光、无线电、量子同出一门。' },
    { id: 'interaction', name: '相互作用与场', icon: '🧲', desc: '引力、电磁、强、弱——四种基本相互作用统治宇宙。"场"的概念让超距作用退场，统一之路仍在继续。' },
    { id: 'structure',   name: '结构决定性质', icon: '💎', desc: '同样是碳，排列成石墨软、排列成钻石硬。从原子排列到社会网络，结构即命运。' },
    { id: 'evolution',   name: '演化与反馈',   icon: '🌱', desc: '正反馈放大、负反馈稳定——这条回路塑造了星系、生态、生命与文明，也解释了平衡为何总会移动。' },
    { id: 'information', name: '信息与编码',   icon: '💾', desc: '信息是物理的。从摩尔斯电码到 DNA 再到芯片，学会编码的世界开始自己思考。' },
    { id: 'emergence',   name: '涌现与系统',   icon: '🐦', desc: '整体大于部分之和：神经元不识单词却有意识，单鸟无指挥却有鸟群。简单规则涌现复杂秩序。' }
  ];
  T.byId = {};
  T.defs.forEach(function (d) { T.byId[d.id] = d; });

  /* 关键词 → 真理 规则表：按顺序匹配，取前 3 条 */
  const RULES = [
    ['entropy',     /熵|热力学|物态|内能|温度|比热|扩散|耗散|过饱和|结晶|温室|布朗/],
    ['conservation', /能量守恒|机械能|动量|电荷守恒|质量守恒|配平|方程式|燃烧|燃料|电池|电功|电功率|焦耳|功率/],
    ['wave',        /波|振动|频率|声|音调|响度|干涉|衍射|多普勒|交流|电磁波|光|折射|反射|透镜|色散|散射|共振|简谐|激光|引力波/],
    ['random',      /概率|统计|随机|分布|期望|方差|排列|组合|二项|高尔顿|生日|蒙提霍尔|布丰|蒙特卡洛|误差|抽样/],
    ['infinity',    /极限|无穷|无限|导数|积分|级数|收敛|切线|瞬时|π|圆周率|圆面积|穷竭|对角线|康托尔/],
    ['symmetry',    /对称|周期律|周期表|旋转|平移|轴对称|变换|群|守恒|不变量|诺特|宇称/],
    ['structure',   /结构|晶体|化学键|分子|原子|离子|元素|核素|同分异构|有机|烃|苯|几何|三角形|四边形|圆$|立体|向量|复数|坐标系|材料|合金|半导体|蛋白质|手性/],
    ['interaction', /力$|力与|二力|摩擦|压强|浮力|杠杆|滑轮|引力|磁场|电场|电磁感应|电荷|库仑|置换|中和|反应速率|化学平衡|离子平衡|水解|氧化还原|催化|活化能/],
    ['evolution',   /演化|反馈|平衡移动|生态|进化|混沌|分岔|双摆|吸引子|生命|细胞|遗传|自然选择|恒星|核聚变|宇宙|核素合成/],
    ['information', /信息|编码|密码|算法|计算复杂|程序|比特|通信|芯片|智能|AlphaFold|量子计算|图灵机|RSA/],
    ['emergence',   /涌现|系统|网络|自组织|集群|六度|无标度|鸟群|博弈|合作|蜂窝|黏菌/],
    ['random',      /误差|有效数字/],
    ['quantify',    /测量|单位|科学记数|密度|速度|浓度|pH|摩尔|物质的量|滴定|计算|定量|有效数字|标尺|度/],
    ['experiment',  /实验|探究|操作|现象|观察|检验|制备|分离|焰色/],
    ['model',       /模型|近似|估算|理想|图像|坐标|函数|模拟|拟合|等效/],
    ['mathlang',    /方程|函数|向量|数列|集合|逻辑|不等式|整式|分式|根式|因式|实数|有理数|绝对值|乘方|公式/]
  ];

  function pick(text, fallback) {
    const out = [];
    for (let i = 0; i < RULES.length && out.length < 3; i++) {
      if (RULES[i][1].test(text) && out.indexOf(RULES[i][0]) < 0) out.push(RULES[i][0]);
    }
    if (!out.length) out.push(fallback);
    return out;
  }

  T.forKb = function (it) {
    const fb = it.subject === 'math' ? 'mathlang' : it.subject === 'physics' ? 'interaction' : 'structure';
    return pick((it.branch || '') + ' ' + (it.title || ''), fb);
  };

  T.forExplore = function (d) {
    return pick((d.cat || '') + ' ' + (d.title || '') + ' ' + (d.teaser || ''), 'emergence');
  };

  /* 反向索引（懒构建）：truthId → { kb: [kbId...], exp: [title...] } */
  let revCache = null;
  T.reverse = function () {
    if (revCache) return revCache;
    const rev = {};
    T.defs.forEach(function (d) { rev[d.id] = { kb: [], exp: [] }; });
    if (window.Reg) {
      ['math', 'physics', 'chemistry'].forEach(function (s) {
        ['初中', '高中'].forEach(function (st) {
          Reg.list(s, st).forEach(function (it) {
            T.forKb(it).forEach(function (t) { rev[t].kb.push(it.id); });
          });
        });
      });
    }
    (window.ExploreData || []).concat(window.ExploreData2 || []).concat(window.ExploreData3 || []).forEach(function (d) {
      T.forExplore(d).forEach(function (t) { rev[t].exp.push(d.title); });
    });
    revCache = rev;
    return rev;
  };

  window.Truths = T;
})();
