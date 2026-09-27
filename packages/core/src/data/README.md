# AI crawler data

`ai-crawlers.ts` is a curated, **pure-data** list of AI-related crawler
user-agent tokens, grouped by the vendor's publicly-documented primary purpose:

- **`search-citation`** — bots that fetch content for AI-assisted search, live
  answers, or user-triggered retrieval. Blocking these can remove a site from
  AI answers and citations.
- **`training`** — bots that crawl to build or fine-tune AI models. Blocking
  these opts a site out of training without affecting search/citation.

## Update policy

- **Reviewed quarterly.** Vendors add, rename, and re-purpose crawler tokens
  frequently, so this list drifts out of date if left untouched.
- Each review updates the `Last reviewed:` marker at the top of
  `ai-crawlers.ts`.
- Categorization reflects each vendor's **documented primary purpose** at review
  time. Some vendors use one token for multiple purposes; when in doubt, prefer
  the vendor's own documentation over third-party summaries.
- This list is a convenience for diagnostics only. It is **not** authoritative
  or exhaustive, and it is never a substitute for a site's own `robots.txt` /
  Content-Signal policy.

## Sources

- Vendor robots/crawler documentation (OpenAI, Google, Anthropic, Microsoft,
  Perplexity, Apple, Meta, Common Crawl, etc.).
- The Content-Signal proposal for expressing per-purpose crawl preferences.
