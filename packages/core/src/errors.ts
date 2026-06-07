export class CliError extends Error {
  constructor(
    message: string,
    public readonly code = "E_GENERIC",
  ) {
    super(message);
    this.name = "CliError";
  }
}

export class FetchError extends CliError {
  constructor(url: string, status: number, detail?: string) {
    const suffix = detail ? `: ${detail}` : "";
    super(`Failed to fetch ${url} (status ${status})${suffix}`, "E_FETCH");
  }
}

export class AIError extends CliError {
  constructor(detail: string) {
    super(`AI provider error: ${detail}`, "E_AI");
  }
}

export class ParseError extends CliError {
  constructor(detail: string) {
    super(`Failed to parse provider response: ${detail}`, "E_PARSE");
  }
}
