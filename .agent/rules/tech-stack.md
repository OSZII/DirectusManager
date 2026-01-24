---
trigger: always_on
glob: "**/*"
description: Technology stack definition for the Directus Manager project.
---

# Tech Stack

The Directus Manager project uses the following technologies:

- **Frontend**: Vue 3 (Composition API), Vite, TypeScript.
- **Styling**: Tailwind CSS 4, DaisyUI 5 (Dark theme: `night`).
- **Icons**: Lucide Vue Next.
- **Desktop Framework**: Electron.
- **Tools**:
  - `directus-sync`: Used for pulling and pushing Directus configurations.
  - `simple-git`: Used for Git operations (Init, Push, Pull, Status).
  - `electron-vite`: Integration for Vite and Electron.
