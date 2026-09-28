/**
 * Curated list of AI-related crawlers, grouped by the publicly-documented
 * purpose of each user-agent token.
 *
 * This module is intentionally **pure data** — it imports nothing, performs no
 * network or filesystem access, and can be safely bundled anywhere.
 *
 * Categories
 * ----------
 * - `search-citation`: bots that fetch content to surface it in AI-assisted
 *   search results or live answers, or that fetch on behalf of a user's query.
 *   Blocking these can remove a site from AI answers and citations.
 * - `training`: bots that crawl to build or fine-tune AI models. Blocking these
 *   opts a site out of model training without affecting search/citation.
 *
 * Notes
 * -----
 * - Some vendors use a single token for multiple purposes, or change behavior
 *   over time. Categorization here reflects the vendor's documented *primary*
 *   purpose at the time of the last review.
 * - This list is reviewed **quarterly** (see ./README.md). It is a convenience
 *   for diagnostics, not an authoritative or exhaustive registry.
 *
 * Last reviewed: 2026-09 (Q3 2026).
 */

export type AiCrawlerCategory = "search-citation" | "training";

export interface AiCrawler {
  /** User-agent token as it appears in a robots.txt `User-agent:` line. */
  readonly token: string;
  /** Operating vendor / product. */
  readonly vendor: string;
  /** Primary documented purpose of this token. */
  readonly category: AiCrawlerCategory;
}

/**
 * Bots that fetch content for AI-assisted search, live answers, or
 * user-triggered retrieval. Blocking these can suppress AI citations.
 */
export const SEARCH_CITATION_CRAWLERS: readonly AiCrawler[] = [
  { token: "Googlebot", vendor: "Google Search", category: "search-citation" },
  {
    token: "Bingbot",
    vendor: "Microsoft Bing / Copilot",
    category: "search-citation",
  },
  {
    token: "OAI-SearchBot",
    vendor: "OpenAI (ChatGPT Search)",
    category: "search-citation",
  },
  {
    token: "ChatGPT-User",
    vendor: "OpenAI (user-triggered)",
    category: "search-citation",
  },
  {
    token: "PerplexityBot",
    vendor: "Perplexity (index)",
    category: "search-citation",
  },
  {
    token: "Perplexity-User",
    vendor: "Perplexity (user-triggered)",
    category: "search-citation",
  },
  {
    token: "Claude-User",
    vendor: "Anthropic (user-triggered)",
    category: "search-citation",
  },
  {
    token: "Claude-SearchBot",
    vendor: "Anthropic (search)",
    category: "search-citation",
  },
  {
    token: "Applebot",
    vendor: "Apple (Siri / Spotlight)",
    category: "search-citation",
  },
  { token: "DuckAssistBot", vendor: "DuckDuckGo", category: "search-citation" },
  {
    token: "Amazonbot",
    vendor: "Amazon (Alexa answers)",
    category: "search-citation",
  },
  {
    token: "meta-externalfetcher",
    vendor: "Meta (user-triggered)",
    category: "search-citation",
  },
] as const;

/**
 * Bots that crawl to build or train AI models. Blocking these opts a site out
 * of training without affecting search/citation.
 */
export const TRAINING_CRAWLERS: readonly AiCrawler[] = [
  { token: "GPTBot", vendor: "OpenAI (training)", category: "training" },
  {
    token: "Google-Extended",
    vendor: "Google (Gemini training token)",
    category: "training",
  },
  { token: "CCBot", vendor: "Common Crawl", category: "training" },
  {
    token: "ClaudeBot",
    vendor: "Anthropic (crawl / training)",
    category: "training",
  },
  {
    token: "anthropic-ai",
    vendor: "Anthropic (legacy token)",
    category: "training",
  },
  {
    token: "Applebot-Extended",
    vendor: "Apple (training opt-out token)",
    category: "training",
  },
  { token: "Bytespider", vendor: "ByteDance", category: "training" },
  {
    token: "Meta-ExternalAgent",
    vendor: "Meta AI (training)",
    category: "training",
  },
  { token: "cohere-ai", vendor: "Cohere", category: "training" },
  { token: "Diffbot", vendor: "Diffbot", category: "training" },
  { token: "Omgilibot", vendor: "Webz.io / Omgili", category: "training" },
  { token: "ImagesiftBot", vendor: "ImageSift", category: "training" },
  { token: "PanguBot", vendor: "Huawei", category: "training" },
  { token: "Timpibot", vendor: "Timpi", category: "training" },
] as const;

/** All known AI crawlers, both categories combined. */
export const AI_CRAWLERS: readonly AiCrawler[] = [
  ...SEARCH_CITATION_CRAWLERS,
  ...TRAINING_CRAWLERS,
] as const;

/** Just the user-agent tokens, for callers that only need the strings. */
export const AI_CRAWLER_TOKENS: readonly string[] = AI_CRAWLERS.map(
  (crawler) => crawler.token,
);
