export interface AiKeys {
  gemini?: string;
  openai?: string;
  anthropic?: string;
}

const STORAGE_KEY = "mos-ai-keys";

export function loadAiKeys(): AiKeys {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw) as AiKeys;
  } catch {
    return {};
  }
}

export function saveAiKeys(keys: AiKeys): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

export function aiKeysForModel(
  keys: AiKeys,
  model: "gemini" | "openai" | "anthropic" = "gemini",
): { apiKey?: string; geminiApiKey?: string; openaiApiKey?: string; anthropicApiKey?: string } {
  return {
    geminiApiKey: keys.gemini,
    openaiApiKey: keys.openai,
    anthropicApiKey: keys.anthropic,
    apiKey:
      model === "openai"
        ? keys.openai
        : model === "anthropic"
          ? keys.anthropic
          : keys.gemini,
  };
}
