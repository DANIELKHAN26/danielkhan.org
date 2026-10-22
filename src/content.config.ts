import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

/** A link must be https:// or a path on this site such as /downloads/file.csv */
const href = z
  .string()
  .regex(/^(https:\/\/[^\s]+|\/[a-z0-9][^\s]*)$/i, 'Use a full https:// URL or a /path on this site');

const link = z.object({ label: z.string().min(1), url: href });

/** Honest, fixed status labels shown on every entry. */
export const STATUSES = [
  'Concept',
  'In development',
  'Ongoing',
  'Published',
  'Released',
  'Paused',
  'Archived',
] as const;

const common = {
  title: z.string().min(3).max(100),
  summary: z.string().min(20).max(240),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  /** Drafts appear in `npm run dev` only and are never built for the live site. */
  draft: z.boolean().default(false),
};

const work = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/work' }),
  schema: ({ image }) =>
    z
      .object({
        ...common,
        type: z.enum(['research', 'writing', 'media', 'project']),
        status: z.enum(STATUSES),
        featured: z.boolean().default(false),
        cover: image().optional(),
        coverAlt: z.string().optional(),
        links: z.array(link).default([]),
        /** Set open: true to list this project on /collaborate/ with what help you need. */
        collaboration: z
          .object({ open: z.boolean(), needs: z.array(z.string()).default([]) })
          .optional(),
      })
      .refine((d) => !d.cover || !!d.coverAlt, {
        message: 'Add coverAlt (a text description of the image) when you set a cover.',
        path: ['coverAlt'],
      }),
});

const workshop = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/workshop' }),
  schema: z
    .object({
      ...common,
      kind: z.enum(['Template', 'Tool', 'Design', 'Code', 'Guide']),
      status: z.enum(STATUSES),
      version: z.string().min(1),
      licence: z.string().min(2),
      /** A file in /public/downloads/ or an https:// release asset. */
      download: href.optional(),
      /** Source repository, e.g. https://github.com/you/tool */
      source: href.optional(),
      /** A live demo or in-browser tool. */
      demo: href.optional(),
      requirements: z.string().optional(),
      /** Credit for anything adapted from someone else's work. */
      basedOn: z
        .array(
          z.object({
            name: z.string(),
            url: href,
            author: z.string().optional(),
            licence: z.string(),
          }),
        )
        .default([]),
    })
    .refine((d) => d.download || d.source || d.demo, {
      message: 'A workshop entry needs at least one of download, source or demo, so visitors can use it.',
    }),
});

const log = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/log' }),
  schema: z.object({
    ...common,
    links: z.array(link).default([]),
  }),
});

/** Research outputs, edited in src/content/research.yaml. */
export const RESEARCH_KINDS = {
  'under-review': 'Under review',
  accepted: 'Accepted paper',
  presented: 'Conference paper',
  seminar: 'Seminar paper',
  thesis: 'Thesis project',
  project: 'Research project',
} as const;

const research = defineCollection({
  loader: file('src/content/research.yaml'),
  schema: z.object({
    title: z.string().min(5),
    kind: z.enum(Object.keys(RESEARCH_KINDS) as [keyof typeof RESEARCH_KINDS, ...(keyof typeof RESEARCH_KINDS)[]]),
    venue: z.string().optional(),
    year: z.number().int().min(1990).max(2100).optional(),
    url: href.optional(),
  }),
});

export const collections = { work, workshop, log, research };
