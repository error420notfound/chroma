# Chroma

Chroma is HS108’s static, studio-grade colour catalogue. It uses Astro static output, React islands for the interactive tools, local JSON catalogue records, Color.js, and browser `localStorage` only.

## Requirements

- Node.js 24.21.0 or newer (`.nvmrc` pins the development version)
- npm

## Local development

```sh
npm install
npm run dev
```

Other useful commands:

```sh
npm run check
npm run lint
npm run format:check
npm run build
npm run preview
```

`npm run build` writes only static files to `dist/`; no server adapter, database, or API routes are used.

## Catalogue data

The published source of truth is `error420notfound/chroma-catalogue`, on its `main` branch. Chroma fetches `data/index.json`, the scale and engineered-hue indexes, and the JSON records referenced by those indexes when a page loads. The browser validates each document and adapts optional catalogue fields for Chroma's colour tools. Refresh a page to see published edits, additions, and removals; an already open page does not poll for updates. GitHub's file delivery cache may delay a published change briefly.

When the live source cannot be reached, Chroma uses the last successful catalogue saved in that browser. A new browser profile falls back to the JSON snapshot under `src/data/`. Treat that snapshot as an offline fallback only; edit catalogue records and indexes in `chroma-catalogue`. New record links use shared pages such as `/chroma/scales/view?slug=amber` and `/chroma/engineered/view?slug=acid-green`, so new entries do not require a Chroma build.

Comparison selections and gradient drafts remain in this browser's versioned local storage. Removed catalogue IDs are ignored by comparison tools, while existing gradient stops retain their saved colour values.

## GitHub Pages deployment

The configured `origin` is `error420notfound/chroma`, so this project site is built for:

`https://error420notfound.github.io/chroma`

`astro.config.mjs` declares `site: 'https://error420notfound.github.io'` and `base: '/chroma'`. Keep internal routes and static assets base-aware through Astro’s `import.meta.env.BASE_URL`. If the repository owner or name changes, update these two values before deployment:

- Project site: `site: 'https://<owner>.github.io'`, `base: '/<repository>'`
- User or organization site (`<owner>.github.io`): use the same `site` and remove `base`

The workflow in `.github/workflows/deploy.yml` runs on pushes to `main` and manual dispatch, uses `npm ci`, checks and builds the site, uploads `dist`, then deploys through GitHub Pages Actions. Set this once in the repository: **Settings → Pages → Source → GitHub Actions**.
