<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Instance } from '../vite-env'
import { Globe, AlertCircle } from 'lucide-vue-next'
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
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay">
        <!-- Backdrop -->
        <div class="modal-backdrop" @click="emit('close')"></div>
        
        <!-- Modal -->
        <div class="modal-content bg-base-100 rounded-2xl shadow-2xl border border-base-content/10 overflow-hidden" data-theme="night">
          <!-- Header -->
          <div class="px-6 pt-6 pb-4 border-b border-base-content/10 bg-gradient-to-r from-primary/10 to-secondary/10">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Globe class="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 class="font-bold text-lg">{{ isEditing ? 'Edit Instance' : 'Add New Instance' }}</h3>
                <p class="text-sm text-base-content/60">{{ isEditing ? 'Update your instance configuration' : 'Connect to a Directus instance' }}</p>
              </div>
            </div>
          </div>

          <!-- Form -->
          <div class="p-6 space-y-4">
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

          <!-- Footer -->
          <div class="px-6 py-4 bg-base-200/50 border-t border-base-content/10 flex justify-end gap-3">
            <AppButton variant="ghost" @click="emit('close')">Cancel</AppButton>
            <AppButton 
              variant="primary" 
              @click="save"
              :label="isEditing ? 'Save Changes' : 'Add Instance'"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div:last-child,
.modal-leave-active > div:last-child {
  transition: transform 0.2s ease-out, opacity 0.2s ease-out;
}

.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: scale(0.95);
  opacity: 0;
}
</style>
