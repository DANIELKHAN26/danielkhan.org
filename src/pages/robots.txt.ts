import type { APIContext } from 'astro';

export function GET({ site }: APIContext) {
  const body = ['User-agent: *', 'Allow: /', 'Disallow: /search/', '', `Sitemap: ${new URL('/sitemap-index.xml', site)}`, ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
