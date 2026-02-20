<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Instance, ParsedEndpoint, ApiResponse } from '../vite-env'
import { Loader2, AlertCircle, RotateCw } from 'lucide-vue-next'
import EndpointList from './EndpointList.vue'
import RequestPanel from './RequestPanel.vue'
import ResponseViewer from './ResponseViewer.vue'

const props = defineProps<{
  instance: Instance
}>()

const endpoints = ref<ParsedEndpoint[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const selectedEndpoint = ref<ParsedEndpoint | null>(null)
const requestLoading = ref(false)
const requestError = ref<string | null>(null)
const response = ref<ApiResponse | null>(null)

onMounted(() => {
  fetchSpec()
})

async function fetchSpec() {
  loading.value = true
  error.value = null
  try {
    const spec = await window.ipcRenderer.fetchOpenApiSpec(props.instance.id)
    endpoints.value = parseSpec(spec)
  } catch (e: any) {
    error.value = e.message || 'Failed to fetch OpenAPI spec'
  } finally {
    loading.value = false
  }
}

function parseSpec(rawSpec: any): ParsedEndpoint[] {
  const results: ParsedEndpoint[] = []
  const paths = rawSpec.paths || {}

  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(methods as Record<string, any>)) {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        results.push({
          path,
          method: method as ParsedEndpoint['method'],
          summary: operation.summary || path,
          description: operation.description,
          tags: operation.tags || ['Other'],
          operationId: operation.operationId,
          parameters: operation.parameters || [],
          requestBody: operation.requestBody,
        })
      }
    }
  }

  return results
}

function handleSelectEndpoint(ep: ParsedEndpoint) {
  selectedEndpoint.value = ep
  response.value = null
  requestError.value = null
}

async function handleSend(params: { method: string; path: string; queryParams: Record<string, string>; body?: any }) {
  requestLoading.value = true
  requestError.value = null
  response.value = null

  try {
    response.value = await window.ipcRenderer.apiRequest(
      props.instance.id,
      params.method,
      params.path,
      params.queryParams,
      params.body
    )
  } catch (e: any) {
    requestError.value = e.message || 'Request failed'
  } finally {
    requestLoading.value = false
  }
}
</script>

<template>
  <!-- Loading state -->
  <div v-if="loading" class="flex-1 flex flex-col items-center justify-center gap-3">
    <Loader2 class="h-8 w-8 animate-spin text-primary" />
    <p class="text-sm text-base-content/50">Loading API specification...</p>
  </div>

  <!-- Error state -->
  <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center gap-3 p-6">
    <AlertCircle class="h-10 w-10 text-error" />
    <p class="text-sm text-error text-center max-w-md">{{ error }}</p>
    <button class="btn btn-sm btn-ghost gap-1" @click="fetchSpec">
      <RotateCw class="h-4 w-4" />
      Retry
    </button>
  </div>

  <!-- Main layout -->
  <div v-else class="flex h-full">
    <!-- Left sidebar -->
    <div class="w-72 flex-shrink-0">
      <EndpointList
        :endpoints="endpoints"
        :selected-endpoint="selectedEndpoint"
        @select="handleSelectEndpoint"
      />
    </div>

    <!-- Right panel -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Request panel (top) -->
      <div class="border-b border-base-content/10 flex-shrink-0">
        <RequestPanel
          :endpoint="selectedEndpoint"
          :instance-url="instance.url"
          :loading="requestLoading"
          @send="handleSend"
        />
      </div>

      <!-- Response viewer (bottom) -->
      <div class="flex-1 overflow-hidden">
        <ResponseViewer
          :response="response"
          :loading="requestLoading"
          :error="requestError"
        />
      </div>
    </div>
  </div>
</template>
