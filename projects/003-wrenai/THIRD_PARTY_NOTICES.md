# 来源与许可

本项目是对 [Canner/WrenAI](https://github.com/Canner/WrenAI) 的独立研究，不是官方产品或官方示例。正文根据上游资料用中文整理，并保留来源链接；页面、合成数据与实验代码为本研究新增。

- 固定研究提交：`871118e94f1525c401d867074c05e7e8eefca1cc`。
- 运行依赖：`@wrenai/wren-core-wasm@0.4.1`，上游发布包声明 Apache-2.0。许可文本保存在 `LICENSES/WrenAI-Apache-2.0.txt`。二进制通过 npm 安装用于测试；前端按需从固定版本 CDN 加载，不把约 72 MB 二进制提交到研究仓库。
- 上游许可映射：core/sdk/skills/examples 为 Apache-2.0，docs 为 CC BY 4.0。本文档的技术解释参考了其架构、MDL 和 SDK 文档，并进行了中文整理、删减和实验补充。上游文档作者为 Canner / WrenAI contributors；文档许可见 `LICENSES/WrenAI-CC-BY-4.0.txt`。
- Playwright 为开发测试依赖，Apache-2.0，浏览器及其附带组件按各自许可证使用，不随静态展示发布。
- Wren 名称归其权利人所有。页面未使用官方品牌图片；“W”标记为本研究文本装饰。
- 本项目没有加入上游完整源码，也未使用真实客户资料或模型密钥。
- `app/media/wrenai-summary.png` 是根据研究结论原创排版的信息图，非上游官方图片、非运行截图。内置 image_gen 两次请求因网络错误失败，最终由 HTML/CSS 源稿通过 Chrome 导出 PNG；未使用 API 备用生成方式。尝试时的提示词保存在 `notes/summary-image-prompt.txt`，可编辑源稿为 `experiments/summary-poster.html`。
