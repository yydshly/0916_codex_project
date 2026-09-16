"""Generate the static guide from the saved source inventory (stdlib only)."""
import json
import shutil
from html import escape
from pathlib import Path
from guide_sections import render_sections

ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = json.loads((ROOT / 'research.json').read_text(encoding='utf-8'))
BASE = f"{SNAPSHOT['repo']}/blob/{SNAPSHOT['commit']}/"


def source(path, label='查看源码', line=None):
    return f'<a href="{BASE}{path}{f"#L{line}" if line else ""}" target="_blank" rel="noreferrer">{escape(label)} ↗</a>'


TYPES = {
    'article': {
        'label': '文章', 'title': '长文章，一次准备、多处填写',
        'intro': '把文章正文和封面交给不同平台的编辑器，减少反复复制、粘贴和上传。',
        'input': '标题、摘要、HTML / Markdown 正文、封面；部分适配器另处理标签、分类、原创声明和评论设置。',
        'output': '各平台发布编辑器中的文章内容。是否自动提交、如何处理正文图片，取决于具体适配器。',
        'examples': ['微信公众号', '知乎', 'CSDN', '掘金', '博客园', 'WordPress'],
        'limit': '火山引擎文章明确只填入、不自动发布；部分条目标注待线上验证。不能把注册表当成稳定可用清单。',
        'example_source': 'src/sync/article/volcengine.ts',
    },
    'dynamic': {
        'label': '图文动态', 'title': '短内容与图片，分发到社交平台',
        'intro': '准备一份正文和素材，再由各平台脚本填标题、插入内容、上传图片或视频。',
        'input': '标题、正文、图片列表、视频列表和可选标签。字段被声明，不代表每个平台都支持所有组合。',
        'output': '平台发帖页面中的图文内容；支持自动提交的适配器会根据开关点击发布。另有 Webhook 入口。',
        'examples': ['小红书', '微博', 'X', '即刻', 'LinkedIn', 'Webhook'],
        'limit': '抽查的小红书路径优先处理有图片的图文，按页面元素上传和粘贴；不能据此推定任意动态格式都适用。',
        'example_source': 'src/sync/dynamic/rednote.ts',
    },
    'video': {
        'label': '视频', 'title': '同一段视频，适配不同创作后台',
        'intro': '把视频文件、标题、简介和封面带入上传页面，适合已有成片的多平台分发。',
        'input': '视频文件、标题、简介；可选标签、横竖封面、分类、合集和定时时间。实际支持依平台而定。',
        'output': '平台后台的上传任务和表单内容。转码、审核、发布成功由平台处理，必须另行确认。',
        'examples': ['哔哩哔哩', '抖音', 'YouTube', 'TikTok', '视频号', '快手'],
        'limit': '抖音适配器会填写平台的定时发布控件。存在定时字段，不等于扩展有覆盖所有平台的持久调度队列。',
        'example_source': 'src/sync/video/douyin.ts',
    },
    'podcast': {
        'label': '播客', 'title': '音频上传与节目资料填写',
        'intro': '为播客提供独立数据类型和发布入口，将音频与节目描述交给平台编辑器。',
        'input': '音频、标题、描述；类型中还定义了可选封面、标签和分类。',
        'output': '平台上传页面中的音频和节目资料。小宇宙、Spotify 的抽查路径以上传和填写结束。',
        'examples': ['喜马拉雅', '小宇宙', 'Spotify', 'QQ 音乐', '荔枝', '蜻蜓 FM'],
        'limit': '本次抽查的小宇宙与 Spotify 实现没有最终点击发布步骤；注册为播客平台不代表支持自动上线。',
        'example_source': 'src/sync/podcast/xiaoyuzhou.ts',
    },
}


def capabilities():
    tabs, panels = [], []
    for index, (kind, item) in enumerate(TYPES.items()):
        inventory = SNAPSHOT['platform_registrations'][kind]
        count = inventory['count']
        tabs.append(f'<button role="tab" id="tab-{kind}" aria-controls="panel-{kind}" aria-selected="{str(index == 0).lower()}" tabindex="{0 if index == 0 else -1}">{item["label"]}<span>{count}</span></button>')
        platforms = ''.join(f'<a href="{BASE}{p["path"]}#L{p["line"]}" target="_blank" rel="noreferrer">{escape(p["label"])} ↗<small>{escape(p["key"])}</small></a>' for p in inventory['entries'])
        pills = ''.join(f'<span class="pill">{escape(name)}</span>' for name in item['examples'])
        panels.append(f'''<article class="panel" role="tabpanel" id="panel-{kind}" aria-labelledby="tab-{kind}" tabindex="0">
        <div class="panel-head"><h3>{item['title']}</h3><div class="source-link">{source(f'src/sync/{kind}.ts', '平台注册表')}</div></div>
        <p class="panel-lede">{item['intro']}</p><div class="pill-row">{pills}</div>
        <div class="spec-grid"><div><h4>你需要准备</h4><p>{item['input']}</p></div><div><h4>它会完成什么</h4><p>{item['output']}</p></div></div>
        <div class="callout">{item['limit']} {source(item['example_source'], '实现依据')}</div>
        <details class="platforms"><summary>查看全部 {count} 个注册条目</summary><p class="footnote">名称取自固定版本注册表与中文语言包；点名称查看注册位置。清单含实验性条目，未逐平台运行。</p><div class="platform-grid">{platforms}</div></details></article>''')
    return '<div class="type-tabs" role="tablist" aria-label="内容类型">' + ''.join(tabs) + '</div>' + ''.join(panels)


evidence = ''.join(f'<div>{source(e["path"], e["note"], e["line"])}<small>{escape(e["path"])}:{e["line"]}</small></div>' for e in SNAPSHOT['evidence'])

html = '''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="MultiPost 使用流程与实现原理：七步使用、三种调用方式、统一内容协议、浏览器调度、素材处理与平台适配。附固定源码证据与官方文档。"><title>MultiPost · 使用流程与实现原理</title><link rel="stylesheet" href="styles.css"><script src="app.js" defer></script></head>
<body><a href="#main" class="skip">跳转到正文</a>
<aside class="rail"><div class="brand">MultiPost<small>开源能力研究 / 010</small></div><nav aria-label="章节导航"><a href="#overview"><span>图</span> 我们的理解总览</a><a href="#usage"><span>一</span> 完整使用流程</a><a href="#methods"><span>一</span> 三种使用方式</a><a href="#principle"><span>二</span> 整体实现原理</a><a href="#mechanisms"><span>二</span> 关键机制详解</a><a href="#capabilities"><span>附</span> 内容与平台范围</a><a href="#boundaries"><span>附</span> 边界与验证</a></nav><div class="rail-bottom"><div class="rail-line"></div>源码研究 · v1.4.8<br>固定提交 e99ed1b<br>2026.09.17<br><br><a href="https://github.com/leaperone/MultiPost-Extension" target="_blank" rel="noreferrer">访问上游仓库 ↗</a></div></aside>
<main class="page" id="main"><div class="topline"><span>研究笔记 / 内容创作与分发</span><span class="status">源码已核对 · 发布未实测</span></div>
<header class="intro"><div><div class="kicker">MULTIPOST EXTENSION</div><h1>浏览器插件接入，<br><span>按平台要求填写与发布。</span></h1><p class="lede">将用户准备好的文章、图文、视频和播客，按目标平台要求填写、上传，并在适配器支持时提交发布。源码覆盖 70 余个平台／服务、110 项内容适配；最终结果仍需到平台确认。</p></div><div class="intro-note"><strong>两条主线，连起来读</strong><p>使用：准备 → 分发 → 核对结果。<br>原理：统一任务 → 浏览器执行 → 平台适配。每一步都对应具体能力与限制。</p></div></header>
<div class="reading-path"><a href="#usage"><b>第一部分 · 怎么使用</b><span>7 步完整流程 / 3 种接入方式</span></a><a href="#principle"><b>第二部分 · 怎么实现</b><span>3 层结构 / 8 步处理 / 8 个关键机制</span></a></div>
<section class="section" id="overview"><div class="section-heading"><div><div class="eyebrow">理解总览 / 一张图读懂</div><h2>能力、接入、平台与实现原理</h2></div><p>你准备内容，扩展处理各平台页面上的重复操作，最终到平台确认结果。</p></div><figure class="overview-figure"><a href="media/understanding-guide.png" target="_blank" rel="noreferrer" aria-label="打开 MultiPost 理解总览原图"><img src="media/understanding-guide.png" width="1448" height="1086" alt="MultiPost 原创研究总览：浏览器扩展的三种接入方式、四类内容、六步内部流程、代表平台及自动发布边界。文章42、图文31、视频30、播客7，共110个注册条目，未做真实发布实测。"></a><figcaption>原创研究信息图，非官方界面或运行截图。110 项为平台与内容类型的组合，不等于独立平台数。 <a href="media/understanding-guide.png" download="MultiPost-理解总览.png">下载原图 ↓</a></figcaption></figure></section>
{{USAGE}}
{{METHODS}}
{{PRINCIPLE}}
{{MECHANISMS}}
<section class="section" id="capabilities"><div class="section-heading"><div><div class="eyebrow">附录 / 内容与平台</div><h2>从内容类型看能力</h2></div><p>选择一种内容，查看输入、输出与平台范围。所有条目均可追溯到固定版本源码。</p></div><div class="metrics" aria-label="源码研究概览"><div class="metric"><strong>4<em>类</em></strong><small>内容输入类型</small></div><div class="metric"><strong>110<em>项</em></strong><small>平台 × 内容类型注册</small></div><div class="metric"><strong>70+<em>个</em></strong><small>源码登记平台／服务</small></div><div class="metric"><strong>Apache 2.0</strong><small>上游根目录许可证</small></div></div><p class="footnote">统计口径：平台名称去重、排除 Webhook，并合并今日头条 / 头条号，共 77 个平台／服务。110 项为跨内容类型注册总数，含 Webhook；均不代表已实测可用数量。</p><div class="capability">{{CAPABILITIES}}</div><noscript><p>当前脚本不可用，四类内容均展开显示，可直接阅读。</p></noscript></section>


<section class="section" id="boundaries"><div class="section-heading"><div><div class="eyebrow">附录 / 能力边界</div><h2>有实现，不等于没有限制</h2></div><p>把能力讲清楚，才能决定哪些操作可以自动化，哪些仍需要人来确认。</p></div><div class="matrix" role="region" aria-label="能力边界对照表，可横向滚动" tabindex="0"><table><thead><tr><th>关注点</th><th>源码能确认什么</th><th>使用时如何理解</th></tr></thead><tbody><tr><td>免登录、免密钥</td><td>目标平台会话用于发布；官网入口本次访问转到登录页；远程 ping 有 API Key 检查。</td><td>官网账号、平台账号与远程 API Key 是不同层次。</td></tr><tr><td>自动发布</td><td>知乎、小红书有条件点击；火山引擎文章拒绝自动发布。</td><td>按“平台 × 内容类型”评估，不能全局假设支持。</td></tr><tr><td>播客支持</td><td>小宇宙与 Spotify 的抽查路径上传音频、填入资料。</td><td>这两条路径未见最终点击发布步骤。</td></tr><tr><td>完成提示</td><td>后台返回标签页列表后，发布窗口就设置完成状态。</td><td>不是所有平台发布成功的回执；要确认内容 URL 或后台状态。</td></tr><tr><td>定时发布</td><td>官方云端 API 有计划任务；抖音视频适配器另可填写平台定时控件。</td><td>云端安排执行与平台定时上线不同；离线执行和调度可靠性未实测。</td></tr><tr><td>格式与稳定性</td><td>适配器依赖具体页面选择器、事件及等待时间。</td><td>平台改版、登录失效、素材限制都可能影响结果。</td></tr></tbody></table></div></section>
<section class="section" id="value"><div class="section-heading"><div><div class="eyebrow">附录 / 复用价值</div><h2>我们能借鉴什么？</h2></div></div><div class="verdict"><div><div class="kicker">研究判断</div><h3>值得参考的<br>内容分发模块。</h3><p>主要价值在于平台适配经验和执行端组织。适合接在编辑器、素材库或内容生成工具之后。</p><p>若要成为可靠的日常工具，还要补上结果确认、失败接管与维护机制。</p></div><div class="reuse"><article><h4>01 · 复用统一内容协议</h4><p>上游只整理内容、素材与目标平台，平台差异留给适配器，避免每个入口各写一遍发布逻辑。</p></article><article><h4>02 · 学习具体平台的处理方式</h4><p>富文本粘贴、图片上传、封面选择、页面等待与站内接口，是最有实际参考价值的实现细节。</p></article><article><h4>03 · 补齐逐平台结果与重试</h4><p>分别记录已填写、已提交、待审核、已发布和失败；重试前先检查是否已生成内容。</p></article><article><h4>04 · 建立可维护的能力矩阵</h4><p>记录每个平台的自动提交、封面、标签、定时和验证日期。以上为集成建议，并非已完成改造。</p></article></div></div></section>
<section class="section" id="start"><div class="section-heading"><div><div class="eyebrow">附录 / 实践验证</div><h2>先用一个小任务验证价值</h2></div><p>源码阅读已完成首轮；以下是建议验证路线，尚未执行真实发布。</p></div><div class="getting-started"><article class="card"><h3>先验证填写，再验证上线</h3><ol><li>安装扩展，在同一浏览器登录两个常用平台。</li><li>准备短文和一张自有图片，关闭自动发布。</li><li>检查两端标题、正文、图片、标签与封面。</li><li>再分别验证提交、审核和最终内容地址，记录差异。</li></ol><a class="text-link" href="https://chromewebstore.google.com/detail/multipost/dhohkaclnjgcikfoaacfgijgjgceofih" target="_blank" rel="noreferrer">Chrome 扩展 ↗</a><a class="text-link" href="https://microsoftedge.microsoft.com/addons/detail/multipost/ckoiphiceimehjkolnfffgbmihoppgjg" target="_blank" rel="noreferrer">Edge 扩展 ↗</a></article><article class="card"><h3>验证范围与复现版本</h3><p>已检查固定提交的入口、消息、素材与发布链路，并补充查阅官方操作和 API 文档。</p><p>尚未安装或构建扩展、执行上游测试、实测发布及远程 API。本页展示研究结果，不提供真实发布服务。</p><p>版本 <strong>1.4.8</strong> · 提交 <code>e99ed1be26c3bb898b026a436810d96e2c02d81d</code></p><a class="text-link" href="https://docs.multipost.app" target="_blank" rel="noreferrer">官方文档 ↗</a><a class="text-link" href="research.json" download>下载研究快照 ↓</a></article></div></section>
<section class="section" id="sources"><div class="source-box"><details><summary>研究依据 · 固定提交源码索引</summary><p class="footnote">结论来自源码静态阅读，不代表线上平台测试结果。永久链接固定到研究提交，便于复核。</p><div class="evidence-list">{{EVIDENCE}}</div></details></div></section>
<footer class="footer"><span>010 / MultiPost · 原创研究展示 · 2026.09.17</span><div><a href="{{LICENSE}}" target="_blank" rel="noreferrer">上游许可</a><a href="#main">返回顶部 ↑</a></div></footer></main></body></html>'''

for key, value in {
    'CAPABILITIES': capabilities(), 'EVIDENCE': evidence,
    **render_sections(source),
    'BRIDGE_SOURCE': source('src/contents/extension.ts', '消息桥接'),
    'API_SOURCE': source('src/background/services/api.ts', '服务联动'),
    'SCRAPER_SOURCE': source('src/contents/scraper/default.ts', '正文提取'),
    'LICENSE': BASE + 'LICENSE',
}.items():
    html = html.replace('{{' + key + '}}', value)

(ROOT / 'app/media').mkdir(exist_ok=True)
shutil.copy2(ROOT / 'assets/understanding-guide.png', ROOT / 'app/media/understanding-guide.png')
(ROOT / 'app/index.html').write_text(html, encoding='utf-8')
(ROOT / 'app/research.json').write_text(json.dumps(SNAPSHOT, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Generated MultiPost guide: four content panels, 110 registrations and source links.')
