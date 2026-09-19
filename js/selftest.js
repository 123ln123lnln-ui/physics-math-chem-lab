/* selftest.js — 自检台 v2：浏览器内跑全部四道质量关口
 * 与命令行 node tests/run-all.js 同一标准：引擎黄金测试 / 注册表校验 / 路径校验 / 全动画冒烟。
 * 动画关口为异步分块执行（真实 DOM + 真实 canvas，逐帧驱动 30 帧），不卡页面。
 */
(function () {
  const S = {};

  // 关口1：引擎黄金测试（同步）
  S.engine = function () {
    const tests = (window.SCI && SCI.tests) || [];
    let pass = 0; const fails = [];
    tests.forEach(function (t) {
      try { t.fn(); pass++; } catch (e) { fails.push(t.name + ' -> ' + e.message); }
    });
    return { name: '引擎黄金测试', total: tests.length, pass: pass, fails: fails };
  };

  // 关口2：注册表校验（同步）
  S.registry = function () {
    const items = (window.Reg && Reg.items) || {};
    let pass = 0; const fails = [];
    Object.keys(items).forEach(function (id) {
      const it = items[id];
      const probs = [];
      if (!it.title) probs.push('缺title');
      if (!it.subject || !it.stage || !it.branch) probs.push('缺学科/学段/章节');
      if (!it.def) probs.push('缺def');
      else {
        if (it.type === 'concept' && !it.def.text) probs.push('概念件缺讲解');
        if (it.type !== 'concept' && !it.def.params && !it.def.formula) probs.push('公式件缺参数/公式');
      }
      if (probs.length) fails.push(id + '：' + probs.join('，')); else pass++;
    });
    return { name: '注册表校验', total: pass + fails.length, pass: pass, fails: fails };
  };

  // 关口3：路径数据校验（同步）
  S.paths = function () {
    const list = (window.Paths && Paths.list) || [];
    let total = 0, pass = 0; const fails = [];
    list.forEach(function (p) {
      const seen = {};
      (p.nodes || []).forEach(function (id) {
        total++;
        if (!(window.Reg && Reg.byId[id])) fails.push(p.id + ' 悬空节点 ' + id);
        else if (seen[id]) fails.push(p.id + ' 重复节点 ' + id);
        else pass++;
        seen[id] = true;
      });
    });
    return { name: '路径数据校验', total: total, pass: pass, fails: fails };
  };

  // 关口4：全动画冒烟（异步）。onStep(done, total) 报进度，resolve {name,total,pass,fails}
  S.anims = function (onStep) {
    return new Promise(function (resolve) {
      // 收集三组参数（默认/下限/上限）
      const paramsByAnim = {};
      Object.keys(window).forEach(function (k) {
        if (/^ExploreData(\d+(_\d+)?)?$/.test(k) && Array.isArray(window[k])) {
          window[k].forEach(function (d) { if (d.anim && d.params) paramsByAnim[d.anim] = d.params; });
        }
      });
      function tpsFor(key) {
        const ps = paramsByAnim[key];
        if (!ps || !ps.length) return [{}];
        const mk = function (pick) {
          const data = {};
          ps.forEach(function (p) { data[p.k] = p[pick]; });
          return { data: data };
        };
        return [mk('v'), mk('min'), mk('max')];
      }

      const targets = [];
      const AN = window.ExploreAnim || {};
      Object.keys(AN).forEach(function (k) {
        if (typeof AN[k] === 'function') {
          tpsFor(k).forEach(function (tp, ti) { targets.push({ tag: 'AN.' + k + '[' + ti + ']', fn: AN[k], tp: tp }); });
        }
      });
      const GEN = (window.ConceptAnim && ConceptAnim.GEN) || {};
      Object.keys(GEN).forEach(function (k) {
        if (typeof GEN[k] === 'function') targets.push({ tag: 'GEN.' + k, fn: GEN[k], tp: {} });
      });
      ((window.App && App.modules) || []).forEach(function (m) {
        if (m && typeof m.render === 'function') targets.push({ tag: 'MOD.' + m.id, fn: null, mod: m });
      });

      // 离屏挂载容器（真实渲染，但不干扰页面）
      const stage = document.createElement('div');
      stage.style.cssText = 'position:fixed;left:-10000px;top:0;width:640px;height:480px;overflow:hidden;pointer-events:none';
      document.body.appendChild(stage);

      // 逐帧驱动：临时接管 rAF/setInterval，同步泵 30 帧
      const origRaf = window.requestAnimationFrame, origSI = window.setInterval;
      function pump(mountFn, frames) {
        let q = [];
        window.requestAnimationFrame = function (f) { q.push(f); return q.length; };
        window.setInterval = function (f) { q.push(f); return q.length; };
        try {
          mountFn();
          for (let i = 0; i < frames; i++) {
            const fns = q.splice(0);
            fns.forEach(function (f) { f(i * 16.7); });
          }
        } finally {
          window.requestAnimationFrame = origRaf;
          window.setInterval = origSI;
        }
      }

      let done = 0, pass = 0; const fails = [];
      function runOne(t) {
        const holder = document.createElement('div');
        stage.appendChild(holder);
        try {
          if (t.mod) pump(function () { t.mod.render(holder); }, 30);
          else pump(function () { t.fn(holder, t.tp); }, 30);
          if (!holder.querySelector('canvas') && holder.children.length === 0) {
            throw new Error('30 帧内无 canvas 且无 DOM 输出（静默失败）');
          }
          pass++;
        } catch (e) {
          fails.push(t.tag + ' -> ' + (e && e.message));
        } finally {
          stage.removeChild(holder);
        }
        done++;
      }

      function chunk() {
        const end = Math.min(done + 40, targets.length);
        while (done < end) runOne(targets[done]);
        if (onStep) onStep(done, targets.length);
        if (done < targets.length) setTimeout(chunk, 0);
        else {
          document.body.removeChild(stage);
          resolve({ name: '全动画冒烟', total: targets.length, pass: pass, fails: fails });
        }
      }
      chunk();
    });
  };

  window.SelfTest = S;
})();
