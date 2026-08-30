# ProjectProgress

> 现状快照，覆盖写，不堆历史。历史看 `roadmap.md` 与 `sessions/`。

*更新于 2026-08-30 14:14:55 +0800 · 记录者 AI*

## 最新检查（2026-08-30 14:14:55）

- 仓库仍为 Private；当前 v0.2 候选未推送、未部署，Pages 不恢复。
- 前次 `youtube-HAvS-RwkjdA` 的失败仍保留为 `run-20260830073426-50030`、`asset-download / infographic`。日志只能证明可见下载出口没有产出可验证文件，不能证明用户一定点击了 Chrome 的 Cancel。
- 共享 `collect-resources-about-game` skill 与资源合同已修复为优先使用 NotebookLM viewer 的 `pageAssets.list()` → 精确匹配 → `pageAssets.bundle()` 后台导出；可见 Chrome 下载弹窗只保留为明确失败时的回退，不再作为默认路径。
- 用户确认后，本场只显式重试这一条失败候选，新的 `generation_run_id` 为 `run-20260830132511-54079`；旧尝试已保留在 ledger 的 `attempt_history`，没有扩大到其他候选。
- NotebookLM Studio 的三个产物均按唯一来源生成。文字总结清理为 5,155 字符正文和 782 字符来源边界；信息图为 2,752×1,536 PNG；思维导图执行查看器“全部展开”，48 个节点、深度 4、折叠节点 0；详细演示文稿为 13 页。
- 原生可见下载没有被当作成功判据：信息图和思维导图通过 page assets 得到实际字节；演示文稿通过 13 张当前 viewer 页面资产重建为 PPTX/PDF，并通过 OOXML ZIP、PDF 页数和文件签名校验。
- 四项文件以语义文件名经 PicGo 串行上传，四个 Raw 地址均 HTTP 200，远端字节与本地 SHA-256 完全一致；PicGo `autoRename` 已恢复原值 `true`。
- producer 已成功写入 [ready JSON](/Users/haodong/Documents/GitHub/AI-Life-Mentor/notebooklm-resources/2026-0830-1413-systems-mechanics.json)。本地 ledger 状态为 `ready`，当天 `claimed_today=3`、`remaining_today=7`；其他候选没有被本场 claim。
- 本场回归通过：`test_notebooklm_automation.py` 5/5、`test_notebooklm_producer.py` 16/16、`test_notebooklm_publish.py` 2/2，`git diff --check` 通过。

## 现在在哪

- 当前唯一新 ready 资源是 `youtube-HAvS-RwkjdA`，主题为 `systems-mechanics`；结果 JSON 保存完整总结、来源边界、四项托管地址、思维导图展开证明和导出边界。
- 公开来源仍是 [YouTube 视频](https://www.youtube.com/watch?v=HAvS-RwkjdA)；私有 Notebook 工作台地址只保存在 AI-Life-Mentor 的 ready JSON，不写入公开网站或本项目快照。
- 本场没有消费 ready、写 PKM、触发 Daily Check-in、创建 Issue、推送或部署；AI-Life-Mentor 的 ready 文件停在本地队列，等待既有消费者流程。
- 生产器新增了显式 `retry` 接口：必须指定 resource id 和上一轮失败的 generation run id，失败历史不被覆盖，普通 `claim` 不会自动重试失败条目。

## 当前阶段

- 导出通道问题已通过真实候选重跑验证：后台 page-assets 路径可绕过正在使用的 Chrome 窗口及下载弹窗，并能产出可校验文件。
- `youtube-HAvS-RwkjdA` 已从新的 `generating` claim 正式进入 `ready`；旧失败尝试仍可追溯，未被伪造成成功。
- 生产边界仍停在 AI-Life-Mentor 的 ready 队列。网站层、PKM 层和 Daily Check-in 层不因本次 ready 自动变更。

## 下一步

- 等待既有 AI-Life-Mentor 消费流程按其自身调度消费 ready；不在本场手动触发 PKM、Daily Check-in、Issue、推送或部署。
- 后续若处理新的 NotebookLM 候选，先做不消耗额度的工作台就绪检查，并在任何新单条/批量或失败重试前重新确认范围；继续串行执行并保留 page-assets 后台导出与实际文件校验。
- 保持仓库 Private，不恢复 Pages；产品方向和网站数据模型不因本次资源入队改变。
