# 本机浏览器通道（DSH/NotebookLM 共用）

> 2026-09-14 18:05 更正：演示文稿下载已修复。必须显式设置 `chromiumSandbox: true` 才能阻止 Playwright 默认注入 `--no-sandbox`。下方早期“无法修复 / TUN 根因”的结论已被实测推翻，详见文末。

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

## 2026-09-12 补记：导出瓶颈的根因与可用链路（asset-capture.cjs）

`asset-capture.cjs`（新增）是**图片类产物取原始字节**的推荐路径，绕开下载弹窗与 CORS：
`CDP Fetch.enable(requestStage: 'Response')` → 触发一次 `<img>` 加载 → `Fetch.takeResponseBodyAsStream`
→ 循环 `IO.read` → 落盘。2026-09-12 取得信息图原始 PNG 5,662,026B / 2752×1536，两次运行 sha256 一致。

踩过的坑（都会表现为"卡住"，不是报错）：

- **资产 URL 是 302 链**：`lh3.googleusercontent.com/notebooklm/…` → `lh3.google.com/rd-notebooklm/…`
  → `lh3.googleusercontent.com/rd-notebooklm/…`，**同一个 requestId**。必须认最终 200，
  在 302 上调 `getResponseBody` 会得到 `Can only get response body on requests captured after headers received`；
  只在 `responseReceived` 上按 URL 匹配会漏（事件里的 URL 与请求 URL 不同形），改按 `requestWillBeSent` 锁 requestId。
- **不要用缓冲式 getResponseBody**：`Network.getResponseBody` 与 `Fetch.getResponseBody` 在这条多 MB 响应上
  都会一直不返回（不是报错）。必须 `takeResponseBodyAsStream` + `IO.read`。
- **缓存会吞掉请求**：不 `Network.setCacheDisabled(true)` 时图片走内存缓存，`Fetch.requestPaused` 一次都不触发。
- 资产 URL 需要登录态：`curl` 直取会拿到 `Sign in - Google Accounts` 页面（HTTP 200 + text/html），
  所以不要用"HTTP 200"当成功判据，要看 content-type 与字节。
- 触发用 `<img>` 加载而不是 `fetch()`：后者被页面 CSP `connect-src` 拦掉，`<img>` 走 `img-src`（viewer 已允许）。

**渲染截图路线的边界**（本次实测，供以后参考）：`Page.captureScreenshot` 带 `clip` 时
`scale: 1` / `scale: 2` 正常（3.3s 内返回），`scale: 3.44` 直接超时不返回；
`fromSurface: false` 会**忽略 clip**，返回整视口（且是 2×）。所以别用它裁单个元素，用 SVG 抽取或流式取字节。

**下载路线仍可用但会 stall**：`Browser.setDownloadBehavior({downloadPath, eventsEnabled:true})`
本次**生效**（文件确实落在指定目录），但 headless 下 pptx 下载停在 43,977B 零增长，
且随后 headless Chrome 崩溃（CDP 9222 失联）。`launch.cjs` 重启后复用登录态、notebook 状态无损，
再点同一下载即正常完成（19,741,391B / 13 页）。结论：图片优先走 `asset-capture.cjs`，
文件类下载失败时先重启浏览器再试一次，不要反复点击。

## 2026-09-13 补记：整条流水线的步骤工具与「会伪装成别的症状」的坑

单条材料现在由 `automation/run-notebooklm-item.py` 端到端驱动（导入来源→隔离→总结→三产物→导出→上传→发布→远端交付），
批量由 `automation/run-notebooklm-batch.sh` 串行推进，产物已在时用 `automation/finish-notebooklm-item.py` 只补导出与发布。
本目录下的步骤工具：

| 工具 | 作用 |
| --- | --- |
| `nblm-add-youtube.cjs` | 经「网站」对话框导入一个 YouTube 来源，按集合差识别新来源 |
| `nblm-list-sources.cjs` / `nblm-isolate-source.cjs` | 列出/取消勾选来源，只留当前候选（按 aria-label 原子寻址＋每步重查） |
| `nblm-set-sources.cjs` | 在生成对话框的来源浮层里选择来源并确认 |
| `nblm-ask.cjs` / `nblm-extract-answer.cjs` | 提问并**只取最新一条**回答（旧回答仍在屏上，取错就会张冠李戴） |
| `nblm-generate-artifact.cjs` | 生成 信息图／思维导图／演示文稿，提交前断言对话框必须是「1 个来源」 |
| `nblm-studio-list.cjs` | 把 Studio 面板归位到列表（查看器各有各的关法，兜底重载页面） |
| `nblm-export-image-artifact.cjs` / `nblm-export-mindmap.cjs` / `nblm-export-deck.cjs` | 三类产物的导出 |
| `nblm-capture-deck.cjs` | 演示文稿的**首选**导出路径：经页面网络栈取回原始 PPTX（下载控件在本机不可靠，见 0915 补记） |
| `nblm-deck-available.cjs` | 生成前探测演示文稿是否可用（**不消耗 claim**） |
| `nblm-chat-available.cjs` | 生成前探测对话是否被 AI 用量限额挡住（**只读页面，不发送问题、不消耗配额**） |

**最容易踩、也最该记住的一条**：Studio 生成对话框**有自己独立的来源选择器，默认全选**，
和左侧来源面板的勾选是两套状态。它会静默产出「基于 N 个来源」的串源产物。此外**页面重载会把来源勾选重置为全选**，
而对话框只在**打开那一刻**快照当前选择。所以：重载后必须重新隔离，生成前必须断言对话框显示「1 个来源」。

其余同年实测坑：产物卡片文本含相对时间（`· N 分钟前`），整串比较会漏判已知卡片，须按 (图标, 标题) 稳定键比较；
信息图查看器只有 ✕、没有「关闭网页查看器」；演示文稿对话框的语言是 mat-select，点击会弹出遮罩并遮住提交按钮（应校验默认值而非点击）；
批量时未等笔记本空闲就取卡片基线，上一候选的卡片可能在基线之后完成并被误认成新产物。

**演示文稿容量节流**：2026-09-13 01:06 起，演示文稿对话框出现「此内容将在几小时后生成。或者，升级可缩短等待时间。」
且「立即生成」按钮消失，只剩「稍后生成」。已在长期本 880ad454 复核，**同一账号下同样被节流 → 属账号级容量限制，换 notebook 无用**。
演示文稿是三件必填产物之一，因此流水线在 **claim 之前**先跑 `nblm-deck-available.cjs`，不可用就不领取，
避免把当天的 10 次 claim 浪费在做不完的材料上。

## 2026-09-13 补记：来源卡片标题的**元数据占位窗口**（害了整整一批）

新加进去的链接来源，NotebookLM **先拿原始 URL 当卡片标题**（`https://www.youtube.com/watch?v=…`），
等 YouTube 元数据解析完才换成真实标题。`nblm-add-youtube.cjs` 从 `[class*=source-title]` 读到的
就是当时那一刻的文本，所以：

- 落在窗口内 → 读到 URL；落在窗口外 → 读到真实标题。同一条来源，两次读可以不一样。
- 20:04–20:06 三条候选因此被 runner 的标题模糊匹配判成「导入的不是这个候选」，
  **但三条来源其实都导入成功了**（两条的卡片在几分钟后已显示真实标题，第三条仍显示 URL）。
  三条各消耗 1 次 claim，当天 10 次 claim 全部用尽。
- **判据**：URL 形态的卡片不能当标题比对，要**从 URL 里取 video id 做精确匹配**——它比任何标题比对都更准。
  已落在 `automation/run-notebooklm-item.py` 的 `source_identity_ok()`，并有
  `tests/lib/notebooklm-source-identity.test.ts` 守住（走 `--identity-check` 调真身，不复制规则）。
- 教训的通用形态：**「读到的东西不对」与「这件事没做成」是两回事**。读不到标题时不要改判业务结论，
  要换一个能证明身份的判据再判。

## 2026-09-14 补记①：viewer 帧被 Chrome 本地网络访问检查挡住

- 现象：`nblm-export-mindmap.cjs` 报 `EXPAND: no expand button`，但并非没有按钮——OOPIF 目标里是一张
  Chrome 错误页，错误码 **`ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS`**。本机代理把
  `*.scf.usercontent.goog` 解析成 **198.18.5.x**（fake-IP），Chrome 因此把这台"服务器"当成局域网设备而拦截。
- **误判风险**：脚本原先取"第一个 `*.scf.usercontent` 目标"，而卡片刚点开时列表里往往只有 `shim.html`，
  于是拿一张错误页当 viewer 查工具栏。现已改为**轮询直到某个帧里真的有 `svg` 或展开/折叠按钮**
  （`findViewerTarget`），找不到就打印实际见过的帧名再失败。
- 绕开方式：`launch.cjs` 新增 `LAG_CHROME_ARGS` 透传，用
  `LAG_CHROME_ARGS="--disable-features=LocalNetworkAccessChecks"` 启动即可让 viewer 正常加载并导出成功。
- 根治仍在代理/DNS：让 `*.scf.usercontent.goog` 走真实 DNS，或把 fake-IP 段移出 `198.18.0.0/15`。

## 2026-09-14 补记②：演示文稿下载在本机不可用（未解决）

- PPTX 与 PDF **两条导出路径都会在约 44–45 KB 处停下**：实测 PPTX 停在 23,480 / 8,259 / 45,375 B，
  PDF 停在 43,999 B 并连续 240 秒零增长；且该下载会**稳定导致自动化 Chrome 崩溃**（一轮内 5 次）。
- 下载地址是 `lh3.google.com/rd-notebooklm/…`——与**工作正常的图片导出同一个 host**，所以问题不在域本身，
  更像下载响应的这条链路被代理/本地网络策略截断。
- `nblm-export-deck.cjs` 的停滞判据（10 秒无增长即判 stall）对 20 MB 文件偏短；本次先实测了真实增长曲线，
  确认停滞属实后才停止，未无限重试。
- **结论**：演示文稿是合同三件必填之一，拿不到就不发布 `ready`；产物与总结都留在 notebook/磁盘，
  环境修好后这一条只需补导出与交付。

## 2026-09-14 补记③：演示文稿下载的完整实验记录（**未解决**）

同一台机器上反复复现：**PPTX 与 PDF 都在 8–59 KB 区间停住，连接随后死亡**。实测停点（字节）：
PPTX 23,480 / 8,259 / 45,375 / 59,004 / 15,452 / 11,772 / 41,250；PDF 43,999 且 240 秒零增长。
停住后 `lsof` 显示已无进程持有该文件、100 秒内字节数完全不变——不是"还在慢慢下"，是传输死在半路。

**已排除的因素**（都做了对照实验）：

| 假设 | 实验 | 结果 |
|---|---|---|
| headless 特有 | 有头模式同一卡片 | 0 B 停滞，同样失败 |
| 下载/卡片选择器写错 | 面板归位后重开卡片 | `OPEN: opened` / `MENU: clicked`，选择器正常 |
| `Browser.setDownloadBehavior` 有 bug | 与 `Page.setDownloadBehavior` 对比 | 两者表现一致 |
| 本机 Chrome 下载整体坏掉 | 从 `127.0.0.1` 下 3,000,000 B 文件 | **完整下完**（见下条 `--no-sandbox`） |
| 代理/fake-IP 是主因 | `--no-proxy-server` 直连 | 仍停在 11,772 B，但页面本身能正常加载 |
| HTTP/2 或 QUIC 相关问题 | `--disable-http2 --disable-quic` | 仍停在 41,250 B |
| OOPIF 帧也要拦 | 浏览器级 `Target.setAutoAttach` + Fetch 拦截 | 导出请求**不经过页面网络栈**（是浏览器进程发起的下载导航），无法拦截 |

**同时找到并修掉的真缺陷**：`launch.cjs` 一直硬传 `--no-sandbox`。在 macOS 上它会让 Chrome 的下载路径直接崩溃——
去掉后，同一个 Chrome 从 `127.0.0.1:8799` **完整下完了 3 MB** 文件（`--no-sandbox` 时同样操作直接崩浏览器）。
现在 `--no-sandbox` 改为按需（`LAG_NO_SANDBOX=1`）开启。这修好了本机下载的稳定性，但**没有**修好演示文稿那条传输。

**结论**：演示文稿的传输在本机网络环境里被中途切断，属于环境问题，不是仓库代码能修的。可用于后续排查的方向：
TUN 模式的 MTU/TCP 参数（`utun2/4/5/6` 的 mtu 分别只有 1380/1000/1380/1380），或代理对该大响应的处理。
在它修好之前，合同要求的三件产物无法齐备，因此本收集端**不能**发布 ready。

## 1805 下载修复复核（2026-09-14）

决策：無涘（要求检查并修复采集流程） ｜ 记录：Codex

- **已修复并实测通过**：旧改动只删 `args` 中的 `--no-sandbox`，但 Playwright 1.62.1 默认又加入它。现在通过 `chromiumSandbox: process.env.LAG_NO_SANDBOX !== '1'` 在实际 API 边界启用沙箱；运行中的 Chrome 参数已确认不含该开关。
- 同一长期 notebook、同一卡片 The Long Dark Narrative Blueprint，默认 `nblm-export-deck.cjs` 单次导出成功：18,559,684 B，14 slides / 14 media，ZIP CRC 与全部 slide XML 解析通过，Chrome 下载后仍可达。SHA-256 `ffe24bbfd481de6696b77e6c747031b039cacfcbfe50d1ffb34bf77e44b14437`。
- **更正旧结论**：“仓库修不了、必须调 TUN/MTU”证据不足，已被本次成功下载反驳。本次未改系统网络；沿用既有 viewer 的 LocalNetworkAccessChecks 绕开配置。不能由一次成功断言所有网络条件均无问题，也不能把旧实验视为已排除未被隔离的因素。
- 新增两项入口回归测试，直接执行真实 launch.cjs 并检查传给 Playwright 的选项，覆盖默认启用及显式禁用；已通过。
- 修复验证未 claim/retry、生成、上传、publish 或远端交付，既有 failed 未伪改为 ready。下载已保存在本机 `notebooklm-daily/runs/2026-09-14T1805-sandbox-fix/`，可供后续恢复验收；本次完成的是下载缺陷修复，不是生产交付。
- 本机证据：上述目录 report.json；完整 PPTX 留在同目录，不提交私人生成材料。

## 2026-09-14 补记④：未读徽标会污染卡片图标（代价＝两条白跑）

Studio 卡片字符串里，未读徽标 `未读` 夹在图标类名和标题之间：`stacked_bar_chart未读 标题 1 个来源 · …`。
`run-notebooklm-item.py` 的 `parse_card` 原来用 `\w+` 抓图标，而 `\w` **不匹配中日韩字符**，于是 `未读`
被并进图标，得到 `icon='stacked_bar_chart未读'`；它与 `ICON['infographic']='stacked_bar_chart'` 永不相等，
`wait_for_card` 便认定"该类卡片从未出现"。

- 后果：2026-09-14 第 1、2 条**产物其实都已生成**，却各等了 1200 秒后记 `failed`；两条的 claim 白花。
- 关键点：**刚生成的卡片必然是未读的**，所以这个 bug 专门打击"本该成功"的情况，已读的旧卡片反而正常——
  这也是它藏了这么久的原因。
- 修法：图标类名限制为 ASCII（`[a-z_]+`），未读徽标单独匹配；并加 `--parse-cards` 入口让
  `tests/lib/notebooklm-source-identity.test.ts` 直接跑真函数（现 8 例）。
- 同时给 `wait_for_card` 加了每 5 分钟"重读列表"（`LAG_CARD_REREAD_SEC`），因为 Studio 列表也会长时间
  卡在「正在生成」而服务端早已完成；重读属于等待的一部分，不是补救步骤。

## 2026-09-15 补记：演示文稿改走**页面网络栈**取字节（下载控件在本机再次不可用）

09-14 的下载修复（`chromiumSandbox`）当天有效并交付了 4 条，但 09-15 同一路径再次失败，且这次
每一发都**把浏览器一起带走**：

- 5 次尝试的停滞点：0 / 16,685 / 16,686 / 31,408 / 39,985 B；有头与无头都复现；换一张 09-14
  刚成功下过 18.5 MB 的旧卡片（The Long Dark Narrative Blueprint）同样停在 0 B。
- 已排除"下载机制坏了"：同一浏览器、同一沙箱配置，从本机 `127.0.0.1:8799` 下 6,000,000 B
  **完整成功**，`Browser.downloadProgress` 一路到 completed。所以坏的是那条资产传输，不是下载能力。
- 运行中的 Chrome 参数已核对：无 `--no-sandbox`，带 `--disable-features=LocalNetworkAccessChecks`。

**可用路径**（`nblm-capture-deck.cjs`，已实测 17,526,368 B、两次运行 sha256 一致、`unzip -t` 零错误）：

1. 在**浏览器级** CDP 会话设 `Browser.setDownloadBehavior {behavior:'deny', eventsEnabled:true}`，
   再点卡片的「更多选项 → 下载 PowerPoint (.pptx)」。`Browser.downloadWillBegin` 会给出那条签名 URL，
   而浏览器自己取消传输——不落半截文件，也不崩。
2. 用页面自己的网络栈请求该 URL：`Fetch.enable(requestStage:'Response')` ＋ 一次 `<img>` 触发
   （`img-src` 允许该域，`fetch()` 被 CSP `connect-src` 拦），`takeResponseBodyAsStream` + `IO.read` 取回字节。
3. 落盘后按 ZIP 签名 + `[Content_Types].xml`/`ppt/` 成员 + 字节下限校验，错误页或截断容器一律拒绝。

踩过的两个坑：`Browser.downloadWillBegin` 只发给**浏览器级**会话（页面级会话收到 0 个事件）；
下载 URL 的 `c=` 令牌是 protobuf（`notebooklm` / `artifacts_media` / 工件 UUID），但卡片 DOM 里那个 UUID
**不是**工件 UUID，凭它拼 URL 会 404——只能从真实下载事件里取。

流水线据此改为"先页面路径、失败才回退到下载控件"，并在 claim 前先跑一次 `nblm-studio-list.cjs`：
上一条材料导出后留下的查看器会遮住 create 按钮，让 `nblm-deck-available.cjs` 报假 `unavailable`
（09-15 实测把整批停在 claim 之前）。卡片上限默认也从 1200s 提到 2700s：本账号的演示文稿
生成实测约 27 分钟才完成；同时 `wait_for_card` 现在遇到「未能生成演示文稿」这类错误卡片会带真实原因立即失败，
不再空等到上限。

## 2026-09-16 补记：对话也会被 AI 用量限额挡住，且只有发问时才发现

- 现象：对话输入框禁用，页面写明「已达到 AI 用量限额。12:38 PM 之后，所有功能都将可用。」/「对话功能已停用，需等到 12:38 PM」。
- 影响：总结阶段本质是向 notebook 提问，所以限额期间**任何候选都做不完**；但限额只在真正提问时才暴露，即在 claim 之后 → 会白花额度。已新增 `nblm-chat-available.cjs`：**只读页面**（发送 0 个问题、不消耗配额），只在读到明确的限额文案时返回 `available:false` / 退出码 3；输入框只是被来源面板挤出视野时不判为阻断，避免误停整批。流水线在 claim 前调用它。
- 复核用法（给 reviewer）：向 notebook 索取来源原文引句是有效的逐句核对手段，但**提问前必须先把来源面板重新隔离成单一来源**——页面重载会把勾选重置为「全选」，此时问出来的引句会混入别的来源（2026-09-16 实测：未隔离时同一问题的回答里同时出现 Astroneer 与 Kingdoms and Castles 的原句）。隔离脚本每次都会打印唯一保留的来源名，可据此确认。

## 2026-09-17 补记：Studio 卡片列表会与服务器脱节，等待必须能自我刷新

- 现象：运行器等到超时并报 `stacked_bar_chart card was not ready after 900s (no card of this type
  appeared)`，producer 记 `failed(generation)`；失败后 4 分钟用**同一个** `nblm-studio-list.cjs`
  读同一个列表，56 张卡片里本条三张成品都在（本条卡片完成时间约 07:45 / 07:47 / 07:54，超时发生在 07:56）。
- 07:58 的整页 innerText 仍写着「sync 正在生成信息图… 基于 1 个来源」，而那张信息图 07:47 就已完成 ——
  面板 DOM 停在旧快照上，最长可拖十几分钟（09-14 有过 80+ 分钟的记录，且当时是刷新后才显示真标题）。
  列表非空时旧脚本不会重载，所以旧的"每 5 分钟重读一次"读到的还是同一份冻结快照。
- 另一处独立缺陷：生成中的行不是成品卡片形状（图标是 `sync`，类型名在标题里，如
  `sync正在生成信息图… 基于 1 个来源`）。旧 `wait_for_card` 先比图标、不匹配就 `continue`，
  于是「正在生成」分支对自己那条产物永远不可达，超时文案也变成"没有出现这种卡片"——与页面所说相反。
- 修法：①`classify_cards()` 先按类型词识别生成中/失败行，再匹配成品卡；②解析后的 icon+title 集合
  连续 `LAG_CARD_STALE_SEC`（默认 240s）不变即强制 `nblm-studio-list.cjs --reload` 重载页面，
  超时前再强制刷新一次（重载会重置来源勾选，因此只在三条产物都提交之后发生，并在运行日志里留痕）；
  ③`studio_cards()` 读不到列表时抛 `studio-read`，不再返回空列表冒充"没有卡片"；claim 前严格读一次，
  读不到就不领取（rc=3，不消耗当日 claim）。
- 回归：`tests/lib/notebooklm-card-wait.test.ts` 用 `--wait-plan` 回放 09-17 的真实卡片串
  （冻结面板→刷新后取到成品、生成中不误报为缺失、错误卡片带真实原因、基线旧卡不被误认）。
- 补记（同日晚些时候实测确认）：生成中的那一行**确实**在 `[class*=artifact-item]` 列表里，形如
  `sync 正在生成信息图… 基于 1 个来源`（图标 `sync`、类型名在标题里）。所以 ①按行识别与
  ②按整表冻结刷新，两条修法各自独立成立。
- 补记二：列表返回**空数组**也必须当成"面板没在渲染列表"，而不是"没有产物"。同日晚些时候
  另一次等待里，读连续 20 分钟拿到空列表并沿途重载了 5 次，最后仍报"没有出现这种卡片"，
  而那张卡片其实 5 分钟后就完成了。现在空列表会**立即**触发一次刷新（60 秒内不重复），
  `--json` 输出新增 `panel` / `createButtons` 字段，`studio_cards()` 在 `panel:false`、
  或在 claim 前/生成前基线上读到空列表时直接抛 `studio-read`（空基线会让所有旧卡都像新卡），
  超时文案也会带上 `cards=N` 与最后一次读取错误。

## 2026-09-18 补记：演示文稿捕捉必须挑对下载事件；来源名要在隔离前重新解析

**deck 捕捉取错事件（当天两次 deck 导出失败的原因）**

- 现象：`nblm-capture-deck.cjs` 报 "captured bytes are not a valid PPTX"，落盘的是 14,404 B 的 PNG；
  另一次报 "no 200 response body captured; pauses=[]"（页面 `<img>` 根本没发出请求）。
- 根因：脚本原先**只取第一个** `Browser.downloadWillBegin` 事件。该卡片的菜单会先后触发多个下载事件，
  第一个不是 PPTX，于是后续按错误 URL 取流；换一张卡片、换个时刻，取的又可能是对的那个 URL。
- 修法：收集全部下载事件，**优先选文件名以 `.pptx` 结尾的那个**（其次排除图片扩展名），并把候选文件名打印出来。
  修后实测取回 17,206,190 B 合法 PPTX，sha256 与另一路径一致。
- 另记：回退路径（viewer ⋮ 下载）当天实测以 ~1.2 KB/s 前进，20 分钟内只到 835 KB，无法在超时内完成；
  直接用 Node 取那个签名 URL（无论带不带浏览器 cookie）都只得到 HTML。页内 `<img>` 路线仍是唯一可用路径。

**来源名在隔离前必须重新解析**

- 现象：`youtube-lnnsDi7Sxq0` 在 isolate-source 失败，`keep` 传的是 `lnnsDi7Sxq0`，
  而隔离脚本按精确名/精确 video id 匹配都找不到它。
- 根因：导入时卡片名还是原始 URL（`isolate_name()` 于是返回 video id），但**导入与隔离之间**元数据已解析，
  卡片名变成真实标题；旧的 `keep = isolate_name(item.imported_title, ...)` 用的是导入时的旧值。
- 修法：新增 `resolve_isolate_name()`，在隔离前用 `list_sources()` 的**当前**列表重新解析：
  恰好一个匹配才返回（URL 卡返回 video id、已解析卡返回真实标题），0 个或多个匹配直接报 `isolate-source` 失败。
  测试入口 `--isolate-name`；回归在 `tests/lib/notebooklm-source-identity.test.ts`。

## 2026-09-27 补记：卡片在隔离**中途**翻牌（09-18 修法的未覆盖窗口）

- 现象：连续两条（`DkT6oJLDXgE`、`ZLDK_yFW_NE`）import 时是 URL 占位、`keep`=video id，
  约 1 分钟后解析出真实标题，而 61 来源逐个取消勾选要数分钟——`keep` 在循环中途失效，
  isolate 以 0 匹配拒判，claim 已花。注意与 09-18 的区别：那次是隔离**之前**已翻牌，
  这次是隔离**进行中**翻牌。
- 修法（两层，都是精确匹配，不引入模糊）：
  ① runner 新增 `await_source_settled()`：隔离前轮询至多 180 秒，等本条 URL 卡消失再取新鲜列表
  解析（已解析的导入即时通过，不多等；空读当面板故障跳过，超时则沿用旧行为）。真实标题一旦落定不再变，
  此时 `keep`=真实标题全程稳定。
  ② `nblm-isolate-source.cjs` 新增可选 `--keep-alias=`：每轮按“主 keep 或别名（catalog 标题）或 video-id”
  三者任一精确命中即保留，覆盖翻牌恰好落在 catalog 标题上的情况。`nblm-generate-artifact.cjs` 的重隔离调用不变（别名可选）。
- 验证：全量单测 258 通过（+3 别名/翻牌用例）；真机三项——不存在 keep 拒判无副作用、真实标题 60 pass 隔离成功、
  主 miss＋别名命中隔离成功；事后重载页面恢复 61/61 全选，共享本无残留。失败的两条 ledger 保留，不自动重跑。
