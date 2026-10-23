# 1023 收集端：3 claim 零交付，导图查看器改中文致 export 系统性失败停批（muse-spark-1.3-contributor）

- preflight `ready_to_claim`（2454 候选/选中 10，自 `jI-5nZgtWc8` 起；当日已 claim 0/10、剩余 10）。
- 浏览器就绪 `available`：复用隔离画像 headed CDP 9223，到场零标签页后重建长期本
  `c8090f54` 标签，直链可编辑（Studio 47 卡/9 创建钮、来源 25、deck-immediate、chat 可用，
  见 `runs/batch-20261023T1000-manual/` 内 preflight.json、studio/deck/chat/sources 探针与两张截图）。
- attempted 3（耗 claim 3）/ **ready 0 / remote_delivered 0** / failed 3 / skipped 7（主动停批）；
  当日 claim **3/10、剩余 7**；ledger 现 **101 ready / 94 failed**，无非终态条目。
- 失败（claim 均已耗，不自动重跑）：
  - `jI-5nZgtWc8`（run-20261023100502-18830）`export` 信息图页面资产路径
    `asset-capture.cjs` 未捕获到 200 响应体（`pauses=[]`）；按技能第二条路径
    （viewer 下载控件）补试成功：5.6MB PNG、2752x1536、签名正常（存该条 `dl2/`）。
    但 ledger 已记 failed、`publish` 只接受 generating 状态，且无 retry 授权，故仍记 failed。
    同条总结 3732 字、三卡（信息图/导图/演示文稿）均已生成。
  - `_ez3DAnaxTU`（run-20261023102258-25131）`export` 导图 `no expand button`；
    信息图经页面资产路径正常导出 5.4MB（证明该路径间歇可用，非系统性坏）。
  - `gdBACyIOCtc`（run-20261023111323-50264，Hi-Fi RUSH 卡通渲染，总结 4628 字、三卡齐）
    `export` 导图同样 `no expand button`。
- 根因（确诊，非内容问题）：导图查看器（OOPIF `scf.usercontent` 帧）工具栏已中文化，
  展开按钮现为 `aria-label="展开所有节点"`（图标文本 `expand_all`），另有放大/缩小/下载；
  runner `nblm-export-mindmap.cjs` 只查英文 `Expand all nodes`/`Collapse all nodes`，
  故每条必败。复现证据：同一 viewer 手工重跑导出脚本同样失败；帧内读出 12 文本节点
  （根＋5 子，4 个 `>` 折叠态），内容正常、只是选择器过期。第 2 条的“源过薄”判断作废
  （当时误读了主页面 SVG，未进帧内确认）。
- 停止原因：`export-mindmap-systematic`（BLOCKED，为保剩余 7 claim 及服务端生成配额主动停批；
  按当前 runner 跑下去条条必败）。浏览器未关（9223 保留，导图 viewer 标签页在位）。
  PicGo 存活（未做探测性上传）。AI-Life-Mentor 本轮无 ready，故无交付、无合并动作。
- 证据 `~/.local/state/learn-about-games/notebooklm-daily/runs/batch-20261023T1000-manual/` 及三条
  `runs/2026-10-23T10*-item-*/`；诊断脚本 `/tmp/diag-mm-oopif.cjs`（未进仓库）。
- 下一步待無涘定：① 是否授权修 runner（导图展开按钮兼容中英文 aria-label＋回归验证），
  collapse 侧标签（疑 `收起所有节点`）修时一并确认；② 修好后三条 failed 是否新自然日用
  `retry` 显式重跑（各耗 1 新 claim，旧失败保留）；③ 剩余 7 条（`10YhD9HMsPA` 起）顺延。
  failed 均不自动重跑。

更新于 2026-10-23 · 记录者 muse-spark-1.3-contributor（本会话）
