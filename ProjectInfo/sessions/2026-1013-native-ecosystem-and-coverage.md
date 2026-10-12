# 原生研究生态发布与覆盖边界回执

2026-10-13 · 记录：Codex。跨仓回执；主场对话覆盖由 opportunity-radar/ProjectInfo/sessions/2026-1013-native-ecosystem-and-coverage.md 通过 trace-finalize 登记，本文件不另声明对话计数。

## 结果

LAG 原生研究生态已替代 iframe，统一读取 GPA research-ecosystem.json。118中心、234机构、281项目；中心状态、官方来源、核查日期保留，45可按明确ID关联机构，73不猜配。私人分数、备注、排除与申请策略不在输出白名单；图谱同名显示折叠不作为公共身份事实。GPA日常刷新已接入同一同步/发布器，不维护第二份中心目录；未变化的事实保留快照日期。

## 验证与发布

Radar12回归、GPA25单测及公共三道闸门、25镜像文件、LAG check/265单测/158页构建通过。LAG失败的38276241261确实未部署，已修复动态select标签精确匹配和reset默认动作时序，并实际复验地区筛选10→清除118。最终497d780对应run38279991282的build与deploy均success（https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/38279991282）。线上原生HTML与本地逐字节一致，sha256 7494cd41bbf05898898b5e5a84257b5a076b47dd076f4032b73788d028ae7e6b，无iframe。

GPA bc2f572对应mirror38279992419 success；公开ecosystem sha256 ae8dc74464f3f9c4ce15fd6f5092bab6e3951ee7961172fad2d8c44c078daab3，atlas.js 207e6cd0ff0d398871ff16bf9ab71c769bc0f28aeab312e7daf7e81175e640c2，index.html 8200c42a0cc635e3e1ade6034eafa1bc4bf73536e1db271b4e50e1518644bf2f，与本地一致。浏览器线上118/118中心可见；1280×650展开GPA筛选后列表高289.3px，4条完整机构记录可见。教师数显示已收录或名册待补，地点区分城市待核与非单点情形。

## 数据仍未查全

公开教师/学位快照仍为2026-09-17。按当前任职边及机构层级聚合，193根机构中42未上图：24缺城市、13多地、4线上、1联合；112根机构未关联已录教师，其中110有学位项目。不能据此说学校没有教师。内部来源候选仍需独立审校，本轮没有替换已审学位或人员数据，也未完成逐校新取证。

本轮资料覆盖审计定版在GPA私有工作仓docs/native-ecosystem/coverage-audit.json；口径不是遗留teacher_count，也不是全校人数。中心已登记与成员/地点/博士路线已核完是不同完成状态。后续需沿正式身份与官方来源补证，不能填猜测坐标或伪造教师数。

## 恢复与交接

回退本轮各仓实现及生成公共产物，按既有发布链部署；源事实库只读，未迁库/改分。资料维护入口见GPA MAINTENANCE.md和refresh-gpa技能；历史会话、采集自动化及其他会话未提交实现不属于本轮提交。
