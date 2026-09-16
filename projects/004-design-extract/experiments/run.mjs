// Original research harness. Uses an independently installed, pinned upstream clone.
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';

const here = dirname(fileURLToPath(import.meta.url));
const project = resolve(here, '..');
const root = resolve(project, '../..');
const upstream = resolve(root, 'upstream/design-extract');
const pinned = '47f75bb68cd6fcb51c172868a3a1b814cd6bdeb4';
const commit = execFileSync('git', ['rev-parse', 'HEAD'], {cwd:upstream, encoding:'utf8'}).trim();
if (commit !== pinned) throw new Error(`Expected ${pinned}, found ${commit}`);
const source = async p => import(pathToFileURL(join(upstream, p)).href);
const {extract, render, RENDERERS} = await source('src/api.js');
const {captureResponsive} = await source('src/extractors/responsive.js');
const {captureInteractions} = await source('src/extractors/interactions.js');
const {generateClone} = await source('src/clone.js');
const {launchChromium} = await source('src/browser.js');
const notes = join(project, 'notes');
const output = join(notes, 'output');
const assets = join(project, 'assets');
const scratch = join(root, '.local/design-extract');
for (const dir of [notes, output, assets, scratch]) await mkdir(dir, {recursive:true});
const json = (p,v) => writeFile(p, JSON.stringify(v,null,2)+'\n');
const fixture = await readFile(join(here,'fixture.html'));
const server = createServer((req,res) => {
  if (req.url !== '/' && req.url !== '/fixture.html') {res.writeHead(404);res.end();return;}
  res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});res.end(fixture);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url = `http://127.0.0.1:${server.address().port}/fixture.html`;
const checks = [];
function check(name, expected, actual, pass) {checks.push({name, expected, actual, pass:Boolean(pass)});}
const start = performance.now();
let browser;
try {
  console.log('Extracting controlled specimen...');
  const design = await extract(url, {dark:true});
  await json(join(output,'design.json'),design);
  const responsive = await captureResponsive(url);
  const interactions = await captureInteractions(url);
  await json(join(output,'responsive.json'),responsive);
  await json(join(output,'interactions.json'),interactions);
  check('brand colour', '#2563eb', design.colors.primary?.hex, design.colors.primary?.hex === '#2563eb');
  check('heading size', 48, design.typography.headings.map(x=>x.size), design.typography.headings.some(x=>x.size===48));
  check('font family', 'Arial', design.typography.families.map(x=>x.name), design.typography.families.some(x=>x.name==='Arial'));
  check('card radius', 12, design.borders.radii.map(x=>x.value), design.borders.radii.some(x=>x.value===12));
  check('spacing observation', 24, design.spacing.raw, design.spacing.raw.includes(24));
  check('dark brand colour', '#60a5fa', design.darkMode?.colors?.primary?.hex, design.darkMode?.colors?.primary?.hex==='#60a5fa');
  check('four sampled viewports', 4, responsive.viewports.length, responsive.viewports.length===4);
  const mobile = responsive.viewports.find(v=>v.name==='mobile');
  const desktop = responsive.viewports.find(v=>v.name==='desktop');
  check('mobile heading size', '32px', mobile?.headings?.h1?.fontSize, mobile?.headings?.h1?.fontSize==='32px');
  check('desktop grid columns', 3, desktop?.maxColumns, desktop?.maxColumns===3);
  check('mobile grid columns', 1, mobile?.maxColumns, mobile?.maxColumns===1);
  check('mobile navigation hidden', false, mobile?.navVisible, mobile?.navVisible===false);
  const fast = interactions.buttons.find(b=>b.text==='Start capture');
  const slow = interactions.buttons.find(b=>b.text==='Slow transition');
  check('80ms hover reaches target', 'rgb(29, 78, 216)', fast?.hover?.backgroundColor?.to, fast?.hover?.backgroundColor?.to==='rgb(29, 78, 216)');
  check('input focus captured', 'nonempty focus changes', interactions.inputs.length, interactions.inputs.some(i=>Object.keys(i.focus).length>0));
  check('intentional contrast failure detected', 'failCount > 0', design.accessibility.failCount, design.accessibility.failCount>0);
  const emitted = [];
  const saved = {'dtcg':'tokens.json','css-vars':'variables.css','tailwind-v4':'tailwind-v4.css','figma':'figma.json','design-md':'DESIGN.md','preview-html':'preview.html','ios-swiftui':'DesignTokens.swift','android-compose':'compose.json','flutter-dart':'design_tokens.dart'};
  for (const id of Object.keys(RENDERERS)) {
    try {
      const result = render(id,design);
      const body = typeof result==='string' ? result : JSON.stringify(result,null,2);
      emitted.push({id, type:typeof result, bytes:Buffer.byteLength(body), success:body.length>0});
      if (saved[id]) await writeFile(join(output,saved[id]),id==='preview-html' ? body.replace(/[\t ]+$/gm,'') : body);
    } catch(error) {emitted.push({id,success:false,error:error.message});}
  }
  const tokens = JSON.parse(await readFile(join(output,'tokens.json'),'utf8'));
  check('token primitive and semantic layers', true, Boolean(tokens.primitive && tokens.semantic), tokens.primitive && tokens.semantic);
  check('all registered emitters return content', Object.keys(RENDERERS).length, emitted.filter(e=>e.success).length, emitted.every(e=>e.success));
  const clone = generateClone(design, join(scratch,'clone'));
  const clonePage = await readFile(join(scratch,'clone/src/app/page.js'),'utf8');
  const cloneResult = {files:clone.files,order:clone.order,hasTemplateCopy:clonePage.includes('nothing invented'),sourceIncludesTemplateCopy:fixture.toString().includes('nothing invented'),builtOrRun:false};
  const cli = await new Promise((done,reject)=>{
    const child=spawn(process.execPath,[join(upstream,'bin/design-extract.js'),url,'--out',join(scratch,'cli'),'--name','specimen'],{cwd:upstream,windowsHide:true});
    let stdout='',stderr='';
    child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);
    child.on('error',reject);child.on('close',code=>done({exitCode:code,stdout,stderr}));
  });
  await json(join(notes,'cli-result.json'),cli);
  await json(join(notes,'cli-files.json'),await readdir(join(scratch,'cli')));
  check('CLI extraction exits successfully',0,cli.exitCode,cli.exitCode===0);
  browser = await launchChromium({headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  await page.goto(url);
  const groundTruth = await page.evaluate(()=>({bodyColor:getComputedStyle(document.body).color,gridGap:getComputedStyle(document.querySelector('.grid')).gap}));
  await page.locator('#slow').hover();
  await page.waitForTimeout(500);
  groundTruth.slowHoverColor = await page.locator('#slow').evaluate(el=>getComputedStyle(el).backgroundColor);
  await page.mouse.move(0,0);
  await page.waitForTimeout(500);
  await page.screenshot({path:join(assets,'fixture-light.png'),fullPage:true});
  await page.emulateMedia({colorScheme:'dark'});
  await page.waitForTimeout(500);
  await page.screenshot({path:join(assets,'fixture-dark.png'),fullPage:true});
  await page.emulateMedia({colorScheme:'light'});
  await page.waitForTimeout(500);
  await page.setViewportSize({width:375,height:812});
  await page.screenshot({path:join(assets,'fixture-mobile.png'),fullPage:true});
  await page.setViewportSize({width:1440,height:1000});
  // Static generated preview; block remote resource requests during capture.
  await page.route(/^https?:\/\//,route=>route.abort());
  const previewErrors=[];
  page.on('pageerror',e=>previewErrors.push(e.message));
  await page.goto(pathToFileURL(join(output,'preview.html')).href);
  await page.screenshot({path:join(assets,'extracted-preview.png'),fullPage:true});
  await page.screenshot({path:join(assets,'extracted-preview-cover.png')});
  const designMd = await readFile(join(output,'DESIGN.md'),'utf8');
  const foreground = designMd.match(/foreground: "([^"]+)"/)?.[1];
  const fidelityChecks = [
    {name:'24px layout spacing retained in normalized scale',expected:24,actual:design.spacing.scale,pass:design.spacing.scale.includes(24)},
    {name:'DESIGN.md foreground matches known body text',expected:'#0f172a',actual:foreground,pass:foreground==='#0f172a'},
    {name:'400ms hover final colour captured',expected:groundTruth.slowHoverColor,actual:slow?.hover?.backgroundColor?.to,pass:slow?.hover?.backgroundColor?.to===groundTruth.slowHoverColor},
    {name:'clone copy contains no detected template sentence',expected:false,actual:cloneResult.hasTemplateCopy,pass:!cloneResult.hasTemplateCopy},
  ];
  const report = {
    recordedAt:new Date().toISOString(),upstreamCommit:commit,version:JSON.parse(await readFile(join(upstream,'package.json'),'utf8')).version,
    node:process.version,platform:process.platform,browser:browser.version(),fixtureSha256:createHash('sha256').update(fixture).digest('hex'),
    lockSha256:createHash('sha256').update(await readFile(join(upstream,'package-lock.json'))).digest('hex'),
    elapsedSeconds:Math.round((performance.now()-start)/100)/10,scope:'One original local fixture. No LLM calls. Native/Figma outputs not imported or compiled; clone generated but not built.',
    checks,passed:checks.filter(x=>x.pass).length,total:checks.length,fidelityChecks,fidelityPassed:fidelityChecks.filter(x=>x.pass).length,fidelityTotal:fidelityChecks.length,groundTruth,emitters:emitted,
    observations:{slowHover:{expectedSettled:'rgb(29, 78, 216)',sampled:slow?.hover?.backgroundColor?.to,settled:slow?.hover?.backgroundColor?.to==='rgb(29, 78, 216)'},clone:cloneResult,previewErrors},
  };
  await json(join(notes,'verification.json'),report);
  console.log(JSON.stringify({passed:report.passed,total:report.total,failed:checks.filter(x=>!x.pass),fidelityChecks,observations:report.observations,emitters:emitted.length},null,2));
} finally {
  if(browser) await browser.close();
  server.closeAllConnections();await new Promise(r=>server.close(r));
}
