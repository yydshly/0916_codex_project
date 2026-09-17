'use strict';
const GUIDE_CASES = [
 {id:'research',title:'研究一个新开源项目',goal:'判断这个库能做什么、值不值得继续投入，并形成易懂的研究页。',task:'研究一个开源项目，为我们的项目库写中文说明。',materials:'仓库链接、官方文档、固定版本、实际阅读或运行记录。',result:'结论摘要 → 能力与证据表 → 实际场景 → 价值与限制 → 后续动作。',steps:[
 ['明确要回答的问题','cmkccblmd0001l404jberaqiu','输入：仓库链接、我们的用途与约束。','输出：研究问题和完成标准；例如是否适合直接使用、参考代码还是只参考思路。'],
 ['建立来源与证据表','cmkneaj8k000hib04d4w2jaz8','输入：上一步的问题、官方文档与固定版本。','输出：结论、来源、日期、已核对内容与未知项。只借鉴来源注释方法，删掉原文的调查领域与预设立场。'],
 ['检查结构与关键路径','cmj5w8ysy000qrf0rzwgdwkxj','输入：证据表、实际代码、关注的使用路径。','输出：入口、依赖、输入输出和验证记录。缩小到研究范围，不按原文自动修复整个仓库。'],
 ['写成能看懂的说明','cmj2o5n930004xv0rc6uj6xt8','输入：经过核对的研究结论。','输出：先说用途与价值，再用一个场景解释；删掉术语，保留来源与限制。']
 ],rules:['以官方资料和固定版本为基础，为重要判断附来源。','明确区分文档宣称、源码可见、实际运行和我们推断。','用具体输入、动作和输出解释能力，说明对我们的参考价值。','只对授权范围开展研究；未运行的部分不写成已经验证。']},
 {id:'website',title:'把需求做成可用的网页',goal:'从用户要完成的任务出发，组织页面、交接、检查和验收。',task:'为一个开源项目制作中文研究展示网页。',materials:'研究内容、目标读者、现有网站、参考页面、需要支持的屏幕尺寸。',result:'任务与页面清单 → 设计约定 → 实现说明 → 问题清单 → 验收记录。',steps:[
 ['确定页面服务谁','cmmnb9dxg0001l8047jcrujr5','输入：用途、读者、核心内容、参考与不喜欢的样式。','输出：页面结构、风格和关键交互；先确保用户能读懂内容。'],
 ['写清实现要求','cmmxtsuq40001l704dlqlgxdr','输入：页面方案和内容。','输出：组件、状态、响应式规则与交接说明，再交给开发工具实现。'],
 ['检查视觉与操作','cmmoq1aqr000kle046h0960yk','输入：可运行网页、测试设备尺寸和操作路径。','输出：截图或定位信息、实际问题、修改建议。需要真实浏览器操作。'],
 ['逐项完成验收','cmmoq6w7o0004la042h9mga36','输入：修改后的网页与项目验收条件。','输出：已通过、未通过与未检查项目；生成清单不等于检查完成。']
 ],rules:['先让读者看懂用途、价值和下一步，再组织功能介绍。','明确页面结构、组件状态和不同屏幕宽度的处理。','完成真实操作与内容检查，发现问题后修复并复核。','把未检查项明确列出，验收记录只写实际结果。']},
 {id:'data',title:'把一份数据变成可信的报告',goal:'用真实字段回答问题，核对结果，再转成清晰的文字。',task:'分析一份项目使用数据，找出值得改进的环节。',materials:'数据文件或表结构、字段说明、统计时段、核心问题。',result:'数据口径 → 分析问题 → 可复核查询或计算 → 结果表 → 结论与局限。',steps:[
 ['确定数据能回答什么','cmjc4egev0001v80rm56oug7b','输入：真实数据、字段解释和业务问题。','输出：指标定义、缺失情况和可以回答的问题。'],
 ['生成并验证查询','cmj2xpzoy0001vr0rki0x5f85','输入：已确认的问题、完整表结构、数据库类型。','输出：查询及经核对的结果；删除原文猜测表关系的要求。非数据库材料可直接计算。'],
 ['解释发现与限制','cmj2o5n930004xv0rc6uj6xt8','输入：核对后的结果表和异常记录。','输出：通俗结论、支持数字、下一步；保留统计范围和无法判断的部分。']
 ],rules:['先确认字段、指标、时间与样本范围；缺少信息时列出缺口。','不猜测表关系、不补造数据；查询或计算需要复核。','每个重要结论对应一个数据结果，相关性不直接写成因果。','将事实、解释和下一步建议分开，保留数据局限。']},
 {id:'creative',title:'为研究内容准备封面与短片',goal:'把内容重点转成视觉要求，实际生成后再核对。',task:'为一个开源项目研究页准备主题封面与简短介绍视频。',materials:'准确的项目介绍、品牌或参考图、画幅、视频时长、可用的媒体工具。',result:'内容重点 → 视觉描述 → 实际图像 → 镜头描述 → 实际视频与修改记录。',steps:[
 ['先提炼信息','cmjrmfls5000jik04dzr4lgc1','输入：经过核对的项目介绍。','输出：封面与短片需要传达的一个重点，避免把所有功能塞进画面。'],
 ['组织图像要求','cmj211exv0005wa0stbf15gvm','输入：主题、主体、比例和参考。','输出：主体、构图、材质与光照要求。借用分层描述方式；是否用微缩城市风格由内容决定。'],
 ['组织镜头并实际生成','cmlaoyg1q0005jq04sbrlbzwd','输入：图像或素材、时长与展示目标。','输出：镜头、运动与节奏要求，再交给视频工具。饮品是原例主体，应替换；逐帧检查实际结果。']
 ],rules:['确保图像与视频表达的是已经核对的项目内容。','明确主体、构图、比例、风格、参考和需要保留的元素。','视频另补时长、镜头运动和段落顺序。','实际生成后核对文字与主体，保留失败和修改记录；效果依赖执行工具。']}
];
let libraryQuery='', libraryDirection='all', libraryCategory='all', libraryType='all', libraryPage=1;
const LIBRARY_PAGE_SIZE=40;
const guideDrafts={};
function guideRecord(id){return PROMPT_GUIDE.records.find(p=>p.id===id)}
function guideNote(id){return PROMPT_GUIDE.reviewed.find(p=>p.id===id)}
function guideSource(id){return 'https://prompts.chat/prompts/'+encodeURIComponent(id)}
function guideRef(id){const p=guideRecord(id);const n=guideNote(id);return `<a href="${n?'#reference/':'#catalog/'}${esc(id)}">${esc(n?.zhTitle||PROMPT_CATALOG.prompts.find(x=>x.id===id)?.zhTitle||p?.title||id)} →</a>`}
function directionName(id){return PROMPT_GUIDE.directions.find(d=>d.id===id)?.title||'未分类内容'}
function guideExamples(d){return d.examples.map(id=>{const p=guideRecord(id),n=guideNote(id);return `<article class="guide-example"><h3>${guideRef(id)}</h3><div class="original-title">${esc(p.title)}</div><p>${esc(n.reuse)}</p><p class="guide-caution"><strong>使用前：</strong>${esc(n.change)}</p></article>`}).join('')}
function renderGuide(id){
 const d=PROMPT_GUIDE.directions.find(d=>d.id===id);
 if(d){$('#guide-content').innerHTML=`<a class="backlink" href="#guide">← 返回 16 个使用方向</a><div class="eyebrow">${esc(d.priority)} · 阅读判断，未做效果评测</div><h1>${esc(d.title)}</h1><p class="lead">${esc(d.task)}</p><div class="task-summary">${[['借鉴什么',d.reuse],['要准备什么',d.input],['怎样验收',d.check],['哪些地方要判断',d.limit]].map(([k,v])=>`<div><span>${k}</span><p>${esc(v)}</p></div>`).join('')}</div><div class="section-heading"><h2>两篇真实样本：借鉴点与删改点</h2></div><div class="guide-two">${guideExamples(d)}</div><div class="guide-section"><h2>这一方向还可以去哪里找？</h2><p>以下 ${d.count} 条是按官网分类归并的索引数量，不是逐条评测后的推荐数量。例子可能跨分类选取。</p><div class="guide-tags">${d.categories.map(c=>{const cat=PROMPT_GUIDE.categories.find(x=>x.name===c);return `<a href="#library/category/${esc(cat.id)}">${esc(c)} · ${cat.count}</a>`}).join('')}</div><a class="button primary" href="#library/${esc(d.id)}">浏览此方向全部索引 →</a></div>`;return}
 const m=PROMPT_GUIDE.meta;
 $('#guide-content').innerHTML=`<div class="eyebrow">提示词参考地图 / 2026.09.17 快照</div><h1>遇到什么任务，<br>可以来这里找参考？</h1><p class="lead">对我们，最值得留下的是<strong>任务思路、检查清单、输出结构和风格描述</strong>。这是一个社区提示词收集与参考库。我们既可以提取有用要求，也可以从中发现任务点子，经过筛选、需求验证和原型试用，再推进产品。把实际用过、确实省事的做法沉淀下来。</p>
 <div class="guide-verdict"><strong>我们的判断：有参考价值，适合按需查阅。</strong><p>无需为了收集数量逐篇收藏，也无需先接入平台。简单任务直接描述需求；复杂、陌生或反复出现的任务，再来补齐遗漏。长提示词是否更好，需要同题对照才能知道。</p></div>
 <div class="catalog-stats"><div><strong>${m.total.toLocaleString()}</strong><span>公开目录索引</span></div><div><strong>16</strong><span>归纳使用方向</span></div><div><strong>32</strong><span>跨领域阅读样本</span></div><div><strong>30</strong><span>Design 专题详解</span></div></div><p class="catalog-scope">已遍历公开接口 23 页，2,270 个唯一条目，52 个有内容的分类；716 条未分类。16 个方向按官网分类归并，尚未逐篇审阅全目录。32 篇样本与 Design 专题重叠 2 篇，共 60 篇独立内容有阅读说明；未评测模型效果。</p>
 <figure class="understanding-figure"><a href="media/understanding-guide.png" target="_blank" rel="noopener"><img src="media/understanding-guide.png" width="1536" height="1024" alt="prompts.chat：社区提示词收集与参考库，归纳16类提示词主题，以发现点子、筛选机会、验证需求、做小原型、实际试用和迭代产品六步推进产品。" loading="lazy"></a><figcaption><strong>一张图：从提示词资料到产品点子</strong><span>我们的讨论归纳；16类是内容方向，产品设想仍需验证。</span><a href="media/understanding-guide.png" target="_blank" rel="noopener">查看原图 ↗</a></figcaption></figure>
 <div class="guide-start"><a href="#guide/research">研究新项目 →</a><a href="#guide/web">做清楚好用的网页 →</a><a href="#guide/engineering">检查代码与问题 →</a><a href="#guide/writing">把内容讲明白 →</a></div>
 <div class="section-heading"><div><div class="eyebrow">按任务查找</div><h2>16 个方向，先看与我们有关的</h2></div><a href="#library">查完整索引 →</a></div><p class="micro">优先级以我们当前的开源研究与网页制作工作为依据，属于本项目判断，不代表官网排名或质量认证。</p>
 <div class="direction-grid">${PROMPT_GUIDE.directions.map((d,i)=>`<a class="direction-card" href="#guide/${d.id}"><div class="direction-meta"><span>${String(i+1).padStart(2,'0')}</span><span class="priority ${d.priority==='优先参考'?'high':''}">${d.priority}</span></div><h3>${esc(d.title)}</h3><p>${esc(d.task)}</p><small>可借鉴：${esc(d.reuse)}</small><b>${d.count} 条相关分类索引 · 查看例子 →</b></a>`).join('')}</div>
 <div class="guide-section"><h2>怎样把这些方向串起来使用？</h2><p>上一阶段的实际结果，作为下一阶段的材料。下面是本研究设计的使用路径，引用真实条目；不是已执行的模型成果。</p><div class="guide-two">${GUIDE_CASES.map(c=>`<a class="guide-case" href="#playbook/${c.id}"><h3>${c.title} →</h3><p>${c.goal}</p><small>${c.steps.map(s=>s[0]).join(' → ')}</small></a>`).join('')}</div></div>
 <div class="guide-section"><h2>现在还有什么价值？</h2><div class="guide-two"><article class="guide-example"><h3>优先提取这些内容</h3><ul><li>你不熟悉领域的检查维度，例如组件状态、部署隔离、数据口径。</li><li>清楚的输出约定，例如结论、证据、影响、下一步。</li><li>多阶段任务的交接方式，例如需求 → 实现 → 验收。</li><li>具体视觉语言，例如构图、光照、材质和镜头运动。</li></ul></article><article class="guide-example"><h3>这些内容不必照搬</h3><ul><li>只有“扮演顶级专家”的泛化角色开场。</li><li>无限访问、保证收益、找出所有错误等过度承诺。</li><li>与你的技术栈、受众或任务不符的强制要求。</li><li>过长、重复、相互矛盾或尚未填完的模板。</li></ul></article></div></div>
 <div class="guide-section"><h2>拿到一条提示词后，按这五步处理</h2><ol class="reuse-steps"><li><strong>先定义任务。</strong>我要解决什么问题，需要什么结果？</li><li><strong>只抽取有用要求。</strong>留下检查项、结构和例子；删掉夸张身份与无关约束。</li><li><strong>补齐自己的材料。</strong>代码、数据、参考、版本、范围与工具条件。</li><li><strong>做一次小规模对照。</strong>同一任务、材料和模型，比较“直接说需求”和“补充模板要求”的结果。</li><li><strong>用过再保存。</strong>记录遗漏、错误、修改时间；只有确实有帮助才加入我们的常用模板。</li></ol><p class="micro">一次对照只能判断这项任务上的表现。保存时附来源、删改内容、模型与日期、输入输出例子及失败情况。</p><a class="button primary" href="#playbook/research">试着整理我的任务说明 →</a></div>
 <details class="disclosure"><summary>内容从哪里来？哪些数字容易误解？</summary><div class="guide-disclosure"><p>官方贡献指南允许社区用户提交提示词并同步到仓库，也要求投稿者自行测试。该要求不能证明每条内容经过统一评测。${external('https://github.com/f/prompts.chat/blob/main/CONTRIBUTING.md','查看贡献指南')}</p><p>本次官网类型标签：${Object.entries(m.typeCounts).map(([k,v])=>`${k} ${v}`).join(' · ')}。Agent Skill 分类有 85 条，SKILL 类型有 72 条，统计的是不同字段；不要混为可直接安装的完整技能数。</p><p>${esc(m.scope)} 官网标签可能错放；未分类条目保留独立入口，未用标题强行归类。</p><p>${external('https://prompts.chat/prompts','查看官网公开目录')} · ${external('https://prompts.chat/api/prompts?perPage=100&sort=oldest&page=1','核对公开接口')} · <a href="#library/uncategorized">浏览 716 条未分类内容</a></p></div></details>`;
}
function libraryMatches(){
 const q=libraryQuery.trim().toLocaleLowerCase();
 return PROMPT_GUIDE.records.filter(p=>(libraryDirection==='all'||p.direction===libraryDirection)&&(libraryCategory==='all'||p.category===libraryCategory)&&(libraryType==='all'||p.type===libraryType)&&(!q||[p.title,p.category,p.type,...p.tags,directionName(p.direction),guideNote(p.id)?.zhTitle||''].join(' ').toLocaleLowerCase().includes(q)));
}
function renderLibrary(path=[]){
 libraryDirection='all';libraryCategory='all';libraryPage=1;
 if(path[0]==='category'){libraryCategory=PROMPT_GUIDE.categories.find(c=>c.id===path[1])?.name||'all'}
 else if(path[0]==='uncategorized'||PROMPT_GUIDE.directions.some(d=>d.id===path[0]))libraryDirection=path[0];
 $('#library-direction').innerHTML='<option value="all">全部方向</option>'+PROMPT_GUIDE.directions.map(d=>`<option value="${d.id}">${esc(d.title)}（${d.count}）</option>`).join('')+'<option value="uncategorized">未分类（716）</option>';
 $('#library-category').innerHTML='<option value="all">全部官网分类</option>'+PROMPT_GUIDE.categories.map(c=>`<option value="${esc(c.name)}">${esc(c.name)}（${c.count}）</option>`).join('')+'<option value="未分类">未分类（716）</option>';
 $('#library-type').innerHTML='<option value="all">全部官网类型</option>'+Object.entries(PROMPT_GUIDE.meta.typeCounts).map(([k,v])=>`<option value="${k}">${k}（${v}）</option>`).join('');
 $('#library-direction').value=libraryDirection;$('#library-category').value=libraryCategory;$('#library-type').value=libraryType;$('#library-search').value=libraryQuery;
 renderLibraryResults();
}
function renderLibraryResults(){
 const items=libraryMatches(),pages=Math.max(1,Math.ceil(items.length/LIBRARY_PAGE_SIZE));libraryPage=Math.min(Math.max(1,libraryPage),pages);
 const start=(libraryPage-1)*LIBRARY_PAGE_SIZE;
 $('#library-count').textContent=`找到 ${items.length.toLocaleString()} 条 · 当前 ${items.length?start+1:0}–${Math.min(start+LIBRARY_PAGE_SIZE,items.length)} 条 · 第 ${libraryPage}/${pages} 页`;
 $('#library-results').innerHTML=items.slice(start,start+LIBRARY_PAGE_SIZE).map(p=>{const n=guideNote(p.id),design=PROMPT_CATALOG.prompts.find(x=>x.id===p.id);return `<article class="library-row"><div><div class="library-meta">${esc(directionName(p.direction))} / ${esc(p.category)} · ${esc(p.type)}</div><h3>${external(guideSource(p.id),p.title)}</h3>${n||design?`<p>${esc(n?.zhTitle||design.zhTitle)} · <a href="#${n?'reference':'catalog'}/${esc(p.id)}">查看中文阅读说明 →</a></p>`:'<p class="micro">仅索引收录；未逐条审阅或验证效果。</p>'}</div><span class="readiness">${n||design?'有阅读说明':'目录索引'}</span></article>`}).join('')||'<p class="empty">没有匹配。可清除筛选，或用英文原始标题关键词搜索。</p>';
 $('#library-pages').innerHTML=`<button class="button" data-library-page="${libraryPage-1}" ${libraryPage===1?'disabled':''}>上一页</button><span>${libraryPage} / ${pages}</span><button class="button" data-library-page="${libraryPage+1}" ${libraryPage===pages?'disabled':''}>下一页</button>`;
}
function renderReference(id){
 const p=guideRecord(id),n=guideNote(id);
 if(!p||!n){$('#reference-content').innerHTML='<h1>没有此阅读样本</h1><a href="#guide">返回参考地图 →</a>';return}
 const d=PROMPT_GUIDE.directions.find(d=>d.examples.includes(id));
 $('#reference-content').innerHTML=`<a class="backlink" href="#guide/${d.id}">← ${esc(d.title)}</a><div class="eyebrow">真实条目 / 原文已阅读，效果未实测</div><h1>${esc(n.zhTitle)}</h1><p class="detail-original-title">${esc(p.title)}</p><div class="task-summary"><div><span>借鉴点</span><p>${esc(n.reuse)}</p></div><div><span>使用前删改</span><p>${esc(n.change)}</p></div></div><p class="catalog-scope">官网分类 ${esc(p.category)} · 类型 ${esc(p.type)} · 2026-09-17 快照 · ${external(guideSource(id),'查看上游原条目')}</p><details class="raw-prompt"><summary>展开完整原文 · 保留原样便于核对</summary><pre class="raw-content">${esc(n.rawContent)}</pre></details><div class="action-row"><button class="button" data-guide-copy="${esc(id)}">复制原文</button><a class="button primary" href="#playbook/research">按任务重新组织要求 →</a></div><p class="micro">原文可能包含不适用或应删除的指令，请先阅读上方说明。页面只展示文本，不执行条目中的命令、文件操作或模型调用。</p>`;
}
function currentPlaybook(){return GUIDE_CASES.find(c=>c.id===location.hash.split('/')[1])||GUIDE_CASES[0]}
function playbookDraft(c){return guideDrafts[c.id]??=( {task:c.task,materials:c.materials,requirements:'使用中文；具体说明来源、交付物和未验证部分。'} )}
function playbookText(c){const d=playbookDraft(c);return `任务：${d.task}\n\n现有材料：${d.materials}\n\n额外要求：${d.requirements}\n\n处理要求：\n${c.rules.map((r,i)=>`${i+1}. ${r}`).join('\n')}\n\n希望得到：${c.result}\n\n请以实际可获得的材料和可用工具为依据；缺少的信息明确列出。`}
function renderPlaybook(id){
 const c=GUIDE_CASES.find(c=>c.id===id)||GUIDE_CASES[0],d=playbookDraft(c);
 $('#playbook-content').innerHTML=`<a class="backlink" href="#guide">← 返回参考地图</a><div class="eyebrow">本研究设计的使用路径 · 可填写与复制</div><h1>${esc(c.title)}</h1><p class="lead">${esc(c.goal)}</p><div class="guide-start">${GUIDE_CASES.map(x=>`<a href="#playbook/${x.id}" ${x.id===c.id?'aria-current="page"':''}>${x.title}</a>`).join('')}</div><p class="catalog-scope">真实提示词作为参考，本页流程与简版说明由我们重新组织。这里演示材料如何交接，没有实际生成结果，也不调用模型。</p><div class="real-recipe-steps">${c.steps.map(([title,sid,input,output],i)=>`<article class="real-step"><div class="real-step-number">${i+1}</div><div><h2>${title}</h2><p>${esc(input)}</p><p>${esc(output)}</p>${guideRef(sid)}</div></article>`).join('')}</div><div class="guide-section"><h2>把它改成我的任务说明</h2><p>保留关键要求，填入自己的材料即可复制给 AI。以下是我们的简版模板，不是上游原文拼接。填写只在本页内存中暂存，刷新后恢复默认。</p><div class="guide-two"><div class="guide-form">${[['task','我想完成什么'],['materials','现有材料与工具'],['requirements','补充要求']].map(([key,label])=>`<label>${label}<textarea rows="4" data-guide-field="${key}" data-guide-case="${c.id}">${esc(d[key])}</textarea></label>`).join('')}</div><div><pre class="guide-draft" id="guide-draft">${esc(playbookText(c))}</pre><button class="button primary" data-copy-playbook="${c.id}">复制我的任务说明</button></div></div></div><div class="guide-section"><h2>用完以后怎样判断要不要保存？</h2><p>用同一份材料先直接描述需求，再试加入模板的关键要求。核对事实是否正确、检查是否更完整、结果是否可用、人工修改是否减少。记录模型、日期、输入、修改点和失败情况；有帮助才保留，不必把每次成功都归功于模板。</p></div>`;
}
document.addEventListener('input',e=>{
 const t=e.target;
 if(t.id==='library-search'){libraryQuery=t.value;libraryPage=1;renderLibraryResults()}
 if(t.dataset?.guideField){const c=GUIDE_CASES.find(c=>c.id===t.dataset.guideCase);if(c&&['task','materials','requirements'].includes(t.dataset.guideField)){playbookDraft(c)[t.dataset.guideField]=t.value;$('#guide-draft').textContent=playbookText(c)}}
});
document.addEventListener('change',e=>{const t=e.target;if(!['library-direction','library-category','library-type'].includes(t.id))return;if(t.id==='library-direction'){libraryDirection=t.value;libraryCategory='all';$('#library-category').value='all'}if(t.id==='library-category'){libraryCategory=t.value;libraryDirection='all';$('#library-direction').value='all'}if(t.id==='library-type')libraryType=t.value;libraryPage=1;renderLibraryResults()});
document.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
 if(t.dataset.libraryPage){libraryPage=Number(t.dataset.libraryPage);renderLibraryResults();$('#library-count').scrollIntoView?.({block:'start'})}
 if(t.hasAttribute('data-library-reset')){libraryQuery='';libraryType='all';renderLibrary()}
 if(t.dataset.guideCopy){const n=guideNote(t.dataset.guideCopy);if(n)copy(n.rawContent)}
 if(t.dataset.copyPlaybook){const c=GUIDE_CASES.find(c=>c.id===t.dataset.copyPlaybook);if(c)copy(playbookText(c))}
});
