import fs from 'node:fs';
import path from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';
import researchSource from '../content/research.yaml?raw';
import librarySource from '../content/library.yaml?raw';

type Dated = { data: { date: Date; draft: boolean } };

/** Drafts are visible while you run `npm run dev`, never in a production build. */
const visible = ({ data }: Dated) => import.meta.env.DEV || !data.draft;
const newestFirst = (a: Dated, b: Dated) => b.data.date.getTime() - a.data.date.getTime();

export async function getWork() {
  return (await getCollection('work', visible)).sort(newestFirst);
}
export async function getLab() {
  return (await getCollection('lab', visible)).sort(newestFirst);
}
/** External work credited in the Lab library, in file order. */
export async function getLibrary() {
  const order = [...librarySource.matchAll(/^- id: *(\S+)/gm)].map((m) => m[1]);
  return (await getCollection('library')).sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
}
/** Posts from YouTube, Substack, LinkedIn and Facebook, newest first. */
export async function getUpdates() {
  return (await getCollection('updates', visible)).sort(newestFirst);
}
/** Research outputs, in the order they are written in src/content/research.yaml. */
export async function getResearch() {
  const order = [...researchSource.matchAll(/^- id: *(\S+)/gm)].map((m) => m[1]);
  return (await getCollection('research')).sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
}

export const WORK_TYPES = {
  research: 'Research',
  writing: 'Writing',
  media: 'Documentary',
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

const FORMATS: Record<string, string> = { csv: 'CSV', md: 'Markdown', txt: 'Text', pdf: 'PDF', zip: 'ZIP', json: 'JSON', docx: 'Word', xlsx: 'Excel' };
/** Format and real size of a download, read from public/ at build time. A missing local file fails the build. */
export function downloadInfo(url: string) {
  const ext = url.split(/[?#]/)[0].split('.').pop()?.toLowerCase() ?? '';
  let size = '';
  if (!isExternal(url)) {
    const bytes = fs.statSync(path.join(process.cwd(), 'public', decodeURIComponent(url))).size;
    size = bytes < 1024 ? `${bytes} bytes` : `${(bytes / 1024).toFixed(1)} KB`;
  }
  return { ext: ext.slice(0, 4).toUpperCase(), format: FORMATS[ext] ?? ext.toUpperCase(), size };
}
