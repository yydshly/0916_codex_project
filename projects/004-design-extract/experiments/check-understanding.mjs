// Verify the original discussion guide; does not retest upstream extraction.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const project=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const root=resolve(project,'../..');
const {launchChromium}=await import(pathToFileURL(join(root,'upstream/design-extract/src/browser.js')).href);
const browser=await launchChromium({headless:true});
const base=process.argv[2]||'http://127.0.0.1:8767/004-design-extract/';
const renderOnly=process.argv.includes('--render-only');
const online=base.startsWith('https://');
const checks=[],errors=[],failures=[];
const shots=join(root,'.local/design-extract/understanding');
await mkdir(shots,{recursive:true});
const page=await browser.newPage({viewport:{width:1600,height:1720},deviceScaleFactor:1});
function pass(name){checks.push({name,passed:true});}
try{
  if(!online){
    await page.goto(pathToFileURL(join(project,'assets/understanding-guide.svg')).href);
    await page.evaluate(()=>document.fonts.ready);
    const overflow=await page.locator('svg text').evaluateAll(elements=>elements.map(e=>({text:e.textContent,b:e.getBBox()})).filter(({b})=>b.x<0||b.y<0||b.x+b.width>1560||b.y+b.height>1720).map(({text})=>text));
    assert.deepEqual(overflow,[],'SVG text outside guide bounds');
    await page.locator('svg').screenshot({path:join(project,'assets/understanding-guide.png')});
    await copyFile(join(project,'assets/understanding-guide.png'),join(project,'app/media/understanding-guide.png'));
    pass('SVG guide text inside canvas and PNG rendered');
  }
  if(!renderOnly){
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400)failures.push({url:r.url(),status:r.status()});});
    await page.setViewportSize({width:1440,height:1000});
    await page.goto(base+'understanding.html',{waitUntil:'networkidle'});
    assert.equal(await page.title(),'Design Extract · 我们的理解与参考价值');
    pass('summary page loads');
    const titles={'single':'先直接用 Codex。','brand':'提取一次，核对后再复用。','batch':'统一采集接口开始有价值。','product':'把它作为候选采集模块。'};
    for(const [key,title] of Object.entries(titles)){
      await page.locator('[data-scenario="'+key+'"]').click();
      assert.equal(await page.locator('#scenario-title').textContent(),title);
      assert.equal(await page.locator('[aria-pressed="true"]').count(),1);
    }
    pass('four scenario recommendations');
    await page.locator('[data-scenario="single"]').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#scenario-title').textContent(),titles.single);
    pass('keyboard scenario activation');
    for(const url of [...new Set(await page.locator('a[download]').evaluateAll(as=>as.map(a=>a.href)))]){
      const response=await page.request.get(url);
      assert.equal(response.status(),200);
      assert.ok((await response.body()).length>500);
    }
    pass('document and both image formats downloadable');
    await page.locator('.guide img').scrollIntoViewIfNeeded();
    await page.locator('.guide img').evaluate(img=>img.decode());
    assert.equal(await page.locator('.guide img').evaluate(img=>img.naturalWidth),1600);
    pass('guide image decoded at expected size');
    for(const width of [1440,768,375]){
      await page.setViewportSize({width,height:1000});
      await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'page overflow at '+width);
      await page.screenshot({path:join(shots,(online?'online-':'')+width+'-full.png'),fullPage:true});
      await page.screenshot({path:join(shots,(online?'online-':'')+width+'-top.png')});
    }
    pass('desktop tablet and mobile without page overflow');
    await page.goto(base+'understanding.html#comparison',{waitUntil:'networkidle'});
    await page.reload({waitUntil:'networkidle'});
    await page.waitForTimeout(300);
    const nav=await page.locator('.top').boundingBox(),heading=await page.locator('#comparison').boundingBox();
    assert.ok(heading.y>=nav.height-1);
    pass('mobile direct anchor reload visible below navigation');
    await page.goto(base,{waitUntil:'networkidle'});
    await page.getByRole('link',{name:'阅读讨论汇总 →'}).click();
    assert.ok(page.url().endsWith('understanding.html'));
    pass('original research page links to summary');
    assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
    pass('no script errors or HTTP failures');
    const data=JSON.parse(await readFile(join(project,'notes/verification.json'),'utf8'));
    assert.equal(data.passed,17);assert.equal(data.fidelityChecks.filter(x=>!x.pass).length,4);
    pass('evidence numbers agree with original experiment');
    const report={date:new Date().toISOString(),url:base+'understanding.html',browser:browser.version(),checks,passed:checks.length,pageErrors:errors,httpFailures:failures,scope:'Original static summary and diagram; proposed cloning workflow was not implemented or evaluated.'};
    await writeFile(join(project,'notes/understanding-'+(online?'online':'local')+'-verification.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify(report,null,2));
  }
}finally{await browser.close();}
