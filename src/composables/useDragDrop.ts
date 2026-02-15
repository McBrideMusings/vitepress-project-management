import { ref } from 'vue'

export function useDragDrop(onDrop: (ticketId: string, targetColumn: string) => void) {
  const dragOverColumn = ref<string | null>(null)

  function handleDragStart(e: DragEvent, ticketId: string) {
    if (!e.dataTransfer) return
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', ticketId)
    requestAnimationFrame(() => {
      const el = e.target as HTMLElement
      el.style.opacity = '0.4'
    })
  }

  function handleDragEnd(e: DragEvent) {
    const el = e.target as HTMLElement
    el.style.opacity = '1'
    dragOverColumn.value = null
  }

  function handleDragOver(e: DragEvent, columnKey: string) {
    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
    dragOverColumn.value = columnKey
  }

  function handleDragLeave() {
    dragOverColumn.value = null
  }

  function handleDrop(e: DragEvent, columnKey: string) {
    e.preventDefault()
    const ticketId = e.dataTransfer?.getData('text/plain')
    if (ticketId) onDrop(ticketId, columnKey)
    dragOverColumn.value = null
  }

  return {
    dragOverColumn,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  }
}
