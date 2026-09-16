/* Original teaching fixtures. No upstream implementation is bundled here. */
(function (root) {
  'use strict';
  const scenarios = {
    time: {
      title: '同一时刻，换个时区就被漏掉了',
      description: '活动统计需要筛选一个时间窗口内的事件；直接比较日期字符串会受时区写法影响。',
      contract: '输入均为合法的带时区日期。按真实时刻判断，包含起点，不包含终点，即 [start, end)。',
      tests: [
        { name: '窗口中间', input: ['2026-09-17T09:00:00+08:00', '2026-09-17T08:00:00+08:00', '2026-09-17T10:00:00+08:00'], expected: true },
        { name: '起点应计入', input: ['2026-09-17T08:00:00+08:00', '2026-09-17T08:00:00+08:00', '2026-09-17T10:00:00+08:00'], expected: true },
        { name: '终点应排除', input: ['2026-09-17T10:00:00+08:00', '2026-09-17T08:00:00+08:00', '2026-09-17T10:00:00+08:00'], expected: false },
        { name: 'UTC 写法的同一时刻', input: ['2026-09-17T01:00:00Z', '2026-09-17T08:00:00+08:00', '2026-09-17T10:00:00+08:00'], expected: true },
        { name: '窗口外的事件', input: ['2026-09-17T11:00:00+08:00', '2026-09-17T08:00:00+08:00', '2026-09-17T10:00:00+08:00'], expected: false }
      ],
      variants: [
        { title: '先复现：直接比较字符串', reason: '先跑约定样例，确定漏数发生在哪些边界。', finding: '起点被排除；UTC 与 +08:00 的写法还暴露了字符串比较的问题。', fn: function inWindow(value, start, end) { return value > start && value < end; } },
        { title: '修边界：把起点改为包含', reason: '根据失败样例修正起点，但仍保留原来的字符串比较方式。', finding: '起点修复有效，跨时区样例仍失败：问题不只在比较符号。', fn: function inWindow(value, start, end) { return value >= start && value < end; } },
        { title: '换假设：统一为时间戳', reason: '将“字符串排序”换成“真实时刻比较”，再检查端点约定。', finding: '时区问题消失，但终点误被计入。表示方式和区间边界需要同时正确。', fn: function inWindow(value, start, end) { return Date.parse(value) >= Date.parse(start) && Date.parse(value) <= Date.parse(end); } },
        { title: '合并证据：统一时刻 + 半开区间', reason: '保留时间戳转换，按约定使用包含起点、排除终点的判断。', finding: '当前五个验收样例全部通过。结论只覆盖约定的合法日期输入。', fn: function inWindow(value, start, end) { return Date.parse(value) >= Date.parse(start) && Date.parse(value) < Date.parse(end); } },
        { title: '重复微调：两端都改成包含', reason: '仍沿用字符串比较，只调整符号；没有检验日期表示的假设。', finding: '终点又被计入，跨时区问题也还在。修改次数增加，没有修正核心假设。', fn: function inWindow(value, start, end) { return value >= start && value <= end; } },
        { title: '重复微调：去掉首尾空格', reason: '继续处理字符串表面格式；这些合法样例本来就没有多余空格。', finding: '去空格没有增加有效证据，时区样例仍失败。需要切换实质方法。', fn: function inWindow(value, start, end) { return value.trim() >= start.trim() && value.trim() < end.trim(); } }
      ]
    },
    page: {
      title: '第二页，为什么又出现上一页的记录？',
      description: '列表按页显示，页码从 1 开始。错误的偏移计算让相邻页面重复、遗漏记录。',
      contract: '输入数组，页码和每页条数均为正整数。按顺序取页，超出末页返回空数组。',
      tests: [
        { name: '第一页两条', input: [[1, 2, 3, 4, 5], 1, 2], expected: [1, 2] },
        { name: '第二页不能重复', input: [[1, 2, 3, 4, 5], 2, 2], expected: [3, 4] },
        { name: '末页不足两条', input: [[1, 2, 3, 4, 5], 3, 2], expected: [5] },
        { name: '越过末页', input: [[1, 2, 3, 4, 5], 4, 2], expected: [] },
        { name: '空列表', input: [[], 1, 2], expected: [] }
      ],
      variants: [
        { title: '先复现：把页码当作偏移', reason: '先覆盖首、中、末页和空列表，观察重复记录的规律。', finding: '第一页正常，后续页面连续错位，说明偏移量没有按每页条数增长。', fn: function paginate(items, page, size) { return items.slice(page - 1, page - 1 + size); } },
        { title: '局部修补：页码乘每页条数', reason: '把条数纳入偏移计算，但沿用减 1 的写法。', finding: '偏移量仍整体偏移。需要从页码从 1 开始这一约定重新推导。', fn: function paginate(items, page, size) { const offset = page * size - 1; return items.slice(offset, offset + size); } },
        { title: '换角度：推导零基起点', reason: '起点应为 (page - 1) × size；继续核对 slice 的终点语义。', finding: '起点已正确，每页却少一条。slice 的结束下标本来就不包含在结果里。', fn: function paginate(items, page, size) { const offset = (page - 1) * size; return items.slice(offset, offset + size - 1); } },
        { title: '合并证据：零基偏移 + 排他终点', reason: '按页码换算偏移，并使用 slice 的排他结束下标。', finding: '当前五个验收样例全部通过；未在此扩展非法页码的处理需求。', fn: function paginate(items, page, size) { const offset = (page - 1) * size; return items.slice(offset, offset + size); } },
        { title: '重复微调：先去掉减 1', reason: '尝试另一个常数，没有建立页码和偏移之间的关系。', finding: '中间某页偶然通过，首末页仍错位。单个样例正确不足以证明修复。', fn: function paginate(items, page, size) { return items.slice(page, page + size); } },
        { title: '重复微调：强行限制起点不小于零', reason: '继续修饰偏移表达式，但本轮输入的页码始终大于零。', finding: '限制为非负数没有解决页码换算。下一轮应检查偏移公式。', fn: function paginate(items, page, size) { const offset = Math.max(0, page - 1); return items.slice(offset, offset + size); } }
      ]
    },
    unique: {
      title: '名字一样的两个人，被合并成了一个',
      description: '联系人列表要去掉重复用户。同名不同 ID 的用户却被误删，字符串 ID 也被错误合并。',
      contract: '每项包含 id 和 name，id 为数字或字符串。按 ID 及其类型去重，保留首次出现的记录与顺序；1 和 "1" 不同。',
      tests: [
        { name: '同名、不同 ID 都保留', input: [[{id:1,name:'小林'},{id:2,name:'小林'}]], expected: [{id:1,name:'小林'},{id:2,name:'小林'}] },
        { name: '同一 ID 保留首次名称', input: [[{id:1,name:'小林'},{id:1,name:'林同学'}]], expected: [{id:1,name:'小林'}] },
        { name: '数字 1 与字符串 "1" 不同', input: [[{id:1,name:'甲'},{id:'1',name:'乙'}]], expected: [{id:1,name:'甲'},{id:'1',name:'乙'}] },
        { name: '完全相同的重复记录', input: [[{id:3,name:'小周'},{id:3,name:'小周'}]], expected: [{id:3,name:'小周'}] },
        { name: '空列表', input: [[]], expected: [] }
      ],
      variants: [
        { title: '先复现：按名字去重', reason: '同时检验同名不同人、同人不同名，以及 ID 的类型差异。', finding: '名字不是唯一身份：同名的人丢失，同一 ID 改名却没有被去重。', fn: function uniquePeople(items) { return items.filter((item, i) => items.findIndex(x => x.name === item.name) === i); } },
        { title: '局部修补：对整个对象去重', reason: '尝试用完整对象表示身份，让不同 ID 的同名用户都保留。', finding: '完全相同记录能合并，但同 ID 改名仍被当成新人。需要先明确身份字段。', fn: function uniquePeople(items) { return items.filter((item, i) => items.findIndex(x => JSON.stringify(x) === JSON.stringify(item)) === i); } },
        { title: '换假设：以 ID 作为唯一键', reason: '改用 ID，但把 ID 转成字符串会丢失题目要求保留的类型。', finding: '按 ID 的方向正确；数字 1 与字符串 "1" 被合并，类型约定还未满足。', fn: function uniquePeople(items) { const seen = new Set(); return items.filter(item => { const key = String(item.id); if (seen.has(key)) return false; seen.add(key); return true; }); } },
        { title: '合并证据：保留 ID 类型与首次顺序', reason: '用 Set 保存原始 ID，遍历时只接收首次出现的记录。', finding: '当前五个验收样例全部通过，同名用户和 ID 类型均按约定保留。', fn: function uniquePeople(items) { const seen = new Set(); return items.filter(item => { if (seen.has(item.id)) return false; seen.add(item.id); return true; }); } },
        { title: '重复微调：忽略名字大小写', reason: '继续将名字当作身份，对格式做归一化处理。', finding: '格式整理仍不能区分同名的人，也不能识别改名后的同一用户。', fn: function uniquePeople(items) { return items.filter((item, i) => items.findIndex(x => x.name.toLowerCase() === item.name.toLowerCase()) === i); } },
        { title: '重复微调：再去掉名字的空格', reason: '继续加工名字，仍未回到“按 ID 去重”的验收条件。', finding: '错误的身份字段没有变化。重复优化字符串处理无法满足验收。', fn: function uniquePeople(items) { return items.filter((item, i) => items.findIndex(x => x.name.trim() === item.name.trim()) === i); } }
      ]
    }
  };
  const routes = { evidence: [0, 1, 2, 3], repeat: [0, 1, 4, 5] };
  const clone = value => JSON.parse(JSON.stringify(value));
  function evaluate(scenarioId, variantId) {
    const scenario = scenarios[scenarioId];
    if (!scenario || !Number.isInteger(variantId) || !scenario.variants[variantId]) throw new Error('未知场景或方案');
    return scenario.tests.map(test => {
      try {
        const actual = scenario.variants[variantId].fn(...clone(test.input));
        return { name: test.name, input: clone(test.input), expected: clone(test.expected), actual, passed: JSON.stringify(actual) === JSON.stringify(test.expected) };
      } catch (error) {
        return { name: test.name, input: clone(test.input), expected: clone(test.expected), actual: String(error), passed: false };
      }
    });
  }
  function pressure(failures) { return failures < 2 ? 'L0' : 'L' + Math.min(4, failures - 1); }
  class Session {
    constructor(scenario = 'time', mode = 'evidence') { this.reset(scenario, mode); }
    reset(scenario = this.scenario, mode = this.mode) {
      if (!Object.hasOwn(scenarios, scenario) || !Object.hasOwn(routes, mode)) throw new Error('未知场景或推进方式');
      this.scenario = scenario; this.mode = mode; this.step = 0; this.history = []; this.results = null; this.submitted = null;
    }
    get variantId() { return routes[this.mode][this.step]; }
    // Step 0 is an expected reproduction, not a failed repair experiment.
    get failures() { return this.history.filter(item => item.step > 0 && item.passed < item.total).length; }
    get canNext() { return this.results !== null && this.results.some(row => !row.passed) && this.step < routes[this.mode].length - 1; }
    run() {
      this.results = evaluate(this.scenario, this.variantId); this.submitted = null;
      if (!this.history.some(item => item.step === this.step)) this.history.push({ step: this.step, passed: this.results.filter(row => row.passed).length, total: this.results.length });
      return this.results;
    }
    next() {
      if (!this.canNext) return false;
      this.step += 1; this.results = null; this.submitted = null; return true;
    }
    submit() { this.run(); this.submitted = this.results.every(row => row.passed); return this.submitted; }
  }
  const api = { scenarios, routes, evaluate, pressure, Session };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PuaLab = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
