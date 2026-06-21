/**
 * Public API surface for @start-x-work/marketing-os-seo-core v1.0+.
 * Shared infrastructure is provided by @start-x-work/mos-kit.
 * Semver-stable: avoid breaking changes to these exports after 1.0.0.
 */

export {
  AIError,
  type AIProvider,
  CliError,
  COMMERCIAL_HINT,
  type CompleteOptions,
  createProvider,
  FetchError,
  type FetchedPage,
  fetchPage,
  isModelKind,
  type ModelKind,
  render as renderOutput,
} from "@start-x-work/mos-kit";
export {
  type BriefOptions,
  type ContentBrief,
  generateBrief,
} from "./content/brief";
export {
  fetchGSCQueries,
  type GSCOptions,
  type GSCQueryRow,
} from "./keyword/gsc";
export type { Intent } from "./keyword/intent";
export {
  type KeywordMapResult,
  type KeywordNode,
  mapKeywords,
  toKeywordNodes,
} from "./keyword/map";
export {
  estimateVolume,
  type VolumeEstimate,
} from "./keyword/volume";
export {
  auditLLMO,
  type LLMOAuditResult,
  type LLMOCheck,
} from "./llmo/audit";
export {
  auditSite,
  type SiteAuditResult,
  type SiteCheck,
} from "./site/audit";
export { validateNonEmptyString, validateUrl } from "./validation";
