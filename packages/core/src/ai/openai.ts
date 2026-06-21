import { AIError } from "../errors";
import type { AIProvider, CompleteOptions } from "./provider";

export class OpenAIProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey?: string) {
    const resolved =
      apiKey ??
      (typeof process === "undefined" ? undefined : process.env.OPENAI_API_KEY);
    if (!resolved) {
      throw new AIError("OPENAI_API_KEY is required");
    }
    this.apiKey = resolved;
  }

  async complete(prompt: string, opts: CompleteOptions = {}): Promise<string> {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: opts.temperature ?? 0.2,
          max_tokens: opts.maxTokens,
          response_format: opts.json ? { type: "json_object" } : undefined,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        throw new Error(`${res.status} ${await res.text()}`);
      }
      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return json.choices?.[0]?.message?.content ?? "";
    } catch (error) {
      throw new AIError(
        error instanceof Error ? error.message : "OpenAI completion failed",
      );
    }
  }

  async embed(texts: string[]): Promise<number[][]> {
    try {
      const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: texts,
        }),
      });
      if (!res.ok) {
        throw new Error(`${res.status} ${await res.text()}`);
      }
      const json = (await res.json()) as {
        data?: Array<{ embedding?: number[] }>;
      };
      return (json.data ?? []).map((row) => row.embedding ?? []);
    } catch (error) {
      throw new AIError(
        error instanceof Error ? error.message : "OpenAI embedding failed",
      );
    }
  }
}
