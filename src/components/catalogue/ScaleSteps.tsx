import { useState } from 'react';
import type { ScaleStep } from '../../lib/catalogue';
import { contrastSurfaceStyle } from '../../lib/colour';
import { CopyButton } from '../colour/CopyButton';

export default function ScaleSteps({
  steps,
  scaleName,
  selectedStep,
  onSelect,
}: {
  steps: ScaleStep[];
  scaleName: string;
  selectedStep?: number;
  onSelect: (step: ScaleStep) => void;
}) {
  const [layout, setLayout] = useState<'horizontal' | 'grid' | 'vertical'>('grid');
  return (
    <>
      <div className="scale-layout-controls" role="group" aria-label="Hue scale layout">
        <span>Layout</span>
        {(['horizontal', 'grid', 'vertical'] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={layout === option}
            onClick={() => setLayout(option)}
          >
            {option[0].toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>
      <div className="detail-scale" data-layout={layout}>
        {steps.map((step) => (
          <article className="hue-swatch-card scale-step" key={step.step}>
            <button
              type="button"
              className="hue-swatch-select"
              aria-pressed={selectedStep === step.step}
              aria-label={`Select ${scaleName} ${step.step}, ${step.label}`}
              onClick={() => onSelect(step)}
            >
              <span
                className="swatch"
                data-scale-name={scaleName}
                data-scale-step={step.step}
                style={contrastSurfaceStyle(step.hex)}
              />
            </button>
            <div className="hue-swatch-label">
              <span>{step.label}</span>
              <span>{step.step}</span>
            </div>
            <span className="hue-swatch-name">{scaleName}</span>
            <div className="hue-copy-actions">
              <CopyButton value={step.hex} label="HEX" />
              <CopyButton value={step.oklch} label="OKLCH" />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
