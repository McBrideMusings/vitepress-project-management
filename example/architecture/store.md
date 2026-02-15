---
title: "Store"
---

## State Management

The board uses Vue's reactivity system for state. `Board.vue` holds the ticket array as a `ref` and passes data down via props.

## Data Flow

### Loading

On mount, `Board.vue` fetches tickets from the Vite plugin endpoint and populates the reactive array.

### Updates

When a ticket is modified (status change, title edit, tag update), the local array is patched and the change is written to disk via the plugin.

### Drag and Drop

Uses the native HTML5 drag-and-drop API. When a card is dropped on a column, the ticket's `status` field is updated.
