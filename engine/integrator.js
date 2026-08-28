/* integrator.js — 通用数值积分器（用于物理动力学动画与交叉验证）
 * 提供四阶龙格-库塔（RK4）与半隐式欧拉法。
 * 约定：状态 y 为数组，导数函数 f(t, y) 返回与 y 等长的数组。
 */
(function (global) {
  const SCI = global.SCI || (global.SCI = {});

  function addScaled(y, k, s) { return y.map((v, i) => v + k[i] * s); }

  // 单步 RK4
  SCI.rk4Step = function (f, t, y, dt) {
    const k1 = f(t, y);
    const k2 = f(t + dt / 2, addScaled(y, k1, dt / 2));
    const k3 = f(t + dt / 2, addScaled(y, k2, dt / 2));
    const k4 = f(t + dt, addScaled(y, k3, dt));
    return y.map((v, i) => v + dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
  };

  // 积分区间 [t0, t1]，返回 { t, y } 轨迹数组（含端点）
  SCI.integrate = function (f, t0, y0, t1, dt, onStep) {
    if (dt <= 0) throw new Error('积分步长必须为正');
    if (t1 < t0) throw new Error('积分终点早于起点');
    let t = t0, y = y0.slice();
    const out = [{ t: t, y: y.slice() }];
    while (t < t1 - 1e-12) {
      const h = Math.min(dt, t1 - t);
      y = SCI.rk4Step(f, t, y, h);
      t += h;
      out.push({ t: t, y: y.slice() });
      if (onStep) onStep(t, y);
    }
    return out;
  };

  // 半隐式欧拉（刚体/碰撞类动画用，稳定且便宜）
  // f(t, y) 返回加速度数组（前半是位置，后半是速度约定由调用方管理）
  SCI.semiImplicitEuler = function (y, v, a, dt) {
    const vNew = v.map((vi, i) => vi + a[i] * dt);
    const yNew = y.map((yi, i) => yi + vNew[i] * dt);
    return { y: yNew, v: vNew };
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SCI;
})(typeof window !== 'undefined' ? window : globalThis);
