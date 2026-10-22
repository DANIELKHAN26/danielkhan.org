import type { APIContext } from 'astro';
import { SITE } from '../../site.config';

// RFC 9116. "Expires" is set one year from each build, so regular deploys keep it current.
export function GET({ site }: APIContext) {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  expires.setUTCHours(0, 0, 0, 0);
  const lines = [
    ...(SITE.contact.email ? [`Contact: mailto:${SITE.contact.email}`] : []),
    `Contact: ${new URL('/collaborate/#message', site)}`,
    `Expires: ${expires.toISOString()}`,
    'Preferred-Languages: en',
    `Canonical: ${new URL('/.well-known/security.txt', site)}`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
