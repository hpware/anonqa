import { cookies } from "next/headers";
import {
  authenticatedSession,
  errorResponse,
  HttpError,
} from "@/lib/server-auth";
import {
  createOAuthState,
  oauthCookie,
  oauthCookieOptions,
  threadsConfig,
} from "@/lib/threads";
import isValidUUID from "@/lib/checkValidUUID";

export const GET = async (request: Request) => {
  try {
    const teamId = new URL(request.url).searchParams.get("teamId");
    if (!teamId || !isValidUUID(teamId))
      throw new HttpError(400, "Select a valid team.");
    const { session } = await authenticatedSession(teamId);
    const config = threadsConfig();
    const state = createOAuthState(teamId, session);
    (await cookies()).set(oauthCookie, state.cookie, oauthCookieOptions);
    const url = new URL("https://threads.com/oauth/authorize");
    url.search = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: "threads_basic,threads_content_publish",
      response_type: "code",
      state: state.nonce,
    }).toString();
    return Response.redirect(url, 303);
  } catch (error) {
    return errorResponse(error);
  }
};
