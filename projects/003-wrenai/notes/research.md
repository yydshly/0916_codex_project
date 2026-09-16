# 源码阅读与研究证据

研究日期：2026-09-16。固定提交：`871118e94f1525c401d867074c05e7e8eefca1cc`。动态官网仅辅助理解，复现以固定提交与 package-lock.json 为准。

## 关键来源

| 来源 | 本研究使用的结论 | 证据性质 |
| --- | --- | --- |
| [README](https://github.com/Canner/WrenAI/blob/871118e94f1525c401d867074c05e7e8eefca1cc/README.md) | 当前定位、旧分支迁移、开源与商业边界 | 官方说明 |
| [架构](https://github.com/Canner/WrenAI/blob/871118e94f1525c401d867074c05e7e8eefca1cc/docs/core/reference/architecture.md) | Agent、context、planner、connector 分层；Rust/Python/sqlglot 路径 | 官方技术文档 |
| [MDL](https://github.com/Canner/WrenAI/blob/871118e94f1525c401d867074c05e7e8eefca1cc/docs/core/reference/mdl.md) | 模型/关系/计算字段；rules 不进入引擎 manifest | 官方技术文档 |
| [ask.py](https://github.com/Canner/WrenAI/blob/871118e94f1525c401d867074c05e7e8eefca1cc/core/wren/src/wren/ask.py) | ask 读模板并替换问题，不自动调用模型或执行查询 | 已阅读代码 |
| [guided 模板](https://github.com/Canner/WrenAI/blob/871118e94f1525c401d867074c05e7e8eefca1cc/core/wren/src/wren/ask_templates/guided.md.tmpl) | 查看 context、召回案例、写 SQL、dry-plan、query、回答的工具顺序 | 已阅读模板 |
| [LangChain 示例](https://github.com/Canner/WrenAI/blob/871118e94f1525c401d867074c05e7e8eefca1cc/sdk/wren-langchain/examples/langchain_demo.py) | 模型对象和 Wren tools 在 Agent 层组合 | 已阅读代码 |
| [Memory](https://docs.getwren.ai/oss/concepts/memory_system) | knowledge 是可版本管理来源；LanceDB 是可重建索引；存在文本检索回退 | 官方技术文档，未实测 |
| [WASM](https://docs.getwren.ai/oss/sdk/wasm) | registerJson → loadMDL → query；浏览器内执行；无 memory 模块 | 官方文档 + 本轮发布包实测 |
| [GenBI](https://docs.getwren.ai/oss/guides/genbi) | Agent 构建看板；快照与实时模式不同 | 官方技术文档，未实测其部署命令 |
| [LICENSE](https://github.com/Canner/WrenAI/blob/871118e94f1525c401d867074c05e7e8eefca1cc/LICENSE) | core/sdk/skills/examples Apache-2.0，docs CC BY 4.0 | 许可文件 |

## 对前面对话的精确补充

1. “MDL 定制规则”应拆分为机器执行的结构化模型与给 Agent 阅读的文字规则。关键计算公式可固化在 MDL；任意 Markdown 要求不会自动变为安全策略。
2. RAG 不生成业务数据；它检索模型信息、业务知识和历史正确 SQL。实际数字由查询计算得到。
3. “Wren 引擎执行查询”在服务端是整个查询栈的简称。严格说，Rust 引擎负责语义展开，规划器做 SQL 处理，连接器让目标数据库执行；WASM 包则使用 DataFusion 在本地直接执行。
4. 引擎不需要大模型来完成计算。当前 Agent 主线由外部模型产生操作请求，Agent 框架执行工具调用。`wren ask` 仅输出提示词。
5. 本次展示的自然语言、上下文说明、结果摘要是固定模板。实际执行范围只包括 MDL 与查询，不声称验证完整 AI 问数链路。

## 本轮实验设计

- 两张合成表：39 笔订单 + 6 个客户。
- 查询矩阵：3 类问题 × 2 个月份 × 3 个地区范围 × 2 个计算口径 = 36 组。
- 独立核对：逐笔循环按业务条件计算预期值，与真实引擎返回的有序行对象逐项比较。
- 边界数据：90,000 元取消订单、80,000 元内部订单、1,000 元全额退款订单。
- 字段错误：净收入/实付两种模型均执行未知字段查询并要求失败。
- 口径变化：查询 SQL 使用统一的 `revenue`，MDL 表达式改变；2026-08 两种结果差额为 3,250 元。
- 非目标：自动关系展开、模型隐藏字段的安全效果、cube、大数据性能、模型准确率、生产数据库方言差异。

原始结果与环境在 [engine-verification.json](engine-verification.json)，完整 SQL/数据结果在 [verified-results.json](../app/verified-results.json)。

## 页面验证方式

Playwright 使用已安装 Chrome，无头模式启动临时本地服务。WASM 模块请求映射到 npm 锁定依赖的本地文件，确保实际加载的版本可复现。另用独立浏览器页中断 CDN 请求，验证加载失败提示。没有通过这种测试推断真实公网加载速度或 CDN 可达性。

截图、CSV、手机布局和页面检查结果由脚本实际生成；没有上线地址，projects.json.demo 保持空字符串。
