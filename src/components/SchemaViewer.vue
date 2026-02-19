<script setup lang="ts">
import { ref, onMounted, nextTick, markRaw } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import type { Node, Edge } from '@vue-flow/core'
import { Instance, SchemaData } from '../vite-env'
import SchemaNode from './SchemaNode.vue'
import { RefreshCw, AlertCircle } from 'lucide-vue-next'
import AppButton from './AppButton.vue'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'

const props = defineProps<{
  instance: Instance
}>()

const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const nodeTypes: Record<string, any> = {
  schema: markRaw(SchemaNode),
}

// Track collapsed state and schema data for edge rebuilding
const collapsedNodes = ref<Set<string>>(new Set())
const schemaData = ref<SchemaData | null>(null)
const sourceFieldsByNode = ref<Record<string, Set<string>>>({})
const targetFieldsByNode = ref<Record<string, Set<string>>>({})

function computeConnectedFields(schema: SchemaData) {
  const srcFields: Record<string, Set<string>> = {}
  const tgtFields: Record<string, Set<string>> = {}
  const nodeIds = new Set(schema.collections.map(c => c.collection))

  for (const rel of schema.relations) {
    if (!nodeIds.has(rel.collection) || !nodeIds.has(rel.relatedCollection)) continue

    if (!srcFields[rel.collection]) srcFields[rel.collection] = new Set()
    srcFields[rel.collection].add(rel.field)

    const targetField = rel.relatedField || 'id'
    if (!tgtFields[rel.relatedCollection]) tgtFields[rel.relatedCollection] = new Set()
    tgtFields[rel.relatedCollection].add(targetField)
  }

  sourceFieldsByNode.value = srcFields
  targetFieldsByNode.value = tgtFields
}

function buildNodes(schema: SchemaData) {
  const count = schema.collections.length
  const cols = Math.ceil(Math.sqrt(count))
  const spacingX = 340

  // Dynamic vertical spacing based on tallest node
  const maxFields = Math.max(...schema.collections.map(c => c.fields.length), 1)
  const headerHeight = 40
  const fieldRowHeight = 29
  const maxNodeHeight = headerHeight + maxFields * fieldRowHeight
  const spacingY = maxNodeHeight + 80

  nodes.value = schema.collections.map((coll, i) => ({
    id: coll.collection,
    type: 'schema',
    position: {
      x: (i % cols) * spacingX,
      y: Math.floor(i / cols) * spacingY,
    },
    data: {
      label: coll.collection,
      fields: coll.fields,
      isJunction: coll.isJunction,
      collapsed: false,
      onToggle: () => toggleCollapse(coll.collection),
      sourceFields: sourceFieldsByNode.value[coll.collection] || new Set(),
      targetFields: targetFieldsByNode.value[coll.collection] || new Set(),
    },
  }))
}

function rebuildEdges() {
  if (!schemaData.value) return
  const nodeIds = new Set(nodes.value.map(n => n.id))

  edges.value = schemaData.value.relations
    .filter(rel => nodeIds.has(rel.collection) && nodeIds.has(rel.relatedCollection))
    .map((rel, i) => {
      const srcCollapsed = collapsedNodes.value.has(rel.collection)
      const tgtCollapsed = collapsedNodes.value.has(rel.relatedCollection)
      const targetField = rel.relatedField || 'id'

      let strokeColor: string
      let animated = false
      let label: string

      switch (rel.type) {
        case 'M2M':
          strokeColor = 'oklch(0.65 0.2 300)'
          animated = true
          label = 'M2M'
          break
        case 'O2M':
          strokeColor = 'oklch(0.75 0.15 80)'
          label = 'O2M'
          break
        default:
          strokeColor = 'oklch(0.65 0.2 250)'
          label = 'M2O'
      }

      return {
        id: `e-${rel.collection}-${rel.field}-${i}`,
        source: rel.collection,
        target: rel.relatedCollection,
        sourceHandle: srcCollapsed ? 'collapsed-source' : `${rel.field}-source`,
        targetHandle: tgtCollapsed ? 'collapsed-target' : `${targetField}-target`,
        animated,
        label,
        style: { stroke: strokeColor, strokeWidth: 2 },
        labelStyle: { fill: 'oklch(0.8 0 0)', fontSize: 10 },
        labelBgStyle: { fill: 'oklch(0.2 0 0)', fillOpacity: 0.8 },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 4,
      }
    })
}

async function toggleCollapse(nodeId: string) {
  const isCurrentlyCollapsed = collapsedNodes.value.has(nodeId)

  if (isCurrentlyCollapsed) {
    collapsedNodes.value.delete(nodeId)
  } else {
    collapsedNodes.value.add(nodeId)
  }
  collapsedNodes.value = new Set(collapsedNodes.value)

  // Update node data so SchemaNode re-renders
  const node = nodes.value.find(n => n.id === nodeId)
  if (node) {
    node.data = { ...node.data, collapsed: !isCurrentlyCollapsed }
  }

  // Wait for DOM to update (handles appear/disappear), then rebuild edges
  await nextTick()
  rebuildEdges()
}

async function fetchSchema() {
  loading.value = true
  error.value = null
  try {
    const schema = await window.ipcRenderer.getSchema(props.instance.id)
    schemaData.value = schema
    computeConnectedFields(schema)
    buildNodes(schema)
    rebuildEdges()
  } catch (err: any) {
    error.value = err.message || 'Failed to load schema'
  } finally {
    loading.value = false
  }
}

onMounted(fetchSchema)
</script>

<template>
  <div class="w-full h-full relative schema-viewer">
    <!-- Loading -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-base-300/80 z-10">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="absolute inset-0 flex flex-col items-center justify-center bg-base-300/80 z-10 gap-4">
      <AlertCircle class="h-12 w-12 text-error" />
      <p class="text-error text-lg font-medium">{{ error }}</p>
      <AppButton variant="primary" @click="fetchSchema">
        <template #icon><RefreshCw class="h-4 w-4" /></template>
        Retry
      </AppButton>
    </div>

    <!-- Graph -->
    <VueFlow
      v-else
      v-model:nodes="nodes"
      v-model:edges="edges"
      :node-types="nodeTypes"
      :default-viewport="{ zoom: 0.8, x: 50, y: 50 }"
      :min-zoom="0.2"
      :max-zoom="2"
      fit-view-on-init
      class="w-full h-full"
    >
      <Background :gap="20" :size="1" pattern-color="oklch(0.35 0 0)" />
      <Controls position="bottom-right" />
    </VueFlow>
  </div>
</template>

<style>
/* Dark theme overrides for Vue Flow */
.schema-viewer .vue-flow__controls {
  background: oklch(0.2 0.02 260);
  border: 1px solid oklch(0.3 0.02 260);
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.schema-viewer .vue-flow__controls-button {
  background: oklch(0.2 0.02 260);
  border-bottom: 1px solid oklch(0.3 0.02 260);
  fill: oklch(0.7 0 0);
}

.schema-viewer .vue-flow__controls-button:hover {
  background: oklch(0.3 0.03 260);
}

.schema-viewer .vue-flow__background {
  background-color: oklch(0.17 0.02 260);
}
</style>
