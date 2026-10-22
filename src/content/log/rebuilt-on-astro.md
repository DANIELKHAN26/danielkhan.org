---
title: Why I rebuilt this site on Astro
summary: Moving from a home-made Python generator to a standard framework — and what I kept, changed and gained along the way.
date: 2026-10-22
tags: [Web design, Astro, Build notes]
links:
  - label: The template
    url: /workshop/portfolio-template/
---

The first version of this site used a small, home-made Python generator. It worked, but every new feature — images in articles, tables, search — meant writing and maintaining more of my own code.

So I rebuilt it on [Astro](https://astro.build), an open-source framework designed for content sites.

## What changed

- **Content is plain Markdown**, checked against a schema, so a missing date or a broken link format fails the build instead of reaching the live site.
- **Drafts stay drafts.** Anything marked `draft: true` shows in my local preview but is never published.
- **Images are optimised automatically** into modern formats and sizes.
- **Search works offline in the browser**, powered by Pagefind, with no external service.
- **A strict content security policy** is generated for every page, and there is no tracking.

## What stayed

The principles: honest status labels, sources beside claims, and a public workshop where useful things are shared with a clear licence. The whole site is now [free to reuse](/workshop/portfolio-template/) as a template.
