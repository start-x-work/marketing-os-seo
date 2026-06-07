import { auditSite, validateUrl } from "@start-x-work/marketing-os-seo-core";
import { type Env, jsonError } from "../../_shared";

export const onRequestGet: PagesFunction<Env> = async ({ request }) => {
  try {
    const url = new URL(request.url).searchParams.get("url") ?? "";
    const result = await auditSite(validateUrl(url));
    return Response.json(result);
  } catch (error) {
    return jsonError(error, "Site audit failed");
  }
};
