import { chromium } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const base=process.argv[2];
assert.ok(base?.startsWith('https://yydshly.github.io/0916_codex_project/003-wrenai/'));
const root=new URL('../',import.meta.url);
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage(), errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  const response=await page.goto(base,{waitUntil:'networkidle'});
  assert.equal(response.status(),200);
  await page.waitForFunction(()=>document.getElementById('total')?.textContent.includes('47,250'));
  const resources=[];
  for(const path of ['index.html','styles.css','understanding.css','architecture.css','app.js','understanding.js','architecture.js','lab.js','verified-results.json','media/wrenai-summary.png']) {
    const r=await context.request.get(new URL(path,base).href);
    assert.equal(r.status(),200,path);
    const canonical=b=>path.endsWith('.png')?b:b.toString('utf8').replace(/\r\n/g,'\n');
    const actual=createHash('sha256').update(canonical(await r.body())).digest('hex');
    const expected=createHash('sha256').update(canonical(await readFile(new URL('app/'+path,root)))).digest('hex');
    assert.equal(actual,expected,`${path}: deployed content differs from source`);
    resources.push({path,status:r.status(),sha256:actual,normalization:path.endsWith('.png')?'raw bytes':'LF line endings'});
  }
  const broken=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href')).filter(h=>h.length>1&&!document.getElementById(h.slice(1))));
  assert.deepEqual(broken,[]);
  await page.locator('#quickstart').screenshot({path:fileURLToPath(new URL('assets/published-summary.png',root))});
  await page.locator('.product-comparison summary').click();
  await page.locator('#alternatives').screenshot({path:fileURLToPath(new URL('assets/published-alternatives.png',root))});
  await page.locator('#summary-image').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.getElementById('summary-image').naturalWidth===3600);
  await page.setViewportSize({width:390,height:844});
  await page.goto(base+'#quickstart',{waitUntil:'networkidle'});
  await page.locator('.product-comparison summary').click();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('#quickstart').screenshot({path:fileURLToPath(new URL('assets/published-mobile-summary.png',root))});
  await page.selectOption('#business-scenario','inventory');
  assert.match(await page.locator('#scenario-title').textContent(),/库存/);
  await page.locator('.arch-node').nth(4).click();
  assert.match(await page.locator('#arch-output-code').textContent(),/SUM/);
  await page.goto(base+'#architecture',{waitUntil:'networkidle'}); await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.locator('.arch-node').count(),8);
  assert.deepEqual(errors,[]);
  const siteRoot=new URL('../',base).href;
  const homepage=await context.request.get(siteRoot);
  assert.equal(homepage.status(),200);
  const homeHtml=await homepage.text();
  assert.ok(homeHtml.includes('003-wrenai/') && homeHtml.includes('001-ppt-master/'));
  const previousDemo=await context.request.get(siteRoot+'001-ppt-master/styles.html');
  assert.equal(previousDemo.status(),200);
  const report={verified_at:new Date().toISOString(),url:base,browser:await browser.version(),resources,
    checks:['HTTPS page and 10 assets match local source SHA-256','summary image loads at 3600px width','all fragment links resolve','summary and expanded alternatives captured','390px layout including expanded comparison has no page overflow','scenario and architecture controls work','direct fragment URL and reload work','no page errors','site index includes WrenAI and existing PPT Master demo still returns HTTP 200'],
    scope:'Published static research site and snapshot mode; live CDN WASM loading, LLM, RAG and production database are not verified here.'};
  await writeFile(new URL('notes/deployment-verification.json',root),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
} finally {await browser.close();}
