<script setup lang="ts">
import type { Model } from '../composables/useApi'

const props = defineProps<{
  models: Record<string, Model>
  currentModel: string
  useContext: boolean
  systemMode: string
}>()

const emit = defineEmits<{
  (e: 'select-model', key: string): void
  (e: 'update:useContext', value: boolean): void
  (e: 'update:systemMode', value: string): void
  (e: 'clear-history'): void
  (e: 'clear-all-history'): void
}>()
</script>

<template>
  <aside class="sidebar">
    <!-- Brand -->
    <div class="brand">
      <div class="logo-circle">IA</div>
      <div>
        <div class="brand-name">Multi-IA Locale</div>
        <div class="brand-sub">Propulsé par Ollama + Flask</div>
      </div>
    </div>

    <!-- Models -->
    <div class="panel">
      <div class="panel-title">Modèles disponibles</div>
      <div class="model-list">
        <button
          v-for="(info, key) in models"
          :key="key"
          :class="['model-pill', { active: currentModel === key }]"
          @click="emit('select-model', key as string)"
        >
          <div class="pill-main">
            <span class="pill-badge">{{ info.icon }}</span>
            <div>
              <div class="pill-name">{{ info.name }}</div>
              <div class="pill-desc">{{ info.description }}</div>
            </div>
          </div>
          <span class="pill-check">✓</span>
        </button>
      </div>
    </div>

    <!-- Options -->
    <div class="panel">
      <div class="panel-title">Options</div>
      <label class="row toggle-row">
        <input
          type="checkbox"
          :checked="useContext"
          @change="emit('update:useContext', ($event.target as HTMLInputElement).checked)"
        />
        <span>Utiliser le contexte de conversation</span>
      </label>
      <label class="row select-row">
        <span>Mode système</span>
        <select
          :value="systemMode"
          @change="emit('update:systemMode', ($event.target as HTMLSelectElement).value)"
        >
          <option value="general">Général</option>
          <option value="cybersecurity">Cybersécurité</option>
        </select>
      </label>
    </div>

    <!-- Commands -->
    <div class="panel commands-panel">
      <div class="panel-title">Commandes disponibles</div>
      <table class="commands-table">
        <thead>
          <tr>
            <th>Commande</th>
            <th>Description</th>
            <th>Exemple</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Scan rapide</td>
            <td>Ports précis avec scan rapide (-F)</td>
            <td>192.168.0.10 ports 22,80</td>
          </tr>
          <tr>
            <td>Scan versions</td>
            <td>Détection services (-sV)</td>
            <td>scanme.nmap.org ports 80,443 sV</td>
          </tr>
          <tr>
            <td>Scan complet</td>
            <td>Plage large sans ping</td>
            <td>192.168.0.10 ports 1-1024 no-ping</td>
          </tr>
          <tr>
            <td>Ping</td>
            <td>Test de connectivité ICMP</td>
            <td>Ping 192.168.0.1</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Actions -->
    <div class="panel actions-panel">
      <button class="ghost-btn" @click="emit('clear-history')">
        Effacer historique modèle
      </button>
      <button class="ghost-btn" @click="emit('clear-all-history')">
        Effacer tout l'historique
      </button>
    </div>
  </aside>
</template>
