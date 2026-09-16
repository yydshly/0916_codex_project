# 仓库协作约定

- 这是多个开源项目的研究总仓库，文档默认使用中文。
- 先阅读 `docs/CONVENTIONS.md`；涉及演示部署时同时阅读 `docs/DEPLOYMENT.md`。
- 子项目以固定编号命名，例如 `projects/001-example-repo/`。编号不得重复、复用或为排序而更改；保留已归档条目。
- `projects.json` 是首页项目索引和图片预览的数据来源。修改后运行 `python scripts/projects.py sync`，提交前运行 `python scripts/projects.py check`。
- 保持主 README 简洁。详细研究过程、运行说明和图片说明写在对应子项目中。
- 不虚构研究结论、运行结果、截图或已上线的演示地址。
- 上游仓库优先通过链接引用；需要本地克隆时使用已忽略的 `upstream/`。引入上游代码须保留来源和许可证。
- 子项目独立管理依赖；不要为了单个项目给整个仓库强加前端框架。
- 不提交密钥、依赖目录、缓存和包含个人信息的截图。
