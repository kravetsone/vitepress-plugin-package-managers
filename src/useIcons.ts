import { inject } from "vue";
import type { PackageManager } from "./commands.ts";
import { icons as defaultIcons } from "./icons.ts";
import { pmConfigKey } from "./client.ts";

/** Returns a function that resolves the icon SVG for a given package manager (or `undefined` if hidden). */
export function useIcons() {
  const config = inject(pmConfigKey, {});

  return (pm: PackageManager): string | undefined => {
    const override = config.icons?.[pm];
    if (override === false) return undefined;
    if (typeof override === "string") return override;
    return defaultIcons[pm];
  };
}
