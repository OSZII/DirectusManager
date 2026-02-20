<script setup lang="ts">
import { computed, ref } from 'vue'
import { ParsedEndpoint } from '../vite-env'
import { Search, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  endpoints: ParsedEndpoint[]
  selectedEndpoint: ParsedEndpoint | null
}>()

const emit = defineEmits<{
  (e: 'select', endpoint: ParsedEndpoint): void
}>()

const searchQuery = ref('')
const collapsedTags = ref<Set<string>>(new Set())

const METHOD_COLORS: Record<string, string> = {
  get: 'bg-success/20 text-success border-success/30',
  post: 'bg-info/20 text-info border-info/30',
  put: 'bg-warning/20 text-warning border-warning/30',
  patch: 'bg-accent/20 text-accent border-accent/30',
  delete: 'bg-error/20 text-error border-error/30',
}

const filteredEndpoints = computed(() => {
  if (!searchQuery.value) return props.endpoints
  const q = searchQuery.value.toLowerCase()
  return props.endpoints.filter(ep =>
    ep.path.toLowerCase().includes(q) ||
    ep.summary.toLowerCase().includes(q) ||
    (ep.operationId && ep.operationId.toLowerCase().includes(q))
  )
})

const groupedByTag = computed(() => {
  const groups: Record<string, ParsedEndpoint[]> = {}
  for (const ep of filteredEndpoints.value) {
    const tag = ep.tags[0] || 'Other'
    if (!groups[tag]) groups[tag] = []
    groups[tag].push(ep)
  }
  // Sort tags alphabetically
  return Object.fromEntries(
    Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  )
})

function toggleTag(tag: string) {
  if (collapsedTags.value.has(tag)) {
    collapsedTags.value.delete(tag)
  } else {
    collapsedTags.value.add(tag)
  }
}

function isSelected(ep: ParsedEndpoint): boolean {
  return props.selectedEndpoint?.path === ep.path && props.selectedEndpoint?.method === ep.method
}
</script>

<template>
  <div class="h-full flex flex-col bg-base-100/95 backdrop-blur-lg border-r border-base-content/10">
    <!-- Search -->
    <div class="p-3 border-b border-base-content/10">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search endpoints..."
          class="input input-sm w-full pl-9 bg-base-200 border-base-content/10 focus:border-primary"
        />
      </div>
      <div class="text-xs text-base-content/40 mt-2 px-1">
        {{ filteredEndpoints.length }} endpoints
      </div>
    </div>

    <!-- Endpoint groups -->
    <div class="flex-1 overflow-y-auto">
      <div v-for="(endpoints, tag) in groupedByTag" :key="tag" class="border-b border-base-content/5">
        <!-- Tag header -->
        <button
          class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-base-content/60 uppercase tracking-wider hover:bg-base-content/5 transition-colors"
          @click="toggleTag(tag as string)"
        >
          <ChevronRight
            class="h-3 w-3 transition-transform"
            :class="{ 'rotate-90': !collapsedTags.has(tag as string) }"
          />
          {{ tag }}
          <span class="text-base-content/30 font-normal">{{ endpoints.length }}</span>
        </button>

        <!-- Endpoints under tag -->
        <div v-show="!collapsedTags.has(tag as string)">
          <button
            v-for="ep in endpoints"
            :key="`${ep.method}-${ep.path}`"
            class="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-base-content/5 transition-colors"
            :class="{ 'bg-primary/10 border-r-2 border-primary': isSelected(ep) }"
            @click="emit('select', ep)"
          >
            <span
              class="text-[10px] font-bold uppercase w-14 text-center py-0.5 rounded border flex-shrink-0"
              :class="METHOD_COLORS[ep.method]"
            >
              {{ ep.method }}
            </span>
            <span class="text-xs font-mono text-base-content/70 truncate">{{ ep.path }}</span>
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredEndpoints.length === 0" class="p-6 text-center text-base-content/40 text-sm">
        No endpoints match your search
      </div>
    </div>
  </div>
</template>
