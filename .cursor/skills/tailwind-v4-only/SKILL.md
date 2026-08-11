---
name: tailwind-v4-only
description: >-
    Enforce Tailwind CSS 4 CSS-first practices for this Gulp + Pug project.
    Use when writing or editing CSS, Pug utilities, PostCSS config, theme tokens,
    breakpoints, or when tempted to use Tailwind 3 APIs (@tailwind directives,
    theme.extend JS config, v3 CLI). Never introduce Tailwind 3 patterns.
---

# Tailwind CSS 4 Only

This project is **Tailwind CSS 4 only**. Do not use Tailwind 3.

## Entry & tooling

| Piece      | v4 (required)                                             |
| ---------- | --------------------------------------------------------- |
| CSS entry  | `src/styles/styles.css` with `@import "tailwindcss"`      |
| Sources    | `@source "../pug/**/*.pug"` and `@source "../js/**/*.js"` |
| Theme      | `@theme { … }` for breakpoints/fonts                      |
| App tokens | `:root { --main-container, --container, … }`              |
| PostCSS    | `@tailwindcss/postcss` in `postcss.config.js`             |

## Do

```css
@import 'tailwindcss';
@source "../pug/**/*.pug";
@theme {
	--breakpoint-m: 800px;
}
:root {
	--section-gap: 2.5rem;
}
```

```pug
section.mx-auto.w-full(class='max-w-[var(--main-container)] px-[15px]')
	.mx-auto.w-full(class='max-w-[var(--container)]')
```

```pug
h2(class='text-[length:var(--h2-size)] leading-[length:var(--h2-line)]')
div(class='m:grid-cols-3 gap-[var(--section-gap)] lg:grid-cols-5')
```

## Never (Tailwind 3)

- `@tailwind base/components/utilities`
- Design tokens primarily in `tailwind.config.js` → `theme.extend`
- Installing or recommending `tailwindcss@3`
- v3-only docs, plugins, or CLI workflows as the project setup
- Assuming v3 class/config behavior without checking v4

## Checklist before shipping CSS/UI

1. Entry still starts with `@import "tailwindcss"`.
2. New reusable values go in `:root` or `@theme`, not v3 JS theme.
3. Markup uses utilities + `var(--token)` — no hardcoded layout px that duplicate tokens.
4. Any new dependency is v4-compatible.
5. No copy-paste from Tailwind 3 examples.
