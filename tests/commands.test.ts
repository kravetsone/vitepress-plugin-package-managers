import { describe, it, expect } from "bun:test";
import {
  getCommand,
  getSupportedPkgManagers,
  defaultPkgManagers,
  type PackageManager,
} from "../src/commands.ts";

describe("getSupportedPkgManagers", () => {
  it("returns default managers", () => {
    expect(getSupportedPkgManagers("add")).toEqual(defaultPkgManagers);
  });

  it("filters by user-specified managers", () => {
    expect(getSupportedPkgManagers("add", ["npm", "bun"])).toEqual([
      "npm",
      "bun",
    ]);
  });

  it("excludes managers that don't support a command type", () => {
    expect(getSupportedPkgManagers("create", ["npm", "deno"])).toEqual([
      "npm",
    ]);
  });
});

describe("getCommand — add", () => {
  const cases: [PackageManager, string][] = [
    ["npm", "npm install gramio"],
    ["yarn", "yarn add gramio"],
    ["pnpm", "pnpm add gramio"],
    ["bun", "bun add gramio"],
    ["deno", "deno add npm:gramio"],
    ["ni", "ni gramio"],
  ];

  for (const [pm, expected] of cases) {
    it(`${pm}`, () => {
      expect(getCommand(pm, "add", "gramio")).toBe(expected);
    });
  }
});

describe("getCommand — add dev", () => {
  it("npm uses -D", () => {
    expect(getCommand("npm", "add", "gramio", { dev: true })).toBe(
      "npm install -D gramio"
    );
  });

  it("bun uses -d", () => {
    expect(getCommand("bun", "add", "gramio", { dev: true })).toBe(
      "bun add -d gramio"
    );
  });
});

describe("getCommand — run", () => {
  const cases: [PackageManager, string][] = [
    ["npm", "npm run dev"],
    ["yarn", "yarn run dev"],
    ["pnpm", "pnpm run dev"],
    ["bun", "bun run dev"],
    ["deno", "deno task dev"],
    ["ni", "nr dev"],
  ];

  for (const [pm, expected] of cases) {
    it(`${pm}`, () => {
      expect(getCommand(pm, "run", "dev")).toBe(expected);
    });
  }
});

describe("getCommand — dlx", () => {
  const cases: [PackageManager, string][] = [
    ["npm", "npx gramio"],
    ["yarn", "yarn dlx gramio"],
    ["pnpm", "pnpx gramio"],
    ["bun", "bunx gramio"],
    ["ni", "nlx gramio"],
  ];

  for (const [pm, expected] of cases) {
    it(`${pm}`, () => {
      expect(getCommand(pm, "dlx", "gramio")).toBe(expected);
    });
  }
});

describe("getCommand — install (no pkg)", () => {
  it("npm", () => {
    expect(getCommand("npm", "install", undefined)).toBe("npm install");
  });

  it("bun", () => {
    expect(getCommand("bun", "install", undefined)).toBe("bun install");
  });
});

describe("getCommand — create", () => {
  it("yarn strips @version from package", () => {
    expect(getCommand("yarn", "create", "astro@latest")).toBe(
      "yarn create astro"
    );
  });

  it("npm keeps @version", () => {
    expect(getCommand("npm", "create", "astro@latest")).toBe(
      "npm create astro@latest"
    );
  });
});

describe("getCommand — remove", () => {
  it("npm uses uninstall", () => {
    expect(getCommand("npm", "remove", "gramio")).toBe(
      "npm uninstall gramio"
    );
  });

  it("deno adds npm: prefix", () => {
    expect(getCommand("deno", "remove", "gramio")).toBe(
      "deno remove npm:gramio"
    );
  });
});

describe("getCommand — args", () => {
  it("npm adds -- before args", () => {
    expect(getCommand("npm", "add", "gramio", { args: "--save-exact" })).toBe(
      "npm install gramio -- --save-exact"
    );
  });

  it("pnpm does not add --", () => {
    expect(
      getCommand("pnpm", "add", "gramio", { args: "--save-exact" })
    ).toBe("pnpm add gramio --save-exact");
  });

  it("npm run does not add --", () => {
    expect(getCommand("npm", "run", "dev", { args: "--port 3000" })).toBe(
      "npm run dev --port 3000"
    );
  });
});

describe("getCommand — JSR", () => {
  it("deno uses native jsr: prefix", () => {
    expect(
      getCommand("deno", "add", undefined, { jsr: "@gramio/bot" })
    ).toBe("deno add jsr:@gramio/bot");
  });

  it("npm uses npx jsr add", () => {
    expect(
      getCommand("npm", "add", undefined, { jsr: "@gramio/bot" })
    ).toBe("npx jsr add @gramio/bot");
  });

  it("bun uses bunx jsr add", () => {
    expect(
      getCommand("bun", "add", undefined, { jsr: "@gramio/bot" })
    ).toBe("bunx jsr add @gramio/bot");
  });

  it("pnpm uses pnpm dlx jsr add", () => {
    expect(
      getCommand("pnpm", "add", undefined, { jsr: "@gramio/bot" })
    ).toBe("pnpm dlx jsr add @gramio/bot");
  });

  it("deno remove with jsr", () => {
    expect(
      getCommand("deno", "remove", undefined, { jsr: "@gramio/bot" })
    ).toBe("deno remove jsr:@gramio/bot");
  });

  it("npm remove with jsr (no prefix needed)", () => {
    expect(
      getCommand("npm", "remove", undefined, { jsr: "@gramio/bot" })
    ).toBe("npm uninstall @gramio/bot");
  });
});

describe("getCommand — comment", () => {
  it("adds comment with {PKG} placeholder", () => {
    expect(
      getCommand("npm", "add", "gramio", {
        comment: "Using {PKG} to install",
      })
    ).toBe("# Using npm to install\nnpm install gramio");
  });
});

describe("getCommand — prefix", () => {
  it("prepends prefix to command", () => {
    expect(
      getCommand("npm", "add", "gramio", { prefix: "sudo" })
    ).toBe("sudo npm install gramio");
  });
});
