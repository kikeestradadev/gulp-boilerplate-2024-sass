# Gulp Boilerplate 2024 — Sass

Scaffolding for static sites with Gulp 5, Pug, and Sass (Dart Sass).

**Demo (GitHub Pages):** [https://kikeestradadev.github.io/gulp-boilerplate-2024-sass/](https://kikeestradadev.github.io/gulp-boilerplate-2024-sass/)

## Stack

- HTML: Pug
- CSS: Sass (`src/scss/styles.scss` → `public/styles.css`)
- JS: ES modules bundled with esbuild
- Data: JSON in `src/data/` injected into Pug by Gulp
- Deploy: GitHub Pages (`gh-pages`)

## Requirements

- Node.js `>= 22.13.1` (see `.nvmrc`)
- npm (this repo uses `package-lock.json` — do not commit other lockfiles)

## Scripts

| Command          | Description                                 |
| ---------------- | ------------------------------------------- |
| `npm run dev`    | Dev server on port 3000 with live reload    |
| `npm run build`  | Bumps `assetVersion`, then production build |
| `npm run deploy` | Build + publish `public/` to GitHub Pages   |
| `npm run format` | Format with Prettier                        |

## Project layout

```
src/
  pug/
    pages/        site pages (index, …)
    style-guide/  style-guide page + specimens
    components/   shared UI modules
    config/       layout template
  scss/      styles.scss entry + core/ + modules/
  js/        entry + modules/
  data/      JSON for Pug (`{name}-data.json` → camelCase locals)
  assets/    static files → public/assets
  images/    images → public/images
  md/        markdown includes
public/      build output
```

## Notes

- Swiper is loaded from jsDelivr CDN in the layout template (not an npm dependency).
- Production builds minify HTML/CSS/JS and omit sourcemaps.
- Local CSS/JS use `?v=${assetVersion}` (bumping via `scripts/bump-assets.mjs` on `npm run build`).
- JS is bundled with esbuild (`scripts` task).
- Sass uses `@import` (no `@use`); breakpoints live in `src/scss/core/_breakpoints.scss`.
- Dev server is built-in: http://localhost:3000 with live reload.
