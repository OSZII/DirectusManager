<script setup lang="ts">
import { ref, onMounted } from 'vue'
import InstanceList from './components/InstanceList.vue'
import AddInstanceForm from './components/AddInstanceForm.vue'
import PushInstanceForm from './components/PushInstanceForm.vue'
import GitRemoteForm from './components/GitRemoteForm.vue'
import { Instance } from './vite-env'
import { Server, Plus, Database, Github } from 'lucide-vue-next'
import AppButton from './components/AppButton.vue'

const instances = ref<Instance[]>([])
const showModal = ref(false)
const editingInstance = ref<Instance | null>(null)
const showPushModal = ref(false)
const pushTargetInstance = ref<Instance | null>(null)
const pushingId = ref<string | null>(null)

// Git Remote Modal
const showGitRemoteModal = ref(false)
const gitRemoteTargetInstance = ref<Instance | null>(null)

// Reference to InstanceList for refreshing git statuses
const instanceListRef = ref<InstanceType<typeof InstanceList> | null>(null)

async function loadInstances() {
  instances.value = await window.ipcRenderer.getInstances()
  console.log("instances", instances.value);
  
}

onMounted(() => {
  loadInstances()

})

function openAddModal() {
  editingInstance.value = null
  showModal.value = true
}

function openEditModal(instance: Instance) {
  editingInstance.value = instance
  showModal.value = true
}

async function handleSave(instance: Partial<Instance>) {
  await window.ipcRenderer.saveInstance(instance)
  showModal.value = false
  loadInstances()
}

async function handleDelete(id: string) {
  if (confirm('Are you sure you want to delete this instance?')) {
    await window.ipcRenderer.deleteInstance(id)
    loadInstances()
  }
}

async function handlePull(instance: Instance, callback: (success: boolean) => void) {
  try {
    const result = await window.ipcRenderer.pullInstance(instance.id);
    if (result.success) {
      alert(`✅ Pull successful for ${instance.name}!`);
      // Refresh git statuses in InstanceList
      instanceListRef.value?.fetchGitStatuses();
    } else {
      alert(`⚠️ Pull completed but may have issues for ${instance.name}.`);
    }
    console.log("[pull] success", result.output);
    callback(result.success);
  } catch (err: any) {
    alert(`❌ Pull failed for ${instance.name}`);
    console.log("[pull] error", err.message);
    callback(false);
  }
}

async function handleOpenFolder(instance: Instance) {
  try {
    await window.ipcRenderer.openFolder(instance.id);
  } catch (err: any) {
    alert(`❌ Failed to open folder for ${instance.name}`);
    console.error('[open-folder] error', err.message);
  }
}

function openPushModal(instance: Instance) {
  pushTargetInstance.value = instance
  showPushModal.value = true
}

async function handlePush(sourceId: string, targetId: string) {
  const targetName = pushTargetInstance.value?.name;
  showPushModal.value = false;
  pushingId.value = targetId;
  try {
    const result = await window.ipcRenderer.pushInstance(sourceId, targetId);
    if (result.success) {
      alert(`✅ Push successful to ${targetName}!`);
    } else {
      alert(`⚠️ Push completed but may have issues.`);
    }
    console.log('[push] success', result.output);
  } catch (err: any) {
    alert(`❌ Push failed: ${err.message}`);
    console.error('[push] error', err.message);
  } finally {
    pushingId.value = null;
  }
}

// ========== GIT HANDLERS ==========

async function handleGitInit(instance: Instance) {
  try {
    await window.ipcRenderer.gitInit(instance.id);
    alert(`✅ Git initialized for ${instance.name}!`);
  } catch (err: any) {
    alert(`❌ Failed to initialize Git: ${err.message}`);
    console.error('[git-init] error', err.message);
  }
}

function handleGitConnectRemote(instance: Instance) {
  gitRemoteTargetInstance.value = instance
  showGitRemoteModal.value = true
}

async function handleGitRemoteSave(instanceId: string, remoteUrl: string, token: string) {
  try {
    await window.ipcRenderer.gitSetRemote(instanceId, remoteUrl, token);
    showGitRemoteModal.value = false;
    alert(`✅ Git remote configured successfully!`);
    // Refresh git statuses in InstanceList
    instanceListRef.value?.fetchGitStatuses();
  } catch (err: any) {
    alert(`❌ Failed to configure Git remote: ${err.message}`);
    console.error('[git-set-remote] error', err.message);
  }
}

async function handleGitPull(instance: Instance, callback: (success: boolean) => void) {
  try {
    const result = await window.ipcRenderer.gitPull(instance.id);
    if (result.success) {
      alert(`✅ Git pull successful for ${instance.name}!`);
    }
    console.log('[git-pull] success', result.output);
    callback(result.success);
  } catch (err: any) {
    alert(`❌ Git pull failed: ${err.message}`);
    console.error('[git-pull] error', err.message);
    callback(false);
  }
}

async function handleGitPush(instance: Instance, callback: (success: boolean) => void) {
  try {
    const result = await window.ipcRenderer.gitPush(instance.id);
    if (result.success) {
      alert(`✅ Git push successful for ${instance.name}!`);
    }
    console.log('[git-push] success', result.output);
    callback(result.success);
  } catch (err: any) {
    alert(`❌ Git push failed: ${err.message}`);
    console.error('[git-push] error', err.message);
    callback(false);
  }
}
</script>

<template>
  <div class="h-screen flex flex-col bg-gradient-to-br from-base-300 via-base-200 to-base-300" data-theme="night">
    <!-- Header -->
    <header class="navbar bg-base-100/80 backdrop-blur-lg border-b border-base-content/10 shadow-lg p-6">
      <div class="flex justify-between w-full max-w-5xl mx-auto">
        <div class="flex flex-1 gap-3 ">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
            <img src="/src/assets/directus-logo.png" />
          </div>
          <div>
            <h1 class="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Directus Manager
            </h1>
            <p class="text-xs text-base-content/60">Manage your Directus instances</p>
          </div>
        </div>
        <div class="flex items-center">
          <AppButton 
            variant="primary" 
            @click="openAddModal"
          >
            <template #icon><Plus class="h-4 w-4" /></template>
            Add Instance
          </AppButton>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 p-6 overflow-y-auto">
      <div class="max-w-5xl mx-auto">
        <!-- Empty State -->
        <div v-if="instances.length === 0" class="flex flex-col items-center justify-center py-20">
          <div class="w-24 h-24 rounded-full bg-base-100 flex items-center justify-center mb-6 shadow-xl">
            <Database class="h-12 w-12 text-base-content/30" />
          </div>
          <h2 class="text-2xl font-bold mb-2">No Instances Yet</h2>
          <p class="text-base-content/60 mb-6 text-center max-w-md">Add your first Directus instance to start managing and syncing your content.</p>
          <AppButton variant="primary" @click="openAddModal">
            <template #icon><Plus class="h-5 w-5" /></template>
            Add Your First Instance
          </AppButton>
        </div>

        <!-- Instance List -->
        <InstanceList 
          v-else
          ref="instanceListRef"
          :instances="instances"
          :pushingId="pushingId"
          @edit="openEditModal" 
          @delete="handleDelete" 
          @pull="handlePull"
          @push="openPushModal"
          @open-folder="handleOpenFolder"
          @git-init="handleGitInit"
          @git-connect-remote="handleGitConnectRemote"
          @git-pull="handleGitPull"
          @git-push="handleGitPush"
        />
      </div>
    </main>

    <!-- Footer -->
    <footer class="py-3 px-6 bg-base-100/50 border-t border-base-content/5 text-center">
      <!-- DO NOT TOUCH THIS OR YOU WILL BREAK THE LICENSE AGREMENT AND BE LIABLE FOR THE CONSEQUENCES -->
      <div class="w-full justify-center  gap-2 items-center flex text-xs text-base-content/40">Directus Manager v0.1.0 • by <a class="text-white underline" href="https://www.ostojicstefan.com/en" target="_blank">Stefan Ostojic</a><a href="https://github.com/OSZII/DirectusManager" target="_blank"><Github /></a></div>
        <!-- YOU MAY ADD MODIFIED BY WITH YOUR NAME AND A LINK TO YOUR WEBSITE UNDER THIS COMMENT -->
    </footer>

    <!-- Add/Edit Modal -->
    <AddInstanceForm 
      :show="showModal" 
      :editingInstance="editingInstance" 
      @close="showModal = false" 
      @save="handleSave" 
    />

    <!-- Push Modal -->
    <PushInstanceForm
      :show="showPushModal"
      :targetInstance="pushTargetInstance"
      :instances="instances"
      @close="showPushModal = false"
      @confirm="handlePush"
    />

    <!-- Git Remote Modal -->
    <GitRemoteForm
      :show="showGitRemoteModal"
      :instance="gitRemoteTargetInstance"
      @close="showGitRemoteModal = false"
      @save="handleGitRemoteSave"
    />
  </div>
</template>
