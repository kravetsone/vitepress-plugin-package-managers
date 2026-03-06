import { inject } from "vue";
import type { PackageManager } from "./commands.ts";
import { pmConfigKey } from "./client.ts";

/** Returns a function that resolves the icon SVG for a given package manager (or `undefined` if none). */
export function useIcons() {
  const config = inject(pmConfigKey, {});

  return (pm: PackageManager): string | undefined => {
    const value = config.icons?.[pm];
    if (value === false) return undefined;
    return value;
  };
}
