#!/usr/bin/env node
import { CliError } from "@start-x-work/marketing-os-seo-core";
import { defineCommand, runMain } from "citty";
import pc from "picocolors";
import audit from "./commands/audit";
import content from "./commands/content";
import keyword from "./commands/keyword";

const main = defineCommand({
  meta: { name: "mos-seo", description: "Marketing-OS SEO toolkit" },
  subCommands: {
    audit,
    content,
    keyword,
  },
});

runMain(main).catch((error: unknown) => {
  if (error instanceof CliError) {
    console.error(pc.red(`Error [${error.code}]: ${error.message}`));
    process.exit(1);
  }
  throw error;
});
