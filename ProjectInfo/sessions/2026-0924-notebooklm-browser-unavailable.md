# NotebookLM 收集端：浏览器通道不可用

## 0732 浏览器通道不可用

决策：無涘 ｜ 记录：codex ｜ session 01a0d09c-69d9-7aa2-b601-a9c588f1ac8f

trace-user-count: 1

- 预检成功且只读：`ready_to_claim`，当日 claim 0、剩余 10、返回 10 个按目录顺序候选。
- 隔离自动化 Chrome 的启动日志写入 `BROWSER_UP`，但 CDP `127.0.0.1:9222` 在随后的 deck/chat/state 探针前后均不可连接；三个探针的可核查结果均为 `fetch failed`。
- 按收集端合同判为 `browser-notebook-access` 的运行级阻塞。没有领取候选或调用 NotebookLM，故 attempted/ready/远端交付/候选失败均为 0；跳过 10，余额 10。
- 没有上传、ready JSON、远端交付、PKM 写入、Issue 或 Daily Check-in 动作。运行报告和浏览器日志保存在本机状态目录 `runs/2026-09-24T073229+0800-automation/`。下一步先恢复并验证 CDP 浏览器通道，再做新的预检。

原始对话：dialogues/2026-0924.md「0732 NotebookLM 浏览器通道不可用」
