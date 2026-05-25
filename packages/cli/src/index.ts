#!/usr/bin/env node
import { defineCommand, runMain } from "citty";
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

runMain(main);
