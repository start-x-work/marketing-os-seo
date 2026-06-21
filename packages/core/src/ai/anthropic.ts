import { AIError } from "../errors";
import type { AIProvider, CompleteOptions } from "./provider";

export class AnthropicProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey?: string) {
    const resolved =
      apiKey ??
      (typeof process === "undefined"
        ? undefined
        : process.env.ANTHROPIC_API_KEY);
    if (!resolved) {
      throw new AIError("ANTHROPIC_API_KEY is required");
    }
    this.apiKey = resolved;
  }

  async complete(prompt: string, opts: CompleteOptions = {}): Promise<string> {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-latest",
          max_tokens: opts.maxTokens ?? 4096,
          temperature: opts.temperature ?? 0.2,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        throw new Error(`${res.status} ${await res.text()}`);
      }
      const json = (await res.json()) as {
        content?: Array<{ type?: string; text?: string }>;
      };
      const text =
        json.content
          ?.filter((block) => block.type === "text")
          .map((block) => block.text ?? "")
          .join("") ?? "";
      return text;
    } catch (error) {
      throw new AIError(
        error instanceof Error ? error.message : "Anthropic completion failed",
      );
    }
  }

  async embed(_texts: string[]): Promise<number[][]> {
    throw new AIError(
      "Anthropic provider does not support embeddings; use gemini or openai for keyword map",
    );
  }
}
