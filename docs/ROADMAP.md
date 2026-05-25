# Marketing-OS SEO Roadmap

## Sprint 1-3: v0.1 CLI

### Core Features

- **LLMO/AEO Audit** — Score AI search readiness from structured data, headings, AI bot policy, `/llms.txt`, and citation density
- **Technical SEO Audit** — Metadata, canonical, H1, structured data, sitemap, and robots.txt checks
- **Content Brief Generator** — Gemini-backed editable brief templates, not final article generation
- **Keyword Intent Mapper (Core)** — Intent classification and embedding-based clustering

### Out of Scope (v0.1)

- Keyword volume estimation (deferred to v0.2)
- Competitor analysis (deferred to v0.3)
- SERP rank tracking (deferred to v0.3)

### Gate B

Move to Web UI when the four CLI workflows run locally, `docs/USAGE.md` is ready, and npm publication is complete.

## Sprint 4-5: v0.1 Web UI

- Web-based dashboard for the CLI features
- Hosted on Cloudflare Pages
- OAuth with Google (for GSC integration)

## Sprint 6-7: v0.2 / v1.0 preparation

- Keyword volume estimation
- Multi-language support expansion
- Improved LLMO scoring with more AI models
- Stable core API review

## v1.0

- Stable API
- Production-ready integrations
- Marketing-OS commercial product integration

## Future

- Competitor analysis
- SERP rank tracking
- Backlink analysis (potentially)
