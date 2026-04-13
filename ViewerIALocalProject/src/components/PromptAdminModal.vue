<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { PromptData } from '../composables/useApi'
import { useApi } from '../composables/useApi'

const props = defineProps<{
  visible: boolean
  prompts: Record<string, PromptData>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'prompts-updated'): void
}>()

const api = useApi()

const currentEditingId = ref<string | null>(null)
const formIcon = ref('💬')
const formName = ref('')
const formId = ref('')
const formContent = ref('')
const isIdDisabled = ref(false)
const saveMessage = ref('')

const charCount = computed(() => formContent.value.length)
const charCountColor = computed(() => charCount.value > 4500 ? 'var(--danger)' : 'var(--muted)')

const currentPrompt = computed(() => {
  if (!currentEditingId.value) return null
  return props.prompts[currentEditingId.value] ?? null
})

function selectPrompt(id: string) {
  const prompt = props.prompts[id]
  if (!prompt) return

  currentEditingId.value = id
  formIcon.value = prompt.icon || '💬'
  formName.value = prompt.name || ''
  formId.value = id
  formContent.value = prompt.content || ''
  isIdDisabled.value = true
  saveMessage.value = ''
}

function prepareNew() {
  currentEditingId.value = null
  formIcon.value = '💬'
  formName.value = ''
  formId.value = ''
  formContent.value = ''
  isIdDisabled.value = false
  saveMessage.value = ''
}

async function save() {
  const id = formId.value.trim().toLowerCase()
  const name = formName.value.trim()
  const content = formContent.value.trim()
  const icon = formIcon.value.trim() || '💬'

  if (!id || !name || !content) {
    alert('Tous les champs sont requis (identifiant, nom, contenu).')
    return
  }

  try {
    const data = await api.createOrUpdatePrompt({ id, name, content, icon })
    currentEditingId.value = data.id || id
    isIdDisabled.value = true
    saveMessage.value = '✅ Enregistré !'
    setTimeout(() => { saveMessage.value = '' }, 1500)
    emit('prompts-updated')
  } catch (e: any) {
    alert(`Erreur: ${e.message}`)
  }
}

async function deleteCurrentPrompt() {
  if (!currentEditingId.value) return
  const name = props.prompts[currentEditingId.value]?.name || currentEditingId.value

  if (!confirm(`Supprimer définitivement le prompt "${name}" ?`)) return

  try {
    await api.deletePrompt(currentEditingId.value)
    currentEditingId.value = null
    emit('prompts-updated')
  } catch (e: any) {
    alert(`Erreur: ${e.message}`)
  }
}

async function duplicateCurrentPrompt() {
  if (!currentEditingId.value) return

  try {
    const data = await api.duplicatePrompt(currentEditingId.value)
    emit('prompts-updated')
    // Wait a tick for prompts to refresh, then select the new one
    setTimeout(() => selectPrompt(data.id), 100)
  } catch (e: any) {
    alert(`Erreur: ${e.message}`)
  }
}

function close() {
  emit('close')
}

function handleOverlayClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
    close()
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

// Reset state when modal opens
watch(() => props.visible, (val) => {
  if (val) {
    currentEditingId.value = null
    formIcon.value = '💬'
    formName.value = ''
    formId.value = ''
    formContent.value = ''
    isIdDisabled.value = false
    saveMessage.value = ''
    window.addEventListener('keydown', handleKeydown)
  } else {
    window.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<template>
  <div
    :class="['modal-overlay', { active: visible }]"
    @click="handleOverlayClick"
  >
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <div class="modal-header-left">
          <div class="modal-icon">⚙️</div>
          <div>
            <h2 class="modal-title">Gestion des Prompts Systèmes</h2>
            <p class="modal-subtitle">Créez et personnalisez les comportements de votre IA</p>
          </div>
        </div>
        <button class="modal-close" @click="close">&times;</button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <!-- Left: Prompt list -->
        <div class="prompt-list-pane">
          <div class="prompt-list-header">
            <span class="prompt-list-title">Profils</span>
            <button class="add-prompt-btn" @click="prepareNew">+ Nouveau</button>
          </div>
          <div class="prompt-list">
            <div
              v-for="(prompt, key) in prompts"
              :key="key"
              :class="['prompt-item', { active: currentEditingId === key }]"
              @click="selectPrompt(key as string)"
            >
              <div class="prompt-item-icon">{{ prompt.icon || '💬' }}</div>
              <div class="prompt-item-info">
                <div class="prompt-item-name">
                  {{ prompt.name }}
                  <span v-if="prompt.is_default" class="prompt-default-badge">défaut</span>
                </div>
                <div class="prompt-item-id">{{ key }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Editor -->
        <div class="prompt-editor-pane">
          <!-- Placeholder -->
          <div v-if="currentEditingId === null && formId === ''" class="editor-placeholder">
            <div class="editor-placeholder-icon">📝</div>
            <p>Sélectionnez un prompt ou créez-en un nouveau</p>
          </div>

          <!-- Form -->
          <div v-else class="editor-form">
            <div class="editor-row">
              <div class="editor-field">
                <label>Icône</label>
                <input v-model="formIcon" type="text" placeholder="💬" maxlength="4" />
              </div>
              <div class="editor-field" style="flex: 3">
                <label>Nom du profil</label>
                <input v-model="formName" type="text" placeholder="Ex: Assistant Développeur" />
              </div>
            </div>
            <div class="editor-field">
              <label>Identifiant technique</label>
              <input
                v-model="formId"
                type="text"
                placeholder="ex: dev-python"
                pattern="[a-z0-9_-]+"
                :disabled="isIdDisabled"
              />
              <small class="editor-hint">Lettres minuscules, chiffres, tirets. Non modifiable après création.</small>
            </div>
            <div class="editor-field" style="flex: 1">
              <label>Prompt système</label>
              <textarea
                v-model="formContent"
                rows="10"
                placeholder="Décrivez le rôle de l'IA..."
              ></textarea>
              <div class="editor-char-count">
                <span :style="{ color: charCountColor }">{{ charCount }}</span> / 5000
              </div>
            </div>
            <div class="editor-actions">
              <div class="editor-actions-left">
                <span v-if="currentPrompt?.updated_at" class="editor-meta">
                  Dernière modification: {{ new Date(currentPrompt.updated_at).toLocaleDateString('fr-FR') }}
                  {{ new Date(currentPrompt.updated_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}
                </span>
                <span v-else-if="currentEditingId === null" class="editor-meta">Nouveau prompt</span>
              </div>
              <div class="editor-actions-right">
                <button
                  v-if="currentEditingId"
                  class="ghost-btn"
                  @click="duplicateCurrentPrompt"
                >📋 Dupliquer</button>
                <button
                  v-if="currentEditingId && !currentPrompt?.is_default"
                  class="ghost-btn danger-btn"
                  @click="deleteCurrentPrompt"
                >🗑️ Supprimer</button>
                <button class="save-btn" @click="save">
                  {{ saveMessage || '💾 Enregistrer' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
