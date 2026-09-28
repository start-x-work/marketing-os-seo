import { describe, expect, it } from "vitest";
import {
  analyzePageHtml,
  analyzeRobotsTxtForBots,
  buildGeoAuditFetchErrorPayload,
  buildGeoAuditHttpErrorPayload,
  buildLlmsTxtDraft,
  computeGeoAuditFromContent,
} from "./audit";

// Golden tests mirror Marketing-OS `tests/geo-seo-audit.test.ts` (analysis half).
// Same inputs must yield the same outputs now that this is the canonical source.

describe("analyzeRobotsTxtForBots", () => {
  it("flags GPTBot when Disallow: / applies", () => {
    const txt = "User-agent: GPTBot\nDisallow: /\n";
    const rows = analyzeRobotsTxtForBots(txt);
    const gpt = rows.find((r) => r.user_agent === "GPTBot");
    expect(gpt).toBeDefined();
    expect(gpt?.likely_blocked_root).toBe(true);
  });

  it("treats empty robots as allow", () => {
    const rows = analyzeRobotsTxtForBots("");
    expect(rows.every((r) => !r.likely_blocked_root)).toBe(true);
  });
});

describe("analyzePageHtml", () => {
  it("detects FAQPage structured data and counts H2", () => {
    const html = `<html><head><title>t</title>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[]}</script>
</head><body><h2>Q1</h2><p>これは日本語の本文です。引用されやすいブロックを想定した長めの文章を置きます。</p></body></html>`;
    const s = analyzePageHtml(html);
    expect(s.has_faq_schema).toBe(true);
    expect(s.h2_count).toBeGreaterThanOrEqual(1);
  });

  it("detects BreadcrumbList and counts sameAs links", () => {
    const html = `<html><head><title>x</title>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[]}</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"Co","sameAs":["https://www.linkedin.com/company/x","https://x.com/y"]}</script>
</head><body><p>本文</p></body></html>`;
    const s = analyzePageHtml(html);
    expect(s.has_breadcrumb_schema).toBe(true);
    expect(s.json_ld_same_as_count).toBe(2);
  });
});

describe("computeGeoAuditFromContent", () => {
  it("returns a 0–100 total and an advisory llms.txt draft", () => {
    const html = `<!DOCTYPE html><html><head><title>テスト製品｜完全ガイド2026</title>
<meta name="description" content="著者: 山田太郎。最新の統計に基づく解説です。">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","author":{"@type":"Person","name":"山田"}}</script>
</head><body>
<h2>結論</h2><p>${"これは日本語の本文です。".repeat(40)}</p>
<h2>比較表</h2><p>データ</p>
<h2>よくある質問</h2><p>回答</p>
</body></html>`;
    const r = computeGeoAuditFromContent({
      pageUrl: "https://example.com/page",
      html,
      robotsUrl: "https://example.com/robots.txt",
      robotsText: "User-agent: *\nDisallow:\n",
      robotsStatus: 200,
      robotsFetched: true,
    });
    expect(r.scores.geo_total_0_100).toBeGreaterThanOrEqual(0);
    expect(r.scores.geo_total_0_100).toBeLessThanOrEqual(100);
    expect(r.llms_txt_draft).toContain("example.com");
    expect(r.llms_txt_draft).toContain("命令ではなく");
    expect(typeof r.scores.aeo_readiness).toBe("number");
    expect(typeof r.scores.rag_structural).toBe("number");
    expect(typeof r.scores.aio_readiness).toBe("number");
    expect(typeof r.scores.bing_readiness).toBe("number");
    expect(r.infrastructure.cdn_hint).toBeTruthy();
    expect(r.scoring_weights.citability).toBe("20%");
    expect(
      r.guidance_notes.some((line) => line.includes("Google公式方針")),
    ).toBe(true);
    expect(
      r.guidance_notes.some((line) =>
        line.includes("llms.txt はGoogle検索では必須ではありません"),
      ),
    ).toBe(true);
  });
});

describe("buildLlmsTxtDraft", () => {
  it("frames the draft as guidance, not a command", () => {
    const draft = buildLlmsTxtDraft({
      siteLabel: "example.jp",
      about: "テストサイトの概要",
      keyPages: [{ url: "https://example.jp/guide", note: "ガイド" }],
      lastUpdatedYmd: "2026-07-11",
    });
    expect(draft.startsWith("# example.jp")).toBe(true);
    expect(draft).toContain("- https://example.jp/guide: ガイド");
    expect(draft).toContain(
      "本ファイルはAIへの命令ではなく、主要ページへの案内です。",
    );
    expect(draft).toContain("最終更新日: 2026-07-11");
  });
});

describe("error payloads", () => {
  it("converts a Cloudflare 522 into user-facing guidance", () => {
    const payload = buildGeoAuditHttpErrorPayload(
      522,
      "https://example.com/lp/",
    );
    expect(payload.error).toMatch(/Cloudflare 522/);
    expect(payload.hint).toMatch(/WAF|CDN|Cloudflare/);
    expect(payload.upstream_status).toBe(522);
    expect(payload.target_url).toBe("https://example.com/lp/");
  });

  it("frames a timeout as a target-site check", () => {
    const payload = buildGeoAuditFetchErrorPayload(
      Object.assign(new Error("aborted"), { name: "AbortError" }),
      "https://example.com/",
    );
    expect(payload.error).toMatch(/時間内/);
    expect(payload.hint).toMatch(/CDN|WAF|再実行/);
  });
});
