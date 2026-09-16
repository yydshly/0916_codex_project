'use strict';
const scenes = {
  growth: {
    title: '陪伴成长，不比较成长。', description: '第一次撑伞、随口说的小句子、送给你的画。照片之外，把当时的故事一起留下。', rule: '手动精选 + 发生时间。每一张都值得保留，不用用分数衡量。', wall: '小满的成长冰箱', caption: '不用每一天都特别，只要是我们的一天。', count: '张记忆', takeaway: '成长记录贴吧可以从家庭私密墙开始：孩子是故事的主角，家人是共同记录的人。',
    cards: [
      {id:'rain',type:'photo',tag:'第一次',date:'2026.06.12',title:'雨天，也有小冒险',summary:'第一次自己穿雨靴出门。',body:'出门前，你花了好一会儿才穿好两只雨靴。\n到了楼下，却又绕过了第一个水洼。你问：“它会不会也怕痒？”\n后来，我们一起跳了进去。今天没有去很远的地方，但已经是一次很好的冒险。',context:'妈妈记录 · 虚构成长故事'},
      {id:'quote',type:'yellow',tag:'童言童语',date:'2026.06.08',title:'今天的可爱发言',quote:'“月亮是不是\n太阳的晚安灯？”',summary:'睡前，突然抬头问我。',body:'拉上窗帘前，你指着月亮问了这个问题。\n我没有急着解释，只是说：“那你觉得，谁来关灯呢？”\n你想了想：“等大家都睡着，它也可以休息了。”',context:'爸爸记录 · 虚构成长故事'},
      {id:'drawing',type:'photo',tag:'小小作品',date:'2026.06.02',title:'我们家，多了一只猫',summary:'你说，猫也要手拉手。',body:'这张画里，每个人都有长长的手。你说这样就能拉住彼此。\n旁边那团绿色是你给猫画的草地，天上的三个太阳，让每个人都能晒到。\n画得像不像不重要，我想记住的是你介绍它时认真的样子。',context:'小满的画 · 示例内容'},
      {id:'ordinary',type:'lined',tag:'日常碎片',date:'2026.05.30',title:'普通周六，也想留下',summary:'一起买菜、洗番茄，最后吃掉了两颗还没上桌的。',body:'今天没有“第一次”，也没有特别的安排。\n你负责把番茄放进篮子，又负责把它们拿出来数一遍。\n想留住这个周六，因为很多年后，这些普通日子可能才是最想念的。',context:'妈妈记录 · 虚构成长故事'},
      {id:'milestone',type:'blue',tag:'小小里程碑',date:'2026.05.21',title:'“我想自己试试。”',big:'第一次',summary:'自己扣好了外套上的扣子。',body:'第一颗扣错了位置，第二次还是有点着急。\n你说：“再等我一下。”\n我们就安静地等了一会儿。后来你抬起头，笑着让我们看。想记录的，是你愿意再试一次。',context:'家人记录 · 示例不代表任何成长标准'},
      {id:'letter',type:'pink',tag:'写给未来',date:'2026.05.18',title:'给长大后的你',summary:'希望你记得，你不需要每天都很厉害。',body:'亲爱的小满：\n希望你记得，有些日子可以只是普通地过去。\n你不需要每一天都学会新东西，也不需要每一次都勇敢。\n这些小卡片留下的，是我们在一起的日子，而不是一份成绩单。',context:'写给未来的一封短信 · 虚构示例'}
    ]
  },
  reflection: {
    title:'给想法一点停留的空间。', description:'发生了什么、我当时怎么想、后来有没有新的理解。让记录之间有一段可以回看的距离。',rule:'当前关注 + 手动精选。允许问题没有答案，也允许以后改变看法。',wall:'写给自己的回看墙',caption:'不是每一个问题，都要今天有答案。',count:'条想法',takeaway:'个人反思墙的价值，在于看见想法的变化。真正的扩展重点是追记、关联与周期回顾。',
    cards:[
      {id:'pause',type:'yellow',tag:'正在练习',date:'2026.06.12',title:'把慢一点，也当成选择',quote:'不用把每一分钟\n都安排得有用。',summary:'今天留了半小时，什么也没做。',body:'原本想在午休把待办清空，后来决定出去走一小圈。\n回来以后事情没有变少，但我不再那么着急。\n后续想试试：每周留一段没有任务的时间。',context:'个人反思 · 虚构示例'},
      {id:'no',type:'lined',tag:'一个小进步',date:'2026.06.10',title:'今天，说了一次“不”',summary:'没有解释太多，也没有发生想象中的坏事。',body:'我拒绝了一件现在没有精力接下的事。对方说“没关系”。\n有时候让我为难的，是我预先想象出来的失望。',context:'个人反思 · 虚构示例'},
      {id:'question',type:'blue',tag:'还没想通',date:'2026.06.08',title:'我到底在着急什么？',big:'一个问号',summary:'先把问题留在这里。',body:'看到别人做出新作品时，我会忽然加快自己的节奏。\n我想知道，这份着急里，有多少是想做，有多少是怕落下。\n今天先不回答。',context:'未解的问题 · 虚构示例'},
      {id:'good',type:'pink',tag:'值得记住',date:'2026.06.06',title:'今天也有三件小好事',summary:'早点睡 / 收到回信 / 把桌面收拾干净。',body:'不是很大的进步，但都是实实在在发生的小事。\n记录它们，是为了以后不把这一天只记成“很忙”。',context:'日常记录 · 虚构示例'},
      {id:'revisit',type:'green',tag:'后来想想',date:'2026.06.03',title:'我改变了一点看法',summary:'上周觉得失败的尝试，今天派上了用场。',body:'上周做的方案没有被采用。今天的新问题却用到了里面的一小部分。\n也许“暂时没用”和“没有价值”之间，应该多留一点空间。',context:'后续追记概念 · 虚构示例'},
      {id:'weekly',type:'lined',tag:'周末回看',date:'2026.06.01',title:'下周，少做一件事',summary:'先把最重要的做完，再决定要不要增加。',body:'回看这周，最累的不是任务本身，而是不停切换。\n下周想试试只保留一个需要深度投入的主题。',context:'每周回顾 · 虚构示例'}
    ]
  },
  portfolio: {
    title:'每件作品，都有自己的故事。',description:'封面让人停下，过程让人理解。让完成品与探索中的尝试一起被看见。',rule:'代表作 + 主题策展。由你决定什么值得优先展示。',wall:'我的小型作品展',caption:'完成是一种成果，尝试也是。',count:'件作品',takeaway:'作品墙适合用作个人主页入口。下一层才是完整案例、在线体验和创作过程。',
    cards:[
      {id:'wall-project',type:'blue',tag:'交互设计',date:'作品示例 / 01',title:'把日子贴在这里',big:'日子 × 记忆',summary:'把零散的生活，变成可以回看的墙。',body:'创作问题：为什么照片存得越来越多，回看的次数却越来越少？\n设计想法：每张记录保留一段故事，让精选区成为重新遇见它的地方。\n这里展示的是作品说明示例，没有对应的外部产品。',context:'虚构作品 · 展示信息结构'},
      {id:'garden',type:'green',tag:'视觉实验',date:'作品示例 / 02',title:'城市里的小花园',quote:'给日常，\n留一点绿色。',summary:'一组关于散步与发现的视觉笔记。',body:'收集散步路上容易被忽略的颜色、形状和光影，尝试把它们整理成一组视觉笔记。',context:'虚构作品 · 无外部演示链接'},
      {id:'essay',type:'lined',tag:'写作',date:'作品示例 / 03',title:'关于“做完”的一篇随笔',summary:'有些想法，只有做出来才知道它是什么。',body:'这篇作品卡用文字而不是封面吸引读者。\n正式产品可以展开摘要、目录、写作背景和全文入口。',context:'虚构作品 · 展示文字型卡片'},
      {id:'calendar',type:'yellow',tag:'小工具',date:'作品示例 / 04',title:'不打分的日历',big:'记录 ≠ 考核',summary:'只记录发生过什么，不计算连续天数。',body:'设计目标：减少被数字催促的感觉，让记录回到个人生活本身。\n正式作品详情可以展示设计前后、交互演示和使用反馈。',context:'虚构作品 · 概念提案'},
      {id:'sketch',type:'pink',tag:'过程稿',date:'作品示例 / 05',title:'没采用的，也留一张',summary:'三个被放下的方向，和它们留下的启发。',body:'成品只展示了一条路径，过程稿可以解释为什么做出了最后的选择。\n这类内容适合与最终作品关联。',context:'虚构作品 · 过程展示'},
      {id:'next',type:'lined',tag:'进行中',date:'作品示例 / 06',title:'下一件，慢慢做',summary:'一个还没有名字的个人项目。',body:'公开作品墙也可以容纳进行中的探索。\n标明完成状态，避免让观众把提案当作已上线的产品。',context:'虚构作品 · 进行中状态'}
    ]
  },
  origin: {
    title:'出价，换一个更显眼的位置。',description:'原站把网站推广做成冰箱贴。这里用六个虚构网站，演示出价与位置之间的关系。',rule:'出价从高到低排列，最高价放中央。同价时本演示按固定编号排序；原站同价规则未确认。',wall:'竞价展示实验 · 虚构网站',caption:'移动左侧滑块，看看谁来到中央。',count:'个示例',takeaway:'从原站借鉴“内容物件化”的表达；成长、反思和作品场景不需要继承付费排序。',
    cards:[
      {id:'mine',bid:6,type:'yellow',tag:'你的模拟网站',date:'本地模拟',title:'我的小站',big:'HELLO!',summary:'一张正在尝试获得曝光的磁贴。',body:'在场景侧栏拖动模拟出价滑块，可以看到排名和中央位置变化。\n没有付款，也不会把任何网站提交给原站。',context:'本地竞价模拟'},
      {id:'o2',bid:9,type:'blue',tag:'工具',date:'虚构示例',title:'Paper Notes',big:'纸上灵感',summary:'收集那些来不及展开的想法。',body:'这是用于演示排名的虚构网站卡片，不对应实际网址。',context:'示例出价 $9'},
      {id:'o3',bid:7,type:'green',tag:'社区',date:'虚构示例',title:'Weekend Club',big:'周末见',summary:'给周末找一个小小的期待。',body:'这是用于演示排名的虚构网站卡片，不对应实际网址。',context:'示例出价 $7'},
      {id:'o4',bid:4,type:'lined',tag:'阅读',date:'虚构示例',title:'Slow Reading',quote:'一本书，\n慢慢读。',summary:'一处安静的阅读角落。',body:'这是用于演示排名的虚构网站卡片，不对应实际网址。',context:'示例出价 $4'},
      {id:'o5',bid:3,type:'pink',tag:'设计',date:'虚构示例',title:'Tiny Studio',summary:'为小想法做一点设计。',body:'这是用于演示排名的虚构网站卡片，不对应实际网址。',context:'示例出价 $3'},
      {id:'o6',bid:1,type:'lined',tag:'日常',date:'虚构示例',title:'Ordinary Days',summary:'收集值得记住的普通一天。',body:'原站说明最低出价 1 美元，前 15 名展示在门上，其余进入冷冻室。\n本演示只有六张卡片，不模拟支付或冷冻室。',context:'示例出价 $1'}
    ]
  }
};
Object.assign(scenes.growth.cards.find(c=>c.id==='rain'), {image:'media/rain-adventure.png',alt:'AI 示例插画：穿黄色雨衣和红色雨靴的孩子在花园里跳水洼',context:'妈妈记录 · 虚构成长故事 · AI 示例插画'});
Object.assign(scenes.growth.cards.find(c=>c.id==='drawing'), {image:'media/family-drawing.png',alt:'AI 示例插画：彩色蜡笔画的一家三口、猫、房子和太阳',body:'这张画里，每个人都有长长的手。你说这样就能拉住彼此。\n旁边那片绿色是你给猫画的草地，天上的太阳，要让每个人都能晒到。\n画得像不像不重要，我想记住的是你介绍它时认真的样子。',context:'模拟孩子画作的 AI 插画 · 非真实儿童作品'});
let currentScene = 'growth';
const orders = Object.fromEntries(Object.entries(scenes).map(([key,s])=>[key,s.cards.map(c=>c.id)]));
const positions = new Map();
const attentionStates = Object.fromEntries(Object.entries(scenes).filter(([key])=>key!=='origin').map(([key,scene])=>[key,window.AttentionModel.create(scene.cards.map(c=>c.id))]));
const attentionUndo = {}, focusViews = {}, drawerViews = {};
const attentionLabels = {focus:'当前焦点',important:'重点关注',later:'稍后再看'};
const board=document.querySelector('#magnet-board');
const dialog=document.querySelector('#story-dialog');
const status=document.querySelector('#live-status');
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function orderedCards(){const s=scenes[currentScene];return currentScene==='origin'?[...s.cards].sort((a,b)=>b.bid-a.bid||a.id.localeCompare(b.id)):orders[currentScene].map(id=>s.cards.find(c=>c.id===id));}
function attentionControl(c,level,suffix='card'){
  const id=`priority-${suffix}-${c.id}`;
  return `<div class="priority-controls"><label for="${id}">关注级别</label><select class="priority-select" id="${id}" data-priority-card="${c.id}" aria-label="${escapeHTML(c.title)}的关注级别">${Object.entries(attentionLabels).map(([value,label])=>`<option value="${value}" ${value===level?'selected':''}>${label}</option>`).join('')}</select></div>`;
}
function cardMarkup(c,i,level=''){
  return `<article class="magnet ${escapeHTML(c.type)} ${level?'priority-'+level:''}" data-id="${c.id}"><button class="drag-grip" aria-label="移动磁贴：${escapeHTML(c.title)}" title="拖动，或使用方向键调整位置">···</button><button class="magnet-body" aria-label="展开：${escapeHTML(c.title)}">${c.image?`<img class="card-visual" src="${c.image}" alt="${escapeHTML(c.alt)}" draggable="false">`:`<span class="card-date">${escapeHTML(c.date)} · ${escapeHTML(c.tag)}</span>`}${c.big?`<div class="big-word">${escapeHTML(c.big)}</div>`:''}${c.quote?`<div class="quote">${escapeHTML(c.quote).replace(/\n/g,'<br>')}</div>`:''}<h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.summary)}</p><span class="card-foot"><b>${currentScene==='origin'?`#${i+1} · $${c.bid}`:escapeHTML(c.tag)}</b><span>${c.image?escapeHTML(c.date):'展开故事 ↗'}</span></span></button>${level?attentionControl(c,level):i===0?'<span class="featured-tag" title="当前竞价首位">✳</span>':''}</article>`;
}
function clearScenePositions(){for(const key of positions.keys())if(key.startsWith(`${currentScene}:`))positions.delete(key);}
function focusPriorityControl(id){
  const el=document.querySelector(`[data-priority-card="${id}"]`);
  if(el){const details=el.closest('details');if(details)details.open=true;el.focus();}
}
function changeAttention(id,level){
  if(currentScene==='origin'||attentionStates[currentScene][id]===level)return;
  attentionUndo[currentScene]={state:{...attentionStates[currentScene]},positions:[...positions].filter(([key])=>key.startsWith(`${currentScene}:`))};
  attentionStates[currentScene]=window.AttentionModel.change(attentionStates[currentScene],id,level);
  if(level==='later')drawerViews[currentScene]=true;
  clearScenePositions();renderBoard();focusPriorityControl(id);
  const title=scenes[currentScene].cards.find(c=>c.id===id).title;
  document.querySelector('#priority-change-note').textContent=`“${title}”已设为${attentionLabels[level]}，可撤销。`;
  status.textContent=`已调整关注级别：${title}，${attentionLabels[level]}。`;
}
function bindAttentionControls(root){root.querySelectorAll('[data-priority-card]').forEach(select=>select.addEventListener('change',()=>{if(dialog.open)dialog.close();changeAttention(select.dataset.priorityCard,select.value);}));}
function renderBoard(){
  window.PanelFeel?.beforeRender();
  const cards=orderedCards(),personal=currentScene!=='origin',surface=document.querySelector('#fridge');
  document.querySelector('#attention-tools').hidden=!personal;
  document.querySelector('#attention-intro').hidden=!personal;
  document.querySelector('#priority-change-note').textContent='';
  board.classList.toggle('has-attention',personal);surface.classList.toggle('attention-surface',personal);
  surface.querySelector('.later-drawer')?.remove();
  if(personal){
    const groups=window.AttentionModel.group(cards,attentionStates[currentScene]);
    if(!groups.focus.length)focusViews[currentScene]=false;
    const focusOnly=Boolean(focusViews[currentScene]);
    board.classList.toggle('focus-only',focusOnly);surface.classList.toggle('focus-only-surface',focusOnly);
    const focusButton=document.querySelector('#focus-only');focusButton.disabled=!groups.focus.length;focusButton.setAttribute('aria-pressed',String(focusOnly));focusButton.textContent=focusOnly?'返回分层全览':'只看焦点';
    document.querySelector('#undo-priority').disabled=!attentionUndo[currentScene];
    document.querySelector('#attention-counts').innerHTML=`<span><b>${groups.focus.length}</b>焦点</span><span><b>${groups.important.length}</b>重点</span><span><b>${groups.later.length}</b>稍后</span>`;
    document.querySelector('#attention-intro').textContent=currentScene==='growth'?'关注级别只表示此刻想回看什么，不给孩子或记忆打分。':'当前焦点最多一张；其他重点保留摘要，稍后内容可随时展开。';
    board.innerHTML=`<section class="attention-zone" aria-label="当前焦点"><div class="attention-zone-heading"><strong>01 · 当前焦点</strong><small>一次突出一张</small></div>${groups.focus.map((c,i)=>cardMarkup(c,i,'focus')).join('')||'<div class="attention-empty"><b>此刻想关注哪一张？</b>从重点或稍后列表中，将一张卡片设为「当前焦点」。</div>'}</section><section class="attention-zone attention-secondary" aria-label="重点关注"><div class="attention-zone-heading"><strong>02 · 重点关注</strong><small>保留摘要，随时展开</small></div>${groups.important.map((c,i)=>cardMarkup(c,i,'important')).join('')||'<div class="attention-empty">暂时没有其他重点。稍后的内容也可以提升到这里。</div>'}</section>`;
    const drawer=document.createElement('details'),sceneKey=currentScene;drawer.className='later-drawer';drawer.open=Boolean(drawerViews[currentScene]);
    drawer.innerHTML=`<summary>03 · 稍后再看（${groups.later.length}）<span>收起展示，不会删除</span></summary><div class="later-list">${groups.later.map(c=>`<div class="later-card"><button class="later-open" data-open-story="${c.id}"><b>${escapeHTML(c.title)}</b><small>${escapeHTML(c.date)} · ${escapeHTML(c.tag)} ↗</small></button>${attentionControl(c,'later','drawer')}</div>`).join('')||'<p class="later-empty">所有卡片都在关注区，没有遗漏。</p>'}</div>`;
    drawer.addEventListener('toggle',()=>{drawerViews[sceneKey]=drawer.open;});
    surface.insertBefore(drawer,surface.querySelector('.fridge-bottom'));
    drawer.querySelectorAll('[data-open-story]').forEach(button=>button.addEventListener('click',()=>openStory(button.dataset.openStory)));
    bindAttentionControls(surface);
  }else{
    board.classList.remove('focus-only');surface.classList.remove('focus-only-surface');
    board.innerHTML=cards.map((c,i)=>cardMarkup(c,i)).join('');
    const mine=scenes.origin.cards.find(c=>c.id==='mine');document.querySelector('#bid-result').textContent=`当前排名 #${cards.findIndex(c=>c.id==='mine')+1} / ${cards.length}`;document.querySelector('#bid-value').value=`$${mine.bid}`;
  }
  board.querySelectorAll('.magnet').forEach(el=>{applyPosition(el);el.querySelector('.magnet-body').addEventListener('click',()=>openStory(el.dataset.id));setupDrag(el);});
}
function setScene(key,announce=true){if(!scenes[key])return;currentScene=key;const s=scenes[key];document.querySelectorAll('[data-scene]').forEach(b=>{b.classList.toggle('active',b.dataset.scene===key);b.setAttribute('aria-pressed',String(b.dataset.scene===key));});for(const [id,value] of Object.entries({'scene-title':s.title,'scene-description':s.description,'scene-rule':s.rule,'wall-name':s.wall,'wall-caption':s.caption,'record-count':`${s.cards.length} ${s.count}`,'takeaway':s.takeaway}))document.getElementById(id).textContent=value;document.querySelector('#bid-demo').hidden=key!=='origin';renderBoard();if(announce)status.textContent=`已切换：${s.wall}`;}
function openStory(id){
  const c=scenes[currentScene].cards.find(c=>c.id===id),personal=currentScene!=='origin',level=personal?attentionStates[currentScene][id]:'';
  document.querySelector('#story-content').innerHTML=`${c.image?`<img class="story-hero" src="${c.image}" alt="${escapeHTML(c.alt)}">`:''}<div class="story-text"><p class="eyebrow">${escapeHTML(c.date)} / ${escapeHTML(c.tag)}</p><h2 id="story-title">${escapeHTML(c.title)}</h2><p>${escapeHTML(c.body)}</p><p class="story-context">${escapeHTML(c.context)}</p>${personal?`<div class="story-priority">${attentionControl(c,level,'story')}<p>最多突出一张。设置新焦点后，原焦点转入重点关注。</p></div>`:''}<div class="story-actions">${personal?`<button class="primary-button" id="feature-card" ${level==='focus'?'disabled':''}>${level==='focus'?'已是当前焦点':'设为当前焦点'}</button>`:''}<button class="secondary-button" id="close-story">回到墙上</button></div></div>`;
  document.querySelector('#close-story').onclick=()=>dialog.close();
  const feature=document.querySelector('#feature-card');if(feature)feature.onclick=()=>{dialog.close();changeAttention(id,'focus');};
  bindAttentionControls(dialog);dialog.showModal();
}
function positionKey(el){return `${currentScene}:${el.dataset.id}`;}
function applyPosition(el){const p=positions.get(positionKey(el))||{x:0,y:0};el.style.setProperty('--dx',`${p.x}px`);el.style.setProperty('--dy',`${p.y}px`);}
function moveCard(el,x,y){
  const range=Math.min(90,board.clientWidth*.16),margin=18;
  let minX=Math.min(0,Math.max(-range,margin-el.offsetLeft)),maxX=Math.max(0,Math.min(range,board.clientWidth-el.offsetLeft-el.offsetWidth-margin));
  let minY=Math.min(0,Math.max(-65,margin-el.offsetTop)),maxY=Math.max(0,Math.min(65,board.clientHeight-el.offsetTop-el.offsetHeight-margin));
  if(document.body.dataset.panelTheme==='blueprint'){minX=Math.ceil(minX/20)*20;maxX=Math.floor(maxX/20)*20;minY=Math.ceil(minY/20)*20;maxY=Math.floor(maxY/20)*20;}
  const p={x:Math.max(minX,Math.min(maxX,x)),y:Math.max(minY,Math.min(maxY,y))};
  positions.set(positionKey(el),p);applyPosition(el);return p;
}
function setupDrag(el){
  const grip=el.querySelector('.drag-grip');let start=null;
  grip.addEventListener('pointerdown',e=>{
    if(e.button!==0||start)return;
    const p=positions.get(positionKey(el))||{x:0,y:0};
    start={pointer:e.pointerId,clientX:e.clientX,clientY:e.clientY,lastX:e.clientX,lastY:e.clientY,time:performance.now(),x:p.x,y:p.y,vx:0,vy:0};
    window.PanelFeel?.pickup(el);grip.setPointerCapture(e.pointerId);el.classList.add('dragging');
  });
  grip.addEventListener('pointermove',e=>{
    if(!start||e.pointerId!==start.pointer)return;
    const now=performance.now(),dt=Math.max((now-start.time)/1000,.008),dx=e.clientX-start.clientX,dy=e.clientY-start.clientY;
    start.vx=(e.clientX-start.lastX)/dt;start.vy=(e.clientY-start.lastY)/dt;start.lastX=e.clientX;start.lastY=e.clientY;start.time=now;
    moveCard(el,start.x+dx,start.y+dy);window.PanelFeel?.drag(el,dx,dy,start.vx);
  });
  function finish(e){
    if(!start||e.pointerId!==start.pointer)return;
    const drag=start;start=null;el.classList.remove('dragging');
    if(e.type!=='pointerup'){window.PanelFeel?.cancel(el);return;}
    const current=positions.get(positionKey(el))||{x:0,y:0};
    const snap=window.PanelPhysics.snap(document.body.dataset.panelTheme,current.x,current.y);
    const placed=moveCard(el,snap.x,snap.y);
    const fresh=performance.now()-drag.time<100;
    window.PanelFeel?.settle(el,fresh?drag.vx:0,fresh?drag.vy:0,{x:current.x-placed.x,y:current.y-placed.y});
    status.textContent='磁贴已放下，仅本次浏览有效。';
  }
  grip.addEventListener('pointerup',finish);grip.addEventListener('pointercancel',finish);grip.addEventListener('lostpointercapture',finish);
  grip.addEventListener('keydown',e=>{
    const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
    if(!directions[e.key])return;e.preventDefault();
    const p=positions.get(positionKey(el))||{x:0,y:0},step=document.body.dataset.panelTheme==='blueprint'?20:10;
    moveCard(el,p.x+directions[e.key][0]*step,p.y+directions[e.key][1]*step);
    window.PanelFeel?.settle(el,directions[e.key][0]*60,directions[e.key][1]*60);
    status.textContent='磁贴位置已调整。';
  });
}
function showView(){const name=location.hash.slice(1);const view=['wall','workbench','possibilities','blueprint'].includes(name)?name:'wall';document.querySelectorAll('.view').forEach(el=>el.hidden=el.id!==view);document.querySelectorAll('[data-view]').forEach(a=>{a.classList.toggle('active',a.dataset.view===view);if(a.dataset.view===view)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});document.title=`${{wall:'磁贴体验',workbench:'项目与日报',possibilities:'可以长成什么',blueprint:'从想法到产品'}[view]} · 把日子贴在这里`;}
document.querySelectorAll('[data-scene]').forEach(b=>b.addEventListener('click',()=>setScene(b.dataset.scene)));
document.querySelectorAll('[data-preview]').forEach(b=>b.addEventListener('click',()=>{setScene(b.dataset.preview);location.hash='wall';window.scrollTo({top:0,behavior:'auto'});}));
document.querySelector('#reset-layout').addEventListener('click',()=>{for(const key of positions.keys())if(key.startsWith(`${currentScene}:`))positions.delete(key);orders[currentScene]=scenes[currentScene].cards.map(c=>c.id);renderBoard();status.textContent='已还原当前场景的摆放位置。';});
document.querySelector('#bid').addEventListener('input',e=>{scenes.origin.cards.find(c=>c.id==='mine').bid=Number(e.target.value);renderBoard();});
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
window.addEventListener('hashchange',()=>{showView();window.scrollTo({top:0,behavior:'auto'});});
document.querySelector('#focus-only').addEventListener('click',()=>{focusViews[currentScene]=!focusViews[currentScene];renderBoard();document.querySelector('#focus-only').focus();status.textContent=focusViews[currentScene]?'专注模式：只显示当前焦点。':'已返回分层全览，其他内容未丢失。';});
document.querySelector('#undo-priority').addEventListener('click',()=>{const last=attentionUndo[currentScene];if(!last)return;attentionStates[currentScene]=last.state;clearScenePositions();for(const [key,value] of last.positions)positions.set(key,value);delete attentionUndo[currentScene];renderBoard();const focusButton=document.querySelector('#focus-only');(focusButton.disabled?(board.querySelector('.priority-select')||document.querySelector('.scene.active')):focusButton).focus();document.querySelector('#priority-change-note').textContent='已撤销上一次关注级别调整。';status.textContent='已恢复之前的关注级别。';});
setScene('growth',false);showView();
