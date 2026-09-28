# Marketing-OS SEO

AI-native SEO toolkit for the LLMO era.

v1.1 provides a semver-stable core API on top of `@start-x-work/mos-kit`, plus CLI and Web UI. The toolkit focuses on diagnosis, evaluation, and editable planning artifacts. It does not automate publishing or generate final content on behalf of the user.

思想・境界線・v0.1 の約束は **[manifesto / SEO 編](https://github.com/start-x-work/manifesto/blob/main/seo/README.md)** およびハブ全体 **[manifesto](https://github.com/start-x-work/manifesto)** を参照。

## できること / できないこと

**できること (What this does)**

- ページ HTML・構造化データ・見出し構成の LLMO/AEO 観点での診断
- robots.txt の AI クローラー方針 / Content-Signal / llms.txt / sitemap の点検
- キーワードのインテント分類・クラスタリング、コンテンツブリーフの下書き生成
- 結果を人間可読サマリ・JSON・Markdown で出力（編集可能な計画材料として）

**できないこと (What this does NOT do)**

- 検索順位の改善や流入増加を保証すること（本ツールは診断・評価が目的です）
- 競合サイトとの優劣比較・ランキング
- 公開・入稿の自動化、および最終成果物（本文）のユーザー代理での生成
- 内部ネットワーク・非公開ホストへのアクセス（下記 SSRF 保護のとおり拒否します）

診断スコアは公開仕様（下記 Sources）に基づく **目安** であり、特定の成果を約束するものではありません。OSS 版と商用版の境界は下記「OSS vs Commercial」を参照してください。

## Install

Run without installing:

```bash
npx @start-x-work/mos-seo audit site https://example.com --format json
```

Or install globally:

```bash
npm install -g @start-x-work/mos-seo
mos-seo audit site https://example.com
```

## v1.0 CLI Features

- LLMO/AEO診断 / LLMO/AEO Audit: `mos-seo audit llmo <url>`
- サイト診断・内部対策 / Technical SEO Audit: `mos-seo audit site <url>`
- コンテンツ制作支援 / Content Brief Generator: `mos-seo content brief <topic> [--lang ja|en|...] [--model gemini|openai|anthropic]`
- キーワード調査(コア) / Keyword Intent Mapper: `mos-seo keyword map <seed> [--volume] [--lang ja] [--model gemini|openai|anthropic]`

All commands support `--format json`; `table` is the default and `markdown` is also available. Use `--quiet` to suppress the optional Marketing-OS footer line. See [docs/USAGE.md](./docs/USAGE.md) for full examples.

### llms.txt draft (advisory)

`audit site` / `audit llmo` accept `--llms-txt`, which fetches the page and
prints a draft [`llms.txt`](https://llmstxt.org/) built from the page's title,
description, and same-origin links:

```bash
mos-seo audit site https://example.com --llms-txt
```

The draft is **advisory guidance for a human to review and edit** before
publishing at `/llms.txt`. It documents and links to content; it does **not**
command, control, or guarantee any AI/LLM behavior, and no AI system is obliged
to read or follow it. The library exposes the same generator as the pure
function `buildLlmsTxtDraft(input)` in `@start-x-work/marketing-os-seo-core`.

**Quickstart:** [docs/QUICKSTART.md](./docs/QUICKSTART.md) — CLI, Web BYOK, GSC 連携手順

## Web UI

https://marketing-os-seo.pages.dev

AI キーと GSC OAuth は **BYOK**（ブラウザ sessionStorage）。運営側 Secrets 不要。

## Packages

- `packages/core` — semver-stable SEO API (v1.1+), built on `@start-x-work/mos-kit`
- `packages/cli` — `mos-seo` command line interface
- `packages/web` — Cloudflare Pages Web UI
- shared foundation — [`@start-x-work/mos-kit`](https://github.com/start-x-work/mos-kit)

## Development

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm build
pnpm test
pnpm typecheck
```

Run the local CLI:

```bash
node packages/cli/dist/index.cjs audit site https://example.com --format json
```

## Environment

`.env` is intentionally ignored. Use `.env.example` as a reference and configure secrets locally.

- `GEMINI_API_KEY` — default provider for `content brief` and `keyword map`
- `OPENAI_API_KEY` — optional, for `--model openai`
- `ANTHROPIC_API_KEY` — optional, for `--model anthropic`
- `GSC_CLIENT_ID`, `GSC_CLIENT_SECRET`, `GSC_REFRESH_TOKEN` — optional, for CLI volume estimates with `--site-url`

## OSS vs Commercial

| OSS (this repo) | Commercial [Marketing-OS](https://marketing-os.jp) |
|---|---|
| Diagnosis, briefs, keyword mapping | Org-wide workflows, AI CMO |
| CLI / Web / library (Apache-2.0) | SLA-backed operations & BPO |

Boundary: [manifesto](https://github.com/start-x-work/manifesto/blob/main/README.md#3-marketing-os-との境界線)

## AI crawler list

The LLMO audit checks `robots.txt` against a curated list of AI-related crawler
user-agents, grouped by their publicly-documented purpose:

- **search / citation** bots (fetch to surface content in AI search or live
  answers) — blocking these can suppress AI citations.
- **training** bots (crawl to train AI models) — blocking these opts out of
  training without affecting search/citation.

The list also understands the **Content-Signal** expression
(`search` / `ai-input` / `ai-train`) found in `robots.txt`.

**Update policy:** the crawler list is **reviewed quarterly** because vendors
add, rename, and re-purpose tokens frequently. It is a diagnostic convenience,
not an authoritative registry. Source and current entries live in
[`packages/core/src/data/ai-crawlers.ts`](./packages/core/src/data/ai-crawlers.ts)
(see the adjacent `README.md`).

## Network safety (SSRF)

Fetches for `robots.txt` / `llms.txt` / `sitemap.xml` go through a guarded
fetch that follows redirects manually, re-validates every hop, caps redirects,
and refuses private, loopback, link-local, and reserved hosts. The exported
`assertPublicHttpsUrl` / `fetchFollowingPublicRedirects` helpers enforce
public-HTTPS-only by default. The host check is literal-based and does not
perform DNS resolution.

## Sources

- Google Search Central — [Structured data / rich results documentation](https://developers.google.com/search/docs/appearance/structured-data)
- The [llms.txt proposal](https://llmstxt.org/)
- Vendor crawler documentation (OpenAI, Google, Anthropic, Microsoft, Perplexity, Apple, Meta, Common Crawl, etc.) and the Content-Signal proposal for per-purpose crawl preferences

## License

Apache-2.0. See [LICENSE](./LICENSE).

---

🔗 marketing-os.jp / https://marketing-os.jp
