// 公开快照一致性、分类覆盖、样本保真、分页与任务说明检查。
const fs=require('node:fs'), path=require('node:path'), vm=require('node:vm');
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const app=path.resolve(__dirname,'../app'),nodes=new Map(),handlers={};
const views=['guide','library','reference','playbook','catalog','recipes','overview','capabilities','scenarios','integration','evidence'].map(id=>({id,hidden:false}));
const audit=JSON.parse(fs.readFileSync(path.join(__dirname,'guide-snapshot.json'),'utf8'));
const ctx=vm.createContext({assert,console,audit,views,location:{hash:''},
 hash:s=>crypto.createHash('sha256').update(s).digest('hex'),
 document:{querySelector(s){if(!nodes.has(s))nodes.set(s,{innerHTML:'',textContent:'',value:'',hidden:false});return nodes.get(s)},querySelectorAll(s){return s==='.view'?views:[]},addEventListener(t,fn){(handlers[t]??=[]).push(fn)}},
 window:{addEventListener(){},scrollTo(){}},localStorage:{getItem:()=>null},requestAnimationFrame(){},
 fire:(type,event)=>{for(const fn of handlers[type]||[])fn(event)}
});
const source=['data.js','catalog-data.js','catalog.js','guide-data.js','guide.js','app.js'].map(n=>fs.readFileSync(path.join(app,n),'utf8')).join('\n');
vm.runInContext(source+String.raw`
assert.equal(PROMPT_GUIDE.records.length,audit.meta.unique);
assert.equal(PROMPT_GUIDE.records.length,2270);
assert.equal(new Set(PROMPT_GUIDE.records.map(p=>p.id)).size,2270);
assert.equal(PROMPT_GUIDE.directions.length,16);
assert.equal(PROMPT_GUIDE.categories.length,52);
assert.equal(PROMPT_GUIDE.reviewed.length,32);
assert.equal(new Set([...PROMPT_GUIDE.reviewed,...PROMPT_CATALOG.prompts].map(p=>p.id)).size,60);
assert.equal(views.find(v=>!v.hidden).id,'guide');
const counts={};for(const p of PROMPT_GUIDE.records){counts[p.type]=(counts[p.type]||0)+1;assert.ok(!('author' in p));assert.ok(!('authorId' in p));}
assert.equal(JSON.stringify(counts),JSON.stringify(PROMPT_GUIDE.meta.typeCounts));
for(const n of PROMPT_GUIDE.reviewed){assert.equal(hash(n.rawContent),audit.records.find(p=>p.id===n.id).contentSha256);renderReference(n.id);assert.ok($('#reference-content').innerHTML.includes(esc(n.rawContent)));}
let covered=0;for(const d of PROMPT_GUIDE.directions){renderGuide(d.id);assert.ok($('#guide-content').innerHTML.includes(d.title));assert.equal(PROMPT_GUIDE.records.filter(p=>p.direction===d.id).length,d.count);covered+=d.count;for(const id of d.examples)assert.ok(guideNote(id));}
assert.equal(covered,1554);
for(const c of PROMPT_GUIDE.categories){renderLibrary(['category',c.id]);assert.equal(libraryMatches().length,c.count);assert.equal(libraryCategory,c.name)}
renderLibrary(['uncategorized']);assert.equal(libraryMatches().length,716);
renderLibrary();const paged=new Set();for(let i=1;i<=Math.ceil(2270/LIBRARY_PAGE_SIZE);i++){libraryPage=i;renderLibraryResults();const ids=[...$('#library-results').innerHTML.matchAll(/https:\/\/prompts.chat\/prompts\/([a-z0-9]+)/g)].map(m=>m[1]);for(const id of ids){assert.ok(!paged.has(id));paged.add(id)}}assert.equal(paged.size,2270);
libraryPage=999;renderLibraryResults();assert.equal(libraryPage,57);
libraryQuery='nothing-matches-<test>';renderLibraryResults();assert.equal(libraryMatches().length,0);assert.ok($('#library-results').innerHTML.includes('没有匹配'));
libraryQuery='';libraryType='SKILL';renderLibraryResults();assert.equal(libraryMatches().length,72);
libraryType='all';libraryQuery='数据分析';assert.equal(libraryMatches().length,28);
libraryQuery='';renderLibrary();
fire('change',{target:{id:'library-direction',value:'writing'}});assert.ok(libraryMatches().length>0);
fire('change',{target:{id:'library-category',value:'Design'}});assert.equal(libraryDirection,'all');assert.equal(libraryMatches().length,30);
let steps=0;for(const c of GUIDE_CASES){renderPlaybook(c.id);for(const s of c.steps){assert.ok(guideRecord(s[1]));assert.ok(guideNote(s[1])||PROMPT_CATALOG.prompts.some(p=>p.id===s[1]));steps++}playbookDraft(c).task='<我的任务> $&';renderPlaybook(c.id);assert.ok($('#playbook-content').innerHTML.includes('&lt;我的任务&gt;'));assert.ok(playbookText(c).includes('<我的任务> $&'));fire('input',{target:{dataset:{guideField:'materials',guideCase:c.id},value:'真实材料'}});assert.ok($('#guide-draft').textContent.includes('真实材料'));}
for(const v of views){location.hash='#'+v.id;route();assert.equal(views.filter(x=>!x.hidden).length,1);assert.equal(views.find(x=>!x.hidden).id,v.id)}
location.hash='#bad';route();assert.equal(views.find(v=>!v.hidden).id,'guide');
renderReference('missing');assert.ok($('#reference-content').innerHTML.includes('没有此阅读样本'));
console.log(JSON.stringify({records:2270,categories:52,directions:16,reviewed:32,uniqueAnnotated:60,sourceHashes:'matched',indexPagination:'2270 unique records across 57 pages',cases:GUIDE_CASES.length,steps,routes:views.length,filters:'passed',taskEditing:'passed',scope:'内容和交互逻辑检查，不代替真实模型效果评测'},null,2));
`,ctx);
