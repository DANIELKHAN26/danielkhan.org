# Daniel Khan — personal research website (danielkhan.org)

Live site: **https://danielkhan.org**

A fast, private-by-default personal site built with [Astro](https://astro.build) and served free from Cloudflare's global network. Everything is plain Markdown in `src/content/`. Pushing to `main` checks, rebuilds and publishes it automatically.

| Section | What goes there | Where to edit |
|---|---|---|
| **Home** | Name, motto, one-line focus, channel links, compact Research and Projects, podcast + latest post | `src/site.config.ts` |
| **Research** | Papers under review, conference papers, research projects | `src/content/research.yaml` |
| **Projects** | Projects with honest status labels | `src/content/work/` |
| **Lab** | Your experiments, free tools and templates, and a library of credited outside work | `src/content/lab/`, `src/content/library.yaml`, files in `public/downloads/` |
| **Updates** | Your posts on Substack, YouTube, LinkedIn and Facebook (added by link), the podcast, and site notes | `npm run add -- <link>` → `src/content/updates/`; notes in `src/content/log/` |
| **Collaborate** | Email, open projects with "Offer to help", public discussions | driven by config + project files |
| **About** (footer) | Short bio with expandable education, experience, expertise and interests | `src/data/profile.ts` |

---

## Everyday tasks

### Add something new (no coding)

1. Copy `_TEMPLATE.md` in the right folder, e.g. `src/content/log/_TEMPLATE.md`.
2. Rename it: lowercase words with hyphens, e.g. `new-explainer-format.md`. The filename becomes the web address (`/log/new-explainer-format/`).
3. Fill in the fields at the top. Write the body in Markdown.
4. Keep `draft: true` while you write. Set `draft: false` when it's ready.
5. Commit and push. The site updates in about two minutes, once every check passes.

You can do all of this on **github.com** in the browser: open the folder, click **Add file → Create new file**, paste, then **Commit**.

### Add a post from YouTube, Substack, LinkedIn or Facebook

```bash
npm run sync                                            # import NEW posts from your Substack and YouTube automatically
npm run add -- https://annalisthub.substack.com/p/your-post            # one post, details read automatically
npm run add -- https://youtu.be/VIDEO_ID --podcast                     # a podcast episode
npm run add -- <linkedin-or-facebook-link> --title "Post title" --summary "One line" --image ~/Pictures/post.png
```

- **Substack and YouTube:** `npm run sync` checks your public feeds (set in `src/data/feeds.json`) and adds anything new — nothing is ever duplicated or overwritten. Once you create a YouTube podcast playlist, put its feed URL in `youtubePodcastPlaylist` and episodes are marked automatically.
- **LinkedIn and Facebook** block automatic reading, so give the title (and optionally `--summary`, `--image` with a screenshot, `--date 2026-11-01`) on the command line. Without `--title` you get a **draft** to finish.
- Images are copied into the site so visitors never load anything from the platforms — **only add your own posts** (or ones whose images you may show). `--no-image` skips the image.
- YouTube videos play on your site only when pressed, through YouTube's privacy-enhanced player. Links must match their platform, tracking parameters are removed, network hiccups are retried, and mistyped options are refused.

### Add an experiment, tool or library item

- **Experiment or tool:** copy `src/content/lab/_TEMPLATE.md`. Experiments need only a title, summary, status and a one-line `focus`; tools and templates also need a version, licence and a download, source or demo link.
- **Library item (someone else's work):** add a block to `src/content/library.yaml` with the official link, authors, topic and the **exact licence** — some research resources are non-commercial only.

### Open a project for collaborators

In the project's file in `src/content/work/`, set:

```yaml
collaboration:
  open: true
  needs: [Designers, Fact-checkers]
```

It then appears on the home page and on `/collaborate/` with an **Offer to help** button. The button opens a pre-filled issue form in [DANIELKHAN26/collaborate](https://github.com/DANIELKHAN26/collaborate).

### Add a paper or update its status

Edit **`src/content/research.yaml`**: copy a block, change the title and `kind`. The order in the file is the order on the site. Following humanities convention, don't name the journal while a paper is under review; add `venue:` once it is accepted.

### Change your motto, focus line, links, email or podcast

Edit **`src/site.config.ts`**. Empty values are hidden, so no empty or fake links ever appear on the site.

- **Social links:** full `https://` URLs. Icons are shown in each brand's official colours (their brand rules forbid recolouring); to add a new network, add its icon to `src/components/Icon.astro`.
- **Public email:** set `contact.email`.
- **Private contact form:** get a free access key at <https://web3forms.com> (250 messages/month) and paste it into `contact.web3formsAccessKey`. The key is designed to be public. Send yourself a test message after deploying.
- **CV:** put a PDF in `public/` and set `cv: '/your-cv.pdf'` in `src/data/profile.ts`. **Remove your phone number, home address and date of birth first** — a public CV only needs your name, university and a contact link.

### Change your photo

Replace `src/assets/daniel-khan-profile.jpg` with a square photo (at least 880×880, face centred). It is used on the home page, About, and in the social card (`src/assets/og-card.png`).

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
- **GitHub Actions** (`.github/workflows/deploy.yml`) runs all checks, then deploys to Cloudflare. A failed check never replaces the live site. Actions are pinned to exact commits, run with least privilege, and each deploy keeps a 90-day record (`deploy-manifest`) of every published file's fingerprint.
- **Rollback:** revert the bad commit and push, or run `npx wrangler rollback` (after a one-time `npx wrangler login`) to return instantly to the previous Cloudflare version.
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
  content/{work,lab,updates,log}/ ← Markdown entries (+ _TEMPLATE.md); research.yaml, library.yaml
  assets/               ← photos (optimised at build time)
  pages/                ← routes: home, research, work, lab, updates, collaborate, about, search, tools
  layouts/, components/ ← page structure and reusable parts
  styles/global.css     ← design tokens (colours, type scale) and shared styles
public/                 ← copied as-is: favicon, downloads/, _headers (HTTP headers)
wrangler.jsonc          ← Cloudflare hosting config
workers/www-redirect/   ← www → apex redirect
scripts/verify-dist.mjs ← post-build checks
scripts/add-update.mjs  ← `npm run add -- <link>`: add a post to Updates
```

## Licence

Code: MIT (see `LICENSE`). Writing and photographs: © Daniel Khan, all rights reserved. Templates in `public/downloads/`: CC0 1.0.
