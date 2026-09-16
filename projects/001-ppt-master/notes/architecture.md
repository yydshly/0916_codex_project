# PPT Master：源码与实验笔记

研究版本：[52a2801c27cb468d7ea95e25c7b0702eaa360914](https://github.com/hugohe3/ppt-master/tree/52a2801c27cb468d7ea95e25c7b0702eaa360914)。记录日期：2026-09-16。

## 系统分工

PPT Master 提供 Agent 工作流、约束、模板与本地工具链。驱动它的大模型负责理解材料、规划叙事、选择视觉表达并编写 SVG；Python 代码负责解析、验证和打包。

```text
文档 / 网页 / 主题
  → source_to_md：内容提取
  → Strategist：design_spec.md + spec_lock.md
  → Executor：svg_output/*.svg
  → svg_quality_checker：格式与工程约束
  → svg_to_pptx：DrawingML / Chart / Table / OMML
  → PPTX 文件与验证报告
```

角色是工作流的责任划分，不意味着必须部署多个独立模型。本次实验从编写 SVG 开始，使用 Quick 导出接口，不覆盖材料理解、事实研究、策划确认和素材获取。

## 源码入口

下列相对路径均位于上游 `skills/ppt-master/`：

| 模块 | 路径 | 责任 |
| --- | --- | --- |
| 输入分派 | `scripts/source_to_md/_dispatcher.py` | 按类型选择解析器 |
| 工作流入口 | `SKILL.md`、`workflows/` | 生成、模板创建或原生编辑流程 |
| SVG 检查 | `scripts/svg_quality/checker.py` | 检查约定、数据标记和布局相关约束 |
| 图形转换 | `scripts/svg_to_pptx/drawingml/converter.py` | 将元素分派到文字、路径、图片等转换器 |
| 原生对象 | `scripts/svg_to_pptx/native_objects/` | 图表、表格和 Office Math |
| 图表工作簿 | `scripts/svg_to_pptx/native_objects/workbook.py` | 建立嵌入的 Excel 数据工作簿 |
| 文件打包 | `scripts/svg_to_pptx/pptx_package/builder.py` | 组合幻灯片、母版、关系、媒体、备注等 |
| 原生往返编辑 | `scripts/authoring_roundtrip.py` | 恢复未修改对象，转换已修改内容 |

## 对照实验

同一套五页 SVG 分别通过默认形状出口与 `--native-charts-and-tables` 出口导出。

| 对照项 | 形状版 | 原生数据版 |
| --- | --- | --- |
| 第 3 页：柱状图 | 35 个 `p:sp`，0 个 Chart | 11 个 `p:sp`，1 个 Chart |
| 第 4 页：表格 | 35 个 `p:sp`，0 个 Table | 5 个 `p:sp`，1 个 Table |
| 第 5 页：公式 | 1 个 `m:oMath` | 1 个 `m:oMath` |
| 内嵌 XLSX | 0 | 1 |
| 每份 PPT 的图片对象 | 0 | 0 |
| 备注页 / 淡化切换 | 5 / 5 | 5 / 5 |

计数来自实际 OOXML 包，`p:sp` 包含文字与普通形状，不能解读成纯几何图形数量；公式数量与形状数量不是互斥分类。完整计数及 SHA-256 见 [结构报告](../app/evidence.json)。

两份文件均通过 Microsoft PowerPoint 16.0 打开，每页渲染为 1600×900 PNG。渲染记录带有输入文件哈希，见 [渲染证据](../app/render-evidence.json)。浏览器展示该 PNG；源 SVG 预览与 PowerPoint 最终效果可能不同，特别是公式。

## 已观察到的边界

- 检查通过，但有 10 条非阻断性建议：缺少页面角色元数据，以及建议将逻辑单元分组。导出报告为 `passed-with-warnings`；没有关闭或绕过检查。
- 原生数据版图表由 PowerPoint 重新排版。两个出口都可编辑，但不承诺逐像素一致。
- 流程图箭头是线与路径，未建立自动吸附连接器关系；移动节点后需调整连线。
- 可编辑结构经过文件检查；没有把浏览器 PNG 当作可编辑性的证据。
- 数据 `32, 48, 61, 80` 为演示构造，不代表真实业务表现。
- 未覆盖主题研究、AI 图片、图片还原、母版复用、原稿编辑、语音旁白或复杂对象动画。
- 写入了淡化切换与备注，验证了包结构；静态截图不能证明动画播放效果。

## 参考

- [技术设计](https://github.com/hugohe3/ppt-master/blob/52a2801c27cb468d7ea95e25c7b0702eaa360914/docs/technical-design.md)
- [PowerPoint 能力映射](https://github.com/hugohe3/ppt-master/blob/52a2801c27cb468d7ea95e25c7b0702eaa360914/docs/powerpoint-svg-mapping.md)
- [官方案例库](https://github.com/hugohe3/ppt-master-examples/tree/3adb91f1d3226f5a48c2df1d10e1f3f37a246a87)
