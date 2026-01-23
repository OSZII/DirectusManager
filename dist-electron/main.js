import { app, BrowserWindow, ipcMain, safeStorage, shell } from "electron";
import { fileURLToPath } from "node:url";
import * as path from "node:path";
import * as fs from "node:fs";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
console.log(app.getPath("userData"));
const CONFIG_PATH = path.join(app.getPath("userData"), "instances.json");
function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return [];
  }
  try {
    const data = fs.readFileSync(CONFIG_PATH, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to load config", e);
    return [];
  }
}
function saveConfig(instances) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(instances, null, 2));
}
function registerIpcHandlers() {
  ipcMain.handle("get-instances", async () => {
    const instances = loadConfig();
    if (!safeStorage.isEncryptionAvailable()) {
      return instances;
    }
    return instances.map((inst) => {
      if (inst.encryptedToken) {
        try {
          const buffer = Buffer.from(inst.encryptedToken, "base64");
          inst.token = safeStorage.decryptString(buffer);
        } catch (e) {
          console.error("Failed to decrypt token", e);
          inst.token = "";
        }
      }
      return inst;
    });
  });
  ipcMain.handle("save-instance", async (_event, instance) => {
    const instances = loadConfig();
    if (instance.token && safeStorage.isEncryptionAvailable()) {
      const buffer = safeStorage.encryptString(instance.token);
      instance.encryptedToken = buffer.toString("base64");
      delete instance.token;
    } else if (instance.token) {
      console.warn("SafeStorage not available, saving token in plain text");
    }
    const existingIndex = instances.findIndex((i) => i.id === instance.id);
    if (existingIndex >= 0) {
      instances[existingIndex] = { ...instances[existingIndex], ...instance };
    } else {
      if (!instance.id) instance.id = Date.now().toString();
      instances.push(instance);
    }
    saveConfig(instances);
    return true;
  });
  ipcMain.handle("delete-instance", async (_event, id) => {
    let instances = loadConfig();
    instances = instances.filter((i) => i.id !== id);
    saveConfig(instances);
    return true;
  });
  function getInstanceDir(instanceName) {
    const folderName = instanceName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    return path.join(app.getPath("userData"), folderName);
  }
  ipcMain.handle("pull-instance", async (_event, instanceId) => {
    const instances = loadConfig();
    const instance = instances.find((i) => i.id === instanceId);
    if (!instance) throw new Error("Instance not found");
    let token = instance.token;
    if (instance.encryptedToken && safeStorage.isEncryptionAvailable()) {
      token = safeStorage.decryptString(Buffer.from(instance.encryptedToken, "base64"));
    }
    const instanceDir = getInstanceDir(instance.name);
    if (!fs.existsSync(instanceDir)) fs.mkdirSync(instanceDir, { recursive: true });
    const configContent = `module.exports = {
  directusUrl: '${instance.url}',
  directusToken: '${token}',
  dumpPath: './'
};`;
    fs.writeFileSync(path.join(instanceDir, "directus-sync.config.js"), configContent);
    const { exec } = await import("child_process");
    return new Promise((resolve, reject) => {
      exec("npx directus-sync pull", { cwd: instanceDir }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
        } else {
          const isSuccess = stdout.includes("Done!");
          resolve({ success: isSuccess, output: stdout });
        }
      });
    });
  });
  ipcMain.handle("push-instance", async (_event, sourceInstanceId, destInstanceId) => {
    const instances = loadConfig();
    const sourceInstance = instances.find((i) => i.id === sourceInstanceId);
    const destInstance = instances.find((i) => i.id === destInstanceId);
    if (!sourceInstance) throw new Error("Source instance not found");
    if (!destInstance) throw new Error("Destination instance not found");
    let destToken = destInstance.token;
    if (destInstance.encryptedToken && safeStorage.isEncryptionAvailable()) {
      destToken = safeStorage.decryptString(Buffer.from(destInstance.encryptedToken, "base64"));
    }
    const sourceDir = getInstanceDir(sourceInstance.name);
    if (!fs.existsSync(sourceDir)) throw new Error("Source instance has not been pulled yet");
    const configContent = `module.exports = {
  directusUrl: '${destInstance.url}',
  directusToken: '${destToken}',
  dumpPath: './'
};`;
    fs.writeFileSync(path.join(sourceDir, "directus-sync.config.js"), configContent);
    const { exec } = await import("child_process");
    return new Promise((resolve, reject) => {
      exec("npx directus-sync push", { cwd: sourceDir }, (error, stdout, stderr) => {
        if (error) reject(new Error(stderr || error.message));
        else resolve({ success: true, output: stdout });
      });
    });
  });
  ipcMain.handle("open-folder", async (_event, instanceId) => {
    const instances = loadConfig();
    const instance = instances.find((i) => i.id === instanceId);
    if (!instance) throw new Error("Instance not found");
    const instanceDir = getInstanceDir(instance.name);
    if (!fs.existsSync(instanceDir)) {
      fs.mkdirSync(instanceDir, { recursive: true });
    }
    await shell.openPath(instanceDir);
    return true;
  });
}
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
