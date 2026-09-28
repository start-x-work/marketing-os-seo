import {
  auditLLMO,
  auditSite,
  fetchPage,
  validateUrl,
} from "@start-x-work/marketing-os-seo-core";
import { defineCommand } from "citty";
import { runSafely } from "../errors";
import { collectLlmsTxtSignals, renderLlmsTxt } from "../output/llms-txt";
import { render } from "../output/render";
import {
  formatArg,
  llmsTxtArg,
  parseLlmsTxt,
  parseQuiet,
  quietArg,
} from "../shared";

async function printLlmsTxtDraft(url: string): Promise<void> {
  const page = await fetchPage(url);
  renderLlmsTxt(collectLlmsTxtSignals(url, page));
}

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
        "llms-txt": llmsTxtArg,
      },
      async run({ args }) {
        await runSafely(async () => {
          const url = validateUrl(String(args.url));
          if (parseLlmsTxt(args["llms-txt"])) {
            await printLlmsTxtDraft(url);
            return;
          }
          const result = await auditLLMO(url);
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
        "llms-txt": llmsTxtArg,
      },
      async run({ args }) {
        await runSafely(async () => {
          const url = validateUrl(String(args.url));
          if (parseLlmsTxt(args["llms-txt"])) {
            await printLlmsTxtDraft(url);
            return;
          }
          const result = await auditSite(url);
          render(result, args.format, { quiet: parseQuiet(args.quiet) });
        });
      },
    }),
  },
});
