<script setup lang="ts">
import { ref } from 'vue'
import { Instance } from '../vite-env'
import { Globe, RefreshCw, ArrowUp, MoreVertical, Edit, FolderOpen, Trash2 } from 'lucide-vue-next'

defineProps<{
  instances: Instance[]
}>()

const emit = defineEmits<{
  (e: 'edit', instance: Instance): void
  (e: 'delete', id: string): void
  (e: 'pull', instance: Instance, callback: (success: boolean) => void): void
  (e: 'open-folder', instance: Instance): void
}>()

const pullingId = ref<string | null>(null)

function handlePull(instance: Instance) {
  pullingId.value = instance.id
  emit('pull', instance, (_success: boolean) => {
    pullingId.value = null
  })
}

function handlePush(instance: Instance) {
  alert(`Push instance "${instance.name}" not implemented`)
}

function handleGitPull(instance: Instance) {
  alert(`Git pull for "${instance.name}" not implemented`)
}

function handleGitPush(instance: Instance) {
  alert(`Git push for "${instance.name}" not implemented`)
}
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
                <button 
                  class="btn btn-sm gap-1.5 transition-all bg-base-100 hover:bg-base-100/60 hover:shadow-md border-0 text-base-content" 
                  :disabled="pullingId === instance.id"
                  @click="handlePull(instance)"
                >
                  <RefreshCw 
                    class="h-4 w-4" 
                    :class="{ 'animate-spin': pullingId === instance.id }" 
                  />
                  {{ pullingId === instance.id ? 'Pulling...' : 'Pull' }}
                </button>
                <button 
                  class="btn btn-sm gap-1.5 transition-all bg-base-100 hover:bg-base-100/60 hover:shadow-md border-0 text-base-content" 
                  @click="handlePush(instance)"
                >
                  <ArrowUp class="h-4 w-4" />
                  Push
                </button>
              </div>
              <!-- Git Row -->
              <div class="flex items-center gap-2 bg-orange-600/20 rounded-lg px-3 py-1.5">
                <img src="../assets/git-logo.png" alt="Git" class="h-5 w-5 object-contain" />
                <button 
                  class="btn btn-sm gap-1.5 transition-all bg-base-100 hover:bg-base-100/60 hover:shadow-md border-0 text-base-content" 
                  @click="handleGitPull(instance)"
                >
                  <RefreshCw class="h-4 w-4" />
                  Pull
                </button>
                <button 
                  class="btn btn-sm gap-1.5 transition-all bg-base-100 hover:bg-base-100/60 hover:shadow-md border-0 text-base-content" 
                  @click="handleGitPush(instance)"
                >
                  <ArrowUp class="h-4 w-4" />
                  Push
                </button>
              </div>
            </div>
            <!-- Dropdown Menu (Far Right) -->
            <div class="dropdown dropdown-end">
              <label tabindex="0" class="btn btn-ghost btn-md btn-square">
                <MoreVertical class="h-5 w-5" />
              </label>
              <ul tabindex="0" class="dropdown-content menu p-2 shadow-xl bg-base-200 rounded-box w-40 border border-base-content/10">
                <li><a @click="emit('edit', instance)" class="gap-2 hover:cursor-pointer hover:bg-white/10">
                  <Edit class="h-4 w-4" />
                  Edit
                </a></li>
                <li><a @click="emit('open-folder', instance)" class="gap-2 hover:cursor-pointer hover:bg-white/10">
                  <FolderOpen class="h-4 w-4" />
                  Open in Folder
                </a></li>
                <li><a @click="emit('delete', instance.id)" class="gap-2 hover:cursor-pointer text-error hover:bg-error/20">
                  <Trash2 class="h-4 w-4" />
                  Delete
                </a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
