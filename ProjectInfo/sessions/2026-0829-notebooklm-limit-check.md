# notebooklm-limit-check

> 按主题一份，追加不覆盖；同一场会话的节就地更新。

## 1144 核对 NotebookLM 更新限额并尝试单条收集

决策：無涘 ｜ 记录：codex（自动）｜ session 01a04b91-f7e5-7a50-a598-cf704b643bec

用户注意到 NotebookLM 可能更新了限额，要求查阅官方说明并尝试今日资源收集。AI 先通过 `agent-reach` 检索 Google 官方支持文档核对各资产类型数字、重置方式及信息图/幻灯片配额变化，确认未直接发现明确的配额阻断说明。预检显示目录有 2,454 个未留痕候选，当前已 claim 1 次、剩余 9 次。浏览器就绪检查通过，登录账号为 Google One PLUS，NotebookLM（现已改名 Gemini Notebook）工作台可编辑，来源面板正常。按最小探针策略仅导入第 1 条来源 `youtube-2qrzI8YCVgI`（LEGO Horizon Adventures 边际收益设计），来源导入成功，工作台显示 17/100 来源，无配额阻断。中文总结已生成（7,026 字符），信息图参数设为中文简体、横向、手绘笔记、详细 Beta，也已成功生成。下载环节出现异常：浏览器桥 30 秒内未产生可验证下载文件，改用页面资产清单做本地打包核验。整体产出：完成了官方限额核对、单次完整收集流程（导入→总结→信息图生成），但未确认最终下载结果，待后续核验。

原始对话：dialogues/2026-0829.md「1144 notebooklm-limit-check」

## 1201 官方限额结论与本轮收口

决策：無涘 ｜ 记录：codex（自动）｜ session 01a04b91-f7e5-7a50-a598-cf704b643bec

官方核对结果：当前 Google 官方页面已把 NotebookLM 更名为 Gemini Notebook。Plus 公开表仍列 200 notebooks/user、100 sources/notebook、200 chats/day、6 audio/day、6 video/day、20 reports/day、20 flashcards/day、20 quizzes/day、20 mind maps/day 和 3 次 Deep Research/day；信息图与 Slide Deck 仍只写 `More limits`，没有公开固定数值。官方思维导图帮助页单独列出 Plus 20/day；官方说明 daily quotas 在 24 小时后重置、monthly quotas 在 30 天后重置，并提示限额可能变化。因此，公开官方资料没有证明本次发生了新的 Plus 数字变更；信息图等功能的账号实际剩余量仍以工作台提示为准。

本轮先完成只读预检：2026-08-29 11:33:27 +0800，目录共有 2,454 个候选，开始时 `claimed_today=1`、`remaining_today=9`。按已收窄的单条范围、并发 1、自动重试 0，精确 claim `youtube-2qrzI8YCVgI`，`generation_run_id=run-20260829113535-74127`。来源导入成功并隔离为唯一来源，Notebook 显示 17/100 来源；中文总结生成 7,026 字符。信息图已生成，当前页面资产导出为 PNG，文件头、字节数和 2752×1536 尺寸均核验通过。思维导图已生成，viewer 中执行了 `Expand all nodes（全部展开）`；嵌入式树实测 43 个节点、层级 1–4、所有有子节点者 `aria-expanded=true`，可见折叠节点 0；完整 SVG 共 49,593 字符并通过 XML 校验。

两项成品的可见下载控件都按合同先监听真实 download event，再点击；30 秒内均没有产生可验证本地文件。信息图改走当前 viewer 的 `pageAssets` bundle，成功得到约 6.7 MB 的 PNG。思维导图改保留 viewer 实际展开后的完整 SVG；一次读取 SVG 画布几何时浏览器内核重置，之后 Chrome 标签列表仍可读，但原 NotebookLM 标签控制权无法重新取得。Chrome 运行检查、扩展启用检查和 native host 检查均通过；按插件规则，恢复控制权需要用户明确许可打开该 Chrome 用户配置的新窗口。

由于无法继续提交演示文稿生成请求，本条已于 2026-08-29 11:59:40 +0800 由 `notebooklm_producer.py fail` 收口为 `browser_control / slide_deck`。没有把未生成的 Slides、未上传的资产或未发布的 JSON 写成成功；没有 PicGo、远端推送、PKM 或 Daily Check-in 操作。收口后最终账：`preflight_status=ready_to_claim`；`attempted=[youtube-2qrzI8YCVgI]`；`ready=[]`；`failed=[youtube-2qrzI8YCVgI]`；固定清单剩余 8 条未领取；`remaining_today=8`；停止原因是浏览器控制权恢复阻塞，不是今天新的 NotebookLM 配额明文阻断。

官方资料：[Gemini Notebook 使用限额](https://support.google.com/geminotebook/answer/16213268?hl=en)、[Mind Maps 帮助页](https://support.google.com/geminotebook/answer/16212283?hl=en)、[NotebookLM 更名为 Gemini Notebook 的官方公告](https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/)。

原始对话：dialogues/2026-0829.md「1144 notebooklm-limit-check」
