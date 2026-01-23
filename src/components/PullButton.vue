<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'
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
      <RefreshCw
        class="h-4 w-4"
        :class="{ 'animate-spin': loading }"
      />
    </template>
    {{ loading ? 'Pulling...' : 'Pull' }}
  </AppButton>
</template>
