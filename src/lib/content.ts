import { getCollection, type CollectionEntry } from 'astro:content';

type Dated = { data: { date: Date; draft: boolean } };

/** Drafts are visible while you run `npm run dev`, never in a production build. */
const visible = ({ data }: Dated) => import.meta.env.DEV || !data.draft;
const newestFirst = (a: Dated, b: Dated) => b.data.date.getTime() - a.data.date.getTime();

export async function getWork() {
  return (await getCollection('work', visible)).sort(newestFirst);
}
export async function getWorkshop() {
  return (await getCollection('workshop', visible)).sort(newestFirst);
}
export async function getLog() {
  return (await getCollection('log', visible)).sort(newestFirst);
}

export const WORK_TYPES = {
  research: 'Research',
  writing: 'Writing',
  media: 'Documentary & media',
  project: 'Project',
} as const satisfies Record<CollectionEntry<'work'>['data']['type'], string>;

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
const dayMonthFmt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' });

export const formatDate = (d: Date) => dateFmt.format(d);
export const formatDayMonth = (d: Date) => dayMonthFmt.format(d);
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export function readingMinutes(body: string | undefined) {
  const words = (body ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** True for links that leave this site. */
export const isExternal = (url: string) => url.startsWith('https://');

/** Pre-filled GitHub issue for joining a project (fields match the community repo's issue form). */
export function joinProjectUrl(community: string, projectTitle: string) {
  if (!community) return '/collaborate/#message';
  const params = new URLSearchParams({ template: 'join-a-project.yml', title: `[Join] ${projectTitle}`, project: projectTitle });
  return `${community}/issues/new?${params}`;
}
