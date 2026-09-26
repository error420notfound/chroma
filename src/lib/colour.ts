import Color from 'colorjs.io';
import type { CSSProperties } from 'react';
import type { Colour } from './catalogue';

export function contrastRatio(foreground: string, background: string) {
  return new Color(foreground).contrast(new Color(background), 'WCAG21');
}

export function parseColour(value: string): string | null {
  try {
    const colour = new Color(value.trim());
    return colour.coords.every(Number.isFinite) ? colour.toString() : null;
  } catch {
    return null;
  }
}

export function bestTextColor(background: string) {
  return contrastRatio('#1F2328', background) >= contrastRatio('#FFFFFF', background)
    ? '#1F2328'
    : '#FFFFFF';
}

export function contrastSurfaceStyle(
  background: string,
  extra: CSSProperties = {},
): CSSProperties {
  return {
    ...extra,
    background,
    '--contrast-surface-color': background,
    '--contrast-surface-fallback': bestTextColor(background),
  } as CSSProperties;
}

export function inSRGB(value: string) {
  return new Color(value).inGamut('srgb');
}

export function fallbackSRGB(value: string) {
  const color = new Color(value).to('srgb');
  return color.toGamut({ space: 'srgb', method: 'oklch.c' }).toString({ format: 'hex' });
}

export function cssValues(colour: Colour) {
  return `--color: ${colour.hex};\n--color-oklch: ${colour.oklch};\n--color-p3: ${colour.p3};`;
}
