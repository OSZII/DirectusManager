<script setup lang="ts">
import { ref, computed } from 'vue'
import { Copy, Check } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  data: any
  depth?: number
  propertyKey?: string
}>(), {
  depth: 0,
})

const expanded = ref(true)
const showAll = ref(false)
const copied = ref(false)

const PAGE_SIZE = 50

const dataType = computed(() => {
  if (props.data === null) return 'null'
  if (Array.isArray(props.data)) return 'array'
  return typeof props.data
})

const isExpandable = computed(() => dataType.value === 'object' || dataType.value === 'array')

const entries = computed(() => {
  if (dataType.value === 'object') return Object.entries(props.data)
  if (dataType.value === 'array') return props.data.map((v: any, i: number) => [String(i), v])
  return []
})

const visibleEntries = computed(() => {
  if (showAll.value || entries.value.length <= PAGE_SIZE) return entries.value
  return entries.value.slice(0, PAGE_SIZE)
})

const hiddenCount = computed(() => {
  if (showAll.value) return 0
  return Math.max(0, entries.value.length - PAGE_SIZE)
})

function toggle() {
  if (isExpandable.value) expanded.value = !expanded.value
}

function preview(): string {
  if (dataType.value === 'array') return `Array(${props.data.length})`
  if (dataType.value === 'object') {
    const keys = Object.keys(props.data)
    if (keys.length <= 3) return `{ ${keys.join(', ')} }`
    return `{ ${keys.slice(0, 3).join(', ')}, ... }`
  }
  return ''
}

async function copyValue(e: Event) {
  e.stopPropagation()
  try {
    const text = typeof props.data === 'string' ? props.data : JSON.stringify(props.data, null, 2)
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  } catch { /* ignore */ }
}
</script>

<template>
  <div class="font-mono text-sm" :style="{ paddingLeft: depth > 0 ? '1.25rem' : '0' }">
    <!-- Key + value on same line for primitives / collapsed -->
    <div class="group flex items-start gap-1 hover:bg-base-content/5 rounded px-1 -mx-1" :class="{ 'cursor-pointer': isExpandable }" @click="toggle">
      <!-- Expand arrow -->
      <span v-if="isExpandable" class="select-none text-base-content/40 w-4 shrink-0 text-center transition-transform" :class="{ 'rotate-90': expanded }">
        &#9656;
      </span>
      <span v-else class="w-4 shrink-0" />

      <!-- Property key -->
      <span v-if="propertyKey !== undefined" class="text-base-content/80">"{{ propertyKey }}"<span class="text-base-content/40">: </span></span>

      <!-- Value -->
      <template v-if="!isExpandable">
        <span v-if="dataType === 'string'" class="text-success break-all">"{{ data }}"</span>
        <span v-else-if="dataType === 'number'" class="text-info">{{ data }}</span>
        <span v-else-if="dataType === 'boolean'" class="text-secondary">{{ data }}</span>
        <span v-else-if="dataType === 'null'" class="text-base-content/40 italic">null</span>
        <span v-else class="text-base-content/60">{{ String(data) }}</span>
      </template>

      <!-- Collapsed preview -->
      <template v-if="isExpandable && !expanded">
        <span class="text-base-content/40">{{ preview() }}</span>
      </template>

      <!-- Opening bracket -->
      <template v-if="isExpandable && expanded">
        <span class="text-base-content/40">{{ dataType === 'array' ? '[' : '{' }}</span>
      </template>

      <!-- Copy button -->
      <button
        class="ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-base-content/10"
        title="Copy value"
        @click="copyValue"
      >
        <Check v-if="copied" class="h-3 w-3 text-success" />
        <Copy v-else class="h-3 w-3 text-base-content/40" />
      </button>
    </div>

    <!-- Expanded children -->
    <template v-if="isExpandable && expanded">
      <JsonTree
        v-for="[key, value] in visibleEntries"
        :key="key"
        :data="value"
        :property-key="dataType === 'object' ? key : undefined"
        :depth="depth + 1"
      />
      <div v-if="hiddenCount > 0" class="pl-5">
        <button class="text-xs text-primary hover:underline" @click.stop="showAll = true">
          ... {{ hiddenCount }} more items
        </button>
      </div>
      <!-- Closing brackets -->
      <div v-if="dataType === 'array'" class="pl-5 text-base-content/40 flex items-start gap-1 px-1">
        <span class="w-4 shrink-0" />]
      </div>
      <div v-else-if="dataType === 'object'" class="flex items-start gap-1 px-1">
        <span class="w-4 shrink-0" /><span class="text-base-content/40">}</span>
      </div>
    </template>
  </div>
</template>
