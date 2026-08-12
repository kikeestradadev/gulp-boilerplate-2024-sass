---
name: emulated-db
description: >-
  Coloca seeds de tablas en src/data/db/ y la lógica de emulación (localStorage,
  FK/JOIN, store) en src/js/db/. Usar al crear o editar tablas fake, stores CRUD,
  relaciones, o helpers de persistencia sin backend.
---

# Emulación de BD (`db/`)

## Separación

| Responsabilidad | Ubicación |
|-----------------|-----------|
| Seeds / tablas JSON | `src/data/db/{tabla}.json` → `public/data/db/` |
| Store, load, persist, FK/JOIN, ids | `src/js/db/*.js` |
| Form + grilla + eventos UI | `src/js/modules/*Grid.js` |
| Config UI (textos, fields) | `src/data/*-grid-data.json` |

## Al añadir una tabla nueva

1. Seed: `src/data/db/{tabla}.json` (colección con `id` en cada fila).
2. `dataUrl` del módulo: `./data/db/{tabla}.json`.
3. Ampliar store en `src/js/db/` (colecciones + load/persist).
4. UI en `modules/`; importar helpers desde `../db/...`.
5. Bump `storageKey` si cambia el schema.

## Referencia

- Seeds: `src/data/db/persona.json`, `src/data/db/tutor.json`
- Store: `src/js/db/crudDemoStore.js`
- UI: `personaGrid.js`, `tutorGrid.js`
- Rule: `emulated-db`
- UI CRUD: skill `create-static-json-module`

## Checklist

- [ ] Seed bajo `src/data/db/`
- [ ] JS de store bajo `src/js/db/`
- [ ] Módulo UI no reimplementa read/write store
- [ ] Sin API de escritura en Gulp
