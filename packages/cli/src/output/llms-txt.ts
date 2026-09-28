import {
  buildLlmsTxtDraft,
  type FetchedPage,
  type LlmsTxtDraftInput,
  type LlmsTxtDraftLink,
} from "@start-x-work/marketing-os-seo-core";

/** How many same-origin links to include in the "Key pages" section. */
const MAX_KEY_PAGES = 20;

/**
 * Derive `llms.txt` draft signals from an already-fetched page. Pure: it only
 * reads the parsed DOM and the request URL, and does no I/O of its own.
 */
export function collectLlmsTxtSignals(
  url: string,
  page: FetchedPage,
): LlmsTxtDraftInput {
  const { $ } = page;
  const origin = new URL(url).origin;
  const title = $("title").first().text().trim();
  const summary =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    "";

  const seen = new Set<string>();
  const links: LlmsTxtDraftLink[] = [];
  $("a[href]").each((_, el) => {
    if (links.length >= MAX_KEY_PAGES) {
      return;
    }
    const href = $(el).attr("href")?.trim();
    if (!href || href.startsWith("#")) {
      return;
    }
    let resolved: URL;
    try {
      resolved = new URL(href, url);
    } catch {
      return;
    }
    if (resolved.protocol !== "https:" && resolved.protocol !== "http:") {
      return;
    }
    if (resolved.origin !== origin) {
      return;
    }
    resolved.hash = "";
    const key = resolved.toString();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    const label = $(el).text().trim();
    links.push(label ? { url: key, label } : { url: key });
  });

  const sections =
    links.length > 0 ? [{ title: "Key pages", links }] : undefined;

  return {
    site: origin,
    title: title || origin,
    summary,
    sections,
  };
}

/** Print an `llms.txt` draft to stdout (the `--llms-txt` output mode). */
export function renderLlmsTxt(input: LlmsTxtDraftInput): void {
  console.log(buildLlmsTxtDraft(input));
}
