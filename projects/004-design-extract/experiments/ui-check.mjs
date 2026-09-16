// Browser verification for the original research webpage, not upstream extraction.
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url));
const project=resolve(here,'..');
const root=resolve(project,'../..');
const {launchChromium}=await import(pathToFileURL(join(root,'upstream/design-extract/src/browser.js')).href);
const base=process.argv[2]||'http://127.0.0.1:8767/004-design-extract/';
const browser=await launchChromium({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const errors=[],badResponses=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.status()>=400)badResponses.push({url:r.url(),status:r.status()});});
function record(name){checks.push({name,passed:true});}
try{
  await page.goto(base,{waitUntil:'networkidle'});
  assert.equal(await page.title(),'Design Extract · 从网页到设计规则');record('title and main route');
  for(let i=0;i<6;i++){
    await page.locator(`[data-cap="${i}"]`).click();
    assert.equal(await page.locator(`[data-cap="${i}"]`).getAttribute('aria-selected'),'true');
    assert.equal(await page.locator('#cap-panel').getAttribute('aria-labelledby'),`cap-tab-${i}`);
    assert.ok((await page.locator('#cap-proof').textContent()).length>20);
  }record('six capability panels');
  await page.locator('[data-cap="0"]').click();
  await page.locator('[data-cap="0"]').focus();await page.keyboard.press('ArrowDown');
  assert.equal(await page.locator('[data-cap="1"]').getAttribute('aria-selected'),'true');
  await page.keyboard.press('Home');assert.equal(await page.locator('[data-cap="0"]').getAttribute('aria-selected'),'true');record('keyboard tab navigation');
  for(let i=0;i<5;i++){
    await page.locator(`[data-step="${i}"]`).click();
    assert.ok((await page.locator('#step-source').getAttribute('href')).includes('47f75bb68cd6fcb51c172868a3a1b814cd6bdeb4'));
    assert.ok((await page.locator('#step-code').textContent()).length>20);
  }record('five principle steps and pinned source links');
  for(const mode of ['light','dark','mobile']){
    await page.locator(`[data-mode="${mode}"]`).click();
    await page.locator('#specimen-image').evaluate(img=>img.decode());
    assert.ok(await page.locator('#specimen-image').evaluate(img=>img.complete&&img.naturalWidth>0));
    assert.ok((await page.locator('#specimen-link').getAttribute('href')).includes(`fixture-${mode}.png`));
  }record('three real specimen images');
  for(const format of ['css','tokens','doc']){
    await page.locator(`[data-output="${format}"]`).click();
    assert.ok((await page.locator('#output-code').textContent()).includes('#2563eb'));
  }record('three actual output excerpts');
  const tokens=JSON.parse(await readFile(join(project,'app/data/tokens.json'),'utf8'));
  assert.equal(tokens.primitive.color.brand.primary.$value,'#2563eb');
  const verification=JSON.parse(await readFile(join(project,'app/data/verification.json'),'utf8'));
  assert.equal(verification.passed,17);assert.equal(verification.fidelityChecks.filter(x=>!x.pass).length,4);assert.equal(verification.emitters.length,30);
  record('published figures match retained research data');
  for(let i=0;i<4;i++){
    const details=page.locator('.limitations details').nth(i);
    if(!await details.evaluate(el=>el.open))await details.locator('summary').click();
    assert.ok(await details.evaluate(el=>el.open));
    assert.ok(await details.locator('.issue-body').isVisible());
  }record('four expandable limitations');
  const downloads=await page.locator('a[download]').evaluateAll(els=>els.map(a=>a.href));
  for(const url of downloads){const r=await page.request.get(url);assert.equal(r.status(),200);assert.ok((await r.body()).length>100);}
  record('download resources accessible');
  await page.locator('[data-step="0"]').click();await page.locator('[data-mode="light"]').click();await page.locator('[data-output="css"]').click();
  await page.locator('.limitations details').evaluateAll(els=>els.forEach((el,i)=>el.open=i===0));
  const shots=join(root,'.local/design-extract/ui');await mkdir(shots,{recursive:true});
  for(const width of [1440,768,375]){
    await page.setViewportSize({width,height:1000});
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await page.waitForTimeout(150);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`horizontal overflow at ${width}`);
    assert.equal(await page.locator('h1').count(),1);
    await page.screenshot({path:join(shots,`${width}-full.png`),fullPage:true});
    await page.screenshot({path:join(shots,`${width}-top.png`)});
    record(`layout without horizontal overflow at ${width}px`);
  }
  await page.setViewportSize({width:375,height:812});
  await page.locator('.sidebar a[href="#limits"]').click();await page.waitForTimeout(650);
  assert.ok((await page.locator('#limits').boundingBox()).y>=75);record('mobile sticky navigation does not obscure heading');
  await page.goto(base+'#principle',{waitUntil:'networkidle'});await page.reload({waitUntil:'networkidle'});
  assert.ok(await page.locator('#principle').isVisible());record('direct section link reload');
  // 200% browser zoom is approximated by a 720 CSS-pixel viewport for 1440px display.
  await page.setViewportSize({width:720,height:500});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));record('narrow layout equivalent to desktop 200% zoom');
  assert.deepEqual(errors,[]);assert.deepEqual(badResponses,[]);record('no page errors or HTTP failures');
  const report={date:new Date().toISOString(),url:base,browser:browser.version(),checks,passed:checks.length,pageErrors:errors,httpFailures:badResponses,screenshotDirectory:'.local/design-extract/ui',scope:'Original static research webpage; this is not a retest of upstream extraction.'};
  await writeFile(join(project,base.startsWith('https://')?'notes/ui-online-verification.json':'notes/ui-verification.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
