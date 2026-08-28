/* concept-map.js — 概念知识点 → 演示动画模板映射（全覆盖 + 兜底） */
(function () {
  const M = {};

  // 显式映射（知识点 id → 演示模板）
  const MAP = {
    /* ===== 数学 ===== */
    math_j2_03: { core: 'similar', o: { label: '因式分解与整式乘法互逆：乘积↔和差的转换' } },
    math_j3_02: { core: 'polyhedron', o: { label: '实数与数轴上的点一一对应' } },
    math_j7_02: { core: 'vtGraph', o: { label: '函数：每个 x 对应唯一 y —— 图像上的竖直检验' } },
    math_j9_04: { core: 'congruent', o: {} },
    math_j11_03: { core: 'similar', o: { label: '圆周角 = 圆心角的一半（同弧所对）' } },
    math_j13_01: { core: 'polyhedron', o: {} },
    math_j14_03: { core: 'reaction', o: { speed: 0.6, label: '列举法：把所有等可能结果一个不漏地列出来' } },
    math_j15_02: { core: 'flow', o: { steps: ['确定总体', '随机抽样', '收集数据', '估计总体'], label: '抽样调查：用样本估计总体' } },
    math_g1_02: { core: 'similar', o: { label: '充分必要条件：看命题对应集合的包含方向' } },
    math_g1_03: { core: 'flow', o: { steps: ['找量词', '否定结论', '换量词∀↔∃', '整理'], label: '命题的否定：全称变存在，结论取否' } },
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
    che_j1_04: { core: 'flow', o: { steps: ['点燃红磷', '消耗O₂', '冷却', '水进1/5'], label: '红磷燃烧耗氧，进入水的体积 = 氧气体积' } },
    che_j1_05: { core: 'flow', o: { steps: ['装药品', '加热/滴加', '收集气体', '验满'], label: '制氧：高锰酸钾加热 或 过氧化氢+MnO₂催化' } },
    che_j1_06: { core: 'atom', o: { shells: [[28, 2], [52, 8], [76, 8]] } },
    che_j1_09: { core: 'reaction', o: { speed: 0.7, label: '质量守恒：反应前后原子种类、数目、质量都不变' } },
    che_j2_01: { core: 'crystal', o: { label: '碳的同素异形体：金刚石/石墨原子排列不同→性质不同' } },
    che_j2_02: { core: 'flow', o: { steps: ['石灰石+盐酸', '向上排空气', '石灰水检验', '燃着木条验满'], label: 'CO₂ 制取与检验全流程' } },
    che_j2_03: { core: 'flow', o: { steps: ['无色无味', '与血红蛋白结合', '人体缺氧', '通风预防'], label: 'CO 剧毒：抢占血红蛋白的氧结合位点' } },
    che_j2_04: { core: 'combustion', o: {} },
    che_j2_05: { core: 'flow', o: { steps: ['化石燃料', '完全燃烧', '尾气处理', '新能源'], label: '能源利用：充分燃烧放热多、污染少' } },
    che_j3_01: { core: 'waterElec', o: {} },
    che_j3_04: { core: 'flow', o: { steps: ['计算', '称量', '量取', '溶解'], label: '配制溶液四步骤，误差源于操作细节' } },
    che_j4_01: { core: 'displacement', o: { label: '金属与酸反应放氢气（氢前金属）' } },
    che_j4_03: { core: 'rust', o: {} },
    che_j5_01: { core: 'flow', o: { steps: ['石蕊变红', '与金属反应', '与氧化物反应', '中和碱'], label: '酸的通性：本质是 H⁺ 的性质' } },
    che_j5_02: { core: 'flow', o: { steps: ['石蕊变蓝', '与CO₂反应', '中和酸', '密封保存'], label: '碱的通性：本质是 OH⁻ 的性质' } },
    che_j5_05: { core: 'flow', o: { steps: ['生成沉淀', '生成气体', '生成水'], label: '复分解反应条件：产物离开溶液体系（三者至少其一）' } },
    che_j5_06: { core: 'flow', o: { steps: ['氮肥→叶', '磷肥→果', '钾肥→茎', '复合肥'], label: '化肥与常见盐的用途' } },

    /* ===== 化学（高中） ===== */
    che_g1_03: { core: 'flow', o: { steps: ['写方程', '拆强电解质', '删旁观离子', '查守恒'], label: '离子方程式四步法：写拆删查' } },
    che_g1_05: { core: 'flow', o: { steps: ['标价态', '找变化', '定系数', '配其余'], label: '氧化还原配平：电子守恒（升价=降价总数）' } },
    che_g2_02: { core: 'periodicTrend', o: {} },
    che_g3_01: { core: 'crystal', o: { label: '化学键决定晶体类型与性质' } },
    che_g3_02: { core: 'vsepr', o: {} },
    che_g3_03: { core: 'crystal', o: {} },
    che_g4_05: { core: 'flow', o: { steps: ['盐电离', '弱离子水解', '溶液显酸碱性'], label: '盐类水解：有弱才水解，谁强显谁性' } },
    che_g4_06: { core: 'cell', o: {} },
    che_g4_07: { core: 'rust', o: { label: '金属腐蚀：让被保护金属作阴极（牺牲阳极/外加电流）' } },
    che_g5_01: { core: 'flow', o: { steps: ['Na与水', 'Na₂O₂供氧', 'Na₂CO₃/NaHCO₃', '焰色反应'], label: '钠家族：性质活泼，化合物转化丰富' } },
    che_g5_02: { core: 'flow', o: { steps: ['Al与酸碱', 'Al₂O₃两性', 'Al(OH)₃两性', '铝热反应'], label: '铝的两性：既能与酸又能与强碱反应' } },
    che_g5_04: { core: 'flow', o: { steps: ['Cl₂+H₂O', '生成HClO', '漂白杀菌', '制84消毒液'], label: '氯水漂白性来自 HClO 的强氧化性' } },
    che_g5_05: { core: 'flow', o: { steps: ['SO₂漂白', '酸雨成因', '浓硫酸三性', 'SO₄²⁻检验'], label: '硫家族：转化关系复杂，注意钝化现象' } },
    che_g5_06: { core: 'flow', o: { steps: ['N₂稳定', 'NO→NO₂', 'HNO₃强氧化', '铵盐检验'], label: '氮循环：NO 遇氧气变红棕色 NO₂' } },
    che_g6_01: { core: 'flow', o: { steps: ['甲烷取代', '乙烯加成', '苯的取代', '同系物'], label: '烃的代表反应：取代 vs 加成' } },
    che_g6_02: { core: 'esterification', o: {} },
    che_g6_03: { core: 'organicChain', o: {} },
    che_g6_04: { core: 'polymerize', o: {} },
    che_g6_05: { core: 'flow', o: { steps: ['六边形结构', '特殊键', '易取代', '难加成'], label: '苯的特殊键：不易加成、不易氧化（区别于烯烃）' } },
    che_g7_02: { core: 'flow', o: { steps: ['过滤', '蒸发结晶', '蒸馏', '萃取分液'], label: '分离提纯方法按混合物性质选择' } },
    che_g7_03: { core: 'flow', o: { steps: ['发生装置', '净化干燥', '收集', '尾气处理'], label: '气体制备四环节，除杂先于干燥' } },
    che_g7_04: { core: 'flow', o: { steps: ['原理正确', '操作可行', '安全环保', '误差分析'], label: '实验方案评价四维度' } },
    che_g8_01: { core: 'tyndall', o: {} },
    che_g8_02: { core: 'flow', o: { steps: ['查沉淀', '查气体', '查弱电解质', '查氧化还原'], label: '离子共存四查：沉淀/气体/弱电解质/氧化还原' } },
    che_g8_03: { core: 'flow', o: { steps: ['查状态(标况)', '查水解', '查特殊结构', '查可逆'], label: 'NA 题四查：标况物质状态是最大陷阱' } },
    che_g9_01: { core: 'flow', o: { steps: ['KMnO₄自身指示', '终点判断', '电子守恒计算'], label: '氧化还原滴定：高锰酸钾自身作指示剂' } },
    che_g9_02: { core: 'flow', o: { steps: ['滴定管润洗', '读数视线', '终点判断', '归因于V'], label: '误差分析：一切归于对标准液体积的影响' } }
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
