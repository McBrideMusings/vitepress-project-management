# vitepress-project-management

A VitePress theme that adds a kanban board for project management. Tickets are individual `.md` files with YAML frontmatter — your board lives in your docs repo.

[Demo](https://mcbridemusings.github.io/vitepress-project-management/board.html)

## Install

```bash
npm install vitepress-theme-pm
```

## Setup

### 1. Theme

`.vitepress/theme/index.ts`:

```ts
import Theme from "vitepress-theme-pm";
export default Theme;
```

### 2. Plugin

`.vitepress/config.ts`:

```ts
import { defineConfig } from "vitepress";
import { markdownWriterPlugin } from "vitepress-theme-pm/plugin";

export default defineConfig({
  vite: {
    plugins: [markdownWriterPlugin()],
  },
});
```

### 3. Board page

Create `board.md` at your site root:

```yaml
---
layout: page
board: true
ticketsDir: tickets
ticketPrefix: PM
defaultColumn: backlog
columns:
  - { key: backlog, label: Backlog, color: "#718096" }
  - { key: doing, label: In Progress, color: "#e6a817" }
  - { key: review, label: Review, color: "#9f7aea" }
  - { key: done, label: Done, color: "#6bcb6b" }
---
```

### 4. Create tickets

Via the board UI (click **+ New**) or CLI:

```bash
npx vitepress-theme-pm ticket "Fix login bug" --status doing --priority high --tags auth,ui
```

Tickets are markdown files in `tickets/` with frontmatter for metadata and a body for description.

## How it works

- The board extends VitePress's default theme — all your docs pages keep their sidebar, TOC, and nav
- Tickets are plain `.md` files with `id`, `title`, `status`, `priority`, and `tags` in frontmatter
- Drag-and-drop between columns updates the ticket file
- A Vite dev server plugin handles reads/writes (dev only — no server code in production builds)
- The CLI creates ticket files from the terminal

## License

MIT
