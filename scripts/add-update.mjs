#!/usr/bin/env node
// Add one of your posts elsewhere (YouTube, Substack, LinkedIn, Facebook) to the Updates page.
//
//   npm run add -- <post-url>            e.g. npm run add -- https://youtu.be/VIDEO_ID
//   npm run add -- <post-url> --podcast  mark a YouTube video as a podcast episode
//
// It reads the post's public preview (title, description, image), saves the image inside the
// site (so visitors never load anything from the platform), and writes a Markdown file in
// src/content/updates/. If the platform blocks reading (LinkedIn often does), it writes a draft
// for you to complete. It never overwrites an existing file.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const CONTENT = join(ROOT, 'src/content/updates');
const ASSETS = join(ROOT, 'src/assets/updates');
const PLATFORMS = {
  youtube: ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'],
  substack: ['substack.com', '*.substack.com'],
  linkedin: ['linkedin.com', 'www.linkedin.com'],
  facebook: ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.watch'],
};
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36';
const MAX_HTML = 3 * 1024 * 1024;
const MAX_IMAGE = 8 * 1024 * 1024;

const die = (msg) => { console.error(`✗ ${msg}`); process.exit(1); };
const args = process.argv.slice(2);
const podcast = args.includes('--podcast');
const input = args.find((a) => !a.startsWith('--'));
if (!input) die('Give the link to your post, e.g. npm run add -- https://youtu.be/VIDEO_ID');

let url;
try { url = new URL(input.trim()); } catch { die(`Not a valid link: ${input}`); }
if (url.protocol !== 'https:') die('Only https:// links are accepted.');
const host = url.hostname.toLowerCase();
const platform = Object.keys(PLATFORMS).find((p) =>
  PLATFORMS[p].some((h) => (h.startsWith('*.') ? host.endsWith(h.slice(1)) : host === h)));
if (!platform) die(`Only YouTube, Substack, LinkedIn and Facebook links are supported (got ${host}).`);
if (podcast && platform !== 'youtube') die('--podcast is only for YouTube videos.');
// Drop tracking parameters but keep the ones that identify the post.
for (const key of [...url.searchParams.keys()]) {
  if (!(platform === 'youtube' && (key === 'v' || key === 'list'))) url.searchParams.delete(key);
}
url.hash = '';
const cleanUrl = url.toString();

// Refuse duplicates.
mkdirSync(CONTENT, { recursive: true });
for (const f of readdirSync(CONTENT)) {
  if (f.endsWith('.md') && readFileSync(join(CONTENT, f), 'utf8').includes(`url: ${JSON.stringify(cleanUrl)}`)) {
    die(`Already added: src/content/updates/${f}`);
  }
}

async function get(target, limit, accept) {
  const res = await fetch(target, { headers: { 'User-Agent': UA, Accept: accept }, redirect: 'follow', signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const len = Number(res.headers.get('content-length') || 0);
  if (len > limit) throw new Error('response too large');
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > limit) throw new Error('response too large');
  return { buf, type: res.headers.get('content-type') || '' };
}

const decode = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const meta = (html, name) => {
  const re = new RegExp(`<meta[^>]+(?:property|name|itemprop)=["']${name}["'][^>]*>`, 'i');
  const tag = html.match(re)?.[0];
  const content = tag?.match(/content=["']([^"']*)["']/i)?.[1];
  return content ? decode(content).trim() : undefined;
};

/** Publish date from structured data (Substack and others put it in JSON-LD). */
const jsonLdDate = (html) => html.match(/"(?:datePublished|uploadDate)"\s*:\s*"([^"]+)"/)?.[1];

let title, summary, imageUrl, date;
try {
  if (platform === 'youtube') {
    const id = url.hostname === 'youtu.be' ? url.pathname.slice(1).split('/')[0]
      : url.searchParams.get('v') || url.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]{11})/)?.[1];
    if (!id || !/^[\w-]{11}$/.test(id)) die('This YouTube link has no video ID. Use the video\'s own link.');
    const { buf } = await get(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`, MAX_HTML, 'application/json');
    title = JSON.parse(buf.toString('utf8')).title;
    const page = (await get(`https://www.youtube.com/watch?v=${id}`, MAX_HTML, 'text/html')).buf.toString('utf8');
    // YouTube's page description is unreliable for automated reads (it can show unrelated text),
    // so no summary is filled in — add one yourself if you want it on the card.
    date = meta(page, 'datePublished') || meta(page, 'uploadDate') || jsonLdDate(page);
    // hqdefault exists for every video (maxresdefault does not, for older or low-resolution uploads).
    imageUrl = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  } else {
    const page = (await get(cleanUrl, MAX_HTML, 'text/html')).buf.toString('utf8');
    title = meta(page, 'og:title') || page.match(/<title>([^<]+)<\/title>/i)?.[1];
    summary = meta(page, 'og:description') || meta(page, 'description');
    imageUrl = meta(page, 'og:image');
    date = meta(page, 'article:published_time') || meta(page, 'datePublished') || jsonLdDate(page);
  }
} catch (error) {
  console.warn(`! Could not read the post automatically (${error.message}). A draft will be created for you to complete.`);
}

// Publication date if found; otherwise today's local date (you can correct it in the file).
const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const day = date && !Number.isNaN(Date.parse(date)) ? new Date(date).toISOString().slice(0, 10) : localToday();
if (!date) console.warn('! Publish date not found — used today\'s date. Correct `date:` in the file if needed.');
const slug = ((title || `${platform}-post`).normalize('NFKD').replace(/[^\w\s-]/g, '').trim().toLowerCase()
  .replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 60).replace(/-$/, '')) || `${platform}-post`;
let name = `${day}-${slug}`;
for (let i = 2; existsSync(join(CONTENT, `${name}.md`)); i++) name = `${day}-${slug}-${i}`;

// Save the preview image locally (validated as a real image).
let imageField = '';
if (imageUrl && imageUrl.startsWith('https://')) {
  try {
    const { buf } = await get(imageUrl, MAX_IMAGE, 'image/*');
    const sig = buf.subarray(0, 12);
    const ext = sig[0] === 0xff && sig[1] === 0xd8 ? 'jpg'
      : sig.toString('hex', 0, 8) === '89504e470d0a1a0a' ? 'png'
      : sig.toString('ascii', 0, 4) === 'RIFF' && sig.toString('ascii', 8, 12) === 'WEBP' ? 'webp' : '';
    if (!ext) throw new Error('not a JPEG, PNG or WebP image');
    mkdirSync(ASSETS, { recursive: true });
    writeFileSync(join(ASSETS, `${name}.${ext}`), buf);
    imageField = `image: ../../assets/updates/${name}.${ext}\nimageAlt: ${JSON.stringify(`Preview image for “${title || 'this post'}”`)}\n`;
  } catch (error) {
    console.warn(`! Preview image skipped (${error.message}).`);
  }
}

const complete = Boolean(title);
const clip = (s, n) => (s && s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
const body = `---
title: ${JSON.stringify(clip(title || 'TITLE — replace with the post title', 160))}
date: ${day}
platform: ${platform}
url: ${JSON.stringify(cleanUrl)}
${summary ? `summary: ${JSON.stringify(clip(summary.replace(/\s+/g, ' '), 320))}\n` : ''}${imageField}${podcast ? 'podcast: true\n' : ''}draft: ${complete ? 'false' : 'true'}
---
${complete ? '' : '\n<!-- Fill in the title (and a one-sentence summary), then set draft: false. -->\n'}`;
writeFileSync(join(CONTENT, `${name}.md`), body);

console.log(`${complete ? '✓ Added' : '! Draft created'}: src/content/updates/${name}.md`);
console.log(`  ${platform} · ${day} · ${title || '(title needed)'}`);
if (!imageField) console.log('  No preview image — the card will show the platform style instead.');
console.log('  Check it with `npm run dev`, then commit and push to publish.');
