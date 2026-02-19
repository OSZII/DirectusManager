# Directus Schema

This directory is a [directus-sync](https://github.com/tractr/directus-sync) dump of a Directus v11.15.2 instance (Postgres). It serves as the version-controlled source of truth for the schema, permissions, and system config.

## How directus-sync works

- `npx directus-sync pull` — dumps the live Directus instance into this directory
- `npx directus-sync push` — applies the local dump to the Directus instance
- Config lives in `directus-sync.config.js` (both here and at the repo root — the root config is used when running from the repo root)
- Every object has a `_syncId` field that directus-sync uses to track identity across environments

## Directory structure

```
directus-schema/
├── directus-sync.config.js   # connection config (url + token + dumpPath)
├── collections/               # system-level Directus objects (roles, permissions, settings, etc.)
│   ├── roles.json
│   ├── policies.json
│   ├── permissions.json
│   ├── settings.json
│   ├── folders.json
│   ├── dashboards.json
│   ├── flows.json
│   ├── operations.json
│   ├── panels.json
│   ├── presets.json
│   └── translations.json
├── snapshot/                  # the actual data model (custom collections, fields, relations)
│   ├── info.json              # Directus version + vendor info
│   ├── collections/           # one JSON per custom collection
│   ├── fields/                # one folder per collection, one JSON per field
│   └── relations/             # one folder per collection, one JSON per FK/relation
└── specs/                     # auto-generated API specs
    ├── openapi.json
    ├── item.graphql
    └── system.graphql
```

## Custom collections

| Collection | Purpose |
|---|---|
| `blog_posts` | Blog posts with status/sort/archiving. Has translations via `blog_posts_translations`. |
| `blog_posts_translations` | Junction table linking `blog_posts` to `project_languages`. Holds `title`, `slug`, `description`, `content`. Grouped under `blog_posts` in the UI. |
| `languages` | Lookup table of languages (`id`, `name`). |
| `project_languages` | Junction linking a `client_project` to a `language`. Determines which languages a project uses. |
| `client_projects` | Projects belonging to a client. Fields: `name`, `status`, `client` (FK to directus_users). |

## Relationships

- `blog_posts.translations` → `blog_posts_translations` (O2M)
- `blog_posts_translations.blog_posts_id` → `blog_posts` (M2O)
- `blog_posts_translations.project_languages_id` → `project_languages` (M2O)
- `blog_posts.featured_image` → `directus_files`
- `blog_posts.project` → `client_projects`
- `blog_posts.user_created` / `user_updated` → `directus_users`
- `project_languages.project` → `client_projects`
- `project_languages.language` → `languages`
- `client_projects.client` → `directus_users`

## Roles & policies

- **Administrator** — full admin access
- **Client** — app access, scoped permissions so clients only see their own data
- **Public** — read-only access to `blog_posts`, `blog_posts_translations`, `project_languages`, `client_projects`, and `languages`

## Key details

- The `collections/` JSON files use `_syncId` references to link between objects (e.g. permissions reference policies by `_syncId`)
- The `snapshot/` directory mirrors what Directus uses internally for schema diffing and migrations
- `specs/` files are auto-generated and should not be hand-edited
