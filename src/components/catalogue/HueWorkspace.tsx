import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, Maximize2, X } from 'lucide-react';
import type { Colour, ScaleStep } from '../../lib/catalogue';
import type { RemoteCatalogue } from '../../lib/remoteCatalogue';
import { contrastRatio, contrastSurfaceStyle } from '../../lib/colour';
import { CopyButton } from '../colour/CopyButton';
import ScaleSteps from './ScaleSteps';

type SwatchDetail = Colour & { name: string; label?: string; step?: number; description: string };
type Viewport = 'wide' | 'compact' | 'mobile';

function Sheet({
  children,
  label,
  kind,
  onClose,
}: {
  children: ReactNode;
  label: string;
  kind: 'picker' | 'detail';
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const returnFocus = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (document.querySelector('.swatch-fullscreen.is-open')) {
        document.querySelector<HTMLElement>('.swatch-fullscreen-close')?.focus();
        return;
      }
      if (returnFocus?.isConnected && returnFocus !== document.body) returnFocus.focus();
      else
        window.requestAnimationFrame(() => {
          const fallback =
            kind === 'picker'
              ? document.querySelector<HTMLElement>('.hue-picker-trigger')
              : (document.querySelector<HTMLElement>('.hue-toast-expand') ??
                document.querySelector<HTMLElement>('.hue-detail-trigger') ??
                document.querySelector<HTMLElement>('.hue-swatch-select[aria-pressed="true"]'));
          fallback?.focus();
        });
    };
  }, [kind]);
  return (
    <dialog
      ref={dialogRef}
      className={`hue-sheet hue-sheet-${kind}`}
      aria-label={label}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.target === event.currentTarget &&
          (event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom)
        )
          onClose();
      }}
    >
      <div
        className="hue-sheet-handle"
        onPointerDown={(event) => {
          swipeStart.current = { x: event.clientX, y: event.clientY };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={(event) => {
          const start = swipeStart.current;
          swipeStart.current = null;
          if (start && event.clientY - start.y > 48 && Math.abs(event.clientX - start.x) < 60)
            onClose();
        }}
        onPointerCancel={() => {
          swipeStart.current = null;
        }}
        aria-hidden="true"
      >
        <span />
      </div>
      <div className="hue-sheet-heading">
        <span>{label}</span>
        <button
          type="button"
          className="hue-icon-button"
          onClick={onClose}
          aria-label="Close panel"
          autoFocus
        >
          <X size={18} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

function SwatchDetails({ swatch, type }: { swatch: SwatchDetail; type: 'scale' | 'engineered' }) {
  return (
    <section className="hue-details-content" aria-label="Selected swatch">
      <div className="eyebrow">{type === 'scale' ? 'Hue scale' : 'Engineered hue'}</div>
      <h2>
        {swatch.name}
        {swatch.step !== undefined ? ` · ${swatch.step}` : ''}
      </h2>
      {swatch.label ? <p className="hue-detail-label">{swatch.label}</p> : null}
      <p className="hue-detail-description">{swatch.description}</p>
      <div className="hue-copy-actions">
        <CopyButton key={`${swatch.hex}-hex`} value={swatch.hex} label="HEX" />
        <CopyButton key={`${swatch.oklch}-oklch`} value={swatch.oklch} label="OKLCH" />
      </div>
      <div
        className="hue-detail-preview swatch contrast-surface"
        style={contrastSurfaceStyle(swatch.hex)}
      >
        <button
          className="fullscreen-trigger"
          type="button"
          aria-label={`View ${swatch.name}${swatch.step !== undefined ? ` ${swatch.step}` : ''} fullscreen`}
        >
          <Maximize2 size={18} />
        </button>
      </div>
    </section>
  );
}

export default function HueWorkspace({
  type,
  data,
  status,
}: {
  type: 'scale' | 'engineered';
  data: RemoteCatalogue & { loading: boolean };
  status: ReactNode;
}) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const [location, setLocation] = useState({ slug: '', step: '' });
  const [viewport, setViewport] = useState<Viewport>('wide');
  const [sheet, setSheet] = useState<'picker' | 'detail' | null>(null);
  const [toastVisible, setToastVisible] = useState(true);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const syncLocation = () => {
      const params = new URLSearchParams(window.location.search);
      setLocation({ slug: params.get('slug') ?? '', step: params.get('step') ?? '' });
      setSheet(null);
      setToastVisible(true);
    };
    syncLocation();
    window.addEventListener('popstate', syncLocation);
    return () => window.removeEventListener('popstate', syncLocation);
  }, []);
  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 760px)');
    const wide = window.matchMedia('(min-width: 1180px)');
    const update = () => {
      setViewport(mobile.matches ? 'mobile' : wide.matches ? 'wide' : 'compact');
      setSheet(null);
    };
    update();
    mobile.addEventListener('change', update);
    wide.addEventListener('change', update);
    return () => {
      mobile.removeEventListener('change', update);
      wide.removeEventListener('change', update);
    };
  }, []);
  const scale =
    type === 'scale' ? data.hueScales.find((item) => item.slug === location.slug) : undefined;
  const hue =
    type === 'engineered'
      ? data.engineeredHues.find((item) => item.slug === location.slug)
      : undefined;
  const current = scale ?? hue;
  const selectedStep =
    scale?.steps.find((step) => String(step.step) === location.step) ??
    scale?.steps.find((step) => step.step === 500) ??
    scale?.steps[0];
  const selected: SwatchDetail | undefined =
    selectedStep && scale
      ? {
          ...selectedStep,
          name: scale.name,
          description: `Shade ${selectedStep.step} from the ${scale.name} colour system.`,
        }
      : hue;
  const related = hue?.relatedScaleId
    ? data.hueScales.find((item) => item.id === hue.relatedScaleId)
    : undefined;
  useEffect(() => {
    if (current) document.title = `${current.name}${type === 'scale' ? ' scale' : ''} · Chroma`;
  }, [current?.name, type]);
  function navigate(slug: string, step = '') {
    const url = new URL(window.location.href);
    url.searchParams.set('slug', slug);
    if (step) url.searchParams.set('step', step);
    else url.searchParams.delete('step');
    if (url.href !== window.location.href) window.history.pushState(null, '', url);
    setLocation({ slug, step });
    setSheet(null);
    setToastVisible(true);
  }
  function selectStep(step: ScaleStep) {
    navigate(location.slug, String(step.step));
    if (viewport === 'compact') setSheet('detail');
  }
  const items =
    type === 'scale'
      ? data.hueScales.map((item) => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          hex: (item.steps.find((step) => step.step === 500) ?? item.steps[0])?.hex ?? '#888888',
        }))
      : data.engineeredHues;
  const libraryName = type === 'scale' ? 'Hue scales' : 'Engineered hues';
  const hueList = (
    <nav className="hue-list" aria-label={`${libraryName} in this library`}>
      {items.map((item) => (
        <a
          key={item.id}
          href={`${base}/${type === 'scale' ? 'scales' : 'engineered'}/view?slug=${encodeURIComponent(item.slug)}`}
          aria-current={item.slug === location.slug ? 'page' : undefined}
          onClick={(event) => {
            if (
              event.button !== 0 ||
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            )
              return;
            event.preventDefault();
            navigate(item.slug);
          }}
        >
          <span className="hue-list-preview" style={{ background: item.hex }} aria-hidden="true" />
          <span>{item.name}</span>
        </a>
      ))}
    </nav>
  );
  if (data.loading && !current) return <>{status}</>;
  return (
    <section
      className="hue-workspace"
      data-viewport={viewport}
      aria-label={`${libraryName} workspace`}
    >
      <aside className="hue-library-rail">
        <div className="eyebrow">{libraryName}</div>
        {hueList}
      </aside>
      <div className="hue-palette">
        <div className="hue-workspace-toolbar">
          <button
            className="button hue-picker-trigger"
            type="button"
            onClick={() => setSheet('picker')}
            aria-haspopup="dialog"
          >
            {current?.name ?? 'Choose a hue'} <ChevronDown size={16} />
          </button>
          <span className="eyebrow">{libraryName}</span>
          {selected ? (
            <button
              className="button hue-detail-trigger"
              type="button"
              onClick={() => {
                setToastVisible(true);
                setSheet('detail');
              }}
              aria-haspopup="dialog"
            >
              Swatch details
            </button>
          ) : null}
        </div>
        {current && selected ? (
          <>
            <header className="hue-palette-heading">
              <h1>{current.name}</h1>
              <p>{current.description}</p>
            </header>
            {scale ? (
              <ScaleSteps
                key={scale.id}
                steps={scale.steps}
                scaleName={scale.name}
                selectedStep={selectedStep?.step}
                onSelect={selectStep}
              />
            ) : (
              <article className="hue-swatch-card hue-engineered-palette">
                <button
                  type="button"
                  className="hue-swatch-select"
                  aria-pressed="true"
                  aria-label={`Select ${selected.name}`}
                  onClick={() => {
                    setToastVisible(true);
                    if (viewport === 'compact') setSheet('detail');
                  }}
                >
                  <span className="swatch" style={contrastSurfaceStyle(selected.hex)} />
                </button>
                <div className="hue-swatch-label">
                  <span>{selected.name}</span>
                </div>
                <div className="hue-copy-actions">
                  <CopyButton key={`${selected.hex}-hex`} value={selected.hex} label="HEX" />
                  <CopyButton
                    key={`${selected.oklch}-oklch`}
                    value={selected.oklch}
                    label="OKLCH"
                  />
                </div>
              </article>
            )}
            {scale?.referenceColors?.length ? (
              <section className="hue-support-section">
                <h2>Reference colours</h2>
                <div className="hue-reference-grid">
                  {scale.referenceColors.map((colour) => (
                    <article className="hue-swatch-card" key={colour.name}>
                      <div className="swatch" style={contrastSurfaceStyle(colour.hex)} />
                      <p>{colour.name}</p>
                      <CopyButton value={colour.hex} label="HEX" />
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
            {scale?.contrastExamples?.length ? (
              <section className="hue-support-section">
                <h2>Contrast examples</h2>
                <div className="tool-grid">
                  {scale.contrastExamples.map((example) => {
                    const ratio = contrastRatio(example.foreground, example.background);
                    return (
                      <article className="panel" key={example.label}>
                        <div
                          className="swatch"
                          style={{ background: example.background, color: example.foreground }}
                        >
                          <strong>Aa</strong>
                          <span>{example.label}</span>
                        </div>
                        <p>
                          {ratio.toFixed(2)}:1 · Normal AA {ratio >= 4.5 ? 'Pass' : 'Fail'} · AAA{' '}
                          {ratio >= 7 ? 'Pass' : 'Fail'} · UI {ratio >= 3 ? 'Pass' : 'Fail'}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </section>
            ) : null}
            {related ? (
              <section className="hue-support-section">
                <div className="eyebrow">Related scale</div>
                <a
                  className="button"
                  href={`${base}/scales/view?slug=${encodeURIComponent(related.slug)}`}
                >
                  {related.name}
                </a>
              </section>
            ) : null}
          </>
        ) : (
          <div className="panel">
            <h1>
              {location.slug
                ? 'This colour is no longer in the catalogue.'
                : 'Choose a hue from this library.'}
            </h1>
            <p>Select a hue to view its swatches.</p>
          </div>
        )}
        <div className="hue-workspace-status">{status}</div>
      </div>
      {selected && viewport === 'wide' ? (
        <aside className="hue-detail-rail">
          <SwatchDetails swatch={selected} type={type} />
        </aside>
      ) : null}
      {selected && viewport === 'mobile' && toastVisible && !sheet ? (
        <div
          className="hue-detail-toast"
          onPointerDown={(event) => {
            swipeStart.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerUp={(event) => {
            const start = swipeStart.current;
            swipeStart.current = null;
            if (start && start.y - event.clientY > 40 && Math.abs(event.clientX - start.x) < 60)
              setSheet('detail');
          }}
          onPointerCancel={() => {
            swipeStart.current = null;
          }}
        >
          <button
            type="button"
            className="hue-toast-expand"
            onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
            onClick={() => setSheet('detail')}
            aria-haspopup="dialog"
            aria-label="Expand selected swatch details"
          >
            <span
              className="hue-toast-colour"
              style={{ background: selected.hex }}
              aria-hidden="true"
            />
            <span>
              {selected.name}
              {selected.step !== undefined ? ` · ${selected.step}` : ''}
              <small>{selected.label ?? 'Engineered hue'}</small>
            </span>
            <ChevronUp size={18} />
          </button>
          <button
            type="button"
            className="hue-icon-button"
            aria-label="Dismiss swatch details"
            onClick={() => setToastVisible(false)}
          >
            <X size={18} />
          </button>
        </div>
      ) : null}
      {sheet === 'picker' ? (
        <Sheet label={libraryName} kind="picker" onClose={() => setSheet(null)}>
          {hueList}
        </Sheet>
      ) : null}
      {sheet === 'detail' && selected ? (
        <Sheet label="Swatch details" kind="detail" onClose={() => setSheet(null)}>
          <SwatchDetails swatch={selected} type={type} />
        </Sheet>
      ) : null}
    </section>
  );
}
