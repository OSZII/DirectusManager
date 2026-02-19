<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Instance } from '../vite-env'
import { ArrowRight, Search, Upload, AlertTriangle } from 'lucide-vue-next'
import AppModal from './AppModal.vue'
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

// Filter out the target instance from available sources and apply search
const availableInstances = computed(() => {
  return props.instances
    // .filter(inst => inst.id !== props.targetInstance?.id)
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
  }
})

function handleConfirm() {
  if (!selectedInstanceId.value || !props.targetInstance) return
  emit('confirm', selectedInstanceId.value, props.targetInstance.id)
}
</script>

<template>
  <AppModal
    :show="show"
    title="Push Configuration"
    subtitle="Select source instance to push to target"
    width="xl"
    @close="emit('close')"
  >
    <template #icon>
      <Upload class="h-5 w-5 text-primary" />
    </template>

    <div class="flex items-stretch gap-6">
      <!-- Left: Source Selection -->
      <div class="flex-1 min-w-0 space-y-3">
        <p class="font-semibold text-base text-base-content">Source Instance</p>

        <!-- Search Input -->
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search instances..."
            class="input input-bordered w-full pl-10 bg-base-100 border-base-content/10 focus:border-primary focus:outline-none"
          />
        </div>

        <!-- Instance Dropdown/Select -->
        <select
          v-model="selectedInstanceId"
          class="select select-bordered w-full bg-base-100 border-base-content/10 focus:border-primary focus:outline-none"
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
        <div v-if="selectedInstance" class="p-4 bg-base-100 rounded-xl border border-primary/20">
          <p class="font-semibold">{{ selectedInstance.name }}</p>
          <p class="text-sm text-base-content/60 truncate mt-1">{{ selectedInstance.url }}</p>
        </div>
        <div v-else class="p-4 bg-base-200/50 rounded-xl border border-dashed border-base-content/10 text-center">
          <p class="text-sm text-base-content/40">Select an instance above</p>
        </div>
      </div>

      <!-- Middle: Arrow -->
      <div class="shrink-0 flex flex-col items-center justify-center">
        <div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <ArrowRight class="h-6 w-6 text-primary" />
        </div>
      </div>

      <!-- Right: Target Instance -->
      <div class="flex-1 min-w-0 space-y-3">
        <p class="font-semibold text-base text-base-content">Target Instance</p>
        <div class="p-5 bg-base-100 rounded-xl border border-base-content/10 flex flex-col justify-center min-h-[8rem]">
          <p class="font-bold text-lg">{{ targetInstance?.name || 'N/A' }}</p>
          <p class="text-sm text-base-content/60 truncate mt-1">{{ targetInstance?.url || '' }}</p>
        </div>
      </div>
    </div>

    <!-- Warning Message -->
    <div class="mt-6 p-4 rounded-xl bg-warning/10 border border-warning/20 flex items-center gap-3">
      <AlertTriangle class="h-5 w-5 text-warning shrink-0" />
      <span class="text-sm text-base-content/80">This will overwrite the target instance's configuration with data from the source.</span>
    </div>

    <template #footer>
      <AppButton variant="ghost" @click="emit('close')">Cancel</AppButton>
      <AppButton 
        variant="primary" 
        @click="handleConfirm"
        :disabled="!selectedInstanceId"
        label="Confirm Push"
      />
    </template>
  </AppModal>
</template>
