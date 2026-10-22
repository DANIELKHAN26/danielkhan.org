---
title: This portfolio, as a free template
summary: The source code of this website — an Astro portfolio with work, an open workshop, a log, collaboration routes and site search. Fork it and make it yours.
kind: Code
status: Released
version: "1.0.0"
licence: MIT (code only)
date: 2026-10-22
source: https://github.com/DANIELKHAN26/danielkhan.org
requirements: Node.js 24 or newer; free GitHub and Cloudflare accounts
tags: [Web design, Astro, Open source]
basedOn:
  - name: Astro
    url: https://github.com/withastro/astro
    author: The Astro Technology Company and contributors
    licence: MIT
  - name: Pagefind
    url: https://github.com/Pagefind/pagefind
    author: CloudCannon
    licence: MIT
  - name: Bricolage Grotesque
    url: https://github.com/ateliertriay/bricolage
    author: Mathieu Triay
    licence: SIL Open Font License 1.1
  - name: Newsreader
    url: https://github.com/productiontype/Newsreader
    author: Production Type
    licence: SIL Open Font License 1.1
  - name: IBM Plex Mono
    url: https://github.com/IBM/plex
    author: IBM
    licence: SIL Open Font License 1.1
---

Everything you see here is built from plain Markdown files and published free on Cloudflare. If you want a site like it, you can copy the whole thing.

## What you get

- **Research** — papers and projects, edited in one YAML file.
- **Projects** — work in progress with honest status labels.
- **Workshop** — downloadable resources and tools, each with a version, licence and credits.
- **Podcast** — a "coming soon" teaser that switches to "live" with one setting.
- **Updates** — a dated record of what you build.
- **Collaborate** — join-a-project forms, public discussions and an optional private contact form.
- **Built in** — site search, RSS, sitemap, light and dark themes, social preview cards, a strict content security policy, and no tracking.

## Make it yours

1. Fork the repository, or click **Use this template** on GitHub.
2. Edit `src/site.config.ts` with your name, links and contact options.
3. Replace the Markdown files in `src/content/` and the photos in `src/assets/`.
4. Change the domain in `wrangler.jsonc`, add your Cloudflare API token and account ID as repository secrets, and push — the included GitHub Actions workflow checks, builds and publishes the site.

The README in the repository covers each step.

## What the licence covers

The **code** is MIT-licensed. The writing, photographs and personal content are **not** part of the template — please replace them with your own.
