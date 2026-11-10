---
version: alpha
name: PlayWithExperiences Knowledge Cartography
description: A dual-theme editorial knowledge system for Learn About Games.
colors:
  primary: "#226B66"
  light-page: "#EEF0F4"
  light-surface: "#F9FAFC"
  light-surface-strong: "#E3E7EE"
  light-ink: "#141A28"
  light-muted: "#3F4860"
  light-line: "#CDD3DE"
  light-accent: "#226B66"
  light-accent-strong: "#226B66"
  dark-page: "#0F1420"
  dark-surface: "#161D2E"
  dark-surface-strong: "#0A0E17"
  dark-ink: "#E4E7EE"
  dark-muted: "#A9B1C3"
  dark-line: "#263049"
  dark-accent: "#7FC8C2"
  dark-accent-strong: "#7FC8C2"
  focus-light: "#226B66"
  focus-dark: "#7FC8C2"
typography:
  display:
    fontFamily: LXGW WenKai
    fontSize: 64px
    fontWeight: 760
    lineHeight: 1.05
    letterSpacing: -0.05em
  heading:
    fontFamily: LXGW WenKai
    fontSize: 32px
    fontWeight: 740
    lineHeight: 1.15
    letterSpacing: -0.025em
  body:
    fontFamily: LXGW WenKai
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: LXGW WenKai
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.3
rounded:
  none: 0px
  sm: 6px
  md: 10px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  section: 80px
  page-gutter: 24px
  page-width: 1180px
components:
  button:
    rounded: "{rounded.sm}"
    height: 44px
    padding: 12px
  node:
    rounded: "{rounded.md}"
    padding: 12px
  panel:
    rounded: "{rounded.md}"
    padding: 24px
---

# Learn About Games Design System

## Overview

Learn About Games is a public knowledge product for beginners, working game designers, career explorers and contributors. The interface should feel like an editable atlas: clear enough to navigate, dense enough to be useful, and modest about uncertainty.

Design Read: an editorial knowledge-map redesign for game learners and practitioners, using an explainable cartographic language instead of dashboard cards or decorative networks.

- `DESIGN_VARIANCE: 6`
- `MOTION_INTENSITY: 3`
- `VISUAL_DENSITY: 6`

The product is not a marketing landing page. Data relationships, sources and uncertainty carry more visual weight than decoration. Motion is limited to interaction feedback and state changes.

## Colors

The shared PWE v0.4 baseline is the UI authority: `PWE-Branding/BRAND.md` and `tokens/pwe.css`. This project vendors that exact token snapshot in `src/styles/pwe.css` and maps existing UI variable names to it; it does not define another palette.

- Light mode uses the PWE morning page, surface, ink and line tokens.
- Dark mode uses PWE ink-blue surfaces and the existing aurora accent. System, Light and Dark preferences remain available.
- Aurora marks links, focus, selected filters and the currently focused knowledge relation; star gold is not distributed across these secondary controls.
- Domain, entity, relation and role states never rely on hue alone. Labels, shapes, line styles and borders carry the same meaning.
- A page uses one appearance mode at a time. Sections do not invert independently.

WCAG AA is the minimum contrast target for text and controls. Body text should reach AAA where practical.

偏离 PWE 基线（既有、待续）：知识图的既有分类色与职业层级填色本单位保留，仍需按语义单独核对后迁移，避免在公共UI换色时改变图意；文字、边框样式与关系语义保持。1180px图谱外壳保留给现有可视化，长文仍由原阅读宽度约束。本次不是全站品牌验收。

## Typography

Use the existing PWE `--pwe-font-brand` WenKai stack for interface text. Load the baseline-approved LXGW WenKai 1.7.0 stylesheet; local WenKai and the documented Kai fallbacks keep content readable if that public font source is unavailable. Logo assets and author wording are unchanged.

- Display text is reserved for page titles and the home statement.
- Section headings use weight and spacing, not oversized type.
- Body copy stays within approximately 65 characters per line.
- Labels use sentence case. Do not add uppercase micro-labels above every section.
- Chinese product copy uses plain functional language. Avoid promotional claims, cute metaphors and invented precision.

## Layout

The page shell remains 1180px with a 24px minimum gutter. Desktop navigation must stay on one line and below 80px in height.

The main map and Atlas are information visualizations, not bento grids:

- The Capability Map uses a stable wide canvas with named territories and shared-node relations.
- The Innovation Atlas uses one horizontal time coordinate system.
- Supporting explanations sit beside or below the visualization rather than wrapping every entity in a large card.
- Mobile converts each visualization into a relationship-equivalent outline. It never scales a desktop canvas into unreadable miniature text.

## Elevation & Depth

Use tonal layers, borders and negative space. Avoid heavy shadows and floating glass panels. Selected nodes can rise through stronger surface contrast and an inner border, not an outer glow.

## Shapes

The radius system is restrained:

- Interactive controls use 6px corners.
- Content panels and capability nodes use 10px corners.
- Pills are reserved for real filter selections and compact statuses.
- Game, Innovation and Category Formation nodes use visibly different shapes in the Atlas.
- Capability and Knowledge Topic nodes use visibly different outlines in the map.

## Components

### Primary navigation

Only five product destinations appear at the top level. About owns project governance links. On small screens the navigation becomes one compact menu rather than a wrapped strip of equal links.

### Appearance control

The control offers System, Light and Dark. It lives in the header utility area, uses text plus a maintained icon family when icons are needed, persists explicit choice and exposes the current value to assistive technology.

### Capability node

A capability node is compact and linkable. It contains a name and optional small type label, not a paragraph card. Its position and connecting lines provide context. Resource counts may appear in the detail panel, never as node size.

### Career overlay

Core, Important and Suggested use three border patterns plus explicit text. The overlay preserves every node and never looks like a completion chart. Personal state uses a separate small marker.

### Resource result

A result distinguishes Source from Work Item, shows factual metadata and states why it relates to the selected topic. It never shows a site-authored star, score, rank, reviewed badge or featured badge.

### Atlas node and relation

Nodes share one time axis. A selected theme changes emphasis but not membership. Relation edges expose direction, type and evidence status; clicking an edge opens its evidence without duplicating the same games into relation cards.

## Do's and Don'ts

- Do make every visual encoding explainable in a legend.
- Do preserve all context when a career or Atlas lens is active.
- Do keep the map and Atlas usable without animation.
- Do test System, Light and Dark appearances at desktop and 320px.
- Do use one maintained icon family if icons are introduced.
- Don't use card grids to imitate maps.
- Don't use node size for importance, quality or resource count.
- Don't use color as the only state signal.
- Don't use unconstrained force-directed positions.
- Don't add decorative glows, gradients, status dots or fake precision.
- Don't use long automatic animations, scroll hijacking or custom cursors.
- Don't create site-authored scores for people, roles or resources.
