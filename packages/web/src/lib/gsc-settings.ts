export interface GscOAuthConfig {
  clientId: string;
  clientSecret: string;
}

export interface GscSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

const CONFIG_KEY = "mos-gsc-oauth";
const SESSION_KEY = "mos-gsc-session";
const STATE_KEY = "mos-gsc-oauth-state";

export function loadGscOAuthConfig(): GscOAuthConfig | undefined {
  try {
    const raw = sessionStorage.getItem(CONFIG_KEY);
    if (!raw) {
      return undefined;
    }
    const parsed = JSON.parse(raw) as GscOAuthConfig;
    if (!parsed.clientId?.trim() || !parsed.clientSecret?.trim()) {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

export function saveGscOAuthConfig(config: GscOAuthConfig): void {
  sessionStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function loadGscSession(): GscSession | undefined {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      return undefined;
    }
    const session = JSON.parse(raw) as GscSession;
    return session.expiresAt > Date.now() ? session : undefined;
  } catch {
    return undefined;
  }
}

export function saveGscSession(session: GscSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearGscSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function saveOAuthState(state: string): void {
  sessionStorage.setItem(STATE_KEY, state);
}

export function consumeOAuthState(): string | undefined {
  const state = sessionStorage.getItem(STATE_KEY);
  sessionStorage.removeItem(STATE_KEY);
  return state ?? undefined;
}

export function gscRedirectUri(): string {
  return `${window.location.origin}/gsc-callback`;
}
