# Changelog

All notable changes to this repository are documented here. This project follows
[Semantic Versioning](https://semver.org/). Versions are per-package
(`@start-x-work/mos-seo` for the CLI, `@start-x-work/marketing-os-seo-core` for
the library).

## [Unreleased]

## [1.2.0] - 2026-09-28

`@start-x-work/mos-seo` 1.1.1 → **1.2.0**; `@start-x-work/marketing-os-seo-core`
**1.2.0** (first npm publish of the library).

Additive, backward-compatible changes: no public API was removed or changed, and
published `1.1.x` behavior is preserved. The minor version is bumped because new
features were added (SemVer).

### Release

- `@start-x-work/marketing-os-seo-core` now ships only `dist/` (`"files"`), is
  published with public access (`publishConfig`), and builds itself before
  publishing (`prepublishOnly`) so a stale or missing `dist/` cannot be released.
- `@start-x-work/mos-seo` builds the whole workspace before publishing
  (`prepublishOnly`), because it bundles the core library.

### Added

- **GEO / LLMO audit module** (`@start-x-work/marketing-os-seo-core`, new
  `./geo` subpath — `@start-x-work/marketing-os-seo-core/geo`): the canonical
  home for the heuristic GEO audit that was previously duplicated in
  Marketing-OS `lib/geo-seo-audit.ts`. Pure, network-independent exports
  `analyzePageHtml`, `analyzeRobotsTxtForBots`, `analyzeInfrastructureFromHeaders`,
  `computeGeoAuditFromContent`, `buildGeoAuditHttpErrorPayload`,
  `buildGeoAuditFetchErrorPayload`, `geoAuditHeadersToRecord`,
  `buildLlmsTxtDraft` (Japanese variant), `GEO_AI_CRAWLER_BOTS`, and the
  `GeoPageSignals` / `GeoRobotsBotStatus` / `GeoInfrastructureSignals` /
  `GeoSeoAuditResult` / `GeoAuditFetchErrorPayload` types. Exposed on a dedicated
  `./geo` subpath so it does not collide with the top-level `buildLlmsTxtDraft`
  (English) / `assertPublicHttpsUrl` (global-fetch) exports, which keep different
  signatures. Covered by golden tests mirroring Marketing-OS's suite and added to
  the pure-core purity guard. Marketing-OS re-exports this subpath to retire its
  duplicate copy (keeping only its Worker-specific SSRF fetch layer local).
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
- **`llms.txt` draft generator** (`@start-x-work/marketing-os-seo-core`): new
  pure function `buildLlmsTxtDraft(input)` plus the `LlmsTxtDraftInput`,
  `LlmsTxtDraftSection`, `LlmsTxtDraftLink` types and the
  `LLMS_TXT_GUIDANCE_NOTE` constant. It composes an advisory
  [`llms.txt`](https://llmstxt.org/) draft (title / summary / sections with key
  URLs) from already-collected signals. The draft always opens with a guidance
  note making explicit that it is advisory and does NOT command AI behavior. The
  function does no network or filesystem I/O and is covered by the pure-core
  purity test.
- **CLI `--llms-txt` output** (`@start-x-work/mos-seo`): `audit site` and
  `audit llmo` accept `--llms-txt`, which fetches the page and prints the
  advisory `llms.txt` draft (from its title, description, and same-origin
  links). Existing `--format json` / `table` / `markdown` output and exit codes
  are unchanged.

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
- Unit tests for `buildLlmsTxtDraft` (advisory guidance-note prefix, title /
  summary / section rendering, empty-input handling, determinism) and a CLI
  snapshot test for the `--llms-txt` output. `llms-txt-draft.ts` is added to the
  pure-core purity guard.
