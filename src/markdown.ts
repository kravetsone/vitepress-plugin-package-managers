import type MarkdownIt from "markdown-it";
import type { PackageManager, CommandType } from "./commands.ts";

export interface MarkdownPluginOptions {
  /** Default package managers to show. */
  pkgManagers?: PackageManager[];
}

const commandTypes: CommandType[] = [
  "add",
  "create",
  "dlx",
  "exec",
  "install",
  "run",
  "remove",
];

const PATTERN = /^:::\s*pm-(add|create|dlx|exec|install|run|remove)\s*(.*)?$/;
const CLOSE = /^:::$/;

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
 *   ::: pm-run dev
 *   :::
 */
export function packageManagersMarkdownPlugin(
  md: MarkdownIt,
  options: MarkdownPluginOptions = {}
) {
  const originalParse = md.parse.bind(md);

  md.parse = (src: string, env: unknown) => {
    const transformed = transformSource(src, options);
    return originalParse(transformed, env);
  };
}

function transformSource(src: string, options: MarkdownPluginOptions): string {
  const lines = src.split("\n");
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const match = lines[i]!.match(PATTERN);
    if (!match) {
      result.push(lines[i]!);
      i++;
      continue;
    }

    const type = match[1]!;
    const rest = (match[2] || "").trim();

    // Find closing :::
    let j = i + 1;
    while (j < lines.length) {
      if (CLOSE.test(lines[j]!.trim())) break;
      j++;
    }

    // Parse flags and package name
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

    // Build component
    const propsArr: string[] = [];
    propsArr.push(`type="${type}"`);
    if (pkg) propsArr.push(`pkg="${pkg}"`);
    if (dev) propsArr.push("dev");
    if (options.pkgManagers) {
      propsArr.push(
        `:pkg-managers='${JSON.stringify(options.pkgManagers)}'`
      );
    }

    result.push(`<PackageManagers ${propsArr.join(" ")} />`);

    // Skip past closing :::
    i = j < lines.length ? j + 1 : j;
  }

  return result.join("\n");
}
