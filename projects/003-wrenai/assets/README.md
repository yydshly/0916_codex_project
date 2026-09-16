# 研究引导图与实际浏览器截图

由 `experiments/verify-ui.mjs` 运行本项目页面后生成，不是官方产品界面。

- `summary-guide.png`：总仓库封面，原创研究引导图；与 `app/media/wrenai-summary.png` 一致，非运行截图。
- `overview.png`：1440×1000 桌面视口，定位销售问数实验，真实浏览器引擎模式。
- `desktop-full.png`：1440px 宽的完整桌面页面。
- `mobile-full.png`：390px 宽的完整移动布局，华东客户排名回放。
- `architecture.png`：内部技术架构完整区块，选择“展开语义与规划”节点；属于说明导览，不是实际 Agent 运行日志。
- `architecture-mobile.png`：390px 宽的同一节点详情，展示输入、内部处理和输出。
- `understanding.png`：网页新增的知识、定义、执行和反馈分工，以及规则应用和数值汇总说明。
- `reliability.png`：网页新增的分层可靠性、跨月退款示例、已验证 / 未验证边界。

单图汇总位于 `../app/media/wrenai-summary.png`，属于原创研究信息图而非运行截图。image_gen 两次网络失败后改为 HTML/CSS 排版；本次更新导出 3600×3756 PNG，加入本质摘要与方案选择。提示词及最终生成记录保存在 `../notes/`，源稿位于 `../experiments/summary-poster.html`。

全部为合成业务数据。截图时 WASM 请求由测试程序指向同版本本地 npm 包，执行真实 Wren 代码；不表示已验证公网 CDN。生成时间、浏览器版本和检查结果见 `../notes/ui-verification.json`。
