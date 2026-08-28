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

## 2026-08-28 2001 NotebookLM 预检与浏览器阻塞

决策：無涘（沿用既有收集合同）｜记录：AI（在场模型）

- 预检：`notebooklm_producer.py preflight --limit 10` 成功，`status=ready_to_claim`，候选总数 2,454，`claimed_today=0`，`remaining_today=10`；按目录顺序固定返回 10 条候选，首条为 `youtube-JGZQSFvcQzo`。原始 JSON 已保存为 `~/.local/state/learn-about-games/notebooklm-daily/preflight/2026-08-28T195935-preflight.json`。
- 浏览器就绪：已连接 Chrome 扩展并打开既有长期 Notebook。首次页面显示代理/防火墙检查错误；重载一次后标题恢复为 Gemini Notebook 并显示已登录外壳，但等待 10 秒后可见界面仍只有账号入口，来源面板与 Studio 控件均不可见。按合同判定 `browser-notebook-access=unavailable`，不是 `no_candidate`。
- 停止：未 claim、未改变 ledger、未写 candidate `failed`、未导入 YouTube 来源、未调用 NotebookLM 生成、未下载/上传、未写 ready inbox，也未触发 Daily Check-in、PKM 或网站发布。10 条固定候选均在 claim 前跳过，停止原因是运行级浏览器阻塞。

结构化运行报告：

```json
{
  "preflight_status": "ready_to_claim",
  "attempted": [],
  "ready": [],
  "failed": [],
  "skipped": {
    "count": 10,
    "reason": "browser-notebook-access: unavailable before claim"
  },
  "remaining_today": 10,
  "stop_reason": "浏览器已登录外壳但来源面板与 Studio 控件不可见；未取得可编辑 NotebookLM 工作台证据"
}
```

验证：AI。原始 preflight JSON 通过 `python3 -m json.tool` 校验；本次无业务数据改动、无外部生产调用。下一次须先重新做不消耗额度的就绪检查，成功后才能在首次真实 claim 前确认批次授权。

原始对话：dialogues/2026-0828.md「2001 NotebookLM 预检与浏览器阻塞」

## 2026-08-28 2007 NotebookLM 工作台恢复

决策：無涘（沿用既有收集合同，批次范围待本次确认）｜记录：AI（在场模型）

- 重试 preflight：命令成功，仍为 `status=ready_to_claim`，候选总数 2,454，固定返回 10 条，`claimed_today=0`、`remaining_today=10`；首条为 `youtube-JGZQSFvcQzo`。原始 JSON 已保存为 `~/.local/state/learn-about-games/notebooklm-daily/preflight/2026-08-28T200510-preflight.json`。
- 浏览器就绪：复用 Chrome 连接新建检查标签后，长期 Notebook 页面正常打开。可见且可操作的证据包括“添加来源”按钮（启用）、来源面板、“收起 Studio 面板”、思维导图、信息图和查询框；页面未进行导入或生成动作。
- 暂停：工作台已达到 `available`，但首次真实 claim 前仍需确认本批最多 10 条、并发 1、自动重试 0。当前未 claim、未改变 ledger、未写 candidate `failed`、未调用 NotebookLM、未下载/上传、未写 ready inbox，也未触发 Daily Check-in、PKM 或网站发布。

结构化运行报告：

```json
{
  "preflight_status": "ready_to_claim",
  "attempted": [],
  "ready": [],
  "failed": [],
  "skipped": [],
  "remaining_today": 10,
  "stop_reason": "等待首次真实 claim 前确认本批最多 10 条、并发 1、自动重试 0"
}
```

验证：AI。来源面板与 Studio 控件的可见/启用状态均已通过浏览器只读核验；原始 preflight JSON 通过 `python3 -m json.tool` 校验。本轮没有生产调用或业务数据改动。

原始对话：dialogues/2026-0828.md「2007 NotebookLM 工作台恢复」

## 2026-08-28 2009 批次授权待确认

决策：無涘（待本次批次范围确认）｜记录：AI（在场模型）

- 用户要求再次尝试后，重复 preflight 仍成功且长期 Notebook 已通过只读就绪核验：来源面板与 Studio 控件存在，“添加来源”启用，思维导图、信息图和查询框可见。
- 按合同在首次真实 claim 前暂停，请求明确确认：最多 10 条、逐条串行并发 1、自动重试 0，仅使用当前 NotebookLM 工作台，不调用付费 API 或更换模型。确认后从固定清单首条 `youtube-JGZQSFvcQzo` 开始。
- 当前状态：未 claim、未导入来源、未生成/下载/上传资产、未写 ready；今日剩余 claim 位 10。

结构化运行报告：

```json
{
  "preflight_status": "ready_to_claim",
  "attempted": [],
  "ready": [],
  "failed": [],
  "skipped": [],
  "remaining_today": 10,
  "stop_reason": "等待用户确认最多 10 条、并发 1、自动重试 0，以及服务边界"
}
```

原始对话：dialogues/2026-0828.md「2009 批次授权待确认」

## 2003 Collect-resources 技能预检：浏览器不可用阻塞 claim

决策：無涘 ｜ 记录：codex（自动）｜ session 01a04833-ca03-7963-be3f-8a5105ca8988

执行 collect-resources-about-game 技能的只读预检。预检结果 `ready_to_claim`，候选池 2,454 个，今日额度 10，本批前 10 条未领取。浏览器已连接（Chrome 扩展），但首次打开 NotebookLM 页面导航超时，重载后显示 Gemini Notebook 登录外壳，来源面板与 Studio 控件均不可见，状态为 `browser-notebook-access: unavailable`。未在 claim 前停止，未生成资源、未调用 NotebookLM、未修改 ledger/inbox。已落盘原始预检 JSON、主题摘要、对话记录，Git 提交 `5dc36fa`（本地，未推送）。下一步：恢复 NotebookLM 页面至可见来源面板和 Studio 控件后，重新执行就绪预检再决定是否领取候选。

原始对话：dialogues/2026-0828.md「2003 collect-resources-skill」
