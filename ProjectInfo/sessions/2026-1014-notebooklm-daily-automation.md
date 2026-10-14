# 每日自动收集：改走 DSH 内同模型 agent（2026-10-14 · DSH agent）

- 無涘确认 B 方案（全自动每日批量）＋固定范围授权：每天≤10 distinct claim（北京时间）、
  串行1、重试0；服务 NotebookLM＋PicGo＋AI-Life-Mentor Git；配额/通道不可用停批不耗 claim；
  不自动 retry failed/partial；不写 PKM/建 Issue/触发 Daily Check-in/发布网站。
- 追加约束：定时跑必须借用 DSH 内 opencode muse-spark-1.3-contributor（与交互会话同模型）。
  `agent-default-model` 已是该模型；`dsh --profile headless` 实测同仓同 skill 可用。
- 落地：`automation/notebooklm-daily-agent.sh`（互斥锁＋boot headless agent）←
  `automation/com.lag.notebooklm-daily-batch.plist`（每天 08:00，calendarinterval，
  已 bootstrap＋enable，`launchctl print` state=not running 等待触发）；
  任务文本 `automation/notebooklm-daily-prompt.md`（skill→预检→门禁→run-notebooklm-batch.sh→结构化日报）。
  已删 superseded 的裸脚本 wrapper 草稿；手动批量仍用 `run-notebooklm-batch.sh`。
- 验证（均 0 claim）：headless 最小探针（cwd＋日期正确）；agent 全链探针（skill＋preflight
  `ready_to_claim`、剩余 10/10、首候选 youtube-QpwgBc1PcVQ）。今日 13:38 chat 探针曾报
  AI 用量限额（19:38 后可用），门禁会在该状态下正确停批。
- 待：10-12 的 7 条 failed 不自动重跑；首轮自动运行（明 08:00）待 goal 回合验日报。
  goal-14d898e1 保持 armed 跟首轮验证。

## 首轮验收标准（明早 08:00 触发后核对）

- `runs/daily-20261015-trigger.log` 存在且首行时间戳为 08:00 左右（睡眠则为唤醒时刻）；
- `runs/daily-20261015-report.json` 含 `preflight_status/attempted/ready/failed/skipped/remaining_today/stop_reason`；
- ledger 当日 claim（含失败）≤10；未出现 `retry` 调用（`attempt_history` 无新增）；
- 成功条数＝远端 inbox blob 回读确认数；失败条均有阶段＋原因，无空链接 ready；
- `ProjectInfo/sessions/2026-1015-notebooklm-daily.md` 已写；git 无越界提交（只含当日 session＋ProjectProgress）。
- 以上全过则 goal 可 complete；任一不过则按实际失败修 prompt/触发器后继续观察，goal 保持 active。
