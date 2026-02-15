import type { Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

/** Scan a tickets directory and return the highest numeric `id` found in frontmatter. */
export function getMaxTicketId(ticketsDir: string): number {
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

export function markdownWriterPlugin(): Plugin {
  let srcDir = ''
  let nextId = 0

  return {
    name: 'vitepress-pm-markdown-writer',
    apply: 'serve',

    configResolved(config) {
      srcDir = config.root
    },

    configureServer(server) {
      // Serve ticket data as JSON
      server.middlewares.use('/__vitepress_pm_tickets', (req, res) => {
        const url = new URL(req.url || '/', 'http://localhost')
        const dir = url.searchParams.get('dir') || 'tickets'
        const ticketsDir = path.resolve(srcDir, dir)

        if (!fs.existsSync(ticketsDir)) {
          res.setHeader('Content-Type', 'application/json')
          res.end('[]')
          return
        }

        const files = fs.readdirSync(ticketsDir).filter(f => f.endsWith('.md'))
        let maxId = 0
        const tickets = files.map(file => {
          const raw = fs.readFileSync(path.join(ticketsDir, file), 'utf-8')
          const parsed = matter(raw)
          const id = Number(parsed.data.id) || 0
          if (id > maxId) maxId = id
          return {
            id,
            title: parsed.data.title || path.basename(file, '.md'),
            status: parsed.data.status || 'backlog',
            priority: parsed.data.priority || 'medium',
            tags: parsed.data.tags || [],
            body: parsed.content.trim(),
            url: `/${dir}/${path.basename(file, '.md')}.html`,
          }
        })

        // Keep server counter in sync
        nextId = maxId + 1

        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(tickets))
      })

      // Create a new ticket (server-assigned sequential ID)
      server.middlewares.use('/__vitepress_pm_create', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => {
          try {
            const { dir, status, title, priority, tags, body: ticketBody } = JSON.parse(body)
            const ticketsDir = path.resolve(srcDir, dir || 'tickets')

            if (!fs.existsSync(ticketsDir)) {
              fs.mkdirSync(ticketsDir, { recursive: true })
            }

            // Recalculate to be safe (another process may have created files)
            const currentMax = getMaxTicketId(ticketsDir)
            if (nextId <= currentMax) nextId = currentMax + 1

            const id = nextId++
            const frontmatter = {
              id,
              title: title || 'New ticket',
              status: status || 'backlog',
              priority: priority || 'medium',
              tags: tags || [],
            }

            const bodyContent = ticketBody ? `\n${ticketBody}\n` : '\n'
            const content = matter.stringify(bodyContent, frontmatter)
            const filePath = path.join(ticketsDir, `${id}.md`)
            fs.writeFileSync(filePath, content)

            const ticket = {
              ...frontmatter,
              body: ticketBody || '',
              url: `/${dir || 'tickets'}/${id}.html`,
            }

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(ticket))
          } catch (e) {
            res.statusCode = 500
            res.end(String(e))
          }
        })
      })

      // Update an existing ticket
      server.middlewares.use('/__vitepress_pm_update', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => {
          try {
            const { url, updates } = JSON.parse(body)
            if (!url || typeof url !== 'string') {
              res.statusCode = 400
              res.end('Missing url')
              return
            }

            // url is like /tickets/1.html -> tickets/1.md
            const mdPath = url.replace(/\.html$/, '.md').replace(/^\//, '')
            const filePath = path.resolve(srcDir, mdPath)

            if (!fs.existsSync(filePath)) {
              res.statusCode = 404
              res.end(`File not found: ${mdPath}`)
              return
            }

            const raw = fs.readFileSync(filePath, 'utf-8')
            const parsed = matter(raw)

            // Merge updates into frontmatter
            for (const [key, value] of Object.entries(updates)) {
              if (key === 'body') {
                parsed.content = '\n' + String(value) + '\n'
              } else {
                parsed.data[key] = value
              }
            }

            const output = matter.stringify(parsed.content, parsed.data)
            fs.writeFileSync(filePath, output)

            res.statusCode = 200
            res.end('ok')
          } catch (e) {
            res.statusCode = 500
            res.end(String(e))
          }
        })
      })
    },
  }
}
