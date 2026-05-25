import { GoogleGenAI } from "@google/genai";
import type { AIProvider, CompleteOptions } from "./provider";

export class GeminiProvider implements AIProvider {
  private client: GoogleGenAI;

  constructor(apiKey = process.env.GEMINI_API_KEY) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required");
    }
    this.client = new GoogleGenAI({ apiKey });
  }

  async complete(prompt: string, opts: CompleteOptions = {}): Promise<string> {
    const models = this.client.models as any;
    const res = await models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: opts.temperature ?? 0.2,
        maxOutputTokens: opts.maxTokens,
        responseMimeType: opts.json ? "application/json" : undefined,
      },
    });
    return res.text ?? "";
  }

  async embed(texts: string[]): Promise<number[][]> {
    const models = this.client.models as any;
    const embeddings = await Promise.all(
      texts.map(async (text) => {
        const res = await models.embedContent({
          model: "text-embedding-004",
          contents: text,
        });
        return res.embeddings?.[0]?.values ?? [];
      }),
    );
    return embeddings;
  }
}
