# 2026-1018 收集端重跑（权限恢复后）：长期本仍失访，零 claim 停批

- 新 preflight（`~/.local/state/learn-about-games/notebooklm-daily/runs/2026-1018-2nd/preflight.json`，原始 JSON 已存）：`ready_to_claim`，
  目录候选 2454、选中 10，当日已 claim **0/10、剩余 10**；候选 10 条自 `youtube-9fms9kUzn3Y` 起（与早轮一致）。
- ledger 核对：`99 ready / 85 failed`，无非终态条目；本轮未 claim、未写 ledger，未删改。
- 浏览器就绪检查（不耗配额，全新拉起隔离 headless）：长期本 `c8090f54` 直链首载曾短暂渲染出
  notebook 标题/URL，随即客户端侧跳转落到 `notebook.google/?location=unsupported` 营销页；
  CDP goto 重导航复核同样落 unsupported。按上游指令加查旧本 `880ad454` 直链，同样落
  unsupported（`browser-readiness.json`＋`cdp-targets.json` 在证；与 10-15 unsupported 同源）。
  `nblm-studio-list` 报 `panel:false/artifacts:0`，`nblm-list-sources` 报 `NO_PAGE_TARGET`，
  deck/chat 零配额探针皆无可用 notebook 页面目标。账号仍登录（非登录页/非二次验证），
  未点请求权限，未输入凭据。
- 按技能 `unavailable` 不得 claim：attempted 0 / ready 0 / failed 0 / skipped 10，
  claim 消耗 **0**，当日累计仍 0/10。运行级阻塞 `browser-notebook-access`（BLOCKED）。
- 未做上传/交付（无 ready，无 fetch/合并动作）。浏览器已关，无残留。
- 证据 `~/.local/state/learn-about-games/notebooklm-daily/runs/2026-1018-2nd/`。
- 下一步：账号恢复对长期本 `c8090f54` 可编辑访问后，从 `9fms9kUzn3Y` 起跑剩余 10 条；failed 不自动重跑。

模型：muse-spark-1.3-contributor。授权：每日固定范围（≤10/串行1/重试0）＋本轮跑完即推（只推本轮文件）。
