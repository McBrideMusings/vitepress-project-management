---
title: "Deployment"
---

## Static Build

VitePress builds to static HTML. The board UI works client-side but ticket editing requires the dev server plugin.

```
npm run build
```

Output goes to `.vitepress/dist/`.

## Hosting

Deploy the built site to any static host (Netlify, Vercel, GitHub Pages). Note that creating/editing tickets only works during local development with `vitepress dev`.

## Environment Variables

- `PORT` — Dev server port (default: 5173)
