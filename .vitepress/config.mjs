import { defineConfig } from 'vitepress'

// The VitePress root is the app root, and the URL path is the directory
// name. No rewrites: this app starts clean, so nothing has to be kept
// working from an older arrangement.
//
// The dashboard at / is not VitePress. It is a static shell copied over
// build/index.html after the docs build, by scripts/build-shell.mjs.

export default defineConfig({
  title: 'NFF MIT',
  description:
    'Model Integration Tool. Defines the North Foster Farm business ' +
    'model and links it to the plan, the figures and the presentation.',
  head: [
    ['meta', { name: 'robots', content: 'noindex, nofollow, noarchive, nosnippet' }],
    ['link', { rel: 'icon', href: '/mark.png' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap' }],
  ],
  base: '/',
  outDir: 'build',
  cleanUrls: true,
  lastUpdated: true,

  // One theme, chosen. The toggle is off.
  appearance: 'force-dark',

  // Calculations renders its equations as LaTeX.
  markdown: { math: true },

  srcExclude: [
    'import/inbound/**',
    'import/artifacts/**',
    'node_modules/**',
    'build/**',
    'dashboard/**',
    'apps/**',
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'NFF MIT',
    logoLink: '/',
    outline: 2,

    nav: [
      { text: 'Wiki', link: '/wiki/' },
      {
        text: 'Measures',
        items: [
          { text: 'Labor', link: '/measures/labor' },
          { text: 'Goods', link: '/measures/goods' },
          { text: 'Costs', link: '/measures/costs' },
        ],
      },
      { text: 'Calculations', link: '/calculations/' },
      { text: 'Model', link: '/model/' },
      { text: 'Presentations', link: '/presentations/' },
      { text: 'Scenarios', link: '/scenarios/', target: '_self' },
    ],

    search: { provider: 'local' },

    sidebar: {
      '/wiki/': [
        {
          text: 'Wiki',
          items: [{ text: 'Index', link: '/wiki/' }],
        },
      ],
      '/measures/': [
        {
          text: 'Measures',
          items: [
            { text: 'Index', link: '/measures/' },
            { text: 'Labor', link: '/measures/labor' },
            { text: 'Goods', link: '/measures/goods' },
            { text: 'Costs', link: '/measures/costs' },
          ],
        },
      ],
      '/calculations/': [
        {
          text: 'Calculations',
          items: [{ text: 'Figures and equations', link: '/calculations/' }],
        },
      ],
      '/model/': [
        {
          text: 'Business model',
          items: [{ text: 'Index', link: '/model/' }],
        },
      ],
      '/presentations/': [
        {
          text: 'Presentations',
          items: [{ text: 'Index', link: '/presentations/' }],
        },
      ],
    },

    footer: {
      message: 'A working record, not a finished plan.',
      copyright: 'North Foster Farm',
    },
  },
})
