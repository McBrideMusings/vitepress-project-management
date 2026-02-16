<script setup lang="ts">
import { ref, computed } from 'vue'
import { useData } from 'vitepress'
import type { Ticket, Column } from '../types'
import { useDragDrop } from '../composables/useDragDrop'
import { useTicketWriter } from '../composables/useTicketWriter'
import BoardColumn from './BoardColumn.vue'
import TicketDetail from './TicketDetail.vue'
import TicketFixModal from './TicketFixModal.vue'
import TagFilterDropdown from './TagFilterDropdown.vue'
import '../styles/board.css'

const { frontmatter } = useData()

const columns = computed<Column[]>(() => frontmatter.value.columns || [])
const ticketsDir = computed(() => frontmatter.value.ticketsDir || 'tickets')
const ticketPrefix = computed(() => frontmatter.value.ticketPrefix || '')
const defaultColumn = computed(() => frontmatter.value.defaultColumn || (columns.value.length > 0 ? columns.value[0].key : 'backlog'))
const demo = computed(() => !!frontmatter.value.demo)

const tickets = ref<Ticket[]>([])
const selectedId = ref<number | null>(null)
const draftTicket = ref<Ticket | null>(null)
const filter = ref('')
const selectedTags = ref<string[]>([])

const allTags = computed(() =>
  [...new Set(tickets.value.flatMap(t => t.tags || []))].sort()
)
const ticketIssues = ref<any[]>([])
const showFixModal = ref(false)

const { writeTicket } = useTicketWriter()

function fetchValidation() {
  if (!import.meta.env.DEV) return
  fetch(`/__vitepress_pm_validate?dir=${encodeURIComponent(ticketsDir.value)}&prefix=${encodeURIComponent(ticketPrefix.value)}`)
    .then(r => r.ok ? r.json() : [])
    .then((data: any[]) => { ticketIssues.value = data })
    .catch(() => { ticketIssues.value = [] })
}

function loadTickets() {
  const url = import.meta.env.DEV
    ? `/__vitepress_pm_tickets?dir=${encodeURIComponent(ticketsDir.value)}`
    : `${import.meta.env.BASE_URL}__vitepress_pm_tickets/${encodeURIComponent(ticketsDir.value)}.json`

  fetch(url)
    .then(r => {
      if (r.ok) return r.json()
      throw new Error('not available')
    })
    .then((data: Ticket[]) => {
      tickets.value = data
      fetchValidation()
    })
    .catch(() => {})
}

function onFixed() {
  showFixModal.value = false
  if (demo.value) {
    // Apply fixes in-memory only — don't reload from disk
    for (const issue of ticketIssues.value) {
      const ticket = tickets.value.find(t => t.id === issue.currentId || t.id === 0)
      if (ticket) {
        ticket.id = issue.fixedId
        const slug = ticketPrefix.value ? `${ticketPrefix.value}-${issue.fixedId}` : String(issue.fixedId)
        ticket.url = `/${ticketsDir.value}/${slug}.html`
      }
    }
    ticketIssues.value = []
  } else {
    loadTickets()
  }
}

// Load tickets from dev plugin or static JSON
if (typeof window !== 'undefined') {
  loadTickets()
}

function updateTicket(id: number, patch: Partial<Ticket>) {
  tickets.value = tickets.value.map(t =>
    t.id === id ? { ...t, ...patch } : t
  )
  if (demo.value) return
  const ticket = tickets.value.find(t => t.id === id)
  if (ticket?.url) {
    // Don't send url/id to the file writer
    const { url: _url, id: _id, ...fields } = { ...patch } as any
    if (Object.keys(fields).length > 0) {
      writeTicket(ticket.url, fields)
    }
  }
}

function openNewTicket() {
  draftTicket.value = {
    id: 0,
    title: 'New ticket',
    status: defaultColumn.value,
    priority: 'medium',
    tags: [],
    body: '',
    url: '',
  }
}

async function confirmCreate(draft: Ticket) {
  if (import.meta.env.DEV && !demo.value) {
    try {
      const res = await fetch('/__vitepress_pm_create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dir: ticketsDir.value,
          prefix: ticketPrefix.value,
          status: draft.status,
          title: draft.title,
          priority: draft.priority,
          tags: draft.tags,
          body: draft.body,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const ticket: Ticket = await res.json()
      tickets.value = [...tickets.value, ticket]
      draftTicket.value = null
      return
    } catch (e) {
      console.error('Failed to create ticket:', e)
      return
    }
  }

  // Production: create in-memory only
  const maxId = tickets.value.reduce((m, t) => Math.max(m, t.id), 0)
  const newId = maxId + 1
  const slug = ticketPrefix.value ? `${ticketPrefix.value}-${newId}` : String(newId)
  const ticket: Ticket = {
    id: newId,
    title: draft.title,
    status: draft.status,
    priority: draft.priority,
    tags: [...draft.tags],
    body: draft.body,
    url: `/${ticketsDir.value}/${slug}.html`,
  }
  tickets.value = [...tickets.value, ticket]
  draftTicket.value = null
}

function deleteTicket(id: number) {
  if (confirm('Delete this ticket?')) {
    tickets.value = tickets.value.filter(t => t.id !== id)
    if (selectedId.value === id) selectedId.value = null
  }
}

const filteredTickets = computed(() => {
  let result = tickets.value
  if (filter.value) {
    const q = filter.value.toLowerCase()
    result = result.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.includes(q)) ||
      formatId(t.id).toLowerCase().includes(q)
    )
  }
  if (selectedTags.value.length > 0) {
    const tagSet = new Set(selectedTags.value)
    result = result.filter(t => t.tags.some(tag => tagSet.has(tag)))
  }
  return result
})

const selectedTicket = computed(() =>
  tickets.value.find(t => t.id === selectedId.value) || null
)

function columnTickets(key: string) {
  return filteredTickets.value.filter(t => t.status === key)
}

function formatId(id: number): string {
  return ticketPrefix.value ? `${ticketPrefix.value}-${id}` : String(id)
}

const { dragOverColumn, handleDragStart, handleDragEnd, handleDragOver, handleDragLeave, handleDrop } =
  useDragDrop((ticketId, targetColumn) => {
    updateTicket(Number(ticketId), { status: targetColumn })
  })
</script>

<template>
  <div style="display: flex; flex-direction: column; height: calc(100vh - var(--vp-nav-height) - 1px); overflow: hidden">
    <!-- Filter bar -->
    <div style="padding: 8px 16px; border-bottom: 1px solid #2d3748; flex-shrink: 0; display: flex; align-items: center; gap: 8px">
      <input
        v-model="filter"
        placeholder="Filter tickets..."
        style="font-size: 12px; padding: 4px 10px; background: #171923; border: 1px solid #2d3748; border-radius: 5px; color: #e2e8f0; outline: none; width: 200px; height: 28px; box-sizing: border-box"
      >
      <TagFilterDropdown
        v-model="selectedTags"
        :tags="allTags"
      />
      <button
        v-if="ticketIssues.length > 0"
        style="font-size: 12px; padding: 4px 12px; background: rgba(237, 137, 54, 0.12); border: 1px solid rgba(237, 137, 54, 0.4); border-radius: 5px; color: #ed8936; cursor: pointer; font-weight: 600; line-height: 1.2; height: 28px; box-sizing: border-box"
        @click="showFixModal = true"
      >&#9888; Fix {{ ticketIssues.length }} ticket{{ ticketIssues.length === 1 ? '' : 's' }}</button>
      <button
        title="New ticket"
        style="font-size: 13px; padding: 4px 12px; background: #2d3748; border: 1px solid #4a5568; border-radius: 5px; color: #e2e8f0; cursor: pointer; font-weight: 600; line-height: 1.2; height: 28px; box-sizing: border-box"
        @click="openNewTicket"
      >+ New</button>
    </div>

    <!-- Columns -->
    <div class="board-columns" style="flex: 1; display: flex; overflow: auto; padding: 12px 8px">
      <BoardColumn
        v-for="col in columns"
        :key="col.key"
        :column="col"
        :tickets="columnTickets(col.key)"
        :selected-id="selectedId"
        :ticket-prefix="ticketPrefix"
        :is-over="dragOverColumn === col.key"
        @select="(id: number) => selectedId = selectedId === id ? null : id"
        @dragstart="(e: DragEvent, id: number) => handleDragStart(e, String(id))"
        @dragend="handleDragEnd"
        @dragover="(e: DragEvent) => handleDragOver(e, col.key)"
        @dragleave="handleDragLeave"
        @drop="(e: DragEvent) => handleDrop(e, col.key)"
      />
    </div>

    <!-- Create modal -->
    <TicketDetail
      v-if="draftTicket"
      :ticket="draftTicket"
      :columns="columns"
      :ticket-prefix="ticketPrefix"
      :create-mode="true"
      @close="draftTicket = null"
      @update="(_id: number, patch: Partial<Ticket>) => { draftTicket = { ...draftTicket!, ...patch } }"
      @create="confirmCreate(draftTicket!)"
    />

    <!-- Edit modal -->
    <TicketDetail
      v-else-if="selectedTicket"
      :ticket="selectedTicket"
      :columns="columns"
      :ticket-prefix="ticketPrefix"
      @close="selectedId = null"
      @update="updateTicket"
      @delete="deleteTicket"
    />

    <!-- Fix modal -->
    <TicketFixModal
      v-if="showFixModal"
      :issues="ticketIssues"
      :tickets-dir="ticketsDir"
      :ticket-prefix="ticketPrefix"
      :demo="demo"
      @close="showFixModal = false"
      @fixed="onFixed"
    />
  </div>
</template>
