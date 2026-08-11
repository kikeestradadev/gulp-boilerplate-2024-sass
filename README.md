# Gulp Boilerplate 2024 — Tailwind CSS 4

Scaffolding for static sites with Gulp 5, Pug, and Tailwind CSS 4.

**Demo (GitHub Pages):** [https://kikeestradadev.github.io/gulp-boilerplate-2024-tailwind-4/](https://kikeestradadev.github.io/gulp-boilerplate-2024-tailwind-4/)

## Stack

- HTML: Pug
- CSS: Tailwind CSS 4 (CSS-first via `@import "tailwindcss"`)
- JS: ES modules bundled with esbuild
- Deploy: GitHub Pages (`gh-pages`)

## Requirements

- Node.js `>= 22.13.1` (see `.nvmrc`)
- npm (this repo uses `package-lock.json` — do not commit other lockfiles)

## Scripts

| Command          | Description                               |
| ---------------- | ----------------------------------------- |
| `npm run dev`    | Dev server on port 3000 with live reload  |
| `npm run build`  | Bumps `assetVersion`, then production build |
| `npm run deploy` | Build + publish `public/` to GitHub Pages |
| `npm run format` | Format with Prettier                      |

## Project layout

```
src/
  pug/       templates & components
  styles/    styles.css entry (Tailwind 4)
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
- JS is bundled with esbuild (`scripts` task ~10 ms).
- `npm audit` should report 0 vulnerabilities (overrides pin `markdown-it` / `linkify-it`).
- Dev server is built-in (no BrowserSync): http://localhost:3000 with live reload.
