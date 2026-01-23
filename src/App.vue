<script setup lang="ts">
import { ref, onMounted } from 'vue'
import InstanceList from './components/InstanceList.vue'
import InstanceForm from './components/InstanceForm.vue'
import { Instance } from './vite-env'
import { Server, Plus, Database } from 'lucide-vue-next'

const instances = ref<Instance[]>([])
const showModal = ref(false)
const editingInstance = ref<Instance | null>(null)

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
</script>

<template>
  <div class="h-screen flex flex-col bg-gradient-to-br from-base-300 via-base-200 to-base-300" data-theme="night">
    <!-- Header -->
    <header class="navbar bg-base-100/80 backdrop-blur-lg border-b border-base-content/10 shadow-lg">
      <div class="flex-1 gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
          <Server class="h-6 w-6 text-primary-content" />
        </div>
        <div>
          <h1 class="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Directus Manager
          </h1>
          <p class="text-xs text-base-content/60">Manage your Directus instances</p>
        </div>
      </div>
      <div class="flex-none">
        <button class="btn btn-primary btn-sm gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all" @click="openAddModal">
          <Plus class="h-4 w-4" />
          Add Instance
        </button>
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
          <button class="btn btn-primary gap-2" @click="openAddModal">
            <Plus class="h-5 w-5" />
            Add Your First Instance
          </button>
        </div>

        <!-- Instance List -->
        <InstanceList 
          v-else
          :instances="instances" 
          @edit="openEditModal" 
          @delete="handleDelete" 
          @pull="handlePull"
          @open-folder="handleOpenFolder"
        />
      </div>
    </main>

    <!-- Footer -->
    <footer class="py-3 px-6 bg-base-100/50 border-t border-base-content/5 text-center">
      <p class="text-xs text-base-content/40">Directus Manager v0.1.0 • Built with Electron + Vue</p>
    </footer>

    <!-- Modal -->
    <InstanceForm 
      :show="showModal" 
      :editingInstance="editingInstance" 
      @close="showModal = false" 
      @save="handleSave" 
    />
  </div>
</template>
