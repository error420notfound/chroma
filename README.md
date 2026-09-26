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

The active catalogue source of truth is the individual JSON records under `src/data/hue-scales/source/` and `src/data/engineered-hues/source/`. `src/lib/catalogue.ts` imports those records and validates them with Zod during the build; hue scales must contain exactly eleven steps, and each colour stores HEX, OKLCH, Display-P3, and `textColor: "auto"`. The root-level JSON files in each data directory and the `source/index.json` manifests are currently not read by the build. Treat them as legacy snapshots/manifests and do not edit them as active records; add new catalogue content under `source/` so validation includes it.

Browser-only comparison selections and gradient drafts use versioned `chroma:` local-storage keys. They are scoped to this browser profile, can be cleared from each workspace, and do not sync across devices. Invalid or obsolete values return to safe defaults. Shared comparison selections travel in the `ids` URL parameter; invalid catalogue IDs are discarded.

## GitHub Pages deployment

The configured `origin` is `error420notfound/chroma`, so this project site is built for:

`https://error420notfound.github.io/chroma`

`astro.config.mjs` declares `site: 'https://error420notfound.github.io'` and `base: '/chroma'`. Keep internal routes and static assets base-aware through Astro’s `import.meta.env.BASE_URL`. If the repository owner or name changes, update these two values before deployment:

- Project site: `site: 'https://<owner>.github.io'`, `base: '/<repository>'`
- User or organization site (`<owner>.github.io`): use the same `site` and remove `base`

The workflow in `.github/workflows/deploy.yml` runs on pushes to `main` and manual dispatch, uses `npm ci`, checks and builds the site, uploads `dist`, then deploys through GitHub Pages Actions. Set this once in the repository: **Settings → Pages → Source → GitHub Actions**.
