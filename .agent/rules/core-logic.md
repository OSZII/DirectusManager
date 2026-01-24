---
trigger: always_on
glob: "**/*"
description: Documentation of the core logic and functionalities of Directus Manager.
---

# Core Logic & Functionalities

## 1. Instance Management
Instances are stored in `instances.json`. Sensitive tokens are encrypted using Electron's `safeStorage`.
- **Fields**: `id`, `name`, `url`, `token`, `gitRemoteUrl`, `gitToken`, `encryptedToken`, `encryptedGitToken`, `customSchemaPath`.

## 2. Directus Sync Operations
Uses `npx directus-sync` under the hood. For each instance, a directory is created. By default, this is in a subfolder of the app's `userData` folder, but users can specify a **custom path**.
- **Default Path**: `userData/[instance_name_slug]`
- **Custom Path**: User-selected directory (stored in `customSchemaPath`).
- **Pull**: Fetches the Directus configuration and stores it in the local instance folder.
- **Push**: Takes the local configuration from a source instance folder and applies it to a target Directus instance.

## 3. Git Integration
Each instance folder is treated as a Git repository.
- **Status**: Checked periodically (every minute) to show uncommitted changes.
- **Init**: Initializes a new repository if one doesn't exist.
- **Remote**: Allows connecting to a remote Git repository with token-based authentication (token is encrypted).
- **Push/Pull**: standard Git operations to keep configurations versioned and synced.
