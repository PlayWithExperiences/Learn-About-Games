# 02｜情绪曲线的形状与实证研究

更新于 2026-08-22 · 记录者 Codex

## Vonnegut：fortune over time

Kurt Vonnegut 在演讲与手稿中把故事画成“主人公的 fortune 随时间变化”的曲线；这是一种启发式形状语言，不是从观众数据估计的心理量。Reagan 等人的论文把它作为后续计算分析的文化前史。[Reagan et al. 2016](https://doi.org/10.1140/epjds/s13688-016-0093-1)

## Reagan、Mitchell、Kiley、Danforth、Dodds（2016）

论文题为 *The emotional arcs of stories are dominated by six basic shapes*。最终用于分析的 Project Gutenberg 过滤集合是 **1,327 本**（不是常被二手摘要写成的 1,700）；作者用 labMT/Hedonometer 对文本做词汇情感评分。[论文摘要与方法](https://doi.org/10.1140/epjds/s13688-016-0093-1)

### 方法

1. 以滑动的 **10,000-word window** 读取文本；每个窗口用 Hedonometer 和 labMT 词典得到平均情感分数，形成等距时间序列。
2. 用 SVD／主成分分解找出时间序列的正交基本模式。
3. 用 Ward hierarchical clustering 与无监督聚类检查相似形状是否重现。
4. 将这些模式与作品下载量做关联观察；下载量只是 success proxy，不是审美质量或观众情绪真值。

这些步骤和作者对“字典法对单句不可靠、需要滚动聚合”的限定都在论文方法段中。[EPJ Data Science 全文](https://link.springer.com/article/10.1140/epjds/s13688-016-0093-1)

### 六种弧

| 名称 | 形状 | 简写 |
| --- | --- | --- |
| Rags to riches | 持续上升 | rise |
| Tragedy / Riches to rags | 持续下降 | fall |
| Man in a hole | 先下降后上升 | fall–rise |
| Icarus | 先上升后下降 | rise–fall |
| Cinderella | 上升、下降、再上升 | rise–fall–rise |
| Oedipus | 下降、上升、再下降 | fall–rise–fall |

作者报告：六弧同时作为 SVD modes、Ward 聚类和无监督学习聚类的结果出现；但“六种”是对该文本集合与该测量方法的低维概括，不是宇宙叙事定律。[论文结果段](https://doi.org/10.1140/epjds/s13688-016-0093-1)

## 批评与边界

- 词典分数是文本中的词汇愉悦度／valence proxy，不是角色体验、观众情绪或 arousal；10,000 词窗口也会抹平 scene 级转折。[原论文对窗口和词典限制的说明](https://doi.org/10.1140/epjds/s13688-016-0093-1)
- 作品样本来自 Project Gutenberg，过滤规则粗略，文学传统、语言、翻译与可下载性会影响分布；下载量不是作品“成功”的充分测量。[作者结论](https://doi.org/10.1140/epjds/s13688-016-0093-1)
- SVD 与聚类能显示形状相似，却不能证明作者采用了同一结构，也不能识别是哪一个镜头／事件造成峰谷。
- 对影视最直接的批评是字幕只含对白，不含表演、构图、剪辑、音乐和音效。van Cranenburgh 的电影实验让观众按分钟标注正／中／负，再用字幕 VADER 与 TF–IDF 预测；结果说明有些峰谷可预测，但整体预测困难，且无对白段会产生空缺。[*Annotation and Prediction of Movie Sentiment Arcs*](https://pure.rug.nl/ws/portalfiles/portal/240056984/Annotation_and_Prediction_of_Movie_Sentiment_Arcs_final_abstract_.pdf)

## 影视复现：已有，但不是统一工业标准

电影脚本研究已经把 sentiment arc、场景分段和已知叙事元素结合起来；一项 2025 年的脚本研究用 NRC-VAD/LabMT 与 Ward clustering 分析约 1,000 个 movie scripts，但作者自己报告原始曲线有噪声、脚本长度与分段不均会影响比较，聚类产生的是三组主要群而非六弧的严格复刻。[脚本研究](https://arxiv.org/html/2511.11857v1)

更接近观众而非脚本的方向是 MediaEval/LIRIS：连续预测电影片段的 expected valence 与 arousal。这是对“观众影响”的机器学习任务，不等于已经找到 Vonnegut 六弧，也不自动产生叙事转折点。[MediaEval 2018](https://arxiv.org/abs/1911.12361)

## 对 EGDS 的可借用部分

可直接借用的是“先归一化时间，再比较一阶形状”的分析习惯：rise、fall、fall–rise、rise–fall 适合当作描述性形状标签。但不应把六弧当作情绪词表，也不应从一个曲线峰值反推唯一客观原因。多尺度处理要保留局部 scene/beat 与中程 sequence，不能只保留整部作品的低维弧。
