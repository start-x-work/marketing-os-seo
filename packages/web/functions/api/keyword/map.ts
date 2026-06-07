import {
  createProvider,
  mapKeywords,
  validateNonEmptyString,
  validateUrl,
} from "@start-x-work/marketing-os-seo-core";
import { decryptSession, sessionCookie } from "../../_oauth";
import { type Env, getCookie, jsonError, readJson } from "../../_shared";

interface KeywordRequest {
  seed?: string;
  related?: string[];
  siteUrl?: string;
}

interface GscRow {
  query: string;
  clicks: number;
  impressions: number;
  position: number;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await readJson<KeywordRequest>(request);
    const seed = validateNonEmptyString(body.seed ?? "", "seed");
    const related = Array.isArray(body.related) ? body.related : [];
    const result = await mapKeywords(
      createProvider(env.GEMINI_API_KEY),
      seed,
      related,
    );
    const gscRows = body.siteUrl
      ? await fetchGscRowsIfConnected(request, env, validateUrl(body.siteUrl))
      : undefined;

    return Response.json({ ...result, gscRows });
  } catch (error) {
    return jsonError(error, "Keyword mapping failed");
  }
};

async function fetchGscRowsIfConnected(
  request: Request,
  env: Env,
  siteUrl: string,
): Promise<GscRow[] | undefined> {
  const session = await decryptSession(env, getCookie(request, sessionCookie));
  if (!session) {
    return undefined;
  }

  const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate: daysAgo(30),
      endDate: daysAgo(1),
      dimensions: ["query"],
      rowLimit: 20,
    }),
  });

  if (!res.ok) {
    throw new Error(`GSC query failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as {
    rows?: Array<{
      keys?: string[];
      clicks?: number;
      impressions?: number;
      position?: number;
    }>;
  };

  return (json.rows ?? []).map((row) => ({
    query: row.keys?.[0] ?? "",
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    position: row.position ?? 0,
  }));
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}
