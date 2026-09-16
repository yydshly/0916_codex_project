# 思路与价值总览图：生成说明

- 日期：2026-09-17
- 方式：内置 imagegen；原创研究信息图，非运行截图。
- 原图：`../assets/understanding-guide.png`；网页使用同内容副本。
- 核对：六个步骤、失败反馈、资源边界、三类价值说明及低优先级结论均已可视检查。
- 研究依据：上游固定版本 ec6046726e750dc56ccbeb12d443fe2bb53fd925；项目内 sources.json。
- Codex 对照依据：[官方工作流说明](https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex)。Codex 支持项目指导文件；额外计划文件属于可选约定。图中的价值高低为结合当前仓库使用方式的研究判断。

## 生成提示

Create one polished Chinese infographic / research summary poster. It must be a single complete image explaining automata/aicodeguide's thinking and value. Landscape 3:2 composition, approximately 3072×2048 pixels or highest feasible resolution. Sharp, large, highly legible simplified Chinese typography; precise copy, ample spacing, no clipped text. Warm off-white background #f4f3ec, forest green #25634d, pale lime #d8eb98, muted gray, small orange annotations. Editorial information design, thin lines, clean rounded rectangles. No decorative scenes, robots, stock imagery, logos, stars/ratings, fake performance numbers or mock software screenshots. Actual process arrows and explicit ownership distinctions.

Use this exact Chinese content, organized into clear hierarchy. The visual should explain the practical workflow and be honest about modest incremental value. Main text should be large and no important copy omitted. This is our research interpretation, not an official capability/product diagram.

TOP HEADER:
"AI Code Guide：思路与价值总览"
subtitle "一本面向人的 AI 编程指南｜方法、提示示例与工具导航"
small label "研究版本 ec60467 · README 文档型项目"
prominent thesis "把模糊想法，整理成有上下文、可执行、可验证的任务。"

SECTION 1, a slim starting band:
"先确定起点"
"你提供：目标用户、需求、约束、已有项目"
"你选择：在线构建工具 / AI 编辑器 / 命令行 Agent"
Connect this band to the main process below. Tools are external, never imply installed or provided by this repository.

SECTION 2, main dominant horizontal six-step flow. Six equal columns from left to right, clearly numbered, each containing a title, action, output, purpose. Connect with forward arrows. Use column text exactly:
01
"澄清需求"
"问清功能、边界与非目标"
"产物：需求文档 PRD"
"作用：减少歧义"
02
"拆分任务"
"按依赖拆成可完成的小步"
"产物：任务清单"
"作用：控制范围"
03
"约定规则"
"交代目录、技术栈与检查方法"
"产物：AGENTS.md 等项目说明"
"作用：保留上下文"
04
"逐项实现"
"让外部编程工具读取背景、修改代码"
"产物：代码与变更"
"作用：把任务落地"
05
"验证结果"
"对照需求，运行测试并审查"
"产物：验证证据与问题清单"
"作用：判断是否完成"
06
"记录与交接"
"保留设计意图、结果和未完成项"
"产物：项目记录"
"作用：方便后续维护"

Draw a distinct return arrow from 05 toward 01–04, below the steps, labeled:
"失败或偏离预期 → 核对需求 / 补充上下文 / 修复实现 → 再验证"
Add small note:
"六步为本研究归纳；交接记录是对原文“保存设计意图”的应用。"

SECTION 3, supporting resource strip, subordinate visual weight:
"配套知识"
"概念：AI 辅助 / Vibe Coding / Agent"
"资源：工具目录 / 提示示例 / 外部教程"
"进阶：MCP、Agent 构建与多 Agent 编排"
"这些是介绍与链接，需要另行选择和配置工具。"

SECTION 4, three value columns side by side, clear audience contrast, no numeric scoring:
A:
"对新手的价值"
"建立全貌，找到起点"
"学会说清需求、分步推进和检查结果"
"价值主要在学习与方法整理"
B:
"对我们当前 Codex 工作方式的价值"
"规划、读写代码、调试与测试已有能力支持"
"项目规则也已在使用"
"新增价值有限：主要作为参考资料"
C:
"仍需要人提供的内容"
"业务目标与优先级"
"项目约束和验收标准"
"关键取舍与最终结果判断"
"工具具备能力，不等于每次都会自动做对"

BOTTOM CONCLUSION BAND, high readability:
"研究判断：低优先级参考，无独立功能可直接集成或复刻。"
under it:
"库提供方法；人确定目标与标准；外部 AI 工具执行。"
small honest boundary:
"不包含模型、执行器或部署服务；未验证效率提升或模型效果。"
footer:
"来源：github.com/automata/aicodeguide · ec60467 · 2026-09-17"
"原创研究整理，非官方界面；不代表已运行文中工具。"

Maintain perfect Chinese readability. Do not invent claims or label tools as guaranteed autonomous. All six steps and feedback arrow must be clearly visible. Balance diagram with substantive value assessment rather than a promotional poster.
