// 检查 ExploreData 50 项是否全部有动画映射
globalThis.window = globalThis;
require('../js/explore-data.js');
require('../js/explore.js');
const data = globalThis.ExploreData;
const map = globalThis.Explore.ANIM_MAP;
let missing = [];
data.forEach(function (d) {
  if (!d.anim && !map[d.title]) missing.push(d.title);
});
console.log('总数=' + data.length);
console.log('缺映射=' + missing.length + (missing.length ? ': ' + missing.join(' | ') : ''));
