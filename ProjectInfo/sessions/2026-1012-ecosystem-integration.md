# 研究生态公开入口发布回执

2026-10-12 · 记录：Codex。跨仓公开发布摘要；主场对话覆盖已通过 trace-finalize 登记在 opportunity-radar/ProjectInfo/sessions/2026-1012-ecosystem-integration.md。本文件不另声明对话计数。

### 结论
按用户确认的第一阶段范围，首页和主导航新增研究生态入口 `/ecosystem/`。直接嵌入 GPA 已发布公共目录，保留其实体 ID、来源与审核责任；没有维护第二份目录，没有私有数据库、评分、备注、排除或申请策略接口。Innovation Atlas 保持原有作品创新关系语义。

### 证据
功能 63704e81c1bae27a40080c6f22b1a50c5f2cde48；导航契约更新 974689e0d86a034493ef9824c6631eac52632573，已核对远端。check、262 单测、158 页构建通过。发布 run 38247069713（https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/38247069713）的完整 Chromium 测试、build、deploy 全部成功。第一轮因发现旧四导航断言需要更新而主动取消，不计通过。
新增端到端契约覆盖固定公共 iframe URL、no-referrer、不传递私人 query，既有导航测试更新为五项并保留 EGDS 方法不占独立主导航的语义。CUA 核验桌面与 320px 菜单五项均可见，嵌入目录实际载入；不把带扩展浏览器的滚动宽度当成独立无溢出证据。
公开 https://playwithexperiences.github.io/Learn-About-Games/ecosystem/ HTTP 200，HTML 与本地构建逐字节一致；sha256 38ee7375c3bf007d4cceaf238c38cf50bb2ad6e5bf3fa0618bb3ce4cea41287f。公开 HTML 无 localhost/127.0.0.1。GPA 校验器通过；其数据产物未修改。

### 风险
GPA 仍为已审核学位目录，不等于所有游戏研究中心或当前开放招生；入口明确说明此范围。GPA 发布与可用性会直接影响嵌入内容，保留独立窗口入口；没有另存过期副本。收集端、NotebookLM、自动化与无关历史留痕改动未纳入本场提交。

### 下一步
本轮已发布验收完成。继续通过 GPA 原有目录审核流程维护公开实体；未来扩展公开研究中心时沿公共事实契约，避免将中心页当作学位或公开私人判断。回退本轮前端提交并重新发布即可，无数据迁移。
