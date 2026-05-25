import { auditLLMO, auditSite } from "@start-x-work/marketing-os-seo-core";
import { defineCommand } from "citty";
import { render } from "../output/render";

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
        format: {
          type: "string",
          default: "table",
          description: "json, table, or markdown",
        },
      },
      async run({ args }) {
        const result = await auditLLMO(String(args.url));
        render(result, args.format);
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
        format: {
          type: "string",
          default: "table",
          description: "json, table, or markdown",
        },
      },
      async run({ args }) {
        const result = await auditSite(String(args.url));
        render(result, args.format);
      },
    }),
  },
});
