---
name: layout-containers
description: >-
  Enforce module shell: BEM root + .main-container + .container. Outer uses
  global layout classes from _layout.scss. Use when creating or editing Pug/HTML
  modules, sections, or storybook components.
---

# Contenedores de módulo (BEM + Sass)

Cada módulo usa el shell global de `src/scss/core/_layout.scss` (sin utilidades Tailwind).

## Shell obligatorio

```pug
section(class='example-module')
	div(class='main-container example-module__shell')
		div(class='container example-module__container')
			//- contenido
```

| Capa | Clase | Rol |
|------|-------|-----|
| Outer | `.main-container` | max-width `var(--main-container)`, `padding: 0 15px` |
| Inner | `.container` | max-width `var(--container)`, sin padding lateral |

## Excepción style-guide

Si el módulo ya vive dentro de `.style-guide-container` (que aporta el shell), no dupliques otro `main-container`.

## Reglas

1. La raíz del módulo es el bloque BEM (`section(class='…')`).
2. No uses `w-full`, `max-w-[…]`, `mx-auto`, `px-[15px]` ni otras utilidades.
3. Para cambiar anchos, edita tokens en `:root` (`_layout.scss`), no el markup.
4. Header/footer del layout usan clases `.main-header` / `.main-footer`.
