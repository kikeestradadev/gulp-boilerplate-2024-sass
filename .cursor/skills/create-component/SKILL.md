---
name: create-component
description: Crea un componente simetrico con naming Convention Pug kebab-case + SCSS _kebab-case + JS camelCase (ej. main-menu). Usar al crear o scaffold un componente, modulo UI, o pareja markup/estilos/script.
---

# Crear componente (Naming Convention)

## Canonico

```
main-menu.pug
_main-menu.scss
mainMenu.js
```

| Archivo | Patron | Ejemplo |
|---------|--------|---------|
| `src/pug/components/{name}.pug` | kebab-case | `main-menu.pug` |
| `src/scss/modules/_{name}.scss` | `_` + kebab-case | `_main-menu.scss` |
| `src/js/modules/{name}.js` | camelCase | `mainMenu.js` |

Bloque BEM = kebab-case (`.main-menu`).

## Checklist

```
- [ ] Pug: src/pug/components/main-menu.pug
- [ ] SCSS: src/scss/modules/_main-menu.scss
- [ ] @use "main-menu" en modules.scss
- [ ] JS solo si hace falta: mainMenu.js + import en index.js
- [ ] Clases BEM
- [ ] @use "breakpoints" as *; al inicio del SCSS
```

## Paso 1 — Pug

```pug
nav(class='main-menu')
	ul(class='main-menu__list')
		li(class='main-menu__item') Item
```

## Paso 2 — SCSS

```scss
@use "breakpoints" as *;

.main-menu {
	&__list { }
	&__item { }

	@media (width >= $sm) { }
}
```

En `modules.scss`:

```scss
@use "main-menu";
```

## Paso 3 — JS (solo si hay comportamiento)

```js
const mainMenu = () => {
	// logica del componente
};

export default mainMenu;
```

En `index.js`:

```js
import mainMenu from './modules/mainMenu';

(() => {
	mainMenu();
})();
```

## Reglas

1. Mismo nombre base en las tres capas; solo cambia la convencion.
2. Estilos con BEM.
3. No mezcles nombres (`menu.pug` + `_nav.scss` + `navigation.js`).
4. No dejes el SCSS sin registrar en `modules.scss`.
