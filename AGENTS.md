## Project notes for coding agents

- Astro 7 static site, deployed to GitHub Pages by `.github/workflows/deploy.yml`.
- Owner-editable settings live in `src/site.config.ts`; content schemas in `src/content.config.ts`.
- Run `npm test` before committing: type-check, build (with Pagefind), and `scripts/verify-dist.mjs`.
- CSP is enabled (`security.csp`): no inline `style=""` attributes, no external scripts/styles, no Shiki.
- Astro 7 compresses HTML whitespace: add `{' '}` between inline elements on separate lines when a space matters.
- Dev server: `astro dev --background`; manage with `astro dev stop|status|logs`.

Docs: https://docs.astro.build
