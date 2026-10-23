import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

/** A link must be https:// or a path on this site such as /downloads/file.csv */
const href = z
  .string()
  .regex(/^(https:\/\/[^\s]+|\/[a-z0-9][^\s]*)$/i, 'Use a full https:// URL or a /path on this site');

const httpsUrl = z.string().regex(/^https:\/\/[^\s]+$/i, 'Use a full https:// URL');

const link = z.object({ label: z.string().min(1), url: href });

/** Honest, fixed status labels shown on every entry. */
export const STATUSES = [
  'Concept',
  'In progress',
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

/* ---------- Projects (/work/) ---------- */
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

/* ---------- Lab (/lab/): your experiments and released tools ---------- */
export const LAB_KINDS = ['Experiment', 'Tool', 'Template'] as const;

const lab = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/lab' }),
  schema: z
    .object({
      ...common,
      kind: z.enum(LAB_KINDS),
      status: z.enum(STATUSES),
      /** One line on what is being tried or built — shown on the Lab index. */
      focus: z.string().max(160).optional(),
      version: z.string().optional(),
      licence: z.string().optional(),
      /** A file in /public/downloads/ or an https:// release asset. */
      download: href.optional(),
      source: href.optional(),
      demo: href.optional(),
      requirements: z.string().optional(),
      links: z.array(link).default([]),
      /** Credit for anything adapted from someone else's work. */
      basedOn: z
        .array(z.object({ name: z.string(), url: href, author: z.string().optional(), licence: z.string() }))
        .default([]),
    })
    .refine((d) => d.kind === 'Experiment' || (d.version && d.licence), {
      message: 'Tools and templates need a version and a licence.',
      path: ['licence'],
    })
    .refine((d) => d.kind === 'Experiment' || d.download || d.source || d.demo, {
      message: 'Tools and templates need at least one of download, source or demo, so visitors can use them.',
    }),
});

/* ---------- Library: credited external work, edited in src/content/library.yaml ---------- */
const library = defineCollection({
  loader: file('src/content/library.yaml'),
  schema: z.object({
    title: z.string().min(2),
    url: httpsUrl,
    by: z.string().min(2),
    topic: z.enum(['Verification & news data', 'Speech & video', 'Bengali NLP']),
    licence: z.string().min(2),
    note: z.string().min(10).max(220),
  }),
});

/* ---------- Updates (/updates/): your posts elsewhere, added by link ---------- */
export const PLATFORMS = {
  youtube: { label: 'YouTube', hosts: ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'] },
  substack: { label: 'Substack', hosts: ['substack.com', '*.substack.com'] },
  linkedin: { label: 'LinkedIn', hosts: ['linkedin.com', 'www.linkedin.com'] },
  facebook: { label: 'Facebook', hosts: ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.watch'] },
} as const;
export type Platform = keyof typeof PLATFORMS;

const hostMatches = (url: string, platform: Platform) => {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return PLATFORMS[platform].hosts.some((h) => (h.startsWith('*.') ? host.endsWith(h.slice(1)) : host === h));
  } catch {
    return false;
  }
};

/** YouTube video ID from watch, youtu.be, shorts, live and embed URLs. */
export function youtubeId(url: string): string | undefined {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('/')[0] || undefined;
    if (u.searchParams.get('v')) return u.searchParams.get('v') ?? undefined;
    const m = u.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]{11})/);
    return m?.[1];
  } catch {
    return undefined;
  }
}

const updates = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/updates' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(3).max(160),
        date: z.coerce.date(),
        platform: z.enum(Object.keys(PLATFORMS) as [Platform, ...Platform[]]),
        url: httpsUrl,
        /** A sentence or two shown on the card — usually the post's own opening. */
        summary: z.string().max(320).optional(),
        /** Who wrote it, e.g. "Daniel Khan & Raima Paromita" — shown under the summary. */
        byline: z.string().max(120).optional(),
        image: image().optional(),
        imageAlt: z.string().optional(),
        /** Required by most photo licences when the image is not yours, e.g. "Photo: Jane Doe / Wikimedia Commons, CC BY-SA 4.0". */
        imageCredit: z.string().max(160).optional(),
        /** Optional link for the credit — usually the licence, e.g. https://creativecommons.org/licenses/by-sa/4.0/ */
        imageCreditUrl: httpsUrl.optional(),
        /** true = an episode of the podcast (shown in the Podcast section). */
        podcast: z.boolean().default(false),
        draft: z.boolean().default(false),
      })
      .refine((d) => hostMatches(d.url, d.platform), {
        message: 'The url does not belong to the chosen platform — check both.',
        path: ['url'],
      })
      .refine((d) => d.platform !== 'youtube' || !!youtubeId(d.url), {
        message: 'This YouTube link has no video ID. Use the video\'s own link (watch?v=…, youtu.be/…, or /shorts/…).',
        path: ['url'],
      })
      .refine((d) => !d.image || !!d.imageAlt, {
        message: 'Add imageAlt (a short description of the image) when you set an image.',
        path: ['imageAlt'],
      }),
});

/* ---------- Research, edited in src/content/research.yaml ---------- */
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

export const collections = { work, lab, library, updates, research };
