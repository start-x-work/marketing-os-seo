import { CliError } from "@start-x-work/marketing-os-seo-core";

export interface Env {
  GEMINI_API_KEY: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  GSC_CLIENT_ID: string;
  GSC_CLIENT_SECRET: string;
  GSC_REDIRECT_URI: string;
  GSC_COOKIE_SECRET?: string;
}

export function jsonError(
  error: unknown,
  fallback = "Request failed",
): Response {
  const message = error instanceof Error ? error.message : fallback;
  const status =
    error instanceof CliError && error.code === "E_INPUT" ? 400 : 500;
  return Response.json({ error: message }, { status });
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new CliError("Invalid JSON body", "E_INPUT");
  }
}

export function getCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("Cookie") ?? "";
  return header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export function createCookie(
  name: string,
  value: string,
  request: Request,
  maxAge: number,
): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${name}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}

export function clearCookie(name: string): string {
  return `${name}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}
