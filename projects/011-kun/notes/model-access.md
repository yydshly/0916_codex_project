# 模型接入：连接方式与执行引擎要分开看

研究版本：`e67f656bca573d5e6a4970a5094a30f3afd09011`，日期：2026-09-17。以下描述仓库实现，未登录账号、调用模型或验证订阅可用性。

## 三个独立问题

1. 用什么凭据：API Key、OAuth、订阅账号或官方 CLI 登录。
2. 以什么协议访问：Chat Completions、Responses、Messages 或专用传输。
3. 由谁控制执行循环：Kun 原生循环，或外部 Agent SDK / CLI 运行时。

同样在界面中选择模型，不代表以上三项相同；订阅接入也不是一种统一协议。

## 主要路线

| 路线 | 配置与传输 | 谁负责 Agent 循环 | 关键边界 |
| --- | --- | --- | --- |
| 普通模型 API | API Key、Base URL、模型 ID、协议类型 | Kun 原生 AgentLoop | 模型必须支持任务所需能力；兼容协议不等于来自同一供应商 |
| 兼容网关 | LiteLLM、Vercel AI Gateway 等网关地址与凭据 | Kun 原生 AgentLoop | 是否路由、回退与计费取决于网关配置；不表示所有连接默认经过网关 |
| 仓库的 ChatGPT 订阅路线 | OAuth；HTTP 请求 Codex Responses 专用端点 | Kun 原生循环 | 没有在这条路线里操作 Codex 桌面软件；不是普通 OpenAI API Key 连接，也不保证第三方订阅路线当前可用 |
| Claude Pro/Max 订阅路线 | 官方 Claude Code 登录或 setup-token；`@anthropic-ai/claude-agent-sdk` | Claude Agent SDK | SDK 负责循环，Kun 桥接额外工具、审批与执行事件 |
| Gemini / Antigravity / Cursor 专用路线 | 目录分别定义 `gemini-cli-api`、`antigravity-cli`、`cursor-sdk` | 按具体适配器选择 | 不能把全部订阅路线统一归为 API 或统一归为外部循环；本研究未对每个适配器做完整执行审计 |
| 自定义 Provider 扩展 | Node Host 实现模型传输，输出规范化流 | 模型 Provider 扩展路径保留既有 Kun 循环 | 这是自定义模型传输接口，不能与专门的外部 Agent 运行时混为一谈 |

## 普通 API 如何工作

```text
界面选择 Provider + 账号 + 模型
  → Kun 组装提示、历史、项目上下文与工具定义
  → MultiProviderModelClient 选择对应模型客户端
  → 协议适配：Chat Completions / Responses / Messages
  → HTTP 请求模型服务，解码流式事件
  → 统一为文字、推理、工具调用、用量、完成或错误
  → Kun 工具宿主执行，结果进入历史
  → 继续调用模型，直到完成或触发中断条件
```

`providerId` 缺省或为 `default` 时使用默认客户端；显式未知 Provider 会报错，不会静默借用另一家凭据。同一回合会固定已选择客户端，阻止回合中途换供应商。协议适配包含消息、工具 schema、推理参数、流式结果和用量，不只是改一个 URL。

## Claude SDK 路线的不同

```text
Kun 工作台与回合管理
  → Claude Agent SDK 执行循环
      ├─ 读 / 写 / 编辑 / 命令等：SDK 原生工具
      └─ Kun 额外工具：进程内 MCP 桥接 → Kun 实际执行器
  → SDK 事件映射为 Kun 的消息、状态、用量与审批
  → 同一工作台呈现结果
```

`sdk-tool-bridge.ts` 明确将重叠的 `read/bash/edit/write/grep/glob/find/ls` 排除于桥接之外，额外工具通过 Kun 执行器运行。不能把这条路线解释成“只借用 Claude 模型，工具循环仍全部是 Kun”。不同运行时的恢复、实时干预和上下文遥测能力可能不同，不能自动推定所有工作台功能在每条路线都有相同行为。

## 源码依据

路径均对应上述固定提交：

- [Provider 预设说明](https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/docs/model-provider-presets.md)
- [Provider 目录与认证类型](https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/packages/provider-catalog/src/index.ts)
- [统一模型接口](https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/kun/src/ports/model-client.ts)
- [多 Provider 路由](https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/kun/src/adapters/model/multi-provider-model-client.ts)
- [请求适配](https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/kun/src/adapters/model/compat-request-builder.ts)
- [ChatGPT OAuth 实现](https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/kun/src/services/model-connection-oauth.ts)
- [Claude 订阅登录](https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/src/main/claude-subscription-auth.ts)
- [Claude SDK 运行时装配](https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/kun/src/runtime/agent-sdk/agent-sdk-runtime-factory.ts)
- [Claude SDK 工具桥接](https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/kun/src/runtime/agent-sdk/sdk-tool-bridge.ts)
- [SDK 路线能力声明](https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/kun/src/runtime/agent-sdk/agent-sdk-runtime-stream.ts)
- [扩展 Provider 与账号](https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/docs/extensions/providers-and-accounts.md)
