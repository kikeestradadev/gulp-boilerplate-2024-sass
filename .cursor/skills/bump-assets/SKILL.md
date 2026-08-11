---
name: bump-assets
description: >-
  Cache-busting de CSS/JS locales con assetVersion. Usar al publicar assets o al
  preguntar por versiones ?v= en styles.css / index.js.
---

# Versionar CSS y JavaScript

Los CSS/JS locales se cargan con query de versión:

```pug
link(rel='stylesheet', href=`styles.css?v=${assetVersion}`)
script(src=`index.js?v=${assetVersion}`)
```

## Fuente de verdad

```text
package.json → "assetVersion": "1.0.0"
```

Gulp inyecta `assetVersion` a Pug vía `gulp-data` (lee `package.json`). No lo hardcodees en el template.

## Flujo

1. `npm run build` ejecuta `scripts/bump-assets.mjs` (patch +1) y luego el build de producción.
2. El HTML final queda como `styles.css?v=1.0.1` e `index.js?v=1.0.1`.
3. En `npm run dev` no se sube la versión; live reload invalidaría CSS en caliente. Al guardar no hay bump de semver.

## Reglas

- No hardcodees `?v=1.0.0` en markup; usa `assetVersion`.
- No edites `assetVersion` a mano salvo hotfix; usa `npm run build`.
- `assetVersion` es independiente de `version` del paquete npm.
- No añadas `?v=` a recursos CDN (Swiper, fuentes).
- No pongas `assetVersion` en JSON de `src/data/`.
