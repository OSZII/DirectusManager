---
trigger: always_on
glob: "**/*"
description: Development guidelines, coding standards, and IPC communication rules.
---

# Development Guidelines

## IPC Communication
All filesystem or system-level operations MUST be handled in `electron/main.ts` and exposed via `ipcRenderer` in `preload.ts`.

## Styling
- Use **Tailwind CSS 4** utility classes.
- Prefer **DaisyUI** components for common UI elements (buttons, cards, badges).
- Use the **`night`** dark theme.

## Component Reusability
Use `AppButton` for all buttons to maintain consistent styling across the application.

## Encapsulation
Keep business logic in `main.ts` or Vue components. Avoid heavy logic in `preload.ts`.

## State Management
Uses Vue's reactive `ref` and `onMounted` for data fetching. No external state management library (like Pinia) is currently used.

## Useful Commands
- `npm run dev`: Starts the Vite dev server and Electron.
- `npm run build`: Compiles the application and packages it using `electron-builder`.
