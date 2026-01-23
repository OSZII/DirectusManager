<script setup lang="ts">
import { ArrowUp } from 'lucide-vue-next'
import AppButton from './AppButton.vue'

defineProps<{
  loading?: boolean
  disabled?: boolean
}>()
</script>

<template>
  <AppButton
    variant="default"
    size="sm"
    :loading="loading"
    :disabled="disabled"
    class="bg-base-100 hover:bg-base-100/60 hover:shadow-md border-0 text-base-content"
  >
    <template #icon>
      <div class="relative overflow-hidden w-4 h-4">
        <ArrowUp
          class="h-4 w-4 transition-transform"
          :class="{ 'animate-push-up': loading }"
        />
      </div>
    </template>
    Push
  </AppButton>
</template>

<style scoped>
@keyframes push-up {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  49% {
    transform: translateY(-100%);
    opacity: 0;
  }
  50% {
    transform: translateY(100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-push-up {
  animation: push-up 0.8s infinite cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
