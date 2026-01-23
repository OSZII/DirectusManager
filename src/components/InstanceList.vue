<script setup lang="ts">
import { ref } from 'vue'
import { Instance } from '../vite-env'

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
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <!-- Info -->
            <div class="min-w-0">
              <h3 class="font-bold text-lg truncate">{{ instance.name }}</h3>
              <p class="text-sm text-base-content/60 truncate">{{ instance.url }}</p>
            </div>
          </div>
          <!-- Actions -->
          <div class="h-full flex items-center justify-stretch gap-2">
            <button 
              class="btn btn-primary btn-sm gap-1.5 transition-all" 
              :disabled="pullingId === instance.id"
              @click="handlePull(instance)"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="h-4 w-4" 
                :class="{ 'animate-spin': pullingId === instance.id }" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ pullingId === instance.id ? 'Pulling...' : 'Pull' }}
            </button>
            <div class="dropdown dropdown-end">
              <label tabindex="0" class="btn btn-ghost btn-md btn-square">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </label>
              <ul tabindex="0" class="dropdown-content menu p-2 shadow-xl bg-base-200 rounded-box w-40 border border-base-content/10">
                <li><a @click="emit('edit', instance)" class="gap-2 hover:cursor-pointer hover:bg-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </a></li>
                <li><a @click="emit('open-folder', instance)" class="gap-2 hover:cursor-pointer hover:bg-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                  </svg>
                  Open in Folder
                </a></li>
                <li><a @click="emit('delete', instance.id)" class="gap-2 hover:cursor-pointer text-error hover:bg-error/20">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
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
