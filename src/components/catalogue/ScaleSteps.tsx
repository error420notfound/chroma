import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { ScaleStep } from '../../lib/catalogue';
import { bestTextColor } from '../../lib/colour';
import { CopyButton } from '../colour/CopyButton';
import { Maximize2, X } from 'lucide-react';

export default function ScaleSteps({ steps, scaleName, base, slug }: { steps: ScaleStep[]; scaleName: string; base: string; slug: string }) {
  const [selected, setSelected] = useState<ScaleStep | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!selected || !modalRef.current) return;
    const context = gsap.context(() => {
      gsap.fromTo(modalRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: .18 });
      gsap.fromTo('.engineered-modal-card', { y: 24, scale: .98 }, { y: 0, scale: 1, duration: .3, ease: 'power3.out' });
    }, modalRef);
    return () => context.revert();
  }, [selected]);
  const close = () => setSelected(null);
  return <>
    <div className="detail-scale">{steps.map((step) => <article className="scale-step" key={step.step}>
      <div className="scale-step-open" role="button" tabIndex={0} onClick={() => setSelected(step)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(step); } }} aria-label={`View ${scaleName} ${step.step} details`}>
        <div className="swatch" style={{ background: step.hex, color: bestTextColor(step.hex) }}><button className="fullscreen-trigger" type="button" aria-label={`View ${scaleName} ${step.step} fullscreen`} onClick={(event) => event.stopPropagation()}><Maximize2 size={15}/></button><span>Aa</span><strong>{step.step}</strong></div>
      </div>
      <div><strong>{step.label}</strong><small>HEX · {step.hex}</small><CopyButton value={step.hex} label="Copy HEX"/><small>OKLCH · {step.oklch}</small><CopyButton value={step.oklch} label="Copy OKLCH"/><small>P3 · {step.p3}</small><CopyButton value={step.p3} label="Copy P3"/></div>
    </article>)}</div>
    {selected && <div className="engineered-modal" ref={modalRef} role="dialog" aria-modal="true" aria-label={`${scaleName} ${selected.step} detail`} onClick={(event) => event.target === event.currentTarget && close()}>
      <section className="engineered-modal-card"><button className="modal-close" onClick={close} aria-label="Close colour detail"><X size={20}/></button>
        <div className="swatch" style={{ background: selected.hex, color: bestTextColor(selected.hex), minHeight: 280 }}><button className="fullscreen-trigger" type="button" aria-label={`View ${scaleName} ${selected.step} fullscreen`}><Maximize2 size={18}/></button><span style={{ fontSize: 84 }}>Aa</span><strong>{selected.hex}</strong></div>
        <div className="engineered-modal-copy"><div className="eyebrow">{scaleName} scale · {selected.step}</div><h2>{selected.label}</h2><p>Hue scale step {selected.step} from the {scaleName} colour system.</p><p className="hex">{selected.oklch}</p><p className="hex">{selected.p3}</p><div className="toolbar"><a className="button" href={`${base}/scales/${slug}`}>Open full page</a><button className="button primary" onClick={close}>Done</button></div></div>
      </section>
    </div>}
  </>;
}
