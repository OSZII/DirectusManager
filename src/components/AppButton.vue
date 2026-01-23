<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label?: string
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'ghost' | 'link' | 'danger' | 'default'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: any
  iconPosition?: 'left' | 'right'
  type?: 'button' | 'submit' | 'reset'
}>()

const variantClass = computed(() => {
  if (!props.variant || props.variant === 'default') return ''
  if (props.variant === 'danger') return 'btn-error' // DaisyUI uses btn-error for danger
  return `btn-${props.variant}`
})

const sizeClass = computed(() => {
  if (!props.size) return ''
  return `btn-${props.size}`
})
</script>

<template>
  <button
    :type="type || 'button'"
    class="btn transition-all duration-200 gap-2 flex items-center justify-center"
    :class="[variantClass, sizeClass]"
    :disabled="disabled || loading"
  >
    <!-- Spinner (Small) -->
    <!-- <span v-if="loading && !icon" class="loading loading-spinner loading-xs"></span> -->

    <!-- Left Icon Slot / Prop -->
    <slot name="icon">
      <component :is="icon" v-if="icon && iconPosition !== 'right'" class="w-4 h-4" />
    </slot>

    <!-- Content -->
    <span v-if="label || $slots.default" :class="{ 'opacity-70': loading }">
      <slot>{{ label }}</slot>
    </span>

    <!-- Right Icon Slot / Prop -->
    <slot name="icon-right">
      <component :is="icon" v-if="icon && iconPosition === 'right'" class="w-4 h-4" />
    </slot>
  </button>
</template>
