import { ref } from 'vue'

const API_BASE = 'http://localhost:5000'

export interface Model {
  name: string
  description: string
  icon: string
  supports_tools: boolean
}

export interface HistoryItem {
  question: string
  answer: string
}

export function useApi() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || `Erreur ${response.status}`)
    }
    return data as T
  }

  async function getModels(): Promise<Record<string, Model>> {
    try {
      return await fetchJson<Record<string, Model>>('/models')
    } catch (e: any) {
      error.value = e.message
      return {}
    }
  }

  async function askQuestion(
    model: string,
    question: string,
    useContext: boolean,
    systemMode: string,
  ): Promise<{ answer: string; model_used: string; history_length: number }> {
    loading.value = true
    error.value = null
    try {
      const data = await fetchJson<{
        answer: string
        model_used: string
        history_length: number
      }>('/ask', {
        method: 'POST',
        body: JSON.stringify({
          model,
          question,
          use_context: useContext,
          system_mode: systemMode,
        }),
      })
      return data
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function getHistory(
    modelKey: string,
  ): Promise<{ model: string; history: HistoryItem[] }> {
    try {
      return await fetchJson<{ model: string; history: HistoryItem[] }>(
        `/history/${modelKey}`,
      )
    } catch (e: any) {
      error.value = e.message
      return { model: modelKey, history: [] }
    }
  }

  async function clearHistory(modelKey: string): Promise<void> {
    try {
      await fetchJson('/clear_history', {
        method: 'POST',
        body: JSON.stringify({ model: modelKey }),
      })
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function clearAllHistory(): Promise<void> {
    try {
      await fetchJson('/clear_history', {
        method: 'POST',
        body: JSON.stringify({ model: 'all' }),
      })
    } catch (e: any) {
      error.value = e.message
    }
  }

  return {
    loading,
    error,
    getModels,
    askQuestion,
    getHistory,
    clearHistory,
    clearAllHistory,
  }
}
