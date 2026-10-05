import neutral from '../data/hue-scales/source/neutral-set.json';
import azure from '../data/hue-scales/azure.json';
import green from '../data/hue-scales/source/green.json';
import red from '../data/hue-scales/source/red.json';
import type { HueScale } from './catalogue';

// Catalogue values provide the pre-hydration and missing-record theme fallback.
export function foundationProperties(scales: HueScale[] = []): Record<string, string> {
  const properties: Record<string, string> = {};
  const neutralScale = scales.find((scale) => scale.slug === 'neutral-set');
  const azureScale = scales.find((scale) => scale.slug === 'azure');
  for (const step of neutral.steps) {
    properties[`--neutral-${step.step}`] =
      neutralScale?.steps.find((entry) => entry.step === step.step)?.hex ?? step.color.hex;
  }
  for (const step of azure.steps) {
    properties[`--azure-${step.step}`] =
      azureScale?.steps.find((entry) => entry.step === step.step)?.hex ?? step.hex;
  }
  for (const fallback of [green, red]) {
    const scale = scales.find((entry) => entry.slug === fallback.slug);
    for (const step of fallback.steps) {
      properties[`--${fallback.slug}-${step.step}`] =
        scale?.steps.find((entry) => entry.step === step.step)?.hex ?? step.color.hex;
    }
  }
  return properties;
}
export const foundationStyle = Object.entries(foundationProperties())
  .map(([name, value]) => `${name}:${value}`)
  .join(';');
export function applyCatalogueFoundation(scales: HueScale[]) {
  for (const [name, value] of Object.entries(foundationProperties(scales))) {
    document.documentElement.style.setProperty(name, value);
  }
}

export function motionSeconds(kind: 'fast' | 'standard'): number {
  const duration = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(`--motion-${kind}`),
  );
  return Number.isFinite(duration) ? duration / 1000 : 0;
}
