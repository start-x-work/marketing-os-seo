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
  type ContentSignal,
  type ContentSignalPurpose,
  extractContentSignalFromRobots,
  parseContentSignal,
} from "./content-signal";
export {
  AI_CRAWLER_TOKENS,
  AI_CRAWLERS,
  type AiCrawler,
  type AiCrawlerCategory,
  SEARCH_CITATION_CRAWLERS,
  TRAINING_CRAWLERS,
} from "./data/ai-crawlers";
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
  buildLlmsTxtDraft,
  LLMS_TXT_GUIDANCE_NOTE,
  type LlmsTxtDraftInput,
  type LlmsTxtDraftLink,
  type LlmsTxtDraftSection,
} from "./llmo/llms-txt-draft";
export {
  assertPublicHttpsUrl,
  assertPublicUrl,
  type FollowRedirectsOptions,
  fetchFollowingPublicRedirects,
  isPrivateOrLoopbackHost,
  type PublicUrlOptions,
} from "./safe-fetch";
export {
  auditSite,
  type SiteAuditResult,
  type SiteCheck,
} from "./site/audit";
export { validateNonEmptyString, validateUrl } from "./validation";
