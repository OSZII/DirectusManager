<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ParsedEndpoint } from '../vite-env'
import { Play, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  endpoint: ParsedEndpoint | null
  instanceUrl: string
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'send', params: { method: string; path: string; queryParams: Record<string, string>; body?: any }): void
}>()

const METHOD_COLORS: Record<string, string> = {
  get: 'bg-success/20 text-success border-success/30',
  post: 'bg-info/20 text-info border-info/30',
  put: 'bg-warning/20 text-warning border-warning/30',
  patch: 'bg-accent/20 text-accent border-accent/30',
  delete: 'bg-error/20 text-error border-error/30',
}

const pathParams = ref<Record<string, string>>({})
const queryParams = ref<Record<string, string>>({})
const requestBody = ref('')
const bodyError = ref('')
const fieldsDepth = ref(1)

const pathParameters = computed(() =>
  props.endpoint?.parameters.filter(p => p.in === 'path') || []
)

const queryParameters = computed(() =>
  props.endpoint?.parameters.filter(p => p.in === 'query') || []
)

const hasRequestBody = computed(() => {
  if (!props.endpoint) return false
  return ['post', 'put', 'patch'].includes(props.endpoint.method)
})

const resolvedPath = computed(() => {
  if (!props.endpoint) return ''
  let p = props.endpoint.path
  for (const [key, value] of Object.entries(pathParams.value)) {
    p = p.replace(`{${key}}`, value || `{${key}}`)
  }
  return p
})

const missingRequiredPathParams = computed(() => {
  return pathParameters.value
    .filter(p => p.required !== false)
    .some(p => !pathParams.value[p.name])
})

// Reset params when endpoint changes
watch(() => props.endpoint, () => {
  pathParams.value = {}
  queryParams.value = {}
  requestBody.value = ''
  bodyError.value = ''
  fieldsDepth.value = 1
}, { deep: false })

function validateBody(): boolean {
  if (!hasRequestBody.value || !requestBody.value.trim()) {
    bodyError.value = ''
    return true
  }
  try {
    JSON.parse(requestBody.value)
    bodyError.value = ''
    return true
  } catch (e: any) {
    bodyError.value = e.message
    return false
  }
}

function handleSend() {
  if (!props.endpoint || props.loading) return
  if (!validateBody()) return

  const params: Record<string, string> = {}
  for (const [key, value] of Object.entries(queryParams.value)) {
    if (value) params[key] = value
  }

  // Add fields depth as wildcard pattern (e.g. depth 2 = *.*)
  if (fieldsDepth.value > 0 && !params['fields']) {
    params['fields'] = Array(fieldsDepth.value).fill('*').join('.')
  }

  let body: any = undefined
  if (hasRequestBody.value && requestBody.value.trim()) {
    body = JSON.parse(requestBody.value)
  }

  emit('send', {
    method: props.endpoint.method,
    path: resolvedPath.value,
    queryParams: params,
    body,
  })
}
</script>

<template>
  <div v-if="endpoint" class="flex flex-col gap-3 p-4">
    <!-- URL Bar -->
    <div class="flex items-center gap-2">
      <span
        class="text-xs font-bold uppercase px-3 py-2 rounded border flex-shrink-0"
        :class="METHOD_COLORS[endpoint.method]"
      >
        {{ endpoint.method }}
      </span>
      <div class="flex-1 flex items-center bg-base-200 rounded-lg border border-base-content/10 px-3 py-2 font-mono text-sm overflow-hidden">
        <span class="text-base-content/40 flex-shrink-0">{{ instanceUrl.replace(/\/+$/, '') }}</span>
        <span class="text-base-content">{{ resolvedPath }}</span>
      </div>
      <button
        class="btn btn-primary btn-sm gap-1"
        :disabled="loading || missingRequiredPathParams"
        @click="handleSend"
      >
        <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
        <Play v-else class="h-4 w-4" />
        Send
      </button>
    </div>

    <!-- Summary -->
    <p v-if="endpoint.summary" class="text-xs text-base-content/50 px-1">{{ endpoint.summary }}</p>

    <!-- Parameters -->
    <div class="flex flex-col gap-3 max-h-[50vh] overflow-y-auto">
      <!-- Path Parameters -->
      <div v-if="pathParameters.length > 0">
        <h4 class="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2">Path Parameters</h4>
        <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 items-center">
          <template v-for="param in pathParameters" :key="param.name">
            <label class="text-xs font-mono text-base-content/70 flex items-center gap-1">
              {{ param.name }}
              <span v-if="param.required !== false" class="text-error text-[10px]">*</span>
            </label>
            <input
              v-model="pathParams[param.name]"
              :placeholder="param.schema?.type || 'value'"
              class="input input-xs bg-base-200 border-base-content/10 font-mono w-full"
            />
          </template>
        </div>
      </div>

      <!-- Fields Depth -->
      <div>
        <h4 class="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2">Relational Depth</h4>
        <div class="flex items-center gap-3">
          <input
            v-model.number="fieldsDepth"
            type="number"
            min="0"
            max="5"
            class="input input-xs bg-base-200 border-base-content/10 font-mono w-20"
          />
          <span class="text-xs text-base-content/40 font-mono">
            fields={{ fieldsDepth > 0 ? Array(fieldsDepth).fill('*').join('.') : '(none)' }}
          </span>
          <span class="text-xs text-base-content/30">Higher = deeper nested data</span>
        </div>
      </div>

      <!-- Query Parameters -->
      <div v-if="queryParameters.length > 0">
        <h4 class="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2">Query Parameters</h4>
        <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 items-center">
          <template v-for="param in queryParameters" :key="param.name">
            <label class="text-xs font-mono text-base-content/70 flex items-center gap-1" :title="param.description">
              {{ param.name }}
              <span v-if="param.required" class="text-error text-[10px]">*</span>
            </label>
            <input
              v-model="queryParams[param.name]"
              :placeholder="param.description || param.schema?.type || 'value'"
              class="input input-xs bg-base-200 border-base-content/10 font-mono w-full"
            />
          </template>
        </div>
      </div>

      <!-- Request Body -->
      <div v-if="hasRequestBody">
        <h4 class="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2">Request Body (JSON)</h4>
        <textarea
          v-model="requestBody"
          placeholder='{ "key": "value" }'
          class="textarea textarea-sm w-full font-mono text-sm bg-base-200 border-base-content/10 min-h-[100px] resize-y"
          :class="{ 'border-error': bodyError }"
          @blur="validateBody"
        />
        <p v-if="bodyError" class="text-xs text-error mt-1">Invalid JSON: {{ bodyError }}</p>
      </div>
    </div>
  </div>

  <!-- Empty state -->
  <div v-else class="flex items-center justify-center h-full text-base-content/30 text-sm">
    Select an endpoint from the sidebar
  </div>
</template>
