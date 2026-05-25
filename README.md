# Marketing-OS SEO

AI-native SEO toolkit for the LLMO era.

v0.1 CLI is now implemented as a TypeScript monorepo. The CLI focuses on diagnosis, evaluation, and editable planning artifacts. It does not automate publishing or generate final content on behalf of the user.

思想・境界線・v0.1 の約束は **[manifesto / SEO 編](https://github.com/start-x-work/manifesto/blob/main/seo/README.md)** およびハブ全体 **[manifesto](https://github.com/start-x-work/manifesto)** を参照。

## Packages

- `packages/core` — shared audit, keyword, content, and AI provider logic
- `packages/cli` — `mos-seo` command line interface
- `packages/web` — reserved for Phase 4 Web UI

## v0.1 CLI Features

- LLMO/AEO診断 / LLMO/AEO Audit: `mos-seo audit llmo <url>`
- サイト診断・内部対策 / Technical SEO Audit: `mos-seo audit site <url>`
- コンテンツ制作支援 / Content Brief Generator: `mos-seo content brief <topic>`
- キーワード調査(コア) / Keyword Intent Mapper: `mos-seo keyword map <seed>`

All commands support `--format json`. See [docs/USAGE.md](./docs/USAGE.md) for examples.

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
```

Run the local CLI:

```bash
node packages/cli/dist/index.js audit site https://example.com --format json
```

## Environment

`.env` is intentionally ignored. Use `.env.example` as a reference and configure secrets locally.

- `GEMINI_API_KEY` for Gemini-backed content brief and keyword map
- `GSC_CLIENT_ID`, `GSC_CLIENT_SECRET`, `GSC_REFRESH_TOKEN` for Search Console integrations

---

🔗 marketing-os.jp / https://marketing-os.jp
