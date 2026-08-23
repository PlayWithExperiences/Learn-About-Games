# Roadmap

## 2026-08-22：YouTube 官方元数据与内容回写分层

- 决策：無涘 ｜ 记录：AI
- 继续以现有 2,311 条 YouTube Work Item 为内容补全目标；官方 YouTube Data API 负责确认频道、视频 ID、公开元数据和字幕可用性，正文获取与摘要分析单独计量，不把元数据成功写成内容完成。
- 决策：無涘 ｜ 记录：AI
- 能取得并通过事实、主题、能力和摘要长度校验的派生字段可以原子写回对应 `src/data/resources.json`；原始字幕、凭据、失败详情和中间缓存留在仓库外。无法取得或正文不足的条目必须保留可区分的失败状态，不能生成猜测性摘要。
- 决策：無涘 ｜ 记录：AI
- 当前先按低频涓流和 24 小时通道冷却运行；若要把 2,215 条剩余条目从“可追踪”推进到“已分析”，还需要稳定的字幕或音频转写入口。官方 Captions API 不作为第三方频道字幕的通用解锁方案。
- 决策：無涘 ｜ 记录：AI
- 已验证并接入仓库外 `yt-dlp` 字幕入口：先获取英文 VTT、清洗重复 cue，再沿用现有严格摘要／主题／能力校验和原子回写。第一条生产条目已完成；有字幕标记的剩余条目优先进入该路线，无字幕标记的条目另行等待音频转写方案。

## 2026-08-22：Vertex 音频 fallback 首条生产验证

- 决策：無涘 ｜ 记录：AI
- Agent/Vertex API 不是 YouTube 数据入口；它在 ADC 成功后承担“已取得音频的理解与结构化分析”。本轮发现项目服务尚未实际启用，已在用户项目范围启用 `aiplatform.googleapis.com`，文本与音频最小探针均返回 200。
- 决策：無涘 ｜ 记录：AI
- 无可分析字幕时，回填器才尝试 `yt-dlp` 音频下载到仓库外 `~/.cache/lag-audio/`，再以 Gemini 结构化 JSON 生成摘要、一个主题和可证实的能力映射；响应必须经过既有 150–250 字校验、ID 白名单校验、`pending_write` 和原子写回。音频下载失败、Vertex 通道失败、Vertex 输出不可解析和输入过大分别留痕，不转换成空摘要。
- 决策：無涘 ｜ 记录：AI
- `yt-20260820-gmtk-chWr87u3Gdc` 的字幕双通道均不可分析，实际走音频路线并完成 `completed / inputMode=audio / vertex/gemini-2.5-flash`；生产目录总完成数升至 51，剩余 2,213 条。涓流副本已同步 `--audio-fallback`，但原有 YouTube 24 小时冷却仍保留至 2026-08-23 00:50，未强行解除。
- 时间估算：AI 推断。按当前约 6 条／天的保守策略，239 条仍标记有字幕的未完成条目约需 40 天；若剩余 2,213 条都能按同一频率成功，理论上约 369 天。音频路线只有 1 条生产样本，暂不承诺更短的全量日期，先用可观察的小批更新成功率与成本。
- 决策：無涘 ｜ 记录：AI。涓流先处理仓库外 priority 文件中的 GMTK／樱井候选；该候选耗尽后自动取消 ID 过滤，继续处理全部 2,311 条，避免优先级队列耗尽后静默停摆。已有 retryable 失败仍保持可辨认，不计入完成。
- 决策：無涘 ｜ 记录：AI。发现官方 YouTube 描述也是可追溯的正文入口：目标中约 2,096 条描述去除 URL 后至少 240 个字符。新增 `description` 输入模式；元数据标记无字幕且描述达标时优先使用描述，避免额外触发 YouTube 通道，描述不足才转音频。5、20、50 和 100 条描述批次及 1 条重试已完成，累计新增 176 条描述回写，当前总完成数 227、剩余 2,037 条。
- 决策：無涘 ｜ 记录：AI。涓流已增加 `--description-only`：每 4 小时先处理最多 20 条达标描述，描述队列为空才退回单条字幕/音频路线；这样不提高 YouTube 请求速率，却不会让描述正文被 6 条／天的通道冷却拖慢。
- 时间估算：AI 推断。最近 50 条约 10 分钟、100 条约 20 分钟完成；176 条描述样本中 1 条模型输出失败，重试后成功。描述路线成功率与模型吞吐仍需扩大样本后再估算，不能用当前样本替代剩余 2,037 条的最终完成证据。

## 2026-08-22：官方描述第二轮百条回写

- 决策：無涘 ｜ 记录：AI。继续使用 `--description-only` 处理已缓存的官方描述；本轮 100/100 条完成，未请求字幕、未下载音频，未新增模型失败或通道失败。当前累计 327 completed，剩余 1,937 条；其中 276 条明确记录为 `inputMode=description`。
- 时间估算：AI 推断。本轮从启动到完整收尾约 26.5 分钟，慢于前一批约 20 分钟，原因是个别无效模型输出触发修复／fallback；实际吞吐仍不足以承诺固定全量日期。每 4 小时最多 20 条的无人值守队列继续生效。

## 2026-08-22：官方描述第三轮百条回写

- 决策：無涘 ｜ 记录：AI。第三轮 `description-only` 生产批次 100/100 完成，未请求字幕、未下载音频，未新增模型失败或通道失败。当前累计 427 completed、剩余 1,837 条；其中 376 条明确记录为 `inputMode=description`。
- 时间估算：AI 推断。本轮约 20.5 分钟完成，快于第二轮约 26.5 分钟；由于模型输出和 fallback 仍会波动，继续使用每 4 小时最多 20 条作为无人值守上限，不承诺固定日期。

## 2026-08-22：官方描述第四轮百条回写与报告口径修正

- 决策：無涘 ｜ 记录：AI。第四轮 `description-only` 最终 100/100 完成：首轮 98 条成功、2 条因模型输出校验失败而显式留痕，随后两条定向重试均成功。批次没有请求字幕、下载音频或新增 YouTube 通道失败；当前累计 527 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure，model failure 为 0。
- 决策：無涘 ｜ 记录：AI。当前完成入口为 476 条 `description`、1 条 `transcript`、1 条 `audio` 和 49 条历史回写；真正未完成为 1,784 条，其中 1,737 条尚未分类，47 条已经尝试但仍处于显式非完成状态。回填报告新增 `uncompletedAfterRun`，与保留兼容性的 `remainingAfterRun`（尚未分类）分开，避免把已失败条目误算成未尝试。
- 时间估算：AI 推断。本轮从 17:36 左右运行至 18:04 左右，约 27.7 分钟；描述路线继续按每 4 小时最多 20 条运行。若 1,737 条尚未分类条目都具备合格官方描述，理论约 14–15 天；其余 47 条不能按描述吞吐估算。

## 2026-08-22：官方描述第五轮百条回写与主题/能力提示修正

- 决策：無涘 ｜ 记录：AI。第五轮 `description-only` 最终 100/100 完成，未请求字幕、未下载音频，也未增加 YouTube 通道失败。首轮有 1 条模型输出失败，原因是模型把能力 ID `aesthetic-direction` 放进资源主题字段；该条未写入错误结果，修正提示后定向重试成功。
- 决策：無涘 ｜ 记录：AI。当前累计 627 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure，model failure 为 0；完成入口为 576 条 `description`、1 条 `transcript`、1 条 `audio` 和 49 条历史回写。真正未完成 1,684 条，其中 1,637 条尚未分类，47 条已尝试但仍是显式非完成状态。
- 决策：無涘 ｜ 记录：AI。回填提示已明确区分 `resourceTopicIds` 与 `capabilityIds`，并加入回归测试；未知主题不自动映射到看似相近的能力，拿不准时保留原有主题。报告继续同时暴露 `remainingAfterRun`（尚未分类）和 `uncompletedAfterRun`（未完成总数）。
- 时间估算：AI 推断。第五轮从 18:15 左右运行至 18:40 左右，约 24.9 分钟；若 1,637 条尚未分类条目都能使用合格官方描述，按每 4 小时最多 20 条理论约 13–14 天，其余 47 条仍不适用该估算。

## 2026-08-22：官方描述第六轮百条回写与定向重试

- 决策：無涘 ｜ 记录：AI。第六轮 `description-only` 最终 100/100 完成，未请求字幕、未下载音频，也未增加 YouTube 通道失败。首轮有 1 条模型输出失败，原因是摘要过短并混入未知主题 `business-management`；该结果未写回，定向重试成功。
- 决策：無涘 ｜ 记录：AI。当前累计 727 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure，model failure 为 0；完成入口为 676 条 `description`、1 条 `transcript`、1 条 `audio` 和 49 条历史回写。真正未完成 1,584 条，其中 1,537 条尚未分类，47 条已尝试但仍是显式非完成状态。
- 时间估算：AI 推断。第六轮从 18:46 左右运行至 19:08 左右，约 21.6 分钟；若 1,537 条尚未分类条目都能使用合格官方描述，按每 4 小时最多 20 条理论约 12–13 天，其余 47 条仍不适用该估算。

## 2026-08-22：官方描述第七轮百条回写

- 决策：無涘 ｜ 记录：AI。第七轮 `description-only` 最终 100/100 完成，未请求字幕、未下载音频，也未增加模型或 YouTube 通道失败。当前累计 827 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure，model failure 为 0。
- 决策：無涘 ｜ 记录：AI。完成入口为 776 条 `description`、1 条 `transcript`、1 条 `audio` 和 49 条历史回写；真正未完成 1,484 条，其中 1,437 条尚未分类，47 条已尝试但仍是显式非完成状态。
- 时间估算：AI 推断。本轮从 19:10 左右运行至 19:31 左右，约 20.3 分钟；若 1,437 条尚未分类条目都能使用合格官方描述，按每 4 小时最多 20 条理论约 12 天，其余 47 条仍不适用该估算。

## 2026-08-22：官方描述第八轮与跨字段 ID 归一化

- 决策：無涘 ｜ 记录：AI。第八轮 `description-only` 最终 100/100 完成；首轮 1 条模型输出把能力 ID `aesthetic-direction` 放进资源主题字段，白名单拒绝后没有写回错误结果。新增确定性规则：主题字段中的未知 ID 若恰好是合法能力 ID，则丢弃该误放并由脚本保留原主题；其它未知 ID 仍硬失败并留痕。
- 决策：無涘 ｜ 记录：AI。归一化后的定向重试成功，当前累计 927 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure，model failure 为 0；完成入口为 876 条 `description`、1 条 `transcript`、1 条 `audio` 和 49 条历史回写。真正未完成 1,384 条，其中 1,337 条尚未分类，47 条已尝试但仍是显式非完成状态。
- 时间估算：AI 推断。本轮从 19:33 左右运行至 19:53 左右，约 20.3 分钟；若 1,337 条尚未分类条目都能使用合格官方描述，按每 4 小时最多 20 条理论约 11–12 天，其余 47 条仍不适用该估算。

## 2026-08-22：官方描述第九轮百条回写

- 决策：無涘 ｜ 记录：AI。第九轮 `description-only` 最终 100/100 完成，未请求字幕、未下载音频，也未增加模型或 YouTube 通道失败。当前累计 1,027 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure，model failure 为 0。
- 决策：無涘 ｜ 记录：AI。完成入口为 976 条 `description`、1 条 `transcript`、1 条 `audio` 和 49 条历史回写；真正未完成 1,284 条，其中 1,237 条尚未分类，47 条已尝试但仍是显式非完成状态。
- 时间估算：AI 推断。本轮从 19:58 左右运行至 20:17 左右，约 18.9 分钟；若 1,237 条尚未分类条目都能使用合格官方描述，按每 4 小时最多 20 条理论约 10–11 天，其余 47 条仍不适用该估算。

## 2026-08-22：官方描述第十轮百条回写

- 决策：無涘 ｜ 记录：AI。第十轮 `description-only` 生产批次 100/100 完成，未请求字幕、未下载音频，也未增加模型或通道失败。批次从 20:19:57 到 20:37:32（约 17.6 分钟）完成。
- 决策：無涘 ｜ 记录：AI。当前累计 1,127 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure，model failure 为 0；完成入口为 1,076 条 `description`、1 条 `transcript`、1 条 `audio`，另有 49 条历史回写无入口字段。真正未完成 1,184 条，其中 1,137 条尚未分类，47 条已尝试但仍未完成。
- 时间估算：AI 推断。若 1,137 条尚未分类条目都能使用合格官方描述，按每 4 小时最多 20 条理论约 9–10 天；描述不足、字幕通道失败和音频路线仍需独立处理，不能把该乐观估算当作全量完成承诺。

## 2026-08-22：官方描述第十一轮与 GDC 页脚误判修正

- 决策：無涘 ｜ 记录：AI。第十一轮 `description-only` 初次处理 100 条时 99 条成功、1 条因模型把 GDC 频道统一页脚中的 `visual-arts` 当成资源主题而失败；该错误结果没有写回。核对官方描述确认该词只出现在频道通用栏目宣传，不是《Rendering the World of Far Cry 4》的视频证据。
- 决策：無涘 ｜ 记录：AI。新增窄规则：仅忽略已观察到的 GDC 统一页脚标签 `visual-arts` 与 `business-management`，让目录保留原有保守主题；其它未知 ID 仍硬失败并留痕。回归测试从 16/16 增至 17/17，第三次定向重试成功，最终第十一轮 100/100 完成。
- 决策：無涘 ｜ 记录：AI。当前累计 1,227 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure，model failure 为 0；完成入口为 1,176 条 `description`、1 条 `transcript`、1 条 `audio`，另有 49 条历史回写无入口字段。真正未完成 1,084 条，其中 1,037 条尚未分类，47 条已尝试但仍未完成。
- 时间估算：AI 推断。第十一轮从 20:39:47 初次启动到 21:07:51 完成最终定向重试，端到端约 28.1 分钟；若 1,037 条尚未分类条目都能使用合格官方描述，按每 4 小时最多 20 条理论约 8–9 天，其余失败条目仍需独立处理。

## 2026-08-22：官方描述第十二轮百条回写

- 决策：無涘 ｜ 记录：AI。第十二轮 `description-only` 100/100 完成，未请求字幕、未下载音频，也未增加模型或通道失败；从 21:10:09 到 21:33:34，约 23.4 分钟。
- 决策：無涘 ｜ 记录：AI。当前累计 1,327 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure，model failure 为 0；完成入口为 1,276 条 `description`、1 条 `transcript`、1 条 `audio`，另有 49 条历史回写无入口字段。真正未完成 984 条，其中 937 条尚未分类，47 条已尝试但仍未完成。
- 时间估算：AI 推断。若 937 条尚未分类条目都能使用合格官方描述，按每 4 小时最多 20 条理论约 7–8 天；描述不足、字幕通道失败和音频路线仍需独立处理，不能把该乐观估算当作全量完成承诺。

## 2026-08-22：官方描述第十三轮百条回写

- 决策：無涘 ｜ 记录：AI。第十三轮 `description-only` 100/100 完成，未请求字幕、未下载音频，也未增加模型或通道失败；从 21:35:10 到 21:55:54，约 20.7 分钟。
- 决策：無涘 ｜ 记录：AI。当前累计 1,427 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure，model failure 为 0；完成入口为 1,376 条 `description`、1 条 `transcript`、1 条 `audio`，另有 49 条历史回写无入口字段。真正未完成 884 条，其中 837 条尚未分类，47 条已尝试但仍未完成。
- 时间估算：AI 推断。若 837 条尚未分类条目都能使用合格官方描述，按每 4 小时最多 20 条理论约 7 天；描述不足、字幕通道失败和音频路线仍需独立处理，不能把该乐观估算当作全量完成承诺。

## 2026-08-22：官方描述第十四轮百条回写

- 决策：無涘 ｜ 记录：AI。第十四轮 `description-only` 100/100 完成，未请求字幕、未下载音频，也未增加模型或通道失败；从 21:57:20 到 22:15:01，约 17.7 分钟。
- 决策：無涘 ｜ 记录：AI。当前累计 1,527 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure，model failure 为 0；完成入口为 1,476 条 `description`、1 条 `transcript`、1 条 `audio`，另有 49 条历史回写无入口字段。真正未完成 784 条，其中 737 条尚未分类，47 条已尝试但仍未完成。
- 时间估算：AI 推断。若 737 条尚未分类条目都能使用合格官方描述，按每 4 小时最多 20 条理论约 6–7 天；描述不足、字幕通道失败和音频路线仍需独立处理，不能把该乐观估算当作全量完成承诺。

## 2026-08-22：官方描述第十五轮百条回写

- 决策：無涘 ｜ 记录：AI。第十五轮 `description-only` 100/100 完成，未请求字幕、未下载音频，也未增加模型或通道失败；从 22:18:01 到 22:38:23，约 20.4 分钟。
- 决策：無涘 ｜ 记录：AI。当前累计 1,627 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure，model failure 为 0；完成入口为 1,576 条 `description`、1 条 `transcript`、1 条 `audio`，另有 49 条历史回写无入口字段。真正未完成 684 条，其中 637 条尚未分类，47 条已尝试但仍未完成。
- 时间估算：AI 推断。若 637 条尚未分类条目都能使用合格官方描述，按每 4 小时最多 20 条理论约 5–6 天；描述不足、字幕通道失败和音频路线仍需独立处理，不能把该乐观估算当作全量完成承诺。

## 2026-08-22：第十六轮遇 OpenRouter 402，切换 Google ADC/Vertex 文本入口

- 决策：無涘 ｜ 记录：AI。第十六轮描述批次初次启动后处理到 63/100；其中 61 条成功，2 条所有 OpenRouter 模型均返回 HTTP 402。402 是模型通道/付款状态，不是视频内容不可得；两条错误结果均未写回，批次在继续重复 402 后中止，保留已落盘状态。
- 决策：無涘 ｜ 记录：AI。新增 `call_vertex_text` 与 `--vertex-text`，复用 ADC、`gemini-2.5-flash`、结构化 JSON、摘要长度和主题/能力白名单校验。两条 402 条目经 Vertex 文本定向重试均成功，`inputMode=description`、模型为 `vertex/gemini-2.5-flash`；Python 合同测试增至 18/18。
- 决策：無涘 ｜ 记录：AI。描述涓流和外部 launchd 副本已切换为 `--vertex-text`；以后描述/字幕文本分析不再依赖 OpenRouter，音频路线本来就使用 Vertex。当前累计 1,692 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure，model failure 为 0；真正未完成 619 条，其中 572 条尚未分类，47 条已尝试但仍未完成。
- 时间估算：AI 推断。Vertex 文本只有 2 条生产样本，不能假定与 OpenRouter 吞吐相同；若仍按每 4 小时最多 20 条，572 条尚未分类条目理论约 4–5 天，需用后续批次重新测量。

## 2026-08-22：Vertex 文本批次完成与音频回退修复

- 决策：無涘 ｜ 记录：AI。Vertex 描述批次最终 100/100 完成：首轮 63 条直接成功，37 条因摘要长度校验失败，经过保留原始 JSON、最多三次修复和定向重试全部完成。当前累计 1,792 completed、4 no_transcript、2 transcript_insufficient、41 channel_failure、model failure 0；真正未完成 519 条，其中 472 条尚未分类、47 条为显式非完成状态。
- 决策：無涘 ｜ 记录：AI。新增 Vertex 文本修复的多轮草稿传递、音频首轮草稿修复、第三方字幕异常统一转换为本地 `NoTranscriptFound`；合同测试增至 24/24。音频回退成功验证并完成 1 条资源，完成入口现为 1,740 description、1 transcript、2 audio、49 条历史回写无入口字段。所有未通过校验的模型结果均未写入资源库。
- 时间估算：AI 推断。本轮 Vertex 初次 100 条约 8 分钟，含修复与音频回退的端到端收尾约 26 分钟；按当前手动吞吐，472 条未分类候选约需 2–3 小时模型运行时间，若受 launchd 每 4 小时最多 20 条限制则约 4–5 天。41 条字幕通道失败仍需单独走可用入口或保持显式失败。

## 2026-08-23：Vertex 字幕批次收束与 ADC 通道阻塞

- 决策：無涘 ｜ 记录：AI。`vertex-transcript-batch-20260823-0005` 已完整处理 100/100，报告写入 `finishedAt`；随后涓流任务又将 1 条合格官方描述写回。2,311 个目标中累计 2,001 条资源完成，完成入口为 1,759 `description`、191 `transcript`、2 `audio` 和 49 条历史回写无入口字段。外部正式状态为 4 `no_transcript`、2 `transcript_insufficient`、49 `transcript_channel`、1 `vertex_output`，另有 254 条尚未分类；没有 `pending_write`，完成项的摘要长度与状态记录逐条一致。
- 决策：無涘 ｜ 记录：AI。对剩余队列的 `description-only` 静态筛选为 0：2 条无字幕条目的描述去除 URL 后仍不满足证据门槛，其余条目没有合格描述。下一批字幕入口在 5/100 连续遇到 `vertex_channel` 后按熔断规则停止；显式音频回退小批在 5/10 连续遇到同一 ADC 取 token 失败后停止。两轮共 10 条均没有资源写入，临时状态逐条保留了失败与重试状态；没有把 ADC 失败解释成视频没有内容。
- 决策：無涘 ｜ 记录：AI。代码新增的字幕通道→音频回退资格和跨字段 ID 归一化通过 26/26 合同测试；资源文件本身没有写入未验证摘要。当前仓库外正式 state 仍是上一个完整批次，临时 state 的 10 条 `vertex_channel` 记录待认证恢复、权限恢复后同步。
- 阻塞：AI 记录。新进程写 `~/.cache/lag-video-content` 被当前沙盒拒绝；ADC access token 同时已过期，普通 gcloud token 探针也无法使用。下一步需要在本机恢复 Google ADC 登录（不把凭据放进仓库），再从可恢复 state 继续；Vertex 和官方 YouTube 元数据入口的职责边界不变。
- 时间估算：AI 推断。ADC 恢复后，剩余 70 条有字幕的 GMTK 条目按近期吞吐约为 1 小时级；179 条樱井条目当前没有可用字幕、合格描述或本地音频证据，不能承诺完成日期，需先获得新的正文入口。

## 2026-08-23：官方描述全量候选模式

- 决策：無涘 ｜ 记录：AI。重新盘点外部正式 state 的 254 条未分类项：75 条 GMTK 视频仍标记有字幕，其中 74 条官方描述去除 URL 后达到证据门槛；179 条樱井视频没有合格官方描述，也没有本地字幕/音频缓存。此前 `--description-only` 只选择“官方标记无字幕”的描述，因而漏掉了这 74 条可直接分析的证据。
- 决策：無涘 ｜ 记录：AI。回填脚本新增显式 `--description-only-all`，在不请求字幕、不下载音频的前提下，强制把达标官方描述作为模型证据；原 `--description-only` 语义保持不变。dry-run 选出 74 条，未调用模型、未写资源；合同测试增至 27/27。
- 决策：無涘 ｜ 记录：AI。唯一真源 `scripts/trickle-video-content.sh` 已切换到新模式，实际 launchd 副本因当前 Codex 沙盒不能写仓库外缓存而尚未同步；正常终端需执行一次副本同步，之后后台每轮最多处理 20 条。资源写回仍要求摘要长度、主题/能力白名单和原子 state 校验，失败继续分类留痕。
- 推断：AI。74 条官方描述候选按已验证 Vertex 文本吞吐约需 1–2 小时模型运行量，但按现有涓流频率是数天级；179 条无正文证据项不能给出完成日期，须先获得字幕、音频或其它可核验正文入口。

## 2026-08-23：官方描述涓流真实批次与旧副本兼容修复

- 决策：無涘 ｜ 记录：AI。直接触发既有 launchd 任务后，真实 report 从选中 20 条开始逐条更新，最终 `processedThisRun=20`、`finishedAt` 已写入；正式完成数由 2,001 增至 2,021，`no_transcript`、`transcript_insufficient`、通道失败和模型失败均未增加。
- 决策：無涘 ｜ 记录：AI。审计发现旧 launchd 副本仍传 `--description-only`；回填器已将该参数与 `--description-only-all` 统一为“达标官方描述优先且不请求字幕/音频”，并抽出 `should_prefer_description` 加入合同测试。这样旧副本也能消费描述队列，避免因副本不同步而回退到 YouTube 字幕路线。
- 验证：AI。修复后 `--description-only` dry-run 仍选出 74 条（使用旧临时 state），Python 合同测试增至 28/28，shell 语法和 diff 检查通过；真实批次的最终 state/report/resources 三个时间戳均为 01:36:21，且三者完成数一致。
- 推断：AI。剩余正式未分类为 234 条，其中描述候选预计还可继续分批；179 条樱井视频仍没有可核验正文证据，不能把它们标为完成或给出无依据的截止日期。

## 2026-08-23：第二轮官方描述涓流真实批次

- 决策：無涘 ｜ 记录：AI。再次触发 launchd 后，第二轮描述批次最终 20/20 成功，正式完成数由 2,021 增至 2,041；中途 1 条 `pending_write` 随原子写入正常收敛，最终没有 `pending_write`，也没有新增通道或模型失败。
- 验证：AI。state、report、resources 三者更新时间均为 01:44:42；报告记录 `selectedThisRun=20`、`processedThisRun=20`、`remainingAfterRun=214`、`uncompletedAfterRun=270`。2,041 条完成资源的摘要均存在、长度符合 150–250，`summaryLength` 全部一致。
- 推断：AI。剩余未分类降至 214 条，其中 34 条仍可走官方描述；179 条樱井视频仍没有字幕、合格描述或本地音频证据，需新的正文入口后才能继续完成。

## 2026-08-23：描述队列清空与单条回退恢复

- 决策：無涘 ｜ 记录：AI。第三轮官方描述批次 20/20、第四轮剩余描述批次 14/14 均成功，完成数由 2,041 增至 2,075；正式未分类降至 180，官方描述候选已清空，没有新增失败。
- 决策：無涘 ｜ 记录：AI。描述队列耗尽后触发两次单条回退，分别把 2 条原 `transcript_insufficient` 恢复为合格完成；两条最终实际使用的是官方描述（`inputMode=description`），不是音频成功，避免把回退路径误报成音频分析。
- 验证：AI。当前 state 为 2,077 completed、180 未分类、50 retryable、4 no_transcript，`transcript_insufficient=0`；2,077 条完成资源均有 150–250 字摘要，`summaryLength` 一致，`pending_write=0`。后续剩余项全部转入单条字幕/音频或新正文入口探测。
- 风险：AI 记录。剩余约 179 条樱井视频当前没有可核验字幕、合格描述或本地音频缓存；低频通道探测仍可能因 YouTube/Vertex 限制熔断，不能将其提前标为无内容或完成。

## 2026-08-23：单条终态恢复与音频通道熔断

- 决策：無涘 ｜ 记录：AI。描述队列耗尽后连续单条回退又恢复 3 条 `no_transcript`，均核验为官方描述证据；正式完成数达到 2,080，`no_transcript` 与 `transcript_insufficient` 均降为 0。
- 决策：無涘 ｜ 记录：AI。下一条才进入真正音频入口，条目 `yt-20260820-gdc-9YG9INjO91Y` 被明确记录为 `status=retryable`、`failureClass=audio_channel`、`audioAttempted=true`；没有写入摘要。通道失败总数由 49 增至 50，按现有规则进入 24 小时冷却。
- 验证：AI。当前 state 为 2,080 completed、180 未分类、50 条通道失败、1 条模型输出失败；`remainingAfterRun=180`、`uncompletedAfterRun=231`，资源目录没有因失败产生新摘要。
- 下一步：AI 记录。冷却结束后先定向重试该 `audio_channel` 条目，再按单条低频策略处理 180 条未分类项；若通道仍失败，保持 retryable 并继续寻找新的正文入口，不将其改写为“没有内容”。

## 2026-08-23：剩余未分类证据盘点

- 核查：AI。当前 180 条未分类项已按官方元数据重新盘点：1 条来自 GMTK，字幕标记为可用但描述未达证据门槛；179 条来自樱井频道，字幕标记为不可用且官方描述均不足。未分类项没有字幕文本缓存，音频缓存仅有已完成条目。
- 推断：AI。剩余项不能继续走描述路线，也不能仅凭标题或频道元数据生成摘要；它们必须等待字幕/音频/其它正文入口，或保持未分类并在下一次单条通道探测中转为明确的 retryable 失败。
- 决策：無涘 ｜ 记录：AI。24 小时冷却期间不强行解除通道保护；冷却结束后先定向重试 `yt-20260820-gdc-9YG9INjO91Y` 的 `audio_channel`，再按单条策略继续处理未分类项。

## 80. 官方字幕接口边界与 retryable 调度修复（2026-08-23）

- 核查：AI。官方 [`captions.list`](https://developers.google.com/youtube/v3/docs/captions/list) 的响应只列出视频的字幕轨道，不返回字幕正文，并要求 `youtube.force-ssl` 或 `youtubepartner` scope；[`captions.download`](https://developers.google.com/youtube/v3/docs/captions/download) 虽可返回字幕文件，但官方明确要求当前用户拥有该视频的编辑权限。用户当前账号是 API 调用者而非这三个第三方频道的内容所有者，因此这条官方接口不能作为通用第三方字幕入口。
- 决策：無涘 ｜ 记录：AI。保留 YouTube Data API v3 的公开元数据同步和 ADC/Vertex 内容分析职责；不把官方 captions 接口包装成“可绕过限流的正文下载器”，也不因为它返回空/403 就把视频标为没有内容。
- 修复：AI。发现描述、未分类音频候选耗尽后，涓流脚本原先会重复得到空候选而不触碰已记录的 `retryable`；新增每轮最多重试 1 条 `retryable` 的分支，保留 24 小时通道冷却与失败分类。改动文件为 `scripts/trickle-video-content.sh`，不改变资源写回合同。
- 验证：AI。`bash -n scripts/trickle-video-content.sh`、28/28 Python 合同测试和 `git diff --check` 均通过；当前冷却仍有效，因此没有强行触发 YouTube/音频请求。

原始对话：dialogues/2026-0823.md「0212 官方字幕接口边界与 retryable 调度修复」

## 81. 外部正文入口小样本验证（2026-08-23）

- 核查：AI。按 agent-reach 路由先运行 `agent-reach doctor --json`：当前 YouTube 专用 `yt-dlp` 后端未安装，Exa 网页搜索后端可用。对樱井频道的具体标题做小样本搜索，找到与单条视频对应的第三方文章摘要，例如 [No Masterpiece Has Bad Audio](https://gonintendo.com/contents/41179-sakurai-believes-no-gaming-masterpiece-has-bad-audio) 和 [Elementary School Play Testers](https://pokemonblog.com/2024/09/03/video-super-smash-bros-ultimate-director-masahiro-sakurai-talks-about-elementary-school-play-testers)。
- 判断：AI 推断。该路线证明“外部正文可能存在”，但搜索结果覆盖不稳定、不是官方视频正文、还需要逐条核对视频 ID 与来源并保留外部链接；当前不足以安全批量生成 179 条摘要。因此本轮不把搜索片段或标题推断写入 `resources.json`。
- 下一步：AI 记录。冷却后优先恢复低频字幕/音频通道；若通道持续失败，再以可定位到具体视频的外部文章为候选证据，先做小批来源—视频 ID—摘要闭环验证，再决定是否扩展。

原始对话：dialogues/2026-0823.md「0212 官方字幕接口边界与 retryable 调度修复」

## 82. 音频通道根因定位与本地工具链修复（2026-08-23）

- 核查：AI。读取外部 `failures.log` 后确认 `yt-20260820-gdc-9YG9INjO91Y` 的所谓 `audio_channel` 失败原因为 `Postprocessing: ffprobe and ffmpeg not found`，不是已证实的 YouTube IP 限流。当前机器实际已有 `/opt/homebrew/bin/ffmpeg` 与 `/opt/homebrew/bin/ffprobe`（8.1.2_1）。
- 修复：AI。`scripts/backfill_video_content.py` 新增 ffmpeg/ffprobe 路径探测，并向 yt-dlp 显式传 `--ffmpeg-location`；本地工具缺失现在分类为 `audio_tooling`，不会触发 YouTube 通道熔断。合同测试由 28/28 增至 31/31，另有 runtime 维护隔离测试 1/1；Python 编译、shell 语法和 diff 检查通过。
- 验证：AI。随后完整 `npm run build` 通过：Astro check 0/0/0、Vitest 204/204、静态输出 151 页；02:39 复跑结果仍一致。
- 状态：AI 记录。外部正式 state 与冷却标记尚未在当前沙盒内改写；历史条目仍保留 `audio_channel`，下一次正常终端同步脚本后会先验证本地工具链。当前冷却仍持续到 2026-08-24 02:00:35 +0800。
- 下一步：AI。正常终端执行脚本副本同步后，冷却结束再重试该条；若成功，按单条策略继续 180 条未分类和其余 retryable，不把旧的工具链故障继续算成 YouTube 通道失败。
- 工具：AI。新增 `scripts/repair_video_runtime.py`，默认只读预检；通过 `--apply --kickstart` 才会在验证最后一条失败日志、state 分类和冷却存在后执行外部 runtime 修复。隔离测试 1/1 通过，未修改资源目录。
- 状态：AI。回填器新增 `evidence_pending` 初始化：缺失记录会逐条留下“尚未调用分析模型”的下一步，不会被当作成功、失败或无内容；report 新增 `unclassifiedAfterRun` 与 `evidencePendingAfterRun`。回填合同测试 31/31 通过。

原始对话：dialogues/2026-0823.md「0224 音频通道根因定位与工具链修复」

## 2026-08-23：二手正文入口小批验证与安全回写合同

- 决策：無涘 ｜ 记录：AI。对 179 条缺少官方描述、字幕正文和本地音频证据的樱井视频继续寻找可核验入口；通过 agent-reach/Exa 定位并逐页核对 Senko's Activity Log 的 [Team Management](https://en.senkohome.com/sakurai-game-dev-team-management/) 与 [Planning & Game Design](https://en.senkohome.com/sakurai-game-dev-planning-design/) 专题页，先完成 25 条小批（6 条 Team Management、19 条 Planning & Game Design）。
- 决策：無涘 ｜ 记录：AI。25 条资源写入中文摘要、能力/主题映射和 `externalSignals`；来源明确标为“二手专题摘要（非视频正文）”，不宣称取得官方字幕、完整转录或直接视频分析。文章内容只被压缩为逐条摘要，不把整篇外部文章复制进仓库。
- 修复：AI。`repair_video_runtime.py` 新增受严格标记约束的外部旁证对账：仅接受准确 provider/label、150–250 字摘要、HTTP(S) URL 和唯一主要主题；校验摘要 SHA-256；state 已有非 `evidence_pending` 记录时拒绝覆盖。显式 `--apply` 后才把仓库已审资源同步为 `external_article / secondary_summary`，再为剩余缺失记录初始化 `evidence_pending`。
- 验证：AI。25 条旁证资源逐条校验通过；回填合同 31/31、runtime 修复测试 3/3、Astro check 0/0/0、Vitest 204/204、静态构建 151 页通过。由于当前沙盒不能写仓库外缓存，本轮没有执行 `--apply`；正式 state 仍为 2,080 completed、51 retryable、180 条缺失记录。
- 推断：AI。若在正常终端执行 `--apply --kickstart` 且前置失败指纹未变化，预计 state 将增加 25 条 `completed`，并把剩余 155 条缺失记录标为 `evidence_pending`；这只代表“尚未调用分析模型”，不是“没有内容”。随后仍需逐条寻找一手正文或可接受的二手旁证，不能把 155 条直接视为已完成。

原始对话：dialogues/2026-0823.md「0307 二手正文入口小批验证与安全回写合同」

## 2026-08-23：Work Attitude 专题二十三条旁证补全

- 决策：無涘 ｜ 记录：AI。沿已验证的 Senko's Activity Log 二手旁证路线继续扩展，逐条核对 Work Attitude 专题页的 23 个编号、小节标题和对应 YouTube 链接；没有按标题猜测，也没有把专题页当作官方字幕。
- 产出：AI。新增 23 条资源侧中文摘要，并补齐合法 `capabilityIds`、`resourceTopicIds` 和固定 `externalSignals` 标记；摘要长度为 150–204 字。连同前两批，仓库已准备 48 条可在显式 apply 后对账的二手旁证记录。
- 修复：AI。首轮生成被长度合同拦截一条 133 字摘要，未产生写回；补足后再应用。构建还捕获并修正 3 条把资源主题 ID 误放进 `capabilityIds` 的字段语义错误，回归后恢复通过。
- 验证：AI。Work Attitude 23 条、累计 48 条旁证逐条校验通过；回填合同 31/31、runtime 修复测试 3/3、Vitest 204/204、Astro check 0/0/0、静态构建 151 页通过。外部正式 state 仍未执行 apply，保持 2,080 completed、51 retryable、180 条缺失记录。
- 推断：AI。若正常终端显式执行 `--apply --kickstart` 且前置失败指纹未变化，预计 48 条会进入 `completed / external_article / secondary_summary`，其余 132 条缺失 state 的目标进入 `evidence_pending`；仍不能把后者当作没有内容或已完成。

原始对话：dialogues/2026-0823.md「0319 Work Attitude 专题二十三条旁证补全」

## 2026-08-23：Gameplay 专题二十九条旁证补全

- 决策：無涘 ｜ 记录：AI。继续沿逐条二手旁证路线核对 Gameplay 专题页的 29 个编号、小节和 YouTube 链接；页面将 gameplay 解释为风险与奖励的心理博弈，并同时提醒 gameplay 不是全部游戏乐趣。该边界保留在资源摘要中。
- 产出：AI。新增 29 条资源侧中文摘要，补齐合法 `capabilityIds`、`resourceTopicIds` 和固定 `externalSignals`；摘要长度为 150–169 字。累计 77 条资源已准备好在显式 apply 后对账。
- 失败可辨认：AI。第一次完整构建捕获 4 个资源主题字段误用了能力 ID，未把它们当作成功；已改为合法资源主题并重新回归。
- 验证：AI。Gameplay 29 条、累计 77 条旁证逐条校验通过；回填合同 31/31、runtime 修复测试 3/3、Vitest 204/204、Astro check 0/0/0、静态构建 151 页通过。外部正式 state 仍未执行 apply，保持 2,080 completed、51 retryable、180 条缺失记录。
- 推断：AI。若正常终端显式执行 `--apply --kickstart` 且前置失败指纹未变化，预计 77 条会进入 `completed / external_article / secondary_summary`，其余 103 条缺失 state 的目标进入 `evidence_pending`；仍不能把后者当作没有内容或已完成。

原始对话：dialogues/2026-0823.md「0324 Gameplay 专题二十九条旁证补全」

## 2026-08-23：Design Specifics、UI、Graphics、Effects、Game Concepts 与 Motion 专题扩展（03:46）

- 决策：無涘 ｜ 记录：AI。继续沿已核对的 Senko's Activity Log 专题入口扩展樱井资源旁证；新增 Design Specifics 18 条、UI 15 条、Graphics 20 条、Effects 11 条、Game Concepts 12 条，以及仓库标签为 Animation 的 Motion 18 条，共新增 94 条，累计 171 条。
- 证据边界：AI。每条记录保留专题页 URL，并使用“二手专题摘要（非视频正文）”标签；摘要依据专题页的编号、标题和段落压缩，不声称取得官方字幕、完整转录或直接视频分析。对应入口为 [Design Specifics](https://en.senkohome.com/sakurai-game-dev-specification/)、[UI](https://en.senkohome.com/sakurai-game-dev-ui/)、[Graphics](https://en.senkohome.com/sakurai-game-dev-graphics/)、[Effects](https://en.senkohome.com/sakurai-game-dev-effect/)、[Game Concepts](https://en.senkohome.com/sakurai-game-dev-concept/) 和 [Motion](https://en.senkohome.com/sakurai-game-dev-motion/)。
- 验证：AI。171 条资源摘要长度为 150–205 字；唯一主要资源主题、能力白名单和旁证标记逐条通过。完整 `npm run build` 于 03:46 通过：Astro check 0/0/0、Vitest 204/204、静态 151 页；Python 回填合同 31/31、runtime 维护测试 4/4。
- 失败可辨认：AI。只读对账发现 171 条旁证中 43 条的外部 state 已是官方 `description/audio` 完成，128 条尚未进入 state；这不是应覆盖的冲突。`repair_video_runtime.py` 已改为保留既有官方完成、把 ID 写入 `externalArticleSkippedExisting`，只镜像 128 条新 `external_article / secondary_summary`，并继续对真正的 retryable 冲突拒绝覆盖。
- 推断：AI。正常终端显式执行 `--apply --kickstart` 后，预计 state 为 2,208 completed、49 条 transcript channel failure、1 条 model failure、1 条 audio tooling retryable、52 条 `evidence_pending`；这只是 apply 前的预期，当前外部正式 state 仍是 2,080 completed、51 retryable 和 180 个目标缺失记录。

原始对话：dialogues/2026-0823.md「0346 五组专题扩展与旁证对账边界修复」

## 2026-08-23：Sound、Programming、PR 旁证扩展与最终 state 投影（04:08）

- 决策：無涘 ｜ 记录：AI。沿已逐页核对的 Senko's Activity Log 入口继续补全樱井视频，新增 Sound 14、Programming 9、PR/Marketing 9 条资源；资源侧累计 203 条二手专题旁证。对应专题页为 [Sound](https://en.senkohome.com/sakurai-game-dev-sound/)、[Programming](https://en.senkohome.com/sakurai-game-dev-programming/) 和 [PR](https://en.senkohome.com/sakurai-game-dev-pr/)。
- 证据边界：AI。每条记录写入 150–205 字中文摘要、合法能力/资源主题映射和明确的“二手专题摘要（非视频正文）”来源标记；保留 13 个专题 URL，不把文章重组冒充官方字幕、完整转录或直接视频分析。Chat 31 条本轮未写入，因为一条候选摘要未通过既定长度门槛，避免把未验证批次混入资源库。
- 对账：AI。只读模拟显示 203 条旁证中 53 条已经对应官方 `description/audio` 完成，150 条可作为新增 `external_article / secondary_summary`；其余 30 个目标 ID在完成旁证对账后建立 `evidence_pending`。预计 state 为 2,230 completed、51 retryable、30 evidence_pending；这只是 apply 前投影，正式 state 未改写。
- 验证：AI。资源 JSON、`git diff --check`、回填合同 31/31、runtime 维护测试 4/4、Astro check 0/0/0、Vitest 204/204、静态构建 151 页全部通过。正常终端仍需显式执行 `repair_video_runtime.py --apply --kickstart`，再核对 report；当前沙盒没有写仓库外缓存。

原始对话：dialogues/2026-0823.md「0408 Sound、Programming、PR 旁证扩展与最终 state 投影」

## 2026-08-23：一手摘要保护复核（04:13）

- 对抗性复核：AI。发现二手旁证与官方 state 的 53 条重合中，有 39 条资源原本已有有效一手摘要；runtime 虽然不会覆盖 state，但资源侧摘要也不能被低等级证据替换。已恢复这 39 条原摘要，只保留二手专题 URL 作为补充证据；14 条原本只是占位摘要，保留新的二手摘要。
- 结果：AI。203 条旁证总数、150 条可新增、30 条 `evidence_pending` 的 state 投影不变。摘要长度仍为 150–205 字，JSON、回填 31/31、runtime 4/4、Astro 0/0/0、Vitest 204/204、151 页构建再次通过。

原始对话：dialogues/2026-0823.md「0413 一手摘要保护复核」

## 2026-08-23：Chat 专题补全与最终 state 投影（04:18）

- 决策：無涘 ｜ 记录：AI。继续逐页核对 [Chat](https://en.senkohome.com/sakurai-game-dev-chat/) 专题的 31 个条目，资源侧累计 234 条二手专题旁证；此前 Sound 14、Programming 9、PR/Marketing 9 及前序专题均保留逐条 URL 和来源标签。
- 证据边界：AI。Chat 31 条均写入 150–205 字中文摘要、合法能力/资源主题映射和“二手专题摘要（非视频正文）”标记。对与官方完成 state 重合的资源，39 条已有有效一手摘要已恢复；二手内容只作为补充，不降低一手证据等级。
- 对账：AI。只读模拟发现 234 条旁证中 62 条已有 state 完成记录、172 条可新增；剩余 8 个目标 ID在 apply 后初始化为 `evidence_pending`。预计 state 为 2,252 completed、51 retryable、8 evidence_pending；正式 state 未改写。
- 验证：AI。摘要合同、JSON、`git diff --check`、回填 31/31、runtime 4/4、Astro 0/0/0、Vitest 204/204、静态构建 151 页全部通过。正常终端仍需显式执行 `repair_video_runtime.py --apply --kickstart` 并核对 report。

原始对话：dialogues/2026-0823.md「0418 Chat 专题补全与最终 state 投影」

## 2026-08-23：官方描述回退与 2,311 条目标最终投影（04:47）

- 决策：無涘 ｜ 记录：AI。继续把可获得内容写回成长资源；证据层分为官方公开视频描述、已核对的二手文章摘要和未取得正文的 retryable，不把任何一层冒充完整字幕。
- 产出：AI。资源侧累计 291 条固定证据标记：237 条 Senko 二手专题摘要、Polygon 1 条、Nintendo Wire 1 条、YouTube Data API v3 官方公开描述 52 条。49 条原先因字幕/模型通道失败的条目已依据官方描述补齐 150–250 字中文摘要、能力映射和资源主题。
- 边界：AI。2 条不补写教学内容：GMTK 的 `Get Mind Over Magnet on Steam!` 只有商店宣传描述；GDC 的 Iwata Tribute 只有致谢/片尾信息，且音频通道仍有工具链重试。它们继续保留可辨认的 retryable 状态。
- 映射边界：AI。2,311 条目标均有一个合法主要资源主题，1,676 条至少有一个 capability，635 条保持空 capability。按既有决策，公告、汇编或公开描述不能直接支持某项能力时宁可留空，不用标题模板凑满；这部分是后续人工语义审计队列，不是假装完成的映射。
- 对账：AI。对当前外部 state 的只读内存投影为 2,309 `completed`、2 `retryable`、0 `unclassified`、0 `evidence_pending`；`repair_video_runtime.py` 将新增/替换 229 条记录、保留已有 62 条完成记录。该数字是 apply 前投影，外部正式 state 仍为 2,080 completed、51 retryable。
- 修复：AI。runtime 合同现在只接受固定 provider/label、合法 URL、唯一主要主题和 150–250 字摘要；保留已有 completed，允许审核过的证据替换 retryable，并保留摘要哈希与证据类型。新增官方描述合同测试，runtime 测试 5/5。
- 验证：AI。Python 回填/runtime 测试 36/36、JSON、secret scan、`git diff --check` 全部通过；`npm run build` 通过 Astro check 0/0/0、Vitest 204/204、静态构建 151 页。
- 阻塞：AI。当前沙盒与 Computer Use 安全策略不允许直接写仓库外 `~/.cache/lag-video-content/`，因此未执行外部 `--apply --kickstart`，也未启动后台涓流任务。用户需在正常终端执行该命令并核对 report；仓库保持 Private。

原始对话：dialogues/2026-0823.md「0447 官方描述回退、内容对账与外部回写边界」

## 2026-08-23：2,311 条目标正式回写与最终闭环（11:49）

- 决策：無涘 ｜ 记录：AI。完成现有 2,311 条 YouTube Work Item 的可追溯内容补全；可获得内容写回资源，输入不可追溯时保留明确状态，不用空值伪装成功。
- 正式回写：AI。`repair_video_runtime.py --apply --kickstart` 已成功执行，launchd 返回码 0；随后 1 条 Iwata 音频和 1 条 GMTK 音频/宣传片重试均完成。外部 state 现为 2,311 `completed`、0 `retryable`、0 `unclassified`、0 `evidence_pending`。
- 内容对账：AI。2,311 个 state ID 与资源 ID 完全相等；每条都有非空中文摘要、唯一资源主题，摘要长度与 state 元数据一致。官方元数据 2,311/2,311 映射，无来源、URL、标题或公开字段错配。
- 证据边界：AI。资源侧保留 291 条固定证据标记：Senko 237、Polygon 1、Nintendo Wire 1、YouTube Data API v3 官方描述 52；文章/描述仍明确标为非视频正文。两个音频条目只写入音频分析结果，没有伪装成字幕。
- 映射边界：AI。1,677 条目标有 capability，634 条保持空 capability；没有足够证据的公告、汇编或行业条目继续留空。23 条旧 state 的 `summaryLength` 已通过显式对账命令修正，未改摘要正文。
- 验证：AI。Python 45/45、JSON、secret scan、`git diff --check`、Astro check 0/0/0、Vitest 204/204、静态构建 151 页通过。仓库保持 Private，未 push、未部署。

原始对话：dialogues/2026-0823.md「1149 2,311 条目标正式回写与最终闭环」

## 2026-08-23：NotebookLM 内容转化与公开/PKM 双层产出

- 决策：無涘 ｜ 记录：AI。选定普通 NotebookLM / Gemini Notebook 作为视频内容转化主力；现有网站目录 `summary` 保持短摘要语义，完整文字版总结改为独立产物，不覆盖已有数据。
- 决策：無涘 ｜ 记录：AI。内容总结采用“按信息密度详略得当”的软篇幅规则。1800–2500 字是普通样本的目标区间，不是最低字数，也不是硬截断；内容不足就短，论证密集就长，必须以来源边界正常收束。
- 决策：無涘 ｜ 记录：AI。产出拆成 Learn About Games 公开层和 PKM/Daily Check-in 层：前者展示标题、来源、短版概览和审核后的产物入口；后者保存完整总结、引用/证据边界、信息图、思维导图、演示文稿及状态。Daily Check-in 每日抽取精选资源并引用 PKM 原文，避免重复复制长文。
- 事实：AI。普通 NotebookLM 对公开 YouTube 只导入带字幕的视频转写，已完成一次约 3,791 字符中文内容详述验证；此前 YouTube→Obsidian 路线已验证 `youtube-transcript-api` 的干净字幕、按视频 ID 归档、引用锚点以及推送即时写入/回复追加的 PKM 机制。
- 事实：AI。Google 官方当前 Notebook 配额：Standard 100 notebooks/user、50 sources/notebook、50 chats/day、3 audio/day、3 video/day；Plus 200、100、200、6、6；Pro 500、300、500、20、20。AI Plus 足够每日精选与小批量研究，但不适合作为 2,311 条资源全部生成文字、信息图、思维导图和演示文稿的无人工批处理方案。
- 边界：AI。普通 NotebookLM 是网页入口，不等于公开批量 API；Enterprise/API 需另行核对许可、项目和费用。任何订阅、API 或大量模型调用必须先获得無涘确认。本轮仅调研与留痕，没有新增模型调用、付费操作或资源写回。

原始对话：dialogues/2026-0823.md「1604 NotebookLM 内容转化与公开/PKM 双层产出」

## 2026-08-23：NotebookLM 单条 Daily Check-in 线路落地（21:10）

- 决策：無涘 ｜ 记录：AI。完整文字版内容详述不再和 Learn About Games 的目录短摘要混用；站内 Work Item 的既有 AI 摘要隐藏但不删除，长文只进入 PKM/Daily Check-in 层。
- 实现：AI。`AI-Life-Mentor` 增加 reviewed JSON inbox、固定模板（标题、来源、信息图、思维导图、演示文稿、内容总结、来源边界）、消费 marker、幂等 PKM 资源笔记和 Daily Check-in 追加；没有待处理资源时正常跳过，通道错误显式失败。
- 单条验证：AI。Celeste 视频 `4RlpMhBKNr0` 通过 NotebookLM/Gemini Notebook 得到 4,407 字符中文文字版总结；NotebookLM Studio 当前 `location=unsupported`，未生成的多模态产物在 fixture 中如实保留 `not-generated` 状态。
- 回写：AI。`AI-Life-Mentor#182` 已追加 NotebookLM 资源，PKM `PlayWithExperiences/AI/Learn-About-Games/2026-0823-2051-designing-celeste.md` 已写入并回读。未恢复 Public、未启用 Pages、未部署；本轮没有 OpenRouter 批量调用或付费操作。
- 验证：AI。Learn About Games build 为 Astro 0/0/0、Vitest 204/204、151 pages；摘要隐藏定向 E2E 通过。全量 E2E 251 passed / 22 skipped / 13 failed，失败集中于既有/并发稳定性与旧质量词断言。

原始对话：dialogues/2026-0823.md「2110 NotebookLM 单条 Daily Check-in 线路落地」

## 2026-08-23：NotebookLM Studio 信息图单条复测（21:49）

- 决策：無涘 ｜ 记录：AI。此前 `location=unsupported` 已不再出现；按单条最小验证原则，只重新生成一项 Celeste 信息图，不批量、不重试、不写回。
- 结果：AI。NotebookLM Studio 成功生成并打开一张中文简体、横向、手绘笔记、详细 Beta 信息图。卡片标题为“登山游戏关卡设计方法”，预览标题为“《蔚蓝》（Celeste）关卡设计方法论：以“故事”为锚点”。
- 证据：AI。页面出现新的产物卡片和“信息图已准备就绪”提示，预览实际显示中文图像内容；这次不是仅返回任务编号。旧 fixture 的 `not-generated` 状态继续保留，因为本次试看片尚未写入正式资源记录。
- 边界：AI。本轮没有下载或写回 PKM/网站，也没有重新生成思维导图和演示文稿；后续若正式纳入资源，需另行核验导出资产与托管策略。

原始对话：dialogues/2026-0823.md「2149 NotebookLM 信息图单条复测」

## 2026-08-23：外部旁证用户语义修正（22:28）

- 决策：無涘 ｜ 记录：AI。资源页和 Source 详情页不再把第三方来源旁证称为“外部事实”或“外部公开观察”；统一使用“外部旁证”，明确它不等同于原始内容，也不构成评分、排序或推荐。
- 实现：AI。新增共享 `externalObservationCopy`，统一目录说明、折叠入口、旁证标题和 Source 详情说明；保留内部 `externalSignals` 字段、原始数据、第三方 URL、观察日期和证据标签，不做数据迁移。
- 验证：AI。先以单测和浏览器回归确认旧文案红测；修正后 Vitest 205/205、Astro check 0/0/0、静态构建 151 页、Resources E2E 桌面/移动 44/44 通过。全仓活跃源码与文档不再残留旧用户可见命名。
- 测试边界：AI。Resources E2E 还暴露一个既有质量词断言的假阳性：它扫描整页隐藏资源正文，误把普通内容中的“精选/已审核”当作站内标签；已改为只检查 Work Item 的站内结构面，不改变产品数据。

原始对话：dialogues/2026-0823.md「2228 外部旁证文案统一与资源页回归」

## 2026-08-23：官方描述旁证改为具体对象与原文摘录（22:45）

- 决策：無涘 ｜ 记录：AI。用户可见的旁证不能把取证 API 当作来源，也不能用统一免责声明代替证据内容；必须说明旁证具体指向什么对象。
- 实现：AI。52 条官方描述旁证统一改为 `YouTube` 来源，旁证对象标为“视频简介首段（原文摘录，非字幕正文）”，并写入各视频简介首段实际文字；内部回写合同同步更新，URL 和观察日期保留。
- 验证：AI。数据契约、资源显示单测 31/31，Python 回写测试 7/7；Larian 条目 Chromium 回归通过，页面显示 “No plan survives development.” 且不再显示 `YouTube Data API v3`。最终 `npm run build` 为 Astro 0/0/0、Vitest 206/206、静态构建 151 页；Resources E2E 桌面/移动 46/46。
- 边界：AI。原文摘录来自本机已缓存的官方 YouTube 元数据，没有新增 API、搜索或模型调用；没有把视频简介冒充字幕或视频正文。

原始对话：dialogues/2026-0823.md「2245 官方描述旁证对象修正」

## 2026-08-23：NotebookLM 产物模板、完整思维导图与 PDF 托管修复（22:56）

- 决策：無涘 ｜ 记录：AI。PKM 与 Daily Check-in 的来源、信息图、思维导图、演示文稿、内容总结和来源边界统一用 H3 无冒号；PNG 使用 `![...](...)`；PPTX 和 PDF 均保留普通链接，不把 Slides 转成图片。
- 事实：AI。Celeste 思维导图在 NotebookLM 查看器中全部展开后重新下载，实际包含三级结构；PPTX 通过本机 LibreOffice 免费转换为 12 页 PDF，并完成首张页面渲染检查。
- 托管：AI。PicGo 使用当前时间戳 `20260823224813` 加语义文件名上传四份文件；四个地址均为 HTTP 200，上传后 `autoRename` 恢复为 `true`。旧地址不删除，只由新地址替代。
- 写回：AI。资源 JSON、PKM `2026-0823-2051-designing-celeste.md` 与 Daily Check-in #182 已统一到新地址；AI-Life-Mentor 渲染器和单测同步支持 H3、图片链接与 `pdf_url`。
- 边界：AI。本轮只有一次新增 NotebookLM 思维导图生成，无重试、无 OpenRouter 批量调用、无订阅或其他现实金额操作；Learn About Games 仍保持 Private，未部署、未推送。

原始对话：dialogues/2026-0823.md「2256 NotebookLM 产物模板与托管修复」
