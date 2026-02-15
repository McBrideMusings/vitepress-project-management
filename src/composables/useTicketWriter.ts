import { ref } from 'vue'

export function useTicketWriter() {
  const saving = ref(false)
  const error = ref<string | null>(null)

  const isDev = import.meta.env.DEV

  async function writeTicket(url: string, updates: Record<string, unknown>) {
    if (!isDev) return

    saving.value = true
    error.value = null

    try {
      const res = await fetch('/__vitepress_pm_update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, updates }),
      })
      if (!res.ok) {
        error.value = await res.text()
      }
    } catch (e) {
      error.value = String(e)
    } finally {
      saving.value = false
    }
  }

  return { saving, error, writeTicket }
}
