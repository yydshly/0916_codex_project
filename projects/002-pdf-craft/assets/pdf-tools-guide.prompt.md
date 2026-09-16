# PDF 工具引导图生成记录

- 日期：2026-09-16
- 工具：内置 imagegen；未使用 CLI。
- 输出：`pdf-tools-guide.png`
- 复核：图中文字可读，转换箭头以 PDF 为中心，区分两库用途，包含非实测边界。

## 完整提示词

```text
Use case: infographic-diagram
Asset type: Chinese GitHub README research guide, one polished standalone infographic. Generate a high-resolution portrait image, aspect ratio about 4:5, generous margins, crisp simplified Chinese typography with large readable text. White/off-white background, dark navy headings, teal for Stirling-PDF and blue for PDF Craft, small restrained amber limitation notes. Editorial technical infographic with clear modular panels, simple document icons and precise arrows, no screenshots or fake interfaces, no ornamental clutter.
Primary request: Explain why to remember Stirling-PDF as a reference library inside an existing PDF Craft research project. Emphasize format conversion, broad PDF tools, private deployment and automation. Distinguish document processing from OCR accuracy. Do not claim arbitrary pairwise format conversion.
Render the following exact Chinese content clearly, verbatim, with hierarchy:
Title: "PDF 工具参考"
Subtitle: "格式转换与日常处理 · 扫描书结构重建"
Main upper panel (about half the infographic):
"Stirling-PDF"
"可自建的 PDF 处理工具箱"
Three compact workflow blocks with correct directed arrows:
"Office / 图片 / 网页" → "PDF" → "Word / 图片 / Markdown"
Small caption directly under the arrows: "不同方向的转换效果与条件不同"
Four capability tiles:
"格式转换" / "以 PDF 为中心的多格式转换"
"页面整理" / "合并 · 拆分 · 排序"
"文件优化" / "压缩 · 加密 · 签署"
"批量处理" / "网页操作 · API · 流水线"
Value strip: "适合：日常办公、企业内网、业务系统集成"
OCR note: "OCR：生成可搜索文字；复杂表格、公式与手写有边界"
Lower panel (about quarter infographic):
"PDF Craft"
"扫描文档与书籍重建"
"扫描 PDF → OCR 与版面识别 → 段落 / 章节 / 目录 → Markdown / EPUB"
"适合：扫描书重排、内容整理、翻译输出"
Bottom takeaway:
"按任务选择"
"格式转换与通用操作，参考 Stirling-PDF"
"扫描书结构重建与输出，参考 PDF Craft"
Footnote: "两者均依赖外部识别引擎，未做准确率对比实测"
Source footer in small but legible type:
"github.com/Stirling-Tools/Stirling-PDF"
"github.com/oomol-lab/pdf-craft"
"研究导读 · 2026-09-16 · 非运行截图"
Constraints: no numerical scores, no accuracy rankings, no invented claims, no implication that workflows between these two projects have been integrated or tested. All main text must be readable at GitHub README display width. Use negative space and typography rather than dense prose.
```
