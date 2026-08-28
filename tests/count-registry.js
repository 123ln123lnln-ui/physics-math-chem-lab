// 临时统计脚本
globalThis.window = globalThis;
globalThis.UI = { fmt: function (v, d) { return Number(v.toFixed(d === undefined ? 3 : d)).toString(); } };
require('../engine/constants.js');
require('../js/lab.js');
require('../js/registry-math.js');
require('../js/registry-physics.js');
require('../js/registry-chemistry.js');
const R = globalThis.Reg;
const m = R.count('math'), p = R.count('physics'), c = R.count('chemistry');
console.log('math=' + m + ' physics=' + p + ' chemistry=' + c + ' total=' + R.count());
// 概念型与交互型统计
let concept = 0, calc = 0;
for (const id in R.items) { if (R.items[id].type === 'concept') concept++; else calc++; }
console.log('calc/graph(真交互)=' + calc + ', concept(概念卡)=' + concept);
