<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppSidebar from './components/AppSidebar.vue'
import ChatWindow from './components/ChatWindow.vue'
import type { ChatMessage } from './components/ChatWindow.vue'
import { useApi } from './composables/useApi'
import type { Model } from './composables/useApi'

const api = useApi()

// --- State ---
const models = ref<Record<string, Model>>({})
const currentModel = ref('llama3')
const useContext = ref(true)
const systemMode = ref('general')
const messages = ref<ChatMessage[]>([])

// --- Computed ---
const modelLabel = computed(() => {
  const m = models.value[currentModel.value]
  return m ? `Modèle: ${m.name}` : `Modèle: ${currentModel.value}`
})

// --- Methods ---
async function loadModels() {
  models.value = await api.getModels()
  // Select first model if current doesn't exist
  const keys = Object.keys(models.value)
  if (keys.length > 0 && !models.value[currentModel.value]) {
    currentModel.value = keys[0] as string
  }
  await loadHistory()
}

async function loadHistory() {
  const data = await api.getHistory(currentModel.value)
  messages.value = []
  if (data.history && data.history.length > 0) {
    for (const item of data.history) {
      messages.value.push({ text: item.question, type: 'user' })
      messages.value.push({ text: item.answer, type: 'ai' })
    }
  }
}

async function selectModel(key: string) {
  currentModel.value = key
  await loadHistory()
}

async function sendMessage(question: string) {
  messages.value.push({ text: question, type: 'user' })

  try {
    const data = await api.askQuestion(
      currentModel.value,
      question,
      useContext.value,
      systemMode.value,
    )
    messages.value.push({ text: data.answer, type: 'ai' })
  } catch (e: any) {
    messages.value.push({
      text: `Erreur: ${e.message}`,
      type: 'error',
    })
  }
}

async function handleClearHistory() {
  await api.clearHistory(currentModel.value)
  messages.value = []
}

async function handleClearAllHistory() {
  await api.clearAllHistory()
  messages.value = []
}

// --- Lifecycle ---
onMounted(() => {
  loadModels()
})
</script>

<template>
  <div class="background-effects">
    <div class="glow-orb orb-1"></div>
    <div class="glow-orb orb-2"></div>
    <div class="glow-orb orb-3"></div>
  </div>

  <div class="app-shell">
    <AppSidebar
      :models="models"
      :current-model="currentModel"
      :use-context="useContext"
      :system-mode="systemMode"
      @select-model="selectModel"
      @update:use-context="useContext = $event"
      @update:system-mode="systemMode = $event"
      @clear-history="handleClearHistory"
      @clear-all-history="handleClearAllHistory"
    />

    <ChatWindow
      :messages="messages"
      :model-label="modelLabel"
      :loading="api.loading.value"
      @send="sendMessage"
    />
  </div>
</template>
