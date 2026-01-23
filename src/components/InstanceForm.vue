<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Instance } from '../vite-env'

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
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
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
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Token is encrypted and stored securely
                </span>
              </label>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 bg-base-200/50 border-t border-base-content/10 flex justify-end gap-3">
            <button class="btn btn-ghost" @click="emit('close')">Cancel</button>
            <button class="btn btn-primary shadow-lg shadow-primary/20" @click="save">
              {{ isEditing ? 'Save Changes' : 'Add Instance' }}
            </button>
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
