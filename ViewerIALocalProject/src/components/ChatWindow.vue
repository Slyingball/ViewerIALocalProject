<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import MessageBubble from './MessageBubble.vue'
import ChatInput from './ChatInput.vue'

export interface ChatMessage {
  text: string
  type: 'user' | 'ai' | 'error'
}

const props = defineProps<{
  messages: ChatMessage[]
  modelLabel: string
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'send', question: string): void
  (e: 'toggle-sidebar'): void
}>()

const containerRef = ref<HTMLElement | null>(null)
const chatInputRef = ref<InstanceType<typeof ChatInput> | null>(null)

function scrollToBottom() {
  nextTick(() => {
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight
    }
  })
}

watch(
  () => props.messages.length,
  () => scrollToBottom(),
)

function insertPrompt(text: string) {
  chatInputRef.value?.setQuestion(text)
}

defineExpose({ insertPrompt })
</script>

<template>
  <main class="chat-main">
    <!-- Topbar -->
    <div class="chat-topbar">
      <button class="sidebar-toggle" title="Menu" @click="emit('toggle-sidebar')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <div class="topbar-model">{{ modelLabel }}</div>
    </div>

    <!-- Messages Container -->
    <div ref="containerRef" class="chat-scroll">
      <!-- Welcome -->
      <div v-if="messages.length === 0" class="welcome-block">
        <div class="welcome-logo">IA</div>
        <h1 class="welcome-title">Bienvenue sur Multi-IA</h1>
        <p class="welcome-sub">Choisissez un modèle et posez votre question.</p>
      </div>

      <!-- Messages -->
      <div
        v-for="(msg, i) in messages"
        :key="i"
        :class="['msg-row', `${msg.type}-row`]"
      >
        <div class="msg-wrapper">
          <MessageBubble :text="msg.text" :type="msg.type" />
        </div>
      </div>

      <!-- Typing indicator -->
      <div v-if="loading" class="msg-row ai-row">
        <div class="msg-wrapper">
          <div class="msg-avatar ai-avatar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div class="msg-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input -->
    <ChatInput ref="chatInputRef" :loading="loading" @send="(q) => emit('send', q)" />
  </main>
</template>
