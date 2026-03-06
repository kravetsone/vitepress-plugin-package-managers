const pkgManagers = ["npm", "yarn", "pnpm", "bun", "deno", "ni"] as const;

export type PackageManager = (typeof pkgManagers)[number];
export type CommandType =
  | "add"
  | "create"
  | "dlx"
  | "exec"
  | "install"
  | "run"
  | "remove";

export interface CommandOptions {
  args?: string;
  comment?: string;
  dev?: boolean;
  prefix?: string;
  /** JSR package specifier (e.g. `@gramio/bot`). Generates `deno add jsr:...` for Deno and `npx jsr add ...` / `bunx jsr add ...` etc. for others. */
  jsr?: string;
}

type CommandMap = Record<
  PackageManager,
  Record<Exclude<CommandType, "create"> | "devOption", string> & {
    create?: string;
  }
>;

const commands: CommandMap = {
  npm: {
    add: "npm install",
    create: "npm create",
    devOption: "-D",
    dlx: "npx",
    exec: "npx",
    install: "npm install",
    run: "npm run",
    remove: "npm uninstall",
  },
  yarn: {
    add: "yarn add",
    create: "yarn create",
    devOption: "-D",
    dlx: "yarn dlx",
    exec: "yarn",
    install: "yarn install",
    run: "yarn run",
    remove: "yarn remove",
  },
  pnpm: {
    add: "pnpm add",
    create: "pnpm create",
    devOption: "-D",
    dlx: "pnpx",
    exec: "pnpm",
    install: "pnpm install",
    run: "pnpm run",
    remove: "pnpm remove",
  },
  bun: {
    add: "bun add",
    create: "bun create",
    devOption: "-d",
    dlx: "bunx",
    exec: "bunx",
    install: "bun install",
    run: "bun run",
    remove: "bun remove",
  },
  deno: {
    add: "deno add",
    devOption: "-D",
    dlx: "deno run -A npm:",
    exec: "deno run -A npm:",
    install: "deno install",
    run: "deno task",
    remove: "deno remove",
  },
  ni: {
    add: "ni",
    devOption: "-D",
    dlx: "nlx",
    exec: "nlx",
    install: "ni",
    run: "nr",
    remove: "nun",
  },
};

/** JSR add commands per package manager (using their dlx equivalent). Deno has native `deno add jsr:` support. */
const jsrAddCommands: Record<PackageManager, string> = {
  npm: "npx jsr add",
  yarn: "yarn dlx jsr add",
  pnpm: "pnpm dlx jsr add",
  bun: "bunx jsr add",
  deno: "deno add",
  ni: "nlx jsr add",
};

/** JSR remove — for Deno it's `deno remove jsr:`, for others standard remove works since jsr CLI adds to package.json normally. */
const jsrRemoveCommands: Record<PackageManager, string> = {
  npm: "npm uninstall",
  yarn: "yarn remove",
  pnpm: "pnpm remove",
  bun: "bun remove",
  deno: "deno remove",
  ni: "nun",
};

export const defaultPkgManagers: PackageManager[] = [
  "npm",
  "yarn",
  "pnpm",
  "bun",
];

export function getSupportedPkgManagers(
  type: CommandType,
  userPkgManagers?: PackageManager[]
): PackageManager[] {
  return (userPkgManagers ?? defaultPkgManagers).filter(
    (pm) => commands[pm][type] !== undefined
  );
}

export function getCommand(
  pkgManager: PackageManager,
  type: CommandType,
  pkg: string | undefined,
  options: CommandOptions = {}
): string {
  // JSR mode — completely different command structure
  if (options.jsr && (type === "add" || type === "remove")) {
    return getJsrCommand(pkgManager, type, options);
  }

  let command = commands[pkgManager][type];

  if (!command) {
    throw new Error(
      `Command type '${type}' is not supported for '${pkgManager}'.`
    );
  }

  if (options.prefix) {
    command = `${options.prefix} ${command}`;
  }

  if (options.comment) {
    command = `# ${options.comment.replaceAll("{PKG}", pkgManager)}\n${command}`;
  }

  if (type === "add" && options.dev) {
    command += ` ${commands[pkgManager].devOption}`;
  }

  if (pkg) {
    let processedPkg = pkg;

    if (type === "create" && pkgManager === "yarn") {
      processedPkg = pkg.replace(/@[^\s]+/, "");
    } else if (pkgManager === "deno" && (type === "add" || type === "remove")) {
      processedPkg = `npm:${pkg}`;
    }

    command += ` ${processedPkg}`;
  }

  if (options.args) {
    if (
      pkgManager === "npm" &&
      type !== "dlx" &&
      type !== "exec" &&
      type !== "run"
    ) {
      command += " --";
    }
    command += ` ${options.args}`;
  }

  return command;
}

function getJsrCommand(
  pkgManager: PackageManager,
  type: "add" | "remove",
  options: CommandOptions
): string {
  const jsr = options.jsr!;

  if (type === "remove") {
    // For remove, Deno needs `jsr:` prefix, others just remove by package name
    const base = jsrRemoveCommands[pkgManager];
    const pkg = pkgManager === "deno" ? `jsr:${jsr}` : jsr;
    return `${base} ${pkg}`;
  }

  // type === "add"
  if (pkgManager === "deno") {
    // Deno native: deno add jsr:@scope/pkg
    let command = `${jsrAddCommands[pkgManager]} jsr:${jsr}`;
    if (options.dev) command = `${command.replace("deno add", "deno add -D")}`;
    return command;
  }

  // Others: npx jsr add @scope/pkg
  return `${jsrAddCommands[pkgManager]} ${jsr}`;
}
