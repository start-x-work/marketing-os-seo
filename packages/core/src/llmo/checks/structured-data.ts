import type { FetchedPage } from "@start-x-work/mos-kit";
import type { LLMOCheck } from "../audit";

const AI_FRIENDLY_TYPES = new Set([
  "Article",
  "BlogPosting",
  "FAQPage",
  "HowTo",
  "Organization",
  "Product",
  "Service",
  "WebPage",
]);

export function checkStructuredDataForAI(page: FetchedPage): LLMOCheck {
  const blocks = page
    .$('script[type="application/ld+json"]')
    .toArray()
    .flatMap((node) => {
      const text = page.$(node).text().trim();
      try {
        const parsed = JSON.parse(text);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [];
      }
    });
  const types = blocks
    .flatMap((block) =>
      Array.isArray(block["@type"]) ? block["@type"] : [block["@type"]],
    )
    .filter(Boolean);
  const hasHelpfulType = types.some((type) =>
    AI_FRIENDLY_TYPES.has(String(type)),
  );

  return {
    id: "llmo.structured-data",
    label: "AI-readable structured data",
    score: hasHelpfulType ? 100 : blocks.length > 0 ? 60 : 0,
    weight: 3,
    detail: hasHelpfulType
      ? `AI-friendly types: ${types.join(", ")}`
      : "Add Article/FAQ/HowTo/Organization JSON-LD where relevant",
  };
}
