<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Instance } from '../vite-env'
import { Globe, AlertCircle } from 'lucide-vue-next'
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
  token: ''
})

watch(() => props.editingInstance, (newVal) => {
  if (newVal) {
    formData.value = { ...newVal }
  } else {
    formData.value = { name: '', url: '', token: '' }
  }
}, { immediate: true })

const isEditing = computed(() => !!props.editingInstance)

function save() {
  emit('save', { ...formData.value })
  formData.value = { name: '', url: '', token: '' }
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

    <div class="space-y-4">
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text font-medium">Instance Name</span>
        </label>
        <input 
          v-model="formData.name" 
          type="text" 
          placeholder="My Project" 
          class="input placeholder:text-gray-500 input-bordered w-full focus:input-primary transition-colors" 
        />
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text font-medium">Directus URL</span>
        </label>
        <input 
          v-model="formData.url" 
          type="url" 
          placeholder="https://api.example.com" 
          class="input placeholder:text-gray-500 input-bordered w-full focus:input-primary transition-colors" 
        />
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text font-medium">Access Token</span>
        </label>
        <input 
          v-model="formData.token" 
          type="password" 
          :placeholder="isEditing ? 'Leave blank to keep existing' : 'Enter your access token'" 
          class="input placeholder:text-gray-500 input-bordered w-full focus:input-primary transition-colors" 
        />
        <label class="label" v-if="isEditing">
          <span class="label-text-alt text-warning flex items-center gap-1 mt-2">
            <AlertCircle class="h-3.5 w-3.5" />
            Token is encrypted and stored securely
          </span>
        </label>
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
