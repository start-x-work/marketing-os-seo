# Marketing-OS SEO CLI Usage

`@start-x-work/mos-seo` exposes four v0.1 workflows from the command line. Every command supports `--format json`; `table` is the default and `markdown` is also available.

## Install

```bash
npx @start-x-work/mos-seo audit site https://example.com --format json
npm install -g @start-x-work/mos-seo
```

For local development:

```bash
pnpm install --frozen-lockfile
pnpm build
node packages/cli/dist/index.cjs audit site https://example.com --format json
```

## `audit llmo`

Audit how well a page is positioned for AI search surfaces.

```bash
mos-seo audit llmo https://example.com
mos-seo audit llmo https://example.com --format json
mos-seo audit llmo https://example.com --format markdown
```

Checks:

- AI-readable structured data
- Question-oriented heading shape
- Common AI bot crawl policy in `robots.txt`
- `/llms.txt` availability
- Citation-ready factual density

JSON output shape:

```json
{
  "url": "https://example.com",
  "totalScore": 72,
  "checks": [
    { "id": "llmo.headings", "label": "Question-oriented heading structure", "score": 90, "weight": 2, "detail": "..." }
  ],
  "recommendations": []
}
```

## `audit site`

Audit technical SEO basics for a single URL.

```bash
mos-seo audit site https://example.com
mos-seo audit site https://example.com --format json
```

Checks:

- Title and meta description
- Canonical URL
- H1 count
- JSON-LD presence and validity
- `robots.txt` and `sitemap.xml`

JSON output shape:

```json
{
  "url": "https://example.com",
  "checks": [
    { "id": "meta.title", "label": "Title tag", "passed": true, "detail": "Title length: 14" }
  ],
  "passedCount": 1,
  "totalCount": 8
}
```

## `content brief`

Generate an editable content brief. This command does not generate final article body text.

```bash
GEMINI_API_KEY=... mos-seo content brief "AI時代のSEO"
GEMINI_API_KEY=... mos-seo content brief "AI時代のSEO" --format json
```

Output includes:

- Search intent
- Recommended outline
- Editable writing prompts

## `keyword map`

Classify keyword intent and cluster related keywords through the AI provider abstraction.

```bash
GEMINI_API_KEY=... mos-seo keyword map "マーケティング" --format json
GEMINI_API_KEY=... mos-seo keyword map "LLMO" --related "AI SEO,AEO,Google AI Overview" --format markdown
```

Output includes:

- Seed keyword
- Normalized keyword list
- Intent map
- Embedding-based clusters

## Environment

Copy `.env.example` into your local environment manager. Do not commit `.env`.

- `GEMINI_API_KEY`: required for `content brief` and `keyword map`.
- `GSC_CLIENT_ID`, `GSC_CLIENT_SECRET`, `GSC_REFRESH_TOKEN`: reserved for Search Console integrations.

## Common Errors

### `Error [E_INPUT]: Invalid URL`

Use a full `http://` or `https://` URL.

```bash
mos-seo audit site https://example.com
```

### `Error [E_FETCH]`

The target page could not be fetched, returned a non-success status, or timed out.

### `Error [E_AI]: AI provider error: GEMINI_API_KEY is required`

Set `GEMINI_API_KEY` for AI-backed commands.

```bash
GEMINI_API_KEY=... mos-seo content brief "LLMO strategy"
```

### `Error [E_PARSE]`

The AI provider returned a response that could not be parsed as JSON. Retry, or lower temperature in future provider options.
