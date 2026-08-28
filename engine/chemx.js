/* chemx.js — 化学内核（纯函数）
 * 方程式配平校验（原子守恒）、滴定曲线、相对分子质量。
 * 结构类可视化交给 3Dmol/three.js，本文件只管数值与守恒。
 */
(function (global) {
  const SCI = global.SCI || (global.SCI = {});
  const CH = {};

  // ---------- 相对分子质量 ----------
  // formula: 形如 {H:2, O:1}；用 SCI.ATOMIC_MASS 计算
  CH.molarMass = function (formula) {
    let m = 0;
    for (const el in formula) {
      const w = SCI.ATOMIC_MASS[el];
      if (w === undefined) throw new Error('未知元素: ' + el);
      m += w * formula[el];
    }
    return m;
  };

  // ---------- 化学方程式配平校验 ----------
  // equation: { reactants: [{formula:{...}, coef:n}], products: [...] }
  // 返回 { balanced, atomBalance: {元素: {左, 右}} }
  CH.checkBalance = function (reactants, products) {
    const left = {}, right = {};
    reactants.forEach(r => {
      for (const el in r.formula) left[el] = (left[el] || 0) + r.formula[el] * r.coef;
    });
    products.forEach(p => {
      for (const el in p.formula) right[el] = (right[el] || 0) + p.formula[el] * p.coef;
    });
    const elements = new Set([...Object.keys(left), ...Object.keys(right)]);
    const atomBalance = {}, diff = [];
    elements.forEach(el => {
      const l = left[el] || 0, r = right[el] || 0;
      atomBalance[el] = { left: l, right: r };
      if (l !== r) diff.push(el);
    });
    return { balanced: diff.length === 0, unbalancedElements: diff, atomBalance: atomBalance };
  };

  // ---------- 强酸强碱滴定 ----------
  // 用强碱 (Cb mol/L) 滴定强酸 Va mL (Ca mol/L)，加入体积 Vb mL
  // 返回溶液 pH（25°C，Kw=1e-14）
  CH.strongAcidBaseTitration = function (Ca, Va, Cb, Vb) {
    if (Ca < 0 || Va < 0 || Cb < 0 || Vb < 0) throw new Error('浓度与体积不能为负');
    const nAcid = Ca * Va / 1000, nBase = Cb * Vb / 1000; // mol
    const V = (Va + Vb) / 1000; // L
    if (V <= 0) throw new Error('总体积必须为正');
    const Kw = SCI.CONST.Kw;
    let hPlus;
    if (nAcid > nBase) {
      hPlus = (nAcid - nBase) / V;
      return -Math.log10(hPlus);
    } else if (nBase > nAcid) {
      const ohMinus = (nBase - nAcid) / V;
      hPlus = Kw / ohMinus;
      return -Math.log10(hPlus);
    } else {
      return 7; // 等当点，25°C 强酸强碱滴定
    }
  };

  // ---------- 溶解度/质量分数 ----------
  CH.massFraction = function (solute, solution) {
    if (solution <= 0) throw new Error('溶液质量必须为正');
    if (solute < 0 || solute > solution) throw new Error('溶质质量无效');
    return solute / solution;
  };

  // ---------- 金属活动性顺序（常用段，用于置换反应判断） ----------
  // 越靠前越活泼；H 之前可与稀酸反应放出 H2
  CH.activitySeries = ['K', 'Ca', 'Na', 'Mg', 'Al', 'Zn', 'Fe', 'Sn', 'Pb', 'H', 'Cu', 'Hg', 'Ag', 'Pt', 'Au'];
  CH.moreActive = function (a, b) {
    const ia = CH.activitySeries.indexOf(a), ib = CH.activitySeries.indexOf(b);
    if (ia === -1 || ib === -1) throw new Error('元素不在活动性顺序表中: ' + (ia === -1 ? a : b));
    return ia < ib;
  };

  SCI.chemx = CH;
  if (typeof module !== 'undefined' && module.exports) module.exports = SCI;
})(typeof window !== 'undefined' ? window : globalThis);
