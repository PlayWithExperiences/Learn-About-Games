# 给 PWE Learn 补充 NotebookLM 视频

更新：2026-11-10 · 方向：無涘（已有材料优先用NotebookLM转成可刷视频）｜实现：Codex。

这是既有私人学习收集轮中的**可选独立阶段**。基本资源仍按原v2合同生产与交付；视频失败不得把已完成的基本资源改为失败，也不得伪造视频ready。仅本阶段策略开启时执行，不新建排程，不增加订阅，不触发公开上传/分享。

## 选择与领取

找到相邻 `PWE-Harness` 仓库（可用 `LAG_PWE_HARNESS_ROOT` 指定已有位置），注册器为 `scripts/learning-video.mjs`。先检查当前客户端浏览器已登录，长期本和视频概览可用；不可用/未知时记运行级 `video_browser_unavailable`，不领取、不把它写成无候选。

```sh
node <Harness>/scripts/learning-video.mjs next \
  --plan-file <Mentor>/learning/plan.json \
  --inbox <Mentor>/notebooklm-resources
```

`next`读取真实计划和已交付资源，当前计划材料优先，再选已有补充材料；它不调用模型。成功状态为 `ready_to_generate` / `daily_limit_reached` / `disabled` / `no_candidate`。读取或格式失败必须保留错误，不能返回空候选冒充无事可做。

当前实现上限是北京时间每天1个新视频、并发1、自动重试0；已有来源的任一视频尝试（含失败）都不能换编号自动重做。注册器原子领取并计数，失败也占当天尝试。这个默认是有界实现，不是向本人追加采购或次数审批；后续本人明确改变策略时再落实实现。

只对返回的精确 `candidate` 领取：

```sh
node <Harness>/scripts/learning-video.mjs begin \
  --id <candidate.id> --resource-file <candidate.resource_file>
```

只有 `status=generating` 且 `already_exists=false` 才生成。其它状态原样记入报告。已有来源仍使用原本的资源身份，视频侧记独立manifest；不调用基本资源producer的claim/retry。

## 生成与导出

读取该资源的Notebook入口，复用已有Notebook。核对实际来源标题/URL/video ID，取消其它来源；在Video Overview来源选择器再核对只选当前1个来源。已从本机真实UI验证中文简洁版可用；格式选择仍以当前账号实际控件为准，配额不足立即停止，不购买、不换服务。

围绕材料的核心问题、两个具体例子、仍待核实的问题组织中文简体简洁视频。明确是对原来源的AI转述，分开开发者解释、玩家观察和普遍效果，不补外部事实，不代本人作研究主张。可以提示观众提出一个自己的例子或不同解释。

等待卡片真正完成；生成中不是成功。优先当前客户端的页面资产后台导出；该能力不可用或明确失败时，再用实际下载控件。下载事件监听失败不证明浏览器没保存文件，应按实际生成标题/时间检查下载文件；这次路径应留原因，不盲目重调生成。Notebook保持私有，视频不上传PicGo或其它公开托管。

打开生成视频的“查看提示和1个来源”，核对该视频确实关联预期唯一来源。实际媒体文件必须非零、可解析，有音画及合理时长。用同一下载完成注册：

```sh
node <Harness>/scripts/learning-video.mjs complete \
  --id <candidate.id> --resource-file <candidate.resource_file> \
  --file <actual.mp4> --source-count 1 --source-url <candidate.source_url>
```

注册器执行MP4/音画流/完整解码/SHA检查，原子保存到本机私人媒体目录，写入可播放manifest并回读。由Harness `readLearningVideos`→`readLearn.learningVideos`→Learn Feed按同一来源配对；App在线读取需要既有配对，手机取回后由原生私有文件缓存播放，不把配对key交给JS。不要手写`ready`或把临时Google资产URL当成持久媒体。

## 失败与回执

生成/导出失败用精确任务登记：

```sh
node <Harness>/scripts/learning-video.mjs fail --id <candidate.id> --reason '<阶段与可核查原因>'
```

不删除失败，不自动重做。注册阶段校验失败保留 `failure_stage=registration`，修复**同一下载文件的注册**可再次complete，不因此重调NotebookLM。基本批次与视频分别记账：在既有运行报告增加 `video: {status,id,stage,reason?,sha256?,duration_seconds?}`；不记录Google临时资产URL、cookie或本人私有正文。

自然轮是否成功，以真实manifest、文件和可播放回读为准；这份流程配置和本场样片不证明未来每天都已产出。新视频仍是AI内容，本人理解与永久笔记由本人形成。
