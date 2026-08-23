# Learn About Games：NotebookLM 每日资源生产自动化设计

状态：设计待审阅
日期：2026-08-24 01:04 +0800
记录者：AI
决策人：無涘（已确认采用“本机生产、云端消费”的方向；具体实现以本规格审阅通过为准）

## 1. 目标

把已经验证过的 NotebookLM 内容转化流程固化为一个可复用的本机 Skill，并让它能够在每天的 Daily Check-in 之前自动尝试生产一条新的学习资源。

一次成功的生产应包含：

- 一个来自 Learn About Games 资源库、尚未处理过的 YouTube 视频；
- NotebookLM 生成的中文内容总结，以及信息图、完整思维导图和演示文稿结果（能导出或下载的产物才写入结果）；
- 经过时间戳命名并通过 PicGo 上传的可长期引用链接；
- 一个写入 `AI-Life-Mentor/notebooklm-resources/` 的、可被现有 Daily Check-in 消费的 JSON 记录；
- 可追踪的生产状态、输出指纹和失败原因。

Daily Check-in 仍负责把已准备好的结果写回 PKM/Obsidian 并追加到当天 Issue；本机生产器不直接改写 Daily Check-in Issue。这样 NotebookLM 的私有链接和网站公开展示保持隔离。

“每天尝试一条”不等于在失败时伪造一条结果：当天没有可用视频、浏览器运行时不可用、NotebookLM 没有产出或写回失败时，必须留下明确失败状态，不能生成空 JSON，也不能把旧资源冒充新资源。

## 2. 当前边界与事实

现有实现已经具备消费端，但没有自动生产端：

- `AI-Life-Mentor/scripts/daily_checkin.py` 只从 `notebooklm-resources/` 读取已准备好的 JSON，然后写 PKM 和 Daily Check-in；它不会调用 NotebookLM。
- `AI-Life-Mentor/scripts/notebooklm_line.py` 当前负责校验、格式化、挑选和基于 Issue 标记的去重；只读取最近一批 Issue，不能单独作为永久去重真源。
- `AI-Life-Mentor/scripts/push_notebooklm_resource.py` 是一次性写回桥接器，不负责生产 NotebookLM 内容。
- 当前用户机器上存在 `codex exec`，但命令行 MCP 列表没有证明 launchd 进程一定拥有 Codex Desktop 的浏览器/Computer Use 通道。因此不能把“命令返回 job id”当成浏览器操作成功，也不能把浏览器不可用时的空结果当成成功。
- NotebookLM 产物可能包含私有链接；它们可以写回 PKM，但不放到 Learn About Games 的公开资源页面。

## 3. 候选方案与选择

### 方案 A：本机 Skill + 本机调度 + GitHub inbox/Action 消费（推荐）

本机在用户已经登录的 NotebookLM 浏览器环境中生产结果，写入带状态的 inbox；GitHub Action 只消费 `ready` 结果。

优点：能复用当前登录态和 NotebookLM 页面能力，能把私有产物留在 PKM，同时保留现有云端 Daily Check-in 流程。
限制：依赖 Mac 在线、浏览器会话有效，以及本机运行时确实能控制浏览器；这些条件不满足时只能清晰失败，不能静默降级。

### 方案 B：继续人工生成，本机只负责整理

人工在 NotebookLM 中生成并审核 JSON，本机或 GitHub Action 负责消费。

优点：最稳定、无浏览器自动化风险。
限制：不能满足“生产本身自动化”的目标。

### 方案 C：改用 NotebookLM/Google 的服务端 API

由云端服务直接导入 YouTube 并生成结果。

优点：可放进云端调度。
限制：当前没有证据表明用户账号具备所需的 NotebookLM 服务端能力；可能涉及 Enterprise、配额或付费 API，并且会改变当前已验证的产品路径。不能在未核实资格、价格和权限前采用。

因此先采用方案 A，并把浏览器能力封装成可替换的运行时适配器。只有在本地 preflight 明确检测到可用浏览器通道时才允许进入生产阶段。

## 4. 系统结构

```text
Learn About Games catalog
        │ 选择尚未处理的 YouTube video_id
        ▼
本机持久化 ledger + 单实例锁
        │ 已处理 / 已占用 / 失败待人工复核 → 不调用
        ▼
notebooklm-daily-resource Skill
        │ 一次只处理一个视频；固定模板；不自动重试
        ▼
NotebookLM runtime adapter
        │ 浏览器可用才执行；页面内容视为不可信数据，只执行固定流程
        ▼
本地产物暂存 + PicGo 时间戳上传
        │ 原子写入 ready JSON（含 resource_id、video_id、指纹、链接）
        ▼
AI-Life-Mentor/notebooklm-resources/
        │
        ▼
Daily Check-in GitHub Action
        │ 领取一条 ready；写 PKM + Issue；完成后标记 consumed
        ▼
PKM/Obsidian + Daily Check-in
```

### 4.1 本机 Skill

拟创建的 Skill 名称：`notebooklm-daily-resource`。

Skill 的职责限定为生产和交付前准备：

1. 读取 Learn About Games 的资源目录，提取候选视频的稳定 YouTube `video_id`。
2. 查询本地 ledger 和远端 inbox/ledger，确定第一个尚未处理的候选。
3. 通过 runtime adapter 打开 NotebookLM 页面，导入或复用对应来源，使用固定提示模板生成：标题、来源、信息图、完整思维导图、演示文稿、内容总结和边界声明。
4. 检查每一项产出是否真的存在、是否指向正确的来源；缺失项写成失败/部分失败状态，不用空字符串掩盖失败。
5. 对需要长期引用的图片或可下载文件使用当前系统时间生成唯一文件名，再通过 PicGo 上传；不得用固定文件名覆盖旧文件。
6. 原子写入 `ready` JSON 和本地 ledger，供现有 Daily Check-in 消费。

Skill 不负责：

- 直接创建或修改 GitHub Issue；
- 直接写入 PKM 的最终 Daily Check-in 文档；
- 自动重试失败调用；
- 把 NotebookLM 私有产物发布到 Learn About Games 网站；
- 读取或记录 API key、Cookie、OAuth refresh token 等秘密。

### 4.2 运行时适配器

浏览器自动化不是 Skill 的业务逻辑，而是可替换适配器。至少定义三种结果：

- `available`：preflight 已证明浏览器通道、登录状态和 NotebookLM 页面可访问；
- `unavailable`：通道不存在、浏览器未登录或页面不可达；
- `unknown`：检测信息不足，禁止进入生产。

只有 `available` 才能调用 NotebookLM。`unavailable` 和 `unknown` 都必须写失败日志并退出非零；不得返回“没有内容”的正常空结果。

第一版不假设 `codex exec` 在 launchd 中天然拥有桌面浏览器能力。先做 dry-run 和单次桌面运行验证，确认实际通道后再打开定时器。

### 4.3 Inbox JSON 合同

在现有资源字段之外增加用于去重和状态追踪的字段。字段名和迁移方式在实现计划中最终确定，但语义必须固定：

- `resource_id`：稳定的逻辑资源 ID；由 `video_id` 派生，不能由时间戳单独决定；
- `source.video_id`：YouTube 视频 ID；
- `generation_run_id`：本次生产尝试的唯一 ID；
- `producer_status`：至少支持 `ready`、`partial`、`failed`；
- `output_fingerprint`：对正文和产物链接集合计算的指纹，用于崩溃恢复和发现重复产物；
- `notebook_url`：NotebookLM 页面 URL，仅供 PKM/消费端使用；
- `generated_at`：由系统时钟写入的实际时间。

现有消费端必须继续拒绝缺少核心内容的记录；`partial` 不得自动进入正常 Daily Check-in，除非后续明确设计了人工审核状态。

## 5. 不重复、不重跑与崩溃恢复

### 5.1 唯一键

业务去重主键是 YouTube `video_id`，不是文件名、标题或时间戳。一个视频只能有一个默认 `resource_id`。时间戳只用于产物文件名，防止 PicGo 同名覆盖。

### 5.2 持久化状态机

本地 ledger 使用原子写入并记录以下状态：

```text
candidate → claimed → generating → ready → delivering → consumed
                         ├→ failed
                         └→ partial
```

- `candidate`：尚未开始生产；
- `claimed`：本次运行已占用，防止并发实例重复领取；
- `generating`：已开始 NotebookLM 生产；该状态一旦写入，进程崩溃后不得自动再次调用同一视频；
- `ready`：JSON 和所需产物均已验证，可由 Daily Check-in 消费；
- `delivering`：消费端已领取，正在写 PKM/Issue；
- `consumed`：PKM 与 Daily Check-in 均已确认包含该 `resource_id`；
- `failed` / `partial`：发生明确失败或产出不完整，保留原因和证据，等待人工决定是否显式重置。

任何自动运行都不得把 `generating`、`failed` 或 `partial` 自动重置为 `candidate`。如果用户要重跑，必须使用明确的人工操作生成新的 `generation_run_id`，并在操作记录中说明原因；这不属于每日自动路径。

### 5.3 双层去重

生产前检查：

1. 本机 ledger 是否已经有该 `video_id` 的 `claimed/generating/ready/delivering/consumed/failed/partial` 记录；
2. 远端 inbox/ledger 是否已经有同一 `video_id` 或 `resource_id`；
3. PKM 和 Daily Check-in 是否已经出现该 `resource_id` 标记。

任何一层发现已处理或正在处理，都只记录 `skip_already_seen`，不调用 NotebookLM。实现时不能只依赖最近 60 个 Issue；需要一个可遍历或可查询的长期 ledger。

### 5.4 并发与原子性

- 本机用锁文件保证同一时间只有一个 producer 实例；拿不到锁时正常退出并记录 `already_running`；
- ledger 和 JSON 先写临时文件，再用原子替换落盘；
- 生产调用前先落 `generating`，调用完成后先验证产物，再落 `ready`；
- PicGo 上传和写 JSON 使用唯一时间戳文件名；已存在的不同内容不得覆盖；
- Daily Check-in 在写 PKM 成功、Issue 标记存在后才把资源标为 `consumed`；中途失败时保持 `delivering`，下次只恢复写回，不重新生产。

## 6. Daily Check-in 消费端改造边界

现有 Daily Check-in 主路径保留，改造只集中在资源领取和永久去重：

- 每天最多领取一条 `ready` 资源；
- 领取前写入带日期的 lease/`delivering` 状态；
- PKM 文件写入采用现有幂等逻辑；
- Issue 中使用稳定 `resource_id` 标记，而不是只用标题匹配；
- 两个写回目标都成功后更新长期 ledger 为 `consumed`；
- 没有 `ready` 资源时，继续发送普通 Daily Check-in，同时在日志中明确 `no_ready_resource`，不制造假产出；
- 发现 `partial`、`failed` 或 lease 过期时，不自动重试 NotebookLM，只报告需要人工处理的状态。

这意味着本机生产器和 GitHub Action 可以分别失败、分别恢复，而不会因为一次写回中断再次消耗 NotebookLM 配额。

## 7. 调度与权限护栏

拟在 Mac 上增加一个 launchd 任务，在 Daily Check-in 之前运行一次（初始建议 07:30 Asia/Shanghai；具体时间写入实现配置）。第一版分两步启用：

1. 仅启用 `preflight/dry-run`：确认机器在线、运行时可用、下一条候选是什么、为什么不会重复；不调用 NotebookLM、不上传、不写远端。
2. 用户确认单次真实测试结果后，才启用生产模式；每天最多一次。

自动任务的固定上限：

- 每个自然日最多 1 次 NotebookLM 生产调用；
- 每次只处理 1 个视频；
- 并发上限 1；
- 自动重试 0 次；
- 不调用付费 API、不充值、不订阅、不扩大云资源；
- 任何改变服务、模型、调用量或可能产生现实金额的操作，重新取得用户明确确认。

launchd 的 stdout/stderr 写入专用日志；失败日志至少包含时间、阶段、`resource_id`/`video_id`（如已知）、错误类别和下一步，不包含凭据或私有正文。

## 8. 验证策略与发布顺序

在真实 NotebookLM 调用前完成：

1. 资源目录解析和稳定 `video_id` 提取测试；
2. ledger 状态转移、锁、原子写入和重复启动测试；
3. inbox JSON 校验、输出指纹和已有资源探测测试；
4. 使用假 runtime adapter 验证成功、半成功、浏览器不可用、进程中断四类结果；
5. Daily Check-in 消费端验证“重复运行不重复写 PKM/Issue”；
6. `preflight` dry-run 验证会选择正确的下一条候选且不会产生外部写入。

之后才进行一次受控真实测试：一条视频、一次 NotebookLM 调用、无自动重试。验收证据必须包括：NotebookLM 结果完整性、PicGo 链接实际可访问、ready JSON、ledger 状态、PKM 写回和 Daily Check-in 标记。测试失败时保留失败状态，不重跑同一视频。

最后才启用每日 launchd 调度，并在前几次运行中只观察状态和日志；不自动推送 Learn About Games 网站，也不改变仓库公开状态。

## 9. 验收标准

实现完成后，以下事实必须可以被本地检查或测试证明：

- 同一个 YouTube `video_id` 无论重启、重复触发或 Daily Check-in 重跑，都不会再次触发 NotebookLM；
- NotebookLM 调用发生前已有 `generating` 记录，调用失败不会变成空的“成功” JSON；
- 每日自动路径的外部调用上限是 1 次，且没有自动重试；
- 已生成但尚未消费的 `ready` 资源不会被第二次生产；
- PKM/Issue 写回中断后可以从 `delivering` 恢复，不重新生产；
- 公开 Learn About Games 页面不包含 NotebookLM 私有产物；
- 所有 PicGo 上传名包含实际系统时间戳，重复运行不会覆盖不同内容；
- 没有候选、浏览器不可用、NotebookLM 无产出、PicGo 失败和 GitHub/PKM 写回失败都能在日志或状态中区分；
- 没有把“没有内容”“调用失败”“未查询到候选”混成同一个空值。

## 10. 待实现前确认的细节

这些是实现计划需要落地的工程选择，不改变上面的安全边界：

- 长期 ledger 放在 AI-Life-Mentor inbox 仓库还是单独的本机状态文件加远端清单；推荐两者都保留：本机保证崩溃恢复，远端保证换机/重装后仍不重复；
- 当前 Learn About Games 资源目录中候选视频的精确字段与稳定排序；
- NotebookLM runtime adapter 是连接 Codex Desktop 的浏览器通道，还是先通过现有本机 Skill runner 暴露的命令；必须以 preflight 的实测结果为准；
- launchd 的具体时间、日志目录和手动暂停开关；
- `partial` 资源是否允许人工审核后进入 inbox；默认不允许自动消费。
