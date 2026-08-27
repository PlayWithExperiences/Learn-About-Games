# collect-resources-skill

> 按主题一份，追加不覆盖；同一场会话的节就地更新。

## 1034 将收集流程封装为跨AI可用skill

决策：無涘 ｜ 记录：codex（自动）｜ session 01a03195-9a08-7001-b1c4-c722da0d65ed

本场会话解决了三个问题：一是Daily Check-in的根因——队列已排空时被错误标记为失败，现已修复为空队列正常no-op；二是将每日NotebookLM生产上限从1改为10，符合Plus配额使用策略；三是将收集流程抽离为可跨AI复用的skill。最终产出了一个共享skill `Collect-Resources-About-Game`，位于项目 `.agents/skills/` 目录下，通过符号链接暴露给Codex/Claude/Gemini三个客户端入口，避免了各AI各自维护一份流程导致的漂移问题。验证结果：producer测试20/20、consumer测试18/18通过，skill元数据、YAML合同、路径扫描均校验通过。当前NotebookLM信息图配额已达上限，采集被阻断，已记录为quota_block状态，不继续消耗额度。

原始对话：dialogues/2026-0827.md「1034 collect-resources-skill」

## 1320 收集端跨 AI skill 收尾

决策：無涘 ｜ 记录：AI（在场模型）｜ session 01a03195-9a08-7001-b1c4-c722da0d65ed

- 独立前向 dry-run 已完成：在没有可核实的浏览器/NotebookLM 上传适配器时，执行体返回 `unknown` 并在 claim 前停止，未新建 Notebook、未生成 ready，也没有把能力缺失误报成 `no_candidate`。这验证了 Director 要求的失败可辨认和禁止假成功。
- 最终唯一真源是项目级 `.agents/skills/collect-resources-about-game/`，不是客户端私有 skill 目录；它包含跨 AI 的 `SKILL.md`、`agents/openai.yaml` 可选界面元数据和 `references/resource-contract.md`。规范 slug 使用小写是 Agent Skills 合同要求，`metadata.invocation` 保留 `/Collect-Resources-About-Game` 展示名。
- 原 `tools/notebooklm-daily-resource` 已降为只读兼容别名，避免旧调用断裂；Codex 07:30 自动化已改为读取共享入口。本机 `.agents`、`.claude`、`.codex` 三个发现入口均指向同一文件，未复制第二份业务规则。
- 事实更正：早期草稿曾把目标目录写成 `tools/Collect-Resources-About-Game`，并把本机入口概括为包含 Gemini；最终实际落地和验证的是上述项目级 `.agents/skills` 目录及三个已存在的 `.agents`/`.claude`/`.codex` 入口，以当前文件树为准。
- 门禁结果：NotebookLM 相关测试 20/20；Ruby YAML 解析、Agent Skills 定向合同检查、秘密/绝对路径扫描和入口目标检查通过。`skills-ref`/PyYAML 未安装，官方 validator 不能直接运行，未把替代检查写成官方 validator 已通过。
- 边界：本轮未触发 NotebookLM、搜索、上传、付费 API 或远端发布；只改变共享 skill 入口、兼容别名、自动化提示和项目留痕。

原始对话：dialogues/2026-0827.md「1320 收集端跨 AI skill 收尾」
