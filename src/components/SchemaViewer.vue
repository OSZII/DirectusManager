<script setup lang="ts">
import { ref, onMounted, nextTick, markRaw, computed } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import type { Node, Edge } from '@vue-flow/core'
import { Instance, SchemaData, SchemaCollection, SchemaField } from '../vite-env'
import SchemaNode from './SchemaNode.vue'
import {
  RefreshCw, AlertCircle, Key, Link, Hash, Type, Calendar, ToggleLeft,
  List, FileText, ChevronDown, ChevronRight, PanelLeftClose, PanelLeft,
  Layers, Table2, Info, X, Waypoints
} from 'lucide-vue-next'
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

// Sidebar state
const sidebarOpen = ref(true)
const expandedTreeNodes = ref<Set<string>>(new Set())
const selectedCollection = ref<string | null>(null)

// Legend state
const showLegend = ref(true)

// VueFlow composable
const { fitView } = useVueFlow({ id: 'schema-flow' })

// ===== Collection Tree =====

interface TreeNode {
  name: string
  collection: SchemaCollection
  children: TreeNode[]
  isJunction: boolean
  fieldCount: number
}

const collectionTree = computed<TreeNode[]>(() => {
  if (!schemaData.value) return []

  const { collections, relations } = schemaData.value
  const collMap = new Map(collections.map(c => [c.collection, c]))
  const childSet = new Set<string>()
  const parentChildMap = new Map<string, string[]>()

  // Use O2M relations to determine parent-child hierarchy
  for (const rel of relations) {
    if (rel.type === 'O2M' && collMap.has(rel.collection) && collMap.has(rel.relatedCollection)) {
      if (!childSet.has(rel.relatedCollection)) {
        childSet.add(rel.relatedCollection)
        if (!parentChildMap.has(rel.collection)) {
          parentChildMap.set(rel.collection, [])
        }
        parentChildMap.get(rel.collection)!.push(rel.relatedCollection)
      }
    }
  }

  function buildNode(name: string, visited: Set<string>): TreeNode | null {
    if (visited.has(name)) return null
    const coll = collMap.get(name)
    if (!coll) return null
    visited.add(name)

    const childNames = parentChildMap.get(name) || []
    const children = childNames
      .map(cn => buildNode(cn, visited))
      .filter(Boolean) as TreeNode[]
    children.sort((a, b) => a.name.localeCompare(b.name))

    return {
      name: coll.collection,
      collection: coll,
      children,
      isJunction: coll.isJunction,
      fieldCount: coll.fields.length,
    }
  }

  const roots: TreeNode[] = []
  const visited = new Set<string>()
  for (const coll of collections) {
    if (!childSet.has(coll.collection)) {
      const node = buildNode(coll.collection, visited)
      if (node) roots.push(node)
    }
  }
  roots.sort((a, b) => a.name.localeCompare(b.name))
  return roots
})

// Flat tree for rendering
interface FlatItem {
  name: string
  depth: number
  hasChildren: boolean
  isJunction: boolean
  fieldCount: number
}

const flatTree = computed<FlatItem[]>(() => {
  const items: FlatItem[] = []

  function flatten(treeNodes: TreeNode[], depth: number) {
    for (const node of treeNodes) {
      items.push({
        name: node.name,
        depth,
        hasChildren: node.children.length > 0,
        isJunction: node.isJunction,
        fieldCount: node.fieldCount,
      })
      if (expandedTreeNodes.value.has(node.name) && node.children.length > 0) {
        flatten(node.children, depth + 1)
      }
    }
  }

  flatten(collectionTree.value, 0)
  return items
})

// Selected collection details
const selectedCollectionData = computed<SchemaCollection | null>(() => {
  if (!selectedCollection.value || !schemaData.value) return null
  return schemaData.value.collections.find(c => c.collection === selectedCollection.value) || null
})

const selectedCollectionRelations = computed(() => {
  if (!selectedCollection.value || !schemaData.value) return []
  return schemaData.value.relations.filter(
    r => r.collection === selectedCollection.value || r.relatedCollection === selectedCollection.value
  )
})

function toggleTreeNode(name: string) {
  const newSet = new Set(expandedTreeNodes.value)
  if (newSet.has(name)) {
    newSet.delete(name)
  } else {
    newSet.add(name)
  }
  expandedTreeNodes.value = newSet
}

function focusCollection(name: string) {
  selectedCollection.value = name

  // Highlight node on graph
  nodes.value.forEach(n => { (n as any).selected = false })
  const targetNode = nodes.value.find(n => n.id === name)
  if (targetNode) (targetNode as any).selected = true

  nextTick(() => {
    fitView({ nodes: [name], duration: 500, padding: 0.3 })
  })
}

function getFieldIcon(field: SchemaField) {
  if (field.isPrimaryKey) return Key
  if (field.isForeignKey) return Link
  if (['integer', 'float', 'decimal', 'bigInteger'].includes(field.type)) return Hash
  if (['string', 'text'].includes(field.type)) return Type
  if (['timestamp', 'dateTime', 'date'].includes(field.type)) return Calendar
  if (field.type === 'boolean') return ToggleLeft
  if (['json', 'csv'].includes(field.type)) return List
  return FileText
}

function autoExpandRoots() {
  const newSet = new Set<string>()
  for (const root of collectionTree.value) {
    if (root.children.length > 0) {
      newSet.add(root.name)
    }
  }
  expandedTreeNodes.value = newSet
}

// ===== Graph building =====

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
    // Auto-expand root nodes with children after tree is computed
    await nextTick()
    autoExpandRoots()
  } catch (err: any) {
    error.value = err.message || 'Failed to load schema'
  } finally {
    loading.value = false
  }
}

onMounted(fetchSchema)
</script>

<template>
  <div class="w-full h-full relative schema-viewer flex">
    <!-- Sidebar -->
    <aside
      v-if="!loading && !error && sidebarOpen"
      class="w-72 flex-shrink-0 bg-base-100/95 backdrop-blur-lg border-r border-base-content/10 flex flex-col overflow-hidden z-20"
    >
      <!-- Sidebar Header -->
      <div class="px-4 py-3 border-b border-base-content/10 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Layers class="h-4 w-4 text-primary" />
          <span class="font-semibold text-sm">Collections</span>
          <span class="badge badge-sm badge-ghost">{{ schemaData?.collections.length || 0 }}</span>
        </div>
        <button class="btn btn-ghost btn-xs btn-square" @click="sidebarOpen = false" title="Close sidebar">
          <PanelLeftClose class="h-3.5 w-3.5" />
        </button>
      </div>

      <!-- Collection Tree -->
      <div class="flex-1 overflow-y-auto py-1">
        <div
          v-for="item in flatTree"
          :key="item.name"
          class="flex items-center gap-1.5 px-2 py-1.5 cursor-pointer text-xs hover:bg-base-200/60 transition-colors group"
          :class="{ 'bg-primary/10 text-primary': selectedCollection === item.name }"
          :style="{ paddingLeft: `${item.depth * 16 + 8}px` }"
          @click="focusCollection(item.name)"
        >
          <!-- Expand arrow -->
          <button
            v-if="item.hasChildren"
            class="btn btn-ghost btn-xs btn-square h-5 w-5 min-h-0 p-0"
            @click.stop="toggleTreeNode(item.name)"
          >
            <component
              :is="expandedTreeNodes.has(item.name) ? ChevronDown : ChevronRight"
              class="h-3 w-3 opacity-50"
            />
          </button>
          <span v-else class="w-5 flex-shrink-0" />

          <!-- Collection icon -->
          <Waypoints v-if="item.isJunction" class="h-3.5 w-3.5 text-secondary flex-shrink-0" />
          <Table2 v-else class="h-3.5 w-3.5 text-primary/70 flex-shrink-0" />

          <!-- Name -->
          <span class="truncate flex-1 font-medium">{{ item.name }}</span>

          <!-- Field count badge -->
          <span class="text-base-content/30 flex-shrink-0 text-[10px]">{{ item.fieldCount }} fields</span>
        </div>

        <!-- Empty state -->
        <div v-if="flatTree.length === 0" class="px-4 py-8 text-center text-xs text-base-content/30">
          No collections found
        </div>
      </div>

      <!-- Selected Collection Detail Panel -->
      <div
        v-if="selectedCollectionData"
        class="border-t border-base-content/10 max-h-[40%] flex flex-col"
      >
        <div class="px-4 py-2.5 flex items-center justify-between bg-base-200/30 flex-shrink-0">
          <div class="flex items-center gap-2 min-w-0">
            <Waypoints v-if="selectedCollectionData.isJunction" class="h-3.5 w-3.5 text-secondary flex-shrink-0" />
            <Table2 v-else class="h-3.5 w-3.5 text-primary/70 flex-shrink-0" />
            <span class="font-semibold text-xs truncate">{{ selectedCollectionData.collection }}</span>
          </div>
          <button class="btn btn-ghost btn-xs btn-square h-5 w-5 min-h-0" @click="selectedCollection = null">
            <X class="h-3 w-3" />
          </button>
        </div>

        <div class="overflow-y-auto px-3 py-2 space-y-0.5">
          <!-- Fields -->
          <div
            v-for="field in selectedCollectionData.fields"
            :key="field.field"
            class="flex items-center gap-2 py-1 text-xs"
          >
            <component
              :is="getFieldIcon(field)"
              class="h-3 w-3 flex-shrink-0"
              :class="field.isPrimaryKey ? 'text-warning' : field.isForeignKey ? 'text-info' : 'text-base-content/30'"
            />
            <span class="truncate font-medium" :class="field.isForeignKey ? 'text-info/80' : ''">
              {{ field.field }}
            </span>
            <span v-if="field.foreignKeyTable" class="text-info/40 text-[10px] truncate">
              → {{ field.foreignKeyTable }}
            </span>
            <span class="text-base-content/25 ml-auto flex-shrink-0 text-[10px]">{{ field.type }}</span>
          </div>

          <!-- Relations -->
          <div v-if="selectedCollectionRelations.length > 0" class="pt-2 mt-2 border-t border-base-content/5">
            <div class="text-[10px] font-semibold text-base-content/40 uppercase tracking-wider mb-1.5">Relations</div>
            <div
              v-for="(rel, i) in selectedCollectionRelations"
              :key="i"
              class="flex items-center gap-2 py-0.5 text-xs cursor-pointer hover:bg-base-200/40 rounded px-1 -mx-1"
              @click="focusCollection(rel.collection === selectedCollection ? rel.relatedCollection : rel.collection)"
            >
              <span
                class="w-2 h-2 rounded-full flex-shrink-0"
                :style="{
                  backgroundColor: rel.type === 'M2M' ? 'oklch(0.65 0.2 300)' : rel.type === 'O2M' ? 'oklch(0.75 0.15 80)' : 'oklch(0.65 0.2 250)'
                }"
              />
              <span class="text-base-content/50 font-mono text-[10px] w-7 flex-shrink-0">{{ rel.type }}</span>
              <span class="truncate text-base-content/60">
                {{ rel.collection === selectedCollection ? rel.relatedCollection : rel.collection }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Graph Area -->
    <div class="flex-1 relative overflow-hidden">
      <!-- Sidebar toggle (when closed) -->
      <button
        v-if="!sidebarOpen && !loading && !error"
        class="absolute top-4 left-4 z-20 btn btn-sm btn-ghost bg-base-100/90 backdrop-blur border border-base-content/10 shadow-lg"
        @click="sidebarOpen = true"
        title="Open sidebar"
      >
        <PanelLeft class="h-4 w-4" />
      </button>

      <!-- Legend toggle (when legend is closed) -->
      <button
        v-if="!showLegend && !loading && !error"
        class="absolute top-4 right-4 z-20 btn btn-sm btn-ghost bg-base-100/90 backdrop-blur border border-base-content/10 shadow-lg"
        @click="showLegend = true"
        title="Show legend"
      >
        <Info class="h-4 w-4" />
      </button>

      <!-- Legend Panel -->
      <div
        v-if="showLegend && !loading && !error"
        class="absolute top-4 right-4 z-20 bg-base-100/95 backdrop-blur-lg rounded-xl border border-base-content/10 shadow-xl w-[210px]"
      >
        <!-- Legend Header -->
        <div class="px-3 py-2 border-b border-base-content/10 flex items-center justify-between">
          <span class="font-semibold text-xs">Legend</span>
          <button class="btn btn-ghost btn-xs btn-square h-5 w-5 min-h-0" @click="showLegend = false">
            <X class="h-3 w-3" />
          </button>
        </div>

        <div class="p-3 space-y-3">
          <!-- Relationship Lines -->
          <div>
            <div class="text-[10px] font-semibold text-base-content/40 uppercase tracking-wider mb-1.5">Relationships</div>
            <div class="space-y-1.5">
              <div class="flex items-center gap-2.5">
                <svg width="28" height="10" class="flex-shrink-0">
                  <line x1="0" y1="5" x2="28" y2="5" stroke="oklch(0.65 0.2 300)" stroke-width="2" stroke-dasharray="4 2" />
                </svg>
                <span class="text-[11px] text-base-content/60">Many to Many</span>
              </div>
              <div class="flex items-center gap-2.5">
                <svg width="28" height="10" class="flex-shrink-0">
                  <line x1="0" y1="5" x2="28" y2="5" stroke="oklch(0.75 0.15 80)" stroke-width="2" />
                </svg>
                <span class="text-[11px] text-base-content/60">One to Many</span>
              </div>
              <div class="flex items-center gap-2.5">
                <svg width="28" height="10" class="flex-shrink-0">
                  <line x1="0" y1="5" x2="28" y2="5" stroke="oklch(0.65 0.2 250)" stroke-width="2" />
                </svg>
                <span class="text-[11px] text-base-content/60">Many to One</span>
              </div>
            </div>
          </div>

          <!-- Field Icons -->
          <div>
            <div class="text-[10px] font-semibold text-base-content/40 uppercase tracking-wider mb-1.5">Field Types</div>
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <Key class="h-3 w-3 text-warning flex-shrink-0" />
                <span class="text-[11px] text-base-content/60">Primary Key</span>
              </div>
              <div class="flex items-center gap-2">
                <Link class="h-3 w-3 text-info flex-shrink-0" />
                <span class="text-[11px] text-base-content/60">Foreign Key</span>
              </div>
              <div class="flex items-center gap-2">
                <Hash class="h-3 w-3 text-base-content/40 flex-shrink-0" />
                <span class="text-[11px] text-base-content/60">Number</span>
              </div>
              <div class="flex items-center gap-2">
                <Type class="h-3 w-3 text-base-content/40 flex-shrink-0" />
                <span class="text-[11px] text-base-content/60">String / Text</span>
              </div>
              <div class="flex items-center gap-2">
                <Calendar class="h-3 w-3 text-base-content/40 flex-shrink-0" />
                <span class="text-[11px] text-base-content/60">Date / Time</span>
              </div>
              <div class="flex items-center gap-2">
                <ToggleLeft class="h-3 w-3 text-base-content/40 flex-shrink-0" />
                <span class="text-[11px] text-base-content/60">Boolean</span>
              </div>
              <div class="flex items-center gap-2">
                <List class="h-3 w-3 text-base-content/40 flex-shrink-0" />
                <span class="text-[11px] text-base-content/60">JSON / CSV</span>
              </div>
              <div class="flex items-center gap-2">
                <FileText class="h-3 w-3 text-base-content/40 flex-shrink-0" />
                <span class="text-[11px] text-base-content/60">Other</span>
              </div>
            </div>
          </div>

          <!-- Node Types -->
          <div>
            <div class="text-[10px] font-semibold text-base-content/40 uppercase tracking-wider mb-1.5">Node Types</div>
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="w-3.5 h-3 rounded border-2 border-primary/50 bg-primary/15 flex-shrink-0"></span>
                <span class="text-[11px] text-base-content/60">Collection</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3.5 h-3 rounded border-2 border-secondary/50 bg-secondary/15 flex-shrink-0"></span>
                <span class="text-[11px] text-base-content/60">Junction Table</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
        id="schema-flow"
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

/* Selected node highlight */
.schema-viewer .vue-flow__node.selected > div {
  box-shadow: 0 0 0 2px oklch(0.7 0.15 250), 0 0 20px oklch(0.5 0.15 250 / 0.3);
}
</style>
