<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'send', question: string): void
}>()

defineProps<{
  loading: boolean
}>()

const question = ref('')

function handleSubmit() {
  const q = question.value.trim()
  if (!q) return
  emit('send', q)
  question.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault()
    handleSubmit()
  }
}
</script>

<template>
  <form class="input-dock" @submit.prevent="handleSubmit">
    <textarea
      v-model="question"
      rows="2"
      placeholder="Saisissez votre requête... (Ctrl+Enter pour envoyer)"
      required
      @keydown="handleKeydown"
    ></textarea>
    <div class="dock-actions">
      <div></div>
      <button type="submit" class="send-btn" :disabled="loading || !question.trim()">
        <span v-if="!loading" class="send-label">Envoyer</span>
        <span v-else class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
    </div>
  </form>
</template>
