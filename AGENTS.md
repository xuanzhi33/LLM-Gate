# LLM Gate - AI Agent Instructions

## Project Overview

LLM Gate is a Tauri-based desktop application for proxying LLM API requests with automatic key injection and CORS support. It's a hybrid architecture with Vue 3 frontend and Rust backend.

**Stack**: Tauri v2 + Vue 3 + TypeScript + Vite + Pinia + shadcn-vue (reka-ui) + Tailwind CSS 4

## Architecture

### Frontend-Backend Communication

- **Frontend**: Vue SPA with hash routing (`createWebHashHistory`)
- **Backend**: Tauri Rust plugins for native OS interactions
- **Data persistence**: Uses Tauri's `plugin-fs` writing to `BaseDirectory.AppLocalData`
- **State**: Pinia stores with auto-save to local JSON files (see `src/stores/models.ts`)

### Key Integration Pattern

State persistence follows this pattern (see `useModelConfigStore`):

```typescript
// Data flows: Pinia store <-> Tauri FS plugin <-> Local JSON
const saveToDisk = useDebounceFn(async () => {
  saveJSON(configs.value, CONFIG_FILE) // Uses @tauri-apps/plugin-fs
}, 1000)
```

Files are saved to app-specific directory automatically by Tauri. Never hardcode file paths; use `BaseDirectory.AppLocalData`.

## Development Workflow

### Running the App

```bash
pnpm tauri dev  # Starts both Vite dev server (port 15173) and Tauri
```

- DevTools open automatically in debug builds (see `src-tauri/src/lib.rs`)
- Frontend auto-reloads on changes; Rust requires full restart

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
```

## Code Conventions

### Component Structure

Uses **shadcn-vue** (reka-ui primitives) with New York style:

- All UI components in `src/components/ui/` follow this pattern
- Each component exports variants via `class-variance-authority`
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Import from barrel files: `import { Button } from '@/components/ui/button'`

Example component pattern:

```vue
<script setup lang="ts">
import { Primitive } from 'reka-ui'
import { cn } from '@/lib/utils'

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant']
  class?: HTMLAttributes['class']
}
</script>

<template>
  <Primitive :class="cn(buttonVariants({ variant }), props.class)">
    <slot />
  </Primitive>
</template>
```

### Path Aliases

- `@/` maps to `src/` (configured in both Vite and TypeScript)
- Always use path aliases for imports: `@/components`, `@/stores`, `@/utils`

### Styling

- **Tailwind CSS v4** (uses `@tailwindcss/vite` plugin)
- Theme: neutral base color, supports dark mode via `.dark` class on `<html>`
- Dark mode managed by `useSettingsStore` with system/light/dark options
- CSS variables defined in `src/assets/main.css`

### Internationalization

- **vue-i18n** with composition API (`const { t } = useI18n()`)
- Locale files: `src/i18n/en.json`, `src/i18n/zh.json`
- Language auto-detected from browser with `usePreferredLanguages()`
- Current locale stored in localStorage with prefix `xuanzhi33-`

### State Management

- **Pinia** stores with composition API
- Settings persist to localStorage with `xuanzhi33-` prefix
- App data persists to JSON files via Tauri FS (see `src/utils/app-data.ts`)
- Use `useDebounceFn` from `@vueuse/core` for auto-save (1s debounce)

## Tauri-Specific Patterns

### File System Operations

Always use the abstraction layer in `src/utils/app-data.ts`:

```typescript
import { saveJSON, loadJSON } from '@/utils/app-data'
await saveJSON(data, 'config.json') // Automatically uses AppLocalData
```

### Logging

Tauri plugin provides structured logging:

```typescript
import { info } from '@tauri-apps/plugin-log'
info('Message') // Logs to file in production
```

### Window Management

Main window config in `src-tauri/tauri.conf.json`:

- Default size: 800x400
- Identifier: `cn.xuanzhi33.llm-gate`
- DevTools auto-open in debug builds

## Important Files

### Configuration

- `components.json` - shadcn-vue configuration (New York style, lucide icons)
- `src-tauri/tauri.conf.json` - Tauri app config, security policies, build settings
- `vite.config.ts` - Dev server (port 15173), path aliases, Tailwind plugin

### Core Application

- `src/stores/models.ts` - Model configuration store with auto-persistence
- `src/stores/settings.ts` - App settings (theme, language, logging)
- `src/utils/app-data.ts` - Tauri FS abstraction layer
- `src-tauri/src/lib.rs` - Tauri plugins initialization

## Common Tasks

**Adding a new UI component**: Use shadcn-vue patterns with reka-ui primitives. Follow existing components in `src/components/ui/`.

**Adding Tauri commands**: Define in `src-tauri/src/lib.rs`, export via `#[tauri::command]`, invoke from frontend via `@tauri-apps/api`.

**Adding translations**: Update both `src/i18n/en.json` and `src/i18n/zh.json` with matching keys.

**Persisting data**: Use `saveJSON`/`loadJSON` from `@/utils/app-data`, never write files directly.

**Adding routes**: Update `src/router/index.ts` with hash mode routing.
