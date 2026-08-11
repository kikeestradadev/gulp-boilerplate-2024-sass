---
name: create-fake-backend-form
description: >-
  Crea un formulario fake de simulación backend: JSON store en src/data, specimen
  en style-guide, módulo JS con fetch GET/POST, y ruta API en gulpfile (npm run
  dev). Usar al pedir formularios que guarden/agreguen objetos en data/, APIs
  fake, o simulaciones de backend locales.
---

# Crear un formulario fake (simulación backend)

Patrón del proyecto para ejercicios que **persisten** en `src/data` vía API del servidor Gulp. Referencia: `persona-form` + `/api/personas`.

**No** uses descarga a la carpeta Descargas como “guardar”. **Sí** escribe el JSON en disco con `npm run dev`.

## Checklist de archivos

Para un recurso `pedido` (ejemplo):

| Pieza | Ruta |
|-------|------|
| Store | `src/data/pedido.json` → `{ "pedidos": [] }` |
| Config UI | `src/data/pedido-form-data.json` |
| Pug | `src/pug/style-guide/pedido-form.pug` |
| SCSS | `src/scss/modules/_pedido-form.scss` + `@import` en `modules.scss` |
| JS | `src/js/modules/pedidoForm.js` + registro en `index.js` → `initComponents` |
| API | `GET`/`POST` `/api/pedidos` en `gulpfile.js` (`startDevServer`) |
| Nav | Entrada en `style-guide-container-data.json` + `include` en `style-guide-container.pug` |

## 1. Store JSON

```json
{
	"pedidos": []
}
```

Gulp ya copia `src/data/**/*.json` → `public/data/` en `assets`. La API debe escribir **ambos** paths al hacer `POST`.

## 2. Config del formulario (`*-form-data.json`)

Incluye textos + `apiUrl` + `fields` (misma forma que `persona-form-data.json`). Local Pug: `pedidoFormData`.

## 3. Specimen Pug (style-guide)

- Sintaxis larga + BEM (`.pedido-form`).
- Dentro del style-guide **no** dupliques `.main-container` (el container padre ya aporta shell).
- `data-api-url`, mensajes de éxito/error, lista, status, preview `<pre><code class="language-json">`.
- Campos con `each field in pedidoFormData.fields`.

## 4. Módulo JS

Sigue `javascript-modules`:

- `querySelectorAll('.pedido-form')`, flag `dataset.pedidoFormReady`.
- `GET` al montar → render lista.
- `POST` en submit → append en servidor → re-render → reset.
- Números: castear `type="number"` a `Number`.
- Manejo de error si no hay API (GitHub Pages / servidor viejo).

## 5. API en `gulpfile.js`

Dentro de `startDevServer`, **antes** del static file handler:

1. Helpers: leer body, `read*Store` / `write*Store` (src + public), `sendJson`.
2. `GET /api/pedidos` → store completo.
3. `POST /api/pedidos` → parse JSON objeto → `store.pedidos.push(item)` → write → `201` + store.
4. Log en consola: `[api] … agregada → path (n)`.

Reutiliza el estilo de `/api/personas` (no inventes Express salvo que el usuario lo pida).

## 6. Estilos

Parcial `_pedido-form.scss` sin `@use`; hover solo con `(hover: hover) and (pointer: fine)` si aplica. Registra en `modules.scss`.

## Límites (documentar en el lead)

| Entorno | Persistencia |
|---------|----------------|
| `npm run dev` → localhost | Sí, escribe `src/data/*.json` |
| `npm run deploy` / GitHub Pages | No (estático) |

## Tras crear

1. Reiniciar `npm run dev` si se añadió/cambió la ruta API.
2. Probar Submit varias veces y verificar el array en `src/data/…json`.
3. Si el patrón se generaliza más, actualizar rule `fake-backend-forms`.
