/* node-run.js — 黄金测试 Node 命令行运行器
 * 用法: node tests/node-run.js
 * 退出码: 0=全部通过, 1=存在失败
 */
require('../engine/constants.js');
require('../engine/units.js');
require('../engine/integrator.js');
require('../engine/mathx.js');
require('../engine/physx.js');
require('../engine/chemx.js');
require('../engine/tests.js');

const SCI = globalThis.SCI;
let pass = 0, fail = 0;
const failures = [];

for (const t of SCI.tests) {
  try {
    t.fn();
    pass++;
    console.log('  PASS  ' + t.name);
  } catch (e) {
    fail++;
    failures.push({ name: t.name, err: e.message });
    console.log('  FAIL  ' + t.name + '  -> ' + e.message);
  }
}

console.log('\n========================================');
console.log('通过: ' + pass + ' / ' + (pass + fail));
if (fail > 0) {
  console.log('失败: ' + fail);
  failures.forEach(f => console.log('  - ' + f.name + ': ' + f.err));
  process.exit(1);
} else {
  console.log('全部黄金测试通过 ✔');
  process.exit(0);
}
