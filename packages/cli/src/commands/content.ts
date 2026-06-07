import {
  createProvider,
  generateBrief,
  validateNonEmptyString,
} from "@start-x-work/marketing-os-seo-core";
import { defineCommand } from "citty";
import { runSafely } from "../errors";
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
        await runSafely(async () => {
          const result = await generateBrief(
            createProvider(),
            validateNonEmptyString(String(args.topic), "Topic"),
          );
          render(result, args.format);
        });
      },
    }),
  },
});
