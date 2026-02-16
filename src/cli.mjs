#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const args = process.argv.slice(2)
const command = args[0]

if (command === 'ticket') {
  createTicket(args.slice(1))
} else {
  console.log(`Usage:
  vitepress-theme-pm ticket "Title"           Create a new ticket
  vitepress-theme-pm ticket "Title" --status doing --priority high --tags core,ui

Options:
  --dir <path>       Tickets directory (default: tickets)
  --status <status>  Initial status (default: backlog)
  --priority <pri>   Priority: critical, high, medium, low (default: medium)
  --tags <tags>      Comma-separated tags
  --body <text>      Ticket body/description (markdown)
  --prefix <prefix>  Ticket ID prefix (overrides board.md ticketPrefix)`)
  process.exit(command ? 1 : 0)
}

function getMaxTicketId(ticketsDir) {
  if (!fs.existsSync(ticketsDir)) return 0
  const files = fs.readdirSync(ticketsDir).filter(f => f.endsWith('.md'))
  let max = 0
  for (const file of files) {
    const raw = fs.readFileSync(path.join(ticketsDir, file), 'utf-8')
    const parsed = matter(raw)
    const id = Number(parsed.data.id)
    if (id > max) max = id
  }
  return max
}

function parseArgs(args) {
  let title = ''
  let dir = 'tickets'
  let status = 'backlog'
  let priority = 'medium'
  let tags = []
  let body = ''
  let prefix = null

  let i = 0
  while (i < args.length) {
    if (args[i] === '--dir') { dir = args[++i]; i++; continue }
    if (args[i] === '--status') { status = args[++i]; i++; continue }
    if (args[i] === '--priority') { priority = args[++i]; i++; continue }
    if (args[i] === '--tags') { tags = args[++i].split(',').map(t => t.trim()).filter(Boolean); i++; continue }
    if (args[i] === '--body') { body = args[++i]; i++; continue }
    if (args[i] === '--prefix') { prefix = args[++i]; i++; continue }
    if (!title) { title = args[i] }
    i++
  }

  return { title, dir, status, priority, tags, body, prefix }
}

function readTicketPrefix(siteDir) {
  const boardPath = path.join(siteDir, 'board.md')
  if (!fs.existsSync(boardPath)) return null
  try {
    const raw = fs.readFileSync(boardPath, 'utf-8')
    const parsed = matter(raw)
    return parsed.data.ticketPrefix || null
  } catch {
    return null
  }
}

function createTicket(args) {
  const opts = parseArgs(args)

  if (!opts.title) {
    console.error('Error: title is required. Usage: vitepress-theme-pm ticket "My ticket title"')
    process.exit(1)
  }

  const ticketsDir = path.resolve(process.cwd(), opts.dir)
  if (!fs.existsSync(ticketsDir)) {
    fs.mkdirSync(ticketsDir, { recursive: true })
  }

  const id = getMaxTicketId(ticketsDir) + 1
  const prefix = opts.prefix !== null ? opts.prefix : readTicketPrefix(path.dirname(ticketsDir))
  const frontmatter = {
    id,
    title: opts.title,
    status: opts.status,
    priority: opts.priority,
  }
  if (opts.tags.length > 0) {
    frontmatter.tags = opts.tags
  }

  const slug = prefix ? `${prefix}-${id}` : String(id)
  const bodyContent = opts.body ? `\n${opts.body}\n` : '\n'
  const content = matter.stringify(bodyContent, frontmatter)
  const filePath = path.join(ticketsDir, `${slug}.md`)
  fs.writeFileSync(filePath, content)

  const displayId = prefix ? `${prefix}-${id}` : String(id)

  console.log(`Created ${displayId}: ${opts.title}`)
  console.log(`  File: ${path.relative(process.cwd(), filePath)}`)
}
