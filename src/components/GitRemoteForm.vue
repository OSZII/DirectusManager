<script setup lang="ts">
import { ref, watch } from 'vue'
import { Instance } from '../vite-env'
import { GitBranch, Key, Link } from 'lucide-vue-next'
import AppModal from './AppModal.vue'
import AppButton from './AppButton.vue'

const props = defineProps<{
  show: boolean
  instance: Instance | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', instanceId: string, remoteUrl: string, token: string): void
}>()

const remoteUrl = ref('')
const gitToken = ref('')
const isSaving = ref(false)

// Reset form when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    remoteUrl.value = props.instance?.gitRemoteUrl || ''
    gitToken.value = ''
    isSaving.value = false
  }
})

async function handleSave() {
  if (!props.instance || !remoteUrl.value || !gitToken.value) return
  isSaving.value = true
  emit('save', props.instance.id, remoteUrl.value, gitToken.value)
}
</script>

<template>
  <AppModal
    :show="show"
    title="Connect Git Remote"
    :subtitle="`Configure Git for ${instance?.name || 'instance'}`"
    @close="emit('close')"
  >
    <template #icon>
      <GitBranch class="h-5 w-5 text-primary" />
    </template>

    <div class="space-y-4">
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text font-medium flex items-center gap-2">
            <Link class="h-4 w-4" />
            Remote URL
          </span>
        </label>
        <input 
          v-model="remoteUrl" 
          type="url" 
          placeholder="https://github.com/username/repo.git" 
          class="input placeholder:text-base-content/40 input-bordered w-full focus:input-primary transition-colors" 
        />
        <label class="label">
          <span class="label-text-alt text-base-content/50">GitHub, GitLab, or any Git remote URL</span>
        </label>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text font-medium flex items-center gap-2">
            <Key class="h-4 w-4" />
            Personal Access Token
          </span>
        </label>
        <input 
          v-model="gitToken" 
          type="password" 
          placeholder="ghp_xxxxxxxxxxxx or glpat-xxxxxxxxxxxx" 
          class="input placeholder:text-base-content/40 input-bordered w-full focus:input-primary transition-colors" 
        />
        <label class="label">
          <span class="label-text-alt text-base-content/50">Token will be encrypted and stored securely</span>
        </label>
      </div>

      <div class="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <p class="font-medium">How to get a token:</p>
          <p class="text-sm">GitHub: Settings → Developer Settings → Personal Access Tokens</p>
          <p class="text-sm">GitLab: Preferences → Access Tokens</p>
        </div>
      </div>
    </div>

    <template #footer>
      <AppButton variant="ghost" @click="emit('close')" :disabled="isSaving">Cancel</AppButton>
      <AppButton 
        variant="primary" 
        @click="handleSave"
        :disabled="!remoteUrl || !gitToken || isSaving"
        :loading="isSaving"
        :label="isSaving ? 'Connecting...' : 'Connect Remote'"
      />
    </template>
  </AppModal>
</template>
