# ProjectProgress

> 现状快照，覆盖写，不堆历史。历史看 roadmap.md。

*更新于 2026-08-22 · 记录者 AI*

## 现在在哪

- 现状（AI 会话 · codex，待無涘确认）：
  当前 v0.2 已形成可运行的 Astro/TypeScript 网站，包含 EGDS 能力地图、职业透镜、学习路径、资源主题筛选与搜索，以及保留全局关系的 Innovation Atlas。`codex/v02` 已合并进 `main`，并以本地 tag `v0.2-content-baseline` 保留回滚锚点；当前 main 有 5437 个 Work Item、5590 个 Access Version、84 个 Atlas 节点、86 条关系和 76 项 Evidence。FPS、RPG、RTS、Open World 四条创新事件路线已满足完整闭包；其它低证据透镜仍明确未闭合。仓库继续保持 Private，尚未公开部署。

## 当前阶段

- 内容目标审计已完成；合并后的 main 通过 Astro check 0/0/0、Vitest 204/204、静态构建 151 页和目标审计。合并后全量 Playwright 为 259 passed / 3 failed / 22 skipped：Atlas 位置断言单跑通过，两个 Playtest 失败根因是资源页仍把 5437 条 Work Item server-render 成约 12.7MB HTML，再由客户端筛到 61 条，120 秒内触发浏览器会话超时。合并后的 main 已把涓流脚本从旧 v02 worktree 切换到主工作树。

## 下一步

- 官方 API 元数据入口已合并进 main：新增 scripts/sync_youtube_metadata.py，从 sources.json 的 YouTube @handle 发现频道，依次读取 uploads playlist、视频列表与标题／描述／发布时间／时长／字幕可用性等事实字段，默认原子写入仓库外 ~/.cache/lag-youtube/metadata.json；本轮 ADC 全量同步得到 2,534 条频道元数据，现有 2,311 条目标 Work Item 100% 映射，另有 223 条频道后来新增视频暂不自动扩目录；目标中 271 条标记有字幕、2,040 条没有。同步不写 token、不写目录、不生成排名。
- Career Lens 与统计文案已修正；当前新增的 Playtest 失败不是数据缺失，而是 5437 条资源的初始 DOM／客户端筛选性能瓶颈。公开前需要单独做资源筛选切片，避免用延长 timeout 掩盖页面成本。
- YouTube 内容补全仍处于 24 小时冷却：累计 48 completed、4 no_transcript、2 transcript_insufficient、42 transcript_channel，生产目录剩余 2,215 条；本轮把两个只有 `[Music]` 音频标记的缓存从 model_failure 重新归为 `transcript_insufficient`，不再让模型凭空总结。现有回写链路已在临时目录以完整字幕条目实测：模型结果通过校验后先写 `pending_write`，再原子写资源目录并标记 `completed`；生产目录仍只保留已验证的 48 条。当前涓流约每 4 小时尝试 1 条，且通道失败触发 24 小时冷却，按 6 条／天粗估仅处理剩余条目就至少约 369 天，且不含失败重试和无字幕音频转写。公开频道 RSS 对 GMTK 返回 404。
- OAuth/ADC 与官方 API 边界已确认：Agent Platform API（`aiplatform.googleapis.com`）负责 Agent/Gemini 资源与模型调用，不是 YouTube 数据入口；同一项目的 YouTube Data API v3 已启用，桌面 OAuth/ADC 认证成功。`youtube.readonly` 足够读取公开频道／视频元数据，但官方 `captions.list`／`captions.download` 需要更高 YouTube scope，且下载字幕还要求用户拥有视频编辑权限，因此不能用它通用解锁这三个第三方频道的字幕正文。官方 API 配额默认每日 10,000 units；本轮频道、playlist 和 videos 读取远低于该额度，真正瓶颈是第三方字幕通道、音频转写和模型分析。凭据不得进入仓库、前端或对话。
- 仓库仍为 Private、Pages workflow 仍手动停用；恢复公开需要先修复资源筛选性能，再完成桌面／移动、双主题、无 JS 与线上验收。

## 阻塞 / 待定

- Vision 为 AI 草稿，待無涘确认
- 风险/阻塞（AI 访谈 · codex，待無涘确认）：主要风险是资源数量增长速度可能超过逐条验证和 capability/topic 映射的能力，造成错配、过拟合或重复归类。Innovation Atlas 仍需要更多一手证据来支持事件之间的影响关系，视觉层级也需要继续验证。当前代码构建和测试没有阻塞，但 GitHub 仓库为私有，正式公开访问仍是部署层面的实际阻塞。
