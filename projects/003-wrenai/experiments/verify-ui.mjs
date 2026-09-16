import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
const app=resolve(root,'app');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.css':'text/css','.wasm':'application/wasm','.png':'image/png'};
const server=createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);
    const target=resolve(app,'.'+(pathname==='/'?'/index.html':pathname));
    if(!target.startsWith(app+sep)){res.writeHead(403).end();return;}
    const buffer=await readFile(target);res.writeHead(200,{'Content-Type':types[extname(target)]||'application/octet-stream'});res.end(buffer);
  }catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  // Serve the exact installed npm package for deterministic browser testing.
  // This tests real WASM execution, but does not test public CDN availability.
  await context.route('https://unpkg.com/@wrenai/wren-core-wasm@0.4.1/dist/**',async route=>{
    const name=new URL(route.request().url()).pathname.split('/').pop();
    await route.fulfill({path:resolve(root,'node_modules/@wrenai/wren-core-wasm/dist',name),contentType:types[extname(name)]||'application/octet-stream',headers:{'Access-Control-Allow-Origin':'*'}});
  });
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(url);await page.waitForFunction(()=>document.getElementById('total').textContent.includes('47,250'));
  for(const value of ['sales','operations','inventory','exploration','transactions','prediction']){
    await page.selectOption('#business-scenario',value);
    for(const id of ['scenario-title','scenario-input','scenario-prepare','scenario-output','scenario-check']){
      const text=await page.locator(`#${id}`).textContent();assert.ok(text.trim().length>0 && !text.includes('undefined'),`${value}: ${id}`);
    }
  }
  await page.selectOption('#business-scenario','transactions');
  assert.equal(await page.locator('#scenario-grade').textContent(),'需要额外业务系统');
  await page.selectOption('#business-scenario','sales');
  await page.locator('#understanding').screenshot({path:resolve(root,'assets/understanding.png')});
  await page.locator('#reliability').screenshot({path:resolve(root,'assets/reliability.png')});
  await page.locator('#summary-image').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>{const img=document.getElementById('summary-image');return img.complete&&img.naturalWidth>=2000;});
  const imageLink=page.locator('#summary a[download]');
  const imageEvent=page.waitForEvent('download');await imageLink.click();const imageDownload=await imageEvent;
  assert.equal(imageDownload.suggestedFilename(),'WrenAI-原理与场景总览.png');
  results.push({test:'six business scenarios, reliability content, summary image loads and downloads',passed:true});
  for (const [mode,count] of [['system',8],['experiment',5]]) {
    await page.click(`[data-arch-mode="${mode}"]`);
    assert.equal(await page.locator('.arch-node').count(),count);
    assert.equal(await page.locator('#arch-prev').isDisabled(),true);
    for(let i=0;i<count;i++){
      await page.locator('.arch-node').nth(i).click();
      assert.ok((await page.locator('#arch-progress').textContent()).startsWith(`${i+1} / ${count}`));
      assert.equal(await page.locator('.arch-node[aria-pressed="true"]').count(),1);
      for(const id of ['arch-input','arch-output','arch-why'])assert.ok((await page.locator(`#${id}`).textContent()).length>10);
    }
    assert.equal(await page.locator('#arch-next').isDisabled(),true);
    await page.click('#arch-prev');await page.click('#arch-next');
  }
  await page.click('[data-arch-mode="system"]');await page.locator('.arch-node').nth(4).click();
  assert.match(await page.locator('#arch-output-code').textContent(),/SUM\(o.paid_amount - o.refund_amount\)/);
  await page.locator('#architecture').screenshot({path:resolve(root,'assets/architecture.png')});
  await page.locator('.arch-node').first().click();
  results.push({test:'architecture 8 system and 5 experiment stages, navigation and SQL expansion example',passed:true});
  const snapshots=JSON.parse(await readFile(resolve(app,'verified-results.json'),'utf8')).snapshots;
  for(const record of Object.values(snapshots)){
    await page.locator(`[data-case="${record.params.scenario}"]`).click();
    for(const name of ['month','region','metric'])await page.selectOption(`#${name}`,record.params[name]);
    const total=record.rows.reduce((s,r)=>s+r.revenue,0).toLocaleString('zh-CN');
    assert.equal(await page.locator('#total').textContent(),`¥ ${total}`);
    assert.equal(await page.locator('#rows tr').count(),record.rows.length);
  }
  results.push({test:'36 snapshot control combinations',passed:true});
  await page.locator('[data-case="region"]').click();
  await page.selectOption('#month','2026-08');await page.selectOption('#region','全部');await page.selectOption('#metric','net');
  const downloadEvent=page.waitForEvent('download');await page.click('#download');const download=await downloadEvent;
  assert.match(download.suggestedFilename(),/wren-region-2026-08-net.csv/);
  const stream=await download.createReadStream();let csv='';for await(const chunk of stream)csv+=chunk.toString('utf8');
  assert.ok(csv.includes('华东')&&csv.includes('12350'));
  results.push({test:'CSV export contains current result',passed:true});
  await page.click('#start-engine');await page.waitForFunction(()=>document.getElementById('mode-badge').textContent==='真实引擎运行',null,{timeout:60000});
  assert.equal(await page.locator('#total').textContent(),'¥ 47,250');
  await page.selectOption('#metric','gross');await page.waitForFunction(()=>document.getElementById('total').textContent==='¥ 50,500');
  await page.selectOption('#metric','net');await page.waitForFunction(()=>document.getElementById('total').textContent==='¥ 47,250');
  results.push({test:'real browser WASM net/gross MDL switch',passed:true});
  await page.locator('#lab').scrollIntoViewIfNeeded();
  await page.evaluate(()=>document.getElementById('lab').scrollIntoView({behavior:'instant',block:'start'}));
  await page.screenshot({path:resolve(root,'assets/overview.png')});
  await page.screenshot({path:resolve(root,'assets/desktop-full.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.goto(url);await page.waitForFunction(()=>document.getElementById('total').textContent.includes('47,250'));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.selectOption('#business-scenario','prediction');
  assert.match(await page.locator('#scenario-check').textContent(),/因果/);
  await page.locator('#summary-image').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.getElementById('summary-image').naturalWidth>=2000);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.selectOption('#business-scenario','sales');
  results.push({test:'mobile scenario switch and summary image fit viewport',passed:true});
  await page.locator('.arch-node').nth(4).click();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('#arch-detail').screenshot({path:resolve(root,'assets/architecture-mobile.png')});
  await page.click('[data-arch-mode="experiment"]');
  assert.equal(await page.locator('.arch-foundation').isVisible(),false);
  assert.equal(await page.locator('.arch-loops').isVisible(),false);
  await page.click('[data-arch-mode="system"]');
  results.push({test:'architecture mobile layout and route-specific visibility',passed:true});
  await page.locator('[data-case="customer"]').click();await page.selectOption('#region','华东');
  assert.equal(await page.locator('#rows tr').count(),2);
  await page.screenshot({path:resolve(root,'assets/mobile-full.png'),fullPage:true});
  results.push({test:'390px layout and mobile controls',passed:true});
  const failure=await browser.newPage();
  await failure.route('https://unpkg.com/**',route=>route.abort());
  await failure.goto(url);await failure.waitForFunction(()=>document.getElementById('total').textContent.includes('47,250'));await failure.click('#start-engine');
  await failure.waitForFunction(()=>document.getElementById('status').textContent.startsWith('加载失败'));
  assert.equal(await failure.locator('#total').textContent(),'¥ 47,250');
  assert.equal(await failure.locator('#mode-badge').textContent(),'实测结果回放');
  results.push({test:'CDN failure clearly retains snapshot mode',passed:true});
  assert.deepEqual(errors,[]);
  results.push({test:'no browser page errors',passed:true});
  const report={verified_at:new Date().toISOString(),browser:await browser.version(),desktop:[1440,1000],mobile:[390,844],engine_asset_delivery:'Playwright route serves exact installed npm package, not CDN availability verification',results};
  await mkdir(resolve(root,'notes'),{recursive:true});await writeFile(resolve(root,'notes/ui-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await browser.close();server.close();}
