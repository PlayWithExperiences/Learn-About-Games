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

## 2221 演示文稿导出替代路径与 ready 发布

决策：無涘（沿用已确认的单条生产范围与 ready 队列边界）｜记录：AI（在场模型）

- 生产：精确 claim 固定清单首条 `youtube-JGZQSFvcQzo`，`generation_run_id=run-20260828201328-3640`。同一长期 Notebook 中只保留该 YouTube 来源，完成中文内容总结、信息图、思维导图和详细演示文稿；没有领取第二条候选、没有换模型、没有付费 API 或自动重试。
- 资产核验：信息图通过当前页面资源 bundle 保存为 PNG（2752×1536）；思维导图在 NotebookLM 查看器执行“Expand all nodes（全部展开）”，观察到 65 个节点、最深第 4 层、折叠节点 0，先保留完整 SVG，再栅格化为 PNG（2105×4616）。
- Slides：NotebookLM 工作台显示演示文稿已准备就绪，共 12 页。可见 PPTX/PDF 下载控件各监听一次均未产生可验证文件；随后从每页当前渲染图取得 1376×768 原始画面，逐页保存并用本机 `python-pptx`/Pillow 重建 12 页 PPTX 与 PDF。两者分别通过 OOXML 完整性和 12 页 PDF 校验；结果中的演示文稿明确标注为工作台渲染成品，未伪称原生可编辑文件。
- 托管：PicGo 心跳正常。首次信息图上传因 PicGo 当时 `autoRename=true` 返回了不符合语义命名合同的孤立时间名，未写入结果；随后临时关闭自动改名，以系统时钟 `20260828221419` 为前缀串行重新上传信息图、思维导图、PPTX、PDF，四个正式文件名均为 `YYYYMMDDHHMMSS-narrative-expression-artifact.ext`，上传后已将 PicGo `autoRename` 恢复为原值 `true`。未删除首次孤立文件，避免不可逆外部删除。
- 回读：四个正式 URL 均 HTTP 200；信息图/思维导图为 PNG，PPTX/PDF 远端 MIME 为通用 `application/octet-stream`，但文件签名分别确认 PNG、OOXML 和 12 页 PDF，且四个远端响应字节与本地 SHA-256 完全一致。
- 发布：contract v2 ready JSON 已写入 `AI-Life-Mentor/notebooklm-resources/2026-0828-2219-narrative-expression.json`，包含 6,395 字符内容总结、1,255 字符来源边界、四项资产链接和思维导图展开证明；ledger 已由 `generating` 转为 `ready`。本轮默认停在本地 ready 队列，没有运行 `publish-notebooklm-resource.sh`，没有写 PKM/Daily Check-in，没有推送或部署。

结构化运行报告：

```json
{
  "preflight_status": "ready_to_claim",
  "attempted": ["youtube-JGZQSFvcQzo"],
  "ready": ["youtube-JGZQSFvcQzo"],
  "failed": [],
  "skipped": {"count": 9, "reason": "首条已 ready，本场按 ready 队列边界停止，未领取其余固定候选"},
  "remaining_today": 9,
  "stop_reason": "单条 contract v2 资源已完成并进入本地 ready inbox；默认边界不继续领取第二条"
}
```

验证：AI。ready JSON、ledger 状态、四个远端回读、PNG/PPTX/PDF 文件签名、12 页页数、`git diff --check` 均已核验；本轮没有修改网站业务数据、公开状态或部署设置。

原始对话：dialogues/2026-0828.md「2003 collect-resources-skill」

## 2026-08-28 2323 续产第 2 条与信息图配额阻断

决策：無涘（沿用已确认的最多 10 条、串行并发 1、自动重试 0 和 NotebookLM 服务边界）｜记录：AI（在场模型）

- 新的只读 `preflight --limit 10` 成功，上一条 ready 后固定返回 9 条候选；按顺序精确 claim `youtube-a-zKMzboOec`，`generation_run_id=run-20260828231614-96167`。没有改用新的候选、模型或服务。
- 当前长期 Notebook 的来源导入成功，来源面板只保留 Animation Bootcamp 这一条来源，中文内容总结生成完成；在开始信息图阶段前，Studio 明确显示“您已达到每日信息图数量上限，改日再来吧！”。这是实际配额证据，不是等待超时或浏览器失联。
- 按合同在 `quota_block / infographic` 阶段停止：调用 `notebooklm_producer.py fail` 将该 claim 留为 `failed`，没有继续生成思维导图/Slides，没有上传、ready 发布或自动重试，也没有领取后续 8 条候选。

结构化运行报告：

```json
{
  "preflight_status": "ready_to_claim",
  "attempted": ["youtube-a-zKMzboOec"],
  "ready": [],
  "failed": ["youtube-a-zKMzboOec"],
  "skipped": {"count": 8, "reason": "NotebookLM Studio 在信息图阶段明确命中日配额，按合同停止当天后续 claim"},
  "remaining_today": 8,
  "stop_reason": "信息图日配额已耗尽；不调用替代模型/付费 API，不继续半成品生产"
}
```

验证：AI。`fail` 返回 `status=failed`，ledger 显示今日已用 2 次 claim（1 条 ready、1 条 failed）；本轮没有生成新 ready JSON、没有 PicGo 上传、没有 PKM/Daily Check-in、没有推送或部署。下次配额恢复后须重新做工作台就绪检查和只读 preflight，不能自动重试本条。

原始对话：dialogues/2026-0828.md「2323 续产第 2 条与信息图配额阻断」

## 2003 NotebookLM 资源收集第1条生产完成

决策：無涘 ｜ 记录：codex（自动）｜ session 01a04833-ca03-7963-be3f-8a5105ca8988

执行 collect-resources-about-game 技能进行资源收集。首次 preflight 发现 2,454 个候选，但 NotebookLM 浏览器因代理/防火墙问题无法访问来源面板和 Studio 控件，在 claim 前停止。用户反馈页面恢复后重新核验，确认可用并等待授权确认。用户确认后从固定清单首条 `youtube-JGZQSFvcQzo` 开始生产，成功生成中文总结、信息图（2752×1536）、思维导图（65节点/深度4/全展开）和演示文稿（12页），通过 PicGo 上传至图床，远端回读 SHA-256 校验通过，发布 contract v2 ready JSON 到 inbox。项目留痕已本地提交（c61405f）。运行报告：attempted 1, ready 1, failed 0, skipped 9, remaining_today 9。其余9条未处理，非失败。

原始对话：dialogues/2026-0828.md「2003 collect-resources-skill」
