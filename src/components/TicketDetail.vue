<script setup lang="ts">
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue'
import type { Ticket, Column } from '../types'
import { countCheckboxes, toggleCheckbox } from '../composables/useMarkdown'
import MarkdownBody from './MarkdownBody.vue'
import ProgressBar from './ProgressBar.vue'
import TagEditor from './TagEditor.vue'

const props = withDefaults(defineProps<{
  ticket: Ticket
  columns: Column[]
  ticketPrefix: string
  createMode?: boolean
  editable?: boolean
}>(), {
  createMode: false,
  editable: true,
})

const emit = defineEmits<{
  close: []
  update: [id: number, patch: Partial<Ticket>]
  delete: [id: number]
  create: []
}>()

const priorityOptions = ['critical', 'high', 'medium', 'low'] as const
const priorityColors: Record<string, string> = {
  critical: '#f56565',
  high: '#ed8936',
  medium: '#ecc94b',
  low: '#68d391',
}

const editing = ref(false)
const draft = ref(props.ticket.body)
const editTitle = ref(false)
const titleDraft = ref(props.ticket.title)
const titleRef = ref<HTMLInputElement | null>(null)

const col = computed(() => props.columns.find(c => c.key === props.ticket.status))
const checks = computed(() => countCheckboxes(props.ticket.body))
const displayId = computed(() =>
  props.ticketPrefix ? `${props.ticketPrefix}-${props.ticket.id}` : String(props.ticket.id)
)

watch(() => props.ticket.id, () => {
  draft.value = props.ticket.body
  titleDraft.value = props.ticket.title
  editing.value = false
  editTitle.value = false
})

watch(editTitle, (val) => {
  if (val) nextTick(() => titleRef.value?.focus())
})

function onEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && !editTitle.value && !editing.value) emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', onEscape)
  if (props.createMode) {
    editTitle.value = true
  }
})
onUnmounted(() => document.removeEventListener('keydown', onEscape))

function saveBody() {
  emit('update', props.ticket.id, { body: draft.value })
  editing.value = false
}

function saveTitle() {
  if (titleDraft.value.trim()) {
    emit('update', props.ticket.id, { title: titleDraft.value.trim() })
  }
  editTitle.value = false
}

function onCheckboxToggle(idx: number) {
  emit('update', props.ticket.id, { body: toggleCheckbox(props.ticket.body, idx) })
}

function addTag(tag: string) {
  if (tag && !props.ticket.tags.includes(tag)) {
    emit('update', props.ticket.id, { tags: [...props.ticket.tags, tag] })
  }
}

function removeTag(tag: string) {
  if (!tag) {
    if (props.ticket.tags.length > 0) {
      emit('update', props.ticket.id, { tags: props.ticket.tags.slice(0, -1) })
    }
    return
  }
  emit('update', props.ticket.id, { tags: props.ticket.tags.filter(t => t !== tag) })
}

function onBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('ticket-modal-backdrop')) {
    emit('close')
  }
}
</script>

<template>
  <!-- Modal backdrop -->
  <div
    class="ticket-modal-backdrop"
    style="position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(2px)"
    @click="onBackdropClick"
  >
    <!-- Modal container -->
    <div style="width: 90vw; max-width: 960px; height: 80vh; max-height: 700px; background: #0d1117; border: 1px solid #2d3748; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 24px 48px rgba(0,0,0,0.4)">

      <!-- Header bar -->
      <div style="display: flex; align-items: center; padding: 16px 24px; border-bottom: 1px solid #2d3748; flex-shrink: 0; background: #171923; gap: 12px">
        <!-- Ticket ID badge -->
        <span v-if="!createMode" style="font-size: 13px; font-weight: 700; color: #718096; font-family: monospace; white-space: nowrap; flex-shrink: 0">{{ displayId }}</span>
        <span v-else style="font-size: 13px; font-weight: 700; color: #6bcb6b; font-family: monospace; white-space: nowrap; flex-shrink: 0">NEW</span>

        <!-- Title (selectable text, not click-to-edit) -->
        <div v-if="editTitle" style="flex: 1; min-width: 0">
          <input
            ref="titleRef"
            v-model="titleDraft"
            style="width: 100%; font-size: 18px; font-weight: 700; color: #e2e8f0; background: #0d1117; border: 1px solid #e6a817; border-radius: 4px; padding: 4px 10px; outline: none"
            @blur="saveTitle"
            @keydown.enter="saveTitle"
            @keydown.escape.stop="editTitle = false"
          >
        </div>
        <h2
          v-else
          style="margin: 0; font-size: 18px; font-weight: 700; color: #e2e8f0; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
        >{{ ticket.title }}</h2>

        <!-- Edit title button -->
        <button
          v-if="editable && !editTitle"
          title="Edit title"
          style="background: none; border: 1px solid #2d3748; color: #718096; cursor: pointer; font-size: 13px; padding: 4px 8px; border-radius: 4px; flex-shrink: 0; line-height: 1"
          @click="titleDraft = ticket.title; editTitle = true"
        >&#9998;</button>

        <!-- Close button -->
        <button
          style="background: none; border: none; color: #718096; cursor: pointer; font-size: 20px; padding: 4px 8px; flex-shrink: 0; line-height: 1"
          @click="emit('close')"
        >&times;</button>
      </div>

      <!-- Two-column body -->
      <div style="flex: 1; display: flex; overflow: hidden">

        <!-- Left: Description -->
        <div style="flex: 1; overflow-y: auto; padding: 24px; min-width: 0">
          <div v-if="checks.total > 0" style="margin-bottom: 16px">
            <ProgressBar :done="checks.done" :total="checks.total" :color="col?.color || '#718096'" />
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px">
            <span style="font-size: 12px; color: #718096; text-transform: uppercase; letter-spacing: 1px; font-weight: 700">Description</span>
            <button
              v-if="editable && !editing"
              style="font-size: 12px; color: #e6a817; background: none; border: 1px solid rgba(230, 168, 23, 0.27); border-radius: 4px; padding: 3px 12px; cursor: pointer"
              @click="draft = ticket.body; editing = true"
            >Edit</button>
            <div v-else style="display: flex; gap: 6px">
              <button
                style="font-size: 12px; color: #6bcb6b; background: rgba(107, 203, 107, 0.09); border: 1px solid rgba(107, 203, 107, 0.27); border-radius: 4px; padding: 3px 12px; cursor: pointer"
                @click="saveBody"
              >Save</button>
              <button
                style="font-size: 12px; color: #718096; background: none; border: 1px solid #2d3748; border-radius: 4px; padding: 3px 12px; cursor: pointer"
                @click="editing = false"
              >Cancel</button>
            </div>
          </div>

          <textarea
            v-if="editing"
            v-model="draft"
            placeholder="Markdown here... Use - [ ] for checkboxes"
            style="width: 100%; min-height: 300px; padding: 12px; font-size: 13px; background: #171923; color: #e2e8f0; border: 1px solid rgba(230, 168, 23, 0.27); border-radius: 6px; resize: vertical; font-family: 'JetBrains Mono', monospace; line-height: 1.6; outline: none; box-sizing: border-box"
          />
          <MarkdownBody v-else :text="ticket.body" @checkbox-toggle="onCheckboxToggle" />
        </div>

        <!-- Right: Metadata sidebar -->
        <div style="width: 280px; flex-shrink: 0; border-left: 1px solid #2d3748; overflow-y: auto; padding: 24px; background: #171923">

          <!-- Status -->
          <div style="margin-bottom: 20px">
            <label style="display: block; font-size: 11px; color: #718096; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-bottom: 6px">Status</label>
            <div style="position: relative">
              <select
                :value="ticket.status"
                :disabled="!editable"
                style="width: 100%; appearance: none; font-size: 13px; padding: 7px 32px 7px 10px; background: #0d1117; border: 1px solid #2d3748; border-radius: 6px; color: #e2e8f0; outline: none; cursor: pointer"
                @change="emit('update', ticket.id, { status: ($event.target as HTMLSelectElement).value })"
              >
                <option
                  v-for="c in columns"
                  :key="c.key"
                  :value="c.key"
                >{{ c.label }}</option>
              </select>
              <div style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #718096; font-size: 10px">&#9660;</div>
            </div>
          </div>

          <!-- Priority -->
          <div style="margin-bottom: 20px">
            <label style="display: block; font-size: 11px; color: #718096; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-bottom: 6px">Priority</label>
            <div style="position: relative">
              <select
                :value="ticket.priority"
                :disabled="!editable"
                style="width: 100%; appearance: none; font-size: 13px; padding: 7px 32px 7px 10px; background: #0d1117; border: 1px solid #2d3748; border-radius: 6px; color: #e2e8f0; outline: none; cursor: pointer"
                @change="emit('update', ticket.id, { priority: ($event.target as HTMLSelectElement).value as any })"
              >
                <option v-for="p in priorityOptions" :key="p" :value="p">{{ p.charAt(0).toUpperCase() + p.slice(1) }}</option>
              </select>
              <div style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #718096; font-size: 10px">&#9660;</div>
            </div>
          </div>

          <!-- Tags -->
          <div style="margin-bottom: 20px">
            <label style="display: block; font-size: 11px; color: #718096; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-bottom: 6px">Tags</label>
            <TagEditor v-if="editable" :tags="ticket.tags" @add="addTag" @remove="removeTag" />
            <div v-else style="display: flex; flex-wrap: wrap; gap: 4px">
              <span
                v-for="tag in ticket.tags"
                :key="tag"
                style="font-size: 11px; padding: 2px 8px; border-radius: 8px; background: #2d3748; color: #718096"
              >{{ tag }}</span>
              <span v-if="!ticket.tags.length" style="font-size: 12px; color: #4a5568">None</span>
            </div>
          </div>

          <!-- Ticket ID -->
          <div v-if="!createMode" style="margin-bottom: 20px">
            <label style="display: block; font-size: 11px; color: #718096; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-bottom: 6px">ID</label>
            <span style="font-size: 13px; color: #4a5568; font-family: monospace">{{ displayId }}</span>
          </div>

          <!-- Create / Delete -->
          <div v-if="editable" style="padding-top: 20px; border-top: 1px solid #2d3748">
            <button
              v-if="createMode"
              style="font-size: 12px; color: #6bcb6b; background: rgba(107, 203, 107, 0.09); border: 1px solid rgba(107, 203, 107, 0.27); border-radius: 6px; padding: 6px 14px; cursor: pointer; width: 100%; font-weight: 600"
              @click="emit('create')"
            >Create ticket</button>
            <button
              v-else
              style="font-size: 12px; color: #f56565; background: none; border: 1px solid rgba(245, 101, 101, 0.27); border-radius: 6px; padding: 6px 14px; cursor: pointer; width: 100%"
              @click="emit('delete', ticket.id)"
            >Delete ticket</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
