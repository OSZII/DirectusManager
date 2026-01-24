<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Instance, GitStatus } from '../vite-env'
import { Globe, MoreVertical, Edit, FolderOpen, Trash2, GitBranch, Link } from 'lucide-vue-next'
import AppButton from './AppButton.vue'
import PushButton from './PushButton.vue'
import PullButton from './PullButton.vue'

const props = defineProps<{
  instances: Instance[]
  pushingId?: string | null
}>()

const emit = defineEmits<{
  (e: 'edit', instance: Instance): void
  (e: 'delete', id: string): void
  (e: 'pull', instance: Instance, callback: (success: boolean) => void): void
  (e: 'push', instance: Instance): void
  (e: 'open-folder', instance: Instance): void
  (e: 'git-init', instance: Instance): void
  (e: 'git-connect-remote', instance: Instance): void
  (e: 'git-pull', instance: Instance, callback: (success: boolean) => void): void
  (e: 'git-push', instance: Instance, callback: (success: boolean) => void): void
}>()

const pullingId = ref<string | null>(null)
const gitPullingId = ref<string | null>(null)
const gitPushingId = ref<string | null>(null)
const gitInitializingId = ref<string | null>(null)

// Store git status for each instance
const gitStatuses = ref<Record<string, GitStatus>>({})

// Fetch git status for all instances
async function fetchGitStatuses() {
  for (const instance of props.instances) {
    try {
      const status = await window.ipcRenderer.gitStatus(instance.id)
      gitStatuses.value[instance.id] = status
    } catch (e) {
      console.error(`Failed to get git status for ${instance.name}:`, e)
      gitStatuses.value[instance.id] = { initialized: false, hasRemote: false, changesCount: 0 }
    }
  }
}

let pollInterval: NodeJS.Timeout | null = null

// Refresh statuses on mount and when instances change
onMounted(() => {
  fetchGitStatuses()
  // Poll every minute
  pollInterval = setInterval(fetchGitStatuses, 60000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})

watch(() => props.instances, fetchGitStatuses, { deep: true })

function handlePull(instance: Instance) {
  pullingId.value = instance.id
  emit('pull', instance, (_success: boolean) => {
    pullingId.value = null
  })
}

function handlePush(instance: Instance) {
  emit('push', instance)
}

async function handleGitInit(instance: Instance) {
  gitInitializingId.value = instance.id
  emit('git-init', instance)
  // Refresh status after a short delay
  setTimeout(async () => {
    try {
      const status = await window.ipcRenderer.gitStatus(instance.id)
      gitStatuses.value[instance.id] = status
    } catch (e) {
      console.error('Failed to refresh git status:', e)
    }
    gitInitializingId.value = null
  }, 500)
}

function handleGitConnectRemote(instance: Instance) {
  emit('git-connect-remote', instance)
}

function handleGitPull(instance: Instance) {
  gitPullingId.value = instance.id
  emit('git-pull', instance, (_success: boolean) => {
    gitPullingId.value = null
    // Refresh status
    window.ipcRenderer.gitStatus(instance.id).then(status => {
      gitStatuses.value[instance.id] = status
    })
  })
}

function handleGitPush(instance: Instance) {
  gitPushingId.value = instance.id
  emit('git-push', instance, (_success: boolean) => {
    gitPushingId.value = null
    // Refresh status
    window.ipcRenderer.gitStatus(instance.id).then(status => {
      gitStatuses.value[instance.id] = status
    })
  })
}

// Expose refresh function for parent to call after remote setup
defineExpose({ fetchGitStatuses })
</script>

<template>
  <div class="grid gap-4">
    <div v-for="instance in instances" :key="instance.id" 
      class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-content/5 hover:border-primary/30 group">
      <div class="card-body p-5">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-4 min-w-0">
            <!-- Icon -->
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 group-hover:from-primary/30 group-hover:to-secondary/30 transition-colors">
              <Globe class="h-6 w-6 text-primary" />
            </div>
            <!-- Info -->
            <div class="min-w-0">
              <h3 class="font-bold text-lg truncate">{{ instance.name }}</h3>
              <p class="text-sm text-base-content/60 truncate">{{ instance.url }}</p>
            </div>
          </div>
          <!-- Actions Container -->
          <div class="flex items-center gap-3">
            <!-- Button Rows -->
            <div class="flex flex-col gap-2">
              <!-- Directus Row -->
              <div class="flex items-center gap-2 bg-purple-600/20 rounded-lg px-3 py-1.5">
                <img src="../assets/directus-logo.png" alt="Directus" class="h-5 w-5 object-contain" />
                <PullButton 
                  :loading="pullingId === instance.id"
                  @click="handlePull(instance)"
                />
                <PushButton 
                  :loading="props.pushingId === instance.id"
                  :disabled="props.pushingId === instance.id"
                  @click="handlePush(instance)"
                />
              </div>
              <!-- Git Row -->
              <div class="flex items-center gap-2 bg-orange-600/20 rounded-lg px-3 py-1.5">
                <img src="../assets/git-logo.png" alt="Git" class="h-5 w-5 object-contain" />
                
                <!-- State: Not initialized -->
                <template v-if="!gitStatuses[instance.id]?.initialized">
                  <AppButton 
                    variant="ghost" 
                    size="sm"
                    :loading="gitInitializingId === instance.id"
                    @click="handleGitInit(instance)"
                  >
                    <template #icon><GitBranch class="h-4 w-4" /></template>
                    Init Git
                  </AppButton>
                </template>
                
                <!-- State: Initialized but no remote -->
                <template v-else-if="!gitStatuses[instance.id]?.hasRemote">
                  <AppButton 
                    variant="ghost" 
                    size="sm"
                    @click="handleGitConnectRemote(instance)"
                  >
                    <template #icon><Link class="h-4 w-4" /></template>
                    Connect Remote
                  </AppButton>
                </template>
                
                <!-- State: Fully configured - show push/pull -->
                <template v-else>
                  <PullButton 
                    :loading="gitPullingId === instance.id"
                    @click="handleGitPull(instance)"
                  />
                  <PushButton 
                    :loading="gitPushingId === instance.id"
                    @click="handleGitPush(instance)"
                  />
                  <!-- Show changes count badge if there are changes -->
                  <span 
                    v-if="gitStatuses[instance.id]?.changesCount > 0" 
                    class="badge badge-warning badge-sm"
                    :title="`${gitStatuses[instance.id].changesCount} uncommitted changes`"
                  >
                    {{ gitStatuses[instance.id].changesCount }}
                  </span>
                </template>
              </div>
            </div>
            <!-- Dropdown Menu (Far Right) -->
            <div class="dropdown dropdown-end">
              <label tabindex="0" class="btn btn-ghost btn-md btn-square">
                <MoreVertical class="h-5 w-5" />
              </label>
              <ul tabindex="0" class="dropdown-content menu p-2 shadow-xl bg-base-200 rounded-box w-48 border border-base-content/10 z-100">
                <li>
                  <AppButton variant="ghost" class="w-full justify-start font-normal" @click="emit('edit', instance)">
                    <template #icon><Edit class="h-4 w-4" /></template>
                    Edit
                  </AppButton>
                </li>
                <li>
                  <AppButton variant="ghost" class="w-full justify-start font-normal" @click="emit('open-folder', instance)">
                    <template #icon><FolderOpen class="h-4 w-4" /></template>
                    Open in Folder
                  </AppButton>
                </li>
                <li>
                  <AppButton variant="ghost" class="w-full justify-start font-normal text-error hover:bg-error/20" @click="emit('delete', instance.id)">
                    <template #icon><Trash2 class="h-4 w-4" /></template>
                    Delete
                  </AppButton>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
