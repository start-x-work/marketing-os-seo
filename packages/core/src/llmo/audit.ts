import { fetchPage } from "../http/fetch-page";
import { checkAIBots } from "./checks/ai-bots";
import { checkCitability } from "./checks/citability";
import { checkHeadings } from "./checks/headings";
import { checkLlmsTxt } from "./checks/llms-txt";
import { checkStructuredDataForAI } from "./checks/structured-data";
import { computeScore } from "./scoring";

export interface LLMOCheck {
  id: string;
  label: string;
  score: number;
  weight: number;
  detail: string;
}

export interface LLMOAuditResult {
  url: string;
  totalScore: number;
  checks: LLMOCheck[];
  recommendations: string[];
}

export async function auditLLMO(url: string): Promise<LLMOAuditResult> {
  const page = await fetchPage(url);
  const checks: LLMOCheck[] = [
    checkStructuredDataForAI(page),
    checkHeadings(page),
    await checkAIBots(url),
    await checkLlmsTxt(url),
    checkCitability(page),
  ];
  const totalScore = computeScore(checks);
  const recommendations = checks
    .filter((check) => check.score < 70)
    .map((check) => `${check.label}: ${check.detail}`);
  return { url, totalScore, checks, recommendations };
}
