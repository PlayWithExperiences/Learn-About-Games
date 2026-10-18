# 2026-1018 收集端 headed 重跑：登录墙，零 claim 停批

- 新 preflight（`~/.local/state/learn-about-games/notebooklm-daily/runs/2026-1018-headed/preflight.json`，原始 JSON 已存）：`ready_to_claim`，
  目录候选 2454、选中 10，当日已 claim **0/10、剩余 10**；候选 10 条自 `youtube-9fms9kUzn3Y` 起（与早轮一致）。
- ledger 核对：`99 ready / 85 failed`，无非终态条目；本轮未 claim、未写 ledger，未删改。
- 浏览器就绪检查（不耗配额，**headed**：`channel=chrome, headless=False`，复用收集链隔离画像
  `~/.local/state/learn-about-games/browser-profile`，CDP 9223，允许弹出真实 Chrome 窗口）：
  长期本 `c8090f54` 直链落到 `accounts.google.com` **Sign in（Email or phone）页**，
  全程无 `notebook.google.com` 页面目标（`browser-readiness.json`＋`cdp-targets.json`＋`state-signin.png` 在证）。
  Studio 探针 `panel:false/createButtons:0/count:0`；deck 探针 `slides create button not reachable`；
  chat 探针字面 `available:true` 是登录页无 composer、无限额文案导致的假阳性，不视为可用。
  复用画像登录态已过期；按停止规则未输入凭据、未点请求权限。与早轮 headless 的
  `accessrequest`/`location=unsupported` 不同源（本轮是登录墙，不是服务端落点阻塞）。
- 按技能 `unavailable` 不得 claim：attempted 0 / ready 0 / failed 0 / skipped 10，
  claim 消耗 **0**，当日累计仍 0/10。运行级阻塞 `browser-notebook-access`（BLOCKED）。
- PicGo 存活（GET `http://127.0.0.1:36677/` 404 即存活）；无 ready 故未做 AI-Life-Mentor 合并/交付，
  其本地未提交改动保持不动。浏览器已关，9223 无残留。
- 证据 `~/.local/state/learn-about-games/notebooklm-daily/runs/2026-1018-headed/`。
- 下一步：用户亲手在复用画像 headed 窗口中完成 Google 登录（或恢复账号对长期本 `c8090f54` 的可编辑访问），
  恢复后从 `9fms9kUzn3Y` 起跑剩余 10 条；failed 不自动重跑。

模型：muse-spark-1.3-contributor。授权：每日固定范围（≤10/串行1/重试0）＋本轮跑完即推（只推本轮文件）。
