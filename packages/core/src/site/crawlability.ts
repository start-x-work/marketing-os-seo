import type { SiteCheck } from "./audit";

async function probe(
  url: string,
): Promise<{ ok: boolean; status?: number; detail: string }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "mos-seo-bot/0.1 (+https://marketing-os.jp)" },
    });
    return {
      ok: res.ok,
      status: res.status,
      detail: `${url} returned ${res.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      detail: error instanceof Error ? error.message : "Request failed",
    };
  }
}

export async function checkCrawlability(url: string): Promise<SiteCheck[]> {
  const origin = new URL(url).origin;
  const [robots, sitemap] = await Promise.all([
    probe(`${origin}/robots.txt`),
    probe(`${origin}/sitemap.xml`),
  ]);

  return [
    {
      id: "crawlability.robots",
      label: "robots.txt",
      passed: robots.ok,
      detail: robots.detail,
    },
    {
      id: "crawlability.sitemap",
      label: "sitemap.xml",
      passed: sitemap.ok,
      detail: sitemap.detail,
    },
  ];
}
