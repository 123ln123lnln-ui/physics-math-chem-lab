/* dependencies.js — 知识点前置依赖图（星图 2.0 数据层）
 * 每个 id → 需要先点亮的知识点 id 数组。未列出的条目 = 无前置（根节点）。
 * 约定：
 *  - 依赖沿课标学习顺序标注（数与式→方程→函数；声光热力电→高中深化）
 *  - 跨学科依赖只标"硬依赖"（没有它真的学不懂），软关联走探索篇挂接
 *  - 校验：node tests/check-deps.js（查重、查悬空、查环）
 */
(function () {
  const DEPS = {
    /* ============ 数学 · 初中 ============ */
    // 数与式
    math_j1_02: ['math_j1_01'],
    math_j1_03: ['math_j1_01'],
    math_j1_04: ['math_j1_02'],
    math_j2_01: ['math_j1_02'],
    math_j2_02: ['math_j2_01'],
    math_j2_03: ['math_j2_02'],
    math_j2_04: ['math_j2_03'],
    math_j3_01: ['math_j1_02'],
    math_j3_02: ['math_j1_01'],
    math_m01: ['math_j1_01'],
    math_m02: ['math_j1_02'],
    // 方程与不等式
    math_j4_01: ['math_j2_01'],
    math_j4_02: ['math_j4_01'],
    math_j5_01: ['math_j2_03', 'math_j4_01'],
    math_j5_02: ['math_j5_01'],
    math_j5_03: ['math_j2_04', 'math_j4_01'],
    math_j6_01: ['math_j4_01'],
    math_j6_02: ['math_j6_01'],
    // 函数
    math_j7_01: ['math_j1_01'],
    math_j7_02: ['math_j7_01'],
    math_j7_03: ['math_j7_02'],
    math_j7_04: ['math_j7_03'],
    math_j8_01: ['math_j2_02', 'math_j7_02'],
    // 图形与几何
    math_j9_02: ['math_j9_01'],
    math_j9_03: ['math_j9_02'],
    math_m03: ['math_j9_01'],
    math_j9_04: ['math_j9_02'],
    math_j10_01: ['math_j9_04'],
    math_m04: ['math_j9_02'],
    math_j11_01: ['math_j9_04'],
    math_j11_02: ['math_j9_01'],
    math_j11_03: ['math_j11_02'],
    math_j12_01: ['math_j9_01'],
    math_j12_02: ['math_j10_01'],
    math_m05: ['math_j12_02'],
    math_j13_01: ['math_j9_01'],
    // 统计与概率
    math_j14_02: ['math_j14_01'],
    math_j14_03: ['math_j14_02'],
    math_j15_01: ['math_j14_01'],
    math_j15_02: ['math_j14_01'],

    /* ============ 数学 · 高中 ============ */
    // 集合与逻辑
    math_g1_01: ['math_j1_01'],
    math_g1_02: ['math_g1_01'],
    math_g1_03: ['math_g1_02'],
    // 函数
    math_g2_01: ['math_j7_02'],
    math_g2_02: ['math_g2_01'],
    math_g2_03: ['math_g2_02'],
    math_m06: ['math_g2_03'],
    math_g2_04: ['math_g2_01'],
    math_g2_05: ['math_g2_04'],
    math_g2_06: ['math_g2_04'],
    // 数列
    math_g3_01: ['math_j4_01'],
    math_g3_02: ['math_g3_01'],
    math_g3_03: ['math_g3_02'],
    // 三角与向量
    math_g4_01: ['math_j12_02'],
    math_g4_02: ['math_g4_01'],
    math_m07: ['math_g4_01'],
    math_g4_03: ['math_g4_02'],
    math_m08: ['math_g4_02'],
    math_g4_04: ['math_g4_02'],
    // 解析几何
    math_g5_01: ['math_j7_03'],
    math_g5_02: ['math_g5_01'],
    math_g5_03: ['math_g5_02'],
    math_g5_04: ['math_g5_02'],
    math_g5_05: ['math_g5_01'],
    math_m11: ['math_g5_01'],
    // 立体几何
    math_g6_01: ['math_j11_02'],
    math_m09: ['math_g6_01'],
    math_g6_02: ['math_g4_04'],
    math_m10: ['math_m09'],
    // 概率与统计
    math_g7_01: ['math_j14_03'],
    math_g7_02: ['math_j14_02', 'math_g7_01'],
    math_m12: ['math_j14_02'],
    math_g7_03: ['math_j14_02'],
    math_g7_04: ['math_g7_02'],
    math_g7_05: ['math_g7_04'],
    // 复数
    math_g8_01: ['math_j3_01'],
    math_m13: ['math_g8_01', 'math_g4_04'],

    /* ============ 物理 · 初中 ============ */
    // 声学
    phy_j1_02: ['phy_j1_01'],
    phy_j1_03: ['phy_j1_01'],
    phy_j1_04: ['phy_j1_01'],
    phy_m01: ['phy_j1_01'],
    // 光学
    phy_j2_02: ['phy_j2_01'],
    phy_j2_03: ['phy_j2_02'],
    phy_m02: ['phy_j2_02'],
    phy_m03: ['phy_j2_02'],
    phy_j2_04: ['phy_j2_01'],
    phy_m04: ['phy_j2_04'],
    phy_j2_05: ['phy_j2_04'],
    // 热学
    phy_j3_02: ['phy_j3_01'],
    phy_j3_03: ['phy_j3_02'],
    phy_j3_04: ['phy_j3_02'],
    phy_j3_05: ['phy_j3_04'],
    // 力学
    phy_j4_03: ['phy_j4_02'],
    phy_j4_04: ['phy_j4_03'],
    phy_j4_05: ['phy_j4_01'],
    phy_j4_06: ['phy_j4_05'],
    phy_j4_07: ['phy_j4_01'],
    phy_j4_08: ['phy_j4_07'],
    phy_j4_09: ['phy_j4_07'],
    phy_m05: ['phy_j4_08'],
    phy_m06: ['phy_j4_09'],
    phy_j4_10: ['phy_j4_08'],
    phy_j4_11: ['phy_j4_05'],
    phy_j4_12: ['phy_j4_11'],
    phy_j4_13: ['phy_j4_11'],
    phy_m07: ['phy_j4_13'],
    // 电学
    phy_j5_02: ['phy_j5_01'],
    phy_j5_03: ['phy_j5_02'],
    phy_j5_04: ['phy_j5_03'],
    phy_j5_05: ['phy_j5_04'],
    phy_j5_06: ['phy_j5_05'],
    phy_j5_07: ['phy_j5_04'],
    // 电磁学
    phy_j6_02: ['phy_j6_01'],
    phy_j6_03: ['phy_j6_02'],
    phy_m08: ['phy_j6_02'],
    phy_j6_04: ['phy_j6_01'],

    /* ============ 物理 · 高中 ============ */
    // 运动学（依赖初中速度 + 数学函数图像）
    phy_g1_01: ['phy_j4_02', 'math_j7_03'],
    phy_g1_02: ['phy_g1_01'],
    phy_g1_07: ['phy_g1_01'],
    // 牛顿定律
    phy_g1_03: ['phy_g1_01', 'phy_j4_03'],
    phy_g1_04: ['phy_g1_03'],
    phy_g1_05: ['phy_j4_05'],
    phy_g1_06: ['phy_g1_05'],
    phy_m09: ['phy_g1_05'],
    phy_m10: ['phy_g1_03'],
    // 曲线运动
    phy_g2_01: ['phy_g1_01'],
    phy_g2_02: ['phy_g2_01'],
    phy_g2_03: ['phy_g2_02'],
    // 能量与动量
    phy_g3_01: ['phy_j4_12'],
    phy_g3_02: ['phy_g1_03'],
    phy_m11: ['phy_g3_01'],
    // 振动与波
    phy_g4_01: ['phy_g3_01'],
    phy_g4_02: ['phy_j1_01'],
    phy_g4_03: ['phy_g4_02'],
    phy_g4_04: ['phy_g4_02'],
    // 电磁学
    phy_g5_01: ['phy_j5_01'],
    phy_g5_02: ['phy_g5_01'],
    phy_m12: ['phy_g5_02'],
    phy_g5_03: ['phy_j5_02'],
    phy_g5_04: ['phy_j6_01'],
    phy_g5_05: ['phy_g5_04'],
    phy_g5_06: ['phy_g5_05'],
    phy_m13: ['phy_g5_06'],
    // 光学（高中）
    phy_g6_01: ['phy_j2_04'],
    phy_g6_02: ['phy_g4_02'],
    // 近代物理
    phy_g7_01: ['phy_j5_01'],
    phy_m14: ['phy_g7_01'],
    phy_g7_02: ['phy_g7_01'],
    phy_g7_03: ['phy_g7_02'],
    // 热学（高中）
    phy_g8_01: ['phy_j3_01'],
    phy_g8_02: ['phy_g8_01'],
    phy_g8_03: ['phy_j3_05', 'phy_g8_01'],

    /* ============ 化学 · 初中 ============ */
    // 物质构成与变化
    che_j1_02: ['che_j1_01'],
    che_j1_03: ['che_j1_01'],
    che_j1_04: ['che_j1_01'],
    che_j1_05: ['che_j1_01'],
    che_j1_06: ['che_j1_01'],
    che_j6_01: ['che_j1_06'],
    che_j1_07: ['che_j6_01'],
    che_j1_08: ['che_j6_01'],
    che_j6_02: ['che_j1_07'],
    che_j1_09: ['che_j1_01'],
    che_m01: ['che_j1_05'],
    // 碳与燃烧
    che_j2_01: ['che_j1_06'],
    che_m03: ['che_j2_01'],
    che_j2_02: ['che_j1_05'],
    che_j2_03: ['che_j2_02'],
    che_j2_04: ['che_j1_05'],
    che_m04: ['che_j2_04'],
    che_j2_05: ['che_j2_04'],
    // 水与溶液
    che_j3_01: ['che_j1_06'],
    che_m02: ['che_j3_01'],
    che_j3_02: ['che_j3_01'],
    che_j3_03: ['che_j3_02'],
    che_j3_04: ['che_j3_03'],
    // 金属
    che_j4_01: ['che_j1_07'],
    che_j4_02: ['che_j4_01'],
    che_j4_03: ['che_j4_02'],
    // 酸碱盐
    che_j5_01: ['che_j6_02'],
    che_j5_02: ['che_j5_01'],
    che_j5_03: ['che_j5_02'],
    che_j5_04: ['che_j5_03'],
    che_j5_05: ['che_j5_04'],
    che_j5_06: ['che_j5_05'],
    che_m05: ['che_j5_06'],
    che_j6_03: ['che_j6_02'],

    /* ============ 化学 · 高中 ============ */
    // 基本概念
    che_g1_01: ['che_j1_08', 'math_j1_04'],
    che_g1_02: ['che_g1_01'],
    che_m06: ['che_g1_01'],
    che_m07: ['che_g1_02'],
    che_g1_03: ['che_j6_01'],
    che_g1_04: ['che_j1_07'],
    che_g1_05: ['che_g1_04'],
    che_g8_01: ['che_j3_02'],
    che_g8_02: ['che_g1_03'],
    che_g8_03: ['che_g1_01'],
    // 元素周期律
    che_g2_01: ['che_j6_01'],
    che_g2_02: ['che_g2_01'],
    // 结构
    che_g3_01: ['che_g2_01'],
    che_g3_02: ['che_g3_01'],
    che_g3_03: ['che_g3_01'],
    che_m13: ['che_g3_03'],
    // 反应原理
    che_g4_01: ['che_j1_09'],
    che_m08: ['che_g4_01'],
    che_g4_02: ['che_m01', 'che_g1_01'],
    che_g4_03: ['che_g4_02'],
    che_m09: ['che_g4_03'],
    che_g8_04: ['che_g4_03'],
    che_g4_04: ['che_g4_03'],
    che_m10: ['che_g4_04'],
    che_g4_05: ['che_g4_04'],
    che_g4_06: ['che_g1_04'],
    che_g4_07: ['che_g4_06'],
    che_m11: ['che_g4_06'],
    // 元素化合物
    che_g5_01: ['che_g1_04'],
    che_g5_02: ['che_j4_01'],
    che_g5_03: ['che_j4_02'],
    che_g5_04: ['che_g1_03'],
    che_g5_05: ['che_g5_04'],
    che_g5_06: ['che_g5_05'],
    // 有机化学
    che_g6_01: ['che_g3_01'],
    che_g6_02: ['che_g6_01'],
    che_g6_03: ['che_g6_02'],
    che_g6_04: ['che_g6_03'],
    che_g6_05: ['che_g6_01'],
    che_m12: ['che_g6_01'],
    // 实验与计算
    che_g7_01: ['che_g1_02'],
    che_g7_02: ['che_j3_03'],
    che_g7_03: ['che_j1_05'],
    che_g7_04: ['che_g7_03'],
    che_g9_01: ['che_j5_04'],
    che_g9_02: ['che_g7_01']
  };

  window.Deps = DEPS;
  /* 反向索引：id → 被哪些节点依赖（星图"解锁了它"提示用） */
  const unlocks = {};
  Object.keys(DEPS).forEach(id => DEPS[id].forEach(p => {
    (unlocks[p] = unlocks[p] || []).push(id);
  }));
  window.DepsUnlocks = unlocks;
})();
