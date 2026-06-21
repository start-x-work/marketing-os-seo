import { aiKeysForModel, loadAiKeys } from "./ai-settings";

export interface LlmoCheck {
  id: string;
  label: string;
  score: number;
  weight: number;
  detail: string;
}

export interface LlmoAuditResult {
  url: string;
  totalScore: number;
  checks: LlmoCheck[];
  recommendations: string[];
}

export interface SiteCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface SiteAuditResult {
  url: string;
  checks: SiteCheck[];
  passedCount: number;
  totalCount: number;
}

export interface ContentBriefResult {
  topic: string;
  intent: string;
  outline: string[];
  prompts: string[];
}

export interface KeywordMapResult {
  seed: string;
  keywords: string[];
  intents: Record<string, string>;
  clusters: Record<string, string[]>;
  volumes?: Array<{
    keyword: string;
    estimatedVolume: number | null;
    source: "gsc" | "estimated";
    confidence: "high" | "medium" | "low";
  }>;
  gscRows?: Array<{
    query: string;
    clicks: number;
    impressions: number;
    position: number;
  }>;
}

export async function auditLlmo(url: string): Promise<LlmoAuditResult> {
  return request(`/api/audit/llmo?url=${encodeURIComponent(url)}`);
}

export async function auditSite(url: string): Promise<SiteAuditResult> {
  return request(`/api/audit/site?url=${encodeURIComponent(url)}`);
}

export async function contentBrief(topic: string): Promise<ContentBriefResult> {
  const model = "gemini" as const;
  return request("/api/content/brief", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic,
      model,
      ...aiKeysForModel(loadAiKeys(), model),
    }),
  });
}

export async function keywordMap(input: {
  seed: string;
  related?: string[];
  siteUrl?: string;
  volume?: boolean;
  lang?: string;
  model?: "gemini" | "openai" | "anthropic";
}): Promise<KeywordMapResult> {
  const model = input.model ?? "gemini";
  return request("/api/keyword/map", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      model,
      ...aiKeysForModel(loadAiKeys(), model),
    }),
  });
}

async function request<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, init);
  const json = await res.json().catch(() => undefined);
  if (!res.ok) {
    const message =
      typeof json === "object" && json && "error" in json
        ? String(json.error)
        : "Request failed";
    throw new Error(message);
  }
  return json as T;
}
