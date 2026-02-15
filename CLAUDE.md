# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A distributable VitePress theme package (`vitepress-theme-pm`) that adds a kanban board view to any VitePress site. Tickets are individual `.md` files with YAML frontmatter. The theme extends VitePress's default theme — docs pages get sidebar/TOC/nav for free; the board is a custom `layout: page` view.

Three pieces ship together:
- **Theme** (`src/index.ts`) — Vue components for the board UI
- **Vite plugin** (`src/plugins/markdownWriter.ts`) — dev server middleware for reading/writing ticket files
- **CLI** (`src/cli.mjs`) — `npx vitepress-theme-pm ticket "Title"` to create tickets from the terminal

## Commands

```bash
# From repo root — install deps
npm install
cd example && npm install

# Dev server (run from example/)
npx vitepress dev

# Build (run from example/)
npx vitepress build

# Create a ticket via CLI (run from the VitePress site root, e.g. example/)
npx vitepress-theme-pm ticket "Title" --status doing --priority high --tags core,ui
```

No test suite or linter is configured yet.

## Architecture

### Data Flow

Board.vue fetches tickets from the Vite plugin on mount:
```
Board.vue → fetch(/__vitepress_pm_tickets) → plugin scans tickets/*.md → returns Ticket[]
```

Updates flow back:
```
User edits → updateTicket() → useTicketWriter → POST /__vitepress_pm_update → plugin writes .md file
```

New tickets (+ button):
```
addTicket() → POST /__vitepress_pm_create → plugin assigns sequential ID, creates {id}.md → returns Ticket
```

### ID System

Tickets have sequential numeric IDs (`id: 7` in frontmatter, file named `7.md`). A configurable prefix in `board.md` frontmatter (`ticketPrefix: RPG`) displays as `RPG-7`. Both the + button and CLI determine the next ID by scanning existing files — no separate counter file.

### Theme Integration

`Layout.vue` always renders `DefaultTheme.Layout`. When a page has `board: true` in frontmatter, the `Board` component is injected via the `#page-top` slot. This keeps the VitePress nav bar on every page.

### Plugin Endpoints (dev server only)

- `GET /__vitepress_pm_tickets?dir=tickets` — returns all tickets as JSON
- `POST /__vitepress_pm_create` — creates a new ticket file with auto-assigned ID
- `POST /__vitepress_pm_update` — updates frontmatter/body of an existing ticket file

### Component Hierarchy

```
Layout.vue → DefaultTheme.Layout + Board (via #page-top slot)
  Board.vue (state, fetch, drag-drop wiring)
    BoardColumn.vue (per status column)
      BoardCard.vue (individual card with ID, priority dot, tags, progress)
    TicketDetail.vue (modal overlay — left: description, right: metadata)
      MarkdownBody.vue (renders markdown with interactive checkboxes)
      TagEditor.vue (chips-in-input tag editing)
      ProgressBar.vue (checkbox completion bar)
```

### Key Patterns

- All ticket data lives in `.md` frontmatter — `gray-matter` parses/serializes everywhere
- Drag-and-drop uses native HTML5 API (no library)
- Composables: `useDragDrop` (drag state), `useMarkdown` (checkbox counting/toggling), `useTicketWriter` (dev-only POST wrapper)
- The plugin only runs in `apply: 'serve'` mode — no server-side code in production builds
- The CLI (`src/cli.mjs`) is plain JS (not TypeScript) so it runs without a build step

### Consuming Project Setup

```
.vitepress/theme/index.ts  →  import Theme from 'vitepress-theme-pm'; export default Theme
.vitepress/config.ts        →  import { markdownWriterPlugin } from 'vitepress-theme-pm/plugin'
board.md                    →  layout: page, board: true, columns config, ticketPrefix
tickets/*.md                →  frontmatter: id, title, status, priority, tags
```

## Example Project

`example/` is a working VitePress site that consumes the theme via `file:..` link. It has 14 tickets, doc pages under `guide/`, `architecture/`, `development/`, and a `board.md` with prefix `RPG`.

## Reference

`vitepress-pm-theme.tsx` in the repo root is the original React prototype — it defines the UI/interaction design but is not used by the Vue implementation.
