# Daniel Khan — portfolio, open workshop and log

Live site: **https://danielkhan.org**

A fast, private-by-default personal site built with [Astro](https://astro.build) and served free from Cloudflare's global network. Everything is plain Markdown in `src/content/`. Pushing to `main` checks, rebuilds and publishes it automatically.

| Section | What goes there | Folder |
|---|---|---|
| **Work** | Projects, research, writing, documentary/media, each with an honest status | `src/content/work/` |
| **Open workshop** | Free tools, templates and designs others can use, with licence and credits | `src/content/workshop/` + files in `public/downloads/` |
| **Log** | Dated updates: what you built, released or learned | `src/content/log/` |
| **Collaborate** | Join-a-project forms, public discussions, private message form | `src/pages/collaborate/` (driven by config + content) |
| **About** | Bio, photo, method, links | `src/pages/about.astro` |

---

## Everyday tasks

### Add something new (no coding)

1. Copy `_TEMPLATE.md` in the right folder, e.g. `src/content/log/_TEMPLATE.md`.
2. Rename it: lowercase words with hyphens, e.g. `new-explainer-format.md`. The filename becomes the web address (`/log/new-explainer-format/`).
3. Fill in the fields at the top. Write the body in Markdown.
4. Keep `draft: true` while you write. Set `draft: false` when it's ready.
5. Commit and push. The site updates in about two minutes, once every check passes.

You can do all of this on **github.com** in the browser: open the folder, click **Add file → Create new file**, paste, then **Commit**.

### Share a tool or design you built from a GitHub project

1. Check that the original licence lets you share your version, and keep its licence notice.
2. Put your version in its own public repository (or a ZIP in `public/downloads/`).
3. Add a `src/content/workshop/` entry with `source:` or `download:`, your `licence:`, and a `basedOn:` entry that credits the original. The page shows the credit automatically.
4. Add a short Log entry announcing it.

### Open a project for collaborators

In the project's file in `src/content/work/`, set:

```yaml
collaboration:
  open: true
  needs: [Designers, Fact-checkers]
```

It then appears on the home page and on `/collaborate/` with an **Offer to help** button. The button opens a pre-filled issue form in [DANIELKHAN26/collaborate](https://github.com/DANIELKHAN26/collaborate).

### Change your name, links, email or contact form

Edit **`src/site.config.ts`**. Empty values are hidden, so no empty or fake links ever appear on the site.

- **Social links:** paste full `https://` URLs (LinkedIn, YouTube, Substack, Bluesky, ORCID).
- **Public email:** set `contact.email`.
- **Private contact form:** get a free access key at <https://web3forms.com> (250 messages/month) and paste it into `contact.web3formsAccessKey`. The key is designed to be public. Send yourself a test message after deploying.
- **CV:** put `cv.pdf` in `public/` and set `cvUrl: '/cv.pdf'`.

### Add images

Put images in `src/assets/` and reference them from Markdown: `![Description](../../assets/photo.jpg)`. For a cover image use `cover:` plus `coverAlt:`. Images are resized and converted to AVIF/WebP automatically. Host videos on YouTube and link to them; don't commit video files.

---

## Run it on your computer

Requires Node.js 24+ (see `.nvmrc`). Node 26 becomes the LTS release on 28 Oct 2026; after that, change `.nvmrc` to `26`.

```bash
npm install          # first time only
npm run dev          # live preview at http://localhost:4321 — drafts visible
npm test             # type-check + build + verify links/metadata (what CI runs)
npm run preview      # serve the production build (search works here)
```

## Quality and safety built in

- **Content schema:** a missing date, a bad link format or a missing image description stops the build with a clear message.
- **`scripts/verify-dist.mjs`** checks every built page for broken internal links, missing titles, descriptions or canonical URLs, missing alt text, leaked drafts and placeholder text.
- **Content Security Policy** on every page (hash-based), no cookies, no analytics, no third-party requests. Fonts are self-hosted.
- **GitHub Actions** (`.github/workflows/deploy.yml`) runs all checks, then deploys to Cloudflare. A failed check never replaces the live site.
- **HTTP security headers** (`public/_headers`): HSTS, clickjacking protection, `nosniff`, a strict referrer and permissions policy. Fingerprinted files are cached for a year.
- **Monthly link check** (`link-check.yml`) tests external links. GitHub emails you if any break.
- **Dependabot** opens monthly update pull requests. Merge them when the checks pass.

## Hosting and domain

- **Domain:** `danielkhan.org`, registered at Cloudflare Registrar (auto-renews yearly; keep the card on file current).
- **Hosting:** Cloudflare Workers static assets, configured in `wrangler.jsonc`. Deploying creates the DNS record and HTTPS certificate automatically.
- **www:** `workers/www-redirect/` sends every `www.danielkhan.org` and `http://` address to `https://danielkhan.org`.
- **Deploy credentials:** the GitHub repository secrets `CLOUDFLARE_API_TOKEN` (template "Edit Cloudflare Workers", limited to this account and zone) and `CLOUDFLARE_ACCOUNT_ID`. If a deploy fails with an authentication error, create a new token and run `gh secret set CLOUDFLARE_API_TOKEN`.
- **Cloudflare settings that must stay this way:** Always Use HTTPS on, minimum TLS 1.2, TLS 1.3 and HTTP/3 on, DNSSEC on, Email Address Obfuscation off, Bot Fight Mode off. The last two inject scripts that the site's security policy blocks.
- **Web Analytics:** Cloudflare's cookieless Web Analytics is on; its script is allowed in the security policy (`astro.config.mjs`). If you add any other third-party script, add it to the policy too, or browsers will block it.
- **Old address:** the separate repo `DANIELKHAN26/danielkhan26.github.io` forwards old links to the same page here.

## Project structure

```
src/
  site.config.ts        ← your identity, links and contact options
  content.config.ts     ← the fields each content type accepts
  content/{work,workshop,log}/   ← your Markdown entries (+ _TEMPLATE.md)
  assets/               ← photos (optimised at build time)
  pages/                ← routes: home, work, workshop, log, collaborate, about, search, tools
  layouts/, components/ ← page structure and reusable parts
  styles/global.css     ← design tokens (colours, type scale) and shared styles
public/                 ← copied as-is: favicon, downloads/, _headers (HTTP headers)
wrangler.jsonc          ← Cloudflare hosting config
workers/www-redirect/   ← www → apex redirect
scripts/verify-dist.mjs ← post-build checks
```

## Licence

Code: MIT (see `LICENSE`). Writing and photographs: © Daniel Khan, all rights reserved. Templates in `public/downloads/`: CC0 1.0.
