import { createState, stateCookie } from "../../_oauth";
import { createCookie, type Env, jsonError } from "../../_shared";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    if (!env.GSC_CLIENT_ID || !env.GSC_REDIRECT_URI) {
      throw new Error(
        "GSC OAuth is not configured. Set GSC_CLIENT_ID and GSC_REDIRECT_URI (optional; keyword map works without GSC).",
      );
    }
    const state = createState();
    const params = new URLSearchParams({
      client_id: env.GSC_CLIENT_ID,
      redirect_uri: env.GSC_REDIRECT_URI,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      access_type: "offline",
      prompt: "consent",
      state,
    });
    const response = Response.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
      302,
    );
    response.headers.append(
      "Set-Cookie",
      createCookie(stateCookie, state, request, 600),
    );
    return response;
  } catch (error) {
    return jsonError(error, "Google OAuth start failed");
  }
};
