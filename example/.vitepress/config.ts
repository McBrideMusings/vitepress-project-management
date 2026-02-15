import { defineConfig } from 'vitepress'
import { markdownWriterPlugin } from 'vitepress-theme-pm/plugin'

export default defineConfig({
  title: 'Example Project',
  description: 'An example VitePress site using vitepress-theme-pm',

  vite: {
    plugins: [markdownWriterPlugin()],
  },

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Architecture', link: '/architecture/overview' },
      { text: 'Development', link: '/development/setup' },
      { text: 'Board', link: '/board' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Configuration', link: '/guide/document-types' },
            { text: 'Editor', link: '/guide/editor' },
            { text: 'Theming', link: '/guide/visual-design' },
            { text: 'Tags', link: '/guide/tags' },
          ],
        },
      ],
      '/architecture/': [
        {
          text: 'Architecture',
          items: [
            { text: 'Overview', link: '/architecture/overview' },
            { text: 'Store', link: '/architecture/store' },
            { text: 'Persistence', link: '/architecture/persistence' },
            { text: 'API Reference', link: '/architecture/api-reference' },
          ],
        },
      ],
      '/development/': [
        {
          text: 'Development',
          items: [
            { text: 'Setup', link: '/development/setup' },
            { text: 'Testing', link: '/development/testing' },
            { text: 'Code Style', link: '/development/code-style' },
            { text: 'Deployment', link: '/development/deployment' },
          ],
        },
      ],
    },
  },
})
