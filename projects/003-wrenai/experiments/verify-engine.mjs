import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { WrenEngine } from '@wrenai/wren-core-wasm';
import { orders, customers, cases, makeSQL, prepareEngine, key, ENGINE_VERSION, UPSTREAM_COMMIT } from '../app/lab.js';

const root = new URL('../', import.meta.url);
const binary = readFileSync(new URL('node_modules/@wrenai/wren-core-wasm/dist/wren_core_wasm_bg.wasm', root));
const snapshots = {};
const checks = [];
// Independent arithmetic oracle, separate from SQL / MDL generation.
function expected(p) {
  const totals = new Map();
  for (const o of orders) {
    const c = customers.find(c => c.customer_id === o.customer_id);
    if (!o.order_date.startsWith(p.month) || o.status !== 'paid' || o.is_internal || (p.region !== '全部' && c.region !== p.region)) continue;
    const label = p.scenario === 'region' ? c.region : p.scenario === 'customer' ? c.customer_name : o.order_date;
    totals.set(label, (totals.get(label) || 0) + o.paid_amount - (p.metric === 'net' ? o.refund_amount : 0));
  }
  const rows = [...totals].map(([label, revenue]) => ({ label, revenue }));
  rows.sort((a,b) => p.scenario === 'trend' ? a.label.localeCompare(b.label) : b.revenue - a.revenue || a.label.localeCompare(b.label));
  return p.scenario === 'customer' ? rows.slice(0,5) : rows;
}
for (const metric of ['net', 'gross']) {
  const engine = await WrenEngine.init({ wasmUrl: binary });
  try {
    await prepareEngine(engine, metric);
    for (const scenario of Object.keys(cases)) for (const month of ['2026-07', '2026-08']) for (const region of ['全部', '华东', '华南']) {
      const params = { metric, scenario, month, region };
      const sql = makeSQL(params);
      const rows = await engine.query(sql);
      assert.deepEqual(rows, expected(params), key(params));
      snapshots[key(params)] = { params, sql, rows };
    }
    let rejected = false;
    try { await engine.query('SELECT nonexistent_column FROM "Orders"'); }
    catch (e) { rejected = true; checks.push({ test: `unknown-column-${metric}`, passed: true, error: String(e) }); }
    assert.ok(rejected, 'Unknown columns must be rejected');
  } finally { engine.free(); }
}
const net = snapshots['region|2026-08|全部|net'].rows.reduce((sum,r) => sum+r.revenue,0);
const gross = snapshots['region|2026-08|全部|gross'].rows.reduce((sum,r) => sum+r.revenue,0);
assert.equal(gross-net, 3250);
checks.push({ test: 'refund-definition-changes-result', passed: true, net, gross, difference: gross-net });
const metadata = { generated_at: new Date().toISOString(), engine: `@wrenai/wren-core-wasm@${ENGINE_VERSION}`, upstream_commit: UPSTREAM_COMMIT,
  node: process.version, platform: process.platform, wasm_sha256: createHash('sha256').update(binary).digest('hex'),
  fixture: '39 synthetic orders, 6 synthetic customers; no personal or production data',
  validated_query_count: Object.keys(snapshots).length, checks,
  scope: 'Real WASM engine: MDL calculated fields, explicit joins, filters, aggregation, top-N, invalid column. No LLM or RAG executed.' };
mkdirSync(new URL('notes/',root), { recursive: true });
writeFileSync(new URL('app/verified-results.json',root), JSON.stringify({ metadata, snapshots }, null, 2)+'\n');
writeFileSync(new URL('notes/engine-verification.json',root), JSON.stringify(metadata,null,2)+'\n');
console.log(JSON.stringify(metadata,null,2));
