# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev       # start dev server (localhost:4321)
pnpm build     # production build → dist/
pnpm preview   # preview the production build
```

No lint or test scripts are configured — there is no test suite.

## Stack

- **Astro 6** — static site, single page (`src/pages/index.astro`)
- **Tailwind CSS v4** via `@tailwindcss/vite` (no `tailwind.config.*` — config lives entirely in `src/styles/global.css` under `@theme`)
- **TypeScript** (strict mode)
- **Lenis** for smooth scrolling

## Architecture

The entire site is one page. `src/pages/index.astro` composes:

```
Layout (SEO shell, theme init, scroll-progress bar)
  Header (fixed nav, theme toggle, mobile menu)
  Hero / Tech / Projects / Contact   ← page sections
  Footer
```

**`src/layouts/Layout.astro`** owns all `<head>` metadata: Open Graph, Twitter Card, JSON-LD, canonical URL. The `image` prop defaults to the OG hero image; pass a different path to override per-page. `Astro.site` should be set in `astro.config.mjs` for the canonical URL and OG image absolute path to be correct in production.

**`src/styles/global.css`** is the single source of truth for the design system. Brand tokens (colors, fonts) are declared as Tailwind `@theme` variables. Dark mode is driven by the `.dark` class on `<html>` (toggled via `localStorage`). Semantic color aliases (`--color-bg`, `--color-text`, etc.) update at the root when `.dark` is present.

**`src/scripts/animations.ts`** exports one entry point `initAnimations()` called from `Layout.astro`. It wires up:

- `initLenis()` — smooth scroll
- `initReveal()` — IntersectionObserver scroll reveals; add class `reveal` to any element, optionally `data-reveal-dir="left|right"`
- `initSkillCards()` — adds `.in-view` class to `.skill-card` elements on scroll
- `initHeroAmbient()` — floating tech cards + glow orb parallax driven by `mousemove`
- `initMagnetic()` — cursor-follow effect; add `data-magnetic="0.3"` (strength) to any element
- `initProjectTilt()` — 3D tilt on `.tilt-3d` cards; expects a `.tilt-glare` child element

All animation functions bail early when `prefers-reduced-motion` is set.

## Public assets

```
public/assets/
  mk-logo-light.svg      # logo for light mode
  mk-logo-dark.svg       # logo for dark mode
  projects/              # project screenshots / OG image
```

Static assets are referenced with root-relative paths (`/assets/...`).
