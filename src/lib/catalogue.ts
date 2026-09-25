import { z } from 'zod';

const sourceColour = z.object({
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  oklch: z.object({ l: z.number(), c: z.number(), h: z.number() }),
  displayP3: z.object({ r: z.number(), g: z.number(), b: z.number() }),
});
const sourceStep = z.object({
  step: z.number().int(),
  label: z.string(),
  color: sourceColour,
  textColor: z.literal('auto'),
});
const sourceScale = z.object({
  id: z.string(),
  type: z.literal('scale'),
  name: z.string(),
  slug: z.string(),
  tags: z.array(z.string()),
  steps: z.array(sourceStep).length(11),
  referenceColors: z
    .array(z.object({ id: z.string(), label: z.string(), color: sourceColour }))
    .optional(),
  contrastExamples: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        foreground: sourceColour,
        background: sourceColour,
        sampleText: z.string().optional(),
      }),
    )
    .optional(),
});
const sourceEngineered = z.object({
  id: z.string(),
  type: z.literal('engineered'),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  color: sourceColour,
  textColor: z.literal('auto'),
  relatedScaleId: z.string().optional(),
});

const colorSchema = z.object({
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  oklch: z.string().startsWith('oklch('),
  p3: z.string().startsWith('color(display-p3'),
  textColor: z.literal('auto'),
});
const stepSchema = colorSchema.extend({ step: z.number().int(), label: z.string() });
const scaleSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  family: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  steps: z.array(stepSchema).length(11),
  referenceColors: z.array(z.object({ name: z.string(), hex: z.string() })).optional(),
  contrastExamples: z
    .array(z.object({ foreground: z.string(), background: z.string(), label: z.string() }))
    .optional(),
});
const engineeredSchema = colorSchema.extend({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  relatedScaleId: z.string().optional(),
});

export type Colour = z.infer<typeof colorSchema>;
export type ScaleStep = z.infer<typeof stepSchema>;
export type HueScale = z.infer<typeof scaleSchema>;
export type EngineeredHue = z.infer<typeof engineeredSchema>;
type SourceColour = z.infer<typeof sourceColour>;

const sourceScales = import.meta.glob(
  ['../data/hue-scales/source/*.json', '!../data/hue-scales/source/index.json'],
  {
    eager: true,
    import: 'default',
  },
);
const sourceEngineeredHues = import.meta.glob(
  ['../data/engineered-hues/source/*.json', '!../data/engineered-hues/source/index.json'],
  {
    eager: true,
    import: 'default',
  },
);
const cssColour = (colour: SourceColour) => ({
  hex: colour.hex,
  oklch: `oklch(${colour.oklch.l} ${colour.oklch.c} ${colour.oklch.h})`,
  p3: `color(display-p3 ${colour.displayP3.r} ${colour.displayP3.g} ${colour.displayP3.b})`,
  textColor: 'auto' as const,
});
const familyFrom = (name: string) => name.split(/\s+/)[0] ?? 'Mixed';

export const hueScales = Object.values(sourceScales)
  .map((record) => {
    const source = sourceScale.parse(record);
    return scaleSchema.parse({
      id: source.id,
      slug: source.slug,
      name: source.name,
      family: familyFrom(source.name),
      description: `A calibrated ${source.name.toLowerCase()} hue scale from the HS108 source catalogue.`,
      tags: source.tags,
      steps: source.steps.map((step) => ({
        step: step.step,
        label: step.label,
        ...cssColour(step.color),
      })),
      referenceColors: source.referenceColors?.map((entry) => ({
        name: entry.label,
        hex: entry.color.hex,
      })),
      contrastExamples: source.contrastExamples?.map((entry) => ({
        label: entry.label,
        foreground: entry.foreground.hex,
        background: entry.background.hex,
      })),
    });
  })
  .toSorted((a, b) => a.name.localeCompare(b.name));

export const engineeredHues = Object.values(sourceEngineeredHues)
  .map((record) => {
    const source = sourceEngineered.parse(record);
    return engineeredSchema.parse({
      id: source.id,
      slug: source.slug,
      name: source.name,
      description: source.description,
      tags: source.tags,
      relatedScaleId: source.relatedScaleId,
      ...cssColour(source.color),
    });
  })
  .toSorted((a, b) => a.name.localeCompare(b.name));

export type CatalogueItem = Colour & {
  id: string;
  slug: string;
  name: string;
  description: string;
  tags: string[];
  type: 'scale' | 'engineered';
  family?: string;
  step?: number;
};
export const catalogueItems: CatalogueItem[] = [
  ...hueScales.flatMap((scale) =>
    scale.steps.map((step) => ({
      ...step,
      id: `${scale.id}-${step.step}`,
      slug: scale.slug,
      name: scale.name,
      description: scale.description,
      tags: scale.tags,
      family: scale.family,
      type: 'scale' as const,
    })),
  ),
  ...engineeredHues.map((hue) => ({ ...hue, type: 'engineered' as const })),
];
export const getScale = (slug: string) => hueScales.find((scale) => scale.slug === slug);
export const getEngineeredHue = (slug: string) => engineeredHues.find((hue) => hue.slug === slug);
