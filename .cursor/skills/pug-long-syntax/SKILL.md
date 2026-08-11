---
name: pug-long-syntax
description: >-
  Enforce explicit long-form Pug syntax. Use when creating or editing Pug
  templates, components, layout sections, storybook modules, or dynamic Pug
  markup in this project.
---

# Sintaxis Pug larga

Siempre declara clases con el atributo `class`. No uses shorthand Emmet.

## Correcto

```pug
section(class='buttons-links' id='botones')
	h2(class='buttons-links__title')= buttonsLinksData.title
```

## Incorrecto

```pug
section.buttons-links#botones
	h2.title= buttonsLinksData.title
```

## Checklist

1. `tag(class='…')` — nunca `tag.class` / `.class`.
2. Clases BEM + shell `.main-container` / `.container` cuando aplique.
3. Datos desde JSON locales (`pug-data-files`), no objetos grandes inline.
4. Sin utilidades Tailwind.
