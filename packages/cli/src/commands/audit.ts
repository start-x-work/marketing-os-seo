import {
  auditLLMO,
  auditSite,
  validateUrl,
} from "@start-x-work/marketing-os-seo-core";
import { defineCommand } from "citty";
import { runSafely } from "../errors";
import { render } from "../output/render";
import { formatArg, parseQuiet, quietArg } from "../shared";

export default defineCommand({
  meta: { name: "audit", description: "Run SEO audits" },
  subCommands: {
    llmo: defineCommand({
      meta: { name: "llmo", description: "Audit LLMO/AEO readiness" },
      args: {
        url: {
          type: "positional",
          required: true,
          description: "URL to audit",
        },
        format: formatArg,
        quiet: quietArg,
      },
      async run({ args }) {
        await runSafely(async () => {
          const result = await auditLLMO(validateUrl(String(args.url)));
          render(result, args.format, { quiet: parseQuiet(args.quiet) });
        });
      },
    }),
    site: defineCommand({
      meta: { name: "site", description: "Audit technical SEO basics" },
      args: {
        url: {
          type: "positional",
          required: true,
          description: "URL to audit",
        },
        format: formatArg,
        quiet: quietArg,
      },
      async run({ args }) {
        await runSafely(async () => {
          const result = await auditSite(validateUrl(String(args.url)));
          render(result, args.format, { quiet: parseQuiet(args.quiet) });
        });
      },
    }),
  },
});
