---
title: "API Reference"
---

## Plugin Endpoints

All endpoints are served by the Vite dev server plugin.

## GET /__vitepress_pm_tickets

Returns all tickets as a JSON array. Query params:

- `dir` — Tickets directory (default: `tickets`)

## POST /__vitepress_pm_create

Create a new ticket. JSON body:

- `dir` — Tickets directory
- `status` — Initial status
- `title` — Ticket title
- `priority` — Priority level
- `tags` — Tag array
- `body` — Markdown body

Returns the created ticket as JSON with assigned ID.

## POST /__vitepress_pm_update

Update an existing ticket. JSON body:

- `url` — Ticket URL (e.g. `/tickets/1.html`)
- `updates` — Object with fields to update
