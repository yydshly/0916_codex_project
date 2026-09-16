"""Build the static Chinese guide from authored content and the research snapshot."""
import json
import shutil
from html import escape as esc
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
APP = PROJECT / 'app'
DATA = json.loads((PROJECT / 'research.json').read_text(encoding='utf-8'))
COMMIT = DATA['commit']
BASE = f'https://github.com/mediago-dev/mediago/blob/{COMMIT}/'
EVIDENCE = {e['id']: e for e in DATA['evidence']}


def refs(*ids):
    return '<div class="evidence-line">源码依据：' + ''.join(f'<a href="#ref-{x}">{x} ↗</a>' for x in ids) + '</div>'


def heading(number, title, intro=''):
    return f'<div class="section-head"><span class="section-num">{number}</span><h2>{title}</h2></div>' + (f'<p class="section-intro">{intro}</p>' if intro else '')


SCENARIOS = [
    dict(id='web', label='网页里能播放的视频', title='场景一 · 保存网页中的视频', desc='你知道播放页，却不知道真正的视频地址。适合自己或获授权内容的离线保存。', prep='安装并启动桌面版；准备能正常播放的网页；设置保存目录。需要登录的内容，先在相关浏览器会话中取得正常访问权限。',
         steps=[
             ('打开页面并触发播放', '在 MediaGo 的资源提取浏览器打开网页；有些播放器要点击播放或切换到目标视频后才发送媒体请求。', '浏览器真正加载页面，嗅探器才能看到该会话发出的网络请求。'),
             ('找到候选资源', '查看识别结果，结合标题、页面、类型判断目标。', '系统通过媒体 URL 规则、HLS 响应类型或站点适配器产生候选；同一页面也可能包含广告和多档画质。'),
             ('确认资源与清晰度', '若结果提供 HLS 变体，选择需要的清晰度；普通站点任务使用相应类型。', 'Core 检查主播放列表，整理分辨率、带宽、变体地址；这里只获取清单信息，不代表完整视频已下载。'),
             ('建立并启动下载任务', '确认名称、目录和资源，再发起下载。', '系统保留任务必需的请求上下文，创建记录，按任务类型进入相应下载引擎。'),
             ('等待下载与合并', '观察状态、速度和日志；遇到失败时查看具体原因。', 'HLS 由 N_m3u8DL-RE 等执行；进度来自引擎输出，完成后检查实际生成的媒体文件。'),
             ('检查文件再决定转换', '打开成品，核对时长、画面与声音；需要时转为音频或其他格式。', '下载保存与 FFmpeg 转换是不同阶段；转换质量不能补回原视频没有的细节。')],
         result='文件位于执行下载的桌面机器保存目录。成功状态说明找到了符合条件的产物，仍建议核对完整性。', failure='没找到资源：先确认实际播放，再尝试扩展或已知媒体地址。403/失效：检查会话、Referer 和签名时效。检测到候选不等于拥有下载权限。', refs=['E01','E02','E04','E10']),
    dict(id='site', label='B 站与其他站点链接', title='场景二 · 直接提交视频网站链接', desc='你已经有单个视频的页面链接，希望省去手动找媒体地址的步骤。', prep='MediaGo 已运行；准备具体视频/单条帖子的页面地址。对需要登录的内容，确认引擎能获得所需会话信息。',
         steps=[
             ('复制具体内容链接', '优先使用单个视频页或帖子链接，而非网站首页、搜索页或账号主页。', 'MediaGo 的规则对 B 站 video、YouTube watch/shorts、X status 等具体形式做识别。'),
             ('新建任务并确认类型', '提交 URL，确认 B 站、youtube/yt-dlp 或小红书等下载类型。', '类型推断只覆盖部分域名与路径；未知页面默认可能被当作 direct，不能假定全部自动转给 yt-dlp。'),
             ('补全任务信息', '确认文件名和保存目录；需要的访问上下文应来自有效会话。', 'B 站任务进入 BBDown；YouTube、X、抖音/TikTok 等相应任务进入 yt-dlp，小红书使用独立类型但也执行 yt-dlp。'),
             ('由引擎解析网站', '开始下载，等待站点解析。', '引擎与网站交互，获得可下载格式和媒体地址；MediaGo 负责参数、执行和状态，不维护千余站点的全部解析算法。'),
             ('下载并跟踪实际产物', '查看进度，直到任务结束。', '引擎下载媒体，必要时处理音视频合并；MediaGo 读取输出和文件变化，记录真实路径。'),
             ('验证结果或排查站点问题', '检查成品；失败时区分链接形式、登录条件、网络与引擎兼容性。', '站点支持列表是引擎范围，不是当前内容必定成功的承诺；本研究未对这些站点做实际下载。')],
         result='得到本地视频文件与任务记录。可进一步转换音频；这里不承诺字幕、弹幕、全集或收藏夹的完整产品支持。', failure='当某站点属于 yt-dlp 支持范围，但 MediaGo 没有自动识别规则时，可明确选择 yt-dlp 通道后再验证；不能把网页 HTML 当视频文件。', refs=['E01','E05','E06','E10']),
    dict(id='batch', label='批量链接与文件', title='场景三 · 批量整理一组媒体链接', desc='你已有一组媒体地址或已知站点视频链接，希望统一排队、命名并管理结果。', prep='准备明确的 URL 清单，区分页面链接、m3u8 和直接文件链接；确定目录、可用磁盘空间及任务并发数。',
         steps=[
             ('整理输入清单', '去掉无效和重复链接，并为不同来源标明类型。', '批量任务是多个 URL 的集合，不表示软件会自动爬取整个网站或账号。'),
             ('批量建立记录', '通过批量入口或 HTTP 的 tasks 数组提交任务。', '任务服务准备文件名并检查 URL 重复；不同入口的重复处理结果应按返回信息确认。'),
             ('选择是否立即启动', '按需要启动任务，再设置同时运行数量。', '数据库记录与内存队列分开；超出并发槽位的任务等待调度。'),
             ('按类型执行下载', '让列表逐项执行，观察单个失败任务。', 'direct 调用 aria2c，m3u8 调用流媒体引擎，站点链接调用解析器；任务并发与单任务内部连接数是两个维度。'),
             ('检查失败并有选择地重试', '阅读日志后修正链接、类型或会话，再重启相应任务。', '没有凭据、地址过期或引擎参数问题不会因为不断重试自动解决。'),
             ('核对文件清单', '检查实际保存文件、大小、时长和缺失项。', '完成状态记录真实产物；有任务记录不代表宕机后一定自动恢复所有运行状态。')],
         result='获得一组本地媒体文件和可查询的任务列表。适合有限清单的资料保存与工作流接入。', failure='默认 direct schema 未映射 headers/proxy，即使任务保存了头也不代表交给 aria2c；带防盗链的直链应单独验证。', refs=['E06','E07','E08','E09']),
    dict(id='live', label='直播录制与收尾', title='场景四 · 保存正在进行的直播', desc='保存可访问直播流在录制窗口内的内容；直播与固定时长视频的结束方式不同。', prep='准备有效直播媒体源、稳定网络和足够空间。该场景以源码中的 HLS 直播路径为依据，未进行真实直播录制。',
         steps=[
             ('发现当前直播流', '在播放页触发直播播放，或直接提交有效清单地址。', '直播媒体列表可能不断新增片段，地址也可能携带短期签名。'),
             ('启动录制任务', '确认目录与任务，开始下载。', '下载引擎持续读取新增数据；MediaGo 根据引擎输出识别直播状态。'),
             ('监看状态与空间', '关注速度、日志和磁盘容量。', '直播没有固定总时长，普通百分比并不能准确表示“整场完成了多少”。'),
             ('主动停止或等待结束', '录到需要的片段后停止，避免直接终止整个应用。', '识别为直播时，Runner 有有界的温和停止流程，为引擎合并和收尾留出时间。'),
             ('等待文件收尾', '观察是否成功保存，不只看进程是否结束。', 'Core 检查成品；某些异常情况会尝试恢复已保留的分片，并记录恢复结果。'),
             ('核对录制窗口', '播放头尾，检查时长、连续性与音画同步。', '停止后成功保存仅说明有已录制产物；恢复文件不等于完整直播，也不保证无丢片。')],
         result='得到录制窗口内的媒体文件；可能是正常结束或停止后的成品，也可能是异常恢复产物。', failure='掉线或签名过期可能中断录制；默认 HLS 关闭分片数量检查，必须人工或用媒体工具检查完整性。', refs=['E06','E10','E21','E22']),
    dict(id='nas', label='NAS / Docker 远端下载', title='场景五 · 在浏览器发现，在服务器保存', desc='让桌面或扩展负责发现，NAS/服务器承担下载和磁盘存储。两边承担不同职责。', prep='部署能访问的 MediaGo Docker 服务并映射存储目录；配置服务地址和所需 API Key；用于发现的桌面或浏览器仍需可用。',
         steps=[
             ('准备服务器下载服务', '按官方 Docker 方式启动，打开 Web 界面并确认保存目录映射。', '此源码 Docker entrypoint 使用 8899，数据、日志与下载目录放在 /app/mediago 下。主机最终位置由 volume 映射决定。'),
             ('连接桌面或扩展', '在相应集成功能中配置远端服务地址与凭据，确认可连接。', '扩展可直接向配置服务发 HTTP 请求；桌面也有本地 Core 代理到远端 Core 的路径。'),
             ('在浏览器中发现资源', '打开页面并选择目标，或提交已知站点/媒体 URL。', 'Docker 的 Go 服务不是完整桌面浏览器；动态页面发现由浏览器端承担。'),
             ('将任务转交远端', '确认远端保存位置，再发送并启动任务。', '传输的是 URL、类型、名称及所需请求上下文。Docker 发现转交会将私有请求头送到远端普通任务接口。'),
             ('服务器执行下载', '在远端任务列表查看进度与日志。', '真正访问媒体 CDN、运行下载引擎、写文件的是服务器；浏览器可播放不保证服务器网络出口也能访问。'),
             ('从服务器取得结果', '在挂载目录找文件，或使用可用的播放器/文件访问方式检查结果。', '文件不会自动出现在手机或桌面的本地下载目录；其位置由执行端决定。')],
         result='媒体保存在 NAS/服务器的映射目录。适合将下载与个人电脑前台操作分开。', failure='排查远端可达性、存储权限、剩余空间和来源的网络限制。远端普通创建可保存 Headers，不能套用本地发现“敏感头不落库”的结论。', refs=['E03','E15','E16','E18']),
    dict(id='ai', label='AI / 自动化工作流', title='场景六 · 用自然语言触发可追踪的下载', desc='把“保存这个视频”变为发现、选择、创建、查询与验收的工具调用链。', prep='先运行 MediaGo。HTTP 可用于脚本；MCP 需要在服务中启用并配置 token。网页发现还需要连接的浏览器执行端。',
         steps=[
             ('明确任务与目标', '提供目标链接、保存意图和所需来源范围。', 'AI 负责理解指令；MediaGo 接收结构化参数，并不会自己理解视频内容。'),
             ('检查服务与入口', '确认服务健康，选择 HTTP/Skill 或 MCP 接入。', '仓库 Skill 本质是调用说明；MCP 提供结构化工具，二者都需要已运行的服务。'),
             ('发现并选择资源', '对于网页先调用 discover_media，再查询结果并选择 source ID。', 'auto 对 .m3u8 走检查，其余走浏览器。默认发现使用临时会话，需显式选项才使用桌面会话 Cookie。'),
             ('创建并启动任务', '使用 download_discovered_media；已知链接也可直接 create_download。', 'Core 将结构化参数转换为原有任务，选择下载器执行。AI 不替代引擎解析与传输。'),
             ('等待并处理结果', '通过 get_download/list_downloads 查询状态，需要时 stop_download。', '工具返回的是任务进展，不是视频已被理解或摘要的证据；失败需要依据错误调整。'),
             ('验证后接入后续处理', '确认实际产物存在并符合需要，再交给另一个转写或检索系统。', '转写、摘要、知识库需要额外组件；这一步属于可扩展工作流，不是本研究确认的内置下载能力。')],
         result='形成有任务 ID、状态与产物路径的自动化下载链，可作为媒体资料流程的输入环节。', failure='没有浏览器执行端时，网页发现会报不可用；发现默认短期保存，过期或重启后可能要重新发现。先建任务后延迟启动不保证保留原会话。', refs=['E12','E13','E14','E15','E24','E25']),
]

SOURCES = [
 ('protocol','HLS / m3u8','主播放列表、媒体列表、可访问直播流','媒体 URL 后缀；桌面也检查 HLS Content-Type；Core 检查清单','m3u8 → N_m3u8DL-RE','不是所有加密/DRM 都可下载；变体和会话条件仍需确认'),
 ('protocol','HTTP 媒体直链','MP4、FLV、MOV、AVI、MKV、WMV、M4A、OGG 等已列规则','请求 pathname 匹配，也可手动指定 direct','direct → aria2c','后缀识别不代表内容正确；默认 headers/proxy 映射不完整'),
 ('native','Bilibili','bilibili.com/video；Core 类型推断也识别 b23.tv','页面规则 / 站点适配 / URL 类型推断','bilibili → BBDown','集合、收藏等不能仅凭引擎能力认定已完整接入；画质和访问受账号条件影响'),
 ('native','YouTube','watch、shorts、live、embed、youtu.be','具体视频页面规则 / 站点适配','youtube → yt-dlp + Deno','首页或订阅流不是单个视频任务；实际解析依赖引擎与网络'),
 ('native','X / Twitter','单条 status 帖子','帖子页面规则；站点适配器也可关联视频所属帖子','youtube → yt-dlp','不代表账号时间线可一键全量归档'),
 ('native','抖音 / TikTok','单条视频与相应分享短链','已列 URL 模式和短视频适配器','youtube → yt-dlp','用户主页、搜索、合集及直播并非这些单条页面规则的覆盖承诺'),
 ('native','小红书','explore、discovery/item、部分个人页内笔记与 xhslink','笔记/分享链接规则与适配器；保留签名参数','xiaohongshu → yt-dlp','图片笔记未必有视频；签名与会话过期可导致不可用'),
 ('engine','Instagram / Reddit 等','yt-dlp 支持列表中的相应页面','README 声明支持；不代表 MediaGo 都有专用嗅探规则','明确选择 youtube/yt-dlp 通道后验证','未知 URL 自动推断可能落到 direct；当前内容与固定引擎版本仍须验证'),
 ('engine','其他 yt-dlp 站点','以引擎支持列表和版本为准','引擎 extractor 提供解析；MediaGo 提供入口和调度','youtube → yt-dlp','“千余站点”不是 MediaGo 逐站下载实测结果'),
 ('protocol','其他网页中的媒体','页面实际发出的可识别媒体请求','先加载页面/触发播放，再从请求中发现','按发现类型分派','没有发出请求、被浏览器策略阻止或未被规则识别，可能没有结果'),
 ('boundary','DRM / 任意付费内容','未建立通用绕过实现证据','仅有发现或媒体引擎不等于获得内容访问能力','不作支持承诺','本研究未验证会员、付费、地域限制或通用 DRM 解锁'),
]

STAGES = [
 ('接收输入','用户给出的 URL、类型、名称与目录','页面地址或媒体链接','可解释的任务/发现请求','先区分“网页”和“媒体文件”。网页可能要交给浏览器，也可能直接交给懂该站点的引擎；未知链接不能总被正确自动识别。',['E05','E12']),
 ('发现资源','网页发出的请求和站点页面线索','运行中的页面与请求上下文','候选 URL、类型、页面、标题和请求头','Electron 与扩展监听浏览器请求；站点适配器提供页面级线索。嗅探是观察当前浏览器实际拿到的资源，不是下载任意网站的万能爬虫。',['E01','E02','E03']),
 ('检查与选择','清单检查和用户/调用方选择','HLS 清单地址与请求头','列表类型、变体、清晰度与选中的源','Core 读取并检查清单内容；清晰度是清单声明。主列表通常有多档变体，媒体列表才指向具体分片。选择完成才建立下载任务。',['E04','E15']),
 ('记录与排队','数据库记录与并发调度','下载参数与保存意图','任务 ID 和 pending/downloading 状态','服务处理名称、重复 URL 和持久化，内存队列限制同时执行数。数据库是任务记录，不是分布式任务系统；断电恢复需要额外验证。',['E07','E08','E09']),
 ('匹配下载器','类型到二进制及参数的映射','任务类型、URL 与相关设置','可以启动的子进程参数','Schema 将目录、名称、代理和头等字段映射到对应工具参数；映射并非所有类型都齐全。二进制由平台依赖目录提供。',['E05','E06','E17']),
 ('下载与处理','外部引擎承担网络和媒体工作','有效媒体/站点地址及访问上下文','下载片段、音视频轨或目标媒体文件','站点解析器取得媒体信息，下载器传输数据，必要时交给 FFmpeg 合并。直播需要持续等待新片段；控制台输出被转为进度与日志。',['E10','E22']),
 ('确认产物','判断实际生成的文件','进程退出、路径标记和文件状态变化','真实输出路径 / 失败原因','退出码之外还检查文件。没有媒体产物会报错，直播停止有专门收尾逻辑；文件存在仍不等于完整性、时长、音画同步均已验收。',['E10','E21']),
 ('播放或转换','文件取得与后续使用','已完成的本地/服务器媒体文件','可播放成品或另一个输出格式','记录实际路径并发送事件；可播放或转为视频/音频格式。字幕转写、语义摘要与知识库是后续系统的职责，本页不把它们列为内置能力。',['E11','E18','E21']),
]

parts = [f'''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>MediaGo · 视频从哪里来，怎样被保存</title>
<meta name="description" content="MediaGo：获取输入 → 识别资源类型 → 选择对应引擎 → 解析并下载 → 合并、检查与保存。负责识别、分派和管理，具体解析与下载主要交给对应引擎；详解 HLS、直链、站点视频与直播。">
<meta name="theme-color" content="#102840">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23102840'/%3E%3Cpath d='M12 8l12 8-12 8z' fill='%23ffb36c'/%3E%3C/svg%3E">
<link rel="stylesheet" href="styles.css"><script src="app.js" defer></script></head><body>
<a class="skip" href="#main">跳转到正文</a>
<header class="topbar"><a class="brand" href="#overview"><span class="mark" aria-hidden="true">▷</span><span>MediaGo <span class="edition">/ 研究手册 009</span></span></a><a href="https://github.com/mediago-dev/mediago">上游仓库 ↗</a></header>
<div class="layout"><aside class="sidebar"><div class="side-label">阅读路线 / FIELD GUIDE</div><nav aria-label="章节导航">''']
sections=[('overview','先理解它'),('capabilities','能力与输入输出'),('scenarios','六个完整场景'),('sources','支持哪些来源'),('mechanism','发现与下载原理'),('resources','依赖与获取方式'),('architecture','部署与数据流'),('value','价值与适用边界'),('evidence','资料与源码证据')]
for i,(sid,label) in enumerate(sections): parts.append(f'<a href="#{sid}"'+(' aria-current="true"' if i==0 else '')+f'><span>{i+1:02}</span>{label}</a>')
parts.append(f'''</nav><div class="side-note">固定版本源码研究<br>2026.09.17<br>提交 {COMMIT[:8]}<br><br>场景流程为源码与文档归纳，未实测视频下载。</div></aside><main id="main">
<section id="overview" class="section hero"><div class="eyebrow">MEDIA DISCOVERY & DOWNLOAD / 中文详解</div>
<h1>视频从哪里来，<br><span>怎样被保存。</span></h1>
<p class="lead">MediaGo 主要负责<strong>识别、分派和管理</strong>；具体解析与下载主要交给对应引擎。它将网页或媒体链接变成可追踪的下载任务，让桌面、扩展、Web 和 AI 共用一条下载链。</p>
<div class="hero-tags"><span class="pill">资源发现</span><span class="pill">多引擎下载</span><span class="pill">桌面 / Docker</span><span class="pill">HTTP / MCP</span><span class="pill">源码分析 · 未实测下载</span></div>
<div class="hero-map"><div class="map-label">我们对主流程的理解</div><p class="summary-chain">获取输入 → 识别资源类型 → 选择对应引擎 → 解析并下载 → 合并、检查与保存。</p><div class="flow-strip"><div><strong>输入与识别</strong><span>网页 / 站点视频页<br>HLS 清单 / 文件直链</span></div><div><strong>分派与管理</strong><span>选择合适引擎<br>请求上下文、任务和队列</span></div><div><strong>解析与下载</strong><span>引擎解析页面或清单<br>传输文件、分片或音视频轨</span></div><div><strong>产物与使用</strong><span>必要时合并、检查文件<br>记录路径、播放或转换</span></div></div><p class="map-foot">这是逻辑顺序，发现与解析可能交叉：普通网页先嗅探；已支持的站点页可直接交给引擎；直链无需站点解析。MediaGo 自身也负责 HLS 清单检查。</p></div>
<div class="quicklinks"><a class="button-link primary" href="#scenarios">从使用场景开始 ↓</a><a class="button-link" href="#sources">查支持的来源</a><a class="button-link" href="#resources">看工具与获取方式</a></div>
<div class="quicklinks"><a class="button-link" href="media/capability-map.png">一张图看全能力 ↗</a><a class="button-link" href="media/capability-map.svg" download>下载可缩放矢量图 ↓</a></div>
{refs('E05','E06','E10','E13')}
<div class="note"><strong>先区分两个“源”：</strong>视频来源是网页、站点和流媒体地址；工具来源是下载器、FFmpeg 等依赖的发布仓库。MediaGo 本身不提供影视内容库，也不会凭空产生可下载资源。</div>
<details class="qa"><summary>浏览器嗅探、引擎解析、清单分别是什么意思？</summary><p><strong>浏览器嗅探：</strong>观察网页实际播放时发出的请求，识别媒体地址；没有触发播放时可能看不到资源。<br><strong>引擎解析：</strong>BBDown、yt-dlp 等理解相应网站的页面和接口，取得可下载的媒体地址、格式与音视频轨。<br><strong>清单：</strong>m3u8 是资源目录，主列表可列多档画质，媒体列表列分片及顺序；它本身不是完整视频。引擎按清单下载数据，直播清单会持续更新。</p></details>
</section>
<section id="capabilities" class="section">{heading('02','能力与输入输出','理解它时，先看每一步收什么、交付什么。它的主要工程价值是让不同工具协同工作。')}<div class="grid3">''')
cards=[('网页资源发现','输入能播放视频的页面，输出候选资源、类型、标题和相关请求信息。适合不知道真实视频 URL 的情况。'),('站点链接解析','输入 B 站或其他支持站点的视频页，交给对应引擎解析。站点范围与当前下载成功率是两回事。'),('流媒体与直链保存','输入 m3u8 或 HTTP 文件链接，输出本地媒体文件。HLS 通常要下载分片并合并。'),('任务与结果管理','批量建立记录，控制并发、停止任务、读取日志，并记录最终文件路径。'),('格式与音频转换','通过 FFmpeg 转换视频格式或输出音频。高质量编码选项不能恢复源视频缺失的细节。'),('跨端与自动化接入','桌面、浏览器扩展、Web、HTTP 和 MCP 共用核心下载服务；服务器可承担下载与存储。')]
for i,(title,body) in enumerate(cards,1): parts.append(f'<article class="card"><span class="card-num">CAPABILITY / {i:02}</span><h3>{title}</h3><p>{body}</p></article>')
parts.append(f'''</div>{refs('E01','E03','E07','E11','E12')}<div class="split"><div class="box"><span class="label">得到什么</span><h3>媒体文件 + 可追踪任务</h3><p>主要结果是执行端磁盘上的视频/音频文件，以及任务 ID、状态、日志和实际产物路径。文件保存在哪台机器，取决于下载在哪台机器执行。</p></div><div class="box"><span class="label">不应推导成什么</span><h3>内容平台、万能爬虫或视频理解模型</h3><p>本研究未建立内置影视资源库、任意 DRM 解锁、全站抓取、字幕转写和语义摘要的证据。后续知识库可以接入它，但需要额外组件。</p></div></div></section>
<section id="scenarios" class="section">{heading('03','从准备到成品，走完六个场景','选择与你的任务最接近的一条路线。流程依据固定版本源码与官方文档整理，不是实际下载实验记录。')}<div class="scenario-picker" role="group" aria-label="选择使用场景">''')
for scenario in SCENARIOS: parts.append(f'<button type="button" data-target="scenario-{scenario["id"]}" aria-controls="scenario-{scenario["id"]}" aria-pressed="false">{scenario["label"]}</button>')
parts.append('</div><noscript><p class="no-js">JavaScript 未启用，以下顺序显示全部场景与原理内容。</p></noscript>')
for s in SCENARIOS:
    parts.append(f'<article class="scenario" id="scenario-{s["id"]}" aria-labelledby="title-{s["id"]}"><div class="scenario-top"><div><span class="label">完整流程 / 6 STEPS</span><h3 id="title-{s["id"]}">{s["title"]}</h3><p>{s["desc"]}</p></div><div class="prereq"><strong>开始前准备</strong>{s["prep"]}</div></div><ol class="scenario-steps">')
    for title,action,system in s['steps']: parts.append(f'<li><h4>{title}</h4><p><b>你来做：</b>{action}<br><b>内部发生：</b>{system}</p></li>')
    parts.append(f'</ol><div class="scenario-result"><div><strong>最终得到什么</strong><p>{s["result"]}</p></div><div><strong>在哪里排查</strong><p>{s["failure"]}</p></div></div>{refs(*s["refs"])}</article>')
parts.append(f'''<div class="note"><strong>常见的另一入口：Chrome / Edge 扩展。</strong>在普通浏览器打开并播放视频 → 点击扩展查看候选 → 选择资源 → 发给本机或服务器。当前默认设置是加入任务列表，不立即开始；是否自动下载以扩展设置为准。它负责发现与转交，不独立替代下载服务。 <a href="{BASE}packages/mediago-extension/src/shared/constants.ts">默认设置源码 ↗</a></div></section>
<section id="sources" class="section">{heading('04','支持哪些视频来源？','“页面被识别”“引擎能处理”“当前内容成功下载”是三个层次。下表给出实际接入方式，而不是按网站名称作成功保证。')}
<h3>先按资源结构，看六种下载通道</h3><div class="table-wrap" tabindex="0" aria-label="资源与下载方式对应表"><table><thead><tr><th>资源 / 输入</th><th>对应类型与引擎</th><th>下载方式</th></tr></thead><tbody>
<tr><td>HTTP 媒体文件直链</td><td>direct → aria2c（aria2-next）</td><td>对目标文件进行传输；不需要站点页面解析，通常不需要分片合并。</td></tr>
<tr><td>HLS / m3u8 点播与可访问直播</td><td>m3u8 → N_m3u8DL-RE</td><td>读取清单，下载对应分片或音视频轨，按需要合并；直播持续取得新增数据并收尾。</td></tr>
<tr><td>Bilibili 视频页面</td><td>bilibili → BBDown</td><td>解析站点与可用媒体流，下载后按需要合并音视频。</td></tr>
<tr><td>YouTube、X、抖音 / TikTok 及其他适配站点</td><td>youtube → yt-dlp</td><td>按站点解析器取得格式和媒体地址，再下载、合并；实际范围取决于引擎及版本。</td></tr>
<tr><td>小红书视频笔记</td><td>xiaohongshu → yt-dlp</td><td>独立类型处理笔记链接和签名上下文，再由 yt-dlp 解析与下载。</td></tr>
<tr><td>显式选择的 mediago 通道</td><td>mediago → 外部 mediago 二进制</td><td>源码存在此下载入口；独立引擎的完整协议和站点覆盖未在本次审计，不作扩大承诺。</td></tr>
</tbody></table></div><p class="caption">六种任务类型对应五个下载执行入口，FFmpeg 另承担合并或格式转换。浏览器嗅探负责找资源，本身不是第六个下载器；直播是持续获取模式，不是单独一类站点引擎。</p>{refs('E05','E06','E10','E17')}
<h3>再按站点与链接形式，看自动识别范围</h3>
<div class="filters" role="group" aria-label="筛选来源类型"><button type="button" data-filter="all" aria-pressed="true">全部来源</button><button type="button" data-filter="native" aria-pressed="false">专门页面规则</button><button type="button" data-filter="protocol" aria-pressed="false">媒体协议 / 直链</button><button type="button" data-filter="engine" aria-pressed="false">引擎扩展范围</button><button type="button" data-filter="boundary" aria-pressed="false">未确认支持</button></div>
<div id="source-count" class="source-count" role="status">显示 {len(SOURCES)} / {len(SOURCES)} 类来源</div><div class="table-wrap" tabindex="0" aria-label="支持来源表，可横向滚动"><table id="source-table"><thead><tr><th>来源</th><th>适合的输入</th><th>如何发现或识别</th><th>谁来下载</th><th>边界</th></tr></thead><tbody>''')
for kind,name,inp,detect,engine,boundary in SOURCES: parts.append(f'<tr data-kind="{kind}"><td>{name}</td><td>{inp}</td><td>{detect}</td><td>{engine}</td><td>{boundary}</td></tr>')
parts.append(f'''</tbody></table></div>{refs('E01','E05','E06','E20')}
<div class="note warm"><strong>“千余站点”的准确含义：</strong>README 引用的是 yt-dlp 的站点覆盖。MediaGo 自动识别规则更少，未知页面可能默认走 direct。请结合<a href="https://github.com/yt-dlp/yt-dlp/blob/2026.08.19/supportedsites.md">研究依赖版本的站点列表</a>与实际测试判断；“在列表里”仍不能保证某个当前链接成功。</div></section>
<section id="mechanism" class="section">{heading('05','如何获取资源，又如何下载？','获取地址、建立任务、传输数据和验证产物是不同阶段。点选步骤，查看各层的输入、输出与职责。')}<div class="pipeline" role="group" aria-label="选择下载流程步骤">''')
for i,(title,*_) in enumerate(STAGES,1): parts.append(f'<button type="button" data-target="stage-{i}" aria-controls="stage-{i}" aria-pressed="false"><span>STEP {i:02}</span>{title}</button>')
parts.append('</div>')
for i,(title,sub,inp,outp,body,ids) in enumerate(STAGES,1): parts.append(f'<article class="stage-panel" id="stage-{i}" aria-labelledby="stage-title-{i}"><span class="label">STEP {i:02} / {sub}</span><h3 id="stage-title-{i}">{title}</h3><div class="io"><div><small>输入</small>{inp}</div><div><small>输出</small>{outp}</div></div><p>{body}</p>{refs(*ids)}</article>')
parts.append(f'''<h3 style="margin-top:32px">把 HLS 拆开看：m3u8 是清单，视频在分片里。</h3><div class="hls-map"><div><span class="label">A / 主列表</span><strong>列出多档版本</strong><p>例如不同分辨率、带宽和编码。Core 可读取它，给用户展示可选变体。</p></div><div><span class="label">B / 媒体列表</span><strong>列出片段地址与顺序</strong><p>描述该版本要加载哪些分片。直播列表可继续更新，不能只保存一次清单。</p></div><div><span class="label">C / 分片与文件</span><strong>下载、组织与合并</strong><p>引擎获取数据，必要时用 FFmpeg 合并成可用输出。分片可能是 TS 或 fragmented MP4。</p></div></div>
<p class="caption">HLS 示意为协议解释，不是真实下载轨迹。<a href="https://www.rfc-editor.org/rfc/rfc8216.html">RFC 8216 ↗</a></p>
<div class="split"><div class="box"><h3>为什么“浏览器能播”不等于“链接能下”？</h3><p>请求可能依赖 Cookie、Referer、User-Agent 或短期签名。换到下载器或服务器后，会话和网络出口可能变化。MediaGo 的部分路径保留这些上下文，但不同通道支持并不一致。</p>{refs('E06','E10','E15')}</div><div class="box"><h3>为什么“任务成功”还需要检查文件？</h3><p>Core 会检查产物，不只看退出码；但存在文件不等于时长完整、无缺片或音画同步。当前默认 HLS 参数关闭分片数量检查，正式归档前仍要验收媒体本身。</p>{refs('E06','E10','E21')}</div></div></section>
<section id="resources" class="section">{heading('06','使用哪些工具？从哪里获取？','区分 MediaGo 自身的代码、运行时二进制和用户视频。下列版本来自研究提交的依赖清单，不代表各项目今天的最新版。')}
<div class="table-wrap dependency" tabindex="0" aria-label="运行依赖表，可横向滚动"><table><thead><tr><th>工具 / 资源</th><th>固定版本</th><th>在 MediaGo 中的职责</th><th>原始发布来源</th></tr></thead><tbody>''')
roles={'ffmpeg':'音视频合并与格式/编码转换；这里记录的是分发包标签，不是 FFmpeg 本身的版本号','N_m3u8DL-RE':'m3u8/HLS 主下载通道，负责媒体下载与合并流程','BBDown':'B 站专用解析和下载','aria2':'direct 直链下载；aria2-next 二进制重命名为 aria2c','yt-dlp':'YouTube 和其他支持站点的解析与下载','deno':'提供 yt-dlp 使用的 JavaScript 运行时','mediago':'mediago 类型的独立外部引擎；不同于本仓库 Go Core 服务'}
for name,d in DATA['runtime_dependencies'].items():
    repo=d['repository'];version=d['version']
    parts.append(f'<tr><td>{esc(name)}</td><td><code>{esc(version)}</code></td><td>{roles[name]}</td><td><a href="https://github.com/{repo}/releases/tag/{version}">{repo} ↗</a></td></tr>')
parts.append(f'''</tbody></table></div>{refs('E17','E05','E11')}<div class="note"><strong>两个容易混淆的“Core”：</strong>本仓库 <code>apps/core</code> 是 Go 编写的服务与调度层；依赖表中的 <code>caorushizi/mediago-core</code> 则提供名为 <code>mediago</code> 的下载二进制。它们不是同一个代码模块。</div>
<h3>普通使用者怎样取得软件</h3><div class="grid3"><div class="box"><span class="label">桌面端</span><h3>下载对应系统的安装包</h3><p>从官方 Releases 选 Windows、macOS 或 Linux 版本，启动后设置目录。成品包由上游构建流程准备运行依赖，不需要用户手动编译每个引擎。</p><a href="https://github.com/mediago-dev/mediago/releases">官方发布页 ↗</a></div><div class="box"><span class="label">浏览器入口</span><h3>安装随桌面分发的扩展</h3><p>进入“设置 → 更多设置 → 浏览器扩展目录”，在 Chrome/Edge 扩展管理页开启开发者模式，通过“加载已解压的扩展程序”选择该目录。扩展仍需连接 MediaGo 下载服务。</p><a href="https://downloader.caorushizi.cn/extension.html">官方扩展教程 ↗</a></div><div class="box"><span class="label">服务器端</span><h3>取得官方 Docker 镜像</h3><p>README 提供 <code>caorushizi/mediago</code> 与 <code>ghcr.io/caorushizi/mediago</code> 分发，支持 amd64/arm64。镜像包含服务与运行环境；需映射 <code>/app/mediago</code> 到主机目录。</p><a href="{BASE}README.md#-one-line-docker-deployment">固定版本部署说明 ↗</a></div></div>
<h3 style="margin-top:32px">从源码运行时，二进制怎样准备</h3><div class="sequence"><div><strong>1. 读取固定清单</strong><p>记录仓库、版本、平台资源名、二进制名称和 SHA-256。</p></div><div><strong>2. 选择平台文件</strong><p>依据系统与架构选择对应资源；没有匹配文件时不能假定支持。</p></div><div><strong>3. 下载与解包校验</strong><p>从 GitHub Releases 获取压缩包或二进制，解出候选并验证完整性。</p></div><div><strong>4. 放入依赖目录</strong><p>记录依赖状态，运行时按类型映射找到可执行文件。</p></div></div>
<p>上游开发入口 <code>task setup</code> 准备 Node 工作区和固定运行依赖；只运行前端依赖安装并不够。执行完整开发环境需要 Node.js ≥ 24.14、pnpm 11.23、Go ≥ 1.25、Task ≥ 3.51.1 且 &lt; 4。</p>
<pre><code>git clone https://github.com/mediago-dev/mediago.git
cd mediago
git checkout {COMMIT}
task setup
task dev:all</code></pre>
<p class="caption">复现命令供阅读，本研究未执行安装和下载；本文网页不调用下载接口，也不会自动安装工具。</p>
<div class="evidence-line">补充源码：<a href="{BASE}packages/tooling/src/runtime-deps/download.ts">下载地址与解包</a><a href="{BASE}packages/tooling/src/runtime-deps/provisioner.ts">依赖准备</a><a href="{BASE}packages/tooling/src/runtime-deps/integrity.ts">完整性校验</a></div>
<h3 style="margin-top:28px">还会用到哪些资源</h3><p>React/TypeScript 提供界面，Electron 提供桌面和浏览器，Gin 提供 HTTP，GORM/SQLite 保存记录，SSE 推送事件，MCP SDK 提供 AI 工具接口。网络带宽、磁盘空间与转码 CPU 都由实际运行机器承担。下载内容来自用户提供链接对应的站点/CDN，不来自 GitHub 依赖仓库。</p>{refs('E09','E13','E18','E19')}
</section>
<section id="architecture" class="section">{heading('07','部署在哪里，文件就保存在哪里','桌面、Web、扩展和 AI 是入口；Go Core 与下载引擎才是执行端。先确认这一区分，再安排工作流。')}
<div class="architecture"><div class="arch-row"><b>交互与调用</b><span>共享 React 界面 / Electron / Chrome-Edge 扩展 / HTTP 客户端 / AI 助手</span></div><div class="arch-row"><b>发现与访问上下文</b><span>浏览器请求与站点适配器 → 候选源；Core 清单检查 → 变体与信息</span></div><div class="arch-row"><b>任务服务</b><span>Go Core / Gin / SQLite / 内存队列 / SSE / MCP</span></div><div class="arch-row"><b>执行与输出</b><span>下载器子进程 → 媒体文件 → 实际产物记录 → 播放或 FFmpeg 转换</span></div></div>
<div class="table-wrap" tabindex="0" aria-label="部署方式比较"><table><thead><tr><th>组合</th><th>谁发现</th><th>谁下载</th><th>文件在哪里</th></tr></thead><tbody><tr><td>桌面应用</td><td>内置浏览器 / 手动输入</td><td>本机 Core 与引擎</td><td>本机配置目录</td></tr><tr><td>扩展 + 桌面</td><td>普通浏览器扩展</td><td>本机 Core 与引擎</td><td>本机配置目录</td></tr><tr><td>扩展 + Docker</td><td>普通浏览器扩展</td><td>服务器 Core 与引擎</td><td>服务器的挂载目录</td></tr><tr><td>Web + Docker</td><td>提交链接；网页发现需要额外浏览器执行端</td><td>服务器 Core 与引擎</td><td>服务器挂载目录，不自动进入手机本地</td></tr><tr><td>AI + MCP / HTTP</td><td>可调用发现服务，或直接给链接</td><td>所连接的 MediaGo 服务</td><td>该服务的输出目录</td></tr></tbody></table></div>{refs('E03','E12','E16','E18','E24')}
<div class="split"><div class="box"><h3>发现任务与下载任务分开</h3><p>发现结果默认保留 10 分钟，容量 20；它提供候选，之后才建立持久化下载记录。网页发现需要可用执行端，无执行端会返回错误，不能把 Docker 视为自带完整网页浏览器。</p>{refs('E12','E25')}</div><div class="box"><h3>会话凭据按路径处理</h3><p>本地发现转下载会过滤持久化敏感头，再把运行时头交给队列；Docker 转交会把相关头传到远端普通创建接口。不能概括为所有路径 Cookie 都不落库。</p>{refs('E07','E15','E16')}</div></div>
<details class="qa"><summary>端口与文档有差异时，以什么为准？</summary><p>桌面常用 39719；本次 Docker entrypoint 使用 8899，官方 API 页面曾写 9900。以实际启动参数和端口映射为准。代码状态使用 pending，不能只按旧文档中的 waiting 处理。</p></details>
</section>
<section id="value" class="section">{heading('08','它的意义，是把零散工具组织成流程','以下是基于架构的价值判断，没有做性能、成功率或效率对照实验。')}
<div class="grid3"><article class="card"><span class="card-num">给使用者</span><h3>少做几次工具间的搬运</h3><p>在发现、选择、下载、管理和转换之间保留上下文。适合经常保存媒体、需要批量管理或服务器存储的人。</p></article><article class="card"><span class="card-num">给开发者</span><h3>把 CLI 变成可用产品</h3><p>参考其引擎适配、取消、事件、产物识别和跨端复用方式。这些工程能力比单纯包一层下载按钮更有价值。</p></article><article class="card"><span class="card-num">给自动化流程</span><h3>提供有结果可查的入口</h3><p>HTTP/MCP 让下载成为可编排步骤。任务 ID、状态和路径可交给后续系统，而不必只解析一段终端文字。</p></article></div>
<div class="table-wrap" tabindex="0" aria-label="使用选择表"><table><thead><tr><th>你的目标</th><th>MediaGo 的价值</th><th>还缺什么</th></tr></thead><tbody><tr><td>偶尔下载少量已知链接</td><td>图形界面便捷；直接使用对应引擎也可能足够</td><td>验证具体来源即可，不一定需要整套服务</td></tr><tr><td>经常发现网页视频、批量整理</td><td>发现、上下文和任务管理连接起来</td><td>目标站点可靠性与媒体完整性验收</td></tr><tr><td>NAS/服务器下载</td><td>把前台发现与后台存储分开</td><td>网络、存储、服务访问和凭据生命周期检查</td></tr><tr><td>媒体知识库</td><td>可作为媒体获取前段</td><td>授权来源管理、转写、标签、检索与内容生命周期</td></tr><tr><td>学习产品化架构</td><td>研究多入口、统一任务和外部进程编排</td><td>实际构建、失败场景与资源使用测量</td></tr></tbody></table></div>
<h3>需要带着边界理解的几个问题</h3>''')
faqs=[('能下载所有能播放的视频吗？','不能这样推断。MediaGo 依赖可观察资源、可用引擎和有效访问上下文；本研究没有通用 DRM 绕过证据，也没有对所有来源实测。'),('它自己实现了所有下载算法吗？','站点与媒体能力主要来自多个外部引擎。MediaGo 自己提供发现、请求上下文传递、任务、进程和产物管理，也实现 HLS 清单信息检查。'),('“高清”和转换质量是什么意思？','源清单的分辨率用于选择已有版本；转换质量是 FFmpeg 的编码参数。后者不能把低分辨率源恢复成真实高分辨率细节。'),('网页里登录了，稍后下载还有效吗？','不一定。签名和会话有时效；本地发现默认短期保存敏感上下文。先创建但不立即启动的任务，后续普通启动不保证重新得到原 Cookie。'),('失败重试、断点续传和重启恢复都可靠吗？','不能仅凭数据库和外部引擎就作统一保证。队列在内存，各引擎传输与缓存方式不同；本次未实测中断、重启和续传。'),('AI 支持意味着可以自动理解视频吗？','不意味着。AI 接口负责发现与任务操作，下载本身不依赖模型。语音转写、摘要、语义分析需要另外的组件。'),('开源许可如何理解？','研究快照根 LICENSE 为 MIT，README 还有使用声明，外部二进制又有各自许可。根许可不能替代所有依赖的许可材料；本页不作统一商业授权判断。'),('当前网页做了什么验证？','已核查固定提交中的功能路径与证据；网页本身另做浏览器布局和交互检查。这不等于运行 MediaGo 客户端，也不等于完成视频下载实测。')]
for title,body in faqs:parts.append(f'<details class="qa"><summary>{title}</summary><p>{body}</p></details>')
parts.append('''<h3 style="margin-top:30px">阅读时会遇到的几个词</h3><dl class="glossary">''')
terms=[('嗅探','观察浏览器实际产生的网络请求，识别可能的媒体地址。'),('Extractor / 站点解析器','理解某个网站页面和接口，取得可下载媒体信息的组件。'),('Cookie / Referer','请求中的会话信息与来源页面信息，有时是成功访问媒体的条件。'),('Schema / 参数映射','把统一任务字段转为各个引擎自己的命令行参数和输出解析规则。'),('SSE','服务向客户端持续推送事件，用于更新任务状态。'),('MCP','供 AI 工具调用的协议入口；这里将发现和下载任务变成结构化工具。'),('转码与合并','合并组织已有音视频或片段；转码重新编码，计算开销和质量影响不同。'),('产物','任务实际生成的文件；不能只靠界面名称猜测最终文件路径。')]
for name,body in terms:parts.append(f'<div><dt>{name}</dt><dd>{body}</dd></div>')
parts.append(f'''</dl></section>
<section id="evidence" class="section references">{heading('09','资料、版本与源码证据','关键结论链接到固定提交，避免 master 更新后失去对应关系。证据存在说明实现可复查，不代表真实运行已经通过。')}
<div class="note"><strong>研究边界：</strong>提交 <code>{COMMIT}</code>，提交日期 2026-08-29，研究日期 2026-09-17。README 展示的稳定版与该 master 快照不必完全一致。本次未安装 MediaGo、未运行上游测试、未做真实站点下载；未宣称下载成功率、速度或通用 DRM 能力。</div>
<div class="quicklinks"><a class="button-link" href="research-snapshot.json" download>下载研究快照 JSON ↓</a><a class="button-link" href="https://github.com/mediago-dev/mediago/tree/{COMMIT}">固定版本仓库 ↗</a><a class="button-link" href="https://downloader.caorushizi.cn/guides.html">官方使用教程 ↗</a></div><p class="caption">源码表：25 组原始证据；获取依赖和扩展默认行为的补充证据在相应章节直接链接。</p>''')
for item in DATA['evidence']:
    parts.append(f'<details id="ref-{item["id"]}"><summary>{item["id"]} · {esc(item["topic"])}</summary><ul>')
    for source in item['sources']:parts.append(f'<li><a href="{esc(source["url"],quote=True)}">{esc(source["path"])}:{source["line"]} ↗</a><br><code>{esc(source["anchor"])}</code></li>')
    parts.append('</ul></details>')
parts.append('''<p class="caption">本页为自主研究手册，图形均为原理示意，非 MediaGo 官方界面截图。未复制上游源码或运行二进制；相关代码和许可通过原始链接引用。</p></section>
<footer class="footer"><span>开源项目研究 / 009 MediaGo<br>理解能力，也保留边界。</span><a href="#overview">回到开头 ↑</a></footer></main></div></body></html>''')
APP.mkdir(exist_ok=True)
(APP/'media').mkdir(exist_ok=True)
for name in ('capability-map.png', 'capability-map.svg'):
    shutil.copyfile(PROJECT/'assets'/name, APP/'media'/name)
(APP/'index.html').write_text('\n'.join(parts)+'\n',encoding='utf-8')
(APP/'research-snapshot.json').write_text(json.dumps(DATA,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Built guide: {len(SCENARIOS)} scenarios, {sum(len(s["steps"]) for s in SCENARIOS)} steps, {len(SOURCES)} source categories, {len(STAGES)} pipeline stages.')
