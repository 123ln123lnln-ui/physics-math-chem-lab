/* tests.js — 黄金测试用例（Golden Tests）
 * 每个交互件背后的公式，都必须先通过这里的一组"已知正确答案"断言。
 * 浏览器与 Node 双环境可运行。
 */
(function (global) {
  const SCI = global.SCI;
  const M = SCI.mathx, P = SCI.physx, CH = SCI.chemx, DIM = SCI.DIM;
  const EPS = 1e-9, LOOSE = 1e-6;

  function approx(actual, expected, tol, msg) {
    if (Math.abs(actual - expected) > (tol || LOOSE)) {
      throw new Error((msg || '断言失败') + ': 期望 ' + expected + '，实际 ' + actual);
    }
    return true;
  }
  function strict(actual, expected, msg) {
    if (actual !== expected) throw new Error((msg || '断言失败') + ': 期望 ' + expected + '，实际 ' + actual);
    return true;
  }
  function throws(fn, msg) {
    try { fn(); } catch (e) { return true; }
    throw new Error((msg || '应抛出错误但没有'));
  }

  const tests = [];
  function test(name, fn) { tests.push({ name: name, fn: fn }); }

  /* ============ 物理 ============ */
  test('自由落体: h=4.9m → t=1.000s (g=9.8)', function () {
    approx(P.freeFallTime(4.9), 1.0, 1e-9);
  });
  test('自由落体: h=19.6m → t=2.000s', function () {
    approx(P.freeFallTime(19.6), 2.0, 1e-9);
  });
  test('自由落体: 落地速度 v=√(2gh), h=4.9 → 9.8 m/s', function () {
    approx(P.freeFallVelocity(4.9), 9.8, 1e-9);
  });
  test('竖直上抛: v0=19.6 → 最大高度 19.6m', function () {
    approx(P.verticalThrowMaxHeight(19.6), 19.6, 1e-9);
  });
  test('抛体: v0=10, θ=45° → 射程=100/9.8, 最大高度=25/9.8', function () {
    const r = P.projectile(10, 45);
    approx(r.range, 100 / 9.8, 1e-9, '射程');
    approx(r.hMax, 25 / 9.8, 1e-9, '最大高度');
    approx(r.tFlight, 2 * (10 * Math.SQRT1_2) / 9.8, 1e-9, '飞行时间');
  });
  test('抛体: θ=0° → 射程 0, 高度 0', function () {
    const r = P.projectile(10, 0);
    approx(r.range, 0); approx(r.hMax, 0);
  });
  test('弹簧振子周期: m=1kg,k=4π² → T=1.000s', function () {
    approx(P.springPeriod(1, 4 * Math.PI * Math.PI), 1.0, 1e-9);
  });
  test('杠杆平衡: F1=10N,L1=0.2m,L2=0.1m → F2=20N', function () {
    approx(P.leverBalanceForce(10, 0.2, 0.1), 20, 1e-9);
  });
  test('凸透镜: u=30,f=10 → v=15, 缩小倒立实像', function () {
    approx(P.lensImageDistance(30, 10), 15, 1e-9);
    approx(P.lensMagnification(30, 10), 0.5, 1e-9);
  });
  test('凸透镜: u=15,f=10 → v=30, 放大倒立实像', function () {
    approx(P.lensImageDistance(15, 10), 30, 1e-9);
  });
  test('凸透镜: u=5,f=10 → v=-10, 放大正立虚像', function () {
    approx(P.lensImageDistance(5, 10), -10, 1e-9);
    approx(P.lensMagnification(5, 10), 2, 1e-9);
  });
  test('凸透镜: u=f 不成像', function () {
    strict(P.lensImageDistance(10, 10), null);
  });
  test('欧姆定律: U=6V,R=3Ω → I=2A', function () {
    approx(P.ohmCurrent(6, 3), 2, 1e-9);
  });
  test('并联电阻: 6Ω∥3Ω → 2Ω', function () {
    approx(P.parallelResistance([6, 3]), 2, 1e-9);
  });
  test('浮力: ρ=1000, V=0.001m³ → F=9.8N', function () {
    approx(P.buoyancy(1000, 0.001), 9.8, 1e-9);
  });
  test('动能: m=2,v=3 → 9J', function () {
    approx(P.kineticEnergy(2, 3), 9, 1e-9);
  });
  test('RK4 积分器: 自由落体 4.9m → t≈1s (误差<5e-5)', function () {
    // y'' = -g, 状态 [y, v], y(0)=4.9, v(0)=0
    const g = SCI.CONST.g;
    const f = function (t, y) { return [y[1], -g]; };
    let t = 0, y = [4.9, 0], dt = 0.001;
    while (y[0] > 0 && t < 5) { y = SCI.rk4Step(f, t, y, dt); t += dt; }
    approx(t, 1.0, 5e-5, '落地时间');
  });

  /* ============ 量纲系统 ============ */
  test('量纲: 速度=长度/时间', function () {
    SCI.requireDim(DIM.div(DIM.length, DIM.time), DIM.velocity, '速度');
  });
  test('量纲: 力=质量×加速度', function () {
    SCI.requireDim(DIM.mul(DIM.mass, DIM.acceleration), DIM.force, '力');
  });
  test('量纲: 能量=力×长度', function () {
    SCI.requireDim(DIM.mul(DIM.force, DIM.length), DIM.energy, '能量');
  });
  test('量纲: 故意错误必须被拦截 (长度≠时间)', function () {
    throws(function () { SCI.requireDim(DIM.length, DIM.time, '故意错误'); });
  });

  /* ============ 数学 ============ */
  test('二次函数顶点: y=x²-4x+3 → (2,-1)', function () {
    const v = M.quadraticVertex(1, -4, 3);
    approx(v.x, 2); approx(v.y, -1);
  });
  test('二次函数判别式: x²-4x+3 → Δ=4, 根 1 和 3', function () {
    strict(M.quadraticDiscriminant(1, -4, 3), 4);
    const r = M.quadraticRoots(1, -4, 3);
    strict(r.type, 'two');
    approx(r.roots[0], 1); approx(r.roots[1], 3);
  });
  test('二次函数: x²+1 → 无实根', function () {
    strict(M.quadraticRoots(1, 0, 1).type, 'none');
  });
  test('二次函数: a=0 必须报错', function () {
    throws(function () { M.quadraticVertex(0, 1, 1); });
  });
  test('一次函数: k=2,b=-4 → x截距=2, 倾斜角≈63.435°', function () {
    const info = M.linearInfo(2, -4);
    approx(info.xIntercept, 2);
    approx(info.angleDeg, Math.atan(2) * 180 / Math.PI);
  });
  test('三角函数: 30° → sin=1/2, cos=√3/2, tan=√3/3', function () {
    const t = M.trigFromDeg(30);
    approx(t.sin, 0.5); approx(t.cos, Math.sqrt(3) / 2); approx(t.tan, 1 / Math.sqrt(3));
  });
  test('三角函数: 90° → tan 不存在', function () {
    strict(M.trigFromDeg(90).tan, null);
  });
  test('导数: f=x³ 在 x=2 处斜率=12', function () {
    approx(M.polyDerivAt([0, 0, 0, 1], 2), 12);
  });
  test('导数: f=2x²+3x+1 → f\'=4x+3, f\'(1)=7', function () {
    approx(M.polyDerivAt([1, 3, 2], 1), 7);
  });
  test('勾股定理: 3,4 → 5', function () {
    approx(M.pythagorasHypotenuse(3, 4), 5);
  });
  test('椭圆: a=5,b=3 → c=4, e=0.8', function () {
    const e = M.ellipseInfo(5, 3);
    approx(e.c, 4); approx(e.e, 0.8);
    approx(e.foci[1][0], 4);
  });
  test('椭圆: a≤b 必须报错', function () {
    throws(function () { M.ellipseInfo(3, 5); });
  });

  /* ============ 化学 ============ */
  test('配平: 2H₂+O₂→2H₂O 原子守恒', function () {
    const r = CH.checkBalance(
      [{ formula: { H: 2 }, coef: 2 }, { formula: { O: 2 }, coef: 1 }],
      [{ formula: { H: 2, O: 1 }, coef: 2 }]
    );
    strict(r.balanced, true);
  });
  test('配平: H₂+O₂→H₂O (未配平) 必须检出氧不守恒', function () {
    const r = CH.checkBalance(
      [{ formula: { H: 2 }, coef: 1 }, { formula: { O: 2 }, coef: 1 }],
      [{ formula: { H: 2, O: 1 }, coef: 1 }]
    );
    strict(r.balanced, false);
    strict(r.unbalancedElements.indexOf('O') >= 0, true);
  });
  test('配平: Fe₂O₃+3CO→2Fe+3CO₂ 原子守恒', function () {
    const r = CH.checkBalance(
      [{ formula: { Fe: 2, O: 3 }, coef: 1 }, { formula: { C: 1, O: 1 }, coef: 3 }],
      [{ formula: { Fe: 1 }, coef: 2 }, { formula: { C: 1, O: 2 }, coef: 3 }]
    );
    strict(r.balanced, true);
  });
  test('相对分子质量: H₂O = 18.015', function () {
    approx(CH.molarMass({ H: 2, O: 1 }), 2 * 1.008 + 15.999, 1e-6);
  });
  test('滴定: 0.1M NaOH 滴定 20mL 0.1M HCl, 等当点(20mL) pH=7', function () {
    approx(CH.strongAcidBaseTitration(0.1, 20, 0.1, 20), 7, 1e-9);
  });
  test('滴定: 加入 10mL → pH = 1 + lg3 ≈ 1.477', function () {
    approx(CH.strongAcidBaseTitration(0.1, 20, 0.1, 10), 1 + Math.log10(3), 1e-9);
  });
  test('滴定: 加入 30mL → pH = 14 + lg(0.025) ≈ 12.398', function () {
    const oh = (0.1 * 0.010) / 0.050;
    approx(CH.strongAcidBaseTitration(0.1, 20, 0.1, 30), 14 + Math.log10(oh), 1e-9);
  });
  test('活动性: Zn 比 Cu 活泼, Cu 不如 Zn', function () {
    strict(CH.moreActive('Zn', 'Cu'), true);
    strict(CH.moreActive('Cu', 'Zn'), false);
  });
  test('活动性: Fe 在 H 之前, Cu 在 H 之后', function () {
    strict(CH.moreActive('Fe', 'H'), true);
    strict(CH.moreActive('Cu', 'H'), false);
  });

  /* ============ 常数完整性 ============ */
  test('元素表: 前36号完整、序号连续', function () {
    strict(SCI.ELEMENTS.length, 36);
    for (let i = 0; i < 36; i++) strict(SCI.ELEMENTS[i].z, i + 1, '原子序数连续');
  });
  test('常数: g=9.8, Kw=1e-14', function () {
    approx(SCI.CONST.g, 9.8); approx(SCI.CONST.Kw, 1e-14);
  });

  // 导出
  SCI.tests = tests;
  if (typeof module !== 'undefined' && module.exports) module.exports = SCI;
})(typeof window !== 'undefined' ? window : globalThis);
