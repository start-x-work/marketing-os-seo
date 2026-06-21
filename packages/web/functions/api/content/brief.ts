import {
  createProvider,
  generateBrief,
  validateNonEmptyString,
} from "@start-x-work/marketing-os-seo-core";
import { type Env, jsonError, readJson } from "../../_shared";

interface BriefRequest {
  topic?: string;
  lang?: string;
  model?: "gemini" | "openai" | "anthropic";
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await readJson<BriefRequest>(request);
    const topic = validateNonEmptyString(body.topic ?? "", "topic");
    const model = body.model ?? "gemini";
    const apiKey =
      model === "openai"
        ? env.OPENAI_API_KEY
        : model === "anthropic"
          ? env.ANTHROPIC_API_KEY
          : env.GEMINI_API_KEY;
    const brief = await generateBrief(createProvider(model, apiKey), topic, {
      lang: body.lang ?? "ja",
    });
    return Response.json(brief);
  } catch (error) {
    return jsonError(error, "Brief generation failed");
  }
};
