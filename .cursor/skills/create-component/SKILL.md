---
name: create-component
description: Crea un componente simetrico Pug + SCSS (BEM) + JS opcional con el mismo nombre base. Usar al crear o scaffold un componente nuevo, o cuando el usuario pida un modulo UI, componente Pug, o pareja markup/estilos/script.
---

# Crear componente (Pug + SCSS + JS)

## Naming

| Archivo | Patron | Ejemplo |
|---------|--------|---------|
| `src/pug/components/{name}.pug` | kebab-case | `color-table.pug` |
| `src/scss/modules/_{name}.scss` | `_` + kebab-case | `_color-table.scss` |
| `src/js/modules/{name}.js` | camelCase | `colorTable.js` |

El bloque BEM = kebab-case del componente (ej. `.color-table`).

## Checklist

Copia y completa:

```
- [ ] Pug en src/pug/components/
- [ ] SCSS parcial en src/scss/modules/
- [ ] @use en modules.scss
- [ ] JS solo si hace falta + import en index.js
- [ ] Clases BEM en Pug y SCSS
```

## Paso 1 — Pug

Raiz con la clase bloque BEM:

```pug
section(class="color-table")
	div(class="color-table__container")
		h2(class="color-table__title") Tabla de colores
```

## Paso 2 — SCSS

Crear `src/scss/modules/_color-table.scss` con BEM anidado:

```scss
@use "breakpoints" as *;

.color-table {
	&__container {
		max-width: var(--container); // CSS var en propiedades
	}
	&__title { }

	@media (width >= $sm) { } // Sass var en media queries
}
```

En `src/scss/modules/modules.scss`:

```scss
@use "color-table";
```

## Paso 3 — JS (solo si hay comportamiento)

`src/js/modules/colorTable.js`:

```js
const colorTable = () => {
	// logica del componente
};

export default colorTable;
```

En `src/js/index.js`:

```js
import colorTable from './modules/colorTable';

(() => {
	colorTable();
})();
```

## Reglas

1. Mismo nombre base en las tres capas; solo cambia la convencion (kebab / `_kebab` / camelCase).
2. Estilos siempre con BEM.
3. No agregues clases utilitarias de Tailwind.
4. No dejes el SCSS sin registrar en `modules.scss`.
5. En propiedades CSS usa `var(--container)`, `var(--color-*)`, etc.
6. Todo SCSS nuevo empieza con `@use "breakpoints" as *;`.
7. En media queries usa `$sm`, `$l`, `$lg`. `var()` no funciona en `@media`.
