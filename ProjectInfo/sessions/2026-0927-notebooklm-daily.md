# NotebookLM daily collection — 2026-09-27（本会话）

## 0055 首条 claim 在 isolate-source 失败，停批

决策：無涘（本批 NotebookLM 长本 + PicGo + AI-Life-Mentor Git，≤10 distinct claim、串行 1、自动重试 0；已批准） ｜ 记录：DSH agent ｜ 2026-09-27T00:55:00+08:00

- 只读预检 `ready_to_claim`：目录候选 2454、选中 10、当日已 claim 0、剩余 10；首条 `youtube-iVBCBcEANBc`（The Simplest AI Trick in the Book）。预检原文存 `runs/2026-09-25T153000-manual/preflight.json`（目录名日期为旧，实际为北京时间 09-27）。
- 浏览器就绪 `available`（不耗配额）：detached headless Chrome + `--disable-features=LocalNetworkAccessChecks`；长期本 `2ce16a4b…` 可编辑（Studio 135 卡、createButtons 9）；deck 即时可生成、chat 可用。教训：DSH 后台作业启动的 Chrome 会随作业退出，必须 nohup-detached 保活；且 runner 会用同 profile 自起 9222 浏览器，同 profile 双实例互挤。
- claim 前 runner 自检的 studio-read 因新起浏览器未渲染完成而阻塞一次（`claim_consumed=false`，未耗配额）；浏览器就绪后同一候选预检重试，claim 成功：`run-20260927004349-36353`。
- 导入成功（URL 占位标题，属已知元数据窗口）；`isolate-source` 退出 1（来源列表 dump），与 sibling 会话两条同签名。根因见 0047 条：隔离中途卡片翻牌为真实标题，keep（video-id）失效。runner 已记 producer `failed`；无明确授权不 `retry`。
- 本会话 `attempted1 / ready0 / remote_delivered0 / failed1 / skipped9`；全日 ledger：claimed 3、剩余 7、generating 0（ready 66 / failed 60）。未上传/交付，未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站。
- 并发说明：`youtube-DkT6oJLDXgE`、`youtube-ZLDK_yFW_NE` 的 claim 与失败非本会话所为，归属 0003-manual 会话（其 0047 条已收官）；本会话未与其重叠 claim。跨会话共享同一 claim 池与同一笔记本，后续须单主认领。
- 证据：`runs/2026-09-25T153000-manual/`（preflight.json、browser-readiness.json、item1 日志、report.json）及 `runs/2026-09-27T004342-item-iVBCBcEANBc/`（report.json）。
- 下一步待無涘定：修 runner（隔离 keep 双身份 video-id + catalog 标题、全程重判）并验证后再跑批，或单会话认领后继续，或留待明日；三条 failed 均不自动重跑。

原始对话：本会话 `/collect-resources-about-game`（含一次批量确认），未复制 NotebookLM 私有正文。
