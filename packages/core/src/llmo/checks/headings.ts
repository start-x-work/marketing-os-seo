import type { FetchedPage } from "@start-x-work/mos-kit";
import type { LLMOCheck } from "../audit";

export function checkHeadings(page: FetchedPage): LLMOCheck {
  const headings = page
    .$("h1,h2,h3")
    .toArray()
    .map((node) => page.$(node).text().trim())
    .filter(Boolean);
  const questionLike = headings.filter((heading) =>
    /[?？]|^(what|why|how|when|where|who)\b/i.test(heading),
  );
  const hasHierarchy = page.$("h1").length === 1 && page.$("h2").length > 0;
  const score = Math.min(
    100,
    (hasHierarchy ? 50 : 20) + questionLike.length * 15,
  );

  return {
    id: "llmo.headings",
    label: "Question-oriented heading structure",
    score,
    weight: 2,
    detail: `${headings.length} heading(s), ${questionLike.length} question-like heading(s)`,
  };
}
