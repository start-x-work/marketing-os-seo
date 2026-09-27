# Changelog

All notable changes to this repository are documented here. This project follows
[Semantic Versioning](https://semver.org/). Versions are per-package
(`@start-x-work/mos-seo` for the CLI, `@start-x-work/marketing-os-seo-core` for
the library).

## [Unreleased]

Additive, backward-compatible changes. No public API was removed or changed, so
no version bump is required to ship these; published `1.1.x` behavior is
preserved.

### Added

- **SSRF-hardened fetch layer** (`@start-x-work/marketing-os-seo-core`): new
  exports `assertPublicUrl`, `assertPublicHttpsUrl`,
  `fetchFollowingPublicRedirects`, `isPrivateOrLoopbackHost`, and the
  `PublicUrlOptions` / `FollowRedirectsOptions` types. Manual redirect
  following with per-hop re-validation, a redirect cap, and rejection of
  private / loopback / link-local / reserved hosts. HTTPS-only by default.
- **Curated AI-crawler data module** (`data/ai-crawlers.ts`): AI crawler
  user-agents grouped into `search-citation` vs `training` categories, exported
  as `AI_CRAWLERS`, `SEARCH_CITATION_CRAWLERS`, `TRAINING_CRAWLERS`,
  `AI_CRAWLER_TOKENS`. Reviewed quarterly (see `data/README.md`).
- **Content-Signal parsing**: `parseContentSignal` and
  `extractContentSignalFromRobots` understand `search` / `ai-input` / `ai-train`
  directives in `robots.txt`.

### Changed

- The LLMO `ai-bots` check now evaluates the full categorized crawler list,
  scores search/citation-bot blocks more severely than training-only blocks,
  and surfaces any `Content-Signal` directive in its detail text. The check's
  result shape is unchanged.
- The `robots.txt` / `llms.txt` / `sitemap.xml` probes now use the SSRF-hardened
  fetch (private/loopback hosts are refused; redirects are capped). `http://`
  targets remain supported to match existing CLI behavior.

### Tests

- SSRF guard tests: rejection of `http:`, non-http(s) schemes, private/loopback
  IP literals (incl. `169.254.169.254`), redirect-to-private, redirect loops,
  and redirect caps.
- Content-Signal and AI-crawler data tests.
- A purity test asserting the pure-core modules import no network/filesystem
  modules and never call `fetch()`.
- CLI output snapshot tests for the human/table, `--format json`, and
  `--format markdown` renderings.
