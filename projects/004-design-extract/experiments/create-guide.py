"""Create an editable, original SVG research diagram; no upstream UI is reproduced."""
from pathlib import Path
from html import escape

PROJECT = Path(__file__).resolve().parents[1]
parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1720" viewBox="0 0 1600 1720" role="img" aria-labelledby="title desc">', '<title id="title">Design Extract：从网页采集到复刻验证</title><desc id="desc">库能力、Codex 对比、使用场景和我们构建网页复刻能力的参考价值。原创研究图，非运行截图。</desc>', '<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#8091ac"/></marker><marker id="green" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#7ee0c7"/></marker></defs>']

def box(x,y,w,h,fill='#ffffff',stroke='#dae3ee',r=16):
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}"/>')

def text(x,y,value,size=26,color='#172d49',weight=400):
    parts.append(f'<text x="{x}" y="{y}" font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="{size}" font-weight="{weight}" fill="{color}">{escape(value)}</text>')

def lines(x,y,values,size=25,color='#52657c',gap=39):
    for i,value in enumerate(values):
        text(x,y+i*gap,value,size,color)

def arrow(x1,y1,x2,y2):
    parts.append(f'<path d="M{x1},{y1} L{x2},{y2}" stroke="#8091ac" stroke-width="3" fill="none" marker-end="url(#arrow)"/>')

box(0,0,1600,1720,'#f3f6fb','#f3f6fb',0)
box(60,53,54,54,'#2454e6','#2454e6',12)
text(69,91,'de.',30,'white',700)
text(135,89,'DESIGN EXTRACT  /  004 研究引导',23,'#2454e6',700)
text(60,169,'获取设计信息，走向可验证的网页复刻。',52,weight=700)
text(62,219,'我们的判断：单次复刻先直接用 Codex；重复采集和复用时，再评估这个库。',27)

box(60,255,1480,243)
text(88,298,'01  库的能力：采集 → 归纳 → 导出',30,'#2454e6',700)
for x,title,body in [
    (90,'浏览器采集',['结构、计算样式、布局','多视口、主题、悬停与聚焦']),
    (585,'设计信息整理',['颜色与间距统计、角色推断','保留观测值，核对归纳结果']),
    (1080,'资料与配置导出',['设计文档、变量、主题配置','另有模板与差异相关功能'])]:
    text(x,356,title,29,weight=700)
    lines(x,400,body,25,gap=38)
arrow(478,371,543,371)
arrow(973,371,1038,371)
text(89,476,'基础提取主要读取结构和样式；截图是视觉参考，可选模型辅助部分分类。',23,'#52657c')

box(60,520,1480,292)
text(88,565,'02  与 Codex 的差别：组织方式不同，采集方法可以相同',30,'#2454e6',700)
box(88,590,694,146,'#eef3ff','#eef3ff',10)
box(802,590,710,146,'#eaf5f1','#eaf5f1',10)
text(111,630,'Design Extract',30,weight=700)
lines(111,670,['预设采集项 → 规则归纳 → 统一格式','适合标准化提取与反复调用'],25,gap=37)
text(825,630,'Codex（具备相应工具时）',30,weight=700)
lines(825,670,['按任务观察 → 补充测量 → 实现 → 对照修改','适合围绕当前目标动态完成开发'],25,gap=37)
text(89,780,'实际测量可以精确；视觉估计、分类和归纳都可能出错。尚无两种流程的效果对照实验。',24,'#52657c')

box(60,834,1480,220)
text(88,879,'03  使用场景：什么时候值得引入？',30,'#2454e6',700)
for x,title,body in [
    (91,'一个喜欢的网页',['先直接交给 Codex','要求测量和截图检查']),
    (455,'多个项目复用风格',['提取并核对设计规范','保存变量、字体和组件参数']),
    (819,'批量分析与旧站盘点',['统一采集、记录来源','抽查结果，处理遗漏']),
    (1183,'开发复刻工具',['候选采集模块','补齐生成与修正'])]:
    text(x,932,title,26,weight=700)
    lines(x,976,body,23,gap=36)

box(60,1076,1480,361,'#172d49','#172d49')
text(88,1124,'04  我们的参考价值：借鉴前段能力，补齐完整工作流程',30,'#ffffff',700)
text(90,1167,'建议架构 · 尚未端到端验证',23,'#a9c5ef')
xs=[90,381,672,963,1254]
labels=[('浏览器采集','截图 + 结构样式'),('有来源的资料','观测 / 推断分开'),('生成代码','按区域与组件'),('运行预览','检查构建与交互'),('同条件比较','同视口、同状态')]
for i,(label,sub) in enumerate(labels):
    box(xs[i],1192,250,94,'#28456a','#446182',10)
    text(xs[i]+19,1230,label,27,'#ffffff',700)
    text(xs[i]+19,1265,sub,22,'#d4e0f0')
    if i<4: arrow(xs[i]+257,1238,xs[i+1]-8,1238)
parts.append('<path d="M1379,1297 V1326 H797 V1297" stroke="#7ee0c7" stroke-width="3" fill="none" marker-end="url(#green)"/>')
text(915,1363,'定位差异 → 修改代码 → 再次验证',24,'#7ee0c7',700)
text(90,1405,'原站操作前后对比：理解状态变化。原站与复刻页对比：验证还原效果。',25,'#d4e0f0')

box(60,1459,1480,140,'#e9efff','#d8e2fb')
text(89,1503,'下一步实验：同一批页面，比较三种输入方式',28,'#2454e6',700)
text(91,1545,'A  仅截图',26,weight=700)
text(422,1545,'B  截图 + 自行采集',26,weight=700)
text(1007,1545,'C  截图 + 本库输出',26,weight=700)
text(91,1580,'固定模型、框架与修正轮次；比较视觉、交互、人工修改、耗时和成本。',23,'#52657c')
text(62,1641,'实测边界：1 个原创样本；17 项基础检查通过，另有 4 项保真问题。未验证完整复刻。',23,'#52657c')
text(62,1682,'2026.09.16  ·  designlang 13.3.0 / 47f75bb  ·  原创研究示意图，非上游界面',21,'#52657c')
parts.append('</svg>')
content='\n'.join(parts)+'\n'
for folder in ['assets','app/media']:
    (PROJECT/folder/'understanding-guide.svg').write_text(content,encoding='utf-8')
print('Created editable SVG guide (1600 × 1720).')
