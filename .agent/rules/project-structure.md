---
trigger: always_on
glob: "**/*"
description: Overview of the project structure and directory layout.
---

# Project Structure

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
