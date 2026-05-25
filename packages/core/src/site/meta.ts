import type { FetchedPage } from "../http/fetch-page";
import type { SiteCheck } from "./audit";

export function checkMeta(page: FetchedPage): SiteCheck[] {
  const { $ } = page;
  const title = $("title").first().text().trim();
  const description =
    $('meta[name="description"]').attr("content")?.trim() ?? "";
  const canonical = $('link[rel="canonical"]').attr("href")?.trim() ?? "";
  const h1Count = $("h1").length;

  return [
    {
      id: "meta.title",
      label: "Title tag",
      passed: title.length >= 10 && title.length <= 70,
      detail: title ? `Title length: ${title.length}` : "Missing title tag",
    },
    {
      id: "meta.description",
      label: "Meta description",
      passed: description.length >= 50 && description.length <= 180,
      detail: description
        ? `Description length: ${description.length}`
        : "Missing meta description",
    },
    {
      id: "meta.canonical",
      label: "Canonical URL",
      passed: Boolean(canonical),
      detail: canonical || "Missing canonical link",
    },
    {
      id: "meta.h1",
      label: "Single H1",
      passed: h1Count === 1,
      detail: `H1 count: ${h1Count}`,
    },
  ];
}
