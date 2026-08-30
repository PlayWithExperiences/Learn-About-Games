# NotebookLM ready-resource contract

This reference defines the only JSON shape that the producer may mark `ready`. The
inbox consumer validates it again, so this file is guidance rather than a bypass for
validation.

## Fixed content template

```text
# 标题（YYYY-MMDD-HHMM-TOPIC）

来源：原始 YouTube 视频链接

信息图：中文简体，横向，手绘笔记，详细

思维导图：中文简体，完整展开全部层级，不只展开一层

演示文稿：优先保留可获得的原始演示文稿；否则保留 NotebookLM 生成的中文简体详细演示文稿。PPTX/Slides 使用普通链接，PDF 也使用普通链接。

内容总结：请根据来源内容密度决定篇幅。按演讲/视频的论证推进顺序展开核心问题、案例与迭代过程、设计取舍、玩家体验影响、可迁移的方法；不要只给摘要，也不要逐字转录。最后必须说明来源没有覆盖或无法确认的边界。只依据来源内容，不补充外部事实。
```

## JSON shape

```json
{
  "resource_id": "youtube-ABCDEFGHIJK",
  "title": "视频标题",
  "topic": "design-fundamentals",
  "timestamp": "2026-0824-0730",
  "generated_at": "2026-08-24T07:30:00+08:00",
  "producer_status": "ready",
  "contract_version": 2,
  "generation_run_id": "run-20260824073000-1234",
  "output_fingerprint": "由 producer 计算，不手填",
  "source": {
    "label": "YouTube · 视频标题",
    "url": "https://www.youtube.com/watch?v=ABCDEFGHIJK",
    "video_id": "ABCDEFGHIJK"
  },
  "notebook_url": "https://notebook.google.com/notebook/example",
  "artifacts": {
    "infographic": {
      "label": "中文简体横向手绘笔记（详细）",
      "url": "https://raw.githubusercontent.com/Medill-East/IMGStorage/master/20260824073000-topic-infographic.png"
    },
    "mind_map": {
      "label": "中文简体完整思维导图",
      "url": "https://raw.githubusercontent.com/Medill-East/IMGStorage/master/20260824073000-topic-mindmap.png",
      "expansion_verification": {
        "method": "notebooklm-viewer",
        "action": "全部展开",
        "observed_depth": 3,
        "collapsed_node_count": 0
      }
    },
    "slide_deck": {
      "label": "中文简体详细演示文稿",
      "url": "https://raw.githubusercontent.com/Medill-East/IMGStorage/master/20260824073000-topic-slides.pptx",
      "pdf_url": "https://raw.githubusercontent.com/Medill-East/IMGStorage/master/20260824073000-topic-slides.pdf",
      "pdf_label": "演示文稿 PDF（普通链接）"
    }
  },
  "content_summary": "按来源推进顺序写出的中文文字版内容总结。",
  "boundary": "来源没有覆盖或无法确认的内容。"
}
```

`resource_id`、`source.video_id`、`contract_version`、`producer_status`、
`generation_run_id`、`generated_at` 和 `output_fingerprint` 由生产核心校验/补入；不要用标题或时间戳
替代稳定的 `video_id` 去重。`notebook_url` 是私有辅助入口，只进入 PKM/每日精选。

`contract_version: 2` 的思维导图必须带 `expansion_verification`：生产者只接受
NotebookLM 查看器实际执行“全部展开”、观察到至少三级节点、且剩余折叠节点为 0
的记录。旧版没有该字段的已发布资源继续按兼容规则消费；新生产结果不得省略它。

`delivery_status: "quarantined"` 是消费端对历史坏资产的隔离标记，不是新的生产
成功状态；它必须带 `delivery_reason`，消费端会保留文件但跳过推送，等待明确授权的
单条补发。新生产结果不要自行写入该状态。

每一个 artifact 都必须实际存在并有可引用 `url` 才能标记 `ready`。如果 NotebookLM
没有生成某项，使用 `failed`/`partial` 记录原因并停止，不要写入空链接或
`status: "not-generated"` 的 ready 记录。

## 导出路径与窗口隔离

导出优先使用不触发浏览器 UI 的页面资产后台路径，不要依赖 Chrome 下载弹窗。目标
viewer 打开且渲染稳定后，若适配器提供 `pageAssets`/等价能力，列出当前页面资产，
选中与目标卡片对应的精确图片或 SVG，再用 `bundle`/等价能力把实际字节写入全新临时
目录；不要导航到资产 URL。页面资产列表本身不算成功，仍须验证非零字节、文件签名/类型、
实际内容和适用时的图片尺寸，并在结果 JSON 的 `export_note` 中注明路径及原因。若需
SVG，校验实际 SVG 标记和结构后再栅格化，不能用截图替代。只有页面资产能力不可用、
目标资产不可导出或后台导出明确失败时，才监听真实下载事件并点击可见下载控件；不要
要求用户在弹窗中选择保存/取消，同一候选最多再尝试一条明确的另一条路径。

## PicGo 命名与校验

上传前取系统时钟，而不是复制旧文件名：

```bash
date '+%Y%m%d%H%M%S'
```

命名模式为 `YYYYMMDDHHMMSS-topic-artifact.ext`。同一秒内的多个文件使用不同的
artifact 后缀；如果目标文件已经存在且内容不同，停止并报告，不覆盖。
