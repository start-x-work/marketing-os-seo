import {
  createProvider,
  mapKeywords,
} from "@start-x-work/marketing-os-seo-core";
import { defineCommand } from "citty";
import { render } from "../output/render";

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
        format: {
          type: "string",
          default: "table",
          description: "json, table, or markdown",
        },
      },
      async run({ args }) {
        const related = String(args.related || "")
          .split(",")
          .map((keyword) => keyword.trim())
          .filter(Boolean);
        const result = await mapKeywords(
          createProvider(),
          String(args.seed),
          related,
        );
        render(result, args.format);
      },
    }),
  },
});
