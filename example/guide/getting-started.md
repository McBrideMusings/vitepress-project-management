---
title: "Getting Started"
---

## Installation

Clone the repository and install dependencies:

```
git clone https://github.com/youruser/my-project.git
cd my-project
npm install
```

## Quick Start

Run the development server:

```
npm run dev
```

The app starts on `http://localhost:5173` with hot reload enabled.

## Creating Your First Ticket

Click the **+ New** button in the board toolbar to create a ticket. Fill in the title, priority, and tags, then click **Create ticket**.

Tickets are markdown files with YAML frontmatter for structured fields and a markdown body for freeform description.

## Project Structure

- `src/` — Application source code
- `src/schema.ts` — Entity type schemas
- `src/store/` — State management
- `src/components/` — Vue components
- `docs/` — Documentation site
- `tickets/` — Board tickets as markdown files
