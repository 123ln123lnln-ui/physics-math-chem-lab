/* mistakes.js — 错题本：每一道错题都是出题人留下的线索
 * 答错自动收录；同一题答对自动移出。数据在 localStorage，不上传。
 * 渲染入口：#/mistakes 路由 → Mistakes.render(root)。
 */
(function () {
  const KEY = 'pmc-mistakes';
  const CAP = 100;

  const M = {};
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, CAP))); } catch (e) {}
  }

  M.list = load;
  M.count = function () { return load().length; };

  // 收录错题（同一知识点同一题不重复）
  M.add = function (mid, q) {
    if (!q || !q.q) return;
    const list = load();
    if (list.some(function (m) { return m.mid === mid && m.q === q.q; })) return;
    list.unshift({ mid: mid, q: q.q, options: q.options, answer: q.answer, explain: q.explain || '', ts: Date.now() });
    save(list);
  };

  // 答对移出（返回是否移除了条目）
  M.remove = function (mid, qtext) {
    const list = load();
    const next = list.filter(function (m) { return !(m.mid === mid && m.q === qtext); });
    if (next.length !== list.length) { save(next); return true; }
    return false;
  };

  // 来源回链：kb-xxx → 知识点页；模块 id → 模块页；__diag__ → 无（来自五步快测）
  function srcLink(mid) {
    if (!mid || mid === '__diag__') return '';
    if (mid.indexOf('kb-') === 0) return '#/kb/' + mid.slice(3);
    return '#/m/' + mid;
  }
  function srcTitle(mid) {
    if (!mid) return '';
    if (mid === '__diag__') return '五步快测';
    if (mid.indexOf('kb-') === 0 && window.Reg && Reg.byId[mid.slice(3)]) return Reg.byId[mid.slice(3)].title;
    if (window.App && App.get(mid)) return App.get(mid).title;
    return mid;
  }

  M.render = function (root) {
    const h1 = document.createElement('h1');
    h1.textContent = '错题本 · 失分线索';
    root.appendChild(h1);
    const tip = document.createElement('p');
    tip.style.cssText = 'color:#64748b;font-size:14px;margin:4px 0 14px';
    tip.textContent = '答错的题会自动收进来。在这里重新挑战，答对一题就销掉一条——错题清零是最好的复习。';
    root.appendChild(tip);

    const list = load();
    if (!list.length) {
      const empty = document.createElement('div');
      empty.className = 'viz-card';
      empty.style.cssText = 'background:#f0fdf4;border:1px solid #86efac;font-size:14px;color:#166534';
      empty.textContent = '🎉 错题本是空的——要么你很强，要么还没开始做题。去「五步快测」摸摸底？';
      root.appendChild(empty);
      return;
    }

    const stat = document.createElement('p');
    stat.style.cssText = 'font-size:13px;color:#b45309;margin-bottom:12px';
    stat.textContent = '待回收 ' + list.length + ' 条线索';
    root.appendChild(stat);

    list.forEach(function (m, mi) {
      const card = document.createElement('div');
      card.className = 'viz-card quiz-card';
      const src = srcLink(m.mid);
      let head = '<div style="display:flex;justify-content:space-between;align-items:center;font-size:12.5px;color:#64748b;margin-bottom:6px">' +
        '<span>线索 ' + (mi + 1) + ' · 来自 ' + srcTitle(m.mid) + '</span>';
      if (src) head += '<a href="' + src + '" style="color:#2563eb;text-decoration:none">回去复习 →</a>';
      head += '</div>';
      card.innerHTML = head;
      root.appendChild(card);

      const box = document.createElement('div');
      card.appendChild(box);
      const p = document.createElement('p');
      p.className = 'quiz-q';
      p.textContent = m.q;
      box.appendChild(p);
      const ol = document.createElement('div');
      ol.className = 'quiz-options';
      m.options.forEach(function (opt, idx) {
        const b = document.createElement('button');
        b.className = 'quiz-opt';
        b.textContent = String.fromCharCode(65 + idx) + '. ' + opt;
        b.addEventListener('click', function () {
          if (idx === m.answer) {
            b.classList.add('right');
            M.remove(m.mid, m.q);
            if (window.Progress) Progress.addPoints(3, '攻克错题');
            if (window.Voice) Voice.girl('错题攻克！');
            const ok = document.createElement('div');
            ok.className = 'quiz-explain ok';
            ok.textContent = '✔ 已销掉这条线索。' + m.explain;
            box.appendChild(ok);
            ol.style.pointerEvents = 'none';
            stat.textContent = '待回收 ' + M.count() + ' 条线索';
            setTimeout(function () { card.style.opacity = '0.45'; }, 800);
          } else {
            b.classList.add('wrong');
            const no = document.createElement('div');
            no.className = 'quiz-explain no';
            no.textContent = '还不对。看看解析，或点右上角回知识点复习后再来。' + (m.explain ? ' 提示：' + m.explain : '');
            if (!box.querySelector('.quiz-explain.no')) box.appendChild(no);
          }
        });
        ol.appendChild(b);
      });
      box.appendChild(ol);
    });
  };

  window.Mistakes = M;
})();
