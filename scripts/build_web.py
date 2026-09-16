"""Build the complete static research site from registered projects, using stdlib."""
from html import escape
from html.parser import HTMLParser
import json
from pathlib import Path
import shutil
from urllib.parse import unquote, urlsplit
from projects import ROOT, read_projects, project_path, repository_name

WEB = ROOT / 'web'
REPOSITORY = 'https://github.com/yydshly/0916_codex_project'
PUBLIC_SUFFIXES = {'.html', '.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif', '.ico', '.pptx', '.pdf', '.woff', '.woff2', '.txt', '.mp3', '.mp4', '.vtt'}


def copy_public(source, destination):
    for file in source.rglob('*'):
        relative = file.relative_to(source)
        if any(part.startswith('.') for part in relative.parts):
            continue
        if file.is_symlink():
            raise ValueError(f'Symlinks are not published: {file}')
        if file.is_file() and file.suffix.lower() in PUBLIC_SUFFIXES:
            target = destination / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(file, target)


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ('src', 'href') and value:
                self.links.append(value)


def check_links():
    for file in WEB.rglob('*.html'):
        parser = Links()
        parser.feed(file.read_text(encoding='utf-8'))
        for link in parser.links:
            parsed = urlsplit(link)
            if parsed.scheme or parsed.netloc or not parsed.path:
                continue
            if parsed.path.startswith('/'):
                raise ValueError(f'Root-relative link breaks project hosting: {file}: {link}')
            target = (file.parent / unquote(parsed.path)).resolve()
            if not target.is_relative_to(WEB.resolve()) or not target.exists():
                raise ValueError(f'Missing/outside published asset: {file}: {link}')


def main():
    projects = read_projects()
    WEB.mkdir(exist_ok=True)
    cards = []
    published = []
    for project in projects:
        directory = ROOT / project_path(project)
        slug = directory.name
        source = directory / 'app'
        demo = ''
        if (source / 'index.html').is_file():
            copy_public(source, WEB / slug)
            config_file = source / 'site.json'
            config = json.loads(config_file.read_text(encoding='utf-8')) if config_file.exists() else {}
            entry = config.get('entry', 'index.html')
            target = (source / entry).resolve()
            if not target.is_relative_to(source.resolve()) or not target.is_file():
                raise ValueError(f'Invalid site entry: {entry}')
            demo = f'<a class="primary" href="{escape(slug + "/" + entry, quote=True)}">{escape(config.get("label", "查看演示"))} ↗</a>'
            published.append(slug)
            notices = directory / 'THIRD_PARTY_NOTICES.md'
            if notices.is_file():
                shutil.copy2(notices, WEB / slug / notices.name)
            licenses = directory / 'LICENSES'
            if licenses.is_dir():
                copy_public(licenses, WEB / slug / 'LICENSES')
        cover = ''
        if project['cover']:
            source_image = ROOT / project['cover']
            output_image = WEB / 'assets' / f'{slug}{source_image.suffix}'
            output_image.parent.mkdir(exist_ok=True)
            shutil.copy2(source_image, output_image)
            cover = f'<img src="assets/{escape(output_image.name)}" alt="{escape(project["cover_alt"], quote=True)}">'
        research = f'{REPOSITORY}/tree/main/{project_path(project)}'
        cards.append(f'<article>{cover}<div class="copy"><div class="meta">{project["id"]:03d} / {escape(project["status"])}</div><h2>{escape(project["name"])}</h2><p>{escape(project["summary"])}</p><div class="links">{demo}<a href="{research}">研究记录 ↗</a><a href="{escape(project["repo"], quote=True)}">{escape(repository_name(project["repo"]))} ↗</a></div></div></article>')
    html = '''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="开源项目研究：能力摘要、真实效果、源码分析与可访问演示。"><title>开源项目研究 · 演示入口</title><style>
    *{box-sizing:border-box}body{margin:0;background:#fafbf8;color:#142c35;font:15px/1.8 "Segoe UI","Microsoft YaHei",sans-serif}main{max-width:1180px;margin:auto;padding:55px 32px}header{border-bottom:1px solid #dce3df;padding-bottom:28px;margin-bottom:35px}.eyebrow{font-size:11px;letter-spacing:2px;color:#007f73}h1{font-size:37px;line-height:1.3;margin:14px 0}header p{color:#627478}a{color:#007f73;text-decoration:none}a:hover{text-decoration:underline}a:focus-visible{outline:3px solid #007f73;outline-offset:4px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:28px}article{border:1px solid #dce3df;border-radius:9px;overflow:hidden;background:white}article>img{display:block;width:100%;aspect-ratio:16/10;object-fit:contain;background:#edf2ec}.copy{padding:25px}.meta{font-size:11px;letter-spacing:1px;color:#627478}h2{font-size:23px;margin:10px 0}article p{font-size:13px;color:#627478}.links{display:flex;align-items:center;gap:20px;flex-wrap:wrap;font-size:12px;margin-top:23px}.primary{background:#007f73;color:white;padding:9px 14px;border-radius:4px}footer{border-top:1px solid #dce3df;margin-top:40px;padding-top:22px;font-size:12px;color:#627478}@media(max-width:740px){main{padding:30px 18px}.grid{grid-template-columns:1fr}h1{font-size:30px}.copy{padding:20px}}
    </style></head><body><main><header><div class="eyebrow">OPEN SOURCE / RESEARCH & DEMOS</div><h1>从源码理解能力，用实际效果判断价值。</h1><p>每个项目保留摘要、来源与验证边界；有可运行演示的项目提供直接入口。</p></header><div class="grid">'''
    html += ''.join(cards)
    html += f'</div><footer><a href="{REPOSITORY}">研究总仓库 ↗</a> · 索引来自 projects.json · 官方案例与本地实验在各项目内分别说明。</footer></main></body></html>\n'
    (WEB / 'index.html').write_text(html, encoding='utf-8')
    (WEB / '.nojekyll').write_text('', encoding='utf-8')
    check_links()
    print(f'Built {len(projects)} registry entries and {len(published)} demos: {", ".join(published)}')


if __name__ == '__main__':
    main()
