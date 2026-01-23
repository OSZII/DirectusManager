import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // Instance Management API
  getInstances: () => ipcRenderer.invoke('get-instances'),
  saveInstance: (instance: any) => ipcRenderer.invoke('save-instance', instance),
  deleteInstance: (id: string) => ipcRenderer.invoke('delete-instance', id),
  pullInstance: (id: string) => ipcRenderer.invoke('pull-instance', id),
  pushInstance: (sourceId: string, destId: string) => ipcRenderer.invoke('push-instance', sourceId, destId),
  openFolder: (id: string) => ipcRenderer.invoke('open-folder', id),

  // Git API
  gitStatus: (id: string) => ipcRenderer.invoke('git-status', id),
  gitInit: (id: string) => ipcRenderer.invoke('git-init', id),
  gitSetRemote: (id: string, remoteUrl: string, token: string) => ipcRenderer.invoke('git-set-remote', id, remoteUrl, token),
  gitPull: (id: string) => ipcRenderer.invoke('git-pull', id),
  gitPush: (id: string, commitMessage?: string) => ipcRenderer.invoke('git-push', id, commitMessage),
})
