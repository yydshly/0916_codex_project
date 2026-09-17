"""从已忽略的公开目录快照生成静态索引；不会发布作者、媒体或账号字段。"""
import collections
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
PROJECT = Path(__file__).resolve().parents[1]
snapshot_path = ROOT / 'upstream/prompts-chat-wide/snapshot.json'
snapshot = json.loads(snapshot_path.read_text(encoding='utf-8'))
source = snapshot['prompts']
assert len(source) == len({p['id'] for p in source}) == snapshot['meta']['total']

# 分组仅归并官网分类，不声称已逐条完成语义重分类。
# id / 中文方向 / 优先级 / 官网分类 / 任务 / 可借鉴 / 准备材料 / 验收 / 边界
rows = [
('research','资料研究与证据整理','优先参考',['Research & Analysis'],
 '面对一个陌生项目或主题，找来源、辨认事实、形成可追溯的结论。',
 '研究范围、来源登记、事实与推断分开、缺失证据清单。',
 '研究问题、官方链接、版本与日期、已有材料、需要回答的决策。',
 '每个关键结论能回到原始资料；写清未验证部分。',
 '样本带有调查报道的立场和领域偏好；只借鉴证据结构，删掉预设结论。'),
('product','需求澄清与产品规划','优先参考',['Business','Business Strategy','Business Planning','Startup & Entrepreneurship'],
 '把“我想做一个工具”转成用户、问题、最小功能范围和验收条件。',
 '问题清单、必需与可选功能分离、用户路径、风险预演。',
 '目标用户、现有替代方案、资源约束、参考产品、成功标准。',
 '每项功能能对应用户问题；范围足够小且可以验证。',
 '市场与商业假设需要调研；分阶段询问和确认的频率应按实际合作习惯调整。'),
('web','网站、界面与设计交接','优先参考',['Web Development','Vibe Coding','Design'],
 '规划研究网页、整理设计规则、改造页面并检查交付质量。',
 '页面结构、字体间距规范、组件状态、开发交接与视觉验收清单。',
 '用户任务、内容、现有页面或代码、参考图、设备尺寸。',
 '内容易理解、操作能完成；检查真实页面和不同宽度。',
 '漂亮或专业的标题不是效果证明；模板中的框架、审美偏好与评分要重新判断。'),
('engineering','编程、调试与部署','优先参考',['Coding','Mobile Development','DevOps'],
 '开发功能、定位性能问题、审查代码，或设计部署流程。',
 '复现步骤、调用链、影响范围、修复优先级、验证证据。',
 '实际代码、技术版本、错误日志、复现输入、运行环境。',
 '复现问题并验证修复；性能结论有测量数据支持。',
 '不少模板绑定具体技术栈；模拟终端的文字不能当作真实命令执行结果。'),
('agents','Agent 任务与自动化流程','优先参考',['Agent Skill','Workflows','Agent Workflows','Automations','Automation & Workflows'],
 '把重复工作拆成步骤，定义输入输出、交接和停止条件。',
 '阶段划分、工具前提、失败处理、审查与验证顺序。',
 '具体任务、可用工具、授权范围、文件位置、异常处理要求。',
 '步骤真实执行、结果可核验、出错可定位；重复操作可控。',
 '官网分类 Agent Skill 与类型 SKILL 是两种口径；标签不保证有完整文件、脚本或可安装包。'),
('data','数据分析与 SQL','优先参考',['Data Science'],
 '从表格或数据库提出问题、生成查询、解释数据结果。',
 '字段定义、问题拆解、查询格式、非技术读者能理解的结论。',
 '真实表结构、字段口径、样本、时间范围、数据库方言。',
 '结果总量可对账、异常有解释、结论能从数据复算。',
 'SQL 样本允许猜测表关系，应改为要求真实结构并列出缺失信息。'),
('writing','写作、摘要与技术文档','优先参考',['Writing','Technical Writing','Blog Writing','Copywriting'],
 '把研究材料写成易读报告、说明文档、文章或摘要。',
 '受众与长度约束、保留事实、明确结构、删去术语和空话。',
 '原文、来源、读者、用途、长度、不能改动的事实。',
 '没有新增事实；读者看得懂核心结论，能找到下一步。',
 '简单改写直接说明目标通常就够了；无需为了角色设定保留长篇模板。'),
('marketing','市场、营销与销售表达','按需参考',['Marketing','Sales','Marketing & Sales','Market Analysis','GitHub Sponsors Profile'],
 '分析行业、组织落地页文案、梳理用户疑问或介绍开源项目。',
 '受众、利益点、证据、异议、行动入口的组织方式。',
 '真实产品信息、客户问题、数据日期、可公开的案例与证据。',
 '承诺有依据；市场数据有来源；效果通过实际反馈验证。',
 '转化率、收入和增长不能由提示词承诺；没有客户案例就不能编造社会证明。'),
('teaching','课程、教学与学术写作','按需参考',['Education','Teaching & Instruction','Course Creation','STEM & Science','Academic Writing','Kids & Early Learning'],
 '准备讲解、课程、活动、论文摘要和教学材料。',
 '学习目标、先修知识、练习、反馈、评估与跨学科例子。',
 '学习者水平、原始教材或论文、时长、知识边界、考核目标。',
 '解释准确，练习对应目标，文献引用真实存在。',
 '结构完整不等于知识正确；学术写作仍要回查论文和数据。'),
('learning','个人学习、语言与备考','按需参考',['Learning & Skills','Language Learning','Tutoring & Homework Help','Exam Preparation'],
 '学懂一个概念、练习外语、整理知识点或制定复习计划。',
 '先直觉后原理、具体例子、常见误解、练习与纠错。',
 '当前基础、目标、教材或考纲、可投入时间、答题记录。',
 '能自己解释和应用；纠错依据明确，学习计划可执行。',
 '基础翻译模板的额外价值有限；考试预测和“无限访问”类标题不能当承诺。'),
('office','会议、笔记与日常协作','按需参考',['Productivity','Note Taking','Email & Communication','Meeting & Collaboration'],
 '整理会议结论、待办、邮件和散落笔记。',
 '区分讨论与决定、标记负责人和期限、保留信息来源。',
 '真实会议记录、参与者、原始笔记、输出对象。',
 '每条任务有出处；未确定的负责人或时间明确标为待定。',
 'Note Guru 要求把密钥集中写入 secrets.md，应删除此步骤；改动原文件前先确认整理结果。'),
('career','求职、招聘与管理','按需参考',['HR & Recruiting','Leadership & Management'],
 '准备面试、检查简历与岗位匹配，或梳理管理任务。',
 '岗位要求映射、经验举证、模拟提问、差距清单。',
 '岗位说明、真实经历、目标、可分享的背景。',
 '修改后的简历不编造经历，练习能回答岗位相关问题。',
 '通用角色描述帮助有限；重点补充职位、成果和具体证据。'),
('image','图像、插画与视觉风格','按需参考',['Image Generation'],
 '寻找封面、海报、微缩场景、摄影和参考图改造的描述方式。',
 '主体、构图、镜头、材质、光照、风格和需要保留的元素。',
 '用途、主体或参考图、比例、品牌约束、执行图像模型。',
 '实际出图后核对构图、文字、主体一致性和使用尺寸。',
 '不同模型不一定接受同一套参数；样例中也会出现比例文字相互矛盾。'),
('media','视频、音乐与创意内容','按需参考',['Creative','Video Generation','Music'],
 '构思短片、镜头、音乐段落、故事或创意画面。',
 '镜头运动、节奏、时间顺序、音色、画面限制和叙事结构。',
 '素材、目标时长、画幅、风格、音乐或视频工具。',
 '实际观看或试听成果，检查运动、节奏与段落衔接。',
 '文本提示词不会自己生成视频或音乐；模型与工具的支持范围要单独确认。'),
('personal','生活规划与个人复盘','低优先级',['Self Improvement','Health & Wellness','Mindset & Motivation','Habits & Routines','Journaling & Reflection'],
 '梳理个人记录、计划、习惯和日常体验。',
 '开放式反思、事实记录、可执行的小步骤。',
 '本人愿意提供的真实经历、时间约束和目标。',
 '建议与实际条件相符，不把猜测当作个人事实。',
 '有的条目假设能访问全部历史聊天；涉及健康的模板不能当作专业诊断能力。'),
('finance','资金信息与财务报告','低优先级',['Finance & Budgeting'],
 '查看资助机会、整理财务信息或检查报告表达。',
 '条件、截止日期、数据时点、事实与判断的区分。',
 '原始数据、地区、币种、时点、适用规则、官方信息。',
 '逐项回查官方来源；规则适用性另行核实。',
 '收录的投资策略或合规措辞未经本项目验证，不能当作收益或合规保证。'),
]
directions = [dict(zip(['id','title','priority','categories','task','reuse','input','check','limit'],r)) for r in rows]
mapping = {c:d['id'] for d in directions for c in d['categories']}
all_categories = {p['category']['name'] for p in source if p.get('category')}
assert all_categories == set(mapping), (all_categories-set(mapping),set(mapping)-all_categories)
assert len(mapping) == sum(len(d['categories']) for d in directions)

# id / 中文说明 / 值得借鉴 / 使用前删改。均为阅读判断，非模型效果评测。
annotations = [
('cmkndxt600009ib04wxsx5q33','调查研究报告','把已确认事实、线索与推测分开，交代证据缺口。','删掉先入为主的对抗立场；来源可靠性应按证据判断，不按阵营判断。'),
('cmkneaj8k000hib04d4w2jaz8','来源查找与注释','为来源记录链接、摘要、相关性和局限。','原文限定美国监控主题并要求至少十条来源；改成自己的问题和充分证据，避免凑数量。'),
('cmkccblmd0001l404jberaqiu','需求访谈与产品定义','用问题、受众、范围、路径、约束、成功标准补齐需求。','原文逐类确认且禁止创建文件；结合任务阶段和用户既有授权调整，避免过度询问。'),
('cmqmzavqq0001l804kckgv1wd','项目失败预演','在开始前列失败原因与应对方案。','内容偏通用；补上项目约束、风险证据、负责人和触发条件。'),
('cmmnb9dxg0001l8047jcrujr5','网站设计启动','把定位、受众、风格、参考与页面范围写清，再形成设计方案。','删掉不适用的行业与审美偏好；按任务需要决定是否先审核概念。'),
('cmmxtuy2w0004l704mt7xxlr3','设计一致性检查','按排版、间距、颜色、组件、交互逐项检查。','补充代码或页面访问；要求证据位置，不将主观 1–10 分视为客观质量。'),
('cmjg7k8os0001jp04txkbd2u2','多服务部署方案','思考独立服务发布、触发规则、镜像和发布隔离。','原文绑定 SpringBoot、Jenkins、Kubernetes；先换成实际技术栈，不为套模板引入整套基础设施。'),
('cmjm27myb0007l204bl1kr9ch','移动端冷启动与性能诊断','从用户路径追踪阻塞调用、导入体积和前后台切换。','限定 Expo 与 Supabase 的假设需要核实；静态估计必须与真实性能测量区分。'),
('cmjj0xnvi000djs04t65yqmwi','代码变更审查','把需求与实际差异放在一起，关注破坏性变化和可执行反馈。','补充仓库约定、相关上下文、严重性和复现方式；不是自动审批。'),
('cmj5w8ysy000qrf0rzwgdwkxj','仓库分析与修复流程','按结构盘点、问题发现、优先级、修复验证、报告分阶段。','删除“找出所有问题”的过度承诺；纯研究时停止在分析，不自动修复全部代码。'),
('cmj2xpzoy0001vr0rki0x5f85','自然语言转 SQL','明确数据库类型、字段、输出约束，避免 SELECT *。','原文允许猜表关系且不追问；改为使用真实 schema，列出缺失条件，先验证查询。'),
('cmjc4egev0001v80rm56oug7b','数据问题与结论','先解释数据，再提出可回答的问题，最后用通俗语言解释发现。','模板很短；还需补指标口径、缺失值处理、时间范围与对账方法。'),
('cmj2o5n930004xv0rc6uj6xt8','清晰改写','保留原意、删术语与冗余、不增加事实，并解释主要修改。','原文和目标读者必须补齐；简单任务可以直接用这几条短要求。'),
('cmjrmfls5000jik04dzr4lgc1','限长摘要','保持中性、提取主要论点、约定最大长度。','中文任务应明确字数还是词数；重要限定条件不能因压缩被删掉。'),
('cmm7aph8m0001le04izoojs6t','落地页文案框架','围绕受众、用户疑问、利益点、证据和行动入口组织页面。','原文很长且生成框架而非成稿；按需保留章节，不把高转化当已验证效果。'),
('cmlb81i0c0001k104wd656gvq','行业与市场情报','固定时间范围，为统计和实质判断附来源，标出旧数据。','需要真实检索能力；缩减繁复推理术语，保留来源、单位、日期和不确定性。'),
('cmj2ukjgi000gvt0sssbmogpv','跨学科理解','为一个概念寻找其他领域的应用与类比。','仅一条通用请求；可直接提问，额外补充学习者背景和准确性要求。'),
('cmjumsu5r0001jx046qhejgnd','学术写作工作坊','把目标、材料、活动、最终作品和评价方式对应起来。','用实际受众、时长与材料替换泛化要求，不自动生成虚构参考文献。'),
('cmlyb7qxa0001lb04oaqrvkkx','分层讲懂技术概念','先生活类比，再原理和例子，最后总结常见误解。','类比需要说明适用边界；用真实练习检验是否学会。'),
('cmlnshkct0001l804psfqporc','中英翻译','保留含义和语气，按语境翻译。','“专家”角色本身价值有限；补术语表、受众和必须保留的名称。'),
('cmqt3f6yi0001k004vwcu3uv2','会议纪要与行动项','区分讨论、决定、负责人和期限。','原文含示例人名与决定，不能带入真实输出；未提及的责任人和日期标为待定。'),
('cmkvtj6tt0008kz04x1yv6d7h','笔记分类整理（需删改）','按主题整理并保留原文对应关系。','原文要求提取所有密钥至 secrets.md，且移动原文件；不要照搬，删除密钥汇集步骤并先预览整理计划。'),
('cmj9yc5sc000dsr0r43q0djc3','岗位面试练习','围绕具体职位生成提问和模拟面试。','补实际岗位与经历，要求针对回答反馈；泛化鼓励不等于有效训练。'),
('cmjoig6pd000gl504274nt4zr','简历与岗位匹配检查','比较岗位说明和简历，找优势、缺口与需要举证的经历。','只使用真实经历，不为了匹配岗位编造项目和成绩。'),
('cmj211exv0005wa0stbf15gvm','等距城市微缩场景','按视角、材质、天气、建筑、道具、文字分层描述画面。','原文把 16:9 写成竖版手机比例，存在矛盾；需先明确画幅。官网标为 TEXT，但用途是图像描述。'),
('cmj2r3xr90001xp0razy7qomp','建筑手稿叠加效果','在原图上描述草图、尺寸线、批注和工作过程质感。','需提供参考图；生成的尺寸和批注只是视觉元素，不能当真实工程数据。'),
('cmlaoyg1q0005jq04sbrlbzwd','饮品展示短视频','明确主体、画幅、镜头、运动、光照和不出现的元素。','补时长并匹配视频工具；实际旋转和液体效果需要生成后检查。'),
('cmklf0vbw0007l804at641q3d','电子音乐段落设计','描述速度、音色、构建段、停顿与高潮之间的结构。','原文面向特定 Suno 版本；音乐工具是否接受这些控制需要另测。'),
('cmn0i47ob0007ie04x7q9fhl4','温和个人反思','用可能性表达，少下结论，避免把推测当诊断。','作为表达方式参考；不能替代真实的人际与专业支持。'),
('cmlbpmehi0001kz04mtelk9q6','个人模式复盘（需删改）','要求用具体经历解释反复出现的问题，并提出小练习。','原文假设拥有完整聊天记忆且强调尖锐判断；需提供真实记录，要求证据并允许无法判断。'),
('cmo7ep2ng0001kw04nzdd194u','财务报告措辞检查（需删改）','标记日期、区分事实与解读，减少过度确定的措辞。','强制土耳其语且堆叠免责声明，未定义完整法域；不能据此宣称合规，需另行核实适用规则。'),
('cmo8mv66s0001l804ffp38ver','资助机会查找','按领域、资格、金额需求筛选，记录申请截止日期。','需真实检索并回查官方项目页；模板本身没有提供任何资助数据。'),
]
reviewed = []
byid = {p['id']:p for p in source}
for sid,zh,reuse,change in annotations:
    p = byid[sid]
    reviewed.append({'id':sid,'zhTitle':zh,'reuse':reuse,'change':change,'rawContent':p['content']})
for i,d in enumerate(directions):
    d['examples'] = [r['id'] for r in reviewed[i*2:i*2+2]]
    d['count'] = sum((p.get('category') or {}).get('name') in d['categories'] for p in source)

categories = []
for name in sorted(all_categories):
    ps = [p for p in source if (p.get('category') or {}).get('name') == name]
    cat = ps[0]['category']
    categories.append({'id':cat['id'],'name':name,'parent':(cat.get('parent') or {}).get('name'),'count':len(ps),'direction':mapping[name]})
records = []
for p in source:
    cat = p.get('category') or {}
    tags = [t.get('tag',t).get('name','') for t in p.get('tags',[]) if isinstance(t,dict)]
    records.append({'id':p['id'],'title':p['title'],'type':p['type'],'category':cat.get('name','未分类'),'direction':mapping.get(cat.get('name'),'uncategorized'),'tags':tags})
meta = dict(snapshot['meta'])
meta.update({'date':'2026-09-17','categoryCount':len(categories),'uncategorized':sum(p['category']=='未分类' for p in records),'typeCounts':dict(collections.Counter(p['type'] for p in source)), 'snapshotSha256':hashlib.sha256(snapshot_path.read_bytes()).hexdigest(), 'scope':'公开目录 API 的 23 页快照；排除私有、未列出、已删除及有非 related 入边的流程中间条目。不是站内全部数据库记录。'})
data = {'meta':meta,'directions':directions,'categories':categories,'records':records,'reviewed':reviewed}
(PROJECT/'app/guide-data.js').write_text('const PROMPT_GUIDE = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
audit = {'meta':meta,'categories':categories,'directions':[{k:v for k,v in d.items() if k in ['id','title','count','categories','examples']} for d in directions],'reviewedIds':[r['id'] for r in reviewed], 'records':[{'id':p['id'],'contentSha256':hashlib.sha256(p['content'].encode()).hexdigest()} for p in source]}
(PROJECT/'notes/guide-snapshot.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'records':len(records),'categories':len(categories),'directions':len(directions),'reviewed':len(reviewed),'categorized':sum(d['count'] for d in directions),'uncategorized':meta['uncategorized']},ensure_ascii=False))
