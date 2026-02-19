<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Key, Link, Hash, Type, Calendar, ToggleLeft, List, FileText, ChevronDown, ChevronRight } from 'lucide-vue-next'
import type { SchemaField } from '../vite-env'

defineProps<{
  data: {
    label: string
    fields: SchemaField[]
    isJunction: boolean
    collapsed: boolean
    onToggle: () => void
    sourceFields: Set<string>
    targetFields: Set<string>
  }
}>()

function getFieldIcon(field: SchemaField) {
  if (field.isPrimaryKey) return Key
  if (field.isForeignKey) return Link
  if (field.type === 'integer' || field.type === 'float' || field.type === 'decimal' || field.type === 'bigInteger') return Hash
  if (field.type === 'string' || field.type === 'text') return Type
  if (field.type === 'timestamp' || field.type === 'dateTime' || field.type === 'date') return Calendar
  if (field.type === 'boolean') return ToggleLeft
  if (field.type === 'json' || field.type === 'csv') return List
  return FileText
}
</script>

<template>
  <div
    class="rounded-xl border shadow-lg min-w-[220px] max-w-[280px] bg-base-100"
    :class="data.isJunction ? 'border-secondary/40' : 'border-primary/30'"
  >
    <!-- Header -->
    <div
      class="px-4 py-2.5 font-bold text-sm flex items-center justify-between gap-2 rounded-t-xl cursor-pointer select-none"
      :class="data.isJunction
        ? 'bg-secondary/20 text-secondary-content'
        : 'bg-primary/20 text-primary-content'"
      @click="data.onToggle()"
    >
      <span class="truncate">{{ data.label }}</span>
      <component
        :is="data.collapsed ? ChevronRight : ChevronDown"
        class="h-3.5 w-3.5 flex-shrink-0 opacity-60"
      />
    </div>

    <!-- Expanded: all fields with per-field handles -->
    <template v-if="!data.collapsed">
      <div
        v-for="field in data.fields"
        :key="field.field"
        class="relative flex items-center gap-2 px-4 py-1.5 text-xs border-t border-base-content/5 hover:bg-base-200/50"
      >
        <Handle
          v-if="data.targetFields?.has(field.field)"
          type="target"
          :position="Position.Left"
          :id="`${field.field}-target`"
          class="!bg-info !border-info/50 !w-2.5 !h-2.5"
        />

        <component
          :is="getFieldIcon(field)"
          class="h-3 w-3 flex-shrink-0"
          :class="field.isPrimaryKey ? 'text-warning' : field.isForeignKey ? 'text-info' : 'text-base-content/40'"
        />
        <span class="truncate font-medium">{{ field.field }}</span>
        <span class="text-base-content/40 ml-auto flex-shrink-0">{{ field.type }}</span>

        <Handle
          v-if="data.sourceFields?.has(field.field)"
          type="source"
          :position="Position.Right"
          :id="`${field.field}-source`"
          class="!bg-primary !border-primary/50 !w-2.5 !h-2.5"
        />
      </div>
    </template>

    <!-- Collapsed: summary with center handles -->
    <template v-else>
      <div class="px-4 py-2 text-xs text-base-content/40 border-t border-base-content/5">
        {{ data.fields.length }} fields
      </div>
      <Handle type="target" :position="Position.Left" id="collapsed-target" class="!bg-info !border-info/50 !w-2.5 !h-2.5" />
      <Handle type="source" :position="Position.Right" id="collapsed-source" class="!bg-primary !border-primary/50 !w-2.5 !h-2.5" />
    </template>
  </div>
</template>
