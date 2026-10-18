# 1018 收集链：坏 deck 修补受阻＋R-ftXx3POZM 失败停批（muse-spark-1.3-contributor）

- preflight `ready_to_claim`（目录候选 2454/选中 9，当日已 claim 1/10、剩余 9；9 条自 `R-ftXx3POZM` 起）。
  浏览器就绪 `available`：复用现活 CDP 127.0.0.1:9223（headed 工作台 `c8090f54` 可编辑，
  未杀浏览器、未新建画像）；Studio 38 卡、deck 可立即生成、chat 正常。PicGo 存活。
- 修坏 deck（`youtube-9fms9kUzn3Y`，上一轮 run-20261018142615-33650）**未完成，按技能阻断**：
  - 现状：ledger `ready`＋inbox `2026-1018-1439-career-industry-practice.json` 已交付；
    字面 `producer retry` 被拒绝（只允许 failed/partial；ledger 未动、未耗 claim）。
  - 坏件实锤：两版 page-asset-capture PPTX（5.8MB/12.9MB）`unzip -l` 均报
    “End-of-central-directory signature not found”（无中央目录），远端同坏（sha256 一致）。
  - 诊断：viewer-download 回退重取成功，19,323,688B，`unzip -l` 可列目录、`unzip -t`
    零错误（仅存 /tmp/deck-diag-9fms-1018，未上传、未发布，遵守不覆盖合同）。
  - 阻断根因：producer 无修改 ready 的原子接口（retry 拒 ready；publish 拒指纹变化覆盖；
    fail 拒非 generating）。补发需消费端 quarantine/补发流程或 producer 改动，属父级决策。
- 批量：attempted 1 / ready 0 / failed 1 / skipped 8；当日 claim **2/10、剩余 8**。
  `R-ftXx3POZM`（run-20261018150117-52818，LAG_CARD_TIMEOUT_SEC=900）`isolate-source`
  失败：导入标题长驻 URL 占位、keep-alias 0 匹配（09-23/09-27/09-28 同签名；BEFORE 来源面板为空）。
  claim 已耗，不自动重跑。按授权失败即停批，未试后 8 条。
- 停止原因：首条失败停批（非配额）。ledger 现 100 ready / 86 failed，无非终态条目，未删改。
  浏览器未关（9223 系父会话工作台）。send_message 同步因父 agent 不可用失败，已记报告。
- 证据：state `runs/batch-20261018T150031-*.log`、`runs/2026-10-18T150031-item-R-ftXx3POZM/`、
  `/tmp/deck-diag-9fms-1018/`（19MB 有效 deck）；preflight 原始 JSON 在批次日志头。
- 下一步待定：① 9fms 坏 deck 是否走消费端 quarantine＋授权单条补发（有效 deck 本地就绪）；
  ② R-ftXx3POZM 的 URL 占位 0 匹配是否修 runner 后新自然日 retry；③ 后 8 条顺延。
