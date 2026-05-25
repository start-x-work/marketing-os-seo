export type RenderFormat = "json" | "table" | "markdown";

export function normalizeFormat(format: unknown): RenderFormat {
  if (format === "json" || format === "markdown" || format === "table") {
    return format;
  }
  return "table";
}
