# 本机预览服务诊断

更新于 2026-08-23 22:03 · 记录者 AI

## 2203 本机预览服务不可访问诊断

- 结论：AI（诊断）。初次探针访问资源页和根路径均为 connection refused，4321 没有 TCP 监听进程；故障边界是本地 Astro 开发服务器未运行，不是 `resources` 路由返回 404。
- 恢复：AI。执行 `npm run dev -- --host 127.0.0.1` 后，Astro v7.2.0 后台进程正常运行；`npm exec -- astro dev status` 报告服务运行中。
- 验证：AI。资源页和带 `resourceTopic=game-feel-feedback` 的 URL 均返回 HTTP 200；`npm run check` 通过（0 errors / 0 warnings）。当前资源页单次 HTML 响应约 13.9 MB，这是独立的加载性能风险。
- 边界：AI。没有现有日志证明此前进程是被关闭、终端回收还是异常退出，因此不把“崩溃”写成已确认事实；本次未改网站代码、部署设置或公开状态。
- 下一步：AI。若希望 URL 不再依赖手动启动，需要另行配置常驻开发进程或固定启动入口；这不属于本次诊断内的代码修复。

原始对话：dialogues/2026-0823.md「2203 本机预览服务不可访问诊断」
