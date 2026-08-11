---
name: review-rules-skills
description: >-
    Obligatorio al inicio de cualquier tarea en este repo: leer rules y skills
    relevantes de .cursor antes de editar Pug, Sass, JS, sliders o layout. Usar
    siempre antes de implementar, refactorizar o crear archivos.
---

# Revisar rules y skills primero

Antes de escribir o cambiar código en este proyecto, **para y revisa** las reglas del juego en `.cursor/`.

No implementes “de memoria”. Omisiones tipicas: sintaxis Pug corta, shells sin `.main-container`/`.container`, datos inline en vez de JSON, `@use` en Sass, hover sin media query de pointer fino, reintroducir Tailwind.

## Checklist (obligatorio)

1. Lista lo que hay ahora:
    - Rules: `.cursor/rules/*.mdc`
    - Skills: `.cursor/skills/*/SKILL.md`
2. Según la tarea, **lee con Read** (no asumas el contenido) los que apliquen.
3. Solo después implementa, respetando lo leído.

## Mapa rápido

| Si tocas…                                          | Lee primero                                                     |
| -------------------------------------------------- | --------------------------------------------------------------- |
| Cualquier Sass / CSS                               | `sass-breakpoints`, `sass-hover-touch`                          |
| Layout / sections / modules Pug                    | `bem-module-layout`, skill `layout-containers`                  |
| Nuevo componente Pug + SCSS (+ JS)                 | `component-symmetry`, skill `create-component`                  |
| Plantillas Pug                                     | `pug-long-syntax` (rule + skill), `pug-data-files`              |
| Datos de componentes / sliders                     | `pug-data-files`, skill `create-slider-data`                    |
| Sliders / Swiper                                   | `create-slider-data` + `javascript-modules`                     |
| JS en `src/js`                                     | `javascript-modules`                                            |

Si la tarea cruza varias capas (p. ej. un slider nuevo), lee **todos** los items del mapa que apliquen antes del primer edit.

## Reglas

1. No edites archivos de producto hasta completar el checklist.
2. Si un skill o rule contradice un hábito genérico (Tailwind, `@use`, datos inline, npm Swiper, etc.), gana el del repo.
3. Si creas un patrón nuevo reutilizable, actualiza o añade rule/skill en la misma sesión.
4. Tras cambios grandes, vuelve a contrastar el diff contra las rules leídas.
