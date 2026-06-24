import { exchangeCodeWithConfig } from "../../_oauth";
import { jsonError, readJson } from "../../_shared";

interface ExchangeBody {
  code?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
}

export const onRequestPost: PagesFunction = async ({ request }) => {
  try {
    const body = await readJson<ExchangeBody>(request);
    const code = body.code?.trim();
    const clientId = body.clientId?.trim();
    const clientSecret = body.clientSecret?.trim();
    const redirectUri = body.redirectUri?.trim();
    if (!code || !clientId || !clientSecret || !redirectUri) {
      throw new Error(
        "code, clientId, clientSecret, and redirectUri are required",
      );
    }

    const token = await exchangeCodeWithConfig({
      code,
      clientId,
      clientSecret,
      redirectUri,
    });
    if (!token.access_token) {
      throw new Error("Google token response did not include access_token");
    }

    return Response.json({
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: Date.now() + (token.expires_in ?? 3600) * 1000,
    });
  } catch (error) {
    return jsonError(error, "Google OAuth exchange failed");
  }
};
