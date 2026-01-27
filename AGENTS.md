# LLM Gate - AI Agent Instructions

## Project Overview

LLM Gate is a Tauri-based desktop application for proxying LLM API requests with automatic key injection and CORS support. It employs a hybrid architecture with a Vue 3 frontend and a Rust backend.

**Stack**:
- **Frontend**: Tauri v2 + Vue 3 + TypeScript + Vite + Pinia + shadcn-vue (reka-ui) + Tailwind CSS 4 + vue-sonner + @tanstack/vue-table
- **Backend**: Rust + Axum 0.8 (HTTP Server) + Reqwest (HTTP Client) + Tokio (Async Runtime) + Tower-HTTP

## Architecture

### Frontend-Backend Communication

- **Frontend**: Vue SPA using hash routing (`createWebHashHistory`).
- **Backend**: Tauri Rust plugins for native OS interactions (`fs`, `log`, `updater`, `single-instance`, `process`) and a custom `axum` proxy server.
- **Data Persistence**:
  - **App Data**: Uses Tauri's `plugin-fs` to write to `BaseDirectory.AppLocalData` (JSON files).
  - **Settings**: Uses `localStorage` with prefix `xuanzhi33-`.
- **State**: Pinia stores. `useModelConfigStore` auto-saves to local JSON files; `useSettingsStore` auto-saves to `localStorage`.

### Proxy Architecture

The core feature is a local proxy server running within the Tauri application:

1.  **Start/Stop**: Controlled via Tauri commands (`start_proxy_server`, `stop_proxy_server`).
2.  **Server**: Uses `axum` to listen on a user-defined host and port.
3.  **Routing**: Intercepts requests to `/{model_id}/v1/{*path}`.
4.  **Handling**:
    -   Loads model configuration (Base URL, API Key) from `model-config.json` (shared with frontend).
    -   Injects `Authorization: Bearer <key>` header.
    -   Optionally overrides `model` body parameter for chat completions.
    -   Forwards request to upstream provider using `reqwest`.
    -   Streams response back to the client.

## Development Workflow

### Running the App

```bash
pnpm tauri dev  # Starts both Vite dev server and Tauri
```

- DevTools open automatically in debug builds.
- Frontend auto-reloads on changes; Rust requires full restart.

### Building

```bash
pnpm build      # Builds frontend
pnpm tauri build # Builds full app bundle
```

### Testing & Quality

```bash
pnpm test:unit  # Vitest unit tests
pnpm lint       # ESLint with auto-fix
pnpm format     # Prettier formatting
pnpm type-check # TypeScript type checking
```

## Code Conventions

### Component Structure

Uses **shadcn-vue** (reka-ui primitives) with New York style:

- All UI components in `src/components/ui/` follow this pattern.
- Each component exports variants via `class-variance-authority`.
- Use `cn()` utility from `@/lib/utils` for conditional classes.
- Import from barrel files: `import { Button } from '@/components/ui/button'`.
- Icons: Use `lucide-vue-next`.

### Styling

- **Tailwind CSS v4** (uses `@tailwindcss/vite` plugin).
- Theme: neutral base color, supports dark mode via `.dark` class on `<html>`.
- Dark mode managed by `useSettingsStore` with system/light/dark options.
- CSS variables defined in `src/assets/main.css`.

### Internationalization

- **vue-i18n** with composition API.
- Locale files: `src/i18n/en.json`, `src/i18n/zh.json`, `src/i18n/zh-hant.json`.
- Script: `pnpm zh-hant` generates Traditional Chinese from Simplified.
- Current locale stored in `localStorage` with prefix `xuanzhi33-`.

### State Management

- **Pinia** stores with composition API.
- Use `useDebounceFn` from `@vueuse/core` for auto-save (1s debounce) to disk.

## Common Utilities & Components

- **App Data**: `src/utils/app-data.ts` - Abstraction for Tauri FS (JSON/Text).
- **Proxy Client**: `src/utils/proxy.ts` - Wrapper for proxy-related Tauri commands.
- **Logging**: `src/utils/log.ts` - Structured logging using `tauri-plugin-log`.
- **EditableField**: `src/components/common/EditableField.vue` - Reusable field for viewing/editing values.
- **ID Generation**: Use `nanoid`.

## Important Files

### Configuration

- `components.json` - shadcn-vue configuration.
- `src-tauri/tauri.conf.json` - Tauri app config, security policies, build settings.
- `vite.config.ts` - Dev server, path aliases, Tailwind plugin.

### Core Application

- `src/stores/models.ts` - Model configuration store with auto-persistence.
- `src/stores/settings.ts` - App settings.
- `src/stores/proxy.ts` - Proxy server state and control.
- `src/stores/update.ts` - App update logic (check/download/install).
- `src/utils/app-data.ts` - Tauri FS abstraction layer.

### Backend (Rust)

- `src-tauri/src/lib.rs` - Entry point, plugin initialization.
- `src-tauri/src/proxy.rs` - **Core Logic**: Axum server implementation.
- `src-tauri/src/config.rs` - Backend configuration loader.
- `src-tauri/src/events.rs` - Event definitions and handling.

## Common Tasks

**Adding a new UI component**: Use shadcn-vue patterns. Follow existing components in `src/components/ui/`.

**Adding Tauri commands**: Define in `src-tauri/src/lib.rs` (or modules), export via `#[tauri::command]`.

**Persisting data**:
- For app data (lists, configs): Use `saveJSON`/`loadJSON` from `@/utils/app-data`.
- For simple flags/settings: Use `localStorage` via `useSettingsStore`.