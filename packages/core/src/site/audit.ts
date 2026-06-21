import { fetchPage } from "@start-x-work/mos-kit";
import { z } from "zod";
import { checkCrawlability } from "./crawlability";
import { checkMeta } from "./meta";
import { checkStructuredData } from "./structured-data";

export const SiteCheckSchema = z.object({
  id: z.string(),
  label: z.string(),
  passed: z.boolean(),
  detail: z.string(),
});
export type SiteCheck = z.infer<typeof SiteCheckSchema>;

export interface SiteAuditResult {
  url: string;
  checks: SiteCheck[];
  passedCount: number;
  totalCount: number;
}

export async function auditSite(url: string): Promise<SiteAuditResult> {
  const page = await fetchPage(url);
  const checks: SiteCheck[] = [
    ...checkMeta(page),
    ...checkStructuredData(page),
    ...(await checkCrawlability(url)),
  ];
  return {
    url,
    checks,
    passedCount: checks.filter((check) => check.passed).length,
    totalCount: checks.length,
  };
}
