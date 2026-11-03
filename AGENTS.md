# AGENTS.md

## Development

When starting the dev server, use background mode:

```sh
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

Use the Astro documentation when changing routing, components, styling, content collections, or integrations.

## Renewal component design policy

- `src/pages/renewal/` pages should compose the screen and prepare page-specific data. Repeated markup and behavior belong in `src/components/renewal/`.
- Components should expose differences through typed props and slots. Do not duplicate desktop and mobile DOM; use one DOM structure and responsive CSS.
- A component owns its own visual rules whenever those rules are not shared by other components. Prefer an adjacent `.module.css` or the component's scoped `<style>`.
- Keep only design tokens, resets, shared layout primitives, and genuinely cross-page utilities in `src/styles/renewal.css`.
- Use the existing Renewal design tokens for colors, typography, spacing, borders, and radii. Add a token when a value is intentionally shared; avoid one-off hardcoded values for repeated patterns.
- Shared links, buttons, recruitment CTAs, breadcrumbs, lightboxes, icons, and feature panels must use their common components rather than page-specific copies.
- Keep API access and normalization in `src/lib/renewal-api.ts` and related API modules. Components and pages should consume normalized data instead of knowing microCMS response details.
- Preserve the current Renewal visual rules: the sidebar is based on `renewal/org_png/01_ホーム画面.png`, the mobile view uses the same DOM as desktop, and the mobile order follows the reference design.

## Current renewal issues

The following are known migration tasks. They are not permanent documentation requirements: when an issue is fully resolved, remove that issue from this section.

- `src/styles/renewal.css` still contains many page-specific rules and late overrides. Extract each page/component block into the owning component or page stylesheet, leaving only shared tokens and primitives.
- `RenewalFeaturePanel` has already been migrated to `RenewalFeaturePanel.module.css`; the remaining Renewal components should follow the same boundary where appropriate.
- Some Renewal selectors still use global BEM-style class names even when they are component-local. Replace them gradually with component-scoped or CSS Module classes without changing the rendered design.
- Responsive rules are still mixed into the large global stylesheet. Move component-specific mobile and tablet rules together with the component styles, while keeping breakpoint tokens and genuinely shared layout rules global.
- Remove obsolete duplicate selectors and overrides as each style block is migrated. Do not preserve an override only because it was previously needed by an older selector.

## Issue maintenance rule

Record only active, actionable issues in `Current renewal issues`. When an issue is resolved and verified, delete its item from this file. Do not leave completed work as historical backlog unless the user explicitly asks for a changelog.
