import {
  createProvider,
  estimateVolume,
  fetchGSCQueries,
  mapKeywords,
  toKeywordNodes,
  validateNonEmptyString,
  validateUrl,
} from "@start-x-work/marketing-os-seo-core";
import { defineCommand } from "citty";
import { runSafely } from "../errors";
import { render } from "../output/render";
import {
  formatArg,
  langArg,
  modelArg,
  parseLang,
  parseModel,
  parseQuiet,
  quietArg,
} from "../shared";

export default defineCommand({
  meta: { name: "keyword", description: "Keyword research tools" },
  subCommands: {
    map: defineCommand({
      meta: { name: "map", description: "Map keyword intent and clusters" },
      args: {
        seed: {
          type: "positional",
          required: true,
          description: "Seed keyword",
        },
        related: {
          type: "string",
          default: "",
          description: "Comma-separated related keywords",
        },
        volume: {
          type: "boolean",
          default: false,
          description: "Attach volume estimates (GSC data preferred)",
        },
        "site-url": {
          type: "string",
          default: "",
          description: "Search Console property URL for volume data",
        },
        format: formatArg,
        lang: langArg,
        model: modelArg,
        quiet: quietArg,
      },
      async run({ args }) {
        await runSafely(async () => {
          const related = String(args.related || "")
            .split(",")
            .map((keyword) => keyword.trim())
            .filter(Boolean);
          const seed = validateNonEmptyString(
            String(args.seed),
            "Seed keyword",
          );
          const lang = parseLang(args.lang);
          const result = await mapKeywords(
            createProvider(parseModel(args.model)),
            seed,
            related,
            { lang },
          );

          if (args.volume) {
            const siteUrl = String(args["site-url"] || "").trim();
            const gscRows = siteUrl
              ? await fetchGSCQueries({
                  siteUrl: validateUrl(siteUrl),
                  startDate: daysAgo(30),
                  endDate: daysAgo(1),
                  limit: 250,
                }).catch(() => [])
              : [];
            result.volumes = estimateVolume(toKeywordNodes(result, gscRows));
          }

          render(result, args.format, { quiet: parseQuiet(args.quiet) });
        });
      },
    }),
  },
});

function daysAgo(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}
