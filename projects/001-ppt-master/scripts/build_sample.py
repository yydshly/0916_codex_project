"""Author a small reproducible capability fixture and export it with PPT Master.

This is an isolated converter experiment, not a run of the upstream full Agent
planning workflow. All numerical data below is fictional demonstration data.
"""
from pathlib import Path
import argparse
import hashlib
import html
import json
import shutil
import subprocess
import sys
import zipfile
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SAMPLE = ROOT / "sample"
INK, MUTED, TEAL, BG = "#142C35", "#526C73", "#007F73", "#F6F8F5"


def text(x, y, value, size=28, color=INK, bold=False, **attrs):
    extra = " ".join(f'{k.replace("_", "-")}="{v}"' for k, v in attrs.items())
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" font-weight="{"bold" if bold else "normal"}" {extra}>{html.escape(value)}</text>'


def rect(x, y, w, h, color, **attrs):
    extra = " ".join(f'{k.replace("_", "-")}="{v}"' for k, v in attrs.items())
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{color}" {extra}/>'


def line(x1, y1, x2, y2, color="#CFDAD7", width=2):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{width}"/>'


def page(title, subtitle, body, number):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" lang="zh-CN" font-family="Microsoft YaHei" font-size="28">'
            + rect(0, 0, 1280, 720, BG)
            + text(70, 84, title, 42, bold=True)
            + text(72, 133, subtitle, 23, MUTED)
            + body + line(72, 650, 1208, 650)
            + text(72, 686, "PPT MASTER / 本地能力实验 · 示例数据", 17, MUTED)
            + text(1208, 686, f"{number:02d} / 05", 17, MUTED, text_anchor="end") + '</svg>')


def marker(kind, name, bounds, payload, fallback):
    x, y, w, h = bounds
    return (f'<g id="{name}" data-pptx-replace-with="{kind}" data-pptx-bounds="{x} {y} {w} {h}" '
            f'data-pptx-x="{x}" data-pptx-y="{y}" data-pptx-width="{w}" data-pptx-height="{h}">'
            f'<metadata type="application/json">{html.escape(json.dumps(payload, ensure_ascii=False))}</metadata>{fallback}</g>')


def author():
    svg_dir = SAMPLE / "svg_output"
    notes_dir = SAMPLE / "notes"
    svg_dir.mkdir(parents=True, exist_ok=True)
    notes_dir.mkdir(parents=True, exist_ok=True)
    cover = (rect(0, 0, 1280, 720, INK)
             + text(78, 91, "PPT MASTER  /  CAPABILITY STUDY", 22, "#93D9C9")
             + text(72, 248, "可编辑 PowerPoint", 70, "#FFFFFF", True)
             + text(76, 342, "从页面设计，到原生对象", 48, "#FFFFFF")
             + line(78, 412, 1196, 412, "#42616A")
             + text(80, 484, "文字排版    流程图    数据图表    表格    数学公式", 28, "#B8D9D5")
             + text(80, 594, "5 页真实导出样例 · 两种编辑方式", 25, "#FFFFFF")
             + text(80, 652, "原始数据为演示构造；导出由 PPT Master 完成", 20, "#B8D9D5"))
    pages = [('01-cover', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" lang="zh-CN" font-family="Microsoft YaHei">' + cover + '</svg>')]
    flow = ''
    for i, (label, detail) in enumerate([('源材料', '文档 / 数据 / 主题'), ('页面设计', '文字 / 布局 / SVG'), ('原生对象', '形状 / 图表 / 表格')]):
        x = 72 + i * 404
        flow += rect(x, 240, 326, 192, "#E3EFEB", rx=12)
        flow += text(x + 24, 286, f"0{i+1}", 23, TEAL, True)
        flow += text(x + 24, 343, label, 34, INK, True)
        flow += text(x + 24, 392, detail, 23, MUTED)
        if i < 2:
            flow += line(x + 338, 336, x + 385, 336, TEAL, 3)
            flow += f'<path d="M {x+377} 328 L {x+385} 336 L {x+377} 344" fill="none" stroke="{TEAL}" stroke-width="3"/>'
    flow += text(76, 523, "每个节点与连接线都是独立对象", 32, bold=True)
    flow += text(76, 574, "可在 PowerPoint 中移动、改色、修改文字；页面不是整张截图。", 25, MUTED)
    pages.append(('02-workflow', page('流程图与文字排版', '观察重点：独立形状、连线和可编辑文本', flow, 2)))
    values = [32, 48, 61, 80]
    chart = ''
    for value in [0, 20, 40, 60, 80, 100]:
        y = 570 - value * 3.3
        chart += line(122, y, 846, y, "#CFDAD7", 1)
        chart += text(106, y + 7, str(value), 18, MUTED, text_anchor="end")
    for i, v in enumerate(values):
        x = 178 + i * 170
        chart += rect(x, 570 - v * 3.3, 80, v * 3.3, TEAL)
        chart += text(x + 40, 570-v*3.3-12, str(v), 23, INK, True, text_anchor="middle")
        chart += text(x + 40, 608, f"Q{i+1}", 22, MUTED, text_anchor="middle")
    payload = {"x":72,"y":200,"width":806,"height":422,"type":"column","name":"季度演示数据","categories":["Q1","Q2","Q3","Q4"],"series":[{"name":"示例值","values":values}],"show_legend":False,"data_labels":{"show_value":True},"axes":{"value":{"minimum":0,"maximum":100,"major_unit":20,"major_gridlines":True},"category":{"position":"bottom"}},"style":{"colors":[TEAL],"font_family":"Microsoft YaHei","font_size":22,"grid_color":"#CFDAD7","axis_color":"#CFDAD7"}}
    body = marker('chart','quarterly-chart',(72,200,806,422),payload,chart)
    body += text(932, 288, "32 → 80", 46, TEAL, True)
    body += text(932, 344, "虚构季度数据", 24, MUTED)
    body += text(932, 435, "形状版", 25, bold=True) + text(932, 476, "逐个修改柱形", 23, MUTED)
    body += text(932, 536, "原生数据版", 25, bold=True) + text(932, 577, "编辑底层工作簿", 23, MUTED)
    pages.append(('03-chart', page('图表：形状与数据对象', '同一份数据，分别导出为可编辑形状和原生图表', body, 3)))
    columns = ['页面元素', '形状版', '原生数据版']
    rows = [['文字 / 流程图', '文本与形状', '文本与形状'],['季度柱状图','独立柱形与标签','图表 + 内嵌工作簿'],['能力对照表','单元格外观拆分为形状','可编辑表格'],['数学公式','Office Math 公式','Office Math 公式']]
    table = ''
    widths = [330,390,416]
    for r, row in enumerate([columns] + rows):
        x = 72
        for c, value in enumerate(row):
            fill = INK if r==0 else ('#EAF1ED' if r%2 else '#FFFFFF')
            table += rect(x,218+r*70,widths[c],70,fill)
            table += text(x+22,262+r*70,value,24,"#FFFFFF" if r==0 else INK,r==0)
            x += widths[c]
    def cell(value, header=False, alt=False):
        return {"text":value,"fill":INK if header else ('#EAF1ED' if alt else '#FFFFFF'),"color":"#FFFFFF" if header else INK,"font_size":24,"bold":header,"valign":"middle","padding":{"left":22,"right":12,"top":8,"bottom":8}}
    table_payload={"schema":"ppt-master.semantic-table.v2","x":72,"y":218,"width":1136,"height":350,"name":"能力对照表","column_widths":widths,"row_heights":[70]*5,"columns":[cell(v,True) for v in columns],"rows":[[cell(v,alt=(i%2==0)) for v in row] for i,row in enumerate(rows)],"style":{"font_family":"Microsoft YaHei","font_size":24,"band_row":False}}
    pages.append(('04-table',page('表格：保留行列与单元格', '原生数据版支持直接选中单元格、修改内容和调整列宽',marker('table','capability-table',(72,218,1136,350),table_payload,table),4)))
    formula = {"latex":r"x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}","display":"block","font_size":52,"color":INK,"align":"center"}
    preview = text(640,348,'x = (−b ± √(b² − 4ac)) / 2a',48,INK,text_anchor='middle')
    body = marker('formula','quadratic-formula',(170,225,940,180),formula,preview)
    body += text(100,492,'LaTeX → Office Math',36,TEAL,True)
    body += text(100,552,'分数、根号与上下标以原生公式结构保存。',27,MUTED)
    body += text(100,600,'在 PowerPoint 中选中公式，继续修改数学表达式。',25,MUTED)
    pages.append(('05-formula',page('公式：结构化数学表达式','SVG 中显示文本预览；PPTX 中输出可编辑的 Office Math',body,5)))
    for name, svg in pages:
        (svg_dir / f'{name}.svg').write_text(svg,encoding='utf-8')
        (notes_dir / f'{name}.md').write_text(f'# {name}\n\n本页是 PPT Master 本地能力实验，所有数值为虚构示例。\n\n来源：https://github.com/hugohe3/ppt-master/tree/52a2801c27cb468d7ea95e25c7b0702eaa360914\n',encoding='utf-8')


def inspect_pptx(path):
    ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','m':'http://schemas.openxmlformats.org/officeDocument/2006/math'}
    with zipfile.ZipFile(path) as z:
        slides=sorted(n for n in z.namelist() if n.startswith('ppt/slides/slide') and n.endswith('.xml') and '/_rels/' not in n)
        pages=[]
        for name in slides:
            root=ET.fromstring(z.read(name))
            pages.append({'slide':len(pages)+1,'shapes':len(root.findall('.//p:sp',ns)),'charts':len(root.findall('.//{http://schemas.openxmlformats.org/drawingml/2006/chart}chart')),'tables':len(root.findall('.//a:tbl',ns)),'formulas':len(root.findall('.//m:oMath',ns)),'pictures':len(root.findall('.//p:pic',ns)),'transitions':len(root.findall('p:transition',ns))})
        return {'file':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'slides':pages,'embedded_workbooks':len([n for n in z.namelist() if n.startswith('ppt/embeddings/') and n.endswith('.xlsx')]),'notes':len([n for n in z.namelist() if n.startswith('ppt/notesSlides/notesSlide') and n.endswith('.xml')])}


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--upstream',type=Path,default=ROOT.parents[1]/'upstream/ppt-master')
    parser.add_argument('--author-only',action='store_true')
    args=parser.parse_args()
    author()
    if args.author_only:
        return
    scripts=args.upstream.resolve()/'skills/ppt-master/scripts'
    def run(name,*argv):
        subprocess.run([sys.executable,str(scripts/name),*map(str,argv)],check=True)
    run('stamp_native_fallbacks.py',SAMPLE/'svg_output','--write')
    run('svg_quality_checker.py',SAMPLE,'--quick-generate','--stage','final','--json')
    exports=ROOT/'app/downloads'
    exports.mkdir(parents=True,exist_ok=True)
    for name,extra in [('editable-shapes',[]),('native-data',['--native-charts-and-tables'])]:
        run('svg_to_pptx.py',SAMPLE,'--quick-generate','-o',exports/f'{name}.pptx','--transition','fade','--animation','none','--with-notes',*extra)
    reports=[inspect_pptx(exports/f'{name}.pptx') for name in ['editable-shapes','native-data']]
    native=reports[1]
    assert len(native['slides'])==5
    assert sum(s['charts'] for s in native['slides'])==1
    assert sum(s['tables'] for s in native['slides'])==1
    assert sum(s['formulas'] for s in native['slides'])==1
    assert native['embedded_workbooks']==1
    assert all(s['pictures']==0 for s in native['slides'])
    report={'upstream_commit':subprocess.check_output(['git','-C',str(args.upstream),'rev-parse','HEAD'],text=True).strip(),'method':'Upstream CLI export followed by OOXML ZIP inspection. Rendering recorded separately.','data':'Fictional demonstration values: 32, 48, 61, 80.','exports':reports}
    (ROOT/'app/evidence.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (ROOT/'app/evidence.js').write_text('window.PPT_EVIDENCE = '+json.dumps(report,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
    source_dir=ROOT/'app/sources'
    source_dir.mkdir(parents=True,exist_ok=True)
    for svg in (SAMPLE/'svg_output').glob('*.svg'):
        shutil.copy2(svg,source_dir/svg.name)
    print('Verified: 5 slides, 1 native chart, 1 workbook, 1 table, 1 formula, no slide pictures.')


if __name__=='__main__':
    main()
