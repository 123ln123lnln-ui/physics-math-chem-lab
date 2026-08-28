/* validate-registry.js — 注册表全量校验
 * 1) 结构校验：每条知识点必须有合法的 quiz 与（calc 型）参数定义
 * 2) 运行校验：用默认参数真实执行每个计算函数，捕获运行时错误
 */
globalThis.window = globalThis;
globalThis.UI = { fmt: function (v, d) { return Number(v.toFixed(d === undefined ? 3 : d)).toString(); } };

require('../engine/constants.js');
require('../engine/units.js');
require('../engine/integrator.js');
require('../engine/mathx.js');
require('../engine/physx.js');
require('../engine/chemx.js');
require('../js/lab.js');
require('../js/registry-math.js');
require('../js/registry-physics.js');
require('../js/registry-chemistry.js');

const R = globalThis.Reg;
let errors = 0, checked = 0;

for (const id in R.items) {
  const it = R.items[id];
  checked++;
  const fail = function (msg) { errors++; console.log('FAIL [' + id + '] ' + it.title + ': ' + msg); };

  // 结构校验
  if (!it.title || !it.branch || !it.stage) { fail('缺少 title/branch/stage'); }
  const q = it.def && it.def.quiz;
  if (!q) { fail('缺少检测题'); }
  else {
    if (!q.q) fail('检测题缺问题');
    if (!Array.isArray(q.opts) || q.opts.length < 2) fail('检测题选项不足');
    if (q.a === undefined || q.a < 0 || (q.opts && q.a >= q.opts.length)) fail('检测题答案索引非法: a=' + q.a);
    if (!q.e) fail('检测题缺解析');
  }
  if (it.type === 'concept') {
    if (!it.def.text) fail('概念卡缺正文');
    continue;
  }
  // calc/graph 型：参数与函数校验
  if (!it.def.fn || typeof it.def.fn !== 'function') { fail('缺计算函数'); continue; }
  if (!Array.isArray(it.def.params) || it.def.params.length === 0) { fail('缺参数定义'); continue; }
  const params = {};
  let paramOk = true;
  it.def.params.forEach(function (pm) {
    if (pm.k === undefined || pm.min === undefined || pm.max === undefined || pm.v === undefined) { fail('参数定义不完整: ' + JSON.stringify(pm)); paramOk = false; return; }
    if (pm.v < pm.min || pm.v > pm.max) { fail('参数默认值越界: ' + pm.k); paramOk = false; }
    params[pm.k] = pm.v;
  });
  if (!paramOk) continue;
  // 真实运行
  try {
    const rows = it.def.fn(params);
    if (!Array.isArray(rows) || rows.length === 0) fail('计算函数未返回结果行');
    // 检查返回值中是否混入 NaN/Infinity
    rows.forEach(function (r) {
      for (let i = 0; i < r.length; i++) {
        const v = r[i];
        if (typeof v === 'number' && !isFinite(v)) fail('结果含非法数值: ' + r[0]);
        if (typeof v === 'string' && /NaN|-?Infinity/.test(v)) fail('结果含非法数值串: ' + v);
      }
    });
  } catch (e) {
    fail('运行时错误: ' + e.message);
  }
}

console.log('========================================');
console.log('校验条目: ' + checked + '，错误: ' + errors);
process.exit(errors > 0 ? 1 : 0);
