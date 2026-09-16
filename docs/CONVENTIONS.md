# 研究与收录约定

## 固定编号

使用 `001-slug`、`002-slug` 等目录名；编号至少补齐三位。编号代表收录顺序，分配后不变，首页按数值升序排列。暂停或结束研究时改为 `已归档`，保留编号与记录。

新建项目使用：

```sh
python scripts/projects.py add example-repo --name "项目名称" --repo https://github.com/owner/example-repo --summary "一句话研究摘要"
```

`slug` 只使用小写英文字母、数字和连字符。新增命令会根据已收录项目的最大编号继续递增。

## 清单字段

`projects.json` 中每个条目包含以下字段。下面只是格式示例，不代表已经收录该项目：

```json
{
  "id": 1,
  "slug": "example-repo",
  "name": "项目名称",
  "summary": "一句话介绍研究对象和研究目的",
  "repo": "https://github.com/owner/example-repo",
  "status": "待研究",
  "tags": [],
  "cover": "",
  "cover_alt": "",
  "demo": ""
}
```

`id` 与 `slug` 共同确定研究目录。封面使用类似 `projects/001-example-repo/assets/cover.png` 的仓库相对路径；`cover_alt` 描述图片展示的内容。`repo` 和 `demo` 使用完整 HTTPS 地址，未部署时 `demo` 保持空字符串。

修改后运行 `python scripts/projects.py sync`。首页标记区内的索引与预览图由脚本生成，其他正文可以手动编辑。运行 `python scripts/projects.py check` 可检查重复编号、目录、图片和首页同步情况；GitHub Actions 也会执行该检查。

## 研究内容的边界

- 总 README：摘要、索引、封面预览和入口。
- 子项目 README：来源、目标、复现方式、实际结论和详细图片说明。
- 子项目 `app/`：需要时创建，存放自主实现或改造的演示代码。
- 子项目 `notes/`：需要时创建，存放较长的源码阅读笔记。
- 根目录 `upstream/`：本地临时克隆上游仓库，已被 Git 忽略。

不默认把上游完整代码复制进本仓库，也不强制所有项目使用相同技术栈。提交引用代码时保留来源和许可信息。研究版本至少记录一个 tag 或 commit，以便后续复现。

## 收录流程

1. 创建条目，记录为什么值得研究。
2. 将状态改为 `研究中`，补充环境、研究版本与复现步骤。
3. 保存实际运行截图，填写封面与说明，更新首页。
4. 需要时制作 Web 演示，并在上线验证后填写链接。
5. 写出已验证的结论和局限，将状态改为 `已完成` 或 `已归档`。
