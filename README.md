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

Source data lives under `src/data/hue-scales/` and `src/data/engineered-hues/`. Each directory has an `index.json` manifest and individual records. The build validates every imported record with Zod; hue scales must contain exactly the eleven steps 50 through 950, and each colour stores HEX, OKLCH, Display-P3, and `textColor: "auto"`.

Replace the included starter records with the records from the catalogue source when available. Keep the manifests and update `src/lib/catalogue.ts` imports when adding a record so its schema is validated and it appears in the static catalogue.

## GitHub Pages deployment

The configured `origin` is `error420notfound/chroma`, so this project site is built for:

`https://error420notfound.github.io/chroma`

`astro.config.mjs` declares `site: 'https://error420notfound.github.io'` and `base: '/chroma'`. Keep internal routes and static assets base-aware through Astro’s `import.meta.env.BASE_URL`. If the repository owner or name changes, update these two values before deployment:

- Project site: `site: 'https://<owner>.github.io'`, `base: '/<repository>'`
- User or organization site (`<owner>.github.io`): use the same `site` and remove `base`

The workflow in `.github/workflows/deploy.yml` runs on pushes to `main` and manual dispatch, uses `npm ci`, checks and builds the site, uploads `dist`, then deploys through GitHub Pages Actions. Set this once in the repository: **Settings → Pages → Source → GitHub Actions**.
