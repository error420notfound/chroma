import Color from 'colorjs.io';
import { z } from 'zod';
import { catalogueItems as snapshotItems, engineeredHues as snapshotEngineered, hueScales as snapshotScales } from './catalogue';
import type { CatalogueItem, EngineeredHue, HueScale } from './catalogue';

const root = 'https://raw.githubusercontent.com/error420notfound/chroma-catalogue/main/data';
const colour = z.object({ hex: z.string().regex(/^#[0-9a-f]{6}$/i), oklch: z.object({ l: z.number(), c: z.number(), h: z.number(), alpha: z.number().optional() }), displayP3: z.object({ r: z.number(), g: z.number(), b: z.number(), alpha: z.number().optional() }).optional() });
const presentation = z.object({ displayOpacity: z.number().optional(), textColor: z.unknown().optional() });
const step = z.object({ step: z.number().int(), label: z.string().optional(), color: colour }).extend(presentation.shape);
const scale = z.object({ id: z.string(), type: z.literal('scale'), name: z.string(), slug: z.string(), description: z.string().optional(), tags: z.array(z.string()).optional(), steps: z.array(step).min(1), referenceColors: z.array(z.object({ id: z.string(), label: z.string(), color: colour })).optional(), contrastExamples: z.array(z.object({ id: z.string(), label: z.string(), foreground: colour, background: colour, sampleText: z.string().optional() })).optional() });
const hue = z.object({ id: z.string(), type: z.literal('engineered'), name: z.string(), slug: z.string(), description: z.string().optional(), tags: z.array(z.string()).optional(), color: colour, relatedScaleId: z.string().optional() }).extend(presentation.shape);
const rootIndex = z.object({ scales: z.object({ index: z.string() }), engineered: z.object({ index: z.string() }) });
const indexEntry = z.object({ id: z.string(), slug: z.string(), file: z.string() });
const sectionIndex = z.object({ scales: z.array(indexEntry).optional(), hues: z.array(indexEntry).optional() });
export type RemoteCatalogue = { hueScales: HueScale[]; engineeredHues: EngineeredHue[]; catalogueItems: CatalogueItem[]; source: 'remote' | 'cache' | 'snapshot' };
const CACHE_KEY = 'chroma.catalogue.cache.v1';
const displayColour = (value: z.infer<typeof colour>) => {
  const p3 = value.displayP3 ?? (() => { const c = new Color(value.hex).to('p3'); return { r: c.coords[0], g: c.coords[1], b: c.coords[2] }; })();
  return { hex: value.hex, oklch: `oklch(${value.oklch.l} ${value.oklch.c} ${value.oklch.h})`, p3: `color(display-p3 ${p3.r} ${p3.g} ${p3.b})`, textColor: 'auto' as const };
};
function adapt(scales: z.infer<typeof scale>[], hues: z.infer<typeof hue>[], source: RemoteCatalogue['source']): RemoteCatalogue {
  const hueScales: HueScale[] = scales.map((record) => ({ id: record.id, slug: record.slug, name: record.name, family: record.name.split(/\s+/)[0] ?? 'Mixed', description: record.description ?? '', tags: record.tags ?? [], steps: record.steps.map((entry) => ({ ...displayColour(entry.color), step: entry.step, label: entry.label ?? String(entry.step) })), referenceColors: record.referenceColors?.map((entry) => ({ name: entry.label, hex: entry.color.hex })), contrastExamples: record.contrastExamples?.map((entry) => ({ foreground: entry.foreground.hex, background: entry.background.hex, label: entry.label })) }));
  const engineeredHues: EngineeredHue[] = hues.map((record) => ({ ...displayColour(record.color), id: record.id, slug: record.slug, name: record.name, description: record.description ?? '', tags: record.tags ?? [], ...(record.relatedScaleId ? { relatedScaleId: record.relatedScaleId } : {}) }));
  const catalogueItems: CatalogueItem[] = [...hueScales.flatMap((s) => s.steps.map((entry) => ({ ...entry, id: `${s.id}-${entry.step}`, slug: s.slug, name: s.name, description: s.description, tags: s.tags, family: s.family, type: 'scale' as const }))), ...engineeredHues.map((entry) => ({ ...entry, type: 'engineered' as const }))];
  return { hueScales, engineeredHues, catalogueItems, source };
}
export const snapshotCatalogue: RemoteCatalogue = { hueScales: snapshotScales, engineeredHues: snapshotEngineered, catalogueItems: snapshotItems, source: 'snapshot' };
let pending: Promise<RemoteCatalogue> | undefined;
async function getJson(url: string): Promise<unknown> {
  const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Catalogue request failed (${response.status})`);
  return response.json();
}
async function loadRemote(): Promise<RemoteCatalogue> {
  const doc = rootIndex.parse(await getJson(`${root}/index.json`));
  const [scaleDoc, hueDoc] = await Promise.all([getJson(new URL(doc.scales.index, `${root}/index.json`).href), getJson(new URL(doc.engineered.index, `${root}/index.json`).href)]);
  const scaleFiles = sectionIndex.parse(scaleDoc).scales ?? []; const hueFiles = sectionIndex.parse(hueDoc).hues ?? [];
  const [scales, hues] = await Promise.all([
    Promise.all(scaleFiles.map(async (entry) => { const record = scale.parse(await getJson(new URL(entry.file, `${root}/scales/index.json`).href)); if (record.id !== entry.id || record.slug !== entry.slug) throw new Error(`Scale index mismatch for ${entry.file}`); return record; })),
    Promise.all(hueFiles.map(async (entry) => { const record = hue.parse(await getJson(new URL(entry.file, `${root}/engineered/index.json`).href)); if (record.id !== entry.id || record.slug !== entry.slug) throw new Error(`Hue index mismatch for ${entry.file}`); return record; })),
  ]);
  return adapt(scales, hues, 'remote');
}
export function loadCatalogue(): Promise<RemoteCatalogue> {
  if (!pending) pending = loadRemote().then((data) => { try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* Continue with the in-memory catalogue if storage is unavailable. */ } return data; }).catch(() => {
    try { const saved = localStorage.getItem(CACHE_KEY); if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed.catalogueItems) && Array.isArray(parsed.hueScales) && Array.isArray(parsed.engineeredHues)) return { ...parsed, source: 'cache' as const }; } } catch { /* Ignore malformed or unavailable browser storage. */ }
    return snapshotCatalogue;
  });
  return pending;
}
