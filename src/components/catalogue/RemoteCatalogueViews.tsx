import { useEffect } from 'react';

import { useCatalogue } from '../../lib/useCatalogue';

import { contrastSurfaceStyle, contrastRatio, cssValues } from '../../lib/colour';

import { CopyButton } from '../colour/CopyButton';

import ScaleSteps from './ScaleSteps';

import EngineeredBrowser from '../engineered/EngineeredBrowser';

import CatalogueBrowser from './CatalogueBrowser';

export function CatalogueStatus({ loading, source }: { loading: boolean; source: string }) {
  return (
    <p
      className={loading ? 'notice catalogue-status is-loading' : 'notice catalogue-status'}
      role="status"
      aria-busy={loading}
    >
      {loading
        ? 'Refreshing the colour catalogue…'
        : source === 'remote'
          ? 'Catalogue data loaded from chroma-catalogue.'
          : source === 'cache'
            ? 'Using the last saved catalogue; the live source is unavailable.'
            : 'Using Chroma’s included catalogue snapshot; the live source is unavailable.'}
    </p>
  );
}

export function HomeLibrary({ base }: { base: string }) {
  const data = useCatalogue();

  return (
    <CatalogueBrowser
      base={base}
      status={<CatalogueStatus loading={data.loading} source={data.source} />}
    />
  );
}

export function ScalesIndex() {
  const data = useCatalogue();
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <>
      <CatalogueStatus loading={data.loading} source={data.source} />
      <div className="catalogue-grid">
        {data.hueScales.map((scale) => (
          <a
            className="catalogue-cell"
            key={scale.id}
            href={`${base}/scales/view?slug=${encodeURIComponent(scale.slug)}`}
          >
            <div
              className="swatch contrast-surface"
              style={contrastSurfaceStyle(
                scale.steps[Math.floor(scale.steps.length / 2)]?.hex ?? '#888888',
              )}
            >
              <strong style={{ fontSize: 28 }}>{scale.name}</strong>
              <span>{scale.family}</span>
            </div>
            <div className="meta">
              <span>{scale.description}</span>
              <span className="hex">{scale.steps.length} steps</span>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}

export function EngineeredIndex() {
  const data = useCatalogue();
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <>
      <CatalogueStatus loading={data.loading} source={data.source} />
      <EngineeredBrowser hues={data.engineeredHues} base={base} />
    </>
  );
}

export function CatalogueDetail({ type }: { type: 'scale' | 'engineered' }) {
  const data = useCatalogue();
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  const slug =
    typeof window === 'undefined'
      ? ''
      : (new URLSearchParams(window.location.search).get('slug') ?? '');

  const scale = type === 'scale' ? data.hueScales.find((item) => item.slug === slug) : undefined;

  const hue =
    type === 'engineered' ? data.engineeredHues.find((item) => item.slug === slug) : undefined;

  useEffect(() => {
    if (scale) document.title = `${scale.name} scale — Chroma`;
    if (hue) document.title = `${hue.name} — Chroma`;
  }, [scale?.name, hue?.name]);

  if (data.loading && data.source === 'snapshot')
    return <CatalogueStatus loading source={data.source} />;

  if (!scale && !hue)
    return (
      <section className="panel">
        <div className="eyebrow">Catalogue record unavailable</div>
        <h1>
          {slug
            ? 'This colour is no longer in the catalogue.'
            : 'Choose a catalogue colour to view.'}
        </h1>
        <p>It may have been removed or the link may be incomplete.</p>
        <a
          className="button primary"
          href={`${base}/${type === 'scale' ? 'scales' : 'engineered'}`}
        >
          Back to {type === 'scale' ? 'hue scales' : 'engineered hues'}
        </a>
        <CatalogueStatus loading={data.loading} source={data.source} />
      </section>
    );

  if (scale)
    return (
      <>
        <CatalogueStatus loading={data.loading} source={data.source} />
        <div className="scale-detail-page">
          <div className="eyebrow">{scale.family} hue scale</div>
          <h1>{scale.name}</h1>
          <p className="scale-description">{scale.description}</p>
          <ScaleSteps steps={scale.steps} scaleName={scale.name} base={base} slug={scale.slug} />
          {scale.referenceColors?.length ? (
            <>
              <hr className="rule" />
              <h2>Reference colours</h2>
              <div className="tool-grid reference-grid" style={{ marginTop: 14 }}>
                {scale.referenceColors.map((color) => (
                  <div className="panel" key={`${color.name}-${color.hex}`}>
                    <div
                      className="swatch contrast-surface"
                      style={contrastSurfaceStyle(color.hex)}
                    >
                      <strong>{color.name}</strong>
                      <span>{color.hex}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
          {scale.contrastExamples?.length ? (
            <>
              <hr className="rule" />
              <h2>Contrast examples</h2>
              <div className="tool-grid" style={{ marginTop: 14 }}>
                {scale.contrastExamples.map((example) => {
                  const ratio = contrastRatio(example.foreground, example.background);
                  return (
                    <div className="panel" key={example.label}>
                      <div
                        className="swatch contrast-surface"
                        style={contrastSurfaceStyle(example.background)}
                      >
                        <strong>Aa</strong>
                        <span>{example.label}</span>
                      </div>
                      <p>
                        <strong>{ratio.toFixed(2)}:1</strong> · Normal AA{' '}
                        {ratio >= 4.5 ? 'Pass' : 'Fail'} · AAA {ratio >= 7 ? 'Pass' : 'Fail'} · UI{' '}
                        {ratio >= 3 ? 'Pass' : 'Fail'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      </>
    );

  const related = hue?.relatedScaleId
    ? data.hueScales.find((entry) => entry.id === hue.relatedScaleId)
    : undefined;

  return (
    <>
      <CatalogueStatus loading={data.loading} source={data.source} />
      <div className="eyebrow">Engineered hue</div>
      <h1>{hue!.name}</h1>
      <div className="tool-grid">
        <section className="panel">
          <div
            className="swatch contrast-surface"
            style={contrastSurfaceStyle(hue!.hex, { minHeight: 320 })}
          >
            <span style={{ fontSize: 90 }}>Aa</span>
            <strong>{hue!.hex}</strong>
          </div>
        </section>
        <section className="panel">
          <p>{hue!.description}</p>
          <p className="eyebrow">{hue!.tags.join(' · ')}</p>
          <hr className="rule" />
          <div className="meta">
            <span className="hex">
              HEX
              <br />
              {hue!.hex}
            </span>
            <CopyButton value={hue!.hex} />
          </div>
          <div className="meta">
            <span className="hex">
              OKLCH
              <br />
              {hue!.oklch}
            </span>
            <CopyButton value={hue!.oklch} />
          </div>
          <div className="meta">
            <span className="hex">
              Display P3
              <br />
              {hue!.p3}
            </span>
            <CopyButton value={hue!.p3} />
          </div>
          <div style={{ marginTop: 16 }}>
            <CopyButton value={cssValues(hue!)} label="Copy all CSS values" />
          </div>
        </section>
      </div>
      {related ? (
        <>
          <hr className="rule" />
          <div className="panel">
            <div className="eyebrow">Related scale</div>
            <h2 style={{ marginTop: 8 }}>
              <a href={`${base}/scales/view?slug=${encodeURIComponent(related.slug)}`}>
                {related.name}
              </a>
            </h2>
          </div>
        </>
      ) : null}
    </>
  );
}
