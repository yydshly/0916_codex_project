/* Verify acceptance gates, sample outputs and meaningful boundary behavior. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { scenarios, routes, Session, pressure } = require('../app/lab-core.js');
const runs = [];
for (const scenario of Object.keys(scenarios)) {
  for (const mode of Object.keys(routes)) {
    const session = new Session(scenario, mode);
    assert.equal(session.next(), false, 'Cannot skip an untested plan');
    const rounds = [];
    for (let step = 0; step < 4; step++) {
      const accepted = session.submit(); // Must run actual tests, even without Run.
      rounds.push({ round: step + 1, variant: session.variantId, passed: session.results.filter(x => x.passed).length, total: session.results.length, accepted, repair_failures: session.failures });
      assert.equal(accepted, mode === 'evidence' && step === 3);
      if (step === 0) assert.equal(session.failures, 0, 'Baseline reproduction is not a failed repair');
      const before = session.failures;
      session.run(); session.submit();
      assert.equal(session.failures, before, 'Same experiment is counted once');
      if (step < 3) assert.equal(session.next(), true);
      else assert.equal(session.next(), false, 'Stop at passed acceptance or path limit');
    }
    runs.push({ scenario, mode, rounds });
    session.reset();
    assert.equal(session.history.length, 0); assert.equal(session.results, null); assert.equal(session.submitted, null);
    assert.throws(() => session.reset('constructor', 'evidence'));
    assert.equal(session.scenario, scenario, 'Invalid selection cannot corrupt state');
  }
}
assert.deepEqual([0,1,2,3,4,5,6].map(pressure), ['L0','L0','L1','L2','L3','L4','L4']);
const time = scenarios.time.variants[3].fn;
assert.equal(time('2026-09-17T00:00:00Z','2026-09-17T08:00:00+08:00','2026-09-17T10:00:00+08:00'), true);
assert.equal(time('2026-09-17T02:00:00Z','2026-09-17T08:00:00+08:00','2026-09-17T10:00:00+08:00'), false);
const paginate = scenarios.page.variants[3].fn;
assert.deepEqual([1,2,3].flatMap(page => paginate([1,2,3,4,5],page,2)), [1,2,3,4,5]);
const unique = scenarios.unique.variants[3].fn;
const contacts = [{id:0,name:'甲'},{id:'0',name:'乙'},{id:0,name:'丙'}];
const output = unique(contacts);
assert.deepEqual(output, contacts.slice(0,2)); assert.equal(output[0], contacts[0]); assert.equal(contacts.length,3);
const report = { date: '2026-09-17', runtime: process.version, implementation: '自主 JavaScript 教学样例，非模型实验', scenario_count: 3, route_count: 6, acceptance_executions_per_route: 12, status: 'passed', checks: ['三场景六路径的验收与上限','基线复现不计修复失败','同方案重复验收不重复计数','未运行时不能前进','重置与非法选择保持状态完整','L0—L4 阈值','跨时区端点、分页重组、ID 类型与输入不变'], runs };
fs.mkdirSync(path.join(__dirname,'../notes'),{recursive:true});
fs.writeFileSync(path.join(__dirname,'../notes/lab-verification.json'), JSON.stringify(report,null,2)+'\n');
console.log('PASS: 3 scenarios, 6 routes, actual acceptance gates and boundary checks.');
