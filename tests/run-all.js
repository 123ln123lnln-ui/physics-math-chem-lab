/* tests/run-all.js — 总管：一条命令跑全部自动关口（管线第 6 步）
 * 依次执行：引擎黄金测试 → 注册表校验 → 全动画黄金测试（含模块冒烟）。
 * 任一关口失败即非零退出，失败即禁止发版。
 * 用法: node tests/run-all.js
 */
const { spawnSync } = require('child_process');
const path = require('path');

const gates = [
  ['引擎黄金测试', 'node-run.js'],
  ['注册表校验', 'validate-registry.js'],
  ['全动画黄金测试', 'all-anims.js'],
  ['路径数据校验', 'check-paths.js']
];

let failed = 0;
for (const [name, file] of gates) {
  console.log('\n>>> 关口：' + name + '（tests/' + file + '）');
  const r = spawnSync(process.execPath, [path.join(__dirname, file)], { stdio: 'inherit' });
  if (r.status !== 0) {
    failed++;
    console.error('XXX 关口失败：' + name);
  }
}
console.log('\n========================================');
if (failed > 0) {
  console.log('总管结果：' + failed + ' 个关口未过，禁止发版 ✘');
  process.exit(1);
}
console.log('总管结果：全部关口通过 ✔');
process.exit(0);
