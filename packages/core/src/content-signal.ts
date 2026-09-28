/**
 * Parser for the Content-Signal preference expression.
 *
 * Content-Signal lets a site state, per purpose, whether it permits its content
 * to be used. It is expressed as a comma-separated list of `key=value` pairs,
 * either in a `Content-Signal:` line inside robots.txt or in a `Content-Signal`
 * HTTP response header, e.g.:
 *
 *   Content-Signal: search=yes, ai-input=no, ai-train=no
 *
 * Recognized purposes:
 * - `search`   — use for building a search index / surfacing in search results.
 * - `ai-input` — use as live input to an AI answer (RAG / grounding).
 * - `ai-train` — use to train or fine-tune an AI model.
 *
 * Values are `yes` / `no`. Unknown keys are preserved verbatim under `others`
 * so callers can inspect them without this parser having to know every future
 * purpose. This module is **pure** — no network or filesystem access.
 */

export type ContentSignalPurpose = "search" | "ai-input" | "ai-train";

export interface ContentSignal {
  /** `true` = allowed, `false` = disallowed, `undefined` = unspecified. */
  readonly search?: boolean;
  readonly "ai-input"?: boolean;
  readonly "ai-train"?: boolean;
  /** Any non-standard keys, with their raw string values. */
  readonly others: Readonly<Record<string, string>>;
}

const KNOWN_PURPOSES: readonly ContentSignalPurpose[] = [
  "search",
  "ai-input",
  "ai-train",
];

function isKnownPurpose(key: string): key is ContentSignalPurpose {
  return (KNOWN_PURPOSES as readonly string[]).includes(key);
}

/**
 * Parse a Content-Signal value (the part after `Content-Signal:`).
 *
 * Robust to surrounding whitespace, mixed case in keys/values, empty segments,
 * and repeated keys (last one wins). Returns `undefined` only when the input is
 * not a string.
 */
export function parseContentSignal(input: string): ContentSignal {
  const others: Record<string, string> = {};
  const known: Partial<Record<ContentSignalPurpose, boolean>> = {};

  for (const rawSegment of input.split(",")) {
    const segment = rawSegment.trim();
    if (!segment) continue;

    const eq = segment.indexOf("=");
    if (eq === -1) continue;

    const key = segment.slice(0, eq).trim().toLowerCase();
    const value = segment.slice(eq + 1).trim();
    if (!key) continue;

    if (isKnownPurpose(key)) {
      const normalized = value.toLowerCase();
      if (normalized === "yes") known[key] = true;
      else if (normalized === "no") known[key] = false;
      // any other value leaves the purpose unspecified
    } else {
      others[key] = value;
    }
  }

  return { ...known, others };
}

/**
 * Extract and parse a `Content-Signal:` directive from robots.txt text.
 * Returns `undefined` when no such directive is present.
 */
export function extractContentSignalFromRobots(
  robotsTxt: string,
): ContentSignal | undefined {
  for (const line of robotsTxt.split(/\r?\n/)) {
    const match = /^\s*content-signal\s*:\s*(.*)$/i.exec(line);
    if (match) return parseContentSignal(match[1] ?? "");
  }
  return undefined;
}
