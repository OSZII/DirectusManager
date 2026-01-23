import { app, BrowserWindow, ipcMain, safeStorage, shell } from 'electron'
import { fileURLToPath } from 'node:url'
import * as path from 'node:path'
import * as fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

console.log(app.getPath('userData'));


const CONFIG_PATH = path.join(app.getPath('userData'), 'instances.json');

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return [];
  }
  try {
    const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load config', e);
    return [];
  }
}

function saveConfig(instances: any[]) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(instances, null, 2));
}

function registerIpcHandlers() {
  ipcMain.handle('get-instances', async () => {
    const instances = loadConfig();
    if (!safeStorage.isEncryptionAvailable()) {
      return instances; // Return as-is if encryption not available (dev/linux sometimes)
    }

    return instances.map((inst: any) => {
      if (inst.encryptedToken) {
        try {
          const buffer = Buffer.from(inst.encryptedToken, 'base64');
          inst.token = safeStorage.decryptString(buffer);
        } catch (e) {
          console.error('Failed to decrypt token', e);
          inst.token = '';
        }
      }
      return inst;
    });
  });

  ipcMain.handle('save-instance', async (_event, instance) => {
    const instances = loadConfig();

    // Encrypt token
    if (instance.token && safeStorage.isEncryptionAvailable()) {
      const buffer = safeStorage.encryptString(instance.token);
      instance.encryptedToken = buffer.toString('base64');
      delete instance.token; // Don't save plain token
    } else if (instance.token) {
      console.warn('SafeStorage not available, saving token in plain text');
    }

    // Check if updating or adding
    const existingIndex = instances.findIndex((i: any) => i.id === instance.id);
    if (existingIndex >= 0) {
      instances[existingIndex] = { ...instances[existingIndex], ...instance };
    } else {
      if (!instance.id) instance.id = Date.now().toString(); // Simple ID gen
      instances.push(instance);
    }

    saveConfig(instances);
    return true;
  });

  ipcMain.handle('delete-instance', async (_event, id) => {
    let instances = loadConfig();
    instances = instances.filter((i: any) => i.id !== id);
    saveConfig(instances);
    return true;
  });

  // Helper to get instance-specific directory
  function getInstanceDir(instanceName: string): string {
    const folderName = instanceName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return path.join(app.getPath('userData'), folderName);
  }

  // Pull instance config from Directus to local folder
  ipcMain.handle('pull-instance', async (_event, instanceId: string) => {
    const instances = loadConfig();
    const instance = instances.find((i: any) => i.id === instanceId);
    if (!instance) throw new Error('Instance not found');

    // Decrypt token
    let token = instance.token;
    if (instance.encryptedToken && safeStorage.isEncryptionAvailable()) {
      token = safeStorage.decryptString(Buffer.from(instance.encryptedToken, 'base64'));
    }

    // Create instance folder
    const instanceDir = getInstanceDir(instance.name);
    if (!fs.existsSync(instanceDir)) fs.mkdirSync(instanceDir, { recursive: true });

    // Write config file
    const configContent = `module.exports = {
  directusUrl: '${instance.url}',
  directusToken: '${token}',
  dumpPath: './'
};`;
    fs.writeFileSync(path.join(instanceDir, 'directus-sync.config.js'), configContent);

    // Execute pull command
    const { exec } = await import('child_process');
    return new Promise((resolve, reject) => {
      exec('npx directus-sync pull', { cwd: instanceDir }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
        } else {
          // Check if output contains "Done!" to determine success
          const isSuccess = stdout.includes('Done!');
          resolve({ success: isSuccess, output: stdout });
        }
      });
    });
  });

  // Push config from source folder to destination Directus
  ipcMain.handle('push-instance', async (_event, sourceInstanceId: string, destInstanceId: string) => {
    const instances = loadConfig();
    const sourceInstance = instances.find((i: any) => i.id === sourceInstanceId);
    const destInstance = instances.find((i: any) => i.id === destInstanceId);

    if (!sourceInstance) throw new Error('Source instance not found');
    if (!destInstance) throw new Error('Destination instance not found');

    // Decrypt destination token
    let destToken = destInstance.token;
    if (destInstance.encryptedToken && safeStorage.isEncryptionAvailable()) {
      destToken = safeStorage.decryptString(Buffer.from(destInstance.encryptedToken, 'base64'));
    }

    // Get source folder (must have been pulled already)
    const sourceDir = getInstanceDir(sourceInstance.name);
    if (!fs.existsSync(sourceDir)) throw new Error('Source instance has not been pulled yet');

    // Write config with DESTINATION credentials but use SOURCE folder
    const configContent = `module.exports = {
  directusUrl: '${destInstance.url}',
  directusToken: '${destToken}',
  dumpPath: './'
};`;
    fs.writeFileSync(path.join(sourceDir, 'directus-sync.config.js'), configContent);

    // Execute push command from source folder
    const { exec } = await import('child_process');
    return new Promise((resolve, reject) => {
      exec('npx directus-sync push', { cwd: sourceDir }, (error, stdout, stderr) => {
        if (error) reject(new Error(stderr || error.message));
        else resolve({ success: true, output: stdout });
      });
    });
  });

  // Open instance folder in file explorer
  ipcMain.handle('open-folder', async (_event, instanceId: string) => {
    const instances = loadConfig();
    const instance = instances.find((i: any) => i.id === instanceId);
    if (!instance) throw new Error('Instance not found');

    const instanceDir = getInstanceDir(instance.name);
    if (!fs.existsSync(instanceDir)) {
      // Create the folder if it doesn't exist
      fs.mkdirSync(instanceDir, { recursive: true });
    }

    await shell.openPath(instanceDir);
    return true;
  });
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();
})
