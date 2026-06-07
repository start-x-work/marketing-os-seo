import {
  createProvider,
  generateBrief,
  validateNonEmptyString,
} from "@start-x-work/marketing-os-seo-core";
import { type Env, jsonError, readJson } from "../../_shared";

interface BriefRequest {
  topic?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await readJson<BriefRequest>(request);
    const topic = validateNonEmptyString(body.topic ?? "", "topic");
    const brief = await generateBrief(
      createProvider(env.GEMINI_API_KEY),
      topic,
    );
    return Response.json(brief);
  } catch (error) {
    return jsonError(error, "Brief generation failed");
  }
};
