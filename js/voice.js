/* voice.js — TTS 语音引擎（Web Speech API）
 * girl：调皮女娃（高音调快语速，参数变化时触发）
 * intro：磁性男播音（低音调，模块打开时介绍）
 * 注：音色取决于本机已安装的中文语音包，自动挑选，找不到则退回默认。
 */
(function () {
  const V = { enabled: true, _zh: [], _girl: null, _male: null, _last: 0 };

  function load() {
    if (!window.speechSynthesis) return;
    const vs = speechSynthesis.getVoices();
    V._zh = vs.filter(v => /^zh/i.test(v.lang) || /Chinese/i.test(v.name));
    const girl = /xiaoxiao|晓晓|huihui|慧慧|female|女/i;
    const male = /yunyang|云扬|kangkang|康康|male|男/i;
    V._girl = V._zh.find(v => girl.test(v.name)) || V._zh[0] || null;
    V._male = V._zh.find(v => male.test(v.name)) || (V._zh.length > 1 ? V._zh[1] : V._zh[0]) || null;
  }
  if (window.speechSynthesis) {
    load();
    speechSynthesis.onvoiceschanged = load;
  }

  function speak(text, opt) {
    if (!V.enabled || !window.speechSynthesis || !text) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      u.pitch = opt.pitch;
      u.rate = opt.rate;
      if (opt.voice) u.voice = opt.voice;
      speechSynthesis.speak(u);
    } catch (e) { /* 无语音环境静默降级 */ }
  }

  V.girl = function (text) { speak(text, { pitch: 1.8, rate: 1.2, voice: V._girl }); };
  V.intro = function (text) { speak(text, { pitch: 0.75, rate: 0.95, voice: V._male }); };

  // 参数变化台词表（调皮口吻）
  const L = {
    '质量': { up: '变重啦！', down: '变轻咯！' },
    '重量': { up: '好重呀！', down: '轻飘飘！' },
    '速度': { up: '越来越快啦！', down: '慢下来咯！' },
    '初速度': { up: '嗖——冲得更快啦！', down: '慢慢来～' },
    '角度': { up: '翘起来啦！', down: '趴下去咯！' },
    '高度': { up: '好高呀！', down: '矮下去啦！' },
    '电压': { up: '电力十足！', down: '电压变小咯！' },
    '电阻': { up: '电阻变大，电流要变小啦！', down: '电阻小咯！' },
    '力': { up: '力气变大啦！', down: '轻一点～' },
    '力臂': { up: '杠杆伸长啦！', down: '缩短咯！' },
    '体积': { up: '变大只啦！', down: '缩小咯！' },
    '浓度': { up: '变浓啦！', down: '被稀释咯！' },
    '密度': { up: '变密实啦！', down: '变疏松咯！' },
    '距离': { up: '离得更远啦！', down: '靠近一点！' },
    '大小': { up: '变大啦！', down: '变小咯！' },
    '频率': { up: '抖得更快啦！', down: '慢悠悠～' },
    '数量': { up: '小伙伴变多啦！', down: '少了一个！' },
    '项数': { up: '圆越叠越多啦！', down: '少叠一层！' },
    '摆长': { up: '摆变长，摆得更慢啦！', down: '摆变短，摆得更快咯！' }
  };
  V.param = function (key, dir) {
    const now = Date.now();
    if (now - V._last < 900) return; // 节流，避免刷屏
    V._last = now;
    const t = L[key] && L[key][dir];
    if (t) V.girl(t);
  };

  window.Voice = V;
})();
