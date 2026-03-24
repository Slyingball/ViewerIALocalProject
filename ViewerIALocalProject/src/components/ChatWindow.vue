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
}>()

const containerRef = ref<HTMLElement | null>(null)

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
</script>

<template>
  <main class="chat-pane">
    <!-- Header -->
    <div class="chat-header">
      <div>
        <div class="chat-kicker">Conversation active</div>
        <div class="chat-title">Assistant IA 🤖</div>
      </div>
      <div class="chip">{{ modelLabel }}</div>
    </div>

    <!-- Messages Container -->
    <div ref="containerRef" class="chat-container">
      <!-- Welcome -->
      <div v-if="messages.length === 0" class="welcome-block">
        <div class="welcome-title">Bienvenue</div>
        <div class="welcome-sub">Choisissez un modèle et posez votre première question.</div>
      </div>

      <!-- Messages -->
      <MessageBubble
        v-for="(msg, i) in messages"
        :key="i"
        :text="msg.text"
        :type="msg.type"
      />

      <!-- Typing indicator -->
      <div v-if="loading" class="message ai-message">
        <div class="avatar ai-avatar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>
        <div class="message-content">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Input -->
    <ChatInput :loading="loading" @send="(q) => emit('send', q)" />
  </main>
</template>
