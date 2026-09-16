# GitHub 项目研究笔记

收集日常在 GitHub、X 等渠道发现的优秀开源项目，记录实际运行、源码阅读、复现与二次实践的过程。

这里是研究总项目库：首页提供摘要、有序索引和图片预览；每个子项目独立保存研究记录、实验代码和演示说明。

## 项目索引

编号按收录顺序递增，分配后保持不变；默认按编号升序展示。模板不计入正式项目。

<!-- PROJECT_INDEX:START -->
目前尚未收录项目。首个项目将从 **001** 开始。
<!-- PROJECT_INDEX:END -->

## 项目预览

每个子项目可提供一张封面图和一句话摘要，点击名称查看完整研究记录。

<!-- PROJECT_GALLERY:START -->
添加子项目截图后，这里会自动展示带说明的预览图。
<!-- PROJECT_GALLERY:END -->

## 目录结构

```text
projects.json           子项目清单：编号、简介、状态、截图和演示链接
projects/               按 001-project-name 形式组织的独立研究目录
templates/project/      新建子项目的研究文档模板
scripts/projects.py     新增项目、更新首页与检查索引
docs/CONVENTIONS.md      编号、资料、截图和协作约定
docs/DEPLOYMENT.md       多个 Web 演示的目录与部署约定
web/                    未来统一发布的静态 Web 演示目录
```

## 开始研究一个项目

需要 Python 3.10 或更新版本，无需安装第三方依赖。在仓库根目录运行：

```sh
python scripts/projects.py add example-repo --name "项目名称" --repo https://github.com/owner/example-repo --summary "这个项目解决什么问题，为什么值得研究"
```

命令自动分配下一个编号、创建研究目录，并更新本页。填写新目录中的 `README.md`，将截图放入其 `assets/` 目录，然后在 `projects.json` 中补充状态、标签、封面说明及演示链接。

```sh
python scripts/projects.py sync
python scripts/projects.py check
```

状态依次可用：`待研究`、`研究中`、`已完成`、`已归档`。没有实际上线的演示请保持 `demo` 为空。

进一步说明：[研究约定](docs/CONVENTIONS.md) · [Web 部署约定](docs/DEPLOYMENT.md) · [研究模板](templates/project/README.md)

## 来源与许可

每个子项目应标明上游仓库、研究版本和原始许可证。引用的代码、截图及其他素材遵循各自的授权要求。本仓库尚未选定统一开源许可证，不以本仓库的文档代替上游许可证。
