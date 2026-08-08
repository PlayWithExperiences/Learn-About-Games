# Project entrypoint

Verified state: M0 is deployed at <https://playwithexperiences.github.io/Learn-About-Games/>. The next direction is a separate, evidence-backed content expansion plan; do not treat M0 as the 40-60-node formal first release.

Before making substantive changes, read these files in order:

1. [Latest decision summary](docs/journal/2026-08-08-learn-about-games-decision-summary.md)
2. [Current product design](docs/superpowers/specs/2026-08-08-learn-about-games-design.md)
3. [Public roadmap](ROADMAP.md) and [changelog](CHANGELOG.md)
4. [Conversation record](docs/journal/2026-08-08-learn-about-games-transcript.md) only when exact project history is needed

Keep the decision summary and sanitized conversation record current at project milestones. Update the Roadmap when direction changes, the Changelog for every release, and `docs/devlog/` for material public decisions. Preserve the distinction between domains, knowledge topics, capabilities, practices, roles, production contexts, resource items, language versions, innovations, game artifacts, innovation relations and evidence.

Game Innovation Atlas is a lower-priority section inside Learn About Games, not a separate project, repository, or product. The first release must still expose its category framework and evidence-backed seed content; implement complex Atlas interactions and broad coverage after the core capability map and resource navigation.

## Continuity contract

The repository must let any future AI continue the project without access to the original chat UI. At every substantive milestone, update the latest decision summary and sanitized transcript, then keep this entrypoint pointed at them. The repository must preserve project origin, decision history and reasons, current verified state, unresolved questions, and exact next direction. Never claim a transcript is complete when the runtime cannot export the full conversation.

## Implementation simplicity

For early milestones, complexity must be justified by a current user journey, an observed failure, deployment correctness, or a misleading relationship. Do not delay a visible vertical slice to handle theoretical extreme cases. Adversarial review should remove misleading semantics and unnecessary machinery; introduce additional validation, abstraction, migration, or recovery behavior only when real data or a failing acceptance test demonstrates the need.

For sub-agent routing, current public benchmark data such as Codex Radar may inform the initial model/effort choice, but it is not an absolute intelligence score. Record the observation date and task context, verify pricing or “free” claims against official terms, respect the models actually exposed by the runtime, and escalate from the lowest adequate tier only after concrete failure or newly discovered ambiguity.
