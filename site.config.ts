// Everything client-specific lives here (and in src/content). Components and
// layouts read from this file and contain no client names, colors or URLs.
import chrome from './src/content/chrome.json';

export type NavItem = { label: string; href?: string; children?: { label: string; href: string }[] };

export const site = {
  name: 'Faith Christian Center International',
  shortName: 'FCCI',
  origin: 'https://www.fcci.life',
  logo: { src: '/brand/logo.png', width: 596, height: 300 },
  favicon: '/brand/favicon.png',

  colors: {
    accent: '#ee7b1a',
    accentHover: '#d8660f',
    ink: '#111111',
    ink2: '#2c2c2c',
    gray: '#444444',
    paper: '#ffffff',
    paper2: '#f7f5f2',
    // fcci.life heading blue, deepened from #2b7bb9 so small text passes AA on off-white.
    blue: '#1f6aa5',
    // Sampled from the REACH / TEACH / TRANSFORM band on fcci.life.
    gradFrom: '#ee7b1a',
    gradTo: '#fe5cc4',
  },

  // Labels are verbatim from the source nav (src/content/chrome.json).
  nav: [
    { label: 'Home', href: '/' },
    {
      label: 'About',
      children: [
        { label: 'Mission and Vision', href: '/mission-and-vision' },
        { label: 'What We Believe', href: '/what-we-believe' },
        { label: 'Leadership', href: '/leadership' },
        { label: 'Kidz & Youth', href: '/kidz-amp-youth' },
      ],
    },
    {
      label: 'Connect',
      children: [
        { label: 'Calendar', href: '/calendar' },
        { label: 'Connect Groups', href: '/connect-groups' },
        { label: 'Growth Track', href: '/growth-track' },
        { label: 'Jesus', href: '/jesus' },
        { label: "Pastor's Blog", href: '/pastor-s-blog' },
        { label: "I'm New", href: '/i-m-new' },
      ],
    },
    { label: 'Watch Live', href: '/media/live' },
    { label: 'Sermons', href: '/sermons' },
    { label: 'Give', href: '/give' },
    { label: 'Blog', href: '/blog' },
  ] as NavItem[],

  // "Plan Your Visit" is verbatim on the church's own home-v2 page.
  headerCtas: [
    { label: 'Plan Your Visit', href: '/i-m-new', kind: 'primary' },
    { label: 'Give', href: '/give', kind: 'give' },
  ],

  footer: chrome.footer,
  // Link targets for footer lines whose source link was malformed or unlabeled.
  footerLinks: {
    'Email: connect@fccintl.org': 'mailto:connect@fccintl.org',
    'Phone: (434) 979-1700': 'tel:+14349791700',
    '> Partner Login': 'https://dashboard.subsplash.com',
  } as Record<string, string>,
  socials: [
    { network: 'facebook', href: 'https://www.facebook.com/fccintl', label: 'Facebook' },
    { network: 'instagram', href: 'https://www.instagram.com/fccintl', label: 'Instagram' },
    { network: 'x', href: 'https://www.twitter.com/fccintl1', label: 'X (Twitter)' },
  ],

  subsplash: {
    accountId: 'BPM5XF',
    giveEmbed: 'https://subsplash.com/u/-BPM5XF/give?embed=true',
    liveEmbed: 'https://subsplash.com/u/-BPM5XF/media/embed/d/*next-live',
  },
  liveCalendarUrl: 'https://www.fcci.life/calendar',
  // Pages whose content loads by script on the old site link out to it.
  externalContent: { '/calendar': 'https://www.fcci.life/calendar' } as Record<string, string>,
  // Sections linking to these paths get the page's media embed.
  mediaLinkPaths: ['/sermons', '/media'],
  home: {
    // Church photos (from its own home-v2 page) for the three pillar panels.
    heroImage: '23030723',
    panelImages: ['24975047', '23035221', '19289338'],
  },

  preview: {
    enabled: true,
    text: 'Preview of a redesigned fcci.life by CTSD',
    // Shown only if a form fails to send (preview-only wording).
    formError: 'This preview could not send your message. Please try again.',
  },
  // The church's own form confirmation, for forms that captured none.
  formDefaultSuccess: 'Thank you for contacting us! We will respond shortly.',
  ui: { skipLink: 'Skip to content' },
};

// Visible text that is allowed on every page in addition to the page's own
// source text. The fidelity test reads this list.
export const ALLOWED_EXTRA_TEXT = [site.preview.text, site.ui.skipLink, site.preview.formError];
export const SHARED_CHROME_TEXT = [
  ...chrome.nav,
  ...chrome.footer.map((s) => s.text),
  ...site.headerCtas.map((c) => c.label),
];
