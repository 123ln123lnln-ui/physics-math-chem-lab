// 验证概念条目全覆盖
globalThis.window = globalThis;
globalThis.UI = { fmt: function (v, d) { return String(v); } };
require('../engine/constants.js');
require('../js/lab.js');
require('../js/registry-math.js');
require('../js/registry-physics.js');
require('../js/registry-chemistry.js');
require('../js/registry-more.js');
require('../js/concept-map.js');
const R = globalThis.Reg, CM = globalThis.ConceptMap;
let total = 0, explicit = 0, fallback = 0;
for (const id in R.items) {
  if (R.items[id].type !== 'concept') continue;
  total++;
  if (CM.has(id)) explicit++; else fallback++;
}
console.log('concept总数=' + total + ' 显式映射=' + explicit + ' 兜底映射=' + fallback);
// 抽查兜底
let sample = [];
for (const id in R.items) {
  if (R.items[id].type !== 'concept' && !CM.has(id)) { sample.push(id); if (sample.length > 5) break; }
}
console.log('未显式映射(走兜底)示例:', sample.join(', ') || '无');
