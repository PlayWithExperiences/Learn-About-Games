# NotebookLM 收集端：演示文稿改走页面网络栈

决策：無涘（既有连续跑批授权；本次为纯本地修复与当天既定额度内跑批） ｜ 记录：DSH agent

更新于 2026-09-15 · 本文件随本轮跑批结果补全

## 起点与准入（全部不消耗 claim）

- preflight `ready_to_claim`：2,454 候选、在列 8、当日已 claim 2、剩余 8。原始响应见本轮 runs 目录 `preflight.json`。
- 浏览器检查：把自动化 Chrome 指向长期生产 notebook `2ce16a4b-c41a-42f4-8e03-d387494cdd17`，正文 43,716 字、来源勾选框 14、Studio 面板可见、无登录墙 → `browser-notebook-access=available`。
- 演示文稿闸门 `nblm-deck-available.cjs` → `available`（immediate generation offered）→ 可以领取。

## 修掉的两处环境阻断

### 1. 思维导图 viewer 被 Chrome 本地网络访问检查挡住（早上那条的根因）

长期 notebook 上已有一张现成思维导图卡可用作**零配额探针**。以
`LAG_CHROME_ARGS="--disable-features=LocalNetworkAccessChecks"` 启动 Chrome 后直接导出该旧卡：

```
VIEWER_TARGET: 5aa511b5-…   （不再是 shim.html）
EXPAND: clicked
VERIFY: {"contentNodes":49,"expandAffordances":0,"columns":4,"renderStable":true}
DEPTH_BELOW_ROOT: 3   →  MINDMAP_OK
```

即早上 07:48 判定"本地网络连接被阻断、无法证明全部展开"的那条路径已恢复；探针没有领取任何 claim。

### 2. 演示文稿下载控件再次不可用（09-14 的修复今天失效）

同一张卡片（Rogue Legacy Budget Blueprint，本机 09-14 刚成功下过 18.5 MB 级别的 deck）连续 5 次停滞：

| 尝试 | 模式 | 停滞字节 |
| --- | --- | --- |
| 1 | headless | 39,985 |
| 2 | headed（重启后） | 31,408 |
| 3 | headed（再重启） | 16,686 |
| 4 | headed，换旧卡 The Long Dark Narrative Blueprint | 0 |
| 5 | headed，URL 探针 | 16,685 |

每次都伴随浏览器进程死亡（`CDP_FAIL: fetch failed`）。**排除"下载能力坏了"**：同一台机器、同一
Playwright 沙箱配置，从本机 `127.0.0.1:8799` 下 6,000,000 B 完整成功，`Browser.downloadProgress`
一路到 `completed`；运行中的 Chrome 参数经 `ps` 核对为无 `--no-sandbox`、带
`--disable-features=LocalNetworkAccessChecks`。因此坏的是那条资产传输，不是下载机制。

## 可用路径：页面网络栈取原始字节

新增 `automation/browser/nblm-capture-deck.cjs`：

1. 浏览器级 CDP 会话设 `Browser.setDownloadBehavior {behavior:'deny', eventsEnabled:true}`，
   再点卡片「更多选项 → 下载 PowerPoint (.pptx)」；`Browser.downloadWillBegin` 给出签名 URL，
   浏览器自己取消传输（不落半截文件、不崩）。
2. 用**页面**网络栈请求该 URL：`Fetch.enable(requestStage:'Response')` ＋ 一次 `<img>` 触发
   （`img-src` 允许该域，`fetch()` 被 CSP `connect-src` 拦），`takeResponseBodyAsStream` + `IO.read` 取字节。
3. 落盘后按 ZIP 签名 + `[Content_Types].xml`/`ppt/` 成员 + 字节下限校验。

实测两次取回同一张卡：17,526,368 B、sha256 `cfdd3acc…` 两次一致、`unzip -t` 零错误、80 个成员。

**两个坑**：`Browser.downloadWillBegin` 只发给浏览器级会话（页面级会话收到 0 个事件）；下载 URL 的
`c=` 令牌确实是 protobuf（`notebooklm` / `artifacts_media` / 工件 UUID），但**卡片 DOM 里那个 UUID
不是工件 UUID**，凭它拼 URL 会 404——只能从真实下载事件里取。

## 一并修的三个流水线缺陷

- **导出顺序**：演示文稿改为"先页面路径，失败才回退到下载控件"，并在结果 `export_note` 中如实记录走了哪条。
- **claim 前先把 Studio 面板归位**：上一条材料导出后留下的查看器会遮住 create 按钮，使
  `nblm-deck-available.cjs` 报假 `unavailable`（11:21 实测把整批停在 claim 之前，未消耗 claim）。
  现在 claim 前先跑一次 `nblm-studio-list.cjs`，并把退出码记入 item 日志。
- **卡片上限与真实失败原因**：`LAG_CARD_TIMEOUT_SEC` 默认 1200 → 2700（本账号演示文稿实测约 27 分钟完成）；
  `wait_for_card` 现在遇到「未能生成演示文稿」这类错误卡片会带真实原因立即失败，不再空等到上限
  再报"该类卡片从未出现"。

## 验证

- `tests/lib/notebooklm-deck-capture.test.ts` 新增 3 例（真实容器接受；足量大小的登录页拒绝；
  有 ZIP 签名但无成员的截断容器拒绝），经 `--verify` 入口调用真身。
- 全量 `npm run test`：**234 通过**；`npm run check`（astro check）：106 文件 **0 错误 0 警告**。
- 本机原始证据目录：`~/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-15T1057-collect/`
  （`preflight.json`、`browser-readiness.json`、`probe-artifacts/probe-mindmap.png`、
  `probe-artifacts/rogue2.pptx`、`deck-url-probe*.cjs`）。

## 本轮跑批结果

- 口径：preflight（只读）`ready_to_claim`，2,454 候选、在列 8、**当日已 claim 6**、剩余 4；串行 1、自动重试 0。
- **attempted 4 / ready 2 / 远端交付 2 / failed 2 / skipped 0**，另有一次在 claim 前被闸门拦下（0 消耗）。
- 交付（每条三件产物、上传后回读 sha256 全一致、远端 blob 与本地逐字节一致）：
  - `youtube-aX8f1lE09uY`《Balancing the Economy for Albion Online》→ `2026-0915-1213-balance-economy.json`
    （信息图 5,885,197 B｜导图 987,471 B｜PPTX 15,836,975 B，deck 走 `page-asset-capture`）
  - `youtube-o2C4z_apu2I`《Offworld Trading Company: An RTS Without Guns》→ `2026-0915-1228-systems-mechanics.json`
    （信息图 4,603,395 B｜导图 724,608 B｜PPTX 15,733,598 B，deck 走 `page-asset-capture`）
- 失败 2 条，都与演示文稿有关，且**都不是产物内容失败**：
  - `youtube-gd_Qe9uATA`（CS:GO 经济）：summary＋信息图＋导图已生成，deck 卡在 1200s 上限内未就绪 →
    按当时规则记 `failed`；随后该卡显示「未能生成演示文稿。请试试其他内容。」＝服务端生成失败。
    本轮据此把上限提到 2700s，并让 `wait_for_card` 遇错误卡立即带真实原因失败。
  - `youtube-IiDPa50bgNg`（Supercell）：summary＋信息图＋导图已提交，deck 提交时对话框没有「立即生成」按钮。
    复核闸门得到 `deck feature throttled: 此内容将在几小时后生成。`——**账号级演示文稿容量节流在同一个 item 内生效**
    （12:29 闸门还是 available，12:32 提交已不可用）。据此按 skill 记 `quota_block` 语义并**停止当天剩余批次**，
    未再消耗剩余 4 次 claim。
- ledger：开始 42 ready / 31 failed / 0 generating → 结束 **44 ready / 33 failed / 0 generating**（无孤儿 claim）。
- 停止原因＝**演示文稿容量节流（quota_block）**，不是"没有候选"、不是通道失败、也不是浏览器不可用。
- 未重试任何既有 failed（含早上两条与本轮两条）；未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站。
- Git 交付通道：AI-Life-Mentor 本地与远端再次分叉（本地 `.claude/trace-health.json`、远端 `pkm-index.json`，
  零文件重叠），按既有做法合并后推送；两条资源各自单文件提交并回读远端路径与 blob。
- 本轮机器证据：`~/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-15T115158-item-aX8f1lE09uY/`、
  `…/2026-09-15T121407-item-o2C4z_apu2I/`、`…/2026-09-15T122903-item-IiDPa50bgNg/`、`…/batch-20260915T1151*.log`。

## 未做

- 未重试任何既有 `failed`/`partial` 候选（skill 规定必须显式授权）；早上两条与本轮失败条目的产物与来源
  仍留在 notebook，留待授权后补收尾。
- 未写 PKM、未建 Issue、未触发 Daily Check-in、未发布网站内容。
