"""Validate saved native documents and real image artifacts; standard library only."""
import hashlib
import json
from pathlib import Path
import struct

ROOT = Path(__file__).resolve().parents[1]

def load(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))

def walk(nodes):
    for node in nodes:
        yield node
        yield from walk(node.get('children', []))

doc = load(ROOT / 'examples/openpencil-demo.op')
pages = doc['pages']
assert len(pages) == 2
counts = [len(list(walk(page.get('children', [])))) for page in pages]
assert counts == [351, 92], counts
dashboard = pages[1]['children'][0]
assert (dashboard['width'], dashboard['height']) == (1320, 840)
title = next(n for n in walk([dashboard]) if n.get('name') == '主标题')
assert title['content'] == '从一个问题，到一份可验证的答案。'
saved_title = load(ROOT / 'notes/read-saved-title.json')['nodes'][0]
assert saved_title['content'] == title['content']
assert load(ROOT / 'notes/update-title-result.json')['wrote'] == 'true'
images = {}
for path in sorted((ROOT / 'assets').glob('*.png')):
    raw = path.read_bytes()
    assert raw[:8] == b'\x89PNG\r\n\x1a\n'
    width, height = struct.unpack('>II', raw[16:24])
    images[path.name] = dict(width=width, height=height, bytes=len(raw), sha256=hashlib.sha256(raw).hexdigest())
assert (images['agent-dashboard.png']['width'], images['agent-dashboard.png']['height']) == (1320, 840)
assert (images['official-template-metrics.png']['width'], images['official-template-metrics.png']['height']) == (1920, 1080)
assert images['agent-dashboard-before.png']['sha256'] != images['agent-dashboard.png']['sha256']
screenshots = {}
for name in ('agent-dashboard-editor.jpg', 'official-template-editor.jpg'):
    raw = (ROOT / 'assets' / name).read_bytes()
    assert raw[:3] == b'\xff\xd8\xff'
    screenshots[name] = dict(bytes=len(raw), sha256=hashlib.sha256(raw).hexdigest())
report = dict(version='v0.8.4', platform='Windows x64', page_count=len(pages),
              node_counts=counts, total_nodes=sum(counts), saved_title_verified=True,
              title_before_after_images_differ=True, images=images, screenshots=screenshots,
              lint_count=load(ROOT / 'notes/dashboard-lint.json')['count'],
              scope='External agent drives upstream native editor via CLI/MCP; no built-in LLM configured.')
(ROOT / 'notes/verification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(f'PASS: {len(pages)} pages, {sum(counts)} nodes, saved title, {len(images)} PNGs, {len(screenshots)} screenshots.')
