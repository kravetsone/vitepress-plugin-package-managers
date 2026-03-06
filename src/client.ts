import type { App, InjectionKey } from "vue";
import type { PackageManager } from "./commands.ts";
import PackageManagers from "./components/PackageManagers.vue";
import PackageManagerSwitch from "./components/PackageManagerSwitch.vue";

export { default as PackageManagers } from "./components/PackageManagers.vue";
export { default as PackageManagerSwitch } from "./components/PackageManagerSwitch.vue";

/** Custom icon overrides. `string` = SVG markup, `false` = hide icon. */
export type IconOverrides = Partial<Record<PackageManager, string | false>>;

export interface PackageManagersOptions {
  /** Override or disable icons per package manager. */
  icons?: IconOverrides;
}

export const pmConfigKey: InjectionKey<PackageManagersOptions> = Symbol("pm-config");

export function enhanceAppWithPackageManagers(app: App, options?: PackageManagersOptions) {
  app.provide(pmConfigKey, options ?? {});
  app.component("PackageManagers", PackageManagers);
  app.component("PackageManagerSwitch", PackageManagerSwitch);
}
