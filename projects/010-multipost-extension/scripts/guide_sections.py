"""Usage-first explanations and source-grounded implementation walkthrough."""


def render_sections(source):
    usage_steps = [
        ('安装并打开入口', '安装 Chrome / Edge 扩展，点击工具栏图标。当前版本会打开官网发布页；若出现登录页，先完成官网登录。', '建立“网页编辑内容 + 扩展执行操作”的使用环境。', 'src/popup/index.tsx'),
        ('准备目标平台账号', '在装有扩展的同一浏览器中，登录要分发的平台，并确认账号能进入创作后台。', '执行脚本使用这些页面现有的登录会话；扩展不会替你注册账号。', 'src/sync/common.ts'),
        ('按内容类型准备素材', '文章准备正文和封面；图文准备文案与图片；视频准备成片、简介和封面；播客准备音频与节目描述。', '不同类型有不同字段。它承担分发和填表，素材制作与各平台内容审核仍是独立环节。', 'src/sync/common.ts'),
        ('选平台，决定是否自动提交', '选择同一内容类型的目标平台。首次建议关闭“自动发布”，先观察填写效果。', '同一份内容交给多个平台适配器；关闭开关通常停在填写阶段，开启也取决于适配器是否实现提交。', 'src/sync/article/volcengine.ts'),
        ('发起分发，保留处理页面', '发起发布后，等待素材处理和各平台页面打开；大视频先少选平台，观察上传是否正常。', '扩展先处理资源，再打开、分组和操作标签页。它需要浏览器运行，并非将一份文件交给云端就结束。', 'src/tabs/publish.tsx'),
        ('逐页校对并完成提交', '检查标题、正文、图片、封面、分类与标签；未自动提交的平台由你补齐必填项，再确认发布。', '适配器减少重复操作，平台特有设置、登录验证、审核要求仍可能需要人工处理。', 'src/sync/article/zhihu.ts'),
        ('确认结果，再决定是否重试', '到平台内容管理页检查草稿、审核中或已发布状态。失败时先确认是否已创建内容，再重新执行。', '扩展的完成提示和标签页重载，不等于取得平台发布成功凭证，也不自带防重复发布保证。', 'src/background/services/tabs.ts'),
    ]
    rows = ''.join(f'<article class="usage-row"><div class="usage-num">{i:02d}</div><div><h3>{title}</h3><p>{action}</p></div><div class="usage-explain"><span>从这一步看能力</span><p>{result}</p>{source(path, "实现依据")}</div></article>' for i, (title, action, result, path) in enumerate(usage_steps, 1))
    usage = '''<section class="section" id="usage"><div class="section-heading"><div><div class="eyebrow">第一部分 / 使用流程</div><h2>从安装到确认结果，用户怎样完成一次分发？</h2></div><p>以“我已有内容，要发到几个平台”为例。左侧是你的操作，右侧说明这一步体现的能力。</p></div>
    <div class="callout"><strong>入口已核对：</strong>研究版本点击扩展图标会打开 <a href="https://multipost.app/dashboard/publish" target="_blank" rel="noreferrer">官网发布页</a>；2026-09-17 的公开页面访问被转到登录页。应区分官网账号、目标平台账号，以及远程调用使用的 API Key。以下流程依据源码与官方文档整理，尚未登录或执行发布。</div>
    <div class="usage-list">''' + rows + '''</div><p class="footnote">官方操作说明：<a href="https://multipost.app/docs/zh/user-guide/quick-start" target="_blank" rel="noreferrer">快速开始</a>。具体按钮与可选字段可能随官网更新；本页不把仓库残留的旧表单组件当成当前官网界面。</p></section>'''

    methods = '''<section class="section" id="methods"><div class="section-heading"><div><div class="eyebrow">第一部分 / 使用方式</div><h2>三种入口，共用浏览器执行端</h2></div><p>差别主要在“谁准备内容、谁发起任务”。目标平台的填写与上传仍由浏览器扩展完成。</p></div>
    <div class="method-summary"><a href="#method-human"><strong>人来操作</strong><span>官网 / 配套编辑器</span></a><a href="#method-web"><strong>自己的网页调用</strong><span>消息桥接 / 可信域名</span></a><a href="#method-server"><strong>服务端安排任务</strong><span>REST API / 已绑定客户端</span></a></div>
    <div class="method-card" id="method-human"><div class="method-title"><span>A</span><div><h3>通过官网或配套编辑器手动分发</h3><p>适合个人创作者，使用时无需自行写调用代码。</p></div></div><ol><li><strong>进入编辑入口：</strong>点击扩展图标前往官网发布页；文章可参考官方配套 Markdown 编辑器。</li><li><strong>准备内容：</strong>输入正文，附上对应图片、视频或音频；文章检查封面和排版。</li><li><strong>选择范围：</strong>勾选目标平台，决定仅自动填写还是尝试自动提交。</li><li><strong>观察执行：</strong>保持浏览器打开，逐页检查上传、正文和平台必填项。</li><li><strong>验收：</strong>以各平台内容管理页中的实际状态为准。</li></ol><div class="method-result"><b>能带来的便利</b> 同一份内容减少多次复制、上传和填表。<br><b>仍需要你做</b> 内容制作、账号登录、平台差异检查与结果确认。</div><p class="footnote">配套编辑器是另外的项目。官方说明要求添加题图；不能把这条编辑器要求推广为所有扩展入口的统一限制。<a href="https://multipost.app/docs/zh/user-guide/markdown-editor" target="_blank" rel="noreferrer">编辑器说明 ↗</a> · {{POPUP}}</p></div>
    <div class="method-card" id="method-web"><div class="method-title"><span>B</span><div><h3>将分发按钮接到自己的网页</h3><p>适合已有编辑器、素材管理页或内容生成页面的开发者。</p></div></div><ol><li><strong>安装扩展：</strong>使用同一浏览器打开自己的网页和目标平台。</li><li><strong>建立信任：</strong>网页请求加入可信域名，由用户在扩展窗口确认；已有可信域名可直接通过检查。</li><li><strong>查询能力：</strong>通过服务状态和平台列表消息获取扩展信息与平台注册键。</li><li><strong>构造任务：</strong>将选中的平台、内容字段与自动发布开关封装为统一数据，通过 <code>window.postMessage</code> 发出发布请求。</li><li><strong>处理回执：</strong>使用请求标识关联响应；收到 <code>received</code> 只能说明后台接收了请求，后续继续观察发布窗口和平台页面。</li></ol><div class="method-result"><b>能带来的便利</b> 保留自己的内容制作界面，把平台操作交给扩展。<br><b>需要的条件</b> 网页信任授权、已安装扩展和目标平台登录状态；该网页消息路径本身不检查云端 API Key。</div><p class="footnote">{{TRUST}} · {{BRIDGE}} · {{BACKGROUND}}</p></div>
    <div class="method-card" id="method-server"><div class="method-title"><span>C</span><div><h3>从脚本或服务端创建远程任务</h3><p>适合将发布接入内容生产流程，仍需一个在线的浏览器客户端。</p></div></div><ol><li><strong>取得密钥：</strong>按官方文档在控制台设置中创建 API Key。</li><li><strong>绑定客户端：</strong>扩展联动流程弹出确认窗口，确认后在扩展本地保存密钥；扩展向服务端登记 / 报告客户端信息。</li><li><strong>选择执行端：</strong>调用客户端列表接口，取得目标 <code>targetClientId</code>。</li><li><strong>创建任务：</strong>携带 Bearer Token 调用 <code>POST https://api.multipost.app/extension/task</code>，指定执行端、任务类型和内容。</li><li><strong>等待与核对：</strong>扩展 ping 收到 <code>NEW_TASK</code> 后打开任务 URL；调用任务详情接口追踪任务，再到平台核实最终结果。</li></ol><div class="method-result"><b>能带来的便利</b> 官方接口提供直接内容、已有草稿和计划任务等入口。<br><b>需要的条件</b> 云端服务、API Key、绑定且在线的浏览器客户端；本仓库只包含扩展端，服务端调度与执行闭环未在本次验证。</div><p class="footnote"><a href="https://multipost.app/docs/zh/api-reference/authentication" target="_blank" rel="noreferrer">鉴权</a> · <a href="https://multipost.app/docs/zh/api-reference/extension/task-create" target="_blank" rel="noreferrer">创建任务</a> · <a href="https://multipost.app/docs/zh/api-reference/extension/task-get" target="_blank" rel="noreferrer">查询任务</a> · {{LINK}} · {{REMOTE}}</p></div>
    <div class="callout"><strong>两种“定时”要分开：</strong>云端的计划任务决定何时安排执行；平台表单里的定时时间决定平台何时上线内容。扩展可填写部分平台的定时控件，但不能由此推断浏览器关闭后也能执行任务。</div></section>'''
    for key, path in {'POPUP':'src/popup/index.tsx','TRUST':'src/background/services/trust-domain.ts','BRIDGE':'src/contents/extension.ts','BACKGROUND':'src/background/index.ts','LINK':'src/tabs/link-extension.tsx','REMOTE':'src/background/services/api.ts'}.items():
        methods = methods.replace('{{'+key+'}}', source(path, '对应源码'))

    internals = [
        ('01', '内容变成统一任务', '前端把平台标识、正文、素材地址与自动发布开关放进 SyncData。平台注册表把每个标识连接到“发布地址 + 注入函数”。', 'src/sync/common.ts'),
        ('02', '网页消息进入扩展', '内容脚本监听网页消息，检查来源域名并转发 chrome.runtime 消息。后台先保存任务、返回 received，再打开扩展自己的发布窗口。', 'src/background/index.ts'),
        ('03', '原始内容和资源分开处理', '发布窗口保存原始数据为 origin，按内容类型获取资源并生成 Blob URL；部分正文图片地址被替换，为后续上传准备字节数据。', 'src/tabs/publish.tsx'),
        ('04', '按平台注册表打开页面', '普通路径逐个创建发布标签页，等待加载并加入标签组。页面加载后触发注入；每轮还等待约三秒，但不等待平台最终发布回执。', 'src/sync/common.ts'),
        ('05', '把适配函数放进目标页执行', 'chrome.scripting.executeScript 传入对应函数和任务数据。函数在具体页面里寻找标题框、正文编辑器和上传控件。', 'src/sync/common.ts'),
        ('06', '让编辑器接受文字与文件', '通过 value、input/change、ClipboardEvent、DataTransfer 和 File 等浏览器机制填表或模拟粘贴、选文件；部分适配器调用站内接口。', 'src/sync/article/zhihu.ts'),
        ('07', '按平台实现决定是否提交', '支持自动发布的函数读取 isAutoPublish 并尝试点击按钮；其他函数只填入，或明确拒绝自动提交。这个开关不会自动生成缺失的适配逻辑。', 'src/sync/article/volcengine.ts'),
        ('08', '标签页回到管理界面', '后台返回标签页集合并加入内存中的管理列表；发布窗口显示完成。当前链路缺少将每个平台的发布 ID / 内容 URL 汇总为成功条件的步骤。', 'src/background/services/tabs.ts'),
    ]
    steps = ''.join(f'<article class="step"><div class="number">{n} / 内部处理</div><h3>{title}</h3><p>{body}</p>{source(path, "源码位置")}</article>' for n,title,body,path in internals)
    principle = '''<section class="section" id="principle"><div class="section-heading"><div><div class="eyebrow">第二部分 / 实现原理</div><h2>本质：内容协议 + 浏览器调度 + 平台适配脚本</h2></div><p>上层决定“发什么、发到哪里”；扩展负责“打开哪一页、怎样操作”；平台负责真正保存、审核和发布。</p></div>
    <div class="architecture" aria-label="三层实现结构"><div><small>内容入口</small><strong>官网 / 自有网页 / 远程任务</strong><p>整理内容、平台与执行意图</p></div><span aria-hidden="true">↓</span><div><small>浏览器扩展</small><strong>消息桥接 → 素材处理 → 标签页调度</strong><p>按平台注册表找到对应适配函数</p></div><span aria-hidden="true">↓</span><div><small>目标平台页面</small><strong>填写编辑器 → 上传素材 → 可选提交</strong><p>沿用登录会话，最后由平台保存与审核</p></div></div>
    <p class="flow-label">原创源码示意。网页消息入口与远程任务入口在扩展侧汇合；云端服务内部不在这个仓库中。</p>
    <div class="process detailed-process">''' + steps + '''</div></section>'''

    mechanisms = [
        ('为什么能不为每个平台申请一个 API Key？', '多数适配函数直接操作用户已经登录的发布页面，提交动作沿用该页面的会话。网页消息桥接是否允许调用由可信域名控制；远程服务的 API Key 则用于云端鉴权。这是三层不同的条件，不能统称为“完全无需登录或密钥”。', 'src/contents/extension.ts'),
        ('为什么复制正文不是简单地给输入框赋值？', '标题框可设置 value 后派发 input 和 change；富文本编辑器通常维护自己的内容状态。以知乎为例，代码创建带 text/html 的粘贴事件，让编辑器按粘贴行为接收正文，再触发相关事件。页面选择器或编辑器机制变化时，这条适配路径就可能失效。', 'src/sync/article/zhihu.ts'),
        ('图片、音频、视频怎样进入上传控件？', '先从素材地址读取数据，再构造 File，加入 DataTransfer，把其 files 赋给页面文件输入控件并触发 change 等事件。Blob URL 是浏览器内的临时资源引用，不是已经上传到平台的永久链接。大文件与多个平台可能增加内存和等待成本。', 'src/sync/dynamic/rednote.ts'),
        ('所有平台都只是模拟点击吗？', '不是。WordPress 适配器还从页面上下文读取 nonce，调用站内媒体上传接口，再处理返回的素材地址。这说明“浏览器执行”可以结合 DOM 操作与站内请求，但每个平台的鉴权、接口和数据结构仍需分别适配。', 'src/sync/article/wordpress.ts'),
        ('为什么等待页面加载后还可能填不进去？', '标签页 complete 表示页面加载事件，不代表前端编辑器已准备好。适配器又使用选择器、MutationObserver、超时和固定延迟来等待具体控件。网络延迟、登录跳转和页面改版都会改变时序，因此固定等待不能保证所有场景成功。', 'src/sync/article/zhihu.ts'),
        ('“完成”提示为什么不是最终发布成功？', 'createTabsForPlatforms 返回的是标签页。注入由页面事件触发，公共链路没有把每个注入函数的最终结果收集为发布凭证；handlePublishComplete 收到回调后直接切换完成提示。因此“已接收、已开页、已填入、已提交、已上线”需要分开判断。', 'src/tabs/publish.tsx'),
        ('重试与任务管理做到什么程度？', '标签页管理记录保存在后台内存数组；重载功能更新页面地址并再次注册脚本注入。它方便恢复页面操作，但这段实现没有提供持久队列和发布去重语义。后台重启后的任务恢复、自动重试和服务端状态一致性需要另行验证。', 'src/background/services/tabs.ts'),
        ('网页文章抓取与发布是什么关系？', '抓取脚本先按 URL 选择站点提取器；若没有取到正文，则回退到 Readability。它可给内容制作提供输入，但抓取与分发是两条独立能力。仓库中保留了调用抓取的表单组件，当前 popup / options 已转到官网，不能据此声称该旧表单就是现在的使用界面。', 'src/contents/scraper/default.ts'),
    ]
    details=''.join(f'<details class="mechanism"><summary>{title}</summary><p>{body}</p>{source(path,"核对实现")}</details>' for title,body,path in mechanisms)
    technical='''<section class="section" id="mechanisms"><div class="section-heading"><div><div class="eyebrow">第二部分 / 关键机制</div><h2>把“怎么实现”讲到具体动作</h2></div><p>展开查看机制与限制的因果关系，而不是只记住几个技术名词。</p></div><div class="mechanism-list">'''+details+'''</div>
    <div class="worked-example"><div class="kicker">贯穿示例 / 同一篇文章发往知乎与火山引擎</div><h3>相同输入，为什么得到不同的操作结果？</h3><ol><li><strong>输入：</strong>标题、HTML / Markdown 正文、封面，以及两个 ARTICLE 平台标识，设置 <code>isAutoPublish: false</code>。</li><li><strong>公共处理：</strong>保留原始正文，读取素材，打开两个平台的发布页面并注入不同函数。</li><li><strong>知乎路径：</strong>使用原始标题与 HTML，派发粘贴事件写正文，通过文件控件上传处理后的封面；关闭自动发布时不触发代码中的提交点击。</li><li><strong>火山引擎路径：</strong>填写标题和正文，等待人工检查；若把开关改为 true，该函数会直接拒绝自动发布。</li><li><strong>得出的能力判断：</strong>它共享任务组织与素材处理，但“填写哪些字段、是否提交”由每个适配器决定；仍需在两个页面分别验收。</li></ol><p class="footnote">这是依据两个适配器推演的教学示例，未执行真实任务。''' + source('src/sync/article/zhihu.ts','知乎实现') + ' · ' + source('src/sync/article/volcengine.ts','火山引擎实现') + '''</p></div></section>'''
    return {'USAGE':usage,'METHODS':methods,'PRINCIPLE':principle,'MECHANISMS':technical}
