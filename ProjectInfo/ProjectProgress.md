# ProjectProgress

> 现状快照，覆盖写，不堆历史。历史看 roadmap.md。

*更新于 2026-08-22 · 记录者 AI*

## 现在在哪

- 现状（AI 会话 · codex，待無涘确认）：
  当前 v0.2 已形成可运行的 Astro/TypeScript 网站，包含 EGDS 能力地图、职业透镜、学习路径、资源主题筛选与搜索，以及保留全局关系的 Innovation Atlas。`codex/v02` 已合并进 `main`，并以本地 tag `v0.2-content-baseline` 保留回滚锚点；当前 main 有 5437 个 Work Item、5590 个 Access Version、84 个 Atlas 节点、86 条关系和 76 项 Evidence。FPS、RPG、RTS、Open World 四条创新事件路线已满足完整闭包；其它低证据透镜仍明确未闭合。仓库继续保持 Private，尚未公开部署。

## 当前阶段

- 内容目标审计已完成；合并后的 main 通过 Astro check 0/0/0、Vitest 204/204、静态构建 151 页和目标审计。合并后全量 Playwright 为 259 passed / 3 failed / 22 skipped：Atlas 位置断言单跑通过，两个 Playtest 失败根因是资源页仍把 5437 条 Work Item server-render 成约 12.7MB HTML，再由客户端筛到 61 条，120 秒内触发浏览器会话超时。合并后的 main 已把涓流脚本从旧 v02 worktree 切换到主工作树。

## 下一步

- Career Lens 与统计文案已修正；当前新增的 Playtest 失败不是数据缺失，而是 5437 条资源的初始 DOM／客户端筛选性能瓶颈。公开前需要单独做资源筛选切片，避免用延长 timeout 掩盖页面成本。
- YouTube 涓流通道仍处于 24 小时冷却：累计 48 completed、4 no_transcript、44 retryable、42 channel_failure、2 model_failure，剩余 2215 条；本轮单视频探测证明 `yt-dlp` 与 `youtube-transcript-api` 均可成功取得一条字幕，但不能把单条成功或冷却状态写成批量补全成功；公开频道 RSS 对 GMTK 返回 404。無涘新建的 `YouTube knowledge` 项目已启用 Agent Platform API，但该服务（`aiplatform.googleapis.com`）只负责 Agent/Gemini 资源与模型调用，不是 YouTube 数据入口。由于组织策略禁止 Agent Platform API Key，新的人工路径改为：在同一项目另外启用 `youtube.googleapis.com`（YouTube Data API v3），创建桌面 OAuth 客户端，并以带 YouTube scope 的用户 OAuth/ADC 进行只读探针；Agent Platform ADC 本身不等于 YouTube 权限。官方 YouTube API 不支持 service account 作为 YouTube 用户身份，任意第三方视频字幕仍不能靠 OAuth 通用解锁。凭据不得进入仓库、前端或对话。
- OAuth/ADC 排障已完成：第一次命令因未显式包含 ADC 必需的 `cloud-platform` scope 被 gcloud 拦截；补上后因 OAuth 应用 Audience 为 Internal 返回 `403 org_internal`。改为 External、保留 Testing 并加入实际登录账号后授权成功；AI 随后在不输出 token 的前提下用 ADC 调用 YouTube Data API v3 `channels.list`，获得 HTTP 200 和 1 条公开频道记录（Game Maker's Toolkit）。认证链路已打通；下一步接入官方 API 的频道／视频元数据同步，字幕仍保持低频、失败可辨认的补充路线。
- 仓库仍为 Private、Pages workflow 仍手动停用；恢复公开需要先修复资源筛选性能，再完成桌面／移动、双主题、无 JS 与线上验收。

## 阻塞 / 待定

- Vision 为 AI 草稿，待無涘确认
- 风险/阻塞（AI 访谈 · codex，待無涘确认）：主要风险是资源数量增长速度可能超过逐条验证和 capability/topic 映射的能力，造成错配、过拟合或重复归类。Innovation Atlas 仍需要更多一手证据来支持事件之间的影响关系，视觉层级也需要继续验证。当前代码构建和测试没有阻塞，但 GitHub 仓库为私有，正式公开访问仍是部署层面的实际阻塞。
