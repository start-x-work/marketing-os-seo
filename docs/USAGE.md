# Marketing-OS SEO CLI Usage

`@start-x-work/mos-seo` exposes four v0.1 workflows from the command line. Every command supports `--format json`; `table` is the default and `markdown` is also available.

## Install

```bash
npm install -g @start-x-work/mos-seo
```

For local development:

```bash
pnpm install
pnpm build
node packages/cli/dist/index.js audit site https://example.com --format json
```

## LLMO / AEO Audit

```bash
mos-seo audit llmo https://example.com --format json
```

Checks AI-readable structured data, heading shape, common AI bot crawl policy, `/llms.txt`, and citation-ready factual density.

## Site Audit

```bash
mos-seo audit site https://example.com --format json
```

Checks title, meta description, canonical, H1 count, JSON-LD validity, `robots.txt`, and `sitemap.xml`.

## Content Brief

```bash
GEMINI_API_KEY=... mos-seo content brief "LLMO strategy" --format markdown
```

Returns an editable brief: intent, outline, and writing prompts. It does not generate final article body text.

## Keyword Map

```bash
GEMINI_API_KEY=... mos-seo keyword map "LLMO" --related "AI SEO,AEO,Google AI Overview" --format json
```

Classifies intent and clusters keywords through the AI provider abstraction.

## Environment

Copy `.env.example` into your local environment manager. Do not commit `.env`.

- `GEMINI_API_KEY`: required for content brief and keyword map.
- `GSC_CLIENT_ID`, `GSC_CLIENT_SECRET`, `GSC_REFRESH_TOKEN`: required only for future GSC-backed query enrichment.
