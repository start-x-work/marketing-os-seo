# Marketing-OS SEO CLI Usage

`@start-x-work/mos-seo` v1.0 exposes four workflows from the command line. Every command supports `--format json`; `table` is the default and `markdown` is also available. Use `--quiet` to hide the optional Marketing-OS footer line.

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

## Global options

| Option | Default | Description |
|---|---|---|
| `--format` | `table` | `json`, `table`, or `markdown` |
| `--quiet` | `false` | Suppress the commercial footer line |
| `--model` | `gemini` | `gemini`, `openai`, or `anthropic` (AI commands) |
| `--lang` | `ja` | Output language for AI-backed planning commands |

## `audit llmo`

Audit how well a page is positioned for AI search surfaces.

```bash
mos-seo audit llmo https://example.com
mos-seo audit llmo https://example.com --format json --quiet
```

## `audit site`

Audit technical SEO basics for a single URL.

```bash
mos-seo audit site https://example.com
mos-seo audit site https://example.com --format json
```

## `content brief`

Generate an editable content brief. This command does not generate final article body text.

```bash
GEMINI_API_KEY=... mos-seo content brief "AI時代のSEO"
GEMINI_API_KEY=... mos-seo content brief "AI SEO strategy" --lang en --model openai --format json
```

Output includes:

- Search intent
- Recommended outline
- Editable writing prompts

## `keyword map`

Classify keyword intent and cluster related keywords through the AI provider abstraction.

```bash
GEMINI_API_KEY=... mos-seo keyword map "マーケティング" --format json
GEMINI_API_KEY=... mos-seo keyword map "ai marketing" --volume --format json
GEMINI_API_KEY=... mos-seo keyword map "LLMO" --related "AI SEO,AEO" --volume --site-url https://example.com/
```

With `--volume`, the CLI attaches volume estimates. GSC credentials plus `--site-url` prefer real Search Console impressions; otherwise the core uses cluster-relative estimation without a keyword database.

Output includes:

- Seed keyword
- Normalized keyword list
- Intent map
- Embedding-based clusters
- Optional `volumes` array when `--volume` is set

## Environment

Copy `.env.example` into your local environment manager. Do not commit `.env`.

- `GEMINI_API_KEY`: default provider for `content brief` and `keyword map`
- `OPENAI_API_KEY`: optional, for `--model openai`
- `ANTHROPIC_API_KEY`: optional, for `--model anthropic`
- `GSC_CLIENT_ID`, `GSC_CLIENT_SECRET`, `GSC_REFRESH_TOKEN`: optional, for CLI volume estimates with `--site-url`

## Common Errors

### `Error [E_INPUT]: Invalid URL`

Use a full `http://` or `https://` URL.

```bash
mos-seo audit site https://example.com
```

### `Error [E_FETCH]`

The target page could not be fetched, returned a non-success status, or timed out.

### `Error [E_AI]: AI provider error: GEMINI_API_KEY is required`

Set the API key for the selected model.

```bash
GEMINI_API_KEY=... mos-seo content brief "LLMO strategy"
OPENAI_API_KEY=... mos-seo content brief "LLMO strategy" --model openai
```

### `Error [E_PARSE]`

The AI provider returned a response that could not be parsed as JSON. Retry, or switch models with `--model`.
