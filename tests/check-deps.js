// 校验 dependencies.js：悬空引用 / 自依赖 / 环检测 / 覆盖率统计
globalThis.window = globalThis; globalThis.UI = { fmt: x => x }; globalThis.SCI = { CONST: {} };
const items = [];
globalThis.Reg = { add: (id, subject, stage, title, branch, type) => items.push({ id, subject, stage, title, branch }) };
require('../js/registry-math.js');
require('../js/registry-physics.js');
require('../js/registry-chemistry.js');
require('../js/registry-more.js');
require('../js/dependencies.js');
const DEPS = globalThis.Deps;

const ids = new Set(items.map(i => i.id));
let errors = 0;

// 1. 悬空引用：依赖指向不存在的 id；或未在注册表的条目写了依赖
Object.keys(DEPS).forEach(id => {
  if (!ids.has(id)) { console.log('✗ 依赖表里的未知条目:', id); errors++; }
  DEPS[id].forEach(p => {
    if (!ids.has(p)) { console.log('✗ 悬空依赖:', id, '→', p); errors++; }
    if (p === id) { console.log('✗ 自依赖:', id); errors++; }
  });
});

// 2. 环检测（DFS 三色标记）
const WHITE = 0, GRAY = 1, BLACK = 2;
const color = {};
Object.keys(DEPS).forEach(id => color[id] = WHITE);
function dfs(id, stack) {
  color[id] = GRAY;
  for (const p of (DEPS[id] || [])) {
    if (color[p] === GRAY) { console.log('✗ 依赖成环:', stack.concat(id).join(' → '), '→', p); errors++; continue; }
    if (color[p] === WHITE) dfs(p, stack.concat(id));
  }
  color[id] = BLACK;
}
Object.keys(DEPS).forEach(id => { if (color[id] === WHITE) dfs(id, []); });

// 3. 统计
const rootCount = items.filter(i => !DEPS[i.id]).length;
const cross = [];
Object.keys(DEPS).forEach(id => {
  const subj = id.split('_')[0];
  (DEPS[id] || []).forEach(p => { if (p.split('_')[0] !== subj) cross.push(id + '→' + p); });
});
console.log('条目总数=' + items.length, '有前置=' + Object.keys(DEPS).length, '根节点=' + rootCount);
console.log('跨学科依赖=' + cross.length, cross.join(', ') || '(无)');
console.log(errors ? `\n发现 ${errors} 个问题 ✗` : '\n依赖图校验通过 ✔');
process.exit(errors ? 1 :  0);
