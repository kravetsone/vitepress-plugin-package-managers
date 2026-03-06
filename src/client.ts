import type { App } from "vue";
import PackageManagers from "./components/PackageManagers.vue";

export { default as PackageManagers } from "./components/PackageManagers.vue";

export function enhanceAppWithPackageManagers(app: App) {
  app.component("PackageManagers", PackageManagers);
}
