import { useMemo, useState } from 'react';
import type { CatalogueItem } from '../../lib/catalogue';
import { bestTextColor, contrastRatio } from '../../lib/colour';
const checks = [
  ['Normal text AA', 4.5],
  ['Normal text AAA', 7],
  ['Large text AA', 3],
  ['Large text AAA', 4.5],
  ['Non-text UI', 3],
] as const;
export default function ContrastChecker({ items }: { items: CatalogueItem[] }) {
  const [foreground, setForeground] = useState(
    items.find((i) => i.hex === '#FFFFFF')?.id ?? items[0].id,
  );
  const [background, setBackground] = useState(items[6].id);
  const [customFg, setCustomFg] = useState('');
  const [customBg, setCustomBg] = useState('');
  const fg = customFg || items.find((i) => i.id === foreground)?.hex || '#1f2328';
  const bg = customBg || items.find((i) => i.id === background)?.hex || '#ffffff';
  const ratio = useMemo(() => contrastRatio(fg, bg), [fg, bg]);
  return (
    <div className="tool-grid">
      <section className="panel">
        <h2>Foreground</h2>
        <input
          className="input"
          value={customFg}
          onChange={(e) => setCustomFg(e.target.value)}
          placeholder="Temporary value, e.g. #FFFFFF"
          style={{ width: '100%', margin: '10px 0' }}
        />
        <select
          className="select"
          value={foreground}
          onChange={(e) => {
            setForeground(e.target.value);
            setCustomFg('');
          }}
          style={{ width: '100%' }}
        >
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name} {i.step ?? ''} — {i.hex}
            </option>
          ))}
        </select>
        <div className="swatch" style={{ background: fg, color: bestTextColor(fg), marginTop: 14 }}>
          Aa<span>{fg}</span>
        </div>
      </section>
      <section className="panel">
        <h2>Background</h2>
        <input
          className="input"
          value={customBg}
          onChange={(e) => setCustomBg(e.target.value)}
          placeholder="Temporary value, e.g. #1F2328"
          style={{ width: '100%', margin: '10px 0' }}
        />
        <select
          className="select"
          value={background}
          onChange={(e) => {
            setBackground(e.target.value);
            setCustomBg('');
          }}
          style={{ width: '100%' }}
        >
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name} {i.step ?? ''} — {i.hex}
            </option>
          ))}
        </select>
        <div className="swatch" style={{ background: bg, color: bestTextColor(bg), marginTop: 14 }}>
          Aa<span>{bg}</span>
        </div>
      </section>
      <section className="panel">
        <div className="eyebrow">WCAG 2.2 ratio</div>
        <div style={{ fontSize: 68, fontWeight: 750, letterSpacing: '-.07em', margin: '6px 0' }}>
          {ratio.toFixed(2)}:1
        </div>
        {checks.map(([label, minimum]) => (
          <div
            className="meta"
            key={label}
            style={{ borderTop: '1px solid var(--line)', paddingTop: 9 }}
          >
            <span>{label}</span>
            <strong style={{ color: ratio >= minimum ? '#24734a' : '#b42318' }}>
              {ratio >= minimum ? 'Pass' : 'Fail'} <span className="hex">{minimum}:1</span>
            </strong>
          </div>
        ))}
      </section>
    </div>
  );
}
