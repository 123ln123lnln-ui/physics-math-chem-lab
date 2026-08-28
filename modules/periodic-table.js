/* periodic-table.js — 元素周期表（前 36 号，数据驱动）（高中）
 * 数据全部来自 SCI.ELEMENTS（constants.js，单一事实源）。
 */
(function () {
  App.register({
    id: 'periodic-table',
    title: '元素周期表（前 36 号）',
    subject: 'chemistry',
    stage: '高中',
    desc: '点击元素查看原子结构数据；观察同周期/同族规律（原子半径、电负性）。',
    render: function (root) {
      const card = document.createElement('div'); card.className = 'viz-card';
      root.appendChild(card);

      const colors = {
        '碱金属': '#fecaca', '碱土金属': '#fed7aa', '金属': '#fde68a',
        '类金属': '#bbf7d0', '非金属': '#bfdbfe', '卤素': '#c7d2fe', '稀有气体': '#e9d5ff'
      };

      const grid = document.createElement('div');
      grid.className = 'pt-grid';
      // 构建 4 周期 × 18 列的网格
      const cells = {};
      SCI.ELEMENTS.forEach(e => { cells[e.p + '-' + e.col] = e; });
      for (let p = 1; p <= 4; p++) {
        for (let col = 1; col <= 18; col++) {
          const e = cells[p + '-' + col];
          const div = document.createElement('div');
          if (!e) { div.className = 'pt-cell empty'; grid.appendChild(div); continue; }
          div.className = 'pt-cell';
          div.style.background = colors[e.c] || '#f1f5f9';
          div.innerHTML = '<div class="z">' + e.z + '</div><div class="s">' + e.s + '</div>';
          div.title = e.cn + '（' + e.en + '）';
          div.addEventListener('click', function () {
            showDetail(e);
            // 点亮特效
            div.classList.remove('pt-pulse');
            void div.offsetWidth; // 重启动画
            div.classList.add('pt-pulse');
            if (window.Voice) Voice.girl('这是' + e.cn + '，' + (e.c === '稀有气体' ? '稀有气体，性格高冷！' : e.c === '碱金属' ? '活泼的碱金属！' : e.c === '卤素' ? '活泼的卤素！' : '第 ' + e.p + ' 周期的元素！'));
          });
          grid.appendChild(div);
        }
      }
      card.appendChild(grid);

      // 图例
      const legend = document.createElement('div');
      legend.style.cssText = 'margin-top:10px;font-size:12px;display:flex;gap:10px;flex-wrap:wrap';
      Object.keys(colors).forEach(c => {
        const s = document.createElement('span');
        s.innerHTML = '<span style="display:inline-block;width:12px;height:12px;background:' + colors[c] + ';border-radius:3px;vertical-align:-1px"></span> ' + c;
        legend.appendChild(s);
      });
      card.appendChild(legend);

      const detail = document.createElement('div');
      detail.className = 'pt-detail';
      detail.innerHTML = '点击任意元素查看详情。';
      card.appendChild(detail);

      function showDetail(e) {
        detail.innerHTML = '';
        const h = document.createElement('h3');
        h.style.margin = '0 0 8px';
        h.textContent = e.z + ' ' + e.cn + '（' + e.s + ' / ' + e.en + '）';
        detail.appendChild(h);
        UI.readout(detail, [
          ['相对原子质量', UI.fmt(e.m, 4)],
          ['周期 / 族', '第 ' + e.p + ' 周期 · 第 ' + e.g + ' 族'],
          ['类别', e.c],
          ['电负性（鲍林）', e.x === null ? '—（稀有气体）' : UI.fmt(e.x, 2)],
          ['电子排布（简写）', e.cfg]
        ]);
        // 同族比较
        const sameGroup = SCI.ELEMENTS.filter(x => x.g === e.g && x.p !== e.p);
        if (sameGroup.length) {
          const note = document.createElement('div'); note.className = 'note';
          note.textContent = '同族（第 ' + e.g + ' 族）其他元素：' +
            sameGroup.map(x => x.cn + '(' + x.s + ')').join('、') +
            '。同族自上而下原子半径增大，金属性增强（主族）。';
          detail.appendChild(note);
        }
      }

      // 默认展示钠
      showDetail(SCI.ELEMENTS[10]);
    }
  });
})();
