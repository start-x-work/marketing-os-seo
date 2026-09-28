import { extractContentSignalFromRobots } from "../../content-signal";
import { AI_CRAWLERS } from "../../data/ai-crawlers";
import { fetchFollowingPublicRedirects } from "../../safe-fetch";
import type { LLMOCheck } from "../audit";

function isBotBlocked(robotsTxt: string, token: string): boolean {
  const pattern = new RegExp(
    `User-agent:\\s*${token}[\\s\\S]*?Disallow:\\s*/`,
    "i",
  );
  return pattern.test(robotsTxt);
}

export async function checkAIBots(url: string): Promise<LLMOCheck> {
  const robotsUrl = `${new URL(url).origin}/robots.txt`;
  try {
    const res = await fetchFollowingPublicRedirects(
      robotsUrl,
      {},
      { allowHttp: true },
    );
    if (!res.ok) {
      return {
        id: "llmo.ai-bots",
        label: "AI bot crawl policy",
        score: 50,
        weight: 2,
        detail: `robots.txt returned ${res.status}; no explicit AI bot block detected`,
      };
    }
    const text = await res.text();

    const blocked = AI_CRAWLERS.filter((crawler) =>
      isBotBlocked(text, crawler.token),
    );
    const blockedSearch = blocked.filter(
      (crawler) => crawler.category === "search-citation",
    );

    const contentSignal = extractContentSignalFromRobots(text);
    const signalNote = contentSignal
      ? ` Content-Signal present (search=${contentSignal.search ?? "unspecified"}, ai-input=${contentSignal["ai-input"] ?? "unspecified"}, ai-train=${contentSignal["ai-train"] ?? "unspecified"}).`
      : "";

    // Blocking search/citation bots is the most costly for AI visibility.
    const score = blockedSearch.length > 0 ? 20 : blocked.length > 0 ? 60 : 100;
    const detail =
      blocked.length === 0
        ? `No explicit block for the ${AI_CRAWLERS.length} tracked AI crawlers.${signalNote}`
        : `Blocked: ${blocked.map((c) => c.token).join(", ")}${
            blockedSearch.length > 0
              ? " (includes search/citation bots, which can suppress AI answers)"
              : " (training bots only)"
          }.${signalNote}`;

    return {
      id: "llmo.ai-bots",
      label: "AI bot crawl policy",
      score,
      weight: 2,
      detail,
    };
  } catch (error) {
    return {
      id: "llmo.ai-bots",
      label: "AI bot crawl policy",
      score: 50,
      weight: 2,
      detail:
        error instanceof Error ? error.message : "robots.txt check failed",
    };
  }
}
