/**
 * GEO / LLMO lightweight audit heuristics (HTML + robots.txt).
 *
 * Pure and network-independent: callers fetch the page/robots elsewhere (using
 * the SSRF-hardened helpers in `../safe-fetch`) and pass the raw text in here.
 *
 * This module is the canonical home for the GEO audit logic. It was previously
 * duplicated in Marketing-OS `lib/geo-seo-audit.ts`; that copy now re-exports
 * from here (`@start-x-work/marketing-os-seo-core/geo`) to end double maintenance.
 * The public API (names, signatures, output shapes, Japanese copy) is preserved
 * verbatim so downstream callers migrate with zero changes.
 */

export const GEO_AI_CRAWLER_BOTS = [
  { id: "GPTBot", label: "OpenAI / ChatGPT 学習", group: "training" as const },
  {
    id: "ChatGPT-User",
    label: "ChatGPT 検索・ブラウジング",
    group: "search" as const,
  },
  {
    id: "ClaudeBot",
    label: "Anthropic / Claude 学習",
    group: "training" as const,
  },
  { id: "Claude-Web", label: "Claude 参照", group: "search" as const },
  { id: "PerplexityBot", label: "Perplexity", group: "search" as const },
  { id: "CCBot", label: "Common Crawl", group: "training" as const },
  { id: "Amazonbot", label: "Amazon Alexa", group: "other" as const },
  { id: "Applebot", label: "Apple", group: "other" as const },
  { id: "Bytespider", label: "ByteDance / TikTok", group: "training" as const },
  {
    id: "Google-Extended",
    label: "Google AI 学習",
    group: "training" as const,
  },
  { id: "Googlebot", label: "Google 検索クロール", group: "search" as const },
  { id: "bingbot", label: "Bing", group: "search" as const },
  {
    id: "meta-externalagent",
    label: "Meta 外部エージェント",
    group: "other" as const,
  },
  {
    id: "anthropic-ai",
    label: "Anthropic（別名）",
    group: "training" as const,
  },
] as const;

export type GeoRobotsBotStatus = {
  user_agent: string;
  label: string;
  group: "training" | "search" | "other";
  /** ルートパス `/` が robots 規則上ブロックされるか（簡易判定） */
  likely_blocked_root: boolean;
  matched_rule: string | null;
};

function stripHtmlToText(html: string): string {
  const noScript = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");
  const noTags = noScript.replace(/<[^>]+>/g, " ");
  return noTags.replace(/\s+/g, " ").trim();
}

function countJapaneseChars(text: string): number {
  const jp = text.match(/[　-〿぀-ゟ゠-ヿ一-龯㐀-䶿]/g);
  return jp ? jp.length : 0;
}

function extractJsonLdBlocks(html: string): string[] {
  const re =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const out: string[] = [];
  for (const match of html.matchAll(re)) {
    const t = match[1]?.trim();
    if (t) out.push(t);
  }
  return out;
}

function jsonLdMentionsTypes(html: string, types: string[]): boolean {
  const blocks = extractJsonLdBlocks(html);
  for (const b of blocks) {
    try {
      const j = JSON.parse(b) as unknown;
      const stack: unknown[] = Array.isArray(j) ? [...j] : [j];
      while (stack.length) {
        const cur = stack.pop();
        if (!cur || typeof cur !== "object") continue;
        const o = cur as Record<string, unknown>;
        const t = o["@type"];
        if (typeof t === "string" && types.includes(t)) return true;
        if (
          Array.isArray(t) &&
          t.some((x) => typeof x === "string" && types.includes(x))
        )
          return true;
        for (const v of Object.values(o)) {
          if (v && typeof v === "object") stack.push(v);
        }
      }
    } catch {
      /* ignore */
    }
  }
  return false;
}

function countJsonLdSameAs(html: string): number {
  let n = 0;
  for (const b of extractJsonLdBlocks(html)) {
    try {
      const walk = (o: unknown): void => {
        if (!o || typeof o !== "object") return;
        const rec = o as Record<string, unknown>;
        const sa = rec.sameAs;
        if (typeof sa === "string" && sa.startsWith("http")) n += 1;
        else if (Array.isArray(sa))
          n += sa.filter(
            (x) => typeof x === "string" && (x as string).startsWith("http"),
          ).length;
        for (const v of Object.values(rec)) {
          if (v && typeof v === "object") walk(v);
        }
      };
      walk(JSON.parse(b));
    } catch {
      /* ignore */
    }
  }
  return n;
}

/** 簡易 robots.txt: 指定 UA セクションで `/` が Disallow されるか */
export function analyzeRobotsTxtForBots(
  robotsBody: string | null,
  testPath = "/",
): GeoRobotsBotStatus[] {
  const lines = (robotsBody ?? "")
    .split(/\r?\n/)
    .map((l) => l.replace(/#.*$/, "").trim())
    .filter(Boolean);

  type Section = {
    agents: string[];
    rules: { type: "allow" | "disallow"; path: string }[];
  };
  const sections: Section[] = [];
  let curAgents: string[] = [];
  let curRules: { type: "allow" | "disallow"; path: string }[] = [];

  const flush = () => {
    if (!curAgents.length && !curRules.length) return;
    const agents = curAgents.length ? curAgents : ["*"];
    sections.push({ agents, rules: [...curRules] });
    curAgents = [];
    curRules = [];
  };

  for (const line of lines) {
    const um = /^user-agent:\s*(.+)$/i.exec(line);
    if (um) {
      const ua = um[1].trim().toLowerCase();
      if (curRules.length > 0) {
        flush();
        curAgents = [ua];
      } else if (curAgents.length > 0) {
        curAgents.push(ua);
      } else {
        curAgents = [ua];
      }
      continue;
    }
    const dm = /^disallow:\s*(.*)$/i.exec(line);
    if (dm) {
      if (!curAgents.length) curAgents = ["*"];
      curRules.push({ type: "disallow", path: dm[1].trim() });
      continue;
    }
    const am = /^allow:\s*(.*)$/i.exec(line);
    if (am) {
      if (!curAgents.length) curAgents = ["*"];
      curRules.push({ type: "allow", path: am[1].trim() });
    }
  }
  flush();

  function pathMatchesRule(path: string, rule: string): boolean {
    if (!rule || rule === "") return false;
    if (rule === "/") return path === "/" || path.startsWith("/");
    return path.startsWith(rule);
  }

  function isBlockedForAgent(
    agentLower: string,
    path: string,
  ): { blocked: boolean; rule: string | null } {
    const applicable = sections.filter((s) =>
      s.agents.some((a) => a === "*" || a === agentLower),
    );
    let blocked = false;
    let ruleHit: string | null = null;
    for (const sec of applicable) {
      let allowWin: string | null = null;
      let disallowWin: string | null = null;
      for (const r of sec.rules) {
        if (r.type === "disallow" && r.path && pathMatchesRule(path, r.path)) {
          if (!disallowWin || r.path.length > disallowWin.length) {
            disallowWin = r.path;
          }
        }
        if (r.type === "allow" && r.path && pathMatchesRule(path, r.path)) {
          if (!allowWin || r.path.length > allowWin.length) {
            allowWin = r.path;
          }
        }
      }
      if (disallowWin) {
        if (!allowWin || disallowWin.length >= allowWin.length) {
          blocked = true;
          ruleHit = `Disallow: ${disallowWin}`;
        }
      }
    }
    return { blocked, rule: ruleHit };
  }

  return GEO_AI_CRAWLER_BOTS.map((b) => {
    const agentLower = b.id.toLowerCase();
    const { blocked, rule } = isBlockedForAgent(agentLower, testPath);
    return {
      user_agent: b.id,
      label: b.label,
      group: b.group,
      likely_blocked_root: blocked,
      matched_rule: rule,
    };
  });
}

export type GeoPageSignals = {
  title: string | null;
  meta_description: string | null;
  canonical: string | null;
  text_char_estimate: number;
  japanese_char_estimate: number;
  h2_count: number;
  h3_count: number;
  has_faq_schema: boolean;
  has_breadcrumb_schema: boolean;
  has_article_schema: boolean;
  has_person_schema: boolean;
  has_org_schema: boolean;
  has_modified_meta: boolean;
  has_wikipedia_outlink: boolean;
  json_ld_block_count: number;
  json_ld_same_as_count: number;
  has_og_title: boolean;
  has_og_image: boolean;
  /** 本文テキスト長 / HTML 長（AI クローラが読めるかの目安。極端に低いと CSR 疑い） */
  text_to_html_ratio: number;
};

export function analyzePageHtml(html: string): GeoPageSignals {
  const titleM = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const title = titleM
    ? titleM[1].replace(/\s+/g, " ").trim().slice(0, 200)
    : null;
  const mdM =
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i.exec(
      html,
    );
  const meta_description = mdM ? mdM[1].trim().slice(0, 500) : null;
  const canM =
    /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i.exec(html);
  const canonical = canM ? canM[1].trim() : null;
  const h2_count = (html.match(/<h2[\s>]/gi) ?? []).length;
  const h3_count = (html.match(/<h3[\s>]/gi) ?? []).length;
  const text = stripHtmlToText(html);
  const japanese_char_estimate = countJapaneseChars(text);
  const text_char_estimate = text.length;
  const htmlLen = Math.max(html.length, 1);
  const text_to_html_ratio =
    Math.round((text_char_estimate / htmlLen) * 1000) / 1000;
  const has_faq_schema = jsonLdMentionsTypes(html, ["FAQPage"]);
  const has_breadcrumb_schema = jsonLdMentionsTypes(html, ["BreadcrumbList"]);
  const has_article_schema = jsonLdMentionsTypes(html, [
    "Article",
    "BlogPosting",
    "NewsArticle",
  ]);
  const has_person_schema = jsonLdMentionsTypes(html, ["Person"]);
  const has_org_schema = jsonLdMentionsTypes(html, [
    "Organization",
    "Corporation",
  ]);
  const has_modified_meta =
    /article:modified_time|datemodified|dateModified|property=["']og:updated_time["']/i.test(
      html,
    );
  const has_wikipedia_outlink =
    /href=["']https?:\/\/[^"']*wikipedia\.org\/wiki\//i.test(html);
  const has_og_title =
    /property=["']og:title["']/i.test(html) ||
    /name=["']twitter:title["']/i.test(html);
  const has_og_image =
    /property=["']og:image["']/i.test(html) ||
    /name=["']twitter:image["']/i.test(html);
  const json_ld_same_as_count = countJsonLdSameAs(html);
  return {
    title,
    meta_description,
    canonical,
    text_char_estimate,
    japanese_char_estimate,
    h2_count,
    h3_count,
    has_faq_schema,
    has_breadcrumb_schema,
    has_article_schema,
    has_person_schema,
    has_org_schema,
    has_modified_meta,
    has_wikipedia_outlink,
    json_ld_block_count: extractJsonLdBlocks(html).length,
    json_ld_same_as_count,
    has_og_title,
    has_og_image,
    text_to_html_ratio,
  };
}

function scoreCitability(s: GeoPageSignals): number {
  let pts = 35;
  const jp = s.japanese_char_estimate;
  if (jp >= 400 && jp <= 900) pts += 30;
  else if (jp >= 300) pts += 18;
  else if (jp >= 150) pts += 8;
  if (s.h2_count >= 3) pts += 15;
  else if (s.h2_count >= 1) pts += 6;
  const plain = (s.title ?? "") + (s.meta_description ?? "");
  if (/とは|ガイド|まとめ|ポイント|結論|要点/.test(plain)) pts += 8;
  return Math.min(100, pts);
}

function scoreEeat(s: GeoPageSignals): number {
  let pts = 25;
  if (s.has_person_schema) pts += 35;
  if (
    /author|著者|執筆|監修/i.test(s.meta_description ?? "") ||
    /author|著者|執筆|監修/i.test(s.title ?? "")
  )
    pts += 15;
  if (s.has_org_schema) pts += 15;
  if (s.has_article_schema) pts += 10;
  return Math.min(100, pts);
}

function scoreSchema(s: GeoPageSignals): number {
  let pts = 20;
  if (s.json_ld_block_count > 0) pts += 25;
  if (s.has_faq_schema) pts += 30;
  if (s.has_article_schema) pts += 15;
  return Math.min(100, pts);
}

function scoreTechnical(_html: string, s: GeoPageSignals): number {
  let pts = 55;
  if (s.canonical) pts += 20;
  if (s.meta_description && s.meta_description.length >= 40) pts += 15;
  if (s.title && s.title.length >= 10) pts += 10;
  return Math.min(100, pts);
}

function scorePlatformHints(s: GeoPageSignals): number {
  let pts = 40;
  if (s.has_faq_schema) pts += 25;
  if (s.h2_count >= 2) pts += 15;
  if (s.has_article_schema) pts += 10;
  if (/\d+%|\d+件|\d+選|最新|比較|完全版/.test(s.title ?? "")) pts += 10;
  return Math.min(100, pts);
}

function scoreBrandAuthority(s: GeoPageSignals): number {
  let pts = 40;
  if (s.has_wikipedia_outlink) pts += 32;
  if (s.has_org_schema) pts += 18;
  if (s.json_ld_same_as_count >= 3) pts += 10;
  else if (s.json_ld_same_as_count >= 1) pts += 5;
  return Math.min(100, pts);
}

/** 指示書 3.1.5: AEO 10% 相当の下位スコア（0–100） */
function scoreAeoReadiness(html: string, s: GeoPageSignals): number {
  let pts = 15;
  if (s.has_faq_schema) pts += 30;
  const qHead = (html.match(/<h[23][^>]*>[^<]*[?？][^<]*<\/h[23]>/gi) ?? [])
    .length;
  pts += Math.min(28, qHead * 8);
  const conv =
    /どうやって|なぜ|とは|いくつ|おすすめ|ベスト|比較|使い方|料金|メリット|デメリット/.test(
      stripHtmlToText(html).slice(0, 2500),
    );
  if (conv) pts += 12;
  const firstBlock = stripHtmlToText(html).slice(0, 400);
  const jpFirst = countJapaneseChars(firstBlock);
  if (jpFirst >= 40 && jpFirst <= 220) pts += 15;
  else if (jpFirst >= 25) pts += 8;
  return Math.min(100, pts);
}

/** 指示書 3.1.5: RAG 構造 10% 相当（0–100） */
function scoreRagStructural(html: string, s: GeoPageSignals): number {
  let pts = 20;
  const lists = (html.match(/<(?:ul|ol)[\s>]/gi) ?? []).length;
  pts += Math.min(25, lists * 6);
  const paras = (html.match(/<p[\s>][\s\S]*?<\/p>/gi) ?? []).length;
  if (paras >= 5) pts += 25;
  else if (paras >= 2) pts += 12;
  if (/\d{1,3}[.%％]|約\s*\d|\d+\s*件|\d{4}年/.test(stripHtmlToText(html)))
    pts += 18;
  if (s.h2_count >= 3) pts += 12;
  return Math.min(100, pts);
}

/** Google AI Overviews 向けのヒューリスティック（0–100） */
function scoreAioReadiness(html: string, s: GeoPageSignals): number {
  let pts = 25;
  if (s.has_breadcrumb_schema) pts += 28;
  if (s.has_faq_schema) pts += 22;
  const lead = stripHtmlToText(html).slice(0, 350);
  const jpLead = countJapaneseChars(lead);
  if (jpLead >= 30) pts += 15;
  if (s.canonical && /^https:/i.test(s.canonical)) pts += 10;
  return Math.min(100, pts);
}

/** Bing / Copilot 系のヒューリスティック（0–100） */
function scoreBingCopilotReadiness(
  s: GeoPageSignals,
  robotsText: string | null,
): number {
  let pts = 35;
  if (s.has_og_title) pts += 22;
  if (s.has_og_image) pts += 18;
  if (robotsText && /indexnow|IndexNow/i.test(robotsText)) pts += 15;
  if (s.has_org_schema || s.has_article_schema) pts += 10;
  return Math.min(100, pts);
}

function scorePlatformCombined(
  s: GeoPageSignals,
  aio: number,
  bing: number,
): number {
  const hints = scorePlatformHints(s);
  return Math.min(100, Math.round(aio * 0.45 + bing * 0.35 + hints * 0.2));
}

/** 指示書 3.1.5 改訂ウェイト（合計 100%） */
function weightedGeoTotalV2(parts: {
  citability: number;
  brand: number;
  eeat: number;
  aeo: number;
  rag: number;
  technical: number;
  schema: number;
  platform: number;
}): number {
  const v =
    parts.citability * 0.2 +
    parts.brand * 0.2 +
    parts.eeat * 0.15 +
    parts.aeo * 0.1 +
    parts.rag * 0.1 +
    parts.technical * 0.1 +
    parts.schema * 0.1 +
    parts.platform * 0.05;
  return Math.round(Math.min(100, Math.max(0, v)));
}

export type GeoInfrastructureSignals = {
  cdn_hint: "cloudflare" | "fastly" | "akamai" | "cloudfront" | "unknown";
  cloudflare_ray: string | null;
  /** Cloudflare 利用時はダッシュボードの AI スクレイパー設定確認を促す */
  cloudflare_ai_scraper_note: string | null;
  text_to_html_ratio: number;
  csr_risk: "low" | "medium" | "high";
};

export type GeoAuditFetchErrorPayload = {
  error: string;
  hint: string;
  upstream_status?: number;
  target_url: string;
};

export function buildGeoAuditHttpErrorPayload(
  status: number,
  targetUrl: string,
): GeoAuditFetchErrorPayload {
  if (status === 522) {
    return {
      error:
        "対象ページのサーバーが時間内に応答しませんでした（Cloudflare 522）。",
      hint: "URLが公開されているか、CloudflareやWAFで外部からの取得を遮断していないか確認してください。少し時間をおいて再実行しても改善しない場合は、対象サイトのCDN/サーバー設定を確認してください。",
      upstream_status: status,
      target_url: targetUrl,
    };
  }
  if (status === 403 || status === 401) {
    return {
      error: "対象ページが外部からの取得を許可していません。",
      hint: "ログインが必要なページ、WAF、Bot対策、IP制限がある場合はGEO監査では取得できません。公開ページのURLで再実行してください。",
      upstream_status: status,
      target_url: targetUrl,
    };
  }
  if (status === 404) {
    return {
      error: "対象ページが見つかりませんでした。",
      hint: "URLの入力間違い、リダイレクト先、公開状態を確認してください。",
      upstream_status: status,
      target_url: targetUrl,
    };
  }
  if (status >= 500) {
    return {
      error: `対象ページのサーバーで一時的なエラーが発生しています（HTTP ${status}）。`,
      hint: "対象サイトが安定して応答しているか確認し、時間をおいて再実行してください。",
      upstream_status: status,
      target_url: targetUrl,
    };
  }
  return {
    error: `対象ページを取得できませんでした（HTTP ${status}）。`,
    hint: "公開ページのURLか、外部からアクセスできるページかを確認してください。",
    upstream_status: status,
    target_url: targetUrl,
  };
}

export function buildGeoAuditFetchErrorPayload(
  error: unknown,
  targetUrl: string,
): GeoAuditFetchErrorPayload {
  const name =
    typeof error === "object" && error && "name" in error
      ? String((error as { name?: unknown }).name)
      : "";
  const message = String((error as Error)?.message || error || "");
  if (name === "AbortError" || /abort|timed out|timeout/i.test(message)) {
    return {
      error: "対象ページの取得が時間内に完了しませんでした。",
      hint: "対象サイトの応答が遅い、CDN/WAFが外部取得を止めている、または一時的に接続しづらい可能性があります。時間をおいて再実行してください。",
      target_url: targetUrl,
    };
  }
  return {
    error: "対象ページに接続できませんでした。",
    hint: "URLが公開されているか、外部からアクセスできるか、CloudflareやWAFで取得が遮断されていないか確認してください。",
    target_url: targetUrl,
  };
}

export function analyzeInfrastructureFromHeaders(
  headers: Record<string, string> | null | undefined,
  page: GeoPageSignals,
): GeoInfrastructureSignals {
  const h = headers ?? {};
  const lk = (k: string) => h[k.toLowerCase()] ?? h[k] ?? "";
  const server = `${lk("server")} ${lk("via")} ${lk("x-cdn")}`.toLowerCase();
  const cfRay = lk("cf-ray") || null;
  let cdn_hint: GeoInfrastructureSignals["cdn_hint"] = "unknown";
  if (cfRay || server.includes("cloudflare")) cdn_hint = "cloudflare";
  else if (server.includes("fastly")) cdn_hint = "fastly";
  else if (server.includes("akamai")) cdn_hint = "akamai";
  else if (server.includes("cloudfront")) cdn_hint = "cloudfront";

  const ratio = page.text_to_html_ratio;
  let csr_risk: GeoInfrastructureSignals["csr_risk"] = "low";
  if (ratio < 0.012) csr_risk = "high";
  else if (ratio < 0.028) csr_risk = "medium";

  const cloudflare_ai_scraper_note =
    cdn_hint === "cloudflare"
      ? "Cloudflare 利用時は「セキュリティ → ボット → AI スクレイパー」で学習用ボットの扱いを確認してください（既定でブロックされやすい構成があります）。"
      : null;

  return {
    cdn_hint,
    cloudflare_ray: cfRay,
    cloudflare_ai_scraper_note,
    text_to_html_ratio: ratio,
    csr_risk,
  };
}

/** fetch レスポンスのヘッダを小文字キーのレコードに（Worker / Node 共通） */
export function geoAuditHeadersToRecord(h: unknown): Record<string, string> {
  if (!h || typeof h !== "object") return {};
  if (typeof (h as Headers).forEach === "function") {
    const out: Record<string, string> = {};
    (h as Headers).forEach((v, k) => {
      out[k.toLowerCase()] = v;
    });
    return out;
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(h as Record<string, unknown>)) {
    if (typeof v === "string") out[k.toLowerCase()] = v;
  }
  return out;
}

export function buildLlmsTxtDraft(opts: {
  siteLabel: string;
  about: string;
  keyPages: { url: string; note: string }[];
  lastUpdatedYmd: string;
}): string {
  const lines = [
    `# ${opts.siteLabel}`,
    "",
    "## 概要",
    opts.about.trim() || "（サイト概要を追記してください）",
    "",
    "## 主要ページ",
    ...opts.keyPages.map((p) => `- ${p.url}: ${p.note}`),
    "",
    "## コンテンツ方針",
    "- 本ファイルはAIへの命令ではなく、主要ページへの案内です。",
    "- 引用時はページタイトル・URL・参照日をセットで示すと扱いやすくなります。",
    `- 最終更新日: ${opts.lastUpdatedYmd}`,
    "",
  ];
  return lines.join("\n");
}

export type GeoSeoAuditResult = {
  url: string;
  fetched_at: string;
  page: GeoPageSignals;
  robots: {
    robots_url: string;
    fetched: boolean;
    http_status: number | null;
    body_snippet: string | null;
    bots: GeoRobotsBotStatus[];
    training_vs_search_note: string;
  };
  infrastructure: GeoInfrastructureSignals;
  scores: {
    citability: number;
    brand_authority: number;
    eeat: number;
    technical_seo: number;
    structured_data: number;
    /** AIO / Bing / 従来プラットフォームヒントの合成（ウェイト 5% に使用） */
    platform_fit: number;
    aeo_readiness: number;
    rag_structural: number;
    aio_readiness: number;
    bing_readiness: number;
    geo_total_0_100: number;
  };
  /** 指示書 3.1.5 の内訳（UI・レポート用） */
  scoring_weights: Record<string, string>;
  guidance_notes: string[];
  llms_txt_draft: string;
  checklist: string[];
};

export function computeGeoAuditFromContent(opts: {
  pageUrl: string;
  html: string;
  robotsUrl: string;
  robotsText: string | null;
  robotsStatus: number | null;
  robotsFetched: boolean;
  /** ページ本体 fetch のレスポンスヘッダ（CDN / Cloudflare 検出用。省略可） */
  pageResponseHeaders?: Record<string, string> | null;
}): GeoSeoAuditResult {
  const page = analyzePageHtml(opts.html);
  const bots = analyzeRobotsTxtForBots(opts.robotsText);
  const citability = scoreCitability(page);
  const brand_authority = scoreBrandAuthority(page);
  const eeat = scoreEeat(page);
  const technical_seo = scoreTechnical(opts.html, page);
  const structured_data = scoreSchema(page);
  const aeo_readiness = scoreAeoReadiness(opts.html, page);
  const rag_structural = scoreRagStructural(opts.html, page);
  const aio_readiness = scoreAioReadiness(opts.html, page);
  const bing_readiness = scoreBingCopilotReadiness(page, opts.robotsText);
  const platform_fit = scorePlatformCombined(
    page,
    aio_readiness,
    bing_readiness,
  );
  const geo_total_0_100 = weightedGeoTotalV2({
    citability,
    brand: brand_authority,
    eeat,
    aeo: aeo_readiness,
    rag: rag_structural,
    technical: technical_seo,
    schema: structured_data,
    platform: platform_fit,
  });

  const infrastructure = analyzeInfrastructureFromHeaders(
    opts.pageResponseHeaders ?? null,
    page,
  );

  let hostname = "site";
  try {
    hostname = new URL(opts.pageUrl).hostname;
  } catch {
    /* */
  }

  const llms_txt_draft = buildLlmsTxtDraft({
    siteLabel: hostname,
    about: page.meta_description || page.title || "",
    keyPages: [{ url: opts.pageUrl, note: page.title || "メインページ" }],
    lastUpdatedYmd: new Date().toISOString().slice(0, 10),
  });

  const trainingBlocked = bots.filter(
    (b) => b.group === "training" && b.likely_blocked_root,
  ).length;
  const searchOk = bots.filter(
    (b) => b.group === "search" && !b.likely_blocked_root,
  ).length;
  const bingbot = bots.find((b) => b.user_agent.toLowerCase() === "bingbot");
  const guidance_notes = [
    "Google公式方針: 生成AI検索向けの最適化は、特殊なAI専用ファイルや過剰な構造化データではなく、従来のSEO基礎・技術的健全性・ユーザー第一の有用なコンテンツが土台です。",
    "LLMO実務方針: Google以外のAI検索も考慮し、コンテンツ設計・内部構造・外部言及・定点観測を分けて管理します。",
    "llms.txt はGoogle検索では必須ではありません。設置する場合も、AIに命令するためではなく、主要ページを案内する軽量な補助ファイルとして扱ってください。",
  ];

  const checklist: string[] = [];
  if (page.japanese_char_estimate < 300)
    checklist.push(
      "本文が短い可能性があります。AI向けの水増しではなく、読者の疑問に直接答える自己完結した説明ブロックを増やしてください。",
    );
  if (page.h2_count < 2)
    checklist.push(
      "H2見出しが少ないため、読者が聞く質問に近い見出しを増やすと、AI検索の取得単位として理解されやすくなります。",
    );
  if (!page.has_faq_schema)
    checklist.push(
      "FAQPage の JSON-LD は必須ではありません。実際にFAQとして成立する本文があるページだけ、画面表示と一致する形で追加してください。",
    );
  if (!page.has_breadcrumb_schema)
    checklist.push(
      "BreadcrumbList の JSON-LD を主要ページに置くと、サイト内の位置関係を検索エンジンとAIが理解しやすくなります。",
    );
  if (!page.has_person_schema)
    checklist.push(
      "記事・解説ページでは、著者名・肩書き・専門領域・Personスキーマを揃えるとE-E-A-Tを補強できます。",
    );
  if (!page.has_org_schema)
    checklist.push(
      "Organizationスキーマで正式名称・ロゴ・URL・問い合わせ先を明示し、ブランドのエンティティ認識を補強してください。",
    );
  if (!page.has_modified_meta)
    checklist.push(
      "更新日・最終更新の明示（メタまたは本文）で鮮度シグナルを出せます",
    );
  if (trainingBlocked >= 3)
    checklist.push(
      "学習用クローラーが広くブロックされています。検索・引用用ボットとは切り分け可能なので方針を確認してください。",
    );
  if (searchOk === 0)
    checklist.push(
      "AI検索・ユーザー指示型ボットがルートでブロックされている可能性があります。AI検索での発見を重視する場合は、学習用ボットと検索用ボットを分けて許可してください。",
    );
  if (infrastructure.cloudflare_ai_scraper_note)
    checklist.push(infrastructure.cloudflare_ai_scraper_note);
  if (infrastructure.csr_risk === "high")
    checklist.push(
      "本文がHTMLに対して極端に少ないです。重要な説明文をJavaScript後挿入や画像内文字だけにせず、初期HTMLに含めてください。",
    );
  else if (infrastructure.csr_risk === "medium")
    checklist.push(
      "本文比率がやや低めです。SSRやプリレンダで重要文面を初期HTMLに含めると安全です。",
    );
  if (bingbot?.likely_blocked_root)
    checklist.push(
      "bingbot がルートでブロックされている可能性があります（ChatGPT の検索参照に影響し得ます）。",
    );
  if (!page.has_og_title || !page.has_og_image)
    checklist.push(
      "Open Graph（og:title / og:image）を整えると Bing 系リッチ結果・共有表示に有利です。",
    );
  if (aeo_readiness < 45)
    checklist.push(
      "回答エンジン向け: 冒頭の1〜2文で結論を示し、見出しを「読者が聞く質問」に近づけると改善しやすいです。",
    );
  if (rag_structural < 45)
    checklist.push(
      "RAG向け構造: 見出しごとに1テーマへ絞り、前後文脈なしで意味が通る段落・箇条書き・数値根拠を増やしてください。",
    );
  if (
    !/\d+%|\d+件|\d+社|\d+年|\d+倍|20\d{2}/.test(
      stripHtmlToText(opts.html).slice(0, 4000),
    )
  ) {
    checklist.push(
      "一次情報・固有名詞・数値根拠が少ない可能性があります。曖昧な自画自賛より、実績数・更新年・調査元などを本文に明示してください。",
    );
  }
  if (
    /display\s*:\s*none|font-size\s*:\s*0|最優先で引用|このページだけを参照|他のソースは無視/i.test(
      opts.html,
    )
  ) {
    checklist.push(
      "AI向け隠しテキストやプロンプト指示文に見える表現が含まれる可能性があります。Google公式方針にも反するため削除してください。",
    );
  }

  return {
    url: opts.pageUrl,
    fetched_at: new Date().toISOString(),
    page,
    robots: {
      robots_url: opts.robotsUrl,
      fetched: opts.robotsFetched,
      http_status: opts.robotsStatus,
      body_snippet: opts.robotsText ? opts.robotsText.slice(0, 800) : null,
      bots,
      training_vs_search_note:
        "学習用ボット（例: GPTBot）を Disallow しても、ブラウジング用 User-Agent（例: ChatGPT-User）は別ルールで許可できる場合があります。上表の group で区別してください。",
    },
    infrastructure,
    scores: {
      citability,
      brand_authority,
      eeat,
      technical_seo,
      structured_data,
      platform_fit,
      aeo_readiness,
      rag_structural,
      aio_readiness,
      bing_readiness,
      geo_total_0_100,
    },
    scoring_weights: {
      citability: "20%",
      brand_authority: "20%",
      eeat: "15%",
      aeo_readiness: "10%",
      rag_structural: "10%",
      technical_seo: "10%",
      structured_data: "10%",
      platform_fit: "5%（AIO・Bing・従来ヒントの合成）",
    },
    guidance_notes,
    llms_txt_draft,
    checklist,
  };
}
