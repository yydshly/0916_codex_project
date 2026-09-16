import { cases, makeMDL, makeSQL, prepareEngine, key, CDN } from './lab.js';
const $ = id => document.getElementById(id);
const number = n => Number(n).toLocaleString('zh-CN', { maximumFractionDigits: 2 });
let scenario = 'region', data, activeRows = [], live = false, Engine, sequence = 0;
const engines = new Map();
const enginePromises = new Map();
function params() { return { scenario, month: $('month').value, region: $('region').value, metric: $('metric').value }; }
async function engineFor(metric) {
  if (engines.has(metric)) return engines.get(metric);
  if (!enginePromises.has(metric)) enginePromises.set(metric, (async () => {
    const engine = await Engine.init();
    try { await prepareEngine(engine, metric); engines.set(metric, engine); return engine; }
    catch (error) { engine.free(); enginePromises.delete(metric); throw error; }
  })());
  return enginePromises.get(metric);
}
function draw(rows,p) {
  activeRows = rows;
  const total = rows.reduce((sum,r) => sum + Number(r.revenue), 0);
  $('total').textContent = `¥ ${number(total)}`;
  $('metric-label').textContent = `${p.month} / ${p.region} / ${p.scenario === 'customer' ? '当前前五客户合计' : '查询范围合计'}`;
  $('result-count').textContent = `${rows.length} 个${cases[p.scenario].alias}`;
  $('result-scope').textContent = `人民币 · ${p.metric === 'net' ? '已扣退款' : '未扣退款'}`;
  $('dimension').textContent = cases[p.scenario].alias;
  $('value-heading').textContent = `${p.metric === 'net' ? '净收入' : '实付金额'}（元）`;
  $('rows').replaceChildren(); $('chart').replaceChildren();
  const max = Math.max(...rows.map(r=>Number(r.revenue)),1);
  for (const row of rows) {
    const tr=document.createElement('tr');
    for (const value of [row.label,number(row.revenue)]) { const td=document.createElement('td'); td.textContent=value;tr.append(td); }
    $('rows').append(tr);
    const barRow=document.createElement('div');barRow.className='bar-row';
    const label=document.createElement('span');label.textContent=row.label;
    const track=document.createElement('div');track.className='bar-track';
    const bar=document.createElement('div');bar.className='bar';bar.style.width=`${Number(row.revenue)/max*100}%`;track.append(bar);
    const value=document.createElement('span');value.className='bar-value';value.textContent=number(row.revenue);
    barRow.append(label,track,value);$('chart').append(barRow);
  }
  $('answer').textContent = rows.length ? `${p.month}，${p.region === '全部' ? '全部地区' : p.region}的${p.scenario === 'customer' ? '前五客户' : '查询范围'}${p.metric === 'net' ? '净收入' : '实付金额'}合计为 ¥${number(total)}。${p.scenario === 'trend' ? '图中仅展示有订单的日期，未补齐零收入日期。' : `其中 ${rows[0].label} 为 ¥${number(rows[0].revenue)}。`}（模板摘要）` : '当前条件没有查询结果。';
  $('download').disabled = !rows.length;
}
async function render() {
  const request=++sequence,p=params(),sql=makeSQL(p);
  $('question').textContent=cases[p.scenario].question;
  $('sql').textContent=sql;
  $('mdl').textContent=`模型 Orders → raw_orders\n计算字段 revenue = ${p.metric === 'net' ? 'paid_amount - refund_amount' : 'paid_amount'}\n\n查询统一筛选：\nstatus = 'paid'\nis_internal = false\n统计日期：order_date（订单归属月）`;
  $('full-mdl').textContent=JSON.stringify(makeMDL(p.metric),null,2);
  document.querySelectorAll('[data-case]').forEach(b=>{b.classList.toggle('selected',b.dataset.case===scenario);b.setAttribute('aria-pressed',String(b.dataset.case===scenario));});
  if(!data)return;
  $('download').disabled=true;
  if(live) {
    $('status').textContent='Wren 正在执行本次查询…';
    try {
      const engine=await engineFor(p.metric),rows=await engine.query(sql);
      if(request!==sequence)return;
      draw(rows,p);$('status').textContent='真实执行完成 · Wren WASM 在当前浏览器计算 · 未调用大模型';
      $('mode-badge').textContent='真实引擎运行';$('mode-badge').classList.add('live');
    } catch(error) {
      if(request!==sequence)return;
      live=false;draw(data.snapshots[key(p)].rows,p);
      $('status').textContent=`实时执行失败，已恢复实测回放：${String(error).slice(0,180)}`;
      $('mode-badge').textContent='实测结果回放';$('mode-badge').classList.remove('live');
      $('start-engine').disabled=false;$('start-engine').textContent='重试真实引擎 ↗';
    }
  } else {
    draw(data.snapshots[key(p)].rows,p);
    $('status').textContent='当前显示真实 Wren 引擎的已验证结果快照；本次切换没有执行模型推理。';
  }
}
document.querySelectorAll('[data-case]').forEach(b=>b.addEventListener('click',()=>{scenario=b.dataset.case;render();}));
for(const id of ['month','region','metric'])$(id).addEventListener('change',render);
$('start-engine').addEventListener('click',async()=>{
  $('start-engine').disabled=true;$('start-engine').textContent='正在加载引擎…';
  $('status').textContent='正在下载约 72 MB 的引擎模块，首次加载可能需要较长时间。';
  try {
    ({WrenEngine:Engine}=await import(CDN));
    await engineFor($('metric').value);live=true;
    $('start-engine').textContent='真实引擎已启动 ✓';await render();
  } catch(error) {
    $('start-engine').disabled=false;$('start-engine').textContent='重试加载 ↗';
    $('status').textContent=`加载失败，仍显示已验证结果回放。请检查网络后重试：${String(error).slice(0,160)}`;
  }
});
$('download').addEventListener('click',()=>{
  const p=params();
  const csv='\ufeff'+[[cases[p.scenario].alias,p.metric==='net'?'净收入（元）':'实付金额（元）'],...activeRows.map(r=>[r.label,r.revenue])].map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download=`wren-${p.scenario}-${p.month}-${p.metric}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
try {
  const response=await fetch('verified-results.json');if(!response.ok)throw new Error(`HTTP ${response.status}`);data=await response.json();
  $('verification').textContent=`运行记录：${data.metadata.generated_at}；${data.metadata.engine}；${data.metadata.validated_query_count} 组查询与独立计算逐项一致。计算数据包含取消订单、内部订单和全额退款等边界案例。`;
  await render();
}catch(error){$('status').textContent=`无法读取实验结果：${error.message}。请通过 HTTP 服务访问本页。`;$('start-engine').disabled=true;}
