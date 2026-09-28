import { CliError } from "@start-x-work/mos-kit";

/**
 * SSRF-hardened URL guards and fetch helper.
 *
 * These utilities reduce the risk that a user-supplied URL is used to reach
 * internal infrastructure. The host check is **literal-based**: it rejects
 * loopback / private / link-local / reserved IP literals and obvious internal
 * hostnames. It does NOT perform DNS resolution, so a public hostname that
 * resolves to a private address is not caught here — deployments that need that
 * guarantee should additionally resolve and re-check at the network layer.
 */

export interface PublicUrlOptions {
  /** Allow `http:` in addition to `https:`. Default: false (https only). */
  allowHttp?: boolean;
}

export interface FollowRedirectsOptions extends PublicUrlOptions {
  /** Maximum number of redirects to follow before failing. Default: 5. */
  maxRedirects?: number;
}

function parseIpv4(host: string): number[] | undefined {
  const parts = host.split(".");
  if (parts.length !== 4) return undefined;
  const octets: number[] = [];
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return undefined;
    const n = Number(part);
    if (n > 255) return undefined;
    octets.push(n);
  }
  return octets;
}

function isPrivateIpv4(octets: number[]): boolean {
  const [a, b] = octets;
  if (a === 0) return true; // 0.0.0.0/8 "this network"
  if (a === 10) return true; // private
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 168) return true; // private
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64/10
  return false;
}

/**
 * Return `true` when the hostname is a loopback / private / link-local /
 * reserved IP literal, or an obviously-internal hostname. Literal check only.
 */
export function isPrivateOrLoopbackHost(hostname: string): boolean {
  let host = hostname.trim().toLowerCase();
  if (!host) return true;

  // Strip IPv6 brackets: "[::1]" -> "::1"
  if (host.startsWith("[") && host.endsWith("]")) host = host.slice(1, -1);

  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host.endsWith(".local") || host.endsWith(".internal")) return true;

  const ipv4 = parseIpv4(host);
  if (ipv4) return isPrivateIpv4(ipv4);

  if (host.includes(":")) {
    // IPv6 literal
    if (host === "::1" || host === "::") return true; // loopback / unspecified
    // IPv4-mapped, e.g. ::ffff:127.0.0.1
    const mapped = /::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i.exec(host);
    if (mapped) {
      const embedded = parseIpv4(mapped[1] ?? "");
      if (embedded) return isPrivateIpv4(embedded);
    }
    // Unique-local (fc00::/7 -> fc.. / fd..) and link-local (fe80::/10)
    if (/^f[cd][0-9a-f]*:/.test(host)) return true;
    if (/^fe[89ab][0-9a-f]*:/.test(host)) return true;
  }

  return false;
}

/**
 * Validate that `input` is a public URL and return it as a `URL`.
 * Rejects non-http(s) schemes, disallowed schemes, and private/loopback hosts.
 * By default only `https:` is permitted.
 */
export function assertPublicUrl(
  input: string | URL,
  options: PublicUrlOptions = {},
): URL {
  let url: URL;
  try {
    url = typeof input === "string" ? new URL(input) : input;
  } catch {
    throw new CliError(`Invalid URL: ${String(input)}`, "E_INPUT");
  }

  const allowed = options.allowHttp
    ? new Set(["http:", "https:"])
    : new Set(["https:"]);
  if (!allowed.has(url.protocol)) {
    throw new CliError(
      `Refusing to fetch ${url.protocol}//… — only ${
        options.allowHttp ? "http(s)" : "https"
      } URLs are allowed`,
      "E_INPUT",
    );
  }

  if (isPrivateOrLoopbackHost(url.hostname)) {
    throw new CliError(
      `Refusing to fetch a private, loopback, or reserved host: ${url.hostname}`,
      "E_INPUT",
    );
  }

  return url;
}

/**
 * Strict guard: public **HTTPS** URL only. Convenience wrapper over
 * {@link assertPublicUrl}.
 */
export function assertPublicHttpsUrl(input: string | URL): URL {
  return assertPublicUrl(input, { allowHttp: false });
}

/**
 * Fetch a URL, following redirects manually and re-validating every hop with
 * {@link assertPublicUrl}. Caps the number of redirects to prevent loops and
 * SSRF-via-redirect. Uses the global `fetch`.
 */
export async function fetchFollowingPublicRedirects(
  input: string,
  init: RequestInit = {},
  options: FollowRedirectsOptions = {},
): Promise<Response> {
  const maxRedirects = options.maxRedirects ?? 5;
  let current = assertPublicUrl(input, options).toString();

  for (let hop = 0; hop <= maxRedirects; hop++) {
    const res = await fetch(current, { ...init, redirect: "manual" });

    const isRedirect =
      res.status >= 300 && res.status < 400 && res.headers.has("location");
    if (!isRedirect) return res;

    const location = res.headers.get("location") ?? "";
    const next = assertPublicUrl(
      new URL(location, current),
      options,
    ).toString();
    if (next === current) {
      throw new CliError(`Redirect loop detected at ${next}`, "E_FETCH");
    }
    current = next;
  }

  throw new CliError(
    `Too many redirects (>${maxRedirects}) starting from ${input}`,
    "E_FETCH",
  );
}
