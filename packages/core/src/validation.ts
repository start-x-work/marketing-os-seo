import { z } from "zod";
import { CliError } from "./errors";

const UrlSchema = z
  .string()
  .trim()
  .url()
  .refine((url) => url.startsWith("http://") || url.startsWith("https://"), {
    message: "URL must start with http:// or https://",
  });

export function validateUrl(input: string): string {
  const result = UrlSchema.safeParse(input);
  if (!result.success) {
    throw new CliError(
      `Invalid URL: ${result.error.issues[0]?.message ?? "URL is invalid"}`,
      "E_INPUT",
    );
  }
  return result.data;
}

export function validateNonEmptyString(input: string, label: string): string {
  const value = input.trim();
  if (!value) {
    throw new CliError(`${label} is required`, "E_INPUT");
  }
  return value;
}
