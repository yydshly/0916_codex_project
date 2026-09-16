// Original research fixture. No upstream code or real customer data is included.
export const ENGINE_VERSION = '0.4.1';
export const UPSTREAM_COMMIT = '871118e94f1525c401d867074c05e7e8eefca1cc';
export const CDN = `https://unpkg.com/@wrenai/wren-core-wasm@${ENGINE_VERSION}/dist/index.js`;
export const customers = [
  { customer_id: 1, customer_name: '青禾商店', region: '华东' },
  { customer_id: 2, customer_name: '山海零售', region: '华东' },
  { customer_id: 3, customer_name: '南风百货', region: '华南' },
  { customer_id: 4, customer_name: '木棉生活', region: '华南' },
  { customer_id: 5, customer_name: '远山集市', region: '华西' },
  { customer_id: 6, customer_name: '星野选品', region: '华西' }
];
export const orders = [];
for (const month of ['2026-07', '2026-08']) {
  for (const customer of customers) {
    for (let n = 0; n < 3; n++) {
      const paid = 1000 + customer.customer_id * 300 + n * 200 + (month === '2026-08' ? 500 : 0);
      orders.push({ order_id: orders.length + 1, customer_id: customer.customer_id,
        order_date: `${month}-${['05', '15', '25'][n]}`, paid_amount: paid,
        refund_amount: n === 1 ? 200 + customer.customer_id * 50 : 0,
        status: 'paid', is_internal: false });
    }
  }
}
// Deliberate boundary fixtures: cancelled orders, internal orders, full refund.
orders.push(
  { order_id: 37, customer_id: 1, order_date: '2026-08-15', paid_amount: 90000, refund_amount: 0, status: 'cancelled', is_internal: false },
  { order_id: 38, customer_id: 2, order_date: '2026-08-15', paid_amount: 80000, refund_amount: 0, status: 'paid', is_internal: true },
  { order_id: 39, customer_id: 3, order_date: '2026-08-25', paid_amount: 1000, refund_amount: 1000, status: 'paid', is_internal: false }
);

export function makeMDL(metric = 'net') {
  const column = (name, type) => ({ name, type });
  return {
    catalog: 'wren', schema: 'public',
    models: [
      { name: 'Orders', tableReference: { table: 'raw_orders' }, primaryKey: 'order_id', columns: [
        column('order_id', 'INTEGER'), column('customer_id', 'INTEGER'), column('order_date', 'VARCHAR'),
        column('paid_amount', 'DOUBLE'), column('refund_amount', 'DOUBLE'), column('status', 'VARCHAR'),
        column('is_internal', 'BOOLEAN'),
        { name: 'revenue', type: 'DOUBLE', isCalculated: true,
          expression: metric === 'net' ? 'paid_amount - refund_amount' : 'paid_amount' }
      ] },
      { name: 'Customers', tableReference: { table: 'raw_customers' }, primaryKey: 'customer_id', columns: [
        column('customer_id', 'INTEGER'), column('customer_name', 'VARCHAR'), column('region', 'VARCHAR')
      ] }
    ], relationships: [], views: []
  };
}
export const cases = {
  region: { label: '地区收入', question: '各地区的收入表现如何？', dimension: 'c.region', alias: '地区' },
  customer: { label: '客户排名', question: '收入最高的前五个客户是谁？', dimension: 'c.customer_name', alias: '客户' },
  trend: { label: '日期趋势', question: '收入在这个月如何变化？', dimension: 'o.order_date', alias: '日期' }
};
export function makeSQL({ scenario, month, region }) {
  if (!Object.hasOwn(cases, scenario) || !['2026-07', '2026-08'].includes(month) || !['全部', '华东', '华南'].includes(region)) throw new Error('无效的案例参数');
  const item = cases[scenario];
  const next = month === '2026-07' ? '2026-08-01' : '2026-09-01';
  return `SELECT ${item.dimension} AS label,\n       SUM(o.revenue) AS revenue\nFROM "Orders" o\nJOIN "Customers" c ON o.customer_id = c.customer_id\nWHERE o.order_date >= '${month}-01'\n  AND o.order_date < '${next}'\n  AND o.status = 'paid'\n  AND o.is_internal = false${region === '全部' ? '' : `\n  AND c.region = '${region}'`}\nGROUP BY ${item.dimension}\nORDER BY ${scenario === 'trend' ? 'label ASC' : 'revenue DESC, label ASC'}${scenario === 'customer' ? '\nLIMIT 5' : ''}`;
}
export function key(params) { return [params.scenario, params.month, params.region, params.metric].join('|'); }
export async function prepareEngine(engine, metric) {
  await engine.registerJson('raw_orders', orders);
  await engine.registerJson('raw_customers', customers);
  await engine.loadMDL(makeMDL(metric), { source: '' });
  return engine;
}
