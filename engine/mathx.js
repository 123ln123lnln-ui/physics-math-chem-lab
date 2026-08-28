/* mathx.js — 数学内核（纯函数，全部可单元测试）
 * 渲染层只调用这里，不得自行推导公式。
 */
(function (global) {
  const SCI = global.SCI || (global.SCI = {});
  const M = {};

  // ---------- 二次函数 y = ax^2 + bx + c ----------
  M.quadraticVertex = function (a, b, c) {
    if (a === 0) throw new Error('a=0 时不是二次函数');
    const x = -b / (2 * a);
    return { x: x, y: (4 * a * c - b * b) / (4 * a) };
  };
  M.quadraticDiscriminant = function (a, b, c) { return b * b - 4 * a * c; };
  M.quadraticRoots = function (a, b, c) {
    if (a === 0) { // 退化为一次方程
      if (b === 0) return c === 0 ? { type: 'all' } : { type: 'none' };
      return { type: 'one', roots: [-c / b] };
    }
    const d = M.quadraticDiscriminant(a, b, c);
    if (d < 0) return { type: 'none', d: d };
    if (d === 0) return { type: 'one', roots: [-b / (2 * a)], d: 0 };
    const s = Math.sqrt(d);
    return { type: 'two', roots: [(-b - s) / (2 * a), (-b + s) / (2 * a)], d: d };
  };
  M.quadraticAxis = function (a, b) { if (a === 0) throw new Error('a=0'); return -b / (2 * a); };

  // ---------- 一次函数 y = kx + b ----------
  M.linearInfo = function (k, b) {
    return {
      slope: k, yIntercept: b,
      xIntercept: k === 0 ? null : -b / k,
      angleDeg: Math.atan(k) * 180 / Math.PI  // 倾斜角（k=0 时为 0°）
    };
  };

  // ---------- 三角函数（角度制输入） ----------
  M.trigFromDeg = function (deg) {
    const r = deg * Math.PI / 180;
    const sin = Math.sin(r), cos = Math.cos(r);
    return { sin: sin, cos: cos, tan: Math.abs(cos) < 1e-12 ? null : sin / cos, rad: r };
  };

  // ---------- 多项式与导数 ----------
  // 系数按升幂排列: [a0, a1, a2, ...] 表示 a0 + a1*x + a2*x^2 + ...
  M.polyEval = function (coef, x) {
    let r = 0;
    for (let i = coef.length - 1; i >= 0; i--) r = r * x + coef[i];
    return r;
  };
  M.polyDerivCoef = function (coef) {
    return coef.slice(1).map((v, i) => v * (i + 1));
  };
  M.polyDerivAt = function (coef, x) { return M.polyEval(M.polyDerivCoef(coef), x); };

  // ---------- 勾股定理 ----------
  M.pythagorasHypotenuse = function (a, b) {
    if (a <= 0 || b <= 0) throw new Error('直角边必须为正');
    return Math.sqrt(a * a + b * b);
  };

  // ---------- 椭圆 ----------
  // 标准方程 x^2/a^2 + y^2/b^2 = 1 (a>b>0, 焦点在 x 轴)
  M.ellipseInfo = function (a, b) {
    if (!(a > b && b > 0)) throw new Error('需满足 a > b > 0（焦点在 x 轴）');
    const c = Math.sqrt(a * a - b * b);
    return { a: a, b: b, c: c, e: c / a, foci: [[-c, 0], [c, 0]] };
  };
  M.ellipsePoint = function (a, b, theta) { return [a * Math.cos(theta), b * Math.sin(theta)]; };

  // ---------- 圆的面积/周长（小学初中通用） ----------
  M.circle = function (r) {
    if (r <= 0) throw new Error('半径必须为正');
    return { area: Math.PI * r * r, circumference: 2 * Math.PI * r };
  };

  SCI.mathx = M;
  if (typeof module !== 'undefined' && module.exports) module.exports = SCI;
})(typeof window !== 'undefined' ? window : globalThis);
