import { app, BrowserWindow, ipcMain, safeStorage, shell, dialog } from 'electron'
import { fileURLToPath } from 'node:url'
import * as path from 'node:path'
import * as fs from 'node:fs'
import simpleGit, { SimpleGit } from 'simple-git'

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
  function getInstanceDir(instance: any): string {
    if (instance.customSchemaPath) {
      return instance.customSchemaPath;
    }
    const folderName = instance.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
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
    const instanceDir = getInstanceDir(instance);
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
    const sourceDir = getInstanceDir(sourceInstance);
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

    const instanceDir = getInstanceDir(instance);
    if (!fs.existsSync(instanceDir)) {
      // Create the folder if it doesn't exist
      fs.mkdirSync(instanceDir, { recursive: true });
    }

    await shell.openPath(instanceDir);
    return true;
  });

  // ========== FOLDER SELECTION HANDLER ==========

  ipcMain.handle('select-schema-folder', async () => {
    const result = await dialog.showOpenDialog(win!, {
      properties: ['openDirectory', 'createDirectory']
    });
    return result.filePaths[0] || null;
  });

  // ========== GIT HANDLERS ==========

  // Helper to get git instance for a directory
  function getGitForInstance(instance: any): SimpleGit {
    const instanceDir = getInstanceDir(instance);
    if (!fs.existsSync(instanceDir)) {
      fs.mkdirSync(instanceDir, { recursive: true });
    }
    return simpleGit(instanceDir);
  }

  // Helper to decrypt git token from instance
  function decryptGitToken(instance: any): string {
    if (instance.encryptedGitToken && safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(Buffer.from(instance.encryptedGitToken, 'base64'));
    }
    return instance.gitToken || '';
  }

  // Helper to build authenticated remote URL
  function buildAuthUrl(remoteUrl: string, token: string): string {
    if (!token) return remoteUrl;
    // Convert https://github.com/user/repo.git to https://token@github.com/user/repo.git
    const url = new URL(remoteUrl);
    url.username = token;
    return url.toString();
  }

  // Helper to find git root in current dir or any parent directory
  function findGitRoot(startDir: string): string | null {
    let currentDir = startDir;
    const root = path.parse(currentDir).root;

    while (currentDir !== root) {
      const gitDir = path.join(currentDir, '.git');
      if (fs.existsSync(gitDir)) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }

    // Check root as well
    const rootGitDir = path.join(root, '.git');
    if (fs.existsSync(rootGitDir)) {
      return root;
    }

    return null;
  }

  // Get git status for an instance
  ipcMain.handle('git-status', async (_event, instanceId: string) => {
    const instances = loadConfig();
    const instance = instances.find((i: any) => i.id === instanceId);
    if (!instance) throw new Error('Instance not found');

    const instanceDir = getInstanceDir(instance);

    // Check if directory exists
    if (!fs.existsSync(instanceDir)) {
      return { initialized: false, hasRemote: false, changesCount: 0 };
    }

    // Check if a git repo exists in this folder or any parent
    const gitRoot = findGitRoot(instanceDir);
    if (!gitRoot) {
      return { initialized: false, hasRemote: false, changesCount: 0 };
    }

    const git = simpleGit(gitRoot);

    try {
      // Get remotes
      const remotes = await git.getRemotes(true);
      const origin = remotes.find(r => r.name === 'origin');

      // Get status for changes count
      const status = await git.status();
      const changesCount = status.files.length;

      // Get current branch
      const branchSummary = await git.branch();

      return {
        initialized: true,
        hasRemote: !!origin,
        remoteUrl: origin?.refs?.fetch || instance.gitRemoteUrl || '',
        currentBranch: branchSummary.current || 'main',
        changesCount,
        gitRoot: gitRoot !== instanceDir ? gitRoot : undefined // Include if git root is a parent
      };
    } catch (e) {
      console.error('Git status error:', e);
      return { initialized: false, hasRemote: false, changesCount: 0 };
    }
  });

  // Initialize git repo in instance folder
  ipcMain.handle('git-init', async (_event, instanceId: string) => {
    const instances = loadConfig();
    const instance = instances.find((i: any) => i.id === instanceId);
    if (!instance) throw new Error('Instance not found');

    const instanceDir = getInstanceDir(instance);

    // Ensure directory exists
    if (!fs.existsSync(instanceDir)) {
      fs.mkdirSync(instanceDir, { recursive: true });
    }

    // Check if a git repo already exists in the folder or any parent
    const existingGitRoot = findGitRoot(instanceDir);
    if (existingGitRoot) {
      return {
        success: true,
        alreadyExists: true,
        gitRoot: existingGitRoot
      };
    }

    // No existing repo found, initialize a new one
    const git = simpleGit(instanceDir);
    await git.init();

    // Create initial commit if no commits exist
    try {
      await git.log();
    } catch {
      // No commits yet, create initial commit
      const gitignorePath = path.join(instanceDir, '.gitignore');
      if (!fs.existsSync(gitignorePath)) {
        fs.writeFileSync(gitignorePath, 'node_modules/\n.DS_Store\n');
      }
      await git.add('.gitignore');
      await git.commit('Initial commit');
    }

    return { success: true, alreadyExists: false };
  });

  // Set remote origin with token
  ipcMain.handle('git-set-remote', async (_event, instanceId: string, remoteUrl: string, token: string) => {
    const instances = loadConfig();
    const instanceIndex = instances.findIndex((i: any) => i.id === instanceId);
    if (instanceIndex < 0) throw new Error('Instance not found');

    const instance = instances[instanceIndex];
    const git = getGitForInstance(instance);

    // Encrypt and save token
    if (token && safeStorage.isEncryptionAvailable()) {
      instance.encryptedGitToken = safeStorage.encryptString(token).toString('base64');
    } else if (token) {
      instance.gitToken = token; // Fallback if encryption unavailable
    }
    instance.gitRemoteUrl = remoteUrl;

    // Save to config
    instances[instanceIndex] = instance;
    saveConfig(instances);

    // Build authenticated URL
    const authUrl = buildAuthUrl(remoteUrl, token);

    // Check if origin exists and update/add
    const remotes = await git.getRemotes();
    if (remotes.find(r => r.name === 'origin')) {
      await git.remote(['set-url', 'origin', authUrl]);
    } else {
      await git.addRemote('origin', authUrl);
    }

    return { success: true };
  });

  // Git pull
  ipcMain.handle('git-pull', async (_event, instanceId: string) => {
    const instances = loadConfig();
    const instance = instances.find((i: any) => i.id === instanceId);
    if (!instance) throw new Error('Instance not found');

    const git = getGitForInstance(instance);

    // Update remote URL with token for authentication
    const token = decryptGitToken(instance);
    if (instance.gitRemoteUrl && token) {
      const authUrl = buildAuthUrl(instance.gitRemoteUrl, token);
      await git.remote(['set-url', 'origin', authUrl]);
    }

    try {
      // Get current branch
      const branchSummary = await git.branch();
      const currentBranch = branchSummary.current || 'main';

      const result = await git.pull('origin', currentBranch);
      return { success: true, output: JSON.stringify(result) };
    } catch (e: any) {
      throw new Error(e.message || 'Git pull failed');
    }
  });

  // Git push (stage all, commit, push)
  ipcMain.handle('git-push', async (_event, instanceId: string, commitMessage?: string) => {
    const instances = loadConfig();
    const instance = instances.find((i: any) => i.id === instanceId);
    if (!instance) throw new Error('Instance not found');

    const git = getGitForInstance(instance);

    // Update remote URL with token for authentication
    const token = decryptGitToken(instance);
    if (instance.gitRemoteUrl && token) {
      const authUrl = buildAuthUrl(instance.gitRemoteUrl, token);
      await git.remote(['set-url', 'origin', authUrl]);
    }

    try {
      // Stage all changes
      await git.add('.');

      // Check if there are changes to commit
      const status = await git.status();
      if (status.files.length > 0) {
        const message = commitMessage || `Update: ${new Date().toISOString()}`;
        await git.commit(message);
      }

      // Get current branch
      const branchSummary = await git.branch();
      const currentBranch = branchSummary.current || 'main';

      // Push with upstream tracking
      await git.push('origin', currentBranch, ['--set-upstream']);

      return { success: true, output: 'Push completed successfully' };
    } catch (e: any) {
      throw new Error(e.message || 'Git push failed');
    }
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
