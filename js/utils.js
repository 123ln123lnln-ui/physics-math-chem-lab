/* utils.js — 渲染辅助工具（只做呈现，不含学科逻辑） */
(function (global) {
  const U = {};

  // KaTeX 渲染：行内或块级。若 KaTeX 未加载则退回纯文本。
  U.tex = function (el, latex, displayMode) {
    if (!el) return;
    if (global.katex) {
      try {
        global.katex.render(latex, el, { displayMode: !!displayMode, throwOnError: false });
        return;
      } catch (e) { /* fall through */ }
    }
    el.textContent = latex;
  };
  U.texBlock = function (container, latex) {
    const div = document.createElement('div');
    div.className = 'katex-block';
    container.appendChild(div);
    U.tex(div, latex, true);
    return div;
  };
  U.texInline = function (container, latex) {
    const span = document.createElement('span');
    container.appendChild(span);
    U.tex(span, latex, false);
    return span;
  };

  // 数值格式化：保留 n 位小数，去掉多余 0
  U.fmt = function (v, digits) {
    if (v === null || v === undefined || !isFinite(v)) return '—';
    const d = digits === undefined ? 3 : digits;
    return Number(v.toFixed(d)).toString();
  };

  // 滑块控件：返回 { input, valueEl }，onInput 收到 Number 值
  U.slider = function (container, label, min, max, step, value, onInput) {
    const row = document.createElement('div');
    row.className = 'control-row';
    const lab = document.createElement('label');
    const nameSpan = document.createElement('span');
    nameSpan.textContent = label;
    const valSpan = document.createElement('span');
    valSpan.className = 'val';
    valSpan.textContent = value;
    lab.appendChild(nameSpan); lab.appendChild(valSpan);
    const input = document.createElement('input');
    input.type = 'range'; input.min = min; input.max = max; input.step = step; input.value = value;
    input.addEventListener('input', function () {
      const v = Number(input.value);
      valSpan.textContent = v;
      onInput(v);
    });
    row.appendChild(lab); row.appendChild(input);
    container.appendChild(row);
    return { input: input, valueEl: valSpan, setValue: function (v) { input.value = v; valSpan.textContent = v; } };
  };

  // 读数面板：readout(el, [[key, value], ...])
  U.readout = function (container, rows) {
    const box = document.createElement('div');
    box.className = 'readout';
    rows.forEach(function (r) {
      const row = document.createElement('div');
      row.className = 'row';
      const k = document.createElement('span'); k.className = 'k'; k.textContent = r[0];
      const v = document.createElement('span'); v.className = 'v'; v.textContent = r[1];
      row.appendChild(k); row.appendChild(v);
      box.appendChild(row);
    });
    container.appendChild(box);
    return box;
  };

  // 错误显示（量纲错误等被引擎抛出时统一呈现，不静默）
  U.showError = function (container, err) {
    const box = document.createElement('div');
    box.className = 'error-box';
    box.textContent = '计算被阻断：' + (err && err.message ? err.message : String(err));
    container.appendChild(box);
    console.error('[SCIENCE-ENGINE]', err);
  };

  // 高清 Canvas 尺寸设置（按 devicePixelRatio）
  U.setupCanvas = function (canvas, w, h) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.maxWidth = '100%';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  global.UI = U;
})(window);
