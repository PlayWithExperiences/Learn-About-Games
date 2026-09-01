# ProjectProgress

> 现状快照，覆盖写，不堆历史。历史看 `roadmap.md` 与 `sessions/`。

*更新于 2026-09-01 15:55:03 +0800 · 记录者 AI*

## 最新检查（2026-09-01 15:55:03 +0800）

- 仓库仍为 Private；当前 v0.2 候选未推送、未部署，Pages 不恢复。
- `collect-resources-about-game` 的生产合同仍是：来源收敛为单条、中文总结带“来源边界：”、信息图/思维导图/演示文稿均须有可验证真实资产；思维导图必须执行“全部展开”并观察到至少三级且无折叠节点；`ready` 后还必须逐文件交付并回读远端 blob。
- 2026-09-01 11:47:53 的 Codex 内置浏览器检查只得到 Google 登录页；该运行级 `unavailable` 证据仍保留，不能外推为所有浏览器不可用。
- 2026-09-01 12:42:13 已用 Chrome 工作台纠正范围：可编辑的 NotebookLM 页面、来源面板、对话和 Studio 的信息图/思维导图/演示文稿控件均可见。
- 用户随后确认本批最多 9 条（按当日剩余名额）、逐条串行、并发 1、自动重试 0；仅使用当前 NotebookLM 与已配置上传器，不调用付费 API、不写 PKM/Daily Check-in、不发布网站。
- 首条固定候选 `youtube-s_I07Iq_2XM` 已于 2026-09-01 15:38:45 claim，`generation_run_id=run-20260901153845-39506`。NotebookLM 中导入成功，来源总数为 33，且已将选择收敛为该视频唯一来源。
- 中文正文已生成并核验：来源数为 1，正文含明确的“来源边界：”段；信息图已通过 viewer `pageAssets.bundle()` 导出并验成真实 PNG，尺寸 `2752×1536`、非零字节，并完成视觉检查。
- 思维导图已实际执行 viewer 的“全部展开”：81 个节点、最大层级 4、`collapsed_node_count=0`。但当前页面资产清单没有目标图文件；随后点击唯一允许的真实下载回退，下载事件明确在 3000ms 超时，未得到可验证本地文件。
- producer 已将首条从 `generating` 正式记为 `failed`（阶段 `asset-download / mind_map`），没有生成 ready JSON、没有调用 PicGo、没有交付 AI-Life-Mentor、没有写 PKM/Daily Check-in。
- post-fail preflight 已复核：目录仍有 2,454 个候选，`claimed_today=2`、`remaining_today=8`、`status=ready_to_claim`；当前固定清单中剩余 8 条未领取，因本轮失败即停而记为 `skipped`。
- 当前原始预检与结构化运行报告已保存：`/Users/haodong/.local/state/learn-about-games/notebooklm-daily/preflight/2026-09-01T155327+0800-preflight.json`、`/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-01T153845+0800.json`。

## 现在在哪

- Learn-About-Games 本地 `main` 保持现有候选状态；不推送、不恢复 Pages、不改变网站公开状态。
- producer ledger 中 `youtube-s_I07Iq_2XM` 是明确的 `failed`，不是 `generating`、`no_candidate` 或 `quota_block`；失败原因是目标思维导图资产导出通道未产出可验证文件。
- 本轮没有 `ready` 资源，因此没有进入远端 inbox 交付链，也没有触发 AI-Life-Mentor 消费端。信息图的临时导出只作为失败前证据，不被冒充为已交付资产。
- 现有 PicGo 的用户约束（不擅自修改 `autoRename`）仍保留；由于本轮在 PicGo 之前失败，未产生新的命名例外。

## 当前阶段

- 生产闭环的“失败可辨认”已保持：浏览器工作台可用、来源隔离和正文/信息图成功，但思维导图导出失败；因此没有假 ready，也没有继续消耗后续候选配额。
- 失败证据同时包含业务状态（producer ledger）和浏览器观察（全部展开成功、页面资产缺失、下载回退超时），后续若要重试必须由用户明确授权单条重试，不能自动重试或把失败候选重新当作新候选。

## 下一步

- 暂停本批后续 claim；如继续，先明确是否允许对这条 `failed` 候选进行一次单条显式重试，并重新确认当前 NotebookLM/上传器边界。
- 在思维导图存在可验证导出路径前，不标记 `ready`，不上传、不推送、不写 PKM；不要把 viewer 已生成或节点已展开替代为图片资产存在。
- 继续保持 Learn-About-Games Private，不恢复 Pages、不自动推送；后续真实 `ready` 仍须经过本地合同验证、AI-Life-Mentor 单文件远端交付和路径/blob 回读。
