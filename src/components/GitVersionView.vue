<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Instance, GitLogEntry, GitFileChange } from '../vite-env'
import { AlertCircle, FilePlus, FileEdit, FileX, FileSymlink, Loader2, X } from 'lucide-vue-next'

const props = defineProps<{
  instance: Instance
}>()

const commits = ref<GitLogEntry[]>([])
const fileChanges = ref<GitFileChange[]>([])
const selectedCommit = ref<string | null>(null) // null = uncommitted changes
const loading = ref(true)
const filesLoading = ref(false)
const uncommittedCount = ref(0)

// Diff state
const selectedFile = ref<GitFileChange | null>(null)
const diffContent = ref('')
const diffLoading = ref(false)

onMounted(async () => {
  try {
    const [log, status] = await Promise.all([
      window.ipcRenderer.gitLog(props.instance.id),
      window.ipcRenderer.gitStatus(props.instance.id),
    ])
    commits.value = log
    uncommittedCount.value = status.changesCount

    // Default selection: uncommitted if there are changes, otherwise first commit
    if (status.changesCount > 0) {
      selectedCommit.value = null
      await loadFileChanges(null)
    } else if (log.length > 0) {
      selectedCommit.value = log[0].hash
      await loadFileChanges(log[0].hash)
    }
  } catch (e) {
    console.error('Failed to load git history:', e)
  } finally {
    loading.value = false
  }
})

async function loadFileChanges(commitHash: string | null) {
  filesLoading.value = true
  selectedFile.value = null
  diffContent.value = ''
  try {
    fileChanges.value = await window.ipcRenderer.gitFileChanges(
      props.instance.id,
      commitHash || undefined
    )
  } catch (e) {
    console.error('Failed to load file changes:', e)
    fileChanges.value = []
  } finally {
    filesLoading.value = false
  }
}

async function selectCommit(hash: string | null) {
  selectedCommit.value = hash
  await loadFileChanges(hash)
}

async function selectFile(file: GitFileChange) {
  if (selectedFile.value?.path === file.path) {
    // Toggle off
    selectedFile.value = null
    diffContent.value = ''
    return
  }
  selectedFile.value = file
  diffLoading.value = true
  try {
    diffContent.value = await window.ipcRenderer.gitFileDiff(
      props.instance.id,
      file.path,
      selectedCommit.value || undefined
    )
  } catch (e) {
    console.error('Failed to load diff:', e)
    diffContent.value = ''
  } finally {
    diffLoading.value = false
  }
}

function closeDiff() {
  selectedFile.value = null
  diffContent.value = ''
}

const diffLines = computed(() => {
  if (!diffContent.value) return []
  return diffContent.value.split('\n').map(line => {
    let type: 'added' | 'removed' | 'header' | 'context' = 'context'
    if (line.startsWith('+')) type = 'added'
    else if (line.startsWith('-')) type = 'removed'
    else if (line.startsWith('@@') || line.startsWith('diff ') || line.startsWith('index ')) type = 'header'
    return { text: line, type }
  })
})

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 30) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

const groupedFiles = computed(() => {
  const groups: Record<string, GitFileChange[]> = {
    added: [],
    modified: [],
    deleted: [],
    renamed: [],
    copied: [],
  }
  for (const f of fileChanges.value) {
    if (groups[f.status]) {
      groups[f.status].push(f)
    } else {
      groups['modified'].push(f)
    }
  }
  return groups
})

const activeGroups = computed(() => {
  return Object.entries(groupedFiles.value).filter(([_, files]) => files.length > 0)
})

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    added: 'Added',
    modified: 'Modified',
    deleted: 'Deleted',
    renamed: 'Renamed',
    copied: 'Copied',
  }
  return labels[status] || status
}

function statusColor(status: string): string {
  const colors: Record<string, string> = {
    added: 'text-success',
    modified: 'text-warning',
    deleted: 'text-error',
    renamed: 'text-info',
    copied: 'text-info',
  }
  return colors[status] || 'text-base-content'
}

function statusBgColor(status: string): string {
  const colors: Record<string, string> = {
    added: 'bg-success/10',
    modified: 'bg-warning/10',
    deleted: 'bg-error/10',
    renamed: 'bg-info/10',
    copied: 'bg-info/10',
  }
  return colors[status] || 'bg-base-200'
}
</script>

<template>
  <div class="flex h-full overflow-hidden">
    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <Loader2 class="h-8 w-8 animate-spin text-primary" />
    </div>

    <template v-else>
      <!-- Left Panel: Commit History -->
      <div class="w-72 border-r border-base-content/10 flex flex-col bg-base-100/50 flex-shrink-0">
        <div class="px-4 py-3 border-b border-base-content/10">
          <h3 class="text-sm font-semibold text-base-content/70 uppercase tracking-wider">History</h3>
        </div>
        <div class="flex-1 overflow-y-auto">
          <!-- Uncommitted Changes Entry -->
          <button
            v-if="uncommittedCount > 0"
            class="w-full text-left px-4 py-3 border-b border-base-content/5 transition-colors hover:bg-base-content/5"
            :class="selectedCommit === null ? 'bg-primary/10 border-l-2 border-l-primary' : ''"
            @click="selectCommit(null)"
          >
            <div class="flex items-center gap-2">
              <AlertCircle class="h-4 w-4 text-warning flex-shrink-0" />
              <span class="font-medium text-sm">Uncommitted Changes</span>
              <span class="badge badge-warning badge-sm ml-auto">{{ uncommittedCount }}</span>
            </div>
          </button>

          <!-- Commit Entries -->
          <button
            v-for="commit in commits"
            :key="commit.hash"
            class="w-full text-left px-4 py-3 border-b border-base-content/5 transition-colors hover:bg-base-content/5"
            :class="selectedCommit === commit.hash ? 'bg-primary/10 border-l-2 border-l-primary' : ''"
            @click="selectCommit(commit.hash)"
          >
            <div class="flex items-start gap-2">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">{{ commit.message }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <code class="text-xs text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">{{ commit.abbreviatedHash }}</code>
                  <span class="text-xs text-base-content/40">{{ commit.authorName }}</span>
                </div>
              </div>
              <span class="text-xs text-base-content/40 flex-shrink-0 mt-0.5">{{ formatRelativeDate(commit.date) }}</span>
            </div>
          </button>

          <!-- Empty State -->
          <div v-if="commits.length === 0 && uncommittedCount === 0" class="p-6 text-center">
            <p class="text-sm text-base-content/40">No commits found</p>
          </div>
        </div>
      </div>

      <!-- Middle Panel: File Changes -->
      <div class="flex flex-col bg-base-200/30" :class="selectedFile ? 'w-72 flex-shrink-0' : 'flex-1'">
        <div class="px-4 py-3 border-b border-base-content/10 bg-base-100/30">
          <h3 v-if="selectedCommit === null" class="text-sm font-semibold text-warning">
            Uncommitted Changes
          </h3>
          <template v-else>
            <h3 class="text-sm font-semibold truncate">
              {{ commits.find(c => c.hash === selectedCommit)?.message }}
            </h3>
            <p class="text-xs text-base-content/40 mt-0.5">
              <code class="text-primary/80">{{ commits.find(c => c.hash === selectedCommit)?.abbreviatedHash }}</code>
              &middot; {{ commits.find(c => c.hash === selectedCommit)?.authorName }}
              &middot; {{ formatRelativeDate(commits.find(c => c.hash === selectedCommit)?.date || '') }}
            </p>
          </template>
        </div>

        <div class="flex-1 overflow-y-auto p-4">
          <!-- Files Loading -->
          <div v-if="filesLoading" class="flex items-center justify-center py-12">
            <Loader2 class="h-6 w-6 animate-spin text-primary" />
          </div>

          <!-- File Groups -->
          <div v-else-if="activeGroups.length > 0" class="space-y-4">
            <div v-for="[status, files] in activeGroups" :key="status">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-semibold uppercase tracking-wider" :class="statusColor(status)">
                  {{ statusLabel(status) }}
                </span>
                <span class="badge badge-sm" :class="statusColor(status)">{{ files.length }}</span>
              </div>
              <div class="space-y-1">
                <button
                  v-for="file in files"
                  :key="file.path"
                  class="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  :class="[
                    selectedFile?.path === file.path ? 'ring-1 ring-primary bg-primary/10' : statusBgColor(status),
                    'hover:brightness-125'
                  ]"
                  @click="selectFile(file)"
                >
                  <component
                    :is="status === 'added' ? FilePlus : status === 'deleted' ? FileX : status === 'renamed' ? FileSymlink : FileEdit"
                    class="h-4 w-4 flex-shrink-0"
                    :class="statusColor(status)"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-mono truncate">{{ file.path }}</p>
                    <p v-if="file.from" class="text-xs text-base-content/40 font-mono truncate">
                      from {{ file.from }}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="flex flex-col items-center justify-center py-12">
            <p class="text-sm text-base-content/40">No file changes</p>
          </div>
        </div>
      </div>

      <!-- Right Panel: Diff Viewer -->
      <div v-if="selectedFile" class="flex-1 flex flex-col border-l border-base-content/10 bg-base-300/50 min-w-0">
        <!-- Diff Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-base-content/10 bg-base-100/30">
          <div class="flex items-center gap-2 min-w-0">
            <component
              :is="selectedFile.status === 'added' ? FilePlus : selectedFile.status === 'deleted' ? FileX : selectedFile.status === 'renamed' ? FileSymlink : FileEdit"
              class="h-4 w-4 flex-shrink-0"
              :class="statusColor(selectedFile.status)"
            />
            <span class="text-sm font-mono truncate">{{ selectedFile.path }}</span>
          </div>
          <button class="btn btn-ghost btn-xs btn-square" @click="closeDiff">
            <X class="h-3.5 w-3.5" />
          </button>
        </div>

        <!-- Diff Content -->
        <div class="flex-1 overflow-auto">
          <div v-if="diffLoading" class="flex items-center justify-center py-12">
            <Loader2 class="h-6 w-6 animate-spin text-primary" />
          </div>
          <div v-else-if="diffLines.length > 0" class="font-mono text-xs leading-relaxed">
            <div
              v-for="(line, i) in diffLines"
              :key="i"
              class="px-4 py-0.5 whitespace-pre"
              :class="{
                'bg-success/15 text-success': line.type === 'added',
                'bg-error/15 text-error': line.type === 'removed',
                'text-info/60 bg-info/5': line.type === 'header',
                'text-base-content/70': line.type === 'context',
              }"
            >{{ line.text }}</div>
          </div>
          <div v-else class="flex items-center justify-center py-12">
            <p class="text-sm text-base-content/40">No diff available</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
