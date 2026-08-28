/* registry-math.js — 数学知识点注册表（对齐义务教育+普通高中课标框架）
 * type: calc=参数计算件, graph=函数图像件, concept=概念讲解件
 * 每条含检测题；calc/graph 条目计算走真实公式。
 */
(function () {
  const R = window.Reg, C = window.SCI.CONST;

  /* ---------- 初中 · 数与式 ---------- */
  R.add('math_j1_01', 'math', '初中', '有理数的加减', '数与式', 'calc', {
    formula: 'a + b,\\quad a - b',
    params: [{ k: 'a', label: '数 a', min: -20, max: 20, step: 1, v: 5 }, { k: 'b', label: '数 b', min: -20, max: 20, step: 1, v: -3 }],
    fn: p => [['a + b', p.a + p.b], ['a - b', p.a - p.b], ['|a| + |b|', Math.abs(p.a) + Math.abs(p.b)]],
    hint: '负数参与运算时注意符号法则：减去一个数等于加上它的相反数。',
    quiz: { q: '(-5) + 3 = ?', opts: ['-2', '-8', '2', '8'], a: 0, e: '异号相加取绝对值较大者的符号，5-3=2，符号为负。' }
  });
  R.add('math_j1_02', 'math', '初中', '有理数的乘除与乘方', '数与式', 'calc', {
    formula: 'a \\times b,\\quad a \\div b,\\quad a^n',
    params: [{ k: 'a', label: '底数 a', min: -10, max: 10, step: 1, v: -2 }, { k: 'b', label: '数 b', min: -10, max: 10, step: 1, v: 3 }, { k: 'n', label: '指数 n', min: 1, max: 6, step: 1, v: 3 }],
    fn: p => [['a × b', p.a * p.b], ['a ÷ b（b≠0）', p.b === 0 ? '除数不能为 0' : UI.fmt(p.a / p.b, 3)], ['a 的 n 次方', Math.pow(p.a, p.n)]],
    quiz: { q: '(-2)³ = ?', opts: ['-8', '8', '-6', '6'], a: 0, e: '负数的奇次幂为负。' }
  });
  R.add('math_j1_03', 'math', '初中', '绝对值与相反数', '数与式', 'calc', {
    formula: '|a|,\\quad -a',
    params: [{ k: 'a', label: '数 a', min: -20, max: 20, step: 1, v: -7 }],
    fn: p => [['|a|', Math.abs(p.a)], ['相反数 -a', -p.a], ['a + (-a)', 0]],
    quiz: { q: '|-9| = ?', opts: ['9', '-9', '0', '1/9'], a: 0, e: '绝对值是到原点的距离，非负。' }
  });
  R.add('math_j1_04', 'math', '初中', '科学记数法', '数与式', 'calc', {
    formula: 'N = a \\times 10^n\\ (1 \\le a < 10)',
    params: [{ k: 'N', label: '数 N', min: 1000, max: 999999999, step: 1000, v: 384000 }],
    fn: p => {
      const e = Math.floor(Math.log10(Math.abs(p.N) || 1));
      const a = p.N / Math.pow(10, e);
      return [['科学记数法', UI.fmt(a, 3) + ' × 10^' + e], ['指数 n', e]];
    },
    quiz: { q: '384000 用科学记数法表示，指数是？', opts: ['5', '4', '6', '3'], a: 0, e: '3.84×10⁵，小数点左移 5 位。' }
  });
  R.add('math_j2_01', 'math', '初中', '整式乘法（单项式×多项式）', '数与式', 'calc', {
    formula: 'k(ax + b) = kax + kb',
    params: [{ k: 'k', label: '系数 k', min: -5, max: 5, step: 1, v: 2 }, { k: 'a', label: 'a', min: -5, max: 5, step: 1, v: 3 }, { k: 'b', label: 'b', min: -5, max: 5, step: 1, v: -4 }],
    fn: p => [['展开结果', (p.k * p.a) + 'x ' + (p.k * p.b >= 0 ? '+ ' + p.k * p.b : '- ' + Math.abs(p.k * p.b))], ['x 的系数', p.k * p.a], ['常数项', p.k * p.b]],
    quiz: { q: '2(3x - 4) 展开后常数项是？', opts: ['-8', '6', '8', '-4'], a: 0, e: '2×(-4)=-8。' }
  });
  R.add('math_j2_02', 'math', '初中', '乘法公式（平方差/完全平方）', '数与式', 'calc', {
    formula: '(a+b)(a-b)=a^2-b^2,\\quad (a\\pm b)^2=a^2\\pm 2ab+b^2',
    params: [{ k: 'a', label: 'a', min: -10, max: 10, step: 1, v: 5 }, { k: 'b', label: 'b', min: -10, max: 10, step: 1, v: 3 }],
    fn: p => [['(a+b)(a-b)', p.a * p.a - p.b * p.b], ['(a+b)²', (p.a + p.b) * (p.a + p.b)], ['(a-b)²', (p.a - p.b) * (p.a - p.b)]],
    quiz: { q: '(x+3)(x-3) = ?', opts: ['x²-9', 'x²+9', 'x²-6x+9', 'x²-6'], a: 0, e: '平方差公式 a²-b²。' }
  });
  R.add('math_j2_03', 'math', '初中', '因式分解（提公因式/公式法）', '数与式', 'concept', {
    text: '因式分解是把多项式化为几个整式乘积的形式，与整式乘法互逆。常用方法：提公因式法（先找公共因子）、公式法（平方差、完全平方）、十字相乘。分解要彻底，结果必须是乘积形式。',
    quiz: { q: 'x² - 4 因式分解为？', opts: ['(x+2)(x-2)', '(x-2)²', 'x(x-4)', '(x+4)(x-1)'], a: 0, e: '平方差公式。' }
  });
  R.add('math_j2_04', 'math', '初中', '分式运算', '数与式', 'calc', {
    formula: '\\frac{a}{b} \\pm \\frac{c}{d} = \\frac{ad \\pm cb}{bd}',
    params: [{ k: 'a', label: '分子 a', min: -10, max: 10, step: 1, v: 1 }, { k: 'b', label: '分母 b', min: 1, max: 10, step: 1, v: 2 }, { k: 'c', label: '分子 c', min: -10, max: 10, step: 1, v: 1 }, { k: 'd', label: '分母 d', min: 1, max: 10, step: 1, v: 3 }],
    fn: p => [['a/b + c/d', UI.fmt(p.a / p.b + p.c / p.d, 4)], ['a/b - c/d', UI.fmt(p.a / p.b - p.c / p.d, 4)], ['a/b × c/d', UI.fmt(p.a * p.c / (p.b * p.d), 4)], ['通分后分子和', p.a * p.d + p.c * p.b], ['公分母', p.b * p.d]],
    quiz: { q: '1/2 + 1/3 = ?', opts: ['5/6', '2/5', '1/5', '2/6'], a: 0, e: '通分：3/6+2/6=5/6。' }
  });
  R.add('math_j3_01', 'math', '初中', '二次根式', '数与式', 'calc', {
    formula: '\\sqrt{a}\\ (a \\ge 0)',
    params: [{ k: 'a', label: '被开方数 a', min: 0, max: 200, step: 1, v: 50 }],
    fn: p => [['√a', UI.fmt(Math.sqrt(p.a), 4)], ['化简', simplifyRoot(p.a)], ['(√a)²', p.a]],
    hint: '如 √50 = 5√2。',
    quiz: { q: '√48 化简为？', opts: ['4√3', '2√12', '6√2', '3√6'], a: 0, e: '48=16×3，√16=4。' }
  });
  function simplifyRoot(n) {
    if (n <= 0) return '0';
    let out = 1, m = n;
    for (let i = 2; i * i <= m; i++) {
      while (m % (i * i) === 0) { out *= i; m /= i * i; }
    }
    return m === 1 ? String(out) : out === 1 ? '√' + m : out + '√' + m;
  }
  R.add('math_j3_02', 'math', '初中', '实数与数轴', '数与式', 'concept', {
    text: '实数包括有理数和无理数，与数轴上的点一一对应。无理数是无限不循环小数（如 √2、π）。数轴上右边的数总比左边的大；原点表示 0，互为相反数的两点关于原点对称。',
    quiz: { q: '下列哪个是无理数？', opts: ['√2', '1/3', '0.333…', '√9'], a: 0, e: '√2 是无限不循环小数；√9=3 是有理数。' }
  });

  /* ---------- 初中 · 方程与不等式 ---------- */
  R.add('math_j4_01', 'math', '初中', '一元一次方程', '方程与不等式', 'calc', {
    formula: 'ax + b = 0 \\Rightarrow x = -\\frac{b}{a}',
    params: [{ k: 'a', label: '系数 a', min: -10, max: 10, step: 1, v: 2 }, { k: 'b', label: '常数 b', min: -20, max: 20, step: 1, v: -6 }],
    fn: p => [['方程', p.a + 'x ' + (p.b >= 0 ? '+ ' + p.b : '- ' + Math.abs(p.b)) + ' = 0'], ['解 x', p.a === 0 ? (p.b === 0 ? '任意实数' : '无解') : UI.fmt(-p.b / p.a, 4)]],
    quiz: { q: '2x - 6 = 0 的解是？', opts: ['x=3', 'x=-3', 'x=6', 'x=2'], a: 0, e: '移项 2x=6。' }
  });
  R.add('math_j4_02', 'math', '初中', '二元一次方程组', '方程与不等式', 'calc', {
    formula: '\\begin{cases}x+y=s\\\\x-y=d\\end{cases} \\Rightarrow x=\\frac{s+d}{2}',
    params: [{ k: 's', label: '两数和 s', min: -20, max: 20, step: 1, v: 10 }, { k: 'd', label: '两数差 d', min: -20, max: 20, step: 1, v: 4 }],
    fn: p => [['x', UI.fmt((p.s + p.d) / 2, 2)], ['y', UI.fmt((p.s - p.d) / 2, 2)], ['验证 x+y', p.s], ['验证 x-y', p.d]],
    hint: '这是"和差问题"模型：鸡兔同笼类问题的本质。',
    quiz: { q: 'x+y=10, x-y=4，则 x=?', opts: ['7', '3', '6', '5'], a: 0, e: 'x=(10+4)/2=7。' }
  });
  R.add('math_j5_01', 'math', '初中', '一元二次方程求根', '方程与不等式', 'calc', {
    formula: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}',
    params: [{ k: 'a', label: 'a', min: -5, max: 5, step: 1, v: 1 }, { k: 'b', label: 'b', min: -10, max: 10, step: 1, v: -4 }, { k: 'c', label: 'c', min: -10, max: 10, step: 1, v: 3 }],
    fn: p => {
      if (p.a === 0) return [['提示', 'a=0 退化为一次方程']];
      const r = SCI.mathx.quadraticRoots(p.a, p.b, p.c);
      const d = SCI.mathx.quadraticDiscriminant(p.a, p.b, p.c);
      const rows = [['判别式 Δ', d]];
      if (r.type === 'two') rows.push(['x₁', UI.fmt(r.roots[0], 4)], ['x₂', UI.fmt(r.roots[1], 4)], ['x₁+x₂', UI.fmt(-p.b / p.a, 4)], ['x₁·x₂', UI.fmt(p.c / p.a, 4)]);
      else if (r.type === 'one') rows.push(['x（重根）', UI.fmt(r.roots[0], 4)]);
      else rows.push(['实数解', '无（Δ<0）']);
      return rows;
    },
    quiz: { q: 'x²-4x+3=0 的两根之和是？', opts: ['4', '3', '-4', '1'], a: 0, e: '韦达定理：x₁+x₂=-b/a=4。' }
  });
  R.add('math_j5_02', 'math', '初中', '韦达定理', '方程与不等式', 'calc', {
    formula: 'x_1+x_2 = -\\frac{b}{a},\\quad x_1 x_2 = \\frac{c}{a}',
    params: [{ k: 'x1', label: '根 x₁', min: -10, max: 10, step: 1, v: 1 }, { k: 'x2', label: '根 x₂', min: -10, max: 10, step: 1, v: 3 }],
    fn: p => [['两根之和', p.x1 + p.x2], ['两根之积', p.x1 * p.x2], ['对应方程', 'x² ' + (-(p.x1 + p.x2) >= 0 ? '+ ' + (-(p.x1 + p.x2)) : '- ' + Math.abs(-(p.x1 + p.x2))) + 'x ' + (p.x1 * p.x2 >= 0 ? '+ ' + p.x1 * p.x2 : '- ' + Math.abs(p.x1 * p.x2)) + ' = 0']],
    quiz: { q: '两根为 2 和 5，则两根之积是？', opts: ['10', '7', '2.5', '3'], a: 0, e: 'x₁x₂=10。' }
  });
  R.add('math_j5_03', 'math', '初中', '分式方程', '方程与不等式', 'calc', {
    formula: '\\frac{k}{x} = m \\Rightarrow x = \\frac{k}{m}',
    params: [{ k: 'k', label: '分子 k', min: -20, max: 20, step: 1, v: 12 }, { k: 'm', label: '右边 m', min: -10, max: 10, step: 1, v: 3 }],
    fn: p => [['解 x', p.m === 0 ? (p.k === 0 ? '任意非零实数' : '无解') : UI.fmt(p.k / p.m, 4)], ['验根', 'x=' + (p.m === 0 ? '—' : UI.fmt(p.k / p.m, 2)) + ' 代入分母不为 0']],
    quiz: { q: '分式方程必须做什么？', opts: ['验根', '配方', '换元', '两边平方'], a: 0, e: '去分母可能产生增根，必须检验分母不为 0。' }
  });
  R.add('math_j6_01', 'math', '初中', '一元一次不等式', '方程与不等式', 'calc', {
    formula: 'ax + b > 0',
    params: [{ k: 'a', label: '系数 a', min: -10, max: 10, step: 1, v: 2 }, { k: 'b', label: '常数 b', min: -20, max: 20, step: 1, v: -6 }],
    fn: p => {
      if (p.a === 0) return [['解集', p.b > 0 ? '全体实数' : '空集']];
      const t = -p.b / p.a;
      return [['临界值', UI.fmt(t, 3)], ['解集', p.a > 0 ? 'x > ' + UI.fmt(t, 3) : 'x < ' + UI.fmt(t, 3)], ['注意', p.a < 0 ? '两边除以负数，不等号变向' : '不等号方向不变']];
    },
    quiz: { q: '-2x > 4 的解集是？', opts: ['x < -2', 'x > -2', 'x < 2', 'x > 2'], a: 0, e: '除以负数 -2，不等号变向。' }
  });
  R.add('math_j6_02', 'math', '初中', '不等式组', '方程与不等式', 'calc', {
    formula: '\\begin{cases}x > a\\\\x < b\\end{cases} \\Rightarrow a < x < b',
    params: [{ k: 'a', label: '下界 a', min: -10, max: 10, step: 1, v: -2 }, { k: 'b', label: '上界 b', min: -10, max: 10, step: 1, v: 5 }],
    fn: p => [['解集', p.a < p.b ? p.a + ' < x < ' + p.b : '空集（无公共部分）'], ['整数解个数', p.a < p.b ? Math.max(0, Math.ceil(p.b) - Math.floor(p.a) - 1) : 0]],
    quiz: { q: 'x>1 且 x<4 的整数解有几个？', opts: ['2（即2、3）', '3', '1', '4'], a: 0, e: '整数解为 2、3。' }
  });

  /* ---------- 初中 · 函数 ---------- */
  R.add('math_j7_01', 'math', '初中', '平面直角坐标系', '函数', 'calc', {
    formula: 'P(x, y)',
    params: [{ k: 'x', label: '横坐标 x', min: -10, max: 10, step: 1, v: -3 }, { k: 'y', label: '纵坐标 y', min: -10, max: 10, step: 1, v: 4 }],
    fn: p => [['象限', p.x > 0 && p.y > 0 ? '第一象限' : p.x < 0 && p.y > 0 ? '第二象限' : p.x < 0 && p.y < 0 ? '第三象限' : p.x > 0 && p.y < 0 ? '第四象限' : '坐标轴上'], ['到 x 轴距离', Math.abs(p.y)], ['到 y 轴距离', Math.abs(p.x)], ['到原点距离', UI.fmt(Math.sqrt(p.x * p.x + p.y * p.y), 3)]],
    quiz: { q: '点(-3, 4)在第几象限？', opts: ['二', '一', '三', '四'], a: 0, e: 'x负y正为第二象限。' }
  });
  R.add('math_j7_02', 'math', '初中', '变量与函数概念', '函数', 'concept', {
    text: '在一个变化过程中，数值发生变化的量叫变量。如果对于自变量 x 的每一个值，因变量 y 都有唯一确定的值与之对应，那么 y 是 x 的函数。函数表示法：解析式法、列表法、图像法。',
    quiz: { q: '函数要求每个 x 对应几个 y？', opts: ['唯一 1 个', '至少 1 个', '2 个', '任意多个'], a: 0, e: '唯一对应是函数定义的核心。' }
  });
  R.add('math_j7_03', 'math', '初中', '正比例函数', '函数', 'calc', {
    formula: 'y = kx\\ (k \\ne 0)',
    params: [{ k: 'k', label: '比例系数 k', min: -5, max: 5, step: 0.5, v: 2 }, { k: 'x', label: '取点 x', min: -5, max: 5, step: 0.5, v: 3 }],
    fn: p => [['过点 (0,0) 与 (1,' + p.k + ')', '直线过原点'], ['x 处的 y', UI.fmt(p.k * p.x, 2)], ['k>0 时', '图像经过一、三象限，y 随 x 增大而增大']],
    quiz: { q: '正比例函数图像必过哪个点？', opts: ['原点', '(1,0)', '(0,1)', '(-1,-1)'], a: 0, e: 'y=kx 过 (0,0)。' }
  });
  R.add('math_j7_04', 'math', '初中', '反比例函数', '函数', 'calc', {
    formula: 'y = \\frac{k}{x}\\ (k \\ne 0)',
    params: [{ k: 'k', label: 'k', min: -10, max: 10, step: 1, v: 6 }, { k: 'x', label: '取点 x', min: -10, max: 10, step: 0.5, v: 2 }],
    fn: p => [['x 处的 y', p.x === 0 ? 'x 不能为 0' : UI.fmt(p.k / p.x, 3)], ['矩形面积 |xy|', Math.abs(p.k)], ['k>0 时象限', '一、三象限']],
    quiz: { q: 'y=6/x 图像上任意点与坐标轴围成矩形面积是？', opts: ['6', '3', '12', '随点变化'], a: 0, e: '|xy|=|k| 恒为 6。' }
  });
  R.add('math_j8_01', 'math', '初中', '二次函数最值问题', '函数', 'calc', {
    formula: 'y_{\\text{最值}} = \\frac{4ac-b^2}{4a}',
    params: [{ k: 'a', label: 'a', min: -5, max: 5, step: 1, v: 1 }, { k: 'b', label: 'b', min: -10, max: 10, step: 1, v: -4 }, { k: 'c', label: 'c', min: -10, max: 10, step: 1, v: 3 }],
    fn: p => {
      if (p.a === 0) return [['提示', 'a=0 不是二次函数']];
      const v = SCI.mathx.quadraticVertex(p.a, p.b, p.c);
      return [['顶点（最值点）', '(' + UI.fmt(v.x, 2) + ', ' + UI.fmt(v.y, 2) + ')'], ['最值', UI.fmt(v.y, 2) + '（' + (p.a > 0 ? '最小值' : '最大值') + '）']];
    },
    quiz: { q: 'y=x²-4x+3 的最小值是？', opts: ['-1', '3', '0', '1'], a: 0, e: '顶点纵坐标 -1。' }
  });

  /* ---------- 初中 · 几何 ---------- */
  R.add('math_j9_01', 'math', '初中', '角度与互补互余', '图形与几何', 'calc', {
    formula: '\\alpha + \\beta = 90^\\circ\\ (互余),\\quad \\alpha + \\beta = 180^\\circ\\ (互补)',
    params: [{ k: 'a', label: '角 α (°)', min: 0, max: 180, step: 1, v: 35 }],
    fn: p => [['α 的余角', p.a <= 90 ? (90 - p.a) + '°' : '无（α>90°）'], ['α 的补角', (180 - p.a) + '°']],
    quiz: { q: '52° 的补角是？', opts: ['128°', '38°', '148°', '52°'], a: 0, e: '180-52=128。' }
  });
  R.add('math_j9_02', 'math', '初中', '三角形内角和', '图形与几何', 'calc', {
    formula: '\\angle A + \\angle B + \\angle C = 180^\\circ',
    params: [{ k: 'A', label: '∠A (°)', min: 1, max: 178, step: 1, v: 60 }, { k: 'B', label: '∠B (°)', min: 1, max: 178, step: 1, v: 50 }],
    fn: p => [['∠C', p.A + p.B < 180 ? (180 - p.A - p.B) + '°' : '三角形不存在（A+B≥180°）'], ['三角形类型', p.A === p.B && p.B === 60 ? '等边三角形' : p.A === p.B || p.B === 180 - p.A - p.B || p.A === 180 - p.A - p.B ? '等腰三角形' : '一般三角形']],
    quiz: { q: '三角形两个角 45°、45°，第三个角是？', opts: ['90°', '45°', '135°', '60°'], a: 0, e: '180-45-45=90。' }
  });
  R.add('math_j9_03', 'math', '初中', '多边形内角和', '图形与几何', 'calc', {
    formula: '(n-2) \\times 180^\\circ',
    params: [{ k: 'n', label: '边数 n', min: 3, max: 12, step: 1, v: 5 }],
    fn: p => [['内角和', (p.n - 2) * 180 + '°'], ['每个内角（正多边形）', UI.fmt((p.n - 2) * 180 / p.n, 1) + '°'], ['外角和', '360°（任意凸多边形）']],
    quiz: { q: '六边形内角和是？', opts: ['720°', '540°', '900°', '360°'], a: 0, e: '(6-2)×180=720。' }
  });
  R.add('math_j9_04', 'math', '初中', '全等三角形判定', '图形与几何', 'concept', {
    text: '全等三角形判定方法：SSS（三边）、SAS（两边及夹角）、ASA（两角及夹边）、AAS（两角及对边）、HL（直角三角形的斜边和直角边）。注意：AAA 只能判定相似，SSA 不能作为判定依据。全等三角形对应边相等、对应角相等。',
    quiz: { q: '下列哪组不能判定全等？', opts: ['AAA', 'SAS', 'ASA', 'SSS'], a: 0, e: 'AAA 只能判定形状相同（相似）。' }
  });
  R.add('math_j10_01', 'math', '初中', '相似三角形', '图形与几何', 'calc', {
    formula: '\\frac{a_1}{a_2} = \\frac{b_1}{b_2} = k\\ (相似比)',
    params: [{ k: 'k', label: '相似比 k', min: 0.5, max: 3, step: 0.1, v: 2 }, { k: 'a', label: '小三角形边 a', min: 1, max: 10, step: 1, v: 3 }],
    fn: p => [['对应边', UI.fmt(p.a * p.k, 2)], ['周长比', UI.fmt(p.k, 2)], ['面积比', UI.fmt(p.k * p.k, 2)]],
    hint: '面积比 = 相似比的平方。',
    quiz: { q: '相似比为 3，则面积比是？', opts: ['9', '3', '6', '27'], a: 0, e: '面积比 = k² = 9。' }
  });
  R.add('math_j11_01', 'math', '初中', '平行四边形', '图形与几何', 'calc', {
    formula: 'S = 底 \\times 高,\\quad C = 2(a+b)',
    params: [{ k: 'a', label: '边 a', min: 1, max: 10, step: 1, v: 5 }, { k: 'b', label: '边 b', min: 1, max: 10, step: 1, v: 3 }, { k: 'h', label: '高 h', min: 1, max: 10, step: 1, v: 4 }],
    fn: p => [['面积', p.a * p.h], ['周长', 2 * (p.a + p.b)], ['性质', '对边平行且相等，对角线互相平分']],
    quiz: { q: '平行四边形对角线的关系是？', opts: ['互相平分', '相等', '垂直', '无关系'], a: 0, e: '对角线互相平分（矩形才相等）。' }
  });
  R.add('math_j11_02', 'math', '初中', '圆的计算', '图形与几何', 'calc', {
    formula: 'C = 2\\pi r,\\quad S = \\pi r^2,\\quad l = \\frac{n\\pi r}{180}',
    params: [{ k: 'r', label: '半径 r', min: 1, max: 10, step: 1, v: 3 }, { k: 'n', label: '圆心角 n (°)', min: 1, max: 360, step: 1, v: 60 }],
    fn: p => [['周长', UI.fmt(2 * Math.PI * p.r, 2)], ['面积', UI.fmt(Math.PI * p.r * p.r, 2)], ['弧长', UI.fmt(p.n * Math.PI * p.r / 180, 2)], ['扇形面积', UI.fmt(p.n * Math.PI * p.r * p.r / 360, 2)]],
    quiz: { q: '半径为 2 的圆面积是？', opts: ['4π', '2π', '8π', 'π'], a: 0, e: 'S=πr²=4π。' }
  });
  R.add('math_j11_03', 'math', '初中', '圆周角定理', '图形与几何', 'concept', {
    text: '一条弧所对的圆周角等于它所对圆心角的一半。同弧所对的圆周角相等。半圆（直径）所对的圆周角是直角。这是解决圆中角度问题的核心定理。',
    quiz: { q: '圆心角 100°，同弧的圆周角是？', opts: ['50°', '100°', '200°', '25°'], a: 0, e: '圆周角 = 圆心角的一半。' }
  });
  R.add('math_j12_01', 'math', '初中', '图形变换', '图形与几何', 'calc', {
    formula: 'P(x,y) \\to 平移(a,b): (x+a, y+b);\\ 关于x轴对称: (x,-y)',
    params: [{ k: 'x', label: '点 x', min: -10, max: 10, step: 1, v: 2 }, { k: 'y', label: '点 y', min: -10, max: 10, step: 1, v: 3 }],
    fn: p => [['关于 x 轴对称', '(' + p.x + ', ' + (-p.y) + ')'], ['关于 y 轴对称', '(' + (-p.x) + ', ' + p.y + ')'], ['关于原点对称', '(' + (-p.x) + ', ' + (-p.y) + ')'], ['向右平移 3、向上平移 2', '(' + (p.x + 3) + ', ' + (p.y + 2) + ')']],
    quiz: { q: '(2,3) 关于 x 轴对称的点是？', opts: ['(2,-3)', '(-2,3)', '(-2,-3)', '(3,2)'], a: 0, e: 'x 不变，y 变相反数。' }
  });
  R.add('math_j12_02', 'math', '初中', '锐角三角函数', '图形与几何', 'calc', {
    formula: '\\sin A = \\frac{对边}{斜边},\\ \\cos A = \\frac{邻边}{斜边},\\ \\tan A = \\frac{对边}{邻边}',
    params: [{ k: 'A', label: '角 A (°)', min: 1, max: 89, step: 1, v: 30 }],
    fn: p => {
      const t = SCI.mathx.trigFromDeg(p.A);
      return [['sin A', UI.fmt(t.sin, 4)], ['cos A', UI.fmt(t.cos, 4)], ['tan A', UI.fmt(t.tan, 4)]];
    },
    quiz: { q: 'sin 60° = ?', opts: ['√3/2', '1/2', '√2/2', '1'], a: 0, e: '特殊角三角函数值。' }
  });
  R.add('math_j13_01', 'math', '初中', '投影与视图', '图形与几何', 'concept', {
    text: '三视图：主视图（正前方看）、左视图（正左方看）、俯视图（正上方看）。口诀：长对正、高平齐、宽相等。由三视图可还原立体图形，是中考常考点。',
    quiz: { q: '球的三视图是？', opts: ['三个圆', '三个矩形', '两圆一方', '三个点'], a: 0, e: '任何方向看球都是圆。' }
  });

  /* ---------- 初中 · 统计与概率 ---------- */
  R.add('math_j14_01', 'math', '初中', '平均数与众数中位数', '统计与概率', 'calc', {
    formula: '\\bar{x} = \\frac{1}{n}\\sum x_i',
    params: [{ k: 'a', label: '数1', min: 0, max: 20, step: 1, v: 4 }, { k: 'b', label: '数2', min: 0, max: 20, step: 1, v: 7 }, { k: 'c', label: '数3', min: 0, max: 20, step: 1, v: 7 }, { k: 'd', label: '数4', min: 0, max: 20, step: 1, v: 10 }],
    fn: p => {
      const arr = [p.a, p.b, p.c, p.d].sort((x, y) => x - y);
      const mean = arr.reduce((s, v) => s + v, 0) / 4;
      const cnt = {};
      arr.forEach(v => cnt[v] = (cnt[v] || 0) + 1);
      let mode = arr[0], mc = 0;
      for (const k in cnt) if (cnt[k] > mc) { mc = cnt[k]; mode = k; }
      return [['平均数', UI.fmt(mean, 2)], ['中位数', UI.fmt((arr[1] + arr[2]) / 2, 1)], ['众数', mode]];
    },
    quiz: { q: '数据 2,3,3,5,7 的中位数是？', opts: ['3', '4', '5', '3.5'], a: 0, e: '排序后最中间的数。' }
  });
  R.add('math_j14_02', 'math', '初中', '频率与概率初步', '统计与概率', 'calc', {
    formula: 'P = \\frac{事件数}{总等可能结果数}',
    params: [{ k: 'win', label: '有利结果数', min: 0, max: 20, step: 1, v: 1 }, { k: 'total', label: '总结果数', min: 1, max: 20, step: 1, v: 6 }],
    fn: p => [['概率', p.win > p.total ? '有利数不能超过总数' : UI.fmt(p.win / p.total, 4)], ['百分比', UI.fmt(p.win / p.total * 100, 1) + '%']],
    quiz: { q: '掷骰子，掷出偶数的概率是？', opts: ['1/2', '1/3', '1/6', '2/3'], a: 0, e: '偶数 2、4、6 共 3 个，3/6=1/2。' }
  });
  R.add('math_j14_03', 'math', '初中', '列举法求概率', '统计与概率', 'concept', {
    text: '当事件涉及两步或两步以上时，用列表法（两步）或树状图（两步以上）列举所有等可能结果。例如掷两枚硬币：正反、正正、反正、反反共 4 种等可能结果。列举要做到不重不漏。',
    quiz: { q: '掷两枚硬币，一正一反的概率是？', opts: ['1/2', '1/4', '1/3', '3/4'], a: 0, e: '正反、反正共 2 种，占 4 种中的 2 种。' }
  });

  /* ---------- 高中 · 集合与逻辑 ---------- */
  R.add('math_g1_01', 'math', '高中', '集合的运算', '集合与逻辑', 'calc', {
    formula: 'A \\cap B,\\ A \\cup B,\\ \\complement_U A',
    params: [{ k: 'a', label: 'A 的上界(1..a)', min: 1, max: 10, step: 1, v: 5 }, { k: 'b', label: 'B 的上界(1..b)', min: 1, max: 10, step: 1, v: 3 }],
    fn: p => {
      const A = [], B = [];
      for (let i = 1; i <= p.a; i++) A.push(i);
      for (let i = 1; i <= p.b; i++) B.push(i);
      const inter = A.filter(x => B.indexOf(x) >= 0);
      const uni = Array.from(new Set(A.concat(B)));
      return [['A ∩ B', '{' + inter.join(',') + '}'], ['A ∪ B', '{' + uni.join(',') + '}'], ['元素个数 |A∪B|', uni.length]];
    },
    quiz: { q: '{1,2,3}∩{2,3,4} = ?', opts: ['{2,3}', '{1,2,3,4}', '{1,4}', '{3}'], a: 0, e: '交集是公共元素。' }
  });
  R.add('math_g1_02', 'math', '高中', '充分必要条件', '集合与逻辑', 'concept', {
    text: '若 p ⇒ q，则 p 是 q 的充分条件，q 是 p 的必要条件。若 p ⇒ q 且 q ⇒ p，则互为充要条件。判断方法：看两个命题对应集合的包含关系，小范围是大范围的充分条件。',
    quiz: { q: '"x=2"是"²=4"的什么条件？', opts: ['充分不必要', '必要不充分', '充要', '既不充分也不必要'], a: 0, e: 'x=2 能推出 x²=4，但 x²=4 还可能是 x=-2。' }
  });
  R.add('math_g1_03', 'math', '高中', '命题与量词', '集合与逻辑', 'concept', {
    text: '全称量词"∀"（任意）与存在量词"∃"（存在）。全称命题的否定是存在命题：¬(∀x, p(x)) = ∃x, ¬p(x)。否定时既要换量词，又要否定结论。',
    quiz: { q: '"所有三角形内角和为180°"的否定是？', opts: ['存在三角形内角和不等于180°', '所有三角形内角和不为180°', '有的三角形内角和为180°', '没有三角形'], a: 0, e: '全称变存在，结论取否。' }
  });

  /* ---------- 高中 · 函数 ---------- */
  R.add('math_g2_01', 'math', '高中', '幂函数', '函数', 'calc', {
    formula: 'y = x^a',
    params: [{ k: 'a', label: '指数 a', min: -2, max: 3, step: 0.5, v: 2 }, { k: 'x', label: 'x', min: 0.5, max: 5, step: 0.5, v: 2 }],
    fn: p => [['x^a', UI.fmt(Math.pow(p.x, p.a), 3)], ['过定点', '(1, 1)'], ['定义域要点', p.a < 0 ? 'x≠0' : 'x≥0（a 为分数时）']],
    quiz: { q: '所有幂函数图像都过哪个点？', opts: ['(1,1)', '(0,0)', '(0,1)', '(1,0)'], a: 0, e: '1 的任何次幂都是 1。' }
  });
  R.add('math_g2_02', 'math', '高中', '指数函数', '函数', 'calc', {
    formula: 'y = a^x\\ (a>0, a\\ne 1)',
    params: [{ k: 'a', label: '底数 a', min: 0.5, max: 3, step: 0.1, v: 2 }, { k: 'x', label: 'x', min: -3, max: 3, step: 0.5, v: 2 }],
    fn: p => [['a^x', UI.fmt(Math.pow(p.a, p.x), 3)], ['单调性', p.a > 1 ? '增函数' : '减函数'], ['恒过点', '(0, 1)'], ['值域', '(0, +∞)']],
    quiz: { q: 'y=2ˣ 是？', opts: ['增函数', '减函数', '先增后减', '常函数'], a: 0, e: '底数大于 1 时单调递增。' }
  });
  R.add('math_g2_03', 'math', '高中', '对数与对数函数', '函数', 'calc', {
    formula: '\\log_a N = b \\Leftrightarrow a^b = N',
    params: [{ k: 'a', label: '底数 a', min: 2, max: 10, step: 1, v: 2 }, { k: 'N', label: '真数 N', min: 1, max: 1024, step: 1, v: 8 }],
    fn: p => [['log_a(N)', UI.fmt(Math.log(p.N) / Math.log(p.a), 4)], ['ln N', UI.fmt(Math.log(p.N), 4)], ['lg N', UI.fmt(Math.log10(p.N), 4)]],
    quiz: { q: 'log₂8 = ?', opts: ['3', '2', '4', '8'], a: 0, e: '2³=8。' }
  });
  R.add('math_g2_04', 'math', '高中', '函数的单调性与奇偶性', '函数', 'concept', {
    text: '单调性：定义法（作差比较）或图像法判断增减。奇偶性：f(-x)=f(x) 为偶函数（图像关于 y 轴对称），f(-x)=-f(x) 为奇函数（关于原点对称）。判断奇偶性前必须先检查定义域是否关于原点对称。',
    quiz: { q: 'f(x)=x² 是？', opts: ['偶函数', '奇函数', '非奇非偶', '既奇又偶'], a: 0, e: 'f(-x)=(-x)²=x²=f(x)。' }
  });
  R.add('math_g2_05', 'math', '高中', '函数零点与方程根', '函数', 'calc', {
    formula: 'f(x)=0 的根 \\Leftrightarrow 图像与x轴交点',
    params: [{ k: 'a', label: 'a', min: -5, max: 5, step: 1, v: 1 }, { k: 'b', label: 'b', min: -10, max: 10, step: 1, v: -2 }, { k: 'c', label: 'c', min: -10, max: 10, step: 1, v: -3 }],
    fn: p => {
      const r = SCI.mathx.quadraticRoots(p.a, p.b, p.c);
      if (r.type === 'two') return [['零点', 'x=' + UI.fmt(r.roots[0], 3) + ' 和 x=' + UI.fmt(r.roots[1], 3)], ['零点个数', 2]];
      if (r.type === 'one') return [['零点', 'x=' + UI.fmt(r.roots[0], 3) + '（重根）'], ['零点个数', 1]];
      return [['零点', '无'], ['零点个数', 0]];
    },
    quiz: { q: '函数零点是？', opts: ['图像与x轴交点的横坐标', '一个点', 'y=0时的图像', '最小值'], a: 0, e: '零点是使 f(x)=0 的实数。' }
  });
  R.add('math_g2_06', 'math', '高中', '导数与单调性应用', '函数', 'calc', {
    formula: "f'(x)>0 递增;\\ f'(x)<0 递减",
    params: [{ k: 'a', label: 'f(x)=x³+ax 的 a', min: -6, max: 6, step: 1, v: -3 }, { k: 'x', label: 'x', min: -3, max: 3, step: 0.5, v: 1 }],
    fn: p => [["f'(x) = 3x² + a", 3 * p.x * p.x + p.a], ['x 处单调性', 3 * p.x * p.x + p.a > 0 ? '递增' : 3 * p.x * p.x + p.a < 0 ? '递减' : '驻点'], ['全局（a≥0 时）', p.a >= 0 ? '在 R 上递增' : '有两个极值点']],
    quiz: { q: "f'(x₀)=0 是极值点的什么条件？", opts: ['必要不充分', '充分不必要', '充要', '无关'], a: 0, e: '如 f=x³ 在 0 处导数为 0 但非极值。' }
  });

  /* ---------- 高中 · 数列 ---------- */
  R.add('math_g3_01', 'math', '高中', '等差数列', '数列', 'calc', {
    formula: 'a_n = a_1 + (n-1)d,\\quad S_n = \\frac{n(a_1+a_n)}{2}',
    params: [{ k: 'a1', label: '首项 a₁', min: -10, max: 10, step: 1, v: 2 }, { k: 'd', label: '公差 d', min: -5, max: 5, step: 1, v: 3 }, { k: 'n', label: '项数 n', min: 1, max: 20, step: 1, v: 10 }],
    fn: p => [['aₙ', p.a1 + (p.n - 1) * p.d], ['前 n 项和', UI.fmt(p.n * (2 * p.a1 + (p.n - 1) * p.d) / 2, 1)], ['中项性质', 'aₙ₋₁ + aₙ₊₁ = 2aₙ']],
    quiz: { q: '等差数列 1,4,7,… 第 10 项是？', opts: ['28', '30', '27', '31'], a: 0, e: 'a₁₀=1+9×3=28。' }
  });
  R.add('math_g3_02', 'math', '高中', '等比数列', '数列', 'calc', {
    formula: 'a_n = a_1 q^{n-1},\\quad S_n = \\frac{a_1(1-q^n)}{1-q}',
    params: [{ k: 'a1', label: '首项 a₁', min: -5, max: 5, step: 1, v: 1 }, { k: 'q', label: '公比 q', min: -3, max: 3, step: 0.5, v: 2 }, { k: 'n', label: '项数 n', min: 1, max: 12, step: 1, v: 5 }],
    fn: p => [['aₙ', UI.fmt(p.a1 * Math.pow(p.q, p.n - 1), 2)], ['前 n 项和', p.q === 1 ? UI.fmt(p.a1 * p.n, 1) : UI.fmt(p.a1 * (1 - Math.pow(p.q, p.n)) / (1 - p.q), 1)], ['无穷和（|q|<1）', Math.abs(p.q) < 1 ? UI.fmt(p.a1 / (1 - p.q), 3) : '不收敛']],
    quiz: { q: '等比数列 2,4,8,… 第 5 项是？', opts: ['32', '16', '64', '10'], a: 0, e: 'a₅=2×2⁴=32。' }
  });
  R.add('math_g3_03', 'math', '高中', '数列求和方法', '数列', 'concept', {
    text: '常用求和方法：公式法（等差/等比）、裂项相消（如 1/n(n+1) = 1/n - 1/(n+1)）、错位相减（等差×等比型）、倒序相加、分组求和。选择方法的关键是看通项的结构。',
    quiz: { q: '1/(n(n+1)) 裂项为？', opts: ['1/n - 1/(n+1)', '1/n + 1/(n+1)', '1/(2n)', 'n/(n+1)'], a: 0, e: '通分验证：(n+1-n)/(n(n+1))=1/(n(n+1))。' }
  });

  /* ---------- 高中 · 三角与向量 ---------- */
  R.add('math_g4_01', 'math', '高中', '弧度制', '三角与向量', 'calc', {
    formula: '\\pi\\ \\text{rad} = 180^\\circ',
    params: [{ k: 'deg', label: '角度 (°)', min: 0, max: 360, step: 5, v: 60 }],
    fn: p => [['弧度', UI.fmt(p.deg * Math.PI / 180, 4)], ['π 倍数表示', UI.fmt(p.deg / 180, 3) + 'π']],
    quiz: { q: '90° = ? 弧度', opts: ['π/2', 'π', 'π/4', '2π'], a: 0, e: '90/180×π=π/2。' }
  });
  R.add('math_g4_02', 'math', '高中', '三角恒等变换', '三角与向量', 'calc', {
    formula: '\\sin(\\alpha+\\beta)=\\sin\\alpha\\cos\\beta+\\cos\\alpha\\sin\\beta',
    params: [{ k: 'a', label: 'α (°)', min: 0, max: 90, step: 5, v: 30 }, { k: 'b', label: 'β (°)', min: 0, max: 90, step: 5, v: 45 }],
    fn: p => {
      const ta = SCI.mathx.trigFromDeg(p.a), tb = SCI.mathx.trigFromDeg(p.b);
      const s = ta.sin * tb.cos + ta.cos * tb.sin;
      return [['sin(α+β)', UI.fmt(s, 4)], ['验证 sin(' + (p.a + p.b) + '°)', UI.fmt(SCI.mathx.trigFromDeg(p.a + p.b).sin, 4)], ['cos(α+β)', UI.fmt(ta.cos * tb.cos - ta.sin * tb.sin, 4)]];
    },
    quiz: { q: 'sin75° = sin(45°+30°)，用公式展开后等于？', opts: ['(√6+√2)/4', '√3/2', '(√6-√2)/4', '1'], a: 0, e: '代入和角公式计算。' }
  });
  R.add('math_g4_03', 'math', '高中', '正弦定理与余弦定理', '三角与向量', 'calc', {
    formula: '\\frac{a}{\\sin A} = 2R;\\quad a^2 = b^2+c^2-2bc\\cos A',
    params: [{ k: 'b', label: '边 b', min: 1, max: 10, step: 1, v: 3 }, { k: 'c', label: '边 c', min: 1, max: 10, step: 1, v: 4 }, { k: 'A', label: '夹角 A (°)', min: 10, max: 170, step: 5, v: 60 }],
    fn: p => {
      const a = Math.sqrt(p.b * p.b + p.c * p.c - 2 * p.b * p.c * Math.cos(p.A * Math.PI / 180));
      return [['边 a', UI.fmt(a, 3)], ['判定形状', Math.abs(p.A - 90) < 0.1 ? '直角三角形' : p.A > 90 ? '钝角三角形' : '（可能锐角）']];
    },
    quiz: { q: 'b=3,c=4,A=60°，a²=?', opts: ['13', '25', '37', '7'], a: 0, e: '9+16-2×3×4×0.5=13。' }
  });
  R.add('math_g4_04', 'math', '高中', '平面向量运算', '三角与向量', 'calc', {
    formula: '\\vec{a}\\cdot\\vec{b} = x_1x_2 + y_1y_2 = |\\vec{a}||\\vec{b}|\\cos\\theta',
    params: [{ k: 'x1', label: 'a 的 x', min: -5, max: 5, step: 1, v: 3 }, { k: 'y1', label: 'a 的 y', min: -5, max: 5, step: 1, v: 1 }, { k: 'x2', label: 'b 的 x', min: -5, max: 5, step: 1, v: 2 }, { k: 'y2', label: 'b 的 y', min: -5, max: 5, step: 1, v: 2 }],
    fn: p => {
      const dot = p.x1 * p.x2 + p.y1 * p.y2;
      const ma = Math.sqrt(p.x1 * p.x1 + p.y1 * p.y1), mb = Math.sqrt(p.x2 * p.x2 + p.y2 * p.y2);
      return [['a·b', dot], ['|a|', UI.fmt(ma, 3)], ['|b|', UI.fmt(mb, 3)], ['夹角 θ', UI.fmt(Math.acos(dot / (ma * mb)) * 180 / Math.PI, 1) + '°', ], ['垂直判定', dot === 0 ? 'a ⊥ b' : '不垂直'], ['平行判定', p.x1 * p.y2 === p.y1 * p.x2 ? 'a ∥ b' : '不平行']];
    },
    quiz: { q: '(1,2)·(3,-1) = ?', opts: ['1', '5', '-1', '7'], a: 0, e: '1×3+2×(-1)=1。' }
  });

  /* ---------- 高中 · 解析几何 ---------- */
  R.add('math_g5_01', 'math', '高中', '直线方程', '解析几何', 'calc', {
    formula: 'y - y_0 = k(x - x_0)',
    params: [{ k: 'k', label: '斜率 k', min: -5, max: 5, step: 0.5, v: 2 }, { k: 'x0', label: '过点 x₀', min: -5, max: 5, step: 1, v: 1 }, { k: 'y0', label: '过点 y₀', min: -5, max: 5, step: 1, v: 3 }],
    fn: p => [['一般式', UI.fmt(p.k, 1) + 'x - y + ' + UI.fmt(p.y0 - p.k * p.x0, 1) + ' = 0'], ['y 轴截距', UI.fmt(p.y0 - p.k * p.x0, 1)], ['倾斜角', UI.fmt(Math.atan(p.k) * 180 / Math.PI, 1) + '°']],
    quiz: { q: '过(1,2)斜率为3的直线，y轴截距是？', opts: ['-1', '2', '5', '3'], a: 0, e: 'b=y₀-kx₀=2-3=-1。' }
  });
  R.add('math_g5_02', 'math', '高中', '圆的方程', '解析几何', 'calc', {
    formula: '(x-a)^2 + (y-b)^2 = r^2',
    params: [{ k: 'a', label: '圆心 x', min: -5, max: 5, step: 1, v: 1 }, { k: 'b', label: '圆心 y', min: -5, max: 5, step: 1, v: -2 }, { k: 'r', label: '半径 r', min: 1, max: 8, step: 1, v: 3 }],
    fn: p => [['标准方程', '(x' + (p.a >= 0 ? '-' + p.a : '+' + (-p.a)) + ')² + (y' + (p.b >= 0 ? '-' + p.b : '+' + (-p.b)) + ')² = ' + p.r * p.r], ['展开常数项', p.a * p.a + p.b * p.b - p.r * p.r], ['面积', UI.fmt(Math.PI * p.r * p.r, 2)]],
    quiz: { q: '圆心(0,0)半径5的圆方程是？', opts: ['x²+y²=25', 'x²+y²=5', '(x-5)²+y²=25', 'x+y=5'], a: 0, e: 'r²=25。' }
  });
  R.add('math_g5_03', 'math', '高中', '双曲线', '解析几何', 'calc', {
    formula: '\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1,\\ c^2 = a^2 + b^2',
    params: [{ k: 'a', label: 'a', min: 1, max: 6, step: 1, v: 3 }, { k: 'b', label: 'b', min: 1, max: 6, step: 1, v: 4 }],
    fn: p => {
      const c = Math.sqrt(p.a * p.a + p.b * p.b);
      return [['c', UI.fmt(c, 3)], ['离心率 e = c/a', UI.fmt(c / p.a, 3)], ['渐近线', 'y = ±' + UI.fmt(p.b / p.a, 2) + 'x'], ['焦点', '(±' + UI.fmt(c, 2) + ', 0)']];
    },
    quiz: { q: '双曲线离心率范围是？', opts: ['e > 1', '0<e<1', 'e=1', 'e≥1'], a: 0, e: 'c>a 恒成立。' }
  });
  R.add('math_g5_04', 'math', '高中', '抛物线', '解析几何', 'calc', {
    formula: 'y^2 = 2px,\\quad 焦点\\ (p/2, 0)',
    params: [{ k: 'p', label: 'p', min: 0.5, max: 8, step: 0.5, v: 2 }, { k: 'x', label: '点上 x', min: 0, max: 10, step: 1, v: 2 }],
    fn: p => [['焦点', '(' + UI.fmt(p.p / 2, 2) + ', 0)'], ['准线', 'x = ' + UI.fmt(-p.p / 2, 2)], ['x 处的焦半径', UI.fmt(p.x + p.p / 2, 2)]],
    quiz: { q: 'y²=8x 的焦点是？', opts: ['(2,0)', '(4,0)', '(8,0)', '(1,0)'], a: 0, e: '2p=8, p/2=2。' }
  });

  /* ---------- 高中 · 立体几何 ---------- */
  R.add('math_g6_01', 'math', '高中', '空间几何体体积', '立体几何', 'calc', {
    formula: 'V_{柱}=Sh,\\ V_{锥}=\\frac{1}{3}Sh,\\ V_{球}=\\frac{4}{3}\\pi r^3',
    params: [{ k: 'S', label: '底面积 S', min: 1, max: 30, step: 1, v: 9 }, { k: 'h', label: '高 h', min: 1, max: 20, step: 1, v: 6 }, { k: 'r', label: '球半径 r', min: 1, max: 8, step: 1, v: 3 }],
    fn: p => [['柱体体积', p.S * p.h], ['锥体体积', UI.fmt(p.S * p.h / 3, 2)], ['球体积', UI.fmt(4 / 3 * Math.PI * Math.pow(p.r, 3), 2)], ['球表面积', UI.fmt(4 * Math.PI * p.r * p.r, 2)]],
    quiz: { q: '圆锥体积是同底等高圆柱的？', opts: ['1/3', '1/2', '2/3', '1/4'], a: 0, e: 'V锥=⅓Sh。' }
  });
  R.add('math_g6_02', 'math', '高中', '空间向量求角', '立体几何', 'calc', {
    formula: '\\cos\\theta = \\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}||\\vec{b}|}',
    params: [{ k: 'x1', label: 'a 的 x', min: -5, max: 5, step: 1, v: 1 }, { k: 'y1', label: 'a 的 y', min: -5, max: 5, step: 1, v: 0 }, { k: 'z1', label: 'a 的 z', min: -5, max: 5, step: 1, v: 0 }, { k: 'x2', label: 'b 的 x', min: -5, max: 5, step: 1, v: 0 }, { k: 'y2', label: 'b 的 y', min: -5, max: 5, step: 1, v: 1 }, { k: 'z2', label: 'b 的 z', min: -5, max: 5, step: 1, v: 1 }],
    fn: p => {
      const dot = p.x1 * p.x2 + p.y1 * p.y2 + p.z1 * p.z2;
      const ma = Math.sqrt(p.x1 ** 2 + p.y1 ** 2 + p.z1 ** 2), mb = Math.sqrt(p.x2 ** 2 + p.y2 ** 2 + p.z2 ** 2);
      if (ma === 0 || mb === 0) return [['提示', '向量不能为零']];
      return [['a·b', dot], ['夹角', UI.fmt(Math.acos(Math.max(-1, Math.min(1, dot / (ma * mb)))) * 180 / Math.PI, 1) + '°']];
    },
    quiz: { q: '(1,0,0) 与 (0,1,0) 的夹角是？', opts: ['90°', '45°', '0°', '180°'], a: 0, e: '点积为 0。' }
  });

  /* ---------- 高中 · 概率统计 ---------- */
  R.add('math_g7_01', 'math', '高中', '排列组合', '概率与统计', 'calc', {
    formula: 'A_n^m = \\frac{n!}{(n-m)!},\\quad C_n^m = \\frac{n!}{m!(n-m)!}',
    params: [{ k: 'n', label: 'n', min: 2, max: 10, step: 1, v: 6 }, { k: 'm', label: 'm', min: 0, max: 10, step: 1, v: 2 }],
    fn: p => {
      if (p.m > p.n) return [['提示', 'm 不能大于 n']];
      const fact = n => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
      return [['A(n,m) 排列数', fact(p.n) / fact(p.n - p.m)], ['C(n,m) 组合数', fact(p.n) / (fact(p.m) * fact(p.n - p.m))]];
    },
    quiz: { q: 'C(5,2) = ?', opts: ['10', '20', '5', '25'], a: 0, e: '5!/(2!3!)=10。' }
  });
  R.add('math_g7_02', 'math', '高中', '条件概率', '概率与统计', 'calc', {
    formula: 'P(B|A) = \\frac{P(AB)}{P(A)}',
    params: [{ k: 'pab', label: 'P(AB) %', min: 0, max: 100, step: 1, v: 15 }, { k: 'pa', label: 'P(A) %', min: 1, max: 100, step: 1, v: 50 }],
    fn: p => [['P(B|A)', p.pab > p.pa ? 'P(AB) 不能超过 P(A)' : UI.fmt(p.pab / p.pa, 4)]],
    quiz: { q: 'P(AB)=0.2, P(A)=0.5, 则 P(B|A)=?', opts: ['0.4', '0.1', '0.7', '0.25'], a: 0, e: '0.2/0.5=0.4。' }
  });
  R.add('math_g7_03', 'math', '高中', '正态分布', '概率与统计', 'calc', {
    formula: 'X \\sim N(\\mu, \\sigma^2)',
    params: [{ k: 'mu', label: '均值 μ', min: -10, max: 10, step: 1, v: 0 }, { k: 'sigma', label: '标准差 σ', min: 0.5, max: 5, step: 0.5, v: 1 }],
    fn: p => [['P(μ-σ < X < μ+σ)', '≈68.3%'], ['P(μ-2σ < X < μ+2σ)', '≈95.4%'], ['P(μ-3σ < X < μ+3σ)', '≈99.7%'], ['图像对称轴', 'x = ' + p.mu]],
    quiz: { q: '正态曲线关于哪条直线对称？', opts: ['x=μ', 'x=σ', 'y轴', 'x=0'], a: 0, e: '对称轴是均值所在直线。' }
  });

  /* ---------- 高中 · 复数 ---------- */
  R.add('math_g8_01', 'math', '高中', '复数四则运算', '复数', 'calc', {
    formula: '(a+bi)(c+di) = (ac-bd) + (ad+bc)i',
    params: [{ k: 'a', label: 'a', min: -5, max: 5, step: 1, v: 3 }, { k: 'b', label: 'b', min: -5, max: 5, step: 1, v: 2 }, { k: 'c', label: 'c', min: -5, max: 5, step: 1, v: 1 }, { k: 'd', label: 'd', min: -5, max: 5, step: 1, v: -1 }],
    fn: p => [['乘积实部', p.a * p.c - p.b * p.d], ['乘积虚部', p.a * p.d + p.b * p.c], ['|a+bi|（模）', UI.fmt(Math.sqrt(p.a * p.a + p.b * p.b), 3)], ['共轭', p.a + (p.b >= 0 ? ' - ' + p.b : ' + ' + (-p.b)) + 'i']],
    quiz: { q: 'i² = ?', opts: ['-1', '1', 'i', '-i'], a: 0, e: '虚数单位的定义。' }
  });
})();

/* ---------- 初中补充：统计与调查 ---------- */
(function () {
  const R = window.Reg;
  R.add('math_j15_01', 'math', '初中', '统计图表的选择', '统计与概率', 'calc', {
    formula: '扇形圆心角 = 百分比 \\times 360^\\circ',
    params: [{ k: 'pct', label: '某项占比 (%)', min: 5, max: 80, step: 5, v: 25 }],
    fn: p => [['扇形圆心角', p.pct * 3.6 + '°'], ['条形图', '便于比较各项大小'], ['折线图', '反映变化趋势'], ['扇形图', '反映各部分占总体的比例']],
    quiz: { q: '反映各部分占总体比例应选？', opts: ['扇形图', '条形图', '折线图', '频数分布直方图'], a: 0, e: '扇形图按圆心角表示百分比。' }
  });
  R.add('math_j15_02', 'math', '初中', '普查与抽样调查', '统计与概率', 'concept', {
    text: '普查：对全体对象调查（精确但费时，适用于对象少或有破坏性小的场景）。抽样调查：从总体中抽取样本，要求样本具有代表性和随机性。总体、个体、样本、样本容量是四个基本概念。判断方法：看调查是否有必要且可行。',
    quiz: { q: '调查灯泡使用寿命适合？', opts: ['抽样调查（检测有破坏性）', '普查', '全面调查', '无法调查'], a: 0, e: '寿命检测需点亮至损坏，具破坏性。' }
  });
  /* ---------- 高中补充：概率分布 ---------- */
  R.add('math_g7_04', 'math', '高中', '独立重复试验与二项分布', '概率与统计', 'calc', {
    formula: 'P(X=k) = C_n^k p^k (1-p)^{n-k}',
    params: [{ k: 'n', label: '试验次数 n', min: 1, max: 10, step: 1, v: 5 }, { k: 'p', label: '单次成功概率 p', min: 0.1, max: 0.9, step: 0.05, v: 0.5 }, { k: 'kk', label: '成功次数 k', min: 0, max: 10, step: 1, v: 2 }],
    fn: p => {
      if (p.kk > p.n) return [['提示', 'k 不能大于 n']];
      const fact = n => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
      const C = fact(p.n) / (fact(p.kk) * fact(p.n - p.kk));
      const P = C * Math.pow(p.p, p.kk) * Math.pow(1 - p.p, p.n - p.kk);
      return [['P(X=' + p.kk + ')', UI.fmt(P, 4)], ['期望 E(X) = np', UI.fmt(p.n * p.p, 2)], ['方差 D(X) = np(1-p)', UI.fmt(p.n * p.p * (1 - p.p), 2)]];
    },
    quiz: { q: '二项分布的期望是？', opts: ['np', 'p/n', 'n(1-p)', 'np²'], a: 0, e: 'n 次试验平均成功次数。' }
  });
  R.add('math_g7_05', 'math', '高中', '随机变量的期望与方差', '概率与统计', 'calc', {
    formula: 'E(X) = \\sum x_i p_i,\\quad D(X) = \\sum (x_i-E)^2 p_i',
    params: [{ k: 'x1', label: '取值 x₁', min: 0, max: 10, step: 1, v: 1 }, { k: 'p1', label: '概率 p₁ (%)', min: 10, max: 90, step: 10, v: 40 }, { k: 'x2', label: '取值 x₂', min: 0, max: 10, step: 1, v: 4 }],
    fn: p => {
      const q1 = p.p1 / 100, q2 = 1 - q1;
      const E = p.x1 * q1 + p.x2 * q2;
      const D = Math.pow(p.x1 - E, 2) * q1 + Math.pow(p.x2 - E, 2) * q2;
      return [['E(X)', UI.fmt(E, 2)], ['D(X)', UI.fmt(D, 2)], ['E(aX+b) = aE+b', '线性性质']];
    },
    quiz: { q: 'D(X) 反映的是？', opts: ['取值的离散程度', '平均值', '最大值', '概率和'], a: 0, e: '方差度量波动大小。' }
  });
  /* ---------- 高中补充：解析几何 ---------- */
  R.add('math_g5_05', 'math', '高中', '点到直线的距离', '解析几何', 'calc', {
    formula: 'd = \\frac{|Ax_0 + By_0 + C|}{\\sqrt{A^2 + B^2}}',
    params: [{ k: 'A', label: 'A', min: -5, max: 5, step: 1, v: 3 }, { k: 'B', label: 'B', min: -5, max: 5, step: 1, v: 4 }, { k: 'C', label: 'C', min: -10, max: 10, step: 1, v: -12 }, { k: 'x0', label: '点 x₀', min: -5, max: 5, step: 1, v: 1 }, { k: 'y0', label: '点 y₀', min: -5, max: 5, step: 1, v: 2 }],
    fn: p => {
      if (p.A === 0 && p.B === 0) return [['提示', 'A、B 不能同时为 0']];
      return [['距离 d', UI.fmt(Math.abs(p.A * p.x0 + p.B * p.y0 + p.C) / Math.sqrt(p.A * p.A + p.B * p.B), 3)], ['应用', '圆上点到直线距离 → 弦长问题']];
    },
    quiz: { q: '原点(0,0)到直线 3x+4y-10=0 的距离？', opts: ['2', '10', '5', '2.5'], a: 0, e: '|-10|/√25=2。' }
  });
})();
