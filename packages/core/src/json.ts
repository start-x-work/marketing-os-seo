import { ParseError } from "./errors";

export function parseJsonFromText<T>(text: string): T {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = fenced?.[1]?.trim() ?? trimmed;
  try {
    return JSON.parse(jsonText) as T;
  } catch (error) {
    throw new ParseError(
      error instanceof Error ? error.message : "invalid JSON",
    );
  }
}
