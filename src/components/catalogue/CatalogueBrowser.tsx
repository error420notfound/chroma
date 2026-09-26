import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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

function ColourWheel({
  hue,
  chroma,
  lightness,
  harmony,
  onChange,
}: {
  hue: number;
  chroma: number;
  lightness: number;
  harmony: HarmonyMode;
  onChange: (hue: number, chroma: number) => void;
}) {
  const size = 240;
  const center = size / 2;
  const radius = 96;
  const point = (angle: number, distance = radius) => ({
    x: center + Math.cos(((angle - 90) * Math.PI) / 180) * distance,
    y: center + Math.sin(((angle - 90) * Math.PI) / 180) * distance,
  });
  const update = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - center;
    const y = event.clientY - rect.top - center;
    onChange(
      ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360,
      Math.min(0.4, (Math.hypot(x, y) / radius) * 0.4),
    );
  };
  const marker = point(hue, Math.max(8, (chroma / 0.4) * radius));
  return (
    <div className="colour-wheel-wrap">
      <svg
        className="colour-wheel"
        viewBox={`0 0 ${size} ${size}`}
        aria-label="Interactive colour wheel"
        role="img"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          update(event);
        }}
        onPointerMove={(event) => event.buttons && update(event)}
      >
        <defs>
          <radialGradient id="wheel-core">
            <stop stopColor="white" />
            <stop offset="1" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle className="wheel-spectrum" cx={center} cy={center} r={radius} />
        <circle cx={center} cy={center} r={radius} fill="url(#wheel-core)" />
        {harmonyHues(hue, harmony).map((angle) => {
          const p = point(angle);
          return <circle key={angle} className="harmony-handle" cx={p.x} cy={p.y} r="6" />;
        })}
        <circle className="wheel-marker" cx={marker.x} cy={marker.y} r="9" />
      </svg>
      <div className="wheel-readout">
        <span style={{ background: `oklch(${lightness} ${chroma} ${hue})` }} />
        <label>
          Hue{' '}
          <input
            type="number"
            min="0"
            max="359"
            value={Math.round(hue)}
            onChange={(e) => onChange(Number(e.target.value), chroma)}
          />
        </label>
      </div>
    </div>
  );
}

export default function CatalogueBrowser({
  items,
  base,
}: {
  items: CatalogueItem[];
  base: string;
}) {
  const [selected, setSelected] = useState<CatalogueItem | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<HueView>('all');
  const [collection, setCollection] = useState('all');
  const [sort, setSort] = useState<SortMode>('hue');
  const [lightness, setLightness] = useState<[number, number]>([0, 1]);
  const [chroma, setChroma] = useState<[number, number]>([0, 0.4]);
  const [hue, setHue] = useState(210);
  const [wheelChroma, setWheelChroma] = useState(0.16);
  const [lightnessValue] = useState(0.65);
  const [harmony, setHarmony] = useState<HarmonyMode>('none');
  const [open, setOpen] = useState('');
  const families = useMemo(
    () => [...new Set(items.map((item) => item.family).filter(Boolean))],
    [items],
  );
  const counts = useMemo(
    () =>
      Object.fromEntries(
        hueViews.map((entry) => [
          entry.id,
          items.filter((item) => inHueView(item, entry.id)).length,
        ]),
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
  useEffect(() => {
    /* Controls remain available while scrolling; no direction-based hiding. */
  }, []);
  const reset = () => {
    setView('all');
    setCollection('all');
    setSort('hue');
    setLightness([0, 1]);
    setChroma([0, 0.4]);
    setHarmony('none');
  };
  useEffect(() => {
    const handler = (event: Event) => {
      const link = (event.target as HTMLElement).closest('.catalogue-cell > a');
      if (!link) return;
      const name = link
        .closest('.catalogue-cell')
        ?.querySelector('.meta strong')
        ?.textContent?.trim();
      const item = items.find((entry) => entry.name === name);
      if (item) {
        event.preventDefault();
        setSelected(item);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [items]);
  useLayoutEffect(() => {
    if (!selected || !modalRef.current) return;
    const context = gsap.context(() => {
      gsap.fromTo(modalRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18 });
      gsap.fromTo(
        '.engineered-modal-card',
        { y: 24, scale: 0.98 },
        { y: 0, scale: 1, duration: 0.3, ease: 'power3.out' },
      );
    }, modalRef);
    return () => context.revert();
  }, [selected]);
  const disclosure = (id: string, label: string, children: React.ReactNode) => (
    <>
      <button className="filter-disclosure" onClick={() => setOpen(open === id ? '' : id)}>
        {label}
        <span>⌄</span>
      </button>
      {open === id && <div className="filter-content">{children}</div>}
    </>
  );
  const controls = (
    <>
      <div className="filter-section">
        <h3>View</h3>
        {hueViews.map((entry) => (
          <button
            className={view === entry.id ? 'filter-choice active' : 'filter-choice'}
            key={entry.id}
            onClick={() => setView(entry.id)}
          >
            <span>{entry.label}</span>
            <small>{counts[entry.id]}</small>
          </button>
        ))}
      </div>
      <div className="filter-section">
        <h3>Filter</h3>
        {disclosure(
          'hue',
          'Hue',
          <>
            <ColourWheel
              hue={hue}
              chroma={wheelChroma}
              lightness={lightnessValue}
              harmony={harmony}
              onChange={(nextHue, nextChroma) => {
                setHue(nextHue);
                setWheelChroma(nextChroma);
                setView('all');
              }}
            />
            <select
              className="select"
              value={harmony}
              onChange={(e) => setHarmony(e.target.value as HarmonyMode)}
            >
              {Object.keys(harmonyModes).map((mode) => (
                <option key={mode} value={mode}>
                  {mode === 'none' ? 'Nearest hues only' : mode}
                </option>
              ))}
            </select>
          </>,
        )}
        {disclosure(
          'lightness',
          'Lightness',
          <div className="range-pair">
            <input
              type="range"
              min="0"
              max="1"
              step=".01"
              value={lightness[0]}
              onChange={(e) => setLightness([+e.target.value, lightness[1]])}
            />
            <input
              type="range"
              min="0"
              max="1"
              step=".01"
              value={lightness[1]}
              onChange={(e) => setLightness([lightness[0], +e.target.value])}
            />
          </div>,
        )}
        {disclosure(
          'chroma',
          'Saturation',
          <div className="range-pair">
            <input
              type="range"
              min="0"
              max=".4"
              step=".01"
              value={chroma[0]}
              onChange={(e) => setChroma([+e.target.value, chroma[1]])}
            />
            <input
              type="range"
              min="0"
              max=".4"
              step=".01"
              value={chroma[1]}
              onChange={(e) => setChroma([chroma[0], +e.target.value])}
            />
          </div>,
        )}
        {disclosure(
          'collection',
          'Collection',
          <select
            className="select"
            value={collection}
            onChange={(e) => setCollection(e.target.value)}
          >
            <option value="all">All collections</option>
            <option value="scale">Hue scales</option>
            <option value="engineered">Engineered hues</option>
            {families.map((family) => (
              <option key={family} value={family}>
                {family}
              </option>
            ))}
          </select>,
        )}
      </div>
      <div className="filter-section">
        <h3>Sort</h3>
        {sortOptions.map(([id, label]) => (
          <label className="sort-choice" key={id}>
            <input type="radio" checked={sort === id} onChange={() => setSort(id)} />
            {label}
          </label>
        ))}
      </div>
      <button className="reset-filter" onClick={reset}>
        Reset
      </button>
    </>
  );
  return (
    <div className="catalogue-browser">
      <aside className="rail">{controls}</aside>
      <div className="mobile-filter-bar">
        <label>
          View{' '}
          <select value={view} onChange={(e) => setView(e.target.value as HueView)}>
            {hueViews.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Collection{' '}
          <select value={collection} onChange={(e) => setCollection(e.target.value)}>
            <option value="all">All</option>
            <option value="scale">Scales</option>
            <option value="engineered">Engineered</option>
          </select>
        </label>
        <label>
          Sort{' '}
          <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)}>
            {sortOptions.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button onClick={() => setOpen(open === 'hue' ? '' : 'hue')} aria-expanded={open === 'hue'}>
          Colour wheel
        </button>
      </div>
      <section className="catalogue-results">
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
                  <strong>{item.name}</strong>
                  <span>{item.hex}</span>
                  <small>Harmony colour</small>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="toolbar result-toolbar">
          <span className="eyebrow">{visible.length} colours found</span>
          <span className="hex">sRGB and P3 metadata</span>
        </div>
        <div className="catalogue-grid">
          {visible.map((item) => (
            <article className="catalogue-cell" key={item.id}>
              <a href={`${base}/${item.type === 'scale' ? 'scales' : 'engineered'}/${item.slug}`}>
                <div
                  className="swatch contrast-surface"
                  style={contrastSurfaceStyle(item.hex)}
                >
                  <button className="fullscreen-trigger" type="button" aria-label={`View ${item.name} fullscreen`}>
                    <Maximize2 size={16} />
                  </button>
                  <span style={{ fontSize: 30, fontWeight: 650 }}>Aa</span>
                  <span className="hex" style={{ color: 'inherit', opacity: 0.74 }}>
                    {item.type === 'scale' ? item.step : 'engineered'}
                  </span>
                </div>
              </a>
              <div className="meta">
                <span>
                  <strong>{item.name}</strong>
                  <br />
                  <span className="hex">
                    {item.hex}
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
            <button className="modal-close" type="button" onClick={() => setSelected(null)} aria-label="Close colour detail"><X size={20} /></button>
            <div className="swatch contrast-surface" style={contrastSurfaceStyle(selected.hex, { minHeight: 280 })}>
              <button className="fullscreen-trigger" type="button" aria-label={`View ${selected.name} fullscreen`}><Maximize2 size={18} /></button>
              <span style={{ fontSize: 84 }}>Aa</span><strong>{selected.hex}</strong>
            </div>
            <div className="engineered-modal-copy">
              <div className="eyebrow">{selected.type === 'scale' ? `${selected.family ?? 'Hue'} scale${selected.step ? ` · ${selected.step}` : ''}` : 'Engineered hue'}</div>
              <h2>{selected.name}</h2><p>{selected.description}</p>
              <p className="hex">{selected.oklch}</p><p className="hex">{selected.p3}</p>
              <div className="toolbar">
                <a className="button" href={`${base}/${selected.type === 'scale' ? 'scales' : 'engineered'}/${selected.slug}`}>Open full page</a>
                <button className="button primary" type="button" onClick={() => setSelected(null)}>Done</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
