import {
  createProvider,
  generateBrief,
} from "@start-x-work/marketing-os-seo-core";
import { defineCommand } from "citty";
import { render } from "../output/render";

export default defineCommand({
  meta: { name: "content", description: "Content planning tools" },
  subCommands: {
    brief: defineCommand({
      meta: {
        name: "brief",
        description: "Generate an editable content brief",
      },
      args: {
        topic: {
          type: "positional",
          required: true,
          description: "Topic to brief",
        },
        format: {
          type: "string",
          default: "table",
          description: "json, table, or markdown",
        },
      },
      async run({ args }) {
        const result = await generateBrief(
          createProvider(),
          String(args.topic),
        );
        render(result, args.format);
      },
    }),
  },
});
