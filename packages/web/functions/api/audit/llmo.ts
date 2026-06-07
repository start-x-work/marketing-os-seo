import { auditLLMO, validateUrl } from "@start-x-work/marketing-os-seo-core";
import { type Env, jsonError } from "../../_shared";

export const onRequestGet: PagesFunction<Env> = async ({ request }) => {
  try {
    const url = new URL(request.url).searchParams.get("url") ?? "";
    const result = await auditLLMO(validateUrl(url));
    return Response.json(result);
  } catch (error) {
    return jsonError(error, "LLMO audit failed");
  }
};
