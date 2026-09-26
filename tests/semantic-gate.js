// semantic-gate.js — 数理通第五关（语义关）
// 干跑（默认）：校验 question schema 结构合规（judger 七纪律 3/5/6），打印检查计划。
// live pilot：node tests/semantic-gate.js --live [N]（JEV 真引擎抽检题库，留痕 results.jsonl）
// 不进 run-all.js 四关口，独立运行。
'use strict';

const fs = require('fs');
const path = require('path');

const SCHEMA_PATH = path.join(__dirname, 'semantic-gate.questions.json');

const VALID_TYPES = new Set(['noul', 'choice', 'score']);

function fail(msg) {
  console.error('FAIL ' + msg);
  process.exitCode = 1;
}

function pass(msg) {
  console.log('PASS ' + msg);
}

function validateQuestion(groupId, qid, q) {
  const where = groupId + '.' + qid;
  if (!q || typeof q !== 'object') return fail(where + ' 不是对象');
  if (!VALID_TYPES.has(q.type)) return fail(where + ' type 非法: ' + q.type);
  if (!q.instructions || typeof q.instructions !== 'string') return fail(where + ' 缺 instructions');
  if (q.type === 'noul') return pass(where + ' (noul)');
  if (typeof q.criteria === 'string') {
    // 运行时注入占位（如某知识树的误区库）：免检结构，但占位文本必须声明 other/none 出口
    if (!/other|none/.test(q.criteria)) {
      return fail(where + ' 运行时注入的 Choice 未声明 other/none 兜底出口');
    }
    return pass(where + ' (' + q.type + '，运行时注入)');
  }
  if (!Array.isArray(q.criteria) && typeof q.criteria !== 'object') {
    return fail(where + ' 缺 criteria');
  }
  if (q.type === 'choice' && typeof q.criteria === 'object' && !Array.isArray(q.criteria)) {
    // 纪律3：静态 Choice 必须自带 other/none 出口；运行时注入的（字符串占位）免检
    const keys = Object.keys(q.criteria);
    if (!keys.some(k => k === 'other' || k === 'none')) {
      return fail(where + ' Choice 缺 other/none 兜底出口');
    }
  }
  if (q.type === 'score' && Array.isArray(q.criteria)) {
    // 纪律6：等级数 2-10，每级须为场景描述（粗查：长度≥6字）
    if (q.criteria.length < 2 || q.criteria.length > 10) {
      return fail(where + ' Score 等级数越界: ' + q.criteria.length);
    }
    q.criteria.forEach((lv, i) => {
      if (typeof lv !== 'string' || lv.length < 6) {
        fail(where + ' Score 第' + (i + 1) + '级描述过短，应写场景描述而非程度词');
      }
    });
  }
  pass(where + ' (' + q.type + ')');
}

// ---- live pilot（JEV 真引擎）----
// 用法：node tests/semantic-gate.js --live [N]   （N=抽样题数，默认 5；需 TYPESAFE_API_KEY）
// 纪律7：每次调用留痕 tests/semantic-gate.results.jsonl；门槛：≥0.85 通过 / 0.5-0.85 复核 / <0.5 打回
const RESULTS_PATH = path.join(__dirname, 'semantic-gate.results.jsonl');
const BANK_PATH = path.join(__dirname, '..', 'js', 'questions.js');
const API_URL = 'https://api.typesafe.ai/v1/systemone';

function loadBank() {
  const bank = [];
  const sandboxWindow = { Quiz: { add: (kp, arr) => arr.forEach(q => bank.push({ kp, ...q })) } };
  const src = fs.readFileSync(BANK_PATH, 'utf8');
  new Function('window', src)(sandboxWindow);
  return bank;
}

function verdict(v) {
  return v >= 0.85 ? '通过' : v >= 0.5 ? '复核' : '打回';
}

async function livePilot(limit) {
  const key = process.env.TYPESAFE_API_KEY;
  if (!key) { fail('live 模式需要 TYPESAFE_API_KEY 环境变量'); return; }
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  const questions = schema.groups.quiz_acceptance.questions;
  const bank = loadBank();
  const kpIdx = process.argv.indexOf('--kp');
  const kpFilter = kpIdx >= 0 ? process.argv[kpIdx + 1] : null;
  const pool = kpFilter ? bank.filter(q => q.kp === kpFilter) : bank;
  const sample = pool.slice(0, limit);
  console.log('== live pilot：题库验收 ×' + sample.length + ' 题' + (kpFilter ? '（仅 ' + kpFilter + '）' : '') + '（每次调用 ' + Object.keys(questions).length + ' 问扇出） ==');
  const tally = { '通过': 0, '复核': 0, '打回': 0 };
  for (const item of sample) {
    const state = JSON.stringify({ quiz: { stem: item.q, options: item.options, answer: item.options[item.answer], explanation: item.explain, kp: item.kp } });
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);
      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'jev-latest', state, questions }),
        signal: ctrl.signal
      });
      clearTimeout(timer);
      if (!resp.ok) { fail(item.kp + ' HTTP ' + resp.status); continue; }
      const data = await resp.json();
      const a = data.answers || {};
      const rec = { ts: new Date().toISOString(), model: data.model, kp: item.kp, stem: item.q.slice(0, 60),
        unambiguous: a.unambiguous && a.unambiguous.noul, accurate: a.accurate && a.accurate.noul,
        scope: a.scope && a.scope.choice,
        difficulty: a.difficulty && a.difficulty.score, difficulty_conf: a.difficulty && a.difficulty.confidence,
        usage: data.usage };
      fs.appendFileSync(RESULTS_PATH, JSON.stringify(rec) + '\n');
      const v = verdict(Math.min(rec.unambiguous ?? 0, rec.accurate ?? 0));
      tally[v]++;
      console.log('  [' + v + '] ' + item.kp + ' | unambiguous=' + (rec.unambiguous ?? '?') + ' accurate=' + (rec.accurate ?? '?') + ' scope=' + (rec.scope ?? '?') + ' difficulty=' + (rec.difficulty ?? '?'));
    } catch (e) {
      fail(item.kp + ' 调用异常: ' + e.message);
    }
  }
  console.log('\n路由汇总：通过 ' + tally['通过'] + ' / 复核 ' + tally['复核'] + ' / 打回 ' + tally['打回'] + '（留痕 → tests/semantic-gate.results.jsonl）');
}

async function main() {
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  const groups = schema.groups || {};
  const ids = Object.keys(groups);
  if (ids.length === 0) return fail('schema 无 groups');

  console.log('== 语义关 schema 结构校验 ==');
  ids.forEach(gid => {
    const qs = (groups[gid].questions) || {};
    Object.keys(qs).forEach(qid => validateQuestion(gid, qid, qs[qid]));
  });

  console.log('\n== 检查计划（干跑） ==');
  ids.forEach(gid => {
    const n = Object.keys(groups[gid].questions || {}).length;
    console.log('- ' + gid + ': ' + n + ' 题/次调用（投机扇出，一次问完）');
  });

  const engine = process.env.JUDGER_ENGINE || 'none';
  const liveIdx = process.argv.indexOf('--live');
  if (liveIdx >= 0 || engine === 'jev') {
    const limit = parseInt(process.argv[liveIdx + 1], 10) || 5;
    if (process.exitCode) { console.log('\nschema 校验未过，live pilot 中止'); return; }
    await livePilot(limit);
    if (!process.exitCode) console.log('\nSEMANTIC-GATE LIVE OK');
    return;
  }
  console.log('\n引擎: ' + engine + '（干跑模式；live pilot 用 --live [N]，需 TYPESAFE_API_KEY）');
  if (!process.exitCode) console.log('\nSEMANTIC-GATE DRY RUN OK');
}

main();
