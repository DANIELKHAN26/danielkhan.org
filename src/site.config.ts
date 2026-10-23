/**
 * The one file to edit for identity, links and contact details.
 * Leave a value as '' to hide it — the site never shows an empty or fake link.
 */
export const SITE = {
  name: 'Daniel Khan',
  url: 'https://danielkhan.org',
  role: 'PhD candidate in Arts',
  affiliation: 'Macquarie University',
  /** Motto shown under your name on the home page. */
  motto: 'Good questions deserve a full answer.',
  /** One line under the logo in the footer — what the site is about. */
  tagline: 'Research, writing and tools on digital media and power in Bangladesh and the Global South.',
  /** What you work on, in one sentence (home page and Research page). */
  focus:
    'I research digital authoritarianism, affective media and digital cultures in Bangladesh and the Global South. Alongside, I write sourced explainers and build language tools for checking claims in the news.',
  description:
    'Daniel Khan — PhD candidate in Arts at Macquarie University researching digital authoritarianism, affective media and digital cultures in Bangladesh and the Global South.',

  /** Public GitHub account and the public repo used for collaboration (Discussions + issue forms). */
  github: {
    user: 'DANIELKHAN26',
    communityRepo: 'collaborate',
  },

  contact: {
    /** Public email (Cloudflare Email Routing forwards it to a private inbox). Empty = hidden. */
    email: 'hello@danielkhan.org',
    /** Free private contact form: paste a Web3Forms access key (https://web3forms.com). Empty = hidden. */
    web3formsAccessKey: '',
  },

  /**
   * Profiles elsewhere, in display order. Only https:// links are shown.
   * `icon` must match a name in src/components/Icon.astro.
   */
  social: [
    { label: 'LinkedIn', icon: 'linkedin', url: 'https://www.linkedin.com/in/danielkhan6/', name: 'Daniel Khan', about: 'Research and professional updates' },
    { label: 'Substack', icon: 'substack', url: 'https://substack.com/@annalisthub', name: 'The Annalist', about: 'The Annalist — sourced explainers' },
    { label: 'YouTube', icon: 'youtube', url: 'https://www.youtube.com/@DanielKhan1M', name: '@DanielKhan1M', about: 'Videos and the podcast' },
    { label: 'Facebook', icon: 'facebook', url: 'https://www.facebook.com/danielmd.khan/', name: 'Daniel Khan', about: 'Personal updates' },
  ],

  podcast: {
    /** 'coming-soon' shows the podcast teaser; change to 'live' once episodes are out. */
    status: 'coming-soon' as 'coming-soon' | 'live',
    channel: 'https://www.youtube.com/@DanielKhan1M',
    /** Optional: what the show is about, in your own words (one or two sentences). Empty = hidden. */
    premise: '',
  },
} as const;

export const githubCommunityUrl = SITE.github.user && SITE.github.communityRepo
  ? `https://github.com/${SITE.github.user}/${SITE.github.communityRepo}`
  : '';

export const socialLinks = SITE.social.filter((s) => s.url.startsWith('https://'));
