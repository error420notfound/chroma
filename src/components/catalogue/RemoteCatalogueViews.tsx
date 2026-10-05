import HueWorkspace from './HueWorkspace';

import { useCatalogue } from '../../lib/useCatalogue';

import { contrastSurfaceStyle } from '../../lib/colour';

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
  return (
    <HueWorkspace
      type={type}
      data={data}
      status={<CatalogueStatus loading={data.loading} source={data.source} />}
    />
  );
}
