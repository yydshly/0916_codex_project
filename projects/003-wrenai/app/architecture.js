import { makeSQL } from './lab.js';

// Educational walkthrough, not a recorded or executed LLM / RAG trace.
const sql = makeSQL({ scenario: 'region', month: '2026-08', region: '全部' });
const rows = '[\n  {"label":"华西", "revenue":19150},\n  {"label":"华南", "revenue":15750},\n  {"label":"华东", "revenue":12350}\n]';
const modeled = 'Orders → raw_orders\nCustomers → raw_customers\nrevenue = paid_amount - refund_amount';
const system = [
  {
    name:'理解问题', owner:'用户 / Agent / 大模型', role:'agent', evidence:'流程示意 · 未接模型',
    input:'自然语言问题、会话上下文和已知业务定义。', inputCode:'“2026 年 8 月各地区净收入是多少？”',
    actions:['Agent 将问题和可用工具说明提交给模型。','模型识别指标、时间范围、分组维度；必要时先获取业务定义。','存在歧义就追问，不自行把“收入”认定为某种口径。'],
    components:['会话上下文','工具说明','模型推理'],
    output:'明确的查询目标；下面是解释用的任务摘要，不是 Wren 固定接口。', outputCode:'指标：净收入\n范围：[2026-08-01, 2026-09-01)\n维度：客户所属地区\n结果：按收入降序',
    why:'先明确要回答的究竟是什么，避免 SQL 正确执行却回答了另一个问题。'
  },
  {
    name:'检索业务上下文', owner:'Agent → Wren Context / Memory', role:'context', evidence:'流程示意 · 未运行 RAG',
    input:'问题里的指标、维度和实体，以及项目中的模型与知识文件。', inputCode:'检索线索：净收入、订单、地区\n来源：MDL + knowledge/rules + knowledge/sql',
    actions:['读取模型、字段说明和业务规则，确定该用哪些表。','可选召回相似的已确认 SQL；安装 memory 依赖时可使用语义检索。','将相关片段返回 Agent，再加入模型上下文；没有检索模块时也可直接读取小规模定义。'],
    components:['get_context / memory fetch','recall_queries','模型与业务规则'],
    output:'供模型写 SQL 的上下文，不是业务查询结果。以下为教学示例。', outputCode:modeled+'\n只统计 paid 且非内部订单\n按 order_date 归属统计月\n按 customer_id 关联客户',
    why:'让模型知道用什么字段、公式和筛选条件，减少凭名字猜测业务的情况。'
  },
  {
    name:'生成模型 SQL', owner:'Agent ↔ 大模型服务', role:'agent', evidence:'示例 SQL · 本页为预设',
    input:'清楚的查询目标、相关模型与业务规则，以及工具的参数要求。', inputCode:'问题 + 上一步上下文\n可用模型：Orders、Customers\n可用计算字段：revenue',
    actions:['模型选择分组、筛选和排序方式，引用 MDL 中的模型名。','生成 SQL 或结构化工具调用请求。','模型不直接操作数据库；把调用意图交给 Agent 程序。'],
    components:['模型 API','工具调用参数','SQL 生成'],
    output:'针对业务模型的 SQL，还没有取得实际数字。', outputCode:sql,
    why:'把用户表达转换为引擎可处理的查询形式。生成质量仍需用业务问题集评估。'
  },
  {
    name:'执行工具调用', owner:'Agent → MCP / CLI / Python SDK', role:'agent', evidence:'官方接口路径 · 未接服务端',
    input:'模型提出的工具名、SQL 参数，以及 Agent 的执行策略。', inputCode:'调用意图示意：\ndry_plan(sql)\ndry_run(sql)\nrun_sql(sql)',
    actions:['Agent 客户端执行 MCP 调用，或通过 CLI / SDK 调用 Wren。','Wren 解析当前项目、加载编译后的 MDL 与数据库连接配置。','执行结果或错误经同一个工具接口返回；不同接入方式的工具名可不同。'],
    components:['MCP / CLI / SDK','target/mdl.json','connection profile'],
    output:'交给查询规划器的 SQL、模型与目标数据源信息。', outputCode:'{ modeled_sql, mdl_manifest, datasource }\n连接配置由服务端解析\n数据库密码不需要进入 SQL 提示词',
    why:'把模型的“想做什么”转换为真实函数调用。dry-plan / dry-run 是可由 Agent 编排的工具，并非每次强制按同一顺序执行。'
  },
  {
    name:'展开语义与规划', owner:'Wren 查询规划器 ↔ Rust wren-core', role:'engine', evidence:'服务端架构说明',
    input:'模型 SQL + MDL manifest + 目标数据库方言。', inputCode:'SUM(o.revenue)\nOrders / Customers\n'+modeled,
    actions:['sqlglot 解析查询并解析表、列引用，定位所需模型。','wren-core 提取相关 MDL，展开模型、计算字段及关系表达式。','CTE 重写器组织展开结果，执行规划层检查，再转换为目标 SQL 方言。'],
    components:['sqlglot','CTE rewrite','Rust / PyO3 / DataFusion'],
    output:'目标数据库能识别的 SQL。下面仅为等价展开示意，不是本次 dry-plan 输出。', outputCode:sql.replace('SUM(o.revenue)','SUM(o.paid_amount - o.refund_amount)').replace('"Orders"','raw_orders').replace('"Customers"','raw_customers'),
    why:'将抽象指标映射到真实字段，让净收入的计算来自可审核的模型定义。服务端 sqlglot 路径与浏览器 WASM 路径需要区分。'
  },
  {
    name:'校验与修正', owner:'Wren 校验工具 ↔ Agent ↔ 模型', role:'engine', evidence:'流程示意 · 字段错误已单独实测',
    input:'候选 SQL、规划结果，以及可能需要连接的实际数据库。', inputCode:'dry-plan：检查模型展开与目标 SQL\ndry-run：对实际数据源做校验',
    actions:['规划可以发现未定义的字段或模型；dry-run 可检验实际数据源接受情况。','工具把错误反馈给 Agent；Agent 再获取定义或让模型修正。','应用限制重试次数；业务含义无法确定时回到用户确认。'],
    components:['dry-plan / dry-run','结构化错误','Agent 重试策略'],
    output:'可继续执行的查询，或需要修正 / 澄清的反馈。', outputCode:'实际字段错误实验：\nNo field named nonexistent_column\n\n反馈 → 查看正确字段 → 修正 SQL\n→ 再校验 → 查询',
    why:'在错误进入结果前提供反馈。但语法和字段合法，仍不能保证时间范围、指标口径符合用户意图。'
  },
  {
    name:'执行数据查询', owner:'服务端连接器 → 目标数据库', role:'data', evidence:'服务端路径说明 · 数值来自 WASM 实验',
    input:'展开后的 SQL、连接配置和实际业务表。', inputCode:'目标示例：PostgreSQL / MySQL\n执行：筛选 → JOIN → 聚合 → 排序',
    actions:['连接器将目标 SQL 发送给数据库。','数据库根据真实记录计算，连接器处理返回类型。','SDK 可返回 PyArrow 表，工具层再把结果转换为适合客户端读取的内容。'],
    components:['数据库连接器','目标数据库','PyArrow / JSON'],
    output:'结构化结果行。以下数字来自同题合成数据的真实 WASM 实验，未验证服务端数据库。', outputCode:rows,
    why:'数字在计算层产生。RAG 提供知识，模型负责推理和操作规划，实际金额由数据查询得出。'
  },
  {
    name:'展示与经验回写', owner:'Agent / 大模型 / 前端应用', role:'agent', evidence:'前端已实测 · 模型总结未实测',
    input:'查询结果、原始问题、口径说明和执行状态。', inputCode:rows,
    actions:['Agent 将结果交给模型解释；应用据此呈现表格、图表或导出文件。','保留筛选条件和口径，让用户能核对答案。','经确认的问题与 SQL 可以写入 knowledge/sql，之后检索复用；不能只凭“执行成功”就认定业务正确。'],
    components:['结果解释','图表 / CSV','确认后的案例记忆'],
    output:'用户能阅读和核对的答案，并可形成下一次查询的示例。', outputCode:'2026 年 8 月，各地区净收入合计 47,250 元。\n华西：19,150；华南：15,750；华东：12,350。\n展示：条形图 + 明细表 + CSV\n口径：排除取消 / 内部订单，扣除退款',
    why:'把计算结果转成业务可用的信息。当前页面的解释文字来自模板；真正的模型总结与记忆写入属于下一阶段接入。'
  }
];
const experiment = [
  {
    name:'选择预设问题',owner:'本页控件 / lab.js',role:'agent',evidence:'当前页面功能',
    input:'问题类型、月份、地区和口径选择。',inputCode:'地区收入 / 2026-08 / 全部 / 净收入',
    actions:['控件把选择转换成明确参数。','makeSQL 从固定模板生成模型 SQL，makeMDL 选择计算字段公式。','这条路径不请求大模型，也不运行 RAG。'],components:['makeSQL','makeMDL'],
    output:'确定的模型 SQL 和 MDL。',outputCode:sql,why:'用可重复的输入研究引擎效果，不把预设问题包装成真实自然语言理解。'
  },
  {
    name:'载入合成数据',owner:'Wren WASM / registerJson',role:'data',evidence:'真实引擎实测',
    input:'39 笔合成订单和 6 个虚构客户。',inputCode:'raw_orders：金额、退款、日期、状态等\nraw_customers：客户 ID、名称、地区',
    actions:['初始化 WrenEngine，加载固定版本的 WASM。','registerJson 将两组 JSON 注册成内存表。','数据就在当前浏览器或 Node 进程，无远程数据库连接。'],components:['WrenEngine.init','registerJson','内存表'],
    output:'可供模型引用的物理表。',outputCode:'raw_orders：39 行\nraw_customers：6 行',why:'提供可核对的实际记录；额外加入取消、内部和全额退款订单，检验筛选和计算。'
  },
  {
    name:'装载业务模型',owner:'Wren WASM / loadMDL',role:'engine',evidence:'真实引擎实测',
    input:'MDL 对象与已注册的内存表。',inputCode:modeled,
    actions:['loadMDL 建立业务模型与内存表的映射。','在模型中登记 revenue 的计算表达式。','模型 SQL 可以引用 Orders 和 revenue；两表关系在本实验由显式 JOIN 给出。'],components:['loadMDL','模型映射','计算字段'],
    output:'具有业务语义的查询上下文。',outputCode:'净收入模型：revenue = paid_amount - refund_amount\n实付模型：revenue = paid_amount',why:'同一段查询可以随着模型的公式变化而改变结果，用实验直观看到 MDL 的作用。'
  },
  {
    name:'编译并计算',owner:'Wren WASM / DataFusion',role:'engine',evidence:'36 组查询实测',
    input:'固定 SQL + 当前口径模型 + 内存数据。',inputCode:'await engine.query(sql)',
    actions:['引擎解析字段与模型，展开计算表达式。','DataFusion 在本地执行 JOIN、筛选、汇总和排序。','返回行对象；未知字段实验会报错，没有调用服务端 sqlglot 或数据库连接器。'],components:['Wren 语义规则','DataFusion','query'],
    output:'真实计算得到的结果行。',outputCode:rows,why:'将“业务定义”真正作用于数据。独立逐笔计算核对了 36 组查询，而非只检查页面能显示。'
  },
  {
    name:'渲染结果',owner:'本页 app.js / 浏览器',role:'agent',evidence:'桌面 / 移动端已验证',
    input:'真实查询结果，或先前保存的已验证快照。',inputCode:rows,
    actions:['默认从 verified-results.json 读取回放结果。','启动真实引擎后，用本次 query 返回的行更新页面。','计算展示合计、绘制条形图、生成明细和 CSV；文字摘要使用模板。'],components:['draw','表格 / 条形图','CSV 下载'],
    output:'与本页问数实验一致的展示。',outputCode:'净收入：47,250 元\n实付金额：50,500 元\n口径差额：3,250 元\n默认回放 / 按需真实执行',why:'让读者能观察输入、公式和结果的关系。这段架构导览只解释流程，实际执行按钮在下方问数实验中。'
  }
];
const $ = id => document.getElementById(id);
let mode='system', current=0;
function render(){
  const stages=mode==='system'?system:experiment,step=stages[current];
  $('arch-scope').textContent=mode==='system'
    ?'完整链路 · 以下是一次问数的逻辑分解。Agent 按问题选择检索、校验和重试步骤；并非引擎里写死的八步流水线。'
    :'实测范围 · 本页从预设 SQL 开始，真实引擎处理合成数据。以下步骤是说明导览，切换步骤不会执行查询。';
  document.querySelector('.arch-foundation').hidden=mode==='experiment';
  document.querySelector('.arch-loops').hidden=mode==='experiment';
  document.querySelectorAll('[data-arch-mode]').forEach(b=>{const active=b.dataset.archMode===mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  // Keep the focused step button in the DOM when only the selection changes.
  if($('arch-flow').dataset.mode!==mode){
    $('arch-flow').replaceChildren();$('arch-flow').dataset.mode=mode;
    stages.forEach((stage,index)=>{
      const li=document.createElement('li'),button=document.createElement('button');button.type='button';button.className=`arch-node ${stage.role}`;
      button.setAttribute('aria-controls','arch-detail');button.dataset.step=index;
      const label=document.createElement('span');label.className='arch-node-label';label.textContent=`${String(index+1).padStart(2,'0')} / ${stage.role==='agent'?'交互与编排':stage.role==='context'?'上下文':stage.role==='engine'?'查询引擎':'数据层'}`;
      const title=document.createElement('strong');title.textContent=stage.name;
      const owner=document.createElement('small');owner.textContent=stage.owner;
      button.append(label,title,owner);button.addEventListener('click',()=>{current=index;render();});li.append(button);$('arch-flow').append(li);
    });
  }
  document.querySelectorAll('.arch-node').forEach(b=>{const active=Number(b.dataset.step)===current;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  $('arch-owner').textContent=step.owner;$('arch-title').textContent=`${String(current+1).padStart(2,'0')} / ${step.name}`;
  $('arch-evidence').textContent=step.evidence;$('arch-input').textContent=step.input;$('arch-input-code').textContent=step.inputCode;
  $('arch-output').textContent=step.output;$('arch-output-code').textContent=step.outputCode;$('arch-why').textContent=step.why;
  $('arch-actions').replaceChildren();for(const action of step.actions){const li=document.createElement('li');li.textContent=action;$('arch-actions').append(li);}
  $('arch-components').replaceChildren();for(const component of step.components){const span=document.createElement('span');span.textContent=component;$('arch-components').append(span);}
  $('arch-progress').textContent=`${current+1} / ${stages.length} · ${step.name}`;
  $('arch-prev').disabled=current===0;$('arch-next').disabled=current===stages.length-1;
}
document.querySelectorAll('[data-arch-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.archMode;current=0;render();}));
$('arch-prev').addEventListener('click',()=>{if(current>0){current--;render();}});
$('arch-next').addEventListener('click',()=>{const count=mode==='system'?system.length:experiment.length;if(current<count-1){current++;render();}});
render();
