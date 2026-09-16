"""Create an original capability diagram as a PNG and editable SVG.

Requires Pillow only for PNG rendering. All labels and layout are authored here.
"""
from pathlib import Path
from html import escape
import json
import re
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
W, H = 2400, 3830
BG, NAVY, INK, MUTED = '#edf2f7', '#132b44', '#18324b', '#52687b'
BLUE, TEAL, ORANGE, LINE = '#285ac4', '#097d78', '#ad5c21', '#cbd8e5'
im = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(im)
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-labelledby="title desc">',
       '<title id="title">MediaGo 能力全景图</title>',
       '<desc id="desc">从输入、发现、任务管理、来源与引擎、下载处理、浏览收藏、部署、自动化和依赖，到六类场景与能力边界的完整研究图。</desc>']
fonts = {}


def font(size, bold=False):
    key = (size, bold)
    if key not in fonts:
        filename = 'msyhbd.ttc' if bold else 'msyh.ttc'
        fonts[key] = ImageFont.truetype(str(Path('C:/Windows/Fonts') / filename), size)
    return fonts[key]


def box(x, y, w, h, fill, radius=18, stroke=None):
    d.rounded_rectangle((x, y, x+w, y+h), radius=radius, fill=fill, outline=stroke, width=2)
    svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}"' + (f' stroke="{stroke}" stroke-width="2"' if stroke else '') + '/>')


def text(x, y, value, size=29, color=INK, bold=False):
    d.text((x, y), value, font=font(size, bold), fill=color, anchor='lt')
    svg.append(f'<text x="{x}" y="{y}" dominant-baseline="text-before-edge" font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="{size}" font-weight="{700 if bold else 400}" fill="{color}">{escape(value)}</text>')


def wrap(value, width, size=29, bold=False):
    out, row = [], ''
    for c in re.findall(r'[A-Za-z0-9_./:+-]+|[^A-Za-z0-9_./:+-]', value):
        if c == '\n':
            out.append(row); row = ''; continue
        if row and d.textlength(row+c, font=font(size, bold)) > width:
            out.append(row); row = c
        else:
            row += c
    if row: out.append(row)
    return out


def para(x, y, value, width, size=29, color=INK, bold=False, line=43):
    for row in wrap(value, width, size, bold):
        text(x, y, row, size, color, bold); y += line
    return y


def card(x, y, w, h, number, title, items, evidence, accent=BLUE):
    box(x, y, w, h, '#ffffff', 22, LINE)
    box(x+25, y+26, 54, 48, accent, 9)
    text(x+34, y+32, number, 28, '#ffffff', True)
    title_size = 38
    while d.textlength(title, font=font(title_size, True)) > w-120: title_size -= 1
    text(x+94, y+30, title, title_size, INK, True)
    pos = y+95
    for lead, body in items:
        text(x+30, pos, lead, 29, accent, True)
        pos += 40
        pos = para(x+30, pos, body, w-60, 27, MUTED, line=38) + 8
    assert pos <= y+h-40, (title, pos, y+h-40)
    text(x+30, y+h-37, evidence, 21, MUTED)


box(0, 0, W, H, BG, 0)
box(0, 0, W, 242, NAVY, 0)
text(64, 36, 'OPEN-SOURCE FIELD GUIDE  /  009', 24, '#9bbbd6', True)
text(64, 83, 'MediaGo 能力全景图', 76, '#ffffff', True)
text(65, 184, '获取输入 → 识别资源类型 → 选择对应引擎 → 解析并下载 → 合并、检查与保存。', 31, '#c5d7e7')
text(1810, 53, '固定源码快照 · 2026.09.17', 25, '#ffbc7d', True)
text(1810, 99, '源码确认 ≠ 下载实测通过', 25, '#c5d7e7')

flow = [('01  输入', '网页 / 站点链接 / 媒体 URL'), ('02  发现与选择', '浏览器嗅探 / 引擎解析 / 清单'), ('03  匹配与执行', '选引擎 → 排队 → 下载 / 合并'), ('04  确认与使用', '检查产物 → 保存 / 播放 / 转换')]
for i, (a, b) in enumerate(flow):
    x = 60+i*578
    box(x, 274, 548, 128, '#ffffff', 16)
    text(x+24, 294, a, 34, BLUE, True)
    text(x+24, 345, b, 26, MUTED)
    if i < 3: text(x+552, 313, '›', 42, BLUE, True)
text(66, 424, '两条路径：普通网页先发现媒体；已支持的站点页可直接交给解析引擎，不必先嗅探最终文件地址。', 27, MUTED)

xs = [60, 832, 1604]; cw = 736
card(xs[0], 482, cw, 680, '01', '多入口与输入', [
    ('桌面与 Web', 'Windows / macOS / Linux；局域网浏览器可访问运行中的服务。'),
    ('Chrome / Edge 扩展', '检测候选、显示数量，单条或批量发送；HTTP 与桌面协议入口。'),
    ('手动输入与自动化', '网页、视频页、m3u8、文件直链；单任务、批量 URL、HTTP、Skill、MCP。'),
    ('任务启动方式', '立即下载或先加入列表；扩展默认先加入列表。')
], '依据 E03 / E12–E14 / E18；S1', BLUE)
card(xs[1], 482, cw, 680, '02', '资源发现与访问上下文', [
    ('观察浏览器真实请求', 'URL 规则、请求头；桌面额外识别 HLS 响应类型。'),
    ('页面识别与候选整理', '站点适配、标题 / 类型 / 页面关联，选择要保存的资源。'),
    ('HLS 清单检查', '主列表 / 媒体列表、变体 URL、分辨率、带宽与编码信息。'),
    ('传递下载所需上下文', 'Cookie / Referer / User-Agent / 签名等按通道处理；支持情况有差异。')
], '依据 E01–E05 / E15 / E20 / E24–E25', TEAL)
card(xs[2], 482, cw, 680, '03', '任务与队列管理', [
    ('创建、编辑与记录', '命名、保存目录、重复 URL 检查；列表 / 单项 / 活动任务查询。'),
    ('控制执行', '启动、停止、再次启动；内存队列控制并发，SQLite 保存记录。'),
    ('状态、进度与日志', '等待 / 下载中 / 成功 / 失败 / 已停止；速度、错误、SSE 事件推送。'),
    ('整理与维护', '删除任务、导出任务列表、目录查询；支持直播标记。')
], '依据 E07–E10 / E21–E22；S2', BLUE)

box(60, 1192, 2280, 458, '#ffffff', 22, LINE)
text(91, 1222, '04  来源支持地图', 40, INK, True)
text(541, 1232, '专门规则、媒体协议与引擎覆盖是不同层次；网站名不代表任意页面都可下载。', 27, MUTED)
sourcecols = [
    [('媒体协议 / 文件直链', 'HLS / m3u8：点播、可访问直播流\nMP4、FLV、MOV、AVI、MKV、WMV、M4A、OGG 等'),
     ('Bilibili → BBDown', 'video 页面；Core 也推断 b23.tv')],
    [('YouTube → yt-dlp', 'watch / shorts / live / embed / youtu.be'),
     ('X、抖音 / TikTok → yt-dlp', 'X / Twitter status；短视频单条与分享链接')],
    [('小红书 → yt-dlp', 'explore / discovery/item、部分个人页内笔记、xhslink；保留签名参数'),
     ('Instagram、Reddit 与其他站点', '来自 yt-dlp 解析器的扩展范围；“千余站点”为上游声明，非逐站实测')]
]
for x, blocks in zip(xs, sourcecols):
    yy = 1298
    for title, body in blocks:
        text(x+31, yy, title, 30, TEAL, True)
        yy = para(x+31, yy+46, body, cw-64, 28, MUTED, line=40)+25
text(92, 1597, '未知网页可能被推断为 direct，不会全部自动转交 yt-dlp。  ·  依据 E01 / E05 / E06 / E20', 25, ORANGE)

card(xs[0], 1680, cw, 660, '05', '六种类型，五个下载入口', [
    ('m3u8 → N_m3u8DL-RE', 'HLS 数据下载与合并流程。'),
    ('bilibili → BBDown', 'B 站专用页面解析与下载。'),
    ('youtube / xiaohongshu → yt-dlp', '多站点解析；小红书为独立任务类型。'),
    ('direct → aria2c；mediago → mediago', '文件直链 / 另一外部引擎通道。'),
    ('Schema 统一参数与输出', '将任务字段映射为 CLI 参数及进度规则。')
], '依据 E05–E06 / E10 / E17', BLUE)
card(xs[1], 1680, cw, 660, '06', '媒体处理与产物确认', [
    ('下载、合并与直播收尾', '引擎传输数据；直播温和停止、收尾检查，部分异常尝试分片恢复。'),
    ('确认真实文件', '解析引擎输出路径，检查实际产物并保存；无有效产物可报错。'),
    ('视频转换', 'FFmpeg：MP4 / MKV → H.264 + AAC；WebM → VP9 + Opus。'),
    ('音频提取与输出', 'MP3 / AAC / FLAC / WAV；质量参数、转换任务及开始 / 停止控制。')
], '依据 E10–E11 / E21–E22；S2', TEAL)
card(xs[2], 1680, cw, 660, '07', '浏览、收藏与成品使用', [
    ('内置浏览器操作', '多标签、地址导航、刷新、桌面 / 手机模式切换，资源面板与筛选。'),
    ('收藏常用网页', '新增 / 删除、标题与图标、导入 / 导出；便于再次访问来源。'),
    ('内置播放器与文件服务', '查询可播放成品、按任务查看文件；Web 播放依赖正确配置视频目录。'),
    ('界面与运行设置', '中 / 英 / 意语言、主题、目录、终端显示、并发数及代理等设置入口。')
], '依据 E09 / E18；S1–S6', BLUE)

card(xs[0], 2370, cw, 760, '08', '桌面、Docker 与 NAS 协作', [
    ('本地发现 → 远端下载', '桌面或扩展发现资源，向配置的远端 Core 转交任务。'),
    ('远端任务管理', '创建 / 查询 / 编辑 / 删除 / 开始 / 停止；活动状态、直播标记与日志。'),
    ('服务器与局域网使用', 'Docker amd64 / arm64；Web 入口；文件保存到执行端或服务器挂载目录。'),
    ('配置连接与访问', '服务地址、API Key、可选鉴权；MCP 另需启用和 token。'),
    ('关键条件', '动态网页发现仍需要浏览器执行端；Docker 本身不等于完整桌面浏览器。')
], '依据 E03 / E12–E13 / E16 / E18；S2', TEAL)
card(xs[1], 2370, cw, 760, '09', 'HTTP、Skill 与 9 个 MCP 工具', [
    ('服务健康', 'health_check'),
    ('发现 / 结果 / 取消发现', 'discover_media · get_media_discovery\ncancel_media_discovery'),
    ('选中资源下载 / 直接建任务', 'download_discovered_media\ncreate_download'),
    ('查询 / 列表 / 停止下载', 'get_download · list_downloads\nstop_download'),
    ('HTTP 与 AI Skill', '脚本接入任务、发现、配置、收藏、转换等；AI 负责调用已有服务。')
], '依据 E12–E14；S2', BLUE)
card(xs[2], 2370, cw, 760, '10', '依赖、运行资源与工程机制', [
    ('7 项运行依赖', 'N_m3u8DL-RE、BBDown、aria2-next、yt-dlp、mediago、FFmpeg、Deno。'),
    ('从哪里获取', 'GitHub Releases 固定版本 / 平台资源；下载、解包、SHA-256 校验。'),
    ('服务与状态层', 'Go / Gin、GORM / SQLite、SSE；React / Electron 提供交互与浏览器。'),
    ('进程适配与生命周期', 'PTY / 管道 Runner、参数构造、日志解析、取消及进度更新。'),
    ('实际资源消耗', '媒体来自对应站点 / CDN；带宽、磁盘和转码 CPU 由执行机器承担。')
], '依据 E09–E10 / E17–E19 / E22–E23', TEAL)

box(60, 3160, 2280, 142, NAVY, 20)
text(92, 3183, '六类完整使用场景', 32, '#ffbc7d', True)
text(92, 3238, '网页视频保存     /     站点链接下载     /     批量资料整理     /     直播录制     /     NAS 远端保存     /     AI 自动化获取', 30, '#ffffff')
box(60, 3332, 2280, 294, '#fff3e6', 20)
text(92, 3357, '理解这些边界，才算看全能力', 37, ORANGE, True)
limits = [
    '不保证任意网页、会员内容或 DRM 可下载；专门规则覆盖小于外部引擎覆盖。',
    '会话、签名和网络影响下载；默认 direct 参数未映射 headers / proxy；本地与远端凭据保存路径不同。',
    '成功找到文件 ≠ 视频完整；直播恢复 ≠ 整场无缺失；内存队列 ≠ 已验证的宕机恢复或分布式调度。',
    'AI 接口不提供视频理解；转写、摘要、字幕翻译、知识库检索未被本次研究确认为内置能力。',
    '画质选择是选已有版本；转码不能恢复源中没有的细节。根 MIT 许可不替代各依赖的许可。'
]
for i, value in enumerate(limits): text(92, 3418+i*37, '• '+value, 26, INK)
text(63, 3658, '研究范围：f2aa40a8ce7c（2026-08-29 master 快照）  ·  整理：2026-09-17  ·  未运行 MediaGo / 未做真实站点下载', 25, MUTED)
text(63, 3700, 'E01–E25：已有源码证据表；S1–S6：本图补充核对。全部来源与永久链接见 notes/capability-map.md。', 25, MUTED)
text(63, 3742, 'mediago-dev/mediago  ·  原创研究图，不是官方界面截图；不同发布包与此源码快照的能力可能不同。', 25, MUTED)

ROOT.joinpath('assets').mkdir(exist_ok=True)
im.save(ROOT/'assets/capability-map.png', optimize=True)
svg.append('</svg>')
(ROOT/'assets/capability-map.svg').write_text('\n'.join(svg), encoding='utf-8')
print(json.dumps({'width':W,'height':H,'outputs':['assets/capability-map.png','assets/capability-map.svg']},ensure_ascii=False))
