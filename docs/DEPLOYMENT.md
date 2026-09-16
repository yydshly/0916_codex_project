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
