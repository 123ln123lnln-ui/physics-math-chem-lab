/* units.js — 量纲（SI 维度）系统
 * 目的：物理计算结果必须通过量纲校验，量纲不符直接抛错、阻断渲染，
 * 杜绝"看起来对但量纲错"的输出。
 * 维度向量：{L 长度, M 质量, T 时间, I 电流, Th 温度, N 物质的量}
 */
(function (global) {
  const SCI = global.SCI || (global.SCI = {});

  function D(L, M, T, I, Th, N) { return { L: L || 0, M: M || 0, T: T || 0, I: I || 0, Th: Th || 0, N: N || 0 }; }

  const DIM = {
    one: D(), none: D(),
    length: D(1), mass: D(0, 1), time: D(0, 0, 1), temperature: D(0, 0, 0, 0, 1), amount: D(0, 0, 0, 0, 0, 1),
    velocity: D(1, 0, -1), acceleration: D(1, 0, -2),
    force: D(1, 1, -2), energy: D(2, 1, -2), power: D(2, 1, -3), pressure: D(-1, 1, -2),
    frequency: D(0, 0, -1), angle: D(),
    current: D(0, 0, 0, 1), charge: D(0, 0, 1, 1),
    voltage: D(2, 1, -3, -1), resistance: D(2, 1, -3, -2),
    molarMass: D(0, 1, 0, 0, 0, -1), concentration: D(0, 0, 0, 0, 0, 1), // mol/体积在数值层单独处理
    mul(a, b) { return D(a.L + b.L, a.M + b.M, a.T + b.T, a.I + b.I, a.Th + b.Th, a.N + b.N); },
    div(a, b) { return D(a.L - b.L, a.M - b.M, a.T - b.T, a.I - b.I, a.Th - b.Th, a.N - b.N); },
    pow(a, n) { return D(a.L * n, a.M * n, a.T * n, a.I * n, a.Th * n, a.N * n); },
    eq(a, b) { return a.L === b.L && a.M === b.M && a.T === b.T && a.I === b.I && a.Th === b.Th && a.N === b.N; },
    str(d) {
      const parts = [];
      const names = { L: 'L', M: 'M', T: 'T', I: 'I', Th: 'Θ', N: 'N' };
      for (const k of ['L', 'M', 'T', 'I', 'Th', 'N']) if (d[k]) parts.push(names[k] + (d[k] !== 1 ? '^' + d[k] : ''));
      return parts.length ? parts.join('·') : '1';
    }
  };
  SCI.DIM = DIM;

  // 运行时量纲断言：不符即抛错
  SCI.requireDim = function (dim, expected, label) {
    if (!DIM.eq(dim, expected)) {
      throw new Error('[量纲错误] ' + (label || '') + ': 计算得到 ' + DIM.str(dim) + '，期望 ' + DIM.str(expected));
    }
    return true;
  };

  // 便捷校验：速度 = 长度/时间 等常用组合
  SCI.check = {
    velocity(label) { return SCI.requireDim(DIM.div(DIM.length, DIM.time), DIM.velocity, label); },
    force(label) { return SCI.requireDim(DIM.mul(DIM.mass, DIM.acceleration), DIM.force, label); },
    energy(label) { return SCI.requireDim(DIM.mul(DIM.force, DIM.length), DIM.energy, label); }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SCI;
})(typeof window !== 'undefined' ? window : globalThis);
