---
name: layout-containers
description: >-
  Enforce module shell: section with Main Container (--main-container) then
  Container (--container). Outer uses w-full, max-w-[var(--main-container)],
  mx-auto, px-[15px] only. Inner has no side padding. Vertical rhythm comes from
  main: gap + py with --section-gap — never py/pt/pb on section shells. Use when
  creating or editing Pug/HTML modules, sections, or storybook components.
---

# Layout Containers

## Tokens (`src/styles/styles.css` `:root`)

- `--main-container: 3500px` — outer `section`
- `--container: 1600px` — inner content wrapper
- `--section-gap: 2.5rem` (desktop `4rem`) — space **between** sections and vertical padding **of** `main`

## Module shell (required)

```pug
section(class="w-full max-w-[var(--main-container)] mx-auto px-[15px]")
	div(class="w-full max-w-[var(--container)] mx-auto")
		//- module content
```

| Layer | Classes |
|-------|---------|
| `section` | `w-full max-w-[var(--main-container)] mx-auto px-[15px]` |
| inner `div` | `w-full max-w-[var(--container)] mx-auto` (no `px-[15px]`) |

## Vertical spacing (`main` owns it)

En `template.pug`, `main` aplica **gap** (entre sections) y **py** (antes del primer módulo y después del último):

```pug
main(
	class='flex w-full flex-1 flex-col max-w-[var(--main-container)] gap-[var(--section-gap)] py-[var(--section-gap)]'
)
```

| Clase en `main` | Para qué |
|-----------------|----------|
| `gap-[var(--section-gap)]` | Distancia entre sections hijas |
| `py-[var(--section-gap)]` | Distancia superior/inferior del bloque de contenido |

Do **not** add `py-*`, `pt-*`, or `pb-*` on module `section` shells.

## Never

- `max-w-[3500px]` / `max-w-[1600px]`
- `px-[15px]` on the inner container
- `py-*` on the outer `section`
- `main` sin `gap` o sin `py` con el token
- Outer shell that is not a `section` for page modules

## Checklist

1. Root tag is `section`.
2. Outer: main-container token + lateral `px-[15px]` only.
3. Inner: container token, no side padding.
4. No vertical padding on the section; rely on `main` (`gap` + `py` + `--section-gap`).
5. Tokens live in `:root`; tune spacing by editing `--section-gap`.
