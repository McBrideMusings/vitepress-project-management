---
title: "Configuration"
---

## Board Configuration

The board is configured via frontmatter in `board.md`:

```yaml
layout: page
board: true
ticketsDir: tickets
ticketPrefix: PM
defaultColumn: backlog
columns:
  - { key: backlog, label: Backlog, color: '#718096' }
  - { key: doing, label: In Progress, color: '#e6a817' }
  - { key: review, label: Review, color: '#9f7aea' }
  - { key: done, label: Done, color: '#6bcb6b' }
```

## Options

### ticketsDir

Directory where ticket `.md` files live. Default: `tickets`.

### ticketPrefix

String prepended to ticket IDs for display (e.g. `PM` shows as `PM-7`). Default: empty.

### defaultColumn

The column new tickets are placed in. Default: first column.

### columns

Array of column definitions. Each column has:

- `key` — Internal status value stored in ticket frontmatter
- `label` — Display name shown in the column header
- `color` — Hex color for the column header and accents
