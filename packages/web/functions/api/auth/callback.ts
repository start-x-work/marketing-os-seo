import { CliError } from "@start-x-work/marketing-os-seo-core";
import {
  encryptSession,
  exchangeCode,
  sessionCookie,
  stateCookie,
} from "../../_oauth";
import {
  clearCookie,
  createCookie,
  type Env,
  getCookie,
  jsonError,
} from "../../_shared";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const expectedState = getCookie(request, stateCookie);

    if (!code) {
      throw new CliError("OAuth code is missing", "E_INPUT");
    }
    if (!state || state !== expectedState) {
      throw new CliError("OAuth state mismatch", "E_INPUT");
    }

    const token = await exchangeCode(env, code);
    if (!token.access_token) {
      throw new Error("Google token response did not include access_token");
    }

    const session = await encryptSession(env, {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: Date.now() + (token.expires_in ?? 3600) * 1000,
    });

    const redirectUrl = new URL("/keywords?gsc=connected", url.origin);
    const response = Response.redirect(redirectUrl.toString(), 302);
    response.headers.append(
      "Set-Cookie",
      createCookie(sessionCookie, session, request, 2592000),
    );
    response.headers.append("Set-Cookie", clearCookie(stateCookie));
    return response;
  } catch (error) {
    return jsonError(error, "Google OAuth callback failed");
  }
};
