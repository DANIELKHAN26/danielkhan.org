import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getWork, getLog, getWorkshop } from '../lib/content';
import { SITE } from '../site.config';

export async function GET(context: APIContext) {
  const [work, log, workshop] = await Promise.all([getWork(), getLog(), getWorkshop()]);
  const items = [
    ...work.map((e) => ({ title: e.data.title, description: e.data.summary, pubDate: e.data.date, link: `/work/${e.id}/`, categories: e.data.tags })),
    ...log.map((e) => ({ title: e.data.title, description: e.data.summary, pubDate: e.data.date, link: `/log/${e.id}/`, categories: e.data.tags })),
    ...workshop.map((e) => ({ title: `${e.data.title} (free ${e.data.kind.toLowerCase()})`, description: e.data.summary, pubDate: e.data.date, link: `/workshop/${e.id}/`, categories: e.data.tags })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: `${SITE.name} — new work and log`,
    description: SITE.description,
    site: context.site!,
    items,
    customData: '<language>en-gb</language>',
  });
}
