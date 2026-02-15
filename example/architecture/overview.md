---
title: "Overview"
---

## Architecture

The theme consists of three parts:

### Vue Components

A set of Vue 3 components that render the kanban board UI inside VitePress's default layout.

### Vite Plugin

A dev-server-only plugin that provides REST endpoints for reading and writing ticket markdown files.

### CLI

A command-line tool for creating tickets from the terminal without opening the browser.

## Ticket Model

All tickets share a common structure:

```
interface Ticket {
  id: number
  title: string
  status: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  tags: string[]
  body: string
  url: string
}
```

Tickets are stored as individual `.md` files with YAML frontmatter.
