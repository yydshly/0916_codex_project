# 多个 Web 演示的部署约定

本仓库使用 GitHub Pages 和 GitHub Actions 汇总发布静态演示。源码位于各子项目的 `app/`，构建产物位于已忽略的 `web/`。

## 发布路径

多个演示共用一个站点，各自使用固定编号对应的子路径：

```text
https://yydshly.github.io/0916_codex_project/                         总入口
https://yydshly.github.io/0916_codex_project/001-ppt-master/styles.html 风格展厅
https://yydshly.github.io/0916_codex_project/001-ppt-master/             原生 PPT 实测
```

以上地址于 2026-09-16 完成首次发布并验证，正式演示已写入 `projects.json`。没有 `app/index.html` 的项目只在总入口链接研究记录，不生成虚构演示页面。PPT Master 的 36 张预览与两份 PPT 下载已核对本地内容，详见[线上验证记录](../projects/001-ppt-master/notes/deployment-verification.json)。

## 源码与发布目录

```text
projects/001-ppt-master/app/         演示源码与独立依赖
scripts/build_web.py                 根据 projects.json 汇总所有静态演示
.github/workflows/pages.yml          GitHub Actions 构建、上传、部署
web/index.html                      从清单生成的演示总入口
web/001-ppt-master/                  PPT Master 发布文件
```

在仓库 Settings → Pages 中选择 GitHub Actions。`main` 分支上的项目、清单、脚本、README 或 Pages 工作流变更会触发 `Deploy research demos`；也可手动运行。每次从干净检出构建所有静态演示，将 `web/` 整体上传，保留其他项目入口。

工作流先检查清单与 README，然后运行 `python scripts/build_web.py`。构建仅复制允许公开的静态文件，跳过隐藏文件，拒绝符号链接，检查 HTML 本地资源链接，并附带来源说明和许可证；不会复制上游克隆、模型凭据、依赖、缓存或实验临时输出。

本地构建与预览：

```powershell
python scripts/projects.py check
python scripts/build_web.py
python -m http.server 8766 --bind 127.0.0.1 --directory web
```

若手动删除或改名了源码文件，本地 `web/` 可能保留旧构建文件；线上始终使用干净检出，不依赖本地发布目录。

## 子项目接入要求

1. 在子项目 README 记录所用技术、依赖安装与构建命令。
   静态演示须含 `app/index.html`；可用 `app/site.json` 的 `entry` 和 `label` 指定总入口按钮。需要前端构建的项目应先增加明确的构建步骤，不把依赖目录直接发布。
2. 为项目设置正确的资源基础路径，例如 `/0916_codex_project/001-example-repo/`，或使用适当的相对资源路径。
3. 如使用客户端路由，优先采用 hash 路由，或提供适合静态托管的页面输出；验证直接访问和刷新子页面。
4. 在实际演示地址验证图片、脚本、导航和移动端显示。
5. 上线后才将完整地址写入 `projects.json` 的 `demo`，再更新首页。

GitHub Pages 托管静态文件；需要常驻服务、数据库或服务端密钥的项目，使用独立后端或其他托管平台，并在子项目中说明架构与访问地址。不要把密钥写入公开的前端文件。

参考：[GitHub Pages 介绍](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) · [配置发布来源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## WrenAI 研究展示

2026-09-16 已发布并实际验证：[WrenAI 30 秒摘要](https://yydshly.github.io/0916_codex_project/003-wrenai/#quickstart) · [原理与场景引导图](https://yydshly.github.io/0916_codex_project/003-wrenai/media/wrenai-summary.png)。

页面包含能力、原理、价值、本质摘要，交互架构、场景选择、方案对比及合成数据引擎实验。首次内容提交 `d9cf45d`，[发布工作流](https://github.com/yydshly/0916_codex_project/actions/runs/35099163612)成功；页面与 10 个资源校验一致，桌面、手机、锚点刷新和原有 PPT Master 展厅通过线上检查。详情见 [WrenAI 线上验证记录](../projects/003-wrenai/notes/deployment-verification.json)。仅发布静态研究展示，未部署模型服务或生产数据库。

## Design Extract 能力与原理手册

2026-09-16 已发布并验证：[能力与原理手册](https://yydshly.github.io/0916_codex_project/004-design-extract/) · [提取原理](https://yydshly.github.io/0916_codex_project/004-design-extract/#principle)。

页面为无额外依赖的静态 HTML / CSS / JavaScript，包含六类能力、五步交互原理、真实样本截图、输出节选和四项保真问题。首次页面内容提交 `29c5269`，[发布工作流](https://github.com/yydshly/0916_codex_project/actions/runs/35104425412)成功；14 个发布文件与提交内容一致，原有两个子项目入口正常。数据是保存的本地实验结果，未部署在线提取服务。详情见 [发布验证](../projects/004-design-extract/notes/deployment-verification.json)。

同日补充发布：[我们的理解与参考价值](https://yydshly.github.io/0916_codex_project/004-design-extract/understanding.html)。整理库能力、Codex 对比、两种对比、使用场景、建议复刻流程与后续对照实验，并提供 Markdown 文档和 PNG / SVG 引导图下载。原手册保留，总入口指向讨论汇总。

内容提交 `caff200`，[发布工作流](https://github.com/yydshly/0916_codex_project/actions/runs/35108269776)成功；7 个上线文件与提交逐字节一致。汇总页 11 项本地检查、10 项线上检查通过，原手册 16 项回归检查通过；原有 PPT Master 和 WrenAI 路由返回 HTTP 200。详见 [发布内容核对](../projects/004-design-extract/notes/understanding-deployment.json) 与 [线上界面验证](../projects/004-design-extract/notes/understanding-online-verification.json)。图示为研究整理，未新增在线提取或复刻服务。

## Fridge Magnet 磁贴面板

2026-09-16 已发布并验证：[面板体验](https://yydshly.github.io/0916_codex_project/005-fridgemagnet/) · [项目与日报方案](https://yydshly.github.io/0916_codex_project/005-fridgemagnet/#workbench)。

自主实现的静态概念演示，包含六种材质反馈、焦点／重点／稍后分层、四场景及十二类扩展方向。首次内容提交 `303f5bb`，[工作流](https://github.com/yydshly/0916_codex_project/actions/runs/35115847424)成功；14 个发布文件与提交内容一致，线上图片、注意力操作、场景切换、竞价模拟、锚点刷新及桌面／手机宽度布局已检查。封面与引导图使用实际产品截图；未接入真实账号、记录存储、任务流或支付。详见 [部署验证](../projects/005-fridgemagnet/notes/deployment-verification.json)。


## Skillry 技能目录与讨论结论

2026-09-16 已发布：[研究展示](https://yydshly.github.io/0916_codex_project/006-skillry/) · [收录方向引导图](https://yydshly.github.io/0916_codex_project/006-skillry/downloads/understanding-guide.png)。

页面区分平台分发功能与技能执行能力，整理四类技能、十二个代表名称、官方案例及低优先级参考的讨论结论。初次内容提交 `f507be9`，[发布工作流](https://github.com/yydshly/0916_codex_project/actions/runs/35117357281)成功；16 个静态文件与提交逐字节一致。未进行线上浏览器视觉、交互或手机实测，未安装或运行 Skillry 技能。详见 [发布记录](../projects/006-skillry/notes/deployment-verification.json)。


## MediaGo 能力、原理与下载方式

2026-09-17 已发布并验证：[中文研究手册](https://yydshly.github.io/0916_codex_project/009-mediago/) · [支持资源与下载方式](https://yydshly.github.io/0916_codex_project/009-mediago/#sources) · [能力全景图](https://yydshly.github.io/0916_codex_project/009-mediago/media/capability-map.png)。

摘要采用“获取输入 → 识别资源类型 → 选择对应引擎 → 解析并下载 → 合并、检查与保存”，明确 MediaGo 主要负责识别、分派和管理，具体解析下载主要由引擎承担。页面含六种下载通道、六类完整场景、来源矩阵与十模块能力图。内容提交 `5c16daf`，[首次工作流](https://github.com/yydshly/0916_codex_project/actions/runs/35128267747) 成功；六项线上主要资源与提交一致，交互、锚点刷新、桌面与手机布局通过检查。详见 [部署验证](../projects/009-mediago/notes/deployment-verification.json)。仅发布静态研究网页，未运行或部署 MediaGo 下载服务，未做真实站点下载。

## MultiPost 使用流程与实现原理

2026-09-17 已发布并验证：[能力与原理手册](https://yydshly.github.io/0916_codex_project/010-multipost-extension/) · [唯一理解总览图](https://yydshly.github.io/0916_codex_project/010-multipost-extension/media/understanding-guide.png)。

以浏览器插件接入，按目标平台要求填写、上传并按适配能力提交发布。源码统计为 70 余个平台／服务、110 项内容适配，计数口径及归并清单随研究快照保存。网页包括七步使用流程、三种调用方式、内部机制及平台能力附录。

内容提交 `52929d6`，[发布工作流](https://github.com/yydshly/0916_codex_project/actions/runs/35130767944)成功；6 个线上文件与提交逐字节一致。已验证 1440px / 390px 布局、单张引导图、标签与键盘切换、锚点刷新，总入口及 MediaGo 原页面 HTTP 200。见 [部署记录](../projects/010-multipost-extension/notes/deployment-verification.json)。仅部署研究网页，未安装或实际执行 MultiPost 发布功能。

## Kun 工作台理解与模型接入

2026-09-17 已发布并验证：[研究手册](https://yydshly.github.io/0916_codex_project/011-kun/) · [模型接入与执行引擎](https://yydshly.github.io/0916_codex_project/011-kun/#model-access) · [完整理解引导图](https://yydshly.github.io/0916_codex_project/011-kun/media/kun-overview.png)。

摘要明确 Kun 自有循环与外部 Agent SDK 并存，整合成果预览、部分编辑和任务管理；16 类界面与交互属于研究分类，不是独有智能数量。引导图与网页包括 API / 网关 / 订阅 / SDK 接入、Pi / Codex / Claude Code 对比及对我们的参考价值。

内容提交 `e1e3e83`，[发布工作流](https://github.com/yydshly/0916_codex_project/actions/runs/35136141329)成功；7 个主要线上文件与提交逐字节一致，总入口包含项目及引导图。本地检查 1440 / 390 宽度、图片加载、链接和锚点刷新；线上浏览器确认摘要、模型接入、图片加载与锚点刷新。见 [发布验证](../projects/011-kun/notes/deployment-verification.json)。仅发布静态研究内容，未运行 Kun 或验证模型与订阅接入。

## OpenPencil 能力、商务效果与参考意义

2026-09-17 已发布并验证：[研究网页](https://yydshly.github.io/0916_codex_project/012-openpencil/) · [唯一理解引导图](https://yydshly.github.io/0916_codex_project/012-openpencil/media/understanding-guide.png)。

摘要明确其能力是通过编辑器和 MCP / CLI 创建、修改、保存、导出可编辑设计稿；已测效果偏传统、规整的商务后台与数据汇报，价值在设计自动化及批量制作。内置 AI 未测试，商务倾向不能代表生成上限。首页封面与网页使用同一张引导图，实际截图作为详情证据保留。

内容提交 `687de43`，[发布工作流](https://github.com/yydshly/0916_codex_project/actions/runs/35138359354)成功；9 个线上文件与提交逐字节一致，总入口摘要和引导图验证通过，原有 Kun 页面 HTTP 200。未执行线上浏览器视觉、交互和手机测试。见[发布记录](../projects/012-openpencil/notes/deployment-verification.json)。仅部署静态研究内容，未部署 OpenPencil 在线编辑器或模型服务。


## prompts.chat 提示词参考地图与产品点子引导

2026-09-17 已发布并验证：[用途与价值地图](https://yydshly.github.io/0916_codex_project/014-prompts-chat/#guide) · [完整公开索引](https://yydshly.github.io/0916_codex_project/014-prompts-chat/#library) · [唯一总览引导图](https://yydshly.github.io/0916_codex_project/014-prompts-chat/media/understanding-guide.png)。

摘要明确它是社区提示词收集与参考库：归纳 2,270 条公开目录索引、16 类内容主题，用任务思路支持点子筛选、需求验证和产品推进。目录分类与模型执行能力分开说明；60 篇独立条目有阅读说明，四条复用路径可填写与复制。总首页封面和研究页面使用同一张总览图，产品方向为待验证设想。

内容提交 `a8af68a`，[发布工作流](https://github.com/yydshly/0916_codex_project/actions/runs/35175126109)成功；11 个线上主要资源与提交逐字节一致，总入口摘要和封面验证通过，原有 PPT Master、OpenPencil 页面 HTTP 200。线上检查 1440px / 390px 布局、引导图加载、分类筛选、中文搜索、任务填写与复制、详情锚点刷新。详见[部署验证](../projects/014-prompts-chat/notes/deployment-verification.json)。仅部署静态研究网页，未安装上游服务或评测提示词模型效果。
