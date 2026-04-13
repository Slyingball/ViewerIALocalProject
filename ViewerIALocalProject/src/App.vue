<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppSidebar from './components/AppSidebar.vue'
import ChatWindow from './components/ChatWindow.vue'
import PromptAdminModal from './components/PromptAdminModal.vue'
import type { ChatMessage } from './components/ChatWindow.vue'
import { useApi } from './composables/useApi'
import type { Model, PromptData } from './composables/useApi'

const api = useApi()

// --- State ---
const models = ref<Record<string, Model>>({})
const currentModel = ref('llama3')
const useContext = ref(true)
const systemMode = ref('general')
const messages = ref<ChatMessage[]>([])
const prompts = ref<Record<string, PromptData>>({})
const sidebarCollapsed = ref(false)
const showPromptModal = ref(false)

// --- Computed ---
const modelLabel = computed(() => {
  const m = models.value[currentModel.value]
  return m ? m.name : currentModel.value
})

// --- Refs ---
const chatWindowRef = ref<InstanceType<typeof ChatWindow> | null>(null)

// --- Methods ---
async function loadModels() {
  models.value = await api.getModels()
  const keys = Object.keys(models.value)
  if (keys.length > 0 && !models.value[currentModel.value]) {
    currentModel.value = keys[0] as string
  }
  await loadHistory()
}

async function loadPrompts() {
  prompts.value = await api.getPrompts()
  // Ensure current systemMode is valid
  if (!prompts.value[systemMode.value]) {
    const firstKey = Object.keys(prompts.value)[0]
    if (firstKey) systemMode.value = firstKey
  }
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
  if (!confirm(`Voulez-vous effacer l'historique de ${modelLabel.value} ?`)) return
  await api.clearHistory(currentModel.value)
  messages.value = []
}

async function handleClearAllHistory() {
  if (!confirm("Effacer l'historique de tous les modèles ?")) return
  await api.clearAllHistory()
  messages.value = []
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function handleInsertPrompt(text: string) {
  chatWindowRef.value?.insertPrompt(text)
}

function openPromptAdmin() {
  showPromptModal.value = true
}

function closePromptAdmin() {
  showPromptModal.value = false
}

async function handlePromptsUpdated() {
  await loadPrompts()
}

// --- Lifecycle ---
onMounted(() => {
  loadModels()
  loadPrompts()
})
</script>

<template>
  <div class="background-effects">
    <div class="glow-orb orb-1"></div>
    <div class="glow-orb orb-2"></div>
  </div>

  <div class="app-layout">
    <AppSidebar
      :class="{ collapsed: sidebarCollapsed }"
      :models="models"
      :current-model="currentModel"
      :use-context="useContext"
      :system-mode="systemMode"
      :prompts="prompts"
      @select-model="selectModel"
      @update:use-context="useContext = $event"
      @update:system-mode="systemMode = $event"
      @clear-history="handleClearHistory"
      @clear-all-history="handleClearAllHistory"
      @open-prompt-admin="openPromptAdmin"
      @insert-prompt="handleInsertPrompt"
    />

    <ChatWindow
      ref="chatWindowRef"
      :messages="messages"
      :model-label="modelLabel"
      :loading="api.loading.value"
      @send="sendMessage"
      @toggle-sidebar="toggleSidebar"
    />
  </div>

  <PromptAdminModal
    :visible="showPromptModal"
    :prompts="prompts"
    @close="closePromptAdmin"
    @prompts-updated="handlePromptsUpdated"
  />
</template>
