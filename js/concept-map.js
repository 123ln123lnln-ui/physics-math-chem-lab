/* concept-map.js — 概念知识点 → 演示动画模板映射（全覆盖 + 兜底） */
(function () {
  const M = {};

  // 显式映射（知识点 id → 演示模板）
  const MAP = {
    /* ===== 数学 ===== */
    math_j2_03: { core: 'factorize', o: { label: '因式分解：把面积块提取公因式，化为乘积形式' } },
    math_j3_02: { core: 'polyhedron', o: { label: '实数与数轴上的点一一对应' } },
    math_j7_02: { core: 'vtGraph', o: { label: '函数：每个 x 对应唯一 y —— 图像上的竖直检验' } },
    math_j9_04: { core: 'congruent', o: {} },
    math_j11_03: { core: 'similar', o: { label: '圆周角 = 圆心角的一半（同弧所对）' } },
    math_j13_01: { core: 'polyhedron', o: {} },
    math_j14_03: { core: 'reaction', o: { speed: 0.6, label: '列举法：把所有等可能结果一个不漏地列出来' } },
    math_j15_02: { core: 'sampling', o: { label: '抽样调查：从总体随机抽样，用样本估计总体' } },
    math_g1_02: { core: 'necessary', o: { label: '充分必要条件：小范围⇒大范围，看集合包含方向' } },
    math_g1_03: { core: 'quantifier', o: { label: '命题的否定：∀↔∃ 互换，结论取否' } },
    math_g2_04: { core: 'vtGraph', o: { label: '单调性看图像升降；偶函数关于 y 轴对称' } },
    math_g3_03: { core: 'flow', o: { steps: ['看通项', '裂项相消', '错位相减', '分组求和'], label: '先分析通项结构，再选求和方法' } },

    /* ===== 物理（初中） ===== */
    phy_j1_03: { core: 'sound', o: {} },
    phy_j1_04: { core: 'sound', o: { label: '控制噪声三途径：声源处/传播中/人耳处' } },
    phy_j2_01: { core: 'ray', o: { mode: 'straight' } },
    phy_j2_05: { core: 'ray', o: { mode: 'prism' } },
    phy_j3_02: { core: 'state', o: {} },
    phy_j3_03: { core: 'evap', o: {} },
    phy_j3_05: { core: 'engine4', o: {} },
    phy_j4_03: { core: 'inertia', o: {} },
    phy_j4_04: { core: 'force', o: { label: '二力平衡：同体、等大、反向、共线 → 物体静止或匀速' } },
    phy_j4_06: { core: 'friction', o: {} },
    phy_j4_09: { core: 'atm', o: {} },
    phy_j5_01: { core: 'circuit', o: {} },
    phy_j5_07: { core: 'circuit', o: { autoSwitch: true, label: '家庭电路：开关接火线，电流过大时自动切断' } },
    phy_j6_01: { core: 'field', o: { mode: 'magnet' } },
    phy_j6_02: { core: 'coil', o: { gen: false, label: '电生磁：通电线圈产生磁场（安培定则判断极性）' } },
    phy_j6_03: { core: 'coil', o: { gen: true } },
    phy_j6_04: { core: 'emWave', o: {} },

    /* ===== 物理（高中） ===== */
    phy_g1_02: { core: 'vtGraph', o: {} },
    phy_g4_03: { core: 'interference', o: {} },
    phy_g4_04: { core: 'doppler', o: {} },
    phy_g5_05: { core: 'lenz', o: {} },

    /* ===== 化学（初中） ===== */
    che_j1_01: { core: 'combustion', o: { label: '化学变化有新物质生成；物理变化没有（如冰→水）' } },
    che_j1_02: { core: 'flow', o: { steps: ['观察性质', '选择用途', '验证效果'], label: '性质决定用途：氢气可燃→作燃料' } },
    che_j1_03: { core: 'flow', o: { steps: ['取药品', '加热', '读数', '清洗'], label: '实验操作规范：安全第一，细节决定成败' } },
    che_j1_04: { core: 'oxygenMeasure', o: { label: '红磷燃烧耗氧，进入水的体积 = 氧气体积（约 1/5）' } },
    che_j1_05: { core: 'makeOxygen', o: { label: '制氧：加热高锰酸钾，排水法收集' } },
    che_j1_06: { core: 'atom', o: { shells: [[28, 2], [52, 8], [76, 8]] } },
    che_j1_09: { core: 'reaction', o: { speed: 0.7, label: '质量守恒：反应前后原子种类、数目、质量都不变' } },
    che_j2_01: { core: 'crystal', o: { label: '碳的同素异形体：金刚石/石墨原子排列不同→性质不同' } },
    che_j2_02: { core: 'makeCO2', o: { label: '石灰石+盐酸制 CO₂，向上排空气法收集（密度比空气大）' } },
    che_j2_03: { core: 'coPoison', o: { label: 'CO 剧毒：抢占血红蛋白的氧结合位点，人体缺氧' } },
    che_j2_04: { core: 'combustion', o: {} },
    che_j2_05: { core: 'fuel', o: { label: '完全燃烧（蓝焰）放热多污染少；不完全燃烧产生黑烟' } },
    che_j3_01: { core: 'waterElec', o: {} },
    che_j3_04: { core: 'makeSolution', o: { label: '配制溶液：计算→称量→量取→溶解，误差源于操作细节' } },
    che_j4_01: { core: 'displacement', o: { label: '金属与酸反应放氢气（氢前金属）' } },
    che_j4_03: { core: 'rust', o: {} },
    che_j5_01: { core: 'acidHub', o: { label: '酸的通性：本质是 H⁺ 的性质' } },
    che_j5_02: { core: 'baseHub', o: { label: '碱的通性：本质是 OH⁻ 的性质' } },
    che_j5_05: { core: 'metathesis', o: { label: '复分解反应：互相交换成分，产物离开溶液体系才发生' } },
    che_j5_06: { core: 'fertilizer', o: { label: '氮促叶、磷促果、钾壮茎' } },

    /* ===== 化学（高中） ===== */
    che_g1_03: { core: 'ionEquation', o: { label: '离子方程式四步法：写拆删查' } },
    che_g1_05: { core: 'redoxBalance', o: { label: '氧化还原配平：升价总数 = 降价总数（电子守恒）' } },
    che_g2_02: { core: 'periodicTrend', o: {} },
    che_g3_01: { core: 'crystal', o: { label: '化学键决定晶体类型与性质' } },
    che_g3_02: { core: 'vsepr', o: {} },
    che_g3_03: { core: 'crystal', o: {} },
    che_g4_05: { core: 'ionize', o: { label: '盐类水解：弱离子与水作用，溶液显酸碱性' } },
    che_g4_06: { core: 'cell', o: {} },
    che_g4_07: { core: 'sacrifice', o: { label: '牺牲阳极保护：让更活泼的金属代替被保护金属挨腐蚀' } },
    che_g5_01: { core: 'flameTest', o: { label: '钠家族：性质活泼，焰色反应鉴别金属元素' } },
    che_g5_02: { core: 'thermite', o: { label: '铝热反应：铝还原金属氧化物，放出大量热（焊接钢轨）' } },
    che_g5_04: { core: 'chlorineNaOH', o: { label: 'Cl₂ + NaOH 制 84 消毒液，有效成分 NaClO' } },
    che_g5_05: { core: 'flow', o: { steps: ['SO₂漂白', '酸雨成因', '浓硫酸三性', 'SO₄²⁻检验'], label: '硫家族：转化关系复杂，注意钝化现象' } },
    che_g5_06: { core: 'nitrogenCycle', o: { label: '氮循环：NO 遇氧气瞬间变红棕色 NO₂' } },
    che_g6_01: { core: 'organicCompare', o: { label: '甲烷取代（换H）vs 乙烯加成（双键打开）' } },
    che_g6_02: { core: 'esterification', o: {} },
    che_g6_03: { core: 'saponify', o: { label: '皂化反应：油脂+碱→肥皂胶束（亲水头包住油污）' } },
    che_g6_04: { core: 'polymerize', o: {} },
    che_g6_05: { core: 'benzene', o: { label: '苯的真实结构是离域大π键，不是单双键交替' } },
    che_g7_02: { core: 'extraction', o: { label: '萃取分液：溶质从水层转移到有机层，下层先放出' } },
    che_g7_03: { core: 'distill', o: { label: '气体制备：加热蒸发→冷凝→收集，除杂先于干燥' } },
    che_g7_04: { core: 'evalRadar', o: { label: '实验方案评价：原理/操作/安全/环保四维度' } },
    che_g8_01: { core: 'tyndall', o: {} },
    che_g8_02: { core: 'ionize', o: { label: '离子共存：看是否生成沉淀/气体/弱电解质/发生氧化还原' } },
    che_g8_03: { core: 'flow', o: { steps: ['查状态(标况)', '查水解', '查特殊结构', '查可逆'], label: 'NA 题四查：标况物质状态是最大陷阱' } },
    che_g9_01: { core: 'kmno4', o: { label: '高锰酸钾自身作指示剂：半滴过量变粉红不褪 = 终点' } },
    che_g9_02: { core: 'buretRead', o: { label: '误差分析：一切归于对标准液体积的影响（读数视线是关键）' } }
  };

  // 兜底：按分支/关键词智能匹配（保证所有概念条目都有演示）
  function fallback(item) {
    const kw = (item.branch || '') + item.title;
    if (/声学|声音/.test(kw)) return { core: 'sound', o: {} };
    if (/光学/.test(kw)) return { core: 'ray', o: { mode: 'straight' } };
    if (/热/.test(kw)) return { core: 'state', o: {} };
    if (/力学/.test(kw)) return { core: 'force', o: {} };
    if (/电/.test(kw)) return { core: 'circuit', o: {} };
    if (/磁|电磁/.test(kw)) return { core: 'field', o: { mode: 'magnet' } };
    if (/波|振动/.test(kw)) return { core: 'wave', o: {} };
    if (/有机/.test(kw)) return { core: 'organicChain', o: {} };
    if (/结构/.test(kw)) return { core: 'vsepr', o: {} };
    if (/反应原理/.test(kw)) return { core: 'reaction', o: {} };
    if (/元素/.test(kw)) return { core: 'periodicTrend', o: {} };
    if (/实验|计算/.test(kw)) return { core: 'flow', o: { steps: ['审题', '建模', '计算', '检验'], label: item.title + '：规范化解题流程' } };
    if (/统计|概率/.test(kw)) return { core: 'reaction', o: { speed: 0.6, label: '统计与概率：大量重复试验中的规律性' } };
    if (/几何/.test(kw)) return { core: 'polyhedron', o: {} };
    if (/函数/.test(kw)) return { core: 'vtGraph', o: {} };
    return { core: 'flow', o: { steps: ['概念引入', '核心机制', '典型例题', '总结提升'], label: item.title } };
  }

  M.get = function (item) {
    return MAP[item.id] || fallback(item);
  };
  M.has = function (id) { return !!MAP[id]; };

  window.ConceptMap = M;
})();
