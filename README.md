# vitepress-plugin-package-managers

Display package manager commands with **synced, persistent tabs** for [VitePress](https://vitepress.dev). Users pick their package manager once — the choice is remembered across pages and browser sessions.

Inspired by [starlight-package-managers](https://github.com/HiDeoo/starlight-package-managers).

## Install

```bash
npm install vitepress-plugin-package-managers
```

## Setup

### 1. Register the markdown plugin

```ts
// .vitepress/config.mts
import { packageManagersMarkdownPlugin } from "vitepress-plugin-package-managers";

export default defineConfig({
  markdown: {
    config(md) {
      md.use(packageManagersMarkdownPlugin);
    },
  },
});
```

### 2. Register the Vue components

```ts
// .vitepress/theme/index.ts
import { enhanceAppWithPackageManagers } from "vitepress-plugin-package-managers/client";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    enhanceAppWithPackageManagers(app);
  },
};
```

## Usage

### Markdown syntax

The simplest way — use `:::pm-<type>` containers directly in `.md` files:

```md
::: pm-add gramio
:::

::: pm-add -D @gramio/types
:::

::: pm-run dev
:::

::: pm-install
:::

::: pm-create gramio
:::

::: pm-dlx gramio
:::

::: pm-remove gramio
:::
```

### Vue component

For more control, use the `<PackageManagers>` component:

```md
<PackageManagers pkg="gramio" />

<PackageManagers pkg="@gramio/types" dev />

<PackageManagers type="run" pkg="dev" />

<PackageManagers type="install" />

<PackageManagers type="create" pkg="gramio" />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pkg` | `string` | — | Package name |
| `type` | `"add" \| "create" \| "dlx" \| "exec" \| "install" \| "run" \| "remove"` | `"add"` | Command type |
| `dev` | `boolean` | `false` | Add as dev dependency (`-D` / `-d`) |
| `args` | `string` | — | Extra arguments appended to the command |
| `prefix` | `string` | — | Prefix prepended to the command (e.g. `sudo`) |
| `comment` | `string` | — | Comment line above the command. `{PKG}` is replaced with the manager name |
| `jsr` | `string` | — | JSR package specifier (see [JSR support](#jsr-support)) |
| `pkgManagers` | `PackageManager[]` | `["npm", "yarn", "pnpm", "bun"]` | Which tabs to show |

## JSR support

Pass the `jsr` prop to generate correct commands for every package manager:

```md
<PackageManagers jsr="@gramio/bot" />
```

Generates:

| Manager | Command |
|---------|---------|
| npm | `npx jsr add @gramio/bot` |
| yarn | `yarn dlx jsr add @gramio/bot` |
| pnpm | `pnpm dlx jsr add @gramio/bot` |
| bun | `bunx jsr add @gramio/bot` |
| deno | `deno add jsr:@gramio/bot` |

## Navbar switcher

`PackageManagerSwitch` is a dropdown you can put in the navbar so users can change their preference from anywhere:

```vue
<!-- .vitepress/theme/Layout.vue -->
<script setup>
import DefaultTheme from "vitepress/theme";
import { PackageManagerSwitch } from "vitepress-plugin-package-managers/client";
</script>

<template>
  <DefaultTheme.Layout>
    <template #nav-bar-content-after>
      <PackageManagerSwitch />
    </template>
  </DefaultTheme.Layout>
</template>
```

## Persistence

All components share state through three mechanisms:

1. **`localStorage`** — persists the choice across pages and sessions
2. **`CustomEvent`** — syncs all instances on the same page instantly
3. **`storage` event** — syncs across browser tabs

## Supported package managers

`npm`, `yarn`, `pnpm`, `bun`, `deno`, `ni`

Default: `["npm", "yarn", "pnpm", "bun"]`

## Configuring defaults

Pass options to the markdown plugin to change the default set of package managers:

```ts
md.use(packageManagersMarkdownPlugin, {
  pkgManagers: ["npm", "pnpm", "bun"],
});
```

Or per-instance via the `pkgManagers` prop:

```md
<PackageManagers pkg="gramio" :pkg-managers='["npm", "bun", "deno"]' />
```

## License

MIT
