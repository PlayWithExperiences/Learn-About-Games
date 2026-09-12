# Innovation Map：从散列节点到历史总览

## 0208 重做与本地交付

更新于 2026-09-12 · 记录者 Codex
决策：無涘（重做历史发展表达、自主选择方法）｜记录：Codex（具体布局与实现选择）。
session 01a091a6-dbd8-7072-a821-27697dd08274
trace-user-count: 1

用户希望游戏史中的创新能体现不同品类、作品的连续发展与变化，不满意旧版残缺和缺乏整体性。没有新增批量外部调用或付费调用授权。

### 实际变化

- `/atlas/` 使用 `InnovationHistory.astro`：九个阅读区域 × 年代列；作品、创新观察、类别形成同时可读。列内按实际年份排序，间距不是时长，阅读区域不是排他品类。
- 三条比较问题入口（单局失败、空间结构、自定目标与在线世界）复用现有对象与关系；选择对象画出邻接边并打开上下文面板，关系两端可继续点击。搜索、区域选择和比较强调保留对象位置。对象深链、浏览器返回、关闭/键盘 Escape 与当前对象语义均有验证。
- 原精确年份网络保留于 `/atlas/network/`，消费同一 catalog，保留缩放、地图模式、三视角、Family 与文献索引。旧对象 hash 在新入口打开同一对象；旧关系和 Evidence hash 转入精确网络。无脚本使用原生年代目录、关系与来源。
- 新增 12 对象：M.U.L.E.、Tetris、John Madden Football、Myst、Grand Theft Auto、EverQuest、The Sims、EVE Online、World of Warcraft、Nintendo Wii、Portal、Minecraft。总量 96 对象 / 86 关系 / 78 Evidence。没有新增影响边。Minecraft 2009 特别注明早期公开版本。
- CHM `https://www.computerhistory.org/timeline/graphics-games/` 与 The Strong `https://www.museumofplay.org/video-game-history-timeline/` 的对应条目在本轮读取。The Strong 只采用本次取得的 1980s 三个条目，不推用其其他混合地区日期。既有 Evidence 核查日期未改；未重新访问全部既有文献。
- 真实视觉检查发现常驻侧栏挤掉近期年代，改成默认全宽图与选中时浮动详情；手机详情遮挡选中节点，调整为即时定位地图并限制面板高度。原网络新增作品超出固定场景高度，修复为按当前视角实际内容计算声明高度。

### 验证与回执

- 首轮 `npm run check` 发现新组件模板的嵌套闭包推导问题，已改为共享 helper 并修复。此后类型检查 0 errors / warnings / hints。
- 单元测试 209/209；静态站 154 页构建通过。新增三项数据/关系合同测试。
- 新版首轮桌面/手机 14/14；原网络 39 passed / 20 skipped / 3 failed，三项失败都是扩充后的旧数量断言，更新后定向 17 passed / 1 skipped（含新版回归）。旧高度检查改为检验声明画布确实包含当前视角对象。
- 最终全站 Chromium：149 passed / 4 skipped / 1 failed（5.9m）；唯一失败是 README 仍写旧 84/76 数量。修复 README 实际内容后定向复验 1/1 通过，没有更改该测试来规避失败。未重复运行已通过的无关全站检查。
- 2026-09-12 02:34:20 +0800 末轮：类型检查 0/0/0、154 页 fresh build、新版桌面/手机 18/18 通过，含旧关系深链、键盘 Escape/焦点返回、320px 两种主题及“节点下边界不超过面板上边界”的实际遮挡断言。CUA 复看桌面与 320px 稳态截图；修复前遮挡实际可见，修复后 Dead Cells 在面板上方。
- 日志：`/tmp/lag-full-e2e.log`（含原始失败）、`/tmp/lag-last-readme.log`（修复复验）、`/tmp/lag-last-history.log`、`/tmp/lag-last-check.log`、`/tmp/lag-last-build.log`。E2E 截图为 test-results 中临时产物，后续运行会替换；CUA 图像保留于本场原始工具回合。

### 边界与接力

本地预览 `http://127.0.0.1:4321/Learn-About-Games/atlas/`。本轮未推送或部署；开始时 main 比 origin/main 多 15 个其他任务提交，且其他任务还有未提交变更（NotebookLM 自动化与旧会话记录）。本轮仅按明确文件范围提交自己的代码、测试和记录，不把其他历史随任务发布。以后若发布，应隔离本轮提交或经协调整合，不能强推或改写其他任务历史。

这仍是选择性历史，不是完整游戏史。格斗、竞速、节奏、移动、中国游戏史与 2020s 明显缺失；新模拟与在线世界锚点尚无专门影响边。后续以具体专题和可核查来源补充，不为了图连通而编造影响，不新增站内质量等级或强制学习顺序。

原始对话：dialogues/2026-0912.md「0208 （未分类）」；已存在自动采集原文，不重复抄写用户回合。

## 1200 整理并发布

决策：無涘｜记录：Codex，2026-09-12 12:01:19 +0800。session 01a091a6-dbd8-7072-a821-27697dd08274
trace-user-count: 2

用户原文：“这个项目感觉也可以整理整理上线”。当前 main 比 origin/main 多 17 提交；除上一轮已验收的 runtime 外，为项目记录与一个非网站运行路径的 OOPIF 诊断工具。完成待推送差异、工具语法及有限凭据模式检查；不含本地未提交自动化改动。复用上一轮本地验证，准备推送并等待云端 gate。

原始对话：dialogues/2026-0912.md（本场自动采集原文，session 同上）。

## 发布 gate 修复：2026-09-12 12:16:29 +0800

决策：無涘（发布目标）｜记录：Codex。首次 run 34671900746 未部署：云端构建通过，Chromium 149 passed / 4 skipped / 1 failed，精确网络文献返回位置相差 23px。保持原 <=4px 断言不变。

本地临时探针同时记录点击前、真实激活时、返回后及后续5帧位置；正常滚动中复现2px稳定偏移，reduced-motion对照3/3稳定。将文献跳转、页面与画布位置恢复改为显式 instant，避免全局 smooth 滚动干扰。修复后同一探针3/3各帧完全一致；原失败用例与全屏文献返回2/2通过，类型检查0/0/0、构建通过。探针归档 /tmp/lag-scroll-probe.spec.ts，证据日志 /tmp/lag-scroll-frames.log、lag-scroll-reduced.log、lag-scroll-fixed.log、lag-scroll-regression.log；没有通过扩大误差或仅重跑云端隐藏失败。下一次发布由同一 workflow 全量验证。

原始对话：dialogues/2026-0912.md，本 session 后续发布回合。

## 2026-09-12 12:30:16 +0800 发布完成

决策：無涘｜记录：Codex。session 01a091a6-dbd8-7072-a821-27697dd08274
trace-user-count: 2

- 成功 [run 34672575872](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/34672575872)：runtime `1daa942f59f7490b1736ea5cb3579476bf3d92d6`，云端209单测、150 Chromium通过（4条件跳过），154页；build与deploy均成功。首次失败run34671900746未上传或部署，保留原始失败语义。
- 线上常规URL读取：home / atlas / atlas/network / resources均200；两种Atlas各96对象，新总览9阅读区与Minecraft，浏览器脚本200，资源5437项。结构化回执在 `../evidence/2026-0912-innovation-publication.json`。
- CUA实际交互：Hades搜索1匹配；打开Hades显示2条相邻关系与来源，点击Spelunky进入对应详情。320px视口实际可见Dead Cells及面板；注意该桌面浏览器模拟中classic scrollbar占15px，clientWidth305 / scrollWidth320，不能据此报告live的严格clientWidth相等；真正移动设备断点合同沿用已通过的Playwright检查。
- 未提交自动化和其他旧记录未暂存。最终回执使用skip-ci推送，不再改变网站产物；当前网站runtime保持上述SHA。未进行新的大批外部采集或付费API调用。

原始对话：dialogues/2026-0912.md，本session“这个项目感觉也可以整理整理上线”回合。

## 2026-09-12 12:33:02 +0800 未提交工作与覆盖范围澄清

用户询问未提交自动化与剩余覆盖缺口。决策：無涘（要求解释）｜记录：Codex。session 01a091a6-dbd8-7072-a821-27697dd08274
trace-user-count: 3

当前差异实查：自动化代码为 automation/browser/cdp.cjs 的坐标点击、下载目录设置与输入尝试；typexy分支未被外层命令条件纳入，静态上不可达，未运行或修复。其他未提交项为既有对话/会话记录及tmp生产导出物；不是漏部署的网页功能。

当前catalog实查：96对象中61游戏、25创新观察、2类别、8其他对象；2020及之后仅Hades与其跨单局叙事观察，2021之后无节点；19对象未收录相连关系，其中包括本轮新增12锚点。关系元数据为38 confirmed、48 credible，此为目录标注，不冒充本轮逐一复核。核心不足是类型/地区/近年分布与影响关系证据；浏览结构重做已交付，整体游戏创新史内容仍不充分。

原始对话：dialogues/2026-0912.md，本session“未提交的自动化工作是啥 / 覆盖缺口还有哪些”回合。
