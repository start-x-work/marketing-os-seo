import { createState, stateCookie } from "../../_oauth";
import { createCookie, jsonError, readJson } from "../../_shared";

interface StartBody {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
}

export const onRequestPost: PagesFunction = async ({ request }) => {
  try {
    const body = await readJson<StartBody>(request);
    const clientId = body.clientId?.trim();
    const redirectUri =
      body.redirectUri?.trim() ??
      new URL("/gsc-callback", request.url).toString();
    if (!clientId) {
      throw new Error("clientId is required");
    }

    const state = createState();
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      access_type: "offline",
      prompt: "consent",
      state,
    });

    const response = Response.json({
      authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
      state,
    });
    response.headers.append(
      "Set-Cookie",
      createCookie(stateCookie, state, request, 600),
    );
    return response;
  } catch (error) {
    return jsonError(error, "Google OAuth start failed");
  }
};
