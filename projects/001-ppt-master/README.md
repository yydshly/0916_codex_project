# 001 · PPT Master 能力实验室

> 把内容策划、18 种视觉风格与原生 PPT 导出串成工作流；附 36 张官方风格预览及可编辑图表、表格、公式实测。

| 项目资料 | 内容 |
| --- | --- |
| 上游 | [hugohe3/ppt-master](https://github.com/hugohe3/ppt-master) |
| 研究版本 | [`52a2801c27cb468d7ea95e25c7b0702eaa360914`](https://github.com/hugohe3/ppt-master/tree/52a2801c27cb468d7ea95e25c7b0702eaa360914) |
| 原始许可证 | MIT，Copyright (c) 2025–2026 Hugo He |
| 发现渠道 | 用户提供 GitHub 链接 |
| 研究日期 | 2026-09-16 |
| 状态 | 已完成本地转换与展示实验；其他能力尚未端到端复现 |

## 价值与使用方式

PPT Master 将「理解材料 → 组织叙事 → 选择视觉方向 → 设计页面 → 导出可编辑 PPT」组织成可复用工作流。风格规范帮助整套页面保持一致，SVG 到 PowerPoint 原生对象的转换使成果可以继续修改和交付。

选风格应同时考虑内容、受众和用途：管理层汇报偏结论与证据，发布会偏产品形象，课堂解释偏逐步推导。18 个风格是可定制的设计方向，不是固定模板或能力上限；图片素材内部仍不支持逐元素编辑。

本研究已验证后半段转换与原生对象能力。风格展厅收录官方作品，用于选方向与看效果，尚未接入在线输入内容后自动生成的服务。

## 直接看效果

![PPT Master 18 种视觉风格汇总截图](assets/styles-overview.png)

引导图是[多风格汇总页](app/overview.html)的实际浏览器截图，包含 18 种官方案例的完整封面静态预览，不是同一内容批量生成的对照实验。交互展厅可继续查看 36 张封面与内容页；原生 PPT 实测区的五页预览则来自 Microsoft PowerPoint 16.0 对本地生成文件的实际渲染。

- [本地展示页](app/index.html)：五页切换、形状版 / 原生数据版对比、放大预览、文件下载。
- [18 种风格展厅](app/styles.html)：5 类筛选、关键词搜索、封面 / 内容页切换、完整官方案例入口；[风格总结](notes/style-guide.md)。
- [一页总览](app/overview.html)：18 种风格的紧凑汇总，点击任意缩略图进入对应案例详情。
- [原生数据版 PPT](app/downloads/native-data.pptx)：真正的图表、内嵌工作簿、表格和公式。
- [形状版 PPT](app/downloads/editable-shapes.pptx)：图表与表格拆成形状，方便分别修改外观。
- [研究笔记](notes/architecture.md)、[文件结构报告](app/evidence.json)、[PowerPoint 渲染记录](app/render-evidence.json)。
- [与 Dashi、Ian 手绘 PPT 的对比](notes/comparison.md)：结合此前研究和实际产物，比较实现机制、编辑能力与适用场景。
- [桌面画廊截图](assets/gallery.png)、[移动端截图](assets/mobile.png)、[浏览器检查记录](app/browser-evidence.json)。

GitHub 文件页不会执行 HTML。下载仓库后双击 `app/index.html` 即可离线浏览，也可以按下方方式运行本地服务。官方案例链接需要联网。

## 实验覆盖

| 页码 | 展示内容 | 可观察结果 |
| --- | --- | --- |
| 1 | 文字与封面 | 标题和说明以文本对象保存 |
| 2 | 流程图 | 节点、文字和连线是独立对象 |
| 3 | 柱状图 | 原生数据版含 Chart 与 XLSX，形状版含独立柱形和标签 |
| 4 | 表格 | 原生数据版保留 5 行 × 3 列结构 |
| 5 | 数学公式 | LaTeX 转换为可编辑 Office Math，非公式图片 |

两份 PPT 各有 5 页、5 页备注与淡化切换。原生数据版含 1 个图表、1 个内嵌 XLSX、1 张表格、1 个公式；两份 PPT 均无图片对象。图中数据为虚构示例。

这是一项 **SVG → PPTX 工具链复现实验**：本研究编写示例 SVG，调用上游检查器和导出器，再通过 PowerPoint 渲染。没有把它描述成完整 AI 策划工作流的一键生成效果。

## 本地浏览

无前端依赖、无构建步骤，HTML / CSS / JavaScript 与图片都在 `app/` 内。在仓库根目录执行：

```powershell
python -m http.server 8765 --bind 127.0.0.1 --directory projects/001-ppt-master/app
```

打开 <http://127.0.0.1:8765/>。也可直接打开 `app/index.html`，页面不依赖跨文件 `fetch` 请求。

## 网页发布

网页使用独立静态文件，不依赖模型密钥或服务端。仓库通过 `python scripts/build_web.py` 汇总所有已收录静态演示，GitHub Actions 将 `web/` 发布到 Pages；本站位于 `001-ppt-master/` 子路径，默认演示入口为 `styles.html`。发布不会运行模型或重新生成 PPT，已验证的文件随站点提供下载。

本地预览完整发布目录：运行构建脚本后执行 `python -m http.server 8766 --bind 127.0.0.1 --directory web`。发布配置和接入说明见[部署文档](../../docs/DEPLOYMENT.md)。

## 重新生成 PPT

需要 Python 3.10+、Git。依赖独立安装到本子项目虚拟环境，上游代码保留在已忽略的 `upstream/`。从研究仓库根目录执行：

```powershell
# 如果 upstream/ppt-master 已存在，复用该克隆并确认版本，不重复 clone。
git clone https://github.com/hugohe3/ppt-master.git upstream/ppt-master
git -C upstream/ppt-master checkout 52a2801c27cb468d7ea95e25c7b0702eaa360914
python -m venv projects/001-ppt-master/.venv
projects/001-ppt-master/.venv/Scripts/python.exe -m pip install -r projects/001-ppt-master/requirements.txt
projects/001-ppt-master/.venv/Scripts/python.exe projects/001-ppt-master/scripts/build_sample.py
```

macOS / Linux 将解释器路径换成 `projects/001-ppt-master/.venv/bin/python`。本次导出使用宿主提供的 Python 环境；PowerPoint 渲染在 Windows 上完成。

构建脚本生成五页 SVG 和备注，运行上游检查器，导出两个 PPT，断言原生对象数量，写入公开结构报告与展示数据。不需要模型 API Key。若运行上游完整 Agent 工作流，需按其说明另装完整依赖。

检查结果为 **0 个错误、10 条非阻断性建议**，建议涉及逻辑分组与页面角色元数据。未绕过检查。详细边界见[研究笔记](notes/architecture.md)。

### 重新渲染效果图

Windows 且已安装 Microsoft PowerPoint 时运行：

```powershell
./projects/001-ppt-master/scripts/render_powerpoint.ps1
```

通过 COM 以无演示窗口模式打开两份文件，逐页导出 PNG，并记录输入哈希。重新生成 PPT 后需重新渲染，避免旧预览与新文件不一致。不具备 PowerPoint 时可使用仓库中的现成预览。

## 目录

```text
app/                    可直接打开或静态托管的展示页
  downloads/            两份实际生成的 PPTX
  previews/             两个版本的 PowerPoint 渲染图
  style-previews/       36 张官方 SVG 的静态预览
  styles.html           可筛选的 18 种风格展厅
  overview.html         多风格汇总与项目引导图来源
  sources/              可直接查看的 SVG 副本
  evidence.json         原生对象统计与文件哈希
  render-evidence.json  PowerPoint 渲染尺寸、版本和输入哈希
sample/svg_output/      可复现的五页 SVG 原稿
sample/notes/           演讲备注
scripts/                示例生成与 PowerPoint 渲染工具
notes/                  源码研究与实验边界
assets/                 本地浏览器实际截图
THIRD_PARTY_NOTICES.md   来源与许可说明
```

## 验证与限制

- 已完成：上游 SVG 检查、两份 PPTX 导出、原生对象结构断言、PowerPoint 打开与逐页渲染、桌面及移动端展示检查。
- 这不是在线 AI 生成服务。网页提供效果浏览和现成文件下载，没有虚构上传、生成或云端编辑功能。
- 可编辑性对应下载的 PPTX，网页预览是图片。
- 原生图表可能改变布局细节，两种版本不保证逐像素一致。流程图连接线没有自动吸附关系。
- 未复现：模板、原稿编辑、旁白、复杂动画、图片重建、完整 AI 策划。扩展能力指向官方案例。
- 当前仅提供本地展示，尚未部署公网地址；`projects.json` 的 `demo` 保持为空。

## 来源与许可

上游代码未复制进本子项目。脚本、五页实验数据和展示页为本研究编写；附带[上游 MIT 许可证](LICENSES/ppt-master-MIT.txt)与[第三方说明](THIRD_PARTY_NOTICES.md)。风格展厅保存官方案例的静态页面预览和逐页来源，完整官方演示通过链接引用，不标记为本研究生成。

- [主仓库](https://github.com/hugohe3/ppt-master)
- [官方案例库](https://hugohe3.github.io/ppt-master-examples/)
- [技术设计](https://github.com/hugohe3/ppt-master/blob/52a2801c27cb468d7ea95e25c7b0702eaa360914/docs/technical-design.md)
- [PowerPoint 能力映射](https://github.com/hugohe3/ppt-master/blob/52a2801c27cb468d7ea95e25c7b0702eaa360914/docs/powerpoint-svg-mapping.md)
