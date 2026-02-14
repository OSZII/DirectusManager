# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Directus Manager is an Electron + Vue desktop application for managing Directus CMS instances. It allows users to pull/push configurations between Directus instances using directus-sync, manage multiple instances, and version control their schemas using Git.

## Tech Stack

- **Framework**: Vue 3 (Composition API with `<script setup>`)
- **Desktop**: Electron
- **Build Tool**: Vite with vite-plugin-electron
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS v4 + DaisyUI (theme: "night")
- **Icons**: lucide-vue-next
- **Git Operations**: simple-git library
- **External Tool**: directus-sync (executed via child_process)

## Development Commands

```bash
# Start development server
npm run dev

# Build application (TypeScript check + Vite build + Electron Builder)
npm run build

# Type check without emitting files
npm run type-check

# Preview production build
npm run preview
```

## Architecture

### Main Process (`electron/main.ts`)
The Electron main process handles:
- **Instance Management**: Stores instance configs in `userData/instances.json`
- **Security**: Encrypts tokens using Electron's `safeStorage` API
- **IPC Handlers**: All backend operations (get-instances, save-instance, pull-instance, push-instance, etc.)
- **Directus Sync**: Executes `npx directus-sync pull/push` in instance-specific directories
- **Git Operations**: Uses simple-git for init, remote management, pull/push operations
- **File System**: Creates instance folders in `userData` directory or custom paths

**Key Functions**:
- `loadConfig()` / `saveConfig()`: Manages instances.json persistence
- `getInstanceDir()`: Returns instance-specific directory (custom or auto-generated)
- `findGitRoot()`: Walks up directory tree to find .git folder
- `registerIpcHandlers()`: Registers all IPC communication channels

### Renderer Process (`src/`)
Vue application structure:
- **App.vue**: Main application component with instance list and modals
- **components/**:
  - `InstanceList.vue`: Displays all instances with actions
  - `AddInstanceForm.vue`: Modal for adding/editing instances
  - `PushInstanceForm.vue`: Modal for pushing configs between instances
  - `GitRemoteForm.vue`: Modal for configuring Git remote
  - `PullButton.vue` / `PushButton.vue`: Action buttons with loading states
  - `AppButton.vue` / `AppModal.vue`: Reusable UI components

### Preload Script (`electron/preload.ts`)
- Uses `contextBridge` to expose IPC API to renderer
- Type definitions in `src/vite-env.d.ts` define the API contract
- Provides type-safe communication between main and renderer processes

### Type Definitions (`src/vite-env.d.ts`)
Defines core interfaces:
- `Instance`: Instance configuration with encrypted tokens
- `GitStatus`: Git repository status information
- `IpcRendererApi`: Complete IPC API surface accessible via `window.ipcRenderer`

## Data Storage

**Instance Configuration** (`userData/instances.json`):
- Stores instance metadata (id, name, url)
- Tokens are encrypted using Electron's safeStorage
- Git credentials stored with encryption when available
- Custom schema paths can override default storage location

**Instance Directories**:
- Default: `userData/<sanitized-instance-name>/`
- Custom: User-selected folder via dialog
- Contains: directus-sync config, pulled schemas, .git folder (if initialized)

## Git Integration

The app can initialize Git repos in instance folders and manage remotes:
- **Git Init**: Checks for existing Git in folder or parent directories before initializing
- **Remote Management**: Injects personal access tokens into HTTPS URLs for authentication
- **Operations**: Pull/push with automatic token injection and upstream tracking
- Git root detection supports both instance-level and parent-level repositories

## Directus Sync Integration

- Creates `directus-sync.config.js` in instance directory
- Config contains: `directusUrl`, `directusToken`, `dumpPath`
- **Pull**: Downloads schema from Directus instance to local folder
- **Push**: Uploads schema from source instance folder to destination instance

## Build Configuration

- **vite.config.ts**: Configures Vue plugin and electron plugin (main + preload + renderer)
- **electron-builder.json5**: Build settings for Mac (DMG), Windows (NSIS), Linux (AppImage)
- **tsconfig.json**: Strict TypeScript with ES2020 target
- Main entry: `dist-electron/main.js` (built from `electron/main.ts`)

## Important License Requirements

**CRITICAL**: This project has a custom license with mandatory attribution:
- The footer in `App.vue` (lines 237-241) **MUST remain visible and functional**
- Footer contains links to author's portfolio and GitHub repository
- Cannot be hidden, obscured, or removed (see LICENSE.md)
- Modifications can add "Modified by [Name]" but cannot alter original attribution

When editing the UI:
- Do not modify or remove the footer element
- Do not apply CSS that hides it (`display: none`, `opacity: 0`, etc.)
- Preserve all links and the GitHub icon

## Code Patterns

**Vue Components**:
- Use `<script setup lang="ts">` syntax
- Composition API with `ref()` for reactive state
- Props and emits are type-safe
- Components use DaisyUI classes with Tailwind utilities

**IPC Communication**:
- Renderer calls `window.ipcRenderer.<method>()`
- Main process handlers registered via `ipcMain.handle()`
- All IPC calls are async and return Promises
- Errors propagate as rejections

**Error Handling**:
- Main process throws errors which are caught in renderer
- Renderer displays alerts for user feedback
- Console logging for debugging (`console.log`, `console.error`)

## Common Tasks

**Adding a new IPC handler**:
1. Add handler in `electron/main.ts` via `ipcMain.handle()`
2. Expose in `electron/preload.ts` via contextBridge
3. Add type definition in `src/vite-env.d.ts` IpcRendererApi interface
4. Call from renderer via `window.ipcRenderer.<method>()`

**Adding a new instance property**:
1. Update `Instance` interface in `src/vite-env.d.ts`
2. Update `saveInstance` handler in `electron/main.ts` to handle encryption if needed
3. Update `AddInstanceForm.vue` to include new field
4. Update `loadConfig()` / `saveConfig()` if special handling needed

**Styling**:
- Use Tailwind v4 syntax (no `@apply`, use utility classes directly)
- DaisyUI theme is "night" (set via `data-theme="night"`)
- Prefer gradient backgrounds and backdrop-blur for modern look
- Component variants use DaisyUI component classes (btn, card, modal, etc.)
