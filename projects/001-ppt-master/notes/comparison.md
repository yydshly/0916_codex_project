# 与既有 PPT 研究的对比

整理日期：2026-09-16。按历史固定版本与已保存实验比较，不是同一输入、同一模型下的性能或审美排名。

## 找到的相关研究

| 项目 | 既有研究 | 固定版本 |
| --- | --- | --- |
| Dashi PPT Skill | 2026-08-30 开始，2026-09-10 更新；两轮真实生成实验 | `0.4.11` / `7cb23347f91cda1a5519eafc8c040704e389535a` |
| Ian Handdrawn PPT | 2026-09-09；4 张原作者图片、4 张本地真实生成图片 | `b2cc5f303337e5470fd6ac2870d261a43b218439` |
| PPT Master | 本子项目；五页 SVG、两种 PPTX 出口、PowerPoint 实际渲染 | `52a2801c27cb468d7ea95e25c7b0702eaa360914` |

最直接的同类是 Dashi，两者均以 Agent 协助生产可继续编辑的演示文稿。Ian 的目标更侧重一套连贯的手绘解释图。

## 能力与机制

| 维度 | Dashi PPT Skill | PPT Master | Ian Handdrawn PPT |
| --- | --- | --- | --- |
| 主路径 | 主题组件 + 内容绑定 + 页面装配 | AI 页面设计 + SVG 编译 | 内容规划 + 风格约束 + 整页生图 |
| 中间表示 | JSON 内容 / props / composition → React、HTML、DOM | 受约束 SVG + 原生数据标记 + 配套文件 | 逐页规划、提示词、风格参考图 |
| 交付重点 | 浏览器可编辑演示，另导出 HTML / PDF / PPTX | PowerPoint 原生 PPTX，附页面预览 | 整页 PNG、缩略总览和规划摘要 |
| 设计自由 | v1–v3 使用既定组件；v4 在网格、构图和主题规则内编排 | 在支持的 SVG 与原生对象映射范围内设计，也支持模板 | 由图像模型按手绘参考与规则绘制 |
| 修改方式 | 浏览器控制台改字、换图、调模块；导出后可改部分原生对象 | 修改源 SVG / 重新导出，或在 PowerPoint 中编辑对象 | 通常重新生图或局部图像修改，文字不能独立编辑 |
| 图表 | 本地能源案例的图表采用 SVG/图片回退，标签可编辑 | 本地样例导出真实 Chart 与内嵌 XLSX；须启用原生数据出口 | 图表与文字画在整页图中，无底层数据对象 |
| 特色 | 固定内容产生 3 个模板候选 + 1 个受约束定制候选；重视分配与重放 | 原生形状、图表、表格、公式及 PPTX 包结构 | 手绘视觉、语义版式与连续解释 |
| 主要检查点 | 网页正确不等于 PPT 正确，复杂部分可能截图回退 | SVG 检查不等于事实和审美正确；原生图表样式可能变化 | 中文准确性、逻辑关系、多页风格与返工成本 |

这不是“Dashi 只有模板、PPT Master 只有自由设计”的绝对二分。Dashi 有受约束定制，PPT Master 也有模板与原生编辑路径；比较的是主要工作方式及我们已验证的范围。

## 实验证据怎样支持结论

### Dashi

第二轮园区能源试点使用 8 页逻辑内容，生成 32 页候选，再选出 8 页 v4。精选稿包含 115 个文字、78 个形状、10 个图像对象。图表走 SVG/图像回退，10 个图表标签提取为文字；当时对照的直接编程基线才含 1 个原生图表，不能把该基线能力归给 Dashi。

固定主题近似了请求品牌，未精确实现全部品牌色。说明 Dashi 更值得借鉴的是可执行模板、内容绑定和候选生产，不是“任意品牌自动精确还原”。

### PPT Master

本次五页样例的原生数据版包含 1 个 Chart、1 个内嵌 XLSX、1 张 Table 和 1 个 Office Math；五页均无图片对象。两份 PPTX 都由 PowerPoint 打开并渲染。

这验证了原生对象转换能力，没有验证模型端到端策划、任意输入排版质量、旁白、模板复用等全部工作流。示例没有图片，也不能据此宣称所有项目都会没有图片。

### Ian

此前按固定 Skill 规则、参考图与逐页提示词，真实生成了 4 张“开源项目如何成为知识”的场景图片，另保存 4 张上游原作作为参照。交付是整页 PNG，未实现文字与插图分层或可编辑 PPTX。

## 对我们的选择建议

- 经常更新数据、修改公式、交给同事继续编辑的研究报告：优先评估 PPT Master 的原生对象路线。
- 高频同类汇报、希望从多套方案选稿、接受预设视觉系统：优先评估 Dashi；长期投入应放在自己的模板、字段与容量规则。
- 技术科普、文章解释图、课程概念卡片，视觉表达优先且修改频率较低：Ian 的整页生图路线更贴近目标。
- 如目标是 AI 老师讲解、追问、测验和交互实验，另有此前研究的 OpenMAIC。它以课程与教学动作的运行平台为核心，不能仅按 PPT 导出工具比较。

以上属于基于机制和已有实验的适用性判断。未进行三者同题生成，没有可信的速度、Token 成本、人工修改量或美观度排名。

可以探索组合：借鉴 Dashi 的内容与容量约束，使用 PPT Master 输出原生对象，将 Ian 用于少量解释插画。此组合尚未实现；不能假设三者的数据格式可直接互通。

## 可回看的证据

- [Dashi 既有研究页](https://github.com/yydshly/0830_1_codex_project/tree/main/projects/dashi-ppt-skill-study)
- [Dashi 第二轮实验报告](https://github.com/yydshly/0830_1_codex_project/blob/main/projects/dashi-ppt-skill-study/experiments/real-run-02-brand-media/experiment-report.json)
- [Dashi 效果展厅](https://yydshly.github.io/0830_1_codex_project/projects/dashi-ppt-skill-study/showcase/)
- [Ian 既有研究页](https://github.com/yydshly/0909_codex_project/tree/main/projects/004-ian-handdrawn-ppt)
- [Ian 生成验证记录](https://github.com/yydshly/0909_codex_project/blob/main/projects/004-ian-handdrawn-ppt/web/data/verification.json)
- [Ian 效果展厅](https://yydshly.github.io/0909_codex_project/projects/004-ian-handdrawn-ppt/)
- [本次 PPT Master 文件证据](../app/evidence.json)与[渲染证据](../app/render-evidence.json)
- [OpenMAIC 既有研究](https://yydshly.github.io/0912_codex_project/005-openmaic/)
- 当前上游定位核对：[Dashi](https://github.com/chuspeeism/dashi-ppt-skill)、[Ian](https://github.com/helloianneo/ian-handdrawn-ppt)。具体实测结论仍以上述固定版本为准。
