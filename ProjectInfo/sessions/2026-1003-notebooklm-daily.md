# 2026-1003 收集端：10 claim 跑满，4 交付，PicGo 401 间歇复发

- 批次：preflight ready_to_claim（2454 候选/10 选）→ 用户批准（≤10/串行1/重试0）→ 首驱动 3 条（2 ready＋交付，1 upload-401 失败；第 4 条 claim 前 studio 面板未渲染，rc=3 未耗 claim 即停）→ 探针确认恢复后重启驱动 7 条。共 attempted 10，claim 10/10 用尽。
- 成功 4：axkPXCNjOh8、pLbmZT70rtA（首驱动直推）；B11RlHZsmGE、wHqbKFGyCdQ（生成＋上传＋发布全过，push 被消费端超前提交拒绝 → 零重叠合并后只重跑交付脚本，远端 blob 回读确认）。
- 失败 6（均已记 producer failed，不自动重跑）：fYBvYWf_dTg／1xWg54mdQos（PicGo github 401，本地三件齐全）；zB0vUMKkmuI（isolate 前 0 匹配）；miu3ldl-nY4／oDC4Rzh1viw（导入标题与 catalog 精确不一致）；zqQPFeiiUKg（summary 抽取失败）。
- 关键发现：401 间歇性（22:12 拒、22:30 同链路成功），PicGo 日志为 axios 401，runner 侧表现为 HTTP 500 —— 以后 upload-500 先查 PicGo 日志里的真实后端状态码。
- 未做：PKM、Issue、Daily Check-in、网站发布。浏览器已关。
- 证据：`~/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-30T1000-manual/report.json` 及同目录四件套；各条目 `runs/2026-10-03T*-item-*/`。
- 待決（需無涘授权）：① 两条 401 是否只重跑上传＋发布＋交付；② 两条标题不一致是否修 catalog 后 retry；③ 其余 failed 不动。

决策：無涘（批次范围已批；失败不自动重跑） ｜ 记录：DSH agent ｜ 2026-10-03T23:15:00+08:00
