# NotebookLM 生产：导出瓶颈修复与 Fallout 单条交付

决策：無涘（授权先试一条；交付仓库先查因再安全合并；孤儿 claim 先查因再正常跑） ｜ 记录：DSH agent

## NotebookLM 自动化：2026-09-12 23:44–23:59 +0800

更新于 2026-09-12 23:59:00 +0800 · 记录者 DSH agent（deepseek-v4.1-flash）

- 只读预检 ready_to_claim：2454 候选、`claimed_today` 0、`remaining_today` 10；浏览器 CDP 可达、已登录、NotebookLM 页面可编辑、来源面板与 Studio 控件均在，判 `available`。本条试点为既有 `generating` 孤儿 claim（`youtube-QBAM27YbKZg`），**不在**本批 10 条预检清单内。
- **交付阻塞的根因（已修复）**：AI-Life-Mentor `main` 与 `origin/main` 各自新增 —— 远端只动 `briefings/*.md`、`pkm-index.json`，本地只动 CV/ProjectInfo/scripts，**零文件重叠**，属纯分叉而非历史改写；`git push --dry-run` 曾被 non-fast-forward 拒绝。合并（ort，0 冲突，40 个未提交改动未受影响）后推送，交付路径恢复。
- **孤儿 claim 处置**：`run-20260911205631-38417`（9-11 20:56 领取）确认「领取后未执行」——`runs/` 无该 run 目录、磁盘无产物。按 skill 记 `fail`（原因 run-interrupted）关闭，再按显式 retry 重跑，获新 run `run-20260912234414-85900`；旧 4 次尝试全部保留在 `attempt_history`。
- **导出瓶颈根因与修复**：三次历史失败停在同一处——viewer 下载在 headless 下 stall、页内 `fetch` 被 CSP/CORS 拦、canvas 因跨域污染不可读、adapter 无 pageAssets/bundle 能力。修复为三条可用链路，沉淀在 `automation/browser/asset-capture.cjs` 与 `automation/browser/README.md`（含 302 同 requestId、缓冲式 `getResponseBody` 死锁、缓存吞请求、clip `scale>2` 超时等实测坑）。
- **产物**（全部上传图床并回读 sha256 一致）：信息图 5,662,026B / 2752×1536（lh3 原始 PNG，两次运行字节一致）；思维导图 995,618B / 2664×4621（viewer 内「全部展开」＋DOM 核验：折叠指示 `>` 计 0、内容节点 51、4 个层级列、4 秒内渲染稳定；`observed_depth` 4、`collapsed_node_count` 0）；演示文稿 19,741,391B / 13 页 PPTX（每页为整页图片，无 `<a:t>` 文本 run；中文简体经目视核验）。
- 长期本 880ad454（52 来源、来源混杂）未动；沿用 9-11 轮换本 2ce16a4b，全程仅 1 个来源。中文总结复用该本 9-11 已生成正文（同一唯一来源），补全来源边界后成稿。
- **运行级事件**：headless Chrome 在 pptx 下载 stall 后崩溃（CDP 9222 失联），`launch.cjs` 重启复用登录态、notebook 状态无损，再下载即正常完成。claim 记录晚于部分实际生成动作（先做不耗配额的根因定位再补 fail＋retry），已在 run report 如实记录，未改写时间。
- 结果：attempted 1 / ready 1 / remote_delivered 1 / failed 0 / skipped 9（本批试点范围）/ 当日 remaining 9。ledger 35 ready / 24 failed / 1 generating → **36 ready / 24 failed / 0 generating**。
- 交付：inbox `2026-0912-2357-level-spatial-design.json`，提交 `ac64039`，推送 `1e11120..ac64039`；`origin/main` blob `ed7eaf90586d50979bf63d69ecba470d7109a9c5` 与本地一致。AI-Life-Mentor 为**私有**仓库，未认证 raw 读取对本仓库任何文件（含 README.md、9-10 已推送文件）均返回 404，故交付判据取 fetch 后的远端 ref＋blob 比对。
- 未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站内容。批次未扩大：预检清单其余 9 条留待下一批，须另行确认。
- 证据：`/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-12T2344+0800-fallout-export-fix/report.json`（同目录 `preflight-after.json`、`artifacts/`、`mindmap-source.svg`）。

原始对话：dialogues/2026-0912-notebooklm-automation.md「2344 修复 Fallout 导出瓶颈并完成单条交付」
