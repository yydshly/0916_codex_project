# 第三方来源与许可

## PPT Master

- 作者：Hugo He
- 来源：https://github.com/hugohe3/ppt-master
- 研究提交：`52a2801c27cb468d7ea95e25c7b0702eaa360914`
- 许可证：MIT，完整文本见 `LICENSES/ppt-master-MIT.txt`。
- 本项目使用上游检查器与 SVG → PPTX 转换器生成样例；未复制上游完整源码或依赖。
- 原生图表、表格与公式标记遵循上游公开接口。示例文字、虚构数据、SVG、生成脚本和网页为本研究编写。

## 官方案例预览与链接

- 来源：https://github.com/hugohe3/ppt-master-examples
- 链接核对提交：`3adb91f1d3226f5a48c2df1d10e1f3f37a246a87`
- 作者：Hugo He 与贡献者；案例仓库声明为 MIT，完整文本见 `LICENSES/ppt-master-examples-MIT.txt`。
- `app/style-previews/` 的 36 张 JPG 来自固定提交下 18 个官方案例的完整 SVG 页面，经本地 Microsoft Edge 渲染，未裁掉原有署名。用于说明风格，不标记为本研究生成。
- `app/style-catalog.json` 逐页记录原始路径、链接、SHA256、案例名称和对应风格规范；`app/style-preview-evidence.json` 记录预览图片哈希与尺寸。原始 SVG 仅保存在已忽略的 `upstream/ppt-style-cache/`；官方完整 PPTX 通过链接引用。
- 案例页可能包含照片、商标、业务数据和引用作品，保留各页原有来源说明；仓库 MIT 声明不代表第三方素材本身均无额外使用限制。
- PPT Master 名称用于识别研究对象；本展示页是独立研究项目，不是上游官网。

## 实际渲染图

`app/previews/` 是本地 Microsoft PowerPoint 对本项目示例 PPTX 的逐页 PNG 导出；`app/style-previews/` 是官方 SVG 的浏览器渲染，两者验证方式不同。`assets/` 是本研究展示页的实际浏览器截图。图片不含桌面、账号或其他个人界面信息。
