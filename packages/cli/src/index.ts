#!/usr/bin/env node
import { CliError } from "@start-x-work/marketing-os-seo-core";
import { defineCommand, runMain } from "citty";
import pc from "picocolors";
import { subCommands } from "./command";

const main = defineCommand({
  meta: {
    name: "mos-seo",
    description: "Marketing-OS SEO toolkit",
  },
  subCommands,
});

runMain(main).catch((error: unknown) => {
  if (error instanceof CliError) {
    console.error(pc.red(`Error [${error.code}]: ${error.message}`));
    process.exit(1);
  }
  throw error;
});
