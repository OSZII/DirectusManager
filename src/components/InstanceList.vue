<script setup lang="ts">
import { ref } from 'vue'
import { Instance } from '../vite-env'
import { Globe, MoreVertical, Edit, FolderOpen, Trash2 } from 'lucide-vue-next'
import AppButton from './AppButton.vue'
import PushButton from './PushButton.vue'
import PullButton from './PullButton.vue'

defineProps<{
  instances: Instance[]
}>()

const emit = defineEmits<{
  (e: 'edit', instance: Instance): void
  (e: 'delete', id: string): void
  (e: 'pull', instance: Instance, callback: (success: boolean) => void): void
  (e: 'push', instance: Instance): void
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
  emit('push', instance)
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
                <PullButton 
                  :loading="pullingId === instance.id"
                  @click="handlePull(instance)"
                />
                <PushButton 
                  @click="handlePush(instance)"
                />
              </div>
              <!-- Git Row -->
              <div class="flex items-center gap-2 bg-orange-600/20 rounded-lg px-3 py-1.5">
                <img src="../assets/git-logo.png" alt="Git" class="h-5 w-5 object-contain" />
                <PullButton 
                  @click="handleGitPull(instance)"
                />
                <PushButton 
                  @click="handleGitPush(instance)"
                />
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
