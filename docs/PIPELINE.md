# 探索篇扩展管线（科技树扩容标准流程）

> 本管线在「能源/材料/信息/生命/航天」+「农业/医学/交通/计算/天文」+「工程/地球/量子奇观/感知与错觉/时间与测量」十五棵树、158 个主题的实践中验证有效。
> 任何新批次（人或 AI 执行）都必须走完这七步，缺一不可交付。

## 0. 选题原则（什么样的主题才配进探索篇）

三选一，最好兼具：
1. **有趣的科学原理**——有反直觉点或"原来如此"的瞬间（如：贝茨极限、奥伯斯佯谬）；
2. **宇宙基础原理**——通向 15 条科学真理（能量守恒、熵、对称、涌现……）的具体化身；
3. **改变文明的技术节点**——有明确的历史人物+年份+文明影响（如：哈伯-博施法）。

一票否决：纯罗列（元素周期表罗列）、纯定义（什么是 XX）、与已有主题实质雷同。

## 1. 查重（动手前必做）

```bash
grep -h "title: '" js/explore-data*.js   # 全部已有标题
```
- 标题不得重复；角度不得实质雷同（已有"机翼升力"→ 可做"声障与激波"，不可再做飞机升力）。
- 动画 key 也不得撞名：`grep -h "AN\." js/explore-anim*.js | grep "= function"`。

## 2. 数据格式（explore-data3_N.js）

```js
window.ExploreData3_N = [
  { title: '主题：一句话点出原理', cat: '某树',
    teaser: '2 句引子：反直觉事实/历史故事/生活现象',
    body: '120~160 字：核心原理(可有公式) + 人物年份 + 文明影响',
    anim: 'uniqueCamelCaseKey',
    params: [{ k: 'x', label: '中文名', min, max, step, v, unit? }] },
  ...
];
```
- 每批 11 个，按时间线（古代→现代）排序，体现科技树演进。
- `params` 恰 1 个，且必须是动画的核心物理量。

## 3. 动画格式（explore-anim5_N.js）

- IIFE 包裹；`mk()`/`cap()` 从 `explore-anim5_1.js` **逐字复制**（diff 验证）。
- `AN.key = function (holder, tp)`；深色画布 `mk(holder, 360, 240, true)`；`tp.data` 读参数。
- 质量标准见 docs/ANIM-QC.md 的"升级经验十条"。
- 健壮性：不依赖外部资源、不抛异常、参数极值不崩。

## 4. 批次自查（写的人自己跑）

```bash
node --check js/explore-data3_N.js && node --check js/explore-anim5_N.js
node tests/all-anims.js    # 全动画黄金测试（见下）必须先能跑新文件
```
- 逐条重读中文文案：AI 生成长中文会随机混入杂词（"强求""无人驾驶"等），必须人工/脚本复读。
- 数字史实抽查：年份、常数、量级经得起推敲。

## 5. 中央接线（主控统一做，批次作者禁止动共享文件）

1. `js/explore-data3.js`：concat 加一行 `window.ExploreData3_N`；
2. `index.html`：加两个 script 标签（data3_N、anim5_N）；
3. **升版本号**：`sed -i 's/v=旧/v=新/g' index.html`（防浏览器缓存，不做这步等于没发版）。

## 6. 自动关口（全绿才算完）

```bash
node tests/run-all.js             # 总管：以下三关口连跑（推荐）
node tests/node-run.js            # 引擎黄金测试 44/44
node tests/validate-registry.js   # 注册表 243 条 0 错误
node tests/all-anims.js           # 全动画黄金测试（ExploreAnim + ConceptAnim.GEN + App 模块冒烟）
```
外加人工抽查：浏览器实机截图 ≥4 个新动画目检。

## 7. 提交推送

一个 commit 包含：新文件 + 接线 + 版本号。commit message 写明树名、主题数、版本号变化。

---

## 附：反模式清单（这批踩过的坑）

- ❌ 写完大文件不做 `node --check` 就交付；
- ❌ 改了 js 不升版本号，浏览器拿旧缓存，"修了但没完全修"；
- ❌ 动画参数只调速度不改物理结果（假参数）；
- ❌ 动画很美但不演示标题承诺的原理（货不对板）；
- ❌ 多个并行作者同时改 index.html（接线冲突）——接线权收归主控。
