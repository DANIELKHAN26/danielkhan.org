/**
 * The one file to edit for identity, links and contact details.
 * Leave a value as '' to hide it — the site never shows an empty or fake link.
 */
export const SITE = {
  name: 'Daniel Khan',
  url: 'https://danielkhan26.github.io',
  description:
    'Daniel Khan — research on public questions, evidence-led writing, documentary work and free open tools.',
  headline: 'Good questions deserve a full answer.',
  intro:
    'I research public questions, write about what the evidence can and cannot show, make documentary work, and build small open tools that make careful work easier.',
  /** Short role line under the name (hero eyebrow + social cards). */
  roles: ['Research', 'Writing', 'Documentary', 'Open tools'],

  /** Public GitHub account and the public repo used for collaboration (Discussions + issue forms). */
  github: {
    user: 'DANIELKHAN26',
    communityRepo: 'collaborate',
  },

  contact: {
    /** A public email address, e.g. 'hello@yourdomain.com'. Empty = hidden. */
    email: '',
    /**
     * Private contact form. Web3Forms is free and needs no account:
     * request an access key at https://web3forms.com and paste it here.
     * Empty = the form is replaced by the other contact routes.
     */
    web3formsAccessKey: '',
  },

  /** Profiles elsewhere. Only https:// links; empty ones are hidden. */
  social: [
    { label: 'GitHub', url: 'https://github.com/DANIELKHAN26' },
    { label: 'LinkedIn', url: '' },
    { label: 'YouTube', url: '' },
    { label: 'Substack', url: '' },
    { label: 'Bluesky', url: '' },
    { label: 'ORCID', url: '' },
  ],

  /** Link to a public CV (PDF in /public/ or an https:// URL). Empty = hidden. */
  cvUrl: '',
} as const;

export const githubCommunityUrl = SITE.github.user && SITE.github.communityRepo
  ? `https://github.com/${SITE.github.user}/${SITE.github.communityRepo}`
  : '';

export const socialLinks = SITE.social.filter((s) => s.url.startsWith('https://'));
