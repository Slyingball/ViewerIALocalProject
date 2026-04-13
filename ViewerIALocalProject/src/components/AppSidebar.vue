<script setup lang="ts">
import type { Model, PromptData } from '../composables/useApi'

defineProps<{
  models: Record<string, Model>
  currentModel: string
  useContext: boolean
  systemMode: string
  prompts: Record<string, PromptData>
}>()

const emit = defineEmits<{
  (e: 'select-model', key: string): void
  (e: 'update:useContext', value: boolean): void
  (e: 'update:systemMode', value: string): void
  (e: 'clear-history'): void
  (e: 'clear-all-history'): void
  (e: 'open-prompt-admin'): void
  (e: 'insert-prompt', text: string): void
}>()

const quickCommands = [
  {
    icon: '🔍',
    name: 'Scan rapide',
    desc: 'Ports précis avec -F',
    prompt: 'Fais un scan rapide de 192.168.0.10 ports 22,80',
  },
  {
    icon: '🔎',
    name: 'Scan versions',
    desc: 'Détection services -sV',
    prompt: 'Scan versions de scanme.nmap.org ports 80,443',
  },
  {
    icon: '📡',
    name: 'Recon rapide',
    desc: 'Ping + Nmap + HTTP',
    prompt: 'Reconnaissance rapide de scanme.nmap.org',
  },
  {
    icon: '🌐',
    name: 'Discovery LAN',
    desc: 'Auto-détection réseau',
    prompt: 'Découvre toutes les machines de mon réseau local',
  },
  {
    icon: '🛡️',
    name: 'Audit sécurité',
    desc: 'Ports admin + alertes',
    prompt: 'Audite les ports admin de 192.168.1.1',
  },
  {
    icon: '💻',
    name: 'État système',
    desc: 'CPU, RAM, disque',
    prompt: 'Quel est l\'état de cette machine ?',
  },
]
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-top">
      <!-- Brand -->
      <div class="brand">
        <div class="logo-circle">IA</div>
        <div class="brand-text">
          <div class="brand-name">Multi-IA Locale</div>
          <div class="brand-sub">Ollama + Flask</div>
        </div>
      </div>

      <!-- Models -->
      <div class="sidebar-section">
        <div class="section-label">Modèle</div>
        <div class="model-list">
          <button
            v-for="(info, key) in models"
            :key="key"
            :class="['model-pill', { active: currentModel === key }]"
            @click="emit('select-model', key as string)"
          >
            <span class="pill-badge">{{ info.icon }}</span>
            <div class="pill-info">
              <span class="pill-name">{{ info.name }}</span>
              <span class="pill-desc">{{ info.description }}</span>
            </div>
            <span class="pill-check">✓</span>
          </button>
        </div>
      </div>

      <!-- Options -->
      <div class="sidebar-section">
        <div class="section-label">Options</div>
        <label class="toggle-row">
          <input
            type="checkbox"
            :checked="useContext"
            @change="emit('update:useContext', ($event.target as HTMLInputElement).checked)"
          />
          <span>Contexte de conversation</span>
        </label>
        <div class="select-row">
          <span>Mode système</span>
          <select
            :value="systemMode"
            @change="emit('update:systemMode', ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="(prompt, key) in prompts" :key="key" :value="key">
              {{ prompt.icon || '💬' }} {{ prompt.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Quick Commands -->
      <div class="sidebar-section">
        <div class="section-label">Commandes rapides</div>
        <div class="quick-commands">
          <div
            v-for="cmd in quickCommands"
            :key="cmd.name"
            class="quick-cmd"
            @click="emit('insert-prompt', cmd.prompt)"
          >
            <div class="cmd-icon">{{ cmd.icon }}</div>
            <div class="cmd-body">
              <div class="cmd-name">{{ cmd.name }}</div>
              <div class="cmd-desc">{{ cmd.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sidebar Bottom Actions -->
    <div class="sidebar-bottom">
      <button class="sidebar-action settings-btn" @click="emit('open-prompt-admin')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        Gestion des Prompts
      </button>
      <button class="sidebar-action" @click="emit('clear-history')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        Effacer historique
      </button>
      <button class="sidebar-action" @click="emit('clear-all-history')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
        Tout effacer
      </button>
    </div>
  </aside>
</template>
