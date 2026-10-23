// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Keep in sync with SITE.url in src/site.config.ts.
const SITE_URL = 'https://danielkhan.org';

const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const LATIN_EXT = 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';

/**
 * @font-face variants (Latin + Latin Extended) for a Fontsource variable package's weight-axis files.
 * @param {string} pkg
 * @param {'normal' | 'italic'} style
 * @param {string} weight  the range the font file supports
 */
function variable(pkg, style, weight) {
  /** @param {string} subset @param {string} range */
  const face = (subset, range) => ({
    weight,
    style,
    src: /** @type {[string]} */ ([`@fontsource-variable/${pkg}/files/${pkg}-${subset}-wght-${style}.woff2`]),
    unicodeRange: /** @type {[string]} */ ([range]),
  });
  /** @type {[ReturnType<typeof face>, ReturnType<typeof face>]} */
  const faces = [face('latin', LATIN), face('latin-ext', LATIN_EXT)];
  return faces;
}

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  // Inline the small stylesheets so the first paint needs no extra request.
  build: { format: 'directory', inlineStylesheets: 'always' },
  // Plain code blocks: Shiki's inline styles are incompatible with the strict CSP below.
  markdown: { syntaxHighlight: false },
  integrations: [
    sitemap({ filter: (page) => !page.endsWith('/search/') && !page.endsWith('/collaborate/thanks/') }),
  ],
  // Fonts are self-hosted from installed npm packages (variable files):
  // no third-party font requests, and the build works offline.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Schibsted Grotesk',
      cssVariable: '--font-display',
      fallbacks: ['system-ui', 'sans-serif'],
      options: { variants: variable('schibsted-grotesk', 'normal', '400 900') },
    },
    {
      provider: fontProviders.local(),
      name: 'Source Serif 4',
      cssVariable: '--font-serif',
      fallbacks: ['Georgia', 'serif'],
      // Reading font: never swap in after text is showing (no layout shift on phones without Georgia/Times).
      // It is preloaded, so it is normally ready in time; otherwise the next page uses it from cache.
      display: 'optional',
      options: { variants: [...variable('source-serif-4', 'normal', '200 900'), ...variable('source-serif-4', 'italic', '200 900')] },
    },
  ],
  // Content Security Policy, emitted as a <meta> tag with hashes for every script and style.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        // Cloudflare Web Analytics (cookieless) reports visits to cloudflareinsights.com.
        "connect-src 'self' https://api.web3forms.com https://cloudflareinsights.com",
        "form-action 'self' https://api.web3forms.com",
        "base-uri 'self'",
        "object-src 'none'",
        // Only YouTube's privacy-enhanced player, loaded when a visitor presses play on a video card.
        "frame-src https://www.youtube-nocookie.com",
        'upgrade-insecure-requests',
      ],
      // 'wasm-unsafe-eval' lets the Pagefind search index (WebAssembly) run.
      // static.cloudflareinsights.com is Cloudflare Web Analytics, injected by Cloudflare with an integrity hash.
      scriptDirective: { resources: ["'self'", "'wasm-unsafe-eval'", 'https://static.cloudflareinsights.com'] },
    },
  },
});
