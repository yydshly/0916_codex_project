// Usage: node scripts/check_site.cjs <site-root-url> [report-path]
// Requires Playwright and Microsoft Edge. No credentials are needed.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {createHash}=require('node:crypto');
const project=path.resolve(__dirname,'..');
const base=(process.argv[2]||'http://127.0.0.1:8766/').replace(/\/?$/,'/');
const reportPath=process.argv[3];
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 const url=relative=>new URL(relative,base).href;
 assert.equal((await page.goto(base,{waitUntil:'networkidle'})).status(),200);
 assert.equal(await page.locator('article').count(),2);
 await page.locator('a.primary').click();
 await page.locator('.style-card').nth(17).waitFor();
 assert.equal(new URL(page.url()).pathname,new URL(url('001-ppt-master/styles.html')).pathname);
 assert.equal(await page.locator('.style-card').count(),18);
 await page.locator('[data-category="手绘与笔触"]').click();
 assert.equal(await page.locator('.style-card').count(),4);
 await page.locator('[data-style="ink-wash"]').click();
 await page.locator('[data-page="1"]').click();
 await page.locator('#detail-image').evaluate(img=>img.decode());
 await page.keyboard.press('Escape');
 await page.goto(url('001-ppt-master/styles.html?style=pixel-art'));
 assert.equal(await page.locator('#style-dialog').evaluate(d=>d.open),true);
 await page.locator('#detail-image').evaluate(img=>img.decode());
 await page.reload();assert.equal(await page.locator('#style-dialog').evaluate(d=>d.open),true);
 await page.keyboard.press('Escape');
 for(const width of [390,768,1440]){
  await page.setViewportSize({width,height:1000});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 const catalog=JSON.parse(await fs.readFile(path.join(project,'app/style-catalog.json'),'utf8'));
 let imageCount=0;
 for(const style of catalog.styles)for(const slide of style.slides){
  const response=await page.request.get(url('001-ppt-master/'+slide.preview));
  assert.equal(response.status(),200,slide.preview);
  assert.ok((await response.body()).equals(await fs.readFile(path.join(project,'app',slide.preview))),`Preview differs: ${slide.preview}`);
  imageCount++;
 }
 await page.goto(url('001-ppt-master/overview.html'));
 await page.locator('.overview-card img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
 assert.equal(await page.locator('.overview-card').count(),18);
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:1000});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 await page.goto(url('001-ppt-master/'));
 await page.locator('.thumbnail').nth(2).click();
 assert.match(await page.locator('#object-counts').innerText(),/原生图表/);
 await page.locator('#slide-image').evaluate(img=>img.decode());
 await page.locator('[data-variant="editable-shapes"]').click();
 await page.locator('#slide-image').evaluate(img=>img.decode());
 const downloads=[];
 for(const filename of ['native-data.pptx','editable-shapes.pptx']){
  const response=await page.request.get(url('001-ppt-master/downloads/'+filename));assert.equal(response.status(),200);
  const data=await response.body();const local=await fs.readFile(path.join(project,'app/downloads',filename));assert.ok(data.equals(local));
  downloads.push({filename,sha256:createHash('sha256').update(data).digest('hex'),bytes:data.length});
 }
 for(const file of ['style-catalog.js','style-gallery.js','style-gallery.css','THIRD_PARTY_NOTICES.md','LICENSES/ppt-master-examples-MIT.txt']){
  assert.equal((await page.request.get(url('001-ppt-master/'+file))).status(),200,file);
 }
 assert.deepEqual(errors,[]);
 const report={verifiedAt:new Date().toISOString(),baseUrl:base,browser:await browser.version(),result:'passed',stylePreviewImages:imageCount,downloads,checks:['site index links to style gallery','category filtering and content-page preview','deep-link refresh opens selected style','mobile layout without horizontal overflow','18-style overview loads all images','36 hosted preview files match local bytes','native vs shapes preview switches','2 hosted PPT files match local SHA256','licenses and attribution available','no JavaScript errors']};
 if(reportPath)await fs.writeFile(reportPath,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
