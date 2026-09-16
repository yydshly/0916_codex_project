const scenarios={
  single:{title:'先直接用 Codex。',copy:'要求观察参考页、读取关键参数、实现后对照截图。加一道提取步骤未必更省事；我们没有验证这个库能提升单次复刻效果。'},
  brand:{title:'提取一次，核对后再复用。',copy:'整理品牌色、字体和组件参数，保存为设计规范与主题配置。它能减少重复整理，但跨项目沿用风格仍需结合布局、内容和已有组件。'},
  batch:{title:'统一采集接口开始有价值。',copy:'批量整理参考站或盘点旧站样式，记录每条数据的来源、处理失败并抽查结果。旧站的不一致只是现状，不应自动变成新设计规范。'},
  product:{title:'把它作为候选采集模块。',copy:'借鉴浏览器采集、数据组织和导出接口；补齐交互探索、代码生成、运行、同状态比较和修改验证。先做三组对照实验，再决定是否集成。'}
};
const buttons=[...document.querySelectorAll('[data-scenario]')];
function select(button){for(const item of buttons)item.setAttribute('aria-pressed',String(item===button));const data=scenarios[button.dataset.scenario];document.getElementById('scenario-title').textContent=data.title;document.getElementById('scenario-copy').textContent=data.copy;}
buttons.forEach(button=>button.addEventListener('click',()=>select(button)));
