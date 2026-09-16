# 固定版本源码证据

提交：`f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088`；研究日期：2026-09-17。

下列定位从该提交的 Git 内容生成并逐项检查。SHA-256 使用 Git 原始文件字节，避免 Windows 换行转换影响。链接指向固定提交，不随 master 更新。定位存在仅证明证据可复查，不代表运行验证。

## E01 · 共享识别规则

- [packages/common/src/sniff/filter-rules.ts:39](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/packages/common/src/sniff/filter-rules.ts#L39) — `export const SNIFF_FILTERS`
- [packages/common/src/sniff/filter-rules.ts:115](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/packages/common/src/sniff/filter-rules.ts#L115) — `export function matchRequestUrl`

## E02 · 桌面请求与响应嗅探

- [apps/electron/src/services/sniffing-helper.service.ts:383](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/electron/src/services/sniffing-helper.service.ts#L383) — `private ensureSessionListener`
- [apps/electron/src/services/sniffing-helper.service.ts:432](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/electron/src/services/sniffing-helper.service.ts#L432) — `private readonly onHeadersReceived`

## E03 · Chrome/Edge 扩展

- [packages/mediago-extension/src/background/sniffer.ts:126](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/packages/mediago-extension/src/background/sniffer.ts#L126) — `async function handleRequest`
- [packages/mediago-extension/package.json:2](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/packages/mediago-extension/package.json#L2) — `"name"`

## E04 · HLS 清单检查

- [apps/core/internal/service/m3u8_inspector.go:19](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/service/m3u8_inspector.go#L19) — `inspectTimeout`
- [apps/core/internal/service/m3u8_inspector.go:138](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/service/m3u8_inspector.go#L138) — `func (i *M3U8Inspector) Inspect(`
- [apps/core/internal/service/m3u8_inspector.go:286](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/service/m3u8_inspector.go#L286) — `func parseM3U8(`

## E05 · 类型推断与引擎映射

- [apps/core/internal/core/types.go:26](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/core/types.go#L26) — `func InferDownloadType`
- [apps/core/internal/core/types.go:136](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/core/types.go#L136) — `var BinaryNames`
- [apps/core/internal/core/types.go:158](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/core/types.go#L158) — `StatusPending`

## E06 · 参数与控制台 schema

- [apps/core/internal/core/schema/loader.go:80](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/core/schema/loader.go#L80) — `func DefaultSchemas`
- [apps/core/internal/core/schema/loader.go:176](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/core/schema/loader.go#L176) — `func LoadSchemasFromJSON`
- [apps/core/internal/core/downloader.go:96](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/core/downloader.go#L96) — `func (d *DownloaderSvc) buildArgs`

## E07 · 任务服务与持久化请求头

- [apps/core/internal/service/download_task.go:58](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/service/download_task.go#L58) — `func (s *DownloadTaskService) AddDownloadTask(`
- [apps/core/internal/service/download_task.go:345](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/service/download_task.go#L345) — `func (s *DownloadTaskService) startDownload`
- [apps/core/internal/service/download_task.go:376](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/service/download_task.go#L376) — `func PersistentDiscoveryHeaders`

## E08 · 内存队列与取消

- [apps/core/internal/core/queue.go:19](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/core/queue.go#L19) — `type TaskQueue struct`
- [apps/core/internal/core/queue.go:77](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/core/queue.go#L77) — `func (q *TaskQueue) Enqueue`
- [apps/core/internal/core/queue.go:223](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/core/queue.go#L223) — `func (q *TaskQueue) execute`

## E09 · SQLite 与数据模型

- [apps/core/internal/db/db.go:15](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/db/db.go#L15) — `func New(`
- [apps/core/internal/db/models.go:19](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/db/models.go#L19) — `type Video struct`

## E10 · 下载执行、输出检查与直播恢复

- [apps/core/internal/core/downloader.go:632](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/core/downloader.go#L632) — `func (d *DownloaderSvc) Download(`
- [apps/core/internal/core/downloader.go:212](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/core/downloader.go#L212) — `func appendYTDLPCookieFile`
- [apps/core/internal/core/live_recovery.go:27](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/core/live_recovery.go#L27) — `func recoverLiveM3U8Segments`

## E11 · FFmpeg 转换

- [apps/core/internal/service/converter.go:46](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/service/converter.go#L46) — `func (c *Converter) Start(`
- [apps/core/internal/service/converter.go:261](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/service/converter.go#L261) — `func buildFFmpegArgs`

## E12 · HTTP 路由与发现调度

- [apps/core/internal/api/server/router.go:3](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/api/server/router.go#L3) — `func (s *Server) registerRoutes`
- [apps/core/internal/discovery/service.go:50](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/discovery/service.go#L50) — `func (s *Service) Create(`
- [apps/core/internal/discovery/service.go:275](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/discovery/service.go#L275) — `func normalizeInput`

## E13 · MCP 工具

- [apps/core/internal/mcpserver/server.go:125](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/mcpserver/server.go#L125) — `func (m *Manager) serveHTTP`
- [apps/core/internal/mcpserver/server.go:221](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/mcpserver/server.go#L221) — `func (m *Manager) registerTools`

## E14 · AI Skill 调用说明（研究对象，未安装或执行）

- [skills/mediago/SKILL.md:16](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/skills/mediago/SKILL.md#L16) — `# MediaGo Video Downloader`

## E15 · 发现转本地下载

- [apps/core/internal/api/handler/discovery.go:131](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/api/handler/discovery.go#L131) — `func (h *DiscoveryHandler) createDownloads`
- [apps/core/internal/api/handler/discovery.go:221](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/api/handler/discovery.go#L221) — `func selectedDiscoverySourceURL`

## E16 · Docker 任务转交

- [apps/core/internal/api/handler/docker.go:70](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/api/handler/docker.go#L70) — `func (h *DockerHandler) DiscoveryDownloads`
- [apps/core/internal/docker/client.go:43](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/docker/client.go#L43) — `type Client struct`

## E17 · 运行时依赖与第三方资料

- [packages/tooling/manifests/runtime-deps.json:2](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/packages/tooling/manifests/runtime-deps.json#L2) — `"ffmpeg"`
- [THIRD_PARTY_NOTICES.md:1](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/THIRD_PARTY_NOTICES.md#L1) — `# Third-party download tools`

## E18 · Core 组装与 Docker 启动

- [apps/core/internal/api/server/server.go:67](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/api/server/server.go#L67) — `func New(`
- [apps/core/internal/app/runtime.go:40](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/app/runtime.go#L40) — `func NewRuntime`
- [docker/docker-entrypoint.sh:11](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/docker/docker-entrypoint.sh#L11) — `exec mediago-core`
- [Dockerfile:115](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/Dockerfile#L115) — `EXPOSE 8899`

## E19 · 开发环境与根许可证

- [CONTRIBUTING.md:7](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/CONTRIBUTING.md#L7) — `## Prerequisites`
- [package.json:9](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/package.json#L9) — `"packageManager"`
- [LICENSE:1](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/LICENSE#L1) — `MIT License`

## E20 · 共享站点适配包

- [packages/browser-extension/src/site-adapters/registry.ts:8](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/packages/browser-extension/src/site-adapters/registry.ts#L8) — `export const PAGE_ADAPTERS`
- [packages/browser-extension/package.json:2](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/packages/browser-extension/package.json#L2) — `"name"`

## E21 · 队列事件与产物持久化

- [apps/core/internal/api/server/queue_callbacks.go:65](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/api/server/queue_callbacks.go#L65) — `s.queue.OnSuccess`
- [apps/core/internal/api/sse/hub.go:54](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/api/sse/hub.go#L54) — `func (h *Hub) Broadcast`

## E22 · PTY、输出解析与节流

- [apps/core/internal/core/runner/pty.go:17](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/core/runner/pty.go#L17) — `func NewPTYRunner`
- [apps/core/internal/core/runner/exec.go:39](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/core/runner/exec.go#L39) — `func (r *ExecRunner) RunWithOptions`
- [apps/core/internal/core/parser/tracker.go:32](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/core/parser/tracker.go#L32) — `func (pt *ProgressTracker) ShouldUpdate`

## E23 · 上游契约测试（本次未运行）

- [apps/core/internal/core/downloader_contract_test.go:23](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/core/downloader_contract_test.go#L23) — `func loadContractFixture`
- [apps/core/internal/core/downloader_contract_test.go:38](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/core/downloader_contract_test.go#L38) — `func parseContractFixture`

## E24 · Electron 发现执行与会话选择

- [apps/electron/src/services/discovery-executor.service.ts:26](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/electron/src/services/discovery-executor.service.ts#L26) — `export class DiscoveryExecutorService`
- [apps/electron/src/services/browser-tab-manager.service.ts:568](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/electron/src/services/browser-tab-manager.service.ts#L568) — `async discover(`

## E25 · 发现结果存储和私有字段

- [apps/core/internal/discovery/types.go:13](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/discovery/types.go#L13) — `DefaultRetention`
- [apps/core/internal/discovery/types.go:104](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/discovery/types.go#L104) — `type PrivateSource struct`
- [apps/core/internal/discovery/store.go:221](https://github.com/mediago-dev/mediago/blob/f2aa40a8ce7cdd02fae7cf9b13b0860f29eb5088/apps/core/internal/discovery/store.go#L221) — `func (s *Store) PrivateHeaders`
