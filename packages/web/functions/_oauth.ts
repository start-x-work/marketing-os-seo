import { CliError } from "@start-x-work/marketing-os-seo-core";
import type { Env } from "./_shared";

const sessionCookie = "mos_gsc_session";
const stateCookie = "mos_gsc_state";

export interface GscSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface GoogleTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

export { sessionCookie, stateCookie };

export function createState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return base64url(bytes);
}

export async function encryptSession(
  env: Env,
  session: GscSession,
): Promise<string> {
  const key = await getKey(env);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const payload = new TextEncoder().encode(JSON.stringify(session));
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, payload),
  );
  const packed = new Uint8Array(iv.length + encrypted.length);
  packed.set(iv);
  packed.set(encrypted, iv.length);
  return base64url(packed);
}

export async function decryptSession(
  env: Env,
  encoded: string | undefined,
): Promise<GscSession | undefined> {
  if (!encoded) {
    return undefined;
  }
  const packed = fromBase64url(encoded);
  const iv = packed.slice(0, 12);
  const encrypted = packed.slice(12);
  const key = await getKey(env);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encrypted,
  );
  const session = JSON.parse(new TextDecoder().decode(decrypted)) as GscSession;
  return session.expiresAt > Date.now() ? session : undefined;
}

export interface OAuthClientConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export async function exchangeCode(
  env: Env,
  code: string,
): Promise<GoogleTokenResponse> {
  if (!env.GSC_CLIENT_ID || !env.GSC_CLIENT_SECRET || !env.GSC_REDIRECT_URI) {
    throw new Error("GSC OAuth is not configured");
  }
  return exchangeCodeWithConfig({
    code,
    clientId: env.GSC_CLIENT_ID,
    clientSecret: env.GSC_CLIENT_SECRET,
    redirectUri: env.GSC_REDIRECT_URI,
  });
}

export async function exchangeCodeWithConfig(
  config: OAuthClientConfig & { code: string },
): Promise<GoogleTokenResponse> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      code: config.code,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    throw new Error(
      `Google token exchange failed: ${res.status} ${await res.text()}`,
    );
  }

  return (await res.json()) as GoogleTokenResponse;
}

async function getKey(env: Env): Promise<CryptoKey> {
  if (!env.GSC_COOKIE_SECRET) {
    throw new CliError(
      "GSC_COOKIE_SECRET is required for OAuth session cookies",
      "E_INPUT",
    );
  }
  const secret = new TextEncoder().encode(env.GSC_COOKIE_SECRET);
  const digest = await crypto.subtle.digest("SHA-256", secret);
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
