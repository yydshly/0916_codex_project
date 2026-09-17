"""读取公开目录分页；原始响应写入 Git 忽略的 upstream，不发布账号字段。"""
import concurrent.futures
import datetime
import json
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'upstream/prompts-chat-wide'
BASE = 'https://prompts.chat/api/prompts?perPage=100&sort=oldest&page='


def fetch(page):
    for attempt in range(3):
        try:
            request = urllib.request.Request(BASE + str(page), headers={'User-Agent':'prompts-chat-research/1.0'})
            with urllib.request.urlopen(request, timeout=60) as response:
                data = json.load(response)
            (OUT/f'page-{page:03}.json').write_text(json.dumps(data,ensure_ascii=False),encoding='utf-8')
            return data
        except Exception:
            if attempt == 2:
                raise
            time.sleep(2)


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    first = fetch(1)
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        pages = [first] + list(pool.map(fetch,range(2,first['totalPages']+1)))
    records = [p for page in pages for p in page['prompts']]
    meta = {'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'api':BASE,'total':first['total'],'pageTotals':sorted({p['total'] for p in pages}),'pages':len(pages),'fetched':len(records),'unique':len({p['id'] for p in records})}
    if meta['pageTotals'] != [meta['total']] or meta['unique'] != meta['total'] or meta['fetched'] != meta['total']:
        raise RuntimeError('分页期间目录发生变化或存在重复/遗漏，不能生成完整快照。请重新采集。')
    (OUT/'snapshot.json').write_text(json.dumps({'meta':meta,'prompts':records},ensure_ascii=False),encoding='utf-8')
    print(json.dumps(meta,ensure_ascii=False))
