<!-- director:wire BEGIN -->
- Director 看板接线〔本项目；此节由 Director 看板维护，勿手改〕
    - 开工前必读：ProjectInfo/ProjectProgress.md（现在到哪 / 下一步 / 阻塞）
    - 收工后必做：更新 ProjectInfo/ProjectProgress.md（覆盖写现状快照）；有决策则追加 ProjectInfo/roadmap.md
    - 留痕：按 ProjectInfo/ 规范（sessions/ 摘要 + dialogues/ 原始对话）；每步落盘 + git 备份
    - 全项目规矩：见用户级 AGENTS.md / CLAUDE.md 内 Director 治理节
<!-- director:wire END -->

# Project context

The current handoff starts at [docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md](docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md).

The repository is PRIVATE during product refinement, the previously public GitHub Pages site returns 404, and `.github/workflows/deploy.yml` is manually disabled. Do not describe the site as currently deployed or public. Runtime HEAD `0b6bfb462f7b697ac526a9c6bf48a95878ed642a` and Pages run `31282275108` remain historical evidence of the last verified public build. Continue from the v0.2 specification and `DESIGN.md`; do not reintroduce site-authored resource quality tiers or mandatory learning paths.

Read the linked v0.2 product design, [DESIGN.md](DESIGN.md), [ROADMAP.md](ROADMAP.md), and [CHANGELOG.md](CHANGELOG.md) before implementation. Open the conversation record only when the summary and design do not preserve enough context. Update both journal artifacts at substantive milestones; update the public Roadmap, Changelog and Devlog when project direction or shipped behavior changes.

The handoff invariant is that a new AI without the original chat must be able to reconstruct project origin, development history, current verified state, and next direction from repository files alone.
