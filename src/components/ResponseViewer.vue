<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ApiResponse } from '../vite-env'
import { Copy, Check, Filter, AlertCircle, Loader2 } from 'lucide-vue-next'
import JsonTree from './JsonTree.vue'
import jq from '@michaelhomer/jqjs'

const props = defineProps<{
  response: ApiResponse | null
  loading: boolean
  error: string | null
}>()

const filterInput = ref('')
const filterError = ref('')
const filteredData = ref<any>(null)
const isFiltering = ref(false)
const copied = ref(false)

const isJqMode = computed(() => filterInput.value.trimStart().startsWith('.'))

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
  filterInput.value = ''
  filterError.value = ''
})

// --- Text search: find all keys/values matching the query ---
function textSearch(data: any, query: string): any {
  const q = query.toLowerCase()

  function matches(value: any): boolean {
    if (value === null || value === undefined) return false
    return String(value).toLowerCase().includes(q)
  }

  function search(obj: any): any {
    if (obj === null || obj === undefined) return undefined
    if (Array.isArray(obj)) {
      const results = obj
        .map(item => search(item))
        .filter(item => item !== undefined)
      return results.length > 0 ? results : undefined
    }
    if (typeof obj === 'object') {
      const result: Record<string, any> = {}
      let hasMatch = false
      for (const [key, value] of Object.entries(obj)) {
        if (matches(key)) {
          result[key] = value
          hasMatch = true
        } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          if (matches(value)) {
            result[key] = value
            hasMatch = true
          }
        } else {
          const nested = search(value)
          if (nested !== undefined) {
            result[key] = nested
            hasMatch = true
          }
        }
      }
      return hasMatch ? result : undefined
    }
    // Primitive
    return matches(obj) ? obj : undefined
  }

  const result = search(data)
  return result !== undefined ? result : null
}

function applyFilter() {
  const raw = filterInput.value.trim()
  if (!props.response || !raw) {
    filteredData.value = null
    filterError.value = ''
    return
  }

  isFiltering.value = true
  filterError.value = ''

  try {
    if (isJqMode.value) {
      if (raw === '.') {
        filteredData.value = null
      } else {
        // Use jqjs: compile the filter and collect all output values
        const results = [...jq(raw, props.response.body)]
        filteredData.value = results.length === 1 ? results[0] : results
      }
    } else {
      const result = textSearch(props.response.body, raw)
      if (result === null) {
        filterError.value = `No matches for "${raw}"`
        filteredData.value = null
      } else {
        filteredData.value = result
      }
    }
  } catch (e: any) {
    filterError.value = e.message || 'Invalid jq filter'
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

      <!-- Filter bar -->
      <div class="flex items-center gap-2 px-4 py-2 border-b border-base-content/10 shrink-0">
        <Filter v-if="isJqMode" class="h-4 w-4 text-base-content/40 shrink-0" title="jq path mode" />
        <AlertCircle v-else-if="filterInput.trim()" class="h-4 w-4 text-info/60 shrink-0" title="Text search mode" />
        <Filter v-else class="h-4 w-4 text-base-content/40 shrink-0" />
        <input
          v-model="filterInput"
          type="text"
          :placeholder="isJqMode ? 'jq path (e.g. .data[0].name)' : 'Search keys & values, or start with . for jq path'"
          class="input input-xs flex-1 bg-base-200 border-base-content/10 font-mono text-sm"
          @keydown="handleFilterKeydown"
        />
        <span class="text-xs text-base-content/30 shrink-0">{{ isJqMode ? 'jq' : 'search' }}</span>
        <button
          class="btn btn-ghost btn-xs"
          :disabled="isFiltering"
          @click="applyFilter"
        >
          <Loader2 v-if="isFiltering" class="h-3 w-3 animate-spin" />
          <span v-else>Apply</span>
        </button>
      </div>
      <p v-if="filterError" class="text-xs text-error px-4 py-1 bg-error/5">{{ filterError }}</p>

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
