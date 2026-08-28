/* lens-imaging.js — 凸透镜成像规律（初中）
 * 光路图（SVG）+ 引擎薄透镜公式；覆盖 u>2f / u=2f / f<u<2f / u=f / u<f 五种情形。
 */
(function () {
  App.register({
    id: 'lens-imaging',
    title: '凸透镜成像规律',
    subject: 'physics',
    stage: '初中',
    desc: '移动物体位置，观察实像/虚像、放大/缩小的变化，掌握五种成像情形。',
    render: function (root) {
      const page = document.createElement('div'); page.className = 'module-page';
      const left = document.createElement('div');
      const right = document.createElement('div');
      page.appendChild(left); page.appendChild(right);
      root.appendChild(page);

      const viz = document.createElement('div'); viz.className = 'viz-card';
      viz.innerHTML = '<h3>光路图（物体在左侧）</h3>';
      const svgWrap = document.createElement('div');
      svgWrap.style.width = '100%'; svgWrap.style.overflowX = 'auto';
      const NS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 640 300');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '300');
      svgWrap.appendChild(svg);
      viz.appendChild(svgWrap);
      left.appendChild(viz);

      const readCard = document.createElement('div'); readCard.className = 'viz-card';
      const formulaDiv = document.createElement('div');
      readCard.appendChild(formulaDiv);
      const readoutDiv = document.createElement('div');
      readCard.appendChild(readoutDiv);
      left.appendChild(readCard);

      const panel = document.createElement('div'); panel.className = 'panel';
      panel.innerHTML = '<h3>物距调节</h3>';
      right.appendChild(panel);

      const f = 60;           // 焦距（像素比例，读数用厘米数值）
      const lensX = 320, axisY = 150, objH = 60;
      let uCm = 30;           // 物距（厘米）

      function el(name, attrs) {
        const e = document.createElementNS(NS, name);
        for (const k in attrs) e.setAttribute(k, attrs[k]);
        return e;
      }
      function line(x1, y1, x2, y2, color, dash) {
        const l = el('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: color, 'stroke-width': 1.5 });
        if (dash) l.setAttribute('stroke-dasharray', dash);
        return l;
      }
      function arrow(x, y1, y2, color, label) {
        const g = el('g', {});
        g.appendChild(line(x, y1, x, y2, color));
        const dir = y2 < y1 ? -1 : 1;
        g.appendChild(el('polygon', {
          points: (x - 6) + ',' + (y2 - dir * 10) + ' ' + (x + 6) + ',' + (y2 - dir * 10) + ' ' + x + ',' + y2,
          fill: color
        }));
        if (label) {
          const t = el('text', { x: x - 10, y: y2 - dir * 16, 'font-size': 12, fill: color });
          t.textContent = label;
          g.appendChild(t);
        }
        return g;
      }

      function draw() {
        try {
          svg.innerHTML = '';
          // 主光轴与透镜
          svg.appendChild(line(0, axisY, 640, axisY, '#cbd5e1'));
          svg.appendChild(line(lensX, 20, lensX, 280, '#2563eb'));
          // 焦点与 2f 标记
          [[-2 * f, '2F'], [-f, 'F'], [f, "F'"], [2 * f, "2F'"]].forEach(function (m) {
            const x = lensX + m[0];
            svg.appendChild(el('circle', { cx: x, cy: axisY, r: 3, fill: '#f59e0b' }));
            const t = el('text', { x: x - 8, y: axisY + 20, 'font-size': 12, fill: '#f59e0b' });
            t.textContent = m[1];
            svg.appendChild(t);
          });

          const scale = f / 10; // 10cm 对应 f 像素
          const u = uCm * scale;
          const objX = lensX - u;
          svg.appendChild(arrow(objX, axisY, axisY - objH, '#dc2626', '物'));

          const vCm = SCI.physx.lensImageDistance(uCm, 10);
          const m = SCI.physx.lensMagnification(uCm, 10);

          if (vCm === null) {
            // u = f，不成像：出射光线平行
            svg.appendChild(line(objX, axisY - objH, lensX, axisY - objH, '#dc2626'));
            svg.appendChild(line(lensX, axisY - objH, 640, axisY - objH, '#dc2626'));
            svg.appendChild(line(objX, axisY - objH, lensX + (lensX - objX), axisY, '#dc2626'));
            svg.appendChild(line(lensX, axisY, 640, axisY, '#dc2626'));
          } else if (vCm > 0) {
            // 实像（异侧）
            const imgX = lensX + vCm * scale;
            const imgH = objH * m;
            svg.appendChild(arrow(imgX, axisY, axisY + imgH, '#059669', '实像'));
            // 三条特殊光线
            svg.appendChild(line(objX, axisY - objH, lensX, axisY - objH, '#dc2626'));
            svg.appendChild(line(lensX, axisY - objH, imgX, axisY + imgH, '#dc2626'));
            svg.appendChild(line(objX, axisY - objH, lensX, axisY, '#dc2626'));
            svg.appendChild(line(lensX, axisY, imgX, axisY + imgH, '#dc2626'));
          } else {
            // 虚像（同侧，放大正立）
            const imgX = lensX + vCm * scale; // vCm 为负，落在左侧
            const imgH = objH * m;
            svg.appendChild(arrow(imgX, axisY, axisY - imgH, '#059669', '虚像'));
            svg.appendChild(line(objX, axisY - objH, lensX, axisY - objH, '#dc2626'));
            // 折射光线反向延长
            const slope = (axisY - objH - axisY) / (lensX - objX);
            const extY = axisY - objH + slope * (640 - lensX);
            svg.appendChild(line(lensX, axisY - objH, 640, extY, '#dc2626'));
            svg.appendChild(line(lensX, axisY - objH, imgX, axisY - imgH, '#dc2626', '5,4'));
          }

          readoutDiv.innerHTML = '';
          const cases = vCm === null ? 'u = f，不成像（平行光）'
            : vCm > 0 ? (vCm > uCm ? '倒立、放大、实像（f<u<2f）' : vCm === uCm ? '倒立、等大、实像（u=2f）' : '倒立、缩小、实像（u>2f）')
            : '正立、放大、虚像（u<f，放大镜）';
          UI.readout(readoutDiv, [
            ['物距 u', UI.fmt(uCm) + ' cm'],
            ['焦距 f', '10 cm'],
            ['像距 v', vCm === null ? '不成像' : UI.fmt(vCm) + ' cm' + (vCm < 0 ? '（虚，同侧）' : '')],
            ['放大率 |v/u|', vCm === null ? '—' : UI.fmt(m)],
            ['成像性质', cases]
          ]);
        } catch (e) {
          readoutDiv.innerHTML = '';
          UI.showError(readoutDiv, e);
        }
      }

      UI.slider(panel, '物距 u (cm)', 5.5, 40, 0.5, uCm, function (v) { uCm = v; draw(); });
      formulaDiv.innerHTML = '';
      UI.texBlock(formulaDiv, '\\frac{1}{u}+\\frac{1}{v}=\\frac{1}{f}');
      const hint = document.createElement('div'); hint.className = 'note';
      hint.textContent = '规律口诀：一倍焦距分虚实，二倍焦距分大小。物近像远像变大（实像情形）。';
      panel.appendChild(hint);

      draw();
    }
  });
})();
