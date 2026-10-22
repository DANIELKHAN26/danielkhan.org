// Post-build checks for the generated site in dist/. Run with `npm test`.
// Fails (exit 1) on broken internal links, missing metadata, leaked drafts or placeholder text.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const errors = [];
const fail = (file, msg) => errors.push(`${relative(DIST, file) || '/'}: ${msg}`);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

/** Resolve a site path the way a static host does (folder → index.html). */
function exists(path) {
  const clean = decodeURIComponent(path.split(/[?#]/)[0]);
  const target = join(DIST, clean);
  return existsSync(target) && (statSync(target).isFile() || existsSync(join(target, 'index.html')));
}

const pages = walk(DIST).filter((f) => f.endsWith('.html'));
const drafts = ['evidence-led-writing', 'the-second-question'];
const placeholders = /lorem ipsum|TODO|FIXME|example\.com|YOUR-USERNAME|\(draft\)/i;

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const isRedirectOr404 = file.endsWith('404.html');

  if (!/<title>[^<]{3,}<\/title>/.test(html)) fail(file, 'missing <title>');
  if (!/<meta name="description" content="[^"]{20,}"/.test(html)) fail(file, 'missing or short meta description');
  if (!isRedirectOr404 && !/<link rel="canonical" href="https:\/\//.test(html)) fail(file, 'missing canonical URL');
  if (!/http-equiv="content-security-policy"/.test(html)) fail(file, 'missing Content-Security-Policy meta');
  if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) fail(file, 'must have exactly one <h1>');
  if (/<img(?![^>]*\balt=)[^>]*>/.test(html)) fail(file, 'image without alt attribute');
  if (placeholders.test(html.replace(/<script[\s\S]*?<\/script>/g, ''))) fail(file, `placeholder text found: ${html.match(placeholders)[0]}`);
  for (const d of drafts) if (html.includes(`/work/${d}/`)) fail(file, `links to draft "${d}"`);

  for (const [, url] of html.matchAll(/\s(?:href|src)="(\/[^"]*)"/g)) {
    if (url.startsWith('//')) continue;
    if (!exists(url)) fail(file, `broken internal link ${url}`);
  }
  for (const [, set] of html.matchAll(/\ssrcset="([^"]+)"/g)) {
    for (const part of set.split(',')) {
      const url = part.trim().split(/\s+/)[0];
      if (url.startsWith('/') && !exists(url)) fail(file, `broken srcset image ${url}`);
    }
  }
}

for (const d of drafts) if (existsSync(join(DIST, 'work', d))) errors.push(`draft "${d}" was built into dist/`);
for (const required of ['index.html', '404.html', 'rss.xml', 'sitemap-index.xml', 'pagefind/pagefind.js', 'favicon.svg']) {
  if (!existsSync(join(DIST, required))) errors.push(`missing ${required}`);
}
const headers = existsSync(join(DIST, '_headers')) ? readFileSync(join(DIST, '_headers'), 'utf8') : '';
for (const h of ['Strict-Transport-Security', "frame-ancestors 'none'", 'X-Content-Type-Options: nosniff', 'immutable']) {
  if (!headers.includes(h)) errors.push(`_headers is missing ${h}`);
}
for (const f of ['robots.txt', '.well-known/security.txt']) if (!existsSync(join(DIST, f))) errors.push(`missing ${f}`);

const rss = readFileSync(join(DIST, 'rss.xml'), 'utf8');
if (!rss.includes('<item>')) errors.push('rss.xml has no items');

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s) in dist/:\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log(`✓ dist/ verified: ${pages.length} pages, internal links, metadata, CSP, drafts and placeholders all OK.`);
