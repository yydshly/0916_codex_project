# 006 · Skillry 创作技能能力图谱

> 面向网页、演示文稿、图片与视频的技能分发网站。将官方公开资料整理为中文网页，明确输入、产物、依赖和能力边界。未下载或执行任何 Skillry 技能。

## 我们的理解与取舍

**本质是偏视觉创作的 Skill 展示、售卖和分发平台。** 网站提供分类浏览、案例、获取与更新入口；实际产出来自技能方法、宿主 AI 助手和外部工具的组合。尚未确认它拥有独立在线创作引擎、自研模型或通用自动化平台。

对本仓库而言，定位为**低优先级资源参考**：保留技能分类、案例风格和工作流说明的参考价值；现阶段不建议仅为目录付费，不继续安排大规模安装和评测。

收费是否合理，应看具体技能是否有原创流程、脚本、实测和持续维护。我们没有核查私有技能包来源、原创程度与免费替代，不能认定其在转售免费技能，也不能证明付费内容明显更好。详见 [讨论结论](notes/understanding.md)。

![Skillry 收录的四类技能、具体方向和十二个代表名称，以及平台边界和讨论结论](assets/understanding-guide.png)

[下载 PNG](assets/understanding-guide.png) · [下载 SVG](assets/understanding-guide.svg)。原创研究引导图，数量为查阅快照，非官方界面或本地技能实测。

| 项目资料 | 内容 |
| --- | --- |
| 研究对象 | [skillry.dev](https://skillry.dev/)（网站及技能目录） |
| 查阅日期 | 2026-09-16 |
| 版本基线 | Obsidian Cinema Landing v1.0.1；其余三个样本 v1.0.0，见下表 |
| 官方开源仓库 | 未确认；不把同名 GitHub 仓库或其他域名当成本网站源码 |
| 许可 | 网站及技能版权归原权利人；引用四张有来源的官方预览图，未引入付费技能或网站源码 |
| 发现渠道 | 用户提供官网链接 |
| 本次范围 | 公开资料核对、能力归纳、原创静态网页实现与仓库接入 |

## 能力与关键结论

官网目录查阅时显示 232 个技能：网页 86、演示文稿 47、图片 81、视频 18。该数量是目录快照，不能视为独立能力的实测数量，也不表示每个技能都是完整应用。

| 代表技能 | 版本 | 官方描述的产物 | 关键依赖与限制 |
| --- | --- | --- | --- |
| [Obsidian Cinema Landing](https://skillry.dev/skills/bs-obsidian-cinema-landing) | 1.0.1 | 带 Canvas 动效的单文件 HTML 落地页 | 宿主 AI 模型；预购入口不含支付流程 |
| [Editable Visual Deck](https://skillry.dev/skills/bs-editable-visual-deck) | 1.0.0 | 浏览器演示、对象清单、导出交接方案 | 浏览器、Node.js 20+；可编辑文件需兼容导出器及单独验证 |
| [Paperline Content Illustrator](https://skillry.dev/skills/bs-paperline-content-illustrator) | 1.0.0 | 内容插图与系列风格流程 | FAL 账号、FAL_KEY、Node.js 20+；GPT Image 生图另计费 |
| [Velocity-Matched UI Sting](https://skillry.dev/skills/bs-hyperframes-velocity-sting) | 1.0.0 | 10–13 秒 MP4、单文件 HyperFrames 项目、转场记录 | HyperFrames CLI、Node.js 22+、FFmpeg；适合短片头而非完整产品解释 |

这些是官方声明，不是本地运行结果。不能把“浏览器中的对象可编辑”直接等同于“已验证原生可编辑 PPTX”。

## 网页展示

入口：[app/index.html](app/index.html)。包含八个完整章节：能力总览、四类技能、官方案例与交付物、工作原理、从选择到交付、仓库场景、费用与边界、来源与资料下载。

使用 HTML / CSS 与少量原生 JavaScript，无额外依赖、不调用模型。锚点导航和 details 展开无需 JavaScript；脚本仅增强当前章节标记和视频错误提示。移动端使用单列内容和可横向滚动的对照表。页面不要求账号，不收集或存储用户信息。

补全内容包括 4 张官方案例预览、官网视频播放入口、12 个代表技能详情链接、5 步开始流程、需求示例，以及研究笔记、能力图和来源记录下载。图片保存为本地缩略预览；视频保留官方公开地址，点击播放时才加载，不能离线观看。官方展示不代表本地运行结果。

仓库根目录运行：

```powershell
python -m http.server 8778 --bind 127.0.0.1 --directory projects/006-skillry/app
```

访问 http://127.0.0.1:8778/ 。也可直接打开 HTML 文件。

接入现有演示总入口：

```powershell
python scripts/projects.py sync
python scripts/projects.py check
python scripts/build_web.py
```

构建产物位于 web/006-skillry/，总入口自动显示“浏览能力图谱”。

2026-09-16 已通过仓库 GitHub Pages 工作流发布：[在线网页](https://yydshly.github.io/0916_codex_project/006-skillry/) · [讨论引导图](https://yydshly.github.io/0916_codex_project/006-skillry/downloads/understanding-guide.png)。内容提交 f507be9，线上 16 个静态文件与提交逐字节一致；详见 [发布验证](notes/deployment-verification.json)。本次验证覆盖资源可达性与内容一致性，未做线上浏览器视觉、交互或手机实测。

## 研究与验证记录

- [来源与内容基线](notes/research.md)：查阅方式、版本、费用、判断和后续实测建议。
- [来源响应指纹](notes/source-fetch.json)：公开页面抓取时间、SHA-256 和大小（若已记录）。指纹标记查阅响应，不是网站软件版本。
- [本地验证记录](notes/verification.json)：索引、静态构建、本地链接及 HTTP 可达性检查。本次未做浏览器视觉或交互实测。

## 图片说明

![Skillry 四类能力与使用流程的原创研究示意图](assets/capability-map.svg)

该图是本项目原创信息图，展示目录数量和工作流程，不是官网截图或技能运行结果。

页面另外包含 4 张 Skillry 公开案例缩略图，均标明“官方案例”并链接原始详情页。图片原始 URL、抓取时间和 SHA-256 见 [媒体来源记录](app/media/sources.json)。视频为官网外链，不下载至仓库。媒体版权归原权利人，本项目没有将其视为开源素材。

## 价值与后续

适合借鉴其“按交付物挑技能”的组织方式，以及为每个技能明确输入、产物、依赖和不适用场景的说明结构。

暂不继续安装和评测。如遇明确需求，再考虑对单个技能开展同题对照，例如用研究简报比较演示产物、PPTX 编辑性和成本；该实验尚未执行。

## 来源与许可

- [官网](https://skillry.dev/) · [目录](https://skillry.dev/skills) · [指南](https://skillry.dev/guides)
- [官方接入说明](https://skillry.dev/install/agent.md) · [价格](https://skillry.dev/pricing)
- 四个样本详情链接见上表。
- [第三方来源说明](THIRD_PARTY_NOTICES.md)
