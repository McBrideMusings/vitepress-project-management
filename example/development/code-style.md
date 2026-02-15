---
title: "Code Style"
---

## TypeScript Conventions

- Strict mode enabled
- Prefer `interface` over `type` for object shapes
- Explicit return types on exported functions

## Naming

- Components: PascalCase (`BoardColumn.vue`)
- Composables: camelCase with `use` prefix (`useDragDrop`)
- Types/Interfaces: PascalCase (`Ticket`)
- Constants: UPPER_SNAKE_CASE (`MAX_TAGS`)
- Files: kebab-case (`board-column.ts`)

## Patterns

- Composition API exclusively (no Options API)
- Props defined with `defineProps` and TypeScript
- Emits defined with `defineEmits`
- Prefer computed over watchers
