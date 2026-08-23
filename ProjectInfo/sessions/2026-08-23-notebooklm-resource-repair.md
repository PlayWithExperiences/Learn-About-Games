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
