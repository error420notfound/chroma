import { useEffect, useMemo, useState } from 'react';
import type { CatalogueItem } from '../../lib/catalogue';
import { fallbackSRGB, inSRGB } from '../../lib/colour';
import { gradientCss, type GradientStop } from '../../lib/gradients';
import { readStored, saveStored } from '../../lib/storage';
import { CopyButton } from '../colour/CopyButton';
const id = () => Math.random().toString(36).slice(2);
export function GradientBuilder({ items }: { items: CatalogueItem[] }) {
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
  useEffect(() => saveStored('chroma.gradient.v1', stops), [stops]);
  const css = useMemo(() => gradientCss(stops, space), [stops, space]);
  const hasP3 = stops.some((stop) => !inSRGB(stop.color));
  const addStop = () => {
    if (stops.length < 8)
      setStops([...stops, { id: id(), color: items[0].hex, position: 50, name: items[0].name }]);
  };
  return (
    <div className="tool-grid">
      <section className="panel" style={{ gridColumn: '1 / -1' }}>
        <div className="swatch" style={{ background: css, minHeight: 210, color: '#fff' }}>
          <span className="eyebrow" style={{ color: 'inherit' }}>
            Live linear gradient
          </span>
          <strong style={{ fontSize: 36 }}>Colour in motion</strong>
        </div>
        <div className="meta">
          <span
            className="hex"
            style={{ maxWidth: '75%', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {css}
          </span>
          <CopyButton value={css} label="Copy CSS" />
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
      <section className="panel">
        <div className="meta">
          <h2>Stops</h2>
          <button className="button primary" disabled={stops.length >= 8} onClick={addStop}>
            Add stop
          </button>
        </div>
        {stops.map((stop, index) => (
          <div
            key={stop.id}
            className="meta"
            style={{ borderTop: '1px solid var(--line)', paddingTop: 10, marginTop: 10 }}
          >
            <input
              aria-label={`Stop ${index + 1} colour`}
              type="color"
              value={stop.color}
              onChange={(e) =>
                setStops(stops.map((s) => (s.id === stop.id ? { ...s, color: e.target.value } : s)))
              }
            />
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
            <span className="hex">{stop.position}%</span>
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
