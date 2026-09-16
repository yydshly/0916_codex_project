// Render pinned official SVGs as images: scripts inside SVGs do not execute in <img>.
const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {createHash} = require('node:crypto');
const project = path.resolve(__dirname, '..');
const cache = path.resolve(project, '../../upstream/ppt-style-cache');
(async()=>{
  const catalog=JSON.parse(await fs.readFile(path.join(project,'app/style-catalog.json'),'utf8'));
  await fs.mkdir(path.join(project,'app/style-previews'),{recursive:true});
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({deviceScaleFactor:1});
  const records=[];
  for(const style of catalog.styles){
    for(const [i,slide] of style.slides.entries()){
      const [, ,vw,vh]=slide.viewBox.trim().split(/[\s,]+/).map(Number);
      const scale=Math.min(1200/vw,1100/vh);
      const width=Math.round(vw*scale),height=Math.round(vh*scale);
      const wrapper=path.join(cache,'preview.html');
      await fs.writeFile(wrapper,`<!doctype html><html><meta charset="utf-8"><style>html,body{margin:0;width:100%;height:100%;background:white}img{display:block;width:100%;height:100%;object-fit:contain}</style><img src="${style.id}/${i+1}.svg" alt=""></html>`);
      await page.setViewportSize({width,height});
      await page.goto(pathToFileURL(wrapper).href,{waitUntil:'load'});
      await page.locator('img').evaluate(img=>img.decode());
      await page.evaluate(()=>document.fonts.ready);
      const bytes=await page.screenshot({path:path.join(project,'app',slide.preview),type:'jpeg',quality:88});
      records.push({style:style.id,page:i+1,preview:slide.preview,width,height,sourceSHA256:slide.sha256,previewSHA256:createHash('sha256').update(bytes).digest('hex')});
    }
    console.log(`Rendered ${style.name}`);
  }
  await fs.writeFile(path.join(project,'app/style-preview-evidence.json'),JSON.stringify({date:new Date().toISOString(),browser:await browser.version(),method:catalog.previewMethod,fontNote:'Local Windows font substitutions may differ from the author environment.',records},null,2)+'\n');
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
