'use strict';
const commitBase = 'https://github.com/Manavarya09/design-extract/blob/47f75bb68cd6fcb51c172868a3a1b814cd6bdeb4/';
const capabilities = [
  {status:'已实测基础值',kind:'observed',title:'把“看起来像”变成具体参数。',desc:'读取页面实际呈现的样式，统计常用颜色、字体、字号、间距、圆角和阴影，形成一份设计清单。',input:'一个浏览器能访问的网页地址。',output:'结构化设计对象、原始样式统计与归纳后的设计变量。',use:'参考站分析、旧站设计盘点、为改版准备参数。',proof:'测试页的品牌色 #2563eb、标题 48px、卡片圆角 12px 均被正确提取。',limit:'注意：归纳后的间距尺度可能遗漏原始值，设计语义也可能选错。'},
  {status:'已实测，发现采样局限',kind:'inferred',title:'同一张页面，观察不同状态。',desc:'在不同视口、明暗主题和悬停 / 聚焦状态下读取样式，整理发生了哪些变化。',input:'同一网页，以及不同尺寸、主题和交互触发。',output:'响应式差异、明暗配色、按钮与输入框的样式变化。',use:'梳理移动端适配、主题切换和组件状态规范。',proof:'375px 下识别到 32px 标题、单列布局和隐藏导航；暗色主色 #60a5fa 被识别。',limit:'注意：四个采样宽度不等于精确断点；固定等待 100ms 会错过慢动画终态。'},
  {status:'已验证文件生成',kind:'observed',title:'让设计资料进入不同工具。',desc:'将同一个设计对象转换为网页主题、设计变量和原生端主题代码，减少人工翻译格式。',input:'提取后的统一设计对象。',output:'CSS 变量、Tailwind、Figma 变量、React / Vue / Svelte 主题、SwiftUI / Compose / Flutter 等。',use:'把确认后的品牌样式移交给不同项目或技术栈。',proof:'30 个 API 导出器返回非空内容；基础 CLI 正常生成了 34 个顶层文件，两者计数口径不同。',limit:'注意：本轮未验证 Figma 导入和原生端编译，生成内容不代表兼容性已通过。'},
  {status:'说明已生成；MCP 未端到端实测',kind:'inferred',title:'给 AI 一份具体的设计依据。',desc:'用文字说明、结构化变量与提示词表达网站的设计特点，让开发工具有明确的参考。MCP 可提供查询这些结果的接口。',input:'颜色、排版、页面区域、组件和风格判断。',output:'DESIGN.md、设计说明、Agent 提示词与规则；MCP 查询结果。',use:'在 AI 页面开发中提供可核对的风格上下文。',proof:'已实际生成 DESIGN.md 与提示词；源码包含异步提取、任务查询、变量读取和导出接口。',limit:'注意：生成说明中的正文色出现误选；模型辅助和 MCP 客户端接入尚未实测。'},
  {status:'起始文件已生成，未运行',kind:'inferred',title:'生成开发起点，再补齐页面。',desc:'根据识别出的区域顺序和设计参数，选择现有模板生成组件骨架或 Next.js 起始项目。',input:'提取的主题、页面区域顺序和文案风格线索。',output:'组件骨架，以及包含页面、样式和配置的起始项目。',use:'快速搭起初稿，再重写内容、调整布局并接入真实业务。',proof:'本轮生成 7 个 Next.js 起始文件，区域顺序为 hero → feature-grid → footer。',limit:'注意：生成页面加入了源页面没有的模板文案。未构建、运行或验证像素级一致性。'},
  {status:'对比度已测；其余主要为源码确认',kind:'inferred',title:'找出值得进一步检查的差异。',desc:'检查可处理的文字对比度，并提供整站设计合并、变量变化、视觉差异和评分相关命令。',input:'单页、多个页面，或需要对比的设计基线。',output:'对比度失败项、设计差异、整站一致性与评分报告。',use:'辅助改版审查、主题一致性检查和视觉回归分析。',proof:'测试页故意设置的低对比度文字被发现；选定的上游自动化测试共 212 项通过。',limit:'注意：这不是完整 WCAG 审计；整站合并、视觉差异和评分有效性未做端到端验证。'}
];
const steps = [
  {kicker:'01 / 让网页真正呈现出来',title:'先让浏览器打开页面。',desc:'Playwright 启动浏览器，加载网页，等待网络与字体；读取的是运行后呈现的页面，而不只是下载一份 HTML 文本。',note:'本轮使用原创测试页，不需要登录或调用外部模型。',kind:'流程示意',code:'网页地址\n   ↓\n浏览器加载 HTML / CSS / JavaScript\n   ↓\n按钮在页面中完成渲染',source:'src/crawler.js'},
  {kicker:'02 / 采集当前状态下的实际值',title:'向浏览器询问“它现在是什么样”。',desc:'遍历页面元素，读取计算后的样式、CSS 变量与布局信息。可以在其他视口、主题和交互状态下再采一次。',note:'读取到的是当前运行状态。复杂页面可能受到采样数量与访问条件影响。',kind:'样本观测值节选',code:'按钮的计算样式\n\nbackground-color: rgb(37, 99, 235)\nfont-family: Arial\nfont-size: 16px\nborder-radius: 8px',source:'src/crawler.js'},
  {kicker:'03 / 将零散样式整理为候选规则',title:'统计相似值，再判断它们的角色。',desc:'颜色聚类会结合用量、可见面积与交互元素背景等线索来判断品牌主色；间距会聚类成候选尺度。',note:'从这一步开始包含推断。提取到某个值，不代表归纳一定正确。',kind:'分类逻辑概念示意',code:'rgb(37, 99, 235)\n   ↓ 统一颜色表示\n#2563eb\n   ↓ 结合按钮背景等线索排序\n候选角色：品牌主色',source:'src/extractors/colors.js'},
  {kicker:'04 / 分开记录值与含义',title:'把原始值和使用含义连接起来。',desc:'基础变量保存颜色值；语义变量引用基础变量，表达“主要操作颜色”等用途。字体、圆角与阴影也能组织成相似结构。',note:'语义名称是工具的整理结果，不等于原站作者的命名；需结合来源核对。',kind:'实际 token 路径与引用',code:'primitive.color.brand.primary\n  $value: "#2563eb"\n  $type: "color"\n\nsemantic.color.action.primary\n  $value: "{primitive.color.brand.primary}"',source:'src/formatters/dtcg-tokens.js'},
  {kicker:'05 / 交给下一步使用者',title:'同一份设计对象，转换为多种输出。',desc:'导出器把数据转换成设计说明、主题配置、变量文件和预览。页面生成器还会将它填入已有模板，生成开发起点。',note:'模型分类是可选补充。跨平台输出还需分别验证导入、编译和视觉效果。',kind:'输出关系示意',code:'统一设计对象\n  ├─ CSS / Tailwind → 网页样式\n  ├─ 变量 JSON → 设计资料\n  ├─ DESIGN.md → 人和 AI\n  └─ 页面模板 → 开发起点',source:'src/api.js'}
];
const modes = {
  light:{title:'明色 · 桌面',file:'fixture-light.png',alt:'原创明色测试页：蓝色按钮、三列卡片和已知的样式参数',width:1440,height:1000,caption:'已知值：品牌色 #2563eb、标题 48px、卡片圆角 12px、三列布局。点击图片可查看原图。'},
  dark:{title:'暗色 · 桌面',file:'fixture-dark.png',alt:'原创暗色测试页：深蓝背景、浅色文字和暗色主题品牌色',width:1440,height:1000,caption:'暗色主色 #60a5fa 被正确识别。本样本通过 prefers-color-scheme 切换主题，未测试需点击按钮的主题。'},
  mobile:{title:'明色 · 375px 手机',file:'fixture-mobile.png',alt:'375px 移动端完整测试页：32px 标题、单列卡片、导航隐藏',width:375,height:1469,caption:'375px 视口下，标题从 48px 变为 32px，卡片变为单列，导航隐藏。此图展示完整长页面。'}
};
const outputs = {
  css:{text:':root {\n  /* Colors — Primary */\n  --color-primary: #2563eb;\n  --color-secondary: #0f172a;\n  --color-accent: #cbd5e1;\n}',note:'来自实际导出的 CSS 文件，节选颜色声明；其余内容省略。'},
  tokens:{text:'"primary": {\n  "$value": "#2563eb",\n  "$type": "color"\n}',note:'实际 JSON 中 primitive.color.brand.primary 的节选。完整文件同时包含基础值和语义引用，可从左侧下载。'},
  doc:{text:'colors:\n  primary: "#2563eb"\n  background: "#f8fafc"\n  foreground: "#000000"\nspacing:\n  scale: "[8, 80]"',note:'实际 DESIGN.md 的字段节选：正文色和间距尺度存在已记录的偏差。这里只省略了外层结构与其他字段，没有修正工具结果。'}
};
const byId = id=>document.getElementById(id);
function wireTabs(attribute,select){
  const buttons=[...document.querySelectorAll(`[${attribute}]`)];
  function activate(button,focus=false){
    for(const item of buttons){const selected=item===button;item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;}
    const panel=byId(button.getAttribute('aria-controls'));panel.setAttribute('aria-labelledby',button.id);
    select(button.getAttribute(attribute));if(focus)button.focus();
  }
  buttons.forEach((button,index)=>{
    button.addEventListener('click',()=>activate(button));
    button.addEventListener('keydown',event=>{
      let target;
      if(['ArrowRight','ArrowDown'].includes(event.key))target=(index+1)%buttons.length;
      if(['ArrowLeft','ArrowUp'].includes(event.key))target=(index-1+buttons.length)%buttons.length;
      if(event.key==='Home')target=0;
      if(event.key==='End')target=buttons.length-1;
      if(target!==undefined){event.preventDefault();activate(buttons[target],true);}
    });
  });
}
wireTabs('data-cap',index=>{
  const item=capabilities[Number(index)];
  for(const key of ['title','desc','input','output','use','proof','limit'])byId(`cap-${key}`).textContent=item[key];
  byId('cap-status').textContent=item.status;byId('cap-status').className=`badge ${item.kind}`;
});
wireTabs('data-step',index=>{
  const item=steps[Number(index)];
  for(const key of ['kicker','title','desc','note','code'])byId(`step-${key}`).textContent=item[key];
  byId('trace-kind').textContent=item.kind;byId('step-source').href=commitBase+item.source;
});
wireTabs('data-mode',key=>{
  const item=modes[key];byId('specimen-title').textContent=item.title;byId('specimen-caption').textContent=item.caption;
  const image=byId('specimen-image');image.src=`media/${item.file}`;image.alt=item.alt;image.width=item.width;image.height=item.height;
  byId('specimen-link').href=`media/${item.file}`;byId('specimen-panel').classList.toggle('mobile',key==='mobile');
});
wireTabs('data-output',key=>{byId('output-code').textContent=outputs[key].text;byId('output-note').textContent=outputs[key].note;});
const navLinks=[...document.querySelectorAll('.sidebar nav a')];
const sections=navLinks.map(a=>document.querySelector(a.getAttribute('href')));
function updateNav(){
  const offset=window.innerWidth<=640?145:110;
  let active=sections[0];for(const section of sections)if(section.getBoundingClientRect().top<=offset)active=section;
  for(const link of navLinks){const current=link.hash===`#${active.id}`;link.classList.toggle('active',current);if(current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}
}
let ticking=false;
window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(()=>{updateNav();ticking=false;});ticking=true;}},{passive:true});
window.addEventListener('resize',updateNav);updateNav();
