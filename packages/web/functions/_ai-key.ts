export type ModelKind = "gemini" | "openai" | "anthropic";

export interface AiKeyRequest {
  apiKey?: string;
  geminiApiKey?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  model?: ModelKind;
}

export interface AiKeyEnv {
  GEMINI_API_KEY?: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
}

export function resolveApiKey(
  body: AiKeyRequest,
  env: AiKeyEnv,
  model: ModelKind = "gemini",
): string {
  const fromBody =
    body.apiKey?.trim() ||
    (model === "openai"
      ? body.openaiApiKey?.trim()
      : model === "anthropic"
        ? body.anthropicApiKey?.trim()
        : body.geminiApiKey?.trim());
  if (fromBody) {
    return fromBody;
  }

  const fromEnv =
    model === "openai"
      ? env.OPENAI_API_KEY?.trim()
      : model === "anthropic"
        ? env.ANTHROPIC_API_KEY?.trim()
        : env.GEMINI_API_KEY?.trim();
  if (fromEnv) {
    return fromEnv;
  }

  throw new Error(
    "AI API key is required. Add your key in Settings (stored in this browser only). Server-side keys are optional.",
  );
}
