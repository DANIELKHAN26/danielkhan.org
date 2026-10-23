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
// Whole words only ("Christodoulopoulos" must not match TODO); TODO/FIXME must be upper-case markers.
const placeholders = /\bTODO\b|\bFIXME\b|lorem ipsum|example\.com|YOUR-USERNAME|\(draft\)|TITLE — replace/i;

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const isRedirectOr404 = file.endsWith('404.html');

  if (!/<title>[^<]{3,}<\/title>/.test(html)) fail(file, 'missing <title>');
  if (!/<meta name="description" content="[^"]{20,}"/.test(html)) fail(file, 'missing or short meta description');
  if (!isRedirectOr404 && !/<link rel="canonical" href="https:\/\//.test(html)) fail(file, 'missing canonical URL');
  if (!/http-equiv="content-security-policy"/.test(html)) fail(file, 'missing Content-Security-Policy meta');
  if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) fail(file, 'must have exactly one <h1>');
  // A bare `alt` attribute is valid (it equals alt="", used for decorative images).
  if (/<img(?![^>]*\salt(?:=|[\s>]))[^>]*>/.test(html)) fail(file, 'image without alt attribute');
  // Look for placeholders only in the page's own text, not inside its scripts.
  const outsideScripts = html.split(/<script\b[\s\S]*?<\/script[^>]*>/i).join(' ');
  const placeholder = outsideScripts.match(placeholders);
  if (placeholder) fail(file, `placeholder text found: ${placeholder[0]}`);
  for (const d of drafts) if (html.includes(`/work/${d}/`)) fail(file, `links to draft "${d}"`);

  for (const [, url] of html.matchAll(/\s(?:href|src)="(\/[^"]*)"/g)) {
    if (url.startsWith('//')) continue;
    if (!exists(url)) { fail(file, `broken internal link ${url}`); continue; }
    const [path, fragment] = url.split('#');
    if (fragment) {
      const target = join(DIST, decodeURIComponent(path.split('?')[0]), path.endsWith('.html') ? '' : 'index.html');
      if (existsSync(target) && !readFileSync(target, 'utf8').includes(`id="${fragment}"`)) fail(file, `link to missing section ${url}`);
    }
  }
  for (const [, fragment] of html.matchAll(/\shref="#([^"]+)"/g)) {
    if (!html.includes(`id="${fragment}"`)) fail(file, `link to missing section #${fragment}`);
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

// Cloudflare Workers static-asset limits: 20,000 files and 25 MiB per file.
const allFiles = walk(DIST);
if (allFiles.length > 20000) errors.push(`${allFiles.length} files — over Cloudflare's 20,000-file limit`);
let totalBytes = 0;
for (const f of allFiles) {
  const size = statSync(f).size;
  totalBytes += size;
  if (size > 25 * 1024 * 1024) errors.push(`${relative(DIST, f)} is ${(size / 1048576).toFixed(1)} MiB — over the 25 MiB per-file limit (host videos on YouTube instead)`);
}

const rss = readFileSync(join(DIST, 'rss.xml'), 'utf8');
if (!rss.includes('<item>')) errors.push('rss.xml has no items');

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s) in dist/:\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log(`✓ dist/ verified: ${pages.length} pages, ${allFiles.length} files, ${(totalBytes / 1048576).toFixed(1)} MiB — links, metadata, CSP, drafts, placeholders and size limits OK.`);
