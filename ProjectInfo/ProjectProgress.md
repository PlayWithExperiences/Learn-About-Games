# ProjectProgress

更新于 2026-09-10 14:45:21 +0800 · 记录者 Codex

## 当前主工作段：EGDS v0.3 与公开分享

已完成 EGDS v0.3 同步及公开发布。仓库 PUBLIC，Pages workflow 活跃；运行 [34445710700](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/34445710700) 成功部署 runtime `66a5e8c`。线上首页、EGDS、地图、资源页 HTTP 200；四层定义、5437 条资源和 68 条 Playtest 筛选正确，320px 无横向溢出、无脚本异常。网站：https://playwithexperiences.github.io/Learn-About-Games/

云端构建完成 152 页、206 单元测试通过；Chromium 141 passed / 4 skipped。旧测试的四层断言与大目录查询已修正。后续提交只记录发布回执和文档，使用 skip-ci 避免再次部署；已验证网站 runtime 仍为 `66a5e8c`。

下一步：依据真实分享反馈继续完善。既有 Dependabot 告警待单独升级；本站为静态部署，无服务端图片处理接口，不把这个边界当成依赖已修复。

资源保持 5437 Work Items / 5590 Access Versions / 44 Sources / 16 Topics；地图 28 方法节点 / 42 能力 / 12 议题 / 64 关系；Atlas 84 节点 / 86 关系 / 76 Evidence。完整发布回执见 sessions/2026-0910-egds-v03-release.md。

## 资源生产工作段（保留原状态，独立于发布）

更新于 2026-09-10 13:10:00 +0800 · 记录者 muse-spark

## 当前状态

- 产品维持 Private refinement；本轮未改运行时代码、未推送或部署 Learn-About-Games。
- 9-04 stale（`youtube-1hdXDgCh8rw / run-20260904044845-6015`）已收口为 `failed @ mind-map-expansion`（9-10 13:09 落盘，ledger 已验：全库 ready33 / failed26 / generating0，并发位释放）。通过项：单源隔离（52 源仅勾 #18）、中文总结＋边界已提取、信息图 PASS（2752×1536，未上传）；思维导图卡已生成但新版 viewer 无"全部展开"入口致硬门槛不过。演示文稿未建，PicGo/交付未动，无配额阻断，图片铁律遵守。
- 系统性预警：新版思维导图 viewer（跨域 iframe canvas-app）无"全部展开"，凡需新建思维导图的生产都会撞墙；等用户定夺（特批钻取证据 / 等 viewer 恢复 / 换证明方式）后再动失败重跑队列。
- 今早 07:32 Codex 自动化 preflight 为 ready_to_claim（2454 候选选 10 条，首条 youtube-t7VkrExQwSo，claimed0/remaining10），当时 stale 仍为 generating；该快照已被本次收口取代，并发位现已释放。
- 用户已确认：失败的继续、没做完的继续；首条收口 9-04；笔记本复用＋选择器隔离；批次边界（剩余配额内、并发 1、重试 0）与图片铁律（单次 read 1 张）。

## 下一步

- 用户定夺 viewer 范式问题后，再执行失败重跑队列（配额类→导出类→其他，`1wyToyTk3D0` 无法导入放最后）。
- 不自动重试历史候选或批量补交；不写 PKM、Issue 或触发 Daily Check-in。
- 证据：/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-10T130858+0800-merge-closeout/report.json；ProjectInfo/sessions/2026-0909-notebooklm-preflight-2037.md；今早 preflight：runs/2026-09-10T073213+0800/report.json。
