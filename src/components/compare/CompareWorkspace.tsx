import { useEffect, useMemo, useState } from 'react';
import Color from 'colorjs.io';
import type { CatalogueItem } from '../../lib/catalogue';
import { bestTextColor } from '../../lib/colour';
import { readStored, saveStored } from '../../lib/storage';
import { CopyButton } from '../colour/CopyButton';
type Mode = 'original' | 'lightness' | 'chroma';
export function CompareWorkspace({ items }: { items: CatalogueItem[] }) {
  const lookup = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const [ids, setIds] = useState<string[]>(() => {
    const shared =
      typeof window === 'undefined'
        ? []
        : (new URLSearchParams(window.location.search).get('ids')?.split(',').filter(Boolean) ??
          []);
    return shared.length
      ? shared
      : readStored(
          'chroma.compare.v1',
          items.slice(0, 2).map((item) => item.id),
        );
  });
  const [mode, setMode] = useState<Mode>('original');
  useEffect(() => {
    saveStored('chroma.compare.v1', ids);
    const query = new URLSearchParams(window.location.search);
    if (ids.length) query.set('ids', ids.join(','));
    else query.delete('ids');
    history.replaceState(null, '', `${window.location.pathname}${query.size ? `?${query}` : ''}`);
  }, [ids]);
  const selected = ids.map((id) => lookup.get(id)).filter(Boolean) as CatalogueItem[];
  const add = (id: string) => {
    if (ids.length < 8 && !ids.includes(id)) setIds([...ids, id]);
  };
  const derive = (item: CatalogueItem) => {
    if (mode === 'original' || !selected.length) return item.hex;
    const color = new Color(item.hex).to('oklch');
    const base = new Color(selected[0].hex).to('oklch');
    if (mode === 'lightness') color.coords[0] = base.coords[0];
    else color.coords[1] = base.coords[1];
    return color.toGamut({ space: 'srgb', method: 'oklch.c' }).toString({ format: 'hex' });
  };
  const exportJson = () =>
    JSON.stringify(
      selected.map((item) => ({ name: item.name, hex: item.hex, oklch: item.oklch, p3: item.p3 })),
      null,
      2,
    );
  const exportCss = () =>
    selected
      .map((item) => `--${item.slug}${item.step ? `-${item.step}` : ''}: ${item.hex};`)
      .join('\n');
  return (
    <>
      <div className="panel toolbar">
        <label className="visually-hidden" htmlFor="add-colour">
          Add colour
        </label>
        <select
          id="add-colour"
          className="select"
          defaultValue=""
          onChange={(e) => {
            add(e.target.value);
            e.currentTarget.value = '';
          }}
        >
          <option value="" disabled>
            Add a catalogue colour
          </option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} {item.step ? item.step : ''} — {item.hex}
            </option>
          ))}
        </select>
        <div role="group" aria-label="Derived preview">
          <button
            className={`button ${mode === 'original' ? 'primary' : ''}`}
            onClick={() => setMode('original')}
          >
            Original
          </button>
          <button
            className={`button ${mode === 'lightness' ? 'primary' : ''}`}
            onClick={() => setMode('lightness')}
          >
            Equal lightness
          </button>
          <button
            className={`button ${mode === 'chroma' ? 'primary' : ''}`}
            onClick={() => setMode('chroma')}
          >
            Equal chroma
          </button>
        </div>
        <button className="button" onClick={() => setIds([])}>
          Clear
        </button>
        <CopyButton value={exportJson()} label="Export JSON" />
        <CopyButton value={exportCss()} label="Export CSS" />
      </div>
      {mode !== 'original' && (
        <p className="notice">
          Derived previews are labelled and never modify catalogue source records.
        </p>
      )}
      <div className="tool-grid" style={{ marginTop: 16 }}>
        {selected.map((item, index) => {
          const value = derive(item);
          return (
            <article className="panel" key={item.id}>
              <div
                className="swatch"
                style={{ background: value, color: bestTextColor(value), minHeight: 170 }}
              >
                <strong style={{ fontSize: 26 }}>{item.name}</strong>
                <span>{mode === 'original' ? item.hex : value}</span>
              </div>
              <div className="meta">
                <span className="hex">Source: {item.hex}</span>
                <button
                  className="copy"
                  disabled={index === 0}
                  onClick={() => setIds(ids.toSpliced(index - 1, 2, ids[index], ids[index - 1]))}
                >
                  Earlier
                </button>
                <button
                  className="copy"
                  disabled={index === ids.length - 1}
                  onClick={() => setIds(ids.toSpliced(index, 2, ids[index + 1], ids[index]))}
                >
                  Later
                </button>
                <button className="copy" onClick={() => setIds(ids.filter((_, i) => i !== index))}>
                  Remove
                </button>
              </div>
              <div className="preview-grid" style={{ marginTop: 12 }}>
                <div className="preview" style={{ background: '#f6f4f0', color: value }}>
                  Text
                  <br />
                  <span
                    style={{ background: value, color: bestTextColor(value), padding: '4px 7px' }}
                  >
                    Accent
                  </span>
                </div>
                <div className="preview" style={{ background: '#1f2328', color: value }}>
                  Text
                  <br />
                  <span
                    style={{ background: value, color: bestTextColor(value), padding: '4px 7px' }}
                  >
                    Accent
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
