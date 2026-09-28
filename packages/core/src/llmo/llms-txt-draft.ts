/**
 * Pure builder for an `llms.txt` *draft* (spec item N1-2).
 *
 * This module is intentionally pure: no network, no filesystem, no `fetch`.
 * It only turns already-collected, audited signals into a Markdown string a
 * human can review and edit before publishing at `/llms.txt`.
 *
 * The generated draft deliberately opens with a guidance note making explicit
 * that `llms.txt` is advisory: it documents and links to content, it does NOT
 * command, control, or guarantee any AI/LLM behavior. See https://llmstxt.org/.
 */

/** A single link entry inside an `llms.txt` section. */
export interface LlmsTxtDraftLink {
  /** Absolute or site-relative URL of the resource. */
  url: string;
  /** Human-readable label. Falls back to the URL when omitted. */
  label?: string;
  /** Optional one-line note describing the resource. */
  note?: string;
}

/** An `## H2` section grouping related links. */
export interface LlmsTxtDraftSection {
  /** Section heading (rendered as `## <title>`). */
  title: string;
  /** Key URLs to list under the section. */
  links: LlmsTxtDraftLink[];
}

/** Input signals used to compose an `llms.txt` draft. */
export interface LlmsTxtDraftInput {
  /** Site origin or base URL the draft is for. */
  site: string;
  /** Site / project name, rendered as the `# H1` title. Defaults to `site`. */
  title?: string;
  /** Short summary, rendered as the leading blockquote. */
  summary?: string;
  /** Optional free-text paragraphs placed after the summary. */
  notes?: string[];
  /** Optional `## H2` sections listing key URLs. */
  sections?: LlmsTxtDraftSection[];
}

/**
 * Advisory note that every draft opens with. Makes explicit that `llms.txt`
 * is guidance for humans to review and does NOT command AI behavior.
 */
export const LLMS_TXT_GUIDANCE_NOTE =
  "> [!NOTE]\n" +
  "> This is an advisory `llms.txt` DRAFT generated for human review — not a\n" +
  "> published file. `llms.txt` documents and links to content for LLMs; it\n" +
  "> does NOT command, control, or guarantee any AI/LLM behavior, and no AI\n" +
  "> system is obligated to read or follow it. Review and edit before\n" +
  "> publishing at /llms.txt. See https://llmstxt.org/.";

function cleanLine(value: string): string {
  // Collapse newlines so a single Markdown line item stays on one line.
  return value.replace(/\s+/g, " ").trim();
}

function renderLink(link: LlmsTxtDraftLink): string | null {
  const url = cleanLine(link.url ?? "");
  if (!url) {
    return null;
  }
  const label = cleanLine(link.label ?? "") || url;
  const note = cleanLine(link.note ?? "");
  return note ? `- [${label}](${url}): ${note}` : `- [${label}](${url})`;
}

/**
 * Build an `llms.txt` draft from audited signals.
 *
 * Pure and deterministic: the same input always yields the same string. The
 * result always begins with {@link LLMS_TXT_GUIDANCE_NOTE}.
 */
export function buildLlmsTxtDraft(input: LlmsTxtDraftInput): string {
  const site = cleanLine(input.site ?? "");
  const title = cleanLine(input.title ?? "") || site || "Untitled site";
  const blocks: string[] = [LLMS_TXT_GUIDANCE_NOTE, `# ${title}`];

  const summary = cleanLine(input.summary ?? "");
  if (summary) {
    blocks.push(`> ${summary}`);
  }

  for (const note of input.notes ?? []) {
    const text = cleanLine(note);
    if (text) {
      blocks.push(text);
    }
  }

  for (const section of input.sections ?? []) {
    const heading = cleanLine(section.title ?? "");
    const items = (section.links ?? [])
      .map(renderLink)
      .filter((line): line is string => line !== null);
    if (!heading || items.length === 0) {
      continue;
    }
    blocks.push(`## ${heading}\n${items.join("\n")}`);
  }

  // Blocks are separated by a blank line; trailing newline for a POSIX file.
  return `${blocks.join("\n\n")}\n`;
}
