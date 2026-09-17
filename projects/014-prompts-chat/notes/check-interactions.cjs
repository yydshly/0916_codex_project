// 无浏览器的内容与场景逻辑检查；不替代视觉或真实上游接口测试。
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const app = path.resolve(__dirname, '../app');
const nodes = new Map();
const storage = new Map();
const ctx = vm.createContext({
  assert,
  document: { querySelector(selector) {
    if (!nodes.has(selector)) nodes.set(selector, { innerHTML: '', textContent: '', value: '' });
    return nodes.get(selector);
  } },
  localStorage: { getItem: key => storage.get(key) || null, setItem: (k,v) => storage.set(k,v) },
  requestAnimationFrame: () => {},
  console,
});
const logic = fs.readFileSync(path.join(app,'app.js'),'utf8').split("document.addEventListener('click'")[0];
const data = fs.readFileSync(path.join(app,'data.js'),'utf8');
vm.runInContext(data + '\n' + logic + `
let checkedStages = 0;
assert.equal(CAPABILITIES.length, 32);
assert.equal(new Set(CAPABILITIES.map(c=>c.id)).size, CAPABILITIES.length);
for (const cap of CAPABILITIES) {
  assert.ok(SOURCES[cap.source]);
  assert.ok(GROUPS.includes(cap.group));
}
assert.equal(fill('Hi \\$\\{name:World}', {}), 'Hi World');
assert.equal(fill('Hi \\$\\{name}', {name:'A $& <B>'}), 'Hi A $& <B>');
assert.equal(esc('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
for (const s of SCENARIOS) {
  current=s;
  for (const id of s.caps) assert.ok(CAPABILITIES.some(c=>c.id===id));
  const original=prompt();
  state().values.topic='交互检查：样例 <A> $&';
  assert.ok(prompt().includes('交互检查：样例 <A> $&'));
  assert.notEqual(prompt(),original);
  assert.ok(!prompt().includes('$'+'{topic}'));
  const first=template();state().variant=1;assert.notEqual(template(),first);
  for(let i=0;i<5;i++) {
    step(i);
    const html=$('#scenario-workspace').innerHTML;
    assert.ok(html.includes(s.steps[i]));
    assert.ok(html.includes('cap-links'));
    if(i===1) assert.ok(html.includes('&lt;A&gt;'));
    checkedStages++;
  }
  state().format='json';
  const result=JSON.parse(outputText());
  assert.equal(result.scenario,s.id);
  assert.equal(result.variables.topic,state().values.topic);
  assert.equal(result.verification,'未调用上游服务或模型');
  if(s.id==='agent')assert.equal(Object.keys(result.files).length,3);
  state().values.topic='';
  assert.ok(missing());
  assert.ok(exportHTML().includes('disabled'));
}
current=SCENARIOS[1];state().accepted=true;
assert.equal(artifact().review,'教学模拟：接受修改');
current=SCENARIOS[0];delete states.research;
localStorage.setItem('prompts-research-research',JSON.stringify({values:{topic:'已保存的草稿',audience:42},variant:1}));
assert.equal(state().values.topic,'已保存的草稿');
assert.equal(state().values.audience,SCENARIOS[0].fields[1][2]);
assert.equal(state().variant,1);
assert.ok(JSON.parse(integrationCode('mcp')).mcpServers['prompts.chat']);
for(const mode of ['mcp','cli','plugin','sdk','http']){apiMode=mode;renderIntegration();assert.ok($('#integration-content').innerHTML.includes('integration-code'))}
category='全部';query='不存在的能力abcdefgh';renderCapabilities();assert.ok($('#cap-list').innerHTML.includes('没有找到匹配'));
query='变量';renderCapabilities();assert.ok($('#cap-list').innerHTML.includes('变量'));
for (const group of GROUPS) {category=group;query='';renderCapabilities();assert.ok($('#cap-list').innerHTML.includes(group))}
console.log(JSON.stringify({capabilities:CAPABILITIES.length,scenarios:SCENARIOS.length,renderedStages:checkedStages,result:'passed',scope:'纯函数、场景渲染和状态逻辑；未做浏览器或上游功能测试'},null,2));
`,ctx);
