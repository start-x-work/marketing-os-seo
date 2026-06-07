import { afterEach, describe, expect, it, vi } from "vitest";
import { auditLLMO } from "./audit";

const html = `<!doctype html>
<html>
  <head>
    <title>Example</title>
    <script type="application/ld+json">{"@type":"Article","headline":"Example"}</script>
  </head>
  <body>
    <main>
      <h1>What is LLMO?</h1>
      <h2>How does AI search cite pages?</h2>
      <p>LLMO is a practice for making content understandable because AI systems cite clear definitions.</p>
      <p>According to internal research in 2026, structured evidence improves reuse.</p>
    </main>
  </body>
</html>`;

describe("auditLLMO", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns score, checks, and recommendations", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith("/robots.txt")) {
          return new Response("User-agent: *\nAllow: /", { status: 200 });
        }
        if (url.endsWith("/llms.txt")) {
          return new Response("# Example\nUse this site summary.", {
            status: 200,
          });
        }
        return new Response(html, {
          status: 200,
          headers: { "content-type": "text/html" },
        });
      }),
    );

    const result = await auditLLMO("https://example.com");
    expect(result.url).toBe("https://example.com");
    expect(result.checks).toHaveLength(5);
    expect(result.totalScore).toBeGreaterThan(0);
    expect(result.totalScore).toBeLessThanOrEqual(100);
  });
});
