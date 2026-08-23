# NotebookLM 产物模板与托管修复

更新于 2026-08-23 22:56 · 记录者 AI

## 2256 NotebookLM 产物模板与托管修复

- 决策：無涘 ｜ 记录：AI。资源产物区块使用 H3 无冒号；信息图和完整思维导图使用 Markdown 图片语法；演示文稿同时保留 PPTX 和 PDF 普通链接，不把 Slides 转成图片。此修复只作用于 PKM/Daily Check-in 层，不恢复 Learn About Games 的公开发布。
- 生成：AI。按用户确认的单条最小范围，在同一 Celeste NotebookLM 中只新增一次完整展开思维导图生成，没有重试。生成结果在查看器中执行“全部展开”，下载 PNG 为 4134×13238，视觉检查确认根节点、主题、子主题和案例/边界节点均已展开。
- 转换：AI。使用本机 LibreOffice `soffice` 将已有 12 页 PPTX 转为 12 页 PDF；`pdfinfo` 校验通过，首张页面渲染检查正常。
- 托管：AI。PicGo 暂时关闭自动改名，使用当前时间戳 `20260823224813` 加语义文件名上传信息图、完整思维导图、PPTX、PDF；四个 Raw 地址 HEAD 200。上传完成后已恢复 PicGo `autoRename: true`。旧文件未删除。
- 写回：AI。更新 `AI-Life-Mentor` 资源 JSON、PKM 资源笔记与 Daily Check-in #182；回读确认 H3、图片语法、新思维导图地址、PPTX/PDF 地址和唯一 marker。
- 验证：AI。`scripts/test_notebooklm_line.py` 8/8；JSON 解析通过；PicGo 心跳正常；新四个远程文件 HEAD 200；Mindmap/PDF 本地文件格式核验通过。没有新增 OpenRouter 批量调用、没有付费操作。

原始对话：dialogues/2026-0823.md「2256 NotebookLM 产物模板与托管修复」

## 0311 合并、真实闭环与每日调度

- 决策：無涘 ｜ 记录：AI。将 `codex/notebooklm-daily` 分支合并回两个仓库各自的 `main`；Learn-About-Games 保持私有且不自动推送，AI-Life-Mentor 的消费端提交推送到远端。
- 产出：AI。对唯一候选 `youtube-hTNA84vJNEc` 完成一次 NotebookLM 生产，得到文字版内容总结、横向详细信息图、完整展开思维导图、PPTX 与本地转换 PDF；四项资产经 PicGo 上传、HTTP 200 与 SHA-256 回读校验。
- 写回：AI。ready JSON 已提交到 AI-Life-Mentor；PKM 文件 `2026-0824-0258-design-fundamentals.md` 与补充 Daily Check-in #183 已回读确认，修复后的边界段落只有一处，未重新调用模型。
- 自动化：AI。Codex 本机 cron 已启用，每天 07:30（北京时间）一次一条、无重试；它只负责 NotebookLM → PicGo → ready JSON → 安全推送，08:30 的 GitHub Actions 再消费到 Daily Check-in/PKM。launchd 模板保持未安装，避免重复调度。
- 验证：AI。producer 15/15、preflight 3/3、publish 2/2、AI 消费端 14/14 通过；没有 OpenRouter、付费 API 或手动触发完整 Daily Check-in。

原始对话：dialogues/2026-0824.md「0235 续」
