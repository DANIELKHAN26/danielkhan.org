import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getWork, getLog, getLab } from '../lib/content';
import { SITE } from '../site.config';

export async function GET(context: APIContext) {
  const [work, log, lab] = await Promise.all([getWork(), getLog(), getLab()]);
  const items = [
    ...work.map((e) => ({ title: e.data.title, description: e.data.summary, pubDate: e.data.date, link: `/work/${e.id}/`, categories: e.data.tags })),
    ...log.map((e) => ({ title: e.data.title, description: e.data.summary, pubDate: e.data.date, link: `/log/${e.id}/`, categories: e.data.tags })),
    ...lab.map((e) => ({ title: e.data.kind === 'Experiment' ? `${e.data.title} (experiment)` : `${e.data.title} (free ${e.data.kind.toLowerCase()})`, description: e.data.summary, pubDate: e.data.date, link: `/lab/${e.id}/`, categories: e.data.tags })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: `${SITE.name} — new work and log`,
    description: SITE.description,
    site: context.site!,
    items,
    customData: '<language>en-gb</language>',
  });
}
