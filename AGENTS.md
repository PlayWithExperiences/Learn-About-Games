<!-- director:wire BEGIN -->
- Director 看板接线〔本项目；此节由 Director 看板维护，勿手改〕
    - 开工前必读：ProjectInfo/ProjectProgress.md（现在到哪 / 下一步 / 阻塞）
    - 收工后必做：更新 ProjectInfo/ProjectProgress.md（覆盖写现状快照）；有决策则追加 ProjectInfo/roadmap.md
    - 留痕：按 ProjectInfo/ 规范（sessions/ 摘要 + dialogues/ 原始对话）；每步落盘 + git 备份
    - 全项目规矩：见用户级 AGENTS.md / CLAUDE.md 内 Director 治理节
<!-- director:wire END -->

# Project entrypoint

Innovation history update (2026-09-12, locally verified; not published): `/atlas/` now uses `InnovationHistory.astro`, a decade-column overview with nine editorial reading territories, comparison routes and a contextual source inspector. `/atlas/network/` preserves the precise-year network; both consume the same catalog (96 objects / 86 relations / 78 evidence). Territory is not exclusive genre membership; column spacing is not elapsed time. Twelve museum-backed anchors add breadth without new influence edges. Current continuity: `ProjectInfo/sessions/2026-0912-innovation-history.md`, `docs/devlog/2026-09-12-innovation-history-overview.md`. Preserve coverage gaps and source-check dates.

Published state (verified 2026-09-10 16:18:01 +0800): repository `PlayWithExperiences/Learn-About-Games` is PUBLIC and GitHub Pages is active at https://playwithexperiences.github.io/Learn-About-Games/. Runtime `7a101aaf87b2274c443ac7e2a0425790d4efe8a6` was deployed by successful run [34453141646](https://github.com/PlayWithExperiences/Learn-About-Games/actions/runs/34453141646). Live checks verified home, EGDS, map and resources (HTTP 200), the four v0.3 layers, 28 framework nodes, 5437 resources, filtering and 320px no-overflow. EGDS is 体验型游戏设计系统 / Experiential Game Design System: Perception → Understanding → Attribution → Reconstruction; Experience form → Subjective feelings → Eliciting factors → Design levers. Historical article titles and stable IDs remain unchanged. Methodology v0.3 is distinct from the site's v0.2 software scope. Earlier private-refinement restrictions are historical and superseded by the user's 2026-09-10 publication instruction. See ProjectInfo/sessions/2026-0910-egds-v03-release.md for evidence. The 12 dependency alerts identified on 2026-09-10 are fixed; npm audit and GitHub open-alert count are both zero after the security dependency upgrade. Do not restore Domains / mapGroups, quality tiers, or mandatory learning sequences.

Before making substantive changes, read these files in order:

1. [Latest decision summary](docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md)
2. [EGDS Expertise Map redesign](docs/superpowers/specs/2026-08-09-egds-expertise-map-design.md), its [implementation plan](docs/superpowers/plans/2026-08-09-egds-expertise-map-implementation-plan.md), [Private refinement design](docs/superpowers/specs/2026-08-09-private-refinement-design.md), [current v0.2 product design](docs/superpowers/specs/2026-08-09-learn-about-games-v02-design.md) and [visual system](DESIGN.md)
3. [Public roadmap](ROADMAP.md) and [changelog](CHANGELOG.md)
4. [Current conversation record](docs/journal/2026-08-09-learn-about-games-v02-transcript.md) only when exact v0.2 wording is needed; follow its link to the M0 record for older history

Keep the decision summary and sanitized conversation record current at project milestones. Update the Roadmap when direction changes, the Changelog for every release, and `docs/devlog/` for material public decisions. Preserve the distinction between EGDS framework nodes, knowledge topics, capabilities, practices, roles, production contexts, resource items, language versions, innovations, game artifacts, innovation relations and evidence. Do not restore the retired Domains / mapGroups ontology as a second map truth.

Innovation Atlas remains a section inside Learn About Games, not a separate project, repository or product. v0.2 renders one global horizontal time network; Roguelike, Metroidvania and later topics are highlight lenses over the same network, not isolated subgraphs.

v0.2 removes site-authored resource quality tiers and demotes Learning Trail from the core product model. Resources are organized by capability and topic with factual metadata and traceable external observations only. Do not reintroduce candidate/reviewed/featured labels, rankings, ratings or a mandatory learning sequence.

## Continuity contract

The repository must let any future AI continue the project without access to the original chat UI. At every substantive milestone, update the latest decision summary and sanitized transcript, then keep this entrypoint pointed at them. The repository must preserve project origin, decision history and reasons, current verified state, unresolved questions, and exact next direction. Never claim a transcript is complete when the runtime cannot export the full conversation.

## Implementation simplicity

For early milestones, complexity must be justified by a current user journey, an observed failure, deployment correctness, or a misleading relationship. Do not delay a visible vertical slice to handle theoretical extreme cases. Adversarial review should remove misleading semantics and unnecessary machinery; introduce additional validation, abstraction, migration, or recovery behavior only when real data or a failing acceptance test demonstrates the need.

For sub-agent routing, current public benchmark data such as Codex Radar may inform the initial model/effort choice, but it is not an absolute intelligence score. Record the observation date and task context, verify pricing or “free” claims against official terms, respect the models actually exposed by the runtime, and escalate from the lowest adequate tier only after concrete failure or newly discovered ambiguity.
