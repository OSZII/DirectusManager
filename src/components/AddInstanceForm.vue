<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Instance } from '../vite-env'
import { Globe, AlertCircle, FolderOpen, X } from 'lucide-vue-next'
import AppModal from './AppModal.vue'
import AppButton from './AppButton.vue'

const props = defineProps<{
  show: boolean
  editingInstance?: Instance | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', instance: Partial<Instance>): void
}>()

const formData = ref<Partial<Instance>>({
  name: '',
  url: '',
  token: '',
  customSchemaPath: '',
  customTypesPath: ''
})

watch(() => props.editingInstance, (newVal) => {
  if (newVal) {
    formData.value = { ...newVal }
  } else {
    formData.value = { name: '', url: '', token: '', customSchemaPath: '', customTypesPath: '' }
  }
}, { immediate: true })

const isEditing = computed(() => !!props.editingInstance)

async function browseSchemaFolder() {
  const selectedPath = await window.ipcRenderer.selectSchemaFolder()
  if (selectedPath) {
    formData.value.customSchemaPath = selectedPath
  }
}

function clearSchemaFolder() {
  formData.value.customSchemaPath = ''
}

async function browseTypesFolder() {
  const selectedPath = await window.ipcRenderer.selectTypesFolder()
  if (selectedPath) {
    formData.value.customTypesPath = selectedPath
  }
}

function clearTypesFolder() {
  formData.value.customTypesPath = ''
}

function save() {
  emit('save', { ...formData.value })
  formData.value = { name: '', url: '', token: '', customSchemaPath: '', customTypesPath: '' }
}
</script>

<template>
  <AppModal
    :show="show"
    :title="isEditing ? 'Edit Instance' : 'Add New Instance'"
    :subtitle="isEditing ? 'Update your instance configuration' : 'Connect to a Directus instance'"
    @close="emit('close')"
  >
    <template #icon>
      <Globe class="h-5 w-5 text-primary" />
    </template>

    <div class="space-y-5">
      <div class="space-y-1.5">
        <p class="text-sm font-medium text-base-content">Instance Name</p>
        <input
          v-model="formData.name"
          type="text"
          placeholder="My Project"
          class="input input-bordered w-full bg-base-100 border-base-content/10 placeholder:text-base-content/40 focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      <div class="space-y-1.5">
        <p class="text-sm font-medium text-base-content">Directus URL</p>
        <input
          v-model="formData.url"
          type="url"
          placeholder="https://api.example.com"
          class="input input-bordered w-full bg-base-100 border-base-content/10 placeholder:text-base-content/40 focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      <div class="space-y-1.5">
        <p class="text-sm font-medium text-base-content">Access Token</p>
        <input
          v-model="formData.token"
          type="password"
          :placeholder="isEditing ? 'Leave blank to keep existing' : 'Enter your access token'"
          class="input input-bordered w-full bg-base-100 border-base-content/10 placeholder:text-base-content/40 focus:border-primary focus:outline-none transition-colors"
        />
        <p v-if="isEditing" class="text-xs text-warning flex items-center gap-1.5 mt-1">
          <AlertCircle class="h-3.5 w-3.5" />
          Token is encrypted and stored securely
        </p>
      </div>

      <div class="space-y-1.5">
        <div class="flex items-baseline justify-between">
          <p class="text-sm font-medium text-base-content">Custom Schema Path</p>
          <span class="text-xs text-base-content/50">Optional</span>
        </div>
        <div class="flex gap-2">
          <input
            v-model="formData.customSchemaPath"
            type="text"
            readonly
            placeholder="Use default folder"
            class="input input-bordered w-full bg-base-200 border-base-content/10 placeholder:text-base-content/40 focus:border-primary focus:outline-none transition-colors cursor-pointer"
            @click="browseSchemaFolder"
          />
          <button
            type="button"
            class="btn btn-ghost btn-square border-base-content/10"
            @click="browseSchemaFolder"
            title="Browse for folder"
          >
            <FolderOpen class="h-5 w-5" />
          </button>
          <button
            v-if="formData.customSchemaPath"
            type="button"
            class="btn btn-ghost btn-square text-error"
            @click="clearSchemaFolder"
            title="Clear custom path"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        <p class="text-xs text-base-content/50">
          Leave empty to use the default location in app data
        </p>
      </div>

      <div class="space-y-1.5">
        <div class="flex items-baseline justify-between">
          <p class="text-sm font-medium text-base-content">Custom Types Path</p>
          <span class="text-xs text-base-content/50">Optional</span>
        </div>
        <div class="flex gap-2">
          <input
            v-model="formData.customTypesPath"
            type="text"
            readonly
            placeholder="Use default folder"
            class="input input-bordered w-full bg-base-200 border-base-content/10 placeholder:text-base-content/40 focus:border-primary focus:outline-none transition-colors cursor-pointer"
            @click="browseTypesFolder"
          />
          <button
            type="button"
            class="btn btn-ghost btn-square border-base-content/10"
            @click="browseTypesFolder"
            title="Browse for folder"
          >
            <FolderOpen class="h-5 w-5" />
          </button>
          <button
            v-if="formData.customTypesPath"
            type="button"
            class="btn btn-ghost btn-square text-error"
            @click="clearTypesFolder"
            title="Clear custom path"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        <p class="text-xs text-base-content/50">
          Where to save generated TypeScript types (directus-types.d.ts)
        </p>
      </div>
    </div>

    <template #footer>
      <AppButton variant="ghost" @click="emit('close')">Cancel</AppButton>
      <AppButton 
        variant="primary" 
        @click="save"
        :label="isEditing ? 'Save Changes' : 'Add Instance'"
      />
    </template>
  </AppModal>
</template>
