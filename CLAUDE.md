# vitepress-plugin-package-managers

VitePress plugin for displaying package manager commands with synced, persistent tabs.

## Commands

```bash
bun test          # Run unit tests
```

## Architecture

- **No build step** — ships TypeScript + Vue source; VitePress/Vite processes them.
- `src/commands.ts` — pure functions for generating commands per package manager.
- `src/markdown.ts` — markdown-it plugin for `:::pm-add` / `:::pm-run` / etc. syntax.
- `src/client.ts` — Vue component registration (`enhanceAppWithPackageManagers`).
- `src/components/PackageManagers.vue` — code-group-style tabs (synced via localStorage + CustomEvent + storage event).
- `src/components/PackageManagerSwitch.vue` — navbar dropdown for global package manager selection.

## Exports

| Path | Usage |
|------|-------|
| `vitepress-plugin-package-managers` | Server: `packageManagersMarkdownPlugin` for `config.mts` |
| `vitepress-plugin-package-managers/client` | Client: `enhanceAppWithPackageManagers`, `PackageManagers`, `PackageManagerSwitch` |

## Persistence

All components share state via:
1. `localStorage` key `vitepress-pkg-manager` — persists across pages and sessions
2. `CustomEvent("vitepress-pkg-manager-sync")` — syncs all instances on the same page
3. `storage` event — syncs across browser tabs

## Supported Package Managers

npm, yarn, pnpm, bun, deno, ni (default: npm, yarn, pnpm, bun)

## Supported Command Types

add, create, dlx, exec, install, run, remove

## JSR Support

`jsr` option generates proper commands for all package managers:
- Deno: `deno add jsr:@scope/pkg`
- Others: `npx jsr add @scope/pkg`, `bunx jsr add @scope/pkg`, etc.
