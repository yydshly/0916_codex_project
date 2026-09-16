# Kun 全景理解图

日期：2026-09-17。图片为研究归纳示意，不是 Kun 应用截图；未运行 Kun，未做同任务性能比较。

## 阅读主线

1. 定位：类似 Codex 的 Agent 工作台；共同工作模式不表示具体实现相同。
2. 底层：模型与工具循环、上下文、编排、权限、存储、扩展。工程差异会影响效果，不只有外观差异。
3. 展示：16 类是本研究的界面与交互分类，不是官方智能指标，也不表示 16 项独有优势。图中按类别重排编号，与网页原来的排列顺序不同。
4. 对比：Pi 工具包与编程 CLI、Codex 和 Claude Code 的 Agent 产品、Kun 桌面工作台；比较定位，不评定优劣。
5. 意义：减少切换和返工的潜在产品价值，以及对开发者和研究者的参考价值。
6. 边界：预览、完整编辑、生成能力分别判断；媒体与文件工具链依赖配置和环境。
7. 结论：真实任务中的效率、正确率、人工介入和失败恢复，需要另行测试。

## 依据

- [Kun 固定研究提交](https://github.com/KunAgent/Kun/tree/e67f656bca573d5e6a4970a5094a30f3afd09011)
- [Kun 架构](https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/docs/kun-architecture.md)
- [结构化图表](https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/docs/conversation-charts.md)
- [Pi 终端组件接入](https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/docs/kun-tui.md)
- [Kun 许可证](https://github.com/KunAgent/Kun/blob/e67f656bca573d5e6a4970a5094a30f3afd09011/LICENSE)
- [Pi 官方仓库](https://github.com/earendil-works/pi)
- [Codex 官方权限文档](https://learn.chatgpt.com/docs/agent-approvals-security#common-sandbox-and-approval-combinations)
- [Claude Code 官方概述](https://code.claude.com/docs/en/overview)
- [本地完整来源清单](../app/sources.json)

“潜在价值”和研究意义是结合功能进行的分析，不属于实测结论。商业与内部使用按上游许可条款处理；图中许可说明仅概述仓库声明。

## 制作

曾使用内置 ImageGen 制作初稿，未使用 CLI 或外部 API。完整初始提示词见 [infographic-prompt.txt](infographic-prompt.txt)。初稿背景透明度影响阅读，编辑与重新生成两次请求均因图片服务网络错误失败，初稿未作为最终交付。

最终图由原创矢量排版直接生成，未修改或加工 ImageGen 初稿。交付 [PNG](../assets/kun-overview.png) 与 [SVG](../assets/kun-overview.svg)，画布为 2000 × 3980。已查看最终 PNG 并检查中文、分区和证据说明；脚本包含卡片文本高度检查。图中所有内容都是研究示意，不是运行截图。

本次补充模型接入分路：普通 API 与仓库的 ChatGPT HTTP 接入使用 Kun 循环；Claude 订阅由 Agent SDK 控制循环。见 [模型接入](model-access.md)。
