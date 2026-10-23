#!/usr/bin/env node
// Add your posts from YouTube, Substack, LinkedIn or Facebook to the Updates page.
//
//   npm run add -- <post-link>                       read the post's public preview automatically
//   npm run add -- <post-link> --title "…" [--summary "…"] [--image ~/Pictures/shot.png] [--date 2026-11-01]
//                                                    fill in details yourself (best for LinkedIn / Facebook)
//   npm run add -- <youtube-link> --podcast          mark a video as a podcast episode
//   npm run add -- <post-link> --no-image            don't copy the preview image
//   npm run sync                                     import new posts from your Substack and YouTube feeds
//
// Only add your own posts (or ones whose images you may show): the preview image is copied into the site,
// so visitors never load anything from the platform. Nothing is ever overwritten.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const CONTENT = join(ROOT, 'src/content/updates');
const ASSETS = join(ROOT, 'src/assets/updates');
const FEEDS = JSON.parse(readFileSync(join(ROOT, 'src/data/feeds.json'), 'utf8'));
const PLATFORMS = {
  youtube: ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'],
  substack: ['substack.com', '*.substack.com'],
  linkedin: ['linkedin.com', 'www.linkedin.com'],
  facebook: ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.watch'],
};
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36';
const MAX_HTML = 3 * 1024 * 1024;
const MAX_IMAGE = 8 * 1024 * 1024;

class UserError extends Error {}

/* ---------------- helpers ---------------- */

function parseArgs(argv) {
  const opts = { flags: new Set(), values: {}, positional: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (['--title', '--summary', '--image', '--date'].includes(a)) {
      if (argv[i + 1] === undefined) throw new UserError(`${a} needs a value.`);
      opts.values[a.slice(2)] = argv[++i];
    } else if (a.startsWith('--')) {
      if (!['podcast', 'no-image', 'draft', 'sync'].includes(a.slice(2))) {
        throw new UserError(`Unknown option ${a}. Options: --title, --summary, --image, --date, --podcast, --no-image, --draft.`);
      }
      opts.flags.add(a.slice(2));
    }
    else opts.positional.push(a);
  }
  return opts;
}

function platformOf(url) {
  const host = url.hostname.toLowerCase();
  return Object.keys(PLATFORMS).find((p) => PLATFORMS[p].some((h) => (h.startsWith('*.') ? host.endsWith(h.slice(1)) : host === h)));
}

function youtubeIdOf(url) {
  if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('/')[0];
  return url.searchParams.get('v') || url.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]{11})/)?.[1];
}

/** Validate a link and remove tracking parameters. */
function normalise(input) {
  let url;
  try { url = new URL(String(input).trim()); } catch { throw new UserError(`Not a valid link: ${input}`); }
  if (url.protocol !== 'https:') throw new UserError('Only https:// links are accepted.');
  const platform = platformOf(url);
  if (!platform) throw new UserError(`Only YouTube, Substack, LinkedIn and Facebook links are supported (got ${url.hostname}).`);
  if (platform === 'youtube') {
    const id = youtubeIdOf(url);
    if (!id || !/^[\w-]{11}$/.test(id)) throw new UserError("This YouTube link has no video ID. Use the video's own link.");
    return { url: `https://www.youtube.com/watch?v=${id}`, platform, videoId: id };
  }
  for (const key of [...url.searchParams.keys()]) url.searchParams.delete(key);
  url.hash = '';
  return { url: url.toString(), platform };
}

function existingUrls() {
  mkdirSync(CONTENT, { recursive: true });
  const urls = new Set();
  for (const f of readdirSync(CONTENT)) {
    if (!f.endsWith('.md')) continue;
    const m = readFileSync(join(CONTENT, f), 'utf8').match(/^url:\s*"?([^"\n]+)"?/m);
    if (m) urls.add(m[1].trim());
  }
  return urls;
}

/** Fetch with a timeout, a size limit, and up to three attempts for network errors. */
async function get(target, limit, accept) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(target, { headers: { 'User-Agent': UA, Accept: accept }, redirect: 'follow', signal: AbortSignal.timeout(15000) });
      if (!res.ok) { const e = new Error(`HTTP ${res.status}`); e.status = res.status; throw e; }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > limit) throw new Error('response too large');
      return buf;
    } catch (error) {
      lastError = error;
      if (error.status && error.status < 500 && error.status !== 429) break; // a real refusal: don't retry
      if (attempt < 3) await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  throw lastError;
}

const decode = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const meta = (html, name) => {
  const tag = html.match(new RegExp(`<meta[^>]+(?:property|name|itemprop)=["']${name}["'][^>]*>`, 'i'))?.[0];
  const content = tag?.match(/content=["']([^"']*)["']/i)?.[1];
  return content ? decode(content).trim() : undefined;
};
const jsonLdDate = (html) => html.match(/"(?:datePublished|uploadDate)"\s*:\s*"([^"]+)"/)?.[1];

function imageExt(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8) return 'jpg';
  if (buf.toString('hex', 0, 8) === '89504e470d0a1a0a') return 'png';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return '';
}

const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const clip = (s, n) => (s && s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
const slugify = (s, fallback) => (s || '').normalize('NFKD').replace(/[^\w\s-]/g, '').trim().toLowerCase()
  .replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 60).replace(/-$/, '') || fallback;

/* ---------------- read a post's public preview ---------------- */

/** Substack subtitles often end "… by Name & Name". Keep that credit, but as its own byline. */
function splitByline(text) {
  const m = text?.match(/^(.*\S)\s+by\s+(\p{Lu}[\p{L}’'.-]*(?:\s+\p{Lu}[\p{L}’'.-]*)*(?:\s*(?:&|,|and)\s*\p{Lu}[\p{L}’'.-]*(?:\s+\p{Lu}[\p{L}’'.-]*)*)*)$/u);
  return m && m[2].length <= 120 ? { summary: m[1], byline: m[2] } : { summary: text, byline: undefined };
}

async function readPreview({ url, platform, videoId }) {
  const out = {};
  if (platform === 'youtube') {
    const o = JSON.parse((await get(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`, MAX_HTML, 'application/json')).toString('utf8'));
    out.title = o.title;
    try { out.date = jsonLdDate((await get(url, MAX_HTML, 'text/html')).toString('utf8')); } catch {}
    // YouTube's page description is unreliable for automated reads, so no summary is filled in.
    out.imageUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`; // exists for every video
  } else {
    const page = (await get(url, MAX_HTML, 'text/html')).toString('utf8');
    out.title = meta(page, 'og:title') || page.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
    ({ summary: out.summary, byline: out.byline } = splitByline(meta(page, 'og:description') || meta(page, 'description')));
    out.imageUrl = meta(page, 'og:image');
    out.date = meta(page, 'article:published_time') || meta(page, 'datePublished') || jsonLdDate(page);
  }
  return out;
}

/* ---------------- write one update ---------------- */

async function addOne(link, options = {}) {
  const post = normalise(link);
  if (existingUrls().has(post.url)) return { status: 'exists', url: post.url };
  if (options.podcast && post.platform !== 'youtube') throw new UserError('--podcast is only for YouTube videos.');
  if (options.date && !/^\d{4}-\d{2}-\d{2}$/.test(options.date)) throw new UserError('--date must look like 2026-11-01.');

  let preview = {};
  let readError;
  if (!options.title || (!options.summary && post.platform !== 'youtube') || (!options.image && !options.noImage)) {
    try { preview = await readPreview(post); } catch (error) { readError = error; }
  }
  const title = options.title || preview.title;
  const summary = options.summary ?? preview.summary;
  const byline = options.summary ? undefined : preview.byline;
  const dateRaw = options.date || preview.date;
  const day = dateRaw && !Number.isNaN(Date.parse(dateRaw)) ? new Date(dateRaw).toISOString().slice(0, 10) : localToday();

  let name = `${day}-${slugify(title, `${post.platform}-post`)}`;
  for (let i = 2; existsSync(join(CONTENT, `${name}.md`)); i++) name = `${day}-${slugify(title, `${post.platform}-post`)}-${i}`;

  let imageField = '';
  const notes = [];
  if (!options.noImage) {
    try {
      let buf;
      if (options.image) {
        const path = resolve(options.image.replace(/^~(?=\/)/, homedir()));
        if (!existsSync(path) || !statSync(path).isFile()) throw new Error(`file not found: ${path}`);
        if (statSync(path).size > MAX_IMAGE) throw new Error('image is larger than 8 MB');
        buf = readFileSync(path);
      } else if (preview.imageUrl?.startsWith('https://')) {
        buf = await get(preview.imageUrl, MAX_IMAGE, 'image/*');
      }
      if (buf) {
        const ext = imageExt(buf);
        if (!ext) throw new Error('not a JPEG, PNG or WebP image');
        mkdirSync(ASSETS, { recursive: true });
        writeFileSync(join(ASSETS, `${name}.${ext}`), buf);
        imageField = `image: ../../assets/updates/${name}.${ext}\nimageAlt: ${JSON.stringify(`Image for “${title || 'this post'}”`)}\n`;
      }
    } catch (error) {
      notes.push(`image skipped (${error.message})`);
    }
  }

  const complete = Boolean(title);
  const source = options.title ? 'details entered by you' : "the post's public preview";
  writeFileSync(join(CONTENT, `${name}.md`), `---
# Added with \`npm run ${options.viaSync ? 'sync' : 'add'}\` on ${localToday()} from ${source}. Edit freely.
title: ${JSON.stringify(clip(title || 'TITLE — replace with the post title', 160))}
date: ${day}
platform: ${post.platform}
url: ${JSON.stringify(post.url)}
${summary ? `summary: ${JSON.stringify(clip(summary.replace(/\s+/g, ' '), 320))}\n` : ''}${byline ? `byline: ${JSON.stringify(clip(byline, 120))}\n` : ''}${imageField}${options.podcast ? 'podcast: true\n' : ''}draft: ${complete && !options.draft ? 'false' : 'true'}
---
${complete ? '' : '\n<!-- Fill in the title (and optionally a summary), then set draft: false. -->\n'}`);

  if (!dateRaw) notes.push("publish date not found — used today's date; correct `date:` if needed");
  if (readError && !options.title) notes.push(`could not read the post automatically (${readError.message})`);
  return { status: complete ? 'added' : 'draft', file: `src/content/updates/${name}.md`, title, day, platform: post.platform, notes };
}

/* ---------------- sync from your own public feeds ---------------- */

async function feedItems(feedUrl) {
  const xml = (await get(feedUrl, MAX_HTML, 'application/xml')).toString('utf8');
  const links = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const l = m[1].match(/<link>([^<]+)<\/link>/)?.[1];
    if (l) links.push(l.trim());
  }
  for (const m of xml.matchAll(/<yt:videoId>([\w-]{11})<\/yt:videoId>/g)) links.push(`https://www.youtube.com/watch?v=${m[1]}`);
  return links;
}

async function sync() {
  const podcastIds = new Set();
  if (FEEDS.youtubePodcastPlaylist) {
    try {
      for (const l of await feedItems(FEEDS.youtubePodcastPlaylist)) podcastIds.add(new URL(l).searchParams.get('v'));
    } catch (error) {
      console.warn(`! Podcast playlist feed could not be read (${error.message}).`);
    }
  }
  let added = 0;
  for (const [label, feed] of [['Substack', FEEDS.substack], ['YouTube', FEEDS.youtubeChannel]]) {
    if (!feed) continue;
    let links;
    try { links = await feedItems(feed); } catch (error) { console.warn(`! ${label} feed could not be read (${error.message}). Try again later.`); continue; }
    for (const link of links) {
      const id = label === 'YouTube' ? new URL(link).searchParams.get('v') : '';
      const r = await addOne(link, { viaSync: true, podcast: podcastIds.has(id) });
      if (r.status === 'exists') continue;
      added++;
      report(r);
    }
  }
  console.log(added ? `\n${added} new post(s) added. Check with \`npm run dev\`, then commit and push.` : '✓ Already up to date — no new posts in your feeds.');
}

function report(r) {
  if (r.status === 'exists') { console.log(`= Already on the site: ${r.url}`); return; }
  console.log(`${r.status === 'added' ? '✓ Added' : '! Draft created (add a title)'}: ${r.file}`);
  console.log(`  ${r.platform} · ${r.day} · ${r.title || '(title needed)'}`);
  for (const n of r.notes) console.log(`  ! ${n}`);
}

/* ---------------- main ---------------- */

try {
  const args = parseArgs(process.argv.slice(2));
  if (args.flags.has('sync')) {
    await sync();
  } else {
    if (args.positional.length !== 1) throw new UserError('Give one link, e.g. npm run add -- https://youtu.be/VIDEO_ID  (or run: npm run sync)');
    const r = await addOne(args.positional[0], {
      title: args.values.title, summary: args.values.summary, image: args.values.image, date: args.values.date,
      podcast: args.flags.has('podcast'), noImage: args.flags.has('no-image'), draft: args.flags.has('draft'),
    });
    report(r);
    if (r.status !== 'exists') console.log('  Check with `npm run dev`, then commit and push to publish.');
  }
} catch (error) {
  console.error(`✗ ${error instanceof UserError ? error.message : `Unexpected problem: ${error.message}`}`);
  process.exit(1);
}
