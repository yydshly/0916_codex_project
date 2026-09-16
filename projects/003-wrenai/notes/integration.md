# 接入说明：模型和数据库分别接在哪里

本文为根据官方文档整理的接入设计，未进行真实模型或数据库连接实测。

## 三条路线

| 路线 | 前提 | 配置在哪里 | 适合 |
| --- | --- | --- | --- |
| MCP | 已建好 Wren 项目、已编译 MDL、数据库连接配置、MCP extra | 模型由客户端配置；Wren 保存数据库连接 | 已有支持 MCP 的 Agent 客户端 |
| Python SDK | Wren 项目 + LangChain/LangGraph 或 Pydantic AI | 应用代码选择模型，将 Wren toolkit 注册成工具 | 自己开发聊天分析服务 |
| CLI + Skill | Agent 能执行命令，安装 Wren CLI 和工作流说明 | Agent 使用自己的模型服务，按步骤调用命令 | 编码 Agent 辅助分析 |

服务端首次准备通常涉及：选择支持的 Python 版本 → 安装 Wren 及数据源依赖 → 配置连接 → 创建与审核模型 → 构建 MDL → 查询一个已知结果 → 接入模型 → 做验收。

## MCP 连接概念

在准备好的项目目录中启动 `wren serve mcp`。官方服务公开 `list_models`、`describe_model`、`get_instructions`、`recall_queries`、`dry_plan`、`dry_run`、`run_sql` 等工具，具体工具与版本有关。

模型收到工具名称、描述和参数结构后提出调用请求；客户端执行 MCP 调用，再把结果返回给模型。数据库凭据保留在服务端连接配置，模型侧需要的主要是模型说明、SQL 和结果。模型 API 的数据流向需按选用服务确定。

查询时 SQL 失败，错误可以反馈给 Agent，让模型重试。问题含糊时应追问；重试次数与超时由应用限制。检索记忆与执行查询是不同工具，不应把“检索成功”当作“答案已核实”。

来源：[MCP 文档](https://docs.getwren.ai/oss/guides/mcp)。当前文档说明 HTTP 模式默认监听本机，未自带 bearer-token 认证；实际对外服务需补齐相应访问控制。

## Python SDK 连接概念

```python
# 接口结构示意，未在本项目执行；需要预先准备模型及 Wren 项目。
toolkit = WrenToolkit.from_project("./analytics")
agent = create_agent(
    model=configured_model,
    tools=toolkit.get_tools(),
    system_prompt=toolkit.system_prompt(),
)
```

模型供应商和密钥在 `configured_model` 一侧；表映射、MDL 与数据库连接由 toolkit 对应的项目负责。更换模型通常发生在 Agent 层，而不是 Rust 引擎里。

来源：[官方示例](https://github.com/Canner/WrenAI/blob/871118e94f1525c401d867074c05e7e8eefca1cc/sdk/wren-langchain/examples/langchain_demo.py)。

## 本项目展示为什么不直接接模型

本轮目标是研究业务适配与底层能力，没有提供待接入的业务数据库、模型服务或验收问题。采用固定合成数据与预设 SQL 可以独立验证引擎行为，并清楚看见指标变化。

下一阶段端到端实验应记录：模型与版本、提示词、问题集、检索上下文、生成 SQL、失败与重试、查询结果、人工标准答案、耗时和成本。只有完成这些，才有依据评价自然语言问数效果。
