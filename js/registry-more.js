/* registry-more.js — 知识点扩充（+40，含考点频率 freq 1-5）
 * freq 依据课标与常见中考/高考考点分布标注：5=年年必考，1=低频。 */
(function () {
  const R = window.Reg;
  function A(id, subject, stage, title, branch, type, def) { R.add(id, subject, stage, title, branch, type, def); }

  /* ===== 数学 +13 ===== */
  A('math_m01', 'math', '初中', '相反数与倒数', '数与式', 'calc', { freq: 3,
    formula: '-a,\\quad \\frac{1}{a}\\ (a \\ne 0)',
    params: [{ k: 'a', label: '数 a', min: -10, max: 10, step: 0.5, v: -2.5 }],
    fn: p => [['相反数', -p.a], ['倒数', p.a === 0 ? '0 没有倒数' : UI.fmt(1 / p.a, 3)], ['绝对值', Math.abs(p.a)]],
    quiz: { q: '-3 的倒数是？', opts: ['-1/3', '3', '1/3', '-3'], a: 0, e: '倒数：乘积为 1。' } });
  A('math_m02', 'math', '初中', '幂的运算', '数与式', 'calc', { freq: 4,
    formula: 'a^m \\cdot a^n = a^{m+n},\\ (a^m)^n = a^{mn}',
    params: [{ k: 'a', label: '底数 a', min: 2, max: 5, step: 1, v: 2 }, { k: 'm', label: '指数 m', min: 1, max: 6, step: 1, v: 2 }, { k: 'n', label: '指数 n', min: 1, max: 6, step: 1, v: 3 }],
    fn: p => [['a^m · a^n', Math.pow(p.a, p.m + p.n)], ['(a^m)^n', Math.pow(p.a, p.m * p.n)], ['指数相加 m+n', p.m + p.n], ['指数相乘 mn', p.m * p.n]],
    quiz: { q: '2³·2⁴ = ?', opts: ['2⁷', '2¹²', '4⁷', '2¹'], a: 0, e: '同底数幂相乘指数相加。' } });
  A('math_m03', 'math', '初中', '平行线性质', '图形与几何', 'concept', { freq: 4,
    text: '两直线平行：同位角相等、内错角相等、同旁内角互补。反之，由角的关系也可判定两直线平行。平行线间距离处处相等。',
    quiz: { q: '两直线平行，同旁内角？', opts: ['互补', '相等', '互余', '无关'], a: 0, e: '同旁内角互补。' } });
  A('math_m04', 'math', '初中', '中位线定理', '图形与几何', 'calc', { freq: 3,
    formula: '中位线 = \\frac{1}{2} 底边',
    params: [{ k: 'b', label: '底边 b', min: 2, max: 20, step: 1, v: 8 }],
    fn: p => [['中位线长', UI.fmt(p.b / 2, 1)], ['性质', '平行于第三边且等于一半']],
    quiz: { q: '三角形中位线与第三边关系？', opts: ['平行且等于一半', '相等', '垂直', '两倍'], a: 0, e: '中位线定理。' } });
  A('math_m05', 'math', '初中', '锐角三角比应用（解直角三角形）', '图形与几何', 'calc', { freq: 5,
    formula: '\\tan\\theta = \\frac{对边}{邻边}',
    params: [{ k: 'th', label: '仰角 θ (°)', min: 10, max: 80, step: 1, v: 30, unit: '°' }, { k: 'd', label: '水平距离 d (m)', min: 1, max: 50, step: 1, v: 20, unit: 'm' }],
    fn: p => { const t = SCI.mathx.trigFromDeg(p.th); return [['高度 h = d·tanθ', UI.fmt(p.d * t.tan, 2) + ' m'], ['tanθ', UI.fmt(t.tan, 3)], ['应用', '测楼高/树高/坡度']]; },
    quiz: { q: '仰角45°时，高度与水平距离？', opts: ['相等', '高度是距离2倍', '距离是高度2倍', '无关'], a: 0, e: 'tan45°=1。' } });
  A('math_m06', 'math', '高中', '对数运算性质', '函数', 'calc', { freq: 4,
    formula: '\\log_a(MN) = \\log_a M + \\log_a N',
    params: [{ k: 'M', label: 'M', min: 1, max: 64, step: 1, v: 8 }, { k: 'N', label: 'N', min: 1, max: 64, step: 1, v: 4 }],
    fn: p => [['lg M', UI.fmt(Math.log10(p.M), 3)], ['lg N', UI.fmt(Math.log10(p.N), 3)], ['lg(MN)', UI.fmt(Math.log10(p.M * p.N), 3)], ['lg M + lg N', UI.fmt(Math.log10(p.M) + Math.log10(p.N), 3)]],
    quiz: { q: 'lg2 + lg5 = ?', opts: ['1', '10', '7', '0.7'], a: 0, e: 'lg10=1。' } });
  A('math_m07', 'math', '高中', '诱导公式', '三角与向量', 'calc', { freq: 4,
    formula: '\\sin(\\pi - \\alpha) = \\sin\\alpha',
    params: [{ k: 'a', label: 'α (°)', min: 0, max: 90, step: 5, v: 30, unit: '°' }],
    fn: p => { const t1 = SCI.mathx.trigFromDeg(p.a), t2 = SCI.mathx.trigFromDeg(180 - p.a); return [['sin α', UI.fmt(t1.sin, 3)], ['sin(180°-α)', UI.fmt(t2.sin, 3)], ['cos(180°-α)', UI.fmt(t2.cos, 3)], ['口诀', '奇变偶不变，符号看象限']]; },
    quiz: { q: 'sin150° = ?', opts: ['1/2', '-1/2', '√3/2', '0'], a: 0, e: 'sin(180°-30°)=sin30°。' } });
  A('math_m08', 'math', '高中', '正弦定理', '三角与向量', 'calc', { freq: 4,
    formula: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B}',
    params: [{ k: 'a', label: '边 a', min: 1, max: 10, step: 1, v: 6 }, { k: 'A', label: '角 A (°)', min: 20, max: 140, step: 5, v: 30, unit: '°' }, { k: 'B', label: '角 B (°)', min: 20, max: 140, step: 5, v: 45, unit: '°' }],
    fn: p => { const sA = SCI.mathx.trigFromDeg(p.A).sin, sB = SCI.mathx.trigFromDeg(p.B).sin; return [['边 b', UI.fmt(p.a * sB / sA, 2)], ['a/sinA', UI.fmt(p.a / sA, 2)]]; },
    quiz: { q: '正弦定理适用于？', opts: ['任意三角形', '只直角三角形', '只锐角三角形', '只等边'], a: 0, e: '任意三角形。' } });
  A('math_m09', 'math', '高中', '空间直线位置关系', '立体几何', 'concept', { freq: 3,
    text: '空间两直线：相交、平行、异面。异面直线既不相交也不平行，所成角用平移法求（0°<θ≤90°）。判定异面：过平面外一点与平面内一点的直线，与平面内不过该点的直线异面。',
    quiz: { q: '异面直线所成角范围？', opts: ['(0°,90°]', '[0°,90°]', '(0°,180°)', '[0°,180°)'], a: 0, e: '取锐角或直角。' } });
  A('math_m10', 'math', '高中', '二面角', '立体几何', 'concept', { freq: 3,
    text: '从一条直线出发的两个半平面组成的图形。二面角的平面角：在棱上任取一点，在两个半平面内分别作垂直于棱的射线，两射线夹角即平面角（0°~180°）。求法：定义法、三垂线法、向量法。',
    quiz: { q: '二面角平面角范围？', opts: ['[0°,180°]', '(0°,90°]', '[0°,90°]', '(0°,180°)'], a: 0, e: '可为平角。' } });
  A('math_m11', 'math', '高中', '线性规划', '解析几何', 'calc', { freq: 4,
    formula: 'z = ax + by\\ (在约束下求最值)',
    params: [{ k: 'x', label: 'x', min: 0, max: 6, step: 1, v: 2 }, { k: 'y', label: 'y', min: 0, max: 6, step: 1, v: 3 }],
    fn: p => [['目标 z = x + 2y', p.x + 2 * p.y], ['约束示例', 'x+y≤6, x≥0, y≥0'], ['可行域', '三角形区域，最值在顶点取']],
    quiz: { q: '线性规划最优解一般在？', opts: ['可行域顶点', '区域内部', '原点', '任意点'], a: 0, e: '顶点处取最值。' } });
  A('math_m12', 'math', '高中', '条件概率', '概率与统计', 'calc', { freq: 3,
    formula: 'P(B|A) = \\frac{P(AB)}{P(A)}',
    params: [{ k: 'pab', label: 'P(AB) (%)', min: 1, max: 50, step: 1, v: 20 }, { k: 'pa', label: 'P(A) (%)', min: 20, max: 90, step: 5, v: 50 }],
    fn: p => [['P(B|A)', UI.fmt(p.pab / p.pa, 3)], ['含义', '已知 A 发生后 B 的概率']],
    quiz: { q: 'P(AB)=0.3, P(A)=0.6, P(B|A)=?', opts: ['0.5', '0.18', '0.9', '0.3'], a: 0, e: '0.3/0.6=0.5。' } });
  A('math_m13', 'math', '高中', '复数的几何意义', '复数', 'calc', { freq: 3,
    formula: 'z = a + bi \\leftrightarrow 点(a, b)',
    params: [{ k: 'a', label: '实部 a', min: -5, max: 5, step: 1, v: 3 }, { k: 'b', label: '虚部 b', min: -5, max: 5, step: 1, v: 4 }],
    fn: p => [['模 |z|', UI.fmt(Math.sqrt(p.a * p.a + p.b * p.b), 2)], ['共轭', p.a + ' - ' + p.b + 'i'], ['复平面点', '(' + p.a + ', ' + p.b + ')']],
    quiz: { q: '|3+4i| = ?', opts: ['5', '7', '√7', '1'], a: 0, e: '√(9+16)=5。' } });

  /* ===== 物理 +14 ===== */
  A('phy_m01', 'physics', '初中', '声音的产生（振动）', '声学', 'concept', { freq: 3,
    text: '声音由物体振动产生，振动停止发声停止。一切发声体都在振动（音叉、声带、琴弦）。转换法：用乒乓球放大音叉振动。',
    quiz: { q: '声音产生的根本原因？', opts: ['物体振动', '空气流动', '温度变化', '光的反射'], a: 0, e: '振动产生声音。' } });
  A('phy_m02', 'physics', '初中', '平面镜成像特点', '光学', 'concept', { freq: 4,
    text: '平面镜成等大、正立的虚像；像与物到镜面距离相等；像与物连线垂直镜面（左右相反）。应用：穿衣镜、潜望镜、扩大空间感。',
    quiz: { q: '平面镜成的像是？', opts: ['等大正立虚像', '缩小实像', '放大实像', '倒立虚像'], a: 0, e: '虚像、等大、对称。' } });
  A('phy_m03', 'physics', '初中', '光的反射定律', '光学', 'concept', { freq: 4,
    text: '反射光线、入射光线、法线在同一平面内；反射光线与入射光线分居法线两侧；反射角等于入射角。光路可逆。镜面反射与漫反射都遵守反射定律。',
    quiz: { q: '入射角30°，反射角？', opts: ['30°', '60°', '15°', '90°'], a: 0, e: '反射角=入射角。' } });
  A('phy_m04', 'physics', '初中', '光的折射规律', '光学', 'concept', { freq: 4,
    text: '光从空气斜射入水/玻璃：折射角小于入射角，折射光线偏向法线；反之偏离法线。垂直入射方向不变。光路可逆。应用：池水变浅、筷子弯折、海市蜃楼。',
    quiz: { q: '空气斜射入水，折射角比入射角？', opts: ['小', '大', '相等', '无关'], a: 0, e: '偏向法线。' } });
  A('phy_m05', 'physics', '初中', '连通器', '力学', 'concept', { freq: 3,
    text: '上端开口、底部连通的容器。装同种液体且不流动时，各容器液面总保持相平。应用：茶壶、船闸、锅炉水位计、下水道弯管。',
    quiz: { q: '连通器液面相平的条件？', opts: ['同种液体且不流动', '任意液体', '必须加热', '必须密封'], a: 0, e: '同种+静止。' } });
  A('phy_m06', 'physics', '初中', '大气压的应用', '力学', 'concept', { freq: 3,
    text: '吸管吸饮料、注射器吸药液、吸盘挂钩、活塞式抽水机都利用大气压。托里拆利实验首次测出大气压值（760mm 汞柱）。',
    quiz: { q: '吸管吸饮料靠的是？', opts: ['大气压', '嘴的吸力', '液体压强', '重力'], a: 0, e: '嘴内气压减小，大气压把饮料压上来。' } });
  A('phy_m07', 'physics', '初中', '滑轮组', '力学', 'calc', { freq: 4,
    formula: 'F = \\frac{G + G_{动}}{n}',
    params: [{ k: 'G', label: '物重 G (N)', min: 10, max: 500, step: 10, v: 100, unit: 'N' }, { k: 'n', label: '承担绳段数 n', min: 2, max: 6, step: 1, v: 3 }, { k: 'Gd', label: '动滑轮重 (N)', min: 0, max: 50, step: 5, v: 10, unit: 'N' }],
    fn: p => [['拉力 F', UI.fmt((p.G + p.Gd) / p.n, 1) + ' N'], ['绳端移动距离', 's = ' + p.n + 'h'], ['省力情况', p.n > 1 ? '省力' : '不省力']],
    quiz: { q: '3 段绳承担 90N（不计动滑轮），拉力？', opts: ['30 N', '90 N', '270 N', '45 N'], a: 0, e: 'F=G/n=30。' } });
  A('phy_m08', 'physics', '初中', '磁场对电流的作用', '电磁学', 'concept', { freq: 4,
    text: '通电导体在磁场中受力，方向与电流方向、磁场方向都有关（左手定则）。受力大小与电流、磁场强弱有关。应用：电动机、扬声器。',
    quiz: { q: '电动机原理是？', opts: ['通电导体在磁场中受力', '电磁感应', '电流磁效应', '摩擦起电'], a: 0, e: '电→动。' } });
  A('phy_m09', 'physics', '高中', '共点力平衡', '牛顿定律', 'calc', { freq: 5,
    formula: '\\Sigma F = 0',
    params: [{ k: 'F1', label: 'F₁ (N)', min: 1, max: 20, step: 1, v: 6, unit: 'N' }, { k: 'F2', label: 'F₂ (N)', min: 1, max: 20, step: 1, v: 8, unit: 'N' }, { k: 'th', label: '夹角 (°)', min: 0, max: 180, step: 10, v: 90, unit: '°' }],
    fn: p => { const th = p.th * Math.PI / 180; const R = Math.sqrt(p.F1 ** 2 + p.F2 ** 2 + 2 * p.F1 * p.F2 * Math.cos(th)); return [['F₁F₂ 合力', UI.fmt(R, 2) + ' N'], ['平衡需第三力', UI.fmt(R, 2) + ' N（反向）'], ['条件', '合外力为零']]; },
    quiz: { q: '三力平衡，任意两力合力与第三力？', opts: ['等大反向', '相等', '垂直', '无关'], a: 0, e: '合力为零的推论。' } });
  A('phy_m10', 'physics', '高中', '牛顿第三定律', '牛顿定律', 'concept', { freq: 4,
    text: '作用力与反作用力：等大、反向、共线、异体、同性质、同时产生同时消失。区别平衡力：平衡力作用在同一物体上，作用反作用作用在两个物体上。',
    quiz: { q: '作用力与反作用力作用在？', opts: ['两个不同物体', '同一物体', '任意', '只接触物体'], a: 0, e: '异体是核心区别。' } });
  A('phy_m11', 'physics', '高中', '动能定理', '能量与动量', 'calc', { freq: 5,
    formula: 'W_{合} = \\frac{1}{2}mv_2^2 - \\frac{1}{2}mv_1^2',
    params: [{ k: 'm', label: 'm (kg)', min: 0.5, max: 20, step: 0.5, v: 2, unit: 'kg' }, { k: 'v1', label: '初速 v₁ (m/s)', min: 0, max: 20, step: 1, v: 2, unit: 'm/s' }, { k: 'v2', label: '末速 v₂ (m/s)', min: 0, max: 30, step: 1, v: 6, unit: 'm/s' }],
    fn: p => [['初动能', UI.fmt(0.5 * p.m * p.v1 * p.v1, 1) + ' J'], ['末动能', UI.fmt(0.5 * p.m * p.v2 * p.v2, 1) + ' J'], ['合外力做功', UI.fmt(0.5 * p.m * (p.v2 ** 2 - p.v1 ** 2), 1) + ' J']],
    quiz: { q: '动能定理联系的是？', opts: ['功与动能变化', '力与加速度', '位移与时间', '功率与速度'], a: 0, e: 'W合=ΔEk。' } });
  A('phy_m12', 'physics', '高中', '电容器', '电磁学', 'calc', { freq: 3,
    formula: 'C = \\frac{Q}{U}',
    params: [{ k: 'Q', label: '电荷量 Q (μC)', min: 1, max: 100, step: 1, v: 20 }, { k: 'U', label: '电压 U (V)', min: 1, max: 50, step: 1, v: 10, unit: 'V' }],
    fn: p => [['电容 C', UI.fmt(p.Q / p.U, 2) + ' μF'], ['性质', 'C 由本身结构决定，与 Q、U 无关']],
    quiz: { q: '电容 C 与 Q、U 的关系？', opts: ['C 由结构决定，与 Q/U 无关', 'C 随 Q 增大', 'C 随 U 增大', 'C=QU'], a: 0, e: '比值定义但本身不变。' } });
  A('phy_m13', 'physics', '高中', '变压器', '电磁学', 'calc', { freq: 4,
    formula: '\\frac{U_1}{U_2} = \\frac{n_1}{n_2}',
    params: [{ k: 'n1', label: '原线圈 n₁', min: 10, max: 500, step: 10, v: 100 }, { k: 'n2', label: '副线圈 n₂', min: 10, max: 500, step: 10, v: 200 }, { k: 'U1', label: 'U₁ (V)', min: 1, max: 220, step: 1, v: 110, unit: 'V' }],
    fn: p => [['U₂', UI.fmt(p.U1 * p.n2 / p.n1, 1) + ' V'], ['类型', p.n2 > p.n1 ? '升压' : '降压'], ['原理', '互感（电磁感应）']],
    quiz: { q: '变压器只能改变？', opts: ['交流电压', '直流电压', '任何电压', '电流方向'], a: 0, e: '直流不产生变化磁通。' } });
  A('phy_m14', 'physics', '高中', '光电效应方程', '近代物理', 'calc', { freq: 4,
    formula: 'E_k = h\\nu - W_0',
    params: [{ k: 'nu', label: '频率 ν (×10¹⁴Hz)', min: 3, max: 15, step: 0.5, v: 7.5, unit: 'Hz' }, { k: 'W', label: '逸出功 W₀ (eV)', min: 1, max: 6, step: 0.1, v: 2.3, unit: 'eV' }],
    fn: p => { const E = 4.136e-15 * p.nu * 1e14 / 1.6e-19; const Ek = E - p.W; return [['光子能量', UI.fmt(E, 2) + ' eV'], ['最大初动能', Ek > 0 ? UI.fmt(Ek, 2) + ' eV' : '不发生（低于极限频率）']]; },
    quiz: { q: '增大入射光频率，最大初动能？', opts: ['增大', '不变', '减小', '先增后减'], a: 0, e: 'Ek=hν-W₀ 线性增大。' } });

  /* ===== 化学 +13 ===== */
  A('che_m01', 'chemistry', '初中', '催化剂', '物质构成与变化', 'concept', { freq: 4,
    text: '催化剂改变反应速率，本身质量和化学性质在反应前后不变。"一变两不变"。MnO₂ 催化过氧化氢分解是典型实验。',
    quiz: { q: '催化剂反应前后不变的是？', opts: ['质量和化学性质', '质量与物理性质', '都不变', '都变'], a: 0, e: '一变两不变。' } });
  A('che_m02', 'chemistry', '初中', '硬水与软水', '水与溶液', 'concept', { freq: 3,
    text: '硬水含较多可溶性钙镁化合物。鉴别：加肥皂水，泡沫少浮渣多的是硬水。软化：煮沸（生活）、蒸馏（实验室）。硬水危害：浪费肥皂、锅炉结垢。',
    quiz: { q: '鉴别硬水软水用？', opts: ['肥皂水', '石蕊', '酚酞', '闻气味'], a: 0, e: '泡沫多少区分。' } });
  A('che_m03', 'chemistry', '初中', '金刚石石墨C60用途', '碳与燃烧', 'concept', { freq: 3,
    text: '金刚石：切割、钻头（硬度最大）。石墨：电极、润滑剂、铅笔芯（导电、软）。C₆₀：超导、材料科学。结构决定性质，性质决定用途。',
    quiz: { q: '石墨作电极利用的性质？', opts: ['导电性', '硬度', '颜色', '密度'], a: 0, e: '导电。' } });
  A('che_m04', 'chemistry', '初中', '灭火原理', '碳与燃烧', 'concept', { freq: 4,
    text: '破坏燃烧三条件之一：清除可燃物、隔绝氧气、降温到着火点以下。实例：油锅盖盖（隔氧）、吹灭蜡烛（降温）、森林隔离带（除可燃物）。',
    quiz: { q: '吹灭蜡烛的原理？', opts: ['降温到着火点以下', '隔绝氧气', '清除可燃物', '降低着火点'], a: 0, e: '着火点是固有属性不能降低。' } });
  A('che_m05', 'chemistry', '初中', '常见化肥鉴别', '酸碱盐', 'concept', { freq: 3,
    text: '铵态氮肥加熟石灰研磨放出刺激性氨气（不能与碱性物质混用）。磷肥灰白色、钾肥白色晶体。看外观、加水溶、加碱闻是鉴别三步。',
    quiz: { q: '铵态氮肥与熟石灰研磨产生？', opts: ['刺激性氨气', '氢气', '二氧化碳', '氧气'], a: 0, e: '铵盐+碱→氨气。' } });
  A('che_m06', 'chemistry', '高中', '气体摩尔体积', '基本概念', 'calc', { freq: 4,
    formula: 'V = n \\times 22.4\\ L/mol\\ (标况)',
    params: [{ k: 'n', label: '物质的量 n (mol)', min: 0.5, max: 10, step: 0.5, v: 2, unit: 'mol' }],
    fn: p => [['标况体积', UI.fmt(p.n * 22.4, 1) + ' L'], ['注意', '只适用于气体、标况']],
    quiz: { q: '标况 2mol 任何气体体积？', opts: ['44.8 L', '22.4 L', '11.2 L', '不确定'], a: 0, e: '2×22.4。' } });
  A('che_m07', 'chemistry', '高中', '物质的量浓度配制误差', '基本概念', 'concept', { freq: 4,
    text: '定容俯视→体积偏小→浓度偏大；仰视→偏小。转移时洒出→溶质减少→偏小。未冷却定容→冷却后体积缩小→偏大。分析核心：c=n/V，看操作影响 n 还是 V。',
    quiz: { q: '定容时俯视刻度线，浓度？', opts: ['偏大', '偏小', '不变', '无法判断'], a: 0, e: '实际体积小于刻度。' } });
  A('che_m08', 'chemistry', '高中', '盖斯定律', '反应原理', 'calc', { freq: 4,
    formula: '\\Delta H_3 = \\Delta H_1 + \\Delta H_2',
    params: [{ k: 'h1', label: 'ΔH₁ (kJ/mol)', min: -500, max: 500, step: 10, v: -200, unit: 'kJ/mol' }, { k: 'h2', label: 'ΔH₂ (kJ/mol)', min: -500, max: 500, step: 10, v: -100, unit: 'kJ/mol' }],
    fn: p => [['总 ΔH', p.h1 + p.h2 + ' kJ/mol'], ['含义', '反应热只与始末状态有关，与路径无关']],
    quiz: { q: '盖斯定律说明反应热与？', opts: ['路径无关', '路径有关', '催化剂有关', '速率有关'], a: 0, e: '状态函数性质。' } });
  A('che_m09', 'chemistry', '高中', '等效平衡', '反应原理', 'concept', { freq: 2,
    text: '相同条件下，同一可逆反应从不同起始状态出发，达到平衡时各组分百分含量相同。恒温恒容：反应前后气体分子数变化的，需"一边倒"后投料相同；分子数不变的，投料成比例即可。',
    quiz: { q: '等效平衡比较的核心是？', opts: ['一边倒后比较投料', '比较速率', '比较颜色', '比较压强'], a: 0, e: '折算到同一边比较。' } });
  A('che_m10', 'chemistry', '高中', '沉淀转化', '反应原理', 'concept', { freq: 3,
    text: '溶解度大的沉淀可转化为溶解度更小的沉淀（AgCl→AgI→Ag₂S）。锅炉除垢用 Na₂CO₃ 把 CaSO₄ 转化为 CaCO₃ 再酸洗。本质：向更难溶方向进行。',
    quiz: { q: '沉淀转化的方向一般是？', opts: ['向更难溶方向', '向更易溶方向', '随机', '不转化'], a: 0, e: 'Ksp 更小者更稳定。' } });
  A('che_m11', 'chemistry', '高中', '电解原理', '反应原理', 'concept', { freq: 4,
    text: '电解池：电能→化学能。阳极氧化、阴极还原。放电顺序：阳极 S²⁻>I⁻>Br⁻>Cl⁻>OH⁻；阴极 Ag⁺>Cu²⁺>H⁺。应用：氯碱工业、电镀、精炼铜。',
    quiz: { q: '电解池中阴极发生？', opts: ['还原反应', '氧化反应', '中和', '水解'], a: 0, e: '阴得电子被还原。' } });
  A('che_m12', 'chemistry', '高中', '同分异构体', '有机化学', 'concept', { freq: 4,
    text: '分子式相同结构不同的化合物。类型：碳链异构、位置异构、官能团异构（如乙醇与二甲醚）。书写：先碳链后位置再官能团，不重不漏。',
    quiz: { q: '乙醇与二甲醚属于？', opts: ['官能团异构', '碳链异构', '位置异构', '同系物'], a: 0, e: 'C₂H₆O 两种结构。' } });
  A('che_m13', 'chemistry', '高中', '晶体类型判断', '结构', 'concept', { freq: 3,
    text: '看构成微粒与作用力：离子晶体（离子键，熔沸点较高）、共价晶体（共价键网状，硬度大）、分子晶体（分子间力，熔沸点低）、金属晶体（金属键）。典型例：NaCl/金刚石/干冰/铁。',
    quiz: { q: '干冰（固态CO₂）属于？', opts: ['分子晶体', '共价晶体', '离子晶体', '金属晶体'], a: 0, e: 'CO₂分子间是分子间力。' } });
})();
