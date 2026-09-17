// 无浏览器的真实目录、原文保真及交互逻辑检查。
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const app=path.resolve(__dirname,'../app');
const nodes=new Map();
const handlers={};
const views=['guide','library','reference','playbook','catalog','recipes','overview','capabilities','scenarios','integration','evidence'].map(id=>({id,hidden:false}));
const loc={hash:''};
const snapshot=JSON.parse(fs.readFileSync(path.join(__dirname,'catalog-snapshot.json'),'utf8'));
const ctx=vm.createContext({assert,console,snapshot,hash:text=>crypto.createHash('sha256').update(text).digest('hex'),
 document:{querySelector(s){if(!nodes.has(s))nodes.set(s,{innerHTML:'',textContent:'',value:'',hidden:false});return nodes.get(s)},querySelectorAll(s){return s==='.view'?views:[]},addEventListener(type,fn){(handlers[type]??=[]).push(fn)}},
 location:loc,window:{addEventListener:()=>{},scrollTo:()=>{}},
 localStorage:{getItem:()=>null},requestAnimationFrame:()=>{},
 fire:(type,event)=>{for(const fn of handlers[type]||[])fn(event)},views
});
const files=['data.js','catalog-data.js','catalog.js','guide-data.js','guide.js'];
const source=files.map(n=>fs.readFileSync(path.join(app,n),'utf8')).join('\n')+'\n'+fs.readFileSync(path.join(app,'app.js'),'utf8');
vm.runInContext(source+`
assert.equal(PROMPT_CATALOG.prompts.length,30);
assert.equal(views.find(v=>!v.hidden).id,'guide');
assert.equal(new Set(PROMPT_CATALOG.prompts.map(p=>p.id)).size,30);
const counts={};
for(const p of PROMPT_CATALOG.prompts){
  const record=snapshot.records.find(x=>x.id===p.id);
  assert.ok(record);
  assert.equal(hash(p.rawContent),record.contentSha256);
  assert.equal(p.title,record.title);
  assert.ok(CATALOG_GROUPS.includes(p.group));
  assert.ok(p.sourceUrl.startsWith('https://prompts.chat/prompts/'));
  counts[p.sourceType]=(counts[p.sourceType]||0)+1;
  assert.ok(renderPromptDetail(p.id));
  assert.ok($('#prompt-detail').innerHTML.includes(esc(p.rawContent)));
  assert.ok($('#prompt-detail').innerHTML.includes(esc(p.title)));
  const c=catalogContext(p);c.task='我的网站 <测试> $&';c.materials='本地样式文件';
  assert.ok(contextualPrompt(p).startsWith(p.rawContent+'\\n\\n---'));
  assert.ok(contextualPrompt(p).includes('我的网站 <测试> $&'));
  assert.ok(contextualPrompt(p).includes('本地样式文件'));
  renderPromptDetail(p.id);
  assert.ok($('#prompt-detail').innerHTML.includes('&lt;测试&gt;'));
}
assert.equal(counts.TEXT,24);assert.equal(counts.IMAGE,5);assert.equal(counts.SKILL,1);
catalogType='SKILL';renderCatalogList();assert.equal(catalogMatches().length,1);assert.ok($('#prompt-cards').innerHTML.includes('未完成骨架'));
catalogType='全部';catalogQuery='Lighthouse';assert.equal(catalogMatches().length,1);
catalogQuery='zzzz-no-prompt';renderCatalogList();assert.ok($('#prompt-cards').innerHTML.includes('没有匹配'));
catalogQuery='';for(const group of CATALOG_GROUPS){catalogGroup=group;renderCatalogList();assert.ok(catalogMatches().length>0)}
catalogGroup='全部';catalogReadiness='需要裁剪';assert.equal(catalogMatches().length,1);
catalogReadiness='全部';
let recipeSteps=0;
for(const r of RECIPES){renderRecipes(r.id);for(const [id] of r.steps){assert.ok(PROMPT_CATALOG.prompts.some(p=>p.id===id));assert.ok($('#real-recipe-content').innerHTML.includes('#catalog/'+id));recipeSteps++}}
renderCatalog('bad-id');assert.equal($('#catalog-list').hidden,false);
const p=PROMPT_CATALOG.prompts[0];renderCatalog(p.id);assert.equal($('#catalog-list').hidden,true);
fire('input',{target:{dataset:{contextId:p.id,contextKey:'materials'},value:'事件更新的材料'}});
assert.ok($('#contextual-output').textContent.includes('事件更新的材料'));
fire('input',{target:{id:'prompt-search',dataset:{},value:'网站'}});assert.ok(catalogMatches().length>0);
for(const view of ['guide','library','reference','playbook','catalog','recipes','overview','capabilities','scenarios','integration','evidence']){location.hash='#'+view;route();assert.equal(views.filter(v=>!v.hidden).length,1);assert.equal(views.find(v=>!v.hidden).id,view)}
location.hash='#catalog/'+p.id;route();assert.equal($('#catalog-list').hidden,true);
location.hash='#recipes/existing-site';route();assert.ok($('#real-recipe-content').innerHTML.includes('接手旧网站'));
console.log(JSON.stringify({records:30,rawTextHashes:'all matched',sourceTypeCounts:counts,detailViews:30,recipes:RECIPES.length,recipeSteps,filtering:'passed',contextAppend:'passed',scope:'无浏览器的内容与交互逻辑检查'},null,2));
`,ctx);
