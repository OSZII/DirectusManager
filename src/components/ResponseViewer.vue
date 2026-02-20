<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ApiResponse } from '../vite-env'
import { Copy, Check, Filter, AlertCircle, Loader2 } from 'lucide-vue-next'
import JsonTree from './JsonTree.vue'

const props = defineProps<{
  response: ApiResponse | null
  loading: boolean
  error: string | null
}>()

const jqFilter = ref('.')
const jqError = ref('')
const filteredData = ref<any>(null)
const isFiltering = ref(false)
const copied = ref(false)
const jqAvailable = ref(true)
let jqInstance: any = null

// Lazy-load and initialize jq-web
async function getJq() {
  if (jqInstance) return jqInstance
  try {
    const jqFactory = await import('jq-web')
    // jq-web exports a promise that resolves to the jq object
    jqInstance = await (jqFactory.default || jqFactory)
    return jqInstance
  } catch (e) {
    console.error('Failed to load jq-web:', e)
    jqAvailable.value = false
    return null
  }
}

const statusColor = computed(() => {
  if (!props.response) return ''
  const s = props.response.status
  if (s >= 200 && s < 300) return 'text-success'
  if (s >= 300 && s < 400) return 'text-info'
  if (s >= 400 && s < 500) return 'text-warning'
  return 'text-error'
})

const responseSize = computed(() => {
  if (!props.response) return ''
  const str = JSON.stringify(props.response.body)
  const bytes = new Blob([str]).size
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
})

const displayData = computed(() => {
  if (filteredData.value !== null) return filteredData.value
  return props.response?.body ?? null
})

// Reset filter when response changes
watch(() => props.response, () => {
  filteredData.value = null
  jqFilter.value = '.'
  jqError.value = ''
})

async function applyFilter() {
  if (!props.response || jqFilter.value.trim() === '.' || !jqFilter.value.trim()) {
    filteredData.value = null
    jqError.value = ''
    return
  }

  isFiltering.value = true
  jqError.value = ''

  try {
    const jq = await getJq()
    if (!jq) {
      jqError.value = 'jq-web is not available'
      return
    }

    // jq-web: jq.json(data, filter) takes JS object and returns JS object
    const result = jq.json(props.response.body, jqFilter.value)
    filteredData.value = result
  } catch (e: any) {
    jqError.value = e.message || 'Invalid jq filter'
    filteredData.value = null
  } finally {
    isFiltering.value = false
  }
}

async function copyToClipboard() {
  const data = displayData.value
  if (data === null) return
  try {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (e) {
    console.error('Failed to copy:', e)
  }
}

function handleFilterKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') applyFilter()
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex items-center justify-center gap-2 text-base-content/40">
      <Loader2 class="h-5 w-5 animate-spin" />
      <span class="text-sm">Sending request...</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center gap-2 text-error p-6">
      <AlertCircle class="h-8 w-8" />
      <p class="text-sm text-center">{{ error }}</p>
    </div>

    <!-- Response -->
    <template v-else-if="response">
      <!-- Status bar -->
      <div class="flex items-center gap-3 px-4 py-2 border-b border-base-content/10 bg-base-100/50 shrink-0">
        <span class="font-bold text-sm" :class="statusColor">
          {{ response.status }} {{ response.statusText }}
        </span>
        <span class="text-xs text-base-content/40">{{ response.elapsed }}ms</span>
        <span class="text-xs text-base-content/40">{{ responseSize }}</span>
        <div class="flex-1" />
        <button class="btn btn-ghost btn-xs gap-1" @click="copyToClipboard">
          <Check v-if="copied" class="h-3 w-3 text-success" />
          <Copy v-else class="h-3 w-3" />
          {{ copied ? 'Copied' : 'Copy' }}
        </button>
      </div>

      <!-- jq filter -->
      <div class="flex items-center gap-2 px-4 py-2 border-b border-base-content/10 shrink-0">
        <Filter class="h-4 w-4 text-base-content/40 shrink-0" />
        <input
          v-model="jqFilter"
          type="text"
          placeholder="jq filter (e.g. .data[0] | keys)"
          class="input input-xs flex-1 bg-base-200 border-base-content/10 font-mono text-sm"
          :disabled="!jqAvailable"
          :title="!jqAvailable ? 'jq-web failed to load' : ''"
          @keydown="handleFilterKeydown"
        />
        <button
          class="btn btn-ghost btn-xs"
          :disabled="isFiltering || !jqAvailable"
          @click="applyFilter"
        >
          <Loader2 v-if="isFiltering" class="h-3 w-3 animate-spin" />
          <span v-else>Apply</span>
        </button>
      </div>
      <p v-if="jqError" class="text-xs text-error px-4 py-1 bg-error/5">{{ jqError }}</p>

      <!-- JSON body -->
      <div class="flex-1 overflow-auto p-4">
        <JsonTree v-if="displayData !== null && typeof displayData === 'object'" :data="displayData" />
        <pre v-else-if="displayData !== null" class="font-mono text-sm text-base-content/80 whitespace-pre-wrap">{{ typeof displayData === 'string' ? displayData : JSON.stringify(displayData, null, 2) }}</pre>
      </div>
    </template>

    <!-- Empty state -->
    <div v-else class="flex-1 flex items-center justify-center text-base-content/30 text-sm">
      Send a request to see the response
    </div>
  </div>
</template>
