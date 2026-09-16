# MediaGo 单图能力总览

![MediaGo 能力全景图](../assets/capability-map.png)

[高清 PNG](../assets/capability-map.png) · [可缩放 SVG](../assets/capability-map.svg)

## 图中范围

图按输入、发现、任务管理、来源、引擎、媒体处理、浏览与成品、部署、自动化、工程资源十个模块整理，同时列出六类使用场景和关键边界。每项是固定源码快照中的能力或明确注明的依赖能力，不代表实际下载成功率。

版本：`f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088`，2026-08-29 master 快照。研究和制图日期：2026-09-17。它不一定等同于所有已发布安装包的功能。

## 证据索引

图中 E01–E25 对应既有[源码证据](sources.md)，覆盖发现、HLS、类型推断、Schema、任务队列、SQLite、进程、转换、MCP、Docker、依赖和访问上下文。

本轮为补全图中的配套能力，另核对以下实现。链接均固定到相同提交：

| 编号 | 补充证据 | 对应能力 |
| --- | --- | --- |
| S1 | [README](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/README.md)；[扩展默认设置](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/packages/mediago-extension/src/shared/constants.ts) | 平台、局域网 Web、界面语言、扩展默认加入列表 |
| S2 | [HTTP 路由](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/api/server/router.go)；[下载处理器](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/api/handler/download.go) | 任务编辑、删除、导出、活动状态、目录、远端任务与转换接口；配置与鉴权入口 |
| S3 | [收藏服务](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/service/favorite.go) | 收藏增删、图标解析、导入导出 |
| S4 | [浏览器工具栏](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/ui/src/pages/source-extract/components/tool-bar.tsx)；[标签栏](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/ui/src/pages/source-extract/components/browser-tab-strip.tsx)；[资源筛选](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/ui/src/pages/source-extract/components/source-filter.ts) | 多标签、导航、刷新、手机模式、资源面板和筛选 |
| S5 | [视频接口](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/video/handler.go)；[视频服务](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/video/service.go) | 成功且存在于磁盘的可播放视频、按任务查询与文件服务；启用条件见路由 |
| S6 | [设置字段](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/ui/src/pages/setting-page/setting-fields.tsx) | 主题、语言、目录、终端显示、并发、代理、Docker 和 MCP 配置入口 |

“导出任务列表”不是把所有视频打包导出；“收藏”指网页收藏，不是自动归档站点收藏夹。代理设置入口也不能证明默认 direct 引擎已经映射代理参数。图中的已支持站点以指定页面规则为范围，不承诺主页、全集、字幕、弹幕或所有直播均已接入。

## 制作与验证

- 原创矢量排版，同时输出 2400 × 3830 PNG 和 SVG，非 AI 生成的文字海报、非应用运行截图。
- 生成脚本：[build_capability_map.py](../scripts/build_capability_map.py)。使用 Pillow 和 Windows 的 Microsoft YaHei 字体；运行 `python projects/009-mediago/scripts/build_capability_map.py`。
- 生成时检查卡片正文不越过底部证据区；检查 SVG XML、PNG 尺寸、补充源码路径和文件哈希；人工查看整图排版。
- 未运行 MediaGo，未做真实站点下载或播放器实测；没有新增下载可靠性结论。
