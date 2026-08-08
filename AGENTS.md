# Project entrypoint

Verified state: M0 is deployed at <https://playwithexperiences.github.io/Learn-About-Games/>. The user has approved the v0.2 redesign and content expansion and explicitly authorized implementation without another design-review pause. Do not treat M0 as the formal content-complete release.

Before making substantive changes, read these files in order:

1. [Latest decision summary](docs/journal/2026-08-09-learn-about-games-v02-decision-summary.md)
2. [Current v0.2 product design](docs/superpowers/specs/2026-08-09-learn-about-games-v02-design.md) and [visual system](DESIGN.md)
3. [Public roadmap](ROADMAP.md) and [changelog](CHANGELOG.md)
4. [Current conversation record](docs/journal/2026-08-09-learn-about-games-v02-transcript.md) only when exact v0.2 wording is needed; follow its link to the M0 record for older history

Keep the decision summary and sanitized conversation record current at project milestones. Update the Roadmap when direction changes, the Changelog for every release, and `docs/devlog/` for material public decisions. Preserve the distinction between domains, knowledge topics, capabilities, practices, roles, production contexts, resource items, language versions, innovations, game artifacts, innovation relations and evidence.

Innovation Atlas remains a section inside Learn About Games, not a separate project, repository or product. v0.2 renders one global horizontal time network; Roguelike, Metroidvania and later topics are highlight lenses over the same network, not isolated subgraphs.

v0.2 removes site-authored resource quality tiers and demotes Learning Trail from the core product model. Resources are organized by capability and topic with factual metadata and traceable external observations only. Do not reintroduce candidate/reviewed/featured labels, rankings, ratings or a mandatory learning sequence.

## Continuity contract

The repository must let any future AI continue the project without access to the original chat UI. At every substantive milestone, update the latest decision summary and sanitized transcript, then keep this entrypoint pointed at them. The repository must preserve project origin, decision history and reasons, current verified state, unresolved questions, and exact next direction. Never claim a transcript is complete when the runtime cannot export the full conversation.

## Implementation simplicity

For early milestones, complexity must be justified by a current user journey, an observed failure, deployment correctness, or a misleading relationship. Do not delay a visible vertical slice to handle theoretical extreme cases. Adversarial review should remove misleading semantics and unnecessary machinery; introduce additional validation, abstraction, migration, or recovery behavior only when real data or a failing acceptance test demonstrates the need.

For sub-agent routing, current public benchmark data such as Codex Radar may inform the initial model/effort choice, but it is not an absolute intelligence score. Record the observation date and task context, verify pricing or “free” claims against official terms, respect the models actually exposed by the runtime, and escalate from the lowest adequate tier only after concrete failure or newly discovered ambiguity.
