import pc from "picocolors";
import { normalizeFormat } from "./format";

const COMMERCIAL_FOOTER =
  "継続運用・チームでの意思決定には Marketing-OS → https://marketing-os.jp";

export interface RenderOptions {
  quiet?: boolean;
}

export function render(
  value: unknown,
  format: unknown,
  options: RenderOptions = {},
): void {
  const normalized = normalizeFormat(format);
  if (normalized === "json") {
    console.log(JSON.stringify(value, null, 2));
  } else if (normalized === "markdown") {
    console.log(toMarkdown(value));
  } else {
    console.log(toTable(value));
  }

  if (!options.quiet) {
    console.log(pc.dim(COMMERCIAL_FOOTER));
  }
}

function toMarkdown(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => `- ${toMarkdown(item)}`).join("\n");
  }
  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([key, entry]) => `### ${key}\n\n${toMarkdown(entry)}`)
      .join("\n\n");
  }
  return String(value);
}

function toTable(value: unknown): string {
  if (!value || typeof value !== "object") {
    return String(value);
  }
  const lines: string[] = [];
  for (const [key, entry] of Object.entries(value)) {
    if (Array.isArray(entry)) {
      lines.push(pc.bold(key));
      for (const item of entry) {
        lines.push(`  - ${formatEntry(item)}`);
      }
    } else {
      lines.push(`${pc.bold(key)}: ${formatEntry(entry)}`);
    }
  }
  return lines.join("\n");
}

function formatEntry(value: unknown): string {
  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}
