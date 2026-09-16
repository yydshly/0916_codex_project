# 多个 Web 演示的部署约定

目前只初始化研究仓库，尚未建立或部署 Web 站点。

## 路径规划

GitHub Pages 每个仓库可创建一个站点，因此后续将多个静态演示放在同一个站点的不同子路径下：

```text
https://yydshly.github.io/0916_codex_project/                   总入口（待部署）
https://yydshly.github.io/0916_codex_project/001-example-repo/  第一个演示（示例路径）
https://yydshly.github.io/0916_codex_project/002-another-repo/  第二个演示（示例路径）
```

以上只是路径规划，不是当前可用的演示链接。

## 源码与发布目录

```text
projects/001-example-repo/app/       演示源码与独立依赖
web/index.html                      未来的演示总入口
web/001-example-repo/index.html      第一个项目的静态发布文件
web/002-another-repo/index.html      第二个项目的静态发布文件
```

首次建立演示时，再添加对应的构建命令和 Pages 工作流，将 `web/` 整体上传为发布产物；在仓库 Settings → Pages 中选择 GitHub Actions 作为发布来源。可直接维护纯静态文件，也可由工作流把各项目的构建输出汇总到 `web/`。重新发布时应包含所有需要保留的演示。

## 子项目接入要求

1. 在子项目 README 记录所用技术、依赖安装与构建命令。
2. 为项目设置正确的资源基础路径，例如 `/0916_codex_project/001-example-repo/`，或使用适当的相对资源路径。
3. 如使用客户端路由，优先采用 hash 路由，或提供适合静态托管的页面输出；验证直接访问和刷新子页面。
4. 在实际演示地址验证图片、脚本、导航和移动端显示。
5. 上线后才将完整地址写入 `projects.json` 的 `demo`，再更新首页。

GitHub Pages 托管静态文件；需要常驻服务、数据库或服务端密钥的项目，使用独立后端或其他托管平台，并在子项目中说明架构与访问地址。不要把密钥写入公开的前端文件。

参考：[GitHub Pages 介绍](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) · [配置发布来源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
