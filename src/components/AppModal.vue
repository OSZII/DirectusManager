<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  show: boolean
  title: string
  subtitle?: string
  width?: 'sm' | 'md' | 'lg' | 'xl'
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const widthClass = computed(() => {
  switch (props.width) {
    case 'sm': return 'w-96'
    case 'md': return 'w-[32rem]'
    case 'lg': return 'w-[48rem]'
    case 'xl': return 'w-[60rem]'
    default: return 'w-[32rem]'
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-9999 flex items-center justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-neutral/80 backdrop-blur-sm" @click="emit('close')"></div>
        
        <!-- Modal -->
        <div
          :class="[widthClass, 'relative z-10 rounded-2xl shadow-2xl border border-base-content/10 overflow-hidden max-h-[90vh] overflow-y-auto bg-gradient-to-br from-base-300 via-base-200 to-base-300']"
          data-theme="directus"
        >
          <!-- Header -->
          <div class="px-6 pt-6 pb-4 border-b border-base-content/10 bg-gradient-to-r from-primary/15 via-secondary/10 to-primary/5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <slot name="icon" />
              </div>
              <div>
                <h3 class="font-bold text-lg">{{ title }}</h3>
                <p v-if="subtitle" class="text-sm text-base-content/60">{{ subtitle }}</p>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6">
            <slot />
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 bg-base-300/50 border-t border-base-content/10 flex justify-end gap-3">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
