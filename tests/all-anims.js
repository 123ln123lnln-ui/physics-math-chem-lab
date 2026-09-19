/* tests/all-anims.js — 全动画黄金测试（质控管线的自动关口）
 * 覆盖范围：window.ExploreAnim 全部动画 key + window.ConceptAnim.GEN 全部模板 + modules/*.js 全部 App 模块。
 * 每个动画：用默认/参数下限/参数上限三组输入各跑 120 帧（requestAnimationFrame/setInterval 被接管驱动），
 * 每个模块：render() 后跑 120 帧冒烟；
 * 断言：不抛异常 + 确有绘制调用（drawCalls > 0，防止"跑了但什么都没画"的静默失败）。
 * 用法: node tests/all-anims.js   退出码: 0=全部通过, 1=存在失败
 */

// ---------- DOM 桩（无浏览器环境） ----------
let drawCalls = 0;
const gradStub = { addColorStop: function () {} };
function makeCtx(canvas) {
  const t = { canvas: canvas };
  return new Proxy(t, {
    get: function (tt, k) {
      if (k in tt) return tt[k];
      if (k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern') return function () { return gradStub; };
      if (k === 'createImageData' || k === 'getImageData') return function (a, b, c, d) {
        const w = c === undefined ? a : c, h = c === undefined ? b : d;
        return { width: w, height: h, data: new Uint8ClampedArray(Math.max(4, (w | 0) * (h | 0) * 4)) };
      };
      if (k === 'measureText') return function () { return { width: 10 }; };
      if (k === 'isPointInPath' || k === 'isPointInStroke') return function () { return false; };
      return function () { drawCalls++; };
    },
    set: function (tt, k, v) { tt[k] = v; return true; }
  });
}
function makeEl(tag) {
  return {
    tagName: tag, style: {}, children: [], width: 0, height: 0, className: '', innerHTML: '',
    value: '', textContent: '',
    classList: { add: function () {}, remove: function () {}, toggle: function () {}, contains: function () { return false; } },
    getContext: function () { if (!this.__ctx) this.__ctx = makeCtx(this); return this.__ctx; },
    appendChild: function (c) { this.children.push(c); return c; },
    addEventListener: function () {}, removeEventListener: function () {},
    setAttribute: function () {},
    getBoundingClientRect: function () { return { left: 0, top: 0, width: 360, height: 300 }; }
  };
}
global.window = global;
window.devicePixelRatio = 1;
global.document = {
  createElement: function (tag) { return makeEl(tag); },
  createElementNS: function (ns, tag) { return makeEl(tag); },
  createTextNode: function (t) { const el = makeEl('#text'); el.textContent = t; return el; },
  body: makeEl('body'),
  addEventListener: function () {}
};
let rafQ = [];
const raf = function (f) { rafQ.push(f); return rafQ.length; };
global.requestAnimationFrame = raf; window.requestAnimationFrame = raf;
global.setInterval = raf;   // 把定时动画也纳入逐帧驱动
global.setTimeout = function () { return 0; }; // 不自动执行，避免递归
window.addEventListener = function () {};

// ---------- 加载数据与动画定义（按文件名模式自动发现，新批次免接线） ----------
const fs = require('fs'), path = require('path');
const JSDIR = path.join(__dirname, '..', 'js');
function loadFile(f) { eval(fs.readFileSync(path.join(JSDIR, f), 'utf8')); }
const allJs = fs.readdirSync(JSDIR);
const pick = function (re) { return allJs.filter(function (f) { return re.test(f); }).sort(); };
const dataFiles = pick(/^explore-data(\d+(_\d+)?)?\.js$/).filter(function (f) { return f !== 'explore-data3.js'; }); // 汇总文件不直接含数据
const animFiles = pick(/^explore-anim.*\.js$/).concat(pick(/^concept-anim\d*\.js$/));
dataFiles.forEach(loadFile);
animFiles.forEach(loadFile);

// ---------- 收集探索主题参数（默认/下限/上限三组） ----------
const topics = [];
Object.keys(window).forEach(function (k) {
  if (/^ExploreData(\d+(_\d+)?)?$/.test(k) && Array.isArray(window[k])) topics.push.apply(topics, window[k]);
});
const paramsByAnim = {};
topics.forEach(function (d) {
  if (d.anim && d.params) paramsByAnim[d.anim] = d.params;
});
function tpsFor(key) {
  const ps = paramsByAnim[key];
  if (!ps || !ps.length) return [{ data: {} }];
  const mk = function (pick) {
    const data = {};
    ps.forEach(function (p) { data[p.k] = p[pick]; });
    return { data: data };
  };
  return [mk('v'), mk('min'), mk('max')];
}

// ---------- 驱动 ----------
function drive(frames) {
  for (let i = 0; i < frames; i++) {
    const fns = rafQ.splice(0);
    fns.forEach(function (f) { f(); });
  }
}
let pass = 0, fail = 0;
const fails = [];
function runOne(family, key, fn, tps) {
  tps.forEach(function (tp, ti) {
    drawCalls = 0; rafQ = [];
    const holder = makeEl('div');
    const tag = family + '.' + key + '[' + ti + ']';
    try {
      fn(holder, tp);
      drive(120);
      if (drawCalls === 0) throw new Error('120 帧内 0 次绘制调用（静默失败）');
      pass++;
    } catch (e) {
      fail++;
      fails.push(tag + ' -> ' + (e && e.message));
    }
  });
}

// ExploreAnim 全部定义
const AN = window.ExploreAnim || {};
Object.keys(AN).forEach(function (k) {
  if (typeof AN[k] === 'function') runOne('AN', k, AN[k], tpsFor(k));
});
// ConceptAnim.GEN 全部模板
const GEN = (window.ConceptAnim && window.ConceptAnim.GEN) || {};
Object.keys(GEN).forEach(function (k) {
  if (typeof GEN[k] === 'function') runOne('GEN', k, GEN[k], [{}]);
});

// ---------- App 模块冒烟（modules/*.js：render + 120 帧，不抛异常 + 确有输出） ----------
// 深桩：对任意属性/调用/构造都返回自身（数值上下文归 0），供 JSXGraph 等重型绘图库在无浏览器环境下走通真实代码路径
function deepStub() {
  const f = function () { return p; };
  const p = new Proxy(f, {
    get: function (t, k) {
      if (k === Symbol.toPrimitive) return function () { return 0; };
      if (k === 'then') return undefined; // 防被误当 Promise
      return p;
    },
    apply: function () { return p; },
    construct: function () { return p; },
    set: function () { return true; }
  });
  return p;
}
// 真实呈现辅助与科学引擎（UI/SCI/Anim.animControls 的真实定义）；JXG 用深桩（其 SVG 绘制不经 canvas 2D，由 DOM 输出判定）
['constants.js', 'units.js', 'integrator.js', 'mathx.js', 'physx.js', 'chemx.js'].forEach(function (f) {
  eval(fs.readFileSync(path.join(__dirname, '..', 'engine', f), 'utf8'));
});
eval(fs.readFileSync(path.join(JSDIR, 'utils.js'), 'utf8'));
eval(fs.readFileSync(path.join(JSDIR, 'anim.js'), 'utf8'));
if (typeof window.JXG === 'undefined') window.JXG = deepStub();
const mods = [];
window.App = { register: function (m) { mods.push(m); } };
const MODDIR = path.join(__dirname, '..', 'modules');
fs.readdirSync(MODDIR).filter(function (f) { return /\.js$/.test(f); }).sort()
  .forEach(function (f) { eval(fs.readFileSync(path.join(MODDIR, f), 'utf8')); });
mods.forEach(function (m) {
  drawCalls = 0; rafQ = [];
  const tag = 'MOD.' + (m && m.id);
  try {
    if (!m || typeof m.render !== 'function') throw new Error('缺少 render()');
    const rootEl = makeEl('div');
    m.render(rootEl);
    drive(120);
    if (drawCalls === 0 && rootEl.children.length === 0) {
      throw new Error('120 帧内 0 次绘制且未挂载 DOM（静默失败）');
    }
    pass++;
  } catch (e) {
    fail++;
    fails.push(tag + ' -> ' + (e && e.message));
  }
});

console.log('========================================');
console.log('动画用例: ' + (pass + fail) + '  通过: ' + pass + '  失败: ' + fail);
console.log('动画定义: ExploreAnim ' + Object.keys(AN).length + ' 个, ConceptAnim.GEN ' + Object.keys(GEN).length +
  ' 个, App 模块 ' + mods.length + ' 个 —— 全数覆盖');
if (fail > 0) {
  console.log('失败清单:');
  fails.forEach(function (f) { console.log('  FAIL ' + f); });
  process.exit(1);
}
console.log('全部动画黄金测试通过 ✔');
process.exit(0);
