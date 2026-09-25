import { useDeferredValue, useMemo, useState } from 'react';
import type { CatalogueItem } from '../../lib/catalogue';
import { bestTextColor, inSRGB } from '../../lib/colour';
import { CopyButton } from '../colour/CopyButton';

export function CatalogueBrowser({ items, base }: { items: CatalogueItem[]; base: string }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [family, setFamily] = useState('all');
  const deferred = useDeferredValue(query);
  const families = useMemo(
    () => [...new Set(items.map((item) => item.family).filter(Boolean))],
    [items],
  );
  const visible = useMemo(
    () =>
      items.filter((item) => {
        const search =
          `${item.name} ${item.description} ${item.tags.join(' ')} ${item.hex}`.toLowerCase();
        return (
          search.includes(deferred.toLowerCase()) &&
          (type === 'all' || item.type === type) &&
          (family === 'all' || item.family === family)
        );
      }),
    [items, deferred, type, family],
  );
  return (
    <div className="split">
      <aside className="rail">
        <div className="eyebrow">Catalogue tools</div>
        <label htmlFor="search">Search records</label>
        <input
          id="search"
          className="input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Name, tag or HEX"
        />
        <label htmlFor="type">Record type</label>
        <select
          id="type"
          className="select"
          value={type}
          onChange={(event) => setType(event.target.value)}
        >
          <option value="all">All records</option>
          <option value="scale">Hue scales</option>
          <option value="engineered">Engineered hues</option>
        </select>
        <label htmlFor="family">Colour family</label>
        <select
          id="family"
          className="select"
          value={family}
          onChange={(event) => setFamily(event.target.value)}
        >
          <option value="all">All families</option>
          {families.map((entry) => (
            <option key={entry}>{entry}</option>
          ))}
        </select>
      </aside>
      <section>
        <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <span className="eyebrow">{visible.length} colours found</span>
          <span className="hex">sRGB and P3 metadata</span>
        </div>
        <div className="catalogue-grid">
          {visible.map((item) => (
            <article className="catalogue-cell" key={item.id}>
              <a href={`${base}/${item.type === 'scale' ? 'scales' : 'engineered'}/${item.slug}`}>
                <div
                  className="swatch"
                  style={{ background: item.hex, color: bestTextColor(item.hex) }}
                >
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
    </div>
  );
}
