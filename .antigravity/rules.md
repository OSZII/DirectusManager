# Directus Manager - Project Documentation

This document provides a comprehensive overview of the Directus Manager project to assist AI models in understanding and contributing to the codebase.

## Project Overview
Directus Manager is a desktop application built with **Electron** and **Vue 3** designed to manage multiple Directus instances. Its primary goal is to simplify the process of syncing configurations between instances (Pull/Push) and managing them via Git.

## Tech Stack
- **Frontend**: Vue 3 (Composition API), Vite, TypeScript.
- **Styling**: Tailwind CSS 4, DaisyUI 5 (Dark theme: `night`).
- **Icons**: Lucide Vue Next.
- **Desktop Framework**: Electron.
- **Tools**:
  - `directus-sync`: Used for pulling and pushing Directus configurations.
  - `simple-git`: Used for Git operations (Init, Push, Pull, Status).
  - `electron-vite`: Integration for Vite and Electron.

## Project Structure
- `electron/`: Main process logic.
  - `main.ts`: IPC handlers for configuration management, Directus sync, and Git operations.
  - `preload.ts`: Bridge between main and renderer processes.
- `src/`: Renderer process (Vue application).
  - `App.vue`: Main layout and modal management.
  - `components/`: UI components.
    - `InstanceList.vue`: Displays the list of instances and their status (Git/Directus).
    - `AddInstanceForm.vue`: Form for adding/editing instances.
    - `PushInstanceForm.vue`: Form for syncing configurations between instances.
    - `GitRemoteForm.vue`: Form for configuring Git remotes.
    - `AppButton.vue`, `AppModal.vue`: Base UI components.
  - `assets/`: Images and static assets (Directus/Git logos).
- `instances.json`: (Located in `userData` directory) Stores the list of managed instances.

## Core Logic & Functionalities

### 1. Instance Management
Instances are stored in `instances.json`. Sensitive tokens are encrypted using Electron's `safeStorage`.
- **Fields**: `id`, `name`, `url`, `token`, `gitRemoteUrl`, `gitToken`, `encryptedToken`, `encryptedGitToken`, `customSchemaPath`.

### 2. Directus Sync Operations
Uses `npx directus-sync` under the hood. For each instance, a directory is created. By default, this is in a subfolder of the app's `userData` folder, but users can specify a **custom path**.
- **Default Path**: `userData/[instance_name_slug]`
- **Custom Path**: User-selected directory (stored in `customSchemaPath`).
- **Pull**: Fetches the Directus configuration and stores it in the local instance folder.
- **Push**: Takes the local configuration from a source instance folder and applies it to a target Directus instance.

### 3. Git Integration
Each instance folder is treated as a Git repository.
- **Status**: Checked periodically (every minute) to show uncommitted changes.
- **Init**: Initializes a new repository if one doesn't exist.
- **Remote**: Allows connecting to a remote Git repository with token-based authentication (token is encrypted).
- **Push/Pull**: standard Git operations to keep configurations versioned and synced.

## Development Guidelines
- **IPC Communication**: All filesystem or system-level operations MUST be handled in `electron/main.ts` and exposed via `ipcRenderer` in `preload.ts`.
- **Styling**: Use Tailwind CSS 4 utility classes. Prefer DaisyUI components for common UI elements (buttons, cards, badges).
- **Reusability**: Use `AppButton` for all buttons to maintain consistent styling.
- **Encapsulation**: Keep business logic in `main.ts` or Vue components; avoid heavy logic in `preload.ts`.
- **State Management**: Uses Vue's reactive `ref` and `onMounted` for data fetching; no external state management library (like Pinia) is currently used.

## Useful Commands
- `npm run dev`: Starts the Vite dev server and Electron.
- `npm run build`: Compiles the application and packages it using `electron-builder`.

---
*Note: This file should be updated whenever significant architectural changes or new core features are added.*
