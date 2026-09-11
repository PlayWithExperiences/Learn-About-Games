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
