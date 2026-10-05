import type { EngineeredHue } from '../../lib/catalogue';
import { contrastSurfaceStyle } from '../../lib/colour';

export default function EngineeredBrowser({ hues, base }: { hues: EngineeredHue[]; base: string }) {
  return (
    <div className="catalogue-grid">
      {hues.map((hue) => (
        <a
          className="catalogue-cell engineered-card"
          key={hue.id}
          href={`${base}/engineered/view?slug=${encodeURIComponent(hue.slug)}`}
        >
          <div className="swatch contrast-surface" style={contrastSurfaceStyle(hue.hex)}>
            <strong style={{ fontSize: 27 }}>Aa</strong>
            <span>{hue.name}</span>
          </div>
          <div className="meta">
            <span>{hue.name}</span>
            <span>{hue.tags[0]}</span>
          </div>
        </a>
      ))}
    </div>
  );
}
