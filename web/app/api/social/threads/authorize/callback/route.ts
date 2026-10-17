import { cookies } from "next/headers";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import {
  authenticatedSession,
  errorResponse,
  HttpError,
  serverSecret,
} from "@/lib/server-auth";
import {
  exchangeThreadsCode,
  oauthCookie,
  oauthCookieOptions,
  threadsConfig,
  verifyOAuthState,
} from "@/lib/threads";

export const maxDuration = 60;
export const GET = async (request: Request) => {
  let destination: URL | undefined;
  try {
    const config = threadsConfig();
    const store = await cookies();
    const stateCookie = store.get(oauthCookie)?.value ?? "";
    store.set(oauthCookie, "", { ...oauthCookieOptions, maxAge: 0 });
    const { session } = await authenticatedSession();
    const params = new URL(request.url).searchParams;
    const { teamId } = verifyOAuthState(
      stateCookie,
      params.get("state") ?? "",
      session,
    );
    await authenticatedSession(teamId);
    destination = new URL(
      `/manage/${encodeURIComponent(teamId)}/settings`,
      config.redirectUri,
    );
    if (params.has("error")) {
      destination.searchParams.set("threads", "cancelled");
      return Response.redirect(destination, 303);
    }
    const code = params.get("code");
    if (!code)
      throw new HttpError(400, "Threads did not return an authorization code.");
    const connection = await exchangeThreadsCode(code);
    await fetchMutation(api.func_feat_manage.saveThreadsConnection, {
      teamId,
      session,
      secret: serverSecret(),
      ...connection,
    });
    destination.searchParams.set("threads", "connected");
    return Response.redirect(destination, 303);
  } catch (error) {
    if (destination) {
      destination.searchParams.set("threads", "error");
      return Response.redirect(destination, 303);
    }
    return errorResponse(error);
  }
};
