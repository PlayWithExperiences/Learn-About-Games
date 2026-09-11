# 本机浏览器通道（DSH/NotebookLM 共用）

给没有浏览器适配器的客户端用的最小可用通道：一个带持久登录态的
自动化 Chrome + 原生 CDP 驱动脚本。已在 2026-09-03 的 Shadow Complex
交付中验证通过（读总结/边界正文 → publish → 远端交付）。

## 文件

- `launch.cjs`：启动持久化 Chrome（`channel: 'chrome'`），监听 CDP 端口，
  打开起始页后常驻。`--headless` 可切无头（登录态建好后日常用无头）。
- `cdp.cjs`：原生 CDP 驱动（Node 内置 `fetch` + `WebSocket`，不依赖
  playwright 版本）：`state` / `shot` / `goto <url>` / `eval '<js>' [out]`。

前置：仓库已有 `@playwright/test`（`launch.cjs` 只用它启动一次浏览器，
之后全走原生 CDP）。`npx playwright install chromium` 按需执行；
`launch.cjs` 用的是本机真 Chrome（`channel: 'chrome'`），与用户日常
Chrome 共存（不同的 `--user-data-dir`，互不干扰）。

## 登录态（只做一次）

```bash
export LAG_BROWSER_PROFILE=/Users/haodong/.local/state/learn-about-games/browser-profile
export LAG_CDP_PORT=9222
node automation/browser/launch.cjs https://notebook.google.com/
# 在弹出的窗口里由用户亲手登录 Google（含二次验证），密码不过任何 agent 之手
```

- Profile 目录权限 `700`，只住本机，绝不进 git（靠 `.gitignore` + 本文件约束，
  不要 `git add -f` 它）。
- 日常运行时 `--headless` 复用同一 profile，无需再登录；Google 会话过期时
  重复上面的一次性登录即可。
- 用完即关浏览器；不要长期挂着占窗口。

## 停止规则（硬）

- 出现 Google 重新登录/二次验证页 → 立刻停，绝不输入凭据，等用户亲手处理。
- 只读用户日常 Chrome 的拷贝曾被证死（Google 登录墙），不要再试；
  更不许写/锁用户正在跑的原 Profile。
- `eval` 只读 NotebookLM 对话正文；不得导航到非 notebook 域，
  不得点击下载/发布类控件（除非当次任务明确授权）。

## 与 Skill 的关系

共享 skill（`.agents/skills/collect-resources-about-game`）保持客户端无关；
本目录是 DSH 侧的运行时适配实现。换客户端时照着“启动→登录→驱动”
三步重做适配即可，skill 正文不需要改。

## 2026-09-10 补记：新版思维导图 viewer 与 oopif-probe
- viewer 已迁入跨进程 OOPIF（`*.scf.usercontent.goog`，MindmapApp）：`Page.getFrameTree` 看不见它，须直连 `/json/list` 里 type=iframe 的独立 websocket。探针：`oopif-probe.cjs '<js>' [out]`。
- "全部展开"入口在 viewer 内工具栏（`aria-label="Expand all nodes"`），外层卡片 ⋮ 菜单确实只有删除。开卡用卡片行内 button 的 DOM `.click()`（祖先 DIV 点击/双击无效，坐标点击易误触）。
- viewer 内下载时好时坏，生产仍按 skill 做双路径＋字节校验。

## 2026-09-11 补记：SVG 导出链路（绕下载崩溃）
- viewer 下载会崩 headless Chrome（`Unconfirmed *.crdownload` 残体为证）；`Page.printToPDF`/`captureScreenshot` 在 OOPIF 上不可用（仅顶层 target 可截图）。
- 可用链路：oopif-probe 进帧点 Expand-all → 取 `svg` 外层 HTML＋内联 computed 关键样式（fill/color/font/stroke）＋getBBox 设 viewBox → 去仅含`<`/`>`的文本节点（导航 affordance，非内容）→ 独立 Chrome `--headless --screenshot --window-size` 渲染定宽 PNG。已验证 2664×4428 中文清晰、零折叠标记。
- 同理可用于信息图 viewer（若其为 SVG/DOM 渲染）；纯图片 viewer 则用顶层 clip 截图＋DSF。
