import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getWork, getLab, getUpdates } from '../lib/content';
import { PLATFORMS } from '../content.config';
import { SITE } from '../site.config';

export async function GET(context: APIContext) {
  const [work, lab, updates] = await Promise.all([getWork(), getLab(), getUpdates()]);
  const items = [
    ...work.map((e) => ({ title: e.data.title, description: e.data.summary, pubDate: e.data.date, link: `/work/${e.id}/`, categories: e.data.tags })),
    // Posts elsewhere link straight to the original (Substack, YouTube, …).
    ...updates.map((e) => ({ title: `${e.data.title} (${PLATFORMS[e.data.platform].label})`, description: e.data.summary ?? '', pubDate: e.data.date, link: e.data.url })),
    ...lab.map((e) => ({ title: e.data.kind === 'Experiment' ? `${e.data.title} (experiment)` : `${e.data.title} (free ${e.data.kind.toLowerCase()})`, description: e.data.summary, pubDate: e.data.date, link: `/lab/${e.id}/`, categories: e.data.tags })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: `${SITE.name} — research, projects and updates`,
    description: SITE.description,
    site: context.site!,
    items,
    customData: '<language>en-gb</language>',
  });
}
