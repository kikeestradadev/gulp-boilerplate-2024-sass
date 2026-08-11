---
name: pug-long-syntax
description: >-
    Enforce explicit long-form Pug syntax. Use when creating or editing Pug
    templates, components, layout sections, storybook modules, or dynamic Pug
    markup in this project.
---

# Pug Long Syntax

## Instructions

Use explicit Pug attributes for all classes and dynamic values.

Prefer:

```pug
header.fixed.top-0.right-0.left-0.z-10.mx-auto.w-full(
	class='min-h-[var(--header-height)] max-w-[var(--main-container)] bg-[var(--base-color)] px-[15px]'
)
section.mx-auto.w-full(class='max-w-[var(--main-container)] px-[15px]')
.mx-auto.w-full(class='max-w-[var(--container)]')
```

Avoid:

```pug
header.fixed.top-0.left-0.z-10.w-full
section.w-full.max-w-[var(--main-container)].mx-auto
.container
```

Note: fixed headers need `left-0 right-0` (or `inset-x-0`) plus `mx-auto` so `max-w-[var(--main-container)]` centers on wide viewports.

## Checklist

1. Use `tag(class="...")` or `tag(class='...')`.
2. Do not use shorthand `tag.class`, `tag#id`, or `.class`.
3. Keep Tailwind utilities, CSS variables, and dynamic classes inside the `class` attribute.
4. For CSS variables, keep the project pattern: `property-[var(--token)]`.
5. For layout containers, keep the project tokens: `max-w-[var(--main-container)]` and `max-w-[var(--container)]`.
