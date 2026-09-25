import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { CatalogueItem } from '../../lib/catalogue';
import { fallbackSRGB, inSRGB } from '../../lib/colour';
import { gradientCss, type GradientStop } from '../../lib/gradients';
import { readStored, saveStored } from '../../lib/storage';
import { CopyButton } from '../colour/CopyButton';
import { Maximize2 } from 'lucide-react';
const id = () => Math.random().toString(36).slice(2);
export default function GradientBuilder({ items }: { items: CatalogueItem[] }) {
  const fallback: GradientStop[] = [
    { id: id(), color: items[4].hex, position: 0, name: items[4].name },
    {
      id: id(),
      color: items[items.length - 1].hex,
      position: 100,
      name: items[items.length - 1].name,
    },
  ];
  const [stops, setStops] = useState<GradientStop[]>(() =>
    readStored('chroma.gradient.v1', fallback),
  );
  const [space, setSpace] = useState('oklch');
  const [direction, setDirection] = useState('shorter hue');
  const [playing, setPlaying] = useState(true);
  const [catalogueQuery, setCatalogueQuery] = useState('');
  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => saveStored('chroma.gradient.v1', stops), [stops]);
  const css = useMemo(() => gradientCss(stops, space), [stops, space]);
  const hasP3 = stops.some((stop) => !inSRGB(stop.color));
  const catalogueMatches = useMemo(() => {
    const query = catalogueQuery.trim().toLowerCase();
    if (!query) return items.slice(0, 6);
    return items.filter((item) => `${item.name} ${item.hex} ${item.tags.join(' ')}`.toLowerCase().includes(query)).slice(0, 8);
  }, [catalogueQuery, items]);
  useLayoutEffect(() => {
    const element = trackRef.current;
    if (!element) return;
    const context = gsap.context(() => {
      gsap.fromTo(element, { yPercent: 0 }, { yPercent: -50, duration: 4.5, ease: 'none', repeat: -1, paused: !playing });
    }, element);
    return () => context.revert();
  }, [css, playing]);
  const addStop = (item: CatalogueItem) => {
    if (stops.length < 8) {
      setStops([...stops, { id: id(), color: item.hex, position: 50, name: item.name }]);
      setCatalogueQuery('');
    }
  };
  return (
    <div className="tool-grid">
      <section className="panel" style={{ gridColumn: '1 / -1' }}>
        <div className="swatch gradient-preview" data-gradient-animation={playing ? 'playing' : 'paused'} style={{ minHeight: 210, color: '#fff' }}>
          <button className="fullscreen-trigger" type="button" aria-label="View gradient fullscreen"><Maximize2 size={16} /></button>
          <div ref={trackRef} className="gradient-track" aria-hidden="true">
            <div className="gradient-frame" style={{ background: css }} />
            <div className="gradient-frame" style={{ background: css }} />
          </div>
          <div className="gradient-content">
            <span className="eyebrow" style={{ color: 'inherit' }}>
              Live linear gradient
            </span>
            <strong style={{ fontSize: 36 }}>Colour in motion</strong>
          </div>
        </div>
        <div className="meta gradient-actions">
          <span
            className="hex"
            style={{ maxWidth: '75%', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {css}
          </span>
          <CopyButton value={css} label="Copy CSS" />
          <button className="button" type="button" onClick={() => setPlaying((value) => !value)}>
            {playing ? 'Pause animation' : 'Play animation'}
          </button>
        </div>
      </section>
      <section className="panel">
        <h2>Interpolation</h2>
        <p>Preview the same catalogue stops in different working spaces.</p>
        <label className="eyebrow" htmlFor="space">
          Colour space
        </label>
        <select
          id="space"
          className="select"
          value={space}
          onChange={(e) => setSpace(e.target.value)}
          style={{ width: '100%', marginTop: 7 }}
        >
          <option value="srgb">sRGB</option>
          <option value="oklch">OKLCH</option>
          <option value="display-p3">Display-P3</option>
        </select>
        {space === 'oklch' && (
          <>
            <label
              className="eyebrow"
              htmlFor="direction"
              style={{ display: 'block', marginTop: 16 }}
            >
              Hue direction
            </label>
            <select
              id="direction"
              className="select"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              style={{ width: '100%', marginTop: 7 }}
            >
              <option>shorter hue</option>
              <option>longer hue</option>
              <option>increasing hue</option>
              <option>decreasing hue</option>
            </select>
          </>
        )}
        {hasP3 && (
          <p className="notice">
            One or more stops exceed sRGB. Fallback: {fallbackSRGB(stops[0].color)}.
          </p>
        )}
      </section>
      <section className="panel gradient-stops-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="meta">
          <h2>Stops</h2>
        </div>
        <div className="catalogue-stop-picker">
          <label className="eyebrow" htmlFor="catalogue-stop-search">Add a catalogue hue</label>
          <input id="catalogue-stop-search" className="input" value={catalogueQuery} onChange={(event) => setCatalogueQuery(event.target.value)} placeholder="Search by name, tag, or HEX" disabled={stops.length >= 8} />
          <div className="catalogue-stop-results">{catalogueMatches.map((item) => <button type="button" key={item.id} className="catalogue-stop-option" onClick={() => addStop(item)} disabled={stops.length >= 8}><span style={{ background: item.hex }} /><strong>{item.name}{item.step ? ` ${item.step}` : ''}</strong><small>{item.hex}</small></button>)}</div>
        </div>
        {stops.map((stop, index) => (
          <div
            key={stop.id}
            className="gradient-stop-row"
          >
            <span className="gradient-stop-colour" style={{ background: stop.color }} aria-hidden="true" />
            <label><span className="visually-hidden">Stop {index + 1} colour</span><select className="select" value={`${stop.name}|${stop.color}`} onChange={(event) => { const [name, color] = event.target.value.split('|'); setStops(stops.map((entry) => entry.id === stop.id ? { ...entry, name, color } : entry)); }}>{items.map((item) => <option key={item.id} value={`${item.name}|${item.hex}`}>{item.name}{item.step ? ` ${item.step}` : ''} — {item.hex}</option>)}</select></label>
            <input
              aria-label={`Stop ${index + 1} position`}
              type="range"
              min="0"
              max="100"
              value={stop.position}
              onChange={(e) =>
                setStops(
                  stops.map((s) =>
                    s.id === stop.id ? { ...s, position: Number(e.target.value) } : s,
                  ),
                )
              }
            />
            <span className="hex gradient-stop-position">{stop.position}%</span>
            {stops.length > 2 && (
              <button
                className="copy"
                onClick={() => setStops(stops.filter((s) => s.id !== stop.id))}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
