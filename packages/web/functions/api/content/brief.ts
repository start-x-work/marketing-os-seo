import {
  createProvider,
  generateBrief,
  validateNonEmptyString,
} from "@start-x-work/marketing-os-seo-core";
import { resolveApiKey } from "../../_ai-key";
import { type Env, jsonError, readJson } from "../../_shared";

interface BriefRequest {
  topic?: string;
  lang?: string;
  model?: "gemini" | "openai" | "anthropic";
  apiKey?: string;
  geminiApiKey?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await readJson<BriefRequest>(request);
    const topic = validateNonEmptyString(body.topic ?? "", "topic");
    const model = body.model ?? "gemini";
    const apiKey = resolveApiKey(body, env, model);
    const brief = await generateBrief(createProvider(model, apiKey), topic, {
      lang: body.lang ?? "ja",
    });
    return Response.json(brief);
  } catch (error) {
    return jsonError(error, "Brief generation failed");
  }
};
