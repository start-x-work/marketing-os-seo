/**
 * GEO / LLMO audit subpath entry: `@start-x-work/marketing-os-seo-core/geo`.
 *
 * Exposed as a dedicated subpath (not the top-level index) so the canonical
 * GEO audit API can be re-exported by downstream callers without colliding
 * with the top-level `buildLlmsTxtDraft` / `assertPublicHttpsUrl` exports,
 * which have different (English / global-fetch) signatures.
 */
export * from "./audit";
