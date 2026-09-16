# 固定版本源码证据

研究提交：`44c02f752a50a0f4be473ba7de452f0d2050fc83`。以下链接均固定到此提交，便于后续复核。这里记录的是静态源码证据，不代表已在真机上运行。

| 模块 | 源码与关键符号 | 支持的结论 |
| --- | --- | --- |
| 技术栈 | [package.json](https://github.com/liriliri/aya/blob/44c02f752a50a0f4be473ba7de452f0d2050fc83/package.json) | Electron、React、TypeScript、adbkit、scrcpy 客户端依赖；版本字段为 1.14.2 |
| 设备与无线连接 | [adb.ts](https://github.com/liriliri/aya/blob/44c02f752a50a0f4be473ba7de452f0d2050fc83/src/main/lib/adb.ts)：getDevices、pairDevice、connectDevice、startWireless | 创建 ADB 客户端、跟踪设备、配对码配对、TCP/IP 连接及旧式无线开启 |
| 基础命令与进程 | [base.ts](https://github.com/liriliri/aya/blob/44c02f752a50a0f4be473ba7de452f0d2050fc83/src/main/lib/adb/base.ts)：shell、spawnAdb、getProcesses | 执行设备 Shell、调用 ADB 可执行文件、解析 top；支持自定义 ADB 路径 |
| 应用管理 | [package.ts](https://github.com/liriliri/aya/blob/44c02f752a50a0f4be473ba7de452f0d2050fc83/src/main/lib/adb/package.ts)：installPackage、uninstallPackage、startPackage、stopPackage、clearPackage、disablePackage | 安装卸载、启停、清除数据、启用和禁用等实现 |
| 文件与 APK | [file.ts](https://github.com/liriliri/aya/blob/44c02f752a50a0f4be473ba7de452f0d2050fc83/src/main/lib/adb/file.ts)：pullFile、pushFile 及 APK 路径处理 | 文件传输与应用包导出相关操作 |
| 投屏服务启动 | [scrcpy.ts](https://github.com/liriliri/aya/blob/44c02f752a50a0f4be473ba7de452f0d2050fc83/src/main/lib/adb/scrcpy.ts)：ScrcpyClient.start / push | 推送 scrcpy.jar 并通过 app_process 启动 3.1 服务 |
| 投屏与控制 | [ScrcpyClient.ts](https://github.com/liriliri/aya/blob/44c02f752a50a0f4be473ba7de452f0d2050fc83/src/renderer/screencast/lib/ScrcpyClient.ts)：createVideo、createAudio、createControl、injectTouch | WebCodecs 视频解码、音频处理、输入事件控制、剪贴板及录屏接口 |
| 辅助服务通信 | [server.ts](https://github.com/liriliri/aya/blob/44c02f752a50a0f4be473ba7de452f0d2050fc83/src/main/lib/adb/server.ts)：AyaClient、getPackageInfos、getFileUrl | 推送 aya.dex，以 app_process 启动，通过本地 Socket / Protobuf 请求数据并转发文件服务 |
| 设备端服务 | [Server.kt](https://github.com/liriliri/aya/blob/44c02f752a50a0f4be473ba7de452f0d2050fc83/server/server/src/main/java/io/liriliri/aya/Server.kt) | Kotlin 服务监听名为 aya 的 LocalServerSocket 并处理连接 |
| CPU 采样 | [cpu.ts](https://github.com/liriliri/aya/blob/44c02f752a50a0f4be473ba7de452f0d2050fc83/src/main/lib/adb/cpu.ts)：getCpus、getCpuLoads | 读取 /proc/stat，基于两次计数差计算负载；另读频率与温度信息 |
| 内存与截图 | [adb.ts](https://github.com/liriliri/aya/blob/44c02f752a50a0f4be473ba7de452f0d2050fc83/src/main/lib/adb.ts)：getMemory、screencap | /proc/meminfo 查询与设备截图接口 |
| FPS | [fps.ts](https://github.com/liriliri/aya/blob/44c02f752a50a0f4be473ba7de452f0d2050fc83/src/main/lib/adb/fps.ts)：getFps、getFpsByLatency | 从 SurfaceFlinger 翻转计数或图层时间戳估算 FPS |
| 布局 | [Layout.tsx](https://github.com/liriliri/aya/blob/44c02f752a50a0f4be473ba7de452f0d2050fc83/src/renderer/main/components/layout/Layout.tsx)：refresh、save；adb.ts 的 dumpWindowHierarchy | 截图与 uiautomator dump 结合，展示层级并保存 XML |
| 日志与终端 | [logcat.ts](https://github.com/liriliri/aya/blob/44c02f752a50a0f4be473ba7de452f0d2050fc83/src/main/lib/adb/logcat.ts)、[shell.ts](https://github.com/liriliri/aya/blob/44c02f752a50a0f4be473ba7de452f0d2050fc83/src/main/lib/adb/shell.ts) | 日志读取和交互式 Shell 的设备接口 |
| WebView | [webview.ts](https://github.com/liriliri/aya/blob/44c02f752a50a0f4be473ba7de452f0d2050fc83/src/main/lib/adb/webview.ts)：getWebviews | 查找 webview_devtools_remote Socket，转发并访问 /json 获取页面 |
| 端口映射 | [port.ts](https://github.com/liriliri/aya/blob/44c02f752a50a0f4be473ba7de452f0d2050fc83/src/main/lib/adb/port.ts)：forward、reverse | 正向和反向端口映射的界面调用接口 |

官方说明补充：[ADB 的组成与无线连接](https://developer.android.com/tools/adb)、[AYA 安装与连接](https://aya.liriliri.io/guide/quickstart.html)、[AYA WebView 条件](https://aya.liriliri.io/guide/panel/webview.html)、[scrcpy 媒体与控制原理](https://github.com/Genymobile/scrcpy/blob/master/doc/develop.md)。这些外部文档可能随时间更新，不作为本次真机验证的证明。
