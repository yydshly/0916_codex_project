"""Collect pinned official SVG examples for the visual-style reference gallery.

Sources stay in ignored upstream/ppt-style-cache. Browser-rendered previews,
attribution, source hashes, and curated descriptions are public artifacts.
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.parse import quote, urljoin
from xml.etree import ElementTree as ET
import hashlib
import json
import subprocess

PROJECT = Path(__file__).resolve().parents[1]
REPO = PROJECT.parents[1]
COMMIT = '3adb91f1d3226f5a48c2df1d10e1f3f37a246a87'
CORE_COMMIT = '52a2801c27cb468d7ea95e25c7b0702eaa360914'
CACHE = REPO / 'upstream/ppt-style-cache'

# id, Chinese name, category, official example, body-page index, visual traits,
# suggested uses, editability/material note. Uses are our editorial guidance.
STYLES = [
('swiss-minimal','瑞士极简','商务与产品','ppt169_swiss_grid_systems',3,'严格网格、大留白、醒目文字，装饰很少。','研究结论、产品策略、简洁路演','风格主要依靠排版与几何；无需把整页做成图片。'),
('soft-rounded','柔和圆角','商务与产品','ppt169_every_day_counts_proposal',3,'圆角容器、柔和层次、亲切的模块关系。','方案介绍、教育服务、产品说明','圆角形状与文字可分别组织；插画仍取决于使用的素材。'),
('glassmorphism','毛玻璃','商务与产品','ppt169_glassmorphism_demo',3,'半透明面板、渐变光感、悬浮层次。','SaaS、AI 产品、发布演示','用透明度、渐变和层叠形成玻璃观感，不代表支持任意网页实时模糊。'),
('dark-tech','深色科技','商务与产品','ppt169_uv_launch',3,'深底、高对比强调、精确几何和局部发光。','开发工具、技术发布、系统介绍','文字和几何可保持独立；光效须符合转换器支持范围。'),
('blueprint','工程蓝图','商务与产品','ppt169_attention_is_all_you_need',4,'图纸线条、标注、结构拆解和技术信息层级。','架构讲解、论文解读、工程方案','适合原生图形、公式和标注结合；导出的连接关系需另行检查。'),
('editorial','杂志编辑','编辑与出版','ppt169_pritzker_2026',2,'标题层级、分栏、图片与文字形成阅读节奏。','设计评论、人物介绍、文化专题','文字与图像分开编排；照片内部不具备文字级编辑能力。'),
('photo-editorial','摄影叙事','编辑与出版','ppt169_apollo_photo_essay',4,'大幅摄影、少量标题、图注和强烈画面重心。','旅行、人文、历史叙事、品牌故事','视觉主体为照片，PPT 中可调整图片与叠加文字，不能拆开照片内容。'),
('data-journalism','数据新闻','编辑与出版','ppt169_china_economy_2025_briefing',2,'密集证据、微型图表、分栏与来源注释。','经济简报、行业观察、数据报告','外观不等于数据可编辑；要保留数据工作簿须走原生图表出口。'),
('brutalist','粗野报刊','编辑与出版','ppt169_brutalism_field_guide',3,'硬边框线、密集排版、直接而粗粝的结构。','建筑专题、观点表达、文化提案','排版与几何可原生化；照片或纹理素材仍按图片处理。'),
('memphis','孟菲斯波普','表现与印刷','ppt169_sugar_rush_memphis',3,'撞色块、粗轮廓、几何碎片与活泼节奏。','活动、音乐、年轻品牌、创意提案','几何装饰可用原生形状实现；复杂插画不保证逐笔可编辑。'),
('zine','独立刊物','表现与印刷','ppt169_indie_bookstore_zine_guide',5,'限色印刷、错位套色、网点与手工刊物质感。','独立出版、艺术活动、文化介绍','精细印刷肌理可能由图片承担，不能把纹理视为可编辑文字。'),
('vintage-poster','复古海报','表现与印刷','ppt169_tokaido_shinkansen_60_ja',3,'复古几何、平面色块、海报式标题和年代感。','历史回顾、文化旅游、纪念主题','文字、色块与主视觉可以分层；素材的编辑边界取决于其载体。'),
('paper-cut','层叠剪纸','表现与印刷','ppt169_mid_autumn_papercut',4,'纸张叠层、柔和投影、前后景与触感。','节庆、童趣科普、文化故事','立体感来自图层和阴影，不是可旋转的 3D 场景。'),
('sketch-notes','手绘手账','手绘与笔触','story_autumn_solar_terms',3,'暖纸背景、涂鸦线条、柔和彩色块与手账节奏。','学习笔记、生活主题、轻量解释','部分手写题字或插画可能是图片；正文可以另设原生文字。'),
('ink-notes','墨线笔记','手绘与笔触','a4_tea_six_classes',1,'浅底、黑色手绘墨线和少量语义强调色。','方法说明、概念分类、流程解释','原生文字可搭配墨线图形；复杂笔触不一定能够逐笔修改。'),
('chalkboard','黑板粉笔','手绘与笔触','ppt43_wave_interference_diffraction',3,'深色板面、粉笔线条、教学标注与柔和彩粉。','课堂讲义、物理推导、知识讲解','公式可走 Office Math；粉笔纹理的承载方式需与正文区分。'),
('ink-wash','水墨留白','手绘与笔触','xiaohongshu_song_diancha',2,'宣纸留白、水墨或水彩、印章点缀和安静节奏。','茶文化、东方美学、人文专题','水墨画面通常需要素材；正文可编辑不等于墨迹可拆解。'),
('pixel-art','像素艺术','像素与游戏','ppt169_pixel_breakfast_atlas',3,'严格像素格、块状造型、有限色阶与游戏界面感。','游戏化讲解、轻松科普、文化图鉴','可混合像素素材、原生文字与形状；不是游戏引擎或实时交互场景。'),
]

def main():
    catalog=json.loads(subprocess.check_output(['git','-C',str(REPO/'upstream/ppt-master-examples'),'show',f'{COMMIT}:examples/examples.json'],encoding='utf-8'))
    projects={p['id']:p for p in catalog['projects']}
    records=[]
    tasks=[]
    for sid,name,category,pid,body,traits,uses,boundary in STYLES:
        example=projects[pid]
        rec=dict(id=sid,name=name,category=category,traits=traits,uses=uses,boundary=boundary,
                 project=pid,projectTitle=example['title'],upstreamStyleName=example['styleName'],
                 viewer=f'https://hugohe3.github.io/ppt-master-examples/viewer.html?project={pid}',
                 specification=f'https://github.com/hugohe3/ppt-master/blob/{CORE_COMMIT}/skills/ppt-master/references/visual-styles/{sid}.md',
                 pptx=f'https://github.com/hugohe3/ppt-master-examples/blob/{COMMIT}/'+example['pptx'],slides=[])
        for i,slide in enumerate([example['slides'][0],example['slides'][body]]):
            src=f"examples/{example['folder']}/{slide['file']}"
            url=f'https://raw.githubusercontent.com/hugohe3/ppt-master-examples/{COMMIT}/'+quote(src,safe='/')
            local=CACHE/sid/f'{i+1}.svg'
            item={'label':'封面' if i==0 else '内容页','filename':slide['file'],'caption':slide.get('desc',''),
                  'preview':f'style-previews/{sid}-{i+1}.jpg',
                  'source':f'https://github.com/hugohe3/ppt-master-examples/blob/{COMMIT}/'+quote(src,safe='/'),
                  'raw':url,'sourcePath':src}
            rec['slides'].append(item)
            tasks.append((item,local))
        records.append(rec)
    def fetch(task):
        item,local=task
        local.parent.mkdir(parents=True,exist_ok=True)
        if not local.exists():
            with urlopen(Request(item['raw'],headers={'User-Agent':'PPT-Master-Research-Gallery'}),timeout=90) as res:
                local.write_bytes(res.read())
        raw=local.read_bytes()
        root=ET.fromstring(raw)
        refs=[v for e in root.iter() for k,v in e.attrib.items() if k in ('href','{http://www.w3.org/1999/xlink}href') and not v.startswith(('data:','#'))]
        # Fetch relative dependencies into the ignored cache, preserving source bytes.
        for ref in set(refs):
            if '://' in ref or ref.startswith('/'):
                raise ValueError(f'Unexpected external asset in {item["sourcePath"]}: {ref}')
            dest=(local.parent/ref).resolve()
            if not dest.is_relative_to(CACHE.resolve()):
                raise ValueError('Asset outside cache')
            dest.parent.mkdir(parents=True,exist_ok=True)
            with urlopen(urljoin(item['raw'],ref),timeout=90) as res:
                dest.write_bytes(res.read())
        item['sha256']=hashlib.sha256(raw).hexdigest()
        item['viewBox']=root.get('viewBox')
        item['imageElements']=sum(e.tag.endswith('}image') for e in root.iter())
        return f'{local.parent.name}/{local.name}: {len(raw)} bytes'
    with ThreadPoolExecutor(max_workers=6) as pool:
        for result in pool.map(fetch,tasks): print(result,flush=True)
    data={'sourceRepository':'https://github.com/hugohe3/ppt-master-examples','sourceCommit':COMMIT,'coreCommit':CORE_COMMIT,
          'previewMethod':'Pinned upstream SVG rendered in local Microsoft Edge; not newly generated decks or PowerPoint render verification.',
          'attribution':'Official examples by Hugo He and contributors. MIT repository license; original slide credits remain visible. Referenced trademarks and source materials belong to their respective owners.',
          'styles':records}
    (PROJECT/'app/style-catalog.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (PROJECT/'app/style-catalog.js').write_text('window.PPT_STYLE_CATALOG = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
    print(f'Collected {len(records)} styles and {len(tasks)} source pages.')

if __name__=='__main__': main()
