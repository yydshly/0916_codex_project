# 源码阅读：从页面观测到设计推断

基准：`Manavarya09/design-extract@47f75bb68cd6fcb51c172868a3a1b814cd6bdeb4`，包版本 `13.3.0`。源码链接均固定到该提交。

## 数据流与入口

| 模块 | 责任 | 证据 |
| --- | --- | --- |
| CLI 编排 | 参数解析、提取、额外捕获、导出和子命令 | [bin/design-extract.js](https://github.com/Manavarya09/design-extract/blob/47f75bb68cd6fcb51c172868a3a1b814cd6bdeb4/bin/design-extract.js) |
| 浏览器启动 | 优先 Playwright 浏览器，缺失时尝试系统 Chrome | [src/browser.js](https://github.com/Manavarya09/design-extract/blob/47f75bb68cd6fcb51c172868a3a1b814cd6bdeb4/src/browser.js) |
| 页面采集 | 导航、等待、DOM、计算样式、CSS 规则、明暗模式 | [src/crawler.js](https://github.com/Manavarya09/design-extract/blob/47f75bb68cd6fcb51c172868a3a1b814cd6bdeb4/src/crawler.js) |
| 设计对象 | 调用各提取器，汇总 colors / typography / spacing / layout 等 | [src/index.js](https://github.com/Manavarya09/design-extract/blob/47f75bb68cd6fcb51c172868a3a1b814cd6bdeb4/src/index.js) |
| 程序 API | extract、render、renderAll、30 个注册导出器 | [src/api.js](https://github.com/Manavarya09/design-extract/blob/47f75bb68cd6fcb51c172868a3a1b814cd6bdeb4/src/api.js) |
| 模型辅助 | 有 --smart 和可用配置时，补充低置信度分类 | [src/classifiers/smart.js](https://github.com/Manavarya09/design-extract/blob/47f75bb68cd6fcb51c172868a3a1b814cd6bdeb4/src/classifiers/smart.js) |
| 复刻模板 | 按 sectionRoles 等选择模板，再填入设计值 | [src/clone.js](https://github.com/Manavarya09/design-extract/blob/47f75bb68cd6fcb51c172868a3a1b814cd6bdeb4/src/clone.js) |
| MCP | 异步提取、任务状态、变量查询、导出和计算差异 | [src/mcp/extract-tools.js](https://github.com/Manavarya09/design-extract/blob/47f75bb68cd6fcb51c172868a3a1b814cd6bdeb4/src/mcp/extract-tools.js) |

API `extract()` 会移除内部 `_raw`。CLI 在它之外编排响应式、交互等额外功能；不能假定把任意 CLI 开关传给 API 就会执行相同流程。本实验分别调用基础 API、响应式函数和交互函数，再独立运行一次基础 CLI。

## 三种不同可信度的数据

1. **观测数据**：浏览器当前视口下的计算样式，例如字号 48px、背景色 #2563eb。它是运行时值，未必保留作者原始 CSS 的单位和组织方式。
2. **归纳数据**：颜色聚类、间距尺度、主色 / 正文色、页面角色等。它们由频率、面积、DOM 标签、类名等线索推断，可能误判或丢失细节。
3. **生成数据**：新色阶、规则文本、主题配置、模板文案和起始页面。它们服务于再利用，不保证每个值都在原页面出现过。

不能把导出成功或质量评分很高当成完整恢复了作者设计系统。

## 已复现问题

### 间距聚类会遗漏关键尺寸

[spacing.js](https://github.com/Manavarya09/design-extract/blob/47f75bb68cd6fcb51c172868a3a1b814cd6bdeb4/src/extractors/spacing.js) 先收集正间距并四舍五入，再用相邻差值的中位数划分簇，取每簇最小值，交给 `detectScale` 归纳。

本样本原始间距为 `[8,12,16,24,32,40,80]`，该路径输出 `[8,80]`。24px 确实被采集，但没有保留在归纳尺度中。修复思路是同时保留观测频率、布局角色与建议尺度，避免只保留代表值；本轮没有改上游代码。

### 正文颜色按列表顺序选取

[design-md.js](https://github.com/Manavarya09/design-extract/blob/47f75bb68cd6fcb51c172868a3a1b814cd6bdeb4/src/formatters/design-md.js) 的 foreground 使用 `colors.text[0]`；[dtcg-tokens.js](https://github.com/Manavarya09/design-extract/blob/47f75bb68cd6fcb51c172868a3a1b814cd6bdeb4/src/formatters/dtcg-tokens.js) 的正文色引用 `primitive.color.text.text0`。

本样本第一项是黑色，body 文字为 #0f172a。主色识别正确不能推出所有语义角色正确。修复思路是优先采集 body / 主要正文节点，结合文本长度、可见区域权重并保留来源。

### 交互采样固定等待 100ms

[interactions.js](https://github.com/Manavarya09/design-extract/blob/47f75bb68cd6fcb51c172868a3a1b814cd6bdeb4/src/extractors/interactions.js) 在 hover / focus 后等待 100ms，然后读取样式。本样本 80ms 动画可取到终态，400ms 动画则取到过渡值。

实验另用浏览器等待 500ms 获取终态对照。该问题在两次实验中均出现。中间色随机器时序可能变化。修复思路是监听有限动画结束，或在合理超时内检测样式稳定。

### clone 使用固定模板

`generateClone()` 按区域顺序从 `renderHero`、`renderFeatures` 等模板生成 Next.js 文件；没有可用区域时使用预设列表。本样本生成 `hero → feature-grid → footer`。

模板代码包含预写的特性介绍、统计数字和推荐语。本次生成页面实际检测到原测试页不存在的模板句子。由此确认其定位是设计参数驱动的起始页面，不能据它宣称目标站点的文案和数据。测试只核验生成文件与内容，没有运行 Next.js 构建或测量最终视觉相似度。

## 其他源码边界

- 采集设置 `MAX_ELEMENTS = 5000`；部分子功能另有更小上限。超大页面的结果不能理解为穷尽全部元素。
- 响应式宽度固定为 375、768、1280、1920px。本样本 CSS 断点是 700px，而变化报告是 `375px → 768px` 采样区间；原始 CSS 断点提取是另一项数据。
- [accessibility.js](https://github.com/Manavarya09/design-extract/blob/47f75bb68cd6fcb51c172868a3a1b814cd6bdeb4/src/extractors/accessibility.js) 跳过前景或背景 alpha 小于 0.9 的组合。对比度评分不覆盖完整无障碍要求。
- `safeExtract` 允许失败时降级；`renderAll()` 捕获部分导出错误并跳过。集成应核对字段与期望文件是否存在。本实验逐一调用 30 个 `render()`，分别记录成功 / 错误。
- DTCG 输出实际顶层为 `$metadata`、`primitive`、`semantic`；复合 typography 值位于 semantic 内，不是单独的 composite 顶层。
- token 输出的 `$metadata.version` 写死为 `7.0.0`，而 package.json 为 `13.3.0`。复现以 Git 提交、package.json 和锁文件哈希为准，不凭该字段推断安装版本。
- 30 个 API 导出器与 CLI 的 34 个顶层输出是不同口径。部分导出器返回多文件对象，不能把 30 个导出器表述成只生成 30 个文件。

## 集成建议

先在已知页面校验基础读数，再将原始观测和整理后的变量一起交给开发工具。人工确认正文色、品牌色、间距尺度及组件角色后再写入项目。需要网页复刻时，另行验证布局、文案、业务行为和视觉差异。

MCP 适合让 Agent 查询结构化结果，但接入 MCP 本身不会提高提取准确率。整站合并、外部真实网站、原生端编译和模型分类应作为后续独立验证项。
