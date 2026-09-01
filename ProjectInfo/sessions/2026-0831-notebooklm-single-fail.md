# notebooklm-single-fail

> 按主题一份，追加不覆盖；同一场会话的节就地更新。

## 0904 单条候选处理失败与时间戳异常

决策：無涘 ｜ 记录：codex（自动）｜ session 01a05502-d502-7251-94cf-e4f3f372c6ad

本轮按共享 skill 对固定清单首条候选 `youtube-5UdVNmbIClM`（Game Design Case Studies - One Designer | One Game | One System）进行完整处理。结论：演示文稿阶段失败，未闭环。产出：文字总结完成；信息图已通过 viewer pageAssets 导出并验成 `2752×1536` PNG；思维导图完成 viewer「全部展开」核验（observedDepth=4，collapsedNodeCount=0），并拿到真实 PNG 文件（4774×10736）。风险：系统/producer 写出的时间戳为 `2026-08-31`，与开发者锁定的适用日期 `2026-08-30` 冲突，属于未来时间戳异常，下次运行需优先核查本机时钟或 producer 配置。下一步：当前账目 attempted=1/ready=0/failed=1/skipped=9/remaining_today=9，下一条固定候选为 `youtube-8uE6-vIi1rQ`；本条未生成本地 ready JSON，未触发远端交付。

原始对话：dialogues/2026-0831.md「0904 notebooklm-single-fail」

## 0754 Game Design Tools 单条候选处理失败与未来时间戳复发

决策：無涘 ｜ 记录：codex（自动）｜ session 自动化-2026-08-31-0754

本轮对固定清单首条候选 `youtube-XPPtLNkVPWY`（Game Design Tools: For When Spreadsheets and Flowcharts Aren't Enough）执行共享 skill。浏览器预检通过，长期 Notebook 可编辑，来源面板/聊天/Studio 均存在；单来源隔离成功，只保留当前视频。结果：中文总结生成完成，并在渲染文本中明确出现“来源没有覆盖或无法确认的边界”；信息图通过 NotebookLM viewer `pageAssets.bundle()` 导出真实文件 `/var/folders/82/g3byfvfx6nx9fx6cygqh_s500000gn/T/browser-use/assets/87d2bf46-562e-4e81-9ae3-11a97244c81b/1d7e63ac98e9dd7b`，`file` 校验为 PNG `2752×1536`，SHA-256 `c30ffc9341bb6144edb506ff416fbbe67cc5ff70b162cf900799b127b37d101e`。失败点：浏览器运行时在思维导图配置页连续超时/重置，未能完成“生成”点击；页面没有 NotebookLM 侧的“已准备就绪”或明确配额文案，因此 producer 在 `mind-map-generation` 阶段落账为 `failed`，没有 `ready` JSON、没有远端交付。

本轮再次复发未来时间戳异常：适用日期按 `2026-08-31` 记账，但 claim/fail/收尾的系统与 producer 时间分别写成 `2026-09-01T07:34:41+08:00`、`2026-09-01T07:54:05+08:00` 与 `2026-09-01 07:54:15 +0800`。这必须继续视为通道/时钟异常，而不是正常“当天”值。当前账目：attempted=1/ready=0/failed=1/skipped=9/remaining_today=9；下一条 distinct 候选为 `youtube-s_I07Iq_2XM`。本条未生成本地 ready JSON，未触发 PicGo 或 AI-Life-Mentor 远端交付。

原始对话：dialogues/2026-0831.md「0754 notebooklm-single-fail」

## 0814 文字+信息图成功，思维导图因浏览器超时失败

决策：無涘 ｜ 记录：codex（自动）｜ session 01a05a2a-9d30-7591-a6b1-490517770732

本次处理固定候选 youtube-XPPtLNkVPWY（run-20260901073441-38822），预检返回 ready_to_claim 并通过。Chrome 工作台确认可编辑，来源收敛至单条视频后触发生成。文字总结成功落地且含明确边界段；信息图通过 viewer pageAssets.bundle() 导出并验为真实 PNG（2752x1536，SHA-256: c30ffc9341bb6144edb506ff416fbbe67cc5ff70b162cf900799b127b37d101e）。失败发生在思维导图阶段：浏览器在配置页连续超时/重置，未完成生成点击，页面亦未返回 NotebookLM 侧配额或完成文案，按规则落成 failed，未写本地 ready JSON，未进入远端交付。post-fail preflight 显示 claimed_today=1、remaining_today=9，下一条 distinct 候选为 youtube-s_I07Iq_2XM。本轮记录一项独立风险：适用日期锁定为 2026-08-31，但系统/producer 写出 2026-09-01T07:34:41+08:00 的未来时间戳，已作为首要风险写入留痕。结果已更新至自动化记忆、项目快照和 session 摘要。

原始对话：dialogues/2026-0901.md「0814 notebooklm-single-fail」

## 1242 Chrome fallback 复核纠正内置浏览器范围（2026-09-01）

决策：無涘（沿用收集合同）｜记录：codex（自动）｜session 01a05b11-718c-7a71-8bbd-8c94a426ab2e

用户指出页面实际能够正常打开后，补查发现此前结论只覆盖 Codex 内置浏览器：该浏览器的新标签页确实落在 Google 登录页。Chrome 扩展中已有一个 `Gemini Notebook` 工作台，原标签页被另一自动化会话占用；使用同一工作台的新标签页做只读复核，标题显示为目标 Notebook，DOM 同时确认来源面板、“添加来源”、对话区和 Studio 的“信息图 / 思维导图 / 演示文稿”控件。

因此将整体浏览器就绪状态纠正为 `available`；11:47 的 `unavailable` 运行报告保留为内置浏览器检查的历史证据，不再作为 Chrome 工作台不可用的结论。纠正后仍未 claim、未调用 NotebookLM、未改来源选择、未生成或上传资产；9 条固定候选改记为等待授权的 `deferred`，不是候选级失败。下一步等待用户明确确认最多 10 条、串行并发 1、自动重试 0 和服务边界，再从 `youtube-s_I07Iq_2XM` 开始。

原始对话：dialogues/2026-0901.md「1242 notebooklm-browser-access-block」
