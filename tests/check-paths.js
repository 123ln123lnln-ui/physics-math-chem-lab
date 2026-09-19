/* tests/check-paths.js — 学习路径数据关口
 * 校验：路径非空、id 全部在注册表存在、路径内无重复节点。
 * 失败即禁止发版（由 run-all.js 调用）。
 */
globalThis.window = globalThis;
globalThis.UI = { fmt: function (v, d) { return Number(v.toFixed(d === undefined ? 3 : d)).toString(); } };
require('../engine/constants.js');
require('../js/lab.js');
require('../js/registry-math.js');
require('../js/registry-physics.js');
require('../js/registry-chemistry.js');
require('../js/registry-more.js');
require('../js/paths.js');

const R = globalThis.Reg;
const P = globalThis.Paths;
let errors = 0;

if (!P || !P.list || !P.list.length) { console.error('✘ 路径列表为空'); process.exit(1); }

P.list.forEach(function (p) {
  if (!p.id || !p.title || !p.nodes || !p.nodes.length) {
    console.error('✘ 路径缺字段或无节点：' + (p.id || '?')); errors++; return;
  }
  const seen = {};
  p.nodes.forEach(function (id) {
    if (!R.byId[id]) { console.error('✘ ' + p.id + ' 引用悬空知识点：' + id); errors++; }
    if (seen[id]) { console.error('✘ ' + p.id + ' 节点重复：' + id); errors++; }
    seen[id] = true;
  });
});
if (errors) { console.error('\n路径校验失败：' + errors + ' 处'); process.exit(1); }
console.log('路径校验通过：' + P.list.length + ' 条路径，共 ' +
  P.list.reduce(function (s, p) { return s + p.nodes.length; }, 0) + ' 个节点引用 ✔');
