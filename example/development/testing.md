---
title: "Testing"
---

## Strategy

No test suite is configured yet. Planned approach:

### Unit Tests (Vitest)

Test composables and utility functions in isolation.

### E2E Tests (Playwright)

Test board interactions end-to-end: creating tickets, drag-and-drop, editing.

## Running Tests

```
npm run test          # All tests (when configured)
npm run test:unit     # Unit only
npm run test:e2e      # E2E only
```
