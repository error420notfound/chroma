import type { CatalogueItem } from './catalogue';
export type Oklch = { l: number; c: number; h: number };
export type HueView = 'all' | 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue' | 'purple' | 'pink' | 'neutral';
export type SortMode = 'hue' | 'lightness' | 'saturation' | 'nameAsc' | 'nameDesc';
export const hueViews: { id: HueView; label: string; range?: [number, number] }[] = [
  { id: 'all', label: 'All colours' }, { id: 'red', label: 'Reds', range: [345, 15] }, { id: 'orange', label: 'Oranges', range: [15, 45] }, { id: 'yellow', label: 'Yellows', range: [45, 75] }, { id: 'green', label: 'Greens', range: [75, 165] }, { id: 'cyan', label: 'Cyans', range: [165, 195] }, { id: 'blue', label: 'Blues', range: [195, 255] }, { id: 'purple', label: 'Purples', range: [255, 300] }, { id: 'pink', label: 'Pinks', range: [300, 345] }, { id: 'neutral', label: 'Neutrals' },
];
export const harmonyModes = { none: [], monochromatic: [0], analogous: [-30, 30], complementary: [180], 'split-complementary': [150, 210], triadic: [120, 240], tetradic: [90, 180, 270], square: [90, 180, 270] } as const;
export type HarmonyMode = keyof typeof harmonyModes;
export function parseOklch(value: string): Oklch { const match = value.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.-]+)/i); return match ? { l: Number(match[1]), c: Number(match[2]), h: ((Number(match[3]) % 360) + 360) % 360 } : { l: 0, c: 0, h: 0 }; }
export function hueDistance(a: number, b: number) { const distance = Math.abs((((a - b) % 360) + 360) % 360); return Math.min(distance, 360 - distance); }
export function inHueView(item: CatalogueItem, view: HueView) { const { c, h } = parseOklch(item.oklch); if (view === 'all') return true; if (view === 'neutral') return c < 0.035; const range = hueViews.find((entry) => entry.id === view)?.range; if (!range || c < 0.035) return false; return range[0] <= range[1] ? h >= range[0] && h < range[1] : h >= range[0] || h < range[1]; }
export function harmonyHues(base: number, mode: HarmonyMode) { return harmonyModes[mode].map((offset) => ((base + offset) % 360 + 360) % 360); }
export function nearestColours(items: CatalogueItem[], target: number, limit = 1) { return [...items].filter((item) => parseOklch(item.oklch).c >= 0.035).sort((a, b) => hueDistance(parseOklch(a.oklch).h, target) - hueDistance(parseOklch(b.oklch).h, target)).slice(0, limit); }
export function sortColours(items: CatalogueItem[], mode: SortMode) { return [...items].sort((a, b) => { const ac = parseOklch(a.oklch); const bc = parseOklch(b.oklch); if (mode === 'hue') return ac.h - bc.h || ac.l - bc.l; if (mode === 'lightness') return ac.l - bc.l || ac.h - bc.h; if (mode === 'saturation') return ac.c - bc.c || ac.h - bc.h; return a.name.localeCompare(b.name) * (mode === 'nameDesc' ? -1 : 1); }); }
