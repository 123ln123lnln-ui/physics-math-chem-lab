/* anim.js — 全局播放控制：速度倍率 + 播放/暂停 + 循环（自动播放） */
(function () {
  window.Anim = { speed: 1 };

  UI.animControls = function (container, st) {
    // st: { playing:false, loop:false }（由模块持有，RAF 循环读取）
    const wrap = document.createElement('div');
    wrap.className = 'anim-ctrl';

    const playBtn = document.createElement('button');
    playBtn.className = 'btn';
    function sync() {
      playBtn.textContent = st.playing ? '⏸ 暂停' : '▶ 播放';
      playBtn.classList.toggle('playing', !!st.playing);
    }
    playBtn.addEventListener('click', function () { st.playing = !st.playing; sync(); });

    const loopLab = document.createElement('label');
    loopLab.className = 'anim-loop';
    const loopChk = document.createElement('input');
    loopChk.type = 'checkbox';
    loopChk.checked = st.loop;
    loopChk.addEventListener('change', function () { st.loop = loopChk.checked; });
    loopLab.appendChild(loopChk);
    loopLab.appendChild(document.createTextNode(' 循环'));

    const spdLab = document.createElement('label');
    spdLab.className = 'anim-speed';
    spdLab.appendChild(document.createTextNode('速度 '));
    const sel = document.createElement('select');
    [0.25, 0.5, 1, 1.5, 2, 3].forEach(function (v) {
      const o = document.createElement('option');
      o.value = v; o.textContent = v + 'x';
      if (v === 1) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener('change', function () { Anim.speed = Number(sel.value); });
    spdLab.appendChild(sel);

    wrap.appendChild(playBtn);
    wrap.appendChild(loopLab);
    wrap.appendChild(spdLab);
    container.appendChild(wrap);
    return {
      setPlaying: function (v) { st.playing = v; sync(); },
      el: wrap
    };
  };
})();
