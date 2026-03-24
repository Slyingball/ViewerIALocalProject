<script setup lang="ts">
defineProps<{
  text: string
  type: 'user' | 'ai' | 'error'
}>()
</script>

<template>
  <div :class="['message', `${type}-message`]">
    <!-- Avatar -->
    <div :class="['avatar', `${type}-avatar`]">
      <!-- User Icon -->
      <svg v-if="type === 'user'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      <!-- AI Icon -->
      <svg v-else-if="type === 'ai'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
      <!-- Error Icon -->
      <span v-else style="font-weight: 700;">!</span>
    </div>

    <!-- Content -->
    <div class="message-content">{{ text }}</div>
  </div>
</template>
