---
name: create-slider-data
description: >-
  Crea y modifica sliders Pug + JSON en src/data + módulo JS Swiper. Usar al
  crear, editar o refactorizar componentes *-slider.pug, *-slider-data.json o
  *Slider.js.
---

# Sliders Pug + Swiper

Swiper se carga por CDN en `src/pug/config/template.pug` (CSS + JS). No lo añadas como dependencia npm.

La data dinámica **no** va inline en el Pug: vive en `src/data/` (ver rule `pug-data-files`).

## Naming (obligatorio)

| Pieza | Convención | Ejemplo |
|-------|------------|---------|
| Pug | `{name}-slider.pug` | `src/pug/components/main-slider.pug` |
| Datos JSON | `{name}-slider-data.json` | `src/data/main-slider-data.json` |
| Local Pug | camelCase del basename JSON | `mainSliderData` |
| Raíz DOM | `.{name}-slider` | `.main-slider` |
| JS | `{name}Slider.js` | `src/js/modules/mainSlider.js` |
| Const JS | `{name}Slider` | `const mainSlider` |

Ejemplo de nombre: `main-slider.pug` + `main-slider-data.json` → local `mainSliderData`.

## Archivo de datos

`src/data/main-slider-data.json` — el objeto es la raíz del archivo:

```json
{
	"title": "Principal",
	"items": [
		{ "name": "Slide 1", "image": "./images/slide-1.webp", "href": "#" },
		{ "name": "Slide 2", "image": "./images/slide-2.webp", "href": "#" }
	]
}
```

## Markup Pug

Solo markup. Shell de layout (`layout-containers`) y sintaxis larga (`pug-long-syntax`). Recorre el local inyectado por Gulp.

```pug
section(class='main-slider w-full max-w-[var(--main-container)] mx-auto px-[15px]')
	div(class='w-full max-w-[var(--container)] mx-auto')
		h2(class='text-[length:var(--h2-size)] leading-[length:var(--h2-line)] font-bold mb-6')= mainSliderData.title
		div(class='swiper')
			div(class='swiper-wrapper')
				each slide in mainSliderData.items
					article(class='swiper-slide')
						img(src=slide.image alt=slide.name)
			div(class='swiper-pagination')
			div(class='swiper-button-prev')
			div(class='swiper-button-next')
```

## Módulo JS

```js
const mainSlider = () => {
	if (typeof Swiper === 'undefined') return;

	document.querySelectorAll('.main-slider').forEach((root) => {
		if (root.dataset.mainSliderReady === 'true') return;

		const el = root.querySelector('.swiper');
		if (!el) return;

		new Swiper(el, {
			slidesPerView: 1,
			spaceBetween: 16,
			pagination: {
				el: root.querySelector('.swiper-pagination'),
				clickable: true,
			},
			navigation: {
				nextEl: root.querySelector('.swiper-button-next'),
				prevEl: root.querySelector('.swiper-button-prev'),
			},
		});

		root.dataset.mainSliderReady = 'true';
	});
};

export default mainSlider;
```

Regístralo en `src/js/index.js` dentro de `initComponents`.

## Reglas

1. Crea **siempre** la pareja: `components/{name}-slider.pug` + `data/{name}-slider-data.json`.
2. El JSON es el objeto a recorrer (títulos, items, imágenes, enlaces); el Pug no declara ese objeto.
3. No uses datos inline (`- const foo = { ... }`) ni `src/pug/data/` ni `*-data.pug`.
4. Mantén controles estructurales de Swiper (`.swiper`, `.swiper-wrapper`, `.swiper-slide`, pagination/nav) en el markup.
5. Conserva la clase raíz `.{name}-slider` que espera el módulo JS.
6. Incluye el Pug desde la página: `include ../components/{name}-slider`.
7. Tipografía y tokens con variables `:root` (`css-root-variables`); layout con `layout-containers`.
