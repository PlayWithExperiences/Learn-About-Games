# NotebookLM 自动化对话摘录（2026-09-15 下午）

## 1100 收集端跑批：修掉两处环境阻断后交付 2 条，止于演示文稿节流

决策：無涘（既有连续跑批授权：北京时间每日最多 10 次 distinct claim、串行 1、自动重试 0；本次未扩大范围） ｜ 记录：DSH agent

本文件为关键原文摘录，不声称是完整聊天导出。

用户请求（任务内容摘录）：执行共享 `collect-resources-about-game` skill——从资源目录选未处理视频，经 NotebookLM 生成中文总结与三件产物，校验后写 ready 并单文件交付到 AI-Life-Mentor 远端 inbox；不触发消费端。

DSH agent 实际过程与结果：

- 准入（不消耗 claim）：preflight `ready_to_claim`，2,454 候选、在列 8、当日已 claim 2、剩余 8；浏览器指向长期生产 notebook，正文 43,716 字、来源勾选 14、无登录墙 → `available`；演示文稿闸门 `available`。
- 先修两处环境阻断再领取：①早上 07:48 判定"viewer 被本地网络访问检查阻断、无法证明导图全部展开"——以 `LAG_CHROME_ARGS="--disable-features=LocalNetworkAccessChecks"` 启动后，用**现成旧卡**做零配额探针，`MINDMAP_OK`（49 内容节点、折叠 0、层级 3）。②演示文稿下载控件当天连崩 5 次（0–39,985 B 停滞，有头无头都复现），而本机 6,000,000 B 下载完整成功，说明坏的是那条资产传输；改为"先页面网络栈取字节、失败才回退下载控件"，实测取回 17,526,368 B、两次 sha256 一致。
- 跑批：attempted 4 / ready 2 / 远端交付 2 / failed 2；当日 claim 用 6，**剩余 4 未动**。
  - `youtube-aX8f1lE09uY` Albion Online 经济平衡 → `2026-0915-1213-balance-economy.json`
  - `youtube-o2C4z_apu2I` Offworld Trading Company → `2026-0915-1228-systems-mechanics.json`
  - `youtube-gd_Qe9uATA` CS:GO 经济：三件产物已生成两件，deck 卡 1200s 未就绪；复核该卡显示「未能生成演示文稿」＝服务端失败。
  - `youtube-IiDPa50bgNg` Supercell：deck 提交时无「立即生成」按钮，复核闸门＝`deck feature throttled: 此内容将在几小时后生成。`
- 停止原因：**演示文稿容量节流（quota_block）**。按 skill 停止当天剩余批次，未消耗剩余 4 次 claim；不是无候选、不是通道失败、不是浏览器不可用。
- 未重试既有 failed（skill 要求显式授权）、未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站内容。

代码改动（本轮实证驱动）：

- 新增 `automation/browser/nblm-capture-deck.cjs`：浏览器级 `Browser.setDownloadBehavior {behavior:'deny', eventsEnabled:true}` 拿签名 URL（浏览器自己取消传输，不落半截文件也不崩），再用页面网络栈 `Fetch` 响应阶段 + `<img>` 触发流式取字节；落盘按 ZIP 签名与成员校验。
- `automation/run-notebooklm-item.py`：deck 改为"先页面路径、失败回退下载控件"并在 `export_note` 记录实际路径；claim 前先跑 `nblm-studio-list.cjs`（否则上一条留下的查看器让闸门报假 `unavailable`，11:21 实测把整批停在 claim 之前）；卡片上限 1200s → 2700s；错误卡片与"提交时无生成按钮"两处都改为带真实原因失败。
- 验证：`tests/lib/notebooklm-deck-capture.test.ts` 3 例（真实容器接受／足量登录页拒绝／有 ZIP 签名无成员的截断容器拒绝）；全量 **234 单测通过**、`astro check` 106 文件 0 错误。

完整叙述与证据路径见 `sessions/2026-0915-notebooklm-deck-capture-fix.md`。
