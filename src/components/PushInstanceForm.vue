<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Instance } from '../vite-env'
import { ArrowRight, Search, Upload } from 'lucide-vue-next'
import AppButton from './AppButton.vue'

const props = defineProps<{
  show: boolean
  targetInstance: Instance | null
  instances: Instance[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', sourceId: string, targetId: string): void
}>()

const searchQuery = ref('')
const selectedInstanceId = ref<string | null>(null)
const isPushing = ref(false)

// Filter out the target instance from available sources and apply search
const availableInstances = computed(() => {
  return props.instances
    .filter(inst => inst.id !== props.targetInstance?.id)
    .filter(inst => 
      inst.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      inst.url.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

const selectedInstance = computed(() => 
  props.instances.find(inst => inst.id === selectedInstanceId.value)
)

// Reset form when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    searchQuery.value = ''
    selectedInstanceId.value = null
    isPushing.value = false
  }
})

async function handleConfirm() {
  if (!selectedInstanceId.value || !props.targetInstance) return
  isPushing.value = true
  emit('confirm', selectedInstanceId.value, props.targetInstance.id)
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')"></div>
        
        <!-- Modal -->
        <div class="relative z-10 bg-base-100 rounded-2xl shadow-2xl border border-base-content/10 overflow-hidden w-250 max-h-[90vh] overflow-y-auto" data-theme="night">
          <!-- Header -->
          <div class="px-8 pt-8 pb-6 border-b border-base-content/10 bg-linear-to-r from-primary/10 to-secondary/10">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Upload class="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 class="font-bold text-xl">Push Configuration</h3>
                <p class="text-sm text-base-content/60">Select source instance to push to target</p>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-8">
            <div class="flex items-stretch gap-8">
              <!-- Left: Source Selection -->
              <div class="flex-1 min-w-0">
                <label class="label pb-2">
                  <span class="label-text font-semibold text-base">Source Instance</span>
                </label>
                
                <!-- Search Input -->
                <div class="relative mb-3">
                  <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/40" />
                  <input 
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search instances..."
                    class="input input-bordered w-full pl-12"
                  />
                </div>
                
                <!-- Instance Dropdown/Select -->
                <select 
                  v-model="selectedInstanceId"
                  class="select select-bordered w-full select-lg"
                >
                  <option :value="null" disabled>Select an instance</option>
                  <option 
                    v-for="inst in availableInstances" 
                    :key="inst.id" 
                    :value="inst.id"
                  >
                    {{ inst.name }}
                  </option>
                </select>
                
                <!-- Selected Instance Info -->
                <div v-if="selectedInstance" class="mt-4 p-4 bg-base-200 rounded-xl border border-base-content/5">
                  <p class="font-semibold text-base">{{ selectedInstance.name }}</p>
                  <p class="text-sm text-base-content/60 truncate mt-1">{{ selectedInstance.url }}</p>
                </div>
                <div v-else class="mt-4 p-4 bg-base-200/50 rounded-xl border border-dashed border-base-content/10 text-center">
                  <p class="text-sm text-base-content/40">Select an instance above</p>
                </div>
              </div>

              <!-- Middle: Arrow -->
              <div class="shrink-0 flex flex-col items-center justify-center px-4">
                <div class="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <ArrowRight class="h-8 w-8 text-primary" />
                </div>
              </div>

              <!-- Right: Target Instance -->
              <div class="flex-1 min-w-0">
                <label class="label pb-2">
                  <span class="label-text font-semibold text-base">Target Instance</span>
                </label>
                <div class="p-6 bg-base-200 rounded-xl border border-base-content/10 h-[calc(100%-2.5rem)]">
                  <p class="font-bold text-xl">{{ targetInstance?.name || 'N/A' }}</p>
                  <p class="text-base text-base-content/60 truncate mt-2">{{ targetInstance?.url || '' }}</p>
                </div>
              </div>
            </div>

            <!-- Warning Message -->
            <div class="alert alert-warning mt-8">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>This will overwrite the target instance's configuration with data from the source.</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-8 py-5 bg-base-200/50 border-t border-base-content/10 flex justify-end gap-4">
            <AppButton variant="ghost" @click="emit('close')" :disabled="isPushing">Cancel</AppButton>
            <AppButton 
              variant="primary" 
              @click="handleConfirm"
              :disabled="!selectedInstanceId || isPushing"
              :loading="isPushing"
              :label="isPushing ? 'Pushing...' : 'Confirm Push'"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

