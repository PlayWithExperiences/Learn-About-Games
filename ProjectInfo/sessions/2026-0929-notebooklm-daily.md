# 2026-09-29 NotebookLM 每日收集：2 条交付，deck 限流停批；修掉一条静默丢失败记录的 runner 缺陷

决策：無涘（跑满 10 条 / 串行 1 / 自动重试 0；quota_block 即停当天） ｜ 记录：DSH agent ｜ 2026-09-29T12:15:00+08:00

## 结果

- attempted 5 / **ready 2 / remote_delivered 2** / failed 2 / skipped 5；当日 claim 用 4、**剩余 6 未动**。
- ledger 收尾 **72 ready / 62 failed / 0 generating**（134 条），无遗留 generating。
- 预检 `ready_to_claim`（2454 候选 / 在列 10 / 当日已 claim 0 / 剩余 10）；浏览器就绪 `available`（长期本 `2ce16a4b…` 可编辑、Studio 147 卡、deck 可立即生成、chat 可用），claim 前零消耗。

## 交付（远端 blob 逐字节回读一致）

- `youtube-vX3kjPgvcFU`《Clash of Clones: The Importance of Standing Out》→ `2026-0929-1140-design-fundamentals.json`。总结 4168 字、边界 377 字；导图全部展开 **4 级**、折叠 0、77 内容节点；信息图 5,341,555B、导图 1,341,544B、deck 18,328,116B（页面资产后台路径），三次上传 sha256 与远端字节均一致。
  - **交付波折**：runner 的 deliver 首推被拒（远端有消费端新提交 `0b73dce`）。核对零文件重叠（远端只动 `pkm-index.json`）后合并 `origin/main`，**只重跑交付脚本**成功，未重调 NotebookLM。
- `youtube-8_KBjd0iaCU`《2D Animation at Klei Entertainment》→ `2026-0929-1158-narrative-expression.json`。总结 3024 字、边界 344 字；导图全部展开 3 级、折叠 0、48 节点；deck 24,419,699B 一次上传通过。`ITEM_OK rc=0`，交付一次成功。

## 失败与停止

- `youtube-W20t1zCZv8M`（Retro City Rampage 自动化测试）、`youtube-NwPIoVW65pE`（物理引擎设计）：均在 **generation 阶段**遇 deck 限流（"此内容将在几小时后生成"）。claim 已消耗，计 per-candidate failed，不自动重跑。NotebookLM 侧对应留下"信息图生成失败""未能生成演示文稿"两张失败卡，符合预期。
- 第 5 条 `youtube-axkPXCNjOh8`（Hearthstone UI）在 **claim 前**被 deck 门拦下（`claim_consumed=false`、无 ledger 条目）→ 记 `quota_block(deck)`，停止当天剩余批次。账号级节流，换 notebook 无用。
- 浏览器已关，零残留进程；Studio 155 张卡无"生成中"悬挂。

## 本轮发现并修掉的 runner 缺陷（静默丢失败记录）

- **症状**：上述两条 claim 已消耗的候选明明打印了 `ITEM_FAIL stage=generation`，ledger 条目却永远停在 `generating`。
- **根因**：`main()` 把 `state` 绑成状态目录（`state = Path(args.state_dir)`），而 deck 限流复探分支把**同名** `state` 改绑成 gate 的 JSON 载荷；异常处理里 `producer fail --state-dir str(state)` 于是拿到 dict 的 repr，写到了别的目录。该调用用 `check=False`，报错被吞掉，于是失败记录静默消失。
  - 影响面：该分支只在"claim 前门放行、item 内才限流"时走到，所以既有的 pre-claim 拦截批次不受影响——这也是它此前没被发现的原因。
- **修法**：复探分支局部变量改名 `gate_state`，`state` 恢复只指状态目录（`publish` 与 `fail` 两个调用点都受益）。
- **回归**：`tests/lib/notebooklm-fail-state-dir.test.ts` 3 例，用 AST 读真身绑定结构而非复制规则；**已反向验证**——把 `gate_state` 改回 `state` 后该测试报 "expected 3 to be 1"，修复后全过。
- **验证**：全量单测 **261 通过**（原 258，+3）。
- 两条 stranded 记录已用 producer `fail` 手工补记（保留原 generation_run_id 与准确阶段/原因），ledger 归零 generating。

## 边界

- 未写 PKM 笔记、未建 GitHub Issue、未触发 Daily Check-in、未发布网站内容。
- 未重跑任何既有 failed（含本轮两条）；重跑需明确授权并用 `retry` + 准确上一轮 run id。
- 本地证据：`~/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-29T1055-manual/`（preflight.json、browser-readiness.json、batch-driver.log、report.json）及各 `2026-09-29T*-item-*/` 目录。私有正文与资产只留本机，不入 Git。
- 下一步：deck 额度恢复后（几小时）可继续跑剩余 6 条（`youtube-pLbmZT70rtA` 起）。
