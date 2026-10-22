// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Keep in sync with SITE.url in src/site.config.ts.
const SITE_URL = 'https://danielkhan.org';

const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const LATIN_EXT = 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';

/**
 * @font-face variants for a Fontsource variable package's all-axes ("standard") files.
 * @param {string} pkg
 * @param {'normal' | 'italic'} style
 * @param {string} [stretch]
 */
function variable(pkg, style, stretch) {
  /** @param {string} subset @param {string} range */
  const face = (subset, range) => ({
    weight: '200 800',
    style,
    stretch,
    src: /** @type {[string]} */ ([`@fontsource-variable/${pkg}/files/${pkg}-${subset}-standard-${style}.woff2`]),
    unicodeRange: /** @type {[string]} */ ([range]),
  });
  /** @type {[ReturnType<typeof face>, ReturnType<typeof face>]} */
  const faces = [face('latin', LATIN), face('latin-ext', LATIN_EXT)];
  return faces;
}

/** @param {400 | 500} weight */
const plexMono = (weight) => ({
  weight,
  style: /** @type {const} */ ('normal'),
  src: /** @type {[string]} */ ([`@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-${weight}-normal.woff2`]),
  unicodeRange: /** @type {[string]} */ ([LATIN]),
});

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Plain code blocks: Shiki's inline styles are incompatible with the strict CSP below.
  markdown: { syntaxHighlight: false },
  integrations: [
    sitemap({ filter: (page) => !page.endsWith('/search/') && !page.endsWith('/collaborate/thanks/') }),
  ],
  // Fonts are self-hosted from installed npm packages (variable files with every axis):
  // no third-party font requests, and the build works offline.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Bricolage Grotesque',
      cssVariable: '--font-display',
      fallbacks: ['system-ui', 'sans-serif'],
      options: { variants: variable('bricolage-grotesque', 'normal', '75% 100%') },
    },
    {
      provider: fontProviders.local(),
      name: 'Newsreader',
      cssVariable: '--font-serif',
      fallbacks: ['Georgia', 'serif'],
      options: { variants: [...variable('newsreader', 'normal'), ...variable('newsreader', 'italic')] },
    },
    {
      provider: fontProviders.local(),
      name: 'IBM Plex Mono',
      cssVariable: '--font-mono',
      fallbacks: ['ui-monospace', 'monospace'],
      options: { variants: [plexMono(400), plexMono(500)] },
    },
  ],
  // Content Security Policy, emitted as a <meta> tag with hashes for every script and style.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self' https://api.web3forms.com",
        "form-action 'self' https://api.web3forms.com",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-src 'none'",
        'upgrade-insecure-requests',
      ],
      // 'wasm-unsafe-eval' lets the Pagefind search index (WebAssembly) run; nothing else needs it.
      scriptDirective: { resources: ["'self'", "'wasm-unsafe-eval'"] },
    },
  },
});
