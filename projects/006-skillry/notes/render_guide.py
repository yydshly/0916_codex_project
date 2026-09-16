"""Render an original informational diagram to SVG and PNG; requires Pillow."""
from pathlib import Path
from html import escape
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
W, H = 1600, 1610
canvas = Image.new('RGB', (W, H), '#17151f')
draw = ImageDraw.Draw(canvas)
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-labelledby="title desc">',
       '<title id="title">Skillry 收录的技能类别、用途与代表名称</title>',
       '<desc id="desc">原创研究引导图，含四类技能、十二个代表名称、平台与执行环境的区别，以及低优先级参考的研究结论。数量为2026年9月16日快照，技能未实测。</desc>',
       f'<rect width="{W}" height="{H}" fill="#17151f"/>']

def rect(x, y, w, h, fill, radius=16):
    draw.rounded_rectangle((x, y, x+w, y+h), radius=radius, fill=fill)
    svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}"/>')

def text(x, y, value, size=26, color='#ffffff', bold=False, max_width=None):
    font = ImageFont.truetype('C:/Windows/Fonts/msyhbd.ttc' if bold else 'C:/Windows/Fonts/msyh.ttc', size)
    width = draw.textlength(value, font=font)
    if max_width is not None and width > max_width:
        raise ValueError(f'Text exceeds diagram column: {value}')
    draw.text((x, y), value, font=font, fill=color, anchor='lt')
    svg.append(f'<text x="{x}" y="{y}" dominant-baseline="text-before-edge" font-family="Microsoft YaHei,Segoe UI,sans-serif" font-size="{size}" font-weight="{700 if bold else 400}" fill="{color}">{escape(value)}</text>')

text(70, 47, '006 / SKILL DIRECTORY / 讨论结论', 20, '#d9f680')
text(70, 99, 'Skillry 主要收录什么？', 56, bold=True)
text(70, 181, '偏视觉创作的 Skill 展示、售卖与分发平台', 30, '#d7cee5')
text(70, 237, '232 个条目 · 网站提供发现与获取入口；实际创作由 AI 助手和工具执行', 24, '#bdb3ce')

cards = [
    (70, 308, '#30263e', '#c9b5ff', '01  网页 / Web', '86',
     ['产品落地页、网站首屏、个人作品集', '图表、活动日历、表格与数据展示'],
     ['Obsidian Cinema Landing', 'Editorial Dev Portfolio', 'Activity Calendar Chart'],
     '交付：页面或组件；业务后端与支付需另接。'),
    (818, 308, '#252f3c', '#a5d8ff', '02  演示 / Slides', '47',
     ['产品路演、品牌故事、客户汇报', '文章摘要、论文演示与研究汇报'],
     ['Visual Canvas Deck', 'Editable Visual Deck', 'Research Paper Deck'],
     '交付：演示页面或文件；PPTX 编辑性另验。'),
    (70, 764, '#2b3024', '#d9f680', '03  图片 / Image', '81',
     ['文章插图、社交分享封面、品牌素材', '信息图、产品展示与风格化人像'],
     ['Paperline Content Illustrator', 'Procreate Style OG Image', 'Monochrome Studio Portrait'],
     '交付：视觉图片；部分需外部模型与费用。'),
    (818, 764, '#3a2832', '#ffb5b9', '04  视频 / Video', '18',
     ['产品发布短片、界面动效、品牌片头', 'Logo 揭示、功能展示与前后对比'],
     ['Velocity-Matched UI Sting', 'Liquid-Rupture Logo Reveal', 'Persistent-Chat Before-After Film'],
     '交付：短视频与动效；具体工具依技能而定。'),
]
for x, y, bg, accent, title, count, uses, names, limit in cards:
    rect(x, y, 712, 422, bg)
    text(x+28, y+26, title, 32, accent, True, 530)
    text(x+602, y+26, count, 34, accent, True)
    for i, line in enumerate(uses): text(x+28, y+91+i*42, line, 26, '#f1edf7', max_width=660)
    text(x+28, y+190, '代表 Skill', 20, accent)
    for i, name in enumerate(names): text(x+28, y+228+i*38, name, 24, '#e4ddeb', max_width=660)
    text(x+28, y+367, limit, 23, '#bfb6cc', max_width=660)

rect(70, 1224, 1460, 112, '#292135')
text(98, 1246, '平台功能', 25, '#c9b5ff', True)
text(280, 1246, '分类浏览 · 案例预览 · 授权购买 · 安装分发与更新', 26)
text(98, 1289, '执行能力', 25, '#d9f680', True)
text(280, 1289, '具体技能方法 ＋ 你的 AI 助手 ＋ 生图、视频等外部工具', 26)
text(70, 1375, '我们的判断：低优先级资源参考，现阶段不建议仅为目录付费。', 31, '#d9f680', True, 1460)
text(70, 1433, '收费本身不证明价值；是否原创、是否转售免费资源，尚未核实。', 25, '#d7cee5')
text(70, 1490, '来源：skillry.dev 首页、目录与技能详情 · 2026-09-16 快照 · 非全量技能清单', 22, '#bdb3ce')
text(70, 1536, '原创研究引导图，非官方界面；未安装运行技能，案例质量与实际成本尚未验证。', 22, '#bdb3ce')
svg.append('</svg>')
folder = ROOT / 'assets'
(folder / 'understanding-guide.svg').write_text('\n'.join(svg)+'\n', encoding='utf-8')
canvas.save(folder / 'understanding-guide.png')
print('Generated understanding-guide.svg and understanding-guide.png')
