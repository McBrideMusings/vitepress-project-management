<script setup lang="ts">
import { ref, nextTick } from 'vue'

defineProps<{
  tags: string[]
}>()

const emit = defineEmits<{
  add: [tag: string]
  remove: [tag: string]
}>()

const tagInput = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function addTag() {
  const t = tagInput.value.trim().toLowerCase()
  if (t) {
    emit('add', t)
    tagInput.value = ''
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    addTag()
  }
  if (e.key === 'Backspace' && tagInput.value === '') {
    // Remove last tag on backspace in empty input
    emit('remove', '')
  }
}

function focusInput() {
  inputRef.value?.focus()
}
</script>

<template>
  <div
    style="display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 4px 8px; background: #0d1117; border: 1px solid #2d3748; border-radius: 6px; min-height: 32px; cursor: text"
    @click="focusInput"
  >
    <span
      v-for="tag in tags"
      :key="tag"
      style="display: inline-flex; align-items: center; gap: 3px; font-size: 11px; padding: 2px 8px; border-radius: 10px; background: #2d3748; color: #a0aec0; white-space: nowrap"
    >
      {{ tag }}
      <button
        style="background: none; border: none; color: #718096; cursor: pointer; font-size: 12px; padding: 0; line-height: 1; display: flex; align-items: center"
        @click.stop="emit('remove', tag)"
      >&times;</button>
    </span>
    <input
      ref="inputRef"
      v-model="tagInput"
      placeholder="Add tag..."
      style="flex: 1; min-width: 60px; font-size: 12px; padding: 2px 0; background: transparent; border: none; color: #e2e8f0; outline: none"
      @keydown="onKeydown"
      @blur="addTag"
    >
  </div>
</template>
