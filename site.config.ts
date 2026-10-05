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
  // Labels are the church's own (chrome.json / page titles) or draft wording
  // from src/content/draft/nav.json; a test enforces this.
  nav: [
    {
      label: 'About',
      children: [
        { label: 'Mission and Vision', href: '/mission-and-vision' },
        { label: 'What We Believe', href: '/what-we-believe' },
        { label: 'Leadership', href: '/leadership' },
        { label: 'Our Story', href: '/our-story' },
      ],
    },
    {
      label: 'Next Steps',
      children: [
        { label: 'Next Steps', href: '/next-steps' },
        { label: "I'm New", href: '/i-m-new' },
        { label: 'Jesus', href: '/jesus' },
        { label: 'Growth Track', href: '/growth-track' },
        { label: 'Baptism', href: '/baptism-signup' },
        { label: 'Connect Card', href: '/connect-card' },
      ],
    },
    {
      label: 'Ministries',
      children: [
        { label: 'Ministries', href: '/ministries' },
        { label: 'Kidz & Youth', href: '/kidz-amp-youth' },
        { label: 'Students', href: '/students' },
        { label: 'Men', href: '/men' },
        { label: 'Women', href: '/women' },
        { label: 'Connect Groups', href: '/connect-groups' },
      ],
    },
    { label: 'Dream Team', href: '/dream-team' },
    {
      label: 'Watch',
      children: [
        { label: 'Watch Live', href: '/media/live' },
        { label: 'Sermons', href: '/sermons' },
        { label: "Pastor's Blog", href: '/pastor-s-blog' },
        { label: 'Blog', href: '/blog' },
      ],
    },
    { label: 'Calendar', href: '/calendar' },
    { label: 'Give', href: '/give' },
  ] as NavItem[],

  // "Plan Your Visit" is verbatim on the church's own home-v2 page.
  headerCtas: [
    { label: 'Plan Your Visit', href: '/i-m-new', kind: 'primary' },
  ],
  // Children's ministry page: which church lines are age groups, and their photos.
  kids: {
    agePrefix: 'FAITH KIDZ ',
    ageSlots: ['kids.nursery', 'kids.toddlers', 'kids.preschool', 'kids.church'],
  },
  // Dream Team cards that have a matching photo slot.
  teamSlots: {
    'Altar Care/Prayer Team': 'team.prayer',
    'Audio/Video Team': 'team.media',
    "Cafe' Team": 'team.cafe',
    'Faith Kidz Ministry Team': 'kids.hero',
    'Guest Services Team': 'team.guest',
    'Music Team': 'team.worship',
    'Usher Team': 'team.ushers',
    'Worship Arts Team': 'team.worship',
  } as Record<string, string>,

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
    // The photo switch (preview-only wording).
    churchPhotos: 'Church photos',
    aiImages: 'AI images',
  },
  // The church's own form confirmation, for forms that captured none.
  formDefaultSuccess: 'Thank you for contacting us! We will respond shortly.',
  ui: { skipLink: 'Skip to content' },
};

// Visible text that is allowed on every page in addition to the page's own
// source text. The fidelity test reads this list.
export const ALLOWED_EXTRA_TEXT = [
  site.preview.text, site.ui.skipLink, site.preview.formError, site.preview.churchPhotos, site.preview.aiImages,
];
export const SHARED_CHROME_TEXT = [
  ...chrome.nav,
  ...site.nav.flatMap((n) => [n.label, ...(n.children ?? []).map((x) => x.label)]),
  ...chrome.footer.map((s) => s.text),
  ...site.headerCtas.map((c) => c.label),
];
