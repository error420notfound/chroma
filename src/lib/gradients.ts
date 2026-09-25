import Color from 'colorjs.io';

export type GradientStop = { id: string; color: string; position: number; name: string };
export function gradientCss(stops: GradientStop[], space: string) {
  return `linear-gradient(in ${space}, ${stops.map((stop) => `${stop.color} ${stop.position}%`).join(', ')})`;
}
export function sampleGradient(stops: GradientStop[], space: string) {
  const ordered = [...stops].sort((a, b) => a.position - b.position);
  return ordered.slice(0, -1).flatMap((stop, index) => {
    const next = ordered[index + 1];
    const range = Math.max(1, next.position - stop.position);
    return Array.from({ length: 8 }, (_, n) =>
      new Color(stop.color)
        .range(next.color, { space })(n / 7)
        .toString({ format: 'hex' }),
    ).map((color, n) => ({ color, position: stop.position + (range * n) / 7 }));
  });
}
