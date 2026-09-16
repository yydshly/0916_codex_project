# 002 · PDF Craft 扫描文档重建研究

> 复用成熟 OCR，重建书籍结构并输出 Markdown、EPUB 或译文 PDF。价值主要在工程集成；本次完成文档与源码研究，未做转换实测，暂不继续深挖。

[返回项目索引](../../README.md#项目索引) · [上游源库](https://github.com/oomol-lab/pdf-craft) · [高清总览图](assets/overview.png)

| 项目资料 | 内容 |
| --- | --- |
| 上游仓库 | [oomol-lab/pdf-craft](https://github.com/oomol-lab/pdf-craft) |
| 研究版本 | 源码标记 2.3.1；[commit 0846291e32eee107f2c17341b7b14113b99645c5](https://github.com/oomol-lab/pdf-craft/tree/0846291e32eee107f2c17341b7b14113b99645c5) |
| 原始许可证 | [MIT](https://github.com/oomol-lab/pdf-craft/blob/0846291e32eee107f2c17341b7b14113b99645c5/LICENSE)，依赖与模型另遵循各自许可证 |
| 发现渠道 / 日期 | 用户提供 GitHub 链接 / 2026-09-16 |
| 状态 | 已归档：保留技术摘要，后续研究优先级较低 |
| 验证范围 | 官方文档与关键源码阅读；未运行 OCR、转换、翻译样本，无部署演示 |

## 一图导读

[![PDF Craft 能力总览：OCR 接入、处理流程、结构重建、输出效果、局限与研究优先级](assets/overview.png)](assets/overview.png)

上图为本次研究绘制的信息图，**不是运行截图或实测效果图**。图片作为首页主预览，由根目录 `projects.json` 的 `cover` 字段关联。[图片说明](assets/README.md)

## PDF 工具参考

需要以 PDF 为中心的格式转换、合并拆分、压缩或批量处理时，可参考 [Stirling-PDF](https://github.com/Stirling-Tools/Stirling-PDF)；需要扫描书的段落、章节、目录重建及 EPUB 输出时，可参考 PDF Craft。格式转换是 Stirling-PDF 的重要能力，其完整定位是可自建的 PDF 处理工具箱。不同转换方向的效果与条件不同，不能理解为任意格式都可无损互转。

[![PDF 工具引导图：Stirling-PDF 的格式转换与通用处理，以及 PDF Craft 的扫描书结构重建与输出](assets/pdf-tools-guide.png)](assets/pdf-tools-guide.png)

本图作为原有总览图之后的补充引导，帮助后续按任务找到参考项目；首页通过 `projects.json` 的 `guides` 字段追加展示。不是运行截图或准确率对比。[Stirling-PDF 简述与依据](#相关项目简述stirling-pdf) · [图片说明](assets/README.md)

## 定位与核心价值

核心流程为：**PDF 页面 → 渲染成图片 → OCR 文字与版面识别 → 结构重建 → 导出 / 翻译**。

“调用外部 OCR”指复用其他项目的模型，既可本地运行，也可使用远程服务。它完善的主要是识别后的文档组织和交付流程；文字识别准确率主要来自 OCR 模型与输入质量。

| 比较对象 | PDF Craft 增加的价值 |
| --- | --- |
| 基础文字 OCR | 段落、章节、目录、脚注与图表组织，以及成品文档输出 |
| 现代文档解析工具 | 更偏向整本扫描书、EPUB 和翻译工作流；其他工具也可能具备类似能力 |
| 直接调用同一 OCR 模型 | 减少自行搭建后处理及导出流程的工作，不能据此认定文字识别更准确 |

本次未做横向性能比较，不给出优于其他 OCR 或解析工具的结论。

## OCR 接入范围

| 官方内置模型 | 本地配置 | 远程配置 |
| --- | --- | --- |
| DeepSeek OCR | `DeepSeekOCRLocalConfig` | `DeepSeekOCRVendorConfig` |
| DeepSeek OCR 2 | `DeepSeekOCR2LocalConfig` | `DeepSeekOCR2VendorConfig` |
| 百度 Unlimited OCR | `UnlimitedOCRLocalConfig` | `UnlimitedOCRVendorConfig` |

- 本地模式：需要 NVIDIA GPU、CUDA、足够显存及模型文件，使用 `pdf-craft[local]` 可选依赖。
- 远程模式：无需本地 CUDA，需要有效服务地址与凭据，页面会发送到配置的服务端。
- 一次运行选择一个后端；当前为三类模型、六种配置。
- DeepSeek 远程服务必须实际提供兼容的 OCR 模型；接口兼容不等于任意视觉模型都能直接替换。
- 当前没有 PaddleOCR、Tesseract、腾讯 OCR 等的现成官方配置，新增后端需开发适配。

依据：[OCR 配置文档](https://github.com/oomol-lab/pdf-craft/blob/0846291e32eee107f2c17341b7b14113b99645c5/docs/zh-CN/OCR_BACKENDS.md)、[接入实现](https://github.com/oomol-lab/pdf-craft/blob/0846291e32eee107f2c17341b7b14113b99645c5/pdf_craft/pdf/page_extractor.py)。

## OCR 之后支持哪些处理

| 阶段 | 处理内容 | 文本大模型要求 |
| --- | --- | --- |
| 结果清理 | 归一化文字与坐标，过滤明显重复输出，保存裁剪资源 | 不需要 |
| 段落重建 | 尝试拼接跨页、跨栏等断开的段落，处理英文断词 | 不需要，依靠规则判断 |
| 章节与目录 | 检测目录线索，分析标题层级，组织章节 | 基础统计方法不需要，可选 LLM 增强 |
| 脚注与图表 | 组织脚注、插图、图注、表格及说明 | 不需要，依赖 OCR 质量 |
| 表格与公式输出 | EPUB 表格可用 HTML 或截图；公式可用 MathML、SVG 或截图 | 不需要 |
| 书籍信息 | 手填书名、作者、出版社等，或依据前部页面 OCR 自动抽取 | 自动抽取需单独配置 metadata LLM |
| 翻译 | 转换时翻译，或翻译已有 EPUB；支持单语 / 双语 | 内置翻译流程需要文本 LLM |
| PDF 回填 | 根据原位置覆盖文字区域，再重新排版译文 | 排版本身不需要，前面的翻译需要 |
| 结果复用 | 保存 `.pcex`，供后续渲染、翻译与追溯 | 不需要 |

**并非全部默认开启：**脚注、封面、目录页检测和书籍信息自动抽取需要显式设置；OCR、目录增强、元信息抽取和翻译是不同配置边界。

依据：[API 参考](https://github.com/oomol-lab/pdf-craft/blob/0846291e32eee107f2c17341b7b14113b99645c5/docs/zh-CN/API_REFERENCE.md)、[转换与输出选项](https://github.com/oomol-lab/pdf-craft/blob/0846291e32eee107f2c17341b7b14113b99645c5/docs/zh-CN/PDF_TRANSLATION.md)、[EPUB 翻译](https://github.com/oomol-lab/pdf-craft/blob/0846291e32eee107f2c17341b7b14113b99645c5/docs/zh-CN/EPUB_TRANSLATION.md)。

## 实现原理与可参考设计

1. **页面渲染与适配。** 默认通过 `pdf2image + Poppler` 渲染 PDF，使用 `doc-page-extractor` 接入 OCR，获得文字、内容类型及位置框。[页面处理](https://github.com/oomol-lab/pdf-craft/blob/0846291e32eee107f2c17341b7b14113b99645c5/pdf_craft/pdf/handler.py)
2. **目录检测。** 利用“目录页集中出现后续章节标题”的特征，通过 Aho–Corasick 多字符串匹配统计重合，再根据得分和页面位置筛选；标题层级可用统计方法或可选 LLM，LLM 分析失败时回退统计方法。[检测](https://github.com/oomol-lab/pdf-craft/blob/0846291e32eee107f2c17341b7b14113b99645c5/pdf_craft/extractor/toc/toc_pages.py) · [分析](https://github.com/oomol-lab/pdf-craft/blob/0846291e32eee107f2c17341b7b14113b99645c5/pdf_craft/extractor/toc/analysing.py)
3. **段落拼接。** 根据阅读顺序、句尾标点、编号及断词等规则判断段落连续性，属于启发式处理，不能保证全部还原。[拼接](https://github.com/oomol-lab/pdf-craft/blob/0846291e32eee107f2c17341b7b14113b99645c5/pdf_craft/extractor/chapter/jointer.py) · [规则](https://github.com/oomol-lab/pdf-craft/blob/0846291e32eee107f2c17341b7b14113b99645c5/pdf_craft/extractor/chapter/mergeable.py)
4. **提取与输出解耦。** `.pcex` 是 ZIP 中间格式，保存章节 XML、资源、目录、页面几何和原文位置，避免每次输出都重复 OCR。[架构](https://github.com/oomol-lab/pdf-craft/blob/0846291e32eee107f2c17341b7b14113b99645c5/references/architecture.md) · [格式](https://github.com/oomol-lab/pdf-craft/blob/0846291e32eee107f2c17341b7b14113b99645c5/docs/zh-CN/PCEX_FORMAT.md)
5. **译文回填。** 用估算背景色的矩形覆盖原文位置，通过 Qt 完成译文布局、换行与字号调整；当前不是内容感知的复杂背景修复。[覆盖实现](https://github.com/oomol-lab/pdf-craft/blob/0846291e32eee107f2c17341b7b14113b99645c5/pdf_craft/pipeline/pdf/eraser.py) · [排版设计](https://github.com/oomol-lab/pdf-craft/blob/0846291e32eee107f2c17341b7b14113b99645c5/references/pdf-text-layout.md)

## 能得到的效果与边界

| 产物 | 支持的用途 | 主要边界 |
| --- | --- | --- |
| Markdown + 资源 | 编辑、搜索、后续加工 | 图片资源需一起保存，文字与结构依赖前序处理 |
| EPUB | 章节导航、可调字号、连续阅读 | 重新排版，不逐像素复刻原 PDF |
| 译文或双语版本 | 目标语言阅读、原文对照 | 翻译质量取决于文本模型 |
| 译文 PDF | 保留原页视觉内容，在对应区域重新排版文字 | 译文增长可能缩字或溢出，矩形覆盖可能影响复杂背景 |
| `.pcex` | 后续渲染、翻译、溯源或程序处理 | 结构化中间产物，不是最终阅读格式 |

后处理不会自动修正全部 OCR 错字；复杂目录、分栏、表格与公式也可能识别或组织错误。上表描述源码支持的目标能力，**不是本仓库已经实测的效果**。

## 研究记录与复查

| 日期 | 已完成工作 | 证据边界 |
| --- | --- | --- |
| 2026-09-16 | 阅读官方说明、OCR 配置与 API | 核对公开能力和配置条件 |
| 2026-09-16 | 阅读 OCR 适配、目录、段落、中间格式及回填源码 | 判断模块职责和算法边界 |
| 2026-09-16 | 绘制总览图并整理结论 | 信息图，无运行效果截图 |
| 2026-09-16 | 归档记录，关联索引、图片与源库 | 暂不开展模型部署和转换实验 |

可直接使用本文的固定 commit 链接复查。需要本地阅读时：

```powershell
git clone https://github.com/oomol-lab/pdf-craft.git upstream/pdf-craft
git -C upstream/pdf-craft checkout 0846291e32eee107f2c17341b7b14113b99645c5
```

已有克隆时直接核对版本。上游代码留在已忽略的 `upstream/`，不随本次记录提交。

本次没有安装模型运行时、下载模型、调用 OCR 或翻译 API，也没有生成转换产物或上线演示。若恢复实测，按[安装说明](https://github.com/oomol-lab/pdf-craft/blob/0846291e32eee107f2c17341b7b14113b99645c5/docs/zh-CN/INSTALLATION.md)独立准备 Python 3.11–3.13、Poppler 和 OCR 环境；译文 PDF 还需要 Ghostscript 与合适字体。先选择包含正文、跨页段落、图表和脚注的代表性页面测试。

## 归档判断与重新评估条件

**后续研究优先级较低，暂不继续深挖。** 这是结合本次讨论兴趣作出的研究取舍，不是性能评测，也不是对项目整体价值的否定。

- 值得保留：书籍结构恢复、带来源坐标的中间格式、转换与翻译流程集成。
- 暂停原因：本次更关注 OCR 核心识别能力；该库主要贡献是工程集成与书籍场景适配，当前阅读范围内未见独立 OCR 算法优势证据。
- 重新评估条件：出现扫描书转 EPUB、批量整理扫描资料、结构化结果复用或译文 PDF 的具体需求。
- 再评估指标：错字与漏字、阅读顺序、跨页段落、目录和脚注、表格公式，以及成本、速度和回填版面。

## 相关项目简述：Stirling-PDF

[Stirling-PDF](https://github.com/Stirling-Tools/Stirling-PDF) 是可自建的 PDF 工具平台，提供网页、桌面端和 API，覆盖合并、拆分、格式转换、压缩、签署、敏感内容涂销及批量流水线。适合日常办公、内网文件处理和业务系统集成。本次仅在 PDF Craft 研究中保留对比摘要，不单独收录或继续深入研究。

| 对比维度 | Stirling-PDF | PDF Craft |
| --- | --- | --- |
| 主要定位 | 通用 PDF 操作与自动化平台 | 扫描文档、书籍的结构重建与输出 |
| 技术路径 | React 界面、Spring Boot API，整合 PDFBox / JPDFium、LibreOffice、qpdf / Ghostscript 等引擎 | 接入 OCR 模型，进行段落、章节、目录等后处理，再导出或翻译 |
| OCR 角色 | 通过 Tesseract 识别扫描文字；可结合 OCRmyPDF 处理，生成可搜索、可复制的 PDF | 通过已列出的 OCR 后端获取文字及版面信息，供后续重建使用 |
| 主要价值 | 将多种文件操作统一为易用界面、接口和流水线 | 组织书籍内容、保存中间结果并输出 Markdown、EPUB 或译文 PDF |

**不能把“功能丰富”直接等同于“OCR 识别能力强”，也不能未经实测就认定其 OCR 不够用。** Stirling-PDF 的 OCR 适用于清晰印刷体扫描件的搜索、复制需求；官方说明 Tesseract 不负责表格结构和公式识别，手写识别能力有限。复杂版面还原、准确提取合同字段等需求，需要额外的解析与抽取能力。PDF Craft 同样依赖所接入模型和输入质量；本次没有两者识别准确率的横向实测。

选型上，可将 Stirling-PDF 作为通用 PDF 操作或预处理组件，将 PDF Craft 用于扫描书结构重建及输出；这是职责层面的组合设想，尚未验证互接流程。Stirling-PDF 部分处理需要后端，桌面端纯本地模式不支持 OCR；PDF 转 Word 的复杂版式也可能需要人工调整。

记录日期：2026-09-16；源码参照 [commit f685de11f371d84f5cac63ba0f0e66b3001d7921](https://github.com/Stirling-Tools/Stirling-PDF/tree/f685de11f371d84f5cac63ba0f0e66b3001d7921)。依据：[技术组件](https://docs.stirlingpdf.com/Functionality/The%20Technologies/)、[OCR 能力与限制](https://docs.stirlingpdf.com/Functionality/OCR/)、[格式转换](https://docs.stirlingpdf.com/Functionality/Convert/)。仅阅读文档和关键源码，未部署或运行样本；项目采用开放核心模式，部分目录使用单独许可证，详见[对应版本许可证](https://github.com/Stirling-Tools/Stirling-PDF/blob/f685de11f371d84f5cac63ba0f0e66b3001d7921/LICENSE)。

## 来源与许可

- [上游源仓库](https://github.com/oomol-lab/pdf-craft)及[固定研究快照](https://github.com/oomol-lab/pdf-craft/tree/0846291e32eee107f2c17341b7b14113b99645c5)。
- [上游 MIT 许可证](https://github.com/oomol-lab/pdf-craft/blob/0846291e32eee107f2c17341b7b14113b99645c5/LICENSE)；依赖与模型的许可证须分别核对。
- 本目录只包含本次研究文档和自行绘制的总结图，不分发上游代码、模型或书籍样本。
