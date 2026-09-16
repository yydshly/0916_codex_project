"""Build the original, deterministic Chinese research diagram as SVG and PNG."""
from pathlib import Path
from html import escape
import math
import shutil
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
W, H = 2100, 2470
INK, MUTED, NAVY = '#182538', '#53647a', '#142239'
ORANGE, BLUE, LINE = '#bf451b', '#2452b8', '#d6dfeb'
im = Image.new('RGB', (W, H), '#f4f6fa')
draw = ImageDraw.Draw(im)
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-labelledby="title desc">', '<title id="title">PUA 全部理解总览：问题、选法、执行、标准与驱动机制</title>', '<desc id="desc">原创源码解读图。展示六类适用问题、五阶段规则使用时机、四类参考标准、十四种风格及钉内钉外扩展，并区分模型驱动与可选脚本控制。非效果实测图。</desc>', '<rect width="2100" height="2470" fill="#f4f6fa"/>']
fonts = {}

def font(size, bold=False):
    key = (size, bold)
    if key not in fonts:
        fonts[key] = ImageFont.truetype('C:/Windows/Fonts/msyhbd.ttc' if bold else 'C:/Windows/Fonts/msyh.ttc', size)
    return fonts[key]

def box(x, y, w, h, fill='#ffffff', stroke=LINE, radius=16):
    draw.rounded_rectangle((x,y,x+w,y+h), radius=radius, fill=fill, outline=stroke, width=1)
    svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke}"/>')

def text(x, y, value, size=26, color=INK, bold=False):
    # y is baseline; use identical coordinates in both formats.
    draw.text((x,y),value,font=font(size,bold),fill=color,anchor='ls')
    svg.append(f'<text x="{x}" y="{y}" font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="{size}" font-weight="{700 if bold else 400}" fill="{color}">{escape(value)}</text>')

def wrapped(x,y,value,width,size=26,color=MUTED,bold=False,leading=None,max_lines=None):
    leading = leading or int(size*1.6)
    lines=[]
    for paragraph in value.split('\n'):
        current=''
        for char in paragraph:
            if current and draw.textlength(current+char,font=font(size,bold)) > width:
                lines.append(current); current=char
            else: current += char
        lines.append(current)
    if max_lines is not None:
        assert len(lines)<=max_lines, (value,lines)
    for i,line in enumerate(lines): text(x,y+i*leading,line,size,color,bold)
    return y+len(lines)*leading

def arrow(points,color=BLUE,width=3):
    draw.line(points,fill=color,width=width)
    svg.append(f'<polyline points="{" ".join(f"{x},{y}" for x,y in points)}" fill="none" stroke="{color}" stroke-width="{width}"/>')
    x,y=points[-1]; px,py=points[-2]; angle=math.atan2(y-py,x-px)
    tri=[(x,y),(x-12*math.cos(angle-.48),y-12*math.sin(angle-.48)),(x-12*math.cos(angle+.48),y-12*math.sin(angle+.48))]
    draw.polygon(tri,fill=color)
    svg.append(f'<polygon points="{" ".join(f"{a:.2f},{b:.2f}" for a,b in tri)}" fill="{color}"/>')

def heading(y,n,title,sub=None):
    text(60,y,n,24,ORANGE,True); text(120,y,title,34,INK,True)
    if sub: text(120,y+42,sub,24,MUTED)

box(0,0,W,272,NAVY,NAVY,0)
text(60,54,'007 / OPEN SOURCE RESEARCH',23,'#acbdd5')
text(60,122,'PUA：让 AI 按证据推进任务',56,'#ffffff',True)
text(60,180,'本质 = 行为规则 + 方法库 + 可选运行钩子',34,'#ffc393',True)
text(60,232,'规则进入上下文，影响 AI 的下一步决策；角色话术强化行动要求，模型与工具负责实际执行。',26,'#d6e1f1')

heading(327,'01','可以辅助解决哪些问题？','适合反复失败、同思路打转、只给计划、猜测归因或缺少验证的任务；不保证修复成功。')
problems=[('Bug / 接口错误','边界遗漏、参数误判、调用链故障'),('功能不完整','主流程能跑，但漏异常处理和回归'),('审查与质量问题','只有笼统意见，缺具体缺陷证据'),('配置 / 部署异常','版本、路径、权限或服务状态不明'),('性能瓶颈','靠感觉改实现，没有基线和测量'),('调研与事实错误','凭记忆下结论，来源与结论脱节')]
for i,(name,body) in enumerate(problems):
    x=60+(i%3)*670; y=392+(i//3)*125
    box(x,y,640,108)
    text(x+22,y+40,name,28,INK,True); text(x+22,y+80,body,24,MUTED)

heading(690,'02','真正使用时：谁在什么时候参考哪些规则？')
steps=[
('任务触发时','明确目标，加载通用规则','用户显式调用，或宿主按技能描述选择。\n读取 SKILL.md；先从需求、项目约定中明确验收。'),
('开始解题时','AI 判断类型，选方法','参考方法选择表，按需读当前风格附件。\n修 Bug → 华为；性能 → 字节；调研 → 百度。'),
('实际执行时','把规则变成工具动作','读日志 / 查源码 → 列假设 → 最小复现 → 修改 → 验证。\n每次行动应获得新证据。'),
('连续失败时','核对证据，调整方案','同一子目标失败才升级；有新证据可继续深入。\n原地打转则换假设、方法或工具。'),
('准备交付时','按任务标准验收','用测试、实际运行与来源核对结果。\n通过则交付；受阻则说明事实、排除项与下一步。')]
for i,(timing,title,body) in enumerate(steps):
    x=60+i*402; y=735
    box(x,y,372,340,'#ffffff',LINE)
    box(x+20,y+20,332,43,'#eaf0fb','#eaf0fb',6)
    text(x+35,y+50,f'{i+1:02d}  {timing}',24,BLUE,True)
    wrapped(x+22,y+107,title,328,29,INK,True,leading=39,max_lines=2)
    wrapped(x+22,y+182,body,328,25,MUTED,leading=39,max_lines=4)
    if i<4: arrow([(x+378,y+169),(x+395,y+169)])
arrow([(1452,1087),(1452,1110),(648,1110),(648,1087)],ORANGE)
text(505,1155,'失败后回到方法选择；用户指定优先，锁定风格时保持语气、只换解题方法。',24,ORANGE)
text(60,1198,'计数口径：预期复现不算修复失败；工具报错不直接等于任务失败。L1=2 次 / L2=3 次 / L3=4 次 / L4≥5 次。',24,MUTED)

heading(1265,'03','有哪些标准？它们分别在什么时候起作用？')
criteria=[
('过程标准','加载后，全程约束','先查证、换实质方法、交付有证据。\n五步排查 + 七项检查清单。'),
('方法参考','选法时 / 失败换法时','企业风格提供分析视角：根因、对照实验、简化、倒推。\n具体动作由 AI 结合问题决定。'),
('任务验收','开工前明确 / 交付前核对','需求、业务规则、项目约定、可信测试与相关规范。\n决定这次结果是否正确。'),
('效果评估','评估是否值得采用时','同模型、同任务、同预算多次对照；看质量、回归、人工介入、耗时与 token。')]
for i,(name,timing,body) in enumerate(criteria):
    x=60+i*505; y=1310
    box(x,y,475,224,'#eaf0fb','#d0ddef')
    text(x+22,y+42,name,29,BLUE,True); text(x+22,y+81,timing,22,INK,True)
    wrapped(x+22,y+125,body,431,24,MUTED,leading=36,max_lines=3)

heading(1600,'04','14 种企业风格 = 话术 + 方法 + 行为要求','这是作者编排的方法库，不是企业官方认证；AI 参考对应表选择，不保证选到最优方法。')
flavors=[('阿里','目标、执行、复盘'),('字节','数据与对照实验'),('华为','根因与反向检查'),('腾讯','多方案与小步验证'),('百度','优先搜索与查证'),('拼多多','删减中间步骤'),('美团','标准化与长期效率'),('京东','体验与结果核对'),('小米','聚焦体验与反馈'),('Netflix','评估方案是否保留'),('Musk','质疑、删减、简化'),('Jobs','减法、细节、原型'),('Amazon','从用户目标倒推'),('Microsoft','贡献与改进行动')]
for i,(name,method) in enumerate(flavors):
    x=60+(i%7)*286; y=1664+(i//7)*103
    box(x,y,266,88)
    text(x+16,y+34,name,25,INK,True); text(x+16,y+69,method,22,MUTED)
text(60,1910,'补充：源码还有“钉内／钉外”扩展，强调真实用户结果和证据；改变汇报口径不等于解决问题。',25,ORANGE)

heading(1975,'05','驱动力来自哪里？')
box(60,2014,975,231,'#ffffff',LINE)
text(84,2060,'模型驱动：读规则 → 理解 → 决策 → 调用工具',29,INK,True)
wrapped(84,2110,'通用规则约束过程，风格附件提供方法。角色话术强化任务责任和行动要求；实际效果依赖模型遵循程度。\n单独加载 skill 时，主要依靠这条路径。',919,26,MUTED,leading=40,max_lines=3)
box(1065,2014,975,231,'#ffffff',LINE)
text(1089,2060,'脚本驱动：事件 → 提醒 / 状态 / 验收反馈',29,INK,True)
wrapped(1089,2110,'仅在宿主支持并实际运行相应钩子时生效。循环模式配置验证命令后，可独立运行并驳回未通过的完成声明。\n脚本只能检查其覆盖的条件。',919,26,MUTED,leading=40,max_lines=3)

box(60,2280,1980,121,NAVY,NAVY,12)
text(86,2324,'边界：不新增模型知识与权限，不补出未知业务规则，不用无限重试代替真实条件。',28,'#ffffff',True)
text(86,2370,'规则约束“怎样做”，任务验收判断“做得对不对”。更多调用和更强语气，都不能直接证明效果更好。',26,'#cfddf1')
text(60,2443,'原创研究汇总 · 非运行效果图 · v3.5.1 / e6e6cd2 · 未做真实模型 A/B 对照，未证明效率翻倍',22,MUTED)
svg.append('</svg>')
assets=ROOT/'assets'; public=ROOT/'app'/'media'
assets.mkdir(exist_ok=True); public.mkdir(exist_ok=True)
(assets/'understanding-map.svg').write_text('\n'.join(svg),encoding='utf-8')
im.save(assets/'understanding-map.png',optimize=True)
for suffix in ('svg','png'): shutil.copy2(assets/f'understanding-map.{suffix}',public/f'understanding-map.{suffix}')
print(f'Created original diagram: {W}x{H}; SVG and PNG; public copies match.')
