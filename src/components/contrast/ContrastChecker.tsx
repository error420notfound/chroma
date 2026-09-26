import { useMemo, useState } from 'react';
import type { CatalogueItem } from '../../lib/catalogue';
import { contrastRatio, contrastSurfaceStyle, parseColour } from '../../lib/colour';
import { Maximize2 } from 'lucide-react';
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
  const fgValid = !customFg || parseColour(customFg) !== null;
  const bgValid = !customBg || parseColour(customBg) !== null;
  const ratio = useMemo(
    () => (fgValid && bgValid ? contrastRatio(fg, bg) : null),
    [fg, bg, fgValid, bgValid],
  );
  return (
    <div className="tool-grid">
      <section className="panel">
        <h2>Foreground</h2>
        <label className="visually-hidden" htmlFor="contrast-fg">
          Custom foreground colour
        </label>
        <input
          id="contrast-fg"
          className="input"
          aria-invalid={!fgValid}
          aria-describedby="contrast-fg-help contrast-fg-error"
          value={customFg}
          onChange={(e) => setCustomFg(e.target.value)}
          placeholder="Temporary value, e.g. #FFFFFF"
          style={{ width: '100%', margin: '10px 0' }}
        />
        <small id="contrast-fg-help" className="hex">
          Enter a CSS colour such as a HEX or OKLCH value.
        </small>
        {!fgValid && (
          <p id="contrast-fg-error" className="form-error" role="alert">
            That foreground value is not a valid CSS colour.
          </p>
        )}
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
        <div className="swatch contrast-surface" style={contrastSurfaceStyle(fg, { marginTop: 14 })}>
          <button className="fullscreen-trigger" type="button" aria-label="View foreground colour fullscreen"><Maximize2 size={16} /></button>
          Aa<span>{fg}</span>
        </div>
      </section>
      <section className="panel">
        <h2>Background</h2>
        <label className="visually-hidden" htmlFor="contrast-bg">
          Custom background colour
        </label>
        <input
          id="contrast-bg"
          className="input"
          aria-invalid={!bgValid}
          aria-describedby="contrast-bg-help contrast-bg-error"
          value={customBg}
          onChange={(e) => setCustomBg(e.target.value)}
          placeholder="Temporary value, e.g. #1F2328"
          style={{ width: '100%', margin: '10px 0' }}
        />
        <small id="contrast-bg-help" className="hex">
          Enter a CSS colour such as a HEX or OKLCH value.
        </small>
        {!bgValid && (
          <p id="contrast-bg-error" className="form-error" role="alert">
            That background value is not a valid CSS colour.
          </p>
        )}
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
        <div className="swatch contrast-surface" style={contrastSurfaceStyle(bg, { marginTop: 14 })}>
          <button className="fullscreen-trigger" type="button" aria-label="View background colour fullscreen"><Maximize2 size={16} /></button>
          Aa<span>{bg}</span>
        </div>
      </section>
      <section className="panel">
        <div className="eyebrow">WCAG 2.2 ratio</div>
        <div style={{ fontSize: 68, fontWeight: 750, letterSpacing: '-.07em', margin: '6px 0' }}>
          {ratio === null ? '—' : `${ratio.toFixed(2)}:1`}
        </div>
        <p className="hex">
          WCAG contrast ratios are calculated from relative luminance. AA and AAA thresholds depend
          on text size; non-text UI uses 3:1.
        </p>
        {checks.map(([label, minimum]) => (
          <div
            className="meta"
            key={label}
            style={{ borderTop: '1px solid var(--line)', paddingTop: 9 }}
          >
            <span>{label}</span>
            <strong
              className={ratio !== null && ratio >= minimum ? 'status-pass' : 'status-fail'}
              role="status"
            >
              {ratio === null ? 'Check inputs' : ratio >= minimum ? 'Pass' : 'Fail'}{' '}
              <span className="hex">{minimum}:1</span>
            </strong>
          </div>
        ))}
      </section>
    </div>
  );
}
