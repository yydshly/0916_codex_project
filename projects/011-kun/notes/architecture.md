# Kun 源码与原理笔记

研究提交：`e67f656bca573d5e6a4970a5094a30f3afd09011`，日期：2026-09-17。

[返回能力导读](../README.md)。本文区分文档描述、已读实现和待验证效果，路径均相对于上游仓库；不构成全量代码审计。

## 1. 各层负责什么

```text
用户：目标、约束、选择、审批
  ↓
桌面 GUI / 终端 TUI / CLI 等入口
  ↓ HTTP 请求与 SSE 事件
kun serve：线程、回合、模型请求、工具执行、审批、用量
  ├─ 模型适配：调用配置的模型或相应接入路径
  ├─ 工具宿主：本地工具、外部 MCP、客户端工具
  ├─ 编排与上下文：计划、子 Agent、Graph、历史压缩
  └─ 持久化：会话事件、索引、记忆和任务状态
```

此图抽象共同执行边界，不表示每个功能都位于运行时同一进程。桌面工作流调度另有 `src/main/workflow-runtime.ts`；画布和桌面工具也有客户端限制。

目录职责：`kun/src/ports/` 定义模型、工具与存储边界；`adapters/` 对接实现；`loop/` 执行模型与工具循环；`services/` 组织线程和回合；`server/` 提供接口；`src/renderer/` 提供桌面交互。

## 2. 能力与证据对应表

“实现阅读”表示打开过关键文件；“文档说明”表示主要依据专题文档，不把路径存在当成效果验证。

| 主题 | 文档或源码入口 | 本次证据支持的判断 |
| --- | --- | --- |
| 桌面与运行时 | [架构][architecture]、[package.json][package] | 文档与配置：Electron/React 桌面、TypeScript 运行时、HTTP/SSE 边界 |
| Agent 循环 | [agent-loop-execution.ts][execution] | 实现阅读：循环调用模型步骤，处理停止、限额、取消与 Graph 暂停 |
| 模型请求 | [model-step-service.ts][step]、[model-round-engine.ts][round] | 实现阅读：准备上下文与路由，流式收集回复和工具调用，记录用量 |
| 工具执行 | [tool-call-dispatcher.ts][dispatch]、[tool-execution-service.ts][tool] | 实现阅读：分发、有限并行、重复抑制、执行结果与错误持久化 |
| 权限 | [local-tool-host-core.ts][host] | 关键分支核对：沙箱检查、按策略等待审批；未审计隔离效果 |
| Work | [work-mode.ts][work]、[首页][overview] | 实现阅读：引用上下文、资源读写权限、白板提交回执约束 |
| Design | [设计文档][design] | 文档说明：HTML 原型、画布预览、版本与代码交接 |
| 记忆 | [记忆文档][memory]、[hybrid-memory-store.ts][memory-source] | 文档说明与路径核对：JSON 标准数据、FTS5 索引、作用域与生命周期过滤 |
| 知识库 | [知识库文档][knowledge] | 文档说明：无向量结构索引、只读挂载、有界证据读取 |
| 多 Agent | [Graph 文档][graph]、[graph-scheduler.ts][graph-source] | 文档说明与路径核对：依赖调度、受限执行者、主 Agent 验收 |
| 工作流 | [Loop 文档][workflow]、[workflow-runtime.ts][workflow-source] | 文档与入口阅读：调度、节点执行和 Webhook 等职责已拆分 |
| 扩展 | [扩展说明][extensions] | 文档说明：公开 SDK、Node Host/Webview、Broker 与权限边界 |

## 3. 一次任务怎样执行

以下链路描述 Kun 原生 AgentLoop。普通 API 与仓库的 ChatGPT HTTP 接入使用此类路径；Claude 订阅路线由 Claude Agent SDK 负责循环，通过 MCP 桥接 Kun 额外工具，不能套用所有原生实现细节。见[模型接入与执行引擎](model-access.md)。

1. **接收目标与环境。** 将请求组织为线程中的回合，准备工作区、模式、可用工具与相关上下文。
2. **准备模型请求。** `ModelStepService.run()` 准备当前步骤，组合历史、模型路由、工具能力与预算。
3. **接收响应。** `ModelRoundEngine` 消费流式输出，区分回复、工具调用、上下文溢出和失败等情况，持续保存消息与用量。
4. **分发工具。** `ToolCallDispatcher` 对允许并行的工具组成小批次，结果按原调用顺序落盘，避免完成先后影响历史排列。
5. **执行与反馈。** `ToolExecutionService` 调用工具宿主、记录结果并规范化失败；模型在后续步骤能看到报错或取消情况。
6. **继续或收尾。** `AgentLoopExecution` 再次执行模型步骤，检查中断、时长与步数等限制；Graph 还有专用暂停、监督和唤醒路径。

这是“判断—动作—观察—再判断”的工具调用循环。正确性仍需真实测试、文件差异、引用来源或产物检查支持。

### 权限检查在宿主中执行

工具宿主有沙箱和审批分支。当前工作区、工具与策略共同约束执行，子 Agent 不能自行扩大父级权限。存在这些分支不等于已验证所有操作系统的隔离强度，本次未做绕过测试或安全审计。

### 停止与恢复也属于执行机制

循环处理正常结束、取消、运行上限、工具失败与断连。重复工具抑制减少相同调用的无效消耗，但不保证识别所有逻辑死循环。Graph 主 Agent 的运行片段有专用控制，不能以普通回合的限制概括全部模式。

## 4. 历史、记忆与知识库

### 历史：发生过什么

运行时说明以 `messages.jsonl` 和 `events.jsonl` 保存会话回放日志，SQLite 提供可重建索引。持久化为重启和续接提供依据，但外部命令结果仍需核对，不能推断所有中断动作都能安全重放。

### 记忆：以后可能仍相关的信息

标准数据是独立 JSON，SQLite FTS5 是检索投影。先过滤作用域和生命周期，再按词法相关性、类型、时效、重要性等排序，限制注入数量和字符数。索引不可用时有文件/n-gram 降级路径。

信息重新放入模型上下文后影响回答，这套机制本身不训练模型权重。记忆标记为 `reference`，不能覆盖系统指令或权限。

### 知识库：原文证据在哪里

文档拆为标题、段落、页、幻灯片和工作表范围等节点。工具流程为 `knowledge_catalog` → `knowledge_browse` → `knowledge_read`，先定位再读取，证据带路径、格式相关定位和来源信息。

PDF 索引依赖文本层，不提供 OCR；旧 DOC/PPT 支持依赖本地转换工具；扫描、文件大小和输出均有边界。不能从支持 PDF/Office 推断任意文档都能完整解析。

## 5. 成本与上下文

| 机制 | 目的 | 不能据此承诺 |
| --- | --- | --- |
| 不变系统前缀、工具 schema 排序 | 减少缓存前缀漂移 | 各服务商都有相同缓存收益 |
| 工具结果与历史压缩 | 控制输入预算，保留高价值信息 | 摘要永远无损、长任务无限持续 |
| MCP 搜索与按需获取定义 | 避免每轮附带所有工具定义 | 工具发现永远正确 |
| 并行只读调用、顺序写回 | 减少等待并保持历史顺序稳定 | 所有动作都能并行 |
| 重复抑制、运行限制 | 降低无效循环风险 | 任务一定在预算内完成 |

上游文档有缓存实验数据，本研究未复现，因此不把其命中率写为我们的测量结果。

## 6. Graph 与 Loop

Graph 中，主 Agent 创建轻量任务意图，宿主补齐并校验任务图。调度器选择就绪节点、冻结执行权限，子 Agent 执行并上报。主 Agent 决定通过或修改，批准的数据结果交给下游，最后集成并统一交付。

关键在依赖和验收状态：模型声称完成不能直接令节点进入已验收状态。独立子任务适合并行；共享文件修改、集成与冲突仍需管理。多 Agent 数量本身不代表质量。

Loop 的关键是配置规则：条件循环把上一轮输出作为下一轮输入；遍历模式对每个元素运行循环体，可顺序或有限并行，并设错误策略与次数上限。循环体能组合 AI、条件判断、HTTP、代码等节点。

## 7. 文档差异与阅读注意点

1. **GUI/TUI 共用。** 首页概述共享运行时；详细架构描述默认所有权互斥，显式外部连接属于例外。本文按详细架构解释，未实测生命周期。
2. **Office 能力。** Design 文档提及 Work 导出格式，首页明确普通 Office 文件只读。进一步阅读发现 `kun/src/adapters/tool/ppt-agent-tool-provider.ts` 已有专用 PPT 创建／编辑／读取／复刻入口及受控导出。普通文档预览、生成新产物与专用 PPT 流程应分别理解，不能推断所有 Office 格式全面原地编辑。
3. **Loop 文件位置。** 文档指向 `workflow-runtime.ts` 的节点分支，当前入口已委托给 `WorkflowNodeExecutionService` 与图执行器等模块，应沿调用关系继续阅读。
4. **子 Agent 数量。** 角色目录和发现规则会演进，不把 README 中某个角色数量当作稳定契约。
5. **源码与发行版。** package.json 的版本号描述源码标记，不证明下载页的安装包已包含全部实现。
6. **扩展示例与默认打包。** `examples/extensions/kun-video-editor/README.md` 声称默认随包，但 `scripts/pack-bundled-extensions.mjs` 将视频编辑器与 presentation-studio 列为 retired；当前默认列表为 social-media-sidebar。网页据实际打包入口将前两者标为非默认源码示例。

展示、动画、PPT、媒体和扩展的补充研究入口见[网页来源与核对记录](web-guide.md)，完整分类见[网页手册](../app/index.html)。

## 8. 后续验证清单

以下均未执行：

- [ ] 一次性目录中只读检索，核对引用文件与内容。
- [ ] 修改小文件，查看 Diff，运行有明确预期的测试。
- [ ] 拒绝一次需审批动作，验证文件与外部状态未改变。
- [ ] 重启并续接任务，检查上下文与事件记录。
- [ ] 创建 HTML 原型，核对实际渲染和版本记录。
- [ ] 挂载文本 PDF、Markdown、表格，核对定位与原文。
- [ ] 用两个独立任务检查 Graph 验收和交接，再验证失败节点。
- [ ] 用有限列表验证 Loop 错误策略、停止条件和输出顺序。

每次记录系统、提交、模型、Provider、权限配置、输入、产物与失败证据。费用、Token、成功率只在实际运行并明确口径后比较。

[overview]: https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/README.md
[architecture]: https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/docs/kun-architecture.md
[design]: https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/docs/DESIGN_MODE.md
[graph]: https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/docs/graph-mode.md
[workflow]: https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/docs/workflow-loop.md
[memory]: https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/docs/memory-foundation.md
[knowledge]: https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/docs/knowledge-bases.md
[extensions]: https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/docs/extensions/README.md
[package]: https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/package.json
[execution]: https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/kun/src/loop/agent-loop-execution.ts
[step]: https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/kun/src/loop/model-step-service.ts
[round]: https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/kun/src/loop/model-round-engine.ts
[dispatch]: https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/kun/src/loop/tool-call-dispatcher.ts
[tool]: https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/kun/src/loop/tool-execution-service.ts
[host]: https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/kun/src/adapters/tool/local-tool-host-core.ts
[work]: https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/kun/src/loop/work-mode.ts
[memory-source]: https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/kun/src/adapters/hybrid/hybrid-memory-store.ts
[graph-source]: https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/kun/src/graph/graph-scheduler.ts
[workflow-source]: https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/src/main/workflow-runtime.ts
