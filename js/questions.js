/* questions.js — 各知识点趣味题库（答案与引擎公式一致，已按黄金用例口径） */
(function () {
  const Q = window.Quiz;

  Q.add('quadratic-function', [
    { q: '二次函数 y = x² - 4x + 3 的顶点坐标是？', options: ['(2, -1)', '(2, 1)', '(-2, 1)', '(4, 3)'], answer: 0, explain: '顶点 x = -b/(2a) = 2，代入得 y = -1。' },
    { q: '判别式 Δ = b² - 4ac 大于 0 时，抛物线与 x 轴有几个交点？', options: ['2 个', '1 个', '0 个', '不确定'], answer: 0, explain: 'Δ>0 有两个不同实根，即两个交点。' },
    { q: '把 a 从正变负，抛物线会发生什么？', options: ['开口从向上变向下', '顶点不动', '对称轴改变', '没有变化'], answer: 0, explain: 'a 的符号决定开口方向。' }
  ]);

  Q.add('projectile', [
    { q: '同样初速度，哪个发射角射程最大？', options: ['45°', '30°', '60°', '90°'], answer: 0, explain: '射程 = v²sin2θ/g，θ=45° 时 sin2θ=1 最大。' },
    { q: '30° 和 60° 发射（同初速），射程关系是？', options: ['一样大', '30° 更远', '60° 更远', '无法比较'], answer: 0, explain: 'sin60° = sin120°，两者射程相同。' }
  ]);

  Q.add('free-fall', [
    { q: '从 4.9m 高处自由下落（g=9.8），落地时间约为？', options: ['1.0 s', '0.5 s', '2.0 s', '4.9 s'], answer: 0, explain: 'h = ½gt² → t = √(2h/g) = 1s。' },
    { q: '自由落体速度越来越快，是因为？', options: ['重力提供恒定加速度', '空气推动', '越接近地面引力突增', '惯性变大'], answer: 0, explain: '重力产生恒定的加速度 g。' }
  ]);

  Q.add('lens-imaging', [
    { q: '拍人像想让背景虚化成一片，光圈应该？', options: ['开大（如 f/2）', '收小（如 f/16）', '怎么调都一样', '先大后小'], answer: 0, explain: '光圈越大（f 数越小）入瞳越粗，焦外弥散圆越大，景深越浅，背景化开。' },
    { q: '光圈从 f/2 收到 f/16，景深会怎样？', options: ['变深：前后更多景物清晰', '变浅：只剩焦点清晰', '不变', '先变深再变浅'], answer: 0, explain: 'N 增大 → 入瞳 D=f/N 变小 → 各物点弥散圆变小 → 更多景物 ≤ 容许弥散圆，景深变深。' }
  ]);

  Q.add('shm-spring', [
    { q: '弹簧振子周期 T = 2π√(m/k)，质量增大周期会？', options: ['变长', '变短', '不变', '先长后短'], answer: 0, explain: 'T 与 √m 成正比。' },
    { q: 'm=1kg、k=4π² N/m 时周期是？', options: ['1 s', '2 s', '0.5 s', '4 s'], answer: 0, explain: 'T = 2π√(1/4π²) = 1s。' }
  ]);

  Q.add('trig-unit-circle', [
    { q: 'sin 30° 的值是？', options: ['1/2', '√3/2', '√2/2', '1'], answer: 0, explain: '30° 对边是斜边一半。' },
    { q: 'α = 90° 时，tan α 的情况是？', options: ['不存在', '等于 1', '等于 0', '等于 -1'], answer: 0, explain: 'cos90°=0，tan=sin/cos 分母为零。' }
  ]);

  Q.add('ellipse', [
    { q: '椭圆 a=5, b=3 时，半焦距 c = ?', options: ['4', '2', '√34', '8'], answer: 0, explain: 'c = √(a²-b²) = √16 = 4。' },
    { q: '离心率越接近 1，椭圆？', options: ['越扁', '越接近圆', '越大', '焦点越近'], answer: 0, explain: 'e=c/a，越大越扁。' }
  ]);

  Q.add('derivative-tangent', [
    { q: 'f(x)=x² 在 x=2 处的导数（切线斜率）是？', options: ['4', '2', '8', '1'], answer: 0, explain: "f'(x)=2x，x=2 时为 4。" },
    { q: '可导函数在极值点处的导数一定是？', options: ['0', '1', '不存在', '无穷大'], answer: 0, explain: '费马定理：可导函数极值点处切线水平，导数为 0（注意反方向不成立：f(x)=x³ 在 x=0 导数为 0 但不是极值点）。' }
  ]);

  Q.add('water-molecule', [
    { q: '水分子是极性分子，因为？', options: ['V 形结构，正负电荷中心不重合', '它是液体', '氧原子很大', '氢键作用'], answer: 0, explain: 'V 形（104.5°）导致电荷分布不对称。' },
    { q: '水分子的键角约为？', options: ['104.5°', '109°28′', '120°', '90°'], answer: 0, explain: '孤电子对排斥使键角小于正四面体角。' }
  ]);

  Q.add('periodic-table', [
    { q: '同一周期从左到右，电负性一般？', options: ['增大', '减小', '不变', '先减后增'], answer: 0, explain: '核电荷增加，吸引电子能力增强。' },
    { q: '钠（Na）位于第几周期第几族？', options: ['第 3 周期第 ⅠA 族', '第 2 周期第 ⅠA 族', '第 3 周期第 ⅡA 族', '第 4 周期第 ⅠA 族'], answer: 0, explain: '电子排布 [Ne]3s¹，3 个电子层。' }
  ]);

  Q.add('titration', [
    { q: '25°C 强酸滴定强碱，等当点 pH = ?', options: ['7', '<7', '>7', '14'], answer: 0, explain: '生成强酸强碱盐，不水解。' },
    { q: '等当点附近加一滴碱，pH 会？', options: ['突变跃升', '缓慢变化', '不变', '下降'], answer: 0, explain: '等当点附近存在 pH 突跃。' }
  ]);

  Q.add('pythagoras', [
    { q: '直角边 3 和 4，斜边是？', options: ['5', '7', '12', '√7'], answer: 0, explain: 'c = √(3²+4²) = 5。' }
  ]);

  Q.add('linear-function', [
    { q: 'y = 2x - 4 与 x 轴交点是？', options: ['(2, 0)', '(0, -4)', '(-2, 0)', '(4, 0)'], answer: 0, explain: '令 y=0 → x=2。' }
  ]);

  Q.add('lever-balance', [
    { q: '杠杆平衡条件是？', options: ['F₁L₁ = F₂L₂', 'F₁ + F₂ = 0', 'F₁/L₁ = F₂/L₂', 'F₁L₂ = F₂L₁'], answer: 0, explain: '动力×动力臂 = 阻力×阻力臂。' },
    { q: '用长撬棍撬石头更省力，因为？', options: ['增大了动力臂', '增大了阻力', '减小了重力', '改变了方向'], answer: 0, explain: '动力臂越长越省力。' }
  ]);

  Q.add('ohms-law', [
    { q: '电压 6V、电阻 3Ω，电流是？', options: ['2 A', '18 A', '0.5 A', '9 A'], answer: 0, explain: 'I = U/R = 2A。' },
    { q: '电阻增大（电压不变），电流会？', options: ['变小', '变大', '不变', '先大后小'], answer: 0, explain: 'I 与 R 成反比。' }
  ]);

  Q.add('buoyancy', [
    { q: '浮力大小等于？', options: ['排开液体的重力', '物体重力', '液体总重', '容器重力'], answer: 0, explain: '阿基米德原理：F浮 = ρ液gV排。' },
    { q: '物体漂浮时，浮力与重力关系？', options: ['浮力 = 重力', '浮力 > 重力', '浮力 < 重力', '没有关系'], answer: 0, explain: '漂浮是平衡状态，二力相等。' }
  ]);

  Q.add('metal-displacement', [
    { q: '铁钉放入硫酸铜溶液，会？', options: ['铁表面析出红色铜', '没有反应', '铁溶解变铜离子', '溶液变黄'], answer: 0, explain: 'Fe 比 Cu 活泼，发生置换。' },
    { q: '铜片放入硫酸亚铁溶液，会？', options: ['不反应', '铜溶解', '析出铁', '溶液变蓝'], answer: 0, explain: 'Cu 不如 Fe 活泼，不能置换。' }
  ]);

  Q.add('equation-balance', [
    { q: '配平 H₂ + O₂ → H₂O，O₂ 系数是？', options: ['1', '2', '3', '4'], answer: 0, explain: '2H₂ + O₂ = 2H₂O。' },
    { q: '配平方程式的依据是？', options: ['质量守恒（原子种类数目不变）', '体积守恒', '能量守恒', '美观对称'], answer: 0, explain: '化学反应前后原子守恒。' }
  ]);
})();
