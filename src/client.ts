import type { App } from "vue";
import PackageManagers from "./components/PackageManagers.vue";
import PackageManagerSwitch from "./components/PackageManagerSwitch.vue";

export { default as PackageManagers } from "./components/PackageManagers.vue";
export { default as PackageManagerSwitch } from "./components/PackageManagerSwitch.vue";

export function enhanceAppWithPackageManagers(app: App) {
  app.component("PackageManagers", PackageManagers);
  app.component("PackageManagerSwitch", PackageManagerSwitch);
}
