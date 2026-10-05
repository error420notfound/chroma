import { motionSeconds } from '../../lib/foundation';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useCatalogue } from '../../lib/useCatalogue';
import { gsap } from 'gsap';
import type { CatalogueItem } from '../../lib/catalogue';
import { contrastSurfaceStyle, inSRGB } from '../../lib/colour';
import { CopyButton } from '../colour/CopyButton';
import { Maximize2, X } from 'lucide-react';
import {
  harmonyHues,
  harmonyModes,
  hueDistance,
  hueViews,
  inHueView,
  nearestColours,
  parseOklch,
  sortColours,
  type HarmonyMode,
  type HueView,
  type SortMode,
} from '../../lib/catalogueFilters';

const sortOptions: [SortMode, string][] = [
  ['hue', 'Hue (A → Z)'],
  ['lightness', 'Lightness'],
  ['saturation', 'Saturation'],
  ['nameAsc', 'Name (A → Z)'],
  ['nameDesc', 'Name (Z → A)'],
];

function HueWheel({ hue, onChange }: { hue: number; onChange: (hue: number) => void }) {
  const angle = (hue * Math.PI) / 180;
  const update = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 240 - 120;
    const y = ((event.clientY - rect.top) / rect.height) * 240 - 120;
    if (Math.hypot(x, y) < 2) return;
    onChange(Math.round((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360);
  };
  return (
    <svg
      className="colour-wheel"
      viewBox="0 0 240 240"
      role="slider"
      tabIndex={0}
      aria-label="Base hue for harmony"
      aria-valuemin={0}
      aria-valuemax={359}
      aria-valuenow={hue}
      aria-valuetext={`${hue} degrees`}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        update(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) update(event);
      }}
      onKeyDown={(event) => {
        const offsets: Record<string, number> = {
          ArrowRight: 1,
          ArrowUp: 1,
          ArrowLeft: -1,
          ArrowDown: -1,
          PageUp: 10,
          PageDown: -10,
        };
        if (event.key in offsets) {
          event.preventDefault();
          onChange((hue + offsets[event.key] + 360) % 360);
        } else if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          onChange(event.key === 'Home' ? 0 : 359);
        }
      }}
    >
      <circle className="wheel-spectrum" cx={120} cy={120} r={120} />
      <circle
        className="wheel-marker-halo"
        cx={120 + Math.sin(angle) * 96}
        cy={120 - Math.cos(angle) * 96}
        r={9}
      />
      <circle
        className="wheel-marker"
        cx={120 + Math.sin(angle) * 96}
        cy={120 - Math.cos(angle) * 96}
        r={9}
      />
    </svg>
  );
}

function RangeRail({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: [number, number];
  max: number;
  onChange: (value: [number, number]) => void;
}) {
  const update = (index: number, next: number) => {
    if (!Number.isFinite(next)) return;
    const bounded = Math.max(0, Math.min(max, next));
    onChange(
      index === 0
        ? [Math.min(bounded, value[1]), value[1]]
        : [value[0], Math.max(bounded, value[0])],
    );
  };
  return (
    <details className="filter-rail range-rail">
      <summary>
        {label}
        <span className="rail-value">
          {value[0].toFixed(2)}–{value[1].toFixed(2)}
        </span>
      </summary>
      <div className="vertical-ranges">
        {value.map((current, index) => (
          <label key={index} className="vertical-range">
            <span>{index === 0 ? 'Min' : 'Max'}</span>
            <input
              type="range"
              aria-orientation="vertical"
              min={0}
              max={max}
              step={0.01}
              value={current}
              aria-label={`${label} ${index === 0 ? 'minimum' : 'maximum'}`}
              aria-valuetext={current.toFixed(2)}
              onChange={(event) => update(index, Number(event.target.value))}
            />
            <input
              className="range-number"
              type="number"
              min={0}
              max={max}
              step={0.01}
              value={current}
              aria-label={`${label} ${index === 0 ? 'minimum' : 'maximum'} value`}
              onChange={(event) => update(index, Number(event.target.value))}
            />
          </label>
        ))}
      </div>
    </details>
  );
}

export default function CatalogueBrowser({
  items: initialItems,
  base,
  status,
}: {
  items?: CatalogueItem[];
  base: string;
  status?: React.ReactNode;
}) {
  const { catalogueItems: remoteItems } = useCatalogue();
  const items = initialItems ?? remoteItems;
  const [selected, setSelected] = useState<CatalogueItem | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<HueView>('all');
  const [collection, setCollection] = useState('all');
  const [sort, setSort] = useState<SortMode>('hue');
  const [lightness, setLightness] = useState<[number, number]>([0, 1]);
  const [chroma, setChroma] = useState<[number, number]>([0, 0.4]);
  const [hue, setHue] = useState(210);
  const [hueOpen, setHueOpen] = useState(false);
  const [harmony, setHarmony] = useState<HarmonyMode>('none');
  const families = useMemo(
    () => [...new Set(items.map((item) => item.family).filter(Boolean))],
    [items],
  );
  const chipColours = useMemo(
    () =>
      Object.fromEntries(
        hueViews
          .filter((entry) => entry.id !== 'all')
          .map((entry) => {
            const candidates = items.filter((item) => inHueView(item, entry.id));
            const representative = candidates.toSorted(
              (a, b) =>
                Math.abs(parseOklch(a.oklch).l - 0.6) - Math.abs(parseOklch(b.oklch).l - 0.6),
            )[0];
            return [entry.id, representative?.hex];
          }),
      ),
    [items],
  );
  const visible = useMemo(
    () =>
      sortColours(
        items.filter((item) => {
          const colour = parseOklch(item.oklch);
          return (
            inHueView(item, view) &&
            (collection === 'all' || collection === item.type || collection === item.family) &&
            colour.l >= lightness[0] &&
            colour.l <= lightness[1] &&
            colour.c >= chroma[0] &&
            colour.c <= chroma[1] &&
            (harmony === 'none' || hueDistance(colour.h, hue) <= 34)
          );
        }),
        sort,
      ),
    [items, view, collection, sort, lightness, chroma, harmony, hue],
  );
  const palette = harmonyHues(hue, harmony).flatMap((target) => nearestColours(items, target));
  const reset = () => {
    setView('all');
    setCollection('all');
    setSort('hue');
    setLightness([0, 1]);
    setChroma([0, 0.4]);
    setHarmony('none');
    setHue(210);
  };
  useLayoutEffect(() => {
    if (
      !selected ||
      !modalRef.current ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    const context = gsap.context(() => {
      gsap.fromTo(
        modalRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: motionSeconds('fast') },
      );
      gsap.fromTo(
        '.engineered-modal-card',
        { y: 24, scale: 0.98 },
        { y: 0, scale: 1, duration: motionSeconds('standard'), ease: 'power3.out' },
      );
    }, modalRef);
    return () => context.revert();
  }, [selected]);
  const changeHue = (next: number) => {
    if (Number.isFinite(next)) setHue(Math.max(0, Math.min(359, Math.round(next))));
  };
  return (
    <div className="catalogue-browser">
      <div className="catalogue-controls">
        <section className="view-section" aria-labelledby="view-heading">
          <h2 id="view-heading" className="eyebrow">
            View
          </h2>
          <div className="view-chips">
            {hueViews
              .filter((entry) => entry.id !== 'all')
              .map((entry) => (
                <button
                  type="button"
                  className="view-chip"
                  key={entry.id}
                  aria-pressed={view === entry.id}
                  onClick={() => setView(view === entry.id ? 'all' : entry.id)}
                >
                  <span
                    className="colour-dot"
                    aria-hidden="true"
                    style={{ background: chipColours[entry.id] ?? 'var(--muted)' }}
                  />
                  {entry.label}
                </button>
              ))}
          </div>
        </section>
        <section className="filters-section" aria-labelledby="filters-heading">
          <h2 id="filters-heading" className="eyebrow">
            Filters
          </h2>
          <div className="filter-rails">
            <div className="filter-rail hue-rail" data-open={hueOpen}>
              <div className="hue-rail-header">
                <button
                  type="button"
                  className="hue-disclosure"
                  aria-expanded={hueOpen}
                  aria-controls="hue-wheel-panel"
                  onClick={() => setHueOpen(!hueOpen)}
                >
                  <span aria-hidden="true">{hueOpen ? '▾' : '▸'}</span> Hue
                </button>
                <span
                  className="colour-dot"
                  aria-hidden="true"
                  style={{ background: nearestColours(items, hue)[0]?.hex ?? 'var(--blue)' }}
                />
                <div className="hue-stepper">
                  <button
                    type="button"
                    aria-label="Decrease hue"
                    onClick={() => changeHue((hue + 359) % 360)}
                  >
                    −
                  </button>
                  <input
                    id="filter-hue"
                    type="number"
                    min={0}
                    max={359}
                    step={1}
                    value={hue}
                    aria-label="Base hue in degrees for harmony"
                    onChange={(event) => changeHue(Number(event.target.value))}
                  />
                  <button
                    type="button"
                    aria-label="Increase hue"
                    onClick={() => changeHue((hue + 1) % 360)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div id="hue-wheel-panel" className="hue-wheel-panel" hidden={!hueOpen}>
                <HueWheel hue={hue} onChange={changeHue} />
              </div>
            </div>
            <RangeRail label="Saturation" value={chroma} max={0.4} onChange={setChroma} />
            <RangeRail label="Lightness" value={lightness} max={1} onChange={setLightness} />
            <details className="filter-rail more-rail">
              <summary>More filters</summary>
              <div className="more-filter-controls">
                <label>
                  Collection
                  <select
                    className="select"
                    value={collection}
                    onChange={(event) => setCollection(event.target.value)}
                  >
                    <option value="all">All collections</option>
                    <option value="scale">Hue scales</option>
                    <option value="engineered">Engineered hues</option>
                    {families.map((family) => (
                      <option key={family} value={family}>
                        {family}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Sort
                  <select
                    className="select"
                    value={sort}
                    onChange={(event) => setSort(event.target.value as SortMode)}
                  >
                    {sortOptions.map(([id, label]) => (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Harmony
                  <select
                    className="select"
                    value={harmony}
                    onChange={(event) => setHarmony(event.target.value as HarmonyMode)}
                  >
                    {Object.keys(harmonyModes).map((mode) => (
                      <option key={mode} value={mode}>
                        {mode === 'none' ? 'None' : mode}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </details>
            <button className="filter-reset" type="button" onClick={reset}>
              Reset
            </button>
          </div>
        </section>
      </div>
      <section className="catalogue-results">
        {status}
        {harmony !== 'none' && (
          <div className="palette-panel">
            <div className="toolbar">
              <span className="eyebrow">{harmony} palette</span>
              <span className="hex">Base hue {Math.round(hue)}°</span>
            </div>
            <div className="palette-swatches">
              {palette.map((item) => (
                <div
                  className="palette-swatch contrast-surface"
                  key={item.id}
                  style={contrastSurfaceStyle(item.hex)}
                >
                  <strong className="colour-name">
                    <span
                      className="colour-dot"
                      aria-hidden="true"
                      style={{ background: item.hex }}
                    />
                    {item.name}
                  </strong>
                  <span>{item.hex}</span>
                  <small>Harmony colour</small>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="toolbar result-toolbar">
          <span className="eyebrow" role="status">
            {visible.length} colours found
          </span>
          <span className="hex">sRGB and P3 metadata</span>
        </div>
        <div className="catalogue-grid">
          {visible.map((item) => (
            <article className="catalogue-cell" key={item.id}>
              <a
                href={`${base}/${item.type === 'scale' ? 'scales/view' : 'engineered/view'}?slug=${encodeURIComponent(item.slug)}`}
                onClick={(event) => {
                  if (!(event.target as HTMLElement).closest('.fullscreen-trigger')) {
                    event.preventDefault();
                    setSelected(item);
                  }
                }}
              >
                <div className="swatch contrast-surface" style={contrastSurfaceStyle(item.hex)}>
                  <button
                    className="fullscreen-trigger"
                    type="button"
                    aria-label={`View ${item.name} fullscreen`}
                  >
                    <Maximize2 size={16} />
                  </button>
                  <span className="swatch-sample">Aa</span>
                </div>
              </a>
              <div className="meta">
                <span>
                  <strong>{item.name}</strong>
                  <br />
                  <span className="hex">
                    {item.hex}
                    {item.type === 'scale' ? ` / ${item.step}` : ''}
                    {!inSRGB(item.p3) ? ' · P3' : ''}
                  </span>
                </span>
                <CopyButton value={item.hex} label="Copy" />
              </div>
            </article>
          ))}
        </div>
        {!visible.length && <p className="notice">No catalogue records match those filters.</p>}
      </section>
      {selected && (
        <div
          className="engineered-modal"
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${selected.name} detail`}
          onClick={(event) => event.target === event.currentTarget && setSelected(null)}
        >
          <section className="engineered-modal-card">
            <button
              className="modal-close"
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close colour detail"
            >
              <X size={20} />
            </button>
            <div
              className="swatch contrast-surface"
              style={contrastSurfaceStyle(selected.hex, { minHeight: 280 })}
            >
              <button
                className="fullscreen-trigger"
                type="button"
                aria-label={`View ${selected.name} fullscreen`}
              >
                <Maximize2 size={18} />
              </button>
              <span style={{ fontSize: 84 }}>Aa</span>
              <strong>{selected.hex}</strong>
            </div>
            <div className="engineered-modal-copy">
              <div className="eyebrow">
                {selected.type === 'scale'
                  ? `${selected.family ?? 'Hue'} scale${selected.step ? ` · ${selected.step}` : ''}`
                  : 'Engineered hue'}
              </div>
              <h2>{selected.name}</h2>
              <p>{selected.description}</p>
              <p className="hex">{selected.oklch}</p>
              <p className="hex">{selected.p3}</p>
              <div className="toolbar">
                <a
                  className="button"
                  href={`${base}/${selected.type === 'scale' ? 'scales/view' : 'engineered/view'}?slug=${encodeURIComponent(selected.slug)}`}
                >
                  Open full page
                </a>
                <button className="button primary" type="button" onClick={() => setSelected(null)}>
                  Done
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
