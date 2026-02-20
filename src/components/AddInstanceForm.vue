<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Instance } from '../vite-env'
import { Globe, AlertCircle, FolderOpen, X, ChevronRight, Plus } from 'lucide-vue-next'
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

const defaultFormData = (): Partial<Instance> => ({
  name: '',
  url: '',
  token: '',
  customSchemaPath: '',
  customTypesPath: '',
  additionalSchemaPaths: [],
  additionalTypesPaths: []
})

const formData = ref<Partial<Instance>>(defaultFormData())

const showAdditionalSchemaPaths = ref(false)
const showAdditionalTypesPaths = ref(false)

watch(() => props.editingInstance, (newVal) => {
  if (newVal) {
    formData.value = {
      ...newVal,
      additionalSchemaPaths: newVal.additionalSchemaPaths ? [...newVal.additionalSchemaPaths] : [],
      additionalTypesPaths: newVal.additionalTypesPaths ? [...newVal.additionalTypesPaths] : []
    }
    showAdditionalSchemaPaths.value = (newVal.additionalSchemaPaths?.length ?? 0) > 0
    showAdditionalTypesPaths.value = (newVal.additionalTypesPaths?.length ?? 0) > 0
  } else {
    formData.value = defaultFormData()
    showAdditionalSchemaPaths.value = false
    showAdditionalTypesPaths.value = false
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

async function addAdditionalSchemaPath() {
  const selectedPath = await window.ipcRenderer.selectSchemaFolder()
  if (!selectedPath) return
  if (!formData.value.additionalSchemaPaths) formData.value.additionalSchemaPaths = []
  if (selectedPath === formData.value.customSchemaPath || formData.value.additionalSchemaPaths.includes(selectedPath)) return
  formData.value.additionalSchemaPaths.push(selectedPath)
}

function removeAdditionalSchemaPath(index: number) {
  formData.value.additionalSchemaPaths?.splice(index, 1)
}

async function addAdditionalTypesPath() {
  const selectedPath = await window.ipcRenderer.selectTypesFolder()
  if (!selectedPath) return
  if (!formData.value.additionalTypesPaths) formData.value.additionalTypesPaths = []
  if (selectedPath === formData.value.customTypesPath || formData.value.additionalTypesPaths.includes(selectedPath)) return
  formData.value.additionalTypesPaths.push(selectedPath)
}

function removeAdditionalTypesPath(index: number) {
  formData.value.additionalTypesPaths?.splice(index, 1)
}

function save() {
  const data = { ...formData.value }
  // Convert reactive arrays to plain arrays for IPC serialization
  if (data.additionalSchemaPaths?.length) {
    data.additionalSchemaPaths = [...data.additionalSchemaPaths]
  } else {
    delete data.additionalSchemaPaths
  }
  if (data.additionalTypesPaths?.length) {
    data.additionalTypesPaths = [...data.additionalTypesPaths]
  } else {
    delete data.additionalTypesPaths
  }
  emit('save', data)
  formData.value = defaultFormData()
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

        <!-- Additional Schema Folders (collapsible) -->
        <div class="pt-1">
          <button
            type="button"
            class="flex items-center gap-2 text-sm font-medium text-base-content/70 hover:text-base-content transition-colors"
            @click="showAdditionalSchemaPaths = !showAdditionalSchemaPaths"
          >
            <ChevronRight
              class="h-3.5 w-3.5 transition-transform"
              :class="{ 'rotate-90': showAdditionalSchemaPaths }"
            />
            Additional Schema Folders
            <span v-if="formData.additionalSchemaPaths?.length" class="badge badge-sm badge-primary">
              {{ formData.additionalSchemaPaths.length }}
            </span>
          </button>

          <div v-show="showAdditionalSchemaPaths" class="pl-5 pt-2 space-y-2">
            <p class="text-xs text-base-content/50">
              Schema output will be copied to these folders after each pull
            </p>

            <div
              v-for="(folderPath, index) in formData.additionalSchemaPaths"
              :key="index"
              class="flex gap-2 items-center"
            >
              <input
                :value="folderPath"
                type="text"
                readonly
                class="input input-bordered input-sm w-full bg-base-200 border-base-content/10 cursor-default"
              />
              <button
                type="button"
                class="btn btn-ghost btn-square btn-sm text-error"
                @click="removeAdditionalSchemaPath(index)"
                title="Remove this folder"
              >
                <X class="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              class="btn btn-ghost btn-sm border border-dashed border-base-content/20 w-full"
              @click="addAdditionalSchemaPath"
            >
              <Plus class="h-4 w-4" />
              Add Folder
            </button>
          </div>
        </div>
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

        <!-- Additional Types Folders (collapsible) -->
        <div class="pt-1">
          <button
            type="button"
            class="flex items-center gap-2 text-sm font-medium text-base-content/70 hover:text-base-content transition-colors"
            @click="showAdditionalTypesPaths = !showAdditionalTypesPaths"
          >
            <ChevronRight
              class="h-3.5 w-3.5 transition-transform"
              :class="{ 'rotate-90': showAdditionalTypesPaths }"
            />
            Additional Types Folders
            <span v-if="formData.additionalTypesPaths?.length" class="badge badge-sm badge-primary">
              {{ formData.additionalTypesPaths.length }}
            </span>
          </button>

          <div v-show="showAdditionalTypesPaths" class="pl-5 pt-2 space-y-2">
            <p class="text-xs text-base-content/50">
              Types file will be copied to these folders after each generation
            </p>

            <div
              v-for="(folderPath, index) in formData.additionalTypesPaths"
              :key="index"
              class="flex gap-2 items-center"
            >
              <input
                :value="folderPath"
                type="text"
                readonly
                class="input input-bordered input-sm w-full bg-base-200 border-base-content/10 cursor-default"
              />
              <button
                type="button"
                class="btn btn-ghost btn-square btn-sm text-error"
                @click="removeAdditionalTypesPath(index)"
                title="Remove this folder"
              >
                <X class="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              class="btn btn-ghost btn-sm border border-dashed border-base-content/20 w-full"
              @click="addAdditionalTypesPath"
            >
              <Plus class="h-4 w-4" />
              Add Folder
            </button>
          </div>
        </div>
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
