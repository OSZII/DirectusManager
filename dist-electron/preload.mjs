"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  },
  // Instance Management API
  getInstances: () => electron.ipcRenderer.invoke("get-instances"),
  saveInstance: (instance) => electron.ipcRenderer.invoke("save-instance", instance),
  deleteInstance: (id) => electron.ipcRenderer.invoke("delete-instance", id),
  pullInstance: (id) => electron.ipcRenderer.invoke("pull-instance", id),
  pushInstance: (sourceId, destId) => electron.ipcRenderer.invoke("push-instance", sourceId, destId),
  openFolder: (id) => electron.ipcRenderer.invoke("open-folder", id),
  // Git API
  gitStatus: (id) => electron.ipcRenderer.invoke("git-status", id),
  gitInit: (id) => electron.ipcRenderer.invoke("git-init", id),
  gitSetRemote: (id, remoteUrl, token) => electron.ipcRenderer.invoke("git-set-remote", id, remoteUrl, token),
  gitPull: (id) => electron.ipcRenderer.invoke("git-pull", id),
  gitPush: (id, commitMessage) => electron.ipcRenderer.invoke("git-push", id, commitMessage)
});
