import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { EngineeredHue } from '../../lib/catalogue';
import { bestTextColor } from '../../lib/colour';
import { Maximize2, X } from 'lucide-react';

export default function EngineeredBrowser({ hues, base }: { hues: EngineeredHue[]; base: string }) {
  const [selected, setSelected] = useState<EngineeredHue | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const open = (hue: EngineeredHue) => { setSelected(hue); history.pushState({ hue: hue.slug }, '', `${base}/engineered/${hue.slug}`); };
  const close = () => { setSelected(null); history.replaceState(null, '', `${base}/engineered`); };
  useLayoutEffect(() => {
    if (!selected || !modalRef.current) return;
    const context = gsap.context(() => {
      gsap.fromTo(modalRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18, ease: 'power1.out' });
      gsap.fromTo('.engineered-modal-card', { y: 24, scale: 0.98 }, { y: 0, scale: 1, duration: 0.3, ease: 'power3.out' });
    }, modalRef);
    return () => context.revert();
  }, [selected]);
  return <><div className="catalogue-grid">{hues.map((hue) => <button className="catalogue-cell engineered-card" key={hue.id} onClick={() => open(hue)}><div className="swatch" style={{ background: hue.hex, color: bestTextColor(hue.hex) }}><strong style={{ fontSize: 27 }}>Aa</strong><span>{hue.name}</span></div><div className="meta"><span className="hex">{hue.hex}</span><span>{hue.tags[0]}</span></div></button>)}</div>{selected && <div className="engineered-modal" ref={modalRef} role="dialog" aria-modal="true" aria-label={`${selected.name} detail`} onClick={(event) => event.target === event.currentTarget && close()}><section className="engineered-modal-card"><button className="modal-close" onClick={close} aria-label="Close colour detail"><X size={20}/></button><div className="swatch" style={{ background: selected.hex, color: bestTextColor(selected.hex), minHeight: 280 }}><button className="fullscreen-trigger" type="button" aria-label={`View ${selected.name} fullscreen`}><Maximize2 size={18}/></button><span style={{ fontSize: 84 }}>Aa</span><strong>{selected.hex}</strong></div><div className="engineered-modal-copy"><div className="eyebrow">Engineered hue</div><h2>{selected.name}</h2><p>{selected.description}</p><p className="hex">{selected.oklch}</p><div className="toolbar"><a className="button" href={`${base}/engineered/${selected.slug}`}>Open full page</a><button className="button primary" onClick={close}>Done</button></div></div></section></div>}</>;
}
