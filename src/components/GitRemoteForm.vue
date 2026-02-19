<script setup lang="ts">
import { ref, watch } from 'vue'
import { Instance } from '../vite-env'
import { GitBranch, Key, Link, Info } from 'lucide-vue-next'
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

    <div class="space-y-5">
      <div class="space-y-1.5">
        <p class="text-sm font-medium text-base-content flex items-center gap-2">
          <Link class="h-4 w-4" />
          Remote URL
        </p>
        <input
          v-model="remoteUrl"
          type="url"
          placeholder="https://github.com/username/repo.git"
          class="input input-bordered w-full bg-base-100 border-base-content/10 placeholder:text-base-content/40 focus:border-primary focus:outline-none transition-colors"
        />
        <p class="text-xs text-base-content/50">GitHub, GitLab, or any Git remote URL</p>
      </div>

      <div class="space-y-1.5">
        <p class="text-sm font-medium text-base-content flex items-center gap-2">
          <Key class="h-4 w-4" />
          Personal Access Token
        </p>
        <input
          v-model="gitToken"
          type="password"
          placeholder="ghp_xxxxxxxxxxxx or glpat-xxxxxxxxxxxx"
          class="input input-bordered w-full bg-base-100 border-base-content/10 placeholder:text-base-content/40 focus:border-primary focus:outline-none transition-colors"
        />
        <p class="text-xs text-base-content/50">Token will be encrypted and stored securely</p>
      </div>

      <div class="p-4 rounded-xl bg-info/10 border border-info/20 flex items-start gap-3">
        <Info class="h-5 w-5 text-info shrink-0 mt-0.5" />
        <div>
          <p class="font-medium text-sm">How to get a token:</p>
          <p class="text-sm text-base-content/70">GitHub: Settings → Developer Settings → Personal Access Tokens</p>
          <p class="text-sm text-base-content/70">GitLab: Preferences → Access Tokens</p>
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
