# 第一版平台能力与概念演练记录

> 后续已按用户反馈将真实提示词目录设为首页，见 [目录研究](catalog-research.md)。本文描述次要导航保留的第一版概念演练，不代表新增真实目录的数据来源。

日期：2026-09-17。版本：`f78a1c5136fa080155d928e0d7e2b4a41ddef03e`。

## 对第一阶段说明的补充

进一步读取固定版本的数据模型、MCP 处理器、媒体生成界面、外部运行入口、翻译接口、提示词关联界面和开发工具包文档。以网页的 32 条能力作为研究拆分口径，不宣称是上游的官方功能数量。

| 补充能力 | 证据位置 | 本次能确认的范围 |
| --- | --- | --- |
| 收藏、置顶、结果示例 | `prisma/schema.prisma` | 存在 Collection、PinnedPrompt、UserPromptExample 及对应关系；未测界面行为 |
| 提示词关联流程 | `src/components/prompts/prompt-flow-section.tsx` | 展示连接和 workflowLink；不能据此认定为自动执行引擎 |
| 翻译 | `src/app/api/prompts/translate/route.ts` | 登录检查、参数验证及翻译调用 |
| 对话式构建 | `src/app/api/prompt-builder/chat/route.ts` | 生成模型接入；不同于本地构建器 |
| 媒体生成 | `src/components/prompts/media-generator.tsx` | 模型选择、任务发起、进度处理与结果地址；依赖提供商，未实测生成 |
| 外部平台打开 | `src/components/prompts/run-prompt-button.tsx` | 网站、深链接与复制衔接；平台支持方式不同 |
| 下载 | `src/components/prompts/download-prompt-dropdown.tsx` | Markdown、YAML、技能包和链接入口 |
| 10 个 MCP 工具 | `src/pages/api/mcp.ts` | 核对固定版本的注册名称，包含 search_skills 和 update_skill_file；未实测服务 |
| 变量、构建器、解析、质量与相似度 | `packages/prompts.chat/README.md` | 公开工具包接口与用途说明；本网页未加载此包 |

上述路径均可在[固定版本仓库](https://github.com/f/prompts.chat/tree/f78a1c5136fa080155d928e0d7e2b4a41ddef03e)核对。原始文件仅临时保存于已忽略的 `upstream/prompts-chat-reference/`；网页通过链接引用，不发布这些源码副本。

## 六个场景如何串联

| 场景 | 串联能力 | 本页可实际操作 | 示例边界 |
| --- | --- | --- | --- |
| 个人项目研究 | 搜索 → 变量 → 改写要求 → 交给模型 → 保存 | 候选切换、填参、预览、导出 | 候选和改写要求预先编写；未生成研究报告 |
| 团队客服规范 | 私有内容 → 变更建议 → 审核 → 版本 → 复用 | 填写情境、对照修改、模拟接受提案 | 没有真实账户、多人同步或上游写入 |
| 图文视频策划 | 类型 → 参数 → 约束 → 关联流程 → 导出 | 生成文案、图像、视频三类任务输入 | 不生成媒体；任务执行由外部模型完成 |
| Agent 审查 | 技能检索 → 任务上下文 → 多文件 → MCP → 使用 | 查看三个技能文件和请求结构、导出汇总 | 请求未发送，技能未安装、未执行 |
| 旧模板整理 | 变量规范化 → 结构检查 → 去重思路 → 序列化 | 填参及 JSON 结构生成 | 未调用 SDK；无伪造评分或相似度结果 |
| 私有库规划 | 需求 → 功能配置 → 数据流 → 访问验收 → 清单 | 选择基础／AI 模式并导出部署要求 | 不创建服务、数据库或身份配置 |

## 实现与状态

纯 HTML / CSS / JavaScript，无第三方运行依赖。各视图通过 hash 导航，支持分享具体场景及直接刷新。字段编辑保存在内存；只有用户点击“保存本机草稿”才写入当前浏览器 localStorage。重置仅清除当前场景的草稿。

用户输入以文本或 HTML 转义后的字符串渲染；JSON 导出使用 JSON.stringify。页面不请求模型、上游 API 或外部字体，外部资料链接由用户点击打开。

## 验证方式

- `node --check`：脚本语法。
- `node projects/014-prompts-chat/notes/check-interactions.cjs`：能力引用、六场景三十步骤渲染、变量更新、JSON 输出、缺失字段、草稿恢复、筛选空状态及五类接入示例。
- `python scripts/projects.py check`：总仓库索引一致性。
- `python scripts/build_web.py`：构建及本地静态资源链接检查。
- 本地 HTTP 请求确认页面和资源可访问。

这些检查不等于浏览器视觉、键盘交互、手机实机或上游功能测试；当前未执行这些测试。未生成或收录运行截图。
