/* metal-displacement.js — 为什么铁钉放进硫酸铜溶液会变红？（初中）
 * 可视化手法回灌自化学地牢已验证 3D 演示（chemistry-rpg src/fx3d/displacement3d.js）：
 * 发光电子流粒子（钉面 → Cu²⁺）、铜晶只增不减、溶液蓝 → 浅绿、全程无气泡。
 *
 * 科学约束卡（详卡见 docs/metal-displacement-constraint-card.md，格式依 docs/ANIM-QC.md 第三节）：
 * 原理：Fe − 2e⁻ → Fe²⁺（铁溶解入液，浅绿）；Cu²⁺ + 2e⁻ → Cu（钉面沉积，红）。
 *       电子流向恒定：铁钉 → 铜离子；E°池 = 0.34 − (−0.44) = +0.78 V > 0，常温自发。只此一个机理。
 * 不变量：①每沉积 1 个 Cu 对应 1 个 Cu²⁺ 消失 + 1 个 Fe²⁺ 新生（计数恒等 = 电荷/原子守恒）；
 *         ②铜只沉积不回头：deposited 单调不减，钉面红色与铜晶只增不减，拖浓度滑块也不褪色；
 *         ③任何时刻无气泡；④溶液蓝 → 浅绿不反向；⑤电子起点恒在钉面、终点恒在自由 Cu²⁺。
 * 禁忌：禁气泡；禁绿 → 蓝反向；禁电子流反向；禁铜晶缩小消失；禁浓度只改速度；禁 Fe²⁺ 画黄（Fe³⁺ 才黄）。
 * 参数质变点：浓度 0.05 ⇄ 1.0 mol/L——离子密度、蓝/绿深浅、相对速率与钉面最终覆盖率
 *            （稀 ~ 一半镀不上、浓 ~ 全覆盖，由粒子数守恒直接推出）四档分野。
 */
(function () {
  App.register({
    id: 'metal-displacement',
    title: '为什么铁钉放进硫酸铜溶液会变红？',
    subject: 'chemistry',
    stage: '初中',
    desc: '粒子级演示 Fe + CuSO₄ → FeSO₄ + Cu：发光电子流从铁钉奔向铜离子，铜晶在钉面只长不缩，溶液由蓝转浅绿。浓度滑块拉出速率与最终覆盖率的质变。',
    intro: '铁比铜活泼，铁原子会把电子"送"给溶液里的铜离子。看那些发光的黄色粒子——那就是电子在搬家！每送出一趟电子，铁钉上就长出一粒红色的铜。',
    render: function (root) {
      const page = document.createElement('div'); page.className = 'module-page';
      const left = document.createElement('div');
      const right = document.createElement('div');
      page.appendChild(left); page.appendChild(right);
      root.appendChild(page);

      const viz = document.createElement('div'); viz.className = 'viz-card';
      viz.innerHTML = '<h3>为什么铁钉放进硫酸铜溶液会变红？</h3>';
      const wrap = document.createElement('div'); wrap.className = 'canvas-wrap';
      const canvas = document.createElement('canvas');
      wrap.appendChild(canvas);
      viz.appendChild(wrap);
      left.appendChild(viz);

      const readCard = document.createElement('div'); readCard.className = 'viz-card';
      const formulaDiv = document.createElement('div');
      readCard.appendChild(formulaDiv);
      const readoutDiv = document.createElement('div');
      readCard.appendChild(readoutDiv);
      left.appendChild(readCard);

      const foot = document.createElement('div'); foot.className = 'note';
      foot.textContent = '真实锚定：E°(Fe²⁺/Fe) = −0.44 V，E°(Cu²⁺/Cu) = +0.34 V，E°池 = +0.78 V > 0 → 常温自发（25 °C 标准电极电势，人教版高中化学教科书 / CRC Handbook of Chemistry and Physics）。现象：CuSO₄ 溶液蓝、FeSO₄ 溶液浅绿、Cu 红色（人教版九年级"金属的化学性质"）。本反应无气体生成，全程不会出现气泡。';
      left.appendChild(foot);

      const panel = document.createElement('div'); panel.className = 'panel';
      panel.innerHTML = '<h3>实验台</h3>';
      right.appendChild(panel);

      const W = 560, H = 400;
      const ctx = UI.setupCanvas(canvas, W, H);

      // ---------- 布局常量 ----------
      const BK = { x0: 130, x1: 430, top: 64, solTop: 100, bot: 332 }; // 烧杯与液面
      const NAIL_CX = 280, HALFW = 13;                                 // 铁钉中轴与半宽
      const NAIL_TOP = 52, NAIL_BOT = 296, TIP_Y = 308;                // 钉身/钉尖
      const IMM_Y0 = 106, IMM_Y1 = 292;                                // 浸没区（电子起点/沉积区）
      const COVER_FULL = 30;                                           // 镀满所需沉积数（稀溶液到不了）
      const MAX_IONS = 44, MAX_E = 30, NSEG = 26;

      // ---------- 颜色编码粒子种类（军规4） ----------
      const COL = {
        electron: '#fde047',   // 电子流：暖黄
        cuIon: '#38bdf8',      // Cu²⁺：青蓝
        feIon: '#4ade80',      // Fe²⁺：浅绿
        copper: '#c9734a',     // 析出的铜：红
        iron: '#9aa8b8'        // 铁钉：灰
      };
      const SOL_BLUE = { r: 30, g: 98, b: 220 };   // CuSO₄ 蓝
      const SOL_GREEN = { r: 110, g: 190, b: 130 }; // FeSO₄ 浅绿
      const SOL_WHITE = { r: 245, g: 248, b: 252 };

      // ---------- 状态（deposited 单调不减 = 不变量②的载体） ----------
      const st = { playing: true, loop: false };
      let t = 0, lastTs = null;
      let conc = 0.5;                       // mol/L，滑块实时调
      let hitN = 0;                         // 已被电子命中的 Cu²⁺ 数
      let deposited = 0;                    // 已完成沉积的 Cu 数（= Fe²⁺ 生成数，只增不减）
      const ions = [];                      // Cu²⁺：state free → hit → done
      const feIons = [];                    // Fe²⁺：钉面出生，漂入溶液
      const electrons = [];                 // 电子流粒子（钉面 → 自由 Cu²⁺）
      const crystals = [];                  // 铜晶微粒：只增不减
      const dep = [], segHash = [];         // 钉身分段沉积度 0..1（只增不减）
      const said = {};

      function cNorm() { return (conc - 0.05) / 0.95; }              // 0..1
      function targetN() { return Math.round(14 + 30 * cNorm()); }   // 14..44 个 Cu²⁺
      function eCap() { return 4 + Math.round(10 * cNorm()); }       // 活跃电子数 4..14
      function cover() { return Math.min(1, deposited / COVER_FULL); }
      function freeIons() { return ions.filter(function (i) { return i.state === 'free'; }); }

      function newIon() {
        return {
          x: BK.x0 + 14 + Math.random() * (BK.x1 - BK.x0 - 28),
          y: BK.solTop + 12 + Math.random() * (BK.bot - BK.solTop - 24),
          ph: Math.random() * 6.2832, state: 'free', targeted: false,
          ox: 0, oy: 0, rx: 0, ry: 0, rt: 0
        };
      }

      // 浓度滑块实时换挡：只增减"自由"离子，已沉积的一粒子也不动（不变量②）
      function syncIons() {
        const N = targetN();
        if (ions.length > N) {
          let need = ions.length - N;
          const kept = [];
          for (let i = 0; i < ions.length; i++) {
            if (need > 0 && ions[i].state === 'free') { need--; continue; }
            kept.push(ions[i]);
          }
          ions.length = 0;
          for (let i = 0; i < kept.length; i++) ions.push(kept[i]);
        }
        while (ions.length < N) ions.push(newIon());
      }

      for (let i = 0; i < NSEG; i++) {
        dep.push(0);
        const h = Math.sin(i * 12.9898) * 43758.5453;
        segHash.push((h - Math.floor(h)) * 0.5 + 0.25); // 0.25..0.75 固定抖动
      }
      for (let i = 0; i < 56; i++) {
        crystals.push({
          x: NAIL_CX + (Math.random() < 0.5 ? -1 : 1) * (HALFW + 1 + Math.random() * 4),
          y: IMM_Y0 - 2 + Math.random() * (IMM_Y1 - IMM_Y0 + 8),
          th: 0.04 + Math.random() * 0.9, bs: 1.6 + Math.random() * 2.6,
          rot: Math.random() * 3, s: 0
        });
      }
      for (let i = 0; i < MAX_E; i++) {
        electrons.push({ t: 0, dur: 1, sx: 0, sy: 0, ion: null, trail: [] });
      }
      syncIons();

      function speak(key, text) {
        if (said[key]) return;
        said[key] = true;
        if (window.Voice && Voice.girl) Voice.girl(text);
      }

      // 电子锁定一个自由 Cu²⁺：起点恒在钉面（不变量⑤）
      function retarget(e) {
        const cands = ions.filter(function (i) { return i.state === 'free' && !i.targeted; });
        if (!cands.length) { e.ion = null; return; }
        const ion = cands[(Math.random() * cands.length) | 0];
        ion.targeted = true;
        e.ion = ion;
        e.sx = NAIL_CX + (Math.random() < 0.5 ? -1 : 1) * (HALFW + 1);
        e.sy = IMM_Y0 + Math.random() * (IMM_Y1 - IMM_Y0);
        e.t = 0;
        e.dur = 0.55 + Math.random() * (0.65 - 0.3 * cNorm());
        e.trail.length = 0;
      }

      function step(dt) {
        t += dt;
        // 电子流推进（只有前 eCap() 个允许活跃 = 速率随浓度）
        for (let i = 0; i < electrons.length; i++) {
          const e = electrons[i];
          if (i >= eCap()) { if (e.ion) { e.ion.targeted = false; e.ion = null; } continue; }
          if (!e.ion) { if (st.playing) retarget(e); if (!e.ion) continue; }
          e.t += dt / e.dur;
          const ion = e.ion;
          const k = Math.min(1, e.t);
          const wob = Math.sin(k * 9 + i) * 4;
          e.px = e.sx + (ion.x - e.sx) * k + wob;
          e.py = e.sy + (ion.y - e.sy) * k + wob * 0.5;
          e.trail.push({ x: e.px, y: e.py });
          if (e.trail.length > 6) e.trail.shift();
          if (e.t >= 1) {
            // 抵达：该 Cu²⁺ 被还原，转身飞向钉面（若它仍自由且未被稀释移除）
            if (ion.state === 'free' && ions.indexOf(ion) >= 0) {
              ion.state = 'hit'; ion.targeted = false; hitN++;
              ion.ox = ion.x; ion.oy = ion.y; ion.rt = 0;
              ion.rx = NAIL_CX + (Math.random() < 0.5 ? -1 : 1) * (HALFW - 3 - Math.random() * 3);
              ion.ry = IMM_Y0 + Math.random() * (IMM_Y1 - IMM_Y0);
            }
            e.ion = null;
          }
        }
        // 被命中的 Cu²⁺ 飞向钉面 → 沉积 + 生成 Fe²⁺（计数恒等 = 不变量①）
        for (let i = 0; i < ions.length; i++) {
          const ion = ions[i];
          if (ion.state === 'hit') {
            ion.rt += dt / 0.55;
            const k = Math.min(1, ion.rt), kk = k * k * (3 - 2 * k);
            ion.x = ion.ox + (ion.rx - ion.ox) * kk;
            ion.y = ion.oy + (ion.ry - ion.oy) * kk;
            if (ion.rt >= 1) {
              ion.state = 'done'; deposited++;
              feIons.push({
                x: ion.rx, y: ion.ry,
                vx: (ion.rx < NAIL_CX ? -1 : 1) * (7 + Math.random() * 10),
                vy: (Math.random() - 0.5) * 8, ph: Math.random() * 6.2832
              });
            }
          } else if (ion.state === 'free') {
            // 布朗缓漂
            ion.x += (Math.random() - 0.5) * 30 * dt;
            ion.y += (Math.random() - 0.5) * 30 * dt + Math.sin(t * 0.8 + ion.ph) * 3 * dt;
            ion.x = Math.max(BK.x0 + 12, Math.min(BK.x1 - 12, ion.x));
            ion.y = Math.max(BK.solTop + 10, Math.min(BK.bot - 10, ion.y));
          }
        }
        // Fe²⁺ 漂入溶液（钉面出生 → 散开 = "铁在溶解"）
        for (let i = 0; i < feIons.length; i++) {
          const f = feIons[i];
          f.vx *= (1 - 0.6 * dt);
          f.x += f.vx * dt + (Math.random() - 0.5) * 18 * dt;
          f.y += f.vy * dt + Math.sin(t * 0.7 + f.ph) * 4 * dt;
          f.x = Math.max(BK.x0 + 12, Math.min(BK.x1 - 12, f.x));
          f.y = Math.max(BK.solTop + 10, Math.min(BK.bot - 10, f.y));
        }
        // 沉积度只增不减（不变量②）：cover 由 deposited 单调推出
        const cv = cover();
        for (let i = 0; i < NSEG; i++) {
          const target = Math.max(0, Math.min(1, cv * 1.55 - segHash[i] * 0.5));
          if (target > dep[i]) dep[i] = target;
        }
        for (let i = 0; i < crystals.length; i++) {
          const c = crystals[i];
          const s = Math.max(0, Math.min(1, (cv - c.th) / 0.28)) * c.bs;
          if (s > c.s) c.s = s;
        }
        // 里程碑语音与收尾
        const done = hitN >= ions.length && deposited >= ions.length;
        if (deposited > 0) speak('start', '看！电子从铁钉出发，把铜离子抓回钉面！');
        if (ions.length && deposited >= ions.length / 2) speak('half', '一半铜离子变成铜啦，溶液开始发绿！');
        if (done) {
          if (st.loop) { restart(); return; }
          st.playing = false; ctrl.setPlaying(false);
          speak('done', cover() < 0.95
            ? '铜离子耗尽！稀溶液只能镀上一部分铜——换浓溶液试试！'
            : '铜离子耗尽！铁钉穿上红色铜外套，溶液变成浅绿色！');
        }
      }

      // ---------- 绘制 ----------
      function lerpC(a, b, k) {
        return { r: a.r + (b.r - a.r) * k, g: a.g + (b.g - a.g) * k, b: a.b + (b.b - a.b) * k };
      }
      function rgb(c, a) {
        return 'rgba(' + (c.r | 0) + ',' + (c.g | 0) + ',' + (c.b | 0) + ',' + a + ')';
      }

      function draw() {
        ctx.fillStyle = '#fcfeff';
        ctx.fillRect(0, 0, W, H);

        // 溶液颜色：蓝 ←[Cu²⁺ 剩余] / 浅绿 ←[Fe²⁺]，同一组计数驱动（不变量①④）
        const n = Math.max(1, ions.length);
        const cuLeft = freeIons().length / n;
        const feFrac = deposited / n;
        const blueI = (0.22 + 0.62 * cNorm()) * cuLeft;
        const greenI = Math.min(0.8, (0.25 + 0.6 * cNorm()) * feFrac * 1.6);
        const solCol = lerpC(lerpC(SOL_WHITE, SOL_BLUE, blueI), SOL_GREEN, greenI);
        ctx.fillStyle = rgb(solCol, 0.9);
        ctx.fillRect(BK.x0 + 2, BK.solTop, BK.x1 - BK.x0 - 4, BK.bot - BK.solTop);
        ctx.fillStyle = rgb(lerpC(solCol, SOL_WHITE, 0.4), 0.9);
        ctx.fillRect(BK.x0 + 2, BK.solTop, BK.x1 - BK.x0 - 4, 3);

        // Fe²⁺（浅绿光点，先画在钉后）
        ctx.save();
        ctx.shadowColor = COL.feIon; ctx.shadowBlur = 7;
        ctx.fillStyle = COL.feIon;
        for (let i = 0; i < feIons.length; i++) {
          const f = feIons[i];
          ctx.beginPath(); ctx.arc(f.x, f.y, 3, 0, 6.2832); ctx.fill();
        }
        ctx.restore();

        // Cu²⁺（青光点；被命中后渐变为铜色 = 正在还原）
        ctx.save();
        for (let i = 0; i < ions.length; i++) {
          const ion = ions[i];
          if (ion.state === 'done') continue;
          let col = COL.cuIon;
          if (ion.state === 'hit') col = rgb(lerpC({ r: 56, g: 189, b: 248 }, { r: 201, g: 115, b: 74 }, Math.min(1, ion.rt)), 0.95);
          ctx.shadowColor = col; ctx.shadowBlur = 9;
          ctx.fillStyle = col;
          ctx.beginPath(); ctx.arc(ion.x, ion.y, 4.5, 0, 6.2832); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(255,255,255,.85)';
          ctx.beginPath(); ctx.arc(ion.x, ion.y, 1.6, 0, 6.2832); ctx.fill();
        }
        ctx.restore();

        // 铁钉：钉身分段着色（灰 → 铜红，只增不减），钉头保持铁灰
        ctx.fillStyle = COL.iron;
        ctx.beginPath(); ctx.arc(NAIL_CX, 44, 15, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(NAIL_CX, 44, 15, 0, 6.2832); ctx.stroke();
        const segH = (NAIL_BOT - NAIL_TOP) / NSEG;
        for (let i = 0; i < NSEG; i++) {
          const y0 = NAIL_TOP + i * segH;
          const immersed = y0 + segH > BK.solTop;
          const d = immersed ? dep[i] : 0;
          ctx.fillStyle = rgb(lerpC({ r: 154, g: 168, b: 184 }, { r: 201, g: 115, b: 74 }, d), 1);
          ctx.fillRect(NAIL_CX - HALFW, y0, HALFW * 2, segH + 0.5);
        }
        ctx.fillStyle = rgb(lerpC({ r: 154, g: 168, b: 184 }, { r: 201, g: 115, b: 74 }, dep[NSEG - 1]), 1);
        ctx.beginPath();
        ctx.moveTo(NAIL_CX - HALFW, NAIL_BOT);
        ctx.lineTo(NAIL_CX, TIP_Y);
        ctx.lineTo(NAIL_CX + HALFW, NAIL_BOT);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(71,85,105,.6)'; ctx.lineWidth = 1;
        ctx.strokeRect(NAIL_CX - HALFW, NAIL_TOP, HALFW * 2, NAIL_BOT - NAIL_TOP);

        // 铜晶微粒（钉面生长，只增不减）
        ctx.save();
        for (let i = 0; i < crystals.length; i++) {
          const c = crystals[i];
          if (c.s < 0.15) continue;
          ctx.save();
          ctx.translate(c.x, c.y); ctx.rotate(c.rot);
          ctx.shadowColor = COL.copper; ctx.shadowBlur = c.s > 1.4 ? 7 : 0;
          ctx.fillStyle = COL.copper;
          ctx.fillRect(-c.s / 2, -c.s / 2, c.s, c.s);
          ctx.shadowBlur = 0;
          ctx.strokeStyle = 'rgba(254,215,170,.8)'; ctx.lineWidth = 0.7;
          ctx.strokeRect(-c.s / 2, -c.s / 2, c.s, c.s);
          ctx.restore();
        }
        ctx.restore();

        // 发光电子流 + 渐隐拖尾（军规6）：钉面 → Cu²⁺
        ctx.save();
        for (let i = 0; i < electrons.length; i++) {
          const e = electrons[i];
          if (!e.ion || e.px === undefined) continue;
          for (let j = 0; j < e.trail.length; j++) {
            const p = e.trail[j];
            ctx.fillStyle = 'rgba(253,224,71,' + (0.06 + 0.05 * j).toFixed(3) + ')';
            ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, 6.2832); ctx.fill();
          }
          ctx.shadowColor = COL.electron; ctx.shadowBlur = 12;
          ctx.fillStyle = COL.electron;
          ctx.beginPath(); ctx.arc(e.px, e.py, 3.2, 0, 6.2832); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#fffbeb';
          ctx.beginPath(); ctx.arc(e.px, e.py, 1.3, 0, 6.2832); ctx.fill();
        }
        ctx.restore();

        // 烧杯玻璃壁（压在粒子上沿，读出水线）
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(BK.x0, BK.top); ctx.lineTo(BK.x0, BK.bot);
        ctx.lineTo(BK.x1, BK.bot); ctx.lineTo(BK.x1, BK.top);
        ctx.stroke();
        ctx.fillStyle = '#64748b'; ctx.font = '12px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('铁钉 Fe', NAIL_CX + 20, 48);
        ctx.fillText(feFrac > 0.5 ? 'FeSO₄ 增多（浅绿）' : 'CuSO₄ 溶液（蓝）', BK.x1 - 118, BK.bot + 22);

        // 顶部图例（军规4/7：颜色即语义）
        const legend = [
          [COL.electron, '电子流 e⁻'], [COL.cuIon, 'Cu²⁺'], [COL.feIon, 'Fe²⁺'],
          [COL.copper, 'Cu 沉积'], [COL.iron, 'Fe 铁钉']
        ];
        let lx = 12;
        ctx.font = '12px sans-serif';
        legend.forEach(function (it) {
          ctx.fillStyle = it[0];
          ctx.beginPath(); ctx.arc(lx + 5, 16, 4, 0, 6.2832); ctx.fill();
          ctx.fillStyle = '#334155';
          ctx.fillText(it[1], lx + 13, 20);
          lx += 13 + it[1].length * 12 + 16;
        });

        // 底部 caption 一句话点题（军规7，实底防拖影糊字）
        ctx.fillStyle = '#eaf2fb'; ctx.fillRect(0, H - 30, W, 30);
        ctx.fillStyle = '#1d4ed8'; ctx.textAlign = 'center';
        const doneAll = hitN >= ions.length && deposited >= ions.length;
        let line;
        if (doneAll && cover() < 0.95) {
          line = 'Cu²⁺ 耗尽：稀溶液只够镀一部分铜——蓝色退了，铜却再不会溶回去';
        } else if (doneAll) {
          line = 'Cu²⁺ 耗尽：铁钉披上红色铜衣，溶液变浅绿——铁比铜活泼（E°池 = +0.78 V）';
        } else if (deposited > 0) {
          line = '每析出 1 个铜原子，就有 1 个 Fe²⁺ 进入溶液——蓝色变浅绿，铜只长不缩';
        } else {
          line = '电子从铁钉出发去"抓"铜离子：Fe 失电子，Cu²⁺ 得电子';
        }
        ctx.fillText(line, W / 2, H - 11);
        ctx.textAlign = 'left';
      }

      function updateReadout() {
        try {
          const n = Math.max(1, ions.length);
          readoutDiv.innerHTML = '';
          UI.readout(readoutDiv, [
            ['浓度 c(CuSO₄)', conc.toFixed(2) + ' mol/L（' + (cNorm() < 0.33 ? '稀' : cNorm() < 0.8 ? '中' : '浓') + '）'],
            ['反应进度', Math.round(100 * hitN / n) + ' %（Cu²⁺ 已反应 ' + hitN + '/' + n + '）'],
            ['已析出 Cu 原子', deposited + ' 个'],
            ['新生 Fe²⁺', deposited + ' 个（与 Cu 恒等 = 电荷守恒）'],
            ['钉面覆盖率', Math.round(100 * cover()) + ' %（稀溶液镀不满，浓溶液镀满）'],
            ['相对速率', (0.6 + 2.4 * cNorm()).toFixed(1) + '（稀 = 0.6，浓 = 3.0）']
          ]);
        } catch (e) { UI.showError(readoutDiv, e); }
      }

      function restart() {
        hitN = 0; deposited = 0;
        for (let i = 0; i < ions.length; i++) { ions[i].state = 'free'; ions[i].targeted = false; }
        for (let i = 0; i < NSEG; i++) dep[i] = 0;
        for (let i = 0; i < crystals.length; i++) crystals[i].s = 0;
        for (let i = 0; i < electrons.length; i++) { electrons[i].ion = null; electrons[i].px = undefined; electrons[i].trail.length = 0; }
        feIons.length = 0;
        Object.keys(said).forEach(function (k) { delete said[k]; });
      }

      function frame(ts) {
        if (st.playing) {
          let dt = 0.016;
          if (lastTs !== null && isFinite(ts) && isFinite(lastTs)) {
            dt = Math.min(0.05, Math.max(0, (ts - lastTs) / 1000));
          }
          lastTs = ts;
          step(dt * Anim.speed);
          draw();
          updateReadout();
        } else {
          lastTs = null;
        }
        window.requestAnimationFrame(frame);
      }

      const ctrl = UI.animControls(panel, st);
      const restartBtn = document.createElement('button');
      restartBtn.className = 'btn';
      restartBtn.textContent = '↺ 重新实验';
      restartBtn.addEventListener('click', function () {
        restart();
        st.playing = true; ctrl.setPlaying(true);
        draw(); updateReadout();
        if (window.Voice && Voice.girl) Voice.girl('换一根新铁钉，再来一次！');
      });
      panel.appendChild(restartBtn);

      const concCtl = UI.slider(panel, '浓度 c（CuSO₄，mol/L）', 0.05, 1, 0.05, conc, function (v) {
        const beforeFree = freeIons().length;
        conc = Math.max(0.05, Math.min(1, v));
        syncIons();          // 只增减自由 Cu²⁺；已沉积的铜原地不动（反应不可逆）
        // 加浓后出现新的可反应离子：若反应已停则自动继续（新 Cu²⁺ 到来 = 反应 resume）
        if (freeIons().length > beforeFree && hitN < ions.length && !st.playing) {
          st.playing = true; ctrl.setPlaying(true);
        }
        draw(); updateReadout();
      }, { unit: 'mol/L' });
      concCtl.valueEl.textContent = conc.toFixed(2) + ' mol/L';

      formulaDiv.innerHTML = '';
      UI.texBlock(formulaDiv, 'Fe + CuSO_4 = FeSO_4 + Cu');
      UI.texBlock(formulaDiv, 'Fe - 2e^- \\rightarrow Fe^{2+}\\ (\\text{铁溶解}),\\qquad Cu^{2+} + 2e^- \\rightarrow Cu\\ (\\text{析出})');
      const hint = document.createElement('div'); hint.className = 'note';
      hint.textContent = '质变实验：把浓度从 0.05 拉到 1.0——Cu²⁺ 立刻变多变密、蓝色加深、电子流提速。让稀溶液反应到底：Cu²⁺ 耗尽时铁钉只镀上一部分铜，浓溶液才能镀满（已镀上的铜永远不会溶回去）。';
      panel.appendChild(hint);
      const rev = document.createElement('div'); rev.className = 'note';
      rev.textContent = '反过来试试：铜片放进硫酸亚铁溶液会怎样？不反应——铜不如铁活泼（此时 E°池 = −0.78 V < 0）。';
      panel.appendChild(rev);

      draw();
      updateReadout();
      window.requestAnimationFrame(frame);
    }
  });
})();
