import * as cheerio from "cheerio";

export interface FetchedPage {
  url: string;
  status: number;
  html: string;
  $: cheerio.CheerioAPI;
}

export async function fetchPage(url: string): Promise<FetchedPage> {
  const res = await fetch(url, {
    headers: { "User-Agent": "mos-seo-bot/0.1 (+https://marketing-os.jp)" },
  });
  const html = await res.text();
  return { url, status: res.status, html, $: cheerio.load(html) };
}

export function resolveFromUrl(url: string, path: string): string {
  return new URL(path, url).toString();
}
