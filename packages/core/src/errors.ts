import { CliError } from "@start-x-work/mos-kit";

export class ParseError extends CliError {
  constructor(detail: string) {
    super(`Failed to parse provider response: ${detail}`, "E_PARSE");
  }
}
