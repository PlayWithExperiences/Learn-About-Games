# NotebookLM 每日生产

## 0817 每日生产：内容校验拒绝两条，同名资产识别缺陷停止批次

决策：無涘（每日≤10次、串行1、自动重试0的既有范围授权） ｜ 记录：Codex ｜ 2026-09-23T08:16:51.419772+08:00

- preflight ready_to_claim，初始claimed0，候选10；浏览器、来源/Studio与deck入口可用，无遗留generating。复用长期Notebook，使用既有viewer兼容参数。
- attempted3 / ready0 / remote_delivered0 / failed3 / skipped7 / remaining_today7；运行级失败1。停止原因是共享资产识别缺陷，未确认配额耗尽。
- youtube-oG83i_ZvDYE：总结将讲者未见负评扩写成100%好评；信息图写禁用实时着色，而来源明确说明实时光照；content-validation拒绝上传。导图36节点/3级/折叠0，三资产已导出但不是可交付结果。
- youtube-p-8eNkUCvnw：总结合并350总数与250动画/两周，信息图又把250/两周错归给Rayman角色；原文谈Teensy。content-validation拒绝上传。导图37节点/3级/折叠0，三资产已后台导出。
- youtube-iNEe3KhMvXM：新旧两张导图同名，runner以(icon,title)去重而忽略新卡；本地调用classify_cards复现absent。停止当前runner，再用producer fail记录artifact-identity。新信息图/导图已出现，演示文稿最后仍在生成；没有导出/上传或重新生成。
- ledger回读 {'ready': 60, 'failed': 54}，无generating。没有ready发布、历史补交、PKM/Issue/Daily Check-in/网站动作。未修改生产代码和既有脏文件。
- 下一步先修复并验证资产唯一身份识别与精确导出，再继续新候选；三条failed不自动重跑。原始预检、报告、同名卡复現及私有内容证据只保存在本机：/Users/haodong/.local/state/learn-about-games/notebooklm-daily/runs/2026-09-23T073210-automation。

session 01a0cb75-f3c9-77f0-b71c-bc282af014dd
trace-user-count: 1
原始对话：dialogues/2026-0923.md「0732 （未分类）」；本机trace已保留本次用户原文，不复制私有正文到Git。
