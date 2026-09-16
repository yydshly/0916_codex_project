"""Render an original, deterministic research diagram as SVG and PNG (no input image)."""
from pathlib import Path
from html import escape
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parents[1] / 'assets'
W, H = 2000, 3980
im = Image.new('RGB', (W, H), '#f5f7fb')
d = ImageDraw.Draw(im)
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><title>Kun：Agent 工作台全景理解</title><desc>任务闭环、底层能力、16类展示与交互、产品对比、研究价值和验证边界。源码研究，未运行实测。</desc>']
C = {'ink':'#172c49','muted':'#51647b','blue':'#205dc2','green':'#147a6c','purple':'#7350a1','amber':'#97601b','line':'#d7e0ed'}
fonts = {}
def font(size, bold=False):
    key = size, bold
    if key not in fonts:
        fonts[key] = ImageFont.truetype('C:/Windows/Fonts/msyhbd.ttc' if bold else 'C:/Windows/Fonts/msyh.ttc', size)
    return fonts[key]
def rect(x,y,w,h,fill,outline=None,r=16):
    d.rounded_rectangle((x,y,x+w,y+h),r,fill=fill,outline=outline,width=2)
    svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{outline or "none"}" stroke-width="2"/>')
def text(x,y,s,size=27,color=None,bold=False):
    color = color or C['ink']
    d.text((x,y),s,font=font(size,bold),fill=color,anchor='lt')
    svg.append(f'<text x="{x}" y="{y}" fill="{color}" font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="{size}" font-weight="{700 if bold else 400}" dominant-baseline="text-before-edge">{escape(s)}</text>')
def wrap(s,width,size=27,bold=False):
    lines=[]
    for para in s.split('\n'):
        line=''
        for ch in para:
            if d.textlength(line+ch,font=font(size,bold))>width and line:
                lines.append(line); line=ch
            else: line+=ch
        lines.append(line)
    return lines
def para(x,y,s,width,size=27,color=None,bold=False,lh=None):
    lh=lh or int(size*1.52)
    for line in wrap(s,width,size,bold):
        text(x,y,line,size,color,bold);y+=lh
    return y
def line(x1,y1,x2,y2,color=None,width=3):
    color=color or C['line'];d.line((x1,y1,x2,y2),fill=color,width=width)
    svg.append(f'<path d="M{x1} {y1} L{x2} {y2}" stroke="{color}" stroke-width="{width}" fill="none"/>')
def section(n,title,y,h,color='blue'):
    if int(n)>=3: y+=330
    rect(40,y,1920,h,'#ffffff',C['line'])
    rect(64,y+22,66,52,C[color],r=10)
    text(77,y+29,n,31,'#ffffff',True)
    text(148,y+27,title,35,C['ink'],True)
    return y+96
def card(x,y,w,h,title,body,color='blue',size=26):
    rect(x,y,w,h,{'blue':'#eef4fe','green':'#edf8f4','purple':'#f5f0fa','amber':'#fff7e8'}[color])
    text(x+20,y+17,title,29,C[color],True)
    end=para(x+20,y+66,body,w-40,size)
    assert end<=y+h+5,(title,end,y+h)

rect(0,0,W,H,'#f5f7fb',r=0)
text(54,35,'Kun：Agent 工作台全景理解',66,C['ink'],True)
text(57,125,'类似 Codex 的 Agent 工作台  /  通用执行能力 + 成果交互 + 任务管理',31,C['muted'])
rect(54,185,1892,65,'#e5eefc')
text(77,200,'工作模式相似 ≠ 实现完全相同；功能重叠 ≠ 产品体验相同',34,C['blue'],True)

y=section('01','它是什么：从用户目标到可交付成果',275,335)
steps=[('用户目标','需求 / 约束 / 材料'),('模型理解','分析 / 规划 / 生成'),('工具执行','读写 / 运行 / 操作'),('结果与状态','文件 / 数据 / 记录'),('成果交互','预览 / 检查 / 部分编辑'),('用户反馈','确认 / 修改 / 继续')]
for i,(t,b) in enumerate(steps):
    x=65+i*316
    rect(x,y,290,106,'#edf4ff' if i<4 else '#eaf7f2')
    text(x+18,y+16,t,30,C['blue'] if i<4 else C['green'],True)
    text(x+18,y+65,b,22)
    if i<5:text(x+294,y+30,'→',27,C['muted'])
text(82,y+128,'↖  用户反馈进入下一轮上下文，驱动模型继续执行',27,C['green'],True)
text(82,y+181,'模型负责理解与生成；工具负责实际操作；工作台负责组织、展示、交互与追踪。',28)

y=section('02','底层能力：自有执行循环，也能整合外部 Agent 引擎',632,840)
cores=[('运行架构','Electron / React 桌面\nTypeScript 运行时\nHTTP / SSE；GUI / TUI / CLI'),('模型与工具','模型接入 / 流式回复 / 工具路由\n文件 / 命令 / 浏览器 / 计算机\n外部 MCP 工具'),('上下文与知识','历史压缩 / 缓存 / 工具发现\n记忆检索与作用域\n结构化文档索引'),('编排与复用','计划 / 子 Agent / Graph 调度\n主 Agent 验收 / Loop 批处理\nSkills / Hooks'),('权限与可靠性','审批策略 / 沙箱检查\n取消 / 限额 / 错误记录\n执行状态与会话持久化'),('扩展与数据','Provider / MCP / Webview\nJSONL 事件 / SQLite 索引\n记忆与任务状态存储')]
for i,(t,b) in enumerate(cores):
    card(65+(i%3)*636,y+(i//3)*182,610,176,t,b,size=23)
text(82,1104,'“自进化”指配置、Skills 与流程改进，不是训练模型权重；权限隔离和任务恢复仍需实测。',25,C['muted'])
text(82,1154,'模型接入：认证方式、请求协议、执行引擎是三个不同问题',30,C['blue'],True)
routes=[('普通 API / 兼容网关','API Key + 地址 + 模型 + 协议\n模型响应与工具结果反复交互\n执行循环：Kun 自己负责'),('仓库的 ChatGPT 订阅路线','OAuth → Codex Responses HTTP\n接入模型端点，不操作 Codex 应用\n执行循环：Kun 自己负责'),('Claude 订阅 / Agent SDK','官方 CLI 登录或 setup-token\nSDK 原生工具 + Kun 额外工具桥接\n执行循环：Claude Agent SDK 负责')]
for i,(t,b) in enumerate(routes):card(65+i*636,1203,610,177,t,b,'green' if i==2 else 'blue',23)
text(82,1402,'另有扩展 Provider 与专用 CLI / SDK 适配；不是所有订阅路线都相同，也不是所有功能由 Kun 原生循环执行。',24,C['muted'])
text(82,1438,'以上为源码实现；未验证账号可用性、协议稳定性、实际费用或各运行时功能一致性。',24,C['muted'])

y=section('03','16 类展示与交互：研究分类，不是 16 种独有 AI 智能',1164,655,'green')
groups=[('A  内容与成果呈现','blue',[
('01 富文本','Markdown / 公式 / 代码'),('02 图表','结构化数据 → 交互图表'),('03 网页','HTML 原型 / 页面预览'),('04 文档','PDF / Word 预览与引用'),('05 表格','工作表 / 单元格范围'),('06 演示','PPTX 缩略图 / 幻灯片'),('07 媒体','图片 / 音频 / 视频预览')]),
('B  可操作的创作界面','green',[('08 白板','图形 / 文字 / 连线 / 布局'),('09 动效','时间轴 / 关键帧 / SVG'),('10 设计节点图','提示 / 设计 / 图像')]),
('C  真实执行过程','blue',[('11 工具结果','终端 / 差异 / 调用记录'),('12 任务进度','计划 / Todo / 看板'),('13 多 Agent 图','依赖 / 状态 / 进度'),('14 运行追踪','请求 / 用量 / 错误')]),
('D  外观与扩展','purple',[('15 主题与角色','外观 / 声明式资源'),('16 扩展面板','Webview / 侧栏')])]
for i,(title,col,items) in enumerate(groups):
    x=65+i*477
    rect(x,y,451,435,{'blue':'#eef4fe','green':'#edf8f4','purple':'#f5f0fa'}[col])
    text(x+18,y+16,title,28,C[col],True)
    for j,(a,b) in enumerate(items):
        text(x+18,y+64+j*(51 if i==0 else 76),a,24,C['ink'],True)
        text(x+171,y+64+j*51,b,19,C['muted']) if i==0 else text(x+18,y+94+j*76,b,23,C['muted'])
# Native renderers and actual execution records have different inputs.
rect(65,y+451,1860,83,'#fff7e8')
text(85,y+463,'图表示例：模型提供数据和 ChartSpec → Kun 校验 → 前端渲染、提示与导出',27,C['amber'],True)
text(85,y+503,'展示不会自动纠正错误数据；执行过程应来自运行时记录。预览、生成与完整编辑是不同能力。',25)

y=section('04','与 Pi、Codex、Claude Code：能力重叠，形态与实现有差异',1841,430,'purple')
xs=[67,300,830,1390]
widths=[230,530,560,500]
headers=['对象','主要形态 / 定位','共同或重叠能力','研究重点']
rect(65,y,1860,46,'#e8eef8',r=6)
for x,s in zip(xs,headers):text(x+10,y+8,s,25,C['blue'],True)
rows=[('Kun','桌面工作台 + 本地运行时','模型 + 工具 + 任务执行','成果界面与流程整合'),('Pi','Agent 工具包 + 编程 CLI','模型接口 + 执行循环 + 工具','可组合运行时与扩展'),('Codex','编程 Agent / 工作台','读写文件 + 命令 + 任务执行','实际体验与权限边界'),('Claude Code','编程 Agent，多种入口','读写代码 + 命令 + 工具扩展','开发流程与生态集成')]
for i,row in enumerate(rows):
    yy=y+55+i*44
    for j,s in enumerate(row):text(xs[j]+10,yy,s,25,bold=(j==0))
    line(65,yy+34,1925,yy+34)
text(82,y+244,'定位比较不是性能排名；其他产品也在扩展成果与工作台能力。没有证据证明 Kun 全面更强。',25,C['muted'])
text(82,y+284,'Kun 使用 pi-tui 终端组件，不足以推断其整个 Agent 运行时建立在 Pi 之上。',25,C['muted'])

y=section('05','对我们的意义：从功能集合，走向更少切换与返工',2293,445,'purple')
values=[('作为使用者','减少工具切换；就地检查成果\n查看执行过程，定位问题\n修改后继续任务，而非反复搬运文件'),('作为开发者','参考桌面 UI 与运行时分层\n研究编辑器与 Agent 如何协作\n借鉴集成思路，构建领域工作台'),('作为研究者','区分模型、工具与产品各自贡献\n研究上下文与用户反馈\n建立任务评测，识别实际效率')]
for i,(t,b) in enumerate(values):card(65+i*636,y,610,181,t,b,'purple',25)
rect(65,y+199,1860,59,'#e9f5f0')
text(84,y+212,'生成 → 预览 → 定位问题 → 修改 → 继续执行 → 可交付成果',32,C['green'],True)
text(82,y+282,'这是潜在价值链：部分环节已有实现，整条链路是否顺畅仍需实测。',27)
text(82,y+310,'功能数量不等于模型智力；对我们更直接的价值，是可拆解的 Agent 产品设计样本。',25,C['muted'])

y=section('06','能力边界与判断：什么时候值得用，怎样验证？',2760,405,'amber')
card(65,y,919,287,'必须区分','预览 ≠ 完整编辑，不等于替代 Office\n媒体播放 ≠ 自带图片或视频生成模型\n文档生成、转换依赖工具链和环境\n本地工作台 ≠ 所有数据都不出本机\n可选扩展示例 ≠ 默认内置功能','amber',26)
card(1006,y,919,287,'以真实任务验证','比较正确率、完成时间与费用\n记录人工介入、返工与失败恢复\n检查文件兼容性和修改后的上下文同步\n已有工具够用：不因“16 类展示”而迁移\n自建产品：优先研究集成与交互设计','blue',26)

y=section('07','研究结论与证据边界',3187,403,'green')
rect(65,y,1860,64,'#e9f5f0')
text(85,y+14,'Kun 的潜在差异在整合体验；实际价值要由真实任务验证。',37,C['green'],True)
text(82,y+89,'研究版本：e67f656bca57  ·  文档与关键源码阅读  ·  未运行 Kun，未做同任务效果比较',26)
text(82,y+133,'依据：Kun 架构 / 图表 / 文档 / 扩展；Pi 仓库；Codex 与 Claude Code 官方文档。',25,C['muted'])
text(82,y+177,'许可：PolyForm Noncommercial；商业使用需另行书面授权，内部使用按仓库授权说明。',25,C['muted'])
text(82,y+221,'本图为研究归纳与价值判断，不是官方功能承诺、性能排名或真实应用截图。',25,C['muted'])
text(56,3944,'KUN RESEARCH  /  011                                      2026-09-17  ·  来源与完整说明见子项目 notes/infographic.md',22,C['muted'])
svg.append('</svg>')
OUT.mkdir(parents=True,exist_ok=True)
(OUT/'kun-overview.svg').write_text('\n'.join(svg),encoding='utf-8')
im.save(OUT/'kun-overview.png',optimize=True)
print(f'Created {W} × {H}: {OUT / "kun-overview.png"}')
