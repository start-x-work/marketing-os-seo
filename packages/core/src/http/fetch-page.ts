import * as cheerio from "cheerio";
import { FetchError } from "../errors";

export interface FetchedPage {
  url: string;
  status: number;
  html: string;
  $: cheerio.CheerioAPI;
}

export async function fetchPage(url: string): Promise<FetchedPage> {
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "User-Agent": "mos-seo-bot/0.1 (+https://marketing-os.jp)" },
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    throw new FetchError(
      url,
      0,
      error instanceof Error ? error.message : "request failed",
    );
  }
  if (!res.ok) {
    throw new FetchError(url, res.status);
  }
  const html = await res.text();
  return { url, status: res.status, html, $: cheerio.load(html) };
}

export function resolveFromUrl(url: string, path: string): string {
  return new URL(path, url).toString();
}
