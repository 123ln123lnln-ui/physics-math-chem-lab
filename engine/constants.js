/* constants.js — 常数与基础数据的单一事实源（Single Source of Truth）
 * 规则：任何页面/引擎需要常数时必须从这里取，禁止在渲染层内联写死数字。
 * 每个常数标注来源：教材约定值 / CODATA / IUPAC。
 */
(function (global) {
  const SCI = global.SCI || (global.SCI = {});

  SCI.CONST = {
    g: 9.8,          // N/kg（中学教材约定值；标准值 9.80665）
    c: 3.0e8,        // m/s 真空光速（教材约定 3.0×10^8）
    e: 1.6e-19,      // C 元电荷（教材近似）
    NA: 6.02e23,     // mol^-1 阿伏加德罗常数（教材近似；CODATA 6.02214076e23）
    ke: 9.0e9,       // N·m^2/C^2 静电力常量（教材值）
    h: 6.63e-34,     // J·s 普朗克常量（教材近似）
    Kw: 1.0e-14,     // 25°C 水的离子积
    atm: 1.013e5,    // Pa 标准大气压
    R: 8.314         // J/(mol·K) 理想气体常数
  };

  /* 元素数据（前 36 号）。来源：IUPAC 标准原子量、鲍林电负性、课标周期表。
   * 字段：z 原子序数, s 符号, cn 中文名, en 英文名, m 相对原子质量,
   *       c 类别, p 周期, g 族(1-18), col 周期表列, x 电负性(鲍林, null=无常用值),
   *       cfg 电子排布(简写)
   */
  SCI.ELEMENTS = [
    { z:1,  s:'H',  cn:'氢', en:'Hydrogen',   m:1.008,  c:'非金属',   p:1, g:1,  col:1,  x:2.20, cfg:'1s¹' },
    { z:2,  s:'He', cn:'氦', en:'Helium',     m:4.0026, c:'稀有气体', p:1, g:18, col:18, x:null, cfg:'1s²' },
    { z:3,  s:'Li', cn:'锂', en:'Lithium',    m:6.94,   c:'碱金属',   p:2, g:1,  col:1,  x:0.98, cfg:'[He]2s¹' },
    { z:4,  s:'Be', cn:'铍', en:'Beryllium',  m:9.0122, c:'碱土金属', p:2, g:2,  col:2,  x:1.57, cfg:'[He]2s²' },
    { z:5,  s:'B',  cn:'硼', en:'Boron',      m:10.81,  c:'非金属',   p:2, g:13, col:13, x:2.04, cfg:'[He]2s²2p¹' },
    { z:6,  s:'C',  cn:'碳', en:'Carbon',     m:12.011, c:'非金属',   p:2, g:14, col:14, x:2.55, cfg:'[He]2s²2p²' },
    { z:7,  s:'N',  cn:'氮', en:'Nitrogen',   m:14.007, c:'非金属',   p:2, g:15, col:15, x:3.04, cfg:'[He]2s²2p³' },
    { z:8,  s:'O',  cn:'氧', en:'Oxygen',     m:15.999, c:'非金属',   p:2, g:16, col:16, x:3.44, cfg:'[He]2s²2p⁴' },
    { z:9,  s:'F',  cn:'氟', en:'Fluorine',   m:18.998, c:'卤素',     p:2, g:17, col:17, x:3.98, cfg:'[He]2s²2p⁵' },
    { z:10, s:'Ne', cn:'氖', en:'Neon',       m:20.180, c:'稀有气体', p:2, g:18, col:18, x:null, cfg:'[He]2s²2p⁶' },
    { z:11, s:'Na', cn:'钠', en:'Sodium',     m:22.990, c:'碱金属',   p:3, g:1,  col:1,  x:0.93, cfg:'[Ne]3s¹' },
    { z:12, s:'Mg', cn:'镁', en:'Magnesium',  m:24.305, c:'碱土金属', p:3, g:2,  col:2,  x:1.31, cfg:'[Ne]3s²' },
    { z:13, s:'Al', cn:'铝', en:'Aluminium',  m:26.982, c:'金属',     p:3, g:13, col:13, x:1.61, cfg:'[Ne]3s²3p¹' },
    { z:14, s:'Si', cn:'硅', en:'Silicon',    m:28.085, c:'类金属',   p:3, g:14, col:14, x:1.90, cfg:'[Ne]3s²3p²' },
    { z:15, s:'P',  cn:'磷', en:'Phosphorus', m:30.974, c:'非金属',   p:3, g:15, col:15, x:2.19, cfg:'[Ne]3s²3p³' },
    { z:16, s:'S',  cn:'硫', en:'Sulfur',     m:32.06,  c:'非金属',   p:3, g:16, col:16, x:2.58, cfg:'[Ne]3s²3p⁴' },
    { z:17, s:'Cl', cn:'氯', en:'Chlorine',   m:35.45,  c:'卤素',     p:3, g:17, col:17, x:3.16, cfg:'[Ne]3s²3p⁵' },
    { z:18, s:'Ar', cn:'氩', en:'Argon',      m:39.948, c:'稀有气体', p:3, g:18, col:18, x:null, cfg:'[Ne]3s²3p⁶' },
    { z:19, s:'K',  cn:'钾', en:'Potassium',  m:39.098, c:'碱金属',   p:4, g:1,  col:1,  x:0.82, cfg:'[Ar]4s¹' },
    { z:20, s:'Ca', cn:'钙', en:'Calcium',    m:40.078, c:'碱土金属', p:4, g:2,  col:2,  x:1.00, cfg:'[Ar]4s²' },
    { z:21, s:'Sc', cn:'钪', en:'Scandium',   m:44.956, c:'金属',     p:4, g:3,  col:3,  x:1.36, cfg:'[Ar]3d¹4s²' },
    { z:22, s:'Ti', cn:'钛', en:'Titanium',   m:47.867, c:'金属',     p:4, g:4,  col:4,  x:1.54, cfg:'[Ar]3d²4s²' },
    { z:23, s:'V',  cn:'钒', en:'Vanadium',   m:50.942, c:'金属',     p:4, g:5,  col:5,  x:1.63, cfg:'[Ar]3d³4s²' },
    { z:24, s:'Cr', cn:'铬', en:'Chromium',   m:51.996, c:'金属',     p:4, g:6,  col:6,  x:1.66, cfg:'[Ar]3d⁵4s¹' },
    { z:25, s:'Mn', cn:'锰', en:'Manganese',  m:54.938, c:'金属',     p:4, g:7,  col:7,  x:1.55, cfg:'[Ar]3d⁵4s²' },
    { z:26, s:'Fe', cn:'铁', en:'Iron',       m:55.845, c:'金属',     p:4, g:8,  col:8,  x:1.83, cfg:'[Ar]3d⁶4s²' },
    { z:27, s:'Co', cn:'钴', en:'Cobalt',     m:58.933, c:'金属',     p:4, g:9,  col:9,  x:1.88, cfg:'[Ar]3d⁷4s²' },
    { z:28, s:'Ni', cn:'镍', en:'Nickel',     m:58.693, c:'金属',     p:4, g:10, col:10, x:1.91, cfg:'[Ar]3d⁸4s²' },
    { z:29, s:'Cu', cn:'铜', en:'Copper',     m:63.546, c:'金属',     p:4, g:11, col:11, x:1.90, cfg:'[Ar]3d¹⁰4s¹' },
    { z:30, s:'Zn', cn:'锌', en:'Zinc',       m:65.38,  c:'金属',     p:4, g:12, col:12, x:1.65, cfg:'[Ar]3d¹⁰4s²' },
    { z:31, s:'Ga', cn:'镓', en:'Gallium',    m:69.723, c:'金属',     p:4, g:13, col:13, x:1.81, cfg:'[Ar]3d¹⁰4s²4p¹' },
    { z:32, s:'Ge', cn:'锗', en:'Germanium',  m:72.630, c:'类金属',   p:4, g:14, col:14, x:2.01, cfg:'[Ar]3d¹⁰4s²4p²' },
    { z:33, s:'As', cn:'砷', en:'Arsenic',    m:74.922, c:'类金属',   p:4, g:15, col:15, x:2.18, cfg:'[Ar]3d¹⁰4s²4p³' },
    { z:34, s:'Se', cn:'硒', en:'Selenium',   m:78.971, c:'非金属',   p:4, g:16, col:16, x:2.55, cfg:'[Ar]3d¹⁰4s²4p⁴' },
    { z:35, s:'Br', cn:'溴', en:'Bromine',    m:79.904, c:'卤素',     p:4, g:17, col:17, x:2.96, cfg:'[Ar]3d¹⁰4s²4p⁵' },
    { z:36, s:'Kr', cn:'氪', en:'Krypton',    m:83.798, c:'稀有气体', p:4, g:18, col:18, x:null, cfg:'[Ar]3d¹⁰4s²4p⁶' }
  ];

  // 相对原子质量表：由元素表生成 + 课标常用扩展（用于摩尔质量计算）
  SCI.ATOMIC_MASS = (function () {
    const t = {};
    SCI.ELEMENTS.forEach(e => { t[e.s] = e.m; });
    Object.assign(t, {
      Sn: 118.71, Pb: 207.2, Hg: 200.59, Ag: 107.87, Ba: 137.33,
      I: 126.90, Pt: 195.08, Au: 196.97
    });
    return t;
  })();

  if (typeof module !== 'undefined' && module.exports) module.exports = SCI;
})(typeof window !== 'undefined' ? window : globalThis);
