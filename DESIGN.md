---
version: alpha
name: PlayWithExperiences Knowledge Cartography
description: A dual-theme editorial knowledge system for Learn About Games.
colors:
  primary: "#2459C7"
  light-page: "#F3F5F7"
  light-surface: "#E8EDF3"
  light-surface-strong: "#DCE4ED"
  light-ink: "#18212B"
  light-muted: "#536170"
  light-line: "#C7D0DA"
  light-accent: "#2459C7"
  light-accent-strong: "#173F94"
  dark-page: "#111820"
  dark-surface: "#18232D"
  dark-surface-strong: "#22313D"
  dark-ink: "#E8EEF4"
  dark-muted: "#A8B5C2"
  dark-line: "#3A4A58"
  dark-accent: "#86A8FF"
  dark-accent-strong: "#B7CAFF"
  focus-light: "#174EAE"
  focus-dark: "#AFC4FF"
typography:
  display:
    fontFamily: ui-sans-serif
    fontSize: 64px
    fontWeight: 760
    lineHeight: 1.05
    letterSpacing: -0.05em
  heading:
    fontFamily: ui-sans-serif
    fontSize: 32px
    fontWeight: 740
    lineHeight: 1.15
    letterSpacing: -0.025em
  body:
    fontFamily: ui-sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: ui-sans-serif
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

The existing cool neutral palette and blue accent remain the brand foundation. v0.2 adds a matching dark palette instead of replacing the product identity.

- Light mode uses the existing blue-gray page, surface, ink and line tokens.
- Dark mode uses blue-charcoal surfaces with a lighter version of the same blue accent.
- The accent marks links, focus, selected filters and the currently focused knowledge relation.
- Domain, entity, relation and role states never rely on hue alone. Labels, shapes, line styles and borders carry the same meaning.
- A page uses one appearance mode at a time. Sections do not invert independently.

WCAG AA is the minimum contrast target for text and controls. Body text should reach AAA where practical.

## Typography

Use the existing system sans stack so Chinese and English remain fast and readable without new network font dependencies.

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
