/**
 * Public API surface for @start-x-work/marketing-os-seo-core v1.0+.
 * Semver-stable: avoid breaking changes to these exports after 1.0.0.
 */

export {
  type AIProvider,
  type CompleteOptions,
  createProvider,
  isModelKind,
  type ModelKind,
} from "./ai";
export {
  type BriefOptions,
  type ContentBrief,
  generateBrief,
} from "./content/brief";
export { AIError, CliError, FetchError } from "./errors";
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
