import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Guards the "pure core" subset: modules that must never reach the network or
 * filesystem, so they stay safe to bundle anywhere (including the browser) and
 * cheap to unit test. This is a static-source check, not a runtime one.
 */

const here = dirname(fileURLToPath(import.meta.url));

// Modules that must be pure: no network, no filesystem, no fetch.
const PURE_MODULES = [
  "content-signal.ts",
  "data/ai-crawlers.ts",
  "llmo/scoring.ts",
  "llmo/llms-txt-draft.ts",
  "llmo/checks/structured-data.ts",
  "llmo/checks/headings.ts",
  "llmo/checks/citability.ts",
  "site/meta.ts",
  "site/structured-data.ts",
];

const FORBIDDEN_MODULE_IMPORTS = [
  "node:fs",
  "node:net",
  "node:dns",
  "node:http",
  "node:https",
  "node:tls",
  "./safe-fetch",
  "../../safe-fetch",
  "./keyword/gsc",
];

describe("pure core modules", () => {
  for (const rel of PURE_MODULES) {
    describe(rel, () => {
      const source = readFileSync(join(here, rel), "utf8");

      it("does not call fetch()", () => {
        expect(source).not.toMatch(/\bfetch\s*\(/);
      });

      it("does not import network/filesystem modules", () => {
        for (const mod of FORBIDDEN_MODULE_IMPORTS) {
          expect(source).not.toContain(`"${mod}"`);
          expect(source).not.toContain(`'${mod}'`);
        }
      });
    });
  }
});
