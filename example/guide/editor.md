---
title: "Editor"
---

## Autosave

The editor autosaves your work 1500ms after you stop typing. A save indicator in the toolbar shows the current state:

- **Green dot** — All changes saved
- **Yellow dot** — Unsaved changes (saving soon)
- **Red dot** — Save failed (will retry)

## Ticket Editing

Click any card on the board to open the detail modal. From there you can:

- Edit the title
- Change status, priority, and tags
- Write a markdown description with interactive checkboxes

## Save Lifecycle

1. User edits a field
2. Change captured in local state
3. Debounce timer starts (1500ms)
4. On timer expiry, save dispatched to persistence layer
5. Plugin writes updated frontmatter/body to the `.md` file
6. Save indicator updates
