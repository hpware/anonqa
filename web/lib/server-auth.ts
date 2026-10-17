import { cookies } from "next/headers";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

// Cookie-authenticated writes must originate from this application.
export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (
    (origin && origin !== new URL(request.url).origin) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  ) {
    throw new HttpError(403, "Request origin is not allowed.");
  }
}

export function serverSecret() {
  const secret = process.env.CONVEX_SERVER_SECRET;
  if (!secret)
    throw new HttpError(503, "Server authentication is not configured.");
  return secret;
}

export async function authenticatedSession(teamId?: string) {
  const session = (await cookies()).get("session")?.value;
  if (!session) throw new HttpError(401, "Please log in.");
  const user = await fetchQuery(api.func_users.verifySession, {
    currentSession: session,
  });
  if (!user.linked || !user.userid)
    throw new HttpError(401, "Your session has expired. Please log in again.");
  if (teamId !== undefined) {
    const allowed = await fetchQuery(
      api.func_feat_manage.checkAbleToBeAccessed,
      { teamId, userId: user.userid, session },
    );
    if (!allowed)
      throw new HttpError(403, "You do not have access to this team.");
  }
  return { session, userId: user.userid };
}

export function errorResponse(error: unknown) {
  if (error instanceof HttpError)
    return Response.json(
      { success: false, message: error.message },
      { status: error.status },
    );
  // Do not log upstream OAuth errors: they may include access tokens or secrets.
  return Response.json(
    {
      success: false,
      message: "The request could not be completed. Please try again.",
    },
    { status: 503 },
  );
}
