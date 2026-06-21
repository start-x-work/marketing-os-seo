import { defineCommand } from "citty";

export const subCommands = {
  audit: () => import("./commands/audit").then((m) => m.default),
  content: () => import("./commands/content").then((m) => m.default),
  keyword: () => import("./commands/keyword").then((m) => m.default),
};

export default defineCommand({
  meta: { name: "seo", description: "Marketing-OS SEO toolkit" },
  subCommands,
});
