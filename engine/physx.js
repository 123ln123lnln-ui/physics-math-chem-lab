/* physx.js — 物理内核（纯函数 + 量纲校验）
 * 原则：所有公式集中于此；渲染层只呈现，不改数值。
 * 单位约定：SI 单位制。
 */
(function (global) {
  const SCI = global.SCI || (global.SCI = {});
  const C = SCI.CONST, DIM = SCI.DIM;
  const P = {};

  // ---------- 运动学 ----------
  // 竖直上抛/自由落体统一模型：y = v0*t + a*t^2/2（向上为正，自由落体 v0=0, a=-g）
  P.kinematicsY = function (v0, a, t) { return v0 * t + 0.5 * a * t * t; };
  P.kinematicsVy = function (v0, a, t) { return v0 + a * t; };

  // 自由落体：下落高度 h → 落地时间（量纲校验：长度 = 加速度·时间²）
  P.freeFallTime = function (h) {
    if (h < 0) throw new Error('高度不能为负');
    // 量纲自检：h 是 L，g 是 L/T²，t=sqrt(h/g) 得 T
    const t = Math.sqrt(2 * h / C.g);
    SCI.requireDim(DIM.div(DIM.length, DIM.div(DIM.length, DIM.pow(DIM.time, 2))), DIM.pow(DIM.time, 2), 't=√(h/g)');
    return t;
  };
  P.freeFallVelocity = function (h) { return Math.sqrt(2 * C.g * h); }; // v = √(2gh)
  P.verticalThrowMaxHeight = function (v0) { return v0 * v0 / (2 * C.g); }; // 上升最大高度

  // ---------- 抛体运动 ----------
  // 初速度 v0、发射角 thetaDeg（角度制）、无空气阻力
  P.projectile = function (v0, thetaDeg) {
    if (v0 < 0) throw new Error('初速度不能为负');
    const th = thetaDeg * Math.PI / 180;
    const vx = v0 * Math.cos(th), vy = v0 * Math.sin(th);
    const tFlight = 2 * vy / C.g;                 // 飞行时间（落回同高度）
    const range = vx * tFlight;                    // 水平射程 = v0² sin2θ / g
    const hMax = vy * vy / (2 * C.g);              // 最大高度
    return { vx: vx, vy: vy, tFlight: Math.max(0, tFlight), range: Math.max(0, range), hMax: hMax };
  };
  // 抛体轨迹点（用于绘图）
  P.projectilePoint = function (v0, thetaDeg, t) {
    const th = thetaDeg * Math.PI / 180;
    return {
      x: v0 * Math.cos(th) * t,
      y: v0 * Math.sin(th) * t - 0.5 * C.g * t * t
    };
  };

  // ---------- 简谐运动 ----------
  // x = A cos(ωt + φ)，ω = 2π/T
  P.shmOmega = function (T) { return 2 * Math.PI / T; };
  P.shmX = function (A, omega, t, phi) { return A * Math.cos(omega * t + (phi || 0)); };
  P.shmV = function (A, omega, t, phi) { return -A * omega * Math.sin(omega * t + (phi || 0)); };
  // 弹簧振子：T = 2π√(m/k)
  P.springPeriod = function (m, k) {
    if (m <= 0 || k <= 0) throw new Error('质量与劲度系数必须为正');
    return 2 * Math.PI * Math.sqrt(m / k);
  };

  // ---------- 力学 ----------
  P.gravitationalForce = function (m) { return m * C.g; }; // G = mg
  P.work = function (F, s, cosTheta) { return F * s * (cosTheta === undefined ? 1 : cosTheta); };
  P.kineticEnergy = function (m, v) { return 0.5 * m * v * v; };
  P.gravPotentialEnergy = function (m, h) { return m * C.g * h; };

  // ---------- 杠杆平衡 ----------
  // F1 * L1 = F2 * L2
  P.leverBalanceForce = function (F1, L1, L2) {
    if (L2 === 0) throw new Error('力臂不能为零');
    return F1 * L1 / L2;
  };

  // ---------- 光学 ----------
  // 薄透镜成像：1/u + 1/v = 1/f（凸透镜取正）
  // 返回像距 v；u <= f 时成虚像（v 为负，表示像与物同侧）
  P.lensImageDistance = function (u, f) {
    if (u <= 0 || f <= 0) throw new Error('物距与焦距必须为正（凸透镜）');
    if (Math.abs(u - f) < 1e-12) return null; // u=f 不成像
    return u * f / (u - f);
  };
  P.lensMagnification = function (u, f) {
    const v = P.lensImageDistance(u, f);
    if (v === null) return null;
    return Math.abs(v / u); // |m| = |v/u|
  };

  // ---------- 电学 ----------
  P.ohmCurrent = function (U, R) { if (R <= 0) throw new Error('电阻必须为正'); return U / R; };
  P.seriesResistance = function (rs) { return rs.reduce((a, b) => a + b, 0); };
  P.parallelResistance = function (rs) { return 1 / rs.reduce((a, b) => a + 1 / b, 0); };

  // ---------- 浮力 ----------
  P.buoyancy = function (rho, V) { return rho * C.g * V; }; // F浮 = ρ液 g V排

  SCI.physx = P;
  if (typeof module !== 'undefined' && module.exports) module.exports = SCI;
})(typeof window !== 'undefined' ? window : globalThis);
