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

          // Copy schema output to additional paths
          if (isSuccess && instance.additionalSchemaPaths?.length) {
            const entries = fs.readdirSync(instanceDir, { withFileTypes: true });
            for (const entry of entries) {
              if (entry.isDirectory() && entry.name !== '.git' && entry.name !== 'node_modules') {
                copyDirToAdditionalPaths(instanceDir, instance.additionalSchemaPaths, entry.name);
              }
            }
          }

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

  // Open external URL in default browser
  ipcMain.handle('open-external', async (_event, url: string) => {
    await shell.openExternal(url);
    return true;
  });

  // ========== SCHEMA HANDLER ==========

  ipcMain.handle('get-schema', async (_event, instanceId: string) => {
    const instances = loadConfig();
    const instance = instances.find((i: any) => i.id === instanceId);
    if (!instance) throw new Error('Instance not found');

    const instanceDir = getInstanceDir(instance);
    const snapshotDir = path.join(instanceDir, 'snapshot');

    if (!fs.existsSync(snapshotDir)) {
      throw new Error('No snapshot found. Pull the instance first.');
    }

    const collectionsDir = path.join(snapshotDir, 'collections');
    const fieldsDir = path.join(snapshotDir, 'fields');
    const relationsDir = path.join(snapshotDir, 'relations');

    // Read collections
    const collections: any[] = [];
    if (fs.existsSync(collectionsDir)) {
      for (const file of fs.readdirSync(collectionsDir)) {
        if (!file.endsWith('.json')) continue;
        const data = JSON.parse(fs.readFileSync(path.join(collectionsDir, file), 'utf-8'));
        collections.push(data);
      }
    }

    // Read fields grouped by collection
    const fieldsByCollection: Record<string, any[]> = {};
    if (fs.existsSync(fieldsDir)) {
      for (const collDir of fs.readdirSync(fieldsDir)) {
        const collFieldsPath = path.join(fieldsDir, collDir);
        if (!fs.statSync(collFieldsPath).isDirectory()) continue;
        fieldsByCollection[collDir] = [];
        for (const file of fs.readdirSync(collFieldsPath)) {
          if (!file.endsWith('.json')) continue;
          const data = JSON.parse(fs.readFileSync(path.join(collFieldsPath, file), 'utf-8'));
          fieldsByCollection[collDir].push(data);
        }
      }
    }

    // Read relations
    const relations: any[] = [];
    if (fs.existsSync(relationsDir)) {
      for (const collDir of fs.readdirSync(relationsDir)) {
        const collRelPath = path.join(relationsDir, collDir);
        if (!fs.statSync(collRelPath).isDirectory()) continue;
        for (const file of fs.readdirSync(collRelPath)) {
          if (!file.endsWith('.json')) continue;
          const data = JSON.parse(fs.readFileSync(path.join(collRelPath, file), 'utf-8'));
          relations.push(data);
        }
      }
    }

    // Determine which collections are junction tables
    const junctionCollections = new Set<string>();
    for (const rel of relations) {
      if (rel.meta?.junction_field) {
        junctionCollections.add(rel.collection);
      }
    }

    // Build collection names set for filtering relations
    const collectionNames = new Set(collections.map((c: any) => c.collection));

    // Normalize collections
    const normalizedCollections = collections.map((coll: any) => {
      const fields = (fieldsByCollection[coll.collection] || [])
        .sort((a: any, b: any) => (a.meta?.sort ?? 999) - (b.meta?.sort ?? 999))
        .map((f: any) => ({
          field: f.field,
          type: f.type || f.schema?.data_type || 'unknown',
          isPrimaryKey: f.schema?.is_primary_key || false,
          isForeignKey: !!(f.schema?.foreign_key_table),
          foreignKeyTable: f.schema?.foreign_key_table || undefined,
          isNullable: f.schema?.is_nullable ?? true,
          special: f.meta?.special || undefined,
        }));

      return {
        collection: coll.collection,
        fields,
        isJunction: junctionCollections.has(coll.collection),
      };
    });

    // Normalize relations — skip those pointing to system tables not in snapshot
    const normalizedRelations = relations
      .filter((rel: any) => {
        const related = rel.related_collection;
        // Keep if related collection is in our snapshot, skip directus_* system tables not in snapshot
        return collectionNames.has(related);
      })
      .map((rel: any) => {
        let type: 'M2O' | 'O2M' | 'M2M' = 'M2O';
        if (rel.meta?.junction_field) {
          type = 'M2M';
        } else if (rel.meta?.one_field) {
          type = 'O2M';
        }
        return {
          collection: rel.collection,
          field: rel.field,
          relatedCollection: rel.related_collection,
          relatedField: rel.meta?.one_field || undefined,
          type,
          junctionField: rel.meta?.junction_field || undefined,
        };
      });

    return {
      collections: normalizedCollections,
      relations: normalizedRelations,
    };
  });

  // ========== TYPESCRIPT TYPES HANDLER ==========

  function getTypesOutputDir(instance: any): string {
    if (instance.customTypesPath) {
      return instance.customTypesPath;
    }
    return getInstanceDir(instance);
  }

  // Copy a subdirectory from sourceDir to each additional path (best-effort)
  function copyDirToAdditionalPaths(sourceDir: string, additionalPaths: string[], subDir: string) {
    const src = path.join(sourceDir, subDir);
    if (!fs.existsSync(src)) return;
    for (const destBase of additionalPaths) {
      if (!destBase) continue;
      try {
        const dest = path.join(destBase, subDir);
        if (!fs.existsSync(destBase)) fs.mkdirSync(destBase, { recursive: true });
        fs.cpSync(src, dest, { recursive: true, force: true });
      } catch (err) {
        console.error(`Failed to copy ${subDir} to ${destBase}:`, err);
      }
    }
  }

  // Copy a single file to each additional path (best-effort)
  function copyFileToAdditionalPaths(sourceFile: string, additionalPaths: string[], fileName: string) {
    if (!fs.existsSync(sourceFile)) return;
    for (const destBase of additionalPaths) {
      if (!destBase) continue;
      try {
        if (!fs.existsSync(destBase)) fs.mkdirSync(destBase, { recursive: true });
        fs.copyFileSync(sourceFile, path.join(destBase, fileName));
      } catch (err) {
        console.error(`Failed to copy ${fileName} to ${destBase}:`, err);
      }
    }
  }

  ipcMain.handle('pull-types', async (_event, instanceId: string) => {
    const instances = loadConfig();
    const instance = instances.find((i: any) => i.id === instanceId);
    if (!instance) throw new Error('Instance not found');

    // Decrypt token
    let token = instance.token;
    if (instance.encryptedToken && safeStorage.isEncryptionAvailable()) {
      token = safeStorage.decryptString(Buffer.from(instance.encryptedToken, 'base64'));
    }
    if (!token) throw new Error('No access token configured for this instance');

    // Fetch OpenAPI spec
    const url = instance.url.replace(/\/+$/, '');
    const response = await fetch(`${url}/server/specs/oas`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
    }

    const spec = await response.text();

    // Save spec to temp file
    const outputDir = getTypesOutputDir(instance);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const tempFile = path.join(outputDir, '_directus-oas-temp.json');
    const outputFile = path.join(outputDir, 'directus-types.d.ts');

    fs.writeFileSync(tempFile, spec);

    // Run openapi-typescript
    const { exec } = await import('child_process');
    return new Promise((resolve, reject) => {
      exec(`npx openapi-typescript "${tempFile}" -o "${outputFile}"`, { cwd: outputDir }, (error, _stdout, stderr) => {
        // Clean up temp file
        try { fs.unlinkSync(tempFile); } catch {}

        if (error) {
          reject(new Error(stderr || error.message));
        } else {
          // Copy types file to additional paths
          if (instance.additionalTypesPaths?.length) {
            copyFileToAdditionalPaths(outputFile, instance.additionalTypesPaths, 'directus-types.d.ts');
          }
          resolve({ success: true, output: `Types generated at ${outputFile}` });
        }
      });
    });
  });

  // ========== API EXPLORER HANDLERS ==========

  ipcMain.handle('fetch-openapi-spec', async (_event, instanceId: string) => {
    const instances = loadConfig();
    const instance = instances.find((i: any) => i.id === instanceId);
    if (!instance) throw new Error('Instance not found');

    let token = instance.token;
    if (instance.encryptedToken && safeStorage.isEncryptionAvailable()) {
      token = safeStorage.decryptString(Buffer.from(instance.encryptedToken, 'base64'));
    }
    if (!token) throw new Error('No access token configured for this instance');

    const url = instance.url.replace(/\/+$/, '');
    const response = await fetch(`${url}/server/specs/oas`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  });

  ipcMain.handle('api-request', async (_event, instanceId: string, method: string, urlPath: string, queryParams?: Record<string, string>, body?: any) => {
    const instances = loadConfig();
    const instance = instances.find((i: any) => i.id === instanceId);
    if (!instance) throw new Error('Instance not found');

    let token = instance.token;
    if (instance.encryptedToken && safeStorage.isEncryptionAvailable()) {
      token = safeStorage.decryptString(Buffer.from(instance.encryptedToken, 'base64'));
    }
    if (!token) throw new Error('No access token configured for this instance');

    const baseUrl = instance.url.replace(/\/+$/, '');
    const requestUrl = new URL(`${baseUrl}${urlPath}`);

    if (queryParams) {
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined && value !== '') {
          requestUrl.searchParams.set(key, value);
        }
      }
    }

    const startTime = Date.now();

    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    if (body !== undefined && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(requestUrl.toString(), fetchOptions);
    const elapsed = Date.now() - startTime;

    const contentType = response.headers.get('content-type') || '';
    let responseBody: any;

    if (contentType.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseBody,
      elapsed,
      url: requestUrl.toString()
    };
  });

  // ========== FOLDER SELECTION HANDLERS ==========

  ipcMain.handle('select-schema-folder', async () => {
    const result = await dialog.showOpenDialog(win!, {
      properties: ['openDirectory', 'createDirectory']
    });
    return result.filePaths[0] || null;
  });

  ipcMain.handle('select-types-folder', async () => {
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
    icon: path.join(process.env.VITE_PUBLIC, 'logo.png'),
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
  // Set dock icon on macOS
  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(path.join(process.env.VITE_PUBLIC, 'logo.png'));
  }
  registerIpcHandlers();
  createWindow();
})
