import type MarkdownIt from "markdown-it";
import type { PackageManager, CommandType } from "./commands.ts";

export interface MarkdownPluginOptions {
  /** Default package managers to show. */
  pkgManagers?: PackageManager[];
}

/**
 * Markdown-it plugin that adds container syntax for package manager tabs.
 *
 * Syntax:
 *   ::: pm-add gramio
 *   :::
 *
 *   ::: pm-add -D @gramio/types
 *   :::
 *
 *   ::: pm-install
 *   :::
 *
 *   ::: pm-run dev
 *   :::
 *
 *   ::: pm-create gramio
 *   :::
 *
 *   ::: pm-dlx gramio
 *   :::
 *
 *   ::: pm-exec something
 *   :::
 *
 *   ::: pm-remove gramio
 *   :::
 */
export function packageManagersMarkdownPlugin(
  md: MarkdownIt,
  options: MarkdownPluginOptions = {}
) {
  const commandTypes: CommandType[] = [
    "add",
    "create",
    "dlx",
    "exec",
    "install",
    "run",
    "remove",
  ];
  const pattern = new RegExp(
    `^pm-(${commandTypes.join("|")})\\s*(.*)?$`
  );

  md.block.ruler.before(
    "fence",
    "pm_container",
    (state, startLine, endLine, silent) => {
      const pos = state.bMarks[startLine]! + state.tShift[startLine]!;
      const max = state.eMarks[startLine]!;
      const line = state.src.slice(pos, max);

      // Match opening :::
      const openMatch = line.match(/^:{3,}\s*pm-([\w-]+)\s*(.*)?$/);
      if (!openMatch) return false;

      if (silent) return true;

      const fullType = openMatch[1]!;
      const rest = (openMatch[2] || "").trim();

      if (!commandTypes.includes(fullType as CommandType)) return false;

      // Find closing :::
      let nextLine = startLine + 1;
      while (nextLine < endLine) {
        const nextPos =
          state.bMarks[nextLine]! + state.tShift[nextLine]!;
        const nextMax = state.eMarks[nextLine]!;
        const nextLineStr = state.src.slice(nextPos, nextMax);
        if (nextLineStr.match(/^:{3,}\s*$/)) break;
        nextLine++;
      }

      // Parse rest: optional -D flag and package name
      let dev = false;
      let pkg = "";
      const parts = rest.split(/\s+/).filter(Boolean);

      for (const part of parts) {
        if (part === "-D" || part === "--dev") {
          dev = true;
        } else {
          pkg += (pkg ? " " : "") + part;
        }
      }

      // Build component props
      const propsArr: string[] = [];
      propsArr.push(`type="${fullType}"`);
      if (pkg) propsArr.push(`pkg="${pkg}"`);
      if (dev) propsArr.push("dev");
      if (options.pkgManagers) {
        propsArr.push(
          `:pkg-managers='${JSON.stringify(options.pkgManagers)}'`
        );
      }

      const tokenOpen = state.push("html_block", "", 0);
      tokenOpen.content = `<PackageManagers ${propsArr.join(" ")} />\n`;
      tokenOpen.map = [startLine, nextLine + 1];

      state.line = nextLine + 1;
      return true;
    }
  );
}
