<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const emit = defineEmits<{
  (e: 'send', question: string): void
}>()

defineProps<{
  loading: boolean
}>()

const question = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

function handleSubmit() {
  const q = question.value.trim()
  if (!q) return
  emit('send', q)
  question.value = ''
  nextTick(() => autoResize())
}

function handleKeydown(e: KeyboardEvent) {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault()
    handleSubmit()
  }
}

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 200) + 'px'
}

// Public method to insert text from quick commands
function setQuestion(text: string) {
  question.value = text
  nextTick(() => {
    autoResize()
    textareaRef.value?.focus()
  })
}

defineExpose({ setQuestion })

watch(question, () => {
  nextTick(() => autoResize())
})
</script>

<template>
  <div class="input-area">
    <form class="input-bar" @submit.prevent="handleSubmit">
      <textarea
        ref="textareaRef"
        v-model="question"
        rows="1"
        placeholder="Posez votre question..."
        required
        @keydown="handleKeydown"
        @input="autoResize"
      ></textarea>
      <button type="submit" class="send-btn" :disabled="loading || !question.trim()" title="Envoyer (Ctrl+Enter)">
        <span v-if="!loading" class="send-label">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </span>
        <span v-else class="loading">◌</span>
      </button>
    </form>
    <div class="input-hint">Ctrl+Entrée pour envoyer · LLaMA 3.1 pour les outils</div>
  </div>
</template>
