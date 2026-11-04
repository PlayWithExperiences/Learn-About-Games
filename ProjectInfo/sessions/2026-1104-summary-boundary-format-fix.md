# 收集端 summary 边界格式修复（2026-11-04）

更新于 2026-11-04T11:05 +0800 · 决策：無涘（「好」，2026-11-04 10:56 批准修复）｜记录：DSH

## 问题

11-04 真实批次 claim 了 2 个候选，均在 summary 阶段失败（producer ledger 记 failed，不自动重试）：

- `youtube-MdmY9Mt-vz8`（run-20261104100158-96345，4162 字符）
- `youtube-NPGZRcXvuso`（run-20261104100607-98211，3449 字符）

根因：NotebookLM 当天把边界标题写成中英双语独立行 `来源边界（Source Boundaries）`；
`automation/notebooklm-split-answer.py` 只接受内联精确标记 `来源边界：` 或纯中文独立标题行
（`来源边界` / `来源边界:` / `## 来源边界`），正则不匹配 → 拒绝猜切分
（`no 来源边界 marker: refusing to guess the boundary split`）→ 无法生成 ready，消耗 2 个 claim 后停批
（`summary-format-systematic`，剩余 8 个额度）。此前 11-03 可交付 4 条，属 NotebookLM 输出格式漂移。

Codex A/B 只读演练独立复现同一错误（未 claim），作为旁证。

## 修复

`automation/notebooklm-split-answer.py`：

- 内联标记扩展为 `来源边界：` 与 `来源边界:`（半角冒号）；
- 独立标题正则允许可选中英括号注释（`（Source Boundaries）` / `(Source Boundaries)`）与尾随英文注释，
  仍只认整行标题，不在正文内猜切分；标题匹配优先于内联标记，避免 `## ` 前缀残留在 summary；
- 其余行为（建议尾句截断、空 summary/boundary 报错）不变。

新增 `scripts/test_notebooklm_split_answer.py`（11 个 unittest 用例，覆盖内联/标题/双语/负面/建议尾句/空段）。

## 验证

- `python3 scripts/test_notebooklm_split_answer.py` → 11 tests OK；
- `python3 scripts/test_notebooklm_automation.py` → 6 tests OK（既有回归）；
- 真实样本回归（不调 NotebookLM、0 claim）：两份 `summary-raw.txt` 均可切分，
  4162→summary 3703 + boundary 350；3449→summary 3049 + boundary 375；
- 章节提示（advisory）：item-01 缺「玩家影响」字面标签，item-02 缺「设计取舍」「玩家影响」；
  不阻断切分，内容质量与 ready 资产验证未重做。证据：`ProjectInfo/evidence/2026-1104-summary-boundary-format/regression.json`。

## 边界与下一步

- 今日 2 个 claim 已消耗，两个 failed 候选不自动重试；修复不追溯改写 ledger。
- 若用今日剩余 8 个 claim 另开真实批次（或明天新一天 10 个），需另行授权；ready 仍要求四项资产、导图展开与远端回读全部通过，
  切分修复只是解除该阶段阻断，不能保证整条链路成功。
- 若未来 NotebookLM 再换边界写法，先在 `scripts/test_notebooklm_split_answer.py` 增加样本再改解析器，避免再次盲跑消耗 claim。
