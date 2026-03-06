# vitepress-plugin-package-managers

VitePress plugin for displaying package manager commands with synced, persistent tabs.

## Commands

```bash
bun test          # Run unit tests
```

## Architecture

- **No build step** — ships TypeScript + Vue source; VitePress/Vite processes them.
- `src/commands.ts` — pure functions for generating commands per package manager.
- `src/markdown.ts` — markdown-it plugin (`:::pm-add` syntax). Transforms source before markdown-it parsing.
- `src/client.ts` — Vue component registration, `provide/inject` config with `pmConfigKey`.
- `src/icons.ts` — default SVG icons (Simple Icons + official Bun logo).
- `src/useIcons.ts` — composable that merges default icons with user overrides from `inject`.
- `src/components/PackageManagers.vue` — code-group-style tabs (synced via localStorage + CustomEvent + storage event).
- `src/components/PackageManagerSwitch.vue` — navbar dropdown for global package manager selection.

## Exports

| Path | Usage |
|------|-------|
| `vitepress-plugin-package-managers` | Server: `packageManagersMarkdownPlugin` for `config.mts` |
| `vitepress-plugin-package-managers/client` | Client: `enhanceAppWithPackageManagers`, `PackageManagers`, `PackageManagerSwitch`, `pmConfigKey`, `IconOverrides` |

## Persistence

All components share state via:
1. `localStorage` key `vitepress-pkg-manager` — persists across pages and sessions
2. `CustomEvent("vitepress-pkg-manager-sync")` — syncs all instances on the same page
3. `storage` event — syncs across browser tabs

## Icons

Default icons from Simple Icons (npm, yarn, pnpm, deno) and official Bun logo. Customizable via `enhanceAppWithPackageManagers(app, { icons: { ... } })`:
- `string` — custom SVG markup
- `false` — hide icon for that manager
- omitted — use default

Icons are resolved via `useIcons()` composable which reads from Vue `inject`.

## Supported Package Managers

npm, yarn, pnpm, bun, deno, ni (default: npm, yarn, pnpm, bun)

## Supported Command Types

add, create, dlx, exec, install, run, remove

## JSR Support

`jsr` option generates proper commands for all package managers:
- Deno: `deno add jsr:@scope/pkg`
- Others: `npx jsr add @scope/pkg`, `bunx jsr add @scope/pkg`, etc.

## Key Conventions

- **Keep CLAUDE.md and README.md in sync** — when adding features, changing API, or modifying behavior, update both files. CLAUDE.md is the technical reference for AI agents; README.md is the user-facing documentation with examples.
- All imports between source files must use `.ts` extensions (Node ESM).
- Icons use inline SVG strings — no external dependencies.
- Components use VitePress CSS variables (`--vp-code-tab-*`, `--vp-c-*`) for native look.
