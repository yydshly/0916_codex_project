import { chromium } from 'playwright';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root=new URL('../',import.meta.url);
await mkdir(new URL('app/media/',root),{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
  const page=await browser.newPage({viewport:{width:1800,height:1600},deviceScaleFactor:2});
  await page.goto(new URL('experiments/summary-poster.html',root).href);
  await page.evaluate(()=>document.fonts.ready);
  const target=new URL('app/media/wrenai-summary.png',root);
  const {fileURLToPath}=await import('node:url');
  await page.locator('.poster').screenshot({path:fileURLToPath(target)});
  const png=await readFile(target);
  await mkdir(new URL('assets/',root),{recursive:true});
  await writeFile(new URL('assets/summary-guide.png',root),png);
  const metadata={generated_at:new Date().toISOString(),method:'Deterministic HTML/CSS layout rendered to PNG using Playwright / Chrome',
    imagegen_attempts:2,imagegen_status:'Both built-in attempts failed with a network error. Final image is an original HTML/CSS composition exported to PNG; no image-generation API fallback used.',
    source:'experiments/summary-poster.html',prompt_record:'notes/summary-image-prompt.txt',
    width:png.readUInt32BE(16),height:png.readUInt32BE(20),
    sha256:createHash('sha256').update(png).digest('hex'),
    description:'Original research infographic, not upstream UI or execution screenshot. Exact Chinese text and numbers use repository research evidence.'};
  await writeFile(new URL('notes/summary-image-generation.json',root),JSON.stringify(metadata,null,2)+'\n');
  console.log(JSON.stringify(metadata,null,2));
}finally{await browser.close();}
