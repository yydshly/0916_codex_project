# 固定提交源码证据

研究提交：`e99ed1be26c3bb898b026a436810d96e2c02d81d`；源码与官方文档阅读日期：2026-09-17。

源码支持实现路径判断，不代表线上发布成功率。官方服务文档属于当前公开资料，不能把整个 MultiPost 服务的功能全部归入扩展仓库。

| 编号 | 文件与定位 | 支持的结论 |
| --- | --- | --- |
| E01 | [package.json:4](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/package.json#L4) | 版本、框架与扩展权限 |
| E02 | [LICENSE:1](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/LICENSE#L1) | 上游许可 |
| E03 | [docs/README-zh.md:81](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/docs/README-zh.md#L81) | 上游环境与功能说明；宣传能力不等于实测结果 |
| E04 | [src/sync/common.ts:18](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/sync/common.ts#L18) | 统一内容协议 |
| E05 | [src/sync/common.ts:136](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/sync/common.ts#L136) | 标签页调度与平台脚本注入 |
| E06 | [src/contents/extension.ts:23](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/contents/extension.ts#L23) | 网页消息桥接与可信域名 |
| E07 | [src/background/index.ts:62](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/background/index.ts#L62) | 发布请求、返回标签页与 30 秒 ping 启动 |
| E08 | [src/background/services/api.ts:8](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/background/services/api.ts#L8) | API Key、服务端 ping 与 NEW_TASK |
| E09 | [src/tabs/publish.tsx:82](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/tabs/publish.tsx#L82) | 素材转换及 Blob URL |
| E10 | [src/tabs/publish.tsx:489](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/tabs/publish.tsx#L489) | 回调直接显示完成，未逐平台验证发布 ID |
| E11 | [src/sync/article/zhihu.ts:3](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/sync/article/zhihu.ts#L3) | 编辑器粘贴、封面上传与条件点击发布 |
| E12 | [src/sync/dynamic/rednote.ts:4](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/sync/dynamic/rednote.ts#L4) | 小红书图文上传、填写、条件点击发布 |
| E13 | [src/sync/article/volcengine.ts:8](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/sync/article/volcengine.ts#L8) | 明确拒绝自动发布 |
| E14 | [src/sync/article/wordpress.ts:44](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/sync/article/wordpress.ts#L44) | 站内接口与页面上下文，不只模拟点击 |
| E15 | [src/sync/video/douyin.ts:206](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/sync/video/douyin.ts#L206) | 平台定时控件填写 |
| E16 | [src/contents/scraper/default.ts:29](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/contents/scraper/default.ts#L29) | 站点规则及 Readability 回退 |
| E17 | [src/contents/scraper.ts:6](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/contents/scraper.ts#L6) | 正文抓取排除小红书域名 |
| E18 | [src/sync/dynamic.ts:34](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/sync/dynamic.ts#L34) | dynamic 注册表：31 个条目 |
| E19 | [src/sync/article.ts:45](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/sync/article.ts#L45) | article 注册表：42 个条目 |
| E20 | [src/sync/video.ts:33](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/sync/video.ts#L33) | video 注册表：30 个条目 |
| E21 | [src/sync/podcast.ts:10](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/sync/podcast.ts#L10) | podcast 注册表：7 个条目 |
| E22 | [src/sync/podcast/xiaoyuzhou.ts:1](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/sync/podcast/xiaoyuzhou.ts#L1) | 小宇宙音频上传和资料填写，未见最终提交步骤 |
| E23 | [src/sync/podcast/spotify.ts:1](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/sync/podcast/spotify.ts#L1) | Spotify 音频上传和资料填写，未见最终提交步骤 |
| E24 | [src/popup/index.tsx:27](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/popup/index.tsx#L27) | 当前工具栏入口打开官网发布页 |
| E25 | [src/options/index.tsx:28](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/options/index.tsx#L28) | 选项页同样跳转官网发布页 |
| E26 | [src/background/services/trust-domain.ts:45](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/background/services/trust-domain.ts#L45) | 自有网页的可信域名确认流程 |
| E27 | [src/tabs/link-extension.tsx:57](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/tabs/link-extension.tsx#L57) | 扩展联动确认并保存 API Key |
| E28 | [src/background/services/tabs.ts:12](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/background/services/tabs.ts#L12) | 内存标签页列表和重新注入操作 |
| E29 | [src/components/Sync/ArticleTab.tsx:131](https://github.com/leaperone/MultiPost-Extension/blob/e99ed1be26c3bb898b026a436810d96e2c02d81d/src/components/Sync/ArticleTab.tsx#L131) | 仓库保留的文章组件；不视为当前官网 UI |

## 官方使用与接口资料

- [官方安装、发布入口与自动发布说明](https://multipost.app/docs/zh/user-guide/quick-start)
- [公开页面访问转至 signin?redirect=/dashboard/publish；未登录检查内部 UI](https://multipost.app/dashboard/publish)
- [配套编辑器与题图要求，属于另一项目](https://multipost.app/docs/zh/user-guide/markdown-editor)
- [控制台 API Key 与 Bearer 鉴权](https://multipost.app/docs/zh/api-reference/authentication)
- [POST 创建任务、targetClientId、任务类型与计划任务](https://multipost.app/docs/zh/api-reference/extension/task-create)
- [GET 按 taskId 查询任务详情](https://multipost.app/docs/zh/api-reference/extension/task-get)

## 验证范围

四个注册表按顶层键统计，共 110 项；名称对应注册表与中文语言包，条目及证据摘要保存在 [research.json](../research.json)。

未安装扩展、未构建上游、未登录官网或目标平台、未发起真实发布或调用远程任务接口。网页显示的对照例子属于源码推演。

## 平台数量口径

110 个注册项包含重复内容类型和 Webhook。按显示名称去重并排除 Webhook 后为 78 项，再合并“今日头条 / 今日头条号”为 77 个平台／服务；不同产品服务不按母公司合并。摘要使用“70 余个”表达，完整归并清单保存在研究快照的 platform_count 中。
