import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const workerSource = new URL('./service-worker.js', import.meta.url);

export default function pwa() {
  let base;
  return {
    name: 'chroma-pwa',
    hooks: {
      'astro:config:done': ({ config }) => {
        base = `${config.base.replace(/\/$/, '')}/`;
      },
      'astro:build:done': async ({ dir }) => {
        const output = fileURLToPath(dir);
        const shellFiles = ['index.html', 'offline/index.html'];
        const assets = new Set();
        for (const file of shellFiles) {
          const html = await readFile(join(output, file), 'utf8');
          for (const match of html.matchAll(
            /(?:src|href|component-url|renderer-url)="([^"]+\.(?:js|css))"/g,
          )) {
            if (match[1].startsWith(base)) assets.add(match[1].slice(base.length));
          }
        }
        // Follow only the built shell's local module graph, including lazy imports.
        for (const file of assets) {
          if (!file.endsWith('.js')) continue;
          const source = await readFile(join(output, file), 'utf8');
          for (const match of source.matchAll(
            /(?:from\s*|import\s*(?:\(\s*)?)["'](\.[^"']+\.js)["']/g,
          )) {
            assets.add(posix.normalize(posix.join(dirname(file), match[1])));
          }
        }
        const files = [
          ...shellFiles,
          'manifest.webmanifest',
          'icons/chroma-192.png',
          'icons/chroma-512.png',
          'icons/chroma-maskable-512.png',
          'icons/apple-touch-icon.png',
          ...[...assets].sort(),
        ];
        const runtime = await readFile(workerSource, 'utf8');
        const hash = createHash('sha256').update(base).update(runtime);
        // Version every deployment change without precaching the whole catalogue.
        async function fingerprint(directory, prefix = '') {
          for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) =>
            a.name.localeCompare(b.name),
          )) {
            const relative = posix.join(prefix, entry.name);
            if (entry.isDirectory()) await fingerprint(join(directory, entry.name), relative);
            else if (relative !== 'sw.js')
              hash.update(relative).update(await readFile(join(directory, entry.name)));
          }
        }
        await fingerprint(output);
        const config = {
          version: hash.digest('hex').slice(0, 16),
          base,
          precache: await Promise.all(
            files.map(async (file) => ({
              url: `${base}${file === 'index.html' ? '' : file === 'offline/index.html' ? 'offline/' : file}`,
              revision: createHash('sha256')
                .update(await readFile(join(output, file)))
                .digest('hex'),
            })),
          ),
        };
        await writeFile(
          join(output, 'sw.js'),
          `const PWA = ${JSON.stringify(config)};\n${runtime}`,
        );
      },
    },
  };
}
