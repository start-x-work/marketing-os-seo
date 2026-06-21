import type { ModelKind } from "@start-x-work/marketing-os-seo-core";
import { CliError, isModelKind } from "@start-x-work/marketing-os-seo-core";

export const formatArg = {
  type: "string" as const,
  default: "table",
  description: "json, table, or markdown",
};

export const quietArg = {
  type: "boolean" as const,
  default: false,
  description: "Suppress the commercial footer line",
};

export const modelArg = {
  type: "string" as const,
  default: "gemini",
  description: "AI model: gemini, openai, or anthropic",
};

export const langArg = {
  type: "string" as const,
  default: "ja",
  description: "Output language (ISO 639-1, default ja)",
};

export function parseModel(value: unknown): ModelKind {
  const model = String(value ?? "gemini");
  if (!isModelKind(model)) {
    throw new CliError(
      `Invalid model "${model}". Use gemini, openai, or anthropic.`,
      "E_INPUT",
    );
  }
  return model;
}

export function parseLang(value: unknown): string {
  const lang = String(value ?? "ja").trim();
  if (!lang) {
    throw new CliError("Language must not be empty", "E_INPUT");
  }
  return lang;
}

export function parseQuiet(value: unknown): boolean {
  return value === true || value === "true";
}
