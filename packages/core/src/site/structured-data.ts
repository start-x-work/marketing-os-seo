import type { FetchedPage } from "@start-x-work/mos-kit";
import type { SiteCheck } from "./audit";

export function checkStructuredData(page: FetchedPage): SiteCheck[] {
  const scripts = page
    .$('script[type="application/ld+json"]')
    .toArray()
    .map((node) => page.$(node).text().trim())
    .filter(Boolean);

  const invalid = scripts.filter((script) => {
    try {
      JSON.parse(script);
      return false;
    } catch {
      return true;
    }
  });

  return [
    {
      id: "structured-data.jsonld.present",
      label: "JSON-LD structured data",
      passed: scripts.length > 0,
      detail:
        scripts.length > 0
          ? `${scripts.length} JSON-LD block(s) found`
          : "No JSON-LD blocks found",
    },
    {
      id: "structured-data.jsonld.valid",
      label: "Valid JSON-LD",
      passed: scripts.length > 0 && invalid.length === 0,
      detail:
        scripts.length === 0
          ? "No JSON-LD blocks to validate"
          : invalid.length === 0
            ? "All JSON-LD blocks parse"
            : `${invalid.length} invalid JSON-LD block(s)`,
    },
  ];
}
