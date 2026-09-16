# Web 发布目录

在仓库根目录运行 `python scripts/build_web.py`，从 `projects.json` 生成总入口，并将所有 `projects/<编号>-<slug>/app/` 汇总到对应子路径。没有 `app/index.html` 的研究项目只显示研究记录入口。

`app/site.json` 可声明总入口按钮的 `entry` 与 `label`；默认进入 `index.html`。构建脚本同时复制项目封面、第三方来源说明与许可证，并检查 HTML 的本地链接。原始源码和图片继续保存在子项目；本目录除本说明外均为已忽略的构建产物。

GitHub Actions 的 `Deploy research demos` 工作流从干净检出构建整站，再上传本目录并部署到 Pages。不会运行 AI 生成、Python PPT 转换或 PowerPoint 渲染。

目录和资源路径要求见[部署约定](../docs/DEPLOYMENT.md)。演示源码保存在对应的 `projects/<编号>-<slug>/app/` 中。
