# Marketing-OS SEO

AI-native SEO toolkit for the LLMO era.

v1.0 provides a semver-stable core API, CLI, and Web UI. The toolkit focuses on diagnosis, evaluation, and editable planning artifacts. It does not automate publishing or generate final content on behalf of the user.

思想・境界線・v0.1 の約束は **[manifesto / SEO 編](https://github.com/start-x-work/manifesto/blob/main/seo/README.md)** およびハブ全体 **[manifesto](https://github.com/start-x-work/manifesto)** を参照。

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

## Web UI

https://marketing-os-seo.pages.dev

## Packages

- `packages/core` — semver-stable public API (v1.0+)
- `packages/cli` — `mos-seo` command line interface
- `packages/web` — Cloudflare Pages Web UI

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

## License

Apache-2.0. See [LICENSE](./LICENSE).

---

🔗 marketing-os.jp / https://marketing-os.jp
