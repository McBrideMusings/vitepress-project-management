---
title: "Persistence"
---

## File-Based Storage

Each ticket is a markdown file in the tickets directory:

```
tickets/
├── 1.md
├── 2.md
├── 3.md
└── ...
```

Frontmatter contains structured fields; the markdown body contains the description.

## Plugin Endpoints

The Vite dev server plugin exposes three endpoints:

- `GET /__vitepress_pm_tickets?dir=tickets` — Returns all tickets as JSON
- `POST /__vitepress_pm_create` — Creates a new ticket with auto-assigned ID
- `POST /__vitepress_pm_update` — Updates frontmatter/body of an existing ticket

These endpoints only exist during development (`apply: 'serve'`).
