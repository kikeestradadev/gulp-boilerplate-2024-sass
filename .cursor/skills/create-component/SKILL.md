---
name: create-component
description: >-
  Crea un componente simetrico con naming Convention Pug kebab-case + SCSS
  _kebab-case + JS camelCase + JSON *-data.json (ej. main-menu). Usar al crear o
  scaffold un componente, modulo UI, o pareja markup/estilos/script.
---

# Crear un componente

## Convención

```text
src/pug/components/main-menu.pug
src/scss/modules/_main-menu.scss
src/js/modules/mainMenu.js          (opcional)
src/data/main-menu-data.json        (si hay datos dinámicos)
```

El bloque BEM es `.main-menu`.

Los specimens del storybook van en `src/pug/style-guide/` (no en `components/`). La página es `src/pug/style-guide/style-guide.pug`.

Cada módulo de página usa el shell de layout global:

```text
.main-container  → width 100%, max-width var(--main-container), padding 0 15px
.container       → width 100%, max-width var(--container), padding 0
```

## Flujo

1. Crea el JSON en `src/data/` si hace falta contenido estructurado:

```json
{
	"items": [{ "label": "Home", "href": "./index.html" }]
}
```

2. Crea el Pug en `src/pug/components/` con sintaxis larga y shell de layout:

```pug
nav(class='main-menu')
	div(class='main-container main-menu__shell')
		div(class='container main-menu__container')
			each item in mainMenuData.items
				a(class='main-menu__link' href=item.href)= item.label
```

3. Crea el parcial SCSS **sin `@use`** y sin redefinir el shell de layout:

```scss
.main-menu {
	&__link { }

	@media (width >= $sm) { }
}
```

4. Regístralo en `src/scss/modules/modules.scss`:

```scss
@import "main-menu";
```

5. Si requiere comportamiento, crea un módulo multi-instancia en `src/js/modules/`, impórtalo en `index.js` y ejecútalo en `initComponents`.

6. Incluye el Pug desde la página: `include ../components/main-menu`.

7. Si el cambio afecta CSS/JS publicados, `npm run build` (skill `bump-assets`).

## Restricciones

- BEM + un bloque principal por parcial.
- Datos en `src/data/*-data.json`, no objetos inline grandes.
- No uses `@use`, Tailwind, ni utilidades utility-first.
- Breakpoints globales desde `styles.scss` (`$sm`, `$l`, …).
- Todo `:hover` dentro de `@media (hover: hover) and (pointer: fine)`.
