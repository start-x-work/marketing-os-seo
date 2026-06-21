import {
  createProvider,
  generateBrief,
  validateNonEmptyString,
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
        format: formatArg,
        lang: langArg,
        model: modelArg,
        quiet: quietArg,
      },
      async run({ args }) {
        await runSafely(async () => {
          const result = await generateBrief(
            createProvider(parseModel(args.model)),
            validateNonEmptyString(String(args.topic), "Topic"),
            { lang: parseLang(args.lang) },
          );
          render(result, args.format, { quiet: parseQuiet(args.quiet) });
        });
      },
    }),
  },
});
