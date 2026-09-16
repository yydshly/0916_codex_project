# 我们对 Kun 的理解

研究日期：2026-09-17；固定提交：`e67f656bca573d5e6a4970a5094a30f3afd09011`。本文归纳讨论及关键源码阅读，不是实际运行、性能排名或迁移建议。

## 一句话定位

Kun 是类似 Codex 的 Agent 工作台：上层组织任务、工具、成果预览和部分编辑；底层既有自有 Agent 循环，也能整合外部 Agent SDK。它的潜在价值在于工作流程的整合体验，以及可供研究的产品与工程实现。

## 共同模式不代表完全重复

Kun、Pi、Codex、Claude Code 都涉及模型理解任务、调用工具、读取执行结果和继续推进，最终任务能力有很大重叠。但模型路由、上下文、权限、调度、恢复和界面实现并不相同，因此既不能说只是换皮，也不能凭功能名称认定 Kun 全面更强。

| 对象 | 主要形态与定位 | 对我们更直接的研究意义 |
| --- | --- | --- |
| Kun | 桌面工作台、自有运行时、部分外部执行引擎接入 | 成果界面、任务流程与工具整合 |
| Pi | Agent 工具包、模型接口、运行时与编程 CLI | 可组合的执行基础设施和扩展 |
| Codex | 编程 Agent / 工作台 | 真实任务完成体验、工具和权限边界 |
| Claude Code | 多入口编程 Agent，另有 Agent SDK | 开发流程与可嵌入的执行能力 |

这不是排他性功能矩阵，也不是性能排名。Kun 使用 `pi-tui` 终端组件，不能据此推断整个运行时建立在 Pi 之上。Claude 订阅路线则有明确的 Agent SDK 集成；两种依赖不能混淆。

依据：[Pi](https://github.com/earendil-works/pi)、[Codex](https://learn.chatgpt.com/docs/agent-approvals-security#common-sandbox-and-approval-combinations)、[Claude Code](https://code.claude.com/docs/en/overview)、[Kun TUI](https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/docs/kun-tui.md)、[模型接入细解](model-access.md)。

## 16 类展示到底是什么

“16”是本研究对界面能力的归类数量，不是官方智能指标、独有能力数量或优越性证据。

- 内容呈现：Markdown、公式、代码、图表、网页、PDF/Word、表格、PPT、图片与音视频。
- 可操作界面：白板、画布、时间轴、SVG、设计节点图；其交互能力由应用组件实现。
- 执行过程：终端、差异、工具调用、任务、Agent 图和运行追踪；来自运行记录，而非模型虚构。
- 外观扩展：主题、角色、Webview 与侧栏；主要是产品界面与扩展机制。

模型输出数据和 ChartSpec 后，由 Kun 校验和渲染图表，提供提示、数据表或导出。这增加了软件交互能力，不会自动提高模型的分析正确率。能生成文件、能预览文件和能完整编辑文件是三个层次。PPT 预览不等于拥有 PowerPoint 的全部能力，媒体播放也不等于自带媒体生成模型。

依据：[图表契约](https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/docs/conversation-charts.md)、[完整展示目录](../app/index.html#display)。

## 价值在哪里

入口和展示有价值，但更有意义的潜在链路是：生成 → 预览 → 定位问题 → 修改 → 继续执行 → 交付。部分环节有源码实现；它们能否准确共享上下文、保留用户修改并顺畅完成任务，需要实测。

对使用者，观察它能否减少工具切换、沟通和返工；对开发者，研究桌面 UI、编辑器、运行时和扩展如何连接；对研究者，区分模型、工具和产品各自贡献，并建立任务评测。

我们已有 Codex 等工具时，不因“功能多”而迁移。相同任务应比较正确率、完成时间、费用、人工介入、文件兼容性和失败恢复；目前没有证据证明 Kun 是更好的替代品。作为自建领域 Agent 工作台的设计和工程参考，其意义可能更直接。

## 边界

本地工作台不表示所有数据都在本机处理；选择远程模型时，请求会发往对应服务。账号接入、订阅、文件转换和媒体生成都依赖相应供应商、配置与环境。源码存在不代表当前账号可用，能力预设也不是效果保证。上游为 PolyForm Noncommercial，商业及内部使用按仓库授权声明处理。

见[完整引导图](../assets/kun-overview.png)、[模型接入细解](model-access.md)、[许可证](https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/LICENSE)。
