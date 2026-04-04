// CmdK and scripts/gen-embeddings.mjs consume this; add nav items and hosted essays here first.
const SITE_NAV_LINKS = [
  { href: '/about', label: 'About', desc: 'About Ryan McComb', keys: '' },
  {
    href: '/experience',
    label: 'Experience',
    desc: 'Professional experience and education',
    keys: 'timeline resume work',
  },
  { href: '/writing', label: 'Writing', desc: 'Essays and articles', keys: 'blog' },
  { href: '/press', label: 'Press', desc: 'Press coverage and features', keys: 'media news' },
];

window.SITE_DATA = {
  navLinks: SITE_NAV_LINKS,
  hostedEssays: [
    {
      slug: 'il9cast-postmortem',
      title: 'IL9Cast Post-Mortem: What We Got Right, and What the Markets Saw First',
      desc: "A look back at the IL-9 forecast: where the fundamentals model landed, what the prediction markets saw first, and what I'd do differently.",
      url: '/writing/il9cast-postmortem/',
      keys: 'essays elections forecasting il9cast',
    },
    {
      slug: 'peoples-edict',
      title: "People's Edict",
      desc: 'An essay on power, strife, and the arc of democratic governance in the modern era.',
      url: '/writing/peoples-edict/',
      keys: 'essays power governance',
    },
    {
      slug: 'median-voter-theory',
      title: "The Conflation Between Median Voter Theory and Trump's Win",
      desc: 'How the Trump campaign used an obscure political science concept to move the electorate.',
      url: '/writing/median-voter-theory/',
      keys: 'essays elections median voter theory',
    },
    {
      slug: 'nsa-surveillance',
      title: 'Resolution on State Interception of Communications',
      desc: 'NSA surveillance and unconstitutional censorship.',
      url: '/writing/nsa-surveillance/',
      keys: 'essays nsa surveillance privacy',
    },
  ],
};
